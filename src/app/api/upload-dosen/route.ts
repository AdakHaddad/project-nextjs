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
    };

    for (const row of data) {
      // Skip rows with empty NIDN (likely support staff, not lecturers)
      if (!row.NIDN || row.NIDN.trim() === '') {
        results.skipped++;
        results.skippedNoNIDN++;
        continue;
      }

      if (!row.NamaDosen) {
        console.warn('Skipping row due to missing Name:', row);
        results.skipped++;
        results.failedRows.push({ row, error: 'Missing Name' });
        continue;
      }

      // Skip if no department info
      if (!row.DepartmentId && !row.DepartmentName) {
        results.skipped++;
        results.skippedNoDepartment++;
        results.failedRows.push({ row, error: 'Missing department information' });
        continue;
      }

      try {
        let departmentId = row.DepartmentId;

        // If DepartmentName is provided instead of ID, find or create the department
        if (!departmentId && row.DepartmentName) {
          const normalizedName = row.DepartmentName.trim();
          
          // Try to find existing department
          let department = await prisma.department.findFirst({
            where: { 
              nama: {
                equals: normalizedName,
                mode: 'insensitive'
              }
            },
          });

          // If not found, create new department with auto-incrementing ID
          if (!department) {
            // Get the highest ID and increment
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
          results.errors.push(`Department with ID ${departmentId} not found for NIDN ${row.NIDN}`);
          results.failedRows.push({ row, error: `Department with ID ${departmentId} not found` });
          continue;
        }

        // If Department exists, proceed with upsert
        await prisma.dosen.upsert({
          where: { nidn: row.NIDN },
          update: {
            nama: row.NamaDosen,
            department: { connect: { id_department: Number(departmentId) } },
          },
          create: {
            nidn: row.NIDN,
            nama: row.NamaDosen,
            department: { connect: { id_department: Number(departmentId) } },
          },
        });

        results.success++;
      } catch (error:any) {
        console.error('Error processing row:', error);
        results.errors.push(`Error processing NIDN ${row.NIDN}: ${error.message}`);
        results.failedRows.push({ row, error: error.message });
      }
    }

    return NextResponse.json({
      message: 'Data processing completed',
      results: {
        ...results,
        summary: `Successfully imported ${results.success} lecturers. Skipped ${results.skippedNoNIDN} staff without NIDN (non-lecturers) and ${results.skippedNoDepartment} without department info.`
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing data:', error);
    return NextResponse.json({ message: 'Error processing data', error: error.message }, { status: 500 });
  }
}