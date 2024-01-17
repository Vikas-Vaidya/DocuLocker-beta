const express = require("express");
const path = require("path");
const fs = require("node:fs");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this directory already exists
  },
  filename: (req, file, cb) => {
    // Use the original file name
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const app = express();

app.use(express.static("public"));
app.use(express.static("uploads"))
app.use(express.json());
app.use(cookieParser());

app.get("/generator", (req, res) => {
  res.sendFile(path.join(__dirname, "password-generator.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});
app.post("/login", (req, res) => {
  file = fs.readFileSync("users.json");
  users = JSON.parse(file);
  if (
    req.body.email in users &&
    req.body.password == users[req.body.email].password
  ) {
    res.cookie("email", req.body.email);
    res.send(JSON.stringify({ status: "okay" }));
  } else {
    res.status(401);
    res.send(JSON.stringify({ error: "not okay" }));
  }
});
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});
app.post("/signup", (req, res) => {
  file = fs.readFileSync("users.json");
  users = JSON.parse(file);
  users[req.body.email] = {
    password: req.body.password,
    creds: [],
    files: [],
  };
  fs.writeFileSync("users.json", JSON.stringify(users));
  res.send(JSON.stringify({ status: "ok" }));
});
app.get("/vault", (req, res) => {
  res.sendFile(path.join(__dirname, "vault.html"));
});

app.post("/save", (req, res) => {
  user = req.cookies.email;
  file = fs.readFileSync("users.json");
  users = JSON.parse(file);
  users[user].creds.push({
    name: req.body.name,
    username: req.body.username,
    password: req.body["masterPassword"],
    folder: req.body.folder,
    notes: req.body.notes,
  });
  fs.writeFileSync("users.json", JSON.stringify(users));
  res.send(JSON.stringify({ status: "ok" }));
});

app.get("/files", (req, res) => {
  res.sendFile(path.join(__dirname, "file-upload.html"));
});

app.post("/upload", upload.single("file"), (req, res) => {
  user = req.cookies.email;
  file = fs.readFileSync("users.json");
  users = JSON.parse(file);
  users[user].files.push(req.file.filename);
  fs.writeFileSync("users.json", JSON.stringify(users));
  res.send({ message: "File uploaded successfully." });
});

app.get("/list", (req, res) => {
  user = req.cookies.email;
  file = fs.readFileSync("users.json");
  users = JSON.parse(file);
  res.json(users[user].creds);
});

app.get("/pass", (req,res)=>{
  user = req.cookies.email;
  file = fs.readFileSync("users.json");
  users = JSON.parse(file);
  res.json({files: users[user].files});
})

app.get("/gen", (req, res) => {
  res.sendFile(path.join(__dirname, "gen.html"));
});

app.listen(3030, () => {
  console.log("app started");
});
