// DAAS Backend Server - Node.js/Express
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ============================================
// الساعة العالمية - World Clock Routes
// ============================================

const timezones = [
  { city: 'الرياض', country: 'المملكة العربية السعودية', timezone: 'Asia/Riyadh', flag: '🇸🇦' },
  { city: 'دبي', country: 'الإمارات العربية المتحدة', timezone: 'Asia/Dubai', flag: '🇦🇪' },
  { city: 'القاهرة', country: 'مصر', timezone: 'Africa/Cairo', flag: '🇪🇬' },
  { city: 'بيروت', country: 'لبنان', timezone: 'Asia/Beirut', flag: '🇱🇧' },
  { city: 'إسطنبول', country: 'تركيا', timezone: 'Europe/Istanbul', flag: '🇹🇷' },
  { city: 'لندن', country: 'المملكة المتحدة', timezone: 'Europe/London', flag: '🇬🇧' },
  { city: 'باريس', country: 'فرنسا', timezone: 'Europe/Paris', flag: '🇫🇷' },
  { city: 'برلين', country: 'ألمانيا', timezone: 'Europe/Berlin', flag: '🇩🇪' },
  { city: 'موسكو', country: 'روسيا', timezone: 'Europe/Moscow', flag: '🇷🇺' },
  { city: 'نيويورك', country: 'الولايات المتحدة', timezone: 'America/New_York', flag: '🇺🇸' },
  { city: 'لوس أنجلوس', country: 'الولايات المتحدة', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
  { city: 'تورنتو', country: 'كندا', timezone: 'America/Toronto', flag: '🇨🇦' },
  { city: 'ساو باولو', country: 'البرازيل', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
  { city: 'بيونس آيرس', country: 'الأرجنتين', timezone: 'America/Argentina/Buenos_Aires', flag: '🇦🇷' },
  { city: 'طوكيو', country: 'اليابان', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { city: 'سيول', country: 'كوريا الجنوبية', timezone: 'Asia/Seoul', flag: '🇰🇷' },
  { city: 'شنغهاي', country: 'الصين', timezone: 'Asia/Shanghai', flag: '🇨🇳' },
  { city: 'بانكوك', country: 'تايلاند', timezone: 'Asia/Bangkok', flag: '🇹🇭' },
  { city: 'سنغافورة', country: 'سنغافورة', timezone: 'Asia/Singapore', flag: '🇸🇬' },
  { city: 'هونج كونج', country: 'هونج كونج', timezone: 'Asia/Hong_Kong', flag: '🇭🇰' },
  { city: 'سيدني', country: 'أستراليا', timezone: 'Australia/Sydney', flag: '🇦🇺' },
  { city: 'أوكلاند', country: 'نيوزيلندا', timezone: 'Pacific/Auckland', flag: '🇳🇿' },
  { city: 'دبي', country: 'الإمارات', timezone: 'Asia/Dubai', flag: '🇦🇪' },
  { city: 'جاكرتا', country: 'إندونيسيا', timezone: 'Asia/Jakarta', flag: '🇮🇩' }
];

// Get all timezones with current time
app.get('/api/clock/timezones', (req, res) => {
  try {
    const now = new Date();
    
    const data = timezones.map(tz => {
      const formatter = new Intl.DateTimeFormat('ar-SA', {
        timeZone: tz.timezone,
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const parts = formatter.formatToParts(now);
      const timeObj = {};
      
      parts.forEach(part => {
        timeObj[part.type] = part.value;
      });
      
      return {
        city: tz.city,
        country: tz.country,
        timezone: tz.timezone,
        flag: tz.flag,
        time: `${timeObj.hour}:${timeObj.minute}:${timeObj.second}`,
        period: timeObj.dayPeriod || 'AM',
        date: `${timeObj.day}/${timeObj.month}/${timeObj.year}`,
        timestamp: now.toISOString()
      };
    });
    
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search timezones
app.get('/api/clock/search', (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    const now = new Date();
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'يجب توفير كلمة البحث'
      });
    }
    
    const filtered = timezones.filter(tz => 
      tz.city.includes(query) || 
      tz.country.includes(query) || 
      tz.timezone.includes(query)
    );
    
    const data = filtered.map(tz => {
      const formatter = new Intl.DateTimeFormat('ar-SA', {
        timeZone: tz.timezone,
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      return {
        city: tz.city,
        country: tz.country,
        timezone: tz.timezone,
        flag: tz.flag,
        time: formatter.format(now),
        timestamp: now.toISOString()
      };
    });
    
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// لوحة معلومات الطقس - Weather Dashboard Routes
// ============================================

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'demo';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// Get current weather for a city
app.get('/api/weather/current', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'اسم المدينة مطلوب'
      });
    }
    
    if (WEATHER_API_KEY === 'demo') {
      // Mock data for demo
      return res.json({
        success: true,
        data: {
          city: city,
          country: 'SA',
          temperature: 32,
          feelsLike: 35,
          humidity: 45,
          pressure: 1013,
          windSpeed: 12,
          cloudiness: 20,
          description: 'سماء صافية',
          icon: '01d',
          sunrise: '06:15',
          sunset: '18:45'
        },
        note: 'بيانات تجريبية - استخدم API key حقيقي'
      });
    }
    
    const response = await axios.get(`${WEATHER_API_URL}/weather`, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: 'metric',
        lang: 'ar'
      }
    });
    
    const { main, weather, wind, clouds, sys, name, sys: { sunrise, sunset } } = response.data;
    
    res.json({
      success: true,
      data: {
        city: name,
        country: response.data.sys.country,
        temperature: Math.round(main.temp),
        feelsLike: Math.round(main.feels_like),
        humidity: main.humidity,
        pressure: main.pressure,
        windSpeed: Math.round(wind.speed),
        cloudiness: clouds.all,
        description: weather[0].description,
        icon: weather[0].icon,
        sunrise: new Date(sunrise * 1000).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(sunset * 1000).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'خطأ في جلب بيانات الطقس'
    });
  }
});

// Get weather forecast for 5 days
app.get('/api/weather/forecast', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'اسم المدينة مطلوب'
      });
    }
    
    if (WEATHER_API_KEY === 'demo') {
      // Mock forecast data
      const mockForecast = {
        success: true,
        data: [
          { date: '2024-08-31', tempMax: 35, tempMin: 28, description: 'سماء صافية', icon: '01d' },
          { date: '2024-09-01', tempMax: 34, tempMin: 27, description: 'غيوم قليلة', icon: '02d' },
          { date: '2024-09-02', tempMax: 33, tempMin: 26, description: 'غيوم متفرقة', icon: '03d' },
          { date: '2024-09-03', tempMax: 32, tempMin: 25, description: 'ممطر', icon: '10d' },
          { date: '2024-09-04', tempMax: 31, tempMin: 24, description: 'عواصف رعدية', icon: '11d' }
        ],
        note: 'بيانات تجريبية'
      };
      return res.json(mockForecast);
    }
    
    const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: 'metric',
        lang: 'ar',
        cnt: 40
      }
    });
    
    const dailyData = {};
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          temps: [],
          description: item.weather[0].description,
          icon: item.weather[0].icon
        };
      }
      dailyData[date].temps.push(item.main.temp);
    });
    
    const forecast = Object.entries(dailyData).map(([date, data]) => ({
      date,
      tempMax: Math.round(Math.max(...data.temps)),
      tempMin: Math.round(Math.min(...data.temps)),
      description: data.description,
      icon: data.icon
    }));
    
    res.json({
      success: true,
      data: forecast.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'خطأ في جلب بيانات الطقس'
    });
  }
});

