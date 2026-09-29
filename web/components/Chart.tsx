"use client";

import { Line } from "react-chartjs-2";
import { CategoryScale, Chart as ChartJS, Filler, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type Observation = { date: string; value: number };
type SeriesData = { code: string; label: string; actuals: Observation[]; forecasts: Observation[] };

export function Chart({ series, unit }: { series: SeriesData[]; unit: string | null }) {
  const dates = [...new Set(series.flatMap((item) => [...item.actuals, ...item.forecasts].map((row) => row.date)))].sort();
  if (!dates.length) return <div className="notice">No observations or forecasts are available for this indicator yet.</div>;
  const palette = ["#147d57", "#3478bd", "#d28a2e", "#8b63b6", "#cf5d62", "#198c95"];
  const datasets = series.flatMap((item, index) => {
    const color = palette[index % palette.length];
    const actualValues = new Map(item.actuals.map((row) => [row.date, row.value]));
    const forecastValues = new Map(item.forecasts.map((row) => [row.date, row.value]));
    return [
      ...(item.actuals.length ? [{
        label: `${item.label} · Actual`,
        data: dates.map((date) => actualValues.get(date) ?? null),
        borderColor: color,
        backgroundColor: `${color}14`,
        tension: 0.25,
        pointRadius: item.actuals.length > 100 ? 0 : 2,
        pointHoverRadius: 5,
      }] : []),
      ...(item.forecasts.length ? [{
        label: `${item.label} · Forecast`,
        data: dates.map((date) => forecastValues.get(date) ?? null),
        borderColor: color,
        backgroundColor: "transparent",
        borderDash: [6, 4],
        tension: 0.25,
        pointRadius: 2,
        pointHoverRadius: 5,
      }] : []),
    ];
  });

  return <div className="chart"><Line
    data={{
      labels: dates,
      datasets,
    }}
    options={{
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: "bottom" }, tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.parsed.y}${unit ? ` ${unit}` : ""}` } } },
      scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } }, y: { grid: { color: "#edf1ee" } } },
    }}
  /></div>;
}