module.exports = {
  apps: [
    {
      name: 'Bender',
      script: 'bender/BenderServer.js',
      cwd: '',
      args: '',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
