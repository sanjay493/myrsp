// components/custom/table-display-mth-performance.jsx

import clsx from "clsx";
export default function TableDispalyMthPerformance({ data }) {

    // console.log(data)
    // Function to render growth with arrows
    const renderGrowth = (growth) => {
      const growthValue = parseFloat(growth);
      
      if (isNaN(growthValue)) {
        return <span></span>; // Return blank if growth is NaN
      }
    
      if (growthValue > 0) {
        return <span className="text-green-500">↑ {growthValue.toFixed(0)}%</span>;
      } else if (growthValue < 0) {
        return <span className="text-red-500">↓ {growthValue.toFixed(0)}%</span>;
      }
      
      return <span>{growthValue}%</span>;
    };
    
  
    // Extract the year and month name from data.mth (e.g., "202410" -> "October 2024")
    const formatDate = (mth) => {
      const year = mth.slice(0, 4);
      const month = mth.slice(4, 6);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    };
  
    const grouped=["Total Sinter","Eq COB","Total Hotmetal","Total Crude Steel","SS"]
    return (
      <div className="w-full mx-auto my-0 overflow-x-auto">
  <table className="min-w-full table-auto border-collapse border ">
    <thead className="  text-sm uppercase font-semibold ">
            <tr><th colSpan="13" className="p-1 border text-pretty text-right">Unit: '000T</th></tr>
            {/* New Row with a formatted month and year   bg-[#d6f2e3] text-[#000000]*/} 
            <tr >
              <th colSpan="8" className="border  px-4 py-2">
                Monthly Performance Overview for <span className="text-indigo-600 font-bold ">  {formatDate(data[0]?.mth)}</span>
              </th>
              <th colSpan="5" className="border  px-4 py-2">
                Fiscal Year Summary
              </th>
            </tr>
  
            <tr className="bg-white bg-indigo-300">
              <th className="p-3 border ">Unit</th>
              <th className="p-3 border ">APP</th>
              <th className="p-3 border ">OPP</th>
              <th className="p-3 border ">Actual</th>
              <th className="p-3 border ">%FF (App)</th>
              <th className="p-3 border ">%FF (Opp)</th>
              <th className="p-3 border ">CPLY</th>
              <th className="p-3 border ">Growth (%)</th>
              <th className="p-3 border ">FY_APP</th>
              <th className="p-3 border ">FY_Actual</th>
              <th className="p-3 border ">%FF</th>
              <th className="p-3 border ">FY_CPLY</th>
              <th className="p-3 border ">FY_Growth (%)</th>
            </tr>
          </thead>
          <tbody>
  {data.map((item, index) => (
    <tr
      key={index}
      className={clsx(
        "bg-whitehover:bg-gray-200",
        grouped.includes(item.unit) && "bg-blue-100 font-bold"
      )}
    >
      <td className="p-3 border">{item.unit === "SS" ? "Saleable Steel" : item.unit}</td>
      <td className="p-3 border">{item.APP ?? '-'}</td>
      <td className="p-3 border">{item.OPP ?? '-'}</td>
      <td className="p-3 border">{item.Actual?.toFixed(0) ?? '0'}</td>

      <td
        className={clsx(
          "p-3 border",
          parseFloat(item.ffApp) > 90 && "text-green-500 font-bold"
        )}
      >
        {isNaN(parseFloat(item.ffApp)) ? '-' : `${parseFloat(item.ffApp).toFixed(0)}%`}
      </td>

      <td
        className={clsx(
          "p-3 border",
          parseFloat(item.ffOpp) > 90 && "text-green-500 font-bold"
        )}
      >
        {isNaN(parseFloat(item.ffOpp)) ? '-' : `${parseFloat(item.ffOpp).toFixed(0)}%`}
      </td>

      <td className="p-3 border">{item.cply?.toFixed(0) ?? '-'}</td>
      <td className="p-3 border">{renderGrowth(item.growth)}</td>
      <td className="p-3 border">{item.FYAPP_total?.toFixed(0) ?? '-'}</td>
      <td className="p-3 border">{item.FYActual_total?.toFixed(0) ?? '-'}</td>

      <td
        className={clsx(
          "p-3 border",
          parseFloat(item.FF_FY) > 90 && "text-green-500 font-bold"
        )}
      >
        {isNaN(parseFloat(item.FF_FY)) ? '-' : `${parseFloat(item.FF_FY).toFixed(0)}%`}
      </td>

      <td className="p-3 border">{item.FY_CPLY_total?.toFixed(0) ?? '-'}</td>
      <td className="p-3 border">{renderGrowth(item.FY_Growth)}</td>
    </tr>
  ))}
</tbody>


        </table>
      </div>
    );
  }
  