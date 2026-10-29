import React, { useState } from 'react';
import { GameEvent, GameState, SupportedLanguage } from '../../types/game';
import { TRANSLATIONS } from '../../data/translations';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  Radio, 
  Swords, 
  Handshake, 
  Globe, 
  Flame, 
  Compass, 
  Bell, 
  ShieldAlert, 
  ArrowUpRight,
  SlidersHorizontal
} from 'lucide-react';

interface GlobalActivityFeedProps {
  events: GameEvent[];
  gameState: GameState;
  onClose: () => void;
  onJumpToCountry: (countryId: string) => void;
  language: SupportedLanguage;
}

export const GlobalActivityFeed: React.FC<GlobalActivityFeedProps> = ({
  events,
  gameState,
  onClose,
  onJumpToCountry,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRTL = language === 'fa' || language === 'ar';

  const [filter, setFilter] = useState<'all' | 'military' | 'diplomatic' | 'un' | 'covert'>('all');

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'military') return e.type === 'military';
    if (filter === 'diplomatic') return e.type === 'diplomatic';
    if (filter === 'un') return e.type === 'un';
    if (filter === 'covert') return e.type === 'covert';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-2xl bg-[#0b1220] border border-sky-500/30 rounded-2xl shadow-2xl flex flex-col h-[85vh] max-h-[720px] overflow-hidden text-slate-200 text-xs font-sans"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl relative">
              <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{t.globalActivityFeed}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase tracking-wider">
                  LIVE INTERCEPT
                </span>
              </h2>
              <div className="text-[11px] text-slate-400">
                {language === 'fa' ? 'ردیابی ماهواره‌ای عملیات‌های نظامی، پرتاب موشک و دیپلماسی جهانی' : 'Satellite Telemetry of AI Wars, Missile Salvos & Diplomatic Treaties'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Breaking News Ticker */}
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-hidden text-[11px]">
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {t.breakingNews}
          </span>
          <div className="text-slate-300 truncate">
            {events[0] ? (language === 'fa' ? events[0].titleFa : events[0].title) : 'All sovereign sectors operating under standard maritime rules.'}
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="p-2.5 border-b border-slate-800 bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {[
            { id: 'all', label: t.allEvents, icon: Bell },
            { id: 'military', label: language === 'fa' ? 'نظامی و حملات' : 'Military & Strikes', icon: Swords },
            { id: 'diplomatic', label: language === 'fa' ? 'دیپلماسی و صلح' : 'Diplomacy & Treaties', icon: Handshake },
            { id: 'un', label: language === 'fa' ? 'سازمان ملل' : 'UN Resolutions', icon: Globe },
            { id: 'covert', label: language === 'fa' ? 'خرابکاری و سری' : 'Covert Ops', icon: ShieldAlert },
          ].map(btn => {
            const Icon = btn.icon;
            const isActive = filter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => {
                  sound.playClick(600, 0.02);
                  setFilter(btn.id as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Event Feed List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              {language === 'fa' ? 'هیچ رخدادی در این دسته‌بندی یافت نشد.' : 'No tactical updates logged under this category.'}
            </div>
          ) : (
            filteredEvents.map(evt => {
              const primaryCountry = evt.primaryCountryId ? gameState.countries[evt.primaryCountryId] : null;
              const targetCountry = evt.targetCountryId ? gameState.countries[evt.targetCountryId] : null;

              const isMilitary = evt.type === 'military';
              const isUN = evt.type === 'un';
              const isDiplomatic = evt.type === 'diplomatic';

              const cardBorder = 
                evt.severity === 'alert' ? 'border-rose-500/40 bg-rose-950/20 hover:border-rose-400' :
                evt.severity === 'triumph' ? 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-400' :
                'border-slate-700/60 bg-slate-900/80 hover:border-sky-500/50';

              return (
                <div
                  key={evt.id}
                  className={`p-3.5 rounded-2xl border ${cardBorder} shadow-lg transition-all space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {primaryCountry && (
                        <span className="text-2xl drop-shadow">{primaryCountry.flagEmoji}</span>
                      )}
                      {targetCountry && (
                        <>
                          <span className="text-slate-500">⚔️</span>
                          <span className="text-2xl drop-shadow">{targetCountry.flagEmoji}</span>
                        </>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                          {isMilitary && <Swords className="w-3.5 h-3.5 text-rose-400" />}
                          {isDiplomatic && <Handshake className="w-3.5 h-3.5 text-sky-400" />}
                          {isUN && <Globe className="w-3.5 h-3.5 text-indigo-400" />}
                          <span>{language === 'fa' ? evt.titleFa : evt.title}</span>
                        </h4>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {evt.date}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      evt.severity === 'alert' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      evt.severity === 'triumph' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {evt.type}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {language === 'fa' ? evt.descriptionFa : evt.description}
                  </p>

                  {/* Jump To Location Button */}
                  {evt.primaryCountryId && (
                    <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                      <button
                        onClick={() => {
                          sound.playClick(750, 0.03);
                          onJumpToCountry(evt.primaryCountryId!);
                          onClose();
                        }}
                        className="px-3 py-1 bg-sky-600/30 hover:bg-sky-600 border border-sky-400/40 text-sky-200 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Compass className="w-3 h-3 text-sky-300" />
                        <span>{t.jumpToLocation} ({primaryCountry?.name || evt.primaryCountryId})</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
