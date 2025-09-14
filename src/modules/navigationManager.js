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
      
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
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
    // Add any section-specific logic here
    if (sectionName === 'insights') {
      // Trigger insights update when section becomes visible
      setTimeout(() => {
        const event = new CustomEvent('insightsVisible')
        document.dispatchEvent(event)
      }, 100)
    }
  }

  toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu')
    const mobileToggle = document.querySelector('.mobile-menu-toggle')
    
    navMenu.classList.toggle('active')
    mobileToggle.classList.toggle('active')
  }

  closeMobileMenu() {
    const navMenu = document.querySelector('.nav-menu')
    const mobileToggle = document.querySelector('.mobile-menu-toggle')
    
    navMenu.classList.remove('active')
    mobileToggle.classList.remove('active')
  }

  handleMobileMenu() {
    // Add mobile menu styles dynamically if needed
    const style = document.createElement('style')
    style.textContent = `
      @media (max-width: 768px) {
        .nav-menu.active {
          display: flex !important;
        }
        .mobile-menu-toggle.active span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .mobile-menu-toggle.active span:nth-child(2) {
          opacity: 0;
        }
        .mobile-menu-toggle.active span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }
      }
    `
    document.head.appendChild(style)
  }
}