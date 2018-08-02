require('dotenv').config();
var credentials = require('./credentials.js');
var inquirer = require( 'inquirer' );
var mysql = require( 'mysql' );
const Tablefy = require( 'tablefy' );

//taking mysql params from credntials.js and from .env
var mysql_params = credentials.mysql_params;

//Parameters for MySQL connection
var serverParams = {
    host: mysql_params.host,
    port: mysql_params.port,
    user: mysql_params.user,
    password: mysql_params.password,
    database: 'bamazon'
}

//Creating the connection to MySQL server
var connection = mysql.createConnection( serverParams );

function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Select an option : ',
            name: 'mainOption',
            choices: [ 'View products for sale', 'View low inventory', 'Add to inventory', 'Add new product', 'Quit' ]
        }
    ]).then( function( answer ) {
        switch ( answer.mainOption ) {
            case 'View products for sale':
                viewProducts();
                break;
            case 'View low inventory':
                viewLowInventory();
                break;
            case 'Add to inventory':
                addInventory();
                break;
            case 'Add new product':
                addNewProduct();
                break;           
            case 'Quit':
                connection.end();
                console.log( 'Bye, Hope to see you soon.');
                break;
        }
    } );
}

function viewProducts() {
    var queryStr = 'SELECT item_id AS Id, product_name AS Product, department_name AS Department, price AS Price, stock_quantity AS Stock FROM products';
    var query = connection.query( queryStr, function( error, response ) {
        if ( error ) throw error;

        console.log( '\x1b[33m\x1b[44m' );  //set console caracters background blue and foreground bright
        console.log( ' P R O D U C T S   F O R   S A L E ' );
        let tablefy = new Tablefy(); //creates new Tablefy object
        tablefy.draw( response ); // draw the table from response
        console.log( '\x1b[0m' ); //reset console color to default

        mainMenu();
    } );
}

function viewLowInventory() {
    var queryStr = 'SELECT item_id AS Id, product_name AS Product, department_name AS Department, price AS Price, stock_quantity AS Stock FROM products WHERE ?';
    var queryParams = { stock_quantity: '<5' };
    var query = connection.query( queryStr, queryParams, function( error, response ) {
        if ( error ) throw error;

        if (response.length > 0 ) {
            console.log( '\x1b[33m\x1b[44m' );  //set console caracters background blue and foreground bright
            console.log( ' L O W   I N V E N T O R Y ' );
            let tablefy = new Tablefy(); //creates new Tablefy object
            tablefy.draw( response ); // draw the table from response
            console.log( '\x1b[0m' ); //reset console color to default
        }
        else {
            console.log( '\x1b[33m\x1b[44m' );  //set console caracters background blue and foreground bright
            console.log( ' N O   L O W    I N V E N T O R Y ' ); 
            console.log( '\x1b[0m' ); //reset console color to default
        }

        mainMenu();
    } );
}

function addInventory() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'pid',
            message: 'Product ID: '
        },
        {
            type: 'input',
            name: 'stock',
            message: 'New stock quantity: '
        }
    ]).then( function( answer ) {
        //update database

        mainMenu();
    } );
}

function addNewProduct() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'pname',
            message: 'Product name: '
        },
        {
            type: 'input',
            name: 'dname',
            message: 'Department: '
        },
        {
            type: 'input',
            name: 'price',
            message: 'Price: '
        }
    ]).then( function( answer ){
        //Insert data into database

        mainMenu();
    } );
}

//------------- START -------------------------

mainMenu();