import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function POST(request) {
    const { 
        units = [],           // Array of selected units
        monthsRange = [],     // Array of months (e.g., ["01", "02", "03"])
        fyYearRange = [],     // Array of financial years (e.g., ["2022-23", "2023-24"])
        technoParameters = [] // Array of selected techno parameters (e.g., ["hcokeYield", "dryCoalCharge"])
      } = requestBody || {};
      
      // Validate and process the request
      if (!units.length || !monthsRange.length || !fyYearRange.length || !technoParameters.length) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters." }),
          { status: 400 }
        );
      }
      
      const [initialMonth, finalMonth] = monthsRange;
      const [initialYear, finalYear] = fyYearRange;
      const [defaultInitialMonth, defaultFinalMonth] = ["01", "12"];
      const [defaultInitialYear, defaultFinalYear] = ["2022-23", "2023-24"];

  
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("rspdesk");
const collection = db.collection("technoMatrics");   
    // Collection and query selection
  
    let query;
    let projectionFields;

   
        
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
console.log(roundedData)
    // Return JSON response
    return NextResponse.json({ data: roundedData });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
