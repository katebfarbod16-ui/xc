import React, { useState } from 'react';
import { GameState, CountryData, SpyMission, SpyMissionType, SupportedLanguage } from '../../types/game';
import { 
  ShieldAlert, 
  Eye, 
  Radio, 
  Target, 
  Flame, 
  Cpu, 
  Flag, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  Crosshair, 
  X,
  Lock,
  Unlock
} from 'lucide-react';

interface SpyNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  selectedCountryId?: string;
  onSelectCountry: (id: string) => void;
  onStartMission: (targetCountryId: string, type: SpyMissionType, cost: number, days: number, desc: string, descFa: string) => void;
  onExpandNetwork: (targetCountryId: string) => void;
  language: SupportedLanguage;
}

export const SpyNetworkModal: React.FC<SpyNetworkModalProps> = ({
  isOpen,
  onClose,
  state,
  selectedCountryId,
  onSelectCountry,
  onStartMission,
  onExpandNetwork,
  language,
}) => {
  if (!isOpen) return null;

  const isFa = language === 'fa' || language === 'ar';
  const player = state.countries[state.playerCountryId];
  
  // Default to first non-player country if not selected
  const targetId = (selectedCountryId && selectedCountryId !== state.playerCountryId) 
    ? selectedCountryId 
    : Object.keys(state.countries).find(id => id !== state.playerCountryId) || '840';

  const targetCountry: CountryData | undefined = state.countries[targetId];
  const spyNet = state.spyNetworks?.[targetId] || {
    countryId: targetId,
    infiltrationLevel: 10,
    agentCount: 1,
    intelDiscovered: false,
    activeMissions: [],
  };

  const isIntelUnlocked = spyNet.intelDiscovered || spyNet.infiltrationLevel >= 40;

  const missionTemplates: {
    type: SpyMissionType;
    title: string;
    titleFa: string;
    description: string;
    descriptionFa: string;
    cost: number;
    days: number;
    risk: 'low' | 'medium' | 'high';
    icon: any;
  }[] = [
    {
      type: 'gather_intel',
      title: 'Deep Satellite & Field Reconnaissance',
      titleFa: 'شناسایی و بازرسی ماهواره‌ای و میدانی',
      description: 'Infiltrate military command to reveal exact radar, missile silo, and garrison locations on world map.',
      descriptionFa: 'نفوذ به ساختار فرماندهی دشمن و آشکارسازی موقعیت سیلوهای موشکی، رادارها و ادوات زرهی روی نقشه.',
      cost: 1500,
      days: 8,
      risk: 'low',
      icon: Eye,
    },
    {
      type: 'incite_unrest',
      title: 'Incite Civil Protests & Unrest',
      titleFa: 'سازماندهی تظاهرات و اعتصابات عمومی',
      description: 'Finance dissident networks to trigger nationwide unrest, slashing stability by 25% and degrading tax revenue.',
      descriptionFa: 'پشتیبانی از اعتصابات سراسری؛ کاهش ۲۵ درصدی ثبات حکومت دشمن و اخلال در درآمدهای مالیاتی.',
      cost: 2400,
      days: 14,
      risk: 'medium',
      icon: Flame,
    },
    {
      type: 'assassinate_general',
      title: 'Neutralize Supreme Tactical General',
      titleFa: 'عملیات هدفمند حذف فرماندهان عالی‌رتبه',
      description: 'Eliminate top battlefield command officers, demoralizing standing troops and lowering fortifications by 1 level.',
      descriptionFa: 'ترور فرمانده ارشد رزمی دشمن؛ فروپاشی انگیزه نظامیان و کاهش یک رده از استحکامات تدافعی.',
      cost: 3500,
      days: 20,
      risk: 'high',
      icon: Crosshair,
    },
    {
      type: 'sabotage_silos',
      title: 'Sabotage Ballistic Launch Silos',
      titleFa: 'عملیات انفجار سیلوهای پرتاب و رادار پدافند',
      description: 'Plant tactical C4 charges in primary silo complexes to destroy 1 missile silo and 1 air defense bunker.',
      descriptionFa: 'نفوذ تیم‌های تکاور به پایگاه‌های سری و انفجار یک سیلوی پرتاب بالستیک و یک سایت راداری پدافند.',
      cost: 3200,
      days: 16,
      risk: 'high',
      icon: Target,
    },
    {
      type: 'steal_tech',
      title: 'Exfiltrate Classified R&D Blueprints',
      titleFa: 'سرقت اسناد محرمانه فناوری و تسلیحات پیشرفته',
      description: 'Cyber intrusion into defense servers to extract proprietary technological breakthroughs for our laboratories.',
      descriptionFa: 'عملیات نفوذ سایبری به سرورهای وزارت دفاع دشمن جهت سرقت دستاوردهای علمی و انتقال به مراکز تحقیقاتی ما.',
      cost: 4500,
      days: 25,
      risk: 'high',
      icon: Cpu,
    },
    {
      type: 'rig_election',
      title: 'Orchestrate Diplomatic Realignment',
      titleFa: 'هدایت موازنه قدرت سیاسی و روی کار آمدن دولت متحد',
      description: 'Fund pro-alliance leaders to dramatically warm diplomatic relations (+50 opinion) and open free trade.',
      descriptionFa: 'هدایت جریان‌های سیاسی در کشور هدف؛ افزایش ۵۰ واحدی روابط دیپلماتیک و عقد پیمان تجارت آزاد.',
      cost: 5500,
      days: 30,
      risk: 'medium',
      icon: Flag,
    },
    {
      type: 'fabricate_cb',
      title: 'Fabricate Legitimate Casus Belli',
      titleFa: 'تولید اسناد تحریک‌آمیز و توجیه مشروع جنگ (Casus Belli)',
      description: 'Manufacture classified evidence of hostile intent, allowing military intervention without UN condemnation.',
      descriptionFa: 'افشای اسناد از نیات تجاوزکارانه دشمن؛ فراهم‌سازی مجوز قانونی حمله بدون تحریم سازمان ملل.',
      cost: 1800,
      days: 10,
      risk: 'low',
      icon: Scale,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 overflow-hidden text-slate-100 font-sans"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
                <span>{isFa ? 'شبکه جاسوسی و عملیات ویژه (Spy Network)' : 'Global Espionage & Covert Operations'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isFa ? 'فوق محرمانه' : 'TOP SECRET'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isFa 
                  ? 'جمع‌آوری اطلاعات راهبردی، آشکارسازی مواضع نظامی و ماموریت‌های خرابکاری براندازانه'
                  : 'Long-term intelligence gathering, revealing enemy battle lines, and advanced subversion missions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">{isFa ? 'ذخایر خزانه‌داری:' : 'Treasury:'}</span>
              <span className="text-sm font-mono font-bold text-emerald-400">${player?.treasury.toLocaleString()}M</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Target Country Selector Bar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800 flex items-center gap-3 overflow-x-auto scrollbar-thin">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-400" />
            {isFa ? 'کشور هدف:' : 'Target Sovereign:'}
          </span>
          {Object.values(state.countries)
            .filter(c => c.id !== state.playerCountryId)
            .map(c => {
              const isSelected = c.id === targetId;
              const hasIntel = (state.spyNetworks?.[c.id]?.infiltrationLevel || 0) >= 40;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCountry(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <span>{c.flagEmoji}</span>
                  <span>{isFa ? c.nameFa : c.name}</span>
                  {hasIntel && (
                    <Eye className="w-3 h-3 text-emerald-300" />
                  )}
                </button>
              );
            })}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {targetCountry && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Network Infiltration Status & Agent Control */}
              <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{targetCountry.flagEmoji}</span>
                      <div>
                        <h3 className="font-bold text-base text-white">
                          {isFa ? targetCountry.nameFa : targetCountry.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {isFa ? `پایتخت: ${targetCountry.capital}` : `Capital: ${targetCountry.capital}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-xs text-slate-300">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{spyNet.agentCount} {isFa ? 'مامور فعال' : 'Agents'}</span>
                    </div>
                  </div>

                  {/* Infiltration Meter */}
                  <div className="space-y-2 mb-5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">
                        {isFa ? 'سطح نفوذ اطلاعاتی (Infiltration)' : 'Infiltration Depth'}
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {Math.round(spyNet.infiltrationLevel)}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-800 overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, spyNet.infiltrationLevel)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0% (Shadows)</span>
                      <span>40% (Recon Unlocked)</span>
                      <span>100% (Full Breach)</span>
                    </div>
                  </div>

                  {/* Intel Summary Card */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        {isIntelUnlocked ? (
                          <>
                            <Unlock className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">{isFa ? 'پرونده نظامی شناسایی‌شده' : 'Verified Military Dossier'}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400">{isFa ? 'پرونده اطلاعاتی محرمانه' : 'Classified Defense Data'}</span>
                          </>
                        )}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {isIntelUnlocked ? '40%+ ACCURACY' : 'FOG OF WAR'}
                      </span>
                    </div>

                    {isIntelUnlocked ? (
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px]">{isFa ? 'پیاده‌نظام:' : 'Infantry:'}</span>
                          <span className="font-bold text-emerald-400">{targetCountry.military.infantry}k troops</span>
                        </div>
                        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px]">{isFa ? 'ادوات زرهی:' : 'Armor:'}</span>
                          <span className="font-bold text-emerald-400">{targetCountry.military.armor} tanks</span>
                        </div>
                        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px]">{isFa ? 'سیلوی موشک:' : 'Missile Silos:'}</span>
                          <span className="font-bold text-amber-400">{targetCountry.buildings.missileSilos} active</span>
                        </div>
                        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px]">{isFa ? 'پدافند هوایی:' : 'Air Defense:'}</span>
                          <span className="font-bold text-sky-400">{targetCountry.buildings.airDefenseBunkers} radars</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center space-y-2">
                        <ShieldAlert className="w-8 h-8 text-amber-500/50 mx-auto" />
                        <p className="text-xs text-slate-400">
                          {isFa 
                            ? 'نفوذ اطلاعاتی زیر ۴۰٪ است. برای دیدن مکان دقیق سیلوها و تعداد نیروها، شبکه را تقویت کنید.'
                            : 'Infiltration below 40%. Deploy more agents or run Reconnaissance to reveal defense assets.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expand Network Button */}
                <button
                  onClick={() => onExpandNetwork(targetId)}
                  disabled={(player?.treasury || 0) < 1200}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition shadow-lg shadow-emerald-950/40"
                >
                  <Users className="w-4 h-4" />
                  <span>{isFa ? 'اعزام و تقویت تیم‌های نفوذ (هزینه: ۱,۲۰۰M$)' : 'Deploy Reinforcing Agent Cell ($1,200M)'}</span>
                </button>
              </div>

              {/* Right Columns: Covert Subversion Operations */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>{isFa ? 'ماموریت‌های عملیات ویژه و براندازی' : 'Covert Subversion Operations'}</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {spyNet.activeMissions.length} {isFa ? 'عملیات در جریان' : 'Active Missions'}
                  </span>
                </div>

                {/* Active Missions Progress */}
                {spyNet.activeMissions.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                    <span className="text-xs font-semibold text-emerald-400 block flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      {isFa ? 'عملیات‌های نفوذ در حال اجرا:' : 'Operations In Progress:'}
                    </span>
                    {spyNet.activeMissions.map((m) => {
                      const pct = Math.round((m.progressDays / m.totalDays) * 100);
                      return (
                        <div key={m.id} className="space-y-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-200">
                              {isFa ? m.descriptionFa : m.description}
                            </span>
                            <span className="text-emerald-400 font-mono">
                              {m.progressDays} / {m.totalDays} {isFa ? 'روز' : 'days'} ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Mission Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {missionTemplates.map((item) => {
                    const Icon = item.icon;
                    const canAfford = (player?.treasury || 0) >= item.cost;
                    const isAlreadyRunning = spyNet.activeMissions.some(m => m.type === item.type);

                    return (
                      <div
                        key={item.type}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-xs text-white">
                                {isFa ? item.titleFa : item.title}
                              </span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                              item.risk === 'high' 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : item.risk === 'medium'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {item.risk.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed">
                            {isFa ? item.descriptionFa : item.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          <div className="text-[11px] font-mono text-slate-400">
                            <span className="text-emerald-400 font-bold">${item.cost.toLocaleString()}M</span>
                            <span className="mx-1.5">•</span>
                            <span>{item.days} {isFa ? 'روز' : 'days'}</span>
                          </div>

                          <button
                            onClick={() => onStartMission(targetId, item.type, item.cost, item.days, item.title, item.titleFa)}
                            disabled={!canAfford || isAlreadyRunning}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                              isAlreadyRunning
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : canAfford
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Target className="w-3.5 h-3.5" />
                            <span>
                              {isAlreadyRunning
                                ? (isFa ? 'در حال اجرا' : 'In Progress')
                                : (isFa ? 'آغاز عملیات' : 'Launch Ops')}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {isFa 
              ? 'اطلاعات به دست آمده موقعیت رادارها و سیلوهای موشکی را روی نقشه عمومی نمایش می‌دهد.'
              : 'Revealed intelligence renders enemy missile silos and radar bunkers visible on the globe.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs font-medium"
          >
            {isFa ? 'بستن پنل اطلاعات' : 'Close Espionage Hub'}
          </button>
        </div>
      </div>
    </div>
  );
};
