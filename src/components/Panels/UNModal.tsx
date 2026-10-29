import React, { useState } from 'react';
import { GameState, UNResolution, SupportedLanguage } from '../../types/game';
import { TRANSLATIONS } from '../../data/translations';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  Globe2, 
  Check, 
  XCircle, 
  MinusCircle, 
  Plus, 
  Send, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

interface UNModalProps {
  gameState: GameState;
  onClose: () => void;
  onVoteResolution: (resolutionId: string, vote: 'for' | 'against' | 'abstain') => void;
  onProposeResolution: (res: UNResolution) => void;
  language: SupportedLanguage;
}

export const UNModal: React.FC<UNModalProps> = ({
  gameState,
  onClose,
  onVoteResolution,
  onProposeResolution,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRTL = language === 'fa' || language === 'ar';
  const playerCountry = gameState.countries[gameState.playerCountryId];

  const [showProposeForm, setShowProposeForm] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resEffect, setResEffect] = useState<UNResolution['effect']>('ceasefire');

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resDesc.trim()) return;

    sound.playTriumph();
    const newRes: UNResolution = {
      id: `un_res_${Date.now()}`,
      title: resTitle.trim(),
      titleFa: resTitle.trim(),
      description: resDesc.trim(),
      descriptionFa: resDesc.trim(),
      proposerCountryId: gameState.playerCountryId,
      votesFor: [gameState.playerCountryId],
      votesAgainst: [],
      votesAbstain: [],
      status: 'active_session',
      daysLeft: 20,
      effect: resEffect,
    };

    onProposeResolution(newRes);
    setShowProposeForm(false);
    setResTitle('');
    setResDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-3xl bg-[#0b1220] border border-sky-500/30 rounded-2xl shadow-2xl flex flex-col h-[85vh] max-h-[720px] overflow-hidden text-slate-200 text-xs font-sans"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-indigo-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
              <Globe2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{t.unGeneralAssembly}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  NEW YORK HQ
                </span>
              </h2>
              <div className="text-[11px] text-slate-400">
                {language === 'fa' ? 'شورای امنیت و تصویب تحریم‌ها، آتش‌بس و پیمان‌های بین‌المللی' : 'Multilateral Security Council Sessions, Sanctions & International Treaties'}
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
              {t.unResolutions}
            </span>
            <button
              onClick={() => setShowProposeForm(!showProposeForm)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'fa' ? 'ارائه طرح قطعنامه جدید' : 'Draft New Resolution'}</span>
            </button>
          </div>

          {/* Proposal Form */}
          {showProposeForm && (
            <form onSubmit={handlePropose} className="p-4 bg-slate-900/90 border border-indigo-500/40 rounded-xl space-y-3">
              <div className="font-bold text-indigo-300 text-xs">
                {language === 'fa' ? 'پیش‌نویس قطعنامه رسمی برای رأی‌گیری عمومی' : 'Draft Official Resolution for Multilateral Vote'}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    {language === 'fa' ? 'عنوان قطعنامه:' : 'Resolution Title:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arms Embargo & Ceasefire on Hostile Fronts"
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    {language === 'fa' ? 'شرح و الزامات حقوقی:' : 'Legal Description & Directives:'}
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide justification and diplomatic sanctions..."
                    value={resDesc}
                    onChange={(e) => setResDesc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProposeForm(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
                >
                  {language === 'fa' ? 'ثبت در دستور کار' : 'Submit to Assembly'}
                </button>
              </div>
            </form>
          )}

          {/* Active Resolutions List */}
          <div className="space-y-3">
            {gameState.unResolutions.map(res => {
              const proposer = gameState.countries[res.proposerCountryId];
              const playerVotedFor = res.votesFor.includes(gameState.playerCountryId);
              const playerVotedAgainst = res.votesAgainst.includes(gameState.playerCountryId);
              const playerVotedAbstain = res.votesAbstain.includes(gameState.playerCountryId);

              return (
                <div
                  key={res.id}
                  className="p-4 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                        <span>{language === 'fa' ? res.titleFa : res.title}</span>
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Proposer: <span className="text-sky-300 font-semibold">{proposer?.flagEmoji} {proposer?.name}</span> · Days remaining: <span className="font-mono text-amber-300 font-bold">{res.daysLeft}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      res.status === 'passed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      res.status === 'failed' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {res.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {language === 'fa' ? res.descriptionFa : res.description}
                  </p>

                  {/* Voting Roster */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] p-2 bg-slate-950/40 rounded-lg">
                    <div className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.voteYes}: {res.votesFor.length}</span>
                    </div>
                    <div className="text-rose-400 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t.voteNo}: {res.votesAgainst.length}</span>
                    </div>
                    <div className="text-slate-400 font-semibold flex items-center gap-1">
                      <MinusCircle className="w-3.5 h-3.5" />
                      <span>{t.voteAbstain}: {res.votesAbstain.length}</span>
                    </div>
                  </div>

                  {/* Action Buttons for Player Voting */}
                  {res.status === 'active_session' && (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          sound.playClick(800, 0.03);
                          onVoteResolution(res.id, 'for');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          playerVotedFor ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-emerald-900/50 text-emerald-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.voteYes}</span>
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick(600, 0.03);
                          onVoteResolution(res.id, 'against');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          playerVotedAgainst ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-rose-900/50 text-rose-400'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{t.voteNo}</span>
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick(500, 0.03);
                          onVoteResolution(res.id, 'abstain');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          playerVotedAbstain ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                        <span>{t.voteAbstain}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
