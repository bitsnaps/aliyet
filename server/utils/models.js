import { DataTypes } from 'sequelize';
// import { useDB } from './db'; // No longer needed, breaks with circular dependency

// Helper to prevent re-initialization
let modelsLoaded = false
const models = {}

export const useModels = (sequelize) => {
  if (modelsLoaded && !sequelize) return models;
  if (modelsLoaded && sequelize) {
    console.warn('Models already loaded, but a new sequelize instance was provided.');
  }
  if (!sequelize) {
    throw new Error('Sequelize instance must be provided to useModels');
  }

  const Categories = sequelize.define('Categories', {
    name: { type: DataTypes.STRING(191), unique: true, allowNull: false },
    description: { type: DataTypes.STRING },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      note: 'Stores the extra data as a JSON blob',
      get() {
        const value = this.getDataValue('metadata');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('metadata', value ? JSON.stringify(value) : null);
      },
    }
  })

  const ConfigCategories = sequelize.define('ConfigCategories', {
    name: { type: DataTypes.STRING(191), unique: true, allowNull: false },
    description: { type: DataTypes.STRING }
  })

  // --- 2. Machine Core ---

  const Machines = sequelize.define('Machines', {
    code: { type: DataTypes.STRING(191), unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    url: { type: DataTypes.STRING },
    base_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    available: { type: DataTypes.BOOLEAN, defaultValue: true },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      note: 'Stores the extra data as a JSON blob',
      get() {
        const value = this.getDataValue('metadata');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('metadata', value ? JSON.stringify(value) : null);
      },
    }
  })

  const Specifications = sequelize.define('Specifications', {
    parameter: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.STRING, allowNull: false },
    unit: { type: DataTypes.STRING, allowNull: true },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 }
  })

  // --- 3. Configuration & Options ---

  const Configurations = sequelize.define('Configurations', {
    name: { type: DataTypes.STRING(191), unique: true, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    available: { type: DataTypes.BOOLEAN, defaultValue: true },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      note: 'Stores the extra data as a JSON blob',
      get() {
        const value = this.getDataValue('metadata');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('metadata', value ? JSON.stringify(value) : null);
      },
    }
  })

  const OptionalAdditions = sequelize.define('OptionalAdditions', {
    name: { type: DataTypes.STRING(191), unique: true, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    available: { type: DataTypes.BOOLEAN, defaultValue: true },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      note: 'Stores the extra data as a JSON blob',
      get() {
        const value = this.getDataValue('metadata');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('metadata', value ? JSON.stringify(value) : null);
      },
    }
  })

  const OptionalReplacements = sequelize.define('OptionalReplacements', {
    name: { type: DataTypes.STRING(191), unique: true, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    available: { type: DataTypes.BOOLEAN, defaultValue: true },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      note: 'Stores the extra data as a JSON blob',
      get() {
        const value = this.getDataValue('metadata');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('metadata', value ? JSON.stringify(value) : null);
      },
    }
  })

  // --- 4. Users & Client Sets ---

  const Users = sequelize.define('Users', {
    username: { type: DataTypes.STRING(191), unique: true, allowNull: false },
    email: { type: DataTypes.STRING(191), unique: false, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'CUSTOMER' }, // ADMIN, SALES, CUSTOMER
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      note: 'Stores the extra data as a JSON blob',
      get() {
        const value = this.getDataValue('metadata');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('metadata', value ? JSON.stringify(value) : null);
      },
    }
  })

  const ClientConfigSets = sequelize.define('ClientConfigSets', {
    name: { type: DataTypes.STRING }, // e.g., 'Quote for ACME'
    notes: { type: DataTypes.TEXT },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      note: 'Stores the extra data as a JSON blob',
      get() {
        const value = this.getDataValue('metadata');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('metadata', value ? JSON.stringify(value) : null);
      },
    }
  })

  // --- 5. Junction Tables (Explicit Definition for Metadata/Ordering) ---

  const ConfigCategoryConfigurations = sequelize.define('ConfigCategoryConfigurations', {
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 }
  })

  const ConfigOptionalCompatibility = sequelize.define('ConfigOptionalCompatibility', {
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 }
  })

  const ReplacementCompatibility = sequelize.define('ReplacementCompatibility', {})
  const ConfigSetConfigurations = sequelize.define('ConfigSetConfigurations', {})
  const ConfigSetOptionalAdditions = sequelize.define('ConfigSetOptionalAdditions', {})
  const ConfigSetReplacements = sequelize.define('ConfigSetReplacements', {})


  // ================= ASSOCIATIONS =================

  // Categories -> Machines
  Categories.hasMany(Machines, { foreignKey: 'category_id' })
  Machines.belongsTo(Categories, { foreignKey: 'category_id' })

  // ConfigCategories -> Machines (Scope)
  ConfigCategories.hasMany(Machines, { foreignKey: 'config_category_id' })
  Machines.belongsTo(ConfigCategories, { foreignKey: 'config_category_id' })

  // Machines -> Specifications
  Machines.hasMany(Specifications, { foreignKey: 'machine_id' })
  Specifications.belongsTo(Machines, { foreignKey: 'machine_id' })

  // Config Categories <-> Configurations (Many-to-Many with Order)
  ConfigCategories.belongsToMany(Configurations, { through: ConfigCategoryConfigurations, foreignKey: 'config_category_id' })
  Configurations.belongsToMany(ConfigCategories, { through: ConfigCategoryConfigurations, foreignKey: 'configuration_id' })

  // Config Categories <-> Optional Additions (Many-to-Many with Order)
  ConfigCategories.belongsToMany(OptionalAdditions, { through: ConfigOptionalCompatibility, foreignKey: 'config_category_id' })
  OptionalAdditions.belongsToMany(ConfigCategories, { through: ConfigOptionalCompatibility, foreignKey: 'optional_addition_id' })

  // Configurations <-> Optional Replacements (Compatibility)
  Configurations.belongsToMany(OptionalReplacements, { through: ReplacementCompatibility, foreignKey: 'configuration_id' })
  OptionalReplacements.belongsToMany(Configurations, { through: ReplacementCompatibility, foreignKey: 'optional_replacement_id' })

  // Users -> ClientConfigSets
  Users.hasMany(ClientConfigSets, { foreignKey: 'user_id' })
  ClientConfigSets.belongsTo(Users, { foreignKey: 'user_id' })

  // Machines -> ClientConfigSets
  Machines.hasMany(ClientConfigSets, { foreignKey: 'machine_id' })
  ClientConfigSets.belongsTo(Machines, { foreignKey: 'machine_id' })

  // ClientConfigSets <-> Configurations (Selections)
  ClientConfigSets.belongsToMany(Configurations, { through: ConfigSetConfigurations, foreignKey: 'config_set_id' })
  Configurations.belongsToMany(ClientConfigSets, { through: ConfigSetConfigurations, foreignKey: 'configuration_id' })

  // ClientConfigSets <-> Optional Additions (Selections)
  ClientConfigSets.belongsToMany(OptionalAdditions, { through: ConfigSetOptionalAdditions, foreignKey: 'config_set_id' })
  OptionalAdditions.belongsToMany(ClientConfigSets, { through: ConfigSetOptionalAdditions, foreignKey: 'optional_addition_id' })

  // ClientConfigSets <-> Replacements (Selections)
  ClientConfigSets.belongsToMany(Configurations, { as: 'ReplacedConfig', through: ConfigSetReplacements, foreignKey: 'config_set_id' }) 
  // Note: The ERD relation for replacements in sets is slightly complex. 
  // It usually tracks: The Set, The Original Config, and The Replacement.
  // Standard M:N fits loosely, but usually handled by storing the replacement ID directly.
  // Based on strict ERD:
  ClientConfigSets.belongsToMany(OptionalReplacements, { through: ConfigSetReplacements, foreignKey: 'config_set_id' })
  OptionalReplacements.belongsToMany(ClientConfigSets, { through: ConfigSetReplacements, foreignKey: 'optional_replacement_id' })

  // Assign to object
  Object.assign(models, {
    Categories,
    ConfigCategories,
    Machines,
    Specifications,
    Configurations,
    OptionalAdditions,
    OptionalReplacements,
    Users,
    ClientConfigSets,
    // Junctions (Useful for direct queries)
    ConfigCategoryConfigurations,
    ConfigOptionalCompatibility,
    ReplacementCompatibility,
    ConfigSetConfigurations,
    ConfigSetOptionalAdditions,
    ConfigSetReplacements
  })

  modelsLoaded = true
  return models;
}