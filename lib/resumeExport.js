export function groupResumeSkills(skills) {
  const groups = new Map();

  for (const skill of skills) {
    const category = skill.category || "כללי";

    if (!groups.has(category)) {
      groups.set(category, []);
    }

    groups.get(category).push(skill);
  }

  return Array.from(groups, ([category, skills]) => ({
    category,
    skills,
  }));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export function getResumeAchievement(skill) {
  return skill.knowledgeLevel ?? "בתהליך למידה";
}

export function buildResumeExport(groups, format) {
  const detailed = format === "detailed";
  const textLines = ["מיומנויות וידע", ""];

  const htmlParts = [
    '<section dir="rtl" style="font-family:Arial,sans-serif;color:#202530;line-height:1.6">',
    '<h2 style="font-size:20px;margin:0 0 14px">מיומנויות וידע</h2>',
  ];

  for (const group of groups) {
    if (detailed) {
      textLines.push(`${group.category}:`);

      htmlParts.push(
        `<h3 style="font-size:16px;margin:16px 0 6px">${escapeHtml(group.category)}</h3>`,
        '<ul style="margin:0 0 12px;padding-right:22px">',
      );

      for (const skill of group.skills) {
        const achievement = getResumeAchievement(skill);

        textLines.push(`• ${skill.name} — ${achievement}`);

        htmlParts.push(
          `<li><strong>${escapeHtml(skill.name)}</strong> — ${escapeHtml(achievement)}</li>`,
        );
      }

      textLines.push("");
      htmlParts.push("</ul>");
    } else {
      const names = group.skills.map(
        (skill) => `${skill.name} — ${getResumeAchievement(skill)}`,
      );

      textLines.push(`${group.category}: ${names.join(" | ")}`);

      htmlParts.push(
        `<p style="margin:0 0 10px"><strong>${escapeHtml(group.category)}:</strong> ${names.map(escapeHtml).join(" • ")}</p>`,
      );
    }
  }

  htmlParts.push("</section>");

  return {
    text: textLines.join("\n").trim(),
    html: htmlParts.join(""),
  };
}

export function getResumeKnowledgeLevel(attempts) {
  const completed = attempts.filter(
    (attempt) => attempt.status === "completed" && attempt.totalAnswers === 10,
  );

  function passedLevel(difficulty) {
    const results = completed.filter(
      (attempt) => attempt.difficulty === difficulty,
    );

    if (results.length < 5) return false;

    const scores = results.map((attempt) => attempt.correctAnswers);

    const best = Math.max(...scores);
    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return best >= 9 && average >= 8;
  }

  if (passedLevel("advanced")) {
    return "ידע מתקדם";
  }

  if (passedLevel("intermediate")) {
    return "ידע טוב";
  }

  if (passedLevel("beginner")) {
    return "ידע בסיסי מבוסס";
  }

  if (completed.some((attempt) => attempt.correctAnswers >= 7)) {
    return "היכרות בסיסית";
  }

  return null;
}
