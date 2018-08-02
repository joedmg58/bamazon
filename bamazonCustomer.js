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

//Display the table products from bamazon database
function displayProducts() {
    var queryStr = 'SELECT item_id AS Id, product_name AS Product, department_name AS Department, price AS Price, stock_quantity AS Stock FROM products';
    var query = connection.query( queryStr, function( error, response ) {
        if ( error ) throw error;
        console.log( '\x1b[33m\x1b[44m' );  //set console caracters background blue and foreground bright
        let tablefy = new Tablefy(); //creates new Tablefy object
        tablefy.draw( response ); // draw the table from response
        console.log( '\x1b[0m' ); //reset console color to default

        mainMenu();
    } );
}

function updateProducts( pid, newQty ){

    var queryStr = 'UPDATE products SET ? WHERE ?';
    var queryParam = [ { stock_quantity: newQty }, { item_id: pid } ];

    var query = connection.query( queryStr, queryParam, function( error, response ){
        console.log( response.affectedRows + " products updated!\n" );

        inquirer.prompt([
            {
                type: 'confirm',
                message: 'Press ANY key to continue...',
                name: 'anykey'
            }
        ]).then( function( answer ){
            displayProducts();
        } );

    } );
   
}

function processOrder( pid, qty ) {
    var queryStr ='SELECT stock_quantity, price, product_name FROM products WHERE ?';
    var queryParam = { item_id: pid };

    var query = connection.query ( queryStr, queryParam, function( error, response ){
        if ( error ) throw error;

        var stock = response[0].stock_quantity;
        var price = response[0].price;
        var pname = response[0].product_name;

        if ( stock - qty < 0 ) {
            console.log( 'Insufficient quantity! - Order canceled.' );
            displayProducts();
        }
        else {
            console.log( '\x1b[30m\x1b[42m' );
            console.log( 'I N V O I C E');
            console.log( 'You have purchased \x1b[37m%s\x1b[30m %s', qty, pname );
            console.log( 'The total cost of your purchase is \x1b[37m$'+ qty*price );
            console.log( '\x1b[0m' );

            updateProducts( pid, (stock - qty) );
        }

    } );

}

function placeOrder() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'prod_id',
            message: 'Product to buy (ID): ',
            validate: function( value ) {
                var pass = parseInt( value );
                if ( pass === NaN ) { return 'Please enter an integer number.' }
                else return true;
            }
        },
        {
            type: 'input',
            name: 'prod_qty',
            message: 'Quantity to buy: ',
            validate: function( value ) {
                var pass = parseInt( value );
                if ( pass === NaN ) { return 'Please enter an integer number.' }
                else return true;
            }
        }
    ]).then( function( answer ) {
        var pid = answer.prod_id;
        var qty = answer.prod_qty;

        processOrder( pid, qty );

    } );
}

function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Select an option : ',
            name: 'mainOption',
            choices: [ 'Place an order', 'Quit' ]
        }
    ]).then( function( answer ) {
        switch ( answer.mainOption ) {
            case 'Place an order':
                placeOrder();
                break;
            case 'Quit':
                connection.end();
                console.log( 'Bye, Hope to see you soon.');
                break;
        }
    } );
}

//--- START MAIN -----------------------------------------------------------------------

displayProducts();
