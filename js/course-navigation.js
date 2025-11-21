// Course Navigation and Progress Tracking System
class CourseNavigation {
    constructor() {
        this.currentModule = this.getCurrentModule();
        this.currentLesson = this.getCurrentLesson();
        this.userProgress = this.loadUserProgress();
        this.isInitialized = false;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupProgressTracking();
        this.setupLessonCompletion();
        this.setupKeyboardNavigation();
        this.setupVideoPlayer();
        this.setupExerciseSystem();
        this.updateAllProgressBars();
        this.highlightCurrentLesson();
        
        this.isInitialized = true;
        console.log('🎓 Course Navigation initialized');
    }

    // Module and Lesson Detection
    getCurrentModule() {
        const path = window.location.pathname;
        const match = path.match(/courses\/([^\/]+)/);
        return match ? match[1] : 'basics';
    }

    getCurrentLesson() {
        const path = window.location.pathname;
        const match = path.match(/(lesson|module)(\d+)/i);
        if (match) return match[0].toLowerCase();
        
        // Fallback to URL hash or default
        const hash = window.location.hash.replace('#', '');
        return hash || 'lesson1';
    }

    // Progress Management
    loadUserProgress() {
        const saved = localStorage.getItem('pythonMasterCourseProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Initialize default progress structure
        return {
            version: '1.0',
            lastUpdated: new Date().toISOString(),
            modules: {
                basics: {
                    name: 'Основы Python',
                    completed: 0,
                    totalLessons: 15,
                    lessons: {
                        lesson1: { completed: true, score: 100, completedAt: new Date().toISOString() },
                        lesson2: { completed: true, score: 100, completedAt: new Date().toISOString() },
                        lesson3: { completed: false, score: 0 },
                        // ... other lessons will be auto-initialized
                    }
                },
                functions: {
                    name: 'Функции и модули',
                    completed: 0,
                    totalLessons: 10,
                    lessons: {}
                },
                oop: {
                    name: 'ООП в Python',
                    completed: 0,
                    totalLessons: 16,
                    lessons: {}
                }
                // ... other modules
            },
            statistics: {
                totalLessonsCompleted: 0,
                totalScore: 0,
                averageScore: 0,
                timeSpent: 0, // in minutes
                currentStreak: 0,
                lastStudyDate: null
            }
        };
    }

    saveUserProgress() {
        this.userProgress.lastUpdated = new Date().toISOString();
        localStorage.setItem('pythonMasterCourseProgress', JSON.stringify(this.userProgress));
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('progressUpdated', {
            detail: { progress: this.userProgress }
        }));
    }

