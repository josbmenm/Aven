require('dotenv').config();

const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello there world 2');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server started on ${port}`);
});
