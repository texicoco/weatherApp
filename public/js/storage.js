import { CONFIG } from './config.js';

/**
 * Storage Service for Arda Weather Application
 * Handles data persistence using localStorage
 */
class StorageService {
    constructor() {
        this.weatherDataKey = CONFIG.LOCAL_STORAGE_KEYS.WEATHER_DATA;
        this.userSettingsKey = CONFIG.LOCAL_STORAGE_KEYS.USER_SETTINGS;
        this.adminTokenKey = CONFIG.LOCAL_STORAGE_KEYS.ADMIN_TOKEN;
        this.themeKey = CONFIG.LOCAL_STORAGE_KEYS.THEME;
        
        // Initialize storage
        this._initStorage();
    }
    
    /**
     * Initialize the storage with default values if not exists
     * @private
     */
    _initStorage() {
        // Initialize weather data
        if (!localStorage.getItem(this.weatherDataKey)) {
            localStorage.setItem(this.weatherDataKey, JSON.stringify({}));
        }
        
        // Initialize user settings
        if (!localStorage.getItem(this.userSettingsKey)) {
            const defaultSettings = {
                lastCity: null,
                unitPreference: CONFIG.UNITS
            };
            localStorage.setItem(this.userSettingsKey, JSON.stringify(defaultSettings));
        }
        
        // Initialize theme
        if (!localStorage.getItem(this.themeKey)) {
            localStorage.setItem(this.themeKey, 'light'); 
        }
    }
    
    /**
     * Get all weather data
     * @returns {Object} Weather data for all cities
     */
    getAllWeatherData() {
        const data = localStorage.getItem(this.weatherDataKey);
        return data ? JSON.parse(data) : {};
    }
    
    /**
     * Get weather data for a specific city
     * @param {string} city - City name
     * @returns {Array|null} - Weather data for the city or null if not found
     */
    getCityWeatherData(city) {
        const allData = this.getAllWeatherData();
        const normalizedCity = city.toLowerCase();
        return allData[normalizedCity] || null;
    }
    
    /**
     * Save weather data for a specific city
     * @param {string} city - City name
     * @param {Array} data - Weather data to save
     */
    saveCityWeatherData(city, data) {
        const allData = this.getAllWeatherData();
        const normalizedCity = city.toLowerCase();
        
        // Add timestamp to indicate when this data was stored
        const dataWithTimestamp = {
            data: data,
            lastUpdated: new Date().toISOString()
        };
        
        allData[normalizedCity] = dataWithTimestamp;
        localStorage.setItem(this.weatherDataKey, JSON.stringify(allData));
    }
    
    /**
     * Delete weather data for a specific city
     * @param {string} city - City name
     */
    deleteCityWeatherData(city) {
        const allData = this.getAllWeatherData();
        const normalizedCity = city.toLowerCase();
        
        if (allData[normalizedCity]) {
            delete allData[normalizedCity];
            localStorage.setItem(this.weatherDataKey, JSON.stringify(allData));
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if a city's data needs to be updated
     * @param {string} city - City name
     * @returns {boolean} - True if data needs update
     */
    cityDataNeedsUpdate(city) {
        const cityData = this.getCityWeatherData(city);
        
        if (!cityData) return true;
        
        const lastUpdated = new Date(cityData.lastUpdated);
        const currentTime = new Date();
        
        // Check if data is older than UPDATE_INTERVAL
        const diffInMinutes = (currentTime - lastUpdated) / (1000 * 60);
        return diffInMinutes > CONFIG.UPDATE_INTERVAL;
    }
    
    /**
     * Get weather data for a city within a date range
     * @param {string} city - City name
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Array} - Filtered weather data
     */
    getCityWeatherInDateRange(city, startDate, endDate) {
        const cityData = this.getCityWeatherData(city);
        
        if (!cityData || !cityData.data) return [];
        
        // Filter data by date range
        return cityData.data.filter(item => {
            const itemDate = new Date(item.time);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }
    
    /**
     * Save admin token
     * @param {string} token - Admin token
     */
    saveAdminToken(token) {
        localStorage.setItem(this.adminTokenKey, token);
    }
    
    /**
     * Get admin token
     * @returns {string|null} - Admin token
     */
    getAdminToken() {
        return localStorage.getItem(this.adminTokenKey);
    }
    
    /**
     * Clear admin token
     */
    clearAdminToken() {
        localStorage.removeItem(this.adminTokenKey);
    }
    
    /**
     * Check if user is admin
     * @returns {boolean} - True if user is admin
     */
    isAdmin() {
        return !!this.getAdminToken();
    }
    
    /**
     * Save user settings
     * @param {Object} settings - User settings
     */
    saveUserSettings(settings) {
        localStorage.setItem(this.userSettingsKey, JSON.stringify(settings));
    }
    
    /**
     * Get user settings
     * @returns {Object} - User settings
     */
    getUserSettings() {
        const settings = localStorage.getItem(this.userSettingsKey);
        return settings ? JSON.parse(settings) : null;
    }
    
    /**
     * Update last selected city
     * @param {string} city - City name
     */
    updateLastCity(city) {
        const settings = this.getUserSettings() || {};
        settings.lastCity = city;
        this.saveUserSettings(settings);
    }
    
    /**
     * Get last selected city
     * @returns {string|null} - Last selected city
     */
    getLastCity() {
        const settings = this.getUserSettings();
        return settings ? settings.lastCity : null;
    }
    
    /**
     * Save theme preference
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    saveTheme(theme) {
        localStorage.setItem(this.themeKey, theme);
    }
    
    /**
     * Get theme preference
     * @returns {string} - Theme name
     */
    getTheme() {
        return localStorage.getItem(this.themeKey) || 'light';
    }
}

// Create a global instance of the StorageService
export const storageService = new StorageService(); 