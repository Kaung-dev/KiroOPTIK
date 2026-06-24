const seed = window.WellCheckSeed;
const $ = (id) => document.getElementById(id);

let selectedPatient = seed.patients[0];
let selectedAlert = null;

function parseSummary(text) {
  const lower = text.toLowerCase();
  const meds = [];
  if (lower.includes("furosemide")) meds.push("Furosemide 40 mg every morning");
  if (lower.includes("lisinopril")) meds.push("Lisinopril 10 mg every evening");

  return {
    diagnosis: lower.includes("heart failure") ? "Heart failure flare, improved before discharge" : "Post-discharge recovery plan",
    followUp: lower.includes("friday") ? "Cardiology clinic Friday 10:30 AM" : "Follow-up appointment listed in discharge plan",
    meds,
    warnings: [
      "More shortness of breath than yesterday",
      "Chest pain",
      "New swelling or rapid weight gain",
      "Confusion, fall, or fainting",
    ],
  };
}

function scorePatient(patient) {
  const text = patient.transcript
    .filter(([speaker]) => speaker === "patient")
    .map(([, line]) => line.toLowerCase())
    .join(" ");

  let score = patient.risk === "high" ? 2 : 0;
  const evidence = [];
  const reasons = [];

  if (patient.risk === "high") {
    reasons.push(["Baseline risk", "+2", `${patient.name} is high risk: ${patient.barriers.join(", ")}.`]);
  } else {
    reasons.push(["Baseline risk", "+0", `${patient.name} is standard risk with stable supports.`]);
  }

  if (/\b(skipped|could not remember|missed)\b/.test(text) || text.includes("no. i")) {
    score += 2;
    evidence.push("Medication adherence concern reported.");
    reasons.push(["Medication signal", "+2", "Patient answer suggests a missed or misunderstood scheduled medication."]);
  }

  if (text.includes("short of breath") || text.includes("breathing") || text.includes("rescue inhaler")) {
    score += 3;
    evidence.push("Worsening breathing or rescue medication use reported.");
    reasons.push(["Warning sign match", "+3", "Answer maps to discharge warning sign: breathing worse than yesterday."]);
  }

  if (text.includes("swollen") || text.includes("swelling")) {
    score += 2;
    evidence.push("New or worsening swelling reported.");
    reasons.push(["Warning sign match", "+2", "Answer maps to discharge warning sign: new swelling or fluid buildup."]);
  }

  if (evidence.length === 0) {
    evidence.push("No missed medication or worsening symptom reported.");
    reasons.push(["No trigger", "+0", "Transcript did not contain safety escalation signals."]);
  }

  const severity = score >= 7 ? "urgent" : score >= 4 ? "alert" : score >= 2 ? "watch" : "routine";
  const action = {
    urgent: "Call today. Route symptom evidence to the clinical team and confirm medication instructions.",
    alert: "Coordinator callback within one business day for medication education and appointment support.",
    watch: "Send plain-language education and keep next scheduled check-in.",
    routine: "Log routine recovery. No coordinator action needed.",
  }[severity];

  return { score, severity, evidence, reasons, action };
}

function sortedPatients() {
  const rank = { urgent: 4, alert: 3, watch: 2, routine: 1 };
  return seed.patients
    .map((patient) => ({ ...patient, alert: scorePatient(patient) }))
    .sort((a, b) => rank[b.alert.severity] - rank[a.alert.severity]);
}

function renderMetrics() {
  const rows = sortedPatients();
  $("metricPatients").textContent = rows.length;
  $("metricActions").textContent = rows.filter((row) => ["urgent", "alert"].includes(row.alert.severity)).length;
  $("metricUrgent").textContent = rows.filter((row) => row.alert.severity === "urgent").length;
}

