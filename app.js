const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require('multer');
const upload = multer();


const PORT = 3000;

let frenchMovies = [
  { title: "Le fabuleux destin d'Amélie Poulain", year: 2001} ,
  { title: "Buffet froid"  , year : 1979 },
  { title: "Le diner de cons"  , year : 1998 },
  { title: "De rouille et d'os"  , year : 2012  }
]

app.use('/public', express.static('public'));
// app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", "./views");
app.set("view engine", "ejs");

app.get('/movies', (req, res) => {
  // res.send("Bientôt des films ici-même");
  const title = "Films français des 30 dernières années";
  
  res.render('movies', { movies: frenchMovies , title: title });
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


app.post('/movies', upload.fields([]), (req, res) => {
  if(!req.body) {
    return res.sendStatus(500);
  } else {
    const formData = req.body;
    const title = req.body.movietitle ;
    const year = req.body.movieyear  ;
    console.log(('formData :', formData));
    frenchMovies.push({ title, year });
    res.sendStatus(201);
  }

})

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
