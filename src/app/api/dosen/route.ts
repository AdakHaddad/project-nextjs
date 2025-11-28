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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nidn, nama, departmentId, role, scopusId, orcidId, googleScholarId } = body;

    if (!nama || !departmentId) {
      return NextResponse.json({ message: 'Name and departmentId are required' }, { status: 400 });
    }

    const dosen = await prisma.dosen.create({
      data: {
        nidn: nidn || null,
        nama,
        role,
        scopusId,
        orcidId,
        googleScholarId,
        department: { connect: { id_department: Number(departmentId) } },
      },
    });

    return NextResponse.json(dosen, { status: 201 });
  } catch (error: any) {
    console.error('Error creating dosen:', error);
    return NextResponse.json({ message: 'Error creating dosen', error: error.message }, { status: 500 });
  }
}

