import { CONFIG } from './config.js';
import { storageService } from './storage.js';

/**
 * UI Service for Arda Weather Application
 * Handles DOM manipulation and UI updates
 */
class UIService {
    constructor() {
        // DOM elements
        this.citySelect = document.getElementById('city-select');
        this.dateFrom = document.getElementById('date-from');
        this.dateTo = document.getElementById('date-to');
        this.searchBtn = document.getElementById('search-btn');
        
        this.currentWeatherSection = document.getElementById('current-weather');
        this.currentCity = document.getElementById('current-city');
        this.currentDate = document.getElementById('current-date');
        this.currentTemp = document.getElementById('current-temp');
        this.currentCondition = document.getElementById('current-condition');
        this.currentWind = document.getElementById('current-wind');
        this.currentHumidity = document.getElementById('current-humidity');
        this.currentIcon = document.getElementById('current-icon');
        this.currentDescription = document.getElementById('current-description');
        
        this.hourlyForecastSection = document.getElementById('hourly-forecast-section');
        this.hourlyForecastContainer = document.getElementById('hourly-forecast');
        
        this.weatherHistorySection = document.getElementById('weather-history-section');
        this.weatherHistoryContainer = document.getElementById('weather-history');
        this.adminControls = document.getElementById('admin-controls');
        
        this.noDataMessage = document.getElementById('no-data-message');
        
        this.loginBtn = document.getElementById('login-btn');
        this.loginModal = document.getElementById('login-modal');
        this.closeLoginModal = document.getElementById('close-login-modal');
        this.loginForm = document.getElementById('login-form');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        
        this.updateDataBtn = document.getElementById('update-data-btn');
        this.exportExcelBtn = document.getElementById('export-excel-btn');
        this.deleteDataBtn = document.getElementById('delete-data-btn');
        
        this.themeToggle = document.getElementById('theme-toggle');
        
        // Set default dates
        this._setDefaultDates();
        
        // Apply saved theme
        this._applyTheme();
    }
    
