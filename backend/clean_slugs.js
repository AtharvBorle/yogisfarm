require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

async function main() {
  console.log('Fetching all products from DB...');
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products. Processing...`);

  for (const product of products) {
    const originalSlug = product.slug;
    
    // Strip trailing 13-digit Unix timestamp (e.g., -1778591785367)
    let cleanSlug = originalSlug;
    if (/-\d{13}$/.test(originalSlug)) {
      cleanSlug = originalSlug.replace(/-\d{13}$/, '');
    } else {
      // Generate clean slug from name if not matching timestamp pattern
      cleanSlug = slugify(product.name, { lower: true, strict: true });
    }

    if (cleanSlug === originalSlug) {
      console.log(`Product "${product.name}" already has a clean slug: "${originalSlug}". Skipping.`);
      continue;
    }

    // Resolve any rare duplicate conflicts
    let finalSlug = cleanSlug;
    let count = 1;
    while (true) {
      const existing = await prisma.product.findFirst({
        where: { 
          slug: finalSlug,
          id: { not: product.id }
        }
      });
      if (!existing) {
        break;
      }
      finalSlug = `${cleanSlug}-${count}`;
      count++;
    }

    console.log(`Updating "${product.name}": "${originalSlug}" -> "${finalSlug}"`);
    await prisma.product.update({
      where: { id: product.id },
      data: { slug: finalSlug }
    });
  }

  console.log('All product slugs successfully cleaned up!');
}

main()
  .catch(e => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