function renderQueue() {
  $("queue").innerHTML = sortedPatients().map((patient) => `
    <button class="queue-row ${patient.id === selectedPatient.id ? "active" : ""}" data-id="${patient.id}" type="button">
      <span>
        <strong>${patient.name}</strong>
        <small>${patient.condition} / ${patient.language}<br>${patient.lastCheckIn}</small>
      </span>
      <em class="${patient.alert.severity}">${patient.alert.severity}</em>
    </button>
  `).join("");

  $("queue").onclick = (event) => {
    const row = event.target.closest(".queue-row");
    if (!row) return;
    selectedPatient = seed.patients.find((patient) => patient.id === row.dataset.id) || selectedPatient;
    renderAll();
  };
}

function renderPatient() {
  $("patientName").textContent = selectedPatient.name;
  $("riskBadge").textContent = `${selectedPatient.risk} risk`;
  $("languageBadge").textContent = selectedPatient.language;
  $("patientFacts").innerHTML = `
    <dt>Age</dt><dd>${selectedPatient.age}</dd>
    <dt>Condition</dt><dd>${selectedPatient.condition}</dd>
    <dt>Last check-in</dt><dd>${selectedPatient.lastCheckIn}</dd>
  `;
  $("patientBarriers").innerHTML = `
    <h3>Barriers</h3>
    <ul>${selectedPatient.barriers.map((barrier) => `<li>${barrier}</li>`).join("")}</ul>
  `;
}

function renderPlan() {
  const plan = parseSummary($("summaryInput").value);
  $("planOutput").innerHTML = `
    <h3>${plan.diagnosis}</h3>
    <p><strong>Follow-up:</strong> ${plan.followUp}</p>
    <h4>Medication schedule</h4>
    <ul>${plan.meds.map((med) => `<li>${med}</li>`).join("") || "<li>No medications extracted.</li>"}</ul>
    <h4>Warning signs to check</h4>
    <ul>${plan.warnings.map((warning) => `<li>${warning}</li>`).join("")}</ul>
  `;
}

function renderTranscript() {
  $("transcript").innerHTML = selectedPatient.transcript.map(([speaker, line]) => `
    <article class="bubble ${speaker}">
      <span>${speaker === "agent" ? "WellCheck" : selectedPatient.name}</span>
      <p>${line}</p>
    </article>
  `).join("");
}

function renderAlert() {
  selectedAlert = scorePatient(selectedPatient);
  $("severityBadge").textContent = selectedAlert.severity;
  $("severityBadge").className = selectedAlert.severity;
  $("alertOutput").innerHTML = `
    <div class="alert-card ${selectedAlert.severity}">
      <h3>${selectedAlert.severity.toUpperCase()} / ${selectedPatient.name}</h3>
      <p><strong>Score:</strong> ${selectedAlert.score}</p>
      <h4>Evidence</h4>
      <ul>${selectedAlert.evidence.map((item) => `<li>${item}</li>`).join("")}</ul>
      <h4>Coordinator action</h4>
      <p>${selectedAlert.action}</p>
      <button id="kimiButton" type="button">Generate Kimi Note</button>
      <pre id="kimiOutput">Optional live note appears here when KIMI_API_KEY is set on the local server.</pre>
    </div>
  `;
  $("kimiButton").onclick = generateKimiNote;
}

function renderReasons() {
  $("reasonOutput").innerHTML = selectedAlert.reasons.map(([name, impact, detail]) => `
    <article class="reason">
      <strong>${name}<span>${impact}</span></strong>
      <p>${detail}</p>
    </article>
  `).join("") + `<p class="safety">Deterministic rules assign severity. Kimi can draft text, but it does not override risk.</p>`;
}

async function generateKimiNote() {
  const output = $("kimiOutput");
  output.textContent = "Calling Kimi through the local server...";
  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient: selectedPatient, alert: selectedAlert }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Kimi request failed.");
    output.textContent = payload.note;
  } catch (error) {
    output.textContent = `Live Kimi note unavailable: ${error.message}`;
  }
}

function renderAll() {
  renderMetrics();
  renderQueue();
  renderPatient();
  renderPlan();
  renderTranscript();
  renderAlert();
  renderReasons();
}

$("summaryInput").value = seed.dischargeSummary;
$("parseButton").onclick = renderPlan;
renderAll();
