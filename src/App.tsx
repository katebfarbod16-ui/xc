/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameState, 
  MapMode, 
  GameSpeed, 
  MilitaryUnits, 
  AIAdvisorMessage, 
  Alliance, 
  UserProfile,
  SupportedLanguage,
  AttackType,
  ConstructionQueueItem,
  UNResolution,
  CountryData,
  SpyMissionType,
  NewsBroadcast
} from './types/game';
import { 
  createInitialGameState, 
  runSimulationTick, 
  resolveCombat,
  startSpyMission,
  expandSpyNetwork,
  issueWarBonds,
  createNewsBroadcast
} from './simulation/gameEngine';
import { sound } from './simulation/soundEngine';
import { 
  getUserProfile, 
  saveUserProfile, 
  saveGame, 
  loadGame, 
  getSavedGamesList 
} from './simulation/storage';
import { TECHNOLOGIES } from './data/technologies';
import { TRANSLATIONS } from './data/translations';

// Components
import { WorldMap } from './components/Map/WorldMap';
import { TopBar } from './components/HUD/TopBar';
import { MainMenu } from './components/Panels/MainMenu';
import { CountryOverview } from './components/Panels/CountryOverview';
import { EconomyPanel } from './components/Panels/EconomyPanel';
import { MilitaryPanel } from './components/Panels/MilitaryPanel';
import { DiplomacyPanel } from './components/Panels/DiplomacyPanel';
import { ResearchPanel } from './components/Panels/ResearchPanel';
import { CommanderAIPanel } from './components/Panels/CommanderAIPanel';
import { GlobalActivityFeed } from './components/Panels/GlobalActivityFeed';
import { UNModal } from './components/Panels/UNModal';
import { MultiplayerLobbyModal } from './components/Multiplayer/MultiplayerLobbyModal';
import { AlliancesModal } from './components/Panels/AlliancesModal';
import { ProfileModal } from './components/Panels/ProfileModal';
import { SaveLoadModal } from './components/Panels/SaveLoadModal';
import { NotificationsModal } from './components/Panels/NotificationsModal';
import { SpyNetworkModal } from './components/Panels/SpyNetworkModal';
import { NewsBroadcastModal } from './components/HUD/NewsBroadcastModal';

// Icons for Left Navigation Dock
import { 
  Globe2, 
  Coins, 
  Swords, 
  Handshake, 
  FlaskConical, 
  Layers, 
  Users, 
  Save, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Radio,
  Landmark,
  Bell
} from 'lucide-react';

