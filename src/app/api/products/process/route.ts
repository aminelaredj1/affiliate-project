import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  let data: any = {};
  try {
    console.log("--- INCOMING WEBHOOK DATA ---");

    // 1. Try to parse JSON body
    let jsonData: any = {};
    try {
      jsonData = await request.json();
      console.log("JSON body:", JSON.stringify(jsonData, null, 2));
    } catch (jsonErr) {
      console.warn("Could not parse JSON body:", jsonErr);
    }

    // Start with whatever we got from JSON
    Object.assign(data, jsonData);

    // 2. Extract fields from query parameters as fallback
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Helper to safely get and convert query param
    const getQueryParam = (param: string): string | null => {
      const val = searchParams.get(param);
      return val === null ? null : val;
    };

    // Extract each field with fallback logic
    const fields = [
      { name: "title", type: "string" },
      { name: "link", type: "string" },
      { name: "price", type: "number" },
      { name: "score", type: "number" }, // keep existing score field for backward compatibility
      { name: "description", type: "string" },
      { name: "category", type: "string" },
      { name: "aiScore", type: "number" },
      { name: "aiReason", type: "string" },
    ];

    const queryValues: Record<string, any> = {};

    for (const { name, type } of fields) {
      const queryVal = getQueryParam(name);
      if (queryVal !== null) {
        // If we don't already have this field from JSON, use query param
        if (data[name] === undefined || data[name] === null) {
          if (type === "number") {
            const num = Number(queryVal);
            // Only assign if conversion succeeded (not NaN)
            if (!isNaN(num)) {
              data[name] = num;
            }
          } else {
            data[name] = queryVal;
          }
        }
        queryValues[name] = queryVal; // keep original string for logging
      }
    }

    console.log("SearchParams found:", queryValues);

    // Log what we finally have
    console.log("Final extracted data:", {
      title: data.title,
      link: data.link,
      price: data.price,
      score: data.score,
      description: data.description,
      category: data.category,
      aiScore: data.aiScore,
      aiReason: data.aiReason,
    });

    const authHeader = request.headers.get("authorization");
    const EXPECTED_TOKEN = "ammazkaAqzsed@123";

    if (!authHeader || !authHeader.includes(EXPECTED_TOKEN)) {
      console.warn("Unauthorized request. Returning 200 anyway for debugging.");
      return NextResponse.json({ success: false, message: "Unauthorized but returning 200 for debug", receivedAuth: authHeader }, { status: 200 });
    }

    // Check for missing required fields and log them, but don't fail
    const missingFields = [];
    if (!data.link) missingFields.push("link");
    if (!data.title) missingFields.push("title");

    if (missingFields.length > 0) {
      console.warn(`Warning: Missing fields in payload: ${missingFields.join(", ")}. Using defaults.`);
    }

    // Use safe defaults for all fields
    const safeLink = data.link || `no-link-${Date.now()}`;
    const safeTitle = data.title || "Untitled Product";
    const safePrice = data.price ? Number(data.price) : 0;
    const safeScore = data.score ? Number(data.score) : 0; // existing score field
    const safeCategory = data.category !== undefined && data.category !== null ? String(data.category) : "General";
    const safeAiScore = data.aiScore !== undefined && data.aiScore !== null ? Number(data.aiScore) : 0;
    const safeAiReason = data.aiReason !== undefined && data.aiReason !== null ? String(data.aiReason) : "";
    const safeNiche = data.niche !== undefined && data.niche !== null ? String(data.niche) : "General";

    const product = await prisma.product.upsert({
      where: {
        link: safeLink
      },
      update: {
        title: safeTitle,
        link: safeLink, // ensure link is stored (though where already uses it)
        price: safePrice,
        aiScore: safeAiScore,
        aiReason: safeAiReason,
        niche: safeNiche
      },
      create: {
        title: safeTitle,
        link: safeLink,
        price: safePrice,
        aiScore: safeAiScore,
        aiReason: safeAiReason,
        niche: safeNiche
      }
    });

    console.log("Saved product:", product.title);
    return NextResponse.json({ success: true, product, warnings: missingFields }, { status: 200 });

  } catch (error) {
    console.error("Fatal Error processing product:", error);
    // Return 200 as requested for debugging
    return NextResponse.json(
      { success: false, error: "Internal server error caught, returning 200", details: String(error) },
      { status: 200 }
    );
  }
}
