// ===== WEATHER APP - WORKING VERSION =====
// Using YOUR API key: 536e9c1e1a8598c66a62cbdd07f06cb7

class WeatherApp {
    constructor() {
        // ✅ YOUR API KEY IS HERE
        this.API_KEY = '536e9c1e1a8598c66a62cbdd07f06cb7';
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
        this.currentUnit = 'metric';
        this.currentCity = 'Mumbai';
        this.weatherData = null;
        this.forecastData = null;
        
        this.init();
    }

    init() {
        console.log('Weather App Initializing with API key:', this.API_KEY.substring(0, 8) + '...');
        this.setupEventListeners();
        this.loadPreferences();
        this.getWeatherByCity(this.currentCity);
    }

    setupEventListeners() {
        // Search form
        document.getElementById('searchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const city = document.getElementById('cityInput').value.trim();
            if (city) {
                this.getWeatherByCity(city);
            }
        });

        // Location button
        document.getElementById('locationBtn').addEventListener('click', () => {
            this.getWeatherByLocation();
        });

        // Unit toggle
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchUnit(e.target.dataset.unit);
            });
        });

        // Popular cities
        document.querySelectorAll('.city-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const city = e.currentTarget.dataset.city;
                this.getWeatherByCity(city);
                document.getElementById('cityInput').value = city;
            });
        });

        // Refresh
        document.getElementById('refreshData').addEventListener('click', () => {
            if (this.currentCity) {
                this.getWeatherByCity(this.currentCity);
            }
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // GitHub link
        document.getElementById('githubLink').addEventListener('click', () => {
            window.open('https://github.com/YOUR-USERNAME/weather-app', '_blank');
        });

        // Enter key
        document.getElementById('cityInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const city = document.getElementById('cityInput').value.trim();
                if (city) {
                    this.getWeatherByCity(city);
                }
            }
        });
    }

    loadPreferences() {
        // Load saved city
        const savedCity = localStorage.getItem('weatherCity');
        if (savedCity) {
            this.currentCity = savedCity;
            document.getElementById('cityInput').value = savedCity;
        }

        // Load saved unit
        const savedUnit = localStorage.getItem('weatherUnit');
        if (savedUnit) {
            this.switchUnit(savedUnit);
        }

        // Load theme
        const savedTheme = localStorage.getItem('weatherTheme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }
    }

    switchUnit(unit) {
        if (this.currentUnit === unit) return;
        
        this.currentUnit = unit;
        localStorage.setItem('weatherUnit', unit);
        
        // Update UI
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.unit === unit) {
                btn.classList.add('active');
            }
        });
        
        document.querySelector('.temp-unit').textContent = unit === 'metric' ? '°C' : '°F';
        
        // Refresh data with new unit
        if (this.currentCity) {
            this.getWeatherByCity(this.currentCity);
        }
    }

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('weatherTheme', isDark ? 'dark' : 'light');
        
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.innerHTML = isDark 
            ? '<i class="fas fa-sun"></i> Light Mode'
            : '<i class="fas fa-moon"></i> Dark Mode';
    }

    showLoading(show) {
        document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
    }

    showError(message = 'City not found. Please check the spelling and try again.') {
        const errorEl = document.getElementById('errorMessage');
        errorEl.querySelector('p').textContent = message;
        errorEl.style.display = 'flex';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }

    showWeatherSections() {
        document.getElementById('currentWeather').style.display = 'block';
        document.getElementById('forecastSection').style.display = 'block';
        this.hideError();
    }

    hideWeatherSections() {
        document.getElementById('currentWeather').style.display = 'none';
        document.getElementById('forecastSection').style.display = 'none';
    }

    async getWeatherByCity(city) {
        this.showLoading(true);
        this.hideError();
        
        try {
            console.log(`Fetching weather for: ${city}`);
            
            // Fetch current weather
            const weatherUrl = `${this.BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${this.currentUnit}&appid=${this.API_KEY}`;
            console.log('Current weather URL:', weatherUrl);
            
            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();
            
            console.log('Weather API Response:', weatherData);
            
            if (weatherData.cod !== 200) {
                // Check specific error
                if (weatherData.message && weatherData.message.includes('Invalid API key')) {
                    throw new Error('Invalid API key. Please check your OpenWeatherMap account.');
                } else if (weatherData.message && weatherData.message.includes('city not found')) {
                    throw new Error(`City "${city}" not found. Try a different city.`);
                } else {
                    throw new Error(weatherData.message || `Error: ${weatherData.cod}`);
                }
            }
            
            // Fetch 5-day forecast
            const forecastUrl = `${this.BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=${this.currentUnit}&appid=${this.API_KEY}`;
            console.log('Forecast URL:', forecastUrl);
            
            const forecastResponse = await fetch(forecastUrl);
            const forecastData = await forecastResponse.json();
            
            console.log('Forecast API Response:', forecastData);
            
            if (forecastData.cod !== '200') {
                throw new Error('Failed to fetch forecast data');
            }
            
            // Update app state
            this.weatherData = weatherData;
            this.forecastData = forecastData;
            this.currentCity = city;
            
            // Update UI
            this.displayCurrentWeather(weatherData);
            this.displayForecast(forecastData);
            this.showWeatherSections();
            
            // Save to localStorage
            localStorage.setItem('weatherCity', city);
            localStorage.setItem('lastWeatherData', JSON.stringify(weatherData));
            
            console.log('Weather data loaded successfully!');
            
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError(error.message);
            this.hideWeatherSections();
        } finally {
            this.showLoading(false);
        }
    }

    getWeatherByLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser. Try searching for your city instead.');
            return;
        }
        
        this.showLoading(true);
        
        navigator.geolocation.getCurrentPosition(
            // Success callback
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    console.log('Got location:', latitude, longitude);
                    
                    // Fetch weather by coordinates
                    const weatherUrl = `${this.BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=${this.currentUnit}&appid=${this.API_KEY}`;
                    console.log('Location weather URL:', weatherUrl);
                    
                    const response = await fetch(weatherUrl);
                    const data = await response.json();
                    
                    console.log('Location weather response:', data);
                    
                    if (data.cod !== 200) {
                        throw new Error(data.message || 'Failed to get weather for your location');
                    }
                    
                    // Get weather for the city name
                    this.getWeatherByCity(data.name);
                    
                } catch (error) {
                    console.error('Error in geolocation callback:', error);
                    this.showError('Failed to get weather for your location. Please try searching for your city.');
                } finally {
                    this.showLoading(false);
                }
            },
            // Error callback
            (error) => {
                this.showLoading(false);
                console.error('Geolocation error:', error);
                
                let errorMessage = 'Unable to get your location. ';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please allow location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'Please search for your city instead.';
                }
                
                this.showError(errorMessage);
                
                // Auto-focus on search input
                document.getElementById('cityInput').focus();
            },
            // Options
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    displayCurrentWeather(data) {
        // City and country
        document.getElementById('cityName').textContent = data.name;
        document.getElementById('countryCode').textContent = data.sys.country;
        
        // Temperature
        const temp = Math.round(data.main.temp);
        document.getElementById('currentTemp').textContent = temp;
        document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);
        document.getElementById('tempMin').textContent = Math.round(data.main.temp_min) + '°';
        document.getElementById('tempMax').textContent = Math.round(data.main.temp_max) + '°';
        
        // Weather description and icon
        const weather = data.weather[0];
        document.getElementById('weatherDesc').textContent = weather.description;
        this.updateWeatherIcon(weather.icon, document.getElementById('weatherIcon'));
        
        // Wind speed
        const windUnit = this.currentUnit === 'metric' ? 'km/h' : 'mph';
        const windSpeed = this.currentUnit === 'metric' 
            ? (data.wind.speed * 3.6).toFixed(1) 
            : (data.wind.speed * 2.237).toFixed(1);
        
        document.getElementById('windSpeed').textContent = `${windSpeed} ${windUnit}`;
        
        // Other details
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
        
        // Visibility
        const visibility = this.currentUnit === 'metric'
            ? (data.visibility / 1000).toFixed(1)
            : (data.visibility / 1609).toFixed(1);
        const visibilityUnit = this.currentUnit === 'metric' ? 'km' : 'miles';
        document.getElementById('visibility').textContent = `${visibility} ${visibilityUnit}`;
        
        // Sunrise and sunset times
        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        
        document.getElementById('sunrise').textContent = sunrise.toLocaleTimeString([], timeOptions);
        document.getElementById('sunset').textContent = sunset.toLocaleTimeString([], timeOptions);
        
        // Update timestamp
        const now = new Date();
        document.getElementById('updateTime').textContent = 
            now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    displayForecast(data) {
        const forecastContainer = document.getElementById('forecastContainer');
        forecastContainer.innerHTML = '';
        
        // Group forecasts by day
        const dailyData = {};
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toDateString();
            
            if (!dailyData[day]) {
                dailyData[day] = {
                    date: date,
                    temps: [],
                    weather: []
                };
            }
            
            // Only take forecasts around noon for daily overview
            if (date.getHours() >= 11 && date.getHours() <= 14) {
                dailyData[day].temps.push(item.main.temp);
                dailyData[day].weather.push(item.weather[0]);
            }
        });
        
        // Get next 5 days (skip today)
        const today = new Date();
        const forecastDays = [];
        
        for (let i = 1; i <= 5; i++) {
            const nextDay = new Date(today);
            nextDay.setDate(today.getDate() + i);
            forecastDays.push(nextDay.toDateString());
        }
        
        // Create forecast cards
        forecastDays.forEach(dayKey => {
            if (dailyData[dayKey]) {
                const dayData = dailyData[dayKey];
                
                if (dayData.temps.length > 0) {
                    const maxTemp = Math.round(Math.max(...dayData.temps));
                    const minTemp = Math.round(Math.min(...dayData.temps));
                    
                    // Get most common weather condition
                    const weatherCounts = {};
                    dayData.weather.forEach(w => {
                        weatherCounts[w.id] = (weatherCounts[w.id] || 0) + 1;
                    });
                    
                    const mostCommonId = Object.keys(weatherCounts).reduce((a, b) => 
                        weatherCounts[a] > weatherCounts[b] ? a : b
                    );
                    
                    const mainWeather = dayData.weather.find(w => w.id == mostCommonId);
                    
                    const card = document.createElement('div');
                    card.className = 'forecast-card';
                    
                    card.innerHTML = `
                        <div class="forecast-date">
                            ${dayData.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </div>
                        <div class="forecast-icon"></div>
                        <div class="forecast-temp">
                            <span class="temp-high">${maxTemp}°</span>
                            <span>/</span>
                            <span class="temp-low">${minTemp}°</span>
                        </div>
                        <div class="forecast-desc">${mainWeather.description}</div>
                    `;
                    
                    forecastContainer.appendChild(card);
                    this.updateWeatherIcon(mainWeather.icon, card.querySelector('.forecast-icon'));
                }
            }
        });
    }

    updateWeatherIcon(iconCode, element) {
        const iconMap = {
            '01d': 'fa-sun',           // clear sky day
            '01n': 'fa-moon',          // clear sky night
            '02d': 'fa-cloud-sun',     // few clouds day
            '02n': 'fa-cloud-moon',    // few clouds night
            '03d': 'fa-cloud',         // scattered clouds
            '03n': 'fa-cloud',
            '04d': 'fa-cloud',         // broken clouds
            '04n': 'fa-cloud',
            '09d': 'fa-cloud-rain',    // shower rain
            '09n': 'fa-cloud-rain',
            '10d': 'fa-cloud-sun-rain',// rain day
            '10n': 'fa-cloud-moon-rain',// rain night
            '11d': 'fa-bolt',          // thunderstorm
            '11n': 'fa-bolt',
            '13d': 'fa-snowflake',     // snow
            '13n': 'fa-snowflake',
            '50d': 'fa-smog',          // mist
            '50n': 'fa-smog'
        };
        
        const iconClass = iconMap[iconCode] || 'fa-cloud';
        element.innerHTML = `<i class="fas ${iconClass}"></i>`;
        
        // Add color based on weather
        const colorMap = {
            'fa-sun': '#ff9800',           // yellow
            'fa-moon': '#2196f3',          // blue
            'fa-cloud-sun': '#ffb74d',     // light orange
            'fa-cloud-moon': '#64b5f6',    // light blue
            'fa-cloud': '#78909c',         // gray
            'fa-cloud-rain': '#4fc3f7',    // light blue
            'fa-cloud-sun-rain': '#29b6f6',// blue
            'fa-cloud-moon-rain': '#1976d2',// dark blue
            'fa-bolt': '#ff5722',          // orange
            'fa-snowflake': '#80deea',     // light cyan
            'fa-smog': '#b0bec5'           // light gray
        };
        
        element.style.color = colorMap[iconClass] || '#78909c';
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    const weatherApp = new WeatherApp();
    window.weatherApp = weatherApp; // Make available for debugging
    
    console.log('Weather App Loaded!');
    console.log('Try these commands in console:');
    console.log('1. weatherApp.getWeatherByCity("Delhi")');
    console.log('2. weatherApp.getWeatherByCity("London")');
    console.log('3. weatherApp.getWeatherByLocation()');
});