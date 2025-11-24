<template>
  <div class="page">
    <h1>Admin - Users</h1>
    <table>
      <thead>
        <tr><th>Name</th><th>Email</th><th>Role</th></tr>
      </thead>
      <tbody>
        <tr><td>Jane Doe</td><td>jane@example.com</td><td>User</td></tr>
        <tr><td>John Smith</td><td>john@example.com</td><td>Admin</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'AdminUsers'
}
</script>

<style scoped>
.page {
  padding: 2rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th, td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: left;
}
th {
  background: #f5f5f5;
}
tr:hover {
  background: #f9f9f9;
}
</style>
