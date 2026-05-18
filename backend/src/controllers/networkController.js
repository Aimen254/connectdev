const pool = require('../db/index');

// ── GET /api/network/connections  – list accepted connections ──────────────
const getConnections = async (req, res) => {
  const userId = req.user.id;
  const limit  = Math.min(parseInt(req.query.limit  || 20, 10), 100);
  const offset = parseInt(req.query.offset || 0, 10);

  try {
    const result = await pool.query(
      `SELECT
         c.id AS connection_id,
         c.created_at AS connected_at,
         u.id, u.name, u.headline, u.avatar_url, u.location
       FROM connections c
       JOIN users u ON u.id = CASE
         WHEN c.sender_id   = $1 THEN c.receiver_id
         WHEN c.receiver_id = $1 THEN c.sender_id
       END
       WHERE (c.sender_id = $1 OR c.receiver_id = $1)
         AND c.status = 'accepted'
       ORDER BY c.updated_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ connections: result.rows, offset, limit });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/network/requests  – incoming pending requests ────────────────
const getPendingRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT c.id AS connection_id, c.created_at,
              u.id, u.name, u.headline, u.avatar_url, u.location
       FROM connections c
       JOIN users u ON u.id = c.sender_id
       WHERE c.receiver_id = $1 AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [userId]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/network/sent  – sent requests still pending ──────────────────
const getSentRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT c.id AS connection_id, c.created_at,
              u.id, u.name, u.headline, u.avatar_url
       FROM connections c
       JOIN users u ON u.id = c.receiver_id
       WHERE c.sender_id = $1 AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [userId]
    );
    res.json({ sent: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── POST /api/network/request/:id  – send connection request ──────────────
const sendRequest = async (req, res) => {
  const senderId   = req.user.id;
  const receiverId = parseInt(req.params.id, 10);

  if (senderId === receiverId)
    return res.status(400).json({ message: 'Cannot connect with yourself' });

  try {
    // Check receiver exists
    const userCheck = await pool.query(`SELECT id FROM users WHERE id = $1`, [receiverId]);
    if (userCheck.rows.length === 0)
      return res.status(404).json({ message: 'User not found' });

    // Check for existing connection in either direction
    const existing = await pool.query(
      `SELECT id, status FROM connections
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)`,
      [senderId, receiverId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: 'Connection already exists',
        status: existing.rows[0].status,
      });
    }

    await pool.query(
      `INSERT INTO connections (sender_id, receiver_id) VALUES ($1, $2)`,
      [senderId, receiverId]
    );

    // Notify receiver
    await pool.query(
      `INSERT INTO notifications (user_id, actor_id, type)
       VALUES ($1, $2, 'connection_request')`,
      [receiverId, senderId]
    );

    res.status(201).json({ message: 'Connection request sent' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PUT /api/network/request/:connectionId/accept  ────────────────────────
const acceptRequest = async (req, res) => {
  const { connectionId } = req.params;
  const userId = req.user.id;

  try {
    const check = await pool.query(
      `SELECT * FROM connections WHERE id = $1 AND receiver_id = $2 AND status = 'pending'`,
      [connectionId, userId]
    );
    if (check.rows.length === 0)
      return res.status(404).json({ message: 'Pending request not found' });

    await pool.query(
      `UPDATE connections SET status = 'accepted', updated_at = NOW() WHERE id = $1`,
      [connectionId]
    );

    // Notify the original sender
    await pool.query(
      `INSERT INTO notifications (user_id, actor_id, type)
       VALUES ($1, $2, 'connection_accepted')`,
      [check.rows[0].sender_id, userId]
    );

    res.json({ message: 'Connection accepted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PUT /api/network/request/:connectionId/reject  ────────────────────────
const rejectRequest = async (req, res) => {
  const { connectionId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE connections SET status = 'rejected', updated_at = NOW()
       WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
       RETURNING id`,
      [connectionId, userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Pending request not found' });

    res.json({ message: 'Connection rejected' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── DELETE /api/network/connections/:id  – remove a connection ────────────
const removeConnection = async (req, res) => {
  const { id: otherUserId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `DELETE FROM connections
       WHERE status = 'accepted'
         AND ((sender_id = $1 AND receiver_id = $2)
           OR (sender_id = $2 AND receiver_id = $1))
       RETURNING id`,
      [userId, otherUserId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Connection not found' });

    res.json({ message: 'Connection removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── DELETE /api/network/request/:id/cancel  – cancel a sent request ───────
const cancelRequest = async (req, res) => {
  const { id: receiverId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `DELETE FROM connections
       WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
       RETURNING id`,
      [userId, receiverId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Pending request not found' });

    res.json({ message: 'Request cancelled' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/network/suggestions  – people you may know ──────────────────
// Returns users who are NOT already connected/pending, sorted by mutual connections.
const getSuggestions = async (req, res) => {
  const userId = req.user.id;
  const limit  = Math.min(parseInt(req.query.limit || 10, 10), 50);

  try {
    const result = await pool.query(
      `WITH my_connections AS (
         SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS peer_id
         FROM connections
         WHERE (sender_id = $1 OR receiver_id = $1)
           AND status = 'accepted'
       ),
       interacted AS (
         SELECT receiver_id AS other_id FROM connections WHERE sender_id = $1
         UNION
         SELECT sender_id   AS other_id FROM connections WHERE receiver_id = $1
       )
       SELECT
         u.id, u.name, u.headline, u.avatar_url, u.location,
         COUNT(mc2.peer_id) AS mutual_count
       FROM users u
       LEFT JOIN my_connections mc2
         ON mc2.peer_id IN (
           SELECT CASE WHEN c2.sender_id = u.id THEN c2.receiver_id ELSE c2.sender_id END
           FROM connections c2
           WHERE (c2.sender_id = u.id OR c2.receiver_id = u.id) AND c2.status = 'accepted'
         )
       WHERE u.id <> $1
         AND u.id NOT IN (SELECT other_id FROM interacted)
       GROUP BY u.id, u.name, u.headline, u.avatar_url, u.location
       ORDER BY mutual_count DESC, u.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json({ suggestions: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getConnections, getPendingRequests, getSentRequests,
  sendRequest, acceptRequest, rejectRequest,
  removeConnection, cancelRequest, getSuggestions,
};
