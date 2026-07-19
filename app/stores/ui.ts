export const useUiStore = defineStore('ui', () => {
  const isGlobalModalOpen = ref(false)
  const globalModalMessage = ref('')
  function openModal(message: string) { globalModalMessage.value = message; isGlobalModalOpen.value = true }
  function closeModal() { isGlobalModalOpen.value = false; globalModalMessage.value = '' }
  return { isGlobalModalOpen, globalModalMessage, openModal, closeModal }
})
