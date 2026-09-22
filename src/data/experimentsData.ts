import { ExperimentMeta, Badge, ChemistryReagent, BiologyOrganelle } from '../types';

export const EXPERIMENTS: ExperimentMeta[] = [
  {
    id: 'physics-circuit',
    subject: 'FIZIKA',
    title: 'Elektr zanjiri',
    tagline: 'Om qonuni va doimiy tok zanjirini o‘rganish',
    description: 'Manba kuchlanishi, zanjir qarshiligi va tok kuchi orasidagi bog‘lanishni real vaqtda tekshiring. Elektronlar oqimini va lampochka porlashini vizual kuzating.',
    difficulty: 'Boshlang‘ich',
    duration: '10–15 daqiqa',
    color: 'from-blue-600 to-cyan-500',
    accentColor: '#06b6d4',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    iconName: 'Zap',
    tools: ['Doimiy tok manbai (Batareya)', 'Kompakt rezistor', 'Cho‘g‘lanma lampochka', 'Pichoqli kalit (Switch)', 'Ampermetr & Voltmetr'],
    keyFormula: 'I = U / R  va  P = U · I',
    explanation: {
      whatHappened: 'Kalit ulanganda zanjirda yopiq kontur hosil bo‘lib, elektr maydoni ta’sirida erkin elektronlar manbaning manfiy qutbidan musbat qutbi tomon tartibli harakat qila boshladi. Natijada elektr toki vujudga keldi va lampochka spirali qizib, yorug‘lik taratdi.',
      scientificReason: 'Om qonuniga ko‘ra, zanjir qismidagi tok kuchi (I) kuchlanishga (U) to‘g‘ri mutanosib, qarshilikka (R) teskari mutanosibdir. Kuchlanish oshirilganda yoki qarshilik kamaytirilganda tok kuchi oshadi, natijada lampochkaning quvvati (P = I² · R) ko‘payib, u yorqinroq yonadi.',
      formulaExplanation: 'I — Tok kuchi (Amper, A), U — Elektr kuchlanishi (Volt, V), R — Elektr qarshiligi (Om, Ω), P — Elektr quvvati (Vatt, W).',
      funFact: 'Elektronlarning sim ichidagi o‘rtacha yo‘naltirilgan tezligi juda past — soniyasiga atigi bir necha millimetr! Biroq elektr maydonining tarqalish tezligi deyarli yorug‘lik tezligiga teng (300 000 km/s), shu sabab kalit bosilishi bilan lampochka bir zumda yonadi.'
    }
  },
  {
    id: 'chemistry-reaction',
    subject: 'KIMYO',
    title: 'Reaksiya laboratoriyasi',
    tagline: 'Kislota-asos va gaz ajralish reaksiyalari',
    description: 'Turli kimyoviy reagentlarni o‘lchov stakanida aralashtiring. pH darajasining o‘zgarishi, rang transformatsiyasi, gaz pufakchalari va harorat tebranishini tahlil qiling.',
    difficulty: 'O‘rta',
    duration: '15–20 daqiqa',
    color: 'from-cyan-500 to-emerald-500',
    accentColor: '#10b981',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    iconName: 'FlaskConical',
    tools: ['Ximiyaviy menzurka', 'Tomizg‘ich (Pipetka)', 'Raqamli pH-metr', 'Elektron termometr', 'Gaz yig‘ish shprisi'],
    keyFormula: 'HCl + NaOH → NaCl + H₂O + Q',
    explanation: {
      whatHappened: 'Xlorid kislota (HCl) va natriy gidroksidi (NaOH) aralashtirilganda neytrallanish reaksiyasi yuz berdi. Fenolftalein indikatori muhit ishqoriy bo‘lganda yorqin pushti rangga kirdi, kislota qo‘shilganda esa rangsizlandi. Rux metali kislota bilan ta’sirlashganda vodorod gazi shiddat bilan ajraldi.',
      scientificReason: 'Kislotadagi H⁺ kationlari va ishqordagi OH⁻ anionlari o‘zaro birikib barqaror suv (H₂O) molekulasini hosil qiladi. Bu reaksiya ekzotermik bo‘lib, issiqlik ajralishi hisobiga eritma harorati ko‘tariladi.',
      formulaExplanation: 'pH < 7 — Kislotali muhit; pH = 7 — Neytral (toza suv, osh tuzi eritmasi); pH > 7 — Ishqoriy muhit.',
      funFact: 'Oshqozonimiz har kuni 1,5 litrdan ortiq konsentrlangan xlorid kislota (HCl) ishlab chiqaradi. Oshqozon devorini bu kuchli kislota eritib yubormasligi uchun maxsus qalin shilimshiq qatlam himoya qiladi!'
    }
  },
  {
    id: 'biology-cell',
    subject: 'BIOLOGIYA',
    title: 'Hujayra laboratoriyasi',
    tagline: 'Mikroskop ostida tirik organizm mikrodunyosi',
    description: 'Kattalashtirish darajasini 100x dan 1000x gacha o‘zgartiring. Yadro, xloroplastlar, sitoplazma va hujayra devori kabi organellalarni aniqlab, ularning hayotiy faoliyatini o‘rganing.',
    difficulty: 'O‘rta',
    duration: '12–18 daqiqa',
    color: 'from-emerald-500 to-teal-400',
    accentColor: '#14b8a6',
    gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    iconName: 'Dna',
    tools: ['Optik mikroskop (1000x)', 'Fokus mikrometr vintlari', 'Bo‘yash uchun yod eritmasi', 'Qoplag‘ich shisha preparati', 'Organella skaneri'],
    keyFormula: '6CO₂ + 6H₂O + Yorug‘lik → C₆H₁₂O₆ + 6O₂',
    explanation: {
      whatHappened: 'Piyoz po‘stlog‘i va o‘simlik barglari mikroskop ostiga qo‘yilganda, aniq to‘rtburchak shakldagi mustahkam hujayralar va ularning ichidagi yashil rangli xloroplastlar ko‘rindi. Yod bilan bo‘yalganda yadro kontrastli to‘q rangda ajralib chiqdi.',
      scientificReason: 'O‘simlik hujayralari sellyulozadan iborat qattiq hujayra qobig‘iga ega, bu esa ularga qat’iy geometrik shakl beradi. Xloroplastlar tarkibidagi xlorofill pigmenti quyosh nuri energiyasini yutib, fotosintez jarayonini amalga oshiradi.',
      formulaExplanation: 'Fotosintez tenglamasi: Karbonat angidrid va suv quyosh nuri vositasida glyukoza (ozuqa) va erkin kislorodga aylanadi.',
      funFact: 'Inson tanasida 37 trilliondan ortiq hujayra mavjud! Agar bitta odam hujayrasidagi barcha DNK iplarini yozib ulasak, uning uzunligi Quyoshdan Plutongacha bo‘lgan masofadan ham ortiq bo‘lardi.'
    }
  },
  {
    id: 'earth-volcano',
    subject: 'TABIIY FANLAR',
    title: 'Vulqon tajribasi',
    tagline: 'Litosfera dinamikasi va magma bosimi simulyatsiyasi',
    description: 'Magma kamerasidagi gaz bosimi, silikat miqdori va haroratni boshqaring. Vulqon otilishining kuchi, piroklastik bulut balandligi va seysmik to‘lqinlarni o‘lchang.',
    difficulty: 'Murakkab',
    duration: '15–20 daqiqa',
    color: 'from-amber-500 to-rose-600',
    accentColor: '#f97316',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #e11d48 100%)',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    iconName: 'Flame',
    tools: ['Magma kamerasi bosim o‘lchagichi', 'Silikat spektrometri', 'Infraqizil pirometr', 'Raqamli seysmograf', 'Gaz analizatori (SO₂/CO₂)'],
    keyFormula: 'P = ρ · g · h  va  VEI (0-8 skala)',
    explanation: {
      whatHappened: 'Magma kamerasida erigan gazlarning bosimi kritik chegaradan (75 bar) oshganda vulqon krateridagi qotgan tog‘ jinslari yorilib ketdi va kuchli portlovchi otilish (Eruptsiya) yuz berdi. Atmosferaga issiq kul, lava va vulqon gazlari otilib chiqdi.',
      scientificReason: 'Silikat miqdori (SiO₂) yuqori bo‘lgan magma juda qovushqoq bo‘ladi va gaz pufakchalarining erkin chiqib ketishiga yo‘l bermaydi. Natijada ulkan bosim yig‘ilib, portlovchi (Plinian tipidagi) falokatli otilishga sabab bo‘ladi. Silikati kam magma esa sekin, tinch oqadi.',
      formulaExplanation: 'VEI — Vulqon portlash indeksi (0 dan 8 gacha). Har bir pog‘ona portlash quvvati 10 barobarga oshishini bildiradi.',
      funFact: 'Tinch okeanidagi "Olovli halqa" deb ataluvchi mintaqada Yer sharidagi barcha faol vulqonlarning 75% dan ortig‘i va eng kuchli zilzilalarning 90% i sodir bo‘ladi.'
    }
  }
];

