-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema curatedhitdb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema curatedhitdb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `curatedhitdb` DEFAULT CHARACTER SET utf8 ;
USE `curatedhitdb` ;

-- -----------------------------------------------------
-- Table `curatedhitdb`.`histone_description`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curatedhitdb`.`histone_description` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `summary` TEXT(5000) NULL,
  `taxonomy` TEXT(1000) NULL,
  `genes` TEXT(1000) NULL,
  `evolution` TEXT(1000) NULL,
  `expression` TEXT(1000) NULL,
  `knock_out` TEXT(1000) NULL,
  `function` TEXT(1000) NULL,
  `sequence` TEXT(1000) NULL,
  `localization` TEXT(1000) NULL,
  `deposition` TEXT(1000) NULL,
  `structure` TEXT(1000) NULL,
  `interactions` TEXT(1000) NULL,
  `disease` TEXT(1000) NULL,
  `caveats` TEXT(1000) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `curatedhitdb`.`histone`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curatedhitdb`.`histone` (
  `id` VARCHAR(35) NOT NULL,
  `level` VARCHAR(45) NULL COMMENT 'type, variant_group or variant',
  `taxonomic_span` VARCHAR(100) NULL,
  `taxonomic_span_id` VARCHAR(45) NULL,
  `description` INT NULL,
  `parent` VARCHAR(35) NULL,
  PRIMARY KEY (`id`),
  INDEX `description_idx` (`description` ASC) VISIBLE,
  INDEX `fk_histone_histone1_idx` (`parent` ASC) VISIBLE,
  CONSTRAINT `description`
    FOREIGN KEY (`description`)
    REFERENCES `curatedhitdb`.`histone_description` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `parent`
    FOREIGN KEY (`parent`)
    REFERENCES `curatedhitdb`.`histone` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `curatedhitdb`.`sequence`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curatedhitdb`.`sequence` (
  `accession` VARCHAR(255) NOT NULL,
  `variant` VARCHAR(35) NULL,
  `gi` VARCHAR(45) NULL,
  `ncbi_gene_id` VARCHAR(45) NULL,
  `hgnc_gene_name` VARCHAR(45) NULL,
  `taxonomy_id` VARCHAR(45) NULL,
  `organism` VARCHAR(255) NULL,
  `phylum` VARCHAR(255) NULL,
  `class` VARCHAR(255) NULL,
  `taxonomy_group` VARCHAR(255) NULL,
  `info` TEXT(1000) NULL,
  `sequence` VARCHAR(255) NULL,
  PRIMARY KEY (`accession`),
  INDEX `variant_idx` (`variant` ASC) VISIBLE,
  CONSTRAINT `variant`
    FOREIGN KEY (`variant`)
    REFERENCES `curatedhitdb`.`histone` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `curatedhitdb`.`publication`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curatedhitdb`.`publication` (
  `id` VARCHAR(45) NOT NULL,
  `title` VARCHAR(255) NULL,
  `doi` VARCHAR(255) NULL,
  `author` VARCHAR(255) NULL,
  `year` VARCHAR(5) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `curatedhitdb`.`alternative_name`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curatedhitdb`.`alternative_name` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `taxonomy` VARCHAR(45) NULL,
  `gene` VARCHAR(45) NULL,
  `splice` VARCHAR(45) NULL,
  `histone` VARCHAR(35) NULL,
  PRIMARY KEY (`id`),
  INDEX `histone_idx` (`histone` ASC) VISIBLE,
  CONSTRAINT `histone`
    FOREIGN KEY (`histone`)
    REFERENCES `curatedhitdb`.`histone` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `curatedhitdb`.`sequence_has_publication`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curatedhitdb`.`sequence_has_publication` (
  `sequence_accession` VARCHAR(255) NOT NULL,
  `publication_id` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`sequence_accession`, `publication_id`),
  INDEX `fk_sequence_has_publication_publication1_idx` (`publication_id` ASC) VISIBLE,
  INDEX `fk_sequence_has_publication_sequence1_idx` (`sequence_accession` ASC) VISIBLE,
  CONSTRAINT `references`
    FOREIGN KEY (`sequence_accession`)
    REFERENCES `curatedhitdb`.`sequence` (`accession`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `sequences`
    FOREIGN KEY (`publication_id`)
    REFERENCES `curatedhitdb`.`publication` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `curatedhitdb`.`histone_has_publication`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curatedhitdb`.`histone_has_publication` (
  `histone_id` VARCHAR(35) NOT NULL,
  `publication_id` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`histone_id`, `publication_id`),
  INDEX `fk_histone_has_publication_publication1_idx` (`publication_id` ASC) VISIBLE,
  INDEX `fk_histone_has_publication_histone1_idx` (`histone_id` ASC) VISIBLE,
  CONSTRAINT `publications`
    FOREIGN KEY (`histone_id`)
    REFERENCES `curatedhitdb`.`histone` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `histones`
    FOREIGN KEY (`publication_id`)
    REFERENCES `curatedhitdb`.`publication` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;