// Get weather for multiple cities
app.post('/api/weather/multiple', async (req, res) => {
  try {
    const { cities } = req.body;
    
    if (!cities || !Array.isArray(cities)) {
      return res.status(400).json({
        success: false,
        error: 'يجب توفير مصفوفة من أسماء المدن'
      });
    }
    
    const weatherData = await Promise.all(
      cities.map(async (city) => {
        try {
          if (WEATHER_API_KEY === 'demo') {
            return {
              city,
              temperature: Math.floor(Math.random() * 20) + 20,
              description: 'سماء صافية',
              icon: '01d'
            };
          }
          
          const response = await axios.get(`${WEATHER_API_URL}/weather`, {
            params: {
              q: city,
              appid: WEATHER_API_KEY,
              units: 'metric',
              lang: 'ar'
            }
          });
          
          return {
            city: response.data.name,
            temperature: Math.round(response.data.main.temp),
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed
          };
        } catch (error) {
          return {
            city,
            error: 'فشل جلب البيانات'
          };
        }
      })
    );
    
    res.json({
      success: true,
      data: weatherData,
      count: weatherData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'الخادم يعمل بشكل صحيح',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    endpoints: {
      clock: [
        'GET /api/clock/timezones',
        'GET /api/clock/search?q=query'
      ],
      weather: [
        'GET /api/weather/current?city=name',
        'GET /api/weather/forecast?city=name',
        'POST /api/weather/multiple'
      ]
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'المسار غير موجود',
    path: req.path,
    method: req.method
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: 'خطأ في الخادم',
    message: err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 خادم DAAS يعمل على المنفذ ${PORT}`);
  console.log(`📍 رابط الخادم: http://localhost:${PORT}`);
  console.log(`🏥 فحص الصحة: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;