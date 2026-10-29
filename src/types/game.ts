/**
 * OpenBattle: Ultimate Edition - Core Game Types
 */

export type GameSpeed = 0 | 1 | 2 | 3; // 0 = Paused, 1 = Normal (1s/day), 2 = Fast (0.5s/day), 3 = Ultra (0.2s/day)

export type SupportedLanguage = 'en' | 'fa' | 'ar' | 'ru' | 'zh' | 'de' | 'es';

export type MapMode = 
  | 'political'
  | 'economic'
  | 'military'
  | 'diplomatic'
  | 'population'
  | 'resources'
  | 'alliance';

export type DiplomaticStatus = 
  | 'allied'
  | 'non_aggression'
  | 'neutral'
  | 'rival'
  | 'at_war';

export type GovernmentType = 
  | 'Democracy'
  | 'Republic'
  | 'Constitutional Monarchy'
  | 'Federation'
  | 'Authoritarian'
  | 'Theocracy'
  | 'Military Junta';

export type AttackType = 
  | 'invasion'            // Ground invasion and territorial conquest
  | 'missile_strike'      // Ballistic missile strike on infrastructure & military
  | 'naval_bombardment'   // Warship cruise missile & naval blockade
  | 'air_strike'          // Air superiority & surgical bombing
  | 'covert_sabotage';    // Espionage bombing & covert destabilization

export interface Resources {
  energy: number;     // Oil/Gas/Renewables (M barrels equiv)
  metals: number;     // Steel, Titanium, Rare Earths (k tonnes)
  food: number;       // Agriculture supplies (k tonnes)
  industrial: number; // Industrial equipment & manufacturing
}

export interface MilitaryUnits {
  infantry: number;   // In thousands of active personnel
  armor: number;      // Tank & mechanized combat vehicles
  airForce: number;   // Multi-role fighter wings
  navy: number;       // Major warships and submarine flotillas
  missiles: number;   // Ballistic and cruise missile stockpile
}

export interface NationalBuildings {
  missileSilos: number;      // Ballistic launch silos
  navalPorts: number;        // Deepwater naval & trade ports
  airDefenseBunkers: number; // Integrated air defense & radar complexes
  armsFactories: number;     // Munitions & armored vehicle plants
  civicCenters: number;      // Housing, healthcare & civic administration
  nuclearLabs: number;       // Advanced physics & strategic weapons labs
}

export interface CityData {
  id: string;
  name: string;
  nameFa: string;
  population: number; // In millions
  coordinates: [number, number]; // [lng, lat]
  isCapital: boolean;
}

export interface CountryData {
  id: string;            // ISO Numeric string, e.g. "840" for USA, "364" for Iran
  iso2: string;          // "US", "IR", "CN", etc.
  iso3: string;          // "USA", "IRN", "CHN", etc.
  name: string;          // English name
  nameFa: string;        // Persian name
  capital: string;       // Capital city
  capitalCoordinates: [number, number]; // [lng, lat]
  cities?: CityData[];   // Major sovereign metropolitan centers
  flagEmoji: string;     // Emoji or flag icon representation
  color: string;         // Primary political map color
  population: number;    // In millions
  gdp: number;           // In billions USD
  treasury: number;      // Available national reserves (M USD)
  taxRate: number;       // 0.15 to 0.45
  stability: number;     // 0 to 100%
  warExhaustion: number; // 0 to 100%
  fortificationLevel: number; // 0 to 3
  buildings: NationalBuildings;
  resources: Resources;
  military: MilitaryUnits;
  techLevel: number;     // 1 to 5
  government: GovernmentType;
  allianceId: string | null; // e.g. "NATO", "SCO", "CSTO", or custom
  originalOwnerId?: string; // Tracks original sovereign if occupied
  isOccupied?: boolean;
  occupierId?: string | null;
  annexedCountryIds?: string[];
  annexationControl?: Record<string, number>; // [targetCountryId]: 0 to 100% control
  lostTerritoryIds?: string[];
  recentDamageAlert?: string;
  infrastructureLevel: number; // 1 to 5
  latestNews?: string;   // Country-specific latest breaking news wire
}

