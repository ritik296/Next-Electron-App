import { Sequelize, DataTypes } from "sequelize";
import path from "path";
import { app } from "electron";

// Set up the database file path
const dbPath = path.join(app.getPath("userData"), "database.sqlite");

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false, // Disable logging (optional)
});

// Define a sample model (e.g., Todo)
const Todo = sequelize.define("Todo", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pending",
  },
});

// Sync models with the database
sequelize.sync({ alter: true })
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Error syncing database:", err));

export { sequelize, Todo };
