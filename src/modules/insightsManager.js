import Chart from 'chart.js/auto'

export class InsightsManager {
  constructor(data) {
    this.data = data
    this.emotionChart = null
    this.init()
  }

  init() {
    this.updateSentimentAnalysis()
    this.updateWritingPatterns()
    this.createEmotionTrendsChart()
  }

  updateInsights(data) {
    this.data = data
    this.updateSentimentAnalysis()
    this.updateWritingPatterns()
    this.updateEmotionTrendsChart()
  }

  updateSentimentAnalysis() {
    const container = document.getElementById('sentiment-analysis')
    if (!container) return

    if (this.data.entries.length === 0) {
      container.innerHTML = `
        <div class="empty-state-small">
          <p>Write some journal entries to see sentiment analysis</p>
        </div>
      `
      return
    }

    const sentimentStats = this.getSentimentStats()
    const totalEntries = this.data.entries.length

    container.innerHTML = `
      <div class="sentiment-overview">
        <div class="sentiment-score">
          <div class="score-circle ${this.getOverallSentimentClass(sentimentStats)}">
            <span class="score-number">${this.getOverallSentimentScore(sentimentStats)}</span>
            <span class="score-label">Overall</span>
          </div>
        </div>
        
        <div class="sentiment-breakdown">
          ${Object.entries(sentimentStats).map(([sentiment, count]) => {
            const percentage = Math.round((count / totalEntries) * 100)
            return `
              <div class="sentiment-item">
                <div class="sentiment-bar">
                  <div class="sentiment-fill sentiment-${sentiment}" style="width: ${percentage}%"></div>
                </div>
                <div class="sentiment-info">
                  <span class="sentiment-name">${this.getSentimentEmoji(sentiment)} ${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</span>
                  <span class="sentiment-percentage">${percentage}%</span>
                </div>
              </div>
            `
          }).join('')}
        </div>
      </div>
      
      <div class="sentiment-insights">
        ${this.generateSentimentInsights(sentimentStats, totalEntries)}
      </div>
    `
  }

  getSentimentStats() {
    const stats = { positive: 0, negative: 0, neutral: 0, anxious: 0 }
    
    this.data.entries.forEach(entry => {
      if (entry.sentiment) {
        stats[entry.sentiment]++
      }
    })
    
    return stats
  }

  getOverallSentimentScore(stats) {
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0)
    if (total === 0) return 0
    
    const weights = { positive: 4, neutral: 2, anxious: 1, negative: 0 }
    const weightedSum = Object.entries(stats).reduce((sum, [sentiment, count]) => {
      return sum + (weights[sentiment] * count)
    }, 0)
    
    return Math.round((weightedSum / (total * 4)) * 100)
  }

  getOverallSentimentClass(stats) {
    const score = this.getOverallSentimentScore(stats)
    if (score >= 75) return 'excellent'
    if (score >= 50) return 'good'
    if (score >= 25) return 'fair'
    return 'needs-attention'
  }

  generateSentimentInsights(stats, total) {
    const insights = []
    const positiveRatio = stats.positive / total
    const anxiousRatio = stats.anxious / total
    
    if (positiveRatio > 0.6) {
      insights.push("🌟 You're maintaining a positive outlook! Keep nurturing those good vibes.")
    } else if (positiveRatio < 0.2) {
      insights.push("💙 Consider focusing on small daily gratitudes to boost positivity.")
    }
    
    if (anxiousRatio > 0.3) {
      insights.push("🧘 You might benefit from mindfulness exercises or breathing techniques.")
    }
    
    if (insights.length === 0) {
      insights.push("📊 Your emotional balance looks healthy. Keep journaling to maintain awareness!")
    }
    
    return insights.map(insight => `<div class="insight-tip">${insight}</div>`).join('')
  }

