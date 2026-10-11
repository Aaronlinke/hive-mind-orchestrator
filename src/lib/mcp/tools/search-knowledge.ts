import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_knowledge",
  title: "Search knowledge base",
  description: "Search the Nexus knowledge base (formulas, science, tech notes) by keyword in title or content.",
  inputSchema: {
    query: z.string().trim().min(1).max(200).describe("Keyword, e.g. 'entropy' or 'SHA256'."),
    limit: z.number().int().min(1).max(50).default(10).describe("Max entries to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");
    const q = query.replace(/[%,()]/g, " ");
    const { data, error } = await supabaseForUser(ctx)
      .from("knowledge_entries")
      .select("id,title,category,content,tags")
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .limit(limit);
    if (error) throw new ToolError(error.message);
    const entries = (data ?? []).map((e) => ({ id: e.id, title: e.title, category: e.category, content: e.content, tags: e.tags ?? [] }));
    return { content: [{ type: "text", text: JSON.stringify(entries) }], structuredContent: { entries } };
  },
});
