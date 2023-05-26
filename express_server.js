const express = require("express");
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

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString(6);
  
  urlDatabase[id] = longURL;
  res.status(201).send('URL successfully saved!');
});

app.use(express.urlencoded({ extended: true }));

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
