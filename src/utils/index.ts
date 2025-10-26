import axios from "axios";
import { Jimp, loadFont } from "jimp";
// @ts-ignore
import { SANS_16_BLACK } from "jimp/fonts";
import fs from "fs";

import { Country } from "../types";
import { Country as Country2 } from "../entities/Country";

export const fetchAllCountries = async () => {
  try {
    const url =
      "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";

    const { data } = await axios.get(url);

    return { data: data as Country[], error: false, details: null };
  } catch (error: any) {
    return { data: null, error: true, details: error };
  }
};

export const getExchangeRates = async () => {
  try {
    const url = "https://open.er-api.com/v6/latest/USD";

    const { data } = await axios.get(url);

    return { rates: data.rates, error: false, details: null };
  } catch (error: any) {
    return { rates: null, error: true, details: error };
  }
};

export const generateSummaryImage = async (countries: Country2[]) => {
  const total = countries.length;
  const top5 = countries
    .filter((c) => c.estimated_gdp)
    .sort((a, b) => (b.estimated_gdp ?? 0) - (a.estimated_gdp ?? 0))
    .slice(0, 5);

  const image = new Jimp({ width: 800, height: 400, color: "#ffffff" });
  const font = await loadFont(SANS_16_BLACK);

  image.print({ x: 20, y: 20, text: `Total Countries: ${total}`, font });
  image.print({ font, x: 20, y: 50, text: `Top 5 by GDP:` });

  top5.forEach((c, i) => {
    image.print({
      font,
      x: 40,
      y: 80 + i * 30,
      text: `${i + 1}. ${c.name} - ${c.estimated_gdp?.toFixed(2)}`,
    });
  });

  image.print({
    font,
    x: 20,
    y: 280,
    text: `Last Refresh: ${new Date().toISOString()}`,
  });

  if (!fs.existsSync("cache")) fs.mkdirSync("cache");
  await image.write("cache/summary.png");
};
