const express = require('express');

const router = new express.Router();

router.get('/', (req, res) => {
  res.render('index', {title: 'Kết nối và dạy học'});
})

router.get('/tutors', (req, res) => {
  res.render('tutors', {title: 'Tìm kiếm gia sư', tutors: null});
})

router.get('/become-tutor', (req, res) => {
  res.render('become-tutor', {title: 'Đăng ký làm gia sư'})
})

module.exports = router;
