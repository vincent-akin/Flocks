module.exports = {
  apps: [
    {
      name: 'flocks-api',
      script: './src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true
    }
  ]
};