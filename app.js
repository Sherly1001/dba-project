const express = require('express');
const expressEjsLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const router = require('./routers/router');
const api = require('./routers/api');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static('public'));
app.use(express.static('lib'));
app.use(expressEjsLayouts);
app.set('view engine', 'ejs');

app.use('/', router);
app.use('/api', api);

let server = app.listen(process.env.PORT || 3000, () => {
  console.log(server.address());
})
