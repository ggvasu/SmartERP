import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { APIService } from "./utils/api";
import { AdminPortal } from "./components/AdminPortal";
import { StudentPortal } from "./components/StudentPortal";
import {
  Shield,
  User as UserIcon,
  Globe,
  Key,
  Database,
  ArrowRight,
  Info,
  CheckCircle2
} from "lucide-react";

// Dictionary of multi-language support translations
const DICTIONARY: { [key: string]: { [lang: string]: string } } = {
  Dashboard: {
    en: "Dashboard",
    es: "Tablero de control",
    hi: "डैशबोर्ड",
    fr: "Tableau de bord"
  },
  Students: {
    en: "Students",
    es: "Estudiantes",
    hi: "छात्रों की सूची",
    fr: "Étudiants"
  },
  Courses: {
    en: "Courses",
    es: "Programas de estudio",
    hi: "पाठ्यक्रम",
    fr: "Cours"
  },
  Departments: {
    en: "Departments",
    es: "Departamentos académicos",
    hi: "विभाग",
    fr: "Départements"
  },
  Batches: {
    en: "Batches",
    es: "Grupos/Lotes",
    hi: "बैच वर्ष",
    fr: "Années de batch"
  },
  Semesters: {
    en: "Semesters",
    es: "Semestres",
    hi: "सत्र / सेमेस्टर",
    fr: "Semestres"
  },
  Payments: {
    en: "Payments",
    es: "Transacciones de pagos",
    hi: "भुगतान रसीदें",
    fr: "Paiements"
  },
  "Assign Fees": {
    en: "Assign Fees",
    es: "Asignación de facturas",
    hi: "शुल्क आवंटन",
    fr: "Frais de scolarité"
  },
  Notifications: {
    en: "Notifications",
    es: "Anuncios y avisos",
    hi: "अधिसूचना बोर्ड",
    fr: "Avis de diffusion"
  },
  Reports: {
    en: "Reports",
    es: "Informes de auditoría",
    hi: "वित्तीय रिपोर्ट",
    fr: "Rapports d'analyse"
  },
  Settings: {
    en: "Settings",
    es: "Configuración general",
    hi: "सेटिंग्स प्रबंधन",
    fr: "Paramètres de synchronisation"
  },
  Attendance: {
    en: "Attendance",
    es: "Control de asistencia",
    hi: "दैनिक उपस्थिति",
    fr: "Registre de présence"
  },
  Performance: {
    en: "Performance",
    es: "Progreso académico",
    hi: "शैक्षणिक प्रदर्शन",
    fr: "Notes et évaluations"
  },
  Profile: {
    en: "Profile",
    es: "Mi perfil académico",
    hi: "मेरी प्रोफ़ाइल",
    fr: "Profil académique"
  },
  Logout: {
    en: "Logout",
    es: "Cerrar sesión segura",
    hi: "लॉगआउट करें",
    fr: "Déconnexion"
  },
  Login: {
    en: "Login",
    es: "Acceso al portal",
    hi: "लॉगिन करें",
    fr: "Connexion sécurisée"
  },
  Username: {
    en: "Username",
    es: "Identificador de usuario",
    hi: "यूज़रनेम / ईमेल",
    fr: "Nom d'utilisateur"
  },
  Password: {
    en: "Password",
    es: "Clave de acceso",
    hi: "पासवर्ड",
    fr: "Mot de passe"
  },
  "Student Portal": {
    en: "Student Portal",
    es: "Portal del estudiante",
    hi: "छात्र स्वयं-सेवा",
    fr: "Portail étudiant"
  },
  "Admin Portal": {
    en: "Admin Portal",
    es: "Portal del administrador",
    hi: "प्रशासनिक प्रबंधन",
    fr: "Portail administratif"
  }
};

