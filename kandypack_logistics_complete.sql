CREATE DATABASE IF NOT EXISTS kandypacklogistics;
USE kandypacklogistics;

-- =====================================================
-- 1. BASIC REFERENCE TABLES
-- =====================================================

-- Table: city
CREATE TABLE `city` (
  `city_id` int NOT NULL AUTO_INCREMENT,
  `city_name` varchar(50) NOT NULL,
  PRIMARY KEY (`city_id`),
  UNIQUE KEY `city_name` (`city_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert cities
INSERT INTO `city` VALUES 
(1,'Colombo'),
(2,'Kandy'),
(3,'Galle'),
(4,'Gampaha'),
(5,'Kaluthara'),
(6,'ambalangoda');

-- Table: customertype
CREATE TABLE `customertype` (
  `customer_type_id` int NOT NULL AUTO_INCREMENT,
  `customer_type` varchar(20) NOT NULL,
  `credit_limit` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`customer_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert customer types
INSERT INTO `customertype` VALUES 
(1,'Retail',500.00),
(2,'Wholesale',5000.00);

-- Table: product_type
CREATE TABLE `product_type` (
  `product_type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  PRIMARY KEY (`product_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert product types
INSERT INTO `product_type` VALUES 
(1,'Electronics'),
(2,'Hardware'),
(4,'Baby Care'),
(5,'Adult Care'),
(6,'Cloths');

-- Table: roles
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `max_hours_week` double NOT NULL,
  PRIMARY KEY (`role_id`),
  CONSTRAINT `roles_chk_1` CHECK ((`max_hours_week` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert roles
INSERT INTO `roles` VALUES 
(1,'Manager',40),
(2,'Driver',50),
(3,'admin',100),
(4,'assitant',60);

-- Table: truckroute
CREATE TABLE `truckroute` (
  `route_id` varchar(5) NOT NULL,
  `area_name` varchar(20) NOT NULL,
  `max_delivery_time` double NOT NULL,
  PRIMARY KEY (`route_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert truck routes
INSERT INTO `truckroute` VALUES 
('R001','Kandy Central',5.5),
('R002','Peradeniya',6),
('R003','Katugastota',4.5),
('R004','Gampola',7);

-- Table: TrainTemplate
CREATE TABLE IF NOT EXISTS TrainTemplate (
  template_id INT AUTO_INCREMENT PRIMARY KEY,
  train_name VARCHAR(50) NOT NULL,
  start_station VARCHAR(50) NOT NULL,
  destination_station VARCHAR(50) NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  capacity_space DOUBLE NOT NULL,
  `status` VARCHAR(20) DEFAULT 'on-time',
  frequency_days VARCHAR(100) NOT NULL DEFAULT "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday"
);

-- Insert train templates
INSERT INTO TrainTemplate (train_name, start_station, destination_station, departure_time, arrival_time, capacity_space, status, frequency_days) VALUES
('Express Colombo-Kandy', 'Colombo', 'Kandy', '08:00:00', '10:30:00', 100.0, 'on-time', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'),
('Express Kandy-Galle', 'Kandy', 'Galle', '12:30:00', '15:00:00', 80.0, 'on-time', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'),
('Express Galle-Colombo', 'Galle', 'Colombo', '16:00:00', '18:30:00', 90.0, 'on-time', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'),
('Local Colombo-Gampaha', 'Colombo', 'Gampaha', '07:30:00', '08:00:00', 50.0, 'on-time', 'Monday,Tuesday,Wednesday,Thursday,Friday'),
('Local Kandy-Kaluthara', 'Kandy', 'Kaluthara', '14:00:00', '16:00:00', 60.0, 'on-time', 'Monday,Wednesday,Friday,Sunday');

-- =====================================================
-- 2. CORE BUSINESS TABLES
-- =====================================================

-- Table: store
CREATE TABLE `store` (
  `store_id` int NOT NULL AUTO_INCREMENT,
  `store_name` varchar(50) NOT NULL,
  `contact_number` varchar(10) NOT NULL,
  `city_id` int DEFAULT NULL,
  PRIMARY KEY (`store_id`),
  KEY `fk_store_city` (`city_id`),
  CONSTRAINT `fk_store_city` FOREIGN KEY (`city_id`) REFERENCES `city` (`city_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert stores
INSERT INTO `store` VALUES 
(1,'Main Store','0112345678',1),
(2,'Kandy Store','0812345678',2),
(3,'Main Store 2','0332247915',3),
(4,'Colombo Main22','0714589405',1);

-- Table: customer
CREATE TABLE `customer` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(50) NOT NULL,
  `registration_date` date NOT NULL,
  `customer_type_id` int DEFAULT NULL,
  PRIMARY KEY (`customer_id`),
  KEY `idx_customer_type` (`customer_type_id`),
  CONSTRAINT `customer_ibfk_2` FOREIGN KEY (`customer_type_id`) REFERENCES `customertype` (`customer_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert customers
INSERT INTO `customer` VALUES 
(1,'John Doe','2025-01-15',1),
(2,'Jane Smith','2025-02-20',2),
(3,'chamodh','2025-10-19',1);

-- Table: customeraddress
CREATE TABLE `customeraddress` (
  `address_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `address_line_1` varchar(30) NOT NULL,
  `address_line_2` varchar(30) DEFAULT NULL,
  `city_id` int NOT NULL,
  `district` varchar(25) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`address_id`),
  KEY `city_id` (`city_id`),
  KEY `idx_customer_address` (`customer_id`,`city_id`),
  CONSTRAINT `customeraddress_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE,
  CONSTRAINT `customeraddress_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `city` (`city_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert customer addresses
INSERT INTO `customeraddress` VALUES 
(1,1,'123 Main St',NULL,1,'Downtown',1),
(2,2,'456 High St',NULL,2,'Uptown',1),
(3,3,'789 Temple Road','Apartment 5B',2,'Central',1);

-- Table: customercontactnumber
CREATE TABLE `customercontactnumber` (
  `contact_number` varchar(10) NOT NULL,
  `customer_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`contact_number`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customercontactnumber_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert customer contact numbers
INSERT INTO `customercontactnumber` VALUES 
('0771234567',1,1),
('0777654321',2,1),
('0712074156',3,1);

-- Table: product
CREATE TABLE `product` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(50) NOT NULL,
  `unit_space` float NOT NULL,
  `unit_price` float NOT NULL,
  `product_type_id` int NOT NULL,
  PRIMARY KEY (`product_id`),
  KEY `fk_product_type` (`product_type_id`),
  CONSTRAINT `fk_product_type` FOREIGN KEY (`product_type_id`) REFERENCES `product_type` (`product_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert products
INSERT INTO `product` VALUES 
(1,'Widget A',1.5,25,1),
(2,'Gadget B',2,40,1),
(3,'Tool C',0.5,10,2),
(4,'string',10,100,4),
(5,'Hello world',10,150,4),
(6,'jeans',10,1500,6);

-- =====================================================
-- 3. EMPLOYEE SYSTEM TABLES
-- =====================================================

-- Table: employee
CREATE TABLE `employee` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `employee_nic` varchar(12) NOT NULL,
  `official_contact_number` varchar(10) DEFAULT NULL,
  `registrated_date` date NOT NULL,
  `employee_status` varchar(20) DEFAULT 'Active',
  `total_hours_week` double DEFAULT '0',
  `role_id` int NOT NULL,
  `store_id` int NOT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `employee_nic` (`employee_nic`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_employee_role` (`role_id`),
  KEY `idx_employee_store` (`store_id`),
  KEY `idx_employee_status` (`employee_status`),
  CONSTRAINT `employee_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  CONSTRAINT `employee_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert employees
INSERT INTO `employee` VALUES 
(30,'chamodh nethsara','chamodhne','$2b$12$Kp8GB/.WCTPhoNEW8RjgL.epU/eWhgwXtrZ5OG6qeOz.qTzzRIMBK','200400213354','0712074156','2025-10-19','Active',0,1,1),
(31,'Chamodh Nethsara','chamodh','$2b$12$lGu0/4ndi.x53mWCHy9Yke4CtzdGAoQgYhtNsl.A8CcNunu3gMl4C','200500213354','0712074156','2025-10-19','Active',0,2,1),
(33,'driver_store2','driver_store2','$2b$12$OSq6fiNRyYUpPY//EVqrgefcOzFlcJxIRZUqo3FS.LaMeNUJr3XeK','200400213352','0332247915','2025-10-19','Active',0,2,2),
(34,'admin','admin','$2b$12$Cpsv9qDbnOTrWiLvY8ZLm.pi9wJHnmqDeD7IcGIkjOe45QM2ODf86','200400213334','0712074156','2025-10-19','Active',0,3,1),
(36,'ravindu pathirana','Ravindu','$2b$12$zHm8VT4prygOceB/ihdiduEIhzQIsfIUYOSrFZ1uS0U2MacE49YfC','200600213354','0713087915','2025-10-19','Active',0,4,1);

-- Table: assistant
CREATE TABLE `assistant` (
  `employee_id` int NOT NULL,
  `consecutive_deliveries` int NOT NULL DEFAULT '0',
  `next_available_time` datetime NOT NULL,
  `status` enum('On Duty','Available','On Leave','Break') NOT NULL DEFAULT 'Available',
  `last_delivery_time` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  CONSTRAINT `assistant_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert assistants
INSERT INTO `assistant` VALUES 
(36,0,'2025-10-19 20:11:30','Available',NULL);

-- Table: driver
CREATE TABLE `driver` (
  `employee_id` int NOT NULL,
  `consecutive_deliveries` int NOT NULL DEFAULT '0',
  `next_available_time` datetime NOT NULL,
  `status` enum('On Duty','Available','On Leave','Break') NOT NULL DEFAULT 'Available',
  `last_delivery_time` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  CONSTRAINT `driver_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert drivers
INSERT INTO `driver` VALUES 
(31,0,'2025-10-19 16:48:58','Available',NULL),
(33,0,'2025-10-19 16:58:17','Available',NULL);

-- Table: truck
CREATE TABLE `truck` (
  `truck_id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `plate_number` varchar(10) NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`truck_id`),
  UNIQUE KEY `plate_number` (`plate_number`),
  KEY `idx_truck_store` (`store_id`),
  CONSTRAINT `truck_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert trucks
INSERT INTO `truck` VALUES 
(1,1,'CBA-1234',1),
(2,1,'CBA-5678',0),
(3,2,'KDA-4321',1),
(4,2,'LKA-8765',1),
(5,1,'CAL7255',1),
(6,1,'CAL8765',0),
(7,1,'ABC234543',1),
(8,3,'BCD456',0);

-- =====================================================
-- 4. TRAIN SYSTEM TABLES
-- =====================================================

-- Table: Train
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


-- =====================================================
-- 5. ORDER SYSTEM TABLES
-- =====================================================

-- Table: order (with total_space column added)
CREATE TABLE `order` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `address_id` int DEFAULT NULL,
  `order_date` date NOT NULL,
  `required_date` date NOT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `placed_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `packed_date` datetime DEFAULT NULL,
  `total_quantity` int DEFAULT '0',
  `total_price` decimal(10,2) DEFAULT '0.00',
  `total_space` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`order_id`),
  KEY `idx_order_customer` (`customer_id`),
  KEY `idx_order_date` (`order_date`),
  KEY `idx_order_status` (`status`),
  KEY `order_ibfk_2` (`address_id`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  CONSTRAINT `order_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `customeraddress` (`address_id`),
  CONSTRAINT `order_chk_1` CHECK ((`required_date` >= (`order_date` + interval 7 day)))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert orders with calculated total_space
INSERT INTO `order` VALUES 
(1,1,1,'2025-10-10','2025-10-20','Pending','2025-10-10 10:30:00','2025-10-11 14:00:00',5,150.75,7.5),
(2,1,1,'2025-10-15','2025-10-25','Shipped','2025-10-15 09:15:00','2025-10-16 11:45:00',3,89.50,1.5),
(3,2,2,'2025-10-12','2025-10-22','Delivered','2025-10-12 16:20:00','2025-10-13 08:10:00',8,245.00,8.0),
(4,2,2,'2025-09-25','2025-10-05','Pending','2025-09-25 12:00:00','2025-09-26 09:00:00',2,45.00,1.0),
(5,3,3,'2025-10-20','2025-10-30','Pending','2025-10-20 14:00:00',NULL,10,15000.00,100.0);

-- Table: orderitem
CREATE TABLE `orderitem` (
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`order_id`,`product_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_orderitem_order` (`order_id`),
  CONSTRAINT `orderitem_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `orderitem_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert order items
INSERT INTO `orderitem` VALUES 
(1,1,2,25.00),
(1,2,3,40.00),
(2,3,3,10.00),
(3,1,5,25.00),
(3,2,3,40.00),
(4,3,2,10.00),
(5,6,10,1500.00);

-- =====================================================
-- 6. TRUCK SYSTEM TABLES
-- =====================================================

-- Table: truckstopsat
CREATE TABLE `truckstopsat` (
  `route_id` varchar(5) NOT NULL,
  `city_id` int NOT NULL,
  `stop_sequence` int NOT NULL,
  PRIMARY KEY (`route_id`,`city_id`),
  KEY `idx_truckstops_city` (`city_id`),
  CONSTRAINT `truckstopsat_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `truckroute` (`route_id`) ON DELETE CASCADE,
  CONSTRAINT `truckstopsat_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `city` (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: trainallocation
CREATE TABLE `trainallocation` (
  `trip_id` int NOT NULL AUTO_INCREMENT,
  `train_id` int NOT NULL,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `store_id` int NOT NULL,
  `allocated_qty` int NOT NULL,
  `start_date_time` datetime NOT NULL,
  `reached_date_time` datetime DEFAULT NULL,
  `status` varchar(30) DEFAULT 'Allocated',
  `unit_space` double NOT NULL,
  `total_space_used` double GENERATED ALWAYS AS ((`allocated_qty` * `unit_space`)) STORED,
  PRIMARY KEY (`trip_id`),
  KEY `order_id` (`order_id`,`product_id`),
  KEY `store_id` (`store_id`),
  KEY `idx_train_allocation` (`train_id`,`order_id`,`product_id`),
  CONSTRAINT `trainallocation_ibfk_1` FOREIGN KEY (`train_id`) REFERENCES `train` (`train_id`) ON DELETE CASCADE,
  CONSTRAINT `trainallocation_ibfk_2` FOREIGN KEY (`order_id`, `product_id`) REFERENCES `orderitem` (`order_id`, `product_id`) ON DELETE CASCADE,
  CONSTRAINT `trainallocation_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: truckdelivery
CREATE TABLE `truckdelivery` (
  `delivery_id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `order_id` int NOT NULL,
  `route_id` varchar(5) NOT NULL,
  `truck_id` int NOT NULL,
  `scheduled_departure` datetime NOT NULL,
  `actual_departure` datetime DEFAULT NULL,
  `actual_arrival` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Scheduled',
  PRIMARY KEY (`delivery_id`),
  KEY `store_id` (`store_id`),
  KEY `idx_delivery_order` (`order_id`),
  KEY `idx_delivery_route` (`route_id`),
  KEY `idx_delivery_truck` (`truck_id`),
  KEY `idx_delivery_date` (`scheduled_departure`),
  CONSTRAINT `truckdelivery_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`),
  CONSTRAINT `truckdelivery_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`),
  CONSTRAINT `truckdelivery_ibfk_3` FOREIGN KEY (`route_id`) REFERENCES `truckroute` (`route_id`),
  CONSTRAINT `truckdelivery_ibfk_4` FOREIGN KEY (`truck_id`) REFERENCES `truck` (`truck_id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert truck deliveries
INSERT INTO `truckdelivery` VALUES 
(65,1,1,'R001',1,'2025-07-01 08:00:00','2025-07-01 08:10:00','2025-07-01 12:30:00','Delivered'),
(66,2,2,'R002',3,'2025-07-01 09:00:00','2025-07-01 09:05:00','2025-07-01 14:00:00','Delivered'),
(67,1,3,'R003',2,'2025-07-02 07:30:00','2025-07-02 07:35:00','2025-07-02 11:50:00','Delivered'),
(68,2,4,'R004',4,'2025-07-02 08:00:00','2025-07-02 08:05:00','2025-07-02 12:40:00','Delivered');

-- Table: truckemployeeassignment
CREATE TABLE `truckemployeeassignment` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `truck_delivery_id` int NOT NULL,
  `assigned_hours` double DEFAULT '0',
  PRIMARY KEY (`assignment_id`),
  KEY `idx_assignment_employee` (`employee_id`),
  KEY `idx_assignment_delivery` (`truck_delivery_id`),
  CONSTRAINT `truckemployeeassignment_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
  CONSTRAINT `truckemployeeassignment_ibfk_2` FOREIGN KEY (`truck_delivery_id`) REFERENCES `truckdelivery` (`delivery_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- 7. TRIGGERS FOR BUSINESS LOGIC
-- =====================================================

-- Trigger for consecutive driver deliveries
DELIMITER ;;
CREATE TRIGGER `check_consecutive_driver_deliveries` BEFORE INSERT ON `truckemployeeassignment` FOR EACH ROW BEGIN
    DECLARE role_name VARCHAR(20);
    DECLARE last_delivery_time DATETIME;
    DECLARE new_delivery_time DATETIME;

    SELECT r.role_name 
    INTO role_name
    FROM employee e
    JOIN roles r ON e.role_id = r.role_id
    WHERE e.employee_id = NEW.employee_id;

    IF role_name = 'Driver' THEN
        SELECT td.scheduled_departure 
        INTO new_delivery_time
        FROM truckdelivery td
        WHERE td.delivery_id = NEW.truck_delivery_id;

        SELECT td.scheduled_departure
        INTO last_delivery_time
        FROM truckemployeeassignment tea
        JOIN truckdelivery td ON tea.truck_delivery_id = td.delivery_id
        WHERE tea.employee_id = NEW.employee_id
        ORDER BY td.scheduled_departure DESC
        LIMIT 1;

        IF last_delivery_time IS NOT NULL 
           AND ABS(TIMESTAMPDIFF(HOUR, last_delivery_time, new_delivery_time)) < 4 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Driver cannot be assigned to consecutive deliveries without rest period.';
        END IF;
    END IF;
END ;;
DELIMITER ;

-- Trigger for weekly hours check
DELIMITER ;;
CREATE TRIGGER `check_weekly_hours` BEFORE INSERT ON `truckemployeeassignment` FOR EACH ROW BEGIN
    DECLARE total_hours DOUBLE DEFAULT 0;
    DECLARE role_name VARCHAR(20) DEFAULT '';
    DECLARE max_hours DOUBLE DEFAULT 0;
    DECLARE new_delivery_week INT DEFAULT 0;
    DECLARE msg VARCHAR(255) DEFAULT '';

    SELECT r.role_name, r.max_hours_week
    INTO role_name, max_hours
    FROM employee e
    JOIN roles r ON e.role_id = r.role_id
    WHERE e.employee_id = NEW.employee_id
    LIMIT 1;

    SELECT WEEK(td.scheduled_departure)
    INTO new_delivery_week
    FROM truckdelivery td
    WHERE td.delivery_id = NEW.truck_delivery_id
    LIMIT 1;

    SELECT IFNULL(SUM(ta.assigned_hours), 0)
    INTO total_hours
    FROM truckemployeeassignment ta
    JOIN truckdelivery td ON ta.truck_delivery_id = td.delivery_id
    WHERE ta.employee_id = NEW.employee_id
      AND WEEK(td.scheduled_departure) = new_delivery_week;

    IF total_hours + NEW.assigned_hours > max_hours THEN
        SET msg = CONCAT('Weekly hour limit exceeded for ', role_name, '. Max allowed: ', max_hours, ' hours. Currently assigned: ', total_hours + NEW.assigned_hours);
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
    END IF;
END ;;
DELIMITER ;

-- =====================================================
-- 8. STORED PROCEDURES
-- =====================================================

-- Procedure for employee info
DELIMITER ;;
CREATE PROCEDURE `GetEmployeeInfo`(IN emp_id INT)
BEGIN
    DECLARE emp_role INT;
    SELECT role_id INTO emp_role
    FROM employee
    WHERE employee_id = emp_id;
    IF emp_role = 2 THEN
        SELECT 
            e.employee_id,
            e.employee_name,
            e.username,
            e.official_contact_number,
            e.employee_nic,
            e.registrated_date,
            e.role_id,
            e.store_id,
            d.status,
            d.total_hours_week,
            d.consecutive_deliveries,
            d.next_available_time,
            d.last_delivery_time
        FROM employee e
        LEFT JOIN driver d ON e.employee_id = d.employee_id
        WHERE e.employee_id = emp_id;
    ELSEIF emp_role = 3 THEN
        SELECT 
            e.employee_id,
            e.employee_name,
            e.username,
            e.official_contact_number,
            e.employee_nic,
            e.registrated_date,
            e.role_id,
            e.store_id,
            a.status,
            a.total_hours_week,
            a.consecutive_deliveries,
            a.next_available_time,
            a.last_delivery_time
        FROM employee e
        LEFT JOIN assistant a ON e.employee_id = a.employee_id
        WHERE e.employee_id = emp_id;
    ELSE
        SELECT 
            e.employee_id,
            e.employee_name,
            e.username,
            e.official_contact_number,
            e.employee_nic,
            e.registrated_date,
            e.role_id,
            e.store_id,
            NULL AS status,
            NULL AS total_hours_week,
            NULL AS consecutive_deliveries,
            NULL AS next_available_time,
            NULL AS last_delivery_time
        FROM employee e
        WHERE e.employee_id = emp_id;
    END IF;
END ;;
DELIMITER ;

-- Procedure for assistants
DELIMITER ;;
CREATE PROCEDURE `get_assistants_for_user`(
    IN p_role VARCHAR(50),
    IN p_store_id INT
)
BEGIN
    IF p_role = 'store_manager' THEN
        SELECT 
            e.employee_id,
            e.employee_name,
            e.total_hours_week,
            e.official_contact_number,
            a.status,
            a.consecutive_deliveries,
            a.next_available_time
        FROM assistant a
        JOIN employee e USING (employee_id)
        WHERE e.store_id = p_store_id;
    ELSE
        SELECT 
            e.employee_id,
            e.employee_name,
            e.total_hours_week,
            e.official_contact_number,
            a.status,
            a.consecutive_deliveries,
            a.next_available_time,
            e.store_id
        FROM assistant a
        JOIN employee e USING (employee_id);
    END IF;
END ;;
DELIMITER ;

-- Procedure for drivers
DELIMITER ;;
CREATE PROCEDURE `get_drivers_for_user`(
    IN p_role VARCHAR(50),
    IN p_store_id INT
)
BEGIN
    IF p_role = 'store_manager' THEN
        SELECT e.employee_id,
                e.employee_name,
                e.total_hours_week,
                e.official_contact_number,
                d.status,
                d.consecutive_deliveries,
                d.next_available_time
        FROM driver d
        JOIN employee e using (employee_id)
        WHERE e.store_id = p_store_id;
    ELSE
        SELECT *
        FROM driver;
    END IF;
END ;;
DELIMITER ;

-- Procedure for summary
DELIMITER ;;
CREATE PROCEDURE `get_summary_for_user`(
    IN p_role VARCHAR(50),
    IN p_store_id INT
)
BEGIN
    DECLARE on_duty_drivers INT DEFAULT 0;
    DECLARE on_duty_assistants INT DEFAULT 0;
    DECLARE available_to_schedule INT DEFAULT 0;
    IF p_role = 'store_manager' THEN
        SELECT 
            SUM(CASE WHEN e.role_id = 2 AND d.status = 'On Duty' THEN 1 ELSE 0 END) AS on_duty_drivers,
            SUM(CASE WHEN e.role_id = 1 AND a.status = 'On Duty' THEN 1 ELSE 0 END) AS on_duty_assistants,
            SUM(CASE 
                    WHEN (d.status = 'Available' AND d.next_available_time <= NOW()) OR 
                         (a.status = 'Available' AND a.next_available_time <= NOW())
                    THEN 1 ELSE 0 
                END) AS available_to_schedule
        INTO on_duty_drivers, on_duty_assistants, available_to_schedule
        FROM employee e
        LEFT JOIN driver d ON e.employee_id = d.employee_id
        LEFT JOIN assistant a ON e.employee_id = a.employee_id
        WHERE e.store_id = p_store_id;
    ELSE
        SELECT 
            SUM(CASE WHEN e.role_id = 2 AND d.status = 'On Duty' THEN 1 ELSE 0 END) AS on_duty_drivers,
            SUM(CASE WHEN e.role_id = 1 AND a.status = 'On Duty' THEN 1 ELSE 0 END) AS on_duty_assistants,
            SUM(CASE 
                    WHEN (d.status = 'Available' AND d.next_available_time <= NOW()) OR 
                         (a.status = 'Available' AND a.next_available_time <= NOW())
                    THEN 1 ELSE 0 
                END) AS available_to_schedule
        INTO on_duty_drivers, on_duty_assistants, available_to_schedule
        FROM employee e
        LEFT JOIN driver d ON e.employee_id = d.employee_id
        LEFT JOIN assistant a ON e.employee_id = a.employee_id;
    END IF;
    SELECT 
        on_duty_drivers AS on_duty_drivers,
        40 AS drivers_weekly_limit,
        on_duty_assistants AS on_duty_assistants,
        60 AS assistants_weekly_limit,
        available_to_schedule AS available_to_schedule,
        'Compliance met' AS compliance;
END ;;
DELIMITER ;

-- Procedure for trucks
DELIMITER ;;
CREATE PROCEDURE `get_trucks_for_user`(
    IN p_role VARCHAR(50),
    IN p_store_id INT
)
BEGIN
    IF p_role = 'store_manager' THEN
        SELECT t.truck_id,
               t.plate_number,
               t.is_available
        FROM truck t
        WHERE t.store_id = p_store_id;
    ELSE
        SELECT *
        FROM truck;
    END IF;
END ;;
DELIMITER ;

-- =====================================================
-- 9. TRAIN SYSTEM PROCEDURES AND EVENTS
-- =====================================================

-- Event and Procedure for Train Population
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
CREATE PROCEDURE sp_populate_trains_for_next_n_days(IN days_ahead INT)
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
-- =====================================================
-- END OF DATABASE SETUP
-- =====================================================
