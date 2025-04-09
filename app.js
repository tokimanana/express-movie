const express = require("express");
const app = express();

const PORT = 3000;

app.use('/public', express.static('public'));

app.set("views", "./views");
app.set("view engine", "ejs");

app.get('/movies', (req, res) => {
  // res.send("Bientôt des films ici-même");
  const title = "Films français des 30 dernières années";
  const frenchMovies = [
    { title: "Le fabuleux destin d'Amélie Poulain", year: 2001} ,
    { title: "Buffet froid"  , year : 1979 },
    { title: "Le diner de cons"  , year : 1998 },
    { title: "De rouille et d'os"  , year : 2012  }
  ]
  console.log(frenchMovies);
  console.log('ok');
  res.render('movies', { movies: frenchMovies , title: title });
});

// app.get('/movie-details', (req, res) => {
//   res.render('movie-details')
// })

app.get('/movies/add', (req, res) => {
  res.send("créer nouveau film");
});

app.get('/movies/:id', (req, res) => {
  const id = req.params.id;
  res.render('movie-details', { movieId: id })
});

app.get("/", (req, res) => {
  // res.send("Hello World!!!!");
  res.render("index");
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
