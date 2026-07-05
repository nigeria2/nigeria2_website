import React, { useState } from 'react'

const COLORS: Record<string, string> = { 
  APC: "#1f6fd6", 
  PDP: "#c0392b", 
  LP: "#e05a1f", 
  NNPP: "#f0b429", 
  APGA: "#7b3fb5", 
  SDP: "#0f8a4a", 
  Others: "#8aa093" 
}
const ORDER = ["APC", "PDP", "LP", "NNPP", "APGA", "SDP", "Others"]

// Presidential national projection (%)
const PRES: Record<string, number> = { APC: 28, PDP: 24, LP: 22, NNPP: 9, APGA: 6, SDP: 4, Others: 7 }
const PRES_TREND: Record<string, string> = { APC: "-2", PDP: "+1", LP: "+3", NNPP: "+1", APGA: "±0", SDP: "-1", Others: "-2" }

// Governor overview — governorships held (of 36 states)
const SEATS: Record<string, number> = { APC: 19, PDP: 11, LP: 2, NNPP: 1, APGA: 1, SDP: 1, Others: 1 }

// Per-state governor projections (%)
const STATES: Record<string, Record<string, number>> = {
  "Lagos":     { APC: 44, PDP: 18, LP: 31, NNPP: 2, APGA: 1, SDP: 1, Others: 3 },
  "Kano":      { APC: 29, PDP: 22, LP: 4,  NNPP: 41, APGA: 1, SDP: 1, Others: 2 },
  "Rivers":    { APC: 33, PDP: 49, LP: 12, NNPP: 2, APGA: 1, SDP: 1, Others: 2 },
  "Kaduna":    { APC: 41, PDP: 37, LP: 16, NNPP: 2, APGA: 1, SDP: 1, Others: 2 },
  "Anambra":   { APC: 12, PDP: 8,  LP: 29, NNPP: 1, APGA: 47, SDP: 1, Others: 2 },
  "Oyo":       { APC: 39, PDP: 46, LP: 11, NNPP: 1, APGA: 1, SDP: 1, Others: 1 },
  "Abia":      { APC: 8,  PDP: 30, LP: 45, NNPP: 1, APGA: 14, SDP: 1, Others: 1 },
  "FCT Abuja": { APC: 32, PDP: 23, LP: 40, NNPP: 2, APGA: 1, SDP: 1, Others: 1 },
}

