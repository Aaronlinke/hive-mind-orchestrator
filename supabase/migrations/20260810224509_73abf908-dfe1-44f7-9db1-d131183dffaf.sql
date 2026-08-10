INSERT INTO public.skill_development (skill_name, skill_category, proficiency_level, usage_count, learning_resources)
SELECT * FROM (VALUES
  ('Termux Package Management','termux',0.88,0,'["pkg","apt","termux-change-repo"]'::jsonb),
  ('Bash Scripting','scripting',0.90,0,'["bash","posix-sh","cron"]'::jsonb),
  ('Python Automation','python',0.86,0,'["requests","asyncio","pandas"]'::jsonb),
  ('TypeScript & React','frontend',0.89,0,'["react","vite","tailwind"]'::jsonb),
  ('Edge Functions / Deno','backend',0.84,0,'["deno","supabase-functions"]'::jsonb),
  ('SQL & Postgres','database',0.85,0,'["postgres","rls","indexing"]'::jsonb),
  ('Network Diagnostics','network',0.78,0,'["nmap","curl","ssh"]'::jsonb),
  ('Android Root & Magisk','android',0.72,0,'["tsu","magisk","termux-api"]'::jsonb),
  ('Media Processing','media',0.80,0,'["ffmpeg","yt-dlp","imagemagick"]'::jsonb),
  ('Security Hardening','security',0.75,0,'["openssl","gpg","fail2ban"]'::jsonb),
  ('Debugging & Tracing','debugging',0.87,0,'["strace","logcat","gdb"]'::jsonb),
  ('Prompt Engineering','ai',0.91,0,'["system-prompts","json-mode","few-shot"]'::jsonb),
  ('Information Theory','science',0.83,0,'["shannon-entropy","kolmogorov"]'::jsonb),
  ('Chaos & Dynamics','science',0.79,0,'["lyapunov","attractors"]'::jsonb),
  ('Git & Versionierung','tooling',0.86,0,'["git","rebase","bisect"]'::jsonb)
) AS v(skill_name, skill_category, proficiency_level, usage_count, learning_resources)
WHERE NOT EXISTS (SELECT 1 FROM public.skill_development sd WHERE sd.skill_name = v.skill_name);