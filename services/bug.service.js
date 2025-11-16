import e from "express";
import { makeId, readJsonFile, writeJsonFile } from "./util.service.js";


export const bugService = {
  query,
  getById,
  remove,
  save,
};

const PAGE_SIZE = 3
const bugs = readJsonFile("./data/bug.json");

function query(filterBy = {}) {
  console.log(filterBy)
  var filterBugs = bugs
  if (filterBy.txt) {
    const regExp = new RegExp(filterBy.txt, "i");
    filterBugs = bugs.filter((bug) => regExp.test(bug.title));
  }

  if (filterBy.minSeverity) {
    filterBugs = bugs.filter((bug) => bug.severity >= filterBy.minSeverity);
  }
  if (filterBy.paginationOn) {
    const startIdx = filterBy.pageIdx * PAGE_SIZE
		const endIdx = startIdx + PAGE_SIZE
		filterBugs = filterBugs.slice(startIdx, endIdx)
    console.log(startIdx,endIdx)
	}
  return Promise.resolve(filterBugs);
}

function getById(bugId) {
  const bug = bugs.find((bug) => bug._id === bugId);
  if (!bug) return Promise.reject("Bug not found");
  return Promise.resolve(bug);
}

function remove(bugId) {
  const idx = bugs.findIndex((bug) => bug._id === bugId);

  if (idx === -1) return Promise.reject("Bug not found");
  bugs.splice(idx, 1);

  return _saveCars();
}

function save(bug) {
  if (bug._id) {
    const idx = bugs.findIndex((b) => b._id === bug._id);
    if (idx === -1) return Promise.reject("Bug not found");
    bugs[idx] = { ...bugs[idx], ...bug }; //patch
  } else {
    bug._id = makeId();
    bug.createdAt = Date.now();
    bugs.push(bug);
  }
  return _saveCars().then(() => bug);
}

function _saveCars() {
  return writeJsonFile("./data/bug.json", bugs);
}
