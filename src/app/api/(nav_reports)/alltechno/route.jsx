import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET(request) {
  const client = await clientPromise;
  const db = client.db("rspdesk");
  const collection1 = db.collection("dataMetrics");

  const technoParameters = await collection1.aggregate([
    {
      $project: {
        metric: 1,
        description: 1,
        units: { $setUnion: ["$unit"] },
        _id: 0
      }
    }
  ]).toArray();

  return NextResponse.json({ technoParameters });
}


export async function POST(request) {
  try {
    const requestBody = await request.json();
    console.log(requestBody);
    const {
      units = [],
      yearmonthsRange = [],
      fyYearRange = [],
      technoParameters = [],
    } = requestBody;

    if (!units.length || (!yearmonthsRange.length && !fyYearRange.length) || !technoParameters.length) {
      return NextResponse.json(
        { error: "Missing required parameters." },
        { status: 400 }
      );
    }

    let initialMonth, finalMonth, initialYear, finalYear;

    if (yearmonthsRange.length === 2) {
      [initialMonth, finalMonth] = yearmonthsRange;
    }

    if (fyYearRange.length === 2) {
      [initialYear, finalYear] = fyYearRange;
    }
console.log("initialMonth :",initialMonth, "finalMonth :", finalMonth, "initialYear :",initialYear, "finalYear :", finalYear)
    const client = await clientPromise;
    const db = client.db("rspdesk");
    const collection = db.collection("technoMatrics");

    const rawData = await collection.aggregate([
      {
        $match: {
          $and: [
            { unit: { $in: units } },
            {
              $or: [
                { "period.mth": { $gte: initialMonth, $lte: finalMonth } },
                { "period.fyear": { $gte: initialYear, $lte: finalYear } },
              ],
            },
          ],
        },
      },
      {
        $project: {
          unit: 1,
          period: 1,
          technopara: {
            $objectToArray: "$technopara",
          },
        },
      },
      {
        $project: {
          unit: 1,
          period: 1,
          technopara: {
            $arrayToObject: {
              $filter: {
                input: "$technopara",
                as: "tech",
                cond: { $in: ["$$tech.k", technoParameters] },
              },
            },
          },
        },
      },
    ]).toArray();

    const dataMetrics = await db
      .collection("dataMetrics")
      .find({ metric: { $in: technoParameters } })
      .toArray();

    const metricDetailsMap = Object.fromEntries(
      dataMetrics.map((metric) => [
        metric.metric,
        { description: metric.description, measuringUnit: metric.measuringUnit },
      ])
    );

    const processedData = rawData.reduce((result, doc) => {
      const unit = doc.unit;
      if (!result[unit]) {
        result[unit] = { unit, metrics: {} };
      }

      Object.entries(doc.technopara).forEach(([key, value]) => {
        if (!result[unit].metrics[key]) {
          result[unit].metrics[key] = {
            description: metricDetailsMap[key]?.description || key,
            measuringUnit: metricDetailsMap[key]?.measuringUnit || "",
            values: [],
          };
        }
        result[unit].metrics[key].values.push({
          period: doc.period,
          value: value,
        });
      });

      return result;
    }, {});

    const finalData = Object.values(processedData).map((unitData) => ({
      unit: unitData.unit,
      metrics: Object.values(unitData.metrics),
    }));
    console.log(finalData);
    return NextResponse.json({ data: finalData });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
