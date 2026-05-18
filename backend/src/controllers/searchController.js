const pool = require('../db/index');

// ── GET /api/search/users?q=&limit=&offset=  ─────────────────────────────
// Full-text search on name, headline, bio, location, and skills.
const searchUsers = async (req, res) => {
  const { q = '' } = req.query;
  const limit  = Math.min(parseInt(req.query.limit  || 20, 10), 50);
  const offset = parseInt(req.query.offset || 0, 10);
  const viewerId = req.user?.id;

  const term = q.trim();
  if (!term) return res.status(400).json({ message: 'Query param q is required' });

  try {
    const result = await pool.query(
      `SELECT DISTINCT
         u.id, u.name, u.headline, u.avatar_url, u.location,
         (SELECT COUNT(*) FROM connections
          WHERE status = 'accepted'
            AND (sender_id = u.id OR receiver_id = u.id)
         ) AS connection_count
       FROM users u
       LEFT JOIN user_skills s ON s.user_id = u.id
       WHERE
         u.name     ILIKE $1 OR
         u.headline ILIKE $1 OR
         u.bio      ILIKE $1 OR
         u.location ILIKE $1 OR
         s.skill    ILIKE $1
       ORDER BY u.name
       LIMIT $2 OFFSET $3`,
      [`%${term}%`, limit, offset]
    );

    // Attach connection status for viewer
    let users = result.rows;
    if (viewerId) {
      const ids = users.map(u => u.id);
      if (ids.length > 0) {
        const connRows = await pool.query(
          `SELECT sender_id, receiver_id, status
           FROM connections
           WHERE (sender_id = $1 AND receiver_id = ANY($2))
              OR (receiver_id = $1 AND sender_id = ANY($2))`,
          [viewerId, ids]
        );

        const connMap = {};
        connRows.rows.forEach(c => {
          const otherId = c.sender_id === viewerId ? c.receiver_id : c.sender_id;
          connMap[otherId] = {
            status: c.status,
            initiated_by_me: c.sender_id === viewerId,
          };
        });

        users = users.map(u => ({
          ...u,
          connection_status: connMap[u.id]?.status || null,
          connection_initiated_by_me: connMap[u.id]?.initiated_by_me ?? null,
        }));
      }
    }

    res.json({ users, offset, limit, query: term });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/search/posts?q=&limit=&offset=  ─────────────────────────────
const searchPosts = async (req, res) => {
  const { q = '' } = req.query;
  const limit  = Math.min(parseInt(req.query.limit  || 20, 10), 50);
  const offset = parseInt(req.query.offset || 0, 10);

  const term = q.trim();
  if (!term) return res.status(400).json({ message: 'Query param q is required' });

  try {
    const result = await pool.query(
      `SELECT
         p.id, p.content, p.image_url, p.created_at,
         u.id AS author_id, u.name AS author_name,
         u.headline AS author_headline, u.avatar_url AS author_avatar,
         (SELECT COUNT(*) FROM post_likes    WHERE post_id = p.id) AS like_count,
         (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.content ILIKE $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${term}%`, limit, offset]
    );

    res.json({ posts: result.rows, offset, limit, query: term });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/search?q=  – combined search (users + posts) ─────────────────
const searchAll = async (req, res) => {
  const { q = '' } = req.query;
  const viewerId = req.user?.id;

  const term = q.trim();
  if (!term) return res.status(400).json({ message: 'Query param q is required' });

  try {
    // Run both queries in parallel
    const [userRows, postRows] = await Promise.all([
      pool.query(
        `SELECT DISTINCT u.id, u.name, u.headline, u.avatar_url, u.location
         FROM users u
         LEFT JOIN user_skills s ON s.user_id = u.id
         WHERE u.name ILIKE $1 OR u.headline ILIKE $1 OR s.skill ILIKE $1
         LIMIT 5`,
        [`%${term}%`]
      ),
      pool.query(
        `SELECT p.id, p.content, p.created_at,
                u.id AS author_id, u.name AS author_name, u.avatar_url AS author_avatar
         FROM posts p
         JOIN users u ON u.id = p.author_id
         WHERE p.content ILIKE $1
         ORDER BY p.created_at DESC
         LIMIT 5`,
        [`%${term}%`]
      ),
    ]);

    res.json({
      query: term,
      users: userRows.rows,
      posts: postRows.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { searchUsers, searchPosts, searchAll };
