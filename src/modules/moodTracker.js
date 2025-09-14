import Chart from 'chart.js/auto'

export class MoodTracker {
  constructor(entries, onDataChange) {
    this.entries = entries
    this.onDataChange = onDataChange
    this.moodChart = null
    this.init()
  }

  init() {
    this.createMoodChart()
    this.updateMoodSummary()
  }

  updateMoodData() {
    this.updateMoodChart()
    this.updateMoodSummary()
  }

  createMoodChart() {
    const ctx = document.getElementById('mood-chart')
    if (!ctx) return

    const chartData = this.getMoodChartData()

    this.moodChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Mood Score',
          data: chartData.data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
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
            max: 5,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                const moodLabels = ['', '😔', '😰', '😐', '🙂', '😊']
                return moodLabels[value] || value
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    })
  }

  updateMoodChart() {
    if (!this.moodChart) return

    const chartData = this.getMoodChartData()
    this.moodChart.data.labels = chartData.labels
    this.moodChart.data.datasets[0].data = chartData.data
    this.moodChart.update()
  }

  getMoodChartData() {
    const labels = []
    const data = []
    const moodValues = {
      sad: 1,
      anxious: 2,
      neutral: 3,
      good: 4,
      amazing: 5
    }

    // Get last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = date.toDateString()
      
      const dayName = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
      labels.push(dayName)

      // Find entry for this date
      const dayEntry = this.entries.find(entry => 
        new Date(entry.date).toDateString() === dateString
      )

      if (dayEntry && dayEntry.mood) {
        data.push(moodValues[dayEntry.mood] || 3)
      } else {
        data.push(null) // No data for this day
      }
    }

    return { labels, data }
  }

  updateMoodSummary() {
    const container = document.getElementById('mood-summary-content')
    if (!container) return

    const weeklyMoods = this.getWeeklyMoodSummary()
    
    if (weeklyMoods.total === 0) {
      container.innerHTML = `
        <div class="empty-state-small">
          <p>Start tracking your mood by adding journal entries</p>
        </div>
      `
      return
    }

    const averageMood = weeklyMoods.average
    const dominantMood = weeklyMoods.dominant
    const moodEmojis = {
      amazing: '😊',
      good: '🙂',
      neutral: '😐',
      sad: '😔',
      anxious: '😰'
    }

    container.innerHTML = `
      <div class="mood-summary-stats">
        <div class="mood-stat">
          <div class="mood-stat-label">This Week's Dominant Mood</div>
          <div class="mood-stat-value">
            ${moodEmojis[dominantMood]} ${dominantMood.charAt(0).toUpperCase() + dominantMood.slice(1)}
          </div>
        </div>
        
        <div class="mood-stat">
          <div class="mood-stat-label">Average Mood Score</div>
          <div class="mood-stat-value">${averageMood.toFixed(1)}/5.0</div>
        </div>
        
        <div class="mood-stat">
          <div class="mood-stat-label">Entries This Week</div>
          <div class="mood-stat-value">${weeklyMoods.total}</div>
        </div>
      </div>
      
      <div class="mood-breakdown">
        ${Object.entries(weeklyMoods.breakdown).map(([mood, count]) => `
          <div class="mood-breakdown-item">
            <span class="mood-emoji">${moodEmojis[mood]}</span>
            <span class="mood-name">${mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
            <span class="mood-count">${count}</span>
          </div>
        `).join('')}
      </div>
    `
  }

  getWeeklyMoodSummary() {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weeklyEntries = this.entries.filter(entry => 
      new Date(entry.date) >= oneWeekAgo && entry.mood
    )

    if (weeklyEntries.length === 0) {
      return { total: 0, average: 0, dominant: 'neutral', breakdown: {} }
    }

    const moodValues = {
      sad: 1,
      anxious: 2,
      neutral: 3,
      good: 4,
      amazing: 5
    }

    const breakdown = {}
    let totalScore = 0

    weeklyEntries.forEach(entry => {
      const mood = entry.mood
      breakdown[mood] = (breakdown[mood] || 0) + 1
      totalScore += moodValues[mood] || 3
    })

    const average = totalScore / weeklyEntries.length
    const dominant = Object.entries(breakdown).reduce((a, b) => 
      breakdown[a[0]] > breakdown[b[0]] ? a : b
    )[0]

    return {
      total: weeklyEntries.length,
      average,
      dominant,
      breakdown
    }
  }
}