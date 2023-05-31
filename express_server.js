  const express = require("express");
  const cookieParser = require("cookie-parser");
  const app = express();
  const PORT = 8080;
  app.set("view engine", "ejs"); 
  const users = {
    user1RandomID:{
      ID: "user1RandomID",
      email: "example@gmail.com",
      Password: "purple-monkey-dinosaur",
    },
    user2RandomID: {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    }
  };

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
  function getUserByEmail(email) {
    for (const userId in users) {
      const user = users[userId];
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

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
    const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id]};
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new",{user: users[req.cookies.user_id]});
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
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies.user_id] };
    res.render("urls_show", templateVars);
  });

  app.post("/urls/:id/edit", (req, res) => {
    const id = req.params.id;
    const newURL = req.body.updatedLongURL;
    urlDatabase[id] = newURL;
    res.redirect("/urls"); // Redirect to the index page after editing the URL
  });

  app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = getUserByEmail(email);

  if (user && user.password === password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(401).send("Invalid email or password");
  }
});

  app.get("/login", (req, res) => {
    res.render("login");

  });
  app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/urls");
  });

  app.post("/register", (req, res) => {
    const { email, password } = req.body;
    const id = generateRandomString(6);
    
    if(getUserByEmail(email)) {
        res.status(400).end(`${email} is already registered`);
      } else { 
        users[id] = { id, email, password };
        res.cookie("user_id", id);
        res.redirect("/urls");
      }
  });

  app.get("/register", (req, res) => {
    res.render("register");
  });
