import { NavLink } from "react-router";
import { Building2, Users, UserCheck } from "lucide-react";

export function Navbar() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Inmobiliaria</span>
              <span className="text-xs ml-1.5 font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">Lab II</span>
            </div>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-4">
            <NavLink
              to="/propietarios"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`
              }
            >
              <Users className="w-4 h-4" />
              <span>Propietarios</span>
            </NavLink>

            <NavLink
              to="/inquilinos"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`
              }
            >
              <UserCheck className="w-4 h-4" />
              <span>Inquilinos</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
