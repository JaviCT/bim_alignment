var distorter, example;

var total = 0;
var i = 1;
var photo = [];
var image = 1;
var para = 0;

var angle = 0;
var margin = 0;
var scalex = 1;
var scaley = 1;
var translatex = -150;
var translatey = -20;

var timer = 0;

var playClicked = 0;

$(document).ready(function() {

    loadImg();

    $("#myFigure").width($(document).width());
    $("#myFigure").height($(document).height());
    getTransform();

    var esto = $( "#myFigure" ).width();
    myCanvas.style.width = esto+"px";

    var myPlayer = $( "#player" ).width();
    var player = (esto / 2) - (myPlayer / 1.5);
    document.getElementById("player").style.left = player + "px";

    $(window).on('resize', function() {
      esto = $(document).width();
      player = (esto / 2) - (myPlayer / 1.5);
      document.getElementById("player").style.left = player + "px";
    });

    document.getElementById('getval').addEventListener('change', readURL, true);
    function readURL(){
       var file = document.getElementById("getval").files[0];
       var reader = new FileReader();
       reader.onloadend = function(){

         document.getElementById('myFigure')
          .setAttribute(
              'src', reader.result
          );
       }
       if(file){
          reader.readAsDataURL(file);
        }else{
        }
    }

    $("#download").click(function nextPhoto(){
      var video = document.getElementById('video');
      var canvas = document.getElementById("canvas");

      var stream = canvas.captureStream(25);
      var recorder = new MediaRecorder(stream);
      var capturing = false;

      recorder.addEventListener('dataavailable', finishCapturing);

      startCapturing();
      recorder.start();

      setTimeout(function() {
        recorder.stop();
        jQuery('#video').toggle('show');
      }, 362 * 80);

      function startCapturing() {
        capturing = true;
        image = 1;
        i = 1;
        playMedia();
      }

      function finishCapturing(e) {
        capturing = false;
        var videoData = [ e.data ];
        var blob = new Blob(videoData, { 'type': 'video/mp4' });
        var videoURL = URL.createObjectURL(blob);
        video.src = videoURL;
        video.play();
      }
    });

    $("#next").click(function nextPhoto(){
      $("#play").empty();
      $("#play").append("<i class='fas fa-play'></i>");
      para = 1;
      if(image < 301){
        image = image + 1;
        i = image;
        distorter.setImage(photo[i].src);
        document.getElementById("myInput").value = image;
      }else{
        alert("No more BIM");
      }
    });

    $("#prev").click(function prevPhoto(){
      $("#play").empty();
      $("#play").append("<i class='fas fa-play'></i>");
      para = 1;
      if(image > 1){
        image = image - 1;
        i = image;
        distorter.setImage(photo[i].src);
        document.getElementById("myInput").value = image;
      }else{
        distorter.setImage("img/bim/0.png");
        alert("No more BIM");
      }
    });

    $("#play").click(function play(){
      playMedia();
    });

    function playMedia(){
      if(playClicked == 0){
        if(image == 301){
          image = 1;
          i = image;
        }
        $("#play").empty();
        $("#play").append("<i class='fas fa-pause'></i>");
        playClicked = 1;

        para = 0;
        var refreshIntervalId = setInterval(function(){
          if(i < 301 && para == 0){
            image = i;
            distorter.setImage(photo[i].src);
            document.getElementById("myInput").value = i;
            i++;
          } else{
            clearInterval(refreshIntervalId);
            console.log("PARANDO");
            $("#play").empty();
            $("#play").append("<i class='fas fa-play'></i>");
            if(i == 301){
              i = 1;
            }
          }
          if (i == 301){
            playClicked = 0;
          }
        }, 50);
      } else{
        $("#play").empty();
        $("#play").append("<i class='fas fa-play'></i>");
        playClicked = 0;
        para = 1;
      }
    }

    $("#first").click(function firstBim(){
      $("#play").empty();
      $("#play").append("<i class='fas fa-play'></i>");
      para = 1;
      i = 1;
      image = 1;
      distorter.setImage("img/bim/0.png");
      document.getElementById("myInput").value = image;
    });

    $("#end").click(function lastBim(){
      $("#play").empty();
      $("#play").append("<i class='fas fa-play'></i>");
      para = 1;
      i = 301;
      image = 301
      distorter.setImage(photo[i].src);
      document.getElementById("myInput").value = image;
    });

    $("#redo").click(function(){
      angle = (angle + 2) % 360;
      getTransform();
    });

    $("#undo").click(function(){
      angle = (angle - 2) % 360;
      getTransform();
    });
    $("#left").click(function(){
      translatex = translatex - 20;
      getTransform();
    });
    $("#right").click(function(){
      translatex = translatex + 20;
      getTransform();
    });
    $("#up").click(function(){
      translatey = translatey - 20;
      getTransform();
    });
    $("#down").click(function(){
      translatey = translatey + 20;
      getTransform();
    });
    $("#plus").click(function(){
      distorter.lens.scale += 0.01;
      distorter.run();
      //scalex = scalex + 0.1;
      //scaley = scaley + 0.1;
      //getTransform();
    });
    $("#minus").click(function(){
      distorter.lens.scale -= 0.01;
      distorter.run();
      //scalex = scalex - 0.1;
      //scaley = scaley - 0.1;
      //getTransform();
    });

    //btn ok & cancel
    $("#ok").click(function(){
      jQuery('#controls').toggle('show');
      jQuery('#myRow').toggle('show');
      jQuery('#dots').toggle('show');
    });

    $("#cancel").click(function(){
      myReset();
      jQuery('#controls').toggle('show');
      jQuery('#myRow').toggle('show');
      jQuery('#dots').toggle('show');
    });

    $("#reset").click(function(){
      myReset();
    });

    $("#closeEditor").click(function(){
      jQuery('#controls').toggle('show');
      jQuery('#myRow').toggle('show');
      jQuery('#dots').toggle('show');
    });

    $("#dots").click(function(){
      jQuery('#dots').toggle('show');
      jQuery('#myRow').toggle('show');
      jQuery('#controls').toggle('show');
    });

    $("#show_nubs").change(function(){
      jQuery('#nubs').toggle('show');
    });

    //distorter

    // Drag & Drop behavior

    /*
    $('#canvas').on('dragenter',function(e) {
      $('.zone').addClass('hover');

    $('#canvas').on('dragleave',function(e) {
      $('.zone').removeClass('hover');
    });
    var onDrop = function(e) {
      e.preventDefault();
      e.stopPropagation(); // stops the browser from redirecting.

      var files = e.dataTransfer.files;
      for (var i = 0, f; f = files[i]; i++) {
        // Read the File objects in this FileList.

        var reader = new FileReader();
        reader.onload = function(e) {

          var dataurl = distorter.getSrc();
  //        var bin = atob(dataurl.split(',')[1]);
  //        var exif = EXIF.readFromBinaryFile(new BinaryFile(bin));
  //        console.log(exif);

          var uniq = (new Date()).getTime();
          $('#previous').prepend('<a target="_blank" class="' + uniq + '" href="' + dataurl + '"></a>');
          $('.' + uniq).append(distorter.getImage());
          distorter.setImage(event.target.result, function callback() {
            $('#grid').height($('#canvas').height());
            $('#grid').width($('#canvas').width());
          });

        }
        reader.readAsDataURL(f);

        // EXIF
        var exifReader = new FileReader();

        $('.exif').html('');
        exifReader.onload = function(e) {
          var exif = EXIF.readFromBinaryFile(e.target.result);
          $('.exif-camera').html(exif.Make + ', ' + exif.Model);
          $('.exif').html(JSON.stringify(exif));
        }
        exifReader.readAsArrayBuffer(f);
      }
    }

    function onDragOver(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    $('#canvas').on('dragover', onDragOver, false);
    $('#canvas')[0].addEventListener('drop', onDrop, false);
    */

    distorter = FisheyeGl({
      image: ""
    });

    $("dl").on("change", onSliderChange);
    $("dd input").on("mousemove", onSliderChange);

    setSliders();
    readSliders();
    distorter.run();
    distorter.lens.scale -=0.25

    window.onresize = resizeGrid;
    setTimeout(resizeGrid, 0);

    function resizeGrid() {
      $('#grid').height($('#canvas').height());
      $('#grid').width($('#canvas').width());
    }

    /*example = {
      setSliders:    setSliders,
      readSliders:   readSliders
    }*/

    function onSliderChange() {
      readSliders();
      distorter.run();
    }

    function readSliders() {
      distorter.lens.a = parseFloat($("#a_label")[0].innerHTML = $("#a").val());
      distorter.lens.b = parseFloat($("#b_label")[0].innerHTML = $("#b").val());
      distorter.lens.Fx = parseFloat($("#Fx_label")[0].innerHTML = $("#Fx").val());
      distorter.lens.Fy = parseFloat($("#Fy_label")[0].innerHTML = $("#Fy").val());
      distorter.fov.x = parseFloat($("#fovx").val());
      distorter.fov.y = parseFloat($("#fovy").val());
    }

    function setSliders() {
      $("#a").val(distorter.lens.a);
        $("#a_label")[0].innerHTML = distorter.lens.a;
      $("#b").val(distorter.lens.b);
        $("#b_label")[0].innerHTML = distorter.lens.b;
      $("#Fx").val(distorter.lens.Fx);
        $("#Fx_label")[0].innerHTML = distorter.lens.Fx;
      $("#Fy").val(distorter.lens.Fy);
        $("#Fy_label")[0].innerHTML = distorter.lens.Fy;
      $("#fovx").val(distorter.fov.x);
      $("#fovy").val(distorter.fov.y);
    }

    function myReset(){
      var mio = document.getElementById("myCanvas");
      mio.style.transform = "rotate(0deg)";
      mio.style.transform += "translate(0px, 0px)";
      mio.style.transform += "scale(1, 1)";

      $("#transparency").val(1);
      document.getElementById("myCanvas").style.opacity = 1;
      $("#a").val(1);
      $("#b").val(1);
      $("#Fx").val(0);
      $("#Fy").val(0);
      $("#fovx").val(0);
      $("#fovy").val(0);
      distorter.lens.a = parseFloat($("#a_label")[0].innerHTML = $("#a").val());
      distorter.lens.b = parseFloat($("#b_label")[0].innerHTML = $("#b").val());
      distorter.lens.Fx = parseFloat($("#Fx_label")[0].innerHTML = $("#Fx").val());
      distorter.lens.Fy = parseFloat($("#Fy_label")[0].innerHTML = $("#Fy").val());
      distorter.fov.x = parseFloat($("#fovx").val());
      distorter.fov.y = parseFloat($("#fovy").val());
      distorter.run();
    }

    function loadImg(){
      for (var i = 1; i <302; i++){
        total++;
        photo[i] = new Image();
        photo[i].src = "img/bim/" + i + ".png";
        //photo[i].src = "https://s3-eu-west-1.amazonaws.com/bimevercam/" + i + ".png";
        photo[i].crossOrigin = "";
      }
    }
    document.getElementById("totaly").innerHTML = total;

    $('#myInput').focusin(thumbnails);
    $('#myInput').mouseout(function(){
      $('#myDiv').hide();
      $('#numer').hide();
    });
    function thumbnails(){

      var myRange = document.querySelector('#myInput');
      var myValue = document.querySelector('#myValue');
      var myUnits = 'myUnits';
      var off = myRange.offsetWidth / (parseInt(myRange.max) - parseInt(myRange.min));
      var px =  ((myRange.valueAsNumber - parseInt(myRange.min)) * off) - (myValue.offsetParent.offsetWidth / 2);
        myValue.parentElement.style.left = (px + 30) + 'px';
        myValue.parentElement.style.top = (myRange.offsetHeight - 170) + 'px';
        myValue.innerHTML = "<div id='myDiv'><img src='img/bim/" + Math.trunc(myRange.value) + ".png' style='width: 90%; object-fit: contain; width: 100%; position: relative'></img></div><div id='numer'><div><strong>"+ (Math.trunc(myRange.value)) +"</strong></div></div>";//Math.trunc(myRange.value) + ' ' + myUnits;

        myRange.oninput =function(){
          px = ((myRange.valueAsNumber - parseInt(myRange.min)) * off) - (myValue.offsetParent.offsetWidth / 2);
          myValue.innerHTML = "<div id='myDiv'><img src='img/bim/" + Math.trunc(myRange.value) + ".png' style='width: 90%; object-fit: contain; position: relative'></img></div><div id='numer'><div><strong>"+ (Math.trunc(myRange.value)) +"</strong></div></div>";
          myValue.parentElement.style.left = (px + 30) + 'px';
        };
    }

    //Slider show
    $("#myInput").on('change', showVal);
    function showVal(){
      $("#play").empty();
      $("#play").append("<i class='fas fa-play'></i>");
      para = 1;
      var value = $("#myInput").val();
      image = Math.trunc(value);
      i = image;
      if(image == 0){
        distorter.setImage("img/bim/0.png")
      }else{
        distorter.setImage(photo[image].src)
      }
    }

    $("#transparency").on('change', showVal2);
    $("#transparency").on('mousemove', showVal2);
    // $("#tlx").on('mousemove', change_corners);
    // $("#blx").on('mousemove', change_corners);
    // $("#try").on('mousemove', change_corners);
    // $("#bry").on('mousemove', change_corners);
    // $("#tly").on('mousemove', change_corners);
    // $("#bly").on('mousemove', change_corners);
    // $("#trx").on('mousemove', change_corners);
    // $("#brx").on('mousemove', change_corners);
    $("#tlx").on('change', change_corners);
    $("#blx").on('change', change_corners);
    $("#try").on('change', change_corners);
    $("#bry").on('change', change_corners);
    $("#tly").on('change', change_corners);
    $("#bly").on('change', change_corners);
    $("#trx").on('change', change_corners);
    $("#brx").on('change', change_corners);

    function change_corners(){
      var value_tlx = $("#tlx").val();
      var value_tly = $("#tly").val();
      var value_trx = $("#trx").val();
      var value_try = $("#try").val();
      var value_brx = $("#brx").val();
      var value_bry = $("#bry").val();
      var value_blx = $("#blx").val();
      var value_bly = $("#bly").val();
      try {
        var mine2 = fx.canvas();
      } catch (e) {
        alert(e);
        return;
      }
      var can = document.getElementById('canvas');
      //var img = document.getElementById('myFigure')
      var img = new Image();
      img.src = photo[i].src;
      var texture = mine2.texture(img);
      var height = $("#canvas").height();
      var width = $("#canvas").width();
      var tl_x, tl_y, bl_x, bl_y, lr_x, tr_y, br_x, br_y;
      tl_x = 1;
      tl_y = 1;
      tr_x = width;
      tr_y = 1;
      bl_x = 1;
      bl_y = height;
      br_x = width;
      br_y = height;
      // new_tl_x = 175 + parseFloat(value_tlx);
      // new_tl_y = 156 + parseFloat(value_tly);
      // new_tr_x = 496 +parseFloat(value_trx);
      // new_tr_y = 55.00000000000001+parseFloat(value_try);
      // new_bl_x = 177+parseFloat(value_blx);
      // new_bl_y = 285+parseFloat(value_bly);
      // new_br_x = 504+parseFloat(value_brx);
      // new_br_y = 330+parseFloat(value_bry);
      new_tl_x = tl_x + parseFloat(value_tlx);
      new_tl_y = tl_y + parseFloat(value_tly);
      new_tr_x = tr_x +parseFloat(value_trx);
      new_tr_y = tr_y+parseFloat(value_try);
      new_bl_x = bl_x+parseFloat(value_blx);
      new_bl_y = bl_y+parseFloat(value_bly);
      new_br_x = br_x+parseFloat(value_brx);
      new_br_y = br_y+parseFloat(value_bry);
      console.log(new_br_y);
      console.log(value_bry);
      mine2.draw(texture).perspective([tl_x,tl_y,tr_x,tr_y,bl_x,bl_y,br_x,br_y], [new_tl_x,new_tl_y, new_tr_x,new_tr_y,new_bl_x,new_bl_y,new_br_x,new_br_y]).update();
      //mine2.draw(texture).perspective([175,156,496,55,161,279,504,330], [tl_x + value_tlx, tl_y + value_tly, tr_x + value_trx, tr_y + value_try, bl_x + value_blx, bl_y + value_bly, br_x + value_brx,br_y + value_bry]).update();
      var img = new Image();
      img.src = mine2.toDataURL();
      distorter.setImage(img.src)
    }

    function change_corners2(){
      var height = $("#canvas").height();
      var width = $("#canvas").width();
      var tl_x = 1;
      var tl_y = 1;
      var tr_x = width;
      var tr_y = 1;
      var bl_x = 1;
      var bl_y = height;
      var br_x = width;
      var br_y = height;
      var new_tl_x = tl_x + nubs[0].x;
      var new_tl_y = tl_y + nubs[0].y;
      var new_tr_x = tr_x + nubs[1].x;
      var new_tr_y = tr_y + nubs[1].y;
      var new_bl_x = bl_x + nubs[2].x;
      var new_bl_y = bl_y + nubs[2].y;
      var new_br_x = br_x + nubs[3].x;
      var new_br_y = br_y + nubs[3].y;
      distorter.before = perspectiveNubs;
      distorter.after = [nubs[0].x,nubs[0].y, nubs[1].x,nubs[1].y,nubs[2].x,nubs[2].y,nubs[3].x,nubs[3].y];
      distorter.run();
      perspectiveNubs = [nubs[0].x,nubs[0].y, nubs[1].x,nubs[1].y,nubs[2].x,nubs[2].y,nubs[3].x,nubs[3].y];
      console.log(perspectiveNubs);
      tl_x = new_tl_x;
      tl_y = new_tl_y;
      tr_x = new_tr_x;
      tr_y = new_tr_y;
      bl_x = new_bl_x;
      bl_y = new_bl_y;
      br_x = new_br_x;
      br_y = new_br_y;
    }

    // Add a div for each nub
    // $('<div id="nubs"></div>').appendTo('#divisor');
    var h = $("#canvas").height();
    var w = $("#canvas").width();
    var h4 = h/4;
    var w4 = w/4;
    //var perspectiveNubs = [175, 156, 496, 55, 161, 279, 504, 330];
    var perspectiveNubs = [w4, h4, w-w4, h4, w4, h-h4, w-w4, h-h4];
    //var perspectiveNubs = [0, 0, w, 0, 0, h, w, h];
    //var w = 640, h = 425;
    var nubs = [
      { name: "a", x: perspectiveNubs[0] / w, y: perspectiveNubs[1] / h },
      { name: "b", x: perspectiveNubs[2] / w, y: perspectiveNubs[3] / h },
      { name: "c", x: perspectiveNubs[4] / w, y: perspectiveNubs[5] / h },
      { name: "d", x: perspectiveNubs[6] / w, y: perspectiveNubs[7] / h }
    ];
    var nubs2 = [
      { name: "a", x: perspectiveNubs[0], y: perspectiveNubs[1]},
      { name: "b", x: perspectiveNubs[2], y: perspectiveNubs[3]},
      { name: "c", x: perspectiveNubs[4], y: perspectiveNubs[5]},
      { name: "d", x: perspectiveNubs[6], y: perspectiveNubs[7]}
    ];
    for (var i = 0; i < nubs.length; i++) {
      console.log(i);
      var nub = nubs[i];
      var x = nub.x * w;
      var y = nub.y * h;
      //$('<div class="nub draggable" id="nub' + i + '"></div>').appendTo('#nubs');
      $('#nub' + i).css({ left: x, top: y });
      //nubs[i] = { x: x, y: y };
    }

    $('#nub0').draggable({
        drag: function (event, ui) {
          var offset = $(event.target.parentNode).offset();
          nubs2[0].x = ui.offset.left - offset.left;
          nubs2[0].y = ui.offset.top - offset.top;
          distorter.before = perspectiveNubs;
          distorter.after = [nubs2[0].x,nubs2[0].y, nubs2[1].x,nubs2[1].y,nubs2[2].x,nubs2[2].y,nubs2[3].x,nubs2[3].y];
          distorter.run();
          console.log(distorter.before);
          console.log(distorter.after);
        },
        containment: 'parent',
        scroll: false
    });

    $('#nub1').draggable({
        drag: function (event, ui) {
          var offset = $(event.target.parentNode).offset();
          nubs2[1].x = ui.offset.left - offset.left;
          nubs2[1].y = ui.offset.top - offset.top;
          distorter.before = perspectiveNubs;
          distorter.after = [nubs2[0].x,nubs2[0].y, nubs2[1].x,nubs2[1].y,nubs2[2].x,nubs2[2].y,nubs2[3].x,nubs2[3].y];
          distorter.run();
          console.log(distorter.before);
          console.log(distorter.after);
        },
        containment: 'parent',
        scroll: false
    });

    $('#nub2').draggable({
        drag: function (event, ui) {
          var offset = $(event.target.parentNode).offset();
          nubs2[2].x = ui.offset.left - offset.left;
          nubs2[2].y = ui.offset.top - offset.top;
          distorter.before = perspectiveNubs;
          distorter.after = [nubs2[0].x,nubs2[0].y, nubs2[1].x,nubs2[1].y,nubs2[2].x,nubs2[2].y,nubs2[3].x,nubs2[3].y];
          distorter.run();
          console.log(distorter.before);
          console.log(distorter.after);
        },
        containment: 'parent',
        scroll: false
    });

    $('#nub3').draggable({
        drag: function (event, ui) {
          var offset = $(event.target.parentNode).offset();
          nubs2[3].x = ui.offset.left - offset.left;
          nubs2[3].y = ui.offset.top - offset.top;
          distorter.before = perspectiveNubs;
          distorter.after = [nubs2[0].x,nubs2[0].y, nubs2[1].x,nubs2[1].y,nubs2[2].x,nubs2[2].y,nubs2[3].x,nubs2[3].y];
          distorter.run();
          console.log(distorter.before);
          console.log(distorter.after);
        },
        containment: 'parent',
        scroll: false
    });

    function showVal2(){
      var value = $("#transparency").val();
      document.getElementById("myCanvas").style.opacity = value;
    }

    function getTransform(){
      var mio = document.getElementById("myCanvas");
      mio.style.transform = "rotate(" + angle + "deg)";
      mio.style.transform += "translate(" + translatex + "px, " + translatey + "px)";
      mio.style.transform += "scale(" + scalex + ", " + scaley + ")";
    }

    $("#slider").on("mousemove", moveDivisor);
    function moveDivisor() {
      handle.style.left = slider.value+"%";
      divisor.style.width = slider.value+"%";
    }

    /*function point_it(event){
    	pos_x = event.offsetX?(event.offsetX):event.pageX-document.getElementById("comparison").offsetLeft;
    	pos_y = event.offsetY?(event.offsetY):event.pageY-document.getElementById("comparison").offsetTop;
    	document.getElementById("myFigure").style.left = (pos_x-1) ;
    	document.getElementById("myFigure").style.top = (pos_y-15) ;
    	document.getElementById("myFigure").style.visibility = "visible" ;
      console.log("y: " + pos_y +", x: " + pos_x);
    }*/

    function myFunction(){
      image = $("#sel1").val();
      i = image;
      distorter = FisheyeGl({
        image: photo[image].src
      });
    }
});
