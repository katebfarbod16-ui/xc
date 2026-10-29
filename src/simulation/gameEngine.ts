import { 
  GameState, 
  CountryData, 
  DiplomaticRelation, 
  BattleReport, 
  GameEvent, 
  MilitaryOrder, 
  ConstructionQueueItem, 
  ResearchQueueItem,
  AttackType,
  UNResolution,
  DiplomaticCable,
  SpyNetwork,
  SpyMission,
  NewsBroadcast
} from '../types/game';
import { INITIAL_COUNTRIES, INITIAL_ALLIANCES } from '../data/countries';
import { SCENARIOS } from '../data/scenarios';
import { TECHNOLOGIES } from '../data/technologies';
import { sound } from './soundEngine';

/**
 * Creates a fresh, validated initial campaign game state
 */
export function createInitialGameState(
  scenarioId = 'modern_2026',
  playerCountryId = '364',
  difficulty: 'Casual' | 'Strategist' | 'Grand Master' = 'Strategist'
): GameState {
  const scenario = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0];

  // Deep clone countries
  const countries: Record<string, CountryData> = {};
  for (const [id, c] of Object.entries(INITIAL_COUNTRIES)) {
    countries[id] = JSON.parse(JSON.stringify(c));
  }

  // Adjust difficulty modifiers for player or AI
  if (difficulty === 'Casual' && countries[playerCountryId]) {
    countries[playerCountryId].treasury += 15000;
    countries[playerCountryId].stability = 95;
    countries[playerCountryId].military.infantry = Math.round(countries[playerCountryId].military.infantry * 1.3);
  } else if (difficulty === 'Grand Master') {
    for (const [id, c] of Object.entries(countries)) {
      if (id !== playerCountryId) {
        c.treasury = Math.round(c.treasury * 1.3);
        c.military.infantry = Math.round(c.military.infantry * 1.25);
      }
    }
  }

  // Initialize diplomatic matrix
  const diplomacy: Record<string, Record<string, DiplomaticRelation>> = {};
  const countryIds = Object.keys(countries);

  for (const a of countryIds) {
    diplomacy[a] = {};
    for (const b of countryIds) {
      if (a === b) {
        diplomacy[a][b] = { opinion: 100, status: 'allied', hasTradeAgreement: true, isSanctioned: false };
        continue;
      }

      const countryA = countries[a];
      const countryB = countries[b];
      const sameAlliance = countryA.allianceId && countryA.allianceId === countryB.allianceId;

      let opinion = 0;
      let status: DiplomaticRelation['status'] = 'neutral';
      let hasTrade = false;

      if (sameAlliance) {
        opinion = 80;
        status = 'allied';
        hasTrade = true;
      } else if (
        (countryA.allianceId === 'NATO' && (countryB.allianceId === 'CSTO' || b === '643')) ||
        (countryB.allianceId === 'NATO' && (countryA.allianceId === 'CSTO' || a === '643'))
      ) {
        opinion = -55;
        status = 'rival';
      } else if ((a === '364' && b === '376') || (a === '376' && b === '364')) {
        opinion = -85;
        status = 'rival';
      } else if ((a === '840' && b === '643') || (a === '643' && b === '840')) {
        opinion = -60;
        status = 'rival';
      } else if ((a === '364' && b === '682') || (a === '682' && b === '364')) {
        opinion = -10;
        status = 'neutral';
        hasTrade = true;
      } else if ((a === '156' && b === '364') || (a === '364' && b === '156')) {
        opinion = 70;
        status = 'allied';
        hasTrade = true;
      } else {
        opinion = 15;
        status = 'neutral';
        hasTrade = false;
      }

      diplomacy[a][b] = {
        opinion,
        status,
        hasTradeAgreement: hasTrade,
        isSanctioned: false,
      };
    }
  }

  // Initial unlocked techs: tier 1 techs based on country tech level
  const unlockedTechs: Record<string, string[]> = {};
  const activeResearch: Record<string, ResearchQueueItem | null> = {};

  for (const [id, c] of Object.entries(countries)) {
    unlockedTechs[id] = [];
    activeResearch[id] = null;
    if (c.techLevel >= 4) {
      unlockedTechs[id].push('tech_combined_arms', 'tech_algorithmic_tax');
    }
    if (c.techLevel >= 5) {
      unlockedTechs[id].push('tech_air_defense_grid', 'tech_highspeed_transit');
    }
  }

  const initialEvents: GameEvent[] = [
    {
      id: `evt_init_1`,
      date: scenario.startDate,
      type: 'diplomatic',
      title: 'Global Sovereign Mandate Initiated',
      titleFa: 'آغاز مأموریت راهبردی حاکمیت جهانی',
      description: `Welcome Supreme Commander. You hold sovereign command of ${countries[playerCountryId]?.name || 'your nation'}. Strategic missile silos, naval ports, and world borders are operational.`,
      descriptionFa: `به ستاد فرماندهی کل خوش آمدید. سکان هدایت ${countries[playerCountryId]?.nameFa || 'کشور شما'} در دستان شماست. سیلوهای موشکی، بنادر و پدافندهای هوایی فعال هستند.`,
      primaryCountryId: playerCountryId,
      severity: 'triumph',
    },
    {
      id: `evt_init_2`,
      date: scenario.startDate,
      type: 'un',
      title: 'United Nations Assembly Convenes',
      titleFa: 'آغاز نشست مجمع عمومی سازمان ملل',
      description: 'The UN Security Council has placed global strategic non-proliferation and maritime choke points on the high-level agenda.',
      descriptionFa: 'شورای امنیت سازمان ملل نظارت بر کریدورهای ترانزیتی و پیمان‌های عدم گسترش تسلیحات را در دستور کار قرار داد.',
      primaryCountryId: '840',
      severity: 'info',
    }
  ];

  const initialUNResolutions: UNResolution[] = [
    {
      id: 'res_001',
      title: 'Maritime Choke Point Security Accord',
      titleFa: 'توافقنامه امنیت تنگه‌ها و آبراه‌های راهبردی',
      description: 'Guarantees unhindered peaceful passage through critical straits (Hormuz, Malacca, Suez) under threat of joint sanctions.',
      descriptionFa: 'تضمین عبور امن کشتی‌های تجاری از تنگه‌های هرمز، مالاکا و کانال سوئز با ضمانت اجرایی تحریم‌های مشترک.',
      proposerCountryId: '156',
      votesFor: ['156', '364', '356'],
      votesAgainst: [],
      votesAbstain: ['840'],
      status: 'active_session',
      daysLeft: 18,
      effect: 'ceasefire',
    }
  ];

  return {
    campaignId: `camp_${Date.now()}`,
    saveName: `${scenario.name} - ${countries[playerCountryId]?.name || 'Command'}`,
    currentDate: scenario.startDate,
    dayTick: 0,
    timeOfDayHours: 12,
    speed: 1,
    isPaused: false,
    playerCountryId,
    scenarioId,
    difficulty,
    countries,
    diplomacy,
    alliances: JSON.parse(JSON.stringify(INITIAL_ALLIANCES)),
    unResolutions: initialUNResolutions,
    diplomaticCables: [],
    unlockedTechs,
    activeResearch,
    constructionQueue: [],
    militaryOrders: [],
    battleReports: [],
    events: initialEvents,
    victoryCondition: {
      targetGDP: (countries[playerCountryId]?.gdp || 500) * 2.5,
      targetTerritoriesCount: 10,
      isAchieved: false,
    },
  };
}

