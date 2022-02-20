//var mongoUtil = require( '../../mongoUtil' );
//var database = mongoUtil.getDb();

const USERSCOLLECTION = "users";
const ADMINSCOLLECTION = "admins";


module.exports.getAdmin = async function (req, res) {
    try {
      
     /*  let users = database.collection('users').find(); */
      res.json("getAdmin");
      return
    }
    catch (error) {
        console.error(error);
        res.status(500).json("server_error");
        return;
      }
};

module.exports.createAdmin = async function (req, res) {
    try {
      res.json("createAdmin");
      return
    }
    catch (error) {
        console.error(error);
        res.status(500).json("server_error");
        return;
      }
};