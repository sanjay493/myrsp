import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

const dbName = "rspdesk";
const collectionName = "mthly_production";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    const pipeline = [
      { $sort: { mth: -1 } },
      { $unwind: "$unit" },
      {
        $addFields: {
          category: {
            $switch: {
              branches: [
                { case: { $in: ["$unit", ["BF-1", "BF-4", "BF-5"]] }, then: "BF-Shop" },
                { case: { $in: ["$unit", ["SP-1", "SP-2", "SP-3"]] }, then: "SP-Shop" },
                { case: { $in: ["$unit", ["SMS-1", "SMS-2"]] }, then: "SMS-Shop" },
                {
                  case: {
                    $in: ["$unit", ["PM", "NPM", "HRC-2", "HRP-2", "CRNO", "SW", "ERW"]],
                  },
                  then: "SS",
                },
              ],
              default: null,
            },
          },
        },
      },
      { $match: { category: { $ne: null } } },
      {
        $group: {
          _id: { category: "$category", mth: "$mth" },
          total_prodn: { $sum: "$prodn" },
        },
      },
      {
        $project: {
          unit: "$_id.category",
          mth: "$_id.mth",
          prodn: "$total_prodn",
          _id: 0,
        },
      },
    ];

    // Execute aggregation
    const aggregatedData = await db.collection(collectionName).aggregate(pipeline).toArray();

    // Fetch raw data
    const rawData = await db.collection(collectionName).find({}).toArray();

    // Combine raw and aggregated data
    const combinedData = [...rawData, ...aggregatedData];

   // Get unique months from the data
const uniqueMonths = [...new Set(combinedData.map((item) => item.mth))];

// Iterate through each unique month
uniqueMonths.forEach((mth) => {
  const cob6Data = combinedData.find((item) => item.unit === "COB-6Pushg" && item.mth === mth);
  const cob1Data = combinedData.find((item) => item.unit === "COB-1#5Pushg" && item.mth === mth);

  // Add entry for Eq_COBPushg only if data exists for the given month
  if (cob6Data && cob1Data) {
    combinedData.push({
      unit: "Eq_COBPushg",
      mth: mth,
      prodn: (cob1Data.prodn || 0) + 1.93 * (cob6Data.prodn || 0),
    });
  }
});

// console.log("combined",combinedData)
    // Get the highest production for each unit
    const highestProduction = combinedData.reduce((acc, curr) => {
      const { unit, prodn } = curr;

      if (!acc[unit] || prodn > acc[unit].prodn) {
        acc[unit] = curr;
      }

      return acc;
    }, {});

    // Convert highestProduction object to an array
    const highestProductionArray = Object.values(highestProduction);

    // Define unit order
    const unitOrder = [
      "COB-1#5Pushg", "COB-6Pushg", "Eq_COBPushg",
      "SP-1", "SP-2", "SP-3", "SP-Shop",
      "BF-1", "BF-4", "BF-5", "BF-Shop",
      "SMS-1", "SMS-2", "SMS-Shop", "Caster-3", "PM", "NPM",
      "HSM-1", "HSM-2", "HRC-1", "HRC-2", "HRP-1", "HRP-2",
      "SWP", "ERWP", "CRNO", "GS", "SS",
    ];

    // Sort by unit order
    const sortedData = highestProductionArray.sort((a, b) => {
      const indexA = unitOrder.indexOf(a.unit);
      const indexB = unitOrder.indexOf(b.unit);
      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });

    // Response
    return NextResponse.json({
      success: true,
      data: sortedData,
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
