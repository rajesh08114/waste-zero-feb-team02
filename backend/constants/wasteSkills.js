export const WASTE_SKILL_OPTIONS = [
  "Waste Segregation",
  "Recycling Operations",
  "Collection Logistics",
  "Route Planning",
  "Composting",
  "E-Waste Handling",
  "Hazardous Waste Safety",
  "Material Recovery",
  "Cleanup Operations",
  "Community Recycling Outreach",
  "Environmental Education",
  "Data Reporting",
  "Volunteer Coordination",
  "Site Supervision",
  "Sustainable Event Support",
];

const SKILL_LOOKUP = new Map(
  WASTE_SKILL_OPTIONS.map((skill) => [skill.toLowerCase(), skill]),
);

const toSkillList = (skills) => {
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => (typeof skill === "string" ? skill.trim() : ""))
      .filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return null;
};

export const resolveWasteSkills = (skills) => {
  const parsedSkills = toSkillList(skills);

  if (parsedSkills === null) {
    return {
      normalizedSkills: null,
      invalidSkills: [],
    };
  }

  const normalizedSkills = [];
  const invalidSkills = [];

  parsedSkills.forEach((skill) => {
    const normalizedSkill = SKILL_LOOKUP.get(skill.toLowerCase());
    if (!normalizedSkill) {
      invalidSkills.push(skill);
      return;
    }

    if (!normalizedSkills.includes(normalizedSkill)) {
      normalizedSkills.push(normalizedSkill);
    }
  });

  return {
    normalizedSkills,
    invalidSkills,
  };
};
