import crypto from 'crypto';

const fingerprint = (...parts) =>
  crypto
    .createHash('sha1')
    .update(parts.map((part) => (part || '').toString().toLowerCase().trim()).join('|'))
    .digest('hex');

export const buildExternalId = (data = {}) => {
  if (data.externalId) return data.externalId;
  return fingerprint(data.name, data.address, data.phone);
};

export const buildDedupeCandidates = (data = {}) => {
  const candidates = [];
  if (data.externalId) candidates.push({ externalId: data.externalId });
  if (data.phone) candidates.push({ phone: data.phone });

  if (data.name && data.address) {
    candidates.push({ name: data.name, address: data.address });
  }

  if (data.name && data.phone) {
    candidates.push({ name: data.name, phone: data.phone });
  }

  return candidates;
};
