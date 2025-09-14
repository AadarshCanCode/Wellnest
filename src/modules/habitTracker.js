export class HabitTracker {
  constructor(habits, onDataChange) {
    this.habits = habits
    this.onDataChange = onDataChange
    this.init()
  }

  init() {
    this.bindEvents()
    this.render()
  }

  bindEvents() {
    document.getElementById('add-habit-btn')?.addEventListener('click', () => {
      this.showForm()
    })

    document.getElementById('save-habit')?.addEventListener('click', () => {
      this.saveHabit()
    })

    document.getElementById('cancel-habit')?.addEventListener('click', () => {
      this.hideForm()
    })
  }

  showForm() {
    const form = document.getElementById('habit-form')
    form.style.display = 'block'
    document.getElementById('habit-name').focus()
  }

  hideForm() {
    const form = document.getElementById('habit-form')
    form.style.display = 'none'
    this.clearForm()
  }

  clearForm() {
    document.getElementById('habit-name').value = ''
    document.getElementById('habit-category').value = 'health'
  }

  saveHabit() {
    const name = document.getElementById('habit-name').value.trim()
    const category = document.getElementById('habit-category').value

    if (!name) {
      alert('Please enter a habit name')
      return
    }

    const habit = {
      id: Date.now().toString(),
      name,
      category,
      createdAt: new Date().toISOString(),
      completedDates: []
    }

    this.habits.push(habit)
    this.hideForm()
    this.render()
    this.onDataChange()
  }

  toggleHabit(habitId) {
    const habit = this.habits.find(h => h.id === habitId)
    if (!habit) return

    const today = new Date().toDateString()
    
    if (!habit.completedDates) {
      habit.completedDates = []
    }

    const index = habit.completedDates.indexOf(today)
    if (index > -1) {
      habit.completedDates.splice(index, 1)
    } else {
      habit.completedDates.push(today)
    }

    this.render()
    this.onDataChange()
  }

  deleteHabit(habitId) {
    if (confirm('Are you sure you want to delete this habit?')) {
      const index = this.habits.findIndex(h => h.id === habitId)
      if (index > -1) {
        this.habits.splice(index, 1)
        this.render()
        this.onDataChange()
      }
    }
  }

  render() {
    const container = document.getElementById('habits-container')
    if (!container) return

    if (this.habits.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🌱</div>
          <h3>No habits yet</h3>
          <p>Start building healthy habits by adding your first one!</p>
        </div>
      `
      return
    }

    const today = new Date().toDateString()
    
    container.innerHTML = this.habits.map(habit => {
      const isCompleted = habit.completedDates && habit.completedDates.includes(today)
      const categoryEmoji = this.getCategoryEmoji(habit.category)
      
      return `
        <div class="habit-card ${isCompleted ? 'completed' : ''}">
          <div class="habit-header">
            <span class="habit-category">${categoryEmoji}</span>
            <button class="habit-delete" onclick="app.habitTracker.deleteHabit('${habit.id}')">×</button>
          </div>
          <h3 class="habit-name">${habit.name}</h3>
          <button class="habit-toggle ${isCompleted ? 'completed' : ''}" 
                  onclick="app.habitTracker.toggleHabit('${habit.id}')">
            ${isCompleted ? '✓ Completed' : 'Mark Complete'}
          </button>
        </div>
      `
    }).join('')

    // Make habitTracker globally accessible for onclick handlers
    window.app = window.app || {}
    window.app.habitTracker = this
  }

  getCategoryEmoji(category) {
    const emojis = {
      health: '🏃',
      mindfulness: '🧘',
      productivity: '💼',
      learning: '📚',
      social: '👥'
    }
    return emojis[category] || '🌟'
  }
}