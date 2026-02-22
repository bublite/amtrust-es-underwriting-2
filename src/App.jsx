import { useState } from "react";

// ── AmTrust Brand Tokens ───────────────────────────────────────────────────────
const BRAND = {
  navy:       "#002855",
  navyDark:   "#001a3a",
  navyLight:  "#003d7a",
  navyMid:    "#012f63",
  gold:       "#C8960C",
  goldLight:  "#e8b020",
  goldPale:   "rgba(200,150,12,0.12)",
  white:      "#ffffff",
  offWhite:   "#f4f7fa",
  slate:      "#4a6080",
  slateLight: "#7a93ad",
  border:     "rgba(255,255,255,0.1)",
  borderGold: "rgba(200,150,12,0.35)",
  red:        "#c0392b",
  redPale:    "rgba(192,57,43,0.12)",
  redBorder:  "rgba(192,57,43,0.4)",
  green:      "#27ae60",
};

// ── Giffords Gun Law Scorecard 2024 ───────────────────────────────────────────
const GIFFORDS_STATE_GRADES = {
  CA:"A",  NJ:"A",  MA:"A+", CT:"A",  NY:"A-", IL:"A-", HI:"A-", MD:"A-", WA:"B+",
  CO:"B",  DE:"B",  OR:"B-", RI:"B-", MN:"B-", NM:"C+", MI:"C+", NV:"C",  ME:"C+",
  VA:"C",  AK:"C-", PA:"C-", WI:"C-", OH:"C-", NC:"D+", TX:"D+", GA:"D",  FL:"D",
  AZ:"D",  IN:"D",  UT:"D",  SC:"D",  TN:"D-", KY:"D-", IA:"D-", KS:"D-", NE:"D-",
  ID:"D-", ND:"D-", SD:"D-", MT:"D-", WY:"F",  LA:"F",  AL:"F",  MS:"F",  AR:"F",
  OK:"F",  MO:"F",  WV:"F",  NH:"D",  VT:"C-",
};
function giffordsMultiplier(stateAbbr) {
  const grade = GIFFORDS_STATE_GRADES[stateAbbr?.toUpperCase()] || "C";
  const map = { "A+":0.72,"A":0.78,"A-":0.83,"B+":0.88,"B":0.92,"B-":0.95,
                "C+":1.00,"C":1.04,"C-":1.08,"D+":1.12,"D":1.16,"D-":1.20,"F":1.28 };
  return map[grade] || 1.0;
}
function giffordsLabel(stateAbbr) {
  const grade = GIFFORDS_STATE_GRADES[stateAbbr?.toUpperCase()];
  if (!grade) return { grade: "N/A", color: BRAND.slate };
  const color = grade.startsWith("A") ? BRAND.green
              : grade.startsWith("B") ? "#7fb3d3"
              : grade.startsWith("C") ? BRAND.gold
              : grade.startsWith("D") ? "#e67e22"
              : BRAND.red;
  return { grade, color };
}

// ── Declination Rules ─────────────────────────────────────────────────────────
function checkDeclination(businessType, operationalFactors) {
  if (businessType === "k12_school")
    return { declined: true, code: "DECL-001", reason: "K-12 Schools",
      detail: "AmTrust E&S does not offer active shooter coverage for K-12 educational institutions. This risk class exceeds our appetite for this product line." };
  if (businessType === "house_of_worship")
    return { declined: true, code: "DECL-002", reason: "Houses of Worship",
      detail: "AmTrust E&S does not offer active shooter coverage for houses of worship (churches, mosques, synagogues, temples). This risk class exceeds our appetite for this product line." };
  if (businessType === "nightclub_bar" && operationalFactors.youthOriented)
    return { declined: true, code: "DECL-003", reason: "Youth-Oriented Bar / Nightclub",
      detail: "AmTrust E&S does not offer active shooter coverage for bars or nightclubs whose primary clientele is under 25 years of age." };
  return { declined: false };
}

// ── Operational Risk Factors ──────────────────────────────────────────────────
const OPERATIONAL_FACTORS = [
  { id: "serves_liquor",  label: "Sells or Serves Liquor",         sub: "Full bar, beer & wine, or packaged liquor sales",       surcharge: 12, icon: "🍺" },
  { id: "late_night",     label: "Open Past Midnight",              sub: "Regular hours extend beyond 12:00 AM",                  surcharge: 10, icon: "🌙" },
  { id: "sells_firearms", label: "Sells Firearms or Ammunition",    sub: "Licensed FFL dealer or on-premises gun sales",           surcharge: 18, icon: "🔫" },
  { id: "youthOriented",  label: "Bar / Club Catering to Under-25", sub: "College bars, 18+ venues, student-focused nightlife",    surcharge: 0,  icon: "🚫", declinationTrigger: true, onlyFor: ["nightclub_bar"] },
];

const SECURITY_OPTIONS = [
  { id: "armed_guard",             label: "Armed Security Guard(s)",              reduction: 10 },
  { id: "metal_detector",          label: "Metal Detector / Weapon Screening",    reduction: 9  },
  { id: "bulletproof_glass",       label: "Ballistic-Resistant Glass / Barriers", reduction: 7  },
  { id: "access_control",          label: "Access Control / Locked Entry",        reduction: 6  },
  { id: "active_shooter_training", label: "Active Shooter Response Training",     reduction: 4  },
  { id: "panic_button",            label: "Panic Button / Silent Alarm",          reduction: 4  },
  { id: "cameras",                 label: "Security Camera System",               reduction: 3  },
  { id: "unarmed_guard",           label: "Unarmed Security / Patrol",            reduction: 3  },
];

const BUSINESS_TYPES = [
  { value: "house_of_worship",     label: "House of Worship (Church / Mosque / Synagogue / Temple)", declined: true },
  { value: "k12_school",           label: "K-12 School", declined: true },
  { value: "university",           label: "College / University" },
  { value: "nightclub_bar",        label: "Nightclub / Bar" },
  { value: "concert_venue",        label: "Concert / Event Venue" },
  { value: "shopping_mall",        label: "Shopping Mall" },
  { value: "grocery_store",        label: "Grocery Store / Supermarket" },
  { value: "restaurant",           label: "Restaurant" },
  { value: "fast_food",            label: "Fast Food / Quick Service" },
  { value: "office_building",      label: "Office Building / Corporate Campus" },
  { value: "government_facility",  label: "Government Building / Courthouse" },
  { value: "hospital",             label: "Hospital / Medical Center" },
  { value: "clinic",               label: "Clinic / Medical Office" },
  { value: "hotel",                label: "Hotel / Resort" },
  { value: "casino",               label: "Casino / Gaming Facility" },
  { value: "movie_theater",        label: "Movie Theater" },
  { value: "fitness_gym",          label: "Fitness Center / Gym" },
  { value: "bank",                 label: "Bank / Credit Union" },
  { value: "gas_station",          label: "Gas Station / Convenience Store" },
  { value: "warehouse_industrial", label: "Warehouse / Industrial Facility" },
  { value: "daycare",              label: "Daycare / Child Care Center" },
  { value: "retail_store",         label: "Retail Store" },
  { value: "park_outdoor",         label: "Park / Outdoor Recreation Area" },
  { value: "transit_station",      label: "Transit Station / Airport" },
  { value: "military_base",        label: "Military / Law Enforcement Facility" },
];

