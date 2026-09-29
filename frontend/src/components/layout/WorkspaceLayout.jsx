import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import WorkspaceSidebar from "./WorkspaceSidebar";
import WorkspaceTopbar from "./WorkspaceTopbar";

const WorkspaceLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return undefined;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#faf7f0] text-[#10231f]">
      <WorkspaceSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="min-h-screen lg:pl-[250px]">
        <WorkspaceTopbar onMenuOpen={() => setMobileOpen(true)} />

        <main
          key={location.pathname}
          className="min-h-[calc(100vh-4rem)]"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;