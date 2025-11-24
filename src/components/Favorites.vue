<template>
  <div class="page">
    <h1>My Favorites</h1>
    <ul class="card-list">
      <li class="card">🍲 Favorite Recipe 1</li>
      <li class="card">🥗 Favorite Recipe 2</li>
      <li class="card">🍰 Favorite Recipe 3</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Favorites'
}
</script>

<style scoped>
.page {
  padding: 2rem;
}
h1 {
  margin-bottom: 1rem;
  color: #444;
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
</style>
