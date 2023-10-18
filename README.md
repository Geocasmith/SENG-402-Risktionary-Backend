## Backend for SENG402

## Name
Risktionary Backend

## Description
This repository serves as the backend for the Risktionary game. It handles the sockets, the logger and the storing of player votes and names.

The backend works with the frontend application.

## Prerequisites:
Node.js
npm

## Installation:
Clone the repository:
```
git clone https://eng-git.canterbury.ac.nz/gca73/402-backend.git
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

Configuration:

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

