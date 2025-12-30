///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/kundali/generate/paid/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { WalletChecker } from '@/lib/wallet-check';
import { VedicAPI } from '@/lib/kundli/vedic-api';
import { KUNDLI_PRICING } from '@/types/kundli';
import { APIError } from '@/lib/error-response';
import { formatDateForAPI } from '@/lib/date-formatter';
import { Validator } from '@/lib/validation';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return APIError.unauthorized('Authentication required');
    }

    // TODO: Verify JWT and get userId
    // For now, you'll need to implement proper JWT verification
    // const user = await verifyAuthToken(request);
    // const userId = user?.id;
    
    // Mock userId for now - REPLACE WITH ACTUAL AUTH
    const userId = 1;

    const body = await request.json();
    const { kundaliId, reportType, language = 'en' } = body;

    // Validate kundaliId
    if (!kundaliId) {
      return APIError.badRequest('Kundali ID is required');
    }

    // Validate report type
    if (!KUNDLI_PRICING[reportType]) {
      return APIError.badRequest('Invalid report type');
    }

    const pricing = KUNDLI_PRICING[reportType];

    // Check wallet balance (now returns walletId too)
    const walletCheck = await WalletChecker.checkBalance(userId, pricing.price);
    
    if (!walletCheck.hasBalance) {
      return APIError.paymentRequired(
        `You need ₹${pricing.price}. Current balance: ₹${walletCheck.currentBalance}`,
        walletCheck.currentBalance,
        pricing.price
      );
    }

    // Get kundali data
    const kundali = await prisma.kundalis.findUnique({
      where: { id: BigInt(kundaliId) }
    });

    if (!kundali) {
      return APIError.notFound('Kundali not found');
    }

    // Verify ownership
    if (kundali.createdBy !== userId) {
      return APIError.unauthorized('You do not have access to this kundali');
    }

    // Deduct from wallet
    const deducted = await WalletChecker.deductAmount(
      userId,
      pricing.price,
      'KundliView',
      `${pricing.name} - ${kundali.name}`
    );

    if (!deducted) {
      return APIError.internalError('Payment failed. Please try again.');
    }

    // Map report type to PDF type
    const pdfTypeMap: Record<string, string> = {
      small: 'small',
      ai_prediction: 'medium',
      detailed: 'medium',
      year_prediction: 'large',
      advanced: 'large'
    };

    // Generate PDF
    const pdfUrl = await VedicAPI.generatePDF({
      name: Validator.truncateField(kundali.name, 50),
      dob: formatDateForAPI(kundali.birthDate),
      tob: kundali.birthTime,
      lat: kundali.latitude || 0,
      lon: kundali.longitude || 0,
      tz: kundali.timezone || '5.5',
      pob: Validator.truncateField(kundali.birthPlace, 50),
      lang: language,
      pdfType: pdfTypeMap[reportType],
      style: 'north'
    });

    // Download and save PDF
    let localPdfPath = '';
    try {
      const timestamp = Date.now();
      const safeName = kundali.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const filename = `${safeName}_${reportType}_${timestamp}.pdf`;
      const kundliDir = process.env.KUNDALI_PATH || './public/kundli';
      const filePath = path.join(kundliDir, filename);

      // Ensure directory exists
      if (!fs.existsSync(kundliDir)) {
        fs.mkdirSync(kundliDir, { recursive: true });
      }

      // Poll and download PDF
      let pdfReady = false;
      let attempts = 0;
      const maxAttempts = 20;

      while (!pdfReady && attempts < maxAttempts) {
        try {
          const headResponse = await axios.head(pdfUrl);
          if (headResponse.status === 200) {
            const pdfResponse = await axios.get(pdfUrl, {
              responseType: 'arraybuffer',
              timeout: 15000
            });
            fs.writeFileSync(filePath, pdfResponse.data);
            pdfReady = true;
            localPdfPath = `/kundli/${filename}`;
          }
        } catch (err) {
          // PDF not ready yet
        }

        if (!pdfReady) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      if (!pdfReady) {
        throw new Error('PDF generation timeout');
      }

    } catch (error) {
      console.error('PDF download error:', error);
      
      // Refund wallet on failure
      if (walletCheck.walletId) {
        await prisma.wallettransaction.create({
          data: {
            userId: BigInt(userId),
            amount: pricing.price,
            isCredit: true,
            transactionType: 'Refund',
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        await prisma.user_wallets.update({
          where: { id: walletCheck.walletId },
          data: { amount: { increment: pricing.price } }
        });
      }

      return APIError.internalError('PDF generation failed. Amount refunded.');
    }

    // Update kundali record with PDF info
    await prisma.kundalis.update({
      where: { id: BigInt(kundaliId) },
      data: {
        pdf_type: reportType,
        pdf_link: localPdfPath
      }
    });

    // Get updated wallet balance
    const updatedWallet = await prisma.user_wallets.findFirst({
      where: { userId: BigInt(userId) }
    });

    return NextResponse.json({
      success: true,
      data: {
        kundaliId: Number(kundali.id),
        pdfUrl: `${process.env.NEXT_PUBLIC_APP_URL}${localPdfPath}`,
        reportType: pricing.name,
        transactionId: Date.now()
      },
      payment: {
        amountDeducted: pricing.price,
        currentBalance: Number(updatedWallet?.amount || 0)
      },
      message: `${pricing.name} generated successfully!`
    });

  } catch (error: any) {
    console.error('Paid kundli error:', error);
    return APIError.internalError(
      'Failed to generate paid kundli',
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
}