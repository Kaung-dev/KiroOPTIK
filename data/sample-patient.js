window.wellcheckData = {};

window.wellcheckData.patient = {
  id: "P-1042",
  name: "Maria Lopez",
  age: 78,
  language: "English / Spanish",
  condition: "Heart failure discharge",
  baselineRisk: "high",
  riskReasons: ["Age over 75", "Heart failure", "Lives alone", "New medication schedule"],
};

window.wellcheckData.carePlan = {
  diagnosis: "Heart failure flare-up, improved after hospital treatment",
  goals: [
    "Keep breathing stable",
    "Prevent fluid buildup",
    "Take medicines on schedule",
    "Attend cardiology follow-up",
  ],
  medications: [
    { name: "Furosemide", dose: "40 mg", timing: "Every morning", critical: true, plain: "water pill" },
    { name: "Lisinopril", dose: "10 mg", timing: "Every evening", critical: true, plain: "blood pressure medicine" },
    { name: "Acetaminophen", dose: "500 mg", timing: "As needed for mild pain", critical: false, plain: "pain reliever" },
  ],
  appointment: {
    clinic: "Cardiology follow-up",
    date: "Friday at 10:30 AM",
    location: "Cognizant Community Clinic, 2nd floor",
  },
  warningSigns: [
    "More trouble breathing than yesterday",
    "New chest pain",
    "Swelling in legs or belly",
    "Weight gain of 2 or more pounds overnight",
    "Confusion, fall, or fainting",
  ],
};

window.wellcheckData.scenarios = [
  {
    id: "routine",
    label: "Routine recovery",
    summary: "Patient understands the plan and reports no concerning symptoms.",
    language: "en",
    responses: [
      ["agent", "Hi Maria, this is WellCheck. I am here to help review your recovery plan. I do not replace your care team, but I can help them know if you need a call."],
      ["agent", "Did you take your water pill, furosemide, this morning?"],
      ["patient", "Yes, I took it with breakfast."],
      ["agent", "Are you having more trouble breathing than yesterday?"],
      ["patient", "No, my breathing is better today."],
      ["agent", "Do you have new chest pain, swelling, a fall, or confusion?"],
      ["patient", "No, none of those."],
      ["agent", "Your cardiology follow-up is Friday at 10:30 AM. Do you have a way to get there?"],
      ["patient", "Yes, my daughter will take me."],
    ],
  },
  {
    id: "missed-med",
    label: "Missed medication",
    summary: "Patient missed a critical medication but reports stable symptoms.",
    language: "en",
    responses: [
      ["agent", "Hi Maria, this is WellCheck. I am here to help review your recovery plan. I do not replace your care team, but I can help them know if you need a call."],
      ["agent", "Did you take your water pill, furosemide, this morning?"],
      ["patient", "No, I skipped it because I thought it was only for swelling."],
      ["agent", "Thank you for telling me. Are you having more trouble breathing than yesterday?"],
      ["patient", "No, my breathing is about the same."],
      ["agent", "Do you have new chest pain, swelling, a fall, or confusion?"],
      ["patient", "No chest pain or confusion."],
      ["agent", "Your cardiology follow-up is Friday at 10:30 AM. Do you have a way to get there?"],
      ["patient", "I think so, but I need to confirm with my daughter."],
    ],
  },
  {
    id: "worse",
    label: "Worsening symptoms",
    summary: "Patient missed a critical medication and reports worsening breathing.",
    language: "en",
    responses: [
      ["agent", "Hi Maria, this is WellCheck. I am here to help review your recovery plan. I do not replace your care team, but I can help them know if you need a call."],
      ["agent", "Did you take your water pill, furosemide, this morning?"],
      ["patient", "No. I was worried I would need the bathroom too much."],
      ["agent", "I understand. Are you having more trouble breathing than yesterday?"],
      ["patient", "Yes. I had to sleep sitting up and I feel short of breath walking to the kitchen."],
      ["agent", "Do you have new chest pain, swelling, a fall, or confusion?"],
      ["patient", "My ankles are more swollen, but no chest pain."],
      ["agent", "Thank you. I am going to flag this for your care team so they can decide the next step."],
    ],
  },
  {
    id: "spanish",
    label: "Spanish support",
    summary: "Patient-facing prompts are shown in Spanish for accessibility.",
    language: "es",
    responses: [
      ["agent", "Hola Maria, soy WellCheck. Estoy aqui para repasar su plan de recuperacion. No reemplazo a su equipo medico, pero puedo avisarles si necesita una llamada."],
      ["agent", "Tomo su pastilla de agua, furosemida, esta manana?"],
      ["patient", "Si, la tome con el desayuno."],
      ["agent", "Tiene mas dificultad para respirar que ayer?"],
      ["patient", "No, hoy respiro mejor."],
      ["agent", "Tiene dolor nuevo en el pecho, hinchazon, una caida o confusion?"],
      ["patient", "No, nada de eso."],
      ["agent", "Su cita de cardiologia es el viernes a las 10:30 AM. Tiene transporte?"],
      ["patient", "Si, mi hija me llevara."],
    ],
  },
];
