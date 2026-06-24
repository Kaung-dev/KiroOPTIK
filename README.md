# WellCheck: AI-Powered Patient Discharge Support Agent

WellCheck is a hackathon demo for AWS Kiro Challenge 5, Healthcare & Wellbeing. It simulates a post-discharge check-in assistant that helps patients understand recovery instructions and flags concerning answers for a hospital discharge coordinator.

## Why It Matters

Discharge coordinators manage many patients each week. Patients, especially elderly or non-English-speaking patients, often leave the hospital with instructions they do not fully understand. WellCheck converts discharge plans into a plain-language conversation and escalates missed medications or worsening symptoms before they become preventable readmissions.

## Run the Demo

Open `index.html` in a browser.

No build step, internet, package install, or backend is required.

Optional local server for Kiro/browser preview:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev-server.ps1
```

Then open `http://127.0.0.1:4173/`.

Optional live Kimi agent note:

```powershell
$env:KIMI_API_KEY = "your-key-here"
powershell -ExecutionPolicy Bypass -File scripts/dev-server.ps1
```

The API key must stay on the server side. Do not paste it into browser JavaScript, HTML, or committed files.

## Kiro Spec

Use this spec in Kiro:

```text
.kiro/specs/wellcheck-agent/
  requirements.md
  design.md
  tasks.md
```

Suggested Kiro prompt:

```text
#spec:wellcheck-agent Review this hackathon demo against the challenge brief. Improve any missing requirements, then implement the remaining tasks while preserving the no-dependency browser demo constraint.
```

## Deliverables

- Working agent demo: `index.html`
- Sample patient conversation transcript: generated in the demo and included in `pitch.md`
- Kiro spec file: `.kiro/specs/wellcheck-agent/`
- Clinical alert output: generated in the demo
- 3-minute pitch: `pitch.md`

## Winning Demo Path

1. Open `index.html`.
2. Select "Worsening symptoms."
3. Point to the care plan extraction.
4. Run the conversation.
5. Show the urgent clinical alert with evidence and recommended action.
6. Explain that a coordinator can now prioritize outreach across hundreds of discharged patients.
