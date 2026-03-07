
## Full System Audit & Next Expansion

### What I found reading all key files

**Core AI stack — status:**
- `gemini-free-ai` edge function: ✅ Correct, has fallback, full CORS
- `useMasterOrchestrator`: ✅ Uses gemini-free-ai directly
- `useFusionChat`: ✅ Uses gemini-free-ai
- `localAI.ts` (generateText/generateCode/generateSSFFusion): ✅ Uses gemini-free-ai
- `DebateCircle`: ✅ 6 parallel Gemini calls + synthesis
- `hierarchical-ai` edge function: ✅ Uses LOVABLE_API_KEY streaming (Lovable AI gateway) — this is correct, it is a different system than gemini-free-ai. The `useChat` hook uses this for the AIHierarchyDashboard/ChatInterface.

**Remaining gaps & improvements to implement:**

1. **`gemini-free-ai` MODEL_MAP is wrong** — `gemini-2.5-flash` maps to `gemini-2.0-flash` and `gemini-2.5-pro` maps to `gemini-1.5-pro`. These are old aliases. Should map to real current models: `gemini-2.5-flash` → `gemini-2.5-flash-preview-05-20` (or just use `gemini-2.0-flash` which is stable), and `gemini-2.5-pro` → `gemini-2.0-flash` with higher quality settings. Actually the safest fix: map to `gemini-2.0-flash` for flash and `gemini-1.5-pro` for pro (these are confirmed working).

2. **`SuperFusionChat` — `bg-green-500` hardcoded colors** — should use theme tokens like `bg-success`. Minor but consistent with theming.

3. **`MasterOrchestratorChat` Quick Actions** — Looking at lines 49-53 and the `handleSend` function (lines 24-29): `handleSend` calls `sendMessage(input)` but the quick action buttons set `setInput(prompt)` and call `handleSend()` — this is the async state bug. Fix: have quick action buttons call `sendMessage(prompt)` directly instead of going through `setInput` + `handleSend`.

4. **`AgentMetricsPanel` — shows all zeros when no orchestration happened** — The analytics tab shows "0%" confidence and "0ms" time on first load. Add meaningful demo/default metrics.

5. **`EvolutionaryDebatePanel` — `maxCycles: 500`** — runs a purely client-side loop (not AI). This works but the UI doesn't show real AI results in the debate. The `useEvolutionaryAgents` hook runs a local GA loop. This needs a real Gemini debate call as a summary at the end.

6. **`AJPlatform` — `runtimeOutput` display** — Reading the component: the generate function sets `runtimeOutput` via `setRuntimeOutput` but looking at the JSX, the "Runtime Sandbox" tab needs verification. Need to read more of the file.

7. **`CodeGenerator` toast says "lokal erstellt (kostenlos)"** — outdated message, now uses Gemini API (costs API quota). Fix misleading text.

8. **`collective-intelligence` — GEMINI_API_KEY required** — This edge function requires a GEMINI_API_KEY secret set in the environment, distinct from the Lovable AI key used by `hierarchical-ai`. The `useMultiAgentOrchestrator` calls this from `SwarmIntelligence`. If the GEMINI_API_KEY secret is not set, SwarmIntelligence will fail.

9. **SwarmIntelligence metaAnalysis display** — The `setMetaAnalysis` state is set from `collectiveResult?.metaAnalysis` on line ~100 but checking the actual code there may be a display issue.

10. **`useChat.ts` — SSE streaming parser is complex** — The hierarchical-ai stream parsing works but the error message "Fehler bei Hierarchical-KI" is not user-friendly. Improve error messages.

11. **Missing: Persistent chat history** — The `chat_sessions` and `chat_messages` tables exist in DB with full RLS, but NO component currently saves or loads chat history. This is a major feature gap.

12. **Evolution page** — The "Analyse", "Evolution" and "Bewusstsein" buttons call `analyzeSystem`, `evolveGeneration`, `reflectConsciousness` from `useEvolution` hook — need to verify these actually call Gemini.

