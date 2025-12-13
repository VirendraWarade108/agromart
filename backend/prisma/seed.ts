import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  // Categories
  const seedsCategory = await prisma.category.create({
    data: { name: 'Seeds', description: 'High-quality seeds', icon: '🌾' },
  });

  const fertCategory = await prisma.category.create({
    data: { name: 'Fertilizers', description: 'Organic and chemical fertilizers', icon: '🌱' },
  });

  const toolsCategory = await prisma.category.create({
    data: { name: 'Tools', description: 'Farm tools and equipment', icon: '🛠️' },
  });

  // Products - Seeds
  await prisma.product.create({
    data: {
      name: 'Premium Tomato Seeds',
      slug: 'premium-tomato-seeds',
      price: 199,
      originalPrice: 249,
      rating: 4.7,
      reviews: 34,
      image: '/images/products/tomato.jpg',
      images: ['/images/products/tomato.jpg'],
      description: 'High-yield hybrid tomato seeds.',
      stock: 150,
      categoryId: seedsCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Pepper Seeds (Hot)',
      slug: 'pepper-seeds-hot',
      price: 159,
      originalPrice: 199,
      rating: 4.6,
      reviews: 28,
      image: '/images/products/pepper.jpg',
      images: ['/images/products/pepper.jpg'],
      description: 'Spicy hot pepper seeds, perfect for Indian cuisine.',
      stock: 120,
      categoryId: seedsCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Onion Seeds (Yellow)',
      slug: 'onion-seeds-yellow',
      price: 129,
      originalPrice: 159,
      rating: 4.4,
      reviews: 15,
      image: '/images/products/onion.jpg',
      images: ['/images/products/onion.jpg'],
      description: 'High-yield yellow onion seeds.',
      stock: 200,
      categoryId: seedsCategory.id,
    },
  });

  // Products - Fertilizers
  await prisma.product.create({
    data: {
      name: 'Organic Fertilizer 5kg',
      slug: 'organic-fertilizer-5kg',
      price: 499,
      originalPrice: 599,
      rating: 4.5,
      reviews: 18,
      image: '/images/products/fertilizer.jpg',
      images: ['/images/products/fertilizer.jpg'],
      description: 'Slow release organic fertilizer.',
      stock: 89,
      categoryId: fertCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'NPK 10:26:26 Fertilizer',
      slug: 'npk-10-26-26-fertilizer',
      price: 349,
      originalPrice: 449,
      rating: 4.8,
      reviews: 42,
      image: '/images/products/npk-fertilizer.jpg',
      images: ['/images/products/npk-fertilizer.jpg'],
      description: 'Complete NPK fertilizer for all crops.',
      stock: 150,
      categoryId: fertCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Potassium Nitrate 1kg',
      slug: 'potassium-nitrate-1kg',
      price: 299,
      originalPrice: 349,
      rating: 4.3,
      reviews: 12,
      image: '/images/products/potassium.jpg',
      images: ['/images/products/potassium.jpg'],
      description: 'Pure potassium nitrate fertilizer.',
      stock: 75,
      categoryId: fertCategory.id,
    },
  });

  // Products - Tools
  await prisma.product.create({
    data: {
      name: 'Hand Shovel (Steel)',
      slug: 'hand-shovel-steel',
      price: 249,
      originalPrice: 299,
      rating: 4.6,
      reviews: 24,
      image: '/images/products/shovel.jpg',
      images: ['/images/products/shovel.jpg'],
      description: 'Durable steel hand shovel for digging.',
      stock: 60,
      categoryId: toolsCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Garden Hose (20m)',
      slug: 'garden-hose-20m',
      price: 399,
      originalPrice: 499,
      rating: 4.7,
      reviews: 31,
      image: '/images/products/hose.jpg',
      images: ['/images/products/hose.jpg'],
      description: '20-meter high-quality garden hose.',
      stock: 45,
      categoryId: toolsCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Pruning Shears',
      slug: 'pruning-shears',
      price: 199,
      originalPrice: 249,
      rating: 4.5,
      reviews: 19,
      image: '/images/products/pruning-shears.jpg',
      images: ['/images/products/pruning-shears.jpg'],
      description: 'Professional pruning shears for plants.',
      stock: 90,
      categoryId: toolsCategory.id,
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
