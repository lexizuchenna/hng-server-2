import { Request, Response } from "express";
import fs from "fs";

import { AppDataSource } from "../config/db";
import { Country } from "../entities/Country";
import {
  fetchAllCountries,
  generateSummaryImage,
  getExchangeRates,
} from "../utils";

const countryRepo = AppDataSource.getRepository(Country);

let last_refreshed_at: string | null = null;

export const refreshCountries = async (_req: Request, res: Response) => {
  try {
    const countriesData = await fetchAllCountries();
    const ratesData = await getExchangeRates();

    if (countriesData.error) {
      return res.status(503).json({
        error: "External data source unavailable",
        details: "Could not fetch data from REST Countries API",
      });
    }

    if (ratesData.error) {
      return res.status(503).json({
        error: "External data source unavailable",
        details: "Could not fetch data from open.er API",
      });
    }

    if (!countriesData.error && countriesData.data) {
      const countries: Country[] = [];

      for (const country of countriesData.data) {
        const code = country.currencies && country?.currencies[0]?.code;
        const exchange_rate = ratesData.rates[code as string] ?? null;

        const rand = Math.random() * (2000 - 1000) + 1000;

        const existingCountry = await countryRepo.findOne({
          where: { name: country.name },
        });

        const newCountry = countryRepo.create({
          name: country.name,
          capital: country.capital,
          region: country.region,
          population: country.population,
          currency_code: code,
          exchange_rate,
          estimated_gdp: exchange_rate
            ? (country.population * rand) / exchange_rate
            : 0,
          flag_url: country.flag,
          last_refreshed_at: new Date(),
        });

        if (existingCountry) {
          countryRepo.save({ ...existingCountry, ...newCountry });
        } else {
          countryRepo.save(newCountry);
        }

        countries.push(newCountry);
      }

      last_refreshed_at = new Date().toISOString();
      await generateSummaryImage(countries);

      return res.status(200).json(countries);
    }
  } catch (error) {
    console.error("post /countries: ", error);
    res.status(500).json({
      error: "Internal server error",
      details: JSON.stringify(error),
    });
  }
};

export const fetchCountries = async (req: Request, res: Response) => {
  try {
    const { region, currency_code, sort } = req.query;

    let query = countryRepo.createQueryBuilder("country");
    if (region) query = query.where("country.region = :region", { region });
    if (currency_code)
      query = query.andWhere("country.currency_code = :currency_code", {
        currency_code,
      });

    if (sort) {
      if (sort === "gdp_desc")
        query = query.orderBy("country.estimated_gdp", "DESC");
      else query = query.orderBy("country.estimated_gdp", "ASC");
    }

    const countries = await query.getMany();

    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      details: "Something went wrong, try again",
    });
  }
};

export const getCountry = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    if (!name)
      return res.status(400).json({
        error: "name not found",
        details: "Country name must be specified",
      });

    const country = await countryRepo.findOne({ where: { name } });

    if (!country)
      return res.status(404).json({
        error: "Country not found",
        details: `Country with name: ${name} is not found in the database`,
      });

    res.status(200).json(country);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      details: "Something went wrong, try again",
    });
  }
};

export const deleteCountry = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    if (!name)
      return res.status(400).json({
        error: "name not found",
        details: "Country name must be specified",
      });

    await countryRepo.delete({ name });

    res.status(204).end();
    // .json({ message: `Country ${name}'s data successfully deleted` });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      details: "Something went wrong, try again",
    });
  }
};

export const getStatus = async (_req: Request, res: Response) => {
  try {
    const count = await countryRepo.count();

    res.status(200).json({ total_countries: count, last_refreshed_at });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      details: "Something went wrong, try again",
    });
  }
};

export const getImageSummary = async (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync("cache/summary.png"))
      return res.status(404).json({ error: "Summary image not found" });

    res.sendFile("summary.png", { root: "cache" });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      details: "Something went wrong, try again",
    });
  }
};
