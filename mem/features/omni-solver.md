---
name: Omni Solver Chat
description: Startseite "/" ist eine reine Chat-Oberfläche, die über die omni-solver Edge Function alle Module orchestriert und eine vollständige Python-Lösung liefert
type: feature
---
Route "/" = OmniChat (src/pages/OmniChat.tsx), Dashboard liegt auf "/dashboard" (+ "/index"), gegenseitig per Button verlinkt.

Edge Function `omni-solver`:
1. Router (JSON) wählt max. 3 Module: knowledge (knowledge-manager), research (web-interaction), termux (termux-council), debate (dual-brain-debate).
2. Module laufen parallel, Ergebnisse gehen als Kontext in die Synthese.
3. Synthese liefert IMMER einen vollständigen, lauffähigen ```python-Block: keine Platzhalter, keine Mocks, keine Science-Fiction-Begriffe, Secrets via os.environ, pip-Zeile als Kommentar, max. 3 Sätze Kontext + 5 Stichpunkte Nutzung.

UI: Copy-Code- und Download-.py-Button pro Antwort, Modul-Badges.
