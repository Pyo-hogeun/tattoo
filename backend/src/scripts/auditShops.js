import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { Shop } from '../models/Shop.js';
import { validateSeoulShopPayload } from '../utils/seoulValidation.js';

const run = async () => {
  await connectDB(env.mongoUri);

  const shops = await Shop.find({}, { name: 1, cityProvince: 1, district: 1, town: 1, address: 1 }).lean();
  const invalid = [];

  for (const shop of shops) {
    const validation = validateSeoulShopPayload(shop);
    if (!validation.isValid) {
      invalid.push({
        id: String(shop._id),
        name: shop.name,
        district: shop.district,
        address: shop.address,
        errors: validation.errors
      });
    }
  }

  console.log(`총 ${shops.length}건 중 검증 실패 ${invalid.length}건`);
  invalid.slice(0, 100).forEach((item, index) => {
    console.log(`\n[${index + 1}] ${item.name}`);
    console.log(`- id: ${item.id}`);
    console.log(`- district: ${item.district || '-'} / address: ${item.address || '-'}`);
    console.log(`- errors: ${item.errors.join(', ')}`);
  });

  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
