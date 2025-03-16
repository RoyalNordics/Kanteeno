const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// MongoDB connection (for flexible document data)
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kanteeno', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// PostgreSQL connection (for relational data)
const sequelize = new Sequelize(
  process.env.PG_DATABASE || 'kanteeno',
  process.env.PG_USER || 'postgres',
  process.env.PG_PASSWORD || 'postgres',
  {
    host: process.env.PG_HOST || 'localhost',
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectPostgreSQL = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL Connection has been established successfully.');
    return sequelize;
  } catch (error) {
    logger.error(`Unable to connect to PostgreSQL database: ${error.message}`);
    process.exit(1);
  }
};

// Connect to both databases
const connectDB = async () => {
  await connectMongoDB();
  await connectPostgreSQL();
};

module.exports = {
  connectDB,
  connectMongoDB,
  connectPostgreSQL,
  sequelize,
  mongoose,
};
