import dotenv from "dotenv";
import dns from "node:dns";
import mongoose from "mongoose";

import LearningRoadmap from "../models/learning-roadmap.model.js";

dotenv.config();

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

const MONGO_URI =
  process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(
    "MONGO_URI is not defined in .env"
  );

  process.exit(1);
}

const step = (
  title,
  technologies,
  prerequisites = [],
  description = ""
) => ({
  title,

  description:
    description ||
    `Build practical understanding of ${technologies.join(
      ", "
    )} as part of the ${title.toLowerCase()} stage.`,

  technologies,

  prerequisites,
});

const roadmap = (
  domain,
  steps
) => ({
  domain,

  steps: steps.map(
    (item, index) => ({
      ...item,
      order: index + 1,
    })
  ),
});

/*
 * This file is the database seed/catalog, not runtime roadmap logic.
 * The application reads roadmap data from MongoDB and the personalized
 * roadmap engine resolves prerequisites dynamically.
 *
 * Adding a new technical field therefore means adding/updating data here,
 * not adding domain-specific if/else logic to React or the API service.
 */

const learningRoadmaps = [
  roadmap(
    "Web Development",
    [
      step(
        "Web Development Foundations",
        ["Web Development"],
        [
          "HTML",
          "CSS",
          "JavaScript",
        ]
      ),

      step(
        "HTML",
        ["HTML"]
      ),

      step(
        "CSS",
        ["CSS"],
        ["HTML"]
      ),

      step(
        "JavaScript",
        ["JavaScript"],
        [
          "HTML",
          "CSS",
        ]
      ),

      step(
        "Git and GitHub",
        [
          "Git",
          "GitHub",
        ],
        ["JavaScript"]
      ),

      step(
        "TypeScript",
        ["TypeScript"],
        ["JavaScript"]
      ),

      step(
        "React",
        ["React"],
        [
          "JavaScript",
          "HTML",
          "CSS",
        ]
      ),

      step(
        "Node.js",
        ["Node.js"],
        ["JavaScript"]
      ),

      step(
        "Express.js and REST APIs",
        [
          "Express.js",
          "REST APIs",
        ],
        ["Node.js"]
      ),

      step(
        "MongoDB",
        ["MongoDB"],
        [
          "Node.js",
          "REST APIs",
        ]
      ),

      step(
        "Authentication and Security",
        [
          "Authentication",
          "Web Security",
        ],
        ["REST APIs"]
      ),

      step(
        "Testing and Deployment",
        [
          "Testing",
          "Deployment",
        ],
        [
          "React",
          "Express.js",
        ]
      ),
    ]
  ),

  roadmap(
    "Software Development",
    [
      step(
        "Software Development Foundations",
        ["Software Development"],
        [
          "Programming Fundamentals",
          "Git",
        ]
      ),

      step(
        "Programming Fundamentals",
        ["Programming Fundamentals"]
      ),

      step(
        "Data Structures and Algorithms",
        [
          "Data Structures",
          "Algorithms",
        ],
        ["Programming Fundamentals"]
      ),

      step(
        "Object-Oriented Programming",
        ["OOP"],
        ["Programming Fundamentals"]
      ),

      step(
        "Databases",
        [
          "DBMS",
          "SQL",
        ],
        ["Programming Fundamentals"]
      ),

      step(
        "Software Engineering",
        ["Software Engineering"],
        [
          "OOP",
          "Data Structures",
        ]
      ),

      step(
        "Testing",
        ["Testing"],
        ["Software Engineering"]
      ),

      step(
        "System Design",
        ["System Design"],
        [
          "Software Engineering",
          "Databases",
        ]
      ),

      step(
        "Git and Collaboration",
        [
          "Git",
          "GitHub",
        ],
        ["Programming Fundamentals"]
      ),
    ]
  ),

  roadmap(
    "Computer Science and Engineering",
    [
      step(
        "CSE Foundations",
        ["Computer Science"],
        [
          "Programming Fundamentals",
          "Data Structures",
        ]
      ),

      step(
        "Programming Fundamentals",
        ["Programming Fundamentals"]
      ),

      step(
        "Data Structures and Algorithms",
        [
          "Data Structures",
          "Algorithms",
        ],
        ["Programming Fundamentals"]
      ),

      step(
        "Object-Oriented Programming",
        ["OOP"],
        ["Programming Fundamentals"]
      ),

      step(
        "Database Systems",
        [
          "DBMS",
          "SQL",
        ],
        ["Programming Fundamentals"]
      ),

      step(
        "Operating Systems",
        ["Operating Systems"],
        [
          "Data Structures",
          "OOP",
        ]
      ),

      step(
        "Computer Networks",
        ["Computer Networks"],
        ["Operating Systems"]
      ),

      step(
        "Software Engineering",
        ["Software Engineering"],
        [
          "OOP",
          "Data Structures",
        ]
      ),

      step(
        "System Design",
        ["System Design"],
        [
          "Computer Networks",
          "DBMS",
        ]
      ),
    ]
  ),

  roadmap(
    "Information Technology",
    [
      step(
        "IT Foundations",
        ["Information Technology"],
        [
          "Programming Fundamentals",
          "Networking",
        ]
      ),

      step(
        "Programming Fundamentals",
        ["Programming Fundamentals"]
      ),

      step(
        "Data Structures",
        ["Data Structures"],
        ["Programming Fundamentals"]
      ),

      step(
        "Database Systems",
        [
          "DBMS",
          "SQL",
        ],
        ["Programming Fundamentals"]
      ),

      step(
        "Computer Networks",
        [
          "Computer Networks",
          "Networking",
        ],
        ["Data Structures"]
      ),

      step(
        "Web Technologies",
        ["Web Development"],
        [
          "Programming Fundamentals",
          "Networking",
        ]
      ),

      step(
        "Cloud and DevOps",
        [
          "Cloud Computing",
          "DevOps",
        ],
        [
          "Computer Networks",
          "Web Development",
        ]
      ),

      step(
        "Cyber Security Foundations",
        ["Cyber Security"],
        [
          "Networking",
          "Operating Systems",
        ]
      ),
    ]
  ),

  roadmap(
    "Artificial Intelligence",
    [
      step(
        "Artificial Intelligence Foundations",
        ["Artificial Intelligence"],
        [
          "Python",
          "Mathematics",
          "Data Structures",
        ]
      ),

      step(
        "Python",
        ["Python"]
      ),

      step(
        "Mathematics for AI",
        [
          "Mathematics",
          "Linear Algebra",
          "Probability",
        ],
        ["Python"]
      ),

      step(
        "Data Structures for AI",
        ["Data Structures"],
        ["Python"]
      ),

      step(
        "Machine Learning",
        ["Machine Learning"],
        [
          "Python",
          "Mathematics",
          "Probability",
        ]
      ),

      step(
        "Deep Learning",
        ["Deep Learning"],
        ["Machine Learning"]
      ),

      step(
        "Natural Language Processing",
        ["NLP"],
        [
          "Machine Learning",
          "Deep Learning",
        ]
      ),

      step(
        "Computer Vision",
        ["Computer Vision"],
        [
          "Machine Learning",
          "Deep Learning",
        ]
      ),

      step(
        "Generative AI",
        ["Generative AI"],
        [
          "Deep Learning",
          "NLP",
        ]
      ),
    ]
  ),

  roadmap(
    "Machine Learning",
    [
      step(
        "Machine Learning Foundations",
        ["Machine Learning"],
        [
          "Python",
          "Statistics",
          "Linear Algebra",
        ]
      ),

      step(
        "Python",
        ["Python"]
      ),

      step(
        "Statistics and Probability",
        [
          "Statistics",
          "Probability",
        ],
        ["Python"]
      ),

      step(
        "Linear Algebra",
        ["Linear Algebra"],
        ["Mathematics"]
      ),

      step(
        "NumPy",
        ["NumPy"],
        [
          "Python",
          "Linear Algebra",
        ]
      ),

      step(
        "Pandas",
        ["Pandas"],
        [
          "Python",
          "NumPy",
        ]
      ),

      step(
        "Data Visualization",
        ["Data Visualization"],
        [
          "Pandas",
          "Statistics",
        ]
      ),

      step(
        "Supervised Learning",
        ["Supervised Learning"],
        [
          "Machine Learning",
          "Pandas",
        ]
      ),

      step(
        "Unsupervised Learning",
        ["Unsupervised Learning"],
        [
          "Machine Learning",
          "Pandas",
        ]
      ),

      step(
        "Scikit-learn",
        ["Scikit-learn"],
        [
          "Supervised Learning",
          "Unsupervised Learning",
        ]
      ),

      step(
        "Machine Learning Projects",
        ["Machine Learning Projects"],
        ["Scikit-learn"]
      ),
    ]
  ),

  roadmap(
    "Artificial Intelligence and Data Science",
    [
      step(
        "AI and Data Science Foundations",
        ["AI and Data Science"],
        [
          "Python",
          "Statistics",
          "SQL",
        ]
      ),

      step(
        "Python",
        ["Python"]
      ),

      step(
        "Statistics",
        [
          "Statistics",
          "Probability",
        ],
        ["Python"]
      ),

      step(
        "SQL",
        ["SQL"]
      ),

      step(
        "Data Analysis",
        [
          "Data Analytics",
          "Pandas",
        ],
        [
          "Python",
          "SQL",
          "Statistics",
        ]
      ),

      step(
        "Machine Learning",
        ["Machine Learning"],
        [
          "Python",
          "Statistics",
          "Pandas",
        ]
      ),

      step(
        "Deep Learning",
        ["Deep Learning"],
        ["Machine Learning"]
      ),

      step(
        "Generative AI",
        ["Generative AI"],
        ["Deep Learning"]
      ),

      step(
        "AI and Data Science Projects",
        ["AI and Data Science Projects"],
        [
          "Machine Learning",
          "Data Analytics",
        ]
      ),
    ]
  ),

  roadmap(
    "AI and Machine Learning",
    [
      step(
        "AI and ML Foundations",
        ["AI and Machine Learning"],
        [
          "Python",
          "Mathematics",
          "Statistics",
        ]
      ),

      step(
        "Python",
        ["Python"]
      ),

      step(
        "Statistics",
        [
          "Statistics",
          "Probability",
        ],
        ["Python"]
      ),

      step(
        "NumPy",
        ["NumPy"],
        [
          "Python",
          "Mathematics",
        ]
      ),

      step(
        "Pandas",
        ["Pandas"],
        [
          "Python",
          "NumPy",
        ]
      ),

      step(
        "Data Visualization",
        ["Data Visualization"],
        ["Pandas"]
      ),

      step(
        "Machine Learning",
        ["Machine Learning"],
        [
          "Python",
          "Statistics",
          "NumPy",
          "Pandas",
        ]
      ),

      step(
        "Scikit-learn",
        ["Scikit-learn"],
        ["Machine Learning"]
      ),

      step(
        "Deep Learning",
        ["Deep Learning"],
        ["Machine Learning"]
      ),

      step(
        "Generative AI",
        ["Generative AI"],
        [
          "Deep Learning",
          "NLP",
        ]
      ),
    ]
  ),

  roadmap(
    "Data Science",
    [
      step(
        "Data Science Foundations",
        ["Data Science"],
        [
          "Python",
          "Statistics",
          "SQL",
        ]
      ),

      step(
        "Python",
        ["Python"]
      ),

      step(
        "Statistics and Probability",
        [
          "Statistics",
          "Probability",
        ],
        ["Python"]
      ),

      step(
        "SQL",
        ["SQL"]
      ),

      step(
        "NumPy",
        ["NumPy"],
        ["Python"]
      ),

      step(
        "Pandas",
        ["Pandas"],
        [
          "Python",
          "NumPy",
        ]
      ),

      step(
        "Data Visualization",
        ["Data Visualization"],
        [
          "Pandas",
          "Statistics",
        ]
      ),

      step(
        "Machine Learning",
        ["Machine Learning"],
        [
          "Python",
          "Statistics",
          "Pandas",
          "NumPy",
        ]
      ),

      step(
        "Scikit-learn",
        ["Scikit-learn"],
        ["Machine Learning"]
      ),

      step(
        "Data Science Projects",
        ["Data Science Projects"],
        [
          "Pandas",
          "SQL",
          "Machine Learning",
        ]
      ),
    ]
  ),

  roadmap(
    "Data Analytics",
    [
      step(
        "Data Analytics Foundations",
        ["Data Analytics"],
        [
          "Excel",
          "SQL",
          "Statistics",
        ]
      ),

      step(
        "Excel",
        ["Excel"]
      ),

      step(
        "Statistics",
        ["Statistics"]
      ),

      step(
        "SQL",
        ["SQL"]
      ),

      step(
        "Python for Analytics",
        ["Python"],
        ["Statistics"]
      ),

      step(
        "Pandas",
        ["Pandas"],
        [
          "Python",
          "SQL",
        ]
      ),

      step(
        "Data Visualization",
        [
          "Data Visualization",
          "Power BI",
        ],
        [
          "Pandas",
          "Statistics",
        ]
      ),

      step(
        "Analytics Projects",
        ["Analytics Projects"],
        [
          "SQL",
          "Power BI",
          "Data Visualization",
        ]
      ),
    ]
  ),

  roadmap(
    "Cyber Security",
    [
      step(
        "Cyber Security Foundations",
        ["Cyber Security"],
        [
          "Networking",
          "Operating Systems",
        ]
      ),

      step(
        "Computer Networks",
        [
          "Networking",
          "Computer Networks",
        ]
      ),

      step(
        "Operating Systems",
        ["Operating Systems"],
        ["Networking"]
      ),

      step(
        "Linux",
        ["Linux"],
        ["Operating Systems"]
      ),

      step(
        "Web Security",
        ["Web Security"],
        [
          "Networking",
          "Linux",
        ]
      ),

      step(
        "Ethical Hacking",
        ["Ethical Hacking"],
        [
          "Web Security",
          "Linux",
        ]
      ),

      step(
        "Digital Forensics",
        ["Digital Forensics"],
        [
          "Linux",
          "Cyber Security",
        ]
      ),

      step(
        "Security Operations",
        [
          "SOC",
          "Security Operations",
        ],
        [
          "Cyber Security",
          "Networking",
        ]
      ),
    ]
  ),

  roadmap(
    "Cloud Computing",
    [
      step(
        "Cloud Computing Foundations",
        ["Cloud Computing"],
        [
          "Networking",
          "Linux",
        ]
      ),

      step(
        "Networking",
        [
          "Networking",
          "Computer Networks",
        ]
      ),

      step(
        "Linux",
        ["Linux"],
        ["Operating Systems"]
      ),

      step(
        "Virtualization",
        ["Virtualization"],
        ["Linux"]
      ),

      step(
        "Cloud Services",
        [
          "AWS",
          "Azure",
          "Google Cloud",
        ],
        [
          "Cloud Computing",
          "Networking",
        ]
      ),

      step(
        "Cloud Security",
        ["Cloud Security"],
        [
          "Cloud Computing",
          "Cyber Security",
        ]
      ),

      step(
        "Cloud Projects",
        ["Cloud Projects"],
        ["Cloud Services"]
      ),
    ]
  ),

  roadmap(
    "DevOps",
    [
      step(
        "DevOps Foundations",
        ["DevOps"],
        [
          "Linux",
          "Git",
          "Networking",
        ]
      ),

      step(
        "Linux",
        ["Linux"]
      ),

      step(
        "Git and GitHub",
        [
          "Git",
          "GitHub",
        ]
      ),

      step(
        "Shell and Automation",
        ["Shell Scripting"],
        ["Linux"]
      ),

      step(
        "CI/CD",
        ["CI/CD"],
        [
          "Git",
          "Shell Scripting",
        ]
      ),

      step(
        "Docker",
        ["Docker"],
        ["Linux"]
      ),

      step(
        "Kubernetes",
        ["Kubernetes"],
        [
          "Docker",
          "Networking",
        ]
      ),

      step(
        "Infrastructure as Code",
        ["Terraform"],
        [
          "Cloud Computing",
          "Docker",
        ]
      ),

      step(
        "Monitoring",
        [
          "Monitoring",
          "Observability",
        ],
        [
          "Cloud Computing",
          "Kubernetes",
        ]
      ),
    ]
  ),

  roadmap(
    "Mobile App Development",
    [
      step(
        "Mobile Development Foundations",
        ["Mobile App Development"],
        ["Programming Fundamentals"]
      ),

      step(
        "Programming Fundamentals",
        ["Programming Fundamentals"]
      ),

      step(
        "Android Development",
        ["Android"],
        ["Programming Fundamentals"]
      ),

      step(
        "Kotlin",
        ["Kotlin"],
        ["Programming Fundamentals"]
      ),

      step(
        "Flutter",
        ["Flutter"],
        ["Programming Fundamentals"]
      ),

      step(
        "React Native",
        ["React Native"],
        [
          "JavaScript",
          "React",
        ]
      ),

      step(
        "Mobile APIs and Storage",
        [
          "Mobile APIs",
          "Mobile Databases",
        ],
        ["Android"]
      ),

      step(
        "Mobile Testing and Release",
        [
          "Mobile Testing",
          "App Deployment",
        ],
        ["Mobile APIs"]
      ),
    ]
  ),

  roadmap(
    "Internet of Things",
    [
      step(
        "IoT Foundations",
        ["IoT"],
        [
          "Electronics",
          "Networking",
          "Programming Fundamentals",
        ]
      ),

      step(
        "Electronics Fundamentals",
        ["Electronics"]
      ),

      step(
        "Programming Fundamentals",
        ["Programming Fundamentals"]
      ),

      step(
        "Embedded Systems",
        ["Embedded Systems"],
        [
          "Electronics",
          "Programming Fundamentals",
        ]
      ),

      step(
        "Microcontrollers",
        ["Microcontrollers"],
        ["Embedded Systems"]
      ),

      step(
        "Sensors and Actuators",
        [
          "Sensors",
          "Actuators",
        ],
        ["Electronics"]
      ),

      step(
        "IoT Networking",
        ["IoT Networking"],
        [
          "Networking",
          "Embedded Systems",
        ]
      ),

      step(
        "IoT Cloud and Security",
        [
          "IoT Cloud",
          "IoT Security",
        ],
        ["IoT Networking"]
      ),
    ]
  ),

  roadmap(
    "Electronics and Communication Engineering",
    [
      step(
        "ECE Foundations",
        ["Electronics and Communication"],
        [
          "Circuit Theory",
          "Digital Electronics",
        ]
      ),

      step(
        "Circuit Theory",
        ["Circuit Theory"]
      ),

      step(
        "Digital Electronics",
        ["Digital Electronics"],
        ["Circuit Theory"]
      ),

      step(
        "Analog Electronics",
        ["Analog Electronics"],
        ["Circuit Theory"]
      ),

      step(
        "Signals and Systems",
        ["Signals and Systems"],
        ["Mathematics"]
      ),

      step(
        "Communication Systems",
        ["Communication Systems"],
        ["Signals and Systems"]
      ),

      step(
        "Microcontrollers",
        ["Microcontrollers"],
        ["Digital Electronics"]
      ),

      step(
        "Embedded Systems",
        ["Embedded Systems"],
        ["Microcontrollers"]
      ),
    ]
  ),

  roadmap(
    "Electrical Engineering",
    [
      step(
        "Electrical Engineering Foundations",
        ["Electrical Engineering"],
        [
          "Circuit Theory",
          "Mathematics",
        ]
      ),

      step(
        "Circuit Theory",
        ["Circuit Theory"]
      ),

      step(
        "Electrical Machines",
        ["Electrical Machines"],
        ["Circuit Theory"]
      ),

      step(
        "Power Systems",
        ["Power Systems"],
        ["Electrical Machines"]
      ),

      step(
        "Power Electronics",
        ["Power Electronics"],
        [
          "Digital Electronics",
          "Electrical Machines",
        ]
      ),

      step(
        "Control Systems",
        ["Control Systems"],
        [
          "Mathematics",
          "Electrical Machines",
        ]
      ),

      step(
        "Electrical Drives",
        ["Electrical Drives"],
        [
          "Power Electronics",
          "Control Systems",
        ]
      ),
    ]
  ),

  roadmap(
    "Mechanical Engineering",
    [
      step(
        "Mechanical Engineering Foundations",
        ["Mechanical Engineering"],
        [
          "Engineering Mechanics",
          "Manufacturing",
        ]
      ),

      step(
        "Engineering Mechanics",
        ["Engineering Mechanics"]
      ),

      step(
        "Thermodynamics",
        ["Thermodynamics"],
        ["Engineering Mathematics"]
      ),

      step(
        "Fluid Mechanics",
        ["Fluid Mechanics"],
        [
          "Engineering Mathematics",
          "Thermodynamics",
        ]
      ),

      step(
        "Manufacturing",
        ["Manufacturing"],
        ["Engineering Mechanics"]
      ),

      step(
        "CAD and Design",
        [
          "CAD",
          "Mechanical Design",
        ],
        [
          "Engineering Mechanics",
          "Manufacturing",
        ]
      ),

      step(
        "Machine Design",
        ["Machine Design"],
        [
          "CAD",
          "Mechanical Design",
        ]
      ),

      step(
        "Industrial Automation",
        ["Industrial Automation"],
        [
          "Manufacturing",
          "Control Systems",
        ]
      ),
    ]
  ),

  roadmap(
    "Civil Engineering",
    [
      step(
        "Civil Engineering Foundations",
        ["Civil Engineering"],
        [
          "Engineering Mathematics",
          "Engineering Mechanics",
        ]
      ),

      step(
        "Engineering Mechanics",
        ["Engineering Mechanics"]
      ),

      step(
        "Structural Analysis",
        ["Structural Analysis"],
        ["Engineering Mechanics"]
      ),

      step(
        "Strength of Materials",
        ["Strength of Materials"],
        ["Engineering Mechanics"]
      ),

      step(
        "Concrete Technology",
        ["Concrete Technology"],
        ["Strength of Materials"]
      ),

      step(
        "Geotechnical Engineering",
        ["Geotechnical Engineering"],
        ["Strength of Materials"]
      ),

      step(
        "Transportation Engineering",
        ["Transportation Engineering"],
        ["Civil Engineering"]
      ),

      step(
        "Construction Management",
        ["Construction Management"],
        [
          "Structural Analysis",
          "Transportation Engineering",
        ]
      ),
    ]
  ),

  roadmap(
    "Chemical Engineering",
    [
      step(
        "Chemical Engineering Foundations",
        ["Chemical Engineering"],
        [
          "Engineering Mathematics",
          "Chemistry",
        ]
      ),

      step(
        "Engineering Mathematics",
        ["Engineering Mathematics"]
      ),

      step(
        "Chemistry",
        ["Chemistry"]
      ),

      step(
        "Material and Energy Balances",
        [
          "Material Balances",
          "Energy Balances",
        ],
        [
          "Engineering Mathematics",
          "Chemistry",
        ]
      ),

      step(
        "Fluid Mechanics",
        ["Fluid Mechanics"],
        ["Material Balances"]
      ),

      step(
        "Heat Transfer",
        ["Heat Transfer"],
        [
          "Energy Balances",
          "Fluid Mechanics",
        ]
      ),

      step(
        "Mass Transfer",
        ["Mass Transfer"],
        [
          "Fluid Mechanics",
          "Heat Transfer",
        ]
      ),

      step(
        "Process Control",
        ["Process Control"],
        [
          "Mass Transfer",
          "Control Systems",
        ]
      ),
    ]
  ),

  roadmap(
    "Biotechnology",
    [
      step(
        "Biotechnology Foundations",
        ["Biotechnology"],
        [
          "Biology",
          "Chemistry",
        ]
      ),

      step(
        "Biology",
        ["Biology"]
      ),

      step(
        "Chemistry",
        ["Chemistry"]
      ),

      step(
        "Biochemistry",
        ["Biochemistry"],
        [
          "Biology",
          "Chemistry",
        ]
      ),

      step(
        "Microbiology",
        ["Microbiology"],
        [
          "Biology",
          "Biochemistry",
        ]
      ),

      step(
        "Genetic Engineering",
        ["Genetic Engineering"],
        [
          "Biochemistry",
          "Microbiology",
        ]
      ),

      step(
        "Bioinformatics",
        ["Bioinformatics"],
        [
          "Biology",
          "Python",
        ]
      ),

      step(
        "Bioprocess Engineering",
        ["Bioprocess Engineering"],
        [
          "Biochemistry",
          "Microbiology",
        ]
      ),
    ]
  ),

  roadmap(
    "Robotics and Automation",
    [
      step(
        "Robotics Foundations",
        ["Robotics"],
        [
          "Programming Fundamentals",
          "Electronics",
          "Control Systems",
        ]
      ),

      step(
        "Programming Fundamentals",
        ["Programming Fundamentals"]
      ),

      step(
        "Electronics",
        ["Electronics"],
        ["Circuit Theory"]
      ),

      step(
        "Control Systems",
        ["Control Systems"],
        [
          "Mathematics",
          "Electronics",
        ]
      ),

      step(
        "Embedded Systems",
        ["Embedded Systems"],
        [
          "Electronics",
          "Programming Fundamentals",
        ]
      ),

      step(
        "Sensors and Actuators",
        [
          "Sensors",
          "Actuators",
        ],
        ["Electronics"]
      ),

      step(
        "Robotics Programming",
        [
          "Robotics Programming",
          "ROS",
        ],
        [
          "Programming Fundamentals",
          "Embedded Systems",
        ]
      ),

      step(
        "Robot Vision and AI",
        [
          "Robot Vision",
          "AI",
        ],
        [
          "Robotics Programming",
          "Computer Vision",
        ]
      ),
    ]
  ),

  roadmap(
    "VLSI and Semiconductor Design",
    [
      step(
        "VLSI Foundations",
        ["VLSI"],
        [
          "Digital Electronics",
          "Electronics",
        ]
      ),

      step(
        "Digital Electronics",
        ["Digital Electronics"],
        ["Circuit Theory"]
      ),

      step(
        "Analog Electronics",
        ["Analog Electronics"],
        ["Circuit Theory"]
      ),

      step(
        "HDL and Verilog",
        [
          "Verilog",
          "HDL",
        ],
        ["Digital Electronics"]
      ),

      step(
        "Digital IC Design",
        ["Digital IC Design"],
        [
          "Verilog",
          "Digital Electronics",
        ]
      ),

      step(
        "ASIC Design",
        ["ASIC"],
        ["Digital IC Design"]
      ),

      step(
        "FPGA Development",
        ["FPGA"],
        [
          "Verilog",
          "Digital IC Design",
        ]
      ),

      step(
        "Physical Design",
        ["Physical Design"],
        ["ASIC"]
      ),
    ]
  ),
];

