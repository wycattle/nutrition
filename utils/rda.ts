// Daily Values — Men 50+ (RDA/DRI; derived from FDA 2020 DVs and NIH DRI tables)
// vit_d_mcg: 20, calcium_mg: 1300 (FDA DV), iron_mg: 8, potassium_mg: 3400
export const RDA: Record<string, number> = {
  omega3: 1.6, 
  omega6: 14, 
  cholesterol_mg: 300, 
  sodium_mg: 2300,
  potassium_mg: 3400, 
  calcium_mg: 1300, 
  iron_mg: 8, 
  magnesium_mg: 420,
  iodine_mcg: 150, 
  manganese_mg: 2.3, 
  selenium_mcg: 55, 
  zinc_mg: 11,
  vit_a_mcg: 900, 
  vit_b1_mg: 1.2, 
  vit_b2_mg: 1.3, 
  vit_b3_mg: 16,
  vit_b5_mg: 5, 
  vit_b6_mg: 1.7, 
  vit_b12_mcg: 2.4, 
  biotin_mcg: 30,
  choline_mg: 550, 
  folate_mcg: 400, 
  vit_c_mg: 90, 
  vit_d_mcg: 20,
  vit_e_mg: 15, 
  vit_k_mcg: 120,
};

// RDA values — Women 19-50 (commented out; kept for reference)
// export const RDA: Record<string, number> = {
//   omega3: 1.1, omega6: 12, cholesterol_mg: 300, sodium_mg: 2300,
//   potassium_mg: 2600, calcium_mg: 1000, iron_mg: 18, magnesium_mg: 310,
//   iodine_mcg: 150, manganese_mg: 1.8, selenium_mcg: 55, zinc_mg: 8,
//   vit_a_mcg: 700, vit_b1_mg: 1.1, vit_b2_mg: 1.1, vit_b3_mg: 14,
//   vit_b5_mg: 5, vit_b6_mg: 1.3, vit_b12_mcg: 2.4, biotin_mcg: 30,
//   choline_mg: 425, folate_mcg: 400, vit_c_mg: 75, vit_d_mcg: 15,
//   vit_e_mg: 15, vit_k_mcg: 90,
// };

/**
 * RDA / DRI Profiles by sex × age
 *
 * Source: NIH/NCBI Dietary Reference Intakes (DRIs)
 *   Elements:    https://www.ncbi.nlm.nih.gov/books/NBK545442/table/appJ_tab3/
 *   Vitamins:    https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t2/
 *   Macronutrients/Omega-3: IOM 2002 (ALA AIs)
 *   Calcium/Vit D: IOM 2011
 *   Sodium/Potassium: NASEM 2019
 *
 * Notation:
 *   RDA = Recommended Dietary Allowance (meets needs of 97–98% of healthy individuals)
 *   AI* = Adequate Intake (insufficient evidence for RDA; marked with trailing comment)
 *
 * Profile keys map to DB column rda_profile:
 *   'male_under50'   → males  19–50 y  (uses 31–50 values where 19–30 / 31–50 differ)
 *   'male_50plus'    → males  51–70 y  (note: >70 has higher calcium/vit D — see below)
 *   'female_under50' → females 19–50 y (uses 31–50 values where sub-ranges differ)
 *   'female_50plus'  → females 51–70 y
 *
 * Key age-driven discontinuities worth flagging in your UI:
 *   • Calcium    — female jumps 1000→1200 mg at 51; male stays 1000 until 71
 *   • Iron       — female drops 18→8 mg at 51 (post-menopause)
 *   • Vitamin D  — both sexes: 600 IU (15 µg) at 19–70; jumps to 800 IU (20 µg) at 71
 *   • Vitamin B6 — male +0.4 mg at 51; female +0.2 mg at 51
 *   • Magnesium  — male 400 mg (19–30) vs 420 mg (31+); female 310 (19–30) vs 320 (31+)
 */

// ─── Unit type hints (embedded in key names) ────────────────────────────────
// _g  = grams/day
// _mg = milligrams/day
// _mcg = micrograms/day
// _iu = International Units/day

