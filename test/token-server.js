const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const privateKey = 'aprivatkey123';

const app = express();

module.exports = new Promise((resolve) => {;
// Start the server
  const server = app.listen({ port: 8083 }, () => {
    console.log('🚀 Server ready at http://localhost:8083');
    resolve(server);
  });

});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({
  origin: true,
  credentials: true
}));
app.options('*', cors());


app.post('/token', (req, res) => {
  const { body: { grant_type } } = req;
  if (grant_type !== 'refresh_token') return res.status(401).send();
  // we assume the token is valid for this request
  const token = req.cookies && req.cookies.refresh_token;
  if (!token) return res.status(401).send();

  // TODO gerenate jwt
  res.send({
    token_type: 'Bearer',
    access_token: jwt.sign({
      foo: 'bar',
    }, privateKey, {
      expiresIn: '1m'
    })
  });
});

app.post('/authenticate', (req, res) => {
  const refreshToken = jwt.sign({
    foo: 'bar',
  }, privateKey, {
    expiresIn: '1h'
  });

  const accessToken = jwt.sign({
    foo: 'bar2',
  }, privateKey, {
    expiresIn: '1s'
  });

  res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 1 * 60 * 60 * 1000 });
  res.send({ access_token: accessToken });
});


app.post('/logout', (req, res) => {
  res.clearCookie('refresh_token');
  res.end();
});
