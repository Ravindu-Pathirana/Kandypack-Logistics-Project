CREATE DATABASE kandypacklogistics;
USE kandypacklogistics;

/* 1) Auth_users */
CREATE TABLE IF NOT EXISTS Auth_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

/* 2) customerType */
CREATE TABLE IF NOT EXISTS customerType (
  customer_type_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_type VARCHAR(30) NOT NULL,
  credit_limit DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

/* 3) Roles */
CREATE TABLE IF NOT EXISTS Roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(30) NOT NULL UNIQUE,
  max_hours_week DOUBLE NOT NULL
);

/* 4) City */
CREATE TABLE IF NOT EXISTS City (
  city_id INT AUTO_INCREMENT PRIMARY KEY,
  city_name VARCHAR(50) NOT NULL UNIQUE
);

/* 5) Store */
CREATE TABLE IF NOT EXISTS Store (
  store_id INT AUTO_INCREMENT PRIMARY KEY,
  store_name VARCHAR(50) NOT NULL,
  city_id INT NOT NULL,
  contact_number VARCHAR(15) NOT NULL,
  CONSTRAINT FOREIGN KEY (city_id) REFERENCES City(city_id)
);

/* 6) Customer */
CREATE TABLE IF NOT EXISTS Customer (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(60) NOT NULL,
  registration_date DATE NOT NULL,
  customer_type_id INT NULL,
  auth_id INT NULL,
  CONSTRAINT FOREIGN KEY (customer_type_id) REFERENCES customerType(customer_type_id)
);

/* 7) CustomerContactNumber */
CREATE TABLE IF NOT EXISTS CustomerContactNumber (
  contact_number VARCHAR(10) PRIMARY KEY,
  customer_id INT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE
);

/* 8) CustomerAddress */
CREATE TABLE IF NOT EXISTS CustomerAddress (
  address_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  address_line_1 VARCHAR(100) NOT NULL,
  address_line_2 VARCHAR(100),
  city_id INT NOT NULL,
  district VARCHAR(50),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE,
  CONSTRAINT FOREIGN KEY (city_id) REFERENCES City(city_id)
);

/* 9) Employee */
CREATE TABLE IF NOT EXISTS Employee (
  employee_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_name VARCHAR(50) NOT NULL,
  employee_nic VARCHAR(12) NOT NULL UNIQUE,
  official_contact_number VARCHAR(10),
  registered_date DATE NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  total_hours_week DOUBLE NOT NULL DEFAULT 0,
  auth_id INT NULL,
  role_id INT NOT NULL,
  store_id INT NOT NULL,
  CONSTRAINT FOREIGN KEY (auth_id) REFERENCES Auth_users(id),
  CONSTRAINT FOREIGN KEY (role_id) REFERENCES Roles(role_id),
  CONSTRAINT FOREIGN KEY (store_id) REFERENCES Store(store_id)
);

/* 10) Product */
CREATE TABLE IF NOT EXISTS Product (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  unit_space DOUBLE NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  product_type VARCHAR(50) NOT NULL
);

/* 11) `Order` */
CREATE TABLE IF NOT EXISTS `Order` (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date DATE NOT NULL,
  required_date DATE NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'Pending',
  placed_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  packed_date DATETIME NULL,
  total_quantity INT NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
  CONSTRAINT CHECK (required_date >= DATE_ADD(order_date, INTERVAL 7 DAY))
);

