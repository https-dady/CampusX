const stats = [
  {
    value: "40+",
    label: "career paths mapped",
  },
  {
    value: "1,200+",
    label: "skills in our library",
  },
  {
    value: "350+",
    label: "learning sources",
  },
  {
    value: "92%",
    label: "feel clearer after assessment",
  },
];

const StatsSection = () => {
  return (
    <section
      className="border-b border-stone-200 bg-white"
      aria-label="CampusX platform statistics"
    >
      <div className="mx-auto grid max-w-[1216px] grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={[
              "group flex min-h-[116px] flex-col items-center justify-center px-4 py-6 text-center transition-colors duration-200 hover:bg-[#faf7f0] sm:min-h-[124px] sm:px-5",
              index < 2
                ? "border-b border-stone-200 lg:border-b-0"
                : "",
              index % 2 === 0
                ? "border-r border-stone-200"
                : "",
              index < 3
                ? "lg:border-r lg:border-stone-200"
                : "",
              index === 3 ? "lg:border-r-0" : "",
            ].join(" ")}
          >
            {/* Statistic */}
            <p className="font-['Newsreader'] text-[29px] font-semibold leading-none tracking-[-0.02em] text-teal-950 transition-transform duration-200 group-hover:-translate-y-0.5 sm:text-[31px]">
              {stat.value}
            </p>

            {/* Label */}
            <p className="mt-2 max-w-[160px] text-[10px] leading-4 text-stone-500 transition-colors duration-200 group-hover:text-stone-700 sm:text-[11px]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;