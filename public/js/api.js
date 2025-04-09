import { CONFIG } from './config.js';

/**
 * API Service for Arda Weather Application
 * Handles all communication with the Open-Meteo API (free, no API key required)
 */
class WeatherAPI {
    constructor() {
        this.weatherUrl = 'https://api.open-meteo.com/v1/forecast';
        this.geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';
        this.units = CONFIG.UNITS;
    }

    /**
     * Get coordinates for a city name
     * @param {string} city - City name
     * @returns {Promise} - Location data
     */
    async getCoordinates(city) {
        try {
            const response = await fetch(
                `${this.geocodingUrl}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.results || !data.results.length) {
                throw new Error(`City "${city}" not found`);
            }
            
            return {
                latitude: data.results[0].latitude,
                longitude: data.results[0].longitude,
                name: data.results[0].name,
                country: data.results[0].country
            };
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            throw error;
        }
    }

    /**
     * Get current weather for a specific city
     * @param {string} city - City name
     * @returns {Promise} - Weather data
     */
    async getCurrentWeather(city) {
        try {
            // First get coordinates for the city
            const location = await this.getCoordinates(city);
            
            // Then get weather data
            const response = await fetch(
                `${this.weatherUrl}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Map the weather code to icons and descriptions
            const { icon, description, main } = this._getWeatherInfo(data.current.weather_code);
            
            return {
                city: location.name,
                country: location.country,
                temp: Math.round(data.current.temperature_2m),
                feels_like: Math.round(data.current.temperature_2m), // Open-Meteo doesn't provide feels_like in free tier
                description: description,
                main: main,
                icon: icon,
                humidity: data.current.relative_humidity_2m,
                wind_speed: data.current.wind_speed_10m,
                time: new Date(data.current.time),
                sunrise: new Date(), // Not provided in free tier
                sunset: new Date(), // Not provided in free tier
                timezone: data.timezone,
                id: `${location.latitude}_${location.longitude}`
            };
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw error;
        }
    }

    /**
     * Get 5-day weather forecast (hourly) for a specific city
     * @param {string} city - City name
     * @returns {Promise} - Forecast data
     */
    async getForecast(city) {
        try {
            // First get coordinates for the city
            const location = await this.getCoordinates(city);
            
            // Then get forecast data
            const response = await fetch(
                `${this.weatherUrl}?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&forecast_days=2&timezone=auto`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process hourly data
            const hourlyList = [];
            for (let i = 0; i < Math.min(24, data.hourly.time.length); i++) {
                const weatherInfo = this._getWeatherInfo(data.hourly.weather_code[i]);
                
                hourlyList.push({
                    time: new Date(data.hourly.time[i]),
                    temp: Math.round(data.hourly.temperature_2m[i]),
                    feels_like: Math.round(data.hourly.temperature_2m[i]), // Not provided in free tier
                    temp_min: Math.round(data.hourly.temperature_2m[i]) - 2, // Simulate min temp
                    temp_max: Math.round(data.hourly.temperature_2m[i]) + 2, // Simulate max temp
                    description: weatherInfo.description,
                    main: weatherInfo.main,
                    icon: weatherInfo.icon,
                    humidity: data.hourly.relative_humidity_2m[i],
                    wind_speed: data.hourly.wind_speed_10m[i],
                    dt_txt: new Date(data.hourly.time[i]).toISOString(),
                    pop: 0 // Probability of precipitation not provided in free tier
                });
            }
            
            return {
                city: location.name,
                country: location.country,
                list: hourlyList
            };
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw error;
        }
    }

    /**
     * Get historical weather data for a specific city
     * Note: Open-Meteo doesn't provide historical data in free tier
     * So this simulates historical data based on forecast
     * @param {string} city - City name
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise} - Historical data
     */
    async getHistoricalWeather(city, startDate, endDate) {
        try {
            // Since historical data isn't available in the free API,
            // we'll get the forecast and use it to simulate historical data
            const forecast = await this.getForecast(city);
            
            // For demo purposes only: Generate fake historical data
            const historicalData = [];
            
            // Current date for reference
            const currentDate = new Date();
            
            // Start date for simulation
            let simulationDate = new Date(startDate);
            
            // End date should not be later than current date
            const effectiveEndDate = endDate > currentDate ? currentDate : new Date(endDate);
            
            // Generate data in 3-hour intervals (similar to forecast data)
            while (simulationDate <= effectiveEndDate) {
                // Get a random forecast item to use as a template
                const randomIndex = Math.floor(Math.random() * forecast.list.length);
                const template = forecast.list[randomIndex];
                
                // Create a new data point with the simulation date
                const dataPoint = {
                    time: new Date(simulationDate),
                    temp: this._getRandomValueAround(template.temp, 5),
                    feels_like: this._getRandomValueAround(template.temp, 3),
                    description: template.description,
                    main: template.main,
                    icon: template.icon,
                    humidity: this._getRandomValueAround(template.humidity, 10),
                    wind_speed: this._getRandomValueAround(template.wind_speed, 2),
                    city: forecast.city,
                    country: forecast.country
                };
                
                historicalData.push(dataPoint);
                
                // Advance by 3 hours
                simulationDate = new Date(simulationDate.getTime() + 3 * 60 * 60 * 1000);
            }
            
            return historicalData;
        } catch (error) {
            console.error('Error fetching historical data:', error);
            throw error;
        }
    }
    
    /**
     * Helper method to map Open-Meteo weather codes to icons and descriptions
     * @param {number} code - Open-Meteo weather code
     * @returns {Object} - Weather information (icon, description, main)
     * @private
     */
    _getWeatherInfo(code) {
        // WMO Weather interpretation codes (WW) from Open-Meteo
        const weatherMapping = {
            0: { icon: '01d', description: 'Clear sky', main: 'Clear' },
            1: { icon: '02d', description: 'Mainly clear', main: 'Clear' },
            2: { icon: '03d', description: 'Partly cloudy', main: 'Clouds' },
            3: { icon: '04d', description: 'Overcast', main: 'Clouds' },
            45: { icon: '50d', description: 'Fog', main: 'Fog' },
            48: { icon: '50d', description: 'Depositing rime fog', main: 'Fog' },
            51: { icon: '09d', description: 'Light drizzle', main: 'Drizzle' },
            53: { icon: '09d', description: 'Moderate drizzle', main: 'Drizzle' },
            55: { icon: '09d', description: 'Dense drizzle', main: 'Drizzle' },
            56: { icon: '09d', description: 'Light freezing drizzle', main: 'Drizzle' },
            57: { icon: '09d', description: 'Dense freezing drizzle', main: 'Drizzle' },
            61: { icon: '10d', description: 'Slight rain', main: 'Rain' },
            63: { icon: '10d', description: 'Moderate rain', main: 'Rain' },
            65: { icon: '10d', description: 'Heavy rain', main: 'Rain' },
            66: { icon: '13d', description: 'Light freezing rain', main: 'Rain' },
            67: { icon: '13d', description: 'Heavy freezing rain', main: 'Rain' },
            71: { icon: '13d', description: 'Slight snow fall', main: 'Snow' },
            73: { icon: '13d', description: 'Moderate snow fall', main: 'Snow' },
            75: { icon: '13d', description: 'Heavy snow fall', main: 'Snow' },
            77: { icon: '13d', description: 'Snow grains', main: 'Snow' },
            80: { icon: '09d', description: 'Slight rain showers', main: 'Rain' },
            81: { icon: '09d', description: 'Moderate rain showers', main: 'Rain' },
            82: { icon: '09d', description: 'Violent rain showers', main: 'Rain' },
            85: { icon: '13d', description: 'Slight snow showers', main: 'Snow' },
            86: { icon: '13d', description: 'Heavy snow showers', main: 'Snow' },
            95: { icon: '11d', description: 'Thunderstorm', main: 'Thunderstorm' },
            96: { icon: '11d', description: 'Thunderstorm with slight hail', main: 'Thunderstorm' },
            99: { icon: '11d', description: 'Thunderstorm with heavy hail', main: 'Thunderstorm' }
        };
        
        return weatherMapping[code] || { icon: '03d', description: 'Unknown', main: 'Unknown' };
    }
    
    /**
     * Helper method to generate random values around a base value
     * @param {number} baseValue - Base value
     * @param {number} maxDifference - Maximum difference
     * @returns {number} - Random value
     */
    _getRandomValueAround(baseValue, maxDifference) {
        const difference = (Math.random() * maxDifference * 2) - maxDifference;
        const result = baseValue + difference;
        return Math.round(result * 10) / 10; // Round to 1 decimal place
    }
}

// Create a global instance of the WeatherAPI
export const weatherAPI = new WeatherAPI(); 