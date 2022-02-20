

module.exports.getUser = async function (req, res) {
    try {
      res.json("getUser");
      return
    }
    catch (error) {
        console.error(error);
        res.status(500).json("server_error");
        return;
      }
      
};

module.exports.createUser = async function (req, res) {
    try {
      res.json("createUser");
      return
    }
    catch (error) {
        console.error(error);
        res.status(500).json("server_error");
        return;
      }
};