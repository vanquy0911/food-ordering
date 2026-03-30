// Central export file for all models
const User = require("./user");
const Category = require("./category");
const Food = require("./food");
const Cart = require("./cart");
const Order = require("./order");
const Payment = require("./payment");
const Address = require("./address");
const SettingLocation = require("./settinglocation");

module.exports = {
    User,
    Category,
    Food,
    Cart,
    Order,
    Payment,
    Address,
    SettingLocation,
};
