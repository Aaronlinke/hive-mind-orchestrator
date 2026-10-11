import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listChatSessions from "./tools/list-chat-sessions";
import getChatMessages from "./tools/get-chat-messages";
import searchKnowledge from "./tools/search-knowledge";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "hive-mind-orchestrator",
  title: "hive-mind-orchestrator",
  version: "0.1.0",
  instructions:
    "Tools for the hive-mind-orchestrator app, acting as the signed-in user: browse saved orchestrator chats and search the Nexus knowledge base.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listChatSessions, getChatMessages, searchKnowledge],
});
