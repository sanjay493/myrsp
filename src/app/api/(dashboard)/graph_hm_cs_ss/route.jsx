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
console.log(StartDate,EndDate)
    const pipeline = [
      {
        $match: {
          rpt_date: {
            $gte: StartDate,
            $lte: EndDate,
          },
        },
      },
      {
        $project: {
          rpt_date: 1,
          bfShopOndtProdn: {
            $reduce: {
              input: {
                $filter: {
                  input: "$units",
                  as: "unit",
                  cond: { $eq: ["$$unit.name", "BF-Shop"] },
                },
              },
              initialValue: 0,
              in: { $add: ["$$value", "$$this.ondt_prodn"] },
            },
          },
          smsSumOndtProdn: {
            $reduce: {
              input: {
                $filter: {
                  input: "$units",
                  as: "unit",
                  cond: {
                    $or: [
                      { $eq: ["$$unit.name", "SMS-1"] },
                      { $eq: ["$$unit.name", "SMS-2"] },
                    ],
                  },
                },
              },
              initialValue: 0,
              in: { $add: ["$$value", "$$this.ondt_prodn"] },
            },
          },
          finishedSteelOndtProdn: {
            $reduce: {
              input: {
                $filter: {
                  input: "$units",
                  as: "unit",
                  cond: {
                    $or: [
                      { $eq: ["$$unit.name", "PM"] },
                      { $eq: ["$$unit.name", "NPM"] },
                      { $eq: ["$$unit.name", "HRC-2"] },
                      { $eq: ["$$unit.name", "HRP-2"] },
                      { $eq: ["$$unit.name", "SW"] },
                      { $eq: ["$$unit.name", "ERW"] },
                      { $eq: ["$$unit.name", "CRNO"] },
                    ],
                  },
                },
              },
              initialValue: 0,
              in: { $add: ["$$value", "$$this.ondt_prodn"] },
            },
          },
          
        },
      },
      {
        $sort: { rpt_date: 1 },
      },
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
