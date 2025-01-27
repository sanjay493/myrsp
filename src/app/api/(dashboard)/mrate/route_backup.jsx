import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("rspdesk");

    // Calculate date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const StartDate = thirtyDaysAgo.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const EndDate = today.toISOString().split("T")[0];
//console.log(StartDate,EndDate)
    const pipeline = [
      // Step 1: Filter for the current month
  {
    $match: {
      rpt_date: {
        $regex: '^2024-11' // Matches any date starting with "2024-11"
      }
    }
  },
  // Step 2: Sort by rpt_date in descending order
  { $sort: { rpt_date: -1 } },
  // Step 3: Limit to the latest record
  { $limit: 1 },
  // Step 4: Unwind the units array
  { $unwind: "$units" },
  // Step 5: Filter units by your specific requirements
  {
    $match: {
      $or: [
        { "units.name": "BF-Shop" },
        { "units.name": { $in: ["SMS-1", "SMS-2"] } },
        { "units.name": { $in: ["PM", "NPM", "HRC-2", "HRP-2", "ERW", "SW", "CRNO"] } }
      ]
    }
  },
  // Step 6: Group or project the required fields
  {
    $group: {
      _id: {date:"$rpt_date", unit:"$units.name"},
      mrate: { $sum: "$units.mrate" },
      ondt_prodn: { $sum: "$units.ondt_prodn" },
     
    }
  },
  // Step 7: Format the output as desired
  {
    $project: {
      rpt_date: "$_id.date",
      unit: "$_id.unit",
      mrate: 1,
      ondt_prodn: 1,
      _id: 0
    }
  }
    ];

       // Fetch data from MongoDB
    const collection = db.collection("dly_prodn");
    const data = await collection.aggregate(pipeline).toArray();
//console.log(data)
    // Return the response
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
