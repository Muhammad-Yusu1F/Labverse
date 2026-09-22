export interface GameReagent {
  id: string;
  nameUz: string;
  formula: string;
  category: 'Faol metall' | 'Kislota' | 'Ishqor' | 'Tuz/Oksidlovchi' | 'Organik' | 'Erituvchi';
  colorHex: string;
  state: 'suyuq' | 'qattiq' | 'kukun';
  dangerLevel: 'Xavfsiz' | 'Ehtiyot bo‘ling' | 'Xavfli' | 'O‘ta xavfli';
  hazardIcon: 'flame' | 'skull' | 'corrosive' | 'droplet';
  descriptionUz: string;
}

export interface ReactionOutcome {
  id: string;
  reagentAId: string;
  reagentBId: string;
  willExplode: boolean;
  resultTitle: string;
  reactionEquation: string;
  visualEffect: 'explosion' | 'violent_flame' | 'colored_precipitate' | 'foam_eruption' | 'color_change' | 'gentle_dissolve';
  liquidFinalColor: string;
  temperatureChange: string; // e.g. '+85 °C' or '+5 °C'
  gasProduced: string; // e.g. 'H2 (yonuvchi)' or 'CO2 (zararsiz)'
  scientificExplanation: string;
  safetyAdvice: string;
}

export const GAME_REAGENTS: GameReagent[] = [
  {
    id: 'na_metal',
    nameUz: 'Natriy metalli (Na)',
    formula: 'Na',
    category: 'Faol metall',
    colorHex: '#94a3b8',
    state: 'qattiq',
    dangerLevel: 'O‘ta xavfli',
    hazardIcon: 'flame',
    descriptionUz: 'Ishqoriy metall, suv va kislotalar bilan shiddatli reaksiyaga kirishadi.'
  },
  {
    id: 'water_h2o',
    nameUz: 'Distillangan suv (H₂O)',
    formula: 'H₂O',
    category: 'Erituvchi',
    colorHex: '#38bdf8',
    state: 'suyuq',
    dangerLevel: 'Xavfsiz',
    hazardIcon: 'droplet',
    descriptionUz: 'Toza kimyoviy universal erituvchi, pH = 7.0.'
  },
  {
    id: 'kmno4_crystals',
    nameUz: 'Kaliy permanganat (KMnO₄)',
    formula: 'KMnO₄',
    category: 'Tuz/Oksidlovchi',
    colorHex: '#9333ea',
    state: 'kukun',
    dangerLevel: 'Xavfli',
    hazardIcon: 'flame',
    descriptionUz: 'Kuchli oksidlovchi to‘q binafsharang kristall modda.'
  },
  {
    id: 'glycerin',
    nameUz: 'Glitserin (C₃H₈O₃)',
    formula: 'C₃H₅(OH)₃',
    category: 'Organik',
    colorHex: '#cbd5e1',
    state: 'suyuq',
    dangerLevel: 'Xavfsiz',
    hazardIcon: 'droplet',
    descriptionUz: 'Uch atomli quyuq shirin suyuqlik.'
  },
  {
    id: 'h2so4_conc',
    nameUz: 'Sulfat kislota kons. (H₂SO₄)',
    formula: 'H₂SO₄ 98%',
    category: 'Kislota',
    colorHex: '#facc15',
    state: 'suyuq',
    dangerLevel: 'O‘ta xavfli',
    hazardIcon: 'corrosive',
    descriptionUz: 'Kuchli suvsizlantiruvchi va kuydiruvchi mineral kislota.'
  },
  {
    id: 'h2o2_conc',
    nameUz: 'Vodorod peroksid (H₂O₂ 35%)',
    formula: 'H₂O₂',
    category: 'Tuz/Oksidlovchi',
    colorHex: '#e0f2fe',
    state: 'suyuq',
    dangerLevel: 'Xavfli',
    hazardIcon: 'flame',
    descriptionUz: 'Konsentrlangan peroksid, katalizatorlar ishtirokida shiddatli parchalanadi.'
  },
  {
    id: 'potassium_iodide',
    nameUz: 'Kaliy yodid (KI)',
    formula: 'KI',
    category: 'Tuz/Oksidlovchi',
    colorHex: '#fef08a',
    state: 'kukun',
    dangerLevel: 'Ehtiyot bo‘ling',
    hazardIcon: 'skull',
    descriptionUz: 'Peroksid parchalanishining kuchli faol katalizatori.'
  },
  {
    id: 'acetic_acid',
    nameUz: 'Sirka kislotasi (CH₃COOH)',
    formula: 'CH₃COOH 9%',
    category: 'Kislota',
    colorHex: '#fdba74',
    state: 'suyuq',
    dangerLevel: 'Ehtiyot bo‘ling',
    hazardIcon: 'corrosive',
    descriptionUz: 'Kuchsiz organik kislota, oshxonada ham uchraydi.'
  },
  {
    id: 'sodium_bicarbonate',
    nameUz: 'Osh sodasi (NaHCO₃)',
    formula: 'NaHCO₃',
    category: 'Ishqor',
    colorHex: '#f8fafc',
    state: 'kukun',
    dangerLevel: 'Xavfsiz',
    hazardIcon: 'droplet',
    descriptionUz: 'Gidrokarbonat tuzi, kislota bilan ko‘pikli CO₂ ajratadi.'
  },
  {
    id: 'copper_sulfate',
    nameUz: 'Mis kuporosi (CuSO₄)',
    formula: 'CuSO₄·5H₂O',
    category: 'Tuz/Oksidlovchi',
    colorHex: '#0284c7',
    state: 'suyuq',
    dangerLevel: 'Ehtiyot bo‘ling',
    hazardIcon: 'skull',
    descriptionUz: 'Yorqin havorang mis tuzining eritmasi.'
  },
  {
    id: 'sodium_hydroxide',
    nameUz: 'O‘yuvchi natriy (NaOH)',
    formula: 'NaOH 20%',
    category: 'Ishqor',
    colorHex: '#10b981',
    state: 'suyuq',
    dangerLevel: 'Xavfli',
    hazardIcon: 'corrosive',
    descriptionUz: 'Kuchli o‘yuvchi ishqor eritmasi.'
  },
  {
    id: 'calcium_carbide',
    nameUz: 'Kalsiy karbid (CaC₂)',
    formula: 'CaC₂',
    category: 'Faol metall',
    colorHex: '#64748b',
    state: 'qattiq',
    dangerLevel: 'O‘ta xavfli',
    hazardIcon: 'flame',
    descriptionUz: 'Suv bilan asetilen gazi hosil qiluvchi kulrang birikma.'
  }
];