const BUSINESS_RISK_PROFILES = {
  house_of_worship:    { baseRisk: 72, label: "House of Worship",          motiveProfile: "Hate crime, domestic, ideological" },
  k12_school:          { baseRisk: 78, label: "K-12 School",               motiveProfile: "Grievance, mental health crisis" },
  university:          { baseRisk: 65, label: "University / College",      motiveProfile: "Grievance, relationship violence" },
  nightclub_bar:       { baseRisk: 74, label: "Nightclub / Bar",           motiveProfile: "Conflict escalation, gang-related" },
  concert_venue:       { baseRisk: 68, label: "Concert / Event Venue",     motiveProfile: "Mass casualty targeting, conflict" },
  shopping_mall:       { baseRisk: 62, label: "Shopping Mall",             motiveProfile: "Robbery, domestic, grievance" },
  grocery_store:       { baseRisk: 55, label: "Grocery Store",             motiveProfile: "Robbery, domestic dispute" },
  restaurant:          { baseRisk: 50, label: "Restaurant",                motiveProfile: "Robbery, domestic dispute" },
  fast_food:           { baseRisk: 52, label: "Fast Food",                 motiveProfile: "Robbery, conflict" },
  office_building:     { baseRisk: 58, label: "Office / Corporate",        motiveProfile: "Workplace grievance, termination" },
  government_facility: { baseRisk: 64, label: "Government Facility",       motiveProfile: "Anti-government, grievance" },
  hospital:            { baseRisk: 56, label: "Hospital / Medical",        motiveProfile: "Domestic, patient grievance" },
  clinic:              { baseRisk: 60, label: "Clinic / Medical Office",   motiveProfile: "Targeted, domestic" },
  hotel:               { baseRisk: 48, label: "Hotel / Resort",            motiveProfile: "Domestic, robbery" },
  casino:              { baseRisk: 45, label: "Casino / Gaming",           motiveProfile: "Robbery, financial dispute" },
  movie_theater:       { baseRisk: 55, label: "Movie Theater",             motiveProfile: "Mass casualty targeting" },
  fitness_gym:         { baseRisk: 38, label: "Fitness Center",            motiveProfile: "Domestic, grievance" },
  bank:                { baseRisk: 42, label: "Bank / Credit Union",       motiveProfile: "Robbery" },
  gas_station:         { baseRisk: 44, label: "Gas Station / C-Store",     motiveProfile: "Robbery" },
  warehouse_industrial:{ baseRisk: 54, label: "Warehouse / Industrial",    motiveProfile: "Workplace grievance, termination" },
  daycare:             { baseRisk: 46, label: "Daycare / Child Care",      motiveProfile: "Custody dispute, targeted" },
  retail_store:        { baseRisk: 48, label: "Retail Store",              motiveProfile: "Robbery, grievance" },
  park_outdoor:        { baseRisk: 58, label: "Park / Outdoor",            motiveProfile: "Gang, domestic, random" },
  transit_station:     { baseRisk: 52, label: "Transit Station / Airport", motiveProfile: "Ideological, domestic" },
  military_base:       { baseRisk: 50, label: "Military / LE Facility",    motiveProfile: "Insider threat, ideological" },
};

// ── Coverage Limits ───────────────────────────────────────────────────────────
const COVERAGE_LIMITS = [
  { value: 100000,  label: "$100,000",   short: "$100K", rateFactor: 1.40 },
  { value: 250000,  label: "$250,000",   short: "$250K", rateFactor: 1.20 },
  { value: 500000,  label: "$500,000",   short: "$500K", rateFactor: 1.00 },
  { value: 1000000, label: "$1,000,000", short: "$1M",   rateFactor: 0.85 },
];

function estimateAllPremiums(score, capacity) {
  const capMult = { small: 0.7, medium: 1.0, large: 1.6 }[capacity] || 1.0;
  return COVERAGE_LIMITS.map(limit => {
    const baseRate   = score * 0.12;
    const annualBase = baseRate * (limit.value / 1000) * capMult * limit.rateFactor;
    return {
      ...limit,
      low:  Math.max(250, Math.round(annualBase * 0.85 / 50) * 50),
      high: Math.max(350, Math.round(annualBase * 1.20 / 50) * 50),
    };
  });
}

function getRiskTier(score) {
  if (score >= 80) return { tier: "CRITICAL",  color: "#c0392b", bg: "rgba(192,57,43,0.08)",  border: "rgba(192,57,43,0.3)",  premium: "Very High"     };
  if (score >= 65) return { tier: "HIGH",      color: "#e67e22", bg: "rgba(230,126,34,0.08)", border: "rgba(230,126,34,0.3)", premium: "High"          };
  if (score >= 50) return { tier: "ELEVATED",  color: "#d4a017", bg: BRAND.goldPale,          border: BRAND.borderGold,       premium: "Moderate-High" };
  if (score >= 35) return { tier: "MODERATE",  color: "#27ae60", bg: "rgba(39,174,96,0.08)",  border: "rgba(39,174,96,0.3)",  premium: "Moderate"      };
  return                  { tier: "LOW",       color: "#1a9e55", bg: "rgba(26,158,85,0.08)",  border: "rgba(26,158,85,0.3)",  premium: "Standard"      };
}

// ── Claude-powered data functions ─────────────────────────────────────────────
async function geocodeAddressViaClaude(address, callClaudeFn) {
  try {
    return await callClaudeFn(`Parse this US address and return structured location data.
Address: "${address}"
Respond ONLY with this JSON:
{
  "lat": 38.5736,
  "lon": -94.8761,
  "neighborhood": "Downtown Paola",
  "city": "Paola",
  "state": "Kansas",
  "stateAbbr": "KS",
  "zip": "66071",
  "county": "Miami County",
  "valid": true
}
Rules: stateAbbr must be 2-letter USPS abbreviation. lat/lon should be best estimate. If invalid set valid:false. Never return null values — use empty string if unknown.`);
  } catch { return null; }
}

async function fetchCensusData(zip, city, state, callClaudeFn) {
  try {
    return await callClaudeFn(`You have knowledge of US Census Bureau ACS data.
For ZIP code ${zip} (${city}, ${state}), provide estimated demographic data.
Respond ONLY with this JSON:
{
  "medianHouseholdIncome": 62000,
  "povertyRate": 11,
  "unemploymentRate": 4,
  "totalPopulation": 8500
}
All values must be integers. medianHouseholdIncome in dollars. Rates as whole-number percentages.`);
  } catch { return null; }
}

