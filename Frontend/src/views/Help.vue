<template>
  <div class="pdf-container">
    <div class="not-ready">ไม่พร้อมใช้งาน</div>
    <!--
    <iframe
      :src="pdfSrc"
      title="Help PDF"
      width="100%"
      height="100%"
      style="border: none;"
    ></iframe>
    -->
  </div>
</template>

<script>
export default {
  name: 'HelpPage',
  data() {
    return {
      pdfSrc: '/docs/23-a.pdf' 
    };
  }
}
</script>

<style scoped>
.pdf-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px); 
}
.pdf-container iframe {
  flex: 1;
  width: 100%;
  border: none;
}
</style>
<style scoped>
.not-ready {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.3rem;
  color: #888;
  font-weight: 500;
}
</style>