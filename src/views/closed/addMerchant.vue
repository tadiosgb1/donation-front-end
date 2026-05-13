<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6" @click.self="$emit('close')">
    <div class="w-full max-w-2xl bg-white rounded-3xl p-8 space-y-6 animate-pop-in relative">

      <!-- Close button -->
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
        <i class="fas fa-times text-lg"></i>
      </button>

      <h2 class="text-2xl font-black text-[#003366] text-center">
        Register Merchant
      </h2>

      <form @submit.prevent="submitMerchant" class="space-y-5">

        <input v-model="form.companyName" type="text" placeholder="Company Name"
          class="w-full p-4 border rounded-xl bg-slate-50" required />

        <textarea v-model="form.description" placeholder="Description"
          class="w-full p-4 border rounded-xl bg-slate-50"></textarea>

        <input v-model="form.merchantId" type="text" placeholder="Merchant ID"
          class="w-full p-4 border rounded-xl bg-slate-50" required />

        <input v-model="form.accessKey" type="text" placeholder="Access Key"
          class="w-full p-4 border rounded-xl bg-slate-50" />

        <input v-model="form.secretKey" type="text" placeholder="Secret Key"
          class="w-full p-4 border rounded-xl bg-slate-50" />

        <div>
          <label class="text-sm font-bold text-slate-600">Upload Logo <span class="text-red-500">*</span></label>
          <input 
            type="file" 
            accept="image/*"
            @change="handleFile"
            class="w-full mt-2 p-3 border rounded-xl bg-slate-50" 
            required
          />
        </div>

        <button type="submit"
          :disabled="loading"
          class="w-full py-4 bg-[#ef7d00] text-white font-bold rounded-xl hover:bg-[#d67000] transition">

          <span v-if="!loading">Register Merchant</span>
          <span v-else class="flex justify-center items-center">
            <span class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            Uploading...
          </span>
        </button>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import axios from "axios";

// Access the global properties (where your toast likely lives)
const { proxy } = getCurrentInstance();
const emit = defineEmits(['close', 'merchant-added']);

const form = ref({
  companyName: "",
  description: "",
  category: "General", // Added a default since it's used in formData
  merchantId: "",
  accessKey: "",
  secretKey: ""
});

const logoFile = ref(null);
const loading = ref(false);
const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

// Helper function to call your toast safely
const showNotification = (message, type) => {
  // Try to find the toast in the global properties or the root
  const toast = proxy?.$root?.$refs?.toast || proxy?.$toast;
  
  if (toast) {
    toast.showToast(message, type);
  } else {
    // Fallback if toast ref is still not found
    console.warn("Toast component not found. Message:", message);
    alert(message); 
  }
};

const handleFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!allowedTypes.includes(file.type)) {
    logoFile.value = null;
    e.target.value = "";
    showNotification("Only image files (PNG, JPG, JPEG, WEBP) are allowed.", "error");
    return;
  }
  logoFile.value = file;
};

const submitMerchant = async () => {
  if (!logoFile.value) {
    showNotification("Please upload a logo image.", "error");
    return;
  }

  loading.value = true;
  const formData = new FormData();
  formData.append("companyName", form.value.companyName);
  formData.append("description", form.value.description);
  formData.append("category", form.value.category);
  formData.append("merchantId", form.value.merchantId);
  formData.append("accessKey", form.value.accessKey);
  formData.append("secretKey", form.value.secretKey);
  formData.append("logo", logoFile.value);

  try {
    const BASE_URL = import.meta.env.VITE_APP_BASE_URL_LOCAL;

    const res = await axios.post(`${BASE_URL}/merchants`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true
    });

    if (res.data?.error) {
      showNotification(res.data.error, "error");
    } else {
      showNotification("Merchant registered successfully!", "success");

      // reset form
      form.value = { companyName: "", description: "", merchantId: "", accessKey: "", secretKey: "", category: "" };
      logoFile.value = null;

      setTimeout(() => emit('merchant-added'), 500);
    }

  } catch (err) {
    console.error(err);
    const errorMsg = err.response?.data?.message || "Failed to register merchant";
    showNotification(errorMsg, "error");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@keyframes popIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-pop-in { animation: popIn 0.25s ease-out; }
</style>