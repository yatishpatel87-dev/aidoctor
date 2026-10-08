import {
  ScanRecord,
  PlantProfile,
  PlantAnalysisResult,
  PlantCareReminder,
  NotificationSettings,
} from '../types/plant';

export interface PlantDatabaseAdapter {
  getScans(): Promise<ScanRecord[]>;
  getScanById(id: string): Promise<ScanRecord | null>;
  saveScan(scan: ScanRecord): Promise<void>;
  deleteScan(id: string): Promise<void>;
  getScansByPlantId(plantId: string): Promise<ScanRecord[]>;

  getPlants(): Promise<PlantProfile[]>;
  getPlantById(id: string): Promise<PlantProfile | null>;
  savePlant(plant: PlantProfile): Promise<void>;
  updatePlant(plant: PlantProfile): Promise<void>;
  deletePlant(id: string): Promise<void>;

  getReminders(): Promise<PlantCareReminder[]>;
  getReminderById(id: string): Promise<PlantCareReminder | null>;
  saveReminder(reminder: PlantCareReminder): Promise<void>;
  updateReminder(reminder: PlantCareReminder): Promise<void>;
  deleteReminder(id: string): Promise<void>;
  markReminderDone(id: string): Promise<void>;
  getNotificationSettings(): Promise<NotificationSettings>;
  updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void>;
  generateRemindersFromScan(
    plantId: string,
    plantName: string,
    plantImage: string,
    analysis: PlantAnalysisResult
  ): Promise<void>;
}

const STORAGE_KEY_SCANS = 'plant_ai_doctor_scans_v1';
const STORAGE_KEY_PLANTS = 'plant_ai_doctor_plants_v1';
const STORAGE_KEY_REMINDERS = 'plant_ai_doctor_reminders_v1';
const STORAGE_KEY_NOTIF_SETTINGS = 'plant_ai_doctor_notif_settings_v1';

