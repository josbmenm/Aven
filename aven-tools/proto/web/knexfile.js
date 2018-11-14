module.exports = {
  development: {
    client: 'sqlite3',
    useNullAsDefault: true,
    migrations: {
      // err...
      directory: 'src/sync/aven-cloud-sql/migrations',
    },
    connection: {
      filename: 'cloud.sqlite',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'example',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};
