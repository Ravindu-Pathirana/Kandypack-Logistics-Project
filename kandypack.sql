-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: kandypack
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Table structure for table `assistant`
--

DROP TABLE IF EXISTS `assistant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assistant` (
  `employee_id` int NOT NULL,
  `consecutive_deliveries` int NOT NULL DEFAULT '0',
  `next_available_time` datetime NOT NULL,
  `status` enum('On Duty','Available','On Leave','Break') NOT NULL DEFAULT 'Available',
  `last_delivery_time` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  CONSTRAINT `assistant_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assistant`
--

LOCK TABLES `assistant` WRITE;
/*!40000 ALTER TABLE `assistant` DISABLE KEYS */;
INSERT INTO `assistant` VALUES (21,0,'2025-10-18 22:20:57','Available',NULL),(22,0,'2025-10-18 22:20:57','Available',NULL);
/*!40000 ALTER TABLE `assistant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_users`
--

DROP TABLE IF EXISTS `auth_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(30) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_users`
--

LOCK TABLES `auth_users` WRITE;
/*!40000 ALTER TABLE `auth_users` DISABLE KEYS */;
INSERT INTO `auth_users` VALUES (1,'customer1','customer1@example.com','hashedpass1'),(2,'customer2','customer2@example.com','hashedpass2'),(3,'employee1','employee1@example.com','hashedpass3'),(4,'john_doe','john@example.com','hashed_password_1'),(5,'jane_smith','jane@example.com','hashed_password_2'),(6,'michael_brown','michael@example.com','hashed_password_3'),(7,'lisa_white','lisa@example.com','hashed_password_4');
/*!40000 ALTER TABLE `auth_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `city`
--

DROP TABLE IF EXISTS `city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `city` (
  `city_id` int NOT NULL AUTO_INCREMENT,
  `city_name` varchar(50) NOT NULL,
  PRIMARY KEY (`city_id`),
  UNIQUE KEY `city_name` (`city_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
INSERT INTO `city` VALUES (1,'Colombo'),(3,'Galle'),(2,'Kandy');
/*!40000 ALTER TABLE `city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(20) NOT NULL,
  `registration_date` date NOT NULL,
  `customer_type_id` int DEFAULT NULL,
  `auth_id` int DEFAULT NULL,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `auth_id` (`auth_id`),
  KEY `idx_customer_type` (`customer_type_id`),
  CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`auth_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `customer_ibfk_2` FOREIGN KEY (`customer_type_id`) REFERENCES `customertype` (`customer_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'John Doe','2025-01-15',1,1),(2,'Jane Smith','2025-02-20',2,2);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customeraddress`
--

DROP TABLE IF EXISTS `customeraddress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customeraddress` (
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
  CONSTRAINT `customeraddress_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE,
  CONSTRAINT `customeraddress_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `city` (`city_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customeraddress`
--

LOCK TABLES `customeraddress` WRITE;
/*!40000 ALTER TABLE `customeraddress` DISABLE KEYS */;
INSERT INTO `customeraddress` VALUES (1,1,'123 Main St',NULL,1,'Downtown',1),(2,2,'456 High St',NULL,2,'Uptown',1);
/*!40000 ALTER TABLE `customeraddress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customercontactnumber`
--

DROP TABLE IF EXISTS `customercontactnumber`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customercontactnumber` (
  `contact_number` varchar(10) NOT NULL,
  `customer_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`contact_number`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customercontactnumber_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customercontactnumber`
--

LOCK TABLES `customercontactnumber` WRITE;
/*!40000 ALTER TABLE `customercontactnumber` DISABLE KEYS */;
INSERT INTO `customercontactnumber` VALUES ('0771234567',1,1),('0777654321',2,1);
/*!40000 ALTER TABLE `customercontactnumber` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customertype`
--

DROP TABLE IF EXISTS `customertype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customertype` (
  `customer_type_id` int NOT NULL AUTO_INCREMENT,
  `customer_type` varchar(20) NOT NULL,
  `credit_limit` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`customer_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customertype`
--

LOCK TABLES `customertype` WRITE;
/*!40000 ALTER TABLE `customertype` DISABLE KEYS */;
INSERT INTO `customertype` VALUES (1,'Retail',500.00),(2,'Wholesale',5000.00);
/*!40000 ALTER TABLE `customertype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver`
--

DROP TABLE IF EXISTS `driver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver` (
  `employee_id` int NOT NULL,
  `consecutive_deliveries` int NOT NULL DEFAULT '0',
  `next_available_time` datetime NOT NULL,
  `status` enum('On Duty','Available','On Leave','Break') NOT NULL DEFAULT 'Available',
  `last_delivery_time` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  CONSTRAINT `driver_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver`
--

LOCK TABLES `driver` WRITE;
/*!40000 ALTER TABLE `driver` DISABLE KEYS */;
INSERT INTO `driver` VALUES (20,0,'2025-10-18 19:52:56','Available',NULL),(21,0,'2025-10-18 19:52:56','On Duty',NULL),(22,0,'2025-10-18 19:52:56','Available',NULL);
/*!40000 ALTER TABLE `driver` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(20) NOT NULL,
  `employee_nic` varchar(12) NOT NULL,
  `official_contact_number` varchar(10) DEFAULT NULL,
  `registrated_date` date NOT NULL,
  `employee_status` varchar(20) DEFAULT 'Active',
  `total_hours_week` double DEFAULT '0',
  `role_id` int NOT NULL,
  `store_id` int NOT NULL,
  `auth_id` int DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `employee_nic` (`employee_nic`),
  UNIQUE KEY `auth_id` (`auth_id`),
  KEY `idx_employee_role` (`role_id`),
  KEY `idx_employee_store` (`store_id`),
  KEY `idx_employee_status` (`employee_status`),
  CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`auth_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employee_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  CONSTRAINT `employee_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,'Alice Manager','123456789012','0111111111','2025-01-01','Active',0,1,1,3),(20,'John Doe','123456789V','0712345678','2025-01-01','Active',30,1,1,1),(21,'Jane Smith','987654321V','0771234567','2025-01-05','Active',40,2,1,2),(22,'Lisa White','321654987V','0723344556','2025-02-15','Active',40,2,2,4);
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `address_id` int DEFAULT NULL,
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
  KEY `order_ibfk_2` (`address_id`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  CONSTRAINT `order_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `customeraddress` (`address_id`),
  CONSTRAINT `order_chk_1` CHECK ((`required_date` >= (`order_date` + interval 7 day)))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,1,1,'2025-10-10','2025-10-20','Pending','2025-10-10 10:30:00','2025-10-11 14:00:00',5,150.75),(2,1,1,'2025-10-15','2025-10-25','Shipped','2025-10-15 09:15:00','2025-10-16 11:45:00',3,89.50),(3,2,2,'2025-10-12','2025-10-22','Delivered','2025-10-12 16:20:00','2025-10-13 08:10:00',8,245.00),(4,2,2,'2025-09-25','2025-10-05','Pending','2025-09-25 12:00:00','2025-09-26 09:00:00',2,45.00);
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderitem`
--

DROP TABLE IF EXISTS `orderitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderitem`
--

LOCK TABLES `orderitem` WRITE;
/*!40000 ALTER TABLE `orderitem` DISABLE KEYS */;
INSERT INTO `orderitem` VALUES (1,1,2,25.00),(1,2,3,40.00),(2,3,3,10.00),(3,1,5,25.00),(3,2,3,40.00),(4,3,2,10.00);
/*!40000 ALTER TABLE `orderitem` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'Widget A',1.5,25,'Electronics'),(2,'Gadget B',2,40,'Electronics'),(3,'Tool C',0.5,10,'Hardware');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(20) NOT NULL,
  `max_hours_week` double NOT NULL,
  PRIMARY KEY (`role_id`),
  CONSTRAINT `roles_chk_1` CHECK ((`max_hours_week` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Manager',40),(2,'Driver',50);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `station`
--

DROP TABLE IF EXISTS `station`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `station` (
  `station_id` int NOT NULL AUTO_INCREMENT,
  `station_name` varchar(20) NOT NULL,
  `city_id` int NOT NULL,
  PRIMARY KEY (`station_id`),
  KEY `idx_station_city` (`city_id`),
  CONSTRAINT `station_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `city` (`city_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `station`
--

LOCK TABLES `station` WRITE;
/*!40000 ALTER TABLE `station` DISABLE KEYS */;
INSERT INTO `station` VALUES (1,'Fort Station',1),(2,'Kandy Station',2);
/*!40000 ALTER TABLE `station` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store`
--

DROP TABLE IF EXISTS `store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store` (
  `store_id` int NOT NULL AUTO_INCREMENT,
  `store_name` varchar(20) NOT NULL,
  `contact_number` varchar(10) NOT NULL,
  `nearest_station_id` int DEFAULT NULL,
  PRIMARY KEY (`store_id`),
  KEY `idx_store_station` (`nearest_station_id`),
  CONSTRAINT `store_ibfk_1` FOREIGN KEY (`nearest_station_id`) REFERENCES `station` (`station_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store`
--

LOCK TABLES `store` WRITE;
/*!40000 ALTER TABLE `store` DISABLE KEYS */;
INSERT INTO `store` VALUES (1,'Main Store','0112345678',1),(2,'Kandy Store','0812345678',2);
/*!40000 ALTER TABLE `store` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainallocation`
--

DROP TABLE IF EXISTS `trainallocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainallocation` (
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
  CONSTRAINT `trainallocation_ibfk_2` FOREIGN KEY (`order_id`, `product_id`) REFERENCES `orderitem` (`order_id`, `product_id`) ON DELETE CASCADE,
  CONSTRAINT `trainallocation_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainallocation`
--

LOCK TABLES `trainallocation` WRITE;
/*!40000 ALTER TABLE `trainallocation` DISABLE KEYS */;
/*!40000 ALTER TABLE `trainallocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainroutepattern`
--

DROP TABLE IF EXISTS `trainroutepattern`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainroutepattern` (
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
-- Dumping data for table `trainroutepattern`
--

LOCK TABLES `trainroutepattern` WRITE;
/*!40000 ALTER TABLE `trainroutepattern` DISABLE KEYS */;
/*!40000 ALTER TABLE `trainroutepattern` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `truck`
--

DROP TABLE IF EXISTS `truck`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `truck` (
  `truck_id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `plate_number` varchar(10) NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`truck_id`),
  UNIQUE KEY `plate_number` (`plate_number`),
  KEY `idx_truck_store` (`store_id`),
  CONSTRAINT `truck_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `truck`
--

LOCK TABLES `truck` WRITE;
/*!40000 ALTER TABLE `truck` DISABLE KEYS */;
INSERT INTO `truck` VALUES (1,1,'CBA-1234',1),(2,1,'CBA-5678',0),(3,2,'KDA-4321',1),(4,2,'LKA-8765',1);
/*!40000 ALTER TABLE `truck` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `truckdelivery`
--

DROP TABLE IF EXISTS `truckdelivery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `truckdelivery`
--

LOCK TABLES `truckdelivery` WRITE;
/*!40000 ALTER TABLE `truckdelivery` DISABLE KEYS */;
INSERT INTO `truckdelivery` VALUES (65,1,1,'R001',1,'2025-07-01 08:00:00','2025-07-01 08:10:00','2025-07-01 12:30:00','Delivered'),(66,2,2,'R002',3,'2025-07-01 09:00:00','2025-07-01 09:05:00','2025-07-01 14:00:00','Delivered'),(67,1,3,'R003',2,'2025-07-02 07:30:00','2025-07-02 07:35:00','2025-07-02 11:50:00','Delivered'),(68,2,4,'R004',4,'2025-07-02 08:00:00','2025-07-02 08:05:00','2025-07-02 12:40:00','Delivered');
/*!40000 ALTER TABLE `truckdelivery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `truckemployeeassignment`
--

DROP TABLE IF EXISTS `truckemployeeassignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `truckemployeeassignment`
--

LOCK TABLES `truckemployeeassignment` WRITE;
/*!40000 ALTER TABLE `truckemployeeassignment` DISABLE KEYS */;
INSERT INTO `truckemployeeassignment` VALUES (31,20,65,4.5),(32,21,65,4.5),(33,22,66,5),(34,20,66,5),(35,21,67,4.3),(36,22,67,4.3),(37,20,68,4.7),(38,21,68,4.7);
/*!40000 ALTER TABLE `truckemployeeassignment` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `check_consecutive_driver_deliveries` BEFORE INSERT ON `truckemployeeassignment` FOR EACH ROW BEGIN
    DECLARE role_name VARCHAR(20);
    DECLARE last_delivery_time DATETIME;
    DECLARE new_delivery_time DATETIME;

    -- Get the role of the employee
    SELECT r.role_name 
    INTO role_name
    FROM employee e
    JOIN roles r ON e.role_id = r.role_id
    WHERE e.employee_id = NEW.employee_id;

    -- Proceed only if driver
    IF role_name = 'Driver' THEN

        -- Get scheduled departure time for the new delivery
        SELECT td.scheduled_departure 
        INTO new_delivery_time
        FROM truckdelivery td
        WHERE td.delivery_id = NEW.truck_delivery_id;

        -- Get the most recent delivery assigned to this driver
        SELECT td.scheduled_departure
        INTO last_delivery_time
        FROM truckemployeeassignment tea
        JOIN truckdelivery td ON tea.truck_delivery_id = td.delivery_id
        WHERE tea.employee_id = NEW.employee_id
        ORDER BY td.scheduled_departure DESC
        LIMIT 1;

        -- Check if there’s less than 4 hours between last and new deliveries
        IF last_delivery_time IS NOT NULL 
           AND ABS(TIMESTAMPDIFF(HOUR, last_delivery_time, new_delivery_time)) < 4 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Driver cannot be assigned to consecutive deliveries without rest period.';
        END IF;

    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `check_weekly_hours` BEFORE INSERT ON `truckemployeeassignment` FOR EACH ROW BEGIN
    DECLARE total_hours DOUBLE DEFAULT 0;
    DECLARE role_name VARCHAR(20) DEFAULT '';
    DECLARE max_hours DOUBLE DEFAULT 0;
    DECLARE new_delivery_week INT DEFAULT 0;
    DECLARE msg VARCHAR(255) DEFAULT '';

    -- Get the role and max weekly hours for this employee
    SELECT r.role_name, r.max_hours_week
    INTO role_name, max_hours
    FROM employee e
    JOIN roles r ON e.role_id = r.role_id
    WHERE e.employee_id = NEW.employee_id
    LIMIT 1;

    -- Get the week number of the new delivery
    SELECT WEEK(td.scheduled_departure)
    INTO new_delivery_week
    FROM truckdelivery td
    WHERE td.delivery_id = NEW.truck_delivery_id
    LIMIT 1;

    -- Calculate total hours already assigned in that week
    SELECT IFNULL(SUM(ta.assigned_hours), 0)
    INTO total_hours
    FROM truckemployeeassignment ta
    JOIN truckdelivery td ON ta.truck_delivery_id = td.delivery_id
    WHERE ta.employee_id = NEW.employee_id
      AND WEEK(td.scheduled_departure) = new_delivery_week;

    -- Prepare message and raise error if limit exceeded
    IF total_hours + NEW.assigned_hours > max_hours THEN
        SET msg = CONCAT('Weekly hour limit exceeded for ', role_name, '. Max allowed: ', max_hours, ' hours. Currently assigned: ', total_hours + NEW.assigned_hours);
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `truckroute`
--

DROP TABLE IF EXISTS `truckroute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `truckroute` (
  `route_id` varchar(5) NOT NULL,
  `area_name` varchar(20) NOT NULL,
  `max_delivery_time` double NOT NULL,
  PRIMARY KEY (`route_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `truckroute`
--

LOCK TABLES `truckroute` WRITE;
/*!40000 ALTER TABLE `truckroute` DISABLE KEYS */;
INSERT INTO `truckroute` VALUES ('R001','Kandy Central',5.5),('R002','Peradeniya',6),('R003','Katugastota',4.5),('R004','Gampola',7);
/*!40000 ALTER TABLE `truckroute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `truckstopsat`
--

DROP TABLE IF EXISTS `truckstopsat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `truckstopsat` (
  `route_id` varchar(5) NOT NULL,
  `city_id` int NOT NULL,
  `stop_sequence` int NOT NULL,
  PRIMARY KEY (`route_id`,`city_id`),
  KEY `idx_truckstops_city` (`city_id`),
  CONSTRAINT `truckstopsat_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `truckroute` (`route_id`) ON DELETE CASCADE,
  CONSTRAINT `truckstopsat_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `city` (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `truckstopsat`
--

LOCK TABLES `truckstopsat` WRITE;
/*!40000 ALTER TABLE `truckstopsat` DISABLE KEYS */;
/*!40000 ALTER TABLE `truckstopsat` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-19  2:25:29
