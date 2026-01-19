import React, { useState, useEffect } from "react";

const API_KEY = "14e8f0bb8da91fb352ce4c9ac465b0b7";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError("");
    try {
      // Получение гео-координат по названию города
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
      );
      const geoData = await geoResponse.json();
      if (!geoData.length) {
        setError("Город не найден");
        setWeatherData(null);
        setLoading(false);
        return;
      }
      const { lat, lon } = geoData[0];

      // Получение погоды по координатам
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}` +
          `&exclude=minutely&units=metric&lang=ru&appid=${API_KEY}`
      );
      const weather = await weatherResponse.json();
      setWeatherData(weather);
    } catch (err) {
      setError("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchWeather();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Погодник</h1>
      <input
        type="text"
        placeholder="Введите название города"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ padding: "10px", width: "300px" }}
      />
      <button
        onClick={fetchWeather}
        style={{ padding: "10px", marginLeft: "10px" }}
      >
        Найти
      </button>

      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weatherData && (
        <>
          <WeatherCurrent data={weatherData.current} city={city} />
          <HourlyForecast hourly={weatherData.hourly} />
          <DailyForecast daily={weatherData.daily} />
        </>
      )}
    </div>
  );
}
function WeatherCurrent({ data, city }) {
  if (data && data.dt) {
    const date = new Date(data.dt * 1000).toLocaleString("ru-RU", {
      timeZone: data.timezone,
    });
    return (
      <div>
        <p>Дата: {date}</p>
      </div>
    );
  } else {
    return <div>Загрузка данных...</div>;
  }
}
return (
  <div>
    <h2>Текущая погода в {city}</h2>
    <p>{date}</p>
    <p>Температура: {data.temp}°C</p>
    <p>Описание: {data.weather[0].description}</p>
    <p>Влажность: {data.humidity}%</p>
    <p>Ветер: {data.wind_speed} м/с</p>
  </div>
);
function HourlyForecast({ hourly }) {
  const now = Date.now() / 1000;
  const todayHours = hourly.filter(
    (h) => h.dt >= now && h.dt <= now + 24 * 3600
  );

  return (
    <div>
      <h3>Почасовой прогноз на сегодня</h3>
      <div style={{ display: "flex", overflowX: "auto" }}>
        {todayHours.map((hour) => (
          <div
            key={hour.dt}
            style={{
              minWidth: "80px",
              padding: "10px",
              border: "1px solid #ccc",
            }}
          >
            <p>{new Date(hour.dt * 1000).getHours()}:00</p>
            <p>{hour.temp}°C</p>
            <p>{hour.weather[0].description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyForecast({ daily }) {
  // Показываем прогноз на 3-5 ближайших дней
  const days = daily.slice(1, 6);
  return (
    <div>
      <h3>Прогноз на ближайшие дни</h3>
      {days.map((day) => (
        <div
          key={day.dt}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            marginBottom: "10px",
          }}
        >
          <p>{new Date(day.dt * 1000).toLocaleDateString("ru-RU")}</p>
          <p>
            Мин: {day.temp.min}°C / Макс: {day.temp.max}°C
          </p>
          <p>Описание: {day.weather[0].description}</p>
        </div>
      ))}
    </div>
  );
}
export default App;
