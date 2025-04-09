import { CONFIG } from './config.js';
import { weatherAPI } from './api.js';
import { storageService } from './storage.js';
import { uiService } from './ui.js';
import { adminService } from './admin.js';

/**
 * Main Application for Arda Weather
 * Connects all services and handles core functionality
 */
class WeatherApp {
    constructor() {
        // Data tracking
        this.currentWeather = null;
        this.forecast = null;
        this.historicalData = null;
        this.selectedCity = null;
        
        // Setup update interval (15 minutes)
        this.updateInterval = CONFIG.UPDATE_INTERVAL * 60 * 1000;
        
        // Initialize app
        this._initApp();
    }
    
    /**
     * Initialize the application
     * @private
     */
    _initApp() {
        // Initialize UI event listeners
        uiService.initEventListeners();
        
        // Set up weather search event listener
        document.addEventListener('weather:search', this._handleSearch.bind(this));
        document.addEventListener('weather:searchComplete', this._handleSearchComplete.bind(this));
        
        // Check for admin status
        this._checkAdminStatus();
        
        // Restore last city if available
        this._restoreLastCity();
        
        // Set up automatic data refresh
        setInterval(() => this._refreshData(), this.updateInterval);
    }
    
    /**
     * Check admin status and update UI
     * @private
     */
    _checkAdminStatus() {
        const isAdmin = storageService.isAdmin();
        uiService.updateAdminUI(isAdmin);
    }
    
    /**
     * Restore last selected city if available
     * @private
     */
    _restoreLastCity() {
        const lastCity = storageService.getLastCity();
        
        if (lastCity) {
            // Set select value
            const citySelect = document.getElementById('city-select');
            for (let i = 0; i < citySelect.options.length; i++) {
                if (citySelect.options[i].value.toLowerCase() === lastCity.toLowerCase()) {
                    citySelect.selectedIndex = i;
                    break;
                }
            }
            
            // Trigger search with last city
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('weather:search', {
                    detail: {
                        city: lastCity,
                        dateFrom: new Date(uiService.dateFrom.value),
                        dateTo: new Date(uiService.dateTo.value)
                    }
                }));
            }, 100);
        }
    }
    
    /**
     * Handle search event
     * @param {CustomEvent} event - Search event with city and date range
     * @private
     */
    async _handleSearch(event) {
        const { city, dateFrom, dateTo, forceRefresh } = event.detail;
        
        if (!city) {
            uiService.showToast('Please select a city', 'error');
            return;
        }
        
        // Store selected city and date range
        this.selectedCity = city;
        
        // Show loading state
        uiService.showLoading(true);
        
        try {
            // Check if we need to update data
            const needsUpdate = forceRefresh || storageService.cityDataNeedsUpdate(city);
            
            // If data needs updating or doesn't exist, fetch new data
            if (needsUpdate) {
                // Fetch current weather
                this.currentWeather = await weatherAPI.getCurrentWeather(city);
                
                // Fetch forecast
                this.forecast = await weatherAPI.getForecast(city);
                
                // Generate historical data
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(new Date().getDate() - 7);
                this.historicalData = await weatherAPI.getHistoricalWeather(city, sevenDaysAgo, new Date());
                
                // Save data to storage
                storageService.saveCityWeatherData(city, this.historicalData);
            } else {
                // Use existing data
                this.currentWeather = await weatherAPI.getCurrentWeather(city);
                this.forecast = await weatherAPI.getForecast(city);
                const storedData = storageService.getCityWeatherData(city);
                this.historicalData = storedData.data;
            }
            
            // Filter historical data by date range
            const filteredData = this.historicalData.filter(item => {
                const itemDate = new Date(item.time);
                return itemDate >= dateFrom && itemDate <= dateTo;
            });
            
            // Save last city
            storageService.updateLastCity(city);
            
            // Dispatch search complete event
            document.dispatchEvent(new CustomEvent('weather:searchComplete', {
                detail: {
                    success: true,
                    currentWeather: this.currentWeather,
                    forecast: this.forecast,
                    historicalData: filteredData
                }
            }));
        } catch (error) {
            console.error('Error searching weather:', error);
            
            // Dispatch search complete event with error
            document.dispatchEvent(new CustomEvent('weather:searchComplete', {
                detail: {
                    success: false,
                    message: `Error fetching weather data: ${error.message}`
                }
            }));
        } finally {
            // Hide loading state
            uiService.showLoading(false);
        }
    }
    
    /**
     * Handle search complete event
     * @param {CustomEvent} event - Search complete event with weather data
     * @private
     */
    _handleSearchComplete(event) {
        const { success, currentWeather, forecast, historicalData, message } = event.detail;
        
        if (success) {
            // Show data sections
            uiService.toggleDataSections(true);
            
            // Display current weather
            uiService.displayCurrentWeather(currentWeather);
            
            // Display hourly forecast
            uiService.displayHourlyForecast(forecast);
            
            // Display historical data
            uiService.displayWeatherHistory(historicalData);
        } else {
            // Hide data sections
            uiService.toggleDataSections(false);
            
            // Show error message
            if (message) {
                uiService.showToast(message, 'error');
            }
        }
    }
    
    /**
     * Refresh data automatically
     * @private
     */
    _refreshData() {
        const city = this.selectedCity;
        
        if (city && storageService.cityDataNeedsUpdate(city)) {
            console.log(`Auto-refreshing data for ${city}`);
            
            // Silently update data without UI changes
            weatherAPI.getCurrentWeather(city)
                .then(currentWeather => this.currentWeather = currentWeather)
                .catch(error => console.error('Error auto-refreshing current weather:', error));
            
            weatherAPI.getForecast(city)
                .then(forecast => this.forecast = forecast)
                .catch(error => console.error('Error auto-refreshing forecast:', error));
            
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(new Date().getDate() - 7);
            
            weatherAPI.getHistoricalWeather(city, sevenDaysAgo, new Date())
                .then(historicalData => {
                    this.historicalData = historicalData;
                    storageService.saveCityWeatherData(city, historicalData);
                })
                .catch(error => console.error('Error auto-refreshing historical data:', error));
        }
    }
}

/**
 * Initialize the app for export
 */
export function initApp() {
    // Create weather app instance
    const app = new WeatherApp();
    
    // Show toast when app is ready
    setTimeout(() => {
        uiService.showToast('Arda Weather is ready! Select a city to get started.', 'info');
    }, 500);
}

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();
}); 