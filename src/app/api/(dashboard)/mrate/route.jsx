import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { act } from "react";

export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("rspdesk");

    // Calculate date range (last 30 days)
    const today = new Date();
    const yesterDay = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    yesterDay.setDate(today.getDate() - 1)



const formatedYesterday =yesterDay.toISOString().split("T")[0];

// Extract year and month
const year = yesterDay.getFullYear();
const month = (yesterDay.getMonth() + 1).toString().padStart(2, "0"); // Ensure 2-digit month

// Combine into yyyymm format
const monthYear = `${year}${month}`;
console.log(monthYear)

// Get the number of days in the target month
const daysInMonth = new Date(year, month, 0).getDate();

    const StartDate = thirtyDaysAgo.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const EndDate = today.toISOString().split("T")[0];
console.log(StartDate,EndDate)
const pipeline = [
  {
    $match: {
      rpt_date: {
        $eq: formatedYesterday, // Start date filter
       
      }
    }
  },
    // Step 3: Limit to the latest record
    // { $limit: 1 },
    // Step 4: Unwind the units array
    { $unwind: "$units" },
    // Step 5: Add categories for grouping
    {
        $addFields: {
          category: {
            $switch: {
              branches: [
                { case: { $in: ["$units.name", ["BF-1","BF-4","BF-5"]] }, then: "HotMetal" },
                { case: { $in: ["$units.name", ["SMS-1", "SMS-2"]] }, then: "Crude Steel" },
                {
                  case: {
                    $in: [
                      "$units.name",
                      ["PM", "NPM", "HRC-2", "HRP-2", "CRNO", "SW", "ERW"]
                    ]
                  },
                  then: "Saleable Steel"
                }
              ],
              default: null
            }
          }
        }
      }
      
    ,
    // Step 6: Filter out units not part of the required categories
    {
      $match: {
        category: { $ne: null }
      }
    },
    // Step 7: Group by category
    {
      $group: {
        _id: { category: "$category", rpt_date: "$rpt_date" },
        total_mrate: { $sum: "$units.mrate" },
        total_ondt_prodn: { $sum: "$units.ondt_prodn" },
        total_desprate: { $sum: "$units.desprate" },
        total_ondt_desp: { $sum: "$units.ondesp" }
      }
    },
    // Step 8: Format the output
    {
      $project: {
        rpt_date: "$_id.rpt_date",
        category: "$_id.category",
        mrate: "$total_mrate",
        ondt_prodn: "$total_ondt_prodn",
        desprate:"$total_desprate",
        ondt_desp: "$total_ondt_desp",
        _id: 0
      }
    }
  ];
  


  const pipeline_app = [
    { $match: {
      mth: {
        $eq: monthYear, // Start date filter
       
      }
    }},

      {
          $addFields: {
            category: {
              $switch: {
                branches: [
                  { case: { $in: ["$unit", ["BF-1","BF-4","BF-5"]] }, then: "HotMetal" },
                  { case: { $in: ["$unit", ["SMS-1", "SMS-2"]] }, then: "Crude Steel" },
                  {
                    case: {
                      $in: [
                        "$unit",
                        ["PM", "NPM", "HRC-2", "HRP-2", "CRNO", "SWP", "ERWP","GS"]
                      ]
                    },
                    then: "Saleable Steel"
                  }
                ],
                default: null
              }
            }
          }
        }
        
      ,
      // Step 6: Filter out units not part of the required categories
      {
        $match: {
          category: { $ne: null }
        }
      },
      // Step 7: Group by category
      {
        $group: {
          _id: { category: "$category", mth: "$mth" },
          app: { $sum: "$prodn" }
        }
      },
      // Step 8: Format the output
      {
        $project: {
          mth: "$_id.mth",
          category: "$_id.category",
          app: "$app",
          _id: 0
        }
      }
    ];
       // Fetch data from MongoDB
    const collection = db.collection("dly_prodn");
    const data = await collection.aggregate(pipeline).toArray();
    const data1 = await db.collection("mthly_production_app").aggregate(pipeline_app).toArray();
 
  // console.log(data,data1);
// // Combine the data
const combinedData = {
  rpt_date: data[0]?.rpt_date || null, // Use rpt_date from the actual dataset
  mth: data1[0]?.mth || null, // Use mth from the app dataset
  categories: data1.map(appItem => {
    const actualItem = data.find(act => act.category === appItem.category);
    return {
      name: appItem.category,
      app: ((appItem.app*1000)/daysInMonth).toFixed(0),
      ondt_prodn: actualItem?.ondt_prodn || 0, // Use `ondt_prodn` as `act` from the actual dataset
      mrate: actualItem?.mrate/daysInMonth || 0 , // Use `ondt_prodn` as `act` from the actual dataset
      ondt_desp: actualItem?.ondt_desp || 0,
      desprate: actualItem?.desprate/daysInMonth || 0 
    };
  })
};

console.log(combinedData);
// console.log(data)
    // Return the response
    return NextResponse.json({ data:combinedData });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
