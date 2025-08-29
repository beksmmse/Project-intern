const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const { generateToken } = require('./app/config/jwt.js');
const { authenticateToken, authorizeRole } = require('./app/middlewares/auth.js');


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
        SELECT id, name, descri as description, address, feat_type as feature_type, 
          created_at, updated_at, srid, remark, etc,
          ST_AsGeoJSON(geom)::json AS geometry
    FROM point1
    WHERE geom IS NOT NULL
    `);

    //     SELECT id, name, descri as description, address, feat_type as feature_type, 
    //       created_at, updated_at, srid, remark, etc,
    //       ST_AsGeoJSON(geom)::json AS geometry
    // FROM pointjee
    // WHERE geom IS NOT NULL

      //     SELECT id, name, descri as description, address, feat_type as feature_type, 
      //        created_at, updated_at, srid, remark, etc,
      //   ST_AsGeoJSON(geometry)::json AS geometry
      // FROM point

    const features = result.rows.map(row => {
      const categoryType = row.feature_type || 'other';

      return {
        type: "Feature",
        feature_type: row.feature_type, 
        geometry: row.geometry,
        properties: {
          id: row.id,
          name: row.name,
          description: row.description,
          address: row.address,
          remark: row.remark,
          etc: row.etc,
          created_at: row.created_at,
          updated_at: row.updated_at,
          type: categoryType,
          coordinates: row.geometry?.coordinates,
          srid: row.srid
        }
      };
    });

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
      SELECT id, fid, org_id, name, descri as description, feat_type as feature_type, 
             created_at, updated_at, srid, remark, etc, address, creator_id,
        ST_AsGeoJSON(geom)::json AS geometry
      FROM line1
      WHERE geom IS NOT NULL
    `);

    const features = result.rows.map(row => ({
      type: "Feature",
      feature_type: row.feature_type,
      geometry: row.geometry,
      properties: {
        id: row.id,
        fid: row.fid,
        org_id: row.org_id,
        name: row.name,
        description: row.description,
        address: row.address,
        remark: row.remark,
        etc: row.etc,
        creator_id: row.creator_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        srid: row.srid
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
      SELECT id, fid, org_id, name, descri as description, faet_type as feature_type, 
             created_at, updated_at, srid, remark, etc, address, creator_id,
        ST_AsGeoJSON(geom)::json AS geometry
      FROM polygon
      WHERE geom IS NOT NULL
    `);

    const features = result.rows.map(row => ({
      type: "Feature",
      feature_type: row.feature_type,
      geometry: row.geometry,
      properties: {
        id: row.id,
        fid: row.fid,
        org_id: row.org_id,
        name: row.name,
        description: row.description,
        address: row.address,
        remark: row.remark,
        etc: row.etc,
        creator_id: row.creator_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        srid: row.srid
      }
    }));
    
    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
});

// POST /api/register
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

// GET /api/profile  
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// GET /api/admin/users 
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
      feature_type,
      srid = 4326,
      properties_schema,
      created_by_user_id,
      address,
      remark,
      etc,
      geometry
    } = req.body;

    let query, values, tableName;

    switch (geometry_type.toLowerCase()) {
      case 'point':
        tableName = 'point';
        query = `
          INSERT INTO point (
            org_id, name, descri, address, srid, remark, etc, 
            feat_type, creator_id, geometry
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ST_GeomFromGeoJSON($10))
          RETURNING id, created_at
        `;
        values = [
          organization_id,
          name,
          description,
          address,
          srid,
          remark,
          etc,
          feature_type || 'Point',
          created_by_user_id,
          JSON.stringify(geometry)
        ];
        break;

      case 'linestring':
        tableName = 'line';
        query = `
          INSERT INTO line (
            org_id, name, descri, srid, remark, etc, 
            feat_type, creator_id, geometry
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_GeomFromGeoJSON($9))
          RETURNING id, created_at
        `;
        values = [
          organization_id,
          name,
          description,
          srid,
          remark,
          etc,
          feature_type || 'LineString',
          created_by_user_id,
          JSON.stringify(geometry)
        ];
        break;

      case 'polygon':
        tableName = 'polygon';
        query = `
          INSERT INTO polygon (
            org_id, name, descri, address, srid, remark, etc, 
            faet_type, creator_id, geom
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ST_GeomFromGeoJSON($10))
          RETURNING id, created_at
        `;
        values = [
          organization_id,
          name,
          description,
          address,
          srid,
          remark,
          etc,
          feature_type || 'Polygon',
          created_by_user_id,
          JSON.stringify(geometry)
        ];
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'ประเภท geometry ไม่ถูกต้อง กรุณาใช้ Point, LineString หรือ Polygon'
        });
    }

    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      id: result.rows[0].id,
      created_at: result.rows[0].created_at,
      table: tableName
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      error: error.message 
    });
  }
});

// GET /api/geometries
app.get('/api/geometries', async (req, res) => {
  try {
    const [pointResult, lineResult, polygonResult] = await Promise.all([
      pool.query(`
        SELECT 
          id, org_id as organization_id, name, descri as description, 
          'Point' as geometry_type, feat_type as feature_type,
          srid, creator_id as created_by_user_id, 
          created_at, updated_at, address, remark, etc, 
          ST_AsGeoJSON(geometry) as geometry
        FROM point
      `),
      pool.query(`
        SELECT 
          id, org_id as organization_id, name, descri as description, 
          'LineString' as geometry_type, feat_type as feature_type,
          srid, creator_id as created_by_user_id, 
          created_at, updated_at, null as address, remark, etc, 
          ST_AsGeoJSON(geometry) as geometry
        FROM line
      `),
      pool.query(`
        SELECT 
          id, org_id as organization_id, name, descri as description, 
          'Polygon' as geometry_type, faet_type as feature_type,
          srid, creator_id as created_by_user_id, 
          created_at, updated_at, address, remark, etc, 
          ST_AsGeoJSON(geom) as geometry
        FROM polygon
      `)
    ]);

    const allRows = [
      ...pointResult.rows,
      ...lineResult.rows,
      ...polygonResult.rows
    ];

    const features = allRows.map(row => ({
      ...row,
      geometry: JSON.parse(row.geometry)
    }));

    features.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(features);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message 
    });
  }
});

// GET /api/geometries/:id - ดึงข้อมูลตาม ID
app.get('/api/geometries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const queries = [
      {
        table: 'point',
        query: `
          SELECT 
            id, org_id as organization_id, name, descri as description, 
            'Point' as geometry_type, feat_type as feature_type,
            srid, creator_id as created_by_user_id, 
            created_at, updated_at, address, remark, etc, 
            ST_AsGeoJSON(geometry) as geometry
          FROM point WHERE id = $1
        `
      },
      {
        table: 'line',
        query: `
          SELECT 
            id, org_id as organization_id, name, descri as description, 
            'LineString' as geometry_type, feat_type as feature_type,
            srid, creator_id as created_by_user_id, 
            created_at, updated_at, null as address, remark, etc, 
            ST_AsGeoJSON(geometry) as geometry
          FROM line WHERE id = $1
        `
      },
      {
        table: 'polygon',
        query: `
          SELECT 
            id, org_id as organization_id, name, descri as description, 
            'Polygon' as geometry_type, faet_type as feature_type,
            srid, creator_id as created_by_user_id, 
            created_at, updated_at, address, remark, etc, 
            ST_AsGeoJSON(geom) as geometry
          FROM polygon WHERE id = $1
        `
      }
    ];

    let feature = null;
    let foundTable = null;

    for (const { table, query } of queries) {
      const result = await pool.query(query, [id]);
      if (result.rows.length > 0) {
        feature = result.rows[0];
        foundTable = table;
        break;
      }
    }
    
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูล'
      });
    }

    const responseFeature = {
      ...feature,
      geometry: JSON.parse(feature.geometry),
      table: foundTable 
    };

    res.json(responseFeature);

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
    const tables = ['point', 'line', 'polygon'];
    let dataToDelete = null;
    let deletedFromTable = null;

    for (const table of tables) {
      const checkQuery = `SELECT id, name FROM ${table} WHERE id = $1`;
      const checkResult = await pool.query(checkQuery, [id]);
      
      if (checkResult.rows.length > 0) {
        dataToDelete = checkResult.rows[0];
        deletedFromTable = table;
        break;
      }
    }

    if (!dataToDelete) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลที่ต้องการลบ'
      });
    }

    // ลบข้อมูลจาก table ที่พบ
    const deleteQuery = `DELETE FROM ${deletedFromTable} WHERE id = $1 RETURNING id`;
    const deleteResult = await pool.query(deleteQuery, [id]);

    console.log('ลบข้อมูลสำเร็จ:', dataToDelete, 'จาก table:', deletedFromTable);

    res.json({
      success: true,
      message: 'ลบข้อมูลสำเร็จ',
      deleteId: parseInt(id),
      deleteName: dataToDelete.name,
      table: deletedFromTable
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

// POST /api/reports 
app.post('/api/reports', async (req, res) => {
  try {
    const { problem_type, description, files = [] } = req.body;
    if (!problem_type || !description) {
      return res.status(400).json({
        success: false,
        message: 'problem_type และ description จำเป็นต้องระบุ'
      });
    }
    const query = `
      INSERT INTO reports (problem_type, description, files)
      VALUES ($1, $2, $3)
      RETURNING id, created_at
    `;
    const values = [problem_type, description, JSON.stringify(files)];
    const result = await pool.query(query, values);
    res.json({
      success: true,
      message: 'บันทึกรายงานสำเร็จ',
      id: result.rows[0].id,
      created_at: result.rows[0].created_at
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการบันทึกรายงาน',
      error: error.message
    });
  }
});

app.put('/api/geometries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    

    const tables = [
      { name: 'point', fields: ['name', 'descri', 'address', 'srid', 'remark', 'etc', 'feat_type', 'geometry', 'updated_at'] },
      { name: 'line', fields: ['name', 'descri', 'srid', 'remark', 'etc', 'feat_type', 'geometry', 'updated_at'] },
      { name: 'polygon', fields: ['name', 'descri', 'address', 'srid', 'remark', 'etc', 'faet_type', 'geom', 'updated_at'] }
    ];

    let targetTable = null;
    

    for (const table of tables) {
      const checkQuery = `SELECT id FROM ${table.name} WHERE id = $1`;
      const checkResult = await pool.query(checkQuery, [id]);
      if (checkResult.rows.length > 0) {
        targetTable = table;
        break;
      }
    }

    if (!targetTable) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลที่ต้องการแก้ไข'
      });
    }

    const fieldMapping = {
      'name': 'name',
      'description': 'descri',
      'feature_type': targetTable.name === 'polygon' ? 'faet_type' : 'feat_type',
      'srid': 'srid',
      'address': 'address',
      'remark': 'remark',
      'etc': 'etc',
      'geometry': targetTable.name === 'polygon' ? 'geom' : 'geometry',
      'updated_at': 'updated_at'
    };

    const fields = [];
    const values = [];
    let idx = 1;

    // track การแก้ไขล่าสุด
    req.body.updated_at = new Date().toISOString();

    for (const [requestField, dbField] of Object.entries(fieldMapping)) {
      if (req.body[requestField] !== undefined && targetTable.fields.includes(dbField)) {
        if (dbField === 'geometry' && req.body[requestField]) {
          fields.push(`${dbField} = ST_GeomFromGeoJSON($${idx++})`);
          values.push(JSON.stringify(req.body[requestField]));
        } else {
          fields.push(`${dbField} = $${idx++}`);
          values.push(req.body[requestField]);
        }
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีข้อมูลที่จะแก้ไข'
      });
    }

    const updateQuery = `
      UPDATE ${targetTable.name}
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    values.push(id);

    const updateResult = await pool.query(updateQuery, values);

    res.json({
      success: true,
      message: 'แก้ไขข้อมูลสำเร็จ',
      updated: updateResult.rows[0],
      table: targetTable.name
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