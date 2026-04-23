const collapseWhitespace = (value = '') => value.replace(/\s+/g, ' ').trim();

const PHONE_REGEX = /(0507|01[016789]|02|0[3-6][1-5]|070)[-\s.]?\d{3,4}[-\s.]?\d{4}/;
const ADDRESS_REGEX =
  /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)[^\n]{4,60}?(?=(상세주소|길찾기|거리뷰|공유|예약|$))/;

const normalizePhone = (phone) => {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;

  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 12 && digits.startsWith('0507')) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
  }

  return digits;
};

const extractCity = (address = '') => {
  const cleaned = collapseWhitespace(address);
  if (!cleaned) return undefined;

  const parts = cleaned.split(' ');
  return parts.slice(0, 2).join(' ').trim() || undefined;
};

const cleanupCompositeName = (text = '') => {
  return collapseWhitespace(
    text
      .replace(/^이미지수\d+/, '')
      .replace(/(톡톡|안내|영업\s*중|영업\s*종료|현재\s*위치|길찾기|거리뷰|공유|예약).*$/g, '')
      .replace(/\d+(\.\d+)?km.*$/g, '')
      .replace(/[|/]+/g, ' ')
  );
};

const splitCompositeShopText = (text = '') => {
  const composite = collapseWhitespace(text);
  if (!composite) return {};

  const phone = composite.match(PHONE_REGEX)?.[0];
  const address = composite.match(ADDRESS_REGEX)?.[0];

  let nameCandidate = composite;
  if (phone) nameCandidate = nameCandidate.replace(phone, ' ');
  if (address) nameCandidate = nameCandidate.replace(address, ' ');

  const name = cleanupCompositeName(nameCandidate);
  return {
    name: name || undefined,
    address: address ? collapseWhitespace(address) : undefined,
    phone
  };
};

const hasCompositeNoise = (value = '') =>
  /(길찾기|거리뷰|영업\s*중|영업\s*종료|현재\s*위치|상세주소|공유|예약|톡톡)/.test(value) || value.length > 40;

export const normalizeShop = (raw = {}) => {
  const rawName = collapseWhitespace(raw.name || '');
  const parsedFromName = hasCompositeNoise(rawName) ? splitCompositeShopText(rawName) : {};

  const baseAddress = collapseWhitespace(raw.address || parsedFromName.address || '');
  const basePhone = raw.phone || parsedFromName.phone;
  const description = collapseWhitespace(raw.description || '');

  const name = collapseWhitespace(parsedFromName.name || rawName);

  return {
    ...raw,
    name,
    address: baseAddress || undefined,
    city: raw.city || extractCity(baseAddress),
    phone: normalizePhone(basePhone),
    description: description || undefined,
    tags: Array.from(new Set((raw.tags || []).map((tag) => collapseWhitespace(tag)).filter(Boolean)))
  };
};