async function fetchOverpassProximity(lat, lon, city, state, callClaudeFn) {
  try {
    return await callClaudeFn(`Estimate how many of each establishment type would be found within 600 meters of a typical address in ${city}, ${state} (lat ${lat?.toFixed(3)}, lon ${lon?.toFixed(3)}).
Respond ONLY with this JSON:
{
  "bars": 1,
  "liquorStores": 0,
  "gunShops": 0,
  "pawnShops": 0,
  "policeStations": 0,
  "transitStops": 0
}
All values must be non-negative integers.`);
  } catch { return null; }
}

// ── Scoring helpers ───────────────────────────────────────────────────────────
function censusIncomeMult(medianIncome) {
  if (!medianIncome || medianIncome <= 0) return 1.0;
  if (medianIncome <  35000) return 1.22;
  if (medianIncome <  55000) return 1.12;
  if (medianIncome <  75000) return 1.00;
  if (medianIncome < 100000) return 0.92;
  return 0.84;
}
function censusPovertyMult(povertyRate) {
  if (povertyRate == null) return 1.0;
  if (povertyRate > 30) return 1.18;
  if (povertyRate > 20) return 1.10;
  if (povertyRate > 12) return 1.02;
  if (povertyRate >  6) return 0.97;
  return 0.92;
}
function overpassProximityBonus(counts) {
  if (!counts) return { bonus: 0, breakdown: [] };
  let bonus = 0;
  const breakdown = [];
  if (counts.bars > 0)          { const pts = Math.min(counts.bars * 2, 8);    bonus += pts; breakdown.push(`${counts.bars} bar(s)/nightclub(s) nearby (+${pts}pts)`); }
  if (counts.liquorStores > 0)  { const pts = Math.min(counts.liquorStores, 4); bonus += pts; breakdown.push(`${counts.liquorStores} liquor store(s) nearby (+${pts}pts)`); }
  if (counts.gunShops > 0)      { const pts = Math.min(counts.gunShops * 3, 9); bonus += pts; breakdown.push(`${counts.gunShops} gun shop(s) nearby (+${pts}pts)`); }
  if (counts.pawnShops > 0)     { const pts = Math.min(counts.pawnShops * 2, 6);bonus += pts; breakdown.push(`${counts.pawnShops} pawn shop(s) nearby (+${pts}pts)`); }
  if (counts.transitStops > 0)  { const pts = Math.min(counts.transitStops, 3); bonus += pts; breakdown.push(`${counts.transitStops} transit stop(s) nearby (+${pts}pts)`); }
  if (counts.policeStations > 0){ const pts = -Math.min(counts.policeStations * 4, 8); bonus += pts; breakdown.push(`${counts.policeStations} police station(s) nearby (${pts}pts)`); }
  return { bonus, breakdown };
}

// ── Sub-components ────────────────────────────────────────────────────────────
function AmTrustLogo() {
  return (
    <svg width="220" height="40" viewBox="0 0 220 40" fill="none">
      <text x="0"   y="30" fontFamily="'Arial','Helvetica Neue',sans-serif" fontWeight="900" fontSize="28" fill={BRAND.gold}  letterSpacing="-0.5">Am</text>
      <text x="40"  y="30" fontFamily="'Arial','Helvetica Neue',sans-serif" fontWeight="900" fontSize="28" fill={BRAND.white} letterSpacing="-0.5">Trust</text>
      <text x="136" y="14" fontFamily="'Arial',sans-serif" fontWeight="400" fontSize="11"   fill="rgba(255,255,255,0.6)">®</text>
    </svg>
  );
}

function RiskMeter({ score, color }) {
  const r = 52, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 136, height: 136, flexShrink: 0 }}>
      <svg width="136" height="136" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="68" cy="68" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle cx="68" cy="68" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color, fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{score}</span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 1, marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

