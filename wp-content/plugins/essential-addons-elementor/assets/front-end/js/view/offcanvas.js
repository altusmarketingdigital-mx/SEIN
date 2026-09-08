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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/view/offcanvas.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/view/offcanvas.js":
/*!**********************************!*\
  !*** ./src/js/view/offcanvas.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("(function ($) {\n  window.EAELOffcanvasContent = function ($scope) {\n    this.node = $scope;\n    if ($scope.find(\".eael-offcanvas-toggle\").length < 1) return;\n    this.wrap = $scope.find(\".eael-offcanvas-content-wrap\");\n    this.content = $scope.find(\".eael-offcanvas-content\");\n    this.button = $scope.find(\".eael-offcanvas-toggle\");\n    this.settings = this.wrap.data(\"settings\");\n    this.id = this.settings.content_id;\n    this.transition = this.settings.transition;\n    this.esc_close = this.settings.esc_close;\n    this.body_click_close = this.settings.body_click_close;\n    this.open_offcanvas = this.settings.open_offcanvas;\n    this.direction = this.settings.direction;\n    this.duration = 500;\n    this.init();\n  };\n  EAELOffcanvasContent.prototype = {\n    id: \"\",\n    node: \"\",\n    wrap: \"\",\n    content: \"\",\n    button: \"\",\n    settings: {},\n    transition: \"\",\n    duration: 400,\n    initialized: false,\n    animations: [\"slide\", \"slide-along\", \"reveal\", \"push\"],\n    init: function init() {\n      if (!this.wrap.length) {\n        return;\n      }\n      $(\"html\").addClass(\"eael-offcanvas-content-widget\");\n      if ($(\".eael-offcanvas-container\").length === 0) {\n        $(\"body\").wrapInner('<div class=\"eael-offcanvas-container eael-offcanvas-container-' + this.id + '\" />');\n        this.content.insertBefore(\".eael-offcanvas-container\");\n      }\n      if (this.wrap.find(\".eael-offcanvas-content\").length > 0) {\n        if ($(\".eael-offcanvas-container > .eael-offcanvas-content-\" + this.id).length > 0) {\n          $(\".eael-offcanvas-container > .eael-offcanvas-content-\" + this.id).remove();\n        }\n        if ($(\"body > .eael-offcanvas-content-\" + this.id).length > 0) {\n          $(\"body > .eael-offcanvas-content-\" + this.id).remove();\n        }\n        $(\"body\").prepend(this.wrap.find(\".eael-offcanvas-content\"));\n      }\n      this.bindEvents();\n    },\n    destroy: function destroy() {\n      this.close();\n      this.animations.forEach(function (animation) {\n        if ($(\"html\").hasClass(\"eael-offcanvas-content-\" + animation)) {\n          $(\"html\").removeClass(\"eael-offcanvas-content-\" + animation);\n        }\n      });\n      if ($(\"body > .eael-offcanvas-content-\" + this.id).length > 0) {\n        //$('body > .eael-offcanvas-content-' + this.id ).remove();\n      }\n    },\n    bindEvents: function bindEvents() {\n      if (this.open_offcanvas === \"yes\") {\n        this.show();\n      }\n      this.button.on(\"click\", $.proxy(this.toggleContent, this));\n      $(\"body\").delegate(\".eael-offcanvas-content .eael-offcanvas-close\", \"click\", $.proxy(this.close, this));\n      if (this.esc_close === \"yes\") {\n        this.closeESC();\n      }\n      if (this.body_click_close === \"yes\") {\n        this.closeClick();\n      }\n    },\n    toggleContent: function toggleContent() {\n      if (!$(\"html\").hasClass(\"eael-offcanvas-content-open\")) {\n        this.show();\n      } else {\n        this.close();\n      }\n    },\n    show: function show() {\n      $(\".eael-offcanvas-content-\" + this.id).addClass(\"eael-offcanvas-content-visible\");\n      // init animation class.\n      $(\"html\").addClass(\"eael-offcanvas-content-\" + this.transition);\n      $(\"html\").addClass(\"eael-offcanvas-content-\" + this.direction);\n      $(\"html\").addClass(\"eael-offcanvas-content-open\");\n      $(\"html\").addClass(\"eael-offcanvas-content-\" + this.id + \"-open\");\n      $(\"html\").addClass(\"eael-offcanvas-content-reset\");\n    },\n    close: function close() {\n      $(\"html\").removeClass(\"eael-offcanvas-content-open\");\n      $(\"html\").removeClass(\"eael-offcanvas-content-\" + this.id + \"-open\");\n      setTimeout($.proxy(function () {\n        $(\"html\").removeClass(\"eael-offcanvas-content-reset\");\n        $(\"html\").removeClass(\"eael-offcanvas-content-\" + this.transition);\n        $(\"html\").removeClass(\"eael-offcanvas-content-\" + this.direction);\n        $(\".eael-offcanvas-content-\" + this.id).removeClass(\"eael-offcanvas-content-visible\");\n      }, this), 500);\n    },\n    closeESC: function closeESC() {\n      var self = this;\n      if (\"\" === self.settings.esc_close) {\n        return;\n      }\n\n      // menu close on browser navigating back\n      $(window).on(\"pageshow\", function (event) {\n        if (event.originalEvent.persisted) {\n          self.close();\n        }\n      });\n\n      // menu close on ESC key\n      $(document).on(\"keydown\", function (e) {\n        if (27 === e.keyCode || 8 === e.keyCode) {\n          // ESC\n          self.close();\n        }\n      });\n    },\n    closeClick: function closeClick() {\n      var self = this;\n      $(document).on(\"click\", function (e) {\n        if ($(e.target).is(\".eael-offcanvas-content\") || $(e.target).parents(\".eael-offcanvas-content\").length > 0 || $(e.target).is(\".eael-offcanvas-toggle\") || $(e.target).parents(\".eael-offcanvas-toggle\").length > 0) {\n          return;\n        } else {\n          self.close();\n        }\n      });\n    }\n  };\n})(jQuery);\nvar EaelOffcanvas = function EaelOffcanvas($scope, $) {\n  new window.EAELOffcanvasContent($scope);\n};\njQuery(window).on(\"elementor/frontend/init\", function () {\n  if (eael.elementStatusCheck(\"offcanvasLoad\")) {\n    return false;\n  }\n  jQuery('[data-widget_type=\"eael-offcanvas.default\"]', document).each(function () {\n    EaelOffcanvas(jQuery(this));\n  });\n});\n\n//# sourceURL=webpack:///./src/js/view/offcanvas.js?");

/***/ })

/******/ });