/* 12) OrderItem */
CREATE TABLE IF NOT EXISTS OrderItem (
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (order_id, product_id),
  CONSTRAINT FOREIGN KEY (order_id) REFERENCES `Order`(order_id) ON DELETE CASCADE,
  CONSTRAINT FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

/* 13) TrainTemplate */
CREATE TABLE IF NOT EXISTS TrainTemplate (
  template_id INT AUTO_INCREMENT PRIMARY KEY,
  train_name VARCHAR(50) NOT NULL,
  start_station VARCHAR(50) NOT NULL,
  destination_station VARCHAR(50) NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  capacity_space DOUBLE NOT NULL,
  status VARCHAR(20) DEFAULT 'on-time',
  frequency_days VARCHAR(100) NOT NULL DEFAULT "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday"
);

/* 14) Train */
CREATE TABLE IF NOT EXISTS Train (
  train_id INT AUTO_INCREMENT PRIMARY KEY,
  train_name VARCHAR(50) NOT NULL,
  start_station VARCHAR(50) NOT NULL,
  destination_station VARCHAR(50) NOT NULL,
  departure_date_time DATETIME NOT NULL,
  arrival_date_time DATETIME NOT NULL,
  capacity_space DOUBLE NOT NULL,
  status VARCHAR(20) DEFAULT 'on-time',
  template_id INT,
  CONSTRAINT FOREIGN KEY (template_id) REFERENCES TrainTemplate(template_id) ON DELETE SET NULL
);

/* 15) TrainAllocation */
CREATE TABLE IF NOT EXISTS TrainAllocation (
  trip_id INT AUTO_INCREMENT PRIMARY KEY,
  train_id INT NOT NULL,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  store_id INT NOT NULL,
  allocated_qty INT NOT NULL,
  unit_space DOUBLE NOT NULL,
  total_space_used DOUBLE NOT NULL,
  start_date_time DATETIME NOT NULL,
  reached_date_time DATETIME NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'Allocated',
  CONSTRAINT FOREIGN KEY (train_id) REFERENCES Train(train_id) ON DELETE CASCADE,
  CONSTRAINT FOREIGN KEY (order_id, product_id) REFERENCES OrderItem(order_id, product_id) ON DELETE CASCADE,
  CONSTRAINT FOREIGN KEY (store_id) REFERENCES Store(store_id)
);

/* 16) TruckRoute */
CREATE TABLE IF NOT EXISTS TruckRoute (
  route_id VARCHAR(5) PRIMARY KEY,
  area_name VARCHAR(50) NOT NULL,
  max_delivery_time DOUBLE NOT NULL
);

/* 17) TruckStopsAt */
CREATE TABLE IF NOT EXISTS TruckStopsAt (
  route_id VARCHAR(5) NOT NULL,
  city_id INT NOT NULL,
  stop_sequence INT NOT NULL,
  PRIMARY KEY (route_id, city_id),
  CONSTRAINT FOREIGN KEY (route_id) REFERENCES TruckRoute(route_id) ON DELETE CASCADE,
  CONSTRAINT FOREIGN KEY (city_id) REFERENCES City(city_id)
);

/* 18) Truck */
CREATE TABLE IF NOT EXISTS Truck (
  truck_id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  plate_number VARCHAR(15) NOT NULL UNIQUE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT FOREIGN KEY (store_id) REFERENCES Store(store_id)
);

/* 19) TruckDelivery */
CREATE TABLE IF NOT EXISTS TruckDelivery (
  delivery_id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  trip_id INT NULL,
  order_id INT NOT NULL,
  route_id VARCHAR(5) NOT NULL,
  truck_id INT NOT NULL,
  scheduled_departure DATETIME NOT NULL,
  actual_departure DATETIME NULL,
  actual_arrival DATETIME NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'Scheduled',
  CONSTRAINT FOREIGN KEY (store_id) REFERENCES Store(store_id),
  CONSTRAINT FOREIGN KEY (trip_id) REFERENCES TrainAllocation(trip_id),
  CONSTRAINT FOREIGN KEY (order_id) REFERENCES `Order`(order_id),
  CONSTRAINT FOREIGN KEY (route_id) REFERENCES TruckRoute(route_id),
  CONSTRAINT FOREIGN KEY (truck_id) REFERENCES Truck(truck_id)
);

/* 20) TruckEmployeeAssignment */
CREATE TABLE IF NOT EXISTS TruckEmployeeAssignment (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  truck_delivery_id INT NOT NULL,
  assigned_hours DOUBLE NOT NULL DEFAULT 0,
  CONSTRAINT FOREIGN KEY (employee_id) REFERENCES Employee(employee_id),
  CONSTRAINT FOREIGN KEY (truck_delivery_id) REFERENCES TruckDelivery(delivery_id) ON DELETE CASCADE
);

/* Indexes */
CREATE INDEX idx_order_customer ON `Order`(customer_id);
CREATE INDEX idx_order_orderdate ON `Order`(order_date);
CREATE INDEX idx_orderitem_product ON OrderItem(product_id);
CREATE INDEX idx_trainalloc_train ON TrainAllocation(train_id);
CREATE INDEX idx_trainalloc_order ON TrainAllocation(order_id);
CREATE INDEX idx_truckdelivery_truck ON TruckDelivery(truck_id);
CREATE INDEX idx_truckdelivery_route ON TruckDelivery(route_id);
CREATE INDEX  idx_train_template_day ON Train (template_id, departure_date_time);


SET GLOBAL event_scheduler = ON;

SET GLOBAL event_scheduler = ON;

DELIMITER //
CREATE EVENT IF NOT EXISTS generate_trains_rolling_14d
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE, '00:00:00') + INTERVAL 1 DAY
DO
BEGIN
  CALL sp_populate_trains_for_next_n_days(14);
END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_populate_trains_for_next_n_days(IN days_ahead INT)
BEGIN
  DECLARE d INT DEFAULT 0;
  DECLARE target_date DATE;

  WHILE d < days_ahead DO
    SET target_date = DATE_ADD(CURDATE(), INTERVAL d DAY);

    INSERT INTO Train (
      train_name,
      start_station,
      destination_station,
      departure_date_time,
      arrival_date_time,
      capacity_space,
      status,
      template_id
    )
    SELECT
      t.train_name,
      t.start_station,
      t.destination_station,
      CONCAT(target_date, ' ', t.departure_time),
      CONCAT(target_date, ' ', t.arrival_time),
      t.capacity_space,
      t.status,
      t.template_id
    FROM TrainTemplate t
    JOIN (
      SELECT 0 AS offset,'Monday' AS day_name UNION ALL
      SELECT 1,'Tuesday' UNION ALL
      SELECT 2,'Wednesday' UNION ALL
      SELECT 3,'Thursday' UNION ALL
      SELECT 4,'Friday' UNION ALL
      SELECT 5,'Saturday' UNION ALL
      SELECT 6,'Sunday'
    ) days
      ON days.offset = WEEKDAY(target_date)
     AND FIND_IN_SET(days.day_name, t.frequency_days) > 0
    WHERE NOT EXISTS (
      SELECT 1
      FROM Train tr
      WHERE tr.template_id = t.template_id
        AND DATE(tr.departure_date_time) = target_date
    );

    SET d = d + 1;
  END WHILE;
END //
DELIMITER ;