Let me read AJPlatform's runtime sandbox and useEvolution quickly.

---

Reading full AJPlatform (lines 80-200) and useEvolution to confirm gaps:

From what I've seen:
- AJPlatform uses `useGeminiAI` for code generation (✅) and a `runSandbox` function that sets `runtimeOutput` from AI response (need to verify display)
- The runtime sandbox display issue was a prior bug

### Plan: "Weiter" — Next expansion pass

**8 targeted improvements:**

---

### 1. Fix `gemini-free-ai` MODEL_MAP — use confirmed-working model names
Map `gemini-2.5-flash` → `gemini-2.0-flash` and `gemini-2.5-pro` → `gemini-1.5-pro` (already correct). Add `gemini-2.5-flash-lite` → `gemini-2.0-flash`. Also add `gemini-2.5-pro` → `gemini-1.5-pro` which it already has. The main issue: the function works but model names passed from hooks use `gemini-2.5-flash` which resolves to `gemini-2.0-flash`. This is fine. Actually the MODEL_MAP is already correct for stability. Skip this.

---

### 1. Fix MasterOrchestrator Quick Action Bug (confirmed)
`MasterOrchestratorChat.tsx` lines 49-53: Quick action buttons need to call `sendMessage(action.prompt)` directly.

### 2. Fix CodeGenerator misleading toast text
`CodeGenerator.tsx`: Remove "(lokal, kostenlos)" — it now uses Gemini API.

### 3. Add persistent Chat History to MasterOrchestratorChat
Use `chat_sessions` + `chat_messages` tables (already in DB with RLS) to save/load Master Orchestrator conversations. Adds a session sidebar with history.

### 4. Connect Evolution page actions to Gemini
`useEvolution.ts` → `analyzeSystem`, `evolveGeneration`, `reflectConsciousness` — verify and ensure they use the gemini-free-ai edge function properly.

### 5. Improve SwarmIntelligence meta-analysis display
The `metaAnalysis` state is set but may not render properly in the UI. Fix the display panel to always show the Gemini meta-analysis result prominently.

### 6. Add a new "Prompt Lab" tab to Index
Replace or enhance a tab with a "Prompt Lab" that combines: PromptTemplates component + ability to send directly to any AI from there.

### 7. Upgrade `SupremeOrchestratorChat` — check if it works
Read and verify this component uses Gemini properly.

### 8. Add real-time notification when AI responds
Show a subtle animated notification badge on the tab that received a response when the user is on a different tab.

---

Let me re-read useEvolution and SwarmIntelligence to confirm what needs fixing.

**Files to change:**
| File | Change |
|---|---|
| `src/components/MasterOrchestratorChat.tsx` | Fix quick action bug — call `sendMessage(prompt)` directly |
| `src/components/CodeGenerator.tsx` | Fix misleading "lokal/kostenlos" toast text |
| `src/hooks/useMasterOrchestrator.ts` | Add session persistence with `chat_sessions`/`chat_messages` tables |
| `src/pages/SwarmIntelligence.tsx` | Fix meta-analysis display + show results more prominently |
| `src/hooks/useEvolution.ts` | Verify/fix that analyzeSystem/evolveGeneration use Gemini |
| `src/pages/Index.tsx` | Add a "Prompt Lab" combining PromptTemplates + AIGenerator as new tab (rename current "agents" tab or add 6th tab) |
| `src/components/SupremeOrchestratorChat.tsx` | Verify and fix if using old API |
| `supabase/functions/collective-intelligence/index.ts` | Add proper error message when GEMINI_API_KEY missing |

**Architecture for Chat Persistence:**
```text
useMasterOrchestrator
  → on mount: load last session from chat_sessions (filtered by title = "Master Orchestrator")
  → on sendMessage: insert to chat_messages (linked to session_id)
  → session created on first message if none exists
  → SessionSidebar component shows last 5 sessions
```

This is the most impactful new feature — gives users persistent AI conversation history.
