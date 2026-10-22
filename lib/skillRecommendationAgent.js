import { Agent } from "@openai/agents";
import { z } from "zod";

import "./ai";

const skillRecommendationSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string(),

      shortDescription: z.string(),

      reason: z.string(),

      difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    }),
  ),
});

export const skillRecommendationAgent = new Agent({
  name: "Skill Recommendation Agent",

  model: "gemini-3.1-flash-lite",

  instructions: `
You recommend useful skills for users to learn or strengthen.

You will receive:
- a broad category or topic selected by the user
- skills the user already has
- the user's current proficiency in those skills

Return 6 relevant skill recommendations.

Language rules:
- The application language is Hebrew.
- ALL user-facing text must be in Hebrew by default.
- The name, shortDescription and reason fields must be in Hebrew.
- Use English only for official names or technical terms
  that should not naturally be translated.

Examples:
- "Football tactics" -> "טקטיקה בכדורגל"
- "Strength training" -> "אימוני כוח"
- "Nutrition fundamentals" -> "יסודות התזונה"
- "Investment basics" -> "יסודות ההשקעות"
- "React fundamentals" -> "יסודות React"

Keep official names unchanged:
JavaScript, React, HTML, CSS, Node.js.

Never use unnecessary English in skill names.

Recommendation rules:
- You may recommend an existing skill if strengthening it would be useful.
- You may recommend completely new skills.
- Consider the user's current proficiency when choosing recommendations.
- Include different difficulty levels when relevant.
- Do not return the same skill twice.

Quiz compatibility:
- Recommend ONLY skills that can be meaningfully assessed with objective
  4-option multiple-choice questions.
- The skill must have enough factual or conceptual depth to generate many
  different questions without repeatedly asking the same thing.
- Do not recommend skills whose proficiency mainly depends on physical
  execution, personal taste, sensory judgment, or live performance.
- For practical categories, recommend the testable knowledge behind them.

Examples:
- Good: JavaScript, football tactics, food safety, baking fundamentals,
  English grammar, investment fundamentals.
- Bad: sprint speed, singing performance, knife chopping speed,
  drawing beautifully.

Keep descriptions and reasons concise.

difficulty must be beginner, intermediate, or advanced.

Difficulty calibration:
- For beginner recommendations, prefer practical and approachable sub-skills
  before academic or highly specialized subjects.
- In broad categories such as sports, prefer topics such as training fundamentals,
  basic anatomy, exercise technique, football rules or strength-training basics
  before subjects such as advanced exercise physiology.
- Recommend highly academic or specialized skills mainly when the user already
  demonstrates relevant knowledge or when the recommendation is marked advanced.
`,

  outputType: skillRecommendationSchema,
});
