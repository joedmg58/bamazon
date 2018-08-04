require('dotenv').config();
var credentials = require('./credentials.js');
var inquirer = require( 'inquirer' );
var mysql = require( 'mysql' );
const Tablefy = require( 'tablefy' );

//taking mysql params from credentials.js and from .env
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
    console.log('');
    console.log('---------- M A I N   M E N U ----------');
    console.log('');
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
    var queryStr = 'SELECT item_id AS Id, product_name AS Product, department_name AS Department, price AS Price, stock_quantity AS Stock FROM products WHERE stock_quantity < 5';
    var query = connection.query( queryStr, function( error, response ) {
        if ( error ) throw error;

        //console.log( query.sql );

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
    console.log('');
    console.log('---------- A D D  T O  I N V E N T O R Y ----------');
    console.log('');
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
        //update stock_quantity in table products for item_id
        var queryStr = 'UPDATE products SET ? WHERE ?';
        var queryParams = [ {stock_quantity:answer.stock}, {item_id:answer.pid} ];

        var query = connection.query( queryStr, queryParams, function( error, response ){
            if (error) throw error;

            console.log( response.affectedRows + " products updated!\n" );

            inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Keep adding to inventory ? ',
                    default: false
                }
            ]).then( function( ans ){
                if ( ans.confirm ) { addInventory(); } else { mainMenu(); }
            } );

        } );

    } );
}

function addNewProduct() {
    console.log('');
    console.log('---------- A D D  N E W  P R O D U C T ----------');
    console.log('');
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
        },
        {
            type: 'input',
            name: 'qty',
            message: 'Stock quantity: '
        }
    ]).then( function( answer ){
        //Insert new product into table products --------------------------------------------------------------------------------
        var queryStr = 'INSERT INTO products SET ?';
        var queryParams = {
            product_name: answer.pname,
            department_name: answer.dname,
            price: parseFloat( answer.price ),
            stock_quantity: parseInt( answer.qty )
        } 

        var query = connection.query( queryStr, queryParams, function( error, response ){

            console.log( query.sql );

            if ( error ) { throw error }

            console.log( response.affectedRows + 'product(s) added\n');

            inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Add another product ? ',
                    default: false
                }
            ]).then( function( ans ){
                if ( ans.confirm ) { addNewProduct(); } else { mainMenu(); }
            } );;

        } );

        
    } );
}

//------------- START -------------------------

mainMenu();