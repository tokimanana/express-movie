const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
  movieTitle: String,
  movieYear: Number,
});

module.exports = mongoose.model("Movie", movieSchema);
