const pool = require('../db/index');

// ── Helper: attach like/comment counts + viewer's like status ─────────────
async function enrichPosts(posts, viewerId) {
  if (posts.length === 0) return posts;

  const postIds = posts.map(p => p.id);

  // Like counts
  const likeRows = await pool.query(
    `SELECT post_id, COUNT(*) AS count
     FROM post_likes WHERE post_id = ANY($1)
     GROUP BY post_id`,
    [postIds]
  );
  const likeCounts = Object.fromEntries(likeRows.rows.map(r => [r.post_id, parseInt(r.count, 10)]));

  // Comment counts
  const commentRows = await pool.query(
    `SELECT post_id, COUNT(*) AS count
     FROM post_comments WHERE post_id = ANY($1)
     GROUP BY post_id`,
    [postIds]
  );
  const commentCounts = Object.fromEntries(commentRows.rows.map(r => [r.post_id, parseInt(r.count, 10)]));

  // Viewer's liked posts
  let viewerLikedSet = new Set();
  if (viewerId) {
    const likedRows = await pool.query(
      `SELECT post_id FROM post_likes WHERE user_id = $1 AND post_id = ANY($2)`,
      [viewerId, postIds]
    );
    viewerLikedSet = new Set(likedRows.rows.map(r => r.post_id));
  }

  return posts.map(p => ({
    ...p,
    like_count:    likeCounts[p.id]    || 0,
    comment_count: commentCounts[p.id] || 0,
    liked_by_me:   viewerLikedSet.has(p.id),
  }));
}

