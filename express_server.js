const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs"); 

function generateRandomString(length) {
  const alphanumericChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumericChars.length);
    id += alphanumericChars[randomIndex];
  }
  return id;
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString(6);
  
  urlDatabase[id] = longURL;
  // res.status(201).send('URL successfully saved!');
  res.redirect("/urls") 
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


app.get("/", (req, res) => {
  res.send("Hello")
});

app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}`)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body><html/>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new",{username: req.cookies.username});
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if(longURL){
    res.redirect(longURL)  
  }else{
    res.status(404).send('URL not found')
  }
  });

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id =  generateRandomString(6);
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/u/:id", (req, res) => {
  console.log(req.body.longURL);
  res.send("URL saved");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const newURL = req.body.updatedLongURL;
  urlDatabase[id] = newURL;
  res.redirect("/urls"); // Redirect to the index page after editing the URL
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});