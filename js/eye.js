(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var FisheyeGl = function FisheyeGl(options){

  // Defaults:
  options = options || {};

  options.width = options.width || 800;
  options.height = options.height || 600;

  var before = options.before || [175, 156, 496, 55, 161, 279, 504, 330];
  var after = options.after || [175, 156, 496, 55, 161, 279, 504, 330];

  var matrix = options.matrix || perspective(before, after);

  var model = options.model || {
    vertex :[
      -1.0, -1.0, 0.0,
       1.0, -1.0, 0.0,
       1.0,  1.0, 0.0,
      -1.0,  1.0, 0.0
    ],
    indices :[
      0, 1, 2,
      0, 2, 3,
      2, 1, 0,
      3, 2, 0
    ],
    textureCoords : [
      -1.0, -1.0,
       1.0, -1.0,
       1.0,  1.0,
      -1.0,  1.0
    ]
  };

  var lens = options.lens || {
    a : 0.82,
    b : 0.735,
    Fx : -0.06,
    Fy : -0.13,
    scale : 1.0
  };
  var fov = options.fov || {
    x : 1.0,
    y : 1.0
  }
  var tl = options.corner || {
    x : 1.0,
    y : 1.0
  }
  var tr = options.corner || {
    x : 1.0,
    y : 1.0
  }
  var bl = options.corner || {
    x : 1.0,
    y : 1.0
  }
  var br = options.corner || {
    x : 1.0,
    y : 1.0
  }
  var image = options.image || "img/bim/0.png";

  var selector = options.selector || "#canvas";
  var gl = getGLContext(selector);

  var shaders = require('./shaders');

  var vertexSrc = loadFile(options.vertexSrc || "vertex");
  var fragmentSrc = loadFile(options.fragmentSrc || "fragment3");

  var program = compileShader(gl, vertexSrc, fragmentSrc)
  gl.useProgram(program);

  var aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  var aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
  var uSampler = gl.getUniformLocation(program, "uSampler");
  var uLensS = gl.getUniformLocation(program, "uLensS");
  var uLensF = gl.getUniformLocation(program, "uLensF");
  var uFov = gl.getUniformLocation(program, "uFov");
  var uTl = gl.getUniformLocation(program, "uTl");
  var uTr = gl.getUniformLocation(program, "uTr");
  var uBl = gl.getUniformLocation(program, "uBl");
  var uBr = gl.getUniformLocation(program, "uBr");
  var uMatrix = gl.getUniformLocation(program, "uMatrix");

  var vertexBuffer,
      indexBuffer,
      textureBuffer;

  function createBuffers() {

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertex), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.textureCoords), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

  }

  createBuffers();

  function getGLContext(selector){
    var canvas = document.querySelector(selector);

    if(canvas == null){
      throw new Error("there is no canvas on this page");
    }

    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    for (var i = 0; i < names.length; ++i) {
      var gl;
      try {
        gl = canvas.getContext(names[i], {
          premultipliedAlpha: false,
          preserveDrawingBuffer: true });
      } catch(e) {
        continue;
      }
      if (gl) return gl;
    }

    throw new Error("WebGL is not supported!");
  }

  function compileShader(gl, vertexSrc, fragmentSrc){
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSrc);
    gl.compileShader(vertexShader);

    _checkCompile(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSrc);
    gl.compileShader(fragmentShader);

    _checkCompile(fragmentShader);

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    return program;

    function _checkCompile(shader){
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
      }
    }
  }

  function loadFile(url, callback){

    if(shaders.hasOwnProperty(url)) {
      return shaders[url];
    }

    var ajax = new XMLHttpRequest();

    if(callback) {
      ajax.addEventListener("readystatechange", on)
      ajax.open("GET", url, true);
      ajax.send(null);
    } else {
      ajax.open("GET", url, false);
      ajax.send(null);

      if(ajax.status == 200){
        return ajax.responseText;
      }
    }

    function on(){
      if(ajax.readyState === 4){
        //complete requset
        if(ajax.status === 200){
          //not error
          callback(null, ajax.responseText);
        } else {
          callback(new Error("fail to load!"));
        }
      }
    }
  }

  function loadImage(gl, img, callback, texture){
    texture = texture || gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).
    //gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    if(callback) callback(null, texture);
    return texture;
  }

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

  function loadImageFromUrl(gl, url, callback){

    var img = new Image();

    img.addEventListener("load", function onload(){
      loadImage(gl, img, callback, texture);
      options.width = img.width;
      options.height = img.height;
      resize(
        options.width,
        options.height
      )
    });
    img.crossOrigin = "";
    img.src = url;

    return texture;
  }

  function run(animate, callback){
    matrix = perspective(distorter.before, distorter.after)
    var f = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    // ugh
    if(animate === true){
      if(f){
        f(on);
      } else {
        throw new Error("do not support 'requestAnimationFram'");
      }
    } else {
      f(on);
    }

    var current = null;
    function on(t){
      if(!current) current = t;
      var dt = t - current;
      current = t;
      options.runner(dt);
      if (callback) callback();
      if (animate === true) f(on);
    }
  }

  function resize(w, h) {
    gl.viewport(0, 0, w, h);
    gl.canvas.width = w;
    gl.canvas.height = h;
  }

  options.runner = function runner(dt){

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enableVertexAttribArray(aVertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(aTextureCoord);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uSampler, 0);

    gl.uniformMatrix3fv(uMatrix, false, matrix);
    gl.uniform3fv(uLensS, [lens.a, lens.b, lens.scale]);
    gl.uniform2fv(uLensF, [lens.Fx, lens.Fy]);
    gl.uniform2fv(uFov, [fov.x, fov.y]);
    gl.uniform2fv(uTl, [fov.x, fov.y]);
    gl.uniform2fv(uTr, [fov.x, fov.y]);
    gl.uniform2fv(uBl, [fov.x, fov.y]);
    gl.uniform2fv(uBr, [fov.x, fov.y]);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  var texture;

  function setImage(imageUrl, callback) {
    texture = loadImageFromUrl(gl, imageUrl, function onImageLoad() {

      run(options.animate, callback);

    });
  }

  function perspective(before, after) {
    var a = getSquareToQuad.apply(null, after);
    var b = getSquareToQuad.apply(null, before);
    var c = multiply(getInverse(a), b);
    matrix = Array.prototype.concat.apply([], c);

    // Extract a 3x3 matrix out of the arguments
    if (matrix.length == 4) {
        matrix = [
            matrix[0], matrix[1], 0,
            matrix[2], matrix[3], 0,
            0, 0, 1
        ];
    } else if (matrix.length != 9) {
        throw 'can only warp with 2x2 or 3x3 matrix';
    }
    //matrix = getInverse(matrix)
    // Flatten all members of matrix into one big list
    return matrix;
  }

  function warpShader(uniforms, warp) {
    return new Shader(null, uniforms + '\
    uniform mat3 matrix;\
    uniform bool useTextureSpace;\
    uniform sampler2D texture;\
    uniform vec2 texSize;\
    varying vec2 texCoord;\
    void main() {\
        vec2 coord = texCoord * texSize;\
        /*if (useTextureSpace) coord = coord / texSize * 2.0 - 1.0;*/\
        vec3 warp = matrix * vec3(coord, 1.0);\
        coord = warp.xy / warp.z;\
        /*if (useTextureSpace) coord = (coord * 0.5 + 0.5) * texSize;*/\
        gl_FragColor = texture2D(texture, coord / texSize);\
        /*vec2 clampedCoord = clamp(coord, vec2(0.0), texSize);*/\
        /*if (coord != clampedCoord) {*/\
            /* fade to transparent if we are outside the image */\
            /*gl_FragColor.a *= max(0.0, 1.0 - length(coord - clampedCoord));*/\
        }\
    }');
  }

  function getSquareToQuad(x0, y0, x1, y1, x2, y2, x3, y3) {
    var dx1 = x1 - x3;
    var dy1 = y1 - y3;
    var dx2 = x2 - x3;
    var dy2 = y2 - y3;
    var dx3 = x0 - x1 + x3 - x2;
    var dy3 = y0 - y1 + y3 - y2;
    var det = dx1*dy2 - dx2*dy1;
    var a = (dx3*dy2 - dx2*dy3) / det;
    var b = (dx1*dy3 - dx3*dy1) / det;
    return [
        x1 - x0 + a*x1, y1 - y0 + a*y1, a,
        x2 - x0 + b*x2, y2 - y0 + b*y2, b,
        x0, y0, 1
    ];
}

  function getInverse(m) {
    var a = m[0], b = m[1], c = m[2];
    var d = m[3], e = m[4], f = m[5];
    var g = m[6], h = m[7], i = m[8];
    var det = a*e*i - a*f*h - b*d*i + b*f*g + c*d*h - c*e*g;
    return [
        (e*i - f*h) / det, (c*h - b*i) / det, (b*f - c*e) / det,
        (f*g - d*i) / det, (a*i - c*g) / det, (c*d - a*f) / det,
        (d*h - e*g) / det, (b*g - a*h) / det, (a*e - b*d) / det
    ];
  }

  function multiply(a, b) {
    // return [
    //     a[0]*b[0] + a[1]*b[3] + a[2]*b[6],
    //     a[0]*b[1] + a[1]*b[4] + a[2]*b[7],
    //     a[0]*b[2] + a[1]*b[5] + a[2]*b[8],
    //     a[3]*b[0] + a[4]*b[3] + a[5]*b[6],
    //     a[3]*b[1] + a[4]*b[4] + a[5]*b[7],
    //     a[3]*b[2] + a[4]*b[5] + a[5]*b[8],
    //     a[6]*b[0] + a[7]*b[3] + a[8]*b[6],
    //     a[6]*b[1] + a[7]*b[4] + a[8]*b[7],
    //     a[6]*b[2] + a[7]*b[5] + a[8]*b[8]
    // ];
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  }

  setImage(image);

  // asynchronous!
  function getImage(format) {

    var img = new Image();

    img.src = gl.canvas.toDataURL(format || 'image/jpeg');

    return img;

  }

  function getSrc(format) {

    return gl.canvas.toDataURL(format || 'image/jpeg');

  }

  // external API:
  var distorter = {
    options:  options,
    model:    model,
    texture:  texture,
    gl:       gl,
    lens:     lens,
    fov:      fov,
    run:      run,
    getImage: getImage,
    setImage: setImage,
    getSrc:   getSrc,
    before:   before,
    after:    after,
    matrix:   matrix
  }

  return distorter;

}

