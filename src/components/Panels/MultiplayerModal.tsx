import React, { useState } from 'react';
import { GameState, MultiplayerRoom, ChatMessage } from '../../types/game';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  Users, 
  Plus, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  Shield, 
  Globe2, 
  Copy, 
  Play 
} from 'lucide-react';

interface MultiplayerModalProps {
  gameState: GameState;
  onClose: () => void;
  isPersian: boolean;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  gameState,
  onClose,
  isPersian,
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'lobby' | 'chat'>('rooms');
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('modern_2026');

  // Active room state
  const [currentRoom, setCurrentRoom] = useState<MultiplayerRoom | null>(null);

  // Sample public rooms for discovery
  const [publicRooms, setPublicRooms] = useState<MultiplayerRoom[]>([
    {
      roomId: 'OB-7821',
      roomName: 'Eurasian Realignment 2026',
      hostId: 'usr_841',
      hostName: 'FieldMarshal_V',
      scenarioId: 'modern_2026',
      maxPlayers: 6,
      status: 'lobby',
      players: [
        { id: 'usr_841', displayName: 'FieldMarshal_V', countryId: '643', isReady: true, isHost: true },
        { id: 'usr_319', displayName: 'ApexGeneral', countryId: '156', isReady: true, isHost: false },
        { id: 'usr_502', displayName: 'EagleOne', countryId: '840', isReady: false, isHost: false },
      ]
    },
    {
      roomId: 'OB-4309',
      roomName: 'Persian Gulf Crucible - Fast Ticks',
      hostId: 'usr_991',
      hostName: 'Sovereign_IR',
      scenarioId: 'middle_east_crucible',
      maxPlayers: 4,
      status: 'lobby',
      players: [
        { id: 'usr_991', displayName: 'Sovereign_IR', countryId: '364', isReady: true, isHost: true },
        { id: 'usr_104', displayName: 'AnatolianStorm', countryId: '792', isReady: true, isHost: false },
      ]
    }
  ]);

