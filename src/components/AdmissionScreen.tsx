import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  MoreVertical,
  Bell,
  Calendar,
  Sparkles,
  Award,
  Users,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building,
  GraduationCap
} from "lucide-react";

interface AdmissionScreenProps {
  onNewApplication: () => void;
  onEditStudent: (studentData: any) => void;
  darkMode: boolean;
}

interface Application {
  id: string;
  studentName: string;
  program: string;
  department: string;
  appliedOn: string;
  category: "General" | "OBC" | "SC" | "ST";
  status: "Shortlisted" | "Under Review" | "Eligible" | "Rejected";
  totalScore: number;
}

export const AdmissionScreen: React.FC<AdmissionScreenProps> = ({
  onNewApplication,
  onEditStudent,
  darkMode
}) => {
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedYear, setSelectedYear] = useState("2024-2025");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Initial High-Fidelity Dataset matching the image
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "APP-2024-1562",
      studentName: "Rahul Verma",
      program: "B.Tech",
      department: "Computer Science Engg.",
      appliedOn: "20 May 2025",
      category: "General",
      status: "Shortlisted",
      totalScore: 87.60
    },
    {
      id: "APP-2024-1561",
      studentName: "Priya Sharma",
      program: "B.Tech",
      department: "Information Technology",
      appliedOn: "20 May 2025",
      category: "OBC",
      status: "Shortlisted",
      totalScore: 84.25
    },
    {
      id: "APP-2024-1560",
      studentName: "Aman Kumar",
      program: "B.Tech",
      department: "Electrical Engineering",
      appliedOn: "19 May 2025",
      category: "SC",
      status: "Under Review",
      totalScore: 79.40
    },
    {
      id: "APP-2024-1559",
      studentName: "Neha Singh",
      program: "BCA",
      department: "Computer Applications",
      appliedOn: "19 May 2025",
      category: "General",
      status: "Shortlisted",
      totalScore: 82.30
    },
    {
      id: "APP-2024-1558",
      studentName: "Vivek Patel",
      program: "BBA",
      department: "Management Studies",
      appliedOn: "18 May 2025",
      category: "OBC",
      status: "Eligible",
      totalScore: 76.85
    },
    {
      id: "APP-2024-1557",
      studentName: "Sneha Reddy",
      program: "B.Tech",
      department: "Mechanical Engineering",
      appliedOn: "18 May 2025",
      category: "General",
      status: "Under Review",
      totalScore: 73.20
    },
    {
      id: "APP-2024-1556",
      studentName: "Rohan Gupta",
      program: "B.Sc",
      department: "Basic Sciences",
      appliedOn: "17 May 2025",
      category: "SC",
      status: "Eligible",
      totalScore: 71.50
    },
    {
      id: "APP-2024-1555",
      studentName: "Kavya Nair",
      program: "B.Com",
      department: "Commerce",
      appliedOn: "17 May 2025",
      category: "General",
      status: "Under Review",
      totalScore: 68.90
    }
  ]);

  // Handle local application edit
  const handleEditLocal = (app: Application) => {
    onEditStudent({
      StudentID: app.id,
      RegNo: app.id.replace("APP-", "REG-"),
      Name: app.studentName,
      Gender: "Male",
      DOB: "2006-05-15",
      Mobile: "9876543210",
      Email: `${(app.studentName || "student").toLowerCase().replace(/\s+/g, "")}@college.edu`,
      Address: "Campus Hostels",
      Course: app.program,
      Department: app.department,
      Semester: "Semester 1",
      Batch: "2024-2028",
      JoiningDate: app.appliedOn,
      Status: app.status === "Shortlisted" ? "Active" : "Inactive"
    });
  };

  // Filter application list
  const filteredApps = applications.filter((app) => {
    if (!app) return false;
    const matchesSearch =
      (app.studentName || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (app.id || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (app.department || "").toLowerCase().includes((searchTerm || "").toLowerCase());
    const matchesProgram = selectedProgram === "All" || app.program === selectedProgram;
    const matchesDept = selectedDept === "All" || app.department === selectedDept;
    const matchesStatus = selectedStatus === "All" || app.status === selectedStatus;
    return matchesSearch && matchesProgram && matchesDept && matchesStatus;
  });

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredApps.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredApps.length / recordsPerPage) || 1;

  // Chart 1 Data: Applications by Program
  const programChartData = [
    { name: "B.Tech", value: 786, color: "#2563EB", percent: "50.32%", floatValue: 50.32 },
    { name: "B.Sc", value: 238, color: "#EAB308", percent: "15.24%", floatValue: 15.24 },
    { name: "BBA", value: 156, color: "#F97316", percent: "9.98%", floatValue: 9.98 },
    { name: "BCA", value: 192, color: "#EC4899", percent: "12.29%", floatValue: 12.29 },
    { name: "B.Com", value: 116, color: "#8B5CF6", percent: "7.43%", floatValue: 7.43 },
    { name: "Others", value: 74, color: "#10B981", percent: "4.74%", floatValue: 4.74 }
  ];

  // Chart 2 Data: Applications by Status
  // Normalize values to fit 100% for concentric visualization
  const statusChartData = [
    { name: "Received", value: 1562, color: "#2563EB", percent: "100%", floatValue: 45.0 },
    { name: "Shortlisted", value: 856, color: "#10B981", percent: "54.80%", floatValue: 24.0 },
    { name: "Under Review", value: 432, color: "#F97316", percent: "27.67%", floatValue: 18.0 },
    { name: "Eligible", value: 198, color: "#3B82F6", percent: "12.67%", floatValue: 9.0 },
    { name: "Rejected", value: 76, color: "#EF4444", percent: "4.86%", floatValue: 4.0 }
  ];

  // Funnel Data stages
  const funnelData = [
    { label: "Enquiries", count: "2,458", ratio: "100%", color: "bg-[#1E3A8A]" },
    { label: "Applications", count: "1,562", ratio: "63.59%", color: "bg-emerald-500" },
    { label: "Shortlisted", count: "856", ratio: "54.80%", color: "bg-amber-500" },
    { label: "Admitted", count: "412", ratio: "48.13%", color: "bg-orange-500" },
    { label: "Enrolled", count: "388", ratio: "94.17%", color: "bg-[#EC4899]" }
  ];

  // Helper variables for clean SVG rendering
  const r = 50;
  const c = 2 * Math.PI * r; // ~314.16

  // Cumulative percentage tracks for proper segment rotations
  let programCumulative = 0;
  let statusCumulative = 0;

  return (
    <div className="space-y-6 animate-fade-in text-slate-700">
      {/* Dynamic Header Path Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span>Admission</span>
            <span>&gt;</span>
            <span className="text-[#15305B]">Overview</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-1">Admission</h2>
        </div>

        {/* Global Action Search & User Profile Header bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by application no., name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#15305B] focus:ring-1 focus:ring-[#15305B] shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Enquiries */}
        <div className={`p-4.5 rounded-2xl border transition-all ${
          darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Enquiries</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black font-mono text-indigo-950">2,458</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">This Academic Year</p>
          </div>
        </div>

        {/* Card 2: Applications Received */}
        <div className={`p-4.5 rounded-2xl border transition-all ${
          darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Applications Received</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black font-mono text-emerald-600">1,562</h3>
            <p className="text-[10px] text-emerald-500 font-bold mt-0.5">63.59% of enquiries</p>
          </div>
        </div>

        {/* Card 3: Applications Shortlisted */}
        <div className={`p-4.5 rounded-2xl border transition-all ${
          darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Applications Shortlisted</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black font-mono text-amber-600">856</h3>
            <p className="text-[10px] text-amber-500 font-bold mt-0.5">54.80% of applications</p>
          </div>
        </div>

        {/* Card 4: Admissions Confirmed */}
        <div className={`p-4.5 rounded-2xl border transition-all ${
          darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Admissions Confirmed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black font-mono text-blue-600">412</h3>
            <p className="text-[10px] text-blue-500 font-bold mt-0.5">48.13% of shortlisted</p>
          </div>
        </div>

        {/* Card 5: Total Fee Collected */}
        <div className={`p-4.5 rounded-2xl border transition-all ${
          darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Fee Collected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black font-mono text-rose-600">₹ 1,68,75,200</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">This Academic Year</p>
          </div>
        </div>
      </div>

      {/* Filters and Search Panel Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        {/* Local Table Search Box */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or application no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#15305B]"
          />
        </div>

        {/* Program Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Program</span>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-600 font-medium"
          >
            <option value="All">All Programs</option>
            <option value="B.Tech">B.Tech</option>
            <option value="B.Sc">B.Sc</option>
            <option value="BBA">BBA</option>
            <option value="BCA">BCA</option>
            <option value="B.Com">B.Com</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Department</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-600 font-medium"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science Engg.">Computer Science Engg.</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Computer Applications">Computer Applications</option>
            <option value="Management Studies">Management Studies</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Basic Sciences">Basic Sciences</option>
            <option value="Commerce">Commerce</option>
          </select>
        </div>

        {/* Academic Year Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Academic Year</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-600 font-medium"
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Status</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-600 font-medium"
          >
            <option value="All">All Status</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Under Review">Under Review</option>
            <option value="Eligible">Eligible</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Trigger Clear Filters or action buttons */}
        <button
          onClick={() => {
            setSearchTerm("");
            setSelectedProgram("All");
            setSelectedDept("All");
            setSelectedStatus("All");
          }}
          className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>

        {/* New Application button */}
        <button
          onClick={onNewApplication}
          className="ml-auto px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Application</span>
        </button>
      </div>

      {/* Recent Applications Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight uppercase">Recent Applications</h3>
          <button
            onClick={() => {
              setSelectedProgram("All");
              setSelectedDept("All");
              setSelectedStatus("All");
              setSearchTerm("");
            }}
            className="text-[11px] font-bold text-blue-600 hover:underline animate-pulse"
          >
            View All Applications
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/20 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5 text-center w-12">
                  <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3.5 h-3.5" />
                </th>
                <th className="py-3 px-4">Application No.</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Applied On</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Total Score</th>
                <th className="py-3 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                    No matching applications found. Try modifying your search filter query.
                  </td>
                </tr>
              ) : (
                currentRecords.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3 px-5 text-center">
                      <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3.5 h-3.5" />
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-600 cursor-pointer hover:underline" onClick={() => handleEditLocal(app)}>
                      {app.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{app.studentName}</td>
                    <td className="py-3 px-4 text-slate-500 font-semibold">{app.program}</td>
                    <td className="py-3 px-4 text-slate-400 font-medium">{app.department}</td>
                    <td className="py-3 px-4 text-slate-400 font-bold">{app.appliedOn}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold border ${
                        app.category === "General"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : app.category === "OBC"
                          ? "bg-violet-50 text-violet-700 border-violet-200"
                          : "bg-pink-50 text-pink-700 border-pink-200"
                      }`}>
                        {app.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border inline-block ${
                        app.status === "Shortlisted"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : app.status === "Under Review"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        ● {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{app.totalScore.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditLocal(app)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEditLocal(app)}
                          className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                          title="Modify Application Data"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 text-slate-300 hover:text-slate-500 rounded-md">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-bold">
            Showing <span className="text-slate-700 font-extrabold">{indexOfFirstRecord + 1}</span> to{" "}
            <span className="text-slate-700 font-extrabold">{Math.min(indexOfLastRecord, filteredApps.length)}</span> of{" "}
            <span className="text-slate-700 font-extrabold">{filteredApps.length}</span> entries (from 1,562 total)
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Per Page</span>
              <select
                value={recordsPerPage}
                onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="text-xs bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-600"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 bg-white border border-slate-200 text-slate-500 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-6 h-6 text-xs font-bold rounded flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === idx + 1
                      ? "bg-[#15305B] text-white"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 bg-white border border-slate-200 text-slate-500 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Interactive Funnel / Bento Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph 1: Applications by Program Donut (Pure Custom SVG for 100% Reliability) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-[#15305B] uppercase tracking-wider mb-4">Applications by Program</h4>
            <div className="h-44 w-full relative flex items-center justify-center">
              <svg width="150" height="150" viewBox="0 0 120 120" className="transform -rotate-90">
                {programChartData.map((p, i) => {
                  const strokeDashoffset = c - (p.floatValue / 100) * c;
                  const currentRotation = (programCumulative / 100) * 360;
                  programCumulative += p.floatValue;
                  return (
                    <circle
                      key={i}
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke={p.color}
                      strokeWidth="11"
                      strokeDasharray={c}
                      strokeDashoffset={strokeDashoffset}
                      transform={`rotate(${currentRotation} 60 60)`}
                      className="transition-all duration-300 ease-out hover:stroke-[13] cursor-pointer"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-800">1,562</span>
                <span className="text-[8px] text-slate-400 font-extrabold uppercase">Total Apps</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-medium border-t border-slate-50 pt-3">
            {programChartData.map((p, i) => (
              <div key={i} className="flex items-center gap-1 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-slate-500 font-bold truncate">{p.name}</span>
                <span className="text-slate-400 font-mono text-[9px] ml-auto">{p.percent}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Graph 2: Applications by Status Donut (Pure Custom SVG for 100% Reliability) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-[#15305B] uppercase tracking-wider mb-4">Applications by Status</h4>
            <div className="h-44 w-full relative flex items-center justify-center">
              <svg width="150" height="150" viewBox="0 0 120 120" className="transform -rotate-90">
                {statusChartData.map((s, i) => {
                  const strokeDashoffset = c - (s.floatValue / 100) * c;
                  const currentRotation = (statusCumulative / 100) * 360;
                  statusCumulative += s.floatValue;
                  return (
                    <circle
                      key={i}
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke={s.color}
                      strokeWidth="11"
                      strokeDasharray={c}
                      strokeDashoffset={strokeDashoffset}
                      transform={`rotate(${currentRotation} 60 60)`}
                      className="transition-all duration-300 ease-out hover:stroke-[13] cursor-pointer"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-800">1,562</span>
                <span className="text-[8px] text-slate-400 font-extrabold uppercase">Total Apps</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-medium border-t border-slate-50 pt-3">
            {statusChartData.map((s, i) => (
              <div key={i} className="flex items-center gap-1 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-slate-500 font-bold truncate">{s.name}</span>
                <span className="text-slate-400 font-mono text-[9px] ml-auto">{s.percent}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel: Vertical or Horizontal visual admissions funnel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-[#15305B] uppercase tracking-wider mb-4">Admission Funnel</h4>
            <div className="space-y-3.5">
              {funnelData.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-semibold">
                    <span className="text-slate-600 font-bold">{step.label}</span>
                    <span className="text-slate-400 font-mono text-[9px]">{step.count} ({step.ratio})</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`${step.color} h-full rounded-full transition-all duration-1000`}
                      style={{
                        width:
                          idx === 0 ? "100%" :
                          idx === 1 ? "63.59%" :
                          idx === 2 ? "34.82%" :
                          idx === 3 ? "16.76%" :
                          "15.78%"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 text-[9px] text-slate-400 font-semibold uppercase text-center tracking-wider">
            Clearance Conversion Velocity
          </div>
        </div>

        {/* Quick Actions Bento-style grid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h4 className="text-xs font-extrabold text-[#15305B] uppercase tracking-wider mb-4">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Action 1: Add Enquiry */}
            <button
              onClick={onNewApplication}
              className="p-2.5 bg-slate-50/50 hover:bg-slate-100/60 border border-slate-100 hover:border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">Add Enquiry</span>
            </button>

            {/* Action 2: New Application */}
            <button
              onClick={onNewApplication}
              className="p-2.5 bg-slate-50/50 hover:bg-slate-100/60 border border-slate-100 hover:border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">New Application</span>
            </button>

            {/* Action 3: Merit List */}
            <button
              onClick={() => {}}
              className="p-2.5 bg-slate-50/50 hover:bg-slate-100/60 border border-slate-100 hover:border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">Merit List</span>
            </button>

            {/* Action 4: Seat Allotment */}
            <button
              onClick={() => {}}
              className="p-2.5 bg-slate-50/50 hover:bg-slate-100/60 border border-slate-100 hover:border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">Seat Allotment</span>
            </button>

            {/* Action 5: Fee Collection */}
            <button
              onClick={() => {}}
              className="p-2.5 bg-slate-50/50 hover:bg-slate-100/60 border border-slate-100 hover:border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">Fee Collection</span>
            </button>

            {/* Action 6: Admission Report */}
            <button
              onClick={() => {}}
              className="p-2.5 bg-slate-50/50 hover:bg-slate-100/60 border border-slate-100 hover:border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">Admission Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lower Row Grid (Important Notifications, Calendar, Admission Summary Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Important Notifications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4.5 h-4.5 text-blue-600" />
            <h4 className="text-xs font-extrabold text-[#15305B] uppercase tracking-wider">Important Notifications</h4>
          </div>

          <div className="space-y-3.5">
            <div className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Last date for submission of applications for B.Tech programs is 31 May 2025.
                </p>
                <span className="text-[9px] font-bold text-slate-400 font-mono">20 May 2025</span>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Counselling for shortlisted candidates will start from 01 June 2025.
                </p>
                <span className="text-[9px] font-bold text-slate-400 font-mono">19 May 2025</span>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Merit list for B.Sc programs has been published.
                </p>
                <span className="text-[9px] font-bold text-slate-400 font-mono">18 May 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Calendar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4.5 h-4.5 text-blue-600" />
            <h4 className="text-xs font-extrabold text-[#15305B] uppercase tracking-wider">Calendar</h4>
          </div>

          <div className="space-y-3">
            {/* Event 1 */}
            <div className="flex items-center gap-3.5 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="flex flex-col items-center justify-center bg-white text-blue-600 border border-slate-200 rounded-lg w-10 h-11 shrink-0">
                <span className="text-sm font-black font-mono leading-none">31</span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">May</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 leading-tight">Last Date to Apply (B.Tech)</p>
                <span className="text-[9px] text-slate-400 font-semibold font-mono">31 May 2025</span>
              </div>
            </div>

            {/* Event 2 */}
            <div className="flex items-center gap-3.5 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="flex flex-col items-center justify-center bg-[#E0F2FE] text-sky-600 border border-sky-200 rounded-lg w-10 h-11 shrink-0">
                <span className="text-sm font-black font-mono leading-none">01</span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Jun</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 leading-tight">Counselling Start Date</p>
                <span className="text-[9px] text-slate-400 font-semibold font-mono">01 June 2025</span>
              </div>
            </div>

            {/* Event 3 */}
            <div className="flex items-center gap-3.5 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="flex flex-col items-center justify-center bg-[#FEF3C7] text-amber-600 border border-amber-200 rounded-lg w-10 h-11 shrink-0">
                <span className="text-sm font-black font-mono leading-none">15</span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Jun</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 leading-tight">Admission Confirmation Last Date</p>
                <span className="text-[9px] text-slate-400 font-semibold font-mono">15 June 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Admission Summary Mini Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-4.5 h-4.5 text-blue-600" />
            <h4 className="text-xs font-extrabold text-[#15305B] uppercase tracking-wider">Admission Summary</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                  <th className="py-2">Program</th>
                  <th className="py-2 text-right">Intake</th>
                  <th className="py-2 text-right">Admitted</th>
                  <th className="py-2 text-right">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">B.Tech</td>
                  <td className="py-2.5 text-right font-mono">720</td>
                  <td className="py-2.5 text-right font-mono text-emerald-600">280</td>
                  <td className="py-2.5 text-right font-mono text-blue-600">434</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">B.Sc</td>
                  <td className="py-2.5 text-right font-mono">240</td>
                  <td className="py-2.5 text-right font-mono text-emerald-600">112</td>
                  <td className="py-2.5 text-right font-mono text-blue-600">128</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">BBA</td>
                  <td className="py-2.5 text-right font-mono">180</td>
                  <td className="py-2.5 text-right font-mono text-emerald-600">78</td>
                  <td className="py-2.5 text-right font-mono text-blue-600">102</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">BCA</td>
                  <td className="py-2.5 text-right font-mono">180</td>
                  <td className="py-2.5 text-right font-mono text-emerald-600">64</td>
                  <td className="py-2.5 text-right font-mono text-blue-600">116</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">B.Com</td>
                  <td className="py-2.5 text-right font-mono">180</td>
                  <td className="py-2.5 text-right font-mono text-emerald-600">56</td>
                  <td className="py-2.5 text-right font-mono text-blue-600">124</td>
                </tr>
                <tr className="border-t border-slate-200 bg-slate-50 font-bold text-slate-800 text-[11px]">
                  <td className="py-2">Total</td>
                  <td className="py-2 text-right font-mono">1,500</td>
                  <td className="py-2 text-right font-mono text-emerald-600">596</td>
                  <td className="py-2 text-right font-mono text-blue-600">904</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