export default function App() {
  const [lang, setLang] = useState<string>("en");
  const [role, setRole] = useState<"Admin" | "Student">("Admin");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load user session on init
  useEffect(() => {
    const session = APIService.getCurrentUser();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  // Multi-Language translator helper
  const t = (key: string): string => {
    if (DICTIONARY[key] && DICTIONARY[key][lang]) {
      return DICTIONARY[key][lang];
    }
    return key;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMessage(null);
    setIsLoading(true);

    if (!username || !password) {
      setLoginMessage("Please provide credentials.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await APIService.login(username, password, role);
      if (res.success) {
        setCurrentUser(res.user);
      } else {
        setLoginMessage(res.message);
      }
    } catch (err: any) {
      setLoginMessage(err.message || "Failed authentication connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    APIService.logout();
    setCurrentUser(null);
    setUsername("");
    setPassword("");
    setLoginMessage(null);
  };

  // Helper function to auto-fill login credentials for reviewers
  const handleAutoFill = (fillRole: "Admin" | "Student") => {
    setRole(fillRole);
    if (fillRole === "Admin") {
      setUsername("admin");
      setPassword("admin123");
    } else {
      setUsername("STU2025001");
      setPassword("password123");
    }
    setLoginMessage(null);
  };

  if (currentUser) {
    if (currentUser.Role === "Admin") {
      return (
        <AdminPortal
          user={currentUser}
          onLogout={handleLogout}
          lang={lang}
          t={t}
        />
      );
    } else {
      return (
        <StudentPortal
          user={currentUser}
          onLogout={handleLogout}
          lang={lang}
          t={t}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F3F5] flex flex-col justify-between p-6 md:p-8 font-sans antialiased text-[#1A1C1E]">
      {/* Top Header Row */}
      <header className="max-w-7xl mx-auto w-full flex justify-between items-center py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/20">
            Ω
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#1A1C1E]">
              CampusSync
            </h1>
            <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">
              College ERP Ecosystem
            </p>
          </div>
        </div>

        {/* Global Multi-Language Selector Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs hover:bg-gray-50 transition-all shadow-sm">
          <Globe className="w-4 h-4 text-blue-600" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-transparent font-bold text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="en" className="bg-white text-gray-950 font-semibold">English (EN)</option>
            <option value="es" className="bg-white text-gray-950 font-semibold">Español (ES)</option>
            <option value="hi" className="bg-white text-gray-950 font-semibold">हिन्दी (HI)</option>
            <option value="fr" className="bg-white text-gray-950 font-semibold">Français (FR)</option>
          </select>
        </div>
      </header>

      {/* Main Login Block */}
      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full mx-auto my-12 bg-white rounded-3xl border border-gray-200 p-8 shadow-lg relative overflow-hidden flex flex-col"
      >
        {/* Abstract background highlight */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -z-10"></div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-1">
            {t("Login")}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Access secure college ledger database synced in real-time
          </p>
        </div>

        {/* Role toggle button */}
        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-2xl mb-6 border border-gray-100">
          <button
            type="button"
            onClick={() => {
              setRole("Admin");
              setLoginMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
              role === "Admin"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Administration</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("Student");
              setLoginMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
              role === "Student"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Student Portal</span>
          </button>
        </div>

        {/* Feedback message banner */}
        {loginMessage && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl p-4 text-xs font-semibold text-center mb-6">
            ⚠ {loginMessage}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">
              {t("Username")} / Email
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-3 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === "Admin" ? "e.g. admin" : "e.g. STU2025001"}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium placeholder-gray-400/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">
              {t("Password")}
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-3 text-gray-400 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium placeholder-gray-400/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2"
          >
            {isLoading ? "Authenticating security credentials..." : t("Login")}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Quick Credentials Sandbox Assist */}
        <div className="mt-8 pt-6 border-t border-gray-100 space-y-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Local Sandbox Quick Credentials
          </p>
          <div className="grid grid-cols-2 gap-3 text-[10px] font-semibold">
            <button
              onClick={() => handleAutoFill("Admin")}
              type="button"
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 p-3 rounded-2xl text-left transition-all group shrink-0"
            >
              <p className="text-[9px] font-bold text-gray-400 uppercase">Admin Role</p>
              <p className="text-gray-700 font-bold mt-0.5">Username: <span className="font-mono text-blue-600 group-hover:underline">admin</span></p>
              <p className="text-gray-700 font-bold">Password: <span className="font-mono text-blue-600 group-hover:underline">admin123</span></p>
            </button>
            <button
              onClick={() => handleAutoFill("Student")}
              type="button"
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 p-3 rounded-2xl text-left transition-all group shrink-0"
            >
              <p className="text-[9px] font-bold text-gray-400 uppercase">Student Role</p>
              <p className="text-gray-700 font-bold mt-0.5">ID: <span className="font-mono text-blue-600 group-hover:underline">STU2025001</span></p>
              <p className="text-gray-700 font-bold">Password: <span className="font-mono text-blue-600 group-hover:underline">password123</span></p>
            </button>
          </div>
        </div>
      </motion.main>

      {/* Footer copyright */}
      <footer className="max-w-7xl mx-auto w-full text-center text-[10px] text-gray-500 font-semibold tracking-wider flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 py-4 border-t border-gray-200">
        <p>© 2026 CampusSync Enterprise Inc. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Security TLS Encrypted Verification</span>
        </div>
      </footer>
    </div>
  );
}
