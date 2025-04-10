const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const app = express();
const port = 3001;

app.use(express.json());

// SQLite database connection
const db = new sqlite3.Database('./weather.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS weather (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT,
    temp REAL,
    humidity INTEGER,
    wind_speed REAL,
    description TEXT,
    time TEXT
  )
`);

// Fetch weather data from API and save to database
app.post('/api/weather/update/:city', async (req, res) => {
  const city = req.params.city;

  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=0041dcdcd6fc882099f03b22fe9d0f6d&units=metric`);
    const data = response.data;

    const time = new Date().toISOString();

    db.run(
      `INSERT INTO weather (city, temp, humidity, wind_speed, description, time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        city,
        data.main.temp,
        data.main.humidity,
        data.wind.speed,
        data.weather[0].description,
        time
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json({ message: 'Weather data updated successfully', id: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch data from API', error: error.message });
  }
});

// Get weather data from database
app.get('/api/weather/:city', (req, res) => {
  const city = req.params.city;
  db.all(`SELECT * FROM weather WHERE city = ? ORDER BY time DESC`, [city], (err, rows) => {
    if (err) {
      res.status(500).json({ message: 'Error reading from database', error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Delete weather data from database
app.delete('/api/weather/:city', (req, res) => {
  const city = req.params.city;
  db.run(`DELETE FROM weather WHERE city = ?`, [city], function (err) {
    if (err) {
      res.status(500).json({ message: 'Failed to delete data', error: err.message });
    } else {
      res.json({ message: `Deleted ${this.changes} record(s)`, deleted: this.changes });
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
