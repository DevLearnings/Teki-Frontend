import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pitch } from "../../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PitchAnalyticsProps {
  pitches: Pitch[];
}

const PitchAnalytics: React.FC<PitchAnalyticsProps> = ({ pitches }) => {
  const totalViews = useMemo(
    () => pitches.reduce((sum, pitch) => sum + pitch.views, 0),
    [pitches]
  );
  const averageViews = useMemo(
    () => totalViews / pitches.length,
    [totalViews, pitches.length]
  );
  const mostViewedPitch = useMemo(
    () =>
      pitches.reduce((prev, current) =>
        prev.views > current.views ? prev : current
      ),
    [pitches]
  );

  const chartData = {
    labels: pitches.map((pitch) => pitch.title),
    datasets: [
      {
        label: "Views",
        data: pitches.map((pitch) => pitch.views),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Pitch Views Comparison",
      },
    },
  };

  interface Pitch {
    _id: string;
    title: string;
    createdAt: Date;
    views: number;
    visibility: "public" | "private" | "pitchers";
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Total Views
          </h3>
          <p className="text-3xl font-bold text-indigo-600">{totalViews}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Average Views
          </h3>
          <p className="text-3xl font-bold text-indigo-600">
            {averageViews.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Most Viewed Pitch
          </h3>
          <p className="text-xl font-semibold text-indigo-600">
            {mostViewedPitch.title}
          </p>
          <p className="text-gray-600">{mostViewedPitch.views} views</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Pitch Performance
        </h3>
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Pitch Details
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Views</th>
                <th className="px-4 py-2 text-left">Created At</th>
                <th className="px-4 py-2 text-left">Visibility</th>
              </tr>
            </thead>
            <tbody>
              {pitches.map((pitch) => (
                <tr key={pitch._id} className="border-b">
                  <td className="px-4 py-2">{pitch.title}</td>
                  <td className="px-4 py-2">{pitch.views}</td>
                  <td className="px-4 py-2">
                    {new Date(pitch.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{pitch.visibility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PitchAnalytics;
