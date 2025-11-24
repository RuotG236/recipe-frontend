<template>
  <div class="page">
    <h1>Admin Dashboard</h1>
    <div class="grid">
      <div class="card">👥 Manage Users</div>
      <div class="card">📖 Manage Recipes</div>
      <div class="card">⚙️ Settings</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard'
}
</script>

<style scoped>
.page {
  padding: 2rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}
.card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  cursor: pointer;
}
.card:hover {
  background: #f0f9f6;
}
</style>
