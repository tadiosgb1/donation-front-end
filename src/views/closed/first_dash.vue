<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-[#003366]">Merchant Donation Dashboard</h1>
        <p class="text-slate-500 mt-2 text-sm">List of registered merchants/NGOs.</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 items-center">
        <div class="relative w-full sm:w-64">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search merchants..."
            @input="filterMerchants"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-700 transition"
          />
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        </div>

        <button
          @click="showAddMerchant = true"
          class="bg-primary hover:bg-dprimary text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
        >
          <i class="fas fa-plus"></i> Add Merchant
        </button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin h-10 w-10 border-2 border-primary border-t-transparent rounded-full"></div>
    </div>

    <!-- Merchants Grid -->
    <div v-else class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="merchant in filteredMerchants" :key="merchant.id || merchant._id"
        class="bg-white rounded-3xl border border-slate-100 overflow-hidden transition group flex flex-col shadow-md">

        <div class="h-48 overflow-hidden relative bg-slate-100 flex items-center justify-center">
          <img 
            v-if="merchant.logo"
            :src="resolveLogoUrl(merchant.logo)"
            alt="Logo"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <span v-else class="text-slate-400 text-sm">No Logo</span>
        </div>

        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h2 class="text-xl font-black text-slate-800 mb-2">{{ merchant.companyName }}</h2>
            <p class="text-sm text-slate-500 line-clamp-3">{{ merchant.description }}</p>
            <p class="text-xs text-slate-400 mt-2">ID: {{ merchant.merchantId }}</p>
          </div>

          <div class="flex gap-2 mt-4">
            <button
              @click="openEditModal(merchant)"
              class="flex-1 text-white bg-primary px-4 py-2 rounded-lg hover:bg-dprimary transition"
            >
              Edit Profile
            </button>

            <button
              @click="confirmDelete(merchant)"
              class="flex-1 text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && filteredMerchants.length === 0" class="text-center text-slate-400 mt-20">
      No merchants found.
    </div>

    <!-- Add/Edit Modals -->
    <add-merchant
      v-if="showAddMerchant"
      @close="showAddMerchant = false"
      @merchant-added="handleMerchantAdded"
    />

    <edit-merchant-modal
      v-if="showEditModal && selectedMerchant"
      :merchant="selectedMerchant"
      @close="closeEditModal"
      @merchant-updated="handleMerchantUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import axios from "axios";
import AddMerchant from './addMerchant.vue';
import EditMerchantModal from './EditMerchantModal.vue';

const { proxy } = getCurrentInstance(); // for toast notifications

const BASE_URL = import.meta.env.VITE_APP_BASE_URL_LOCAL;
const BASE_URL_SOURCE = import.meta.env.VITE_APP_BASE_URL_LOCAL_SOURCE;

const merchants = ref([]);
const filteredMerchants = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const showAddMerchant = ref(false);
const showEditModal = ref(false);
const selectedMerchant = ref(null);

// Fetch merchants using Axios with credentials
const fetchMerchants = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${BASE_URL}/merchants`, { withCredentials: true });
    merchants.value = res.data || [];
    filterMerchants();
  } catch (err) {
    console.error("Fetch Error:", err);
    proxy.$root.$refs.toast.showToast("Failed to fetch merchants", "error");
  } finally {
    loading.value = false;
  }
};

// Filter merchants
const filterMerchants = () => {
  const query = searchQuery.value.toLowerCase();
  filteredMerchants.value = merchants.value.filter(m =>
    m.companyName.toLowerCase().includes(query) ||
    (m.description && m.description.toLowerCase().includes(query))
  );
};

// Resolve logo URLs
const resolveLogoUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${BASE_URL_SOURCE}${path}`;
};

// Open edit modal
const openEditModal = (merchant) => {
  selectedMerchant.value = { ...merchant };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedMerchant.value = null;
};

const handleMerchantUpdated = () => {
  closeEditModal();
  fetchMerchants();
};

const handleMerchantAdded = () => {
  showAddMerchant.value = false;
  fetchMerchants();
};

// Delete merchant using Axios with credentials
const confirmDelete = async (merchant) => {
  const confirmed = confirm(`Are you sure you want to delete ${merchant.companyName}?`);
  if (!confirmed) return;

  try {
    await axios.delete(`${BASE_URL}/merchants/${merchant.id || merchant._id}`, { withCredentials: true });
    proxy.$root.$refs.toast.showToast("Merchant deleted successfully", "success");
    fetchMerchants();
  } catch (err) {
    console.error("Delete Error:", err);
    proxy.$root.$refs.toast.showToast("Failed to delete merchant", "error");
  }
};

onMounted(fetchMerchants);
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.grid > div {
  display: flex;
  flex-direction: column;
}
</style>