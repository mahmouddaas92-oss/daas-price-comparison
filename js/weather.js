// Weather Dashboard JavaScript
const API_URL = 'http://localhost:5000/api';
let currentCity = 'الرياض';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('citySearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
  });
  
  loadWeather('الرياض');
});

// Search weather
async function searchWeather() {
  const city = document.getElementById('citySearch').value;
  if (city) {
    loadWeather(city);
  }
}

// Load weather data
async function loadWeather(city) {
  currentCity = city;
  showLoading();
  
  try {
    const [current, forecast] = await Promise.all([
      fetch(`${API_URL}/weather/current?city=${encodeURIComponent(city)}`).then(r => r.json()),
      fetch(`${API_URL}/weather/forecast?city=${encodeURIComponent(city)}`).then(r => r.json())
    ]);
    
    if (current.success) {
      displayCurrentWeather(current.data);
    }
    
    if (forecast.success) {
      displayForecast(forecast.data);
    }
  } catch (error) {
    console.error('خطأ:', error);
    displayMockWeather();
  }
}

// Display current weather
function displayCurrentWeather(data) {
  const container = document.getElementById('currentWeatherContainer');
  
  const weatherIcon = getWeatherIcon(data.description);
  const feelsText = Math.abs(data.temperature - data.feelsLike) > 2 ? ` (تشعر ب ${data.feelsLike}°)` : '';
  
  container.innerHTML = `
    <div class="weather-card col-span-1">
      <h3 class="text-2xl font-bold mb-2">${data.city}</h3>
      <p class="text-gray-600 mb-4">${data.country}</p>
      <div class="weather-icon">${weatherIcon}</div>
      <div class="temperature-display">${data.temperature}°</div>
      <p class="weather-description">${data.description}${feelsText}</p>
    </div>
    
    <div class="weather-card col-span-1">
      <h4 class="text-xl font-bold mb-6 text-center">التفاصيل</h4>
      <div class="space-y-3">
        <div class="weather-detail">
          <span class="detail-label"><i class="fas fa-droplets ml-2"></i>الرطوبة</span>
          <span class="detail-value">${data.humidity}%</span>
        </div>
        <div class="weather-detail">
          <span class="detail-label"><i class="fas fa-wind ml-2"></i>سرعة الريح</span>
          <span class="detail-value">${data.windSpeed} م/ث</span>
        </div>
        <div class="weather-detail">
          <span class="detail-label"><i class="fas fa-cloud ml-2"></i>الغيوم</span>
          <span class="detail-value">${data.cloudiness}%</span>
        </div>
        <div class="weather-detail">
          <span class="detail-label"><i class="fas fa-gauge ml-2"></i>الضغط</span>
          <span class="detail-value">${data.pressure} hPa</span>
        </div>
      </div>
    </div>
    
    <div class="weather-card col-span-1">
      <h4 class="text-xl font-bold mb-6 text-center">الشروق والغروب</h4>
      <div class="space-y-8">
        <div class="text-center">
          <i class="fas fa-sun text-4xl text-yellow-400 mb-2"></i>
          <p class="text-gray-600 font-semibold">الشروق</p>
          <p class="text-2xl font-bold text-gray-800">${data.sunrise}</p>
        </div>
        <div class="text-center">
          <i class="fas fa-moon text-4xl text-indigo-400 mb-2"></i>
          <p class="text-gray-600 font-semibold">الغروب</p>
          <p class="text-2xl font-bold text-gray-800">${data.sunset}</p>
        </div>
      </div>
    </div>
  `;
}

// Display forecast
function displayForecast(forecast) {
  const container = document.getElementById('forecastGrid');
  
  container.innerHTML = forecast.map(day => `
    <div class="forecast-card">
      <p class="forecast-date">${new Date(day.date).toLocaleDateString('ar-SA')}</p>
      <div class="text-4xl text-center">${getWeatherIcon(day.description)}</div>
      <div class="forecast-temp">${day.tempMax}°</div>
      <p class="forecast-temp-range">${day.tempMin}° في الليل</p>
      <p class="forecast-description">${day.description}</p>
    </div>
  `).join('');
}

// Compare multiple cities
async function compareMultipleCities() {
  const input = document.getElementById('multipleCities').value;
  if (!input) return;
  
  const cities = input.split(',').map(c => c.trim()).filter(c => c);
  
  try {
    const response = await fetch(`${API_URL}/weather/multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cities })
    });
    
    const result = await response.json();
    
    if (result.success) {
      displayMultipleWeather(result.data);
    }
  } catch (error) {
    console.error('خطأ:', error);
  }
}

// Display multiple cities weather
function displayMultipleWeather(weatherData) {
  const container = document.getElementById('multipleWeatherGrid');
  
  container.innerHTML = weatherData.map(weather => `
    <div class="weather-card cursor-pointer hover:scale-105" onclick="loadWeather('${weather.city}')">
      <h4 class="text-xl font-bold text-center mb-4">${weather.city}</h4>
      <div class="text-6xl text-center mb-4">${getWeatherIcon(weather.description)}</div>
      <p class="text-4xl font-bold text-center text-blue-600">${weather.temperature}°</p>
      <p class="text-center text-gray-600 mt-2 capitalize">${weather.description}</p>
      ${weather.humidity ? `<p class="text-center text-sm text-gray-500 mt-2">رطوبة: ${weather.humidity}%</p>` : ''}
      ${weather.windSpeed ? `<p class="text-center text-sm text-gray-500">ريح: ${weather.windSpeed} م/ث</p>` : ''}
    </div>
  `).join('');
}

// Get weather icon
function getWeatherIcon(description) {
  const desc = description.toLowerCase();
  
  if (desc.includes('صافي') || desc.includes('clear')) return '☀️';
  if (desc.includes('غيوم') || desc.includes('cloud')) return '☁️';
  if (desc.includes('ممطر') || desc.includes('rain')) return '🌧️';
  if (desc.includes('عاصفة') || desc.includes('storm')) return '⛈️';
  if (desc.includes('ثلج') || desc.includes('snow')) return '❄️';
  if (desc.includes('ضباب') || desc.includes('fog')) return '🌫️';
  if (desc.includes('رياح') || desc.includes('wind')) return '💨';
  
  return '🌤️';
}

// Show loading state
function showLoading() {
  document.getElementById('currentWeatherContainer').innerHTML = '<div class="weather-skeleton col-span-3"></div>';
  document.getElementById('forecastGrid').innerHTML = Array(5).fill(0).map(() => '<div class="weather-skeleton"></div>').join('');
}

// Mock weather data for demo
function displayMockWeather() {
  const mockCurrent = {
    city: 'الرياض',
    country: 'SA',
    temperature: 32,
    feelsLike: 35,
    humidity: 45,
    pressure: 1013,
    windSpeed: 12,
    cloudiness: 20,
    description: 'سماء صافية',
    sunrise: '06:15',
    sunset: '18:45'
  };
  
  displayCurrentWeather(mockCurrent);
  
  const mockForecast = [
    { date: '2024-08-31', tempMax: 35, tempMin: 28, description: 'سماء صافية' },
    { date: '2024-09-01', tempMax: 34, tempMin: 27, description: 'غيوم قليلة' },
    { date: '2024-09-02', tempMax: 33, tempMin: 26, description: 'غيوم متفرقة' },
    { date: '2024-09-03', tempMax: 32, tempMin: 25, description: 'ممطر' },
    { date: '2024-09-04', tempMax: 31, tempMin: 24, description: 'عواصف رعدية' }
  ];
  
  displayForecast(mockForecast);
}