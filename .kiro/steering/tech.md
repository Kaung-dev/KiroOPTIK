# Technical Steering

## Stack

- Use a dependency-free static web app for the hackathon demo unless a later task explicitly adds a backend.
- Keep data local and synthetic. Do not include real patient data.
- Use semantic HTML, vanilla JavaScript, and CSS so the demo opens instantly from `index.html`.
- If using Kimi or another LLM API, call it only through a local/server-side proxy that reads an environment variable. Never expose API keys in frontend code.

## Architecture Rules

- Separate static sample data from UI logic.
- Keep the risk engine deterministic so the demo is explainable to judges.
- Preserve traceability from challenge inputs to outputs:
  - discharge summary -> care plan extraction
  - medication schedule -> adherence questions
  - appointment data -> reminder
  - patient risk profile -> escalation threshold
- Keep deterministic scoring as the source of truth for demo safety. Live LLM output may summarize or rephrase, but must not override alert severity.

## Safety Rules

- This is not a medical device.
- The assistant must state that it does not replace the care team.
- Any severe symptom, missed high-priority medication, wound infection signal, fall, confusion, chest pain, or breathing decline must create an alert.
- Clinical alerts must include evidence from the patient's answers and the recommended coordinator action.