/**
 * Calculates current daily income and expenses for any country
 */
export function calculateCountryFinance(country: CountryData, state: GameState) {
  const techs = state.unlockedTechs[country.id] || [];
  let incomeMultiplier = 1.0;
  for (const tId of techs) {
    const tech = TECHNOLOGIES.find(t => t.id === tId);
    if (tech?.modifiers.incomeMultiplier) {
      incomeMultiplier *= tech.modifiers.incomeMultiplier;
    }
  }

  // Base daily tax from GDP, population, and civic centers:
  const civicBonus = 1 + (country.buildings?.civicCenters || 0) * 0.04;
  const baseDailyTax = Math.round(((country.gdp * 1000 * country.taxRate * 0.16) / 30) * incomeMultiplier * civicBonus);
  const dailyTax = Math.max(80, baseDailyTax);
  
  // Trade agreement & port bonus:
  let tradePartners = 0;
  const rels = state.diplomacy[country.id] || {};
  for (const otherId of Object.keys(rels)) {
    if (rels[otherId].hasTradeAgreement && rels[otherId].status !== 'at_war') {
      tradePartners++;
    }
  }
  const portBonus = (country.buildings?.navalPorts || 0) * 35;
  const dailyTradeIncome = (tradePartners * 65) + portBonus;

  // Military Upkeep:
  const infUpkeep = country.military.infantry * 0.22;
  const armorUpkeep = (country.military.armor / 10) * 0.32;
  const airUpkeep = country.military.airForce * 0.85;
  const navyUpkeep = country.military.navy * 1.05;
  const missileUpkeep = (country.military.missiles || 0) * 0.03;
  const rawUpkeep = Math.round(infUpkeep + armorUpkeep + airUpkeep + navyUpkeep + missileUpkeep);
  
  // Military upkeep is capped at 65% of tax income during peace so economy maintains positive reserves
  const isAtWar = Object.values(state.diplomacy[country.id] || {}).some(r => r.status === 'at_war');
  const maxPeacetimeUpkeep = Math.max(50, Math.round(dailyTax * 0.65));
  const dailyMilitaryUpkeep = isAtWar ? rawUpkeep : Math.min(rawUpkeep, maxPeacetimeUpkeep);

  // Infra upkeep:
  const dailyInfraUpkeep = Math.round(country.infrastructureLevel * 25);

  const totalDailyIncome = dailyTax + dailyTradeIncome;
  const totalDailyExpenses = dailyMilitaryUpkeep + dailyInfraUpkeep;
  const dailyNet = totalDailyIncome - totalDailyExpenses;

  return {
    dailyTax,
    dailyTradeIncome,
    totalDailyIncome,
    dailyMilitaryUpkeep,
    dailyInfraUpkeep,
    totalDailyExpenses,
    dailyNet,
  };
}

/**
 * Advanced date stepper (adds 1 day)
 */
function advanceDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
}

/**
 * Core simulation tick executed deterministically
 */
