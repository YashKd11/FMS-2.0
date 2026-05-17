import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import { Edit, Trash } from "lucide-react";

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [file, setFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  //  FETCH REPORTS
  const fetchReports = async () => {
    try {
      setLoading(true);

      const res = await api.get("/upload/get-reports", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;

    try {
      await api.delete(`/upload/delete-report/${reportToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const updated = reports.filter((r) => r._id !== reportToDelete._id);

      setReports(updated);

      if (selectedReport?._id === reportToDelete._id) {
        setSelectedReport(updated[0] || null);
      }

      setShowDeleteModal(false);
      setReportToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // RUN ON PAGE LOAD
  useEffect(() => {
    fetchReports();
  }, []);

  // HANDLE FILE UPLOAD
  const handleUpload = async () => {
    if (!file) return alert("Select a file");

    try {
      setUploading(true);

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/upload/upload-feedback", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("UPLOAD RESPONSE:", res.data.report);

      await fetchReports();

      setShowUploadModal(false);

      setFile(null);
    } catch (err) {
      console.error(err);

      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (reports.length > 0) {
      setSelectedReport(reports[0]);
    } else {
      setSelectedReport(null);
    }
  }, [reports]);

  const feedback = selectedReport?.teacherAnalysis || [];
  const totalTeachers = feedback.length;

  const bestTeacher =
    feedback.length > 0
      ? feedback.reduce((prev, curr) =>
          curr.average > prev.average ? curr : prev
        )
      : null;

  const avgRatingRaw =
    feedback.length > 0
      ? feedback.reduce((sum, t) => sum + t.average, 0) / feedback.length
      : 0;

  const avgRatingDisplay = (avgRatingRaw * 100).toFixed(2);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">
            Overview of uploaded feedback reports
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Import Data
        </button>
      </header>

      {/* REPORT LIST */}
      <div className="relative group bg-indigo-600 p-5 rounded-xl shadow mb-6 ">
        {/* REPORT INFO */}
        <div>
          <h2 className="text-lg font-bold text-white">
            {selectedReport?.fileName || "No Report Selected"}
          </h2>
          <p className="text-sm text-indigo-400">
            {selectedReport
              ? new Date(selectedReport.createdAt).toLocaleString()
              : "Upload or select a report"}
          </p>
        </div>

        {/* HOVER ACTIONS */}
        {selectedReport && (
          <div className="absolute top-3 right-3 flex gap-3 opacity-0 group-hover:opacity-100 transition">
            {/* CHANGE */}
            <button
              onClick={() => setShowSwitchModal(true)}
              className="text-blue-500 hover:text-blue-700"
              title="Change Report"
            >
              <Edit color="white" size={18} />
            </button>

            {/* DELETE */}
            <button
              onClick={() => {
                setReportToDelete(selectedReport);
                setShowDeleteModal(true);
              }}
              className="text-red-500 hover:text-red-700"
              title="Delete Report"
            >
              <Trash color="white" size={18} />
            </button>
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3>Total Teachers</h3>
          <p className="text-2xl font-bold">{totalTeachers}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3>Average Rating</h3>
          <p className="text-2xl font-bold">{avgRatingDisplay}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3>Best Teacher</h3>
          <p className="text-lg font-bold">
            {bestTeacher ? bestTeacher.teacher : "N/A"}
          </p>
        </div>
      </div>

      {/* ANALYSIS TABLE */}
      <div className="bg-white rounded-xl shadow border">
        <div className="p-4 border-b font-semibold">Teacher Analysis</div>

        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Teacher</th>

              <th className="p-3 text-left">Average</th>
            </tr>
          </thead>

          <tbody>
            {feedback.map((t, i) => (
              <tr key={`${t.teacher}-${i}`} className="border-t">
                <td className="p-3">{t.teacher}</td>

                <td className="p-3">{(t.average * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="mb-4 font-semibold">Upload Excel</h2>

            <input type="file" onChange={(e) => setFile(e.target.files[0])} />

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button
                onClick={handleUpload}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSwitchModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="font-semibold mb-4">Select Report</h3>

            {reports.map((r) => (
              <div
                key={r._id}
                onClick={() => {
                  setSelectedReport(r);
                  setShowSwitchModal(false);
                }}
                className="p-3 border rounded cursor-pointer hover:bg-gray-50"
              >
                {r.fileName}
              </div>
            ))}

            <button
              onClick={() => setShowSwitchModal(false)}
              className="mt-4 text-sm text-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Delete Report</h3>

            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete this report? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3">
              {/* CANCEL */}
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setReportToDelete(null);
                }}
                className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>

              {/* DELETE */}
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
