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
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(280) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category_id` int DEFAULT NULL,
  `brand_id` int DEFAULT NULL,
  `tax_id` int DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(10,2) DEFAULT NULL,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hover_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `popular` tinyint(1) NOT NULL DEFAULT '0',
  `deal` tinyint(1) NOT NULL DEFAULT '0',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_key` (`slug`),
  KEY `products_category_id_fkey` (`category_id`),
  KEY `products_brand_id_fkey` (`brand_id`),
  KEY `products_tax_id_fkey` (`tax_id`),
  CONSTRAINT `products_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_tax_id_fkey` FOREIGN KEY (`tax_id`) REFERENCES `taxes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Premium Quality Toor Dal','premium-quality-toor-dal','Farm-fresh, protein-rich Toor Dal for everyday cooking.','',5,1,4,299.00,199.00,'/uploads/source/Product/dal/Toor-Dac924.jpg',NULL,'','',99,'1 Kg',1,0,1,'active','2026-04-09 13:00:38.953','2026-04-16 13:18:10.452'),(2,'Premium Quality Moong Dal','premium-quality-moong-dal','Nutritious and light Moong Dal for healthy meals.','',5,1,4,399.00,299.00,'/uploads/source/Product/dal/Moog-Dalc924.jpg',NULL,'','',100,'1 Kg',1,0,1,'active','2026-04-09 13:00:38.960','2026-04-15 12:15:17.359'),(3,'Premium Quality Urad Dal','premium-quality-urad-dal','Authentic Urad Dal with rich flavor and texture.','',5,1,4,349.00,269.00,'/uploads/source/Product/dal/urad-Dalc924.jpg',NULL,'','',98,'1 Kg',1,0,1,'active','2026-04-09 13:00:38.966','2026-04-17 12:18:47.401'),(4,'Premium Quality Harbara Dal','premium-quality-harbara-dal','Nutritious Harbara Dal with authentic taste.','',5,1,4,349.00,299.00,'/uploads/source/Product/dal/Harbara-Dalc924.jpg',NULL,'','',98,'1 Kg',1,0,1,'active','2026-04-09 13:00:38.970','2026-04-17 12:10:27.634'),(5,'Tofu Soy Paneer','tofu-soy-paneer','Our tofu is crafted to provide a rich source of protein.','',6,1,4,60.00,NULL,'/uploads/source/Product/tofu/tofuc924.jpg',NULL,'','',40,'200g',1,0,1,'active','2026-04-09 13:00:38.976','2026-04-17 12:46:59.357'),(6,'Lakdi Ghana Sunflower Oil','lakdi-ghana-sunflower-oil','Wood-pressed sunflower oil for healthy cooking.','',4,1,4,450.00,399.00,'/uploads/source/Product/Sunflower-Oil/Sunflower-Oil-01c924.jpg',NULL,'','',80,'1 Ltr',0,1,0,'active','2026-04-09 13:00:38.981','2026-04-15 12:15:17.359'),(7,'Lakdi Ghana Groundnut Oil','lakdi-ghana-groundnut-oil','Traditional wood-pressed groundnut oil.','',4,1,4,500.00,449.00,'/uploads/source/Product/Groundnut_oil/Groundnut-Oil-1c924.jpg',NULL,'','',78,'1 Ltr',0,1,0,'active','2026-04-09 13:00:38.985','2026-04-17 06:25:39.672'),(8,'Lokwan Wheat Stone Ground Atta','lokwan-wheat-stone-ground-atta','Traditional chakki-ground wheat flour.','test desc',3,1,NULL,80.00,65.00,'/uploads/source/Lokwan_Wheat_Atta_(2)c924.jpg',NULL,'https://www.google.com/','',182,'1 Kg',1,1,0,'active','2026-04-09 13:00:38.989','2026-04-17 11:10:51.245'),(9,'MP Sehori Wheat Atta','mp-sehori-wheat-atta','Premium MP wheat stone ground atta.','',1,1,NULL,90.00,75.00,'/uploads/source/Bag_v002c924.jpg',NULL,'','',141,'1 Kg',1,1,0,'active','2026-04-09 13:00:38.994','2026-04-17 12:18:47.393');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-18 18:22:14
