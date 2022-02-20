module.exports = function (app) {
    let admin = require("../controllers/admin");

    app
    .route("/admin")
    .get(admin.getAdmin)
    .post(admin.createAdmin);
}