export function runSimulationTick(state: GameState): GameState {
  const next = JSON.parse(JSON.stringify(state)) as GameState;
  next.dayTick += 1;
  next.currentDate = advanceDate(next.currentDate);

  // Advance Day / Night Cycle (cycles 0 to 24 hours)
  next.timeOfDayHours = (next.timeOfDayHours + 2) % 24;

  // 1. Economic Updates for all countries
  for (const country of Object.values(next.countries)) {
    const fin = calculateCountryFinance(country, next);
    country.treasury = Math.max(0, country.treasury + fin.dailyNet);

    // Safety check: Prevent bankruptcy freeze bug ("یهویی ۰ میشه و هیچ کاری نمی شه کرد")
    if (country.treasury < 600) {
      country.treasury += 3000;
      if (country.id === next.playerCountryId) {
        next.events.unshift({
          id: `evt_stimulus_${Date.now()}`,
          date: next.currentDate,
          type: 'economic',
          title: 'Emergency Sovereign Liquidity Facility',
          titleFa: 'تزریق نقدینگی اضطراری و خط اعتباری بانک مرکزی',
          description: 'The National Central Bank disbursed an emergency stabilization facility (+ $3,000M) to guarantee military operations and sovereign development.',
          descriptionFa: 'بانک مرکزی و سازمان مدیریت برای پشتیبانی از آمادگی دفاعی و پروژه‌های ملی، خط اعتباری اضطراری ۳۰۰۰ میلیون دلاری به خزانه‌داری تزریق کردند.',
          primaryCountryId: country.id,
          severity: 'info',
        });
      }
    }

    // Minor war exhaustion decay during peace or growth during war
    const isAtWar = Object.values(next.diplomacy[country.id] || {}).some(r => r.status === 'at_war');
    if (isAtWar) {
      country.warExhaustion = Math.min(100, country.warExhaustion + 0.12);
      country.stability = Math.max(25, country.stability - 0.05);
    } else {
      country.warExhaustion = Math.max(0, country.warExhaustion - 0.2);
      country.stability = Math.min(100, country.stability + 0.08);
    }

    // Factory & silo production (missiles and equipment)
    if (country.buildings?.missileSilos) {
      country.military.missiles = (country.military.missiles || 0) + country.buildings.missileSilos;
    }

    // Resource accumulation (pro-rated daily)
    country.resources.energy = Math.round(country.resources.energy + (country.resources.energy * 0.001));
    country.resources.metals = Math.round(country.resources.metals + (country.resources.metals * 0.001));
    country.resources.food = Math.round(country.resources.food + (country.resources.food * 0.001));
    country.resources.industrial = Math.round(country.resources.industrial + (country.resources.industrial * 0.001));
  }

  // 2. UN Resolution Progress
  for (const res of next.unResolutions) {
    if (res.status === 'active_session') {
      res.daysLeft -= 1;
      if (res.daysLeft <= 0) {
        if (res.votesFor.length > res.votesAgainst.length) {
          res.status = 'passed';
          next.events.unshift({
            id: `evt_un_pass_${Date.now()}`,
            date: next.currentDate,
            type: 'un',
            title: `UN Resolution Passed: ${res.title}`,
            titleFa: `تصویب قطعنامه سازمان ملل: ${res.titleFa}`,
            description: `The UN General Assembly has ratified ${res.title}. International compliance protocols are enacted.`,
            descriptionFa: `مجمع عمومی سازمان ملل قطعنامه «${res.titleFa}» را با اکثریت آرا به تصویب رساند.`,
            primaryCountryId: res.proposerCountryId,
            severity: 'triumph',
          });
        } else {
          res.status = 'failed';
        }
      }
    }
  }

  // 3. Active Research Progress
  for (const [countryId, research] of Object.entries(next.activeResearch)) {
    if (!research) continue;
    research.progressDays += 1;
    if (research.progressDays >= research.totalDays) {
      if (!next.unlockedTechs[countryId]) next.unlockedTechs[countryId] = [];
      next.unlockedTechs[countryId].push(research.techId);
      next.activeResearch[countryId] = null;

      const techObj = TECHNOLOGIES.find(t => t.id === research.techId);
      if (countryId === next.playerCountryId && techObj) {
        sound.playTriumph();
        next.events.unshift({
          id: `evt_tech_${Date.now()}`,
          date: next.currentDate,
          type: 'scientific',
          title: `Research Completed: ${techObj.name}`,
          titleFa: `دستیابی به فناوری: ${techObj.nameFa}`,
          description: `Our scientists have successfully operationalized ${techObj.name}. Strategic bonuses have been applied.`,
          descriptionFa: `دانشمندان ما موفق به دستیابی به ${techObj.nameFa} شدند. مزایای راهبردی در محاسبات ملی اعمال شد.`,
          primaryCountryId: countryId,
          severity: 'triumph',
        });
      }
    }
  }

  // 4. Construction Queues Progress (All building types!)
  const remainingConstruction: ConstructionQueueItem[] = [];
  for (const item of next.constructionQueue) {
    item.progressDays += 1;
    if (item.progressDays >= item.totalDays) {
      const c = next.countries[item.countryId];
      if (c) {
        if (item.type === 'fortification') {
          c.fortificationLevel = Math.min(3, c.fortificationLevel + 1);
        } else if (item.type === 'infrastructure') {
          c.infrastructureLevel = Math.min(5, c.infrastructureLevel + 1);
        } else if (item.type === 'newCity') {
          if (!c.cities) c.cities = [];
          const cityName = item.extraData?.cityName || `Metropolis ${c.cities.length + 1}`;
          const cityNameFa = item.extraData?.cityNameFa || `شهر راهبردی ${c.cities.length + 1}`;
          const capitalCoords = c.capitalCoordinates || [51.38, 35.68];
          const newCoords: [number, number] = item.extraData?.coordinates || [
            capitalCoords[0] + (Math.random() - 0.5) * 3,
            capitalCoords[1] + (Math.random() - 0.5) * 2.5,
          ];
          c.cities.push({
            id: `c_${Date.now()}`,
            name: cityName,
            nameFa: cityNameFa,
            population: 1.2,
            coordinates: newCoords,
            isCapital: false,
          });
          c.population = Math.round((c.population + 1.2) * 10) / 10;
          c.gdp += 18;
          c.stability = Math.min(100, c.stability + 5);
        } else if (item.type in c.buildings) {
          (c.buildings as any)[item.type] = ((c.buildings as any)[item.type] || 0) + 1;
        }

        if (item.countryId === next.playerCountryId) {
          sound.playTriumph();
          next.events.unshift({
            id: `evt_const_${Date.now()}`,
            date: next.currentDate,
            type: 'economic',
            title: `Construction Finished: ${item.name}`,
            titleFa: `پایان احداث: ${item.nameFa}`,
            description: `${item.name} is now fully operational in sovereign territory.`,
            descriptionFa: `پروژه ${item.nameFa} با موفقیت در خاک کشور احداث و وارد مدار خدمت شد.`,
            primaryCountryId: item.countryId,
            severity: 'info',
          });
        }
      }
    } else {
      remainingConstruction.push(item);
    }
  }
  next.constructionQueue = remainingConstruction;

  // Clean up active tactical strikes older than their duration
  if (next.activeStrikes && next.activeStrikes.length > 0) {
    const now = Date.now();
    next.activeStrikes = next.activeStrikes.filter(s => now - s.startTime < s.durationMs);
  }

  // 5. Military Orders Progress (Offensives & Recruitment)
  const remainingOrders: MilitaryOrder[] = [];
  for (const order of next.militaryOrders) {
    order.progressDays += 1;
    if (order.progressDays >= order.totalDays) {
      if (order.type === 'recruit' && order.units) {
        const c = next.countries[order.sourceCountryId];
        if (c) {
          c.military.infantry += order.units.infantry || 0;
          c.military.armor += order.units.armor || 0;
          c.military.airForce += order.units.airForce || 0;
          c.military.navy += order.units.navy || 0;
          c.military.missiles = (c.military.missiles || 0) + (order.units.missiles || 0);

          if (order.sourceCountryId === next.playerCountryId) {
            next.events.unshift({
              id: `evt_mil_${Date.now()}`,
              date: next.currentDate,
              type: 'military',
              title: 'Military Units Mobilized',
              titleFa: 'استقرار یگان‌های جدید رزمی',
              description: `New combat personnel, armored units, and missiles have integrated into active standing forces.`,
              descriptionFa: `نیروهای تازه‌نفس، ادوات زرهی و موشک‌های جدید به صفوف ارتش فعال کشور پیوستند.`,
              primaryCountryId: order.sourceCountryId,
              severity: 'info',
            });
          }
        }
      } else if (order.type === 'offensive' && order.targetCountryId) {
        // Multi-attack Combat Resolution!
        const attacker = next.countries[order.sourceCountryId];
        const defender = next.countries[order.targetCountryId];
        if (attacker && defender) {
          const report = resolveCombat(attacker, defender, next, order.attackType || 'invasion');
          next.battleReports.unshift(report);
          sound.playExplosion();

          const isPlayerInvolved = attacker.id === next.playerCountryId || defender.id === next.playerCountryId;
          next.events.unshift({
            id: `evt_battle_${Date.now()}`,
            date: next.currentDate,
            type: 'military',
            title: `Strike On ${defender.name}`,
            titleFa: `حمله علیه ${defender.nameFa}`,
            description: report.summary,
            descriptionFa: report.summaryFa,
            primaryCountryId: defender.id,
            targetCountryId: attacker.id,
            severity: isPlayerInvolved ? (report.result === 'decisive_victory' ? 'triumph' : 'alert') : 'warning',
          });
        }
      }
  }
  next.militaryOrders = remainingOrders;

  // 6. Espionage & Spy Network Mission Progress
  if (!next.spyNetworks) next.spyNetworks = {};
  for (const [targetId, spyNet] of Object.entries(next.spyNetworks)) {
    if (!spyNet) continue;
    // Infiltration builds over time with active agents
    if (spyNet.agentCount > 0 && spyNet.infiltrationLevel < 100) {
      spyNet.infiltrationLevel = Math.min(100, spyNet.infiltrationLevel + spyNet.agentCount * 0.4);
      if (spyNet.infiltrationLevel >= 40) {
        spyNet.intelDiscovered = true;
      }
    }

    const remainingMissions: SpyMission[] = [];
    for (const mission of spyNet.activeMissions) {
      mission.progressDays += 1;
      if (mission.progressDays >= mission.totalDays) {
        const targetCountry = next.countries[targetId];
        if (targetCountry) {
          resolveSpyMission(mission, targetCountry, next);
        }
      } else {
        remainingMissions.push(mission);
      }
    }
    spyNet.activeMissions = remainingMissions;
  }

  // 7. Dynamic Geopolitical AI Decisions & AI-vs-AI Conflicts (Runs every 4 ticks)
  if (next.dayTick % 4 === 0) {
    runAutonomousAIDecisions(next);
  }

  // Cap events to last 120 for memory performance
  if (next.events.length > 120) {
    next.events = next.events.slice(0, 120);
  }

  return next;
}

/**
 * Resolves tactical combat between Attacker and Defender supporting 5 specialized attack types!
 */
export function resolveCombat(
  attacker: CountryData,
  defender: CountryData,
  state: GameState,
  attackType: AttackType = 'invasion'
): BattleReport {
  // Attacker multipliers
  const attackerTechs = state.unlockedTechs[attacker.id] || [];
  let attackerTechMult = 1.0;
  for (const tId of attackerTechs) {
    const t = TECHNOLOGIES.find(x => x.id === tId);
    if (t?.modifiers.militaryPowerMultiplier) attackerTechMult *= t.modifiers.militaryPowerMultiplier;
  }

  // Defender multiplier & fortifications
  const defenderTechs = state.unlockedTechs[defender.id] || [];
  let defenderBonus = 0;
  for (const tId of defenderTechs) {
    const t = TECHNOLOGIES.find(x => x.id === tId);
    if (t?.modifiers.defenseBonus) defenderBonus += t.modifiers.defenseBonus;
  }

  const fortBonus = (defender.fortificationLevel * 0.25) + ((defender.buildings?.airDefenseBunkers || 0) * 0.1);
  const defenderTotalBonus = 1.0 + defenderBonus + fortBonus;

  let attCasualties = 0;
  let defCasualties = 0;
  let territoryOccupied = false;
  let infrastructureDamaged: string | undefined = undefined;
  let result: BattleReport['result'] = 'tactical_victory';

  if (attackType === 'missile_strike') {
    // Ballistic missile strike targets silos and factories
    const missilesFired = Math.min(attacker.military.missiles || 50, 40);
    attacker.military.missiles = Math.max(0, (attacker.military.missiles || 0) - missilesFired);

    const interceptionRate = Math.min(0.7, (defender.buildings?.airDefenseBunkers || 1) * 0.15);
    const missilesPenetrated = Math.round(missilesFired * (1 - interceptionRate));

    defCasualties = missilesPenetrated * 3;
    if (missilesPenetrated > 15 && defender.buildings) {
      if (defender.buildings.missileSilos > 0) {
        defender.buildings.missileSilos -= 1;
        infrastructureDamaged = 'Missile Silo destroyed';
      } else if (defender.buildings.armsFactories > 0) {
        defender.buildings.armsFactories -= 1;
        infrastructureDamaged = 'Munitions Factory destroyed';
      }
    }
    defender.stability = Math.max(20, defender.stability - 4);
    result = missilesPenetrated > 12 ? 'decisive_victory' : 'tactical_victory';

  } else if (attackType === 'naval_bombardment') {
    // Warships fire cruise missiles on coastal infrastructure
    const navPower = attacker.military.navy * 2.5;
    const defNavPower = defender.military.navy * 2.0;

    if (navPower > defNavPower) {
      const shipsSunk = Math.min(defender.military.navy, Math.round(Math.random() * 4 + 1));
      defender.military.navy = Math.max(0, defender.military.navy - shipsSunk);
      if (defender.buildings && defender.buildings.navalPorts > 0) {
        defender.buildings.navalPorts -= 1;
        infrastructureDamaged = 'Deepwater Naval Port disabled';
      }
      defCasualties = shipsSunk * 5;
      result = 'decisive_victory';
    } else {
      attCasualties = 8;
      result = 'repelled';
    }

  } else if (attackType === 'air_strike') {
    // Surgical air superiority strike
    const airRatio = attacker.military.airForce / Math.max(1, defender.military.airForce * defenderTotalBonus);
    if (airRatio > 1.2) {
      const airLosses = Math.min(defender.military.airForce, Math.round(Math.random() * 15 + 5));
      defender.military.airForce = Math.max(0, defender.military.airForce - airLosses);
      if (defender.buildings && defender.buildings.airDefenseBunkers > 0) {
        defender.buildings.airDefenseBunkers -= 1;
        infrastructureDamaged = 'Air Defense Radar complex neutralized';
      }
      defCasualties = airLosses * 2;
      result = 'decisive_victory';
    } else {
      attCasualties = Math.round(attacker.military.airForce * 0.1);
      result = 'repelled';
    }

  } else if (attackType === 'covert_sabotage') {
    // Covert bombing / sabotage operation
    const successRoll = Math.random();
    if (successRoll > 0.35) {
      defender.stability = Math.max(15, defender.stability - 8);
      defender.warExhaustion = Math.min(100, defender.warExhaustion + 5);
      if (defender.buildings && defender.buildings.armsFactories > 0) {
        defender.buildings.armsFactories -= 1;
        infrastructureDamaged = 'Military ammunition depot sabotaged';
      }
      result = 'tactical_victory';
    } else {
      attCasualties = 1;
      result = 'catastrophic_defeat';
    }

  } else {
    // Full Ground Combined Invasion
    const attStrength = (attacker.military.infantry * 1.0 + (attacker.military.armor / 10) * 1.5 + attacker.military.airForce * 2.0) * attackerTechMult;
    const defStrength = (defender.military.infantry * 1.0 + (defender.military.armor / 10) * 1.5 + defender.military.airForce * 2.0) * defenderTotalBonus;

    const rollAtt = 0.85 + Math.random() * 0.3;
    const rollDef = 0.85 + Math.random() * 0.3;
    const ratio = (attStrength * rollAtt) / Math.max(1, defStrength * rollDef);

    if (ratio > 1.5) {
      result = 'decisive_victory';
      territoryOccupied = true;
      attCasualties = Math.round(attacker.military.infantry * 0.04);
      defCasualties = Math.round(defender.military.infantry * 0.22);
    } else if (ratio > 1.05) {
      result = 'tactical_victory';
      attCasualties = Math.round(attacker.military.infantry * 0.08);
      defCasualties = Math.round(defender.military.infantry * 0.14);
    } else if (ratio > 0.7) {
      result = 'repelled';
      attCasualties = Math.round(attacker.military.infantry * 0.15);
      defCasualties = Math.round(defender.military.infantry * 0.08);
    } else {
      result = 'catastrophic_defeat';
      attCasualties = Math.round(attacker.military.infantry * 0.25);
      defCasualties = Math.round(defender.military.infantry * 0.04);
    }

    attacker.military.infantry = Math.max(10, attacker.military.infantry - attCasualties);
    defender.military.infantry = Math.max(10, defender.military.infantry - defCasualties);

    if (territoryOccupied) {
      if (!state.territorialControl) state.territorialControl = {};
      if (!state.territorialControl[attacker.id]) state.territorialControl[attacker.id] = {};
      const currentControl = state.territorialControl[attacker.id][defender.id] || 0;
      const gain = result === 'decisive_victory' ? 50 : 25;
      const totalControl = Math.min(100, currentControl + gain);
      state.territorialControl[attacker.id][defender.id] = totalControl;

      if (!attacker.annexationControl) attacker.annexationControl = {};
      attacker.annexationControl[defender.id] = totalControl;

      if (totalControl >= 50) {
        defender.isOccupied = true;
        defender.occupierId = attacker.id;
        if (!attacker.annexedCountryIds) attacker.annexedCountryIds = [];
        if (!attacker.annexedCountryIds.includes(defender.id)) {
          attacker.annexedCountryIds.push(defender.id);
        }
      }

      const seized = Math.round(defender.treasury * (gain / 100));
      defender.treasury = Math.max(300, defender.treasury - seized);
      attacker.treasury += seized;
      attacker.gdp = Math.round(attacker.gdp + defender.gdp * 0.15);
    }
  }

  const attackLabels: Record<AttackType, { en: string; fa: string }> = {
    invasion: { en: 'Combined Ground Invasion', fa: 'تهاجم مشترک زمینی' },
    missile_strike: { en: 'Ballistic Missile Strike', fa: 'پرتاب موشک بالستیک' },
    naval_bombardment: { en: 'Naval Cruise Bombardment', fa: 'بمباران با موشک‌های کروز ناوگان دریایی' },
    air_strike: { en: 'Surgical Air Superiority Strike', fa: 'بمباران هوایی دقیق پدافند' },
    covert_sabotage: { en: 'Covert Sabotage & Bombing Operation', fa: 'عملیات خرابکاری و بمب‌گذاری سری' },
  };

  const summary = territoryOccupied 
    ? `${attacker.name} broke through defensive lines and annexed strategic territory of ${defender.name}! (${defCasualties}k casualties).`
    : `${attacker.name} carried out a ${attackLabels[attackType].en} on ${defender.name}. Outcome: ${result.replace('_', ' ')}.${infrastructureDamaged ? ` [${infrastructureDamaged}]` : ''}`;

  const summaryFa = territoryOccupied
    ? `نیروهای ${attacker.nameFa} با شکستن خطوط دفاعی بخشی از قلمرو استراتژیک ${defender.nameFa} را فتح و ضمیمه خاک خود کردند! (تلفات مدافع: ${defCasualties} هزار نفر).`
    : `${attacker.nameFa} دست به ${attackLabels[attackType].fa} علیه ${defender.nameFa} زد. نتیجه: ${result === 'decisive_victory' ? 'پیروزی قاطع' : result === 'repelled' ? 'دفع تهاجم' : 'پیروزی تاکتیکی'}.${infrastructureDamaged ? ` [تخریب: ${infrastructureDamaged}]` : ''}`;

  return {
    id: `battle_${Date.now()}`,
    date: state.currentDate,
    attackType,
    attackerId: attacker.id,
    defenderId: defender.id,
    attackerCasualties: attCasualties,
    defenderCasualties: defCasualties,
    infrastructureDamaged,
    attackerUnitsLost: { infantry: attCasualties },
    defenderUnitsLost: { infantry: defCasualties },
    result,
    territoryOccupied,
    summary,
    summaryFa,
  };
}

/**
 * Autonomous AI decision engine for non-player countries & AI vs AI wars!
 */
function runAutonomousAIDecisions(state: GameState) {
  const countryIds = Object.keys(state.countries);

  for (const id of countryIds) {
    if (id === state.playerCountryId) continue;
    const country = state.countries[id];
    if (!country) continue;

    // AI Economy: Adjust tax rate
    if (country.treasury < 3000 && country.taxRate < 0.32) {
      country.taxRate = Math.min(0.35, country.taxRate + 0.02);
    } else if (country.treasury > 20000 && country.taxRate > 0.22) {
      country.taxRate = Math.max(0.18, country.taxRate - 0.01);
    }

    // AI Building Construction: Build factories or missile silos if wealthy
    if (country.treasury > 12000 && state.constructionQueue.filter(c => c.countryId === id).length === 0) {
      const buildTypes: ConstructionQueueItem['type'][] = ['missileSilos', 'navalPorts', 'airDefenseBunkers', 'armsFactories'];
      const chosenType = buildTypes[Math.floor(Math.random() * buildTypes.length)];
      const cost = 4000;
      country.treasury -= cost;
      state.constructionQueue.push({
        id: `const_ai_${Date.now()}_${id}`,
        type: chosenType,
        name: `${chosenType} construction`,
        nameFa: `احداث ${chosenType}`,
        countryId: id,
        cost,
        progressDays: 0,
        totalDays: 20,
      });
    }

    // AI Research: Pick unresearched tech
    if (!state.activeResearch[id]) {
      const unlocked = state.unlockedTechs[id] || [];
      const candidate = TECHNOLOGIES.find(t => 
        !unlocked.includes(t.id) &&
        t.prerequisites.every(p => unlocked.includes(p)) &&
        country.treasury >= t.cost
      );
      if (candidate) {
        country.treasury -= candidate.cost;
        state.activeResearch[id] = {
          techId: candidate.id,
          progressDays: 0,
          totalDays: candidate.durationDays,
        };
      }
    }

    // AI Military Recruitment
    if (country.treasury > 15000 && country.military.infantry < country.population * 8) {
      const recruitCost = 2500;
      country.treasury -= recruitCost;
      state.militaryOrders.push({
        id: `ord_ai_${Date.now()}_${id}`,
        type: 'recruit',
        sourceCountryId: id,
        units: { infantry: 15, armor: 50, missiles: 20 },
        progressDays: 0,
        totalDays: 15,
        cost: recruitCost,
      });
    }

    // AI Diplomacy & Warfare (targeting both Player and other AI nations!)
    const rels = state.diplomacy[id] || {};
    const playerCountry = state.countries[state.playerCountryId];

    for (const [targetId, rel] of Object.entries(rels)) {
      if (targetId === id) continue;
      const targetCountry = state.countries[targetId];
      if (!targetCountry) continue;

      // --- CASE 1: TARGET IS PLAYER! ---
      if (targetId === state.playerCountryId && playerCountry) {
        if (rel.status === 'at_war') {
          // AI actively launches missile strikes and raids on player!
          if (Math.random() < 0.28) {
            const strikeCount = Math.round(Math.random() * 25 + 10);
            if (!state.activeStrikes) state.activeStrikes = [];
            state.activeStrikes.push({
              id: `strike_hostile_${Date.now()}_${id}`,
              attackerId: id,
              targetId: playerCountry.id,
              fromCoords: country.capitalCoordinates || [30, 30],
              toCoords: playerCountry.capitalCoordinates || [51.38, 35.68],
              count: strikeCount,
              attackType: 'missile_strike',
              startTime: Date.now(),
              durationMs: 3800,
              isHostileToPlayer: true,
            });

            // Check player integrated air defense
            const airDef = playerCountry.buildings?.airDefenseBunkers || 0;
            const interceptChance = Math.min(0.80, airDef * 0.18);
            const isIntercepted = Math.random() < interceptChance;

            if (isIntercepted) {
              sound.playRadarPing();
              state.events.unshift({
                id: `evt_def_int_${Date.now()}`,
                date: state.currentDate,
                type: 'military',
                title: `Air Defense Intercepted Enemy Salvo!`,
                titleFa: `سامانه پدافند هوایی موشک‌های متخاصم را رهگیری کرد!`,
                description: `Integrated air defense radar batteries successfully intercepted a barrage of ${strikeCount} ballistic missiles launched by ${country.name}.`,
                descriptionFa: `سامانه‌های پدافندی کشور با هوشیاری کامل رگبار ${strikeCount} فروند موشک شلیک‌شده توسط ${country.nameFa} را در آسمان منهدم کردند.`,
                primaryCountryId: id,
                targetCountryId: playerCountry.id,
                severity: 'triumph',
              });
            } else {
              sound.playWarAlert();
              let damageDetail = 'Critical infrastructure sustained shockwave damage';
              let damageDetailFa = 'آسیب مستقیم به استحکامات و خطوط پشتیبانی';

              if (playerCountry.buildings.missileSilos > 1) {
                playerCountry.buildings.missileSilos -= 1;
                damageDetail = '1 Ballistic Missile Silo neutralized';
                damageDetailFa = 'یک سیلوی پرتاب موشک منهدم شد';
              } else if (playerCountry.buildings.armsFactories > 1) {
                playerCountry.buildings.armsFactories -= 1;
                damageDetail = '1 Arms Factory disabled';
                damageDetailFa = 'یک کارخانه مهمات‌سازی آسیب دید';
              } else if (playerCountry.buildings.navalPorts > 1) {
                playerCountry.buildings.navalPorts -= 1;
                damageDetail = 'Naval port pier damaged';
                damageDetailFa = 'اسکله بارگیری ناوگان آسیب دید';
              }

              playerCountry.stability = Math.max(15, playerCountry.stability - 5);
              playerCountry.warExhaustion = Math.min(100, playerCountry.warExhaustion + 4);
              playerCountry.recentDamageAlert = `${country.name} strike!`;

              state.events.unshift({
                id: `evt_player_hit_${Date.now()}`,
                date: state.currentDate,
                type: 'military',
                title: `🚨 Enemy Missile Strike on Our Territory!`,
                titleFa: `🚨 اصابت موشک‌های متخاصم به خاک کشور!`,
                description: `${country.name} launched a barrage on our territory. Impact confirmed: ${damageDetail}.`,
                descriptionFa: `ارتش متخاصم ${country.nameFa} دست به تهاجم سنگین موشکی زد. خسارت وارده: ${damageDetailFa}.`,
                primaryCountryId: id,
                targetCountryId: playerCountry.id,
                severity: 'alert',
              });
            }
          }
        } else if (rel.opinion < -65 && Math.random() < 0.06) {
          // Hostile AI declares war on Player!
          rel.status = 'at_war';
          if (state.diplomacy[playerCountry.id]?.[id]) {
            state.diplomacy[playerCountry.id][id].status = 'at_war';
            state.diplomacy[playerCountry.id][id].opinion = -100;
          }
          sound.playWarAlert();
          state.events.unshift({
            id: `evt_war_on_us_${Date.now()}`,
            date: state.currentDate,
            type: 'military',
            title: `⚠️ ${country.name} Declared War On Us!`,
            titleFa: `⚠️ ${country.nameFa} رسماً علیه ما اعلام جنگ کرد!`,
            description: `Tensions escalated to total war. Armed forces of ${country.name} have been mobilized against our borders!`,
            descriptionFa: `بحران به نقطه اوج رسید و دولت ${country.nameFa} فرمان تهاجم سراسری به مرزهای ما را صادر کرد!`,
            primaryCountryId: id,
            targetCountryId: playerCountry.id,
            severity: 'alert',
          });
        }
        continue;
      }

      // --- CASE 2: TARGET IS OTHER AI ---
      if (rel.status === 'at_war') {
        const canLaunch = state.militaryOrders.filter(o => o.sourceCountryId === id && o.targetCountryId === targetId).length === 0;
        if (canLaunch && Math.random() < 0.35) {
          const attackTypes: AttackType[] = ['invasion', 'missile_strike', 'air_strike', 'naval_bombardment'];
          const chosenAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)];
          state.militaryOrders.push({
            id: `ord_ai_war_${Date.now()}_${id}_${targetId}`,
            type: 'offensive',
            attackType: chosenAttack,
            sourceCountryId: id,
            targetCountryId: targetId,
            progressDays: 0,
            totalDays: 5,
            cost: 1500,
          });

          // Visually display active missile strike trajectory on map for AI vs AI warfare!
          if (chosenAttack === 'missile_strike') {
            if (!state.activeStrikes) state.activeStrikes = [];
            state.activeStrikes.push({
              id: `strike_ai_${Date.now()}_${id}_${targetId}`,
              attackerId: id,
              targetId: targetId,
              fromCoords: country.capitalCoordinates || [20, 20],
              toCoords: targetCountry.capitalCoordinates || [40, 40],
              count: Math.round(Math.random() * 20 + 8),
              attackType: 'missile_strike',
              startTime: Date.now(),
              durationMs: 3500,
              isHostileToPlayer: false,
            });
          }
        }

        // If war exhaustion is very high, negotiate peace
        if (country.warExhaustion > 60 && targetCountry.warExhaustion > 60 && Math.random() < 0.3) {
          rel.status = 'neutral';
          rel.opinion = -10;
          if (state.diplomacy[targetId]?.[id]) {
            state.diplomacy[targetId][id].status = 'neutral';
            state.diplomacy[targetId][id].opinion = -10;
          }
          state.events.unshift({
            id: `evt_ai_peace_${Date.now()}`,
            date: state.currentDate,
            type: 'diplomatic',
            title: `Ceasefire: ${country.name} & ${targetCountry.name}`,
            titleFa: `آتش‌بس میان ${country.nameFa} و ${targetCountry.nameFa}`,
            description: `After protracted hostilities, an armistice has been ratified between ${country.name} and ${targetCountry.name}.`,
            descriptionFa: `پس از نبردهای سنگین، پیمان آتش‌بس میان ${country.nameFa} و ${targetCountry.nameFa} به امضا رسید.`,
            primaryCountryId: id,
            targetCountryId: targetId,
            severity: 'info',
          });
        }
      } else if (rel.opinion < -70 && Math.random() < 0.08) {
        // AI declares war on rival AI!
        rel.status = 'at_war';
        if (state.diplomacy[targetId]?.[id]) {
          state.diplomacy[targetId][id].status = 'at_war';
        }
        state.events.unshift({
          id: `evt_ai_war_${Date.now()}`,
          date: state.currentDate,
          type: 'military',
          title: `War Erupts: ${country.name} vs ${targetCountry.name}!`,
          titleFa: `آغاز جنگ: ${country.nameFa} علیه ${targetCountry.nameFa}!`,
          description: `Hostilities broke out on border sectors as ${country.name} officially declared war on ${targetCountry.name}.`,
          descriptionFa: `مخاصمات مرزی شعله‌ور شد و ${country.nameFa} رسماً علیه ${targetCountry.nameFa} اعلام جنگ نمود.`,
          primaryCountryId: id,
          targetCountryId: targetId,
          severity: 'alert',
        });
      }
    }
  }
}

