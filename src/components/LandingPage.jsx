import { motion } from 'framer-motion'
import { useState } from 'react'
import { useDraipStore } from '../store/draipStore'
import draipImage from './DRAIP.jpg'

export default function LandingPage() {
  const { setPhase } = useDraipStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleGetStarted = () => {
    setPhase('setup')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-lavender via-soft-peach to-soft-mint text-text overflow-hidden relative">
      {/* Floating aurora-like travel elements (same as SetupScreen) */}

      {/* Hot air balloon */}
      <motion.div 
        className="absolute top-[10%] left-[5%] text-7xl opacity-20 pointer-events-none z-0"
        animate={{ y: [0, -30, 0], x: [0, 20, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      >
        🎈
      </motion.div>

      {/* Airplane */}
      <motion.div 
        className="absolute top-[20%] right-[10%] text-8xl opacity-20 pointer-events-none z-0"
        animate={{ x: [0, -50, 50, 0], y: [0, 20, -20, 20, 0], rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      >
        ✈️
      </motion.div>

      {/* Compass */}
      <motion.div 
        className="absolute bottom-[15%] left-[10%] text-7xl opacity-20 pointer-events-none z-0"
        animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        🧭
      </motion.div>

      {/* Globe */}
      <motion.div 
        className="absolute bottom-[30%] right-[15%] text-8xl opacity-20 pointer-events-none z-0"
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        🌍
      </motion.div>

      {/* Palm tree */}
      <motion.div 
        className="absolute top-[40%] left-[20%] text-7xl opacity-20 pointer-events-none z-0"
        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      >
        🌴
      </motion.div>

      {/* Beach umbrella */}
      <motion.div 
        className="absolute top-[60%] right-[5%] text-7xl opacity-20 pointer-events-none z-0"
        animate={{ y: [0, -15, 0], x: [0, 10, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      >
        ⛱️
      </motion.div>

      {/* Camera */}
      <motion.div 
        className="absolute bottom-[10%] right-[25%] text-7xl opacity-20 pointer-events-none z-0"
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      >
        📷
      </motion.div>

      {/* Passport */}
      <motion.div 
        className="absolute top-[15%] left-[20%] text-7xl opacity-20 pointer-events-none z-0"
        animate={{ y: [0, -25, 0], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      >
        🛂
      </motion.div>

      {/* Colorful gradient auroras */}
      <motion.div 
        className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-soft-coral/20 to-soft-sky/20 blur-[100px] pointer-events-none z-0"
        animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.2, 0.8, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-soft-mint/20 to-soft-lavender/20 blur-[100px] pointer-events-none z-0"
        animate={{ x: [0, -50, 50, 0], y: [0, 50, -50, 0], scale: [1, 0.8, 1.2, 1] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating sparkles/particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl opacity-20 pointer-events-none z-0"
          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 40 - 20, 0],
            rotate: [0, 360],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        >
          {['✨', '⭐', '🌟', '💫', '⚡'][i % 5]}
        </motion.div>
      ))}

      {/* Subtle animated wave at bottom */}
      <svg className="absolute bottom-0 left-0 w-full opacity-10 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <motion.path 
          fill="#4ECDC4" 
          fillOpacity="0.3"
          animate={{ 
            d: [
              "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,160L48,165.3C96,171,192,181,288,176C384,171,480,149,576,138.7C672,128,768,128,864,138.7C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
      </svg>

      {/* Navigation */}
      <nav className="relative z-20 px-6 py-4 md:px-12 lg:px-24">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-display font-bold cursor-pointer"
            onClick={() => setPhase('landing')}
          >
            <span className="text-soft-coral">DRAIP</span>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-8"
          >
            <a href="#" className="font-mono text-sm text-text-light hover:text-soft-coral transition-colors">Home</a>
            <a href="#" className="font-mono text-sm text-text-light hover:text-soft-coral transition-colors">Contact Us</a>
          </motion.div>

          {/* Search and Login */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-4"
          >
            <button 
              onClick={handleGetStarted}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-soft-coral to-soft-peach text-white font-display text-sm hover:shadow-lg hover:shadow-soft-coral/30 transition-all"
            >
              Log In
            </button>
          </motion.div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-2xl text-text"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 p-4 bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 shadow-xl"
          >
            <div className="flex flex-col gap-3">
              <a href="#" className="font-mono text-sm text-text-light hover:text-soft-coral transition-colors py-2">Home</a>
              <a href="#" className="font-mono text-sm text-text-light hover:text-soft-coral transition-colors py-2">Contact Us</a>
              <div className="relative mt-2">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 rounded-full bg-white border border-soft-lavender/30 text-sm text-text placeholder-text-light/50 focus:outline-none focus:border-soft-coral"
                />
              </div>
              <button 
                onClick={handleGetStarted}
                className="w-full px-6 py-2 rounded-full bg-gradient-to-r from-soft-coral to-soft-peach text-white font-display text-sm hover:shadow-lg transition-all"
              >
                Log In
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 md:px-12 lg:px-24 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-tight mb-3">
              <span className="text-soft-coral">EXPLORE</span>
              <br />
              <span className="text-soft-sky">DREAM</span>
              <br />
              <span className="text-soft-lavender">DESTINATION</span>
            </h1>
            <p className="text-text-light text-base md:text-lg mb-6 max-w-lg">
              Let AI craft your perfect journey. Personalized itineraries, real-time adjustments, 
              and smart recommendations that adapt to your mood, budget, and travel style.
            </p>

            <button 
              onClick={handleGetStarted}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-soft-coral to-soft-peach text-black font-display font-bold text-base hover:shadow-xl hover:shadow-soft-coral/30 transform hover:scale-105 transition-all"
            >
              START PLANNING
            </button>
          </motion.div>

          {/* Right Content - Decorative Image/Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-soft-lavender/30 to-soft-mint/30 p-6 flex items-center justify-center backdrop-blur-sm">
              <img 
                src={draipImage} 
                alt="DRAIP Travel Companion" 
                className="w-full h-full object-contain animate-float"
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 px-6 md:px-12 lg:px-24 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
            <span className="text-soft-coral">Why Choose</span>{' '}
            <span className="text-soft-sky">DRAIP</span>
          </h2>
          <p className="text-text-light max-w-2xl mx-auto">
            Experience travel planning reimagined with AI-powered personalization
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 hover:shadow-xl transition-all hover:-translate-y-2"
          >
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="font-display text-lg font-bold mb-2 text-text">
              AI-Powered Planning
            </h3>
            <p className="text-text-light text-xs leading-relaxed mb-4">
              Our intelligent algorithms analyze your preferences, mood, and real-time data to create 
              personalized itineraries that evolve with you throughout your journey.
            </p>
            <button 
              onClick={handleGetStarted}
              className="text-xs font-mono text-soft-coral hover:text-soft-peach transition-colors"
            >
              LEARN MORE →
            </button>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 hover:shadow-xl transition-all hover:-translate-y-2"
          >
            <div className="text-4xl mb-3">🔄</div>
            <h3 className="font-display text-lg font-bold mb-2 text-text">
              Real-Time Adaptation
            </h3>
            <p className="text-text-light text-xs leading-relaxed mb-4">
              Tired? Rushed? Bored? Just tell us how you feel and watch your itinerary adapt instantly 
              with new suggestions that match your current mood.
            </p>
            <button 
              onClick={handleGetStarted}
              className="text-xs font-mono text-soft-coral hover:text-soft-peach transition-colors"
            >
              LEARN MORE →
            </button>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 hover:shadow-xl transition-all hover:-translate-y-2"
          >
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-display text-lg font-bold mb-2 text-text">
              Smart Recommendations
            </h3>
            <p className="text-text-light text-xs leading-relaxed mb-4">
              Discover hidden gems and local favorites based on your unique travel style - whether 
              you're a culture enthusiast, foodie, adventurer, or relaxation seeker.
            </p>
            <button 
              onClick={handleGetStarted}
              className="text-xs font-mono text-soft-coral hover:text-soft-peach transition-colors"
            >
              LEARN MORE →
            </button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 md:px-12 lg:px-24 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-soft-lavender/30 via-soft-peach/30 to-soft-mint/30 rounded-2xl p-8 text-center backdrop-blur-sm"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Ready for Your{' '}
            <span className="text-soft-coral">Dream Journey?</span>
          </h2>
          <p className="text-text-light max-w-2xl mx-auto mb-6">
            Join DRAIP to discover smarter, more personalized travel planning.
          </p>
          <button 
            onClick={handleGetStarted}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-soft-coral to-soft-peach text-white font-display font-bold text-sm hover:shadow-lg hover:shadow-soft-coral/30 transition-all"
          >
            Start Your Adventure →
          </button>
          <p className="text-xs text-text-light mt-3">
            ✨ No credit card required • Free to start • Cancel anytime
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-12 lg:px-24 py-6 border-t border-white/30">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-xs text-text-light">
            © 2026 DRAIP. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-text-light hover:text-soft-coral transition-colors">Privacy</a>
            <a href="#" className="text-xs text-text-light hover:text-soft-coral transition-colors">Terms</a>
            <a href="#" className="text-xs text-text-light hover:text-soft-coral transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}