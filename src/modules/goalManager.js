export class GoalManager {
  constructor(goals, onDataChange) {
    this.goals = goals
    this.onDataChange = onDataChange
    this.init()
  }

  init() {
    this.bindEvents()
    this.render()
  }

  bindEvents() {
    document.getElementById('add-goal-btn')?.addEventListener('click', () => {
      this.showForm()
    })

    document.getElementById('save-goal')?.addEventListener('click', () => {
      this.saveGoal()
    })

    document.getElementById('cancel-goal')?.addEventListener('click', () => {
      this.hideForm()
    })
  }

  showForm() {
    const form = document.getElementById('goal-form')
    form.style.display = 'block'
    document.getElementById('goal-title').focus()
    
    // Set default deadline to 30 days from now
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30)
    document.getElementById('goal-deadline').value = defaultDate.toISOString().split('T')[0]
  }

  hideForm() {
    const form = document.getElementById('goal-form')
    form.style.display = 'none'
    this.clearForm()
  }

  clearForm() {
    document.getElementById('goal-title').value = ''
    document.getElementById('goal-description').value = ''
    document.getElementById('goal-deadline').value = ''
  }

  saveGoal() {
    const title = document.getElementById('goal-title').value.trim()
    const description = document.getElementById('goal-description').value.trim()
    const deadline = document.getElementById('goal-deadline').value

    if (!title) {
      alert('Please enter a goal title')
      return
    }

    if (!deadline) {
      alert('Please set a deadline')
      return
    }

    const goal = {
      id: Date.now().toString(),
      title,
      description,
      deadline,
      createdAt: new Date().toISOString(),
      completed: false,
      completedAt: null
    }

    this.goals.push(goal)
    this.hideForm()
    this.render()
    this.onDataChange()
  }

  toggleGoal(goalId) {
    const goal = this.goals.find(g => g.id === goalId)
    if (!goal) return

    goal.completed = !goal.completed
    goal.completedAt = goal.completed ? new Date().toISOString() : null

    this.render()
    this.onDataChange()
  }

  deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
      const index = this.goals.findIndex(g => g.id === goalId)
      if (index > -1) {
        this.goals.splice(index, 1)
        this.render()
        this.onDataChange()
      }
    }
  }

  getGoalStatus(goal) {
    if (goal.completed) return 'completed'
    
    const deadline = new Date(goal.deadline)
    const today = new Date()
    const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDeadline < 0) return 'overdue'
    if (daysUntilDeadline <= 7) return 'urgent'
    return 'pending'
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  render() {
    const container = document.getElementById('goals-container')
    if (!container) return

    if (this.goals.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎯</div>
          <h3>No goals set</h3>
          <p>Set your first wellness goal and start achieving!</p>
        </div>
      `
      return
    }

    container.innerHTML = this.goals.map(goal => {
      const status = this.getGoalStatus(goal)
      const statusEmoji = {
        completed: '✅',
        overdue: '⚠️',
        urgent: '🔥',
        pending: '⏳'
      }[status]

      return `
        <div class="goal-card ${status}">
          <div class="goal-header">
            <span class="goal-status">${statusEmoji}</span>
            <button class="goal-delete" onclick="app.goalManager.deleteGoal('${goal.id}')">×</button>
          </div>
          <h3 class="goal-title">${goal.title}</h3>
          ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
          <div class="goal-deadline">
            <span>Deadline: ${this.formatDate(goal.deadline)}</span>
          </div>
          <button class="goal-toggle ${goal.completed ? 'completed' : ''}" 
                  onclick="app.goalManager.toggleGoal('${goal.id}')">
            ${goal.completed ? '✓ Completed' : 'Mark Complete'}
          </button>
        </div>
      `
    }).join('')

    // Make goalManager globally accessible for onclick handlers
    window.app = window.app || {}
    window.app.goalManager = this
  }
}