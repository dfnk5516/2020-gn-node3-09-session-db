const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { isUser, isGuest } = require('../modules/auth-conn');
const {alert} = require('../modules/utils');
const {pool} = require('../modules/mysql-conn');
const passport = require('passport');
const pugVals = {cssFile : 'user', jsFile : 'user'}

router.get('/login', isGuest, (req,res,next)=>{
  res.render('user/login', pugVals);
});
router.get('/logout', isUser, (req,res,next)=>{
  req.session.destroy();
  req.app.locals.user = null;
  res.send(alert('로그아웃 되었습니다','/'));
});
router.get('/join', isGuest, (req,res,next)=>{
  res.render('user/join', pugVals);
});
router.post('/save', isGuest, async(req,res,next)=>{
  let {userid, userpw, username, email} = req.body;
  console.log(userpw);
  console.log(process.env.PASS_SALT)
  userpw = await bcrypt.hash(userpw + process.env.PASS_SALT, Number(process.env.PASS_ROUND));
  let connect, sql, result, sqlVals;
  try{
    connect = await pool.getConnection();
    sql = 'INSERT INTO user SET userid=?, userpw=?, username=?, email=?';
    sqlVals = [userid, userpw, username, email];
    result = await connect.query(sql, sqlVals);
    connect.release();
    res.send(alert('회원가입 처리..'));
  }
  catch(e){
    connect.release();
    next(e);
  }
});

router.post('/auth', async(req,res,next)=>{
  const done = (err, user, msg) => {
    console.log(user);
    if(err) return next(err);
    if(!user) return res.send(alert(msg, '/'));
    else return res.send(alert('로그인 되었습니다.', '/'));
  };
  passport.authenticate('local', done)(req, res,next); // authenticate 실행하고 done 콜백 줬던거 받고, 그다음 미들웨어 이 곳
});

module.exports = router;