// Sample pre-loaded botanical scans for immediate demonstration of health trend & history
const SAMPLE_SCANS: ScanRecord[] = [
  {
    id: 'scan-sample-tulsi-1',
    plantId: 'plant-tulsi-1',
    timestamp: Date.now() - 14 * 86400000,
    dateFormatted: '1 Oct 2026',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    ],
    analysis: {
      plant: {
        name_gu: 'તુલસી (કૃષ્ણ તુલસી)',
        name_en: 'Holy Basil (Tulsi)',
        scientific_name: 'Ocimum tenuiflorum',
        category: 'ઔષધીય છોડ (Medicinal)',
        confidence: 96,
      },
      health: {
        score: 82,
        status: 'healthy',
        status_text: 'તંદુરસ્ત (Healthy)',
        confidence: 'high',
        summary: 'છોડનો મોટાભાગનો ભાગ સ્વસ્થ છે. નીચલા થોડા પાન પર સામાન્ય ભેજને કારણે પીળાશ છે.',
      },
      visual_symptoms: [
        {
          symptom: 'થોડા નીચલા પાન હળવા પીળા દેખાય છે',
          is_visible_fact: true,
          severity: 'low',
        },
        {
          symptom: 'ટોચના નવા પાન ઘાટા લીલા અને તેજસ્વી છે',
          is_visible_fact: true,
          severity: 'low',
        },
      ],
      possible_diseases: [],
      possible_pests: [],
      nutrient_issues: [
        {
          nutrient: 'Nitrogen (નાઇટ્રોજન)',
          status: 'normal',
          explanation: 'નવા પાનનો વિકાસ અને હરિતદ્રવ્ય સારું છે.',
        },
        {
          nutrient: 'Potassium (પોટેશિયમ)',
          status: 'normal',
          explanation: 'પાનની કિનારીઓ મજબૂત છે.',
        },
      ],
      watering: {
        advice: 'માટી સહેજ ભેજવાળી રાખો પરંતુ કૂંડામાં પાણી ભરાઈ ન રહેવું જોઈએ.',
        current_risk: 'normal',
        frequency_suggestion: 'દિવસમાં ૧ વાર (સવારે)',
        check_advice: 'માટી આંગળીથી 2–3 cm સુધી ચકાસો.',
      },
      sunlight: {
        requirement: 'Full Sun (સંપૂર્ણ સૂર્યપ્રકાશ)',
        hours_per_day: '૫ થી ૬ કલાક',
        advice: 'તુલસીને સવારનો તડકો ખૂબ અનુકૂળ આવે છે.',
      },
      soil: {
        preferred_type: 'ગોરાડુ અને સેન્દ્રીય ખાતરવાળી માટી',
        drainage: 'ઉત્તમ નિતાર જરૂરી',
        ph_range: '6.0 - 7.5',
        organic_matter: 'વર્મીકમ્પોસ્ટ દર મહિને',
        note: 'ચોક્કસ soil pH માટે લેબોરેટરી સોઈલ ટેસ્ટ જરૂરી છે.',
      },
      fertilizer: {
        organic_compost: '૧ મુઠ્ઠી વર્મીકમ્પોસ્ટ દર મહિને',
        vermicompost: 'અળસિયાનું ખાતર શ્રેષ્ઠ છે',
        general_npk: 'કોઈ રસાયણિક ખાતરની જરૂર નથી',
        precautions: ['ઔષધીય ઉપયોગ માટે ક્યારેય રાસાયણિક જંતુનાશકો ન છાંટવા'],
      },
      treatment: {
        immediate_actions: [
          'સૂકા કે પીળા પાનને હાથથી હળવેથી ચુંટી લો (Pinching)',
          'કૂંડાની ઉપરની માટી હળવી ગોડ કરો',
        ],
        organic_remedies: [
          '૧૫ દિવસે એકવાર છાશ અથવા હળવા લીંબોળીના તેલનો છંટકાવ કરો',
        ],
        prevention: [
          'મંજરી (બીજ) આવે ત્યારે તેને કાપી નાખવી જેથી છોડ ઘાટો રહે',
          'પાણી હંમેશા સવારે મૂળ પાસે જ આપવું',
        ],
      },
      doctor_explanation: {
        why_diagnosed:
          'પાનની ચમક અને દાંડીની મજબૂતી સારી છે. જૂના પાનની કુદરતી પીળાશ સિવાય કોઈ રોગના ચિહ્નો નથી.',
        visual_clues: ['ચોખ્ખા પાન', 'નવી ફૂટ'],
        uncertainty_notes: 'હવામાન બદલાય ત્યારે ધ્યાન રાખવું.',
      },
      confidence_level: 'high',
      doctor_note: 'તુલસીનો છોડ ખૂબ સારી સ્થિતિમાં છે. મંજરી નિયમિત કાપતા રહો.',
      care_calendar_preview: [
        { day: 1, task: 'સવારે હળવું પાણી આપવું', type: 'water' },
        { day: 4, task: 'મંજરી ચુંટવી (Pinching)', type: 'prune' },
        { day: 7, task: 'હળવી ગોડ કરવી', type: 'check' },
      ],
    },
  },
  {
    id: 'scan-sample-tulsi-2',
    plantId: 'plant-tulsi-1',
    timestamp: Date.now() - 7 * 86400000,
    dateFormatted: '8 Oct 2026',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    ],
    analysis: {
      plant: {
        name_gu: 'તુલસી (કૃષ્ણ તુલસી)',
        name_en: 'Holy Basil (Tulsi)',
        scientific_name: 'Ocimum tenuiflorum',
        category: 'ઔષધીય છોડ (Medicinal)',
        confidence: 95,
      },
      health: {
        score: 76,
        status: 'attention',
        status_text: 'ધ્યાન આપવાની જરૂર (Needs Attention)',
        confidence: 'high',
        summary: 'વધુ પડતા પાણીને કારણે મૂળિયાં પાસે ભેજ વધ્યો છે અને પાન સહેજ નમી ગયા છે.',
      },
      visual_symptoms: [
        {
          symptom: 'પાન સહેજ ઢીલા અને વળેલા જણાય છે',
          is_visible_fact: true,
          severity: 'medium',
        },
      ],
      possible_diseases: [],
      possible_pests: [],
      nutrient_issues: [],
      watering: {
        advice: 'કૂંડાની માટી વધુ પડતી ભીની જણાય છે. ૨ દિવસ પાણી આપવાનું બંધ રાખો.',
        current_risk: 'overwatering',
        frequency_suggestion: 'માટી સૂકાય ત્યારે જ',
        check_advice: 'માટી આંગળીથી 2–3 cm સુધી ચકાસો.',
      },
      sunlight: {
        requirement: 'Full Sun',
        hours_per_day: '૬ કલાક',
        advice: 'છોડને તડકામાં રાખો જેથી વધારે પડતો ભેજ સુકાય.',
      },
      soil: {
        preferred_type: 'સારો નિતાર',
        drainage: 'તળિયે કાણું ચેક કરો',
        ph_range: '6.5',
        organic_matter: 'કમ્પોસ્ટ',
        note: 'પાણી ભરાવો ન થવો જોઈએ.',
      },
      fertilizer: {
        organic_compost: 'હમણાં ખાતર ન આપવું',
        vermicompost: 'માટી સૂકાયા બાદ',
        general_npk: 'કોઈ નહીં',
        precautions: ['ભીની માટીમાં ખાતર ન આપવું'],
      },
      treatment: {
        immediate_actions: ['૨ દિવસ પાણી બંધ કરો', 'કૂંડાના નિકાલ હોલને સાફ કરો'],
        organic_remedies: ['હળવી હવાની અવરજવર વધારો'],
        prevention: ['નિયમિત માટી ચકાસીને જ પાણી આપવું'],
      },
      doctor_explanation: {
        why_diagnosed: 'પાન ઢીલા પડ્યા છે અને માટીમાં વધુ પડતો ભેજ છે.',
        visual_clues: ['Drooping leaves', 'Moist topsoil'],
        uncertainty_notes: 'મૂળનો સડો ન થાય તેની કાળજી રાખો.',
      },
      confidence_level: 'high',
      doctor_note: 'પાણી ઓછું કરવાથી છોડ ૨-૩ દિવસમાં ફરી ટટ્ટાર થઈ જશે.',
      care_calendar_preview: [
        { day: 1, task: 'પાણી ન આપવું, તડકામાં રાખવો', type: 'sun' },
        { day: 3, task: 'માટીની સૂકવણી તપાસવી', type: 'check' },
      ],
    },
  },
  {
    id: 'scan-sample-tulsi-3',
    plantId: 'plant-tulsi-1',
    timestamp: Date.now() - 1 * 86400000,
    dateFormatted: '15 Oct 2026',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    ],
    analysis: {
      plant: {
        name_gu: 'તુલસી (કૃષ્ણ તુલસી)',
        name_en: 'Holy Basil (Tulsi)',
        scientific_name: 'Ocimum tenuiflorum',
        category: 'ઔષધીય છોડ (Medicinal)',
        confidence: 98,
      },
      health: {
        score: 88,
        status: 'healthy',
        status_text: 'તંદુરસ્ત (Healthy)',
        confidence: 'high',
        summary: 'છોડ ફરીથી સંપૂર્ણપણે ખીલી ઉઠ્યો છે! આરોગ્ય સ્કોર ૭૬ થી વધીને ૮૮ થયો છે.',
      },
      visual_symptoms: [
        {
          symptom: 'બધા પાન ટટ્ટાર, તરોતાજા અને ચમકદાર છે',
          is_visible_fact: true,
          severity: 'low',
        },
      ],
      possible_diseases: [],
      possible_pests: [],
      nutrient_issues: [],
      watering: {
        advice: 'પાણીનું સંતુલન બરાબર જળવાઈ રહ્યું છે.',
        current_risk: 'normal',
        frequency_suggestion: 'દર ૨ દિવસે ૧ વાર',
        check_advice: 'માટી આંગળીથી 2–3 cm સુધી ચકાસો.',
      },
      sunlight: {
        requirement: 'Full Sun',
        hours_per_day: '૬ કલાક',
        advice: 'યોગ્ય તડકો મળી રહ્યો છે.',
      },
      soil: {
        preferred_type: 'સેન્દ્રીય માટી',
        drainage: 'ઉત્તમ',
        ph_range: '6.5',
        organic_matter: 'સંતોષકારક',
        note: 'માટીની ગુણવત્તા સારી છે.',
      },
      fertilizer: {
        organic_compost: 'મહિને ૧ મુઠ્ઠી વર્મીકમ્પોસ્ટ',
        vermicompost: 'ઉપયોગી',
        general_npk: 'કોઈ રસાયણિક નહીં',
        precautions: ['હળવી માત્રા'],
      },
      treatment: {
        immediate_actions: ['સામાન્ય સંભાળ ચાલુ રાખો'],
        organic_remedies: ['દર મહિને એકવાર લીંબોળી તેલ'],
        prevention: ['મંજરી નિયમિત કાપો'],
      },
      doctor_explanation: {
        why_diagnosed: 'છોડમાં નવી ફૂટ જોવા મળે છે અને પાન તંદુરસ્ત છે.',
        visual_clues: ['New healthy nodes', 'Firm foliage'],
        uncertainty_notes: 'સરસ રિકવરી થઈ છે.',
      },
      confidence_level: 'high',
      doctor_note: 'અભિનંદન! તમારા છોડનું આરોગ્ય ખૂબ સુધર્યું છે.',
      care_calendar_preview: [
        { day: 2, task: 'હળવું પાણી', type: 'water' },
        { day: 7, task: 'વર્મીકમ્પોસ્ટ આપવું', type: 'fertilizer' },
      ],
      comparison_note: 'છેલ્લા scan (76) ની સરખામણીએ health ૧૨ પોઇન્ટ સુધરીને ૮૮ થઈ છે!',
    },
  },
];