export const REACTION_OUTCOMES: ReactionOutcome[] = [
  // 1. Na + H2O -> EXPLODES
  {
    id: 'na_plus_water',
    reagentAId: 'na_metal',
    reagentBId: 'water_h2o',
    willExplode: true,
    resultTitle: 'Gidrotermik Portlash! (Na + H₂O)',
    reactionEquation: '2Na + 2H₂O → 2NaOH + H₂↑ + Q (Issiqlik)',
    visualEffect: 'explosion',
    liquidFinalColor: '#f43f5e',
    temperatureChange: '+135 °C',
    gasProduced: 'H₂ (Yonuvchan vodorod)',
    scientificExplanation: 'Natriy suv bilan shiddatli reaksiyaga kirishib, erigan sharcha shaklida suzadi. Ajralgan issiqlik vodorod gazini o‘t oldiradi va kuchli portlash sodir bo‘ladi!',
    safetyAdvice: 'Natriyni suvga faqat himoyalangan devor ortida pinset bilan juda mayda bo‘lakda solinadi.'
  },
  // 2. KMnO4 + Glycerin -> EXPLODES (Spontaneous ignition & blast)
  {
    id: 'kmno4_plus_glycerin',
    reagentAId: 'kmno4_crystals',
    reagentBId: 'glycerin',
    willExplode: true,
    resultTitle: 'O‘z-o‘zidan yonish va Olovli Portlash!',
    reactionEquation: '14KMnO₄ + 4C₃H₅(OH)₃ → 7K₂CO₃ + 7Mn₂O₃ + 5CO₂↑ + 16H₂O + Alanga',
    visualEffect: 'violent_flame',
    liquidFinalColor: '#1c1917',
    temperatureChange: '+280 °C',
    gasProduced: 'CO₂ va suv bug‘i',
    scientificExplanation: 'Kaliy permanganat glitserinni bir necha soniyada shiddat bilan oksidlaydi. Harorat keskin oshib, binafsharang yorqin alanga va tutun bilan portlab yonadi!',
    safetyAdvice: 'Bu qorishmani hechkemer germetik yopiq idishda aralashtirmang.'
  },
  // 3. H2SO4 + Na -> EXPLODES
  {
    id: 'h2so4_plus_na',
    reagentAId: 'h2so4_conc',
    reagentBId: 'na_metal',
    willExplode: true,
    resultTitle: 'Termik Kislotali Kuchli Portlash!',
    reactionEquation: '2Na + H₂SO₄ → Na₂SO₄ + H₂↑ (O‘ta tez)',
    visualEffect: 'explosion',
    liquidFinalColor: '#e11d48',
    temperatureChange: '+210 °C',
    gasProduced: 'H₂ va SO₂ tutuni',
    scientificExplanation: 'Konsentrlangan kislota va faol ishqoriy metall reaksiyasi soniyaning yuzdan bir qismida ulkan issiqlik beradi, bu esa idishning parchalanib portlashiga olib keladi!',
    safetyAdvice: 'Hatto laboratoriya sharoitida ham bu reaksiya ochiq idishda qat‘iyan taqiqlanadi.'
  },
  // 4. Calcium Carbide + Water -> EXPLODES (Acetylene flash)
  {
    id: 'carbide_plus_water',
    reagentAId: 'calcium_carbide',
    reagentBId: 'water_h2o',
    willExplode: true,
    resultTitle: 'Asetilen gazi Portlashi!',
    reactionEquation: 'CaC₂ + 2H₂O → Ca(OH)₂ + C₂H₂↑ (Asetilen o‘t olishi)',
    visualEffect: 'explosion',
    liquidFinalColor: '#e2e8f0',
    temperatureChange: '+95 °C',
    gasProduced: 'C₂H₂ (O‘ta portlovchi asetilen)',
    scientificExplanation: 'Karbid suv bilan bir zumda yonuvchan asetilen gazini hosil qiladi. Reaksiya issiqligi yoki mikro-uchqun tufayli havodagi asetilen kuchli zarb bilan portlaydi!',
    safetyAdvice: 'Asetilen gazi laboratoriyada maxsus gazometrlarda tutib olinadi.'
  },
  // 5. H2O2 + KI -> DOES NOT EXPLODE (Elephant Toothpaste Foam)
  {
    id: 'h2o2_plus_ki',
    reagentAId: 'h2o2_conc',
    reagentBId: 'potassium_iodide',
    willExplode: false,
    resultTitle: 'Xavfsiz: "Fil tish pastasi" Ulkan Ko‘pigi!',
    reactionEquation: '2H₂O₂ ──(KI katalizator)──> 2H₂O + O₂↑',
    visualEffect: 'foam_eruption',
    liquidFinalColor: '#fef08a',
    temperatureChange: '+60 °C',
    gasProduced: 'O₂ (Kislorod gazi)',
    scientificExplanation: 'Kaliy yodid peroksidni tezlik bilan kislorod va suvga parchalaydi. Portlash bo‘lmaydi, biroq idishdan ulkan hajmdagi qalin iliq ko‘pik favvorasi otilib chiqadi!',
    safetyAdvice: 'Xavfsiz ilmiy tajriba hisoblanadi, ko‘pik issiq bo‘lgani uchun qo‘lqopda tutiladi.'
  },
  // 6. Vinegar + Baking Soda -> DOES NOT EXPLODE (Baking soda bubbling)
  {
    id: 'vinegar_plus_soda',
    reagentAId: 'acetic_acid',
    reagentBId: 'sodium_bicarbonate',
    willExplode: false,
    resultTitle: 'Xavfsiz: Karbonat angidrid qaynashi',
    reactionEquation: 'CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑',
    visualEffect: 'foam_eruption',
    liquidFinalColor: '#ffffff',
    temperatureChange: '-2 °C (Endotermik)',
    gasProduced: 'CO₂ (Karbonat angidrid)',
    scientificExplanation: 'Kuchsiz kislota va soda reaksiyasi mutlaqo xavfsiz. Oq ko‘piklar hosil qilib karbonat angidrid gazi ajraladi, aralashma hatto biroz soviydi.',
    safetyAdvice: 'Uy sharoitida ham xavfsiz o‘tkaziladigan klassik tajriba.'
  },
  // 7. Copper Sulfate + Sodium Hydroxide -> DOES NOT EXPLODE (Blue precipitate)
  {
    id: 'copper_plus_naoh',
    reagentAId: 'copper_sulfate',
    reagentBId: 'sodium_hydroxide',
    willExplode: false,
    resultTitle: 'Xavfsiz: Moviy Mis Gidroksid Cho‘kmasi',
    reactionEquation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ (Moviy jel) + Na₂SO₄',
    visualEffect: 'colored_precipitate',
    liquidFinalColor: '#0ea5e9',
    temperatureChange: '+3 °C',
    gasProduced: 'Gaz ajralmaydi',
    scientificExplanation: 'Eritmalar aralashganda hech qanday portlash bo‘lmaydi. Chiroyli yorqin moviy rangli jelega o‘xshash cho‘kma (mis gidroksidi) hosil bo‘ladi.',
    safetyAdvice: 'Ishqor teriga tegmasligi uchun ehtiyot bo‘ling.'
  },
  // 8. Water + Glycerin -> DOES NOT EXPLODE (Gentle Dissolution)
  {
    id: 'water_plus_glycerin',
    reagentAId: 'water_h2o',
    reagentBId: 'glycerin',
    willExplode: false,
    resultTitle: 'Xavfsiz: Bir jinsli shaffof eritma',
    reactionEquation: 'H₂O + C₃H₅(OH)₃ → Gomogen aralashma',
    visualEffect: 'gentle_dissolve',
    liquidFinalColor: '#e0f2fe',
    temperatureChange: '0 °C',
    gasProduced: 'Yo‘q',
    scientificExplanation: 'Glitserin va suv har qanday nisbatda mukammal eriydi. Vodorod bog‘lanishlari orqali barqaror shaffof qorishma hosil bo‘ladi, xavf yo‘q.',
    safetyAdvice: 'Mutlaqo zararsiz.'
  },
  // 9. Water + Acetic Acid -> DOES NOT EXPLODE
  {
    id: 'water_plus_vinegar',
    reagentAId: 'water_h2o',
    reagentBId: 'acetic_acid',
    willExplode: false,
    resultTitle: 'Xavfsiz: Kislotani suyultirish',
    reactionEquation: 'CH₃COOH + H₂O → CH₃COO⁻ + H₃O⁺',
    visualEffect: 'gentle_dissolve',
    liquidFinalColor: '#f8fafc',
    temperatureChange: '+1 °C',
    gasProduced: 'Yo‘q',
    scientificExplanation: 'Kuchsiz kislota suvda erib ionlarga ajraladi. Portlash yoki tutun bo‘lmaydi.',
    safetyAdvice: 'Standart xavfsiz eritma.'
  },
  // 10. Sodium Hydroxide + Acetic Acid -> DOES NOT EXPLODE (Neutralization)
  {
    id: 'naoh_plus_vinegar',
    reagentAId: 'sodium_hydroxide',
    reagentBId: 'acetic_acid',
    willExplode: false,
    resultTitle: 'Xavfsiz: Kislota-Ishqor Neytrallanishi',
    reactionEquation: 'NaOH + CH₃COOH → CH₃COONa + H₂O + Q',
    visualEffect: 'color_change',
    liquidFinalColor: '#f1f5f9',
    temperatureChange: '+18 °C',
    gasProduced: 'Yo‘q',
    scientificExplanation: 'Kislota va ishqor bir-birini neytrallab, zararsiz natriy asetat tuzi va suv hosil qiladi. Idish biroz isiydi, lekin portlash mutlaqo yuz bermaydi.',
    safetyAdvice: 'Klassik va tinch neytrallanish reaksiyasi.'
  },
  // 11. H2SO4 + Calcium Carbide -> EXPLODES
  {
    id: 'h2so4_plus_carbide',
    reagentAId: 'h2so4_conc',
    reagentBId: 'calcium_carbide',
    willExplode: true,
    resultTitle: 'Ekstremal Kislotali Karbid Portlashi!',
    reactionEquation: 'CaC₂ + H₂SO₄ → CaSO₄ + C₂H₂↑ + Q (O‘ta kuchli olov)',
    visualEffect: 'explosion',
    liquidFinalColor: '#991b1b',
    temperatureChange: '+230 °C',
    gasProduced: 'C₂H₂ va SO₂ (zaharli va portlovchi)',
    scientificExplanation: 'Sulfat kislota karbid bilan shiddatli reaksiyaga kirishadi. Chiqqan asetilen gazi konsentrlangan kislotaning yuqori haroratida bir lahzada o‘t olib portlaydi!',
    safetyAdvice: 'Ushbu reagentlarni hech qachon birga saqlamang yoki aralashtirmang.'
  }
];

