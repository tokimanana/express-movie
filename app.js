const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();
const cors = require("cors");

const jwt = require("jsonwebtoken");
const { expressjwt: expressjwt } = require("express-jwt");

const faker = require("faker");
const config = require("./config");

const mongoose = require("mongoose");

// First define the schema
const movieSchema = mongoose.Schema(
  {
    movieTitle: String,
    movieYear: Number,
  },
  { versionKey: false }
);

// Then create the model
const Movie = mongoose.model("Movie", movieSchema);

// Connect to MongoDB
mongoose.connect(
  `mongodb+srv://tokimananasarobidy:JesosyFamonjena.@expressmovie.tsqqcvd.mongodb.net/`
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");

  // Only create and save the movie after successful connection
  // const title = faker.lorem.sentence(3);
  // const year = Math.floor(Math.random() * 80) + 1950;

  // const myMovie = new Movie({
  //   movieTitle: title,
  //   movieYear: year,
  // });

  // myMovie
  //   .save()
  //   .then((savedMovie) => {
  //     console.log("Saved movie:", savedMovie);
  //   })
  //   .catch((err) => {
  //     console.error("Error saving movie:", err);
  //   });
});

const PORT = 3000;

// to service static files from the public folder
app.use("/public", express.static("public"));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

app.get("/movies", async (req, res) => {
  const title = "Films français des 30 dernières années";

  try {
    const movies = await Movie.find();
    res.render("movies", { movies: movies, title: title });
  } catch (err) {
    console.error("could not retrieve movies from DB", err);
    res.sendStatus(500);
  }
});

var urlencoded = bodyParser.urlencoded({ extended: false });

app.post("/movies", upload.fields([]), (req, res) => {
  if (!req.body) {
    return res.sendStatus(500);
  } else {
    const formData = req.body;
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

app.get("/movie-details/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const movie = await Movie.findById(id);
    console.log("movie ", movie);

    // Check if the request wants JSON (for API) or HTML (for browser)
    const acceptHeader = req.headers.accept || "";
    if (acceptHeader.includes("application/json")) {
      return res.json({ movie: movie });
    }

    res.render("movie-details", { movieId: movie._id });
  } catch (err) {
    console.error("Error finding movie:", err);
    res.status(404).send("Movie not found");
  }
});

app.put("/movie-details/:id", upload.fields([]), async (req, res) => {
  const id = req.params.id;
  if (!req.body) {
    return res.status(400).send("Request body is missing");
  }

  // Log detailed request information for debugging
  console.log("Request headers:", req.headers);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Request body:", req.body);
  console.log("Request body type:", typeof req.body);
  console.log("Request body keys:", Object.keys(req.body));

  // Extract data from multipart/form-data request
  const movieTitle = req.body.movietitle;
  const movieYear = req.body.movieyear;

  console.log("movietitle:", movieTitle, "movieyear:", movieYear);

  // Validate inputs
  if (!movieTitle && !movieYear) {
    return res.status(400).send("Both movie title and year are missing");
  }

  // Build update object with only provided fields
  const updateObj = {};
  if (movieTitle) updateObj.movieTitle = movieTitle;
  if (movieYear) updateObj.movieYear = parseInt(movieYear, 10) || movieYear;

  try {
    const movie = await Movie.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true }
    );

    if (!movie) {
      return res.status(404).send("Film non trouvé");
    }

    res.json({
      success: true,
      message: "Film mis à jour avec succès",
      movie: movie,
    });
    res.redirect('/movies');
  } catch (err) {
    console.log("Error updating movie:", err);
    res.status(500).send("Le film n'a pas pu être mis à jour");
  }
});

app.get("/", (req, res) => {
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
