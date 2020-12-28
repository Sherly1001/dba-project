const express = require('express');
const expressEjsLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const cors = require('cors');
const reload = require('reload');

require('dotenv').config();

const router = require('./routers/router');
const api = require('./routers/api');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static('public'));
app.use(expressEjsLayouts);
app.set('view engine', 'ejs');

app.use('/', router);
app.use('/api', api);

let server = app.listen(3000, () => {
  console.log(server.address());
})

reload(app);
