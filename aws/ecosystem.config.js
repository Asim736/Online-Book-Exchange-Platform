# PM2 Ecosystem Configuration
# This file configures PM2 for process management

module.exports = {
  apps: [{
    name: 'bookexchange-server',
    script: 'index.js',
    cwd: '/var/www/bookexchange/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
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
  }]
};