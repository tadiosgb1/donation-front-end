<template>
  <div class="p-6 bg-gray-50 min-h-screen text-sm text-gray-800 relative">
    <!-- Loading -->
    <Loading :visible="loading" message="Loading Users..." />

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6 border-b pb-4 border-gray-200">
      <h1 class="text-lg font-black text-primary">Users</h1>
      <button @click="openAddModal" class="bg-primary hover:bg-dprimary text-white px-4 py-2 rounded-lg font-black shadow-md flex items-center space-x-1 text-sm">
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Users</span>
      </button>
    </div>

    <!-- Search + Page Size -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <input v-model="searchQuery" @input="fetchItems(1)" type="text" placeholder="Search..."
        class="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition duration-150" />
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <label>Show</label>
        <select v-model="pageSize" @change="fetchItems(1)" class="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white focus:ring-primary focus:border-primary">
          <option v-for="size in [5,10,20,50,100]" :key="size" :value="size">{{ size }}</option>
        </select>
        <span>entries</span>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="bg-white overflow-hidden rounded-xl border border-gray-200 hidden md:block">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm divide-y divide-gray-200">
          <thead class="bg-primary text-white uppercase text-xs font-semibold">
            <tr>
              <th class="px-6 py-3 text-left">#</th>
              <th class="px-6 py-3 text-left">Name</th>
              <th class="px-6 py-3 text-left">Email</th>
              <th class="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in items" :key="item.id" class="hover:bg-primary/10 transition duration-150">
              <td class="px-6 py-4">{{ index + 1 }}</td>
              <td class="px-6 py-4 text-primary font-medium">{{ item.name }}</td>
              <td class="px-6 py-4">{{ item.email }}</td>
              <td class="px-6 py-4 text-center space-x-3">
                <button @click="editItem(item)" class="text-dprimary hover:text-primary"><i class="fas fa-edit"></i></button>
                <button @click="openDeleteModal(item.id)" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="4" class="text-center py-6 text-gray-400 italic">No data found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-6 text-sm text-gray-600">
      <span>
        Showing {{ (currentPage - 1) * pageSize + 1 }} 
        to {{ Math.min(currentPage * pageSize, count) }} 
        of {{ count }} entries
      </span>
      <div class="flex items-center gap-2">
        <button @click="fetchItems(currentPage - 1)" :disabled="!previousPage"
          class="px-3 py-1 border rounded-lg bg-primary text-white hover:bg-dprimary disabled:opacity-50">← Previous</button>
        <span class="px-3 py-1 bg-primary text-white rounded-lg">{{ currentPage }}</span>
        <button @click="fetchItems(currentPage + 1)" :disabled="!nextPage"
          class="px-3 py-1 border rounded-lg bg-primary text-white hover:bg-dprimary disabled:opacity-50">Next →</button>
      </div>
    </div>

    <!-- Modals -->
    <add-users v-if="showModal && !editMode" :data="selectedItem" @close="showModal=false" @saved="fetchItems"/>
    <edit-users v-if="showModal && editMode" :data="selectedItem" @close="showModal=false" @saved="fetchItems"/>

    <delete-confirm-modal 
      :visible="deleteModalVisible"
      title="Delete Users"
      message="Are you sure?"
      @confirm="confirmDelete"
      @cancel="deleteModalVisible=false"
    />
  </div>
</template>

<script>
import axios from "axios";
import AddUsers from "./AddUsers.vue";
import EditUsers from "./EditUsers.vue";
import Loading from "@/components/Loading.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";

export default {
  components: { AddUsers, EditUsers, Loading, DeleteConfirmModal },

  data() {
    return {
      items: [],
      count: 0,
      nextPage: null,
      previousPage: null,
      currentPage: 1,
      pageSize: 10,
      searchQuery: "",
      showModal: false,
      editMode: false,
      selectedItem: null,
      loading: false,
      deleteModalVisible: false,
      deleteId: null,
    };
  },

  methods: {
    async fetchItems(page = 1) {
      this.loading = true;
      this.currentPage = page;

      const BASE_URL = import.meta.env.VITE_APP_BASE_URL_LOCAL;

      try {
        const res = await axios.get(`${BASE_URL}/users`, {
          params: { page: this.currentPage, page_size: this.pageSize, search: this.searchQuery },
          withCredentials: true
        });

        this.items = res.data.data || res.data.results || [];
        this.count = res.data.count || 0;
        this.nextPage = res.data.next;
        this.previousPage = res.data.previous;

      } catch (e) {
        console.error(e);
        this.$root.$refs.toast.showToast("Failed to load users", "error");
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.editMode = false;
      this.selectedItem = null;
      this.showModal = true;
    },

    editItem(item) {
      this.editMode = true;
      this.selectedItem = item;
      this.showModal = true;
    },

    viewDetails(id) {
      this.$router.push({ name: 'Users-detail', params: { id } });
    },

    openDeleteModal(id) {
      this.deleteId = id;
      this.deleteModalVisible = true;
    },

    async confirmDelete() {
      const BASE_URL = import.meta.env.VITE_APP_BASE_URL_LOCAL;

      try {
        await axios.delete(`${BASE_URL}/users/${this.deleteId}`, { withCredentials: true });
        this.$root.$refs.toast.showToast('Deleted successfully', 'success');
      } catch (e) {
        console.error(e);
        this.$root.$refs.toast.showToast('Failed to delete user', 'error');
      }

      this.deleteModalVisible = false;
      this.fetchItems(this.currentPage);
    }
  },

  mounted() {
    this.fetchItems();
  }
};
</script>