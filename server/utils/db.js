import { Sequelize } from 'sequelize';
import { useModels } from './models.js';
import { hashPassword } from './hash.js';

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
  const adminUser = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sequelize = await useDB();
  const { Users } = useModels(sequelize);
  // const NbrOfUsers = await Users.count();
  // if (NbrOfUsers > 0) {
  //   console.log('✅ Database already seeded');
  //   return false;
  // }
  // console.log('✅ Seeding database')
  const admin = await Users.findOne({ where: { email: adminUser } });
  if (!admin) {
    const hashedPassword = await hashPassword(adminPassword);
    await Users.create({
      username: adminUser,
      email: adminUser,
      password: hashedPassword,
      role: 'ADMIN',
    });
    console.log('✅ Admin user created');
    return true;
  }
  return false;
};