import React from 'react'

export function Footer() {
  return (
    <footer className="bg-[#0a6337] px-6 md:px-10 py-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap text-center sm:text-left">
        <div 
          className="border-2 border-white/55 rounded-xs px-4 py-2.5 font-extrabold text-[12px] md:text-[13px] tracking-widest text-white uppercase"
          style={{ fontFamily: "'Archivo', sans-serif" }}
        >
          Paid for by Nigeria 2.0 · 2027
        </div>
        <div 
          className="text-xs md:text-sm font-semibold text-[#dff5e8] flex items-center gap-2"
          style={{ fontFamily: "'Archivo', sans-serif" }}
        >
          <a href="#" className="text-white hover:underline transition-all">
            Privacy Policy
          </a>
          <span>&middot;</span>
          <span>A movement for every Nigerian</span>
        </div>
      </div>
    </footer>
  )
}
