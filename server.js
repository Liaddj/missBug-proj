import express from "express";

import { bugService } from "./services/bug.service.js";
import { loggerService } from "./services/logger.service.js";

const app = express();
app.use(express.static("public"));

app.get("/api/bug/save", (req, res) => {
  const { id: _id, title, description, severity } = req.query;
  const bug = { _id, title, description, severity: +severity };

  bugService
    .save(bug)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error(err);      res.status(404).send(err);
    });
});

app.get("/api/bug", (req, res) => {
  bugService.query().then((bugs) => res.send(bugs));
});

app.get("/api/bug/:id", (req, res) => {
  const bugId = req.params.id;
  bugService
    .getById(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error(err);
      res.status(404).send(err);
    });
});

app.get("/api/bug/:id/remove", (req, res) => {
  const bugId = req.params.id;

  bugService
    .remove(bugId)
    .then(() => res.send("OK"))
    .catch((err) => {
      loggerService.error(err);
      res.status(404).send(err);
    });
});

app.get("/puki", (req, res) => {
  res.send("Hello Puki");
});

app.get("/mama", (req, res) => {
  res.send("Hello Mama Moo");
});

app.get("/nono", (req, res) => res.redirect("/mama"));

const port = 3030;
app.listen(port, () =>
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
);
