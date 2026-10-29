import React, { useState } from 'react';
import { GameState, DiplomaticStatus } from '../../types/game';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  Handshake, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  Flame, 
  Filter 
} from 'lucide-react';

interface DiplomacyPanelProps {
  gameState: GameState;
  onClose: () => void;
  onSelectCountry: (countryId: string) => void;
  isPersian: boolean;
}

export const DiplomacyPanel: React.FC<DiplomacyPanelProps> = ({
  gameState,
  onClose,
  onSelectCountry,
  isPersian,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<DiplomaticStatus | 'all'>('all');

  const playerRelations = gameState.diplomacy[gameState.playerCountryId] || {};
  const otherCountries = Object.values(gameState.countries).filter(
    c => c.id !== gameState.playerCountryId
  );

  const filteredCountries = otherCountries.filter(c => {
    const rel = playerRelations[c.id];
    if (filter !== 'all' && rel?.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchEn = c.name.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q);
      const matchFa = c.nameFa.includes(search);
      return matchEn || matchFa;
    }
    return true;
  });

  return (
    <aside className="w-80 md:w-96 h-full bg-[#0b1220]/95 border-l border-sky-500/20 flex flex-col backdrop-blur-xl shadow-2xl z-20 overflow-hidden text-slate-200 text-xs font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl">
            <Handshake className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">
              {isPersian ? 'دیوان دیپلماسی و روابط بین‌الملل' : 'Diplomatic Ledger & Pacts'}
            </h2>
            <div className="text-[10px] text-slate-400">
              {isPersian ? 'پیمان‌ها، ائتلاف‌ها و موازنه روابط خارجی' : 'Foreign Envoys, Coalitions & Treaties'}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={isPersian ? 'جستجوی کشور یا پایتخت...' : 'Search nations or capitals...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
          {[
            { id: 'all', label: 'All', labelFa: 'همه' },
            { id: 'allied', label: 'Allies', labelFa: 'متحدین' },
            { id: 'non_aggression', label: 'Pacts', labelFa: 'پیمان‌ها' },
            { id: 'neutral', label: 'Neutral', labelFa: 'بی‌طرف' },
            { id: 'rival', label: 'Rivals', labelFa: 'رقبا' },
            { id: 'at_war', label: 'At War', labelFa: 'در جنگ' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => {
                sound.playClick(600, 0.02);
                setFilter(btn.id as any);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === btn.id
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isPersian ? btn.labelFa : btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Country List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredCountries.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            {isPersian ? 'کشوری مطابق با فیلتر یافت نشد.' : 'No sovereign nations found matching criteria.'}
          </div>
        ) : (
          filteredCountries.map(c => {
            const rel = playerRelations[c.id];
            const opinion = rel?.opinion || 0;
            const status = rel?.status || 'neutral';

            return (
              <div
                key={c.id}
                onClick={() => {
                  sound.playClick(700, 0.03);
                  onSelectCountry(c.id);
                }}
                className="p-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 hover:border-sky-500/40 rounded-xl transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.flagEmoji}</span>
                    <div>
                      <div className="font-bold text-slate-200">
                        {isPersian ? c.nameFa : c.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.capital} · {c.government}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    status === 'at_war' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    status === 'allied' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    status === 'non_aggression' ? 'bg-cyan-500/20 text-cyan-400' :
                    status === 'rival' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                {/* Opinion bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">{isPersian ? 'روابط دوجانبه:' : 'Relations:'}</span>
                    <span className={`font-bold tabular-nums ${opinion >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {opinion > 0 ? `+${opinion}` : opinion}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${opinion >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.max(5, (opinion + 100) / 2))}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>{isPersian ? `تولید ناخالص: $${c.gdp}B` : `GDP: $${c.gdp}B`}</span>
                  <span>{isPersian ? `ارتش: ${c.military.infantry}k` : `Troops: ${c.military.infantry}k`}</span>
                  {rel?.hasTradeAgreement && (
                    <span className="text-amber-400 font-semibold">{isPersian ? 'قرارداد تجاری ✓' : 'Trade Active ✓'}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
