<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import BackofficeLnb from '~/components/BackofficeLnb.vue';
import { useBackofficeStore } from '~/stores/backoffice';

const store = useBackofficeStore();
const editingId = ref<string | null>(null);
const formDefault = { name: '', imageUrl: '', description: '', isActive: true };
const form = reactive({ ...formDefault });
const isEditing = computed(() => Boolean(editingId.value));

const resetForm = () => {
  Object.assign(form, formDefault);
  editingId.value = null;
};

const submit = async () => {
  if (!form.name.trim() || !form.imageUrl.trim()) return;
  if (editingId.value) await store.updateBrowShape(editingId.value, form);
  else await store.createBrowShape(form);
  resetForm();
};

const editItem = (item: any) => {
  editingId.value = item._id;
  Object.assign(form, { name: item.name, imageUrl: item.imageUrl, description: item.description || '', isActive: item.isActive ?? true });
};

onMounted(() => {
  store.fetchBrowShapes();
});
</script>

<template>
  <div class="mx-auto flex max-w-7xl gap-6 p-6">
    <BackofficeLnb />
    <section class="flex-1 rounded-xl border bg-white p-4 shadow-sm">
      <h2 class="mb-3 text-lg font-semibold">눈썹형태 등록/관리</h2>
      <form class="grid gap-2 md:grid-cols-2" @submit.prevent="submit">
        <input v-model="form.name" class="rounded border p-2" placeholder="눈썹형태 이름" required />
        <input v-model="form.imageUrl" class="rounded border p-2" placeholder="이미지 URL" required />
        <textarea v-model="form.description" class="rounded border p-2 md:col-span-2" rows="2" placeholder="설명(선택)" />
        <label class="flex items-center gap-2 text-sm md:col-span-2"><input v-model="form.isActive" type="checkbox" />사용 여부</label>
        <div class="md:col-span-2 flex gap-2">
          <button class="rounded bg-slate-900 px-4 py-2 text-white">{{ isEditing ? '수정 저장' : '등록' }}</button>
          <button v-if="isEditing" type="button" class="rounded border px-4 py-2" @click="resetForm">취소</button>
        </div>
      </form>

      <div class="mt-6">
        <h3 class="mb-2 font-medium">등록된 눈썹형태</h3>
        <div class="space-y-2">
          <div v-for="item in store.browShapes" :key="item._id" class="flex items-center gap-3 rounded border p-2">
            <img :src="item.imageUrl" :alt="item.name" class="h-16 w-24 rounded object-cover" />
            <div class="flex-1">
              <p class="font-medium">{{ item.name }}</p>
              <p class="text-xs text-slate-600">{{ item.description }}</p>
            </div>
            <button class="rounded border px-3 py-1 text-sm" @click="editItem(item)">수정</button>
            <button class="rounded border px-3 py-1 text-sm text-red-600" @click="store.deleteBrowShape(item._id)">삭제</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
