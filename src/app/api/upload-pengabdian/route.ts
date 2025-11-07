import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    const results = {
      success: 0,
      skipped: 0,
      errors: [] as string[],
      failedRows: [] as any[],
    };

    for (const row of data) {
      if (!row.id_data || !row.judul || !row.penulisNidn || !row.tingkat || !row.url || !row.id_department || !row.tahun) {
        console.warn('Skipping row due to missing data:', row);
        results.skipped++;
        results.failedRows.push({ row, error: 'Missing required data' });
        continue;
      }

      try {
        // Check if the Department exists
        const department = await prisma.department.findUnique({
          where: { id_department: Number(row.id_department) },
        });

        if (!department) {
          console.warn(`Department with ID ${row.id_department} not found. Skipping record.`);
          results.skipped++;
          results.errors.push(`Department with ID ${row.id_department} not found for research ID ${row.id_data}`);
          results.failedRows.push({ row, error: `Department with ID ${row.id_department} not found` });
          continue;
        }

        // Check if the Dosen (author) exists
        const dosen = await prisma.dosen.findUnique({
          where: { nidn: row.penulisNidn },
        });

        if (!dosen) {
          console.warn(`Dosen with NIDN ${row.penulisNidn} not found. Skipping record.`);
          results.skipped++;
          results.errors.push(`Dosen with NIDN ${row.penulisNidn} not found for research ID ${row.id_data}`);
          results.failedRows.push({ row, error: `Dosen with NIDN ${row.penulisNidn} not found` });
          continue;
        }

        // If Department and Dosen exist, proceed with upsert
        await prisma.pengabdian.upsert({
          where: { id_data: Number(row.id_data) },
          update: {
            judul: row.judul,
            penulisExternal: row.penulisExternal ? row.penulisExternal.split(',') : [],
            penulis: { connect: { nidn: row.penulisNidn } },
            tingkat: row.tingkat,
            url: row.url,
            department: { connect: { id_department: Number(row.id_department) } },
            tahun: Number(row.tahun),
          },
          create: {
            id_data: Number(row.id_data),
            judul: row.judul,
            penulisExternal: row.penulisExternal ? row.penulisExternal.split(',') : [],
            penulis: { connect: { nidn: row.penulisNidn } },
            tingkat: row.tingkat,
            url: row.url,
            department: { connect: { id_department: Number(row.id_department) } },
            tahun: Number(row.tahun),
          },
        });

        results.success++;
      } catch (error:any) {
        console.error('Error processing row:', error);
        results.errors.push(`Error processing research ID ${row.id_data}: ${error.message}`);
        results.failedRows.push({ row, error: error.message });
      }
    }

    return NextResponse.json({
      message: 'Data processing completed',
      results: results
    }, { status: 200 });
  } catch (error:any) {
    console.error('Error processing data:', error);
    return NextResponse.json({ message: 'Error processing data', error: error.message }, { status: 500 });
  }
}