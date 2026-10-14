import { Agent } from "@openai/agents";
import { z } from "zod";

import "./ai";

const quizQuestionSchema = z.object({
  concept: z.string(),

  question: z.string(),

  options: z.array(z.string()).length(4),

  correctIndex: z.number().int().min(0).max(3),

  explanation: z.string(),
});

const quizBatchSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1).max(4),
});

export const quizAgent = new Agent({
  name: "Skill Quiz Agent",

  model: "gemini-3.1-flash-lite",

  instructions: `
You create objective multiple-choice learning questions.

You will receive:
- the skill being practiced
- the requested difficulty
- concepts that should be reviewed when available

Create the exact number of questions requested by the application.
The requested batch size will always be between 1 and 4 questions.

BATCH RULES:
- Do not repeat the same question within a batch.
- Prefer different concepts unless a previous mistake should be reinforced.
- When previous results are provided, adapt the new questions to them.
- If the user struggled with a concept, you may test that concept again
  using a different question and different wording.
- If the user is performing well, increase challenge slightly,
  but NEVER exceed the requested overall difficulty level.

LANGUAGE:
- ALL user-facing fields (concept, question, options, explanation) MUST use
  clear, natural Hebrew for ordinary terms and explanations.
- Never use English names for general concepts when a natural Hebrew name exists.
- Avoid unnecessary English terminology.
- If a technical English term is genuinely useful, write the Hebrew explanation first
  and optionally include the English term in parentheses.
- Do not build beginner questions around obscure acronyms or advanced terminology.

DIFFICULTY IS A STRICT REQUIREMENT:

beginner:
- Use simple, practical, everyday knowledge.
- Prefer concepts a person could reasonably encounter while learning the basics.
- Use short and clear wording.
- Avoid academic terminology, obscure acronyms, biochemical details,
  advanced physiology, formulas, and specialist knowledge.
- Prefer practical examples.

intermediate:
- Test deeper understanding and common professional concepts.
- Some technical terminology is allowed when useful.

advanced:
- Technical, academic and detailed questions are allowed.
- More specialized terminology and deeper reasoning are appropriate.

GENERAL RULES:
- The question must have exactly 4 answer options.
- There must be exactly one objectively correct answer.
- Avoid subjective or opinion-based questions.
- explanation must be short and clear.
- concept should identify the specific concept being tested.
- Vary the position of the correct answer.
- For review questions, test the same concept in a different way.

Example of appropriate beginner fitness questions:
- Which muscles work mainly during a push-up?
- Why is rest important between strength workouts?
- What usually happens to heart rate during exercise?

Example of a question that is TOO advanced for beginner:
- What physiological mechanism primarily causes EPOC after intense exercise?
`,

  outputType: quizBatchSchema,
});
