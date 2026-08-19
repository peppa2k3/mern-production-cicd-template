/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const env = require('../../config/env');
const Role = require('../../modules/roles/role.model');
const User = require('../../modules/users/user.model');
const Category = require('../../modules/categories/category.model');
const Product = require('../../modules/products/product.model');
const KOLProfile = require('../../modules/kol/kolProfile.model');
const KOLProduct = require('../../modules/kol/kolProduct.model');
const { ROLES, DEFAULT_ROLE_PERMISSIONS } = require('../../common/constants/roles');

async function seedRoles() {
  const roleDocs = {};
  for (const [name, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const displayNames = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      kol: 'KOL',
      staff: 'Nhân viên',
    };
    const role = await Role.findOneAndUpdate(
      { name },
      { name, displayName: displayNames[name], permissions, isSystem: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    roleDocs[name] = role;
  }
  console.log('Roles seeded');
  return roleDocs;
}

async function seedSuperAdmin(roles) {
  const existing = await User.findOne({ email: env.superAdmin.email });
  if (existing) {
    console.log('Super admin already exists, skipping');
    return existing;
  }
  const passwordHash = await bcrypt.hash(env.superAdmin.password, 12);
  const admin = await User.create({
    name: env.superAdmin.name,
    email: env.superAdmin.email,
    passwordHash,
    role: roles[ROLES.SUPER_ADMIN]._id,
    isActive: true,
  });
  console.log(`Super admin created: ${env.superAdmin.email} / ${env.superAdmin.password}`);
  return admin;
}

async function seedCategories() {
  const names = ['Thời trang', 'Công nghệ', 'Làm đẹp', 'Gia dụng', 'Mẹ và bé'];
  const categories = [];
  for (const [i, name] of names.entries()) {
    const slug = slugify(name, { lower: true, strict: true });
    const cat = await Category.findOneAndUpdate(
      { slug },
      { name, slug, order: i, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categories.push(cat);
  }
  console.log('Categories seeded');
  return categories;
}

async function seedProducts(categories, adminId) {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log('Products already exist, skipping');
    return Product.find().limit(10);
  }

  const sample = [
    { name: 'Áo thun basic form rộng', price: 199000, commission: 10, hot: true, featured: true },
    { name: 'Tai nghe Bluetooth chống ồn', price: 890000, commission: 8, hot: true, featured: false },
    { name: 'Serum dưỡng da Vitamin C', price: 350000, commission: 15, hot: false, featured: true },
    { name: 'Nồi chiên không dầu 5L', price: 1290000, commission: 6, hot: true, featured: true },
    { name: 'Bình sữa cho bé cao cấp', price: 220000, commission: 12, hot: false, featured: false },
    { name: 'Đồng hồ thông minh thể thao', price: 750000, commission: 9, hot: true, featured: false },
    { name: 'Kem chống nắng SPF50', price: 180000, commission: 18, hot: false, featured: true },
    { name: 'Balo laptop chống nước', price: 320000, commission: 10, hot: false, featured: false },
  ];

  const products = [];
  for (const item of sample) {
    const slug = slugify(item.name, { lower: true, strict: true });
    const category = categories[Math.floor(Math.random() * categories.length)];
    const product = await Product.create({
      name: item.name,
      slug,
      description: `${item.name} - sản phẩm chất lượng cao, đã qua kiểm định. Phù hợp cho Affiliate/KOL quảng bá.`,
      shortDescription: item.name,
      price: item.price,
      images: [{ url: 'https://placehold.co/600x600', isPrimary: true, order: 0 }],
      category: category._id,
      tags: ['hot-trend'],
      affiliateLink: `https://shop.example.com/product/${slug}`,
      commissionType: 'percent',
      commissionValue: item.commission,
      status: 'published',
      isFeatured: item.featured,
      isHot: item.hot,
      createdBy: adminId,
    });
    products.push(product);
  }
  console.log('Products seeded');
  return products;
}

async function seedDemoKOL(roles, products) {
  const existing = await User.findOne({ email: 'kol-demo@affiliate.local' });
  let kolUser = existing;
  if (!existing) {
    const passwordHash = await bcrypt.hash('Kol@123456', 12);
    kolUser = await User.create({
      name: 'Nguyễn Văn A',
      email: 'kol-demo@affiliate.local',
      passwordHash,
      role: roles[ROLES.KOL]._id,
      isActive: true,
    });
  }

  let profile = await KOLProfile.findOne({ user: kolUser._id });
  if (!profile) {
    profile = await KOLProfile.create({
      user: kolUser._id,
      displayName: 'Nguyễn Văn A',
      route: 'nguyen-van-a',
      bio: 'KOL chuyên review công nghệ và làm đẹp.',
      socials: { facebook: 'https://facebook.com/nguyenvana', tiktok: 'https://tiktok.com/@nguyenvana' },
      isActive: true,
    });

    for (const [i, product] of products.slice(0, 5).entries()) {
      await KOLProduct.create({
        kol: profile._id,
        product: product._id,
        isPinned: i < 2,
        order: i,
      });
    }
    console.log('Demo KOL seeded: /kol/nguyen-van-a (login: kol-demo@affiliate.local / Kol@123456)');
  } else {
    console.log('Demo KOL already exists, skipping');
  }
}

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB for seeding');

  const roles = await seedRoles();
  const admin = await seedSuperAdmin(roles);
  const categories = await seedCategories();
  const products = await seedProducts(categories, admin._id);
  await seedDemoKOL(roles, products);

  console.log('Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
