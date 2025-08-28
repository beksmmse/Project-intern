const express = require('express');
const router = express.Router();
const { GeometryModel } = require('../models/model');

// Validation helper
const validateGeoJSON = (geoJsonData) => {
  if (!geoJsonData.type || geoJsonData.type !== 'Feature') {
    return 'Invalid GeoJSON: must be a Feature';
  }
  
  if (!geoJsonData.geometry || !geoJsonData.properties) {
    return 'Invalid GeoJSON: missing geometry or properties';
  }
  
  const { properties } = geoJsonData;
  const requiredFields = ['name', 'organization_id', 'created_by_user_id'];
  
  for (const field of requiredFields) {
    if (!properties[field]) {
      return `Missing required field: ${field}`;
    }
  }
  
  return null; // Valid
};

// Response formatter
const formatGeometryResponse = (row) => {
  return {
    type: "Feature",
    feature_type: row.feature_type, // เพิ่ม feature_type
    properties: {
      id: row.id,
      organization_id: row.organization_id,
      name: row.name,
      description: row.description,
      geometry_type: row.geometry_type,
      feature_type: row.feature_type, // เพิ่ม feature_type ใน properties ด้วย
      srid: row.srid,
      properties_schema: row.properties_schema,
      created_by_user_id: row.created_by_user_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      address: row.address
    },
    geometry: row.geometry_json ? JSON.parse(row.geometry_json) : null
  };
};

//  POST - บันทึก geometry ใหม่
router.post('/geometries', async (req, res) => {
  try {
    const geoJsonData = req.body;
    
    console.log(' Received GeoJSON data:', geoJsonData);
    
    // Validate GeoJSON
    const validationError = validateGeoJSON(geoJsonData);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }
    
    // บันทึกข้อมูล
    const result = await GeometryModel.create(geoJsonData);
    
    // Format response
    const responseFeature = formatGeometryResponse(result);
    
    res.status(201).json({
      success: true,
      message: 'Geometry created successfully',
      data: responseFeature
    });
    
  } catch (error) {
    console.error(' POST geometry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create geometry',
      error: error.message
    });
  }
});

//  PUT - แก้ไข geometry
router.put('/geometries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const geoJsonData = req.body;
    
    console.log(` Updating geometry ID: ${id}`, geoJsonData);
    
    // ตรวจสอบว่า geometry มีอยู่หรือไม่
    const existingGeometry = await GeometryModel.findById(id);
    if (!existingGeometry) {
      return res.status(404).json({
        success: false,
        message: 'Geometry not found'
      });
    }
    
    // Validate GeoJSON (อาจจะเป็น partial update)
    if (geoJsonData.type && geoJsonData.type !== 'Feature') {
      return res.status(400).json({
        success: false,
        message: 'Invalid GeoJSON: must be a Feature'
      });
    }
    
    // แก้ไขข้อมูล
    const result = await GeometryModel.update(id, geoJsonData);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Geometry not found or not updated'
      });
    }
    
    // Format response
    const responseFeature = formatGeometryResponse(result);
    
    res.json({
      success: true,
      message: 'Geometry updated successfully',
      data: responseFeature
    });
    
  } catch (error) {
    console.error('PUT geometry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update geometry',
      error: error.message
    });
  }
});

//  DELETE - ลบ geometry
router.delete('/geometries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(` Deleting geometry ID: ${id}`);
    
    // ลบข้อมูล
    const result = await GeometryModel.delete(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Geometry not found'
      });
    }
    
    res.json({
      success: true,
      message: `Geometry "${result.name}" deleted successfully`,
      deleted_id: result.id
    });
    
  } catch (error) {
    console.error(' DELETE geometry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete geometry',
      error: error.message
    });
  }
});

router.delete('/geometries', async (req, res) => {
  try {
    const { ids, organization_id } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required'
      });
    }
    
    console.log(`Bulk deleting geometries:`, ids);
    
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
    let sql = `DELETE FROM geometries WHERE id IN (${placeholders})`;
    let params = [...ids];
    
    // Filter by organization_id if provided
    if (organization_id) {
      sql += ` AND organization_id = $${params.length + 1}`;
      params.push(organization_id);
    }
    
    sql += ` RETURNING id, name`;
    
    const { query } = require('./config/db.config');
    const result = await query(sql, params);
    
    res.json({
      success: true,
      message: `${result.rows.length} geometries deleted successfully`,
      deleted_items: result.rows
    });
    
  } catch (error) {
    console.error(' Bulk DELETE geometry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete geometries',
      error: error.message
    });
  }
});

module.exports = router;