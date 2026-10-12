import { OpenAI } from "openai";

import {
  setDefaultOpenAIClient,
  setOpenAIAPI,
  setTracingDisabled,
} from "@openai/agents";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

const geminiClient = new OpenAI({
  apiKey,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

setDefaultOpenAIClient(geminiClient);

setOpenAIAPI("chat_completions");

setTracingDisabled(true);
