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

// POST /api/geometries
app.post('/api/geometries', async (req, res) => {
  try {
    const {
      organization_id,
      name,
      description,
      geometry_type,
      srid = 4326,
      properties_schema,
      created_by_user_id,
      address,
      geometry
    } = req.body;

    const query = `
      INSERT INTO layers (
        organization_id, name, description, geometry_type, 
        srid, properties_schema, created_by_user_id, address, geometry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_GeomFromGeoJSON($9))
      RETURNING id, created_at
    `;

    const values = [
      organization_id,
      name,
      description,
      geometry_type,
      srid,
      JSON.stringify(properties_schema),
      created_by_user_id,
      address,
      JSON.stringify(geometry)
    ];

    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      id: result.rows[0].id,
      created_at: result.rows[0].created_at
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' 
    });
  }
});

// GET /api/geometries
app.get('/api/geometries', async (req, res) => {
  try {
    const query = `
      SELECT 
        id, organization_id, name, description, geometry_type,
        srid, properties_schema, created_by_user_id, created_at,
        updated_at, address, ST_AsGeoJSON(geometry) as geometry
      FROM layers
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);
    
    const features = result.rows.map(row => ({
      ...row,
      geometry: JSON.parse(row.geometry)
    }));

    res.json(features);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' 
    });
  }
});

// GET /api/geometries/:id - ดึงข้อมูลตาม ID
app.get('/api/geometries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id, organization_id, name, description, geometry_type,
        srid, properties_schema, created_by_user_id, created_at,
        updated_at, address, ST_AsGeoJSON(geometry) as geometry
      FROM layers
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูล'
      });
    }

    const feature = {
      ...result.rows[0],
      geometry: JSON.parse(result.rows[0].geometry),
      properties_schema: typeof result.rows[0].properties_schema === 'string' 
        ? JSON.parse(result.rows[0].properties_schema) 
        : result.rows[0].properties_schema
    };

    res.json(feature);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message 
    });
  }
});

app.delete('/api/geometries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const checkQuery = 'SELECT id, name FROM layers WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลที่ต้องการลบ'
      });
    }

    const dataToDelete = checkResult.rows[0];

    const deleteQuery = 'DELETE FROM layers WHERE id = $1 RETURNING id';
    const deleteResult = await pool.query(deleteQuery, [id]);

    console.log('ลบข้อมูลสำเร็จ:', dataToDelete);

    res.json({
      success: true,
      message: 'ลบข้อมูลสำเร็จ',
      deleteId: parseInt(id),
      deleteName: dataToDelete.name
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบข้อมูล',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'API is running'
  });
});

app.put('/api/geometries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      'name',
      'description',
      'geometry_type',
      'srid',
      'properties_schema',
      'address',
      'geometry',
      'updated_at'
    ];

    const fields = [];
    const values = [];
    let idx = 1;

    //  track การแก้ไขล่าสุด
    req.body.updated_at = new Date().toISOString();

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(req.body[key]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีข้อมูลที่จะแก้ไข'
      });
    }

    // ตรวจสอบว่ามี row นี้ไหม
    const checkQuery = 'SELECT id FROM layers WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลที่ต้องการแก้ไข'
      });
    }

    const updateQuery = `
      UPDATE layers
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    values.push(id);

    const updateResult = await pool.query(updateQuery, values);

    res.json({
      success: true,
      message: 'แก้ไขข้อมูลสำเร็จ',
      updated: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล',
      error: error.message
    });
  }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});