import { defineEventHandler, readBody } from 'h3';
import { Sequelize } from 'sequelize';
import { useModels } from '../../utils/models';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { username, password, alter } = body;

    try {

      // Initialize a new sequelize instance
      const sequelizeInstance = new Sequelize(
            process.env.DB_NAME,
            username,
            password,
            {
              logging: false,
              define: {
                // Enforce snake_case in DB columns to match ERD (e.g. categoryId -> category_id)
                underscored: true,
                // Enabled timestamps if you want created_at/updated_at
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at'
              },
              host: process.env.DB_HOST,
              port: Number(process.env.DB_PORT),
              dialect: 'mysql',
              pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
              }
            }
      )

      // Initialize models
      useModels(sequelizeInstance);
      // Sync all models
      await sequelizeInstance.sync({ alter });

      return {
        status: 200,
        body: {
          message: `DB initilizatied successfully!`
        },
      }; 
    } catch (error) {
      return {
        status: 500,
        body: {
          message: `Unable to connect to the database: ${error?.message || error}`
        },
      };       
    }
   
});