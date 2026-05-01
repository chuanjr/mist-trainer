// MIST Trainer — Test Transcripts
// 20 transcripts: 10 correct, 10 flawed
// Each entry: { scenarioId, transcript, durationSec, expected }
// expected: { completeness, precision (min), order, fluencyPass, gapsContain }

const { SCENARIOS } = require("./scenarios.js");
const s = Object.fromEntries(SCENARIOS.map(sc => [sc.id, sc]));

const TRANSCRIPTS = [
  // ─────────────────────────────────────────────────────────────────────────
  // CORRECT transcripts (10) — should score high across all dimensions
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "t01-correct",
    scenarioId: "s01",
    transcript: "Mechanism: IED blast at 5 meters, patient thrown 3 meters onto asphalt. Injuries: traumatic amputation right leg below knee, large soft tissue wound right arm. Signs: GCS 13, BP 100/70, heart rate 110, RR 22, SpO2 96%, diaphoretic. Treatment: tourniquet applied at 14:32, wound packed and pressure dressing right arm, IV access established 500mL NS running.",
    durationSec: 28,
    expected: { completeness: 1.0, precisionMin: 0.8, orderIs: "MIST", fluencyPass: true }
  },
  {
    id: "t02-correct",
    scenarioId: "s04",
    transcript: "Mechanism: single gunshot wound left lower abdomen from handgun assault 15 minutes ago. Injuries: entry wound left lower quadrant, no exit wound, abdomen rigid and distended. Signs: GCS 15, HR 128, BP 88/60, RR 24, SpO2 98%, pale, cool, diaphoretic, severe abdominal pain. Treatment: occlusive dressing applied, two large-bore IVs, 500mL NS bolus given, rapid transport initiated.",
    durationSec: 27,
    expected: { completeness: 1.0, precisionMin: 0.8, orderIs: "MIST", fluencyPass: true }
  },
  {
    id: "t03-correct",
    scenarioId: "s07",
    transcript: "Mechanism: single stab wound right chest 20 minutes ago, 10cm blade. Injuries: entry wound right chest 4th intercostal space midaxillary line, absent breath sounds right lower lobe. Signs: GCS 14, HR 116, BP 102/68, RR 28, SpO2 91% on 15 liters, trachea midline, asymmetrical chest expansion. Treatment: occlusive dressing three sides sealed, needle decompression right 2nd ICS midclavicular line with rush of air, SpO2 improving to 95%, IV access established.",
    durationSec: 26,
    expected: { completeness: 1.0, precisionMin: 0.8, orderIs: "MIST", fluencyPass: true }
  },
  {
    id: "t04-correct",
    scenarioId: "s10",
    transcript: "Mechanism: shrapnel wound right thigh from indirect fire, 8 minutes elapsed. Injuries: large jagged wound right proximal thigh, arterial pulsatile hemorrhage, shrapnel visible. Signs: GCS 12, HR 142, BP 70/40, RR 26, SpO2 93%, pale, cold, mottled, confused and combative, estimated blood loss over one liter. Treatment: tourniquet right thigh at 09:14 bleeding controlled, wound packed hemostatic gauze, IO access right tibia, 1L warm NS wide open, ketamine 50mg IV, immediate CASEVAC requested.",
    durationSec: 18,
    expected: { completeness: 1.0, precisionMin: 0.8, orderIs: "MIST", fluencyPass: true }
  },
  {
    id: "t05-correct",
    scenarioId: "s02",
    transcript: "Mechanism: female driver, high-speed head-on collision at 80 kilometers per hour, restrained, airbag deployed, required extrication. Injuries: suspected left femur fracture with thigh deformity, 6cm forehead laceration, seat belt sign abdomen. Signs: GCS 14, HR 98, BP 110/72, RR 20, SpO2 97%, severe left leg pain, abdomen soft but tender across seat belt distribution. Treatment: traction splint left leg, forehead laceration controlled with direct pressure, two large-bore IVs established, 1L NS infusing, C-collar applied, supine on long board.",
    durationSec: 95,
    expected: { completeness: 1.0, precisionMin: 0.8, orderIs: "MIST", fluencyPass: true }
  },
  {
    id: "t06-abbrev",
    scenarioId: "s01",
    transcript: "Mechanism: IED blast at 5 meters, thrown 3 meters. Injuries: TQ amputation right leg BK, soft tissue wound right arm. Signs: GCS 13, BP 100/70, HR 110, RR 22, SpO2 96%. Treatment: TQ at 14:32, wound packed, 18G IV right AC, 500mL NS running.",
    durationSec: 22,
    expected: { completeness: 1.0, precisionMin: 0.8, orderIs: "MIST", fluencyPass: true, noHedges: true }
  },
  {
    id: "t07-correct",
    scenarioId: "s03",
    transcript: "Mechanism: male worker fell 6 meters from scaffolding onto concrete, unwitnessed. Injuries: depressed skull fracture right parietal with active bleeding, suspected right clavicle fracture with deformity, bilateral forearm abrasions. Signs: GCS 10, HR 88, BP 130/85, RR 18, SpO2 94% on 10L non-rebreather, right pupil 5mm sluggish, left 3mm reactive. Treatment: manual C-spine maintained, bulky dressing over skull wound no pressure applied, high-flow O2, IV left AC fluid restricted to TKO rate pending CT, airway positioning maintained.",
    durationSec: 105,
    expected: { completeness: 1.0, precisionMin: 0.8, orderIs: "MIST", fluencyPass: true }
  },
  {
    id: "t08-correct",
    scenarioId: "s05",
    transcript: "Mechanism: witnessed collapse in office, suspected STEMI, bystander CPR within 2 minutes, one AED shock prior to EMS. Injuries: no traumatic injuries, suspected inferior STEMI on 12-lead. Signs: GCS 3 on arrival, apneic, post-ROSC HR 72 irregular, BP 90/60, 12-lead shows STEMI inferior leads, diaphoretic. Treatment: CPR continued until ROSC at 6 minutes, intubated 7.5 ET tube confirmed with waveform capnography and bilateral breath sounds, IV right AC, 250mL NS bolus for post-ROSC hypotension, aspirin 325mg via NG, cath lab activation requested.",
    durationSec: 160,
    expected: { completeness: 1.0, precisionMin: 0.8, orderIs: "MIST", fluencyPass: true }
  },
  {
    id: "t09-correct",
    scenarioId: "s08",
    transcript: "Mechanism: unhelmeted motorcyclist ejected at 60 km/h, struck guardrail. Injuries: large posterior scalp laceration active bleeding, suspected basal skull fracture with bilateral periorbital ecchymosis, road rash bilateral arms and legs. Signs: GCS 8, HR 58, BP 145/90, RR 10, SpO2 92%, right pupil blown at 7mm fixed, left 3mm sluggish — Cushing's triad present. Treatment: manual C-spine maintained, scalp wound direct pressure, BVM ventilation at 20 per minute for mild hyperventilation, IV access fluid restricted, OPA inserted tolerated, neurosurgery alerted.",
    durationSec: 28,
    expected: { completeness: 1.0, precisionMin: 0.8, orderIs: "MIST", fluencyPass: true }
  },
  {
    id: "t10-correct",
    scenarioId: "s06",
    transcript: "Mechanism: female soldier caught in unintentional blast detonation at 2 meters during training, no PPE. Injuries: burns bilateral hands and forearms estimated 8% BSA superficial partial thickness, ruptured left tympanic membrane, no penetrating wounds. Signs: GCS 15, HR 92, BP 118/76, RR 18, SpO2 99%, ringing both ears, pain 6 out of 10 bilateral hands, calm and cooperative. Treatment: burned areas cooled with sterile water, non-adherent dressings applied, IV access, morphine 4mg IV, left ear covered, tetanus current.",
    durationSec: 100,
    expected: { completeness: 1.0, precisionMin: 0.8, orderIs: "MIST", fluencyPass: true }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FLAWED transcripts (10) — specific deductions expected
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "t11-wrong-order",
    scenarioId: "s01",
    transcript: "Injuries: traumatic amputation right leg below knee, soft tissue wound right arm. Mechanism: IED blast at 5 meters. Signs: GCS 13, BP 100/70, HR 110. Treatment: tourniquet at 14:32, wound packed, IV running.",
    durationSec: 22,
    expected: { completeness: 1.0, orderIsNot: "MIST", fluencyPass: true }
  },
  {
    id: "t12-missing-treatment",
    scenarioId: "s01",
    transcript: "Mechanism: IED blast at 5 meters, thrown 3 meters. Injuries: traumatic amputation right leg below knee, large wound right arm. Signs: GCS 13, BP 100/70, HR 110, SpO2 96%, diaphoretic.",
    durationSec: 20,
    expected: { completeness: 0.75, components: { treatment: false }, fluencyPass: true }
  },
  {
    id: "t13-vague-language",
    scenarioId: "s04",
    transcript: "Mechanism: patient was shot in the abdomen, seems like it happened maybe 15 minutes ago or so. Injuries: there's a wound in the lower abdomen, belly feels kind of rigid. Signs: GCS seems like 15, BP is low, heart rate is fast, he seems pretty sick. Treatment: we covered the wound, got some fluids going, he's heading to the trauma center.",
    durationSec: 27,
    expected: { completeness: 1.0, precisionMax: 0.4, hedgesMin: 3, fluencyPass: true }
  },
  {
    id: "t14-gcs-range",
    scenarioId: "s02",
    transcript: "Mechanism: high-speed MVA, restrained driver, required extrication. Injuries: left femur fracture, forehead laceration, seat belt sign. Signs: GCS around 13 to 15, HR approximately 98, BP about 110/72, SpO2 97%. Treatment: traction splint, pressure dressing, two IVs, C-collar, long board.",
    durationSec: 90,
    expected: { completeness: 1.0, hedgesMin: 2, fluencyPass: true, gapsContain: ["GCS"] }
  },
  {
    id: "t15-over-time",
    scenarioId: "s07",
    transcript: "Mechanism: this patient was stabbed once in the right side of the chest during a fight, the knife was about 10 centimeters and this happened about 20 minutes ago. Injuries: single stab wound right chest 4th intercostal space, no breath sounds right lower lobe. Signs: GCS 14, HR 116, BP 102/68, RR 28, SpO2 91% on 15 liters, trachea midline, asymmetrical expansion. Treatment: occlusive dressing three-sided, needle decompression right 2nd ICS with rush of air, SpO2 improving, IV access established.",
    durationSec: 45,
    expected: { completeness: 1.0, fluencyPass: false } // timeLimitSec is 30
  },
  {
    id: "t16-wrong-order-all-present",
    scenarioId: "s10",
    transcript: "Treatment: tourniquet right thigh at 09:14, IO access right tibia, 1L NS wide open, ketamine 50mg. Signs: GCS 12, HR 142, BP 70/40, SpO2 93%, combative and confused, over 1L blood loss. Injuries: large jagged wound right proximal thigh, pulsatile arterial bleeding, shrapnel visible. Mechanism: shrapnel wound right thigh from indirect fire, 8 minutes elapsed.",
    durationSec: 18,
    expected: { completeness: 1.0, orderIsNot: "MIST", fluencyPass: true }
  },
  {
    id: "t17-mechanism-only",
    scenarioId: "s01",
    transcript: "The patient was hit by an IED blast at approximately 5 meters distance and was thrown about 3 meters onto the asphalt.",
    durationSec: 12,
    expected: { completeness: 0.25, components: { mechanism: true, injuries: false, signs: false, treatment: false } }
  },
  {
    id: "t18-missing-injuries-and-treatment",
    scenarioId: "s04",
    transcript: "Mechanism: single gunshot left lower abdomen 15 minutes ago. Signs: GCS 15, HR 128, BP 88/60, RR 24, SpO2 98%, rigid abdomen, diaphoretic.",
    durationSec: 18,
    expected: { completeness: 0.5, components: { mechanism: true, injuries: false, signs: true, treatment: false } }
  },
  {
    id: "t19-fence-wrapped-mock",
    scenarioId: "s01",
    // This transcript is a placeholder — test-harness uses a mock response for this test
    // to verify fence-stripping logic without an API call
    transcript: "__FENCE_TEST__",
    durationSec: 25,
    expected: { _isFenceTest: true }
  },
  {
    id: "t20-consistency-check",
    // Same as t01 — run 3 times, assert identical results
    scenarioId: "s01",
    transcript: "Mechanism: IED blast at 5 meters, patient thrown 3 meters onto asphalt. Injuries: traumatic amputation right leg below knee, large soft tissue wound right arm. Signs: GCS 13, BP 100/70, heart rate 110, RR 22, SpO2 96%, diaphoretic. Treatment: tourniquet applied at 14:32, wound packed and pressure dressing right arm, IV access established 500mL NS running.",
    durationSec: 28,
    expected: { _isConsistencyCheck: true, runs: 3 }
  }
];

if (typeof module !== "undefined") module.exports = { TRANSCRIPTS };
