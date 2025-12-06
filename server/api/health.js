import { useDB } from '../utils/db';
import { useModels } from '../utils/models';

export default defineEventHandler(async (event) => {
    try {
        const { sequelize, models } = await useDB();
        await sequelize.authenticate();
        const { Users } = models;
        const user = await Users.findOne({ where: { username: process.env.ADMIN_EMAIL || 'admin@aliyaat.com'} });
        return {
            timestamp: new Date().toISOString(),
            db: true,
            admin: user ? true : false,
        };
    } catch (error) {
        // Set a 503 status code to indicate a service is unavailable
        event.node.res.statusCode = 503;
        return {
            timestamp: new Date().toISOString(),
            db: false,
            error: `Connection failed: ${error.message || error || 'Unknown error'}`
        };
    }
});