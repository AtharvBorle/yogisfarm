-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: yogisfarm
-- ------------------------------------------------------
-- Server version	8.4.0

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
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `gst` decimal(10,2) NOT NULL DEFAULT '0.00',
  `quantity` int NOT NULL DEFAULT '1',
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_fkey` (`order_id`),
  KEY `order_items_product_id_fkey` (`product_id`),
  CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,7,'Lakdi Ghana Groundnut Oil',NULL,'Yogis',500.00,51.00,0.00,1,449.00),(2,1,9,'MP Sehori Wheat Atta',NULL,'Yogis',90.00,15.00,0.00,1,75.00),(3,2,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,0.00,1,60.00),(4,2,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,0.00,1,65.00),(5,3,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,0.00,2,120.00),(6,3,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,0.00,1,65.00),(7,3,9,'MP Sehori Wheat Atta',NULL,'Yogis',90.00,15.00,0.00,1,75.00),(8,4,4,'Premium Quality Harbara Dal',NULL,'Yogis',349.00,50.00,0.00,1,299.00),(9,4,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,0.00,1,60.00),(10,5,4,'Premium Quality Harbara Dal',NULL,'Yogis',349.00,50.00,53.82,1,299.00),(11,6,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,10.80,1,60.00),(12,7,1,'Premium Quality Toor Dal',NULL,'Yogis',299.00,100.00,35.82,1,199.00),(13,8,9,'MP Sehori Wheat Atta','1kg','Yogis',90.00,75.00,67.50,5,375.00),(14,8,9,'MP Sehori Wheat Atta','2kg','Yogis',180.00,400.00,252.00,10,1400.00),(15,8,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,10.80,1,60.00),(16,9,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,10.80,1,60.00),(17,10,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(18,10,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,10.80,1,60.00),(19,11,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(20,11,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,10.80,1,60.00),(21,12,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,10.80,1,60.00),(22,12,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(23,13,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,10.80,1,60.00),(24,13,4,'Premium Quality Harbara Dal',NULL,'Yogis',349.00,50.00,53.82,1,299.00),(25,14,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(26,15,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(27,16,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(28,17,7,'Lakdi Ghana Groundnut Oil',NULL,'Yogis',500.00,51.00,80.82,1,449.00),(29,18,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(30,19,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(31,19,7,'Lakdi Ghana Groundnut Oil',NULL,'Yogis',500.00,51.00,80.82,1,449.00),(32,20,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(33,21,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(34,22,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(35,22,9,'MP Sehori Wheat Atta',NULL,'Yogis',90.00,15.00,13.50,1,75.00),(36,23,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(37,23,9,'MP Sehori Wheat Atta',NULL,'Yogis',90.00,15.00,13.50,1,75.00),(38,24,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(39,24,9,'MP Sehori Wheat Atta',NULL,'Yogis',90.00,15.00,13.50,1,75.00),(40,25,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,10.80,1,60.00),(41,26,9,'MP Sehori Wheat Atta',NULL,'Yogis',90.00,15.00,13.50,1,75.00),(42,26,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(43,27,9,'MP Sehori Wheat Atta',NULL,'Yogis',90.00,15.00,13.50,1,75.00),(44,27,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(45,28,9,'MP Sehori Wheat Atta',NULL,'Yogis',90.00,15.00,13.50,1,75.00),(46,28,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(47,29,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(48,29,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,10.80,1,60.00),(49,30,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(50,31,8,'Lokwan Wheat Stone Ground Atta',NULL,'Yogis',80.00,15.00,11.70,1,65.00),(51,32,3,'Premium Quality Urad Dal',NULL,'Yogis',349.00,80.00,48.42,1,269.00),(52,33,9,'MP Sehori Wheat Atta',NULL,'Yogis',90.00,15.00,13.50,1,75.00),(53,34,9,'MP Sehori Wheat Atta',NULL,'Yogis',90.00,15.00,13.50,1,75.00),(54,35,4,'Premium Quality Harbara Dal',NULL,'Yogis',349.00,50.00,53.82,1,299.00),(55,36,9,'MP Sehori Wheat Atta',NULL,'Yogis',90.00,15.00,13.50,1,75.00),(56,36,3,'Premium Quality Urad Dal',NULL,'Yogis',349.00,80.00,48.42,1,269.00),(57,37,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,10.80,1,60.00),(58,38,5,'Tofu Soy Paneer',NULL,'Yogis',60.00,0.00,10.80,1,60.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-18 18:22:12
