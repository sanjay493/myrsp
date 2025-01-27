// app/api/monthly-performance
import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { CalculateTillMthPerformance } from '@/components/custom/calculatetillmthperformance';

export async function POST(request) {
  let { mth } = await request.json();

  // Define preferred order for units
  const unitOrder = [
    "COB-1#5Pushg", "COB-6Pushg", "Eq COB",
    "SP-1", "SP-2", "SP-3", "Total Sinter",
    "BF-1", "BF-4", "BF-5", "Total Hotmetal",
    "SMS-1", "SMS-2", "Total Crude Steel", "Caster-3","PM","NPM","HSM-1","HSM-2","HRC-1","HRC-2","HRP-1","HRP-2","SWP","ERWP","CRNO","GS","SS"
    // Add more units in your desired order here
  ];
async function additionalRowInPerformance(newArrayData, weightsArray, newRowName) {
    if (newArrayData.length !== weightsArray.length) {
      throw new Error("The length of newArrayData and weightsArray must be the same.");
    }
  
    const additionalRowData = newArrayData.reduce(
      (acc, unit, index) => {
        const weight = weightsArray[index];
        acc.APP += (appMap.get(unit) || 0) * weight;
        acc.OPP += (oppMap.get(unit) || 0) * weight;
        acc.Actual += (actualMap.get(unit) || 0) * weight;
        acc.cply += (cplyMap.get(unit) || 0) * weight;
        acc.FYAPP_total += (fyAppMap.get(unit) || 0) * weight;
        acc.FYActual_total += (fyActualMap.get(unit) || 0) * weight;
        acc.FY_CPLY_total += (prevFyMap.get(unit) || 0) * weight;
        return acc;
      },
      {
        APP: 0,
        OPP: 0,
        Actual: 0,
        cply: 0,
        FYAPP_total: 0,
        FYActual_total: 0,
        FY_CPLY_total: 0
      }
    );
  
    // Calculate derived values for the additional row
    additionalRowData.ffApp = additionalRowData.APP ? ((additionalRowData.Actual / additionalRowData.APP) * 100) : '';
    additionalRowData.ffOpp = additionalRowData.OPP ? ((additionalRowData.Actual / additionalRowData.OPP) * 100) : '';
    additionalRowData.growth = additionalRowData.cply ? (((additionalRowData.Actual - additionalRowData.cply) / additionalRowData.cply) * 100) : '';
    additionalRowData.FF_FY = additionalRowData.FYAPP_total ? ((additionalRowData.FYActual_total / additionalRowData.FYAPP_total) * 100) : '';
    additionalRowData.FY_Growth = additionalRowData.FY_CPLY_total ? (((additionalRowData.FYActual_total - additionalRowData.FY_CPLY_total) / additionalRowData.FY_CPLY_total) * 100) : '';
  
    // Add a label for the additional row
    additionalRowData.unit = newRowName;

    return additionalRowData; // Return the calculated row data
  }
  // Default to the current month in YYYYMM format if no month is provided
  if (!mth) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    mth = `${year}${month}`;
  }
  // console.log(mth)

  // Determine the start of the financial year (April of the current fiscal year)
  const currentYear = parseInt(mth.slice(0, 4));
  const fyStartMonth = '04'; // April
  const fyStartYear = mth.slice(4) >= '04' ? currentYear : currentYear - 1;
  const fyStart = `${fyStartYear}${fyStartMonth}`;
  // console.log("currentYear:",currentYear,"fyStartMonth :",fyStartMonth, "fyStartYear :",fyStartYear, "fyStart :",fyStart)

  // Previous fiscal year for CPLY calculation
  const prevFyStartYear = fyStartYear-1 ;
  const prevFyStart = `${fyStartYear-1}${fyStartMonth}`;
  const prevFyEnd = `${currentYear-1}${mth.slice(4)}`;

  // console.log("prevFyStartYear:",prevFyStartYear,"prevFyStart :",prevFyStart, "prevFyEnd :",prevFyEnd)
  const client = await clientPromise;
  const db = client.db('rspdesk');

  // Collections for APP, OPP, and Actual data
  const appCollection = db.collection('mthly_production_app');
  const oppCollection = db.collection('mthly_production_opp');
  const actualCollection = db.collection('mthly_production');

  // Fetch data for the current month from each collection
  const appData = await appCollection.find({ mth }).toArray();
  const oppData = await oppCollection.find({ mth }).toArray();
  const actualData = await actualCollection.find({ mth }).toArray();

  // Create maps for easy lookup by unit
  const appMap = new Map(appData.map((item) => [item.unit, item.prodn]));
  const oppMap = new Map(oppData.map((item) => [item.unit, item.prodn]));
  const actualMap = new Map(
    actualData.map((item) => [
      item.unit,
      (item.unit === "COB-6Pushg" || item.unit === "COB-1#5Pushg") 
        ? item.prodn 
        : (item.prodn / 1000)
    ])
  );

  // Fetch CPLY (corresponding previous year data) from the Actual collection
  const cplyData = await actualCollection.find({ mth: `${parseInt(mth) - 100}` }).toArray();
  const cplyMap = new Map(
    cplyData.map((item) => [
      item.unit,
      (item.unit === "COB-6Pushg" || item.unit === "COB-1#5Pushg") 
        ? item.prodn 
        : (item.prodn / 1000)
    ])
  );

  const fyAppData = await CalculateTillMthPerformance(appCollection, fyStart, mth);
  const fyActualData = await CalculateTillMthPerformance(actualCollection, fyStart, mth);
  const prevFyData = await CalculateTillMthPerformance(actualCollection, prevFyStart, prevFyEnd);
