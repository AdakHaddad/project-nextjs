// app/api/dosen/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  const dosen = await prisma.dosen.findMany({
    include: {
      department: true, 
    }, 
  });
  return NextResponse.json(dosen);
}

