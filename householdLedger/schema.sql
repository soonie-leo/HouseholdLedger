-- Initialize the database.
-- Drop any existing data and create empty tables.

DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS ledger;

CREATE TABLE user (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT UNIQUE NOT NULL,
	password TEXT NOT NULL
);

CREATE TABLE ledger (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	order_num INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	detail TEXT NOT NULL,
	'date' TIMESTAMP NOT NULL,
	income INTEGER NOT NULL DEFAULT 0,
	expenses INTEGER NOT NULL DEFAULT 0,
	source TEXT NOT NULL DEFAULT "",
	tag TEXT NOT NULL DEFAULT "",
	note TEXT NOT NULL DEFAULT "",
	FOREIGN KEY (user_id) REFERENCES user (id)
);
