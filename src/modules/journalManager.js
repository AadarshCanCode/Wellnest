export class JournalManager {
  constructor(entries, onDataChange) {
    this.entries = entries
    this.onDataChange = onDataChange
    this.selectedMood = null
    this.init()
  }

  init() {
    this.bindEvents()
    this.render()
  }

  bindEvents() {
    document.getElementById('new-entry-btn')?.addEventListener('click', () => {
      this.showForm()
    })

    document.getElementById('close-form')?.addEventListener('click', () => {
      this.hideForm()
    })

    document.getElementById('save-entry')?.addEventListener('click', () => {
      this.saveEntry()
    })

    document.getElementById('cancel-entry')?.addEventListener('click', () => {
      this.hideForm()
    })

    // Mood selector
    document.querySelectorAll('.mood-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.selectMood(e.target.dataset.mood)
      })
    })

    // Writing prompt selector
    document.getElementById('writing-prompt')?.addEventListener('change', (e) => {
      this.handlePromptSelection(e.target.value)
    })
  }

  showForm() {
    const form = document.getElementById('journal-form')
    form.style.display = 'block'
    form.scrollIntoView({ behavior: 'smooth' })
    document.getElementById('journal-content').focus()
  }

  hideForm() {
    const form = document.getElementById('journal-form')
    form.style.display = 'none'
    this.clearForm()
  }

  clearForm() {
    document.getElementById('journal-content').value = ''
    document.getElementById('writing-prompt').value = ''
    this.selectedMood = null
    document.querySelectorAll('.mood-option').forEach(option => {
      option.classList.remove('selected')
    })
  }

  selectMood(mood) {
    this.selectedMood = mood
    document.querySelectorAll('.mood-option').forEach(option => {
      option.classList.remove('selected')
    })
    document.querySelector(`[data-mood="${mood}"]`).classList.add('selected')
  }

  handlePromptSelection(promptType) {
    const prompts = {
      gratitude: "What are you grateful for today? Take a moment to appreciate the small and big things that brought you joy or comfort.",
      challenge: "What challenged you today and how did you handle it? Reflect on your strength and resilience.",
      achievement: "What small win can you celebrate today? Every step forward matters, no matter how small.",
      mindfulness: "What did you notice about yourself today? How did you feel in different moments?",
      future: "What are you looking forward to? Let yourself dream and feel hopeful about what's coming.",
      stress: "What's weighing on your mind right now? It's okay to acknowledge difficult feelings."
    }

    if (promptType && prompts[promptType]) {
      const textarea = document.getElementById('journal-content')
      if (!textarea.value.trim()) {
        textarea.value = prompts[promptType] + '\n\n'
        textarea.focus()
        textarea.setSelectionRange(textarea.value.length, textarea.value.length)
      }
    }
  }

  saveEntry() {
    const content = document.getElementById('journal-content').value.trim()
    const prompt = document.getElementById('writing-prompt').value

    if (!content) {
      this.showNotification('Please write something before saving', 'warning')
      return
    }

    const entry = {
      id: Date.now().toString(),
      content,
      mood: this.selectedMood,
      prompt,
      date: new Date().toISOString(),
      sentiment: this.analyzeSentiment(content)
    }

    this.entries.unshift(entry) // Add to beginning for chronological order
    this.hideForm()
    this.render()
    this.onDataChange()
    this.showNotification('Entry saved successfully! 💚', 'success')
  }

  analyzeSentiment(text) {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['happy', 'joy', 'grateful', 'love', 'amazing', 'wonderful', 'great', 'good', 'excited', 'peaceful', 'calm', 'blessed', 'thankful', 'proud', 'accomplished']
    const negativeWords = ['sad', 'angry', 'frustrated', 'worried', 'anxious', 'stressed', 'tired', 'overwhelmed', 'difficult', 'hard', 'struggle', 'pain', 'hurt', 'lonely', 'scared']
    const anxiousWords = ['anxious', 'worried', 'nervous', 'panic', 'fear', 'scared', 'overwhelmed', 'stress', 'tension']

    const words = text.toLowerCase().split(/\s+/)
    let positiveScore = 0
    let negativeScore = 0
    let anxiousScore = 0

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveScore++
      if (negativeWords.some(nw => word.includes(nw))) negativeScore++
      if (anxiousWords.some(aw => word.includes(aw))) anxiousScore++
    })

    if (anxiousScore > 0 && anxiousScore >= positiveScore) return 'anxious'
    if (positiveScore > negativeScore) return 'positive'
    if (negativeScore > positiveScore) return 'negative'
    return 'neutral'
  }

  deleteEntry(entryId) {
    if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      const index = this.entries.findIndex(e => e.id === entryId)
      if (index > -1) {
        this.entries.splice(index, 1)
        this.render()
        this.onDataChange()
        this.showNotification('Entry deleted', 'info')
      }
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.textContent = message
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.classList.add('show')
    }, 100)
    
    setTimeout(() => {
      notification.classList.remove('show')
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  getSentimentColor(sentiment) {
    const colors = {
      positive: '#10b981',
      negative: '#ef4444',
      neutral: '#6b7280',
      anxious: '#f59e0b'
    }
    return colors[sentiment] || colors.neutral
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

  render() {
    const container = document.getElementById('entries-container')
    if (!container) return

    if (this.entries.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✨</div>
          <h3>Your journal awaits</h3>
          <p>Start your journey of self-reflection and mindfulness by writing your first entry.</p>
        </div>
      `
      return
    }

    container.innerHTML = this.entries.map(entry => {
      const moodEmoji = entry.mood ? {
        amazing: '😊',
        good: '🙂',
        neutral: '😐',
        sad: '😔',
        anxious: '😰'
      }[entry.mood] : ''

      return `
        <div class="journal-entry">
          <div class="entry-header">
            <div class="entry-meta">
              <span class="entry-date">${this.formatDate(entry.date)}</span>
              ${moodEmoji ? `<span class="entry-mood">${moodEmoji}</span>` : ''}
              <span class="entry-sentiment" style="color: ${this.getSentimentColor(entry.sentiment)}">
                ${this.getSentimentEmoji(entry.sentiment)}
              </span>
            </div>
            <button class="entry-delete" onclick="window.auroraApp.journalManager.deleteEntry('${entry.id}')">×</button>
          </div>
          ${entry.prompt ? `<div class="entry-prompt">Prompt: ${entry.prompt}</div>` : ''}
          <div class="entry-content">${entry.content.replace(/\n/g, '<br>')}</div>
        </div>
      `
    }).join('')
  }
}