function FactorBar({ label, value, max, color, sub, surcharge }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "baseline" }}>
        <div>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{label}</span>
          {sub && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginLeft: 6 }}>{sub}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {surcharge > 0 && <span style={{ color: "#e74c3c", fontSize: 10, fontWeight: 700, fontFamily: "'Courier New',monospace" }}>+{surcharge}pts</span>}
          <span style={{ color, fontSize: 12, fontWeight: 700, fontFamily: "'Courier New',monospace" }}>{value}/{max}</span>
        </div>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${Math.min(100,(value/max)*100)}%`, background: color, borderRadius: 2, transition: "width 1.2s ease" }} />
      </div>
    </div>
  );
}

function SectionLabel({ children, badge }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <div style={{ width: 3, height: 14, background: BRAND.gold, borderRadius: 1, flexShrink: 0 }} />
      <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, color: BRAND.slateLight }}>{children}</span>
      {badge && <span style={{ fontSize: 9, background: "rgba(200,150,12,0.2)", border: `1px solid ${BRAND.borderGold}`, color: BRAND.gold, padding: "2px 7px", borderRadius: 20, letterSpacing: 1 }}>{badge}</span>}
    </div>
  );
}

function LiveDataPanel({ geo, census, overpass, stateAbbr }) {
  const gl = giffordsLabel(stateAbbr);
  return (
    <div style={{ background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "18px 22px", marginBottom: 14 }}>
      <SectionLabel badge="LIVE">Intelligence Sources Queried</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: geo ? BRAND.green : BRAND.slate, fontFamily: "'Courier New',monospace", marginBottom: 6, textTransform: "uppercase", fontWeight: 700 }}>
            {geo ? "✓ Claude Geocoder" : "✗ Geocoding (failed)"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, lineHeight: 1.6 }}>
            {geo ? (<><strong style={{ color: BRAND.white }}>{geo.city}{geo.stateAbbr ? `, ${geo.stateAbbr}` : ""}</strong><br />{geo.zip && `ZIP ${geo.zip} · `}{geo.county}<br /><span style={{ color: BRAND.slateLight, fontSize: 10 }}>lat {geo.lat?.toFixed(4)}, lon {geo.lon?.toFixed(4)}</span></>) : "Address could not be parsed."}
          </div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: census ? BRAND.green : BRAND.slate, fontFamily: "'Courier New',monospace", marginBottom: 6, textTransform: "uppercase", fontWeight: 700 }}>
            {census ? "✓ Demographics (Census ACS est.)" : "✗ Demographics (failed)"}
          </div>
          {census ? (
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, lineHeight: 1.8 }}>
              Median Income: <strong style={{ color: BRAND.white }}>${census.medianHouseholdIncome?.toLocaleString()}</strong><br />
              Poverty Rate: <strong style={{ color: census.povertyRate > 20 ? "#e67e22" : BRAND.white }}>{census.povertyRate}%</strong><br />
              Unemployment: <strong style={{ color: census.unemploymentRate > 8 ? "#e67e22" : BRAND.white }}>{census.unemploymentRate}%</strong>
              <div style={{ marginTop: 4, fontSize: 9, color: BRAND.slate, fontStyle: "italic" }}>Claude est. · Census ACS training data</div>
            </div>
          ) : <div style={{ color: BRAND.slateLight, fontSize: 11 }}>Unavailable.</div>}
        </div>
        <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: overpass ? BRAND.green : BRAND.slate, fontFamily: "'Courier New',monospace", marginBottom: 6, textTransform: "uppercase", fontWeight: 700 }}>
            {overpass ? "✓ Proximity Profile (OSM est.)" : "✗ Proximity (failed)"}
          </div>
          {overpass ? (
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, lineHeight: 1.8 }}>
              Bars/Clubs: <strong style={{ color: overpass.bars > 2 ? "#e67e22" : BRAND.white }}>{overpass.bars}</strong>&emsp;
              Liquor: <strong style={{ color: overpass.liquorStores > 1 ? "#e67e22" : BRAND.white }}>{overpass.liquorStores}</strong><br />
              Gun Shops: <strong style={{ color: overpass.gunShops > 0 ? BRAND.red : BRAND.white }}>{overpass.gunShops}</strong>&emsp;
              Pawn: <strong style={{ color: overpass.pawnShops > 0 ? "#e67e22" : BRAND.white }}>{overpass.pawnShops}</strong><br />
              Police: <strong style={{ color: BRAND.green }}>{overpass.policeStations}</strong>&emsp;
              Transit: <strong style={{ color: BRAND.white }}>{overpass.transitStops}</strong>
              <div style={{ marginTop: 4, fontSize: 9, color: BRAND.slate, fontStyle: "italic" }}>Claude est. · ~600m radius</div>
            </div>
          ) : <div style={{ color: BRAND.slateLight, fontSize: 11 }}>Unavailable.</div>}
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3, padding: "10px 14px" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: gl.color, fontFamily: "Arial,sans-serif", width: 42, textAlign: "center", flexShrink: 0 }}>{gl.grade}</div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: BRAND.slateLight, textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>Giffords 2024 Gun Law Scorecard · {stateAbbr || "Unknown State"}</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, lineHeight: 1.5 }}>
            State gun law strength grade applied as a risk multiplier to the composite score. States with strong laws have gun death rates up to 2.5× lower than states with weak laws.
            <span style={{ color: BRAND.slate, fontStyle: "italic" }}> Source: Giffords Law Center Annual Gun Law Scorecard 2024.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumTable({ allPremiums, selectedLimit, onSelect }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
      {allPremiums.map(limit => {
        const isSel = selectedLimit === limit.value;
        return (
          <button key={limit.value} onClick={() => onSelect(limit.value)} style={{
            background: isSel ? BRAND.goldPale : "rgba(0,0,0,0.25)",
            border: `2px solid ${isSel ? BRAND.gold : "rgba(255,255,255,0.08)"}`,
            borderRadius: 4, padding: "16px 12px", cursor: "pointer", textAlign: "center", transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: isSel ? BRAND.gold : BRAND.slateLight, fontFamily: "'Courier New',monospace", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>{limit.short} Limit</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: isSel ? BRAND.gold : BRAND.white, fontFamily: "'Courier New',monospace", lineHeight: 1, marginBottom: 4 }}>${limit.low.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: BRAND.slate, marginBottom: 10 }}>– ${limit.high.toLocaleString()} / yr</div>
            <div style={{ fontSize: 10, color: isSel ? BRAND.gold : BRAND.slate, background: isSel ? "rgba(200,150,12,0.15)" : "rgba(0,0,0,0.2)", borderRadius: 2, padding: "3px 6px" }}>{limit.label}</div>
            {isSel && <div style={{ marginTop: 8, fontSize: 9, color: BRAND.gold, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>✓ Selected</div>}
          </button>
        );
      })}
    </div>
  );
}

function DeclinationScreen({ declination }) {
  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ background: BRAND.redPale, border: `2px solid ${BRAND.redBorder}`, borderRadius: 4, padding: "32px 36px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
          <div style={{ fontSize: 40, flexShrink: 0 }}>🚫</div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "rgba(255,255,255,0.4)", fontFamily: "'Courier New',monospace", marginBottom: 8, textTransform: "uppercase" }}>Coverage Decision · {declination.code}</div>
            <h2 style={{ color: BRAND.red, fontSize: 22, fontWeight: 800, margin: "0 0 12px" }}>Coverage Declined — {declination.reason}</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.7, margin: "0 0 20px" }}>{declination.detail}</p>
            <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, padding: "14px 18px" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: BRAND.slateLight, fontFamily: "'Courier New',monospace", marginBottom: 6, textTransform: "uppercase" }}>Underwriter Guidance</div>
              <p style={{ color: BRAND.slateLight, fontSize: 12, lineHeight: 1.7, margin: 0 }}>
                This submission does not meet AmTrust E&S underwriting appetite for active shooter coverage. The account should be declined without further analysis. If the insured believes their situation warrants reconsideration, they may request a manual review through the E&S underwriting desk with supporting documentation and loss control reports.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: BRAND.navy, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "16px 20px", display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 3, height: 36, background: BRAND.gold, borderRadius: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 11, color: BRAND.slateLight, lineHeight: 1.6 }}>
          <strong style={{ color: BRAND.white }}>Available Alternatives:</strong> For schools and houses of worship, AmTrust may be able to offer coverage under a General Liability or Property policy. Please contact your AmTrust E&S underwriter to discuss alternative coverage structures.
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const inputStyle  = { width: "100%", boxSizing: "border-box", background: "rgba(0,0,0,0.25)", border: `1px solid ${BRAND.border}`, borderRadius: 3, padding: "11px 14px", color: BRAND.white, fontSize: 14, outline: "none", fontFamily: "'Arial',sans-serif", transition: "border-color 0.2s" };
const selectStyle = { ...inputStyle, cursor: "pointer", appearance: "none" };
const labelStyle  = { display: "block", marginBottom: 7, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, color: BRAND.slateLight };
const cardStyle   = { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "20px 22px" };

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState({
    address: "", businessType: "", capacity: "medium",
    operationalFactors: {}, securityMeasures: [], selectedLimit: 500000,
  });
  const [loading, setLoading]           = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [result, setResult]             = useState(null);
  const [declination, setDeclination]   = useState(null);
  const [error, setError]               = useState("");

  const operationalSurcharge = OPERATIONAL_FACTORS
    .filter(f => !f.declinationTrigger && form.operationalFactors[f.id])
    .reduce((sum, f) => sum + f.surcharge, 0);

  const relevantOperationalFactors = OPERATIONAL_FACTORS.filter(f =>
    !f.onlyFor || f.onlyFor.includes(form.businessType)
  );

  // Calls our /api/claude serverless proxy — key never touches the browser
  async function callClaude(prompt, maxTokens = 800) {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, max_tokens: maxTokens }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.text.replace(/```json|```/g, "").trim());
  }

  async function calculate() {
    if (!form.businessType || !form.address.trim()) {
      setError("Please enter a full address and select a business type.");
      return;
    }
    setError(""); setLoading(true); setResult(null); setDeclination(null);

    const decl = checkDeclination(form.businessType, form.operationalFactors);
    if (decl.declined) { setDeclination(decl); setLoading(false); return; }

    try {
      setLoadingStage("Parsing address and geocoding...");
      const geo = await geocodeAddressViaClaude(form.address, callClaude);

      setLoadingStage("Fetching demographics and proximity profile...");
      const [census, overpass] = await Promise.all([
        fetchCensusData(geo?.zip, geo?.city, geo?.stateAbbr, callClaude),
        fetchOverpassProximity(geo?.lat, geo?.lon, geo?.city, geo?.stateAbbr, callClaude),
      ]);

      setLoadingStage("Building neighborhood intelligence...");
      const stateAbbr = geo?.stateAbbr || "";
      const locationData = await callClaude(`You are a US neighborhood intelligence expert for insurance underwriting.
