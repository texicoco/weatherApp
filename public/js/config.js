/**
 * Arda Weather Application Configuration
 */
const CONFIG = {
    // No API key required for Open-Meteo
    ICONS_URL: 'https://openweathermap.org/img/wn', // Used for OpenWeatherMap compatible icons
    
    // Application Settings
    UPDATE_INTERVAL: 15, // Minutes
    LOCAL_STORAGE_KEYS: {
        WEATHER_DATA: 'ardaWeather_data',
        USER_SETTINGS: 'ardaWeather_settings',
        ADMIN_TOKEN: 'ardaWeather_admin_token',
        THEME: 'ardaWeather_theme'
    },
    
    // Admin Credentials
    ADMIN: {
        USERNAME: 'admin',
        PASSWORD: 'admin'
    },
    
    // Default Cities
    DEFAULT_CITIES: [
        'London', 'New York', 'Tokyo', 'Paris', 'Istanbul', 
        'Berlin', 'Rome', 'Sydney', 'Cairo', 'Rio de Janeiro'
    ],
    
    // Units
    UNITS: 'metric', // metric (Celsius) or imperial (Fahrenheit)
    
    // UI Settings
    MAX_FORECAST_DAYS: 5
};

export default CONFIG;
export { CONFIG }; 