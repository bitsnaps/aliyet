import { seedDatabase } from '../../utils/db';

export default defineEventHandler(async (event) => {
    try {
        const result = await seedDatabase();
        return {
            status: 200,
            body: {
                message: result?'Database seeded successfully':'Database already seeded',
                result
            },
        }; 
    } catch (error) {
      return {
        status: 500,
        body: {
          message: `Unable to seed database: ${error?.message || error}`
        },
      };       
    }
   
});