-- MySQL dump 10.13  Distrib 5.7.24, for osx10.14 (x86_64)
--
-- Host: localhost    Database: test
-- ------------------------------------------------------
-- Server version	5.7.24

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `batter`
--

DROP TABLE IF EXISTS `batter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `batter` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `player_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `RBI` bigint(20) unsigned NOT NULL,
  `H` bigint(20) unsigned NOT NULL,
  `OBP` double DEFAULT NULL,
  `AVG` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batter`
--

LOCK TABLES `batter` WRITE;
/*!40000 ALTER TABLE `batter` DISABLE KEYS */;
INSERT INTO `batter` VALUES (1,'王勝偉','中信兄弟','R272',6,12,0.208,0.174),(2,'張志豪','中信兄弟','R244',9,13,0.316,0.25),(3,'林書逸','中信兄弟','H876',9,22,0.319,0.262),(4,'王威晨','中信兄弟','H038',6,16,0.25,0.193),(5,'詹子賢','中信兄弟','k453',10,13,0.326,0.295),(6,'黃鈞聲','中信兄弟','R610',5,13,0.276,0.236),(7,'陳子豪','中信兄弟','E0J8',4,14,0.281,0.233),(8,'彭政閔','中信兄弟','E0C1',5,15,0.348,0.259),(9,'林智勝','中信兄弟','A044',11,17,0.386,0.283),(10,'陳江和','中信兄弟','R007',3,3,0.231,0.25),(11,'許基宏','中信兄弟','H230',3,4,0.27,0.129),(12,'周思齊','中信兄弟','G072',8,10,0.381,0.286),(13,'吳東融','中信兄弟','H529',0,5,0.333,0.238),(14,'林明杰','中信兄弟','H086',3,5,0.412,0.333),(15,'艾銳克','中信兄弟','004771',0,0,0,0),(16,'陳傑憲','統一7-ELEVEn','H929',15,29,0.432,0.372),(17,'蘇智傑','統一7-ELEVEn','H594',18,27,0.346,0.284),(18,'郭阜林','統一7-ELEVEn','H407',7,15,0.25,0.195),(19,'唐肇廷','統一7-ELEVEn','R346',2,13,0.317,0.232),(20,'陳鏞基','統一7-ELEVEn','L0K0',8,19,0.342,0.284),(21,'潘武雄','統一7-ELEVEn','L0G5',14,23,0.341,0.284),(22,'楊家維','統一7-ELEVEn','L0M3',13,20,0.342,0.299),(23,'鄭鎧文','統一7-ELEVEn','H353',2,5,0.333,0.217),(24,'陳重羽','統一7-ELEVEn','k454',7,16,0.283,0.271),(25,'羅國龍','統一7-ELEVEn','R613',0,6,0.286,0.231),(26,'高國慶','統一7-ELEVEn','L0E0',5,12,0.365,0.235),(27,'林祐樂','統一7-ELEVEn','H727',3,6,0.167,0.15),(28,'潘彥廷','統一7-ELEVEn','L0O6',3,4,0.296,0.174),(29,'蔡奕玄','統一7-ELEVEn','L0N6',2,4,0.318,0.211),(30,'林祖傑','統一7-ELEVEn','H456',1,1,0.071,0.071),(31,'江亮緯','統一7-ELEVEn','L0N5',2,7,0.405,0.25),(32,'方昶詠','統一7-ELEVEn','R579',0,0,0,0),(33,'藍寅倫','Lamigo','R595',22,36,0.384,0.346),(34,'林泓育','Lamigo','R529',13,33,0.436,0.371),(35,'郭嚴文','Lamigo','R405',18,29,0.41,0.337),(36,'朱育賢','Lamigo','H435',23,32,0.42,0.36),(37,'陳俊秀','Lamigo','R672',9,20,0.352,0.263),(38,'林智平','Lamigo','R407',4,11,0.381,0.297),(39,'陳晨威','Lamigo','004633',10,33,0.376,0.344),(40,'余德龍','Lamigo','R625',0,5,0.389,0.312),(41,'梁家榮','Lamigo','A0D1',5,12,0.348,0.293),(42,'劉時豪','Lamigo','H372',1,6,0.333,0.3),(43,'黃敬瑋','Lamigo','A0G0',8,14,0.352,0.292),(44,'廖健富','Lamigo','A0F7',10,16,0.421,0.34),(45,'邱丹','Lamigo','004634',1,4,0.278,0.235),(46,'郭永維','Lamigo','R235',0,0,0,0),(47,'詹智堯','Lamigo','z102',0,0,0.077,0),(48,'鍾承祐','Lamigo','R367',1,5,0.294,0.294),(49,'林承飛','Lamigo','A0F2',0,0,0,0),(50,'林立','Lamigo','k441',7,14,0.457,0.424),(51,'陽耀勳','Lamigo','SB29',1,1,0.333,0.143),(52,'王正棠','富邦','k462',5,20,0.338,0.299),(53,'林益全','富邦','R205',18,21,0.38,0.304),(54,'范國宸','富邦','k509',14,13,0.39,0.342),(55,'胡金龍','富邦','R678',5,19,0.368,0.311),(56,'林哲瑄','富邦','R401',13,24,0.346,0.312),(57,'陳品捷','富邦','H400',2,7,0.239,0.167),(58,'陳凱倫','富邦','R498',4,6,0.276,0.222),(59,'李宗賢','富邦','H593',2,11,0.324,0.306),(60,'高國麟','富邦','H229',5,6,0.353,0.214),(61,'張正偉','富邦','R457',3,8,0.5,0.364),(62,'林宥穎','富邦','R398',9,12,0.28,0.261),(63,'于孟馗','富邦','H329',0,3,0.292,0.15),(64,'高國輝','富邦','R400',4,5,0.346,0.227),(65,'蔣智賢','富邦','R399',6,14,0.365,0.298),(66,'楊晉豪','富邦','B0K3',0,1,0.5,0.25),(67,'申皓瑋','富邦','B0J9',0,0,0,0),(68,'蔡友達','富邦','B0I5',0,1,0.167,0.091),(69,'戴培峰','富邦','004645',2,2,0.182,0.182),(70,'張詠漢','富邦','R481',0,2,0.231,0.167);
/*!40000 ALTER TABLE `batter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pitcher`
--

DROP TABLE IF EXISTS `pitcher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pitcher` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `player_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ERA` double DEFAULT NULL,
  `WHIP` double DEFAULT NULL,
  `W` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=214 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pitcher`
