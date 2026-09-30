import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import {
  getMyProfile,
  updateMyProfile,
} from "../../services/profile.service";

/* -------------------------------------------------------------------------- */
/* Cursor-follow surface                                                       */
/* -------------------------------------------------------------------------- */

const CursorCard = ({
  children,
  className = "",
  intensity = 2.3,
  delay = 0,
}) => {
  const cardRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const handlePointerMove = (event) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse" ||
      !cardRef.current
    ) {
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    const rotateX = -py * intensity;
    const rotateY = px * intensity;

    cardRef.current.style.transform = `
      perspective(1100px)
      translate3d(${px * 4}px, ${py * 4}px, 0)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;

    cardRef.current.style.setProperty(
      "--cursor-x",
      `${(x / rect.width) * 100}%`
    );

    cardRef.current.style.setProperty(
      "--cursor-y",
      `${(y / rect.height) * 100}%`
    );

    cardRef.current.style.setProperty(
      "--cursor-opacity",
      "1"
    );
  };

  const resetCard = () => {
    if (!cardRef.current || prefersReducedMotion) {
      return;
    }

    cardRef.current.style.transform = `
      perspective(1100px)
      translate3d(0, 0, 0)
      rotateX(0deg)
      rotateY(0deg)
    `;

    cardRef.current.style.setProperty(
      "--cursor-opacity",
      "0"
    );
  };

  return (
    <motion.article
      ref={cardRef}
      initial={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 22 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetCard}
      className={`
        relative overflow-hidden
        transition-[transform,box-shadow,border-color]
        duration-300 ease-out
        ${className}
      `}
      style={{
        "--cursor-x": "50%",
        "--cursor-y": "50%",
        "--cursor-opacity": "0",
      }}
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 z-0
          opacity-[var(--cursor-opacity)]
          transition-opacity duration-200
        "
        style={{
          background:
            "radial-gradient(circle 180px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.42), transparent 72%)",
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </motion.article>
  );
};

/* -------------------------------------------------------------------------- */
/* Profile page                                                                */
/* -------------------------------------------------------------------------- */

const MyProfile = () => {
  const prefersReducedMotion = useReducedMotion();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");

        const result = await getMyProfile();

        if (!isMounted) return;

        const backendProfile = result?.data?.profile;

        if (!backendProfile) {
          throw new Error(
            "Profile data was not returned by the server."
          );
        }

        setProfile({
          name: backendProfile.name || "Student",
          email: backendProfile.email || "Email unavailable",

          location: "Not added yet",
          degree: "Academic details not added yet",
          year: "Not added yet",

          about:
            "Add more profile details to build a clearer career profile.",

          skills: Array.isArray(
            backendProfile.profile?.technicalSkills
          )
            ? backendProfile.profile.technicalSkills
            : [],

          interests: [],
          careerGoal: "Not selected yet",

          certifications: Array.isArray(
            backendProfile.profile?.certifications
          )
            ? backendProfile.profile.certifications
            : [],

          authProvider:
            backendProfile.authProvider || "local",

          isEmailVerified:
            backendProfile.isEmailVerified === true,

          completion: 0,
        });
      } catch (err) {
        if (!isMounted) return;

        console.error(
          "Failed to load CampusX profile:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load your profile."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Edit profile / technical skills                                          */
  /* ------------------------------------------------------------------------ */

  const openEditProfile = () => {
    setSkillsDraft([...profile.skills]);
    setSkillInput("");
    setSaveError("");
    setSaveSuccess("");
    setIsEditingSkills(true);
  };

  const closeEditProfile = () => {
    if (isSavingSkills) return;

    setIsEditingSkills(false);
    setSkillInput("");
    setSaveError("");
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    const alreadyExists = skillsDraft.some(
      (existingSkill) =>
        existingSkill.trim().toLowerCase() ===
        skill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setSkillsDraft((currentSkills) => [
      ...currentSkills,
      skill,
    ]);

    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setSkillsDraft((currentSkills) =>
      currentSkills.filter(
        (skill) => skill !== skillToRemove
      )
    );
  };

  const handleSkillInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  const handleSaveSkills = async () => {
    const cleanedSkills = skillsDraft
      .map((skill) => skill.trim())
      .filter(Boolean);

    setIsSavingSkills(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      await updateMyProfile({
        technicalSkills: cleanedSkills,
      });

      setProfile((currentProfile) => ({
        ...currentProfile,
        skills: cleanedSkills,
      }));

      setSkillsDraft(cleanedSkills);

      setSaveSuccess(
        "Profile updated successfully."
      );

      window.setTimeout(() => {
        setIsEditingSkills(false);
        setSaveSuccess("");
      }, 700);
    } catch (err) {
      console.error(
        "Failed to update CampusX profile:",
        err
      );

      setSaveError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update your profile."
      );
    } finally {
      setIsSavingSkills(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Loading state                                                             */
  /* ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <main
        className="
          mx-auto flex min-h-[60vh] w-full max-w-[1216px]
          items-center justify-center
          px-4 py-10 sm:px-6 lg:px-8
        "
        aria-live="polite"
      >
        <div className="text-center">
          <div
            className="
              mx-auto size-8 animate-spin rounded-full
              border-2 border-stone-200
              border-t-teal-900
            "
            aria-hidden="true"
          />

          <p className="mt-4 text-sm font-medium text-stone-600">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error state                                                               */
  /* ------------------------------------------------------------------------ */

  if (error) {
    return (
      <main
        className="
          mx-auto flex min-h-[60vh] w-full max-w-[1216px]
          items-center justify-center
          px-4 py-10 sm:px-6 lg:px-8
        "
        aria-live="assertive"
      >
        <div className="max-w-md text-center">
          <div
            className="
              mx-auto flex size-11 items-center
              justify-center rounded-full
              bg-[#fff0e7] text-orange-700
            "
          >
            <UserRound
              size={19}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </div>

          <h1
            className="
              mt-4 font-['Newsreader']
              text-2xl font-semibold
              text-[#10231f]
            "
          >
            We couldn't load your profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="
              mt-5 inline-flex min-h-10
              items-center justify-center
              rounded-md bg-teal-950 px-4
              text-sm font-semibold text-white
              transition-colors duration-200
              hover:bg-teal-900
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-teal-800
            "
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const pageEase = [0.22, 1, 0.36, 1];

  const handleSurfaceMove = (
    event,
    intensity = 2.3
  ) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse"
    ) {
      return;
    }

    const surface = event.currentTarget;
    const rect = surface.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const percentX = x / rect.width - 0.5;
    const percentY = y / rect.height - 0.5;

    surface.style.transform = `
      perspective(1100px)
      translate3d(
        ${percentX * 4}px,
        ${percentY * 4 - 2}px,
        0
      )
      rotateX(${-percentY * intensity}deg)
      rotateY(${percentX * intensity}deg)
    `;

    surface.style.setProperty(
      "--cursor-x",
      `${(x / rect.width) * 100}%`
    );

    surface.style.setProperty(
      "--cursor-y",
      `${(y / rect.height) * 100}%`
    );

    surface.style.setProperty(
      "--cursor-opacity",
      "1"
    );
  };

  const resetSurface = (event) => {
    if (prefersReducedMotion) return;

    const surface = event.currentTarget;

    surface.style.transform = `
      perspective(1100px)
      translate3d(0, 0, 0)
      rotateX(0deg)
      rotateY(0deg)
    `;

    surface.style.setProperty(
      "--cursor-opacity",
      "0"
    );
  };

  return (
    <div
      className="
        mx-auto w-full max-w-[1216px]
        px-4 py-8
        sm:px-6
        lg:px-8 lg:py-10
      "
    >
      {/* ================================================================== */}
      {/* PAGE HEADER                                                         */}
      {/* ================================================================== */}

      <motion.section
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 20 }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.65,
          ease: pageEase,
        }}
        aria-labelledby="profile-title"
      >
        <p
          className="
            text-[10px] font-bold uppercase
            tracking-[0.12em] text-teal-950
          "
        >
          My profile
        </p>

        <div
          className="
            mt-2 flex flex-col
            justify-between gap-5
            sm:flex-row sm:items-end
          "
        >
          <div>
            <motion.h1
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 14 }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: prefersReducedMotion
                  ? 0
                  : 0.6,
                delay: prefersReducedMotion
                  ? 0
                  : 0.08,
                ease: pageEase,
              }}
              id="profile-title"
              className="
                font-['Newsreader']
                text-4xl font-semibold
                leading-[1.02]
                tracking-[-0.035em]
                text-[#10231f]
                sm:text-5xl
              "
            >
              Your profile, your starting point.
            </motion.h1>

            <motion.p
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 12 }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: prefersReducedMotion
                  ? 0
                  : 0.55,
                delay: prefersReducedMotion
                  ? 0
                  : 0.18,
                ease: pageEase,
              }}
              className="
                mt-4 max-w-2xl
                text-sm leading-6
                text-stone-500
                sm:text-[15px]
              "
            >
              Keep your academic background, interests and
              career direction in one place so CampusX can
              build a clearer picture of where you are today.
            </motion.p>
          </div>

          <motion.button
            type="button"
            onClick={openEditProfile}
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, x: 12 }
            }
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: prefersReducedMotion
                ? 0
                : 0.55,
              delay: prefersReducedMotion
                ? 0
                : 0.25,
              ease: pageEase,
            }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : { y: -2 }
            }
            whileTap={
              prefersReducedMotion
                ? undefined
                : { scale: 0.98 }
            }
            className="
              inline-flex min-h-10 shrink-0
              items-center justify-center gap-2
              rounded-md
              border border-stone-300
              bg-white px-4
              text-sm font-semibold
              text-stone-700
              shadow-[0_3px_12px_rgba(28,25,23,0.04)]
              transition-[border-color,box-shadow,color]
              duration-200
              hover:border-teal-800/30
              hover:text-teal-950
              hover:shadow-[0_8px_20px_rgba(28,25,23,0.07)]
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-teal-800
            "
          >
            <Pencil
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            Edit profile
          </motion.button>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* PROFILE HERO                                                        */}
      {/* ================================================================== */}

      <motion.section
        initial={
          prefersReducedMotion
            ? {
                opacity: 1,
                y: 0,
                scale: 1,
              }
            : {
                opacity: 0,
                y: 28,
                scale: 0.985,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: prefersReducedMotion
            ? 0
            : 0.8,
          delay: prefersReducedMotion
            ? 0
            : 0.25,
          ease: pageEase,
        }}
        className="
          relative mt-8
          overflow-hidden rounded-lg
          border border-teal-950
          bg-teal-950
          p-6 text-white
          shadow-[0_18px_45px_rgba(6,78,59,0.12)]
          transition-[transform,box-shadow]
          duration-300 ease-out
          will-change-transform
          sm:p-8
        "
        onPointerMove={(event) =>
          handleSurfaceMove(event, 2.3)
        }
        onPointerLeave={resetSurface}
        style={{
          "--cursor-x": "50%",
          "--cursor-y": "50%",
          "--cursor-opacity": "0",
        }}
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 z-0
            opacity-[var(--cursor-opacity)]
            transition-opacity duration-200
          "
          style={{
            background:
              "radial-gradient(circle 220px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.16), transparent 72%)",
          }}
        />

        <motion.div
          aria-hidden="true"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, 12, 0],
                  y: [0, -8, 0],
                  scale: [1, 1.06, 1],
                }
          }
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            pointer-events-none
            absolute -right-10 -top-16
            size-56 rounded-full
            bg-orange-300/[0.07]
            blur-3xl
          "
        />

        <div
          className="
            relative grid gap-8
            lg:grid-cols-[1fr_auto]
            lg:items-center
          "
        >
          <div
            className="
              flex flex-col gap-5
              sm:flex-row sm:items-center
            "
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.75,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: prefersReducedMotion
                  ? 0
                  : 0.55,
                delay: prefersReducedMotion
                  ? 0
                  : 0.48,
                ease: pageEase,
              }}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      rotate: 3,
                      scale: 1.04,
                    }
              }
              className="
                flex size-20 shrink-0
                items-center justify-center
                rounded-full
                border border-white/10
                bg-white/[0.08]
                text-2xl font-semibold
                text-orange-300
                shadow-[0_10px_30px_rgba(0,0,0,0.12)]
                sm:size-24
              "
            >
              {profile.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) =>
                  part[0]?.toUpperCase()
                )
                .join("")}
            </motion.div>

            <div>
              <p
                className="
                  text-[10px]
                  font-semibold uppercase
                  tracking-[0.13em]
                  text-orange-300
                "
              >
                Student profile
              </p>

              <motion.h2
                initial={
                  prefersReducedMotion
                    ? false
                    : {
                        opacity: 0,
                        x: -10,
                      }
                }
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: prefersReducedMotion
                    ? 0
                    : 0.5,
                  delay: prefersReducedMotion
                    ? 0
                    : 0.55,
                  ease: pageEase,
                }}
                className="
                  mt-2
                  font-['Newsreader']
                  text-3xl font-semibold
                  tracking-[-0.025em]
                  sm:text-4xl
                "
              >
                {profile.name}
              </motion.h2>

              <p
                className="
                  mt-2 max-w-xl
                  text-sm leading-6
                  text-white/55
                "
              >
                {profile.degree}
              </p>

              <div className="mt-3 flex flex-wrap gap-3">
                <span
                  className="
                    inline-flex items-center
                    gap-1.5 text-xs
                    text-white/60
                  "
                >
                  <GraduationCap
                    size={13}
                    aria-hidden="true"
                  />

                  {profile.year}
                </span>

                <span
                  className="
                    inline-flex items-center
                    gap-1.5 text-xs
                    text-white/60
                  "
                >
                  <MapPin
                    size={13}
                    aria-hidden="true"
                  />

                  {profile.location}
                </span>
              </div>
            </div>
          </div>

          {/* PROFILE COMPLETION */}

          <motion.div
            initial={
              prefersReducedMotion
                ? false
                : {
                    opacity: 0,
                    x: 16,
                  }
            }
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: prefersReducedMotion
                ? 0
                : 0.55,
              delay: prefersReducedMotion
                ? 0
                : 0.62,
              ease: pageEase,
            }}
            className="
              min-w-[210px]
              rounded-md
              border border-white/10
              bg-white/[0.06]
              p-4
            "
          >
            <div className="flex items-center justify-between">
              <p
                className="
                  text-[9px]
                  font-bold uppercase
                  tracking-[0.12em]
                  text-white/40
                "
              >
                Profile completion
              </p>

              <motion.span
                key={profile.completion}
                initial={
                  prefersReducedMotion
                    ? false
                    : {
                        scale: 0.8,
                        opacity: 0,
                      }
                }
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                className="
                  text-sm font-semibold
                  text-orange-300
                "
              >
                {profile.completion}%
              </motion.span>
            </div>

            <div
              className="
                mt-3 h-1.5
                overflow-hidden rounded-full
                bg-white/10
              "
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{
                  width: `${profile.completion}%`,
                }}
                transition={{
                  duration: prefersReducedMotion
                    ? 0
                    : 1,
                  delay: prefersReducedMotion
                    ? 0
                    : 0.72,
                  ease: "easeOut",
                }}
                className="
                  h-full rounded-full
                  bg-orange-300
                "
              />
            </div>

            <p
              className="
                mt-3 text-[10px]
                leading-5 text-white/40
              "
            >
              Complete a few more details to make
              your career recommendations more useful.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* MAIN CONTENT                                                        */}
      {/* ================================================================== */}

      <section
        className="
          mt-5 grid gap-5
          lg:grid-cols-[1.35fr_0.65fr]
        "
      >
        <div className="space-y-5">
          {/* ABOUT */}

          <CursorCard
            intensity={2.3}
            delay={0.42}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
              sm:p-7
            "
          >
            <div className="flex items-center gap-2.5">
              <motion.span
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : {
                        rotate: 5,
                        scale: 1.06,
                      }
                }
                className="
                  flex size-9
                  items-center justify-center
                  rounded-md
                  bg-[#edf5f1]
                  text-teal-950
                "
              >
                <UserRound
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </motion.span>

              <div>
                <p
                  className="
                    text-[10px]
                    font-bold uppercase
                    tracking-[0.12em]
                    text-teal-950
                  "
                >
                  About you
                </p>

                <h2
                  className="
                    mt-1 text-xl
                    font-semibold
                    tracking-[-0.02em]
                  "
                >
                  A little context goes a long way.
                </h2>
              </div>
            </div>

            <p
              className="
                mt-5 max-w-2xl
                text-sm leading-7
                text-stone-600
              "
            >
              {profile.about}
            </p>
          </CursorCard>

          {/* EDUCATION */}

          <CursorCard
            intensity={2.2}
            delay={0.54}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
              sm:p-7
            "
          >
            <div
              className="
                flex items-start
                justify-between gap-4
              "
            >
              <div className="flex items-center gap-2.5">
                <motion.span
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          rotate: -4,
                          scale: 1.06,
                        }
                  }
                  className="
                    flex size-9
                    items-center justify-center
                    rounded-md
                    bg-[#fff0e7]
                    text-orange-700
                  "
                >
                  <GraduationCap
                    size={17}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </motion.span>

                <div>
                  <p
                    className="
                      text-[10px]
                      font-bold uppercase
                      tracking-[0.12em]
                      text-orange-700
                    "
                  >
                    Education
                  </p>

                  <h2
                    className="
                      mt-1 text-xl
                      font-semibold
                      tracking-[-0.02em]
                    "
                  >
                    Your academic foundation.
                  </h2>
                </div>
              </div>

              <motion.span
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: [0, -3, 0],
                      }
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  rounded-full
                  bg-[#f7f4ed]
                  px-3 py-1
                  text-[10px]
                  font-semibold
                  text-stone-600
                "
              >
                {profile.year}
              </motion.span>
            </div>

            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 10,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: prefersReducedMotion
                  ? 0
                  : 0.45,
                delay: prefersReducedMotion
                  ? 0
                  : 0.72,
              }}
              className="
                mt-5 rounded-md
                border border-stone-200
                bg-[#faf7f0]
                p-4
              "
            >
              <p
                className="
                  text-sm font-semibold
                  text-stone-800
                "
              >
                {profile.degree}
              </p>

              <p
                className="
                  mt-1.5 text-xs
                  text-stone-500
                "
              >
                Current academic program
              </p>
            </motion.div>
          </CursorCard>

          {/* SKILLS */}

          <CursorCard
            intensity={2.4}
            delay={0.66}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
              sm:p-7
            "
          >
            <div className="flex items-center gap-2.5">
              <motion.span
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        rotate: [0, 4, -4, 0],
                      }
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  flex size-9
                  items-center justify-center
                  rounded-md
                  bg-[#edf5f1]
                  text-teal-950
                "
              >
                <Sparkles
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </motion.span>

              <div>
                <p
                  className="
                    text-[10px]
                    font-bold uppercase
                    tracking-[0.12em]
                    text-teal-950
                  "
                >
                  Skills
                </p>

                <h2
                  className="
                    mt-1 text-xl
                    font-semibold
                    tracking-[-0.02em]
                  "
                >
                  What you're building with.
                </h2>
              </div>
            </div>

            <motion.div
              layout
              className="
                mt-6 flex
                flex-wrap gap-2
              "
            >
              {profile.skills.map(
                (skill, index) => (
                  <motion.span
                    key={skill}
                    initial={
                      prefersReducedMotion
                        ? false
                        : {
                            opacity: 0,
                            scale: 0.88,
                            y: 5,
                          }
                    }
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    transition={{
                      duration:
                        prefersReducedMotion
                          ? 0
                          : 0.35,
                      delay:
                        prefersReducedMotion
                          ? 0
                          : 0.82 +
                            index * 0.05,
                    }}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            y: -2,
                            scale: 1.02,
                          }
                    }
                    className="
                      inline-flex
                      items-center gap-2
                      rounded-full
                      border border-teal-900/10
                      bg-[#edf5f1]
                      px-3 py-1.5
                      text-xs font-medium
                      text-teal-950
                    "
                  >
                    <Check
                      size={11}
                      strokeWidth={2.2}
                      aria-hidden="true"
                    />

                    {skill}
                  </motion.span>
                )
              )}
            </motion.div>
          </CursorCard>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN                                                        */}
        {/* ================================================================== */}

        <aside className="space-y-5">
          {/* CONTACT */}

          <CursorCard
            intensity={2.2}
            delay={0.48}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
            "
          >
            <p
              className="
                text-[10px]
                font-bold uppercase
                tracking-[0.12em]
                text-teal-950
              "
            >
              Contact
            </p>

            <div className="mt-5 space-y-4">
              <motion.div
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : { x: 3 }
                }
                className="
                  flex items-center gap-3
                "
              >
                <span
                  className="
                    flex size-9 shrink-0
                    items-center justify-center
                    rounded-md
                    bg-[#f7f4ed]
                    text-stone-600
                  "
                >
                  <Mail
                    size={15}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </span>

                <div className="min-w-0">
                  <p
                    className="
                      text-[9px]
                      uppercase tracking-[0.1em]
                      text-stone-400
                    "
                  >
                    Email
                  </p>

                  <p
                    className="
                      mt-0.5 truncate
                      text-xs font-medium
                      text-stone-700
                    "
                  >
                    {profile.email}
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : { x: 3 }
                }
                className="
                  flex items-center gap-3
                "
              >
                <span
                  className="
                    flex size-9 shrink-0
                    items-center justify-center
                    rounded-md
                    bg-[#f7f4ed]
                    text-stone-600
                  "
                >
                  <MapPin
                    size={15}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </span>

                <div className="min-w-0">
                  <p
                    className="
                      text-[9px]
                      uppercase tracking-[0.1em]
                      text-stone-400
                    "
                  >
                    Location
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-xs font-medium
                      text-stone-700
                    "
                  >
                    {profile.location}
                  </p>
                </div>
              </motion.div>
            </div>
          </CursorCard>

          {/* CAREER GOAL */}

          <CursorCard
            intensity={2.3}
            delay={0.62}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
            "
          >
            <div
              className="
                flex items-start
                justify-between gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-bold uppercase
                    tracking-[0.12em]
                    text-teal-950
                  "
                >
                  Career direction
                </p>

                <h2
                  className="
                    mt-2 text-xl
                    font-semibold
                    tracking-[-0.02em]
                  "
                >
                  Where you're heading.
                </h2>
              </div>

              <motion.span
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: [0, -3, 0],
                      }
                }
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  flex size-9
                  items-center justify-center
                  rounded-md
                  bg-[#fff0e7]
                  text-orange-700
                "
              >
                <Target
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </motion.span>
            </div>

            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.96,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: prefersReducedMotion
                  ? 0
                  : 0.5,
                delay: prefersReducedMotion
                  ? 0
                  : 0.78,
              }}
              className="
                mt-5 rounded-md
                border border-teal-900/10
                bg-[#edf5f1]
                p-4
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase tracking-[0.12em]
                  text-teal-900/50
                "
              >
                Current goal
              </p>

              <p
                className="
                  mt-1.5
                  font-['Newsreader']
                  text-2xl font-semibold
                  tracking-[-0.02em]
                  text-teal-950
                "
              >
                {profile.careerGoal}
              </p>
            </motion.div>
          </CursorCard>

          {/* RESUME CTA */}

          <motion.a
            href="/resume-analysis"
            initial={
              prefersReducedMotion
                ? {
                    opacity: 1,
                    y: 0,
                  }
                : {
                    opacity: 0,
                    y: 22,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration:
                prefersReducedMotion
                  ? 0
                  : 0.65,
              delay:
                prefersReducedMotion
                  ? 0
                  : 0.82,
              ease: pageEase,
            }}
            className="
              group block
              rounded-lg
              border border-teal-950
              bg-teal-950
              p-6 text-white
              shadow-[0_12px_32px_rgba(6,78,59,0.10)]
              transition-shadow duration-300
              hover:shadow-[0_22px_42px_rgba(6,78,59,0.18)]
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-teal-800
              transition-[transform,box-shadow]
              duration-300 ease-out
              will-change-transform
            "
            onPointerMove={(event) =>
              handleSurfaceMove(event, 2.3)
            }
            onPointerLeave={resetSurface}
            style={{
              "--cursor-x": "50%",
              "--cursor-y": "50%",
              "--cursor-opacity": "0",
            }}
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute inset-0 z-0
                opacity-[var(--cursor-opacity)]
                transition-opacity duration-200
              "
              style={{
                background:
                  "radial-gradient(circle 220px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.16), transparent 72%)",
              }}
            />

            <div
              className="
                flex size-10
                items-center justify-center
                rounded-md
                bg-white/[0.08]
                text-orange-300
              "
            >
              <FileText
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <p
              className="
                mt-5 text-[10px]
                font-bold uppercase
                tracking-[0.12em]
                text-orange-300
              "
            >
              Strengthen your profile
            </p>

            <h2
              className="
                mt-2 text-xl
                font-semibold
                tracking-[-0.02em]
              "
            >
              Analyse your resume next.
            </h2>

            <p
              className="
                mt-2 text-xs
                leading-5 text-white/55
              "
            >
              Get another useful signal about
              your current career readiness.
            </p>

            <span
              className="
                mt-5 inline-flex
                items-center gap-2
                text-xs font-semibold
                text-white
              "
            >
              Analyse resume

              <ArrowRight
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1.5
                "
              />
            </span>
          </motion.a>
        </aside>
      </section>

      {/* ================================================================== */}
      {/* BOTTOM CAREER NOTE                                                  */}
      {/* ================================================================== */}

      <CursorCard
        intensity={1.8}
        delay={1.02}
        className="
          mt-6
          rounded-md
          border border-stone-200
          bg-white/60
          px-5 py-4
        "
      >
        <div
          className="
            flex items-start gap-3
          "
        >
          <motion.span
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    rotate: [0, 8, -8, 0],
                  }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              mt-0.5 shrink-0
              text-teal-900
            "
          >
            <Sparkles
              size={15}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </motion.span>

          <p
            className="
              text-[11px]
              leading-5 text-stone-500
            "
          >
            Your profile is not meant to stay fixed.
            Keep updating it as you learn, build projects
            and discover what kind of work you enjoy.
          </p>
        </div>
      </CursorCard>

      {/* ================================================================== */}
      {/* EDIT PROFILE MODAL                                                  */}
      {/* ================================================================== */}

      {isEditingSkills && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-teal-950/30
            px-4 py-6
            backdrop-blur-[3px]
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
        >
          <motion.div
            initial={
              prefersReducedMotion
                ? false
                : {
                    opacity: 0,
                    y: 18,
                    scale: 0.97,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: prefersReducedMotion
                ? 0
                : 0.35,
              ease: pageEase,
            }}
            className="
              w-full max-w-lg
              overflow-hidden
              rounded-xl
              border border-stone-200
              bg-[#faf7f0]
              shadow-[0_28px_80px_rgba(28,25,23,0.18)]
            "
          >
            {/* MODAL HEADER */}

            <div
              className="
                flex items-start
                justify-between
                gap-4
                border-b border-stone-200
                bg-white
                px-6 py-5
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-bold uppercase
                    tracking-[0.12em]
                    text-teal-950
                  "
                >
                  Edit profile
                </p>

                <h2
                  id="edit-profile-title"
                  className="
                    mt-1
                    font-['Newsreader']
                    text-2xl font-semibold
                    tracking-[-0.025em]
                    text-[#10231f]
                  "
                >
                  Keep your skills current.
                </h2>

                <p
                  className="
                    mt-2 max-w-md
                    text-xs leading-5
                    text-stone-500
                  "
                >
                  Update the technical skills you want
                  CampusX to use for your career-readiness
                  journey.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditProfile}
                disabled={isSavingSkills}
                aria-label="Close edit profile"
                className="
                  flex size-9 shrink-0
                  items-center justify-center
                  rounded-md
                  text-stone-500
                  transition-colors duration-200
                  hover:bg-stone-100
                  hover:text-stone-800
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-teal-800
                  disabled:pointer-events-none
                  disabled:opacity-50
                "
              >
                <X
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="px-6 py-6">
              <label
                htmlFor="technical-skill-input"
                className="
                  text-[10px]
                  font-bold uppercase
                  tracking-[0.12em]
                  text-teal-950
                "
              >
                Technical skills
              </label>

              <div className="mt-3 flex gap-2">
                <input
                  id="technical-skill-input"
                  type="text"
                  value={skillInput}
                  onChange={(event) =>
                    setSkillInput(event.target.value)
                  }
                  onKeyDown={
                    handleSkillInputKeyDown
                  }
                  placeholder="e.g. React"
                  disabled={isSavingSkills}
                  className="
                    min-h-11
                    min-w-0 flex-1
                    rounded-md
                    border border-stone-300
                    bg-white
                    px-3
                    text-sm text-stone-800
                    outline-none
                    placeholder:text-stone-400
                    transition-[border-color,box-shadow]
                    duration-200
                    focus:border-teal-800
                    focus:ring-2
                    focus:ring-teal-900/10
                    disabled:bg-stone-100
                  "
                />

                <button
                  type="button"
                  onClick={addSkill}
                  disabled={
                    isSavingSkills ||
                    !skillInput.trim()
                  }
                  className="
                    inline-flex
                    min-h-11
                    shrink-0
                    items-center
                    justify-center
                    gap-1.5
                    rounded-md
                    bg-teal-950
                    px-4
                    text-sm font-semibold
                    text-white
                    transition-[background-color,transform]
                    duration-200
                    hover:bg-teal-900
                    active:scale-[0.98]
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-teal-800
                    disabled:pointer-events-none
                    disabled:opacity-40
                  "
                >
                  <Plus
                    size={15}
                    strokeWidth={2}
                    aria-hidden="true"
                  />

                  Add
                </button>
              </div>

              <p
                className="
                  mt-2 text-[11px]
                  text-stone-400
                "
              >
                Press Enter or use Add to include a skill.
              </p>

              {/* SKILL CHIPS */}

              <div
                className="
                  mt-5
                  min-h-24
                  rounded-md
                  border border-stone-200
                  bg-white
                  p-4
                "
              >
                {skillsDraft.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillsDraft.map((skill) => (
                      <motion.span
                        key={skill}
                        initial={
                          prefersReducedMotion
                            ? false
                            : {
                                opacity: 0,
                                scale: 0.9,
                              }
                        }
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          border border-teal-900/10
                          bg-[#edf5f1]
                          px-3 py-1.5
                          text-xs font-medium
                          text-teal-950
                        "
                      >
                        {skill}

                        <button
                          type="button"
                          onClick={() =>
                            removeSkill(skill)
                          }
                          disabled={isSavingSkills}
                          aria-label={`Remove ${skill}`}
                          className="
                            rounded-full
                            text-teal-900/50
                            transition-colors
                            duration-150
                            hover:text-orange-700
                            focus-visible:outline-2
                            focus-visible:outline-offset-1
                            focus-visible:outline-teal-800
                          "
                        >
                          <X
                            size={12}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <p
                    className="
                      text-xs text-stone-400
                    "
                  >
                    No technical skills added yet.
                  </p>
                )}
              </div>

              {/* STATUS */}

              {saveError && (
                <p
                  className="
                    mt-4
                    rounded-md
                    border border-red-200
                    bg-red-50
                    px-3 py-2.5
                    text-xs
                    leading-5
                    text-red-700
                  "
                  role="alert"
                >
                  {saveError}
                </p>
              )}

              {saveSuccess && (
                <p
                  className="
                    mt-4
                    rounded-md
                    border border-teal-900/10
                    bg-[#edf5f1]
                    px-3 py-2.5
                    text-xs
                    leading-5
                    text-teal-950
                  "
                  role="status"
                  aria-live="polite"
                >
                  {saveSuccess}
                </p>
              )}
            </div>

            {/* MODAL FOOTER */}

            <div
              className="
                flex flex-col-reverse
                gap-2
                border-t border-stone-200
                bg-white
                px-6 py-4
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={closeEditProfile}
                disabled={isSavingSkills}
                className="
                  min-h-10
                  rounded-md
                  border border-stone-300
                  bg-white
                  px-4
                  text-sm font-semibold
                  text-stone-700
                  transition-colors duration-200
                  hover:border-stone-400
                  hover:bg-stone-50
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-teal-800
                  disabled:pointer-events-none
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveSkills}
                disabled={isSavingSkills}
                className="
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-md
                  bg-teal-950
                  px-5
                  text-sm font-semibold
                  text-white
                  transition-[background-color,transform]
                  duration-200
                  hover:bg-teal-900
                  active:scale-[0.98]
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-teal-800
                  disabled:pointer-events-none
                  disabled:opacity-60
                "
              >
                {isSavingSkills ? (
                  <>
                    <span
                      className="
                        size-3.5
                        animate-spin
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                      "
                      aria-hidden="true"
                    />

                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;