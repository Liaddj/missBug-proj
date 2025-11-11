const BASE_URL = `/api/bug/`;
const PAGE_SIZE = 3

export const bugService = {
  query,
  getById,
  save,
  remove,
  getDefaultFilter,
};

function query(filterBy) {
  const queryParams = `?txt=${filterBy.txt}&minSeverity=${filterBy.minSeverity}`;
  return axios.get(BASE_URL + queryParams).then((res) => res.data);
}

function getById(bugId) {
  return axios.get(BASE_URL + bugId);
}

function remove(bugId) {
  return axios.get(BASE_URL + bugId + `/remove`);
}

function save(bug) {
  const queryParams =
    `save?` +
    `_id=${bug._id || ""}&` +
    `title=${bug.title}&` +
    `severity=${bug.severity}&` +
    `description=${bug.description}`;

  return axios.get(BASE_URL + queryParams).then((res) => res.data);
}

function getDefaultFilter() {
  return { txt: "", minSeverity: 0, pageIdx: 0, paginationOn: true };
}