// export interface RDAProfile {
//   // ── Fatty acids ──────────────────────────────────────────────────────────
//   /** ALA (α-linolenic acid) AI, g/d */
//   omega3_ala_g: number;

//   // ── Minerals ─────────────────────────────────────────────────────────────
//   calcium_mg:      number;   // RDA
//   chromium_mcg:    number;   // AI*
//   copper_mcg:      number;   // RDA
//   fluoride_mg:     number;   // AI*
//   iodine_mcg:      number;   // RDA
//   iron_mg:         number;   // RDA
//   magnesium_mg:    number;   // RDA
//   manganese_mg:    number;   // AI*
//   molybdenum_mcg:  number;   // RDA
//   phosphorus_mg:   number;   // RDA
//   potassium_mg:    number;   // AI*
//   selenium_mcg:    number;   // RDA
//   sodium_mg:       number;   // AI*
//   zinc_mg:         number;   // RDA

//   // ── Fat-soluble vitamins ─────────────────────────────────────────────────
//   /** Retinol Activity Equivalents (RAE) */
//   vitA_mcg_rae:    number;   // RDA
//   /** 1 µg calciferol = 40 IU; assumes minimal sun exposure */
//   vitD_mcg:        number;   // RDA  (600 IU = 15 µg for 19–70 y)
//   /** α-tocopherol */
//   vitE_mg:         number;   // RDA
//   vitK_mcg:        number;   // AI*

//   // ── Water-soluble vitamins ───────────────────────────────────────────────
//   vitC_mg:         number;   // RDA
//   thiamin_mg:      number;   // RDA  (B1)
//   riboflavin_mg:   number;   // RDA  (B2)
//   niacin_mg_ne:    number;   // RDA  (B3, as Niacin Equivalents)
//   pantothenicAcid_mg: number; // AI* (B5)
//   vitB6_mg:        number;   // RDA
//   /** Same RDA all adults; but >50 should obtain via fortified foods/supplements */
//   vitB12_mcg:      number;   // RDA
//   biotin_mcg:      number;   // AI*
//   choline_mg:      number;   // AI*
//   /** Dietary Folate Equivalents (DFE) */
//   folate_mcg_dfe:  number;   // RDA
// }

// export const RDA_PROFILES: Record<string, RDAProfile> = {

//   male_under50: {
//     // Males 19–50 y  (magnesium uses 31–50 value = 420; 19–30 = 400)
//     omega3_ala_g:       1.6,   // AI
//     calcium_mg:         1000,
//     chromium_mcg:       35,    // AI
//     copper_mcg:         900,
//     fluoride_mg:        4,     // AI
//     iodine_mcg:         150,
//     iron_mg:            8,
//     magnesium_mg:       420,   // 31–50 y; 19–30 y = 400
//     manganese_mg:       2.3,   // AI
//     molybdenum_mcg:     45,
//     phosphorus_mg:      700,
//     potassium_mg:       3400,  // AI
//     selenium_mcg:       55,
//     sodium_mg:          1500,  // AI
//     zinc_mg:            11,
//     vitA_mcg_rae:       900,
//     vitD_mcg:           15,    // 600 IU  RDA
//     vitE_mg:            15,
//     vitK_mcg:           120,   // AI
//     vitC_mg:            90,
//     thiamin_mg:         1.2,
//     riboflavin_mg:      1.3,
//     niacin_mg_ne:       16,
//     pantothenicAcid_mg: 5,     // AI
//     vitB6_mg:           1.3,
//     vitB12_mcg:         2.4,
//     biotin_mcg:         30,    // AI
//     choline_mg:         550,   // AI
//     folate_mcg_dfe:     400,
//   },

