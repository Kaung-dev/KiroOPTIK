const { patient, queuePatients, carePlan, scenarios } = window.wellcheckData;

const $ = (id) => document.getElementById(id);

let activePatient = queuePatients[0] ?? patient;

function renderPatient(selectedPatient = activePatient) {
  $("patientName").textContent = selectedPatient.name;
  $("riskBadge").textContent = `${selectedPatient.baselineRisk} risk`;
  $("patientFacts").innerHTML = `
    <dt>Age</dt><dd>${selectedPatient.age}</dd>
    <dt>Language</dt><dd>${selectedPatient.language}</dd>
    <dt>Condition</dt><dd>${selectedPatient.condition}</dd>
  `;
  $("riskReasons").innerHTML = selectedPatient.riskReasons.map((reason) => `<li>${reason}</li>`).join("");
}

function renderCarePlan() {
  $("carePlan").innerHTML = `
    <div class="plan-block">
      <h3>Discharge summary</h3>
      <p>${carePlan.diagnosis}</p>
    </div>
    <div class="plan-block">
      <h3>Recovery goals</h3>
      <ul>${carePlan.goals.map((goal) => `<li>${goal}</li>`).join("")}</ul>
    </div>
    <div class="plan-block">
      <h3>Medication schedule</h3>
      ${carePlan.medications.map((med) => `
        <div class="med">
          <strong>${med.name}</strong>
          <span>${med.dose}, ${med.timing}</span>
          <small>${med.critical ? "Critical" : "As needed"} / patient wording: ${med.plain}</small>
        </div>
      `).join("")}
    </div>
    <div class="plan-block">
      <h3>Follow-up appointment</h3>
      <p>${carePlan.appointment.clinic}: ${carePlan.appointment.date}<br>${carePlan.appointment.location}</p>
    </div>
    <div class="plan-block">
      <h3>Warning signs</h3>
      <ul>${carePlan.warningSigns.map((sign) => `<li>${sign}</li>`).join("")}</ul>
    </div>
  `;
}

function scoreScenario(scenario, selectedPatient = activePatient) {
  const patientText = scenario.responses
    .filter(([speaker]) => speaker === "patient")
    .map(([, text]) => text.toLowerCase())
    .join(" ");

  const evidence = [];
  const reasoning = [];
  let score = patient.baselineRisk === "high" ? 1 : 0;
  if (selectedPatient.baselineRisk === "high") {
    score = 1;
    reasoning.push({
      signal: "Baseline risk",
      detail: `${selectedPatient.name} is marked high risk because of ${selectedPatient.riskReasons.join(", ")}.`,
      impact: "+1",
    });
  } else {
    score = 0;
    reasoning.push({
      signal: "Baseline risk",
      detail: `${selectedPatient.name} is standard baseline risk.`,
      impact: "+0",
    });
  }

  const missedCriticalMedication =
    /\b(skipped|missed)\b/.test(patientText) ||
    patientText.startsWith("no. ") ||
    patientText.includes(" no. i ");

  if (missedCriticalMedication) {
    score += 2;
    const missedLabel = scenario.id === "urgent-breathing" ? "controller inhaler" : "furosemide";
    evidence.push(`Missed critical medication: ${missedLabel} was not taken as scheduled.`);
    reasoning.push({
      signal: "Medication adherence",
      detail: "Transcript includes a missed or skipped scheduled medication.",
      impact: "+2",
    });
  }

  if (patientText.includes("short of breath") || patientText.includes("more trouble breathing") || patientText.includes("sleep sitting up")) {
    score += 3;
    evidence.push("Worsening breathing: patient reports sleeping sitting up and shortness of breath walking.");
    reasoning.push({
      signal: "Matched warning sign",
      detail: "Patient answer maps to discharge warning sign: more trouble breathing than yesterday.",
      impact: "+3",
    });
  }

  if (patientText.includes("swollen") || patientText.includes("swelling")) {
    score += 2;
    evidence.push("Fluid warning sign: patient reports increased ankle swelling.");
    reasoning.push({
      signal: "Matched warning sign",
      detail: "Patient answer maps to discharge warning sign: new or worsening swelling.",
      impact: "+2",
    });
  }

  if (patientText.includes("confirm with my daughter")) {
    score += 1;
    evidence.push("Appointment risk: transportation is not fully confirmed.");
    reasoning.push({
      signal: "Follow-up barrier",
      detail: "Patient does not have confirmed transportation for the follow-up appointment.",
      impact: "+1",
    });
  }

  if (evidence.length === 0) {
    evidence.push("No missed medication, worsening symptom, or transportation barrier reported.");
    reasoning.push({
      signal: "No safety trigger",
      detail: "Transcript does not contain missed medication, worsening symptom, or appointment barrier signals.",
      impact: "+0",
    });
  }

  if (score >= 6) {
    return {
      severity: "urgent",
      evidence,
      reasoning,
      score,
      action: "Place Maria at the top of the coordinator call queue today. Confirm medication plan and route symptom escalation to the clinical team.",
    };
  }

  if (score >= 3) {
    return {
      severity: "alert",
      evidence,
      reasoning,
      score,
      action: "Coordinator should call within one business day to review medication adherence and appointment logistics.",
    };
  }

  if (score >= 2) {
    return {
      severity: "watch",
      evidence,
      reasoning,
      score,
      action: "Send education reminder and keep patient on the next scheduled check-in.",
    };
  }

  return {
    severity: "routine",
    evidence,
    reasoning,
    score,
    action: "Log routine check-in. No clinical alert needed.",
  };
}

