import e from "express";
import { makeId, readJsonFile, writeJsonFile } from "./util.service.js";
import { utilService } from "../public/services/util.service.js";
import fs from "fs"


export const bugService = {
  query,
  getById,
  remove,
  save,
};

const PAGE_SIZE = 3
const bugs = readJsonFile("./data/bug.json");


function query({ filterBy, sortBy, pagination }) {
  var bugsToReturn = [...bugs]

  if (filterBy.txt) {
    const regExp = new RegExp(filterBy.txt, 'i')
    bugsToReturn =
      bugsToReturn.filter(bug => regExp.test(bug.title))
  }

  if (filterBy.minSeverity) {
    bugsToReturn =
      bugsToReturn.filter(bug => bug.severity >= filterBy.minSeverity)
  }

  if (filterBy.labels && filterBy.labels.length > 0) {
    bugsToReturn =
      bugsToReturn.filter(bug =>
        filterBy.labels.some(label => bug?.labels?.includes(label)))
  }

  if (sortBy.sortField === 'severity' || sortBy.sortField === 'createdAt') {
    const { sortField } = sortBy

    bugsToReturn.sort((bug1, bug2) =>
      (bug1[sortField] - bug2[sortField]) * sortBy.sortDir)
  } else if (sortBy.sortField === 'title') {
    bugsToReturn.sort((bug1, bug2) =>
      (bug1.title.localeCompare(bug2.title)) * sortBy.sortDir)
  }

  if (pagination.pageIdx !== undefined) {
    const { pageIdx, pageSize } = pagination

    const startIdx = pageIdx * pageSize
    bugsToReturn = bugsToReturn.slice(startIdx, startIdx + pageSize)
  }

  return Promise.resolve(bugsToReturn)
}


function getById(bugId) {
  const bug = bugs.find((bug) => bug._id === bugId);
  if (!bug) return Promise.reject("Bug not found");
  return Promise.resolve(bug);
}

function remove(bugId,loggedinUser) {
  const idx = bugs.findIndex((bug) => bug._id === bugId);
  if (!loggedinUser.isAdmin &&
    bugs[idx].owner._id !== loggedinUser._id) {
    return Promise.reject(`Not your bug`)
    }

    if (idx === -1) return Promise.reject("Bug not found");
    bugs.splice(idx, 1);

    return _saveCars();
  }

  function save(bug, loggedinUser) {
    if (bug._id) {
      const bugToUpdate = bugs.find(currBug => currBug._id === bug._id)
      if (!loggedinUser.isAdmin &&
        bugToUpdate.owner._id !== loggedinUser._id) {
        return Promise.reject(`Not your bug`)
      }
      bugToUpdate.title = bug.title
      bugToUpdate.severity = bug.severity
    } else {
      bug._id = utilService.makeId()
      console.log('loggedinUser:', loggedinUser)
      bug.owner = {
        _id: loggedinUser._id,
        fullname: loggedinUser.fullname
      }
      bugs.push(bug)
    }

    return _savebugsToFile().then(() => bug)
  }

  function _saveCars() {
    return writeJsonFile("./data/bug.json", bugs);
  }

  function _savebugsToFile() {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(bugs, null, 2)
      fs.writeFile('data/bug.json', data, (err) => {
        if (err) {
          loggerService.error('Cannot write to bugs file', err)
          return reject(err)
        }
        resolve()
      })
    })
  }
