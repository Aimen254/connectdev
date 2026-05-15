const pool = require('./index');

const migrate = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        headline VARCHAR(220),
        bio TEXT,
        location VARCHAR(100),
        website VARCHAR(200),
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tables created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
};

migrate();