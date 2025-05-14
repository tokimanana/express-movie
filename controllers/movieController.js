const Movie = require("../models/movie");

const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.render("movies", { title: "Liste des films", movies });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const postMovie = async (req, res) => {
  try {
    const { movietitle, movieyear } = req.body;
    const newMovie = new Movie({
      movieTitle: movietitle,
      movieYear: movieyear,
    });
    await newMovie.save();
    res.redirect("/movies");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const getMoviesAdd = (req, res) => {
  res.render("movies-add");
};

const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const getMovieDetails = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.render("movie-details", { movieId: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const postMovieDetails = async (req, res) => {
  try {
    const { movietitle, movieyear } = req.body;
    await Movie.findByIdAndUpdate(req.params.id, {
      movieTitle: movietitle,
      movieYear: movieyear,
    });
    res.redirect(`/movie-details/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const putMovieDetails = async (req, res) => {
  try {
    const { movietitle, movieyear } = req.body;
    await Movie.findByIdAndUpdate(req.params.id, {
      movieTitle: movietitle,
      movieYear: movieyear,
    });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const movieSearch = (req, res) => {
    res.render('movie-search');
};

module.exports = {
  getMovies,
  postMovie,
  getMoviesAdd,
  getMovieById,
  getMovieDetails,
  postMovieDetails,
  putMovieDetails,
  deleteMovie,
  movieSearch
};
