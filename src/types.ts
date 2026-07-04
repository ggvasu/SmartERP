export interface Student {
  StudentID: string;
  RegNo: string;
  Name: string;
  Gender: string;
  DOB: string;
  Mobile: string;
  Email: string;
  Address: string;
  Course: string;
  Department: string;
  Semester: string;
  Batch: string;
  JoiningDate: string;
  Status: string;
  Password?: string;
}

export interface Course {
  CourseCode: string;
  CourseName: string;
  Duration: string; // e.g. "3 Years" or "4 Years"
  TotalSemesters: number;
  CourseFees: number;
  Description: string;
  Status: string; // "Active" | "Inactive"
}

export interface Department {
  DepartmentCode: string;
  DepartmentName: string;
  HOD: string;
  Status: string;
}

export interface Batch {
  BatchName: string; // e.g. "2024-2028"
  AcademicYear: string; // e.g. "2024-25"
  StartDate: string;
  EndDate: string;
  Status: string;
}

export interface Semester {
  SemesterNo: string; // e.g. "Semester 1", "Semester 2", or numeric "1", "2"
  Course: string; // Course name or course code
  SemesterFees: number;
  Subjects: string; // comma-separated subjects
  Status: string;
}

export interface FeeAssignment {
  StudentID: string;
  Course: string;
  Semester: string;
  AdmissionFee: number;
  TuitionFee: number;
  ExamFee: number;
  LibraryFee: number;
  HostelFee: number;
  TransportFee: number;
  Fine: number;
  Scholarship: number;
  Discount: number;
  TotalAmount: number;
  DueDate: string;
  Remarks: string;
}

export interface Payment {
  PaymentID: string;
  ReceiptNumber: string;
  StudentID: string;
  Course: string;
  Semester: string;
  FeeType: string; // e.g. "TuitionFee" or "TotalFees"
  Amount: number;
  Fine: number;
  Discount: number;
  Balance: number;
  PaymentMode: string; // "Cash" | "Card" | "NetBanking" | "UPI"
  TransactionNumber: string;
  Date: string;
  Remarks: string;
}

export interface User {
  Username: string;
  Password?: string;
  Role: string; // "Admin" | "Student"
  Permissions: string; // e.g. "Add,Edit,Delete,View"
}

export interface AuditLog {
  Timestamp: string;
  User: string;
  Action: string;
  Details: string;
}

export interface Notification {
  ID: string;
  Title: string;
  Message: string;
  Date: string;
  TargetGroup: string; // "All" | "Students" | "Course:..." | "Semester:..."
}

// Additional analytics types for attendance and academic performance
export interface AttendanceRecord {
  StudentID: string;
  Date: string;
  Status: "Present" | "Absent" | "Late";
  Subject: string;
}

export interface PerformanceRecord {
  StudentID: string;
  Subject: string;
  Marks: number; // Percentage or standard score (0-100)
  Grade: string; // e.g. "A+", "A", "B", etc.
  ExamType: "Midterm" | "Endterm" | "Assignment";
  Semester: string;
}