  // Live Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'c1',
      senderId: 'sys',
      senderName: 'SYSTEM',
      channel: 'world',
      text: 'Global diplomatic chat server online. Strategic communiqués are monitored.',
      timestamp: '14:20'
    },
    {
      id: 'c2',
      senderId: 'usr_991',
      senderName: 'Sovereign_IR',
      senderCountryId: '364',
      channel: 'world',
      text: 'Seeking trade agreements on energy resources with Mediterranean powers.',
      timestamp: '14:22'
    },
    {
      id: 'c3',
      senderId: 'usr_841',
      senderName: 'FieldMarshal_V',
      senderCountryId: '643',
      channel: 'world',
      text: 'Non-aggression treaty proposed for Caspian corridor.',
      timestamp: '14:25'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatChannel, setChatChannel] = useState<'world' | 'alliance'>('world');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    sound.playClick(800, 0.04);
    const newRoom: MultiplayerRoom = {
      roomId: `OB-${Math.floor(1000 + Math.random() * 9000)}`,
      roomName: newRoomName.trim(),
      hostId: 'current_user',
      hostName: 'Supreme Commander (You)',
      scenarioId: selectedScenario,
      maxPlayers: 6,
      status: 'lobby',
      players: [
        {
          id: 'current_user',
          displayName: 'Supreme Commander (You)',
          countryId: gameState.playerCountryId,
          isReady: true,
          isHost: true,
        }
      ]
    };

    setPublicRooms(prev => [newRoom, ...prev]);
    setCurrentRoom(newRoom);
    setActiveTab('lobby');
    setNewRoomName('');
  };

  const handleJoinRoom = (room: MultiplayerRoom) => {
    sound.playClick(750, 0.04);
    const updated = {
      ...room,
      players: [
        ...room.players,
        {
          id: 'current_user',
          displayName: 'Supreme Commander (You)',
          countryId: gameState.playerCountryId,
          isReady: false,
          isHost: false,
        }
      ]
    };
    setCurrentRoom(updated);
    setActiveTab('lobby');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sound.playClick(600, 0.02);
    const pCountry = gameState.countries[gameState.playerCountryId];
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'current_user',
      senderName: 'You',
      senderCountryId: gameState.playerCountryId,
      channel: chatChannel,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#0b1220] border border-sky-500/30 rounded-2xl shadow-2xl flex flex-col h-[85vh] max-h-[700px] overflow-hidden text-slate-200 text-xs font-sans">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl">
              <Users className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{isPersian ? 'شبکه چندنفره آنلاین و لابی‌های زنده' : 'Multiplayer Command Center'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  SERVER ONLINE
                </span>
              </h2>
              <div className="text-[11px] text-slate-400">
                {isPersian ? 'نبرد زنده، همگام‌سازی اتاق‌ها و کانال گفتگوی بین‌الملل' : 'Real-time Synchronized Rooms, Lobby Matching & Diplomatic Comms'}
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
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-colors ${
              activeTab === 'rooms'
                ? 'bg-slate-800 text-sky-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isPersian ? 'لابی‌های عمومی' : 'Public Lobbies'}
          </button>

          {currentRoom && (
            <button
              onClick={() => setActiveTab('lobby')}
              className={`px-4 py-2 font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
                activeTab === 'lobby'
                  ? 'bg-slate-800 text-sky-400 border-t border-x border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{currentRoom.roomName}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-slate-800 text-sky-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isPersian ? 'ارتباطات و چت زنده' : 'Live Comms & Chat'}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {/* TAB 1: Public Rooms */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              {/* Create Room Form */}
              <form onSubmit={handleCreateRoom} className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder={isPersian ? 'نام اتاق جدید...' : 'Room Name...'}
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="flex-1 min-w-[200px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300"
                >
                  <option value="modern_2026">Modern World 2026</option>
                  <option value="middle_east_crucible">Crucible of West Asia</option>
                  <option value="global_hegemony">Global Hegemony</option>
                </select>
                <button
                  type="submit"
                  disabled={!newRoomName.trim()}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isPersian ? 'ایجاد اتاق جدید' : 'Create Room'}</span>
                </button>
              </form>

              {/* Room Discovery List */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300 flex items-center justify-between">
                  <span>{isPersian ? 'اتاق‌های فعال جهانی' : 'Available Active Lobbies'}</span>
                  <span className="text-[10px] text-slate-500">{publicRooms.length} rooms listed</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {publicRooms.map(room => (
                    <div
                      key={room.roomId}
                      className="p-3.5 bg-slate-900/90 border border-slate-700/60 hover:border-sky-500/40 rounded-xl space-y-3 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-100 text-sm">{room.roomName}</div>
                          <div className="text-[10px] text-slate-400">Host: {room.hostName} · Code: {room.roomId}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {room.players.length}/{room.maxPlayers} Players
                        </span>
                      </div>

                      {/* Player Slots preview */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {room.players.map(p => {
                          const country = gameState.countries[p.countryId];
                          return (
                            <span
                              key={p.id}
                              className="px-2 py-0.5 bg-slate-800 rounded-lg text-[10px] text-slate-300 flex items-center gap-1"
                            >
                              <span>{country?.flagEmoji || '🌐'}</span>
                              <span>{p.displayName}</span>
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className="text-[10px] text-slate-400">Scenario: {room.scenarioId}</span>
                        <button
                          onClick={() => handleJoinRoom(room)}
                          className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition-colors"
                        >
                          {isPersian ? 'پیوستن به اتاق' : 'Join Match'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Active Room Lobby */}
          {activeTab === 'lobby' && currentRoom && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/90 border border-sky-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-sky-400">{currentRoom.roomName}</h3>
                  <div className="text-slate-400 text-xs">
                    Room Code: <span className="font-mono text-white font-bold">{currentRoom.roomId}</span> · Scenario: {currentRoom.scenarioId}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentRoom.roomId);
                      sound.playClick(600, 0.03);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playRadarPing();
                      onClose();
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isPersian ? 'شروع هماهنگ نبرد' : 'Launch Campaign'}</span>
                  </button>
                </div>
              </div>

              {/* Player Slots */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300">{isPersian ? 'فهرست فرماندهان حاضر در اتاق' : 'Active Room Command Roster'}</div>
                <div className="space-y-2">
                  {currentRoom.players.map(p => {
                    const country = gameState.countries[p.countryId];
                    return (
                      <div
                        key={p.id}
                        className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{country?.flagEmoji || '🌐'}</span>
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-2">
                              <span>{p.displayName}</span>
                              {p.isHost && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-bold">
                                  HOST
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Assigned Sovereign: <span className="text-sky-300 font-semibold">{country?.name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                            p.isReady ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            <CheckCircle2 className="w-3 h-3" />
                            {p.isReady ? 'READY' : 'WAITING'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Global Live Chat */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col space-y-3">
              {/* Channel Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setChatChannel('world')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    chatChannel === 'world' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isPersian ? 'کانال بین‌الملل' : 'World Channel'}
                </button>
                <button
                  onClick={() => setChatChannel('alliance')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    chatChannel === 'alliance' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isPersian ? 'کانال ائتلاف' : 'Alliance Channel'}
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl p-3 overflow-y-auto space-y-2">
                {messages.map(m => {
                  const country = m.senderCountryId ? gameState.countries[m.senderCountryId] : null;
                  return (
                    <div key={m.id} className="p-2 bg-slate-900/60 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-sky-400 flex items-center gap-1">
                          {country && <span>{country.flagEmoji}</span>}
                          <span>{m.senderName}</span>
                        </span>
                        <span className="font-mono text-[9px]">{m.timestamp}</span>
                      </div>
                      <div className="text-slate-200">{m.text}</div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  placeholder={isPersian ? 'ارسال پیام به کانال راهبردی...' : 'Transmit communiqué...'}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold rounded-xl flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit</span>
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
