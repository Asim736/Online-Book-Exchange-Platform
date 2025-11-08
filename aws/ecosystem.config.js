// PM2 Ecosystem Configuration
// Valid JS (remove '#' comments) for PM2 to parse with Node.
// Using cluster mode and pointing at server/index.js (Express entrypoint).

module.exports = {
  apps: [
    {
      name: 'bookexchange-api',
      script: 'index.js',                  // Server entrypoint
      cwd: '/var/www/bookexchange/server', // Keep cwd at server/ so dotenv loads ./server/.env
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
        // Other env vars are loaded from ./server/.env by dotenv
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: '/var/log/pm2/bookexchange-error.log',
      out_file: '/var/log/pm2/bookexchange-out.log',
      log_file: '/var/log/pm2/bookexchange-combined.log',
      time: true
    }
  ]
};