import {
  Student,
  Course,
  Department,
  Batch,
  Semester,
  FeeAssignment,
  Payment,
  User,
  Notification,
  AttendanceRecord,
  PerformanceRecord,
  AuditLog
} from "../types";
import {
  MOCK_STUDENTS,
  MOCK_COURSES,
  MOCK_DEPARTMENTS,
  MOCK_BATCHES,
  MOCK_SEMESTERS,
  MOCK_FEE_ASSIGNMENTS,
  MOCK_PAYMENTS,
  MOCK_USERS,
  MOCK_NOTIFICATIONS,
  MOCK_ATTENDANCE,
  MOCK_PERFORMANCE
} from "./mockData";

// Local Storage Keys
const KEYS = {
  SCRIPT_URL: "college_erp_google_script_url",
  STUDENTS: "college_erp_students",
  COURSES: "college_erp_courses",
  DEPARTMENTS: "college_erp_departments",
  BATCHES: "college_erp_batches",
  SEMESTERS: "college_erp_semesters",
  FEE_ASSIGNMENTS: "college_erp_fee_assignments",
  PAYMENTS: "college_erp_payments",
  USERS: "college_erp_users",
  NOTIFICATIONS: "college_erp_notifications",
  AUDIT_LOGS: "college_erp_audit_logs",
  ATTENDANCE: "college_erp_attendance",
  PERFORMANCE: "college_erp_performance",
  CURRENT_USER: "college_erp_current_user"
};

// Initialize Local Storage with mock data if empty
const initLocalStorage = () => {
  // Always update to the latest Google Apps Script URL as requested
  localStorage.setItem(KEYS.SCRIPT_URL, "https://script.google.com/macros/s/AKfycbyxvJ02VKEpoXf6kKA65xnTQN1B_D8x4yhGwYo18y6tf51AI55FerLQH-yXheUesvxJ8Q/exec");

  const CURRENT_MOCK_VERSION = "v4_sheets_only";
  if (localStorage.getItem("college_erp_mock_version") !== CURRENT_MOCK_VERSION) {
    localStorage.removeItem(KEYS.STUDENTS);
    localStorage.removeItem(KEYS.COURSES);
    localStorage.removeItem(KEYS.DEPARTMENTS);
    localStorage.removeItem(KEYS.BATCHES);
    localStorage.removeItem(KEYS.SEMESTERS);
    localStorage.removeItem(KEYS.FEE_ASSIGNMENTS);
    localStorage.removeItem(KEYS.PAYMENTS);
    localStorage.removeItem(KEYS.ATTENDANCE);
    localStorage.removeItem(KEYS.PERFORMANCE);
    localStorage.setItem("college_erp_mock_version", CURRENT_MOCK_VERSION);
  }

  if (!localStorage.getItem(KEYS.STUDENTS)) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(MOCK_STUDENTS));
  }
  if (!localStorage.getItem(KEYS.COURSES)) {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(MOCK_COURSES));
  }
  if (!localStorage.getItem(KEYS.DEPARTMENTS)) {
    localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(MOCK_DEPARTMENTS));
  }
  if (!localStorage.getItem(KEYS.BATCHES)) {
    localStorage.setItem(KEYS.BATCHES, JSON.stringify(MOCK_BATCHES));
  }
  if (!localStorage.getItem(KEYS.SEMESTERS)) {
    localStorage.setItem(KEYS.SEMESTERS, JSON.stringify(MOCK_SEMESTERS));
  }
  if (!localStorage.getItem(KEYS.FEE_ASSIGNMENTS)) {
    localStorage.setItem(KEYS.FEE_ASSIGNMENTS, JSON.stringify(MOCK_FEE_ASSIGNMENTS));
  }
  if (!localStorage.getItem(KEYS.PAYMENTS)) {
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(MOCK_PAYMENTS));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(MOCK_NOTIFICATIONS));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(MOCK_ATTENDANCE));
  }
  if (!localStorage.getItem(KEYS.PERFORMANCE)) {
    localStorage.setItem(KEYS.PERFORMANCE, JSON.stringify(MOCK_PERFORMANCE));
  }
  if (!localStorage.getItem(KEYS.AUDIT_LOGS)) {
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify([
      {
        Timestamp: new Date().toISOString(),
        User: "System",
        Action: "Database Setup",
        Details: "Database successfully initialized in Sandbox Mode."
      }
    ]));
  }
};

initLocalStorage();

// Simple fetcher for Google Apps Script Web App
async function callGAS(action: string, params: any = {}): Promise<any> {
  const url = localStorage.getItem(KEYS.SCRIPT_URL);
  if (!url || url.trim() === "") {
    throw new Error("Google Apps Script URL is not configured. Falling back to Sandbox Local Storage.");
  }

  const currentUserStr = localStorage.getItem(KEYS.CURRENT_USER);
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const username = currentUser ? currentUser.Username : "System";

  const payload = {
    action,
    username,
    ...params
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8" // Important for avoiding CORS preflight checks in Apps Script
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error("Google Apps Script call failed:", err);
    throw new Error(err.message || "Failed to communicate with Google Sheets.");
  }
}

