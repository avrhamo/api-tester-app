# API Tester Desktop Application

## Overview

API Tester is a powerful desktop application designed for testing APIs on a large scale, with a focus on MongoDB integration. It allows developers and QA teams to configure, execute, and analyze API tests using data from MongoDB collections.

## Features

- **MongoDB Integration**: Connect to MongoDB databases and select specific collections for testing.
- **Curl Command Parsing**: Input and parse curl commands to configure API requests.
- **Field Mapping**: Map curl command fields (URL parameters, headers, body) to MongoDB collection fields.
- **Flexible Test Configuration**: Configure test parameters including request count and execution mode.
- **JWT and Encoded Enrichments**: Handle JWT tokens and encoded enrichments in headers.
- **Test Execution**: Run API tests with data dynamically populated from MongoDB.
- **Results Viewing**: Analyze test results including response codes, times, and errors.
- **Modern UI**: Intuitive interface built with React and Material-UI.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/api-tester-app.git
   ```
2. Navigate to the project directory:
   ```
   cd api-tester-app
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Start the application:
   ```
   npm start
   ```
2. Connect to your MongoDB database using the connection string.
3. Select the desired database and collection.
4. Enter a curl command representing the API you want to test.
5. Map the curl command fields to your MongoDB collection fields.
6. Configure test parameters.
7. Execute the tests and view the results.

## Development

- Built with Electron and React.
- Uses Material-UI for the user interface.
- Implements IPC for communication between Electron main and renderer processes.

To run in development mode:
```
npm run dev
```

## Building

To build the application for production:
```
npm run build
```

This will create distributable packages for your platform.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)

## Support

If you encounter any problems or have any questions, please open an issue in the GitHub repository.