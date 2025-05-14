const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();
const cors = require("cors");
const { expressjwt: expressjwt } = require("express-jwt");
const config = require("./config");
const movieController = require("./controllers/movieController");
const authController = require('./controllers/authController');

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

app.get("/", (req, res) => {
  res.render("index");
});


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

app.get("/movies", movieController.getMovies);

var urlencoded = bodyParser.urlencoded({ extended: false });

app.post("/movies", upload.fields([]), movieController.postMovie);

app.get("/movies/add", movieController.getMoviesAdd);

app.get("/movies/:id", movieController.getMovieById);

app.get('/movie-details/:id', movieController.getMovieDetails);

app.post('/movie-details/:id',  urlencodedParser, movieController.postMovieDetails);

app.put("/movie-details/:id", upload.fields([]), movieController.putMovieDetails);

app.delete("/movie-details/:id", upload.fields([]), movieController.deleteMovie);

app.get('/movie-search', movieController.movieSearch);

app.get('/login', authController.login);

app.post("/login", urlencoded, authController.postLogin);

app.get('/member-only', authController.getMemberOnly);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
