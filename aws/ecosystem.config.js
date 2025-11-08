// PM2 Ecosystem Configuration
// Valid JS (remove '#' comments) for PM2 to parse with Node.
// Using cluster mode and pointing at server/index.js (Express entrypoint).

module.exports = {
  apps: [
    {
      name: 'bookexchange-api',
      script: 'server/index.js',            // Entry script relative to cwd
      cwd: '/var/www/bookexchange',        // Project root on EC2 (adjust if different)
      instances: 1,                        // Can change to 'max' later if needed
      exec_mode: 'fork',                   // Use 'cluster' if you want multi-process
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',          // Lower for quicker restarts on leaks
      env: {
        NODE_ENV: 'production',
        PORT: 5001
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