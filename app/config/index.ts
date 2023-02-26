// This file is used to initialize configuration && ENV variables
import { initDb } from '../db';

export const initConfig = () => {
  // Instantiate all things to add to ctx here
  const db = initDb('DB_URL HERE and pass to config object');

  return {
    ctx: {
      // add all things to use in ctx like db connections or mocks here
      db,
    },
    // add any env vars here
    keepAliveTimeout: 60000,
    headersTimeout: 60000,
  };
};