export function PollWidget() {
  const [tab, setTab] = useState<'presidential' | 'governor'>('presidential')
  const [selectedState, setSelectedState] = useState('')

  const isGov = tab === 'governor'

  let source: Record<string, number>
  let heading = ''
  let caption = ''
  let mode: 'pct' | 'seats' = 'pct'

  if (!isGov) {
    source = PRES
    heading = "If the presidential election were held next Sunday…"
    caption = "Illustrative projection · trend vs. previous month"
    mode = "pct"
  } else if (!selectedState) {
    source = SEATS
    heading = "Governorships won, by party — all 36 states"
    caption = "Illustrative seat count · governorships held out of 36 states"
    mode = "seats"
  } else {
    source = STATES[selectedState]
    heading = `Governor race — ${selectedState}`
    caption = `Illustrative projection for ${selectedState} · trend vs. previous month`
    mode = "pct"
  }

  const maxValue = Math.max(...ORDER.map(n => source[n] || 0))

  return (
    <div className="bg-[#f4f7f2] text-[#0f2a1c] py-14 px-6 md:px-10 rounded-2xl shadow-sm border border-gray-100 max-w-7xl mx-auto w-full transition-all">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div 
            className="text-[#0f8a4a] text-xs sm:text-[14px] font-extrabold tracking-widest uppercase mb-2"
            style={{ fontFamily: "'Archivo', sans-serif" }}
          >
            Nigeria 2.0 Polls
          </div>
          <h2 
            className="text-[#0f2a1c] text-2xl sm:text-3xl md:text-[34px] font-black leading-tight max-w-2xl"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            {heading}
          </h2>
        </div>
        <div className="md:text-right border-l-4 md:border-l-0 md:border-r-4 border-[#0f8a4a] pl-4 md:pl-0 md:pr-4 py-1">
          <div className="font-black text-xl md:text-2xl text-[#0f8a4a] uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
            Nigeria
          </div>
          <div className="font-bold text-xs md:text-sm tracking-widest text-[#8aa093] uppercase" style={{ fontFamily: "'Archivo', sans-serif" }}>
            BAROMETER
          </div>
        </div>
      </div>

      {/* Tabs & Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button 
          onClick={() => { setTab('presidential'); setSelectedState(''); }}
          className={`px-5 py-3 text-sm md:text-base font-black rounded-xs cursor-pointer transition-all duration-200 border-2 border-[#0f8a4a] ${
            tab === 'presidential' 
              ? 'bg-[#0f8a4a] text-white shadow-md' 
              : 'bg-white text-[#0f8a4a] hover:bg-[#0f8a4a]/5'
          }`}
          style={{ fontFamily: "'Archivo Black', sans-serif" }}
        >
          Presidential
        </button>
        <button 
          onClick={() => setTab('governor')}
          className={`px-5 py-3 text-sm md:text-base font-black rounded-xs cursor-pointer transition-all duration-200 border-2 border-[#0f8a4a] ${
            tab === 'governor' 
              ? 'bg-[#0f8a4a] text-white shadow-md' 
              : 'bg-white text-[#0f8a4a] hover:bg-[#0f8a4a]/5'
          }`}
          style={{ fontFamily: "'Archivo Black', sans-serif" }}
        >
          Governor
        </button>

        {isGov && (
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="font-bold text-sm md:text-[15px] text-[#0f2a1c] bg-white border-2 border-[#cdd8cf] rounded-xs px-4 py-3 cursor-pointer outline-none hover:border-[#0f8a4a] transition-all"
            style={{ fontFamily: "'Archivo', sans-serif" }}
          >
            <option value="">— Overview: all 36 states —</option>
            {Object.keys(STATES).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      {/* Chart container */}
      <div className="chart-card bg-white border border-[#e2e8dd] rounded-lg p-6 md:p-8 shadow-xs">
        <div className="grid grid-cols-7 gap-2 sm:gap-4 md:gap-6 items-end h-[280px]">
          {ORDER.map(name => {
            const val = source[name] || 0
            const percentage = maxValue > 0 ? (val / maxValue) * 100 : 0
            const displayVal = mode === 'pct' ? `${val}%` : String(val)
            
            return (
              <div key={name} className="flex flex-col items-center justify-end h-full group">
                {/* Value Label */}
                <div 
                  className="font-black text-sm sm:text-lg md:text-[22px] text-[#0f2a1c] mb-2 group-hover:scale-110 transition-transform select-none"
                  style={{ fontFamily: "'Archivo Black', sans-serif" }}
                >
                  {displayVal}
                </div>
                
                {/* Bar Graphic */}
                <div 
                  className="chart-bar w-full rounded-t-sm shadow-xs cursor-pointer group-hover:brightness-105 group-hover:shadow-md"
                  style={{ 
                    backgroundColor: COLORS[name], 
                    height: `${Math.max(percentage, 4)}%`,
                    opacity: val === 0 ? 0.3 : 1
                  }}
                  title={`${name}: ${displayVal}`}
                />
              </div>
            )
          })}
        </div>

        {/* Labels underneath */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 md:gap-6 mt-3">
          {ORDER.map(name => {
            const subtext = mode === 'pct' 
              ? (tab === 'presidential' ? PRES_TREND[name] : '—') 
              : 'seats'
              
            return (
              <div key={name} className="text-center">
                <div 
                  className="font-extrabold text-[11px] sm:text-xs md:text-sm text-[#0f2a1c] py-2 border-t-3 uppercase select-none"
                  style={{ 
                    fontFamily: "'Archivo', sans-serif",
                    borderColor: COLORS[name] 
                  }}
                >
                  {name}
                </div>
                <div 
                  className="font-bold text-[10px] sm:text-xs text-[#5c6b60] bg-[#f4f7f2] rounded-sm py-1.5 mt-1 select-none"
                  style={{ fontFamily: "'Archivo', sans-serif" }}
                >
                  {subtext}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="font-semibold text-xs text-[#8aa093] mt-3" style={{ fontFamily: "'Archivo', sans-serif" }}>
        {caption}
      </div>

      {/* Action links */}
      <div className="flex flex-wrap items-center gap-4 mt-6">
        <a 
          href="#" 
          className="btn-primary inline-flex items-center gap-2 font-extrabold text-xs sm:text-sm text-white bg-[#0f8a4a] px-5 py-3.5 rounded-sm shadow-sm"
          style={{ fontFamily: "'Archivo', sans-serif" }}
        >
          📊 Where our data comes from &rarr;
        </a>
        <a 
          href="#" 
          className="btn-primary inline-flex items-center gap-2 font-extrabold text-xs sm:text-sm text-[#0f8a4a] bg-white border-2 border-[#0f8a4a] px-5 py-3 rounded-sm"
          style={{ fontFamily: "'Archivo', sans-serif" }}
        >
          🗺 State-by-state analysis &rarr;
        </a>
      </div>
    </div>
  )
}
