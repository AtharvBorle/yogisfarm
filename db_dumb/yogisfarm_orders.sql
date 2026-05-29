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
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_id` int DEFAULT NULL,
  `address_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_text` text COLLATE utf8mb4_unicode_ci,
  `address_city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_pincode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `shipping` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `coupon_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_method` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cod',
  `payment_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_description` text COLLATE utf8mb4_unicode_ci,
  `order_note` text COLLATE utf8mb4_unicode_ci,
  `delivery_boy_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `address_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Home',
  `courier_partner_id` int DEFAULT NULL,
  `delivery_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_key` (`order_number`),
  KEY `orders_user_id_fkey` (`user_id`),
  KEY `orders_address_id_fkey` (`address_id`),
  KEY `orders_delivery_boy_id_fkey` (`delivery_boy_id`),
  KEY `orders_courier_partner_id_fkey` (`courier_partner_id`),
  CONSTRAINT `orders_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_courier_partner_id_fkey` FOREIGN KEY (`courier_partner_id`) REFERENCES `courier_partners` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_delivery_boy_id_fkey` FOREIGN KEY (`delivery_boy_id`) REFERENCES `delivery_boys` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,'YF-O26-04-0001',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',524.00,0.00,104.80,0.00,419.20,'test20','delivered','online','verified','','test',1,'2026-04-14 10:40:45.387','2026-04-14 11:22:41.292','Home',NULL,NULL,NULL),(2,1,'YF-O26-04-0002',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',125.00,50.00,25.00,0.00,150.00,'test20','placed','cod','pending',NULL,NULL,NULL,'2026-04-15 08:56:30.599','2026-04-15 08:56:30.599','Home',NULL,NULL,NULL),(3,1,'YF-O26-04-0003',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',260.00,50.00,52.00,0.00,258.00,'test20','placed','online','completed','pay_SdjQ56SzdCm0zs','test',NULL,'2026-04-15 10:12:29.313','2026-04-15 10:24:12.766','Home',1,'courier','FMPR0872143993'),(4,1,'YF-O26-04-0004',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',359.00,50.00,0.00,0.00,409.00,NULL,'placed','cod','pending',NULL,'test',NULL,'2026-04-15 11:57:37.289','2026-04-15 11:57:37.289','Home',NULL,NULL,NULL),(5,1,'YF-O26-04-0005',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',299.00,50.00,59.80,53.82,343.02,'test20','confirmed','cod','completed','',NULL,NULL,'2026-04-15 13:20:05.117','2026-04-16 08:50:42.973','Home',NULL,NULL,NULL),(6,1,'YF-O26-04-0006',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',60.00,50.00,0.00,10.80,120.80,NULL,'delivered','cod','paid',NULL,NULL,3,'2026-04-16 13:08:59.413','2026-04-16 13:42:32.786','Home',NULL,'delivery_boy',NULL),(7,1,'YF-O26-04-0007',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',199.00,50.00,0.00,35.82,284.82,NULL,'delivered','cod','completed','',NULL,3,'2026-04-16 13:18:10.433','2026-04-16 13:32:54.447','Home',NULL,'delivery_boy',NULL),(8,1,'YF-O26-04-0008',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',1835.00,0.00,0.00,330.30,2165.30,NULL,'delivered','cod','completed','',NULL,3,'2026-04-16 13:33:55.235','2026-04-16 13:35:06.703','Home',NULL,'delivery_boy',NULL),(9,1,'YF-O26-04-0009',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',60.00,50.00,0.00,10.80,120.80,NULL,'delivered','cod','paid',NULL,NULL,3,'2026-04-16 13:44:18.811','2026-04-16 13:47:41.883','Home',NULL,'delivery_boy',NULL),(10,1,'YF-O26-04-0010',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',125.00,50.00,0.00,22.50,197.50,NULL,'delivered','online','pending',NULL,NULL,3,'2026-04-16 13:45:41.261','2026-04-16 13:53:38.031','Home',NULL,'delivery_boy',NULL),(11,1,'YF-O26-04-0011',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',125.00,50.00,0.00,22.50,197.50,NULL,'delivered','online','completed','pay_SeBZ1rMS5L3cKh',NULL,3,'2026-04-16 13:45:42.688','2026-04-16 13:53:46.829','Home',NULL,'delivery_boy',NULL),(12,1,'YF-O26-04-0012',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',125.00,50.00,0.00,22.50,197.50,NULL,'delivered','cod','paid',NULL,NULL,3,'2026-04-16 13:54:35.881','2026-04-16 13:55:37.204','Home',NULL,'delivery_boy',NULL),(13,1,'YF-O26-04-0013',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',359.00,50.00,71.80,64.62,401.82,'test20','delivered','cod','paid',NULL,NULL,3,'2026-04-16 14:01:12.654','2026-04-16 14:10:30.931','Home',NULL,'delivery_boy',NULL),(14,1,'YF-O26-04-0014',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',65.00,50.00,0.00,11.70,126.70,NULL,'placed','online','pending',NULL,NULL,NULL,'2026-04-17 06:21:55.280','2026-04-17 06:21:55.280','Home',NULL,NULL,NULL),(15,1,'YF-O26-04-0015',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',65.00,50.00,0.00,11.70,126.70,NULL,'placed','online','pending',NULL,NULL,NULL,'2026-04-17 06:22:02.902','2026-04-17 06:22:02.902','Home',NULL,NULL,NULL),(16,1,'YF-O26-04-0016',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',65.00,50.00,0.00,11.70,126.70,NULL,'placed','cod','pending',NULL,NULL,NULL,'2026-04-17 06:22:21.422','2026-04-17 06:22:21.422','Home',NULL,NULL,NULL),(17,1,'YF-O26-04-0017',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',449.00,50.00,0.00,80.82,579.82,NULL,'placed','online','pending',NULL,NULL,NULL,'2026-04-17 06:22:44.686','2026-04-17 06:22:44.686','Home',NULL,NULL,NULL),(18,1,'YF-O26-04-0018',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',65.00,50.00,0.00,11.70,126.70,NULL,'placed','online','pending',NULL,NULL,NULL,'2026-04-17 06:24:57.816','2026-04-17 06:24:57.816','Home',NULL,NULL,NULL),(19,1,'YF-O26-04-0019',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',514.00,0.00,0.00,92.52,606.52,NULL,'placed','online','pending',NULL,NULL,NULL,'2026-04-17 06:25:39.611','2026-04-17 06:25:39.611','Home',NULL,NULL,NULL),(20,1,'YF-O26-04-0020',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',65.00,50.00,0.00,11.70,126.70,NULL,'placed','online','pending',NULL,NULL,NULL,'2026-04-17 06:26:19.062','2026-04-17 06:26:19.062','Home',NULL,NULL,NULL),(21,1,'YF-O26-04-0021',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',65.00,50.00,0.00,11.70,126.70,NULL,'placed','online','pending',NULL,NULL,NULL,'2026-04-17 06:33:25.778','2026-04-17 06:33:25.778','Home',NULL,NULL,NULL),(22,1,'YF-O26-04-0022',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',140.00,50.00,0.00,25.20,215.20,NULL,'shipped','online','pending',NULL,NULL,NULL,'2026-04-17 06:39:59.596','2026-04-17 12:34:46.481','Home',1,'courier','asfwf3434wd'),(23,1,'YF-O26-04-0023',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',140.00,50.00,0.00,25.20,215.20,NULL,'shipped','online','pending',NULL,NULL,NULL,'2026-04-17 06:41:01.419','2026-04-17 12:34:05.480','Home',1,'courier',NULL),(24,1,'YF-O26-04-0024',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',140.00,50.00,0.00,25.20,215.20,NULL,'shipped','online','pending',NULL,NULL,3,'2026-04-17 06:45:00.614','2026-04-17 12:32:57.544','Home',NULL,'delivery_boy',NULL),(25,1,'YF-O26-04-0025',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',60.00,50.00,0.00,10.80,120.80,NULL,'cancelled','online','pending',NULL,NULL,3,'2026-04-17 07:09:24.767','2026-04-17 12:32:04.791','Home',NULL,'delivery_boy',NULL),(26,1,'YF-O26-04-0026',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',140.00,50.00,0.00,25.20,215.20,NULL,'shipped','online','pending',NULL,NULL,3,'2026-04-17 10:10:13.186','2026-04-17 12:28:37.496','Home',NULL,'delivery_boy',NULL),(27,1,'YF-O26-04-0027',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',140.00,50.00,0.00,25.20,215.20,NULL,'shipped','online','pending',NULL,NULL,3,'2026-04-17 10:10:16.425','2026-04-17 12:27:34.455','Home',NULL,'delivery_boy',NULL),(28,1,'YF-O26-04-0028',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',140.00,50.00,0.00,25.20,215.20,NULL,'delivered','cod','paid',NULL,NULL,3,'2026-04-17 10:17:12.556','2026-04-17 10:30:29.967','Home',NULL,'delivery_boy',NULL),(29,1,'YF-O26-04-0029',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',125.00,50.00,0.00,22.50,197.50,NULL,'shipped','online','completed','pay_SeX9vdnA6s72KA',NULL,NULL,'2026-04-17 10:53:40.346','2026-04-17 10:54:22.289','Home',1,'courier','FMPR0872143993'),(30,1,'YF-O26-04-0030',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',65.00,50.00,0.00,11.70,126.70,NULL,'cancelled','cod','pending',NULL,NULL,NULL,'2026-04-17 11:03:35.285','2026-04-17 11:03:50.686','Home',NULL,NULL,NULL),(31,1,'YF-O26-04-0031',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',65.00,50.00,0.00,11.70,126.70,NULL,'shipped','cod','pending',NULL,NULL,3,'2026-04-17 11:10:51.216','2026-04-17 11:12:30.580','Home',NULL,'delivery_boy',NULL),(32,1,'YF-O26-04-0032',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',269.00,50.00,0.00,48.42,367.42,NULL,'shipped','cod','pending',NULL,NULL,3,'2026-04-17 11:16:56.565','2026-04-17 11:21:33.364','Home',NULL,'delivery_boy',NULL),(33,1,'YF-O26-04-0033',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',75.00,50.00,0.00,13.50,138.50,NULL,'delivered','cod','paid',NULL,NULL,3,'2026-04-17 11:28:13.789','2026-04-17 12:08:37.908','Home',NULL,'delivery_boy',NULL),(34,1,'YF-O26-04-0034',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',75.00,50.00,0.00,13.50,138.50,NULL,'shipped','cod','pending',NULL,NULL,3,'2026-04-17 12:09:14.284','2026-04-17 12:09:59.437','Home',NULL,'delivery_boy',NULL),(35,1,'YF-O26-04-0035',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',299.00,50.00,0.00,53.82,402.82,NULL,'shipped','cod','pending',NULL,NULL,3,'2026-04-17 12:10:27.626','2026-04-17 12:10:42.196','Home',NULL,'delivery_boy',NULL),(36,1,'YF-O26-04-0036',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',344.00,50.00,0.00,61.92,455.92,NULL,'shipped','cod','pending',NULL,NULL,3,'2026-04-17 12:18:47.364','2026-04-17 12:18:59.285','Home',NULL,'delivery_boy',NULL),(37,1,'YF-O26-04-0037',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',60.00,50.00,0.00,10.80,120.80,NULL,'delivered','cod','paid',NULL,NULL,3,'2026-04-17 12:38:40.140','2026-04-17 12:39:43.383','Home',NULL,'delivery_boy',NULL),(38,1,'YF-O26-04-0038',1,'Omkar Joshi','08208081346','domkhel road','wagholi','Maharashtra','412207',60.00,50.00,12.00,10.80,108.80,'test20','delivered','cod','paid',NULL,NULL,3,'2026-04-17 12:46:59.349','2026-04-17 13:09:35.306','Home',NULL,'delivery_boy',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-18 18:22:11
