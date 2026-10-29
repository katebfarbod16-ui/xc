import React, { useState } from 'react';
import { MultiplayerRoom, SupportedLanguage, CountryData } from '../../types/game';
import { 
  Users, 
  Globe, 
  Plus, 
  Play, 
  CheckCircle, 
  Clock, 
  Shield, 
  MessageSquare, 
  Send, 
  X,
  Wifi,
  Lock,
  Unlock
} from 'lucide-react';
import { sound } from '../../simulation/soundEngine';

interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  countries: Record<string, CountryData>;
  onJoinGame?: (room: MultiplayerRoom) => void;
}

const INITIAL_ROOMS: MultiplayerRoom[] = [
  {
    roomId: 'room_001',
    roomName: 'Middle East Flashpoint 2026 [Competitive]',
    hostId: 'usr_iran_chief',
    hostName: 'General_Tehran',
    scenarioId: 'modern_2026',
    maxPlayers: 6,
    players: [
      { id: 'usr_iran_chief', displayName: 'General_Tehran', countryId: '364', isReady: true, isHost: true },
      { id: 'usr_turk', displayName: 'Ottoman_Strategist', countryId: '792', isReady: true, isHost: false },
      { id: 'usr_arab', displayName: 'Desert_Falcon', countryId: '682', isReady: false, isHost: false },
    ],
    status: 'lobby',
  },
  {
    roomId: 'room_002',
    roomName: 'Global Cold War II — Alliances Enabled',
    hostId: 'usr_red',
    hostName: 'Marshal_Eurasia',
    scenarioId: 'modern_2026',
    maxPlayers: 8,
    players: [
      { id: 'usr_red', displayName: 'Marshal_Eurasia', countryId: '643', isReady: true, isHost: true },
      { id: 'usr_dragon', displayName: 'Eastern_Dragon', countryId: '156', isReady: true, isHost: false },
      { id: 'usr_eagle', displayName: 'Global_Watch', countryId: '840', isReady: true, isHost: false },
      { id: 'usr_euro', displayName: 'Europa_Shield', countryId: '276', isReady: false, isHost: false },
    ],
    status: 'lobby',
  },
  {
    roomId: 'room_003',
    roomName: 'Custom Genesis — Free For All (Speed: Fast)',
    hostId: 'usr_genesis',
    hostName: 'Genesis_Builder',
    scenarioId: 'custom_genesis',
    maxPlayers: 4,
    players: [
      { id: 'usr_genesis', displayName: 'Genesis_Builder', countryId: '364', isReady: true, isHost: true },
    ],
    status: 'lobby',
  },
];

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  isOpen,
  onClose,
  language,
  countries,
  onJoinGame,
}) => {
  const [rooms, setRooms] = useState<MultiplayerRoom[]>(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');

  // Create room state
  const [newRoomName, setNewRoomName] = useState('');
  const [newMaxPlayers, setNewMaxPlayers] = useState(6);
  const [newScenario, setNewScenario] = useState('modern_2026');

  // Room chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'General_Tehran', text: 'Welcome commanders! Select your sovereign country and press Ready.', time: '14:20' },
    { sender: 'Ottoman_Strategist', text: 'Turkey forces mobilized. Awaiting host confirmation.', time: '14:22' },
  ]);
  const [chatInput, setChatInput] = useState('');

  if (!isOpen) return null;

  const isFa = language === 'fa' || language === 'ar';
  const activeRoom = rooms.find(r => r.roomId === activeRoomId);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const newRoom: MultiplayerRoom = {
      roomId: `room_${Date.now()}`,
      roomName: newRoomName.trim(),
      hostId: 'usr_player',
      hostName: 'Supreme_President',
      scenarioId: newScenario,
      maxPlayers: newMaxPlayers,
      players: [
        { id: 'usr_player', displayName: 'Supreme_President', countryId: '364', isReady: true, isHost: true },
      ],
      status: 'lobby',
    };

    setRooms([newRoom, ...rooms]);
    setActiveRoomId(newRoom.roomId);
    setActiveTab('browse');
    sound.playTriumph();
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        sender: 'You',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
    sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden font-sans text-slate-100"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/40 text-blue-400">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
                <span>{isFa ? 'لابی و مسابقات آنلاین چند نفره (Multiplayer)' : 'Online Multiplayer Battles & Alliances'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  <span>{isFa ? 'سرور فعال' : 'ONLINE'}</span>
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isFa 
                  ? 'ساخت لابی، عضویت در ائتلاف‌های آنلاین و نبرد همزمان استراتژیک با سایر بازیکنان'
                  : 'Host or join tactical game rooms, negotiate military pacts, and clash in real-time'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeRoomId && (
              <button
                onClick={() => setActiveRoomId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                {isFa ? '← بازگشت به لیست لابی‌ها' : '← Back to Room List'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Room View or Lobby List */}
        {!activeRoom ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-4 px-6 pt-4 border-b border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setActiveTab('browse')}
                className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
                  activeTab === 'browse'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{isFa ? 'مشاهده لابی‌های فعال جهان' : 'Public Rooms Browser'}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px]">
                  {rooms.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('create')}
                className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{isFa ? 'ساخت اتاق / گروه اختصاصی' : 'Create Custom Room'}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'browse' ? (
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div
                      key={room.roomId}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-bold text-sm text-white">{room.roomName}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                            {room.scenarioId === 'modern_2026' ? '2026 Modern War' : 'Custom Genesis'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-4">
                          <span>{isFa ? `میزبان: ${room.hostName}` : `Host: ${room.hostName}`}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Wifi className="w-3 h-3" /> 24ms
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-1 text-xs font-mono text-slate-300">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{room.players.length} / {room.maxPlayers}</span>
                        </div>

                        <button
                          onClick={() => {
                            setActiveRoomId(room.roomId);
                            sound.playClick();
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-blue-950/50"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isFa ? 'ورود به اتاق' : 'Join Room'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Create Room Form */
                <form onSubmit={handleCreateRoom} className="max-w-xl mx-auto space-y-4 p-6 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <h3 className="font-bold text-base text-white">
                    {isFa ? 'مشخصات اتاق جدید' : 'New Match Configuration'}
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">
                      {isFa ? 'نام اتاق یا عنوان نبرد:' : 'Room Title:'}
                    </label>
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder={isFa ? 'مثال: نبرد قدرت‌های جهانی ۲۰۲۶' : 'e.g. World War III Strategy Summit'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 block">
                        {isFa ? 'سناریوی بازی:' : 'Scenario Mode:'}
                      </label>
                      <select
                        value={newScenario}
                        onChange={(e) => setNewScenario(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      >
                        <option value="modern_2026">{isFa ? 'جهان معاصر ۲۰۲۶' : 'Modern World 2026'}</option>
                        <option value="custom_genesis">{isFa ? 'پیدایش از صفر (Genesis)' : 'Custom Genesis (From Scratch)'}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 block">
                        {isFa ? 'حداکثر بازیکنان:' : 'Max Players:'}
                      </label>
                      <select
                        value={newMaxPlayers}
                        onChange={(e) => setNewMaxPlayers(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      >
                        <option value={2}>2 Players (Duel)</option>
                        <option value={4}>4 Players (Small Group)</option>
                        <option value={6}>6 Players (Medium Flashpoint)</option>
                        <option value={8}>8 Players (World War)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-950/40"
                  >
                    {isFa ? 'ایجاد اتاق و ورود به لابی' : 'Create Room & Open Lobby'}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Inside Active Room */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Players Roster */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5 border-b md:border-b-0 md:border-r border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{activeRoom.roomName}</h3>
                  <span className="text-xs text-slate-400">
                    {isFa ? 'اعضای حاضر در لابی نبرد:' : 'Assigned Sovereign Commanders:'}
                  </span>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-800 text-xs font-mono text-slate-300">
                  {activeRoom.players.length} / {activeRoom.maxPlayers}
                </div>
              </div>

              {/* Player Slots */}
              <div className="space-y-2.5">
                {activeRoom.players.map((p, idx) => {
                  const country = countries[p.countryId];
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{country?.flagEmoji || '🏳️'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{p.displayName}</span>
                            {p.isHost && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                {isFa ? 'میزبان' : 'HOST'}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {isFa ? country?.nameFa : country?.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.isReady ? (
                          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {isFa ? 'آماده' : 'Ready'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {isFa ? 'در حال انتخاب...' : 'Selecting...'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Start Game Action */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => sound.playClick()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-950/40"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isFa ? 'اعلام آمادگی (Ready)' : 'Toggle Ready'}</span>
                </button>

                <button
                  onClick={() => {
                    sound.playWarAlert();
                    if (onJoinGame) onJoinGame(activeRoom);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-2 shadow-lg shadow-blue-950/50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isFa ? 'آغاز شبیه‌سازی آنلاین' : 'Launch Simulation'}</span>
                </button>
              </div>
            </div>

            {/* Right: In-Lobby Tactical Chat */}
            <div className="w-full md:w-80 bg-slate-950/80 flex flex-col h-72 md:h-auto border-t md:border-t-0 border-slate-800">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 text-xs font-bold text-slate-300">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>{isFa ? 'چت و هماهنگی ائتلاف' : 'Tactical Comms'}</span>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                {chatMessages.map((msg, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 space-y-0.5">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span className="font-bold text-blue-400">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="text-slate-200">{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-slate-800 flex items-center gap-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isFa ? 'پیام برای فرماندهان...' : 'Type tactical cable...'}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
