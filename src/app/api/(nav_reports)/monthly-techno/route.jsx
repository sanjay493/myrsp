import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function POST(request) {
  const requestBody = await request.json();
  const { initialMonth, finalMonth, initialYear, finalYear } = requestBody || {};

  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");

  const defaultFinalMonth = `${year}${month}`;
  const defaultInitialMonth = `${month >= "04" ? year : year - 1}04`;

  const defaultFinalYear = year.toString();
  const defaultInitialYear = (year - 5).toString();

  // Determine whether to query monthly or yearly data
  const isYearly = requestBody && (initialYear || finalYear || !initialMonth);


  const selectedInitialMonth = initialMonth || defaultInitialMonth;
  const selectedFinalMonth = finalMonth || defaultFinalMonth;

  const selectedInitialYear = initialYear || defaultInitialYear;
  const selectedFinalYear = finalYear || defaultFinalYear;

  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("rspdesk");

    // Collection and query selection
    let collection;
    let query;
    let projectionFields;

    if (isYearly) {
      collection = db.collection("yrly_techno");
      query = { yyyy: { $gte: selectedInitialYear, $lte: selectedFinalYear } };
      projectionFields = {
        Equip: 1,
        yyyy: 1,
        production: 1,
        productivity_WV: 1,
        AVPerc: 1,
        UtPerc: 1,
        cokeRate: 1,
        cdiRate: 1,
        nutCokeRate: 1,
        fuelRate: 1,
        carbonRate: 1,
        pelletRate_dry: 1,
        IBRM_Rate_dry: 1,
        sinterPercinBurden_dry: 1,
        pelletPercinBurden_dry: 1,
        slagRate: 1,
        avgHBT: 1,
        oxygenEnrichmentPerc: 1,
        siAvg: 1,
        sAvg:1,
      };
    } else {
      collection = db.collection("mthly_techno");
      query = { mth: { $gte: selectedInitialMonth, $lte: selectedFinalMonth } };
      projectionFields = {
        Equip: 1,
        mth: 1,
        production: 1,
        productivity_WV: 1,
        AVPerc: 1,
        UtPerc: 1,
        cokeRate: 1,
        cdiRate: 1,
        nutCokeRate: 1,
        fuelRate: 1,
        carbonRate: 1,
        pelletRate_dry: 1,
        IBRM_Rate_dry: 1,
        sinterPercinBurden_dry: 1,
        pelletPercinBurden_dry: 1,
        slagRate: 1,
        avgHBT: 1,
        oxygenEnrichmentPerc: 1,
        siAvg: 1,
        sAvg:1,
      };
    }

    // Fetch data from the selected collection
    const data = await collection.find(query).project(projectionFields).toArray();

    // Function to round numeric fields to two decimal places
    const roundNumericFields = (doc) => {
      Object.keys(doc).forEach((key) => {
        if (typeof doc[key] === "number") {
          doc[key] = parseFloat(doc[key].toFixed(2));
        }
      });
      return doc;
    };

    // Apply rounding to each document
    const roundedData = data.map(roundNumericFields);

    // Return JSON response
    return NextResponse.json({ data: roundedData });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
