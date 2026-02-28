import { useDraipStore } from './store/draipStore'
import SetupScreen from './components/SetupScreen'
import PlanningScreen from './components/PlanningScreen'
import ActivePlanner from './components/ActivePlanner'
import LandingPage from './components/LandingPage'
import { motion, AnimatePresence } from 'framer-motion'

export default function App() {
  const phase = useDraipStore((s) => s.phase)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {phase === 'landing' && <LandingPage />}
        {phase === 'setup' && <SetupScreen />}
        {phase === 'planning' && <PlanningScreen />}
        {phase === 'active' && <ActivePlanner />}
      </motion.div>
    </AnimatePresence>
  )
}