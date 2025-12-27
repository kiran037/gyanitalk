///Users/xeoren/Desktop/gyanitallk-admin/src/lib/success-response.ts
import { NextResponse } from 'next/server';

export class APISuccess {
  static ok(data: any, message?: string, meta?: any) {
    return NextResponse.json({
      success: true,
      ...(message && { message }),
      data,
      ...(meta && { meta })
    }, { status: 200 });
  }

  static created(data: any, message: string = 'Resource created successfully') {
    return NextResponse.json({
      success: true,
      message,
      data
    }, { status: 201 });
  }

  static accepted(message: string = 'Request accepted for processing') {
    return NextResponse.json({
      success: true,
      message
    }, { status: 202 });
  }

  static noContent() {
    return new NextResponse(null, { status: 204 });
  }
}