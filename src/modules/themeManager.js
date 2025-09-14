export class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme()
    this.init()
  }

  init() {
    this.applyTheme(this.currentTheme)
    this.bindEvents()
  }

  bindEvents() {
    const themeToggle = document.getElementById('theme-toggle')
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme()
      })
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
    this.applyTheme(newTheme)
    this.saveTheme(newTheme)
  }

  applyTheme(theme) {
    this.currentTheme = theme
    document.documentElement.setAttribute('data-theme', theme)
    
    const themeIcon = document.querySelector('.theme-icon')
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙'
    }
  }

  loadTheme() {
    try {
      const saved = localStorage.getItem('aurora-journal-theme')
      return saved || 'dark'
    } catch (error) {
      return 'dark'
    }
  }

  saveTheme(theme) {
    try {
      localStorage.setItem('aurora-journal-theme', theme)
    } catch (error) {
      console.error('Error saving theme:', error)
    }
  }
}