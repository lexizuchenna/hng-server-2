import express from "express";
import {
  deleteCountry,
  fetchCountries,
  getCountry,
  getImageSummary,
  refreshCountries,
} from "../controller/country";

const router = express.Router();

router.post("/refresh", refreshCountries);
router.get("/image", getImageSummary);
router.get("/:name", getCountry);
router.delete("/:name", deleteCountry);
router.get("/", fetchCountries);

export default router;