    // Navigation Setup
    setupNavigation() {
        // Lesson links in sidebar
        document.querySelectorAll('.lesson-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.navigateToLesson(href);
            });
        });

        // Next/previous buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const href = btn.getAttribute('href');
                this.navigateToLesson(href);
            });
        });

        // Module expansion in sidebar
        this.setupModuleExpansion();

        // Breadcrumb navigation
        this.setupBreadcrumbNavigation();

        // Quick navigation menu
        this.setupQuickNavigation();
    }

    setupModuleExpansion() {
        document.querySelectorAll('.group-header').forEach(header => {
            header.addEventListener('click', () => {
                const group = header.parentElement;
                group.classList.toggle('expanded');
                
                // Save expansion state
                const moduleId = group.querySelector('h4').textContent;
                this.saveExpansionState(moduleId, group.classList.contains('expanded'));
            });
        });

        // Restore expansion states
        this.restoreExpansionStates();
    }

    saveExpansionState(moduleId, isExpanded) {
        const states = this.getStorage('moduleExpansion', {});
        states[moduleId] = isExpanded;
        this.setStorage('moduleExpansion', states);
    }

    restoreExpansionStates() {
        const states = this.getStorage('moduleExpansion', {});
        document.querySelectorAll('.lesson-group').forEach(group => {
            const header = group.querySelector('h4');
            if (header && states[header.textContent]) {
                group.classList.add('expanded');
            }
        });
    }

    setupBreadcrumbNavigation() {
        const breadcrumb = document.querySelector('.course-breadcrumb');
        if (breadcrumb) {
            // Update breadcrumb based on current page
            this.updateBreadcrumb();
        }
    }

    updateBreadcrumb() {
        const breadcrumb = document.querySelector('.course-breadcrumb');
        if (!breadcrumb) return;

        const moduleName = this.getModuleName(this.currentModule);
        const lessonName = this.getCurrentLessonName();

        breadcrumb.innerHTML = `
            <a href="/">Главная</a> > 
            <a href="/courses/">Курсы</a> > 
            <a href="/courses/${this.currentModule}/">${moduleName}</a> > 
            <span>${lessonName}</span>
        `;
    }

    setupQuickNavigation() {
        // Add quick navigation dropdown for mobile
        if (window.innerWidth < 768) {
            this.createQuickNavDropdown();
        }
    }

    createQuickNavDropdown() {
        const quickNav = document.createElement('select');
        quickNav.className = 'quick-nav-dropdown';
        quickNav.innerHTML = `<option value="">Быстрая навигация...</option>`;
        
        // Populate with lessons
        document.querySelectorAll('.lesson-link').forEach(link => {
            const option = document.createElement('option');
            option.value = link.getAttribute('href');
            option.textContent = link.querySelector('.lesson-title').textContent;
            quickNav.appendChild(option);
        });

        quickNav.addEventListener('change', (e) => {
            if (e.target.value) {
                this.navigateToLesson(e.target.value);
            }
        });

        const sidebar = document.querySelector('.course-sidebar');
        if (sidebar) {
            sidebar.insertBefore(quickNav, sidebar.firstChild);
        }
    }

    // Progress Tracking
    setupProgressTracking() {
        // Update progress bars
        this.updateAllProgressBars();

        // Track time spent on lesson
        this.startTimeTracking();

        // Auto-save progress periodically
        this.setupAutoSave();
    }

    updateAllProgressBars() {
        this.updateModuleProgress();
        this.updateGlobalProgress();
        this.updateLessonGroupProgress();
    }

    updateModuleProgress() {
        const moduleProgress = this.calculateModuleProgress();
        const progressBar = document.getElementById('moduleProgressBar');
        const progressText = document.getElementById('moduleProgress');

        if (progressBar && progressText) {
            progressBar.style.width = `${moduleProgress}%`;
            progressBar.setAttribute('data-progress', moduleProgress);
            progressText.textContent = `${moduleProgress}%`;
        }
    }

    updateGlobalProgress() {
        const globalProgress = this.calculateGlobalProgress();
        const progressBar = document.getElementById('globalProgressBar');
        const progressText = document.getElementById('globalProgress');

        if (progressBar && progressText) {
            progressBar.style.width = `${globalProgress}%`;
            progressText.textContent = `${globalProgress}%`;
        }
    }

    updateLessonGroupProgress() {
        document.querySelectorAll('.lesson-group').forEach(group => {
            const lessons = group.querySelectorAll('.lesson-item');
            const completed = group.querySelectorAll('.lesson-item.completed').length;
            const total = lessons.length;
            const progressElement = group.querySelector('.group-progress');
            
            if (progressElement) {
                progressElement.textContent = `${completed}/${total}`;
                
                // Update visual indicator
                const progress = total > 0 ? (completed / total) * 100 : 0;
                progressElement.style.background = `linear-gradient(90deg, var(--python-green) ${progress}%, transparent ${progress}%)`;
            }
        });
    }

    calculateModuleProgress() {
        const module = this.userProgress.modules[this.currentModule];
        if (!module) return 0;
        
        const completed = Object.values(module.lessons).filter(lesson => lesson.completed).length;
        const total = module.totalLessons || 1;
        return Math.round((completed / total) * 100);
    }

    calculateGlobalProgress() {
        let totalLessons = 0;
        let completedLessons = 0;

        Object.values(this.userProgress.modules).forEach(module => {
            totalLessons += module.totalLessons || 0;
            completedLessons += Object.values(module.lessons).filter(lesson => lesson.completed).length;
        });

        return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    }

    // Lesson Completion System
    setupLessonCompletion() {
        // Mark lesson as viewed
        this.markLessonViewed();

        // Setup completion triggers
        this.setupCompletionTriggers();

        // Check if current lesson should be auto-completed
        this.checkAutoCompletion();
    }

    markLessonViewed() {
        if (!this.userProgress.modules[this.currentModule]) {
            this.userProgress.modules[this.currentModule] = {
                name: this.getModuleName(this.currentModule),
                completed: 0,
                totalLessons: 15, // Default, should be dynamic
                lessons: {}
            };
        }

        if (!this.userProgress.modules[this.currentModule].lessons[this.currentLesson]) {
            this.userProgress.modules[this.currentModule].lessons[this.currentLesson] = {
                completed: false,
                score: 0,
                viewed: true,
                firstViewedAt: new Date().toISOString()
            };
        } else {
            this.userProgress.modules[this.currentModule].lessons[this.currentLesson].viewed = true;
        }

        this.saveUserProgress();
    }

    setupCompletionTriggers() {
        // Watch for exercise completions
        document.addEventListener('exerciseCompleted', (e) => {
            this.handleExerciseCompletion(e.detail);
        });

        // Watch for code execution success
        document.addEventListener('codeExecutedSuccessfully', (e) => {
            this.handleCodeExecutionSuccess(e.detail);
        });

        // Manual completion button
        const completeBtn = document.querySelector('.complete-lesson-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                this.completeLesson(100, 'manual');
            });
        }
    }

    handleExerciseCompletion(detail) {
        const { exerciseId, score, type } = detail;
        
        // Update lesson progress based on exercise completion
        if (score >= 80) { // Threshold for success
            this.completeLesson(score, type);
        }
    }

    handleCodeExecutionSuccess(detail) {
        const { code, output, success } = detail;
        
        // Check if this completes a learning objective
        if (success && this.meetsCompletionCriteria(code, output)) {
            this.completeLesson(100, 'code_execution');
        }
    }

    meetsCompletionCriteria(code, output) {
        // Implement criteria checking based on lesson objectives
        // This would be more sophisticated in a real implementation
        const currentLesson = this.currentLesson;
        
        // Example criteria for different lessons
        const criteria = {
            'lesson1': () => code.includes('print') && output.includes('Hello'),
            'lesson2': () => code.includes('def ') && code.includes('return'),
            'lesson3': () => code.includes('if ') && code.includes('else'),
            // ... more criteria
        };

        const check = criteria[currentLesson];
        return check ? check() : false;
    }

    completeLesson(score = 100, completionType = 'auto') {
        if (!this.userProgress.modules[this.currentModule]?.lessons[this.currentLesson]) {
            this.markLessonViewed();
        }

        const lesson = this.userProgress.modules[this.currentModule].lessons[this.currentLesson];
        
        if (!lesson.completed) {
            lesson.completed = true;
            lesson.score = Math.max(lesson.score, score);
            lesson.completedAt = new Date().toISOString();
            lesson.completionType = completionType;

            // Update module completion count
            this.userProgress.modules[this.currentModule].completed = 
                Object.values(this.userProgress.modules[this.currentModule].lessons)
                    .filter(l => l.completed).length;

            // Update statistics
            this.updateStatistics();

            this.saveUserProgress();
            this.updateAllProgressBars();
            this.showCompletionMessage(score);
            this.highlightCurrentLesson();

            // Dispatch completion event
            document.dispatchEvent(new CustomEvent('lessonCompleted', {
                detail: {
                    module: this.currentModule,
                    lesson: this.currentLesson,
                    score: score,
                    type: completionType
                }
            }));
        }
    }

    updateStatistics() {
        const stats = this.userProgress.statistics;
        
        // Update total lessons completed
        stats.totalLessonsCompleted = Object.values(this.userProgress.modules)
            .reduce((total, module) => total + Object.values(module.lessons).filter(l => l.completed).length, 0);
        
        // Update average score
        const allLessons = Object.values(this.userProgress.modules)
            .flatMap(module => Object.values(module.lessons))
            .filter(lesson => lesson.completed);
        
        stats.totalScore = allLessons.reduce((sum, lesson) => sum + lesson.score, 0);
        stats.averageScore = allLessons.length > 0 ? Math.round(stats.totalScore / allLessons.length) : 0;
        
        // Update streak
        this.updateStudyStreak();
    }

    updateStudyStreak() {
        const today = new Date().toDateString();
        const stats = this.userProgress.statistics;
        
        if (stats.lastStudyDate === today) {
            return; // Already updated today
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (stats.lastStudyDate === yesterdayStr) {
            stats.currentStreak++;
        } else if (stats.lastStudyDate !== today) {
            stats.currentStreak = 1;
        }
        
        stats.lastStudyDate = today;
    }

    // UI Updates
    highlightCurrentLesson() {
        // Remove current class from all lessons
        document.querySelectorAll('.lesson-item').forEach(item => {
            item.classList.remove('current');
        });

        // Add current class to current lesson
        const currentLessonElement = document.querySelector(`[href*="${this.currentLesson}"]`);
        if (currentLessonElement) {
            const lessonItem = currentLessonElement.closest('.lesson-item');
            if (lessonItem) {
                lessonItem.classList.add('current');
                
                // Ensure the parent group is expanded
                const lessonGroup = lessonItem.closest('.lesson-group');
                if (lessonGroup) {
                    lessonGroup.classList.add('expanded');
                }
            }
        }

        // Update completed lessons
        this.updateCompletedLessonsUI();
    }

    updateCompletedLessonsUI() {
        document.querySelectorAll('.lesson-item').forEach(item => {
            const link = item.querySelector('.lesson-link');
            if (link) {
                const lessonId = this.extractLessonIdFromHref(link.getAttribute('href'));
                const isCompleted = this.isLessonCompleted(lessonId);
                
                item.classList.toggle('completed', isCompleted);
                
                // Update icon
                const icon = item.querySelector('.lesson-icon');
                if (icon) {
                    icon.textContent = isCompleted ? '✅' : '📝';
                }
            }
        });
    }

    isLessonCompleted(lessonId) {
        return this.userProgress.modules[this.currentModule]?.lessons[lessonId]?.completed || false;
    }

    extractLessonIdFromHref(href) {
        const match = href.match(/(lesson\d+)/i);
        return match ? match[1].toLowerCase() : '';
    }

    // Navigation Methods
    navigateToLesson(url) {
        // Show loading state
        this.showLoadingState();

        // Save current state
        this.saveCurrentState();

        // Navigate after a short delay for smooth transition
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }

    showLoadingState() {
        const overlay = document.createElement('div');
        overlay.className = 'navigation-loading';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="python-loader">
                    <div class="python-shape"></div>
                    <div class="python-shape"></div>
                </div>
                <p>Загрузка урока...</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 3000);
    }

    saveCurrentState() {
        // Save scroll position
        const scrollState = {
            position: window.scrollY,
            timestamp: new Date().toISOString()
        };
        this.setStorage('scrollState', scrollState);
    }

    restoreScrollState() {
        const scrollState = this.getStorage('scrollState');
        if (scrollState && scrollState.position) {
            window.scrollTo(0, scrollState.position);
            this.removeStorage('scrollState');
        }
    }

    // Time Tracking
    startTimeTracking() {
        this.lessonStartTime = new Date();
        
        // Track active time (not just tab open time)
        this.setupActiveTimeTracking();
    }

    setupActiveTimeTracking() {
        let activeTime = 0;
        let lastActiveTime = Date.now();
        
        const updateActiveTime = () => {
            const now = Date.now();
            activeTime += now - lastActiveTime;
            lastActiveTime = now;
        };
        
        // Update on user activity
        ['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
            document.addEventListener(event, updateActiveTime, { passive: true });
        });
        
        // Save when leaving page
        window.addEventListener('beforeunload', () => {
            updateActiveTime();
            this.saveStudyTime(activeTime);
        });
    }

    saveStudyTime(activeTimeMs) {
        const timeInMinutes = Math.round(activeTimeMs / 60000); // Convert to minutes
        
        if (this.userProgress.modules[this.currentModule]?.lessons[this.currentLesson]) {
            const lesson = this.userProgress.modules[this.currentModule].lessons[this.currentLesson];
            lesson.timeSpent = (lesson.timeSpent || 0) + timeInMinutes;
            this.userProgress.statistics.timeSpent += timeInMinutes;
            this.saveUserProgress();
        }
    }

    // Exercise System
    setupExerciseSystem() {
        // Initialize exercise tracking
        document.querySelectorAll('.exercise-editor').forEach(editor => {
            this.setupExerciseEditor(editor);
        });
    }

    setupExerciseEditor(editor) {
        const runBtn = editor.querySelector('.run-btn');
        const checkBtn = editor.querySelector('.check-btn');
        
        if (runBtn) {
            runBtn.addEventListener('click', () => this.handleExerciseRun(editor));
        }
        
        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.handleExerciseCheck(editor));
        }
    }

    handleExerciseRun(editor) {
        const output = editor.querySelector('.output-content');
        if (output) {
            output.innerHTML = '<div class="loading">Выполнение кода...</div>';
        }
        
        // Simulate code execution
        setTimeout(() => {
            if (output) {
                output.innerHTML = '<div class="output-success">✅ Код выполнен успешно!</div>';
            }
        }, 1000);
    }

    handleExerciseCheck(editor) {
        const code = editor.querySelector('.code-editor')?.value;
        const output = editor.querySelector('.output-content');
        
        if (this.validateExerciseSolution(code)) {
            if (output) {
                output.innerHTML = '<div class="output-success">🎉 Задание выполнено правильно!</div>';
            }
            
            // Mark exercise as completed
            document.dispatchEvent(new CustomEvent('exerciseCompleted', {
                detail: {
                    exerciseId: this.currentLesson,
                    score: 100,
                    type: 'exercise'
                }
            }));
        } else {
            if (output) {
                output.innerHTML = '<div class="output-error">❌ Попробуйте еще раз. Проверьте решение.</div>';
            }
        }
    }

    validateExerciseSolution(code) {
        // Basic validation - would be more sophisticated in real implementation
        const validators = {
            'lesson1': (code) => code.includes('print') && code.includes('"') || code.includes("'"),
            'lesson2': (code) => code.includes('def ') && code.includes('return'),
            'lesson3': (code) => code.includes('if ') && code.includes('else'),
            // ... more validators
        };
        
        const validator = validators[this.currentLesson];
        return validator ? validator(code) : true;
    }

    // Video Player Integration
    setupVideoPlayer() {
        const videoPlayer = document.querySelector('.lesson-video');
        if (videoPlayer) {
            this.setupVideoProgressTracking(videoPlayer);
        }
    }

    setupVideoProgressTracking(videoPlayer) {
        let progressSaved = false;
        
        videoPlayer.addEventListener('timeupdate', () => {
            const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
            
            // Save progress every 10 seconds or when reaching 80%
            if ((progress % 10 < 1 || progress >= 80) && !progressSaved) {
                this.saveVideoProgress(progress);
                progressSaved = true;
                
                setTimeout(() => {
                    progressSaved = false;
                }, 5000);
            }
        });
        
        videoPlayer.addEventListener('ended', () => {
            // Mark video as completed
            this.saveVideoProgress(100);
            
            // Potentially complete lesson if video was the main content
            if (this.isVideoBasedLesson()) {
                this.completeLesson(100, 'video_completion');
            }
        });
    }

    saveVideoProgress(progress) {
        if (this.userProgress.modules[this.currentModule]?.lessons[this.currentLesson]) {
            this.userProgress.modules[this.currentModule].lessons[this.currentLesson].videoProgress = progress;
            this.saveUserProgress();
        }
    }

    isVideoBasedLesson() {
        // Determine if this lesson is primarily video-based
        return document.querySelector('.lesson-video') !== null;
    }

    // Keyboard Navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only handle if user is not typing in an input
            if (e.target.matches('input, textarea, .code-editor')) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.navigateToPrevious();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.navigateToNext();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
            }
        });
    }

    navigateToPrevious() {
        const prevBtn = document.querySelector('.nav-btn.prev');
        if (prevBtn) {
            prevBtn.click();
        }
    }

    navigateToNext() {
        const nextBtn = document.querySelector('.nav-btn.next');
        if (nextBtn) {
            nextBtn.click();
        }
    }

    togglePlayPause() {
        const video = document.querySelector('.lesson-video');
        if (video) {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    }

    // Auto-save System
    setupAutoSave() {
        setInterval(() => {
            this.saveUserProgress();
        }, 30000); // Auto-save every 30 seconds
    }

    // Utility Methods
    getModuleName(moduleId) {
        const moduleNames = {
            'basics': 'Основы Python',
            'functions': 'Функции и модули',
            'oop': 'ООП в Python',
            'web-dev': 'Веб-разработка',
            'data-science': 'Data Science'
        };
        return moduleNames[moduleId] || moduleId;
    }

    getCurrentLessonName() {
        const lessonElement = document.querySelector('.lesson-header h1');
        return lessonElement ? lessonElement.textContent : 'Текущий урок';
    }

    showCompletionMessage(score) {
        const message = document.createElement('div');
        message.className = 'completion-message animate-success';
        message.innerHTML = `
            <div class="completion-content">
                <div class="completion-icon">🎉</div>
                <h3>Урок завершен!</h3>
                <p>Вы успешно прошли урок и заработали ${score} баллов</p>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                    Продолжить обучение
                </button>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }

    checkAutoCompletion() {
        // Check if lesson meets criteria for auto-completion
        const hasExercises = document.querySelector('.exercise-editor') !== null;
        const hasVideo = document.querySelector('.lesson-video') !== null;
        
        // Auto-complete if it's a simple lesson without exercises
        if (!hasExercises && !hasVideo) {
            // Wait a bit to ensure user has seen the content
            setTimeout(() => {
                this.completeLesson(100, 'auto_view');
            }, 30000); // 30 seconds
        }
    }

    // Storage utilities (compatible with app.js)
    setStorage(key, value) {
        try {
            localStorage.setItem(`courseNav_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`courseNav_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage read error:', error);
            return defaultValue;
        }
    }

    removeStorage(key) {
        try {
            localStorage.removeItem(`courseNav_${key}`);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }
}

// Initialize course navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on course pages
    if (window.location.pathname.includes('/courses/')) {
        window.courseNav = new CourseNavigation();
        
        // Restore scroll position after images load
        window.addEventListener('load', () => {
            setTimeout(() => {
                window.courseNav.restoreScrollState();
            }, 100);
        });
    }
});

// Export for global access
window.CourseNavigation = CourseNavigation;
