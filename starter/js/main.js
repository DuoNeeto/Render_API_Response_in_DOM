import { addEventListeners } from "./events.js";
addEventListeners();

import { addItem, getItem, getItems, updateItem, deleteItem } from "./io.js";

/* // TEST IO CALLS
getItems("customers");
getItem("flavours", "1");

// addItem call
// New flavour 'options object'
const newFlavourData = {
  name: "Shit",
  price: 2.0,
};

addItem("flavours", newFlavourData);
getItems("flavours");

// updateItem Call
// Update 'Options Object'
const updateCustomersData = {
  name: "Wanky Wallace",
  email: "wanker@wanky.co.uk",
};
updateItem("customers", 3, updateCustomersData);

// deleteItem Call
deleteItem("orders", 2); */