/**
 * Resolves a completed covert espionage mission
 */
function resolveSpyMission(mission: SpyMission, targetCountry: CountryData, state: GameState) {
  const isSuccess = Math.random() > (mission.riskLevel === 'high' ? 0.35 : mission.riskLevel === 'medium' ? 0.2 : 0.1);
  const player = state.countries[state.playerCountryId];

  if (!isSuccess) {
    sound.playWarning();
    state.events.unshift({
      id: `evt_spy_fail_${Date.now()}`,
      date: state.currentDate,
      type: 'covert',
      title: `Covert Mission Compromised in ${targetCountry.name}`,
      titleFa: `شناسایی و خنثی‌سازی تیم عملیاتی در ${targetCountry.nameFa}`,
      description: `Target counter-intelligence operatives disrupted our covert mission (${mission.type}). Agents extracted.`,
      descriptionFa: `سازمان ضدجاسوسی ${targetCountry.nameFa} متوجه عملیات نفوذ ما شد. تیم عملیاتی بدون خسارت انسانی تخلیه شد.`,
      primaryCountryId: targetCountry.id,
      severity: 'alert',
    });
    return;
  }

  sound.playSpyAction();

  if (mission.type === 'gather_intel') {
    if (state.spyNetworks && state.spyNetworks[targetCountry.id]) {
      state.spyNetworks[targetCountry.id].intelDiscovered = true;
      state.spyNetworks[targetCountry.id].infiltrationLevel = Math.min(100, state.spyNetworks[targetCountry.id].infiltrationLevel + 35);
    }
    state.events.unshift({
      id: `evt_spy_intel_${Date.now()}`,
      date: state.currentDate,
      type: 'covert',
      title: `Tactical Intel Unlocked: ${targetCountry.name}`,
      titleFa: `دسترسی به اسناد و موقعیت یگان‌های ${targetCountry.nameFa}`,
      description: `Field reconnaissance revealed accurate force compositions, missile silos, and air defense batteries of ${targetCountry.name}.`,
      descriptionFa: `نیروهای اطلاعاتی مختصات دقیق رادارها، سیلوهای موشکی و پایگاه‌های نظامی ${targetCountry.nameFa} را استخراج کردند.`,
      primaryCountryId: targetCountry.id,
      severity: 'triumph',
    });
  } else if (mission.type === 'incite_unrest') {
    targetCountry.stability = Math.max(15, targetCountry.stability - 25);
    targetCountry.warExhaustion = Math.min(100, targetCountry.warExhaustion + 15);
    state.events.unshift({
      id: `evt_spy_unrest_${Date.now()}`,
      date: state.currentDate,
      type: 'covert',
      title: `Civil Unrest Incited in ${targetCountry.name}`,
      titleFa: `سازماندهی ناآرامی و اعتصابات در ${targetCountry.nameFa}`,
      description: `Covert agents distributed subversive media, igniting mass demonstrations that decreased regime stability by 25%.`,
      descriptionFa: `عملیات نفوذ رسانه‌ای و نارضایتی اجتماعی موفقیت‌آمیز بود؛ ثبات سیاسی ${targetCountry.nameFa} ۲۵٪ سقوط کرد.`,
      primaryCountryId: targetCountry.id,
      severity: 'triumph',
    });
  } else if (mission.type === 'assassinate_general') {
    targetCountry.military.infantry = Math.max(20, Math.round(targetCountry.military.infantry * 0.85));
    targetCountry.fortificationLevel = Math.max(0, targetCountry.fortificationLevel - 1);
    state.events.unshift({
      id: `evt_spy_assassin_${Date.now()}`,
      date: state.currentDate,
      type: 'covert',
      title: `Strategic Commander Neutralized in ${targetCountry.name}`,
      titleFa: `ترور هدفمند فرمانده ارشد نظامی در ${targetCountry.nameFa}`,
      description: `Direct action unit neutralized the supreme tactical commander of ${targetCountry.name}, causing widespread disorientation.`,
      descriptionFa: `یگان عملیات ویژه فرمانده ارشد عملیات رزمی ${targetCountry.nameFa} را خنثی کرد؛ ساختار فرماندهی ارتش دشمن مختل شد.`,
      primaryCountryId: targetCountry.id,
      severity: 'triumph',
    });
  } else if (mission.type === 'sabotage_silos') {
    if (targetCountry.buildings) {
      if (targetCountry.buildings.missileSilos > 0) targetCountry.buildings.missileSilos -= 1;
      if (targetCountry.buildings.airDefenseBunkers > 0) targetCountry.buildings.airDefenseBunkers -= 1;
    }
    state.events.unshift({
      id: `evt_spy_sabotage_${Date.now()}`,
      date: state.currentDate,
      type: 'covert',
      title: `Covert Sabotage Neutralized Silos in ${targetCountry.name}`,
      titleFa: `عملیات خرابکاری صنعتی در تاسیسات موشکی ${targetCountry.nameFa}`,
      description: `Explosive demolition teams detonated primary launch complexes and radar telemetry towers inside ${targetCountry.name}.`,
      descriptionFa: `تیم‌های خرابکاری با نفوذ به عمق تاسیسات ${targetCountry.nameFa}، سیلوهای موشکی و سامانه‌های راداری را منفجر کردند.`,
      primaryCountryId: targetCountry.id,
      severity: 'triumph',
    });
  } else if (mission.type === 'steal_tech') {
    const targetTechs = state.unlockedTechs[targetCountry.id] || [];
    const playerTechs = state.unlockedTechs[state.playerCountryId] || [];
    const stealCandidate = targetTechs.find(t => !playerTechs.includes(t));
    if (stealCandidate) {
      if (!state.unlockedTechs[state.playerCountryId]) state.unlockedTechs[state.playerCountryId] = [];
      state.unlockedTechs[state.playerCountryId].push(stealCandidate);
    }
    if (player) player.treasury += 2000;
    state.events.unshift({
      id: `evt_spy_tech_${Date.now()}`,
      date: state.currentDate,
      type: 'covert',
      title: `High-Tech Schematics Exfiltrated from ${targetCountry.name}`,
      titleFa: `سرقت اسناد فوق محرمانه فناوری از ${targetCountry.nameFa}`,
      description: `Cyber operatives breached classified defense servers and extracted proprietary advanced weapon blueprints.`,
      descriptionFa: `متخصصان جنگ سایبری به سرورهای محرمانه وزارت دفاع ${targetCountry.nameFa} نفوذ کرده و اسناد راهبردی را به دست آوردند.`,
      primaryCountryId: targetCountry.id,
      severity: 'triumph',
    });
  } else if (mission.type === 'rig_election') {
    if (state.diplomacy[state.playerCountryId]?.[targetCountry.id]) {
      state.diplomacy[state.playerCountryId][targetCountry.id].opinion += 50;
      state.diplomacy[state.playerCountryId][targetCountry.id].hasTradeAgreement = true;
    }
    targetCountry.allianceId = player?.allianceId || null;
    state.events.unshift({
      id: `evt_spy_coup_${Date.now()}`,
      date: state.currentDate,
      type: 'covert',
      title: `Political Shift Achieved in ${targetCountry.name}`,
      titleFa: `تغییر راهبردی موازنه قدرت سیاسی در ${targetCountry.nameFa}`,
      description: `Covert political campaign successfully installed a friendly leadership group, significantly improving diplomatic relations.`,
      descriptionFa: `با هدایت جریان‌های همسو، دولت جدیدی در ${targetCountry.nameFa} به قدرت رسید که مواضعی کاملاً متحد با ما دارد.`,
      primaryCountryId: targetCountry.id,
      severity: 'triumph',
    });
  } else if (mission.type === 'fabricate_cb') {
    if (state.diplomacy[state.playerCountryId]?.[targetCountry.id]) {
      state.diplomacy[state.playerCountryId][targetCountry.id].opinion = -90;
    }
    state.events.unshift({
      id: `evt_spy_cb_${Date.now()}`,
      date: state.currentDate,
      type: 'covert',
      title: `Casus Belli Justification Fabricated Against ${targetCountry.name}`,
      titleFa: `تولید بهانه جنگی مشروع (Casus Belli) علیه ${targetCountry.nameFa}`,
      description: `Intelligence dossiers have fabricated undeniable justification for military action. UN sanctions threat mitigated.`,
      descriptionFa: `مدارک مستندی از اقدامات تحریک‌آمیز ${targetCountry.nameFa} تدوین شد؛ عملیات نظامی بدون جریمه بین‌المللی مجاز شد.`,
      primaryCountryId: targetCountry.id,
      severity: 'triumph',
    });
  }
}

