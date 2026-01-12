import { Sequelize } from 'sequelize';
import { useModels } from './models.js';
import { hashPassword } from './hash.js';

/** @type {import('sequelize').Sequelize} */
let sequelizeInstance = null

/**
 * Initializes and returns the Singleton Sequelize instance and models
 * @returns {{sequelize: import('sequelize').Sequelize, models: object}}
 */
export const useDB = async () => {
  if (sequelizeInstance) {
    return { sequelize: sequelizeInstance, models: useModels() };
  }

  const config = {
    db: {
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT
    }
  };

  const env = process.env.NODE_ENV || 'development';

  const options = {
    logging: env === 'development' ? console.log : false,
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  };

  if (env === 'production') {
    sequelizeInstance = new Sequelize(config.db.name, config.db.user, config.db.password, {
      ...options,
      host: config.db.host,
      port: Number(config.db.port),
      dialect: 'mysql',
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    });
  } else if (env === 'test') {
    sequelizeInstance = new Sequelize('sqlite::memory:', {
      ...options,
      logging: false
    });
  } else {
    sequelizeInstance = new Sequelize(config.db.name, config.db.user, config.db.password, {
      ...options,
      host: config.db.host,
      dialect: 'mysql'
    });
  }

  // Initialize models
  const models = useModels(sequelizeInstance);

  try {
    // Sync all models in dev or test
    if (env !== 'production') {
      await sequelizeInstance.sync({ alter: env === 'development', 
        // force: true // to avoid index accumulation.
      });
    }

    await sequelizeInstance.authenticate();
    if (env === 'development') {
      console.log(`✅ DB Connected (${env})`);
    }
  } catch (err) {
    console.error('❌ DB Error:', err);
  }

  return { sequelize: sequelizeInstance, models };
};

/**
 * Seeds the database with initial data, like an admin user.
 */
export const seedDatabase = async () => {
  const adminUser = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const { sequelize, models } = await useDB();
  const { Users, ConfigCategories, Configurations, ConfigCategoryConfigurations } = models;
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

  // --- Seed Configuration Associations (Fix for missing associations in production) ---
  // Check if we have the "Spindle Config Group" and associated configs but no links
  const configCategory = await ConfigCategories.findByPk(1);
  if (configCategory) {
    const configs = await Configurations.findAll({ where: { id: [1, 2] } });
    if (configs.length > 0) {
      const existingAssociations = await ConfigCategoryConfigurations.count({
        where: { config_category_id: 1, configuration_id: [1, 2] }
      });

      if (existingAssociations === 0) {
        console.log('⚠️ Missing configuration associations found. Seeding now...');
        const associations = [
          { config_category_id: 1, configuration_id: 1, sort_order: 0 },
          { config_category_id: 1, configuration_id: 2, sort_order: 1 }
        ];
        await ConfigCategoryConfigurations.bulkCreate(associations);
        console.log('✅ Configuration associations seeded');
      }
    }
  }

  return false;
};