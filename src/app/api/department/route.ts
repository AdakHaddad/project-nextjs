// app/api/departments/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        dosen: {
          select: {
            nidn: true,
          },
        },
        _count: {
          select: {
            dosen: true,
            pengabdian: true,
            penelitian: true,
          },
        },
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}