
var up = document.getElementById('upload'),
    text1 = document.getElementById('text1'),
    sliderSize = document.getElementById('sliderSize'),
    sliderImage = document.getElementById('sliderImage'),
    file  = document.getElementById('image'),
    canvas = document.getElementById('canvas'),
    uploaded = document.getElementById('uploaded'),
    placeholder_image = document.getElementById('placeholder_image');

up.addEventListener('click', uploadToImgur);

text1.addEventListener('keyup', updateImage);
sliderSize.addEventListener('change', updateImage);
sliderImage.addEventListener('change', updateImage);
file.addEventListener('change', changeAndUpdateImage);

function readFile(fileInput, callback) {
    var f = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = (function(theFile) {
        return function(e) {
            callback(e.target.result);
        };
    })(f);
    reader.readAsDataURL(f);
}

var curImg = null;

placeholder_image.onload = function() {
    curImg = placeholder_image;
    updateImage();
}

function changeAndUpdateImage() {
    var img = new Image();
    readFile(file, function(dataURL) {
        img.onload = function() {
            curImg = img;
            sliderImage.value = Math.max(img.width, img.height);
            canvas.width = img.width;
            canvas.height = img.height;
            updateImage();
        }
        img.src = dataURL;

    });
       
}

function drawLines(ctx, lines, x, y, yStep) {
    lines = lines.split('\n');
    if (yStep < 0) lines = lines.reverse();
    lines.forEach(function(l, k) {
        ctx.strokeText(l, x, y + yStep * k);
        ctx.fillText(l,   x, y + yStep * k);
 
    });
}

function updateImage() {
    var LINE_HEIGHT = 1.1;
    var PARAGRAPH_HEIGHT = 1.5;
    
    var imgSizeLimit = parseFloat(sliderImage.value);

    var canvasSize = autoScale({
        w: curImg.width, 
        h: curImg.height
    }, imgSizeLimit);

    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    var ctx = canvas.getContext("2d");
    var lgTxt = parseFloat(sliderSize.value);
    var smTxt = 3/4*lgTxt;
    

    if (!curImg) return;
    ctx.strokeStyle = 'rgba(0,0,0,0)';
    ctx.fillStyle = '#098eb0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(curImg, 0, 0, canvas.width, canvas.height);

    ctx.font = lgTxt + "px Tahoma, Geneva, sans-serif";
    ctx.textAlign = 'justify';
    ctx.textBaseline = 'middle';

    var vpos1 = canvas.width / 15;
    var vpos2 = canvas.width * 8 / 15;
    var hpos1 = canvas.height - 2.3*lgTxt * PARAGRAPH_HEIGHT / 2;
    var hpos2 = canvas.height - lgTxt * PARAGRAPH_HEIGHT / 2;
    var lgStep = -1 * LINE_HEIGHT * lgTxt;
    var smStep = -1 * LINE_HEIGHT * 20;
    
    drawLines(
      ctx,
      text1.value,
      vpos1,
      hpos2,
      lgStep
    );
    drawLines(
      ctx,
      "     PLANET\nEVERYONE",
      vpos2,
      hpos2,
      lgStep
    );

    ctx.font = "italic "+smTxt+"px Tahoma, Geneva, sans-serif";
              
    drawLines(
      ctx,
      "by",
      vpos1,
      hpos1,
      smStep
    );               
    drawLines(
      ctx,
      "for",
      vpos2,
      hpos1,
      smStep
    );              

}

function autoScale(input, max) {
    var larger = input.w > input.h ? 'w' : 'h',
        smaller = larger == 'w' ? 'h' : 'w';
    var factor = max / input[larger];

    var output = {};
    output[larger] = factor * input[larger];
    output[smaller] = factor * input[smaller];
    return output;
}

function uploadToImgur() {
    uploaded.innerHTML = "Please wait, uploading...";
    var img;
    try {
        img = canvas.toDataURL('image/png', 1.0).split(',')[1];
    } catch(e) {
        img = canvas.toDataURL().split(',')[1];
    }
    $.ajax({
        url: 'https://api.imgur.com/3/upload.json',
        type: 'POST',
        data: {
            type: 'base64',
            name: 'earth_day.png',
            title: text1.value,
            description: "PLANET EVERYONE",
            image: img
        },
        headers: {
            Authorization: 'Client-ID 4b64f0eff077008'
        },
        dataType: 'json'
    }).success(function(data) {
        var l = data.data.link;
        uploaded.innerHTML = '<a href="' + l + '" target="_blank">'
        + l
        + '</a>';
    }).error(function(err) {
        console.error(err);
    });

}

