<template>
  <div class="request-page">
    <div class="form-container">
      <h1>Submit a Request</h1>
      <form @submit.prevent="submitRequest">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" v-model="form.email" required />
        </div>

        <div class="form-group">
          <label for="type">Request Type</label>
          <select id="type" v-model="form.type" required>
            <option disabled value="">-- Select Type --</option>
            <option value="info">Information</option>
            <option value="support">Support</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" v-model="form.message" rows="5" required></textarea>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "RequestPage",
  data() {
    return {
      form: {
        name: "",
        email: "",
        type: "",
        message: "",
      },
    };
  },
  methods: {
    submitRequest() {
      alert("Request submitted successfully!");
      this.form = {
        name: "",
        email: "",
        type: "",
        message: "",
      };
    },
  },
};
</script>

<style scoped>
.request-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh; 
  background-color: #f4f6f8;
  padding: 20px;
}

.form-container {
  background-color: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 6px;
  color: #333;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: inherit;
  font-size: 16px;
  box-sizing: border-box;
}

button {
  background-color: #3498db;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
}

button:hover {
  background-color: #2980b9;
}

@media (max-width: 600px) {
  .form-container {
    padding: 20px;
  }

  h1 {
    font-size: 24px;
  }
}
</style>
