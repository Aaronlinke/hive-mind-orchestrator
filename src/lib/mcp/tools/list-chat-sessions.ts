import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_chat_sessions",
  title: "List chat sessions",
  description: "List the signed-in user's saved orchestrator chat sessions, newest first.",
  inputSchema: { limit: z.number().int().min(1).max(100).default(20).describe("Max sessions to return.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");
    const { data, error } = await supabaseForUser(ctx)
      .from("chat_sessions")
      .select("id,title,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error) throw new ToolError(error.message);
    const sessions = (data ?? []).map((s) => ({ id: s.id, title: s.title, created_at: s.created_at, updated_at: s.updated_at }));
    return { content: [{ type: "text", text: JSON.stringify(sessions) }], structuredContent: { sessions } };
  },
});
