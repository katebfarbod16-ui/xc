import React, { useState } from 'react';
import { GameState, Alliance } from '../../types/game';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  Layers, 
  Plus, 
  Shield, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';

interface AlliancesModalProps {
  gameState: GameState;
  onClose: () => void;
  onCreateAlliance: (alliance: Alliance) => void;
  isPersian: boolean;
}

export const AlliancesModal: React.FC<AlliancesModalProps> = ({
  gameState,
  onClose,
  onCreateAlliance,
  isPersian,
}) => {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [color, setColor] = useState('#0284c7');

  const playerCountry = gameState.countries[gameState.playerCountryId];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tag.trim()) return;

    sound.playTriumph();
    const newAlliance: Alliance = {
      id: tag.toUpperCase().trim(),
      name: name.trim(),
      nameFa: name.trim(),
      tag: tag.toUpperCase().trim(),
      leaderId: gameState.playerCountryId,
      members: [gameState.playerCountryId],
      color,
      mutualDefense: true,
      sharedResearch: true,
      createdDate: gameState.currentDate,
    };

    onCreateAlliance(newAlliance);
    setShowCreate(false);
    setName('');
    setTag('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0b1220] border border-sky-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-200 text-xs font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl">
              <Layers className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isPersian ? 'بلوک‌های قدرت و سازمان‌های بین‌المللی' : 'Global Power Blocs & Alliances'}
              </h2>
              <div className="text-[11px] text-slate-400">
                {isPersian ? 'پیمان‌های دفاع جمعی، اشتراک‌گذاری فناوری و ائتلاف‌های راهبردی' : 'Collective Defense Treaties & Sovereign Coalition Blocs'}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 text-sm">
              {isPersian ? 'ائتلاف‌های فعال بین‌المللی' : 'Active International Blocs'}
            </span>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-sky-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>{isPersian ? 'تأسیس ائتلاف جدید' : 'Found New Alliance'}</span>
            </button>
          </div>

          {/* Create Form */}
          {showCreate && (
            <form onSubmit={handleCreate} className="p-4 bg-slate-900/90 border border-sky-500/40 rounded-xl space-y-3">
              <div className="font-bold text-sky-400 text-sm">{isPersian ? 'اساسنامه تأسیس ائتلاف' : 'Draft Alliance Charter'}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">{isPersian ? 'نام ائتلاف:' : 'Alliance Name:'}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eurasian Defense Pact"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">{isPersian ? 'نشان مخفف (تگ):' : 'Alliance Tag:'}</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="e.g. EDP"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">{isPersian ? 'رنگ نقشه:' : 'Map Color:'}</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-8 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  {isPersian ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                >
                  {isPersian ? 'تصویب و تأسیس' : 'Ratify Charter'}
                </button>
              </div>
            </form>
          )}

          {/* Alliances Cards */}
          <div className="space-y-3">
            {Object.values(gameState.alliances).map(all => {
              const leader = gameState.countries[all.leaderId];
              const isPlayerMember = playerCountry?.allianceId === all.id;

              // Aggregate stats
              let totalGDP = 0;
              let totalTroops = 0;
              for (const mId of all.members) {
                const c = gameState.countries[mId];
                if (c) {
                  totalGDP += c.gdp;
                  totalTroops += c.military.infantry;
                }
              }

              return (
                <div
                  key={all.id}
                  className="p-4 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-3"
                  style={{ borderLeftWidth: 4, borderLeftColor: all.color }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                        <span>{isPersian ? all.nameFa : all.name}</span>
                        <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-slate-800 text-sky-300 border border-slate-700">
                          {all.tag}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Leader State: <span className="text-amber-300 font-semibold">{leader?.flagEmoji} {leader?.name}</span> · Created: {all.createdDate}
                      </div>
                    </div>

                    {isPlayerMember && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        {isPersian ? 'عضو هستید' : 'MEMBER'}
                      </span>
                    )}
                  </div>

                  {/* Aggregate power readouts */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] p-2 bg-slate-950/40 rounded-lg">
                    <div>
                      <span className="text-slate-400">{isPersian ? 'مجموع تولید ناخالص:' : 'Combined GDP:'} </span>
                      <span className="font-bold text-emerald-400 tabular-nums">${totalGDP.toLocaleString()}B</span>
                    </div>
                    <div>
                      <span className="text-slate-400">{isPersian ? 'مجموع ارتش فعال:' : 'Combined Troops:'} </span>
                      <span className="font-bold text-rose-400 tabular-nums">{totalTroops.toLocaleString()}k</span>
                    </div>
                    <div>
                      <span className="text-slate-400">{isPersian ? 'تعداد کشورهای عضو:' : 'Member States:'} </span>
                      <span className="font-bold text-sky-400 tabular-nums">{all.members.length} nations</span>
                    </div>
                  </div>

                  {/* Member country flags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-400">{isPersian ? 'اعضا:' : 'Roster:'}</span>
                    {all.members.map(mId => {
                      const c = gameState.countries[mId];
                      return (
                        <span
                          key={mId}
                          className="px-2 py-0.5 bg-slate-800 rounded-lg text-[10px] flex items-center gap-1"
                        >
                          <span>{c?.flagEmoji || '🌐'}</span>
                          <span>{c?.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
