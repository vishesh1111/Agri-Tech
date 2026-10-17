import { Farm, FarmWeather, HourlyForecast, DailyForecast } from '../types';

function degreesToCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

function interpretWeatherCode(code: number): { text: string; icon: string } {
  switch (code) {
    case 0:
      return { text: 'Clear & Sunny', icon: 'sun' };
    case 1:
      return { text: 'Mainly Sunny', icon: 'sun' };
    case 2:
      return { text: 'Partly Cloudy', icon: 'cloud-sun' };
    case 3:
      return { text: 'Overcast & Cloudy', icon: 'cloud' };
    case 45:
    case 48:
      return { text: 'Dense Morning Fog', icon: 'cloud-fog' };
    case 51:
    case 53:
    case 55:
      return { text: 'Light Drizzle', icon: 'cloud-drizzle' };
    case 61:
    case 63:
      return { text: 'Moderate Rainfall', icon: 'cloud-rain' };
    case 65:
      return { text: 'Heavy Downpour Alert', icon: 'cloud-rain' };
    case 71:
    case 73:
    case 75:
      return { text: 'Frost / Hail Alert', icon: 'snowflake' };
    case 80:
    case 81:
    case 82:
      return { text: 'Violent Rain Showers', icon: 'cloud-lightning' };
    case 95:
    case 96:
    case 99:
      return { text: 'Severe Thunderstorm Warning', icon: 'cloud-lightning' };
    default:
      return { text: 'Pleasant & Clear', icon: 'sun' };
  }
}

