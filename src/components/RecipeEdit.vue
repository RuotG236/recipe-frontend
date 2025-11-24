<template>
  <div class="page">
    <h1>Edit Recipe</h1>
    <form class="form">
      <label>Recipe Name</label>
      <input type="text" placeholder="Enter recipe name" />

      <label>Description</label>
      <textarea placeholder="Enter description"></textarea>

      <button type="submit">Save Changes</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'RecipeEdit'
}
</script>

<style scoped>
.page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
h1 {
  margin-bottom: 1rem;
  color: #333;
}
.form {
  display: flex;
  flex-direction: column;
}
label {
  margin: 0.5rem 0;
  font-weight: bold;
}
input, textarea {
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  background: #42b983;
  color: white;
  padding: 0.7rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #369870;
}
</style>
