// 3-Tier Hierarchical Focus Area Data Structure
// Extracted from notepad - comprehensive muscle and movement targeting system

// Primary regions (Tier 1)
export const PRIMARY_REGIONS = [
  { label: "Upper Body", value: "upper_body" },
  { label: "Lower Body", value: "lower_body" },
  { label: "Core", value: "core" },
  { label: "Full Body", value: "full_body" },
  { label: "Mobility & Flexibility", value: "mobility" },
  { label: "Recovery & Stretching", value: "recovery" },
];

// Secondary muscle groups by primary region (Tier 2)
export const SECONDARY_MUSCLES = {
  upper_body: [
    { label: "Chest", value: "chest", hasTertiary: true },
    { label: "Back", value: "back", hasTertiary: true },
    { label: "Shoulders", value: "shoulders", hasTertiary: true },
    { label: "Biceps", value: "biceps", hasTertiary: true },
    { label: "Triceps", value: "triceps", hasTertiary: true },
  ],
  lower_body: [
    { label: "Quads", value: "quads", hasTertiary: true },
    { label: "Hamstrings", value: "hamstrings", hasTertiary: true },
    { label: "Glutes", value: "glutes", hasTertiary: true },
    { label: "Calves", value: "calves", hasTertiary: true },
  ],
  core: [
    { label: "Abs", value: "abs", hasTertiary: true },
    { label: "Obliques", value: "obliques", hasTertiary: true },
    { label: "Lower Back", value: "lower_back", hasTertiary: true },
  ],
  full_body: [
    { label: "Core & Stabilizers", value: "full_body_core", hasTertiary: true },
    { label: "Posterior Chain", value: "posterior_chain", hasTertiary: true },
    { label: "Functional Movement", value: "functional_movement", hasTertiary: true },
  ],
  mobility: [
    { label: "Hips", value: "hips", hasTertiary: true },
    { label: "Ankles", value: "ankles", hasTertiary: true },
    { label: "Shoulders", value: "mobility_shoulders", hasTertiary: true },
    { label: "Thoracic Spine", value: "thoracic_spine", hasTertiary: false },
  ],
  recovery: [
    { label: "Foam Rolling", value: "foam_rolling", hasTertiary: false },
    { label: "Static Stretching", value: "static_stretching", hasTertiary: false },
    { label: "PNF", value: "pnf", hasTertiary: false },
    { label: "Breathing/Meditation", value: "breathing_meditation", hasTertiary: false },
  ],
};

