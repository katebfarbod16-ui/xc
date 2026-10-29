import React, { useState } from 'react';
import { GameState, MilitaryUnits, ConstructionQueueItem, SupportedLanguage } from '../../types/game';
import { TRANSLATIONS } from '../../data/translations';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  Shield, 
  Swords, 
  Plane, 
  Anchor, 
  Clock, 
  Plus, 
  ShieldAlert, 
  Crosshair, 
  Building, 
  Radio, 
  Atom, 
  Factory 
} from 'lucide-react';

interface MilitaryPanelProps {
  gameState: GameState;
  onClose: () => void;
  onRecruitUnits: (units: Partial<MilitaryUnits>, cost: number, days: number) => void;
  onBuildFortification: () => void;
  onBuildStructure: (type: ConstructionQueueItem['type'], name: string, nameFa: string, cost: number, days: number) => void;
  language: SupportedLanguage;
}

export const MilitaryPanel: React.FC<MilitaryPanelProps> = ({
  gameState,
  onClose,
  onRecruitUnits,
  onBuildFortification,
  onBuildStructure,
  language,
}) => {
  const isPersian = language === 'fa';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const playerCountry = gameState.countries[gameState.playerCountryId];
  if (!playerCountry) return null;

  const [activeTab, setActiveTab] = useState<'troops' | 'buildings'>('troops');

  const activeOrders = gameState.militaryOrders.filter(o => o.sourceCountryId === playerCountry.id);
  const activeConstructions = gameState.constructionQueue.filter(c => c.countryId === playerCountry.id);

  const structuresCatalog: { type: ConstructionQueueItem['type']; name: string; nameFa: string; cost: number; days: number; desc: string; icon: any }[] = [
    {
      type: 'missileSilos',
      name: 'Ballistic Missile Silo',
      nameFa: 'سیلوی پرتاب موشک بالستیک',
      cost: 4200,
      days: 20,
      desc: isPersian ? 'افزایش تولید موشک‌های راهبردی و توان آتش دوربرد' : 'Expands strategic missile salvo capacity and continuous production',
      icon: Crosshair,
    },
    {
      type: 'airDefenseBunkers',
      name: 'Integrated Air Defense Complex',
      nameFa: 'سپر پدافند موشکی و رادار',
      cost: 3800,
      days: 18,
      desc: isPersian ? 'رهگیری موشک‌های متخاصم و دفع حملات هوایی' : 'Interception of incoming enemy airstrikes and ballistic missiles',
      icon: ShieldAlert,
    },
    {
      type: 'navalPorts',
      name: 'Deepwater Naval Port Base',
      nameFa: 'بندر پایگاه دریایی و لجستیک',
      cost: 4800,
      days: 25,
      desc: isPersian ? 'تقویت توان دریانوردی و درآمدهای ترانزیت کانتینری' : 'Boosts naval fleet capacity and container trade tariff returns',
      icon: Anchor,
    },
    {
      type: 'armsFactories',
      name: 'Heavy Munitions & Armor Plant',
      nameFa: 'کارخانه تسلیحات سنگین و تانک',
      cost: 4500,
      days: 22,
      desc: isPersian ? 'سرعت‌بخشی به تجهیز تیپ‌های زرهی و تولید سلاح' : 'Accelerates mechanized brigade mobilization and munitions output',
      icon: Factory,
    },
    {
      type: 'civicCenters',
      name: 'Civic Administration & Housing',
      nameFa: 'مجتمع مسکونی و خدمات شهری',
      cost: 3200,
      days: 15,
      desc: isPersian ? 'ارتقای ثبات عمومی جامعه و رشد مستمر جمعیت' : 'Improves national social stability and domestic population growth',
      icon: Building,
    },
    {
      type: 'nuclearLabs',
      name: 'Strategic Physics & Tech Laboratory',
      nameFa: 'آزمایشگاه علوم راهبردی پیشرفته',
      cost: 7500,
      days: 35,
      desc: isPersian ? 'دستیابی به پژوهش‌های انقلابی و تسلیحات پیشرفته' : 'Unlocks breakthrough research rates and strategic technologies',
      icon: Atom,
    },
  ];

  return (
    <aside className="w-80 md:w-96 h-full bg-[#0b1220]/95 border-l border-sky-500/20 flex flex-col backdrop-blur-xl shadow-2xl z-20 overflow-hidden text-slate-200 text-xs font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            <Swords className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">
              {isPersian ? 'ستاد کل نیروهای مسلح و مهندسی دفاعی' : 'High Command & Military Engineering'}
            </h2>
            <div className="text-[10px] text-slate-400">
              {isPersian ? 'بسیج یگان‌ها، سیلوها، کارخانه‌ها و بنادر' : 'Mobilization, Silos, Ports & Munitions Plants'}
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

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 px-4 pt-3 border-b border-slate-800 bg-slate-900/60 text-xs">
        <button
          onClick={() => setActiveTab('troops')}
          className={`px-3 py-1.5 font-bold rounded-t-xl transition-colors ${
            activeTab === 'troops' ? 'bg-slate-800 text-rose-400 border-t border-x border-slate-700' : 'text-slate-400'
          }`}
        >
          {isPersian ? 'یگان‌های رزمی' : 'Armed Forces'}
        </button>
        <button
          onClick={() => setActiveTab('buildings')}
          className={`px-3 py-1.5 font-bold rounded-t-xl transition-colors ${
            activeTab === 'buildings' ? 'bg-slate-800 text-sky-400 border-t border-x border-slate-700' : 'text-slate-400'
          }`}
        >
          {isPersian ? 'احداث سازه و سیلو' : 'Strategic Buildings'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* TROOPS TAB */}
        {activeTab === 'troops' && (
          <div className="space-y-4">
            {/* Readiness Overview Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t.activeInfantry}</span>
                </div>
                <div className="text-lg font-bold text-rose-400 tabular-nums mt-0.5">
                  {playerCountry.military.infantry}k
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.armorTanks}</span>
                </div>
                <div className="text-lg font-bold text-amber-400 tabular-nums mt-0.5">
                  {playerCountry.military.armor}
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Plane className="w-3.5 h-3.5 text-sky-400" />
                  <span>{t.airForce}</span>
                </div>
                <div className="text-lg font-bold text-sky-400 tabular-nums mt-0.5">
                  {playerCountry.military.airForce}
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t.missiles}</span>
                </div>
                <div className="text-lg font-bold text-rose-400 tabular-nums mt-0.5">
                  {playerCountry.military.missiles || 0}
                </div>
              </div>
            </div>

            {/* Procurement Catalog */}
            <div className="space-y-2">
              <div className="font-bold text-slate-300 flex items-center justify-between">
                <span>{isPersian ? 'فهرست تجهیز و استخدام نیروها' : 'Procurement Orders'}</span>
              </div>

              {/* Option 1: Infantry */}
              <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isPersian ? 'گردان‌های پیاده‌نظام (+۲۵ هزار)' : 'Infantry Divisions (+25k)'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    $1,800M · 15d
                  </div>
                </div>
                <button
                  disabled={playerCountry.treasury < 1800}
                  onClick={() => onRecruitUnits({ infantry: 25 }, 1800, 15)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white font-bold rounded-lg text-xs"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-0.5" />
                  {isPersian ? 'بسیج' : 'Mobilize'}
                </button>
              </div>

              {/* Option 2: Armor */}
              <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isPersian ? 'تیپ زرهی مکانیزه (+۱۰۰ تانک)' : 'Armored Brigades (+100 Tanks)'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    $3,200M · 20d
                  </div>
                </div>
                <button
                  disabled={playerCountry.treasury < 3200}
                  onClick={() => onRecruitUnits({ armor: 100 }, 3200, 20)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-white font-bold rounded-lg text-xs"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-0.5" />
                  {isPersian ? 'تولید' : 'Produce'}
                </button>
              </div>

              {/* Option 3: Missiles */}
              <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isPersian ? 'تولید موشک‌های بالستیک (+۵۰ فروند)' : 'Ballistic Salvo Stockpile (+50)'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    $2,400M · 12d
                  </div>
                </div>
                <button
                  disabled={playerCountry.treasury < 2400}
                  onClick={() => onRecruitUnits({ missiles: 50 }, 2400, 12)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white font-bold rounded-lg text-xs"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-0.5" />
                  {isPersian ? 'تولید' : 'Produce'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BUILDINGS TAB */}
        {activeTab === 'buildings' && (
          <div className="space-y-3">
            <div className="font-bold text-slate-300 text-xs">
              {isPersian ? 'احداث تأسیسات و سازه‌های راهبردی دفاعی' : 'Strategic Defense & Industrial Engineering'}
            </div>

            <div className="space-y-2">
              {structuresCatalog.map(str => {
                const Icon = str.icon;
                const canAfford = playerCountry.treasury >= str.cost;

                return (
                  <div key={str.type} className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <Icon className="w-4 h-4 text-sky-400" />
                        <span>{isPersian ? str.nameFa : str.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-amber-400">
                        ${str.cost.toLocaleString()}M
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {str.desc}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-[9px] text-slate-500">Duration: {str.days} days</span>
                      <button
                        disabled={!canAfford}
                        onClick={() => {
                          sound.playClick(750, 0.04);
                          onBuildStructure(str.type, str.name, str.nameFa, str.cost, str.days);
                        }}
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t.build}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Deployment Queue */}
        {(activeOrders.length > 0 || activeConstructions.length > 0) && (
          <div className="p-3 bg-slate-900/90 border border-sky-500/30 rounded-xl space-y-2">
            <div className="font-bold text-sky-400 flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>{isPersian ? 'صف عملیات در جریان' : 'Active Engineering & Mobilization Queue'}</span>
            </div>
            <div className="space-y-1.5">
              {activeOrders.map(order => (
                <div key={order.id} className="p-2 bg-slate-800/60 rounded-lg text-[10px] flex items-center justify-between">
                  <span className="text-slate-200">
                    {order.units?.infantry ? `+${order.units.infantry}k Infantry` : ''}
                    {order.units?.armor ? `+${order.units.armor} Tanks` : ''}
                    {order.units?.missiles ? `+${order.units.missiles} Missiles` : ''}
                  </span>
                  <span className="text-slate-400 font-mono">{order.progressDays}/{order.totalDays}d</span>
                </div>
              ))}
              {activeConstructions.map(c => (
                <div key={c.id} className="p-2 bg-slate-800/60 rounded-lg text-[10px] flex items-center justify-between">
                  <span className="text-sky-300 font-semibold">{isPersian ? c.nameFa : c.name}</span>
                  <span className="text-slate-400 font-mono">{c.progressDays}/{c.totalDays}d</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
