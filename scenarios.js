// MIST Trainer — Scenario Data
// Each scenario carries its own timeLimitSec (MEDEVAC: 20-30s, hospital transfer: 120-180s)
// difficulty "pressure": shorter time, complex vitals, UI shows red countdown

const SCENARIOS = [
  {
    id: "s01",
    title: "IED blast, urban patrol",
    mechanism: "Male soldier struck by IED detonation at approximately 5 meters. Thrown 3 meters, landed on asphalt.",
    patient: {
      age: 24,
      sex: "M",
      GCS: 13,
      bp: "100/70",
      hr: 110,
      rr: 22,
      spo2: 96
    },
    injuries: "Traumatic amputation of right leg below knee. Blast injury to right arm with large soft tissue wound. No penetrating chest or abdominal wounds noted.",
    signs: "GCS 13, tachycardic at 110, BP 100/70, RR 22, SpO2 96% on room air. Diaphoretic. Pupils equal and reactive.",
    treatment: "Right leg tourniquet applied at 14:32. Wound packed and pressure dressing applied to right arm. 18G IV right AC established, 500mL NS running. Patient alert, oriented to person and place only.",
    timeLimitSec: 30,
    difficulty: "pressure"
  },
  {
    id: "s02",
    title: "Motor vehicle accident, rural highway",
    mechanism: "Female driver in high-speed head-on collision at estimated 80 km/h. Restrained. Airbag deployed. Extrication required.",
    patient: {
      age: 38,
      sex: "F",
      GCS: 14,
      bp: "110/72",
      hr: 98,
      rr: 20,
      spo2: 97
    },
    injuries: "Suspected left femur fracture — left thigh deformity, severe pain. Laceration to forehead approximately 6 cm. Seat belt sign across abdomen.",
    signs: "GCS 14, HR 98, BP 110/72, RR 20, SpO2 97%. Complaining of severe left leg pain. Abdomen soft on palpation but tender across seat belt distribution.",
    treatment: "Traction splint applied to left leg. Forehead laceration controlled with direct pressure. Two large-bore IVs established, 1L NS infusing. C-collar applied. Transported supine on long board.",
    timeLimitSec: 120,
    difficulty: "standard"
  },
  {
    id: "s03",
    title: "Fall from height, construction site",
    mechanism: "Male worker fell approximately 6 meters from scaffolding onto concrete. Unwitnessed fall. Found prone.",
    patient: {
      age: 45,
      sex: "M",
      GCS: 10,
      bp: "130/85",
      hr: 88,
      rr: 18,
      spo2: 94
    },
    injuries: "Depressed skull fracture right parietal region with active bleeding. Suspected right clavicle fracture — deformity noted. Abrasions bilateral forearms.",
    signs: "GCS 10 (E3V3M4), HR 88, BP 130/85, RR 18, SpO2 94% on 10L non-rebreather. Right pupil 5mm sluggish, left 3mm reactive. Battle's sign absent.",
    treatment: "Manual C-spine held throughout. Skull wound covered with bulky dressing — no pressure applied over fracture site. High-flow O2 via non-rebreather. IV access left AC, fluid restricted to TKO rate pending CT. Airway positioning maintained.",
    timeLimitSec: 120,
    difficulty: "standard"
  },
  {
    id: "s04",
    title: "Gunshot wound, single entry abdomen",
    mechanism: "Male civilian shot once in the left lower abdomen. Assault with handgun. Shooting occurred approximately 15 minutes prior to arrival.",
    patient: {
      age: 29,
      sex: "M",
      GCS: 15,
      bp: "88/60",
      hr: 128,
      rr: 24,
      spo2: 98
    },
    injuries: "Single entry wound left lower quadrant, no exit wound found. Abdomen rigid and distended. No active external hemorrhage.",
    signs: "GCS 15, HR 128, BP 88/60, RR 24, SpO2 98%. Skin pale, cool, diaphoretic. Reports 8/10 abdominal pain. Abdomen rigid on palpation.",
    treatment: "Wound covered with occlusive dressing. Two large-bore IVs bilateral ACs, 500mL NS bolus given, now running wide open. Patient supine, knees flexed. Rapid transport initiated — ETA 8 minutes to trauma center.",
    timeLimitSec: 30,
    difficulty: "pressure"
  },
  {
    id: "s05",
    title: "Medical collapse, cardiac arrest bystander CPR",
    mechanism: "Male found unresponsive in office. Witnessed collapse. Bystander CPR initiated within 2 minutes. AED delivered one shock prior to EMS arrival.",
    patient: {
      age: 62,
      sex: "M",
      GCS: 3,
      bp: "90/60",
      hr: 72,
      rr: 0
    },
    injuries: "No traumatic injuries identified. Suspected ST-elevation MI based on 12-lead. No external bleeding.",
    signs: "GCS 3, apneic on arrival — now BVM ventilated at 10/min. Post-ROSC HR 72 irregular, BP 90/60. 12-lead shows STEMI pattern inferior leads. Diaphoretic.",
    treatment: "CPR continued until ROSC achieved at 6 minutes. Intubated 7.5 ET tube, placement confirmed with waveform capnography and bilateral breath sounds. IV access right AC, 250mL NS bolus for post-ROSC hypotension. Aspirin 325mg crushed and given via NG. Cath lab activation requested.",
    timeLimitSec: 180,
    difficulty: "standard"
  },
  {
    id: "s06",
    title: "Blast injury, training exercise accident",
    mechanism: "Female soldier caught in unintentional detonation of simulated charge at 2 meters during training. Standing, no PPE for blast.",
    patient: {
      age: 21,
      sex: "F",
      GCS: 15,
      bp: "118/76",
      hr: 92,
      rr: 18,
      spo2: 99
    },
    injuries: "Burns to bilateral hands and forearms, estimated 8% BSA superficial partial thickness. Ruptured left tympanic membrane — confirmed on exam. No penetrating wounds. No eye involvement.",
    signs: "GCS 15, HR 92, BP 118/76, RR 18, SpO2 99%. Reports ringing in both ears. Pain 6/10 bilateral hands. Calm and cooperative.",
    treatment: "Burned areas cooled with sterile water, then covered with non-adherent dressings. IV access established, morphine 4mg IV given for pain. Left ear covered. Tetanus documented as current.",
    timeLimitSec: 120,
    difficulty: "standard"
  },
  {
    id: "s07",
    title: "Penetrating chest trauma, stab wound",
    mechanism: "Male stabbed once in right chest during altercation. Knife recovered at scene, blade approximately 10 cm. Time of injury 20 minutes ago.",
    patient: {
      age: 34,
      sex: "M",
      GCS: 14,
      bp: "102/68",
      hr: 116,
      rr: 28,
      spo2: 91
    },
    injuries: "Single stab wound right chest 4th intercostal space midaxillary line, approximately 1 cm entry. Absent breath sounds right lower lobe. Trachea midline.",
    signs: "GCS 14, HR 116, BP 102/68, RR 28, SpO2 91% on 15L O2. Chest wall asymmetrical expansion. No JVD. Trachea midline. Increasing respiratory distress.",
    treatment: "Occlusive dressing applied, three sides sealed. Needle decompression performed right 2nd ICS midclavicular line — rush of air, SpO2 improving to 95%. IV established, fluid running. Chest seal checked — no tension signs recurring.",
    timeLimitSec: 30,
    difficulty: "pressure"
  },
  {
    id: "s08",
    title: "Traumatic brain injury, motorcycle crash",
    mechanism: "Male motorcyclist ejected at estimated 60 km/h after losing control on wet road. Not helmeted. Struck guardrail.",
    patient: {
      age: 27,
      sex: "M",
      GCS: 8,
      bp: "145/90",
      hr: 58,
      rr: 10,
      spo2: 92
    },
    injuries: "Large scalp laceration posterior skull with active bleeding. Suspected basal skull fracture — bilateral periorbital ecchymosis noted. Road rash bilateral arms and legs.",
    signs: "GCS 8 (E2V2M4), HR 58, BP 145/90, RR 10 — Cushing's triad present. Right pupil blown (7mm fixed), left 3mm sluggish. SpO2 92%.",
    treatment: "Manual C-spine maintained. Scalp wound controlled with direct pressure. BVM ventilation at 20/min for mild hyperventilation given suspected herniation. IV access, fluid restricted. Neurosurgery alerted. Airway adjunct OPA inserted, tolerating.",
    timeLimitSec: 30,
    difficulty: "pressure"
  },
  {
    id: "s09",
    title: "Mass casualty, explosion — walking wounded",
    mechanism: "Female civilian injured in building explosion. Self-extricated and ambulatory. Estimated 10 meters from epicenter at time of blast.",
    patient: {
      age: 52,
      sex: "F",
      GCS: 15,
      bp: "132/84",
      hr: 88,
      rr: 16,
      spo2: 98
    },
    injuries: "Bilateral tympanic membrane rupture. Multiple small lacerations bilateral lower legs from glass, longest approximately 3 cm, all superficial. No penetrating wounds identified.",
    signs: "GCS 15, HR 88, BP 132/84, RR 16, SpO2 98%. Ambulatory at scene. Reports significant hearing loss and ringing. Dazed but oriented x4.",
    treatment: "Lacerations irrigated and dressed. Ears covered bilaterally. Vital signs stable x 2 assessments. Tagged Green — secondary priority. Documented for blast injury follow-up (pulmonary blast injury concern within 6 hours).",
    timeLimitSec: 120,
    difficulty: "standard"
  },
  {
    id: "s10",
    title: "Hemorrhagic shock, femoral artery injury",
    mechanism: "Male soldier struck by shrapnel to right thigh during indirect fire attack. Approximately 8 minutes elapsed since injury. Found by buddy.",
    patient: {
      age: 22,
      sex: "M",
      GCS: 12,
      bp: "70/40",
      hr: 142,
      rr: 26,
      spo2: 93
    },
    injuries: "Large jagged wound right proximal thigh with arterial hemorrhage — pulsatile bleeding present on arrival. Shrapnel fragment visible in wound. No other penetrating injuries identified.",
    signs: "GCS 12, HR 142, BP 70/40, RR 26, SpO2 93%. Skin pale, cold, mottled. Altered — confused and combative. Estimated blood loss greater than 1 liter at scene.",
    treatment: "Tourniquet applied right thigh at 09:14, bleeding controlled. Wound packed with hemostatic gauze, pressure dressing over. IO access right tibia — 16G IO, 1L warm NS wide open. Ketamine 50mg IV for combativeness. Immediate CASEVAC requested.",
    timeLimitSec: 20,
    difficulty: "pressure"
  }
];

if (typeof module !== "undefined") module.exports = { SCENARIOS };
