<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-sm">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-4 border-b pb-2">
        <h2 class="text-lg font-semibold text-primary">Edit User</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-red-500 text-xl">&times;</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Name</label>
          <input 
            v-model="form.name" 
            type="text" 
            required 
            class="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition duration-150" 
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            required 
            class="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition duration-150" 
          />
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-4 py-2 border rounded-lg text-gray-700 hover:text-primary transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-dprimary transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: { data: Object },
  data() {
    return {
      form: {
        name: this.data?.name || '',
        email: this.data?.email || '',
      },
      loading: false
    };
  },
  methods: {
    async submitForm() {
      this.loading = true;
      const userId = this.data?.id; 
      const BASE_URL = import.meta.env.VITE_APP_BASE_URL_LOCAL;

      try {
        // ✅ PUT request for editing user
        const res = await axios.patch(`${BASE_URL}/users/${userId}`, this.form, { withCredentials: true });

        if (res) {
          this.$root.$refs.toast.showToast('User updated successfully', 'success');
        }

        this.$emit("saved");
        this.$emit("close");

      } catch (e) {
        console.error(e);
        this.$root.$refs.toast.showToast(e.response?.data?.message || 'Failed to update user', 'error');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>