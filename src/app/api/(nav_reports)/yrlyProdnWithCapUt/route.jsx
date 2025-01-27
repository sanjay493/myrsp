import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId utility

const dbName = "rspdesk";
// Define preferred order for units
const unitOrder = [
  "COB-1#5Pushg", "COB-6Pushg", "Eq COB",
  "SP-1", "SP-2", "SP-3", "Total Sinter",
  "BF-1", "BF-4", "BF-5", "Total Hotmetal",
  "SMS-1", "SMS-2", "Total Crude Steel", "Caster-3","PM","NPM","HSM-1","HSM-2","HRC-1","HRC-2","HRP-1","HRP-2","SWP","ERWP","CRNO","GS","SS"
  // Add more units in your desired order here
];

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Define the collections
    const capacityCollection = "unit_capacity";
    const productionCollection = "yearly_production";
    // Helper to calculate days in a fiscal year
    const calculateDaysInFY = (fy_year) => {
      const startYear = parseInt(fy_year.split("-")[0]);
      const startDate = new Date(`${startYear}-04-01`);
      const endDate = new Date(`${startYear + 1}-03-31`);
      return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    };

    // Fetch data from the capacity collection
    const capacityData = await db
      .collection(capacityCollection)
      .find({})
      .toArray();

    // Fetch data from the production collection
    const productionData = await db
  .collection(productionCollection)
  .aggregate([
    {
      $match: {
        fy_year: { $gte: "2017-18" }
      }
    },
    {
      $addFields: {
        unit: {
          $cond: {
            if: {
              $in: [
                "$unit",
                ["COB-1Pushg", "COB-2Pushg", "COB-3Pushg", "COB-4Pushg", "COB-5Pushg"]
              ]
            },
            then: "COB-1#5Pushg",
            else: "$unit"
          }
        }
      }
    },
    {
      $group: {
        _id: { unit: "$unit", fy_year: "$fy_year" },
        prodn: { $sum: "$prodn" },
        otherFields: { $push: "$$ROOT" } // Optional: Include other fields if needed
      }
    },
    {
      $project: {
        unit: "$_id.unit",
        fy_year: "$_id.fy_year",
        prodn: 1,
        _id: 0
      }
    }
  ])
  .toArray();

  




    // Merge the data based on the `unit` field
    const mergedData = capacityData.map((capacityItem) => {
      const matchingProductions = productionData
        .filter((prodItem) => prodItem.unit === capacityItem.unit)
        .map((prodItem) => ({
          fy_year: prodItem.fy_year,
          prodn:  ["COB-6Pushg", "COB-1#5Pushg"].includes(prodItem.unit) 
          ? (prodItem.prodn / calculateDaysInFY(prodItem.fy_year)).toFixed(2)
          : prodItem.prodn,
          percentCU: capacityItem.capacity
            ? (( ["COB-6Pushg", "COB-1#5Pushg"].includes(prodItem.unit) ? prodItem.prodn / (calculateDaysInFY(prodItem.fy_year)*capacityItem.capacity) : prodItem.prodn / capacityItem.capacity/1000000) * 100).toFixed(2)
            : null, // Calculate %CU if capacity is available
        }));

      return {
        unit: capacityItem.unit,
        capacity: capacityItem.capacity,
        productionData: matchingProductions,
      };
    });

  // Sort the filtered data array by the predefined unit order
  mergedData.sort((a, b) => {
    const indexA = unitOrder.indexOf(a.unit);
    const indexB = unitOrder.indexOf(b.unit);
  
    // If a unit is not in the order list, keep it at the end
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
  
    return indexA - indexB;
  });

    // Return the merged data
    return NextResponse.json({
      success: true,
      data: mergedData,
    });
  } catch (error) {
    console.error("Error fetching and merging data:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
