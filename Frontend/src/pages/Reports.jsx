import React, { useEffect, useState } from "react";
import { api } from "../services/api";

import { Bar, Radar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState("ALL");

  const handleDownload = async () => {
    try {
      const res = await api.get(
        `/api/upload/export/${selected._id}?shift=${selectedShift}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `report_${selectedShift}.xlsx`);

      document.body.appendChild(link);
      link.click();
      link.remove();

      setShowExportModal(false);
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/upload/get-reports", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setReports(res.data);

      if (res.data.length > 0) {
        setSelected(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!selected) {
    return (
      <div className="p-6 w-full h-screen flex items-center justify-center">
        <p className="text-gray-500 font-semibold">No reports found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* REPORT SELECTOR */}
      <div className="flex gap-4 flex-wrap">
        {reports.map((r) => (
          <button
            key={r._id}
            onClick={() => setSelected(r)}
            className={`px-4 py-2 rounded-lg ${
              selected._id === r._id
                ? "bg-indigo-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {r.fileName}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Reports</h1>

        <button
          onClick={() => setShowExportModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Download Report
        </button>
      </div>
      {/* TEACHER CARDS */}
      <div className="grid md:grid-cols-2 gap-6">
        {selected.teacherAnalysis.map((teacher, i) => {
          const firstSubject = teacher.subjectAnalysis?.[0];
          if (!firstSubject) return null;
          const labels = firstSubject.attributes.map((a) => a.name);
          const scores = firstSubject.attributes.map((a) =>
            Number((a.score * 100).toFixed(2))
          );

          const barData = {
            labels,
            datasets: [
              {
                label: "Score (%)",
                data: scores,
                backgroundColor: scores.map((s) =>
                  s > 85 ? "#22c55e" : s < 60 ? "#ef4444" : "#f59e0b"
                ),
                borderRadius: 6,
              },
            ],
          };

          const radarData = {
            labels,
            datasets: [
              {
                label: teacher.teacher,
                data: scores,
                fill: true,
                backgroundColor: "rgba(99,102,241,0.2)",
                borderColor: "#6366f1",
              },
            ],
          };

          return (
            <div
              key={i}
              className="bg-white shadow-lg rounded-2xl p-5 space-y-4"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{teacher.teacher}</h2>
                  <p className="text-sm text-gray-500">
                    Avg Score: {(teacher.average * 100).toFixed(2)}%
                  </p>
                </div>

                {/* SHIFT BADGE */}
                <div className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                  Shift: {teacher.shift || "N/A"}
                </div>
              </div>

              {/* SUMMARY CARDS */}
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Subjects Covered</p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {teacher.subjectAnalysis.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                    >
                      {sub.subject}
                    </span>
                  ))}
                </div>
              </div>

              {/* RADAR CHART */}
              <div className="h-[250px] p-4 border border-gray-200 rounded">
                <Radar
                  key={`radar-${teacher.teacher}-${selected._id}`}
                  data={radarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        min: 0,
                        max: 100,
                        ticks: { stepSize: 20 },
                      },
                    },
                  }}
                />
              </div>

              {/* BAR CHART */}
              <div className="h-[250px]">
                <Bar
                  key={`bar-${teacher.teacher}-${selected._id}`}
                  data={barData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          );
        })}

        {showExportModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[350px] space-y-4">
              <h2 className="text-lg font-semibold">Download Report</h2>

              {/* SHIFT OPTIONS */}
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full border p-2 rounded-lg"
              >
                <option value="ALL">All Shifts</option>
                <option value="M">Morning (M)</option>
                <option value="E">Evening (E)</option>
              </select>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleDownload()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
