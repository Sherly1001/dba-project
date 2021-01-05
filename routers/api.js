const express = require('express');
const pg = require('pg');
const create_hash = require('create-hash');

const sha256 = str => create_hash('sha256').update(str).digest('hex');
const valid_pass = (a, b) => a == b || a == sha256(b) || sha256(a) == b;

const db = new pg.Client(process.env.db_connect);
db.connect(err => {
  console.log(db.host + ' connected');
})

const api = new express.Router();

api.get('/', (req, res) => {
  res.json(req.query);
})

api.post('/', (req, res) => {
  res.json(req.body);
})

api.get('/login', async (req, res) => {
  if (req.query.user) {
    let rs = await db.query('select * from admin where username = $1', [req.query.user]);
    if (rs.rowCount > 0 && valid_pass(rs.rows[0].pass, req.query.pass)) {
      res.json({user: req.query.user, pass: sha256(rs.rows[0].pass), role: 'admin', result: true});
    } else {
      rs = await db.query('select name, username, pass from tutors where username = $1', [req.query.user]);
      if (rs.rowCount > 0 && valid_pass(rs.rows[0].pass, req.query.pass)) {
        res.json({user: req.query.user, pass: sha256(rs.rows[0].pass), name: rs.rows[0].name, role: 'tutor', result: true});
      } else {
        rs = await db.query('select name, username, pass from parrents where username = $1', [req.query.user]);
        if (rs.rowCount > 0 && valid_pass(rs.rows[0].pass, req.query.pass)) {
          res.json({user: req.query.user, pass: sha256(rs.rows[0].pass), name: rs.rows[0].name, role: 'parrent', result: true});
        } else {
          res.json({result: false});
        }
      }
    }
  }
  else {
    res.json({result: false});
  }
})

api.post('/signin', (req, res) => {
  db.query('insert into tutors (name, phone, username, pass) values ($1, $2, $3, $4)', req.body.tutor_info)
  .then(async rs => {
    for (let i in req.body.free_time) {
      await db.query('insert into datetime (day, morning, noon, night) values ($1, $2, $3, $4) on conflict do nothing', req.body.free_time[i]);
      let datetime = await db.query('select datetime_id from datetime where day = $1 and morning = $2 and noon = $3 and night = $4', req.body.free_time[i]);
      let tutor = await db.query('select tutor_id from tutors where username = $1', [req.body.tutor_info[2]]);
      await db.query('insert into tutor_times (tutor_id, datetime_id) values ($1, $2)', [tutor.rows[0].tutor_id, datetime.rows[0].datetime_id]);
    }
    res.json({result: true});
  }).catch(err => res.json({err: err, result: false}));
})

module.exports = api;
