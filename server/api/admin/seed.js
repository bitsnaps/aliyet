import { seedDatabase } from '../../utils/db';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { username, password } = body;  
    try {
        // Check if username & password are provided and match the env variables
        if (username !== process.env.DB_USER || (process.env.DB_PASSWORD && password !== process.env.DB_PASSWORD)) {
            throw new Error('Invalid credentials');
        }       
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