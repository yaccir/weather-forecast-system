// Get all DOM elements needed for weather info
const input = document.getElementById("input");
const search = document.getElementById("search");
const image = document.getElementById("image");
const city = document.getElementById("city");
const temp = document.getElementById("temp");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const location1 = document.getElementById("location");
const fdayforecast = document.getElementById("dayforcast");

const feelslike = document.getElementById("feelslike");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");

const apend = document.getElementsByTagName("select")[0]; // Recent cities dropdown
const apiKey = "6eff8116980e61428df61fc6e27ca8d5";

// Handle Search Button Click
search.addEventListener("click", function (e) {
  e.preventDefault();

  if (input.value === "") {
    alert("Enter city name");
    return;
  }

  // API URL to fetch current weather for the city
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${input.value}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((res) => res.json())
    .then((res) => {
      if (res.cod !== 200) {
        alert("City not found!");
        return;
      }

      updateCurrentWeather(res);        // Show current weather
      fivedayforecast(input.value);     // Show 5-day forecast
      addRecentSearch(res.name);        // Save city to history
      showRecentSearches();             // Refresh dropdown list
    })
    .catch((err) => console.log("Error:", err));
});

// Handle Location Button Click
location1.addEventListener("click", function (e) {
  e.preventDefault();

  // Check if browser supports geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  } else {
    alert("Geolocation is not supported by this browser.");
  }

  // If location is successfully fetched
  function successCallback(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // API URL using coordinates
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        if (res.cod !== 200) {
          alert("City not found!");
          return;
        }

        updateCurrentWeather(res);
        addRecentSearch(res.name);
        showRecentSearches();
        fivedayforecast(res.name);
      })
      .catch((err) => console.log("Error:", err));
  }

  // If location fetch fails
  function errorCallback(err) {
    alert("Unable to get location. Make sure GPS is enabled.");
    console.warn(err);
  }
});

// Update the current weather section
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

// Add searched city to localStorage and dropdown
function addRecentSearch(cityName) {
  let history = JSON.parse(localStorage.getItem("recentCities")) || [];

  // Remove duplicate if already exists
  history = history.filter(ele => ele.toLowerCase() !== cityName.toLowerCase());

  // Add new city at the beginning
  history.unshift(cityName);

  // Keep only last 5 searches
  history = history.slice(0, 5);

  localStorage.setItem("recentCities", JSON.stringify(history));

  // Clear dropdown and add default placeholder
  while (apend.options.length > 0) {
    apend.remove(0);
  }

  const placeholder = document.createElement("option");
  placeholder.innerText = "Recent Searches";
  placeholder.disabled = true;
  placeholder.selected = true;
  apend.appendChild(placeholder);
}

// Show recent searched cities in dropdown
function showRecentSearches() {
  let history = JSON.parse(localStorage.getItem("recentCities")) || [];

  // Clear existing options
  while (apend.options.length > 0) {
    apend.remove(0);
  }

  // Add placeholder option
  const placeholder = document.createElement("option");
  placeholder.innerText = "Recent Searches";
  placeholder.disabled = true;
  placeholder.selected = true;
  apend.appendChild(placeholder);

  // Add each recent city
  history.forEach(element => {
    const ele = document.createElement("option");
    ele.innerText = element;
    apend.appendChild(ele);
  });
}

// When user selects from dropdown
apend.addEventListener("change", (e) => {
  const value = e.target.value;
  if (value !== "Recent Searches") {
    fivedayforecast(value);
  }
});

// Fetch 5-day forecast data
function fivedayforecast(value) {
  // Fetch current weather again
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${value}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((res) => res.json())
    .then((res) => {
      if (res.cod !== 200) {
        alert("City not found!");
        return;
      }

      updateCurrentWeather(res);
      addRecentSearch(res.name);
      showRecentSearches();
    })
    .catch((err) => console.log("Error:", err));

  // Fetch 5-day forecast from forecast API
  const forecastdata = {};
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${value}&appid=${apiKey}&units=metric`;

  fetch(forecastURL)
    .then(res => res.json())
    .then(res => {
      // Pick one forecast per day (usually at 12:00)
      res.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!forecastdata[date]) {
          forecastdata[date] = item;
        }
      });

      const entries = Object.entries(forecastdata).slice(0, 5);

      entries.forEach(([date, data], index) => {
        document.getElementById(`recentdate${index + 1}`).innerText = date;
        document.getElementById(`recenttemp${index + 1}`).innerText = data.main.temp + " °C";
        document.getElementById(`recenticon${index + 1}`).src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        document.getElementById(`recenthumidity${index + 1}`).innerText = "Humidity "+data.main.humidity + " %";
      });

      // Show forecast section
      fdayforecast.classList.remove("hidden");
    });
}

// Run on page load
window.onload = showRecentSearches;
