# KiroOPTIK: WellCheck Command Center

WellCheck Command Center is a spec-driven hackathon demo for **AWS Kiro Challenge 5: Healthcare & Wellbeing**.

It helps a hospital discharge coordinator turn messy discharge instructions into:

- a plain-language patient recovery plan
- a prioritized post-discharge outreach queue
- an explainable clinical alert
- a coordinator-ready handoff note

## Run

Open `index.html` directly in a browser.

Optional local preview server:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev-server.ps1
```

Then open `http://127.0.0.1:4173/`.

## Optional Kimi API

The browser demo works without any API. If you want a live generated coordinator note, run the server with:

```powershell
$env:KIMI_API_KEY = "your-key-here"
powershell -ExecutionPolicy Bypass -File scripts/dev-server.ps1
```

The key is read only by the local server. Do not put API keys in frontend files.

## Kiro Prompt

```text
#spec:wellcheck-command-center Review the requirements, design, and tasks. Improve gaps, then implement only changes that preserve a reliable no-build browser demo.
```

## Demo Path

1. Show the coordinator dashboard and queue.
2. Paste or review the discharge-summary text.
3. Click **Parse Discharge Plan**.
4. Select the urgent patient.
5. Show the transcript, alert evidence, and explainability trail.
6. Optionally generate the Kimi coordinator note.

## Pitch

WellCheck is not a medical chatbot. It is a discharge operations layer that helps coordinators know who needs attention first, why they were flagged, and what evidence should be handed to the care team.
