# Requirements: WellCheck Command Center

## Requirement 1: Discharge Intake

As a discharge coordinator, I want to paste or review a discharge summary so that the system can extract the recovery plan.

### Acceptance Criteria

1. WHEN discharge text is available THEN the system SHALL extract medications, follow-up, and warning signs.
2. WHEN extracted information is shown THEN the system SHALL use plain language.
3. IF no medication is detected THEN the system SHALL show a clear empty state.

## Requirement 2: Prioritized Outreach Queue

As a discharge coordinator, I want patients ranked by risk so that I know who to call first.

### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL show multiple synthetic discharged patients.
2. WHEN patient check-ins are scored THEN urgent and alert patients SHALL be visually prioritized.
3. WHEN a patient is selected THEN the profile, transcript, alert, and explanation SHALL update.

## Requirement 3: Explainable Alerting

As a care operations leader, I want to understand why a patient was flagged so that the workflow is auditable.

### Acceptance Criteria

1. WHEN a patient is scored THEN the system SHALL show score, severity, evidence, and recommended action.
2. WHEN a warning sign is detected THEN the system SHALL show the matched signal in the explanation panel.
3. WHEN no concern is detected THEN the system SHALL state that no safety trigger was found.

## Requirement 4: Optional Kimi Note

As a presenter, I want optional live AI output so that I can show an agentic handoff without risking the core demo.

### Acceptance Criteria

1. WHEN `KIMI_API_KEY` is not set THEN the system SHALL fail gracefully.
2. WHEN Kimi is available THEN the system SHALL generate a coordinator note.
3. The LLM SHALL NOT override deterministic severity.

## Requirement 5: Hackathon Demo

As a team, we want a reliable three-minute demo.

### Acceptance Criteria

1. The app SHALL run by opening `index.html`.
2. The app SHALL also run from the included PowerShell server.
3. The repository SHALL include Kiro steering, requirements, design, and tasks.
