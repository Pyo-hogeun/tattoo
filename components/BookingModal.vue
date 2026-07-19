<script setup lang="ts">
const booking = useBookingStore()
const submitted = ref(false)

function submit() {
  submitted.value = true
}

watch(() => booking.isOpen, (open) => {
  if (open) submitted.value = false
})
</script>

<template>
  <Transition name="fade">
    <div v-if="booking.isOpen" class="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-5 backdrop-blur-sm" @click.self="booking.close">
      <section class="relative w-full max-w-xl bg-paper p-7 shadow-2xl md:p-10" aria-modal="true" role="dialog" aria-label="예약 문의">
        <button class="absolute right-5 top-4 text-2xl leading-none" aria-label="닫기" @click="booking.close">×</button>
        <template v-if="!submitted">
          <p class="mono text-[10px] tracking-[.2em] text-rust">BOOKING REQUEST</p>
          <h2 class="display-font mt-3 text-4xl">나의 이야기를<br><i>남겨 주세요.</i></h2>
          <form class="mt-7 grid gap-4" @submit.prevent="submit">
            <input required placeholder="성함" class="border-b border-ink/30 bg-transparent px-1 py-3 outline-none focus:border-rust" />
            <input required type="email" placeholder="이메일" class="border-b border-ink/30 bg-transparent px-1 py-3 outline-none focus:border-rust" />
            <select v-model="booking.selectedStyle" class="border-b border-ink/30 bg-transparent px-1 py-3 outline-none focus:border-rust">
              <option value="">관심 스타일을 선택해 주세요</option>
              <option>Fine line</option><option>Blackwork</option><option>Lettering</option>
            </select>
            <textarea required rows="3" placeholder="원하시는 디자인, 크기, 부위를 알려주세요." class="resize-none border-b border-ink/30 bg-transparent px-1 py-3 outline-none focus:border-rust" />
            <button class="mt-3 bg-ink px-5 py-4 text-sm font-semibold text-paper transition hover:bg-rust">문의 보내기</button>
          </form>
        </template>
        <div v-else class="py-16 text-center">
          <p class="mono text-[10px] tracking-[.2em] text-rust">REQUEST RECEIVED</p>
          <h2 class="display-font mt-3 text-4xl">곧 답장 드릴게요.</h2>
          <p class="mt-4 text-sm leading-6 text-ink/65">영업일 기준 1–2일 안에<br>입력해 주신 이메일로 연락드리겠습니다.</p>
          <button class="mt-8 border border-ink px-5 py-3 text-sm" @click="booking.close">닫기</button>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