const SAMPLE_PLANTS: PlantProfile[] = [
  {
    id: 'plant-tulsi-1',
    name: 'મારી આંગણાની તુલસી',
    nickname: 'તુલસી મૈયા',
    species: 'Ocimum tenuiflorum',
    category: 'ઔષધીય છોડ (Medicinal)',
    coverImage:
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 30 * 86400000,
    location: 'balcony',
    latestHealthScore: 88,
    lastScanDate: '15 Oct 2026',
    scansCount: 3,
    notes: 'ઘરની ઉત્તર-પૂર્વ બાજુ કૂંડામાં મૂકેલ છે. રોજ સવારે પાણી અપાય છે.',
  },
  {
    id: 'plant-rose-2',
    name: 'લાલ દેશી ગુલાબ',
    nickname: 'ગુલાબ',
    species: 'Rosa damascena',
    category: 'બગીચાનું ફૂલ (Flowering)',
    coverImage:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 10 * 86400000,
    location: 'garden',
    latestHealthScore: 74,
    lastScanDate: '5 Oct 2026',
    scansCount: 1,
    notes: 'ફૂલો સરસ આવે છે પણ પાન પર હળવા કાળા ટપકાં (Black Spot) ની શંકા છે.',
  },
  {
    id: 'plant-tomato-3',
    name: 'ટામેટીનો છોડ',
    nickname: 'ગામઠી ટામેટા',
    species: 'Solanum lycopersicum',
    category: 'શાકભાજી પાક (Vegetable)',
    coverImage:
      'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 5 * 86400000,
    location: 'farm',
    latestHealthScore: 91,
    lastScanDate: '8 Oct 2026',
    scansCount: 1,
    notes: 'કૂંડામાં વાવેલ છે, ફૂલો આવવાની શરૂઆત થઈ છે.',
  },
];

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_NOTIF_SETTINGS: NotificationSettings = {
  browserNotificationsEnabled: false,
  morningReminderTime: '08:00',
  eveningReminderTime: '17:30',
  soundEnabled: true,
};