export const INITIAL_REAGENTS: ChemistryReagent[] = [
  {
    id: 'hcl',
    name: 'Xlorid kislota',
    formula: 'HCl (0.5 M)',
    type: 'acid',
    color: '#38bdf8',
    ph: 1.2,
    volume: 50,
    description: 'Kuchli bir asosli kislota, rangsiz o‘tkir hidli suyuqlik.'
  },
  {
    id: 'naoh',
    name: 'Natriy gidroksidi',
    formula: 'NaOH (0.5 M)',
    type: 'base',
    color: '#818cf8',
    ph: 13.5,
    volume: 50,
    description: 'Kuchli bir valentli ishqor (o‘yuvchi natriy).'
  },
  {
    id: 'phenolphthalein',
    name: 'Fenolftalein indikatori',
    formula: 'C₂₀H₁₄O₄',
    type: 'indicator',
    color: '#ec4899',
    ph: 7.0,
    volume: 15,
    description: 'Kislotada rangsiz, ishqoriy muhitda yorqin to‘q malina rangga kiradi.'
  },
  {
    id: 'cuso4',
    name: 'Mis kuporosi',
    formula: 'CuSO₄ eritmasi',
    type: 'salt',
    color: '#0284c7',
    ph: 4.8,
    volume: 40,
    description: 'Ko‘k rangli mis (II) sulfat tuzi eritmasi.'
  },
  {
    id: 'zn',
    name: 'Rux metall donalari',
    formula: 'Zn (metall)',
    type: 'metal',
    color: '#94a3b8',
    ph: 7.0,
    volume: 20,
    description: 'Kumushrang-kulrang faol metall granulalari.'
  },
  {
    id: 'h2o',
    name: 'Distillangan suv',
    formula: 'H₂O',
    type: 'water',
    color: '#38bdf8',
    ph: 7.0,
    volume: 100,
    description: 'Kimyoviy toza neytral erituvchi.'
  },
  {
    id: 'nahco3',
    name: 'Osh sodasi kukuni',
    formula: 'NaHCO₃',
    type: 'salt',
    color: '#f8fafc',
    ph: 8.4,
    volume: 30,
    description: 'Oq rangli osh sodasi (natriy gidrokarbonat) kukuni.'
  }
];