export const getScriptUrl = (): string => {
  return localStorage.getItem(KEYS.SCRIPT_URL) || "https://script.google.com/macros/s/AKfycbyxvJ02VKEpoXf6kKA65xnTQN1B_D8x4yhGwYo18y6tf51AI55FerLQH-yXheUesvxJ8Q/exec";
};

export const setScriptUrl = (url: string) => {
  if (url) {
    localStorage.setItem(KEYS.SCRIPT_URL, url);
  } else {
    localStorage.removeItem(KEYS.SCRIPT_URL);
  }
};

export const isConnectedToSheets = (): boolean => {
  const url = getScriptUrl();
  return url !== "" && url.startsWith("https://script.google.com");
};

// Log action to Audit Logs (either locally or on sheets)
export const logAudit = async (action: string, details: string) => {
  const userObj = localStorage.getItem(KEYS.CURRENT_USER);
  const user = userObj ? JSON.parse(userObj).Username : "Anonymous";
  const timestamp = new Date().toISOString();

  const newLog: AuditLog = { Timestamp: timestamp, User: user, Action: action, Details: details };

  // Local storage save
  const logs = JSON.parse(localStorage.getItem(KEYS.AUDIT_LOGS) || "[]");
  logs.unshift(newLog);
  localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 500))); // Cap at 500 records

  // Trigger Google Sheet call asynchronously if connected
  if (isConnectedToSheets()) {
    try {
      // The Apps Script doGet/doPost logs actions internally, but we can make a custom log action if needed.
    } catch (e) {
      console.warn("Could not log to sheets:", e);
    }
  }
};

