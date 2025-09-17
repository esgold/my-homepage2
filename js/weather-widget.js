// weather-widget.js

document.addEventListener('DOMContentLoaded', function() {
  const widget = document.getElementById('weather-widget');
  let loading = widget.querySelector('.weather-loading');

  function showError(message) {
    widget.innerHTML = `<div class="weather-error">${message}</div>`;
  }

  function showManualInput() {
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
    // For demo: fallback to New York coordinates
    // In production, use a geocoding API to get lat/lon from city name
    const coords = {
      latitude: 40.7128,
      longitude: -74.0060
    };
    fetchWeather(coords.latitude, coords.longitude);
  }

  function fetchWeather(lat, lon) {
  // If loading element exists, update it
  loading = widget.querySelector('.weather-loading');
  if (loading) loading.textContent = 'Fetching weather...';
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`)
      .then(res => res.json())
      .then(data => {
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
      .catch(() => showError('Failed to fetch weather.'));
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      },
      err => {
        if (err.code === 1) {
          showManualInput();
        } else {
          showError('Unable to get location.');
        }
      }
    );
  } else {
    showError('Geolocation not supported.');
  }
});
