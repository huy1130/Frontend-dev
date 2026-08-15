import React from 'react'
import NavBar from '../components/layout/NavBar'
import Footer from '../components/layout/Footer'
import Hero from '../components/home/Hero'
import HowItWorks from '../components/home/HowItWorks'
import Features from '../components/home/Features'
import PublicPromotions from '../components/home/PublicPromotions'
import IndividualServices from '../components/home/IndividualServices'
import StoreTimeSlots from '../components/home/StoreTimeSlots'
import Tiers from '../components/home/Tiers'
import CallToAction from '../components/home/CallToAction'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <NavBar />
      <main className="flex-1 pt-[72px] sm:pt-[76px]">
        <Hero />
        <HowItWorks />
        <Features />
        <StoreTimeSlots />
        <PublicPromotions />
        <IndividualServices />
        <Tiers />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}
