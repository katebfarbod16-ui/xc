import React, { useState } from 'react';
import { CountryData, GameState, AttackType, SupportedLanguage, ConstructionQueueItem } from '../../types/game';
import { TRANSLATIONS } from '../../data/translations';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  Swords, 
  Crosshair, 
  Bomb, 
  Anchor, 
  Plane, 
  Building2, 
  Shield, 
  ShieldAlert, 
  Flame, 
  Coins, 
  Users, 
  Factory, 
  Atom, 
  MapPin, 
  PlusCircle, 
  Sliders, 
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface TacticalContextMenuProps {
  country: CountryData;
  gameState: GameState;
  position: { x: number; y: number };
  onClose: () => void;
  onLaunchAttack: (targetId: string, attackType: AttackType, troopCommitment?: number, missileCommitment?: number) => void;
  onBuildStructure: (type: ConstructionQueueItem['type'], name: string, nameFa: string, cost: number, days: number, extraData?: Record<string, any>) => void;
  language: SupportedLanguage;
}

export const TacticalContextMenu: React.FC<TacticalContextMenuProps> = ({
  country,
  gameState,
  position,
  onClose,
  onLaunchAttack,
  onBuildStructure,
  language,
}) => {
  const isPersian = language === 'fa';
  const isRTL = language === 'fa' || language === 'ar';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const playerCountry = gameState.countries[gameState.playerCountryId];
  const isPlayerCountry = country.id === gameState.playerCountryId;

  // Foreign Country Attack Configuration State
  const [activeTab, setActiveTab] = useState<'invasion' | 'missiles' | 'airstrike' | 'covert'>('invasion');
  const [troopsCommit, setTroopsCommit] = useState(() => Math.min(100, Math.round((playerCountry?.military.infantry || 50) * 0.4)));
  const [missileCommit, setMissileCommit] = useState(() => Math.min(50, Math.round((playerCountry?.military.missiles || 100) * 0.3)));
  
  // Custom New City Name State
  const [customCityName, setCustomCityName] = useState('');

  // Annexation status
  const currentAnnexation = gameState.territorialControl?.[gameState.playerCountryId]?.[country.id] || 
    (country.occupierId === gameState.playerCountryId ? 100 : 0);

  // Position clamping to keep inside viewport
  const menuWidth = 360;
  const menuHeight = 490;
  const left = Math.min(window.innerWidth - menuWidth - 20, Math.max(20, position.x));
  const top = Math.min(window.innerHeight - menuHeight - 20, Math.max(20, position.y));

  // Sovereign Construction Options
  const buildOptions: {
    type: ConstructionQueueItem['type'];
    name: string;
    nameFa: string;
    cost: number;
    days: number;
    desc: string;
    descFa: string;
    icon: any;
    currentCount?: number;
  }[] = [
    {
      type: 'newCity',
      name: 'Found Sovereign Metropolis',
      nameFa: 'احداث کلان‌شهر راهبردی جدید',
      cost: 8000,
      days: 30,
      desc: '+1.2M Population, +$18B Annual GDP, +$150M/mo Tax revenue',
      descFa: 'افزایش ۱.۲ میلیون نفر جمعیت، رشد ۱۸ میلیارد دلاری تولید ناخالص و درآمد مالیاتی پایدار',
      icon: MapPin,
      currentCount: country.cities?.length || 4,
    },
    {
      type: 'missileSilos',
      name: 'Ballistic Missile Launch Silo',
      nameFa: 'سیلوی پرتاب موشک‌های بالستیک دوربرد',
      cost: 4200,
      days: 20,
      desc: '+200 Missile silo storage, enables massive strategic salvo strikes',
      descFa: 'افزایش ظرفیت زرادخانه و امکان شلیک رگبارهای سنگین موشکی',
      icon: Crosshair,
      currentCount: country.buildings?.missileSilos || 0,
    },
    {
      type: 'airDefenseBunkers',
      name: 'Integrated Air Defense Complex',
      nameFa: 'پدافند موشکی و راداری یکپارچه',
      cost: 3800,
      days: 18,
      desc: '+18% Interception rate against enemy incoming missile strikes',
      descFa: 'افزایش چشمگیر توان رهگیری و انهدام موشک‌های مهاجم دشمن',
      icon: Shield,
      currentCount: country.buildings?.airDefenseBunkers || 0,
    },
    {
      type: 'navalPorts',
      name: 'Deepwater Naval Port & Fleet Pier',
      nameFa: 'بندرگاه و پایگاه ناوبری آب‌های عمیق',
      cost: 5000,
      days: 25,
      desc: '+15 Fleet capacity, maritime trade export multiplier',
      descFa: 'توسعه ناوگان ناوشکن‌ها و زیردریایی‌ها و افزایش ترانزیت دریایی',
      icon: Anchor,
      currentCount: country.buildings?.navalPorts || 0,
    },
    {
      type: 'armsFactories',
      name: 'Armored & Munitions Plant',
      nameFa: 'کارخانجات صنایع زرهی و تسلیحاتی',
      cost: 4500,
      days: 22,
      desc: 'Produces continuous armored combat vehicles and heavy equipment',
      descFa: 'تولید مداوم تانک‌ها، نفربرهای زرهی و تجهیزات لجستیک نبرد',
      icon: Factory,
      currentCount: country.buildings?.armsFactories || 0,
    },
    {
      type: 'civicCenters',
      name: 'Civic Administration & Commerce Hub',
      nameFa: 'مرکز بازرگانی و مدیریت خدمات مدنی',
      cost: 3200,
      days: 15,
      desc: '+8 National stability, +$12B GDP expansion, boosts morale',
      descFa: 'افزایش ۸ درصدی ثبات ملی و رشد اقتصادی شهروندان',
      icon: Building2,
      currentCount: country.buildings?.civicCenters || 0,
    },
    {
      type: 'nuclearLabs',
      name: 'Strategic Nuclear Physics Facility',
      nameFa: 'تأسیسات تحقیقات پیشرفته فیزیک هسته‌ای',
      cost: 12000,
      days: 45,
      desc: 'Enormous technological superiority and ultimate deterrent',
      descFa: 'دستیابی به بالاترین سطح بازدارندگی راهبردی و فناوری‌های فوق پیشرفته',
      icon: Atom,
      currentCount: country.buildings?.nuclearLabs || 0,
    },
  ];

  return (
    <div 
      className="fixed z-50 bg-[#0b1220]/95 border border-sky-500/50 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 font-sans text-xs flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style={{
        left,
        top,
        width: menuWidth,
        maxHeight: menuHeight,
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-sky-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl drop-shadow">{country.flagEmoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-sky-300">
                {isPersian ? country.nameFa : country.name}
              </span>
              {isPlayerCountry && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold">
                  {isPersian ? 'کشور ما' : 'Sovereign Homeland'}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-2">
              <span>{isPersian ? `پایتخت: ${country.capital}` : `Capital: ${country.capital}`}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold tabular-nums">
                ${country.treasury}M
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* --- CASE A: PLAYER'S HOMELAND CONSTRUCTION QUICK-MENU --- */}
      {isPlayerCountry && (
        <div className="p-3 space-y-2.5 overflow-y-auto max-h-[410px] scrollbar-thin">
          <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-xl border border-sky-500/20">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] text-slate-300">{isPersian ? 'خزانه در دسترس:' : 'Available Treasury:'}</span>
            </div>
            <span className="text-sm font-black text-amber-300 tabular-nums">
              ${playerCountry?.treasury.toLocaleString()}M
            </span>
          </div>

          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {isPersian ? 'احداث زیرساخت‌ها و توسعه شهرها' : 'Sovereign Urban & Infrastructure Expansion'}
          </div>

          <div className="space-y-2">
            {buildOptions.map(opt => {
              const Icon = opt.icon;
              const canAfford = (playerCountry?.treasury || 0) >= opt.cost;

              return (
                <div
                  key={opt.type}
                  className={`p-2.5 rounded-xl border transition-all ${
                    canAfford
                      ? 'bg-slate-900/70 border-slate-700/80 hover:border-sky-500/60 hover:bg-slate-850'
                      : 'bg-slate-900/30 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{isPersian ? opt.nameFa : opt.name}</span>
                          {opt.currentCount !== undefined && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                              x{opt.currentCount}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {isPersian ? opt.descFa : opt.desc}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold text-xs ${canAfford ? 'text-amber-400' : 'text-rose-400'}`}>
                        ${opt.cost}M
                      </span>
                    </div>
                  </div>

                  {opt.type === 'newCity' && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      <input
                        type="text"
                        value={customCityName}
                        onChange={(e) => setCustomCityName(e.target.value)}
                        placeholder={isPersian ? 'نام شهر جدید (مثلاً: بندر پارس)...' : 'New City Name (e.g. New Alexandria)...'}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}

                  <div className="mt-2 flex justify-end">
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        const extraData = opt.type === 'newCity' ? {
                          cityName: customCityName.trim() || `Metropolis ${(country.cities?.length || 0) + 1}`,
                          cityNameFa: customCityName.trim() || `شهر راهبردی ${(country.cities?.length || 0) + 1}`,
                        } : undefined;
                        onBuildStructure(opt.type, opt.name, opt.nameFa, opt.cost, opt.days, extraData);
                        setCustomCityName('');
                        onClose();
                      }}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{isPersian ? 'دستور ساخت فوری' : 'Issue Build Order'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- CASE B: FOREIGN COUNTRY TACTICAL INVASION & STRIKE MENU --- */}
      {!isPlayerCountry && (
        <div className="p-3 space-y-3 overflow-y-auto max-h-[410px] scrollbar-thin">
          {/* Territorial Annexation Progress Bar */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-semibold text-slate-300">
                {isPersian ? 'میزان تسخیر و انضمام خاک:' : 'Territorial Conquest Progress:'}
              </span>
              <span className={`font-mono font-bold ${currentAnnexation > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {currentAnnexation}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, currentAnnexation)}%` }}
              />
            </div>
            <div className="text-[9px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{isPersian ? 'مقاومت مدافع' : 'Defense Resisting'}</span>
              <span>{currentAnnexation >= 50 ? (isPersian ? 'قلمرو ضمیمه شد' : 'Annexed Territory') : (isPersian ? 'نیاز به پیشروی ۵۰٪' : '50% to Annex')}</span>
            </div>
          </div>

          {/* Quick Target Defense Metrics */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400">{isPersian ? 'پیاده‌نظام' : 'Infantry'}</div>
              <div className="font-bold text-rose-400 tabular-nums">{country.military.infantry}k</div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400">{isPersian ? 'موشک‌ها' : 'Missiles'}</div>
              <div className="font-bold text-amber-400 tabular-nums">{country.military.missiles || 0}</div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400">{isPersian ? 'پدافند هوایی' : 'Air Defense'}</div>
              <div className="font-bold text-sky-400 tabular-nums">Lv {country.buildings?.airDefenseBunkers || 1}</div>
            </div>
          </div>

          {/* Attack Doctrine Selector Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {[
              { id: 'invasion', label: 'Invasion', labelFa: 'تهاجم', icon: Swords },
              { id: 'missiles', label: 'Missiles', labelFa: 'موشکی', icon: Crosshair },
              { id: 'airstrike', label: 'Air Strike', labelFa: 'هوایی', icon: Plane },
              { id: 'covert', label: 'Covert', labelFa: 'خرابکاری', icon: Bomb },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                    isActive 
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isPersian ? tab.labelFa : tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: GROUND INVASION & TERRITORIAL ANNEXATION */}
          {activeTab === 'invasion' && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-300">
                  {isPersian ? 'اعزام یگان‌های زمینی و زرهی' : 'Troop Deployment Commitment'}
                </span>
                <span className="font-mono font-bold text-amber-400 tabular-nums">
                  {troopsCommit}k {isPersian ? 'نفر' : 'troops'}
                </span>
              </div>

              <input
                type="range"
                min="10"
                max={Math.max(10, playerCountry?.military.infantry || 100)}
                step="5"
                value={troopsCommit}
                onChange={(e) => setTroopsCommit(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />

              <div className="text-[10px] text-slate-300 leading-relaxed bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                {isPersian 
                  ? '⚔️ با پیروزی در نبرد زمینی، پیشروی در خاک دشمن آغاز شده و بخش‌هایی از قلمرو آن به مرزهای ما افزوده خواهد شد.' 
                  : '⚔️ Victorious ground operations breach perimeter defensive sectors, permanently annexing territory into our national borders.'}
              </div>

              <button
                onClick={() => {
                  onLaunchAttack(country.id, 'invasion', troopsCommit);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>{isPersian ? 'آغاز تهاجم زمینی و فتح خاک' : 'Launch Invasion & Annex Territory'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: BALLISTIC MISSILE BARRAGE */}
          {activeTab === 'missiles' && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">
                  {isPersian ? 'تعداد شلیک موشک‌های بالستیک' : 'Ballistic Salvo Size'}
                </span>
                <span className="font-mono font-bold text-amber-400 tabular-nums">
                  {missileCommit} {isPersian ? 'فروند' : 'missiles'}
                </span>
              </div>

              <input
                type="range"
                min="5"
                max={Math.max(5, playerCountry?.military.missiles || 50)}
                step="5"
                value={missileCommit}
                onChange={(e) => setMissileCommit(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="text-[10px] text-slate-300 leading-relaxed bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                {isPersian
                  ? '🚀 موشک‌ها به سمت سیلوها، کارخانه‌ها و بنادر دشمن پرتاب شده و مسیر حرکت آن‌ها روی نقشه به نمایش درمی‌آید.'
                  : '🚀 Ballistic missiles launched from national silos track along dynamic sub-orbital trajectories to strike enemy high-value assets.'}
              </div>

              <button
                disabled={(playerCountry?.military.missiles || 0) < missileCommit}
                onClick={() => {
                  onLaunchAttack(country.id, 'missile_strike', undefined, missileCommit);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
              >
                <Crosshair className="w-4 h-4" />
                <span>{isPersian ? 'شلیک رگبار موشک‌های دوربرد' : 'Fire Strategic Ballistic Salvo'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: SURGICAL AIR STRIKE */}
          {activeTab === 'airstrike' && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-3">
              <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                {isPersian
                  ? '✈️ بمباران هوایی دقیق برای انهدام رادارهای پدافندی و سایت‌های مراقبتی دشمن بدون تلفات ارضی.'
                  : '✈️ Surgical air superiority strike to neutralize enemy radar bunkers and air defense radar networks.'}
              </div>

              <button
                onClick={() => {
                  onLaunchAttack(country.id, 'air_strike');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2"
              >
                <Plane className="w-4 h-4" />
                <span>{isPersian ? 'اجرای عملیات ضربتی هوایی' : 'Execute Surgical Air Strike'}</span>
              </button>
            </div>
          )}

          {/* TAB 4: COVERT SABOTAGE */}
          {activeTab === 'covert' && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-3">
              <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                {isPersian
                  ? '💣 نفوذ تیم‌های ویژه جهت بمب‌گذاری در انبارهای مهمات، فلج کردن ثبات سیاسی و ایجاد خستگی نبرد در دشمن.'
                  : '💣 Covert special ops infiltration to sabotage ammunition depots, collapse enemy stability, and spike war exhaustion.'}
              </div>

              <button
                onClick={() => {
                  onLaunchAttack(country.id, 'covert_sabotage');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <Bomb className="w-4 h-4" />
                <span>{isPersian ? 'اجرای عملیات بمب‌گذاری سری' : 'Deploy Covert Sabotage Team'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