function formatHour(timeStr: string, index: number): string {
  try {
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    const hours = (new Date().getHours() + index) % 24;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:00 ${ampm}`;
  }
}

function formatDayLabel(timeStr: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  try {
    const d = new Date(timeStr);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  } catch {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const idx = (new Date().getDay() + index) % 7;
    return days[idx];
  }
}

export const WeatherService = {
  async fetchLiveWeatherForFarm(farm: Farm): Promise<FarmWeather> {
    const lat = farm.latitude || 30.8987;
    const lon = farm.longitude || 75.8573;

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,dew_point_2m,uv_index,et0_fao_evapotranspiration,soil_temperature_0cm,soil_moisture_0_to_1cm` +
      `&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,et0_fao_evapotranspiration` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,et0_fao_evapotranspiration_sum,uv_index_max` +
      `&timezone=auto`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
      const data = await res.json();

      const current = data.current || {};
      const hourly = data.hourly || {};
      const daily = data.daily || {};

      const temp = Math.round(current.temperature_2m ?? 30);
      const feelsLike = Math.round(current.apparent_temperature ?? temp);
      const humidity = Math.round(current.relative_humidity_2m ?? 60);
      const windSpeed = Math.round(current.wind_speed_10m ?? 12);
      const windGusts = Math.round(current.wind_gusts_10m ?? windSpeed + 5);
      const windDeg = current.wind_direction_10m ?? 270;
      const weatherCode = current.weather_code ?? 0;
      const rainMm = current.precipitation ?? 0.0;
      const dewPoint = current.dew_point_2m ?? 18.0;
      const pressure = Math.round(current.surface_pressure ?? 1012);
      const uv = Math.round(current.uv_index ?? (temp > 34 ? 8 : 5));
      const et0 = Math.round((current.et0_fao_evapotranspiration ?? 4.2) * 10) / 10;
      const soilTemp = Math.round((current.soil_temperature_0cm ?? 25.5) * 10) / 10;
      const soilMoistPercent = Math.min(95, Math.max(20, Math.round((current.soil_moisture_0_to_1cm ?? 0.28) * 100)));

      const cond = interpretWeatherCode(weatherCode);
      const isSevere = [95, 96, 99, 82, 65, 75].includes(weatherCode) || windSpeed > 35 || rainMm > 15.0;

      // Hourly items (next 8)
      const hourlyList: HourlyForecast[] = [];
      const times = hourly.time || [];
      const temps = hourly.temperature_2m || [];
      const rainChances = hourly.precipitation_probability || [];
      const codes = hourly.weather_code || [];
      const winds = hourly.wind_speed_10m || [];
      const et0s = hourly.et0_fao_evapotranspiration || [];

      for (let i = 0; i < Math.min(8, times.length); i++) {
        hourlyList.push({
          timeLabel: formatHour(times[i], i),
          tempC: Math.round(temps[i] ?? temp),
          rainChance: Math.round(rainChances[i] ?? 10),
          icon: interpretWeatherCode(codes[i] ?? 0).icon,
          windSpeedKm: Math.round(winds[i] ?? 10),
          et0Rate: Math.round((et0s[i] ?? 0.4) * 10) / 10,
        });
      }

      // Daily items (next 7)
      const dailyList: DailyForecast[] = [];
      const dTimes = daily.time || [];
      const dMax = daily.temperature_2m_max || [];
      const dMin = daily.temperature_2m_min || [];
      const dRainProb = daily.precipitation_probability_max || [];
      const dRainSum = daily.precipitation_sum || [];
      const dCodes = daily.weather_code || [];
      const dEt0 = daily.et0_fao_evapotranspiration_sum || [];

      for (let i = 0; i < Math.min(7, dTimes.length); i++) {
        dailyList.push({
          dayLabel: formatDayLabel(dTimes[i], i),
          condition: interpretWeatherCode(dCodes[i] ?? 0).text,
          tempMax: Math.round(dMax[i] ?? temp + 2),
          tempMin: Math.round(dMin[i] ?? temp - 8),
          rainPercent: Math.round(dRainProb[i] ?? 15),
          rainMm: Math.round((dRainSum[i] ?? 0) * 10) / 10,
          et0Sum: Math.round((dEt0[i] ?? 4.0) * 10) / 10,
        });
      }

      // Spraying window status
      let sprayingStatus = 'OPTIMAL';
      let sprayingReason = 'Calm winds and zero rain expected in next 6 hours.';
      if (windSpeed > 22) {
        sprayingStatus = 'NOT_RECOMMENDED';
        sprayingReason = `High winds (${windSpeed} km/h) risk severe spray drift and chemical loss.`;
      } else if (rainMm > 1.0 || (hourlyList[0]?.rainChance ?? 0) > 40) {
        sprayingStatus = 'CAUTION';
        sprayingReason = 'Upcoming rainfall within 4 hours may wash off foliar chemicals.';
      }

      // Agricultural Advisory
      const advisory = isSevere
        ? `⚠️ Heavy weather active (${cond.text}). Suspend irrigation and field sprays. Secure open cattle sheds.`
        : sprayingStatus === 'OPTIMAL'
        ? `Ideal weather window for crop scouting and foliar spraying. High solar radiation (UV ${uv}).`
        : `Spraying caution: ${sprayingReason}`;

      // Livestock THI
      const thi = Math.round((0.8 * temp + (humidity / 100) * (temp - 14.4) + 46.4) * 10) / 10;
      const stressLevel = thi >= 80 ? 'Severe' : thi >= 75 ? 'Moderate Stress' : thi >= 70 ? 'Mild Stress' : 'Normal';

      return {
        farmId: farm.id,
        farmName: farm.name,
        locationName: farm.location || `${farm.village}, ${farm.state}`,
        state: farm.state,
        currentTempC: temp,
        conditionText: cond.text,
        conditionIcon: cond.icon,
        humidityPercent: humidity,
        windSpeedKm: windSpeed,
        rainProbabilityPercent: hourlyList[0]?.rainChance ?? 10,
        soilMoisturePercent: soilMoistPercent,
        uvIndex: uv,
        isSevereAlert: isSevere,
        alertHeader: isSevere ? `⚠️ ${cond.text.toUpperCase()}` : null,
        agriculturalAdvisory: advisory,
        hourlyForecast: hourlyList,
        weeklyForecast: dailyList,
        feelsLikeTempC: feelsLike,
        precipitationMm: rainMm,
        dewPointC: dewPoint,
        windGustsKm: windGusts,
        windDirection: degreesToCompass(windDeg),
        surfacePressureHpa: pressure,
        soilTemperatureC: soilTemp,
        et0EvapotranspirationMm: et0,
        sprayingWindowStatus: sprayingStatus,
        sprayingReason: sprayingReason,
        irrigationAdvice: et0 > 5.0 ? 'High evapotranspiration: Increase drip run by 15 mins.' : 'Moisture optimal: Skip overhead irrigation.',
        diseaseRiskLevel: humidity > 75 && temp > 22 ? 'HIGH' : humidity > 60 ? 'MODERATE' : 'LOW',
        diseaseRiskReason: humidity > 75 ? 'High ambient humidity favors foliar fungal spore germination.' : 'Dry canopy conditions keep pathogen risk low.',
        fieldWorkabilityScore: rainMm > 10 ? 40 : 92,
        livestockThiScore: thi,
        livestockStressLevel: stressLevel,
        lastUpdatedTime: 'Just now',
      };
    } catch {
      // Offline fallback
      return WeatherService.getFallbackWeather(farm);
    }
  },

  getFallbackWeather(farm: Farm): FarmWeather {
    return {
      farmId: farm.id,
      farmName: farm.name,
      locationName: farm.location || `${farm.village}, ${farm.state}`,
      state: farm.state,
      currentTempC: 28,
      conditionText: 'Clear & Sunny',
      conditionIcon: 'sun',
      humidityPercent: 55,
      windSpeedKm: 11,
      rainProbabilityPercent: 10,
      soilMoisturePercent: 62,
      uvIndex: 6,
      isSevereAlert: false,
      alertHeader: null,
      agriculturalAdvisory: 'Favorable field work conditions. Moderate temperature and dry canopy.',
      hourlyForecast: [
        { timeLabel: '10 AM', tempC: 27, rainChance: 5, icon: 'sun', windSpeedKm: 9, et0Rate: 0.4 },
        { timeLabel: '12 PM', tempC: 30, rainChance: 5, icon: 'sun', windSpeedKm: 11, et0Rate: 0.6 },
        { timeLabel: '02 PM', tempC: 32, rainChance: 10, icon: 'sun', windSpeedKm: 13, et0Rate: 0.7 },
        { timeLabel: '04 PM', tempC: 31, rainChance: 15, icon: 'cloud-sun', windSpeedKm: 12, et0Rate: 0.5 },
        { timeLabel: '06 PM', tempC: 28, rainChance: 10, icon: 'cloud-sun', windSpeedKm: 8, et0Rate: 0.3 },
        { timeLabel: '08 PM', tempC: 25, rainChance: 5, icon: 'cloud', windSpeedKm: 7, et0Rate: 0.1 },
      ],
      weeklyForecast: [
        { dayLabel: 'Today', condition: 'Clear & Sunny', tempMax: 32, tempMin: 19, rainPercent: 10, rainMm: 0, et0Sum: 4.5 },
        { dayLabel: 'Tomorrow', condition: 'Partly Cloudy', tempMax: 31, tempMin: 20, rainPercent: 20, rainMm: 0.5, et0Sum: 4.2 },
        { dayLabel: 'Wed', condition: 'Light Rain', tempMax: 29, tempMin: 18, rainPercent: 45, rainMm: 3.2, et0Sum: 3.8 },
        { dayLabel: 'Thu', condition: 'Sunny', tempMax: 30, tempMin: 17, rainPercent: 10, rainMm: 0, et0Sum: 4.3 },
        { dayLabel: 'Fri', condition: 'Clear', tempMax: 32, tempMin: 19, rainPercent: 5, rainMm: 0, et0Sum: 4.6 },
        { dayLabel: 'Sat', condition: 'Clear', tempMax: 33, tempMin: 20, rainPercent: 5, rainMm: 0, et0Sum: 4.8 },
        { dayLabel: 'Sun', condition: 'Partly Cloudy', tempMax: 31, tempMin: 21, rainPercent: 25, rainMm: 1.0, et0Sum: 4.1 },
      ],
      feelsLikeTempC: 29,
      precipitationMm: 0.0,
      dewPointC: 17.5,
      windGustsKm: 16,
      windDirection: 'NW',
      surfacePressureHpa: 1012,
      soilTemperatureC: 24.5,
      et0EvapotranspirationMm: 4.3,
      sprayingWindowStatus: 'OPTIMAL',
      sprayingReason: 'Calm winds and clear skies. Optimal chemical absorption.',
      irrigationAdvice: 'Soil moisture is 62%. Drip cycle for 35 mins recommended.',
      diseaseRiskLevel: 'LOW',
      diseaseRiskReason: 'Dry foliage minimizes fungal incubation window.',
      fieldWorkabilityScore: 90,
      livestockThiScore: 72.0,
      livestockStressLevel: 'Normal',
      lastUpdatedTime: 'Just now',
    };
  },
};
