const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: 'YF-O26-04-0003' },
      include: {
        items: {
          include: {
            product: {
              select: { slug: true, image: true, name: true, price: true, salePrice: true, id: true, tax: true, categoryId: true, isFeatured: true, status: true, hoverImage: true, brand: true, images: true }
            }
          }
        },
        user: { select: { name: true, phone: true, email: true } },
        deliveryBoy: true
      }
    });
    console.log("SUCCESS:", !!order);
  } catch (e) {
    console.error("PRISMA ERROR:", e.message);
  }
}
test();
