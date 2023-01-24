// This file is used to initialize configuration && ENV variables
import { initDb } from '../db';
import { eventEmitter } from '../events';

export const initConfig = () => {
  const db = initDb('DB_URL HERE and pass to config object');
  return {
    db,
    eventEmitter,
    keepAliveTimeout: 60000,
    headersTimeout: 60000,
  };
};
