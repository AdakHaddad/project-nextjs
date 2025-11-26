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
      skippedNoNIDN: 0,
      skippedNoDepartment: 0,
      skippedInvalidFormat: 0,
    };

    for (const row of data) {
      // Skip rows with missing critical data
      if (!row.id_data || !row.judul || !row.tingkat || !row.tahun) {
        console.warn('Skipping row due to missing critical data:', row);
        results.skipped++;
        results.skippedInvalidFormat++;
        continue;
      }

      // Skip rows without NIDN (lecturer not found)
      if (!row.penulisNidn || row.penulisNidn.trim() === '') {
        console.warn('Skipping row due to missing NIDN:', row);
        results.skipped++;
        results.skippedNoNIDN++;
        continue;
      }

      // Skip rows without department
      if (!row.id_department && !row.DepartmentName) {
        results.skipped++;
        results.skippedNoDepartment++;
        continue;
      }

      try {
        let departmentId = row.id_department;

        // If DepartmentName is provided instead of ID, find or create the department
        if (!departmentId && row.DepartmentName) {
          const normalizedName = row.DepartmentName.trim();
          
          let department = await prisma.department.findFirst({
            where: { 
              nama: {
                equals: normalizedName,
                mode: 'insensitive'
              }
            },
          });

          if (!department) {
            const maxDept = await prisma.department.findFirst({
              orderBy: { id_department: 'desc' }
            });
            const nextId = (maxDept?.id_department || 0) + 1;

            department = await prisma.department.create({
              data: {
                id_department: nextId,
                nama: normalizedName,
              },
            });
            console.log(`Created new department: ${normalizedName} with ID ${nextId}`);
          }

          departmentId = department.id_department;
        }

        // Check if the Department exists
        const department = await prisma.department.findUnique({
          where: { id_department: Number(departmentId) },
        });

        if (!department) {
          console.warn(`Department with ID ${departmentId} not found. Skipping record.`);
          results.skipped++;
          results.errors.push(`Department with ID ${departmentId} not found for pengabdian ID ${row.id_data}`);
          results.failedRows.push({ row, error: `Department with ID ${departmentId} not found` });
          continue;
        }

        // Check if the Dosen (author) exists
        const dosen = await prisma.dosen.findUnique({
          where: { nidn: row.penulisNidn.trim() },
        });

        if (!dosen) {
          console.warn(`Dosen with NIDN ${row.penulisNidn} not found. Skipping record.`);
          results.skipped++;
          results.errors.push(`Dosen with NIDN ${row.penulisNidn} not found for pengabdian ID ${row.id_data}`);
          results.failedRows.push({ row, error: `Dosen with NIDN ${row.penulisNidn} not found` });
          continue;
        }

        // If Department and Dosen exist, proceed with upsert
        await prisma.pengabdian.upsert({
          where: { id_data: Number(row.id_data) },
          update: {
            judul: row.judul.trim(),
            penulisExternal: row.penulisExternal ? row.penulisExternal.trim() : '',
            penulis: { connect: { nidn: row.penulisNidn.trim() } },
            tingkat: row.tingkat.trim(),
            url: row.url ? row.url.trim() : '',
            department: { connect: { id_department: Number(departmentId) } },
            tahun: Number(row.tahun),
          },
          create: {
            id_data: Number(row.id_data),
            judul: row.judul.trim(),
            penulisExternal: row.penulisExternal ? row.penulisExternal.trim() : '',
            penulis: { connect: { nidn: row.penulisNidn.trim() } },
            tingkat: row.tingkat.trim(),
            url: row.url ? row.url.trim() : '',
            department: { connect: { id_department: Number(departmentId) } },
            tahun: Number(row.tahun),
          },
        });

        results.success++;
      } catch (error:any) {
        console.error('Error processing row:', error);
        results.errors.push(`Error processing pengabdian ID ${row.id_data}: ${error.message}`);
        results.failedRows.push({ row, error: error.message });
      }
    }

    return NextResponse.json({
      message: 'Data processing completed',
      results: {
        ...results,
        summary: `Successfully imported ${results.success} pengabdian records. Skipped ${results.skippedNoNIDN} without NIDN, ${results.skippedNoDepartment} without department, and ${results.skippedInvalidFormat} with invalid format.`
      }
    }, { status: 200 });
  } catch (error:any) {
    console.error('Error processing data:', error);
    return NextResponse.json({ message: 'Error processing data', error: error.message }, { status: 500 });
  }
}