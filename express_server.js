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
      
      const newURL = {
        longURL: longURL,
        userID: req.cookies.user_id,
      }
      urlDatabase[id] = newURL;
      res.redirect("/urls") 
    });

    const urlDatabase = {
      "b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userID: "aJ48lW",
      },

      "9sm5xK": {
        longURL:  "http://www.google.com",
        userID: "aJ48lW",
      }
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

    function urlsForUser(id){
      const userURLs = {};
      for (const shortURL in urlDatabase) {
        const url = urlDatabase[shortURL];
        if (url.userID === id) {
          userURLs[shortURL] = url;
        }
      }
      return userURLs;
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
      const userId = req.cookies.user_id;
      if (userId) {
        const user = users[userId];
        const userURLs = urlsForUser(userId);
        const templateVars = {
          urls: userURLs,
          user: user
        };
        res.render("urls_index", templateVars);
      } else {
        res.status(401).end("Please log in to view the page");
      }
    });

    app.get("/urls/new", (req, res) => {
      if(!req.cookies.user_id){
        res.render("login");
      }else {
        res.render("urls_new",{user: users[req.cookies.user_id]});
      }
    });


    app.get("/u/:id", (req, res) => {
      const id = req.params.id;
      const longURL = urlDatabase[id].longURL;
      if(longURL){
        res.redirect(longURL)  
      }else{
        res.status(404).send('URL not found')
      }
      });

    app.post("/urls", (req, res) => {
      if(!req.cookies.user_id){
        res.redirect("/login")
      } else {
      const longURL = req.body.longURL;
      const id =  generateRandomString(6);
      urlDatabase[id] = {
        longURL: longURL,
        userID: req.cookies.user_id
      }
      res.redirect(`/urls/${id}`);
      }
    });

    app.post("/u/:id", (req, res) => {
      console.log(req.body.longURL);
      res.send("URL saved");
    });

    app.post("/urls/:id/delete", (req, res) => {
      const id = req.params.id;
      const url = urlDatabase[id];
      const userId = req.cookies.user_id;
      if(!userId){
        res.status(401).end("Please log in to view the page");        
      }else if(!url) {
        res.status(404).end("URL not found");
      } else if (url.userID !== userId){
        res.status(403).end("You do not have the permission to delete this url")
      }else {
      delete urlDatabase[id];
      res.redirect("/urls");
      }
    });

    app.get("/urls/:id", (req, res) => {
      const id = req.params.id;
      const url = urlDatabase[id];
      const userId = req.cookies.user_id;
      if (!req.cookies.user_id) {
        res.status(401).end("Please log in to view the page");
      } else if (!url) {
        res.status(404).end("URL not found");
      } else if (url.userID !== userId) {
        res.status(403).end("You do not have permission to access this URL");
      } else {
        const templateVars = {
          id: id,
          longURL: url.longURL,
          user: users[userId]
        };
        res.render("urls_show", templateVars);
      }
    });
    

    app.post("/urls/:id/edit", (req, res) => {
      const id = req.params.id;
      const url = urlDatabase[id];
      const userId = req.cookies.user_id;
      if(!url) {
        res.status(404).end("URL not found");
      } else if (url.userID !== userId){
        res.status(403).end("You do not have the permission to edit this url")
      }else {
      const newURL = req.body.updatedLongURL;
      urlDatabase[id].longURL = newURL;
      res.redirect("/urls");
       }
    });

    app.get("/urls/:id/edit", (req, res) => {
      const id = req.params.id;
      const url = urlDatabase[id];
      const userId = req.cookies.user_id;
    
      if (!url) {
        res.status(404).end("URL not found");
      } else if (url.userID !== userId) {
        res.status(403).end("You do not have permission to edit this URL");
      } else {
        const templateVars = {
          id: id,
          longURL: url.longURL,
          user: users[userId]
        };
        res.render("edit_url", templateVars);
      }
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
      if (req.cookies.user_id){
        res.redirect("/urls");
      } else{
        res.render("login")
      }

    });
    app.post("/logout", (req, res) => {
      res.clearCookie("user_id");
      res.redirect("/login");
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
      if(req.cookies.user_id){
        res.redirect("/urls");
      } else{
        res.render("register");
      }
    });
