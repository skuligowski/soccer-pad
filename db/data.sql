DELETE FROM players;

INSERT INTO players VALUES ('beti', 'Beti');
INSERT INTO players VALUES ('diego', 'Diego');
INSERT INTO players VALUES ('damiang', 'Damian G.');
INSERT INTO players VALUES ('mariusz', 'Mariusz');
INSERT INTO players VALUES ('damianj', 'Damian J.');
INSERT INTO players VALUES ('ela', 'Ela');
INSERT INTO players VALUES ('aga', 'Aga');
INSERT INTO players VALUES ('seba', 'Seba');
INSERT INTO players VALUES ('tomek', 'Tomek');
INSERT INTO players VALUES ('michal', 'Michał');
INSERT INTO players VALUES ('filip', 'Filip');
INSERT INTO players VALUES ('wojtek', 'Wojtek');

DELETE FROM games;

INSERT INTO games (blueDefender, blueAttacker, whiteDefender, whiteAttacker, blueScore, whiteScore, date)
	VALUES('beti', 'aga', 'wojtek', 'filip', 1, 10, NOW() - INTERVAL 12 DAY);

/*INSERT INTO games (blueDefender, blueAttacker, whiteDefender, whiteAttacker, blueScore, whiteScore, gameDate)
	VALUES('beti', 'aga', 'wojtek', 'filip', 1, 10, NOW() - INTERVAL 10 DAY);
*/

/*
INSERT INTO games (blueDefender, blueAttacker, whiteDefender, whiteAttacker, blueScore, whiteScore, gameDate)
	VALUES('beti', 'ela', 'wojtek', 'diego', 10, 6, NOW() - INTERVAL 7 DAY);

INSERT INTO games (blueDefender, blueAttacker, whiteDefender, whiteAttacker, blueScore, whiteScore, gameDate)
	VALUES('seba', 'beti', 'wojtek', 'damiang', 10, 9, NOW() - INTERVAL 6 DAY);

INSERT INTO games (blueDefender, blueAttacker, whiteDefender, whiteAttacker, blueScore, whiteScore, gameDate)
	VALUES('mariusz', 'aga', 'wojtek', 'filip', 2, 10, NOW() - INTERVAL 3 DAY);

INSERT INTO games (blueDefender, blueAttacker, whiteDefender, whiteAttacker, blueScore, whiteScore, gameDate)
	VALUES('tomek', 'diego', 'aga', 'wojtek', 0, 10, NOW() - INTERVAL 1 DAY);
	*/
COMMIT;