function getEnv(n) {
  return process.env[n];
}

module.exports = {
  testing: {
    client: 'pg',
    connection:
      'postgresql://postgres:aven-test-password@localhost:5432/postgres',
  },
  production: {
    client: 'pg',
    connection: {
      ssl: !!getEnv('SQL_USE_SSL'),
      user: getEnv('SQL_USER'),
      password: getEnv('SQL_PASSWORD'),
      database: getEnv('SQL_DATABASE'),
      host: getEnv('SQL_HOST'),
    },
  },
};
