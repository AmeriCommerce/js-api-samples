/*!
 * AmeriCommerce Clientside API v0.4
 * http://www.americommerce.com
 *
 * Copyright AmeriCommerce L.P.
 *
 * Date: 10/29/2012 2:24:30 PM
 */
(function(window, undefined) {

var document = window.document,
    JSON = window.JSON,
    AC = window.AC || {};


/**
 * Binds the context of a function call to a given scope.
 * @param {Function} fn Function to call.
 * @param context The context to use.
 * @return {Function} New function with the bound context.
 */
function bind() {
  var args    = Array.prototype.slice.call(arguments),
      fn      = args.shift(),
      context = args.shift();

  return function() {
    return fn.apply(context, args.concat(Array.prototype.slice.call(arguments)));
  };
}

/**
 * Merges two or more objects.
 * @param {Function|Object} dest Destination object, where the properties from the other objects will be merged into.
 * @param {Function|Object} [...] Objects to merge.
 * @return {Function|Object} The destination object after merging.
 */
function merge() {
  var args = Array.prototype.slice.call(arguments),
      dest = args.shift(),
      i, len, src, prop;

  for(i = 0, len = args.length; i < len; i++) {
    src = args[i];

    if(typeof src !== 'function' && Object.prototype.toString.apply(src) !== '[object Object]') {
      throw new TypeError();
    }

    for(prop in src) {
      dest[prop] = src[prop];
    }
  }
  return dest;
}

/**
 * Creates a inherited type from a parent type.
 * @param {Function} parent The parent type constructor.
 * @param {Object} [methods] An object containing methods and properties to add to the child's prototype.
 * @param {Object} [statics] An object containing methods and properties to add to the child type (static).
 * @return {Function} The child type constructor.
 */
function inherits(parent, methods, statics) {
  var child,
      F = function() {};

  if(methods && methods.hasOwnProperty("constructor")) {
    child = methods.constructor;
  } else {
    child = function() {
      parent.apply(this, arguments);
    }
  }

  merge(child, parent);

  F.prototype = parent.prototype;
  child.prototype = new F();

  if(methods) {
    merge(child.prototype, methods);
  }
  if(statics) {
    merge(child, statics);
  }

  child.prototype.constructor = child;
  child.__super = parent.prototype;

  return child;
}


/**
 * Primary namespace for everything in the API.
 * @type {Object}
 */
AC = {
  _apiKey: null,
  _apiEndpoint: null,
  _storeDomain: null,
  _clientDomain: null,
  _protocol: 'https',
  _ameriCartId: null,

  /**
   * Initializes the API.
   * @param {Object} options Object containing configuration options.
   */
  init: function(options) {
    if(options.apiKey) {
      AC._apiKey = options.apiKey;
    }
    if(options.storeDomain) {
      AC._storeDomain = options.storeDomain;
    }
    if(options.cartId || options.ameriCartId) {
      AC._ameriCartId = options.cartId || options.ameriCartId;
    }
    AC._clientDomain = AC._getCurrentDomain();
    AC._protocol = options.protocol || AC._protocol;

    if(AC._apiKey) {
      AC.cookie.load();
    }
    if(AC._storeDomain) {
      AC._apiEndpoint = AC._protocol + '://' + AC._storeDomain + '/clientapi';
    }
  },

  /**
   * Retrieves the full endpoint URL for a given resource.
   * @param resource Resource to target.
   * @return {string} Full endpoint URL for the resource.
   * @private
   */
  _getEndpoint: function(resource) {
    return AC._apiEndpoint + resource;
  },

  /**
   * Retrieves the domain for the current document.
   * @return {string} Document domain, defaults to localhost.
   * @private
   */
  _getCurrentDomain: function() {
    if(document) {
      return document.domain;
    }
    return 'localhost';
  }
};

window.AC = AC;

/**
 * Namespace containing base64 operations.
 *
 * Reference:
 * http://www.webtoolkit.info/javascript-base64.html
 * http://stackoverflow.com/questions/246801/how-can-you-encode-to-base64-using-javascript
 *
 * @type {Object}
 */
AC.base64 = {
  _keyString: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  /**
   * Encodes a string as base64.
   * @param {String} str Plaintext string to encode.
   * @return {String} base64-encoded string.
   */
  encode: function(str) {
    if(!str) return undefined;

    var output = "", i = 0, l,
        c1, c2, c3, e1, e2, e3, e4;

    str = this._utf8Encode(str);
    l = str.length;

    while(i < l) {
      c1 = str.charCodeAt(i++);
      c2 = str.charCodeAt(i++);
      c3 = str.charCodeAt(i++);

      e1 = c1 >> 2;
      e2 = ((c1 & 3) << 4) | (c2 >> 4);
      e3 = ((c2 & 15) << 2) | (c3 >> 6);
      e4 = c3 & 63;

      if(isNaN(c2)) {
        e3 = e4 = 64;
      } else if(isNaN(c3)) {
        e4 = 64;
      }

      output += (
        this._keyString.charAt(e1) +
          this._keyString.charAt(e2) +
          this._keyString.charAt(e3) +
          this._keyString.charAt(e4)
        );
    }
    return output;
  },

  /**
   * Decodes a base64 string.
   * @param {String} str base64 string to decode.
   * @return {String} Plaintext string result.
   */
  decode: function(str) {
    if(!str) return undefined;

    var output = "", i = 0, l,
        c1, c2, c3, e1, e2, e3, e4;

    str = str.replace(/[^A-Za-z0-9\+=\/]/g, "");
    l = str.length;

    while(i < l) {
      e1 = this._keyString.indexOf(str.charAt(i++));
      e2 = this._keyString.indexOf(str.charAt(i++));
      e3 = this._keyString.indexOf(str.charAt(i++));
      e4 = this._keyString.indexOf(str.charAt(i++));

      c1 = (e1 << 2) | (e2 >> 4);
      c2 = ((e2 & 15) << 4) | (e3 >> 2);
      c3 = ((e3 & 3) << 6) | e4;

      output += String.fromCharCode(c1);

      if(e3 != 64) {
        output += String.fromCharCode(c2);
      }
      if(e4 != 64) {
        output += String.fromCharCode(c3);
      }
    }

    output = this._utf8Decode(output);
    return output;
  },

  /**
   * Encodes a plaintext string as UTF8 before attempting to base64 encode it.
   * @param {String} str Source string.
   * @return {String} UTF8-encoded string.
   * @private
   */
  _utf8Encode: function(str) {
    str = str.replace(/\r\n/g, "\n");
    var utf = "";

    for(var i = 0, l = str.length; i < l; i++) {
      var c = str.charCodeAt(i);

      if(c < 128) {
        utf += String.fromCharCode(c);
      } else if((c > 127) && (c < 2048)) {
        utf += String.fromCharCode((c >> 6) | 192);
        utf += String.fromCharCode((c & 63) | 128);
      } else {
        utf += String.fromCharCode((c >> 12) | 224);
        utf += String.fromCharCode(((c >> 6) & 63) | 128);
        utf += String.fromCharCode((c & 63) | 128);
      }
    }
    return utf;
  },

  /**
   * Decodes a UTF8 string into it's original representation.
   * @param {String} utf UTF8-encoded string.
   * @return {String} Result string.
   * @private
   */
  _utf8Decode: function(utf) {
    var result = "", i = 0,
        c1 = 0, c2 = 0, c3 = 0,
        l = utf ? utf.length : 0;

    while(i < l) {
      c1 = utf.charCodeAt(i);

      if(c1 < 128) {
        result += String.fromCharCode(c1);
        i++;
      } else if((c1 > 191) && (c1 < 224)) {
        c2 = utf.charCodeAt(i+1);
        result += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utf.charCodeAt(i+1);
        c3 = utf.charCodeAt(i+2);
        result += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
    }
    return result;
  }
};

/**
 * Namespace containing methods that work with query string encoding.
 * @type {Object}
 */
AC.queryString = {
  /**
   * Encodes an object into a query string supported format.
   * @param {Object} data Data to flatten.
   * @return {String} Encoded query string.
   */
  encode: function(data) {
    var params = [],
        encode = encodeURIComponent,
        key, val, pair;

    for(key in data) {
      val = data[key];

      if(val !== null && typeof val !== 'undefined') {
        if(Object.prototype.toString.apply(val) === "[object Array]") {
          val = AC.queryString.deflateArray(val);
        }

        pair = encode(key) + '=' + encode(val);
        params.push(pair);
      }
    }
    params.sort();

    return params.join('&');
  },

  /**
   * Decodes a query string into an approximate object representation of the data.
   * @param {String} str Query string to rehydrate.
   * @return {Object} Decoded object.
   */
  decode: function(str) {
    var decode = decodeURIComponent,
        params = {},
        parts,
        pair,
        val;

    if(str) {
      parts = str.split('&');

      for(var i = 0, l = parts.length; i < l; i++) {
        pair = parts[i].split('=', 2);
        if(pair && pair[0]) {
          val = decode(pair[1]);

          if(val.indexOf('|') > -1)
            val = AC.queryString.inflateArray(val);

          params[decode(pair[0])] = val;
        }
      }
    }
    return params;
  },

  deflateArray: function(arr) {
    var str = "";
    for(var i = 0, len = arr.length; i < len; i++) {
      if(str.length > 0) {
        str += "|";
      }
      str += arr[i];
    }
    return str;
  },

  inflateArray: function(flatArr) {
    return flatArr.split('|');
  }
};

/**
 * Namespace containing operations that work with cookies.
 * @type {Object}
 */
AC.cookie = {
  _defaults: {
    expires:  -1,
    path:     '/',
    secure:   false
  },

  /**
   * Loads the API cookie.
   * @return {Object} Object representing the data in the cookie.
   */
  load: function() {
    var key     = "ac_" + AC._apiKey,
        cookie  = document.cookie.match('\\b' + key + '=([^;]*)\\b'),
        data;

    if(cookie) {
      cookie  = decodeURIComponent(cookie[1]);
      data    = JSON.parse(AC.base64.decode(cookie));
      data.expires = parseInt(data.expires, 10);
    }
    return data;
  },

  /**
   * Sets the API cookie.
   * @param data Data to set on the cookie.
   */
  set: function(data) {
    var key   = "ac_" + AC._apiKey,
        opts  = AC.merge({}, AC.cookie._defaults);

    opts.domain = AC._domain || document.domain;

    if(data) {
      opts.expires  = data.expires || opts.expires;
      opts.path     = data.path    || opts.path;
      opts.secure   = data.secure  || opts.secure;

      data.domain = opts.domain;
    }
    AC.cookie._setRaw(key, data, opts);
  },

  /**
   * Clears the API cookie.
   */
  clear: function() {
    AC.cookie.set(null);
  },

  /**
   * Formats and sets the raw cookie data.
   * @param {String} key Key that represents the cookie.
   * @param {Object} data Data that will be stored in the cookie.
   * @param {Object} options Options that configure the cookie.
   * @private
   */
  _setRaw: function(key, data, options) {
    if(!data || !options.expires) {
      options.expires = -1;
    }
    if(typeof options.expires === 'number') {
      var days = options.expires,
        t    = options.expires = new Date();

      t.setDate(t.getDate() + days);
    }

    data = data ? AC.base64.encode(JSON.stringify(data)) : "";

    document.cookie = [
      encodeURIComponent(key), '=', encodeURIComponent(data),
      options.expires  ? ';expires=' + options.expires.toUTCString() : '',
      options.path     ? ';path='    + options.path : '',
      options.domain   ? ';domain='  + options.domain : '',
      options.secure   ? ';secure' : ''
    ].join('');
  }
};

/**
 * Namespace containing operations that communicate with the AC store and servers.
 * @type {Object}
 */
AC.api = {
  _callbacks: {},

  /**
   * Performs a jsonp request.
   * @param {Object} options Options object containing configuration.
   */
  jsonp: function(options) {
    if(!options) {
      throw new Error('No options specified for the JSONP request.');
    }

    var jsonpCallback = AC.api._generateCallbackName(),
        script = document.createElement('script');

    if(!options.method || options.method.toLowerCase() != 'get') {
      options.method = 'GET';
    }

    if(!options.url) {
      throw new Error('URL endpoint required for JSONP request.');
    }

    var data = options.data,
      url = options.url;

    data['_cb'] = 'AC.api._callbacks.' + jsonpCallback;

    if(url.indexOf('?') > -1) {
      url += '&';
    } else {
      url += '?';
    }
    url += AC.queryString.encode(data);

    if(url.length > 2000) {
      throw new Error('Data size exceeds the maximum of 2000 bytes that JSONP supports.');
    }

    AC.api._callbacks[jsonpCallback] = function(response) {
      options.callback && options.callback(response);
      delete AC.api._callbacks[jsonpCallback];
      script.parentNode.removeChild(script);
    };
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  },

  /**
   * Generates a semi-random string to use for the jsonp callback name.
   * @return {String} The generated callback name.
   * @private
   */
  _generateCallbackName: function() {
    return "ac" + (Math.random() * (1 << 30)).toString(16).replace('.', '');
  }
};

/**
 * Type that contains all of the common event operations.
 * @type {*}
 */
AC.EventProvider = (function () {

  var EventProvider = function () {
  };

  EventProvider.prototype = {
    /**
     * Adds a handler for a given event.
     * @param {String} event The name of the event.
     * @param {Function} handler The handler function for the event.
     */
    subscribe:function (event, handler) {
      var subs = this._getSubs();

      if (!subs[event]) {
        subs[event] = [handler];
      } else {
        subs[event].push(handler);
      }
    },

    /**
     * Removes one or all handlers from an event.
     * @param {String} event The name of the event.
     * @param {Function} [handler] [Optional] The handler for the event.
     */
    unsubscribe:function (event, handler) {
      if (handler) {
        var subs = this._getSubs()[event],
            index;

        if (!subs) {
          return;
        }
        index = subs.indexOf(handler);

        if (index > -1) {
          subs.splice(index, 1);
        }
      } else {
        delete this._getSubs()[event];
      }
    },

    /**
     * Raises an event.
     * @param {String} event The name of the event to raise.
     */
    raise:function () {
      var args = Array.prototype.slice.call(arguments),
          name = args.shift(),
          subs = this._getSubs()[name],
          i, len;

      if (!subs) {
        return;
      }

      for (i = 0, len = subs.length; i < len; i++) {
        subs[i].apply(this, args);
      }
    },

    /**
     * Observes an event until the function being watched returns true.
     * @param {String} event The event to watch.
     * @param {Function} observer The observation function.
     */
    watch: function (event, observer) {
      var context, fn;

      if (!observer()) {
        context = this;
        fn = function () {
          if (observer.apply(observer, arguments)) {
            context.unsubscribe(event, fn);
          }
        };
        this.subscribe(event, fn);
      }
    },

    /**
     * Gets the subscriptions for this object.
     * @return {Object} Object containing all of the subscriptions.
     * @private
     */
    _getSubs:function () {
      if (!this._subscriptions) {
        this._subscriptions = {};
      }
      return this._subscriptions;
    }
  };

  /**
   * Self-propagating static inheritance helper method.
   * @param {Object} methods Methods to add to the child's prototype.
   * @param {Object} statics Methods to add to the child constructor as statics.
   * @return {Function} Child constructor.
   */
  EventProvider.extend = function(methods, statics) {
    var child = inherits(this, methods, statics);
    child.extend = this.extend;
    return child;
  };

  return EventProvider;

}());

/**
 * Type that extends AC.EventProvider and provides some common functionality.
 * @type {AC.BaseObj}
 */
AC.BaseObj = (function() {

  return AC.EventProvider.extend({
    /**
     * Sets a property and raises an event for that property name.
     * @param {String} name The property name.
     * @param value The value to set.
     * @override
     */
    setProperty: function(name, value) {
      if(JSON.stringify(value) != JSON.stringify(this[name])) {
        this[name] = value;
        this.raise(name, value);
      }
    },

    /**
     * Wrapper around the bind helper that binds the scope to this instance.
     * @param {Function} fn Function to call.
     * @return {Function} Bound function.
     */
    bind: function(fn) {
      return bind(fn, this);
    }
  });

}());

/**
 * Type representing a single operation of a batch.
 * @type {AC.Task}
 */
AC.Task = (function() {

  return AC.BaseObj.extend({
    /**
     * Creates a new instance of AC.Task
     * @param {Function} fn Function representing the task, should return a result
     * @constructor
     */
    constructor: function(fn) {
      if(!AC.Task._id) {
        AC.Task._id = 1;
      }
      this.uniqueName = "batchTask_" + AC.Task._id++;
      this._fn = fn;
    },

    /**
     * Runs the function assigned to this task.
     */
    run: function() {
      this._fn.apply(this);
    },

    /**
     * Called to signal that this task is complete.
     * @param value Value to set
     */
    done: function(value) {
      this.setProperty('value', value);
    }
  });

}());

/**
 * Type encapsulating batch API operations.
 * @type {AC.Batch}
 */
AC.Batch = (function() {

  return AC.BaseObj.extend({
    /**
     * Creates a new instance of AC.Batch
     * @constructor
     */
    constructor: function() {
      this.reset();
    },

    /**
     * Adds a task to the batch.
     * @param {AC.Task|Function} fn Task or function to add to the batch.
     * @return {AC.Task} Task that was added.
     */
    add: function(fn) {
      var task;

      if(!(fn instanceof AC.Task)) {
        task = new AC.Task(fn);
      } else {
        task = fn;
      }

      this._queue.push(task);
      return task;
    },

    /**
     * Runs the batch.
     * @param {Function} [callback] [Optional] Callback function that will run after the batch completes.
     */
    run: function(callback) {
      var process = this.bind(this._process);

      if(callback) {
        this.unsubscribe('complete');
        this.subscribe('complete', callback);
      }

      if(this._timer < 0) {
        this._timer = setTimeout(process, 10);
      }
    },

    /**
     * Resets the batch to its default state.
     */
    reset: function() {
      this._queue  = [];
      this._status = {};
      this._timer  = -1;
    },

    /**
     * Main processing routine that runs through the batch.
     * @private
     */
    _process: function() {
      var self = this,
          queue = self._queue,
          i, len, task;

      this._status = {};

      for(i = 0, len = queue.length; i < len; i++) {
        task = queue[i];
        task.subscribe('value', function() {
          if(this.value) {
            self._updateStatus(this, queue);
            this.unsubscribe('value');
          }
        });
        task.run();
      }
    },

    /**
     * Updates the status of the batch when a task value is set.
     * @param {AC.Task} task Task that completed.
     * @private
     */
    _updateStatus: function(task) {
      this._status[task.uniqueName] = task;

      if(this._isDone()) {
        this.raise('complete', this._status);
      }
    },

    /**
     * Checks to see if the batch is done.
     * @return {Boolean}
     * @private
     */
    _isDone: function() {
      var i, len, t,
          done = true;

      for(i = 0, len = this._queue.length; i < len; i++) {
        t = this._queue[i];
        if(!this._status[t.uniqueName]) {
          done = false;
          break;
        }
      }
      return done;
    }
  }, {
    /**
     * Creates a batch with tasks to call populated.
     * @param {Array} tasks Tasks or functions to add to the batch.
     * @return {AC.Batch} New batch.
     */
    create: function(tasks) {
      var batch = new AC.Batch(),
          i, len;

      for(i = 0, len = tasks.length; i < len; i++) {
        batch.add(tasks[i]);
      }

      return batch;
    }
  });

}());

/**
 * Namespace containing operations that work with the AC cart.
 * @type {Object}
 */
AC.cart = {
  /**
   * Fetches a JSON representation of the AC cart from the server.
   * @param {Function} [callback] [Optional] Callback function that will receive the response.
   */
  get: function(callback) {
    AC.api.jsonp({
      data: {},
      url: AC._getEndpoint('/cart'),
      callback: function(response) {
        callback && callback(response);
      }
    });
  },

  /**
   * Adds an item to the AC cart on the server.
   * @param {Object} item A JavaScript object representing the item to be added.
   * @param {Function} [callback] [Optional] Callback function that will receive the response.
   */
  add: function(item, callback) {
    if(AC._ameriCartId) {
      item.ameriCartId = AC._ameriCartId;
    }

    AC.api.jsonp({
      data: item,
      url: AC._getEndpoint('/cart/add'),
      callback: function(response) {
        callback && callback(response);
      }
    });
  },

  /**
   * Updates an item's information in the AC cart.
   * @param {Object} data A JavaScript object representing the item modifications. Must include the cartRowId.
   * @param {Function} [callback] [Optional] Callback function that will receive the response.
   */
  update: function(data, callback) {
    AC.api.jsonp({
      data: data,
      url: AC._getEndpoint('/cart/update'),
      callback: function(response) {
        callback && callback(response);
      }
    });
  },

  /**
   * Remove an item from the AC cart.
   * @param {number} id cartRowId of the item to be removed.
   * @param {Function} [callback] [Optional] Callback function that will receive the response.
   */
  remove: function(id, callback) {
    AC.api.jsonp({
      data: {
        id: id
      },
      url: AC._getEndpoint('/cart/remove'),
      callback: function(response) {
        callback && callback(response);
      }
    });
  },

  /**
   * Clears the AC cart.
   * @param {Function} [callback] [Optional] Callback function that will receive the response.
   */
  clear: function(callback) {
    AC.api.jsonp({
      data: {},
      url: AC._getEndpoint('/cart/clear'),
      callback: function(response) {
        callback && callback(response);
      }
    });
  }
};

/**
 * Namespace containing operations that work with AC's product information.
 * @type {Object}
 */
AC.product = {
  /**
   * Searches the products in the catalog and returns results that match the given terms.
   * @param {Object} data A JavaScript object representing the search information.
   * @param {Function} [callback] [Optional] Callback function that will receive the response.
   */
  search: function(data, callback) {
    AC.api.jsonp({
      data: data,
      url: AC._getEndpoint('/products/search'),
      callback: function(response) {
        callback && callback(response);
      }
    });
  }
};

/**
 * Namespace containing operations that work with the current customer.
 */
AC.customer = {
  /**
   * Fetches a JSON representation of current logged in customer from the server.
   * @param {Function} [callback] [Optional] Callback function that will receive the response.
   */
  get: function(callback) {
    AC.api.jsonp({
      data: {},
      url: AC._getEndpoint('/customer'),
      callback: function(response) {
        callback && callback(response);
      }
    });
  }
};

}(window));
