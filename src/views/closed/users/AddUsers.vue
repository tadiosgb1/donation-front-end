<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-sm">
      <div class="flex justify-between items-center mb-4 border-b pb-2">
        <h2 class="text-lg font-semibold text-primary">Add User</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-red-500">&times;</button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        
        <!-- Name -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Name</label>
          <input v-model="form.name" type="text" required class="input" />
        </div>

        <!-- Email -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Email</label>
          <input v-model="form.email" type="email" required class="input" />
        </div>

        <!-- Password -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Password</label>
          <input v-model="form.password" type="password" required class="input" />
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
          <input v-model="form.confirm_password" type="password" required class="input" />
          <p v-if="errors.confirm_password" class="text-red-500 text-xs mt-1">{{ errors.confirm_password }}</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg" :disabled="loading">
            <span v-if="!loading">Add</span>
            <span v-else>Processing...</span>
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
      loading: false,
      form: {
        name: "",
        email: "",
        password: "",
        confirm_password: ""
      },
      errors: {
        password: "",
        confirm_password: ""
      }
    };
  },

  methods: {
    validate() {
      this.errors.password = "";
      this.errors.confirm_password = "";

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordRegex.test(this.form.password)) {
        this.errors.password =
          "Password must be 8+ chars, include uppercase, lowercase, number, and special character.";
        return false;
      }

      if (this.form.password !== this.form.confirm_password) {
        this.errors.confirm_password = "Passwords do not match.";
        return false;
      }

      return true;
    },

    async submitForm() {
      if (!this.validate()) return;

      const BASE_URL = import.meta.env.VITE_APP_BASE_URL_LOCAL;
      this.loading = true;

      try {
        const res = await axios.post(
          `${BASE_URL}/auth/register`,
          {
            name: this.form.name,
            email: this.form.email,
            password: this.form.password
          },
          {
            withCredentials: true
          }
        );

        if (res.data && res.data.error) {
          this.$root.$refs.toast.showToast(res.data.error, "error");
        } else {
          this.$root.$refs.toast.showToast("Added successfully", "success");
          this.$emit("saved");
          this.$emit("close");
        }

      } catch (e) {
        console.error(e);
        this.$root.$refs.toast.showToast("Failed to register user", "error");
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.input {
  @apply border border-gray-300 rounded-lg px-4 py-2 w-full 
  focus:outline-none focus:ring-2 focus:ring-primary shadow-sm;
}
</style>