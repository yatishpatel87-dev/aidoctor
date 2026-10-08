import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Droplet,
  Sun,
  FlaskConical,
  Scissors,
  Bug,
  Search,
  Plus,
  Volume2,
  VolumeX,
  Sparkles,
  Calendar,
  Clock,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import {
  PlantCareReminder,
  NotificationSettings,
  Language,
  PlantProfile,
  TaskType,
} from '../types/plant';
import { translations } from '../i18n/translations';
import { db, getTodayDateString } from '../services/storageService';
import { notificationService } from '../services/notificationService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];
  const [reminders, setReminders] = useState<PlantCareReminder[]>([]);
  const [plants, setPlants] = useState<PlantProfile[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    browserNotificationsEnabled: false,
    morningReminderTime: '08:00',
    eveningReminderTime: '17:30',
    soundEnabled: true,
  });
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.getPermission()
  );
  const [activeTab, setActiveTab] = useState<'due' | 'upcoming' | 'completed'>(
    'due'
  );
  const [testSent, setTestSent] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Reminder form state
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customTaskType, setCustomTaskType] = useState<TaskType>('water');
  const [customFreq, setCustomFreq] = useState(1);
  const [customTime, setCustomTime] = useState('08:00');

  const today = getTodayDateString();

  const loadData = async () => {
    const list = await db.getReminders();
    setReminders(list);
    const pList = await db.getPlants();
    setPlants(pList);
    if (pList.length > 0 && !selectedPlantId) {
      setSelectedPlantId(pList[0].id);
    }
    const s = await db.getNotificationSettings();
    setSettings(s);
    setPermission(notificationService.getPermission());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setPermission(perm);
    const s = await db.getNotificationSettings();
    setSettings(s);
  };

  const handleSendTest = async () => {
    const success = await notificationService.sendTestNotification();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } else {
      alert('કૃપા કરીને પહેલા બ્રાઉઝર નોટિફિકેશન પરવાનગી આપો.');
    }
  };

  const handleMarkDone = async (id: string) => {
    notificationService.playGardenChime();
    await db.markReminderDone(id);
    await notificationService.refreshReminders();
    loadData();
  };

  const handleDeleteReminder = async (id: string) => {
    await db.deleteReminder(id);
    await notificationService.refreshReminders();
    loadData();
  };

  const handleToggleSound = async () => {
    const newSound = !settings.soundEnabled;
    await db.updateNotificationSettings({ soundEnabled: newSound });
    setSettings((prev) => ({ ...prev, soundEnabled: newSound }));
  };

  const handleCreateCustomReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const plant = plants.find((p) => p.id === selectedPlantId);
    const plantName = plant ? plant.name : 'બગીચો / છોડ';
    const plantImage = plant ? plant.coverImage : undefined;

    const newReminder: PlantCareReminder = {
      id: `rem-custom-${Date.now()}`,
      plantId: selectedPlantId || 'general',
      plantName,
      plantImage,
      taskType: customTaskType,
      title: customTitle.trim(),
      description: `${plantName} માટે નિયમિત ${customTaskType === 'water' ? 'પાણી આપવાનું' : 'સંભાળ'} કાર્ય.`,
      dueDate: today,
      dueTime: customTime,
      frequencyDays: customFreq,
      isCompletedToday: false,
      priority: 'high',
    };

    await db.saveReminder(newReminder);
    await notificationService.refreshReminders();
    setCustomTitle('');
    setShowAddForm(false);
    loadData();
  };

  // Group reminders
  const dueReminders = reminders.filter(
    (r) => !r.isCompletedToday && r.dueDate <= today
  );
  const upcomingReminders = reminders.filter(
    (r) => !r.isCompletedToday && r.dueDate > today
  );
  const completedReminders = reminders.filter((r) => r.isCompletedToday);

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'water':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'sun':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'fertilizer':
        return <FlaskConical className="w-4 h-4 text-purple-600" />;
      case 'prune':
        return <Scissors className="w-4 h-4 text-orange-600" />;
      case 'spray':
        return <Bug className="w-4 h-4 text-emerald-600" />;
      default:
        return <Search className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-700 flex items-center justify-center text-white border border-emerald-500/50 shadow-xs">
              <Bell className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {t.notificationsTitle}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {t.notificationsSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-full hover:bg-emerald-700 text-emerald-100 transition-colors"
              title={t.soundAlerts}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 opacity-60" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-emerald-700 text-emerald-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Permission Banner */}
        <div className="p-3.5 bg-stone-50 border-b border-stone-200">
          {permission === 'granted' ? (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.notificationsEnabled}</span>
              </div>
              <button
                onClick={handleSendTest}
                className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full font-bold text-[11px] transition-all shadow-2xs"
              >
                {testSent ? 'એલર્ટ મોકલાઈ ગયું! ✓' : t.testNotification}
              </button>
            </div>
          ) : permission === 'denied' ? (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                બ્રાઉઝરમાં નોટિફિકેશન બ્લૉક છે. સમયસર એલર્ટ મેળવવા સાઇટ સેટિંગ્સમાંથી પરવાનગી આપો.
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs">
              <span className="text-emerald-900 font-medium">
                પાણી આપવાના સમયસર રીમાઇન્ડર્સ માટે નોટિફિકેશન ચાલુ કરો:
              </span>
              <button
                onClick={handleRequestPermission}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-xs transition-all whitespace-nowrap"
              >
                {t.enableNotifications}
              </button>
            </div>
          )}
        </div>

        {/* Tabs: Due Today / Upcoming / Completed */}
        <div className="flex border-b border-stone-200 px-3 pt-2 gap-2 bg-white">
          <button
            onClick={() => setActiveTab('due')}
            className={`flex-1 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'due'
                ? 'bg-emerald-50/80 text-emerald-900 border-b-2 border-emerald-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>{t.dueToday}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                dueReminders.length > 0
                  ? 'bg-red-100 text-red-700 font-extrabold'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {dueReminders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'upcoming'
                ? 'bg-emerald-50/80 text-emerald-900 border-b-2 border-emerald-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>{t.upcoming}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-600">
              {upcomingReminders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-emerald-50/80 text-emerald-900 border-b-2 border-emerald-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>{t.completedToday}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
              {completedReminders.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-stone-50/40">
          {/* Quick Add Custom Reminder Form Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {activeTab === 'due'
                ? 'આજના સમયસર કાર્યો'
                : activeTab === 'upcoming'
                ? 'આગામી શેડ્યૂલ'
                : 'આજે પૂર્ણ થયેલા કાર્યો'}
            </span>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addCustomReminder}</span>
            </button>
          </div>

          {/* New Reminder Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateCustomReminder}
              className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-2.5 text-xs"
            >
              <h4 className="font-extrabold text-stone-900">
                નવું કસ્ટમ રીમાઇન્ડર ઉમેરો
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                    છોડ પસંદ કરો
                  </label>
                  <select
                    value={selectedPlantId}
                    onChange={(e) => setSelectedPlantId(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-white"
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                    કાર્ય પ્રકાર
                  </label>
                  <select
                    value={customTaskType}
                    onChange={(e) => setCustomTaskType(e.target.value as TaskType)}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="water">પાણી આપવું (Water)</option>
                    <option value="check">માટી / ભેજ તપાસ (Check)</option>
                    <option value="spray">નીમ ઓઈલ સ્પ્રે (Spray)</option>
                    <option value="fertilizer">ખાતર આપવું (Fertilizer)</option>
                    <option value="prune">કટિંગ / પ્રુનિંગ (Prune)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                  શીર્ષક (Title)
                </label>
                <input
                  type="text"
                  required
                  placeholder="દા.ત. સવારે હળવું પાણી આપવું"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full p-2 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                    આવર્તન (દિવસોમાં)
                  </label>
                  <select
                    value={customFreq}
                    onChange={(e) => setCustomFreq(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value={1}>દરરોજ (Daily)</option>
                    <option value={2}>દર ૨ દિવસે</option>
                    <option value={3}>દર ૩ દિવસે</option>
                    <option value={7}>દર અઠવાડિયે (Weekly)</option>
                    <option value={15}>દર ૧૫ દિવસે</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                    સમય (Time)
                  </label>
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-xl text-stone-500 hover:bg-stone-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl font-bold shadow-xs"
                >
                  ઉમેરો (Add)
                </button>
              </div>
            </form>
          )}

          {/* List items based on Active Tab */}
          {activeTab === 'due' && (
            <div className="space-y-2.5">
              {dueReminders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-300">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-stone-700">
                    {t.noPendingReminders}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    આવતીકાલના કાર્યો જોવા 'આગામી' ટેબ તપાસો.
                  </p>
                </div>
              ) : (
                dueReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-2xs hover:shadow-xs transition-all flex items-start gap-3"
                  >
                    {/* Plant photo / icon */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                      {rem.plantImage ? (
                        <img
                          src={rem.plantImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getTaskIcon(rem.taskType)}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 p-0.5 bg-white/90 rounded-tl-md">
                        {getTaskIcon(rem.taskType)}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-emerald-800 truncate">
                          {rem.plantName}
                        </span>
                        {rem.dueTime && (
                          <span className="text-[10px] text-stone-500 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{rem.dueTime}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-xs text-stone-900 mt-0.5">
                        {rem.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                        {rem.description}
                      </p>

                      {/* Action buttons */}
                      <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-stone-400">
                          આવર્તન: દર {rem.frequencyDays} દિવસે
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteReminder(rem.id)}
                            className="p-1 text-stone-300 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMarkDone(rem.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.markDone}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="space-y-2.5">
              {upcomingReminders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-300">
                  <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">
                    આગામી દિવસો માટે કોઈ શેડ્યૂલ નથી.
                  </p>
                </div>
              ) : (
                upcomingReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3 bg-white rounded-2xl border border-stone-200 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-stone-100 rounded-xl">
                        {getTaskIcon(rem.taskType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">
                            {rem.plantName}
                          </span>
                          <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-full text-stone-600 font-semibold">
                            તારીખ: {rem.dueDate}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {rem.title}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkDone(rem.id)}
                      className="text-xs font-semibold text-stone-500 hover:text-emerald-700 bg-stone-50 px-2.5 py-1 rounded-full border border-stone-200"
                    >
                      આજે પતાવ્યું?
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="space-y-2.5">
              {completedReminders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-300">
                  <p className="text-xs text-stone-400">
                    આજે હજુ કોઈ કાર્ય પૂર્ણ થયું નથી.
                  </p>
                </div>
              ) : (
                completedReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between gap-2 opacity-90"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <span className="font-bold text-emerald-950">
                          {rem.plantName} - {rem.title}
                        </span>
                        <p className="text-[10px] text-emerald-700">
                          આગામી તારીખ: {rem.dueDate}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      પૂર્ણ ✓
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI સ્કેન પરથી સ્વચાલિત શેડ્યૂલ તૈયાર થાય છે.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold"
          >
            બંધ કરો
          </button>
        </div>
      </div>
    </div>
  );
};
