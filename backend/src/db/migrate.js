const pool = require('./index');

const migrate = async () => {
  try {
    // ── Users ───────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        name          VARCHAR(100)  NOT NULL,
        email         VARCHAR(150)  UNIQUE NOT NULL,
        password_hash VARCHAR(255)  NOT NULL,
        headline      VARCHAR(220),
        bio           TEXT,
        location      VARCHAR(100),
        website       VARCHAR(200),
        avatar_url    VARCHAR(500),
        created_at    TIMESTAMP DEFAULT NOW()
      );
    `);

    // ── Skills (many-to-one with users) ─────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_skills (
        id         SERIAL PRIMARY KEY,
        user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        skill      VARCHAR(80) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, skill)
      );
    `);

    // ── Posts (feed) ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id         SERIAL PRIMARY KEY,
        author_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content    TEXT NOT NULL,
        image_url  VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ── Likes ────────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id         SERIAL PRIMARY KEY,
        post_id    INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      );
    `);

    // ── Comments ─────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id         SERIAL PRIMARY KEY,
        post_id    INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        author_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content    TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ── Connections ──────────────────────────────────────────────────────────
    // status: 'pending' | 'accepted' | 'rejected'
    await pool.query(`
      CREATE TABLE IF NOT EXISTS connections (
        id          SERIAL PRIMARY KEY,
        sender_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW(),
        UNIQUE(sender_id, receiver_id)
      );
    `);

    // ── Notifications ────────────────────────────────────────────────────────
    // type: 'connection_request' | 'connection_accepted' | 'post_like' | 'post_comment'
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id          SERIAL PRIMARY KEY,
        user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        actor_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type        VARCHAR(50) NOT NULL,
        entity_id   INT,          -- post_id or connection_id depending on type
        is_read     BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMP DEFAULT NOW()
      );
    `);

    // ── Indexes for common queries ───────────────────────────────────────────
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_author    ON posts(author_id);
      CREATE INDEX IF NOT EXISTS idx_likes_post      ON post_likes(post_id);
      CREATE INDEX IF NOT EXISTS idx_comments_post   ON post_comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_connections_s   ON connections(sender_id);
      CREATE INDEX IF NOT EXISTS idx_connections_r   ON connections(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_notifs_user     ON notifications(user_id);
    `);

    console.log('✅ All tables created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
};

migrate();