import React from 'react'

export function Header() {
  return (
    <header className="relative w-full max-w-7xl mx-auto px-6 md:px-10 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[96px]">
      {/* Centered or left logo container */}
      <div className="flex-1 text-center md:text-left md:pl-4 transition-all duration-300">
        <div 
          className="font-black text-4xl sm:text-5xl md:text-[58px] text-white leading-[0.86] tracking-tight select-none"
          style={{ 
            fontFamily: "'Archivo Black', sans-serif",
            textShadow: '3px 3px 0 rgba(0, 0, 0, 0.18)' 
          }}
        >
          NIGERIA <span className="text-[#ffe14d]">2.0</span>
        </div>
        <div 
          className="text-[10px] sm:text-xs md:text-[15px] font-extrabold tracking-[0.24em] md:tracking-[0.32em] text-white mt-2 select-none uppercase"
          style={{ fontFamily: "'Archivo', sans-serif" }}
        >
          Techies for a Better Nigeria
        </div>
      </div>
      
      {/* Login Button */}
      <div className="md:absolute md:right-10 md:top-1/2 md:-translate-y-1/2">
        <a 
          href="#" 
          className="btn-primary inline-block bg-white text-[#0f8a4a] hover:bg-[#ffe14d] hover:text-[#0f4a2c] text-lg md:text-xl font-black tracking-wide uppercase px-6 py-2.5 md:px-8 md:py-3.5 rounded-sm shadow-md"
          style={{ fontFamily: "'Archivo Black', sans-serif" }}
        >
          LOGIN
        </a>
      </div>
    </header>
  )
}