const SAMPLE_REMINDERS: PlantCareReminder[] = [
  {
    id: 'reminder-tulsi-water',
    plantId: 'plant-tulsi-1',
    plantName: 'તુલસી (કૃષ્ણ તુલસી)',
    plantImage:
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    taskType: 'water',
    title: 'સવારનું પાણી (Morning Watering)',
    description: 'માટી આંગળીથી ૨–૩ સેમી તપાસીને મૂળ પાસે હળવું પાણી આપો.',
    dueDate: getTodayDateString(),
    dueTime: '08:00',
    frequencyDays: 1,
    isCompletedToday: false,
    priority: 'high',
  },
  {
    id: 'reminder-tomato-check',
    plantId: 'plant-tomato-3',
    plantName: 'ટામેટીનો છોડ',
    plantImage:
      'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80',
    taskType: 'check',
    title: 'માટીનો ભેજ અને નવી કળીઓ તપાસો',
    description: 'ફૂલો ખરી ન પડે તે માટે કૂંડામાં સંતુલિત ભેજ જાળવો.',
    dueDate: getTodayDateString(),
    dueTime: '09:30',
    frequencyDays: 2,
    isCompletedToday: false,
    priority: 'medium',
  },
  {
    id: 'reminder-rose-spray',
    plantId: 'plant-rose-2',
    plantName: 'લાલ દેશી ગુલાબ',
    plantImage:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    taskType: 'spray',
    title: 'લીંબોળી તેલ સ્પ્રે (Neem Oil Spray)',
    description: 'સાંજના સમયે પાનની બંને બાજુ ૫ મિલી/લિટર નીમ ઓઈલ છાંટો.',
    dueDate: addDaysToDateString(getTodayDateString(), 1),
    dueTime: '17:30',
    frequencyDays: 7,
    isCompletedToday: false,
    priority: 'high',
  },
];

