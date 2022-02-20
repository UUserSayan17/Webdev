const MongoClient = require( 'mongodb' ).MongoClient;
const config = require('./config.json');
const url = config.url;
const db= config.mongoDb;
var _db;

module.exports = {
  connectToServer: function( callback ) {
    MongoClient.connect( url, function( err, client ) {
      _db = client.db(db);
      return callback( err );
    } );
  },
  getDb: function() {
    return _db;
  }
};