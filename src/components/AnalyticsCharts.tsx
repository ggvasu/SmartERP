import React, { useState } from "react";
import { AttendanceRecord, PerformanceRecord } from "../types";

interface ChartsProps {
  attendance: AttendanceRecord[];
  performance: PerformanceRecord[];
}

export const AttendanceChart: React.FC<ChartsProps & { studentId?: string }> = ({ attendance, studentId }) => {
  // Filter if studentId is provided
  const records = studentId
    ? attendance.filter((r) => r.StudentID === studentId)
    : attendance;

  const total = records.length;
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-52 text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
        <span className="text-sm">No Attendance Records Found</span>
      </div>
    );
  }

  const present = records.filter((r) => r.Status === "Present").length;
  const absent = records.filter((r) => r.Status === "Absent").length;
  const late = records.filter((r) => r.Status === "Late").length;

  const presentPct = Math.round((present / total) * 100);
  const absentPct = Math.round((absent / total) * 100);
  const latePct = Math.round((late / total) * 100);

  // SVG parameters for circle progress
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const presentOffset = circumference - (presentPct / 100) * circumference;
  const lateOffset = circumference - ((presentPct + latePct) / 100) * circumference;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Ring Chart */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-gray-100"
            strokeWidth="16"
            fill="transparent"
          />
          {/* Late ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-amber-400"
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={lateOffset}
            strokeLinecap="round"
          />
          {/* Present ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-emerald-500 animate-draw-circle"
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={presentOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-3xl font-bold text-gray-800">{presentPct}%</span>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Present</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 w-full">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {studentId ? "Your Attendance Summary" : "Overall Attendance Metrics"}
        </h4>
        <div className="space-y-3">
          {/* Present */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Present ({present} lectures)
              </span>
              <span className="font-bold text-gray-900">{presentPct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${presentPct}%` }}
              ></div>
            </div>
          </div>

          {/* Late */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-400 rounded-full"></span> Late / Excused ({late} lectures)
              </span>
              <span className="font-bold text-gray-900">{latePct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${latePct}%` }}
              ></div>
            </div>
          </div>

          {/* Absent */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <span className="w-3 h-3 bg-rose-500 rounded-full"></span> Absent ({absent} lectures)
              </span>
              <span className="font-bold text-gray-900">{absentPct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${absentPct}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="pt-2 text-xs text-gray-400 flex justify-between">
          <span>Total Lectures Logs: <b>{total}</b></span>
          <span className="text-emerald-600 font-semibold">
            {presentPct >= 75 ? "✓ Satisfactory Attendance" : "⚠ Attendance Alert (< 75%)"}
          </span>
        </div>
      </div>
    </div>
  );
};

