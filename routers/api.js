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
    try {
      for (let i in req.body.free_time) {
        await db.query('insert into datetime (day, morning, noon, night) values ($1, $2, $3, $4) on conflict do nothing', req.body.free_time[i]);
        let datetime = await db.query('select datetime_id from datetime where day = $1 and morning = $2 and noon = $3 and night = $4', req.body.free_time[i]);
        let tutor = await db.query('select tutor_id from tutors where username = $1', [req.body.tutor_info[2]]);
        await db.query('insert into tutor_times (tutor_id, datetime_id) values ($1, $2)', [tutor.rows[0].tutor_id, datetime.rows[0].datetime_id]);
      }
      res.json({result: true});
    } catch(err) {
      res.json({err: err, result: false});
    }
  }).catch(err => res.json({err: err, result: false}));
})

api.get('/class', (req, res) => {
  let status_id = req.query.status_id || 1;
  let limit = req.query.limit || 20;
  let next = req.query.next || 0;
  db.query(`select class_id, grade, subject_name, day, morning, noon, night from class_times
  natural join class
  natural join subjects
  natural join datetime
  where class_id in (
    select class_id from enrollments
    where status_id = $1
    group by class_id
    order by class_id
    limit $2
    offset $3
  )`, [status_id, limit, next * limit]).then(rs => {
    let classes = rs.rows.reduce((acc, i) => {
      let curr = acc.findIndex(e => e.class_id == i.class_id);
      if (curr < 0) {
        acc.push({
          class_id: i.class_id,
          grade: i.grade,
          subject_name: i.subject_name,
          times: [{day: i.day, morning: i.morning, noon: i.noon, night: i.night}]
        })
      } else {
        acc[curr].times.push({day: i.day, morning: i.morning, noon: i.noon, night: i.night});
      }
      return acc;
    }, []);
    res.json({result: classes});
  }).catch(err => res.json({err: err, result: false}));
})

api.get('/enroll', (req, res) => {
  db.query('select tutor_id from tutors where username = $1', [req.query.user])
  .then(rs => {
    db.query('insert into enrollments (tutor_id, class_id) values ($1, $2)', [rs.rows[0].tutor_id, req.query.class_id])
    .then(rs => {
      res.json({result: true});
    }).catch(err => res.json({err: err, result: false}));
  }).catch(err => res.json({err: err, result: false}));
})

api.get('/total-class', (req, res) => {
  let status_id = req.query.status_id || 1;
  db.query('select count(distinct class_id) from enrollments where status_id = $1', [status_id])
  .then(rs => {
    res.json({result: rs.rows[0].count});
  }).catch(err => res.json({err: err, result: false}));
})

api.get('/check-enroll', (req, res) => {
  db.query('select tutor_id from tutors where username = $1', [req.query.user])
  .then(rs => {
    db.query('select enroll_id from enrollments where tutor_id = $1 and class_id = $2', [rs.rows[0].tutor_id, req.query.class_id])
    .then(rs => {
      res.json({result: rs.rowCount});
    }).catch(err => res.json({err: err, result: false}));
  }).catch(err => res.json({err: err, result: false}));
})

api.get('/subjects', (req, res) => {
  db.query('select * from subjects')
  .then(rs => {
    res.json({result: rs.rows});
  }).catch(err => res.json({err: err, result: false}));
})

api.post('/new-class', (req, res) => {
  db.query('insert into class (subject_id, grade) values ($1, $2) returning class_id', req.body.class_info)
  .then(async rs => {
    try {
      for (let i in req.body.times) {
        await db.query('insert into datetime (day, morning, noon, night) values ($1, $2, $3, $4) on conflict do nothing', req.body.times[i]);
        let datetime = await db.query('select datetime_id from datetime where day = $1 and morning = $2 and noon = $3 and night = $4', req.body.times[i]);
        await db.query('insert into class_times (class_id, datetime_id) values ($1, $2)', [rs.rows[0].class_id, datetime.rows[0].datetime_id]);
      }
      let pr = await db.query('select parrent_id from parrents where username = $1', [req.body.parrent]);
      await db.query('insert into parrent_class (parrent_id, class_id) values ($1, $2)', [pr.rows[0].parrent_id, rs.rows[0].class_id]);
      await db.query('insert into enrollments (class_id, tutor_id) values ($1, $2)', [rs.rows[0].class_id, 1]);
      res.json({result: rs.rows[0].class_id});
    } catch (err) {
      res.json({err: err, result: false});
    }
  }).catch(err => res.json({err: err, result: false}));
})

module.exports = api;
