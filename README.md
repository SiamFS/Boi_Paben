# Boi Paben - Book Buy-and-Sell Community

## About
Boi Paben is a multi-vendor book marketplace where users can buy and sell books and communicate with each other. The platform supports both online payments through Stripe and Cash on Delivery (COD) options.

**Live Demo:** [https://cse471-project-frontend.onrender.com/](https://cse471-project-frontend.onrender.com/)

## Features
- User authentication with buyer and seller roles
- Book listing, browsing, and purchasing features
- Community features for user interaction
- Online payments via Stripe integration
- Cash on Delivery payment option

## Technology Stack
- Frontend: React, React Hooks
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: Firebase
- Payment: Stripe
- Deployment: Render

## Getting Started

### Prerequisites
- Node.js
- npm

### Installation

Clone the repository:
```bash
git clone https://github.com/SiamFS/Boi_Paben.git
cd Boi_Paben
```

The project has two main directories:
- `mern-client`: Frontend React application
- `mern-server`: Backend Node.js application

Install dependencies for both client and server:

```bash
# Install dependencies in the client directory
cd mern-client
npm install

# Install dependencies in the server directory
cd ../mern-server
npm install
```

### Running the Application

Start the client:
```bash
# In the mern-client directory
npm start
```

Start the server:
```bash
# In the mern-server directory
npm start
```

The client will be available at http://localhost:3000 and the server at http://localhost:5000 (or whatever port is configured).

### Starting from Root Directory

From the root directory, you can start both client and server using:
```bash
npm start
```

### Environment Variables
The application does not require setting up .env files as all necessary configurations are included in the code for testing purposes.

## Usage
- Register as a user
- Browse available books
- List your own books for sale
- Purchase books using Stripe or choose Cash on Delivery
- Communicate with other users regarding books

## Contact
- Email: siamferdous1@gmail.com
- GitHub: [SiamFS](https://github.com/SiamFS)
- LinkedIn: [Siam Ferdous](https://www.linkedin.com/in/siam-ferdous-75219b280/)
