import React, { useState } from 'react';
import { GameState, CountryData, AttackType, SupportedLanguage } from '../../types/game';
import { TRANSLATIONS } from '../../data/translations';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  Shield, 
  Swords, 
  TrendingUp, 
  Handshake, 
  FileWarning, 
  ShieldCheck, 
  Building2, 
  Coins, 
  Flame, 
  Users, 
  Gem, 
  AlertTriangle, 
  Plane, 
  Anchor, 
  Crosshair, 
  Bomb, 
  Building, 
  Radio, 
  MapPin 
} from 'lucide-react';

interface CountryOverviewProps {
  country: CountryData;
  gameState: GameState;
  onClose: () => void;
  onDeclareWar: (targetId: string) => void;
  onOfferAlliance: (targetId: string) => void;
  onOfferPact: (targetId: string) => void;
  onOfferTrade: (targetId: string) => void;
  onSendAid: (targetId: string, amount: number) => void;
  onLaunchAttack: (targetId: string, attackType: AttackType) => void;
  onProposePeace: (targetId: string) => void;
  language: SupportedLanguage;
}

export const CountryOverview: React.FC<CountryOverviewProps> = ({
  country,
  gameState,
  onClose,
  onDeclareWar,
  onOfferAlliance,
  onOfferPact,
  onOfferTrade,
  onSendAid,
  onLaunchAttack,
  onProposePeace,
  language,
}) => {
  const isPersian = language === 'fa';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isPlayer = country.id === gameState.playerCountryId;
  const playerCountry = gameState.countries[gameState.playerCountryId];
  const relation = gameState.diplomacy[gameState.playerCountryId]?.[country.id];
  const isAtWar = relation?.status === 'at_war';

  const [confirmWar, setConfirmWar] = useState(false);
  const [selectedAttackType, setSelectedAttackType] = useState<AttackType>('invasion');

  const attackOptions: { id: AttackType; label: string; desc: string; icon: any }[] = [
    {
      id: 'invasion',
      label: t.invasion,
      desc: isPersian ? 'پیشروی زرهی و پیاده‌نظام جهت شکستن خطوط دفاعی و تسخیر اراضی' : 'Ground offensive to crush defense belts and conquer territory',
      icon: Swords,
    },
    {
      id: 'missile_strike',
      label: t.missileStrike,
      desc: isPersian ? 'شلیک سالوو موشک‌های بالستیک دوربرد به سیلوها و مراکز تسلیحاتی' : 'Heavy ballistic missile salvo targeting silos and munitions plants',
      icon: Crosshair,
    },
    {
      id: 'naval_bombardment',
      label: t.navalBombardment,
      desc: isPersian ? 'شلیک موشک‌های کروز از ناوهای جنگی و محاصره بنادر دریایی' : 'Warships and submarine cruise missiles bombarding coastal ports',
      icon: Anchor,
    },
    {
      id: 'air_strike',
      label: t.airStrike,
      desc: isPersian ? 'بمباران جراحی دقیق پدافند هوایی و رادارهای مرزی رقیب' : 'Surgical air wing sorties neutralizing enemy air defenses and radar',
      icon: Plane,
    },
    {
      id: 'covert_sabotage',
      label: t.covertSabotage,
      desc: isPersian ? 'عملیات مخفیانه انفجار و خرابکاری در کارخانه‌ها و انبارهای مهمات' : 'Covert agent bombing of ammunition depots and civic stability',
      icon: Bomb,
    },
  ];

  return (
    <aside className="w-80 md:w-96 h-full bg-[#0b1220]/95 border-l border-sky-500/20 flex flex-col backdrop-blur-xl shadow-2xl z-20 overflow-hidden text-slate-200 text-xs font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900/90 to-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl drop-shadow-md">{country.flagEmoji}</span>
          <div>
            <h2 className="text-base font-bold text-sky-400">
              {isPersian ? country.nameFa : country.name}
            </h2>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>{country.capital}</span>
              <span>•</span>
              <span className="text-amber-300">{country.government}</span>
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

      {/* Content Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Latest Country Breaking News */}
        {country.latestNews && (
          <div className="p-2.5 bg-slate-900/90 border border-slate-700/70 rounded-xl flex items-center gap-2 text-[10px] text-slate-300">
            <Radio className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="leading-snug">{country.latestNews}</span>
          </div>
        )}

        {/* Status Alert if at War or Occupied */}
        {country.isOccupied && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-200 flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold">{isPersian ? 'اراضی تحت اشغال نظامی' : 'Occupied Sovereign Territory'}</div>
              <div className="text-[10px] text-rose-300">
                {isPersian ? 'این کشور تحت سلطه و اشغال نیروهای متخاصم است.' : 'This territory is under foreign military occupation.'}
              </div>
            </div>
          </div>
        )}

        {isAtWar && (
          <div className="p-3 bg-red-950/60 border border-red-500/60 rounded-xl text-red-200 flex items-center justify-between animate-war-pulse">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" />
              <span className="font-bold">{isPersian ? 'وضعیت جنگی فعال' : 'STATE OF WAR'}</span>
            </div>
            <button
              onClick={() => onProposePeace(country.id)}
              className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold"
            >
              {t.proposePeace}
            </button>
          </div>
        )}

        {/* National Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>{isPersian ? 'تولید ناخالص' : 'GDP'}</span>
            </div>
            <div className="text-sm font-bold text-emerald-400 tabular-nums">
              ${country.gdp}B
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-sky-400" />
              <span>{t.population}</span>
            </div>
            <div className="text-sm font-bold text-slate-100 tabular-nums">
              {country.population}M
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>{t.treasury}</span>
            </div>
            <div className="text-sm font-bold text-amber-400 tabular-nums">
              ${country.treasury.toLocaleString()}M
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-rose-400" />
              <span>{t.missiles}</span>
            </div>
            <div className="text-sm font-bold text-rose-400 tabular-nums">
              {country.military.missiles || 0}
            </div>
          </div>
        </div>

        {/* Strategic Infrastructure & Buildings */}
        {country.buildings && (
          <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
            <div className="font-bold text-slate-200 flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.buildings}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-1.5 bg-slate-800/40 rounded-lg flex justify-between">
                <span className="text-slate-400">{t.missileSilos}:</span>
                <span className="font-bold text-rose-300">{country.buildings.missileSilos}</span>
              </div>
              <div className="p-1.5 bg-slate-800/40 rounded-lg flex justify-between">
                <span className="text-slate-400">{t.navalPorts}:</span>
                <span className="font-bold text-cyan-300">{country.buildings.navalPorts}</span>
              </div>
              <div className="p-1.5 bg-slate-800/40 rounded-lg flex justify-between">
                <span className="text-slate-400">{t.airDefenseBunkers}:</span>
                <span className="font-bold text-emerald-300">{country.buildings.airDefenseBunkers}</span>
              </div>
              <div className="p-1.5 bg-slate-800/40 rounded-lg flex justify-between">
                <span className="text-slate-400">{t.armsFactories}:</span>
                <span className="font-bold text-amber-300">{country.buildings.armsFactories}</span>
              </div>
            </div>
          </div>
        )}

        {/* Major Sovereign Cities */}
        {country.cities && country.cities.length > 0 && (
          <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
            <div className="font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.cities}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {country.cities.map(ct => (
                <div key={ct.id} className="p-1.5 bg-slate-800/40 rounded-lg flex items-center justify-between">
                  <span className="font-semibold text-slate-200">
                    {ct.isCapital ? '★ ' : ''}{isPersian ? ct.nameFa : ct.name}
                  </span>
                  <span className="text-slate-400">{ct.population}M</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Military Force Breakdown */}
        <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
          <div className="font-bold text-slate-200 flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.standingMilitary}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex justify-between p-1.5 bg-slate-800/40 rounded-lg">
              <span className="text-slate-400">{t.activeInfantry}:</span>
              <span className="font-bold text-rose-400 tabular-nums">{country.military.infantry}k</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-800/40 rounded-lg">
              <span className="text-slate-400">{t.armorTanks}:</span>
              <span className="font-bold text-amber-400 tabular-nums">{country.military.armor}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-800/40 rounded-lg">
              <span className="text-slate-400">{t.airForce}:</span>
              <span className="font-bold text-sky-400 tabular-nums">{country.military.airForce}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-800/40 rounded-lg">
              <span className="text-slate-400">{t.navy}:</span>
              <span className="font-bold text-cyan-400 tabular-nums">{country.military.navy}</span>
            </div>
          </div>
        </div>

        {/* Diplomatic Actions & Tactical Attack Command */}
        {!isPlayer && relation && (
          <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Handshake className="w-3.5 h-3.5 text-sky-400" />
                <span>Bilateral Standing</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                relation.status === 'at_war' ? 'bg-red-500/20 text-red-400' :
                relation.status === 'allied' ? 'bg-emerald-500/20 text-emerald-400' :
                relation.status === 'rival' ? 'bg-orange-500/20 text-orange-400' :
                'bg-slate-800 text-slate-300'
              }`}>
                {relation.status.toUpperCase().replace('_', ' ')}
              </span>
            </div>

            {/* Treaties Buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                disabled={relation.status === 'allied' || isAtWar}
                onClick={() => onOfferAlliance(country.id)}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{t.alliance}</span>
              </button>

              <button
                disabled={relation.status === 'non_aggression' || relation.status === 'allied' || isAtWar}
                onClick={() => onOfferPact(country.id)}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1"
              >
                <Handshake className="w-3 h-3 text-sky-400" />
                <span>{t.nonAggression}</span>
              </button>

              <button
                disabled={relation.hasTradeAgreement || isAtWar}
                onClick={() => onOfferTrade(country.id)}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1"
              >
                <TrendingUp className="w-3 h-3 text-amber-400" />
                <span>{t.tradeDeal}</span>
              </button>

              <button
                disabled={playerCountry.treasury < 1000 || isAtWar}
                onClick={() => onSendAid(country.id, 1000)}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1"
              >
                <Coins className="w-3 h-3 text-yellow-400" />
                <span>{t.sendAid}</span>
              </button>
            </div>

            {/* Tactical Attack Suite (When at War or Covert Ops) */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              {isAtWar ? (
                <div className="space-y-2">
                  <div className="font-bold text-rose-300 text-[11px] flex items-center justify-between">
                    <span>{t.launchAttack}</span>
                    <span className="text-[10px] text-slate-400">Select Doctrine</span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {attackOptions.map(opt => {
                      const Icon = opt.icon;
                      const isSelected = selectedAttackType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            sound.playClick(600, 0.02);
                            setSelectedAttackType(opt.id);
                          }}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-rose-950/80 border-rose-500 text-white shadow-md'
                              : 'bg-slate-900 border-slate-700/60 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-rose-400" />
                            <span>{opt.label}</span>
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5 leading-snug">
                            {opt.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => onLaunchAttack(country.id, selectedAttackType)}
                    className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transition-transform active:scale-95 text-xs"
                  >
                    <Crosshair className="w-4 h-4 animate-pulse" />
                    <span>{isPersian ? 'اجرای حمله راهبردی' : 'Execute Strike Operation'}</span>
                  </button>
                </div>
              ) : !confirmWar ? (
                <button
                  onClick={() => setConfirmWar(true)}
                  className="w-full py-2 bg-slate-800/80 hover:bg-red-950/80 text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileWarning className="w-3.5 h-3.5" />
                  <span>{t.declareWar}</span>
                </button>
              ) : (
                <div className="p-2.5 bg-red-950/80 border border-red-500/60 rounded-xl space-y-2">
                  <div className="text-[11px] text-red-200 text-center font-bold">
                    {isPersian ? 'آیا از اعلان جنگ رسمی اطمینان دارید؟' : 'Confirm official declaration of war?'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConfirmWar(false);
                        onDeclareWar(country.id);
                      }}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs"
                    >
                      {isPersian ? 'تأیید اعلان جنگ' : 'Confirm War'}
                    </button>
                    <button
                      onClick={() => setConfirmWar(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    >
                      {t.close}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </aside>
  );
};
