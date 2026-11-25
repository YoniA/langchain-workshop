import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { tool } from "langchain";
import { TavilySearch } from "@langchain/tavily";
import * as z from "zod";

// A prebuilt tool: web search.
export const webSearch = new TavilySearch({ maxResults: 5 });

// A custom tool: a function + a name, a description and a schema.
export const saveDraft = tool(
  async ({ filename, markdown }) => {
    await mkdir("output", { recursive: true });
    const path = join("output", `${basename(filename, ".md")}.md`);
    await writeFile(path, markdown, "utf8");
    return `Saved draft to ${path}`;
  },
  {
    name: "save_draft",
    description: "Save a finished draft as a markdown file. Call it once, when the draft is complete.",
    schema: z.object({
      filename: z.string().describe("Short kebab-case name, e.g. 'remote-onboarding'"),
      markdown: z.string().describe("The complete draft in markdown"),
    }),
  },
);
