var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432';

var client = new pg.Client(connectionString);
client.connect();
//var query = client.query('DROP TABLE users');
var query = client.query('CREATE TABLE CDNinterface(id SERIAL PRIMARY KEY, ipaddress VARCHAR(100) not null, port VARCHAR(100) not null, login VARCHAR(100) not null, password VARCHAR(100) not null)');
query.on('end', function() { client.end(); });

