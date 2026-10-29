import React, { useState, useRef, useEffect } from 'react';
import { GameState, AIAdvisorMessage } from '../../types/game';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle, 
  RotateCcw,
  ShieldAlert,
  Coins,
  Swords,
  Loader2
} from 'lucide-react';

interface CommanderAIPanelProps {
  gameState: GameState;
  onClose: () => void;
  onExecuteSuggestedAction: (action: NonNullable<AIAdvisorMessage['suggestedAction']>) => void;
  isPersian: boolean;
}

export const CommanderAIPanel: React.FC<CommanderAIPanelProps> = ({
  gameState,
  onClose,
  onExecuteSuggestedAction,
  isPersian,
}) => {
  const playerCountry = gameState.countries[gameState.playerCountryId];

  const [messages, setMessages] = useState<AIAdvisorMessage[]>([
    {
      id: 'init_msg',
      sender: 'commander',
      text: isPersian
        ? `فرمانده معظم، ستاد تحلیل راهبردی آماده ارائه مشاوره‌های تاکتیکی در حوزه‌های موازنه بودجه، آرایش ارتش، اتحادهای بین‌المللی و تهدیدات سرزمینی است. چه فرمانی دارید؟`
        : `Supreme Commander, Strategic Intelligence is online and evaluating global telemetry for ${playerCountry?.name || 'your sovereign state'}. How may I advise your High Command today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    {
      en: 'Evaluate our national economic health and treasury cashflow',
      fa: 'ارزیابی وضعیت سلامت اقتصاد ملی و تراز خزانه‌داری'
    },
    {
      en: 'Identify the top military threats along our sovereign borders',
      fa: 'شناسایی بزرگ‌ترین تهدیدات نظامی در امتداد مرزهای کشور'
    },
    {
      en: 'Recommend the optimal research technology to prioritize next',
      fa: 'پیشنهاد بهینه‌ترین فناوری تحقیقاتی برای اولویت بعدی'
    },
    {
      en: 'Propose diplomatic initiatives to expand our international sphere',
      fa: 'ارائه راهکارهای دیپلماتیک جهت گسترش حوزه نفوذ بین‌المللی'
    }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || isLoading) return;

    sound.playClick(700, 0.03);
    const userMsg: AIAdvisorMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build lightweight state summary for contextual guidance
      const payload = {
        question: text,
        language: isPersian ? 'fa' : 'en',
        country: {
          name: playerCountry?.name,
          nameFa: playerCountry?.nameFa,
          gdp: playerCountry?.gdp,
          treasury: playerCountry?.treasury,
          stability: playerCountry?.stability,
          warExhaustion: playerCountry?.warExhaustion,
          taxRate: playerCountry?.taxRate,
          military: playerCountry?.military,
          fortificationLevel: playerCountry?.fortificationLevel,
          infrastructureLevel: playerCountry?.infrastructureLevel,
        },
        currentDate: gameState.currentDate,
        scenario: gameState.scenarioId,
        difficulty: gameState.difficulty,
        unlockedTechsCount: (gameState.unlockedTechs[gameState.playerCountryId] || []).length,
      };

      const res = await fetch('/api/commander', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      sound.playRadarPing();

      const aiMsg: AIAdvisorMessage = {
        id: `ai_${Date.now()}`,
        sender: 'commander',
        text: data.reply || (isPersian ? 'گزارش راهبردی با موفقیت دریافت شد.' : 'Operational briefing updated.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: data.suggestedAction,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn('AI call fallback to local tactical rule engine', err);

      // Robust local tactical rule fallback so the gameplay is always flawless
      let fallbackText = '';
      let action: AIAdvisorMessage['suggestedAction'] | undefined;

      const lowerQ = text.toLowerCase();
      if (lowerQ.includes('econom') || lowerQ.includes('treasur') || lowerQ.includes('اقتصاد') || lowerQ.includes('مالیات')) {
        fallbackText = isPersian
          ? `بررسی وضعیت خزانه‌داری: ذخایر ارزی فعلی $${playerCountry?.treasury.toLocaleString()}M دلار است. با نرخ مالیات فعلی ${(playerCountry?.taxRate || 0.25) * 100}٪، توصیه می‌گردد در صورت بالا بودن ثبات عمومی (${playerCountry?.stability}٪)، نرخ مالیات را جهت پشتیبانی از تسلیحات جدید کمی تعدیل فرمایید.`
          : `Economic Briefing: Treasury reserves stand at $${playerCountry?.treasury.toLocaleString()}M USD. With current taxation at ${(playerCountry?.taxRate || 0.25) * 100}%, our cashflow remains steady. Recommend investing in industrial infrastructure or maintaining balanced taxation.`;
        if ((playerCountry?.treasury || 0) > 4000) {
          action = {
            type: 'build_infra',
            title: isPersian ? 'احداث و ارتقای زیرساخت‌های ملی' : 'Upgrade National Infrastructure',
            description: isPersian ? 'تخصیص بودجه جهت ارتقای ترانزیت و نیروگاه‌ها' : 'Invest reserves to boost domestic GDP and tax revenues.',
            cost: (playerCountry?.infrastructureLevel || 1) * 4500,
          };
        }
      } else if (lowerQ.includes('militar') || lowerQ.includes('threat') || lowerQ.includes('نظام') || lowerQ.includes('ارتش')) {
        fallbackText = isPersian
          ? `برآورد توازن نظامی: ارتش ما دارای ${playerCountry?.military.infantry} هزار نیروی پیاده و ${playerCountry?.military.armor} تانک فعال است. با توجه به سطح استحکامات مرزی (${playerCountry?.fortificationLevel}/3)، تحکیم مرزها ضریب دفع تهاجمات غافلگیرانه را تا ۲۵٪ دیگر افزایش خواهد داد.`
          : `Military Assessment: Standing force includes ${playerCountry?.military.infantry}k infantry, ${playerCountry?.military.armor} armor units, and ${playerCountry?.military.airForce} air wings. Strengthening border fortifications or mobilizing mechanized reserves is strongly advised.`;
        action = {
          type: 'recruit',
          title: isPersian ? 'بسیج یگان‌های مکانیزه زرهی' : 'Mobilize Armored Strike Brigades',
          description: isPersian ? 'تولید ۱۰۰ دستگاه تانک مدرن برای ارتقای توان تهاجمی' : 'Procure 100 main battle tanks for armored defense and breakthrough.',
          cost: 3200,
          parameters: { armor: 100 },
        };
      } else {
        fallbackText = isPersian
          ? `پایش راهبردی ستاد فرماندهی: کلیه کریدورهای حاکمیتی تحت نظارت قرار دارند. ثبات ملی ${playerCountry?.stability}٪ و ذخایر ارزی در وضعیت آماده‌باش عملیاتی هستند. توصیه می‌شود اولویت را بر پژوهش‌های علمی و تثبیت پیمان‌های تجاری متمرکز فرمایید.`
          : `Strategic Intelligence Summary: National borders secure. Stability at ${playerCountry?.stability}% with steady state reserves. Advise prioritizing combined arms doctrines and solidifying bilateral non-aggression treaties with regional powers.`;
      }

      const aiMsg: AIAdvisorMessage = {
        id: `ai_${Date.now()}`,
        sender: 'commander',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: action,
      };

      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-80 md:w-96 h-full bg-[#0b1220]/95 border-l border-sky-500/20 flex flex-col backdrop-blur-xl shadow-2xl z-20 overflow-hidden text-slate-200 text-xs font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-indigo-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-sky-500/20 to-indigo-500/30 border border-sky-400/40 rounded-xl shadow-inner">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>{isPersian ? 'فرمانده تاکتیکی هوش مصنوعی' : 'COMMANDER AI'}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-500/20 text-sky-300 border border-sky-400/30">
                PRO v3.8
              </span>
            </h2>
            <div className="text-[10px] text-slate-400">
              {isPersian ? 'مشاور ارشد استراتژیک و تحلیل‌گر دکترین ملی' : 'Geopolitical Intelligence & Strategic Advisor'}
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

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1">
              {msg.sender === 'commander' ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] font-bold text-sky-400">
                    {isPersian ? 'ستاد فرماندهی هوش مصنوعی' : 'COMMANDER AI'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold text-slate-400">
                    {isPersian ? 'فرمانده' : 'You'}
                  </span>
                  <User className="w-3.5 h-3.5 text-slate-400" />
                </>
              )}
              <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
            </div>

            <div
              className={`p-3 rounded-2xl max-w-[90%] leading-relaxed whitespace-pre-wrap text-[11px] shadow-md ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-br-none'
                  : 'bg-slate-900/90 border border-slate-700/70 text-slate-100 rounded-bl-none'
              }`}
            >
              {msg.text}

              {/* Actionable Proposal Card generated by AI */}
              {msg.suggestedAction && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/80 space-y-2">
                  <div className="font-bold text-amber-300 text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{msg.suggestedAction.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    {msg.suggestedAction.description}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-amber-400">
                      Cost: ${msg.suggestedAction.cost.toLocaleString()}M
                    </span>
                    <button
                      disabled={playerCountry?.treasury < msg.suggestedAction.cost}
                      onClick={() => {
                        sound.playClick(850, 0.04);
                        onExecuteSuggestedAction(msg.suggestedAction!);
                      }}
                      className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isPersian ? 'اجرای این تصمیم راهبردی' : 'Execute Proposed Action'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-900/80 border border-slate-700/60 rounded-2xl w-fit text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
            <span>{isPersian ? 'در حال پردازش داده‌های ژئوپلیتیک...' : 'Synthesizing strategic intel...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-900/70 overflow-x-auto flex gap-1.5 text-[10px]">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(isPersian ? qp.fa : qp.en)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg whitespace-nowrap transition-colors border border-slate-700/50"
          >
            {isPersian ? qp.fa : qp.en}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-700/60 bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={isPersian ? 'فرمان یا پرسش راهبردی خود را بنویسید...' : 'Input tactical directive or question...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-30 text-white rounded-xl transition-colors shadow-md shadow-sky-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
