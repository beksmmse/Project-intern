# Vue GIS Management System

ระบบจัดการข้อมูลภูมิศาสตร์ (GIS) แบบครบวงจร ด้วย Vue.js + Express.js + PostgreSQL/PostGIS

---

##  Tech Stack 

**Frontend**
- Vue.js 3
- Vue Router
- Axios
- Leaflet (2D Map)
- Cesium (3D Globe)
- PrimeVue (UI Components)

**Backend**
- Node.js
- Express.js
- PostgreSQL
- PostGIS
- JWT (Authentication)
- bcrypt (Password Hashing)

---

##  รายละเอียด
- แสดงแผนที่ 2D/3D
- วาดและจัดการ Point, Line, Polygon
- ระบบผู้ใช้และสิทธิ์ (JWT, Role-based)
- CRUD ข้อมูลเชิงพื้นที่ผ่าน API
- Export/Import ข้อมูล
- Dashboard สถิติและรายงาน
- Search & Filter

---

##  โครงสร้างโปรเจ็ค
```
vue_setup2/
├── Backend/         # Node.js + Express API
│   ├── app/         # Config, middlewares, models, routes, utils
│   ├── server.js    # Main server file
│   └── package.json
├── Frontend/        # Vue.js SPA
│   ├── src/         # Components, views, router, assets
│   ├── public/      # Static files
│   └── package.json
└── README.md        # Project documentation
```

---

##  ขั้นตอนการติดตั้ง

### 1. Clone Repository
```bash
git clone <repo-url>
cd vue_setup2
```

### 2. ติดตั้ง Backend
```bash
cd Backend
npm install
```

### 3. ตั้งค่าฐานข้อมูล PostgreSQL + PostGIS
- สร้าง database และเปิดใช้งาน extension PostGIS
- สร้างตาราง users, layers ตามตัวอย่างด้านล่าง

#### ตัวอย่าง SQL Schema
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    organize_id INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE layers (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    geometry_type VARCHAR(50) NOT NULL,
    srid INTEGER DEFAULT 4326,
    properties_schema JSONB,
    created_by_user_id INTEGER,
    address TEXT,
    geometry GEOMETRY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE EXTENSION IF NOT EXISTS postgis;
```

### 4. รัน Backend
```bash
npm start server.js 
# API ที่ http://localhost:3000
```

### 5. ติดตั้ง Frontend
```bash
cd ../Frontend
npm install
npm run serve
# SPA ที่ http://localhost:8080
```

---



##  User Roles & Permissions

| Role   | Permissions |
|--------|-------------|
| admin  | จัดการทุกอย่าง, CRUD, จัดการผู้ใช้ |
| editor | CRUD ข้อมูล, ดูข้อมูลทั้งหมด |
| user   | ดูข้อมูลเท่านั้น |

---

##  ตัวอย่างข้อมูล GeoJSON
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [100.5234, 13.7563]
  },
  "properties": {
    "id": 1,
    "name": "วัดพระแก้ว",
    "description": "วัดสำคัญในกรุงเทพฯ"
  }
}
```

---

##  การใช้งาน

1. เข้าสู่ระบบที่ `/login` หรือสมัครสมาชิกที่ `/register`
2. จัดการข้อมูลจุด/เส้น/พื้นที่ผ่านหน้า Map หรือ Dashboard
3. ใช้เครื่องมือวาดและกรอกข้อมูลในฟอร์ม
4. ดูข้อมูลในตาราง, กราฟ, และส่งออก CSV

---

##  Troubleshooting

**Backend ไม่เชื่อมต่อฐานข้อมูล**
- ตรวจสอบ .env และ PostgreSQL/PostGIS
- ตรวจสอบ service: `sudo service postgresql status`

**Frontend เรียก API ไม่มา **
- ตรวจสอบ CORS ใน server.js
- ตรวจสอบ API base URL ใน axios

**Cesium ไม่แสดงผล**
- ตรวจสอบ Cesium Ion token
- ตรวจสอบ WebGL support

---


