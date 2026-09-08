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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/view/advanced-accordion.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/view/advanced-accordion.js":
/*!*******************************************!*\
  !*** ./src/js/view/advanced-accordion.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var advancedAccordion = function advancedAccordion($scope, $) {\n  // Scope all queries\n  var scopeEl = $scope[0];\n  if (!scopeEl) return;\n\n  // Set duration\n  scopeEl.querySelectorAll(\"[data-duration]\").forEach(function (el) {\n    var duration = el.getAttribute(\"data-duration\");\n    el.style.setProperty(\"--accordion-duration\", duration + \"s\");\n  });\n  var featureButtons = scopeEl.querySelectorAll(\".eael-accordion_media-list\");\n  var viewerImages = scopeEl.querySelectorAll(\".eael-accordion_media-image\");\n  var currentFeature = 0;\n  function updateFeature(index) {\n    if (index === currentFeature) {\n      return;\n    }\n    var oldButton = featureButtons[currentFeature];\n    oldButton.classList.remove(\"active\");\n    var oldDescription = oldButton.querySelector(\".eael-accordion_media-description\");\n    oldDescription.style.height = oldDescription.scrollHeight + \"px\";\n    oldDescription.offsetHeight;\n    oldDescription.style.height = \"0\";\n    var newButton = featureButtons[index];\n    newButton.classList.add(\"active\");\n    var newDescription = newButton.querySelector(\".eael-accordion_media-description\");\n    newDescription.style.visibility = \"hidden\";\n    newDescription.style.height = \"auto\";\n    var fullHeight = newDescription.scrollHeight + \"px\";\n    newDescription.style.height = \"0\";\n    newDescription.style.visibility = \"visible\";\n    requestAnimationFrame(function () {\n      newDescription.style.height = fullHeight;\n    });\n    viewerImages.forEach(function (img) {\n      return img.classList.remove(\"active\");\n    });\n    viewerImages[index].classList.add(\"active\");\n    currentFeature = index;\n  }\n  featureButtons.forEach(function (button, index) {\n    button.addEventListener(\"click\", function () {\n      updateFeature(index);\n    });\n  });\n  function openFirstItem() {\n    var firstBtn = featureButtons[0];\n    if (firstBtn && firstBtn.classList.contains(\"active\")) {\n      var desc = firstBtn.querySelector(\".eael-accordion_media-description\");\n      desc.style.visibility = \"hidden\";\n      desc.style.height = \"auto\";\n\n      // Use double requestAnimationFrame for Firefox compatibility\n      // This ensures the layout is fully calculated before reading scrollHeight\n      requestAnimationFrame(function () {\n        requestAnimationFrame(function () {\n          var fullHeight = desc.scrollHeight + \"px\";\n          desc.style.height = \"0\";\n          desc.style.visibility = \"visible\";\n          requestAnimationFrame(function () {\n            desc.style.height = fullHeight;\n          });\n        });\n      });\n    }\n  }\n\n  //Elementor Editor\n  if (window.location.href.includes(\"elementor\")) {\n    openFirstItem();\n    // setTimeout(() => {\n    //    openFirstItem();\n    // }, 500);\n  }\n\n  // Use both DOMContentLoaded and load for better cross-browser compatibility\n  if (document.readyState === \"loading\") {\n    window.addEventListener(\"load\", function () {\n      openFirstItem();\n    });\n  } else {\n    // DOM is already loaded, call immediately with a delay for Firefox\n    setTimeout(function () {\n      openFirstItem();\n    }, 0);\n  }\n};\njQuery(window).on(\"elementor/frontend/init\", function () {\n  if (eael.elementStatusCheck(\"advancedAccordion\")) {\n    return false;\n  }\n  elementorFrontend.hooks.addAction(\"frontend/element_ready/eael-adv-accordion.default\", advancedAccordion);\n});\n\n//# sourceURL=webpack:///./src/js/view/advanced-accordion.js?");

/***/ })

/******/ });