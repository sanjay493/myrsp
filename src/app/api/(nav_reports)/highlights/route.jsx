import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("rspdesk");
    const data = await db.collection("mthly_production").find().toArray();

    // Predefined order of units
    const unitOrder = [
      "COB-1#5Pushg", "COB-6Pushg", "Eq COB",
      "SP-1", "SP-2", "SP-3", "SP-Shop",
      "BF-1", "BF-4", "BF-5", "BF-Shop",
      "SMS-1", "SMS-2", "SMS-Shop", "Caster-3",
      "PM", "NPM", "HSM-1", "HSM-2", "HRC-1",
      "HRC-2", "HRP-1", "HRP-2", "SWP", "ERWP",
      "CRNO", "GS", "SS"
      // Add more units in your desired order here
    ];

    // Organize data by unit and calendar month
    const unitWiseBestPerformance = {};
    const calendarMonthPerformancePerUnit = {};

    data.forEach((record) => {
      const { unit, mth, prodn } = record;
      const calendarMonth = mth.slice(4); // Extract '04', '05', etc.

      // Find the best month for each unit overall
      if (
        !unitWiseBestPerformance[unit] ||
        prodn > unitWiseBestPerformance[unit].prodn
      ) {
        unitWiseBestPerformance[unit] = { mth, prodn };
      }

      // Organize data by calendar month for each unit
      if (!calendarMonthPerformancePerUnit[unit]) {
        calendarMonthPerformancePerUnit[unit] = {};
      }
      if (!calendarMonthPerformancePerUnit[unit][calendarMonth]) {
        calendarMonthPerformancePerUnit[unit][calendarMonth] = [];
      }

      // Push all records for the unit and month into an array for sorting
      calendarMonthPerformancePerUnit[unit][calendarMonth].push({ mth, prodn });
    });

    // Process the data to find the best and second-best production
    const bestCalendarMonthWithComparison = {};
    Object.entries(calendarMonthPerformancePerUnit).forEach(([unit, months]) => {
      const sortedMonths = Object.entries(months)
        .map(([month, records]) => {
          // Sort records by production in descending order
          const sortedRecords = records.sort((a, b) => b.prodn - a.prodn);

          // Extract the best and second-best records
          const best = sortedRecords[0];
          const secondBest = sortedRecords[1] || { mth: null, prodn: null };

          return {
            ...best,
            month,
            secondBestMth: secondBest.mth,
            secondBestProdn: secondBest.prodn,
          };
        })
        // Sort months in the desired order
        .sort((a, b) => {
          const customOrder = [
            "04", "05", "06", "07", "08", "09", "10", "11", "12", "01", "02", "03",
          ];
          return customOrder.indexOf(a.month) - customOrder.indexOf(b.month);
        });

      bestCalendarMonthWithComparison[unit] = sortedMonths;
    });

    // Sort unit-wise data in the predefined order
    const sortedUnitWiseBestPerformance = Object.fromEntries(
      Object.entries(unitWiseBestPerformance).sort(([unitA], [unitB]) => {
        const indexA = unitOrder.indexOf(unitA);
        const indexB = unitOrder.indexOf(unitB);

        // Units not in the predefined order will appear at the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      })
    );

    const sortedBestCalendarMonthWithComparison = Object.fromEntries(
      Object.entries(bestCalendarMonthWithComparison).sort(([unitA], [unitB]) => {
        const indexA = unitOrder.indexOf(unitA);
        const indexB = unitOrder.indexOf(unitB);

        // Units not in the predefined order will appear at the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      })
    );

    // Return the response
    return NextResponse.json({
      unitWiseBestPerformance: sortedUnitWiseBestPerformance,
      bestCalendarMonthWithComparison: sortedBestCalendarMonthWithComparison,
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