export function findReactionOutcome(reagentAId: string, reagentBId: string): ReactionOutcome {
  const match = REACTION_OUTCOMES.find(
    r => (r.reagentAId === reagentAId && r.reagentBId === reagentBId) ||
         (r.reagentAId === reagentBId && r.reagentBId === reagentAId)
  );

  if (match) return match;

  // Fallback dynamic outcome for pairs not explicitly in the primary table
  const regA = GAME_REAGENTS.find(r => r.id === reagentAId);
  const regB = GAME_REAGENTS.find(r => r.id === reagentBId);

  const hasExplosiveMetal = regA?.id === 'na_metal' || regB?.id === 'na_metal' || regA?.id === 'calcium_carbide' || regB?.id === 'calcium_carbide';
  const hasStrongAcid = regA?.id === 'h2so4_conc' || regB?.id === 'h2so4_conc';

  if (hasExplosiveMetal && hasStrongAcid) {
    return {
      id: `${reagentAId}_${reagentBId}`,
      reagentAId,
      reagentBId,
      willExplode: true,
      resultTitle: 'Shiddatli Kimyoviy Portlash!',
      reactionEquation: `${regA?.formula || 'A'} + ${regB?.formula || 'B'} → Q (Yuqori ekzotermik portlash)`,
      visualEffect: 'explosion',
      liquidFinalColor: '#ef4444',
      temperatureChange: '+180 °C',
      gasProduced: 'Yonuvchi gazlar',
      scientificExplanation: 'Faol komponentlar o‘rtasidagi tezkor elektron almashinuvi ulkan issiqlik keltirib chiqardi va idish portladi!',
      safetyAdvice: 'Ushbu reaksiyani faqat virtual simulyatorda sinash tavsiya etiladi.'
    };
  }

  // Safe default
  return {
    id: `${reagentAId}_${reagentBId}`,
    reagentAId,
    reagentBId,
    willExplode: false,
    resultTitle: 'Xavfsiz Qorishma (Barqaror eritma)',
    reactionEquation: `${regA?.formula || 'A'} + ${regB?.formula || 'B'} → Tinch aralashma`,
    visualEffect: 'color_change',
    liquidFinalColor: regA?.colorHex || '#38bdf8',
    temperatureChange: '+4 °C',
    gasProduced: 'Ajralmadi',
    scientificExplanation: 'Moddalar o‘zaro portlashsiz tinch aralashdi yoki kuchsiz reaksiyaga kirishdi. Jarayon xavfsiz kechdi.',
    safetyAdvice: 'Tajriba muvaffaqiyatli yakunlandi.'
  };
}