--

LOCK TABLES `pitcher` WRITE;
/*!40000 ALTER TABLE `pitcher` DISABLE KEYS */;
INSERT INTO `pitcher` VALUES (158,'張竣龍','富邦','H041',2.08,1.5,0),(159,'陳鴻文','富邦','R669',2.45,1.27,0),(160,'賴鴻誠','富邦','R354',5.68,1.89,0),(161,'歐書誠','富邦','004628',1.26,0.98,1),(162,'倪福德','富邦','R081',1.69,1.5,0),(163,'伍鐸','富邦','E0L7',3.9,1.2,1),(164,'索沙','富邦','004770',1.26,0.77,4),(165,'林羿豪','富邦','R670',6.75,1.31,0),(166,'吳世豪','富邦','B0K4',14.4,2.6,0),(167,'陳仕朋','富邦','B0K0',6.05,1.6,2),(168,'羅嘉仁','富邦','R390',5.4,2.4,0),(169,'羅華韋','富邦','H524',0,1,0),(170,'林晨樺','富邦','B0G4',13.5,2.7,0),(171,'羅力','富邦','A0C0',3.57,1.42,1),(172,'黃子鵬','Lamigo','k428',0.68,0.9,1),(173,'王躍霖','Lamigo','H510',4.11,1.3,1),(174,'洪聖欽','Lamigo','H377',4.82,1.29,2),(175,'陳禹勳','Lamigo','A0D4',6.35,1.41,0),(176,'吳丞哲','Lamigo','k431',4.97,1.66,1),(177,'尼克斯','Lamigo','L0P1',3,1.09,2),(178,'李茲','Lamigo','004821',2.72,1.18,2),(179,'王溢正','Lamigo','R527',3.73,1.31,3),(180,'史博威','Lamigo','A0F6',7.41,1.76,0),(181,'賴智垣','Lamigo','k426',40.5,6,0),(182,'翁瑋均','Lamigo','004646',3.94,1,1),(183,'黃偉晟','Lamigo','R679',10.8,4.2,0),(184,'葉家淇','Lamigo','A0F1',81,9,0),(185,'蘇俊羽','Lamigo','A0E9',9,1.5,0),(186,'鄭凱文','中信兄弟','R396',2.31,1.03,3),(187,'鄭佳彥','中信兄弟','H468',4.5,1.25,0),(188,'謝榮豪','中信兄弟','R568',4.35,1.84,0),(189,'官大元','中信兄弟','R139',3.31,1.22,0),(190,'吳俊偉','中信兄弟','004625',4.15,1.54,3),(191,'李振昌','中信兄弟','R393',3,1.33,0),(192,'洪宸宇','中信兄弟','A0B6',10.8,3.3,0),(193,'艾迪頓','中信兄弟','E0M0',7.17,1.87,2),(194,'黃恩賜','中信兄弟','k425',2.61,1.11,1),(195,'楊志龍','中信兄弟','H305',6.08,1.46,1),(196,'蔡齊哲','中信兄弟','E0N3',4.91,1.32,1),(197,'萊福力','中信兄弟','004569',3.18,1.41,1),(198,'吳哲源','中信兄弟','H635',13.5,2.25,0),(199,'王鏡銘','統一7-ELEVEn','R455',11.57,1.46,0),(200,'知念広弥','統一7-ELEVEn','004620',10.38,2.42,2),(201,'陳韻文','統一7-ELEVEn','L0M7',1.35,0.98,0),(202,'邱浩鈞','統一7-ELEVEn','H108',5.19,1.62,0),(203,'林其緯','統一7-ELEVEn','R269',2.89,1.39,1),(204,'林子崴','統一7-ELEVEn','L0N4',19.29,3.86,0),(205,'劉軒荅','統一7-ELEVEn','004637',3.07,1.3,0),(206,'施子謙','統一7-ELEVEn','k505',8.26,1.69,0),(207,'鄭鈞仁','統一7-ELEVEn','k430',21.6,3,0),(208,'江辰晏','統一7-ELEVEn','L0L8',4.1,1.59,2),(209,'潘威倫','統一7-ELEVEn','L0C8',3.21,1.07,3),(210,'奧斯丁','統一7-ELEVEn','004820',6.12,1.52,1),(211,'羅里奇','統一7-ELEVEn','004571',2.93,1.21,1),(212,'郭恆孝','統一7-ELEVEn','L0N8',7.71,1.29,0),(213,'林威志','統一7-ELEVEn','H046',0,1,0);
/*!40000 ALTER TABLE `pitcher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cpbl_user`
--

DROP TABLE IF EXISTS `cpbl_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cpbl_user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `access_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `access_expired` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cpbl_user`
--

LOCK TABLES `cpbl_user` WRITE;
/*!40000 ALTER TABLE `cpbl_user` DISABLE KEYS */;
INSERT INTO `cpbl_user` VALUES (1,'tony','tonygooseduck@gmail.com','native','salt','hashed','8c942445a086147fe5d97806e164122af632919b3a0a4b03ed4f7f27e9388545',1558593367467),(2,'tony','tonygooseduck@hotmail.com','native','salt','hashed','d56af20fc0844481b3124818d9bd2ea385a9178b1e1c4797ca77373c27d1f049',1000),(3,'tony','test@test.com','native','salt','hashed','ab635977c3153429bcd010b1cf04844a26eb6afc2ae77f766b22480309fcecf3',1000),(4,'tony','charles@charles.com','native','salt','hashedpwd','971f2c0b6cccd7b0d3dd12556084f4eceba59068e6bd7962a8b5ccc1d8e7ec35',1558593841643),(5,'ffefe','efe@efeff','native','5a736e5595a9037319a1a99f939d8102b9271331163d994866869bfbeb47bdc5','hashedpwd','3c6f7715a641097f882fe66c6fb96c7c97fd98b2717d96652d3676e7e6271d19',1558593949267),(6,'ffff','ffff@ffff','native','0d291be21357fbf371478e252d64c777613cd6177033a03a831511461210f5e5','110f9d871dccb8f9496f5f241b4a7c84a49ccf2ef8d49314baf0b7c1bd9d190526b0370403b98a3a0930b7a86d1c3c2c7b3cb4d25605195f33bb2d9e63e1d3f6','8a2bc1037b0a434d5133715e230ff5cecc2a727f2d228324a25dc6b1d765a4a4',1558593984369),(7,'tttt','TTT@ttt','native','ae759a827869a199eecf7601e6642d8792bdae485a56ea1184ae950f01a3b284','c55d163162550d1e7fd8a26cebea90b397488022cec2231b51706ab0fb9c959ae11547bd44ca63e3840ad01a725c3497b69b93a55bda6ea6bf56b79f9d20f75a','5f2b2b63c83bbf2fb4ddd2c9cb4f6e7b51df4770c8b1ae81d5328a8b85417968',1558594612625),(8,'cccc','cccc@cccc','native','b08bd47e926efb87fc11af096461768c0e8e227d4e7201db94d04df3a298c449','25e9532e9ee5255eca9926da97a418f523a641961473b846df3b8a053bccca230ccab9449027b2df7b2b3502417f2db9e6786a7681a3b25b2edec3e0914e5312','9420d87c40662e87e801eff7e1fac9baec2afe4c726f6b6b0ce77edb13ee2117',1558595309711),(9,'gooseduck','gooseduck@mail.com','native','7abf1fb8fa4f7f8ff7874136647bdf484c42657c7c6806e0187a9882d9ba5eb0','34cf6b3e5f1ce6da6dd1a405170e1b34dabc1794fb3acec09f8595048eca360dc5b42e76420279057736476079e2cef9c20d2535bd88e06be890705c66bbab3c','fd5c6b7669f6048a0b791ff93b8ecd095dc04d1b1e3b1f615052007bb74b84f8',1559048250223),(10,'hahaha','haha@haha','native','111482b089d3979b6e0701be60d2092f8d42bc60f37569c12c7c73f741ce01b7','852af73949270c6c2ff7589e394511e863f5795cde3d928f297820ec20b390dce6a420f86781d4e7fedbdd9c7392838a4b62743c04a8a9a6b0c5cdeeb5f063b9','3d2b714b25c8d398d996339a11d025ae479785973f31391e73b41e2d5e78b4a5',1558686518525),(11,'charles','charles@charles','native','87f55233c62e45d051fe14bcf28873fa12e637ced7c99d38a148bfd02c195141','d3f0b5ffbe919d17983fac7865564fbedef8a0e06218c60fb20d44026b3699247f3116a3695bf6a420e59b48448b69ad65a3a265c0b31ff2f3479887a51290d8','e30982260d3e9ae3b2120501ae157520c80a2f513f6011c0aaa57c03c33c6639',1559016357809),(12,'tony','tony@tony','native','53fba6801aa9889144c78d177f9158f1d866a31c01c902712bb24620200c97e5','8d7543e53b12d30bbcb0925928e8594aff7cbc58db8d2b886dcfc060b05157438daa9e0098347068befb487585a11fcca509e3bbc107828565d9d243316bb9b0','83e1bc1317493362efd3f1c995b6179668da8838d3b1012dfc990ee78fba28d9',1559016400423);
/*!40000 ALTER TABLE `cpbl_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cpbl_game`
--

DROP TABLE IF EXISTS `cpbl_game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cpbl_game` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `league_id` bigint(20) unsigned NOT NULL,
  `date` bigint(20) unsigned NOT NULL,
  `result` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `home_user_id` bigint(20) unsigned NOT NULL,
  `away_user_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cpbl_game`
--

LOCK TABLES `cpbl_game` WRITE;
/*!40000 ALTER TABLE `cpbl_game` DISABLE KEYS */;
INSERT INTO `cpbl_game` VALUES (1,4,1556424690004,'L',11,12),(2,4,1556424690004,'W',10,9),(3,5,1556431428000,'W',11,9),(4,5,1556431428000,'L',10,12),(5,5,1556431728000,'L',10,11),(6,5,1556431728000,'W',12,9);
/*!40000 ALTER TABLE `cpbl_game` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cpbl_draft`
--

DROP TABLE IF EXISTS `cpbl_draft`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cpbl_draft` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `player_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `league_id` bigint(20) unsigned NOT NULL,
  `player_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cpbl_draft`
--

LOCK TABLES `cpbl_draft` WRITE;
/*!40000 ALTER TABLE `cpbl_draft` DISABLE KEYS */;
INSERT INTO `cpbl_draft` VALUES (1,9,'林智勝',2,'Start'),(2,10,'彭政閔',2,'W'),(3,9,'王勝偉',2,'W'),(4,10,'張志豪',2,'W'),(5,9,'林書逸',2,'W'),(6,10,'王威晨',2,'W'),(7,9,'詹子賢',3,'W'),(8,10,'黃鈞聲',3,'W'),(9,9,'陳子豪',3,'W'),(10,10,'陳江和',3,'W'),(11,9,'許基宏',3,'Start'),(12,10,'周思齊',3,'W'),(13,9,'林智勝',4,'W'),(14,10,'彭政閔',4,'W'),(15,11,'王勝偉',4,'W'),(16,12,'張志豪',4,'W'),(17,9,'林書逸',4,'W'),(18,10,'王威晨',4,'W'),(19,11,'詹子賢',4,'W'),(20,12,'黃鈞聲',4,'W'),(21,9,'陳子豪',4,'W'),(22,10,'陳江和',4,'W'),(23,11,'許基宏',4,'W'),(24,12,'周思齊',4,'W'),(25,9,'王勝偉',5,'W'),(26,10,'張志豪',5,'W'),(27,11,'林書逸',5,'W'),(28,12,'王威晨',5,'W'),(29,9,'詹子賢',5,'W'),(30,10,'黃鈞聲',5,'W'),(31,11,'陳子豪',5,'W'),(32,12,'彭政閔',5,'W'),(33,9,'林智勝',5,'W'),(34,10,'陳江和',5,'W'),(35,11,'許基宏',5,'W'),(36,12,'周思齊',5,'W');
/*!40000 ALTER TABLE `cpbl_draft` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cpbl_schedule`
--

DROP TABLE IF EXISTS `cpbl_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cpbl_schedule` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `date` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cpbl_schedule`
--

LOCK TABLES `cpbl_schedule` WRITE;
/*!40000 ALTER TABLE `cpbl_schedule` DISABLE KEYS */;
INSERT INTO `cpbl_schedule` VALUES (1,1556424570004),(2,1556424630007),(3,1556424690004),(4,1556431428000),(5,1556431728000);
/*!40000 ALTER TABLE `cpbl_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cpbl_league`
--

DROP TABLE IF EXISTS `cpbl_league`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cpbl_league` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cpbl_league`
--

LOCK TABLES `cpbl_league` WRITE;
/*!40000 ALTER TABLE `cpbl_league` DISABLE KEYS */;
INSERT INTO `cpbl_league` VALUES (2,'league1'),(3,'league1'),(4,'league3'),(5,'league4');
/*!40000 ALTER TABLE `cpbl_league` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-04-29  8:01:18