export interface ActiveMissileStrike {
  id: string;
  attackerId: string;
  targetId: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  count: number;
  attackType: AttackType;
  startTime: number;
  durationMs: number;
  isHostileToPlayer?: boolean;
}

export interface DiplomaticRelation {
  opinion: number; // -100 (Bitter Enemy) to +100 (Ironclad Ally)
  status: DiplomaticStatus;
  hasTradeAgreement: boolean;
  isSanctioned: boolean;
  treatyDurationTicks?: number; // Days remaining on non-aggression/peace
}

export interface Technology {
  id: string;
  name: string;
  nameFa: string;
  category: 'military' | 'economy' | 'infrastructure' | 'intel';
  tier: number;
  cost: number; // Treasury cost
  durationDays: number;
  prerequisites: string[];
  description: string;
  descriptionFa: string;
  modifiers: {
    incomeMultiplier?: number;
    militaryPowerMultiplier?: number;
    defenseBonus?: number;
    resourceOutputMultiplier?: number;
    researchSpeedMultiplier?: number;
  };
}

export interface ResearchQueueItem {
  techId: string;
  progressDays: number;
  totalDays: number;
}

export interface ConstructionQueueItem {
  id: string;
  type: 'fortification' | 'infrastructure' | 'missileSilos' | 'navalPorts' | 'airDefenseBunkers' | 'armsFactories' | 'civicCenters' | 'nuclearLabs' | 'newCity';
  name: string;
  nameFa: string;
  countryId: string;
  cost: number;
  progressDays: number;
  totalDays: number;
  extraData?: Record<string, any>;
}

export interface MilitaryOrder {
  id: string;
  type: 'recruit' | 'offensive';
  attackType?: AttackType;
  sourceCountryId: string;
  targetCountryId?: string;
  units?: Partial<MilitaryUnits>;
  progressDays: number;
  totalDays: number;
  cost: number;
}

export interface BattleReport {
  id: string;
  date: string;
  attackType: AttackType;
  attackerId: string;
  defenderId: string;
  attackerCasualties: number;
  defenderCasualties: number;
  infrastructureDamaged?: string;
  attackerUnitsLost: Partial<MilitaryUnits>;
  defenderUnitsLost: Partial<MilitaryUnits>;
  result: 'decisive_victory' | 'tactical_victory' | 'repelled' | 'catastrophic_defeat';
  territoryOccupied: boolean;
  summary: string;
  summaryFa: string;
}

export interface GameEvent {
  id: string;
  date: string;
  type: 'diplomatic' | 'military' | 'economic' | 'scientific' | 'un' | 'covert';
  title: string;
  titleFa: string;
  description: string;
  descriptionFa: string;
  primaryCountryId?: string;  // Click to jump map camera!
  targetCountryId?: string;   // Secondary country involved
  severity: 'info' | 'warning' | 'alert' | 'triumph';
}

export interface UNResolution {
  id: string;
  title: string;
  titleFa: string;
  description: string;
  descriptionFa: string;
  proposerCountryId: string;
  targetCountryId?: string;
  votesFor: string[];
  votesAgainst: string[];
  votesAbstain: string[];
  status: 'active_session' | 'passed' | 'vetoed' | 'failed';
  daysLeft: number;
  effect: 'ceasefire' | 'sanctions' | 'aid_package' | 'condemnation';
}

export interface DiplomaticCable {
  id: string;
  fromCountryId: string;
  toCountryId: string;
  subject: string;
  message: string;
  date: string;
  isRead: boolean;
  replyOptions?: {
    id: string;
    text: string;
    effectDescription: string;
    action: () => void;
  }[];
}

export interface Alliance {
  id: string;
  name: string;
  nameFa: string;
  tag: string;
  leaderId: string;
  members: string[]; // Country IDs
  color: string;
  mutualDefense: boolean;
  sharedResearch: boolean;
  createdDate: string;
}

