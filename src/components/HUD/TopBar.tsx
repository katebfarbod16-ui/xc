import React, { useState } from 'react';
import { GameState, GameSpeed, SupportedLanguage } from '../../types/game';
import { calculateCountryFinance } from '../../simulation/gameEngine';
import { TRANSLATIONS } from '../../data/translations';
import { sound } from '../../simulation/soundEngine';
import { 
  Play, 
  Pause, 
  FastForward, 
  Volume2, 
  VolumeX, 
  Bell, 
  Sparkles, 
  Coins, 
  Users, 
  Shield, 
  Flame, 
  Calendar,
  Languages,
  Globe,
  Radio,
  Sun,
  Moon,
  Tv,
  Eye
} from 'lucide-react';

interface TopBarProps {
  gameState: GameState;
  onSetSpeed: (speed: GameSpeed) => void;
  onTogglePause: () => void;
  onOpenCommanderAI: () => void;
  onOpenGlobalFeed: () => void;
  onOpenUN: () => void;
  onOpenProfile: () => void;
  onOpenNewsBroadcast?: () => void;
  onOpenSpyNetwork?: () => void;
  onIssueWarBonds?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  language: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  unreadNotificationsCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  gameState,
  onSetSpeed,
  onTogglePause,
  onOpenCommanderAI,
  onOpenGlobalFeed,
  onOpenUN,
  onOpenProfile,
  onOpenNewsBroadcast,
  onOpenSpyNetwork,
  onIssueWarBonds,
  isMuted,
  onToggleMute,
  language,
  onSelectLanguage,
  unreadNotificationsCount,
}) => {
  const isPersian = language === 'fa';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const playerCountry = gameState.countries[gameState.playerCountryId];
  const finance = playerCountry ? calculateCountryFinance(playerCountry, gameState) : null;

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

  const isNight = gameState.timeOfDayHours < 6 || gameState.timeOfDayHours > 18;

  return (
    <header className="h-14 w-full bg-[#0b1220]/95 border-b border-sky-500/20 px-2 sm:px-3 flex items-center justify-between text-xs font-sans text-slate-200 z-30 select-none backdrop-blur-md">
      {/* Left: Nation Identity & Core Sovereignty */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-2 py-1 bg-slate-900/80 hover:bg-slate-800 border border-sky-500/30 rounded-xl transition-all group shrink-0"
        >
          <span className="text-xl drop-shadow-sm">{playerCountry?.flagEmoji || '🌐'}</span>
          <div className="text-left hidden sm:block">
            <div className="font-bold text-sky-400 group-hover:text-sky-300 transition-colors">
              {isPersian ? playerCountry?.nameFa : playerCountry?.name}
            </div>
            <div className="text-[9px] text-slate-400">
              {isPersian ? 'فرماندهی عالی' : 'Supreme Command'}
            </div>
          </div>
        </button>

        {/* Treasury Readout */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/60 border border-slate-700/50 rounded-xl">
          <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div>
            <div className="text-[9px] text-slate-400 hidden md:block">{t.treasury}</div>
            <div className="font-bold text-amber-400 tabular-nums flex items-center gap-1">
              <span>${playerCountry?.treasury.toLocaleString()}M</span>
              {finance && (
                <span className={`text-[9px] font-semibold hidden lg:inline ${finance.dailyNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {finance.dailyNet >= 0 ? `+$${finance.dailyNet}/d` : `-$${Math.abs(finance.dailyNet)}/d`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Standing Military Power */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/60 border border-slate-700/50 rounded-xl">
          <Shield className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <div>
            <div className="text-[9px] text-slate-400">{t.standingMilitary}</div>
            <div className="font-bold text-rose-400 tabular-nums">
              {playerCountry?.military.infantry}k · {playerCountry?.military.armor} tanks
            </div>
          </div>
        </div>

        {/* Day / Night Cycle Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/60 border border-slate-700/50 rounded-xl">
          {isNight ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          <div className="text-[10px] font-mono text-slate-300">
            {String(gameState.timeOfDayHours).padStart(2, '0')}:00 {isNight ? 'Night' : 'Day'}
          </div>
        </div>
      </div>

      {/* Center/Right: Campaign Clock, Live Feed, UN, and Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Global Activity Feed Live Trigger */}
        <button
          onClick={() => {
            sound.playClick(700, 0.03);
            onOpenGlobalFeed();
          }}
          className="relative px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors"
          title="Global Live Activity Feed"
        >
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="hidden sm:inline">{t.globalActivityFeed}</span>
          {unreadNotificationsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        {/* UN General Assembly Trigger */}
        <button
          onClick={() => {
            sound.playClick(600, 0.03);
            onOpenUN();
          }}
          className="px-2.5 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors"
          title="United Nations"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">UN</span>
        </button>

        {/* TV News Broadcast Studio Trigger */}
        {onOpenNewsBroadcast && (
          <button
            onClick={() => {
              sound.playNewsJingle();
              onOpenNewsBroadcast();
            }}
            className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors shrink-0"
            title={isPersian ? 'استودیو پخش زنده تلویزیونی' : 'Live TV News Studio'}
          >
            <Tv className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="hidden lg:inline">{isPersian ? 'شبکه خبر' : 'TV News'}</span>
          </button>
        )}

        {/* Spy Network Intelligence Hub Trigger */}
        {onOpenSpyNetwork && (
          <button
            onClick={() => {
              sound.playSpyAction();
              onOpenSpyNetwork();
            }}
            className="px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors shrink-0"
            title={isPersian ? 'شبکه اطلاعات و عملیات ویژه' : 'Espionage & Intel Network'}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">{isPersian ? 'جاسوسی' : 'Spy Network'}</span>
          </button>
        )}

        {/* Emergency War Bonds / Liquidity Trigger */}
        {onIssueWarBonds && (
          <button
            onClick={() => {
              onIssueWarBonds();
            }}
            className="px-2 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 font-bold rounded-xl flex items-center gap-1 text-[11px] transition-colors shrink-0"
            title={isPersian ? 'انتشار اوراق قرضه اضطراری (+ ۵,۰۰۰M$)' : 'Issue Emergency War Bonds (+$5,000M)'}
          >
            <Coins className="w-3 h-3 text-amber-400" />
            <span className="hidden xl:inline">{isPersian ? '+۵,۰۰۰M$ اوراق' : '+Bonds'}</span>
          </button>
        )}

        {/* Campaign Date Display */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 border border-sky-500/30 rounded-xl font-mono text-sky-300 font-bold text-xs">
          <Calendar className="w-3 h-3 text-sky-400" />
          <span className="tabular-nums">{gameState.currentDate}</span>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700/60 rounded-xl p-0.5">
          <button
            onClick={() => {
              sound.playClick(700, 0.03);
              onTogglePause();
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              gameState.isPaused 
                ? 'bg-amber-500/20 text-amber-300 font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Pause / Resume (Space)"
          >
            {gameState.isPaused ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            onClick={() => onSetSpeed(1)}
            className={`px-1.5 sm:px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${
              gameState.speed === 1 && !gameState.isPaused ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            1x
          </button>
          <button
            onClick={() => onSetSpeed(2)}
            className={`px-1.5 sm:px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${
              gameState.speed === 2 && !gameState.isPaused ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            2x
          </button>
          <button
            onClick={() => onSetSpeed(3)}
            className={`px-1.5 sm:px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${
              gameState.speed === 3 && !gameState.isPaused ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            3x
          </button>
        </div>

        {/* COMMANDER AI Button */}
        <button
          onClick={() => {
            sound.playClick(900, 0.04);
            onOpenCommanderAI();
          }}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 border border-sky-400/40 text-xs shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span className="hidden lg:inline">{t.commanderAI}</span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-300 transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
        </button>

        {/* Multi-Language Dropdown (7 Languages) */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="px-2 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-200 font-bold transition-colors flex items-center gap-1 text-xs"
            title="Switch Language (7 Languages)"
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
    </header>
  );
};
