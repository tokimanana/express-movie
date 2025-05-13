const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();
const cors = require("cors");

const jwt = require("jsonwebtoken");
const { expressjwt: expressjwt } = require("express-jwt"); // to verify token on the request header

const faker = require("faker");
const config = require("./config");

const mongoose = require("mongoose");

mongoose.connect(
  `mongodb+srv://${config.user}:${config.password}@expressmovie.gxdzkla.mongodb.net/`
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("connected to the DB");
});

const movieSchema = mongoose.Schema(
  {
    movieTitle: String,
    movieYear: Number,
  },
  { versionKey: false }
);

const Movie = mongoose.model("Movie", movieSchema);

const title = faker.lorem.sentence(3);
const year = Math.floor(Math.random() * 80) + 1950;

const myMovie = new Movie({
  movieTitle: title,
  movieYear: year,
});
myMovie
  .save()
  .then((savedMovie) => {
    console.log("Saved movie : ", savedMovie);
  })
  .catch((err) => {
    console.error(err);
  });

const PORT = 3000;

// to service static files from the public folder
app.use("/public", express.static("public"));

app.use(cors());

const secret =
  "qsdjS12ozehdoIJ123DJOZJLDSCqsdeffdg123ER56SDFZedhWXojqshduzaohduihqsDAqsdq";

// check token on all pages except the ones mentioned in unless()
app.use(
  expressjwt({
    secret: secret,
    algorithms: ["HS256"],
    credentialsRequired: true,
    getToken: function fromHeaderOrQuerystring(req) {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        console.log(
          "Token from Authorization header:",
          req.headers.authorization.split(" ")[1]
        );
        return req.headers.authorization.split(" ")[1];
      }
      return null;
    },
  }).unless({
    path: [
      "/",
      "/movies",
      "/movie-search",
      "/login",
      new RegExp("/movie-details.*/", "i"),
      new RegExp("/movies.*/", "i"),
    ],
  })
);

app.use((err, req, res, next) => {
  console.log("Error middleware triggered:", err.name, err.message);
  if (err.name === "UnauthorizedError") {
    res.status(401).send("Invalid token or token not provided");
  } else {
    next(err);
  }
});

app.set("views", "./views");
app.set("view engine", "ejs");

// let frenchMovies = [
//   { title: "Le fabuleux destin d'Amélie Poulain", year: 2001 },
//   { title: "Buffet froid", year: 1979 },
//   { title: "Le diner de cons", year: 1998 },
//   { title: "De rouille et d'os", year: 2012 },
// ];

app.get("/movies", (req, res) => {
  // res.send("Bientôt des films ici-même");
  const title = "Films français des 30 dernières années";

  frenchMovies = [];
  Movie.find((err, movies) => {
    if (err) {
      console.error("could not retrieve movies from DB", err);
      res.sendStatus(500);
    } else {
      frenchMovies = movies;
      res.render("movies", { movies: frenchMovies, title: title });
    }
  });
});

var urlencoded = bodyParser.urlencoded({ extended: false });

// app.post('/movies', urlencoded, (req, res) => {
//   const title = req.body.movietitle ;
//   const year = req.body.movieyear  ;
//   if(!title || !year){
//     return res.status(400).send("Erreur : Titre et année requis !");
//   }
//   frenchMovies.push({ title, year });
//   console.log("Film ajouté : ", title, year);
//   res.redirect('/movies');
//   // console.log("le titre :", req.body.movietitle);
//   // console.log("l'année :", req.body.movieyear);
// })

app.post("/movies", upload.fields([]), (req, res) => {
  if (!req.body) {
    return res.sendStatus(500);
  } else {
    const formData = req.body;
    // const title = req.body.movietitle;
    // const year = req.body.movieyear;
    // console.log(("formData :", formData));
    // frenchMovies.push({ title, year });
    //res.sendStatus(201);

    const title = req.body.movietitle;
    const year = req.body.movieyear;
    const myMovie = new Movie({ movieTitle: title, movieYear: year });
    myMovie
      .save()
      .then((savedMovie) => {
        console.log("Saved Movie : ", savedMovie);
        res.sendStatus(201);
      })
      .catch((err) => {
        console.error(err);
      });
  }
});

app.get("/movies/add", (req, res) => {
  res.send("créer nouveau film");
});

app.get("/movies/:id", (req, res) => {
  const id = req.params.id;
  res.render("movie-details", { movieId: id });
});

app.get("/movie-deatils/:id", (req, res) => {
  const id = req.params.id;
  Movie.findById(id, (err, movie) => {
    console.log("movie ", movie);
    res.render("/movie-details", { movieId: _id });
  });
});

app.put("/movie-details/:id", urlencoded, (req, res) => {
  const id = req.params.id;
  if (!req.body) {
    return res.sendStatus(500);
  }
  console.log(
    "movietitle: ",
    req.body.movietitle,
    "movieyear",
    req.body.movieyear
  );
  Movie.findByIdAndUpdate(
    id,
    {
      $set: { movieTitle: req.body.movietitle, movieYear: req.body.movieyear },
    },
    { new: true },
    (err, movie) => {
      if (err) {
        console.log(err);
        return res.send("Le film n'a pas pu être mis à jour");
      } else {
        res.redirect("/movies");
      }
    }
  );
});

app.get("/", (req, res) => {
  // res.send("Hello World!!!!");
  res.render("index");
});

app.get("/movie-search", (req, res) => {
  res.render("movie-search");
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Espace membre" });
});

const fakeUser = {
  email: "testuser@testmail.fr",
  password: "123",
};

app.post("/login", urlencoded, (req, res) => {
  console.log("login post", req.body);
  if (!req.body) {
    res.sendStatus(500);
  } else {
    if (
      fakeUser.email === req.body.email &&
      fakeUser.password === req.body.password
    ) {
      const payload = {
        iss: "http://expressmovies.fr",
        user: "Sam",
        role: "moderator",
      };
      const myToken = jwt.sign(payload, secret, { algorithm: "HS256" });
      console.log("Generated token:", myToken);
      res.json(myToken);
    } else {
      res.sendStatus(401);
    }
  }
});

// Replace your existing /member-only route with this
app.get("/member-only", (req, res) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("No token provided");
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extracted:", token);

  try {
    const decoded = jwt.verify(token, secret);
    console.log("Decoded token:", decoded);
    res.send(decoded);
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).send("Invalid token");
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
