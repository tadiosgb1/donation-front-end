<template>
  <div>
    <Toast ref="toast" />

    <Teleport to="body">
      <transition name="auth-overlay">
        <div
          v-if="visible"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
          @click.self="$emit('close')"
        >
          <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

            <!-- Header -->
            <div class="px-6 py-5 border-b flex justify-between items-center">
              <h2 class="text-lg font-bold text-primary">Change Password</h2>
              <button @click="$emit('close')" class="text-gray-400 hover:text-red-500">
                ✕
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="changePassword" class="p-6 space-y-5">

              <!-- Current Password -->
              <div>
                <label class="text-xs font-semibold text-gray-500">Current Password</label>
                <input
                  v-model="form.currentPassword"
                  type="password"
                  class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter current password"
                />
              </div>

              <!-- New Password -->
              <div>
                <label class="text-xs font-semibold text-gray-500">New Password</label>
                <input
                  v-model="form.newPassword"
                  type="password"
                  class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter new password"
                />
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  class="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold"
                  :disabled="loading"
                >
                  <span v-if="!loading">Update</span>
                  <span v-else>Updating...</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script>
import axios from "axios";
import Toast from "../../components/Toast.vue";
export default {
  name: "ChangePassword",
  components: { Toast },

  props: {
    visible: Boolean
  },

  data() {
    return {
      loading: false,
      form: {
        currentPassword: "",
        newPassword: ""
      }
    };
  },

  methods: {
    async changePassword() {
      const BASE_URL = import.meta.env.VITE_APP_BASE_URL_LOCAL;

      this.loading = true;

      try {
        const res = await axios.patch(
          `${BASE_URL}/profile/password`,
          this.form,
          {
            withCredentials: true // ✅ important
          }
        );
         this.$root.$refs.toast.showToast('Updated Successfully', 'success');
         this.$emit("close");
         this.form.current_password = "";
         this.form.new_password = "";
      } catch (err) {
        console.error(err);
        this.$refs.toast.showToast("Failed to update password", "error");
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>