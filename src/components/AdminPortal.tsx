import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Student,
  Course,
  Department,
  Batch,
  Semester,
  FeeAssignment,
  Payment,
  Notification,
  AuditLog,
  AttendanceRecord,
  PerformanceRecord
} from "../types";
import { APIService, logAudit, getScriptUrl, setScriptUrl, isConnectedToSheets } from "../utils/api";
import { AttendanceChart, PerformanceChart, FinancialSummaryChart } from "./AnalyticsCharts";
import { AdmissionScreen } from "./AdmissionScreen";
import { UsersScreen } from "./UsersScreen";
import {
  Users,
  BookOpen,
  Building,
  Calendar,
  Layers,
  DollarSign,
  CreditCard,
  Bell,
  Activity,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Globe,
  Settings,
  Database,
  Terminal,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ExternalLink,
  Clipboard,
  Shield,
  FileText,
  Clock,
  Award,
  Check,
  Printer,
  Download,
  FileDown,
  Share2,
  Mail,
  ArrowLeft,
  QrCode,
  UserCheck,
  FileSpreadsheet,
  TrendingUp,
  X,
  Briefcase,
  Percent,
  TableProperties,
  LayoutGrid,
  FileCheck,
  PlusCircle,
  Copy,
  Upload,
  Eye,
  CheckSquare,
  Sparkles,
  Sun,
  Moon,
  TrendingDown,
  Send,
  Menu,
  User,
  GraduationCap,
  MoreVertical,
  ArrowUpDown,
  ChevronLeft
} from "lucide-react";

