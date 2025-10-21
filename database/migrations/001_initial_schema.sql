-- Migration: Initial Schema
-- Description: Creates initial database schema for Profile Manager v2.0

START TRANSACTION;

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `profile_manager` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `profile_manager`;

-- Add your schema creation commands here (same as schema.sql)

COMMIT;