if (typeof(document) != 'undefined')
  window.FisheyeGl = FisheyeGl;
else
  module.exports = FisheyeGl;

},{"./shaders":2}],2:[function(require,module,exports){
module.exports = {
  fragment: require('./shaders/fragment.glfs'),
  fragment2: require('./shaders/fragment2.glfs'),
  fragment3: require('./shaders/fragment3.glfs'),
  method1: require('./shaders/method1.glfs'),
  method2: require('./shaders/method2.glfs'),
  vertex: require('./shaders/vertex.glvs')
};

},{"./shaders/fragment.glfs":3,"./shaders/fragment2.glfs":4,"./shaders/fragment3.glfs":5,"./shaders/method1.glfs":6,"./shaders/method2.glfs":7,"./shaders/vertex.glvs":8}],3:[function(require,module,exports){
module.exports = "\
#ifdef GL_ES\n\
precision highp float;\n\
#endif\n\
uniform vec4 uLens;\n\
uniform vec2 uFov;\n\
uniform sampler2D uSampler;\n\
varying vec3 vPosition;\n\
varying vec2 vTextureCoord;\n\
vec2 GLCoord2TextureCoord(vec2 glCoord) {\n\
	return glCoord  * vec2(1.0, -1.0)/ 2.0 + vec2(0.5, 0.5);\n\
}\n\
void main(void){\n\
	float scale = uLens.w;\n\
	float F = uLens.z;\n\
	\n\
	float L = length(vec3(vPosition.xy/scale, F));\n\
	vec2 vMapping = vPosition.xy * F / L;\n\
	vMapping = vMapping * uLens.xy;\n\
	vMapping = GLCoord2TextureCoord(vMapping/scale);\n\
	vec4 texture = texture2D(uSampler, vMapping);\n\
	if(vMapping.x > 0.99 || vMapping.x < 0.01 || vMapping.y > 0.99 || vMapping.y < 0.01){\n\
		texture = vec4(0.0, 0.0, 0.0, 0.0);\n\
	} \n\
	gl_FragColor = texture;\n\
}\n\
";
},{}],4:[function(require,module,exports){
module.exports = "\
#ifdef GL_ES\n\
precision highp float;\n\
#endif\n\
uniform vec4 uLens;\n\
uniform vec2 uFov;\n\
uniform sampler2D uSampler;\n\
varying vec3 vPosition;\n\
varying vec2 vTextureCoord;\n\
vec2 TextureCoord2GLCoord(vec2 textureCoord) {\n\
	return (textureCoord - vec2(0.5, 0.5)) * 2.0;\n\
}\n\
vec2 GLCoord2TextureCoord(vec2 glCoord) {\n\
	return glCoord / 2.0 + vec2(0.5, 0.5);\n\
}\n\
void main(void){\n\
	float correctionRadius = 0.5;\n\
	float distance = sqrt(vPosition.x * vPosition.x + vPosition.y * vPosition.y) / correctionRadius;\n\
	float theta = 1.0;\n\
	if(distance != 0.0){\n\
		theta = atan(distance);\n\
	}\n\
	vec2 vMapping = theta * vPosition.xy;\n\
	vMapping = GLCoord2TextureCoord(vMapping);\n\
		\n\
	vec4 texture = texture2D(uSampler, vMapping);\n\
	if(vMapping.x > 0.99 || vMapping.x < 0.01 || vMapping.y > 0.99 || vMapping.y < 0.01){\n\
		texture = vec4(0.0, 0.0, 0.0, 0.0);\n\
	} \n\
	gl_FragColor = texture;\n\
}\n\
";
},{}],5:[function(require,module,exports){
module.exports = "\
#ifdef GL_ES\n\
precision highp float;\n\
#endif\n\
uniform mat3 uMatrix;\
uniform vec3 uLensS;\n\
uniform vec2 uLensF;\n\
uniform vec2 uFov;\n\
uniform sampler2D uSampler;\n\
uniform vec2 texSize;\
varying vec3 vPosition;\n\
varying vec2 vTextureCoord;\n\
vec2 GLCoord2TextureCoord(vec2 glCoord) {\n\
	return glCoord  * vec2(1.0, -1.0)/ 2.0 + vec2(0.5, 0.5);\n\
}\n\
void main(void){\n\
	float scale = uLensS.z;\n\
	vec3 vPos = vPosition;\n\
	float Fx = uLensF.x;\n\
	float Fy = uLensF.y;\n\
	vec2 vMapping = vPos.xy;\n\
	vMapping.x = vMapping.x + ((pow(vPos.y, 2.0)/scale)*vPos.x/scale)*-Fx;\n\
	vMapping.y = vMapping.y + ((pow(vPos.x, 2.0)/scale)*vPos.y/scale)*-Fy;\n\
  vMapping = vMapping * uLensS.xy;\n\
	vMapping = GLCoord2TextureCoord(vMapping/scale);\n\
  vec3 warp = uMatrix * vec3(vMapping, 1.0);\
  vMapping = warp.xy / warp.z;\
	vec4 texture = texture2D(uSampler, vMapping);\n\
	if(vMapping.x > 0.99 || vMapping.x < 0.01 || vMapping.y > 0.99 || vMapping.y < 0.01){\n\
		texture = vec4(0.0, 0.0, 0.0, 0.0);\n\
	}\n\
	gl_FragColor = texture;\n\
}\n\
";
},{}],6:[function(require,module,exports){
module.exports = "\
#ifdef GL_ES\n\
precision highp float;\n\
#endif\n\
uniform vec4 uLens;\n\
uniform vec2 uFov;\n\
uniform sampler2D uSampler;\n\
varying vec3 vPosition;\n\
varying vec2 vTextureCoord;\n\
vec2 TextureCoord2GLCoord(vec2 textureCoord) {\n\
	return (textureCoord - vec2(0.5, 0.5)) * 2.0;\n\
}\n\
vec2 GLCoord2TextureCoord(vec2 glCoord) {\n\
	return glCoord / 2.0 + vec2(0.5, 0.5);\n\
}\n\
void main(void){\n\
	vec2 vMapping = vec2(vTextureCoord.x, 1.0 - vTextureCoord.y);\n\
	vMapping = TextureCoord2GLCoord(vMapping);\n\
	//TODO insert Code\n\
	float F = uLens.x/ uLens.w;\n\
	float seta = length(vMapping) / F;\n\
	vMapping = sin(seta) * F / length(vMapping) * vMapping;\n\
	vMapping *= uLens.w * 1.414;\n\
	vMapping = GLCoord2TextureCoord(vMapping);\n\
	vec4 texture = texture2D(uSampler, vMapping);\n\
	if(vMapping.x > 0.99 || vMapping.x < 0.01 || vMapping.y > 0.99 || vMapping.y < 0.01){\n\
		texture = vec4(0.0, 0.0, 0.0, 1.0);\n\
	} \n\
	gl_FragColor = texture;\n\
}\n\
";
},{}],7:[function(require,module,exports){
module.exports = "\
#ifdef GL_ES\n\
precision highp float;\n\
#endif\n\
uniform vec4 uLens;\n\
uniform vec2 uFov;\n\
uniform sampler2D uSampler;\n\
varying vec3 vPosition;\n\
varying vec2 vTextureCoord;\n\
vec2 TextureCoord2GLCoord(vec2 textureCoord) {\n\
	return (textureCoord - vec2(0.5, 0.5)) * 2.0;\n\
}\n\
vec2 GLCoord2TextureCoord(vec2 glCoord) {\n\
	return glCoord / 2.0 + vec2(0.5, 0.5);\n\
}\n\
void main(void){\n\
	vec2 vMapping = vec2(vTextureCoord.x, 1.0 - vTextureCoord.y);\n\
	vMapping = TextureCoord2GLCoord(vMapping);\n\
	//TOD insert Code\n\
	float F = uLens.x/ uLens.w;\n\
	float seta = length(vMapping) / F;\n\
	vMapping = sin(seta) * F / length(vMapping) * vMapping;\n\
	vMapping *= uLens.w * 1.414;\n\
	vMapping = GLCoord2TextureCoord(vMapping);\n\
	vec4 texture = texture2D(uSampler, vMapping);\n\
	if(vMapping.x > 0.99 || vMapping.x < 0.01 || vMapping.y > 0.99 || vMapping.y < 0.01){\n\
		texture = vec4(0.0, 0.0, 0.0, 1.0);\n\
	} \n\
	gl_FragColor = texture;\n\
}\n\
";
},{}],8:[function(require,module,exports){
module.exports = "\
#ifdef GL_ES\n\
precision highp float;\n\
#endif\n\
attribute vec3 aVertexPosition;\n\
attribute vec2 aTextureCoord;\n\
varying vec3 vPosition;\n\
varying vec2 vTextureCoord;\n\
void main(void){\n\
	vPosition = aVertexPosition;\n\
	vTextureCoord = aTextureCoord;\n\
	gl_Position = vec4(vPosition,1.0);\n\
}\n\
";
},{}]},{},[1]);
