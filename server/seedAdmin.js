const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@tichisuraksha.com';
  const password = 'AdminPassword123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.users.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('Super Admin already exists:', email);
    return;
  }

  const superAdmin = await prisma.users.create({
    data: {
      name: 'Super Admin',
      email: email,
      password_hash: hashedPassword,
      role: 'super_admin',
      phone: '9876543210'
    },
  });

  console.log('Super Admin account created successfully!');
  console.log('Email:', email);
  console.log('Password:', password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
