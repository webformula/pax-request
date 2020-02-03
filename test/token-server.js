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

  const token = req.cookies && req.cookies.refresh_token;
  jwt.verify((token || '').replace('Bearer ', ''), privateKey, (err, decoded) => {
    if (err) return res.status(401).send();

    res.send({
      token_type: 'Bearer',
      access_token: jwt.sign({
        foo: 'access 1',
      }, privateKey, {
        expiresIn: '1m'
      })
    });
  });
});

app.post('/authenticate', (req, res) => {
  const refreshToken = jwt.sign({
    foo: 'refresh 1',
  }, privateKey, {
    expiresIn: '1h'
  });

  const accessToken = jwt.sign({
    foo: 'access 1-2',
  }, privateKey, {
    expiresIn: '3s'
  });

  res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 1 * 60 * 60 * 1000 });
  res.send({ access_token: accessToken });
});


app.post('/logout', (req, res) => {
  res.clearCookie('refresh_token');
  res.end();
});



app.post('/token-config2', (req, res) => {
  const { body: { refresh_token } } = req;

  jwt.verify((refresh_token || '').replace('Bearer ', ''), privateKey, (err, decoded) => {
    if (err) return res.status(401).send();

    const access_token = jwt.sign({
      foo: 'access 2-1',
    }, privateKey, {
      expiresIn: '1m'
    });

    res.send({ access_token });
  });
});

app.post('/authenticate-config2', (req, res) => {
  const refresh_token = jwt.sign({
    foo: 'refresh 2',
  }, privateKey, {
    expiresIn: '2m'
  });

  const access_token = jwt.sign({
    foo: 'access 2',
  }, privateKey, {
    expiresIn: '1s'
  });

  res.send({ access_token, refresh_token });
});
