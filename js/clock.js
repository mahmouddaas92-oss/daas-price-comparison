// World Clock JavaScript
const API_URL = 'http://localhost:5000/api';
let is24HourFormat = true;
let allTimezones = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadTimezones();
  document.getElementById('searchTimezone').addEventListener('input', filterTimezones);
  setInterval(updateClocks, 1000);
});

// Load timezones from API
async function loadTimezones() {
  try {
    const response = await fetch(`${API_URL}/clock/timezones`);
    const result = await response.json();
    
    if (result.success) {
      allTimezones = result.data;
      displayTimezones(allTimezones);
    }
  } catch (error) {
    console.error('خطأ في تحميل المناطق الزمنية:', error);
    displayMockData();
  }
}

// Display timezones
function displayTimezones(timezones) {
  const grid = document.getElementById('timezoneGrid');
  grid.innerHTML = timezones.map(tz => `
    <div class="timezone-card">
      <div class="flex items-center justify-between">
        <div>
          <p class="city-name">${tz.flag} ${tz.city}</p>
          <p class="country-name">${tz.country}</p>
        </div>
      </div>
      <div class="digital-clock" data-timezone="${tz.timezone}">${tz.time}</div>
      <p class="text-sm text-gray-400 text-center">${tz.date}</p>
      <div class="timezone-info">
        <i class="fas fa-map-marker-alt ml-1"></i>
        ${tz.timezone}
      </div>
    </div>
  `).join('');
}

// Update clocks
function updateClocks() {
  const clocks = document.querySelectorAll('.digital-clock');
  clocks.forEach(clock => {
    const timezone = clock.dataset.timezone;
    const now = new Date();
    
    const formatter = new Intl.DateTimeFormat('ar-SA', {
      timeZone: timezone,
      hour12: !is24HourFormat,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    clock.textContent = formatter.format(now);
  });
}

// Filter timezones
async function filterTimezones() {
  const query = document.getElementById('searchTimezone').value;
  
  if (!query) {
    displayTimezones(allTimezones);
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/clock/search?q=${encodeURIComponent(query)}`);
    const result = await response.json();
    
    if (result.success) {
      displayTimezones(result.data);
    }
  } catch (error) {
    console.error('خطأ في البحث:', error);
  }
}

// Toggle time format
function toggleFormat() {
  is24HourFormat = !is24HourFormat;
  document.getElementById('formatToggle').textContent = is24HourFormat ? 'صيغة 24 ساعة' : 'صيغة 12 ساعة';
  updateClocks();
}

// Mock data for demo
function displayMockData() {
  const mockTimezones = [
    { city: 'الرياض', country: 'السعودية', timezone: 'Asia/Riyadh', flag: '🇸🇦', time: '03:45:30', date: '2024-08-30' },
    { city: 'دبي', country: 'الإمارات', timezone: 'Asia/Dubai', flag: '🇦🇪', time: '04:45:30', date: '2024-08-30' },
    { city: 'لندن', country: 'المملكة المتحدة', timezone: 'Europe/London', flag: '🇬🇧', time: '12:45:30', date: '2024-08-30' }
  ];
  displayTimezones(mockTimezones);
}