// Main Application JavaScript for PythonMaster
class PythonMasterApp {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.setupScrollAnimations();
        this.setupNavigation();
        this.setupFloatingCode();
        this.setupPerformanceMonitoring();
        this.initializeModules();
        
        console.log('🐍 PythonMaster initialized successfully!');
    }

    // Theme Management
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeToggle();
        
        // Add theme transition class
        document.body.classList.add('theme-transition');
        
        // Remove transition after initial load
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);
    }

    loadTheme() {
        const saved = localStorage.getItem('pythonMasterTheme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return saved || (systemPrefersDark ? 'dark' : 'light');
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('pythonMasterTheme', this.currentTheme);
        this.updateThemeToggle();
        
        // Dispatch custom event for theme change
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme }
        }));
    }

    updateThemeToggle() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
            toggleBtn.setAttribute('aria-label', 
                `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} theme`);
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Navigation scroll
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Loading screen
        window.addEventListener('load', () => this.handlePageLoad());
        
        // Resize events
        window.addEventListener('resize', () => this.handleResize());
        
        // Beforeunload for saving state
        window.addEventListener('beforeunload', () => this.handleBeforeUnload());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Service worker registration (for PWA)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => this.registerServiceWorker());
        }
    }

    // Scroll Animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Add staggered animation for children
                    if (entry.target.classList.contains('stagger-animation')) {
                        Array.from(entry.target.children).forEach((child, index) => {
                            child.style.animationDelay = `${(index + 1) * 0.1}s`;
                        });
                    }
                }
            });
        }, observerOptions);

        // Observe all scroll reveal elements
        document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
            observer.observe(el);
        });

        // Observe module cards for staggered animation
        document.querySelectorAll('.modules-grid, .practice-grid').forEach(el => {
            el.classList.add('stagger-animation');
            observer.observe(el);
        });
    }

    // Navigation
    setupNavigation() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without page reload
                    history.pushState(null, null, anchor.getAttribute('href'));
                }
            });
        });

        // Active navigation highlighting
        this.updateActiveNavigation();

        // Mobile menu toggle (if needed)
        this.setupMobileNavigation();
    }

    setupMobileNavigation() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });
        }
    }

    updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    }

    // Floating Code Background
    setupFloatingCode() {
        const floatingCode = document.getElementById('floatingCode');
        if (!floatingCode) return;

        const codeSnippets = [
            'print("Hello, World!")',
            'def calculate():',
            'import numpy as np',
            'class PythonMaster:',
            'for i in range(10):',
            'if x > 0:',
            'return result',
            'try:\n    # code\n except:',
            'list comprehension',
            'dictionary.get()'
        ];

        function createFloatingElement() {
            const element = document.createElement('div');
            element.className = 'floating-code-element';
            element.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
            element.style.left = `${Math.random() * 100}%`;
            element.style.animationDelay = `${Math.random() * 15}s`;
            element.style.fontSize = `${Math.random() * 12 + 10}px`;
            element.style.opacity = Math.random() * 0.3 + 0.1;
            
            floatingCode.appendChild(element);
            
            // Remove element after animation
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 15000);
        }

        // Create initial floating elements
        for (let i = 0; i < 8; i++) {
            setTimeout(createFloatingElement, i * 1000);
        }

        // Continue creating elements
        setInterval(createFloatingElement, 2000);
    }

    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Monitor page performance
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
            });
        }

        // Monitor largest contentful paint
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log('LCP:', entry.startTime, 'ms');
                }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    // Event Handlers
    handleScroll() {
        const header = document.querySelector('.main-header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Progress indicator for long pages
        this.updateScrollProgress();
    }

    updateScrollProgress() {
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrollTop = window.pageYOffset;
            const progress = (scrollTop / documentHeight) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    handlePageLoad() {
        // Hide loading screen
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }

        // Initialize animations
        this.initializeAnimations();

        // Track page view (analytics)
        this.trackPageView();
    }

    handleResize() {
        // Debounced resize handler
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.updateResponsiveElements();
        }, 250);
    }

    handleBeforeUnload() {
        // Save any unsaved data
        const event = new CustomEvent('appBeforeUnload');
        document.dispatchEvent(event);
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.focusSearch();
        }
        
        // Escape key to close modals
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
        
        // Theme toggle with Alt + T
        if (e.altKey && e.key === 't') {
            e.preventDefault();
            this.toggleTheme();
        }
    }

    // Utility Methods
    focusSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
        } else {
            // Create search modal if it doesn't exist
            this.showSearchModal();
        }
    }

    showSearchModal() {
        // Implementation for search modal
        console.log('Open search modal');
    }

    closeAllModals() {
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    updateResponsiveElements() {
        // Update any elements that need responsive behavior
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile-view', isMobile);
    }

    initializeAnimations() {
        // Initialize any additional animations
        document.querySelectorAll('.hover-lift, .hover-scale').forEach(el => {
            el.classList.add('performance-optimized');
        });
    }

    initializeModules() {
        // Initialize different modules based on current page
        const path = window.location.pathname;
        
        if (path.includes('courses')) {
            this.initializeCourseModule();
        } else if (path.includes('practice')) {
            this.initializePracticeModule();
        } else if (path === '/' || path.includes('index.html')) {
            this.initializeHomeModule();
        }
    }

    initializeCourseModule() {
        // Course-specific initialization
        console.log('Initializing course module...');
    }

    initializePracticeModule() {
        // Practice-specific initialization
        console.log('Initializing practice module...');
    }

    initializeHomeModule() {
        // Homepage-specific initialization
        console.log('Initializing home module...');
        
        // Initialize any homepage-specific features
        this.initializeHeroAnimations();
    }

    initializeHeroAnimations() {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            // Add typing animation to hero title
            heroTitle.classList.add('animate-fadeIn');
        }
    }

    // Analytics and Tracking
    trackPageView() {
        // Basic analytics tracking
        const pageData = {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            referrer: document.referrer
        };
        
        console.log('Page view:', pageData);
        
        // You can integrate with analytics services here
        // Example: Google Analytics, Matomo, etc.
    }

    trackEvent(category, action, label) {
        const eventData = {
            category,
            action,
            label,
            timestamp: new Date().toISOString()
        };
        
        console.log('Event tracked:', eventData);
        
        // Dispatch custom event for analytics
        document.dispatchEvent(new CustomEvent('analyticsEvent', {
            detail: eventData
        }));
    }

    // Service Worker Registration
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('SW registered: ', registration);
            
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('SW update found!');
                
                newWorker.addEventListener('statechange', () => {
                    console.log('SW state changed:', newWorker.state);
                });
            });
        } catch (error) {
            console.log('SW registration failed: ', error);
        }
    }

    // Error Handling
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            this.handleError('Global Error', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.handleError('Unhandled Promise Rejection', e.reason);
        });

        // Override console.error for better error tracking
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.handleError('Console Error', args.join(' '));
            originalConsoleError.apply(console, args);
        };
    }

    handleError(type, error) {
        const errorData = {
            type,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
        
        console.error('Application Error:', errorData);
        
        // Dispatch error event for error tracking services
        document.dispatchEvent(new CustomEvent('appError', {
            detail: errorData
        }));
    }

    // Utility Functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Local Storage Utilities
    setStorage(key, value) {
        try {
            localStorage.setItem(`pythonMaster_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`pythonMaster_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage read error:', error);
            return defaultValue;
        }
    }

    removeStorage(key) {
        try {
            localStorage.removeItem(`pythonMaster_${key}`);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    // API Methods (for future backend integration)
    async apiRequest(endpoint, options = {}) {
        const baseURL = 'https://api.pythonmaster.com'; // Example API URL
        const url = `${baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            this.handleError('API Request Failed', error);
            throw error;
        }
    }

    // Export functionality for global access
    exportToGlobal() {
        window.PythonMasterApp = this;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the main application instance
    window.app = new PythonMasterApp();
    
    // Export to global scope for debugging
    window.app.exportToGlobal();
    
    // Dispatch app ready event
    document.dispatchEvent(new CustomEvent('appReady'));
});

// Service Worker for PWA (basic implementation)
if ('serviceWorker' in navigator) {
    const swScript = `
        self.addEventListener('install', (event) => {
            console.log('Service Worker installing...');
            self.skipWaiting();
        });

        self.addEventListener('activate', (event) => {
            console.log('Service Worker activating...');
        });

        self.addEventListener('fetch', (event) => {
            // Basic fetch handling
        });
    `;
    
    // In a real implementation, you would have a separate sw.js file
    // This is just a basic example
}

// Error Boundary for React-like error handling
class ErrorBoundary {
    constructor(element) {
        this.element = element;
    }
    
    catchErrors() {
        this.element.addEventListener('error', (e) => {
            console.error('Component error:', e.error);
            this.showErrorUI();
        }, true);
    }
    
    showErrorUI() {
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-boundary';
        errorDiv.innerHTML = `
            <div style="padding: 20px; background: #f8d7da; color: #721c24; border-radius: 8px; margin: 10px;">
                <h3>😕 Something went wrong</h3>
                <p>We encountered an error. Please refresh the page and try again.</p>
                <button onclick="location.reload()" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Reload Page
                </button>
            </div>
        `;
        
        this.element.appendChild(errorDiv);
    }
}

// Export utility functions for global use
window.PythonMasterUtils = {
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
};
