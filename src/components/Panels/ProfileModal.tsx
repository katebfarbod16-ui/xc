import React, { useState } from 'react';
import { UserProfile, GameState } from '../../types/game';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  User, 
  Award, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Check, 
  Sparkles, 
  Lock, 
  Mail, 
  KeyRound, 
  Globe2 
} from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  gameState: GameState;
  onUpdateProfile: (profile: UserProfile) => void;
  onClose: () => void;
  isPersian: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  gameState,
  onUpdateProfile,
  onClose,
  isPersian,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'auth' | 'achievements'>('profile');
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  const achievements = [
    {
      id: 'ach_1',
      title: 'Supreme Sovereign',
      titleFa: 'فرمانروای مطلق',
      desc: 'Achieve over $20,000M in national treasury reserves.',
      unlocked: (gameState.countries[gameState.playerCountryId]?.treasury || 0) >= 20000,
    },
    {
      id: 'ach_2',
      title: 'Technological Superiority',
      titleFa: 'برتری فناوری',
      desc: 'Unlock 4 or more advanced military and economic research doctrines.',
      unlocked: (gameState.unlockedTechs[gameState.playerCountryId] || []).length >= 4,
    },
    {
      id: 'ach_3',
      title: 'Impenetrable Bastion',
      titleFa: 'سنگر نفوذناپذیر',
      desc: 'Construct maximum Level 3 homeland fortifications.',
      unlocked: (gameState.countries[gameState.playerCountryId]?.fortificationLevel || 0) >= 3,
    },
    {
      id: 'ach_4',
      title: 'Master of Coalitions',
      titleFa: 'استاد ائتلاف‌ها',
      desc: 'Form or lead an international alliance bloc.',
      unlocked: !!gameState.countries[gameState.playerCountryId]?.allianceId,
    },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTriumph();
    onUpdateProfile({
      ...profile,
      displayName: displayName.trim() || 'Supreme Commander',
    });
  };

  const handleSimulateAuth = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTriumph();
    onUpdateProfile({
      ...profile,
      isGuest: false,
      email: emailInput || 'commander@openbattle.net',
      displayName: displayName || 'Supreme Commander',
    });
    setAuthSuccess(true);
    setTimeout(() => setAuthSuccess(false), 3000);
  };

  const handleGoogleLogin = () => {
    sound.playTriumph();
    onUpdateProfile({
      ...profile,
      isGuest: false,
      email: 'commander.sovereign@gmail.com',
      displayName: displayName || 'Supreme Commander',
    });
    setAuthSuccess(true);
    setTimeout(() => setAuthSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0b1220] border border-sky-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-200 text-xs font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl">
              <User className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{isPersian ? 'پرونده کاربری و هویت فرمانده' : 'Player Profile & Service Record'}</span>
                {profile.isGuest ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-bold">
                    GUEST MODE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    VERIFIED CLOUD
                  </span>
                )}
              </h2>
              <div className="text-[11px] text-slate-400">
                {isPersian ? 'رتبه رزمی، مدال‌های افتخار و تنظیمات حساب کاربری' : 'Combat ELO, Medals of Honor & Cloud Sync Authentication'}
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-slate-800 bg-slate-900/60">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-colors ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-sky-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isPersian ? 'شناسنامه فرمانده' : 'Service Record'}
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'achievements'
                ? 'bg-slate-800 text-sky-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{isPersian ? 'مدال‌های افتخار' : 'Achievements'}</span>
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'auth'
                ? 'bg-slate-800 text-sky-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isPersian ? 'احراز هویت و ذخیره ابری' : 'Authentication & Cloud'}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/90 border border-slate-700/60 rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-sky-500/20">
                  🦅
                </div>
                <div>
                  <div className="text-base font-bold text-slate-100">{profile.displayName}</div>
                  <div className="text-sky-400 text-xs font-semibold">{profile.rank}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Combat Rating: <span className="font-mono text-amber-400 font-bold">{profile.elo} ELO</span> · Player ID: #{profile.id}
                  </div>
                </div>
              </div>

              {/* Edit display name form */}
              <form onSubmit={handleSaveProfile} className="p-4 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-3">
                <div className="font-bold text-slate-200">{isPersian ? 'ویرایش نام نمایشی' : 'Update Call-Sign / Display Name'}</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl"
                  >
                    {isPersian ? 'ذخیره' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Achievements */}
          {activeTab === 'achievements' && (
            <div className="space-y-3">
              <div className="font-bold text-slate-300">{isPersian ? 'دستاوردها و افتخارات جنگی' : 'Campaign Medals & Honors'}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achievements.map(ach => (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                      ach.unlocked
                        ? 'bg-slate-900/90 border-amber-500/40'
                        : 'bg-slate-950/40 border-slate-800 opacity-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${ach.unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-600'}`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>{isPersian ? ach.titleFa : ach.title}</span>
                        {ach.unlocked && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded font-bold">
                            UNLOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        {ach.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Auth & Cloud Sync */}
          {activeTab === 'auth' && (
            <div className="space-y-4">
              {authSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isPersian ? 'احراز هویت با موفقیت تأیید و همگام‌سازی ابری برقرار شد.' : 'Authentication verified. Cloud synchronization enabled.'}</span>
                </div>
              )}

              {/* Continue with Google */}
              <div className="p-4 bg-slate-900/90 border border-slate-700/60 rounded-2xl space-y-3">
                <div className="font-bold text-slate-100">{isPersian ? 'ورود امن از طریق گوگل' : 'Sign in with Google'}</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {isPersian
                    ? 'پیشرفت بازی، رتبه رزمی و دستاوردهای شما در سرورهای ابری امن همگام‌سازی می‌گردد.'
                    : 'Sync your campaign progress, tactical medals, and multiplayer ELO across devices.'}
                </p>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-xs shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Or Email & Password */}
              <form onSubmit={handleSimulateAuth} className="p-4 bg-slate-900/90 border border-slate-700/60 rounded-2xl space-y-3">
                <div className="font-bold text-slate-100">{isPersian ? 'ورود با ایمیل و رمز عبور' : 'Email & Password Authentication'}</div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Email:</label>
                  <input
                    type="email"
                    required
                    placeholder="commander@military.gov"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Password:</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  {isPersian ? 'ورود / ثبت‌نام در سامانه ابری' : 'Sign In / Register Cloud Account'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
