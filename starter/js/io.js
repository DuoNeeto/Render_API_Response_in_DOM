const ROOT_URL = "http://localhost:3000/";
const API_KEY = "Vz2FpaZAXr0hu9EJP70X";

// A function that returns a function so we can set ROOT_URL and API_KEY exactly
// once.
const generateSendRequest =
  (root_url, api_key) =>
  async (method, url_part = "", body = false) => {
    const url = `${root_url}${url_part}`;
    const options = {
      method,
    };
    if (!["GET", "DELETE"].includes(method)) {
      options.body = JSON.stringify(body);
      options.headers = {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${api_key}`,
      };
    }
    const response = await fetch(url, options);

    let result;
    switch (response.status) {
      case 200:
      case 201:
        result = await response.json();
        break;
      default:
        console.log(`🚨 The backend responded with status ${response.status}.`);
        console.log(`URL: ${url}`);
        console.log(`options:`, options);
        break;
    }
    return result;
  };

// This is the function we're going to call.
const sendRequest = generateSendRequest(ROOT_URL, API_KEY);

const getItems = async (itemType) => {
  const items = await sendRequest("GET", itemType);
  console.table(items);
  return items;
};

const getItem = async (itemType, itemId) => {
  const item = await sendRequest("GET", `${itemType}/${itemId}`);
  console.table(item);
  return item;
};

const addItem = async (itemType, data) => {
  const item = await sendRequest("POST", itemType, data);
  console.table(item);
};

const updateItem = async (itemType, itemId, data) => {
  const item = await sendRequest("PATCH", `${itemType}/${itemId}`, data);
  console.table(item);
};

const deleteItem = async (itemType, itemId) => {
  const toBeDeleted = await sendRequest("DELETE", `${itemType}/${itemId}`);
  console.table(item);
};

export { addItem, getItem, getItems, updateItem, deleteItem };