export const BIOLOGY_ORGANELLES: Record<string, BiologyOrganelle[]> = {
  'plant-cell': [
    {
      id: 'nucleus',
      nameUz: 'Hujayra yadrosi',
      nameLat: 'Nucleus',
      description: 'Hujayraning boshqaruv markazi, irsiy axborot (DNK) saqlanadigan joy.',
      functionUz: 'Oqsil sintezini va hujayra bo‘linishini nazorat qiladi.',
      color: '#a855f7',
      cx: 160,
      cy: 160,
      r: 42
    },
    {
      id: 'chloroplast',
      nameUz: 'Xloroplastlar',
      nameLat: 'Chloroplast',
      description: 'Fotosintez jarayoni kechuvchi yashil plastidalar.',
      functionUz: 'Quyosh nurini yutib, noorganik moddalardan glyukoza hosil qiladi.',
      color: '#22c55e',
      cx: 100,
      cy: 100,
      r: 26
    },
    {
      id: 'vacuole',
      nameUz: 'Markaziy vakuola',
      nameLat: 'Vacuole',
      description: 'Hujayra shirasi bilan to‘lgan yirik organoid.',
      functionUz: 'Turgor bosimini ta’minlaydi va suv hamda ozuqa zaxiralarini saqlaydi.',
      color: '#38bdf8',
      cx: 230,
      cy: 220,
      r: 58
    },
    {
      id: 'cellwall',
      nameUz: 'Hujayra po‘sti (devori)',
      nameLat: 'Cell Wall',
      description: 'Sellyuloza tolalaridan tuzilgan mustahkam tashqi qobiq.',
      functionUz: 'Hujayraga qat’iy tayanch beradi va uni tashqi ta’sirlardan himoyalaydi.',
      color: '#10b981',
      cx: 170,
      cy: 170,
      r: 140
    },
    {
      id: 'mitochondria',
      nameUz: 'Mitoxondriya',
      nameLat: 'Mitochondria',
      description: 'Hujayraning energiya stansiyasi (ATF sintezi).',
      functionUz: 'Hujayraviy nafas olish jarayonida organik moddalarni oksidlab energiya hosil qiladi.',
      color: '#f97316',
      cx: 240,
      cy: 110,
      r: 22
    }
  ]
};

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first-spark',
    title: 'Birinchi uchqun ⚡',
    description: 'Elektr zanjiri tajribasini muvaffaqiyatli yoqdingiz',
    icon: 'Zap',
    unlocked: false,
    category: 'FIZIKA'
  },
  {
    id: 'alchemist',
    title: 'Yosh alximik 🧪',
    description: 'Reaksiya laboratoriyasida yangi modda sintez qildingiz',
    icon: 'FlaskConical',
    unlocked: false,
    category: 'KIMYO'
  },
  {
    id: 'bio-explorer',
    title: 'Bio-kashfiyotchi 🌱',
    description: 'Mikroskop ostida hujayra organoidlarini to‘liq tadqiq qildingiz',
    icon: 'Microscope',
    unlocked: false,
    category: 'BIOLOGIYA'
  },
  {
    id: 'volcanologist',
    title: 'Magma hukmdori 🌋',
    description: 'Vulqon otilish parametrlarini muvozanatga keltirdingiz',
    icon: 'Flame',
    unlocked: false,
    category: 'TABIIY FANLAR'
  },
  {
    id: 'master-scientist',
    title: 'Yosh olim 🔬',
    description: '300 dan ortiq XP yig‘ib, yangi ilmiy darajaga erishdingiz',
    icon: 'Award',
    unlocked: false,
    category: 'UMUMIY'
  },
  {
    id: 'lab-expert',
    title: 'Laboratoriya eksperti 🏆',
    description: 'Barcha 4 ta fan bo‘yicha tajribalarni a’lo bahoga bajardingiz',
    icon: 'Trophy',
    unlocked: false,
    category: 'UMUMIY'
  }
];

export const LEVEL_DEFINITIONS = [
  { level: 1, title: 'Tadqiqotchi', minXp: 0, maxXp: 150 },
  { level: 2, title: 'Tajribachi', minXp: 151, maxXp: 350 },
  { level: 3, title: 'Yosh olim', minXp: 351, maxXp: 600 },
  { level: 4, title: 'Laboratoriya eksperti', minXp: 601, maxXp: 1000 },
];
