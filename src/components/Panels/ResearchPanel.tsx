import React from 'react';
import { GameState } from '../../types/game';
import { TECHNOLOGIES } from '../../data/technologies';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Swords, 
  Coins, 
  Building, 
  Globe 
} from 'lucide-react';

interface ResearchPanelProps {
  gameState: GameState;
  onClose: () => void;
  onStartResearch: (techId: string) => void;
  isPersian: boolean;
}

export const ResearchPanel: React.FC<ResearchPanelProps> = ({
  gameState,
  onClose,
  onStartResearch,
  isPersian,
}) => {
  const playerCountry = gameState.countries[gameState.playerCountryId];
  if (!playerCountry) return null;

  const unlocked = gameState.unlockedTechs[playerCountry.id] || [];
  const activeResearch = gameState.activeResearch[playerCountry.id];

  const categories = [
    { id: 'military', label: 'Military Doctrine', labelFa: 'دکترین نظامی', icon: Swords },
    { id: 'economy', label: 'Economy & Industry', labelFa: 'اقتصاد و صنعت', icon: Coins },
    { id: 'infrastructure', label: 'Infrastructure', labelFa: 'زیرساخت راهبردی', icon: Building },
    { id: 'intel', label: 'Intel & Geopolitics', labelFa: 'اطلاعات و ژئوپلیتیک', icon: Globe },
  ];

  return (
    <aside className="w-80 md:w-96 h-full bg-[#0b1220]/95 border-l border-sky-500/20 flex flex-col backdrop-blur-xl shadow-2xl z-20 overflow-hidden text-slate-200 text-xs font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <FlaskConical className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">
              {isPersian ? 'مرکز تحقیقات راهبردی ملی' : 'National R&D Directorate'}
            </h2>
            <div className="text-[10px] text-slate-400">
              {isPersian ? 'توسعه فناوری‌های پیشرفته و دکترین‌های مدرن' : 'Advanced Technologies & Sovereign Upgrades'}
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Active Research Status Card */}
        {activeResearch ? (
          <div className="p-3 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 animate-spin text-purple-400" />
                {isPersian ? 'تحقیقات فعال در جریان' : 'Active Research Project'}
              </span>
              <span className="font-mono text-[10px] text-purple-200">
                {activeResearch.progressDays} / {activeResearch.totalDays} days
              </span>
            </div>
            
            <div className="font-bold text-white text-sm">
              {(() => {
                const t = TECHNOLOGIES.find(x => x.id === activeResearch.techId);
                return isPersian ? t?.nameFa : t?.name;
              })()}
            </div>

            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (activeResearch.progressDays / activeResearch.totalDays) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-center text-slate-400">
            {isPersian ? 'در حال حاضر هیچ پروژه‌ای در صف تحقیقات قرار ندارد.' : 'No active research project currently underway. Select a technology below.'}
          </div>
        )}

        {/* Technology Branches */}
        {categories.map(cat => {
          const Icon = cat.icon;
          const techList = TECHNOLOGIES.filter(t => t.category === cat.id);

          return (
            <div key={cat.id} className="space-y-2">
              <div className="font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-1">
                <Icon className="w-3.5 h-3.5 text-sky-400" />
                <span>{isPersian ? cat.labelFa : cat.label}</span>
              </div>

              <div className="space-y-2">
                {techList.map(tech => {
                  const isUnlocked = unlocked.includes(tech.id);
                  const isCurrent = activeResearch?.techId === tech.id;
                  const canAfford = playerCountry.treasury >= tech.cost;
                  const prereqsMet = tech.prerequisites.every(p => unlocked.includes(p));
                  const canResearch = !isUnlocked && !isCurrent && prereqsMet && canAfford && !activeResearch;

                  return (
                    <div
                      key={tech.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isUnlocked
                          ? 'bg-slate-900/40 border-emerald-500/30 text-slate-300'
                          : isCurrent
                          ? 'bg-purple-950/30 border-purple-500/50 text-purple-200'
                          : prereqsMet
                          ? 'bg-slate-900/80 border-slate-700/60 hover:border-sky-500/40'
                          : 'bg-slate-950/40 border-slate-800/40 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-100 flex items-center gap-1.5">
                          {isUnlocked ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : !prereqsMet ? (
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <FlaskConical className="w-3.5 h-3.5 text-sky-400" />
                          )}
                          <span>{isPersian ? tech.nameFa : tech.name}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Tier {tech.tier}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
                        {isPersian ? tech.descriptionFa : tech.description}
                      </p>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
                        <span className="text-slate-400">
                          {isPersian ? `هزینه: $${tech.cost}M · ${tech.durationDays} روز` : `Cost: $${tech.cost}M · ${tech.durationDays}d`}
                        </span>

                        {isUnlocked ? (
                          <span className="text-emerald-400 font-bold">{isPersian ? 'تکمیل شده ✓' : 'Researched ✓'}</span>
                        ) : isCurrent ? (
                          <span className="text-purple-300 font-bold">{isPersian ? 'در دست تحقیق...' : 'In Progress...'}</span>
                        ) : (
                          <button
                            disabled={!canResearch}
                            onClick={() => onStartResearch(tech.id)}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-30 text-white font-bold rounded-lg transition-colors"
                          >
                            {isPersian ? 'شروع پژوهش' : 'Research'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      </div>
    </aside>
  );
};
