import { storageService } from "./async-storage.service.js";
import { utilService } from "./util.service.js";

export const userService = {
  query,
  getById,
  getByUsername,
  add,
  getEmptyCredentials,
};

const USER_KEY = "userDB";
_createUsers();

function query() {
  return storageService.query(USER_KEY);
}

function getById(userId) {
  return storageService.get(USER_KEY, userId);
}

function getByUsername(username) {
  return storageService
    .query(USER_KEY)
    .then((users) => users.find((user) => user.username === username));
}

function add(user) {
  const { username, password, fullname } = user;
  if (!username || !password || !fullname)
    return Promise.reject("Missing credentials");

  return getByUsername(username).then((existingUser) => {
    if (existingUser) return Promise.reject("Username taken");

    return storageService.post(USER_KEY, user).then((user) => {
      delete user.password;
      return user;
    });
  });
}

function getEmptyCredentials() {
  return {
    username: "",
    password: "",
    fullname: "",
  };
}

function _createUsers() {
  let users = utilService.loadFromStorage(USER_KEY);
  if (!users || !users.length) {
    users = [
      {
        _id: "u10000",
        username: "admin",
        fullname: "Admin Adminov",
        password: "admin",
        isAdmin: true,
      },
      {
        _id: "u102",
        username: "nina",
        password: "nina",
        fullname: "Nina Simantov",
      },
      {
        username: "popo",
        password: "popo",
        fullname: "Popo McPopo",
        _id: "tl3ps",
      },
      {
        username: "kiki",
        password: "kiki",
        fullname: "Kiki Ki",
        _id: "6iykr",
      },
      {
        username: "bob",
        password: "bob",
        fullname: "Bobby Bob",
        _id: "GOtHH",
      },
      {
        _id: "u111",
        username: "puki",
        fullname: "Puki Ja",
        password: "puki",
      },
      {
        username: "lala",
        password: "lala",
        fullname: "Lala Shuli",
        _id: "2XtHv",
      },
    ];

    utilService.saveToStorage(USER_KEY, users);
  }
}
