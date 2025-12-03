// import { useDB } from '../utils/db';

export default defineEventHandler(async (event) => {
    try {
        // const sequelize = await useDB();
        // await sequelize.authenticate();
        return {
            timestamp: new Date().toISOString(),
            // db: true
        };
    } catch (error) {
        console.error('Health check failed:', error);
        // Set a 503 status code to indicate a service is unavailable
        event.node.res.statusCode = 503;
        return {
            timestamp: new Date().toISOString(),
            // db: false,
            error: `Connection failed: ${error || 'Unknown error'}`
        };
    }
});