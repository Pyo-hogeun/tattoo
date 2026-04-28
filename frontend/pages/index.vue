<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { useBackofficeStore } from '~/stores/backoffice';
import { SEOUL_CITY, seoulDistricts } from '~/data/seoulDistricts';

const store = useBackofficeStore();
const search = ref('');
const searchDistrict = ref('');
const searchTown = ref('');
const editingShopId = ref<string | null>(null);
const weekdayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const weekdayLabels: Record<(typeof weekdayKeys)[number], string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
  sat: '토',
  sun: '일'
};

const shopFormDefault = {
  name: '',
  address: '',
  cityProvince: SEOUL_CITY,
  district: '',
  town: '',
  addressDetail: '',
  city: '',
  phone: '',
  homepage: '',
  instagram: '',
  kakaoChannel: '',
  businessHours: '',
  bookingNotes: '',
  description: '',
  manualMemo: '',
  isActive: true
};

const shopForm = reactive({ ...shopFormDefault });
const usePerDayHours = ref(false);
const defaultOpenTime = ref('10:00');
const defaultCloseTime = ref('20:00');
const hoursByDay = reactive(
  Object.fromEntries(
    weekdayKeys.map((day) => [day, { enabled: true, open: '10:00', close: '20:00' }])
  ) as Record<(typeof weekdayKeys)[number], { enabled: boolean; open: string; close: string }>
);
const isEditing = computed(() => Boolean(editingShopId.value));
const districtOptions = computed(() => seoulDistricts.map((item) => item.district));
const townOptions = computed(() => seoulDistricts.find((item) => item.district === shopForm.district)?.towns || []);
const phoneDigits = computed(() => shopForm.phone.replace(/\D/g, ''));
const isPhoneValid = computed(() => !shopForm.phone || /^0\d{1,2}-\d{3,4}-\d{4}$/.test(shopForm.phone));
const phoneValidationMessage = computed(() =>
  isPhoneValid.value ? '' : '연락처 형식이 올바르지 않습니다. 예: 010-1234-5678'
);
const canSubmitShop = computed(() => Boolean(shopForm.name.trim()) && isPhoneValid.value);
const timeOptions = computed(() => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 10) {
      options.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }
  return options;
});

