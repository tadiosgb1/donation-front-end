<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <!-- Header -->
    <div class="w-full px-4 md:px-10 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-[#003366]">Merchant Donation Dashboard</h1>
        <p class="text-slate-500 mt-2 text-sm font-medium">Manage and monitor verified registered merchants/NGOs.</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 items-center">
        <div class="relative w-full sm:w-72">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search merchants..."
            @input="filterMerchants"
            class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ef7d00] text-sm text-gray-700 transition-all bg-white shadow-sm"
          />
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        </div>

        <button
          @click="showAddMerchant = true"
          class="w-full sm:w-auto bg-[#ef7d00] hover:bg-[#d67000] text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
        >
          <i class="fas fa-plus"></i> Add Merchant
        </button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="flex flex-col justify-center items-center py-32 space-y-4">
      <div class="animate-spin h-12 w-12 border-4 border-[#003366] border-t-transparent rounded-full"></div>
      <p class="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Records</p>
    </div>

    <!-- Merchants Grid -->
    <div v-else class="w-full px-4 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="merchant in filteredMerchants" :key="merchant.id || merchant._id"
        class="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden transition-all group flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1">

        <div class="h-52 overflow-hidden relative bg-slate-50 flex items-center justify-center p-10">
          <img 
            v-if="merchant.logo"
            :src="resolveLogoUrl(merchant.logo)"
            alt="Merchant Logo"
            class="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-500"
          />
          <div v-else class="flex flex-col items-center text-slate-300">
            <i class="fas fa-image text-4xl mb-2"></i>
            <span class="text-[10px] font-bold uppercase tracking-tighter">No Logo Provided</span>
          </div>
        </div>

        <div class="p-8 flex-1 flex flex-col">
          <div class="flex-1">
            <h2 class="text-2xl font-black text-[#003366] mb-3 leading-tight">{{ merchant.companyName }}</h2>
            <p class="text-sm text-slate-500 leading-relaxed line-clamp-3">{{ merchant.description || 'No description available for this merchant.' }}</p>
            
            <div class="mt-6 flex items-center gap-2">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                ID: {{ merchant.merchantId }}
              </span>
            </div>
          </div>

        <div class="flex gap-3 mt-8">
  <button
    @click="openEditModal(merchant)"
    class="flex-1 bg-[#003366] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#002244] transition-all shadow-sm active:scale-95"
  >
    <i class="fas fa-edit mr-2"></i> Edit Profile
  </button>

  <button
    @click="confirmDelete(merchant)"
    class="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-sm active:scale-95"
  >
    <i class="fas fa-trash mr-2"></i> Delete
  </button>
</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredMerchants.length === 0" class="text-center py-32">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
        <i class="fas fa-folder-open text-slate-300 text-3xl"></i>
      </div>
      <h3 class="text-xl font-bold text-slate-400">No merchants found matching your criteria.</h3>
    </div>

    <!-- CUSTOM DELETE CONFIRMATION MODAL -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" @click="closeDeleteModal"></div>

      <div class="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden transform transition-all animate-pop-in">
        <div class="p-10 text-center">
          <div class="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <i class="fas fa-trash-alt text-red-500 text-3xl"></i>
            </div>
          </div>

          <h3 class="text-3xl font-black text-[#003366] mb-2">Are you sure?</h3>
          <p class="text-slate-500 mb-8 leading-relaxed">
            You are about to delete <span class="font-bold text-slate-800">{{ merchantToDelete?.companyName }}</span>. This record will be permanently removed from the donation portal.
          </p>

          <div class="flex flex-col gap-3">
            <button 
              @click="executeDelete" 
              :disabled="isDeleting"
              class="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-100 active:scale-95 disabled:opacity-50"
            >
              <span v-if="!isDeleting">Confirm Deletion</span>
              <span v-else class="flex items-center justify-center gap-2">
                <i class="fas fa-circle-notch animate-spin"></i> Processing...
              </span>
            </button>
            
            <button 
              @click="closeDeleteModal" 
              class="w-full py-5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-2xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Component Modals -->
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

const { proxy } = getCurrentInstance();

const BASE_URL = import.meta.env.VITE_APP_BASE_URL_LOCAL;
const BASE_URL_SOURCE = import.meta.env.VITE_APP_BASE_URL_LOCAL_SOURCE;

const merchants = ref([]);
const filteredMerchants = ref([]);
const loading = ref(false);
const isDeleting = ref(false);
const searchQuery = ref("");

// Modal Controls
const showAddMerchant = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedMerchant = ref(null);
const merchantToDelete = ref(null);

/**
 * Robust notification handler
 */
const showNotification = (message, type) => {
  const toast = proxy?.$root?.$refs?.toast || proxy?.$toast;
  if (toast) {
    toast.showToast(message, type);
  } else {
    console.warn("Toast component not found. Message:", message);
  }
};

/**
 * Fetch records from res.data.data
 */
const fetchMerchants = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${BASE_URL}/merchants`, { withCredentials: true });
    // Targeting res.data.data as requested
    merchants.value = res.data || []; 
    filterMerchants();
  } catch (err) {
    console.error("Fetch Error:", err);
    showNotification("Failed to fetch merchants", "error");
  } finally {
    loading.value = false;
  }
};

const filterMerchants = () => {
  const query = searchQuery.value.toLowerCase();
  filteredMerchants.value = merchants.value.filter(m =>
    m.companyName.toLowerCase().includes(query) ||
    (m.description && m.description.toLowerCase().includes(query))
  );
};

const resolveLogoUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${BASE_URL_SOURCE}${path}`;
};

/**
 * Delete Workflow
 */
const confirmDelete = (merchant) => {
  merchantToDelete.value = merchant;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  merchantToDelete.value = null;
  isDeleting.value = false;
};

const executeDelete = async () => {
  if (!merchantToDelete.value) return;
  
  isDeleting.value = true;
  try {
    const res = await axios.delete(`${BASE_URL}/merchants/${merchantToDelete.value.id || merchantToDelete.value._id}`, { 
      withCredentials: true 
    });

    if (res.data?.data?.error) {
      showNotification(res.data.data.error, "error");
    } else {
      showNotification("Merchant deleted successfully", "success");
      await fetchMerchants();
      closeDeleteModal();
    }
  } catch (err) {
    console.error("Delete Error:", err);
    showNotification("Failed to delete merchant", "error");
  } finally {
    isDeleting.value = false;
  }
};

/**
 * Modal State Handlers
 */
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

onMounted(fetchMerchants);
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-pop-in {
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>