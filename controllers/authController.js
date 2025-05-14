const jwt = require("jsonwebtoken");
const secret =
  "qsdjS12ozehdoIJ123DJOZJLDSCqsdeffdg123ER56SDFZedhWXojqshduzaohduihqsDAqsdq";

const login = (req, res) => {
  res.render("login", { title: "Espace membre" });
};

const fakeUser = {
  email: "testuser@testmail.fr",
  password: "123",
};

const postLogin = (req, res) => {
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
};

const getMemberOnly = (req, res) => {
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
};

module.exports = {
  login,
  postLogin,
  getMemberOnly
}
