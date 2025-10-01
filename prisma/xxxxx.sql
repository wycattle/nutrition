use nutrition;

-- Create the nutrition database
CREATE DATABASE IF NOT EXISTS nutrition;

-- Set a password for root user
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nutrition123';

-- Create the tables for your schema
USE nutrition;

CREATE TABLE meal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  datex DATETIME NOT NULL,
  timestamp VARCHAR(50) NOT NULL DEFAULT '',
  details JSON NOT NULL,
  totalRowId INT UNIQUE,
  namex VARCHAR(255) NOT NULL
);

CREATE TABLE totalrowmeal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caloriesTot FLOAT NOT NULL,
  carbTot FLOAT NOT NULL,
  fatTot FLOAT NOT NULL,
  fiberTot FLOAT NOT NULL,
  portionTot FLOAT NOT NULL DEFAULT 0,
  proteinTot FLOAT NOT NULL,
  mealId INT UNIQUE NOT NULL,
  FOREIGN KEY (mealId) REFERENCES meal(id)
);

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Show databases to confirm
SHOW DATABASES;

EXIT;