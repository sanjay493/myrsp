import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

const dbName = "rspdesk";
const collectionName = "yearly_production";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    const fiscalYearMapping = {
      
      "2019-20": 366,
      
      "2023-24": 366,
     
    };
    const pipeline = [
      {
        $addFields: {
          days_in_fy: {
            $switch: {
              branches: Object.keys(fiscalYearMapping).map((fy) => ({
                case: { $eq: ["$fy_year", fy] },
                then: fiscalYearMapping[fy],
              })),
              default: 365,
            },
          },
        },
      },
      {
        $addFields: {
          modified_prodn: {
            $cond: {
              if: { $regexMatch: { input: "$unit", regex: /^COB-/ } },
              then: { $divide: ["$prodn", "$days_in_fy"] },
              else: "$prodn",
            },
          },
        },
      },
      {
        $addFields: {
          category: {
            $switch: {
              branches: [
                { case: { $in: ["$unit", ["COB-1Pushg", "COB-2Pushg", "COB-3Pushg", "COB-4Pushg", "COB-5Pushg"]] }, then: "COB-1#5Pushg" },
                { case: { $in: ["$unit", ["BF-1", "BF-4", "BF-5"]] }, then: "BF-Shop" },
                { case: { $in: ["$unit", ["SP-1", "SP-2", "SP-3"]] }, then: "SP-Shop" },
                { case: { $in: ["$unit", ["SMS-1", "SMS-2"]] }, then: "SMS-Shop" },
                { case: { $in: ["$unit", ["PM", "NPM", "HRC-2", "HRP-2", "CRNO", "SW", "ERW"]] }, then: "SS" },
              ],
              default: "$unit",
            },
          },
        },
      },
      // Preserve individual unit-level data while grouping by fy_year and category
      {
        $group: {
          _id: { fy_year: "$fy_year", category: "$category", unit: "$unit" },
          totalModifiedProdn: { $sum: "$modified_prodn" },
        },
      },
      // Add category-level data by grouping again at fy_year and category level
      {
        $group: {
          _id: { fy_year: "$_id.fy_year", category: "$_id.category" },
          units: { $push: { unit: "$_id.unit", prodn: "$totalModifiedProdn" } },
          totalModifiedProdn: { $sum: "$totalModifiedProdn" },
        },
      },
      // Perform calculations for COB_1#5Pushg and COB-6Pushg
      {
        $group: {
          _id: "$_id.fy_year",
          data: { $push: { category: "$_id.category", units: "$units", final_prodn: "$totalModifiedProdn" } },
          COB_1_5: {
            $sum: {
              $cond: [
                { $eq: ["$_id.category", "COB-1#5Pushg"] },
                "$totalModifiedProdn",
                0,
              ],
            },
          },
          COB_6: {
            $sum: {
              $cond: [
                { $eq: ["$_id.category", "COB-6Pushg"] },
                "$totalModifiedProdn",
                0,
              ],
            },
          },
        },
      },
      // Add Eq_COBPushg data
      {
        $addFields: {
          data: {
            $concatArrays: [
              "$data",
              [
                {
                  category: "Eq_COBPushg",
                  final_prodn: { $add: ["$COB_1_5", { $multiply: ["$COB_6", 1.93] }] },
                  units: [], // No unit-specific data for the combined category
                },
              ],
            ],
          },
        },
      },
      {
        $unwind: "$data",
      },
      // Flatten the output to include fy_year, unit, category, and production
      {
        $project: {
          fy_year: "$_id",
          unit: {
            $concatArrays: [
              "$data.units.unit", // Original units
              [{ $ifNull: ["$data.category", null] }] // Add the modified category as a unit
            ],
          },
          prodn: {
            $concatArrays: [
              "$data.units.prodn", // Original production values
              [{ $ifNull: ["$data.final_prodn", null] }] // Add the total production for the category
            ],
          },
          _id: 0,
        },
      },
      {
        $unwind: {
          path: "$unit",
          includeArrayIndex: "unitIndex", // Keep track of the index for corresponding prodn
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          prodn: { $arrayElemAt: ["$prodn", "$unitIndex"] }, // Match production to the correct unit
        },
      },
      {
        $project: {
          fy_year: 1,
          unit: 1,
          prodn: 1,
        },
      },
      {
        $sort: { fy_year: 1, unit: 1 },
      }
,      
      
    ];
    
    
    
    
    
    

    // Execute aggregation
    const aggregatedData = await db.collection(collectionName).aggregate(pipeline).toArray();
// console.log("1",aggregatedData)
// Get the highest production for each unit
const highestProduction = aggregatedData.reduce((acc, curr) => {
  const { unit, prodn } = curr;

  // If the unit doesn't exist in the accumulator or the current prodn is higher, update it
  if (!acc[unit] || prodn > acc[unit].prodn) {
    acc[unit] = curr;
  }

  return acc;
}, {});

// console.log(highestProduction)
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
// Filter to include only units present in the unitOrder array
const filteredAndSortedData = highestProductionArray
  .filter(item => unitOrder.includes(item.unit)) // Keep only units in unitOrder
  .sort((a, b) => {
    const indexA = unitOrder.indexOf(a.unit);
    const indexB = unitOrder.indexOf(b.unit);

    // Sort based on their order in the unitOrder list
    return indexA - indexB;
  });


    // Response
    return NextResponse.json({
      success: true,
      data: filteredAndSortedData,
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