let currentScenario = null;
let currentAlert = null;

function severityRank(severity) {
  return { urgent: 4, alert: 3, watch: 2, routine: 1 }[severity] ?? 0;
}

function queueWithScores() {
  return queuePatients
    .map((queuedPatient) => {
      const scenario = scenarios.find((item) => item.id === queuedPatient.scenarioId) ?? scenarios[0];
      const alert = scoreScenario(scenario, queuedPatient);
      return { ...queuedPatient, scenario, alert };
    })
    .sort((a, b) => severityRank(b.alert.severity) - severityRank(a.alert.severity));
}

function renderMetrics() {
  const scored = queueWithScores();
  $("metricTotal").textContent = scored.length;
  $("metricAlerts").textContent = scored.filter((item) => ["urgent", "alert"].includes(item.alert.severity)).length;
  $("metricUrgent").textContent = scored.filter((item) => item.alert.severity === "urgent").length;
}

function renderQueue() {
  const scored = queueWithScores();
  $("patientQueue").innerHTML = scored.map((item) => `
    <button class="queue-item ${item.id === activePatient.id ? "active" : ""}" data-patient-id="${item.id}" type="button">
      <span>
        <strong>${item.name}</strong>
        <small>${item.condition} / ${item.lastCheckIn}</small>
      </span>
      <em class="${item.alert.severity}">${item.alert.severity}</em>
    </button>
  `).join("");

  $("patientQueue").onclick = (event) => {
    const button = event.target.closest(".queue-item");
    if (!button) return;
    const selected = queuePatients.find((item) => item.id === button.dataset.patientId);
    if (!selected) return;
    activePatient = selected;
    renderPatient(activePatient);
    renderQueue();
    renderButtons();
    runScenario(activePatient.scenarioId);
  };
}

function renderButtons() {
  $("scenarioButtons").innerHTML = scenarios.map((scenario, index) => `
    <button class="${scenario.id === activePatient.scenarioId ? "active" : ""}" data-id="${scenario.id}">${scenario.label}</button>
  `).join("");

  $("scenarioButtons").onclick = (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    document.querySelectorAll(".scenario-row button").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    runScenario(button.dataset.id);
  };
}

function runScenario(id) {
  const scenario = scenarios.find((item) => item.id === id) ?? scenarios[0];
  const alert = scoreScenario(scenario, activePatient);
  currentScenario = scenario;
  currentAlert = alert;

  $("scenarioSummary").textContent = scenario.summary;
  document.querySelectorAll(".scenario-row button").forEach((button) => {
    button.classList.toggle("active", button.dataset.id === scenario.id);
  });
  $("chatLog").innerHTML = scenario.responses.map(([speaker, text]) => `
    <article class="bubble ${speaker}">
      <span>${speaker === "agent" ? "WellCheck" : activePatient.name}</span>
      <p>${text}</p>
    </article>
  `).join("");

  $("severityBadge").textContent = alert.severity;
  $("severityBadge").className = alert.severity;
  $("alertOutput").innerHTML = `
    <div class="alert-card ${alert.severity}">
      <h3>${alert.severity.toUpperCase()} / ${patient.name}</h3>
      <p><strong>Profile:</strong> ${activePatient.age}, ${activePatient.condition}, ${activePatient.baselineRisk} baseline risk.</p>
      <h4>Evidence</h4>
      <ul>${alert.evidence.map((item) => `<li>${item}</li>`).join("")}</ul>
      <h4>Recommended coordinator action</h4>
      <p>${alert.action.replace("Maria", activePatient.name)}</p>
      <button id="kimiButton" type="button">Generate Kimi coordinator note</button>
      <pre id="kimiOutput" class="kimi-output">Optional live agent note appears here when the local server has KIMI_API_KEY set.</pre>
      <small>Generated from simulated post-discharge check-in transcript.</small>
    </div>
  `;
  renderExplanation(alert);
  $("kimiButton").addEventListener("click", generateKimiNote);
}

function renderExplanation(alert) {
  $("explainOutput").innerHTML = `
    <div class="score-line">
      <span>Risk score</span>
      <strong>${alert.score}</strong>
    </div>
    ${alert.reasoning.map((item) => `
      <article class="reason">
        <strong>${item.signal} <span>${item.impact}</span></strong>
        <p>${item.detail}</p>
      </article>
    `).join("")}
    <p class="safety-note">The deterministic rules decide severity. Kimi may draft notes, but it does not override the alert level.</p>
  `;
}

async function generateKimiNote() {
  const output = $("kimiOutput");
  const button = $("kimiButton");
  output.textContent = "Calling Kimi through the local server...";
  button.disabled = true;

  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient,
        activePatient,
        scenario: currentScenario,
        alert: currentAlert,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Kimi request failed.");
    }
    output.textContent = payload.note;
  } catch (error) {
    output.textContent = `Live Kimi note unavailable: ${error.message}`;
  } finally {
    button.disabled = false;
  }
}

renderPatient(activePatient);
renderCarePlan();
renderMetrics();
renderQueue();
renderButtons();
runScenario(activePatient.scenarioId);
