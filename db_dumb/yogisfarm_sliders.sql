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
-- Table structure for table `sliders`
--

DROP TABLE IF EXISTS `sliders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sliders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web',
  `position` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'main',
  `link_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sliders`
--

LOCK TABLES `sliders` WRITE;
/*!40000 ALTER TABLE `sliders` DISABLE KEYS */;
INSERT INTO `sliders` VALUES (5,'main-1','/uploads/main/1775806991162-main-slider--1.jpg','web','main','category','multigrain-atta',0,'active','2026-04-10 07:43:22.682','2026-04-17 12:48:22.494'),(6,'main-2','/uploads/main/1775806991163-main-slider--2.jpg','web','main','','',1,'active','2026-04-10 07:43:32.165','2026-04-17 12:48:11.217'),(7,'top-1','/uploads/top/1775807044048-top-slider-02.jpg','web','top','','',2,'active','2026-04-10 07:44:19.535','2026-04-17 12:48:11.229'),(8,'top-2','/uploads/top/1775807044049-top-sider-1.jpg','web','top','','',3,'active','2026-04-10 07:44:32.916','2026-04-17 12:48:11.239'),(9,'mid-1','/uploads/mid/1775807107859-middle-sider-2.jpg','web','middle','','',4,'active','2026-04-10 07:45:28.173','2026-04-17 12:48:11.248'),(10,'min-2','/uploads/mid/1775807107856-middle-sider-03.jpg','web','middle','','',5,'active','2026-04-10 07:45:41.679','2026-04-17 12:48:11.253'),(11,'mid-3','/uploads/mid/1775807107855-top-slider-02_(1).jpg','web','middle','','',6,'active','2026-04-10 07:45:54.829','2026-04-17 12:48:11.257'),(12,'bottom-1','/uploads/bottom/1775807179222-bottom-slider_(1).jpg','web','bottom','','',7,'active','2026-04-10 07:46:31.069','2026-04-17 12:48:11.262');
/*!40000 ALTER TABLE `sliders` ENABLE KEYS */;
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