class LocalStorageAdapter implements PlantDatabaseAdapter {
  private ensureInitialized() {
    try {
      const scansStr = localStorage.getItem(STORAGE_KEY_SCANS);
      if (!scansStr) {
        localStorage.setItem(STORAGE_KEY_SCANS, JSON.stringify(SAMPLE_SCANS));
      }
      const plantsStr = localStorage.getItem(STORAGE_KEY_PLANTS);
      if (!plantsStr) {
        localStorage.setItem(STORAGE_KEY_PLANTS, JSON.stringify(SAMPLE_PLANTS));
      }
      const remindersStr = localStorage.getItem(STORAGE_KEY_REMINDERS);
      if (!remindersStr) {
        localStorage.setItem(
          STORAGE_KEY_REMINDERS,
          JSON.stringify(SAMPLE_REMINDERS)
        );
      }
      const notifSettingsStr = localStorage.getItem(STORAGE_KEY_NOTIF_SETTINGS);
      if (!notifSettingsStr) {
        localStorage.setItem(
          STORAGE_KEY_NOTIF_SETTINGS,
          JSON.stringify(DEFAULT_NOTIF_SETTINGS)
        );
      }
    } catch (e) {
      console.warn('LocalStorage access issue:', e);
    }
  }

  async getScans(): Promise<ScanRecord[]> {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEY_SCANS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  async getScanById(id: string): Promise<ScanRecord | null> {
    const scans = await this.getScans();
    return scans.find((s) => s.id === id) || null;
  }

  async saveScan(scan: ScanRecord): Promise<void> {
    const scans = await this.getScans();
    const updated = [scan, ...scans.filter((s) => s.id !== scan.id)];
    localStorage.setItem(STORAGE_KEY_SCANS, JSON.stringify(updated));

    // Also update associated plant's latest health score if linked
    if (scan.plantId) {
      const plants = await this.getPlants();
      const pIdx = plants.findIndex((p) => p.id === scan.plantId);
      if (pIdx !== -1) {
        plants[pIdx].latestHealthScore = scan.analysis.health.score;
        plants[pIdx].lastScanDate = scan.dateFormatted;
        plants[pIdx].scansCount = (plants[pIdx].scansCount || 0) + 1;
        if (scan.images && scan.images[0]) {
          plants[pIdx].coverImage = scan.images[0];
        }
        await this.updatePlant(plants[pIdx]);
      }
    }
  }

  async deleteScan(id: string): Promise<void> {
    const scans = await this.getScans();
    const filtered = scans.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY_SCANS, JSON.stringify(filtered));
  }

  async getScansByPlantId(plantId: string): Promise<ScanRecord[]> {
    const scans = await this.getScans();
    return scans
      .filter((s) => s.plantId === plantId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async getPlants(): Promise<PlantProfile[]> {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEY_PLANTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  async getPlantById(id: string): Promise<PlantProfile | null> {
    const plants = await this.getPlants();
    return plants.find((p) => p.id === id) || null;
  }

  async savePlant(plant: PlantProfile): Promise<void> {
    const plants = await this.getPlants();
    const updated = [plant, ...plants.filter((p) => p.id !== plant.id)];
    localStorage.setItem(STORAGE_KEY_PLANTS, JSON.stringify(updated));
  }

  async updatePlant(plant: PlantProfile): Promise<void> {
    const plants = await this.getPlants();
    const updated = plants.map((p) => (p.id === plant.id ? plant : p));
    localStorage.setItem(STORAGE_KEY_PLANTS, JSON.stringify(updated));
  }

  async deletePlant(id: string): Promise<void> {
    const plants = await this.getPlants();
    const filtered = plants.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PLANTS, JSON.stringify(filtered));
  }

  async getReminders(): Promise<PlantCareReminder[]> {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEY_REMINDERS);
      const list: PlantCareReminder[] = data ? JSON.parse(data) : [];
      const today = getTodayDateString();
      return list.map((r) => ({
        ...r,
        isCompletedToday: r.lastCompletedDate === today,
      }));
    } catch (e) {
      return [];
    }
  }

