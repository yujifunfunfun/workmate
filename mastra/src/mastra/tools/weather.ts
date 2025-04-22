import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
}

export const weatherTool = createTool({
  id: "get-weather",
  description: "特定の場所の現在の天気を取得する",
  inputSchema: z.object({
    location: z.string().describe("都市名"),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async ({ context }) => {
    return await getWeather(context.location);
  },
});

const getWeather = async (location: string) => {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = await geocodingResponse.json();

  if (!geocodingData.results?.[0]) {
    throw new Error(`場所 '${location}' が見つかりません`);
  }

  const { latitude, longitude, name } = geocodingData.results[0];

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;

  const response = await fetch(weatherUrl);
  const data: WeatherResponse = await response.json();

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name,
  };
};

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "晴天",
    1: "主に晴れ",
    2: "部分的に曇り",
    3: "曇り",
    45: "霧",
    48: "霧氷の霧",
    51: "小雨",
    53: "中程度の霧雨",
    55: "濃い霧雨",
    56: "軽い凍結霧雨",
    57: "濃い凍結霧雨",
    61: "小雨",
    63: "中程度の雨",
    65: "大雨",
    66: "軽い凍結雨",
    67: "激しい凍結雨",
    71: "小雪",
    73: "中程度の雪",
    75: "大雪",
    77: "雪粒",
    80: "小雨のにわか雨",
    81: "中程度のにわか雨",
    82: "激しいにわか雨",
    85: "小雪のにわか雪",
    86: "大雪のにわか雪",
    95: "雷雨",
    96: "小さな雹を伴う雷雨",
    99: "大きな雹を伴う雷雨",
  };
  return conditions[code] || "不明";
}
