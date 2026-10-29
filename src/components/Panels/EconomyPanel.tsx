import React from 'react';
import { GameState } from '../../types/game';
import { calculateCountryFinance } from '../../simulation/gameEngine';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  Coins, 
  TrendingUp, 
  Sliders, 
  Building, 
  Gem, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

interface EconomyPanelProps {
  gameState: GameState;
  onClose: () => void;
  onSetTaxRate: (rate: number) => void;
  onBuildInfrastructure: () => void;
  isPersian: boolean;
}

export const EconomyPanel: React.FC<EconomyPanelProps> = ({
  gameState,
  onClose,
  onSetTaxRate,
  onBuildInfrastructure,
  isPersian,
}) => {
  const playerCountry = gameState.countries[gameState.playerCountryId];
  if (!playerCountry) return null;

  const finance = calculateCountryFinance(playerCountry, gameState);
  const infraCost = playerCountry.infrastructureLevel * 4500;
  const canAffordInfra = playerCountry.treasury >= infraCost && playerCountry.infrastructureLevel < 5;

  const activeInfraBuild = gameState.constructionQueue.find(
    c => c.countryId === playerCountry.id && c.type === 'infrastructure'
  );

  return (
    <aside className="w-80 md:w-96 h-full bg-[#0b1220]/95 border-l border-sky-500/20 flex flex-col backdrop-blur-xl shadow-2xl z-20 overflow-hidden text-slate-200 text-xs font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">
              {isPersian ? 'وزارت اقتصاد و خزانه‌داری ملی' : 'Ministry of Finance & Economy'}
            </h2>
            <div className="text-[10px] text-slate-400">
              {isPersian ? 'مدیریت نرخ مالیات، تجارت و بودجه ملی' : 'Fiscal Policy & Infrastructure Budget'}
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
        
        {/* Treasury Reserve & Net Balance Card */}
        <div className="p-3.5 bg-gradient-to-br from-slate-900/90 to-slate-950 border border-amber-500/30 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>{isPersian ? 'ذخایر ارزی در دسترس' : 'Liquid State Reserves'}</span>
            <span className="text-amber-400 font-semibold">{playerCountry.flagEmoji} {playerCountry.name}</span>
          </div>
          <div className="text-2xl font-bold text-amber-400 tabular-nums">
            ${playerCountry.treasury.toLocaleString()} <span className="text-xs font-normal text-slate-400">Million USD</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{isPersian ? 'تراز مالی روزانه:' : 'Daily Net Cashflow:'}</span>
            <span className={`font-bold tabular-nums flex items-center gap-1 ${
              finance.dailyNet >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              <ArrowUpRight className={`w-3.5 h-3.5 ${finance.dailyNet < 0 ? 'rotate-90' : ''}`} />
              {finance.dailyNet >= 0 ? `+$${finance.dailyNet.toLocaleString()}/day` : `-$${Math.abs(finance.dailyNet).toLocaleString()}/day`}
            </span>
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{isPersian ? 'تفکیک درآمدها و مصارف' : 'Budget Breakdown'}</span>
            <span className="text-[10px] text-slate-400">{isPersian ? 'مبنا: روزانه' : 'Basis: Daily'}</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">{isPersian ? 'درآمد مالیاتی:' : 'Tax Revenues:'}</span>
              <span className="font-semibold text-emerald-400 tabular-nums">+${finance.dailyTax}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{isPersian ? 'قراردادهای تجاری:' : 'Trade Tariffs:'}</span>
              <span className="font-semibold text-emerald-400 tabular-nums">+${finance.dailyTradeIncome}M</span>
            </div>
            <div className="flex justify-between border-t border-slate-800/80 pt-1">
              <span className="text-slate-400">{isPersian ? 'هزینه نگهداری ارتش:' : 'Military Upkeep:'}</span>
              <span className="font-semibold text-rose-400 tabular-nums">-${finance.dailyMilitaryUpkeep}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{isPersian ? 'پایش زیرساخت‌ها:' : 'Infrastructure Maint:'}</span>
              <span className="font-semibold text-rose-400 tabular-nums">-${finance.dailyInfraUpkeep}M</span>
            </div>
          </div>
        </div>

        {/* Tax Rate Policy Slider */}
        <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              {isPersian ? 'نرخ مالیات عمومی' : 'National Tax Policy'}
            </span>
            <span className="text-xs font-bold text-sky-400 tabular-nums">
              {(playerCountry.taxRate * 100).toFixed(0)}%
            </span>
          </div>

          <input
            type="range"
            min="15"
            max="45"
            value={Math.round(playerCountry.taxRate * 100)}
            onChange={(e) => {
              const val = Number(e.target.value) / 100;
              sound.playClick(600, 0.02);
              onSetTaxRate(val);
            }}
            className="w-full accent-sky-400 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>{isPersian ? 'حداقل (۱۵٪ - رشد ثبات)' : 'Low 15% (Stability +)'}</span>
            <span>{isPersian ? 'جنگی (۴۵٪ - فرسودگی)' : 'War 45% (Unrest)'}</span>
          </div>
        </div>

        {/* National Infrastructure Project */}
        <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              {isPersian ? 'سطح زیرساخت‌های صنعتی' : 'National Infrastructure'}
            </span>
            <span className="font-bold text-indigo-300">
              Level {playerCountry.infrastructureLevel} / 5
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isPersian
              ? 'توسعه شبکه‌های حمل‌ونقل ریلی، بنادر و خطوط انتقال انرژی درآمد ملی و سرعت جابه‌جایی یگان‌ها را افزایش می‌دهد.'
              : 'Upgrading highways, energy grids, and deepwater container terminals provides compounding national GDP and logistics.'}
          </p>

          {activeInfraBuild ? (
            <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/40 rounded-xl flex items-center gap-2 text-indigo-300 text-[11px]">
              <Clock className="w-4 h-4 animate-spin shrink-0" />
              <span>
                {isPersian
                  ? `عملیات احداث در حال پیشرفت (${activeInfraBuild.progressDays}/${activeInfraBuild.totalDays} روز)`
                  : `Construction in progress (${activeInfraBuild.progressDays}/${activeInfraBuild.totalDays} days)`}
              </span>
            </div>
          ) : playerCountry.infrastructureLevel >= 5 ? (
            <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center gap-2 text-[11px]">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isPersian ? 'زیرساخت‌ها به بالاترین حد مدرن رسیده‌اند.' : 'Infrastructure at maximum modernization.'}</span>
            </div>
          ) : (
            <button
              disabled={!canAffordInfra}
              onClick={onBuildInfrastructure}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs shadow-md shadow-indigo-600/30"
            >
              <span>{isPersian ? `ارتقا به سطح ${playerCountry.infrastructureLevel + 1}` : `Upgrade to Level ${playerCountry.infrastructureLevel + 1}`}</span>
              <span className="text-[10px] opacity-80">(${infraCost.toLocaleString()}M)</span>
            </button>
          )}
        </div>

      </div>
    </aside>
  );
};
