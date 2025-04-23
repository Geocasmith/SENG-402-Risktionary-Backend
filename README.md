## Backend for SENG402

## Name
Risktionary Backend

# How To Maintain
The app is hosted on the vm. 

#### Backend
If the game wont start (when you press start) then the backend is not working. The backend is hosted using a node process manager called pm2 which should theoretically run forever but sometimes it stops and you need to restart it. You can restart the backend using the following commands
pm2 restart "backend" --update-env

If that did not work or if it cannot find a pm2 instance to restart you need host a new isntance of the backend on pm2. Use the following commands to do this

```
cd backendpath
pm2 delete all
pm2 start npm --name "backend" -- run dev
```


#### Frontend
If you see an ubuntu/nginx error you need to restart the frontend. The frontend is hosted on nginx and the HTTPS SSL keys are managed by Certbot. Usually the problem is with nginx and it will need restarting,  but if it is with SSL then you will need to renew the certbot keys.
To restart the frontend run the following commands 
```
cd frontendpath
npm install
npm run build
sudo systemctl restart nginx
```


#### Do a full restart
Do a full restart using the following commands and hopefully it fixes the problem

```
cd backendpath
pm2 delete all
pm2 start npm --name "backend" -- run dev
cd frontendpath 
npm install
npm run build
sudo systemctl restart nginx
```


## Description
This repository serves as the backend for the Risktionary game. It handles the sockets, the logger and the storing of player votes and names.

The backend works with the frontend application.

## Prerequisites:
Node.js
npm

## Installation:
Clone the repository:
```
git clone https://github.com/Geocasmith/SENG-402-Risktionary-Backend.git
```

Navigate to the project directory:
```
cd 402-backend
```
Install dependencies:
```
npm install
```
Development:
Start the development server:
```
npm run dev
```

Production:
On the vm, start the production server:
```
npm start
```

Testing:
To run the unit tests:
```
npm test
```

## Configuration:

VM Development Environment: Runs the sockets securely over port 3001. Start with npm start

Local Machine Testing Environment: Runs the sockets over localhost. Start with npm run dev

## Technology Stack:
Node.js
TypeScript
Express.js
Socket.io
Jest for unit testing


## Authors and acknowledgment:
George Carr-Smith and Miguel Morales-Trujillo.

