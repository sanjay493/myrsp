import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

const dbName = "rspdesk";
const client = await clientPromise;
const db = client.db(dbName);

 // Define preferred order for units
 const unitOrder = [
  "COB-1#5Pushg", "COB-6Pushg", "Eq COB",
  "SP-1", "SP-2", "SP-3", "Total Sinter",
  "BF-1", "BF-4", "BF-5", "Total Hotmetal",
  "SMS-1", "SMS-2", "Total Crude Steel", "Caster-3","PM","NPM","HSM-1","HSM-2","HRC-1","HRC-2","HRP-1","HRP-2","SWP","ERWP","CRNO","GS","SS","SS_Total"
  // Add more units in your desired order here
];


export async function POST(request) {

async function additionalRowInPerformance(newArrayData, weightsArray, newRowName) {
  if (newArrayData.length !== weightsArray.length) {
    throw new Error("The length of newArrayData and weightsArray must be the same.");
  }

  const additionalRowData = newArrayData.reduce(
    (acc, unit, index) => {
      const weight = weightsArray[index];
      acc.outData += (map1.get(unit) || 0) * weight;
      acc.outData += (map2.get(unit) || 0) * weight;
      acc.outData += (map3.get(unit) || 0) * weight;
      
      return acc;
    },
    {
      app: 0,
      actual: 0,
      cply: 0,
      
    }
  );
  // Add a label for the additional row
  additionalRowData.unit = newRowName;

  return additionalRowData; // Return the calculated row data
}
// Function to fetch data for different collections with mth1 and mth2
async function fetchDataForCollection(collectionName, mth1, mth2, x) {
  return await db.collection(collectionName).aggregate([
    {
      $match: {
        mth: { $gte: mth1, $lte: mth2 }
      }
    },
    {
      $addFields: {
        // Convert mth (yyyymm) to a proper date
        mthDate: {
          $dateFromString: {
            dateString: { $concat: [`$mth`, "01"] },
            format: "%Y%m%d"
          }
        }
      }
    },
    {
      $addFields: {
        daysInMonth: {
          // Calculate days in the month dynamically
          $let: {
            vars: {
              startOfNextMonth: {
                $dateFromParts: {
                  year: { $year: "$mthDate" },
                  month: { $add: [{ $month: "$mthDate" }, 1] },
                  day: 1
                }
              }
            },
            in: {
              $subtract: [
                { $toLong: "$$startOfNextMonth" },
                { $toLong: "$mthDate" }
              ]
            }
          }
        }
      }
    },
    {
      $group: {
        _id: "$unit",
        // Use dynamically calculated daysInMonth for weighted sum
        weightedSum: { $sum: { $multiply: ["$prodn", "$daysInMonth"] } },
        totalDays: { $sum: "$daysInMonth" }, // Adjusted to use daysInMonth
        normalSum: { $sum: "$prodn" }
      }
    },
    {
      $addFields: {
        weightedAverage: { $divide: ["$weightedSum", "$totalDays"] }
      }
    },
    {
      $addFields: {
        outData: {
          $cond: {
            if: { $in: ["$_id", ["COB-6Pushg", "COB-1#5Pushg"]] },
            then: "$weightedAverage",
            else: { $divide: ["$normalSum",x]}
          }
        }
      }
    },
    {
      $project: {
      
        outData: 1
      }
    }
  ]).toArray();
}


  try {
    let { mth1, mth2 } = await request.json();
console.log("mth1: ",mth1,"mth2: ",mth2)
  
    
    // Fetch data for the specified collection
    const result1 = await fetchDataForCollection("mthly_production_app", mth1, mth2,1);
    const result2 = await fetchDataForCollection("mthly_production", mth1, mth2,1000);
    const result3 = await fetchDataForCollection("mthly_production", `${parseInt(mth1) - 100}`, `${parseInt(mth2) - 100}`,1000);
    
    
  
      // Convert each result array into a map for easier lookup by unit (key: unit, value: outData)
      const map1 = new Map(result1.map(item => [item._id, item.outData]));
      const map2 = new Map(result2.map(item => [item._id, item.outData]));
      const map3 = new Map(result3.map(item => [item._id, item.outData]));
      // console.log("map1: ",map1,"map2: ",map2,"map3: ",map3)
    

     
      // Combine keys from all maps to ensure all units are included
      const allUnits = new Set([...map1.keys(), ...map2.keys(), ...map3.keys()]);
    
      // Create the combined dataset
      const combinedData = Array.from(allUnits).map(unit => ({
        unit, // Unit name
        app: map1.get(unit) || 0, // Default to 0 if not found in result1
        actual: map2.get(unit) || 0, // Default to 0 if not found in result2
        cply: map3.get(unit) || 0, // Default to 0 if not found in result3
      }));
      
      // Add group logic
      const groupedData = [
        {
          groupUnit: "Total Sinter",
          units: ["SP-1", "SP-2", "SP-3"],
          calculate: (units) => ({
            app: units.reduce((sum, unit) => sum + (map1.get(unit) || 0), 0),
            actual: units.reduce((sum, unit) => sum + (map2.get(unit) || 0), 0),
            cply: units.reduce((sum, unit) => sum + (map3.get(unit) || 0), 0),
          }),
        },
        {
          groupUnit: "Total Hotmetal",
          units: ["BF-1", "BF-4", "BF-5"],
          calculate: (units) => ({
            app: units.reduce((sum, unit) => sum + (map1.get(unit) || 0), 0),
            actual: units.reduce((sum, unit) => sum + (map2.get(unit) || 0), 0),
            cply: units.reduce((sum, unit) => sum + (map3.get(unit) || 0), 0),
          }),
        },
        {
          groupUnit: "Total Crude Steel",
          units: ["SMS-1", "SMS-2"],
          calculate: (units) => ({
            app: units.reduce((sum, unit) => sum + (map1.get(unit) || 0), 0),
            actual: units.reduce((sum, unit) => sum + (map2.get(unit) || 0), 0),
            cply: units.reduce((sum, unit) => sum + (map3.get(unit) || 0), 0),
          }),
        },
        {
          groupUnit: "Saleable Steel",
          units: ["PM", "NPM", "HRP-1","HRP-2","HRC-1","HRC-2","CRNO",'SWP','ERWP','GS'],
          calculate: (units) => ({
            app: units.reduce((sum, unit) => sum + (map1.get(unit) || 0), 0),
            actual: units.reduce((sum, unit) => sum + (map2.get(unit) || 0), 0),
            cply: units.reduce((sum, unit) => sum + (map3.get(unit) || 0), 0),
          }),
        },
        {
          groupUnit: "Eq COB",
          units: ["COB-1#5Pushg", "COB-6Pushg"],
          calculate: (units) => ({
            app:
              (map1.get("COB-1#5Pushg") || 0) * 1 +
              (map1.get("COB-6Pushg") || 0) * 1.93,
            actual:
              (map2.get("COB-1#5Pushg") || 0) * 1 +
              (map2.get("COB-6Pushg") || 0) * 1.93,
            cply:
              (map3.get("COB-1#5Pushg") || 0) * 1 +
              (map3.get("COB-6Pushg") || 0) * 1.93,
          }),
        },
      ];
      
      // Compute data for group units
      const groupResults = groupedData.map(({ groupUnit, units, calculate }) => {
        const values = calculate(units);
        return {
          unit: groupUnit,
          app: values.app,
          actual: values.actual,
          cply: values.cply,
        };
      });
      
      // Merge individual unit data with grouped data
      const finalData = [...combinedData, ...groupResults];
      
       // Sort the filtered data array by the predefined unit order
       finalData.sort((a, b) => {
    const indexA = unitOrder.indexOf(a.unit);
    const indexB = unitOrder.indexOf(b.unit);
  
    // If a unit is not in the order list, keep it at the end
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
  
    return indexA - indexB;
  });
      
    
      
    
    // Return the response
    return NextResponse.json({ success: true, data: finalData });

  } catch (error) {
    console.error("Error fetching data:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
