import React, { useState } from 'react';
import { GameEvent } from '../../types/game';
import { 
  X, 
  Bell, 
  Swords, 
  Handshake, 
  TrendingUp, 
  FlaskConical, 
  Flame, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface NotificationsModalProps {
  events: GameEvent[];
  onClose: () => void;
  isPersian: boolean;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  events,
  onClose,
  isPersian,
}) => {
  const [filter, setFilter] = useState<'all' | 'military' | 'diplomatic' | 'economic' | 'scientific'>('all');

  const filtered = events.filter(e => filter === 'all' || e.type === filter);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#0b1220] border border-sky-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-200 text-xs font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl">
              <Bell className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isPersian ? 'مرکز اعلانات و وقایع‌نگاری راهبردی' : 'Intelligence Dispatch & Event Log'}
              </h2>
              <div className="text-[11px] text-slate-400">
                {isPersian ? 'تاریخچه عملیات‌های نظامی، توافقات و رویدادهای بین‌المللی' : 'Chronicle of Geopolitical Encounters, Battles & Treaties'}
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

        {/* Filter Bar */}
        <div className="p-2.5 border-b border-slate-800 bg-slate-900/60 flex items-center gap-1 overflow-x-auto text-[10px]">
          {[
            { id: 'all', label: 'All Events', labelFa: 'همه رویدادها' },
            { id: 'military', label: 'Military', labelFa: 'نظامی' },
            { id: 'diplomatic', label: 'Diplomacy', labelFa: 'دیپلماسی' },
            { id: 'economic', label: 'Economy', labelFa: 'اقتصادی' },
            { id: 'scientific', label: 'R&D', labelFa: 'فناوری' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                filter === f.id
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isPersian ? f.labelFa : f.label}
            </button>
          ))}
        </div>

        {/* List of events */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              {isPersian ? 'رویدادی ثبت نشده است.' : 'No recorded events in this category.'}
            </div>
          ) : (
            filtered.map(evt => {
              const Icon = 
                evt.type === 'military' ? Swords :
                evt.type === 'diplomatic' ? Handshake :
                evt.type === 'economic' ? TrendingUp :
                FlaskConical;

              const borderColor = 
                evt.severity === 'alert' ? 'border-rose-500/50 bg-rose-950/20' :
                evt.severity === 'triumph' ? 'border-emerald-500/50 bg-emerald-950/20' :
                evt.severity === 'warning' ? 'border-amber-500/50 bg-amber-950/20' :
                'border-slate-700/60 bg-slate-900/80';

              return (
                <div
                  key={evt.id}
                  className={`p-3.5 rounded-xl border ${borderColor} space-y-1.5 transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isPersian ? evt.titleFa : evt.title}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{evt.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isPersian ? evt.descriptionFa : evt.description}
                  </p>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
