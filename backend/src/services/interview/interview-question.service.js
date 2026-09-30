import { generateAIText } from "../ai/ai.service.js";

const extractText = (text) =>
  String(text || "")
    .replace(/```text/gi, "")
    .replace(/```/g, "")
    .trim();

const ROLE_TOPIC_MAP = {
  "software developer": [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Express.js",
    "REST APIs",
    "HTTP fundamentals",
    "Databases",
    "MongoDB",
    "SQL",
    "Git",
    "Object-Oriented Programming",
    "Data Structures and Algorithms",
    "Software Engineering",
    "Testing",
    "Debugging",
    "Web Development",
    "Backend Development",
    "Frontend Development",
    "API Integration",
  ],

  "web developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Responsive Web Design",
    "Accessibility",
    "Browser fundamentals",
    "REST APIs",
    "HTTP fundamentals",
    "Git",
    "Frontend Development",
    "Backend Development",
    "Node.js",
    "Express.js",
    "Web Performance",
  ],

  "frontend developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Responsive Web Design",
    "Accessibility",
    "Browser fundamentals",
    "DOM",
    "State Management",
    "REST APIs",
    "Web Performance",
    "Git",
    "Frontend Testing",
  ],

  "backend developer": [
    "Node.js",
    "Express.js",
    "REST APIs",
    "HTTP fundamentals",
    "Authentication",
    "Authorization",
    "Databases",
    "MongoDB",
    "SQL",
    "API Design",
    "Error Handling",
    "Caching",
    "Git",
    "Backend Testing",
    "Security fundamentals",
  ],

  "ai engineer": [
    "Python",
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Model Development",
    "Model Evaluation",
    "Data Processing",
    "Feature Engineering",
    "Model Deployment",
    "APIs",
    "AI System Design",
  ],

  "ml engineer": [
    "Python",
    "Machine Learning",
    "Deep Learning",
    "Feature Engineering",
    "Model Evaluation",
    "Model Deployment",
    "MLOps",
    "Data Processing",
    "APIs",
    "Model Serving",
    "AI System Design",
  ],

  "data scientist": [
    "Python",
    "Statistics",
    "Probability",
    "Machine Learning",
    "Data Analysis",
    "Data Visualization",
    "Feature Engineering",
    "Model Evaluation",
    "SQL",
    "Pandas",
    "Data Cleaning",
  ],

  "data analyst": [
    "SQL",
    "Python",
    "Statistics",
    "Data Cleaning",
    "Data Analysis",
    "Data Visualization",
    "Excel",
    "Power BI",
    "Tableau",
    "Business Analysis",
  ],

  "data engineer": [
    "Python",
    "SQL",
    "Databases",
    "ETL",
    "Data Pipelines",
    "Data Warehousing",
    "Data Processing",
    "APIs",
    "Cloud fundamentals",
    "Distributed Systems",
  ],

  "cloud engineer": [
    "Cloud Computing",
    "AWS",
    "Azure",
    "GCP",
    "Linux",
    "Networking",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Infrastructure",
    "Security fundamentals",
  ],

  "cybersecurity analyst": [
    "Cybersecurity",
    "Networking",
    "Linux",
    "Authentication",
    "Authorization",
    "Web Security",
    "OWASP",
    "Threat Detection",
    "Incident Response",
    "Cryptography fundamentals",
  ],

  "business analyst": [
    "Requirements Analysis",
    "Business Analysis",
    "SQL",
    "Data Analysis",
    "Statistics",
    "Communication",
    "Stakeholder Management",
    "Process Analysis",
    "Problem Solving",
  ],
};

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase();

const getAllowedTopics = (targetRole) => {
  const normalizedRole = normalizeRole(targetRole);

  if (ROLE_TOPIC_MAP[normalizedRole]) {
    return ROLE_TOPIC_MAP[normalizedRole];
  }

  return [
    targetRole,
    "problem solving",
    "software fundamentals",
    "technical fundamentals",
    "practical implementation",
    "debugging",
    "system design fundamentals",
  ];
};

const normalizeList = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    : [];

