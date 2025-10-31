export const EnvConfiguration = () => ({
  port: Number(process.env.PORT) || 3000,

  enviroment: process.env.NODE_ENV || 'dev',

  defaultLimit: Number(process.env.DEFAULT_LIMIT) || 10,

  offset: Number(process.env.OFFSET) || 0,

  jwtSecret: process.env.JWT_SECRET,

  databaseHost: process.env.POSTGRESQL_HOST,
  databasePort: Number(process.env.POSTGRESQL_PORT) || 5432,
  databaseUsername: process.env.POSTGRESQL_USER,
  databaseDatabase: process.env.POSTGRESQL_DB,
  databasePassword: process.env.POSTGRESQL_PASSWORD,
});
