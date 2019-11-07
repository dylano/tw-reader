require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cors = require('cors');
const favicon = require('serve-favicon');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');
const appRoutes = require('./routes/appRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cors());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.static(`${__dirname}/public`));
app.use(express.static(`${__dirname}/react-app/build`));
app.set('view engine', 'ejs');

const dbconnect = process.env.MONGODB_URI || 'mongodb://localhost/twreader';
console.log(`Connecting to Mongo: ${dbconnect}`);
mongoose.connect(dbconnect).catch(err => {
  console.log(`fatal: could not connect to mongo:\n${err}`);
  process.exit(1);
});

// ROUTES
app.use('/api', apiRoutes);
app.use('/', appRoutes);

app.get('/app', (req, res) => {
  res.sendFile(`${__dirname}/react-app/build/index.html`);
});

app.listen(PORT, () => {
  console.log(`tw-reader listening on port ${PORT}...`);
});
