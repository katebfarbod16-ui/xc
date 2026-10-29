# OPENBATTLE: ULTIMATE EDITION (نبرد نهایی جهان)

A grand strategy geopolitical world simulator with interactive real-world cartography, economic and military command, autonomous AI nations, and tactical AI Commander.

## Implemented Subsystems & Features

### 1. Interactive Real-World Cartography
- **Natural Earth TopoJSON Dataset**: Real sovereign polygons with ISO numeric codes.
- **D3 Projection**: Natural Earth 1 projection with responsive pan, zoom (0.8x to 8x), and reset view.
- **7 Tactical Map Modes**:
  - `Political`: Sovereign national colors, contested occupied border tinting.
  - `Economic`: National GDP and daily revenue heatmap.
  - `Military`: Standing infantry divisions, armored units, and border defense heatmap.
  - `Diplomatic`: Stance towards player nation (Green = Allied, Yellow = Neutral, Orange = Rival, Red = At War).
  - `Demographics`: Sovereign population density.
  - `Resources`: Strategic Energy, Metals, Food, and Industry endowments.
  - `Alliances`: Color-coded global power blocs (NATO, SCO, CSTO, custom).
- **Tactical Tooltips & Capital Markers**: Hover inspections and zoom-dependent capital city markers.

### 2. Geopolitical Campaign Engine & Scenarios
- **Multiple Scenarios**:
  - *Modern World 2026: Multipolar Order*
  - *Crucible of West Asia* (Middle East & Persian Gulf)
  - *Global Hegemony: Open Battlefield*
- **Sovereign Country Database**: 180+ real-world sovereign states with GDP, population, standing army, armor, air wings, naval task forces, fortification tiers, and government classifications.
- **Deterministic Simulation Clock**: Pausing, 1x, 2x, 3x simulation speeds with day ticks and duplicate-event prevention.

### 3. Economic Simulation & Treasury
- **Daily Financial Cashflow**:
  - Tax revenue: Pro-rated by GDP, population, and interactive national tax slider (15% to 45%).
  - Trade agreement tariffs: Additional revenue from international trade pacts.
  - Upkeep: Division maintenance costs and infrastructure depreciation.
- **Infrastructure Projects**: 5-tier national infrastructure upgrades accelerating state income and military logistics.

### 4. Military Command & Warfare System
- **Forces**: Infantry divisions, armored combat brigades, air superiority wings, naval task forces.
- **Homeland Fortifications**: Hardened defensive bunkers (Levels 1-3) conferring +25% defense bonus per tier.
- **Procurement & Mobilization**: Production orders with real treasury costs and duration countdowns.
- **Tactical Combat Resolution**: Evaluates attacker/defender power ratios, technologies, fortifications, and casualties.
- **Territorial Occupation**: Decisive breakthroughs trigger territorial control changes, war reparations, and battle reports.

### 5. Diplomacy & International Alliances
- **Diplomatic Ledger**: Filter sovereign nations by Allied, Non-Aggression, Neutral, Rivals, and At War.
- **Bilateral Treaties**: Non-aggression pacts, trade agreements, financial aid lend-lease ($1B), peace proposals, and official war declarations.
- **Autonomous AI Decisions**: AI nations manage their own recruitment, tax rates, and research.
- **Global Power Blocs**: NATO, SCO, CSTO, and custom charter founding with collective power aggregates.

### 6. COMMANDER AI (Tactical Strategic Advisor)
- **Gemini 3.8-Flash Server-Side Integration**: Evaluates real-time treasury, border strength, threats, and stability.
- **Actionable Execution**: AI suggests concrete actions (e.g., recruit armor, upgrade infrastructure, tax reform) that players can directly execute into the simulation state with one click.
- **Dual-Language Support**: English and Persian (فارسی).

### 7. Persistence & Multiplayer
- **Multi-Slot Saves**: LocalStorage/IndexedDB slots, automated 60-second autosaves, JSON export, and schema-validated JSON imports.
- **Multiplayer Hub**: Public room discovery, room codes, synchronized lobbies, player readiness, and live diplomatic chat channels (World & Alliance).
- **Player Profiles & Service Records**: Combat rating (ELO), ranks, campaign medals, Google and Email cloud sync.

### 8. Web Audio Procedural Sound Engine
- Procedural audio feedback with zero external assets: radar ping, tactical clicks, war klaxon alert, artillery explosions, and triumph fanfares.
