<template>
  <div class="page">
    <h1>Admin - Recipes</h1>
    <ul class="card-list">
      <li class="card">🍲 Recipe A</li>
      <li class="card">🥗 Recipe B</li>
      <li class="card">🍰 Recipe C</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AdminRecipes'
}
</script>

<style scoped>
.page {
  padding: 2rem;
}
.card-list {
  list-style: none;
  padding: 0;
}
.card {
  background: #fff;
  margin: 0.5rem 0;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
.card:hover {
  background: #f0f9f6;
}
</style>