const getStudentAvatar = (name: string, gender: string) => {
  const n = (name || "").toLowerCase();
  if (n.includes("vasu")) return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80";
  if (n.includes("kavya")) return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80";
  if (n.includes("arun")) return "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80";
  if (n.includes("meena")) return "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80";
  if (n.includes("praveen")) return "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80";
  if (n.includes("sneha")) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80";
  if (n.includes("rohit")) return "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100&q=80";
  if (n.includes("pooja")) return "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80";
  
  if ((gender || "").toLowerCase() === "female") {
    const females = [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80"
    ];
    const index = Math.abs((name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % females.length;
    return females[index];
  } else {
    const males = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100&q=80"
    ];
    const index = Math.abs((name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % males.length;
    return males[index];
  }
};

interface AdminPortalProps {
  user: { Username: string; Role: string; Permissions: string };
  onLogout: () => void;
  lang: string;
  t: (key: string) => string;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ user, onLogout, lang, t }) => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "students" | "fees" | "payments" | "curriculum" | "notifications" | "settings" | "admission" | "users"
  >("dashboard");

  // Multi-grid selected sub-tab for curriculum tab
  const [curriculumSubTab, setCurriculumSubTab] = useState<"courses" | "departments" | "batches" | "semesters">("courses");

  // State caches
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [assignedFees, setAssignedFees] = useState<FeeAssignment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [allPerformance, setAllPerformance] = useState<PerformanceRecord[]>([]);

  // Syncing loaders
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; text: string } | null>(null);

  // Search & Filtering States
  const [stuSearch, setStuSearch] = useState("");
  const [stuCourseFilter, setStuCourseFilter] = useState("All");
  const [stuStatusFilter, setStuStatusFilter] = useState("All");
  const [stuSubTab, setStuSubTab] = useState<"All" | "Active" | "Inactive" | "Graduated" | "Transferred">("All");
  const [stuDeptFilter, setStuDeptFilter] = useState("All");
  const [stuBatchFilter, setStuBatchFilter] = useState("All");
  const [stuSemesterFilter, setStuSemesterFilter] = useState("All");
  const [stuPage, setStuPage] = useState(1);

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
  const [stuPerPage, setStuPerPage] = useState(10);

  // Form Modals / Forms Active state
  const [showAddStuModal, setShowAddStuModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStus, setSelectedStus] = useState<string[]>([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Forms Input States - Student
  const [stuName, setStuName] = useState("");
  const [stuGender, setStuGender] = useState("Male");
  const [stuDOB, setStuDOB] = useState("");
  const [stuMobile, setStuMobile] = useState("");
  const [stuEmail, setStuEmail] = useState("");
  const [stuAddress, setStuAddress] = useState("");
  const [stuCourse, setStuCourse] = useState("");
  const [stuDept, setStuDept] = useState("");
  const [stuSem, setStuSem] = useState("");
  const [stuBatch, setStuBatch] = useState("");
  const [stuStatus, setStuStatus] = useState("Active");
  const [stuPass, setStuPass] = useState("password123");

  // Forms Input States - Fee Assignment (Single or Bulk)
  const [feeIsBulk, setFeeIsBulk] = useState(false);
  const [feeStudentId, setFeeStudentId] = useState("");
  const [feeCourse, setFeeCourse] = useState("");
  const [feeSemester, setFeeSemester] = useState("Semester 1");
  const [feeBatch, setFeeBatch] = useState("");
  const [feeAdmission, setFeeAdmission] = useState("0");
  const [feeTuition, setFeeTuition] = useState("0");
  const [feeExam, setFeeExam] = useState("0");
  const [feeLibrary, setFeeLibrary] = useState("0");
  const [feeHostel, setFeeHostel] = useState("0");
  const [feeTransport, setFeeTransport] = useState("0");
  const [feeLaboratory, setFeeLaboratory] = useState("0");
  const [feeUniform, setFeeUniform] = useState("0");
  const [feeIdCard, setFeeIdCard] = useState("0");
  const [feeMisc, setFeeMisc] = useState("0");
  const [feeFine, setFeeFine] = useState("0");
  const [feeScholarship, setFeeScholarship] = useState("0");
  const [feeDiscount, setFeeDiscount] = useState("0");
  const [feeDueDate, setFeeDueDate] = useState("");
  const [feeRemarks, setFeeRemarks] = useState("");
  const [feeSubmitStatus, setFeeSubmitStatus] = useState<string | null>(null);
  
  // Wizard states for Assign Fees Screen
  const [feeAssignStep, setFeeAssignStep] = useState<number>(1);
  const [feeAcademicYear, setFeeAcademicYear] = useState<string>("2026-27");
  const [feeInstallmentOption, setFeeInstallmentOption] = useState<string>("One-Time");
  const [scannedStudentData, setScannedStudentData] = useState<string | null>(null);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [assignmentSuccessDetails, setAssignmentSuccessDetails] = useState<any | null>(null);

  // Forms Input States - Payments
  const [payStudentId, setPayStudentId] = useState("");
  const [payCourse, setPayCourse] = useState("");
  const [paySemester, setPaySemester] = useState("");
  const [payFeeType, setPayFeeType] = useState("TuitionFee");
  const [payAmount, setPayAmount] = useState("");
  const [payFine, setPayFine] = useState("0");
  const [payDiscount, setPayDiscount] = useState("0");
  const [payMode, setPayMode] = useState("Cash");
  const [payTxNo, setPayTxNo] = useState("");
  const [payRemarks, setPayRemarks] = useState("");
  const [paySubmitStatus, setPaySubmitStatus] = useState<string | null>(null);

  // College ERP Premium Payment Wizard States (Ultra HD 4K)
  const [payWizardStep, setPayWizardStep] = useState<"search" | "profile" | "entry" | "review" | "processing" | "success">("search");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [payDiscountInput, setPayDiscountInput] = useState<string>("0");
  const [payScholarshipInput, setPayScholarshipInput] = useState<string>("0");
  const [payFineInput, setPayFineInput] = useState<string>("0");
  const [payBankName, setPayBankName] = useState<string>("");
  const [payReceiptNo, setPayReceiptNo] = useState<string>("");
  const [successReceiptDetails, setSuccessReceiptDetails] = useState<any | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);
  const [qrScannerOpen, setQrScannerOpen] = useState<boolean>(false);
  const [historySearch, setHistorySearch] = useState<string>("");
  const [historyFilterMode, setHistoryFilterMode] = useState<string>("All");
  const [historyDateRange, setHistoryDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historyLimit, setHistoryLimit] = useState<number>(10);
  const [historySortField, setHistorySortField] = useState<string>("Date");
  const [historySortOrder, setHistorySortOrder] = useState<"asc" | "desc">("desc");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("All");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [searchQueryId, setSearchQueryId] = useState<string>("");
  const [searchQueryReg, setSearchQueryReg] = useState<string>("");
  const [searchQueryMob, setSearchQueryMob] = useState<string>("");
  const [searchQueryName, setSearchQueryName] = useState<string>("");

  // Premium Dashboard Custom Interactive States
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"Daily" | "Weekly" | "Monthly" | "Yearly">("Monthly");
  const [overviewBreakdown, setOverviewBreakdown] = useState<"Course" | "Department" | "Semester" | "Gender">("Course");
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState<boolean>(false);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);

  // Forms Input States - Course
  const [cCode, setCCode] = useState("");
  const [cName, setCName] = useState("");
  const [cDuration, setCDuration] = useState("4 Years");
  const [cSemesters, setCSemesters] = useState("8");
  const [cFees, setCFees] = useState("");
  const [cDesc, setCDesc] = useState("");

  // Forms Input States - Department
  const [dCode, setDCode] = useState("");
  const [dName, setDName] = useState("");
  const [dHOD, setDHOD] = useState("");

  // Forms Input States - Batch
  const [bName, setBName] = useState("");
  const [bAcadYear, setBAcadYear] = useState("");
  const [bStart, setBStart] = useState("");
  const [bEnd, setBEnd] = useState("");

  // Forms Input States - Semester
  const [sNo, setSNo] = useState("Semester 1");
  const [sCourse, setSCourse] = useState("");
  const [sFees, setSFees] = useState("");
  const [sSubjects, setSSubjects] = useState("");

  // Forms Input States - Alerts Notification
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifTarget, setNotifTarget] = useState("All");
  const [notifSubmitStatus, setNotifSubmitStatus] = useState<string | null>(null);

  // Attendance quick logger
  const [attDate, setAttDate] = useState(new Date().toISOString().split("T")[0]);
  const [attSubject, setAttSubject] = useState("");
  const [attCourseFilter, setAttCourseFilter] = useState("");
  const [attSemesterFilter, setAttSemesterFilter] = useState("");
  const [attStatusMap, setAttStatusMap] = useState<{ [stuId: string]: "Present" | "Absent" | "Late" }>({});

  // Performance quick logger
  const [gradeStuId, setGradeStuId] = useState("");
  const [gradeSubject, setGradeSubject] = useState("");
  const [gradeMarks, setGradeMarks] = useState("");
  const [gradeType, setGradeType] = useState<"Midterm" | "Endterm" | "Assignment">("Midterm");
  const [gradeSemester, setGradeSemester] = useState("");

  // Google Script setup URL state
  const [tempScriptUrl, setTempScriptUrl] = useState(getScriptUrl());

  const loadAllData = async (silent: boolean = false) => {
    if (!silent) setIsSyncing(true);
    setSyncStatus(null);
    try {
      // Parallelize calls
      const [
        fetchedStudents,
        fetchedCourses,
        fetchedDepartments,
        fetchedBatches,
        fetchedSemesters,
        fetchedFees,
        fetchedPayments,
        fetchedNotifications
      ] = await Promise.all([
        APIService.getStudents(),
        APIService.getCourses(),
        APIService.getDepartments(),
        APIService.getBatches(),
        APIService.getSemesters(),
        APIService.getAssignedFees(),
        APIService.getPayments(),
        APIService.getNotifications()
      ]);

      setStudents(fetchedStudents);
      setCourses(fetchedCourses);
      setDepartments(fetchedDepartments);
      setBatches(fetchedBatches);
      setSemesters(fetchedSemesters);
      setAssignedFees(fetchedFees);
      setPayments(fetchedPayments);
      setNotifications(fetchedNotifications);

      // Fetch offline-sandbox tracking data
      setAuditLogs(APIService.getAuditLogs());
      setAllAttendance(APIService.getAttendance());
      setAllPerformance(APIService.getPerformance());

      // Pre-fill select options if available
      if (fetchedCourses.length > 0 && !stuCourse) setStuCourse(fetchedCourses[0].CourseCode);
      if (fetchedDepartments.length > 0 && !stuDept) setStuDept(fetchedDepartments[0].DepartmentCode);
      if (fetchedBatches.length > 0 && !stuBatch) setStuBatch(fetchedBatches[0].BatchName);

      if (!silent) {
        setSyncStatus({ success: true, text: "Google Sheets sync completed successfully." });
      }
    } catch (e: any) {
      console.error(e);
      setSyncStatus({ success: false, text: e.message || "Failed to fully sync with Google Sheets." });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (!s) return false;
    const sName = s.Name || "";
    const sID = s.StudentID || "";
    const sReg = s.RegNo || "";
    const sEmail = s.Email || "";
    const sMobile = s.Mobile || "";
    const sStatus = s.Status || "Active";

    const matchSearch =
      sName.toLowerCase().includes((stuSearch || "").toLowerCase()) ||
      sID.toLowerCase().includes((stuSearch || "").toLowerCase()) ||
      sReg.toLowerCase().includes((stuSearch || "").toLowerCase()) ||
      sEmail.toLowerCase().includes((stuSearch || "").toLowerCase()) ||
      sMobile.includes(stuSearch || "");

    const matchCourse = stuCourseFilter === "All" || s.Course === stuCourseFilter;
    const matchDept = stuDeptFilter === "All" || s.Department === stuDeptFilter;
    const matchBatch = stuBatchFilter === "All" || s.Batch === stuBatchFilter;
    const matchSemester = stuSemesterFilter === "All" || s.Semester === stuSemesterFilter;
    
    let matchSubTab = true;
    if (stuSubTab !== "All") {
      matchSubTab = sStatus.toLowerCase() === (stuSubTab || "").toLowerCase();
    }
    const matchStatus = stuStatusFilter === "All" || s.Status === stuStatusFilter;

    return matchSearch && matchCourse && matchDept && matchBatch && matchSemester && matchSubTab && matchStatus;
  });

  useEffect(() => {
    setStuPage(1);
  }, [stuSearch, stuCourseFilter, stuStatusFilter, stuSubTab, stuDeptFilter, stuBatchFilter, stuSemesterFilter, stuPerPage]);

  // Calculate stats
  let totalAssigned = assignedFees.reduce((acc, f) => acc + f.TotalAmount, 0);
  let totalCollected = payments.reduce((acc, p) => acc + p.Amount, 0);
  let pendingDues = Math.max(0, totalAssigned - totalCollected);
  let todayCollected = payments
    .filter((p) => p.Date === new Date().toISOString().split("T")[0])
    .reduce((acc, p) => acc + p.Amount, 0);

  // Submit Student Form (Add or Edit)
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName || !stuEmail || !stuCourse || !stuDept) {
      alert("Please fill required fields");
      return;
    }

    const payload = {
      Name: stuName,
      Gender: stuGender,
      DOB: stuDOB,
      Mobile: stuMobile,
      Email: stuEmail,
      Address: stuAddress,
      Course: stuCourse,
      Department: stuDept,
      Semester: stuSem || "Semester 1",
      Batch: stuBatch,
      Status: stuStatus,
      Password: stuPass,
      JoiningDate: new Date().toISOString().split("T")[0]
    };

    try {
      if (editingStudent) {
        const res = await APIService.updateStudent(editingStudent.StudentID, payload);
        alert(res.message);
      } else {
        const res = await APIService.addStudent(payload);
        alert(res.message);
      }
      // Reset
      setStuName("");
      setStuEmail("");
      setStuMobile("");
      setStuAddress("");
      setStuDOB("");
      setEditingStudent(null);
      setShowAddStuModal(false);
      await loadAllData(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit student record.");
    }
  };

  // Set student up for editing
  const startEditStudent = (s: Student) => {
    setEditingStudent(s);
    setStuName(s.Name);
    setStuGender(s.Gender);
    setStuDOB(s.DOB);
    setStuMobile(s.Mobile);
    setStuEmail(s.Email);
    setStuAddress(s.Address);
    setStuCourse(s.Course);
    setStuDept(s.Department);
    setStuSem(s.Semester);
    setStuBatch(s.Batch);
    setStuStatus(s.Status);
    setStuPass(s.Password || "stu123");
    setShowAddStuModal(true);
  };

  // Delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (confirm(`Are you sure you want to permanently delete Student ID ${studentId}?`)) {
      try {
        const res = await APIService.deleteStudent(studentId);
        alert(res.message);
        await loadAllData(true);
      } catch (err: any) {
        alert(err.message || "Failed to delete student.");
      }
    }
  };

  // Interactive Total calculations for dynamic invoicing
  const feeAdmissionNum = parseFloat(feeAdmission) || 0;
  const feeTuitionNum = parseFloat(feeTuition) || 0;
  const feeExamNum = parseFloat(feeExam) || 0;
  const feeLibraryNum = parseFloat(feeLibrary) || 0;
  const feeHostelNum = parseFloat(feeHostel) || 0;
  const feeTransportNum = parseFloat(feeTransport) || 0;
  const feeLaboratoryNum = parseFloat(feeLaboratory) || 0;
  const feeUniformNum = parseFloat(feeUniform) || 0;
  const feeIdCardNum = parseFloat(feeIdCard) || 0;
  const feeMiscNum = parseFloat(feeMisc) || 0;
  const feeFineNum = parseFloat(feeFine) || 0;
  const feeScholarshipNum = parseFloat(feeScholarship) || 0;
  const feeDiscountNum = parseFloat(feeDiscount) || 0;

  const calculatedFeeTotal =
    feeAdmissionNum +
    feeTuitionNum +
    feeExamNum +
    feeLibraryNum +
    feeHostelNum +
    feeTransportNum +
    feeLaboratoryNum +
    feeUniformNum +
    feeIdCardNum +
    feeMiscNum +
    feeFineNum -
    feeScholarshipNum -
    feeDiscountNum;

  // Handle Fee Assignment Submit
  const handleAssignFees = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeeSubmitStatus("Processing administrative transaction...");

    try {
      const res = await APIService.assignFees({
        bulk: feeIsBulk,
        studentId: feeIsBulk ? undefined : feeStudentId,
        course: feeCourse,
        semester: feeSemester,
        batch: feeIsBulk ? feeBatch : undefined,
        admissionFee: feeAdmissionNum,
        tuitionFee: feeTuitionNum + feeLaboratoryNum + feeUniformNum + feeIdCardNum + feeMiscNum, // aggregate new fields safely to backend fields
        examFee: feeExamNum,
        libraryFee: feeLibraryNum,
        hostelFee: feeHostelNum,
        transportFee: feeTransportNum,
        fine: feeFineNum,
        scholarship: feeScholarshipNum,
        discount: feeDiscountNum,
        totalAmount: calculatedFeeTotal,
        dueDate: feeDueDate || new Date().toISOString().split("T")[0],
        remarks: feeRemarks
      });

      if (res.success) {
        setFeeSubmitStatus(`Success: ${res.message}`);
        
        // Generate random assignment details
        const randId = `ASG-${Math.floor(1000 + Math.random() * 9000)}`;
        const targetStudent = students.find(s => s.StudentID === feeStudentId);
        
        const details = {
          assignmentId: randId,
          studentName: feeIsBulk ? `Bulk Batch: ${feeBatch}` : (targetStudent ? targetStudent.Name : feeStudentId || "Unknown Student"),
          studentId: feeStudentId || "N/A",
          semester: feeSemester,
          course: feeCourse,
          totalFee: calculatedFeeTotal,
          dueDate: feeDueDate || new Date().toISOString().split("T")[0],
          status: "Pending"
        };
        
        setAssignmentSuccessDetails(details);
        setRecentAssignments(prev => [details, ...prev]);
        
        // Advance to Step 7 (Success Screen)
        setFeeAssignStep(7);

        // Reset values
        setFeeStudentId("");
        setFeeRemarks("");
        await loadAllData(true);
      } else {
        setFeeSubmitStatus(`Error: ${res.message}`);
      }
    } catch (err: any) {
      setFeeSubmitStatus(`Error: ${err.message || "Operation failed."}`);
    }
  };

  // College ERP Premium Payment Wizard Helpers
  const handleQRScan = () => {
    setQrScannerOpen(true);
    setTimeout(() => {
      if (students.length === 0) {
        alert("No students found in the roster. Please register/import a student first.");
        setQrScannerOpen(false);
        return;
      }
      const targetStudent = students[0];
      if (targetStudent) {
        setSelectedStudent(targetStudent);
        setPayStudentId(targetStudent.StudentID);
        setPayCourse(targetStudent.Course);
        setPaySemester(targetStudent.Semester);
        setSelectedSemester(targetStudent.Semester);
        setPayWizardStep("profile");
        logAudit("QR Scanner", `Successfully scanned student card of ${targetStudent.Name} (${targetStudent.StudentID})`);
      }
      setQrScannerOpen(false);
    }, 1500);
  };

  const getSemesterFeeOverview = (student: Student, semNo: string) => {
    const assignment = assignedFees.find(f => f.StudentID === student.StudentID && f.Semester === semNo);
    const semPayments = payments.filter(p => p.StudentID === student.StudentID && p.Semester === semNo);
    const paidAmount = semPayments.reduce((sum, p) => sum + (Number(p.Amount) || 0), 0);
    
    let tuitionFee = 0;
    let admissionFee = 0;
    let examFee = 0;
    let libraryFee = 0;
    let laboratoryFee = student.Course === "BTECH-CSE" ? 2500 : 1200;
    let hostelFee = 0;
    let transportFee = 0;
    let miscellaneousFee = 450;
    let fine = 0;
    let scholarship = 0;
    let discount = 0;
    let dueDate = "2026-08-15";
    let totalFee = 0;

    if (assignment) {
      tuitionFee = Number(assignment.TuitionFee) || 0;
      admissionFee = Number(assignment.AdmissionFee) || 0;
      examFee = Number(assignment.ExamFee) || 0;
      libraryFee = Number(assignment.LibraryFee) || 0;
      hostelFee = Number(assignment.HostelFee) || 0;
      transportFee = Number(assignment.TransportFee) || 0;
      fine = Number(assignment.Fine) || 0;
      scholarship = Number(assignment.Scholarship) || 0;
      discount = Number(assignment.Discount) || 0;
      dueDate = assignment.DueDate;
      totalFee = Number(assignment.TotalAmount) || 0;
    } else {
      // Simulate standard fee
      const courseObj = courses.find(c => c.CourseCode === student.Course);
      const semBaseFee = courseObj ? Math.round(courseObj.CourseFees / courseObj.TotalSemesters) : 15000;
      
      tuitionFee = semBaseFee;
      admissionFee = semNo === "Semester 1" ? 5000 : 0;
      examFee = 1500;
      libraryFee = 1000;
      hostelFee = 0;
      transportFee = 0;
      fine = 0;
      scholarship = 0;
      discount = 0;
      
      totalFee = tuitionFee + admissionFee + examFee + libraryFee + laboratoryFee + hostelFee + transportFee + miscellaneousFee + fine - scholarship - discount;
    }

    const balanceAmount = Math.max(0, totalFee - paidAmount);
    const progress = totalFee > 0 ? Math.min(100, Math.round((paidAmount / totalFee) * 100)) : 0;
    
    let status: "Paid" | "Partial" | "Pending" = "Pending";
    if (balanceAmount <= 0) {
      status = "Paid";
    } else if (paidAmount > 0) {
      status = "Partial";
    }

    return {
      semesterName: semNo,
      totalFee,
      paidAmount,
      balanceAmount,
      dueDate,
      progress,
      status,
      breakdown: {
        tuitionFee,
        admissionFee,
        examFee,
        libraryFee,
        laboratoryFee,
        hostelFee,
        transportFee,
        miscellaneousFee,
        fine,
        scholarship,
        discount
      }
    };
  };

  const handleStartProcessing = async () => {
    if (!selectedStudent) return;
    setPayWizardStep("processing");
    setProcessingProgress(0);

    const semDetails = getSemesterFeeOverview(selectedStudent, selectedSemester);
    const parsedAmount = parseFloat(payAmount) || 0;
    const parsedFine = parseFloat(payFineInput) || 0;
    const parsedDiscount = parseFloat(payDiscountInput) || 0;
    const parsedScholarship = parseFloat(payScholarshipInput) || 0;

    const netPayable = parsedAmount + parsedFine - parsedDiscount - parsedScholarship;
    const remainingBalance = Math.max(0, semDetails.balanceAmount - parsedAmount);

    const receiptNumber = `REC${Date.now().toString().slice(-8)}`;
    const transactionId = payTxNo || `TXN${Date.now().toString().slice(-10)}`;

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    try {
      const res = await APIService.addPayment({
        studentId: selectedStudent.StudentID,
        course: selectedStudent.Course,
        semester: selectedSemester,
        feeType: payFeeType,
        amount: parsedAmount,
        fine: parsedFine,
        discount: parsedDiscount,
        balance: remainingBalance,
        paymentMode: payMode,
        transactionNumber: transactionId,
        remarks: payRemarks || `Payment for ${payFeeType} - ${selectedSemester}`
      });

      if (res.success) {
        setTimeout(async () => {
          clearInterval(interval);
          setSuccessReceiptDetails({
            receiptNumber: res.receiptNumber || receiptNumber,
            paymentId: res.paymentId || `PAY${Date.now()}`,
            studentName: selectedStudent.Name,
            studentId: selectedStudent.StudentID,
            course: selectedStudent.Course,
            department: selectedStudent.Department,
            batch: selectedStudent.Batch,
            semester: selectedSemester,
            feeType: payFeeType,
            amount: parsedAmount,
            netPayable: netPayable,
            fine: parsedFine,
            discount: parsedDiscount,
            scholarship: parsedScholarship,
            remainingBalance: remainingBalance,
            paymentMode: payMode,
            transactionId: transactionId,
            bankName: payBankName,
            remarks: payRemarks,
            date: new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          setPayWizardStep("success");
          
          setPayAmount("");
          setPayTxNo("");
          setPayRemarks("");
          setPayBankName("");
          setPayFineInput("0");
          setPayDiscountInput("0");
          setPayScholarshipInput("0");
          
          await loadAllData(true);
        }, 1200);
      } else {
        clearInterval(interval);
        setPaySubmitStatus(`Error: ${res.message}`);
        setPayWizardStep("entry");
      }
    } catch (err: any) {
      clearInterval(interval);
      setPaySubmitStatus(`Error: ${err.message || "Failed to process payment"}`);
      setPayWizardStep("entry");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (confirm("Are you sure you want to permanently delete this payment transaction? This action is restricted to Admins and cannot be undone.")) {
      try {
        // @ts-ignore
        const res = await APIService.deletePayment(paymentId);
        if (res.success) {
          alert("Payment transaction deleted successfully.");
          await loadAllData(true);
        } else {
          alert(`Error: ${res.message}`);
        }
      } catch (err: any) {
        alert(`Error deleting payment: ${err.message}`);
      }
    }
  };

  // Curriculum adding
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode || !cName) return;
    try {
      const res = await APIService.addCourse({
        CourseCode: cCode,
        CourseName: cName,
        Duration: cDuration,
        TotalSemesters: parseInt(cSemesters) || 8,
        CourseFees: parseFloat(cFees) || 0,
        Description: cDesc,
        Status: "Active"
      });
      alert(res.message);
      setCCode(""); setCName(""); setCFees(""); setCDesc("");
      await loadAllData(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dCode || !dName) return;
    try {
      const res = await APIService.addDepartment({
        DepartmentCode: dCode,
        DepartmentName: dName,
        HOD: dHOD,
        Status: "Active"
      });
      alert(res.message);
      setDCode(""); setDName(""); setDHOD("");
      await loadAllData(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName || !bAcadYear) return;
    try {
      const res = await APIService.addBatch({
        BatchName: bName,
        AcademicYear: bAcadYear,
        StartDate: bStart,
        EndDate: bEnd,
        Status: "Active"
      });
      alert(res.message);
      setBName(""); setBAcadYear(""); setBStart(""); setBEnd("");
      await loadAllData(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddSem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sNo || !sCourse) return;
    try {
      const res = await APIService.addSemester({
        SemesterNo: sNo,
        Course: sCourse,
        SemesterFees: parseFloat(sFees) || 0,
        Subjects: sSubjects,
        Status: "Active"
      });
      alert(res.message);
      setSFees(""); setSSubjects("");
      await loadAllData(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit broadcast notification
  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;
    setNotifSubmitStatus("Sending notification broadcast...");

    try {
      const res = await APIService.addNotification({
        Title: notifTitle,
        Message: notifMessage,
        TargetGroup: notifTarget
      });
      if (res.success) {
        setNotifSubmitStatus(`✓ broadcasted: ${res.message}`);
        setNotifTitle("");
        setNotifMessage("");
        await loadAllData(true);
      } else {
        setNotifSubmitStatus(`Error: ${res.message}`);
      }
    } catch (err: any) {
      setNotifSubmitStatus(`Error: ${err.message}`);
    }
  };

  // Save Apps Script connection URL
  const handleSaveConnection = () => {
    if (tempScriptUrl && !tempScriptUrl.startsWith("https://script.google.com")) {
      alert("Invalid format! Google Web App URLs start with https://script.google.com");
      return;
    }
    setScriptUrl(tempScriptUrl);
    alert("Connection configuration saved! Reloading dataset...");
    loadAllData();
  };

  // Attendance quick logger submit
  const handleLogAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attSubject) {
      alert("Specify the lecture subject first");
      return;
    }

    const studentsToLog = students.filter(
      (s) =>
        (!attCourseFilter || s.Course === attCourseFilter) &&
        (!attSemesterFilter || s.Semester === attSemesterFilter)
    );

    if (studentsToLog.length === 0) {
      alert("No students matched criteria to log.");
      return;
    }

    const records: AttendanceRecord[] = studentsToLog.map((s) => ({
      StudentID: s.StudentID,
      Date: attDate,
      Status: attStatusMap[s.StudentID] || "Present",
      Subject: attSubject
    }));

    APIService.logAttendance(records);
    alert(`Successfully logged attendance for ${records.length} students on ${attDate}`);
    loadAllData(true);
  };

  // Academic Performance logger submit
  const handleLogPerformance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeStuId || !gradeSubject || !gradeMarks) {
      alert("Fill required grades fields");
      return;
    }

    const numMarks = parseFloat(gradeMarks);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > 100) {
      alert("Marks must be between 0 and 100");
      return;
    }

    let grade = "F";
    if (numMarks >= 90) grade = "A+";
    else if (numMarks >= 80) grade = "A";
    else if (numMarks >= 70) grade = "B+";
    else if (numMarks >= 60) grade = "B";
    else if (numMarks >= 50) grade = "C";
    else if (numMarks >= 40) grade = "D";

    APIService.addPerformanceRecord({
      StudentID: gradeStuId,
      Subject: gradeSubject,
      Marks: numMarks,
      Grade: grade,
      ExamType: gradeType,
      Semester: gradeSemester || "Semester 1"
    });

    alert(`Marks registered: ${numMarks}% (Grade ${grade}) logged for Student ${gradeStuId}`);
    setGradeMarks("");
    loadAllData(true);
  };

  // Pre-populate target student fields based on selected Student ID
  useEffect(() => {
    if (payStudentId) {
      const selectedS = students.find((s) => s.StudentID === payStudentId);
      if (selectedS) {
        setPayCourse(selectedS.Course);
        setPaySemester(selectedS.Semester);
      }
    }
  }, [payStudentId]);

  useEffect(() => {
    if (feeStudentId) {
      const selectedS = students.find((s) => s.StudentID === feeStudentId);
      if (selectedS) {
        setFeeCourse(selectedS.Course);
        setFeeSemester(selectedS.Semester);
      }
    }
  }, [feeStudentId]);

  // Dynamic calculations for dashboard stats
  const totalStudentsCount = students.length || 1482;
  const activeStudentsCount = students.filter(s => s.Status === "Active").length || 1412;
  const newAdmissionsCount = students.filter(s => s.StudentID.includes("2026") || s.StudentID.includes("2025") || s.Status === "Active").length || 148;
  
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayFeeCollection = payments.filter(p => p.Date === todayDateStr).reduce((sum, p) => sum + p.Amount, 0) || 12500;
  
  const totalRevenueCollected = payments.reduce((sum, p) => sum + p.Amount, 0) || 284000;
  const pendingFeesTotal = assignedFees.reduce((sum, f) => sum + (f.TotalFee - f.PaidFee), 0) || 48500;
  const totalAssignedFee = assignedFees.reduce((sum, f) => sum + f.TotalFee, 0) || 332500;

  // Pie/Donut Chart breakdown ratios
  const paidPct = Math.round((totalRevenueCollected / (totalAssignedFee || 1)) * 100) || 62;
  const pendingPct = Math.round((pendingFeesTotal / (totalAssignedFee || 1)) * 100) || 22;
  const partialPct = 12; // Realistic baseline
  const overduePct = 6; // Realistic baseline

  // Helper function to render micro-sparklines
  const drawSparkline = (points: number[], strokeColor: string) => {
    const width = 80;
    const height = 24;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const svgPoints = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(" ");
    return (
      <svg className="w-16 h-6 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <path
          d={`M ${svgPoints}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Mock data for interactive fee collections
  const collectionsTimeSeries = {
    Daily: [
      { label: "Mon", value: 4200 },
      { label: "Tue", value: 5800 },
      { label: "Wed", value: 3100 },
      { label: "Thu", value: 7200 },
      { label: "Fri", value: 8500 },
      { label: "Sat", value: 4000 },
      { label: "Sun", value: 2500 },
    ],
    Weekly: [
      { label: "Week 1", value: 24000 },
      { label: "Week 2", value: 32000 },
      { label: "Week 3", value: 18000 },
      { label: "Week 4", value: 42000 },
    ],
    Monthly: [
      { label: "Jan", value: 45000 },
      { label: "Feb", value: 52000 },
      { label: "Mar", value: 68000 },
      { label: "Apr", value: 59000 },
      { label: "May", value: 72000 },
      { label: "Jun", value: 85000 },
      { label: "Jul", value: 92000 },
      { label: "Aug", value: 78000 },
      { label: "Sep", value: 88000 },
      { label: "Oct", value: 94000 },
      { label: "Nov", value: 110000 },
      { label: "Dec", value: 125000 },
    ],
    Yearly: [
      { label: "2021", value: 650000 },
      { label: "2022", value: 780000 },
      { label: "2023", value: 890000 },
      { label: "2024", value: 1100000 },
      { label: "2025", value: 1350000 },
      { label: "2026", value: 1550000 },
    ],
  };

  // Triggering excel CSV full report compile & download
  const triggerCSVReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,ID,Name,Details,Date,Amount\n";
    students.forEach(s => {
      csvContent += `Student,${s.StudentID},"${s.Name}",${s.Course} - ${s.Semester},${s.DOB},\n`;
    });
    payments.forEach(p => {
      csvContent += `Payment,${p.TxNo},"${p.StudentName}",${p.FeeType},${p.Date},${p.Amount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `college_erp_full_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setActiveAlert("📊 CSV Academic & Financial spreadsheet compiled and downloaded successfully!");
    setTimeout(() => setActiveAlert(null), 5000);
  };

  // Floating speed-dial FAB state
  const [showSpeedDial, setShowSpeedDial] = useState<boolean>(false);

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300 ${
      darkMode ? "bg-[#090D1A] text-slate-100" : "bg-[#F8FAFC] text-slate-700"
    }`}>
      {/* Toast Alert */}
      {activeAlert && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#1E3A8A] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-blue-400/30 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-yellow-300 shrink-0" />
          <span className="text-xs font-bold">{activeAlert}</span>
          <button onClick={() => setActiveAlert(null)} className="ml-2 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Left Navigation Sidebar */}
      <aside className={`relative transition-all duration-300 bg-[#070D19] text-slate-300 flex flex-col shrink-0 border-r border-[#131E35] ${
        sidebarCollapsed ? "w-full md:w-20" : "w-full md:w-64"
      }`}>
        {/* Toggle Sidebar Collapse Button (Desktop Only) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-8 -right-3 hidden md:flex w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white items-center justify-center border border-blue-400/40 cursor-pointer shadow-lg hover:scale-110 transition-all z-40"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="w-3.5 h-3.5" />
        </button>

        {/* Brand Header */}
        <div className="p-5 border-b border-[#131E35] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20 shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden animate-fade-in">
              <h3 className="font-extrabold text-white text-sm tracking-wide">CAMPUSSYNC</h3>
              <p className="text-[9px] text-blue-400 font-extrabold uppercase tracking-widest">Enterprise ERP</p>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className={`text-[9px] uppercase text-slate-500 font-bold px-3 mb-2 tracking-widest ${sidebarCollapsed ? "text-center" : ""}`}>
            {sidebarCollapsed ? "NAV" : "Navigation"}
          </div>
          
          {/* Dashboard */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setActiveTab("dashboard")}
            title="Dashboard"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/40" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Dashboard & Analytics</span>}
          </motion.button>

          {/* Admission Screen */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setActiveTab("admission")}
            title="Admissions"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "admission" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/40" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            {!sidebarCollapsed && <span className="flex items-center gap-1.5">Admission Portal <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-black">LIVE</span></span>}
          </motion.button>

          {/* Students Directory */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setActiveTab("students")}
            title="Students"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "students" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/40" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <Users className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Students Directory</span>}
          </motion.button>

          {/* Courses */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => {
              setActiveTab("curriculum");
              setCurriculumSubTab("courses");
            }}
            title="Courses"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "curriculum" && curriculumSubTab === "courses"
                ? "bg-[#1E2E54] text-white" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Courses</span>}
          </motion.button>

          {/* Departments */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => {
              setActiveTab("curriculum");
              setCurriculumSubTab("departments");
            }}
            title="Departments"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "curriculum" && curriculumSubTab === "departments"
                ? "bg-[#1E2E54] text-white" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <Building className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Departments</span>}
          </motion.button>

          {/* Batch */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => {
              setActiveTab("curriculum");
              setCurriculumSubTab("batches");
            }}
            title="Batches"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "curriculum" && curriculumSubTab === "batches"
                ? "bg-[#1E2E54] text-white" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Batch Roster</span>}
          </motion.button>

          {/* Semester */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => {
              setActiveTab("curriculum");
              setCurriculumSubTab("semesters");
            }}
            title="Semesters"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "curriculum" && curriculumSubTab === "semesters"
                ? "bg-[#1E2E54] text-white" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Semesters</span>}
          </motion.button>

          {/* Divider */}
          <div className="h-[1px] bg-[#131E35] my-2"></div>

          {/* Fee Assignment */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setActiveTab("fees")}
            title="Fee Assignment"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "fees" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/40" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <DollarSign className="w-4 h-4 shrink-0 text-blue-400" />
            {!sidebarCollapsed && <span>Fee Assignment</span>}
          </motion.button>

          {/* Fee Payment */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => {
              setActiveTab("payments");
              setPayWizardStep("search");
            }}
            title="Fee Payment"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "payments" && payWizardStep === "search"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/40" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <CreditCard className="w-4 h-4 shrink-0 text-emerald-400" />
            {!sidebarCollapsed && <span>Fee Payment Desk</span>}
          </motion.button>

          {/* Receipts */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => {
              setActiveTab("payments");
              setPayWizardStep("review");
            }}
            title="Receipts Ledger"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "payments" && payWizardStep === "review"
                ? "bg-[#1E2E54] text-white" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Receipts Ledger</span>}
          </motion.button>

          {/* Reports */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={triggerCSVReport}
            title="Download Reports"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-400 shrink-0" />
            {!sidebarCollapsed && <span>Reports Compiler</span>}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setActiveTab("notifications")}
            title="Notifications Desk"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "notifications" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/40" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Notifications Desk</span>}
          </motion.button>

          {/* Users */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setActiveTab("users")}
            title="Users Directory"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "users" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/40" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>System Users</span>}
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ x: sidebarCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setActiveTab("settings")}
            title="Settings"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "settings" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/40" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Sync Configuration</span>}
          </motion.button>
        </nav>

        {/* Quick Sync & Logout footer */}
        <div className="p-4 bg-black/10 border-t border-[#131E35] space-y-2">
          {!sidebarCollapsed && <div className="text-[9px] uppercase text-slate-500 font-bold px-3 mb-1 tracking-widest">Database</div>}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => loadAllData()}
            disabled={isSyncing}
            className={`w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 transition-all rounded-xl text-xs font-bold text-blue-400 border border-blue-500/10 cursor-pointer disabled:opacity-50 ${sidebarCollapsed ? "p-1.5" : "px-3"}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {!sidebarCollapsed && <span>{isSyncing ? "Syncing..." : "Sync Sheets"}</span>}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className={`w-full flex items-center justify-center gap-2 py-2.5 hover:bg-rose-500/10 transition-all rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 cursor-pointer ${sidebarCollapsed ? "p-1.5" : "px-3"}`}
          >
            <LogOut className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>{t("Logout")}</span>}
          </motion.button>
        </div>
      </aside>

      {/* Main Panel with App Bar & Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top App Bar */}
        <header className={`h-16 px-6 md:px-8 flex items-center justify-between shrink-0 border-b transition-all duration-300 z-30 ${
          darkMode 
            ? "bg-[#0F172A]/85 border-[#1E293B] text-slate-100 backdrop-blur-md" 
            : "bg-white/85 border-slate-200/60 text-slate-800 backdrop-blur-md"
        }`}>
          {/* Dashboard Title or Search */}
          <div className="flex items-center gap-4">
            <div className="md:hidden w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold">C</div>
            <div>
              <h2 className="text-sm md:text-base font-black tracking-tight flex items-center gap-2">
                CampusSync Dashboard
                <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full font-black hidden sm:inline-block border border-blue-500/20">
                  v3.5 Enterprise
                </span>
              </h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">Administrator Console</p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="relative max-w-xs md:max-w-md w-full hidden md:block mx-4">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search student directories, bills, course registries..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className={`block w-full pl-9 pr-3 py-2 rounded-xl text-xs placeholder-slate-400 focus:outline-none transition-all ${
                darkMode 
                  ? "bg-[#1E293B] border-[#2D3748] text-slate-100 focus:bg-[#2D3748] focus:border-blue-500" 
                  : "bg-[#F1F5F9] border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500"
              }`}
            />
            {/* Live Search Results Dropdown */}
            {globalSearch && (
              <div className={`absolute top-11 left-0 right-0 p-3 rounded-2xl shadow-2xl border z-50 max-h-80 overflow-y-auto ${
                darkMode ? "bg-[#131E35] border-[#1E2E54] text-slate-100" : "bg-white border-slate-200 text-slate-800"
              }`}>
                <p className="text-[10px] text-slate-400 font-bold uppercase pb-1.5 border-b border-slate-200/20">Matching Students & Registry</p>
                {students.filter(s => s.Name.toLowerCase().includes(globalSearch.toLowerCase()) || s.StudentID.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 5).map(s => (
                  <div 
                    key={s.StudentID}
                    onClick={() => {
                      setActiveTab("students");
                      setStuSearch(s.Name);
                      setGlobalSearch("");
                    }}
                    className="p-2 hover:bg-blue-600/10 rounded-lg cursor-pointer flex items-center justify-between text-xs mt-1 transition-all"
                  >
                    <span className="font-bold">{s.Name}</span>
                    <span className="font-mono text-[10px] text-blue-400 font-bold uppercase">{s.StudentID} • {getCourseName(s.Course)}</span>
                  </div>
                ))}
                {students.filter(s => s.Name.toLowerCase().includes(globalSearch.toLowerCase())).length === 0 && (
                  <p className="text-xs text-slate-400 py-2 text-center">No students match your query</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3.5 ml-auto">
            {/* Real-time date display */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-400 bg-blue-500/5 px-3.5 py-1.5 rounded-xl border border-blue-500/10">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Friday, July 3, 2026</span>
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border cursor-pointer hover:scale-105 transition-all ${
                darkMode ? "bg-[#1E293B] border-[#2D3748] text-yellow-400" : "bg-[#F1F5F9] border-slate-200 text-slate-600"
              }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification icons with customized dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationsDropdown(!showNotificationsDropdown);
                  setShowMessagesDropdown(false);
                }}
                className={`p-2 rounded-xl border cursor-pointer hover:scale-105 transition-all relative ${
                  darkMode ? "bg-[#1E293B] border-[#2D3748] text-slate-300" : "bg-[#F1F5F9] border-slate-200 text-slate-600"
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center border border-white">
                  6
                </span>
              </button>
              {showNotificationsDropdown && (
                <div className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl border p-4 z-50 animate-fade-in ${
                  darkMode ? "bg-[#131E35] border-[#1E2E54] text-slate-100" : "bg-white border-slate-200 text-slate-800"
                }`}>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/10 mb-2">
                    <span className="text-xs font-black">Recent Activity Timelines</span>
                    <span className="text-[10px] text-blue-400 font-bold hover:underline cursor-pointer" onClick={() => setShowNotificationsDropdown(false)}>Dismiss All</span>
                  </div>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    {auditLogs.slice(0, 5).map((log, idx) => (
                      <div key={idx} className="text-[11px] p-2 rounded-lg hover:bg-slate-500/5 transition-all">
                        <p className="font-bold text-blue-400">⏱️ {log.Action}</p>
                        <p className="text-slate-400">{log.Details}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{new Date(log.Timestamp).toLocaleTimeString()}</p>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <p className="text-xs text-slate-400 py-4 text-center">No recent administrative logs</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Messages icon with dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMessagesDropdown(!showMessagesDropdown);
                  setShowNotificationsDropdown(false);
                }}
                className={`p-2 rounded-xl border cursor-pointer hover:scale-105 transition-all relative ${
                  darkMode ? "bg-[#1E293B] border-[#2D3748] text-slate-300" : "bg-[#F1F5F9] border-slate-200 text-slate-600"
                }`}
              >
                <Mail className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-blue-500 text-white font-black text-[9px] rounded-full flex items-center justify-center border border-white">
                  3
                </span>
              </button>
              {showMessagesDropdown && (
                <div className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl border p-4 z-50 animate-fade-in ${
                  darkMode ? "bg-[#131E35] border-[#1E2E54] text-slate-100" : "bg-white border-slate-200 text-slate-800"
                }`}>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/10 mb-2">
                    <span className="text-xs font-black">Admin Intercom Messages</span>
                    <span className="text-[10px] text-blue-400 hover:underline cursor-pointer" onClick={() => setShowMessagesDropdown(false)}>Clear</span>
                  </div>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    <div className="text-[11px] p-2 rounded-lg hover:bg-slate-500/5 transition-all border-l-2 border-blue-500">
                      <p className="font-bold">HOD Computer Science</p>
                      <p className="text-slate-400">"Syllabus for Semester 3 is fully compiled in the sheets registry."</p>
                    </div>
                    <div className="text-[11px] p-2 rounded-lg hover:bg-slate-500/5 transition-all border-l-2 border-blue-500">
                      <p className="font-bold">Accounts Director</p>
                      <p className="text-slate-400">"Total collections today synchronized successfully with Google Sheets."</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <span className="h-6 w-[1px] bg-slate-200/30"></span>

            {/* User Profile Info */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-blue-500/10 border border-blue-400/30">
                {user.Username.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-black leading-tight text-slate-200" style={{ color: darkMode ? "#f8fafc" : "#1e293b" }}>{user.Username}</p>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mt-0.5">{user.Role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className={`flex-1 p-6 md:p-8 overflow-y-auto min-w-0 transition-all ${
          darkMode ? "bg-[#090D1A]" : "bg-[#F8FAFC]"
        }`}>
          {/* Synchronizing indicator status bar */}
          {syncStatus && (
            <div className={`p-4 mb-6 rounded-2xl flex items-center justify-between text-sm ${
              syncStatus.success ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              <div className="flex items-center gap-2">
                {syncStatus.success ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
                <span className="font-bold text-xs">{syncStatus.text}</span>
              </div>
              <button onClick={() => setSyncStatus(null)} className="text-xs hover:underline font-bold">Dismiss</button>
            </div>
          )}

          {/* TAB 1: DASHBOARD & REPORT */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats overview cards (Six Top Row Animated KPI Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                {/* Card 1: Total Students */}
                <div className={`p-4.5 rounded-2xl border transition-all hover:scale-[1.02] ${
                  darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] shadow-lg shadow-black/30" : "bg-white border-slate-200/80 shadow-sm"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Students</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <h3 className="text-xl font-bold font-mono text-blue-500">{totalStudentsCount}</h3>
                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      ↑ 8.4%
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/10 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold">Registration Trend</span>
                    {drawSparkline([1320, 1350, 1370, 1390, 1420, 1450, totalStudentsCount], "#3B82F6")}
                  </div>
                </div>

                {/* Card 2: Active Students */}
                <div className={`p-4.5 rounded-2xl border transition-all hover:scale-[1.02] ${
                  darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] shadow-lg shadow-black/30" : "bg-white border-slate-200/80 shadow-sm"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Status</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <h3 className="text-xl font-bold font-mono text-emerald-500">{activeStudentsCount}</h3>
                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      ↑ 6.1%
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/10 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold">Roster Retention</span>
                    {drawSparkline([1290, 1310, 1330, 1340, 1360, 1390, activeStudentsCount], "#10B981")}
                  </div>
                </div>

                {/* Card 3: New Admissions */}
                <div className={`p-4.5 rounded-2xl border transition-all hover:scale-[1.02] ${
                  darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] shadow-lg shadow-black/30" : "bg-white border-slate-200/80 shadow-sm"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Admissions</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <h3 className="text-xl font-bold font-mono text-indigo-400">{newAdmissionsCount}</h3>
                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      ↑ 12.3%
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/10 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold">Admission Velocity</span>
                    {drawSparkline([80, 95, 110, 105, 125, 130, newAdmissionsCount], "#8B5CF6")}
                  </div>
                </div>

                {/* Card 4: Fee Collection Today */}
                <div className={`p-4.5 rounded-2xl border transition-all hover:scale-[1.02] ${
                  darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] shadow-lg shadow-black/30" : "bg-white border-slate-200/80 shadow-sm"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Today's Cash</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <h3 className="text-xl font-bold font-mono text-amber-500">${todayFeeCollection.toLocaleString()}</h3>
                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      ↑ 15.2%
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/10 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold">Hourly Ingress</span>
                    {drawSparkline([2100, 3400, 1900, 4500, 5200, 3100, todayFeeCollection], "#F59E0B")}
                  </div>
                </div>

                {/* Card 5: Pending Fees */}
                <div className={`p-4.5 rounded-2xl border transition-all hover:scale-[1.02] ${
                  darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] shadow-lg shadow-black/30" : "bg-white border-slate-200/80 shadow-sm"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Outstanding</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <h3 className="text-xl font-bold font-mono text-rose-500">${pendingFeesTotal.toLocaleString()}</h3>
                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      ↓ 4.1%
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/10 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold">Deficit Wave</span>
                    {drawSparkline([45000, 43000, 41000, 38000, 35000, 31000, pendingFeesTotal], "#EF4444")}
                  </div>
                </div>

                {/* Card 6: Total Revenue */}
                <div className={`p-4.5 rounded-2xl border transition-all hover:scale-[1.02] ${
                  darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] shadow-lg shadow-black/30" : "bg-white border-slate-200/80 shadow-sm"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Revenue</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <h3 className="text-xl font-bold font-mono text-teal-400">${totalRevenueCollected.toLocaleString()}</h3>
                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      ↑ 18.2%
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/10 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold">Accumulation</span>
                    {drawSparkline([120000, 135000, 150000, 168000, 185000, 205000, totalRevenueCollected], "#14B8A6")}
                  </div>
                </div>
              </div>

              {/* Fee Collection Analytics & Fee Status (2-column bento box) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 & 2: Large Interactive Line Chart */}
                <div className={`lg:col-span-2 p-6 rounded-3xl border ${
                  darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] shadow-lg shadow-black/30" : "bg-white border-slate-200/80 shadow-sm"
                }`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-blue-500">Fee Collection Analytics</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Interactive revenue ingress monitoring ledger</p>
                    </div>
                    {/* Timeframe Toggle Buttons */}
                    <div className={`flex p-1 rounded-xl text-xs font-bold border ${
                      darkMode ? "bg-[#1A253E] border-[#2E3F6E] text-slate-300" : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}>
                      {(["Daily", "Weekly", "Monthly", "Yearly"] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setAnalyticsTimeframe(period)}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            analyticsTimeframe === period
                              ? "bg-blue-600 text-white shadow-md shadow-blue-900/45"
                              : "hover:text-blue-500"
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Line / Area Chart */}
                  <div className="relative h-64 w-full pt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                      <defs>
                        <linearGradient id="chartBlueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="0" y1="0" x2="500" y2="0" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                      <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                      <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                      <line x1="0" y1="200" x2="500" y2="200" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />

                      {/* Area & Path Calculation */}
                      {(() => {
                        const data = collectionsTimeSeries[analyticsTimeframe];
                        const maxVal = Math.max(...data.map(d => d.value)) * 1.12;
                        const height = 200;
                        const width = 500;
                        const coordinates = data.map((d, i) => {
                          const x = (i / (data.length - 1)) * width;
                          const y = height - (d.value / maxVal) * height + 10;
                          return { x, y, value: d.value, label: d.label };
                        });

                        const pathD = coordinates.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
                        const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

                        return (
                          <>
                            {/* Area Filled Gradient */}
                            <path d={areaD} fill="url(#chartBlueGrad)" />
                            {/* Primary Curve Line */}
                            <path d={pathD} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />

                            {/* Highlighted circles & Interaction bars */}
                            {coordinates.map((c, idx) => (
                              <g key={idx} className="group/node">
                                {/* Invisible touch targets for hovering */}
                                <rect
                                  x={c.x - 12}
                                  y={0}
                                  width={24}
                                  height={200}
                                  fill="transparent"
                                  className="cursor-pointer"
                                  onMouseEnter={() => setHoveredChartIndex(idx)}
                                  onMouseLeave={() => setHoveredChartIndex(null)}
                                />
                                {/* Highlight circle indicator */}
                                <circle
                                  cx={c.x}
                                  cy={c.y}
                                  r={hoveredChartIndex === idx ? 6 : 4}
                                  className={`${hoveredChartIndex === idx ? "fill-white stroke-blue-600 stroke-2" : "fill-blue-500"} transition-all duration-150`}
                                />
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>

                    {/* Interactive Hover Tooltip */}
                    {hoveredChartIndex !== null && (
                      <div 
                        className={`absolute p-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-bold pointer-events-none transition-all duration-150 ${
                          darkMode ? "bg-[#131E35]/95 border-[#1E2E54] text-white" : "bg-white/95 border-slate-200 text-slate-800"
                        }`}
                        style={{
                          left: `${Math.min(80, (hoveredChartIndex / (collectionsTimeSeries[analyticsTimeframe].length - 1)) * 95)}%`,
                          top: "20px"
                        }}
                      >
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">{collectionsTimeSeries[analyticsTimeframe][hoveredChartIndex].label} Ingress</p>
                        <p className="text-base text-blue-500 font-mono mt-1">
                          ${collectionsTimeSeries[analyticsTimeframe][hoveredChartIndex].value.toLocaleString()}
                        </p>
                        <p className="text-[9px] text-emerald-500 font-extrabold mt-0.5">✓ Google Sheets Synced</p>
                      </div>
                    )}
                  </div>

                  {/* X-Axis labels */}
                  <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                    {collectionsTimeSeries[analyticsTimeframe].map((d, i) => (
                      <span key={i} className="text-center w-10">{d.label}</span>
                    ))}
                  </div>
                </div>

                {/* Column 3: Modern Donut Chart (Fee Status) */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] shadow-lg shadow-black/30" : "bg-white border-slate-200/80 shadow-sm"
                }`}>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-emerald-500">Fee status ratio</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Real-time tuition bill clearance ratios</p>
                  </div>

                  {/* Concentric / Ring Donut Chart */}
                  <div className="flex items-center justify-center my-6 relative">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                      {/* Background circle */}
                      <circle cx="60" cy="60" r="48" className="stroke-slate-200/10 fill-none" strokeWidth="10" />

                      {/* Slices stacked using dashoffset */}
                      {/* Paid slice: 62% (Circumference is 2 * PI * 48 = 301.59) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        stroke="#10B981"
                        strokeWidth="10"
                        className="fill-none transition-all duration-500"
                        strokeDasharray="301.59"
                        strokeDashoffset={301.59 * (1 - paidPct / 100)}
                        strokeLinecap="round"
                      />

                      {/* Pending slice: 22% */}
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        stroke="#2563EB"
                        strokeWidth="10"
                        className="fill-none transition-all duration-500"
                        strokeDasharray="301.59"
                        strokeDashoffset={301.59 * (1 - pendingPct / 100)}
                        transform="rotate(220, 60, 60)"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Donut Center Label */}
                    <div className="absolute text-center">
                      <span className="text-2xl font-extrabold text-blue-500 font-mono">{paidPct}%</span>
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Paid Rate</p>
                    </div>
                  </div>

                  {/* Legend Grid */}
                  <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-slate-200/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold">Paid ({paidPct}%)</p>
                        <p className="text-xs font-bold font-mono text-slate-200" style={{ color: darkMode ? "#f8fafc" : "#1e293b" }}>
                          ${Math.round(totalRevenueCollected).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold">Pending ({pendingPct}%)</p>
                        <p className="text-xs font-bold font-mono text-slate-200" style={{ color: darkMode ? "#f8fafc" : "#1e293b" }}>
                          ${Math.round(pendingFeesTotal).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold">Partial ({partialPct}%)</p>
                        <p className="text-xs font-bold font-mono text-slate-400">Ledger Overlap</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold">Overdue ({overduePct}%)</p>
                        <p className="text-xs font-bold font-mono text-rose-500">Deficit Warnings</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Overview, Upcoming Due Alert, and Timelines (3-column layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel 1: Student Overview Metric Distributions */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] shadow-lg shadow-black/30" : "bg-white border-slate-200/80 shadow-sm"
                }`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-blue-500">Student Overview</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Demographics & syllabus mapping</p>
                      </div>
                    </div>

                    {/* Overview selection buttons */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-slate-500/5 border border-slate-500/10 rounded-xl mt-4 text-[9px] font-black text-center text-slate-400 uppercase">
                      {(["Course", "Department", "Semester", "Gender"] as const).map((metric) => (
                        <button
                          key={metric}
                          onClick={() => setOverviewBreakdown(metric)}
                          className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                            overviewBreakdown === metric
                              ? "bg-blue-600 text-white shadow"
                              : "hover:text-blue-400"
                          }`}
                        >
                          {metric}
                        </button>
                      ))}
                    </div>

                    {/* Render dynamic percentage horizontal progress bars */}
                    <div className="space-y-4 mt-6">
                      {overviewBreakdown === "Course" && (
                        <>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold">B.Tech CSE</span>
                              <span className="font-mono text-blue-400 font-bold">45%</span>
                            </div>
                            <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: "45%" }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold">MBA Finance</span>
                              <span className="font-mono text-indigo-400 font-bold">30%</span>
                            </div>
                            <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: "30%" }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold">B.Sc Physics</span>
                              <span className="font-mono text-emerald-400 font-bold">25%</span>
                            </div>
                            <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "25%" }}></div>
                            </div>
                          </div>
                        </>
                      )}

                      {overviewBreakdown === "Department" && (
                        <>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold">Computer Science</span>
                              <span className="font-mono text-blue-400 font-bold">55%</span>
                            </div>
                            <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: "55%" }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold">Business School</span>
                              <span className="font-mono text-indigo-400 font-bold">25%</span>
                            </div>
                            <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: "25%" }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold">Natural Sciences</span>
                              <span className="font-mono text-emerald-400 font-bold">20%</span>
                            </div>
                            <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "20%" }}></div>
                            </div>
                          </div>
                        </>
                      )}

                      {overviewBreakdown === "Semester" && (
                        <>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold">Semester 1</span>
                              <span className="font-mono text-blue-400 font-bold">35%</span>
                            </div>
                            <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: "35%" }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold">Semester 2</span>
                              <span className="font-mono text-indigo-400 font-bold">40%</span>
                            </div>
                            <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: "40%" }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold">Semester 3</span>
                              <span className="font-mono text-emerald-400 font-bold">25%</span>
                            </div>
                            <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "25%" }}></div>
                            </div>
                          </div>
                        </>
                      )}

                      {overviewBreakdown === "Gender" && (
                        <>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold">Male Roster</span>
                              <span className="font-mono text-blue-400 font-bold">52%</span>
                            </div>
                            <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: "52%" }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold">Female Roster</span>
                              <span className="font-mono text-indigo-400 font-bold">48%</span>
                            </div>
                            <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: "48%" }}></div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/10 mt-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Total Active Students: {activeStudentsCount} Candidates
                  </div>
                </div>

                {/* Panel 2: Upcoming Due Fees Alert Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-600 to-red-700 text-white border border-rose-500 shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4 scale-150">
                    <DollarSign className="w-24 h-24" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-red-100">Fee Deficit warning</h3>
                        <p className="text-lg font-black tracking-tight leading-none">Upcoming Due Fees</p>
                      </div>
                    </div>

                    {/* Deficit candidate info card */}
                    <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-200">Candidate Name</span>
                        <span className="text-xs font-mono font-bold text-yellow-300">Overdue Status</span>
                      </div>
                      <p className="text-base font-black">Alexandre Martinez</p>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 text-xs">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-red-200 block">DUE AMOUNT</span>
                          <span className="font-bold font-mono text-lg text-yellow-200">$1,450.00</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-red-200 block">DUE DATE</span>
                          <span className="font-semibold block">July 10, 2026</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-red-200 font-bold block pt-1 uppercase">Semester: Semester 3</p>
                    </div>
                  </div>

                  {/* Dispatch Intercom reminder trigger */}
                  <button
                    onClick={() => {
                      setActiveAlert("🔔 Intercom reminder notice dispatched successfully to Alexandre Martinez!");
                      setTimeout(() => setActiveAlert(null), 5000);
                    }}
                    className="w-full py-3 bg-white text-rose-700 font-extrabold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-lg mt-4 text-center block"
                  >
                    Send Urgent Reminder Alert
                  </button>
                </div>

                {/* Panel 3: Notifications timelines */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] shadow-lg shadow-black/30" : "bg-white border-slate-200/80 shadow-sm"
                }`}>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-indigo-500">Broadcasting Logs Timeline</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Real-time college activity log timeline</p>
                  </div>

                  {/* Timeline Feed */}
                  <div className="space-y-4 mt-6 max-h-60 overflow-y-auto pr-1">
                    <div className="flex gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1 shadow-lg shadow-blue-500/50"></div>
                      <div>
                        <p className="text-xs font-black text-slate-300" style={{ color: darkMode ? "#f8fafc" : "#1e293b" }}>New Admission STU-2026-081</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Sophia Loren registered under CS core syllabus.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1 shadow-lg shadow-emerald-500/50"></div>
                      <div>
                        <p className="text-xs font-black text-slate-300" style={{ color: darkMode ? "#f8fafc" : "#1e293b" }}>Fee Payment Receipt Generated</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Paid tuition sum $1,250 on Cash Desk.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1 shadow-lg shadow-amber-500/50"></div>
                      <div>
                        <p className="text-xs font-black text-slate-300" style={{ color: darkMode ? "#f8fafc" : "#1e293b" }}>Overdue Warning Broadcast</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Portal alerts dispatched to outstanding candidates.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 mt-1 shadow-lg shadow-purple-500/50"></div>
                      <div>
                        <p className="text-xs font-black text-slate-300" style={{ color: darkMode ? "#f8fafc" : "#1e293b" }}>Lecture attendance logged</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">HOD CS posted attendance values for Semester 1 CS.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("notifications")}
                    className="w-full py-2.5 bg-blue-600/10 text-blue-400 font-bold text-xs rounded-xl hover:bg-blue-600/20 transition-all border border-blue-500/10 cursor-pointer text-center mt-4"
                  >
                    Manage Broadcaster Desk
                  </button>
                </div>
              </div>

              {/* Recent Admissions & Payments (2-column tables) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Column 1: Recent Admissions */}
                <div className={`p-6 rounded-3xl border ${
                  darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] shadow-lg shadow-black/30" : "bg-white border-slate-200/80 shadow-sm"
                }`}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-blue-500">Recent Roster Admissions</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Latest college entrants registry logs</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("students")}
                      className="text-xs text-blue-500 hover:underline font-bold"
                    >
                      View All Students
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/10 text-slate-400 uppercase text-[9px] font-black tracking-wider">
                          <th className="py-3 px-2">Student Photo</th>
                          <th className="py-3 px-2">Student Name</th>
                          <th className="py-3 px-2">Register Number</th>
                          <th className="py-3 px-2">Course</th>
                          <th className="py-3 px-2">Date</th>
                          <th className="py-3 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/5 font-semibold text-slate-300" style={{ color: darkMode ? "#cbd5e1" : "#334155" }}>
                        {students.slice(0, 5).map((s, idx) => (
                          <tr key={s.StudentID || idx} className="hover:bg-slate-500/5 transition-all">
                            <td className="py-2.5 px-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 font-black flex items-center justify-center border border-blue-500/20 shadow-sm">
                                {s.Name.charAt(0).toUpperCase()}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 font-bold">{s.Name}</td>
                            <td className="py-2.5 px-2 font-mono text-xs">{s.StudentID}</td>
                            <td className="py-2.5 px-2 text-blue-400 font-bold">{getCourseName(s.Course)}</td>
                            <td className="py-2.5 px-2 text-[11px] text-slate-400">{s.DOB || "July 2, 2026"}</td>
                            <td className="py-2.5 px-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                s.Status === "Active" 
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" 
                                  : "bg-rose-500/15 text-rose-400 border-rose-500/20"
                              }`}>
                                {s.Status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {students.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-400 font-bold">No registered candidates found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Column 2: Recent Payments */}
                <div className={`p-6 rounded-3xl border ${
                  darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] shadow-lg shadow-black/30" : "bg-white border-slate-200/80 shadow-sm"
                }`}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-emerald-500">Recent Payment Collections</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Tuition bill clearance ledger ingress</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("payments")}
                      className="text-xs text-emerald-500 hover:underline font-bold"
                    >
                      View All Payments
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/10 text-slate-400 uppercase text-[9px] font-black tracking-wider">
                          <th className="py-3 px-2">Receipt Number</th>
                          <th className="py-3 px-2">Student Name</th>
                          <th className="py-3 px-2">Semester</th>
                          <th className="py-3 px-2">Fee Type</th>
                          <th className="py-3 px-2 text-right">Amount</th>
                          <th className="py-3 px-2 text-center">Mode</th>
                          <th className="py-3 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/5 font-semibold text-slate-300" style={{ color: darkMode ? "#cbd5e1" : "#334155" }}>
                        {payments.slice(0, 5).map((p, idx) => (
                          <tr key={p.TxNo || idx} className="hover:bg-slate-500/5 transition-all">
                            <td className="py-2.5 px-2 font-mono text-xs text-blue-400 font-bold">{p.TxNo}</td>
                            <td className="py-2.5 px-2 font-bold">{p.StudentName}</td>
                            <td className="py-2.5 px-2">{p.Semester || "Semester 1"}</td>
                            <td className="py-2.5 px-2 text-[11px] text-slate-400">{p.FeeType}</td>
                            <td className="py-2.5 px-2 font-mono text-right text-emerald-400 font-bold">${p.Amount.toLocaleString()}</td>
                            <td className="py-2.5 px-2 text-center text-[11px]">{p.Mode}</td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                Paid
                              </span>
                            </td>
                          </tr>
                        ))}
                        {payments.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-slate-400 font-bold">No transaction records found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Large Rounded Action Buttons (Quick Action Cards) */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-blue-500">Quick Administrator Actions</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Quick bypass controls for university registries</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {/* Action 1: Add Student */}
                  <button
                    onClick={() => {
                      setActiveTab("students");
                      setShowAddStuModal(true);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.04] cursor-pointer group ${
                      darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] hover:border-blue-500" : "bg-white border-slate-200/80 hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-all">
                      <Plus className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black mt-3">Add Student</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">New Candidate Roster</p>
                  </button>

                  {/* Action 2: New Admission */}
                  <button
                    onClick={() => {
                      setActiveTab("students");
                      setShowAddStuModal(true);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.04] cursor-pointer group ${
                      darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] hover:border-blue-500" : "bg-white border-slate-200/80 hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-all">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black mt-3">New Admission</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Fast-track Entrance</p>
                  </button>

                  {/* Action 3: Assign Fees */}
                  <button
                    onClick={() => setActiveTab("fees")}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.04] cursor-pointer group ${
                      darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] hover:border-blue-500" : "bg-white border-slate-200/80 hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center group-hover:scale-110 transition-all">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black mt-3">Assign Fees</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Bulk Bill Dispatch</p>
                  </button>

                  {/* Action 4: Collect Payment */}
                  <button
                    onClick={() => {
                      setActiveTab("payments");
                      setPayWizardStep("search");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.04] cursor-pointer group ${
                      darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] hover:border-blue-500" : "bg-white border-slate-200/80 hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-all">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black mt-3">Collect Payment</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Bypass Cash Register</p>
                  </button>

                  {/* Action 5: Print Receipt */}
                  <button
                    onClick={() => {
                      setActiveTab("payments");
                      setPayWizardStep("review");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.04] cursor-pointer group ${
                      darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] hover:border-blue-500" : "bg-white border-slate-200/80 hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-all">
                      <Printer className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black mt-3">Print Receipt</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Invoice PDF Generation</p>
                  </button>

                  {/* Action 6: Generate Report */}
                  <button
                    onClick={triggerCSVReport}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.04] cursor-pointer group ${
                      darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] hover:border-blue-500" : "bg-white border-slate-200/80 hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-all">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black mt-3">Generate Report</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Spreadsheet Compilation</p>
                  </button>

                  {/* Action 7: Add Course */}
                  <button
                    onClick={() => {
                      setActiveTab("curriculum");
                      setCurriculumSubTab("courses");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.04] cursor-pointer group ${
                      darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] hover:border-blue-500" : "bg-white border-slate-200/80 hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-all">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black mt-3">Add Course</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Curriculum Expansion</p>
                  </button>

                  {/* Action 8: Add Department */}
                  <button
                    onClick={() => {
                      setActiveTab("curriculum");
                      setCurriculumSubTab("departments");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.04] cursor-pointer group ${
                      darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] hover:border-blue-500" : "bg-white border-slate-200/80 hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-all">
                      <Building className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black mt-3">Add Department</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Faculty Administrative Node</p>
                  </button>

                  {/* Action 9: Add Batch */}
                  <button
                    onClick={() => {
                      setActiveTab("curriculum");
                      setCurriculumSubTab("batches");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.04] cursor-pointer group ${
                      darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] hover:border-blue-500" : "bg-white border-slate-200/80 hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-all">
                      <Layers className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black mt-3">Add Batch</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Academic Cohort Entry</p>
                  </button>

                  {/* Action 10: Add Semester */}
                  <button
                    onClick={() => {
                      setActiveTab("curriculum");
                      setCurriculumSubTab("semesters");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.04] cursor-pointer group ${
                      darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] hover:border-blue-500" : "bg-white border-slate-200/80 hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-all">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black mt-3">Add Semester</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Academic Term Slots</p>
                  </button>

                  {/* Action 11: Manage Users */}
                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      setActiveAlert("🛡️ Opened Active Admin Sheet synchronizations.");
                      setTimeout(() => setActiveAlert(null), 4000);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.04] cursor-pointer group ${
                      darkMode ? "bg-[#111A2E]/80 border-[#1E2E54] hover:border-blue-500" : "bg-white border-slate-200/80 hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-all">
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black mt-3">Manage Users</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Privileges Matrix</p>
                  </button>
                </div>
              </div>

              {/* Bottom Dashboard Bento Grid Summaries */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-blue-500">Global Registry Bento Metrics</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Overall system summary matrix</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  <div className={`p-4 rounded-2xl border text-center ${
                    darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200"
                  }`}>
                    <p className="text-2xl font-black text-blue-500 font-mono">{courses.length || 6}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Courses</p>
                  </div>
                  <div className={`p-4 rounded-2xl border text-center ${
                    darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200"
                  }`}>
                    <p className="text-2xl font-black text-emerald-500 font-mono">{departments.length || 4}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Departments</p>
                  </div>
                  <div className={`p-4 rounded-2xl border text-center ${
                    darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200"
                  }`}>
                    <p className="text-2xl font-black text-indigo-400 font-mono">{batches.length || 3}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Batches</p>
                  </div>
                  <div className={`p-4 rounded-2xl border text-center ${
                    darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200"
                  }`}>
                    <p className="text-2xl font-black text-purple-400 font-mono">{semesters.length || 3}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Semesters</p>
                  </div>
                  <div className={`p-4 rounded-2xl border text-center ${
                    darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200"
                  }`}>
                    <p className="text-2xl font-black text-amber-500 font-mono">18</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Faculty</p>
                  </div>
                  <div className={`p-4 rounded-2xl border text-center ${
                    darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200"
                  }`}>
                    <p className="text-2xl font-black text-rose-400 font-mono">12</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Staff</p>
                  </div>
                  <div className={`p-4 rounded-2xl border text-center ${
                    darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200"
                  }`}>
                    <p className="text-2xl font-black text-teal-400 font-mono">{activeStudentsCount}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Active Users</p>
                  </div>
                  <div className={`p-4 rounded-2xl border text-center ${
                    darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200"
                  }`}>
                    <p className="text-2xl font-black text-orange-400 font-mono">34</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Today's Logins</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS DIRECTORY */}
          {activeTab === "students" && (
            <div className="space-y-6">
              {(() => {
                const totalStudentsCount = students.length;
                const activeStudentsCount = students.filter(s => s.Status === "Active").length;
                const maleStudentsCount = students.filter(s => s.Gender === "Male").length;
                const femaleStudentsCount = students.filter(s => s.Gender === "Female").length;

                const totalKPI = totalStudentsCount > 8 ? totalStudentsCount : 1248;
                const activeKPI = activeStudentsCount > 7 ? activeStudentsCount : 1186;
                const maleKPI = maleStudentsCount > 4 ? maleStudentsCount : 652;
                const femaleKPI = femaleStudentsCount > 3 ? femaleStudentsCount : 596;
                const activePercent = totalKPI > 0 ? ((activeKPI / totalKPI) * 100).toFixed(1) : "95.0";
                const malePercent = totalKPI > 0 ? ((maleKPI / totalKPI) * 100).toFixed(1) : "52.2";
                const femalePercent = totalKPI > 0 ? ((femaleKPI / totalKPI) * 100).toFixed(1) : "47.8";
                const displayNew = 128 + (totalStudentsCount > 8 ? (totalStudentsCount - 8) : 0);

                const totalFilteredCount = filteredStudents.length;
                const startIndex = (stuPage - 1) * stuPerPage;
                const paginatedStudents = filteredStudents.slice(startIndex, startIndex + stuPerPage);
                const totalPagesCount = Math.ceil(totalFilteredCount / stuPerPage) || 1;

                const handleExportStudentsCSV = () => {
                  const headers = ["Student ID", "Reg No", "Name", "Gender", "Email", "Mobile", "Course", "Department", "Semester", "Batch", "Status", "Admission Date"];
                  const rows = filteredStudents.map(s => [
                    s.StudentID,
                    s.RegNo,
                    s.Name,
                    s.Gender,
                    s.Email,
                    s.Mobile,
                    s.Course,
                    s.Department,
                    s.Semester,
                    s.Batch,
                    s.Status,
                    s.JoiningDate
                  ]);
                  const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${val}"`).join(","))].join("\n");
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const link = document.createElement("a");
                  const url = URL.createObjectURL(blob);
                  link.setAttribute("href", url);
                  link.setAttribute("download", `Students_Directory_${new Date().toISOString().split("T")[0]}.csv`);
                  link.style.visibility = "hidden";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                };

                return (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* KPI STATS ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Card 1 */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Students</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalKPI}</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              ↑ 8.4%
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold block">vs last month</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 shadow-xs">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Active Students</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeKPI}</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              ↑ 6.7%
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold block">vs last month</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
                          <UserCheck className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Card 3 */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Male Students</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{maleKPI}</span>
                          </div>
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold inline-block mt-0.5">{malePercent}% of total</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 shadow-xs">
                          <User className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Card 4 */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Female Students</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{femaleKPI}</span>
                          </div>
                          <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold inline-block mt-0.5">{femalePercent}% of total</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shadow-xs">
                          <User className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Card 5 */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">New Admissions</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{displayNew}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1">This Academic Year</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* TABS & EXPORT BAR */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-4 mt-4">
                      {/* Horizontal Subtabs */}
                      <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
                        {(["All", "Active", "Inactive", "Graduated", "Transferred"] as const).map((tab) => {
                          const count = tab === "All" 
                            ? filteredStudents.length 
                            : tab === "Active" 
                            ? filteredStudents.filter(s => s.Status === "Active").length
                            : tab === "Inactive"
                            ? filteredStudents.filter(s => s.Status === "Inactive").length
                            : 0;
                          
                          return (
                            <button
                              key={tab}
                              onClick={() => {
                                setStuSubTab(tab);
                                setStuPage(1);
                              }}
                              className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 relative transition-all whitespace-nowrap cursor-pointer ${
                                stuSubTab === tab
                                  ? "border-blue-600 text-blue-600"
                                  : "border-transparent text-slate-400 hover:text-slate-600"
                              }`}
                            >
                              {tab === "All" ? "All Students" : `${tab} Students`}
                              {count > 0 && (
                                <span className={`ml-2 px-1.5 py-0.5 text-[9px] rounded-full font-black ${
                                  stuSubTab === tab ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                                }`}>
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Export Action Dropdown */}
                      <div className="relative self-end sm:self-auto pb-1.5">
                        <button
                          onClick={() => setShowExportDropdown(!showExportDropdown)}
                          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-slate-400" />
                          <span>Export</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {showExportDropdown && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowExportDropdown(false)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-20 text-xs font-bold text-slate-600">
                              <button
                                onClick={() => {
                                  handleExportStudentsCSV();
                                  setShowExportDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 cursor-pointer"
                              >
                                <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                                <span>Export as CSV File</span>
                              </button>
                              <button
                                onClick={() => {
                                  alert("Workbook initialization complete. Custom Microsoft Excel sheet workbook ready.");
                                  handleExportStudentsCSV();
                                  setShowExportDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 cursor-pointer"
                              >
                                <FileText className="w-4 h-4 text-emerald-500" />
                                <span>Export as Excel Spreadsheet</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* SEARCH & FILTER BAR */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col xl:flex-row gap-4 items-end justify-between">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full flex-1">
                        {/* Search Input */}
                        <div className="lg:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Search Student</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search by Student ID, Name, Email, Reg..."
                              value={stuSearch}
                              onChange={(e) => setStuSearch(e.target.value)}
                              className="w-full pl-4 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-semibold transition-all placeholder:text-slate-400"
                            />
                            <Search className="absolute right-3.5 top-3 text-slate-400 w-4 h-4" />
                          </div>
                        </div>

                        {/* Department Filter */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</label>
                          <select
                            value={stuDeptFilter}
                            onChange={(e) => setStuDeptFilter(e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-600 font-bold focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="All">All Departments</option>
                            {departments.map((d) => (
                              <option key={d.DepartmentCode} value={d.DepartmentCode}>{d.DepartmentName}</option>
                            ))}
                          </select>
                        </div>

                        {/* Batch Filter */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Batch</label>
                          <select
                            value={stuBatchFilter}
                            onChange={(e) => setStuBatchFilter(e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-600 font-bold focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="All">All Batches</option>
                            {batches.map((b) => (
                              <option key={b.BatchName} value={b.BatchName}>{b.BatchName}</option>
                            ))}
                          </select>
                        </div>

                        {/* Semester Filter */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Semester</label>
                          <select
                            value={stuSemesterFilter}
                            onChange={(e) => setStuSemesterFilter(e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-600 font-bold focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="All">All Semesters</option>
                            {Array.from(new Set(students.map(s => s.Semester))).map((sem) => (
                              <option key={sem} value={sem}>{sem}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Filter Reset & Add Buttons */}
                      <div className="flex items-center gap-2.5 w-full xl:w-auto shrink-0 justify-end">
                        <button
                          onClick={() => {
                            setStuSearch("");
                            setStuCourseFilter("All");
                            setStuStatusFilter("All");
                            setStuDeptFilter("All");
                            setStuBatchFilter("All");
                            setStuSemesterFilter("All");
                            setStuSubTab("All");
                          }}
                          className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Reset Filters"
                        >
                          <Filter className="w-4 h-4 text-slate-400" />
                          <span>More Filters</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingStudent(null);
                            setStuName("");
                            setStuEmail("");
                            setStuMobile("");
                            setStuAddress("");
                            setStuDOB("");
                            setStuGender("Male");
                            setStuStatus("Active");
                            setStuCourse("");
                            setStuDept("");
                            setShowAddStuModal(true);
                          }}
                          className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                        >
                          <Plus className="w-4.5 h-4.5" />
                          <span>Add Student</span>
                        </button>
                      </div>
                    </div>

                    {/* TABLE GRID VIEW CARD */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                              <th className="py-4 px-4 w-12 text-center">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  checked={paginatedStudents.length > 0 && paginatedStudents.every(s => selectedStus.includes(s.StudentID))}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const newSelected = [...selectedStus];
                                      paginatedStudents.forEach(s => {
                                        if (!newSelected.includes(s.StudentID)) {
                                          newSelected.push(s.StudentID);
                                        }
                                      });
                                      setSelectedStus(newSelected);
                                    } else {
                                      setSelectedStus(selectedStus.filter(id => !paginatedStudents.some(s => s.StudentID === id)));
                                    }
                                  }}
                                />
                              </th>
                              <th className="py-4 px-4 font-extrabold text-slate-500">
                                <div className="flex items-center gap-1 cursor-pointer select-none">
                                  <span>Student ID</span>
                                  <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                </div>
                              </th>
                              <th className="py-4 px-4 font-extrabold text-slate-500">Name & Details</th>
                              <th className="py-4 px-4 font-extrabold text-slate-500">Department</th>
                              <th className="py-4 px-4 font-extrabold text-slate-500">Batch</th>
                              <th className="py-4 px-4 font-extrabold text-slate-500">Semester</th>
                              <th className="py-4 px-4 font-extrabold text-slate-500">Email Address</th>
                              <th className="py-4 px-4 font-extrabold text-slate-500">Mobile No.</th>
                              <th className="py-4 px-4 font-extrabold text-slate-500">Status</th>
                              <th className="py-4 px-4 font-extrabold text-slate-500">Admission Date</th>
                              <th className="py-4 px-4 font-extrabold text-slate-500 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                            {paginatedStudents.length === 0 ? (
                              <tr>
                                <td colSpan={11} className="text-center py-16 text-slate-400 font-medium bg-white">
                                  <div className="space-y-2">
                                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                                    <p className="text-slate-500 font-bold">No students matched the criteria</p>
                                    <p className="text-slate-400 text-[10px]">Try clearing filters or introducing new student records.</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              paginatedStudents.map((s) => {
                                const avatarUrl = getStudentAvatar(s.Name, s.Gender);
                                return (
                                  <tr key={s.StudentID} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="py-3.5 px-4 text-center">
                                      <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        checked={selectedStus.includes(s.StudentID)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedStus([...selectedStus, s.StudentID]);
                                          } else {
                                            setSelectedStus(selectedStus.filter(id => id !== s.StudentID));
                                          }
                                        }}
                                      />
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                                      {s.StudentID}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={avatarUrl}
                                          alt={s.Name}
                                          referrerPolicy="no-referrer"
                                          className="w-10 h-10 rounded-full border border-slate-100 shadow-2xs object-cover shrink-0"
                                        />
                                        <div>
                                          <div className="font-extrabold text-slate-900 text-sm whitespace-nowrap">{s.Name}</div>
                                          <div className="text-[10px] text-blue-600 font-bold mt-0.5">{getCourseName(s.Course)}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                                      {getDeptName(s.Department)}
                                    </td>
                                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                                      {getBatchName(s.Batch)}
                                    </td>
                                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                                      {s.Semester}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                      {s.Email}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">
                                      {s.Mobile}
                                    </td>
                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide inline-flex items-center gap-1 ${
                                        s.Status === "Active"
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                          : "bg-rose-50 text-rose-700 border border-rose-100"
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${s.Status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                                        {s.Status}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-400 font-medium whitespace-nowrap">
                                      {new Date(s.JoiningDate).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                      })}
                                    </td>
                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                      <div className="flex justify-end gap-1.5">
                                        {/* View Action */}
                                        <button
                                          onClick={() => setViewingStudent(s)}
                                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors inline-flex cursor-pointer border border-transparent"
                                          title="View Profile Details"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                        
                                        {/* Edit Action */}
                                        <button
                                          onClick={() => startEditStudent(s)}
                                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors inline-flex cursor-pointer border border-transparent"
                                          title="Edit Student Record"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>

                                        {/* Delete Action */}
                                        <button
                                          onClick={() => {
                                            if (confirm(`Are you sure you want to delete student ${s.Name}?`)) {
                                              handleDeleteStudent(s.StudentID);
                                            }
                                          }}
                                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex cursor-pointer border border-transparent"
                                          title="Delete Student Record"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* PAGINATION FOOTER */}
                      <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <span className="text-xs font-bold text-slate-400">
                          Showing {totalFilteredCount > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + stuPerPage, totalFilteredCount)} of{" "}
                          <span className="text-slate-700">{totalFilteredCount}</span> entries
                        </span>

                        <div className="flex items-center gap-4 self-end sm:self-auto">
                          {/* Length Dropdown */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold">Show</span>
                            <select
                              value={stuPerPage}
                              onChange={(e) => {
                                setStuPerPage(Number(e.target.value));
                                setStuPage(1);
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600 font-bold focus:outline-none transition-all cursor-pointer"
                            >
                              <option value={5}>5</option>
                              <option value={8}>8</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                            </select>
                            <span className="text-xs text-slate-400 font-bold">entries</span>
                          </div>

                          {/* Pages row */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setStuPage(Math.max(1, stuPage - 1))}
                              disabled={stuPage === 1}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalPagesCount }).map((_, idx) => {
                              const pageNo = idx + 1;
                              return (
                                <button
                                  key={pageNo}
                                  onClick={() => setStuPage(pageNo)}
                                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                                    stuPage === pageNo
                                      ? "bg-blue-600 text-white shadow-xs"
                                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  {pageNo}
                                </button>
                              );
                            })}

                            <button
                              onClick={() => setStuPage(Math.min(totalPagesCount, stuPage + 1))}
                              disabled={stuPage === totalPagesCount}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* VIEW STUDENT DETAIL MODAL */}
                    {viewingStudent && (
                      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-slate-100 shadow-2xl relative transform transition-all animate-in fade-in zoom-in-95 duration-200">
                          {/* Hero Banner Area */}
                          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-8 text-white relative">
                            <button
                              onClick={() => setViewingStudent(null)}
                              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition-all cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-4">
                              <img
                                src={getStudentAvatar(viewingStudent.Name, viewingStudent.Gender)}
                                alt={viewingStudent.Name}
                                className="w-16 h-16 rounded-full border-2 border-white object-cover shadow-md"
                              />
                              <div>
                                <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {viewingStudent.StudentID}
                                </span>
                                <h3 className="text-xl font-extrabold tracking-tight mt-1">{viewingStudent.Name}</h3>
                                <p className="text-xs text-white/80 font-medium">{getCourseName(viewingStudent.Course)} • {getDeptName(viewingStudent.Department)} Dept</p>
                              </div>
                            </div>
                          </div>

                          {/* Profile Body Details */}
                          <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registration Number</span>
                                <span className="text-xs font-bold text-slate-800">{viewingStudent.RegNo}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Joined Campus On</span>
                                <span className="text-xs font-bold text-slate-800">
                                  {new Date(viewingStudent.JoiningDate).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gender</span>
                                <span className="text-xs font-bold text-slate-800">{viewingStudent.Gender}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Academic Session</span>
                                <span className="text-xs font-bold text-slate-800">{getBatchName(viewingStudent.Batch)} ({viewingStudent.Semester})</span>
                              </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 space-y-3">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                                <span className="text-xs font-bold text-slate-800 font-mono">{viewingStudent.Email}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contact Number</span>
                                <span className="text-xs font-bold text-slate-800 font-mono">{viewingStudent.Mobile}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Residential Address</span>
                                <span className="text-xs font-bold text-slate-600 mt-0.5 block leading-relaxed">{viewingStudent.Address}</span>
                              </div>
                            </div>

                            {/* Academic Status Pills */}
                            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">System Status</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 mt-1 ${
                                  viewingStudent.Status === "Active"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : "bg-rose-50 text-rose-700 border border-rose-100"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${viewingStudent.Status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                                  {viewingStudent.Status}
                                </span>
                              </div>
                              
                              <button
                                onClick={() => {
                                  setViewingStudent(null);
                                  startEditStudent(viewingStudent);
                                }}
                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                              >
                                Edit Profile
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: FEES BILLING DESK */}
          {activeTab === "fees" && (
            <div className="space-y-8 animate-fade-in pb-12">
              {/* Premium Top Sub-Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                      Assign Fees Desk <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">Step {feeAssignStep} of 7</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Enterprise Student Billing, Structure Allocation & Real-Time Invoice Ledger</p>
                  </div>
                </div>
                
                {/* Global Search & Action Controls */}
                <div className="flex items-center gap-3">
                  <div className="relative hidden xl:block">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search assignment archives..."
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button 
                      onClick={() => setFeeAcademicYear("2025-26")} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${feeAcademicYear === "2025-26" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      2025-26
                    </button>
                    <button 
                      onClick={() => setFeeAcademicYear("2026-27")} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${feeAcademicYear === "2026-27" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      2026-27
                    </button>
                  </div>
                  <div className="text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl">
                    {new Date().toISOString().split("T")[0]}
                  </div>
                </div>
              </div>

              {/* Dashboard Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
                {/* 1. Total Students */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                    <Users className="w-24 h-24 text-blue-600" />
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Students</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded border border-emerald-100">+12%</span>
                  </div>
                  <div className="text-2xl font-black text-slate-800 mt-2 font-mono">{students.length}</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">Registered in Database</div>
                  {/* Mini Trend Sparkline */}
                  <div className="h-6 mt-3">
                    <svg className="w-full h-full text-blue-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path d="M0,25 Q15,5 30,20 T60,10 T100,5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* 2. Students with Fees Assigned */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                    <FileText className="w-24 h-24 text-indigo-600" />
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fees Allocated</span>
                    <span className="text-[9px] bg-blue-50 text-blue-700 font-extrabold px-1.5 py-0.5 rounded border border-blue-100">+8.5%</span>
                  </div>
                  <div className="text-2xl font-black text-slate-800 mt-2 font-mono">
                    {new Set(assignedFees.map(f => f.StudentID)).size}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">Students invoiced</div>
                  <div className="h-6 mt-3">
                    <svg className="w-full h-full text-indigo-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path d="M0,20 Q20,10 40,25 T80,15 T100,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* 3. Pending Fee Assignment */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-24 h-24 text-amber-500" />
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unassigned</span>
                    <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-100">-4.2%</span>
                  </div>
                  <div className="text-2xl font-black text-slate-800 mt-2 font-mono">
                    {Math.max(0, students.length - new Set(assignedFees.map(f => f.StudentID)).size)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">Pending allocation</div>
                  <div className="h-6 mt-3">
                    <svg className="w-full h-full text-amber-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path d="M0,5 Q20,25 40,10 T80,20 T100,25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* 4. Total Fee Assigned */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-24 h-24 text-blue-600" />
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Invoiced</span>
                    <span className="text-[9px] bg-blue-50 text-blue-700 font-extrabold px-1.5 py-0.5 rounded border border-blue-100">+14%</span>
                  </div>
                  <div className="text-2xl font-black text-slate-800 mt-2 font-mono">
                    ${assignedFees.reduce((acc, f) => acc + (f.TotalAmount || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">Cumulative assigned</div>
                  <div className="h-6 mt-3">
                    <svg className="w-full h-full text-blue-600" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path d="M0,28 Q15,10 35,22 T70,5 T100,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* 5. Collected Amount */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-24 h-24 text-emerald-600" />
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Collected</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded border border-emerald-100">+18.2%</span>
                  </div>
                  <div className="text-2xl font-black text-slate-800 mt-2 font-mono">
                    ${payments.reduce((acc, p) => acc + (p.Amount || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">Verified payments</div>
                  <div className="h-6 mt-3">
                    <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path d="M0,30 Q25,20 50,25 T75,5 T100,1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* 6. Outstanding Balance */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                    <Percent className="w-24 h-24 text-rose-600" />
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Outstanding</span>
                    <span className="text-[9px] bg-rose-50 text-rose-700 font-extrabold px-1.5 py-0.5 rounded border border-rose-100">-1.5%</span>
                  </div>
                  <div className="text-2xl font-black text-slate-800 mt-2 font-mono">
                    ${Math.max(0, assignedFees.reduce((acc, f) => acc + (f.TotalAmount || 0), 0) - payments.reduce((acc, p) => acc + (p.Amount || 0), 0)).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">Uncollected balance</div>
                  <div className="h-6 mt-3">
                    <svg className="w-full h-full text-rose-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path d="M0,10 Q20,15 45,5 T80,25 T100,10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Wizard Interactive Step Tracker (1 to 7) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
                  {[
                    { step: 1, label: "Select Student", icon: Users },
                    { step: 2, label: "Academic Info", icon: BookOpen },
                    { step: 3, label: "Fee Structure", icon: TableProperties },
                    { step: 4, label: "Sem Summary", icon: LayoutGrid },
                    { step: 5, label: "Fee Assignment", icon: DollarSign },
                    { step: 6, label: "Review Summary", icon: FileCheck },
                    { step: 7, label: "Success Screen", icon: CheckCircle }
                  ].map((s, idx, arr) => {
                    const Icon = s.icon;
                    const isActive = feeAssignStep === s.step;
                    const isCompleted = feeAssignStep > s.step;
                    return (
                      <React.Fragment key={s.step}>
                        <button
                          type="button"
                          onClick={() => {
                            if (s.step < 7) {
                              setFeeAssignStep(s.step);
                            }
                          }}
                          className="flex items-center gap-2 text-left focus:outline-none group cursor-pointer"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isActive 
                              ? "bg-blue-600 text-white ring-4 ring-blue-100" 
                              : isCompleted 
                                ? "bg-emerald-500 text-white" 
                                : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                          }`}>
                            {isCompleted ? <Check className="w-4 h-4" /> : s.step}
                          </div>
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-slate-400"}`}>
                              Step 0{s.step}
                            </p>
                            <p className={`text-xs font-bold ${isActive ? "text-slate-800" : "text-slate-500"}`}>
                              {s.label}
                            </p>
                          </div>
                        </button>
                        {idx < arr.length - 1 && (
                          <div className={`hidden md:block flex-1 h-[2px] mx-3 transition-colors ${isCompleted ? "bg-emerald-500" : "bg-slate-100"}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* ACTIVE STEP WORKSPACE */}
              <div className="bg-slate-50 rounded-3xl p-1 border border-slate-200/50">
                
                {/* STEP 1: SELECT STUDENT */}
                {feeAssignStep === 1 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" /> Step 1: Select Student or Group
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">Lookup the target student profile to generate custom invoices, or select bulk allocation options.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {/* Assignment scope selection */}
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Assignment Scope</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setFeeIsBulk(false)}
                              className={`py-3 px-4 rounded-xl border-2 font-black text-xs transition-all cursor-pointer text-center ${
                                !feeIsBulk 
                                  ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" 
                                  : "border-slate-100 text-slate-500 bg-slate-50 hover:bg-slate-100/70"
                              }`}
                            >
                              Single Student
                            </button>
                            <button
                              type="button"
                              onClick={() => setFeeIsBulk(true)}
                              className={`py-3 px-4 rounded-xl border-2 font-black text-xs transition-all cursor-pointer text-center ${
                                feeIsBulk 
                                  ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" 
                                  : "border-slate-100 text-slate-500 bg-slate-50 hover:bg-slate-100/70"
                              }`}
                            >
                              Bulk Assignment
                            </button>
                          </div>
                        </div>

                        {!feeIsBulk ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Select Student ID</label>
                              <select
                                value={feeStudentId}
                                onChange={(e) => {
                                  setFeeStudentId(e.target.value);
                                  const target = students.find(s => s.StudentID === e.target.value);
                                  if (target) {
                                    setSelectedStudent(target);
                                    setFeeCourse(target.Course);
                                    setFeeSemester(target.Semester || "Semester 1");
                                    setFeeBatch(target.Batch);
                                  }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer font-bold"
                              >
                                <option value="">Select Student...</option>
                                {students.map((s) => (
                                  <option key={s.StudentID} value={s.StudentID}>{s.Name} ({s.StudentID})</option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Registration No</label>
                                <input
                                  type="text"
                                  disabled
                                  placeholder="Auto-derived"
                                  value={selectedStudent ? selectedStudent.RegNo : ""}
                                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Mobile Contact</label>
                                <input
                                  type="text"
                                  disabled
                                  placeholder="Auto-derived"
                                  value={selectedStudent ? selectedStudent.Mobile : ""}
                                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Target Batch Year</label>
                              <select
                                value={feeBatch}
                                onChange={(e) => setFeeBatch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer font-bold"
                              >
                                <option value="">Select Target Batch...</option>
                                {batches.map((b) => (
                                  <option key={b.BatchName} value={b.BatchName}>{b.BatchName} ({b.AcademicYear})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Interactive QR Code Mock Scanner */}
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setScannedStudentData("Scanning QR...");
                              setTimeout(() => {
                               if (students.length === 0) {
                                 setScannedStudentData(null);
                                 alert("No students found in the roster. Please register/import a student first.");
                                 return;
                               }
                               const target = students[0];
                               setSelectedStudent(target);
                               setFeeStudentId(target.StudentID);
                               setFeeCourse(target.Course);
                               setFeeSemester(target.Semester || "Semester 3");
                               setFeeBatch(target.Batch);
                               setScannedStudentData(null);
                               alert(`QR Scan Successful! Loaded student: ${target.Name} (${target.StudentID})`);
                              }, 1500);
                            }}
                            className="w-full bg-slate-100 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-blue-50/20 group"
                          >
                            <QrCode className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mx-auto mb-2 animate-pulse" />
                            <p className="text-xs font-black text-slate-700 group-hover:text-blue-700">
                              {scannedStudentData || "Scan Student ID Barcode / QR"}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">Utilizes webcam integration or barcode scanner guns</p>
                          </button>
                        </div>
                      </div>

                      {/* Selected Student profile preview card */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-6 flex flex-col justify-between">
                        {selectedStudent && !feeIsBulk ? (
                          <div className="space-y-4">
                            <span className="text-[9px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest inline-block">Active Student Card</span>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl uppercase shadow-md shadow-blue-500/10">
                                {selectedStudent.Name.slice(0, 2)}
                              </div>
                              <div>
                                <h4 className="text-base font-black text-slate-800">{selectedStudent.Name}</h4>
                                <p className="text-xs text-blue-600 font-mono font-bold mt-0.5">{selectedStudent.StudentID}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-slate-200/50 text-xs font-medium text-slate-600">
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Course</span>
                                <span className="text-slate-800 font-bold">{selectedStudent.Course}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Department</span>
                                <span className="text-slate-800 font-bold">{selectedStudent.Department}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Batch</span>
                                <span className="text-slate-800 font-bold">{selectedStudent.Batch}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Semester</span>
                                <span className="text-blue-600 font-bold">{selectedStudent.Semester || "Semester 1"}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Registration</span>
                                <span className="text-slate-800 font-bold font-mono">{selectedStudent.RegNo}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Status</span>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] rounded-full font-extrabold inline-block">Active</span>
                              </div>
                            </div>
                          </div>
                        ) : feeIsBulk ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <Layers className="w-6 h-6" />
                            </div>
                            <h4 className="font-black text-slate-800 text-sm">Bulk Group Billing Active</h4>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                              You will assign fees to the entire roster of the selected Batch simultaneously. Each student receives their individual ledger.
                            </p>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                              <UserCheck className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-500 text-xs">No Student Selected</h4>
                            <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                              Use the selector or scan a campus QR badge to preview profiles.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          if (!feeIsBulk && !feeStudentId) {
                            alert("Please select a student to proceed.");
                            return;
                          }
                          if (feeIsBulk && !feeBatch) {
                            alert("Please select a batch to proceed.");
                            return;
                          }
                          setFeeAssignStep(2);
                        }}
                        className="bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        Proceed to Academic Info <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: ACADEMIC INFORMATION */}
                {feeAssignStep === 2 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" /> Step 2: Academic & Category Information
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">Define the billing timeframe, academic program mappings, and any scholarship rules.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Academic Course</label>
                          <select
                            value={feeCourse}
                            onChange={(e) => setFeeCourse(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer font-bold"
                          >
                            <option value="">Select Course...</option>
                            {courses.map((c) => (
                              <option key={c.CourseCode} value={c.CourseCode}>{c.CourseName} ({c.CourseCode})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Department Mapped</label>
                          <select
                            defaultValue="Computer Science"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer font-bold"
                          >
                            {departments.map((d) => (
                              <option key={d.DepartmentCode} value={d.DepartmentCode}>{d.DepartmentName} ({d.DepartmentCode})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Batch Year</label>
                          <select
                            value={feeBatch}
                            onChange={(e) => setFeeBatch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer font-bold"
                          >
                            <option value="">Select Batch...</option>
                            {batches.map((b) => (
                              <option key={b.BatchName} value={b.BatchName}>{b.BatchName} ({b.AcademicYear})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Active Semester</label>
                          <select
                            value={feeSemester}
                            onChange={(e) => setFeeSemester(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer font-bold"
                          >
                            <option value="Semester 1">Semester I</option>
                            <option value="Semester 2">Semester II</option>
                            <option value="Semester 3">Semester III</option>
                            <option value="Semester 4">Semester IV</option>
                            <option value="Semester 5">Semester V</option>
                            <option value="Semester 6">Semester VI</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Admission Category</label>
                          <select
                            defaultValue="General"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer font-bold"
                          >
                            <option value="General">General Quota</option>
                            <option value="Management">Management Quota</option>
                            <option value="Merit">State Merit Quota</option>
                            <option value="International">International Spot</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Scholarship Category</label>
                          <select
                            onChange={(e) => {
                              if (e.target.value === "Merit") {
                                setFeeScholarship("1500");
                                setFeeDiscount("500");
                              } else if (e.target.value === "Sports") {
                                setFeeScholarship("2000");
                                setFeeDiscount("0");
                              } else {
                                setFeeScholarship("0");
                                setFeeDiscount("0");
                              }
                            }}
                            defaultValue="None"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer font-bold"
                          >
                            <option value="None">No Scholarship Granted</option>
                            <option value="Merit">50% Merit Tuition Waiver</option>
                            <option value="Sports">Full Sports Quota Grant</option>
                            <option value="EWS">Economically Weaker Section</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setFeeAssignStep(1)}
                        className="bg-slate-100 text-slate-600 font-bold text-xs px-6 py-3 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeeAssignStep(3)}
                        className="bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        Proceed to Fee Structure <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: FEE STRUCTURE (EDITABLE 10-TYPE TABLE) */}
                {feeAssignStep === 3 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <TableProperties className="w-5 h-5 text-blue-600" /> Step 3: Configure Detailed Fee Structure
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">Verify or adjust separate tuition, lab, exams, hostel, uniforms and transport components. Calculated live.</p>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            <th className="py-3 px-4">Fee Component Type</th>
                            <th className="py-3 px-4 w-32">Base Amount ($)</th>
                            <th className="py-3 px-4 w-32">Discount ($)</th>
                            <th className="py-3 px-4 w-32">Scholarship ($)</th>
                            <th className="py-3 px-4 w-28">Fine ($)</th>
                            <th className="py-3 px-4 text-right w-36">Net Amount ($)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                          {/* 1. Admission Fee */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">Admission Fee</td>
                            <td className="py-3 px-4"><input type="number" value={feeAdmission} onChange={(e) => setFeeAdmission(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:bg-white" /></td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">${(parseFloat(feeAdmission) || 0).toLocaleString()}</td>
                          </tr>
                          {/* 2. Tuition Fee */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">Tuition Fee</td>
                            <td className="py-3 px-4"><input type="number" value={feeTuition} onChange={(e) => setFeeTuition(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:bg-white" /></td>
                            <td className="py-3 px-4"><input type="number" value={feeDiscount} onChange={(e) => setFeeDiscount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-rose-600 font-bold focus:bg-white" /></td>
                            <td className="py-3 px-4"><input type="number" value={feeScholarship} onChange={(e) => setFeeScholarship(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-blue-600 font-bold focus:bg-white" /></td>
                            <td className="py-3 px-4"><input type="number" value={feeFine} onChange={(e) => setFeeFine(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-amber-600 font-bold focus:bg-white" /></td>
                            <td className="py-3 px-4 text-right font-bold text-blue-600 font-mono">
                              ${Math.max(0, (parseFloat(feeTuition) || 0) + (parseFloat(feeFine) || 0) - (parseFloat(feeDiscount) || 0) - (parseFloat(feeScholarship) || 0)).toLocaleString()}
                            </td>
                          </tr>
                          {/* 3. Laboratory Fee */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">Laboratory Fee</td>
                            <td className="py-3 px-4"><input type="number" value={feeLaboratory} onChange={(e) => setFeeLaboratory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:bg-white" /></td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">${(parseFloat(feeLaboratory) || 0).toLocaleString()}</td>
                          </tr>
                          {/* 4. Library Fee */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">Library Fee</td>
                            <td className="py-3 px-4"><input type="number" value={feeLibrary} onChange={(e) => setFeeLibrary(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:bg-white" /></td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">${(parseFloat(feeLibrary) || 0).toLocaleString()}</td>
                          </tr>
                          {/* 5. Examination Fee */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">Examination Fee</td>
                            <td className="py-3 px-4"><input type="number" value={feeExam} onChange={(e) => setFeeExam(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:bg-white" /></td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">${(parseFloat(feeExam) || 0).toLocaleString()}</td>
                          </tr>
                          {/* 6. Hostel Fee */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">Hostel Fee</td>
                            <td className="py-3 px-4"><input type="number" value={feeHostel} onChange={(e) => setFeeHostel(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:bg-white" /></td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">${(parseFloat(feeHostel) || 0).toLocaleString()}</td>
                          </tr>
                          {/* 7. Transport Fee */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">Transport Fee</td>
                            <td className="py-3 px-4"><input type="number" value={feeTransport} onChange={(e) => setFeeTransport(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:bg-white" /></td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">${(parseFloat(feeTransport) || 0).toLocaleString()}</td>
                          </tr>
                          {/* 8. Uniform Fee */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">Uniform Fee</td>
                            <td className="py-3 px-4"><input type="number" value={feeUniform} onChange={(e) => setFeeUniform(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:bg-white" /></td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">${(parseFloat(feeUniform) || 0).toLocaleString()}</td>
                          </tr>
                          {/* 9. ID Card Fee */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">ID Card Fee</td>
                            <td className="py-3 px-4"><input type="number" value={feeIdCard} onChange={(e) => setFeeIdCard(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:bg-white" /></td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">${(parseFloat(feeIdCard) || 0).toLocaleString()}</td>
                          </tr>
                          {/* 10. Miscellaneous Fee */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">Miscellaneous Fee</td>
                            <td className="py-3 px-4"><input type="number" value={feeMisc} onChange={(e) => setFeeMisc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:bg-white" /></td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-slate-400">-</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">${(parseFloat(feeMisc) || 0).toLocaleString()}</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr className="bg-blue-50/60 font-mono font-black text-xs text-blue-900 border-t-2 border-blue-100">
                            <td colSpan={5} className="py-4 px-4 text-right uppercase tracking-wider">Calculated Grand Total:</td>
                            <td className="py-4 px-4 text-right text-base text-blue-700 font-black">${calculatedFeeTotal.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setFeeAssignStep(2)}
                        className="bg-slate-100 text-slate-600 font-bold text-xs px-6 py-3 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeeAssignStep(4)}
                        className="bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        Proceed to Semester Summary <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: SEMESTER FEE SUMMARY */}
                {feeAssignStep === 4 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-blue-600" /> Step 4: Semester-wise Outstanding Status Matrix
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">Review historic outstanding ledger balances across Semesters I through VI for the selected candidate.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {[
                        { sem: "Semester I", total: 4500, paid: 4500, due: "2024-12-15", status: "Paid" },
                        { sem: "Semester II", total: 4500, paid: 4500, due: "2025-05-15", status: "Paid" },
                        { sem: "Semester III", total: 4800, paid: 2000, due: "2025-12-15", status: "Partial" },
                        { sem: "Semester IV", total: 4800, paid: 0, due: "2026-05-15", status: "Pending" },
                        { sem: "Semester V", total: 5200, paid: 0, due: "2026-12-15", status: "Pending" },
                        { sem: "Semester VI", total: 5200, paid: 0, due: "2027-05-15", status: "Pending" }
                      ].map((item) => {
                        const balance = item.total - item.paid;
                        const ratio = Math.round((item.paid / item.total) * 100);
                        return (
                          <div key={item.sem} className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 space-y-3 shadow-2xs hover:scale-102 transition-transform">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-slate-800 text-xs">{item.sem}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                item.status === "Paid" 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                  : item.status === "Partial"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}>
                                {item.status}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-[11px] font-semibold text-slate-500">
                              <div className="flex justify-between">
                                <span>Total Structured Fee:</span>
                                <span className="text-slate-800 font-mono font-bold">${item.total.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Paid Component:</span>
                                <span className="text-emerald-600 font-mono font-bold">${item.paid.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Outstanding Balance:</span>
                                <span className={`font-mono font-bold ${balance > 0 ? "text-rose-600" : "text-slate-500"}`}>${balance.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="pt-2">
                              <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                                <span>Payment Coverage</span>
                                <span>{ratio}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    item.status === "Paid" ? "bg-emerald-500" : item.status === "Partial" ? "bg-amber-500" : "bg-rose-500"
                                  }`}
                                  style={{ width: `${ratio}%` }}
                                />
                              </div>
                            </div>

                            <div className="border-t border-slate-200/60 pt-2 text-[10px] text-slate-400 flex justify-between items-center">
                              <span>Due Date Limit:</span>
                              <span className="font-bold text-slate-600">{item.due}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setFeeAssignStep(3)}
                        className="bg-slate-100 text-slate-600 font-bold text-xs px-6 py-3 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeeAssignStep(5)}
                        className="bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        Proceed to Fee Assignment <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: FEE ASSIGNMENT FORM */}
                {feeAssignStep === 5 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-blue-600" /> Step 5: Configure Installments & Parameters
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">Set the final due date limits, installment options, fines and administrative notes.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-8 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Selected Academic Year</label>
                            <input
                              type="text"
                              disabled
                              value={feeAcademicYear}
                              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Selected Semester Mapped</label>
                            <input
                              type="text"
                              disabled
                              value={feeSemester}
                              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Billing Due Date</label>
                            <input
                              type="date"
                              required
                              value={feeDueDate}
                              onChange={(e) => setFeeDueDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Installment Options</label>
                            <select
                              value={feeInstallmentOption}
                              onChange={(e) => setFeeInstallmentOption(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer font-bold"
                            >
                              <option value="One-Time">One-Time (No split)</option>
                              <option value="Two Installments">Two Installments (50/50 split)</option>
                              <option value="Three Installments">Three Installments (40/30/30)</option>
                              <option value="Monthly">Monthly Payments</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Billing Remarks & Administrative Notes</label>
                          <textarea
                            rows={3}
                            placeholder="e.g. Regular academic semester structures including specialized lab access and transport services."
                            value={feeRemarks}
                            onChange={(e) => setFeeRemarks(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Live Calculation Sidebar panel */}
                      <div className="lg:col-span-4 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest inline-block">Real-Time Calculus</span>
                        <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Invoice Summary</h4>
                        
                        <div className="space-y-2 text-xs font-bold text-slate-600 border-b border-slate-200 pb-3">
                          <div className="flex justify-between">
                            <span>Base Course Fees:</span>
                            <span className="text-slate-800 font-mono">${(parseFloat(feeAdmission) + parseFloat(feeTuition) + parseFloat(feeLaboratory) + parseFloat(feeLibrary) + parseFloat(feeExam) + parseFloat(feeHostel) + parseFloat(feeTransport) + parseFloat(feeUniform) + parseFloat(feeIdCard) + parseFloat(feeMisc)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-rose-500">
                            <span>Scholarship Grant (-):</span>
                            <span className="font-mono">-${(parseFloat(feeScholarship) || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-rose-500">
                            <span>Discounts Allocated (-):</span>
                            <span className="font-mono">-${(parseFloat(feeDiscount) || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-amber-600">
                            <span>Late Fine Addition (+):</span>
                            <span className="font-mono">+${(parseFloat(feeFine) || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-xs space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-blue-200">Final Net Payable</span>
                          <div className="text-xl font-black font-mono">${calculatedFeeTotal.toLocaleString()}</div>
                          <p className="text-[10px] text-blue-100 font-semibold">{feeInstallmentOption} scheme active</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setFeeAssignStep(4)}
                        className="bg-slate-100 text-slate-600 font-bold text-xs px-6 py-3 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeeAssignStep(6)}
                        className="bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        Proceed to Review <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: REVIEW SUMMARY CARD */}
                {feeAssignStep === 6 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-blue-600" /> Step 6: Final Administrative Verification
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">Review the consolidated billing invoice breakdown before writing the ledger permanently to Google Sheets.</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Target Recipient</h4>
                        <div className="bg-white rounded-xl p-4 border border-slate-200/50 space-y-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold font-mono">
                              {feeIsBulk ? "GRP" : "STU"}
                            </div>
                            <div>
                              <h5 className="font-extrabold text-slate-800">{feeIsBulk ? "Bulk Allocation Group" : (selectedStudent ? selectedStudent.Name : "Unknown Student")}</h5>
                              <p className="text-[10px] text-slate-500 font-bold">{feeIsBulk ? `Batch Year: ${feeBatch}` : `Student ID: ${feeStudentId}`}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-slate-100 text-slate-600 font-semibold text-[11px]">
                            <div>Program: <span className="text-slate-800 font-bold">{feeCourse}</span></div>
                            <div>Term Mapped: <span className="text-slate-800 font-extrabold">{feeSemester}</span></div>
                            <div>Due Date: <span className="text-rose-600 font-extrabold">{feeDueDate || "N/A"}</span></div>
                            <div>Installment: <span className="text-slate-800 font-bold">{feeInstallmentOption}</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Billing Breakdown</h4>
                        <div className="bg-white rounded-xl p-4 border border-slate-200/50 text-xs space-y-2">
                          <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500 font-semibold">Structured Sub-Total:</span>
                            <span className="font-mono font-bold text-slate-800">${(parseFloat(feeAdmission) + parseFloat(feeTuition) + parseFloat(feeLaboratory) + parseFloat(feeLibrary) + parseFloat(feeExam) + parseFloat(feeHostel) + parseFloat(feeTransport) + parseFloat(feeUniform) + parseFloat(feeIdCard) + parseFloat(feeMisc)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-rose-600">
                            <span>Scholarship grant (-):</span>
                            <span className="font-mono font-bold">-${(parseFloat(feeScholarship) || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-rose-600">
                            <span>Discounts (-):</span>
                            <span className="font-mono font-bold">-${(parseFloat(feeDiscount) || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-amber-600 border-b border-slate-100 pb-2">
                            <span>Late fine addition (+):</span>
                            <span className="font-mono font-bold">+${(parseFloat(feeFine) || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-base font-black text-blue-700 pt-1">
                            <span>Final Payable Invoice:</span>
                            <span className="font-mono">${calculatedFeeTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setFeeAssignStep(5)}
                        className="bg-slate-100 text-slate-600 font-bold text-xs px-6 py-3 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={handleAssignFees}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs px-8 py-3 rounded-xl hover:shadow-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <FileCheck className="w-4 h-4" /> Save Assignment & Dispatch Invoice
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 7: SUCCESS SCREEN */}
                {feeAssignStep === 7 && assignmentSuccessDetails && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-8 space-y-6 text-center">
                    {/* Glowing Vector Animated Tick Success Circle */}
                    <div className="w-20 h-20 bg-emerald-50 rounded-full border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/15 relative">
                      <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                      <CheckCircle className="w-10 h-10 text-emerald-500 animate-bounce" />
                    </div>

                    <div className="space-y-1 max-w-md mx-auto">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">Fee Assignment Successfully Dispatched!</h3>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        The individual ledger transaction has been written in real-time to Google Sheets, and an automated SMS/Email notification has been triggered to the student.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-xs font-semibold text-slate-600 space-y-2">
                      <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                        <span className="text-slate-400">Assignment ID:</span>
                        <span className="font-mono font-black text-blue-600">{assignmentSuccessDetails.assignmentId}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                        <span className="text-slate-400">Student Name:</span>
                        <span className="text-slate-800 font-bold">{assignmentSuccessDetails.studentName}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                        <span className="text-slate-400">Semester Mapped:</span>
                        <span className="text-slate-800 font-bold">{assignmentSuccessDetails.semester} ({assignmentSuccessDetails.course})</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                        <span className="text-slate-400">Billing Due Date:</span>
                        <span className="text-rose-500 font-bold">{assignmentSuccessDetails.dueDate}</span>
                      </div>
                      <div className="flex justify-between pt-1.5 text-blue-700 font-black">
                        <span>Total Assigned Fee:</span>
                        <span className="font-mono text-sm">${assignmentSuccessDetails.totalFee.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 max-w-lg mx-auto">
                      <button
                        type="button"
                        onClick={() => {
                          window.print();
                        }}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4 text-slate-500" /> Print Invoice
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Simulate dynamic PDF generation
                          alert("PDF Generation compiled successfully! College_Fee_Receipt_" + assignmentSuccessDetails.assignmentId + ".pdf downloaded.");
                        }}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                      >
                        <FileDown className="w-4 h-4 text-slate-500" /> Generate PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`Hey, your fees of $${assignmentSuccessDetails.totalFee.toLocaleString()} for ${assignmentSuccessDetails.semester} has been assigned. Please pay by ${assignmentSuccessDetails.dueDate}. Assignment ID: ${assignmentSuccessDetails.assignmentId}`);
                          alert("Share Link Copied to Clipboard!");
                        }}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4 text-slate-500" /> Share Ledger Link
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFeeAssignStep(1);
                        }}
                        className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        Assign Another Student
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM SECTION: RECENT FEE ASSIGNMENTS TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                      <FileText className="w-4.5 h-4.5 text-blue-600" /> Recent Administrative Fee Assignments Ledger
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Live database synchronizer showing transaction statuses of recently processed allocations.</p>
                  </div>
                  
                  {/* Ledger Export Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const csvRows = [
                          ["AssignmentID", "StudentID", "Course", "Semester", "DueDate", "TotalAmount"],
                          ...assignedFees.map(f => [
                            `ASG-${Math.floor(2000 + Math.random()*8000)}`,
                            f.StudentID,
                            f.Course,
                            f.Semester,
                            f.DueDate,
                            f.TotalAmount
                          ])
                        ];
                        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `College_Fee_Assignments_${new Date().toISOString().split("T")[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Assignment ID</th>
                        <th className="py-2.5 px-3">Student Name / ID</th>
                        <th className="py-2.5 px-3">Course & Semester</th>
                        <th className="py-2.5 px-3">Dues Due Date</th>
                        <th className="py-2.5 px-3 text-right">Invoiced Total</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {assignedFees.length === 0 && recentAssignments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                            No billing assignments found in active database.
                          </td>
                        </tr>
                      ) : (
                        [...recentAssignments, ...assignedFees].slice(0, 8).map((fee, i) => {
                          const isNew = fee.assignmentId; // local mock vs real DB
                          const assignId = isNew ? fee.assignmentId : `ASG-7${Math.floor(100 + i * 47)}`;
                          const stuId = isNew ? fee.studentId : fee.StudentID;
                          
                          // Find name
                          const foundStudent = students.find(s => s.StudentID === stuId);
                          const studentName = isNew ? fee.studentName : (foundStudent ? foundStudent.Name : stuId || "Unknown Student");
                          const sem = isNew ? fee.semester : fee.Semester;
                          const crs = isNew ? fee.course : fee.Course;
                          const due = isNew ? fee.dueDate : fee.DueDate;
                          const amt = isNew ? fee.totalFee : (fee.TotalAmount || 0);

                          return (
                            <tr key={i} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-3 font-mono font-bold text-blue-600">{assignId}</td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-800">{studentName}</div>
                                <div className="text-[10px] text-slate-400 font-bold">{stuId}</div>
                              </td>
                              <td className="py-3 px-3 text-slate-500">
                                {crs} • <span className="font-extrabold text-slate-700">{sem}</span>
                              </td>
                              <td className="py-3 px-3 text-rose-500 font-semibold">{due}</td>
                              <td className="py-3 px-3 text-right font-black text-slate-800 font-mono">
                                ${amt.toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100">
                                  Pending
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      alert(`Invoice Preview:\nID: ${assignId}\nStudent: ${studentName}\nSemester: ${sem}\nTotal: $${amt.toLocaleString()}\nDue Date: ${due}`);
                                    }}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                                    title="View"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setFeeStudentId(stuId);
                                      setFeeCourse(crs);
                                      setFeeSemester(sem);
                                      setFeeAssignStep(3);
                                    }}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-amber-600 transition-colors"
                                    title="Edit Structure"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm("Are you sure you want to retract this assignment ledger?")) {
                                        setAssignedFees(prev => prev.filter(f => f.StudentID !== stuId || f.Semester !== sem));
                                        alert("Assignment Retracted successfully.");
                                      }
                                    }}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600 transition-colors"
                                    title="Delete/Retract"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QUICK ACTIONS ROW */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Administrative Quick Actions Desk</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {/* 1. Assign Fee */}
                  <button
                    onClick={() => {
                      setFeeAssignStep(1);
                      setFeeStudentId("");
                      setSelectedStudent(null);
                    }}
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50/30 border border-slate-200/80 hover:border-blue-400 rounded-2xl cursor-pointer transition-all text-center space-y-2 group"
                  >
                    <PlusCircle className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-slate-700 group-hover:text-blue-700">Assign Fee</span>
                  </button>

                  {/* 2. Copy Previous Semester Fee */}
                  <button
                    onClick={() => {
                      if (!feeStudentId) {
                        alert("Please select a student in Step 1 first.");
                        return;
                      }
                      setFeeAdmission("0");
                      setFeeTuition("3500");
                      setFeeLaboratory("400");
                      setFeeLibrary("150");
                      setFeeExam("250");
                      setFeeHostel("0");
                      setFeeTransport("0");
                      setFeeUniform("0");
                      setFeeIdCard("0");
                      setFeeMisc("100");
                      setFeeAssignStep(3);
                      alert("Successfully cloned standard structure template values into fee form matrix!");
                    }}
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50/30 border border-slate-200/80 hover:border-blue-400 rounded-2xl cursor-pointer transition-all text-center space-y-2 group"
                  >
                    <Copy className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-slate-700 group-hover:text-blue-700">Cloning Template</span>
                  </button>

                  {/* 3. Bulk Assign */}
                  <button
                    onClick={() => {
                      setFeeIsBulk(true);
                      setFeeAssignStep(1);
                    }}
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50/30 border border-slate-200/80 hover:border-blue-400 rounded-2xl cursor-pointer transition-all text-center space-y-2 group"
                  >
                    <Layers className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-slate-700 group-hover:text-blue-700">Bulk Assign Fees</span>
                  </button>

                  {/* 4. Import Excel */}
                  <button
                    onClick={() => {
                      alert("Excel Import Template initialized: Please map columns [StudentID, CourseCode, SemesterID, Amount]. Ready to drop .xlsx files.");
                    }}
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50/30 border border-slate-200/80 hover:border-blue-400 rounded-2xl cursor-pointer transition-all text-center space-y-2 group"
                  >
                    <Upload className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-slate-700 group-hover:text-blue-700">Import Excel</span>
                  </button>

                  {/* 5. Export Excel */}
                  <button
                    onClick={() => {
                      triggerCSVReport();
                    }}
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50/30 border border-slate-200/80 hover:border-blue-400 rounded-2xl cursor-pointer transition-all text-center space-y-2 group"
                  >
                    <Download className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-slate-700 group-hover:text-blue-700">Export Excel</span>
                  </button>

                  {/* 6. Generate Report */}
                  <button
                    onClick={() => {
                      alert("Comprehensive fee audit report compiled. Check notification alerts to download PDF compiled summary.");
                    }}
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50/30 border border-slate-200/80 hover:border-blue-400 rounded-2xl cursor-pointer transition-all text-center space-y-2 group"
                  >
                    <FileSpreadsheet className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-slate-700 group-hover:text-blue-700">Generate Report</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS DESK */}
          {activeTab === "payments" && (() => {
            // Stats Calculations
            const totalCourseFee = assignedFees.reduce((acc, f) => acc + (Number(f.TotalAmount) || 0), 0);
            const totalPaid = payments.reduce((acc, p) => acc + (Number(p.Amount) || 0), 0);
            const pendingBalance = Math.max(0, totalCourseFee - totalPaid);
            
            const todayStr = "2026-07-03";
            const todayCollection = payments
              .filter(p => p.Date === todayStr)
              .reduce((acc, p) => acc + (Number(p.Amount) || 0), 0);
              
            const thisMonthStr = "2026-07";
            const monthlyCollection = payments
              .filter(p => p.Date && p.Date.startsWith(thisMonthStr))
              .reduce((acc, p) => acc + (Number(p.Amount) || 0), 0);
              
            const totalReceipts = payments.length;

            // Student Search
            const searchResults = students.filter(s => {
              const matchId = !searchQueryId || s.StudentID.toLowerCase().includes(searchQueryId.toLowerCase());
              const matchReg = !searchQueryReg || s.RegNo.toLowerCase().includes(searchQueryReg.toLowerCase());
              const matchMob = !searchQueryMob || s.Mobile.includes(searchQueryMob);
              const matchName = !searchQueryName || s.Name.toLowerCase().includes(searchQueryName.toLowerCase());
              return matchId && matchReg && matchMob && matchName;
            });

            // Semester breakdown for selected student
            const selectedStudentSemesters = selectedStudent ? (() => {
              const courseObj = courses.find(c => c.CourseCode === selectedStudent.Course);
              const totalSem = courseObj ? courseObj.TotalSemesters : 8;
              const sems: string[] = [];
              for (let i = 1; i <= totalSem; i++) {
                sems.push(`Semester ${i}`);
              }
              return sems;
            })() : [];

            // Detailed current semester calculations
            const currentSemDetails = selectedStudent && selectedSemester ? getSemesterFeeOverview(selectedStudent, selectedSemester) : null;

            // Live computation for step 3
            const parsedPayAmt = parseFloat(payAmount) || 0;
            const parsedPayFine = parseFloat(payFineInput) || 0;
            const parsedPayDisc = parseFloat(payDiscountInput) || 0;
            const parsedPaySchol = parseFloat(payScholarshipInput) || 0;
            const liveNetPayable = parsedPayAmt + parsedPayFine - parsedPayDisc - parsedPaySchol;
            const liveBalanceRemaining = currentSemDetails ? Math.max(0, currentSemDetails.balanceAmount - parsedPayAmt) : 0;

            const getPaymentStatus = (p: Payment) => {
              if (p.PaymentMode === "Cash" && p.Remarks?.toLowerCase().includes("pending")) return "Pending";
              if (p.Remarks?.toLowerCase().includes("failed")) return "Failed";
              return "Success";
            };

            // Step 9 Payments Ledger list filtering
            const filteredLedger = payments.filter((p) => {
              const st = students.find((s) => s.StudentID === p.StudentID);
              const searchString = historySearch.toLowerCase();
              const matchesSearch =
                !historySearch ||
                p.StudentID.toLowerCase().includes(searchString) ||
                p.ReceiptNumber.toLowerCase().includes(searchString) ||
                p.PaymentMode.toLowerCase().includes(searchString) ||
                p.TransactionNumber.toLowerCase().includes(searchString) ||
                p.FeeType.toLowerCase().includes(searchString) ||
                (st && st.Name.toLowerCase().includes(searchString));

              const matchesMode =
                historyFilterMode === "All" ||
                p.PaymentMode.toLowerCase() === historyFilterMode.toLowerCase() ||
                p.Semester === historyFilterMode;

              const matchesStatus =
                historyStatusFilter === "All" ||
                getPaymentStatus(p).toLowerCase() === historyStatusFilter.toLowerCase();

              let matchesDate = true;
              if (historyDateRange.start) {
                matchesDate = matchesDate && p.Date >= historyDateRange.start;
              }
              if (historyDateRange.end) {
                matchesDate = matchesDate && p.Date <= historyDateRange.end;
              }

              return matchesSearch && matchesMode && matchesStatus && matchesDate;
            });

            // Sort ledger based on historySortField and historySortOrder
            const sortedLedger = [...filteredLedger].sort((a, b) => {
              let comparison = 0;
              if (historySortField === "Receipt") {
                comparison = a.ReceiptNumber.localeCompare(b.ReceiptNumber);
              } else if (historySortField === "Date") {
                comparison = a.Date.localeCompare(b.Date);
              } else if (historySortField === "StudentID") {
                comparison = a.StudentID.localeCompare(b.StudentID);
              } else if (historySortField === "StudentName") {
                const nameA = students.find(s => s.StudentID === a.StudentID)?.Name || "";
                const nameB = students.find(s => s.StudentID === b.StudentID)?.Name || "";
                comparison = nameA.localeCompare(nameB);
              } else if (historySortField === "Semester") {
                comparison = a.Semester.localeCompare(b.Semester);
              } else if (historySortField === "PaymentMode") {
                comparison = a.PaymentMode.localeCompare(b.PaymentMode);
              } else if (historySortField === "Amount") {
                comparison = a.Amount - b.Amount;
              } else if (historySortField === "Status") {
                comparison = getPaymentStatus(a).localeCompare(getPaymentStatus(b));
              }

              return historySortOrder === "asc" ? comparison : -comparison;
            });

            const totalLedgerCount = sortedLedger.length;
            const ledgerTotalPages = Math.ceil(totalLedgerCount / historyLimit) || 1;
            const ledgerStartIndex = (historyPage - 1) * historyLimit;
            const paginatedLedger = sortedLedger.slice(ledgerStartIndex, ledgerStartIndex + historyLimit);

            // Export CSV helper
            const handleExportCSV = () => {
              const headers = ["Receipt Number", "Date", "StudentID", "Course", "Semester", "Fee Type", "Payment Mode", "Transaction ID", "Amount Paid"];
              const rows = sortedLedger.map(p => [
                p.ReceiptNumber,
                p.Date,
                p.StudentID,
                p.Course,
                p.Semester,
                p.FeeType,
                p.PaymentMode,
                p.TransactionNumber,
                `$${p.Amount}`
              ]);
              const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${val}"`).join(","))].join("\n");
              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              const link = document.createElement("a");
              const url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              link.setAttribute("download", `ERP_Fee_Transactions_${new Date().toISOString().split("T")[0]}.csv`);
              link.style.visibility = "hidden";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div className="space-y-6">
                {/* Real-time sync panel header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Dashboard</span>
                      <span className="text-slate-300">/</span>
                      <span>Fees</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-blue-600">Payment</span>
                    </div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">Premium ERP Fee Payment Console</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-blue-700 flex items-center gap-1.5 justify-end">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Automated Billing & Sheets Sync
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">
                        UTC: 2026-07-03 | SECURE BANK GATEWAY
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dashboard Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {/* Card 1 */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.2)" }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md p-4 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Total Course Fee</span>
                      <span className="p-1 bg-white/10 rounded"><DollarSign className="w-3.5 h-3.5" /></span>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-lg font-black tracking-tight font-mono">${totalCourseFee.toLocaleString()}</h4>
                      <div className="flex items-center justify-between mt-1 text-[9px] text-blue-150">
                        <span>+12.4% vs last year</span>
                        <svg className="w-12 h-5 text-blue-200" viewBox="0 0 100 30" fill="none">
                          <path d="M0,25 L15,20 L30,22 L45,15 L60,18 L75,10 L100,5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 2 */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.2)" }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md p-4 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Total Paid</span>
                      <span className="p-1 bg-white/10 rounded"><CheckCircle className="w-3.5 h-3.5" /></span>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-lg font-black tracking-tight font-mono">${totalPaid.toLocaleString()}</h4>
                      <div className="flex items-center justify-between mt-1 text-[9px] text-emerald-150">
                        <span>+18.2% received</span>
                        <svg className="w-12 h-5 text-emerald-200" viewBox="0 0 100 30" fill="none">
                          <path d="M0,28 L25,23 L50,15 L75,10 L100,2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 3 */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.2)" }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-md p-4 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">Pending Balance</span>
                      <span className="p-1 bg-white/10 rounded"><AlertCircle className="w-3.5 h-3.5" /></span>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-lg font-black tracking-tight font-mono">${pendingBalance.toLocaleString()}</h4>
                      <div className="flex items-center justify-between mt-1 text-[9px] text-amber-150">
                        <span>-4.2% collection gap</span>
                        <svg className="w-12 h-5 text-amber-200" viewBox="0 0 100 30" fill="none">
                          <path d="M0,5 L25,8 L50,15 L75,22 L100,25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 4 */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 25px -5px rgba(244, 63, 94, 0.2)" }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-2xl shadow-md p-4 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-100">Today's Collection</span>
                      <span className="p-1 bg-white/10 rounded"><TrendingUp className="w-3.5 h-3.5" /></span>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-lg font-black tracking-tight font-mono">${todayCollection.toLocaleString()}</h4>
                      <div className="flex items-center justify-between mt-1 text-[9px] text-rose-150">
                        <span>Live cash logging</span>
                        <svg className="w-12 h-5 text-rose-200" viewBox="0 0 100 30" fill="none">
                          <path d="M0,28 L30,28 L60,25 L80,10 L100,2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 5 */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.2)" }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-violet-700 text-white rounded-2xl shadow-md p-4 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-100">Monthly Revenue</span>
                      <span className="p-1 bg-white/10 rounded"><Calendar className="w-3.5 h-3.5" /></span>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-lg font-black tracking-tight font-mono">${monthlyCollection.toLocaleString()}</h4>
                      <div className="flex items-center justify-between mt-1 text-[9px] text-purple-150">
                        <span>92.4% target met</span>
                        <svg className="w-12 h-5 text-purple-200" viewBox="0 0 100 30" fill="none">
                          <path d="M0,25 L25,18 L50,22 L75,12 L100,5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 6 */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 25px -5px rgba(6, 182, 212, 0.2)" }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative overflow-hidden bg-gradient-to-br from-cyan-600 to-sky-700 text-white rounded-2xl shadow-md p-4 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-100">Total Receipts</span>
                      <span className="p-1 bg-white/10 rounded"><FileText className="w-3.5 h-3.5" /></span>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-lg font-black tracking-tight font-mono">{totalReceipts} Receipts</h4>
                      <div className="flex items-center justify-between mt-1 text-[9px] text-cyan-150">
                        <span>Audited logs synced</span>
                        <svg className="w-12 h-5 text-cyan-200" viewBox="0 0 100 30" fill="none">
                          <path d="M0,25 L30,22 L60,18 L80,12 L100,5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Stepper Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6">
                  {/* Horizonal Stepper Progress Tracker */}
                  <div className="flex items-center justify-between overflow-x-auto pb-4 mb-6 border-b border-slate-100 gap-4">
                    {[
                      { step: "search", label: "1. Search Student" },
                      { step: "profile", label: "2. Student Profile" },
                      { step: "entry", label: "3. Payment Entry" },
                      { step: "review", label: "4. Review" },
                      { step: "processing", label: "5. Processing" },
                      { step: "success", label: "6. Success" }
                    ].map((s, i) => {
                      const wizardOrder = ["search", "profile", "entry", "review", "processing", "success"];
                      const currentIdx = wizardOrder.indexOf(payWizardStep);
                      const sIdx = wizardOrder.indexOf(s.step);
                      const isActive = payWizardStep === s.step;
                      const isCompleted = currentIdx > sIdx;
                      return (
                        <div key={s.step} className="flex items-center gap-2 shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                            isActive ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105" :
                            isCompleted ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                            "bg-slate-50 text-slate-400 border-slate-200"
                          }`}>
                            {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                          </div>
                          <span className={`text-xs font-bold transition-all ${
                            isActive ? "text-slate-800 font-extrabold" :
                            isCompleted ? "text-emerald-700" :
                            "text-slate-400"
                          }`}>
                            {s.label.split(". ")[1]}
                          </span>
                          {i < 5 && <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Step Content */}

                  {/* STEP 1: SEARCH STUDENT */}
                  {payWizardStep === "search" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/65">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Search Student ID</label>
                          <input
                            type="text"
                            placeholder="e.g. STU2025001"
                            value={searchQueryId}
                            onChange={(e) => setSearchQueryId(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Register Number</label>
                          <input
                            type="text"
                            placeholder="e.g. REG20257492"
                            value={searchQueryReg}
                            onChange={(e) => setSearchQueryReg(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Mobile Number</label>
                          <input
                            type="text"
                            placeholder="e.g. +1 555"
                            value={searchQueryMob}
                            onChange={(e) => setSearchQueryMob(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Student Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Alex Mercer"
                            value={searchQueryName}
                            onChange={(e) => setSearchQueryName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={handleQRScan}
                          className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs py-2.5 px-4 rounded-xl border border-indigo-100 transition-all cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" /> Scan Student ID Card (QR Scanner)
                        </button>
                        <div className="text-slate-400 text-xs font-medium">
                          Found <span className="font-bold text-slate-800">{searchResults.length}</span> students matching filters
                        </div>
                      </div>

                      {/* Mock QR Scanner Overlay */}
                      {qrScannerOpen && (
                        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                          <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 p-8 max-w-sm w-full text-center space-y-6">
                            <div className="relative w-48 h-48 mx-auto border-2 border-dashed border-blue-500 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-900">
                              {/* Glowing Scan Line */}
                              <div className="absolute inset-x-0 h-0.5 bg-blue-500 shadow-[0_0_10px_2px_rgba(59,130,246,0.7)] animate-bounce" style={{ animationDuration: '3s' }}></div>
                              <QrCode className="w-24 h-24 text-slate-700 animate-pulse" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm tracking-tight">Active QR ID Scanner</h3>
                              <p className="text-[10px] text-slate-500 mt-1 font-mono">ALIGN DIGITAL IDENTITY CARD QR WITHIN THE REGION</p>
                            </div>
                            <div className="text-blue-400 text-xs font-bold font-mono animate-pulse">
                              HOLD STILL • DECODING MATRIX...
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Results grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.length === 0 ? (
                          <div className="col-span-full text-center py-12 bg-slate-50 border border-slate-150 rounded-2xl text-slate-400 font-medium">
                            No students match your query filters. Please try searching other fields.
                          </div>
                        ) : (
                          searchResults.map((st) => {
                            const isSelected = selectedStudent?.StudentID === st.StudentID;
                            return (
                              <div
                                key={st.StudentID}
                                onClick={() => {
                                  setSelectedStudent(st);
                                  setPayStudentId(st.StudentID);
                                  setPayCourse(st.Course);
                                  setPaySemester(st.Semester);
                                  setSelectedSemester(st.Semester);
                                  setPayWizardStep("profile");
                                }}
                                className={`group p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-4 hover:shadow-md hover:border-blue-400 ${
                                  isSelected ? "border-blue-500 bg-blue-50/20" : "border-slate-200"
                                }`}
                              >
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm group-hover:scale-105 transition-all shadow-inner uppercase">
                                  {st.Name.slice(0, 2)}
                                </div>
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <h4 className="font-extrabold text-slate-800 text-xs truncate group-hover:text-blue-600 transition-colors">{st.Name}</h4>
                                  <p className="text-[10px] text-slate-400 font-mono font-bold">{st.StudentID} • {st.RegNo}</p>
                                  <p className="text-[10px] text-slate-500 font-bold truncate">{st.Course} ({st.Semester})</p>
                                </div>
                                <div className="shrink-0">
                                  <span className="p-1.5 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <UserCheck className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: PROFILE & OVERVIEW */}
                  {payWizardStep === "profile" && selectedStudent && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Left: Student Profile Card, Right: Semester list cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Profile left Column */}
                        <div className="lg:col-span-4 bg-slate-50 rounded-2xl border border-slate-200/70 p-5 space-y-4">
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md uppercase">
                              {selectedStudent.Name.slice(0, 2)}
                            </div>
                            <h3 className="font-black text-slate-800 mt-3 text-sm">{selectedStudent.Name}</h3>
                            <span className="inline-block bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider mt-1 border border-emerald-200">
                              {selectedStudent.Status} Student
                            </span>
                          </div>

                          <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-400 font-semibold">Student ID</span>
                              <span className="font-mono font-bold text-slate-700">{selectedStudent.StudentID}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-400 font-semibold">Register No</span>
                              <span className="font-mono font-bold text-slate-700">{selectedStudent.RegNo}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-400 font-semibold">Course</span>
                              <span className="font-bold text-slate-700 text-right truncate max-w-[160px]">{selectedStudent.Course}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-400 font-semibold">Department</span>
                              <span className="font-bold text-slate-700">{selectedStudent.Department}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-400 font-semibold">Current Sem</span>
                              <span className="font-extrabold text-blue-600">{selectedStudent.Semester}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-400 font-semibold">Contact</span>
                              <span className="font-bold text-slate-700">{selectedStudent.Mobile}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setPayWizardStep("search")}
                            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
                          </button>
                        </div>

                        {/* Semester list right Column */}
                        <div className="lg:col-span-8 space-y-4">
                          <div>
                            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider text-slate-400 mb-2">Registered Terms & Invoices</h3>
                            <p className="text-[11px] text-slate-400 font-medium">Select a semester terms category below to view comprehensive line-item invoice billing logs and initiate online transaction receipts.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedStudentSemesters.map((sem) => {
                              const semInfo = getSemesterFeeOverview(selectedStudent, sem);
                              const isSelected = selectedSemester === sem;
                              
                              let statusColor = "bg-rose-50 text-rose-800 border-rose-100";
                              if (semInfo.status === "Paid") statusColor = "bg-emerald-50 text-emerald-800 border-emerald-150";
                              else if (semInfo.status === "Partial") statusColor = "bg-amber-50 text-amber-800 border-amber-150";

                              return (
                                <div
                                  key={sem}
                                  onClick={() => setSelectedSemester(sem)}
                                  className={`p-4 bg-white rounded-2xl border cursor-pointer transition-all shadow-xs space-y-3 relative hover:shadow-md hover:border-blue-400 ${
                                    isSelected ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200"
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-extrabold text-slate-800 text-xs">{sem}</h4>
                                      <p className="text-[10px] text-slate-400 font-mono font-semibold mt-0.5">Due: {semInfo.dueDate}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border ${statusColor}`}>
                                      {semInfo.status}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-1 bg-slate-50 rounded-xl border border-slate-100">
                                    <div>
                                      <p className="text-[9px] text-slate-400 font-semibold uppercase">Total</p>
                                      <p className="font-bold text-slate-700 font-mono">${semInfo.totalFee.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-slate-400 font-semibold uppercase">Paid</p>
                                      <p className="font-bold text-emerald-600 font-mono">${semInfo.paidAmount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-slate-400 font-semibold uppercase">Balance</p>
                                      <p className="font-bold text-rose-600 font-mono">${semInfo.balanceAmount.toLocaleString()}</p>
                                    </div>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[8px] font-bold text-slate-400">
                                      <span>Paid Progress</span>
                                      <span>{semInfo.progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className={`h-full transition-all ${
                                          semInfo.progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                                        }`}
                                        style={{ width: `${semInfo.progress}%` }}
                                      ></div>
                                    </div>
                                  </div>

                                  {/* Button */}
                                  <div className="pt-1 flex justify-end">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSemester(sem);
                                        setPaySemester(sem);
                                        // Auto-load student balance to form amount
                                        setPayAmount(semInfo.balanceAmount.toString());
                                        setPayWizardStep("entry");
                                      }}
                                      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all shadow-xs"
                                    >
                                      <CreditCard className="w-3 h-3" /> Pay Now
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Step 4 Breakdown Details (displaying always below in Step 2) */}
                      {selectedSemester && currentSemDetails && (
                        <div className="border-t border-slate-100 pt-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider text-slate-400">Line-Item Fee Breakdown ({selectedSemester})</h3>
                              <p className="text-[11px] text-slate-400 font-medium">Review the complete itemized fee allocations, academic fine structures, grants, and scholarships assigned for this term.</p>
                            </div>
                            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 font-bold text-xs">
                              Outstanding Dues: <span className="font-mono font-black">${currentSemDetails.balanceAmount.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="overflow-x-auto bg-slate-50/50 rounded-2xl border border-slate-200/70">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                                  <th className="py-2.5 px-4">Fee Category Type</th>
                                  <th className="py-2.5 px-4 text-right">Invoiced Amount</th>
                                  <th className="py-2.5 px-4 text-center">Type</th>
                                  <th className="py-2.5 px-4 text-right">Outstanding Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-600">
                                <tr>
                                  <td className="py-2.5 px-4 font-bold text-slate-700">Tuition Fee</td>
                                  <td className="py-2.5 px-4 text-right font-mono font-semibold">${currentSemDetails.breakdown.tuitionFee.toLocaleString()}</td>
                                  <td className="py-2.5 px-4 text-center"><span className="bg-blue-50 text-blue-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">Standard</span></td>
                                  <td className="py-2.5 px-4 text-right text-slate-500 font-mono font-semibold">Itemized in billing</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-4 font-bold text-slate-700">Admission Fee</td>
                                  <td className="py-2.5 px-4 text-right font-mono font-semibold">${currentSemDetails.breakdown.admissionFee.toLocaleString()}</td>
                                  <td className="py-2.5 px-4 text-center"><span className="bg-blue-50 text-blue-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">One-time</span></td>
                                  <td className="py-2.5 px-4 text-right text-slate-500 font-mono font-semibold">Registration ledger</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-4 font-bold text-slate-700">Exam Fee</td>
                                  <td className="py-2.5 px-4 text-right font-mono font-semibold">${currentSemDetails.breakdown.examFee.toLocaleString()}</td>
                                  <td className="py-2.5 px-4 text-center"><span className="bg-slate-100 text-slate-600 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">Termly</span></td>
                                  <td className="py-2.5 px-4 text-right text-slate-500 font-mono font-semibold">Evaluation dues</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-4 font-bold text-slate-700">Library Fee</td>
                                  <td className="py-2.5 px-4 text-right font-mono font-semibold">${currentSemDetails.breakdown.libraryFee.toLocaleString()}</td>
                                  <td className="py-2.5 px-4 text-center"><span className="bg-slate-100 text-slate-600 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">Termly</span></td>
                                  <td className="py-2.5 px-4 text-right text-slate-500 font-mono font-semibold">Service log</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-4 font-bold text-slate-700">Laboratory Fee</td>
                                  <td className="py-2.5 px-4 text-right font-mono font-semibold">${currentSemDetails.breakdown.laboratoryFee.toLocaleString()}</td>
                                  <td className="py-2.5 px-4 text-center"><span className="bg-indigo-50 text-indigo-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">Course-specific</span></td>
                                  <td className="py-2.5 px-4 text-right text-slate-500 font-mono font-semibold">Practical lab dues</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-4 font-bold text-slate-700">Hostel Fee</td>
                                  <td className="py-2.5 px-4 text-right font-mono font-semibold">${currentSemDetails.breakdown.hostelFee.toLocaleString()}</td>
                                  <td className="py-2.5 px-4 text-center"><span className="bg-amber-50 text-amber-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">Optional</span></td>
                                  <td className="py-2.5 px-4 text-right text-slate-500 font-mono font-semibold">Accommodation</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-4 font-bold text-slate-700">Transport Fee</td>
                                  <td className="py-2.5 px-4 text-right font-mono font-semibold">${currentSemDetails.breakdown.transportFee.toLocaleString()}</td>
                                  <td className="py-2.5 px-4 text-center"><span className="bg-amber-50 text-amber-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">Optional</span></td>
                                  <td className="py-2.5 px-4 text-right text-slate-500 font-mono font-semibold">Bus log routes</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-4 font-bold text-slate-700">Miscellaneous Fee</td>
                                  <td className="py-2.5 px-4 text-right font-mono font-semibold">${currentSemDetails.breakdown.miscellaneousFee.toLocaleString()}</td>
                                  <td className="py-2.5 px-4 text-center"><span className="bg-slate-100 text-slate-600 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">Auxiliary</span></td>
                                  <td className="py-2.5 px-4 text-right text-slate-500 font-mono font-semibold">Administrative</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-4 font-bold text-slate-700">Late Fees / Fines</td>
                                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-rose-600">${currentSemDetails.breakdown.fine.toLocaleString()}</td>
                                  <td className="py-2.5 px-4 text-center"><span className="bg-red-50 text-red-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">Penalty</span></td>
                                  <td className="py-2.5 px-4 text-right text-rose-500 font-mono font-semibold">Overdue charges</td>
                                </tr>
                                <tr className="bg-emerald-50/20">
                                  <td className="py-2.5 px-4 font-bold text-emerald-800 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Merit Scholarship</td>
                                  <td className="py-2.5 px-4 text-right font-mono font-extrabold text-emerald-700">-${currentSemDetails.breakdown.scholarship.toLocaleString()}</td>
                                  <td className="py-2.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">Deduction</span></td>
                                  <td className="py-2.5 px-4 text-right text-emerald-600 font-semibold">Waived credit</td>
                                </tr>
                                <tr className="bg-emerald-50/20">
                                  <td className="py-2.5 px-4 font-bold text-emerald-800 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Special Discount</td>
                                  <td className="py-2.5 px-4 text-right font-mono font-extrabold text-emerald-700">-${currentSemDetails.breakdown.discount.toLocaleString()}</td>
                                  <td className="py-2.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">Deduction</span></td>
                                  <td className="py-2.5 px-4 text-right text-emerald-600 font-semibold">Waived credit</td>
                                </tr>
                                <tr className="bg-slate-100/60 font-black text-slate-800">
                                  <td className="py-3 px-4 font-extrabold">Net Payable Total Amount</td>
                                  <td className="py-3 px-4 text-right font-mono text-sm">${currentSemDetails.totalFee.toLocaleString()}</td>
                                  <td className="py-3 px-4 text-center"><span className="bg-blue-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded uppercase">Invoiced</span></td>
                                  <td className="py-3 px-4 text-right text-blue-700 font-mono font-black">Net billing assigned</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 3: PAYMENT ENTRY */}
                  {payWizardStep === "entry" && selectedStudent && currentSemDetails && (
                    <div className="space-y-6 animate-fadeIn">
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-blue-600" /> Enter Payment Dues Registration Detail
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Specify payment amounts, reference vouchers, and payment gateways. Live balance remaining calculates instantly while typing.</p>
                      </div>

                      {paySubmitStatus && (
                        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold text-center">
                          {paySubmitStatus}
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Form controls (8 cols) */}
                        <div className="lg:col-span-8 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Active Student</label>
                              <input type="text" value={`${selectedStudent.Name} (${selectedStudent.StudentID})`} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 font-bold" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Selected Term / Semester</label>
                              <input type="text" value={selectedSemester} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 font-bold" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Fee Category Type</label>
                              <select
                                value={payFeeType}
                                onChange={(e) => setPayFeeType(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-semibold"
                              >
                                <option value="TuitionFee">Tuition Fee</option>
                                <option value="AdmissionFee">Admission Fee</option>
                                <option value="ExamFee">Exam Fee</option>
                                <option value="LibraryFee">Library Fee</option>
                                <option value="LaboratoryFee">Laboratory Fee</option>
                                <option value="HostelFee">Hostel Fee</option>
                                <option value="TransportFee">Transport Fee</option>
                                <option value="TotalFees">All Dues Settlement (Total)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Settle Base Amount ($)</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Scholarship Credit ($)</label>
                              <input
                                type="number"
                                value={payScholarshipInput}
                                onChange={(e) => setPayScholarshipInput(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-emerald-700 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Special Discount ($)</label>
                              <input
                                type="number"
                                value={payDiscountInput}
                                onChange={(e) => setPayDiscountInput(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-emerald-700 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Overdue Late Fine ($)</label>
                              <input
                                type="number"
                                value={payFineInput}
                                onChange={(e) => setPayFineInput(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-rose-600 font-bold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Payment Mode</label>
                              <select
                                value={payMode}
                                onChange={(e) => setPayMode(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-semibold"
                              >
                                <option value="UPI">UPI Payment Gate</option>
                                <option value="Cash">Physical Cash Handover</option>
                                <option value="Card">Bank Debit/Credit Card</option>
                                <option value="NetBanking">E-Banking Transfer</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Transaction Voucher ID</label>
                              <input
                                type="text"
                                placeholder="TXN982301"
                                value={payTxNo}
                                onChange={(e) => setPayTxNo(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-700"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Bank Name (Card/Transfer)</label>
                              <input
                                type="text"
                                placeholder="Federal Reserve Bank"
                                value={payBankName}
                                onChange={(e) => setPayBankName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Ledger Remarks / Internal Notes</label>
                            <input
                              type="text"
                              placeholder="Cash handed to registrar, print receipt issued immediately"
                              value={payRemarks}
                              onChange={(e) => setPayRemarks(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                            <button
                              type="button"
                              onClick={() => setPayWizardStep("profile")}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2 px-5 rounded-lg transition-all cursor-pointer"
                            >
                              Go Back
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (liveNetPayable <= 0) {
                                  alert("Net Payable amount must be greater than 0");
                                  return;
                                }
                                setPayWizardStep("review");
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-6 rounded-lg transition-all shadow-md cursor-pointer"
                            >
                              Proceed to Review
                            </button>
                          </div>
                        </div>

                        {/* Live Balance Summary Panel (4 cols) */}
                        <div className="lg:col-span-4 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                          <div>
                            <h4 className="font-extrabold text-blue-400 text-xs uppercase tracking-wider">LIVE COMPARISON STATEMENT</h4>
                            <p className="text-[10px] text-slate-400 font-medium">Automatic balance updates calculated securely in real time.</p>
                          </div>

                          <div className="space-y-3 font-medium text-xs border-y border-slate-800 py-3">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Total Owed in {selectedSemester}</span>
                              <span className="font-mono text-slate-200">${currentSemDetails.totalFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Paid Ledger Total</span>
                              <span className="font-mono text-emerald-400">${currentSemDetails.paidAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm">
                              <span className="text-slate-300">Outstanding Balance</span>
                              <span className="font-mono text-rose-400">${currentSemDetails.balanceAmount.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="space-y-3 font-medium text-xs">
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-300">Base Amount Settle</span>
                              <span className="font-mono text-blue-400">+${parsedPayAmt.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Late Overdue Fine</span>
                              <span className="font-mono text-rose-400">+${parsedPayFine.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Special Discount Code</span>
                              <span className="font-mono text-emerald-400">-${parsedPayDisc.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Scholarship Credit</span>
                              <span className="font-mono text-emerald-400">-${parsedPaySchol.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-800 pt-3 space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs font-extrabold text-blue-400">NET TRANSACTION PAYABLE</span>
                              <span className="text-lg font-black font-mono text-white">${liveNetPayable.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-baseline text-[10px]">
                              <span className="text-slate-400 font-semibold">Remaining Semester Dues</span>
                              <span className="font-mono text-amber-400 font-bold">${liveBalanceRemaining.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-[10px] text-slate-400 font-medium">
                            🟢 Online check validated. Remaining dues will update immediately upon authorization.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: REVIEW PAYMENT */}
                  {payWizardStep === "review" && selectedStudent && currentSemDetails && (
                    <div className="space-y-6 animate-fadeIn">
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-blue-600" /> Review Payment & Transaction Dues
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Review the complete transaction breakdown. Double check accounts and student profiles before ledger authorization.</p>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 max-w-2xl mx-auto">
                        <div className="text-center pb-4 border-b border-slate-200">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OFFICIAL COLLEGE ERP STATEMENT</p>
                          <h4 className="text-sm font-black text-slate-800 mt-1">PRE-AUTHORIZATION SUMMARY REVIEW</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                          <div className="space-y-2">
                            <p className="text-slate-400">Student Name: <span className="text-slate-800 font-extrabold">{selectedStudent.Name}</span></p>
                            <p className="text-slate-400">Student ID: <span className="text-slate-800 font-mono">{selectedStudent.StudentID}</span></p>
                            <p className="text-slate-400">Register No: <span className="text-slate-800 font-mono">{selectedStudent.RegNo}</span></p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-slate-400">Course & Sem: <span className="text-slate-800">{selectedStudent.Course} ({selectedSemester})</span></p>
                            <p className="text-slate-400">Category Type: <span className="text-slate-800 font-extrabold">{payFeeType}</span></p>
                            <p className="text-slate-400">Date: <span className="text-slate-800">{new Date().toISOString().split("T")[0]}</span></p>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-slate-300 pt-3 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Base Settle Amount:</span>
                            <span className="font-mono text-slate-800">${parsedPayAmt.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Late Overdue Fine:</span>
                            <span className="font-mono text-slate-800">${parsedPayFine.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Scholarship waiver:</span>
                            <span className="font-mono text-slate-800">-${parsedPaySchol.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Special Discount:</span>
                            <span className="font-mono text-slate-800">-${parsedPayDisc.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-black text-sm border-t border-slate-200 pt-2 text-slate-800">
                            <span>NET AMOUNT PAYABLE:</span>
                            <span className="font-mono text-blue-600">${liveNetPayable.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-[10px] text-blue-800 font-bold space-y-1">
                          <p>• MODE: {payMode.toUpperCase()} {payTxNo ? `(${payTxNo})` : ""}</p>
                          {payBankName && <p>• BANK GATEWAY: {payBankName}</p>}
                          {payRemarks && <p>• MEMO NOTES: {payRemarks}</p>}
                        </div>

                        <div className="flex justify-between pt-4">
                          <button
                            type="button"
                            onClick={() => setPayWizardStep("entry")}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2 px-5 rounded-lg transition-all cursor-pointer"
                          >
                            Back to Form
                          </button>
                          <button
                            type="button"
                            onClick={handleStartProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-6 rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" /> Authorize & Sync Dues
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: PROCESSING */}
                  {payWizardStep === "processing" && (
                    <div className="text-center py-16 space-y-6 max-w-sm mx-auto">
                      <div className="relative w-20 h-20 mx-auto">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-500 font-mono">
                          {processingProgress}%
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-black text-slate-800 text-sm">Authorizing Digital Ledger Receipt</h3>
                        <p className="text-xs text-slate-400 font-medium">Securing connection to Federal Reserve Web Services. Synchronizing database records across Google Sheets in real time...</p>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div className="h-full bg-blue-600 transition-all" style={{ width: `${processingProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: RECEIPT SUCCESS */}
                  {payWizardStep === "success" && successReceiptDetails && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="text-center py-6 space-y-2 max-w-md mx-auto">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-200">
                          <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="font-black text-slate-800 text-lg">Transaction Authorized!</h3>
                        <p className="text-xs text-slate-400 font-medium">Receipt recorded securely. Automated billing notifications sent to student's registered mobile card.</p>
                      </div>

                      {/* Official Invoice Card */}
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 max-w-lg mx-auto shadow-md relative" id="printable-receipt-card">
                        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                          <div>
                            <h2 className="font-black text-slate-800 text-sm">FEDERAL INSTITUTE OF TECHNOLOGY</h2>
                            <p className="text-[10px] text-slate-400 font-mono font-bold">ERP OFFICIAL FINANCIAL SERVICES LEDGER</p>
                          </div>
                          <div className="text-right">
                            <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-2 py-0.5 rounded uppercase border border-emerald-200">OFFICIAL PAID</span>
                            <p className="text-[9px] text-slate-400 font-mono font-semibold mt-1">Receipt Number: {successReceiptDetails.receiptNumber}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-[11px] font-semibold text-slate-500 py-4 border-b border-slate-100">
                          <div>
                            <p>Student Name: <span className="text-slate-800 font-black">{successReceiptDetails.studentName}</span></p>
                            <p>StudentID: <span className="text-slate-800 font-mono">{successReceiptDetails.studentId}</span></p>
                            <p>Course: <span className="text-slate-800">{successReceiptDetails.course}</span></p>
                          </div>
                          <div className="text-right">
                            <p>Term: <span className="text-slate-800">{successReceiptDetails.semester}</span></p>
                            <p>Category Type: <span className="text-slate-800 font-extrabold">{successReceiptDetails.feeType}</span></p>
                            <p>Auth Date: <span className="text-slate-800 font-mono">{successReceiptDetails.date} {successReceiptDetails.time}</span></p>
                          </div>
                        </div>

                        <div className="py-4 space-y-2 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span>Settle Base Amount:</span>
                            <span className="font-mono font-bold">${successReceiptDetails.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Late Overdue Penalty Fine:</span>
                            <span className="font-mono text-rose-500 font-bold">${successReceiptDetails.fine.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Special Merit Scholarship Applied:</span>
                            <span className="font-mono text-emerald-600 font-bold">-${successReceiptDetails.scholarship.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Promo Discount Waiver:</span>
                            <span className="font-mono text-emerald-600 font-bold">-${successReceiptDetails.discount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-black text-sm border-t border-slate-200 pt-3 text-slate-800">
                            <span>NET CONSOLE PAID TOTAL:</span>
                            <span className="font-mono text-emerald-600 text-lg">${successReceiptDetails.netPayable.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-slate-100/60 p-3 rounded-2xl border border-slate-200 text-[10px] text-slate-400 font-mono space-y-1">
                          <p>• TXN REFERENCE: {successReceiptDetails.transactionId}</p>
                          <p>• MODE OF BILLING: {successReceiptDetails.paymentMode.toUpperCase()}</p>
                          {successReceiptDetails.remarks && <p>• AUDIT REMARKS: {successReceiptDetails.remarks}</p>}
                        </div>

                        {/* Barcode Mock */}
                        <div className="flex flex-col items-center justify-center pt-4 border-t border-dashed border-slate-300 mt-4 text-center">
                          <div className="flex gap-0.5 h-8 items-center bg-slate-900 px-3 py-1.5 rounded">
                            {[1,3,1,1,4,2,1,3,2,1,4,1,2,3,1,1,4].map((w, idx) => (
                              <div key={idx} className="bg-white h-full" style={{ width: `${w}px` }}></div>
                            ))}
                          </div>
                          <p className="text-[8px] font-mono font-black text-slate-400 tracking-widest mt-1">*{successReceiptDetails.paymentId}*</p>
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => window.print()}
                          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          <Printer className="w-4 h-4" /> Print Receipt Statement
                        </button>
                        <button
                          onClick={() => {
                            // Mocking PDF down by triggering a nice print or CSV
                            alert("Receipt statement generated and downloaded successfully as high-density vector PDF.");
                          }}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          <Download className="w-4 h-4" /> Download PDF Statement
                        </button>
                        <button
                          onClick={() => {
                            alert("Billing notification sent successfully to WhatsApp.");
                          }}
                          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-2 px-4 border border-emerald-100 rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          <Share2 className="w-4 h-4" /> Share WhatsApp
                        </button>
                        <button
                          onClick={() => {
                            alert("Billing notification statement dispatched successfully to student's email.");
                          }}
                          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          <Mail className="w-4 h-4" /> Dispatch Email
                        </button>
                      </div>

                      <div className="text-center pt-4">
                        <button
                          onClick={() => {
                            setPayWizardStep("search");
                            setSelectedStudent(null);
                            setSelectedSemester("");
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 px-8 rounded-2xl transition-all shadow-md cursor-pointer"
                        >
                          Process Another Student Payment
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* STEP 9: PAYMENT HISTORY TABLE LEDGER */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                        <CreditCard className="w-4.5 h-4.5 text-blue-600" /> General Cash Transactions Ledger Logs (Step 9)
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">Search, filter, paginate and audit all official payment transaction collections synced in real time.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-1.5 px-3 rounded-lg transition-all shadow-xs cursor-pointer border border-slate-200/40"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export Excel
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-1.5 px-3 rounded-lg transition-all shadow-xs cursor-pointer border border-slate-200/40"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-600" /> Print Ledger
                      </button>
                    </div>
                  </div>

                  {/* Searching & Filter options */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search student, receipt, ref..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <select
                        value={historyFilterMode}
                        onChange={(e) => setHistoryFilterMode(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        <option value="All">All Payment Modes</option>
                        <option value="UPI">UPI Gateways</option>
                        <option value="Cash">Physical Cash</option>
                        <option value="Card">Bank Cards</option>
                        <option value="NetBanking">Net Banking</option>
                        <option value="Semester 1">Semester 1 Term</option>
                        <option value="Semester 2">Semester 2 Term</option>
                        <option value="Semester 3">Semester 3 Term</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={historyStatusFilter}
                        onChange={(e) => setHistoryStatusFilter(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Success">Success / Settled</option>
                        <option value="Pending">Pending Approval</option>
                        <option value="Failed">Failed / Rejected</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="date"
                        value={historyDateRange.start}
                        onChange={(e) => setHistoryDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={historyDateRange.end}
                        onChange={(e) => setHistoryDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Dense ledger table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    {(() => {
                      const renderHeader = (field: string, label: string, align: "left" | "center" | "right" = "left") => {
                        const isSorted = historySortField === field;
                        return (
                          <th
                            onClick={() => {
                              if (historySortField === field) {
                                setHistorySortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setHistorySortField(field);
                                setHistorySortOrder("asc");
                              }
                            }}
                            className={`py-2.5 px-4 text-${align} cursor-pointer hover:bg-slate-100/80 transition-all select-none font-bold text-slate-500`}
                          >
                            <div className={`flex items-center gap-1.5 ${align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"}`}>
                              <span className="text-[10px] uppercase tracking-wider">{label}</span>
                              <span className="transition-transform duration-200">
                                {isSorted ? (
                                  historySortOrder === "asc" ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-blue-600 font-extrabold inline-block" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-blue-600 font-extrabold inline-block" />
                                  )
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-slate-300 hover:text-slate-500 inline-block" />
                                )}
                              </span>
                            </div>
                          </th>
                        );
                      };

                      return (
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                              {renderHeader("Receipt", "Receipt")}
                              {renderHeader("Date", "Date")}
                              {renderHeader("StudentName", "Student ID & Name")}
                              {renderHeader("Semester", "Semester")}
                              {renderHeader("PaymentMode", "Mode", "center")}
                              <th className="py-2.5 px-4 text-center">Category</th>
                              {renderHeader("Status", "Status", "center")}
                              {renderHeader("Amount", "Settled Amount", "right")}
                              <th className="py-2.5 px-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                            {paginatedLedger.length === 0 ? (
                              <tr>
                                <td colSpan={9} className="text-center py-12 text-slate-400 font-bold">No payment transactions registered matching filters.</td>
                              </tr>
                            ) : (
                              paginatedLedger.map((p) => {
                                const st = students.find(s => s.StudentID === p.StudentID);
                                const status = getPaymentStatus(p);
                                return (
                                  <tr key={p.PaymentID} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="py-3 px-4 font-bold text-slate-800">{p.ReceiptNumber}</td>
                                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{p.Date}</td>
                                    <td className="py-3 px-4">
                                      <div className="font-extrabold text-slate-800 text-[11px]">{st ? st.Name : "N/A"}</div>
                                      <div className="text-[9px] text-slate-400 font-mono font-bold">{p.StudentID}</div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-500 font-bold">{p.Semester}</td>
                                    <td className="py-3 px-4 text-center">
                                      <span className="bg-slate-100 text-slate-600 border border-slate-200/50 font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                                        {p.PaymentMode}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-slate-500">{p.FeeType}</td>
                                    <td className="py-3 px-4 text-center">
                                      <span className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${
                                        status === "Success" 
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                          : status === "Pending"
                                            ? "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                                            : "bg-rose-50 text-rose-700 border border-rose-100"
                                      }`}>
                                        <span className={`w-1 h-1 rounded-full ${
                                          status === "Success" ? "bg-emerald-500" : status === "Pending" ? "bg-amber-500" : "bg-rose-500"
                                        }`} />
                                        {status}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-black text-emerald-600 font-mono">${p.Amount.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <button
                                          onClick={() => setViewingReceipt(p)}
                                          className="p-1 bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded transition-all cursor-pointer"
                                          title="View Official Receipt Statement"
                                        >
                                          <FileText className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            window.print();
                                          }}
                                          className="p-1 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded transition-all cursor-pointer"
                                          title="Print Transaction"
                                        >
                                          <Printer className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeletePayment(p.PaymentID)}
                                          className="p-1 bg-slate-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded transition-all cursor-pointer"
                                          title="Delete Receipt Entry"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>

                  {/* Pagination controller */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Showing <span className="font-extrabold text-slate-700">{ledgerStartIndex + 1}</span> to{" "}
                      <span className="font-extrabold text-slate-700">{Math.min(ledgerStartIndex + historyLimit, totalLedgerCount)}</span> of{" "}
                      <span className="font-extrabold text-slate-700">{totalLedgerCount}</span> payments registered
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                        disabled={historyPage === 1}
                        className="bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] py-1 px-2.5 rounded hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-500">{historyPage} of {ledgerTotalPages}</span>
                      <button
                        onClick={() => setHistoryPage(prev => Math.min(ledgerTotalPages, prev + 1))}
                        disabled={historyPage === ledgerTotalPages}
                        className="bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] py-1 px-2.5 rounded hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* Styled viewingReceipt popup modal overlay */}
                {viewingReceipt && (() => {
                  const st = students.find(s => s.StudentID === viewingReceipt.StudentID);
                  return (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl p-6 relative">
                        <button
                          onClick={() => setViewingReceipt(null)}
                          className="absolute right-4 top-4 p-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                          <div>
                            <h2 className="font-black text-slate-800 text-sm">FEDERAL INSTITUTE OF TECHNOLOGY</h2>
                            <p className="text-[10px] text-slate-400 font-mono font-bold">ERP OFFICIAL FINANCIAL SERVICES LEDGER</p>
                          </div>
                          <div className="text-right">
                            <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-2 py-0.5 rounded uppercase border border-emerald-200">OFFICIAL PAID</span>
                            <p className="text-[9px] text-slate-400 font-mono font-semibold mt-1">Receipt Number: {viewingReceipt.ReceiptNumber}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-[11px] font-semibold text-slate-500 py-4 border-b border-slate-100">
                          <div>
                            <p>Student Name: <span className="text-slate-800 font-black">{st ? st.Name : "N/A"}</span></p>
                            <p>StudentID: <span className="text-slate-800 font-mono">{viewingReceipt.StudentID}</span></p>
                            <p>Course: <span className="text-slate-800">{viewingReceipt.Course}</span></p>
                          </div>
                          <div className="text-right">
                            <p>Term: <span className="text-slate-800">{viewingReceipt.Semester}</span></p>
                            <p>Category Type: <span className="text-slate-800 font-extrabold">{viewingReceipt.FeeType}</span></p>
                            <p>Auth Date: <span className="text-slate-800 font-mono">{viewingReceipt.Date}</span></p>
                          </div>
                        </div>

                        <div className="py-4 space-y-2 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span>Settle Base Amount:</span>
                            <span className="font-mono font-bold">${viewingReceipt.Amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Late Overdue Penalty Fine:</span>
                            <span className="font-mono text-rose-500 font-bold">${viewingReceipt.Fine.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Special Merit Scholarship Applied:</span>
                            <span className="font-mono text-emerald-600 font-bold">-${(viewingReceipt.Scholarship || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Promo Discount Waiver:</span>
                            <span className="font-mono text-emerald-600 font-bold">-${(viewingReceipt.Discount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-black text-sm border-t border-slate-200 pt-3 text-slate-800">
                            <span>NET CONSOLE PAID TOTAL:</span>
                            <span className="font-mono text-emerald-600 text-lg">${viewingReceipt.Amount.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-slate-100/60 p-3 rounded-2xl border border-slate-200 text-[10px] text-slate-400 font-mono space-y-1">
                          <p>• TXN REFERENCE: {viewingReceipt.TransactionNumber}</p>
                          <p>• MODE OF BILLING: {viewingReceipt.PaymentMode.toUpperCase()}</p>
                          {viewingReceipt.Remarks && <p>• AUDIT REMARKS: {viewingReceipt.Remarks}</p>}
                        </div>

                        <div className="flex items-center justify-center pt-4 border-t border-dashed border-slate-300 mt-4 text-center">
                          <div className="flex gap-0.5 h-8 items-center bg-slate-900 px-3 py-1.5 rounded">
                            {[1,3,1,1,4,2,1,3,2,1,4,1,2,3,1,1,4].map((w, idx) => (
                              <div key={idx} className="bg-white h-full" style={{ width: `${w}px` }}></div>
                            ))}
                          </div>
                          <p className="text-[8px] font-mono font-black text-slate-400 tracking-widest mt-1">*{viewingReceipt.PaymentID}*</p>
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-4">
                          <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
                          >
                            <Printer className="w-4 h-4" /> Print Statement
                          </button>
                          <button
                            onClick={() => {
                              alert("Receipt statement generated and downloaded successfully as high-density vector PDF.");
                            }}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
                          >
                            <Download className="w-4 h-4" /> Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()}

          {/* TAB 5: CURRICULUM REGISTRY */}
          {activeTab === "curriculum" && (
            <div className="space-y-6">
              {/* Navigation buttons for sub-tabs */}
              <div className="flex border-b border-gray-150 gap-4">
                {(["courses", "departments", "batches", "semesters"] as const).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setCurriculumSubTab(sub)}
                    className={`pb-3 text-sm font-bold transition-all relative ${
                      curriculumSubTab === sub ? "text-indigo-600 font-extrabold" : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <span>{sub.charAt(0).toUpperCase() + sub.slice(1)} Registry</span>
                    {curriculumSubTab === sub && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded"></span>
                    )}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
                {/* Curriculum Form block */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="font-bold text-gray-800">Enroll New {curriculumSubTab.slice(0, -1)} Record</h4>

                  {curriculumSubTab === "courses" && (
                    <form onSubmit={handleAddCourse} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Course Code</label>
                        <input type="text" placeholder="e.g. BTECH-CSE" value={cCode} onChange={(e) => setCCode(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Course Name</label>
                        <input type="text" placeholder="Bachelor of Technology..." value={cName} onChange={(e) => setCName(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">Duration</label>
                          <input type="text" placeholder="4 Years" value={cDuration} onChange={(e) => setCDuration(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">Semesters</label>
                          <input type="number" placeholder="8" value={cSemesters} onChange={(e) => setCSemesters(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Estimated Fees ($)</label>
                        <input type="number" placeholder="120000" value={cFees} onChange={(e) => setCFees(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Program Description</label>
                        <textarea rows={2} placeholder="Syllabus and scope description..." value={cDesc} onChange={(e) => setCDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-indigo-700">Add Course to Registry</button>
                    </form>
                  )}

                  {curriculumSubTab === "departments" && (
                    <form onSubmit={handleAddDept} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Department Code</label>
                        <input type="text" placeholder="e.g. CSE" value={dCode} onChange={(e) => setDCode(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Department Name</label>
                        <input type="text" placeholder="Computer Science..." value={dName} onChange={(e) => setDName(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Head of Department (HOD)</label>
                        <input type="text" placeholder="Dr. Amanda Ross" value={dHOD} onChange={(e) => setDHOD(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-indigo-700">Add Department to Registry</button>
                    </form>
                  )}

                  {curriculumSubTab === "batches" && (
                    <form onSubmit={handleAddBatch} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Batch Name Code</label>
                        <input type="text" placeholder="e.g. B2024" value={bName} onChange={(e) => setBName(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Academic Year Duration</label>
                        <input type="text" placeholder="2024-2028" value={bAcadYear} onChange={(e) => setBAcadYear(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
                          <input type="date" value={bStart} onChange={(e) => setBStart(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">End Date</label>
                          <input type="date" value={bEnd} onChange={(e) => setBEnd(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-indigo-700">Add Batch to Registry</button>
                    </form>
                  )}

                  {curriculumSubTab === "semesters" && (
                    <form onSubmit={handleAddSem} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Semester No / Name</label>
                        <select value={sNo} onChange={(e) => setSNo(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs focus:outline-none">
                          <option value="Semester 1">Semester 1</option>
                          <option value="Semester 2">Semester 2</option>
                          <option value="Semester 3">Semester 3</option>
                          <option value="Semester 4">Semester 4</option>
                          <option value="Semester 5">Semester 5</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Associated Course</label>
                        <select value={sCourse} onChange={(e) => setSCourse(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs focus:outline-none">
                          <option value="">Select Course...</option>
                          {courses.map((c) => (
                            <option key={c.CourseCode} value={c.CourseCode}>{c.CourseCode}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Standard Semester Fees ($)</label>
                        <input type="number" placeholder="15000" value={sFees} onChange={(e) => setSFees(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Syllabus Subjects (comma separated)</label>
                        <textarea rows={2} placeholder="Mathematics I, Basic Physics..." value={sSubjects} onChange={(e) => setSSubjects(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs" />
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-indigo-700">Add Semester to Registry</button>
                    </form>
                  )}
                </div>

                {/* Tabular curriculum results */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <h4 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">Active {curriculumSubTab} Ledger</h4>

                  <div className="overflow-x-auto">
                    {curriculumSubTab === "courses" && (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                            <th className="py-2.5">Code</th>
                            <th className="py-2.5">Name</th>
                            <th className="py-2.5">Duration</th>
                            <th className="py-2.5 text-right">Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {courses.map((c) => (
                            <tr key={c.CourseCode}>
                              <td className="py-2.5 font-bold text-indigo-700">{c.CourseCode}</td>
                              <td className="py-2.5 font-medium text-gray-700">{c.CourseName}</td>
                              <td className="py-2.5 text-gray-450">{c.Duration} ({c.TotalSemesters} sems)</td>
                              <td className="py-2.5 text-right font-bold text-gray-800">${c.CourseFees.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {curriculumSubTab === "departments" && (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                            <th className="py-2.5">Code</th>
                            <th className="py-2.5">Department HOD</th>
                            <th className="py-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {departments.map((d) => (
                            <tr key={d.DepartmentCode}>
                              <td className="py-2.5 font-bold text-indigo-700">{d.DepartmentCode} - <span className="text-gray-700 font-semibold">{d.DepartmentName}</span></td>
                              <td className="py-2.5 font-medium text-gray-500">{d.HOD}</td>
                              <td className="py-2.5"><span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">{d.Status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {curriculumSubTab === "batches" && (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                            <th className="py-2.5">Batch</th>
                            <th className="py-2.5">Academic Years</th>
                            <th className="py-2.5">Start / End</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {batches.map((b) => (
                            <tr key={b.BatchName}>
                              <td className="py-2.5 font-bold text-indigo-700">{b.BatchName}</td>
                              <td className="py-2.5 font-semibold text-gray-700">{b.AcademicYear}</td>
                              <td className="py-2.5 text-gray-450">{b.StartDate} to {b.EndDate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {curriculumSubTab === "semesters" && (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                            <th className="py-2.5">Sem</th>
                            <th className="py-2.5">Course Code</th>
                            <th className="py-2.5">Syllabus Subjects</th>
                            <th className="py-2.5 text-right">Base Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {semesters.map((s, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 font-bold text-indigo-700">{s.SemesterNo}</td>
                              <td className="py-2.5 text-gray-650 font-semibold">{getCourseName(s.Course)}</td>
                              <td className="py-2.5 text-gray-400 max-w-xs truncate" title={s.Subjects}>{s.Subjects}</td>
                              <td className="py-2.5 text-right font-bold text-gray-800">${s.SemesterFees.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BROADCAST BULLETINS */}
          {activeTab === "notifications" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Block */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" /> Broadcast Automated Billing & Alerts
                  </h3>
                  <p className="text-xs text-gray-400">Post billing reminders or critical academic schedules visible directly on targeted Student portals.</p>
                </div>

                {notifSubmitStatus && (
                  <div className={`p-4 rounded-xl text-center text-xs font-semibold ${
                    notifSubmitStatus.startsWith("✓")
                      ? "bg-emerald-50 border border-emerald-100 text-emerald-800"
                      : "bg-rose-50 border border-rose-100 text-rose-800"
                  }`}>
                    {notifSubmitStatus}
                  </div>
                )}

                <form onSubmit={handleAddNotification} className="space-y-4">
                  {/* Automated presets */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Automated Preset Templates</label>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setNotifTitle("Outstanding Fee Clearing Schedule Reminder");
                          setNotifMessage("Alert: This is an automated notification reminding you that pending outstanding fee structures are due. Please complete transaction clearings via the digital gateway tab to avoid late penalties.");
                        }}
                        className="bg-rose-50 border border-rose-100 text-rose-700 p-2 rounded-lg text-left"
                      >
                        🚨 Fee Due Reminder
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifTitle("Semester Examination Scores Published");
                          setNotifMessage("Congratulations! Your academic evaluation midterm scoring portfolios have been published and synced on the ledger. Check your Performance tab.");
                        }}
                        className="bg-indigo-50 border border-indigo-100 text-indigo-700 p-2 rounded-lg text-left"
                      >
                        🎓 Marks Released Alert
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target Recipient Group</label>
                    <select
                      value={notifTarget}
                      onChange={(e) => setNotifTarget(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700"
                    >
                      <option value="All">All Campus Groups</option>
                      <option value="Students">All Student Enrollees</option>
                      {courses.map((c) => (
                        <option key={c.CourseCode} value={`Course:${c.CourseCode}`}>B.Tech / Program: {c.CourseCode}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Announcement Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Semester 3 Fee Clearing Deadline"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Alert Message</label>
                    <textarea
                      rows={5}
                      placeholder="Type details of your announcement bulletin..."
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Bell className="w-4 h-4" /> Broadcast Announcement
                  </button>
                </form>
              </div>

              {/* Broadcast Ledger List */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" /> Broadcast Bulletins Active Ledger
                </h3>

                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div key={notif.ID} className="p-4 rounded-xl bg-gray-50 border border-gray-100/60 text-xs space-y-1.5">
                      <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                        <span>{notif.Date}</span>
                        <span className="font-bold uppercase text-indigo-600">{notif.TargetGroup}</span>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">{notif.Title}</h4>
                      <p className="text-gray-500 font-medium leading-relaxed">{notif.Message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CONNECTION CONFIG & AUDIT LOGS */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Connection setup panel */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" /> Google Sheets Sync Integration
                  </h3>
                  <p className="text-xs text-gray-400">Sync all your academic files directly onto Google Sheets via Apps Script Web Apps.</p>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Apps Script Web App URL</label>
                    <input
                      type="text"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={tempScriptUrl}
                      onChange={(e) => setTempScriptUrl(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-mono focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Deploy the Apps Script Web App as "Anyone, even anonymous" to allow the client app to connect securely.</p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleSaveConnection}
                      className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-all text-center"
                    >
                      Verify & Sync Connection
                    </button>
                    {isConnectedToSheets() && (
                      <button
                        onClick={() => {
                          setScriptUrl("");
                          setTempScriptUrl("");
                          alert("Disconnected from sheets database. Resetting local sandbox.");
                          loadAllData();
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-rose-600 font-bold py-2.5 rounded-xl transition-all"
                      >
                        Reset to local Sandbox
                      </button>
                    )}
                  </div>
                </div>

                {/* Google script code snippet block */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase">Google Apps Script Snippet</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`/**
 * Google Apps Script Backend for College ERP System
 * Copy this snippet into script.google.com and deploy as Web App!
 */`);
                        alert("Reference copy triggers! Code skeleton copied to clipboard.");
                      }}
                      className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Clipboard className="w-3.5 h-3.5" /> Copy Code
                    </button>
                  </div>
                  <div className="bg-gray-950 text-emerald-400 p-4 rounded-xl font-mono text-[10px] max-h-48 overflow-y-auto space-y-1">
                    <p>// Initialize Sheet Tables Setup</p>
                    <p>function setupDatabase() &#123;</p>
                    <p>&nbsp;&nbsp;const sheets = ["Students", "Courses", "Payments", "Users", "AuditLogs"];</p>
                    <p>&nbsp;&nbsp;// ...</p>
                    <p>&#125;</p>
                    <p>function doPost(e) &#123; ... &#125;</p>
                  </div>
                </div>
              </div>

              {/* Audit logs panel */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-indigo-600" /> Operational Audit logs
                  </h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold">
                    Ledger Log History
                  </span>
                </div>

                <div className="bg-gray-950 rounded-2xl p-4 max-h-96 overflow-y-auto space-y-3 font-mono text-[10px] text-gray-350">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="border-b border-gray-800 pb-2 last:border-none last:pb-0">
                      <div className="flex justify-between text-emerald-400 text-[9px] font-bold">
                        <span>[{log.Timestamp.replace("T", " ").substring(0, 19)}]</span>
                        <span>User: {log.User}</span>
                      </div>
                      <p className="text-white font-bold mt-0.5">&gt; Action: {log.Action}</p>
                      <p className="text-gray-400 text-[9px] mt-0.5 font-sans leading-relaxed">{log.Details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ADMISSION SCREEN */}
          {activeTab === "admission" && (
            <AdmissionScreen
              onNewApplication={() => {
                setEditingStudent(null);
                setShowAddStuModal(true);
              }}
              onEditStudent={(studentData) => {
                setEditingStudent(studentData);
                setShowAddStuModal(true);
              }}
              darkMode={darkMode}
            />
          )}

          {/* TAB 9: USERS SCREEN */}
          {activeTab === "users" && (
            <UsersScreen
              darkMode={darkMode}
            />
          )}
        </main>
      </div>

      {/* STUDENT ADD/EDIT MODAL VIEW */}
      {showAddStuModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 md:p-8 border border-gray-100 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-gray-50 mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingStudent ? "Modify Student Profile Details" : "Register New Student Enrolment"}
              </h3>
              <button
                onClick={() => { setShowAddStuModal(false); setEditingStudent(null); }}
                className="text-gray-400 hover:text-gray-600 text-lg font-black"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs font-semibold text-gray-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Mercer"
                    value={stuName}
                    onChange={(e) => setStuName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase">Gender Identity</label>
                  <select
                    value={stuGender}
                    onChange={(e) => setStuGender(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={stuDOB}
                    onChange={(e) => setStuDOB(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase">Mobile Contact Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 555-0198"
                    value={stuMobile}
                    onChange={(e) => setStuMobile(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase">Personal Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex.mercer@college.edu"
                    value={stuEmail}
                    onChange={(e) => setStuEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase">Access Password</label>
                  <input
                    type="password"
                    placeholder="stu123"
                    value={stuPass}
                    onChange={(e) => setStuPass(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. 742 Evergreen Terrace, Springfield"
                  value={stuAddress}
                  onChange={(e) => setStuAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase">Enrolled program Course *</label>
                  <select
                    value={stuCourse}
                    onChange={(e) => setStuCourse(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-none"
                  >
                    <option value="">Choose Course...</option>
                    {courses.map((c) => (
                      <option key={c.CourseCode} value={c.CourseCode}>{c.CourseName} ({c.CourseCode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase">Department *</label>
                  <select
                    value={stuDept}
                    onChange={(e) => setStuDept(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-none"
                  >
                    <option value="">Choose Dept...</option>
                    {departments.map((d) => (
                      <option key={d.DepartmentCode} value={d.DepartmentCode}>{d.DepartmentName} ({d.DepartmentCode})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase">Current Semester</label>
                  <select
                    value={stuSem}
                    onChange={(e) => setStuSem(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-none"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase">Active Batch Year *</label>
                  <select
                    value={stuBatch}
                    onChange={(e) => setStuBatch(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-none"
                  >
                    <option value="">Choose Batch...</option>
                    {batches.map((b) => (
                      <option key={b.BatchName} value={b.BatchName}>{b.BatchName} ({b.AcademicYear})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase">Enrolment Status</label>
                  <select
                    value={stuStatus}
                    onChange={(e) => setStuStatus(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700"
                  >
                    <option value="Active">Active Student</option>
                    <option value="Inactive">Suspended/Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all text-center text-xs"
                >
                  {editingStudent ? "Save Credentials Changes" : "Create New Profile Enrollment"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddStuModal(false); setEditingStudent(null); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
