// This file is used to initialize configuration && ENV variables
import { initDb } from '../db';

export const initConfig = () => {
  const db = initDb('DB_URL HERE and pass to config object');
  return {
    db,
  };
};
