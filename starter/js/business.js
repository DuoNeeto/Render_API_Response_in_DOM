import * as io from "./io.js";

const itemTypes = {
  customers: ["name", "email"],
  flavours: ["name", "price"],
  orders: ["customerId", "date", "status", "orderDescription"],
};

const flavourLowestPrice = 0.5;
const flavourHighestPrice = 10;
const flavourNameMinimumLength = 2;
const customerNameMinimumLength = 2;
const orderDescriptionMinimumLength = 8;

// Some proxies so events.js does not have to talk to io.js
const getItem = io.getItem;
const getItems = io.getItems;

const getFlavours = async () => await io.getItems("flavours");

const getFlavourNames = async (filterById = -1) => {
  let flavours = await getFlavours();
  if (filterById > 0) {
    flavours = flavours.filter((flavour) => flavour.id !== filterById);
  }
  return flavours.map((flavour) => flavour.name);
};

const getOrderStatusList = () => ["unpaid", "paid", "transit", "delivered"];

const isANumber = (value) => {
  const converted = parseInt(value);
  return !Number.isNaN(converted);
};

const numberIsInRange = (number, lower, upper) =>
  number >= lower && number <= upper;

const stringHasMinimumLength = (str, length) => str.length >= length;

const stringConsistsOfLettersOnly = (str) => {
  // Regular expression, not necessary to know this.
  const re = /^[a-zA-Z\s]*$/;
  return re.test(str);
};

const validateFlavour = async (operation, { name, price, id }) => {
  let errors = [];
  const currentFlavours = await getFlavourNames();

  // Cannot add flavour that already exists.
  if (operation === "add" && currentFlavours.includes(name)) {
    errors.push(`There\`s already a flavour called ${name}`);
  }

  // Cannot change flavour name to one that already exists.
  if (operation === "update") {
    const otherFlavourNames = await getFlavourNames(id);
    if (otherFlavourNames.includes(name)) {
      errors.push(`There\`s already a flavour called ${name}`);
    }
  }

  // Name must be x or more characters
  if (!stringHasMinimumLength(name, flavourNameMinimumLength)) {
    errors.push(
      `The name of an icecream flavour needs to be at least ${flavourNameMinimumLength} characters long`
    );
  } else {
    // Only letters allowed
    if (!stringConsistsOfLettersOnly(name)) {
      errors.push(
        "The name of an icecream flavour can only consist of the letters a to z and spaces in between."
      );
    }
  }

  if (!isANumber(price)) {
    errors.push("The price needs to be a number.");
  } else {
    // Only useful to validate this value when it's a number
    if (!numberIsInRange(price, flavourLowestPrice, flavourHighestPrice)) {
      // Price must be a number
      errors.push(
        `The price of a kilo of icecream needs to be between ${flavourLowestPrice} and ${flavourHighestPrice}.`
      );
    }
  }
  return errors;
};

// getCustomers
const getCustomers = async () => await io.getItems("customers");

const getCustomerIds = async () => {
  const customers = await getCustomers();
  return customers.map((customer) => customer.id);
};

const getCustomer = async (id) => await io.getItem("customers", id);

const getCustomerEmails = async (filterById = -1) => {
  let customers = await getCustomers();
  if (filterById > 0) {
    customers = customers.filter((customer) => customer.id !== filterById);
  }
  return customers.map((customer) => customer.email);
};

const getOrders = async () => await io.getItems("orders");

const getOrder = async (id) => {
  const orders = await getOrders();
  return orders.find((order) => order.id === id);
};

