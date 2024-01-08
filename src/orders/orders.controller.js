const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function bodyHasDeliverTo(req, res, next) {
    const { data = {} } = req.body;

    if (!data.deliverTo) {
        next({
        status: 400,
        message: "Request body must include property deliverTo.",
        });
    }
    return next();
}

function bodyHasMobileNum(req, res, next) {
    const { data = {} } = req.body;
    if (!data.mobileNumber) {
    next({
        status: 400,
        message: "Request body must include property mobileNumber.",
    });
    }
    return next();
}

function bodyHasDishes(req, res, next) {
    const { data = {} } = req.body;
    if (!data.dishes || !data.dishes.length || !Array.isArray(data.dishes)) {
    next({
        status: 400,
        message: "Request body propery dishes must include at least one dish.",
    });
    }
    return next();
}

function bodyHasDishQuantityThatIsInteger(req, res, next) {
    const { data: { dishes } = {} } = req.body
    const index = dishes.findIndex((dish) => !Number.isInteger(dish.quantity))
    index != -1 ? next({ status: 400, message: `Dish ${index} must have a quantity that is an integer`}) : next() 
}

function bodyHasDishQuantityIsGreaterThanZero(req, res, next) {
    const { data: { dishes } = {} } = req.body
    const index = dishes.findIndex((dish) => dish.quantity <= 0)
    index != -1 ? next({ status: 400, message: `Dish ${index} must have a quantity that is greater than 0`}) : next() 
}


function bodyHasStatus(req, res, next) {
    const { data = {} } = req.body;
    if (!data.status || data.status === "invalid") {
        next({
        status: 400,
        message:
            "Order must have a status of pending, preparing, out-for-delivery, or delivered.",
        });
    }
    if (data.status === "delivered") {
        next({
        status: 400,
        message: "A delivered order cannot be changed.",
        });
    }
    return next();
}

function statusIsPending(req, res, next) {
    const order = res.locals.order
    if (order.status !== "pending") {
      next({
        status: 400,
        message: "Order cannot be deleted unless it is pending.",
      });
    }
    return next();
}

function idDoesNotMatchOrderId(req, res, next) {
    const { data: { id } = {} } = req.body
    const order = res.locals.order
    if (!id || id === '' || id === null || id === undefined) {
        return next()
    }
    id === order.id ? next() : next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${order.id}` })
}

function exists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `No matching order found: ${orderId}.`,
    });
}

function read(req, res) {
    res.json({ data: res.locals.order });
}
  
function list(req, res) {
    res.json({ data: orders });
}

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders.push(newOrder)
    res.status(201).json({ data: newOrder });
}

function update(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
    const order = res.locals.order
    const updatedOrder = {
        id: order.id,
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    res.json({ data: updatedOrder })
}

function destroy(req, res) {
    const { orderId } = req.params
    const index = orders.findIndex((order) => order.id === orderId);
    orders.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
  create: [
    bodyHasDeliverTo, bodyHasMobileNum, bodyHasDishes, bodyHasDishQuantityIsGreaterThanZero, bodyHasDishQuantityThatIsInteger,
    create,
  ],
  read: [exists, read],
  list,
  update: [
    exists,
    bodyHasDeliverTo, bodyHasMobileNum, bodyHasDishes, bodyHasDishQuantityIsGreaterThanZero, bodyHasDishQuantityThatIsInteger, bodyHasStatus,
    idDoesNotMatchOrderId,
    update,
  ],
  delete: [exists, statusIsPending, destroy]
};
