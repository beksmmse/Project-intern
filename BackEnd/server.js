const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const app = express();
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

app.listen(3000, () => console.log('API server on http://localhost:3000'));

//login hash เเก้ไขเพิ่มเติมหน้า register 
// app.post('/login', async (req, res) => {


//   // ดึงค่า username และ password จาก body ของ request
//   const { username, password } = req.body;

//   // log เพื่อ debug (ดูค่าที่รับเข้ามา)
//   console.log('username:', username);

//   try {
//     // 1. Query หา user ตาม username
//     const result = await pool.query(
//       'SELECT * FROM users WHERE username = $1 LIMIT 1',
//       [username]
//     );

//     // log query 
//     console.log('query result:', result.rows);

//     if (result.rows.length === 0) {
//       // ไม่เจอ username
//       return res.status(401).json({ success: false, message: 'Username or password invalid.' });
//     }

//     const user = result.rows[0];

//     // 2. ตรวจสอบ password กับ hash ใน database
//     const match = await bcrypt.compare(password, user.password_hash);

//     if (!match) {
//       // password ไม่ตรง
//       return res.status(401).json({ success: false, message: 'Username or password invalid.' });
//     }

//     // 3. ล็อกอินสำเร็จ (ห้ามส่ง password_hash ออกไป)
//     res.json({
//       success: true,
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         organize_id: user.organize_id,
//       }
//     });

//   } catch (err) {
//     // ถ้าเกิด error ระหว่างการทำงาน
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password_hash = $2',
      [username, password]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Login Success', user: result.rows[0] });
    } else {
      res.json({ success: false, message: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});



