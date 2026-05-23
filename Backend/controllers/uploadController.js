const xlsx = require("xlsx");
const Report = require("../models/report");
const jwt = require("jsonwebtoken");

// Fixed Attributes
const ATTRIBUTES = [
  "Subject knowledge",
  "Communication Skills",
  "Interactive Approach & Clear doubts",
  "Covers all the topic of the Syllabus",
  "Punctuality in taking classes",
  "Control over the class",
];

const normalize = (val) => {
  if (val === undefined || val === null || isNaN(val)) return 0;
  return parseFloat((val / 5).toFixed(4));
};

// EXTRACT SHIFT
const extractShift = (val) => {
  if (!val) return "Unknown";

  const str = val.toString();
  const match = str.match(/\(([A-Z])\)\s*$/i);

  return match ? match[1].toUpperCase() : "Unknown";
};

const extractSection = (val) => {
  if (!val) return "ALL";

  const str = val.toString();

  // Matches patterns like:
  // B.Ed I-A
  // B.Com III-B (M)
  // BCA II-C (E)

  const match = str.match(/-([A-Z])(?:\s*\([A-Z]\))?$/i);

  return match ? match[1].toUpperCase() : "ALL";
};

// GENERATE INSIGHTS
const generateInsights = (teacher) => {
  if (!teacher.attributes.length) {
    return {
      bestAttribute: "N/A",
      worstAttribute: "N/A",
      consistency: 0,
      remark: "No Data",
    };
  }

  const sorted = [...teacher.attributes].sort((a, b) => b.score - a.score);
  const scores = teacher.attributes.map((a) => a.score);
  const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;

  const variance =
    scores.reduce((sum, val) => {
      return sum + Math.pow(val - avg, 2);
    }, 0) / scores.length;

  return {
    bestAttribute: sorted[0]?.name || "N/A",
    worstAttribute: sorted[sorted.length - 1]?.name || "N/A",
    consistency: parseFloat(Math.sqrt(variance).toFixed(4)),
    remark:
      avg >= 0.9
        ? "Excellent performance"
        : avg >= 0.75
        ? "Good performance"
        : avg >= 0.6
        ? "Average performance"
        : "Needs improvement",
  };
};

// MAIN CONTROLLER
const uploadFeedback = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, {
      type: "buffer",
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({ message: "Empty file" });
    }

    const headers = Object.keys(rows[0]);

    const metaKey = headers.find(
      (h) =>
        h.toLowerCase().includes("course") && h.toLowerCase().includes("shift")
    );

    const totalKey = headers.find((h) => h.toLowerCase().includes("total"));
    const maxKey = headers.find((h) => h.toLowerCase().includes("maximum"));

    const teacherBlocks = [];

    for (let i = 0; i < headers.length; i++) {
      const originalHeader = headers[i];
      const lowerHeader = originalHeader.toLowerCase();

      if (lowerHeader.includes("faculty")) {
        let subject = "Unknown";

        const match = originalHeader.match(/of the (.*?) Faculty/i);

        if (match && match[1]) {
          subject = match[1].trim();
        }

        teacherBlocks.push({
          teacherColumn: originalHeader,
          subject,
          attributeColumns: headers.slice(i + 1, i + 7),
        });
      }
    }

    const teacherMap = {};

    let lastSubject = "";
    let lastTeacher = "";

    rows.forEach((row) => {
      const metaValue = metaKey ? row[metaKey] : "";
      const shift = extractShift(metaValue);
      const section = extractSection(metaValue);

      teacherBlocks.forEach((block) => {
        if (row[block.teacherColumn]) {
          lastTeacher = row[block.teacherColumn];
        }

        const teacherName = lastTeacher;

        if (!teacherName) return;
        const subject = block.subject;
        const uniqueKey = `${teacherName}_${shift}_${section}`;

        if (!teacherMap[uniqueKey]) {
          teacherMap[uniqueKey] = {
            teacher: teacherName.trim(),
            shift,
            section,

            attributes: ATTRIBUTES.map((attr) => ({
              name: attr,
              total: 0,
              count: 0,
            })),

            subjectAnalysis: {},
          };
        }

        const teacher = teacherMap[uniqueKey];

        if (!teacher.subjectAnalysis[subject]) {
          teacher.subjectAnalysis[subject] = ATTRIBUTES.map((attr) => ({
            name: attr,
            total: 0,
            count: 0,
          }));
        }

        block.attributeColumns.forEach((col, index) => {
          const val = Number(row[col]);

          if (isNaN(val)) return;

          teacher.attributes[index].total += val;
          teacher.attributes[index].count += 1;

          teacher.subjectAnalysis[subject][index].total += val;
          teacher.subjectAnalysis[subject][index].count += 1;
        });
      });
    });

    const finalData = Object.values(teacherMap).map((teacher) => {
      const subjectAnalysis = Object.entries(teacher.subjectAnalysis).map(
        ([subjectName, attrs]) => {
          const attributes = attrs.map((attr) => {
            const totalPoints = attr.total;
            const maxPoints = attr.count * 5;
            const avg = totalPoints / (attr.count || 1);

            return {
              name: attr.name,
              score: normalize(avg),

              total: totalPoints,
              max: maxPoints,
            };
          });

          const overall =
            attributes.reduce((s, a) => s + a.score, 0) / attributes.length;

          return {
            subject: subjectName,
            attributes,
            average: parseFloat(overall.toFixed(4)),
          };
        }
      );

      const overallAttributes = ATTRIBUTES.map((attrName, index) => {
        let values = [];

        subjectAnalysis.forEach((subject) => {
          const attr = subject.attributes[index];

          if (attr) {
            values.push(attr.score * 5);
          }
        });

        const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);

        return {
          name: attrName,
          score: normalize(avg),
        };
      });

      // ---------------- OVERALL TEACHER AVG ----------------
      const overall =
        overallAttributes.reduce((s, a) => s + a.score, 0) /
        overallAttributes.length;

      const structured = {
        teacher: teacher.teacher,
        shift: teacher.shift,
        section: teacher.section,

        // FRONTEND
        attributes: overallAttributes,
        average: parseFloat(overall.toFixed(4)),

        // EXPORT
        subjectAnalysis,
      };

      return {
        ...structured,
        insights: generateInsights(structured),
      };
    });

    // ---------------- SAVE REPORT ----------------
    const savedReport = await Report.create({
      userId: req.userId,
      fileName: req.file.originalname,
      teacherAnalysis: finalData,
    });

    return res.status(200).json({
      message: "Upload & analysis successful",
      report: {
        id: savedReport._id,
        fileName: savedReport.fileName,
        createdAt: savedReport.createdAt,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Error processing file",
    });
  }
};

