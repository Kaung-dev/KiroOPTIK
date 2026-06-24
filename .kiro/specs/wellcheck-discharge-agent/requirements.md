# Requirements Document

## Introduction

WellCheck is an AI-powered patient discharge support agent designed for the AWS x Kiro Hackathon (Challenge 5: Healthcare & Wellbeing). It reduces hospital readmissions by guiding patients through their recovery plan via conversational check-ins post-discharge. The agent ingests discharge summaries, medication schedules, follow-up appointments, and patient risk profiles, then conducts structured wellbeing conversations in plain, reassuring language. Concerning responses (missed medications, worsening symptoms) are flagged to a clinical alert queue for care team review.

## Glossary

- **Agent**: The WellCheck conversational AI system that initiates and conducts patient check-in conversations
- **Discharge_Summary**: A structured document (PDF or text) containing patient diagnosis, treatment received, discharge instructions, and recovery plan
- **Medication_Schedule**: A list of prescribed medications including name, dosage, frequency, and duration for a patient post-discharge
- **Follow_Up_Appointment**: A scheduled clinical visit after discharge including date, time, provider, and purpose
- **Patient_Risk_Profile**: A composite record including patient age, primary condition, comorbidities, and readmission risk level
- **Check_In_Session**: A single conversational interaction between the Agent and a patient to assess recovery progress
- **Clinical_Alert**: A structured notification sent to the care team when concerning patient responses are detected
- **Alert_Queue**: The prioritized list of Clinical_Alerts awaiting care team review
- **Care_Team**: Hospital staff (nurses, physicians, discharge coordinators) responsible for patient follow-up
- **Wellbeing_Question**: A structured question the Agent asks to assess patient recovery across medication adherence, symptom status, and appointment awareness
- **Parser**: The component that extracts structured data from Discharge_Summary documents
- **Pretty_Printer**: The component that formats structured discharge data back into readable text representation

## Requirements

### Requirement 1: Discharge Summary Ingestion

**User Story:** As a discharge coordinator, I want the system to parse discharge summaries from PDF or text format, so that the agent has access to each patient's care plan details.

#### Acceptance Criteria

1. WHEN a Discharge_Summary in PDF format is provided, THE Parser SHALL extract patient name, diagnosis, treatment summary, discharge instructions, and recovery milestones into a structured data object
2. WHEN a Discharge_Summary in plain text format is provided, THE Parser SHALL extract patient name, diagnosis, treatment summary, discharge instructions, and recovery milestones into a structured data object
3. IF a Discharge_Summary contains unreadable or malformed content, THEN THE Parser SHALL return a descriptive error indicating the specific parsing failure
4. THE Pretty_Printer SHALL format structured discharge data objects back into valid human-readable text
5. FOR ALL valid Discharge_Summary objects, parsing then printing then parsing SHALL produce an equivalent structured data object (round-trip property)

### Requirement 2: Patient Risk Profile Loading

**User Story:** As a discharge coordinator, I want the system to load patient risk profiles, so that the agent can tailor check-in frequency and question intensity to each patient's risk level.

#### Acceptance Criteria

1. WHEN a Patient_Risk_Profile is loaded, THE Agent SHALL store patient age, primary condition, comorbidities, and readmission risk level (low, medium, high)
2. WHEN a Patient_Risk_Profile has a readmission risk level of high, THE Agent SHALL schedule daily Check_In_Sessions for the first 7 days post-discharge
3. WHEN a Patient_Risk_Profile has a readmission risk level of medium, THE Agent SHALL schedule Check_In_Sessions every 2 days for the first 14 days post-discharge
4. WHEN a Patient_Risk_Profile has a readmission risk level of low, THE Agent SHALL schedule Check_In_Sessions every 3 days for the first 14 days post-discharge
5. IF a Patient_Risk_Profile is missing required fields, THEN THE Agent SHALL reject the profile and report which fields are absent

### Requirement 3: Medication Schedule Management

**User Story:** As a discharge coordinator, I want the system to track each patient's medication schedule, so that the agent can verify adherence during check-ins.

#### Acceptance Criteria

1. WHEN a Medication_Schedule is loaded, THE Agent SHALL store each medication entry with name, dosage, frequency, start date, and duration
2. DURING a Check_In_Session, THE Agent SHALL reference the current Medication_Schedule to ask specific adherence questions for each active medication
3. IF a Medication_Schedule contains duplicate medication entries, THEN THE Agent SHALL flag the duplicate and retain only the most recent entry
4. WHEN a medication's duration has elapsed, THE Agent SHALL mark that medication as completed and exclude it from future adherence checks

### Requirement 4: Follow-Up Appointment Tracking

**User Story:** As a discharge coordinator, I want the system to track follow-up appointments, so that the agent can remind patients and verify attendance.

#### Acceptance Criteria

1. WHEN Follow_Up_Appointment data is loaded, THE Agent SHALL store date, time, provider name, location, and purpose for each appointment
2. WHEN a Check_In_Session occurs within 48 hours before a Follow_Up_Appointment, THE Agent SHALL remind the patient of the upcoming appointment including date, time, and provider
3. WHEN a Check_In_Session occurs after a Follow_Up_Appointment date, THE Agent SHALL ask the patient whether the appointment was attended
4. IF a patient reports missing a Follow_Up_Appointment, THEN THE Agent SHALL generate a Clinical_Alert with priority level medium

