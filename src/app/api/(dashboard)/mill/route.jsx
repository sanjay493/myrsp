import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("rspdesk");

    // Calculate the last 30 days' date range
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const StartDate = thirtyDaysAgo.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const EndDate = today.toISOString().split("T")[0];
    console.log("Date Range:", StartDate, EndDate);

    const pipeline = [
        // Step 1: Unwind the 'units' array to access individual unit objects
        {
          $unwind: "$units",
        },
        // Step 2: Match only the relevant units (e.g., BF-1 and BF-5)
        {
          $match: {
            "units.name": { $in: ["PM", "NPM","HSM-2"] },
            rpt_date: {
              $gte: StartDate,
              $lte: EndDate,
            },
          },
        },
        // Step 3: Group by rpt_date and accumulate production for each unit
        {
          $group: {
            _id: "$rpt_date",
            PM: {
              $sum: {
                $cond: [{ $eq: ["$units.name", "PM"] }, "$units.ondt_prodn", 0],
              },
            },
            NPM: {
              $sum: {
                $cond: [{ $eq: ["$units.name", "NPM"] }, "$units.ondt_prodn", 0],
              },
            },
            
            HSM2: {
                $sum: {
                  $cond: [{ $eq: ["$units.name", "HSM-2"] }, "$units.ondt_prodn", 0],
                },
              },
          },
        },
        // Step 4: Project the final output
        {
          $project: {
            _id: 0,
            rpt_date: "$_id",
            PM: 1,
            NPM: 1,
            HSM2: 1,
          },
        },
        // Step 5: Sort by rpt_date in ascending order
        {
          $sort: { rpt_date: 1 },
        },
      ];
      
    
    // Fetch data from MongoDB
    const collection = db.collection("dly_prodn");
    const data = await collection.aggregate(pipeline).toArray();
    // console.log("Aggregated Data:", data);

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
