import './style.css'
import { NavigationManager } from './modules/navigationManager.js'
import { JournalManager } from './modules/journalManager.js'
import { MoodTracker } from './modules/moodTracker.js'
import { InsightsManager } from './modules/insightsManager.js'
import { ThemeManager } from './modules/themeManager.js'

class AuroraJournalApp {
  constructor() {
    this.data = this.loadData()
    this.initializeModules()
    this.bindEvents()
    this.updateStats()
    this.initializeParticles()
  }

  initializeModules() {
    this.themeManager = new ThemeManager()
    this.navigation = new NavigationManager()
    this.journalManager = new JournalManager(this.data.entries, this.onDataChange.bind(this))
    this.moodTracker = new MoodTracker(this.data.entries, this.onDataChange.bind(this))
    this.insightsManager = new InsightsManager(this.data)
  }

  bindEvents() {
    // CTA button
    document.querySelector('[data-action="start-journaling"]')?.addEventListener('click', () => {
      this.navigation.showSection('journal')
    })

    // Auto-save data every 30 seconds
    setInterval(() => {
      this.saveData()
    }, 30000)

    // Save data before page unload
    window.addEventListener('beforeunload', () => {
      this.saveData()
    })
  }

  onDataChange() {
    this.updateStats()
    this.insightsManager.updateInsights(this.data)
    this.saveData()
  }

  updateStats() {
    const totalEntries = this.data.entries.length
    const streak = this.calculateStreak()
    const todaysMood = this.getTodaysMood()

    document.getElementById('total-entries').textContent = totalEntries
    document.getElementById('current-streak').textContent = streak
    document.getElementById('mood-score').textContent = todaysMood || '--'
  }

  calculateStreak() {
    if (this.data.entries.length === 0) return 0
    
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateString = checkDate.toDateString()
      
      const hasEntry = this.data.entries.some(entry => 
        new Date(entry.date).toDateString() === dateString
      )
      
      if (hasEntry) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  getTodaysMood() {
    const today = new Date().toDateString()
    const todaysEntry = this.data.entries.find(entry => 
      new Date(entry.date).toDateString() === today
    )
    
    if (todaysEntry && todaysEntry.mood) {
      const moodEmojis = {
        amazing: '😊',
        good: '🙂',
        neutral: '😐',
        sad: '😔',
        anxious: '😰'
      }
      return moodEmojis[todaysEntry.mood] || '--'
    }
    
    return '--'
  }

  initializeParticles() {
    const particles = document.querySelectorAll('.particle')
    particles.forEach((particle, index) => {
      particle.style.left = Math.random() * 100 + '%'
      particle.style.animationDelay = Math.random() * 20 + 's'
      particle.style.animationDuration = (15 + Math.random() * 10) + 's'
    })
  }

  loadData() {
    const defaultData = {
      entries: [],
      settings: {
        theme: 'dark'
      }
    }
    
    try {
      const saved = localStorage.getItem('aurora-journal-data')
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData
    } catch (error) {
      console.error('Error loading data:', error)
      return defaultData
    }
  }

  saveData() {
    try {
      localStorage.setItem('aurora-journal-data', JSON.stringify(this.data))
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.auroraApp = new AuroraJournalApp()
})