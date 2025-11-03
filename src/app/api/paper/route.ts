// import prisma from '@/lib/prisma';
// import { NextResponse } from 'next/server';

// export async function GET() {
//   try {
    
//     // Fetch all dosen with their pengabdian and penelitian counts
//     const dosenData = await prisma.dosen.findMany({
//       include: {
//         _count: {
//           select: {
//             pengabdian: true,
//             penelitian: true,
//           },
//         },
//       },
//     });

//     // Fetch pengabdian data along with related dosen and department
//     const pengabdianData = await prisma.pengabdian.findMany({
//       include: {
//         penulis: true,
//         department: true,
//       },
//     });

//     // Fetch penelitian data along with related dosen and department
//     const penelitianData = await prisma.penelitian.findMany({
//       include: {
//         penulis: true,
//         department: true,
//       },
//     });

//     // Calculate totals
//     const totalPengabdian = pengabdianData.length;
//     const totalPenelitian = penelitianData.length;

//     // Return the data and totals in the response
//     return NextResponse.json({
//       dosen: dosenData.map(dosen => ({
//         ...dosen,
//         totalPengabdian: dosen._count.pengabdian,
//         totalPenelitian: dosen._count.penelitian,
//       })),
//       pengabdian: {
//         data: pengabdianData,
//         total: totalPengabdian,
//       },
//       penelitian: {
//         data: penelitianData,
//         total: totalPenelitian,
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     return NextResponse.json({ error: 'An error occurred while fetching data' }, { status: 500 });
//   }
// }

// // import prisma from '@/lib/prisma';
// // import { NextResponse } from 'next/server';

// // export async function GET(request: { url: string | URL; }) {
// //   try {
// //     // Get the department ID from the query parameters
// //     const { searchParams } = new URL(request.url);
// //     const departmentId = searchParams.get('departmentId');

// //     if (!departmentId) {
// //       return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
// //     }

// //     // Fetch department details
// //     const department = await prisma.department.findUnique({
// //       where: { id_department: parseInt(departmentId) },
// //       include: {
// //         dosen: {
// //           include: {
// //             _count: {
// //               select: {
// //                 pengabdian: true,
// //                 penelitian: true,
// //               },
// //             },
// //           },
// //         },
// //       },
// //     });

// //     if (!department) {
// //       return NextResponse.json({ error: 'Department not found' }, { status: 404 });
// //     }

// //     // Fetch pengabdian data for the specific department
// //     const pengabdianData = await prisma.pengabdian.findMany({
// //       where: { id_department: parseInt(departmentId) },
// //       include: {
// //         penulis: true,
// //         department: true,
// //       },
// //     });

// //     // Fetch penelitian data for the specific department
// //     const penelitianData = await prisma.penelitian.findMany({
// //       where: { id_department: parseInt(departmentId) },
// //       include: {
// //         penulis: true,
// //         department: true,
// //       },
// //     });

// //     // Calculate totals
// //     const totalPengabdian = pengabdianData.length;
// //     const totalPenelitian = penelitianData.length;

// //     // Return the data and totals in the response
// //     return NextResponse.json({
// //       department: {
// //         ...department,
// //         dosen: department.dosen.map(dosen => ({
// //           ...dosen,
// //           totalPengabdian: dosen._count.pengabdian,
// //           totalPenelitian: dosen._count.penelitian,
// //         })),
// //       },
// //       pengabdian: {
// //         data: pengabdianData,
// //         total: totalPengabdian,
// //       },
// //       penelitian: {
// //         data: penelitianData,
// //         total: totalPenelitian,
// //       },
// //     });
// //   } catch (error) {
// //     console.error('Error fetching data:', error);
// //     return NextResponse.json({ error: 'An error occurred while fetching data' }, { status: 500 });
// //   }
// // }

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get the department ID from the query parameters
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    // Check if departmentId is present and valid
    if (!departmentId || isNaN(parseInt(departmentId))) {
      return NextResponse.json({ error: 'Valid Department ID is required' }, { status: 400 });
    }

    const parsedDepartmentId = parseInt(departmentId);

    // Fetch department details along with dosen and counts for pengabdian and penelitian
    const department = await prisma.department.findUnique({
      where: { id_department: parsedDepartmentId },
      include: {
        dosen: {
          include: {
            _count: {
              select: {
                pengabdian: true,
                penelitian: true,
              },
            },
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Fetch pengabdian data for the specific department
    const pengabdianData = await prisma.pengabdian.findMany({
      where: { id_department: parsedDepartmentId },
      include: {
        penulis: true,
        department: true,
      },
    });

    // Fetch penelitian data for the specific department
    const penelitianData = await prisma.penelitian.findMany({
      where: { id_department: parsedDepartmentId },
      include: {
        penulis: true,
        department: true,
      },
    });

    // Calculate totals
    const totalPengabdian = pengabdianData.length;
    const totalPenelitian = penelitianData.length;

    // Return the data and totals in the response
    return NextResponse.json({
      department: {
        ...department,
        dosen: department.dosen.map(dosen => ({
          ...dosen,
          totalPengabdian: dosen._count.pengabdian,
          totalPenelitian: dosen._count.penelitian,
        })),
      },
      pengabdian: {
        data: pengabdianData,
        total: totalPengabdian,
      },
      penelitian: {
        data: penelitianData,
        total: totalPenelitian,
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'An error occurred while fetching data' }, { status: 500 });
  }
}