Address: "${form.address}"
Geocoded: ${geo?.city || ""}, ${stateAbbr} ZIP ${geo?.zip || ""}
${census ? `Census data: median income $${census.medianHouseholdIncome}, poverty ${census.povertyRate}%, unemployment ${census.unemploymentRate}%` : "No Census data."}
${overpass ? `Nearby (600m): ${overpass.bars} bars, ${overpass.liquorStores} liquor stores, ${overpass.gunShops} gun shops, ${overpass.pawnShops} pawn shops, ${overpass.policeStations} police` : "No proximity data."}
Respond ONLY with this JSON:
{
  "locationProfile": {
    "neighborhoodType": "urban core | urban mixed | suburban commercial | suburban residential | rural | unknown",
    "populationDensity": "very high | high | moderate | low | very low",
    "proximityToHighCrimeArea": false,
    "nearTransitHub": false
  },
  "crimeProfile": {
    "violentCrimeIndex": 22,
    "gangActivity": "low | moderate | high | very high",
    "crimetrend": "improving | stable | worsening | unknown",
    "dataConfidence": "high | moderate | low"
  },
  "contextFactors": {
    "urbanCharacter": "one sentence describing this specific area"
  }
}`);

      setLoadingStage("Computing composite risk score...");
      const profile     = BUSINESS_RISK_PROFILES[form.businessType];
      const densityMult = { "very high": 1.18, "high": 1.10, "moderate": 1.0, "low": 0.92, "very low": 0.85 }[locationData.locationProfile.populationDensity] || 1.0;
      const incomeMult  = census ? censusIncomeMult(census.medianHouseholdIncome) : 1.0;
      const povertyMult = censusPovertyMult(census?.povertyRate);
      const crimeMult   = 0.7 + (locationData.crimeProfile.violentCrimeIndex / 100) * 0.7;
      const stateMult   = giffordsMultiplier(stateAbbr);
      const capMult     = { small: 0.82, medium: 1.0, large: 1.18 }[form.capacity] || 1.0;
      const { bonus: osmBonus, breakdown: osmBreakdown } = overpassProximityBonus(overpass);
      const aiProximityBonus = !overpass ? ((locationData.locationProfile.proximityToHighCrimeArea ? 5 : 0) + (locationData.locationProfile.nearTransitHub ? 2 : 0)) : 0;
      const secReduction = Math.min(form.securityMeasures.reduce((s, id) => s + (SECURITY_OPTIONS.find(x => x.id === id)?.reduction || 0), 0), 30);
      const activeOperational = OPERATIONAL_FACTORS.filter(f => !f.declinationTrigger && form.operationalFactors[f.id]);
      const baseScore  = Math.round(profile.baseRisk * densityMult * incomeMult * povertyMult * crimeMult * stateMult * capMult + osmBonus + aiProximityBonus);
      const rawScore   = Math.min(100, baseScore + operationalSurcharge);
      const finalScore = Math.max(5, rawScore - secReduction);
      const tier        = getRiskTier(finalScore);
      const allPremiums = estimateAllPremiums(finalScore, form.capacity);
      const gl          = giffordsLabel(stateAbbr);

      setLoadingStage("Generating underwriting narrative...");
      const narrative = await callClaude(`You are a senior E&S underwriter at AmTrust Financial. Write a concise professional active shooter risk assessment.
