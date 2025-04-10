// Import styles
import './main.css';

// Import modules
import CONFIG from './public/js/config.js';
import { weatherAPI } from './public/js/api.js';
import { storageService } from './public/js/storage.js';
import { uiService } from './public/js/ui.js';
import { adminService } from './public/js/admin.js';
import { initApp } from './public/js/app.js';

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
document.addEventListener("admin:login", () => {
    const wrapper = document.getElementById("admin-city-dropdown");
    if (wrapper) {
      wrapper.classList.remove("hidden");
    }
  });
  
// This file serves as the main entry point for Vite 