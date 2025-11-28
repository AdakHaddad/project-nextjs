import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { nidn: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const nidn = params.nidn;
    const currentYear = new Date().getFullYear();
    const yearFilter = searchParams.get('year');
    const startYear = 2019;

    const dosen = await prisma.dosen.findUnique({
      where: { nidn },
      include: {
        penelitian: {
          where: yearFilter ? {
            tahun: parseInt(yearFilter)
          } : undefined
        },
        pengabdian: {
          where: yearFilter ? {
            tahun: parseInt(yearFilter)
          } : undefined
        }
      },
    });

    if (!dosen) {
      return NextResponse.json({ error: 'Dosen not found' }, { status: 404 });
    }

    // Initialize yearly stats
    const yearlyStats: {
      [key: number]: {
        pengabdianNasional: number;
        pengabdianInternasional: number;
        penelitianNasional: number;
        penelitianInternasional: number;
      };
    } = {};

    // If year filter is applied, only create stats for that year
    if (yearFilter) {
      const year = parseInt(yearFilter);
      yearlyStats[year] = {
        pengabdianNasional: 0,
        pengabdianInternasional: 0,
        penelitianNasional: 0,
        penelitianInternasional: 0,
      };
    } else {
      // Create stats for all years in range
      for (let year = startYear; year <= currentYear; year++) {
        yearlyStats[year] = {
          pengabdianNasional: 0,
          pengabdianInternasional: 0,
          penelitianNasional: 0,
          penelitianInternasional: 0,
        };
      }
    }

    // Aggregate pengabdian data
    dosen.pengabdian.forEach(item => {
      if (yearlyStats[item.tahun]) {
        const category = item.tingkat.toLowerCase() === 'internasional' 
          ? 'pengabdianInternasional' 
          : 'pengabdianNasional';
        yearlyStats[item.tahun][category]++;
      }
    });

    // Aggregate penelitian data
    dosen.penelitian.forEach(item => {
      if (yearlyStats[item.tahun]) {
        const category = item.tingkat.toLowerCase() === 'internasional' 
          ? 'penelitianInternasional' 
          : 'penelitianNasional';
        yearlyStats[item.tahun][category]++;
      }
    });

    // Format data for charts
    const formattedYearlyStats = Object.entries(yearlyStats).map(([year, data]) => ({
      year: parseInt(year),
      ...data,
    }));

    return NextResponse.json({
      dosen: {
        nidn: dosen.nidn,
        nama: dosen.nama,
      },
      penelitian: dosen.penelitian.map(p => ({
        id_data: p.id_data,
        judul: p.judul,
        penulisExternal: p.penulisExternal,
        penulisId: p.penulisId,
        tingkat: p.tingkat,
        url: p.url,
        tahun: p.tahun,
      })),
      pengabdian: dosen.pengabdian.map(p => ({
        id_data: p.id_data,
        judul: p.judul,
        penulisExternal: p.penulisExternal,
        penulisId: p.penulisId,
        tingkat: p.tingkat,
        url: p.url,
        tahun: p.tahun,
      })),
      yearlyStats: formattedYearlyStats,
      totalPengabdian: dosen.pengabdian.length,
      totalPenelitian: dosen.penelitian.length,
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'An error occurred while fetching data' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { nidn: string } }
) {
  try {
    const body = await request.json();
    const { nama, departmentId, role, scopusId, orcidId, googleScholarId } = body;
    const nidn = params.nidn;

    const dosen = await prisma.dosen.findUnique({
      where: { nidn }
    });

    if (!dosen) {
      return NextResponse.json({ error: 'Dosen not found' }, { status: 404 });
    }

    const updatedDosen = await prisma.dosen.update({
      where: { id: dosen.id },
      data: {
        nama: nama || dosen.nama,
        role,
        scopusId,
        orcidId,
        googleScholarId,
        department: departmentId ? { connect: { id_department: Number(departmentId) } } : undefined,
      },
    });

    return NextResponse.json(updatedDosen);
  } catch (error) {
    console.error('Error updating dosen:', error);
    return NextResponse.json({ error: 'An error occurred while updating dosen' }, { status: 500 });
  }
}