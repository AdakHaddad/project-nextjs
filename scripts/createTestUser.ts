import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingUser) {
      console.log('User "admin" already exists');
      return;
    }

    // Create a test user
    const hashedPassword = await bcryptjs.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      },
    });

    console.log('Test user created successfully:');
    console.log('Username: admin');
    console.log('Password: password123');
    console.log('User ID:', user.id);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();





