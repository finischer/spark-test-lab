# Spark Test Lab

Welcome to **Spark Test Lab**! This repository hosts a web application designed to provide an interactive interface for generating test data for Apache Spark DataFrames and extracting the corresponding Spark schema from the input data.

## Features

- **Interactive Data Input:** Enter your test data in JSON format and see the corresponding Spark schema generated in real-time.
- **Spark Schema Extraction:** Automatically infer Spark-compatible schemas from the provided data.
- **User-Friendly Interface:** Simple and intuitive UI for quickly creating and validating test data for Spark.
- **Web-Based Solution:** No setup or installations required—everything is available directly from the website.

## Getting Started

The web application is live and can be accessed at the following URL:

[Link to the Spark Test Lab Website](https://spark-test-lab.vercel.app/)

### Local Development

To run the project locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/finischer/spark-test-lab.git
   cd spark-test-lab
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

### Project Structure

- **/src** – Contains the main source code for the ReactJS application.
- **/components** – Reusable UI components, such as the text area for input and the schema display.
- **/utils** – Utility functions for processing JSON input and inferring Spark schemas.

## Usage

1. Open the app in your browser.
2. Paste your JSON test data into the input field.
3. The corresponding Spark schema will be displayed in real-time in the output field.
4. You can edit the JSON input and see the schema update instantly.

## Contributing

Contributions are welcome! If you find any issues or have ideas for new features, feel free to open an issue or submit a pull request. Please follow the [contributing guidelines](CONTRIBUTING.md).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

**Spark Test Lab** provides a quick and easy way to work with Spark DataFrames and their schemas through an intuitive web interface.