export default function App() {
  const [inGame, setInGame] = useState(false);
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [jumpCountryId, setJumpCountryId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('political');
  
  // Drawers and Modals
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'country' | 'economy' | 'military' | 'diplomacy' | 'research' | 'commander'>('none');
  const [activeModal, setActiveModal] = useState<'none' | 'multiplayer' | 'alliances' | 'profile' | 'saves' | 'notifications' | 'globalFeed' | 'un'>('none');
  
  // Settings & Profile
  const [profile, setProfile] = useState<UserProfile>(() => getUserProfile());
  const [language, setLanguage] = useState<SupportedLanguage>(() => (profile.preferredLanguage as SupportedLanguage) || 'fa');
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  const isPersian = language === 'fa';
  const isRTL = language === 'fa' || language === 'ar';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Check if any save exists for the Continue button
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    const list = getSavedGamesList();
    setHasSavedGame(list.length > 0);
  }, [inGame]);

  // Simulation Clock Runner
  useEffect(() => {
    if (!inGame || gameState.isPaused || gameState.speed === 0) return;

    const intervalMs = gameState.speed === 1 ? 1200 : gameState.speed === 2 ? 600 : 250;

    const timer = setInterval(() => {
      setGameState(prevState => runSimulationTick(prevState));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [inGame, gameState.isPaused, gameState.speed]);

  // Periodic Auto-Save (Every 60 seconds)
  useEffect(() => {
    if (!inGame) return;
    const autoSaveTimer = setInterval(() => {
      saveGame(gameState, 'autosave');
    }, 60000);
    return () => clearInterval(autoSaveTimer);
  }, [inGame, gameState]);

  // Keyboard Shortcuts (Space: Pause, 1-3: Speed, M: Map Mode, C: Commander, G: Feed, U: UN, Esc: Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
      } else if (e.key === '1') {
        setSpeed(1);
      } else if (e.key === '2') {
        setSpeed(2);
      } else if (e.key === '3') {
        setSpeed(3);
      } else if (e.key.toLowerCase() === 'c') {
        toggleDrawer('commander');
      } else if (e.key.toLowerCase() === 'g') {
        toggleModal('globalFeed');
      } else if (e.key.toLowerCase() === 'u') {
        toggleModal('un');
      } else if (e.key.toLowerCase() === 'm') {
        cycleMapMode();
      } else if (e.key === 'Escape') {
        closeAllOverlays();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inGame, activeDrawer, activeModal]);

  const togglePause = () => {
    sound.playClick(600, 0.03);
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const setSpeed = (speed: GameSpeed) => {
    sound.playClick(700, 0.03);
    setGameState(prev => ({ ...prev, speed, isPaused: false }));
  };

  const cycleMapMode = () => {
    const modes: MapMode[] = ['political', 'economic', 'military', 'diplomatic', 'population', 'resources', 'alliance'];
    const nextIdx = (modes.indexOf(mapMode) + 1) % modes.length;
    setMapMode(modes[nextIdx]);
  };

  const closeAllOverlays = () => {
    setActiveDrawer('none');
    setActiveModal('none');
  };

  const toggleDrawer = (drawer: typeof activeDrawer) => {
    sound.playClick(650, 0.03);
    setActiveDrawer(prev => (prev === drawer ? 'none' : drawer));
  };

  const toggleModal = (modal: typeof activeModal) => {
    sound.playClick(700, 0.03);
    setActiveModal(prev => (prev === modal ? 'none' : modal));
  };

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    const updated = { ...profile, preferredLanguage: lang };
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  // Start New Game Handler
  const handleStartNewGame = (
    scenarioId: string, 
    playerCountryId: string, 
    difficulty: 'Casual' | 'Strategist' | 'Grand Master',
    customCountryData?: Partial<CountryData>
  ) => {
    const newState = createInitialGameState(scenarioId, playerCountryId, difficulty);
    if (customCountryData && newState.countries[playerCountryId]) {
      newState.countries[playerCountryId] = {
        ...newState.countries[playerCountryId],
        ...customCountryData,
      };
    }
    setGameState(newState);
    setSelectedCountryId(playerCountryId);
    setJumpCountryId(playerCountryId);
    setInGame(true);
    closeAllOverlays();
  };

  // Continue Game Handler
  const handleContinueGame = () => {
    const saves = getSavedGamesList();
    if (saves.length > 0) {
      const loaded = loadGame(saves[0].id);
      if (loaded) {
        setGameState(loaded);
        setSelectedCountryId(loaded.playerCountryId);
        setJumpCountryId(loaded.playerCountryId);
        setInGame(true);
        closeAllOverlays();
      }
    }
  };

  // Country Selection from Map
  const handleSelectCountry = (countryId: string) => {
    setSelectedCountryId(countryId);
    setActiveDrawer('country');
  };

  // Jump camera directly to country from Global Activity Feed
  const handleJumpToCountry = (countryId: string) => {
    setJumpCountryId(countryId);
    setSelectedCountryId(countryId);
    setActiveModal('none');
    setActiveDrawer('country');
  };

  // Military & Economic Actions
  const handleSetTaxRate = (rate: number) => {
    setGameState(prev => {
      const p = prev.countries[prev.playerCountryId];
      if (!p) return prev;
      p.taxRate = rate;
      return { ...prev };
    });
  };

  const handleBuildInfrastructure = () => {
    sound.playTriumph();
    setGameState(prev => {
      const p = prev.countries[prev.playerCountryId];
      if (!p) return prev;
      const cost = p.infrastructureLevel * 4500;
      if (p.treasury < cost) return prev;
      p.treasury -= cost;
      prev.constructionQueue.push({
        id: `const_infra_${Date.now()}`,
        type: 'infrastructure',
        name: `National Infrastructure Expansion Level ${p.infrastructureLevel + 1}`,
        nameFa: `ارتقای زیرساخت‌های ملی به سطح ${p.infrastructureLevel + 1}`,
        countryId: p.id,
        cost,
        progressDays: 0,
        totalDays: 30,
      });
      return { ...prev };
    });
  };

  const handleBuildFortification = () => {
    sound.playTriumph();
    setGameState(prev => {
      const p = prev.countries[prev.playerCountryId];
      if (!p) return prev;
      const cost = 3500;
      if (p.treasury < cost) return prev;
      p.treasury -= cost;
      prev.constructionQueue.push({
        id: `const_fort_${Date.now()}`,
        type: 'fortification',
        name: `Border Fortifications Tier ${p.fortificationLevel + 1}`,
        nameFa: `تحکیم استحکامات دفاعی مرزی سطح ${p.fortificationLevel + 1}`,
        countryId: p.id,
        cost,
        progressDays: 0,
        totalDays: 25,
      });
      return { ...prev };
    });
  };

  // Construction of Strategic Buildings & Cities
  const handleBuildStructure = (
    type: ConstructionQueueItem['type'], 
    name: string, 
    nameFa: string, 
    cost: number, 
    days: number,
    extraData?: Record<string, any>
  ) => {
    sound.playTriumph();
    setGameState(prev => {
      const p = prev.countries[prev.playerCountryId];
      if (!p || p.treasury < cost) return prev;
      p.treasury -= cost;
      prev.constructionQueue.push({
        id: `const_${type}_${Date.now()}`,
        type,
        name,
        nameFa,
        countryId: p.id,
        cost,
        progressDays: 0,
        totalDays: days,
        extraData,
      });
      return { ...prev };
    });
  };

  const handleRecruitUnits = (units: Partial<MilitaryUnits>, cost: number, days: number) => {
    sound.playClick(800, 0.04);
    setGameState(prev => {
      const p = prev.countries[prev.playerCountryId];
      if (!p || p.treasury < cost) return prev;
      p.treasury -= cost;
      prev.militaryOrders.push({
        id: `ord_rec_${Date.now()}`,
        type: 'recruit',
        sourceCountryId: p.id,
        units,
        progressDays: 0,
        totalDays: days,
        cost,
      });
      return { ...prev };
    });
  };

  const handleStartResearch = (techId: string) => {
    sound.playClick(800, 0.04);
    const tech = TECHNOLOGIES.find(t => t.id === techId);
    if (!tech) return;

    setGameState(prev => {
      const p = prev.countries[prev.playerCountryId];
      if (!p || p.treasury < tech.cost) return prev;
      p.treasury -= tech.cost;
      prev.activeResearch[p.id] = {
        techId,
        progressDays: 0,
        totalDays: tech.durationDays,
      };
      return { ...prev };
    });
  };

  // Diplomatic Actions
  const handleDeclareWar = (targetId: string) => {
    sound.playWarAlert();
    setGameState(prev => {
      const pId = prev.playerCountryId;
      if (!prev.diplomacy[pId]) prev.diplomacy[pId] = {};
      if (!prev.diplomacy[targetId]) prev.diplomacy[targetId] = {};

      prev.diplomacy[pId][targetId] = {
        opinion: -100,
        status: 'at_war',
        hasTradeAgreement: false,
        isSanctioned: true,
      };
      prev.diplomacy[targetId][pId] = {
        opinion: -100,
        status: 'at_war',
        hasTradeAgreement: false,
        isSanctioned: true,
      };

      const attacker = prev.countries[pId];
      const defender = prev.countries[targetId];

      prev.events.unshift({
        id: `evt_war_${Date.now()}`,
        date: prev.currentDate,
        type: 'military',
        title: `War Declared on ${defender?.name}!`,
        titleFa: `اعلان جنگ رسمی علیه ${defender?.nameFa}!`,
        description: `${attacker?.name} has declared war against ${defender?.name}. Mobilize standing armed forces!`,
        descriptionFa: `${attacker?.nameFa} علیه ${defender?.nameFa} اعلام جنگ کرد. یگان‌های ارتش به حالت آماده‌باش کامل درآمدند.`,
        severity: 'alert',
        primaryCountryId: pId,
        targetCountryId: targetId,
      });

      return { ...prev };
    });
  };

  // Launch Attack with 5 specialized doctrines, troop/missile commitments, and animated missile trajectories
  const handleLaunchAttack = (
    targetId: string, 
    attackType: AttackType, 
    troopCommitment?: number, 
    missileCommitment?: number
  ) => {
    if (attackType === 'missile_strike') {
      sound.playWarAlert();
    } else if (attackType === 'covert_sabotage') {
      sound.playClick(900, 0.05);
    } else {
      sound.playExplosion();
    }

    setGameState(prev => {
      const attacker = prev.countries[prev.playerCountryId];
      const defender = prev.countries[targetId];
      if (!attacker || !defender) return prev;

      // Deduct missiles & spawn animated ballistic trajectory on map
      if (attackType === 'missile_strike') {
        const count = missileCommitment || 25;
        attacker.military.missiles = Math.max(0, (attacker.military.missiles || 0) - count);
        if (!prev.activeStrikes) prev.activeStrikes = [];
        prev.activeStrikes.push({
          id: `strike_player_${Date.now()}`,
          attackerId: attacker.id,
          targetId: defender.id,
          fromCoords: attacker.capitalCoordinates || [51.38, 35.68],
          toCoords: defender.capitalCoordinates || [44.36, 33.31],
          count,
          attackType: 'missile_strike',
          startTime: Date.now(),
          durationMs: 3800,
          isHostileToPlayer: false,
        });
      }

      const report = resolveCombat(attacker, defender, prev, attackType);
      prev.battleReports.unshift(report);

      prev.events.unshift({
        id: `evt_offensive_${Date.now()}`,
        date: prev.currentDate,
        type: attackType === 'covert_sabotage' ? 'covert' : 'military',
        title: `Operation Against ${defender.name}`,
        titleFa: `عملیات راهبردی در قلمرو ${defender.nameFa}`,
        description: report.summary,
        descriptionFa: report.summaryFa,
        severity: report.result.includes('victory') ? 'triumph' : 'alert',
        primaryCountryId: attacker.id,
        targetCountryId: defender.id,
      });

      return { ...prev };
    });
  };

  const handleOfferAlliance = (targetId: string) => {
    sound.playTriumph();
    setGameState(prev => {
      const pId = prev.playerCountryId;
      if (prev.diplomacy[pId]?.[targetId]) {
        prev.diplomacy[pId][targetId].status = 'allied';
        prev.diplomacy[pId][targetId].opinion = Math.min(100, prev.diplomacy[pId][targetId].opinion + 30);
        prev.diplomacy[pId][targetId].hasTradeAgreement = true;
      }
      if (prev.diplomacy[targetId]?.[pId]) {
        prev.diplomacy[targetId][pId].status = 'allied';
        prev.diplomacy[targetId][pId].opinion = Math.min(100, prev.diplomacy[targetId][pId].opinion + 30);
        prev.diplomacy[targetId][pId].hasTradeAgreement = true;
      }

      const other = prev.countries[targetId];
      prev.events.unshift({
        id: `evt_allied_${Date.now()}`,
        date: prev.currentDate,
        type: 'diplomatic',
        title: `Alliance Treaty Formed`,
        titleFa: `امضای پیمان اتحاد راهبردی`,
        description: `Mutual defense agreement and trade partnership established with ${other?.name}.`,
        descriptionFa: `پیمان دفاع مشترک و همکاری‌های تجاری با ${other?.nameFa} با موفقیت امضا شد.`,
        severity: 'triumph',
        primaryCountryId: pId,
        targetCountryId: targetId,
      });

      return { ...prev };
    });
  };

  const handleOfferPact = (targetId: string) => {
    sound.playClick(800, 0.04);
    setGameState(prev => {
      const pId = prev.playerCountryId;
      if (prev.diplomacy[pId]?.[targetId]) {
        prev.diplomacy[pId][targetId].status = 'non_aggression';
        prev.diplomacy[pId][targetId].opinion = Math.min(100, prev.diplomacy[pId][targetId].opinion + 15);
      }
      if (prev.diplomacy[targetId]?.[pId]) {
        prev.diplomacy[targetId][pId].status = 'non_aggression';
        prev.diplomacy[targetId][pId].opinion = Math.min(100, prev.diplomacy[targetId][pId].opinion + 15);
      }
      return { ...prev };
    });
  };

  const handleOfferTrade = (targetId: string) => {
    sound.playClick(800, 0.04);
    setGameState(prev => {
      const pId = prev.playerCountryId;
      if (prev.diplomacy[pId]?.[targetId]) prev.diplomacy[pId][targetId].hasTradeAgreement = true;
      if (prev.diplomacy[targetId]?.[pId]) prev.diplomacy[targetId][pId].hasTradeAgreement = true;
      return { ...prev };
    });
  };

  const handleSendAid = (targetId: string, amount: number) => {
    sound.playTriumph();
    setGameState(prev => {
      const p = prev.countries[prev.playerCountryId];
      const target = prev.countries[targetId];
      if (!p || !target || p.treasury < amount) return prev;
      p.treasury -= amount;
      target.treasury += amount;

      const pId = prev.playerCountryId;
      if (prev.diplomacy[pId]?.[targetId]) {
        prev.diplomacy[pId][targetId].opinion = Math.min(100, prev.diplomacy[pId][targetId].opinion + 25);
      }
      if (prev.diplomacy[targetId]?.[pId]) {
        prev.diplomacy[targetId][pId].opinion = Math.min(100, prev.diplomacy[targetId][pId].opinion + 25);
      }
      return { ...prev };
    });
  };

  const handleProposePeace = (targetId: string) => {
    sound.playTriumph();
    setGameState(prev => {
      const pId = prev.playerCountryId;
      if (prev.diplomacy[pId]?.[targetId]) {
        prev.diplomacy[pId][targetId].status = 'neutral';
        prev.diplomacy[pId][targetId].opinion = -20;
      }
      if (prev.diplomacy[targetId]?.[pId]) {
        prev.diplomacy[targetId][pId].status = 'neutral';
        prev.diplomacy[targetId][pId].opinion = -20;
      }
      return { ...prev };
    });
  };

  // UN Security Council Voting & Resolution drafting
  const handleVoteResolution = (resolutionId: string, vote: 'for' | 'against' | 'abstain') => {
    sound.playClick(750, 0.04);
    setGameState(prev => {
      const res = prev.unResolutions.find(r => r.id === resolutionId);
      if (!res || res.status !== 'active_session') return prev;
      const playerId = prev.playerCountryId;
      res.votesFor = res.votesFor.filter(id => id !== playerId);
      res.votesAgainst = res.votesAgainst.filter(id => id !== playerId);
      res.votesAbstain = res.votesAbstain.filter(id => id !== playerId);
      if (vote === 'for') res.votesFor.push(playerId);
      else if (vote === 'against') res.votesAgainst.push(playerId);
      else res.votesAbstain.push(playerId);
      return { ...prev };
    });
  };

  const handleProposeResolution = (res: UNResolution) => {
    sound.playTriumph();
    setGameState(prev => {
      prev.unResolutions.unshift(res);
      prev.events.unshift({
        id: `evt_un_${Date.now()}`,
        date: prev.currentDate,
        type: 'un',
        title: `UN Resolution Proposed: ${res.title}`,
        titleFa: `طرح قطعنامه جدید: ${res.titleFa}`,
        description: `${res.description}`,
        descriptionFa: `${res.descriptionFa}`,
        severity: 'info',
        primaryCountryId: res.proposerCountryId,
      });
      return { ...prev };
    });
  };

  // Execution of Tactical Actions Proposed by COMMANDER AI
  const handleExecuteSuggestedAction = (action: NonNullable<AIAdvisorMessage['suggestedAction']>) => {
    if (action.type === 'recruit' && action.parameters) {
      handleRecruitUnits(action.parameters, action.cost, 20);
    } else if (action.type === 'build_infra') {
      handleBuildInfrastructure();
    } else if (action.type === 'tax_reform') {
      handleSetTaxRate(0.28);
    }
    sound.playTriumph();
  };

  // Create Custom Alliance
  const handleCreateAlliance = (alliance: Alliance) => {
    setGameState(prev => {
      prev.alliances[alliance.id] = alliance;
      if (prev.countries[prev.playerCountryId]) {
        prev.countries[prev.playerCountryId].allianceId = alliance.id;
      }
      return { ...prev };
    });
  };

  // Navigation Items
  const navItems = [
    { id: 'overview', label: 'Country Overview', labelFa: 'اطلاعات کشور', icon: Globe2, action: () => toggleDrawer('country') },
    { id: 'economy', label: 'Economy & Budget', labelFa: 'اقتصاد و مالیات', icon: Coins, action: () => toggleDrawer('economy') },
    { id: 'military', label: 'High Command', labelFa: 'ستاد نیروهای مسلح', icon: Swords, action: () => toggleDrawer('military') },
    { id: 'diplomacy', label: 'Diplomacy Ledger', labelFa: 'دیپلماسی و پیمان‌ها', icon: Handshake, action: () => toggleDrawer('diplomacy') },
    { id: 'research', label: 'R&D Tech Tree', labelFa: 'مرکز تحقیقات و علم', icon: FlaskConical, action: () => toggleDrawer('research') },
    { id: 'globalFeed', label: 'Global Live Feed', labelFa: 'رصد ماهواره‌ای جهان', icon: Radio, action: () => toggleModal('globalFeed') },
    { id: 'un', label: 'UN Assembly', labelFa: 'مجمع عمومی ملل', icon: Landmark, action: () => toggleModal('un') },
    { id: 'alliances', label: 'Power Blocs', labelFa: 'بلوک‌های بین‌المللی', icon: Layers, action: () => toggleModal('alliances') },
    { id: 'multiplayer', label: 'Multiplayer Hub', labelFa: 'لابی‌های چندنفره', icon: Users, action: () => toggleModal('multiplayer') },
    { id: 'saves', label: 'Save / Load', labelFa: 'ذخیره و بارگذاری', icon: Save, action: () => toggleModal('saves') },
  ];

  const selectedCountryData = selectedCountryId ? gameState.countries[selectedCountryId] : null;

  return (
    <div 
      className={`relative w-screen h-screen overflow-hidden bg-[#070b14] flex flex-col font-sans select-none ${
        isPersian ? 'font-vazirmatn' : ''
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. Main Menu View */}
      {!inGame && (
        <MainMenu
          hasSavedGame={hasSavedGame}
          onContinueGame={handleContinueGame}
          onStartNewGame={handleStartNewGame}
          onOpenSaves={() => toggleModal('saves')}
          onOpenMultiplayer={() => toggleModal('multiplayer')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          language={language}
          onSelectLanguage={handleSelectLanguage}
        />
      )}

      {/* 2. Active Strategy Game View */}
      {inGame && (
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
          {/* Top HUD Bar */}
          <TopBar
            gameState={gameState}
            onSetSpeed={setSpeed}
            onTogglePause={togglePause}
            onOpenCommanderAI={() => toggleDrawer('commander')}
            onOpenGlobalFeed={() => toggleModal('globalFeed')}
            onOpenUN={() => toggleModal('un')}
            onOpenProfile={() => toggleModal('profile')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            language={language}
            onSelectLanguage={handleSelectLanguage}
            unreadNotificationsCount={gameState.events.length}
          />

          {/* Core Command Field & Map Viewport */}
          <div className="flex-1 relative flex overflow-hidden">
            
            {/* Left Strategic Command Navigation Dock */}
            <aside 
              className={`h-full bg-[#0b1220]/95 border-r border-sky-500/20 backdrop-blur-md flex flex-col justify-between transition-all duration-300 z-20 shadow-2xl ${
                isNavCollapsed ? 'w-14' : 'w-52'
              }`}
            >
              <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = 
                    (item.id === 'overview' && activeDrawer === 'country') ||
                    (item.id === 'economy' && activeDrawer === 'economy') ||
                    (item.id === 'military' && activeDrawer === 'military') ||
                    (item.id === 'diplomacy' && activeDrawer === 'diplomacy') ||
                    (item.id === 'research' && activeDrawer === 'research') ||
                    (item.id === 'globalFeed' && activeModal === 'globalFeed') ||
                    (item.id === 'un' && activeModal === 'un');

                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      title={isPersian ? item.labelFa : item.label}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isNavCollapsed && (
                        <span className="truncate">{isPersian ? item.labelFa : item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Dock Controls */}
              <div className="p-2 border-t border-slate-800 space-y-1">
                <button
                  onClick={() => toggleDrawer('commander')}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-sky-600/30 to-indigo-600/30 hover:from-sky-600/50 hover:to-indigo-600/50 border border-sky-400/40 rounded-xl text-sky-300 font-bold text-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
                  {!isNavCollapsed && (
                    <span className="truncate">{isPersian ? 'دستیار تاکتیکی AI' : 'COMMANDER AI'}</span>
                  )}
                </button>

                <button
                  onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                  className="w-full py-1.5 flex items-center justify-center text-slate-500 hover:text-slate-300 rounded-lg text-xs"
                >
                  {isNavCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              </div>
            </aside>

            {/* Central World Map Viewport */}
            <main className="flex-1 relative w-full h-full overflow-hidden bg-[#070b14]">
              <WorldMap
                gameState={gameState}
                selectedCountryId={selectedCountryId}
                jumpCountryId={jumpCountryId}
                onSelectCountry={handleSelectCountry}
                mapMode={mapMode}
                onSetMapMode={setMapMode}
                language={language}
                onLaunchAttack={handleLaunchAttack}
                onBuildStructure={handleBuildStructure}
              />
            </main>

            {/* Context-Sensitive Right Drawers */}
            {activeDrawer === 'country' && selectedCountryData && (
              <CountryOverview
                country={selectedCountryData}
                gameState={gameState}
                onClose={() => setActiveDrawer('none')}
                onDeclareWar={handleDeclareWar}
                onOfferAlliance={handleOfferAlliance}
                onOfferPact={handleOfferPact}
                onOfferTrade={handleOfferTrade}
                onSendAid={handleSendAid}
                onLaunchAttack={handleLaunchAttack}
                onProposePeace={handleProposePeace}
                language={language}
              />
            )}

            {activeDrawer === 'economy' && (
              <EconomyPanel
                gameState={gameState}
                onClose={() => setActiveDrawer('none')}
                onSetTaxRate={handleSetTaxRate}
                onBuildInfrastructure={handleBuildInfrastructure}
                isPersian={isPersian}
              />
            )}

            {activeDrawer === 'military' && (
              <MilitaryPanel
                gameState={gameState}
                onClose={() => setActiveDrawer('none')}
                onRecruitUnits={handleRecruitUnits}
                onBuildFortification={handleBuildFortification}
                onBuildStructure={handleBuildStructure}
                language={language}
              />
            )}

            {activeDrawer === 'diplomacy' && (
              <DiplomacyPanel
                gameState={gameState}
                onClose={() => setActiveDrawer('none')}
                onSelectCountry={handleSelectCountry}
                isPersian={isPersian}
              />
            )}

            {activeDrawer === 'research' && (
              <ResearchPanel
                gameState={gameState}
                onClose={() => setActiveDrawer('none')}
                onStartResearch={handleStartResearch}
                isPersian={isPersian}
              />
            )}

            {activeDrawer === 'commander' && (
              <CommanderAIPanel
                gameState={gameState}
                onClose={() => setActiveDrawer('none')}
                onExecuteSuggestedAction={handleExecuteSuggestedAction}
                isPersian={isPersian}
              />
            )}

          </div>
        </div>
      )}

      {/* Global Modals */}
      {activeModal === 'globalFeed' && (
        <GlobalActivityFeed
          events={gameState.events}
          gameState={gameState}
          onClose={() => setActiveModal('none')}
          onJumpToCountry={handleJumpToCountry}
          language={language}
        />
      )}

      {activeModal === 'un' && (
        <UNModal
          gameState={gameState}
          onClose={() => setActiveModal('none')}
          onVoteResolution={handleVoteResolution}
          onProposeResolution={handleProposeResolution}
          language={language}
        />
      )}

      {activeModal === 'multiplayer' && (
        <MultiplayerModal
          gameState={gameState}
          onClose={() => setActiveModal('none')}
          isPersian={isPersian}
        />
      )}

      {activeModal === 'alliances' && (
        <AlliancesModal
          gameState={gameState}
          onClose={() => setActiveModal('none')}
          onCreateAlliance={handleCreateAlliance}
          isPersian={isPersian}
        />
      )}

      {activeModal === 'profile' && (
        <ProfileModal
          profile={profile}
          gameState={gameState}
          onUpdateProfile={(p) => {
            setProfile(p);
            saveUserProfile(p);
          }}
          onClose={() => setActiveModal('none')}
          isPersian={isPersian}
        />
      )}

      {activeModal === 'saves' && (
        <SaveLoadModal
          gameState={gameState}
          onClose={() => setActiveModal('none')}
          onLoadState={(st) => {
            setGameState(st);
            setSelectedCountryId(st.playerCountryId);
            setJumpCountryId(st.playerCountryId);
            setInGame(true);
          }}
          isPersian={isPersian}
        />
      )}

      {activeModal === 'notifications' && (
        <NotificationsModal
          events={gameState.events}
          onClose={() => setActiveModal('none')}
          isPersian={isPersian}
        />
      )}
    </div>
  );
}