const validateCustomer = async (operation, { email, name, id }) => {
  let errors = [];

  // E-mail field may not be empty.
  if (operation === "add" && email === "") {
    errors.push("Please enter a valid e-mail address.");
  }

  // When adding a customer, the email cannot be the same as an existing customer.
  const emails = await getCustomerEmails();
  if (operation === "add" && emails.includes(email)) {
    errors.push(
      "This e-mail address is already taken. Provide us with a unique one."
    );
  }

  // When updating a customer, the email cannot be the same as another existing customer.
  if (operation === "update" && emails.includes(email)) {
    errors.push(
      "This e-mail address is already taken. Provide us with a unique one."
    );
  }

  // The name of a customer needs to be at least 2 characters long.
  if ((operation === "add" || operation === "update") && name.length < 2) {
    errors.push("A name should be at least 2 letters long.");
  }

  // The name of a customer can only consist of letters a-z and spaces (upper case is allowed).
  const permittedSymbols = /[a-zA-Z\s]+/g;
  // This 'regular expression' matches letters a to z
  // (both lowercase and uppercase) and spaces '\s'.
  // The plus sign + in a regular expression is a quantifier that indicates one or more occurrences of the preceding pattern.
  // The 'g' stands for Global and finds all matches in the string.

  const nameString = name.toString(); // de parameter wordt naar een string geconverteerd.
  console.log(`Dit is de inhoud van de const 'nameString': ${nameString} `);
  const symbolCheck = nameString.search(permittedSymbols); // Telt het aantal overeenkomende tekens dat nameToString en permittedSymbols met elkaar hebben.
  console.log(`Dit is de waarde van symbolCheck: ${symbolCheck}`);
  console.log(`Dit is de lengte van nameString: ${nameString.length}`);
  console.log(`nameString typof: ${typeof nameString}`);
  if (
    (operation === "add" || operation === "update") &&
    symbolCheck != nameString.length
  ) {
    errors.push(
      "Please only use lowercase letters, uppercase letters and/or spaces."
    );
  }
  return errors;
};

const validateOrder = async (
  _operation,
  { customerId, date, status, orderDescription }
) => {
  let errors = [];

  // Customer must exist.
  const customerIds = await getCustomerIds();
  if (!customerIds.includes(customerId)) {
    errors.push(`Please select a customer for this order.`);
  }

  // Date is required, validation is too complex for now.
  if (date === "") {
    errors.push("Date is a required field");
  }

  // Status must be one of the valid values.
  if (!getOrderStatusList().includes(status)) {
    errors.push("The given status is not valid.");
  }

  // Order description must be x or more characters.
  if (
    !stringHasMinimumLength(orderDescription, orderDescriptionMinimumLength)
  ) {
    errors.push(
      `The description of an order needs to be at least ${orderDescriptionMinimumLength} characters long`
    );
  }
  return errors;
};

const validateAddUpdate = async (operation, itemType, data) => {
  let errors;
  switch (itemType) {
    case "flavours":
      errors = await validateFlavour(operation, data);
      break;
    case "customers":
      errors = await validateCustomer(operation, data);
      break;
    case "orders":
      errors = await validateOrder(operation, data);
      break;
    default:
      errors = ["Incorrect itemType"];
      break;
  }

  return [errors.length > 0, errors];
};

const validateDeleteCustomer = async (id) => {
  let errors = [];
  //  Customers may only be deleted if there are no orders for them.
  const orders = await getOrders();
  const numberOfOrdersForCustomer = orders.filter(
    (order) => order.customerId == id
  ).length;
  if (numberOfOrdersForCustomer > 0) {
    const customer = await getCustomer(id);
    errors.push(
      `Customer "${customer.name}" cannot be deleted, they still have ${numberOfOrdersForCustomer} orders.`
    );
  }
  return errors;
};

const validateDeleteOrder = async (id) => {
  let errors = [];
  //  Orders may only be deleted if they have status "delivered".
  const order = await getOrder(id);

  if (order.status !== "delivered") {
    errors.push(
      "That order cannot be deleted. Only delivered orders can be deleted."
    );
  }

  return errors;
};

const validateDelete = async (itemType, itemId) => {
  let errors = [];
  if (itemType === "customers") {
    errors = await validateDeleteCustomer(itemId);
  }
  if (itemType === "orders") {
    errors = await validateDeleteOrder(itemId);
  }
  return [errors.length > 0, errors];
};

const addItem = (itemType, data) => {
  return io.addItem(itemType, data);
};
const updateItem = (itemType, itemId, data) => {
  return io.updateItem(itemType, itemId, data);
};
const deleteItem = (itemType, itemId) => {
  return io.deleteItem(itemType, itemId);
};

export {
  getItem,
  getItems,
  getCustomerEmails,
  getCustomers,
  getCustomer,
  getOrderStatusList,
  itemTypes,
  addItem,
  updateItem,
  deleteItem,
  validateAddUpdate,
  validateDelete,
};
