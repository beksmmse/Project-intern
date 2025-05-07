<template>
  <div class="report-page">
    <form @submit.prevent="handleSubmit">
      <h2>Report a Problem</h2>

      <div class="form-group">
        <label for="problemType">Problem Type</label>
        <select id="problemType" required>
          <option value="">Select a problem type</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature Request</option>
          <option value="performance">Performance Issue</option>
        </select>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" rows="4" required placeholder="Describe the problem in detail"></textarea>
      </div>

      <div class="form-group">
        <label for="attachments">Attach Files</label>
        <input type="file" id="attachments" />
      </div>

      <div class="form-actions">
        <button type="submit" class="primary-btn">Submit</button>
        <button type="button" class="cancel-btn">Cancel</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.report-page {
  font-family: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  /* max-height: 100vh; */
  background-color: #f4f7fa;
  padding: 20px;
}

form {
  width: 100%;
  max-width: 700px;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 24px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 6px;
}

select,
textarea,
input[type="file"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

select:focus,
textarea:focus,
input[type="file"]:focus {
  outline: none;
  border-color: #3498db;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.primary-btn {
  background-color: #3498db;
  color: white;
}

.primary-btn:hover {
  background-color: #2980b9;
  transform: scale(1.02);
}

.cancel-btn {
  background-color: #bdc3c7;
  color: #2c3e50;
}

.cancel-btn:hover {
  background-color: #95a5a6;
  transform: scale(1.02);
}
</style>

<script>
export default {
  name: 'ReportPage',
  methods: {
    handleSubmit() {
      alert('Report submitted!');
    }
  }
}
</script>
