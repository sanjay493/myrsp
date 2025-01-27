export async function CalculateTillMthPerformance(xCollection, fyStart, mth) {
    function getDaysArrayTillMonth(mth) {
      const i_year = parseInt(mth.substring(0, 4), 10);
      // console.log(i_year)
      const i_month = parseInt(mth.substring(4), 10);
      const startYear = i_month >= 4 ? i_year : i_year - 1;
      const daysArray = []; 
      // console.log("year:",i_year, "month:",i_month);

      for (let m = 4; m <= (i_month < 4 ? i_month + 12 : i_month); m++) {
        const currentMonth = m > 12 ? m - 12 : m;
        const currentYear = m > 12 ? startYear + 1 : startYear;
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        daysArray.push(daysInMonth);
      }

      return daysArray;
    }

   

    const daysArray = getDaysArrayTillMonth(mth);
  // console.log("Days Array:", daysArray);

    const result = await xCollection
      .aggregate([
        {
          $match: {
            mth: { $gte: fyStart, $lte: mth }
          }
        },
        {
          $addFields: {
            daysWeight: {
              $arrayElemAt: [
                daysArray,
                { $subtract: [{ $month: { $toDate: { $concat: [`$mth`, "01"] } } }, 4] }
              ]
            }
          }
        },
        {
          $group: {
            _id: "$unit",
            weightedSum: { $sum: { $multiply: ["$prodn", "$daysWeight"] } },
            totalDays: { $sum: "$daysWeight" },
            normalSum: { $sum: "$prodn" }
          }
        },
        {
          $addFields: {
            weightedAverage: { $divide: ["$weightedSum", "$totalDays"] }
            
          }
        },
        {
          $addFields:{
            outData: {
              $cond: {
                if: { $in: ["$_id", ["COB-6Pushg", "COB-1#5Pushg"]] },
                then: "$weightedAverage",
                else: "$normalSum"
              }
            }
          }
        },
        {
          $project: {
            
            outData: 1
          }
        }
      ])
      .toArray();

    return result;
  }