export interface Scenario {
  id: string;
  name: string;
  nameFa: string;
  description: string;
  descriptionFa: string;
  startYear: number;
  startDate: string;
  mode: 'historical_2026' | 'custom_genesis' | 'sandbox';
  recommendedCountries: string[]; // ISO ids
  difficulty: 'Casual' | 'Strategist' | 'Grand Master';
}

export type SpyMissionType = 
  | 'gather_intel'
  | 'incite_unrest'
  | 'assassinate_general'
  | 'sabotage_silos'
  | 'steal_tech'
  | 'rig_election'
  | 'fabricate_cb';

export interface SpyMission {
  id: string;
  type: SpyMissionType;
  targetCountryId: string;
  progressDays: number;
  totalDays: number;
  riskLevel: 'low' | 'medium' | 'high';
  cost: number;
  description: string;
  descriptionFa: string;
}

export interface SpyNetwork {
  countryId: string;
  infiltrationLevel: number; // 0 to 100%
  agentCount: number;
  intelDiscovered: boolean; // reveals exact military numbers, missile silos, and air defenses
  activeMissions: SpyMission[];
}

export interface NewsBroadcast {
  id: string;
  channelName: string; // e.g. "شبکه خبر IRINN", "BBC World Live", "CNN Newsroom", "Al Jazeera English"
  channelLogo: string;
  headline: string;
  headlineFa: string;
  subtitles: string;
  subtitlesFa: string;
  severity: 'breaking' | 'war_alert' | 'un_summit' | 'economy';
  anchorName: string;
  countryId?: string;
  timestamp: string;
  videoStyle?: 'studio' | 'frontline' | 'press_conference' | 'un_podium';
}

export interface GameState {
  campaignId: string;
  saveName: string;
  currentDate: string; // YYYY-MM-DD
  dayTick: number;
  timeOfDayHours: number; // 0 to 24 for Day/Night cycle
  speed: GameSpeed;
  isPaused: boolean;
  playerCountryId: string;
  scenarioId: string;
  difficulty: 'Casual' | 'Strategist' | 'Grand Master';
  countries: Record<string, CountryData>;
  diplomacy: Record<string, Record<string, DiplomaticRelation>>; // [countryA][countryB]
  alliances: Record<string, Alliance>;
  unResolutions: UNResolution[];
  diplomaticCables: DiplomaticCable[];
  unlockedTechs: Record<string, string[]>; // [countryId]: techIds
  activeResearch: Record<string, ResearchQueueItem | null>; // [countryId]: active research
  constructionQueue: ConstructionQueueItem[];
  militaryOrders: MilitaryOrder[];
  battleReports: BattleReport[];
  events: GameEvent[];
  activeStrikes?: ActiveMissileStrike[];
  spyNetworks?: Record<string, SpyNetwork>; // [targetCountryId]: SpyNetwork
  activeNewsBroadcast?: NewsBroadcast | null;
  recentNewsBroadcasts?: NewsBroadcast[];
  territorialControl?: Record<string, Record<string, number>>; // [occupierCountryId][conqueredCountryId]: 0-100%
  victoryCondition: {
    targetGDP?: number;
    targetTerritoriesCount?: number;
    isAchieved: boolean;
    achievedDate?: string;
  };
}

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  isGuest: boolean;
  avatarSeed: string;
  rank: string;
  elo: number;
  matchesPlayed: number;
  victories: number;
  preferredLanguage: SupportedLanguage;
  createdAt: string;
}

export interface MultiplayerRoom {
  roomId: string;
  roomName: string;
  hostId: string;
  hostName: string;
  scenarioId: string;
  maxPlayers: number;
  players: {
    id: string;
    displayName: string;
    countryId: string;
    isReady: boolean;
    isHost: boolean;
  }[];
  status: 'lobby' | 'in_game' | 'finished';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderCountryId?: string;
  channel: 'world' | 'alliance' | 'system';
  text: string;
  timestamp: string;
}

export interface AIAdvisorMessage {
  id: string;
  sender: 'commander' | 'user';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'recruit' | 'trade' | 'build_infra' | 'tax_reform' | 'sign_pact' | 'launch_strike';
    title: string;
    description: string;
    cost: number;
    targetCountryId?: string;
    parameters?: Record<string, any>;
  };
}
