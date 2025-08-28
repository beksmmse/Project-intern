<template>
  <div class="dashboard">
    <div 
      v-for="(category, index) in categories" 
      :key="index" 
      class="card"
    >
      <h2>{{ category.title }}</h2>
      <img :src="category.image" alt="" />
      <ul>
        <li v-for="(item, i) in category.items" :key="i">
          <template v-if="isPlaceholder(item.link)">
            <span class="no-link">{{ item.name }}</span>
          </template>
          <template v-else-if="isExternal(item.link)">
            <a :href="sanitizeLink(item.link)" class="link" target="_blank" rel="noopener noreferrer">
              {{ item.name }}
            </a>
          </template>
          <template v-else>
            <RouterLink :to="item.link" class="link">{{ item.name }}</RouterLink>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const isPlaceholder = (link) => !link || link === '#';
const isExternal = (link) => /^https?:\/\//i.test(String(link).trim());
const sanitizeLink = (link) => String(link).trim();

const categories = [
  {
    title: 'โครงสร้างพื้นฐาน',
    image: require('@/assets/Infrastructure.png'),
    items: [
      { name: 'เส้นทาง', link: '/type/Line' },
      { name: 'ตำแหน่ง', link: '/type/point' },
      { name: 'ขอบเขต', link: '/type/Polygon' },
      { name: 'ไฟฟ้า', link: '#' },
      { name: 'จุดติดตั้งกล้องวงจรปิด (CCTV)', link: '#' }
    ]
  },
  {
    title: 'เศรษฐกิจ',
    image: require('@/assets/1.svg'),
    items: [
      { name: 'ตลาดสดและแผงลอย', link: 'http://bangsaothong.dtc.co.th:5000/login' },
      { name: 'ที่ดินและสิ่งปลูกสร้าง (ภ.ด.ส.1)', link: '#' },
      { name: 'อาคารชุด/ห้องชุด (ภ.ด.ส.2)', link: '#' },
      { name: 'การจดทะเบียนพาณิชย์', link: '#' },
      { name: 'การชำระภาษี', link: '#' },
      { name: 'ป้าย', link: '#' },
    ]
  }, 
  {
    title: 'สังคม',
    image: require('@/assets/4.svg'),
    items: [
      { name: 'ชุมนุม', link: '#' },
      { name: 'ผู้พิการ', link: '#' },
      { name: 'ผู้สูงอายุ', link: '#' },
      { name: 'เรื่องร้องเรียน/ร้องทุกข์', link: '#' },
      { name: 'การเกิดเหตุอาชญากรรม', link: '#' }
    ]
  }, 
    {
    title: 'สาธารณสุขและสิ่งแวดล้อม',
    image: require('@/assets/5.svg'),
    items: [
      { name: 'สภาพอากาศ', link: '#' },
      { name: 'การจัดเก็บขยะ', link: 'http://203.150.210.93:9001/login' },
      { name: 'อ.ส.ม.', link: '#' },
      { name: 'การประกอบกิจการ', link: '#' },
      { name: 'ผู่ป่วย', link: '#' },
    ]
  }, 
    {
    title: 'การศึกษา',
    image: require('@/assets/2.svg'),
    items: [
      { name: 'โรงเรียนในสังกัดเทศบาลฯ', link: '#' },
      { name: 'นักเรียน', link: '#' },
    ]
  }, 
    {
    title: 'ศาสนา ประเพณี และวัฒนธรรม',
    image: require('@/assets/3.svg'),
    items: [
      { name: 'ศาสนสถาน', link: ' https://service.deemap.com/deevr/3dwaskrv2/' },
      { name: 'ประเพณีและวัฒนธรรม', link: '#' },
      { name: 'แหล่งท่องเที่ยว', link: 'https://service.deemap.com/deevr/3deevr/' },
    ]
  }, 
      {
    title: 'ข้อมูลอื่น ๆ',
    image: require('@/assets/6.svg'),
    items: [
      { name: 'บุคลากร', link: '#' },
      { name: 'แผนพัฒนาเทศบาล', link: '#' },
      { name: 'งบประมาณ', link: '#' },
      { name: 'ป้ายประชาสัมพันธ์', link: '#' },
      { name: 'จุดติดตั้งเสียงไร้สาย', link: '#' },
      { name: 'ข้อมูลเปิดภาครัฐ (Open Data)', link: '#' },
    ]
  }, 

      {
    title: 'ข้อเสนอแนะ',
    image: require('@/assets/BG.jpg'),
    items: [
      { name: '', link: '#' },
    ]
  }, 

]
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
  height: 100vh;
  min-height: 0;
  overflow-y: auto;
  
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.card h2 {
  color: #0073aa;
  font-size: 1.3rem;
  margin: 0.25rem 0 0.5rem;
}

.card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  margin: 0 0 0.5rem;
  border-radius: 4px;
}

.card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.card li {
  margin: 0.3rem 0;
  display: flex;
  align-items: center;
}
.card li::before {
  content: none;
  display: none;
}

.card a.link {
  text-decoration: underline;
  color: #0073aa;
}

.no-link {
  text-decoration: none;
  color: inherit;
}

.no-link:hover {
  text-decoration: none;
}
</style>
