const prisma = require('./src/config/prisma');

async function test() {
  const user = await prisma.users.findUnique({
    where: { id: 1 },
  });
  console.log(user);
  prisma.$disconnect();
}
test();
