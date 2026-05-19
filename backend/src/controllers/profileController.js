const pool = require('../db/index');
const path = require('path');
const fs   = require('fs');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, GIF or WebP images are allowed'));
  },
});

// GET /api/profile/:id
const getProfile = async (req, res) => {
  const { id } = req.params;
  const viewerId = req.user?.id; // from auth middleware (optional on public routes)

  try {
    // Core user
    const userResult = await pool.query(
      `SELECT id, name, email, headline, bio, location, website, avatar_url, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userResult.rows[0];

    // Skills
    const skillsResult = await pool.query(
      `SELECT skill FROM user_skills WHERE user_id = $1 ORDER BY created_at`,
      [id]
    );
    user.skills = skillsResult.rows.map(r => r.skill);

    // Connection count
    const connCountResult = await pool.query(
      `SELECT COUNT(*) FROM connections
       WHERE status = 'accepted'
         AND (sender_id = $1 OR receiver_id = $1)`,
      [id]
    );
    user.connection_count = parseInt(connCountResult.rows[0].count, 10);

    // Post count
    const postCountResult = await pool.query(
      `SELECT COUNT(*) FROM posts WHERE author_id = $1`, [id]
    );
    user.post_count = parseInt(postCountResult.rows[0].count, 10);

    // Relationship to the viewer
    if (viewerId && viewerId !== parseInt(id, 10)) {
      const connResult = await pool.query(
        `SELECT id, status, sender_id FROM connections
         WHERE (sender_id = $1 AND receiver_id = $2)
            OR (sender_id = $2 AND receiver_id = $1)`,
        [viewerId, id]
      );
      if (connResult.rows.length > 0) {
        const conn = connResult.rows[0];
        user.connection_status = conn.status;               // 'pending' | 'accepted' | 'rejected'
        user.connection_initiated_by_me = conn.sender_id === viewerId;
      } else {
        user.connection_status = null;
      }
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/profile  (protected – updates own profile)
const updateProfile = async (req, res) => {
  const { name, headline, bio, location, website } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE users
       SET name      = COALESCE($1, name),
           headline  = COALESCE($2, headline),
           bio       = COALESCE($3, bio),
           location  = COALESCE($4, location),
           website   = COALESCE($5, website)
       WHERE id = $6
       RETURNING id, name, email, headline, bio, location, website, avatar_url`,
      [name, headline, bio, location, website, userId]
    );

    res.json({ message: 'Profile updated', user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/profile/avatar  (protected – update avatar URL)
// In production you'd handle file upload (e.g. multer + S3).
// For now accept a URL string so the frontend can pass a hosted URL.
const updateAvatar = async (req, res) => {
  const { avatar_url } = req.body;
  const userId = req.user.id;

  if (!avatar_url) return res.status(400).json({ message: 'avatar_url is required' });

  try {
    const result = await pool.query(
      `UPDATE users SET avatar_url = $1 WHERE id = $2
       RETURNING id, name, email, avatar_url`,
      [avatar_url, userId]
    );
    res.json({ message: 'Avatar updated', user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/profile/skills  (protected – add a skill)
const addSkill = async (req, res) => {
  const { skill } = req.body;
  const userId = req.user.id;

  if (!skill?.trim()) return res.status(400).json({ message: 'skill is required' });

  try {
    await pool.query(
      `INSERT INTO user_skills (user_id, skill) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, skill.trim()]
    );

    const result = await pool.query(
      `SELECT skill FROM user_skills WHERE user_id = $1 ORDER BY created_at`,
      [userId]
    );
    res.status(201).json({ skills: result.rows.map(r => r.skill) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/profile/skills/:skill  (protected – remove a skill)
const removeSkill = async (req, res) => {
  const { skill } = req.params;
  const userId = req.user.id;

  try {
    await pool.query(
      `DELETE FROM user_skills WHERE user_id = $1 AND skill = $2`,
      [userId, decodeURIComponent(skill)]
    );

    const result = await pool.query(
      `SELECT skill FROM user_skills WHERE user_id = $1 ORDER BY created_at`,
      [userId]
    );
    res.json({ skills: result.rows.map(r => r.skill) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/profile/avatar/upload  (protected – file upload)
const uploadAvatar = [
  (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || 'Upload failed' });
      next();
    });
  },
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const userId = req.user.id;
    try {
      // delete old local upload if present
      const old = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [userId]);
      const oldUrl = old.rows[0]?.avatar_url;
      if (oldUrl && oldUrl.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '../../', oldUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const result = await pool.query(
        `UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, avatar_url`,
        [avatarUrl, userId]
      );
      res.json({ message: 'Avatar updated', user: result.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  },
];

module.exports = { getProfile, updateProfile, updateAvatar, uploadAvatar, addSkill, removeSkill };
