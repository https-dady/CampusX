import CareerRequirement from "../../models/career-requirement.model.js";

const normalizeSkill = (skill) => {
  return skill
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};

const normalizeSkillList = (skills = []) => {
  const normalized = skills
    .filter((skill) => typeof skill === "string")
    .map(normalizeSkill)
    .filter(Boolean);

  return [...new Set(normalized)];
};

const getDisplaySkills = (skills = []) => {
  const seen = new Set();

  return skills.filter((skill) => {
    const normalized = normalizeSkill(skill);

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

const calculateMatchPercentage = (
  matchedCount,
  requiredCount
) => {
  if (requiredCount === 0) {
    return 0;
  }

  return Number(
    ((matchedCount / requiredCount) * 100).toFixed(2)
  );
};

export const calculateSkillGap = async ({
  career,
  domain,
  userSkills = [],
}) => {
  if (!career || !domain) {
    const error = new Error(
      "Career and domain are required."
    );

    error.statusCode = 400;
    throw error;
  }

  const careerRequirement =
    await CareerRequirement.findOne({
      career,
      domain,
      isActive: true,
    })
      .select("career domain requiredSkills")
      .lean();

  if (!careerRequirement) {
    const error = new Error(
      "Career requirement not found."
    );

    error.statusCode = 404;
    throw error;
  }

  const requiredSkills =
    getDisplaySkills(
      careerRequirement.requiredSkills
    );

  const normalizedUserSkills =
    normalizeSkillList(userSkills);

  const userSkillSet =
    new Set(normalizedUserSkills);

  const matchedSkills = [];
  const missingSkills = [];

  for (const requiredSkill of requiredSkills) {
    const normalizedRequiredSkill =
      normalizeSkill(requiredSkill);

    if (userSkillSet.has(normalizedRequiredSkill)) {
      matchedSkills.push(requiredSkill);
    } else {
      missingSkills.push(requiredSkill);
    }
  }

  const matchPercentage =
    calculateMatchPercentage(
      matchedSkills.length,
      requiredSkills.length
    );

  return {
    career: careerRequirement.career,
    domain: careerRequirement.domain,
    requiredSkills,
    matchedSkills,
    missingSkills,
    matchPercentage,
  };
};