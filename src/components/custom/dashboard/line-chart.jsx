"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LineChart({ data }) {
  // Prepare data for the chart
  const chartData = {
    labels: data.map((item) => {
      const date = new Date(item.rpt_date);
      return date.getDate(); // Extract the day (1, 2, 3, ...) from rpt_date
    }), // X-axis labels
    datasets: [
      {
        label: "HM",
        data: data.map((item) => item.HM),
        borderColor: "rgba(255, 99, 132, 1)", // Line color for HM
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4, // Smooth curve
      },
      {
        label: "CS",
        data: data.map((item) => item.CS),
        borderColor: "rgba(54, 162, 235, 1)", // Line color for CS
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4, // Smooth curve
      },
      {
        label: "SS",
        data: data.map((item) => item.SS),
        borderColor: "rgba(75, 192, 192, 1)", // Line color for SS
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4, // Smooth curve
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "HM, CS, and SS Data Trends by Date",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date (Day of Month)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Tonne",
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
