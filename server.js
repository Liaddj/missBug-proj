import express from "express";

import { bugService } from "./services/bug.service.js";
import { loggerService } from "./services/logger.service.js";

const app = express();
app.use(express.static("public"));
app.use(express.json())

app.put("/api/bug/:id", (req, res) => {
  console.log(req.body)
  const {  _id, title, description, severity } = req.body;
  const bug = { _id, title, description, severity };
  bugService
    .save(bug)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error(err);      res.status(404).send(err);
    });
})
app.post("/api/bug", (req, res) => {
  const {title, description, severity } = req.body;
  const bug = { title, description, severity };

  bugService
    .save(bug)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error(err);      res.status(404).send(err);
    });
})

app.get("/api/bug", (req, res) => {
  const filterBy =  {
    txt: req.query.txt || '',
    minSeverity: +req.query.minSeverity || 0,
    paginationOn: req.query.paginationOn === 'true',
    pageIdx: +req.query.pageIdx
  }
  bugService.query(filterBy)
  .then((bugs) => res.send(bugs));
})

app.get("/api/bug/:id", (req, res) => {
  const bugId = req.params.id;
  bugService
    .getById(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error(err);
      res.status(404).send(err);
    });
})

app.delete("/api/bug/:id", (req, res) => {
  const bugId = req.params.id;

  bugService
    .remove(bugId)
    .then(() => res.send("OK"))
    .catch((err) => {
      loggerService.error(err);
      res.status(404).send(err);
    });
})


const port = 3030;
app.listen(port, () =>
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)