    /**
     * Initialize UI event listeners
     */
    initEventListeners() {
        // Search button click
        this.searchBtn.addEventListener('click', () => {
            const event = new CustomEvent('weather:search', {
                detail: {
                    city: this.citySelect.value,
                    dateFrom: new Date(this.dateFrom.value),
                    dateTo: new Date(this.dateTo.value)
                }
            });
            document.dispatchEvent(event);
        });
        
        // Login button click
        this.loginBtn.addEventListener('click', () => {
            if (storageService.isAdmin()) {
                // If already logged in, log out
                storageService.clearAdminToken();
                this.updateAdminUI(false);
                this.showToast('Logged out successfully', 'success');
            } else {
                // Show login modal
                this.loginModal.classList.remove('hidden');
            }
        });
        
        // Close login modal
        this.closeLoginModal.addEventListener('click', () => {
            this.loginModal.classList.add('hidden');
        });
        
        // Login form submit
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = this.usernameInput.value;
            const password = this.passwordInput.value;
            
            if (username === CONFIG.ADMIN.USERNAME && password === CONFIG.ADMIN.PASSWORD) {
                // Generate simple token
                const token = Date.now().toString();
                storageService.saveAdminToken(token);
                this.updateAdminUI(true);
                this.loginModal.classList.add('hidden');
                this.showToast('Logged in as admin', 'success');
            } else {
                this.showToast('Invalid credentials', 'error');
            }
        });
        
        // Update data button click
        this.updateDataBtn.addEventListener('click', () => {
            const event = new CustomEvent('weather:update', {
                detail: {
                    city: this.citySelect.value
                }
            });
            document.dispatchEvent(event);
        });
        
        // Export excel button click
        this.exportExcelBtn.addEventListener('click', () => {
            const event = new CustomEvent('weather:export', {
                detail: {
                    city: this.citySelect.value,
                    dateFrom: new Date(this.dateFrom.value),
                    dateTo: new Date(this.dateTo.value)
                }
            });
            document.dispatchEvent(event);
        });
        
        // Delete data button click
        this.deleteDataBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete weather data for ${this.citySelect.value}?`)) {
                const event = new CustomEvent('weather:delete', {
                    detail: {
                        city: this.citySelect.value
                    }
                });
                document.dispatchEvent(event);
            }
        });
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            const currentTheme = storageService.getTheme();
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            storageService.saveTheme(newTheme);
            this._applyTheme();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.loginModal) {
                this.loginModal.classList.add('hidden');
            }
        });
    }
    
    /**
     * Update admin UI based on login status
     * @param {boolean} isAdmin - Whether the user is an admin
     */
    updateAdminUI(isAdmin) {
        if (isAdmin) {
            this.loginBtn.innerHTML = '<i class="fas fa-sign-out-alt mr-1"></i> Logout';
            this.adminControls.classList.remove('hidden');
        } else {
            this.loginBtn.innerHTML = '<i class="fas fa-user mr-1"></i> Admin Login';
            this.adminControls.classList.add('hidden');
        }
    }
    
    /**
     * Set default dates for the date pickers
     * @private
     */
    _setDefaultDates() {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        this.dateFrom.value = formatDate(yesterday);
        this.dateTo.value = formatDate(today);
    }
    
    /**
     * Show or hide appropriate sections based on data availability
     * @param {boolean} hasData - Whether data exists
     */
    toggleDataSections(hasData) {
        if (hasData) {
            this.currentWeatherSection.classList.remove('hidden');
            this.hourlyForecastSection.classList.remove('hidden');
            this.weatherHistorySection.classList.remove('hidden');
            this.noDataMessage.classList.add('hidden');
        } else {
            this.currentWeatherSection.classList.add('hidden');
            this.hourlyForecastSection.classList.add('hidden');
            this.weatherHistorySection.classList.add('hidden');
            this.noDataMessage.classList.remove('hidden');
        }
    }
    
    /**
     * Display current weather data
     * @param {Object} weather - Current weather data
     */
    displayCurrentWeather(weather) {
        this.currentCity.textContent = `${weather.city}, ${weather.country}`;
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.currentDate.textContent = weather.time.toLocaleDateString(undefined, options);
        
        this.currentTemp.textContent = `${weather.temp}°${CONFIG.UNITS === 'metric' ? 'C' : 'F'}`;
        this.currentCondition.textContent = weather.main;
        this.currentWind.textContent = `${weather.wind_speed} ${CONFIG.UNITS === 'metric' ? 'km/h' : 'mph'}`;
        this.currentHumidity.textContent = `${weather.humidity}%`;
        
        this.currentIcon.src = `${CONFIG.ICONS_URL}/${weather.icon}@4x.png`;
        this.currentDescription.textContent = weather.description;
    }
    
    /**
     * Display hourly forecast data
     * @param {Array} forecast - Forecast data
     */
    displayHourlyForecast(forecast) {
        this.hourlyForecastContainer.innerHTML = '';
        
        // Get the next 24 hours (or up to 8 items)
        const hourlyData = forecast.list.slice(0, 8);
        
        hourlyData.forEach(item => {
            const hourlyCard = document.createElement('div');
            hourlyCard.className = 'flex flex-col items-center p-3 min-w-[100px]';
            
            const time = new Date(item.time);
            const hours = time.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hour12 = hours % 12 || 12;
            
            hourlyCard.innerHTML = `
                <p class="text-sm font-medium text-gray-600">${hour12} ${ampm}</p>
                <img src="${CONFIG.ICONS_URL}/${item.icon}.png" alt="${item.description}" class="w-12 h-12 my-2">
                <p class="text-lg font-bold">${item.temp}°</p>
                <p class="text-xs text-gray-500">${item.description}</p>
                <p class="text-xs text-gray-500 mt-1">
                    <i class="fas fa-wind mr-1"></i> ${item.wind_speed}
                </p>
            `;
            
            this.hourlyForecastContainer.appendChild(hourlyCard);
        });
    }
    
    /**
     * Display weather history data
     * @param {Array} history - Weather history data
     */
    displayWeatherHistory(history) {
        this.weatherHistoryContainer.innerHTML = '';
        
        if (!history || history.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    No weather data available for the selected period
                </td>
            `;
            this.weatherHistoryContainer.appendChild(noDataRow);
            return;
        }
        
        // Sort history by time (most recent first)
        history.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        history.forEach(item => {
            const row = document.createElement('tr');
            
            const time = new Date(item.time);
            const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
            const timeOptions = { hour: 'numeric', minute: '2-digit' };
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${time.toLocaleDateString(undefined, dateOptions)}</div>
                    <div class="text-sm text-gray-500">${time.toLocaleTimeString(undefined, timeOptions)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm font-medium text-gray-800">${item.temp}°${CONFIG.UNITS === 'metric' ? 'C' : 'F'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <img src="${CONFIG.ICONS_URL}/${item.icon}.png" alt="${item.description}" class="w-8 h-8 mr-2">
                        <span class="text-sm text-gray-500">${item.description}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.humidity}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.wind_speed} ${CONFIG.UNITS === 'metric' ? 'km/h' : 'mph'}
                </td>
            `;
            
            this.weatherHistoryContainer.appendChild(row);
        });
    }
    
    /**
     * Show loading state
     * @param {boolean} isLoading - Whether the app is loading
     */
    showLoading(isLoading) {
        if (isLoading) {
            this.searchBtn.disabled = true;
            this.searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Loading...';
        } else {
            this.searchBtn.disabled = false;
            this.searchBtn.innerHTML = '<i class="fas fa-search mr-1"></i> Search';
        }
    }
    
    /**
     * Show toast message
     * @param {string} message - Message to display
     * @param {string} type - Toast type ('success', 'error', 'info')
     */
    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transition-all transform translate-y-0 opacity-100`;
        
        // Set background color based on type
        if (type === 'success') {
            toast.classList.add('bg-green-500', 'text-white');
        } else if (type === 'error') {
            toast.classList.add('bg-red-500', 'text-white');
        } else {
            toast.classList.add('bg-blue-500', 'text-white');
        }
        
        // Set toast content
        toast.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button class="ml-4 text-white focus:outline-none">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add toast to the DOM
        document.body.appendChild(toast);
        
        // Close button functionality
        toast.querySelector('button').addEventListener('click', () => {
            toast.classList.add('translate-y-4', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        });
        
        // Auto close after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-y-4', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * Apply theme (light/dark)
     * @private
     */
    _applyTheme() {
        const theme = storageService.getTheme();
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.classList.add('dark');
            this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            
            // Apply dark mode classes
            document.body.classList.remove('bg-gray-50');
            document.body.classList.add('bg-gray-900', 'text-white');
            
            // Add additional dark mode styles via a CSS class
            const darkStyles = `
                .dark .card { background-color: #1f2937; color: white; }
                .dark .bg-white { background-color: #1f2937 !important; }
                .dark .bg-gray-50 { background-color: #111827 !important; }
                .dark .text-gray-800 { color: #f3f4f6 !important; }
                .dark .text-gray-700 { color: #e5e7eb !important; }
                .dark .text-gray-600 { color: #d1d5db !important; }
                .dark .text-gray-500 { color: #9ca3af !important; }
                .dark .border-gray-200 { border-color: #374151 !important; }
                .dark .divide-gray-200 > * { border-color: #374151 !important; }
                .dark .input, .dark .select { background-color: #374151; border-color: #4b5563; color: white; }
                .dark .input::placeholder { color: #9ca3af; }
                .dark th { background-color: #111827 !important; color: #d1d5db !important; }
                .dark .bg-gradient-to-r { background-image: linear-gradient(to right, #0f172a, #1e40af); }
            `;
            
            // Add style tag if it doesn't exist
            let styleTag = document.getElementById('dark-mode-styles');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'dark-mode-styles';
                document.head.appendChild(styleTag);
            }
            
            styleTag.textContent = darkStyles;
        } else {
            html.classList.remove('dark');
            this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            
            // Remove dark mode classes
            document.body.classList.add('bg-gray-50');
            document.body.classList.remove('bg-gray-900', 'text-white');
            
            // Remove dark mode styles
            const styleTag = document.getElementById('dark-mode-styles');
            if (styleTag) {
                styleTag.textContent = '';
            }
        }
    }
}

// Create a global instance of the UIService
export const uiService = new UIService(); 