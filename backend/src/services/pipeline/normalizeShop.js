const collapseWhitespace = (value = '') => value.replace(/\s+/g, ' ').trim();

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

  return digits;
};

const extractCity = (address = '') => {
  const cleaned = collapseWhitespace(address);
  if (!cleaned) return undefined;

  const parts = cleaned.split(' ');
  return parts.slice(0, 2).join(' ').trim() || undefined;
};

export const normalizeShop = (raw = {}) => {
  const name = collapseWhitespace(raw.name || '');
  const address = collapseWhitespace(raw.address || '');
  const phone = normalizePhone(raw.phone);
  const description = collapseWhitespace(raw.description || '');

  return {
    ...raw,
    name,
    address: address || undefined,
    city: raw.city || extractCity(address),
    phone,
    description: description || undefined,
    tags: Array.from(new Set((raw.tags || []).map((tag) => collapseWhitespace(tag)).filter(Boolean)))
  };
};
