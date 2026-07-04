import React, { useState, useEffect } from "react";
import { APIService } from "../utils/api";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Shield,
  GraduationCap,
  Users,
  UserCheck,
  UserMinus,
  Building,
  Briefcase,
  X,
  Trash2,
  Check,
  Info
} from "lucide-react";

interface UsersScreenProps {
  darkMode: boolean;
}

export interface SystemUser {
  id: string; // e.g. "USR-001"
  name: string;
  subtitle: string; // e.g. "System Administrator"
  username: string;
  email: string;
  mobile: string;
  role: "Administrator" | "Accountant" | "Librarian" | "Teacher" | "Admission Officer" | "Exam Clerk" | "Operator";
  department: string;
  status: "Active" | "Inactive";
  lastLogin: string;
  avatarUrl?: string;
}

export const UsersScreen: React.FC<UsersScreenProps> = ({ darkMode }) => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await APIService.getUsers();
      setUsers(data as SystemUser[]);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive" | "admins">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Omit<SystemUser, "id" | "lastLogin">>({
    name: "",
    subtitle: "",
    username: "",
    email: "",
    mobile: "",
    role: "Teacher",
    department: "Computer Applications",
    status: "Active"
  });

  // Helper lists matching the design filters
  const rolesList = [
    "Administrator",
    "Accountant",
    "Librarian",
    "Teacher",
    "Admission Officer",
    "Exam Clerk",
    "Operator"
  ];

  const deptsList = [
    "Administration",
    "Accounts",
    "Library",
    "Computer Applications",
    "Management Studies",
    "Admission",
    "Examinations",
    "IT Support",
    "Basic Sciences",
    "Commerce",
    "Electrical Engineering",
    "Mechanical Engineering"
  ];

  // Calculations for Metrics Row
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status === "Active").length;
  const inactiveCount = users.filter((u) => u.status === "Inactive").length;
  const adminCount = users.filter((u) => u.role === "Administrator").length;
  const teacherCount = users.filter((u) => u.role === "Teacher").length;
  // Others means anyone not Admin and not Teacher
  const othersCount = users.filter((u) => u.role !== "Administrator" && u.role !== "Teacher").length;

  const activePercent = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
  const inactivePercent = totalCount > 0 ? Math.round((inactiveCount / totalCount) * 100) : 0;

  // Handles select all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const shownIds = currentRecords.map((u) => u.id);
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...shownIds])));
    } else {
      const shownIds = currentRecords.map((u) => u.id);
      setSelectedUserIds((prev) => prev.filter((id) => !shownIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds((prev) => [...prev, id]);
    } else {
      setSelectedUserIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Filter & Search Logic
  const filteredUsers = users.filter((u) => {
    // Tab Filter
    if (activeTab === "active" && u.status !== "Active") return false;
    if (activeTab === "inactive" && u.status !== "Inactive") return false;
    if (activeTab === "admins" && u.role !== "Administrator") return false;

    // Search input
    const matchesSearch =
      (u.name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (u.email || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (u.username || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (u.mobile || "").toLowerCase().includes((searchTerm || "").toLowerCase());

    // Role filter
    const matchesRole = selectedRole === "All" || u.role === selectedRole;

    // Status filter
    const matchesStatus = selectedStatus === "All" || u.status === selectedStatus;

    // Dept filter
    const matchesDept = selectedDept === "All" || u.department === selectedDept;

    return matchesSearch && matchesRole && matchesStatus && matchesDept;
  });

  // Pagination bounds
  const totalRecords = filteredUsers.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage) || 1;
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
  const currentRecords = filteredUsers.slice(startIndex, endIndex);

  // Set current page back to 1 if filters reduce list size below current page index
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredUsers, totalPages, currentPage]);

  // Form Submit (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.username) {
      alert("Please complete all required fields.");
      return;
    }

    if (editingUser) {
      // Modify
      const updatedUser = {
        ...editingUser,
        name: formData.name,
        subtitle: formData.subtitle || formData.role,
        username: formData.username.toLowerCase().replace(/\s+/g, ""),
        email: formData.email.toLowerCase(),
        mobile: formData.mobile,
        role: formData.role,
        department: formData.department,
        status: formData.status
      };

      setIsLoading(true);
      try {
        const res = await APIService.updateUser(editingUser.id, updatedUser);
        if (res.success) {
          alert("User updated successfully!");
          await fetchUsers();
        } else {
          alert("Error: " + res.message);
        }
      } catch (err: any) {
        alert("Failed to update user: " + err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Add New
      const nextIdNum = Math.max(...users.map((u) => parseInt((u.id || "").split("-")[1] || "0")), 0) + 1;
      const formattedId = `USR-${String(nextIdNum).padStart(3, "0")}`;
      const newUser = {
        id: formattedId,
        name: formData.name,
        subtitle: formData.subtitle || formData.role,
        username: formData.username.toLowerCase().replace(/\s+/g, ""),
        email: formData.email.toLowerCase(),
        mobile: formData.mobile,
        role: formData.role,
        department: formData.department,
        status: formData.status,
        lastLogin: "Never Logged In"
      };

      setIsLoading(true);
      try {
        const res = await APIService.addUser(newUser);
        if (res.success) {
          alert("User added successfully!");
          await fetchUsers();
        } else {
          alert("Error: " + res.message);
        }
      } catch (err: any) {
        alert("Failed to add user: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }

    // Reset and close
    setShowAddUserModal(false);
    setEditingUser(null);
    setFormData({
      name: "",
      subtitle: "",
      username: "",
      email: "",
      mobile: "",
      role: "Teacher",
      department: "Computer Applications",
      status: "Active"
    });
  };

  const startEdit = (user: SystemUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      subtitle: user.subtitle,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      department: user.department,
      status: user.status
    });
    setShowAddUserModal(true);
  };

  const deleteUser = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete system user: ${name}?`)) {
      setIsLoading(true);
      try {
        const res = await APIService.deleteUser(id);
        if (res.success) {
          alert("User deleted successfully!");
          await fetchUsers();
          setSelectedUserIds((prev) => prev.filter((item) => item !== id));
        } else {
          alert("Error: " + res.message);
        }
      } catch (err: any) {
        alert("Failed to delete user: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-700">
      {/* Dynamic Header & Path Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span className="text-blue-600 font-extrabold">Users</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-1 flex items-center gap-2">
            Users
          </h2>
        </div>
      </div>

      {/* Stats KPI Metric Cards Section matching provided model perfectly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* KPI Card 1: Total Users */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
          darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-black font-mono text-purple-950 mt-0.5 leading-none">{totalCount}</h3>
            <p className="text-[9px] text-slate-400 font-bold mt-1">All system users</p>
          </div>
        </div>

        {/* KPI Card 2: Active Users */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
          darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Users</p>
            <h3 className="text-2xl font-black font-mono text-emerald-600 mt-0.5 leading-none">{activeCount}</h3>
            <p className="text-[9px] text-emerald-500 font-bold mt-1">{activePercent}% of total users</p>
          </div>
        </div>

        {/* KPI Card 3: Inactive Users */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
          darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <UserMinus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Inactive Users</p>
            <h3 className="text-2xl font-black font-mono text-rose-600 mt-0.5 leading-none">{inactiveCount}</h3>
            <p className="text-[9px] text-rose-500 font-bold mt-1">{inactivePercent}% of total users</p>
          </div>
        </div>

        {/* KPI Card 4: Administrators */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
          darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Administrators</p>
            <h3 className="text-2xl font-black font-mono text-blue-600 mt-0.5 leading-none">{adminCount}</h3>
            <p className="text-[9px] text-blue-500 font-bold mt-1">With full access</p>
          </div>
        </div>

        {/* KPI Card 5: Teachers */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
          darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Teachers</p>
            <h3 className="text-2xl font-black font-mono text-amber-600 mt-0.5 leading-none">{teacherCount}</h3>
            <p className="text-[9px] text-amber-500 font-bold mt-1">Teaching staff</p>
          </div>
        </div>

        {/* KPI Card 6: Others (Staff) */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
          darkMode ? "bg-[#111A2E]/80 border-[#1E2E54]" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Others (Staff)</p>
            <h3 className="text-2xl font-black font-mono text-indigo-600 mt-0.5 leading-none">{othersCount}</h3>
            <p className="text-[9px] text-indigo-500 font-bold mt-1">Other staff members</p>
          </div>
        </div>
      </div>

      {/* Main Container of Filters, Tabs and the system table */}
      <div className={`rounded-2xl border transition-all ${
        darkMode ? "bg-[#0F172A] border-[#1E293B]" : "bg-white border-slate-200 shadow-sm"
      }`}>
        {/* Filters bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search filter */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, username or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 shadow-xs font-semibold ${
                  darkMode 
                    ? "bg-[#1E293B] border-[#2D3748] text-slate-100 focus:border-blue-500 focus:ring-blue-500" 
                    : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-blue-600 focus:ring-blue-600"
                }`}
              />
            </div>

            {/* Role dropdown */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider px-1">Role</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className={`text-xs border rounded-xl px-3 py-2 font-bold focus:outline-none focus:ring-1 ${
                  darkMode 
                    ? "bg-[#1E293B] border-[#2D3748] text-slate-100 focus:ring-blue-500" 
                    : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:ring-blue-600"
                }`}
              >
                <option value="All">All Roles</option>
                {rolesList.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Status dropdown */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider px-1">Status</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`text-xs border rounded-xl px-3 py-2 font-bold focus:outline-none focus:ring-1 ${
                  darkMode 
                    ? "bg-[#1E293B] border-[#2D3748] text-slate-100 focus:ring-blue-500" 
                    : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:ring-blue-600"
                }`}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Department dropdown */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider px-1">Department</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className={`text-xs border rounded-xl px-3 py-2 font-bold focus:outline-none focus:ring-1 ${
                  darkMode 
                    ? "bg-[#1E293B] border-[#2D3748] text-slate-100 focus:ring-blue-500" 
                    : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:ring-blue-600"
                }`}
              >
                <option value="All">All Departments</option>
                {deptsList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* More Filters Toggle */}
            <div className="self-end pb-0.5">
              <button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className={`px-4 py-2 text-xs font-black rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                  showMoreFilters
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : darkMode 
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                    : "bg-white border-slate-200 text-blue-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>More Filters</span>
              </button>
            </div>

            {/* Add User Button */}
            <div className="self-end pb-0.5 ml-auto">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setFormData({
                    name: "",
                    subtitle: "",
                    username: "",
                    email: "",
                    mobile: "",
                    role: "Teacher",
                    department: "Computer Applications",
                    status: "Active"
                  });
                  setShowAddUserModal(true);
                }}
                className="px-4.5 py-2 text-xs font-black text-white bg-[#6366F1] hover:bg-[#4F46E5] rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Expanded More Filters panel */}
          {showMoreFilters && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-down">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Clearance Level</label>
                <select className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 w-full text-slate-600 font-medium focus:outline-none">
                  <option>All Security Clearance</option>
                  <option>L0 - Normal Staff</option>
                  <option>L1 - Departmental Head</option>
                  <option>L2 - Director/Registrar</option>
                  <option>L3 - Root Database Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Login Activity Range</label>
                <select className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 w-full text-slate-600 font-medium focus:outline-none">
                  <option>Any Last Login</option>
                  <option>Active Today</option>
                  <option>Active within 7 Days</option>
                  <option>Inactive &gt; 30 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Account Lock State</label>
                <select className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 w-full text-slate-600 font-medium focus:outline-none">
                  <option>All Accounts</option>
                  <option>Un-locked Only</option>
                  <option>Locked Only</option>
                </select>
              </div>

              <div className="flex items-end justify-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRole("All");
                    setSelectedStatus("All");
                    setSelectedDept("All");
                  }}
                  className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-black hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}

          {/* Tab Control Bar exactly matching mock image */}
          <div className="flex border-b border-slate-100 mt-2">
            <button
              onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
              className={`pb-3 px-5 text-xs font-extrabold relative transition-all cursor-pointer ${
                activeTab === "all"
                  ? "text-[#15305B] font-black border-b-2 border-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => { setActiveTab("active"); setCurrentPage(1); }}
              className={`pb-3 px-5 text-xs font-extrabold relative transition-all cursor-pointer ${
                activeTab === "active"
                  ? "text-[#15305B] font-black border-b-2 border-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Active Users
            </button>
            <button
              onClick={() => { setActiveTab("inactive"); setCurrentPage(1); }}
              className={`pb-3 px-5 text-xs font-extrabold relative transition-all cursor-pointer ${
                activeTab === "inactive"
                  ? "text-[#15305B] font-black border-b-2 border-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Inactive Users
            </button>
            <button
              onClick={() => { setActiveTab("admins"); setCurrentPage(1); }}
              className={`pb-3 px-5 text-xs font-extrabold relative transition-all cursor-pointer ${
                activeTab === "admins"
                  ? "text-[#15305B] font-black border-b-2 border-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Administrators
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5 text-center w-12">
                  <input
                    type="checkbox"
                    checked={
                      currentRecords.length > 0 &&
                      currentRecords.every((u) => selectedUserIds.includes(u.id))
                    }
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold">
                    No matching users found. Try adjusting your query or filters.
                  </td>
                </tr>
              ) : (
                currentRecords.map((u) => {
                  const isChecked = selectedUserIds.includes(u.id);
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50/40 transition-colors ${isChecked ? "bg-blue-50/20" : ""}`}>
                      <td className="py-3.5 px-5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(u.id, e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>

                      {/* User Avatar + Name + Subtitle */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border ${
                              u.role === "Administrator"
                                ? "bg-purple-100 text-purple-700 border-purple-200"
                                : u.role === "Teacher"
                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-blue-100 text-blue-700 border-blue-200"
                            }`}>
                              {(u.name || "").split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-slate-800 leading-tight truncate">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold leading-normal">{u.subtitle}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-500">{u.username}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-bold truncate max-w-[180px]">{u.email}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-bold font-mono">{u.mobile}</td>

                      {/* Custom styled badges according to role */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-black border uppercase ${
                          u.role === "Administrator"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : u.role === "Accountant"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : u.role === "Librarian"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : u.role === "Teacher"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : u.role === "Admission Officer"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : u.role === "Exam Clerk"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-extrabold truncate max-w-[150px]">{u.department}</td>

                      {/* Status pill exactly as pictured */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border inline-flex items-center gap-1 ${
                          u.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" ? "bg-emerald-600" : "bg-rose-600"}`} />
                          <span>{u.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-bold font-mono">{u.lastLogin}</td>

                      {/* High quality actions row */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEdit(u)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Profile Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => startEdit(u)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit User Info"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteUser(u.id, u.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-slate-300 hover:text-slate-500 rounded-lg">
                            <MoreVertical className="w-4 h-4" />
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

        {/* Table Pagination Footer */}
        <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-extrabold">
            Showing <span className="text-slate-700 font-extrabold">{startIndex + 1}</span> to{" "}
            <span className="text-slate-700 font-extrabold">{endIndex}</span> of{" "}
            <span className="text-slate-700 font-extrabold">{totalRecords}</span> entries (from 25 total)
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-black uppercase">Per Page</span>
              <select
                value={recordsPerPage}
                onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="text-xs bg-white border border-slate-200 rounded px-2 py-1 font-bold text-slate-600"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 bg-white border border-slate-200 text-slate-500 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 text-xs font-black rounded flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === idx + 1
                      ? "bg-[#6366F1] text-white shadow-md shadow-indigo-600/10"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 bg-white border border-slate-200 text-slate-500 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit System User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 md:p-8 border border-slate-100 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-50 mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingUser ? "Modify System User Profile" : "Register New System User"}
              </h3>
              <button
                onClick={() => { setShowAddUserModal(false); setEditingUser(null); }}
                className="text-slate-400 hover:text-slate-600 text-lg font-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase text-[9px] font-black tracking-wider text-slate-400 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name (e.g. Ramesh Kumar)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[9px] font-black tracking-wider text-slate-400 mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter system username (e.g. ramesh.kumar)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase text-[9px] font-black tracking-wider text-slate-400 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[9px] font-black tracking-wider text-slate-400 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase text-[9px] font-black tracking-wider text-slate-400 mb-1">
                    System Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase text-[9px] font-black tracking-wider text-slate-400 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {deptsList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase text-[9px] font-black tracking-wider text-slate-400 mb-1">
                    Designation/Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Assistant Professor, Accountant"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[9px] font-black tracking-wider text-slate-400 mb-1">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-50 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowAddUserModal(false); setEditingUser(null); }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-extrabold hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/15 transition-all cursor-pointer"
                >
                  {editingUser ? "Save Modifications" : "Register User Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
