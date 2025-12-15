<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-people"></i> Manage Users</h2>
      <router-link :to="{name: 'AdminDashboard'}" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> Back to Dashboard
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">Loading users...</p>
    </div>

    <!-- Users Table -->
    <div v-else class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td><strong>{{ user.username }}</strong></td>
                <td>{{ user.email }}</td>
                <td>{{ formatDate(user.date_joined) }}</td>
                <td>
                  <span :class="user.is_active ? 'badge bg-success' : 'badge bg-danger'">
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <span :class="user.is_staff ? 'badge bg-primary' : 'badge bg-secondary'">
                    {{ user.is_staff ? 'Admin' : 'User' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm"
                          :class="user.is_active ? 'btn-outline-warning' : 'btn-outline-success'"
                          @click="toggleUserStatus(user)"
                          :disabled="user.username === currentUser?.username">
                    {{ user.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="users.length === 0" class="text-center py-4">
          <p class="text-muted">No users found</p>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="success" class="alert alert-success mt-3">{{ success }}</div>
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import apiService from '@/http/APIService'

export default {
  name: 'AdminUsers',
  setup() {
    const store = useStore()
    const users = ref([])
    const loading = ref(true)
    const success = ref(null)
    const error = ref(null)

    const currentUser = computed(() => store.getters.currentUser)

    const fetchUsers = async () => {
      loading.value = true
      try {
        const response = await apiService.getUsers()
        users.value = response.data.results || response.data || []
      } catch (err) {
        console.error('Error fetching users:', err)
        error.value = 'Failed to load users'
      } finally {
        loading.value = false
      }
    }

    const toggleUserStatus = async (user) => {
      const action = user.is_active ? 'deactivate' : 'activate'
      if (!confirm(`Are you sure you want to ${action} ${user.username}?`)) return

      try {
        await apiService.updateUser(user.id, { is_active: !user.is_active })
        user.is_active = !user.is_active
        success.value = `User ${user.username} has been ${action}d`
        setTimeout(() => success.value = null, 3000)
      } catch (err) {
        console.error('Error updating user:', err)
        error.value = `Failed to ${action} user`
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString()
    }

    onMounted(fetchUsers)

    return {
      users,
      loading,
      success,
      error,
      currentUser,
      toggleUserStatus,
      formatDate
    }
  }
}
</script>
