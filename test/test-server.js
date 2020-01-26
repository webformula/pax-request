const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')

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

// return back json recieved
app.get('/timeout', (req, res) => {
});
