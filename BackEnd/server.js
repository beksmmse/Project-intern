const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const { generateToken } = require('../Backend/app/config/jwt.js');
const { authenticateToken, authorizeRole } = require('../Backend/app/middlewares/auth.js');


app.use(express.json());
app.use(cors());

const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '12345',
  port: 5432,
});

pool.connect()
  .then(client => {
    console.log('Connected to database');
    client.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// GET /api/point
app.get('/api/point', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, address, geometry_type, created_at,
        ST_AsGeoJSON(geometry)::json AS geometry
      FROM layers
      WHERE geometry_type = 'Point'
    `);

    const features = result.rows.map(row => ({
      type: "Feature",
      geometry: row.geometry,
      properties: {
        id: row.id,
        name: row.name,
        description: row.description,
        address: row.address,
        created_at: row.created_at
      }
    }));

    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
});

// GET /api/linestring
app.get('/api/linestring', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, address, geometry_type, created_at,
        ST_AsGeoJSON(geometry)::json AS geometry
      FROM layers
      WHERE geometry_type ILIKE 'linestring'
    `);

    const features = result.rows.map(row => ({
      type: "Feature",
      geometry: row.geometry,
      properties: {
        id: row.id,
        name: row.name,
        description: row.description,
        address: row.address,
        created_at: row.created_at
      }
    }));

    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
});

// GET /api/polygon
app.get('/api/polygon', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, address, geometry_type, created_at,
        ST_AsGeoJSON(geometry)::json AS geometry
      FROM layers
      WHERE geometry_type = 'Polygon'
    `);

    const features = result.rows.map(row => ({
      type: "Feature",
      geometry: row.geometry,
      properties: {
        id: row.id,
        name: row.name,
        description: row.description,
        address: row.address,
        created_at: row.created_at
      }
    }));
    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
});

// POST /api/register
// app.post('/api/register', async (req, res) => {
//   try {
//     const { username, email, password, role = 'user', organize_id = 1 } = req.body;
    
//     const password_hash = await bcrypt.hash(password, 10);
  
//     const query = `
//       INSERT INTO users (username, email, password_hash, role, organize_id) 
//       VALUES ($1, $2, $3, $4, $5) 
//       RETURNING id
//     `;
//     const values = [username, email, password_hash, role, organize_id];
    
//     const result = await pool.query(query, values);
    
//     res.json({
//       message: 'User registered successfully',
//       userId: result.rows[0].id,
//       user: {
//         id: result.rows[0].id,
//         username,
//         email,
//         role,
//         organize_id
//       }
//     });
    
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({
//       message: 'Registration failed',
//       error: error.message
//     });
//   }
// });

// POST /api/login
// app.post('/api/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;
    
//     const query = `
//       SELECT id, username, email, password_hash, role, organize_id 
//       FROM users 
//       WHERE username = $1
//     `;
//     const values = [username];
    
//     const result = await pool.query(query, values);
    
//     if (result.rows.length === 0) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid username or password'
//       });
//     }
    
//     const user = result.rows[0];
    
//     const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
//     if (!isValidPassword) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid username or password'
//       });
//     }
    
//     res.json({
//       success: true,
//       message: 'Login successful',
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         organize_id: user.organize_id
//       }
//     });
    
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Login failed',
//       error: error.message
//     });
//   }
// });

// POST /api/register (แก้ไขเพื่อส่ง token กลับด้วย)
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user', organize_id = 1 } = req.body;
    
    const password_hash = await bcrypt.hash(password, 10);
  
    const query = `
      INSERT INTO users (username, email, password_hash, role, organize_id) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id
    `;
    const values = [username, email, password_hash, role, organize_id];
    
    const result = await pool.query(query, values);
    
    // สร้าง JWT token
    const tokenPayload = {
      id: result.rows[0].id,
      username,
      email,
      role,
      organize_id
    };
    const token = generateToken(tokenPayload);
    
    res.json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: result.rows[0].id,
        username,
        email,
        role,
        organize_id
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// POST /api/login 
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    const query = `
      SELECT id, username, email, password_hash, role, organize_id 
      FROM users 
      WHERE username = $1
    `;
    const values = [username];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    const user = result.rows[0];
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    

    const tokenPayload = {
      id: user.id,
      role: user.role,
      organize_id: user.organize_id
    };
    
    const token = generateToken(tokenPayload);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        organize_id: user.organize_id
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/profile - ดู profile ของตัวเอง (ต้อง login)
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// GET /api/admin/users -
app.get('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const query = `
      SELECT id, username, email, role, organize_id, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      users: result.rows
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});