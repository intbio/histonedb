DELETE FROM curatedhitdb.sequence_has_publication;
DELETE FROM curatedhitdb.sequence;
DELETE FROM curatedhitdb.histone_has_publication;
DELETE FROM curatedhitdb.publication;
DELETE FROM curatedhitdb.alternative_name;
DELETE FROM curatedhitdb.histone_description;
ALTER TABLE curatedhitdb.histone_description AUTO_INCREMENT = 1;
DELETE FROM curatedhitdb.histone;