import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileSearch,
  LayoutDashboard,
  LogOut,
  Map,
  MessageCircle,
  MessageSquareText,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    label: "Overview",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My profile",
    to: "/profile",
    icon: UserRound,
  },
  {
    label: "Skills & interests",
    to: "/skills-interests",
    icon: Sparkles,
  },
  {
    label: "Career insights",
    to: "/career-insights",
    icon: BarChart3,
  },
  {
    label: "Assessment",
    to: "/assessment",
    icon: ClipboardCheck,
  },
  {
    label: "Learning roadmap",
    to: "/learning-roadmap",
    icon: Map,
  },
  {
    label: "Courses & resources",
    to: "/courses-resources",
    icon: BookOpen,
  },
  {
    label: "Resume analysis",
    to: "/resume-analysis",
    icon: FileSearch,
  },
  {
    label: "Mock interview",
    to: "/interview/mock",
    icon: MessageCircle,
  },
  {
    label: "Community",
    to: "/community",
    icon: UsersRound,
  },
  {
    label: "Feedback",
    to: "/feedback",
    icon: MessageSquareText,
  },
];

const WorkspaceSidebar = ({
  mobileOpen = false,
  onClose,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });

    onClose?.();
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close workspace navigation"
          className="fixed inset-0 z-40 bg-teal-950/45 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        aria-label="Student workspace navigation"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col bg-[#073f33] text-stone-100",
          "border-r border-white/10 shadow-[12px_0_40px_rgba(5,45,36,0.08)]",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            aria-label="CampusX dashboard"
            className="group inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300"
          >
            <span className="flex size-9 items-center justify-center rounded-md bg-orange-300 text-teal-950 transition-transform duration-200 group-hover:scale-[1.03]">
              <Sparkles
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />
            </span>

            <span className="text-lg font-bold tracking-[-0.03em]">
              campus
              <span className="text-orange-300">
                X
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-md border border-white/10 text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 lg:hidden"
            aria-label="Close navigation"
          >
            <X
              size={18}
              aria-hidden="true"
            />
          </button>
        </div>

        <nav
          className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
          aria-label="Workspace"
        >
          <ul className="space-y-1">
            {navigation.map(
              ({ label, to, icon: Icon }) => {
                const isActive =
                  location.pathname === to ||
                  (to !== "/dashboard" &&
                    location.pathname.startsWith(
                      `${to}/`
                    ));

                return (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={onClose}
                      className={[
                        "group flex min-h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium",
                        "transition-[background-color,color,transform] duration-200",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300",
                        isActive
                          ? "bg-white/10 text-white shadow-[inset_3px_0_0_#fdad73]"
                          : "text-white/65 hover:bg-white/[0.07] hover:text-white",
                      ].join(" ")}
                    >
                      <Icon
                        size={17}
                        strokeWidth={1.7}
                        aria-hidden="true"
                        className={[
                          "shrink-0 transition-transform duration-200",
                          isActive
                            ? "text-orange-300"
                            : "text-white/60 group-hover:translate-x-0.5 group-hover:text-white/85",
                        ].join(" ")}
                      />

                      <span>{label}</span>
                    </NavLink>
                  </li>
                );
              }
            )}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-white/10 px-3 py-3">
          <div className="flex items-center gap-3 rounded-md px-2.5 py-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d9eee8] text-sm font-semibold text-teal-950">
              L
            </div>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">
                Student
              </p>

              <p className="truncate text-[11px] text-white/45">
                Building your direction
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleLogout}
            whileHover={
              prefersReducedMotion
                ? undefined
                : { x: 2 }
            }
            whileTap={
              prefersReducedMotion
                ? undefined
                : { scale: 0.98 }
            }
            className="mt-1 flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-[13px] font-medium text-white/65 transition-colors duration-200 hover:bg-white/[0.07] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
          >
            <LogOut
              size={17}
              strokeWidth={1.7}
              aria-hidden="true"
            />

            <span>Sign out</span>
          </motion.button>
        </div>
      </aside>
    </>
  );
};

export default WorkspaceSidebar;