# React App

This is a React app that interacts with a server using the Fetch API and WebSocket.

## Project Structure

The project has the following files:

- `public/index.html`: This file is the HTML template for the React app. It includes the root element where the React components will be rendered.

- `src/components/Room.tsx`: This file exports a React component `Room` that represents the room page. It handles the logic for creating a room, opening a WebSocket connection, and displaying the latest JSON string returned in WebSocket messages.

- `src/services/api.ts`: This file exports a function `createRoom` that makes a POST request to the server's `/create-room` endpoint using the Fetch API. It sends the necessary data to create a room.

- `src/services/websocket.ts`: This file exports a function `openWebSocket` that opens a WebSocket connection to the created room. It handles receiving WebSocket messages and parsing the JSON string.

- `src/App.tsx`: This file is the entry point of the React app. It sets up the routes and renders the `Room` component.

- `src/index.tsx`: This file is the entry point for the React app. It renders the `App` component into the root element of the HTML template.

- `src/react-app-env.d.ts`: This file contains type declarations for the React app.

- `tsconfig.json`: This file is the configuration file for TypeScript. It specifies the compiler options and the files to include in the compilation.

- `package.json`: This file is the configuration file for npm. It lists the dependencies and scripts for the project.

## Getting Started

To run the app, follow these steps:

1. Install the dependencies by running `npm install` in the project root directory.

2. Start the development server by running `npm start`.

3. Open your browser and navigate to `http://localhost:3000` to see the app in action.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
```

Please note that the `LICENSE` file mentioned in the README should be created separately with the appropriate license text.