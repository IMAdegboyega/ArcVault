'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const DoughnutChart = ({ accounts }: DoughnutChartProps) => {
  const data = {
    datasets: [{
      data: accounts.map((a) => a.currentBalance),
      backgroundColor: COLORS.slice(0, accounts.length),
      borderWidth: 0,
      cutout: '65%',
      borderRadius: 4,
      spacing: 2,
    }],
    labels: accounts.map((a) => a.name),
  };

  return (
    <Doughnut
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            padding: 10,
            cornerRadius: 8,
            titleFont: { size: 12 },
            bodyFont: { size: 13 },
            callbacks: {
              label: (ctx) => ` $${ctx.parsed.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            },
          },
        },
      }}
    />
  );
};

export default DoughnutChart;
