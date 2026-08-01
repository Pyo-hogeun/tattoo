<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

type GalleryItem = { _id: string; title: string; description?: string; imageUrl: string; updatedAt: string };
type ManagerAccount = {
  nickname?: string;
  role?: string;
  shop?: { name?: string; address?: string; phone?: string };
};

const config = useRuntimeConfig();
const items = ref<GalleryItem[]>([]);
const editingId = ref('');
const message = ref('');
const error = ref('');
const isDragging = ref(false);
const isSaving = ref(false);
const selectedFile = ref<File | null>(null);
const previewUrl = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const form = reactive({ title: '', description: '' });
const account = ref<ManagerAccount | null>(null);

const isEditing = computed(() => Boolean(editingId.value));
const canSave = computed(() => Boolean(form.title.trim()) && Boolean(selectedFile.value || editingId.value) && !isSaving.value);
const api = (path: string, options: any = {}) => $fetch(`${config.public.apiBase}${path}`, {
  ...options,
  headers: { ...(options.headers || {}), Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});
const imageSource = (imageUrl: string) => imageUrl.startsWith('http')
  ? imageUrl
  : `${String(config.public.apiBase).replace(/\/api\/?$/, '')}${imageUrl}`;

const clearPreview = () => {
  if (previewUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = '';
};

const chooseFile = (file?: File) => {
  error.value = '';
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    error.value = 'JPG, PNG, WEBP, GIF 이미지만 선택할 수 있습니다.';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    error.value = '이미지는 최대 10MB까지 등록할 수 있습니다.';
    return;
  }
  clearPreview();
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const onFileInput = (event: Event) => chooseFile((event.target as HTMLInputElement).files?.[0]);
const onDrop = (event: DragEvent) => {
  isDragging.value = false;
  chooseFile(event.dataTransfer?.files?.[0]);
};

const resetForm = () => {
  clearPreview();
  selectedFile.value = null;
  editingId.value = '';
  form.title = '';
  form.description = '';
  error.value = '';
  if (fileInput.value) fileInput.value.value = '';
};

const load = async () => {
  const data: any = await api('/gallery/mine');
  items.value = data.items;
};

const save = async () => {
  if (!canSave.value) return;
  isSaving.value = true;
  error.value = '';
  const wasEditing = isEditing.value;
  try {
    const body = new FormData();
    body.append('title', form.title.trim());
    body.append('description', form.description.trim());
    if (selectedFile.value) body.append('image', selectedFile.value);
    await api(editingId.value ? `/gallery/${editingId.value}` : '/gallery', {
      method: editingId.value ? 'PUT' : 'POST',
      body
    });
    resetForm();
    message.value = wasEditing ? '사진이 수정되었습니다.' : '새 사진이 갤러리에 등록되었습니다.';
    await load();
  } catch (requestError: any) {
    error.value = requestError?.data?.message || '사진 저장에 실패했습니다.';
  } finally {
    isSaving.value = false;
  }
};

const edit = (item: GalleryItem) => {
  resetForm();
  editingId.value = item._id;
  form.title = item.title;
  form.description = item.description || '';
  previewUrl.value = imageSource(item.imageUrl);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const remove = async (id: string) => {
  if (!confirm('이 사진을 갤러리에서 삭제할까요?')) return;
  await api(`/gallery/${id}`, { method: 'DELETE' });
  if (editingId.value === id) resetForm();
  await load();
};

onMounted(() => {
  const savedAccount = localStorage.getItem('auth_user');
  if (savedAccount) {
    try { account.value = JSON.parse(savedAccount); } catch { localStorage.removeItem('auth_user'); }
  }
  load().catch(() => { error.value = '로그인하거나 manager 권한을 확인해 주세요.'; });
});
onBeforeUnmount(clearPreview);
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
    <div class="mx-auto max-w-6xl">
      <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-bold tracking-[0.22em] text-amber-600">MANAGER GALLERY</p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">내 매장 갤러리</h1>
          <p class="mt-2 text-sm text-slate-500">매장의 작업 사진을 직접 업로드하고 관리하세요.</p>
        </div>
        <NuxtLink to="/" class="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm">홈으로</NuxtLink>
      </header>

      <section v-if="account" class="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm" aria-label="로그인 계정 정보">
        <span class="font-semibold text-slate-900">{{ account.nickname || '매장 관리자' }}</span>
        <span class="rounded-full bg-amber-50 px-2 py-1 font-bold uppercase text-amber-700">{{ account.role || 'manager' }}</span>
        <span v-if="account.shop?.name"><b class="text-slate-700">매장</b> {{ account.shop.name }}</span>
        <span v-if="account.shop?.phone"><b class="text-slate-700">연락처</b> {{ account.shop.phone }}</span>
        <span v-if="account.shop?.address" class="min-w-0 truncate"><b class="text-slate-700">주소</b> {{ account.shop.address }}</span>
      </section>

      <div class="grid items-start gap-8 lg:grid-cols-[380px,1fr]">
        <form class="rounded-2xl border bg-white p-5 shadow-sm lg:sticky lg:top-6" @submit.prevent="save">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-lg font-bold">{{ isEditing ? '사진 편집' : '새 사진 등록' }}</h2>
            <button v-if="isEditing" type="button" class="text-sm text-slate-500 underline" @click="resetForm">편집 취소</button>
          </div>

          <input ref="fileInput" class="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="onFileInput" />
          <button
            type="button"
            class="relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-5 text-center transition"
            :class="isDragging ? 'border-amber-500 bg-amber-50' : 'border-slate-300 bg-slate-50 hover:border-slate-500'"
            @click="fileInput?.click()"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
          >
            <img v-if="previewUrl" :src="previewUrl" alt="업로드 미리보기" class="absolute inset-0 h-full w-full object-cover" />
            <span v-if="previewUrl" class="absolute inset-0 bg-black/35 opacity-0 transition hover:opacity-100" />
            <template v-if="!previewUrl">
              <span class="mb-3 grid h-12 w-12 place-items-center rounded-full bg-white text-2xl shadow-sm">↑</span>
              <strong class="text-sm">이미지를 끌어다 놓으세요</strong>
              <span class="mt-1 text-xs text-slate-500">또는 클릭하여 파일 선택</span>
              <span class="mt-3 text-[11px] text-slate-400">JPG · PNG · WEBP · GIF / 최대 10MB</span>
            </template>
            <span v-else class="relative rounded-full bg-white/90 px-4 py-2 text-xs font-semibold shadow">클릭하여 이미지 변경</span>
          </button>
          <p v-if="selectedFile" class="mt-2 truncate text-xs text-slate-500">선택: {{ selectedFile.name }}</p>

          <label class="mt-5 block"><span class="mb-1.5 block text-sm font-semibold">작품 제목</span><input v-model="form.title" required maxlength="100" class="w-full rounded-lg border p-3 outline-none focus:border-slate-900" placeholder="예: 블랙워크 플라워" /></label>
          <label class="mt-4 block"><span class="mb-1.5 block text-sm font-semibold">설명 <small class="font-normal text-slate-400">(선택)</small></span><textarea v-model="form.description" maxlength="500" rows="4" class="w-full resize-none rounded-lg border p-3 outline-none focus:border-slate-900" placeholder="작업 스타일이나 특징을 소개해 주세요." /></label>
          <p v-if="error" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
          <button class="mt-5 w-full rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300" :disabled="!canSave">{{ isSaving ? '저장 중…' : isEditing ? '수정 내용 저장' : '갤러리에 등록' }}</button>
        </form>

        <section>
          <div class="mb-4 flex items-center justify-between"><h2 class="text-lg font-bold">등록한 사진</h2><span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold">{{ items.length }}장</span></div>
          <p v-if="message" class="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{{ message }}</p>
          <div v-if="items.length" class="grid gap-5 sm:grid-cols-2">
            <article v-for="item in items" :key="item._id" class="group overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div class="relative aspect-square overflow-hidden bg-slate-100"><img :src="imageSource(item.imageUrl)" :alt="item.title" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" /></div>
              <div class="p-4"><h3 class="font-bold">{{ item.title }}</h3><p class="mt-1 min-h-5 line-clamp-2 text-sm text-slate-500">{{ item.description }}</p><div class="mt-4 flex gap-2"><button class="flex-1 rounded-lg border px-3 py-2 text-sm font-medium" @click="edit(item)">편집</button><button class="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600" @click="remove(item._id)">삭제</button></div></div>
            </article>
          </div>
          <div v-else class="grid min-h-72 place-items-center rounded-2xl border border-dashed bg-white text-center"><div><p class="text-3xl">▧</p><p class="mt-3 font-semibold">아직 등록한 사진이 없습니다</p><p class="mt-1 text-sm text-slate-500">첫 번째 작업 사진을 등록해 보세요.</p></div></div>
        </section>
      </div>
    </div>
  </main>
</template>
