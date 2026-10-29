import React, { useState } from 'react';
import { Scenario, SupportedLanguage, CountryData } from '../../types/game';
import { SCENARIOS } from '../../data/scenarios';
import { INITIAL_COUNTRIES } from '../../data/countries';
import { TRANSLATIONS } from '../../data/translations';
import { sound } from '../../simulation/soundEngine';
import { 
  Play, 
  RotateCcw, 
  FolderOpen, 
  Users, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Languages, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Swords,
  Coins,
  Globe2,
  X,
  PlusCircle,
  Crown,
  ChevronDown
} from 'lucide-react';

interface MainMenuProps {
  hasSavedGame: boolean;
  onContinueGame: () => void;
  onStartNewGame: (
    scenarioId: string, 
    playerCountryId: string, 
    difficulty: 'Casual' | 'Strategist' | 'Grand Master',
    customCountryData?: Partial<CountryData>
  ) => void;
  onOpenSaves: () => void;
  onOpenMultiplayer: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  language: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  hasSavedGame,
  onContinueGame,
  onStartNewGame,
  onOpenSaves,
  onOpenMultiplayer,
  isMuted,
  onToggleMute,
  language,
  onSelectLanguage,
}) => {
  const isPersian = language === 'fa';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRTL = language === 'fa' || language === 'ar';

  const [view, setView] = useState<'main' | 'scenario' | 'tutorial' | 'credits'>('main');

  // Scenario Selection State
  const [selectedScenarioId, setSelectedScenarioId] = useState(SCENARIOS[0].id);
  const [selectedCountryId, setSelectedCountryId] = useState('364'); // Default Iran
  const [difficulty, setDifficulty] = useState<'Casual' | 'Strategist' | 'Grand Master'>('Strategist');

  // Custom Country Genesis State ("ساخت کشور از ۰")
  const [customName, setCustomName] = useState('New Sovereign State');
  const [customNameFa, setCustomNameFa] = useState('دولت حاکم مستقل');
  const [customFlag, setCustomFlag] = useState('🦁');
  const [customColor, setCustomColor] = useState('#0284c7');
  const [customGovernment, setCustomGovernment] = useState('Republic');

  const [showLangMenu, setShowLangMenu] = useState(false);

  const languagesList: { id: SupportedLanguage; label: string; flag: string }[] = [
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'fa', label: 'فارسی', flag: '🇮🇷' },
    { id: 'ar', label: 'العربية', flag: '🇸🇦' },
    { id: 'ru', label: 'Русский', flag: '🇷🇺' },
    { id: 'zh', label: '中文', flag: '🇨🇳' },
    { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { id: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  const currentScenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];
  const isCustomMode = currentScenario.mode === 'custom_genesis';
  const selectedCountry = INITIAL_COUNTRIES[selectedCountryId] || INITIAL_COUNTRIES['364'];

  const handleLaunch = () => {
    sound.playTriumph();
    if (isCustomMode) {
      const customData: Partial<CountryData> = {
        name: customName,
        nameFa: customNameFa,
        flagEmoji: customFlag,
        color: customColor,
        government: customGovernment as any,
        treasury: 25000,
        gdp: 650,
        population: 60,
      };
      onStartNewGame(selectedScenarioId, selectedCountryId, difficulty, customData);
    } else {
      onStartNewGame(selectedScenarioId, selectedCountryId, difficulty);
    }
  };

  return (
    <div 
      className="relative w-screen h-screen bg-[#070b14] overflow-hidden flex items-center justify-center select-none font-sans text-slate-100"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background Cartography & Radar Scan Visuals */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute w-[800px] h-[800px] rounded-full border border-sky-500/10 -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full border border-sky-500/15 -top-16 -left-16 pointer-events-none" />
      <div className="absolute w-[1000px] h-[1000px] rounded-full border border-sky-500/5 -bottom-60 -right-60 pointer-events-none" />

      {/* Atmospheric Radar Sweep Effect */}
      <div className="absolute w-96 h-96 rounded-full border border-sky-500/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-full h-full rounded-full border-r border-sky-400/30 animate-radar" />
      </div>

      {/* Top Controls: Sound & 7-Language Switcher */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-300 transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
        </button>

        {/* 7-Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="px-3 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-200 font-bold transition-colors flex items-center gap-1.5 text-xs"
          >
            <Languages className="w-3.5 h-3.5 text-sky-400" />
            <span className="uppercase">{language}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#0b1220] border border-sky-500/30 rounded-xl shadow-2xl p-1 z-50 space-y-0.5">
              {languagesList.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick(600, 0.02);
                    onSelectLanguage(item.id);
                    setShowLangMenu(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                    language === item.id ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{item.flag} {item.label}</span>
                  {language === item.id && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAIN VIEW */}
      {view === 'main' && (
        <div className="relative z-10 w-full max-w-lg p-6 flex flex-col items-center text-center space-y-6">
          {/* Logo & Lockup */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-sky-400 text-xs font-mono font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>GEOPOLITICAL STRATEGY SIMULATOR</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-200 to-sky-300 drop-shadow-lg font-serif">
              OPENBATTLE
            </h1>
            <div className="text-sm font-semibold tracking-widest text-slate-400 uppercase">
              {t.appName}
            </div>

            {/* Prominent Creator Attribution Badge */}
            <div className="pt-1">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-sky-950/80 to-indigo-950/80 border border-sky-400/30 text-[11px] text-sky-300 font-medium inline-block shadow-inner">
                {t.creatorAttribution}
              </span>
            </div>
          </div>

          {/* Menu Action Buttons */}
          <div className="w-full space-y-2.5 max-w-sm">
            <button
              onClick={() => {
                sound.playClick(800, 0.04);
                setView('scenario');
              }}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2.5 text-sm transition-all transform hover:scale-[1.02] border border-sky-400/40"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.startNewGame}</span>
            </button>

            {hasSavedGame && (
              <button
                onClick={() => {
                  sound.playClick(750, 0.04);
                  onContinueGame();
                }}
                className="w-full py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold rounded-2xl border border-sky-500/30 flex items-center justify-center gap-2 text-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>{t.continueGame}</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick(650, 0.03);
                onOpenSaves();
              }}
              className="w-full py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold rounded-2xl border border-slate-700/60 flex items-center justify-center gap-2 text-xs transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-sky-400" />
              <span>{t.loadSave}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick(700, 0.03);
                onOpenMultiplayer();
              }}
              className="w-full py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold rounded-2xl border border-slate-700/60 flex items-center justify-center gap-2 text-xs transition-colors"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>{t.multiplayerHub}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick(600, 0.03);
                setView('tutorial');
              }}
              className="w-full py-2 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium rounded-2xl border border-slate-800 flex items-center justify-center gap-2 text-xs transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.rulesManual}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick(600, 0.03);
                setView('credits');
              }}
              className="w-full py-2 text-slate-400 hover:text-white font-medium rounded-2xl text-[11px] transition-colors"
            >
              {t.credits}
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            OpenBattle Ultimate Edition v3.0 · Lead Developer: Mohammad Farbod Kateb
          </div>
        </div>
      )}

      {/* SCENARIO & CUSTOM COUNTRY FLOW */}
      {view === 'scenario' && (
        <div className="relative z-10 w-full max-w-4xl p-6 bg-[#0b1220]/95 border border-sky-500/30 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col max-h-[90vh] overflow-hidden text-xs">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <button
              onClick={() => setView('main')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isPersian ? 'بازگشت' : 'Back'}</span>
            </button>
            <h2 className="text-base font-bold text-sky-400">
              {isPersian ? 'گزینش سناریو و دکترین حاکمیت' : 'Campaign Mode & Sovereign Genesis'}
            </h2>
            <div className="w-16" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {/* 1. Pick Campaign Mode */}
            <div className="space-y-2">
              <label className="font-bold text-slate-200 text-sm">
                1. {isPersian ? 'انتخاب حالت بازی (نقشه کنونی ۲۰۲۶ یا ساخت کشور از صفر)' : 'Select Mode (Historical 2026 Expansion vs Build from Scratch)'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SCENARIOS.map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      sound.playClick(650, 0.03);
                      setSelectedScenarioId(sc.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedScenarioId === sc.id
                        ? 'bg-sky-500/10 border-sky-400 text-sky-300 shadow-md shadow-sky-500/10'
                        : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-bold text-white text-xs mb-1">
                      {isPersian ? sc.nameFa : sc.name}
                    </div>
                    <p className="text-[10px] leading-relaxed line-clamp-3">
                      {isPersian ? sc.descriptionFa : sc.description}
                    </p>
                    <div className="mt-2 text-[9px] font-mono text-sky-400">
                      {sc.mode === 'custom_genesis' ? '★ GENESIS' : 'HISTORICAL 2026'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Custom Nation Genesis Form IF custom mode selected */}
            {isCustomMode ? (
              <div className="p-4 bg-slate-900/90 border border-amber-500/40 rounded-2xl space-y-3">
                <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{isPersian ? 'طراحی و ساخت کشور از صفر (پیدایش حاکمیت)' : 'Custom Nation Genesis: Build from Zero'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">{isPersian ? 'نام انگلیسی کشور:' : 'Country Name (EN):'}</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">{isPersian ? 'نام فارسی کشور:' : 'Country Name (FA):'}</label>
                    <input
                      type="text"
                      value={customNameFa}
                      onChange={(e) => setCustomNameFa(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">{isPersian ? 'پرچم و نشان حاکمیت (اموجی):' : 'Flag / Sovereign Emblem (Emoji):'}</label>
                    <div className="flex gap-2">
                      {['🦁', '🦅', '👑', '⚔️', '🛡️', '⚡', '🐉', '🇮🇷', '🌐'].map(fl => (
                        <button
                          key={fl}
                          type="button"
                          onClick={() => setCustomFlag(fl)}
                          className={`text-xl p-1 rounded-lg border ${customFlag === fl ? 'bg-amber-500/20 border-amber-400' : 'bg-slate-800 border-slate-700'}`}
                        >
                          {fl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">{isPersian ? 'رنگ قلمرو بر روی نقشه:' : 'Territory Map Color:'}</label>
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-full h-8 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* 3. Base Sovereign Territory Selection */}
            <div className="space-y-2">
              <label className="font-bold text-slate-200 text-sm">
                {isCustomMode
                  ? (isPersian ? 'سرزمین مادری و قلمرو آغازین را برگزینید:' : 'Choose Starting Base Homeland Territory:')
                  : (isPersian ? 'کشور تحت فرماندهی خود را برگزینید:' : 'Choose Your Sovereign Nation:')}
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {[
                  '364', // Iran
                  '840', // USA
                  '156', // China
                  '643', // Russia
                  '792', // Turkey
                  '682', // Saudi Arabia
                  '356', // India
                  '276', // Germany
                  '826', // UK
                  '250', // France
                  '376', // Israel
                  '818', // Egypt
                ].map(cId => {
                  const country = INITIAL_COUNTRIES[cId];
                  if (!country) return null;
                  const isSelected = selectedCountryId === cId;
                  return (
                    <button
                      key={cId}
                      onClick={() => {
                        sound.playClick(750, 0.03);
                        setSelectedCountryId(cId);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                        isSelected
                          ? 'bg-sky-600/20 border-sky-400 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="text-2xl mb-1">{country.flagEmoji}</span>
                      <span className="font-bold text-xs truncate w-full">
                        {isPersian ? country.nameFa : country.name}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        ${country.gdp}B GDP
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300 text-xs">
                  {isPersian ? 'سطح دشواری:' : 'Difficulty:'}
                </span>
                {(['Casual', 'Strategist', 'Grand Master'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => {
                      sound.playClick(600, 0.02);
                      setDifficulty(diff);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                      difficulty === diff
                        ? 'bg-sky-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <button
                onClick={handleLaunch}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center gap-2 text-sm transition-transform active:scale-95"
              >
                <span>{isPersian ? 'آغاز رسمی کارزار' : 'Launch Campaign'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREDITS VIEW */}
      {view === 'credits' && (
        <div className="relative z-10 w-full max-w-md p-6 bg-[#0b1220]/95 border border-sky-500/30 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
            👑
          </div>
          <h2 className="text-lg font-bold text-sky-400 font-serif">
            {isPersian ? 'شناسنامه و سازندگان بازی' : 'Game Credits & Authorship'}
          </h2>

          <div className="p-4 bg-slate-900/90 border border-sky-500/40 rounded-2xl space-y-2">
            <div className="text-sm font-bold text-white">
              {isPersian ? 'طراح، معمار و توسعه‌دهنده ارشد:' : 'Creator & Chief Architect:'}
            </div>
            <div className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              محمد فربد کاتب (Mohammad Farbod Kateb)
            </div>
            <div className="text-[11px] text-slate-400">
              OpenBattle Ultimate Project
            </div>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            {isPersian
              ? 'طراحی و برنامه‌نویسی کامل موتور شبیه‌سازی ژئوپلیتیک، نقشه‌نگاری وکتور، سامانه دیپلماسی بین‌المللی و فرماندهی راهبردی جهان توسط محمد فربد کاتب.'
              : 'Complete game design, geopolitical simulation engine, vector cartography, international diplomacy matrix, and strategic command systems designed and built by Mohammad Farbod Kateb.'}
          </p>

          <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-800 pt-3">
            <div>{isPersian ? 'سازنده و کارگردان: محمد فربد کاتب' : 'Director & Lead Engineer: Mohammad Farbod Kateb'}</div>
            <div>{isPersian ? 'پشتیبانی کامل از ۷ زبان رسمی جهان' : 'Supported Languages: English, فارسی, العربية, Русский, 中文, Deutsch, Español'}</div>
            <div>{isPersian ? 'موتور نقشه‌نگاری: پایگاه برداری ۱۱۰ متری جهان' : 'Cartography Dataset: Natural Earth Sovereign TopoJSON'}</div>
          </div>

          <button
            onClick={() => setView('main')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
          >
            {isPersian ? 'بازگشت' : 'Back'}
          </button>
        </div>
      )}

      {/* TUTORIAL VIEW */}
      {view === 'tutorial' && (
        <div className="relative z-10 w-full max-w-2xl p-6 bg-[#0b1220]/95 border border-sky-500/30 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col max-h-[85vh] overflow-hidden text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h2 className="text-base font-bold text-sky-400">
              {t.rulesManual}
            </h2>
            <button
              onClick={() => setView('main')}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 leading-relaxed text-slate-300">
            <div className="p-3 bg-slate-900/80 rounded-xl space-y-1">
              <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-sky-400" />
                <span>1. {isPersian ? 'ناوبری نقشه و پرواز به کشورها' : 'World Cartography & Jump Cameras'}</span>
              </h4>
              <p>
                {isPersian
                  ? 'نقشه را با لمس یا کشیدن ماوس جابه‌جا کنید. با کلیک بر روی رخدادهای «رویدادنگاری زنده»، دوربین بلافاصله به موقعیت نبرد در کشور مقصد پرواز می‌کند.'
                  : 'Pan and zoom smoothly. Clicking any event in the Global Activity Feed automatically jumps and centers the camera on the target sovereign state.'}
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl space-y-1">
              <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-rose-400" />
                <span>2. {isPersian ? 'حملات موشکی، دریایی و فتح قلمرو' : 'Missile Salvos, Warships & Invasions'}</span>
              </h4>
              <p>
                {isPersian
                  ? 'علاوه بر تهاجم زمینی، می‌توانید موشک‌های بالستیک پرتاب کنید، با ناوگان دریایی بنادر را به توپ ببندید، یا دست به عملیات بمب‌گذاری مخفیانه بزنید.'
                  : 'Execute 5 specialized strike doctrines: Ballistic missile barrages, naval cruise bombardments, surgical airstrikes, covert sabotage, and combined ground invasions.'}
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl space-y-1">
              <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>3. {isPersian ? 'احداث سیلوی موشک، کارخانه و بنادر' : 'Strategic Silos, Ports & Munitions Plants'}</span>
              </h4>
              <p>
                {isPersian
                  ? 'در ستاد مهندسی دفاعی می‌توانید سیلوی موشک، پایگاه‌های دریایی، پدافندهای راداری و کارخانجات تسلیحات سنگین احداث کنید.'
                  : 'Construct missile launch silos, deepwater naval bases, radar air defense umbrellas, munitions plants, and nuclear research laboratories.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
