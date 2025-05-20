const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();
const cors = require("cors");
const { expressjwt: expressjwt } = require("express-jwt");
const config = require("./config");
const movieController = require("./controllers/movieController");
const authController = require("./controllers/authController");

const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect(
  `mongodb+srv://${config.user}:${config.password}.@expressmovie.tsqqcvd.mongodb.net/`
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const PORT = 3000;

// to service static files from the public folder
app.use("/public", express.static("public"));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Apply JWT middleware only to protected routes
const requireAuth = expressjwt({
  secret: config.secret,
  algorithms: ["HS256"],
  credentialsRequired: true,
  getToken: function fromHeaderOrQuerystring(req) {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      return req.headers.authorization.split(" ")[1];
    }
    return null;
  },
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.log("Error middleware triggered:", err.name, err.message);
  if (err.name === "UnauthorizedError") {
    res.status(401).send("Invalid token or token not provided");
  } else {
    next(err);
  }
});

// View engine setup
app.set("views", "./views");
app.set("view engine", "ejs");

// Middleware configuration
var urlencoded = bodyParser.urlencoded({ extended: false });

// Public routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/movies", movieController.getMovies);
app.get("/movie-search", movieController.movieSearch);
app.get("/login", authController.login);
app.post("/login", urlencoded, authController.postLogin);

// Movie CRUD routes
app.post("/movies", upload.fields([]), movieController.postMovie);
app.get("/movies/add", movieController.getMoviesAdd);
app.get("/movies/:id", movieController.getMovieById);
app.get("/movie-details/:id", movieController.getMovieDetails);
app.post("/movie-details/:id", urlencoded, movieController.postMovieDetails);
app.put(
  "/movie-details/:id",
  upload.fields([]),
  movieController.putMovieDetails
);
app.delete(
  "/movie-details/:id",
  upload.fields([]),
  movieController.deleteMovie
);

// Protected routes
app.get("/member-only", requireAuth, authController.getMemberOnly);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
