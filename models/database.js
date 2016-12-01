var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432';

var client = new pg.Client(connectionString);
client.connect();
//var query = client.query('DROP TABLE users');
//var query = client.query('CREATE TABLE endpoint_type(id SERIAL PRIMARY KEY, endpoint_id INT, subnet_num INT, mask_num INT, subnet_ip VARCHAR(15), prefix INT)');
var query = client.query('CREATE TABLE endpoint_gateway_type(id SERIAL PRIMARY KEY, value VARCHAR(20))');
query.on('end', function() { client.end(); });