// console.log("fyStart :", fyStart, "mth :",mth, "fyStart :", fyStart, "prevFyStart :",prevFyStart, "prevFyEnd :",prevFyEnd)
  // Create maps for fiscal year data
  const fyAppMap = new Map(fyAppData.map((item) => [item._id, item.outData]));
  const fyActualMap = new Map(fyActualData.map((item) => [
    item._id,
    (item._id === "COB-6Pushg" || item._id === "COB-1#5Pushg") ? item.outData : item.outData / 1000
  ]));
  const prevFyMap = new Map(prevFyData.map((item) => [
    item._id,
    (item._id === "COB-6Pushg" || item._id === "COB-1#5Pushg") ? item.outData : item.outData / 1000
  ]));

  // Combine data for each unit and calculate additional fields
  const units = new Set([...appMap.keys(), ...oppMap.keys(), ...actualMap.keys()]);
  const enrichedData = Array.from(units).map((unit) => {
    const APP = appMap.get(unit) || 0;
    const OPP = oppMap.get(unit) || 0;
    const Actual = actualMap.get(unit) || 0;
    const ffApp = APP ? ((Actual / APP) * 100) : '';
    const ffOpp = OPP ? ((Actual / OPP) * 100) : '';
    const cply = cplyMap.get(unit) || 0;
    const growth = cply ? (((Actual - cply) / cply) * 100) : '';

    // Fiscal year totals for each unit
    const FYAPP_total = fyAppMap.get(unit) || 0;
    const FYActual_total = fyActualMap.get(unit) || 0;
    const FY_CPLY_total = prevFyMap.get(unit) || 0;

    // Fiscal year %FF and Growth
    const FF_FY = FYAPP_total ? ((FYActual_total / FYAPP_total) * 100) : '';
    const FY_Growth = FY_CPLY_total ? (((FYActual_total - FY_CPLY_total) / FY_CPLY_total) * 100) : '';

    return {
      mth,
      unit,
      APP,
      OPP,
      Actual,
      ffApp,
      ffOpp,
      cply,
      growth,
      FYAPP_total,
      FYActual_total,
      FF_FY,
      FY_CPLY_total,
      FY_Growth
    };
  });

  // Calculate and add the additional row data
  const additionalRowOvenEq = await additionalRowInPerformance(["COB-6Pushg", "COB-1#5Pushg"], [1.93, 1], "Eq COB");
  enrichedData.push(additionalRowOvenEq);

  const additionalRowSinterTotal = await additionalRowInPerformance(["SP-1", "SP-2","SP-3"], [1,1, 1], "Total Sinter");
  enrichedData.push(additionalRowSinterTotal);
  const additionalRowHMTotal = await additionalRowInPerformance(["BF-1", "BF-4","BF-5"], [1,1, 1], "Total Hotmetal");
  enrichedData.push(additionalRowHMTotal);
  const additionalRowCSTotal = await additionalRowInPerformance(["SMS-1", "SMS-2"], [1,1], "Total Crude Steel");
  enrichedData.push(additionalRowCSTotal);

  const filterData = enrichedData.filter(item => unitOrder.includes(item.unit));

  // Sort the filtered data array by the predefined unit order
  filterData.sort((a, b) => {
    const indexA = unitOrder.indexOf(a.unit);
    const indexB = unitOrder.indexOf(b.unit);
  
    // If a unit is not in the order list, keep it at the end
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
  
    return indexA - indexB;
  });
  

  return NextResponse.json(filterData);
}
