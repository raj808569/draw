var socket = io.connect();
$(function(){

    // get references to the canvas and context
    var canvas=document.getElementById("canvas");
    var ctx=canvas.getContext("2d");
    var ct1=canvas.getContext("2d");
    // style the context
    ctx.strokeStyle = "red";

    ctx.lineWidth=3;

    // calculate where the canvas is on the window
    // (used to help calculate mouseX/mouseY)
    var $canvas=$("#canvas");
    var canvasOffset=$canvas.offset();
    var offsetX=canvasOffset.left;
    var offsetY=canvasOffset.top;
    var scrollX=$canvas.scrollLeft();
    var scrollY=$canvas.scrollTop();
    var $store=$("#store");
    var $collab=$("#collab");

    var width;var height;
    // this flage is true when the user is dragging the mouse
    var isDown=false;

    // these vars will hold the starting mouse position
    var startX;
    var startY;


    function handleMouseDown(e){
      e.preventDefault();
      e.stopPropagation();

      // save the starting x/y of the rectangle
      startX=parseInt(e.clientX-offsetX);
      startY=parseInt(e.clientY-offsetY);

      // set a flag indicating the drag has begun
      isDown=true;
    }

    function handleMouseUp(e){
      e.preventDefault();
      e.stopPropagation();

      // the drag is over, clear the dragging flag
      isDown=false;
    }

    function handleMouseOut(e){
      e.preventDefault();
      e.stopPropagation();

      // the drag is over, clear the dragging flag
      isDown=false;
    }

    function handleMouseMove(e){
      e.preventDefault();
      e.stopPropagation();

      // if we're not dragging, just return
      if(!isDown){return;}

      // get the current mouse position
      mouseX=parseInt(e.clientX-offsetX);
      mouseY=parseInt(e.clientY-offsetY);

      // Put your mousemove stuff here

      // clear the canvas
      ctx.clearRect(0,0,canvas.width,canvas.height);

      // calculate the rectangle width/height based
      // on starting vs current mouse position
       width=mouseX-startX;
       height=mouseY-startY;

      // draw a new rect from the start position
      // to the current mouse position
      ctx.strokeRect(startX,startY,width,height);

    }

    // listen for mouse events
    $("#canvas").mousedown(function(e){handleMouseDown(e);});
    $("#canvas").mousemove(function(e){handleMouseMove(e);});
    $("#canvas").mouseup(function(e){handleMouseUp(e);});
    $("#canvas").mouseout(function(e){handleMouseOut(e);});

    $store.click(function(e){
      socket.emit('store',{startX:startX,startY:startY,width:width,height:height});//save the rectangle
    });

    socket.on('resume_event',function(data){
      console.log(data);
      startX=data.startX;startY=data.startY;width=data.width;height=data.height;
      ctx.strokeRect(startX,startY,width,height);
    });

    $collab.click(function(e){
      socket.emit('collab',1);
    });

    socket.on('collab_result',function(data){
      console.log('soluchan');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.strokeRect(data.startX,data.startY,data.width,data.height);
    });


}); // end $(function(){});