/**
 * Initiates an espionage operation against a foreign sovereign
 */
export function startSpyMission(
  state: GameState,
  targetCountryId: string,
  type: SpyMission['type'],
  cost: number,
  days: number,
  description: string,
  descriptionFa: string
): GameState {
  const next = JSON.parse(JSON.stringify(state)) as GameState;
  const player = next.countries[next.playerCountryId];
  if (!player || player.treasury < cost) return state;

  player.treasury -= cost;
  if (!next.spyNetworks) next.spyNetworks = {};
  if (!next.spyNetworks[targetCountryId]) {
    next.spyNetworks[targetCountryId] = {
      countryId: targetCountryId,
      infiltrationLevel: 15,
      agentCount: 2,
      intelDiscovered: false,
      activeMissions: [],
    };
  }

  next.spyNetworks[targetCountryId].activeMissions.push({
    id: `mission_${Date.now()}`,
    type,
    targetCountryId,
    progressDays: 0,
    totalDays: days,
    riskLevel: days > 20 ? 'high' : days > 10 ? 'medium' : 'low',
    cost,
    description,
    descriptionFa,
  });

  sound.playSpyAction();
  return next;
}

/**
 * Expands espionage cells in target country
 */
export function expandSpyNetwork(state: GameState, targetCountryId: string): GameState {
  const next = JSON.parse(JSON.stringify(state)) as GameState;
  const player = next.countries[next.playerCountryId];
  const cost = 1200;
  if (!player || player.treasury < cost) return state;

  player.treasury -= cost;
  if (!next.spyNetworks) next.spyNetworks = {};
  if (!next.spyNetworks[targetCountryId]) {
    next.spyNetworks[targetCountryId] = {
      countryId: targetCountryId,
      infiltrationLevel: 25,
      agentCount: 2,
      intelDiscovered: false,
      activeMissions: [],
    };
  } else {
    next.spyNetworks[targetCountryId].agentCount += 1;
    next.spyNetworks[targetCountryId].infiltrationLevel = Math.min(100, next.spyNetworks[targetCountryId].infiltrationLevel + 15);
  }

  sound.playSpyAction();
  return next;
}

