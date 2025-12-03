import { Sequelize } from 'sequelize';
import { useModels } from './models';

/** @type {import('sequelize').Sequelize} */
let sequelizeInstance = null

/**
 * Initializes and returns the Singleton Sequelize instance
 * @returns {import('sequelize').Sequelize}
 */
export const useDB = async () => {
  if (sequelizeInstance) {
    return sequelizeInstance
  }

  // const config = useRuntimeConfig()
  const config = {
    db: {
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT
    }
  }

  const env = process.env.NODE_ENV || 'development'
  
  // Default options shared across environments
  // @type {import('sequelize').Options}
  const options = {
    logging: env === 'development' ? console.log : false,
    define: {
      // Enforce snake_case in DB columns to match ERD (e.g. categoryId -> category_id)
      underscored: true,
      // Disable timestamps if not present in ERD, or keep them if you want created_at/updated_at
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }

  // PRODUCTION: MySQL
  if (env === 'production') {
    sequelizeInstance = new Sequelize(
      config.db.name,
      config.db.user,
      config.db.password,
      {
        ...options,
        host: config.db.host,
        port: Number(config.db.port),
        dialect: 'mysql',
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    )
  }
  // TEST: SQLite Memory
  else if (env === 'test') {
    sequelizeInstance = new Sequelize('sqlite::memory:', {
      ...options,
      logging: false // Keep tests clean
    })
  }
  // DEVELOPMENT: MySQL
  else {
    sequelizeInstance = new Sequelize(
      config.db.name,
      config.db.user,
      config.db.password,
      {
        ...options,
        host: config.db.host,
        dialect: 'mysql'
      }
    )
    // Initialize models
    useModels(sequelizeInstance);
    // Sync all models
    await sequelizeInstance.sync({ alter: true });
  }

  // Test connection purely for logging purposes on startup
  try {
    await sequelizeInstance.authenticate();
    if (env === 'development') {
      console.log(`✅ DB Connected (${env})`);
    }
  } catch (err) {
    console.error('❌ DB Connection Error:', err);
  }
  return sequelizeInstance;
};

/**
 * Seeds the database with initial data, like an admin user.
 */
export const seedDatabase = async () => {
  const sequelize = await useDB();
  const { Users } = useModels(sequelize);
  // await Users.sync({ alter: true }); // No longer needed, sync is handled in useDB
  const admin = await Users.findOne({ where: { username: 'admin@aliyaat.com' } });
  if (!admin) {
    await Users.create({
      username: 'admin@aliyaat.com',
      password: 'password', // In a real app, this should be a hashed password
      role: 'ADMIN',
    });
    console.log('✅ Admin user created');
  }
};