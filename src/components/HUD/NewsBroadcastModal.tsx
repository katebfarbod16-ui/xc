import React, { useState } from 'react';
import { NewsBroadcast, SupportedLanguage } from '../../types/game';
import { 
  Tv, 
  Volume2, 
  Radio, 
  X, 
  Globe, 
  ShieldAlert, 
  Share2, 
  ExternalLink,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { sound } from '../../simulation/soundEngine';

interface NewsBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  broadcast: NewsBroadcast | null;
  recentBroadcasts?: NewsBroadcast[];
  onSelectBroadcast?: (broadcast: NewsBroadcast) => void;
  language: SupportedLanguage;
}

const CHANNELS = [
  { id: 'IRINN', name: 'شبکه خبر IRINN', nameEn: 'IRINN Iran News', logo: '🇮🇷 IRINN', color: 'from-emerald-700 to-emerald-900', border: 'border-emerald-500' },
  { id: 'BBC', name: 'BBC World News', nameEn: 'BBC World News', logo: '🇬🇧 BBC', color: 'from-red-700 to-red-950', border: 'border-red-500' },
  { id: 'CNN', name: 'CNN Breaking Alert', nameEn: 'CNN Breaking Alert', logo: '🇺🇸 CNN', color: 'from-red-800 to-slate-900', border: 'border-red-600' },
  { id: 'ALJAZEERA', name: 'Al Jazeera (الجزيرة)', nameEn: 'Al Jazeera English', logo: '🇶🇦 AL JAZEERA', color: 'from-amber-700 to-amber-950', border: 'border-amber-500' },
  { id: 'CGTN', name: 'CGTN Live Wire', nameEn: 'CGTN Global', logo: '🇨🇳 CGTN', color: 'from-blue-700 to-indigo-950', border: 'border-blue-500' },
];

export const NewsBroadcastModal: React.FC<NewsBroadcastModalProps> = ({
  isOpen,
  onClose,
  broadcast,
  recentBroadcasts = [],
  onSelectBroadcast,
  language,
}) => {
  const [selectedChannel, setSelectedChannel] = useState('IRINN');

  if (!isOpen || !broadcast) return null;

  const isFa = language === 'fa' || language === 'ar';
  const activeChannel = CHANNELS.find(c => c.id === selectedChannel) || CHANNELS[0];

  const handlePlayChime = () => {
    sound.playNewsJingle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-4xl rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl overflow-hidden flex flex-col font-sans"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Top Channel Navigation Bar */}
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider px-2 py-1 rounded bg-rose-500/10 border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              <span>{isFa ? 'پخش زنده ماهواره‌ای' : 'LIVE SATELLITE FEED'}</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setSelectedChannel(ch.id);
                    sound.playClick();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedChannel === ch.id
                      ? 'bg-slate-100 text-slate-900 shadow'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <span>{ch.logo}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayChime}
              title={isFa ? 'پخش صدای آرم خبر' : 'Play News Jingle'}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TV Broadcast Video Monitor Frame */}
        <div className="relative bg-black h-80 sm:h-96 overflow-hidden flex flex-col justify-between p-6 border-b border-slate-800">
          {/* Subtle TV Scanline & Grid Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/90" />

          {/* Top Frame Telemetry */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white bg-red-600 px-2 py-0.5 rounded text-[10px] tracking-widest uppercase">
                {activeChannel.nameEn}
              </span>
              <span className="text-[11px] text-slate-400">
                REC • 1080p 60FPS • ENC: AES-256
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400">SATLINK-07 LOCKED</span>
              <span>{broadcast.timestamp}</span>
            </div>
          </div>

          {/* Center Graphic: Studio Anchor or Military Telemetry */}
          <div className="relative z-10 flex items-center justify-center my-auto">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-24 h-24 rounded-full bg-slate-800/80 border-2 border-slate-700 flex items-center justify-center shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/40 to-slate-800" />
                <Tv className="w-10 h-10 text-cyan-400 relative z-10" />
                <div className="absolute bottom-1 text-[9px] font-mono text-cyan-300 font-bold">
                  STUDIO 1
                </div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-1 rounded-full border border-slate-800 text-xs font-semibold text-slate-300">
                {isFa ? `مجری خبر: ${broadcast.anchorName}` : `News Anchor: ${broadcast.anchorName}`}
              </div>
            </div>
          </div>

          {/* Lower Third News Banner (TV Broadcast Style) */}
          <div className="relative z-10 space-y-2">
            {/* Breaking News Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-t-md shadow-lg">
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>{isFa ? 'خبر فوری و مهم' : 'BREAKING NEWS SPECIAL REPORT'}</span>
            </div>

            {/* Main Headline Strip */}
            <div className="bg-slate-900/95 border-l-4 border-red-500 p-4 rounded-r-xl shadow-2xl backdrop-blur-md">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                {isFa ? broadcast.headlineFa : broadcast.headline}
              </h2>

              {/* Subtitles / Closed Captions */}
              <div className="mt-2 text-xs sm:text-sm text-amber-200/90 font-medium leading-relaxed bg-black/40 p-2 rounded border border-amber-500/20">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wide mr-2 ml-2">
                  [CC / زیر نویس]:
                </span>
                <span>{isFa ? broadcast.subtitlesFa : broadcast.subtitles}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Crawling Ticker Marquee */}
        <div className="bg-red-700 text-white px-4 py-2 flex items-center text-xs font-bold overflow-hidden whitespace-nowrap">
          <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] mr-3 ml-3 uppercase font-mono tracking-wider">
            {isFa ? 'تیتر تحولات جهان' : 'GLOBAL WIRE'}
          </span>
          <div className="animate-marquee inline-block text-xs font-medium">
            {isFa 
              ? '• شورای امنیت سازمان ملل نشست اضطراری تشکیل داد • سامانه‌های دفاع موشکی در بالاترین سطح آماده‌باش قرار گرفتند • بازارهای انرژی و فلزات گرانبها با افزایش تقاضا روبرو شدند • توافقات اقتصادی جدید میان پایتخت‌ها در حال بررسی است •'
              : '• UN Security Council convenes emergency closed-door consultation • Strategic missile defense shields operating at DEFCON 2 • Global commodity exchanges report heightened volatility • Diplomatic delegations initiate ceasefire negotiations •'}
          </div>
        </div>

        {/* Recent Breaking News Archive */}
        {recentBroadcasts.length > 0 && (
          <div className="p-4 bg-slate-900/60 max-h-40 overflow-y-auto space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">
              {isFa ? 'سایر سرخط‌های خبری امروز:' : 'Recent Broadcast Archives:'}
            </span>
            <div className="space-y-1.5">
              {recentBroadcasts.slice(0, 4).map((b) => (
                <button
                  key={b.id}
                  onClick={() => onSelectBroadcast && onSelectBroadcast(b)}
                  className="w-full text-right p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-xs flex items-center justify-between transition text-slate-300"
                >
                  <span className="truncate font-medium">{isFa ? b.headlineFa : b.headline}</span>
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap mr-2 ml-2">
                    {b.timestamp}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