//   male_50plus: {
//     // Males 51–70 y  (>70 y: calcium → 1200, vitD → 20 µg / 800 IU)
//     omega3_ala_g:       1.6,   // AI
//     calcium_mg:         1000,  // stays 1000 until 71 (then 1200)
//     chromium_mcg:       30,    // AI (drops from 35 at 51)
//     copper_mcg:         900,
//     fluoride_mg:        4,     // AI
//     iodine_mcg:         150,
//     iron_mg:            8,
//     magnesium_mg:       420,
//     manganese_mg:       2.3,   // AI
//     molybdenum_mcg:     45,
//     phosphorus_mg:      700,
//     potassium_mg:       3400,  // AI
//     selenium_mcg:       55,
//     sodium_mg:          1500,  // AI
//     zinc_mg:            11,
//     vitA_mcg_rae:       900,
//     vitD_mcg:           15,    // 600 IU  (→ 20 µg / 800 IU at age 71)
//     vitE_mg:            15,
//     vitK_mcg:           120,   // AI
//     vitC_mg:            90,
//     thiamin_mg:         1.2,
//     riboflavin_mg:      1.3,
//     niacin_mg_ne:       16,
//     pantothenicAcid_mg: 5,     // AI
//     vitB6_mg:           1.7,   // ← increases at 51
//     vitB12_mcg:         2.4,   // obtain via fortified food or supplement >50
//     biotin_mcg:         30,    // AI
//     choline_mg:         550,   // AI
//     folate_mcg_dfe:     400,
//   },

//   female_under50: {
//     // Females 19–50 y  (magnesium uses 31–50 value = 320; 19–30 = 310)
//     omega3_ala_g:       1.1,   // AI
//     calcium_mg:         1000,
//     chromium_mcg:       25,    // AI
//     copper_mcg:         900,
//     fluoride_mg:        3,     // AI
//     iodine_mcg:         150,
//     iron_mg:            18,    // ← high: pre-menopause losses
//     magnesium_mg:       320,   // 31–50 y; 19–30 y = 310
//     manganese_mg:       1.8,   // AI
//     molybdenum_mcg:     45,
//     phosphorus_mg:      700,
//     potassium_mg:       2600,  // AI
//     selenium_mcg:       55,
//     sodium_mg:          1500,  // AI
//     zinc_mg:            8,
//     vitA_mcg_rae:       700,
//     vitD_mcg:           15,    // 600 IU
//     vitE_mg:            15,
//     vitK_mcg:           90,    // AI
//     vitC_mg:            75,
//     thiamin_mg:         1.1,
//     riboflavin_mg:      1.1,
//     niacin_mg_ne:       14,
//     pantothenicAcid_mg: 5,     // AI
//     vitB6_mg:           1.3,
//     vitB12_mcg:         2.4,
//     biotin_mcg:         30,    // AI
//     choline_mg:         425,   // AI
//     folate_mcg_dfe:     400,
//   },

//   female_50plus: {
//     // Females 51–70 y  (>70 y: vitD → 20 µg / 800 IU)
//     omega3_ala_g:       1.1,   // AI
//     calcium_mg:         1200,  // ← jumps at 51 (post-menopausal bone loss)
//     chromium_mcg:       20,    // AI (drops from 25 at 51)
//     copper_mcg:         900,
//     fluoride_mg:        3,     // AI
//     iodine_mcg:         150,
//     iron_mg:            8,     // ← drops at 51 (post-menopause)
//     magnesium_mg:       320,
//     manganese_mg:       1.8,   // AI
//     molybdenum_mcg:     45,
//     phosphorus_mg:      700,
//     potassium_mg:       2600,  // AI
//     selenium_mcg:       55,
//     sodium_mg:          1500,  // AI
//     zinc_mg:            8,
//     vitA_mcg_rae:       700,
//     vitD_mcg:           15,    // 600 IU  (→ 20 µg / 800 IU at age 71)
//     vitE_mg:            15,
//     vitK_mcg:           90,    // AI
//     vitC_mg:            75,
//     thiamin_mg:         1.1,
//     riboflavin_mg:      1.1,
//     niacin_mg_ne:       14,
//     pantothenicAcid_mg: 5,     // AI
//     vitB6_mg:           1.5,   // ← increases at 51
//     vitB12_mcg:         2.4,   // obtain via fortified food or supplement >50
//     biotin_mcg:         30,    // AI
//     choline_mg:         425,   // AI
//     folate_mcg_dfe:     400,
//   },
// };

