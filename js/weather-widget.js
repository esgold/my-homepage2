// weather-widget.js

document.addEventListener('DOMContentLoaded', function() {
  console.log('Weather widget script loaded');
  const widget = document.getElementById('weather-widget');
  let loading = widget.querySelector('.weather-loading');

  function showError(message) {
  console.error('Weather Widget Error:', message);
    widget.innerHTML = `<div class="weather-error">${message}</div>`;
  }

  function showManualInput() {
  console.log('Prompting for manual city input');
    widget.innerHTML = `
      <div class="weather-error">Location permission denied.<br>Please enter your city:</div>
      <input type="text" id="manual-location" placeholder="City name" style="margin:12px 0;padding:8px;width:80%;border-radius:6px;border:1px solid #ccc;">
      <button id="manual-submit" style="padding:8px 16px;border-radius:6px;background:#a259c6;color:#fff;border:none;">Submit</button>
      <div class="weather-loading" style="display:none;">Fetching weather...</div>
    `;
    document.getElementById('manual-submit').onclick = function() {
      const city = document.getElementById('manual-location').value;
      if (city) {
        // Show loading
        const loadingDiv = widget.querySelector('.weather-loading');
        loadingDiv.style.display = 'block';
        fetchCityWeather(city);
      }
    };
  }

  function fetchCityWeather(city) {
  console.log('Manual city entered:', city);
    // For demo: fallback to New York coordinates
    // In production, use a geocoding API to get lat/lon from city name
    const coords = {
      latitude: 40.7128,
      longitude: -74.0060
    };
    fetchWeather(coords.latitude, coords.longitude);
  }

  function fetchWeather(lat, lon) {
  console.log('Fetching weather for coordinates:', lat, lon);
  // If loading element exists, update it
  loading = widget.querySelector('.weather-loading');
  if (loading) loading.textContent = 'Fetching weather...';
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`)
      .then(res => {
        console.log('Weather API response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Weather API response data:', data);
        if (!data.current_weather) {
          showError('Weather data unavailable.');
          return;
        }
        const w = data.current_weather;
        widget.innerHTML = `
          <div class="weather-main">
            <div class="weather-temp">${Math.round(w.temperature)}°F</div>
            <div class="weather-desc">${w.weathercode ? 'Condition code: ' + w.weathercode : ''}</div>
            <div class="weather-wind">Wind: ${Math.round(w.windspeed)} mph ${w.winddirection ? '(' + w.winddirection + '°)' : ''}</div>
          </div>
        `;
      })
      .catch((err) => {
        console.error('Weather API fetch error:', err);
        showError('Failed to fetch weather.');
      });
  }

  if (navigator.geolocation) {
  console.log('Geolocation supported');
    navigator.geolocation.getCurrentPosition(
      pos => {
        console.log('Geolocation success:', pos.coords);
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      },
      err => {
        console.error('Geolocation error:', err);
        if (err.code === 1) {
          showManualInput();
        } else {
          showError('Unable to get location.');
        }
      }
    );
  console.error('Geolocation not supported');
  } else {
    showError('Geolocation not supported.');
  }
});
