import { useEffect, useState } from "react";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const navigation = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Career roadmap", href: "#career-roadmap" },
  { label: "Job matches", href: "#job-matches" },
  { label: "FAQ", href: "#faq" },
];

const navItemVariants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <motion.header
      initial={
        prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 0, y: -18 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="absolute inset-x-0 top-0 z-50"
    >
      <div
        className={[
          "border-b transition-all duration-300",
          isScrolled
            ? "border-white/15 bg-teal-950/85 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl"
            : "border-white/10 bg-teal-950/35 shadow-[0_4px_24px_rgba(0,0,0,0.10)] backdrop-blur-md",
        ].join(" ")}
      >
        <div className="mx-auto flex h-[72px] max-w-[1216px] items-center justify-between px-5 sm:h-20 lg:px-0">
          {/* Logo */}
          <motion.a
            href="/"
            onClick={closeMenu}
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, x: -14 }
            }
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.55,
              delay: prefersReducedMotion ? 0 : 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group flex shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300"
            aria-label="CampusX home"
          >
            <span className="flex size-8 items-center justify-center rounded-[5px] bg-orange-300 text-teal-950 transition-all duration-200 group-hover:scale-[1.03] group-hover:bg-orange-200 sm:size-9">
              <Sparkles
                size={17}
                strokeWidth={2}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:rotate-6"
              />
            </span>

            <span className="text-[17px] font-bold tracking-[-0.03em] text-white transition-colors duration-200 group-hover:text-white/90 sm:text-lg">
              campus<span className="text-orange-300">X</span>
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <motion.nav
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: prefersReducedMotion ? 0 : 0.07,
                  delayChildren: prefersReducedMotion ? 0 : 0.2,
                },
              },
            }}
            className="hidden items-center gap-7 lg:flex xl:gap-9"
            aria-label="Main navigation"
          >
            {navigation.map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                variants={navItemVariants}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative rounded-sm py-2 text-xs font-medium text-white/75 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300 xl:text-[13px]"
              >
                {item.label}

                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-orange-300 transition-transform duration-200 group-hover:scale-x-100"
                />
              </motion.a>
            ))}
          </motion.nav>

          {/* Desktop Actions */}
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, x: 14 }
            }
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.55,
              delay: prefersReducedMotion ? 0 : 0.42,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="hidden items-center gap-6 lg:flex"
          >
            <a
              href="/signup"
              className="rounded-sm py-2 text-xs font-medium text-white/75 transition-colors duration-200 hover:text-orange-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300 xl:text-[13px]"
            >
              Sign in
            </a>

            <a
              href="/signup"
              className="group inline-flex min-h-10 items-center gap-2 rounded-md bg-orange-300 px-4 text-xs font-semibold text-teal-950 shadow-[0_4px_18px_rgba(251,191,36,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-200 hover:shadow-[0_8px_28px_rgba(251,191,36,0.20)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300 active:translate-y-0 xl:px-5 xl:text-[13px]"
            >
              Take free assessment

              <ArrowRight
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </a>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            type="button"
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, x: 12 }
            }
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.45,
              delay: prefersReducedMotion ? 0 : 0.25,
            }}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex size-11 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] text-white transition-all duration-200 hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 active:scale-95 lg:hidden"
            aria-label={
              isMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? (
              <X
                size={20}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ) : (
              <Menu
                size={20}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        id="mobile-navigation"
        initial={false}
        animate={
          isMenuOpen
            ? {
                opacity: 1,
                height: "auto",
                y: 0,
              }
            : {
                opacity: 0,
                height: 0,
                y: -8,
              }
        }
        transition={{
          duration: prefersReducedMotion ? 0 : 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        aria-hidden={!isMenuOpen}
        className="overflow-hidden border-b border-white/10 bg-teal-950/95 shadow-[0_15px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl lg:hidden"
      >
        <nav
          className="mx-auto flex max-w-[1216px] flex-col px-5 py-4"
          aria-label="Mobile navigation"
        >
          {navigation.map((item, index) => (
            <motion.a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              tabIndex={isMenuOpen ? 0 : -1}
              initial={false}
              animate={
                isMenuOpen
                  ? {
                      opacity: 1,
                      x: 0,
                    }
                  : {
                      opacity: 0,
                      x: -10,
                    }
              }
              transition={{
                duration: prefersReducedMotion ? 0 : 0.25,
                delay:
                  prefersReducedMotion || !isMenuOpen
                    ? 0
                    : index * 0.04,
              }}
              className="group flex min-h-12 items-center justify-between border-b border-white/10 py-3 text-sm font-medium text-white/75 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
            >
              <span>{item.label}</span>

              <ArrowRight
                size={15}
                strokeWidth={1.7}
                aria-hidden="true"
                className="opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
              />
            </motion.a>
          ))}

          <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center">
            <a
              href="/signup"
              onClick={closeMenu}
              tabIndex={isMenuOpen ? 0 : -1}
              className="inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-medium text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
            >
              Sign Up
            </a>

            <a
              href="/login"
              onClick={closeMenu}
              tabIndex={isMenuOpen ? 0 : -1}
              className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-orange-300 px-4 text-sm font-semibold text-teal-950 transition-all duration-200 hover:bg-orange-200 hover:shadow-[0_8px_24px_rgba(251,191,36,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300"
            >
              Take free assessment

              <ArrowRight
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </nav>
      </motion.div>
    </motion.header>
  );
};

export default Header;