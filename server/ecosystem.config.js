module.exports = {
  apps: [
    {
      name: 'bookexchange-api',
      script: 'index.js',
      cwd: '/var/www/bookexchange/server',
      // Ensure env is present for both PM2 and Node process
      env_file: '/var/www/bookexchange/server/.env',
      node_args: '-r dotenv/config',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '350M',
      time: true,
      error_file: '/var/www/bookexchange/server/logs/pm2-error.log',
      out_file: '/var/www/bookexchange/server/logs/pm2-out.log',
      merge_logs: true
    }
  ]
};
