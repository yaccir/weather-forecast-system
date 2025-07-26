const input = document.getElementById("input");
const search = document.getElementById("search");
const image = document.getElementById("image");
const city = document.getElementById("city");
const temp = document.getElementById("temp");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const location1 = document.getElementById("location");

const feelslike = document.getElementById("feelslike");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");

const apend = document.getElementsByTagName("select")[0];
const fdayforecast = document.getElementById("dayforcast");

const apiKey = "6eff8116980e61428df61fc6e27ca8d5";

// Handle search
search.addEventListener("click", (e) => {
  e.preventDefault();

  const value = input.value.trim();
  if (!value) return alert("Enter city name");

  fetchWeather(value);
});

// Handle location button
location1.addEventListener("click", (e) => {
  e.preventDefault();

  if (!navigator.geolocation) {
    alert("Geolocation is not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(success, error);

  function success(position) {
    const { latitude: lat, longitude: lon } = position.coords;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        if (res.cod !== 200) return alert("City not found!");
        updateCurrentWeather(res);
        addRecentSearch(res.name);
        showRecentSearches();
        fetchForecast(res.name);
      })
      .catch((err) => console.log("Error:", err));
  }

  function error(err) {
    alert("Unable to fetch location. Enable GPS.");
    console.warn(err);
  }
});

// Main fetch function
function fetchWeather(cityName) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((res) => res.json())
    .then((res) => {
      if (res.cod !== 200) return alert("City not found!");
      updateCurrentWeather(res);
      addRecentSearch(res.name);
      showRecentSearches();
      fetchForecast(res.name);
    })
    .catch((err) => console.log("Error:", err));
}

// Update current weather section
function updateCurrentWeather(res) {
  city.innerText = res.name;
  temp.innerText = res.main.temp + " °C";
  humidity.innerText = res.main.humidity + " %";
  wind.innerText = res.wind.speed + " m/s";
  image.src = `https://openweathermap.org/img/wn/${res.weather[0].icon}@4x.png`;

  feelslike.innerText = res.main.feels_like + " °C";
  pressure.innerText = res.main.pressure + " hPa";
  visibility.innerText = res.visibility / 1000 + " Km";
}

// Add city to localStorage
function addRecentSearch(cityName) {
  let history = JSON.parse(localStorage.getItem("recentCities")) || [];

  history = history.filter((c) => c.toLowerCase() !== cityName.toLowerCase());
  history.unshift(cityName);
  history = history.slice(0, 5);

  localStorage.setItem("recentCities", JSON.stringify(history));
}

// Populate dropdown
function showRecentSearches() {
  const history = JSON.parse(localStorage.getItem("recentCities")) || [];

  apend.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.innerText = "Recent Searches";
  placeholder.disabled = true;
  placeholder.selected = true;
  apend.appendChild(placeholder);

  history.forEach((city) => {
    const option = document.createElement("option");
    option.innerText = city;
    apend.appendChild(option);
  });
}

// Handle dropdown change
apend.addEventListener("change", (e) => {
  const value = e.target.value;
  if (value !== "Recent Searches") {
    fetchWeather(value);
  }
});

// Fetch 5-day forecast and render cards
function fetchForecast(cityName) {
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

  fetch(forecastURL)
    .then((res) => res.json())
    .then((res) => {
      const forecastdata = {};

      res.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];
        if (!forecastdata[date] && item.dt_txt.includes("12:00:00")) {
          forecastdata[date] = item;
        }
      });

      renderForecastCards(forecastdata);
    })
    .catch((err) => console.log("Forecast Error:", err));
}

// Render forecast cards dynamically
function renderForecastCards(data) {
  const container = fdayforecast.querySelector("div");
  container.innerHTML = "";

  const entries = Object.entries(data).slice(0, 5);

  entries.forEach(([date, info]) => {
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-xl p-4 shadow-md w-[200px] text-center flex-shrink-0";

    card.innerHTML = `
      <p class="font-semibold mb-2">${date}</p>
      <img src="https://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png" alt="icon" class="mx-auto mb-2 w-16 h-16" />
      <p><strong>Temp:</strong> ${info.main.temp} °C</p>
      <p><strong>Humidity:</strong> ${info.main.humidity} %</p>
    `;

    container.appendChild(card);
  });

  fdayforecast.classList.remove("hidden");
}

// Run on page load
window.onload = showRecentSearches;
