import { defineEventHandler, createError } from 'h3';
import { useDB } from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const { models } = await useDB();
    const { Machines, ClientConfigSets, Users } = models;

    // Fetch stats in parallel
    const [machinesCount, quotesCount, customersCount] = await Promise.all([
      Machines.count(),
      ClientConfigSets.count(),
      Users.count({ where: { role: 'CUSTOMER' } })
    ]);

    // Fetch 5 most recent quotes
    const recentQuotes = await ClientConfigSets.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Users,
          attributes: ['id', 'name', 'email', 'username']
        },
        {
          model: Machines,
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    return {
      success: true,
      stats: {
        machines: machinesCount,
        quotes: quotesCount,
        customers: customersCount
      },
      recentQuotes: recentQuotes.map(q => {
        // Handle both standard and dataValues access for different environments/Sequelize versions
        const user = q.User || q.user || q.dataValues?.User || q.dataValues?.user;
        const machine = q.Machine || q.machine || q.dataValues?.Machine || q.dataValues?.machine;
        
        return {
          id: q.id,
          client: user?.name || user?.username || 'Unknown',
          machine: machine?.name || 'Unknown',
          date: q.createdAt || q.dataValues?.created_at || q.created_at,
          status: q.metadata?.status || 'New'
        };
      })
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});