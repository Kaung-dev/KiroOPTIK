# 3-Minute Pitch: WellCheck

## Opening

Hospital discharge coordinators are responsible for hundreds of patients leaving care every week. The risky moment is not only inside the hospital. It is the first few days at home, when a patient may misunderstand a medication schedule, miss a follow-up appointment, or ignore symptoms that should trigger a call.

WellCheck is an AI-powered post-discharge support agent that checks in with patients, explains the recovery plan in plain language, and turns hundreds of follow-ups into a prioritized coordinator queue.

## Demo Story

The first screen is the coordinator cockpit: five recently discharged patients, current alert counts, urgent cases, language needs, and estimated time saved. This matters because the coordinator does not need another inbox. They need to know who to call first.

Our lead sample patient is Maria Lopez, age 78, discharged after heart failure treatment. Her plan includes daily weight checks, a diuretic, blood pressure medication, and a cardiology follow-up.

WellCheck turns the discharge instructions into a structured conversation. It asks whether Maria took her medications, whether her breathing is better or worse, whether she has swelling, and whether she can attend her follow-up appointment.

In the worsening symptoms scenario, Maria reports that she missed her water pill and is more short of breath than yesterday. WellCheck does not diagnose her. It stays reassuring, records the exact evidence, and creates an urgent alert for the discharge coordinator.

The key is explainability. The alert shows which patient answer matched which discharge warning sign, how baseline risk contributed, and why the severity became urgent. Kimi can draft a coordinator note, but deterministic safety rules decide the alert level.

## Why Kiro

We used Kiro's spec-driven workflow to keep the build aligned with the challenge. The repository includes requirements, design, and tasks, plus steering files that tell Kiro to prioritize plain-language support, safety escalation, and a reliable demo.

## Impact

The coordinator gets a prioritized queue instead of hundreds of manual calls. Patients get clearer instructions in the language they understand. The care team gets earlier visibility into missed medications and worsening symptoms, which are exactly the kinds of problems that can drive preventable 30-day readmissions.

## Close

WellCheck is not replacing clinicians. It is a calm, always-available check-in layer that helps the right human make the right call sooner.