const formatPhone = (value?: string) => {
  if (!value) return '';

  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

  if (digits.startsWith('02')) {
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const onPhoneInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  shopForm.phone = formatPhone(input.value);
};

const onDistrictChange = () => {
  if (!townOptions.value.includes(shopForm.town)) {
    shopForm.town = '';
  }
};

const buildBusinessHoursPayload = () => {
  if (!usePerDayHours.value) {
    return {
      businessHours: `매일 ${defaultOpenTime.value} - ${defaultCloseTime.value}`,
      businessHoursDetail: {
        perDay: false,
        defaultOpen: defaultOpenTime.value,
        defaultClose: defaultCloseTime.value
      }
    };
  }

  const summary = weekdayKeys
    .map((day) => {
      const item = hoursByDay[day];
      if (!item.enabled) return `${weekdayLabels[day]} 휴무`;
      return `${weekdayLabels[day]} ${item.open}-${item.close}`;
    })
    .join(', ');

  return {
    businessHours: summary,
    businessHoursDetail: {
      perDay: true,
      byDay: Object.fromEntries(weekdayKeys.map((day) => [day, { ...hoursByDay[day] }]))
    }
  };
};

const resetShopForm = () => {
  Object.assign(shopForm, shopFormDefault);
  usePerDayHours.value = false;
  defaultOpenTime.value = '10:00';
  defaultCloseTime.value = '20:00';
  weekdayKeys.forEach((day) => {
    hoursByDay[day] = { enabled: true, open: '10:00', close: '20:00' };
  });
  editingShopId.value = null;
};

const submitShop = async () => {
  if (!canSubmitShop.value) return;

  const payload = {
    ...shopForm,
    ...buildBusinessHoursPayload(),
    address: `${shopForm.cityProvince} ${shopForm.district} ${shopForm.town} ${shopForm.addressDetail}`.trim(),
    city: shopForm.district,
    dataSourceType: 'manual' as const,
    sourceName: 'manual'
  };

  if (editingShopId.value) {
    await store.updateShop(editingShopId.value, payload);
  } else {
    await store.createShop(payload);
  }

  resetShopForm();
};

const startEditShop = (shop: any) => {
  const detail = shop.businessHoursDetail || {};
  usePerDayHours.value = Boolean(detail.perDay);
  defaultOpenTime.value = detail.defaultOpen || '10:00';
  defaultCloseTime.value = detail.defaultClose || '20:00';
  weekdayKeys.forEach((day) => {
    hoursByDay[day] = { enabled: true, open: '10:00', close: '20:00' };
  });
  if (detail.byDay) {
    weekdayKeys.forEach((day) => {
      hoursByDay[day] = {
        enabled: detail.byDay?.[day]?.enabled ?? true,
        open: detail.byDay?.[day]?.open || '10:00',
        close: detail.byDay?.[day]?.close || '20:00'
      };
    });
  }

  editingShopId.value = shop._id;
  Object.assign(shopForm, {
    name: shop.name || '',
    address: shop.address || '',
    cityProvince: shop.cityProvince || SEOUL_CITY,
    district: shop.district || '',
    town: shop.town || '',
    addressDetail: shop.addressDetail || '',
    city: shop.city || '',
    phone: formatPhone(shop.phone || ''),
    homepage: shop.homepage || '',
    instagram: shop.instagram || '',
    kakaoChannel: shop.kakaoChannel || '',
    businessHours: shop.businessHours || '',
    bookingNotes: shop.bookingNotes || '',
    description: shop.description || '',
    manualMemo: shop.manualMemo || '',
    isActive: shop.isActive ?? true
  });
};

const deleteShop = async (shopId: string) => {
  if (!confirm('이 매장을 삭제하시겠습니까?')) return;
  await store.deleteShop(shopId, search.value, searchDistrict.value, searchTown.value);
};

onMounted(async () => {
  await store.fetchShops();
});
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6 p-6">
    <h1 class="text-2xl font-bold">눈썹문신 백오피스</h1>

    <section class="rounded-xl border bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold">수동 매장 등록/수정</h2>
        <button v-if="isEditing" class="rounded border px-3 py-1 text-sm" @click="resetShopForm">수정 취소</button>
      </div>
      <p class="mb-3 text-sm text-slate-600">운영자가 직접 매장 정보를 입력하여 DB를 관리합니다.</p>
      <form class="grid gap-2 md:grid-cols-2" @submit.prevent="submitShop">
        <input v-model="shopForm.name" class="rounded border p-2" placeholder="매장명" required />
        <div>
          <input
            :value="shopForm.phone"
            class="w-full rounded border p-2"
            :class="isPhoneValid ? '' : 'border-red-500'"
            placeholder="연락처 (예: 010-1234-5678)"
            maxlength="13"
            @input="onPhoneInput"
          />
          <p v-if="phoneValidationMessage" class="mt-1 text-xs text-red-600">{{ phoneValidationMessage }}</p>
          <p v-else-if="phoneDigits.length > 0" class="mt-1 text-xs text-slate-500">입력 숫자: {{ phoneDigits }}</p>
        </div>
        <div class="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3 md:col-span-2">
          <p class="mb-2 text-xs font-semibold text-indigo-700">주소지 입력 (행정구역 선택 + 상세주소)</p>
          <div class="grid gap-2 md:grid-cols-3">
            <input v-model="shopForm.cityProvince" class="rounded border bg-slate-100 p-2" readonly />
            <select v-model="shopForm.district" class="rounded border p-2" required @change="onDistrictChange">
              <option disabled value="">지역구 선택</option>
              <option v-for="district in districtOptions" :key="district" :value="district">{{ district }}</option>
            </select>
            <select v-model="shopForm.town" class="rounded border p-2" :disabled="!shopForm.district" required>
              <option disabled value="">행정동/읍 선택</option>
              <option v-for="town in townOptions" :key="town" :value="town">{{ town }}</option>
            </select>
          </div>
          <input v-model="shopForm.addressDetail" class="mt-2 w-full rounded border p-2" placeholder="상세 주소 (번지/도로명/건물명)" />
          <input
            :value="`${shopForm.cityProvince} ${shopForm.district} ${shopForm.town} ${shopForm.addressDetail}`.trim()"
            class="mt-2 w-full rounded border bg-slate-100 p-2 text-sm text-slate-600"
            readonly
            placeholder="조합된 주소"
          />
        </div>
        <input v-model="shopForm.homepage" class="rounded border p-2" placeholder="홈페이지 URL" />
        <input v-model="shopForm.instagram" class="rounded border p-2" placeholder="인스타그램" />
        <input v-model="shopForm.kakaoChannel" class="rounded border p-2" placeholder="카카오 채널" />
        <div class="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 md:col-span-2">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs font-semibold text-emerald-700">영업시간 입력 (10분 단위)</p>
            <label class="flex items-center gap-2 text-xs text-slate-700">
              <input v-model="usePerDayHours" type="checkbox" />
              요일별로 각각 입력
            </label>
          </div>

          <div v-if="!usePerDayHours" class="grid gap-2 md:grid-cols-2">
            <div>
              <p class="mb-1 text-xs text-slate-600">Open</p>
              <select v-model="defaultOpenTime" class="w-full rounded border p-2">
                <option v-for="time in timeOptions" :key="`default-open-${time}`" :value="time">{{ time }}</option>
              </select>
            </div>
            <div>
              <p class="mb-1 text-xs text-slate-600">Close</p>
              <select v-model="defaultCloseTime" class="w-full rounded border p-2">
                <option v-for="time in timeOptions" :key="`default-close-${time}`" :value="time">{{ time }}</option>
              </select>
            </div>
          </div>

          <div v-else class="space-y-2">
            <div v-for="day in weekdayKeys" :key="day" class="grid items-center gap-2 md:grid-cols-[80px,80px,1fr,1fr]">
              <span class="text-sm font-medium">{{ weekdayLabels[day] }}요일</span>
              <label class="text-xs">
                <input v-model="hoursByDay[day].enabled" type="checkbox" />
                영업
              </label>
              <select v-model="hoursByDay[day].open" class="rounded border p-2" :disabled="!hoursByDay[day].enabled">
                <option v-for="time in timeOptions" :key="`${day}-open-${time}`" :value="time">{{ time }}</option>
              </select>
              <select v-model="hoursByDay[day].close" class="rounded border p-2" :disabled="!hoursByDay[day].enabled">
                <option v-for="time in timeOptions" :key="`${day}-close-${time}`" :value="time">{{ time }}</option>
              </select>
            </div>
          </div>
          <p class="mt-2 text-xs text-slate-600">저장 미리보기: {{ buildBusinessHoursPayload().businessHours }}</p>
        </div>
        <input v-model="shopForm.bookingNotes" class="rounded border p-2 md:col-span-2" placeholder="예약/상담 메모" />
        <textarea v-model="shopForm.description" class="rounded border p-2 md:col-span-2" placeholder="설명" rows="2" />
        <textarea v-model="shopForm.manualMemo" class="rounded border p-2 md:col-span-2" placeholder="운영 메모" rows="2" />
        <label class="flex items-center gap-2 text-sm">
          <input v-model="shopForm.isActive" type="checkbox" />
          노출 상태(활성)
        </label>
        <div class="md:col-span-2">
          <button class="rounded bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-400" :disabled="!canSubmitShop">
            {{ isEditing ? '매장 수정 저장' : '매장 등록' }}
          </button>
        </div>
      </form>
    </section>

    <section class="rounded-xl border bg-white p-4 shadow-sm h-[55vh] overflow-y-auto">
      <div class="mb-3 flex items-center gap-2">
        <h2 class="text-lg font-semibold">매장 목록</h2>
        <input v-model="search" class="rounded border p-1 text-sm" placeholder="검색어" />
        <select v-model="searchDistrict" class="rounded border p-1 text-sm" @change="searchTown = ''">
          <option value="">전체 지역구</option>
          <option v-for="district in districtOptions" :key="`search-${district}`" :value="district">{{ district }}</option>
        </select>
        <select v-model="searchTown" class="rounded border p-1 text-sm" :disabled="!searchDistrict">
          <option value="">전체 행정동/읍</option>
          <option
            v-for="town in seoulDistricts.find((item) => item.district === searchDistrict)?.towns || []"
            :key="`search-town-${town}`"
            :value="town"
          >
            {{ town }}
          </option>
        </select>
        <button class="rounded border px-3 py-1 text-sm" @click="store.fetchShops(search, searchDistrict, searchTown)">검색</button>
      </div>
      <p class="mb-2 text-xs text-slate-500">등록된 DB 총 {{ store.total }}건</p>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm store-list">
          <thead class="bg-slate-100 text-left">
            <tr>
              <th class="p-2">이름</th>
              <th class="p-2">주소</th>
              <th class="p-2">연락처</th>
              <th class="p-2">채널</th>
              <th class="p-2">상태</th>
              <th class="p-2">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="shop in store.shops" :key="shop._id" class="border-t hover:bg-slate-100">
              <td class="p-2">{{ shop.name }}</td>
              <td class="p-2">{{ `${shop.cityProvince || '서울특별시'} ${shop.district || ''} ${shop.town || ''} ${shop.addressDetail || ''}`.trim() }}</td>
              <td class="p-2">{{ formatPhone(shop.phone) }}</td>
              <td class="p-2">{{ shop.instagram || shop.kakaoChannel || '-' }}</td>
              <td class="p-2">{{ shop.isActive ? '활성' : '비활성' }}</td>
              <td class="p-2">
                <div class="flex gap-1">
                  <button class="rounded border px-2 py-1 text-xs" @click="startEditShop(shop)">수정</button>
                  <button class="rounded border border-red-200 px-2 py-1 text-xs text-red-600" @click="deleteShop(shop._id)">
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
