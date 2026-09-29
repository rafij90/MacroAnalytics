"use client";

import { Line } from "react-chartjs-2";
import { CategoryScale, Chart as ChartJS, Filler, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type Observation = { date: string; value: number | null };

export function Chart({ rows, unit }: { rows: Observation[]; unit: string | null }) {
  const validRows = rows.filter((row): row is { date: string; value: number } => row.value !== null);
  if (!validRows.length) return <div className="notice">No observations are available for this indicator yet.</div>;

  return <div className="chart"><Line
    data={{
      labels: validRows.map((row) => row.date),
      datasets: [{
        data: validRows.map((row) => row.value),
        borderColor: "#147d57",
        backgroundColor: "#147d5714",
        fill: true,
        tension: 0.25,
        pointRadius: validRows.length > 100 ? 0 : 2,
        pointHoverRadius: 5,
      }],
    }}
    options={{
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.parsed.y}${unit ? ` ${unit}` : ""}` } } },
      scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } }, y: { grid: { color: "#edf1ee" } } },
    }}
  /></div>;
}