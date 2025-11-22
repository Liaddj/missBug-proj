import express from "express";
import cookieParser from "cookie-parser";
import path from "path";

import { bugService } from "./services/bug.service.js";
import { loggerService } from "./services/logger.service.js";
import { userService } from "./services/user.service.js";
import { authService } from "./services/auth.service.js";

const app = express();

app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

app.get("/api/bug", (req, res) => {
  const queryOptions = parseQueryParams(req.query);

  bugService
    .query(queryOptions)
    .then((bugs) => {
      res.send(bugs);
    })
    .catch((err) => {
      loggerService.error("Cannot get bugs", err);
      res.status(400).send("Cannot get bugs");
    });
});

function parseQueryParams(queryParams) {
  const filterBy = {
    txt: queryParams.txt || "",
    minSeverity: +queryParams.minSeverity || 0,
    labels: queryParams.labels || [],
  };

  const sortBy = {
    sortField: queryParams.sortField || "",
    sortDir: +queryParams.sortDir || 1,
  };

  const pagination = {
    pageIdx:
      queryParams.pageIdx !== undefined
        ? +queryParams.pageIdx || 0
        : queryParams.pageIdx,
    pageSize: +queryParams.pageSize || 3,
  };

  return { filterBy, sortBy, pagination };
}

app.get("/api/bug/:bugId", (req, res) => {
  const { bugId } = req.params;
  const { visitBugIds = [] } = req.cookies;

  if (!visitBugIds.includes(bugId)) visitBugIds.push(bugId);
  if (visitBugIds.length > 3) return res.status(429).send("Wait for a bit");

  res.cookie("visitBugIds", visitBugIds, { maxAge: 1000 * 10 });

  bugService
    .getById(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error("Cannot get bug", err);
      res.status(400).send("Cannot get bug");
    });
});

app.post("/api/bug", (req, res) => {
  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedinUser) return res.status(401).send('Cannot add bug')

  const bug = {
    title: req.body.title,
    description: req.body.description || "",
    severity: +req.body.severity,
    labels: req.body.labels || [],
  };

  if (!bug.title || bug.severity === undefined)
    return res.status(400).send("Missing required fields");

  bugService
    .save(bug, loggedinUser)
    .then((savedBug) => res.send(savedBug))
    .catch((err) => {
      loggerService.error("Cannot save bug", err);
      res.status(400).send("Cannot save bug");
    });
});

app.put("/api/bug/:bugId", (req, res) => {
  const { title, description, severity, labels, _id } = req.body;

  if (!_id || !title || severity === undefined)
    return res.status(400).send("Missing required fields");
  const bug = {
    _id,
    title,
    description,
    severity: +severity,
    labels: labels || [],
  };

  bugService
    .save(bug)
    .then((savedBug) => res.send(savedBug))
    .catch((err) => {
      loggerService.error("Cannot save bug", err);
      res.status(400).send("Cannot save bug");
    });
});

app.delete("/api/bug/:bugId", (req, res) => {
  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedinUser) return res.status(401).send('Cannot add bug')

  const { bugId } = req.params;

  bugService
    .remove(bugId, loggedinUser)
    .then(() => {
      loggerService.info(`Bug ${bugId} removed`);
      res.status(204).send("Removed!");
    })
    .catch((err) => {
      loggerService.error("Cannot get bug", err);
      res.status(400).send("Cannot get bug");
    });
});

// Auth API

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  authService.checkLogin({ username, password })
    .then(user => {
      const loginToken = authService.getLoginToken(user)
      res.cookie('loginToken', loginToken)
      res.send(user)
    })
    .catch(err => {
      loggerService.error('Cannot signup', err)
      res.status(404).send('Invalid Credentials')
    })
})

app.post('/api/auth/signup', (req, res) => {
  const { username, password, fullname } = req.body
  userService.add({ username, password, fullname })
    .then(user => {
      const loginToken = authService.getLoginToken(user)
      res.cookie('loginToken', loginToken)
      res.send(user)
    })
    .catch(err => {
      loggerService.error('Cannot signup', err)
      res.status(400).send('Cannot signup')
    })
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('loginToken')
  res.send('logged-out!')
})



// Fallback route
app.get('/*all', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})


const PORT = process.env.PORT || 3030

app.listen(PORT, () =>
  loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)
