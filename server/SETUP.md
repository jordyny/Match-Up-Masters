
In order for the app to run, please start the following two servers:

To setup the backend server, run the following commands:

Navigate to the server directory:
cd server

Install dependencies:
npm install

Run the server:
npm start



To setup the frontend server, run the following commands:

Navigate to the frontend directory:
cd song-riff-app

Install dependencies:
npm install

Run the server:
npm run dev -- --host 127.0.0.1 --port 5173


NOTE:
If you get an error about the port being in use, you can try running the server on a different port by running the following command:
npm run dev -- --host 127.0.0.1 --port 5174

Ensure that this port matches the one listed in the .env file in the frontend directory.
