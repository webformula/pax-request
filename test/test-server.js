const express = require('express');
const cors = require('cors')

const app = express();

app.use(cors());


app.options('*', cors());
app.get('/base-get', (req, res) => {
  res.send('ok');
});


// Start the server
app.listen({ port: 8082 }, () => {
  console.log('🚀 Server ready at http://localhost:8082');
});

module.exports = app;
