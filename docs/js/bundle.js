/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const canvas = document.getElementById('worldmap');
const context = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const pixelsPerCell = 5;
const width = ~~(canvas.clientWidth / pixelsPerCell);
const height = ~~(canvas.clientHeight / pixelsPerCell);

var buffer = new ArrayBuffer(width * height);
var current = new Uint8Array(buffer);
var nextBuffer = new ArrayBuffer(width * height);
var next = new Uint8Array(nextBuffer);

// starting position at the center, hence divide by 2
var i = ~~(height / 2);
var j = ~~(width / 2);
current[(i - 1) * width + j] = 1;
current[i * width + j + 2] = 1;
current[(i + 1) * width + j - 1] = 1;
current[(i + 1) * width + j] = 1;
current[(i + 1) * width + j + 3] = 1;
current[(i + 1) * width + j + 4] = 1;
current[(i + 1) * width + j + 5] = 1;

var mouseDown = false;
function mouseIsDown(event) {
  if (event.button === 0) {
    mouseDown = true;
  }
}
function mouseIsUp(event) {
  mouseDown = false;
}
document.body.onmousedown = mouseIsDown;
document.body.onmouseup = mouseIsUp;
function moveEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const mousePos = {
    x: (event.clientX - rect.left) / (rect.right - rect.left) * canvas.clientWidth,
    y: (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.clientHeight
  };
  const pos = {
    i: ~~(mousePos.y / pixelsPerCell),
    j: ~~(mousePos.x / pixelsPerCell)
  };
  posNode.nodeValue = ` - i: ${pos.i}, j: ${pos.j}`;
  if (mouseDown) {
    next[pos.i * width + pos.j] = 1;
    next[(pos.i - 1) * width + pos.j] = 1;
    next[(pos.i + 1) * width + pos.j] = 1;
    next[pos.i * width + pos.j + 1] = 1;
    next[pos.i * width + pos.j - 1] = 1;
  }
}
canvas.addEventListener('mousemove', moveEvent, false);

function cell(i, j) {
  if (i === -1) {
    i = height - 1;
  } else if (i === height) {
    i = 0;
  }
  if (j === -1) {
    j = width - 1;
  } else if (j === width) {
    j = 0;
  }
  return current[i * width + j];
}

function computeNextStep() {
  var neighbors;

  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      neighbors = cell(i - 1, j - 1) + cell(i - 1, j) + cell(i - 1, j + 1);
      neighbors += cell(i, j - 1) + cell(i, j + 1);
      neighbors += cell(i + 1, j - 1) + cell(i + 1, j) + cell(i + 1, j + 1);
      if (neighbors < 2 || neighbors > 3) {
        next[i * width + j] = 0;
      } else if (neighbors === 3) {
        next[i * width + j] = 1;
      } else {
        next[i * width + j] = current[i * width + j];
      }
    }
  }
};

const info = document.getElementById('info');
var fpsTime = 0;
var cellTime = 0;
var fps = 0;
var desiredFPS = 30;
var frameNumber = 0;
function draw(timeStamp) {
  window.requestAnimationFrame(draw);

  const cellElapsed = timeStamp - cellTime;
  if (cellElapsed > 1000 / desiredFPS) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    current.set(next);

    context.strokeStyle = 'rgba(255,118,5,0.5)';
    context.fillStyle = 'rgba(222,122,39,0.5)';
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        if (current[i * width + j] === 1) {
          context.strokeRect(pixelsPerCell * j, pixelsPerCell * i, pixelsPerCell, pixelsPerCell);
          context.fillRect(pixelsPerCell * j, pixelsPerCell * i, pixelsPerCell, pixelsPerCell);
        }
      }
    }
    computeNextStep();
    frameNumber += 1;
    cellTime = timeStamp - cellElapsed % (1000 / desiredFPS);
  }

  // Update FPS display every half second
  const fpsElapsed = timeStamp - fpsTime;
  if (fpsElapsed > 500) {
    fps = 1000 / fpsElapsed * frameNumber;
    fpsNode.nodeValue = `${fps.toFixed(2)} FPS`;
    fpsTime = timeStamp;
    frameNumber = 0;
  }
};

const fpsNode = document.createTextNode('');
const posNode = document.createTextNode('');
info.appendChild(fpsNode);
info.appendChild(posNode);
computeNextStep();
window.requestAnimationFrame(draw);

/***/ })
/******/ ]);