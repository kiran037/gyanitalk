///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/kundali/match/paid/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { WalletChecker } from '@/lib/wallet-check';
import { IntakeFormManager } from '@/lib/intake-form-manager';
import { VedicAPI } from '@/lib/kundli/vedic-api';
import { MATCHING_PRICING } from '@/types/kundli';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        requiresLogin: true
      }, { status: 401 });
    }

    // TODO: Verify JWT
    const userId = 1; // Replace with actual auth

    const body = await request.json();
    const { maleIntakeId, femaleIntakeId, matchType = 'north', language = 'en' } = body;

    // Check wallet balance
    const walletCheck = await WalletChecker.checkBalance(userId, MATCHING_PRICING.price);
    
    if (!walletCheck.hasBalance) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient balance',
        requiresPayment: true,
        currentBalance: walletCheck.currentBalance,
        requiredAmount: MATCHING_PRICING.price,
        message: `You need ₹${MATCHING_PRICING.price}. Current balance: ₹${walletCheck.currentBalance}`
      }, { status: 402 });
    }

    // Get intake forms
    const [maleForm, femaleForm] = await Promise.all([
      IntakeFormManager.getIntakeForm(maleIntakeId),
      IntakeFormManager.getIntakeForm(femaleIntakeId)
    ]);

    if (!maleForm || !femaleForm) {
      return NextResponse.json({
        success: false,
        error: 'Intake forms not found'
      }, { status: 404 });
    }

    // Deduct from wallet
    const deducted = await WalletChecker.deductAmount(
      userId,
      MATCHING_PRICING.price,
      'MatchingKundliView',
      `Matching: ${maleForm.name} & ${femaleForm.name}`
    );

    if (!deducted) {
      return NextResponse.json({
        success: false,
        error: 'Payment failed. Please try again.'
      }, { status: 500 });
    }

    // Format dates
    const formatDate = (date: Date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Generate matching PDF using external API
    const apiKey = await prisma.systemflag.findFirst({
      where: { name: 'vedicAstroAPI' }
    });

    const pdfParams = {
      boy_dob: formatDate(maleForm.birthDate),
      boy_tob: maleForm.birthTime,
      boy_tz: maleForm.timezone || '5.5',
      boy_lat: parseFloat(maleForm.latitude || '0'),
      boy_lon: parseFloat(maleForm.longitude || '0'),
      boy_name: maleForm.name,
      boy_pob: maleForm.birthPlace,
      girl_dob: formatDate(femaleForm.birthDate),
      girl_tob: femaleForm.birthTime,
      girl_tz: femaleForm.timezone || '5.5',
      girl_lat: parseFloat(femaleForm.latitude || '0'),
      girl_lon: parseFloat(femaleForm.longitude || '0'),
      girl_name: femaleForm.name,
      girl_pob: femaleForm.birthPlace,
      lang: language,
      style: matchType,
      color: '140',
      api_key: apiKey?.value || ''
    };

    const pdfResponse = await axios.get(
      'https://api.vedicastroapi.com/v3-json/pdf/matching-queue',
      { params: pdfParams }
    );

    if (pdfResponse.data.status !== 200 || !pdfResponse.data.response) {
      throw new Error('PDF generation failed');
    }

    const pdfUrl = pdfResponse.data.response;

    // Download and save PDF
    let localPdfPath = '';
    try {
      const timestamp = Date.now();
      const filename = `match_${maleForm.name}_${femaleForm.name}_${timestamp}.pdf`.replace(/\s+/g, '_').toLowerCase();
      const kundliDir = process.env.KUNDALI_PATH || './public/kundli';
      const filePath = path.join(kundliDir, filename);

      if (!fs.existsSync(kundliDir)) {
        fs.mkdirSync(kundliDir, { recursive: true });
      }

      // Poll and download
      let pdfReady = false;
      let attempts = 0;
      const maxAttempts = 15;

      while (!pdfReady && attempts < maxAttempts) {
        try {
          const headResponse = await axios.head(pdfUrl);
          if (headResponse.status === 200) {
            const downloadResponse = await axios.get(pdfUrl, {
              responseType: 'arraybuffer',
              timeout: 15000
            });
            fs.writeFileSync(filePath, downloadResponse.data);
            pdfReady = true;
            localPdfPath = `/kundli/${filename}`;
          }
        } catch (err) {
          // Not ready
        }

        if (!pdfReady) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      if (!pdfReady) {
        throw new Error('PDF download timeout');
      }

    } catch (error) {
      console.error('PDF download error:', error);
      // Refund - FIX: Use wallet ID
      if (walletCheck.walletId) {
        await prisma.wallettransaction.create({
          data: {
            userId: BigInt(userId),
            amount: MATCHING_PRICING.price,
            isCredit: true,
            transactionType: 'Refund',
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        await prisma.user_wallets.update({
          where: { id: walletCheck.walletId }, // ✅ FIX: Use id instead of userId
          data: { amount: { increment: MATCHING_PRICING.price } }
        });
      }

      throw new Error('PDF generation failed. Amount refunded.');
    }

    // Save to kundali_matchings table
    // ✅ FIX: Remove match_type field as it doesn't exist in schema
    const matching = await prisma.kundali_matchings.create({
      data: {
        userId: BigInt(userId),
        boyKundaliId: BigInt(maleIntakeId),
        boyName: maleForm.name,
        boyBirthDate: maleForm.birthDate,
        boyBirthTime: maleForm.birthTime,
        boyBirthPlace: maleForm.birthPlace,
        girlkundaliId: BigInt(femaleIntakeId),
        girlName: femaleForm.name,
        girlBirthDate: femaleForm.birthDate,
        girlBirthTime: femaleForm.birthTime,
        girlBirthPlace: femaleForm.birthPlace,
        // match_type: matchType, // ❌ REMOVED - field doesn't exist
        isActive: true,
        isDelete: false,
        createdBy: userId,
        modifiedBy: userId
      }
    });

    // Get updated wallet
    const updatedWallet = await prisma.user_wallets.findFirst({
      where: { userId: BigInt(userId) }
    });

    return NextResponse.json({
      success: true,
      data: {
        matchingId: Number(matching.id),
        pdfUrl: `${process.env.NEXT_PUBLIC_APP_URL}${localPdfPath}`,
        matchType: matchType, // ✅ Return in response but not save in DB
        transactionId: Date.now()
      },
      payment: {
        amountDeducted: MATCHING_PRICING.price,
        currentBalance: Number(updatedWallet?.amount || 0)
      },
      message: 'Detailed matching report generated successfully!'
    });

  } catch (error: any) {
    console.error('Paid matching error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate paid matching report',
      message: error.message
    }, { status: 500 });
  }
}