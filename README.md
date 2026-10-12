# SkillQuestAI

SkillQuestAI is a gamified AI-powered learning application built with Next.js.

The application allows users to discover skills, complete AI-generated multiple-choice quests, receive immediate explanations, track their learning activity, and ask follow-up questions through an AI learning assistant with conversation memory.

## Features

- User registration, login and logout
- JWT authentication using HTTP-only cookies
- Protected routes
- MongoDB persistence with Mongoose
- AI-powered skill recommendations
- AI-generated multiple-choice quizzes
- Adaptive quiz generation
- Background question preloading for faster gameplay
- Immediate correct / incorrect feedback
- Short AI-generated explanations
- Quest XP system
- Quest attempt history
- Automatic saving of learning activity
- Contextual AI mini-chat after quiz questions
- AI conversation memory
- AI domain steering
- Hebrew RTL interface

## Tech Stack

- Next.js App Router
- JavaScript
- JSX
- React
- Tailwind CSS
- MongoDB
- Mongoose
- bcrypt
- jose
- Zod
- @openai/agents
- Gemini through an OpenAI-compatible API

## Project Structure

```text
app/
actions/
components/
lib/
models/
```

The project separates application routes, Server Actions, reusable React components, application logic, and database models.

## Authentication

Users can register, log in and log out.

Passwords are hashed using `bcrypt`.

After login, the application creates a JWT session and stores it inside an HTTP-only cookie.

Protected pages verify the session before allowing access.

Protected routes include:

```text
/skills
/assistant
```

If an unauthenticated user attempts to access a protected route, the application redirects them to:

```text
/login
```

## Database

The application uses MongoDB with Mongoose.

### User

Stores user account information.

### Skill

Stores skills that belong to the authenticated user.

A Skill can contain information such as:

- XP
- answered questions
- correct answers
- practice activity
- progress information

Each Skill is associated with a `userId`.

### QuestAttempt

Stores an individual learning Quest.

Quest attempts include information such as:

- Skill name
- Difficulty
- Quest status
- Questions answered
- Concepts tested
- Correct and incorrect answers
- XP earned
- Score
- Start time
- Completion time

This allows learning activity to be associated with the authenticated user instead of relying only on temporary client state.

## AI Skill Recommendations

Users begin by selecting a learning category.

SkillQuestAI sends the selected topic together with information about the user's existing skills to an AI agent.

The agent recommends relevant assessable skills that can be practiced using objective multiple-choice questions.

The recommendation system can suggest:

- New skills
- Existing skills that should be strengthened
- Different difficulty levels

The AI is instructed to return user-facing natural language in Hebrew.

## AI Quest System

After selecting a recommended skill, the user can start a Quest.

A Quest contains 10 multiple-choice questions.

Each question contains:

- A specific concept
- A question
- Exactly four answer options
- One correct answer
- A short explanation

Quiz output is validated using Zod.

The application, rather than the AI agent, remains responsible for evaluating whether an answer is correct and for tracking XP and results.

## Adaptive Question Generation

Questions are generated in batches instead of generating every question individually.

This improves the user experience by avoiding a long AI loading delay between every question.

The application initially generates several questions and then preloads additional batches in the background while the user is answering the current questions.

Previous Quest results are sent to the AI so later batches can adapt to the user's performance.

The AI is instructed to:

- Avoid duplicate questions
- Avoid asking essentially identical questions with slightly different wording
- Reinforce concepts when the user answers incorrectly
- Prefer new concepts when the user demonstrates understanding
- Remain within the requested overall difficulty level

## Quest Feedback

After selecting an answer, the user can check it.

The interface then:

- Locks the answer options
- Shows whether the selected answer was correct
- Highlights the correct answer
- Displays a short explanation
- Allows the user to continue to the next question

The user also receives XP for learning activity.

## AI Learning Assistant

The project includes an AI learning assistant powered through `@openai/agents`.

The assistant is available both contextually inside the Quiz experience and through the protected:

```text
/assistant
```

route.

The assistant:

- Answers questions about the learning topic
- Explains concepts
- Supports follow-up questions
- Remembers previous messages in the current conversation
- Uses previous turns when answering later questions
- Redirects unrelated questions back to the learning context

## Conversation Memory

Conversation memory is implemented using an Agents SDK session.

This allows a user to send multiple sequential messages while the assistant retains context from previous turns.

Example memory test:

1. Tell the assistant a specific detail.
2. Ask another learning-related question.
3. Ask the assistant to recall the detail from the first message.

The assistant should remember the original detail during the session.

## Domain Steering

The learning assistant is instructed to stay focused on the current learning topic.

If the user asks an unrelated question, the assistant should briefly redirect the conversation back to the relevant learning context instead of becoming a general-purpose chatbot.

## Server Actions

Server Actions are used for application operations such as:

- Authentication
- Skill recommendations
- Quiz generation
- Quest persistence
- AI assistant messages

Relevant Server Actions validate authentication before performing user-specific operations.

AI assistant messages are trimmed and limited to a maximum of 1000 characters.

Errors are handled and returned to the interface instead of exposing internal failures directly to the user.

## Environment Variables

Create a `.env.local` file in the project root.

Required variables:

```env
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_auth_secret
GEMINI_API_KEY=your_api_key
```

Do not commit `.env.local`.

The repository includes an `.env.example` file containing only the environment variable names.

## Installation

Install the project dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Production Validation

The project has been successfully validated using:

```bash
npm run build
npm run lint
```

Both commands complete successfully.

## Application Flow

```text
Register / Login
        ↓
Choose learning category
        ↓
AI recommends relevant skills
        ↓
Choose a Quest
        ↓
Start Quest
        ↓
Answer 10 multiple-choice questions
        ↓
Receive immediate feedback and explanations
        ↓
Ask follow-up questions through the AI mini-chat
        ↓
Quest activity is saved for the authenticated user
```

## Manual Tests

The following application flows were manually tested:

### Authentication

```text
Register
→ Login
→ Access protected page
→ Logout
→ Attempt to open protected page
→ Redirect to /login
```

### AI Conversation Memory

Three sequential messages were sent to the assistant.

The third message asked the assistant to recall information supplied in the first message.

The assistant successfully remembered the earlier information.

### AI Domain Steering

An unrelated question was sent to the learning assistant.

The assistant redirected the conversation back to the learning context.

### Production Build

```bash
npm run build
```

Completed successfully.

### ESLint

```bash
npm run lint
```

Completed successfully.

## Future Development

Planned product improvements include:

- Skill mastery objectives
- Core mastery levels
- Advanced learning tracks
- Knowledge retention and review
- Detailed learning journey analytics
- CV-ready skill export
- More detailed progress visualization
- Persistent AI conversation history

These features are part of the broader SkillQuestAI product direction but are not required for the current course submission.

## Author

Itamar Gabssi Cohen
