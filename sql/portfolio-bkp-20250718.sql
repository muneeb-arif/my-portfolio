-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Jul 18, 2025 at 01:32 AM
-- Server version: 5.7.39
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `portfolio`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_sections`
--

CREATE TABLE `admin_sections` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `route_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int(11) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_sections`
--

INSERT INTO `admin_sections` (`id`, `section_key`, `section_name`, `section_description`, `icon`, `route_path`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
('f820c516-6338-11f0-9c52-d16ca6000a33', 'backup_files', 'Backup Files', 'Manage and download backup files of the system', 'Archive', '/admin/backup-files', 1, 1, '2025-07-17 23:07:58', '2025-07-17 23:07:58'),
('f820c994-6338-11f0-9c52-d16ca6000a33', 'theme_updates', 'Theme Updates', 'Manage theme updates and customizations', 'Palette', '/admin/theme-updates', 1, 2, '2025-07-17 23:07:58', '2025-07-17 23:07:58'),
('f820cb42-6338-11f0-9c52-d16ca6000a33', 'import_export', 'Import Export', 'Import and export data between systems', 'Exchange', '/admin/import-export', 1, 3, '2025-07-17 23:07:58', '2025-07-17 23:07:58'),
('f820cc00-6338-11f0-9c52-d16ca6000a33', 'debug_sync', 'Debug / Sync', 'Debug tools and synchronization utilities', 'Bug', '/admin/debug-sync', 1, 4, '2025-07-17 23:07:58', '2025-07-17 23:07:58');

-- --------------------------------------------------------

--
-- Table structure for table `admin_section_permissions`
--

CREATE TABLE `admin_section_permissions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `can_access` tinyint(1) DEFAULT '0',
  `can_edit` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_section_permissions`
--

INSERT INTO `admin_section_permissions` (`id`, `user_id`, `section_id`, `can_access`, `can_edit`, `can_delete`, `created_at`, `updated_at`) VALUES
('f828781a-6338-11f0-9c52-d16ca6000a33', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'f820c516-6338-11f0-9c52-d16ca6000a33', 1, 1, 1, '2025-07-17 23:07:58', '2025-07-17 23:07:58'),
('f8287f9a-6338-11f0-9c52-d16ca6000a33', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'f820c994-6338-11f0-9c52-d16ca6000a33', 1, 1, 1, '2025-07-17 23:07:58', '2025-07-17 23:07:58'),
('f8288274-6338-11f0-9c52-d16ca6000a33', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'f820cb42-6338-11f0-9c52-d16ca6000a33', 1, 1, 1, '2025-07-17 23:07:58', '2025-07-17 23:07:58'),
('f82883f0-6338-11f0-9c52-d16ca6000a33', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'f820cc00-6338-11f0-9c52-d16ca6000a33', 1, 1, 1, '2025-07-17 23:07:58', '2025-07-17 23:07:58');

-- --------------------------------------------------------

--
-- Table structure for table `automatic_update_capabilities`
--

CREATE TABLE `automatic_update_capabilities` (
  `id` varchar(36) NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `supports_automatic` tinyint(1) DEFAULT '0',
  `endpoint_url` varchar(500) NOT NULL,
  `api_key_hash` varchar(255) DEFAULT NULL,
  `last_capability_check` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `php_version` varchar(50) DEFAULT NULL,
  `server_info` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `automatic_update_capabilities`
--

INSERT INTO `automatic_update_capabilities` (`id`, `client_id`, `domain`, `supports_automatic`, `endpoint_url`, `api_key_hash`, `last_capability_check`, `php_version`, `server_info`, `is_active`, `created_at`, `updated_at`) VALUES
('0dc72a90-0d53-4aa1-bd80-6905cacf6f75', 'shared_1751815096324_yyd2c5lcha', 'noman.theexpertways.com', 1, 'https://noman.theexpertways.com/update-endpoint.php', NULL, '2025-07-06 10:22:01', NULL, '{\"timezone\": \"Asia/Karachi\", \"user_agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36\", \"screen_resolution\": \"1920x1200\"}', 1, '2025-07-06 10:18:18', '2025-07-06 10:22:01'),
('3cd2b85b-e88e-4f95-8a76-a2eb9ac8c37a', 'shared_1751817961426_m8ijax7yz2n', 'noman.theexpertways.com', 1, 'https://noman.theexpertways.com/update-endpoint.php', NULL, '2025-07-06 11:19:51', NULL, '{\"timezone\": \"Asia/Karachi\", \"user_agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36\", \"screen_resolution\": \"1920x1200\"}', 1, '2025-07-06 11:06:03', '2025-07-06 11:19:51'),
('8862e251-055e-43ef-a824-d18e79db1aa6', 'shared_1751813352540_ceeki9zhskq', 'muneeb.theexpertways.com', 1, 'https://muneeb.theexpertways.com/update-endpoint.php', NULL, '2025-07-06 11:12:18', NULL, '{\"timezone\": \"Asia/Karachi\", \"user_agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36\", \"screen_resolution\": \"1920x1200\"}', 1, '2025-07-06 09:49:13', '2025-07-06 11:12:18'),
('b50fc42b-e793-4626-9015-81bf41bbd930', 'shared_1751813468005_lkhlyd3xawl', 'noman.theexpertways.com', 1, 'https://noman.theexpertways.com/update-endpoint.php', NULL, '2025-07-06 09:55:03', NULL, '{\"timezone\": \"Asia/Karachi\", \"user_agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36\", \"screen_resolution\": \"1920x1200\"}', 1, '2025-07-06 09:51:11', '2025-07-06 09:55:03'),
('d7143bc4-7425-4eac-bf9e-349feb182d7b', 'shared_1751816583501_gux4ut2ak6b', 'noman.theexpertways.com', 1, 'https://noman.theexpertways.com/update-endpoint.php', NULL, '2025-07-06 11:05:29', NULL, '{\"timezone\": \"Asia/Karachi\", \"user_agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36\", \"screen_resolution\": \"1920x1200\"}', 1, '2025-07-06 10:43:06', '2025-07-06 11:05:29');

-- --------------------------------------------------------

--
-- Table structure for table `automatic_update_client_performance`
--

CREATE TABLE `automatic_update_client_performance` (
  `client_id` varchar(255) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `supports_automatic` tinyint(1) DEFAULT '0',
  `total_attempts` int(11) DEFAULT '0',
  `successful_updates` int(11) DEFAULT '0',
  `failed_updates` int(11) DEFAULT '0',
  `success_rate` int(11) DEFAULT '0',
  `avg_execution_time_ms` int(11) DEFAULT NULL,
  `last_update_attempt` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `automatic_update_client_performance`
--

INSERT INTO `automatic_update_client_performance` (`client_id`, `domain`, `supports_automatic`, `total_attempts`, `successful_updates`, `failed_updates`, `success_rate`, `avg_execution_time_ms`, `last_update_attempt`) VALUES
('shared_1751808336031_wpb5hbw4a6c', 'localhost', 0, NULL, 0, 0, 0, NULL, NULL),
('shared_1751813352540_ceeki9zhskq', 'muneeb.theexpertways.com', 1, NULL, 0, 0, 0, NULL, NULL),
('shared_1751813468005_lkhlyd3xawl', 'noman.theexpertways.com', 1, NULL, 0, 0, 0, NULL, NULL),
('shared_1751815096324_yyd2c5lcha', 'noman.theexpertways.com', 1, NULL, 0, 0, 0, NULL, NULL),
('shared_1751816583501_gux4ut2ak6b', 'noman.theexpertways.com', 1, NULL, 0, 0, 0, NULL, NULL),
('shared_1751817931414_ojqqrjscy79', 'localhost', 0, NULL, 0, 0, 0, NULL, NULL),
('shared_1751817961426_m8ijax7yz2n', 'noman.theexpertways.com', 1, NULL, 0, 0, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `automatic_update_logs`
--

CREATE TABLE `automatic_update_logs` (
  `id` varchar(36) NOT NULL,
  `update_id` varchar(36) DEFAULT NULL,
  `client_id` varchar(255) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `log_message` text,
  `execution_time_ms` int(11) DEFAULT NULL,
  `error_details` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `backup_files`
--

CREATE TABLE `backup_files` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `storage_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `public_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `upload_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#8B4513',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `user_id`, `name`, `description`, `color`, `created_at`, `updated_at`) VALUES
('1c38cde2-6d09-4d8f-bfba-386d69be3013', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Website', NULL, '#8B4513', '2025-07-10 03:47:13', '2025-07-10 03:47:13'),
('1fc48f7f-d40f-4d39-80cb-f2622d6ffb4a', '033f0150-6671-41e5-a968-ff40e9f07f26', 'IOS Development', NULL, '#8b5cf6', '2025-06-28 13:51:35', '2025-06-28 13:51:35'),
('2f37a047-3d29-4b01-b8e0-1f4872c1267b', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Mobile App', NULL, '#3b82f6', '2025-07-10 03:46:48', '2025-07-10 03:46:48'),
('30c35a0c-1205-4e89-96d8-73e939f266ba', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'Web Development', 'Full-stack web applications and websites', '#3b82f6', '2025-07-06 15:49:34', '2025-07-06 15:49:34'),
('3a127be3-ab81-4c85-82ae-25fa98b44230', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Travel', NULL, '#8B4513', '2025-07-10 03:46:14', '2025-07-10 03:46:14'),
('3c4b9742-8a94-40dd-a77d-a28dff5f80c5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Laravel', NULL, '#3b82f6', '2025-07-07 02:55:08', '2025-07-07 15:22:31'),
('659d03b7-79a1-4ccb-8397-14d9e6339dc2', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'NextJS', NULL, '#8B4513', '2025-07-05 18:24:34', '2025-07-05 18:24:34'),
('68d9e593-0780-4af9-a40c-90c3cca51ba1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Wordpress', NULL, '#14b8a6', '2025-07-07 02:55:09', '2025-07-07 15:23:56'),
('6c9043c4-48af-4e10-89e3-60ad04d499c9', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'DevOps', 'Development operations and automation', '#84cc16', '2025-07-06 15:49:37', '2025-07-06 15:49:37'),
('6ce5e9d6-4166-4a8d-99d7-ac0a75e88f60', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Scenes', NULL, '#8B4513', '2025-07-10 17:35:11', '2025-07-10 17:35:11'),
('7d5d7c14-86fe-48d9-b2ad-08be137fb369', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Fantasy', NULL, '#8B4513', '2025-07-10 17:04:36', '2025-07-10 17:04:36'),
('833246d4-9542-411e-a4c7-c127db008965', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'AI/ML', 'Artificial Intelligence and Machine Learning', '#8b5cf6', '2025-07-06 15:49:35', '2025-07-06 15:49:35'),
('96c14852-ea51-46f7-8862-f38046e97cab', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'ReactJS', NULL, '#8B4513', '2025-07-05 18:24:25', '2025-07-05 18:24:25'),
('9765ea91-0276-4359-8610-70b185703d18', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Food', NULL, '#8B4513', '2025-07-10 17:02:51', '2025-07-10 17:02:51'),
('a4a438cf-8cd8-460a-a84a-bb184dd18cc3', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Wordpress', NULL, '#8B4513', '2025-07-10 12:54:08', '2025-07-10 12:55:03'),
('a7c098c2-12c6-4ba6-bd90-c43277dc176b', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Laravel + VueJs', NULL, '#8B4513', '2025-07-10 12:40:45', '2025-07-10 12:40:45'),
('af675282-e91b-4093-b0cf-969533136ab4', '033f0150-6671-41e5-a968-ff40e9f07f26', 'Others', NULL, '#ec4899', '2025-06-28 13:52:56', '2025-06-28 13:52:56'),
('b94ee516-5301-45fa-8121-28b156ddb6ae', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Products', NULL, '#f97316', '2025-07-11 07:17:32', '2025-07-11 07:17:32'),
('bd56660a-36bb-4a93-b314-875012a73ccb', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Cartoon', NULL, '#8B4513', '2025-07-10 17:05:02', '2025-07-10 17:05:02'),
('c9212f69-fd47-4172-a66c-42179ab581a6', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'ReactJs | NextJs', NULL, '#10b981', '2025-07-07 02:55:07', '2025-07-07 15:23:28'),
('d7b22c05-ac3b-42b2-85cb-6d781ccf3a9a', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'People', NULL, '#8B4513', '2025-07-10 17:04:47', '2025-07-10 17:04:47'),
('df166740-5b62-43a3-bd52-f8faefe67357', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'NodeJs | NestJs', 'Cloud infrastructure and DevOps', '#10b981', '2025-07-07 02:55:08', '2025-07-07 15:22:50'),
('e3d1b69b-079f-45db-a3d0-88b879993f70', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Medical', NULL, '#8B4513', '2025-07-10 03:46:31', '2025-07-10 03:46:31'),
('e80d9cc9-d049-4004-b620-49c50f966edd', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Laravel + ReactJs', NULL, '#8B4513', '2025-07-05 18:24:14', '2025-07-10 03:00:05');

-- --------------------------------------------------------

--
-- Table structure for table `contact_queries`
--

CREATE TABLE `contact_queries` (
  `id` bigint(20) NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `form_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'contact',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` mediumtext COLLATE utf8mb4_unicode_ci,
  `budget` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timeline` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `inquiry_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `communication_channel` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_description` mediumtext COLLATE utf8mb4_unicode_ci,
  `target_customer` mediumtext COLLATE utf8mb4_unicode_ci,
  `unique_value` mediumtext COLLATE utf8mb4_unicode_ci,
  `problem_solving` mediumtext COLLATE utf8mb4_unicode_ci,
  `core_features` mediumtext COLLATE utf8mb4_unicode_ci,
  `existing_system` mediumtext COLLATE utf8mb4_unicode_ci,
  `technical_constraints` mediumtext COLLATE utf8mb4_unicode_ci,
  `competitors` mediumtext COLLATE utf8mb4_unicode_ci,
  `brand_guide` mediumtext COLLATE utf8mb4_unicode_ci,
  `color_preferences` mediumtext COLLATE utf8mb4_unicode_ci,
  `tone_of_voice` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_gateways` mediumtext COLLATE utf8mb4_unicode_ci,
  `integrations` mediumtext COLLATE utf8mb4_unicode_ci,
  `admin_control` mediumtext COLLATE utf8mb4_unicode_ci,
  `gdpr_compliance` tinyint(1) DEFAULT '0',
  `terms_privacy` tinyint(1) DEFAULT '0',
  `launch_date` date DEFAULT NULL,
  `budget_range` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `post_mvp_features` mediumtext COLLATE utf8mb4_unicode_ci,
  `long_term_goals` mediumtext COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'new',
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `notes` mediumtext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `responded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `domains`
--

CREATE TABLE `domains` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `domains`
--

INSERT INTO `domains` (`id`, `user_id`, `name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'http://localhost:3000', 0, '2025-07-11 15:55:42', '2025-07-17 21:42:21'),
(2, 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'http://muneeb.theexpertways.com', 1, '2025-07-11 15:55:42', '2025-07-11 15:55:42'),
(3, '94b101ed-9705-4a18-b25b-ef7376ad0550', 'http://ahsan.theexpertways.com', 1, '2025-07-11 15:55:42', '2025-07-11 15:55:42'),
(4, '9b054eaf-9a7c-483b-8915-84c439b3ae79', 'http://dev.theexpertways.com', 1, '2025-07-11 15:55:42', '2025-07-11 15:55:42'),
(5, '033f0150-6671-41e5-a968-ff40e9f07f26', 'http://fareed.theexpertways.com', 1, '2025-07-11 15:55:42', '2025-07-11 15:55:42'),
(6, '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'http://imaamir.theexpertways.com', 1, '2025-07-11 15:55:42', '2025-07-11 15:55:42'),
(7, '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'http://khumi.theexpertways.com', 1, '2025-07-11 15:55:42', '2025-07-11 15:55:42'),
(8, '3fb36cdb-e2b9-4f78-bd3b-2bf5de0168e6', 'http://test.theexpertways.com', 1, '2025-07-11 15:55:42', '2025-07-11 15:55:42'),
(9, '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'http://theexpertways.com', 1, '2025-07-11 15:55:42', '2025-07-11 15:55:42'),
(10, '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'http://zm.theexpertways.com', 1, '2025-07-11 15:55:42', '2025-07-11 15:55:42'),
(11, '66918e72-8269-41b5-b9b0-3354a9c48748', 'http://test-domain.example.com', 1, '2025-07-17 12:29:42', '2025-07-17 12:29:42'),
(12, '58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'http://test-domain-1752773572167.example.com', 1, '2025-07-17 12:32:53', '2025-07-17 12:32:53'),
(13, '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'http://localhost:3000', 1, '2025-07-11 15:55:42', '2025-07-17 21:42:26');

-- --------------------------------------------------------

--
-- Table structure for table `domains_technologies`
--

CREATE TABLE `domains_technologies` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'technology',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int(11) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `domains_technologies`
--

INSERT INTO `domains_technologies` (`id`, `user_id`, `type`, `title`, `icon`, `image`, `sort_order`, `created_at`, `updated_at`) VALUES
('049e1334-35ad-405e-aaac-fe07de69a5c6', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'domain', 'Blockchain', NULL, NULL, 5, '2025-07-07 02:55:12', '2025-07-07 02:55:12'),
('061c28f6-aa41-4066-aa8c-767e5e5027ee', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'domain', 'Data Science', NULL, NULL, 7, '2025-07-07 02:55:13', '2025-07-07 02:55:13'),
('1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'domain', 'Web Development', NULL, NULL, 1, '2025-07-07 02:55:10', '2025-07-07 02:55:10'),
('18544731-2da4-4bc7-b282-87d5d4ec62d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'technology', 'Databases', 'Link', NULL, 4, '2025-07-15 18:42:23', '2025-07-15 18:54:55'),
('1fe413e5-55cd-4e7e-8340-d386621a8039', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'domain', 'DevOps', NULL, NULL, 8, '2025-07-07 02:55:13', '2025-07-07 02:55:13'),
('2979ec3a-500e-4dcf-b4ec-4d5179578534', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'technology', 'Others', 'Cpu', NULL, 12, '2025-07-10 06:02:05', '2025-07-10 06:02:05'),
('2a1c0622-1b47-44db-8fe7-99c969e747f2', '033f0150-6671-41e5-a968-ff40e9f07f26', 'technology', 'Architecture', NULL, NULL, 2, '2025-06-28 13:01:22', '2025-06-28 13:01:22'),
('2a500bf5-7509-4052-bc9c-88f58e868f6b', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'domain', 'Cybersecurity', NULL, NULL, 6, '2025-06-28 21:27:51', '2025-06-28 21:27:51'),
('40f9e0ef-d153-4f64-9a8c-ffd39c525e1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'domain', 'Cloud Computing', NULL, NULL, 4, '2025-07-07 02:55:11', '2025-07-07 02:55:11'),
('420e2351-e947-42c2-81e6-c1c683d56acb', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'domain', 'UI/UX Design', NULL, NULL, 9, '2025-07-07 02:55:14', '2025-07-07 02:55:14'),
('5bced85c-eb5c-499b-93a0-4aeed42381fc', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'domain', 'DevOps', NULL, NULL, 8, '2025-06-28 21:27:54', '2025-06-28 21:27:54'),
('5f6325aa-3f68-4603-b960-f747d235d444', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'domain', 'Blockchain', NULL, NULL, 5, '2025-06-28 21:27:51', '2025-06-28 21:27:51'),
('63022624-6f6b-459e-9c42-021e48673483', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'technology', 'UI/UX Designing', 'Users', NULL, 10, '2025-07-10 05:48:57', '2025-07-10 05:48:57'),
('689644aa-b326-4c62-a2d8-e2f0eeae6cdd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'domain', 'UI/UX Design', NULL, NULL, 9, '2025-06-28 21:27:56', '2025-06-28 21:27:56'),
('6e923f02-e551-45f0-9419-613ce9f7898c', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'domain', 'Cloud Computing', NULL, NULL, 9, '2025-06-28 11:55:25', '2025-07-15 18:54:52'),
('705f1caf-e70c-4f0c-9f2d-606b32a0bc9f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'domain', 'Cloud Computing', NULL, NULL, 4, '2025-06-28 21:27:49', '2025-06-28 21:27:49'),
('7658dc9f-4c70-4c36-a410-672340912892', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'technology', 'Non-Technical Skills', 'Shield', NULL, 11, '2025-07-10 05:54:31', '2025-07-10 05:54:31'),
('8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'domain', 'Web Development', NULL, NULL, 1, '2025-06-28 21:27:47', '2025-06-28 21:27:47'),
('9a57c579-ab69-47a0-ac08-2ec427ffc5e1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'domain', 'Mobile Development', NULL, NULL, 2, '2025-07-07 02:55:10', '2025-07-07 02:55:10'),
('c5760f9a-c91d-4321-a2fb-247802ca585a', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'domain', 'Cybersecurity', NULL, NULL, 6, '2025-07-07 02:55:12', '2025-07-07 02:55:12'),
('d228136a-3f18-4de2-a9f1-d1fb4419986e', '033f0150-6671-41e5-a968-ff40e9f07f26', 'technology', 'Frameworks & SDKs', NULL, NULL, 3, '2025-06-28 13:02:15', '2025-06-28 13:02:15'),
('d9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'domain', 'AI/ML', NULL, NULL, 3, '2025-07-07 02:55:11', '2025-07-07 02:55:11'),
('deea4f02-217b-43b1-94ef-db7f58e73949', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'domain', 'UI/UX Design', NULL, NULL, 2, '2025-06-28 11:55:28', '2025-07-15 18:54:46'),
('e44b8a36-6e77-4caf-82c1-7346cad60c0b', '033f0150-6671-41e5-a968-ff40e9f07f26', 'technology', 'Tools', 'Code', NULL, 4, '2025-06-28 13:03:58', '2025-06-28 13:03:58'),
('e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'technology', 'Backend', 'BookOpen', NULL, 5, '2025-07-15 18:38:38', '2025-07-15 18:54:55'),
('e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'domain', 'AI/ML', NULL, NULL, 3, '2025-06-28 21:27:49', '2025-06-28 21:27:49'),
('eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'technology', 'Frontend', 'Globe', NULL, 1, '2025-07-15 18:33:38', '2025-07-15 18:33:38'),
('ef159a39-1cfe-4dd5-95c0-933d40ab8da6', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'domain', 'Data Science', NULL, NULL, 7, '2025-06-28 21:27:54', '2025-06-28 21:27:54'),
('f10fee01-c447-4fdf-b206-07bd6f76fc9a', '033f0150-6671-41e5-a968-ff40e9f07f26', 'technology', 'Languages', 'Code', NULL, 1, '2025-06-28 12:59:27', '2025-06-28 12:59:27'),
('fc29a629-f032-4241-b73d-c766d198d251', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'domain', 'Mobile Development', NULL, NULL, 2, '2025-06-28 21:27:47', '2025-06-28 21:27:47');

-- --------------------------------------------------------

--
-- Table structure for table `niche`
--

CREATE TABLE `niche` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default.jpeg',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `overview` mediumtext COLLATE utf8mb4_unicode_ci,
  `tools` mediumtext COLLATE utf8mb4_unicode_ci,
  `key_features` mediumtext COLLATE utf8mb4_unicode_ci,
  `sort_order` int(11) DEFAULT '1',
  `ai_driven` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `niche`
--

INSERT INTO `niche` (`id`, `user_id`, `image`, `title`, `overview`, `tools`, `key_features`, `sort_order`, `ai_driven`, `created_at`, `updated_at`) VALUES
('180', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751132851822_1_z7axsWmGYArJekNqA_j-9w.jpg', 'E-Commerce Applications', 'End-to-end apps for online stores, focused on seamless UX, payment integration, and catalog browsing.', 'Swift, SwiftUI, Stripe SDK, Firebase, Realm', 'Product listing, cart, checkout flows\nIn-app payments (Apple Pay, Stripe)\nUser authentication and order history\nReal-time data sync and push notifications\nRatings, reviews, and wishlist management', 2, 0, '2025-06-28 11:56:36', '2025-07-15 19:06:34'),
('181', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751132915619_Fintech-App-Development-Summary.webp', 'FinTech Solutions', 'Secure and compliant applications for banking, wallets, and financial services.', 'Swift, SwiftUI, CoreData, Firebase, REST APIs, FaceID/TouchID', 'User onboarding with KYC\nBiometric authentication\nTransaction history, wallets, money transfers\nInvestment dashboards and charts\nSecure encryption and Keychain integration', 3, 0, '2025-06-28 11:56:37', '2025-07-15 19:06:48'),
('182', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751133371685_travel-app.jpg', 'Travel & Booking Apps', 'Mobile travel solutions for trip planning, hotel bookings, and ticket reservations.', 'Swift, SwiftUI, MapKit, Firebase, REST APIs', 'Hotel and flight search & booking\nInteractive maps and directions\nBooking confirmation and history\nPush notifications and itinerary reminders\nCurrency and language localization', 4, 0, '2025-06-28 11:56:40', '2025-07-15 19:06:59'),
('183', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751133340991_fitness-app-development.webp', 'Healthcare & Fitness Apps', 'Health-focused apps using Apple HealthKit, CareKit, and secure tracking features.', 'Swift, SwiftUI, HealthKit, CoreMotion, Firebase', 'Step tracking, heart rate monitoring\nWorkout and diet logs\nAppointment scheduling\nSymptom checkers and reports\nNotifications & reminders', 5, 0, '2025-06-28 11:56:40', '2025-07-15 19:07:10'),
('184', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751133181492_Frame-427320083.jpg', 'AI-Enhanced Apps', 'Intelligent iOS apps powered by on-device Core ML and cloud-based ML APIs.', 'Swift, CoreML, Vision, Create ML, Firebase ML', 'Image recognition and OCR\nText prediction and sentiment analysis\nAI chat integration\nPersonal recommendations\nVoice-to-text and speech recognition', 6, 1, '2025-06-28 11:56:41', '2025-07-15 19:07:20'),
('187', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751133071578_ios-app-design-meditation.png', 'UI/UX Focused iOS Systems', 'Beautiful, accessible design systems using SwiftUI and UIKit with reusable components.', 'SwiftUI, Figma, UIKit, Adobe XD', 'Custom UI kits and reusable components\nLight/Dark mode support\nAccessibility support (VoiceOver, Dynamic Type)\nMicro-interactions and animations\nLocalization and RTL support', 9, 0, '2025-06-28 11:56:44', '2025-07-15 19:07:34'),
('197', '2f660a9a-3538-4384-970c-53b4bd37d4a8', '/images/domains/web-development.jpeg', 'E-Commerce Solutions', 'Comprehensive e-commerce platforms with modern UI/UX, payment processing, and inventory management systems.', 'React, Node.js, Stripe, MongoDB, Redis', 'User authentication, Product catalog, Shopping cart, Payment processing, Admin dashboard, Analytics', 1, 0, '2025-06-28 21:28:42', '2025-06-28 21:28:42'),
('198', '2f660a9a-3538-4384-970c-53b4bd37d4a8', '/images/domains/ai-ml.jpeg', 'AI-Powered Applications', 'Intelligent applications leveraging machine learning, natural language processing, and computer vision technologies.', 'Python, TensorFlow, PyTorch, FastAPI, AWS SageMaker', 'Natural language processing, Computer vision, Predictive analytics, Recommendation systems, Chatbots, Data analysis', 2, 1, '2025-06-28 21:28:42', '2025-06-28 21:28:42'),
('199', '2f660a9a-3538-4384-970c-53b4bd37d4a8', '/images/domains/mobile-development.jpeg', 'FinTech Solutions', 'Secure financial technology applications including mobile banking, payment gateways, and investment platforms.', 'React Native, Node.js, PostgreSQL, Redis, AWS', 'Biometric authentication, Real-time transactions, Payment processing, Investment tracking, Security compliance, Analytics', 3, 0, '2025-06-28 21:28:43', '2025-06-28 21:28:43'),
('200', '2f660a9a-3538-4384-970c-53b4bd37d4a8', '/images/domains/cloud-computing.jpeg', 'Cloud Infrastructure', 'Scalable cloud infrastructure solutions with monitoring, automation, and cost optimization.', 'AWS, Docker, Kubernetes, Terraform, Prometheus', 'Multi-cloud management, Auto-scaling, Cost optimization, Security monitoring, CI/CD pipelines, Disaster recovery', 4, 0, '2025-06-28 21:28:43', '2025-06-28 21:28:43'),
('201', '2f660a9a-3538-4384-970c-53b4bd37d4a8', '/images/domains/blockchain.jpeg', 'Blockchain Applications', 'Decentralized applications and smart contracts for transparent and secure business processes.', 'Ethereum, Solidity, Web3.js, IPFS, Hardhat', 'Smart contracts, Decentralized storage, Token economics, Supply chain tracking, DeFi protocols, NFT platforms', 5, 0, '2025-06-28 21:28:44', '2025-06-28 21:28:44'),
('202', '2f660a9a-3538-4384-970c-53b4bd37d4a8', '/images/domains/cybersecurity.jpeg', 'Cybersecurity Tools', 'Advanced security solutions for threat detection, vulnerability assessment, and compliance management.', 'Python, AWS Security Hub, Wireshark, Metasploit, OWASP', 'Penetration testing, Vulnerability scanning, Threat detection, Security auditing, Compliance monitoring, Incident response', 6, 1, '2025-06-28 21:28:44', '2025-06-28 21:28:44'),
('203', '2f660a9a-3538-4384-970c-53b4bd37d4a8', '/images/domains/data-science.jpeg', 'Data Analytics Platforms', 'Comprehensive data analytics and business intelligence solutions for data-driven decision making.', 'Python, Apache Spark, Tableau, Power BI, AWS Redshift', 'Data visualization, Predictive analytics, Real-time dashboards, ETL pipelines, Machine learning integration, Custom reporting', 7, 1, '2025-06-28 21:28:45', '2025-06-28 21:28:45'),
('204', '2f660a9a-3538-4384-970c-53b4bd37d4a8', '/images/domains/devops.jpeg', 'DevOps Automation', 'End-to-end DevOps automation solutions for continuous integration, deployment, and infrastructure management.', 'Jenkins, GitLab CI/CD, Ansible, Terraform, Kubernetes', 'CI/CD pipelines, Infrastructure as Code, Automated testing, Monitoring & alerting, Blue-green deployments, Rollback strategies', 8, 0, '2025-06-28 21:28:45', '2025-06-28 21:28:45'),
('205', '2f660a9a-3538-4384-970c-53b4bd37d4a8', '/images/domains/ui-ux.jpeg', 'UI/UX Design Systems', 'Comprehensive design systems and user experience solutions for modern web and mobile applications.', 'Figma, Adobe XD, Sketch, InVision, Principle', 'Design systems, Prototyping, User research, Accessibility compliance, Design tokens, Component libraries', 9, 0, '2025-06-28 21:28:46', '2025-06-28 21:28:46'),
('206', '033f0150-6671-41e5-a968-ff40e9f07f26', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751189147037_Mobile-Apps.jpg', 'iOS Application Development', 'Crafting high-performance, scalable, and user-friendly iOS applications tailored for Apple devices using Swift, SwiftUI, and modern design principles.', 'Swift, SwiftUI, UIKit, Xcode, CoreData, Combine, REST APIs, Firebase, XCTest', 'Clean architecture (MVVM, VIPER, Coordinator)\nOffline support & local storage (CoreData, Realm)\nPush notifications & deep linking\nApp lifecycle management\nSmooth animations & custom UI\nApp Store deployment & TestFlight distribution\nUnit & UI testing\nSecure data handling and Keychain integration', 1, 0, '2025-06-29 04:26:27', '2025-06-29 04:26:27'),
('207', '033f0150-6671-41e5-a968-ff40e9f07f26', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751189265639_1_z7axsWmGYArJekNqA_j-9w.jpg', 'E-Commerce iOS Applications', 'End-to-end iOS apps for online stores, focused on seamless UX, payment integration, and catalog browsing.', 'Swift, SwiftUI, Stripe SDK, Firebase, Realm', 'Product listing, cart, checkout flows\nIn-app payments (Apple Pay, Stripe)\nUser authentication and order history\nReal-time data sync and push notifications\nRatings, reviews, and wishlist management', 2, 0, '2025-06-29 04:28:20', '2025-06-29 04:28:20'),
('208', '033f0150-6671-41e5-a968-ff40e9f07f26', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751189321392_Fintech-App-Development-Summary.webp', 'FinTech iOS Solutions', 'Secure and compliant iOS applications for banking, wallets, and financial services.', 'Swift, SwiftUI, CoreData, Firebase, REST APIs, FaceID/TouchID', 'User onboarding with KYC\nBiometric authentication\nTransaction history, wallets, money transfers\nInvestment dashboards and charts\nSecure encryption and Keychain integration', 3, 0, '2025-06-29 04:29:11', '2025-06-29 04:29:11'),
('209', '033f0150-6671-41e5-a968-ff40e9f07f26', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751189368082_fitness-app-development.webp', 'Healthcare & Fitness iOS Apps', 'Health-focused apps using Apple HealthKit, CareKit, and secure tracking features.', 'Swift, SwiftUI, HealthKit, CoreMotion, Firebase', 'Step tracking, heart rate monitoring\nWorkout and diet logs\nAppointment scheduling\nSymptom checkers and reports\nNotifications & reminders', 4, 0, '2025-06-29 04:30:00', '2025-06-29 04:30:00'),
('210', '033f0150-6671-41e5-a968-ff40e9f07f26', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751189482911_travel-app.jpg', 'Travel & Booking iOS Apps', 'Mobile travel solutions for trip planning, hotel bookings, and ticket reservations.', 'Swift, SwiftUI, MapKit, Firebase, REST APIs', 'Hotel and flight search & booking\nInteractive maps and directions\nBooking confirmation and history\nPush notifications and itinerary reminders\nCurrency and language localization', 5, 0, '2025-06-29 04:32:02', '2025-06-29 04:32:02'),
('211', '033f0150-6671-41e5-a968-ff40e9f07f26', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751189536582_Frame-427320083.jpg', 'AI-Enhanced iOS Apps', 'Intelligent iOS apps powered by on-device Core ML and cloud-based ML APIs.', 'Swift, CoreML, Vision, Create ML, Firebase ML', 'Image recognition and OCR\nText prediction and sentiment analysis\nAI chat integration\nPersonal recommendations\nVoice-to-text and speech recognition', 6, 1, '2025-06-29 04:32:47', '2025-06-29 04:32:47'),
('212', '033f0150-6671-41e5-a968-ff40e9f07f26', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751189580861_ios-app-design-meditation.png', 'UI/UX Focused iOS Systems', 'Beautiful, accessible iOS design systems using SwiftUI and UIKit with reusable components.', 'SwiftUI, Figma, UIKit, Adobe XD', 'Custom UI kits and reusable components\nLight/Dark mode support\nAccessibility support (VoiceOver, Dynamic Type)\nMicro-interactions and animations\nLocalization and RTL support', 7, 0, '2025-06-29 04:33:53', '2025-06-29 04:33:53'),
('231', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', '/images/domains/web-development.jpeg', 'E-Commerce Solutions', 'Comprehensive e-commerce platforms with modern UI/UX, payment processing, and inventory management systems.', 'React, Node.js, Stripe, MongoDB, Redis', 'User authentication, Product catalog, Shopping cart, Payment processing, Admin dashboard, Analytics', 1, 0, '2025-07-07 02:56:11', '2025-07-07 02:56:11'),
('232', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', '/images/domains/ai-ml.jpeg', 'AI-Powered Applications', 'Intelligent applications leveraging machine learning, natural language processing, and computer vision technologies.', 'Python, TensorFlow, PyTorch, FastAPI, AWS SageMaker', 'Natural language processing, Computer vision, Predictive analytics, Recommendation systems, Chatbots, Data analysis', 2, 1, '2025-07-07 02:56:11', '2025-07-07 02:56:11'),
('233', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', '/images/domains/mobile-development.jpeg', 'FinTech Solutions', 'Secure financial technology applications including mobile banking, payment gateways, and investment platforms.', 'React Native, Node.js, PostgreSQL, Redis, AWS', 'Biometric authentication, Real-time transactions, Payment processing, Investment tracking, Security compliance, Analytics', 3, 0, '2025-07-07 02:56:12', '2025-07-07 02:56:12'),
('234', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', '/images/domains/cloud-computing.jpeg', 'Cloud Infrastructure', 'Scalable cloud infrastructure solutions with monitoring, automation, and cost optimization.', 'AWS, Docker, Kubernetes, Terraform, Prometheus', 'Multi-cloud management, Auto-scaling, Cost optimization, Security monitoring, CI/CD pipelines, Disaster recovery', 4, 0, '2025-07-07 02:56:12', '2025-07-07 02:56:12'),
('235', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', '/images/domains/blockchain.jpeg', 'Blockchain Applications', 'Decentralized applications and smart contracts for transparent and secure business processes.', 'Ethereum, Solidity, Web3.js, IPFS, Hardhat', 'Smart contracts, Decentralized storage, Token economics, Supply chain tracking, DeFi protocols, NFT platforms', 5, 0, '2025-07-07 02:56:13', '2025-07-07 02:56:13'),
('236', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', '/images/domains/cybersecurity.jpeg', 'Cybersecurity Tools', 'Advanced security solutions for threat detection, vulnerability assessment, and compliance management.', 'Python, AWS Security Hub, Wireshark, Metasploit, OWASP', 'Penetration testing, Vulnerability scanning, Threat detection, Security auditing, Compliance monitoring, Incident response', 6, 1, '2025-07-07 02:56:13', '2025-07-07 02:56:13'),
('237', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', '/images/domains/data-science.jpeg', 'Data Analytics Platforms', 'Comprehensive data analytics and business intelligence solutions for data-driven decision making.', 'Python, Apache Spark, Tableau, Power BI, AWS Redshift', 'Data visualization, Predictive analytics, Real-time dashboards, ETL pipelines, Machine learning integration, Custom reporting', 7, 1, '2025-07-07 02:56:14', '2025-07-07 02:56:14'),
('238', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', '/images/domains/devops.jpeg', 'DevOps Automation', 'End-to-end DevOps automation solutions for continuous integration, deployment, and infrastructure management.', 'Jenkins, GitLab CI/CD, Ansible, Terraform, Kubernetes', 'CI/CD pipelines, Infrastructure as Code, Automated testing, Monitoring & alerting, Blue-green deployments, Rollback strategies', 8, 0, '2025-07-07 02:56:15', '2025-07-07 02:56:15'),
('239', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', '/images/domains/ui-ux.jpeg', 'UI/UX Design Systems', 'Comprehensive design systems and user experience solutions for modern web and mobile applications.', 'Figma, Adobe XD, Sketch, InVision, Principle', 'Design systems, Prototyping, User research, Accessibility compliance, Design tokens, Component libraries', 9, 0, '2025-07-07 02:56:16', '2025-07-07 02:56:16');

-- --------------------------------------------------------

--
-- Table structure for table `portfolio_config`
--

CREATE TABLE `portfolio_config` (
  `id` int(11) NOT NULL,
  `owner_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `portfolio_config`
--

INSERT INTO `portfolio_config` (`id`, `owner_email`, `owner_user_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'muneebarif11@gmail.com', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 1, '2025-07-11 20:56:06', '2025-07-11 20:56:06');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `overview` mediumtext COLLATE utf8mb4_unicode_ci,
  `technologies` json DEFAULT NULL,
  `features` json DEFAULT NULL,
  `live_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `github_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `views` int(11) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_prompt` tinyint(4) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `user_id`, `title`, `description`, `category`, `overview`, `technologies`, `features`, `live_url`, `github_url`, `status`, `views`, `created_at`, `updated_at`, `is_prompt`) VALUES
('01a004b3-9ed3-447e-b606-1ca9730ac3ad', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Differential Diagnosis', 'DifferentialDiagnosis.net provides USMLE preparation courses for medical students and professionals aiming to advance their medical careers, particularly those planning to practice in the United States.', 'Wordpress', 'DifferentialDiagnosis.net is designed to support medical students and professionals in preparing for the USMLE exams essential for practicing medicine in the U.S. The site positions itself as a comprehensive resource for individuals seeking structured guidance through various stages of their medical education and professional development. By addressing the needs of both local and international medical graduates, the website serves a wide audience aiming to advance their careers through licensure in the United States.\n\nThe website clearly emphasizes its target audience: medical students, residents, and practicing healthcare professionals. It aims to accommodate different stages of medical education by offering distinct courses, including preparatory guidance for USMLE Step One, Step 2 CK, ERAS, and related areas. The branding focuses on supporting individuals eager to excel in their exams and interviews, thereby enhancing their qualifications and opportunities in the medical field.\n\nThe business model appears to be course-based, with visitors encouraged to enroll in specific preparatory classes. The homepage highlights geographic specificity by mentioning its presence in Rolling Meadows, IL, suggesting both online and in-person options. The site\'s value proposition revolves around personalized education and professional coaching, intending to alleviate the challenges faced by international medical graduates entering the U.S healthcare system.\n\nOverall, DifferentialDiagnosis.net is positioned as a supportive educational partner with a focus on personalized and effective exam preparation, fostering confidence and success in securing U.S. medical licenses.', '[\"Wordpress\", \"ACF\", \"Elementor\"]', '[\"USMLE Step One and Step 2 CK courses are prominently advertised.\", \"Features \\\"Buy Now\\\" buttons for courses, a dynamic contact number, and a consultation form.\", \"Course offerings overview; a section on USMLE prep courses in Rolling Meadows; blog posts under \\\"Recent Stories\\\" for additional learning.\", \"Includes imagery of medical professionals, though no explicit testimonials or logos.\", \"\\\"Learn More\\\" and \\\"Join Now\\\" calls-to-action, and a consultation form for user engagement.\"]', 'https://differentialdiagnosis.net/', NULL, 'published', 0, '2025-07-10 13:13:02', '2025-07-15 16:54:24', 0),
('07815290-0990-4e3a-acf3-6384d53dbdd0', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Hiring Helmet', 'Hiring Helmet is an online engineering marketplace connecting businesses with remote project managers, product managers, financial experts, software engineers, and designers.', 'ReactJS', 'Hiring Helmet offers a platform for finding and hiring expert professionals in engineering and related fields. Targeting businesses looking for remote engineering talent, the website streamlines the process of matching skilled professionals with project needs. It serves as a global network, facilitating efficient connections between companies and freelancers for a variety of project types.\n\nThe website\'s primary offering includes a marketplace for businesses to find freelance talent quickly, ensuring projects are staffed with qualified experts. The business model likely revolves around connecting freelancers with companies, possibly earning revenue through subscription fees, commission on transactions, or featured listings.\n\nThe value proposition of Hiring Helmet is providing swift and reliable access to highly skilled professionals, reducing hiring time and vetting processes for businesses. It\'s particularly valuable for companies seeking specialized engineering skills without the overhead of full-time hires.', '[\"React\", \"Redux\"]', '[\"Technology & Programming, Web Development, Testing, Software Development.\", \"Featured services, client testimonials, and business trust highlights.\", \"Logos of Google, Spotify, Stripe, and Airbnb indicating credibility and partnerships.\", \"Sign-up options, contact information at the bottom, and a strong call-to-action on the homepage.\"]', 'https://hiringhelmet.com/', NULL, 'published', 0, '2025-07-10 13:23:35', '2025-07-15 16:29:21', 0),
('0d601d35-1481-4db7-b2ae-6c0bed331526', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Korean Ramen Noodles', 'Prompt', 'Food', 'Create a high-end, hyper-realistic 3D digital advertisement of a steaming bowl of Korean ramen noodles, rendered in ultra-detail and cinematic quality.\n\n🍜 The bowl is brimming with rich, spicy broth, glossy noodles twirling upward as if just lifted by chopsticks, with subtle steam rising in tendrils from the surface. The noodles glisten with oil, showing fine grain textures, stretch, and bounce.\n\n🥚 On top of the ramen are meticulously placed toppings:\n\nA perfectly halved soft-boiled egg with a glowing, runny yolk\n\nMarinated beef slices or spicy pork, charred edges and glazed with gochujang\n\nNarutomaki (fish cake) with its signature pink swirl\n\nScallions, sesame seeds, and a few sheets of roasted seaweed (nori) fanned behind the noodles\n\n🌶️ Floating chili flakes, garlic oil droplets, and tiny bubbles shimmer across the surface of the broth, evoking warmth and spice. A piece of red chili sits at the edge of the bowl, hinting at heat.\n\n🥢 Around the bowl, ingredients like spring onions, red peppers, raw noodles, and chili powder burst outward in slow-motion — a flavorful explosion captured mid-air.\n\n🖼️ The background is a cinematic, moody blend of deep reds, charcoals, and warm amber bokeh, evoking street food stalls and urban night markets. Subtle glowing particles enhance the dynamic feel.\n\n💡 Lighting is dramatic, with a strong key light from one side and warm, ambient fill light that highlights steam, broth shimmer, and the reflective details on the glossy ceramic bowl.\n\n🔍 Rendered in 4K ultra-HD, using Octane Render or Unreal Engine, with extreme macro-level texturing, realistic subsurface scattering in egg whites and meat, and beautiful depth of field.', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:21:50', '2025-07-17 22:20:34', 1),
('0de390e7-131a-4e3b-982f-1961d7cdf1c4', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Pure honey', 'Prompt', 'Products', '> A sleek, transparent glass jar filled with rich, golden amber pure natural honey, featuring a black and gold label with honeycomb patterns and \"100% Pure Natural Honey\" in English and Japanese (天然純粋蜂蜜). The jar sits in a narrow cyberpunk Tokyo alley glowing with vibrant neon lights (magenta, cyan, purple), surrounded by reflective wet pavement, Japanese kanji signboards, and rising steam from the ground. A wooden honey dipper coated in dripping honey rests beside it. Cinematic composition with dramatic lighting, photorealistic textures, shallow depth of field, moody ambiance, and a futuristic atmosphere.', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-11 07:20:41', '2025-07-17 22:20:34', 1),
('11c485ee-bcaf-470f-b6c7-47dcca59ccce', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Cinematic Portrait', 'Prompt', 'People', 'Male Version:\n\"Create a photorealistic, magazine-cover portrait in a studio setting.\nForeground: A confident man wearing a perfectly tailored light-grey suit, standing casually with one leg crossed over the other, hands in pockets, offering a subtle, relaxed smile. Use the face extracted from the reference photo provided.\nBackground: A large, monochrome, high-contrast shadow version of the same man, dressed in an elegant black sherwani and dark sunglasses, exuding power and mystery.\nEnvironment & style: Beige/off-white seamless backdrop for clean contrast. Soft yet dramatic studio key light with gentle rim lighting to highlight contours. Ultra-detailed, cinematic depth, crisp textures, realistic skin, subtle film-grain finish—overall a modern high-fashion editorial aesthetic.\"\n\nFemale Version:\n“Create a cinematic concept portrait featuring a confident woman in a stylish light-colored suit (such as beige, pastel, or soft grey), standing elegantly with one leg slightly crossed, hands in pockets or relaxed at the sides, with a soft confident smile. Behind her, show a large, monochrome, high-contrast shadow version of herself wearing a traditional black formal dress or abaya with a serious, powerful expression and dark sunglasses. Use a beige or off-white background for a clean and elegant contrast. Studio lighting, high detail, photorealistic style with a modern magazine cover aesthetic. Upload your photo for the face to be used in both the foreground and background versions. Keep the scarf on the head of female, matching the dressing”', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 18:01:03', '2025-07-17 22:20:34', 1),
('135c20aa-fc81-45ec-bec3-6a8bad63fd02', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Fort-Banner', 'Prompt', 'Scenes', '\"A lone traveler with a backpack and walking stick trekking through a vast desert at night, leaving footprints behind. The sky is filled with stars, casting a subtle glow over the purple-tinted desert sand. In the distance, a large ancient fort stands atop a hill, beautifully illuminated with warm yellow lights. The scene has a calm, cinematic feel with soft moonlight, cool shadows, and ambient lighting highlighting the terrain and mountains in the background. Realistic lighting and atmospheric depth.\"', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:34:35', '2025-07-17 22:20:34', 1),
('15f819c7-7bdb-483c-a16d-c4cf31c3f3fd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Sowad Grape Cakey', 'Prompt', 'Food', 'A hyper-realistic product shot of a chilled aluminum can labeled “Sowad Grape Cakey” placed centrally on a glossy reflective surface.\nThe can features a glossy finish with an artistic design showcasing layers of fluffy cake intertwined with juicy grapes. Water droplets on the can emphasize its cold and refreshing nature.\n\nThe background features a vertical gradient — transitioning from deep indigo at the top to a vibrant grape-green at the bottom — creating a lush, fruity atmosphere. Surrounding the can are dramatic splashes of rich, translucent purple grape juice, bursting with energy.\n\nGreen and black grapes are dynamically placed around the scene, with some tumbling into the liquid, causing vibrant splashes and realistic reflections. The lighting is bright and diffused, highlighting textures such as the droplets, metallic can surface, and grape skin. Soft shadows and highlights give the image a polished, three-dimensional effect.\n\nThe composition is perfectly centered, with the can as the hero product, surrounded by motion and freshness — capturing indulgence, excitement, and the essence of a premium grape dessert beverage.', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:29:18', '2025-07-17 22:20:34', 1),
('20898683-a8c1-444a-964f-4115d4fd5f89', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Futuristic Portrait', 'Prompt', 'People', 'Create a hyper realistic, cinematic close-up portrait of the same person, preserving their exact facial structure and features. Style it as futuristic digital art with ultra-detailed 8K* resolution. The skin should have a high-gloss, almost glassy finish-enhanced with fine water droplets that catch and reflect light, giving a luminous, dewy effect. Introduce a dramatic blend of neon lighting: soft magenta on one side, electric blue on the other, and subtle violet undertones, creating rich gradients and sharp highlights across the contours of the face. The eyes must appear intensely focused, with crisp, realistic catchlights, adding depth and emotion. Lips should be slightly parted and glossy, as if gently moistened. Include a few wet hair strands naturally falling across the forehead or cheek to enhance realism and texture. Use high contrast and a shallow depth of field, with a moody, softly blurred background that supports the subject but doesn’t distract. The final look should feel emotionally cinematic, stylish, and future-forward. 9:16 ratio.', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:39:40', '2025-07-17 22:20:34', 1),
('2150459b-726f-4696-9eab-ec6744843a9f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'My Medi Logs', 'A modern, patient-centric mobile app design for tracking medications, health logs, and doctor appointments — focused on simplicity, clarity, and accessibility for users managing daily health tasks.', 'Mobile App', 'MyMediLogs is a digital health companion designed to help patients keep track of their medications, symptoms, vital readings, and doctor visits — all in one place. The clean, calming UI uses a soft color palette and intuitive layout to reduce cognitive load for users who may be elderly or chronically ill.\n\nThe app’s dashboard provides a quick glance at today\'s medications, upcoming appointments, and vital signs. A clear visual hierarchy ensures users can easily navigate between medication logs, health stats, reminders, and history.\n\nA major focus was placed on usability, accessibility, and medical clarity, with iconography and structured inputs that reduce the chances of errors. The entire experience supports habit formation with reminders, streaks, and gentle nudges to stay consistent.', '[\"Figma\"]', '[\"Daily medication tracker with reminders\", \"Symptom and health log recording\", \"Doctor appointment scheduler\", \"Clean, minimal and medical-friendly UI\", \"Dashboard overview for quick updates\", \"Accessible design with readable fonts and icons\", \"Consistent visual language and navigation\", \"Mobile-first and elderly-friendly interactions\"]', 'https://www.figma.com/proto/s8QpNsOJbaxnV57Lz3ue3M/My-Medi-Logs--Copy-?page-id=0%3A1&node-id=84-164&viewport=199%2C174%2C0.35&t=IxVGYl0qHbNZJdFh-1&scaling=min-zoom&content-scaling=fixed', NULL, 'published', 0, '2025-07-10 04:39:02', '2025-07-10 04:39:02', 0),
('224092db-f4d7-4376-abaa-afc25ea5bc4d', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Dragon Art', 'Prompt', 'Fantasy', 'A hyper-realistic, cinematic dragon with shimmering obsidian and crimson scales, soaring through a storm-filled sky. The dragon emits a stream of glowing energy toward a futuristic, dystopian cityscape. Lightning streaks across the sky above a landscape filled with atmospheric fog, glowing embers, and crumbling metallic towers. The ground is dark and scorched, and the ruins reflect surreal technology. The scene blends Simon Stålenhag\'s surreal tech ruins with Syd Mead’s neon-lit dystopian designs, in a wide 2:1 composition, suitable for a website banner.', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:27:45', '2025-07-17 22:20:34', 1),
('2382f504-904c-4f57-b95f-f1a61be19ff8', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'Mobile Banking App', 'Secure mobile banking application', 'Mobile Development', 'Created a secure mobile banking application with biometric authentication, real-time transactions, and comprehensive financial management features.', '[\"React Native\", \"Firebase\", \"Biometrics\", \"Redux\"]', '[\"Biometric authentication (fingerprint/face ID)\", \"Real-time transaction monitoring\", \"Bill payments and transfers\", \"Investment portfolio tracking\", \"Push notifications for alerts\", \"Offline transaction queuing\"]', 'https://mobile-banking-app.com', 'https://github.com/username/mobile-banking', 'published', 2100, '2025-07-06 15:50:35', '2025-07-06 15:50:35', 0),
('25c09180-9bfd-4b5b-8346-785caeafdcf6', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'North Sacramento Chamber', 'The North Sacramento Chamber of Commerce website serves local businesses and community members, offering resources, advocacy, and networking opportunities to support economic growth and community development.', 'Wordpress', 'The North Sacramento Chamber of Commerce website is designed to support the local business ecosystem by providing resources, networking opportunities, and advocacy to promote economic growth and community development. It targets business owners, entrepreneurs, and community leaders within the North Sacramento area who are seeking support and partnership opportunities to enhance their business operations and community engagement.\n', '[\"Wordpress\"]', '[\"Business resources, networking events, advocacy programs.\", \"Vision statement and area listings promote local engagement; sponsor logos provide social proof and recognition.\", \"Sponsor logos like SMUD and Kaiser Permanente, indicating significant community support.\"]', ' http://www.northsacchamber.org/', '', 'published', 0, '2025-07-15 18:24:01', '2025-07-17 06:17:36', 0),
('2bb5bc4d-2641-4c14-8e04-2e369d33ac0e', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Blue River', 'At Blue River Analytics, we empower businesses to harness the full potential of their data. Through advanced analytics, data services, and strategic consulting, we deliver scalable solutions designed for the AI-driven future, helping organizations transform challenges into actionable insights.', 'Wordpress', 'At Blue River Analytics, we empower businesses to harness the full potential of their data. Through advanced analytics, data services, and strategic consulting, we deliver scalable solutions designed for the AI-driven future, helping organizations transform challenges into actionable insights.', '[\"Wordpress\", \"MySql\"]', '[]', 'https://blueriveranalytics.com/', NULL, 'published', 0, '2025-07-07 15:46:15', '2025-07-07 15:46:15', 0),
('32bc0a96-97d6-4cc0-a867-257922025305', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'National Bonsai Tree', 'The National Bonsai Registry website is designed to help bonsai enthusiasts register and protect their bonsai trees while fostering a connected community. It\'s primarily for bonsai collectors and hobbyists seeking to safeguard their valuable trees.', 'Laravel + ReactJs', 'The National Bonsai Registry aims to provide a comprehensive platform for documenting and safeguarding bonsai trees. By offering a registration service, the website allows bonsai enthusiasts to catalog their collections securely. This serves the dual purpose of ensuring proper documentation and offering a level of protection, which is crucial for valuable and rare bonsai specimens.\n\nTargeting bonsai collectors, hobbyists, and potentially professional gardeners, the website emphasizes community building within the bonsai world. This is reflected in its mission statement, highlighting the importance of connection among bonsai enthusiasts. Users can engage with each other, share experiences, and gain insights into the art of bonsai cultivation.\n\nThe business model likely revolves around providing a registration service, potentially involving a fee for cataloging each bonsai tree. This service adds value by offering peace of mind to bonsai owners regarding the provenance and protection of their trees. Additionally, the platform might generate revenue through sales in their Bonsai Emporium, where various bonsai-related products are offered.\n\nOverall, the website\'s value proposition centers on providing security and fostering community engagement. It serves as a digital archive and marketplace, appealing to anyone passionate about preserving the art and beauty of bonsai trees.', '[\"NodeJs\", \"ReactJs\", \"Laravel v9\", \"MySql\", \"Boostrap\"]', '[\"Admin, Manager, User Dashboards\", \"Stripe integrations\", \"Vendor registration\", \"Auto-payment distribution\", \"Stock management\", \"Emails & Alerts\"]', 'https://www.nationalbonsairegistry.com/', NULL, 'published', 680, '2025-06-28 11:56:49', '2025-07-15 17:33:00', 0),
('388f0800-fb67-4f4f-8cc5-8afb23344c0c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Amodi Clinics', 'A clean and professional clinic website design aimed at simplifying patient interaction, showcasing medical services, and enabling online appointment booking — all through a modern, trustworthy interface.', 'Web Development', 'Amodi Clinics is a healthcare website UI/UX project built to bridge the gap between patients and clinic services through a streamlined digital experience. The design focuses on creating trust, clarity, and ease of use, especially for first-time visitors seeking medical consultation.\n\nThe homepage clearly communicates the clinic’s mission, available services, specialist profiles, and key CTAs like “Book Appointment” or “Contact Us.” The layout is organized into intuitive blocks — service highlights, patient testimonials, doctor introduction, and a FAQ section to reduce friction and answer common queries.\n\nThe design uses medical-friendly color schemes, calming white space, and precise typography to promote confidence and ease. The user flow is optimized to encourage booking conversions while maintaining an informative and reassuring tone.', '[\"Figma\"]', '[\"Service overview with clear call-to-actions\", \"Online appointment booking system\", \"Doctor profiles with specialization and experience\", \"Patient testimonials section for social proof\", \"FAQs to address common patient concerns\", \"Clean, professional, and accessible layout\", \"Medical-themed, trust-focused color palette\", \"Responsive and user-friendly design\"]', 'http://figma.com/proto/ehmdMACGDobJO0VjTjoYMA/Amodi-Clinics?page-id=0%3A1&node-id=10-748&t=EPMseGSyXUN9mxbK-1', NULL, 'published', 0, '2025-07-10 04:48:12', '2025-07-10 04:48:12', 0),
('3a85b521-37cf-44d3-ac2f-5c992b9f2152', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Hijab Digital Workplace Design', 'Prompt', 'Fantasy', 'A cute and professional 3D illustration of a hijabi Muslim woman in a cozy, modern home office. She is wearing a black abaya and a rose pink hijab, with a confident expression and expressive eyes. She sits on an ergonomic chair, working on a laptop, with a coffee mug beside her. The workspace includes a second screen showing code, wireless mouse and keyboard, water bottle, and headphones hanging on the wall. There\'s a soft-lit window, a wall shelf with a plant and camera, and colorful hexagonal LED lights. A glowing neon sign on the wall reads: \"Khadija Digital Studio\". This digital space represents a creative, elegant, and modest brand identity — built by and for empowered Muslim women. Isometric view, Pixar-style, soft warm lighting, clean aesthetic.*', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:43:13', '2025-07-17 22:20:34', 1),
('3b739e93-851c-449d-a19a-1769b1612840', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Digital Stats', 'Prompt', 'People', '\"A young man in a dimly lit room gazing a thoughtfully at his smartphone. Augmented reality (AR) holograms float around him, including social media icons like Instagram and Threads, app icons from a smartphone screen, follower statistics, and interaction metrics like Reach and views. A message bubble reads, \"How to make this image with artificial intelligence?” Visit: “Your Name \" The scene is bathed in soft, cinematic lighting with a tech-focused,  8k hyper realistic,futuristic\"\'', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 18:02:35', '2025-07-17 22:20:34', 1),
('4722a2e0-3706-48b5-931d-5cb290a01e12', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Homie Dashboard', 'Homie is the premier cashback platform designed to redefine the way you spend and save across the UAE. With a focus on simplicity, convenience, and incredible rewards, Homie makes it effortless to earn cashback on your everyday spendings.', 'NextJS', 'Homie is the premier cashback platform designed to redefine the way you spend and save across the UAE. With a focus on simplicity, convenience, and incredible rewards, Homie makes it effortless to earn cashback on your everyday spendings.', '[\"ReacrJS\", \"MySql\", \"NodeJS\", \"Redux\", \"React Query\", \"Context API\"]', '[\"Transactional Stats\", \"Settings & Configurations\", \"Merchants on-boarding\", \"3rd Party Services configurationns\", \"Mobile APIs configurations\"]', '', '', 'published', 0, '2025-07-10 12:31:30', '2025-07-15 19:51:53', 0),
('4758904e-4020-450c-a66a-819ad09627cc', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Girl in office', 'Prompt', 'People', 'A hyper-realistic photograph of a teenage girl with fair skin and long light brown hair, wearing coral pink over-ear headphones and a matching long-sleeve shirt with subtle fabric creases and minimal text. She is sitting at a modern white desk in a spacious executive office, with full view of the room. The desk contains a silver MacBook with slight fingerprints on the lid, a notepad, a penholder with pens, a stack of visiting cards, and a ceramic mug with glazing imperfections. The girl\'s skin shows natural tone variation, visible pores, and a few fine blemishes for realism. The office features glossy glass walls with faint smudges and reflections, framed black-and-white architectural photos, a decorative vase with white flowers, and a table lamp. The lighting is natural and slightly uneven, casting soft gradients and shadows across the surfaces. Captured from 150 feet away with a Canon 5D Mark IV using a 20mm lens at f/2.8, this image is sharp but naturally imperfect, with true-to-life skin tone, slight chromatic aberration at image edges, and an 8K RAW finish in a 1:1 aspect ratio. The whole scene has a cinematic, editorial photography vibe with subtle grain and material texture.', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:41:59', '2025-07-17 22:20:34', 1),
('4ad240d5-cd40-4705-9a5c-41ab4c3f4792', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Friskay', 'A sleek and playful pet care platform designed to help pet owners manage food deliveries, grooming appointments, and wellness routines — all from one user-friendly dashboard.', 'Website', 'Friskay is a modern digital solution crafted for busy pet owners who want to streamline their pets’ daily care. From healthy food ordering to scheduling grooming services and tracking wellness routines, the app makes pet management fun, fast, and reliable.\n\nThe interface uses a warm and engaging color palette, soft UI elements, and friendly iconography to build trust and emotional connection with the user. The homepage acts as a dashboard — showing current tasks, product suggestions, order status, and quick actions like “Reorder Food” or “Book Grooming.”\n\nEach feature is designed for convenience. The food delivery section has personalized recommendations. Grooming appointments are quick to book, with availability shown clearly. Wellness tools remind users about vet visits, vaccine updates, and daily routines.\n\nThe app is mobile-first, featuring swipe-friendly actions, large buttons, and minimal input steps to support on-the-go usage.', '[\"Figma\"]', '[\"Pet food ordering with smart reordering suggestions\", \"Grooming service booking with calendar availability\", \"Pet wellness dashboard with reminders and trackers\", \"Personalized product recommendations\", \"Clean, playful UI with warm colors and rounded elements\", \"Fast and mobile-friendly interactions\", \"Integrated order tracking and history\", \"User-focused design optimized for busy lifestyles\"]', 'https://www.figma.com/proto/92cWEO5lNgJtaCNhwYyPLM/Friskay-Project?page-id=0%3A1&node-id=2-4&p=f&viewport=847%2C365%2C0.2&t=xkfV0KwOZJJ88pT1-1&scaling=contain&content-scaling=fixed', NULL, 'published', 0, '2025-07-10 05:31:54', '2025-07-10 05:31:54', 0),
('4cfeff36-c8d7-4a67-9754-fec50a8fe069', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'Cloud Infrastructure Dashboard', 'Real-time cloud resource monitoring', 'Cloud Computing', 'Built a comprehensive dashboard for monitoring and managing cloud infrastructure across multiple providers with real-time analytics.', '[\"AWS\", \"Docker\", \"Kubernetes\", \"React\"]', '[\"Multi-cloud resource monitoring\", \"Real-time performance metrics\", \"Cost optimization recommendations\", \"Automated scaling policies\", \"Security compliance monitoring\", \"Custom alerting system\"]', 'https://cloud-dashboard.com', 'https://github.com/username/cloud-dashboard', 'published', 750, '2025-07-06 15:50:36', '2025-07-06 15:50:36', 0),
('56f9f987-82f6-490c-b56d-067f58c630f0', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'AI-Powered Chatbot', 'Intelligent chatbot using machine learning', 'AI/ML', 'Developed an AI-powered chatbot using natural language processing and machine learning algorithms for customer support automation.', '[\"Python\", \"TensorFlow\", \"NLP\", \"FastAPI\"]', '[\"Natural language understanding\", \"Context-aware conversations\", \"Multi-language support\", \"Integration with CRM systems\", \"Analytics and reporting dashboard\", \"Continuous learning capabilities\"]', 'https://ai-chatbot-demo.com', 'https://github.com/username/ai-chatbot', 'published', 890, '2025-07-06 15:50:34', '2025-07-06 15:50:34', 0),
('574669a3-9af2-4dfe-bbb3-9a7fa88995f8', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Miniature cookies', 'Prompt', 'Food', 'A hyper-realistic miniature scene featuring tiny construction workers dressed in white shirts, brown pants, and white helmets working on a stack of elegant beige macarons with a rich chocolate filling. Some workers are standing on ladders, carefully placing small chocolate chunks on top, while others carry ingredients and tools. The macarons are set on a white plate dusted with powdered sugar, surrounded by small caramelized crumbs. The background is softly blurred with a cool, moody blue tone, creating a stylish and artistic atmosphere. 2:1', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:08:51', '2025-07-17 22:20:34', 1),
('5bd5f9b0-222f-4d74-a90a-c8d1300d165f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Ice-cream Cone', 'Prompt', 'Food', 'A hyper-realistic, ultra-detailed 3D digital advertisement of a triple-scoop ice cream cone, stacked high with creamy swirls of strawberry, chocolate, and vanilla. Each scoop is melting slightly under a soft summer sunlight, with glossy, dripping trails running down the textured waffle cone. The surface of the ice cream is rich, with air pockets, subtle frost, and visible mix-ins like chocolate chips, fruit bits, and caramel ribbons.  Around the cone, colorful candy sprinkles, crushed nuts, and syrup droplets explode outward in dynamic slow-motion. A swirl of whipped cream and a shiny cherry top the creation, adding height and balance. The background is a vibrant pastel blend of pink, turquoise, and yellow with soft glowing particles and dreamy bokeh lights, evoking joy and cool summer vibes.  Lighting is cinematic, with high contrast and realistic subsurface scattering on the ice cream to showcase depth and creaminess. Rendered in 4K ultra-HD with extreme macro textures, depth of field, and photorealistic global illumination using Octane Render and Unreal Engine', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:13:00', '2025-07-17 22:20:34', 1),
('6099b945-0a80-4522-804f-25cec635ed11', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Portfolio Theme generator', 'This website serves as a professional portfolio, offering insights into his projects, skills, and technical expertise for potential clients or employers.', 'NextJS', 'This Single Page serves as a personal portfolio for anyone, highlighting his engineering expertise and professional services. The primary focus is to present his skills, portfolio, and project delivery process in a structured manner, making it appealing for potential clients or employers in need of a software engineer. The website aims to establish credibility and provide an overview, targeting industry professionals, companies, and recruiters.\n\nThe website is designed to showcase a range of projects has worked on, categorized under different niches such as e-commerce platforms and mobile applications. It underscores his technical skills and provides insights into the specific technologies he specializes in. The value proposition is to offer an in-depth look at his abilities and past work to assure quality and expertise. \n\nAdditionally, the homepage outlines a project delivery life cycle, detailing the process clients can expect when collaborating with him. This structured approach indicates a professional methodology and sets expectations for potential engagements. The presence of a contact prompt for project discussions encourages user interaction and conversion by inviting inquiries.\n\nUltimately, the site positions as a capable and experienced software engineer ready to deliver customized solutions across various technological platforms, making it a valuable resource for those seeking specialized engineering services.', '[\"NextJs\", \"Supabase\"]', '[\"Primary navigation: Banner, Portfolio, Technologies, Domains, Project Life Cycle.\", \"Portfolio: Showcases past projects with descriptions.\", \"Domains/Niche: Details specific areas of expertise.\", \"Project Delivery Life Cycle: Overview of the development process.\", \"Social proof elements: While not clearly visible, project showcases imply credibility.\", \"Contact or conversion opportunities: Contact details and a consultation booking button.\", \"Mobile Ready, enhanced UI interactivity for the mobile\"]', 'https://theexpertways.com/', 'https://github.com/muneeb-arif/my-portfolio', 'published', 0, '2025-07-10 04:39:12', '2025-07-15 16:40:08', 0),
('7fb327e0-c09a-44b7-882a-80a8faa7429e', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Civil Engineer in 3D Social Media Frame', 'Prompts', 'People', '1. Female Influencer in Summer Vibes\nPrompt:\nA happy young woman wearing a bright yellow sundress and a wide straw hat, smiling and waving while emerging through a torn Instagram-style social media frame. The post shows her name “Emily Summers” with a verified badge, 5 million followers, and Like, Comment, Share buttons. The backdrop is minimalistic white, with soft shadows and 3D paper tear effects. Her makeup is natural with glowing skin, conveying a cheerful summer vibe.\n\nTags: ultra-realistic, 3D cutout, fashion influencer, sunny aesthetic, cinematic lighting\n\n2. Gamer in Cyberpunk Theme\nPrompt:\nA cool young man wearing a neon-lit gaming headset and a futuristic jacket, leaning through a broken 3D digital screen designed like a Twitch stream overlay. The name reads “N3onKnight” with a verified badge and 2.5 million followers. He’s doing a victory pose with a game controller in one hand. The background is dark with glowing blue and purple lights, creating a cyberpunk tech vibe. Social icons are stylized and edgy.\n\nTags: cyberpunk, ultra-realistic, gamer aesthetic, 3D stream mockup, neon lights\n\n3. Fitness Coach in Action Pose\nPrompt:\nA fit and energetic woman in a black sports bra and leggings, jumping energetically through a ripped social media post frame that shows “Coach Laila Fit” with 7 million followers and a verified badge. The interface shows high engagement buttons and workout emojis. The lighting highlights her muscle tone and the torn paper edge adds a dynamic 3D action effect.\n\nTags: fitness influencer, 3D mockup, high-energy, ultra-realistic, motivational aesthetic\n\n4. Tech YouTuber in Nerdy Style\nPrompt:\nA smiling young man with glasses, a graphic t-shirt, and a laptop under his arm, peeking through a social media post designed like a YouTube thumbnail. His name reads “TechTalks with Samir,” showing 3.2M subscribers, a red check badge, and a stylized \"Subscribe\" button. The cardboard frame looks like it’s been broken open, giving a playful, nerdy 3D effect with floating tech icons.\n\nTags: tech YouTuber, 3D realistic, nerdy aesthetic, cinematic mockup, informative vibe\n\n5. Fashion Model in High-End Editorial Style\nPrompt:\nA glamorous female fashion model wearing a sleek black dress and silver jewelry, elegantly emerging from a luxury-themed 3D Instagram post cutout. Her profile reads “Ava Noir” with 15 million followers and a blue verified badge. The interface is minimal, with a like count in millions and subtle gold accents. Lighting is moody and editorial, emphasizing elegance and detail.\n\nTags: fashion editorial, ultra-realistic, luxury theme, 3D Instagram mockup, cinematic\n\n6- Civil Engineer in 3D Social Media Frame\nPrompt\nA confident male civil engineer, smiling and emerging through a torn 3D social media post frame. The profile displays the name “Eng. Salman Tahir” with a blue verified badge and 1.2 million followers. The engineer is wearing a white safety helmet, a reflective yellow vest over a light blue shirt, and holding rolled-up blueprints. His facial appearance should match the person in the uploaded photo. The background includes a subtle construction site with cranes and scaffolding, softly blurred for focus on the subject. The social media frame includes realistic torn edges and Like, Comment, Share icons in a clean, modern style. The lighting is cinematic, giving the image a hyper-realistic and professional feel.\n\nTags: ultra-realistic, civil engineer, 3D paper cutout, cinematic lighting, construction site, verified social media look, real face match (use uploaded image for face reference)', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:54:05', '2025-07-17 22:20:34', 1),
('8117d5e7-a1d2-402b-bceb-f4094950979a', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Dubai Brunch', 'Restaurant reservation and voucher-based experience site.', 'Laravel + VueJs', 'Restaurant reservation and voucher-based experience site.', '[\"Laravel\", \"VueJs\", \"MySQL\"]', '[]', 'https://dubai-brunch.com/', NULL, 'published', 0, '2025-07-10 12:43:15', '2025-07-15 16:53:48', 0),
('82f4e753-d0db-4621-8652-d03d1324566e', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Order.uk', 'A vibrant and intuitive food delivery website design focused on fast browsing, easy ordering, and a visually rich user experience to attract hungry customers and boost online conversions.', 'Website', 'This food delivery platform UI/UX design offers a seamless and enjoyable ordering journey — from discovering nearby restaurants to customizing and placing an order. The interface highlights speed, clarity, and appetite appeal, blending high-quality visuals with a structured layout.\n\nThe homepage welcomes users with a bold hero section, search bar, and category filters to immediately get them browsing meals. Food items are showcased with clean cards that include images, ratings, and pricing. The menu system is optimized for fast filtering, smooth navigation, and cart management.\n\nKey user flows such as adding items to the cart, customizing orders, and checkout are kept minimal yet functional, ensuring frictionless ordering even for first-time users. The design is mobile-responsive and tailored for both local restaurants and delivery services.', '[\"Figma\"]', '[\"Hero banner with search and location input\", \"Food category filters and restaurant listing\", \"Product cards with images, ratings, and prices\", \"Easy add-to-cart and custom order flow\", \"Clean, responsive layout for all devices\", \"Order tracking and checkout screens\", \"Visual appeal with vibrant food imagery\", \"Intuitive navigation and smooth UX transitions\"]', 'https://www.figma.com/proto/uipeAEP2hgEbkBNWVW8xWO/Food-Delivery-Website?page-id=0%3A1&node-id=1-2&t=eCLaSQrKnciCytDX-1&content-scaling=fixed', NULL, 'published', 0, '2025-07-10 04:52:30', '2025-07-10 04:52:30', 0),
('8729ba2c-7f44-4149-8d8d-b608a1331d11', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Joyful rabbit ride', 'Prompt', 'Cartoon', 'A hyper-realistic cinematic scene of a joyful man riding an oversized, cartoonish, hyper-detailed rabbit through a vibrant countryside. The man is laughing with excitement, leaning forward as the rabbit runs energetically from right to left. The rabbit has large expressive eyes, exaggerated floppy ears, and a playful open-mouthed smile. The background features a lush green landscape, colorful flowers, and a distant golden pagoda-style temple under a bright blue sky with scattered clouds. Rendered in ultra-realistic, Pixar-style 3D animation, with dynamic motion blur and warm natural lighting', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:06:55', '2025-07-17 22:20:34', 1),
('8f9336b5-6c2d-49b6-a5e0-0ce750b7f18c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Tourm', 'A clean, modern UI/UX design for a travel and tour booking platform that showcases curated destinations, travel packages, and user-centric booking flows with an emphasis on visuals and simplicity.', 'Travel', 'This travel and tour website design presents a visually immersive experience, ideal for premium tour agencies targeting adventure seekers, families, and international travelers. The homepage hero section immediately captures attention with bold typography, compelling travel imagery, and clear call-to-actions like \"Explore\" and \"Book Now\".\n\nThe layout follows a modular structure:\n\nA destination-centric card system makes it easy for users to browse various locations.\n\nPackage details are highlighted with clear pricing, durations, and key amenities.\n\nUser navigation is intuitive with sticky headers and scrollable sections for seamless exploration.\n\nThe design demonstrates a well-balanced use of whitespace, smooth gradients, and minimalist icons, making the platform inviting and easy to interact with.\n\nThe mobile-responsive approach ensures optimal usability across devices. It\'s evident that the focus was placed on emotional appeal, conversion optimization, and accessibility.', '[\"Figma\"]', '[\"Hero section with strong imagery and CTAs\", \"Destination cards with visual previews\", \"Package details with pricing, duration, and highlights\", \"Clean, modular layout for easy navigation\", \"Sticky header and smooth scrolling\", \"Mobile-responsive design\", \"Minimal and consistent iconography\", \"Conversion-optimized booking flow\"]', 'https://www.figma.com/proto/9aITbs6hlkJLzwiKeWlOM7/Travel---Tours--Copy-?page-id=0%3A1&node-id=1-2&t=boaKI0D7RX51mR7H-1', NULL, 'published', 680, '2025-06-30 11:52:43', '2025-06-30 11:52:43', 0),
('902eb229-3192-441a-a785-e28289c778c6', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Website', 'XCHANGEER is a cryptocurrency exchange platform designed for individuals looking to buy and sell Bitcoin safely and efficiently.', 'Laravel + ReactJs', 'The XCHANGEER website serves as an online platform for Bitcoin exchange, promising a secure and reliable service for cryptocurrency users. The homepage is tailored to attract both novice and experienced cryptocurrency investors by emphasizing transparency and trustworthiness. Its primary purpose is facilitating Bitcoin transactions, providing users with easy access to buying and selling the digital currency.\n\nThe target audience includes tech-savvy individuals interested in digital currencies, as well as mainstream users seeking to explore cryptocurrency investments. The business model appears to be based on transactional fees generated each time a user buys or sells Bitcoin through the platform, supported by subscription plans or fixed-rate packages as highlighted on the website.\n\nThe value proposition revolves around a secure user experience, comprehensive support, and ease of use. Utilizing clear graphics and concise text, the site communicates its dedication to security, affordability, and international coverage, which could appeal to global users. Features like strong security protocols and multiple payment options underscore its commitment to safe and accessible trading.', '[\"Laravel\", \"bootstrap\"]', '[]', 'https://home.xchangeer.com/', '', 'published', 0, '2025-07-15 18:03:50', '2025-07-15 19:46:03', 0),
('903dcdfc-7778-4b5a-9209-ab7153bdefa4', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Test AI Prompt', 'This is a test prompt for AI assistance', 'Web Development', NULL, NULL, NULL, NULL, NULL, 'published', 0, '2025-07-17 17:33:48', '2025-07-17 17:33:48', 1),
('9b9a7724-9813-4066-9296-974bc4888ac7', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'Blockchain Supply Chain', 'Transparent supply chain tracking', 'Blockchain', 'Implemented a blockchain-based supply chain tracking system ensuring transparency and immutability of product journey from source to consumer.', '[\"Ethereum\", \"Solidity\", \"Web3.js\", \"Node.js\"]', '[\"Product traceability from source to consumer\", \"Smart contracts for automated compliance\", \"Real-time tracking with IoT integration\", \"Transparent audit trail\", \"Supplier verification system\", \"Consumer authentication for product origin\"]', 'https://blockchain-supplychain.com', 'https://github.com/username/blockchain-supplychain', 'published', 680, '2025-07-06 15:50:37', '2025-07-06 15:50:37', 0),
('9bbdb0ae-f036-421c-8442-622655869a4f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Milk Ad', 'Prompt', 'Food', 'A floating glass of Milk with logo attached (emano) 100% pure milk surrounded by a splash of creamy milk in mid-air, with broken biscuits and cereal flakes swirling around it, cold condensation on the bottle, droplets suspended in the air, vibrant and dramatic lighting with a warm golden background, realistic and high-resolution product ad style, 3D rendering, photorealistic.', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:30:44', '2025-07-17 22:20:34', 1),
('9f976ab3-fadb-4a1a-b001-3ef7484c5f48', '033f0150-6671-41e5-a968-ff40e9f07f26', 'Homie', 'Introducing Homie: Your Ultimate Cashback App in the UAE', 'IOS Development', 'Homie is the premier cashback platform designed to redefine the way you spend and save across the UAE. With a focus on simplicity, convenience, and incredible rewards, Homie makes it effortless to earn cashback on your everyday spendings.', '[\"Swift\", \"SwiftUI\", \"xCode\", \"GitHub\", \"CocoaPods\", \"Sourcetree\", \"Postman\"]', '[\"Leading the development of Homie’s cashback iOS application, designed to help users earn cashback from partnered brands and retailers.\", \"Architected the app using MVVM pattern and modular architecture, enabling scalable feature development and easier maintenance.\", \"Integrated key cashback app features: – User onboarding and authentication (phone/OTP) – Cashback tracking and wallet system – Deep linking for promotional campaigns – Real-time push notifications and in-app messaging using Firebase\", \"Implemented Auto Layout and reusable UI components for a consistent, responsive design across iPhones\", \"Deployed builds to TestFlight and managed App Store releases, provisioning, and certificates\", \"Collaborated closely with design and backend teams to deliver smooth user experiences and high feature reliability\", \"Mentored junior developers, conducted code reviews, and managed release.\"]', 'https://apps.apple.com/ae/app/homie/id6450675083', NULL, 'published', 0, '2025-06-28 13:31:31', '2025-06-28 13:31:31', 0),
('a1b2f3ef-9ccd-4d8c-8334-572cedb3f783', '2f660a9a-3538-4384-970c-53b4bd37d4a8', '3d Social media profile', 'Prompt', 'People', 'A 3D illustration of a hand holding a neon sign with a social media profile on it. The neon sign is rectangular and has rounded corners, with a pink glow around the edges. In the center of the sign, there is a circular profile picture of a man with dark hair and a neutral expression. To the right of the profile picture, the name \"Ace Jr\" is written in white text, followed by the title \"Digital Creator\" in smaller text below. On the bottom left corner of the sign, there are two social media logos: Facebook and Instagram. On the bottom right corner, there is a number \"17K\" followed by the word \"followers\". The background of the image is a gradient of purple and orange colors.', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:44:09', '2025-07-17 22:20:34', 1),
('a573e0b2-ab0c-4a2d-96a6-fe9f2813b0e8', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Anime Fisheye Selfie', 'Prompt', 'Cartoon', 'Ultra-realistic 3D 9:16 vertical format fisheye selfie of me with [ninja hattori, Power rangers, doremon, sinchan, oggy and the cockroaches, kochikame ]. We\'re all making silly, exaggerated faces except that keep my face simple with a cute smile ,. Set in a small, bright living room with white tones. High camera angle. Extreme fisheye distortion. Realistic, cinematic lighting, anime characters integrated with stylized realism.', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:58:36', '2025-07-17 22:20:34', 1),
('ad24430b-3fb4-407c-afe8-f8717249de13', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Hyper-realistic water portrait', 'Prompt', 'People', 'Create a hyper-realistic close-up portrait of a young men\'s face, with full face visible and partially submerged in water. The scene is illuminated dramatically with soft, ambient blue and pink neon lighting, casting colorful reflections on her wet skin and damp hair. Water droplets and small bubbles cling to her face, enhancing the cinematic mood. The skin texture, and intense eye focus are clearly visible.', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:49:54', '2025-07-17 22:20:34', 1);
INSERT INTO `projects` (`id`, `user_id`, `title`, `description`, `category`, `overview`, `technologies`, `features`, `live_url`, `github_url`, `status`, `views`, `created_at`, `updated_at`, `is_prompt`) VALUES
('ae1c614c-4db5-45ef-9faa-f2432138b155', '033f0150-6671-41e5-a968-ff40e9f07f26', 'The ENTERTAINER', '1000’s of offers in your city', 'IOS Development', 'The ENTERTAINER is a leading digital app whose main goal is to add value to consumers by bringing them the best incentive offers globally. The ENTERTAINER is full of exciting Buy One Get One Free offers for restaurants, beauty salons, health fitness, leisure activities, and many more. It also includes Entertainer Travel with over 500 hotels worldwide giving you the chance to stay at the world’s best hotels.', '[\"Objective C\", \"Swift\", \"xCode\", \"Private Pods\", \"GitHub\", \"CocoaPods\", \"Sourcetree\", \"Postman\"]', '[\"Leading the development and maintenance of The Entertainer iOS app, a leading B2C lifestyle platform offering Buy One Get One Free deals, discounts, and travel offers across restaurants, fitness, beauty, and hotels.\", \"Worked across multiple core modules including Travel, Delivery, and Soleil, adding new features, improving stability, and modernizing legacy code.\", \"Utilized Objective-C and Swift, applying modular architecture to organize codebase and streamline feature development across multiple teams.\", \"Key features implemented: – User authentication, referral system, and profile management – Dynamic offer listings with filtering, deep linking, and real-time updates – Deep linking for promotional campaigns\"]', 'https://apps.apple.com/pk/app/the-entertainer/id702813714', NULL, 'published', 0, '2025-06-28 13:25:44', '2025-06-28 13:25:44', 0),
('b49daf28-4d6a-40bc-9dfc-d8bc2ec23c24', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'MonteurzimmerKING', 'MonteurzimmerKING is a platform specialized in managing and renting out worker accommodations (monteur rooms, boarding houses, etc.) across multiple German cities, offering listings, franchise opportunities, and professional software tools', 'Laravel + VueJs', 'MonteurzimmerKING is designed for landlords and real estate investors to list—including automated tools, coaching, and franchise support. The platform supports hundreds of properties in 70+ cities, handling booking, documentation, invoicing, and communications in a highly automated manner.', '[\"Laravel\", \"VueJs\", \"JS-Es6\", \"MySql\", \"bootstrap\"]', '[\"Accommodation Listings: Searchable database of worker and monteur rooms with pricing and details.\", \"Franchise & Coaching: Support programs to scale rental income through consulting and training.\", \"Automation Tools: Integrated systems for booking, invoices, house rules, reminders, and tax documentation.\", \"All‑in‑one Software Dashboard: Covers property management, tenant intake, logistics, financial tracking, and ticketing.\", \"Scalability: Designed for rapid expansion, including pre-built furnishing logistics.\", \"Support Network: 24/365 support and branding/licensing backup through franchise partnerships.\"]', 'https://monteurzimmerking.info', '', 'published', 0, '2025-07-17 06:07:18', '2025-07-17 15:14:58', 0),
('b9b5a957-c8b1-4a82-8ac3-d58ad67aed7d', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Company Website', 'A place for everyone who wants to simply buy and sell Bitcoins. Deposit funds using your Visa/MasterCard or bank transfer. Instant buy/sell of Bitcoins at fair price is guaranteed. Nothing extra. Join over 700,000 users from all over the world satisfied with our services.', 'ReactJs | NextJs', 'A place for everyone who wants to simply buy and sell Bitcoins. Deposit funds using your Visa/MasterCard or bank transfer. Instant buy/sell of Bitcoins at fair price is guaranteed. Nothing extra. Join over 700,000 users from all over the world satisfied with our services.', '[\"ReactJs\", \"Bootstrap\"]', '[]', 'https://home.xchangeer.com/', NULL, 'published', 0, '2025-07-07 15:59:58', '2025-07-07 15:59:58', 0),
('c0a2d484-7e40-454b-97dc-6adce018ef08', '033f0150-6671-41e5-a968-ff40e9f07f26', 'ENTERTAINER go', 'Change the way you travel the world', 'IOS Development', 'See popular attractions for less, dine 2-for-1* in top restaurants or plan your day in a couple of clicks, all from one app.', '[\"Swift\", \"Private Pods\", \"xCode\", \"GitHub\", \"CocoaPods\", \"Sourcetree\", \"Postman\"]', '[\"Played a key role in the development and maintenance of Entertainer Go, a lifestyle app offering exclusive deals, discounts, and digital offers to users across multiple regions.\", \"Improved app performance by optimizing network layer and memory usage, resulting in smoother UI transitions and reduced crashes.\", \"Implemented geolocation-based offer suggestions, personalized recommendations, and dynamic content updates.\", \"Collaborated cross-functionally with backend, QA, and design teams to ensure consistent feature delivery in agile sprints.\", \"Key features implemented: – Implemented dynamic offer listings, personalized recommendations, and location-based deal suggestions. – Integrated real-time search and filtering for smoother user navigation. – Refactored legacy Objective-C modules to Swift for better maintainability and performance. – Integrated third-party analytics, Firebase Crashlytics, and deep linking to improve engagement and track user behavior.\"]', 'https://apps.apple.com/pk/app/entertainer-go/id1471973375', NULL, 'published', 0, '2025-06-28 13:36:47', '2025-06-28 13:36:47', 0),
('c9a4f921-1723-4f02-9396-c31c61a19ea9', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Underwater Astronaut and Jelly-fish', 'Prompt', 'Fantasy', '\"Upclose underwater photo of a young man underwater in an astronaut suit white no helmet, his face is looking up at a jellyfish that is floating right above him, photo taken from his side profile, his pointer finger is reaching for the jellyfish, there is a jellyfish right in front of his face, no astraunaut helmet, his hair is dynamicly moving in the water, dark lighting, there are a lot of small glowing jellyfish that are emitting light in the water around him, water bubbles, he has no helmet.\"', '[]', '[]', NULL, NULL, 'published', 0, '2025-07-10 17:57:21', '2025-07-17 22:20:34', 1),
('d10ce4b6-0747-490f-845f-e9fb9883bee0', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'E-Commerce Platform', 'A full-stack e-commerce solution with modern UI/UX', 'Web Development', 'Built a comprehensive e-commerce platform with React frontend and Node.js backend, featuring user authentication, payment processing, and admin dashboard.', '[\"React\", \"Node.js\", \"MongoDB\", \"Stripe\"]', '[\"User authentication and authorization\", \"Product catalog with search and filtering\", \"Shopping cart and checkout process\", \"Payment integration with Stripe\", \"Admin dashboard for inventory management\", \"Responsive design for mobile devices\"]', 'https://example-ecommerce.com', 'https://github.com/username/ecommerce-platform', 'published', 1250, '2025-07-06 15:50:34', '2025-07-06 15:50:34', 0),
('df885584-ef0a-46af-8de0-89aa1e5ab1e7', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Bonsai National Tree', 'National Bonsai is a B2B multi-vendor marketplace built for bonsai tree retailers and gardening product vendors. Each merchant can independently register, set up their own storefront, and manage products such as bonsai trees, gardening tools, tracking chips, and related accessories.', 'Laravel', '🛍️ Merchant Features\nMerchant registration & storefront creation\nProduct management (bonsai trees, gardening tools, tracking chips)\nOrder management & transaction tracking\nStripe Connect integration for automated payouts\nDedicated merchant dashboard\n\n👤 Customer Features\nCustomer registration & login\nDashboard to:\nView purchased items\nAccess transaction history\nManage/edit profile\nCart & checkout flow\n\n🛠️ Super Admin Features\nManage all merchants & storefronts\nContent management system (CMS) for platform-wide content\nPlatform settings configuration\nStripe payout settings control\n\n💳 Stripe Integration Features\nSecure payments via Stripe\nAutomated payment distribution to vendors (Stripe Connect)\nPayment tracking & history\n\n📦 Other Functional Highlights\nMulti-vendor architecture (each merchant manages their own mini-store)\nClean separation of user roles (merchant, customer, super admin)\nScalable and modular dashboard system', '[\"Laravel\", \"Git\", \"ReactJs\", \"MySql\", \"Stripe\", \"Bootstrap 5\"]', '[\"Merchant Dashboard: Manage products, orders, and payouts.\", \"Customer Dashboard: View purchase history, manage profile, and track orders.\", \"Super Admin Panel: Oversee merchants, content management, and global settings.\", \"Integrated with Stripe Connect, the system is configured to automatically route payments to merchants, ensuring seamless and secure financial operations.\"]', 'https://www.nationalbonsairegistry.com/', NULL, 'published', 0, '2025-07-07 15:31:02', '2025-07-07 15:31:02', 0),
('e8100326-69ef-427a-98e7-652cae1dfaf1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Portfolio Website', 'Porfolio website to showcase projects, with custom dashboard to create projects and its categories, change theme color-schemes and more', 'ReactJs | NextJs', 'Porfolio website to showcase projects, with custom dashboard to create projects and its categories, change theme color-schemes and more', '[\"ReactJs\", \"Supabase\", \"Tailwind\", \"EmailJs\"]', '[\"Theme generator\", \"Auto theme update from dashboard\"]', ' https://muneeb.theexpertways.com/', NULL, 'published', 0, '2025-07-07 15:54:22', '2025-07-07 15:54:22', 0),
('f6793385-24cb-4a26-b023-b5c3e9b59e26', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Blue River Analytics', 'Blue River Analytics is a data solutions company specializing in data governance, analytics for energy industries, and Spotfire consulting, aimed at organizations needing data-driven insights.', 'Wordpress', 'Blue River Analytics is focused on providing comprehensive data solutions to help organizations unlock insights from their data. The website highlights its expertise in data governance, analytics tailored to the energy sector, and Spotfire consulting services. The target audience includes businesses seeking to optimize their data management and derive actionable insights to drive strategic decisions. The company positions itself as a strategic partner for organizations grappling with the challenges posed by the explosive growth of data, providing tailored frameworks and consultation to harness data effectively.\n\nThe homepage emphasizes the company\'s core offerings, showing a commitment to solving data challenges through customized service packages. Potential clients are invited to address their specific needs, from data management gaps to comprehensive data governance frameworks, directly aligning with client-specific demands. By promoting its industry-specific services, particularly for the energy sector, Blue River Analytics aims to position itself as an expert in delivering analytical solutions that cater to niche markets.\n\nThe website’s business model revolves around consultancy and direct collaboration with businesses to implement data-driven solutions. Its value proposition lies in transforming complex data into strategic assets, aiding clients in maintaining competitive edges and improving operational efficiencies. The presence of testimonials and diverse industry applications further reinforces trust and credibility.\n\nOverall, Blue River Analytics offers substantial value to organizations, providing not only technical solutions but also the strategic insight necessary for effective data utilization. Testimonials and case studies act as potent social proof elements that underscore the company’s impact and success in the field.', '[\"Wordpress\", \"Bootstrap\", \"Elementor\"]', '[\"Data governance, analytics for energy, Spotfire consulting.\", \"Book demo, contact forms.\", \"Customer testimonials and industry recognitions.\"]', 'https://blueriveranalytics.com/', NULL, 'published', 0, '2025-07-10 12:58:06', '2025-07-10 12:58:06', 0);

-- --------------------------------------------------------

--
-- Table structure for table `project_images`
--

CREATE TABLE `project_images` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bucket` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'images',
  `order_index` int(11) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_images`
--

INSERT INTO `project_images` (`id`, `project_id`, `user_id`, `url`, `path`, `name`, `original_name`, `size`, `type`, `bucket`, `order_index`, `created_at`, `updated_at`) VALUES
('00e50333-d0f9-4ae2-bab8-ad8743dedd49', '2150459b-726f-4696-9eab-ec6744843a9f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229450752_Screenshot_2025-07-10_at_2.31.31_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229450752_Screenshot_2025-07-10_at_2.31.31_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229450752_Screenshot_2025-07-10_at_2.31.31_pm.png', 'Screenshot 2025-07-10 at 2.31.31 pm.png', NULL, NULL, 'images', 1, '2025-07-11 05:24:22', '2025-07-13 22:59:06'),
('022b17ee-eb06-49fe-a136-071d5e777010', 'f6793385-24cb-4a26-b023-b5c3e9b59e26', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170296270_spotfire_consulting_viewport_1752068730.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170296270_spotfire_consulting_viewport_1752068730.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170296270_spotfire_consulting_viewport_1752068730.jpg', 'spotfire_consulting_viewport_1752068730.jpg', NULL, NULL, 'images', 1, '2025-07-10 12:58:18', '2025-07-15 22:20:57'),
('02f3ae68-482f-44ce-9289-f4e719b54fcb', '4722a2e0-3706-48b5-931d-5cb290a01e12', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168690623_1751135491868_homie-logo.jpeg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168690623_1751135491868_homie-logo.jpeg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168690623_1751135491868_homie-logo.jpeg', '1751135491868_homie-logo.jpeg', NULL, NULL, 'images', 1, '2025-07-10 12:49:53', '2025-07-15 22:20:57'),
('03ad6702-fd53-4ceb-9b68-593e34c2fbd5', '6099b945-0a80-4522-804f-25cec635ed11', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752144514193_Screenshot_2025-07-10_at_1.22.32_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752144514193_Screenshot_2025-07-10_at_1.22.32_PM.png', '1752144514193_Screenshot_2025-07-10_at_1.22.32_PM.png', '1752144514193_Screenshot_2025-07-10_at_1.22.32_PM.png', NULL, NULL, 'images', 1, '2025-07-15 16:40:08', '2025-07-15 16:40:08'),
('0425f30d-0404-414c-9ff8-366496165d70', '7fb327e0-c09a-44b7-882a-80a8faa7429e', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188046516_ChatGPT_Image_Jul_11_2025_03_50_43_AM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188046516_ChatGPT_Image_Jul_11_2025_03_50_43_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188046516_ChatGPT_Image_Jul_11_2025_03_50_43_AM.png', 'ChatGPT Image Jul 11, 2025, 03_50_43 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:54:24', '2025-07-13 22:59:06'),
('05a7b430-0cb2-43cf-b00a-66061f5f3e89', '0d601d35-1481-4db7-b2ae-6c0bed331526', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186237415_ChatGPT_Image_Jul_9_2025_01_06_50_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186237415_ChatGPT_Image_Jul_9_2025_01_06_50_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186237415_ChatGPT_Image_Jul_9_2025_01_06_50_AM.png', 'ChatGPT Image Jul 9, 2025, 01_06_50 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:24:15', '2025-07-13 22:59:06'),
('06602da8-610b-4808-91f3-c72d0c77cfde', 'e8100326-69ef-427a-98e7-652cae1dfaf1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921666209_Screenshot%202025-06-27%20at%2003.19.41.png', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921666209_Screenshot 2025-06-27 at 03.19.41.png', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921666209_Screenshot 2025-06-27 at 03.19.41.png', 'Screenshot 2025-06-27 at 03.19.41.png', 583705, 'image/png', 'images', 3, '2025-07-07 15:54:28', '2025-07-15 22:20:57'),
('06c2a700-284b-421a-a2c5-bc2e2464faea', '6099b945-0a80-4522-804f-25cec635ed11', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752140373570_WhatsApp%20Image%202025-07-10%20at%201.31.25%20PM%20(1).jpeg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752140373570_WhatsApp%20Image%202025-07-10%20at%201.31.25%20PM%20(1).jpeg', '1752140373570_WhatsApp Image 2025-07-10 at 1.31.25 PM (1).jpeg', '1752140373570_WhatsApp Image 2025-07-10 at 1.31.25 PM (1).jpeg', NULL, NULL, 'images', 2, '2025-07-15 16:40:08', '2025-07-15 22:20:57'),
('089229eb-ce69-4a3f-9807-be9b1f6ddf4d', '01a004b3-9ed3-447e-b606-1ca9730ac3ad', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171187812_Screenshot_2025-07-10_at_11.06.32_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171187812_Screenshot_2025-07-10_at_11.06.32_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171187812_Screenshot_2025-07-10_at_11.06.32_PM.png', 'Screenshot 2025-07-10 at 11.06.32 PM.png', NULL, NULL, 'images', 1, '2025-07-15 16:54:24', '2025-07-15 16:54:24'),
('0aa4c09d-9a0e-4391-93ea-7e7d6256846a', '388f0800-fb67-4f4f-8cc5-8afb23344c0c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229289539_Screenshot_2025-07-11_at_3.20.18_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229289539_Screenshot_2025-07-11_at_3.20.18_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229289539_Screenshot_2025-07-11_at_3.20.18_pm.png', 'Screenshot 2025-07-11 at 3.20.18 pm.png', NULL, NULL, 'images', 1, '2025-07-11 05:21:32', '2025-07-15 22:20:57'),
('0b98e155-3bb8-4d70-90a8-c253675f34c5', '8117d5e7-a1d2-402b-bceb-f4094950979a', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752169395050_Screenshot_2025-07-10_at_10.42.04_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752169395050_Screenshot_2025-07-10_at_10.42.04_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752169395050_Screenshot_2025-07-10_at_10.42.04_PM.png', 'Screenshot 2025-07-10 at 10.42.04 PM.png', NULL, NULL, 'images', 1, '2025-07-15 16:53:49', '2025-07-15 16:53:49'),
('0d7d1d84-afc4-48bd-a865-e61ced3b45fd', '35810ea1-2239-45c0-8b9c-cdcdb9596f47', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'blob:http://localhost:3000/64c6f172-ff97-43a2-b2a3-72b18e794725', 'blob:http://localhost:3000/64c6f172-ff97-43a2-b2a3-72b18e794725', 'resources_full_1752069152.jpg', 'resources_full_1752069152.jpg', NULL, NULL, 'images', 4, '2025-07-15 18:18:10', '2025-07-15 18:18:10'),
('0e954ad0-b2b7-4819-9b73-3710e2a4a979', 'f6793385-24cb-4a26-b023-b5c3e9b59e26', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170289650_contact_us_viewport_1752068934.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170289650_contact_us_viewport_1752068934.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170289650_contact_us_viewport_1752068934.jpg', 'contact_us_viewport_1752068934.jpg', NULL, NULL, 'images', 2, '2025-07-10 12:58:18', '2025-07-13 22:59:06'),
('106a1727-f925-4099-8501-0a962db5e63e', '32bc0a96-97d6-4cc0-a867-257922025305', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135018370_National-Bonsai-Registry-06-12-2025_01_47_AM%20(1)%20(1).png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135018370_National-Bonsai-Registry-06-12-2025_01_47_AM%20(1)%20(1).png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135018370_National-Bonsai-Registry-06-12-2025_01_47_AM (1) (1).png', 'National-Bonsai-Registry-06-12-2025_01_47_AM (1) (1).png', NULL, NULL, 'images', 5, '2025-07-15 17:33:02', '2025-07-15 17:33:02'),
('11000511-f8a6-4fa7-abee-1fcd3517b0b1', '11c485ee-bcaf-470f-b6c7-47dcca59ccce', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188463218_ChatGPT_Image_Jul_11_2025_03_59_07_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188463218_ChatGPT_Image_Jul_11_2025_03_59_07_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188463218_ChatGPT_Image_Jul_11_2025_03_59_07_AM.png', 'ChatGPT Image Jul 11, 2025, 03_59_07 AM.png', NULL, NULL, 'images', 1, '2025-07-10 18:01:09', '2025-07-15 22:20:57'),
('1351f108-c519-4195-b804-f19256e4a3f4', 'e8100326-69ef-427a-98e7-652cae1dfaf1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921663597_home_full_1751742470.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921663597_home_full_1751742470.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921663597_home_full_1751742470.jpg', 'home_full_1751742470.jpg', 886757, 'image/jpeg', 'images', 2, '2025-07-07 15:54:26', '2025-07-15 22:20:57'),
('142fd81f-a6c8-46ee-a387-e5b92914c137', '01a004b3-9ed3-447e-b606-1ca9730ac3ad', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171182923_Screenshot_2025-07-10_at_11.05.41_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171182923_Screenshot_2025-07-10_at_11.05.41_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171182923_Screenshot_2025-07-10_at_11.05.41_PM.png', 'Screenshot 2025-07-10 at 11.05.41 PM.png', NULL, NULL, 'images', 2, '2025-07-15 16:54:24', '2025-07-15 22:20:57'),
('14aa27bd-4e4b-4f9e-9e94-a0fa980bd865', 'f6793385-24cb-4a26-b023-b5c3e9b59e26', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170291100_data_governance_viewport_1752068789.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170291100_data_governance_viewport_1752068789.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170291100_data_governance_viewport_1752068789.jpg', 'data_governance_viewport_1752068789.jpg', NULL, NULL, 'images', 3, '2025-07-10 12:58:18', '2025-07-13 22:59:06'),
('1689230f-3828-438f-ad48-68de96ccf895', 'f6793385-24cb-4a26-b023-b5c3e9b59e26', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170288433_analytics_for_energy_viewport_1752068847.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170288433_analytics_for_energy_viewport_1752068847.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170288433_analytics_for_energy_viewport_1752068847.jpg', 'analytics_for_energy_viewport_1752068847.jpg', NULL, NULL, 'images', 4, '2025-07-10 12:58:18', '2025-07-15 22:20:57'),
('16925778-1d95-4652-a6ce-73920017a511', '388f0800-fb67-4f4f-8cc5-8afb23344c0c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229267554_Screenshot_2025-07-11_at_3.16.50_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229267554_Screenshot_2025-07-11_at_3.16.50_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229267554_Screenshot_2025-07-11_at_3.16.50_pm.png', 'Screenshot 2025-07-11 at 3.16.50 pm.png', NULL, NULL, 'images', 2, '2025-07-11 05:21:32', '2025-07-15 22:20:57'),
('16af5589-0fbe-4b14-9a2d-3538646bea97', '82f4e753-d0db-4621-8652-d03d1324566e', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752228819994_Screenshot_2025-07-11_at_3.03.58_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752228819994_Screenshot_2025-07-11_at_3.03.58_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752228819994_Screenshot_2025-07-11_at_3.03.58_pm.png', 'Screenshot 2025-07-11 at 3.03.58 pm.png', NULL, NULL, 'images', 1, '2025-07-11 05:13:56', '2025-07-15 22:20:57'),
('18c6cf93-4be3-4484-9e13-4abc032e88d4', '82f4e753-d0db-4621-8652-d03d1324566e', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752228827663_Screenshot_2025-07-11_at_3.05.00_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752228827663_Screenshot_2025-07-11_at_3.05.00_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752228827663_Screenshot_2025-07-11_at_3.05.00_pm.png', 'Screenshot 2025-07-11 at 3.05.00 pm.png', NULL, NULL, 'images', 2, '2025-07-11 05:13:56', '2025-07-13 22:59:06'),
('19605b92-472e-45c7-8081-c08e991d0ba1', '0d601d35-1481-4db7-b2ae-6c0bed331526', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186247245_ChatGPT_Image_Jul_9_2025_01_08_37_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186247245_ChatGPT_Image_Jul_9_2025_01_08_37_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186247245_ChatGPT_Image_Jul_9_2025_01_08_37_AM.png', 'ChatGPT Image Jul 9, 2025, 01_08_37 AM.png', NULL, NULL, 'images', 2, '2025-07-10 17:24:15', '2025-07-15 22:20:57'),
('1ba226ad-84ad-4bca-b30f-f87d36fb947d', 'b49daf28-4d6a-40bc-9dfc-d8bc2ec23c24', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750890924_Screenshot_2025-07-17_at_4.10.09_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750890924_Screenshot_2025-07-17_at_4.10.09_PM.png', '1752750890924_Screenshot_2025-07-17_at_4.10.09_PM.png', '1752750890924_Screenshot_2025-07-17_at_4.10.09_PM.png', 992124, 'image/jpeg', 'images', 4, '2025-07-17 15:14:59', '2025-07-17 15:14:59'),
('1cbc2fb6-191b-4a24-9ee2-fbaa8979f46f', '20898683-a8c1-444a-964f-4115d4fd5f89', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187179629_ChatGPT_Image_Jul_11_2025_03_38_11_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187179629_ChatGPT_Image_Jul_11_2025_03_38_11_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187179629_ChatGPT_Image_Jul_11_2025_03_38_11_AM.png', 'ChatGPT Image Jul 11, 2025, 03_38_11 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:39:43', '2025-07-15 22:20:57'),
('1da03734-64f9-4cec-ac1d-64c58da48ddd', '224092db-f4d7-4376-abaa-afc25ea5bc4d', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186467916_ChatGPT_Image_Jul_11_2025_12_40_05_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186467916_ChatGPT_Image_Jul_11_2025_12_40_05_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186467916_ChatGPT_Image_Jul_11_2025_12_40_05_AM.png', 'ChatGPT Image Jul 11, 2025, 12_40_05 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:27:57', '2025-07-13 22:59:06'),
('1eb272b9-78db-4f8a-afdd-ce54a713c34a', 'b49daf28-4d6a-40bc-9dfc-d8bc2ec23c24', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750438635_Screenshot_2025-07-17_at_4.06.56_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750438635_Screenshot_2025-07-17_at_4.06.56_PM.png', '1752750438635_Screenshot_2025-07-17_at_4.06.56_PM.png', '1752750438635_Screenshot_2025-07-17_at_4.06.56_PM.png', 4835458, 'image/jpeg', 'images', 1, '2025-07-17 15:14:59', '2025-07-17 15:14:59'),
('208ced0a-ee89-4ec7-9a58-ebd6a942e01d', 'b9b5a957-c8b1-4a82-8ac3-d58ad67aed7d', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751922008488_Xchangeer-Home-07-08-2025_01_57_AM.png', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751922008488_Xchangeer-Home-07-08-2025_01_57_AM.png', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751922008488_Xchangeer-Home-07-08-2025_01_57_AM.png', 'Xchangeer-Home-07-08-2025_01_57_AM.png', 8667900, 'image/png', 'images', 1, '2025-07-07 16:00:29', '2025-07-15 22:20:57'),
('214448ee-f9c6-49ab-b49a-ffd0a30da518', '7b2d426c-3eeb-4093-9fd9-b5c0e61059d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://example.com/test-image-1.jpg', 'test-user/1234567890_test-image-1.jpg', 'test-image-1.jpg', 'test-image-1.jpg', 1024000, 'image/jpeg', 'images', 1, '2025-07-15 14:18:25', '2025-07-15 14:18:25'),
('240dd7a8-3b7f-4d5b-b536-513ae7354a76', 'd10ce4b6-0747-490f-845f-e9fb9883bee0', '1b437fd2-8576-44b0-b49e-741a0befe6a4', '/images/domains/web-development.jpeg', '/images/domains/web-development.jpeg', 'E-Commerce Platform-main', 'E-Commerce Platform Main Image', NULL, NULL, 'images', 1, '2025-07-06 15:50:34', '2025-07-15 22:20:57'),
('2463ca42-1d0f-4f92-8549-4b60f388b676', '224092db-f4d7-4376-abaa-afc25ea5bc4d', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186464813_ChatGPT_Image_Jul_11_2025_12_43_51_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186464813_ChatGPT_Image_Jul_11_2025_12_43_51_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186464813_ChatGPT_Image_Jul_11_2025_12_43_51_AM.png', 'ChatGPT Image Jul 11, 2025, 12_43_51 AM.png', NULL, NULL, 'images', 2, '2025-07-10 17:27:57', '2025-07-15 22:20:57'),
('24f2b358-98bf-43a9-a6e4-18bb0dcb4e05', '35810ea1-2239-45c0-8b9c-cdcdb9596f47', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'blob:http://localhost:3000/365adaf7-93de-4b51-b193-03e384f7c166', 'blob:http://localhost:3000/365adaf7-93de-4b51-b193-03e384f7c166', 'home_full_1752069131.jpg', 'home_full_1752069131.jpg', NULL, NULL, 'images', 2, '2025-07-15 18:18:10', '2025-07-15 18:18:10'),
('273c617a-e28d-4d54-a2f0-bedcbd4d3237', 'df885584-ef0a-46af-8de0-89aa1e5ab1e7', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920267061_cedar_full_1751742998.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920267061_cedar_full_1751742998.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920267061_cedar_full_1751742998.jpg', 'cedar_full_1751742998.jpg', 296462, 'image/jpeg', 'images', 2, '2025-07-07 15:31:08', '2025-07-15 22:20:57'),
('27428fd4-bdc4-4f2b-948d-62930a2639de', '4ad240d5-cd40-4705-9a5c-41ab4c3f4792', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752227283764_Screenshot_2025-07-11_at_2.45.23_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752227283764_Screenshot_2025-07-11_at_2.45.23_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752227283764_Screenshot_2025-07-11_at_2.45.23_pm.png', 'Screenshot 2025-07-11 at 2.45.23 pm.png', NULL, NULL, 'images', 1, '2025-07-11 04:48:07', '2025-07-15 22:20:57'),
('29ef6500-31bb-45ab-8882-1a5270179d00', '25c09180-9bfd-4b5b-8346-785caeafdcf6', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752626725529_home_full_1752069131.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752626725529_home_full_1752069131.jpg', '1752626725529_home_full_1752069131.jpg', '1752626725529_home_full_1752069131.jpg', 296239, 'image/jpeg', 'images', 2, '2025-07-15 19:47:35', '2025-07-15 19:47:35'),
('2dcfe48a-574b-4843-89d8-5c0edf67f2bf', 'df885584-ef0a-46af-8de0-89aa1e5ab1e7', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920272884_hawthorn_full_1751743032.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920272884_hawthorn_full_1751743032.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920272884_hawthorn_full_1751743032.jpg', 'hawthorn_full_1751743032.jpg', 357588, 'image/jpeg', 'images', 6, '2025-07-07 15:31:14', '2025-07-15 22:20:57'),
('3570e0ae-0542-4c8c-881c-e4a859b9cb38', 'df885584-ef0a-46af-8de0-89aa1e5ab1e7', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920262146_Screenshot%202025-06-12%20at%2001.40.06.png', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920262146_Screenshot 2025-06-12 at 01.40.06.png', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920262146_Screenshot 2025-06-12 at 01.40.06.png', 'Screenshot 2025-06-12 at 01.40.06.png', 4925589, 'image/png', 'images', 1, '2025-07-07 15:31:07', '2025-07-15 22:20:57'),
('38058505-edb7-4640-8eb2-e7e92ab7cc13', 'a1b2f3ef-9ccd-4d8c-8334-572cedb3f783', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187449301_ChatGPT_Image_Jul_11_2025_03_43_56_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187449301_ChatGPT_Image_Jul_11_2025_03_43_56_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187449301_ChatGPT_Image_Jul_11_2025_03_43_56_AM.png', 'ChatGPT Image Jul 11, 2025, 03_43_56 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:44:12', '2025-07-15 22:20:57'),
('3887f9ba-996e-40cb-b2a7-382619d97c05', '9f976ab3-fadb-4a1a-b001-3ef7484c5f48', '033f0150-6671-41e5-a968-ff40e9f07f26', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751135491868_homie-logo.jpeg', '033f0150-6671-41e5-a968-ff40e9f07f26/1751135491868_homie-logo.jpeg', '033f0150-6671-41e5-a968-ff40e9f07f26/1751135491868_homie-logo.jpeg', 'homie-logo.jpeg', 40054, 'image/jpeg', 'images', 1, '2025-06-28 13:31:33', '2025-07-15 22:20:57'),
('3a0644b5-e6ff-4f97-943a-3bc59914ccec', '8f9336b5-6c2d-49b6-a5e0-0ce750b7f18c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752139126552_WhatsApp%20Image%202025-07-10%20at%202.14.22%20PM%20(1).jpeg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752139126552_WhatsApp%20Image%202025-07-10%20at%202.14.22%20PM%20(1).jpeg', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752139126552_WhatsApp Image 2025-07-10 at 2.14.22 PM (1).jpeg', 'WhatsApp Image 2025-07-10 at 2.14.22 PM (1).jpeg', NULL, NULL, 'images', 1, '2025-07-11 05:24:40', '2025-07-15 22:20:57'),
('3a7fb754-8bf4-43ec-9bf0-bdba9da84ca4', '82f4e753-d0db-4621-8652-d03d1324566e', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752228833295_Screenshot_2025-07-11_at_3.05.47_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752228833295_Screenshot_2025-07-11_at_3.05.47_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752228833295_Screenshot_2025-07-11_at_3.05.47_pm.png', 'Screenshot 2025-07-11 at 3.05.47 pm.png', NULL, NULL, 'images', 3, '2025-07-11 05:13:56', '2025-07-15 22:20:57'),
('3b2ddf70-8051-48c7-a881-a47415e3a741', '2150459b-726f-4696-9eab-ec6744843a9f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229458845_Screenshot_2025-07-10_at_2.35.23_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229458845_Screenshot_2025-07-10_at_2.35.23_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229458845_Screenshot_2025-07-10_at_2.35.23_pm.png', 'Screenshot 2025-07-10 at 2.35.23 pm.png', NULL, NULL, 'images', 2, '2025-07-11 05:24:22', '2025-07-15 22:20:57'),
('3bc39610-2575-458e-8936-8e40d691a996', '2bb5bc4d-2641-4c14-8e04-2e369d33ac0e', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921175008_home_viewport_1751744654.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921175008_home_viewport_1751744654.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921175008_home_viewport_1751744654.jpg', 'home_viewport_1751744654.jpg', 109984, 'image/jpeg', 'images', 1, '2025-07-07 15:46:17', '2025-07-15 22:20:57'),
('3ceb3b57-1435-4fa9-aba0-b69845221e07', '2bb5bc4d-2641-4c14-8e04-2e369d33ac0e', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921180491_tech_we_support_1751232481.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921180491_tech_we_support_1751232481.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921180491_tech_we_support_1751232481.jpg', 'tech_we_support_1751232481.jpg', 455129, 'image/jpeg', 'images', 4, '2025-07-07 15:46:22', '2025-07-15 22:20:57'),
('3d9bc30c-85f7-4c15-a919-556e69c5b2b3', '0d601d35-1481-4db7-b2ae-6c0bed331526', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186110656_ChatGPT_Image_Jul_9_2025_01_08_45_AM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186110656_ChatGPT_Image_Jul_9_2025_01_08_45_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186110656_ChatGPT_Image_Jul_9_2025_01_08_45_AM.png', 'ChatGPT Image Jul 9, 2025, 01_08_45 AM.png', NULL, NULL, 'images', 3, '2025-07-10 17:24:15', '2025-07-15 22:20:57'),
('3e2f9dad-f092-4fc9-ba15-84da427577ec', '6099b945-0a80-4522-804f-25cec635ed11', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752140372421_WhatsApp%20Image%202025-07-10%20at%201.31.24%20PM%20(1).jpeg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752140372421_WhatsApp%20Image%202025-07-10%20at%201.31.24%20PM%20(1).jpeg', '1752140372421_WhatsApp Image 2025-07-10 at 1.31.24 PM (1).jpeg', '1752140372421_WhatsApp Image 2025-07-10 at 1.31.24 PM (1).jpeg', NULL, NULL, 'images', 3, '2025-07-15 16:40:08', '2025-07-15 22:20:57'),
('3f9f1fb7-78e6-4f4d-93a7-18220f7731da', '224092db-f4d7-4376-abaa-afc25ea5bc4d', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186474219_ChatGPT_Image_Jul_11_2025_03_27_30_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186474219_ChatGPT_Image_Jul_11_2025_03_27_30_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186474219_ChatGPT_Image_Jul_11_2025_03_27_30_AM.png', 'ChatGPT Image Jul 11, 2025, 03_27_30 AM.png', NULL, NULL, 'images', 3, '2025-07-10 17:27:57', '2025-07-15 22:20:57'),
('44a17282-cc36-49f7-831b-173134e75ff3', '07815290-0990-4e3a-acf3-6384d53dbdd0', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171818308_home_viewport_1752077339.jpg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171818308_home_viewport_1752077339.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171818308_home_viewport_1752077339.jpg', 'home_viewport_1752077339.jpg', NULL, NULL, 'images', 1, '2025-07-15 16:29:22', '2025-07-15 16:29:22'),
('46f0abe0-c0a1-4dd3-9eea-1ba243c8293f', '0d601d35-1481-4db7-b2ae-6c0bed331526', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186251897_ChatGPT_Image_Jul_9_2025_12_36_56_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186251897_ChatGPT_Image_Jul_9_2025_12_36_56_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186251897_ChatGPT_Image_Jul_9_2025_12_36_56_AM.png', 'ChatGPT Image Jul 9, 2025, 12_36_56 AM.png', NULL, NULL, 'images', 4, '2025-07-10 17:24:15', '2025-07-15 22:20:57'),
('47213f8b-1317-4d75-9016-230bb9da0113', 'b49daf28-4d6a-40bc-9dfc-d8bc2ec23c24', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750893905_Screenshot_2025-07-17_at_4.11.09_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750893905_Screenshot_2025-07-17_at_4.11.09_PM.png', '1752750893905_Screenshot_2025-07-17_at_4.11.09_PM.png', '1752750893905_Screenshot_2025-07-17_at_4.11.09_PM.png', 4949716, 'image/jpeg', 'images', 8, '2025-07-17 15:14:59', '2025-07-17 15:14:59'),
('47ba0eb6-32a5-459f-903e-5c593203db74', '82f4e753-d0db-4621-8652-d03d1324566e', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752228831387_Screenshot_2025-07-11_at_3.05.26_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752228831387_Screenshot_2025-07-11_at_3.05.26_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752228831387_Screenshot_2025-07-11_at_3.05.26_pm.png', 'Screenshot 2025-07-11 at 3.05.26 pm.png', NULL, NULL, 'images', 4, '2025-07-11 05:13:56', '2025-07-15 22:20:57'),
('47cd3a12-10bd-4ead-924a-d6fef5e53cd8', '2150459b-726f-4696-9eab-ec6744843a9f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229457868_Screenshot_2025-07-10_at_2.35.02_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229457868_Screenshot_2025-07-10_at_2.35.02_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229457868_Screenshot_2025-07-10_at_2.35.02_pm.png', 'Screenshot 2025-07-10 at 2.35.02 pm.png', NULL, NULL, 'images', 3, '2025-07-11 05:24:22', '2025-07-15 22:20:57'),
('4cd15fd9-c983-470f-bb1a-5a3542dfbd2f', '574669a3-9af2-4dfe-bbb3-9a7fa88995f8', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752185331599_miniature_construction_resized.jpg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752185331599_miniature_construction_resized.jpg', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752185331599_miniature_construction_resized.jpg', 'miniature_construction_resized.jpg', NULL, NULL, 'images', 1, '2025-07-10 17:13:55', '2025-07-15 22:20:57'),
('4e1771a1-72f3-4ede-b0b5-c34daf217fc7', '60a8311f-9cd5-4d75-87e8-8d6a5d5c62ae', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://example.com/test-image-1.jpg', 'test-user/1234567890_test-image-1.jpg', 'test-image-1.jpg', 'test-image-1.jpg', 1024000, 'image/jpeg', 'images', 1, '2025-07-15 14:13:38', '2025-07-15 14:13:38'),
('4e75d15c-922a-477b-a9be-4f464d9fce3c', '6099b945-0a80-4522-804f-25cec635ed11', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752140370989_WhatsApp%20Image%202025-07-10%20at%201.26.31%20PM%20(1).jpeg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752140370989_WhatsApp%20Image%202025-07-10%20at%201.26.31%20PM%20(1).jpeg', '1752140370989_WhatsApp Image 2025-07-10 at 1.26.31 PM (1).jpeg', '1752140370989_WhatsApp Image 2025-07-10 at 1.26.31 PM (1).jpeg', NULL, NULL, 'images', 4, '2025-07-15 16:40:08', '2025-07-15 22:20:57'),
('4f982947-9800-4ccb-b693-c5020190515b', 'e8100326-69ef-427a-98e7-652cae1dfaf1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921661716_home_viewport_1751742470.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921661716_home_viewport_1751742470.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921661716_home_viewport_1751742470.jpg', 'home_viewport_1751742470.jpg', 131341, 'image/jpeg', 'images', 1, '2025-07-07 15:54:23', '2025-07-15 22:20:57'),
('5164af9e-5d82-4f3c-aa2e-6224eab029eb', '32bc0a96-97d6-4cc0-a867-257922025305', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135017096_National-Bonsai-Registry-06-12-2025_01_44_AM%20(1).png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135017096_National-Bonsai-Registry-06-12-2025_01_44_AM%20(1).png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135017096_National-Bonsai-Registry-06-12-2025_01_44_AM (1).png', 'National-Bonsai-Registry-06-12-2025_01_44_AM (1).png', NULL, NULL, 'images', 3, '2025-07-15 17:33:02', '2025-07-15 17:33:02'),
('51a63447-0492-4063-a3d1-d11baedbcb46', '4722a2e0-3706-48b5-931d-5cb290a01e12', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168698404_Screenshot_2025-07-10_at_1.17.42_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168698404_Screenshot_2025-07-10_at_1.17.42_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168698404_Screenshot_2025-07-10_at_1.17.42_PM.png', 'Screenshot 2025-07-10 at 1.17.42 PM.png', NULL, NULL, 'images', 2, '2025-07-10 12:49:53', '2025-07-15 22:20:57'),
('5217c9e0-5bed-4f88-be58-cf62e3e9779f', '4758904e-4020-450c-a66a-819ad09627cc', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187319209_ChatGPT_Image_Jul_11_2025_03_41_32_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187319209_ChatGPT_Image_Jul_11_2025_03_41_32_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187319209_ChatGPT_Image_Jul_11_2025_03_41_32_AM.png', 'ChatGPT Image Jul 11, 2025, 03_41_32 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:42:02', '2025-07-15 22:20:57'),
('542f5474-516f-4e40-9f73-8a06afeb0116', '32bc0a96-97d6-4cc0-a867-257922025305', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135012993_compressed_National-Bonsai-Registry-06-12-2025_01_42_AM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135012993_compressed_National-Bonsai-Registry-06-12-2025_01_42_AM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135012993_compressed_National-Bonsai-Registry-06-12-2025_01_42_AM.png', 'compressed_National-Bonsai-Registry-06-12-2025_01_42_AM.png', NULL, NULL, 'images', 2, '2025-07-15 17:33:02', '2025-07-15 17:33:02'),
('5453e299-3372-4c4b-a09c-b447aa0abecc', '9b9a7724-9813-4066-9296-974bc4888ac7', '1b437fd2-8576-44b0-b49e-741a0befe6a4', '/images/domains/blockchain.jpeg', '/images/domains/blockchain.jpeg', 'Blockchain Supply Chain-main', 'Blockchain Supply Chain Main Image', NULL, NULL, 'images', 1, '2025-07-06 15:50:37', '2025-07-15 22:20:57'),
('5557d664-bfee-420b-8d5a-80f8efecfefa', '7fb327e0-c09a-44b7-882a-80a8faa7429e', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188044658_514517886_4173962042890964_4496679281253857877_n_1.jpg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188044658_514517886_4173962042890964_4496679281253857877_n_1.jpg', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188044658_514517886_4173962042890964_4496679281253857877_n_1.jpg', '514517886_4173962042890964_4496679281253857877_n (1).jpg', NULL, NULL, 'images', 2, '2025-07-10 17:54:24', '2025-07-15 22:20:57'),
('557c73da-7966-4d6a-887d-33faab8191ca', '2150459b-726f-4696-9eab-ec6744843a9f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229453050_Screenshot_2025-07-10_at_2.32.22_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229453050_Screenshot_2025-07-10_at_2.32.22_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229453050_Screenshot_2025-07-10_at_2.32.22_pm.png', 'Screenshot 2025-07-10 at 2.32.22 pm.png', NULL, NULL, 'images', 4, '2025-07-11 05:24:22', '2025-07-15 22:20:57'),
('56a5559d-d942-43fa-9d65-0e7aad5f91a4', 'df885584-ef0a-46af-8de0-89aa1e5ab1e7', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920268114_checkout_full_1751743137.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920268114_checkout_full_1751743137.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920268114_checkout_full_1751743137.jpg', 'checkout_full_1751743137.jpg', 366001, 'image/jpeg', 'images', 3, '2025-07-07 15:31:10', '2025-07-15 22:20:57'),
('57db60d5-9ba8-4337-b61c-6e26f5832422', '0de390e7-131a-4e3b-982f-1961d7cdf1c4', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752236439790_IMG-20250711-WA0003.jpg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752236439790_IMG-20250711-WA0003.jpg', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752236439790_IMG-20250711-WA0003.jpg', 'IMG-20250711-WA0003.jpg', NULL, NULL, 'images', 1, '2025-07-11 07:22:43', '2025-07-15 22:20:57'),
('584a069d-5aa0-469e-a7ec-96b17bc42dbb', 'a573e0b2-ab0c-4a2d-96a6-fe9f2813b0e8', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188316485_ChatGPT_Image_Jul_11_2025_03_58_19_AM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188316485_ChatGPT_Image_Jul_11_2025_03_58_19_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188316485_ChatGPT_Image_Jul_11_2025_03_58_19_AM.png', 'ChatGPT Image Jul 11, 2025, 03_58_19 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:58:51', '2025-07-15 22:20:57'),
('59140542-0fe7-4c87-93a5-3480964c118c', 'df885584-ef0a-46af-8de0-89aa1e5ab1e7', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920270167_cotoneaster_full_1751743051.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920270167_cotoneaster_full_1751743051.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920270167_cotoneaster_full_1751743051.jpg', 'cotoneaster_full_1751743051.jpg', 354012, 'image/jpeg', 'images', 4, '2025-07-07 15:31:12', '2025-07-15 22:20:57'),
('5e7ff97d-b698-4105-af99-eed261487422', '4722a2e0-3706-48b5-931d-5cb290a01e12', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168696420_Screenshot_2025-07-10_at_1.15.28_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168696420_Screenshot_2025-07-10_at_1.15.28_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168696420_Screenshot_2025-07-10_at_1.15.28_PM.png', 'Screenshot 2025-07-10 at 1.15.28 PM.png', NULL, NULL, 'images', 3, '2025-07-10 12:49:53', '2025-07-13 22:59:06'),
('62002099-baea-4245-91d2-bbcf60137c19', '8117d5e7-a1d2-402b-bceb-f4094950979a', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752169401877_Screenshot_2025-07-10_at_10.42.18_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752169401877_Screenshot_2025-07-10_at_10.42.18_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752169401877_Screenshot_2025-07-10_at_10.42.18_PM.png', 'Screenshot 2025-07-10 at 10.42.18 PM.png', NULL, NULL, 'images', 2, '2025-07-15 16:53:49', '2025-07-15 22:20:57'),
('628b2fe6-6e95-4146-89a1-74fef1454b2b', '388f0800-fb67-4f4f-8cc5-8afb23344c0c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229283600_Screenshot_2025-07-11_at_3.18.26_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229283600_Screenshot_2025-07-11_at_3.18.26_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229283600_Screenshot_2025-07-11_at_3.18.26_pm.png', 'Screenshot 2025-07-11 at 3.18.26 pm.png', NULL, NULL, 'images', 3, '2025-07-11 05:21:32', '2025-07-15 22:20:57'),
('64b76321-31b9-4a1b-9449-a245eaa75dcd', '4ad240d5-cd40-4705-9a5c-41ab4c3f4792', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752227285101_Screenshot_2025-07-11_at_2.45.43_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752227285101_Screenshot_2025-07-11_at_2.45.43_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752227285101_Screenshot_2025-07-11_at_2.45.43_pm.png', 'Screenshot 2025-07-11 at 2.45.43 pm.png', NULL, NULL, 'images', 2, '2025-07-11 04:48:07', '2025-07-15 22:20:57'),
('651b8b17-95d5-4e69-81de-73153b4cb547', '8117d5e7-a1d2-402b-bceb-f4094950979a', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752169406010_Screenshot_2025-07-10_at_10.42.32_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752169406010_Screenshot_2025-07-10_at_10.42.32_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752169406010_Screenshot_2025-07-10_at_10.42.32_PM.png', 'Screenshot 2025-07-10 at 10.42.32 PM.png', NULL, NULL, 'images', 3, '2025-07-15 16:53:49', '2025-07-15 22:20:57'),
('674be346-a8f0-4c16-9491-8e32d03dfccd', 'df885584-ef0a-46af-8de0-89aa1e5ab1e7', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920274639_login_viewport_1751742951.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920274639_login_viewport_1751742951.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920274639_login_viewport_1751742951.jpg', 'login_viewport_1751742951.jpg', 90607, 'image/jpeg', 'images', 7, '2025-07-07 15:31:15', '2025-07-15 22:20:57'),
('67bdcf22-a4ef-4a08-a047-8ef099c314a0', '4cfeff36-c8d7-4a67-9754-fec50a8fe069', '1b437fd2-8576-44b0-b49e-741a0befe6a4', '/images/domains/cloud-computing.jpeg', '/images/domains/cloud-computing.jpeg', 'Cloud Infrastructure Dashboard-main', 'Cloud Infrastructure Dashboard Main Image', NULL, NULL, 'images', 1, '2025-07-06 15:50:36', '2025-07-15 22:20:57'),
('698310b9-4f45-4c30-bc06-5f9f25a79460', '0d601d35-1481-4db7-b2ae-6c0bed331526', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186250479_ChatGPT_Image_Jul_9_2025_01_23_20_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186250479_ChatGPT_Image_Jul_9_2025_01_23_20_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186250479_ChatGPT_Image_Jul_9_2025_01_23_20_AM.png', 'ChatGPT Image Jul 9, 2025, 01_23_20 AM.png', NULL, NULL, 'images', 5, '2025-07-10 17:24:15', '2025-07-15 22:20:57'),
('6ba848fe-8fc0-4037-9a60-94eebfdeb209', '8f9336b5-6c2d-49b6-a5e0-0ce750b7f18c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752138381403_WhatsApp%20Image%202025-07-07%20at%201.37.36%20PM.jpeg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752138381403_WhatsApp%20Image%202025-07-07%20at%201.37.36%20PM.jpeg', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752138381403_WhatsApp Image 2025-07-07 at 1.37.36 PM.jpeg', 'WhatsApp Image 2025-07-07 at 1.37.36 PM.jpeg', NULL, NULL, 'images', 2, '2025-07-11 05:24:40', '2025-07-15 22:20:57'),
('77dcc505-f590-4fd3-bd6a-b969a78173f8', '32bc0a96-97d6-4cc0-a867-257922025305', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135014410_compressed_National-Bonsai-Registry-06-12-2025_01_43_AM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135014410_compressed_National-Bonsai-Registry-06-12-2025_01_43_AM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135014410_compressed_National-Bonsai-Registry-06-12-2025_01_43_AM.png', 'compressed_National-Bonsai-Registry-06-12-2025_01_43_AM.png', NULL, NULL, 'images', 6, '2025-07-15 17:33:02', '2025-07-15 17:33:02'),
('790e43f3-e494-47b0-9cfe-3f6f404d9f5b', '6099b945-0a80-4522-804f-25cec635ed11', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752144529148_Screenshot_2025-07-10_at_1.23.22_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752144529148_Screenshot_2025-07-10_at_1.23.22_PM.png', '1752144529148_Screenshot_2025-07-10_at_1.23.22_PM.png', '1752144529148_Screenshot_2025-07-10_at_1.23.22_PM.png', NULL, NULL, 'images', 5, '2025-07-15 16:40:08', '2025-07-15 22:20:57'),
('7a33a07d-9a27-4bb9-8aab-b13d1aa7bdc1', '11c485ee-bcaf-470f-b6c7-47dcca59ccce', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188466094_ChatGPT_Image_Jul_11_2025_03_59_13_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188466094_ChatGPT_Image_Jul_11_2025_03_59_13_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188466094_ChatGPT_Image_Jul_11_2025_03_59_13_AM.png', 'ChatGPT Image Jul 11, 2025, 03_59_13 AM.png', NULL, NULL, 'images', 2, '2025-07-10 18:01:09', '2025-07-15 22:20:57'),
('7c7bee03-a25a-42e6-95ef-c7383108f1cb', '25c09180-9bfd-4b5b-8346-785caeafdcf6', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752626728096_membership_full_1752069185.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752626728096_membership_full_1752069185.jpg', '1752626728096_membership_full_1752069185.jpg', '1752626728096_membership_full_1752069185.jpg', 303377, 'image/jpeg', 'images', 4, '2025-07-15 19:47:35', '2025-07-15 19:47:35'),
('7de49bb3-0cd8-43d4-8695-c70cce0f7772', '77b091d5-79ce-41bb-b57b-8959858a7061', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://example.com/test-image-2.jpg', 'test-user/1234567890_test-image-2.jpg', 'test-image-2.jpg', 'test-image-2.jpg', 2048000, 'image/jpeg', 'images', 1, '2025-07-15 14:14:23', '2025-07-15 22:20:57'),
('80b3f639-ae1e-4b8b-b64a-81271b67d7c7', 'c0a2d484-7e40-454b-97dc-6adce018ef08', '033f0150-6671-41e5-a968-ff40e9f07f26', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751135807580_entertainer-go.png', '033f0150-6671-41e5-a968-ff40e9f07f26/1751135807580_entertainer-go.png', '033f0150-6671-41e5-a968-ff40e9f07f26/1751135807580_entertainer-go.png', 'entertainer-go.png', 49579, 'image/png', 'images', 1, '2025-06-28 13:36:49', '2025-07-15 22:20:57'),
('81921164-9b87-4835-9e0e-66a56473d6cb', 'e8100326-69ef-427a-98e7-652cae1dfaf1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921668318_Screenshot%202025-06-27%20at%2003.20.02.png', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921668318_Screenshot 2025-06-27 at 03.20.02.png', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921668318_Screenshot 2025-06-27 at 03.20.02.png', 'Screenshot 2025-06-27 at 03.20.02.png', 645340, 'image/png', 'images', 4, '2025-07-07 15:54:30', '2025-07-15 22:20:57'),
('837e46ad-9160-4b29-bed4-835ed8819839', '0d601d35-1481-4db7-b2ae-6c0bed331526', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186241122_ChatGPT_Image_Jul_9_2025_01_08_15_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186241122_ChatGPT_Image_Jul_9_2025_01_08_15_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186241122_ChatGPT_Image_Jul_9_2025_01_08_15_AM.png', 'ChatGPT Image Jul 9, 2025, 01_08_15 AM.png', NULL, NULL, 'images', 6, '2025-07-10 17:24:15', '2025-07-15 22:20:57');
INSERT INTO `project_images` (`id`, `project_id`, `user_id`, `url`, `path`, `name`, `original_name`, `size`, `type`, `bucket`, `order_index`, `created_at`, `updated_at`) VALUES
('84c088ae-6485-4c75-9efc-2f32545233e7', '3b739e93-851c-449d-a19a-1769b1612840', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188558152_ChatGPT_Image_Jul_11_2025_04_02_16_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188558152_ChatGPT_Image_Jul_11_2025_04_02_16_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188558152_ChatGPT_Image_Jul_11_2025_04_02_16_AM.png', 'ChatGPT Image Jul 11, 2025, 04_02_16 AM.png', NULL, NULL, 'images', 1, '2025-07-10 18:02:40', '2025-07-13 22:59:06'),
('861bd7dd-8631-4a33-a2d5-1778bb2670cc', '388f0800-fb67-4f4f-8cc5-8afb23344c0c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229277154_Screenshot_2025-07-11_at_3.17.38_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229277154_Screenshot_2025-07-11_at_3.17.38_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229277154_Screenshot_2025-07-11_at_3.17.38_pm.png', 'Screenshot 2025-07-11 at 3.17.38 pm.png', NULL, NULL, 'images', 4, '2025-07-11 05:21:32', '2025-07-15 22:20:57'),
('8628de9e-3fae-4c4c-a773-f5126f49c5f4', '6099b945-0a80-4522-804f-25cec635ed11', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752140369135_WhatsApp%20Image%202025-07-10%20at%201.26.30%20PM%20(1).jpeg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752140369135_WhatsApp%20Image%202025-07-10%20at%201.26.30%20PM%20(1).jpeg', '1752140369135_WhatsApp Image 2025-07-10 at 1.26.30 PM (1).jpeg', '1752140369135_WhatsApp Image 2025-07-10 at 1.26.30 PM (1).jpeg', NULL, NULL, 'images', 6, '2025-07-15 16:40:08', '2025-07-15 22:20:57'),
('86868cab-e043-4d64-b5df-b7c0cac97551', 'b49daf28-4d6a-40bc-9dfc-d8bc2ec23c24', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750905048_Screenshot_2025-07-17_at_4.13.04_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750905048_Screenshot_2025-07-17_at_4.13.04_PM.png', '1752750905048_Screenshot_2025-07-17_at_4.13.04_PM.png', '1752750905048_Screenshot_2025-07-17_at_4.13.04_PM.png', 8171965, 'image/jpeg', 'images', 9, '2025-07-17 15:14:59', '2025-07-17 15:14:59'),
('87b4e3a9-04ec-4e3e-b168-f31065cd2c77', '2150459b-726f-4696-9eab-ec6744843a9f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229455659_Screenshot_2025-07-10_at_2.33.35_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229455659_Screenshot_2025-07-10_at_2.33.35_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229455659_Screenshot_2025-07-10_at_2.33.35_pm.png', 'Screenshot 2025-07-10 at 2.33.35 pm.png', NULL, NULL, 'images', 5, '2025-07-11 05:24:22', '2025-07-13 22:59:06'),
('884a676e-505b-4fd7-96eb-eb2c1ad7560c', '07815290-0990-4e3a-acf3-6384d53dbdd0', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171815272_home_full_1752077339.jpg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171815272_home_full_1752077339.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171815272_home_full_1752077339.jpg', 'home_full_1752077339.jpg', NULL, NULL, 'images', 2, '2025-07-15 16:29:22', '2025-07-15 22:20:57'),
('8a9980cd-055c-4efe-921f-b11766ddbe4d', 'a573e0b2-ab0c-4a2d-96a6-fe9f2813b0e8', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188320204_ChatGPT_Image_Jul_11_2025_03_58_23_AM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188320204_ChatGPT_Image_Jul_11_2025_03_58_23_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188320204_ChatGPT_Image_Jul_11_2025_03_58_23_AM.png', 'ChatGPT Image Jul 11, 2025, 03_58_23 AM.png', NULL, NULL, 'images', 2, '2025-07-10 17:58:51', '2025-07-15 22:20:57'),
('8b53d75a-bc85-410b-a6e9-27f9d1254c80', '35810ea1-2239-45c0-8b9c-cdcdb9596f47', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'blob:http://localhost:3000/bc727fe5-e0e2-46e8-bbd0-ee5fa618687c', 'blob:http://localhost:3000/bc727fe5-e0e2-46e8-bbd0-ee5fa618687c', 'home_viewport_1752069131.jpg', 'home_viewport_1752069131.jpg', NULL, NULL, 'images', 1, '2025-07-15 18:18:10', '2025-07-15 18:18:10'),
('8c215fbb-b0a7-4e25-b9dc-19540db43f0a', 'f6793385-24cb-4a26-b023-b5c3e9b59e26', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170294529_our_story_full_1752069470.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170294529_our_story_full_1752069470.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170294529_our_story_full_1752069470.jpg', 'our_story_full_1752069470.jpg', NULL, NULL, 'images', 5, '2025-07-10 12:58:18', '2025-07-13 22:59:06'),
('8de18e32-1c71-4514-a3fc-bf0a787c9972', '2bb5bc4d-2641-4c14-8e04-2e369d33ac0e', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921178775_spotfire_training_viewport_1751743286.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921178775_spotfire_training_viewport_1751743286.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921178775_spotfire_training_viewport_1751743286.jpg', 'spotfire_training_viewport_1751743286.jpg', 105194, 'image/jpeg', 'images', 3, '2025-07-07 15:46:20', '2025-07-15 22:20:57'),
('8e7c4c4b-c767-44f6-9c7a-800f1f51198f', '82f4e753-d0db-4621-8652-d03d1324566e', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752228823955_Screenshot_2025-07-11_at_3.04.23_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752228823955_Screenshot_2025-07-11_at_3.04.23_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752228823955_Screenshot_2025-07-11_at_3.04.23_pm.png', 'Screenshot 2025-07-11 at 3.04.23 pm.png', NULL, NULL, 'images', 5, '2025-07-11 05:13:56', '2025-07-15 22:20:57'),
('909b9d1e-af5e-4187-b22e-f28097ca9728', 'ae1c614c-4db5-45ef-9faa-f2432138b155', '033f0150-6671-41e5-a968-ff40e9f07f26', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/033f0150-6671-41e5-a968-ff40e9f07f26/1751135144178_the-entertainer.webp', '033f0150-6671-41e5-a968-ff40e9f07f26/1751135144178_the-entertainer.webp', '033f0150-6671-41e5-a968-ff40e9f07f26/1751135144178_the-entertainer.webp', 'the-entertainer.webp', 12106, 'image/webp', 'images', 1, '2025-06-28 13:25:45', '2025-07-15 22:20:57'),
('9447f858-9018-4d3a-9e68-e84cd1f00122', '8117d5e7-a1d2-402b-bceb-f4094950979a', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752169414547_Screenshot_2025-07-10_at_10.42.49_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752169414547_Screenshot_2025-07-10_at_10.42.49_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752169414547_Screenshot_2025-07-10_at_10.42.49_PM.png', 'Screenshot 2025-07-10 at 10.42.49 PM.png', NULL, NULL, 'images', 4, '2025-07-15 16:53:49', '2025-07-15 22:20:57'),
('9548dd9c-7839-4ce3-9fc0-83bb8cc35257', '7fb327e0-c09a-44b7-882a-80a8faa7429e', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188049263_ChatGPT_Image_Jul_11_2025_03_50_53_AM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188049263_ChatGPT_Image_Jul_11_2025_03_50_53_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188049263_ChatGPT_Image_Jul_11_2025_03_50_53_AM.png', 'ChatGPT Image Jul 11, 2025, 03_50_53 AM.png', NULL, NULL, 'images', 3, '2025-07-10 17:54:24', '2025-07-15 22:20:57'),
('a08027e5-4653-4340-be6b-a7f6a885070f', '8f9336b5-6c2d-49b6-a5e0-0ce750b7f18c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752139128083_WhatsApp%20Image%202025-07-10%20at%202.14.22%20PM.jpeg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752139128083_WhatsApp%20Image%202025-07-10%20at%202.14.22%20PM.jpeg', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752139128083_WhatsApp Image 2025-07-10 at 2.14.22 PM.jpeg', 'WhatsApp Image 2025-07-10 at 2.14.22 PM.jpeg', NULL, NULL, 'images', 3, '2025-07-11 05:24:40', '2025-07-13 22:59:06'),
('a3b45907-1dc0-4966-a781-485eb2f77f02', '8f9336b5-6c2d-49b6-a5e0-0ce750b7f18c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752139132070_WhatsApp%20Image%202025-07-10%20at%202.14.23%20PM.jpeg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752139132070_WhatsApp%20Image%202025-07-10%20at%202.14.23%20PM.jpeg', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752139132070_WhatsApp Image 2025-07-10 at 2.14.23 PM.jpeg', 'WhatsApp Image 2025-07-10 at 2.14.23 PM.jpeg', NULL, NULL, 'images', 4, '2025-07-11 05:24:40', '2025-07-15 22:20:57'),
('a587e2c8-74c9-43e7-ab23-c7d7d6059ca7', '6099b945-0a80-4522-804f-25cec635ed11', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752144522348_Screenshot_2025-07-10_at_1.22.49_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752144522348_Screenshot_2025-07-10_at_1.22.49_PM.png', '1752144522348_Screenshot_2025-07-10_at_1.22.49_PM.png', '1752144522348_Screenshot_2025-07-10_at_1.22.49_PM.png', NULL, NULL, 'images', 7, '2025-07-15 16:40:08', '2025-07-15 22:20:57'),
('a794a624-553d-4b42-89e8-d87a95ab211b', 'f6793385-24cb-4a26-b023-b5c3e9b59e26', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170292199_home_full_1752069261.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170292199_home_full_1752069261.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170292199_home_full_1752069261.jpg', 'home_full_1752069261.jpg', NULL, NULL, 'images', 6, '2025-07-10 12:58:18', '2025-07-15 22:20:57'),
('a8267718-8af4-4c59-88f3-c8578fd9850b', '0d601d35-1481-4db7-b2ae-6c0bed331526', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186244424_ChatGPT_Image_Jul_9_2025_01_08_23_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186244424_ChatGPT_Image_Jul_9_2025_01_08_23_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186244424_ChatGPT_Image_Jul_9_2025_01_08_23_AM.png', 'ChatGPT Image Jul 9, 2025, 01_08_23 AM.png', NULL, NULL, 'images', 7, '2025-07-10 17:24:15', '2025-07-15 22:20:57'),
('a8a8ef36-76f4-4778-a902-e99fc99a78d2', '60a8311f-9cd5-4d75-87e8-8d6a5d5c62ae', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://example.com/test-image-2.jpg', 'test-user/1234567890_test-image-2.jpg', 'test-image-2.jpg', 'test-image-2.jpg', 2048000, 'image/jpeg', 'images', 2, '2025-07-15 14:13:38', '2025-07-15 14:13:38'),
('ab67d4c1-4b2f-4186-9c95-a81cf91bbb52', '5bd5f9b0-222f-4d74-a90a-c8d1300d165f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752185580425_ChatGPT_Image_Jul_11_2025_03_11_59_AM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752185580425_ChatGPT_Image_Jul_11_2025_03_11_59_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752185580425_ChatGPT_Image_Jul_11_2025_03_11_59_AM.png', 'ChatGPT Image Jul 11, 2025, 03_11_59 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:13:41', '2025-07-15 22:20:57'),
('ad221cfa-c3f8-4957-b483-2935677c059c', '9bbdb0ae-f036-421c-8442-622655869a4f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186644394_ChatGPT_Image_Jul_11_2025_03_30_26_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186644394_ChatGPT_Image_Jul_11_2025_03_30_26_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186644394_ChatGPT_Image_Jul_11_2025_03_30_26_AM.png', 'ChatGPT Image Jul 11, 2025, 03_30_26 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:30:47', '2025-07-15 22:20:57'),
('b2218168-a655-4149-ad5a-89bf9d3599b4', '2bb5bc4d-2641-4c14-8e04-2e369d33ac0e', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921176926_spotfire_consulting_viewport_1751744753.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921176926_spotfire_consulting_viewport_1751744753.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921176926_spotfire_consulting_viewport_1751744753.jpg', 'spotfire_consulting_viewport_1751744753.jpg', 128405, 'image/jpeg', 'images', 2, '2025-07-07 15:46:19', '2025-07-15 22:20:57'),
('b29282d4-30ea-449e-b96a-3b26f8c05718', 'b49daf28-4d6a-40bc-9dfc-d8bc2ec23c24', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750910511_Screenshot_2025-07-17_at_4.14.07_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750910511_Screenshot_2025-07-17_at_4.14.07_PM.png', '1752750910511_Screenshot_2025-07-17_at_4.14.07_PM.png', '1752750910511_Screenshot_2025-07-17_at_4.14.07_PM.png', 890740, 'image/jpeg', 'images', 10, '2025-07-17 15:14:59', '2025-07-17 15:14:59'),
('b42c4d3a-1331-41fb-a426-d671ebcbd4cc', '902eb229-3192-441a-a785-e28289c778c6', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752626740238_home_viewport_1752072928.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752626740238_home_viewport_1752072928.jpg', '1752626740238_home_viewport_1752072928.jpg', '1752626740238_home_viewport_1752072928.jpg', 107449, 'image/jpeg', 'images', 1, '2025-07-15 19:45:59', '2025-07-15 19:45:59'),
('b465f91a-674d-458f-b884-7482728808cf', '2150459b-726f-4696-9eab-ec6744843a9f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229456618_Screenshot_2025-07-10_at_2.34.46_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229456618_Screenshot_2025-07-10_at_2.34.46_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229456618_Screenshot_2025-07-10_at_2.34.46_pm.png', 'Screenshot 2025-07-10 at 2.34.46 pm.png', NULL, NULL, 'images', 6, '2025-07-11 05:24:22', '2025-07-13 22:59:06'),
('b595a938-038b-4c46-8afa-cb9f47012927', '135c20aa-fc81-45ec-bec3-6a8bad63fd02', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186875037_ChatGPT_Image_Jul_7_2025_01_12_59_AM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186875037_ChatGPT_Image_Jul_7_2025_01_12_59_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186875037_ChatGPT_Image_Jul_7_2025_01_12_59_AM.png', 'ChatGPT Image Jul 7, 2025, 01_12_59 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:35:34', '2025-07-15 22:20:57'),
('b6d71861-9387-4aa6-bfee-602645e02723', '388f0800-fb67-4f4f-8cc5-8afb23344c0c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229288242_Screenshot_2025-07-11_at_3.19.57_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229288242_Screenshot_2025-07-11_at_3.19.57_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229288242_Screenshot_2025-07-11_at_3.19.57_pm.png', 'Screenshot 2025-07-11 at 3.19.57 pm.png', NULL, NULL, 'images', 5, '2025-07-11 05:21:32', '2025-07-15 22:20:57'),
('b73a4894-9541-4601-91c4-6cba06263e8a', 'e8100326-69ef-427a-98e7-652cae1dfaf1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921669857_Screenshot%202025-06-27%20at%2003.20.15.png', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921669857_Screenshot 2025-06-27 at 03.20.15.png', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751921669857_Screenshot 2025-06-27 at 03.20.15.png', 'Screenshot 2025-06-27 at 03.20.15.png', 706887, 'image/png', 'images', 5, '2025-07-07 15:54:32', '2025-07-15 22:20:57'),
('b7ab68db-c64d-4f6b-ba22-0318d97f910a', 'ad24430b-3fb4-407c-afe8-f8717249de13', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187794155_ChatGPT_Image_Jul_11_2025_03_49_00_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187794155_ChatGPT_Image_Jul_11_2025_03_49_00_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187794155_ChatGPT_Image_Jul_11_2025_03_49_00_AM.png', 'ChatGPT Image Jul 11, 2025, 03_49_00 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:49:57', '2025-07-15 22:20:57'),
('b9d54561-dabc-44d7-ad28-d5c63bd498ee', '388f0800-fb67-4f4f-8cc5-8afb23344c0c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229273809_Screenshot_2025-07-11_at_3.17.12_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229273809_Screenshot_2025-07-11_at_3.17.12_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229273809_Screenshot_2025-07-11_at_3.17.12_pm.png', 'Screenshot 2025-07-11 at 3.17.12 pm.png', NULL, NULL, 'images', 6, '2025-07-11 05:21:32', '2025-07-15 22:20:57'),
('bbf2c3c9-6bad-4234-81ba-629733d99280', '77b091d5-79ce-41bb-b57b-8959858a7061', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://example.com/test-image-1.jpg', 'test-user/1234567890_test-image-1.jpg', 'test-image-1.jpg', 'test-image-1.jpg', 1024000, 'image/jpeg', 'images', 2, '2025-07-15 14:14:23', '2025-07-15 22:20:57'),
('bc991ac0-bbec-477b-b115-0f8c350412d9', 'b49daf28-4d6a-40bc-9dfc-d8bc2ec23c24', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750952837_Screenshot_2025-07-17_at_4.15.19_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750952837_Screenshot_2025-07-17_at_4.15.19_PM.png', '1752750952837_Screenshot_2025-07-17_at_4.15.19_PM.png', '1752750952837_Screenshot_2025-07-17_at_4.15.19_PM.png', 966384, 'image/jpeg', 'images', 11, '2025-07-17 15:14:59', '2025-07-17 15:14:59'),
('bd79385f-f869-47db-b7fb-a9caaf98ef35', '2150459b-726f-4696-9eab-ec6744843a9f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229460372_Screenshot_2025-07-10_at_2.36.35_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229460372_Screenshot_2025-07-10_at_2.36.35_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229460372_Screenshot_2025-07-10_at_2.36.35_pm.png', 'Screenshot 2025-07-10 at 2.36.35 pm.png', NULL, NULL, 'images', 7, '2025-07-11 05:24:22', '2025-07-15 22:20:57'),
('c03a3ff2-e3ca-4e44-b1e9-79d84637ee7c', '32bc0a96-97d6-4cc0-a867-257922025305', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135015843_compressed_National-Bonsai-Registry-06-12-2025_01_51_AM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135015843_compressed_National-Bonsai-Registry-06-12-2025_01_51_AM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135015843_compressed_National-Bonsai-Registry-06-12-2025_01_51_AM.png', 'compressed_National-Bonsai-Registry-06-12-2025_01_51_AM.png', NULL, NULL, 'images', 4, '2025-07-15 17:33:02', '2025-07-15 17:33:02'),
('c1775186-a134-4f15-a02c-90732c1b6304', '388f0800-fb67-4f4f-8cc5-8afb23344c0c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229280456_Screenshot_2025-07-11_at_3.18.01_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229280456_Screenshot_2025-07-11_at_3.18.01_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229280456_Screenshot_2025-07-11_at_3.18.01_pm.png', 'Screenshot 2025-07-11 at 3.18.01 pm.png', NULL, NULL, 'images', 7, '2025-07-11 05:21:32', '2025-07-15 22:20:57'),
('c1ed06aa-7205-4326-b7d4-f4570d3ce022', '25c09180-9bfd-4b5b-8346-785caeafdcf6', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752626726832_home_viewport_1752069131.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752626726832_home_viewport_1752069131.jpg', '1752626726832_home_viewport_1752069131.jpg', '1752626726832_home_viewport_1752069131.jpg', 218932, 'image/jpeg', 'images', 1, '2025-07-15 19:47:35', '2025-07-15 19:47:35'),
('c3027fbc-f556-4cf2-a160-678ad4d4c303', '6099b945-0a80-4522-804f-25cec635ed11', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752144525155_Screenshot_2025-07-10_at_1.23.06_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752144525155_Screenshot_2025-07-10_at_1.23.06_PM.png', '1752144525155_Screenshot_2025-07-10_at_1.23.06_PM.png', '1752144525155_Screenshot_2025-07-10_at_1.23.06_PM.png', NULL, NULL, 'images', 8, '2025-07-15 16:40:08', '2025-07-15 22:20:57'),
('c389b10e-3f7f-4322-aa5d-fd5a63b8d32c', 'b49daf28-4d6a-40bc-9dfc-d8bc2ec23c24', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750897853_Screenshot_2025-07-17_at_4.11.26_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750897853_Screenshot_2025-07-17_at_4.11.26_PM.png', '1752750897853_Screenshot_2025-07-17_at_4.11.26_PM.png', '1752750897853_Screenshot_2025-07-17_at_4.11.26_PM.png', 2729792, 'image/jpeg', 'images', 7, '2025-07-17 15:14:59', '2025-07-17 15:14:59'),
('c4222548-3769-4b38-8c6d-09c2ffbdb09b', '01a004b3-9ed3-447e-b606-1ca9730ac3ad', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171190985_Screenshot_2025-07-10_at_11.06.44_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171190985_Screenshot_2025-07-10_at_11.06.44_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752171190985_Screenshot_2025-07-10_at_11.06.44_PM.png', 'Screenshot 2025-07-10 at 11.06.44 PM.png', NULL, NULL, 'images', 3, '2025-07-15 16:54:24', '2025-07-15 22:20:57'),
('c6596d35-a423-4213-9ca8-d2a4628f9c03', '4722a2e0-3706-48b5-931d-5cb290a01e12', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168694186_Screenshot_2025-07-10_at_1.15.12_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168694186_Screenshot_2025-07-10_at_1.15.12_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168694186_Screenshot_2025-07-10_at_1.15.12_PM.png', 'Screenshot 2025-07-10 at 1.15.12 PM.png', NULL, NULL, 'images', 4, '2025-07-10 12:49:53', '2025-07-15 22:20:57'),
('c89559ee-bb77-46a6-937b-7dc2b6ab4fc9', '0de390e7-131a-4e3b-982f-1961d7cdf1c4', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752236557880_Screenshot_20250711-172141_01.jpg', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752236557880_Screenshot_20250711-172141_01.jpg', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752236557880_Screenshot_20250711-172141_01.jpg', 'Screenshot_20250711-172141__01.jpg', NULL, NULL, 'images', 2, '2025-07-11 07:22:43', '2025-07-15 22:20:57'),
('c9425b2a-96cf-4f4b-a819-fa3f64c2b9a8', '2382f504-904c-4f57-b95f-f1a61be19ff8', '1b437fd2-8576-44b0-b49e-741a0befe6a4', '/images/domains/mobile-development.jpeg', '/images/domains/mobile-development.jpeg', 'Mobile Banking App-main', 'Mobile Banking App Main Image', NULL, NULL, 'images', 1, '2025-07-06 15:50:35', '2025-07-15 22:20:57'),
('c9c6d217-929e-4ec6-8e3e-173c103123f5', 'b49daf28-4d6a-40bc-9dfc-d8bc2ec23c24', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750887316_Screenshot_2025-07-17_at_4.08.39_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750887316_Screenshot_2025-07-17_at_4.08.39_PM.png', '1752750887316_Screenshot_2025-07-17_at_4.08.39_PM.png', '1752750887316_Screenshot_2025-07-17_at_4.08.39_PM.png', 2907507, 'image/jpeg', 'images', 3, '2025-07-17 15:14:59', '2025-07-17 15:14:59'),
('c9d4b880-9a34-48aa-980b-84b0de561ccc', '2150459b-726f-4696-9eab-ec6744843a9f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229454447_Screenshot_2025-07-10_at_2.32.49_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229454447_Screenshot_2025-07-10_at_2.32.49_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229454447_Screenshot_2025-07-10_at_2.32.49_pm.png', 'Screenshot 2025-07-10 at 2.32.49 pm.png', NULL, NULL, 'images', 8, '2025-07-11 05:24:22', '2025-07-15 22:20:57'),
('cac85469-e55a-40cf-9e1d-bcd1d0e9876d', '7b2d426c-3eeb-4093-9fd9-b5c0e61059d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://example.com/test-image-2.jpg', 'test-user/1234567890_test-image-2.jpg', 'test-image-2.jpg', 'test-image-2.jpg', 2048000, 'image/jpeg', 'images', 2, '2025-07-15 14:18:25', '2025-07-15 14:18:25'),
('cb7d774b-9cfd-4810-88b7-16c912667d8f', 'b49daf28-4d6a-40bc-9dfc-d8bc2ec23c24', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750900869_Screenshot_2025-07-17_at_4.12.36_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750900869_Screenshot_2025-07-17_at_4.12.36_PM.png', '1752750900869_Screenshot_2025-07-17_at_4.12.36_PM.png', '1752750900869_Screenshot_2025-07-17_at_4.12.36_PM.png', 4683939, 'image/jpeg', 'images', 6, '2025-07-17 15:14:59', '2025-07-17 15:14:59'),
('cbaefbc1-19c7-4611-80da-72cf4f9e8b64', '388f0800-fb67-4f4f-8cc5-8afb23344c0c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229290600_Screenshot_2025-07-11_at_3.20.34_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229290600_Screenshot_2025-07-11_at_3.20.34_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229290600_Screenshot_2025-07-11_at_3.20.34_pm.png', 'Screenshot 2025-07-11 at 3.20.34 pm.png', NULL, NULL, 'images', 8, '2025-07-11 05:21:32', '2025-07-13 22:59:06'),
('cbf9abfa-4325-4ad3-b5ac-f09f25695e88', '0d601d35-1481-4db7-b2ae-6c0bed331526', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186239924_ChatGPT_Image_Jul_9_2025_01_08_04_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186239924_ChatGPT_Image_Jul_9_2025_01_08_04_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186239924_ChatGPT_Image_Jul_9_2025_01_08_04_AM.png', 'ChatGPT Image Jul 9, 2025, 01_08_04 AM.png', NULL, NULL, 'images', 8, '2025-07-10 17:24:15', '2025-07-15 22:20:57'),
('ccb91fd3-ae16-4374-b424-0bc5fe52276e', '32bc0a96-97d6-4cc0-a867-257922025305', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135019510_National-Bonsai-Registry-06-12-2025_01_49_AM%20(1).png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135019510_National-Bonsai-Registry-06-12-2025_01_49_AM%20(1).png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135019510_National-Bonsai-Registry-06-12-2025_01_49_AM (1).png', 'National-Bonsai-Registry-06-12-2025_01_49_AM (1).png', NULL, NULL, 'images', 7, '2025-07-15 17:33:02', '2025-07-15 17:33:02'),
('cd5c9324-fff3-46bb-af87-8ec5f618c5ef', '3b739e93-851c-449d-a19a-1769b1612840', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188555451_ChatGPT_Image_Jul_11_2025_04_02_10_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188555451_ChatGPT_Image_Jul_11_2025_04_02_10_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188555451_ChatGPT_Image_Jul_11_2025_04_02_10_AM.png', 'ChatGPT Image Jul 11, 2025, 04_02_10 AM.png', NULL, NULL, 'images', 2, '2025-07-10 18:02:40', '2025-07-15 22:20:57'),
('d283ba09-648b-48b5-b178-2168039d4f58', '0de390e7-131a-4e3b-982f-1961d7cdf1c4', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752236559517_Screenshot_20250711-172130_01.jpg', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752236559517_Screenshot_20250711-172130_01.jpg', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752236559517_Screenshot_20250711-172130_01.jpg', 'Screenshot_20250711-172130__01.jpg', NULL, NULL, 'images', 3, '2025-07-11 07:22:43', '2025-07-15 22:20:57'),
('d29345db-a1d8-46c5-b702-5bce83a18a67', '388f0800-fb67-4f4f-8cc5-8afb23344c0c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229284745_Screenshot_2025-07-11_at_3.19.31_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229284745_Screenshot_2025-07-11_at_3.19.31_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229284745_Screenshot_2025-07-11_at_3.19.31_pm.png', 'Screenshot 2025-07-11 at 3.19.31 pm.png', NULL, NULL, 'images', 9, '2025-07-11 05:21:32', '2025-07-15 22:20:57'),
('d2b73e52-b9fe-4669-8173-2334f36a118a', '902eb229-3192-441a-a785-e28289c778c6', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752626738922_home_full_1752072928.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752626738922_home_full_1752072928.jpg', '1752626738922_home_full_1752072928.jpg', '1752626738922_home_full_1752072928.jpg', 603645, 'image/jpeg', 'images', 2, '2025-07-15 19:45:59', '2025-07-15 19:45:59'),
('d39bf1c7-6eeb-4480-9857-922e633ec5f3', '35810ea1-2239-45c0-8b9c-cdcdb9596f47', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'blob:http://localhost:3000/95059fe8-57dd-4ef3-a99e-36009f9fb3a5', 'blob:http://localhost:3000/95059fe8-57dd-4ef3-a99e-36009f9fb3a5', 'membership_full_1752069185.jpg', 'membership_full_1752069185.jpg', NULL, NULL, 'images', 3, '2025-07-15 18:18:10', '2025-07-15 18:18:10'),
('d54de499-5447-40a6-80d8-e64b3a14a109', '8729ba2c-7f44-4149-8d8d-b608a1331d11', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752185215555_ChatGPT_Image_Jul_11_2025_02_53_15_AM_1.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752185215555_ChatGPT_Image_Jul_11_2025_02_53_15_AM_1.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752185215555_ChatGPT_Image_Jul_11_2025_02_53_15_AM_1.png', 'ChatGPT Image Jul 11, 2025, 02_53_15 AM (1).png', NULL, NULL, 'images', 1, '2025-07-10 17:14:06', '2025-07-15 22:20:57'),
('da081f2f-3864-4805-ac30-c90bc3d343d1', '3a85b521-37cf-44d3-ac2f-5c992b9f2152', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187392949_ChatGPT_Image_Jul_11_2025_03_43_02_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187392949_ChatGPT_Image_Jul_11_2025_03_43_02_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752187392949_ChatGPT_Image_Jul_11_2025_03_43_02_AM.png', 'ChatGPT Image Jul 11, 2025, 03_43_02 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:43:16', '2025-07-15 22:20:57'),
('da1b368d-d25e-4c5b-8760-d08b64effa32', '2150459b-726f-4696-9eab-ec6744843a9f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229452002_Screenshot_2025-07-10_at_2.32.02_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229452002_Screenshot_2025-07-10_at_2.32.02_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229452002_Screenshot_2025-07-10_at_2.32.02_pm.png', 'Screenshot 2025-07-10 at 2.32.02 pm.png', NULL, NULL, 'images', 9, '2025-07-11 05:24:22', '2025-07-15 22:20:57'),
('dce4bfb9-d084-4b5e-8f06-c2d2de8feb92', 'c9a4f921-1723-4f02-9396-c31c61a19ea9', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188241097_ChatGPT_Image_Jul_11_2025_03_55_22_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188241097_ChatGPT_Image_Jul_11_2025_03_55_22_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752188241097_ChatGPT_Image_Jul_11_2025_03_55_22_AM.png', 'ChatGPT Image Jul 11, 2025, 03_55_22 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:57:24', '2025-07-15 22:20:57'),
('ddcd532f-cc8e-45db-8524-a83334540cc7', '2150459b-726f-4696-9eab-ec6744843a9f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752229449109_Screenshot_2025-07-10_at_2.36.08_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229449109_Screenshot_2025-07-10_at_2.36.08_pm.png', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752229449109_Screenshot_2025-07-10_at_2.36.08_pm.png', 'Screenshot 2025-07-10 at 2.36.08 pm.png', NULL, NULL, 'images', 10, '2025-07-11 05:24:22', '2025-07-15 22:20:57'),
('e1b592d3-bdd1-44b5-88e0-5bc002885315', '8f9336b5-6c2d-49b6-a5e0-0ce750b7f18c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752138703330_WhatsApp%20Image%202025-07-10%20at%202.09.20%20PM.jpeg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752138703330_WhatsApp%20Image%202025-07-10%20at%202.09.20%20PM.jpeg', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752138703330_WhatsApp Image 2025-07-10 at 2.09.20 PM.jpeg', 'WhatsApp Image 2025-07-10 at 2.09.20 PM.jpeg', NULL, NULL, 'images', 5, '2025-07-11 05:24:40', '2025-07-15 22:20:57'),
('e287c665-e46e-4a7e-b591-cfaf0e319aa1', '4722a2e0-3706-48b5-931d-5cb290a01e12', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168691933_Screenshot_2025-07-10_at_1.15.00_PM.png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168691933_Screenshot_2025-07-10_at_1.15.00_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752168691933_Screenshot_2025-07-10_at_1.15.00_PM.png', 'Screenshot 2025-07-10 at 1.15.00 PM.png', NULL, NULL, 'images', 5, '2025-07-10 12:49:53', '2025-07-15 22:20:57'),
('e434d7c8-90dc-49dd-8f4d-b963a43da2cb', '56f9f987-82f6-490c-b56d-067f58c630f0', '1b437fd2-8576-44b0-b49e-741a0befe6a4', '/images/domains/ai-ml.jpeg', '/images/domains/ai-ml.jpeg', 'AI-Powered Chatbot-main', 'AI-Powered Chatbot Main Image', NULL, NULL, 'images', 1, '2025-07-06 15:50:35', '2025-07-15 22:20:57'),
('eb0198ff-6299-426c-83d1-ec66435a717b', 'b49daf28-4d6a-40bc-9dfc-d8bc2ec23c24', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750882403_Screenshot_2025-07-17_at_4.07.49_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750882403_Screenshot_2025-07-17_at_4.07.49_PM.png', '1752750882403_Screenshot_2025-07-17_at_4.07.49_PM.png', '1752750882403_Screenshot_2025-07-17_at_4.07.49_PM.png', 1954961, 'image/jpeg', 'images', 2, '2025-07-17 15:14:59', '2025-07-17 15:14:59'),
('ebed8663-0d7a-42c8-8c0a-d7705e2e38c3', '32bc0a96-97d6-4cc0-a867-257922025305', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135010699_nationallbonsaitree%20(1).png', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135010699_nationallbonsaitree%20(1).png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752135010699_nationallbonsaitree (1).png', 'nationallbonsaitree (1).png', NULL, NULL, 'images', 1, '2025-07-15 17:33:02', '2025-07-15 17:33:02'),
('f10c771e-2c97-4d28-80a0-45c1b6caeb50', '0d601d35-1481-4db7-b2ae-6c0bed331526', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186248943_ChatGPT_Image_Jul_9_2025_01_08_49_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186248943_ChatGPT_Image_Jul_9_2025_01_08_49_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186248943_ChatGPT_Image_Jul_9_2025_01_08_49_AM.png', 'ChatGPT Image Jul 9, 2025, 01_08_49 AM.png', NULL, NULL, 'images', 9, '2025-07-10 17:24:15', '2025-07-15 22:20:57'),
('f23f78ed-b3b9-4a3b-ac34-d4acf89a3d2b', '8f9336b5-6c2d-49b6-a5e0-0ce750b7f18c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752139130595_WhatsApp%20Image%202025-07-10%20at%202.14.23%20PM%20(2).jpeg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752139130595_WhatsApp%20Image%202025-07-10%20at%202.14.23%20PM%20(2).jpeg', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752139130595_WhatsApp Image 2025-07-10 at 2.14.23 PM (2).jpeg', 'WhatsApp Image 2025-07-10 at 2.14.23 PM (2).jpeg', NULL, NULL, 'images', 6, '2025-07-11 05:24:40', '2025-07-15 22:20:57'),
('f3283507-1c2b-42ef-b049-9ef79edb29ba', '8f9336b5-6c2d-49b6-a5e0-0ce750b7f18c', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752139129249_WhatsApp%20Image%202025-07-10%20at%202.14.23%20PM%20(1).jpeg', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/94b101ed-9705-4a18-b25b-ef7376ad0550/1752139129249_WhatsApp%20Image%202025-07-10%20at%202.14.23%20PM%20(1).jpeg', '94b101ed-9705-4a18-b25b-ef7376ad0550/1752139129249_WhatsApp Image 2025-07-10 at 2.14.23 PM (1).jpeg', 'WhatsApp Image 2025-07-10 at 2.14.23 PM (1).jpeg', NULL, NULL, 'images', 7, '2025-07-11 05:24:40', '2025-07-15 22:20:57'),
('f44a0cff-1099-48ea-8878-aa112215ea75', 'df885584-ef0a-46af-8de0-89aa1e5ab1e7', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920271975_faq_full_1751743124.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920271975_faq_full_1751743124.jpg', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76/1751920271975_faq_full_1751743124.jpg', 'faq_full_1751743124.jpg', 127308, 'image/jpeg', 'images', 5, '2025-07-07 15:31:13', '2025-07-15 22:20:57'),
('f97f3e00-8da0-4128-91fa-8ff00e887839', 'f6793385-24cb-4a26-b023-b5c3e9b59e26', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170286609_10k_challenge_viewport_1752069519.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170286609_10k_challenge_viewport_1752069519.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752170286609_10k_challenge_viewport_1752069519.jpg', '10k_challenge_viewport_1752069519.jpg', NULL, NULL, 'images', 7, '2025-07-10 12:58:18', '2025-07-15 22:20:57'),
('fade004d-be0a-42e2-b4d3-709cb283361e', '25c09180-9bfd-4b5b-8346-785caeafdcf6', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752626729297_resources_full_1752069152.jpg', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752626729297_resources_full_1752069152.jpg', '1752626729297_resources_full_1752069152.jpg', '1752626729297_resources_full_1752069152.jpg', 310763, 'image/jpeg', 'images', 3, '2025-07-15 19:47:35', '2025-07-15 19:47:35'),
('fbbcecb2-5a31-45aa-9bb5-59c440c238f3', '15f819c7-7bdb-483c-a16d-c4cf31c3f3fd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186558174_ChatGPT_Image_Jul_11_2025_03_28_34_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186558174_ChatGPT_Image_Jul_11_2025_03_28_34_AM.png', '2f660a9a-3538-4384-970c-53b4bd37d4a8/1752186558174_ChatGPT_Image_Jul_11_2025_03_28_34_AM.png', 'ChatGPT Image Jul 11, 2025, 03_28_34 AM.png', NULL, NULL, 'images', 1, '2025-07-10 17:29:21', '2025-07-15 22:20:57'),
('ff512118-8703-43d8-ab84-2499668c211c', 'b49daf28-4d6a-40bc-9dfc-d8bc2ec23c24', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750892509_Screenshot_2025-07-17_at_4.10.22_PM.png', 'e2e23b4c-2468-43b9-b12d-9bf73065d063/1752750892509_Screenshot_2025-07-17_at_4.10.22_PM.png', '1752750892509_Screenshot_2025-07-17_at_4.10.22_PM.png', '1752750892509_Screenshot_2025-07-17_at_4.10.22_PM.png', 803094, 'image/jpeg', 'images', 5, '2025-07-17 15:14:59', '2025-07-17 15:14:59');

-- --------------------------------------------------------

--
-- Table structure for table `recent_automatic_activity`
--

CREATE TABLE `recent_automatic_activity` (
  `id` varchar(36) NOT NULL,
  `update_id` varchar(36) DEFAULT NULL,
  `version` varchar(50) NOT NULL,
  `update_title` varchar(255) NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `activity` varchar(255) NOT NULL,
  `success` tinyint(1) DEFAULT '0',
  `execution_time_ms` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `supports_automatic` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `recent_automatic_activity`
--

INSERT INTO `recent_automatic_activity` (`id`, `update_id`, `version`, `update_title`, `client_id`, `domain`, `activity`, `success`, `execution_time_ms`, `timestamp`, `supports_automatic`) VALUES
('00b58b0c-3e03-4da2-aeb3-8f2ee6171624', '9ab13a66-0075-4e77-9e7b-32dd44a1e36c', '4', 'for muneeb', 'auto_1751813352540_nukebl21bus', 'muneeb.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-10 16:01:24', NULL),
('02de2cf7-2843-47fd-8e62-a7e18cfda57a', '81ac56f6-b6a1-426b-ba22-dcd66cbff14c', '1.7.0', 'update', 'auto_1751874503706_2qvq30j9l6r', 'khurram.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-07 02:50:10', NULL),
('0fa26ac8-0527-4219-a116-8cbb602c2b9f', '724db729-5c86-492f-85e0-be579cd70659', '3', 'for muneeb only', 'auto_1751813352540_nukebl21bus', 'muneeb.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-10 15:23:13', NULL),
('1681ff9f-6189-49ac-9222-6067fa751cb7', '81ac56f6-b6a1-426b-ba22-dcd66cbff14c', '1.7.0', 'update', 'auto_1751874503706_2qvq30j9l6r', 'khurram.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-07 02:50:11', NULL),
('184f735a-6264-4880-8ea8-1347ccdf0ae9', '23d845d0-ac0a-4ab3-9aa8-d1f50d6cedb0', '1.1.0', 'bugs fixes', 'auto_1751829068425_kgt0e5qbcfp', 'noman.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 14:11:31', NULL),
('19dca75a-7f8d-4117-a3b6-c5225a4e4d6f', '663aa550-3a2f-48da-8485-ab371ddc479f', '3.0.0', 'User replaced', 'auto_1751817961426_jfv9rsntdca', 'noman.theexpertways.com', 'auto_update_completed', 1, NULL, '2025-07-06 11:19:42', NULL),
('201bdf15-5e7a-4dca-b3c9-b86607e4cdfe', '07e384a3-841f-461d-a219-9dfa68721c22', '5', 'fix', 'auto_1752182429306_gnc1daovozr', 'muneeb.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-10 16:26:57', NULL),
('20c07379-3ffb-40ff-9ad1-12268543aeea', '7174f1b8-48de-47f3-a5db-3491851adadd', '1.3.0', 'user changed', 'auto_1751828999718_44acofhm47l', 'muneeb.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 14:20:52', NULL),
('251a14e1-3858-4c1e-b1b0-c87c8d5bd7ec', '1eb978c6-849f-44b3-99da-dd3aed062960', '2.0.0', 'fixes', 'auto_1751815096324_89d4444w3ho', 'noman.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 10:22:25', NULL),
('2554449c-252d-41d0-977e-021fd5b7646c', 'c4f467d8-d42c-46b0-9f00-e0ea73e9002b', '1.6.0', 'Khumi user updated', 'auto_1751836485568_nkkuafftpv', 'khurram.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 16:29:10', NULL),
('26b1709f-c697-4041-af4f-f48591c6c648', '81ac56f6-b6a1-426b-ba22-dcd66cbff14c', '1.7.0', 'update', 'auto_1751874503706_2qvq30j9l6r', 'khurram.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-07 02:50:00', NULL),
('2b09b517-c7d5-4a90-89b5-05260f61fa9c', 'e6a2ed1f-1df6-4517-8dca-e1c2f4bd5651', '1.2.0', 'user changed to munneeb', 'auto_1751828999718_44acofhm47l', 'muneeb.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-06 14:20:02', NULL),
('2f43592b-b30b-4d4d-b3fe-34e5e0113f8d', '1eb978c6-849f-44b3-99da-dd3aed062960', '2.0.0', 'fixes', 'auto_1751813468005_x0eejqv5sr', 'noman.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-06 09:51:21', NULL),
('3a2ee273-44ea-42be-8f57-569c8fff2f83', '724db729-5c86-492f-85e0-be579cd70659', '3', 'for muneeb only', 'auto_1751813352540_nukebl21bus', 'muneeb.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-10 15:25:15', NULL),
('40075b67-0427-4d91-9455-628b4118defd', '81ac56f6-b6a1-426b-ba22-dcd66cbff14c', '1.7.0', 'update', 'auto_1751874503706_2qvq30j9l6r', 'khurram.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-07 02:49:58', NULL),
('4d1489fc-45d3-45f9-b403-50e4df145a7f', 'db3a93d3-75d9-4d7c-a742-5cf9903ac57a', '2.0.0', 'Theme update', 'auto_1751817961426_jfv9rsntdca', 'noman.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 11:09:20', NULL),
('4ebbcaad-d1bf-487b-870a-726a58f7b522', 'db3a93d3-75d9-4d7c-a742-5cf9903ac57a', '2.0.0', 'Theme update', 'auto_1751816583501_o65twb0v8wq', 'noman.theexpertways.com', 'auto_update_completed', 1, NULL, '2025-07-06 10:44:06', NULL),
('5390d1fa-aed2-4ef2-aab1-f26683145296', '724db729-5c86-492f-85e0-be579cd70659', '3', 'for muneeb only', 'auto_1751813352540_nukebl21bus', 'muneeb.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-10 15:05:22', NULL),
('5766e531-99fc-4f2b-8955-43c590e8b434', '7174f1b8-48de-47f3-a5db-3491851adadd', '1.3.0', 'user changed', 'auto_1751828999718_44acofhm47l', 'muneeb.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-06 14:22:53', NULL),
('5932e8c0-fdf9-4bd1-80d8-fb26e47c0f87', '5bac55a9-3755-4b57-95aa-06114a30634f', '3', 'for ahsan', 'auto_1751877801302_lx0rpzq2htk', 'ahsan.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-10 15:39:51', NULL),
('5a189120-df52-4639-b861-c7f8a16eaa5e', 'db3a93d3-75d9-4d7c-a742-5cf9903ac57a', '2.0.0', 'Theme update', 'auto_1751816583501_o65twb0v8wq', 'noman.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 10:43:20', NULL),
('5eea0bd0-436b-4f3c-a43a-bb17aa290445', '9ab13a66-0075-4e77-9e7b-32dd44a1e36c', '4', 'for muneeb', 'auto_1751813352540_nukebl21bus', 'muneeb.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-10 15:59:22', NULL),
('66ae9d77-1748-4aba-b725-ac2923305c08', 'db3a93d3-75d9-4d7c-a742-5cf9903ac57a', '2.0.0', 'Theme update', 'auto_1751817961426_jfv9rsntdca', 'noman.theexpertways.com', 'auto_update_completed', 1, NULL, '2025-07-06 11:10:47', NULL),
('690ad610-2a50-411b-8200-b99d4d7b0840', '1eb978c6-849f-44b3-99da-dd3aed062960', '2.0.0', 'fixes', 'auto_1751813468005_x0eejqv5sr', 'noman.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 09:53:28', NULL),
('6a79eded-b80d-4089-8951-dfae79603fe3', 'b2408977-da28-4a5f-8788-90a3ea82d669', '1.4.0', 'Theme updated for expertways', 'auto_1751831823758_fzzj573rw66', 'theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 15:04:12', NULL),
('6f09ae8a-79ec-45ee-9940-2fdb154fd482', 'd13e425a-4f47-4930-991d-66879779781a', '3.0.0', 'fixes', 'auto_1751831432826_a99caqhr4ct', 'noman.theexpertways.com', 'auto_update_completed', 1, NULL, '2025-07-06 14:53:39', NULL),
('6f4de1a8-b3c1-4395-834a-9ca6a58fd10e', 'b2408977-da28-4a5f-8788-90a3ea82d669', '1.4.0', 'Theme updated for expertways', 'auto_1751831823758_fzzj573rw66', 'theexpertways.com', 'auto_update_completed', 1, NULL, '2025-07-06 15:06:05', NULL),
('6f53e7db-87bf-4e2a-b1ed-67828c30e6ac', 'c4f467d8-d42c-46b0-9f00-e0ea73e9002b', '1.6.0', 'Khumi user updated', 'auto_1751836485568_nkkuafftpv', 'khurram.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-06 16:31:12', NULL),
('794a354f-51a8-483d-af3c-243e5751216a', 'd13e425a-4f47-4930-991d-66879779781a', '3.0.0', 'fixes', 'auto_1751831432826_a99caqhr4ct', 'noman.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 14:51:59', NULL),
('89357ae8-e6e4-4d70-b5ff-d6261ee81f07', '26897fe2-b2b0-4887-93a0-b61a6ae11836', '1.5.0', 'fixes', 'auto_1751831823758_fzzj573rw66', 'theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 15:37:52', NULL),
('89914fd1-4310-4dcd-b00e-a9b9613638d0', '663aa550-3a2f-48da-8485-ab371ddc479f', '3.0.0', 'User replaced', 'auto_1751817961426_jfv9rsntdca', 'noman.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 11:18:40', NULL),
('8f107ee7-7b7c-4bcc-be5f-d420954d1c3f', 'e6a2ed1f-1df6-4517-8dca-e1c2f4bd5651', '1.2.0', 'user changed to munneeb', 'auto_1751828999718_44acofhm47l', 'muneeb.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 14:18:00', NULL),
('9768662e-5115-49d3-9d87-6952241df194', '4733fbb1-906d-4777-a31d-75fc689426d9', '2.0.1', 'User channged', 'auto_1751817961426_jfv9rsntdca', 'noman.theexpertways.com', 'auto_update_completed', 1, NULL, '2025-07-06 11:16:32', NULL),
('aa243cad-aafc-432b-8fa9-3d425fdd570e', '1eb978c6-849f-44b3-99da-dd3aed062960', '2.0.0', 'fixes', 'auto_1751813468005_x0eejqv5sr', 'noman.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 09:51:21', NULL),
('aaaccb8c-6555-4681-8a18-8839dac28bee', '07e384a3-841f-461d-a219-9dfa68721c22', '5', 'fix', 'auto_1752182429306_gnc1daovozr', 'muneeb.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-10 16:24:56', NULL),
('adfb31bf-ec75-4b0d-ae13-94ca97e61f43', '1eb978c6-849f-44b3-99da-dd3aed062960', '2.0.0', 'fixes', 'auto_1751815096324_89d4444w3ho', 'noman.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-06 10:24:27', NULL),
('b9eb12cd-5caa-42ab-8e66-179c7a4c661d', '5bac55a9-3755-4b57-95aa-06114a30634f', '3', 'for ahsan', 'auto_1751877801302_lx0rpzq2htk', 'ahsan.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-10 15:41:53', NULL),
('bec6961c-cf15-452d-82bf-5209f31196f7', '724db729-5c86-492f-85e0-be579cd70659', '3', 'for muneeb only', 'auto_1751813352540_nukebl21bus', 'muneeb.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-10 15:05:19', NULL),
('c8088014-0a58-4b6e-b519-848d9dd142e7', '23d845d0-ac0a-4ab3-9aa8-d1f50d6cedb0', '1.1.0', 'bugs fixes', 'auto_1751829068425_kgt0e5qbcfp', 'noman.theexpertways.com', 'auto_update_completed', 1, NULL, '2025-07-06 14:12:53', NULL),
('d8c904b0-c837-4ae5-930d-86d2044a833b', '4733fbb1-906d-4777-a31d-75fc689426d9', '2.0.1', 'User channged', 'auto_1751817961426_jfv9rsntdca', 'noman.theexpertways.com', 'auto_update_started', 1, NULL, '2025-07-06 11:15:31', NULL),
('e62159db-60ac-4623-85cf-d77f5a6ef609', '26897fe2-b2b0-4887-93a0-b61a6ae11836', '1.5.0', 'fixes', 'auto_1751831823758_fzzj573rw66', 'theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-06 15:39:54', NULL),
('ed203a91-2944-416a-beb2-58c3162cf207', '1eb978c6-849f-44b3-99da-dd3aed062960', '2.0.0', 'fixes', 'auto_1751813468005_x0eejqv5sr', 'noman.theexpertways.com', 'auto_update_failed', 1, NULL, '2025-07-06 09:53:28', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` mediumtext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `user_id`, `setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES
('008b275c-79ca-40cf-b61d-060eb60e99e0', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'section_domains_visible', 'false', '2025-07-10 16:51:29', '2025-07-17 17:57:22'),
('029ef286-964d-4af8-a5b0-28e020d84cee', '033f0150-6671-41e5-a968-ff40e9f07f26', 'avatar_image', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1751190516378-ChatGPT%20Image%20Jun%2028,%202025,%2003_46_27%20PM.png', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('02e79f0a-b8c8-4cda-925c-49bb9f54a011', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'avatar_zoom', '100', '2025-06-28 23:40:49', '2025-07-17 19:59:19'),
('06005bb1-75ca-4348-ab51-8154f60e9a06', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'banner_title', '\"Craft the new ideas\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('066e4491-ba12-4bd4-aed3-77e91335be31', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'avatar_zoom', '100', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('06a6a6a2-b5fc-447c-9194-643dd2b1228a', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'show_resume_download', 'false', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('07268522-7063-4633-a5c4-4c98d8c32362', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'avatar_image', '\"https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1751139212081-1749626924024.jpeg\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('075f10e3-b850-41d6-a4c0-435b96c86859', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'logo_initials', '\"AI\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('08ec6bc4-1fa2-4276-9950-95c9cb9e4d6e', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'logo_type', '\"initials\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('0e604c5d-9966-41d5-9abe-a9df6039f88d', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'hero_banner_zoom', '100', '2025-06-28 23:40:49', '2025-07-17 19:59:19'),
('0ec05c84-d3f8-4263-8566-b65d3774e987', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'section_project_cycle_visible', 'false', '2025-07-10 15:55:57', '2025-07-10 15:55:57'),
('0f0dfb5a-47ef-4189-9849-b9562adb62c7', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'social_email', '\"muneebarif11@gmail.com\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('0ff7b980-ce8a-465d-a387-cd35c93f2cc9', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'section_project_cycle_visible', 'false', '2025-07-10 16:51:29', '2025-07-17 17:57:22'),
('12475405-4570-476b-b9ab-8c0619430904', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'hero_banner_image', '\"https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1752184845778-ChatGPT%20Image%20Jul%2011,%202025,%2002_58_50%20AM%20(1).png\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('1477227b-4260-4c9e-8808-bd4de036d154', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'banner_name', '\"Muhammad Amir\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('14ffb4db-49e7-482a-be2e-222ca073aa7c', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'logo_type', '\"initials\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('16bf1091-ddd9-48ad-bea5-d282ffece69f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'whatsapp_preview_image', '\"https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1751304372969-Ahsan_Mehmood_Corrected_1200x630.jpg\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('16cd8e87-8648-423c-a3d3-25097c2ee7eb', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'resume_file', '/images/profile/principal-software-engineer-muneeb.resume.pdf', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('19de7179-c515-45cb-ab56-6d2c244a3136', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'logo_image', '\"\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('1a84a224-eb75-4065-a369-907202af3275', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'hero_banner_zoom', '100', '2025-06-28 22:24:18', '2025-06-28 22:24:18'),
('1af2c002-e89d-42a4-83ea-69eec5398c83', '58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'copyright_text', '© 2025 Test Domain User. All rights reserved.', '2025-07-17 12:32:53', '2025-07-17 12:32:53'),
('1dd7b7a8-2e83-42c5-8317-b0aaee1b0744', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'banner_tagline', '\"I craft dreams, not projects.\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('1e716dd7-9cac-4b94-9749-325480326921', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'avatar_zoom', '100', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('201da319-6f04-4392-8fba-f421f53c7121', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'social_facebook', '\"\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('222f4b12-499a-45e1-831b-b8ba7b277239', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'social_instagram', '\"\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('240e33a3-3e4c-41a6-bb7d-2c8f46c8e827', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'logo_type', '\"initials\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('24f30b96-d501-41d9-bc46-12e45b64ba74', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'section_project_cycle_visible', 'true', '2025-07-10 14:42:52', '2025-07-15 14:14:27'),
('25064019-c9d5-4355-b752-16eb96d9dd81', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'resume_file', '\"/images/profile/principal-software-engineer-muneeb.resume.pdf\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('2b3bbc96-3ac8-4c33-b939-a285b0dcb74f', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'banner_tagline', '\"I craft dreams, not projects.\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('2b93ec34-1f0c-4101-bde1-319a60081456', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'theme_name', '\"cherry\"', '2025-06-28 21:29:09', '2025-06-28 21:29:09'),
('2e8647cb-52a3-49d8-9591-6d6c84c90561', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'social_instagram', '\"\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('31dc24ec-745f-4469-9d9e-8fd97b658281', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'hero_banner_zoom', '100', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('32f457f5-c5bc-4ab0-8ce3-cb4a93197632', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'site_url', '\"https://prompt.theexpertways.com\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('34de9a1b-a69d-4b03-88d9-7700616c0cef', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'theme_name', 'purple', '2025-07-06 14:59:32', '2025-07-06 14:59:32'),
('3684dc84-9e9e-4702-bdd7-369e5ff4d2cb', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'logo_type', '\"initials\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('37647df0-5abf-443e-aa08-2c71b1832e0c', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'theme_name', '\"purple\"', '2025-06-28 12:36:17', '2025-07-17 19:59:19'),
('37898f7f-605f-4dca-9c9b-7839142155d2', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'avatar_image', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1751833222423-logo_purple.png', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('37922e58-1610-476a-b9f3-958a8d9fea38', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'hero_banner_image', '\"/images/hero-bg.png\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('39a88c66-009a-49a4-a773-7f246d6468f2', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'logo_type', '\"initials\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('3a3c7e65-a8db-4b87-8cb6-149798ddac66', '033f0150-6671-41e5-a968-ff40e9f07f26', 'banner_name', 'Farid Afzal', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('3b738dde-c4ab-4b98-b60f-f4df7684848a', '58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'banner_title', 'Software Engineer', '2025-07-17 12:32:53', '2025-07-17 12:32:53'),
('3bd67c53-f67e-4d5b-b72b-b53b199dfa6c', '033f0150-6671-41e5-a968-ff40e9f07f26', 'resume_file', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1751108224898-fareed_iOS_resume.pdf', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('3e5d97f3-7fbb-43e8-8feb-1cf96edf7ff7', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'avatar_image', '\"/images/profile/avatar.jpeg\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('3e82acfb-b9fc-483b-a757-6289ea708237', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'section_portfolio_visible', 'true', '2025-07-10 14:42:52', '2025-07-15 14:14:27'),
('3fc21ea9-107d-4f7d-a208-0ab63ae5e20c', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'whatsapp_preview_image', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1751833357818-logo_purple_1200x630_fixed.png', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('3fc31180-5ccc-4142-9888-33c5f972efb5', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'section_portfolio_visible', 'true', '2025-07-11 06:26:58', '2025-07-11 06:26:58'),
('42b4d65f-dd4f-4406-bf4b-a04317c6ea85', '033f0150-6671-41e5-a968-ff40e9f07f26', 'avatar_zoom', '100', '2025-06-28 23:33:25', '2025-06-28 23:33:25'),
('44c89b37-4127-4004-9b12-154f2f47755a', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'section_portfolio_visible', 'false', '2025-07-10 16:51:29', '2025-07-17 17:57:22'),
('46ff35bb-0dfc-4df4-bf88-7954b5bdcd59', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'avatar_zoom', '100', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('495dc498-8027-4ea2-ba63-43b08b77e46f', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'show_resume_download', 'true', '2025-07-11 04:52:51', '2025-07-11 04:52:51'),
('4b0a0820-f7af-4747-9f4e-09f91ec4b727', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'site_url', '\"http://localhost:3000\"', '2025-06-28 21:19:42', '2025-07-17 19:59:19'),
('5184695a-826a-4521-a515-8375455f4619', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'social_email', '\"#\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('5446ad37-8d0f-46f0-8418-4d0c49e78d58', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'section_prompts_visible', 'true', '2025-07-17 17:22:23', '2025-07-17 17:57:22'),
('54617b92-165e-4dfb-8367-eb45cf67b7b9', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'avatar_image', '\"https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1752227568584-1751303379992-ChatGPT%20Image%20Jun%2030,%202025,%2010_02_58%20PM%20(1).png\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('55e25336-6385-4c21-a06e-d1df48e2f7ab', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'section_hero_visible', 'true', '2025-07-10 15:55:57', '2025-07-10 15:55:57'),
('57f6f02a-ad25-4c6f-bd6e-1c038cdc5cb9', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'avatar_image', '\"https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1752184504219-ChatGPT%20Image%20Jul%2011,%202025,%2002_53_15%20AM%20(1).png\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('580fef94-6e44-4cd6-b1ce-818a0f63f424', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'section_domains_visible', 'true', '2025-07-11 06:26:58', '2025-07-11 06:26:58'),
('58f12a6c-931a-4e27-8f71-395a4172f3ef', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'logo_type', 'initials', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('5902a423-50e0-490e-ae31-ceb3abc8a123', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'banner_name', '\"Khurram Aslam\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('5dacf5c2-2310-46c2-ba75-030179f98d7e', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'social_facebook', '\"\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('5e3ff41d-6ebe-49c4-a0f4-89753cbdfa61', '033f0150-6671-41e5-a968-ff40e9f07f26', 'copyright_text', '© 2025 Farid Afzal. All rights reserved.', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('5fe60251-67c6-4785-a1a8-e3e79144f054', '58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'section_domains_visible', 'true', '2025-07-17 12:32:53', '2025-07-17 12:32:53'),
('6134101c-d3da-4e0c-8bc3-64fb77184f04', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'hero_banner_image', '\"https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1752227566226-1751304365991-ChatGPT%20Image%20Jun%2030,%202025,%2010_15_32%20PM%20(1).png\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('648ea103-cca4-4f57-95ec-0b1622fc2401', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'section_technologies_visible', 'true', '2025-07-10 14:42:52', '2025-07-15 14:14:27'),
('64fb287a-26d8-444a-9e12-9fc121120f37', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'banner_title', '\"Principal Software Engineer\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('6ae053b1-97b9-4738-8980-8a61bee487ce', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'logo_initials', 'TW', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('6b49d15c-40f1-487a-8480-ba8b47f2ce88', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'banner_title', '\"UI / UX designer\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('6bfa17bc-a60f-4c3e-8ca9-014e268e5326', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'social_instagram', '\"#\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('6cee06d1-192d-4aa0-ac63-298814a37aa4', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'copyright_text', '\"© 2024 Ahsan Mehnood. All rights reserved.\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('6e5295b2-674d-45d0-9756-c8915a5a1883', '58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'social_email', 'test-domain-1752773572167@example.com', '2025-07-17 12:32:53', '2025-07-17 12:32:53'),
('6f5eb0b9-132c-491a-9aee-7f594c72f4d5', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'banner_tagline', 'We craft dreams, not projects.', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('6f696a57-af4a-4542-b402-8b9156d08900', '033f0150-6671-41e5-a968-ff40e9f07f26', 'hero_banner_image', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1751145017250-ChatGPT%20Image%20Jun%2029,%202025,%2002_04_44%20AM.png', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('6fadd269-9cfa-4925-a6d7-f5139a80617e', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'resume_file', '\"/images/profile/principal-software-engineer-muneeb.resume.pdf\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('70504104-0b79-4501-b458-6462d41a9bf9', '58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'theme_name', 'purple', '2025-07-17 12:32:53', '2025-07-17 12:32:53'),
('7082b26a-b0ea-4e96-9bb5-bc8bd68c0156', '033f0150-6671-41e5-a968-ff40e9f07f26', 'logo_initials', 'FA', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('75757833-133a-43dc-bbcb-33fb0ec1ea16', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'whatsapp_preview_image', '\"https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1752184848041-miniature_construction_resized.jpg\"', '2025-06-28 23:09:40', '2025-06-28 23:09:40'),
('76967cba-5a68-404d-a83d-5eb793e8cf73', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'social_email', 'theexpertways.com@gmail.com', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('78769cf0-a41e-49f9-80ad-f59aaaa849e7', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'avatar_image', '\"/images/profile/avatar.jpeg\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('790332e6-1c6c-40c0-b26b-89d95dddbfce', '58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'banner_name', 'Test Domain User', '2025-07-17 12:32:53', '2025-07-17 12:32:53'),
('7cbb5ae2-ce68-44e1-bebb-bc2b9e58c31b', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'hero_banner_image', '\"https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1752176696748-ChatGPT%20Image%20Jul%2011,%202025,%2012_43_51%20AM%20(1)%20(1).png\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('7d4ab479-0e95-4be7-8ebd-570fd6b38d7f', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'copyright_text', '\"© 2024 M. Amir. All rights reserved.\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('7f26505d-592e-4434-a24e-62d2f5b21edf', '033f0150-6671-41e5-a968-ff40e9f07f26', 'hero_banner_zoom', '100', '2025-06-28 23:33:25', '2025-06-28 23:33:25'),
('813cdb32-f2ee-4a5f-b921-d37302b4df8e', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'theme_name', '\"retroblue\"', '2025-06-30 11:53:09', '2025-06-30 11:53:09'),
('818ef36a-0b25-44e2-92cc-864eebded3e9', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'copyright_text', '© 2025 theExpertWays. All rights reserved.', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('83df3adc-567a-4962-a1b0-2adbd706d357', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'banner_title', '\"Principal Software Engineer\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('8569864a-d008-4225-ac7b-9d463fbd1bb1', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'logo_image', '\"\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('87d53216-487d-4e50-9678-6c402e724ea1', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'banner_name', 'B2B Solutions', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('8951bcd5-6ab9-41c6-95b6-b4a1c55a795f', '58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'banner_tagline', 'I craft dreams, not projects.', '2025-07-17 12:32:53', '2025-07-17 12:32:53'),
('8b9eca21-777f-4982-8c44-ac8e6e82f315', '033f0150-6671-41e5-a968-ff40e9f07f26', 'social_github', 'https://github.com/fareedAfzal', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('8f33c4a0-d5f2-43bb-95e5-e9513186cc45', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'social_instagram', '\"https://www.instagram.com/muneebarif11\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('90e48358-8d8a-4294-a4b7-e76657372f1c', '033f0150-6671-41e5-a968-ff40e9f07f26', 'logo_image', NULL, '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('90e6832d-3502-49be-b50d-82232a84db8f', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'hero_banner_image', '\"/images/hero-bg.png\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('91045871-214a-4618-a4de-60d79727d292', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'social_email', '\"prompt@example.com\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('92404657-dde3-4338-a238-d074f44a0b5c', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'avatar_zoom', '100', '2025-06-28 22:26:30', '2025-06-28 22:26:30'),
('92456685-624c-4584-b7de-c549356c2372', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'show_resume_download', 'true', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('935ba82e-4b36-4836-a289-2724801f92c4', '033f0150-6671-41e5-a968-ff40e9f07f26', 'logo_type', 'initials', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('938460fc-12f8-40b6-84eb-d97d532d7b76', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'banner_title', '\"Principal Software Engineer\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('93b06870-3eb0-42cb-83d2-3d47519a672e', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'social_github', '#', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('94a2ba7f-41e5-439a-b85a-2228cd77073a', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'logo_image', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1751834624420-logo_purple.png', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('963e71f8-e652-4f68-89a3-b0e99db447c4', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'whatsapp_preview_image', '\"\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('9d8de656-86d6-4c33-9b55-80affed80f8f', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'hero_banner_zoom', '100', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('9e211a92-4660-44e3-b9f6-c0bbaacab542', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'logo_image', '\"\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('9ede3b8c-27dd-472e-b2ee-4e6d4c3d8613', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'site_url', 'https://theexpertways.com/', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('9fa761c3-ec60-4374-88d4-3643716dd7f9', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'site_url', '\"https://your-domain.com\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('a041ee76-9edc-408c-8b1e-9adba58633f8', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'section_technologies_visible', 'true', '2025-07-10 15:55:57', '2025-07-10 15:55:57'),
('a360b348-c4e3-4378-b35f-ab686534c5f4', '033f0150-6671-41e5-a968-ff40e9f07f26', 'theme_name', 'purple', '2025-06-28 13:53:09', '2025-06-28 13:53:09'),
('a60636f1-8c05-4514-87dd-e028721f87d3', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'resume_file', '\"/images/profile/principal-software-engineer-muneeb.resume.pdf\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('a7b9fdc8-e73d-434d-8e12-217882e7d1fc', '033f0150-6671-41e5-a968-ff40e9f07f26', 'banner_tagline', 'Transforming Ideas into Beautiful iOS Apps.', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('a873c693-c936-4c24-8526-bb4097989e29', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'hero_banner_zoom', '100', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('a925b816-c8a9-4e4f-b270-0d0de455036a', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'banner_name', '\"AI Prompts\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('ac231503-b491-4c5a-addf-89f9c7b6dac1', '033f0150-6671-41e5-a968-ff40e9f07f26', 'site_url', 'https://hereisfarid.com/', '2025-06-28 20:45:55', '2025-06-28 20:45:55'),
('acc02520-0064-46f7-aad4-6fb196058238', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'social_github', '\"https://github.com/muneeb-arif/\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('ae30ec4c-411e-4431-9f78-15d06e0d83c5', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'whatsapp_preview_image', '\"https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1752177148356-WhatsApp_Preview_Recreated_1200x630.jpg\"', '2025-06-28 23:40:49', '2025-07-17 19:59:19'),
('af17a0f4-1254-4dd1-9d86-36c69b342150', '033f0150-6671-41e5-a968-ff40e9f07f26', 'social_email', 'fareedrao7890@gmail.com', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('b188536f-5045-48e0-9be4-6bd39f4692b0', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'banner_title', 'Guiding Your Digital Journey', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('b2b68e0e-c321-4d89-b2b9-5d2a272b3f46', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'banner_name', '\"Muneeb Arif\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('b44a9cf7-af96-415a-b6fc-2eda8c7e1cb7', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'copyright_text', '\"© 2025 Muneeb Arif. All rights reserved.\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('b481326c-0548-430f-b60d-b0f8168ab8d1', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'section_hero_visible', 'false', '2025-07-10 16:51:29', '2025-07-17 17:57:22'),
('b7757ac5-9a50-48ce-9ed2-cf4ae1101140', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'social_instagram', '\"\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('b827ee97-abe7-4ba8-aa09-ee1b783857dc', '58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'section_project_cycle_visible', 'true', '2025-07-17 12:32:53', '2025-07-17 12:32:53'),
('b9078ebb-c79b-4a85-a64c-691894e52ea1', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'show_resume_download', 'true', '2025-07-09 14:12:50', '2025-07-17 19:59:19'),
('b9dac115-7498-42c6-a652-07eef93bec76', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'hero_banner_zoom', '100', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('ba6b282e-4330-46d3-9575-adc7091cea5e', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'logo_image', '\"\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('bbc06922-3af9-4999-bef9-f431d96a2811', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'hero_banner_image', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1752020835756-ChatGPT%20Image%20Jul%207,%202025,%2001_12_59%20AM.png', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('bc1517b5-b328-4236-b481-2d79bf8d54df', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'social_instagram', '#', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('bc9bed39-ab52-4d4b-91de-92435391df7b', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'social_github', '\"https://github.com/muneebarif\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('bd328374-477f-436f-aad9-680b7aa8fbe4', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'copyright_text', '\"© 2025 Khurram. All rights reserved.\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('bfabd4c4-b41e-41e8-a592-32f83a44650b', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'section_hero_visible', 'true', '2025-07-11 06:26:58', '2025-07-11 06:26:58'),
('c098be1c-bb0b-46cc-b13e-ae65879be80f', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'logo_initials', '\"MA\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('c0c2a657-2666-4694-9d8b-b97ded268fa4', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'section_technologies_visible', 'false', '2025-07-10 16:51:29', '2025-07-17 17:57:22'),
('c1397b23-caf7-404e-bfba-085019cf2b6a', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'resume_file', '\"/images/profile/principal-software-engineer-muneeb.resume.pdf\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('c15b3b99-31ac-40ac-bb8e-1f2b4a5d5c14', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'logo_initials', '\"AM\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('c28ca298-abee-4e81-9e00-e10f617e253b', '033f0150-6671-41e5-a968-ff40e9f07f26', 'whatsapp_preview_image', 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/images/1751192715052-1751171602622-resized_lab_dna_image.jpg', '2025-06-28 23:33:25', '2025-06-28 23:33:25'),
('c3a856c1-baba-4227-a8b2-b177f3eb9fd4', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'social_facebook', '\"#\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('c3fb3b39-313f-4245-bf27-72bc99537fca', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'theme_name', '\"sand\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('c6f7457e-d48a-4f35-ae81-d00854ca67b0', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'section_technologies_visible', 'true', '2025-07-11 06:26:58', '2025-07-11 06:26:58'),
('caef2867-3b57-4ef2-9e43-eea95d2d6e8c', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'banner_tagline', '\"I craft dreams, not projects.\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('cd38bd4c-19b9-47f6-92d7-7bcdfe94360d', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'section_hero_visible', 'true', '2025-07-10 14:42:52', '2025-07-15 14:14:27'),
('cfd9c154-ce00-40f3-9372-a8aeba8ea839', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'social_github', '\"\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('cfdcd2ee-5bf9-4a42-ad7b-ab1b320a236a', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'social_github', '\"#\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('d0565e5e-58e1-420f-ad46-3c1a0a6d25d5', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'section_domains_visible', 'false', '2025-07-10 15:55:57', '2025-07-10 15:55:57'),
('d07854c7-3f98-45e4-9920-93c1a537055b', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'social_github', '\"\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('d2b484f8-997c-4180-8c73-7f33c703bc27', '58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'section_technologies_visible', 'true', '2025-07-17 12:32:53', '2025-07-17 12:32:53'),
('d4070992-2d9a-4e78-806f-3bb6217238e8', '58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'section_portfolio_visible', 'true', '2025-07-17 12:32:53', '2025-07-17 12:32:53'),
('d4add47b-ee89-4f73-ba2d-55988786f182', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'social_facebook', '\"https://www.facebook.com/muneeb.arif11/\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('d7608474-9dd4-4a40-ad1d-2bdcb88f8206', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'theme_name', '\"nature\"', '2025-07-11 06:25:22', '2025-07-11 06:25:22'),
('d7d847f3-e989-4fc6-81da-206231e559e4', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'logo_image', '\"\"', '2025-06-28 13:12:31', '2025-07-17 19:59:19'),
('d8960d81-88d3-4db6-842c-373eb69a8aa8', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'logo_initials', '\"MA\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('d9f26c31-378b-4929-8229-d8f817d1548c', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'social_facebook', '\"\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('e04a1145-3728-4f88-a9c6-26129fc7b579', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'copyright_text', '\"© 2024 AI. All rights reserved.\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('e1efffea-452f-4f42-a9c8-e8546339cd77', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'social_email', '\"\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('e2c5157b-151a-4c1e-8c2e-67f46e4fdb3a', '58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'section_hero_visible', 'true', '2025-07-17 12:32:53', '2025-07-17 12:32:53'),
('e503a972-23ee-4d94-9cab-4a7f85798f0c', '033f0150-6671-41e5-a968-ff40e9f07f26', 'banner_title', 'Senior iOS Engineer', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('e66889c1-e49c-4ad2-bdd6-e7e698224914', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'section_project_cycle_visible', 'false', '2025-07-11 06:26:58', '2025-07-11 06:26:58'),
('e6fa24e5-7741-4d14-8a29-8345ae528e49', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'site_url', '\"https://khurram.theexpertways.com/\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('ea917c2a-c474-402b-ad46-17b187eca1ae', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'whatsapp_preview_image', '\"\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('ea978866-3cf2-4139-a6d4-3fb2d064cfe5', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'section_domains_visible', 'true', '2025-07-10 14:42:52', '2025-07-15 14:14:27'),
('eb283306-719d-48f1-a88f-e90925ecb1bd', '033f0150-6671-41e5-a968-ff40e9f07f26', 'social_facebook', 'https://www.facebook.com/fareed.rao.312', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('ed36c891-eaaa-4083-ae1d-a8acc5c748d8', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'site_url', '\"https://your-domain.com\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('edc78fad-a022-4ab4-9ae0-534154c040ac', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'avatar_zoom', '100', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('ef5ffd26-6ea5-4261-bff2-8f788625a484', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'banner_tagline', '\"I craft dreams, not projects.\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('efb9361c-9665-4f77-9891-95290b3f5f9b', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'banner_name', '\"Ahsan Mehmood\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('efbd57bb-8bd8-4761-85b5-f15370a223b8', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'section_portfolio_visible', 'true', '2025-07-10 15:55:57', '2025-07-10 15:55:57'),
('f0814e32-9eb4-4eee-b81c-bf1364dd040c', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'show_resume_download', 'false', '2025-07-10 16:51:41', '2025-07-10 16:51:41'),
('f0a92fe8-c81e-4e0d-9749-f69b8cefbd49', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'resume_file', '\"/images/profile/principal-software-engineer-muneeb.resume.pdf\"', '2025-06-30 11:54:08', '2025-06-30 11:54:08'),
('f1f2e839-9885-4b0d-8671-37961d5daa98', '4ef76b96-d00c-4895-a109-0dc729b4bc46', 'social_email', '\"muneeb@example.com\"', '2025-07-11 06:25:51', '2025-07-11 06:25:51'),
('f37d0cff-4e02-4b32-adf0-de32366f1987', '033f0150-6671-41e5-a968-ff40e9f07f26', 'social_instagram', 'https://www.instagram.com/fareed_afzal12/', '2025-06-28 05:46:51', '2025-06-28 05:46:51'),
('f394a0ee-02fe-477f-8297-fbd88d8d7cea', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'banner_tagline', '\"\"', '2025-06-28 21:29:26', '2025-06-28 21:29:26'),
('f5e9eaaf-6a30-4e97-bd56-3169c0d0aed4', '1b437fd2-8576-44b0-b49e-741a0befe6a4', 'social_facebook', '#', '2025-07-06 15:00:00', '2025-07-06 15:00:00'),
('f6d69fb0-8475-4b88-8c34-bf8c7a58bc1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'show_resume_download', 'true', '2025-07-07 03:00:24', '2025-07-07 03:00:24'),
('fd6464ec-9404-4240-9bb0-552aad5b5be1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'logo_initials', '\"KM\"', '2025-07-07 03:00:24', '2025-07-07 03:00:24');

-- --------------------------------------------------------

--
-- Table structure for table `shared_hosting_clients`
--

CREATE TABLE `shared_hosting_clients` (
  `id` varchar(36) NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `current_version` varchar(50) NOT NULL,
  `deployment_type` varchar(50) DEFAULT 'shared_hosting',
  `hosting_provider` varchar(100) DEFAULT NULL,
  `cpanel_info` json DEFAULT NULL,
  `last_seen` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_agent` text,
  `timezone` varchar(50) DEFAULT 'UTC',
  `contact_email` varchar(255) DEFAULT NULL,
  `notes` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `shared_hosting_clients`
--

INSERT INTO `shared_hosting_clients` (`id`, `client_id`, `domain`, `current_version`, `deployment_type`, `hosting_provider`, `cpanel_info`, `last_seen`, `user_agent`, `timezone`, `contact_email`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES
('00616f42-1d98-4783-a14c-8b978db359f3', 'shared_1751815096324_yyd2c5lcha', 'noman.theexpertways.com', '1.0.0', 'shared_hosting', NULL, NULL, '2025-07-06 10:21:58', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', NULL, NULL, 1, '2025-07-06 10:18:17', '2025-07-06 10:22:00'),
('1349fd5f-7190-4b2c-8505-df0eb740b324', 'shared_1751817931414_ojqqrjscy79', 'localhost', '1.0.0', 'shared_hosting', NULL, NULL, '2025-07-06 11:05:32', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', NULL, NULL, 1, '2025-07-06 11:05:33', '2025-07-06 11:05:33'),
('80310871-2006-44dc-a97a-66deac6859bb', 'shared_1751816583501_gux4ut2ak6b', 'noman.theexpertways.com', '2.0.0', 'shared_hosting', NULL, NULL, '2025-07-06 11:05:26', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', NULL, NULL, 1, '2025-07-06 10:43:05', '2025-07-06 11:05:28'),
('90293845-9da0-430c-baa0-08a4cf309464', 'shared_1751808336031_wpb5hbw4a6c', 'localhost', '1.0.0', 'shared_hosting', NULL, NULL, '2025-07-06 11:11:30', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', NULL, NULL, 1, '2025-07-06 08:58:42', '2025-07-06 11:11:31'),
('a0e14cf3-bc90-400d-a8ae-f56b41780a0e', 'shared_1751817961426_m8ijax7yz2n', 'noman.theexpertways.com', '3.0.0', 'shared_hosting', NULL, NULL, '2025-07-06 11:19:49', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', NULL, NULL, 1, '2025-07-06 11:06:02', '2025-07-06 11:19:50'),
('f8d1dea8-a4d2-40cc-8dcd-761fb037d446', 'shared_1751813468005_lkhlyd3xawl', 'noman.theexpertways.com', '1.0.0', 'shared_hosting', NULL, NULL, '2025-07-06 09:55:00', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', NULL, NULL, 1, '2025-07-06 09:51:09', '2025-07-06 09:55:02'),
('fc255a6b-61e5-480c-8190-53e8d94b7c5e', 'shared_1751813352540_ceeki9zhskq', 'muneeb.theexpertways.com', '1.0.0', 'shared_hosting', NULL, NULL, '2025-07-06 11:12:14', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', NULL, NULL, 1, '2025-07-06 09:49:13', '2025-07-06 11:12:17');

-- --------------------------------------------------------

--
-- Table structure for table `shared_hosting_notifications`
--

CREATE TABLE `shared_hosting_notifications` (
  `id` varchar(36) NOT NULL,
  `client_id` varchar(255) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `notification_type` varchar(100) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `shared_hosting_updates`
--

CREATE TABLE `shared_hosting_updates` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `version` varchar(50) NOT NULL,
  `files` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `pushed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `shared_hosting_updates`
--

INSERT INTO `shared_hosting_updates` (`id`, `title`, `description`, `version`, `files`, `is_active`, `created_at`, `updated_at`, `pushed_at`) VALUES
('0acf7f27-0202-4c86-b0ab-476dbc9fb02c', 'asdad', 'aadad', '2', '[{\"url\": \"https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/updates/backup-2025-07-18T00-13-26-775Z-minimal-update.zip\"}]', 1, '2025-07-18 00:56:01', '2025-07-18 00:56:01', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `shared_hosting_update_logs`
--

CREATE TABLE `shared_hosting_update_logs` (
  `id` varchar(36) NOT NULL,
  `update_id` varchar(36) DEFAULT NULL,
  `client_id` varchar(255) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `log_message` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `shared_hosting_update_stats`
--

CREATE TABLE `shared_hosting_update_stats` (
  `id` varchar(36) NOT NULL,
  `update_id` varchar(36) DEFAULT NULL,
  `total_clients` int(11) DEFAULT '0',
  `successful_updates` int(11) DEFAULT '0',
  `failed_updates` int(11) DEFAULT '0',
  `pending_updates` int(11) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tech_skills`
--

CREATE TABLE `tech_skills` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tech_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` int(11) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tech_skills`
--

INSERT INTO `tech_skills` (`id`, `tech_id`, `user_id`, `name`, `icon`, `level`, `created_at`, `updated_at`) VALUES
('0045a3ad-4069-4134-988d-5e6f1f0f77c1', '705f1caf-e70c-4f0c-9f2d-606b32a0bc9f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Azure', NULL, 3, '2025-06-28 21:28:16', '2025-06-28 21:28:16'),
('014c8219-e126-4d97-9676-d2214c21d10e', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Scikit-learn', NULL, 4, '2025-06-28 21:28:09', '2025-06-28 21:28:09'),
('01e0cbba-e3ed-4284-9891-cf38d3bc791f', '705f1caf-e70c-4f0c-9f2d-606b32a0bc9f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Terraform', NULL, 3, '2025-06-28 21:28:18', '2025-06-28 21:28:18'),
('0262f59d-4fae-4b89-8d69-b329f567ab9c', '5bced85c-eb5c-499b-93a0-4aeed42381fc', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'CI/CD', NULL, 4, '2025-06-28 21:28:33', '2025-06-28 21:28:33'),
('0293834a-62eb-4b70-9fdd-fdedf50cc279', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'PostgreSQL', NULL, 4, '2025-07-07 02:55:22', '2025-07-07 02:55:22'),
('02a64e62-ed1d-41c9-9d3d-4532cb5d80dc', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'OpenCV', NULL, 3, '2025-07-07 02:55:34', '2025-07-07 02:55:34'),
('02b1fac3-bbd0-49a3-bbcd-430ecbfc4cb2', '9a57c579-ab69-47a0-ac08-2ec427ffc5e1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'React Native', NULL, 4, '2025-07-07 02:55:28', '2025-07-07 02:55:28'),
('04218622-410e-4492-a2f8-7bd22014120b', 'deea4f02-217b-43b1-94ef-db7f58e73949', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Wireframing', NULL, 4, '2025-06-28 11:56:32', '2025-06-28 11:56:32'),
('04b3d132-8c10-412c-b3e8-e76574c6de23', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Node.js', NULL, 5, '2025-07-07 02:55:15', '2025-07-07 02:55:15'),
('050b4788-6812-432d-888e-4c067f35591d', '6e923f02-e551-45f0-9419-613ce9f7898c', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'AWS', NULL, 4, '2025-06-28 11:55:57', '2025-06-28 11:55:57'),
('06811ed3-a6fb-49d3-badb-22eac2fd2ea9', '5bced85c-eb5c-499b-93a0-4aeed42381fc', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Auto Scaling', NULL, 3, '2025-06-28 21:28:36', '2025-06-28 21:28:36'),
('0a6d0532-fabd-4388-9361-cc7c3885b5c0', 'fc29a629-f032-4241-b73d-c766d198d251', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Xamarin', NULL, 2, '2025-06-28 21:28:07', '2025-06-28 21:28:07'),
('0cd668fd-6d99-434d-8a48-e21ccce29b73', 'e44b8a36-6e77-4caf-82c1-7346cad60c0b', '033f0150-6671-41e5-a968-ff40e9f07f26', 'Firebase', NULL, 5, '2025-06-28 13:05:46', '2025-06-28 13:05:46'),
('0da55dfe-6711-47a9-93f6-ff9b912b286b', '40f9e0ef-d153-4f64-9a8c-ffd39c525e1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Docker', NULL, 4, '2025-07-07 02:55:43', '2025-07-07 02:55:43'),
('0e72d2ad-d16e-47bc-9820-df5136cfb3de', '5f6325aa-3f68-4603-b960-f747d235d444', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Solidity', NULL, 3, '2025-06-28 21:28:20', '2025-06-28 21:28:20'),
('0f12800c-9386-41dc-8448-43aa7daa2d0a', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Python', NULL, 4, '2025-06-28 21:28:00', '2025-06-28 21:28:00'),
('0fabf50e-5a80-4375-8fb8-ef935e9de7a9', '7658dc9f-4c70-4c36-a410-672340912892', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Communication Skills', NULL, 4, '2025-07-10 05:55:46', '2025-07-10 05:55:46'),
('139b4aa6-bc33-468e-adf2-196f16428b95', '5f6325aa-3f68-4603-b960-f747d235d444', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Web3.js', NULL, 3, '2025-06-28 21:28:21', '2025-06-28 21:28:21'),
('13d86c64-a851-40b3-814a-9ccab988c12c', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Bootstrap', NULL, 4, '2025-06-28 21:28:04', '2025-06-28 21:28:04'),
('160f4883-a93e-4495-a0f8-657964cc7195', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'PyTorch', NULL, 3, '2025-07-07 02:55:33', '2025-07-07 02:55:33'),
('164419ed-b6b1-4ed9-9b72-1ae77f94f33f', '2a500bf5-7509-4052-bc9c-88f58e868f6b', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Cryptography', NULL, 3, '2025-06-28 21:28:25', '2025-06-28 21:28:25'),
('176f4ed6-903b-48d7-82c1-16cf00436ce1', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'SASS/SCSS', NULL, 4, '2025-06-28 21:28:05', '2025-06-28 21:28:05'),
('184f0c2f-4159-43bd-87ad-397855dd6d4f', 'e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Sentry / Datadog', NULL, 3, '2025-07-15 18:45:32', '2025-07-15 18:45:32'),
('1a608378-d68f-44d8-83e2-8fd948d1fa43', '9a57c579-ab69-47a0-ac08-2ec427ffc5e1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Swift', NULL, 3, '2025-07-07 02:55:29', '2025-07-07 02:55:29'),
('1b52858b-2bc6-4a33-9056-9ae17aec0876', '420e2351-e947-42c2-81e6-c1c683d56acb', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'InVision', NULL, 3, '2025-07-07 02:56:07', '2025-07-07 02:56:07'),
('1c5e16b6-7e00-4902-a4f0-76d230722684', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'REST APIs', NULL, 5, '2025-06-28 21:28:03', '2025-06-28 21:28:03'),
('1d825560-8557-4c4e-87ff-efc279924472', '2a500bf5-7509-4052-bc9c-88f58e868f6b', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Threat Modeling', NULL, 3, '2025-06-28 21:28:27', '2025-06-28 21:28:27'),
('1feafeda-b6eb-4dba-b1a4-c3ebe09d2ae9', 'd228136a-3f18-4de2-a9f1-d1fb4419986e', '033f0150-6671-41e5-a968-ff40e9f07f26', 'SiriKit', NULL, 5, '2025-06-28 13:03:21', '2025-06-28 13:03:21'),
('1ff45921-66e0-4a2a-8079-2d2e6968dd3e', '061c28f6-aa41-4066-aa8c-767e5e5027ee', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Statistical Analysis', NULL, 4, '2025-07-07 02:55:56', '2025-07-07 02:55:56'),
('20395cfc-7c00-4c0a-bf73-942b0e8f195e', '18544731-2da4-4bc7-b282-87d5d4ec62d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Redis', NULL, 3, '2025-07-15 18:47:04', '2025-07-15 18:47:04'),
('21bac786-c92e-4a62-8a1e-136dbd077801', 'c5760f9a-c91d-4321-a2fb-247802ca585a', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'OWASP', NULL, 3, '2025-07-07 02:55:52', '2025-07-07 02:55:52'),
('228ba92a-b030-46bb-b9c0-807e2627267a', '40f9e0ef-d153-4f64-9a8c-ffd39c525e1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Kubernetes', NULL, 3, '2025-07-07 02:55:43', '2025-07-07 02:55:43'),
('23563f39-a3fa-40b2-b554-6229d1be2cc9', '40f9e0ef-d153-4f64-9a8c-ffd39c525e1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Firebase', NULL, 4, '2025-07-07 02:55:42', '2025-07-07 02:55:42'),
('235ec008-6d49-43cc-a4af-61ac53ea5f0a', '5bced85c-eb5c-499b-93a0-4aeed42381fc', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Load Balancing', NULL, 3, '2025-06-28 21:28:35', '2025-06-28 21:28:35'),
('23c9f399-f242-4207-8362-a7db27e0606f', '7658dc9f-4c70-4c36-a410-672340912892', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Collaboration & Teamwork', NULL, 4, '2025-07-10 05:56:09', '2025-07-10 05:56:09'),
('249ae2f3-f200-42c0-89ef-6e7c3f884a22', 'e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Monolith Architecture', NULL, 3, '2025-07-15 18:46:55', '2025-07-15 18:46:55'),
('2743607c-07c1-4d40-ac89-714e4826af7e', 'd228136a-3f18-4de2-a9f1-d1fb4419986e', '033f0150-6671-41e5-a968-ff40e9f07f26', 'UIKit', NULL, 5, '2025-06-28 13:02:24', '2025-06-28 13:02:24'),
('29720cc3-205b-4792-8604-b4b120eb7a0b', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Python', NULL, 4, '2025-07-07 02:55:20', '2025-07-07 02:55:20'),
('2ca28aa9-d347-4af6-ac07-5159218a515d', '7658dc9f-4c70-4c36-a410-672340912892', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'User Empathy', NULL, 3, '2025-07-10 05:55:31', '2025-07-10 05:55:31'),
('2d452f90-a56d-41a3-a1f3-7f26f61862dc', '63022624-6f6b-459e-9c42-021e48673483', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Figma', NULL, 4, '2025-07-10 05:49:10', '2025-07-10 05:49:10'),
('2d7c988a-aed5-4e92-8449-aea9cd4bd3c1', '061c28f6-aa41-4066-aa8c-767e5e5027ee', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Power BI', NULL, 3, '2025-07-07 02:55:59', '2025-07-07 02:55:59'),
('2dbd3131-6ff9-4cc8-a06d-a06e6800c3f6', '5f6325aa-3f68-4603-b960-f747d235d444', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'IPFS', NULL, 2, '2025-06-28 21:28:22', '2025-06-28 21:28:22'),
('2dffdef1-b182-42cc-bf8f-55e6aa498da5', '9a57c579-ab69-47a0-ac08-2ec427ffc5e1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Java', NULL, 3, '2025-07-07 02:55:31', '2025-07-07 02:55:31'),
('2e04fde1-07fb-48ed-a8c2-ae77161f5c53', 'e44b8a36-6e77-4caf-82c1-7346cad60c0b', '033f0150-6671-41e5-a968-ff40e9f07f26', 'Git', NULL, 5, '2025-06-28 13:05:32', '2025-06-28 13:05:32'),
('2f4bcb76-d01c-4dba-aff1-4c10dce40fe4', '5f6325aa-3f68-4603-b960-f747d235d444', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Smart Contracts', NULL, 3, '2025-06-28 21:28:22', '2025-06-28 21:28:22'),
('2f8e4c3c-da2a-40bd-a789-a29b102e74d1', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Tailwind CSS', NULL, 4, '2025-06-28 21:28:04', '2025-06-28 21:28:04'),
('2ff8935a-a07d-4a15-b0c4-c7b433c55d6d', 'eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'PWA | Headless CMS', NULL, 3, '2025-07-15 18:38:19', '2025-07-15 18:38:19'),
('306f3e1e-50bb-4642-bdec-6d21ea09a803', 'd228136a-3f18-4de2-a9f1-d1fb4419986e', '033f0150-6671-41e5-a968-ff40e9f07f26', 'MapKit', NULL, 5, '2025-06-28 13:03:03', '2025-06-28 13:03:03'),
('3089e09d-ee24-4274-a222-818818772f64', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Pandas', NULL, 4, '2025-06-28 21:28:11', '2025-06-28 21:28:11'),
('30c97a01-64f1-4b16-a241-34e2508b8ac0', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Django', NULL, 3, '2025-06-28 21:28:01', '2025-06-28 21:28:01'),
('31207003-d56f-4e9f-a0a1-02d5f24b84c8', '689644aa-b326-4c62-a2d8-e2f0eeae6cdd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Prototyping', NULL, 4, '2025-06-28 21:28:40', '2025-06-28 21:28:40'),
('3148de74-a61d-4d02-a287-8bc2d66ac09f', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'OpenCV', NULL, 3, '2025-06-28 21:28:10', '2025-06-28 21:28:10'),
('31a6c42e-1fce-4e0b-8661-d34307cb2458', '049e1334-35ad-405e-aaac-fe07de69a5c6', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Solidity', NULL, 3, '2025-07-07 02:55:47', '2025-07-07 02:55:47'),
('31df4205-18b9-4f8d-9a07-92454d988ee6', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Natural Language Processing', NULL, 3, '2025-07-07 02:55:39', '2025-07-07 02:55:39'),
('3206cf41-4ccb-43fc-bd9d-0deb8e0233d4', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'SpaCy', NULL, 3, '2025-07-07 02:55:35', '2025-07-07 02:55:35'),
('322e60bc-7dec-4bfd-83fc-30c6e97303ab', 'e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Rest APIs', NULL, 4, '2025-07-15 18:38:59', '2025-07-15 18:38:59'),
('32c783cd-a946-45ca-b723-f3de6703946a', '049e1334-35ad-405e-aaac-fe07de69a5c6', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Hyperledger', NULL, 2, '2025-07-07 02:55:48', '2025-07-07 02:55:48'),
('34173798-b52e-407f-bd34-de004e82bdc5', '705f1caf-e70c-4f0c-9f2d-606b32a0bc9f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Google Cloud', NULL, 3, '2025-06-28 21:28:15', '2025-06-28 21:28:15'),
('35ba82e6-2520-4462-8d92-f7375d2ae945', 'deea4f02-217b-43b1-94ef-db7f58e73949', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'User Research', NULL, 3, '2025-06-28 11:56:32', '2025-06-28 11:56:32'),
('378eb531-06be-4f71-b748-cb5b9a81e0c8', '689644aa-b326-4c62-a2d8-e2f0eeae6cdd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Responsive Design', NULL, 4, '2025-06-28 21:28:41', '2025-06-28 21:28:41'),
('37a9b2fe-248a-4dd1-af4d-cece93427c02', '049e1334-35ad-405e-aaac-fe07de69a5c6', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Smart Contracts', NULL, 3, '2025-07-07 02:55:49', '2025-07-07 02:55:49'),
('37bc6189-91a7-41af-8266-5aa5e11c3a10', 'eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'React | Redux | React Query', NULL, 3, '2025-07-15 18:37:17', '2025-07-15 18:37:17'),
('37ebacf6-a8f8-48b4-9eb9-409f527e3aab', 'e44b8a36-6e77-4caf-82c1-7346cad60c0b', '033f0150-6671-41e5-a968-ff40e9f07f26', 'Cocoapods', NULL, 5, '2025-06-28 13:05:56', '2025-06-28 13:05:56'),
('3954897f-b171-4426-8f99-7681013d7777', 'e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Laravel', NULL, 4, '2025-07-15 18:39:12', '2025-07-15 18:39:12'),
('39cec734-83d2-4a4f-b6d5-227a2d1ee906', 'eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Gulp & Grunt', NULL, 3, '2025-07-15 18:35:24', '2025-07-15 18:35:24'),
('3a0abc2d-9351-447f-98a8-5116625b8932', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'TensorFlow', NULL, 3, '2025-07-07 02:55:32', '2025-07-07 02:55:32'),
('3b261894-8974-4c74-9790-a6833456dfd8', '689644aa-b326-4c62-a2d8-e2f0eeae6cdd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Design Systems', NULL, 3, '2025-06-28 21:28:40', '2025-06-28 21:28:40'),
('3b80e695-d549-4995-968e-b78d958fe525', '705f1caf-e70c-4f0c-9f2d-606b32a0bc9f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Jenkins', NULL, 3, '2025-06-28 21:28:18', '2025-06-28 21:28:18'),
('3d2d3d63-34a4-4e49-b1f3-22e2e85b6579', '420e2351-e947-42c2-81e6-c1c683d56acb', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Prototyping', NULL, 4, '2025-07-07 02:56:08', '2025-07-07 02:56:08'),
('3e8b0cd8-f520-41e9-9f12-dcb3a3b10b93', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'SASS/SCSS', NULL, 4, '2025-07-07 02:55:27', '2025-07-07 02:55:27'),
('3feda424-5e42-48cf-9a20-7f1dd56a399d', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Deep Learning', NULL, 3, '2025-06-28 21:28:13', '2025-06-28 21:28:13'),
('40cf7811-aaf7-47df-8eec-186e1c8ba9c2', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'PostgreSQL', NULL, 4, '2025-06-28 21:28:01', '2025-06-28 21:28:01'),
('4145387b-df93-40a2-803b-e8891db3ccd7', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Django', NULL, 3, '2025-07-07 02:55:21', '2025-07-07 02:55:21'),
('426bb066-40b9-46ce-9a86-4ffc03e6fd66', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Vue.js', NULL, 4, '2025-06-28 21:27:58', '2025-06-28 21:27:58'),
('428a0167-bb6e-40a7-b01c-e24b553ed6c8', '2a500bf5-7509-4052-bc9c-88f58e868f6b', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'OWASP', NULL, 3, '2025-06-28 21:28:24', '2025-06-28 21:28:24'),
('4492a0c0-4ed5-4278-acdd-cd67ed6999a0', '5f6325aa-3f68-4603-b960-f747d235d444', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'NFTs', NULL, 3, '2025-06-28 21:28:23', '2025-06-28 21:28:23'),
('45bd9832-b7b7-40ca-951c-d78bd5ddd1bf', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Deep Learning', NULL, 3, '2025-07-07 02:55:38', '2025-07-07 02:55:38'),
('45cdfca2-2b9e-4dc0-8311-db31347e9fd7', '5bced85c-eb5c-499b-93a0-4aeed42381fc', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Monitoring', NULL, 3, '2025-06-28 21:28:34', '2025-06-28 21:28:34'),
('48aa54df-8d4b-4664-991d-ac7e01ff6d15', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Vue.js', NULL, 4, '2025-07-07 02:55:17', '2025-07-07 02:55:17'),
('491efe1c-8352-4373-8796-b1efc70f339c', '049e1334-35ad-405e-aaac-fe07de69a5c6', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Ethereum', NULL, 3, '2025-07-07 02:55:47', '2025-07-07 02:55:47'),
('49e7f716-02e5-4470-8fdb-98a7789cdf55', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'JavaScript', NULL, 5, '2025-07-07 02:55:16', '2025-07-07 02:55:16'),
('4a6766e0-dd23-4580-abd5-4ad22bd5ca24', 'e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Microservices Architecture', NULL, 3, '2025-07-15 18:44:17', '2025-07-15 18:44:17'),
('4b0be3f4-7a37-433a-bfb1-476baeba8806', 'eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'ESLint / Prettier', NULL, 3, '2025-07-15 18:37:50', '2025-07-15 18:37:50'),
('4b60d49c-dcbb-4f17-88a7-dd4dcee11017', '63022624-6f6b-459e-9c42-021e48673483', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Canva', NULL, 3, '2025-07-10 05:49:34', '2025-07-10 05:49:34'),
('4c6b604d-8827-4a52-80b6-94d823c342ba', '2a1c0622-1b47-44db-8fe7-99c969e747f2', '033f0150-6671-41e5-a968-ff40e9f07f26', 'MVC', NULL, 5, '2025-06-28 13:01:53', '2025-06-28 13:01:53'),
('4d99015b-c7e0-4dd1-84ff-03d89997b1fa', '7658dc9f-4c70-4c36-a410-672340912892', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Time Management', NULL, 3, '2025-07-10 05:56:29', '2025-07-10 05:56:29'),
('4d9eec9f-fc47-4281-a012-a63bc7331c42', '1fe413e5-55cd-4e7e-8340-d386621a8039', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Performance Optimization', NULL, 4, '2025-07-07 02:56:03', '2025-07-07 02:56:03'),
('4e4c0550-641d-430a-84ee-5775eee63b5c', '9a57c579-ab69-47a0-ac08-2ec427ffc5e1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Kotlin', NULL, 3, '2025-07-07 02:55:30', '2025-07-07 02:55:30'),
('4e8d405b-99c3-418f-9379-17563ad7113d', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Matplotlib', NULL, 4, '2025-06-28 21:28:12', '2025-06-28 21:28:12'),
('5039c186-12ab-4820-8090-a87c78468c5f', '5f6325aa-3f68-4603-b960-f747d235d444', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Hyperledger', NULL, 2, '2025-06-28 21:28:21', '2025-06-28 21:28:21'),
('51401f46-46a3-4e58-b119-a38982b43f6c', 'eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Bootstrap', NULL, 5, '2025-07-15 18:35:01', '2025-07-15 18:35:01'),
('51a89314-1dca-47df-aedf-b59d96bbddd6', 'e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'JWT / OAuth2', NULL, 3, '2025-07-15 18:40:53', '2025-07-15 18:40:53'),
('51bd2e46-0048-4174-a85f-d52f486f99db', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'SpaCy', NULL, 3, '2025-06-28 21:28:11', '2025-06-28 21:28:11'),
('51e0367a-640d-420f-b63a-eeddb55fe1db', 'd228136a-3f18-4de2-a9f1-d1fb4419986e', '033f0150-6671-41e5-a968-ff40e9f07f26', 'AVFoundation', NULL, 5, '2025-06-28 13:02:55', '2025-06-28 13:02:55'),
('51e1a10f-5ae9-46dc-88e2-f1077114b28b', '705f1caf-e70c-4f0c-9f2d-606b32a0bc9f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'GitLab CI/CD', NULL, 3, '2025-06-28 21:28:19', '2025-06-28 21:28:19'),
('525585a4-abcb-475f-b9f7-6bed5cad19ed', 'ef159a39-1cfe-4dd5-95c0-933d40ab8da6', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Big Data', NULL, 3, '2025-06-28 21:28:29', '2025-06-28 21:28:29'),
('538ee64b-a3f8-4b5c-8b0b-99566de52f3f', '705f1caf-e70c-4f0c-9f2d-606b32a0bc9f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Docker', NULL, 4, '2025-06-28 21:28:17', '2025-06-28 21:28:17'),
('54826686-728a-4f5a-aaeb-72e76869f0c0', 'ef159a39-1cfe-4dd5-95c0-933d40ab8da6', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Jupyter Notebooks', NULL, 4, '2025-06-28 21:28:33', '2025-06-28 21:28:33'),
('555a0894-9efe-4a73-8068-2a259266085a', '9a57c579-ab69-47a0-ac08-2ec427ffc5e1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Xamarin', NULL, 2, '2025-07-07 02:55:31', '2025-07-07 02:55:31'),
('569cbc12-09b7-437f-9497-f398943ec44c', 'fc29a629-f032-4241-b73d-c766d198d251', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Swift', NULL, 3, '2025-06-28 21:28:06', '2025-06-28 21:28:06'),
('569cda25-66cd-4ddc-a326-5108aad393a6', '6e923f02-e551-45f0-9419-613ce9f7898c', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Firebase', NULL, 4, '2025-06-28 11:55:59', '2025-06-28 11:55:59'),
('56a7fd45-f3fb-4172-b080-777fd442b259', '2979ec3a-500e-4dcf-b4ec-4d5179578534', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Scheduling & Calendar Management', NULL, 3, '2025-07-10 06:09:19', '2025-07-10 06:09:19'),
('5859b62f-c07f-4c74-b1c0-7f66f83d2dd4', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'REST APIs', NULL, 5, '2025-07-07 02:55:25', '2025-07-07 02:55:25'),
('58ab00cc-9ec4-47a8-8b16-7b6b2e27ca3e', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'MySQL', NULL, 4, '2025-07-07 02:55:23', '2025-07-07 02:55:23'),
('5a1c559e-ec79-4b99-a86a-37a8011c3911', '2a1c0622-1b47-44db-8fe7-99c969e747f2', '033f0150-6671-41e5-a968-ff40e9f07f26', 'Modular', NULL, 5, '2025-06-28 13:01:31', '2025-06-28 13:01:31'),
('5a6eab33-3d9b-4b74-90e6-03d500458fe7', 'd228136a-3f18-4de2-a9f1-d1fb4419986e', '033f0150-6671-41e5-a968-ff40e9f07f26', 'CloudKit', NULL, 5, '2025-06-28 13:03:11', '2025-06-28 13:03:11'),
('5acddcd2-ea2f-45bd-942b-69b7423d7294', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Redux', NULL, 4, '2025-06-28 21:28:03', '2025-06-28 21:28:03'),
('5ccdf269-1bb7-47a0-ad68-b985337fa3b6', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'PHP', NULL, 4, '2025-07-07 02:55:18', '2025-07-07 02:55:18'),
('5eea4c0d-0ce0-4515-85f7-ec21da5aac52', '7658dc9f-4c70-4c36-a410-672340912892', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Storytelling', NULL, 3, '2025-07-10 05:57:26', '2025-07-10 05:57:26'),
('5eec2058-45a8-4e27-ba21-b4ca310abdbe', '1fe413e5-55cd-4e7e-8340-d386621a8039', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Monitoring', NULL, 3, '2025-07-07 02:56:02', '2025-07-07 02:56:02'),
('5fc87ce7-4861-4453-be89-a8b99d3b95f1', 'fc29a629-f032-4241-b73d-c766d198d251', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'React Native', NULL, 4, '2025-06-28 21:28:05', '2025-06-28 21:28:05'),
('600e41df-523e-42ed-8034-c15f3831933c', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'TypeScript', NULL, 4, '2025-06-28 21:27:57', '2025-06-28 21:27:57'),
('609f3047-425f-4bc4-8c8a-a17a2ffb2885', 'd228136a-3f18-4de2-a9f1-d1fb4419986e', '033f0150-6671-41e5-a968-ff40e9f07f26', 'CoreData', NULL, 4, '2025-06-28 13:02:40', '2025-06-28 13:02:40'),
('6146a2dd-6026-4a51-a580-9cb5e6007db3', 'eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Tailwind', NULL, 3, '2025-07-15 18:34:52', '2025-07-15 18:34:52'),
('62d93626-9c8c-4d0e-99eb-5b4901a0dd5b', 'fc29a629-f032-4241-b73d-c766d198d251', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Java', NULL, 3, '2025-06-28 21:28:07', '2025-06-28 21:28:07'),
('62e21ded-f183-458c-bf1b-15ef6bf30b86', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'NLTK', NULL, 3, '2025-06-28 21:28:10', '2025-06-28 21:28:10'),
('635b0f0c-f220-442a-88dd-1e1720bff70b', '705f1caf-e70c-4f0c-9f2d-606b32a0bc9f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Ansible', NULL, 3, '2025-06-28 21:28:18', '2025-06-28 21:28:18'),
('63dd7135-8d76-4f58-a7a2-2c3855b1cb76', '2979ec3a-500e-4dcf-b4ec-4d5179578534', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Verbal Communication', NULL, 3, '2025-07-10 06:08:22', '2025-07-10 06:08:22'),
('6601e753-5853-4353-b751-ecc7a7702d0d', '63022624-6f6b-459e-9c42-021e48673483', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Adobe XD', NULL, 3, '2025-07-10 05:49:55', '2025-07-10 05:49:55'),
('660abb41-3548-41e8-ad7c-43520e5e649b', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'React', NULL, 5, '2025-06-28 21:27:56', '2025-06-28 21:27:56'),
('67074833-2831-45fe-b563-ccd0653eeba0', '420e2351-e947-42c2-81e6-c1c683d56acb', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Responsive Design', NULL, 4, '2025-07-07 02:56:10', '2025-07-07 02:56:10'),
('6792dae7-e3eb-44b6-9041-aa63cf17eede', '705f1caf-e70c-4f0c-9f2d-606b32a0bc9f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'AWS', NULL, 4, '2025-06-28 21:28:15', '2025-06-28 21:28:15'),
('68934a34-87b3-4f14-9572-633476fad45e', '9a57c579-ab69-47a0-ac08-2ec427ffc5e1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Ionic', NULL, 3, '2025-07-07 02:55:32', '2025-07-07 02:55:32'),
('69ac4786-4b7f-4e61-af05-6b3136252eba', '5bced85c-eb5c-499b-93a0-4aeed42381fc', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Performance Optimization', NULL, 4, '2025-06-28 21:28:35', '2025-06-28 21:28:35'),
('6a375e56-71e2-4dcd-b086-5a4f43536bc9', 'e44b8a36-6e77-4caf-82c1-7346cad60c0b', '033f0150-6671-41e5-a968-ff40e9f07f26', 'Xcode', NULL, 5, '2025-06-28 13:04:19', '2025-06-28 13:04:19'),
('6aa21b50-2f5a-4e04-bdd7-709c15e53aec', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Next.js', NULL, 4, '2025-06-28 21:27:58', '2025-06-28 21:27:58'),
('6ac95a8b-2c58-4699-adad-c70b9107f95a', '40f9e0ef-d153-4f64-9a8c-ffd39c525e1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Jenkins', NULL, 3, '2025-07-07 02:55:45', '2025-07-07 02:55:45'),
('6c53b418-9e1f-46d6-86d3-ceec1969557e', 'ef159a39-1cfe-4dd5-95c0-933d40ab8da6', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Predictive Modeling', NULL, 3, '2025-06-28 21:28:29', '2025-06-28 21:28:29'),
('6cd1cfe9-c2d3-4fc4-b8b6-e960aee73bcc', 'eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'NextJs', NULL, 3, '2025-07-15 18:34:00', '2025-07-15 18:34:00'),
('6d675de3-bc0b-4d5a-975b-b25683a2c5ef', '1fe413e5-55cd-4e7e-8340-d386621a8039', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Disaster Recovery', NULL, 3, '2025-07-07 02:56:04', '2025-07-07 02:56:04'),
('6eaebd32-4587-48cf-8c4e-8e0728c78cc1', 'ef159a39-1cfe-4dd5-95c0-933d40ab8da6', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Apache Spark', NULL, 3, '2025-06-28 21:28:30', '2025-06-28 21:28:30'),
('729b3607-5b00-4bc2-80e0-86d6d47c2dd4', '5f6325aa-3f68-4603-b960-f747d235d444', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'DeFi', NULL, 3, '2025-06-28 21:28:23', '2025-06-28 21:28:23'),
('74abf426-5bdf-4483-a65a-8227e8075e6a', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Bootstrap', NULL, 4, '2025-07-07 02:55:26', '2025-07-07 02:55:26'),
('75a98451-558e-4ffc-aad0-84861513659b', 'e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Doppler', NULL, 3, '2025-07-15 18:45:37', '2025-07-15 18:45:37'),
('7694888b-c0b6-4984-987a-8a34d2979f68', '7658dc9f-4c70-4c36-a410-672340912892', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Problem Solving', NULL, 3, '2025-07-10 05:55:17', '2025-07-10 05:55:17'),
('76d70b96-3d84-4ad5-9d09-bf7a2b115d9c', 'ef159a39-1cfe-4dd5-95c0-933d40ab8da6', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Data Analysis', NULL, 4, '2025-06-28 21:28:27', '2025-06-28 21:28:27'),
('794b26aa-75ad-4a91-9628-7b45af1b583e', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'NumPy', NULL, 4, '2025-06-28 21:28:11', '2025-06-28 21:28:11'),
('7c93da33-d5a9-49af-9508-a11f087c023c', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Natural Language Processing', NULL, 3, '2025-06-28 21:28:14', '2025-06-28 21:28:14'),
('7d20db62-75e3-47db-b702-4250ac22692e', '40f9e0ef-d153-4f64-9a8c-ffd39c525e1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'AWS', NULL, 4, '2025-07-07 02:55:40', '2025-07-07 02:55:40'),
('7d3d9b81-9f28-4a6b-a8ee-3bf48b0bf5eb', '40f9e0ef-d153-4f64-9a8c-ffd39c525e1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'GitHub Actions', NULL, 3, '2025-07-07 02:55:46', '2025-07-07 02:55:46'),
('7dd9b6f8-6716-4d8f-b67e-d96722581c7d', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'TypeScript', NULL, 4, '2025-07-07 02:55:16', '2025-07-07 02:55:16'),
('7ec2455a-574b-4b89-a325-60e1fea0b5cd', '689644aa-b326-4c62-a2d8-e2f0eeae6cdd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Accessibility', NULL, 3, '2025-06-28 21:28:41', '2025-06-28 21:28:41'),
('82777c1f-7169-45fd-8fd4-3473e1e925d6', '061c28f6-aa41-4066-aa8c-767e5e5027ee', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Predictive Modeling', NULL, 3, '2025-07-07 02:55:57', '2025-07-07 02:55:57'),
('829792b3-49dc-432c-8231-4229f8fc2d1a', '6e923f02-e551-45f0-9419-613ce9f7898c', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Docker', NULL, 4, '2025-06-28 11:55:59', '2025-06-28 11:55:59'),
('82c8d540-c93f-4bcd-98f7-d287191318db', 'fc29a629-f032-4241-b73d-c766d198d251', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Flutter', NULL, 3, '2025-06-28 21:28:06', '2025-06-28 21:28:06'),
('83a258c1-11dc-4674-9b10-07fa8474e8cc', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'TensorFlow', NULL, 3, '2025-06-28 21:28:08', '2025-06-28 21:28:08'),
('83da5ee1-4921-4d12-a614-de4a688d2196', 'e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Lambda functions', NULL, 3, '2025-07-15 18:44:28', '2025-07-15 18:44:28'),
('8522149a-171b-432c-9eff-9ec8fcb7fd12', 'c5760f9a-c91d-4321-a2fb-247802ca585a', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Network Security', NULL, 3, '2025-07-07 02:55:53', '2025-07-07 02:55:53'),
('86a1e9a6-eba9-4473-8663-af7182389e7a', '689644aa-b326-4c62-a2d8-e2f0eeae6cdd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'User Research', NULL, 3, '2025-06-28 21:28:39', '2025-06-28 21:28:39'),
('895c9712-32cb-4e10-adc3-5e5a02b90f31', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Seaborn', NULL, 3, '2025-06-28 21:28:12', '2025-06-28 21:28:12'),
('89ca2d08-c0e2-490e-990b-53d208f14f78', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'React', NULL, 5, '2025-07-07 02:55:15', '2025-07-07 02:55:15'),
('8a024e9e-b8df-40fe-81e4-00325a969e8c', '2a1c0622-1b47-44db-8fe7-99c969e747f2', '033f0150-6671-41e5-a968-ff40e9f07f26', 'Clean Architecture', NULL, 5, '2025-06-28 13:02:04', '2025-06-28 13:02:04'),
('8cd8152a-2597-45b7-ac26-6a34543bba04', '2a1c0622-1b47-44db-8fe7-99c969e747f2', '033f0150-6671-41e5-a968-ff40e9f07f26', 'VIPER', NULL, 5, '2025-06-28 13:01:45', '2025-06-28 13:01:45'),
('8cfed001-ccd4-4c0e-b23d-ef1d8b2a5b16', '705f1caf-e70c-4f0c-9f2d-606b32a0bc9f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'GitHub Actions', NULL, 3, '2025-06-28 21:28:19', '2025-06-28 21:28:19'),
('8e31db71-2a51-4fdc-9fa3-7a034b3c1d95', '40f9e0ef-d153-4f64-9a8c-ffd39c525e1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Terraform', NULL, 3, '2025-07-07 02:55:44', '2025-07-07 02:55:44'),
('8ed740f6-f996-409c-9df0-4cf62c2f1347', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'JavaScript', NULL, 5, '2025-06-28 21:27:57', '2025-06-28 21:27:57'),
('8f883e0e-7612-47eb-936c-675e1e74abfa', '061c28f6-aa41-4066-aa8c-767e5e5027ee', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Big Data', NULL, 3, '2025-07-07 02:55:57', '2025-07-07 02:55:57'),
('8fab029f-6b8c-4b44-a6ee-49d6fb118f69', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Scikit-learn', NULL, 4, '2025-07-07 02:55:33', '2025-07-07 02:55:33'),
('9019b128-7511-48ab-90ae-35331e904165', 'c5760f9a-c91d-4321-a2fb-247802ca585a', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Incident Response', NULL, 3, '2025-07-07 02:55:54', '2025-07-07 02:55:54'),
('933c366e-a6db-4680-ba70-2272909be397', '18544731-2da4-4bc7-b282-87d5d4ec62d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'MySql', NULL, 4, '2025-07-15 18:42:35', '2025-07-15 18:42:35'),
('93efd46b-a3b7-4cd0-a668-8813dcfcaf55', '049e1334-35ad-405e-aaac-fe07de69a5c6', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'IPFS', NULL, 2, '2025-07-07 02:55:49', '2025-07-07 02:55:49'),
('96727ff6-29dd-4662-b9ce-abc94b5ac9fd', '049e1334-35ad-405e-aaac-fe07de69a5c6', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'DeFi', NULL, 3, '2025-07-07 02:55:50', '2025-07-07 02:55:50'),
('9688addb-4522-4cfb-b2c7-54a1e918addb', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'MySQL', NULL, 4, '2025-06-28 21:28:02', '2025-06-28 21:28:02'),
('9952d679-c016-4952-8435-ee12665897de', '2a500bf5-7509-4052-bc9c-88f58e868f6b', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Security Auditing', NULL, 3, '2025-06-28 21:28:24', '2025-06-28 21:28:24'),
('9996ce23-2c14-4c8e-a434-5cbcb0233ca7', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Machine Learning', NULL, 4, '2025-07-07 02:55:38', '2025-07-07 02:55:38'),
('9af87b1a-4717-40d1-ae36-b78f5c5cd479', '5bced85c-eb5c-499b-93a0-4aeed42381fc', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Disaster Recovery', NULL, 3, '2025-06-28 21:28:36', '2025-06-28 21:28:36'),
('9b6acb54-c7ac-4a9b-823b-e339e279b54c', 'eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'SASS / SCSS', NULL, 4, '2025-07-15 18:36:38', '2025-07-15 18:36:38'),
('9b8b4145-588c-4362-af0a-850b7282b00a', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Computer Vision', NULL, 3, '2025-06-28 21:28:14', '2025-06-28 21:28:14'),
('9b8dfbc5-c749-46a2-b4ed-763173abbcba', '2a500bf5-7509-4052-bc9c-88f58e868f6b', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Application Security', NULL, 3, '2025-06-28 21:28:26', '2025-06-28 21:28:26'),
('9cabe8ea-01fc-44cd-974e-54ac125afeb3', '689644aa-b326-4c62-a2d8-e2f0eeae6cdd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Sketch', NULL, 3, '2025-06-28 21:28:38', '2025-06-28 21:28:38'),
('9d45c1d4-68b0-4eff-8765-3d11baa09a39', 'd228136a-3f18-4de2-a9f1-d1fb4419986e', '033f0150-6671-41e5-a968-ff40e9f07f26', 'Combine', NULL, 5, '2025-06-28 13:02:32', '2025-06-28 13:02:32'),
('a130955c-6b8c-4302-ab50-7e61d4938080', 'ef159a39-1cfe-4dd5-95c0-933d40ab8da6', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Data Visualization', NULL, 4, '2025-06-28 21:28:28', '2025-06-28 21:28:28'),
('a729f891-c076-43e4-b842-e777b7e837cf', '061c28f6-aa41-4066-aa8c-767e5e5027ee', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Tableau', NULL, 3, '2025-07-07 02:55:59', '2025-07-07 02:55:59'),
('a856a820-aa9f-4b4b-9920-a228d482002b', '420e2351-e947-42c2-81e6-c1c683d56acb', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Sketch', NULL, 3, '2025-07-07 02:56:06', '2025-07-07 02:56:06'),
('a8d6177c-dd27-4a61-97b9-0a723c6a44fd', '6e923f02-e551-45f0-9419-613ce9f7898c', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Vercel / Netlify', NULL, 3, '2025-07-15 18:47:46', '2025-07-15 18:47:46'),
('a982b097-336f-490d-b1d3-71c7f67ee25f', 'eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'TypeScript', NULL, 3, '2025-07-15 18:36:29', '2025-07-15 18:36:29'),
('aa730b32-1953-492b-86fa-6b73c627e9b9', 'ef159a39-1cfe-4dd5-95c0-933d40ab8da6', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Tableau', NULL, 3, '2025-06-28 21:28:31', '2025-06-28 21:28:31'),
('aaa11464-b505-4647-ada5-9f5291a4c029', '689644aa-b326-4c62-a2d8-e2f0eeae6cdd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Figma', NULL, 4, '2025-06-28 21:28:37', '2025-06-28 21:28:37'),
('ab4b0db9-9724-46c4-b72c-2e20e6a572d8', 'deea4f02-217b-43b1-94ef-db7f58e73949', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Responsive Design', NULL, 4, '2025-06-28 11:56:35', '2025-06-28 11:56:35'),
('ab60c623-44c6-49d3-be23-3d837888766c', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'GraphQL', NULL, 3, '2025-07-07 02:55:24', '2025-07-07 02:55:24'),
('acbb53d2-6ab2-4f98-abbf-cb6af6e34919', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'GraphQL', NULL, 3, '2025-06-28 21:28:02', '2025-06-28 21:28:02'),
('acedfb48-f5e7-4b90-8110-0bb1f08f6762', 'c5760f9a-c91d-4321-a2fb-247802ca585a', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Security Auditing', NULL, 3, '2025-07-07 02:55:51', '2025-07-07 02:55:51'),
('ad0c11be-ed87-449d-ba24-4b2331b9daa3', '6e923f02-e551-45f0-9419-613ce9f7898c', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Sentry / Datadog / New Relic', NULL, 3, '2025-07-15 18:48:42', '2025-07-15 18:48:42'),
('adb139e2-f6c0-4e9a-96e6-8fd9f954d05e', '5f6325aa-3f68-4603-b960-f747d235d444', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Ethereum', NULL, 3, '2025-06-28 21:28:20', '2025-06-28 21:28:20'),
('adc66d84-cf56-4be1-b357-976074ef18c4', 'e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'NestJs', NULL, 3, '2025-07-15 18:40:27', '2025-07-15 18:40:27'),
('ae5a958d-28df-4026-879b-388f22e33f10', 'e44b8a36-6e77-4caf-82c1-7346cad60c0b', '033f0150-6671-41e5-a968-ff40e9f07f26', 'Swift Package Manager', NULL, 5, '2025-06-28 13:06:04', '2025-06-28 13:06:04'),
('af9f7f86-0edf-4c27-b6b6-ed22125bff8f', '061c28f6-aa41-4066-aa8c-767e5e5027ee', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Hadoop', NULL, 2, '2025-07-07 02:55:58', '2025-07-07 02:55:58'),
('b1cc9c55-16fb-43c2-89c7-042998e6fde1', '1fe413e5-55cd-4e7e-8340-d386621a8039', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Infrastructure as Code', NULL, 3, '2025-07-07 02:56:01', '2025-07-07 02:56:01'),
('b2904b45-de4c-43e4-ab07-6b5983a67566', 'f10fee01-c447-4fdf-b206-07bd6f76fc9a', '033f0150-6671-41e5-a968-ff40e9f07f26', 'Swift', NULL, 5, '2025-06-28 12:59:38', '2025-06-28 12:59:38'),
('b2e5030a-9e64-4993-b36d-e7c0b32e26c3', '40f9e0ef-d153-4f64-9a8c-ffd39c525e1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Azure', NULL, 3, '2025-07-07 02:55:41', '2025-07-07 02:55:41'),
('b525036f-dbea-4708-b6fe-470ee03ac434', 'e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Flask', NULL, 3, '2025-07-15 18:40:35', '2025-07-15 18:40:35'),
('b532c0ee-c7c0-4d57-ae12-cb992574da63', '1fe413e5-55cd-4e7e-8340-d386621a8039', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Logging', NULL, 3, '2025-07-07 02:56:02', '2025-07-07 02:56:02'),
('b6ba6e7c-04f8-4a6c-95e6-02b826614f60', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Laravel', NULL, 4, '2025-07-07 02:55:20', '2025-07-07 02:55:20'),
('b72184c5-2f2c-4052-8252-69f601df3d6b', '061c28f6-aa41-4066-aa8c-767e5e5027ee', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Data Analysis', NULL, 4, '2025-07-07 02:55:55', '2025-07-07 02:55:55'),
('b8626f0d-7309-4beb-9a21-f47888511fbd', '049e1334-35ad-405e-aaac-fe07de69a5c6', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Web3.js', NULL, 3, '2025-07-07 02:55:48', '2025-07-07 02:55:48'),
('b8eaa3a7-0c04-417d-8f27-1496748f6bd6', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Pandas', NULL, 4, '2025-07-07 02:55:35', '2025-07-07 02:55:35'),
('b8fa576a-d10a-4527-b95b-8d47ba49d1a6', 'f10fee01-c447-4fdf-b206-07bd6f76fc9a', '033f0150-6671-41e5-a968-ff40e9f07f26', 'SwiftUI', NULL, 4, '2025-06-28 12:59:46', '2025-06-28 12:59:46'),
('b9232ed9-6bbb-44a2-9cb1-a30abd5b1de1', '2a500bf5-7509-4052-bc9c-88f58e868f6b', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Incident Response', NULL, 3, '2025-06-28 21:28:26', '2025-06-28 21:28:26'),
('b9a0291c-e1d4-46a6-999a-df0920d6629e', '2a500bf5-7509-4052-bc9c-88f58e868f6b', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Network Security', NULL, 3, '2025-06-28 21:28:25', '2025-06-28 21:28:25'),
('baaff418-f395-44a0-b8fe-53b433139c22', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Angular', NULL, 3, '2025-06-28 21:27:59', '2025-06-28 21:27:59'),
('bb7487f0-7e17-49d3-931a-ecc6f537028f', '6e923f02-e551-45f0-9419-613ce9f7898c', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Ec2 | Route 53 | RDS', NULL, 3, '2025-07-15 18:48:11', '2025-07-15 18:48:11'),
('bbb22c35-2714-4b0f-9db5-b7f16b8751fa', '061c28f6-aa41-4066-aa8c-767e5e5027ee', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Data Visualization', NULL, 4, '2025-07-07 02:55:56', '2025-07-07 02:55:56'),
('bc00688f-a114-4417-9533-9acfc708aa4e', '63022624-6f6b-459e-9c42-021e48673483', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Responsive Design', NULL, 3, '2025-07-10 05:50:49', '2025-07-10 05:50:49'),
('bd7ae219-f288-40df-9913-1844601283c6', '40f9e0ef-d153-4f64-9a8c-ffd39c525e1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Ansible', NULL, 3, '2025-07-07 02:55:44', '2025-07-07 02:55:44'),
('bd84c05a-97f3-4591-937f-98de73cf4bd6', 'f10fee01-c447-4fdf-b206-07bd6f76fc9a', '033f0150-6671-41e5-a968-ff40e9f07f26', 'Objective-C', NULL, 5, '2025-06-28 13:00:00', '2025-06-28 13:00:00'),
('bf66f7f2-d896-4c7a-a7cb-beba9ce4ee49', '1fe413e5-55cd-4e7e-8340-d386621a8039', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Auto Scaling', NULL, 3, '2025-07-07 02:56:04', '2025-07-07 02:56:04'),
('bf7a1bce-db7c-45cc-ae79-adae3e34a260', 'deea4f02-217b-43b1-94ef-db7f58e73949', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Design Systems', NULL, 3, '2025-06-28 11:56:34', '2025-06-28 11:56:34'),
('bfe1cb7d-0b1c-4b11-81f1-8e51bc0b37e6', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Computer Vision', NULL, 3, '2025-07-07 02:55:39', '2025-07-07 02:55:39'),
('c322a982-0e46-4286-85b5-e21059cf4251', '705f1caf-e70c-4f0c-9f2d-606b32a0bc9f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Kubernetes', NULL, 3, '2025-06-28 21:28:17', '2025-06-28 21:28:17'),
('c3e0172a-071a-49c7-8910-e8b7d0ca44ec', '420e2351-e947-42c2-81e6-c1c683d56acb', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Figma', NULL, 4, '2025-07-07 02:56:05', '2025-07-07 02:56:05'),
('c73b8b7a-45f0-4647-9114-22a57abebc40', '689644aa-b326-4c62-a2d8-e2f0eeae6cdd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'InVision', NULL, 3, '2025-06-28 21:28:38', '2025-06-28 21:28:38'),
('c96423bc-a17e-4521-83fe-ef6f91942816', '420e2351-e947-42c2-81e6-c1c683d56acb', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'User Research', NULL, 3, '2025-07-07 02:56:07', '2025-07-07 02:56:07'),
('c9d76643-1201-4116-83e7-3152d1cb99f2', '2979ec3a-500e-4dcf-b4ec-4d5179578534', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Customer Service', NULL, 3, '2025-07-10 06:08:53', '2025-07-10 06:08:53'),
('ca3850a3-c3a5-4245-9fa0-e5f0f5b391eb', '7658dc9f-4c70-4c36-a410-672340912892', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Creativity & Visual Thinking', NULL, 4, '2025-07-10 05:55:03', '2025-07-10 05:55:03'),
('cb887997-d46a-45eb-bd92-42216e0d9a07', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Node.js', NULL, 5, '2025-06-28 21:27:57', '2025-06-28 21:27:57'),
('cc1d4738-742d-4a83-9a67-fdb43c517fd7', 'fc29a629-f032-4241-b73d-c766d198d251', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Ionic', NULL, 3, '2025-06-28 21:28:08', '2025-06-28 21:28:08'),
('cc292381-89a4-4529-843e-1c27280e4e07', '2a500bf5-7509-4052-bc9c-88f58e868f6b', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Penetration Testing', NULL, 3, '2025-06-28 21:28:23', '2025-06-28 21:28:23'),
('cde9d59b-b93a-4d1f-a37b-d76f416158c3', '40f9e0ef-d153-4f64-9a8c-ffd39c525e1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'GitLab CI/CD', NULL, 3, '2025-07-07 02:55:45', '2025-07-07 02:55:45'),
('cea513ea-4de6-46b4-8462-f7ec64feca11', 'ef159a39-1cfe-4dd5-95c0-933d40ab8da6', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Statistical Analysis', NULL, 4, '2025-06-28 21:28:28', '2025-06-28 21:28:28'),
('cfc5c582-4eb4-44f8-a2c1-28f557b30be8', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Tailwind CSS', NULL, 4, '2025-07-07 02:55:26', '2025-07-07 02:55:26'),
('d0f18e1d-e8bb-4d95-af62-5d97d214ca5c', '049e1334-35ad-405e-aaac-fe07de69a5c6', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'NFTs', NULL, 3, '2025-07-07 02:55:50', '2025-07-07 02:55:50'),
('d15740e6-a53c-4327-a3c1-08151f18f41f', '420e2351-e947-42c2-81e6-c1c683d56acb', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Accessibility', NULL, 3, '2025-07-07 02:56:10', '2025-07-07 02:56:10'),
('d38a2c9b-d85c-4a45-8b79-908e62793686', '2a1c0622-1b47-44db-8fe7-99c969e747f2', '033f0150-6671-41e5-a968-ff40e9f07f26', 'MVVM', NULL, 5, '2025-06-28 13:01:38', '2025-06-28 13:01:38'),
('d456c6eb-7bdc-443e-9633-4c456f9dc253', '6e923f02-e551-45f0-9419-613ce9f7898c', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'GitHub Actions', NULL, 3, '2025-06-28 11:56:04', '2025-06-28 11:56:04'),
('d572f6f1-47c9-41f8-b6f6-879e00c28457', 'd228136a-3f18-4de2-a9f1-d1fb4419986e', '033f0150-6671-41e5-a968-ff40e9f07f26', 'CoreML', NULL, 4, '2025-06-28 13:02:48', '2025-06-28 13:02:48'),
('d622a163-bf9d-480c-857c-af7758bb4401', '18544731-2da4-4bc7-b282-87d5d4ec62d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'MongoDB', NULL, 3, '2025-07-15 18:42:46', '2025-07-15 18:42:46'),
('d62ee796-25f8-4657-b51d-1d24a23ce308', 'c5760f9a-c91d-4321-a2fb-247802ca585a', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Penetration Testing', NULL, 3, '2025-07-07 02:55:51', '2025-07-07 02:55:51'),
('d799c9eb-4379-410f-8ab4-5225682a8a5c', '1fe413e5-55cd-4e7e-8340-d386621a8039', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'CI/CD', NULL, 4, '2025-07-07 02:56:01', '2025-07-07 02:56:01'),
('d7f16be6-7a9f-4da5-9adb-e61659e32b88', '2979ec3a-500e-4dcf-b4ec-4d5179578534', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Professionalism & First Impressions', NULL, 3, '2025-07-10 06:08:33', '2025-07-10 06:08:33'),
('da759b99-fef4-4364-bd15-e5e9574c7e32', '7658dc9f-4c70-4c36-a410-672340912892', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Adaptability', NULL, 3, '2025-07-10 05:56:53', '2025-07-10 05:56:53'),
('dba2b16f-5603-44d5-a072-9c0461700765', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'PHP', NULL, 4, '2025-06-28 21:27:59', '2025-06-28 21:27:59'),
('dbf21db2-fdfe-465c-a675-1e15fa1e3773', '2979ec3a-500e-4dcf-b4ec-4d5179578534', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Multitasking', NULL, 3, '2025-07-10 06:08:43', '2025-07-10 06:08:43'),
('dc7b2c9d-a78d-40d9-953a-02846f478874', 'eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Vite / Webpack', NULL, 3, '2025-07-15 18:37:38', '2025-07-15 18:37:38'),
('dde4cabe-af50-4718-9be1-16551f706a8c', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'NumPy', NULL, 4, '2025-07-07 02:55:36', '2025-07-07 02:55:36'),
('de76a50c-2e44-479d-a314-4a9b5cde6bf6', '420e2351-e947-42c2-81e6-c1c683d56acb', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Adobe XD', NULL, 3, '2025-07-07 02:56:06', '2025-07-07 02:56:06'),
('df6e1e57-238a-40ec-bee9-805c47fce8e6', 'e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'NodeJs', NULL, 4, '2025-07-15 18:39:20', '2025-07-15 18:39:20'),
('e00a600c-498e-4b8a-91af-dcc0a7e67d06', '5bced85c-eb5c-499b-93a0-4aeed42381fc', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Infrastructure as Code', NULL, 3, '2025-06-28 21:28:34', '2025-06-28 21:28:34'),
('e03fd906-eb07-4ba0-b27a-3e1d10590881', 'deea4f02-217b-43b1-94ef-db7f58e73949', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Prototyping', NULL, 4, '2025-06-28 11:56:33', '2025-06-28 11:56:33'),
('e0551d52-f406-4814-8f7f-cf605080339e', '061c28f6-aa41-4066-aa8c-767e5e5027ee', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Apache Spark', NULL, 3, '2025-07-07 02:55:58', '2025-07-07 02:55:58'),
('e1b5f112-b3d5-4b39-9a2f-46adf503f877', '7658dc9f-4c70-4c36-a410-672340912892', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Attention to Detail', NULL, 3, '2025-07-10 05:57:10', '2025-07-10 05:57:10'),
('e3172020-35f7-4fda-8f90-f54db2b66922', '420e2351-e947-42c2-81e6-c1c683d56acb', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Design Systems', NULL, 3, '2025-07-07 02:56:09', '2025-07-07 02:56:09'),
('e4aafa6f-577b-431d-ab12-17c015948729', '1fe413e5-55cd-4e7e-8340-d386621a8039', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Load Balancing', NULL, 3, '2025-07-07 02:56:03', '2025-07-07 02:56:03'),
('e60d8e50-4a98-4bbc-a7da-9ce0ed87da76', 'eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Javascript Es6', NULL, 4, '2025-07-15 18:34:48', '2025-07-15 18:34:48'),
('e6561d1b-bb73-4002-b713-4b10d9d71815', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Angular', NULL, 3, '2025-07-07 02:55:18', '2025-07-07 02:55:18'),
('e6cc7cc7-06f9-479f-adf7-663802c59778', 'c5760f9a-c91d-4321-a2fb-247802ca585a', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Cryptography', NULL, 3, '2025-07-07 02:55:52', '2025-07-07 02:55:52'),
('e8c79e02-eb67-4b32-88d5-77c5be9c1c40', '40f9e0ef-d153-4f64-9a8c-ffd39c525e1b', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Google Cloud', NULL, 3, '2025-07-07 02:55:41', '2025-07-07 02:55:41'),
('e9b551fb-350b-4183-ae7f-3253d9746d0b', 'c5760f9a-c91d-4321-a2fb-247802ca585a', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Threat Modeling', NULL, 3, '2025-07-07 02:55:55', '2025-07-07 02:55:55'),
('ea8232a2-6b07-4d22-8b07-900cc4d0d544', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'NLTK', NULL, 3, '2025-07-07 02:55:34', '2025-07-07 02:55:34'),
('eade18c5-295d-4af6-9dee-f4662f5f8436', 'eecc9c84-4b27-4b86-930a-6050bd877abf', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Html5 / Css3', NULL, 4, '2025-07-15 18:35:09', '2025-07-15 18:35:09'),
('eb3a9369-025d-4fb7-89a7-7d0b79f90b9c', 'ef159a39-1cfe-4dd5-95c0-933d40ab8da6', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Hadoop', NULL, 2, '2025-06-28 21:28:30', '2025-06-28 21:28:30'),
('ebb77d1a-72b7-4d2d-af2a-a2d6058a383d', '2979ec3a-500e-4dcf-b4ec-4d5179578534', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Conflict Resolution', NULL, 3, '2025-07-10 06:09:07', '2025-07-10 06:09:07'),
('ebf8574c-1369-4987-952f-d3755fb7790a', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Next.js', NULL, 4, '2025-07-07 02:55:17', '2025-07-07 02:55:17'),
('ec117dd1-2e3c-4977-945f-6d93a5de3198', '061c28f6-aa41-4066-aa8c-767e5e5027ee', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Jupyter Notebooks', NULL, 4, '2025-07-07 02:56:00', '2025-07-07 02:56:00'),
('ec241a87-5b03-4c35-9ce7-e203f9cd4594', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Seaborn', NULL, 3, '2025-07-07 02:55:37', '2025-07-07 02:55:37'),
('ed3caeda-f40e-4300-b4ed-764eae8f5fbe', '63022624-6f6b-459e-9c42-021e48673483', '94b101ed-9705-4a18-b25b-ef7376ad0550', 'Wireframing', NULL, 3, '2025-07-10 05:50:28', '2025-07-10 05:50:28'),
('ef42593b-df2d-48e7-b391-d9cdfcbb86d2', '18544731-2da4-4bc7-b282-87d5d4ec62d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'PostgreSql', NULL, 3, '2025-07-15 18:42:42', '2025-07-15 18:42:42'),
('eff6da4f-6d64-4a06-88f9-0a113397ec77', '5bced85c-eb5c-499b-93a0-4aeed42381fc', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Logging', NULL, 3, '2025-06-28 21:28:35', '2025-06-28 21:28:35'),
('f1c0dedc-5db2-487e-bdc0-efed11dea398', '420e2351-e947-42c2-81e6-c1c683d56acb', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Wireframing', NULL, 4, '2025-07-07 02:56:08', '2025-07-07 02:56:08'),
('f2982f90-bbdd-4433-8cdc-c844cf670336', 'ef159a39-1cfe-4dd5-95c0-933d40ab8da6', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Power BI', NULL, 3, '2025-06-28 21:28:31', '2025-06-28 21:28:31'),
('f3fa87a0-6001-4bf9-9201-7a8dba9c2e3d', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'MongoDB', NULL, 4, '2025-06-28 21:28:01', '2025-06-28 21:28:01'),
('f40865d9-1129-4b00-b1ce-d962d270b750', 'd9bfd19d-1617-4d5b-aff3-92f367a39fd5', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Matplotlib', NULL, 4, '2025-07-07 02:55:37', '2025-07-07 02:55:37'),
('f788ee98-6c68-4f2c-822a-d5eebf8a8369', '8e96087e-f6b6-48b3-b6d2-5fad76fd97aa', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Laravel', NULL, 4, '2025-06-28 21:28:00', '2025-06-28 21:28:00'),
('f7972bc1-d81f-4ef7-9138-a11a4c4d2426', 'e48ff555-d996-4034-af55-26d0aaff26d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'Python', NULL, 3, '2025-07-15 18:39:24', '2025-07-15 18:39:24');
INSERT INTO `tech_skills` (`id`, `tech_id`, `user_id`, `name`, `icon`, `level`, `created_at`, `updated_at`) VALUES
('f7ebd065-de90-45da-b548-6719a4f86970', '9a57c579-ab69-47a0-ac08-2ec427ffc5e1', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Flutter', NULL, 3, '2025-07-07 02:55:29', '2025-07-07 02:55:29'),
('fb2032c9-ac23-4d86-9e03-c69fbf672483', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Redux', NULL, 4, '2025-07-07 02:55:25', '2025-07-07 02:55:25'),
('fb6678b6-ccfc-4ddb-b237-48529a64e783', '705f1caf-e70c-4f0c-9f2d-606b32a0bc9f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Firebase', NULL, 4, '2025-06-28 21:28:16', '2025-06-28 21:28:16'),
('fc0b5c8e-39f7-4871-bcc1-f222b8ec9408', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'PyTorch', NULL, 3, '2025-06-28 21:28:09', '2025-06-28 21:28:09'),
('fd32b27c-867f-4988-a978-a45c65cf0b7b', 'e710d04f-1112-450c-bae2-b18446e5b58f', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Machine Learning', NULL, 4, '2025-06-28 21:28:13', '2025-06-28 21:28:13'),
('fe3b697e-4815-415d-bb83-6ceae02bbd09', '18544731-2da4-4bc7-b282-87d5d4ec62d9', 'e2e23b4c-2468-43b9-b12d-9bf73065d063', 'DynamoDB', NULL, 3, '2025-07-15 18:42:51', '2025-07-15 18:42:51'),
('fe5406c9-9efc-4d88-af9e-b6bd262dffc0', '689644aa-b326-4c62-a2d8-e2f0eeae6cdd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Wireframing', NULL, 4, '2025-06-28 21:28:39', '2025-06-28 21:28:39'),
('ff2c4f01-d3d7-48d3-81cc-8d0139b1c318', '689644aa-b326-4c62-a2d8-e2f0eeae6cdd', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Adobe XD', NULL, 3, '2025-06-28 21:28:37', '2025-06-28 21:28:37'),
('ff7b687b-d1ff-44ad-94a2-2ea35fac57fa', 'c5760f9a-c91d-4321-a2fb-247802ca585a', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'Application Security', NULL, 3, '2025-07-07 02:55:53', '2025-07-07 02:55:53'),
('ffa2dd0c-77f8-4a48-9e2a-460accfeef77', 'fc29a629-f032-4241-b73d-c766d198d251', '2f660a9a-3538-4384-970c-53b4bd37d4a8', 'Kotlin', NULL, 3, '2025-06-28 21:28:06', '2025-06-28 21:28:06'),
('ffaf937c-9c45-4a30-8d05-7fd2b806336a', '1733f759-4404-461d-9d01-67168bcfde15', '72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'MongoDB', NULL, 4, '2025-07-07 02:55:21', '2025-07-07 02:55:21');

-- --------------------------------------------------------

--
-- Table structure for table `theme_clients`
--

CREATE TABLE `theme_clients` (
  `id` varchar(36) NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `current_version` varchar(50) NOT NULL,
  `update_channel` varchar(20) DEFAULT 'stable',
  `last_seen` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_updated` timestamp NULL DEFAULT NULL,
  `user_agent` text,
  `timezone` varchar(50) DEFAULT 'UTC',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `theme_clients`
--

INSERT INTO `theme_clients` (`id`, `client_id`, `domain`, `current_version`, `update_channel`, `last_seen`, `last_updated`, `user_agent`, `timezone`, `created_at`, `updated_at`) VALUES
('12822f90-caa5-4eff-8413-b8b462ebae93', 'client_1751806105745_axwbayhng3', 'localhost', '1.0.0', 'stable', '2025-07-06 11:11:31', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', '2025-07-06 09:10:19', '2025-07-06 11:11:33'),
('1c891cf2-829f-4956-b6ee-910bf5c0e2bd', 'client_1751813468004_ref64e732g', 'noman.theexpertways.com', '1.0.0', 'stable', '2025-07-06 09:55:02', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', '2025-07-06 09:51:10', '2025-07-06 09:55:02'),
('3a76c1f9-991e-4d8a-bd98-e9f2df062cd6', 'client_1751817961426_rf8zq9yn7rm', 'noman.theexpertways.com', '3.0.0', 'stable', '2025-07-06 11:19:49', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', '2025-07-06 11:06:02', '2025-07-06 11:19:51'),
('4f1a8650-f97b-48c3-9bf6-372b0312b71c', 'client_1751813352540_40res4uayeb', 'muneeb.theexpertways.com', '1.0.0', 'stable', '2025-07-06 11:12:15', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', '2025-07-06 09:49:13', '2025-07-06 11:12:18'),
('864099a0-c746-4f48-9212-2c9b1885f1d8', 'client_1751816583501_dgx8pcrqeda', 'noman.theexpertways.com', '2.0.0', 'stable', '2025-07-06 11:05:26', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', '2025-07-06 10:43:05', '2025-07-06 11:05:28'),
('a806b7ea-3ed5-48e8-9f5a-6ef52386fe2b', 'client_1751817931413_rijvtvbeio', 'localhost', '1.0.0', 'stable', '2025-07-06 11:05:32', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', '2025-07-06 11:05:33', '2025-07-06 11:05:33'),
('d5a643f8-b6e9-4770-97db-7fb13dd98679', 'client_1751815096324_07sge0f2g0o2', 'noman.theexpertways.com', '1.0.0', 'stable', '2025-07-06 10:22:00', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'Asia/Karachi', '2025-07-06 10:18:17', '2025-07-06 10:22:00');

-- --------------------------------------------------------

--
-- Table structure for table `theme_updates`
--

CREATE TABLE `theme_updates` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `version` varchar(50) NOT NULL,
  `channel` varchar(20) DEFAULT 'stable',
  `files` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `pushed_at` timestamp NULL DEFAULT NULL,
  `download_count` int(11) DEFAULT '0',
  `success_count` int(11) DEFAULT '0',
  `failure_count` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `theme_updates`
--

INSERT INTO `theme_updates` (`id`, `title`, `description`, `version`, `channel`, `files`, `is_active`, `created_at`, `updated_at`, `pushed_at`, `download_count`, `success_count`, `failure_count`) VALUES
('3177d9f8-fa67-4b55-932c-0f7c0f364808', 'Performance Update', 'N/A', '2.0.0', 'stable', '[]', 1, '2025-07-06 09:11:03', '2025-07-06 09:11:04', NULL, 0, 0, 0),
('8a29470d-b7e0-48d0-9d13-9c768b2310af', 'Initial Release', 'First stable release of the theme update system', '1.0.0', 'stable', '[]', 1, '2025-07-06 09:09:53', '2025-07-06 09:09:53', NULL, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `theme_update_logs`
--

CREATE TABLE `theme_update_logs` (
  `id` varchar(36) NOT NULL,
  `update_id` varchar(36) DEFAULT NULL,
  `client_id` varchar(255) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `log_message` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `theme_update_notifications`
--

CREATE TABLE `theme_update_notifications` (
  `id` varchar(36) NOT NULL,
  `update_id` varchar(36) DEFAULT NULL,
  `client_id` varchar(255) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `notification_type` varchar(100) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `theme_update_stats`
--

CREATE TABLE `theme_update_stats` (
  `id` varchar(36) NOT NULL,
  `update_id` varchar(36) DEFAULT NULL,
  `total_clients` int(11) DEFAULT '0',
  `successful_updates` int(11) DEFAULT '0',
  `failed_updates` int(11) DEFAULT '0',
  `pending_updates` int(11) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` mediumtext COLLATE utf8mb4_unicode_ci,
  `email_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_admin` tinyint(4) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `full_name`, `avatar_url`, `email_verified`, `created_at`, `updated_at`, `is_admin`) VALUES
('033f0150-6671-41e5-a968-ff40e9f07f26', 'fareedrao7890@gmail.com', '$2b$12$aruocEqLAyw8qqxoZ0pZsOp9m//JaQ4gucZ9KIqok7vKRHjJ1uBmm', 'fareedrao7890', NULL, NULL, 1, '2025-07-11 15:55:42', '2025-07-17 17:33:46', 0),
('1b437fd2-8576-44b0-b49e-741a0befe6a4', 'theexpertwayys@gmail.com', '$2b$12$aruocEqLAyw8qqxoZ0pZsOp9m//JaQ4gucZ9KIqok7vKRHjJ1uBmm', 'theexpertwayys', NULL, NULL, 1, '2025-07-11 15:55:42', '2025-07-17 17:33:46', 0),
('2f660a9a-3538-4384-970c-53b4bd37d4a8', 'zm4717696@gmail.com', '$2b$12$aruocEqLAyw8qqxoZ0pZsOp9m//JaQ4gucZ9KIqok7vKRHjJ1uBmm', 'zm4717696', NULL, NULL, 1, '2025-07-11 15:55:42', '2025-07-17 17:33:46', 0),
('3fb36cdb-e2b9-4f78-bd3b-2bf5de0168e6', 'test@example.com', '$2b$12$aruocEqLAyw8qqxoZ0pZsOp9m//JaQ4gucZ9KIqok7vKRHjJ1uBmm', NULL, NULL, NULL, 1, '2025-07-13 17:32:32', '2025-07-17 17:33:46', 0),
('4ef76b96-d00c-4895-a109-0dc729b4bc46', 'imaamir10@gmail.com', '$2b$12$aruocEqLAyw8qqxoZ0pZsOp9m//JaQ4gucZ9KIqok7vKRHjJ1uBmm', 'imaamir10', NULL, NULL, 1, '2025-07-11 15:55:42', '2025-07-17 17:33:46', 0),
('58ab6ddc-9a63-426e-9f06-5497c0c77cd9', 'test-domain-1752773572167@example.com', '$2a$12$euSo1E6MpQViqCS3yueLJ.2XuXv2JFPK0DTmgc/.BzabOstplxcMa', 'Test', 'Test Domain User', NULL, 1, '2025-07-17 12:32:53', '2025-07-17 17:33:46', 0),
('66918e72-8269-41b5-b9b0-3354a9c48748', 'test-domain@example.com', '$2a$12$JJSuU.mekawiR3qri0fWmuWYzybpnRMBNP1DSo3z/3TdzpaPpWdBC', 'Test', 'Test Domain User', NULL, 1, '2025-07-17 12:29:42', '2025-07-17 17:33:46', 0),
('72c76ef6-9a29-40c3-9e29-d7333fbe1e76', 'khumi.malik@gmail.com', '$2b$12$aruocEqLAyw8qqxoZ0pZsOp9m//JaQ4gucZ9KIqok7vKRHjJ1uBmm', 'khumi.malik', NULL, NULL, 1, '2025-07-11 15:55:42', '2025-07-17 17:33:46', 0),
('94b101ed-9705-4a18-b25b-ef7376ad0550', 'ahsanmehmoodahsan@gmail.com', '$2b$12$aruocEqLAyw8qqxoZ0pZsOp9m//JaQ4gucZ9KIqok7vKRHjJ1uBmm', 'ahsanmehmoodahsan', NULL, NULL, 1, '2025-07-11 15:55:42', '2025-07-17 17:33:46', 0),
('9b054eaf-9a7c-483b-8915-84c439b3ae79', 'dev.ai.for.all99@gmail.com', '$2b$12$aruocEqLAyw8qqxoZ0pZsOp9m//JaQ4gucZ9KIqok7vKRHjJ1uBmm', 'dev.ai.for.all99', NULL, NULL, 1, '2025-07-11 15:55:42', '2025-07-17 17:33:46', 0),
('e2e23b4c-2468-43b9-b12d-9bf73065d063', 'muneebarif11@gmail.com', '$2b$12$aruocEqLAyw8qqxoZ0pZsOp9m//JaQ4gucZ9KIqok7vKRHjJ1uBmm', 'muneebarif11', NULL, NULL, 1, '2025-07-11 15:55:42', '2025-07-17 17:55:36', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_sections`
--
ALTER TABLE `admin_sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `section_key` (`section_key`),
  ADD KEY `idx_section_key` (`section_key`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- Indexes for table `admin_section_permissions`
--
ALTER TABLE `admin_section_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_section` (`user_id`,`section_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_section_id` (`section_id`);

--
-- Indexes for table `automatic_update_capabilities`
--
ALTER TABLE `automatic_update_capabilities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `automatic_update_client_performance`
--
ALTER TABLE `automatic_update_client_performance`
  ADD PRIMARY KEY (`client_id`);

--
-- Indexes for table `automatic_update_logs`
--
ALTER TABLE `automatic_update_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `backup_files`
--
ALTER TABLE `backup_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_upload_date` (`upload_date`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_queries`
--
ALTER TABLE `contact_queries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `domains`
--
ALTER TABLE `domains`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `domains_technologies`
--
ALTER TABLE `domains_technologies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `niche`
--
ALTER TABLE `niche`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `portfolio_config`
--
ALTER TABLE `portfolio_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `owner_email` (`owner_email`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `project_images`
--
ALTER TABLE `project_images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `recent_automatic_activity`
--
ALTER TABLE `recent_automatic_activity`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shared_hosting_clients`
--
ALTER TABLE `shared_hosting_clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `client_id` (`client_id`);

--
-- Indexes for table `shared_hosting_notifications`
--
ALTER TABLE `shared_hosting_notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shared_hosting_updates`
--
ALTER TABLE `shared_hosting_updates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shared_hosting_update_logs`
--
ALTER TABLE `shared_hosting_update_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shared_hosting_update_stats`
--
ALTER TABLE `shared_hosting_update_stats`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tech_skills`
--
ALTER TABLE `tech_skills`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `theme_clients`
--
ALTER TABLE `theme_clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `client_id` (`client_id`);

--
-- Indexes for table `theme_updates`
--
ALTER TABLE `theme_updates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `version` (`version`);

--
-- Indexes for table `theme_update_logs`
--
ALTER TABLE `theme_update_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `theme_update_notifications`
--
ALTER TABLE `theme_update_notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `theme_update_stats`
--
ALTER TABLE `theme_update_stats`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contact_queries`
--
ALTER TABLE `contact_queries`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `domains`
--
ALTER TABLE `domains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `portfolio_config`
--
ALTER TABLE `portfolio_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_section_permissions`
--
ALTER TABLE `admin_section_permissions`
  ADD CONSTRAINT `admin_section_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_section_permissions_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `admin_sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `domains`
--
ALTER TABLE `domains`
  ADD CONSTRAINT `domains_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
