/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `City`
--


DROP TABLE IF EXISTS `auth_users`;
CREATE TABLE auth_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  email  VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);




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
-- Dumping data for table `City`
--

LOCK TABLES `City` WRITE;
/*!40000 ALTER TABLE `City` DISABLE KEYS */;
/*!40000 ALTER TABLE `City` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Customer`
--

DROP TABLE IF EXISTS `Customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Customer` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(20) NOT NULL,
  `registration_date` date NOT NULL,
  `customer_type_id` int DEFAULT NULL,
  `auth_id` INT UNIQUE,
  PRIMARY KEY (`customer_id`),
  FOREIGN KEY (auth_id) REFERENCES auth_users(id) ON DELETE CASCADE,
  KEY `idx_customer_type` (`customer_type_id`),
  FOREIGN KEY (`customer_type_id`) REFERENCES `customerType` (`customer_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Customer`
--

LOCK TABLES `Customer` WRITE;
/*!40000 ALTER TABLE `Customer` DISABLE KEYS */;
/*!40000 ALTER TABLE `Customer` ENABLE KEYS */;
UNLOCK TABLES;

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
  `district` varchar(15) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`address_id`),
  KEY `city_id` (`city_id`),
  KEY `idx_customer_address` (`customer_id`,`city_id`),
  CONSTRAINT `customeraddress_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `Customer` (`customer_id`) ON DELETE CASCADE,
  CONSTRAINT `customeraddress_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `City` (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CustomerAddress`
--

LOCK TABLES `CustomerAddress` WRITE;
/*!40000 ALTER TABLE `CustomerAddress` DISABLE KEYS */;
/*!40000 ALTER TABLE `CustomerAddress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CustomerContactNumber`
--

DROP TABLE IF EXISTS `CustomerContactNumber`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CustomerContactNumber` (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  `contact_number` varchar(10) NOT NULL,
  `customer_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`contact_number`),
=======
=======
>>>>>>> Stashed changes
  `conatct_number` varchar(10) NOT NULL,
  `customer_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`conatct_number`),
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customercontactnumber_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `Customer` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CustomerContactNumber`
--

LOCK TABLES `CustomerContactNumber` WRITE;
/*!40000 ALTER TABLE `CustomerContactNumber` DISABLE KEYS */;
/*!40000 ALTER TABLE `CustomerContactNumber` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customerType`
--

DROP TABLE IF EXISTS `customerType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customerType` (
  `customer_type_id` int NOT NULL AUTO_INCREMENT,
  `customer_type` varchar(20) NOT NULL,
  `credit_limit` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`customer_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customerType`
--

LOCK TABLES `customerType` WRITE;
/*!40000 ALTER TABLE `customerType` DISABLE KEYS */;
/*!40000 ALTER TABLE `customerType` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Employee`
--

DROP TABLE IF EXISTS `Employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Employee` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(20) NOT NULL,
  `employee_nic` varchar(12) NOT NULL,
  `official_contact_number` varchar(10) DEFAULT NULL,
  `registrated_date` date NOT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `total_hours_week` double DEFAULT '0',
  `role_id` int NOT NULL,
  `store_id` int NOT NULL,
  `auth_id` INT UNIQUE,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `employee_nic` (`employee_nic`),
  FOREIGN KEY (auth_id) REFERENCES auth_users(id) ON DELETE CASCADE,
  KEY `idx_employee_role` (`role_id`),
  KEY `idx_employee_store` (`store_id`),
  KEY `idx_employee_status` (`status`),
  FOREIGN KEY (`role_id`) REFERENCES `Roles` (`role_id`),
  FOREIGN KEY (`store_id`) REFERENCES `Store` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Employee`
--

LOCK TABLES `Employee` WRITE;
/*!40000 ALTER TABLE `Employee` DISABLE KEYS */;
/*!40000 ALTER TABLE `Employee` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `Order`
--

LOCK TABLES `Order` WRITE;
/*!40000 ALTER TABLE `Order` DISABLE KEYS */;
/*!40000 ALTER TABLE `Order` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `OrderItem`
--

LOCK TABLES `OrderItem` WRITE;
/*!40000 ALTER TABLE `OrderItem` DISABLE KEYS */;
/*!40000 ALTER TABLE `OrderItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(20) NOT NULL,
  `unit_space` double NOT NULL COMMENT 'space consumption per unit for train allocation',
  `unit_price` double NOT NULL,
  `product_type` varchar(50) NOT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(20) NOT NULL,
  `max_hours_week` double NOT NULL,
  PRIMARY KEY (`role_id`),
  CONSTRAINT `roles_chk_1` CHECK ((`max_hours_week` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Roles`
--

LOCK TABLES `Roles` WRITE;
/*!40000 ALTER TABLE `Roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `Roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Station`
--

DROP TABLE IF EXISTS `Station`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Station` (
  `station_id` int NOT NULL AUTO_INCREMENT,
  `station_name` varchar(20) NOT NULL,
  `city_id` int NOT NULL,
  PRIMARY KEY (`station_id`),
  KEY `idx_station_city` (`city_id`),
  CONSTRAINT `station_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `City` (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Station`
--

LOCK TABLES `Station` WRITE;
/*!40000 ALTER TABLE `Station` DISABLE KEYS */;
/*!40000 ALTER TABLE `Station` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Store`
--

DROP TABLE IF EXISTS `Store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Store` (
  `store_id` int NOT NULL AUTO_INCREMENT,
  `store_name` varchar(20) NOT NULL,
  `contact_number` varchar(10) NOT NULL,
  `nearest_station_id` int DEFAULT NULL,
  PRIMARY KEY (`store_id`),
  KEY `idx_store_station` (`nearest_station_id`),
  CONSTRAINT `store_ibfk_1` FOREIGN KEY (`nearest_station_id`) REFERENCES `Station` (`station_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Store`
--

LOCK TABLES `Store` WRITE;
/*!40000 ALTER TABLE `Store` DISABLE KEYS */;
/*!40000 ALTER TABLE `Store` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `train`
--

DROP TABLE IF EXISTS `train`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `train` (
  `train_id` int NOT NULL AUTO_INCREMENT,
  `train_name` varchar(20) NOT NULL,
  `start_station` varchar(20) NOT NULL,
  `departure_date_time` datetime NOT NULL,
  `arrival_date_time` datetime NOT NULL,
  `capacity_space` double NOT NULL DEFAULT '1000' COMMENT 'fixed cargo capacity per train trip',
  `pattern_id` int DEFAULT NULL,
  PRIMARY KEY (`train_id`),
  KEY `idx_train_departure` (`departure_date_time`),
  KEY `pattern_id` (`pattern_id`),
  CONSTRAINT `train_ibfk_1` FOREIGN KEY (`pattern_id`) REFERENCES `TrainRoutePattern` (`pattern_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `train`
--

LOCK TABLES `train` WRITE;
/*!40000 ALTER TABLE `train` DISABLE KEYS */;
/*!40000 ALTER TABLE `train` ENABLE KEYS */;
UNLOCK TABLES;

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
  `status` varchar(20) DEFAULT 'Allocated',
  `unit_space` double NOT NULL,
  `total_space_used` double GENERATED ALWAYS AS ((`allocated_qty` * `unit_space`)) STORED,
  PRIMARY KEY (`trip_id`),
  KEY `order_id` (`order_id`,`product_id`),
  KEY `store_id` (`store_id`),
  KEY `idx_train_allocation` (`train_id`,`order_id`,`product_id`),
  CONSTRAINT `trainallocation_ibfk_1` FOREIGN KEY (`train_id`) REFERENCES `train` (`train_id`) ON DELETE CASCADE,
  CONSTRAINT `trainallocation_ibfk_2` FOREIGN KEY (`order_id`, `product_id`) REFERENCES `OrderItem` (`order_id`, `product_id`) ON DELETE CASCADE,
  CONSTRAINT `trainallocation_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `Store` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TrainAllocation`
--

LOCK TABLES `TrainAllocation` WRITE;
/*!40000 ALTER TABLE `TrainAllocation` DISABLE KEYS */;
/*!40000 ALTER TABLE `TrainAllocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TrainRoutePattern`
--

DROP TABLE IF EXISTS `TrainRoutePattern`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TrainRoutePattern` (
  `pattern_id` int NOT NULL AUTO_INCREMENT,
  `train_name` varchar(10) NOT NULL,
  `station_id` int NOT NULL,
  `stop_sequence` int NOT NULL,
  `arrival_time` datetime NOT NULL,
  `departure_time` datetime NOT NULL,
  PRIMARY KEY (`pattern_id`),
  UNIQUE KEY `unique_opattern_stop` (`train_name`,`station_id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `trainroutepattern_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `station` (`station_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TrainRoutePattern`
--

LOCK TABLES `TrainRoutePattern` WRITE;
/*!40000 ALTER TABLE `TrainRoutePattern` DISABLE KEYS */;
/*!40000 ALTER TABLE `TrainRoutePattern` ENABLE KEYS */;
UNLOCK TABLES;
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes

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
-- Dumping data for table `Truck`
--

LOCK TABLES `Truck` WRITE;
/*!40000 ALTER TABLE `Truck` DISABLE KEYS */;
/*!40000 ALTER TABLE `Truck` ENABLE KEYS */;
UNLOCK TABLES;

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
  `status` varchar(20) DEFAULT 'Scheduled',
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
-- Dumping data for table `TruckDelivery`
--

LOCK TABLES `TruckDelivery` WRITE;
/*!40000 ALTER TABLE `TruckDelivery` DISABLE KEYS */;
/*!40000 ALTER TABLE `TruckDelivery` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `TruckEmployeeAssignment`
--

LOCK TABLES `TruckEmployeeAssignment` WRITE;
/*!40000 ALTER TABLE `TruckEmployeeAssignment` DISABLE KEYS */;
/*!40000 ALTER TABLE `TruckEmployeeAssignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TruckRoute`
--

DROP TABLE IF EXISTS `TruckRoute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TruckRoute` (
  `route_id` varchar(5) NOT NULL,
  `area_name` varchar(20) NOT NULL,
  `max_delivery_time` double NOT NULL,
  PRIMARY KEY (`route_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TruckRoute`
--

LOCK TABLES `TruckRoute` WRITE;
/*!40000 ALTER TABLE `TruckRoute` DISABLE KEYS */;
/*!40000 ALTER TABLE `TruckRoute` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `TruckStopsAt`
--

LOCK TABLES `TruckStopsAt` WRITE;
/*!40000 ALTER TABLE `TruckStopsAt` DISABLE KEYS */;
/*!40000 ALTER TABLE `TruckStopsAt` ENABLE KEYS */;
UNLOCK TABLES;
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

<<<<<<< Updated upstream
<<<<<<< Updated upstream
-- Dump completed on 2025-09-20 19:11:11
=======
-- Dump completed on 2025-09-22 13:48:49
>>>>>>> Stashed changes
=======
-- Dump completed on 2025-09-22 13:48:49
>>>>>>> Stashed changes