/**
 * Manually issues War Bonds / Sovereign Liquidity Loan (+ $5,000M)
 */
export function issueWarBonds(state: GameState): GameState {
  const next = JSON.parse(JSON.stringify(state)) as GameState;
  const player = next.countries[next.playerCountryId];
  if (!player) return state;

  player.treasury += 5000;
  player.stability = Math.max(20, player.stability - 3);

  sound.playTriumph();
  next.events.unshift({
    id: `evt_bonds_${Date.now()}`,
    date: next.currentDate,
    type: 'economic',
    title: 'War Bonds Issued & Reserves Liquidated',
    titleFa: 'انتشار اوراق قرضه جنگی و تزریق ۵۰۰۰ میلیون دلار نقدینگی',
    description: 'The Treasury successfully issued 10-year patriotic war bonds, granting $5,000M in immediate liquid funds.',
    descriptionFa: 'خزانه‌داری با انتشار اوراق قرضه میهنی، مبلغ ۵ میلیارد دلار نقدینگی فوری جهت پشتیبانی ارتش و پروژه‌ها جذب کرد.',
    primaryCountryId: player.id,
    severity: 'triumph',
  });

  return next;
}

/**
 * Generates an interactive TV News Studio broadcast object
 */
export function createNewsBroadcast(
  headline: string,
  headlineFa: string,
  subtitles: string,
  subtitlesFa: string,
  channelName: string = 'شبکه خبر IRINN',
  severity: NewsBroadcast['severity'] = 'breaking',
  countryId?: string
): NewsBroadcast {
  return {
    id: `news_${Date.now()}`,
    channelName,
    channelLogo: channelName.includes('IRINN') ? '🇮🇷 IRINN' : channelName.includes('BBC') ? '🇬🇧 BBC' : channelName.includes('CNN') ? '🇺🇸 CNN' : '🌍 GLOBAL WIRE',
    headline,
    headlineFa,
    subtitles,
    subtitlesFa,
    severity,
    anchorName: channelName.includes('IRINN') ? 'محمدرضا حیاتی' : channelName.includes('BBC') ? 'Christian Fraser' : 'Wolf Blitzer',
    countryId,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    videoStyle: severity === 'war_alert' ? 'frontline' : severity === 'un_summit' ? 'un_podium' : 'studio',
  };
}

