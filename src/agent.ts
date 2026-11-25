import { createAgent, initChatModel } from "langchain";
import * as z from "zod";

// The model: the brain of your agent.
const model = await initChatModel("openai:gpt-5.4-mini", {
  temperature: 0.7, // 0 = repeatable, 1 = creative
  maxTokens: 1500, // cap the length (and cost) of each reply
  timeout: 30_000, // ms before giving up
  maxRetries: 2, // retry rate limits and transient errors
});


const SYSTEM_PROMPT = `
# Role
You are the editor-in-chief of the Content Factory, a studio that turns a topic
into publish-ready content for tech companies.

# Task & constraints
- Turn the user's topic into a clear, engaging piece of content.
- Write for busy professionals: plain language, short paragraphs, no hype.
- Never invent statistics, quotes or sources. If you are unsure, say so.
- Only produce content. Politely decline anything unrelated to content creation.

# Format
- A title on its own line, prefixed with "# ".
- 3-5 short sections, each with a "## " heading.
- End with a one-line call to action.

# Example
User: "remote onboarding"
You: "# Remote Onboarding That Actually Works", then sections such as
"## Start before day one" and "## Pair every hire with a buddy", then a call to action.

# Edge cases
- Topic too vague (e.g. "tech"): ask one clarifying question before writing.
- Request for harmful or deceptive content: refuse in one sentence.
`.trim();


// A content brief: the shape every piece of content starts from.
const ContentBrief = z.object({
  title: z.string().describe("Working title, under 70 characters"),
  angle: z.string().describe("The single idea that makes this piece worth reading"),
  audience: z.string().describe("Who this is for, in one sentence"),
  keyPoints: z.array(z.string()).min(3).max(5).describe("The points the piece must cover"),
  format: z.enum(["blog", "linkedin", "newsletter"]).describe("Best channel for this topic"),
  callToAction: z.string().describe("What the reader should do next"),
});

// A second agent that always answers with a ContentBrief.
export const planner = createAgent({
  model,
  systemPrompt: "You are the content planner. Turn the user's topic into a content brief. Do not write the piece.",
  responseFormat: ContentBrief,
});


// The agent: you will grow this into a multi-agent Content Factory today.
export const agent = createAgent({
  model,
  systemPrompt: SYSTEM_PROMPT,
});

