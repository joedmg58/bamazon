var inquirer = require( 'inquirer' );
var mysql = require( 'mysql' );
const Tablefy = require( 'tablefy' );

var serverParams = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'joedmg58',
    database: 'bamazon'
}

var connection = mysql.createConnection( serverParams );

function displayProducts() {
    var queryStr = 'SELECT item_id AS Id, product_name AS Product, department_name AS Department, price AS Price FROM products';
    var query = connection.query( queryStr, function( error, response ) {
        if ( error ) throw error;
        console.log( '\x1b[33m\x1b[44m' );  //set console caracters background blue and foreground bright
        let tablefy = new Tablefy(); //creates new Tablefy object
        tablefy.draw( response ); // draw the table from response
        console.log( '\x1b[0m' ); //reset console color to default

        mainMenu();
    } );
}

function processOrder( pid, qty ) {
    var queryStr ='SELECT stock_quantity FROM products WHERE ?';
    var queryParam = { item_id: pid };

    var query = connection.query ( queryStr, queryParam, function( error, response ){
        if ( error ) throw error;

        var stock = response[0].stock_quantity;
        if ( qty > stock ) {
            console.log( 'Insufficient quantity! - Order canceled.' );
        }
        else {
            
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