// Tertiary specific areas (Tier 3)
export const TERTIARY_AREAS = {
  chest: [
    { label: "Upper Chest (Clavicular)", value: "upper_chest" },
    { label: "Lower Chest (Sternal)", value: "lower_chest" },
  ],
  back: [
    { label: "Lats (Wing Muscles)", value: "lats" },
    { label: "Traps (Upper Back)", value: "traps" },
    { label: "Rhomboids (Mid Back)", value: "rhomboids" },
    { label: "Erector Spinae (Lower Back)", value: "erector_spinae" },
  ],
  shoulders: [
    { label: "Front Delts (Anterior)", value: "anterior_delt" },
    { label: "Side Delts (Lateral)", value: "lateral_delt" },
    { label: "Rear Delts (Posterior)", value: "rear_delt" },
  ],
  biceps: [
    { label: "Inner Bicep (Short Head)", value: "biceps_short_head" },
    { label: "Outer Bicep (Long Head)", value: "biceps_long_head" },
    { label: "Brachialis (Deep Arm)", value: "brachialis" },
  ],
  triceps: [
    { label: "Long Head (Inner Tricep)", value: "triceps_long_head" },
    { label: "Lateral Head (Outer Tricep)", value: "triceps_lateral_head" },
    { label: "Medial Head (Deep Tricep)", value: "triceps_medial_head" },
  ],
  quads: [
    { label: "Rectus Femoris (Center Quad)", value: "rectus_femoris" },
    { label: "Vastus Lateralis (Outer Quad)", value: "vastus_lateralis" },
    { label: "Vastus Medialis (Inner Quad/VMO)", value: "vastus_medialis" },
    { label: "Vastus Intermedius (Deep Quad)", value: "vastus_intermedius" },
  ],
  glutes: [
    { label: "Glute Max (Main Butt Muscle)", value: "glute_max" },
    { label: "Glute Med (Side Glutes)", value: "glute_med" },
    { label: "Glute Min (Deep Side Glutes)", value: "glute_min" },
  ],
  hamstrings: [
    { label: "Biceps Femoris (Outer Hamstring)", value: "biceps_femoris" },
    { label: "Semitendinosus (Inner Hamstring)", value: "semitendinosus" },
    { label: "Semimembranosus (Deep Inner Hamstring)", value: "semimembranosus" },
  ],
  calves: [
    { label: "Inner Calf (Medial Gastrocnemius)", value: "gastrocnemius_medial" },
    { label: "Outer Calf (Lateral Gastrocnemius)", value: "gastrocnemius_lateral" },
    { label: "Deep Calf (Soleus)", value: "soleus" },
  ],
  abs: [
    { label: "Upper Abs (Top Six-Pack)", value: "upper_abs" },
    { label: "Lower Abs (Bottom Six-Pack)", value: "lower_abs" },
    { label: "Deep Core (TVA)", value: "tva" },
    { label: "Pelvic Floor (Core Foundation)", value: "pelvic_floor" },
  ],
  obliques: [
    { label: "Internal Obliques (Deep Side Abs)", value: "internal_obliques" },
    { label: "External Obliques (Surface Side Abs)", value: "external_obliques" },
  ],
  lower_back: [
    { label: "Erector Spinae (Spine Muscles)", value: "lower_erector_spinae" },
    { label: "Multifidus (Deep Spine Stabilizers)", value: "multifidus" },
    { label: "QL (Side Lower Back)", value: "quadratus_lumborum" },
  ],
  hips: [
    { label: "Hip Flexors (Front Hip)", value: "hip_flexors" },
    { label: "Glute Med (Side Hip)", value: "hip_glute_med" },
    { label: "TFL (Hip/IT Band)", value: "tfl" },
    { label: "Piriformis (Deep Hip)", value: "piriformis" },
  ],
  ankles: [
    { label: "Shin Muscles (Dorsiflexors)", value: "dorsiflexors" },
    { label: "Calf Muscles (Plantarflexors)", value: "plantarflexors" },
    { label: "Inner Ankle (Inverters)", value: "inverters" },
    { label: "Outer Ankle (Everters)", value: "everters" },
  ],
  mobility_shoulders: [
    { label: "Front Rotator Cuff (Subscapularis)", value: "subscapularis" },
    { label: "Top Rotator Cuff (Supraspinatus)", value: "supraspinatus" },
    { label: "Back Rotator Cuff (Infraspinatus)", value: "infraspinatus" },
    { label: "Small Rotator Cuff (Teres Minor)", value: "teres_minor" },
  ],
  full_body_core: [
    { label: "Deep Stabilizers (TVA)", value: "deep_stabilizers" },
    { label: "Diaphragm & Breathing", value: "diaphragm_breathing" },
    { label: "Multifidus (Spine Stability)", value: "multifidus_spine" },
    { label: "Pelvic Floor (Foundation)", value: "pelvic_floor_stability" },
  ],
  posterior_chain: [
    { label: "Glutes & Hamstrings", value: "glutes_hamstrings" },
    { label: "Erector Spinae (Back)", value: "erector_spinae_back" },
    { label: "Lats & Rhomboids", value: "lats_rhomboids" },
    { label: "Rear Delts & Traps", value: "rear_delts_traps" },
  ],
  functional_movement: [
    { label: "Hip-Shoulder Integration", value: "hip_shoulder_integration" },
    { label: "Anti-Rotation (Core)", value: "anti_rotation_core" },
    { label: "Multi-Planar Movement", value: "multi_planar_movement" },
    { label: "Compound Movement Patterns", value: "compound_patterns" },
  ],
};

// Type definitions for the hierarchical data
export interface AreaOption {
  label: string;
  value: string;
  level: 'primary' | 'secondary' | 'tertiary';
}

export interface SecondaryMuscle {
  label: string;
  value: string;
  hasTertiary: boolean;
}

export interface TertiaryArea {
  label: string;
  value: string;
}

export interface PrimaryRegion {
  label: string;
  value: string;
}

// Type-safe accessors for the data
export type PrimaryRegionKey = keyof typeof SECONDARY_MUSCLES;
export type SecondaryMuscleKey = keyof typeof TERTIARY_AREAS; 