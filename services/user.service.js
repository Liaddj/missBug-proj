import fs from "fs";
import { utilService } from "./util.service.js";
import { get } from "http";

const users = utilService.readJsonFile("data/user.json");

export const userService = {
  query,
  getById,
  getByUsername,
  remove,
  add,
};

function query() {
  const usersToReturn = users.map((user) => ({
    _id: user._id,
    fullname: user.fullname,
    username: user.username,
    score: user.score,
  }));

  return Promise.resolve(usersToReturn);
}

function getById(userId) {
  var user = users.find((user) => user.id === userId);
  if (!user) return Promise.reject("User not flound");

  user = { ...user };
  delete user.passsword;

  return Promise.resolve(user);
}

function getByUsername(username) {
  var user = users.find((user) => user.username === username);
  return Promise.resolve(user);
}

function remove(userId) {
  users = users.filter((user) => user._id !== userId);
  return _saveUsersToFile();
}

function add(user) {
  return getByUsername(user.username).then((existingUser) => {
    if (existingUser) return Promise.reject("Username taken");

    user._id = utilService.makeId();
    users.push(user);

    return _saveUsersToFile().then(() => {
      user = { ...user };
      delete user.password;
      return user;
    });
  });
}



function _saveUsersToFile() {
    return new Promise((resolve, reject) => {
        const usersStr = JSON.stringify(users, null, 4)
        fs.writeFile('data/user.json', usersStr, err => {
            if (err) {
                return console.log(err)
            }
            resolve()
        })
    })
}