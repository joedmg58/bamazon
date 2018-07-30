var inquirer = require( 'inquirer' );
var mysql = require( 'mysql' );

var serverParams = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'joedmg58',
    database: 'bamazon'
}

var connection = mysql.createConnection( serverParams );

connection.end();