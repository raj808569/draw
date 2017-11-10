var socket = io.connect();
$(function(){
  var userid;
  var $login=$("#login");
  var $register=$("#register");

  socket.on('username',function(data){
    userid=data;
  });

  socket.on('sendid',function(data){
    socket.emit('takeid',userid);
  });
});