  async getReminderById(id: string): Promise<PlantCareReminder | null> {
    const list = await this.getReminders();
    return list.find((r) => r.id === id) || null;
  }

  async saveReminder(reminder: PlantCareReminder): Promise<void> {
    const list = await this.getReminders();
    const updated = [reminder, ...list.filter((r) => r.id !== reminder.id)];
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(updated));
  }

  async updateReminder(reminder: PlantCareReminder): Promise<void> {
    const list = await this.getReminders();
    const updated = list.map((r) => (r.id === reminder.id ? reminder : r));
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(updated));
  }

  async deleteReminder(id: string): Promise<void> {
    const list = await this.getReminders();
    const filtered = list.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(filtered));
  }

  async markReminderDone(id: string): Promise<void> {
    const list = await this.getReminders();
    const today = getTodayDateString();
    const updated = list.map((r) => {
      if (r.id === id) {
        const nextDue = addDaysToDateString(today, r.frequencyDays || 1);
        return {
          ...r,
          lastCompletedDate: today,
          isCompletedToday: true,
          dueDate: nextDue,
        };
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(updated));
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEY_NOTIF_SETTINGS);
      return data
        ? { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(data) }
        : DEFAULT_NOTIF_SETTINGS;
    } catch (e) {
      return DEFAULT_NOTIF_SETTINGS;
    }
  }

  async updateNotificationSettings(
    settings: Partial<NotificationSettings>
  ): Promise<void> {
    const current = await this.getNotificationSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY_NOTIF_SETTINGS, JSON.stringify(updated));
  }

  async generateRemindersFromScan(
    plantId: string,
    plantName: string,
    plantImage: string,
    analysis: PlantAnalysisResult
  ): Promise<void> {
    const today = getTodayDateString();
    const newReminders: PlantCareReminder[] = [];

    // 1. Water Reminder
    let waterFreq = 1;
    const adviceText = (analysis.watering?.frequency_suggestion || '').toLowerCase();
    if (
      adviceText.includes('૨ દિવસ') ||
      adviceText.includes('2 દિવસ') ||
      adviceText.includes('2 day')
    ) {
      waterFreq = 2;
    } else if (
      adviceText.includes('અઠવાડિયામાં') ||
      adviceText.includes('week')
    ) {
      waterFreq = 3;
    }

    newReminders.push({
      id: `rem-water-${plantId}-${Date.now()}`,
      plantId,
      plantName,
      plantImage,
      taskType: 'water',
      title: `${plantName} - પાણી આપવું (Watering)`,
      description:
        analysis.watering?.advice ||
        'માટી ૨-૩ સેમી ચકાસીને મૂળ પાસે સવારે પાણી આપો.',
      dueDate: today,
      dueTime: '08:00',
      frequencyDays: waterFreq,
      isCompletedToday: false,
      priority: 'high',
    });

    // 2. Care Calendar tasks
    if (
      analysis.care_calendar_preview &&
      analysis.care_calendar_preview.length > 0
    ) {
      analysis.care_calendar_preview.slice(0, 2).forEach((taskItem, i) => {
        newReminders.push({
          id: `rem-care-${plantId}-${taskItem.day}-${Date.now() + i + 1}`,
          plantId,
          plantName,
          plantImage,
          taskType:
            taskItem.type === 'fertilizer'
              ? 'fertilizer'
              : taskItem.type === 'prune'
              ? 'prune'
              : 'check',
          title: `${plantName} - ${taskItem.task}`,
          description: taskItem.description || taskItem.task,
          dueDate: addDaysToDateString(today, taskItem.day),
          dueTime: '09:00',
          frequencyDays: taskItem.day > 3 ? 7 : 3,
          isCompletedToday: false,
          priority: taskItem.type === 'fertilizer' ? 'medium' : 'low',
        });
      });
    }

    for (const rem of newReminders) {
      await this.saveReminder(rem);
    }
  }
}

// Export singleton instance of current adapter
export const db: PlantDatabaseAdapter = new LocalStorageAdapter();
