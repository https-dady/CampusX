import { useEffect, useRef } from "react";
import { ArrowUpRight, Mail, Sparkles } from "lucide-react";

const footerLinks = [
  {
    title: "Explore",
    links: [
      {
        label: "About",
        href: "#about",
      },
      {
        label: "Assessment",
        href: "/signup",
      },
      {
        label: "Courses",
        href: "#courses",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "Career roadmap",
        href: "#career-roadmap",
      },
      {
        label: "Job matches",
        href: "#job-matches",
      },
      {
        label: "FAQ",
        href: "#faq",
      },
    ],
  },
];

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;

    if (!footer) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      footer.dataset.visible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          footer.dataset.visible = "true";
          observer.disconnect();
        }
      },
      {
        threshold: 0.08,
      }
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="group/footer border-t border-stone-200 bg-[#faf7f0]"
    >
      <div className="mx-auto max-w-[1216px] px-5 lg:px-0">
        {/* Main Footer */}
        <div
          className="
            grid gap-12 py-14
            opacity-0 translate-y-5
            transition-[opacity,transform]
            duration-700 ease-out
            group-data-[visible=true]/footer:translate-y-0
            group-data-[visible=true]/footer:opacity-100
            sm:py-16
            lg:grid-cols-[1.5fr_1fr_1fr]
            lg:gap-16
            lg:py-20
          "
        >
          {/* Brand */}
          <div className="max-w-[360px]">
            <a
              href="/"
              aria-label="CampusX home"
              className="
                group inline-flex items-center gap-2.5 rounded-sm
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-teal-800
              "
            >
              <span
                className="
                  flex size-9 items-center justify-center rounded-[5px]
                  bg-teal-950 text-orange-300
                  transition-all duration-200
                  group-hover:scale-[1.03]
                  group-hover:bg-teal-900
                "
              >
                <Sparkles
                  size={17}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="
                    transition-transform duration-200
                    group-hover:rotate-6
                  "
                />
              </span>

              <span
                className="
                  text-lg font-bold tracking-[-0.03em] text-teal-950
                  transition-colors duration-200
                  group-hover:text-teal-800
                "
              >
                campus<span className="text-orange-600">X</span>
              </span>
            </a>

            <p className="mt-5 text-sm leading-6 text-stone-500">
              A clearer way for students to understand their skills, discover
              career directions, and take the next right step.
            </p>

            <a
              href="mailto:hello@campusx.com"
              className="
                group mt-5 inline-flex items-center gap-2 rounded-sm
                text-xs font-medium text-teal-900
                transition-colors duration-200
                hover:text-orange-700
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-teal-800
              "
            >
              <Mail
                size={14}
                strokeWidth={1.7}
                aria-hidden="true"
                className="
                  transition-transform duration-200
                  group-hover:-translate-y-0.5
                "
              />

              hello@campusx.com
            </a>
          </div>

          {/* Footer Navigation */}
          {footerLinks.map((group, groupIndex) => (
            <div
              key={group.title}
              className="
                opacity-0 translate-y-3
                transition-[opacity,transform]
                duration-700 ease-out
                group-data-[visible=true]/footer:translate-y-0
                group-data-[visible=true]/footer:opacity-100
              "
              style={{
                transitionDelay: `${120 + groupIndex * 80}ms`,
              }}
            >
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                {group.title}
              </h2>

              <nav
                className="mt-5 flex flex-col items-start gap-3.5"
                aria-label={`${group.title} links`}
              >
                {group.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="
                      group inline-flex min-h-6 items-center gap-1
                      text-sm text-stone-600
                      transition-colors duration-200
                      hover:text-teal-900
                      focus-visible:rounded-sm
                      focus-visible:outline-2
                      focus-visible:outline-offset-4
                      focus-visible:outline-teal-800
                    "
                  >
                    <span>{link.label}</span>

                    <ArrowUpRight
                      size={12}
                      strokeWidth={1.7}
                      aria-hidden="true"
                      className="
                        opacity-0
                        transition-all duration-200
                        group-hover:-translate-y-0.5
                        group-hover:translate-x-0.5
                        group-hover:opacity-100
                      "
                    />
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          className="
            flex flex-col gap-4
            border-t border-stone-200 py-6
            opacity-0
            transition-opacity duration-700 ease-out
            group-data-[visible=true]/footer:opacity-100
            sm:flex-row sm:items-center sm:justify-between
          "
          style={{
            transitionDelay: "260ms",
          }}
        >
          <p className="text-[11px] text-stone-400">
            © {new Date().getFullYear()} CampusX. Built for students finding
            their direction.
          </p>

          <div className="flex items-center gap-5">
            <a
              href="/privacy"
              className="
                text-[11px] text-stone-400
                transition-colors duration-200
                hover:text-teal-900
                focus-visible:rounded-sm
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-teal-800
              "
            >
              Privacy
            </a>

            <a
              href="/terms"
              className="
                text-[11px] text-stone-400
                transition-colors duration-200
                hover:text-teal-900
                focus-visible:rounded-sm
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-teal-800
              "
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;