const normalizeText = (
  value
) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeList = (
  values = []
) => {
  const seen = new Set();
  const result = [];

  for (
    const value of values
  ) {
    const normalized =
      normalizeText(value);

    if (!normalized) {
      continue;
    }

    const key =
      normalized.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(normalized);
  }

  return result;
};

const normalizeRoadmap = (
  source
) => {
  const normalizedSteps =
    source.steps.map(
      (item, index) => ({
        title:
          normalizeText(
            item.title
          ),

        description:
          normalizeText(
            item.description
          ),

        technologies:
          normalizeList(
            item.technologies
          ),

        prerequisites:
          normalizeList(
            item.prerequisites
          ),

        order:
          index + 1,
      })
    );

  const techStack =
    normalizeList(
      normalizedSteps.flatMap(
        (item) =>
          item.technologies
      )
    );

  return {
    domain:
      normalizeText(
        source.domain
      ),

    techStack,

    steps:
      normalizedSteps,

    isActive: true,
  };
};

const seedLearningRoadmaps =
  async () => {
    try {
      await mongoose.connect(
        MONGO_URI
      );

      console.log(
        "MongoDB connected."
      );

      console.log(
        `Preparing ${learningRoadmaps.length} technical learning domains.`
      );

      let created = 0;
      let updated = 0;

      for (
        const source of learningRoadmaps
      ) {
        const data =
          normalizeRoadmap(
            source
          );

        const existing =
          await LearningRoadmap.findOne(
            {
              domain:
                data.domain,
            }
          );

        if (existing) {
          existing.domain =
            data.domain;

          existing.techStack =
            data.techStack;

          existing.steps =
            data.steps;

          existing.isActive =
            true;

          await existing.save();

          updated += 1;
        } else {
          await LearningRoadmap.create(
            data
          );

          created += 1;
        }

        console.log(
          `Seeded: ${data.domain} (${data.steps.length} steps)`
        );
      }

      console.log(
        `Learning roadmap seed completed. Created: ${created}, Updated: ${updated}, Total: ${learningRoadmaps.length}`
      );
    } catch (error) {
      console.error(
        "Failed to seed learning roadmaps:",
        error
      );

      process.exitCode = 1;
    } finally {
      await mongoose.connection.close();

      console.log(
        "MongoDB connection closed."
      );
    }
  };

seedLearningRoadmaps();