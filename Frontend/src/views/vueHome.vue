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
          <RouterLink v-if="isRealLink(item.link)" :to="item.link" class="link">{{ item.name }}</RouterLink>
          <span v-else class="no-link">{{ item.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const isRealLink = (link) => link && link !== '#';

const categories = [
  {
    title: 'โครงสร้างพื้นฐาน',
    image: require('@/assets/BG.jpg'),
    items: [
      { name: 'ถนน', link: '/type/Line' },
      { name: 'ตํ่าแหน่ง', link: '/type/point' },
      { name: 'ขอบเขต', link: '/type/Polygon' },
      { name: 'ไฟฟ้า', link: '#' },
      { name: 'จุดติดตั้งกล้องวงจรปิด (CCTV)', link: '#' }
    ]
  },
  {
    title: 'เศรษฐกิจ',
    image: require('@/assets/BG.jpg'),
    items: [
      { name: 'ที่ดินและสิ่งปลูกสร้าง (ภ.ด.ส.1)', link: '#' },
      { name: 'อาคารชุด/ห้องชุด (ภ.ด.ส.2)', link: '#' },
      { name: 'การจดทะเบียนพาณิชย์', link: '#' },
      { name: 'การชำระภาษี', link: '#' },
      { name: 'ป้าย', link: '#' }
    ]
  }, 
  {
    title: 'สังคม',
    image: require('@/assets/BG.jpg'),
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
    image: require('@/assets/BG.jpg'),
    items: [
      { name: 'สภาพอากาศ', link: '#' },
      { name: 'การจัดเก็บขยะ', link: '#' },
      { name: 'อ.ส.ม.', link: '#' },
      { name: 'การประกอบกิจการ', link: '#' },
    ]
  }, 
    {
    title: 'การศึกษา',
    image: require('@/assets/BG.jpg'),
    items: [
      { name: 'โรงเรียนในสังกัดเทศบาลฯ', link: '#' },
      { name: 'นักเรียน', link: '#' },
    ]
  }, 
    {
    title: 'ศาสนา ประเพณี และวัฒนธรรม',
    image: require('@/assets/BG.jpg'),
    items: [
      { name: 'ศาสนสถาน', link: '#' },
      { name: 'ประเพณีและวัฒนธรรม', link: '#' },
      { name: 'แหล่งท่องเที่ยว', link: '#' },
    ]
  }, 
      {
    title: 'ข้อมูลอื่น ๆ',
    image: require('@/assets/BG.jpg'),
    items: [
      { name: 'บุคลากร', link: '#' },
      { name: 'แผนพัฒนาเทศบาล', link: '#' },
      { name: 'งบประมาณ', link: '#' },
      { name: 'ป้ายประชาสัมพันธ์', link: '#' },
      { name: 'จุดติดตั้งเสียงไร้สาย', link: '#' },
      { name: 'ข้อมูลเปิดภาครัฐ (Open Data)', link: '#' },
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
