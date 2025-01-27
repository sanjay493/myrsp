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
    //console.log("Date Range:", StartDate, EndDate);

    const pipeline = [
      // Step 1: Unwind the 'units' array to access individual unit objects
      {
        $unwind: "$units",
      },
      // Step 2: Match only the relevant units (e.g., SMS-1 and SMS-2)
      {
        $match: {
          "units.name": { $in: ["SMS-1", "SMS-2"] },
          rpt_date: {
            $gte: StartDate,
            $lte: EndDate,
          },
        },
      },
      // Step 3: Project the desired fields
      {
        $project: {
          rpt_date: 1,
        
          ondt_pblow: "$units.ondt_pblow",
          ondt_qblow: "$units.ondt_qblow",
          ondt_ablow: "$units.ondt_ablow",
          ondt_bblow: "$units.ondt_bblow",
          ondt_cblow: "$units.ondt_cblow",
        },
      },
      // Step 4: Optionally group by rpt_date and unit if needed
      // For example, you can aggregate by date:
      {
        $group: {
          _id: { rpt_date: "$rpt_date" },
          ondt_pblow: { $sum: "$ondt_pblow" }, // If summing is required
          ondt_qblow: { $sum: "$ondt_qblow" }, // If summing is required
          ondt_ablow: { $sum: "$ondt_ablow" }, // If summing is required
          ondt_bblow: { $sum: "$ondt_bblow" }, // If summing is required
          ondt_cblow: { $sum: "$ondt_cblow" }, // If summing is required
        },
      },
      // Step 5: Format the output
      {
        $project: {
          rpt_date: "$_id.rpt_date",
        
          ondt_pblow: 1,
          ondt_qblow: 1,
          ondt_ablow: 1,
          ondt_bblow: 1,
          ondt_cblow: 1,
          _id: 0,
        }},
        // Step 6: Sort by rpt_date in ascending order
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
