<template>
  <div class="admin-users container">
    <h2 class="mb-4"><i class="bi bi-people"></i> Manage Users</h2>

    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.username }}</td>
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
                          :class="user.is_active ? 'btn-warning' : 'btn-success'"
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
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import apiService from '@/http/APIService'

export default {
  name: 'AdminUsers',
  setup() {
    const store = useStore()
    const users = ref([])
    const currentUser = computed(() => store.getters.currentUser)

    const fetchUsers = async () => {
      try {
        const response = await apiService.getUsers()
        users.value = response.data
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    const toggleUserStatus = async (user) => {
      if (!confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.username}?`)) {
        return
      }

      try {
        await apiService.updateUser(user.id, { is_active: !user.is_active })
        await fetchUsers()
      } catch (error) {
        console.error('Error updating user:', error)
        alert('Failed to update user status')
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    onMounted(fetchUsers)

    return {
      users,
      currentUser,
      toggleUserStatus,
      formatDate
    }
  }
}
</script>

<style scoped>
.table {
  margin-bottom: 0;
}
</style>