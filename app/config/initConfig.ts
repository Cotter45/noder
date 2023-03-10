// This file is used to initialize configuration && ENV variables
import { initDb } from './initDb';

export const initConfig = () => {
  // Instantiate all things to add to ctx here, example db connection pool
  const db = initDb('DB_URL HERE and pass to config object');

  const env = process.env.NODE_ENV || 'development';
  const boolenv = ['development', 'test'].includes(env);

  return {
    ctx: {
      // add all things to use in ctx like db connections or mocks here
      db,
    },
    // Server settings, defaults are shown
    logger: boolenv,
    // logger: false,
    // fileServer: false,,
    // port: 8000,
    // host: '0.0.0.0',
  };
};