// ── POST /api/feed  – create a post ───────────────────────────────────────
const createPost = async (req, res) => {
  const { content, image_url } = req.body;
  const authorId = req.user.id;

  if (!content?.trim()) return res.status(400).json({ message: 'content is required' });

  try {
    const result = await pool.query(
      `INSERT INTO posts (author_id, content, image_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [authorId, content.trim(), image_url || null]
    );

    // Fetch with author info
    const post = await pool.query(
      `SELECT p.*, u.name AS author_name, u.headline AS author_headline,
              u.avatar_url AS author_avatar
       FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({ message: 'Post created', post: post.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/feed  – paginated feed (own posts + connections' posts) ───────
const getFeed = async (req, res) => {
  const viewerId = req.user.id;
  const limit  = Math.min(parseInt(req.query.limit  || 20, 10), 50);
  const offset = parseInt(req.query.offset || 0, 10);

  try {
    const result = await pool.query(
      `SELECT p.*, u.name AS author_name, u.headline AS author_headline,
              u.avatar_url AS author_avatar
       FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.author_id = $1
          OR p.author_id IN (
               SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END
               FROM connections
               WHERE status = 'accepted'
                 AND (sender_id = $1 OR receiver_id = $1)
             )
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [viewerId, limit, offset]
    );

    const posts = await enrichPosts(result.rows, viewerId);
    res.json({ posts, offset, limit });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/feed/user/:id  – all posts by a specific user ────────────────
const getUserPosts = async (req, res) => {
  const { id } = req.params;
  const viewerId = req.user?.id;
  const limit  = Math.min(parseInt(req.query.limit  || 20, 10), 50);
  const offset = parseInt(req.query.offset || 0, 10);

  try {
    const result = await pool.query(
      `SELECT p.*, u.name AS author_name, u.headline AS author_headline,
              u.avatar_url AS author_avatar
       FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.author_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const posts = await enrichPosts(result.rows, viewerId);
    res.json({ posts, offset, limit });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/feed/:id  – single post ─────────────────────────────────────
const getPost = async (req, res) => {
  const { id } = req.params;
  const viewerId = req.user?.id;

  try {
    const result = await pool.query(
      `SELECT p.*, u.name AS author_name, u.headline AS author_headline,
              u.avatar_url AS author_avatar
       FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Post not found' });

    const [post] = await enrichPosts(result.rows, viewerId);
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PUT /api/feed/:id  – edit own post ───────────────────────────────────
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { content, image_url } = req.body;
  const userId = req.user.id;

  if (!content?.trim()) return res.status(400).json({ message: 'content is required' });

  try {
    const check = await pool.query(`SELECT author_id FROM posts WHERE id = $1`, [id]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    if (check.rows[0].author_id !== userId)
      return res.status(403).json({ message: 'Not your post' });

    const result = await pool.query(
      `UPDATE posts SET content = $1, image_url = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [content.trim(), image_url || null, id]
    );
    res.json({ message: 'Post updated', post: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── DELETE /api/feed/:id  – delete own post ───────────────────────────────
const deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const check = await pool.query(`SELECT author_id FROM posts WHERE id = $1`, [id]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    if (check.rows[0].author_id !== userId)
      return res.status(403).json({ message: 'Not your post' });

    await pool.query(`DELETE FROM posts WHERE id = $1`, [id]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── POST /api/feed/:id/like  – toggle like ────────────────────────────────
const toggleLike = async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user.id;

  try {
    // Check post exists
    const postCheck = await pool.query(`SELECT id, author_id FROM posts WHERE id = $1`, [postId]);
    if (postCheck.rows.length === 0) return res.status(404).json({ message: 'Post not found' });

    const existing = await pool.query(
      `SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    let liked;
    if (existing.rows.length > 0) {
      await pool.query(`DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
      liked = false;
    } else {
      await pool.query(`INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)`, [postId, userId]);
      liked = true;

      // Notify post author (not for self-likes)
      if (postCheck.rows[0].author_id !== userId) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, type, entity_id)
           VALUES ($1, $2, 'post_like', $3)`,
          [postCheck.rows[0].author_id, userId, postId]
        );
      }
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM post_likes WHERE post_id = $1`, [postId]
    );
    res.json({ liked, like_count: parseInt(countResult.rows[0].count, 10) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/feed/:id/comments  – list comments ───────────────────────────
const getComments = async (req, res) => {
  const { id: postId } = req.params;
  const limit  = Math.min(parseInt(req.query.limit  || 20, 10), 100);
  const offset = parseInt(req.query.offset || 0, 10);

  try {
    const result = await pool.query(
      `SELECT c.*, u.name AS author_name, u.avatar_url AS author_avatar
       FROM post_comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC
       LIMIT $2 OFFSET $3`,
      [postId, limit, offset]
    );
    res.json({ comments: result.rows, offset, limit });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── POST /api/feed/:id/comments  – add comment ────────────────────────────
const addComment = async (req, res) => {
  const { id: postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content?.trim()) return res.status(400).json({ message: 'content is required' });

  try {
    const postCheck = await pool.query(`SELECT id, author_id FROM posts WHERE id = $1`, [postId]);
    if (postCheck.rows.length === 0) return res.status(404).json({ message: 'Post not found' });

    const result = await pool.query(
      `INSERT INTO post_comments (post_id, author_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [postId, userId, content.trim()]
    );

    // Notify post author
    if (postCheck.rows[0].author_id !== userId) {
      await pool.query(
        `INSERT INTO notifications (user_id, actor_id, type, entity_id)
         VALUES ($1, $2, 'post_comment', $3)`,
        [postCheck.rows[0].author_id, userId, postId]
      );
    }

    // Return comment with author info
    const comment = await pool.query(
      `SELECT c.*, u.name AS author_name, u.avatar_url AS author_avatar
       FROM post_comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({ comment: comment.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── DELETE /api/feed/:postId/comments/:commentId  – delete own comment ────
const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const check = await pool.query(`SELECT author_id FROM post_comments WHERE id = $1`, [commentId]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
    if (check.rows[0].author_id !== userId)
      return res.status(403).json({ message: 'Not your comment' });

    await pool.query(`DELETE FROM post_comments WHERE id = $1`, [commentId]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPost, getFeed, getUserPosts, getPost,
  updatePost, deletePost, toggleLike,
  getComments, addComment, deleteComment,
};
