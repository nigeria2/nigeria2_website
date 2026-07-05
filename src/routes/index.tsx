import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { SocialBar } from '../components/SocialBar'
import { Header } from '../components/Header'
import { JoinForm } from '../components/JoinForm'
import { PollWidget } from '../components/PollWidget'
import { Footer } from '../components/Footer'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="min-h-screen bg-[#0f8a4a] text-white flex flex-col font-sans">
      <SocialBar />
      <Header />
      
      {/* Main hero & Form Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-10 py-8 md:py-14 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 items-start">
        {/* Left Side: Modern Rally Image */}
        <div className="w-full relative group">
          <div className="absolute inset-0 bg-[#ffe14d] rounded-lg rotate-1 scale-[1.01] group-hover:rotate-0 transition-transform duration-300"></div>
          <img 
            src="/rally.png" 
            alt="Nigeria 2.0 Political Rally" 
            className="w-full object-cover rounded-lg shadow-xl relative z-10 border-2 border-white/20 transform group-hover:scale-[0.99] transition-transform duration-300"
            style={{ aspectRatio: '1/0.78' }}
          />
        </div>
        
        {/* Right Side: Join Header & Form */}
        <div className="flex flex-col">
          <h1 
            className="text-white text-5xl sm:text-6xl md:text-[64px] font-black leading-[0.9] tracking-tight mb-8"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            A NEW ERA <span className="text-[#ffe14d]">for</span><br />NIGERIA
          </h1>
          <JoinForm />
        </div>
      </main>
      
      {/* Polls Section */}
      <section className="w-full bg-white">
        <PollWidget />
      </section>
      
      <Footer />
    </div>
  )
}
