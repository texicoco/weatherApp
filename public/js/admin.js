
import { CONFIG } from './config.js';
import { storageService } from './storage.js';
import { weatherAPI } from './api.js';
import { uiService } from './ui.js';

class AdminService {
    

    async exportSelectedCitiesToCSV() {
        if (!storageService.isAdmin()) {
            uiService.showToast('Only admins can export data', 'error');
            return;
        }
    
        const select = document.getElementById("city-select");
        const dateFromInput = document.getElementById("date-from");
        const dateToInput = document.getElementById("date-to");
    
        if (!select || !dateFromInput || !dateToInput || !dateFromInput.value || !dateToInput.value) {
            uiService.showToast('Please select valid date range and cities', 'warning');
            return;
        }
    
        const selectedCities = getSelectedCities();
        if (selectedCities.length === 0) {
            uiService.showToast('Please select at least one city', 'warning');
            return;
        }
    
        const dateFrom = new Date(dateFromInput.value);
        dateFrom.setHours(0, 0, 0, 0);
    
        const dateTo = new Date(dateToInput.value);
        dateTo.setDate(dateTo.getDate() + 1);
        dateTo.setHours(0, 0, 0, 0);
    
        const allDataByDatetime = new Map();
    
        for (const city of selectedCities) {
            const cityData = storageService.getCityWeatherInDateRange(city, dateFrom, dateTo);
            if (!cityData || cityData.length === 0) {
                uiService.showToast(`No data found for ${city}`, 'info');
                continue;
            }
    
            cityData.forEach(entry => {
                const dt = new Date(entry.time);
                const date = dt.toLocaleDateString();
                const time = dt.toLocaleTimeString();
                const datetimeKey = `${date} ${time}`;
    
                if (!allDataByDatetime.has(datetimeKey)) {
                    allDataByDatetime.set(datetimeKey, { Date: date, Time: time });
                }
    
                const record = allDataByDatetime.get(datetimeKey);
                record[`${city}_Temp`] = `${entry.temp}°${CONFIG.UNITS === 'metric' ? 'C' : 'F'}`;
                record[`${city}_Condition`] = entry.description;
                record[`${city}_Humidity`] = `${entry.humidity}%`;
                record[`${city}_Wind`] = `${entry.wind_speed} ${CONFIG.UNITS === 'metric' ? 'km/h' : 'mph'}`;
            });
        }
    
        if (allDataByDatetime.size === 0) {
            uiService.showToast("No data to export", 'warning');
            return;
        }
    
        const sortedRows = Array.from(allDataByDatetime.values()).sort((a, b) => {
            return new Date(`${a.Date} ${a.Time}`) - new Date(`${b.Date} ${b.Time}`);
        });
    
        const headers = ['Date', 'Time'];
        selectedCities.forEach(city => {
            headers.push(`${city}_Temp`, `${city}_Condition`, `${city}_Humidity`, `${city}_Wind`);
        });
    
        const csvRows = [headers];
        sortedRows.forEach(row => {
            const rowData = headers.map(h => row[h] || '');
            csvRows.push(rowData);
        });
    
        // NOTE: Changed delimiter from ',' to ';' for Excel compatibility
        const csvContent = csvRows.map(row => row.join(';')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute('href', url);
        link.setAttribute('download', `weather_export_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    
        uiService.showToast("Data exported successfully", 'success');
    }
    



    constructor() {
        this._initEventListeners();
    }

    _initEventListeners() {
        document.addEventListener('weather:export', this._handleExport.bind(this));
        document.addEventListener('weather:delete', this._handleDelete.bind(this));
        document.addEventListener('weather:update', this._handleUpdate.bind(this));
    }

    _handleExport(event) {
        const { city, dateFrom, dateTo } = event.detail;

        if (!storageService.isAdmin()) {
            uiService.showToast('Only admins can export data', 'error');
            return;
        }

        const weatherData = storageService.getCityWeatherInDateRange(city, dateFrom, dateTo);

        if (!weatherData || weatherData.length === 0) {
            uiService.showToast('No data available to export', 'error');
            return;
        }

        this._exportToCSV(weatherData, city);
    }

    _handleDelete(event) {
        const { city } = event.detail;

        if (!storageService.isAdmin()) {
            uiService.showToast('Only admins can delete data', 'error');
            return;
        }

        const success = storageService.deleteCityWeatherData(city);

        if (success) {
            uiService.showToast(`Weather data for ${city} deleted successfully`, 'success');
            document.dispatchEvent(new CustomEvent('weather:searchComplete', {
                detail: {
                    success: false,
                    message: `Weather data for ${city} has been deleted.`
                }
            }));
        } else {
            uiService.showToast(`No data found for ${city}`, 'error');
        }
    }

    _handleUpdate(event) {
        const { city } = event.detail;

        if (!storageService.isAdmin()) {
            uiService.showToast('Only admins can update data', 'error');
            return;
        }

        uiService.showLoading(true);

        this._fetchFreshData(city)
            .then(data => {
                uiService.showLoading(false);
                uiService.showToast(`Weather data for ${city} updated successfully`, 'success');

                document.dispatchEvent(new CustomEvent('weather:search', {
                    detail: {
                        city: city,
                        dateFrom: new Date(uiService.dateFrom.value),
                        dateTo: new Date(uiService.dateTo.value),
                        forceRefresh: true
                    }
                }));
            })
            .catch(error => {
                uiService.showLoading(false);
                uiService.showToast(`Failed to update data: ${error.message}`, 'error');
            });
    }

    async _fetchFreshData(city) {
        try {
            const currentWeather = await weatherAPI.getCurrentWeather(city);
            const forecast = await weatherAPI.getForecast(city);

            const today = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);

            const historicalData = await weatherAPI.getHistoricalWeather(city, sevenDaysAgo, today);

            storageService.saveCityWeatherData(city, historicalData);

            return { currentWeather, forecast, historicalData };
        } catch (error) {
            console.error('Error fetching fresh data:', error);
            throw error;
        }
    }

    _exportToCSV(data, city) {
        const csvRows = [];

        const headers = ['City', 'Date', 'Time', 'Temperature', 'Condition', 'Humidity', 'Wind Speed'];
        csvRows.push(headers.join(','));

        data.forEach(item => {
            const time = new Date(item.time);
            const row = [
                city,
                time.toLocaleDateString(),
                time.toLocaleTimeString(),
                `${item.temp}°${CONFIG.UNITS === 'metric' ? 'C' : 'F'}`,
                item.description,
                `${item.humidity}%`,
                `${item.wind_speed} ${CONFIG.UNITS === 'metric' ? 'km/h' : 'mph'}`
            ];

            const escapedRow = row.map(cell =>
                cell && cell.toString().includes(',') ? `"${cell}"` : cell
            );

            csvRows.push(escapedRow.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute('href', url);
        link.setAttribute('download', `${city}_weather_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    isAdmin() {
        return storageService.isAdmin();
    }
}
document.addEventListener("admin:login", () => {
    document.getElementById("admin-weather-actions")?.classList.remove("hidden");
  });
  
export const adminService = new AdminService();
window.exportSelectedCitiesToCSV = () => adminService.exportSelectedCitiesToCSV();
document.addEventListener("DOMContentLoaded", () => {
    if (storageService.isAdmin()) {
      document.getElementById("admin-city-checkboxes")?.classList.remove("hidden");
    }
  });
  function getSelectedCities() {
    
    if (storageService.isAdmin()) {
      const checked = document.querySelectorAll(".city-checkbox:checked");
      const cities = Array.from(checked).map(cb => cb.value);
      if (cities.length > 0) {
        return cities;
      }
    }
  
   
    const select = document.getElementById("city-select");
    return select?.value ? [select.value] : [];
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    if (storageService.isAdmin()) {
      document.getElementById("admin-city-dropdown")?.classList.remove("hidden");
  
      const toggleBtn = document.getElementById("dropdownToggle");
      const menu = document.getElementById("dropdownMenu");
  
      toggleBtn?.addEventListener("click", () => {
        menu?.classList.toggle("hidden");
      });
  
      
      document.addEventListener("click", (e) => {
        if (!toggleBtn.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.add("hidden");
        }
      });
    }
  });
  document.getElementById("update-weather-btn")?.addEventListener("click", async () => {
    const city = uiService.citySelect.value;
    if (!city) return uiService.showToast("Please select a city", "warning");
  
    try {
      const res = await fetch(`/api/weather/update/${city}`, { method: "POST" });
      const data = await res.json();
      uiService.showToast(data.message || "Weather updated", "success");
    } catch (err) {
      uiService.showToast("Update failed", "error");
    }
  });
  
  document.getElementById("delete-weather-btn")?.addEventListener("click", async () => {
    const city = uiService.citySelect.value;
    if (!city) return uiService.showToast("Please select a city", "warning");
  
    try {
      const res = await fetch(`/api/weather/${city}`, { method: "DELETE" });
      const data = await res.json();
      uiService.showToast(data.message || "Weather deleted", "success");
    } catch (err) {
      uiService.showToast("Delete failed", "error");
    }
  });
  
  