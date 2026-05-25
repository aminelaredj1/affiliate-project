import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Placeholder for the n8n webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://placeholder-n8n-webhook-url.com/webhook/track-click";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productTitle, affiliateUrl } = body;

    const userAgent = request.headers.get("user-agent") || "unknown";
    const referer = request.headers.get("referer") || "unknown";
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    const payload = {
      timestamp: new Date().toISOString(),
      productTitle,
      affiliateUrl,
      userAgent,
      referer,
      ip
    };

    // 1. Log to SQLite via Prisma
    try {
      // Find the product by its affiliateUrl
      const product = await prisma.product.findUnique({
        where: { link: affiliateUrl }
      });

      if (product) {
        // Increment the clicks counter and create an event
        await prisma.$transaction([
          prisma.product.update({
            where: { id: product.id },
            data: { clicks: { increment: 1 } }
          }),
          prisma.affiliateEvent.create({
            data: {
              productId: product.id,
              type: "CLICK",
            }
          })
        ]);
        console.log(`Successfully logged click for product: ${product.title}`);
      } else {
        console.log(`Product with link ${affiliateUrl} not found in DB. Event not logged locally.`);
      }
    } catch (dbError) {
      console.error("Error logging event to SQLite:", dbError);
    }

    // 2. Forward the click data to the n8n webhook
    try {
      if (N8N_WEBHOOK_URL !== "https://placeholder-n8n-webhook-url.com/webhook/track-click") {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        console.log("Mocking webhook call to n8n with payload:", payload);
      }
    } catch (webhookError) {
      console.error("Error sending data to n8n webhook:", webhookError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in track-click API route:", error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