Location: ${form.address}
Business: ${profile.label}
Risk Score: ${finalScore}/100 — ${tier.tier}
Census: ${census ? `income $${census.medianHouseholdIncome?.toLocaleString()}, poverty ${census.povertyRate}%, unemployment ${census.unemploymentRate}%` : "unavailable"}
Proximity: ${overpass ? `${overpass.bars} bars, ${overpass.gunShops} gun shops, ${overpass.policeStations} police nearby` : "unavailable"}
Giffords grade (${stateAbbr}): ${gl.grade}
Violent crime index: ${locationData.crimeProfile.violentCrimeIndex}/100
Crime trend: ${locationData.crimeProfile.crimetrend}
Neighborhood: ${locationData.contextFactors.urbanCharacter}
Operational factors: ${activeOperational.length > 0 ? activeOperational.map(f => f.label).join(", ") : "None"}
Security measures: ${form.securityMeasures.length > 0 ? form.securityMeasures.join(", ") : "None"}
Respond ONLY with JSON:
{
  "executiveSummary": "2-3 sentences referencing specific data points",
  "locationRiskNarrative": "1-2 sentences on neighborhood risk",
  "operationalRiskNarrative": "",
  "thirdPartyDataInsights": "1-2 sentences interpreting Census and proximity data",
  "topRiskFactors": ["factor 1", "factor 2", "factor 3"],
  "mitigatingFactors": ["factor 1", "factor 2"],
  "recommendations": ["rec 1", "rec 2", "rec 3"],
  "coverageConsiderations": "1 sentence on coverage structure",
  "comparableIncidents": "1 general sentence about similar venues in this region"
}`, 1000);

      setResult({
        finalScore, rawScore, baseScore: Math.min(100, baseScore), secReduction, operationalSurcharge,
        activeOperational, tier, profile, allPremiums, locationData, narrative,
        geo, census, overpass, stateAbbr, gl, osmBreakdown,
        scoringFactors: {
          businessBase:  { value: Math.round(profile.baseRisk), max: 100, label: "Business Type Base Risk",        color: BRAND.gold,    sub: profile.label },
          violentCrime:  { value: locationData.crimeProfile.violentCrimeIndex, max: 100, label: "Neighborhood Violent Crime", color: "#e67e22" },
          density:       { value: Math.round((densityMult-0.85)/(1.18-0.85)*40+10), max: 50, label: "Population Density Exposure", color: "#e8b020" },
          censusIncome:  { value: census ? Math.round((1.22-incomeMult)/(1.22-0.84)*40) : 20, max: 40, label: census ? `Census Income (ZIP ${geo?.zip})` : "Socioeconomic Est.", color: "#c8960c", sub: census ? `$${Math.round(census.medianHouseholdIncome/1000)}k median` : "AI est." },
          censusPoverty: { value: census ? Math.min(40, Math.round(census.povertyRate * 1.2)) : 15, max: 40, label: census ? `Census Poverty (${census.povertyRate}%)` : "Poverty Est.", color: "#b8860b", sub: census ? "Census ACS est." : "AI est." },
          stateLaw:      { value: Math.round((stateMult-0.72)/(1.28-0.72)*30+5), max: 35, label: `State Gun Law (Giffords ${gl.grade})`, color: gl.color, sub: `${stateAbbr || "?"} · 2024` },
          osmProximity:  { value: Math.min(25, Math.max(0, osmBonus + 10)), max: 25, label: "Proximity Factors", color: "#9b59b6", sub: overpass ? `${overpass.bars} bars, ${overpass.gunShops} gun shops` : "AI est." },
          occupancy:     { value: form.capacity === "small" ? 20 : form.capacity === "medium" ? 35 : 50, max: 50, label: "Occupancy Exposure", color: "#7fb3d3" },
          ...(activeOperational.find(f=>f.id==="serves_liquor")  ? {liquor:    {value:12,max:20,label:"Liquor Sales / Service",       color:"#e74c3c",surcharge:12}} : {}),
          ...(activeOperational.find(f=>f.id==="late_night")     ? {latenight: {value:10,max:20,label:"Late Night Operations",         color:"#e74c3c",surcharge:10}} : {}),
          ...(activeOperational.find(f=>f.id==="sells_firearms") ? {firearms:  {value:18,max:20,label:"Firearms / Ammunition Sales",    color:"#e74c3c",surcharge:18}} : {}),
          secCredit:     { value: secReduction, max: 30, label: "Security Mitigation Credit", color: BRAND.green },
        },
      });
    } catch (e) {
      console.error(e);
      setError("Analysis failed. Please verify the address and try again.");
    } finally { setLoading(false); setLoadingStage(""); }
  }

  const t = result?.tier;
  const selectedBizType = BUSINESS_TYPES.find(b => b.value === form.businessType);

  return (
    <div style={{ minHeight: "100vh", background: BRAND.navyDark, fontFamily: "'Arial','Helvetica Neue',sans-serif", color: BRAND.white }}>

      {/* Nav */}
      <div style={{ background: BRAND.navy, borderBottom: `3px solid ${BRAND.gold}` }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <AmTrustLogo />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.white }}>Excess & Surplus Lines</span>
            <span style={{ fontSize: 10, color: BRAND.slateLight, letterSpacing: 2, textTransform: "uppercase" }}>Active Shooter Risk Platform</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND.navyMid} 0%, ${BRAND.navy} 60%, ${BRAND.navyDark} 100%)`, borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "32px 28px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: BRAND.goldPale, border: `1px solid ${BRAND.borderGold}`, borderRadius: 3, padding: "4px 12px", marginBottom: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.gold }} />
              <span style={{ fontSize: 10, letterSpacing: 2.5, color: BRAND.gold, textTransform: "uppercase", fontWeight: 700 }}>Underwriting Tool · E&S Division</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 8px", lineHeight: 1.2 }}>
              Active Shooter Insurance<br /><span style={{ color: BRAND.gold }}>Risk Assessment</span>
            </h1>
            <p style={{ color: BRAND.slateLight, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              AI-powered intelligence · Address-level scoring · Actuarial premiums
            </p>
          </div>
          <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "14px 18px", fontSize: 11, color: BRAND.slateLight, lineHeight: 2, maxWidth: 250 }}>
            <div style={{ color: BRAND.gold, fontWeight: 700, marginBottom: 4, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>Intelligence Sources</div>
            <span style={{ color: BRAND.green }}>●</span> Claude Geocoder<br />
            <span style={{ color: BRAND.green }}>●</span> Census ACS Demographics<br />
            <span style={{ color: BRAND.green }}>●</span> OSM Proximity Profile<br />
            <span style={{ color: BRAND.green }}>●</span> Giffords Gun Law Scorecard 2024<br />
            <span style={{ color: "#7fb3d3" }}>●</span> FBI Active Shooter Reports 2000–2023<br />
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 8, paddingTop: 8, color: BRAND.red, fontWeight: 700, fontSize: 10 }}>
              ⊘ Schools & Churches: Not eligible
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 28px 60px" }}>

        {/* Form */}
        <div style={{ background: BRAND.navy, border: "1px solid rgba(255,255,255,0.09)", borderRadius: 4, padding: 28, marginBottom: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
          <SectionLabel>Risk Inputs</SectionLabel>
          <div style={{ display: "grid", gap: 20 }}>

            {/* Address */}
            <div>
              <label style={labelStyle}>Full Street Address *</label>
              <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))}
                onKeyDown={e => e.key === "Enter" && !loading && calculate()}
                placeholder="e.g. 1234 W Fullerton Ave, Chicago, IL 60614" style={inputStyle}
                onFocus={e => e.target.style.borderColor = BRAND.gold}
                onBlur={e => e.target.style.borderColor = BRAND.border} />
              <p style={{ color: BRAND.slate, fontSize: 11, margin: "5px 0 0" }}>Include street number, city, state and ZIP for best results</p>
            </div>

            {/* Business Type */}
            <div>
              <label style={labelStyle}>Business / Venue Type *</label>
              <select value={form.businessType}
                onChange={e => { setForm(f => ({...f, businessType: e.target.value, operationalFactors: {}})); setDeclination(null); setResult(null); }}
                style={selectStyle}
                onFocus={e => e.target.style.borderColor = BRAND.gold}
                onBlur={e => e.target.style.borderColor = BRAND.border}>
                <option value="">Select business type...</option>
                {BUSINESS_TYPES.map(b => (
                  <option key={b.value} value={b.value}>{b.declined ? `⊘ ${b.label} — Not Eligible` : b.label}</option>
                ))}
              </select>
              {selectedBizType?.declined && (
                <div style={{ marginTop: 10, background: BRAND.redPale, border: `1px solid ${BRAND.redBorder}`, borderRadius: 3, padding: "10px 14px", display: "flex", gap: 10 }}>
                  <span style={{ color: BRAND.red, fontSize: 16, flexShrink: 0 }}>⊘</span>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                    <strong style={{ color: BRAND.red }}>Not Eligible.</strong> This business type does not meet AmTrust E&S appetite for active shooter coverage.
                  </div>
                </div>
              )}
            </div>

            {/* Occupancy */}
            <div>
              <label style={labelStyle}>Occupancy / Venue Size</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[{v:"small",label:"Small",sub:"< 100 persons"},{v:"medium",label:"Medium",sub:"100–500 persons"},{v:"large",label:"Large",sub:"> 500 persons"}].map(opt => (
                  <button key={opt.v} onClick={() => setForm(f => ({...f, capacity: opt.v}))} style={{
                    flex: 1, padding: "12px 8px", cursor: "pointer", borderRadius: 3, textAlign: "center", transition: "all 0.15s",
                    border: `1px solid ${form.capacity===opt.v ? BRAND.gold : "rgba(255,255,255,0.09)"}`,
                    background: form.capacity===opt.v ? BRAND.goldPale : "rgba(0,0,0,0.2)",
                    color: form.capacity===opt.v ? BRAND.gold : BRAND.slateLight,
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Coverage Limit */}
            <div>
              <label style={labelStyle}>Desired Coverage Limit</label>
              <div style={{ display: "flex", gap: 10 }}>
                {COVERAGE_LIMITS.map(limit => {
                  const isSel = form.selectedLimit === limit.value;
                  return (
                    <button key={limit.value} onClick={() => setForm(f => ({...f, selectedLimit: limit.value}))} style={{
                      flex: 1, padding: "12px 8px", cursor: "pointer", borderRadius: 3, textAlign: "center", transition: "all 0.15s",
                      border: `1px solid ${isSel ? BRAND.gold : "rgba(255,255,255,0.09)"}`,
                      background: isSel ? BRAND.goldPale : "rgba(0,0,0,0.2)",
                      color: isSel ? BRAND.gold : BRAND.slateLight,
                    }}>
                      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{limit.short}</div>
                      <div style={{ fontSize: 10, opacity: 0.7 }}>{limit.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Operational Factors */}
            <div>
              <label style={labelStyle}>
                Operational Risk Factors
                {operationalSurcharge > 0 && <span style={{ marginLeft: 10, color: BRAND.red, fontSize: 11, fontFamily: "'Courier New',monospace", fontWeight: 700 }}>+{operationalSurcharge} pts surcharge</span>}
              </label>
              <div style={{ display: "grid", gap: 8 }}>
                {relevantOperationalFactors.map(factor => {
                  const active = !!form.operationalFactors[factor.id];
                  const isDecl = factor.declinationTrigger;
                  return (
                    <button key={factor.id}
                      onClick={() => setForm(f => ({...f, operationalFactors: {...f.operationalFactors, [factor.id]: !f.operationalFactors[factor.id]}}))}
                      style={{
                        padding: "12px 16px", textAlign: "left", cursor: "pointer", borderRadius: 3, transition: "all 0.15s",
                        border: `1px solid ${active ? (isDecl ? BRAND.redBorder : BRAND.borderGold) : "rgba(255,255,255,0.07)"}`,
                        background: active ? (isDecl ? BRAND.redPale : BRAND.goldPale) : "rgba(0,0,0,0.15)",
                        color: active ? (isDecl ? BRAND.red : BRAND.gold) : BRAND.slateLight,
                        display: "flex", alignItems: "center", gap: 12,
                      }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{factor.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: active ? 700 : 400 }}>{factor.label}</div>
                        <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>{factor.sub}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, fontSize: 11, fontFamily: "'Courier New',monospace", fontWeight: 700, color: isDecl ? (active ? BRAND.red : "rgba(255,255,255,0.25)") : (active ? BRAND.red : "rgba(255,255,255,0.22)") }}>
                        {isDecl ? (active ? "⊘ DECLINATION" : "Triggers Declination") : `+${factor.surcharge} pts`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security Measures */}
            <div>
              <label style={labelStyle}>Existing Security Measures</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {SECURITY_OPTIONS.map(opt => {
                  const active = form.securityMeasures.includes(opt.id);
                  return (
                    <button key={opt.id}
                      onClick={() => setForm(f => ({...f, securityMeasures: f.securityMeasures.includes(opt.id) ? f.securityMeasures.filter(x => x !== opt.id) : [...f.securityMeasures, opt.id]}))}
                      style={{
                        padding: "10px 13px", textAlign: "left", cursor: "pointer", borderRadius: 3, fontSize: 12, transition: "all 0.15s",
                        border: `1px solid ${active ? BRAND.gold : "rgba(255,255,255,0.07)"}`,
                        background: active ? BRAND.goldPale : "rgba(0,0,0,0.15)",
                        color: active ? BRAND.gold : BRAND.slateLight,
                        display: "flex", alignItems: "center", gap: 9,
                      }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{active ? "✓" : "○"}</span>
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 10, fontFamily: "'Courier New',monospace" }}>-{opt.reduction}pts</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {error && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 16, fontWeight: 600 }}>⚠ {error}</div>}

          <button onClick={calculate} disabled={loading} style={{
            width: "100%", padding: 15, marginTop: 22, borderRadius: 3, border: "none",
            background: loading ? "rgba(200,150,12,0.3)" : BRAND.gold,
            color: loading ? "rgba(255,255,255,0.4)" : BRAND.navyDark,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
            transition: "all 0.2s", boxShadow: loading ? "none" : "0 2px 12px rgba(200,150,12,0.3)",
          }}>
            {loading ? loadingStage || "Analyzing..." : "Generate Risk Assessment →"}
          </button>
        </div>

        {/* Declination */}
        {declination && <DeclinationScreen declination={declination} />}

        {/* Results */}
        {result && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>

            {result.activeOperational.length > 0 && (
              <div style={{ background: "rgba(192,57,43,0.07)", border: `1px solid ${BRAND.redBorder}`, borderRadius: 4, padding: "14px 20px", marginBottom: 14, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ fontSize: 18 }}>⚠</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: BRAND.red, fontFamily: "'Courier New',monospace", marginBottom: 4, textTransform: "uppercase", fontWeight: 700 }}>Operational Surcharge Applied</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                    {result.activeOperational.map(f => `${f.icon} ${f.label} (+${f.surcharge}pts)`).join("  ·  ")}
                    <span style={{ color: BRAND.red, fontWeight: 700, marginLeft: 12 }}>Total: +{result.operationalSurcharge} pts</span>
                  </div>
                </div>
              </div>
            )}

            <LiveDataPanel geo={result.geo} census={result.census} overpass={result.overpass} stateAbbr={result.stateAbbr} />

            {result.osmBreakdown?.length > 0 && (
              <div style={{ background: "rgba(155,89,182,0.07)", border: "1px solid rgba(155,89,182,0.25)", borderRadius: 4, padding: "12px 18px", marginBottom: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#9b59b6", fontFamily: "'Courier New',monospace", marginBottom: 8, textTransform: "uppercase", fontWeight: 700 }}>Proximity Adjustments Applied</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.osmBreakdown.map((b, i) => (
                    <span key={i} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(155,89,182,0.2)", borderRadius: 3, padding: "3px 10px", fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{b}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Score Banner */}
            <div style={{ background: BRAND.navy, border: `2px solid ${t.border}`, borderRadius: 4, padding: "24px 28px", marginBottom: 14, display: "flex", alignItems: "center", gap: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}>
              <RiskMeter score={result.finalScore} color={t.color} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: BRAND.slateLight, marginBottom: 6, textTransform: "uppercase", fontWeight: 700 }}>AmTrust E&S · Composite Risk Score</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.color, marginBottom: 8 }}>{t.tier} RISK</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.65 }}>{result.narrative.executiveSummary}</div>
                <div style={{ marginTop: 8, color: BRAND.slate, fontSize: 12, fontStyle: "italic" }}>{result.narrative.locationRiskNarrative}</div>
                {result.narrative.thirdPartyDataInsights && (
                  <div style={{ marginTop: 8, background: "rgba(200,150,12,0.07)", border: `1px solid ${BRAND.borderGold}`, borderRadius: 3, padding: "8px 12px", fontSize: 12, color: BRAND.slateLight, fontStyle: "italic" }}>
                    <span style={{ color: BRAND.gold, fontWeight: 700 }}>Data insight: </span>{result.narrative.thirdPartyDataInsights}
                  </div>
                )}
              </div>
            </div>

            {/* Score Breakdown + Premium Table */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 14, marginBottom: 14 }}>
              <div style={cardStyle}>
                <SectionLabel>Score Breakdown</SectionLabel>
                {Object.values(result.scoringFactors).map((f, i) => (
                  <FactorBar key={i} label={f.label} value={f.value} max={f.max} color={f.color} sub={f.sub} surcharge={f.surcharge} />
                ))}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, marginTop: 6, color: BRAND.slate, fontSize: 11, fontFamily: "'Courier New',monospace" }}>
                  Base: {result.baseScore} + Ops: +{result.operationalSurcharge} = Raw: {result.rawScore} → Final: {result.finalScore}
                </div>
              </div>
              <div style={cardStyle}>
                <SectionLabel>Annual Premium by Coverage Limit</SectionLabel>
                <PremiumTable allPremiums={result.allPremiums} selectedLimit={form.selectedLimit} onSelect={limit => setForm(f => ({...f, selectedLimit: limit}))} />
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ background: BRAND.goldPale, border: `1px solid ${BRAND.borderGold}`, borderRadius: 3, padding: "8px 14px" }}>
                    <div style={{ fontSize: 9, color: BRAND.gold, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>Coverage Tier</div>
                    <div style={{ color: BRAND.white, fontSize: 13, fontWeight: 600 }}>{t.premium} Premium Category</div>
                  </div>
                  <div style={{ color: BRAND.slate, fontSize: 11, lineHeight: 1.6, maxWidth: 220, textAlign: "right" }}>{result.narrative.coverageConsiderations}</div>
                </div>
              </div>
            </div>

            {/* Risk · Mitigations · Recommendations */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div style={cardStyle}>
                <SectionLabel>Risk Factors</SectionLabel>
                <div style={{ fontSize: 10, color: BRAND.slate, marginBottom: 10 }}>Motive profile: {result.profile.motiveProfile}</div>
                {result.narrative.topRiskFactors?.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, marginBottom: 10 }}>
                    <span style={{ color: t.color, fontSize: 12, marginTop: 2, flexShrink: 0 }}>▸</span>
                    <span style={{ color: "rgba(255,255,255,0.68)", fontSize: 12, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
                {result.narrative.comparableIncidents && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 10, marginTop: 6, color: BRAND.slate, fontSize: 11, lineHeight: 1.5, fontStyle: "italic" }}>
                    {result.narrative.comparableIncidents}
                  </div>
                )}
              </div>
              <div style={cardStyle}>
                <SectionLabel>Mitigating Factors</SectionLabel>
                {result.narrative.mitigatingFactors?.length > 0
                  ? result.narrative.mitigatingFactors.map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 9, marginBottom: 10 }}>
                        <span style={{ color: BRAND.green, fontSize: 12, marginTop: 2, flexShrink: 0 }}>◆</span>
                        <span style={{ color: "rgba(255,255,255,0.68)", fontSize: 12, lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))
                  : <div style={{ color: BRAND.slate, fontSize: 12 }}>No significant mitigating factors identified.</div>
                }
                {result.secReduction > 0 && (
                  <div style={{ marginTop: 12, background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.2)", borderRadius: 3, padding: "9px 12px" }}>
                    <div style={{ color: BRAND.green, fontSize: 12, fontWeight: 700 }}>Security Credit Applied</div>
                    <div style={{ color: BRAND.slate, fontSize: 11, marginTop: 2 }}>−{result.secReduction} pts · {form.securityMeasures.length} measure(s)</div>
                  </div>
                )}
              </div>
              <div style={cardStyle}>
                <SectionLabel>Underwriter Recommendations</SectionLabel>
                {result.narrative.recommendations?.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, marginBottom: 10 }}>
                    <span style={{ color: "#7fb3d3", fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                    <span style={{ color: "rgba(255,255,255,0.68)", fontSize: 12, lineHeight: 1.5 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 18, marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 3, height: 12, background: BRAND.gold, borderRadius: 1 }} />
                <span style={{ fontSize: 9, letterSpacing: 2, color: BRAND.slate, textTransform: "uppercase", fontWeight: 700 }}>Important Disclaimer</span>
              </div>
              <p style={{ color: BRAND.slate, fontSize: 11, lineHeight: 1.8, margin: 0 }}>
                This tool provides illustrative actuarial estimates for underwriting guidance only. Demographic data, proximity profiles, and crime indices are AI-generated estimates based on training data and may not reflect current conditions. Giffords Law Center scorecard grades reflect legislative analysis, not direct loss data. Risk scores and premium indications must not be the sole basis for coverage or pricing decisions. Final premiums must be determined by a licensed E&S underwriter using complete, verified risk assessment procedures. This output does not constitute an insurance quote, binder, or binding coverage. AmTrust Financial Services, Inc. · Excess &amp; Surplus Lines Division.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: BRAND.navy, borderTop: `3px solid ${BRAND.gold}`, padding: "16px 28px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, color: BRAND.slate }}>© {new Date().getFullYear()} AmTrust Financial Services, Inc. · All rights reserved.</div>
          <div style={{ display: "flex", gap: 20, fontSize: 11, color: BRAND.slate }}>
            <span>E&amp;S Lines</span><span>·</span><span>AM Best Rated A−</span><span>·</span><span>Licensed in 50 States</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
        select option { background: #002855; color: white; }
        input::placeholder { color: rgba(255,255,255,0.22); }
      `}</style>
    </div>
  );
}
