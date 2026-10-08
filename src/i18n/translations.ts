import { Language } from '../types/plant';

export interface Translations {
  appName: string;
  appSubtitle: string;
  heroTagline: string;
  scanPlant: string;
  uploadPhoto: string;
  myPlants: string;
  scanHistory: string;
  home: string;
  scan: string;
  history: string;
  profile: string;
  camera: string;
  gallery: string;
  retake: string;
  analyze: string;
  cancel: string;
  cameraGuide: string;
  photoTipsTitle: string;
  photoTip1: string;
  photoTip2: string;
  photoTip3: string;
  uploading: string;
  analyzingPlant: string;
  analyzingSteps: {
    image: string;
    identifying: string;
    health: string;
    disease: string;
    pest: string;
    treatment: string;
    final: string;
  };
  healthTitle: string;
  healthy: string;
  needsAttention: string;
  moderateProblem: string;
  critical: string;
  symptomsTitle: string;
  diseaseTitle: string;
  pestTitle: string;
  nutritionTitle: string;
  waterTitle: string;
  sunlightTitle: string;
  soilTitle: string;
  fertilizerTitle: string;
  treatmentTitle: string;
  immediateAction: string;
  organicRemedy: string;
  prevention: string;
  whyAiSaidThis: string;
  aiDoctorNote: string;
  askDoctor: string;
  chatPlaceholder: string;
  send: string;
  listen: string;
  playing: string;
  paused: string;
  stop: string;
  scanAgain: string;
  savePlant: string;
  savedSuccessfully: string;
  disclaimer: string;
  careCalendar: string;
  healthTrend: string;
  quickQuestions: string[];
  noScansYet: string;
  noPlantsYet: string;
  addNewPlant: string;
  recentScans: string;
  careReminders: string;
  selectLanguage: string;
  notificationsTitle: string;
  notificationsSubtitle: string;
  enableNotifications: string;
  notificationsEnabled: string;
  notificationsBlocked: string;
  markDone: string;
  completedToday: string;
  dueToday: string;
  upcoming: string;
  testNotification: string;
  soundAlerts: string;
  noPendingReminders: string;
  addCustomReminder: string;
}

