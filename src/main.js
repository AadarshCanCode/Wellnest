import './style.css'
import { NavigationManager } from './modules/navigationManager.js'
import { HabitTracker } from './modules/habitTracker.js'
import { GoalManager } from './modules/goalManager.js'
import { InsightsManager } from './modules/insightsManager.js'

class WellnestApp {
  constructor() {
    this.data = this.loadData()
    this.initializeModules()
    this.bindEvents()
    this.updateStats()
  }

  initializeModules() {
    this.navigation = new NavigationManager()
    this.habitTracker = new HabitTracker(this.data.habits, this.onDataChange.bind(this))
    this.goalManager = new GoalManager(this.data.goals, this.onDataChange.bind(this))
    this.insightsManager = new InsightsManager(this.data)
  }

  bindEvents() {
    // CTA button
    document.querySelector('[data-action="start-journey"]')?.addEventListener('click', () => {
      this.navigation.showSection('habits')
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
    const totalHabits = this.data.habits.length
    const today = new Date().toDateString()
    const todayCompletions = this.data.habits.filter(habit => 
      habit.completedDates && habit.completedDates.includes(today)
    ).length
    
    const completionRate = totalHabits > 0 ? Math.round((todayCompletions / totalHabits) * 100) : 0
    const streak = this.calculateStreak()

    document.getElementById('total-habits').textContent = totalHabits
    document.getElementById('current-streak').textContent = streak
    document.getElementById('completion-rate').textContent = `${completionRate}%`
  }

  calculateStreak() {
    if (this.data.habits.length === 0) return 0
    
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateString = checkDate.toDateString()
      
      const dayCompletions = this.data.habits.filter(habit => 
        habit.completedDates && habit.completedDates.includes(dateString)
      ).length
      
      const dayCompletionRate = this.data.habits.length > 0 ? dayCompletions / this.data.habits.length : 0
      
      if (dayCompletionRate >= 0.5) { // At least 50% completion
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  loadData() {
    const defaultData = {
      habits: [],
      goals: [],
      completions: {}
    }
    
    try {
      const saved = localStorage.getItem('wellnest-data')
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData
    } catch (error) {
      console.error('Error loading data:', error)
      return defaultData
    }
  }

  saveData() {
    try {
      localStorage.setItem('wellnest-data', JSON.stringify(this.data))
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WellnestApp()
})