export const PerformanceChart: React.FC<ChartsProps & { studentId?: string }> = ({ performance, studentId }) => {
  const [examFilter, setExamFilter] = useState<"All" | "Midterm" | "Endterm">("All");

  const records = performance.filter((r) => {
    const matchStudent = studentId ? r.StudentID === studentId : true;
    const matchExam = examFilter === "All" ? true : r.ExamType === examFilter;
    return matchStudent && matchExam;
  });

  if (records.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center h-72 text-gray-400">
        <span className="text-sm">No Academic Grades Found for selection</span>
      </div>
    );
  }

  // Calculate subject-wise average
  const subjectAverages: { [subj: string]: { total: number; count: number } } = {};
  records.forEach((r) => {
    if (!subjectAverages[r.Subject]) {
      subjectAverages[r.Subject] = { total: 0, count: 0 };
    }
    subjectAverages[r.Subject].total += r.Marks;
    subjectAverages[r.Subject].count += 1;
  });

  const subjects = Object.keys(subjectAverages);
  const data = subjects.map((subj) => ({
    subject: subj,
    avgMarks: Math.round(subjectAverages[subj].total / subjectAverages[subj].count),
  }));

  const maxMarks = 100;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-semibold text-gray-800">Academic Progress Tracking</h3>
          <p className="text-xs text-gray-400">Average marks obtained per subject</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold text-gray-600">
          {(["All", "Midterm", "Endterm"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setExamFilter(type)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                examFilter === type
                  ? "bg-white text-gray-800 shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5 pt-2">
        {data.map((item, index) => {
          // Color coding based on marks
          let barColor = "bg-rose-500";
          let textColor = "text-rose-600";
          if (item.avgMarks >= 85) {
            barColor = "bg-indigo-600";
            textColor = "text-indigo-600 font-bold";
          } else if (item.avgMarks >= 70) {
            barColor = "bg-teal-500";
            textColor = "text-teal-600 font-bold";
          } else if (item.avgMarks >= 50) {
            barColor = "bg-amber-500";
            textColor = "text-amber-600 font-bold";
          }

          // Get equivalent grade letter
          let grade = "F";
          if (item.avgMarks >= 90) grade = "A+";
          else if (item.avgMarks >= 80) grade = "A";
          else if (item.avgMarks >= 70) grade = "B+";
          else if (item.avgMarks >= 60) grade = "B";
          else if (item.avgMarks >= 50) grade = "C";
          else if (item.avgMarks >= 40) grade = "D";

          return (
            <div key={index} className="space-y-1.5">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-700 truncate max-w-xs">{item.subject}</span>
                <span className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs font-mono">{item.avgMarks}/100</span>
                  <span className={`${textColor} text-xs bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100`}>
                    Grade {grade}
                  </span>
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 relative">
                <div
                  className={`${barColor} h-3 rounded-full transition-all duration-700`}
                  style={{ width: `${item.avgMarks}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
        <span>Average Score: <b>{Math.round(data.reduce((acc, d) => acc + d.avgMarks, 0) / data.length)}%</b></span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span> Excellent (&gt;85)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-teal-500 rounded-full"></span> Good (70-85)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span> Average (50-70)</span>
        </div>
      </div>
    </div>
  );
};

export const FinancialSummaryChart: React.FC<{
  assigned: number;
  paid: number;
  pending: number;
  today: number;
}> = ({ assigned, paid, pending, today }) => {
  const paidPct = assigned > 0 ? Math.round((paid / assigned) * 100) : 0;
  const pendingPct = assigned > 0 ? Math.round((pending / assigned) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
      <div className="w-full md:w-1/2 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-800">Financial Collection Sync</h3>
          <p className="text-xs text-gray-400">Real-time revenue & outstanding summary</p>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
              <span>FEE COLLECTION RATE</span>
              <span>{paidPct}%</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden flex">
              <div className="bg-indigo-600 h-full" style={{ width: `${paidPct}%` }}></div>
              <div className="bg-rose-400 h-full opacity-80" style={{ width: `${pendingPct}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/50">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Total Collected</p>
              <p className="text-lg font-bold text-indigo-600">${paid.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/50">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Outstanding</p>
              <p className="text-lg font-bold text-rose-500">${pending.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4">
        {/* Simple stacked vertical bar representation */}
        <div className="w-full flex items-end gap-6 justify-center h-40 pt-4">
          <div className="flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-bold text-gray-400">${assigned.toLocaleString()}</span>
            <div className="w-10 bg-gray-200 hover:bg-gray-300 transition-colors rounded-t-lg" style={{ height: "100%" }}></div>
            <span className="text-xs font-medium text-gray-500">Assigned</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-bold text-emerald-600">${paid.toLocaleString()}</span>
            <div className="w-10 bg-emerald-500 hover:bg-emerald-600 transition-colors rounded-t-lg" style={{ height: `${paidPct}%` }}></div>
            <span className="text-xs font-medium text-gray-500">Paid</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-bold text-rose-500">${pending.toLocaleString()}</span>
            <div className="w-10 bg-rose-400 hover:bg-rose-500 transition-colors rounded-t-lg" style={{ height: `${pendingPct}%` }}></div>
            <span className="text-xs font-medium text-gray-500">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};
