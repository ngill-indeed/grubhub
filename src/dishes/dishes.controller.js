const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

function bodyHasName(req, res, next) {
    const { data = {} } = req.body;
    if (!data.name) {
        next({
            status: 400,
            message: "Request body must include property name.",
        });
    }
    return next();
}
  
function bodyHasDescription(req, res, next) {
    const { data = {} } = req.body;
    if (!data.description) {
        next({
        status: 400,
        message: "Request body must include property description.",
        });
    }
    return next();
}
  
function bodyHasPrice(req, res, next) {
    const { data = {} } = req.body;
    if (data.price && (data.price < 0 || typeof data.price !== "number") || !data.price) {
        next({
        status: 400,
        message:
            "Request body must include property price and it must be an integer greater than 0.",
        });
    }
    return next();
}
  
function bodyHasImageUrl(req, res, next) {
    const { data = {} } = req.body;
    if (!data.image_url) {
        next({
        status: 400,
        message: "Request body must include property image_url",
        });
    }
    return next();
}

function exists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}.`,
    });
}
  
function create(req, res) {
    const { data = {} } = req.body;
    const newDish = {
        ...data,
        id: nextId(),
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function update(req, res, next) {
    let dish = res.locals.dish
    const { data: { id, name, description, price, image_url } = {} } = req.body
    if (dish.id === id || !id) {
        const updatedDish = {
            id: dish.id,
            name,
            description,
            price,
            image_url
        }
        dish = updatedDish
        res.json({ data: dish })
    }
    next({ status: 400, message: `Dish id does not match route id. Dish: ${dish.id}, Route: ${id}` })
}
  
function read(req, res) {
    res.json({ data: res.locals.dish });
}

function list(req, res) {
    res.json({ data: dishes });
}

module.exports = {
    create: [
        bodyHasName, bodyHasDescription, bodyHasPrice, bodyHasImageUrl,
        create,
    ],
    read: [exists, read],
    list,
    update: [
        exists, bodyHasName, bodyHasDescription, bodyHasPrice, bodyHasImageUrl,
        update,
    ]
};
