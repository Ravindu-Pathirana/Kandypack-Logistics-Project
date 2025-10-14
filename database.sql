-- MySQL dump 10.13  Distrib 8.0.43, for macos15 (arm64)
--
-- Host: localhost    Database: kandypacklogistics
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `City`
--

DROP TABLE IF EXISTS `City`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `City` (
  `city_id` int NOT NULL AUTO_INCREMENT,
  `city_name` varchar(50) NOT NULL,
  PRIMARY KEY (`city_id`),
  UNIQUE KEY `city_name` (`city_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Customer`
--

DROP TABLE IF EXISTS `Customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Customer` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(50) NOT NULL,
  `registration_date` date NOT NULL,
  `customer_type_id` int DEFAULT NULL,
  PRIMARY KEY (`customer_id`),
  KEY `idx_customer_type` (`customer_type_id`),
  CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`customer_type_id`) REFERENCES `customerType` (`customer_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CustomerAddress`
--

DROP TABLE IF EXISTS `CustomerAddress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CustomerAddress` (
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
  CONSTRAINT `customeraddress_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `Customer` (`customer_id`) ON DELETE CASCADE,
  CONSTRAINT `customeraddress_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `City` (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CustomerContactNumber`
--

DROP TABLE IF EXISTS `CustomerContactNumber`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CustomerContactNumber` (
  `contact_number` varchar(10) NOT NULL,
  `customer_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`contact_number`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customercontactnumber_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `Customer` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customerType`
--

DROP TABLE IF EXISTS `customerType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customerType` (
  `customer_type_id` int NOT NULL AUTO_INCREMENT,
  `customer_type` varchar(30) NOT NULL,
  `credit_limit` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`customer_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Employee`
--

DROP TABLE IF EXISTS `Employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Employee` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(50) NOT NULL,
  `employee_nic` varchar(12) NOT NULL,
  `official_contact_number` varchar(10) DEFAULT NULL,
  `registered_date` date NOT NULL,
  `status` varchar(40) DEFAULT 'Active',
  `total_hours_week` double DEFAULT '0',
  `role_id` int NOT NULL,
  `store_id` int NOT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `employee_nic` (`employee_nic`),
  KEY `idx_employee_role` (`role_id`),
  KEY `idx_employee_store` (`store_id`),
  KEY `idx_employee_status` (`status`),
  CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `Roles` (`role_id`),
  CONSTRAINT `employee_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `Store` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Order`
--

DROP TABLE IF EXISTS `Order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Order` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `order_date` date NOT NULL,
  `required_date` date NOT NULL,
  `status` varchar(10) DEFAULT 'Pending',
  `placed_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `packed_date` datetime DEFAULT NULL,
  `total_quantity` int DEFAULT '0',
  `total_price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`order_id`),
  KEY `idx_order_customer` (`customer_id`),
  KEY `idx_order_date` (`order_date`),
  KEY `idx_order_status` (`status`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `Customer` (`customer_id`),
  CONSTRAINT `order_chk_1` CHECK ((`required_date` >= (`order_date` + interval 7 day)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `orderallocationstatus`
--

DROP TABLE IF EXISTS `orderallocationstatus`;
/*!50001 DROP VIEW IF EXISTS `orderallocationstatus`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `orderallocationstatus` AS SELECT 
 1 AS `order_id`,
 1 AS `customer_name`,
 1 AS `order_date`,
 1 AS `total_quantity`,
 1 AS `order_status`,
 1 AS `total_allocated_qty`,
 1 AS `allocation_status`,
 1 AS `allocated_trains`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `OrderItem`
--

DROP TABLE IF EXISTS `OrderItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `OrderItem` (
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`order_id`,`product_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_orderitem_order` (`order_id`),
  CONSTRAINT `orderitem_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Order` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `orderitem_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `Product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `ordersummary`
--

DROP TABLE IF EXISTS `ordersummary`;
/*!50001 DROP VIEW IF EXISTS `ordersummary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `ordersummary` AS SELECT 
 1 AS `order_id`,
 1 AS `customer_name`,
 1 AS `customer_type`,
 1 AS `order_date`,
 1 AS `required_date`,
 1 AS `status`,
 1 AS `total_quantity`,
 1 AS `order_value`,
 1 AS `city_id`,
 1 AS `delivery_city`,
 1 AS `delivery_status`,
 1 AS `route_area`,
 1 AS `truck_used`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Product`
--

DROP TABLE IF EXISTS `Product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Product` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(50) NOT NULL,
  `unit_space` double NOT NULL COMMENT 'Space consumption per unit for train allocation',
  `unit_price` double NOT NULL,
  `product_type` varchar(50) NOT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `max_hours_week` double NOT NULL,
  PRIMARY KEY (`role_id`),
  CONSTRAINT `roles_chk_1` CHECK ((`max_hours_week` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Station`
--

DROP TABLE IF EXISTS `Station`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Station` (
  `station_id` int NOT NULL AUTO_INCREMENT,
  `station_name` varchar(50) NOT NULL,
  `city_id` int NOT NULL,
  PRIMARY KEY (`station_id`),
  KEY `idx_station_city` (`city_id`),
  CONSTRAINT `station_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `City` (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Store`
--

DROP TABLE IF EXISTS `Store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Store` (
  `store_id` int NOT NULL AUTO_INCREMENT,
  `store_name` varchar(50) NOT NULL,
  `contact_number` varchar(10) NOT NULL,
  `nearest_station_id` int DEFAULT NULL,
  PRIMARY KEY (`store_id`),
  KEY `idx_store_station` (`nearest_station_id`),
  CONSTRAINT `store_ibfk_1` FOREIGN KEY (`nearest_station_id`) REFERENCES `Station` (`station_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Train`
--

DROP TABLE IF EXISTS `Train`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Train` (
  `train_id` int NOT NULL AUTO_INCREMENT,
  `train_name` varchar(40) NOT NULL,
  `start_station` varchar(50) NOT NULL,
  `departure_date_time` datetime NOT NULL,
  `arrival_date_time` datetime NOT NULL,
  `capacity_space` double NOT NULL DEFAULT '1000' COMMENT 'Fixed cargo capacity per trip',
  `pattern_id` int DEFAULT NULL,
  PRIMARY KEY (`train_id`),
  KEY `pattern_id` (`pattern_id`),
  KEY `idx_train_departure` (`departure_date_time`),
  CONSTRAINT `train_ibfk_1` FOREIGN KEY (`pattern_id`) REFERENCES `TrainRoutePattern` (`pattern_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TrainAllocation`
--

DROP TABLE IF EXISTS `TrainAllocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TrainAllocation` (
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
  CONSTRAINT `trainallocation_ibfk_1` FOREIGN KEY (`train_id`) REFERENCES `Train` (`train_id`) ON DELETE CASCADE,
  CONSTRAINT `trainallocation_ibfk_2` FOREIGN KEY (`order_id`, `product_id`) REFERENCES `OrderItem` (`order_id`, `product_id`) ON DELETE CASCADE,
  CONSTRAINT `trainallocation_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `Store` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TrainRoutePattern`
--

DROP TABLE IF EXISTS `TrainRoutePattern`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TrainRoutePattern` (
  `pattern_id` int NOT NULL AUTO_INCREMENT,
  `train_name` varchar(40) NOT NULL,
  `station_id` int NOT NULL,
  `stop_sequence` int NOT NULL,
  `arrival_time` time NOT NULL,
  `departure_time` time NOT NULL,
  PRIMARY KEY (`pattern_id`),
  UNIQUE KEY `unique_pattern_stop` (`train_name`,`station_id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `trainroutepattern_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `Station` (`station_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `trainutilization`
--

DROP TABLE IF EXISTS `trainutilization`;
/*!50001 DROP VIEW IF EXISTS `trainutilization`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `trainutilization` AS SELECT 
 1 AS `train_id`,
 1 AS `train_name`,
 1 AS `trip_date`,
 1 AS `departure_time`,
 1 AS `capacity_space`,
 1 AS `used_space`,
 1 AS `utilization_percentage`,
 1 AS `orders_allocated`,
 1 AS `items_allocated`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Truck`
--

DROP TABLE IF EXISTS `Truck`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Truck` (
  `truck_id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `plate_number` varchar(10) NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`truck_id`),
  UNIQUE KEY `plate_number` (`plate_number`),
  KEY `idx_truck_store` (`store_id`),
  CONSTRAINT `truck_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `Store` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TruckDelivery`
--

DROP TABLE IF EXISTS `TruckDelivery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TruckDelivery` (
  `delivery_id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `order_id` int NOT NULL,
  `route_id` varchar(5) NOT NULL,
  `truck_id` int NOT NULL,
  `scheduled_departure` datetime NOT NULL,
  `actual_departure` datetime DEFAULT NULL,
  `actual_arrival` datetime DEFAULT NULL,
  `status` varchar(30) DEFAULT 'Scheduled',
  PRIMARY KEY (`delivery_id`),
  KEY `store_id` (`store_id`),
  KEY `idx_delivery_order` (`order_id`),
  KEY `idx_delivery_route` (`route_id`),
  KEY `idx_delivery_truck` (`truck_id`),
  KEY `idx_delivery_date` (`scheduled_departure`),
  CONSTRAINT `truckdelivery_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `Store` (`store_id`),
  CONSTRAINT `truckdelivery_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `Order` (`order_id`),
  CONSTRAINT `truckdelivery_ibfk_3` FOREIGN KEY (`route_id`) REFERENCES `TruckRoute` (`route_id`),
  CONSTRAINT `truckdelivery_ibfk_4` FOREIGN KEY (`truck_id`) REFERENCES `Truck` (`truck_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TruckEmployeeAssignment`
--

DROP TABLE IF EXISTS `TruckEmployeeAssignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TruckEmployeeAssignment` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `truck_delivery_id` int NOT NULL,
  `assigned_hours` double DEFAULT '0',
  PRIMARY KEY (`assignment_id`),
  KEY `idx_assignment_employee` (`employee_id`),
  KEY `idx_assignment_delivery` (`truck_delivery_id`),
  CONSTRAINT `truckemployeeassignment_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `Employee` (`employee_id`),
  CONSTRAINT `truckemployeeassignment_ibfk_2` FOREIGN KEY (`truck_delivery_id`) REFERENCES `TruckDelivery` (`delivery_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TruckRoute`
--

DROP TABLE IF EXISTS `TruckRoute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TruckRoute` (
  `route_id` varchar(5) NOT NULL,
  `area_name` varchar(50) NOT NULL,
  `max_delivery_time` double NOT NULL,
  PRIMARY KEY (`route_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TruckStopsAt`
--

DROP TABLE IF EXISTS `TruckStopsAt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TruckStopsAt` (
  `route_id` varchar(5) NOT NULL,
  `city_id` int NOT NULL,
  `stop_sequence` int NOT NULL,
  PRIMARY KEY (`route_id`,`city_id`),
  KEY `idx_truckstops_city` (`city_id`),
  CONSTRAINT `truckstopsat_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `TruckRoute` (`route_id`) ON DELETE CASCADE,
  CONSTRAINT `truckstopsat_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `City` (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'kandypacklogistics'
--
/*!50003 DROP PROCEDURE IF EXISTS `AllocateOrderToTrain` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `AllocateOrderToTrain`(
    IN order_id_param INT,
    IN product_id_param INT,
    IN destination_store_id INT,
    IN preferred_date DATE,
    OUT allocation_result VARCHAR(200)
)
BEGIN
    DECLARE available_train_id INT;
    DECLARE available_space DOUBLE;
    DECLARE order_qty INT;
    DECLARE space_per_unit DOUBLE;
    DECLARE allocatable_qty INT;
    
    SELECT oi.quantity, p.unit_space 
    INTO order_qty, space_per_unit
    FROM OrderItem oi
    JOIN Product p ON oi.product_id = p.product_id
    WHERE oi.order_id = order_id_param AND oi.product_id = product_id_param;
    
    SELECT t.train_id, (t.capacity_space - COALESCE(SUM(ta.total_space_used), 0)) 
    INTO available_train_id, available_space
    FROM Train t
    LEFT JOIN TrainAllocation ta ON t.train_id = ta.train_id
    WHERE DATE(t.departure_date_time) >= preferred_date
    AND t.start_station = 'Kandy'
    GROUP BY t.train_id, t.capacity_space
    HAVING available_space >= (order_qty * space_per_unit)
    ORDER BY t.departure_date_time
    LIMIT 1;
    
    IF available_train_id IS NOT NULL THEN
        INSERT INTO TrainAllocation (train_id, order_id, product_id, store_id, allocated_qty, start_date_time, unit_space)
        VALUES (available_train_id, order_id_param, product_id_param, destination_store_id, order_qty, 
                (SELECT departure_date_time FROM Train WHERE train_id = available_train_id), space_per_unit);
        
        SET allocation_result = CONCAT('Full allocation successful: ', order_qty, ' units to train ', available_train_id);
    ELSE
        SELECT t.train_id, (t.capacity_space - COALESCE(SUM(ta.total_space_used), 0)) 
        INTO available_train_id, available_space
        FROM Train t
        LEFT JOIN TrainAllocation ta ON t.train_id = ta.train_id
        WHERE DATE(t.departure_date_time) >= preferred_date
        AND t.start_station = 'Kandy'
        GROUP BY t.train_id, t.capacity_space
        HAVING available_space > 0
        ORDER BY t.departure_date_time
        LIMIT 1;
        
        IF available_train_id IS NOT NULL THEN
            SET allocatable_qty = FLOOR(available_space / space_per_unit);
            SET allocatable_qty = LEAST(allocatable_qty, order_qty);
            
            INSERT INTO TrainAllocation (train_id, order_id, product_id, store_id, allocated_qty, start_date_time, unit_space)
            VALUES (available_train_id, order_id_param, product_id_param, destination_store_id, allocatable_qty,
                    (SELECT departure_date_time FROM Train WHERE train_id = available_train_id), space_per_unit);
            
            SET allocation_result = CONCAT('Partial allocation: ', allocatable_qty, ' units to train ', available_train_id, 
                                         '. Remaining: ', (order_qty - allocatable_qty), ' units need next trip.');
        ELSE
            SET allocation_result = 'No available train capacity found for this date range';
        END IF;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CityRouteSalesReport` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `CityRouteSalesReport`(IN report_date DATE)
BEGIN
    SELECT 
        c.city_name,
        COALESCE(tr.area_name, 'Direct Store Delivery') AS route_area,
        COUNT(DISTINCT o.order_id) AS Order_Count,
        SUM(o.total_quantity) AS Total_Volume,
        ROUND(SUM(o.total_price), 2) AS Total_Value,
        ROUND(AVG(o.total_price), 2) AS Avg_Order_Value
    FROM `Order` o
    JOIN CustomerAddress ca ON o.customer_id = ca.customer_id AND ca.is_primary = TRUE
    JOIN City c ON ca.city_id = c.city_id
    LEFT JOIN TruckDelivery td ON o.order_id = td.order_id
    LEFT JOIN TruckRoute tr ON td.route_id = tr.route_id
    WHERE o.order_date <= report_date AND o.status = 'Delivered'
    GROUP BY c.city_id, c.city_name, tr.route_id, tr.area_name
    ORDER BY Total_Value DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CustomerOrderHistory` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `CustomerOrderHistory`(IN customer_id_param INT)
BEGIN
    SELECT 
        o.order_id,
        o.order_date,
        o.required_date,
        o.status AS order_status,
        o.total_quantity,
        ROUND(o.total_price, 2) AS order_value,
        td.scheduled_departure,
        td.actual_arrival,
        td.status AS delivery_status,
        tr.area_name AS route_area,
        t.plate_number AS truck_number,
        GROUP_CONCAT(
            CASE 
                WHEN e.role_id = 1 THEN CONCAT(e.employee_name, ' (Driver)')
                WHEN e.role_id = 2 THEN CONCAT(e.employee_name, ' (Assistant)')
                ELSE e.employee_name
            END 
            SEPARATOR ', '
        ) AS assigned_team
    FROM `Order` o
    LEFT JOIN TruckDelivery td ON o.order_id = td.order_id
    LEFT JOIN TruckRoute tr ON td.route_id = tr.route_id
    LEFT JOIN Truck t ON td.truck_id = t.truck_id
    LEFT JOIN TruckEmployeeAssignment tea ON td.delivery_id = tea.truck_delivery_id
    LEFT JOIN Employee e ON tea.employee_id = e.employee_id
    WHERE o.customer_id = customer_id_param
    GROUP BY o.order_id, o.order_date, o.required_date, o.status, o.total_quantity, 
             o.total_price, td.scheduled_departure, td.actual_arrival, td.status, 
             tr.area_name, t.plate_number
    ORDER BY o.order_date DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `EmployeeHoursReport` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `EmployeeHoursReport`(IN week_start DATE, IN week_end DATE)
BEGIN
    SELECT 
        e.employee_name,
        r.role_name,
        e.total_hours_week AS Current_Week_Hours,
        COALESCE(SUM(tea.assigned_hours), 0) AS Assigned_This_Week,
        CASE 
            WHEN r.role_name = 'Driver' AND e.total_hours_week > 40 THEN 'EXCEEDED'
            WHEN r.role_name = 'Assistant' AND e.total_hours_week > 60 THEN 'EXCEEDED'
            ELSE 'OK'
        END AS Status,
        COUNT(DISTINCT tea.truck_delivery_id) AS Deliveries_This_Week
    FROM Employee e
    JOIN Roles r ON e.role_id = r.role_id
    LEFT JOIN TruckEmployeeAssignment tea ON e.employee_id = tea.employee_id
    LEFT JOIN TruckDelivery td ON tea.truck_delivery_id = td.delivery_id
    WHERE (td.scheduled_departure BETWEEN week_start AND week_end OR week_start IS NULL)
    GROUP BY e.employee_id, e.employee_name, r.role_name, e.total_hours_week
    ORDER BY Current_Week_Hours DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `MostOrderedItems` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `MostOrderedItems`(IN quarter_start DATE, IN quarter_end DATE)
BEGIN
    SELECT 
        p.product_name,
        p.product_type,
        COUNT(DISTINCT oi.order_id) AS Order_Count,
        SUM(oi.quantity) AS Total_Quantity,
        ROUND(SUM(oi.quantity * oi.unit_price), 2) AS Total_Value
    FROM OrderItem oi
    JOIN Product p ON oi.product_id = p.product_id
    JOIN `Order` o ON oi.order_id = o.order_id
    WHERE o.order_date BETWEEN quarter_start AND quarter_end 
        AND o.status = 'Delivered'
    GROUP BY p.product_id, p.product_name, p.product_type
    ORDER BY Total_Quantity DESC
    LIMIT 10;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `QuarterlySalesReport` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `QuarterlySalesReport`(IN quarter_start DATE, IN quarter_end DATE)
BEGIN
    SELECT 
        DATE_FORMAT(o.order_date, '%Y-Q%q') AS Quarter,
        COUNT(DISTINCT o.order_id) AS Order_Count,
        SUM(o.total_quantity) AS Total_Volume,
        ROUND(SUM(o.total_price), 2) AS Total_Value,
        ROUND(AVG(o.total_price), 2) AS Avg_Order_Value
    FROM `Order` o
    WHERE o.order_date BETWEEN quarter_start AND quarter_end 
        AND o.status = 'Delivered'
    GROUP BY DATE_FORMAT(o.order_date, '%Y-Q%q')
    ORDER BY Quarter;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `TruckUsageReport` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `TruckUsageReport`(IN month_start DATE, IN month_end DATE)
BEGIN
    SELECT 
        t.plate_number,
        s.store_name,
        COUNT(td.delivery_id) AS Total_Deliveries,
        SUM(CASE WHEN td.status = 'Delivered' THEN 1 ELSE 0 END) AS Successful_Deliveries,
        ROUND((SUM(CASE WHEN td.status = 'Delivered' THEN 1 ELSE 0 END) / NULLIF(COUNT(td.delivery_id), 0)) * 100, 2) AS Success_Rate,
        AVG(TIMESTAMPDIFF(HOUR, td.actual_departure, td.actual_arrival)) AS Avg_Delivery_Time_Hours,
        MIN(td.actual_arrival) AS Earliest_Completion,
        MAX(td.actual_arrival) AS Latest_Completion
    FROM Truck t
    JOIN Store s ON t.store_id = s.store_id
    LEFT JOIN TruckDelivery td ON t.truck_id = td.truck_id
    WHERE (td.scheduled_departure BETWEEN month_start AND month_end OR month_start IS NULL)
    GROUP BY t.truck_id, t.plate_number, s.store_name
    ORDER BY Total_Deliveries DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `orderallocationstatus`
--

/*!50001 DROP VIEW IF EXISTS `orderallocationstatus`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `orderallocationstatus` AS select `o`.`order_id` AS `order_id`,`c`.`customer_name` AS `customer_name`,`o`.`order_date` AS `order_date`,`o`.`total_quantity` AS `total_quantity`,`o`.`status` AS `order_status`,coalesce(sum(`ta`.`allocated_qty`),0) AS `total_allocated_qty`,(case when (`o`.`total_quantity` = coalesce(sum(`ta`.`allocated_qty`),0)) then 'Fully Allocated' when (coalesce(sum(`ta`.`allocated_qty`),0) > 0) then 'Partially Allocated' else 'Not Allocated' end) AS `allocation_status`,group_concat(distinct `t`.`train_name` separator ', ') AS `allocated_trains` from (((`order` `o` join `customer` `c` on((`o`.`customer_id` = `c`.`customer_id`))) left join `trainallocation` `ta` on((`o`.`order_id` = `ta`.`order_id`))) left join `train` `t` on((`ta`.`train_id` = `t`.`train_id`))) group by `o`.`order_id`,`c`.`customer_name`,`o`.`order_date`,`o`.`total_quantity`,`o`.`status` order by `o`.`order_date` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ordersummary`
--

/*!50001 DROP VIEW IF EXISTS `ordersummary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ordersummary` AS select `o`.`order_id` AS `order_id`,`c`.`customer_name` AS `customer_name`,`ct`.`customer_type` AS `customer_type`,`o`.`order_date` AS `order_date`,`o`.`required_date` AS `required_date`,`o`.`status` AS `status`,`o`.`total_quantity` AS `total_quantity`,round(`o`.`total_price`,2) AS `order_value`,`ca`.`city_id` AS `city_id`,`cty`.`city_name` AS `delivery_city`,`td`.`status` AS `delivery_status`,`tr`.`area_name` AS `route_area`,`t`.`plate_number` AS `truck_used` from (((((((`order` `o` join `customer` `c` on((`o`.`customer_id` = `c`.`customer_id`))) join `customertype` `ct` on((`c`.`customer_type_id` = `ct`.`customer_type_id`))) left join `customeraddress` `ca` on(((`c`.`customer_id` = `ca`.`customer_id`) and (`ca`.`is_primary` = true)))) left join `city` `cty` on((`ca`.`city_id` = `cty`.`city_id`))) left join `truckdelivery` `td` on((`o`.`order_id` = `td`.`order_id`))) left join `truckroute` `tr` on((`td`.`route_id` = `tr`.`route_id`))) left join `truck` `t` on((`td`.`truck_id` = `t`.`truck_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `trainutilization`
--

/*!50001 DROP VIEW IF EXISTS `trainutilization`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `trainutilization` AS select `t`.`train_id` AS `train_id`,`t`.`train_name` AS `train_name`,cast(`t`.`departure_date_time` as date) AS `trip_date`,cast(`t`.`departure_date_time` as time) AS `departure_time`,`t`.`capacity_space` AS `capacity_space`,coalesce(sum(`ta`.`total_space_used`),0) AS `used_space`,round(((coalesce(sum(`ta`.`total_space_used`),0) / `t`.`capacity_space`) * 100),2) AS `utilization_percentage`,count(distinct `ta`.`order_id`) AS `orders_allocated`,count(distinct concat(`ta`.`order_id`,'_',`ta`.`product_id`)) AS `items_allocated` from (`train` `t` left join `trainallocation` `ta` on((`t`.`train_id` = `ta`.`train_id`))) group by `t`.`train_id`,`t`.`train_name`,`t`.`departure_date_time`,`t`.`capacity_space` order by `t`.`departure_date_time` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14 23:09:53
