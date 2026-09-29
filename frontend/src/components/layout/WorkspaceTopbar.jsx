import { FileSearch, Menu } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const WorkspaceTopbar = ({
  onMenuOpen,
  actionHref = "/resume-analysis",
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <header
      className="
        sticky top-0 z-30
        h-[72px]
        border-b border-stone-200
        bg-[#fffdf9]
        shadow-[0_3px_16px_rgba(28,25,23,0.06)]
      "
    >
      <div
        className="
          flex h-full items-center justify-between
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={onMenuOpen}
            className="
              inline-flex size-10 shrink-0 items-center justify-center
              rounded-md
              border border-stone-200
              bg-white
              text-teal-950
              shadow-[0_2px_8px_rgba(28,25,23,0.05)]
              transition-all duration-200
              hover:border-stone-300
              hover:bg-stone-50
              hover:shadow-[0_4px_12px_rgba(28,25,23,0.07)]
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-teal-800
              active:scale-95
              lg:hidden
            "
            aria-label="Open workspace navigation"
          >
            <Menu
              size={19}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>

          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: -5 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="min-w-0"
          >
            <p
              className="
                truncate
                text-[10px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-teal-950
              "
            >
              Student workspace
            </p>

            <p
              className="
                mt-0.5
                truncate
                text-[12px]
                text-stone-500
              "
            >
              One useful step at a time
            </p>
          </motion.div>
        </div>

        {/* Right action */}
        <motion.a
          href={actionHref}
          initial={
            prefersReducedMotion
              ? { opacity: 1, x: 0 }
              : { opacity: 0, x: 8 }
          }
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.45,
            delay: prefersReducedMotion ? 0 : 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                  y: -1,
                }
          }
          whileTap={
            prefersReducedMotion
              ? undefined
              : {
                  y: 0,
                }
          }
          className="
            hidden
            min-h-9
            items-center
            gap-2
            rounded-md
            border border-stone-300
            bg-white
            px-3.5
            text-[12px]
            font-semibold
            text-stone-700
            shadow-[0_2px_8px_rgba(28,25,23,0.05)]
            transition-all duration-200
            hover:border-teal-800/30
            hover:bg-[#fcfffd]
            hover:text-teal-950
            hover:shadow-[0_5px_14px_rgba(28,25,23,0.08)]
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-teal-800
            sm:inline-flex
          "
        >
          <FileSearch
            size={15}
            strokeWidth={1.7}
            aria-hidden="true"
          />

          Analyze resume
        </motion.a>
      </div>
    </header>
  );
};

export default WorkspaceTopbar;