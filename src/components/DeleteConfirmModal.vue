<template>
  <div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
    <div class="bg-white rounded-xl shadow-2xl w-80 p-6 text-center">
      
      <!-- Title -->
      <h2 class="text-lg font-bold text-primary mb-4">{{ title }}</h2>
      
      <!-- Message -->
      <p class="text-gray-700 mb-6">{{ message }}</p>
      
      <!-- Buttons -->
      <div class="flex justify-center gap-4">
        <button 
          @click="$emit('cancel')" 
          class="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition font-medium"
        >
          Cancel
        </button>
        <button 
          @click="$emit('confirm')" 
          class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-dprimary transition font-medium"
        >
          Confirm
        </button>
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: "Confirm Action" },
    message: { type: String, default: "Are you sure?" },
  },
};
</script>

<style scoped>
/* Optional pop-in animation for better UX */
@keyframes popIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
div.bg-white {
  animation: popIn 0.2s ease-out;
}
</style>