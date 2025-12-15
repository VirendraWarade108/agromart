import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.vendor.deleteMany();

  console.log('✅ Cleared existing data');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Seeds',
        description: 'High-quality seeds for farming',
        icon: '🌾',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Fertilizers',
        description: 'Organic and chemical fertilizers',
        icon: '🌱',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tools',
        description: 'Farm tools and equipment',
        icon: '🛠️',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pesticides',
        description: 'Crop protection solutions',
        icon: '🦟',
      },
    }),
  ]);

  console.log('✅ Created categories');

  // Create Vendor
  const vendor = await prisma.vendor.create({
    data: {
      businessName: 'AgroMart Supplies',
      email: 'vendor@agromart.com',
      phone: '+91-9876543210',
      password: '$2a$10$YourHashedPasswordHere', // Not used for seed
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      isVerified: true,
    },
  });

  console.log('✅ Created vendor');

  // Create Products
  const products = [
    {
      name: 'Premium Tomato Seeds',
      slug: 'premium-tomato-seeds',
      price: 199,
      originalPrice: 249,
      rating: 4.7,
      reviews: 34,
      image: '/images/products/tomato.jpg',
      description: 'High-yield hybrid tomato seeds suitable for all seasons.',
      stock: 150,
      categoryId: categories[0].id,
      vendorId: vendor.id,
    },
    {
      name: 'Organic Fertilizer 5kg',
      slug: 'organic-fertilizer-5kg',
      price: 499,
      originalPrice: 599,
      rating: 4.5,
      reviews: 18,
      image: '/images/products/fertilizer.jpg',
      description: 'Slow release organic fertilizer for healthy plant growth.',
      stock: 89,
      categoryId: categories[1].id,
      vendorId: vendor.id,
    },
    {
      name: 'Garden Trowel Set',
      slug: 'garden-trowel-set',
      price: 299,
      originalPrice: 399,
      rating: 4.3,
      reviews: 12,
      image: '/images/products/trowel.jpg',
      description: 'Durable stainless steel garden trowel set of 3 pieces.',
      stock: 45,
      categoryId: categories[2].id,
      vendorId: vendor.id,
    },
    {
      name: 'Cabbage Seeds - Hybrid',
      slug: 'cabbage-seeds-hybrid',
      price: 149,
      originalPrice: 199,
      rating: 4.6,
      reviews: 27,
      image: '/images/products/cabbage.jpg',
      description: 'Premium hybrid cabbage seeds with high germination rate.',
      stock: 200,
      categoryId: categories[0].id,
      vendorId: vendor.id,
    },
    {
      name: 'NPK Fertilizer 10kg',
      slug: 'npk-fertilizer-10kg',
      price: 899,
      originalPrice: 1099,
      rating: 4.8,
      reviews: 56,
      image: '/images/products/npk.jpg',
      description: 'Balanced NPK fertilizer (19:19:19) for all crops.',
      stock: 120,
      categoryId: categories[1].id,
      vendorId: vendor.id,
    },
    {
      name: 'Pruning Shears',
      slug: 'pruning-shears',
      price: 399,
      originalPrice: 499,
      rating: 4.4,
      reviews: 15,
      image: '/images/products/shears.jpg',
      description: 'Professional pruning shears with ergonomic handle.',
      stock: 67,
      categoryId: categories[2].id,
      vendorId: vendor.id,
    },
    {
      name: 'Carrot Seeds - Nantes',
      slug: 'carrot-seeds-nantes',
      price: 129,
      originalPrice: 179,
      rating: 4.5,
      reviews: 22,
      image: '/images/products/carrot.jpg',
      description: 'Sweet Nantes variety carrot seeds, perfect for home gardens.',
      stock: 180,
      categoryId: categories[0].id,
      vendorId: vendor.id,
    },
    {
      name: 'Bio Pesticide 500ml',
      slug: 'bio-pesticide-500ml',
      price: 349,
      originalPrice: 449,
      rating: 4.2,
      reviews: 9,
      image: '/images/products/pesticide.jpg',
      description: 'Organic bio pesticide safe for plants and environment.',
      stock: 95,
      categoryId: categories[3].id,
      vendorId: vendor.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ Created products');

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'Admin User',
      email: 'admin@agromart.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      isAdmin: true,
    },
  });

  console.log('✅ Created admin user');

  // Create Test User
  const testUser = await prisma.user.create({
    data: {
      fullName: 'Test User',
      email: 'test@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      phone: '+91-9876543210',
    },
  });

  console.log('✅ Created test user');

  console.log('🎉 Seeding completed successfully!');
  console.log('\nTest Accounts:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin: admin@agromart.com / password');
  console.log('User:  test@example.com / password');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });