import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { nama: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const yearFilter = searchParams.get('year');
    const currentYear = new Date().getFullYear();
    const startYear = 2019;
    
    // Fetch pengabdian data
    const pengabdianData = await prisma.pengabdian.findMany({
      select: {
        tahun: true,
        tingkat: true,
      },
    });

    // Fetch penelitian data
    const penelitianData = await prisma.penelitian.findMany({
      select: {
        tahun: true,
        tingkat: true,
      },
    });

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
    pengabdianData.forEach(item => {
      if (yearlyStats[item.tahun]) {
        const category = item.tingkat.toLowerCase() === 'internasional' 
          ? 'pengabdianInternasional' 
          : 'pengabdianNasional';
        yearlyStats[item.tahun][category]++;
      }
    });

    // Aggregate penelitian data
    penelitianData.forEach(item => {
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

    // Fetch total number of dosen
    const totalDosen = await prisma.dosen.count();

    return NextResponse.json({
      yearlyStats: formattedYearlyStats,
      totalDosen, 
      totalPengabdian: pengabdianData.length,
      totalPenelitian: penelitianData.length,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'An error occurred while fetching data' }, { status: 500 });
  }
}