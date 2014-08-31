DROP DATABASE IF EXISTS soccer_pad;
CREATE DATABASE soccer_pad CHARACTER SET utf8 COLLATE utf8_general_ci;

USE soccer_pad;

DROP TABLE IF EXISTS players;

CREATE TABLE players (
	uid VARCHAR(64) NOT NULL,
	name VARCHAR(128),
PRIMARY KEY (uid)) ENGINE = InnoDB;


DROP TABLE IF EXISTS games;

CREATE TABLE games (
	id BIGINT NOT NULL AUTO_INCREMENT,
	blueDefender VARCHAR(64) NOT NULL,
	blueAttacker VARCHAR(64) NOT NULL,
	whiteDefender VARCHAR(64) NOT NULL,
	whiteAttacker VARCHAR(64) NOT NULL,
	blueScore INT NOT NULL,
	whiteScore INT NOT NULL,
	gameDate DATETIME,
PRIMARY KEY (id)) ENGINE = InnoDB;


DROP TABLE IF EXISTS rating_periods;

CREATE TABLE rating_periods (
	uid VARCHAR(64) NOT NULL,
	title VARCHAR(64) NOT NULL,
	fromDate DATE NOT NULL,
	toDate DATE NOT NULL,
PRIMARY KEY (uid)) ENGINE = InnoDB;


DROP TABLE IF EXISTS ratings;

CREATE TABLE ratings (
	period_uid VARCHAR(64) NOT NULL,
	player_uid VARCHAR(64) NOT NULL,
	ratingDate DATETIME NOT NULL,
	mean FLOAT(12,2) NOT NULL,
	sd FLOAT(12,2) NOT NULL,
PRIMARY KEY(period_uid, player_uid, ratingDate)) ENGINE = InnoDB;

