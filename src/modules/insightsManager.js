import Chart from 'chart.js/auto'

export class InsightsManager {
  constructor(data) {
    this.data = data
    this.progressChart = null
    this.init()
  }

  init() {
    this.createProgressChart()
    this.updateCategoryBreakdown()
  }

  updateInsights(data) {
    this.data = data
    this.updateProgressChart()
    this.updateCategoryBreakdown()
  }

  createProgressChart() {
    const ctx = document.getElementById('progress-chart')
    if (!ctx) return

    const chartData = this.getWeeklyProgressData()

    this.progressChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Completion Rate (%)',
          data: chartData.data,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        elements: {
          point: {
            hoverRadius: 8
          }
        }
      }
    })
  }

  updateProgressChart() {
    if (!this.progressChart) return

    const chartData = this.getWeeklyProgressData()
    this.progressChart.data.labels = chartData.labels
    this.progressChart.data.datasets[0].data = chartData.data
    this.progressChart.update()
  }

  getWeeklyProgressData() {
    const labels = []
    const data = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      labels.push(dayName)

      const dateString = date.toDateString()
      const completedHabits = this.data.habits.filter(habit => 
        habit.completedDates && habit.completedDates.includes(dateString)
      ).length

      const completionRate = this.data.habits.length > 0 
        ? Math.round((completedHabits / this.data.habits.length) * 100)
        : 0

      data.push(completionRate)
    }

    return { labels, data }
  }

  updateCategoryBreakdown() {
    const container = document.getElementById('category-breakdown')
    if (!container) return

    const categories = this.getCategoryStats()

    if (Object.keys(categories).length === 0) {
      container.innerHTML = `
        <div class="empty-state-small">
          <p>No habit data available yet</p>
        </div>
      `
      return
    }

    container.innerHTML = Object.entries(categories).map(([category, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      const emoji = this.getCategoryEmoji(category)

      return `
        <div class="category-stat">
          <div class="category-header">
            <span class="category-emoji">${emoji}</span>
            <span class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            <span class="category-percentage">${percentage}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="category-details">
            ${stats.completed} of ${stats.total} completed today
          </div>
        </div>
      `
    }).join('')
  }

  getCategoryStats() {
    const today = new Date().toDateString()
    const categories = {}

    this.data.habits.forEach(habit => {
      const category = habit.category || 'other'
      
      if (!categories[category]) {
        categories[category] = { total: 0, completed: 0 }
      }

      categories[category].total++
      
      if (habit.completedDates && habit.completedDates.includes(today)) {
        categories[category].completed++
      }
    })

    return categories
  }

  getCategoryEmoji(category) {
    const emojis = {
      health: '🏃',
      mindfulness: '🧘',
      productivity: '💼',
      learning: '📚',
      social: '👥',
      other: '🌟'
    }
    return emojis[category] || '🌟'
  }
}