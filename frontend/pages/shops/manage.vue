<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import BackofficeLnb from '~/components/BackofficeLnb.vue';
import { useBackofficeStore } from '~/stores/backoffice';
import { SEOUL_CITY, seoulDistricts } from '~/data/seoulDistricts';
const store = useBackofficeStore();
const editingShopId = ref<string | null>(null);
const shopFormDefault = { name:'', cityProvince:SEOUL_CITY, district:'', town:'', addressDetail:'', phone:'', instagram:'', kakaoChannel:'', homepage:'', bookingNotes:'', description:'', manualMemo:'', isActive:true };
const shopForm = reactive({ ...shopFormDefault });
const districtOptions = computed(() => seoulDistricts.map((i) => i.district));
const townOptions = computed(() => seoulDistricts.find((i) => i.district === shopForm.district)?.towns || []);
const isEditing = computed(() => Boolean(editingShopId.value));
const reset = () => { Object.assign(shopForm, shopFormDefault); editingShopId.value = null; sessionStorage.removeItem('editingShop'); };
const submit = async () => {
  const payload:any = { ...shopForm, address:`${shopForm.cityProvince} ${shopForm.district} ${shopForm.town} ${shopForm.addressDetail}`.trim(), city:shopForm.district, sourceName:'manual', dataSourceType:'manual' };
  if (editingShopId.value) await store.updateShop(editingShopId.value, payload); else await store.createShop(payload);
  reset();
};
onMounted(() => { const raw = sessionStorage.getItem('editingShop'); if (!raw) return; const s = JSON.parse(raw); editingShopId.value = s._id; Object.assign(shopForm, s); });
</script>
<template>
  <div class="mx-auto flex max-w-7xl gap-6 p-6">
    <BackofficeLnb />
    <section class="flex-1 rounded-xl border bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-center justify-between"><h2 class="text-lg font-semibold">신규 입력 / 수정</h2><button v-if="isEditing" class="rounded border px-3 py-1 text-sm" @click="reset">수정 취소</button></div>
      <form class="grid gap-2 md:grid-cols-2" @submit.prevent="submit">
        <input v-model="shopForm.name" class="rounded border p-2" placeholder="매장명" required />
        <input v-model="shopForm.phone" class="rounded border p-2" placeholder="연락처" />
        <input v-model="shopForm.cityProvince" class="rounded border bg-slate-100 p-2" readonly />
        <select v-model="shopForm.district" class="rounded border p-2" required><option disabled value="">지역구 선택</option><option v-for="d in districtOptions" :key="d" :value="d">{{ d }}</option></select>
        <select v-model="shopForm.town" class="rounded border p-2" :disabled="!shopForm.district" required><option disabled value="">행정동/읍 선택</option><option v-for="t in townOptions" :key="t" :value="t">{{ t }}</option></select>
        <input v-model="shopForm.addressDetail" class="rounded border p-2" placeholder="상세 주소" />
        <input v-model="shopForm.instagram" class="rounded border p-2" placeholder="인스타그램 URL" />
        <input v-model="shopForm.kakaoChannel" class="rounded border p-2" placeholder="카카오 채널" />
        <textarea v-model="shopForm.description" class="rounded border p-2 md:col-span-2" rows="3" placeholder="설명" />
        <div class="md:col-span-2"><button class="rounded bg-slate-900 px-4 py-2 text-white">{{ isEditing ? '수정 저장' : '매장 등록' }}</button></div>
      </form>
    </section>
  </div>
</template>
