import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_chat_messages",
  title: "Get chat messages",
  description: "Read messages of one of the signed-in user's chat sessions in chronological order.",
  inputSchema: {
    session_id: z.string().uuid().describe("Chat session ID from list_chat_sessions."),
    limit: z.number().int().min(1).max(200).default(50).describe("Max messages to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ session_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");
    const { data, error } = await supabaseForUser(ctx)
      .from("chat_messages")
      .select("id,role,content,created_at")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) throw new ToolError(error.message);
    const messages = (data ?? []).map((m) => ({ id: m.id, role: m.role, content: m.content, created_at: m.created_at }));
    return { content: [{ type: "text", text: JSON.stringify(messages) }], structuredContent: { messages } };
  },
});
