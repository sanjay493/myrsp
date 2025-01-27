import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

const dbName = "rspdesk";
const dlyCollection = "dly_prodn";
const mthCollection = "mthly_production";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Parse and validate the request body
    const body = await request.json();
    console.log("Received Body:", body);

    // Ensure the request body is an array or an object
    const record = Array.isArray(body) ? body[0] : body;

    // Validation: Check for required fields
    const { rpt_date, units } = record;
    if (!rpt_date || !Array.isArray(units)) {
      return NextResponse.json(
        { error: "Missing or invalid required fields: `rpt_date` or `units`" },
        { status: 400 }
      );
    }

    // Validate and construct the `units` array
    const formattedUnits = units.map((unit) => {
      const { name, ...rest } = unit;
      if (!name) {
        throw new Error("Each unit must have a valid 'name' field.");
      }
      return { name, ...rest };
    });

    // Prepare the document to insert into `dly_prodn`
    const newRecord = { rpt_date, units: formattedUnits };
    console.log("New Record to Insert:", newRecord);

    // Insert the daily production record
    const result = await db.collection(dlyCollection).insertOne(newRecord);
    console.log("Inserted ID:", result.insertedId);

    // Extract month in `yyyymm` format from `rpt_date`
    const mth = rpt_date.slice(0, 7).replace("-", "");

    // Calculate production sum for each unit
    const unitProdMap = formattedUnits.reduce((acc, unit) => {
      if (unit.name && typeof unit.ondt_prodn === "number") {
        acc[unit.name] = (acc[unit.name] || 0) + unit.ondt_prodn;
      }
      return acc;
    }, {});

    console.log("Unit Production Map:", unitProdMap);

    // Update `mthly_production` for each unit
    const updatePromises = Object.entries(unitProdMap).map(async ([unit, prodn]) => {
      const filter = { unit, mth };
      const update = { $set: { prodn } };
      const options = { upsert: true }; // Create document if it doesn't exist
      return db.collection(mthCollection).updateOne(filter, update, options);
    });
console.log("Update Promises:", updatePromises);
    // Wait for all update operations to complete
    await Promise.all(updatePromises);

    // Respond with success and inserted ID
    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Error inserting data:", error.message);
    return NextResponse.json(
      { error: "Failed to insert data", details: error.message },
      { status: 500 }
    );
  }
}