// API Service exports
export const APIService = {
  // Authentication
  login: async (Username: string, Password: string, Role: "Admin" | "Student"): Promise<{ success: boolean; message: string; user?: any }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("login", { username: Username, password: Password, role: Role });
        if (res.success) {
          const user = { Username: res.username, Role: res.role, Permissions: res.permissions, StudentName: res.studentName };
          localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
          await logAudit("Login", `Logged in successfully via Google Sheets as ${Role}`);
          return { success: true, message: "Logged in via Google Sheets", user };
        } else {
          return { success: false, message: res.message || "Invalid credentials" };
        }
      } catch (err: any) {
        console.warn("GAS Login failed, trying local storage fallback", err);
      }
    }

    // Local Storage login fallback
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
    if (Role === "Admin") {
      const adminUser = users.find(u => u && u.Username && u.Username.toLowerCase() === (Username || "").toLowerCase() && u.Role === "Admin");
      if (adminUser && adminUser.Password === Password) {
        const user = { Username: adminUser.Username, Role: "Admin", Permissions: adminUser.Permissions || "Add,Edit,Delete,View" };
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
        await logAudit("Login", "Logged in successfully as Admin (Local Mode)");
        return { success: true, message: "Logged in successfully (Local Sandbox Mode)", user };
      }
    } else {
      const students: Student[] = JSON.parse(localStorage.getItem(KEYS.STUDENTS) || "[]");
      const student = students.find(s => {
        if (!s) return false;
        const sID = s.StudentID || "";
        const sEmail = s.Email || "";
        const uName = Username || "";
        return (sID.toLowerCase() === uName.toLowerCase() || sEmail.toLowerCase() === uName.toLowerCase()) && s.Password === Password;
      });
      if (student) {
        const user = { Username: student.StudentID, Role: "Student", Permissions: "View", StudentName: student.Name };
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
        await logAudit("Login", `Logged in successfully as Student ${student.StudentID} (Local Mode)`);
        return { success: true, message: "Logged in successfully (Local Sandbox Mode)", user };
      }
    }
    return { success: false, message: "Invalid credentials. Please try again." };
  },

  logout: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  getCurrentUser: () => {
    const user = localStorage.getItem(KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  // Students Module
  getStudents: async (): Promise<Student[]> => {
    if (isConnectedToSheets()) {
      try {
        const data = await callGAS("getStudents");
        if (Array.isArray(data)) {
          // Normalize spreadsheet headers (e.g. key names) to our camelCase/PascalCase if needed,
          // but our Apps Script returns objects matching spreadsheet columns exactly, which is perfect.
          localStorage.setItem(KEYS.STUDENTS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn("Failed to fetch students from Sheets, using local storage", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.STUDENTS) || "[]");
  },

  addStudent: async (student: Omit<Student, "StudentID" | "RegNo">): Promise<{ success: boolean; studentId?: string; regNo?: string; message: string }> => {
    const year = new Date().getFullYear();

    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("addStudent", student);
        if (res.success) {
          // Sync back local storage
          const students = await APIService.getStudents();
          await logAudit("Add Student", `Student ${res.studentId} (${student.Name}) added via Sheets`);
          return { success: true, studentId: res.studentId, regNo: res.regNo, message: res.message };
        }
      } catch (err: any) {
        console.warn("GAS addStudent failed, using local fallback", err);
      }
    }

    // Local Storage flow
    const students: Student[] = JSON.parse(localStorage.getItem(KEYS.STUDENTS) || "[]");
    const count = students.length + 1;
    const studentId = `STU${year}${String(count).padStart(3, "0")}`;
    const regNo = `REG${year}${Math.floor(1000 + Math.random() * 9000)}`;

    const newStudent: Student = {
      ...student,
      StudentID: studentId,
      RegNo: regNo,
      JoiningDate: student.JoiningDate || new Date().toISOString().split("T")[0],
      Status: student.Status || "Active",
      Password: student.Password || "stu123"
    };

    students.push(newStudent);
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));

    // Also create matching user in Users table
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
    users.push({
      Username: studentId,
      Password: student.Password || "stu123",
      Role: "Student",
      Permissions: "View"
    });
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));

    await logAudit("Add Student", `Student ${studentId} (${student.Name}) added in Sandbox Mode`);
    return { success: true, studentId, regNo, message: "Student added successfully (Local Sandbox Mode)" };
  },

  updateStudent: async (studentId: string, student: Partial<Student>): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("updateStudent", { studentId, ...student });
        if (res.success) {
          await APIService.getStudents(); // refresh local cache
          await logAudit("Update Student", `Updated student ${studentId} details via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS updateStudent failed, using local fallback", err);
      }
    }

    // Local Storage flow
    const students: Student[] = JSON.parse(localStorage.getItem(KEYS.STUDENTS) || "[]");
    const index = students.findIndex(s => s.StudentID === studentId);
    if (index !== -1) {
      students[index] = { ...students[index], ...student };
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
      await logAudit("Update Student", `Updated student ${studentId} details in Sandbox Mode`);
      return { success: true, message: "Student updated successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "Student not found" };
  },

  deleteStudent: async (studentId: string): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("deleteStudent", { studentId });
        if (res.success) {
          await APIService.getStudents();
          await logAudit("Delete Student", `Deleted student ID ${studentId} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS deleteStudent failed, using local fallback", err);
      }
    }

    const students: Student[] = JSON.parse(localStorage.getItem(KEYS.STUDENTS) || "[]");
    const filtered = students.filter(s => s.StudentID !== studentId);
    if (filtered.length < students.length) {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(filtered));
      await logAudit("Delete Student", `Deleted student ID ${studentId} in Sandbox Mode`);
      return { success: true, message: "Student deleted successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "Student not found" };
  },

  // Courses Module
  getCourses: async (): Promise<Course[]> => {
    if (isConnectedToSheets()) {
      try {
        const data = await callGAS("getCourses");
        if (Array.isArray(data)) {
          localStorage.setItem(KEYS.COURSES, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn("GAS getCourses failed, using local", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.COURSES) || "[]");
  },

  addCourse: async (course: Course): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("addCourse", {
          courseCode: course.CourseCode,
          courseName: course.CourseName,
          duration: course.Duration,
          totalSemesters: course.TotalSemesters,
          courseFees: course.CourseFees,
          description: course.Description,
          status: course.Status
        });
        if (res.success) {
          await APIService.getCourses();
          await logAudit("Add Course", `Added course ${course.CourseCode} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS addCourse failed, using local fallback", err);
      }
    }

    const courses: Course[] = JSON.parse(localStorage.getItem(KEYS.COURSES) || "[]");
    courses.push(course);
    localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
    await logAudit("Add Course", `Added course ${course.CourseCode} (${course.CourseName}) in Sandbox Mode`);
    return { success: true, message: "Course added successfully (Local Sandbox Mode)" };
  },

  updateCourse: async (courseCode: string, course: Partial<Course>): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("updateCourse", {
          courseCode,
          courseName: course.CourseName,
          duration: course.Duration,
          totalSemesters: course.TotalSemesters,
          courseFees: course.CourseFees,
          description: course.Description,
          status: course.Status
        });
        if (res.success) {
          await APIService.getCourses();
          await logAudit("Update Course", `Updated course ${courseCode} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS updateCourse failed, using local fallback", err);
      }
    }

    const courses: Course[] = JSON.parse(localStorage.getItem(KEYS.COURSES) || "[]");
    const idx = courses.findIndex(c => c.CourseCode === courseCode);
    if (idx !== -1) {
      courses[idx] = { ...courses[idx], ...course };
      localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
      await logAudit("Update Course", `Updated course ${courseCode} in Sandbox Mode`);
      return { success: true, message: "Course updated successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "Course not found" };
  },

  deleteCourse: async (courseCode: string): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("deleteCourse", { courseCode });
        if (res.success) {
          await APIService.getCourses();
          await logAudit("Delete Course", `Deleted course ${courseCode} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS deleteCourse failed, using local fallback", err);
      }
    }

    const courses: Course[] = JSON.parse(localStorage.getItem(KEYS.COURSES) || "[]");
    const filtered = courses.filter(c => c.CourseCode !== courseCode);
    if (filtered.length < courses.length) {
      localStorage.setItem(KEYS.COURSES, JSON.stringify(filtered));
      await logAudit("Delete Course", `Deleted course ${courseCode} in Sandbox Mode`);
      return { success: true, message: "Course deleted successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "Course not found" };
  },

  // Departments Module
  getDepartments: async (): Promise<Department[]> => {
    if (isConnectedToSheets()) {
      try {
        const data = await callGAS("getDepartments");
        if (Array.isArray(data)) {
          localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn("GAS getDepartments failed, using local", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.DEPARTMENTS) || "[]");
  },

  addDepartment: async (dept: Department): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("addDepartment", {
          departmentCode: dept.DepartmentCode,
          departmentName: dept.DepartmentName,
          hod: dept.HOD,
          status: dept.Status
        });
        if (res.success) {
          await APIService.getDepartments();
          await logAudit("Add Department", `Added department ${dept.DepartmentCode} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS addDepartment failed, using local fallback", err);
      }
    }

    const depts: Department[] = JSON.parse(localStorage.getItem(KEYS.DEPARTMENTS) || "[]");
    depts.push(dept);
    localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(depts));
    await logAudit("Add Department", `Added department ${dept.DepartmentCode} in Sandbox Mode`);
    return { success: true, message: "Department added successfully (Local Sandbox Mode)" };
  },

  updateDepartment: async (departmentCode: string, dept: Partial<Department>): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("updateDepartment", {
          departmentCode,
          departmentName: dept.DepartmentName,
          hod: dept.HOD,
          status: dept.Status
        });
        if (res.success) {
          await APIService.getDepartments();
          await logAudit("Update Department", `Updated department ${departmentCode} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS updateDepartment failed, using local fallback", err);
      }
    }

    const depts: Department[] = JSON.parse(localStorage.getItem(KEYS.DEPARTMENTS) || "[]");
    const idx = depts.findIndex(d => d.DepartmentCode === departmentCode);
    if (idx !== -1) {
      depts[idx] = { ...depts[idx], ...dept };
      localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(depts));
      await logAudit("Update Department", `Updated department ${departmentCode} in Sandbox Mode`);
      return { success: true, message: "Department updated successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "Department not found" };
  },

  deleteDepartment: async (departmentCode: string): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("deleteDepartment", { departmentCode });
        if (res.success) {
          await APIService.getDepartments();
          await logAudit("Delete Department", `Deleted department ${departmentCode} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS deleteDepartment failed, using local fallback", err);
      }
    }

    const depts: Department[] = JSON.parse(localStorage.getItem(KEYS.DEPARTMENTS) || "[]");
    const filtered = depts.filter(d => d.DepartmentCode !== departmentCode);
    if (filtered.length < depts.length) {
      localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(filtered));
      await logAudit("Delete Department", `Deleted department ${departmentCode} in Sandbox Mode`);
      return { success: true, message: "Department deleted successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "Department not found" };
  },

  // Batches Module
  getBatches: async (): Promise<Batch[]> => {
    if (isConnectedToSheets()) {
      try {
        const data = await callGAS("getBatches");
        if (Array.isArray(data)) {
          localStorage.setItem(KEYS.BATCHES, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn("GAS getBatches failed, using local", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.BATCHES) || "[]");
  },

  addBatch: async (batch: Batch): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("addBatch", {
          batchName: batch.BatchName,
          academicYear: batch.AcademicYear,
          startDate: batch.StartDate,
          endDate: batch.EndDate,
          status: batch.Status
        });
        if (res.success) {
          await APIService.getBatches();
          await logAudit("Add Batch", `Added batch ${batch.BatchName} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS addBatch failed, using local fallback", err);
      }
    }

    const batches: Batch[] = JSON.parse(localStorage.getItem(KEYS.BATCHES) || "[]");
    batches.push(batch);
    localStorage.setItem(KEYS.BATCHES, JSON.stringify(batches));
    await logAudit("Add Batch", `Added batch ${batch.BatchName} in Sandbox Mode`);
    return { success: true, message: "Batch added successfully (Local Sandbox Mode)" };
  },

  updateBatch: async (batchName: string, batch: Partial<Batch>): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("updateBatch", {
          batchName,
          academicYear: batch.AcademicYear,
          startDate: batch.StartDate,
          endDate: batch.EndDate,
          status: batch.Status
        });
        if (res.success) {
          await APIService.getBatches();
          await logAudit("Update Batch", `Updated batch ${batchName} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS updateBatch failed, using local fallback", err);
      }
    }

    const batches: Batch[] = JSON.parse(localStorage.getItem(KEYS.BATCHES) || "[]");
    const idx = batches.findIndex(b => b.BatchName === batchName);
    if (idx !== -1) {
      batches[idx] = { ...batches[idx], ...batch };
      localStorage.setItem(KEYS.BATCHES, JSON.stringify(batches));
      await logAudit("Update Batch", `Updated batch ${batchName} in Sandbox Mode`);
      return { success: true, message: "Batch updated successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "Batch not found" };
  },

  deleteBatch: async (batchName: string): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("deleteBatch", { batchName });
        if (res.success) {
          await APIService.getBatches();
          await logAudit("Delete Batch", `Deleted batch ${batchName} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS deleteBatch failed, using local fallback", err);
      }
    }

    const batches: Batch[] = JSON.parse(localStorage.getItem(KEYS.BATCHES) || "[]");
    const filtered = batches.filter(b => b.BatchName !== batchName);
    if (filtered.length < batches.length) {
      localStorage.setItem(KEYS.BATCHES, JSON.stringify(filtered));
      await logAudit("Delete Batch", `Deleted batch ${batchName} in Sandbox Mode`);
      return { success: true, message: "Batch deleted successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "Batch not found" };
  },

  // Semesters Module
  getSemesters: async (): Promise<Semester[]> => {
    if (isConnectedToSheets()) {
      try {
        const data = await callGAS("getSemesters");
        if (Array.isArray(data)) {
          localStorage.setItem(KEYS.SEMESTERS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn("GAS getSemesters failed, using local", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.SEMESTERS) || "[]");
  },

  addSemester: async (sem: Semester): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("addSemester", {
          semesterNo: sem.SemesterNo,
          course: sem.Course,
          semesterFees: sem.SemesterFees,
          subjects: sem.Subjects,
          status: sem.Status
        });
        if (res.success) {
          await APIService.getSemesters();
          await logAudit("Add Semester", `Added semester ${sem.SemesterNo} for ${sem.Course} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS addSemester failed, using local fallback", err);
      }
    }

    const sems: Semester[] = JSON.parse(localStorage.getItem(KEYS.SEMESTERS) || "[]");
    sems.push(sem);
    localStorage.setItem(KEYS.SEMESTERS, JSON.stringify(sems));
    await logAudit("Add Semester", `Added semester ${sem.SemesterNo} for ${sem.Course} in Sandbox Mode`);
    return { success: true, message: "Semester added successfully (Local Sandbox Mode)" };
  },

  updateSemester: async (semesterNo: string, sem: Partial<Semester>): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("updateSemester", {
          semesterNo,
          course: sem.Course,
          semesterFees: sem.SemesterFees,
          subjects: sem.Subjects,
          status: sem.Status
        });
        if (res.success) {
          await APIService.getSemesters();
          await logAudit("Update Semester", `Updated semester ${semesterNo} details via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS updateSemester failed, using local fallback", err);
      }
    }

    const sems: Semester[] = JSON.parse(localStorage.getItem(KEYS.SEMESTERS) || "[]");
    // Find matching record by SemesterNo & Course if composite, but we check semesterNo
    const idx = sems.findIndex(s => s.SemesterNo === semesterNo && s.Course === sem.Course);
    const fallbackIdx = sems.findIndex(s => s.SemesterNo === semesterNo);
    const activeIdx = idx !== -1 ? idx : fallbackIdx;

    if (activeIdx !== -1) {
      sems[activeIdx] = { ...sems[activeIdx], ...sem };
      localStorage.setItem(KEYS.SEMESTERS, JSON.stringify(sems));
      await logAudit("Update Semester", `Updated semester ${semesterNo} details in Sandbox Mode`);
      return { success: true, message: "Semester updated successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "Semester not found" };
  },

  deleteSemester: async (semesterNo: string): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("deleteSemester", { semesterNo });
        if (res.success) {
          await APIService.getSemesters();
          await logAudit("Delete Semester", `Deleted semester ${semesterNo} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS deleteSemester failed, using local fallback", err);
      }
    }

    const sems: Semester[] = JSON.parse(localStorage.getItem(KEYS.SEMESTERS) || "[]");
    const filtered = sems.filter(s => s.SemesterNo !== semesterNo);
    if (filtered.length < sems.length) {
      localStorage.setItem(KEYS.SEMESTERS, JSON.stringify(filtered));
      await logAudit("Delete Semester", `Deleted semester ${semesterNo} in Sandbox Mode`);
      return { success: true, message: "Semester deleted successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "Semester not found" };
  },

  // Fee Assignments Module
  getAssignedFees: async (): Promise<FeeAssignment[]> => {
    if (isConnectedToSheets()) {
      try {
        const data = await callGAS("getAssignedFees");
        if (Array.isArray(data)) {
          localStorage.setItem(KEYS.FEE_ASSIGNMENTS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn("GAS getAssignedFees failed, using local", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.FEE_ASSIGNMENTS) || "[]");
  },

  assignFees: async (p: {
    studentId?: string;
    course: string;
    semester: string;
    batch?: string;
    admissionFee: number;
    tuitionFee: number;
    examFee: number;
    libraryFee: number;
    hostelFee: number;
    transportFee: number;
    fine?: number;
    scholarship?: number;
    discount?: number;
    totalAmount: number;
    dueDate: string;
    remarks?: string;
    bulk?: boolean;
  }): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("assignFees", p);
        if (res.success) {
          await APIService.getAssignedFees();
          await logAudit("Assign Fees", `Assigned fees via Sheets: ${p.bulk ? "Bulk" : p.studentId}`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS assignFees failed, using local fallback", err);
      }
    }

    // Local Storage Flow
    const feeAssignments: FeeAssignment[] = JSON.parse(localStorage.getItem(KEYS.FEE_ASSIGNMENTS) || "[]");

    if (p.bulk) {
      // Find all students matching criteria
      const students: Student[] = JSON.parse(localStorage.getItem(KEYS.STUDENTS) || "[]");
      let assignedCount = 0;

      students.forEach(s => {
        const matchCourse = !p.course || s.Course === p.course;
        const matchSemester = !p.semester || s.Semester === p.semester;
        const matchBatch = !p.batch || s.Batch === p.batch;

        if (matchCourse && matchSemester && matchBatch) {
          // Remove pre-existing fee assignments for this student on this semester to avoid duplicates
          const idx = feeAssignments.findIndex(f => f.StudentID === s.StudentID && f.Semester === p.semester);
          const newAssign: FeeAssignment = {
            StudentID: s.StudentID,
            Course: p.course,
            Semester: p.semester,
            AdmissionFee: Number(p.admissionFee || 0),
            TuitionFee: Number(p.tuitionFee || 0),
            ExamFee: Number(p.examFee || 0),
            LibraryFee: Number(p.libraryFee || 0),
            HostelFee: Number(p.hostelFee || 0),
            TransportFee: Number(p.transportFee || 0),
            Fine: Number(p.fine || 0),
            Scholarship: Number(p.scholarship || 0),
            Discount: Number(p.discount || 0),
            TotalAmount: Number(p.totalAmount || 0),
            DueDate: p.dueDate,
            Remarks: p.remarks || "Bulk Assigned"
          };

          if (idx !== -1) {
            feeAssignments[idx] = newAssign;
          } else {
            feeAssignments.push(newAssign);
          }
          assignedCount++;
        }
      });

      localStorage.setItem(KEYS.FEE_ASSIGNMENTS, JSON.stringify(feeAssignments));
      await logAudit("Assign Fees", `Bulk assigned fees to ${assignedCount} students in Sandbox Mode`);
      return { success: true, message: `Bulk assigned fees to ${assignedCount} students (Local Sandbox Mode)` };
    } else {
      if (!p.studentId) return { success: false, message: "StudentID is required for single fee assignment" };

      const idx = feeAssignments.findIndex(f => f.StudentID === p.studentId && f.Semester === p.semester);
      const newAssign: FeeAssignment = {
        StudentID: p.studentId,
        Course: p.course,
        Semester: p.semester,
        AdmissionFee: Number(p.admissionFee || 0),
        TuitionFee: Number(p.tuitionFee || 0),
        ExamFee: Number(p.examFee || 0),
        LibraryFee: Number(p.libraryFee || 0),
        HostelFee: Number(p.hostelFee || 0),
        TransportFee: Number(p.transportFee || 0),
        Fine: Number(p.fine || 0),
        Scholarship: Number(p.scholarship || 0),
        Discount: Number(p.discount || 0),
        TotalAmount: Number(p.totalAmount),
        DueDate: p.dueDate,
        Remarks: p.remarks || ""
      };

      if (idx !== -1) {
        feeAssignments[idx] = newAssign;
      } else {
        feeAssignments.push(newAssign);
      }

      localStorage.setItem(KEYS.FEE_ASSIGNMENTS, JSON.stringify(feeAssignments));
      await logAudit("Assign Fees", `Fees assigned to student ${p.studentId} in Sandbox Mode`);
      return { success: true, message: "Fees assigned successfully (Local Sandbox Mode)" };
    }
  },

  // Payments Module
  getPayments: async (): Promise<Payment[]> => {
    if (isConnectedToSheets()) {
      try {
        const data = await callGAS("getPayments");
        if (Array.isArray(data)) {
          localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn("GAS getPayments failed, using local", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.PAYMENTS) || "[]");
  },

  addPayment: async (p: {
    studentId: string;
    course: string;
    semester: string;
    feeType: string;
    amount: number;
    fine?: number;
    discount?: number;
    balance?: number;
    paymentMode: string;
    transactionNumber?: string;
    date?: string;
    remarks?: string;
  }): Promise<{ success: boolean; paymentId?: string; receiptNumber?: string; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("addPayment", p);
        if (res.success) {
          await APIService.getPayments();
          await APIService.getAssignedFees(); // balance changes
          await logAudit("Payment", `Payment of ${p.amount} processed for ${p.studentId} via Sheets`);
          return { success: true, paymentId: res.paymentId, receiptNumber: res.receiptNumber, message: res.message };
        }
      } catch (err) {
        console.warn("GAS addPayment failed, using local fallback", err);
      }
    }

    // Local Storage flow
    const payments: Payment[] = JSON.parse(localStorage.getItem(KEYS.PAYMENTS) || "[]");
    const payId = `PAY${Date.now()}`;
    const receiptNo = `REC${String(payments.length + 1).padStart(4, "0")}`;

    const newPayment: Payment = {
      PaymentID: payId,
      ReceiptNumber: receiptNo,
      StudentID: p.studentId,
      Course: p.course,
      Semester: p.semester,
      FeeType: p.feeType,
      Amount: Number(p.amount),
      Fine: Number(p.fine || 0),
      Discount: Number(p.discount || 0),
      Balance: Number(p.balance || 0),
      PaymentMode: p.paymentMode,
      TransactionNumber: p.transactionNumber || "CASH",
      Date: p.date || new Date().toISOString().split("T")[0],
      Remarks: p.remarks || ""
    };

    payments.push(newPayment);
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));

    await logAudit("Payment", `Payment ${receiptNo} for STU: ${p.studentId} registered in Sandbox Mode`);
    return { success: true, paymentId: payId, receiptNumber: receiptNo, message: "Payment recorded successfully (Local Sandbox Mode)" };
  },

  deletePayment: async (paymentId: string): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("deletePayment", { paymentId });
        if (res.success) {
          await APIService.getPayments();
          await logAudit("Delete Payment", `Deleted payment transaction ${paymentId} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS deletePayment failed, using local fallback", err);
      }
    }

    const payments: Payment[] = JSON.parse(localStorage.getItem(KEYS.PAYMENTS) || "[]");
    const filtered = payments.filter(p => p.PaymentID !== paymentId);
    if (filtered.length < payments.length) {
      localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(filtered));
      await logAudit("Delete Payment", `Deleted payment transaction ${paymentId} in Sandbox Mode`);
      return { success: true, message: "Payment deleted successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "Payment transaction not found" };
  },

  // Users Module
  getUsers: async (): Promise<any[]> => {
    if (isConnectedToSheets()) {
      try {
        const data = await callGAS("getUsers");
        if (Array.isArray(data)) {
          const normalized = data.map(u => ({
            id: u.id || u.id || u.Username || `USR-${Math.floor(100 + Math.random() * 900)}`,
            name: u.name || u.Name || u.Username || "System User",
            subtitle: u.subtitle || u.Subtitle || u.Role || "User",
            username: u.username || u.Username || "",
            password: u.password || u.Password || "",
            email: u.email || u.Email || `${u.username || "user"}@abccollege.edu.in`,
            mobile: u.mobile || u.Mobile || "",
            role: u.role || u.Role || "Teacher",
            department: u.department || u.Department || "Administration",
            status: u.status || u.Status || "Active",
            lastLogin: u.lastLogin || u.LastLogin || "Never Logged In",
            avatarUrl: u.avatarUrl || u.AvatarUrl || ""
          }));
          localStorage.setItem(KEYS.USERS, JSON.stringify(normalized));
          return normalized;
        }
      } catch (err) {
        console.warn("GAS getUsers failed, using local fallback", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
  },

  addUser: async (user: any): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("addUser", {
          id: user.id,
          name: user.name,
          subtitle: user.subtitle,
          username: user.username,
          password: user.password || "user123",
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          department: user.department,
          status: user.status,
          lastLogin: user.lastLogin || "Never Logged In",
          avatarUrl: user.avatarUrl || ""
        });
        if (res.success) {
          await APIService.getUsers();
          await logAudit("Add User", `User ${user.username} added via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS addUser failed, using local fallback", err);
      }
    }

    const users: any[] = JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
    users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    await logAudit("Add User", `User ${user.username} added in Sandbox Mode`);
    return { success: true, message: "User added successfully (Local Sandbox Mode)" };
  },

  updateUser: async (id: string, user: Partial<any>): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("updateUser", {
          id,
          name: user.name,
          subtitle: user.subtitle,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          department: user.department,
          status: user.status,
          lastLogin: user.lastLogin,
          avatarUrl: user.avatarUrl
        });
        if (res.success) {
          await APIService.getUsers();
          await logAudit("Update User", `Updated user ${user.username || id} details via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS updateUser failed, using local fallback", err);
      }
    }

    const users: any[] = JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
    const index = users.findIndex(u => u.id === id || u.username === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...user };
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      await logAudit("Update User", `Updated user ${user.username || id} details in Sandbox Mode`);
      return { success: true, message: "User updated successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "User not found" };
  },

  deleteUser: async (id: string, username?: string): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("deleteUser", { id, username });
        if (res.success) {
          await APIService.getUsers();
          await logAudit("Delete User", `Deleted user ${username || id} via Sheets`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS deleteUser failed, using local fallback", err);
      }
    }

    const users: any[] = JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
    const filtered = users.filter(u => u.id !== id && u.username !== id);
    if (filtered.length < users.length) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(filtered));
      await logAudit("Delete User", `Deleted user ${username || id} in Sandbox Mode`);
      return { success: true, message: "User deleted successfully (Local Sandbox Mode)" };
    }
    return { success: false, message: "User not found" };
  },

  // Notifications Module
  getNotifications: async (): Promise<Notification[]> => {
    if (isConnectedToSheets()) {
      try {
        const data = await callGAS("getNotifications");
        if (Array.isArray(data)) {
          localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn("GAS getNotifications failed, using local", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || "[]");
  },

  addNotification: async (notif: Omit<Notification, "ID" | "Date">): Promise<{ success: boolean; message: string }> => {
    const date = new Date().toISOString().split("T")[0];
    const id = String(Date.now());

    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("addNotification", {
          id,
          title: notif.Title,
          message: notif.Message,
          date,
          targetGroup: notif.TargetGroup
        });
        if (res.success) {
          await APIService.getNotifications();
          await logAudit("Notification", `Notification sent to: ${notif.TargetGroup}`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS addNotification failed, using local fallback", err);
      }
    }

    const notifications: Notification[] = JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || "[]");
    const newNotif: Notification = {
      ...notif,
      ID: id,
      Date: date
    };
    notifications.unshift(newNotif);
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));

    await logAudit("Notification", `Alert sent to ${notif.TargetGroup}: "${notif.Title}"`);
    return { success: true, message: "Notification posted successfully (Local Sandbox Mode)" };
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => {
    return JSON.parse(localStorage.getItem(KEYS.AUDIT_LOGS) || "[]");
  },

  // Attendance Module (Sandbox Local Persistence)
  getAttendance: (): AttendanceRecord[] => {
    return JSON.parse(localStorage.getItem(KEYS.ATTENDANCE) || "[]");
  },

  logAttendance: (records: AttendanceRecord[]) => {
    const current = JSON.parse(localStorage.getItem(KEYS.ATTENDANCE) || "[]");
    // Overwrite existing records for the same student on the same date and subject
    const updated = [...current];
    records.forEach(newRec => {
      const existingIdx = updated.findIndex(
        r => r.StudentID === newRec.StudentID && r.Date === newRec.Date && r.Subject === newRec.Subject
      );
      if (existingIdx !== -1) {
        updated[existingIdx] = newRec;
      } else {
        updated.push(newRec);
      }
    });
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(updated));
    logAudit("Attendance", `Logged attendance for ${records.length} students on ${records[0]?.Date || "today"}`);
  },

  // Performance Module (Sandbox Local Persistence)
  getPerformance: (): PerformanceRecord[] => {
    return JSON.parse(localStorage.getItem(KEYS.PERFORMANCE) || "[]");
  },

  addPerformanceRecord: (record: PerformanceRecord) => {
    const list: PerformanceRecord[] = JSON.parse(localStorage.getItem(KEYS.PERFORMANCE) || "[]");
    // Check if duplicate exists for student, subject, semester, and examType
    const idx = list.findIndex(
      r => r.StudentID === record.StudentID &&
           r.Subject === record.Subject &&
           r.Semester === record.Semester &&
           r.ExamType === record.ExamType
    );
    if (idx !== -1) {
      list[idx] = record;
    } else {
      list.push(record);
    }
    localStorage.setItem(KEYS.PERFORMANCE, JSON.stringify(list));
    logAudit("Academic Marks", `Logged grade ${record.Grade} (${record.Marks}%) for student ${record.StudentID}`);
  },

  // Security Password Change
  changePassword: async (p: { role: "Admin" | "Student"; username: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("changePassword", p);
        if (res.success) {
          await logAudit("Security", `Updated security credentials for ${p.username}`);
          return { success: true, message: res.message };
        }
      } catch (err) {
        console.warn("GAS changePassword failed, using local", err);
      }
    }

    if (p.role === "Admin") {
      const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
      const idx = users.findIndex(u => u.Username === p.username);
      if (idx !== -1) {
        users[idx].Password = p.newPassword;
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
        await logAudit("Security", `Admin password changed for ${p.username}`);
        return { success: true, message: "Admin password updated successfully (Local Sandbox Mode)" };
      }
    } else {
      const students: Student[] = JSON.parse(localStorage.getItem(KEYS.STUDENTS) || "[]");
      const idx = students.findIndex(s => s.StudentID === p.username);
      if (idx !== -1) {
        students[idx].Password = p.newPassword;
        localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
        await logAudit("Security", `Student password changed for ${p.username}`);
        return { success: true, message: "Student password updated successfully (Local Sandbox Mode)" };
      }
    }
    return { success: false, message: "User credentials not found" };
  },

  // Settings
  getSettings: () => {
    return {
      scriptUrl: getScriptUrl(),
      isConnected: isConnectedToSheets()
    };
  },

  // Reports
  getReports: async (): Promise<any> => {
    if (isConnectedToSheets()) {
      try {
        const res = await callGAS("getReports");
        if (res) {
          return res;
        }
      } catch (err) {
        console.warn("GAS getReports failed, using local calculation", err);
      }
    }

    // Local calculation
    const students = JSON.parse(localStorage.getItem(KEYS.STUDENTS) || "[]");
    const payments = JSON.parse(localStorage.getItem(KEYS.PAYMENTS) || "[]");
    const feeAssignments = JSON.parse(localStorage.getItem(KEYS.FEE_ASSIGNMENTS) || "[]");

    let totalPaid = 0;
    let todayCollection = 0;
    const todayStr = new Date().toISOString().split("T")[0];

    payments.forEach((p: any) => {
      totalPaid += Number(p.Amount || 0);
      if (p.Date === todayStr) {
        todayCollection += Number(p.Amount || 0);
      }
    });

    let totalAssigned = 0;
    feeAssignments.forEach((f: any) => {
      totalAssigned += Number(f.TotalAmount || 0);
    });

    const totalPending = Math.max(0, totalAssigned - totalPaid);

    return {
      totalStudents: students.length,
      totalFeesAssigned: totalAssigned,
      totalPaid: totalPaid,
      totalPending: totalPending,
      todayCollection: todayCollection,
      payments: payments,
      assignments: feeAssignments
    };
  }
};
