// Pure score calculator for workforce matching.
// It takes one employee and one project, performs deterministic math only,
// and returns a score, verdict, and per-skill breakdown without touching any database.

function scoreEmployee(employee, project) {
  if (!employee || !project) {
    throw new Error('Employee and project are required');
  }

  if (!Array.isArray(project.requiredSkills) || project.requiredSkills.length === 0) {
    return {
      score: 0,
      verdict: 'Low',
      breakdown: [],
    };
  }

  const rawSum = project.requiredSkills.reduce((sum, skill) => {
    return sum + Number(skill.weight || 0);
  }, 0);

  if (rawSum === 0) {
    throw new Error('Cannot score: all weights are zero');
  }

  const breakdown = [];

  for (const skill of project.requiredSkills) {
    const empSkill = employee.skills && employee.skills.find((s) => s.skillName === skill.skillName);
    const empLevel = empSkill ? Number(empSkill.level || 0) : 0;

    let match = 0;
    if (empLevel > 0 && empLevel >= skill.minLevel) {
      match = Math.min(empLevel / skill.minLevel, 1);
    }

    const normalizedWeight = skill.weight / rawSum;

    breakdown.push({
      skillName: skill.skillName,
      match: +match.toFixed(3),
      weight: +normalizedWeight.toFixed(3),
    });
  }

  const skillScore = breakdown.reduce((sum, item) => {
    return sum + item.weight * item.match;
  }, 0);

  const availabilityFactor = Math.min((employee.weeklyAvailabilityHours || 0) / 40, 1);
  const finalScore = Math.round(skillScore * availabilityFactor * 100);

  let verdict = 'Low';
  if (finalScore >= 75) {
    verdict = 'High';
  } else if (finalScore >= 50) {
    verdict = 'Moderate';
  }

  return {
    score: finalScore,
    verdict,
    breakdown,
  };
}

module.exports = {
  scoreEmployee,
};

// Test A: balanced
// employee: [{ React, 5 }, { Node, 5 }, { MongoDB, 5 }], availability 40
// project: [{ React, min 3, w 0.4 }, { Node, min 3, w 0.3 }, { MongoDB, min 2, w 0.3 }]
// expect score 100, verdict "High"

// Test B: below minimum
// employee: [{ React, 2 }], availability 40
// project: [{ React, min 3, w 1 }]
// expect score 0, verdict "Low", React match 0

// Test C: zero availability
// employee: [{ React, 5 }], availability 0
// project: [{ React, min 3, w 1 }]
// expect score 0, verdict "Low"

// Test D: weights don't sum to 1
// employee: [{ React, 5 }, { Node, 5 }], availability 40
// project: [{ React, min 3, w 2 }, { Node, min 3, w 2 }]
// expect both normalized to 0.5, score 100, verdict "High"
