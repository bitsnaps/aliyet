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
      // await sequelize.authenticate();
      // console.log('Connection has been established successfully.');
    } catch (error) {
      return {
        status: 500,
        body: {
          message: `Unable to connect to the database: ${error?.message || error}`
        },
      };       
    }
   
});