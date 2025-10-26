# Country Data API

## Overview

This project is a robust backend service developed with TypeScript, Node.js, and Express, utilizing TypeORM for efficient data persistence with MySQL. It provides comprehensive country data, including population, capital, region, and dynamically calculated economic metrics like estimated GDP, by aggregating information from external APIs.

## Features

- **Country Data Aggregation**: Fetches and combines country details from `restcountries.com` and exchange rates from `open.er-api.com`.
- **Dynamic GDP Calculation**: Computes an estimated GDP for each country based on population and current exchange rates.
- **Data Persistence**: Stores and manages country information using TypeORM with a MySQL database.
- **Filtering & Sorting**: Offers API endpoints to retrieve countries based on region, currency code, and sort by estimated GDP.
- **Summary Image Generation**: Creates a visual summary of total countries and top GDP performers using `Jimp`.
- **API Endpoints**: Provides a well-structured RESTful API for data access and management.

## Getting Started

### Installation

To get this project up and running locally, follow these steps:

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/lexizuchenna/hng-server-2.git
    cd hng-server-2
    ```

2.  **Install Dependencies**:
    This project uses `pnpm` as its package manager.

    ```bash
    pnpm install
    ```

3.  **Database Setup**:
    Ensure you have a MySQL server running. The application will automatically synchronize the database schema on startup.

### Environment Variables

Create a `.env` file in the root directory and populate it with the following required variables:

- `PORT`: The port on which the server will run.
  - Example: `PORT=3000`
- `DB_HOST`: Your database host.
  - Example: `DB_HOST=localhost`
- `DB_PORT`: Your database port.
  - Example: `DB_PORT=3306`
- `DB_USER`: Your database username.
  - Example: `DB_USER=root`
- `DB_PASSWORD`: Your database password.
  - Example: `DB_PASSWORD=your_secure_password`
- `DB_NAME`: The name of your database.
  - Example: `DB_NAME=country_db`

### Running the Application

1.  **Development Mode**:
    To run the application in development mode with live reloading:

    ```bash
    pnpm dev
    ```

2.  **Production Mode**:
    First, build the TypeScript code:
    ```bash
    pnpm build
    ```
    Then, start the compiled application:
    ```bash
    pnpm start
    ```

## API Documentation

### Base URL

`http://localhost:[PORT]` (replace `[PORT]` with the value from your `.env` file)

### Endpoints

#### GET /

**Overview**: A basic health check endpoint that returns a "Hello World!" message.
**Request**:
No request body.

**Response**:

```json
"Hello World!"
```

**Errors**:

- `500 Internal Server Error`: An unexpected error occurred on the server.
  ```json
  {
    "message": "Internal sever error",
    "status": "failed",
    "error": {}
  }
  ```

#### GET /status

**Overview**: Retrieves the current status of the country data, including the total number of countries stored and the timestamp of the last data refresh.
**Request**:
No request body.

**Response**:

```json
{
  "total_countries": 250,
  "last_refreshed_at": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:

- `500 Internal Server Error`: An unexpected error occurred on the server.
  ```json
  {
    "error": "Internal server error",
    "details": "Something went wrong, try again"
  }
  ```

#### POST /countries/refresh

**Overview**: Triggers a full refresh of country data and exchange rates from external APIs, updating or inserting entries into the database. This also regenerates the summary image.
**Request**:
No request body.

**Response**:

```json
[
  {
    "id": 1,
    "name": "United States",
    "capital": "Washington, D.C.",
    "population": 331000000,
    "region": "Americas",
    "currency_code": "USD",
    "exchange_rate": 1.0,
    "estimated_gdp": 25000000000000.0,
    "flag_url": "https://restcountries.com/data/usa.svg",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Canada",
    "capital": "Ottawa",
    "population": 38000000,
    "region": "Americas",
    "currency_code": "CAD",
    "exchange_rate": 1.35,
    "estimated_gdp": 2000000000000.0,
    "flag_url": "https://restcountries.com/data/can.svg",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  }
]
```

_(Array of Country objects)_

**Errors**:

- `503 Service Unavailable`: An external data source (REST Countries API or Open Exchange Rates API) could not be reached or returned an error.
  ```json
  {
    "error": "External data source unavailable",
    "details": "Could not fetch data from REST Countries API"
  }
  ```
- `500 Internal Server Error`: An unexpected error occurred on the server during the refresh process.
  ```json
  {
    "error": "Internal server error",
    "details": "{ \"message\": \"Error details\" }"
  }
  ```

#### GET /countries

**Overview**: Retrieves a list of all stored countries. Supports filtering by `region` and `currency_code`, and sorting by `estimated_gdp`.
**Query Parameters**:

- `region` (Optional): Filter countries by their region.
  - Example: `?region=Europe`
- `currency_code` (Optional): Filter countries by their currency code.
  - Example: `?currency_code=EUR`
- `sort` (Optional): Sort countries by estimated GDP. Accepted values: `gdp_asc` for ascending, `gdp_desc` for descending.
  - Example: `?sort=gdp_desc`

**Request**:
No request body.

**Response**:

```json
[
  {
    "id": 1,
    "name": "United States",
    "capital": "Washington, D.C.",
    "population": 331000000,
    "region": "Americas",
    "currency_code": "USD",
    "exchange_rate": 1.0,
    "estimated_gdp": 25000000000000.0,
    "flag_url": "https://restcountries.com/data/usa.svg",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  }
]
```

_(Array of Country objects, filtered and/or sorted)_

**Errors**:

- `500 Internal Server Error`: An unexpected error occurred on the server.
  ```json
  {
    "error": "Internal server error",
    "details": "Something went wrong, try again"
  }
  ```

#### GET /countries/:name

**Overview**: Retrieves detailed information for a single country by its name.
**Path Parameters**:

- `name` (Required): The full name of the country.
  - Example: `/countries/Canada`

**Request**:
No request body.

**Response**:

```json
{
  "id": 2,
  "name": "Canada",
  "capital": "Ottawa",
  "population": 38000000,
  "region": "Americas",
  "currency_code": "CAD",
  "exchange_rate": 1.35,
  "estimated_gdp": 2000000000000.0,
  "flag_url": "https://restcountries.com/data/can.svg",
  "last_refreshed_at": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:

- `400 Bad Request`: The country `name` was not provided in the request path.
  ```json
  {
    "error": "name not found",
    "details": "Country name must be specified"
  }
  ```
- `404 Not Found`: No country with the specified `name` exists in the database.
  ```json
  {
    "error": "Country not found",
    "details": "Country with name: [name] is not found in the database"
  }
  ```
- `500 Internal Server Error`: An unexpected error occurred on the server.
  ```json
  {
    "error": "Internal server error",
    "details": "Something went wrong, try again"
  }
  ```

#### DELETE /countries/:name

**Overview**: Deletes a country from the database by its name.
**Path Parameters**:

- `name` (Required): The full name of the country to delete.
  - Example: `/countries/Canada`

**Request**:
No request body.

**Response**:
`204 No Content` (No response body on successful deletion).

**Errors**:

- `400 Bad Request`: The country `name` was not provided in the request path.
  ```json
  {
    "error": "name not found",
    "details": "Country name must be specified"
  }
  ```
- `500 Internal Server Error`: An unexpected error occurred on the server.
  ```json
  {
    "error": "Internal server error",
    "details": "Something went wrong, try again"
  }
  ```

#### GET /countries/image

**Overview**: Serves a dynamically generated image summarizing key country data, such as total countries and top GDP performers. The image is cached.
**Request**:
No request body.

**Response**:
`image/png` (A PNG image file stream).

**Errors**:

- `404 Not Found`: The summary image has not been generated yet or could not be found.
  ```json
  {
    "error": "Summary image not found"
  }
  ```
- `500 Internal Server Error`: An unexpected error occurred on the server while trying to serve the image.
  ```json
  {
    "error": "Internal server error",
    "details": "Something went wrong, try again"
  }
  ```

## Technologies Used

| Technology     | Description                                           |
| :------------- | :---------------------------------------------------- |
| **TypeScript** | Superset of JavaScript for type safety                |
| **Node.js**    | JavaScript runtime environment                        |
| **Express.js** | Fast, unopinionated web framework for Node.js         |
| **TypeORM**    | ORM for TypeScript and JavaScript                     |
| **MySQL**      | Relational database system                            |
| **Jimp**       | Image processing library for Node.js                  |
| **Axios**      | Promise-based HTTP client                             |
| **Dotenv**     | Loads environment variables from a `.env` file        |
| **Cors**       | Middleware for enabling Cross-Origin Resource Sharing |
| **Nodemon**    | Utility for automatically restarting Node.js app      |
| **pnpm**       | Fast, disk space efficient package manager            |

## Author Info

- **Alexander**

---

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeORM](https://img.shields.io/badge/TypeORM-E53428?style=for-the-badge&logo=typeorm&logoColor=white)](https://typeorm.io/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![PNPM](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)
