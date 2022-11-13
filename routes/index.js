const parentsRoutes = require("./parents");
const childrenRoutes = require("./children");
const coursesRoutes = require("./courses");
const path = require("path");

const constructorMethod = (app) => {
    app.use("/parents", parentsRoutes);
    app.use("/children", childrenRoutes);
    app.use("/courses", coursesRoutes);

    app.get("/", (request, response) => {
        return response.render("home", { pageTitle: "Home" });
    });

    //for accessing unknown routes
    app.use("*", (request, response) => {
        response
            .status(404)
            .sendFile(path.resolve("static/page-not-found.html"));
    });

    //for invalid URI
    app.use(function (error, request, response, next) {
        response
            .status(404)
            .sendFile(path.resolve("static/page-not-found.html"));
    });
};

module.exports = constructorMethod;
