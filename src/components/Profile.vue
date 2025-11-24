<template>
  <div class="page">
    <h1>User Profile</h1>
    <div class="profile-card">
      <img src="https://via.placeholder.com/100" alt="avatar" />
      <div>
        <p><strong>Name:</strong> Jane Doe</p>
        <p><strong>Email:</strong> jane@example.com</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile'
}
</script>

<style scoped>
.page {
  padding: 2rem;
}
.profile-card {
  display: flex;
  align-items: center;
  background: #fdfdfd;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
img {
  border-radius: 50%;
  margin-right: 1rem;
}
</style>