  updateWritingPatterns() {
    const container = document.getElementById('writing-patterns')
    if (!container) return

    if (this.data.entries.length === 0) {
      container.innerHTML = `
        <div class="empty-state-small">
          <p>Write more entries to discover your patterns</p>
        </div>
      `
      return
    }

    const patterns = this.getWritingPatterns()

    container.innerHTML = `
      <div class="pattern-stats">
        <div class="pattern-stat">
          <div class="pattern-label">Average Entry Length</div>
          <div class="pattern-value">${patterns.avgLength} words</div>
        </div>
        
        <div class="pattern-stat">
          <div class="pattern-label">Most Active Time</div>
          <div class="pattern-value">${patterns.mostActiveHour}</div>
        </div>
        
        <div class="pattern-stat">
          <div class="pattern-label">Favorite Prompt</div>
          <div class="pattern-value">${patterns.favoritePrompt}</div>
        </div>
      </div>
      
      <div class="writing-frequency">
        <h4>Writing Frequency</h4>
        <div class="frequency-chart">
          ${patterns.weeklyFrequency.map((count, index) => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            const maxCount = Math.max(...patterns.weeklyFrequency)
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0
            return `
              <div class="frequency-bar">
                <div class="bar-fill" style="height: ${height}%"></div>
                <div class="bar-label">${days[index]}</div>
                <div class="bar-count">${count}</div>
              </div>
            `
          }).join('')}
        </div>
      </div>
    `
  }

  getWritingPatterns() {
    const entries = this.data.entries
    
    // Average length
    const totalWords = entries.reduce((sum, entry) => {
      return sum + entry.content.split(/\s+/).length
    }, 0)
    const avgLength = entries.length > 0 ? Math.round(totalWords / entries.length) : 0

    // Most active hour
    const hourCounts = {}
    entries.forEach(entry => {
      const hour = new Date(entry.date).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    
    const mostActiveHour = Object.entries(hourCounts).reduce((max, [hour, count]) => {
      return count > (hourCounts[max] || 0) ? hour : max
    }, '12')
    
    const formatHour = (hour) => {
      const h = parseInt(hour)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
      return `${displayHour}:00 ${ampm}`
    }

    // Favorite prompt
    const promptCounts = {}
    entries.forEach(entry => {
      if (entry.prompt) {
        promptCounts[entry.prompt] = (promptCounts[entry.prompt] || 0) + 1
      }
    })
    
    const favoritePrompt = Object.keys(promptCounts).length > 0 
      ? Object.entries(promptCounts).reduce((max, [prompt, count]) => {
          return count > (promptCounts[max] || 0) ? prompt : max
        }, Object.keys(promptCounts)[0])
      : 'Free writing'

    // Weekly frequency
    const weeklyFrequency = new Array(7).fill(0)
    entries.forEach(entry => {
      const dayOfWeek = new Date(entry.date).getDay()
      weeklyFrequency[dayOfWeek]++
    })

    return {
      avgLength,
      mostActiveHour: formatHour(mostActiveHour),
      favoritePrompt: favoritePrompt.charAt(0).toUpperCase() + favoritePrompt.slice(1),
      weeklyFrequency
    }
  }

  createEmotionTrendsChart() {
    const ctx = document.getElementById('emotion-trends-chart')
    if (!ctx) return

    const chartData = this.getEmotionTrendsData()

    this.emotionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.data,
          backgroundColor: [
            '#10b981', // positive
            '#6b7280', // neutral  
            '#f59e0b', // anxious
            '#ef4444'  // negative
          ],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          }
        }
      }
    })
  }

  updateEmotionTrendsChart() {
    if (!this.emotionChart) return

    const chartData = this.getEmotionTrendsData()
    this.emotionChart.data.labels = chartData.labels
    this.emotionChart.data.datasets[0].data = chartData.data
    this.emotionChart.update()
  }

  getEmotionTrendsData() {
    const sentimentStats = this.getSentimentStats()
    const labels = []
    const data = []

    Object.entries(sentimentStats).forEach(([sentiment, count]) => {
      if (count > 0) {
        labels.push(sentiment.charAt(0).toUpperCase() + sentiment.slice(1))
        data.push(count)
      }
    })

    return { labels, data }
  }

  getSentimentEmoji(sentiment) {
    const emojis = {
      positive: '💚',
      negative: '💙',
      neutral: '💜',
      anxious: '🧡'
    }
    return emojis[sentiment] || emojis.neutral
  }
}