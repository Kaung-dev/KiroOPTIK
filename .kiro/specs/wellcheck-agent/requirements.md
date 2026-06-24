# Requirements: WellCheck AI-Powered Patient Discharge Support Agent

## Context

Challenge 5 asks for an intelligent post-discharge assistant that reduces hospital readmissions by guiding patients through recovery plans. The target user is a hospital discharge coordinator managing hundreds of patients each week. Many patients, especially elderly or non-English-speaking patients, do not fully understand their post-discharge instructions, leading to preventable readmissions within 30 days.

## Inputs

- Mock discharge summary in PDF or text form
- Medication schedule
- Follow-up appointment data
- Patient risk profile including age and condition

## Outputs

- Working agent demo
- Sample patient conversation transcript
- Kiro spec file
- Clinical alert output sample
- 3-minute pitch

## User Stories

### Requirement 1: Care Plan Extraction

As a discharge coordinator, I want the assistant to summarize the patient's discharge plan in plain language so that the patient receives a consistent recovery checklist.

#### Acceptance Criteria

1. WHEN the demo loads with a discharge summary THEN the system SHALL extract diagnosis, recovery goals, medications, appointment, and warning signs.
2. WHEN the patient risk profile indicates elderly or high-risk status THEN the system SHALL mark the patient as requiring closer follow-up.
3. IF the discharge summary contains medical jargon THEN the system SHALL present patient-facing language at or below an eighth-grade reading level.

### Requirement 2: Conversational Check-In

As a patient, I want a reassuring check-in conversation so that I can answer recovery questions without feeling judged or confused.

#### Acceptance Criteria

1. WHEN a check-in starts THEN the system SHALL greet the patient, state its support role, and clarify that it does not replace the care team.
2. WHEN medication instructions exist THEN the system SHALL ask whether the patient took each medication as scheduled.
3. WHEN follow-up appointment data exists THEN the system SHALL remind the patient of the appointment date and transportation need.
4. WHEN warning signs exist THEN the system SHALL ask structured symptom questions using plain language.
5. IF the patient chooses a non-English language THEN the system SHALL display patient-facing prompts in that language for the demo conversation.

### Requirement 3: Risk Detection

As a discharge coordinator, I want concerning answers flagged automatically so that I can prioritize patients who may need clinical outreach.

#### Acceptance Criteria

1. WHEN a patient reports worsening symptoms THEN the system SHALL increase the alert severity.
2. WHEN a patient misses a critical medication THEN the system SHALL create an alert with the missed medication and reason.
3. WHEN a patient reports severe symptoms such as chest pain, serious breathing trouble, confusion, fall, fever, wound infection, or uncontrolled pain THEN the system SHALL mark the alert as urgent.
4. IF no concerning answers are present THEN the system SHALL mark the check-in as routine and provide standard recovery encouragement.

### Requirement 4: Clinical Alert Queue

As a discharge coordinator, I want a concise alert output so that I can quickly decide who needs a call.

#### Acceptance Criteria

1. WHEN the check-in completes THEN the system SHALL generate a structured alert summary containing patient, risk level, evidence, and recommended coordinator action.
2. WHEN multiple concerns are detected THEN the system SHALL rank the concerns by severity.
3. WHEN an urgent concern is detected THEN the system SHALL show the alert in the queue with urgent visual priority.
4. IF the check-in is routine THEN the system SHALL log the transcript without adding an urgent clinical alert.

### Requirement 5: Demo and Pitch Support

As a hackathon presenter, I want the demo to tell a complete story in under three minutes so that judges can see the persona, problem, solution, and measurable impact.

#### Acceptance Criteria

1. WHEN the presenter opens the app THEN the system SHALL show the patient profile, care plan, chat simulation, transcript, and alert queue on one screen.
2. WHEN the presenter clicks a scenario THEN the system SHALL populate the conversation and alert output immediately.
3. WHEN the presenter needs the pitch THEN the repository SHALL include a concise pitch script tied to the judging criteria.
4. WHEN the spec is reviewed THEN the repository SHALL include Kiro-compatible requirements, design, and task files.
