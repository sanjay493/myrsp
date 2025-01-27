import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

const dbName = "rspdesk";
const collectionName = "dly_prodn";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    const pipeline = [
      { $sort: { rpt_date: -1 } },
      { $unwind: "$units" },
      {
        $addFields: {
          category: {
            $switch: {
              branches: [
                { case: { $in: ["$units.name", ["BF-1", "BF-4", "BF-5"]] }, then: "BF-Shop" },
                { case: { $in: ["$units.name", ["SP-1", "SP-2", "SP-3"]] }, then: "SP-Shop" },
                { case: { $in: ["$units.name", ["SMS-1", "SMS-2"]] }, then: "SMS-Shop" },
                {
                  case: {
                    $in: ["$units.name", ["PM", "NPM", "HRC-2", "HRP-2", "CRNO", "SW", "ERW"]]
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
          _id: { category: "$category", rpt_date: "$rpt_date" },
          total_ondt_prodn: { $sum: "$units.ondt_prodn" },
          total_ondt_desp: { $sum: "$units.ondesp" },
        },
      },
      {
        $project: {
          
          name: "$_id.category",
          ondt_prodn: "$total_ondt_prodn",
          ondt_desp: "$total_ondt_desp",
          _id: 0,
        },
      },
    ];

    // Execute aggregation
    const aggregatedData = await db.collection(collectionName).aggregate(pipeline).toArray();

    // Fetch raw data (if needed)
    const rawData = await db.collection(collectionName).find({}).toArray();

 // Integrate `aggregatedData` into the `units` array of `rawData`
 const updatedData = rawData.map((entry) => {
  // Add aggregated data into the units array
  const updatedUnits = [
    ...entry.units,
    ...aggregatedData.map((agg) => ({
      name: agg.name,
      ondt_prodn: agg.ondt_prodn,
      ondt_desp: agg.ondt_desp,
    })),
  ];

  return { ...entry, units: updatedUnits };
});



    // Track highest production values for units
    const highestProduction = {};
    updatedData.forEach((entry) => {
      (entry.units || []).forEach((unit) => {
        if (
          !highestProduction[unit.name] ||
          unit.ondt_prodn > highestProduction[unit.name].ondt_prodn
        ) {
          highestProduction[unit.name] = {
            rpt_date: entry.rpt_date,
            ondt_prodn: unit.ondt_prodn,
          };
        }
      });
    });

    const unitOrder = [
      "COB-1#5Pushg", "COB-6Pushg", "Eq_COBPushg",
      "SP-1", "SP-2", "SP-3", "SP-Shop",
      "BF-1", "BF-4", "BF-5", "BF-Shop",
      "SMS-1", "SMS-2", "SMS-Shop", "Caster-3","PM","NPM","HSM-1","HSM-2","HRC-1","HRC-2","HRP-1","HRP-2","SW","ERW","CRNO","GS","SS"
      // Add more units in your desired order here
    ];
    
    // Sort the highest production data
  const sortedData = Object.fromEntries(
    Object.entries(highestProduction).sort(([keyA], [keyB]) => {
      const indexA = unitOrder.indexOf(keyA);
      const indexB = unitOrder.indexOf(keyB);
    
      // If a unit is not in the order list, keep it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
    
      return indexA - indexB;
    }));
    
    const transformedData = Object.keys(sortedData).map(unit => ({
      unit: unit,
      rpt_date: sortedData[unit].rpt_date,
      prodn: sortedData[unit].ondt_prodn
    }));


    // Response
    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