const exportReport = async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = decoded.id;

    const { id } = req.params;
    const { shift, section } = req.query;

    const report = await Report.findOne({
      _id: id,
      userId: userId,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    let teachers = report.teacherAnalysis;

    if (shift && shift !== "ALL") {
      teachers = teachers.filter((t) => t.shift === shift);
    }

    if (section && section !== "ALL") {
      teachers = teachers.filter((t) => t.section === section);
    }

    const workbook = xlsx.utils.book_new();

    const rows = [];

    teachers.forEach((teacher, index) => {
      teacher.subjectAnalysis.forEach((subjectBlock) => {
        subjectBlock.attributes.forEach((attr, attrIndex) => {
          rows.push({

            Faculty: attrIndex === 0 ? teacher.teacher : "",
            Subject: attrIndex === 0 ? subjectBlock.subject : "",
            Shift: attrIndex === 0 ? teacher.shift : "",
            Section: attrIndex === 0 ? teacher.section : "",

            Attributes: attr.name,

            "Total Points": attr.total,
            "Maximum Points": attr.max,
            "Points Scored in %": `${(attr.score * 100).toFixed(2)}%`,
            "Average Percentage %":
              attrIndex === 0
                ? `${(subjectBlock.average * 100).toFixed(2)}%`
                : "",
          });
        });
      });
    });

    // ---------------- CREATE SHEET ----------------
    const sheet = xlsx.utils.json_to_sheet(rows);

    // ---------------- COLUMN WIDTHS ----------------
    sheet["!cols"] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 30 },
      { wch: 10 },
      { wch: 45 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 },
      { wch: 22 },
      { wch: 12}
    ];

    // ---------------- APPEND SHEET ----------------
    xlsx.utils.book_append_sheet(workbook, sheet, "Teacher Analysis");

    // ---------------- EXPORT BUFFER ----------------
    const buffer = xlsx.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Teacher_Report_${shift || "ALL"}.xlsx`
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Export failed",
    });
  }
};

// GET REPORTS
const getReports = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const reports = await Report.find({
      userId: req.userId,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json(reports);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Error fetching reports",
    });
  }
};

// DELETE REPORt
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findOne({
      _id: id,
      userId: req.userId,
    }).lean();

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    await Report.deleteOne({ _id: id });

    return res.status(200).json({
      message: "Report deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Error deleting report",
    });
  }
};

// ---------------- EXPORTS ----------------
module.exports = {
  uploadFeedback,
  exportReport,
  getReports,
  deleteReport,
  generateInsights,
};
