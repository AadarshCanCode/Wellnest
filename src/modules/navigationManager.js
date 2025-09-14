export class NavigationManager {
  constructor() {
    this.currentSection = 'home'
    this.init()
  }

  init() {
    this.bindEvents()
    this.handleMobileMenu()
  }

  bindEvents() {
    // Navigation menu items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const section = e.target.dataset.section
        this.showSection(section)
      })
    })

    // Mobile menu toggle
    document.querySelector('.mobile-menu-toggle')?.addEventListener('click', () => {
      this.toggleMobileMenu()
    })

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      const navMenu = document.querySelector('.nav-menu')
      const mobileToggle = document.querySelector('.mobile-menu-toggle')
      
      if (navMenu && mobileToggle && 
          !navMenu.contains(e.target) && 
          !mobileToggle.contains(e.target)) {
        this.closeMobileMenu()
      }
    })

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.closeMobileMenu()
      }
    })
  }

  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active')
    })

    // Show target section
    const targetSection = document.getElementById(sectionName)
    if (targetSection) {
      targetSection.classList.add('active')
    }

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active')
    })

    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`)
    if (activeNavItem) {
      activeNavItem.classList.add('active')
    }

    this.currentSection = sectionName
    this.closeMobileMenu()

    // Trigger section-specific actions
    this.onSectionChange(sectionName)
  }

  onSectionChange(sectionName) {
    // Update mood tracker when mood section becomes visible
    if (sectionName === 'mood' && window.auroraApp?.moodTracker) {
      setTimeout(() => {
        window.auroraApp.moodTracker.updateMoodData()
      }, 100)
    }

    // Update insights when insights section becomes visible
    if (sectionName === 'insights' && window.auroraApp?.insightsManager) {
      setTimeout(() => {
        window.auroraApp.insightsManager.updateInsights(window.auroraApp.data)
      }, 100)
    }
  }

  toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu')
    const mobileToggle = document.querySelector('.mobile-menu-toggle')
    
    if (navMenu && mobileToggle) {
      navMenu.classList.toggle('active')
      mobileToggle.classList.toggle('active')
    }
  }

  closeMobileMenu() {
    const navMenu = document.querySelector('.nav-menu')
    const mobileToggle = document.querySelector('.mobile-menu-toggle')
    
    if (navMenu && mobileToggle) {
      navMenu.classList.remove('active')
      mobileToggle.classList.remove('active')
    }
  }

  handleMobileMenu() {
    // Mobile menu styles are handled in CSS
  }
}