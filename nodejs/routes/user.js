module.exports = function (app) {
    let user = require("../controllers/user");

    app
    .route("/user")
    .get(user.getUser)
    .post(user.createUser);
}