# 📚 Book Exchange Platform - MERN Stack# book-exchange-platform/README.md



A modern, full-stack web application for book exchange built with the MERN stack (MongoDB, Express.js, React, Node.js).# Online Book Exchange Platform - currently working on - 4



## ✨ Features

Welcome to the Online Book Exchange Platform! This project is a web-based application that allows users to exchange books with one another. Users can create accounts, log in, upload books they want to exchange, and browse available books.

- 🔐 **User Authentication** - Secure login and registration

- 📚 **Book Management** - List, search, and manage books## Features

- 💬 **Real-time Messaging** - Chat with other users

- 📱 **Mobile Responsive** - Works on all devices- User authentication (login and registration)

- 🔄 **Request System** - Send and manage book exchange requests- Upload and manage book listings

- 🎯 **Smart Search** - Find books by title, author, or genre- Search for books

- 📸 **Image Upload** - Upload book photos- User profiles displaying listed books

- ⭐ **Wishlist** - Save books for later

## Technologies Used

## 🚀 Quick Start

- **Frontend**: HTML5, CSS3, JavaScript (React.js)

### Prerequisites- **Backend**: Node.js with Express.js

- Node.js 18+- **Database**: MongoDB

- MongoDB (local or Atlas)

- Git## Project Structure



### Installation```

```bashbook-exchange-platform

# Clone the repository├── client

git clone https://github.com/yourusername/your-repo-name.git│   ├── public

cd your-repo-name│   │   └── index.html

│   ├── src

# Install server dependencies│   │   ├── components

cd server│   │   │   ├── Auth

npm install│   │   │   │   ├── Login.js

│   │   │   │   └── Register.js

# Install client dependencies  │   │   │   ├── Books

cd ../client│   │   │   │   ├── BookCard.js

npm install│   │   │   │   ├── BookList.js

│   │   │   │   └── BookUpload.js

# Setup environment variables (see guide/README.md for details)│   │   │   ├── Common

# Start the application (see guide/README.md for full instructions)│   │   │   │   ├── Header.js

```│   │   │   │   ├── Footer.js

│   │   │   │   └── SearchBar.js

## 📁 Project Structure│   │   │   └── Profile

│   │   │       └── UserProfile.js

```│   │   ├── contexts

📂 Book Exchange Platform/│   │   │   └── AuthContext.js

├── 📁 client/           # React frontend│   │   ├── styles

├── 📁 server/           # Node.js backend│   │   │   └── index.css

├── 📁 aws/             # AWS deployment files│   │   ├── App.js

├── 📁 guide/           # Documentation & guides│   │   └── index.js

├── 📄 amplify.yml      # AWS Amplify config│   └── package.json

├── 📄 setup.sh         # Quick setup script├── server

└── 📄 LICENSE          # MIT License│   ├── controllers

```│   │   ├── authController.js

│   │   ├── bookController.js

## 📖 Documentation│   │   └── userController.js

│   ├── models

All detailed documentation is in the `guide/` folder:│   │   ├── Book.js

│   │   ├── Transaction.js

- **[📋 Complete Setup Guide](guide/README.md)** - Detailed installation and setup│   │   └── User.js

- **[🌐 GitHub Upload Guide](guide/GITHUB_UPLOAD_GUIDE.md)** - How to upload to GitHub│   ├── routes

- **[📚 Git Guide](guide/GIT_GUIDE.md)** - Complete Git tutorial│   │   ├── auth.js

- **[☁️ AWS Deployment Guide](guide/AWS_DEPLOYMENT_GUIDE.md)** - Production deployment│   │   ├── books.js

│   │   └── users.js

## 🛠️ Technology Stack│   ├── middleware

│   │   └── auth.js

### Frontend│   ├── config

- **React 18** - Modern UI library│   │   └── db.js

- **Vite** - Fast build tool│   ├── app.js

- **React Router** - Client-side routing│   └── package.json

- **Axios** - HTTP client├── .env

- **Lucide React** - Modern icons├── .gitignore

└── README.md

### Backend```

- **Node.js** - JavaScript runtime

- **Express.js** - Web framework## Getting Started

- **MongoDB** - NoSQL database

- **Mongoose** - MongoDB ODM1. **Clone the repository**

- **JWT** - Authentication   ```bash

- **bcryptjs** - Password hashing   git clone https://github.com/yourusername/your-repo-name.git

   cd your-repo-name

### Deployment   ```

- **AWS Amplify** - Frontend hosting

- **AWS EC2** - Backend hosting2. Navigate to the client directory and install dependencies:

- **MongoDB Atlas** - Cloud database   ```

   cd client

## 🏃‍♂️ Development   npm install

   ```

```bash

# Start backend server (port 5001)3. Navigate to the server directory and install dependencies:

cd server && npm run dev   ```

   cd ../server

# Start frontend server (port 5173)   npm install

cd client && npm run dev   ```

```

4. Set up your environment variables in the `.env` file.

## 🌐 Live Demo

5. Start the server:

*[coming soon (working on it)]*   ```

   node app.js

## 🤝 Contributing   ```



1. Fork the repository6. Start the client:

2. Create a feature branch (`git checkout -b feature/amazing-feature`)   ```

3. Commit your changes (`git commit -m 'Add some amazing feature'`)   cd ../client

4. Push to the branch (`git push origin feature/amazing-feature`)   npm start

5. Open a Pull Request   ```



## 📝 License## Contributing



This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.Feel free to submit issues or pull requests to improve the project!

## 👨‍💻 Author

**Your Name**
- GitHub: [Asim736](https://github.com/Asim736)

---

⭐ **If you found this project helpful, please give it a star!**

## Amplify Hosting: SPA rewrites to fix 404 on deep links

If you navigate directly to a client-side route like `https://www.exchangebook.me/browse/` and see a `404 (Not Found)` for the document request (often after a `301` to add a trailing slash), your host is trying to fetch a static file at `/browse/` instead of serving `index.html` and letting React Router handle routing.

Fix this by adding Rewrites & Redirects in AWS Amplify Hosting (Console → Your app → Hosting → Rewrites and redirects):

1) Catch‑all rewrite for SPA
- Source address: `/<*>`
- Target address: `/index.html`
- Type: `200 (Rewrite)`

2) Optional: normalize trailing slash for top-level routes
- Source address: `/browse/`
- Target address: `/browse`
- Type: `301 (Permanent redirect)`

Notes:
- The rewrite must be handled by the host; client-side code cannot intercept a 404 before the bundle loads.
- After adding the rules, direct navigation to any route (e.g., `/browse`, `/books/123`) should load `index.html` with a 200 and render correctly.
- This repo also maps both `/browse` and `/browse/*` in `App.jsx` to tolerate trailing slashes once the host serves the SPA shell.
