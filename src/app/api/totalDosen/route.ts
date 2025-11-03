// app/api/dosen/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  const countDosen = await prisma.dosen.count(); // This will count the number of 'dosen'

  return NextResponse.json({ count: countDosen });
}