export const translations: Record<Language, Translations> = {
  gu: {
    appName: '🌿 Plant AI Doctor',
    appSubtitle: 'તમારા છોડનો AI ડૉક્ટર',
    heroTagline: '📷 છોડનો ફોટો સ્કેન કરો અને જાણો તમારા છોડની તબિયત',
    scanPlant: '🔍 Scan Plant',
    uploadPhoto: '🖼️ Upload Photo',
    myPlants: '🌱 My Plants',
    scanHistory: '📊 Scan History',
    home: 'Home',
    scan: 'Scan',
    history: 'History',
    profile: 'My Plants',
    camera: 'કેમેરા વાપરો',
    gallery: 'ગેલેરીમાંથી પસંદ કરો',
    retake: 'ફરીથી ફોટો લો',
    analyze: 'છોડનું વિશ્લેષણ કરો (Analyze)',
    cancel: 'રદ કરો',
    cameraGuide: 'સારો પ્રકાશ રાખો અને પાનનો સ્પષ્ટ ફોટો લો.',
    photoTipsTitle: 'વધુ સચોટ પરિણામ માટે ૩ પ્રકારના ફોટા લો:',
    photoTip1: '૧. આખા છોડનો ફોટો (Full Plant)',
    photoTip2: '૨. અસરગ્રસ્ત પાનનો ક્લોઝ-અપ (Affected Leaf)',
    photoTip3: '૩. ફૂલ / ફળ / ડાંડીનો ક્લોઝ-અપ (Stem / Flower / Fruit)',
    uploading: 'ફોટો અપલોડ થઈ રહ્યો છે...',
    analyzingPlant: 'તમારા છોડનું AI દ્વારા વિશ્લેષણ થઈ રહ્યું છે…',
    analyzingSteps: {
      image: 'ફોટો સ્કેનિંગ',
      identifying: 'છોડની ઓળખ',
      health: 'આરોગ્ય વિશ્લેષણ',
      disease: 'રોગની તપાસ',
      pest: 'જીવાતની ચકાસણી',
      treatment: 'ઉપચાર યોજના',
      final: 'સંપૂર્ણ રિપોર્ટ તૈયાર',
    },
    healthTitle: '🩺 છોડનું આરોગ્ય સ્કોર',
    healthy: 'તંદુરસ્ત (Healthy)',
    needsAttention: 'ધ્યાન આપવાની જરૂર (Needs Attention)',
    moderateProblem: 'મધ્યમ સમસ્યા (Moderate Problem)',
    critical: 'ગંભીર સ્થિતિ (Critical)',
    symptomsTitle: '🔎 દેખાતા લક્ષણો (Visual Symptoms)',
    diseaseTitle: '🦠 સંભવિત રોગ (Possible Disease)',
    pestTitle: '🐛 સંભવિત જીવાત (Possible Pest)',
    nutritionTitle: '🌱 પોષક તત્વોની ચકાસણી (Nutrient Check)',
    waterTitle: '💧 પાણીની સલાહ (Water Advice)',
    sunlightTitle: '☀️ સૂર્યપ્રકાશની જરૂરિયાત (Light Requirement)',
    soilTitle: '🪴 માટીની સલાહ (Soil Advice)',
    fertilizerTitle: '🧪 પોષણ અને ખાતર (Nutrition & Fertilizer)',
    treatmentTitle: '💊 સારવાર અને ઉપાય યોજના (Treatment Plan)',
    immediateAction: '૧. તરત શું કરવું? (Immediate Action)',
    organicRemedy: '૨. કુદરતી / ઓર્ગેનિક ઉપાય (Organic Remedies)',
    prevention: '૩. આગળ કેવી રીતે બચાવવું? (Long-term Prevention)',
    whyAiSaidThis: '🔎 AIએ આવું કેમ કહ્યું? (AI Reasoning)',
    aiDoctorNote: '👨‍⚕️ AI ડૉક્ટર નોંધ',
    askDoctor: '💬 તમારા છોડ વિશે કંઈપણ પૂછો',
    chatPlaceholder: 'દા.ત., મારા છોડના પાન પીળા કેમ થાય છે? પૂછો...',
    send: 'મોકલો',
    listen: 'સાંભળો (Listen)',
    playing: 'વાંચી રહ્યું છે...',
    paused: 'અટકાવેલ',
    stop: 'બંધ કરો',
    scanAgain: '🔄 ફરીથી સ્કેન કરો (Scan Again)',
    savePlant: '🌱 My Plants માં સાચવો',
    savedSuccessfully: 'છોડ સફળતાપૂર્વક સાચવાઈ ગયો!',
    disclaimer: '⚠️ સૂચના: આ માહિતી AI વિઝ્યુઅલ વિશ્લેષણ પર આધારિત પ્રાથમિક માર્ગદર્શન છે. ખેતીના મોટા પાક કે રાસાયણિક દવાઓ વાપરતા પહેલા સ્થાનિક કૃષિ વિજ્ઞાન કેન્દ્ર (KVK) અથવા નિષ્ણાતની સલાહ લો.',
    careCalendar: '📅 સંભાળ કેલેન્ડર (Care Plan)',
    healthTrend: '📈 હેલ્થ ટ્રેન્ડ (Health Trend)',
    quickQuestions: [
      'મારા છોડના પાન પીળા કેમ થાય છે?',
      'આ છોડને કેટલું પાણી આપવું?',
      'કયા ખાતરની જરૂર છે?',
      'આ છોડને તડકો કેટલો જોઈએ?',
      'આ રોગ ફરી ન થાય તે માટે શું કરવું?',
    ],
    noScansYet: 'હજુ સુધી કોઈ સ્કેન કર્યું નથી. તમારા પહેલા છોડનો ફોટો લો!',
    noPlantsYet: 'હજુ સુધી કોઈ છોડ સાચવેલ નથી. તમારા છોડનો રિપોર્ટ સાચવીને પ્રોફાઇલ બનાવો.',
    addNewPlant: '+ નવો છોડ ઉમેરો',
    recentScans: 'તાજેતરના સ્કેન (Recent Scans)',
    careReminders: 'આજની સંભાળ રીમાઇન્ડર્સ (Care Reminders)',
    selectLanguage: 'ભાષા પસંદ કરો',
    notificationsTitle: '🔔 સંભાળ રીમાઇન્ડર્સ (Care Alerts)',
    notificationsSubtitle: 'છોડને સમયસર પાણી અને ખાતર આપવા માટે લોકલ એલર્ટ',
    enableNotifications: 'નોટિફિકેશન ચાલુ કરો',
    notificationsEnabled: 'નોટિફિકેશન સક્રિય છે ✓',
    notificationsBlocked: 'બ્રાઉઝરમાં નોટિફિકેશન બંધ છે',
    markDone: 'પૂર્ણ કર્યું ✓',
    completedToday: 'આજે પૂર્ણ',
    dueToday: 'આજે બાકી',
    upcoming: 'આગામી દિવસો',
    testNotification: 'ટેસ્ટ નોટિફિકેશન મોકલો 🔔',
    soundAlerts: 'કુદરતી અવાજ એલર્ટ (Chime Sound)',
    noPendingReminders: 'આજે બધા છોડની સંભાળ પૂર્ણ થઈ ગઈ છે! 🌱',
    addCustomReminder: '+ નવું રીમાઇન્ડર ઉમેરો',
  },
  en: {
    appName: '🌿 Plant AI Doctor',
    appSubtitle: 'Your Personal AI Plant Doctor & Care Assistant',
    heroTagline: '📷 Scan plant photos to diagnose health, pests, and get instant care advice',
    scanPlant: '🔍 Scan Plant',
    uploadPhoto: '🖼️ Upload Photo',
    myPlants: '🌱 My Plants',
    scanHistory: '📊 Scan History',
    home: 'Home',
    scan: 'Scan',
    history: 'History',
    profile: 'My Plants',
    camera: 'Use Camera',
    gallery: 'Choose from Gallery',
    retake: 'Retake Photo',
    analyze: 'Analyze Plant',
    cancel: 'Cancel',
    cameraGuide: 'Keep good lighting and take a sharp close-up photo of the leaf.',
    photoTipsTitle: 'For best results, take up to 3 photos:',
    photoTip1: '1. Full Plant Overview',
    photoTip2: '2. Close-up of Affected Leaf',
    photoTip3: '3. Close-up of Stem, Flower, or Fruit',
    uploading: 'Uploading photo...',
    analyzingPlant: 'AI is analyzing your plant...',
    analyzingSteps: {
      image: 'Scanning Image',
      identifying: 'Plant Identification',
      health: 'Health Analysis',
      disease: 'Disease Check',
      pest: 'Pest Detection',
      treatment: 'Treatment Formulation',
      final: 'Preparing Final Report',
    },
    healthTitle: '🩺 Plant Health Score',
    healthy: 'Healthy',
    needsAttention: 'Needs Attention',
    moderateProblem: 'Moderate Problem',
    critical: 'Critical',
    symptomsTitle: '🔎 Visual Symptoms',
    diseaseTitle: '🦠 Possible Disease',
    pestTitle: '🐛 Possible Pest',
    nutritionTitle: '🌱 Nutrient Check',
    waterTitle: '💧 Water Advice',
    sunlightTitle: '☀️ Light Requirement',
    soilTitle: '🪴 Soil Advice',
    fertilizerTitle: '🧪 Nutrition & Fertilizer',
    treatmentTitle: '💊 Treatment Plan',
    immediateAction: '1. What to do immediately?',
    organicRemedy: '2. Natural & Organic Remedies',
    prevention: '3. Long-term Prevention',
    whyAiSaidThis: '🔎 Why did AI say this?',
    aiDoctorNote: "👨‍⚕️ AI Doctor's Note",
    askDoctor: '💬 Ask anything about your plant',
    chatPlaceholder: 'e.g. Why are my plant leaves turning yellow?',
    send: 'Send',
    listen: 'Listen (Audio)',
    playing: 'Playing audio...',
    paused: 'Paused',
    stop: 'Stop',
    scanAgain: '🔄 Scan Again',
    savePlant: '🌱 Save to My Plants',
    savedSuccessfully: 'Plant saved successfully!',
    disclaimer: '⚠️ Disclaimer: This diagnosis is based on AI visual analysis. For commercial crops or heavy chemicals, consult local agricultural extension officers or test soil.',
    careCalendar: '📅 Care Calendar Plan',
    healthTrend: '📈 Health Trend',
    quickQuestions: [
      'Why are my leaves turning yellow?',
      'How much water should I give?',
      'Which fertilizer is best?',
      'How much sunlight does it need?',
      'How to prevent this disease in future?',
    ],
    noScansYet: 'No scans saved yet. Take a photo of your first plant!',
    noPlantsYet: 'No plants saved in your garden yet.',
    addNewPlant: '+ Add New Plant',
    recentScans: 'Recent Scans',
    careReminders: "Today's Care Reminders",
    selectLanguage: 'Select Language',
    notificationsTitle: '🔔 Care Reminders',
    notificationsSubtitle: 'Timely watering & fertilization alerts for your garden',
    enableNotifications: 'Enable Notifications',
    notificationsEnabled: 'Notifications Active ✓',
    notificationsBlocked: 'Notifications Blocked in Browser',
    markDone: 'Mark Done ✓',
    completedToday: 'Completed Today',
    dueToday: 'Due Today',
    upcoming: 'Upcoming Days',
    testNotification: 'Send Test Notification 🔔',
    soundAlerts: 'Chime Sound Alerts',
    noPendingReminders: 'All plant care completed for today! 🌱',
    addCustomReminder: '+ Add Custom Reminder',
  },
  hi: {
    appName: '🌿 Plant AI Doctor',
    appSubtitle: 'आपके पौधों का AI डॉक्टर',
    heroTagline: '📷 पौधे की फोटो स्कैन करें और स्वास्थ्य, रोग व देखभाल की जानकारी पाएं',
    scanPlant: '🔍 Scan Plant',
    uploadPhoto: '🖼️ Upload Photo',
    myPlants: '🌱 My Plants',
    scanHistory: '📊 Scan History',
    home: 'Home',
    scan: 'Scan',
    history: 'History',
    profile: 'My Plants',
    camera: 'कैमरा उपयोग करें',
    gallery: 'गैलरी से चुनें',
    retake: 'दोबारा फोटो लें',
    analyze: 'पौधे का विश्लेषण करें',
    cancel: 'रद्द करें',
    cameraGuide: 'अच्छी रोशनी रखें और पत्ती का स्पष्ट फोटो लें।',
    photoTipsTitle: 'सटीक परिणाम के लिए ३ प्रकार की फोटो लें:',
    photoTip1: '१. पूरे पौधे की फोटो',
    photoTip2: '२. प्रभावित पत्ती का क्लोज़-अप',
    photoTip3: '३. तने / फूल / फल का क्लोज़-अप',
    uploading: 'फोटो अपलोड हो रही है...',
    analyzingPlant: 'AI आपके पौधे का विश्लेषण कर रहा है...',
    analyzingSteps: {
      image: 'फोटो स्कैनिंग',
      identifying: 'पौधे की पहचान',
      health: 'स्वास्थ्य विश्लेषण',
      disease: 'रोग की जांच',
      pest: 'कीट की जांच',
      treatment: 'उपचार योजना',
      final: 'रिपोर्ट तैयार',
    },
    healthTitle: '🩺 पौधे का स्वास्थ्य स्कोर',
    healthy: 'स्वस्थ (Healthy)',
    needsAttention: 'ध्यान देने योग्य (Needs Attention)',
    moderateProblem: 'मध्यम समस्या (Moderate Problem)',
    critical: 'गंभीर स्थिति (Critical)',
    symptomsTitle: '🔎 दिखाई देने वाले लक्षण (Visual Symptoms)',
    diseaseTitle: '🦠 संभावित रोग (Possible Disease)',
    pestTitle: '🐛 संभावित कीट (Possible Pest)',
    nutritionTitle: '🌱 पोषक तत्व जांच (Nutrient Check)',
    waterTitle: '💧 पानी की सलाह (Water Advice)',
    sunlightTitle: '☀️ धूप की आवश्यकता (Sunlight)',
    soilTitle: '🪴 मिट्टी की सलाह (Soil Advice)',
    fertilizerTitle: '🧪 पोषण और खाद (Fertilizer)',
    treatmentTitle: '💊 उपचार और समाधान (Treatment Plan)',
    immediateAction: '१. तुरंत क्या करें?',
    organicRemedy: '२. प्राकृतिक और जैविक उपाय',
    prevention: '३. भविष्य में कैसे बचाएं?',
    whyAiSaidThis: '🔎 AI ने ऐसा क्यों कहा?',
    aiDoctorNote: '👨‍⚕️ AI डॉक्टर की सलाह',
    askDoctor: '💬 अपने पौधे के बारे में कुछ भी पूछें',
    chatPlaceholder: 'उदा. पत्तियां पीली क्यों पड़ रही हैं? पूछें...',
    send: 'भेजें',
    listen: 'सुनें (Audio)',
    playing: 'चल रहा है...',
    paused: 'रुका हुआ',
    stop: 'बंद करें',
    scanAgain: '🔄 दोबारा स्कैन करें (Scan Again)',
    savePlant: '🌱 My Plants में सहेजें',
    savedSuccessfully: 'पौधा सफलतापूर्वक सहेजा गया!',
    disclaimer: '⚠️ सूचना: यह जानकारी AI विजुअल विश्लेषण पर आधारित है। रासायनिक दवाओं के छिड़काव से पहले कृषि वैज्ञानिक की सलाह अवश्य लें।',
    careCalendar: '📅 देखभाल कैलेंडर (Care Plan)',
    healthTrend: '📈 स्वास्थ्य रुझान (Health Trend)',
    quickQuestions: [
      'पौधे की पत्तियां पीली क्यों हो रही हैं?',
      'इस पौधे को कितना पानी देना चाहिए?',
      'कौन सी खाद सबसे अच्छी है?',
      'इस पौधे को कितनी धूप चाहिए?',
      'इस रोग से दोबारा बचाव कैसे करें?',
    ],
    noScansYet: 'अभी तक कोई स्कैन नहीं हुआ। अपने पौधे का फोटो लें!',
    noPlantsYet: 'अभी तक कोई पौधा सहेजा नहीं गया है।',
    addNewPlant: '+ नया पौधा जोड़ें',
    recentScans: 'हाल के स्कैन (Recent Scans)',
    careReminders: 'आज के देखभाल रिमाइंडर',
    selectLanguage: 'भाषा चुनें',
    notificationsTitle: '🔔 देखभाल रिमाइंडर',
    notificationsSubtitle: 'पौधों को समय पर पानी और खाद देने के स्थानीय अलर्ट',
    enableNotifications: 'नोटिफिकेशन चालू करें',
    notificationsEnabled: 'नोटिफिकेशन सक्रिय है ✓',
    notificationsBlocked: 'ब्राउज़र में अनुमति बंद है',
    markDone: 'पूर्ण किया ✓',
    completedToday: 'आज पूर्ण',
    dueToday: 'आज बाकी',
    upcoming: 'आगामी दिन',
    testNotification: 'टेस्ट नोटिफिकेशन भेजें 🔔',
    soundAlerts: 'ध्वनि चेतावनी (Chime Sound)',
    noPendingReminders: 'आज सभी पौधों की देखभाल पूरी हो चुकी है! 🌱',
    addCustomReminder: '+ नया रिमाइंडर जोड़ें',
  },
};
