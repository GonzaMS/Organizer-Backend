export const EnvConfiguration = () => ({
  enviroment: process.env.NODE_ENV || 'dev',
  port: Number(process.env.PORT) || 3000,
  defaultLimit: Number(process.env.DEFAULT_LIMIT) || 10,
  offset: Number(process.env.OFFSET) || 0,
  // postgresqlHost: process.env.POSTGRESQL_HOST,
});