### Requirement 5: Conversational Check-In Sessions

**User Story:** As a patient, I want the agent to check in with me using simple, reassuring language, so that I understand my recovery plan without feeling overwhelmed.

#### Acceptance Criteria

1. WHEN a Check_In_Session begins, THE Agent SHALL greet the patient by first name and state the purpose of the check-in in one sentence
2. DURING a Check_In_Session, THE Agent SHALL use plain language at a 6th-grade reading level or below
3. DURING a Check_In_Session, THE Agent SHALL ask Wellbeing_Questions in a fixed order: medication adherence, symptom assessment, appointment awareness, and general wellbeing
4. WHEN a patient provides an unclear response, THE Agent SHALL ask one clarifying follow-up question before proceeding
5. WHEN a Check_In_Session ends, THE Agent SHALL summarize key points discussed and state when the next check-in will occur
6. THE Agent SHALL limit each Check_In_Session to a maximum of 10 conversational turns

### Requirement 6: Symptom Assessment

**User Story:** As a discharge coordinator, I want the agent to assess patient symptoms during check-ins, so that worsening conditions are detected early.

#### Acceptance Criteria

1. DURING a Check_In_Session, THE Agent SHALL ask the patient about the presence and severity of symptoms listed in the Discharge_Summary recovery plan
2. WHEN a patient reports a new symptom not listed in the Discharge_Summary, THE Agent SHALL record the symptom and generate a Clinical_Alert with priority level medium
3. WHEN a patient reports worsening of an existing symptom compared to the previous Check_In_Session, THE Agent SHALL generate a Clinical_Alert with priority level high
4. WHEN a patient reports stable or improving symptoms, THE Agent SHALL acknowledge progress and record the status

### Requirement 7: Medication Adherence Detection

**User Story:** As a discharge coordinator, I want the agent to detect missed medications, so that non-adherence is flagged before it leads to complications.

#### Acceptance Criteria

1. DURING a Check_In_Session, THE Agent SHALL ask the patient whether each active medication was taken as prescribed since the last check-in
2. WHEN a patient reports missing one dose of a medication, THE Agent SHALL record the event and provide a gentle reminder about the medication's importance
3. WHEN a patient reports missing two or more consecutive doses of a medication, THE Agent SHALL generate a Clinical_Alert with priority level high
4. IF a patient is unsure whether a medication was taken, THEN THE Agent SHALL record the response as uncertain and generate a Clinical_Alert with priority level low

### Requirement 8: Clinical Alert Generation

**User Story:** As a care team member, I want concerning patient responses flagged in a prioritized alert queue, so that I can intervene before a readmission occurs.

#### Acceptance Criteria

1. WHEN a concerning response is detected, THE Agent SHALL create a Clinical_Alert containing patient identifier, alert priority (low, medium, high), trigger reason, relevant conversation excerpt, and timestamp
2. THE Agent SHALL assign Clinical_Alert priority based on severity: high for worsening symptoms or repeated medication non-adherence, medium for missed appointments or new symptoms, low for uncertain responses
3. WHEN a Clinical_Alert is created, THE Agent SHALL add the alert to the Alert_Queue ordered by priority (high first) then by timestamp (earliest first)
4. THE Alert_Queue SHALL retain all unresolved Clinical_Alerts until a Care_Team member marks them as reviewed
5. WHEN a Care_Team member marks a Clinical_Alert as reviewed, THE Alert_Queue SHALL move the alert to a resolved state

### Requirement 9: Conversation Transcript Storage

**User Story:** As a discharge coordinator, I want full transcripts of patient check-ins stored, so that the care team can review interaction history.

#### Acceptance Criteria

1. WHEN a Check_In_Session completes, THE Agent SHALL store the full conversation transcript including timestamps, patient responses, and agent messages
2. THE Agent SHALL associate each transcript with the patient identifier and Check_In_Session date
3. WHEN a Care_Team member requests a transcript, THE Agent SHALL retrieve the transcript by patient identifier and date range

### Requirement 10: Multi-Language Support (Plain Language)

**User Story:** As a patient who speaks limited English, I want the agent to communicate in simple language, so that I can understand my recovery instructions.

#### Acceptance Criteria

1. THE Agent SHALL generate all patient-facing messages using vocabulary at or below a 6th-grade reading level
2. THE Agent SHALL avoid medical jargon in patient-facing messages and use plain-language equivalents (e.g., "blood thinner" instead of "anticoagulant")
3. WHEN a medical term must be used, THE Agent SHALL provide a plain-language explanation immediately following the term

### Requirement 11: Demo and Sample Output Generation

**User Story:** As a hackathon presenter, I want the system to produce sample conversation transcripts and clinical alert outputs, so that I can demonstrate the agent's capabilities in a 3-minute pitch.

#### Acceptance Criteria

1. WHEN a demo mode is activated, THE Agent SHALL run a complete Check_In_Session using a pre-loaded sample Discharge_Summary, Medication_Schedule, Follow_Up_Appointment, and Patient_Risk_Profile
2. WHEN demo mode completes, THE Agent SHALL output a formatted conversation transcript suitable for presentation
3. WHEN demo mode completes, THE Agent SHALL output sample Clinical_Alert records generated during the session
4. THE Agent SHALL complete a demo mode Check_In_Session within 30 seconds of execution
