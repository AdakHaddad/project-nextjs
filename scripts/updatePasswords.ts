import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePasswords() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    // Assume the current password is unhashed
    const hashedPassword = await bcryptjs.hash(user.password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    console.log(`Updated password for user: ${user.username}`);
  }
  console.log('All passwords updated');
}

updatePasswords()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });