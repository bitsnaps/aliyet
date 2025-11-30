import { Sequelize } from 'sequelize';

/** @type {import('sequelize').Sequelize} */
let sequelizeInstance = null

/**
 * Initializes and returns the Singleton Sequelize instance
 * @returns {import('sequelize').Sequelize}
 */
export const useDB = () => {
  if (sequelizeInstance) {
    return sequelizeInstance
  }

  const config = useRuntimeConfig()
  const env = process.env.NODE_ENV || 'development'
  
  // Default options shared across environments
  /** @type {import('sequelize').Options} */
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
  // DEVELOPMENT: SQLite File (or MySQL if configured)
  else {
    if (config.db.dialect === 'mysql') {
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
    } else {
      sequelizeInstance = new Sequelize({
        ...options,
        dialect: 'sqlite',
        storage: config.db.storage
      })
    }
  }

  // Test connection purely for logging purposes on startup
  sequelizeInstance.authenticate()
    .then(() => {
      if (env === 'development') console.log(`✅ DB Connected (${env})`)
    })
    .catch(err => {
      console.error('❌ DB Connection Error:', err)
    })

  return sequelizeInstance
}