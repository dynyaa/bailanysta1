// Modal functionality for ArtHub landing page

document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modalOverlay = document.getElementById('modal-overlay');
    const signupModal = document.getElementById('signup-modal');
    const signinModal = document.getElementById('signin-modal');
    
    // Initialize event listeners
    initializeEventListeners();
    
    function initializeEventListeners() {
        // Close modal when clicking overlay
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
        
        // Handle form submissions
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.addEventListener('submit', handleFormSubmit);
        });
        
        // Handle hero email signup
        const heroSignupButton = document.querySelector('.signup-button');
        if (heroSignupButton) {
            heroSignupButton.addEventListener('click', function(e) {
                e.preventDefault();
                const emailInput = document.querySelector('.email-input');
                if (emailInput && emailInput.value.trim()) {
                    // Pre-fill the signup modal email
                    openModal('signup');
                    const modalEmailInput = document.querySelector('#signup-modal .form-input[type="email"]');
                    if (modalEmailInput) {
                        modalEmailInput.value = emailInput.value.trim();
                    }
                } else {
                    openModal('signup');
                }
            });
        }
        
        // Handle tour button click
        const tourButton = document.querySelector('.tour-button');
        if (tourButton) {
            tourButton.addEventListener('click', function() {
                // For demo purposes, show an alert. In a real app, this would trigger a tour
                alert('Welcome to ArtHub! This would start an interactive tour of the platform.');
            });
        }
        
        // Add smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Global functions for modal management
    window.openModal = function(type) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (type === 'signup') {
            signupModal.classList.remove('hidden');
            signinModal.classList.add('hidden');
            updateTabStates('signup');
        } else if (type === 'signin') {
            signinModal.classList.remove('hidden');
            signupModal.classList.add('hidden');
            updateTabStates('signin');
        }
        
        // Focus on first input for accessibility
        setTimeout(() => {
            const activeModal = type === 'signup' ? signupModal : signinModal;
            const firstInput = activeModal.querySelector('.form-input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    };
    
    window.closeModal = function() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear form inputs
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => form.reset());
        
        // Remove any error states
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });
    };
    
    window.switchTab = function(type) {
        if (type === 'signup') {
            signupModal.classList.remove('hidden');
            signinModal.classList.add('hidden');
            updateTabStates('signup');
        } else if (type === 'signin') {
            signinModal.classList.remove('hidden');
            signupModal.classList.add('hidden');
            updateTabStates('signin');
        }
        
        // Focus on first input
        setTimeout(() => {
            const activeModal = type === 'signup' ? signupModal : signinModal;
            const firstInput = activeModal.querySelector('.form-input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    };
    
    function updateTabStates(activeTab) {
        // Update tab button states
        const allTabButtons = document.querySelectorAll('.tab-btn');
        allTabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activate correct tabs
        const activeModal = activeTab === 'signup' ? signupModal : signinModal;
        const tabButtons = activeModal.parentElement.querySelectorAll('.tab-btn');
        
        if (activeTab === 'signup') {
            // Find and activate signup tab
            tabButtons.forEach(btn => {
                if (btn.textContent.trim() === 'Sign Up') {
                    btn.classList.add('active');
                }
            });
        } else {
            // Find and activate signin tab
            tabButtons.forEach(btn => {
                if (btn.textContent.trim() === 'Sign In') {
                    btn.classList.add('active');
                }
            });
        }
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const inputs = form.querySelectorAll('.form-input');
        const submitButton = form.querySelector('.form-submit');
        
        // Basic form validation
        let isValid = true;
        const formData = {};
        
        inputs.forEach(input => {
            const value = input.value.trim();
            const field = input.placeholder.toLowerCase().replace(' ', '_');
            
            // Reset previous error states
            input.style.borderColor = '';
            
            if (!value) {
                isValid = false;
                input.style.borderColor = '#dc3545';
                showFieldError(input, 'This field is required');
            } else if (input.type === 'email' && !isValidEmail(value)) {
                isValid = false;
                input.style.borderColor = '#dc3545';
                showFieldError(input, 'Please enter a valid email address');
            } else if (input.placeholder === 'Password' && value.length < 6) {
                isValid = false;
                input.style.borderColor = '#dc3545';
                showFieldError(input, 'Password must be at least 6 characters');
            } else if (input.placeholder === 'Confirm Password') {
                const passwordInput = form.querySelector('input[placeholder="Password"]');
                if (passwordInput && value !== passwordInput.value) {
                    isValid = false;
                    input.style.borderColor = '#dc3545';
                    showFieldError(input, 'Passwords do not match');
                }
            }
            
            formData[field] = value;
        });
        
        if (!isValid) {
            return;
        }
        
        // Show loading state
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Please wait...';
        submitButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            // Show success message and transition to dashboard
        const isSignUp = submitButton.textContent.includes('Register');
        const message = isSignUp ?
            'Account created successfully! Welcome to ArtHub!' :
            'Sign in successful! Welcome back to ArtHub!';

        alert(message);
        closeModal();

        // Transition to dashboard
        showDashboard();

        // In a real application, you would:
        // - Make an actual API call
        // - Handle authentication tokens
        // - Store user session data
        // - Load user-specific content
            
        }, 1500);
    }
    
    function showFieldError(input, message) {
        // Remove any existing error message
        const existingError = input.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create and show error message
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 12px;
            margin-top: 4px;
            position: absolute;
            left: 0;
            top: 100%;
        `;
        
        // Position relative to input
        input.style.position = 'relative';
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(errorElement);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorElement.parentElement) {
                errorElement.remove();
            }
        }, 5000);
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Handle smooth scroll for navigation links
    function smoothScrollTo(targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            const headerHeight = document.querySelector('.navigation').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Add loading animation to buttons
    function addButtonLoadingState(button) {
        const originalText = button.textContent;
        button.textContent = 'Loading...';
        button.disabled = true;
        
        return function() {
            button.textContent = originalText;
            button.disabled = false;
        };
    }
    
    // Handle window resize for responsive adjustments
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Adjust modal positioning if needed
            if (modalOverlay.classList.contains('active')) {
                // Re-center modal on resize
                const activeModal = document.querySelector('.auth-modal:not(.hidden)');
                if (activeModal) {
                    // Modal is already centered with CSS, but we could add
                    // additional responsive adjustments here if needed
                }
            }
        }, 250);
    });
    
    // Add intersection observer for animations (optional enhancement)
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements for fade-in animations
        const elementsToAnimate = document.querySelectorAll('.hero-text, .tour-button, .footer');
        elementsToAnimate.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    
    // Initialize any additional features
    initializeAccessibilityFeatures();
    
    function initializeAccessibilityFeatures() {
        // Add ARIA labels where needed
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.setAttribute('aria-label', 'Search ArtHub');
        }
        
        // Add proper button roles
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                // Add aria-label for icon-only buttons
                if (button.classList.contains('close-btn')) {
                    button.setAttribute('aria-label', 'Close modal');
                }
            }
        });
        
        // Announce modal state changes to screen readers
        const modalAnnouncer = document.createElement('div');
        modalAnnouncer.setAttribute('aria-live', 'polite');
        modalAnnouncer.setAttribute('aria-atomic', 'true');
        modalAnnouncer.style.position = 'absolute';
        modalAnnouncer.style.left = '-10000px';
        modalAnnouncer.style.width = '1px';
        modalAnnouncer.style.height = '1px';
        modalAnnouncer.style.overflow = 'hidden';
        document.body.appendChild(modalAnnouncer);
        
        // Update announcer when modals open/close
        const originalOpenModal = window.openModal;
        window.openModal = function(type) {
            originalOpenModal(type);
            modalAnnouncer.textContent = `${type === 'signup' ? 'Sign up' : 'Sign in'} modal opened`;
        };
        
        const originalCloseModal = window.closeModal;
        window.closeModal = function() {
            originalCloseModal();
            modalAnnouncer.textContent = 'Modal closed';
        };
    }
});

    // Dashboard Functions
    function showDashboard() {
        const landingPage = document.querySelector('.main-content');
        const dashboard = document.getElementById('dashboard');
        const footer = document.querySelector('.footer');

        if (landingPage) landingPage.style.display = 'none';
        if (footer) footer.style.display = 'none';
        if (dashboard) dashboard.classList.remove('hidden');

        // Initialize dashboard features
        initializeDashboardFeatures();
    }

    function hideDashboard() {
        const landingPage = document.querySelector('.main-content');
        const dashboard = document.getElementById('dashboard');
        const footer = document.querySelector('.footer');

        if (landingPage) landingPage.style.display = 'block';
        if (footer) footer.style.display = 'block';
        if (dashboard) dashboard.classList.add('hidden');
    }

    function initializeDashboardFeatures() {
        // Add follow button functionality
        const followButtons = document.querySelectorAll('.follow-btn');
        followButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (this.textContent === 'Follow') {
                    this.textContent = 'Following';
                    this.style.background = '#28a745';
                } else {
                    this.textContent = 'Follow';
                    this.style.background = '';
                }
            });
        });

        // Add artwork card click handlers
        const artworkCards = document.querySelectorAll('.artwork-card');
        artworkCards.forEach(card => {
            const image = card.querySelector('.artwork-image');
            if (image) {
                image.addEventListener('click', function() {
                    // In a real app, this would open artwork detail view
                    console.log('Opening artwork detail...');
                });
            }
        });
    }

    // Dashboard Modal Functions
    window.toggleModal = function(modalType) {
        const modalOverlays = document.querySelectorAll('.dashboard-modal-overlay');

        // Close all modals first
        modalOverlays.forEach(overlay => {
            overlay.classList.remove('active');
        });

        // Open specific modal
        const targetModal = document.getElementById(modalType + '-modal');
        if (targetModal) {
            targetModal.classList.add('active');
        }
    };

    // Close dashboard modals when clicking outside
    document.addEventListener('click', function(e) {
        const modalOverlays = document.querySelectorAll('.dashboard-modal-overlay');
        modalOverlays.forEach(overlay => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // Profile Actions
    window.handleProfileAction = function(action) {
        switch(action) {
            case 'boards':
                alert('Opening Boards and Projects...');
                // In a real app, navigate to boards page
                break;
            case 'settings':
                alert('Opening Settings...');
                // In a real app, navigate to settings page
                break;
            default:
                console.log('Unknown profile action:', action);
        }

        // Close profile modal
        const profileModal = document.getElementById('profile-modal');
        if (profileModal) {
            profileModal.classList.remove('active');
        }
    };

    window.handleLogout = function() {
        const confirmLogout = confirm('Are you sure you want to log out?');
        if (confirmLogout) {
            // Hide dashboard and show landing page
            hideDashboard();

            // Clear any user data (in a real app)
            console.log('User logged out');

            // Close profile modal
            const profileModal = document.getElementById('profile-modal');
            if (profileModal) {
                profileModal.classList.remove('active');
            }

            // Show success message
            setTimeout(() => {
                alert('You have been logged out successfully.');
            }, 300);
        }
    };

    // Handle notification interactions
    function initializeNotificationInteractions() {
        const followRequestsSection = document.querySelector('.follow-requests .section-header');
        if (followRequestsSection) {
            followRequestsSection.addEventListener('click', function() {
                alert('Opening follow requests...');
                // In a real app, navigate to follow requests page
            });
        }

        const notificationItems = document.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.addEventListener('click', function() {
                // Mark as read and handle click
                this.style.opacity = '0.7';
                console.log('Notification clicked');
            });
        });
    }

    // Handle message interactions
    function initializeMessageInteractions() {
        const messageItems = document.querySelectorAll('.message-item');
        messageItems.forEach(item => {
            item.addEventListener('click', function() {
                // Open conversation
                const username = this.querySelector('.username').textContent;
                alert(`Opening conversation with ${username}...`);
                // In a real app, navigate to chat interface
            });
        });
    }

    // Initialize all interactions when dashboard is shown
    function initializeDashboardInteractions() {
        initializeNotificationInteractions();
        initializeMessageInteractions();
    }

    // Add keyboard shortcuts for dashboard
    document.addEventListener('keydown', function(e) {
        const dashboard = document.getElementById('dashboard');
        if (!dashboard || dashboard.classList.contains('hidden')) return;

        // Escape to close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.dashboard-modal-overlay.active');
            if (activeModal) {
                activeModal.classList.remove('active');
            }
        }

        // Keyboard shortcuts (Ctrl/Cmd + key)
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'n':
                    e.preventDefault();
                    toggleModal('notifications');
                    break;
                case 'm':
                    e.preventDefault();
                    toggleModal('messages');
                    break;
                case 'p':
                    e.preventDefault();
                    toggleModal('profile');
                    break;
            }
        }
    });

    // Initialize dashboard interactions on load
    setTimeout(() => {
        initializeDashboardInteractions();
    }, 1000);

// Export functions for potential external use
window.ArtHubApp = {
    openModal: window.openModal,
    closeModal: window.closeModal,
    switchTab: window.switchTab,
    showDashboard: showDashboard,
    hideDashboard: hideDashboard,
    toggleModal: window.toggleModal,
    handleProfileAction: window.handleProfileAction,
    handleLogout: window.handleLogout
};