// /** Convenience: resolve a stored profile key → values */
// export function getRDA(profileKey: string): RDAProfile {
//   return RDA_PROFILES[profileKey] ?? RDA_PROFILES['male_under50'];
// }

// /**
//  * Nutrient display metadata — for UI rendering of progress bars, labels, units.
//  * Extend as needed.
//  */
// export const NUTRIENT_META: Record<
//   keyof RDAProfile,
//   { label: string; unit: string; category: string }
// > = {
//   omega3_ala_g:       { label: 'Omega-3 ALA',        unit: 'g',   category: 'Fatty Acids' },
//   calcium_mg:         { label: 'Calcium',             unit: 'mg',  category: 'Minerals' },
//   chromium_mcg:       { label: 'Chromium',            unit: 'µg',  category: 'Minerals' },
//   copper_mcg:         { label: 'Copper',              unit: 'µg',  category: 'Minerals' },
//   fluoride_mg:        { label: 'Fluoride',            unit: 'mg',  category: 'Minerals' },
//   iodine_mcg:         { label: 'Iodine',              unit: 'µg',  category: 'Minerals' },
//   iron_mg:            { label: 'Iron',                unit: 'mg',  category: 'Minerals' },
//   magnesium_mg:       { label: 'Magnesium',           unit: 'mg',  category: 'Minerals' },
//   manganese_mg:       { label: 'Manganese',           unit: 'mg',  category: 'Minerals' },
//   molybdenum_mcg:     { label: 'Molybdenum',          unit: 'µg',  category: 'Minerals' },
//   phosphorus_mg:      { label: 'Phosphorus',          unit: 'mg',  category: 'Minerals' },
//   potassium_mg:       { label: 'Potassium',           unit: 'mg',  category: 'Minerals' },
//   selenium_mcg:       { label: 'Selenium',            unit: 'µg',  category: 'Minerals' },
//   sodium_mg:          { label: 'Sodium',              unit: 'mg',  category: 'Minerals' },
//   zinc_mg:            { label: 'Zinc',                unit: 'mg',  category: 'Minerals' },
//   vitA_mcg_rae:       { label: 'Vitamin A',           unit: 'µg',  category: 'Fat-Soluble Vitamins' },
//   vitD_mcg:           { label: 'Vitamin D',           unit: 'µg',  category: 'Fat-Soluble Vitamins' },
//   vitE_mg:            { label: 'Vitamin E',           unit: 'mg',  category: 'Fat-Soluble Vitamins' },
//   vitK_mcg:           { label: 'Vitamin K',           unit: 'µg',  category: 'Fat-Soluble Vitamins' },
//   vitC_mg:            { label: 'Vitamin C',           unit: 'mg',  category: 'Water-Soluble Vitamins' },
//   thiamin_mg:         { label: 'Thiamin (B1)',        unit: 'mg',  category: 'Water-Soluble Vitamins' },
//   riboflavin_mg:      { label: 'Riboflavin (B2)',     unit: 'mg',  category: 'Water-Soluble Vitamins' },
//   niacin_mg_ne:       { label: 'Niacin (B3)',         unit: 'mg',  category: 'Water-Soluble Vitamins' },
//   pantothenicAcid_mg: { label: 'Pantothenic Acid (B5)', unit: 'mg', category: 'Water-Soluble Vitamins' },
//   vitB6_mg:           { label: 'Vitamin B6',          unit: 'mg',  category: 'Water-Soluble Vitamins' },
//   vitB12_mcg:         { label: 'Vitamin B12',         unit: 'µg',  category: 'Water-Soluble Vitamins' },
//   biotin_mcg:         { label: 'Biotin (B7)',         unit: 'µg',  category: 'Water-Soluble Vitamins' },
//   choline_mg:         { label: 'Choline',             unit: 'mg',  category: 'Water-Soluble Vitamins' },
//   folate_mcg_dfe:     { label: 'Folate (B9)',         unit: 'µg',  category: 'Water-Soluble Vitamins' },
// };