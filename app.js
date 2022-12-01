const express = require("express");
const session = require("express-session");
const configRoutes = require("./routes");
const { create } = require("express-handlebars");

const static = express.static(__dirname + "/public");
const app = express();

app.use("/public", static);

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const hbs = create({
    helpers: {
        ifeq: function (leftValue, rightValue, options) {
            return leftValue === rightValue
                ? options.fn(this)
                : options.inverse(this);
        },
        ifneq: function (leftValue, rightValue, options) {
            return leftValue !== rightValue
                ? options.fn(this)
                : options.inverse(this);
        },
    },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(function (request, response, next) {
    response.header(
        "Cache-Control",
        "private, no-cache, no-store, must-revalidate"
    );
    response.header("Expires", "-1");
    response.header("Pragma", "no-cache");
    next();
});

app.use(
    session({
        name: "AuthCookie",
        secret: `There !$ /\/0 $ecret f0r /\/\Y $e$$!0/\/s`,
        resave: false,
        saveUninitialized: true,
    })
);

configRoutes(app);

app.listen(PORT, () => {
    console.log("We've now got a server!");
    console.log(`Your routes will be running on http://localhost:${PORT}`);
});
