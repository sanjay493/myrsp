import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function POST(request) {
  const {
    units,
    startDate,
    endDate,
    
  } = await request.json();

  console.log(units, startDate, endDate);
// Convert rpt_date to a Date object and compute the last year
function convertToDate(rpt_date) {
  let rpt_date_obj = new Date(rpt_date);
// Check if the adjusted date is invalid (e.g., February 29 in a non-leap year)
if (rpt_date_obj.getDate() === 29) {
// Adjust to February 28 if it's not a valid leap day in the previous year
rpt_date_obj = new Date(`${rpt_date_obj.getFullYear()-1}-02-28`);
}
else {
  rpt_date_obj.setFullYear(rpt_date_obj.getFullYear() - 1);
  rpt_date_obj = new Date(rpt_date_obj); // Format as "YYYY-MM-DD"
}

return rpt_date_obj.toISOString().split("T")[0]; 
}



function convertTomth(mth) {
// Compute the last year's month
let year = parseInt(mth.substring(0, 4)); // Extract year part from mth
let month = mth.substring(4); // Extract month part from mth
let mth1 = `${year - 1}${month}`;

return mth1;
}

function convertToYr(fy_year) {
  let fy_parts = fy_year.split("-"); // Split "YYYY-YY"
  let start_fy = parseInt(fy_parts[0]) - 1; // Subtract 1 from the starting year
  let end_fy = parseInt(fy_parts[1]) - 1; // Subtract 1 from the ending year
  let fy_year1 = `${start_fy}-${end_fy}`;

  return fy_year1;
}

function convertDateToMth(sdate) {
  let fy_parts = sdate.split("-"); // Split "YYYY-YY"
  let start_fy = parseInt(fy_parts[0]); // Subtract 1 from the starting year
  let mth = parseInt(fy_parts[1]); // Subtract 1 from the ending year
  let yearMth = `${start_fy}${mth}`;

  return yearMth;
}

console.log("hihi:",startDate, endDate);
async function fetchCollectionData(
  collectionName, 
  startDate, 
  endDate, 
  period, 
  unit, 
  colletion_unit, 
  collection_unit_name, 
  collection_prodn, 
  x
) {
  const client = await clientPromise;
  const db = client.db("rspdesk");

  const collection = await db.collection(collectionName).aggregate([
    {
      $match: {
        [period]: { $gte: startDate, $lte: endDate },
        [unit]: { $in: units },
      },
    },
    {
      $unwind: colletion_unit,
    },
    {
      $match: {
        [unit]: { $in: units },
      },
    },
    
    {
      $project: {
        _id: 0,
        [period]: 1,
        unit: collection_unit_name,
        prodn: { $multiply: [collection_prodn, x] },
      },
    },
    {
      $sort: {
        [period]: 1, // Ascending order, use -1 for descending order
      },
    },
  ]).toArray();

  return collection;
}


  // console.log(startDate2, endDate2, collectionName_app);
//const app_production = await fetchCollectionData(collectionName_app, startDate2, endDate2);
// const opp_production = await fetchCollectionData(collectionName_opp, startDate, endDate);
// const cply_production = await fetchCollectionData(collectionName, startDate1, endDate1);


// for Daily app or opp

const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

const modifyAppMonthlyData = (actualDailyData, appMonthlyData) => {
  // Map to store the number of days in each month
  const monthDaysCache = {};

  // Create the modified dataset
  const modifiedData = actualDailyData.map((daily) => {
    // Extract year and month from rpt_date
    const [year, month] = daily.rpt_date.split("-").slice(0, 2);

    // Generate the monthly key in 'yyyymm' format
    const monthlyKey = `${year}${month}`;

    // Calculate the number of days in the month if not cached
    if (!monthDaysCache[monthlyKey]) {
      monthDaysCache[monthlyKey] = getDaysInMonth(parseInt(year), parseInt(month));
    }
    const daysInMonth = monthDaysCache[monthlyKey];

    // Find the corresponding app value for the unit and month
    const appEntry = appMonthlyData.find((item) => item.mth === monthlyKey && item.unit === daily.unit);

    // Calculate the daily app value
    const dailyApp = appEntry ? Number(((appEntry.prodn * 1000) / daysInMonth).toFixed(0)) : 0;

    // Return the modified object
    return {
      rpt_date: daily.rpt_date,
      unit: daily.unit,
      prodn: dailyApp,
    };
  });

  return modifiedData;
};




let actual_production,  app_production_mod , opp_production_mod 
let app_production
let opp_production
let cply_production
let combinedData
// let combinedDataForAllUnits
let period
  if (startDate.length === 10 && endDate.length === 10) {
    period = "rpt_date";
    actual_production = await fetchCollectionData("dly_prodn", startDate, endDate, "rpt_date","units.name","$units","$units.name","$units.ondt_prodn",1);
    app_production_mod = await fetchCollectionData("mthly_production_app", convertDateToMth(startDate), convertDateToMth(endDate), "mth","unit","$unit","$unit","$prodn",1);
    opp_production_mod = await fetchCollectionData("mthly_production_opp", convertDateToMth(startDate), convertDateToMth(endDate), "mth","unit","$unit","$unit","$prodn",1);
    app_production= modifyAppMonthlyData(actual_production, app_production_mod);
    opp_production = modifyAppMonthlyData(actual_production, opp_production_mod);
   
    // cply_production = await fetchCollectionData("dly_prodn", convertToDate(startDate), convertToDate(endDate), "rpt_date","units.name","$units","$units.name","$units.ondt_prodn");

console.log("Daily :",actual_production, app_production_mod,opp_production_mod);
  } else if (startDate.length === 6 && endDate.length === 6) {
    period = "mth";
    actual_production = await fetchCollectionData("mthly_production", startDate, endDate, "mth","unit","$unit","$unit","$prodn",1);
    app_production = await fetchCollectionData("mthly_production_app", startDate, endDate, "mth","unit","$unit","$unit","$prodn",1000);
    opp_production = await fetchCollectionData("mthly_production_opp", startDate, endDate, "mth","unit","$unit","$unit","$prodn",1000);
    // cply_production = await fetchCollectionData("mthly_production", convertTomth(startDate), convertTomth(endDate), "mth","unit","$unit","$unit","$prodn");
    console.log("Monthly :",actual_production, app_production, opp_production);

  } else if (startDate.length === 7 && endDate.length === 7) {
    period = "fy_year";
    actual_production = await fetchCollectionData("yearly_production", startDate, endDate, "fy_year","unit","$unit","$unit","$prodn",1);
    app_production = await fetchCollectionData("yearly_production_app", startDate, endDate, "fy_year","unit","$unit","$unit","$prodn",1000);
    opp_production = await fetchCollectionData("yearly_production_opp", startDate, endDate, "fy_year","unit","$unit","$unit","$prodn",1000);
    // cply_production = await fetchCollectionData("yearly_production", convertToYr(startDate), convertToYr(endDate), "fy_year","unit","$unit","$unit","$prodn");
    console.log("Yearly :",actual_production, app_production, opp_production);
    
   
  } else {
    return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
  }

  const transformAllUnitsForGraph = (actualData, appData, oppData, period ) => {
    // Get all unique units from all datasets
    const units = [
      ...new Set([
        ...actualData.map((item) => item.unit),
        ...appData.map((item) => item.unit),
        ...oppData.map((item) => item.unit),
        
      ]),
    ];
  
    // Combine data for each unit
    const result = units.map((unit) => {
      // Filter data for the current unit
      const actualUnitData = actualData.filter((item) => item.unit === unit);
      const appUnitData = appData.filter((item) => item.unit === unit);
      const oppUnitData = oppData.filter((item) => item.unit === unit);
      
      // Create maps for each dataset by the specified period
      const createDataMap = (data) =>
        data.reduce((acc, item) => {
          acc[item[period]] = item.prodn;
          return acc;
        }, {});
  
      const appDataMap = createDataMap(appUnitData);
      const oppDataMap = createDataMap(oppUnitData);
     
  
      // Combine all datasets for each period
      const combinedData = actualUnitData.map((item) => ({
        period: item[period],
        actual: item.prodn,
        app: appDataMap[item[period]] || 0,
        opp: oppDataMap[item[period]] || 0,
        
      }));
  
      // Sort combined data by period
      // combinedData.sort((a, b) => a.period.localeCompare(b.period));
  
      return { unit, data: combinedData };
    });
  
    return result;
  };
  

  
  // Call the function with a specific period (e.g., "fy_year")
// if(period="year"){
//   period1="fy_year"
// }


  const combinedDataForAllUnits = transformAllUnitsForGraph(
    actual_production,
    app_production,
    opp_production,
    
    period
  );
  
  // Log the output
  console.log(JSON.stringify(combinedDataForAllUnits, null, 2));
  


  


  return NextResponse.json({ message: "Success", data:combinedDataForAllUnits }, { status: 200 });
}
