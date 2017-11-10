var express = require('express');
var session = require('express-session');
var app=express();
app.use(session({secret: 'ssshhhhh'}));
var sess;
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var mongojs=require('mongojs');
var db=mongojs('mongodb://root:root@ds251435.mlab.com:51435/draw',["drawlist"]);
var db1=mongojs('mongodb://root:root@ds251435.mlab.com:51435/draw',["userlist"]);
console.log('connected to db');
console.log('connected to db1');
app.use("/css",express.static(__dirname+"/css"))
app.use("/js",express.static(__dirname+"/js"))
app.use("/images",express.static(__dirname+"/images"))
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.set('port',(process.env.PORT||8080));
app.get('/',function(req,res){
  sess = req.session;
  res.sendFile(__dirname + '/login.html');
});
app.get('/login', function (req, res,html) {
 res.sendFile(__dirname+'/login.html');
});
app.get('/register', function (req, res,html) {
 res.sendFile(__dirname+'/register.html');
});
app.get('/logout', function(req, res) {
        console.log("logging out!");

        req.session.destroy();
        res.redirect('/');
    });

http.listen (app.get('port'),function() {
  console.log("listening to port number "+app.get('port'));
});

io.sockets.on('connection',function(socket){
  sess.socketid=socket.id;
  console.log(socket.id+"let the game begin!");
app.post('/register', function(req, res) {

  console.log(req.body.email);

  var newuser={email:req.body.email,password:req.body.password};
  console.log(newuser);
  db1.userlist.find({email:req.body.email},function(err,docs){
    if(err) throw err;
    if(!docs.length){
        db1.userlist.insert(newuser,function(err,results){
            if(err){
                res.send('Try again');
            }
            else {
              res.sendFile(__dirname+'/project.html');
              sess.email=req.body.email;

            }
        });

      }
      else{
        res.send('user already exists..try different email');
      }
  });
  });


  app.post('/login', function(req, res) {

    console.log(req.body.email);

    var existing_user={email:req.body.email,password:req.body.password};
    console.log(existing_user);
    db1.userlist.find({email:req.body.email,password:req.body.password},function(err,docs){
      if(err) throw err;
      if(!docs.length){
        res.send('invalid Credentials..try again!!');
        }
        else {
                res.sendFile(__dirname+'/project.html');
                sess.email=req.body.email;

            }
  });
    });


app.post('/project',function(req,res){

  console.log(req.body);

  if(req.body.opt=="create")
  {
    db.drawlist.find({projectid:req.body.projectid},function(err,docs){
      if(!docs.length)
      {
        var list={projectid:req.body.projectid,user1:sess.email,user1rect:{},user2:"",user2rect:{}};
        db.drawlist.insert(list,function(err,results){
          if(err) throw err;
          else{
              res.sendFile(__dirname+'/index.html');
              sess.projectid=req.body.projectid;
          }
        });
      }
      else{
        res.send('enter different project id..this id is already taken');
      }
    });

  }

  if(req.body.opt=="join")
  {
    db.drawlist.find({projectid:req.body.projectid},function(err,docs){
      if(!docs.length)
      {
        res.send('enter correct project id..no such project id exists..');

      }
      else{

        db.drawlist.update({projectid:req.body.projectid},{$set:{user2:sess.email}},function(err,results){
          if(err) throw err;
          else{
              res.sendFile(__dirname+'/index.html');
              sess.projectid=req.body.projectid;
          }
        });
      }
    });

  }

  if(req.body.opt=="resume")
  {
    db.drawlist.find({projectid:req.body.projectid},function(err,docs){
      if(!docs.length)
      {
        res.send('enter correct project id..no such project id exists..');

      }
      else{

              res.sendFile(__dirname+'/index.html');
              sess.projectid=req.body.projectid;
              setTimeout(function(){    if(docs[0].user1==sess.email)
                {
                  console.log(docs[0].user1rect);
                  console.log(socket.id+"holla");//asynchronous type problem here!

                  io.sockets.in(sess.socketid).emit('resume_event',docs[0].user1rect);
                }
                else
                {
                  console.log('working');
                  io.sockets.in(sess.socketid).emit('resume_event',docs[0].user2rect);
                }}, 1000);



          }
      });
      }






});



  socket.on('store',function(data){
    console.log(data);
        db.drawlist.find({projectid:sess.projectid},function(err,docs){
          console.log(docs[0]);
          if(docs[0].user1==sess.email)
          {
            db.drawlist.update({projectid:sess.projectid},{$set:{user1rect:data}},function(err,results){
              if(err) throw err;
            });
          }
          else{
            db.drawlist.update({projectid:sess.projectid},{$set:{user2rect:data}},function(err,results){
              if(err) throw err;
            });
          }
        });
  });

socket.on('collab',function(data){
    db.drawlist.find({projectid:sess.projectid},function(err,docs){
      if(docs[0].user1==sess.email)
      {
        io.sockets.in(socketid).emit('collab_result',docs[0].user2rect);
      }
      else{
        io.sockets.in(socketid).emit('collab_result',docs[0].user1rect);
      }
    });
});


});
