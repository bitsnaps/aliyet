
export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Machines, Categories, Specifications } = models;

  try {
    const machines = await Machines.findAll({
      where: { available: true },
      include: [
        { 
          model: Categories,
          attributes: ['id', 'name', 'description', 'machine_type', 'metadata']
        },
        {
          model: Specifications,
          attributes: ['parameter', 'unit'],
          through: {
             attributes: ['value', 'sort_order']
          }
        }
      ],
      order: [['sort_order', 'ASC'], ['code', 'ASC'], [Specifications, models.MachineSpecifications, 'sort_order', 'ASC']]
    })

    const machinesData = machines.map(machine => {
      const m = machine.toJSON();
      if (m.Specifications) {
        m.Specifications = m.Specifications.map(s => ({
          ...s,
          value: s.MachineSpecifications?.value
        }));
      }
      return m;
    });

    return {
      success: true,
      data: machinesData
    }
  } catch (error) {
    console.error('Database fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
