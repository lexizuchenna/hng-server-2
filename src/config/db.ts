import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { Country } from "../entities/Country";

dotenv.config();

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [Country],
});

const connectDB = async () => {
  try {
    await AppDataSource.initialize();

    console.log("DB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export { AppDataSource };

export default connectDB;
