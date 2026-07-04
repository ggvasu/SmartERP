import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import {
  Student,
  FeeAssignment,
  Payment,
  Notification,
  AttendanceRecord,
  PerformanceRecord,
  Course,
  Department,
  Batch
} from "../types";
import { APIService, logAudit } from "../utils/api";
import { AttendanceChart, PerformanceChart } from "./AnalyticsCharts";
import {
  BookOpen,
  DollarSign,
  Calendar,
  Bell,
  User as UserIcon,
  LogOut,
  CreditCard,
  Printer,
  ChevronRight,
  Shield,
  Key,
  Globe,
  Award,
  Clock,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Download,
  Percent
} from "lucide-react";

interface StudentPortalProps {
  user: { Username: string; Role: string; StudentName?: string };
  onLogout: () => void;
  lang: string;
  t: (key: string) => string;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ user, onLogout, lang, t }) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "fees" | "attendance" | "notifications" | "profile">("dashboard");
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);
  const [assignedFees, setAssignedFees] = useState<FeeAssignment[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [performanceRecords, setPerformanceRecords] = useState<PerformanceRecord[]>([]);

  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const getCourseName = (code: string) => {
    const found = courses.find((c) => c.CourseCode === code || c.CourseName === code);
    return found ? found.CourseName : code;
  };

  const getDeptName = (code: string) => {
    const found = departments.find((d) => d.DepartmentCode === code || d.DepartmentName === code);
    return found ? found.DepartmentName : code;
  };

  const getBatchName = (nameOrCode: string) => {
    const found = batches.find((b) => b.BatchName === nameOrCode);
    return found ? `${found.BatchName} (${found.AcademicYear})` : nameOrCode;
  };

  // Payment form states
  const [payAmount, setPayAmount] = useState<string>("");
  const [payFeeType, setPayFeeType] = useState<string>("TuitionFee");
  const [payMode, setPayMode] = useState<string>("UPI");
  const [payTxNo, setPayTxNo] = useState<string>("");
  const [payRemarks, setPayRemarks] = useState<string>("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Selected receipt for modal print view
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Pagination for Payment History
  const [paymentPage, setPaymentPage] = useState<number>(1);
  const paymentPerPage = 5;

  const downloadReceiptPDF = (pay: Payment, student: Student) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const primaryColor = [10, 25, 49]; // #0A1931 - Navy
    const textColor = [51, 65, 85]; // Slate 700
    const lightGrey = [241, 245, 249]; // Slate 100
    const successColor = [16, 185, 129]; // Emerald 500

    // Header Color Bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 15, "F");

    // Title Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("COLLEGE ERP PORTAL", 15, 32);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 400
    doc.text("OFFICIAL PAYMENT RECEIPT & INVOICE STATEMENT", 15, 38);

    // Decorative Line
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.5);
    doc.line(15, 43, 195, 43);

    // Status Badge
    doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
    doc.roundedRect(145, 24, 50, 14, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(successColor[0], successColor[1], successColor[2]);
    doc.text("STATUS: APPROVED / PAID", 148, 30);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 300
    doc.text("REAL-TIME SYNCHRONIZED", 148, 34);

    // Info Grid
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Student Details:", 15, 53);
    doc.text("Receipt Details:", 115, 53);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`Name: ${student.Name}`, 15, 60);
    doc.text(`StudentID: ${student.StudentID}`, 15, 66);
    doc.text(`Reg No: ${student.RegNo}`, 15, 72);
    doc.text(`Course: ${student.Course}`, 15, 78);
    doc.text(`Term/Sem: ${student.Semester}`, 15, 84);

    doc.text(`Receipt ID: ${pay.ReceiptNumber}`, 115, 60);
    doc.text(`Payment Date: ${pay.Date}`, 115, 66);
    doc.text(`Payment Mode: ${pay.PaymentMode}`, 115, 72);
    doc.text(`Transaction Ref: ${pay.TransactionNumber || "N/A"}`, 115, 78);
    doc.text(`Remarks: ${pay.Remarks || "Self Paid via Student Portal"}`, 115, 84);

    // Table Header
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 92, 195, 92);

    doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
    doc.rect(15, 98, 180, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Billing Item Description", 20, 103.5);
    doc.text("Fee Category", 100, 103.5);
    doc.text("Settled Amount", 160, 103.5);

    // Table Row
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`College ${pay.FeeType} Settlement (${pay.Semester})`, 20, 114);
    doc.text(pay.FeeType, 100, 114);
    doc.text(`$${pay.Amount.toLocaleString()}`, 160, 114);

    let curY = 122;
    if (pay.Fine && pay.Fine > 0) {
      doc.text("Overdue Fine Penalty Settled", 20, curY);
      doc.text("Fine/Penalty", 100, curY);
      doc.text(`+$${pay.Fine.toLocaleString()}`, 160, curY);
      curY += 8;
    }
    if (pay.Discount && pay.Discount > 0) {
      doc.text("Scholarship/Promo Discount Offset", 20, curY);
      doc.text("Discount/Deduction", 100, curY);
      doc.text(`-$${pay.Discount.toLocaleString()}`, 160, curY);
      curY += 8;
    }

    doc.line(15, curY, 195, curY);
    curY += 6;

    // Totals
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Remaining Balance:", 115, curY + 4);
    doc.text(`$${pay.Balance.toLocaleString()}`, 160, curY + 4);

    doc.setFontSize(11);
    doc.text("Total Amount Cleared:", 115, curY + 12);
    doc.setTextColor(successColor[0], successColor[1], successColor[2]);
    doc.text(`$${(pay.Amount + (pay.Fine || 0)).toLocaleString()}`, 160, curY + 12);

    // Policy Box
    curY += 28;
    doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
    doc.roundedRect(15, curY, 180, 20, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Notice / Security Verification:", 20, curY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("This official invoice is a digital real-time copy synced securely with our Cloud Google Sheets backend.", 20, curY + 11);
    doc.text("No physical signature is required. For any inquiries, contact support at registrar@college.edu.", 20, curY + 15);

    // Footer
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 282, 210, 15, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("CONFIDENTIAL - OFFICIAL ACADEMIC DOCUMENT", 15, 290);
    doc.text(`PAGE 1 OF 1`, 180, 290);

    doc.save(`Receipt-${pay.ReceiptNumber}.pdf`);
  };

  const fetchStudentData = async () => {
    try {
      const fetchedCourses = await APIService.getCourses();
      setCourses(fetchedCourses);
      const fetchedDepts = await APIService.getDepartments();
      setDepartments(fetchedDepts);
      const fetchedBatches = await APIService.getBatches();
      setBatches(fetchedBatches);

      const allStudents = await APIService.getStudents();
      const currentStudent = allStudents.find(
        (s) => {
          if (!s || !user || !user.Username) return false;
          const sID = s.StudentID || "";
          const sEmail = s.Email || "";
          const uName = user.Username || "";
          return sID.toLowerCase() === uName.toLowerCase() || sEmail.toLowerCase() === uName.toLowerCase();
        }
      );

      if (currentStudent) {
        setStudentDetails(currentStudent);

        // Fetch assigned fees
        const allFees = await APIService.getAssignedFees();
        const studentFees = allFees.filter((f) => f.StudentID === currentStudent.StudentID);
        setAssignedFees(studentFees);

        // Fetch payments
        const allPayments = await APIService.getPayments();
        const studentPayments = allPayments.filter((p) => p.StudentID === currentStudent.StudentID);
        setPaymentHistory(studentPayments);

        // Fetch notifications
        const allNotifs = await APIService.getNotifications();
        const studentNotifs = allNotifs.filter(
          (n) =>
            n.TargetGroup === "All" ||
            n.TargetGroup === "Students" ||
            n.TargetGroup === `Course:${currentStudent.Course}` ||
            n.TargetGroup === `Semester:${currentStudent.Semester}`
        );
        setNotifications(studentNotifs);

        // Fetch attendance & performance
        setAttendanceRecords(APIService.getAttendance().filter((a) => a.StudentID === currentStudent.StudentID));
        setPerformanceRecords(APIService.getPerformance().filter((p) => p.StudentID === currentStudent.StudentID));
      }
    } catch (err) {
      console.error("Failed loading student data:", err);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user.Username]);

  // Calculate total outstanding balance
  const totalAssignedAmount = assignedFees.reduce((acc, f) => acc + f.TotalAmount, 0);
  const totalPaidAmount = paymentHistory.reduce((acc, p) => acc + p.Amount, 0);
  const outstandingBalance = Math.max(0, totalAssignedAmount - totalPaidAmount);
  const paidPercentage = totalAssignedAmount > 0 ? (totalPaidAmount / totalAssignedAmount) * 100 : 0;

  // Handle Payment Submit
  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentDetails) return;

    const parsedAmount = parseFloat(payAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (parsedAmount > outstandingBalance) {
      if (!confirm(`The amount entered ($${parsedAmount}) is higher than your remaining outstanding balance of $${outstandingBalance}. Do you still want to proceed?`)) {
        return;
      }
    }

    setIsSubmittingPayment(true);
    try {
      const res = await APIService.addPayment({
        studentId: studentDetails.StudentID,
        course: studentDetails.Course,
        semester: studentDetails.Semester,
        feeType: payFeeType,
        amount: parsedAmount,
        paymentMode: payMode,
        transactionNumber: payTxNo || `UPI${Math.floor(100000 + Math.random() * 900000)}`,
        balance: Math.max(0, outstandingBalance - parsedAmount),
        remarks: payRemarks || "Self Paid via Student Portal"
      });

      if (res.success) {
        setPaymentSuccess({
          receiptNumber: res.receiptNumber,
          amount: parsedAmount,
          date: new Date().toISOString().split("T")[0],
          paymentMode: payMode
        });
        setPayAmount("");
        setPayTxNo("");
        setPayRemarks("");
        await fetchStudentData(); // Refresh records
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message || "Payment registration failed.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Handle Password Update
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentDetails) return;

    if (!newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "Please fill out all fields" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    try {
      const res = await APIService.changePassword({
        role: "Student",
        username: studentDetails.StudentID,
        newPassword
      });

      if (res.success) {
        setPasswordMessage({ type: "success", text: "Password changed successfully." });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message });
    }
  };

  if (!studentDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Synchronizing student profile details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Banner indicating Sync Status */}
      <div className="bg-[#050D1A] text-white text-[11px] px-6 py-2.5 flex justify-between items-center border-b border-slate-800 shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-slate-300 rounded-full border border-slate-800 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>
              {APIService.getSettings().isConnected
                ? "Connected: Google Sheets Real-Time Sync"
                : "Connected: Local Sandbox Storage Mode"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span>StudentID: <b className="text-white font-bold">{studentDetails.StudentID}</b></span>
          <span>RegNo: <b className="text-white font-bold">{studentDetails.RegNo}</b></span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-[#0A1931] text-white flex flex-col shrink-0 border-r border-[#15305B]/40">
          {/* User profile segment */}
          <div className="p-6 border-b border-[#15305B]/55 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs">
              {studentDetails.Name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-white text-xs truncate tracking-tight">{studentDetails.Name}</h3>
              <p className="text-[10px] text-blue-400 font-bold tracking-wider uppercase truncate mt-0.5">{getCourseName(studentDetails.Course)}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1">
            <div className="text-[9px] uppercase text-slate-400/60 font-extrabold px-3 mb-2 tracking-widest">Portal Navigation</div>
            <button
              onClick={() => { setActiveTab("dashboard"); setPaymentSuccess(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#15305B] text-white shadow-xs border-l-3 border-blue-500"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>{t("Dashboard")}</span>
            </button>

            <button
              onClick={() => { setActiveTab("fees"); setPaymentSuccess(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "fees"
                  ? "bg-[#15305B] text-white shadow-xs border-l-3 border-blue-500"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span>{t("Payments")} & {t("Assign Fees")}</span>
            </button>

            <button
              onClick={() => { setActiveTab("attendance"); setPaymentSuccess(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "attendance"
                  ? "bg-[#15305B] text-white shadow-xs border-l-3 border-blue-500"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{t("Attendance")} & {t("Performance")}</span>
            </button>

            <button
              onClick={() => { setActiveTab("notifications"); setPaymentSuccess(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-[#15305B] text-white shadow-xs border-l-3 border-blue-500"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Bell className="w-4 h-4 text-blue-400" />
              <span>{t("Notifications")}</span>
              {notifications.length > 0 && (
                <span className="absolute right-3 bg-rose-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {notifications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab("profile"); setPaymentSuccess(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#15305B] text-white shadow-xs border-l-3 border-blue-500"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span>{t("Profile")} & {t("Settings")}</span>
            </button>
          </nav>

          {/* Footer segment */}
          <div className="p-4 bg-black/10 border-t border-[#15305B]/40">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("Logout")}</span>
            </button>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">{t("Student Portal")}</span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {activeTab === "dashboard" && `Welcome Back, ${studentDetails.Name}!`}
                {activeTab === "fees" && `${t("Payments")} & Billing`}
                {activeTab === "attendance" && `Your Analytics & Tracker`}
                {activeTab === "notifications" && `Announcements Board`}
                {activeTab === "profile" && `My Account Details`}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {activeTab === "dashboard" && "Review your outstanding fees, pending schedules, grades and lecture logs."}
                {activeTab === "fees" && "Review assigned invoices, clear balances and download receipts."}
                {activeTab === "attendance" && "Verify lectures attendance threshold and exam test scores."}
                {activeTab === "notifications" && "Stay updated with critical college notifications."}
                {activeTab === "profile" && "Manage your academic details and portal password security."}
              </p>
            </div>
            {/* Quick overview widget */}
            {activeTab === "dashboard" && (
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs min-w-[220px] flex justify-between items-center border-l-3 border-l-blue-600">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Outstanding Balance</p>
                  <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">${outstandingBalance.toLocaleString()}</p>
                </div>
                <CreditCard className="w-7 h-7 text-blue-600 shrink-0 opacity-80" />
              </div>
            )}
          </header>

          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Widgets row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Semester Assigned card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Fees Invoiced</span>
                    <h3 className="text-lg font-bold font-mono text-slate-800 mt-0.5">${totalAssignedAmount.toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{studentDetails.Semester} Structure</p>
                  </div>
                </div>

                {/* Paid amount card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Paid Successfully</span>
                    <h3 className="text-lg font-bold font-mono text-slate-800 mt-0.5">${totalPaidAmount.toLocaleString()}</h3>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Real-time Verified</p>
                  </div>
                </div>

                {/* Remaining bill card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4 border-l-3 border-l-amber-500">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Net Dues / Outstanding</span>
                    <h3 className="text-lg font-bold font-mono text-amber-700 mt-0.5">${outstandingBalance.toLocaleString()}</h3>
                    <p className="text-[10px] text-amber-600 font-bold mt-0.5">Awaiting Settlement</p>
                  </div>
                </div>
              </div>

              {/* Fee Summary Dashboard Card */}
              <div id="fee-summary-card" className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Fee Summary & Clearance Tracker</h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Real-time status of your academic billing accounts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                      outstandingBalance === 0
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {outstandingBalance === 0 ? "FULLY CLEARED" : "PENDING SETTLEMENT"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-3 space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-slate-500">Payment Clearance Progress</span>
                      <span className="text-sm font-extrabold text-[#15305B] font-mono">{paidPercentage.toFixed(1)}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-slate-100 border border-slate-200/40 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(100, paidPercentage)}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Paid: <strong className="font-bold text-slate-700">${totalPaidAmount.toLocaleString()}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        <span>Outstanding: <strong className="font-bold text-slate-700">${outstandingBalance.toLocaleString()}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                        <span>Total Invoiced: <strong className="font-bold text-slate-700">${totalAssignedAmount.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Quick Action</span>
                    <p className="text-[10px] text-slate-500 max-w-[150px] leading-normal mb-1.5">Have outstanding dues to clear?</p>
                    <button
                      onClick={() => { setActiveTab("fees"); setPaymentSuccess(null); }}
                      className="w-full py-1.5 px-3 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Make Payment
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendance and grades overview charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-blue-600" /> Attendance Performance Indicator
                  </h3>
                  <AttendanceChart attendance={attendanceRecords} performance={performanceRecords} studentId={studentDetails.StudentID} />
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-blue-600" /> Subject-wise Performance Grades
                  </h3>
                  <PerformanceChart attendance={attendanceRecords} performance={performanceRecords} studentId={studentDetails.StudentID} />
                </div>
              </div>

              {/* Critical announcements snapshot */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2 uppercase tracking-wider">
                    <Bell className="w-4.5 h-4.5 text-blue-600" /> Important Alerts For You
                  </h3>
                  <button onClick={() => setActiveTab("notifications")} className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer">
                    View All Board <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No recent announcements for your batch.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.slice(0, 2).map((notif) => (
                      <div key={notif.ID} className="py-3 first:pt-0 last:pb-0">
                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded">{notif.Date}</span>
                        <h4 className="font-bold text-slate-800 text-xs mt-1.5">{notif.Title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{notif.Message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FEES AND PAYMENTS */}
          {activeTab === "fees" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Side: Invoice structure & payment history */}
              <div className="lg:col-span-7 space-y-6">
                {/* Active Fee Structure */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                    <DollarSign className="w-4.5 h-4.5 text-blue-600" /> Assigned Fee Structure ({studentDetails.Semester})
                  </h3>

                  {assignedFees.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No fees structure has been assigned to your profile for this semester yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {assignedFees.map((fee, index) => (
                        <div key={index} className="space-y-3">
                          <div className="grid grid-cols-2 gap-y-2.5 text-xs pt-2 text-slate-600">
                            <div className="text-slate-400 font-medium">Admission Fee:</div>
                            <div className="text-right font-bold text-slate-800">${fee.AdmissionFee.toLocaleString()}</div>

                            <div className="text-slate-400 font-medium">Tuition Fee:</div>
                            <div className="text-right font-bold text-slate-800">${fee.TuitionFee.toLocaleString()}</div>

                            <div className="text-slate-400 font-medium">Exam Fee:</div>
                            <div className="text-right font-bold text-slate-800">${fee.ExamFee.toLocaleString()}</div>

                            <div className="text-slate-400 font-medium">Library Fee:</div>
                            <div className="text-right font-bold text-slate-800">${fee.LibraryFee.toLocaleString()}</div>

                            <div className="text-slate-400 font-medium">Hostel Fee:</div>
                            <div className="text-right font-bold text-slate-800">${fee.HostelFee.toLocaleString()}</div>

                            <div className="text-slate-400 font-medium">Transport Fee:</div>
                            <div className="text-right font-bold text-slate-800">${fee.TransportFee.toLocaleString()}</div>

                            {fee.Fine > 0 && (
                              <>
                                <div className="text-rose-500 font-bold">Fine / Penalty:</div>
                                <div className="text-right font-extrabold text-rose-500">+${fee.Fine.toLocaleString()}</div>
                              </>
                            )}

                            {fee.Scholarship > 0 && (
                              <>
                                <div className="text-blue-600 font-bold">Scholarship Grant:</div>
                                <div className="text-right font-extrabold text-blue-600">-${fee.Scholarship.toLocaleString()}</div>
                              </>
                            )}

                            {fee.Discount > 0 && (
                              <>
                                <div className="text-teal-600 font-bold">Discount Voucher:</div>
                                <div className="text-right font-extrabold text-teal-600">-${fee.Discount.toLocaleString()}</div>
                              </>
                            )}
                          </div>

                          <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center">
                            <div>
                              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Due Date</p>
                              <p className="text-xs font-bold text-rose-500">{fee.DueDate || "N/A"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Net Total Amount</p>
                              <p className="text-lg font-bold text-slate-800 font-mono">${fee.TotalAmount.toLocaleString()}</p>
                            </div>
                          </div>
                          {fee.Remarks && (
                            <p className="text-xs bg-slate-50 text-slate-500 p-2.5 rounded-lg border border-slate-200/60 mt-2 leading-relaxed">
                              <b>Invoice Notes:</b> {fee.Remarks}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payments History */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600" /> Transaction Receipt History
                  </h3>

                  {paymentHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No payment logs found under your ID yet.</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <th className="py-2.5">Receipt No</th>
                              <th className="py-2.5">Type</th>
                              <th className="py-2.5">Paid Date</th>
                              <th className="py-2.5">Mode</th>
                              <th className="py-2.5 text-right">Amount</th>
                              <th className="py-2.5 text-center">Receipt Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {paymentHistory
                              .slice((paymentPage - 1) * paymentPerPage, paymentPage * paymentPerPage)
                              .map((pay) => (
                                <tr key={pay.PaymentID} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3 font-bold text-slate-800">{pay.ReceiptNumber}</td>
                                  <td className="py-3 text-slate-500 font-medium">{pay.FeeType}</td>
                                  <td className="py-3 text-slate-400 font-semibold">{pay.Date}</td>
                                  <td className="py-3">
                                    <span className="bg-slate-100 text-slate-600 border border-slate-200/60 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                                      {pay.PaymentMode}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right font-bold text-emerald-600 font-mono">${pay.Amount.toLocaleString()}</td>
                                  <td className="py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => setSelectedReceipt(pay)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                                        title="View Receipt Invoice"
                                      >
                                        <Printer className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => downloadReceiptPDF(pay, studentDetails)}
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                                        title="Download PDF Receipt"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination controls */}
                      {Math.ceil(paymentHistory.length / paymentPerPage) > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                          <div className="text-[11px] text-slate-400 font-medium">
                            Showing <span className="font-bold text-slate-700">{((paymentPage - 1) * paymentPerPage) + 1}</span> to{" "}
                            <span className="font-bold text-slate-700">
                              {Math.min(paymentPage * paymentPerPage, paymentHistory.length)}
                            </span>{" "}
                            of <span className="font-bold text-slate-700">{paymentHistory.length}</span> receipts
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPaymentPage(prev => Math.max(prev - 1, 1))}
                              disabled={paymentPage === 1}
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>
                            {Array.from({ length: Math.ceil(paymentHistory.length / paymentPerPage) }).map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setPaymentPage(i + 1)}
                                className={`w-6.5 h-6.5 flex items-center justify-center text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                                  paymentPage === i + 1
                                    ? "bg-[#15305B] text-white border-[#15305B] shadow-xs font-bold"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                            <button
                              onClick={() => setPaymentPage(prev => Math.min(prev + 1, Math.ceil(paymentHistory.length / paymentPerPage)))}
                              disabled={paymentPage === Math.ceil(paymentHistory.length / paymentPerPage)}
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Quick pay gateway simulator */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 sticky top-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4.5 h-4.5 text-blue-600" /> Clear Invoices / Pay Dues
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Make secure digital payments instantly synced with the College administrative ledger.</p>
                  </div>

                  {outstandingBalance <= 0 ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center">
                      <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2.5" />
                      <h4 className="font-bold text-emerald-800 text-sm">All Paid Up!</h4>
                      <p className="text-xs text-emerald-600 mt-1">Excellent! You have zero pending dues for this term.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleMakePayment} className="space-y-4">
                      {paymentSuccess && (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-center space-y-1">
                          <p className="text-xs font-bold text-emerald-800">✓ Payment Successful!</p>
                          <p className="text-[10px] text-emerald-600">Receipt No: <b className="font-mono">{paymentSuccess.receiptNumber}</b></p>
                          <p className="text-[10px] text-emerald-600">Amount: <b>${paymentSuccess.amount}</b> processed.</p>
                          <button
                            type="button"
                            onClick={() => {
                              const payObj = paymentHistory.find(ph => ph.ReceiptNumber === paymentSuccess.receiptNumber);
                              if (payObj) setSelectedReceipt(payObj);
                            }}
                            className="text-xs text-blue-600 font-bold hover:underline mt-1 block w-full text-center cursor-pointer"
                          >
                            Print Receipt Invoice
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Payment Category / Fee Type</label>
                        <select
                          value={payFeeType}
                          onChange={(e) => setPayFeeType(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                        >
                          <option value="TuitionFee">Tuition Fee</option>
                          <option value="AdmissionFee">Admission Fee</option>
                          <option value="ExamFee">Exam Fee</option>
                          <option value="HostelFee">Hostel Fee</option>
                          <option value="TransportFee">Transport Fee</option>
                          <option value="TotalFees">All Outstanding Dues Combined</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Amount to Pay ($)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 font-bold text-slate-400 text-xs">$</span>
                          <input
                            type="number"
                            placeholder={`e.g. Max ${outstandingBalance}`}
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            max={outstandingBalance}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 flex justify-between font-medium">
                          <span>Minimum: $1</span>
                          <span>Max Outstanding: <b className="text-slate-600 font-mono">${outstandingBalance}</b></span>
                        </p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Online Payment Method</label>
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                          {["UPI", "NetBanking", "Card"].map((mode) => (
                            <label
                              key={mode}
                              className={`flex items-center justify-center text-center py-2.5 rounded-lg border cursor-pointer transition-all ${
                                payMode === mode
                                  ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100/70"
                              }`}
                            >
                              <input
                                type="radio"
                                name="payMode"
                                value={mode}
                                checked={payMode === mode}
                                onChange={() => setPayMode(mode)}
                                className="sr-only"
                              />
                              <span>{mode === "UPI" ? "UPI Apps" : mode === "NetBanking" ? "E-Banking" : "Card"}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Transaction ID / Reference (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. TXN98724109472"
                          value={payTxNo}
                          onChange={(e) => setPayTxNo(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Memo / Remarks</label>
                        <input
                          type="text"
                          placeholder="e.g. Semester 3 payment"
                          value={payRemarks}
                          onChange={(e) => setPayRemarks(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingPayment}
                        className="w-full bg-blue-600 text-white font-bold text-xs py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingPayment ? "Processing Digital Vault Sync..." : `Authorise & Pay $${payAmount || "0"}`}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE & ACADEMIC ANALYSIS */}
          {activeTab === "attendance" && (
            <div className="space-y-6">
              {/* Overall progress visual widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-blue-600" /> Lectures Attendance Ratio
                  </h3>
                  <AttendanceChart attendance={attendanceRecords} performance={performanceRecords} studentId={studentDetails.StudentID} />
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-blue-600" /> Academic Exam performance
                  </h3>
                  <PerformanceChart attendance={attendanceRecords} performance={performanceRecords} studentId={studentDetails.StudentID} />
                </div>
              </div>

              {/* Attendance Registry Logs */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-blue-600" /> Lectures Attendance Registry
                </h3>

                {attendanceRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No lecture logs found under your profile yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5">Lecture Date</th>
                          <th className="py-2.5">Subject / Core Course</th>
                          <th className="py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                        {attendanceRecords.map((rec, index) => {
                          let badgeStyle = "bg-rose-50 text-rose-600 border-rose-100/50";
                          if (rec.Status === "Present") {
                            badgeStyle = "bg-emerald-50 text-emerald-600 border-emerald-100/50";
                          } else if (rec.Status === "Late") {
                            badgeStyle = "bg-amber-50 text-amber-600 border-amber-100/50";
                          }

                          return (
                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 font-semibold text-slate-700">{rec.Date}</td>
                              <td className="py-3 text-slate-500 font-medium">{rec.Subject}</td>
                              <td className="py-3">
                                <span className={`border px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle}`}>
                                  {rec.Status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Performance Registry Grades */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Award className="w-4.5 h-4.5 text-blue-600" /> Exam Test Scores & Grade Records
                </h3>

                {performanceRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No examination scoreboards published for your active semester yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5">Test Type</th>
                          <th className="py-2.5">Semester</th>
                          <th className="py-2.5">Core Subject</th>
                          <th className="py-2.5 text-center">Score</th>
                          <th className="py-2.5 text-right">Published Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                        {performanceRecords.map((perf, index) => {
                          let gradeBadge = "bg-slate-100 text-slate-700";
                          if (perf.Grade.startsWith("A")) gradeBadge = "bg-blue-50 text-blue-600 border-blue-100/50 font-bold";
                          else if (perf.Grade.startsWith("B")) gradeBadge = "bg-teal-50 text-teal-600 border-teal-100/50 font-bold";
                          else if (perf.Grade.startsWith("C")) gradeBadge = "bg-amber-50 text-amber-600 border-amber-100/50 font-bold";

                          return (
                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 font-semibold text-slate-700">{perf.ExamType}</td>
                              <td className="py-3 text-slate-400 font-mono font-medium">{perf.Semester}</td>
                              <td className="py-3 text-slate-500 font-semibold">{perf.Subject}</td>
                              <td className="py-3 text-center font-bold text-slate-800 font-mono">{perf.Marks} / 100</td>
                              <td className="py-3 text-right">
                                <span className={`border px-2.5 py-0.5 rounded-full text-[10px] ${gradeBadge}`}>
                                  Grade {perf.Grade}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4.5 h-4.5 text-blue-600" /> Announcements Board
                </h3>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-3 py-1 rounded-full border border-blue-100">
                  {notifications.length} Bulletins Active
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">No notifications published to your group.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {notifications.map((notif) => (
                    <div key={notif.ID} className="p-5 rounded-xl bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:shadow-xs hover:border-slate-200 transition-all space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                          {notif.Date}
                        </span>
                        <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-extrabold uppercase border border-blue-100/50">
                          {notif.TargetGroup}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{notif.Title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{notif.Message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PROFILE & SECURITY SETTINGS */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Profile Details Block */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                  <UserIcon className="w-4.5 h-4.5 text-blue-600" /> Academic Profile Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-200/60">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">StudentID</p>
                    <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">{studentDetails.StudentID}</p>
                  </div>
                  <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-200/60">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Registration ID (RegNo)</p>
                    <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">{studentDetails.RegNo}</p>
                  </div>
                  <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-200/60">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Enrollment Course</p>
                    <p className="text-xs font-bold text-blue-600 mt-0.5">{getCourseName(studentDetails.Course)}</p>
                  </div>
                  <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-200/60">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Major Department</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{getDeptName(studentDetails.Department)}</p>
                  </div>
                  <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-200/60">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Term / Semester</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{studentDetails.Semester}</p>
                  </div>
                  <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-200/60">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Batch Year</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{getBatchName(studentDetails.Batch)}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mobile Number</p>
                      <p className="text-slate-700 font-bold mt-0.5">{studentDetails.Mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Institutional Email Address</p>
                      <p className="text-slate-700 font-bold mt-0.5">{studentDetails.Email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Residential address</p>
                      <p className="text-slate-700 font-bold mt-0.5 leading-relaxed">{studentDetails.Address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Portal Block */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-blue-600" /> Password Security Options
                </h3>

                {passwordMessage && (
                  <div className={`p-4 rounded-xl text-center text-xs font-semibold ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-50 border border-emerald-100 text-emerald-800"
                      : "bg-rose-50 border border-rose-100 text-rose-800"
                  }`}>
                    {passwordMessage.text}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">New Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    Authorize Credentials Change
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL PRINT VIEW OF RECEIPT */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg p-6 border border-slate-200 overflow-y-auto max-h-[90vh] space-y-6">
            <div id="receipt-print-area" className="space-y-4 text-xs text-slate-600">
              {/* Receipt Header */}
              <div className="text-center pb-3 border-b border-slate-200 space-y-1">
                <h2 className="text-xs font-bold text-slate-900 tracking-wider uppercase">COLLEGE ENTERPRISE RESOURCE SYSTEM</h2>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Official Payment Invoice Statement</p>
                <div className="inline-block bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border border-emerald-100">
                  Receipt Status: <b className="font-extrabold">APPROVED</b>
                </div>
              </div>

              {/* Receipt Metadata */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <p className="text-slate-400 font-bold text-[8px] uppercase tracking-wider">Student Name</p>
                  <p className="font-bold text-slate-800 mt-0.5">{studentDetails.Name}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold text-[8px] uppercase tracking-wider">Registration Code</p>
                  <p className="font-bold text-slate-800 mt-0.5 font-mono">{studentDetails.RegNo}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold text-[8px] uppercase tracking-wider">Receipt ID</p>
                  <p className="font-bold text-blue-600 mt-0.5 font-mono">{selectedReceipt.ReceiptNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold text-[8px] uppercase tracking-wider">Transaction Date</p>
                  <p className="font-bold text-slate-800 mt-0.5 font-mono">{selectedReceipt.Date}</p>
                </div>
              </div>

              {/* Course Info */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200/60 text-[11px] flex justify-between">
                <div>
                  <p className="font-bold text-slate-800">{getCourseName(studentDetails.Course)}</p>
                  <p className="text-slate-400 font-semibold">{studentDetails.Semester}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold text-[8px] uppercase">Batch Year</p>
                  <p className="font-bold text-slate-800">{getBatchName(studentDetails.Batch)}</p>
                </div>
              </div>

              {/* Invoice lines */}
              <div className="space-y-2 pt-1 text-[11px]">
                <div className="flex justify-between font-bold text-slate-400 pb-1 border-b border-slate-100 text-[8px] uppercase tracking-wider">
                  <span>Billing Description</span>
                  <span className="text-right">Settled Amount</span>
                </div>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>College {selectedReceipt.FeeType} Settlement ({selectedReceipt.Semester})</span>
                  <span className="font-bold text-slate-900 font-mono">${selectedReceipt.Amount.toLocaleString()}</span>
                </div>
                {selectedReceipt.Fine > 0 && (
                  <div className="flex justify-between text-rose-500 font-medium">
                    <span>Outstanding Fine Penalty Settled</span>
                    <span className="font-bold font-mono">+${selectedReceipt.Fine.toLocaleString()}</span>
                  </div>
                )}
                {selectedReceipt.Discount > 0 && (
                  <div className="flex justify-between text-teal-600 font-medium">
                    <span>Assigned Promo Discount Offset</span>
                    <span className="font-bold font-mono">-${selectedReceipt.Discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>Payment Gateway Transfer</span>
                  <span className="font-bold">({selectedReceipt.PaymentMode})</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>External Transaction Ref</span>
                  <span className="font-mono text-slate-600 font-semibold">{selectedReceipt.TransactionNumber}</span>
                </div>
              </div>

              {/* Invoice net total */}
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[11px]">
                <div>
                  <p className="text-slate-400 font-bold text-[8px] uppercase tracking-wider">Dues Balance Remaining</p>
                  <p className="font-bold text-slate-700 font-mono">${selectedReceipt.Balance.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold text-[8px] uppercase tracking-wider">Total Amount Cleared</p>
                  <p className="text-sm font-bold text-blue-600 font-mono">${(selectedReceipt.Amount + selectedReceipt.Fine).toLocaleString()}</p>
                </div>
              </div>

              {/* Print Footer */}
              <div className="text-center pt-4 border-t border-slate-200/50 space-y-0.5">
                <p className="text-[9px] text-slate-400 font-medium">This is a system generated real-time electronic invoice synced with Sheets.</p>
                <p className="text-[9px] text-blue-600 font-bold">Secure Campus ERP Portal verification verified.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 text-xs">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print / PDF Download
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg transition-all cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
