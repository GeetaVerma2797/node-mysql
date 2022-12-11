-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 11, 2022 at 06:09 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `crud`
--
CREATE DATABASE IF NOT EXISTS `crud` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `crud`;

DELIMITER $$
--
-- Procedures
--
DROP PROCEDURE IF EXISTS `DELETE_USER`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `DELETE_USER` (IN `GIVEN_USER_ID` INT(11), IN `GIVEN_UPDATE_DATE` VARCHAR(50))   BEGIN
	IF (GIVEN_USER_ID IS NOT NULL) THEN 
		UPDATE users SET status='0', updated=GIVEN_UPDATE_DATE WHERE id=GIVEN_USER_ID AND status='1';
	END IF;
END$$

DROP PROCEDURE IF EXISTS `GET_USERS`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_USERS` ()   BEGIN

SELECT DISTINCTROW id,name,email,phone,role,status,created FROM users WHERE status='1';

END$$

DROP PROCEDURE IF EXISTS `UPDATE_USER`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `UPDATE_USER` (IN `GIVEN_USER_ID` INT(11), IN `GIVEN_MOBILE` VARCHAR(20), IN `GIVEN_EMAIL` VARCHAR(60), IN `GIVEN_FULLNAME` VARCHAR(40), IN `GIVEN_UPDATED` VARCHAR(60), IN `GIVEN_ROLE` ENUM('0','1'))   BEGIN
	IF (GIVEN_USER_ID IS NOT NULL) THEN 
		UPDATE users SET name=GIVEN_FULLNAME,email=GIVEN_EMAIL,phone=GIVEN_MOBILE,role=GIVEN_ROLE,updated=GIVEN_UPDATED WHERE id=GIVEN_USER_ID AND status='1';
	END IF;
END$$

DROP PROCEDURE IF EXISTS `USER_LOGIN`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `USER_LOGIN` (IN `GIVEN_EMAIL` VARCHAR(20), IN `GIVEN_PASSWORD` VARCHAR(60))   BEGIN


SET @LOGIN_STATUS = 0;
SET @message = '';
SET @name = NULL;
SET @mobile = NULL;
SET @email = NULL;
SET @role = NULL;
SET @status = NULL;


IF (GIVEN_EMAIL IS NOT NULL AND GIVEN_PASSWORD IS NOT NULL) THEN 
	SELECT id, name, email, phone, role, status INTO @user_exist, @name, @email, @phone, @role, @status FROM users WHERE email=GIVEN_EMAIL AND password=GET_PASSWORD_HASH(GIVEN_PASSWORD) AND status='1';
END IF;
IF (@user_exist IS NULL) THEN 
	-- invalid login mode--
	set @message = 'Invalid email or password!';
ELSE 
	SET @LOGIN_STATUS = 1;
	SET @message = 'Logged in successfully';
END IF;

IF @LOGIN_STATUS=1 THEN 
	SELECT @LOGIN_STATUS as login_status, @user_exist as user_id, @name AS name, 
	@phone AS mobile, @email AS email, @role as role, @status as status,
	@message as message;
ELSE 
	SELECT @user_exist as user_exist, @LOGIN_STATUS as login_status, @message as message;
END IF;

END$$

DROP PROCEDURE IF EXISTS `USER_REGISTER`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `USER_REGISTER` (IN `GIVEN_MOBILE` VARCHAR(20), IN `GIVEN_EMAIL` VARCHAR(60), IN `GIVEN_FULLNAME` VARCHAR(40), IN `GIVEN_PASSWORD` VARCHAR(60), IN `GIVEN_CREATED` VARCHAR(60), IN `GIVEN_UPDATED` VARCHAR(60), IN `GIVEN_ROLE` ENUM('0','1'), IN `GIVEN_STATUS` ENUM('0','1'))   BEGIN

/**
 * User registration
 *
 **/

    SET @user_id = null;
    SET @user_exist = NULL;
    SET @message = '';
    SET @register_status = 0;

    SELECT id INTO @user_exist FROM users WHERE phone=GIVEN_MOBILE AND status="1";
    IF (GIVEN_EMAIL IS NOT NULL) THEN 
        SELECT id INTO @user_exist FROM users WHERE email=GIVEN_EMAIL AND status="1";
    END IF;

    IF @user_exist IS NULL THEN
        INSERT INTO users (phone, name, password, email, role, status, created, updated)
        VALUES (GIVEN_MOBILE, GIVEN_FULLNAME, GET_PASSWORD_HASH(GIVEN_PASSWORD), GIVEN_EMAIL, GIVEN_ROLE, GIVEN_STATUS, GIVEN_CREATED, GIVEN_UPDATED);

        SET @user_id = LAST_INSERT_ID();
        IF @user_id IS NOT NULL THEN 
            SET @register_status = 1;
            set @message = 'Succesfully registered';
        ELSE 
            SET @message = 'Something went wrong while creating your account!';
        END IF;
    ELSE 
        SET @register_status = 0;
        SET @message = 'The user is already registered, please login!';
    END IF;

    IF @register_status=1 THEN 
        SELECT @register_status as register_status, @user_id AS user_id,
        GIVEN_MOBILE AS mobile, GIVEN_EMAIL AS email, GIVEN_FULLNAME AS full_name,
        @message as message;
    ELSE 
        SELECT @register_status as register_status, @message as message;
    END IF;

END$$

--
-- Functions
--
DROP FUNCTION IF EXISTS `GET_PASSWORD_HASH`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `GET_PASSWORD_HASH` (`GIVEN_PASSWORD` VARCHAR(60)) RETURNS VARCHAR(120) CHARSET latin1 COLLATE latin1_swedish_ci  BEGIN

/** GET password hash**/
RETURN SHA1(GIVEN_PASSWORD);

END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `role` enum('0','1') DEFAULT '0',
  `status` enum('0','1') DEFAULT '1',
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  `updated` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `status`, `created`, `updated`) VALUES
(1, 'test', 'geeta2@gmail.com', '8700000064', '554cd583abddcf06ac24488a3508e7f7bd39b9ea', '0', '0', '2022-12-11 22:25:05', '2022-12-11 22:36:15'),
(2, 'test', 'test@gmail.com', '8700000065', '554cd583abddcf06ac24488a3508e7f7bd39b9ea', '0', '1', '2022-12-11 22:28:46', '2022-12-11 22:28:46'),
(3, 'test2', 'test2@gmail.com', '8700000066', '554cd583abddcf06ac24488a3508e7f7bd39b9ea', '1', '1', '2022-12-11 22:33:23', '2022-12-11 22:33:23');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
