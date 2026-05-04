import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');
const SEOUL_DISTRICTS_FILE = path.join(ROOT_DIR, 'frontend/data/seoulDistricts.ts');

let cachedDistricts = null;
let cachedTownsByDistrict = null;

const loadSeoulDistrictData = () => {
  if (cachedDistricts && cachedTownsByDistrict) return;

  const content = fs.readFileSync(SEOUL_DISTRICTS_FILE, 'utf8');
  const match = content.match(/export const seoulDistricts: SeoulDistrict\[] = (\[[\s\S]*\]);/);
  if (!match) throw new Error('seoulDistricts 배열을 frontend/data/seoulDistricts.ts 에서 찾을 수 없습니다.');

  const script = new vm.Script(`(${match[1]})`);
  const districts = script.runInNewContext({});

  cachedDistricts = new Set(districts.map((item) => item.district));
  cachedTownsByDistrict = new Map(districts.map((item) => [item.district, new Set(item.towns)]));
};

export const validateSeoulShopPayload = (payload = {}) => {
  loadSeoulDistrictData();

  const cityProvince = (payload.cityProvince || '서울특별시').trim();
  const district = (payload.district || '').trim();
  const town = (payload.town || '').trim();
  const address = (payload.address || '').trim();

  const errors = [];

  if (cityProvince && cityProvince !== '서울특별시') {
    errors.push('cityProvince must be 서울특별시');
  }

  if (!district || !cachedDistricts.has(district)) {
    errors.push('district must be a valid 서울특별시 자치구');
  }

  const towns = cachedTownsByDistrict.get(district);
  if (town && towns && !towns.has(town)) {
    errors.push('town does not belong to selected district');
  }

  if (address && !address.includes('서울')) {
    errors.push('address must be located in 서울');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