const buildCandidateContext = (profile) => {
  const technicalSkills = normalizeList(
    profile?.technicalSkills
  );

  const interests = normalizeList(
    profile?.interests
  );

  return {
    technicalSkills,
    interests,
  };
};

const buildBaseInstructions = ({
  targetRole,
  difficulty,
  profile,
}) => {
  const topics = getAllowedTopics(targetRole);
  const candidate = buildCandidateContext(profile);

  return `
You are conducting a professional technical interview.

Target role:
${targetRole}

Interview difficulty:
${difficulty}

Allowed technical topic areas for this role:
${topics.join(", ")}

Candidate's known technical skills:
${
  candidate.technicalSkills.length
    ? candidate.technicalSkills.join(", ")
    : "Not provided"
}

Candidate's interests:
${
  candidate.interests.length
    ? candidate.interests.join(", ")
    : "Not provided"
}

STRICT INTERVIEW RULES:

1. The question must be directly relevant to the target role.
2. Use the allowed technical topic areas as the primary topic boundary.
3. Prefer the candidate's known technical skills when they naturally fit the role.
4. Do not introduce an unrelated technology merely because it is technically interesting.
5. Do not ask a machine-learning, deep-learning, TensorFlow, PyTorch, data-science, cloud, cybersecurity, or other specialized question unless that topic is relevant to the target role or clearly supported by the candidate's profile.
6. Do not assume that the candidate uses a particular framework unless it is present in their profile or is a normal part of the target role.
7. Ask exactly ONE question.
8. Do not provide the answer.
9. Do not add explanations before or after the question.
10. Return ONLY the question text.
`;
};

export const generateFirstQuestion = async ({
  targetRole,
  difficulty,
  profile,
}) => {
  const instructions = buildBaseInstructions({
    targetRole,
    difficulty,
    profile,
  });

  const prompt = `
${instructions}

Generate the first technical interview question.

Question requirements:
- Start with a practical or fundamental topic appropriate for the role.
- The question should be answerable without assuming an unknown technology.
- Match the requested difficulty.
- Prefer a topic from the candidate's known skills when appropriate.

Return ONLY the question text.
`;

  const question = await generateAIText(prompt);

  return extractText(question);
};

export const generateNextQuestion = async ({
  targetRole,
  difficulty,
  previousQuestion,
  previousAnswer,
  evaluation,
  previousQuestions = [],
  profile,
}) => {
  const instructions = buildBaseInstructions({
    targetRole,
    difficulty,
    profile,
  });

  const askedQuestions = normalizeList(
    previousQuestions
  );

  const prompt = `
${instructions}

You are continuing an existing interview.

Previous question:
${previousQuestion}

Candidate's previous answer:
${previousAnswer}

Previous answer evaluation:
Overall score: ${evaluation.score}
Technical accuracy: ${evaluation.technicalAccuracy}
Relevance: ${evaluation.relevance}
Completeness: ${evaluation.completeness}
Communication: ${evaluation.communication}

Previous evaluator feedback:
${evaluation.feedback}

Questions already asked:
${
  askedQuestions.length
    ? askedQuestions
        .map(
          (question, index) =>
            `${index + 1}. ${question}`
        )
        .join("\n")
    : "None"
}

Generate ONE next interview question.

Question strategy:
- Continue naturally from the candidate's previous answer.
- If the candidate demonstrated a strong concept, increase depth appropriately.
- If the candidate showed a weakness or misunderstanding, probe that area with a useful follow-up.
- If the candidate answered correctly, move to another relevant topic when appropriate.
- Maintain the target role and requested difficulty.
- Prefer the candidate's known skills where relevant.
- Do not repeat any previously asked question.
- Do not ask about a technology that falls outside the allowed topic areas unless the candidate's answer explicitly introduced it and it is useful for the follow-up.
- Do not suddenly switch from a Software Developer interview into a specialized ML, TensorFlow, data-science, cybersecurity, or unrelated interview.
- Ask exactly ONE question.
- Do not provide the answer.
- Do not explain your reasoning.
- Return ONLY the question text.
`;

  const question = await generateAIText(prompt);

  return extractText(question);
};