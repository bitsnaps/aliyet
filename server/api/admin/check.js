import { useDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
    try {
        const sequelize = await useDB();
        await sequelize.authenticate();
        return {
            status: 200,
            body: {
                message: 'Connection has been established successfully.'
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