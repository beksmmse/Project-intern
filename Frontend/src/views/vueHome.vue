<template>
  <div class="home-page">
    <div class="content">
      <h1>Welcome to the Home Page</h1>
      <p>This is our home content.</p>
    </div>
  </div>
</template>

<!-- <script>
import BG from '../assets/home_bg.png'

export default {
  name: "HomePage",
  data() {
    return {
      BG,
    };
  },
};
</script> -->

<style scoped>
.home-page {
  width: 100vw;
  height: 100vh;
  /* background-image: url('../assets/BG.jpg');  */
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: white;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.7);
  padding: 0px;
}

.content {
  text-align: center;
}
</style>
