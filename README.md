# Arda Weather Forecast Application

A beautiful vanilla JavaScript weather forecast application with Tailwind CSS v3. This application allows users to view real-time weather data, historical information, and forecast for cities around the world.

![Arda Weather App](https://via.placeholder.com/800x400?text=Arda+Weather+App)

## Features

- ✅ Real-time weather data from Open-Meteo API (no API key required)
- ✅ Weather data updated every 15 minutes
- ✅ Weather records stored for historical data viewing
- ✅ Date range selection for historical weather data
- ✅ User-friendly interface with responsive design
- ✅ Dark mode support
- ✅ Export weather data to CSV (admin only)
- ✅ Admin controls for data management

## Tech Stack

- Vanilla JavaScript for logic
- Tailwind CSS v3 for styling
- Open-Meteo API for weather data (free, no API key required)
- Vite for development and build tooling
- FontAwesome for icons
- Google Fonts for typography

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/arda-weather.git
   cd arda-weather
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3000`

### Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

## Project Structure

```
arda-weather/
├── public/
│   ├── css/
│   │   └── style.css      # Tailwind source CSS
│   ├── js/
│   │   ├── api.js         # API service for weather data
│   │   ├── storage.js     # Local storage service
│   │   ├── ui.js          # UI manipulation service
│   │   ├── admin.js       # Admin functionality
│   │   ├── config.js      # Application configuration
│   │   └── app.js         # Main application code
│   └── assets/            # Images and other assets
├── main.css               # CSS entry point for Vite
├── main.js                # JavaScript entry point for Vite
├── index.html             # Main HTML file
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
├── vite.config.js         # Vite configuration
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

## Admin Access

The application includes an admin interface with the following features:

- Manual data refresh
- Export data to CSV
- Delete weather data for specific cities

To access the admin interface:
1. Click on "Admin Login" in the top right
2. Use the credentials:
   - Username: `admin`
   - Password: `admin`

## API Usage

This application uses the [Open-Meteo API](https://open-meteo.com/), a free weather API that does not require registration or an API key.

The application uses the following Open-Meteo endpoints:
- Weather Forecast API for current and forecasted weather data
- Geocoding API for converting city names to coordinates

## Project Design

The application is built using a modular architecture with several services:

- **WeatherAPI**: Handles all API calls to Open-Meteo
- **StorageService**: Manages local storage for weather data
- **UIService**: Handles DOM manipulation and UI updates
- **AdminService**: Provides admin-specific functionality
- **WeatherApp**: Main application controller

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Open-Meteo](https://open-meteo.com/) for the free weather data API
- [Tailwind CSS](https://tailwindcss.com/) for the CSS framework
- [Vite](https://vitejs.dev/) for the build tooling
- [Font Awesome](https://fontawesome.com/) for the icons
- [Google Fonts](https://fonts.google.com/) for the fonts # weatherApp
