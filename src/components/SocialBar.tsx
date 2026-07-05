import React from 'react'
import { Facebook, Instagram, Music2, Youtube, ArrowUpRight } from 'lucide-react'

export function SocialBar() {
  return (
    <div className="bg-white flex justify-between items-center px-4 md:px-8 py-2.5 border-b border-gray-100 shadow-xs">
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        <span className="font-bold text-[11px] md:text-[13px] tracking-wider text-[#0f8a4a] uppercase">
          Together for a New Nigeria
        </span>
        <a 
          href="#" 
          className="inline-flex items-center gap-1 font-extrabold text-[11px] md:text-[13px] tracking-wider text-[#0f2a1c] uppercase hover:text-[#0f8a4a] transition-colors border-b-2 border-[#ffe14d] pb-0.5"
        >
          Our Past Projects <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        <a 
          href="#" 
          aria-label="Facebook"
          className="social-icon w-6 h-6 rounded bg-[#0f8a4a] flex items-center justify-center text-white"
        >
          <Facebook className="w-3.5 h-3.5 fill-current" />
        </a>
        <a 
          href="#" 
          aria-label="Instagram"
          className="social-icon w-6 h-6 rounded bg-[#0f8a4a] flex items-center justify-center text-white"
        >
          <Instagram className="w-3.5 h-3.5" />
        </a>
        <a 
          href="#" 
          aria-label="TikTok"
          className="social-icon w-6 h-6 rounded bg-[#0f8a4a] flex items-center justify-center text-white"
        >
          <Music2 className="w-3.5 h-3.5" />
        </a>
        <a 
          href="#" 
          aria-label="X"
          className="social-icon w-6 h-6 rounded bg-[#0f8a4a] flex items-center justify-center text-white font-black text-xs"
        >
          𝕏
        </a>
        <a 
          href="#" 
          aria-label="YouTube"
          className="social-icon w-6 h-6 rounded bg-[#0f8a4a] flex items-center justify-center text-white"
        >
          <Youtube className="w-3.5 h-3.5 fill-current" />
        </a>
      </div>
    </div>
  )
}
