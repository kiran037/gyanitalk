///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/kundali/session/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kundaliId = parseInt(params.id);

    if (isNaN(kundaliId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid kundali ID'
      }, { status: 400 });
    }

    const kundali = await prisma.kundalis.findUnique({
      where: { id: BigInt(kundaliId) }
    });

    if (!kundali) {
      return NextResponse.json({
        success: false,
        error: 'Kundali not found'
      }, { status: 404 });
    }

    // Convert BigInt to number for JSON serialization
    const kundaliData = {
      ...kundali,
      id: Number(kundali.id),
      birthDate: kundali.birthDate.toISOString().split('T')[0]
    };

    return NextResponse.json({
      success: true,
      data: kundaliData
    });

  } catch (error: any) {
    console.error('Kundali retrieval error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve kundali',
      message: error.message
    }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from "@/lib/prisma";
// import { APIError } from '@/lib/error-response';

// /**
//  * GET /api/landing/kundali/session/[id]
//  * Retrieve kundali data by kundali ID
//  */
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const kundaliId = parseInt(params.id);

//     if (isNaN(kundaliId)) {
//       return APIError.badRequest('Invalid kundali ID');
//     }

//     console.log('🔍 Retrieving kundali:', kundaliId);

//     const kundali = await prisma.kundalis.findUnique({
//       where: { id: BigInt(kundaliId) },
//       include: {
//         users_kundalis_createdByTousers: {
//           select: {
//             id: true,
//             name: true,
//             contactNo: true
//           }
//         }
//       }
//     });

//     if (!kundali) {
//       console.warn('⚠️ Kundali not found:', kundaliId);
//       return APIError.notFound('Kundali not found');
//     }

//     console.log('✓ Kundali retrieved successfully');

//     // Convert BigInt to number for JSON serialization
//     const kundaliData = {
//       id: Number(kundali.id),
//       name: kundali.name,
//       gender: kundali.gender,
//       birthDate: kundali.birthDate.toISOString().split('T')[0],
//       birthTime: kundali.birthTime,
//       birthPlace: kundali.birthPlace,
//       latitude: kundali.latitude,
//       longitude: kundali.longitude,
//       timezone: kundali.timezone,
//       pdfType: kundali.pdf_type,
//       pdfLink: kundali.pdf_link,
//       createdBy: Number(kundali.createdBy),
//       user: kundali.users_kundalis_createdByTousers ? {
//         id: Number(kundali.users_kundalis_createdByTousers.id),
//         name: kundali.users_kundalis_createdByTousers.name,
//         contactNo: kundali.users_kundalis_createdByTousers.contactNo
//       } : null
//     };

//     return NextResponse.json({
//       success: true,
//       data: kundaliData,
//       message: 'Kundali retrieved successfully'
//     });

//   } catch (error: any) {
//     console.error('❌ Kundali retrieval error:', error);
//     return APIError.internalError(
//       'Failed to retrieve kundali',
//       process.env.NODE_ENV === 'development' ? error.message : undefined
//     );
//   }
// }