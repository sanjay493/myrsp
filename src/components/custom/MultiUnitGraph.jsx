"use client";

import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { Card } from "../ui/card";

const MultiUnitGraph = ({ combinedDataForAllUnits, graphType }) => {
  // Sort the data by the period for each unit
  const sortedData = combinedDataForAllUnits.map((unitData) => {
    return {
      ...unitData,
      data: unitData.data.sort((a, b) => new Date(a.period) - new Date(b.period)),
    };
  });

  const commonTheme = {
    axis: {
      legend: {
        text: {
          fontSize: 14,
          fontWeight: "bold",
        },
      },
    },
  };

  // Format period for display
  const formatDate = (period) => {
    if (/^\d{6}$/.test(period)) {
      const year = period.slice(2, 4); // Last two digits of the year
      const month = period.slice(4, 6); // Extract month
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      return `${monthNames[parseInt(month, 10) - 1]}-${year}`;
    }
    return period; // Return unmodified if not yyyymm format
  };

  return (
    <div>
      {sortedData.map((unitData) => {
        const { unit, data } = unitData;

        // Prepare line chart data
        const lineChartData = [
          {
            id: "Actual",
            data: data.map((item) => ({
              x: formatDate(item.period),
              y: item.actual,
            })),
          },
          {
            id: "APP",
            data: data.map((item) => ({
              x: formatDate(item.period),
              y: item.app,
            })),
          },
        ];

        // Prepare bar chart data
        const barChartData = data.map((item) => ({
          period: formatDate(item.period),
          app: item.app,
          actual: item.actual,
        }));

        return (
          <Card key={unit} className="p-4 mb-6 bg-gray-100 shadow-md">
            <div style={{ height: "400px" }}>
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                {unit} Production Trends
              </h2>
              {graphType === "line" ? (
                <ResponsiveLine
                  data={lineChartData}
                  margin={{ top: 50, right: 130, bottom: 50, left: 100 }}
                  xScale={{ type: "point" }}
                  yScale={{
                    type: "linear",
                    min: "auto",
                    max: "auto",
                    stacked: false,
                    reverse: false,
                  }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    orient: "bottom",
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                  }}
                  axisLeft={{
                    orient: "left",
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Production",
                    legendOffset: -80,
                    legendPosition: "middle",
                  }}
                  theme={commonTheme}
                  colors={{ scheme: "category10" }}
                  pointSize={10}
                  pointColor={{ theme: "background" }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: "serieColor" }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                />
              ) : (
                <ResponsiveBar
                  data={barChartData}
                  keys={["app", "actual"]}
                  indexBy="period"
                  margin={{ top: 50, right: 130, bottom: 50, left: 100 }}
                  padding={0.3}
                  groupMode="grouped"
                  valueScale={{ type: "linear" }}
                  indexScale={{ type: "band", round: true }}
                  colors={{ scheme: "category10" }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "",
                    legendPosition: "middle",
                    legendOffset: 32,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Production",
                    legendPosition: "middle",
                    legendOffset: -80,
                  }}
                  theme={commonTheme}
                  legends={[
                    {
                      dataFrom: "keys",
                      anchor: "bottom-right",
                      direction: "column",
                      translateX: 120,
                      itemsSpacing: 20,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemDirection: "left-to-right",
                      itemOpacity: 0.85,
                      symbolSize: 20,
                    },
                  ]}
                  layers={[
                    "grid",
                    "axes",
                    "bars",
                    "markers",
                    "legends",
                    ({ bars }) =>
                      bars.map((bar) => (
                        <g key={bar.key}>
                          <text
                            x={bar.x + bar.width / 2}
                            y={bar.y + bar.height / 2}
                            textAnchor="middle"
                            alignmentBaseline="central"
                            style={{
                              fill: "#000",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            {bar.data[bar.id]}
                          </text>
                        </g>
                      )),
                  ]}
                />
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MultiUnitGraph;
