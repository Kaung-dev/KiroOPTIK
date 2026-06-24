const { patient, carePlan, scenarios } = window.wellcheckData;

const $ = (id) => document.getElementById(id);

function renderPatient() {
  $("patientName").textContent = patient.name;
  $("riskBadge").textContent = `${patient.baselineRisk} risk`;
  $("patientFacts").innerHTML = `
    <dt>Age</dt><dd>${patient.age}</dd>
    <dt>Language</dt><dd>${patient.language}</dd>
    <dt>Condition</dt><dd>${patient.condition}</dd>
  `;
  $("riskReasons").innerHTML = patient.riskReasons.map((reason) => `<li>${reason}</li>`).join("");
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

function scoreScenario(scenario) {
  const patientText = scenario.responses
    .filter(([speaker]) => speaker === "patient")
    .map(([, text]) => text.toLowerCase())
    .join(" ");

  const evidence = [];
  let score = patient.baselineRisk === "high" ? 1 : 0;

  const missedCriticalMedication =
    /\b(skipped|missed)\b/.test(patientText) ||
    patientText.startsWith("no. ") ||
    patientText.includes(" no. i ");

  if (missedCriticalMedication) {
    score += 2;
    evidence.push("Missed critical medication: furosemide was not taken as scheduled.");
  }

  if (patientText.includes("short of breath") || patientText.includes("more trouble breathing") || patientText.includes("sleep sitting up")) {
    score += 3;
    evidence.push("Worsening breathing: patient reports sleeping sitting up and shortness of breath walking.");
  }

  if (patientText.includes("swollen") || patientText.includes("swelling")) {
    score += 2;
    evidence.push("Fluid warning sign: patient reports increased ankle swelling.");
  }

  if (patientText.includes("confirm with my daughter")) {
    score += 1;
    evidence.push("Appointment risk: transportation is not fully confirmed.");
  }

  if (evidence.length === 0) {
    evidence.push("No missed medication, worsening symptom, or transportation barrier reported.");
  }

  if (score >= 6) {
    return {
      severity: "urgent",
      evidence,
      action: "Place Maria at the top of the coordinator call queue today. Confirm medication plan and route symptom escalation to the clinical team.",
    };
  }

  if (score >= 3) {
    return {
      severity: "alert",
      evidence,
      action: "Coordinator should call within one business day to review medication adherence and appointment logistics.",
    };
  }

  if (score >= 2) {
    return {
      severity: "watch",
      evidence,
      action: "Send education reminder and keep patient on the next scheduled check-in.",
    };
  }

  return {
    severity: "routine",
    evidence,
    action: "Log routine check-in. No clinical alert needed.",
  };
}

let currentScenario = null;
let currentAlert = null;

function renderButtons() {
  $("scenarioButtons").innerHTML = scenarios.map((scenario, index) => `
    <button class="${index === 2 ? "active" : ""}" data-id="${scenario.id}">${scenario.label}</button>
  `).join("");

  $("scenarioButtons").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    document.querySelectorAll(".scenario-row button").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    runScenario(button.dataset.id);
  });
}

function runScenario(id) {
  const scenario = scenarios.find((item) => item.id === id) ?? scenarios[0];
  const alert = scoreScenario(scenario);
  currentScenario = scenario;
  currentAlert = alert;

  $("scenarioSummary").textContent = scenario.summary;
  $("chatLog").innerHTML = scenario.responses.map(([speaker, text]) => `
    <article class="bubble ${speaker}">
      <span>${speaker === "agent" ? "WellCheck" : patient.name}</span>
      <p>${text}</p>
    </article>
  `).join("");

  $("severityBadge").textContent = alert.severity;
  $("severityBadge").className = alert.severity;
  $("alertOutput").innerHTML = `
    <div class="alert-card ${alert.severity}">
      <h3>${alert.severity.toUpperCase()} / ${patient.name}</h3>
      <p><strong>Profile:</strong> ${patient.age}, ${patient.condition}, ${patient.baselineRisk} baseline risk.</p>
      <h4>Evidence</h4>
      <ul>${alert.evidence.map((item) => `<li>${item}</li>`).join("")}</ul>
      <h4>Recommended coordinator action</h4>
      <p>${alert.action}</p>
      <button id="kimiButton" type="button">Generate Kimi coordinator note</button>
      <pre id="kimiOutput" class="kimi-output">Optional live agent note appears here when the local server has KIMI_API_KEY set.</pre>
      <small>Generated from simulated post-discharge check-in transcript.</small>
    </div>
  `;
  $("kimiButton").addEventListener("click", generateKimiNote);
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

renderPatient();
renderCarePlan();
renderButtons();
runScenario("worse");
