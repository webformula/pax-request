const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const privateKey = 'aprivatkey123';

const app = express();

module.exports = new Promise((resolve) => {;
// Start the server
  const server = app.listen({ port: 8082 }, () => {
    console.log('🚀 Server ready at http://localhost:8082');
    resolve(server);
  });

});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors());
app.options('*', cors());



app.get('/base-get', (req, res) => {
  res.send('ok');
});

app.post('/base-post', (req, res) => {
  res.send('ok');
});

app.patch('/base-patch', (req, res) => {
  res.send('ok');
});

app.put('/base-put', (req, res) => {
  res.send('ok');
});

app.delete('/base-delete', (req, res) => {
  res.send('ok');
});

app.head('/base-head', (req, res) => {
  res.send('ok');
});

// return back json recieved
app.post('/send-recieve-json', (req, res) => {
  const { body } = req;
  res.send(body);
});

// return params back as json
app.post('/params-to-json', (req, res) => {
  const { query } = req;
  res.send(query);
});


// return back json recieved
app.get('/timeout', (req, res) => {
});



// ---- JWT ----
// return back json recieved
app.get('/auth', (req, res) => {
  jwt.verify(req.headers.authorization.replace('Bearer ', ''), privateKey, (err, decoded) => {
    if (err) return res.status(401).send();
    res.send();
  });
});

app.post('/token', (req, res) => {
  const { body: { grant_type, refresh_token } } = req;
  if (grant_type !== 'refresh_token') return res.status(401).send();
  // we assume the token is valid for this request
  if (!refresh_token) return res.status(401).send();

  // TODO gerenate jwt
  res.send({
    token_type: 'Bearer',
    access_token: jwt.sign({
      foo: 'bar',
    }, privateKey, {
      expiresIn: '1s'
    })
  });
});
