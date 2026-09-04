import { NavLink } from "react-router";
import { Building2, Users, UserCheck, Home, Tag, CalendarDays } from "lucide-react";

export function Navbar() {
  const navItems = [
    { to: "/inmuebles", label: "Inmuebles", icon: Home },
    { to: "/tipos-inmueble", label: "Tipos de Inmueble", icon: Tag },
    { to: "/reservas", label: "Reservas", icon: CalendarDays },
    { to: "/propietarios", label: "Propietarios", icon: Users },
    { to: "/inquilinos", label: "Inquilinos", icon: UserCheck },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:h-16 py-3 sm:py-0 gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">Inmobiliaria</span>
              <span className="text-xs ml-2 font-semibold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">Lab II</span>
            </div>
          </div>

          <nav className="flex items-center flex-wrap gap-1 sm:gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
