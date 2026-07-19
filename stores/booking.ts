export const useBookingStore = defineStore('booking', () => {
  const isOpen = ref(false)
  const selectedStyle = ref('')

  const open = (style = '') => {
    selectedStyle.value = style
    isOpen.value = true
  }

  const close = () => { isOpen.value = false }

  return { isOpen, selectedStyle, open, close }
})
