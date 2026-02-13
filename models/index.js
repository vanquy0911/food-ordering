// Central export file for all models
const User = require("./user");
const Category = require("./category");
const Food = require("./food");
const Cart = require("./cart");
const Order = require("./order");

module.exports = {
    User,
    Category,
    Food,
    Cart,
    Order,
};
