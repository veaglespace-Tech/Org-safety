const prisma = require('./src/config/prisma');

async function test() {
  const user = await prisma.users.findUnique({
    where: { id: 1 },
    include: { organizations: true }
  });
  console.log(user.organizations);
  prisma.$disconnect();
}
test();
