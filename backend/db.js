import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  // 11th request waits.
  connectionLimit: 10,
  // 10 connections at the same time.
  queueLimit: 0
  // Unlimited waiting queue..
});



pool.getConnection()
  .then(async (connection) => {
    console.log('Connected to MySQL Database');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.query(createTableQuery);
    console.log('Users table ready');

    const createFoodMasterTableQuery = `
      CREATE TABLE IF NOT EXISTS food_master (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        food_name VARCHAR(255) NOT NULL,
        calories_per_unit FLOAT NOT NULL,
        food_state VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.query(createFoodMasterTableQuery);
    console.log("Food table is ready");

    const createExerciseMasterTableQuery = `
      CREATE TABLE IF NOT EXISTS exercise_master (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        exercise_name VARCHAR(255) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        calories_burned FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.query(createExerciseMasterTableQuery);
    console.log("Exercise table is ready");

    const createFoodEntryTableQuery = `
      CREATE TABLE IF NOT EXISTS food_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        food_id INT NOT NULL,
        quantity FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(food_id) REFERENCES food_master(id) ON DELETE CASCADE
      )
    `;
    await connection.query(createFoodEntryTableQuery);
    console.log("Food Entries table is ready");

    const createExerciseEntryTableQuery = `
      CREATE TABLE IF NOT EXISTS exercise_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        exercise_id INT NOT NULL,
        duration FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(exercise_id) REFERENCES exercise_master(id) ON DELETE CASCADE
      )
    `;
    await connection.query(createExerciseEntryTableQuery);
    console.log("Exercise Entries table is ready");

    connection.release();
  })
  .catch((err) => {
    console.log('MySQL Database connection error:', err);
  });

export default pool;
