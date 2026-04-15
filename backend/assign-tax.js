const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignTax() {
  // Get the GST tax entry
  const gstTax = await prisma.tax.findFirst({ where: { name: 'GST' } });
  if (!gstTax) {
    console.log("No GST tax found!");
    return;
  }

  // Assign to all products that don't have a tax
  const result = await prisma.product.updateMany({
    where: { taxId: null },
    data: { taxId: gstTax.id }
  });

  console.log(`Assigned GST (${gstTax.tax}%) to ${result.count} products.`);
  await prisma.$disconnect();
}
assignTax();
