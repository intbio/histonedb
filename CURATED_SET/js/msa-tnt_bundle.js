require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports.msa = require("./msa");
module.exports.tree = require("./tree");

},{"./msa":2,"./tree":3}],2:[function(require,module,exports){
var _ = require("underscore");
var View = require("backbone-viewj");
var msa = require("msa");
var adapter;
var ignoredKeys = ["sel", "model"];

module.exports = adapter = View.extend({
  initialize: function(data) {
    // inject existing msa
    if (data.msa) {
      console.log("constructing msa");
      this.msa = data.msa;
    } else {
      var props = {
        seqs: data.model.models,
        el: this.el
      };
      // proxy other attributes to msa
      _.each(data, function(el, key) {
        if (!(key in props) && ignoredKeys.indexOf(key) < 0) {
          props[key] = el;
        }
      });
      // remove top collection
      _.each(props.seqs, function(e) {
        delete e.collection;
      });

      this.msa = new msa.msa(props);
    }

    // global selection
    var self = this;
    this.sel = data.sel;

    // bind events
    this.msa.g.onAll(function() {
      //console.log("msa", arguments);
    });
    var g = this.msa.g;
    g.on("row:click", function(e) {
      // listen to msa selection evts
      this.sel.user().set("ids", [e.seqId], {origin: "msa"});
    }.bind(this));
    this.sel.on("change:ids", function(model, c, attrs) {
      if(attrs.origin == "msa"){
        return;
      }
      // updates the msa selection
      var ids = self.sel.user().get("ids");
      var rows = ids.map(function(id) {
        return new self.msa.m.selection.rowsel({
          seqId: id
        });
      });
      self.msa.g.selcol.reset(rows);
    });
  },
  render: function() {
    this.msa.render();
  }
});

},{"backbone-viewj":15,"msa":"msa","underscore":154}],3:[function(require,module,exports){
var _ = require("underscore");
var View = require("backbone-viewj");
var tnt = require("tnt.tree");
var adapter;
d3 = require("d3");

module.exports = adapter = View.extend({
  initialize: function(data) {

    this.sel = data.sel;

    var treeData = nodes2Tree(data.model, data.model.at(0).get("id"));

    //====== Tree Stuff ======
    var tree = tnt();
    tree.data(treeData);

    /*
    var image_label = tnt.tree.label.img()
            .src(function(node) {
    if(node.is_leaf()) {
      var sp_name = node.node_name();
             return (pics[sp_name.substr(0,1).toUpperCase() + sp_name.substr(1)]);
              }
            })
            .width(function() {
              return 30;
            })
            .height(function() {
              return 40;
            });
    */

    var original_label = tnt.label.text()
          .text(function (node) {
            if(node.is_leaf()) {
              return node.node_name();
            }
          }).fontsize(14);

    var joined_label = tnt.label.composite()
          //.add_label(image_label)
          .add_label(original_label);

    tree.label(joined_label);

    //Node Stuff
    var node_size = 5;
    var selected_node_size = 5;
	var node_fill="black";
	var node_stroke="black";
	var selected_node_fill="steelblue";
	var expanded_node = tnt.node_display.circle()
	    .size(node_size)
	    .fill(node_fill)
	    .stroke(node_stroke);

	var collapsed_node = tnt.node_display.triangle()
	    .size(node_size)
	    .fill(node_fill)
	    .stroke(node_stroke)

	var selected_node = tnt.node_display.circle()
		.size(selected_node_size)
		.fill(selected_node_fill)
		.stroke(node_stroke)

	var node_display = tnt.node_display()
    .display(function(node){
      if(node.is_collapsed()) {
        collapsed_node.display().call(this, node);
      } else {
        expanded_node.display().call(this, node);
      }

      if(node.property('selected') === true) {
        selected_node.display().call(this, node);
      }
    });

	tree.node_display(node_display);
	//End Node Stuff

    tree.layout(tnt.layout.vertical().width(1500));//AKSh 500=>1500

    tree.on('click', function(node) {
      if(!node.is_leaf() || (node.n_hidden() > 0)) {
        node.toggle();
        tree.update();
      } else {
      	toggleClick(node);
      	tree.update();
      }
    });
    tree(this.el);
    this.tree = tree;

    function toggleClick(node) {
    	if(node.property('selected')) {
    		node.property('selected',false);
    	} else {
    		node.property('selected',true);
    	}
    }

    //====== End of Tree Stuff ======

    tnt.onAll(function(){
      //console.log("tree", arguments);
    });
    tnt.on("node:click", function(node){
      if(!node.is_leaf()  || (node.n_hidden() > 0)) {
        var nodeData = node.data();
        var b = nodeData.get("collapsed");
        if(b === undefined) b = false;
        toggleTree(nodeData, !b);
      } else {
      	var nodeData = node.data();
      	console.log(nodeData);
      	this.sel.user().set("ids", [nodeData.id]);
      }

    }.bind(this));

    var self = this;

    this.sel.user().on("change:ids", function(){

    	var ids = self.sel.user().get("ids");
        var root = tree.root();
        var nodes = root.get_all_leaves();

      _.each(nodes, function(d) {
        var nodeData = d.data();
        d.property('selected',false);
      	_.each(ids,function(id){
        		if(nodeData.id === id) {

        			d.property('selected',true);
        		}
        	})
      	});
    	tree.update();
    });
  },
  render: function() {}
});

function nodes2Tree(nodes, current) {
  var root = nodes.findWhere({
    id: current
  });
  if(root == undefined){
    root = nodes.findWhere({
      name: current
    });
  }
  root.name = root.get("name");
  var branchLength = root.get("branchLength");
  if (branchLength !== undefined && branchLength !== 0) {
    root.branch_length = branchLength;
  }
  var childs = root.get("childs");
  if (childs !== undefined && childs.length > 0) {
    root.children = _.map(root.get("childs"), function(el) {
      return nodes2Tree(nodes, el);
    });
  }
  return root;
}

function toggleTree(node, b ) {
//AKSh What we actually need to try to do here, is not to fire rerender for every collapsed node....
  var childs = node._children || node.children;
  if (childs !== undefined && childs.length > 0) {
    childs.forEach(function(child) {
      toggleTree(child, b, true);
    });
  }
//AKSh moved this block after children - ideally we should not trigger many redraw events for children, let's try to do
  if(!(node.get("virtual"))){ //Optimized by AKSh to trigger updates simultaneously for hidden and collapsed
    node.set({"hidden":b,"collapsed":b});
  }
  else{
  node.set({"collapsed":b});}
}

},{"backbone-viewj":15,"d3":46,"tnt.tree":142,"underscore":154}],4:[function(require,module,exports){
var model = require("./model");
var utils = require("./utils");
var _ = require("underscore");

var app = function(data) {
  if (!("tree" in data)) {
    console.warn("no newick file given");
    return;
  }
  if (!("seqs" in data)) {
    console.warn("no seqs given");
    return;
  }
  var seqs = data.seqs;
  // TODO: check equality
  // map seqs to fit
  //seqs.map(function(el) {
  //// parseInt ? 
  //if (isNaN(el.id)) {
  //el.id = el.name.split("|")[0];
  //}
  //});
    
  var nodes = convert2Nodes(data.tree);

  nodes = new model.nodes(nodes);
  nodes.each(function(el) {
    
    var node_id = el.attributes.id;
    
    /*
     * Each sequence can have multiple 'ids' (from different databases).
     * It should be okay to assume that these ids are unique within 
     * those databases, so we can just check the node id against all 
     * the values in the seq.ids array.
     * 
     * An alternative would be to allow this method to be specified by
     * the user (according to their own sequence format)
     */ 
    var matchSeq = function(seq) {
      var ids = _.values( seq.ids ) || [];
      return _.find( ids, function(id) { return id == node_id } );
    };

    var seq = _.find( seqs, matchSeq );
    
    if (seq !== undefined) {
      var attributes = seq.attributes || seq;
      console.log( "found matching seq for node", node_id, seq );
      _.each(attributes, function(val, key) {
        if ( key != 'id' ) { // don't overwrite the id of this node
          el.set(key, val);
        }
      });
    } else {
      console.log( "failed to find matching seq for node", node_id );
      el.set("hidden", true);
    }
  });
  return nodes;
};

function convert2Nodes(tree) {
  var childs = [];
  var nodes = [];
  var virtual = false;
  tree.attributes = tree.attributes || {}; // have empty attributes (just in case)
  var name = tree.name || tree.attributes.id;
  if (name === undefined || name.length === 0) {
    virtual = true;
  }
  var node = new model.node({
    id: name || randomID(),
    childs: childs,
    virtual: virtual,
    hidden: virtual,
    name: ""
  });
  nodes.push(node);
  if (tree.children !== undefined) {
    tree.children.forEach(function(el) {
      var childNode = convert2Nodes(el);
      childs.push(childNode[0].get("id"));
      nodes.push.apply(nodes, childNode);
    });
  }
  node.set("childs", childs);

  var branchLength = tree.branch_length || tree.attributes.branch_length;
  if (branchLength) {
    node.set("branchLength", branchLength);
  }
  return nodes;
}

function randomID() {
  return Math.random().toString(36).substr(2, 9);
}

module.exports = app;

},{"./model":5,"./utils":7,"underscore":154}],5:[function(require,module,exports){
var B = require("backbone-thin");
var FeatureCol = require("msa/lib/model").featurecol;
var _ = require("underscore");

var node = B.Model.extend({
  defaults: {
    seq: "",
    name: "",
    hidden: false,
    seqHeight: 1,
    branchLength: 0,
    id: "",
  },
  initialize: function() {
    this.set("childs", []);
    this.set("grey", []);
    this.set("features", new FeatureCol());
  }
});

var nodes = B.Collection.extend({
  model: node,
  constructor: function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    if (models) this.reset(models, _.extend({
      silent: true
    }, options));
    // call the initialize method AFTER init
    this.initialize.apply(this, arguments);
  },
  // logic moved to app.js
  //initialize: function(seqs, treeData) {},
});

module.exports.node = node;
module.exports.nodes = nodes;

},{"backbone-thin":13,"msa/lib/model":103,"underscore":154}],6:[function(require,module,exports){
var B = require("backbone-thin");
var selections = {};

var selection = B.Model.extend({
  defaults: {
    id: "",
    type: ""
  },
  initialize: function(){
    this.set("ids", []);
  },
});

var selections = B.Collection.extend({
  model: selection,
  hover: function() {
    return this.at(0);
  },
  user: function() {
    return this.at(1);
  },
  initialize: function(){
    this.add({type: "hover"});
    this.add({type: "user"});
    this.on("all", function(){
      console.log("sel", arguments);
    });
  }
});

module.exports = selections;

},{"backbone-thin":13}],7:[function(require,module,exports){
var q = require("kew");
var xhr = require("xhr");
var _ = require("underscore");

var utils = {};

utils._xhr = function(url) {
  var p = q.defer();
  xhr(url, function(err, resp, body) {
    if (err) {
      p.reject(err);
      return;
    }
    p.resolve(body);
  });
  return p.promise;
};

// a super amazing method to return a promise of multiple ajax requests
utils.xhr = function(arr) {
  // support only one url
  if (!Array.isArray(arr)) arr = [arr];
  return q.all(arr.map(utils._xhr));
};

// searches array for multiple attribute dictionary definitions (separately).
// returns the first match of a attribute dictionary 
utils.findMatching = function(arr, attrs) {
  var search, attr;
  for (var i = 0; i < attrs.length; i++) {
    attr = attrs[i];
    search = _.findWhere(arr, attr);
    if (typeof search !== "undefined") {
      break;
    }
  }
  return search;
};

module.exports = utils;

},{"kew":52,"underscore":154,"xhr":156}],8:[function(require,module,exports){
var _ = require('underscore');
var viewType = require("backbone-viewj");
var pluginator;

/**
 * Remove an element and provide a function that inserts it into its original position
 * @param element {Element} The element to be temporarily removed
 * @return {Function} A function that inserts the element into its original position
 **/
function removeToInsertLater(element) {
  var parentNode = element.parentNode;
  var nextSibling = element.nextSibling;
  parentNode.removeChild(element);
  return function() {
    if (nextSibling) {
      parentNode.insertBefore(element, nextSibling);
    } else {
      parentNode.appendChild(element);
    }
  };
}

var removeChilds = function (node) {
    var last;
    while (last = node.lastChild) node.removeChild(last);
};

module.exports = pluginator = viewType.extend({
  renderSubviews: function() {
    // it is faster to remove the entire element and replace it
    // -> however this will lead to lost id,class and style props
    var oldEl = this.el;

    // it might be that the element is not on the DOM yet
    var elOnDom = oldEl.parentNode != undefined;
    if(elOnDom){
      var insert = removeToInsertLater(oldEl)
    }
    removeChilds(oldEl);

    var frag = document.createDocumentFragment();
    var views = this._views();
    var viewsSorted = _.sortBy(views, function(el) {
      return el.ordering;
    });
    var view, node;
    for (var i = 0; i <  viewsSorted.length; i++) {
      view = viewsSorted[i];
      view.render();
      node = view.el;
      if (node != null) {
        frag.appendChild(node);
      }
    }

    oldEl.appendChild(frag);
    if(elOnDom){
      insert();
    }
    return oldEl;
  },
  addView: function(key, view) {
    var views = this._views();
    if (view == null) {
      throw "Invalid plugin. ";
    }
    if (view.ordering == null) {
      view.ordering = key;
    }
    return views[key] = view;
  },
  removeViews: function() {
    var el, key;
    var views = this._views();
    for (key in views) {
      el = views[key];
      el.undelegateEvents();
      el.unbind();
      if (el.removeViews != null) {
        el.removeViews();
      }
      el.remove();
    }
    return this.views = {};
  },
  removeView: function(key) {
    var views = this._views();
    views[key].remove();
    return delete views[key];
  },
  getView: function(key) {
    var views = this._views();
    return views[key];
  },
  remove: function() {
    this.removeViews();
    return viewType.prototype.remove.apply(this);
  },
  _views: function() {
    if (this.views == null) {
      this.views = {};
    }
    return this.views;
  }
});

},{"backbone-viewj":15,"underscore":154}],9:[function(require,module,exports){
/**
 * Standalone extraction of Backbone.Events, no external dependency required.
 * Degrades nicely when Backone/underscore are already available in the current
 * global context.
 *
 * Note that docs suggest to use underscore's `_.extend()` method to add Events
 * support to some given object. A `mixin()` method has been added to the Events
 * prototype to avoid using underscore for that sole purpose:
 *
 *     var myEventEmitter = BackboneEvents.mixin({});
 *
 * Or for a function constructor:
 *
 *     function MyConstructor(){}
 *     MyConstructor.prototype.foo = function(){}
 *     BackboneEvents.mixin(MyConstructor.prototype);
 *
 * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
 * (c) 2013 Nicolas Perriault
 */
/* global exports:true, define, module */
(function() {
  var root = this,
      nativeForEach = Array.prototype.forEach,
      hasOwnProperty = Object.prototype.hasOwnProperty,
      slice = Array.prototype.slice,
      idCounter = 0;

  // Returns a partial implementation matching the minimal API subset required
  // by Backbone.Events
  function miniscore() {
    return {
      keys: Object.keys || function (obj) {
        if (typeof obj !== "object" && typeof obj !== "function" || obj === null) {
          throw new TypeError("keys() called on a non-object");
        }
        var key, keys = [];
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            keys[keys.length] = key;
          }
        }
        return keys;
      },

      uniqueId: function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
      },

      has: function(obj, key) {
        return hasOwnProperty.call(obj, key);
      },

      each: function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            iterator.call(context, obj[i], i, obj);
          }
        } else {
          for (var key in obj) {
            if (this.has(obj, key)) {
              iterator.call(context, obj[key], key, obj);
            }
          }
        }
      },

      once: function(func) {
        var ran = false, memo;
        return function() {
          if (ran) return memo;
          ran = true;
          memo = func.apply(this, arguments);
          func = null;
          return memo;
        };
      }
    };
  }

  var _ = miniscore(), Events;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if (typeof name === 'object') callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Mixin utility
  Events.mixin = function(proto) {
    var exports = ['on', 'once', 'off', 'trigger', 'stopListening', 'listenTo',
                   'listenToOnce', 'bind', 'unbind'];
    _.each(exports, function(name) {
      proto[name] = this[name];
    }, this);
    return proto;
  };

  // Export Events as BackboneEvents depending on current context
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Events;
    }
    exports.BackboneEvents = Events;
  }else if (typeof define === "function"  && typeof define.amd == "object") {
    define(function() {
      return Events;
    });
  } else {
    root.BackboneEvents = Events;
  }
})(this);

},{}],10:[function(require,module,exports){
module.exports = require('./backbone-events-standalone');

},{"./backbone-events-standalone":9}],11:[function(require,module,exports){
(function (definition) {
  if (typeof exports === "object") {
    module.exports = definition();
  }
  else if (typeof define === 'function' && define.amd) {
    define(definition);
  }
  else {
    window.BackboneExtend = definition();
  }
})(function () {
  "use strict";
  
  // mini-underscore
  var _ = {
    has: function (obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    },
  
    extend: function(obj) {
      for (var i=1; i<arguments.length; ++i) {
        var source = arguments[i];
        if (source) {
          for (var prop in source) {
            obj[prop] = source[prop];
          }
        }
      }
      return obj;
    }
  };

  /// Following code is pasted from Backbone.js ///

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Expose the extend function
  return extend;
});

},{}],12:[function(require,module,exports){
//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

var Events = require("backbone-events-standalone");
var extend = require("backbone-extend-standalone");
var _ = require("underscore");
var Model = require("./model");

// Create local references to array methods we'll want to use later.
var array = [];
var slice = array.slice;

// Backbone.Collection
// -------------------

// If models tend to represent a single row of data, a Backbone Collection is
// more analogous to a table full of data ... or a small slice or page of that
// table, or a collection of rows that belong together for a particular reason
// -- all of the messages in this particular folder, all of the documents
// belonging to this particular author, and so on. Collections maintain
// indexes of their models, both in order, and for lookup by `id`.

// Create a new **Collection**, perhaps to contain a specific type of `model`.
// If a `comparator` is specified, the Collection will maintain
// its models in sort order, as they're added and removed.
var Collection = function(models, options) {
  options || (options = {});
  if (options.model) this.model = options.model;
  if (options.comparator !== void 0) this.comparator = options.comparator;
  this._reset();
  this.initialize.apply(this, arguments);
  if (models) this.reset(models, _.extend({silent: true}, options));
};

// Default options for `Collection#set`.
var setOptions = {add: true, remove: true, merge: true};
var addOptions = {add: true, remove: false};

// Define the Collection's inheritable methods.
_.extend(Collection.prototype, Events, {

  // The default model for a collection is just a **Backbone.Model**.
  // This should be overridden in most cases.
  model: Model,

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
  toJSON: function(options) {
    return this.map(function(model){ return model.toJSON(options); });
  },

    // Proxy `Backbone.sync` by default.
  sync: function() {
    return Backbone.sync.apply(this, arguments);
  },

    // Add a model, or list of models to the set.
  add: function(models, options) {
    return this.set(models, _.extend({merge: false}, options, addOptions));
  },

    // Remove a model, or a list of models from the set.
  remove: function(models, options) {
    var singular = !_.isArray(models);
    models = singular ? [models] : _.clone(models);
    options || (options = {});
    for (var i = 0, length = models.length; i < length; i++) {
      var model = models[i] = this.get(models[i]);
      if (!model) continue;
      var id = this.modelId(model.attributes);
      if (id != null) delete this._byId[id];
      delete this._byId[model.cid];
      var index = this.indexOf(model);
      this.models.splice(index, 1);
      this.length--;
      if (!options.silent) {
        options.index = index;
        model.trigger('remove', model, this, options);
      }
      this._removeReference(model, options);
    }
    return singular ? models[0] : models;
  },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
  set: function(models, options) {
    options = _.defaults({}, options, setOptions);
    if (options.parse) models = this.parse(models, options);
    var singular = !_.isArray(models);
    models = singular ? (models ? [models] : []) : models.slice();
    var id, model, attrs, existing, sort;
    var at = options.at;
    var sortable = this.comparator && (at == null) && options.sort !== false;
    var sortAttr = _.isString(this.comparator) ? this.comparator : null;
    var toAdd = [], toRemove = [], modelMap = {};
    var add = options.add, merge = options.merge, remove = options.remove;
    var order = !sortable && add && remove ? [] : false;

    // Turn bare objects into model references, and prevent invalid models
    // from being added.
    for (var i = 0, length = models.length; i < length; i++) {
      attrs = models[i];

      // If a duplicate is found, prevent it from being added and
      // optionally merge it into the existing model.
      if (existing = this.get(attrs)) {
        if (remove) modelMap[existing.cid] = true;
        if (merge && attrs !== existing) {
          attrs = this._isModel(attrs) ? attrs.attributes : attrs;
          if (options.parse) attrs = existing.parse(attrs, options);
          existing.set(attrs, options);
          if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
        }
        models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
      } else if (add) {
        model = models[i] = this._prepareModel(attrs, options);
        if (!model) continue;
        toAdd.push(model);
        this._addReference(model, options);
      }

      // Do not add multiple models with the same `id`.
      model = existing || model;
      if (!model) continue;
      id = this.modelId(model.attributes);
      if (order && (model.isNew() || !modelMap[id])) order.push(model);
      modelMap[id] = true;
    }

    // Remove nonexistent models if appropriate.
    if (remove) {
      for (var i = 0, length = this.length; i < length; i++) {
        if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
      }
      if (toRemove.length) this.remove(toRemove, options);
    }

    // See if sorting is needed, update `length` and splice in new models.
    if (toAdd.length || (order && order.length)) {
      if (sortable) sort = true;
      this.length += toAdd.length;
      if (at != null) {
        for (var i = 0, length = toAdd.length; i < length; i++) {
          this.models.splice(at + i, 0, toAdd[i]);
        }
      } else {
        if (order) this.models.length = 0;
        var orderedModels = order || toAdd;
        for (var i = 0, length = orderedModels.length; i < length; i++) {
          this.models.push(orderedModels[i]);
        }
      }
    }

    // Silently sort the collection if appropriate.
    if (sort) this.sort({silent: true});

    // Unless silenced, it's time to fire all appropriate add/sort events.
    if (!options.silent) {
      var addOpts = at != null ? _.clone(options) : options;
      for (var i = 0, length = toAdd.length; i < length; i++) {
        if (at != null) addOpts.index = at + i;
        (model = toAdd[i]).trigger('add', model, this, addOpts);
      }
      if (sort || (order && order.length)) this.trigger('sort', this, options);
    }

    // Return the added (or merged) model (or models).
    return singular ? models[0] : models;
  },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
  reset: function(models, options) {
    options || (options = {});
    for (var i = 0, length = this.models.length; i < length; i++) {
      this._removeReference(this.models[i], options);
    }
    options.previousModels = this.models;
    this._reset();
    models = this.add(models, _.extend({silent: true}, options));
    if (!options.silent) this.trigger('reset', this, options);
    return models;
  },

    // Add a model to the end of the collection.
  push: function(model, options) {
    return this.add(model, _.extend({at: this.length}, options));
  },

    // Remove a model from the end of the collection.
  pop: function(options) {
    var model = this.at(this.length - 1);
    this.remove(model, options);
    return model;
  },

    // Add a model to the beginning of the collection.
  unshift: function(model, options) {
    return this.add(model, _.extend({at: 0}, options));
  },

    // Remove a model from the beginning of the collection.
  shift: function(options) {
    var model = this.at(0);
    this.remove(model, options);
    return model;
  },

    // Slice out a sub-array of models from the collection.
  slice: function() {
    return slice.apply(this.models, arguments);
  },

    // Get a model from the set by id.
  get: function(obj) {
    if (obj == null) return void 0;
    var id = this.modelId(this._isModel(obj) ? obj.attributes : obj);
    return this._byId[obj] || this._byId[id] || this._byId[obj.cid];
  },

    // Get the model at the given index.
  at: function(index) {
    if (index < 0) index += this.length;
    return this.models[index];
  },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
  where: function(attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return this[first ? 'find' : 'filter'](function(model) {
      for (var key in attrs) {
        if (attrs[key] !== model.get(key)) return false;
      }
      return true;
    });
  },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
  findWhere: function(attrs) {
    return this.where(attrs, true);
  },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
  sort: function(options) {
    if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
    options || (options = {});

    // Run sort based on type of `comparator`.
    if (_.isString(this.comparator) || this.comparator.length === 1) {
      this.models = this.sortBy(this.comparator, this);
    } else {
      this.models.sort(_.bind(this.comparator, this));
    }

    if (!options.silent) this.trigger('sort', this, options);
    return this;
  },

    // Pluck an attribute from each model in the collection.
  pluck: function(attr) {
    return _.invoke(this.models, 'get', attr);
  },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
  fetch: function(options) {
    options = options ? _.clone(options) : {};
    if (options.parse === void 0) options.parse = true;
    var success = options.success;
    var collection = this;
    options.success = function(resp) {
      var method = options.reset ? 'reset' : 'set';
      collection[method](resp, options);
      if (success) success(collection, resp, options);
      collection.trigger('sync', collection, resp, options);
    };
    wrapError(this, options);
    return this.sync('read', this, options);
  },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
  create: function(model, options) {
    options = options ? _.clone(options) : {};
    if (!(model = this._prepareModel(model, options))) return false;
    if (!options.wait) this.add(model, options);
    var collection = this;
    var success = options.success;
    options.success = function(model, resp) {
      if (options.wait) collection.add(model, options);
      if (success) success(model, resp, options);
    };
    model.save(null, options);
    return model;
  },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
  parse: function(resp, options) {
    return resp;
  },

    // Create a new collection with an identical list of models as this one.
  clone: function() {
    return new this.constructor(this.models, {
      model: this.model,
      comparator: this.comparator
    });
  },

    // Define how to uniquely identify models in the collection.
  modelId: function (attrs) {
    return attrs[this.model.prototype.idAttribute || 'id'];
  },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
  _reset: function() {
    this.length = 0;
    this.models = [];
    this._byId  = {};
  },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
  _prepareModel: function(attrs, options) {
    if (this._isModel(attrs)) {
      if (!attrs.collection) attrs.collection = this;
      return attrs;
    }
    options = options ? _.clone(options) : {};
    options.collection = this;
    var model = new this.model(attrs, options);
    if (!model.validationError) return model;
    this.trigger('invalid', this, model.validationError, options);
    return false;
  },

    // Method for checking whether an object should be considered a model for
    // the purposes of adding to the collection.
  _isModel: function (model) {
    return model instanceof Model;
  },

    // Internal method to create a model's ties to a collection.
  _addReference: function(model, options) {
    this._byId[model.cid] = model;
    var id = this.modelId(model.attributes);
    if (id != null) this._byId[id] = model;
    model.on('all', this._onModelEvent, this);
  },

    // Internal method to sever a model's ties to a collection.
  _removeReference: function(model, options) {
    if (this === model.collection) delete model.collection;
    model.off('all', this._onModelEvent, this);
  },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
  _onModelEvent: function(event, model, collection, options) {
    if ((event === 'add' || event === 'remove') && collection !== this) return;
    if (event === 'destroy') this.remove(model, options);
    if (event === 'change') {
      var prevId = this.modelId(model.previousAttributes());
      var id = this.modelId(model.attributes);
      if (prevId !== id) {
        if (prevId != null) delete this._byId[prevId];
        if (id != null) this._byId[id] = model;
      }
    }
    this.trigger.apply(this, arguments);
  }

});

// Underscore methods that we want to implement on the Collection.
// 90% of the core usefulness of Backbone Collections is actually implemented
// right here:
var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample', 'partition'];

// Mix in each Underscore method as a proxy to `Collection#models`.
_.each(methods, function(method) {
  if (!_[method]) return;
  Collection.prototype[method] = function() {
    var args = slice.call(arguments);
    args.unshift(this.models);
    return _[method].apply(_, args);
  };
});

// Underscore methods that take a property name as an argument.
var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

// Use attributes instead of properties.
_.each(attributeMethods, function(method) {
  if (!_[method]) return;
  Collection.prototype[method] = function(value, context) {
    var iterator = _.isFunction(value) ? value : function(model) {
      return model.get(value);
    };
    return _[method](this.models, iterator, context);
  };
});

// setup inheritance
Collection.extend = extend;
module.exports = Collection;

},{"./model":14,"backbone-events-standalone":10,"backbone-extend-standalone":11,"underscore":154}],13:[function(require,module,exports){
module.exports.Model = require("./model");
module.exports.Collection = require("./collection");
module.exports.Events = require("backbone-events-standalone");
module.exports.extend = require("backbone-extend-standalone");

},{"./collection":12,"./model":14,"backbone-events-standalone":10,"backbone-extend-standalone":11}],14:[function(require,module,exports){
//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

var Events = require("backbone-events-standalone");
var extend = require("backbone-extend-standalone");
var _ = require("underscore");

// Backbone.Model
// --------------

// Backbone **Models** are the basic data object in the framework --
// frequently representing a row in a table in a database on your server.
// A discrete chunk of data and a bunch of useful, related methods for
// performing computations and transformations on that data.

// Create a new model with the specified attributes. A client id (`cid`)
// is automatically generated and assigned for you.
var Model = function(attributes, options) {
  var attrs = attributes || {};
  options || (options = {});
  this.cid = _.uniqueId('c');
  this.attributes = {};
  if (options.collection) this.collection = options.collection;
  if (options.parse) attrs = this.parse(attrs, options) || {};
  attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
  this.set(attrs, options);
  this.changed = {};
  this.initialize.apply(this, arguments);
};

// Attach all inheritable methods to the Model prototype.
_.extend(Model.prototype, Events, {

  // A hash of attributes whose current and previous value differ.
  changed: null,

  // The value returned during the last failed validation.
  validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
  idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
  initialize: function(){},

    // Return a copy of the model's `attributes` object.
  toJSON: function(options) {
    return _.clone(this.attributes);
  },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
  sync: function() {
    return Backbone.sync.apply(this, arguments);
  },

    // Get the value of an attribute.
  get: function(attr) {
    return this.attributes[attr];
  },

    // Get the HTML-escaped value of an attribute.
  escape: function(attr) {
    return _.escape(this.get(attr));
  },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
  has: function(attr) {
    return this.get(attr) != null;
  },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
  set: function(key, val, options) {

    var attr, attrs, unset, changes, silent, changing, prev, current;
    if (key == null) return this;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options || (options = {});

    // Run validation.
    if (!this._validate(attrs, options)) return false;

    // Extract attributes and options.
    unset           = options.unset;
    silent          = options.silent;
    changes         = [];
    changing        = this._changing;
    this._changing  = true;

    if (!changing) {
      this._previousAttributes = _.clone(this.attributes);
      this.changed = {};
    }
    current = this.attributes, prev = this._previousAttributes;

    // Check for changes of `id`.
    if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

    // For each `set` attribute, update or delete the current value.
    for (attr in attrs) {
      val = attrs[attr];
      if (!_.isEqual(current[attr], val)) changes.push(attr);
      if (!_.isEqual(prev[attr], val)) {
        this.changed[attr] = val;
      } else {
        delete this.changed[attr];
      }
      unset ? delete current[attr] : current[attr] = val;
    }

    // Trigger all relevant attribute changes.
    if (!silent) {
      if (changes.length) this._pending = options;
      for (var i = 0, length = changes.length; i < length; i++) {
        this.trigger('change:' + changes[i], this, current[changes[i]], options);
      }
    }

    // You might be wondering why there's a `while` loop here. Changes can
    // be recursively nested within `"change"` events.
    if (changing) return this;
    if (!silent) {
      while (this._pending) {
        options = this._pending;
        this._pending = false;
        this.trigger('change', this, options);
      }
    }
    this._pending = false;
    this._changing = false;
    return this;
  },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
  unset: function(attr, options) {
    return this.set(attr, void 0, _.extend({}, options, {unset: true}));
  },

    // Clear all attributes on the model, firing `"change"`.
  clear: function(options) {
    var attrs = {};
    for (var key in this.attributes) attrs[key] = void 0;
    return this.set(attrs, _.extend({}, options, {unset: true}));
  },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
  hasChanged: function(attr) {
    if (attr == null) return !_.isEmpty(this.changed);
    return _.has(this.changed, attr);
  },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
  changedAttributes: function(diff) {
    if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
    var val, changed = false;
    var old = this._changing ? this._previousAttributes : this.attributes;
    for (var attr in diff) {
      if (_.isEqual(old[attr], (val = diff[attr]))) continue;
      (changed || (changed = {}))[attr] = val;
    }
    return changed;
  },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
  previous: function(attr) {
    if (attr == null || !this._previousAttributes) return null;
    return this._previousAttributes[attr];
  },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
  previousAttributes: function() {
    return _.clone(this._previousAttributes);
  },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
  fetch: function(options) {
    options = options ? _.clone(options) : {};
    if (options.parse === void 0) options.parse = true;
    var model = this;
    var success = options.success;
    options.success = function(resp) {
      if (!model.set(model.parse(resp, options), options)) return false;
      if (success) success(model, resp, options);
      model.trigger('sync', model, resp, options);
    };
    wrapError(this, options);
    return this.sync('read', this, options);
  },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
  save: function(key, val, options) {
    var attrs, method, xhr, attributes = this.attributes;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (key == null || typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options = _.extend({validate: true}, options);

    // If we're not waiting and attributes exist, save acts as
    // `set(attr).save(null, opts)` with validation. Otherwise, check if
    // the model will be valid when the attributes, if any, are set.
    if (attrs && !options.wait) {
      if (!this.set(attrs, options)) return false;
    } else {
      if (!this._validate(attrs, options)) return false;
    }

    // Set temporary attributes if `{wait: true}`.
    if (attrs && options.wait) {
      this.attributes = _.extend({}, attributes, attrs);
    }

    // After a successful server-side save, the client is (optionally)
    // updated with the server-side state.
    if (options.parse === void 0) options.parse = true;
    var model = this;
    var success = options.success;
    options.success = function(resp) {
      // Ensure attributes are restored during synchronous saves.
      model.attributes = attributes;
      var serverAttrs = model.parse(resp, options);
      if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
      if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
        return false;
      }
      if (success) success(model, resp, options);
      model.trigger('sync', model, resp, options);
    };
    wrapError(this, options);

    method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
    if (method === 'patch' && !options.attrs) options.attrs = attrs;
    xhr = this.sync(method, this, options);

    // Restore attributes.
    if (attrs && options.wait) this.attributes = attributes;

    return xhr;
  },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
  destroy: function(options) {
    options = options ? _.clone(options) : {};
    var model = this;
    var success = options.success;

    var destroy = function() {
      model.stopListening();
      model.trigger('destroy', model, model.collection, options);
    };

    options.success = function(resp) {
      if (options.wait || model.isNew()) destroy();
      if (success) success(model, resp, options);
      if (!model.isNew()) model.trigger('sync', model, resp, options);
    };

    if (this.isNew()) {
      options.success();
      return false;
    }
    wrapError(this, options);

    var xhr = this.sync('delete', this, options);
    if (!options.wait) destroy();
    return xhr;
  },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
  url: function() {
    var base =
      _.result(this, 'urlRoot') ||
      _.result(this.collection, 'url') ||
      urlError();
    if (this.isNew()) return base;
    return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
  },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
  parse: function(resp, options) {
    return resp;
  },

    // Create a new model with identical attributes to this one.
  clone: function() {
    return new this.constructor(this.attributes);
  },

    // A model is new if it has never been saved to the server, and lacks an id.
  isNew: function() {
    return !this.has(this.idAttribute);
  },

    // Check if the model is currently in a valid state.
  isValid: function(options) {
    return this._validate({}, _.extend(options || {}, { validate: true }));
  },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
  _validate: function(attrs, options) {
    if (!options.validate || !this.validate) return true;
    attrs = _.extend({}, this.attributes, attrs);
    var error = this.validationError = this.validate(attrs, options) || null;
    if (!error) return true;
    this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
    return false;
  }

});

// Underscore methods that we want to implement on the Model.
var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'chain', 'isEmpty'];

// Mix in each Underscore method as a proxy to `Model#attributes`.
_.each(modelMethods, function(method) {
  if (!_[method]) return;
  Model.prototype[method] = function() {
    var args = slice.call(arguments);
    args.unshift(this.attributes);
    return _[method].apply(_, args);
  };
});

// setup inheritance
Model.extend = extend;
module.exports = Model;

},{"backbone-events-standalone":10,"backbone-extend-standalone":11,"underscore":154}],15:[function(require,module,exports){
// this is the extracted view model from backbone
// note that we inject jbone as jquery replacment
// (and underscore directly)
//
// Views are almost more convention than they are actual code.
//  MVC pattern
// Backbone.View
// -------------

var _ = require("underscore");
var Events = require("backbone-events-standalone");
var extend = require("backbone-extend-standalone");
var $ = require('jbone');

// Backbone Views are almost more convention than they are actual code. A View
// is simply a JavaScript object that represents a logical chunk of UI in the
// DOM. This might be a single item, an entire list, a sidebar or panel, or
// even the surrounding frame which wraps your whole app. Defining a chunk of
// UI as a **View** allows you to define your DOM events declaratively, without
// having to worry about render order ... and makes it easy for the view to
// react to specific changes in the state of your models.

// Creating a Backbone.View creates its initial element outside of the DOM,
// if an existing element is not provided...
var View =  function(options) {
  this.cid = _.uniqueId('view');
  options || (options = {});
  _.extend(this, _.pick(options, viewOptions));
  this._ensureElement();
  this.initialize.apply(this, arguments);
};

// Cached regex to split keys for `delegate`.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

// List of view options to be merged as properties.
var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

// Set up all inheritable **Backbone.View** properties and methods.
_.extend(View.prototype, Events, {

  // The default `tagName` of a View's element is `"div"`.
  tagName: 'div',

  // jQuery delegate for element lookup, scoped to DOM elements within the
  // current view. This should be preferred to global lookups where possible.
  $: function(selector) {
    return this.$el.find(selector);
  },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
  initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
  render: function() {
    return this;
  },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
  remove: function() {
    this._removeElement();
    this.stopListening();
    return this;
  },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
  _removeElement: function() {
    this.$el.remove();
  },

    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new element.
  setElement: function(element) {
    this.undelegateEvents();
    this._setElement(element);
    this.delegateEvents();
    return this;
  },

    // Creates the `this.el` and `this.$el` references for this view using the
    // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
    // context or an element. Subclasses can override this to utilize an
    // alternative DOM manipulation API and are only required to set the
    // `this.el` property.
  _setElement: function(el) {
    this.$el = el instanceof $ ? el : $(el);
    this.el = this.$el[0];
  },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
  delegateEvents: function(events) {
    if (!(events || (events = _.result(this, 'events')))) return this;
    this.undelegateEvents();
    for (var key in events) {
      var method = events[key];
      if (!_.isFunction(method)) method = this[events[key]];
      if (!method) continue;
      var match = key.match(delegateEventSplitter);
      this.delegate(match[1], match[2], _.bind(method, this));
    }
    return this;
  },

    // Add a single event listener to the view's element (or a child element
    // using `selector`). This only works for delegate-able events: not `focus`,
    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
  delegate: function(eventName, selector, listener) {
    this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
  },

    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
  undelegateEvents: function() {
    if (this.$el) this.$el.off('.delegateEvents' + this.cid);
    return this;
  },

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
  undelegate: function(eventName, selector, listener) {
    this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
  },

    // Produces a DOM element to be assigned to your view. Exposed for
    // subclasses using an alternative DOM manipulation API.
  _createElement: function(tagName) {
    return document.createElement(tagName);
  },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
  _ensureElement: function() {
    if (!this.el) {
      var attrs = _.extend({}, _.result(this, 'attributes'));
      if (this.id) attrs.id = _.result(this, 'id');
      if (this.className) attrs['class'] = _.result(this, 'className');
      this.setElement(this._createElement(_.result(this, 'tagName')));
      this._setAttributes(attrs);
    } else {
      this.setElement(_.result(this, 'el'));
    }
  },

    // Set attributes from a hash on this view's element.  Exposed for
    // subclasses using an alternative DOM manipulation API.
  _setAttributes: function(attributes) {
    this.$el.attr(attributes);
  }

});

// setup inheritance
View.extend = extend;
module.exports = View;

},{"backbone-events-standalone":10,"backbone-extend-standalone":11,"jbone":51,"underscore":154}],16:[function(require,module,exports){
var events = require("backbone-events-standalone");

events.onAll = function(callback,context){
  this.on("all", callback,context);
  return this;
};

// Mixin utility
events.oldMixin = events.mixin;
events.mixin = function(proto) {
  events.oldMixin(proto);
  // add custom onAll
  var exports = ['onAll'];
  for(var i=0; i < exports.length;i++){
    var name = exports[i];
    proto[name] = this[name];
  }
  return proto;
};

module.exports = events;

},{"backbone-events-standalone":10}],17:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
var Clustal, GenericReader, st;

GenericReader = require("biojs-io-parser");

st = require("msa-seqtools");

module.exports = Clustal = {
  parse: function(text) {
    var blockstate, cSeq, k, keys, label, line, lines, match, obj, regex, seqCounter, seqs, sequence;
    seqs = [];
    if (Object.prototype.toString.call(text) === '[object Array]') {
      lines = text;
    } else {
      lines = text.split("\n");
    }
    if (lines[0].slice(0, 6) === !"CLUSTAL") {
      throw new Error("Invalid CLUSTAL Header");
    }
    k = 0;
    blockstate = 1;
    seqCounter = 0;
    while (k < lines.length) {
      k++;
      line = lines[k];
      if ((line == null) || line.length === 0) {
        blockstate = 1;
        continue;
      }
      if (line.trim().length === 0) {
        blockstate = 1;
        continue;
      } else {
        if (st.contains(line, "*")) {
          continue;
        }
        if (blockstate === 1) {
          seqCounter = 0;
          blockstate = 0;
        }
        regex = /^(?:\s*)(\S+)(?:\s+)(\S+)(?:\s*)(\d*)(?:\s*|$)/g;
        match = regex.exec(line);
        if (match != null) {
          label = match[1];
          sequence = match[2];
          if (seqCounter >= seqs.length) {
            obj = st.getMeta(label);
            label = obj.name;
            cSeq = new st.model(sequence, label, seqCounter);
            cSeq.ids = obj.ids || {};
            cSeq.details = obj.details || {};
            keys = Object.keys(cSeq.ids);
            if (keys.length > 0) {
              cSeq.id = cSeq.ids[keys[0]];
            }
            seqs.push(cSeq);
          } else {
            seqs[seqCounter].seq += sequence;
          }
          seqCounter++;
        } else {
          console.log("parse error", line);
        }
      }
    }
    return seqs;
  }
};

GenericReader.mixin(Clustal);

},{"biojs-io-parser":25,"msa-seqtools":74}],18:[function(require,module,exports){
// Generated by CoffeeScript 1.9.0
module.exports = function(out) {
  var i, key, _i, _j, _len, _ref, _ref1;
  out = out || {};
  for (i = _i = 0, _ref = arguments.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    if (!arguments[i]) {
      continue;
    }
    _ref1 = arguments[i];
    for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
      key = _ref1[_j];
      if (arguments[i].hasOwnProperty(key)) {
        out[key] = arguments[i][key];
      }
    }
  }
  return out;
};

},{}],19:[function(require,module,exports){
// Generated by CoffeeScript 1.9.0
var Fasta, extend, st;

st = require("msa-seqtools");

extend = require("./extend");

module.exports = Fasta = {
  getMeta: st.getMeta,
  extend: function(metaParser) {
    var customFasta;
    customFasta = extend(Fasta);
    Fasta.getMeta = metaParser;
    return customFasta;
  },
  parse: function(text) {
    var currentSeq, getMeta, id, label, line, obj, seqs, _i, _len;
    seqs = [];
    if (!text || text.length === 0) {
      return [];
    }
    if (Object.prototype.toString.call(text) !== '[object Array]') {
      text = text.split("\n");
    }
    getMeta = Fasta.getMeta;
    for (_i = 0, _len = text.length; _i < _len; _i++) {
      line = text[_i];
      if (line[0] === ">" || line[0] === ";") {
        label = line.slice(1);
        obj = getMeta(label);
        label = obj.name;
        id = obj.id || seqs.length;
        currentSeq = new st.model("", obj.name, id);
        currentSeq.ids = obj.ids || {};
        currentSeq.details = obj.details || {};
        seqs.push(currentSeq);
      } else {
        currentSeq.seq += line;
      }
    }
    return seqs;
  },
  write: function(seqs, access) {
    var seq, text, _i, _len;
    text = "";
    for (_i = 0, _len = seqs.length; _i < _len; _i++) {
      seq = seqs[_i];
      if (access != null) {
        seq = access(seq);
      }
      text += ">" + seq.name + "\n";
      text += (st.splitNChars(seq.seq, 80)).join("\n");
      text += "\n";
    }
    return text;
  }
};

},{"./extend":18,"msa-seqtools":74}],20:[function(require,module,exports){
/*
 * biojs-io-gff
 * https://github.com/greenify/biojs-io-gff
 *
 * Copyright (c) 2014 greenify
 * Licensed under the Apache 2 license.
 */

var parser = require("biojs-io-parser");

var gff = function() {};
parser.mixin(gff);

module.exports = gff;

var utils = require("./utils");
var jalview = require("./jalview");

/**
 * Method responsible to parse GFF
 * @see https://www.sanger.ac.uk/resources/software/gff/spec.html#t_2
 *
 * @example
 *
 *     biojsiogff.parse('SEQ1  EMBL  atg  103  105  .  +  0');
 *
 * @method parse
 * @param {String} file GFF file
 * @return {String} Returns JSON representation
 */

gff.parseLines = function(file) {
  var lines = file.split("\n");
  var config = {};
  var arr = [];
  config.type = gff._guessType(lines);
  var offset = 0;
  if (config.type === "jalview") {
    var ret = jalview.readHeader(lines);
    //console.log(ret);
    offset = ret.offset;
    config.colors = ret.colors;
    arr = ret.features;
  }
  for (var i = offset; i < lines.length; i++) {
    // ignore comments for now
    var line = lines[i];
    if (line.length === 0 || line[0] === "#")
      continue;

    line = gff.parseLine(line);
    if (line !== undefined)
      arr.push(line);
  }
  return {
    features: arr,
    config: config
  };
};

gff._guessType = function(line) {
  if (line[0].substring(0, 15) === "##gff-version 3") {
    return "gff3";
  } else if (line[0].indexOf("#") < 0 && line[0].split("\t").length === 2) {
    // no comments and two columns. let's hope this is from jalview
    return "jalview";
  }
  // unable to read file header. lets hope this is gff3
  return "gff3";
};

/**
 * parses GFF and returns a dictionary of all seqs with their features
 * @method parseSeqs
 * @param {String} file GFF file
 * @return {String} Returns dictionary of sequences with an array of their features
 */
gff.parseSeqs = gff.parse = function(file) {
  var obj = gff.parseLines (file);
  var seqs = {};
  obj.features.forEach(function(entry) {
    var key = entry.seqname;
    if (seqs[key] === undefined) seqs[key] = [];
    delete entry.seqname;
    seqs[key].push(entry);
  });
  delete obj.features;
  obj.seqs = seqs;
  return obj;
};

/*
 * parses one GFF line and returns it
 */
gff.parseLine = function(line) {
  var tLine = {};

  var columns = line.split(/\s+/);
  // ignore empty lines
  if (columns.length === 1)
    return;

  tLine.seqname = columns[0];
  tLine.source = columns[1];
  tLine.feature = columns[2];
  tLine.start = parseInt(columns[3]);
  tLine.end = parseInt(columns[4]);
  tLine.score = columns[5]; // only DNA,RNA
  tLine.strand = columns[6]; // only DNA,RNA
  tLine.frame = columns[7]; // only DNA,RNA
  var attr = columns.slice(8).join(" "); // plain text comments

  // remove undefined (dot)
  Object.keys(tLine).forEach(function(key) {
    if (tLine[key] === ".") {
      tLine[key] = undefined;
    }
  });

  // parse optional parameters
  if (tLine.score) {
    tLine.score = parseFloat(tLine.score);
  }
  if (tLine.frame) {
    tLine.frame = parseInt(tLine.frame);
  }

  tLine.attributes = utils.extractKeys(attr);
  return tLine;
};

gff.exportLine = function(line) {
  var attrs = Object.keys(line.attributes).map(function(key) {
    return key + "=" + line.attributes[key];
  }).join(";");
  var cells = [line.seqname, line.source, line.feature, line.start, line.end, line.score,
    line.strand, line.frame, attrs
  ];
  cells = cells.map(function(e) {
    if (e === undefined) {
      return ".";
    }
    return e;
  });
  return cells.join("\t");
};

gff.exportLines = function(lines) {
  return "##gff-version 3\n" + lines.map(gff.exportLine).join("\n");
};

gff.exportSeqs = gff.export = function(seqs) {
  var lines = [];
  var pLine = function(e) {
    e.seqname = key;
    lines.push(e);
  };

  for (var key in seqs) {
    seqs[key].forEach(pLine);
  }
  return gff.exportLines(lines);
};

},{"./jalview":21,"./utils":22,"biojs-io-parser":25}],21:[function(require,module,exports){
var jalview = {};
module.exports = jalview;
var utils = require("./utils");

// http://www.jalview.org/help/html/features/featuresFormat.html
jalview.readHeader = function(lines) {
  var colors = {};
  var i = 0;
  var features = [];
  var currentGroup;

  for (; i < lines.length; i++) {
    var line = lines[i];
    if (line.indexOf("#") >= 0) {
      // no comments allowed -> stop
      break;
    }
    var columns = line.split(/\t/);
    var firstCell = columns[0].trim();
    if (firstCell === "GFF") {
      // this symbolizes the end 
      break;
    } else if (columns.length === 2) {
      if (firstCell === "startgroup") {
        currentGroup = columns[1].trim();
      } else if (firstCell === "endgroup") {
        currentGroup = "";
        continue;
      } else {
        // parse color
        colors[columns[0]] = jalview.parseColor(columns[1]);
      }
    } else if(columns.length >= 5){
      var arr = jalview.parseLine(columns);
      if (currentGroup) {
        arr.attributes.Parent = currentGroup;
      }
      features.push(arr);
    }
  }

  return {
    offset: i,
    colors: colors,
    features: features
  };
};

jalview.parseColor = function(cell) {
  if (cell.indexOf(",") >= 0) {
    // rgb code
    return utils.rgbToHex(cell.split(",").map(function(el) {
      return parseInt(el);
    }));
  }
  // color names with length == 6
  // 'bisque,maroon,orange,orchid,purple,salmon,sienna,tomato,violet,yellow'
  if (cell.length === 6 && parseInt(cell.charAt(0), 16) <= 16 && cell !== 'bisque') {
    // hex code
    return "#" + cell;
  }
  // color name
  return cell;
};


jalview.parseLine = function(columns) {
  var obj = {
    attributes: {}
  };
  obj.attributes.Name = columns[0].trim(); //desc
  obj.seqname = columns[1].trim(); // id
  obj.start = parseInt(columns[3]);
  obj.end = parseInt(columns[4]);
  obj.feature = columns[5].trim();
  if (obj.seqname === "ID_NOT_SPECIFIED") {
    obj.seqname = columns[2].trim(); // alternative id
  }
  return obj;
};

},{"./utils":22}],22:[function(require,module,exports){
var utils = {};
module.exports = utils;

utils.extractKeys = function extractKeys(attr) {
  // extract key-value definitions
  var attributes = {};
  var attrArr = attr.split(";");
  attrArr.forEach(function(el) {
    var keyArr, key, val;
    if (el.indexOf("=") > 0) {
      keyArr = el.split("=");
      key = keyArr[0];
      val = keyArr[1];
      attributes[key] = val;
    } else if (el.indexOf(" ") > 0) {
      keyArr = el.split(" ");
      key = keyArr[0];
      val = keyArr[1].replace(/"/g, '');
      attributes[key] = val;
    }
  });
  return attributes;
};

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

utils.rgbToHex = function(r, g, b) {
  if(r.length === 3){
    return utils.rgbToHex(r[0],r[1], r[2]);
  }
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

},{}],23:[function(require,module,exports){
/**
 * Extended Newick format parser in JavaScript.
 *
 * Copyright (c) Miguel Pignatelli 2014 based on Jason Davies  
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Example tree (from http://en.wikipedia.org/wiki/Newick_format):
 *
 * +--0.1--A
 * F-----0.2-----B            +-------0.3----C
 * +------------------0.5-----E
 *                            +---------0.4------D
 *
 * Newick format:
 * (A:0.1,B:0.2,(C:0.3,D:0.4)E:0.5)F;
 *
 * Converted to JSON:
 * {
 *   name: "F",
 *   children: [
 *     {name: "A", branch_length: 0.1},
 *     {name: "B", branch_length: 0.2},
 *     {
 *       name: "E",
 *       length: 0.5,
 *       children: [
 *         {name: "C", branch_length: 0.3},
 *         {name: "D", branch_length: 0.4}
 *       ]
 *     }
 *   ]
 * }
 *
 * Converted to JSON, but with no names or lengths:
 * {
 *   children: [
 *     {}, {}, {
 *       children: [{}, {}]
 *     }
 *   ]
 * }
 */

module.exports = parse_nhx = function(s) {
	var ancestors = [];
	var tree = {};
	// var tokens = s.split(/\s*(;|\(|\)|,|:)\s*/);
	//[&&NHX:D=N:G=ENSG00000139618:T=9606]
	var tokens = s.split( /\s*(;|\(|\)|\[|\]|,|:|=)\s*/ );
	for (var i=0; i<tokens.length; i++) {
		var token = tokens[i];
		switch (token) {
			case '(': // new children
				var subtree = {};
				tree.children = [subtree];
				ancestors.push(tree);
				tree = subtree;
				break;
			case ',': // another branch
				var subtree = {};
				ancestors[ancestors.length-1].children.push(subtree);
				tree = subtree;
				break;
			case ')': // optional name next
				tree = ancestors.pop();
				break;
			case ':': // optional length next
				break;
			default:
				var x = tokens[i-1];
				// var x2 = tokens[i-2];
				if (x == ')' || x == '(' || x == ',') {
					tree.name = token;
				} 
				else if (x == ':') {
					var test_type = typeof token;
					if(!isNaN(token)){
						tree.branch_length = parseFloat(token);
					}
					// tree.length = parseFloat(token);
				}
				else if (x == '='){
					var x2 = tokens[i-2];
					switch(x2){
						case 'D':
							tree.duplication = token; 
							break; 
						case 'G':
							tree.gene_id = token;
							break;
						case 'T':
							tree.taxon_id = token;
							break;

					}
				}
				else {
					var test;

				}
		}
	}
	return tree;
};


},{}],24:[function(require,module,exports){
/**
 * Newick format parser in JavaScript.
 *
 * Copyright (c) edited by Miguel Pignatelli 2014, based on Jason Davies 2010.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Example tree (from http://en.wikipedia.org/wiki/Newick_format):
 *
 * +--0.1--A
 * F-----0.2-----B            +-------0.3----C
 * +------------------0.5-----E
 *                            +---------0.4------D
 *
 * Newick format:
 * (A:0.1,B:0.2,(C:0.3,D:0.4)E:0.5)F;
 *
 * Converted to JSON:
 * {
 *   name: "F",
 *   children: [
 *     {name: "A", branch_length: 0.1},
 *     {name: "B", branch_length: 0.2},
 *     {
 *       name: "E",
 *       length: 0.5,
 *       children: [
 *         {name: "C", branch_length: 0.3},
 *         {name: "D", branch_length: 0.4}
 *       ]
 *     }
 *   ]
 * }
 *
 * Converted to JSON, but with no names or lengths:
 * {
 *   children: [
 *     {}, {}, {
 *       children: [{}, {}]
 *     }
 *   ]
 * }
 */



module.exports.parse_newick = function (s) {
	var ancestors = [];
	var tree = {};
	var tokens = s.split(/\s*(;|\(|\)|,|:)\s*/);
	for (var i=0; i<tokens.length; i++) {
		var token = tokens[i];
		switch (token) {
			case '(': // new children
				var subtree = {};
				tree.children = [subtree];
				ancestors.push(tree);
				tree = subtree;
				break;
			case ',': // another branch
				var subtree = {};
				ancestors[ancestors.length-1].children.push(subtree);
				tree = subtree;
				break;
			case ')': // optional name next
				tree = ancestors.pop();
				break;
			case ':': // optional length next
				break;
			default:
				var x = tokens[i-1];
				if (x == ')' || x == '(' || x == ',') {
					tree.name = token;
				} else if (x == ':') {
					tree.branch_length = parseFloat(token);
				}
		}
	}
	return tree;
};

module.exports.parse_json = function (json) {
	function nested(nest){
		var subtree = "";

		if(nest.hasOwnProperty('children')){
			var children = [];
			nest.children.forEach(function(child){
				var subsubtree = nested(child);
				children.push(subsubtree);
			});
      var substring = children.join();
      if(nest.hasOwnProperty('name')){
        subtree = "("+substring+")" + nest.name;
      }
      if(nest.hasOwnProperty('branch_length')){
        subtree = subtree + ":"+nest.branch_length;
      }
		}
		else{
      var leaf = "";
      if(nest.hasOwnProperty('name')){
        leaf = nest.name;
      }
      if(nest.hasOwnProperty('branch_length')){
        leaf = leaf + ":"+nest.branch_length;
      }
      subtree = subtree + leaf;
		}
		return subtree;
	}
	return nested(json) +";";
};

},{}],25:[function(require,module,exports){
var GenericReader;

var xhr = require('request');
var vow = require('vow');

module.exports = GenericReader = (function() {
  function GenericReader() {}

  // returns a promise if callback is undefined
  GenericReader.read = function(url, callback) {
    var onret;
    onret = (function(_this) {
      return function(err, response, text) {
        return GenericReader._onRetrieval(err, text, callback, _this);
      };
    })(this);

    if(typeof callback === "undefined"){
      var prom = vow.defer();
      callback = function(err, res){
        if(err){
          prom.reject(err);
        }else{
          prom.resolve(res);
        }
      };
      xhr(url, onret);
      return prom.promise();
    }else{
      return xhr(url, onret);
    }
  };

  GenericReader._onRetrieval = function(err, text, callback, _this) {
    var rText;
    if(typeof err !== "undefined"){
      rText = _this.parse(text);
    }
    return callback.call(_this, err, rText);
  };

  // provide a convenient shortcut to inherit
  GenericReader.extend = function(obj, statics){
    return extend(GenericReader, obj, statics); 
  };
  // Mixin utility
  GenericReader.mixin = function(proto) {
    var exports = ['read'];
    if(typeof proto !== "object"){
      proto = proto.prototype;
    }
    exports.forEach(function(name) {
      proto[name] = GenericReader[name];
    }, this);
    return proto;
  };

  return GenericReader;

})();

},{"request":156,"vow":155}],26:[function(require,module,exports){
module.exports.seq = require("./seq");

},{"./seq":27}],27:[function(require,module,exports){
module.exports = function(seq, name, id) {
    this.seq = seq;
    this.name = name;
    this.id = id;
    this.meta = {};
};

},{}],28:[function(require,module,exports){
// this is a light-weight build without the scrolling module
module.exports = require("./src/index.js");

},{"./src/index.js":34}],29:[function(require,module,exports){
module.exports = {
    render_x_axis_label: function () {
      var label = "Model Position";
      if (this.display_ali_map) {
        label = "Alignment Column";
      }
      this.called_on.find('.logo_xaxis').remove();
      this.called_on.prepend('<div class="logo_xaxis" class="centered" style="margin-left:40px"><p class="xaxis_text" style="width:10em;margin:1em auto">' + label + '</p></div>');

    },
    render_y_axis_label: function () {
      //attach a canvas for the y-axis
      this.dom_element.parent().before('<canvas class="logo_yaxis" height="'+this.options.height+'" width="55"></canvas>');
      var canvas = this.called_on.find('.logo_yaxis'),
      top_pix_height = 0,
      bottom_pix_height = 0,
      top_height = Math.abs(this.data.max_height),
      bottom_height = (isNaN(this.data.min_height_obs)) ? 0 : parseInt(this.data.min_height_obs, 10),
      context = null,
      axis_label = "Information Content (bits)";

      context = canvas[0].getContext('2d');
      //draw min/max tick marks
      context.beginPath();
      context.moveTo(55, 1);
      context.lineTo(40, 1);

      context.moveTo(55, this.info_content_height);
      context.lineTo(40, this.info_content_height);


      context.moveTo(55, (this.info_content_height / 2));
      context.lineTo(40, (this.info_content_height / 2));
      context.lineWidth = 1;
      context.strokeStyle = "#666666";
      context.stroke();

      //draw the label text
      context.fillStyle = "#666666";
      context.textAlign = "right";
      context.font = "bold 10px Arial";

      // draw the max label
      context.textBaseline = "top";
      context.fillText(parseFloat(this.data.max_height).toFixed(1), 38, 0);
      context.textBaseline = "middle";

      // draw the midpoint labels
      context.fillText(parseFloat(this.data.max_height / 2).toFixed(1), 38, (this.info_content_height / 2));
      // draw the min label
      context.fillText('0', 38, this.info_content_height);

      // draw the axis label
      if (this.data.height_calc === 'score') {
        axis_label = "Score (bits)";
      }

      context.save();
      context.translate(5, this.height / 2 - 20);
      context.rotate(-Math.PI / 2);
      context.textAlign = "center";
      context.font = "normal 12px Arial";
      context.fillText(axis_label, 1, 0);
      context.restore();

      // draw the insert row labels
      context.fillText('occupancy', 55, this.info_content_height + 7);
      if (this.show_inserts) {
        context.fillText('ins. prob.', 50, 280);
        context.fillText('ins. len.', 46, 296);
      }
    }
}; 

},{}],30:[function(require,module,exports){
var canv_support = null;

module.exports = function canvasSupport() {
  if (!canv_support) {
    var elem = document.createElement('canvas');
    canv_support = !!(elem.getContext && elem.getContext('2d'));
  }
  return canv_support;
}

},{}],31:[function(require,module,exports){
module.exports = {
  'A': '#FF9966',
  'C': '#009999',
  'D': '#FF0000',
  'E': '#CC0033',
  'F': '#00FF00',
  'G': '#f2f20c',
  'H': '#660033',
  'I': '#CC9933',
  'K': '#663300',
  'L': '#FF9933',
  'M': '#CC99CC',
  'N': '#336666',
  'P': '#0099FF',
  'Q': '#6666CC',
  'R': '#990000',
  'S': '#0000FF',
  'T': '#00FFFF',
  'V': '#FFCC33',
  'W': '#66CC66',
  'Y': '#006600'
};

},{}],32:[function(require,module,exports){
module.exports = {
    'A': '#cbf751',
    'C': '#5ec0cc',
    'G': '#ffdf59',
    'T': '#b51f16',
    'U': '#b51f16'
  };

},{}],33:[function(require,module,exports){
var $ = require("jbone");

module.exports = function($el,logo, logo_graphic){

  $el.find('.logo_settings_switch, .logo_settings .close').on('click', function (e) {
    e.preventDefault();
    $('.logo_settings').toggle();
  });

  $el.find('.logo_reset').on('click', function (e) {
    e.preventDefault();
    logo.changeZoom({'target': logo.default_zoom});
  });

  $el.find('.logo_change').on('click', function (e) {
    e.preventDefault();
  });

  $el.find('.logo_zoomin').on('click', function (e) {
    e.preventDefault();
    logo.changeZoom({'distance': 0.1, 'direction': '+'});
  });

  $el.find('.logo_zoomout').on('click', function (e) {
    e.preventDefault();
    logo.changeZoom({'distance': 0.1, 'direction': '-'});
  });

  $el.find('.logo_scale').on('change', function (e) {
    logo.toggleScale(this.value);
  });

  $el.find('.logo_color').on('change', function (e) {
    logo.toggleColorscheme(this.value);
  });

  $el.find('.logo_ali_map').on('change', function (e) {
    logo.toggleAliMap(this.value);
  });

  $el.find('.logo_position').on('change', function () {
    if (!this.value.match(/^\d+$/m)) {
      return;
    }
    logo.scrollToColumn(this.value, 1);
  });

  logo_graphic.on('dblclick', function (e) {
    // need to get coordinates of mouse click
    console.log("dblclick", logo);

    offset = logo.logo_graphic.offset(),
    x = parseInt((e.pageX - offset.left), 10),

    // get mouse position in the window
    window_position = e.pageX - $el.parent().offset().left,

    // get column number
    col = logo.columnFromCoordinates(x),

    console.log("col", col);

    // choose new zoom level and zoom in.
    current = logo.zoom;

    if (current < 1) {
      logo.changeZoom({'target': 1, offset: window_position, column: col});
    } else {
      logo.changeZoom({'target': 0.3, offset: window_position, column: col});
    }

    return;
  });

  $(document).on($el.attr('id') + ".scrolledTo", function (e, left, top, zoom) {
    logo.render({target: left});
  });

  $(document).on('keydown', function (e) {
    if (!e.ctrlKey) {
      if (e.which === 61 || e.which === 107) {
        zoom += 0.1;
        logo.changeZoom({'distance': 0.1, 'direction': '+'});
      }
      if (e.which === 109 || e.which === 0) {
        zoom = zoom - 0.1;
        logo.changeZoom({'distance': 0.1, 'direction': '-'});
      }
    }
  });
}

},{"jbone":51}],34:[function(require,module,exports){
_ = require("underscore");

//var ConsensusColors = require("./consensusColors.js");
var canvasSupport = require("./canvasSupport.js");
var render = require("./render/render.js");
var Letter = require("./model/letter.js");
var view = require("backbone-viewj");
var axis = require("./axis");
var eventListener = require("./eventListener.js");
var settings = require("./info/settings.js");

var jbone = require("jbone");

module.exports = view.extend({

  options: {
    xaxis: true,
    yaxis: true,
    height: 300,
    column_width: 34,
    debug: true,
    scale_height_enabled: true,
    scaled_max: true,
    zoom_buttons: true,
    colorscheme: 'default',
    data: undefined,
    start: 1,
    end: undefined,
    zoom: 0.4,
    colors: undefined,
    divider: false,
    show_probs: false,
    divider_step: 5,
    show_divider: false,
    border: false,
    settings: false,
    scroller: true,
    positionMarker: true
  },

  loadDefault: function(options){
    this.data = options.data;

    // never show the alignment coordinates by default as that would get
    // really confusing.
    this.display_ali_map = 0;

    this.alphabet = options.data.alphabet || 'dna';

    this.start = options.start;
    //this.end = options.end || this.data.heightArr.length;
    this.zoom = parseFloat(options.zoom) || 0.4;
    this.default_zoom = this.zoom;

    this.column_width = options.column_width;
    this.height = options.height;
    this.canvas_width = 5000;
    this.scale_height_enabled = options.scale_height_enabled;

    // this needs to be set to null here so that we can initialise it after
    // the render function has fired and the width determined.
    this.scrollme = null;

    this.previous_target = 0;
    // keeps track of which canvas elements have been drawn and which ones haven't.
    this.rendered = [];
    this.previous_zoom = 0;

    if(this.data.max_height == undefined){
      this.data.max_height = this.calcMaxHeight(this.data.heightArr); 
    }

    // only show insert when we actually have the data
    if(!this.data.insert_probs || !this.data.delete_probs){
      this.options.show_probs = false;
    }

    if (options.scaled_max) {
      this.data.max_height = options.data.max_height_obs || this.data.max_height || 2;
    } else {
      this.data.max_height = options.data.max_height_theory || this.data.max_height || 2;
    }

    if(options.colors){
      this.changeColors(options.colors);
    }else{
      if (this.alphabet === 'aa') {
        this.aa_colors = require("./colors/aa.js");
        this.changeColors(this.aa_colors);
      }else{
        this.dna_colors = require("./colors/dna.js");
        this.changeColors(this.dna_colors);
      }
    }
  },
  initialize: function(options) {
    if (!canvasSupport()) {
      this.el.textContent = "Your browser doesn't support canvas.";
      return;
    }
    if(options.data == undefined){
      this.el.textContent = "No data added.";
    }

    // load default settings
    _.extend(this.options,options);
    var opt = this.options;
    this.loadDefault(opt);

    if(!this.options.show_probs){
      this.info_content_height = this.height;
    }else{
      // turn off the insert rows if the hmm used the observed or weighted processing flags.
      if (this.data.processing && /^observed|weighted/.test(this.data.processing)) {
        this.show_inserts = 0;
        this.info_content_height = this.height - 14;
      } else {
        this.show_inserts = 1;
        this.info_content_height = this.height - 44;
      }
    }
    this.$el = jbone(this.el);

    this.initDivs();

    if(this.options.settings){
      var form = settings(this,opt);
      this.$el.append(form);
    }

    eventListener(this.$el,this, this.logo_graphic);
    /*
       if (opt.columnInfo) {
       var columnInfo = require("./info/column_info.js");
       columnInfo(this);
       }
       */

  },
  initDivs: function(){
    var logo_graphic = mk("div");
    logo_graphic.className = "logo_graphic";
    this.logo_graphic = jbone(logo_graphic);

    var container = mk("div");
    container.className = "logo_container";
    container.style.height = this.height;
    this.container = jbone(container);

    this.container.append(logo_graphic);

    // add some internal divs for scrolling etc.
    this.$el.append(container);

    if(this.options.divider){
      var divider = mk("div");
      divider.className = "logo_divider";
      this.$el.append(divider);
    }

    this.dom_element = jbone(logo_graphic);
    this.called_on = this.$el;

    if(this.options.xaxis){
      axis.render_x_axis_label.call(this);
    }
    if(this.options.yaxis){
      axis.render_y_axis_label.call(this);
    }else{
      this.container[0].style.marginLeft = "0px";
    }

  },

  render: function(){
    render.call(this); 
    return this;
  },

  changeColors: function(colors){
    this.colors = colors;
    var bUseColorObject = (colors != undefined && colors.type != undefined);
    if(bUseColorObject){
      this.colorscheme = "dynamic";
    }
    this.buildAlphabet();
  },

  buildAlphabet: function(){
    /*
       if (this.alphabet === 'aa') {
       var probs_arr = this.data.probs_arr;
       if (probs_arr) {
       var cc = new ConsensusColors();
       this.cmap = cc.color_map(probs_arr);
       }
       }
       */

    //build the letter canvases
    this.letters = {};
    var colors = this.colors;
    if(this.colorscheme == "dynamic"){
      var tColors = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
      colors = {};
      tColors.forEach(function(e){
        colors[e] = "";
      });
    }
    for (var letter in colors) {
      if (colors.hasOwnProperty(letter)) {
        var loptions = {color: colors[letter]};
        this.letters[letter] = new Letter(letter, loptions);
      }
    }
  },

  toggleColorscheme: function (scheme) {
    // work out the current column we are on so we can return there
    var col_total = this.currentColumn();

    if (scheme) {
      if (scheme === 'default') {
        this.colorscheme = 'default';
      } else {
        this.colorscheme = 'consensus';
      }
    } else {
      if (this.colorscheme === 'default') {
        this.colorscheme = 'consensus';
      } else {
        this.colorscheme = 'default';
      }
    }

    // reset the rendered counter so that each section will re-render
    // with the new heights
    this.rendered = [];

    // re-flow and re-render the content
    this.scrollme.reflow();
    //scroll off by one to force a render of the canvas.
    this.scrollToColumn(col_total + 1);
    //scroll back to the location we started at.
    this.scrollToColumn(col_total);
  },

  toggleScale: function (scale) {
    // work out the current column we are on so we can return there
    var col_total = this.currentColumn();

    if (scale) {
      if (scale === 'obs') {
        this.data.max_height = this.data.max_height_obs;
      } else {
        this.data.max_height = this.data.max_height_theory;
      }
    } else {
      // toggle the max height
      if (this.data.max_height === this.data.max_height_obs) {
        this.data.max_height = this.data.max_height_theory;
      } else {
        this.data.max_height = this.data.max_height_obs;
      }
    }
    // reset the rendered counter so that each section will re-render
    // with the new heights
    this.rendered = [];
    //update the y-axis
    if(this.logoYAxis){
      this.logoYAxis.remove();
      //this.called_on.find('.logo_yaxis').remove();
    }
    axis.render_y_axis_label.call(this);

    // re-flow and re-render the content
    this.scrollme.reflow();
    //scroll off by one to force a render of the canvas.
    this.scrollToColumn(col_total + 1);
    //scroll back to the location we started at.
    this.scrollToColumn(col_total);
  },
  toggleAliMap: function (coords) {
    // work out the current column we are on so we can return there
    var col_total = this.currentColumn();

    if (coords) {
      if (coords === 'model') {
        this.display_ali_map = 0;
      } else {
        this.display_ali_map = 1;
      }
    } else {
      // toggle the max height
      if (this.display_ali_map === 1) {
        this.display_ali_map = 0;
      } else {
        this.display_ali_map = 1;
      }
    }
    axis.render_x_axis_label(this);

    // reset the rendered counter so that each section will re-render
    // with the new heights
    this.rendered = [];

    // re-flow and re-render the content
    this.scrollme.reflow();
    //scroll off by one to force a render of the canvas.
    this.scrollToColumn(col_total + 1);
    //scroll back to the location we started at.
    this.scrollToColumn(col_total);
  },

  currentColumn: function () {
    var before_left = this.scrollme.scroller.getValues().left,
    col_width = (this.column_width * this.zoom),
    col_count = before_left / col_width,
    half_visible_columns = (this.container.width() / col_width) / 2,
    col_total = Math.ceil(col_count + half_visible_columns);
    return col_total;
  },

  changeZoom: function (options) {
    var zoom_level = 0.3,
    expected_width = null;
    if (options.target) {
      zoom_level = options.target;
    } else if (options.distance) {
      zoom_level = (parseFloat(this.zoom) - parseFloat(options.distance)).toFixed(1);
      if (options.direction === '+') {
        zoom_level = (parseFloat(this.zoom) + parseFloat(options.distance)).toFixed(1);
      }
    }

    if (zoom_level > 1) {
      zoom_level = 1;
    } else if (zoom_level < 0.1) {
      zoom_level = 0.1;
    }

    // see if we need to zoom or not
    expected_width = (this.logo_graphic.width() * zoom_level) / this.zoom;
    if (expected_width > this.container.width()) {
      // if a center is not specified, then use the current center of the view
      if (!options.column) {
        //work out my current position
        var col_total = this.currentColumn();

        this.zoom = zoom_level;
        this.render({zoom: this.zoom});
        this.scrollme.reflow();

        //scroll to previous position
        this.scrollToColumn(col_total);
      } else { // center around the mouse click position.
        this.zoom = zoom_level;
        this.render({zoom: this.zoom});
        this.scrollme.reflow();

        var coords = this.coordinatesFromColumn(options.column);
        this.scrollme.scroller.scrollTo(coords - options.offset);
      }
    }
    return this.zoom;

  },

  columnFromCoordinates: function (x) {
    var column = Math.ceil(x / (this.column_width * this.zoom));
    return column;
  },

  coordinatesFromColumn: function (col) {
    var new_column = col - 1,
    x = (new_column  * (this.column_width * this.zoom)) + ((this.column_width * this.zoom) / 2);
    return x;
  },

  scrollToColumn: function (num, animate) {
    var half_view = (this.logo_container.width() / 2),
    new_left = this.coordinatesFromColumn(num);
    this.scrollme.scroller.scrollTo(new_left - half_view, 0, animate);
  },
  calcMaxHeight: function(columns){
    // loops over all columns and return the max height seen 
    return columns.reduce(function(m,c){
      var col = 0;
      for(var k in c){
        col += c[k];
      }
      return col > m ? col : m;
    },0);
  }


});

var mk = function(name){
  return document.createElement(name);
}

},{"./axis":29,"./canvasSupport.js":30,"./colors/aa.js":31,"./colors/dna.js":32,"./eventListener.js":33,"./info/settings.js":35,"./model/letter.js":36,"./render/render.js":40,"backbone-viewj":15,"jbone":51,"underscore":154}],35:[function(require,module,exports){
var $ = require("jbone");

module.exports = function(logo,options){
  var form = $('<form class="logo_form"><fieldset><label for="position">Column number</label>' +
               '<input type="text" name="position" class="logo_position"></input>' +
               '<button class="button logo_change">Go</button></fieldset>' +
               '</form>');

  var settings = $('<div class="logo_settings"></div>');
  settings.append('<span class="close">x</span>');



  /* we don't want to toggle if the max height_obs is greater than max theoretical
   * as letters will fall off the top.
   */
  if (logo.scale_height_enabled && (logo.data.max_height_obs < logo.data.max_height_theory)) {
    var obs_checked = '',
    theory_checked = '',
    theory_help = '',
    obs_help = '';

    if (logo.data.max_height_obs === logo.data.max_height) {
      obs_checked = 'checked';
    } else {
      theory_checked = 'checked';
    }
  }



  var scale_controls = '<fieldset><legend>Scale</legend>' +
    '<label><input type="radio" name="scale" class="logo_scale" value="obs" ' + obs_checked +
    '/>Maximum Observed ' + obs_help +
    '</label></br>' +
    '<label><input type="radio" name="scale" class="logo_scale" value="theory" ' + theory_checked +
    '/>Maximum Theoretical ' + theory_help +
    '</label>' +
    '</fieldset>';

  settings.append(scale_controls);

  if (logo.data.height_calc !== 'score' && logo.data.alphabet === 'aa' && logo.data.probs_arr) {

    var def_color = null,
    con_color = null,
    def_help = '',
    con_help = '';

    if (logo.colorscheme === 'default') {
      def_color = 'checked';
    } else {
      con_color = 'checked';
    };

    if (options.help) {
      def_help = '<a class="help" href="/help#colors_default" title="Each letter receives its own color.">' +
        '<span aria-hidden="true" data-icon="?"></span><span class="reader-text">help</span></a>';
      con_help = '<a class="help" href="/help#colors_consensus" title="Letters are colored as in Clustalx and Jalview, with colors depending on composition of the column.">' +
        '<span aria-hidden="true" data-icon="?"></span><span class="reader-text">help</span></a>';
    }

    var color_controls = '<fieldset><legend>Color Scheme</legend>' +
      '<label><input type="radio" name="color" class="logo_color" value="default" ' + def_color +
      '/>Default ' + def_help +
      '</label></br>' +
      '<label><input type="radio" name="color" class="logo_color" value="consensus" ' + con_color +
      '/>Consensus Colors ' + con_help +
      '</label>' +
      '</fieldset>';
    settings.append(color_controls);
  }


  if (logo.data.ali_map) {
    var mod_checked = null,
    ali_checked = null,
    mod_help = '',
    ali_help = '';

    if (logo.display_ali_map === 0) {
      mod_checked = 'checked';
    } else {
      ali_checked = 'checked';
    }

    if (options.help) {
      mod_help = '<a class="help" href="/help#coords_model" title="The coordinates along the top of the plot show the model position.">' +
        '<span aria-hidden="true" data-icon="?"></span><span class="reader-text">help</span></a>';
      ali_help = '<a class="help" href="/help#coords_ali" title="The coordinates along the top of the plot show the column in the alignment associated with the model">' +
        '<span aria-hidden="true" data-icon="?"></span><span class="reader-text">help</span></a>';
    }

    var ali_controls = '<fieldset><legend>Coordinates</legend>' +
      '<label><input type="radio" name="coords" class="logo_ali_map" value="model" ' + mod_checked +
      '/>Model ' + mod_help +
      '</label></br>' +
      '<label><input type="radio" name="coords" class="logo_ali_map" value="alignment" ' + ali_checked +
      '/>Alignment ' + ali_help +
      '</label>' +
      '</fieldset>';
    settings.append(ali_controls);
  }


  var controls = $('<div class="logo_controls"></div>');
  if (logo.zoom_enabled) {
    controls.append('<button class="logo_zoomout button">-</button>' +
                    '<button class="logo_zoomin button">+</button>');
  }

  if (settings.children().length > 0) {
    controls.append('<button class="logo_settings_switch button">Settings</button>');
    controls.append(settings);
  }

  form.append(controls);

  return form;
}

},{"jbone":51}],36:[function(require,module,exports){
module.exports = function Letter(letter, options) {
  options = options || {};
  this.value = letter;
  this.width = parseInt(options.width, 10) || 100;

  //W is 30% wider than the other letters, so need to make sure
  //it gets modified accordingly.
  if (this.value === 'W') {
    this.width += (this.width * 30) / 100;
  }

  this.height = parseInt(options.height, 10) || 100;

  this.color = options.color || '#000000';
  // if the height and width are changed from the default, then
  // this will also need to be changed as it cant be calculated
  // dynamically.
  this.fontSize = options.fontSize || 138;

  this.scaled = function () { };

  this.draw = function (ext_ctx, target_height, target_width, x, y, color) {
    var h_ratio = target_height / this.height,
    w_ratio = target_width / this.width,
    prev_font = ext_ctx.font;
    ext_ctx.transform(w_ratio, 0, 0, h_ratio, x, y);
    ext_ctx.fillStyle = color || this.color;
    ext_ctx.textAlign = "center";
    ext_ctx.font = "bold " + this.fontSize + "px Arial";

    ext_ctx.fillText(this.value, 0, 0);
    //restore the canvas settings
    ext_ctx.setTransform(1, 0, 0, 1, 0, 0);
    ext_ctx.fillStyle = '#000000';
    ext_ctx.font = prev_font;
  };

}

},{}],37:[function(require,module,exports){
module.exports = function draw_border(context, y, width) {
  context.beginPath();
  context.moveTo(0, y);
  context.lineTo(width, y);
  context.lineWidth = 1;
  context.strokeStyle = "#999999";
  context.stroke();
}

},{}],38:[function(require,module,exports){
module.exports = function draw_column_number(context, x, y, col_width, col_num, fontsize, right) {
  context.font = fontsize + "px Arial";
  context.textAlign = right ? "right" : "center";
  context.fillStyle = "#666666";
  context.fillText(col_num, x + (col_width / 2), y);
}

},{}],39:[function(require,module,exports){
module.exports = function draw_ticks(context, x, y, height, color) {
  color = color || '#999999';
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x, y + height);
  context.lineWidth = 1;
  context.strokeStyle = color;
  context.stroke();
}

},{}],40:[function(require,module,exports){
var renderWithText = require("./render_with_text.js");
var renderWithRect = require("./render_with_rects.js");
var jbone = require("jbone");

// the main render function that draws the logo based on the provided options.
module.exports = function (options) {
  if (!this.data) {
    return;
  }
  options    = options || {};
  var zoom   = options.zoom || this.zoom,
  target = options.target || 1,
  scaled = options.scaled || null;
  var parent_width = this.dom_element.parent().attr('width'),
  max_canvas_width = 1,
  end = null,
  start = null,
  i = 0;

  /*
  if (target === this.previous_target) {
    return;
  }
  */

  this.previous_target = target;


  if (options.start) {
    this.start = options.start;
  }
  if (options.end) {
    this.end = options.end;
  }

  if (zoom <= 0.1) {
    zoom = 0.1;
  } else if (zoom >= 1) {
    zoom = 1;
  }

  this.zoom = zoom;

  end = this.end || this.data.heightArr.length;
  start = this.start || 1;
  end     = (end > this.data.heightArr.length) ? this.data.heightArr.length : end;
  end     = (end < start) ? start : end;

  start     = (start > end) ? end : start;
  start     = (start > 1) ? start : 1;

  this.y = this.height - 20;
  // Check to see if the logo will fit on the screen at full zoom.
  this.max_width = this.column_width * ((end - start) + 1);
  // If it fits then zoom out and disable zooming.
  if (parent_width > this.max_width) {
    zoom = 1;
    this.zoom_enabled = false;
  }
  this.zoom = zoom;

  this.zoomed_column = this.column_width * zoom;
  this.total_width = this.zoomed_column * ((end - start) + 1);

  // If zoom is not maxed and we still aren't filling the window
  // then ramp up the zoom level until it fits, then disable zooming.
  // Then we get a decent logo with out needing to zoom in or out.
  if (zoom < 1) {
    while (this.total_width < parent_width) {
      this.zoom += 0.1;
      this.zoomed_column = this.column_width * this.zoom;
      this.total_width = this.zoomed_column * ((end - start) + 1);
      this.zoom_enabled = false;
      if (zoom >= 1) {
        break;
      }
    }
  }

  if (target > this.total_width) {
    target = this.total_width;
  }
  this.dom_element.attr({'width': this.total_width + 'px'}).css({width: this.total_width + 'px'});

  this.canvas_width = this.total_width;
  var canvas_count = Math.ceil(this.total_width / this.canvas_width);
  this.columns_per_canvas = Math.ceil(this.canvas_width / this.zoomed_column);


  if (this.previous_zoom !== this.zoom) {
    this.dom_element.find('canvas').remove();
    this.previous_zoom = this.zoom;
    this.rendered = [];
  }

  this.canvases = [];
  this.contexts = [];


  for (i = 0; i < canvas_count; i++) {

    var split_start = (this.columns_per_canvas * i) + start,
    split_end   = split_start + this.columns_per_canvas - 1;
    if (split_end > end) {
      split_end = end;
    }

    var adjusted_width = ((split_end - split_start) + 1) * this.zoomed_column;

    if (adjusted_width > max_canvas_width) {
      max_canvas_width = adjusted_width;
    }

    var canv_start = max_canvas_width * i,
    canv_end = canv_start + adjusted_width;

    if (target < canv_end + (canv_end / 2) && target > canv_start - (canv_start / 2)) {
      // Check that we aren't redrawing the canvas and if not, then attach it and draw.
      //if (this.rendered[i] !== 1) {

        this.canvases[i] = attach_canvas(this.dom_element, this.height, adjusted_width, i, max_canvas_width);
        this.contexts[i] = this.canvases[i].getContext('2d');
        this.contexts[i].setTransform(1, 0, 0, 1, 0, 0);
        this.contexts[i].clearRect(0, 0, adjusted_width, this.height);
        this.contexts[i].fillStyle = "#ffffff";
        this.contexts[i].fillRect(0, 0, canv_end, this.height);


        if (this.zoomed_column > 12) {
          var fontsize = parseInt(10 * zoom, 10);
          fontsize = (fontsize > 10) ? 10 : fontsize;
          if (this.debug) {
            renderWithRect.call(this,split_start, split_end, i, 1);
          }
          renderWithText.call(this,split_start, split_end, i, fontsize);
        } else {
          renderWithRect.call(this,split_start, split_end, i);
        }
        //this.rendered[i] = 1;
      //}
    }

  }

  // check if the scroller object has been initialised and if not then do so.
  // we do this here as opposed to at object creation, because we need to
  // make sure the logo has been rendered and the width is correct, otherwise
  // we get a weird initial state where the canvas will bounce back to the
  // beginning the first time it is scrolled, because it thinks it has a
  // width of 0.
  if (!this.scrollme && this.options.scroller) {
    this.scrollme = new EasyScroller(this.dom_element[0], {
      scrollingX: 1,
      scrollingY: 0,
      eventTarget: this.called_on
    });
  }

  if (target !== 1) {
    this.scrollme.reflow();
  }
  return;
};


function attach_canvas(DOMid, height, width, id, canv_width) {
  var canvas = jbone(DOMid).find('#canv_' + id);

  if (!canvas.length) {
    jbone(DOMid).append('<canvas class="canvas_logo" id="canv_' + id + '"  height="' + height + '" width="' + width + '" style="left:' + canv_width * id + 'px"></canvas>');
    canvas = jbone(DOMid).find('#canv_' + id);
  }

  jbone(canvas).attr('width', width).attr('height', height);

  return canvas[0];
}

},{"./render_with_rects.js":41,"./render_with_text.js":42,"jbone":51}],41:[function(require,module,exports){
var draw_border = require("./draw/border.js");
var draw_ticks = require("./draw/ticks.js");
var draw_column_number = require("./draw/column_number.js");

module.exports = function (start, end, context_num, borders) {
  var x = 0,
  column_num = start,
  column_label = null,
  i = 0,
  top_height = Math.abs(this.data.max_height),
  bottom_height = Math.abs(this.data.min_height_obs),
  total_height = top_height + bottom_height,
  top_percentage    = Math.round((Math.abs(this.data.max_height) * 100) / total_height),
  //convert % to pixels
  top_pix_height = Math.round((this.info_content_height * top_percentage) / 100),
  bottom_pix_height = this.info_content_height - top_pix_height,
  mod = 10;


  for (i = start; i <= end; i++) {
    if (this.data.mmline && this.data.mmline[i - 1] === 1) {
      this.contexts[context_num].fillStyle = '#cccccc';
      this.contexts[context_num].fillRect(x, 10, this.zoomed_column, this.height - 40);
    } else {
      var column = this.data.heightArr[i - 1],
      previous_height = 0,
      previous_neg_height = top_pix_height,
      letters = column.length,
      j = 0;
      for(var j in column){
        values = [j,column[j]];
        if (values[1] > 0.01) {
          var letter_height = parseFloat(values[1]) / this.data.max_height,
          x_pos = x,
          glyph_height = (this.info_content_height - 2) * letter_height,
          y_pos = (this.info_content_height - 2) - previous_height - glyph_height,
          color = null;


          if(this.colorscheme === 'dynamic'){
            color = this.colors.getColor(values[0], {pos: i - 1} )
          }else{
            if(this.colorscheme === 'consensus') {
              color = this.cmap[i - 1][values[0]] || "#7a7a7a";
            } else {
              color = this.colors[values[0]];
            }
          }

          if (borders) {
            this.contexts[context_num].strokeStyle = color;
            this.contexts[context_num].strokeRect(x_pos, y_pos, this.zoomed_column, glyph_height);
          } else {
            this.contexts[context_num].fillStyle = color;
            this.contexts[context_num].fillRect(x_pos, y_pos, this.zoomed_column, glyph_height);
          }

          previous_height = previous_height + glyph_height;
        }
      }
    }


    if (this.zoom < 0.2) {
      mod = 20;
    } else if (this.zoom < 0.3) {
      mod = 10;
    }

    if(this.options.positionMarker){
      if (i % mod === 0) {
        // draw column dividers
        if(this.options.show_probs){
          draw_ticks(this.contexts[context_num], x + this.zoomed_column, this.height - 30, parseFloat(this.height), '#dddddd');
        }
        // draw top ticks
        draw_ticks(this.contexts[context_num], x + this.zoomed_column, 0, 5);

        // if ali_coordinates exist and toggle is set then display the
        // alignment coordinates and not the model coordinates.
        if (this.display_ali_map) {
          column_label = this.data.ali_map[i - 1];
        } else {
          column_label = column_num;
        }
        // draw column numbers
        draw_column_number(this.contexts[context_num], x - 2,  10, this.zoomed_column, column_label, 10, true);
      }

    }


    // draw insert probabilities/lengths
    if(this.options.show_probs){
      draw_small_insert(
        this.contexts[context_num],
        x,
        this.height - 42,
        this.zoomed_column,
        this.data.insert_probs[i - 1],
        this.data.insert_lengths[i - 1],
        this.data.delete_probs[i - 1],
        this.show_inserts
      );
    }

    if(this.options.show_probs){
      // draw other dividers
      if (this.show_inserts) {
        draw_border(this.contexts[context_num], this.height - 45, this.total_width);
      } else {
        draw_border(this.contexts[context_num], this.height - 15, this.total_width);
      }
    }

    if(this.options.border){
      draw_border(this.contexts[context_num], 0, this.total_width);
    }

    x += this.zoomed_column;
    column_num++;
  }

};


function draw_small_insert(context, x, y, col_width, in_odds, in_length, del_odds, show_inserts) {
  var fill = "#ffffff";
  if (show_inserts) {
    if (in_odds > 0.1) {
      fill = '#d7301f';
    } else if (in_odds > 0.05) {
      fill = '#fc8d59';
    } else if (in_odds > 0.03) {
      fill = '#fdcc8a';
    }
    context.fillStyle = fill;
    context.fillRect(x, y + 15, col_width, 10);

    fill = "#ffffff";
    // draw insert length
    if (in_length > 9) {
      fill = '#d7301f';
    } else if (in_length > 7) {
      fill = '#fc8d59';
    } else if (in_length > 4) {
      fill = '#fdcc8a';
    }
    context.fillStyle = fill;
    context.fillRect(x, y + 30, col_width, 10);
  } else {
    y  = y + 30;
  }

  fill = "#ffffff";
  // draw delete odds
  if (del_odds < 0.75) {
    fill = '#2171b5';
  } else if (del_odds < 0.85) {
    fill = '#6baed6';
  } else if (del_odds < 0.95) {
    fill = '#bdd7e7';
  }
  context.fillStyle = fill;
  context.fillRect(x, y, col_width, 10);
}



},{"./draw/border.js":37,"./draw/column_number.js":38,"./draw/ticks.js":39}],42:[function(require,module,exports){
var draw_border = require("./draw/border.js");
var draw_ticks = require("./draw/ticks.js");
var draw_column_number = require("./draw/column_number.js");

module.exports = function (start, end, context_num, fontsize) {
  var x = 0,
  column_num = start,
  column_label = null,
  i = 0,
  top_height = Math.abs(this.data.max_height),
  bottom_height = (isNaN(this.data.min_height_obs)) ? 0 : parseInt(this.data.min_height_obs, 10),
  total_height = top_height + Math.abs(bottom_height),
  top_percentage    = Math.round((Math.abs(this.data.max_height) * 100) / total_height),
  //convert % to pixels
  top_pix_height = Math.round((this.info_content_height * top_percentage) / 100),
  bottom_pix_height = this.info_content_height - top_pix_height,
  // this is used to transform the 256px high letters into the correct size
  // when displaying negative values, so that they fit above the 0 line.
  top_pix_conversion = top_pix_height / this.info_content_height,
  bottom_pix_conversion = bottom_pix_height / this.info_content_height;

  // add 3 extra columns so that numbers don't get clipped at the end of a canvas
  // that ends before a large column. DF0000830 was suffering at zoom level 0.6,
  // column 2215. This adds a little extra overhead, but is the easiest fix for now.
  if (end + 3 <= this.end) {
    end += 3;
  }

  for (i = start; i <= end; i++) {
    if (this.data.mmline && this.data.mmline[i - 1] === 1) {
      this.contexts[context_num].fillStyle = '#cccccc';
      this.contexts[context_num].fillRect(x, 10, this.zoomed_column, this.height - 40);
    } else {
      var column = this.data.heightArr[i - 1],
      col_positions = [];
      if (column) {
        var previous_height = 0,
        letters = column.length,
        previous_neg_height = top_pix_height,
        j = 0,
        color = null;

        for(var j in column){
          var letter = column[j],
          values = [j,letter];
          x_pos = x + (this.zoomed_column / 2),
          letter_height = null;

          // we don't render anything with a value between 0 and 0.01. These
          // letters would be too small to be meaningful on any scale, so we
          // just squash them out.
          if (values[1] > 0.01) {
            letter_height = parseFloat(values[1]) / this.data.max_height;
            var y_pos = (this.info_content_height - 2) - previous_height,
            glyph_height = (this.info_content_height - 2) * letter_height;

            col_positions[j] = [glyph_height, this.zoomed_column, x_pos, y_pos];
            previous_height = previous_height + glyph_height;
          }
        }

        // render the letters in reverse order so that the larger letters on the top
        // don't clobber the smaller letters below them.
        //for (j = letters; j >= 0; j--) {
        for(var j in column){
          if (col_positions[j] && this.letters[j]) {

            if(this.colorscheme === 'dynamic'){
              color = this.colors.getColor(j, {pos: i - 1} );
            }else{
              if (this.colorscheme === 'consensus') {
                color = this.cmap[i - 1][j] || "#7a7a7a";
              } else {
                color = null;
              }
            }
            this.letters[j].draw(this.contexts[context_num], col_positions[j][0], col_positions[j][1], col_positions[j][2], col_positions[j][3], color);
          }
        }
      }
    }


    // if ali_coordinates exist and toggle is set then display the
    // alignment coordinates and not the model coordinates.
    if (this.display_ali_map) {
      column_label = this.data.ali_map[i - 1];
    } else {
      column_label = column_num;
    }

    if(this.options.show_divider){
      if (this.zoom < 0.7) {
        if (i % this.options.divider_step === 0) {
          draw_column_divider(this,{
            context_num : context_num,
            x : x,
            fontsize: 10,
            column_num: column_label,
            ralign: true
          });
        }
      } else {
        draw_column_divider(this,{
          context_num : context_num,
          x : x,
          fontsize: fontsize,
          column_num: column_label
        });
      }
    }

    if(this.options.show_probs){
      draw_delete_odds(this.contexts[context_num], x, this.height, this.zoomed_column, this.data.delete_probs[i - 1], fontsize, this.show_inserts);
      //draw insert length ticks
      draw_ticks(this.contexts[context_num], x, this.height - 15, 5);
      if (this.show_inserts) {
        draw_insert_odds(this.contexts[context_num], x, this.height, this.zoomed_column, this.data.insert_probs[i - 1], fontsize);
        draw_insert_length(this.contexts[context_num], x, this.height - 5, this.zoomed_column, this.data.insert_lengths[i - 1], fontsize);

        // draw delete probability ticks
        draw_ticks(this.contexts[context_num], x, this.height - 45, 5);
        // draw insert probability ticks
        draw_ticks(this.contexts[context_num], x, this.height - 30, 5);
      }

    }

    x += this.zoomed_column;
    column_num++;
  }


  if(this.options.show_probs){
    // draw other dividers
    if (this.show_inserts) {
      draw_border(this.contexts[context_num], this.height - 30, this.total_width);
      draw_border(this.contexts[context_num], this.height - 45, this.total_width);
    }
    draw_border(this.contexts[context_num], this.height - 15, this.total_width);
  }
  if(this.options.border){
    draw_border(this.contexts[context_num], 0, this.total_width);
  }
};


function draw_delete_odds(context, x, height, col_width, text, fontsize, show_inserts) {
  var y        = height - 4,
  fill     = '#ffffff',
  textfill = '#555555';

  if (show_inserts) {
    y = height - 35;
  }

  if (text < 0.75) {
    fill     = '#2171b5';
    textfill = '#ffffff';
  } else if (text < 0.85) {
    fill = '#6baed6';
  } else if (text < 0.95) {
    fill = '#bdd7e7';
  }

  draw_rect_with_text(context, x, y, text, fontsize, col_width, fill, textfill);
}

function draw_rect_with_text(context, x, y, text, fontsize, col_width, fill, textfill) {
  context.font = fontsize + "px Arial";
  context.fillStyle = fill;
  context.fillRect(x, y - 10, col_width, 14);
  context.textAlign = "center";
  context.fillStyle = textfill;
  context.fillText(text, x + (col_width / 2), y);
}

function draw_column_divider(inst, opts) {
  var div_x = opts.ralign ? opts.x + inst.zoomed_column : opts.x,
  num_x = opts.ralign ? opts.x + 2 : opts.x;
  // draw column dividers
  draw_ticks(inst.contexts[opts.context_num], div_x, inst.height - 30, -30 - inst.height, '#dddddd');
  // draw top ticks
  draw_ticks(inst.contexts[opts.context_num], div_x, 0, 5);
  // draw column numbers
  draw_column_number(inst.contexts[opts.context_num], num_x, 10, inst.zoomed_column, opts.column_num, opts.fontsize, opts.ralign);
};



function draw_insert_odds(context, x, height, col_width, text, fontsize) {
  var y        = height - 20,
  fill     = '#ffffff',
  textfill = '#555555';

  if (text > 0.1) {
    fill     = '#d7301f';
    textfill = '#ffffff';
  } else if (text > 0.05) {
    fill = '#fc8d59';
  } else if (text > 0.03) {
    fill = '#fdcc8a';
  }

  draw_rect_with_text(context, x, y, text, fontsize, col_width, fill, textfill);

  //draw vertical line to indicate where the insert would occur
  if (text > 0.03) {
    draw_ticks(context, x + col_width, height - 30, -30 - height, fill);
  }
}
function draw_insert_length(context, x, y, col_width, text, fontsize) {
  var fill = '#ffffff',
  textfill = '#555555';

  if (text > 9) {
    fill     = '#d7301f';
    textfill = '#ffffff';
  } else if (text > 7) {
    fill = '#fc8d59';
  } else if (text > 4) {
    fill = '#fdcc8a';
  }
  draw_rect_with_text(context, x, y, text, fontsize, col_width, fill, textfill);
}

},{"./draw/border.js":37,"./draw/column_number.js":38,"./draw/ticks.js":39}],43:[function(require,module,exports){
/*
 * JavaScript Canvas to Blob 2.0.5
 * https://github.com/blueimp/JavaScript-Canvas-to-Blob
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on stackoverflow user Stoive's code snippet:
 * http://stackoverflow.com/q/4998908
 */
var CanvasPrototype = window.HTMLCanvasElement &&
window.HTMLCanvasElement.prototype,
  hasBlobConstructor = window.Blob && (function () {
    try {
      return Boolean(new Blob());
    } catch (e) {
      return false;
    }
  }()),
  hasArrayBufferViewSupport = hasBlobConstructor && window.Uint8Array &&
  (function () {
    try {
      return new Blob([new Uint8Array(100)]).size === 100;
    } catch (e) {
      return false;
    }
  }()),
  BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder ||
  window.MozBlobBuilder || window.MSBlobBuilder,
  dataURLtoBlob = (hasBlobConstructor || BlobBuilder) && window.atob &&
  window.ArrayBuffer && window.Uint8Array && function (dataURI) {
    var byteString,
    arrayBuffer,
    intArray,
      i,
      mimeString,
        bb;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      // Convert base64 to raw binary data held in a string:
      byteString = atob(dataURI.split(',')[1]);
    } else {
      // Convert base64/URLEncoded data component to raw binary data:
      byteString = decodeURIComponent(dataURI.split(',')[1]);
    }
    // Write the bytes of the string to an ArrayBuffer:
    arrayBuffer = new ArrayBuffer(byteString.length);
    intArray = new Uint8Array(arrayBuffer);
    for (i = 0; i < byteString.length; i += 1) {
      intArray[i] = byteString.charCodeAt(i);
    }
    // Separate out the mime component:
    mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // Write the ArrayBuffer (or ArrayBufferView) to a blob:
    if (hasBlobConstructor) {
      return new Blob(
          [hasArrayBufferViewSupport ? intArray : arrayBuffer],
          {type: mimeString}
          );
    }
    bb = new BlobBuilder();
    bb.append(arrayBuffer);
    return bb.getBlob(mimeString);
  };
if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
  if (CanvasPrototype.mozGetAsFile) {
    CanvasPrototype.toBlob = function (callback, type, quality) {
      if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
        callback(dataURLtoBlob(this.toDataURL(type, quality)));
      } else {
        callback(this.mozGetAsFile('blob', type));
      }
    };
  } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
    CanvasPrototype.toBlob = function (callback, type, quality) {
      callback(dataURLtoBlob(this.toDataURL(type, quality)));
    };
  }
}

module.exports = dataURLtoBlob;

},{}],44:[function(require,module,exports){
/* FileSaver.js
 *  A saveAs() FileSaver implementation.
 *  2014-05-27
 *
 *  By Eli Grey, http://eligrey.com
 *  License: X11/MIT
 *    See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs
  // IE 10+ (native saveAs)
  || (typeof navigator !== "undefined" &&
      navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator))
  // Everyone else
  || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof navigator !== "undefined" &&
	    /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = !view.externalHost && "download" in save_link
		, click = function(node) {
			var event = doc.createEvent("MouseEvents");
			event.initMouseEvent(
				"click", true, false, view, 0, 0, 0, 0, 0
				, false, false, false, false, 0, null
			);
			node.dispatchEvent(event);
		}
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		, deletion_queue = []
		, process_deletion_queue = function() {
			var i = deletion_queue.length;
			while (i--) {
				var file = deletion_queue[i];
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			}
			deletion_queue.length = 0; // clear queue
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, FileSaver = function(blob, name) {
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, get_object_url = function() {
					var object_url = get_URL().createObjectURL(blob);
					deletion_queue.push(object_url);
					return object_url;
				}
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_object_url(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					} else {
						window.open(object_url, "_blank");
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_object_url(blob);
				save_link.href = object_url;
				save_link.download = name;
				click(save_link);
				filesaver.readyState = filesaver.DONE;
				dispatch_all();
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									deletion_queue.push(file);
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name) {
			return new FileSaver(blob, name);
		}
	;
	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	view.addEventListener("unload", process_deletion_queue, false);
	saveAs.unload = function() {
		process_deletion_queue();
		view.removeEventListener("unload", process_deletion_queue, false);
	};
	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

amdDefine = window.define;
if( typeof amdDefine === "undefined" && (typeof window.almond !== "undefined" 
    && "define" in window.almond )){
  amdDefine = window.almond.define;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = saveAs;
} else if ((typeof amdDefine !== "undefined" && amdDefine !== null) && (amdDefine.amd != null)) {
  amdDefine("saveAs",[], function() {
    return saveAs;
  });
}

},{}],45:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],46:[function(require,module,exports){
!function() {
  var d3 = {
    version: "3.5.17"
  };
  var d3_arraySlice = [].slice, d3_array = function(list) {
    return d3_arraySlice.call(list);
  };
  var d3_document = this.document;
  function d3_documentElement(node) {
    return node && (node.ownerDocument || node.document || node).documentElement;
  }
  function d3_window(node) {
    return node && (node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView);
  }
  if (d3_document) {
    try {
      d3_array(d3_document.documentElement.childNodes)[0].nodeType;
    } catch (e) {
      d3_array = function(list) {
        var i = list.length, array = new Array(i);
        while (i--) array[i] = list[i];
        return array;
      };
    }
  }
  if (!Date.now) Date.now = function() {
    return +new Date();
  };
  if (d3_document) {
    try {
      d3_document.createElement("DIV").style.setProperty("opacity", 0, "");
    } catch (error) {
      var d3_element_prototype = this.Element.prototype, d3_element_setAttribute = d3_element_prototype.setAttribute, d3_element_setAttributeNS = d3_element_prototype.setAttributeNS, d3_style_prototype = this.CSSStyleDeclaration.prototype, d3_style_setProperty = d3_style_prototype.setProperty;
      d3_element_prototype.setAttribute = function(name, value) {
        d3_element_setAttribute.call(this, name, value + "");
      };
      d3_element_prototype.setAttributeNS = function(space, local, value) {
        d3_element_setAttributeNS.call(this, space, local, value + "");
      };
      d3_style_prototype.setProperty = function(name, value, priority) {
        d3_style_setProperty.call(this, name, value + "", priority);
      };
    }
  }
  d3.ascending = d3_ascending;
  function d3_ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }
  d3.descending = function(a, b) {
    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  };
  d3.min = function(array, f) {
    var i = -1, n = array.length, a, b;
    if (arguments.length === 1) {
      while (++i < n) if ((b = array[i]) != null && b >= b) {
        a = b;
        break;
      }
      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
    } else {
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
        a = b;
        break;
      }
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && a > b) a = b;
    }
    return a;
  };
  d3.max = function(array, f) {
    var i = -1, n = array.length, a, b;
    if (arguments.length === 1) {
      while (++i < n) if ((b = array[i]) != null && b >= b) {
        a = b;
        break;
      }
      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
    } else {
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
        a = b;
        break;
      }
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b > a) a = b;
    }
    return a;
  };
  d3.extent = function(array, f) {
    var i = -1, n = array.length, a, b, c;
    if (arguments.length === 1) {
      while (++i < n) if ((b = array[i]) != null && b >= b) {
        a = c = b;
        break;
      }
      while (++i < n) if ((b = array[i]) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    } else {
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
        a = c = b;
        break;
      }
      while (++i < n) if ((b = f.call(array, array[i], i)) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    }
    return [ a, c ];
  };
  function d3_number(x) {
    return x === null ? NaN : +x;
  }
  function d3_numeric(x) {
    return !isNaN(x);
  }
  d3.sum = function(array, f) {
    var s = 0, n = array.length, a, i = -1;
    if (arguments.length === 1) {
      while (++i < n) if (d3_numeric(a = +array[i])) s += a;
    } else {
      while (++i < n) if (d3_numeric(a = +f.call(array, array[i], i))) s += a;
    }
    return s;
  };
  d3.mean = function(array, f) {
    var s = 0, n = array.length, a, i = -1, j = n;
    if (arguments.length === 1) {
      while (++i < n) if (d3_numeric(a = d3_number(array[i]))) s += a; else --j;
    } else {
      while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) s += a; else --j;
    }
    if (j) return s / j;
  };
  d3.quantile = function(values, p) {
    var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
    return e ? v + e * (values[h] - v) : v;
  };
  d3.median = function(array, f) {
    var numbers = [], n = array.length, a, i = -1;
    if (arguments.length === 1) {
      while (++i < n) if (d3_numeric(a = d3_number(array[i]))) numbers.push(a);
    } else {
      while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) numbers.push(a);
    }
    if (numbers.length) return d3.quantile(numbers.sort(d3_ascending), .5);
  };
  d3.variance = function(array, f) {
    var n = array.length, m = 0, a, d, s = 0, i = -1, j = 0;
    if (arguments.length === 1) {
      while (++i < n) {
        if (d3_numeric(a = d3_number(array[i]))) {
          d = a - m;
          m += d / ++j;
          s += d * (a - m);
        }
      }
    } else {
      while (++i < n) {
        if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) {
          d = a - m;
          m += d / ++j;
          s += d * (a - m);
        }
      }
    }
    if (j > 1) return s / (j - 1);
  };
  d3.deviation = function() {
    var v = d3.variance.apply(this, arguments);
    return v ? Math.sqrt(v) : v;
  };
  function d3_bisector(compare) {
    return {
      left: function(a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1; else hi = mid;
        }
        return lo;
      },
      right: function(a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) > 0) hi = mid; else lo = mid + 1;
        }
        return lo;
      }
    };
  }
  var d3_bisect = d3_bisector(d3_ascending);
  d3.bisectLeft = d3_bisect.left;
  d3.bisect = d3.bisectRight = d3_bisect.right;
  d3.bisector = function(f) {
    return d3_bisector(f.length === 1 ? function(d, x) {
      return d3_ascending(f(d), x);
    } : f);
  };
  d3.shuffle = function(array, i0, i1) {
    if ((m = arguments.length) < 3) {
      i1 = array.length;
      if (m < 2) i0 = 0;
    }
    var m = i1 - i0, t, i;
    while (m) {
      i = Math.random() * m-- | 0;
      t = array[m + i0], array[m + i0] = array[i + i0], array[i + i0] = t;
    }
    return array;
  };
  d3.permute = function(array, indexes) {
    var i = indexes.length, permutes = new Array(i);
    while (i--) permutes[i] = array[indexes[i]];
    return permutes;
  };
  d3.pairs = function(array) {
    var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
    while (i < n) pairs[i] = [ p0 = p1, p1 = array[++i] ];
    return pairs;
  };
  d3.transpose = function(matrix) {
    if (!(n = matrix.length)) return [];
    for (var i = -1, m = d3.min(matrix, d3_transposeLength), transpose = new Array(m); ++i < m; ) {
      for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n; ) {
        row[j] = matrix[j][i];
      }
    }
    return transpose;
  };
  function d3_transposeLength(d) {
    return d.length;
  }
  d3.zip = function() {
    return d3.transpose(arguments);
  };
  d3.keys = function(map) {
    var keys = [];
    for (var key in map) keys.push(key);
    return keys;
  };
  d3.values = function(map) {
    var values = [];
    for (var key in map) values.push(map[key]);
    return values;
  };
  d3.entries = function(map) {
    var entries = [];
    for (var key in map) entries.push({
      key: key,
      value: map[key]
    });
    return entries;
  };
  d3.merge = function(arrays) {
    var n = arrays.length, m, i = -1, j = 0, merged, array;
    while (++i < n) j += arrays[i].length;
    merged = new Array(j);
    while (--n >= 0) {
      array = arrays[n];
      m = array.length;
      while (--m >= 0) {
        merged[--j] = array[m];
      }
    }
    return merged;
  };
  var abs = Math.abs;
  d3.range = function(start, stop, step) {
    if (arguments.length < 3) {
      step = 1;
      if (arguments.length < 2) {
        stop = start;
        start = 0;
      }
    }
    if ((stop - start) / step === Infinity) throw new Error("infinite range");
    var range = [], k = d3_range_integerScale(abs(step)), i = -1, j;
    start *= k, stop *= k, step *= k;
    if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
    return range;
  };
  function d3_range_integerScale(x) {
    var k = 1;
    while (x * k % 1) k *= 10;
    return k;
  }
  function d3_class(ctor, properties) {
    for (var key in properties) {
      Object.defineProperty(ctor.prototype, key, {
        value: properties[key],
        enumerable: false
      });
    }
  }
  d3.map = function(object, f) {
    var map = new d3_Map();
    if (object instanceof d3_Map) {
      object.forEach(function(key, value) {
        map.set(key, value);
      });
    } else if (Array.isArray(object)) {
      var i = -1, n = object.length, o;
      if (arguments.length === 1) while (++i < n) map.set(i, object[i]); else while (++i < n) map.set(f.call(object, o = object[i], i), o);
    } else {
      for (var key in object) map.set(key, object[key]);
    }
    return map;
  };
  function d3_Map() {
    this._ = Object.create(null);
  }
  var d3_map_proto = "__proto__", d3_map_zero = "\x00";
  d3_class(d3_Map, {
    has: d3_map_has,
    get: function(key) {
      return this._[d3_map_escape(key)];
    },
    set: function(key, value) {
      return this._[d3_map_escape(key)] = value;
    },
    remove: d3_map_remove,
    keys: d3_map_keys,
    values: function() {
      var values = [];
      for (var key in this._) values.push(this._[key]);
      return values;
    },
    entries: function() {
      var entries = [];
      for (var key in this._) entries.push({
        key: d3_map_unescape(key),
        value: this._[key]
      });
      return entries;
    },
    size: d3_map_size,
    empty: d3_map_empty,
    forEach: function(f) {
      for (var key in this._) f.call(this, d3_map_unescape(key), this._[key]);
    }
  });
  function d3_map_escape(key) {
    return (key += "") === d3_map_proto || key[0] === d3_map_zero ? d3_map_zero + key : key;
  }
  function d3_map_unescape(key) {
    return (key += "")[0] === d3_map_zero ? key.slice(1) : key;
  }
  function d3_map_has(key) {
    return d3_map_escape(key) in this._;
  }
  function d3_map_remove(key) {
    return (key = d3_map_escape(key)) in this._ && delete this._[key];
  }
  function d3_map_keys() {
    var keys = [];
    for (var key in this._) keys.push(d3_map_unescape(key));
    return keys;
  }
  function d3_map_size() {
    var size = 0;
    for (var key in this._) ++size;
    return size;
  }
  function d3_map_empty() {
    for (var key in this._) return false;
    return true;
  }
  d3.nest = function() {
    var nest = {}, keys = [], sortKeys = [], sortValues, rollup;
    function map(mapType, array, depth) {
      if (depth >= keys.length) return rollup ? rollup.call(nest, array) : sortValues ? array.sort(sortValues) : array;
      var i = -1, n = array.length, key = keys[depth++], keyValue, object, setter, valuesByKey = new d3_Map(), values;
      while (++i < n) {
        if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
          values.push(object);
        } else {
          valuesByKey.set(keyValue, [ object ]);
        }
      }
      if (mapType) {
        object = mapType();
        setter = function(keyValue, values) {
          object.set(keyValue, map(mapType, values, depth));
        };
      } else {
        object = {};
        setter = function(keyValue, values) {
          object[keyValue] = map(mapType, values, depth);
        };
      }
      valuesByKey.forEach(setter);
      return object;
    }
    function entries(map, depth) {
      if (depth >= keys.length) return map;
      var array = [], sortKey = sortKeys[depth++];
      map.forEach(function(key, keyMap) {
        array.push({
          key: key,
          values: entries(keyMap, depth)
        });
      });
      return sortKey ? array.sort(function(a, b) {
        return sortKey(a.key, b.key);
      }) : array;
    }
    nest.map = function(array, mapType) {
      return map(mapType, array, 0);
    };
    nest.entries = function(array) {
      return entries(map(d3.map, array, 0), 0);
    };
    nest.key = function(d) {
      keys.push(d);
      return nest;
    };
    nest.sortKeys = function(order) {
      sortKeys[keys.length - 1] = order;
      return nest;
    };
    nest.sortValues = function(order) {
      sortValues = order;
      return nest;
    };
    nest.rollup = function(f) {
      rollup = f;
      return nest;
    };
    return nest;
  };
  d3.set = function(array) {
    var set = new d3_Set();
    if (array) for (var i = 0, n = array.length; i < n; ++i) set.add(array[i]);
    return set;
  };
  function d3_Set() {
    this._ = Object.create(null);
  }
  d3_class(d3_Set, {
    has: d3_map_has,
    add: function(key) {
      this._[d3_map_escape(key += "")] = true;
      return key;
    },
    remove: d3_map_remove,
    values: d3_map_keys,
    size: d3_map_size,
    empty: d3_map_empty,
    forEach: function(f) {
      for (var key in this._) f.call(this, d3_map_unescape(key));
    }
  });
  d3.behavior = {};
  function d3_identity(d) {
    return d;
  }
  d3.rebind = function(target, source) {
    var i = 1, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
    return target;
  };
  function d3_rebind(target, source, method) {
    return function() {
      var value = method.apply(source, arguments);
      return value === source ? target : value;
    };
  }
  function d3_vendorSymbol(object, name) {
    if (name in object) return name;
    name = name.charAt(0).toUpperCase() + name.slice(1);
    for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
      var prefixName = d3_vendorPrefixes[i] + name;
      if (prefixName in object) return prefixName;
    }
  }
  var d3_vendorPrefixes = [ "webkit", "ms", "moz", "Moz", "o", "O" ];
  function d3_noop() {}
  d3.dispatch = function() {
    var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
    return dispatch;
  };
  function d3_dispatch() {}
  d3_dispatch.prototype.on = function(type, listener) {
    var i = type.indexOf("."), name = "";
    if (i >= 0) {
      name = type.slice(i + 1);
      type = type.slice(0, i);
    }
    if (type) return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
    if (arguments.length === 2) {
      if (listener == null) for (type in this) {
        if (this.hasOwnProperty(type)) this[type].on(name, null);
      }
      return this;
    }
  };
  function d3_dispatch_event(dispatch) {
    var listeners = [], listenerByName = new d3_Map();
    function event() {
      var z = listeners, i = -1, n = z.length, l;
      while (++i < n) if (l = z[i].on) l.apply(this, arguments);
      return dispatch;
    }
    event.on = function(name, listener) {
      var l = listenerByName.get(name), i;
      if (arguments.length < 2) return l && l.on;
      if (l) {
        l.on = null;
        listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
        listenerByName.remove(name);
      }
      if (listener) listeners.push(listenerByName.set(name, {
        on: listener
      }));
      return dispatch;
    };
    return event;
  }
  d3.event = null;
  function d3_eventPreventDefault() {
    d3.event.preventDefault();
  }
  function d3_eventSource() {
    var e = d3.event, s;
    while (s = e.sourceEvent) e = s;
    return e;
  }
  function d3_eventDispatch(target) {
    var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
    dispatch.of = function(thiz, argumentz) {
      return function(e1) {
        try {
          var e0 = e1.sourceEvent = d3.event;
          e1.target = target;
          d3.event = e1;
          dispatch[e1.type].apply(thiz, argumentz);
        } finally {
          d3.event = e0;
        }
      };
    };
    return dispatch;
  }
  d3.requote = function(s) {
    return s.replace(d3_requote_re, "\\$&");
  };
  var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
  var d3_subclass = {}.__proto__ ? function(object, prototype) {
    object.__proto__ = prototype;
  } : function(object, prototype) {
    for (var property in prototype) object[property] = prototype[property];
  };
  function d3_selection(groups) {
    d3_subclass(groups, d3_selectionPrototype);
    return groups;
  }
  var d3_select = function(s, n) {
    return n.querySelector(s);
  }, d3_selectAll = function(s, n) {
    return n.querySelectorAll(s);
  }, d3_selectMatches = function(n, s) {
    var d3_selectMatcher = n.matches || n[d3_vendorSymbol(n, "matchesSelector")];
    d3_selectMatches = function(n, s) {
      return d3_selectMatcher.call(n, s);
    };
    return d3_selectMatches(n, s);
  };
  if (typeof Sizzle === "function") {
    d3_select = function(s, n) {
      return Sizzle(s, n)[0] || null;
    };
    d3_selectAll = Sizzle;
    d3_selectMatches = Sizzle.matchesSelector;
  }
  d3.selection = function() {
    return d3.select(d3_document.documentElement);
  };
  var d3_selectionPrototype = d3.selection.prototype = [];
  d3_selectionPrototype.select = function(selector) {
    var subgroups = [], subgroup, subnode, group, node;
    selector = d3_selection_selector(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      subgroup.parentNode = (group = this[j]).parentNode;
      for (var i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroup.push(subnode = selector.call(node, node.__data__, i, j));
          if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_selector(selector) {
    return typeof selector === "function" ? selector : function() {
      return d3_select(selector, this);
    };
  }
  d3_selectionPrototype.selectAll = function(selector) {
    var subgroups = [], subgroup, node;
    selector = d3_selection_selectorAll(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i, j)));
          subgroup.parentNode = node;
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_selectorAll(selector) {
    return typeof selector === "function" ? selector : function() {
      return d3_selectAll(selector, this);
    };
  }
  var d3_nsXhtml = "http://www.w3.org/1999/xhtml";
  var d3_nsPrefix = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: d3_nsXhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };
  d3.ns = {
    prefix: d3_nsPrefix,
    qualify: function(name) {
      var i = name.indexOf(":"), prefix = name;
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      return d3_nsPrefix.hasOwnProperty(prefix) ? {
        space: d3_nsPrefix[prefix],
        local: name
      } : name;
    }
  };
  d3_selectionPrototype.attr = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") {
        var node = this.node();
        name = d3.ns.qualify(name);
        return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
      }
      for (value in name) this.each(d3_selection_attr(value, name[value]));
      return this;
    }
    return this.each(d3_selection_attr(name, value));
  };
  function d3_selection_attr(name, value) {
    name = d3.ns.qualify(name);
    function attrNull() {
      this.removeAttribute(name);
    }
    function attrNullNS() {
      this.removeAttributeNS(name.space, name.local);
    }
    function attrConstant() {
      this.setAttribute(name, value);
    }
    function attrConstantNS() {
      this.setAttributeNS(name.space, name.local, value);
    }
    function attrFunction() {
      var x = value.apply(this, arguments);
      if (x == null) this.removeAttribute(name); else this.setAttribute(name, x);
    }
    function attrFunctionNS() {
      var x = value.apply(this, arguments);
      if (x == null) this.removeAttributeNS(name.space, name.local); else this.setAttributeNS(name.space, name.local, x);
    }
    return value == null ? name.local ? attrNullNS : attrNull : typeof value === "function" ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
  }
  function d3_collapse(s) {
    return s.trim().replace(/\s+/g, " ");
  }
  d3_selectionPrototype.classed = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") {
        var node = this.node(), n = (name = d3_selection_classes(name)).length, i = -1;
        if (value = node.classList) {
          while (++i < n) if (!value.contains(name[i])) return false;
        } else {
          value = node.getAttribute("class");
          while (++i < n) if (!d3_selection_classedRe(name[i]).test(value)) return false;
        }
        return true;
      }
      for (value in name) this.each(d3_selection_classed(value, name[value]));
      return this;
    }
    return this.each(d3_selection_classed(name, value));
  };
  function d3_selection_classedRe(name) {
    return new RegExp("(?:^|\\s+)" + d3.requote(name) + "(?:\\s+|$)", "g");
  }
  function d3_selection_classes(name) {
    return (name + "").trim().split(/^|\s+/);
  }
  function d3_selection_classed(name, value) {
    name = d3_selection_classes(name).map(d3_selection_classedName);
    var n = name.length;
    function classedConstant() {
      var i = -1;
      while (++i < n) name[i](this, value);
    }
    function classedFunction() {
      var i = -1, x = value.apply(this, arguments);
      while (++i < n) name[i](this, x);
    }
    return typeof value === "function" ? classedFunction : classedConstant;
  }
  function d3_selection_classedName(name) {
    var re = d3_selection_classedRe(name);
    return function(node, value) {
      if (c = node.classList) return value ? c.add(name) : c.remove(name);
      var c = node.getAttribute("class") || "";
      if (value) {
        re.lastIndex = 0;
        if (!re.test(c)) node.setAttribute("class", d3_collapse(c + " " + name));
      } else {
        node.setAttribute("class", d3_collapse(c.replace(re, " ")));
      }
    };
  }
  d3_selectionPrototype.style = function(name, value, priority) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof name !== "string") {
        if (n < 2) value = "";
        for (priority in name) this.each(d3_selection_style(priority, name[priority], value));
        return this;
      }
      if (n < 2) {
        var node = this.node();
        return d3_window(node).getComputedStyle(node, null).getPropertyValue(name);
      }
      priority = "";
    }
    return this.each(d3_selection_style(name, value, priority));
  };
  function d3_selection_style(name, value, priority) {
    function styleNull() {
      this.style.removeProperty(name);
    }
    function styleConstant() {
      this.style.setProperty(name, value, priority);
    }
    function styleFunction() {
      var x = value.apply(this, arguments);
      if (x == null) this.style.removeProperty(name); else this.style.setProperty(name, x, priority);
    }
    return value == null ? styleNull : typeof value === "function" ? styleFunction : styleConstant;
  }
  d3_selectionPrototype.property = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") return this.node()[name];
      for (value in name) this.each(d3_selection_property(value, name[value]));
      return this;
    }
    return this.each(d3_selection_property(name, value));
  };
  function d3_selection_property(name, value) {
    function propertyNull() {
      delete this[name];
    }
    function propertyConstant() {
      this[name] = value;
    }
    function propertyFunction() {
      var x = value.apply(this, arguments);
      if (x == null) delete this[name]; else this[name] = x;
    }
    return value == null ? propertyNull : typeof value === "function" ? propertyFunction : propertyConstant;
  }
  d3_selectionPrototype.text = function(value) {
    return arguments.length ? this.each(typeof value === "function" ? function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    } : value == null ? function() {
      this.textContent = "";
    } : function() {
      this.textContent = value;
    }) : this.node().textContent;
  };
  d3_selectionPrototype.html = function(value) {
    return arguments.length ? this.each(typeof value === "function" ? function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    } : value == null ? function() {
      this.innerHTML = "";
    } : function() {
      this.innerHTML = value;
    }) : this.node().innerHTML;
  };
  d3_selectionPrototype.append = function(name) {
    name = d3_selection_creator(name);
    return this.select(function() {
      return this.appendChild(name.apply(this, arguments));
    });
  };
  function d3_selection_creator(name) {
    function create() {
      var document = this.ownerDocument, namespace = this.namespaceURI;
      return namespace === d3_nsXhtml && document.documentElement.namespaceURI === d3_nsXhtml ? document.createElement(name) : document.createElementNS(namespace, name);
    }
    function createNS() {
      return this.ownerDocument.createElementNS(name.space, name.local);
    }
    return typeof name === "function" ? name : (name = d3.ns.qualify(name)).local ? createNS : create;
  }
  d3_selectionPrototype.insert = function(name, before) {
    name = d3_selection_creator(name);
    before = d3_selection_selector(before);
    return this.select(function() {
      return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments) || null);
    });
  };
  d3_selectionPrototype.remove = function() {
    return this.each(d3_selectionRemove);
  };
  function d3_selectionRemove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }
  d3_selectionPrototype.data = function(value, key) {
    var i = -1, n = this.length, group, node;
    if (!arguments.length) {
      value = new Array(n = (group = this[0]).length);
      while (++i < n) {
        if (node = group[i]) {
          value[i] = node.__data__;
        }
      }
      return value;
    }
    function bind(group, groupData) {
      var i, n = group.length, m = groupData.length, n0 = Math.min(n, m), updateNodes = new Array(m), enterNodes = new Array(m), exitNodes = new Array(n), node, nodeData;
      if (key) {
        var nodeByKeyValue = new d3_Map(), keyValues = new Array(n), keyValue;
        for (i = -1; ++i < n; ) {
          if (node = group[i]) {
            if (nodeByKeyValue.has(keyValue = key.call(node, node.__data__, i))) {
              exitNodes[i] = node;
            } else {
              nodeByKeyValue.set(keyValue, node);
            }
            keyValues[i] = keyValue;
          }
        }
        for (i = -1; ++i < m; ) {
          if (!(node = nodeByKeyValue.get(keyValue = key.call(groupData, nodeData = groupData[i], i)))) {
            enterNodes[i] = d3_selection_dataNode(nodeData);
          } else if (node !== true) {
            updateNodes[i] = node;
            node.__data__ = nodeData;
          }
          nodeByKeyValue.set(keyValue, true);
        }
        for (i = -1; ++i < n; ) {
          if (i in keyValues && nodeByKeyValue.get(keyValues[i]) !== true) {
            exitNodes[i] = group[i];
          }
        }
      } else {
        for (i = -1; ++i < n0; ) {
          node = group[i];
          nodeData = groupData[i];
          if (node) {
            node.__data__ = nodeData;
            updateNodes[i] = node;
          } else {
            enterNodes[i] = d3_selection_dataNode(nodeData);
          }
        }
        for (;i < m; ++i) {
          enterNodes[i] = d3_selection_dataNode(groupData[i]);
        }
        for (;i < n; ++i) {
          exitNodes[i] = group[i];
        }
      }
      enterNodes.update = updateNodes;
      enterNodes.parentNode = updateNodes.parentNode = exitNodes.parentNode = group.parentNode;
      enter.push(enterNodes);
      update.push(updateNodes);
      exit.push(exitNodes);
    }
    var enter = d3_selection_enter([]), update = d3_selection([]), exit = d3_selection([]);
    if (typeof value === "function") {
      while (++i < n) {
        bind(group = this[i], value.call(group, group.parentNode.__data__, i));
      }
    } else {
      while (++i < n) {
        bind(group = this[i], value);
      }
    }
    update.enter = function() {
      return enter;
    };
    update.exit = function() {
      return exit;
    };
    return update;
  };
  function d3_selection_dataNode(data) {
    return {
      __data__: data
    };
  }
  d3_selectionPrototype.datum = function(value) {
    return arguments.length ? this.property("__data__", value) : this.property("__data__");
  };
  d3_selectionPrototype.filter = function(filter) {
    var subgroups = [], subgroup, group, node;
    if (typeof filter !== "function") filter = d3_selection_filter(filter);
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      subgroup.parentNode = (group = this[j]).parentNode;
      for (var i = 0, n = group.length; i < n; i++) {
        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
          subgroup.push(node);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_filter(selector) {
    return function() {
      return d3_selectMatches(this, selector);
    };
  }
  d3_selectionPrototype.order = function() {
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
        if (node = group[i]) {
          if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  };
  d3_selectionPrototype.sort = function(comparator) {
    comparator = d3_selection_sortComparator.apply(this, arguments);
    for (var j = -1, m = this.length; ++j < m; ) this[j].sort(comparator);
    return this.order();
  };
  function d3_selection_sortComparator(comparator) {
    if (!arguments.length) comparator = d3_ascending;
    return function(a, b) {
      return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
    };
  }
  d3_selectionPrototype.each = function(callback) {
    return d3_selection_each(this, function(node, i, j) {
      callback.call(node, node.__data__, i, j);
    });
  };
  function d3_selection_each(groups, callback) {
    for (var j = 0, m = groups.length; j < m; j++) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
        if (node = group[i]) callback(node, i, j);
      }
    }
    return groups;
  }
  d3_selectionPrototype.call = function(callback) {
    var args = d3_array(arguments);
    callback.apply(args[0] = this, args);
    return this;
  };
  d3_selectionPrototype.empty = function() {
    return !this.node();
  };
  d3_selectionPrototype.node = function() {
    for (var j = 0, m = this.length; j < m; j++) {
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        var node = group[i];
        if (node) return node;
      }
    }
    return null;
  };
  d3_selectionPrototype.size = function() {
    var n = 0;
    d3_selection_each(this, function() {
      ++n;
    });
    return n;
  };
  function d3_selection_enter(selection) {
    d3_subclass(selection, d3_selection_enterPrototype);
    return selection;
  }
  var d3_selection_enterPrototype = [];
  d3.selection.enter = d3_selection_enter;
  d3.selection.enter.prototype = d3_selection_enterPrototype;
  d3_selection_enterPrototype.append = d3_selectionPrototype.append;
  d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
  d3_selection_enterPrototype.node = d3_selectionPrototype.node;
  d3_selection_enterPrototype.call = d3_selectionPrototype.call;
  d3_selection_enterPrototype.size = d3_selectionPrototype.size;
  d3_selection_enterPrototype.select = function(selector) {
    var subgroups = [], subgroup, subnode, upgroup, group, node;
    for (var j = -1, m = this.length; ++j < m; ) {
      upgroup = (group = this[j]).update;
      subgroups.push(subgroup = []);
      subgroup.parentNode = group.parentNode;
      for (var i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i, j));
          subnode.__data__ = node.__data__;
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_selection(subgroups);
  };
  d3_selection_enterPrototype.insert = function(name, before) {
    if (arguments.length < 2) before = d3_selection_enterInsertBefore(this);
    return d3_selectionPrototype.insert.call(this, name, before);
  };
  function d3_selection_enterInsertBefore(enter) {
    var i0, j0;
    return function(d, i, j) {
      var group = enter[j].update, n = group.length, node;
      if (j != j0) j0 = j, i0 = 0;
      if (i >= i0) i0 = i + 1;
      while (!(node = group[i0]) && ++i0 < n) ;
      return node;
    };
  }
  d3.select = function(node) {
    var group;
    if (typeof node === "string") {
      group = [ d3_select(node, d3_document) ];
      group.parentNode = d3_document.documentElement;
    } else {
      group = [ node ];
      group.parentNode = d3_documentElement(node);
    }
    return d3_selection([ group ]);
  };
  d3.selectAll = function(nodes) {
    var group;
    if (typeof nodes === "string") {
      group = d3_array(d3_selectAll(nodes, d3_document));
      group.parentNode = d3_document.documentElement;
    } else {
      group = d3_array(nodes);
      group.parentNode = null;
    }
    return d3_selection([ group ]);
  };
  d3_selectionPrototype.on = function(type, listener, capture) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof type !== "string") {
        if (n < 2) listener = false;
        for (capture in type) this.each(d3_selection_on(capture, type[capture], listener));
        return this;
      }
      if (n < 2) return (n = this.node()["__on" + type]) && n._;
      capture = false;
    }
    return this.each(d3_selection_on(type, listener, capture));
  };
  function d3_selection_on(type, listener, capture) {
    var name = "__on" + type, i = type.indexOf("."), wrap = d3_selection_onListener;
    if (i > 0) type = type.slice(0, i);
    var filter = d3_selection_onFilters.get(type);
    if (filter) type = filter, wrap = d3_selection_onFilter;
    function onRemove() {
      var l = this[name];
      if (l) {
        this.removeEventListener(type, l, l.$);
        delete this[name];
      }
    }
    function onAdd() {
      var l = wrap(listener, d3_array(arguments));
      onRemove.call(this);
      this.addEventListener(type, this[name] = l, l.$ = capture);
      l._ = listener;
    }
    function removeAll() {
      var re = new RegExp("^__on([^.]+)" + d3.requote(type) + "$"), match;
      for (var name in this) {
        if (match = name.match(re)) {
          var l = this[name];
          this.removeEventListener(match[1], l, l.$);
          delete this[name];
        }
      }
    }
    return i ? listener ? onAdd : onRemove : listener ? d3_noop : removeAll;
  }
  var d3_selection_onFilters = d3.map({
    mouseenter: "mouseover",
    mouseleave: "mouseout"
  });
  if (d3_document) {
    d3_selection_onFilters.forEach(function(k) {
      if ("on" + k in d3_document) d3_selection_onFilters.remove(k);
    });
  }
  function d3_selection_onListener(listener, argumentz) {
    return function(e) {
      var o = d3.event;
      d3.event = e;
      argumentz[0] = this.__data__;
      try {
        listener.apply(this, argumentz);
      } finally {
        d3.event = o;
      }
    };
  }
  function d3_selection_onFilter(listener, argumentz) {
    var l = d3_selection_onListener(listener, argumentz);
    return function(e) {
      var target = this, related = e.relatedTarget;
      if (!related || related !== target && !(related.compareDocumentPosition(target) & 8)) {
        l.call(target, e);
      }
    };
  }
  var d3_event_dragSelect, d3_event_dragId = 0;
  function d3_event_dragSuppress(node) {
    var name = ".dragsuppress-" + ++d3_event_dragId, click = "click" + name, w = d3.select(d3_window(node)).on("touchmove" + name, d3_eventPreventDefault).on("dragstart" + name, d3_eventPreventDefault).on("selectstart" + name, d3_eventPreventDefault);
    if (d3_event_dragSelect == null) {
      d3_event_dragSelect = "onselectstart" in node ? false : d3_vendorSymbol(node.style, "userSelect");
    }
    if (d3_event_dragSelect) {
      var style = d3_documentElement(node).style, select = style[d3_event_dragSelect];
      style[d3_event_dragSelect] = "none";
    }
    return function(suppressClick) {
      w.on(name, null);
      if (d3_event_dragSelect) style[d3_event_dragSelect] = select;
      if (suppressClick) {
        var off = function() {
          w.on(click, null);
        };
        w.on(click, function() {
          d3_eventPreventDefault();
          off();
        }, true);
        setTimeout(off, 0);
      }
    };
  }
  d3.mouse = function(container) {
    return d3_mousePoint(container, d3_eventSource());
  };
  var d3_mouse_bug44083 = this.navigator && /WebKit/.test(this.navigator.userAgent) ? -1 : 0;
  function d3_mousePoint(container, e) {
    if (e.changedTouches) e = e.changedTouches[0];
    var svg = container.ownerSVGElement || container;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      if (d3_mouse_bug44083 < 0) {
        var window = d3_window(container);
        if (window.scrollX || window.scrollY) {
          svg = d3.select("body").append("svg").style({
            position: "absolute",
            top: 0,
            left: 0,
            margin: 0,
            padding: 0,
            border: "none"
          }, "important");
          var ctm = svg[0][0].getScreenCTM();
          d3_mouse_bug44083 = !(ctm.f || ctm.e);
          svg.remove();
        }
      }
      if (d3_mouse_bug44083) point.x = e.pageX, point.y = e.pageY; else point.x = e.clientX, 
      point.y = e.clientY;
      point = point.matrixTransform(container.getScreenCTM().inverse());
      return [ point.x, point.y ];
    }
    var rect = container.getBoundingClientRect();
    return [ e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop ];
  }
  d3.touch = function(container, touches, identifier) {
    if (arguments.length < 3) identifier = touches, touches = d3_eventSource().changedTouches;
    if (touches) for (var i = 0, n = touches.length, touch; i < n; ++i) {
      if ((touch = touches[i]).identifier === identifier) {
        return d3_mousePoint(container, touch);
      }
    }
  };
  d3.behavior.drag = function() {
    var event = d3_eventDispatch(drag, "drag", "dragstart", "dragend"), origin = null, mousedown = dragstart(d3_noop, d3.mouse, d3_window, "mousemove", "mouseup"), touchstart = dragstart(d3_behavior_dragTouchId, d3.touch, d3_identity, "touchmove", "touchend");
    function drag() {
      this.on("mousedown.drag", mousedown).on("touchstart.drag", touchstart);
    }
    function dragstart(id, position, subject, move, end) {
      return function() {
        var that = this, target = d3.event.target.correspondingElement || d3.event.target, parent = that.parentNode, dispatch = event.of(that, arguments), dragged = 0, dragId = id(), dragName = ".drag" + (dragId == null ? "" : "-" + dragId), dragOffset, dragSubject = d3.select(subject(target)).on(move + dragName, moved).on(end + dragName, ended), dragRestore = d3_event_dragSuppress(target), position0 = position(parent, dragId);
        if (origin) {
          dragOffset = origin.apply(that, arguments);
          dragOffset = [ dragOffset.x - position0[0], dragOffset.y - position0[1] ];
        } else {
          dragOffset = [ 0, 0 ];
        }
        dispatch({
          type: "dragstart"
        });
        function moved() {
          var position1 = position(parent, dragId), dx, dy;
          if (!position1) return;
          dx = position1[0] - position0[0];
          dy = position1[1] - position0[1];
          dragged |= dx | dy;
          position0 = position1;
          dispatch({
            type: "drag",
            x: position1[0] + dragOffset[0],
            y: position1[1] + dragOffset[1],
            dx: dx,
            dy: dy
          });
        }
        function ended() {
          if (!position(parent, dragId)) return;
          dragSubject.on(move + dragName, null).on(end + dragName, null);
          dragRestore(dragged);
          dispatch({
            type: "dragend"
          });
        }
      };
    }
    drag.origin = function(x) {
      if (!arguments.length) return origin;
      origin = x;
      return drag;
    };
    return d3.rebind(drag, event, "on");
  };
  function d3_behavior_dragTouchId() {
    return d3.event.changedTouches[0].identifier;
  }
  d3.touches = function(container, touches) {
    if (arguments.length < 2) touches = d3_eventSource().touches;
    return touches ? d3_array(touches).map(function(touch) {
      var point = d3_mousePoint(container, touch);
      point.identifier = touch.identifier;
      return point;
    }) : [];
  };
  var epsilon = 1e-6, epsilon2 = epsilon * epsilon, PI = Math.PI, tau = 2 * PI, tauepsilon = tau - epsilon, halfPI = PI / 2, d3_radians = PI / 180, d3_degrees = 180 / PI;
  function d3_sgn(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  }
  function d3_cross2d(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  }
  function d3_acos(x) {
    return x > 1 ? 0 : x < -1 ? PI : Math.acos(x);
  }
  function d3_asin(x) {
    return x > 1 ? halfPI : x < -1 ? -halfPI : Math.asin(x);
  }
  function d3_sinh(x) {
    return ((x = Math.exp(x)) - 1 / x) / 2;
  }
  function d3_cosh(x) {
    return ((x = Math.exp(x)) + 1 / x) / 2;
  }
  function d3_tanh(x) {
    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
  }
  function d3_haversin(x) {
    return (x = Math.sin(x / 2)) * x;
  }
  var rho = Math.SQRT2, rho2 = 2, rho4 = 4;
  d3.interpolateZoom = function(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [ ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S) ];
      };
    } else {
      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S, coshr0 = d3_cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * d3_tanh(rho * s + r0) - d3_sinh(r0));
        return [ ux0 + u * dx, uy0 + u * dy, w0 * coshr0 / d3_cosh(rho * s + r0) ];
      };
    }
    i.duration = S * 1e3;
    return i;
  };
  d3.behavior.zoom = function() {
    var view = {
      x: 0,
      y: 0,
      k: 1
    }, translate0, center0, center, size = [ 960, 500 ], scaleExtent = d3_behavior_zoomInfinity, duration = 250, zooming = 0, mousedown = "mousedown.zoom", mousemove = "mousemove.zoom", mouseup = "mouseup.zoom", mousewheelTimer, touchstart = "touchstart.zoom", touchtime, event = d3_eventDispatch(zoom, "zoomstart", "zoom", "zoomend"), x0, x1, y0, y1;
    if (!d3_behavior_zoomWheel) {
      d3_behavior_zoomWheel = "onwheel" in d3_document ? (d3_behavior_zoomDelta = function() {
        return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1);
      }, "wheel") : "onmousewheel" in d3_document ? (d3_behavior_zoomDelta = function() {
        return d3.event.wheelDelta;
      }, "mousewheel") : (d3_behavior_zoomDelta = function() {
        return -d3.event.detail;
      }, "MozMousePixelScroll");
    }
    function zoom(g) {
      g.on(mousedown, mousedowned).on(d3_behavior_zoomWheel + ".zoom", mousewheeled).on("dblclick.zoom", dblclicked).on(touchstart, touchstarted);
    }
    zoom.event = function(g) {
      g.each(function() {
        var dispatch = event.of(this, arguments), view1 = view;
        if (d3_transitionInheritId) {
          d3.select(this).transition().each("start.zoom", function() {
            view = this.__chart__ || {
              x: 0,
              y: 0,
              k: 1
            };
            zoomstarted(dispatch);
          }).tween("zoom:zoom", function() {
            var dx = size[0], dy = size[1], cx = center0 ? center0[0] : dx / 2, cy = center0 ? center0[1] : dy / 2, i = d3.interpolateZoom([ (cx - view.x) / view.k, (cy - view.y) / view.k, dx / view.k ], [ (cx - view1.x) / view1.k, (cy - view1.y) / view1.k, dx / view1.k ]);
            return function(t) {
              var l = i(t), k = dx / l[2];
              this.__chart__ = view = {
                x: cx - l[0] * k,
                y: cy - l[1] * k,
                k: k
              };
              zoomed(dispatch);
            };
          }).each("interrupt.zoom", function() {
            zoomended(dispatch);
          }).each("end.zoom", function() {
            zoomended(dispatch);
          });
        } else {
          this.__chart__ = view;
          zoomstarted(dispatch);
          zoomed(dispatch);
          zoomended(dispatch);
        }
      });
    };
    zoom.translate = function(_) {
      if (!arguments.length) return [ view.x, view.y ];
      view = {
        x: +_[0],
        y: +_[1],
        k: view.k
      };
      rescale();
      return zoom;
    };
    zoom.scale = function(_) {
      if (!arguments.length) return view.k;
      view = {
        x: view.x,
        y: view.y,
        k: null
      };
      scaleTo(+_);
      rescale();
      return zoom;
    };
    zoom.scaleExtent = function(_) {
      if (!arguments.length) return scaleExtent;
      scaleExtent = _ == null ? d3_behavior_zoomInfinity : [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.center = function(_) {
      if (!arguments.length) return center;
      center = _ && [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.size = function(_) {
      if (!arguments.length) return size;
      size = _ && [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.duration = function(_) {
      if (!arguments.length) return duration;
      duration = +_;
      return zoom;
    };
    zoom.x = function(z) {
      if (!arguments.length) return x1;
      x1 = z;
      x0 = z.copy();
      view = {
        x: 0,
        y: 0,
        k: 1
      };
      return zoom;
    };
    zoom.y = function(z) {
      if (!arguments.length) return y1;
      y1 = z;
      y0 = z.copy();
      view = {
        x: 0,
        y: 0,
        k: 1
      };
      return zoom;
    };
    function location(p) {
      return [ (p[0] - view.x) / view.k, (p[1] - view.y) / view.k ];
    }
    function point(l) {
      return [ l[0] * view.k + view.x, l[1] * view.k + view.y ];
    }
    function scaleTo(s) {
      view.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
    }
    function translateTo(p, l) {
      l = point(l);
      view.x += p[0] - l[0];
      view.y += p[1] - l[1];
    }
    function zoomTo(that, p, l, k) {
      that.__chart__ = {
        x: view.x,
        y: view.y,
        k: view.k
      };
      scaleTo(Math.pow(2, k));
      translateTo(center0 = p, l);
      that = d3.select(that);
      if (duration > 0) that = that.transition().duration(duration);
      that.call(zoom.event);
    }
    function rescale() {
      if (x1) x1.domain(x0.range().map(function(x) {
        return (x - view.x) / view.k;
      }).map(x0.invert));
      if (y1) y1.domain(y0.range().map(function(y) {
        return (y - view.y) / view.k;
      }).map(y0.invert));
    }
    function zoomstarted(dispatch) {
      if (!zooming++) dispatch({
        type: "zoomstart"
      });
    }
    function zoomed(dispatch) {
      rescale();
      dispatch({
        type: "zoom",
        scale: view.k,
        translate: [ view.x, view.y ]
      });
    }
    function zoomended(dispatch) {
      if (!--zooming) dispatch({
        type: "zoomend"
      }), center0 = null;
    }
    function mousedowned() {
      var that = this, dispatch = event.of(that, arguments), dragged = 0, subject = d3.select(d3_window(that)).on(mousemove, moved).on(mouseup, ended), location0 = location(d3.mouse(that)), dragRestore = d3_event_dragSuppress(that);
      d3_selection_interrupt.call(that);
      zoomstarted(dispatch);
      function moved() {
        dragged = 1;
        translateTo(d3.mouse(that), location0);
        zoomed(dispatch);
      }
      function ended() {
        subject.on(mousemove, null).on(mouseup, null);
        dragRestore(dragged);
        zoomended(dispatch);
      }
    }
    function touchstarted() {
      var that = this, dispatch = event.of(that, arguments), locations0 = {}, distance0 = 0, scale0, zoomName = ".zoom-" + d3.event.changedTouches[0].identifier, touchmove = "touchmove" + zoomName, touchend = "touchend" + zoomName, targets = [], subject = d3.select(that), dragRestore = d3_event_dragSuppress(that);
      started();
      zoomstarted(dispatch);
      subject.on(mousedown, null).on(touchstart, started);
      function relocate() {
        var touches = d3.touches(that);
        scale0 = view.k;
        touches.forEach(function(t) {
          if (t.identifier in locations0) locations0[t.identifier] = location(t);
        });
        return touches;
      }
      function started() {
        var target = d3.event.target;
        d3.select(target).on(touchmove, moved).on(touchend, ended);
        targets.push(target);
        var changed = d3.event.changedTouches;
        for (var i = 0, n = changed.length; i < n; ++i) {
          locations0[changed[i].identifier] = null;
        }
        var touches = relocate(), now = Date.now();
        if (touches.length === 1) {
          if (now - touchtime < 500) {
            var p = touches[0];
            zoomTo(that, p, locations0[p.identifier], Math.floor(Math.log(view.k) / Math.LN2) + 1);
            d3_eventPreventDefault();
          }
          touchtime = now;
        } else if (touches.length > 1) {
          var p = touches[0], q = touches[1], dx = p[0] - q[0], dy = p[1] - q[1];
          distance0 = dx * dx + dy * dy;
        }
      }
      function moved() {
        var touches = d3.touches(that), p0, l0, p1, l1;
        d3_selection_interrupt.call(that);
        for (var i = 0, n = touches.length; i < n; ++i, l1 = null) {
          p1 = touches[i];
          if (l1 = locations0[p1.identifier]) {
            if (l0) break;
            p0 = p1, l0 = l1;
          }
        }
        if (l1) {
          var distance1 = (distance1 = p1[0] - p0[0]) * distance1 + (distance1 = p1[1] - p0[1]) * distance1, scale1 = distance0 && Math.sqrt(distance1 / distance0);
          p0 = [ (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 ];
          l0 = [ (l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2 ];
          scaleTo(scale1 * scale0);
        }
        touchtime = null;
        translateTo(p0, l0);
        zoomed(dispatch);
      }
      function ended() {
        if (d3.event.touches.length) {
          var changed = d3.event.changedTouches;
          for (var i = 0, n = changed.length; i < n; ++i) {
            delete locations0[changed[i].identifier];
          }
          for (var identifier in locations0) {
            return void relocate();
          }
        }
        d3.selectAll(targets).on(zoomName, null);
        subject.on(mousedown, mousedowned).on(touchstart, touchstarted);
        dragRestore();
        zoomended(dispatch);
      }
    }
    function mousewheeled() {
      var dispatch = event.of(this, arguments);
      if (mousewheelTimer) clearTimeout(mousewheelTimer); else d3_selection_interrupt.call(this), 
      translate0 = location(center0 = center || d3.mouse(this)), zoomstarted(dispatch);
      mousewheelTimer = setTimeout(function() {
        mousewheelTimer = null;
        zoomended(dispatch);
      }, 50);
      d3_eventPreventDefault();
      scaleTo(Math.pow(2, d3_behavior_zoomDelta() * .002) * view.k);
      translateTo(center0, translate0);
      zoomed(dispatch);
    }
    function dblclicked() {
      var p = d3.mouse(this), k = Math.log(view.k) / Math.LN2;
      zoomTo(this, p, location(p), d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1);
    }
    return d3.rebind(zoom, event, "on");
  };
  var d3_behavior_zoomInfinity = [ 0, Infinity ], d3_behavior_zoomDelta, d3_behavior_zoomWheel;
  d3.color = d3_color;
  function d3_color() {}
  d3_color.prototype.toString = function() {
    return this.rgb() + "";
  };
  d3.hsl = d3_hsl;
  function d3_hsl(h, s, l) {
    return this instanceof d3_hsl ? void (this.h = +h, this.s = +s, this.l = +l) : arguments.length < 2 ? h instanceof d3_hsl ? new d3_hsl(h.h, h.s, h.l) : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl) : new d3_hsl(h, s, l);
  }
  var d3_hslPrototype = d3_hsl.prototype = new d3_color();
  d3_hslPrototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return new d3_hsl(this.h, this.s, this.l / k);
  };
  d3_hslPrototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return new d3_hsl(this.h, this.s, k * this.l);
  };
  d3_hslPrototype.rgb = function() {
    return d3_hsl_rgb(this.h, this.s, this.l);
  };
  function d3_hsl_rgb(h, s, l) {
    var m1, m2;
    h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
    s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
    l = l < 0 ? 0 : l > 1 ? 1 : l;
    m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
    m1 = 2 * l - m2;
    function v(h) {
      if (h > 360) h -= 360; else if (h < 0) h += 360;
      if (h < 60) return m1 + (m2 - m1) * h / 60;
      if (h < 180) return m2;
      if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
      return m1;
    }
    function vv(h) {
      return Math.round(v(h) * 255);
    }
    return new d3_rgb(vv(h + 120), vv(h), vv(h - 120));
  }
  d3.hcl = d3_hcl;
  function d3_hcl(h, c, l) {
    return this instanceof d3_hcl ? void (this.h = +h, this.c = +c, this.l = +l) : arguments.length < 2 ? h instanceof d3_hcl ? new d3_hcl(h.h, h.c, h.l) : h instanceof d3_lab ? d3_lab_hcl(h.l, h.a, h.b) : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b) : new d3_hcl(h, c, l);
  }
  var d3_hclPrototype = d3_hcl.prototype = new d3_color();
  d3_hclPrototype.brighter = function(k) {
    return new d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
  };
  d3_hclPrototype.darker = function(k) {
    return new d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
  };
  d3_hclPrototype.rgb = function() {
    return d3_hcl_lab(this.h, this.c, this.l).rgb();
  };
  function d3_hcl_lab(h, c, l) {
    if (isNaN(h)) h = 0;
    if (isNaN(c)) c = 0;
    return new d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
  }
  d3.lab = d3_lab;
  function d3_lab(l, a, b) {
    return this instanceof d3_lab ? void (this.l = +l, this.a = +a, this.b = +b) : arguments.length < 2 ? l instanceof d3_lab ? new d3_lab(l.l, l.a, l.b) : l instanceof d3_hcl ? d3_hcl_lab(l.h, l.c, l.l) : d3_rgb_lab((l = d3_rgb(l)).r, l.g, l.b) : new d3_lab(l, a, b);
  }
  var d3_lab_K = 18;
  var d3_lab_X = .95047, d3_lab_Y = 1, d3_lab_Z = 1.08883;
  var d3_labPrototype = d3_lab.prototype = new d3_color();
  d3_labPrototype.brighter = function(k) {
    return new d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
  };
  d3_labPrototype.darker = function(k) {
    return new d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
  };
  d3_labPrototype.rgb = function() {
    return d3_lab_rgb(this.l, this.a, this.b);
  };
  function d3_lab_rgb(l, a, b) {
    var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
    x = d3_lab_xyz(x) * d3_lab_X;
    y = d3_lab_xyz(y) * d3_lab_Y;
    z = d3_lab_xyz(z) * d3_lab_Z;
    return new d3_rgb(d3_xyz_rgb(3.2404542 * x - 1.5371385 * y - .4985314 * z), d3_xyz_rgb(-.969266 * x + 1.8760108 * y + .041556 * z), d3_xyz_rgb(.0556434 * x - .2040259 * y + 1.0572252 * z));
  }
  function d3_lab_hcl(l, a, b) {
    return l > 0 ? new d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l) : new d3_hcl(NaN, NaN, l);
  }
  function d3_lab_xyz(x) {
    return x > .206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
  }
  function d3_xyz_lab(x) {
    return x > .008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
  }
  function d3_xyz_rgb(r) {
    return Math.round(255 * (r <= .00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - .055));
  }
  d3.rgb = d3_rgb;
  function d3_rgb(r, g, b) {
    return this instanceof d3_rgb ? void (this.r = ~~r, this.g = ~~g, this.b = ~~b) : arguments.length < 2 ? r instanceof d3_rgb ? new d3_rgb(r.r, r.g, r.b) : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb) : new d3_rgb(r, g, b);
  }
  function d3_rgbNumber(value) {
    return new d3_rgb(value >> 16, value >> 8 & 255, value & 255);
  }
  function d3_rgbString(value) {
    return d3_rgbNumber(value) + "";
  }
  var d3_rgbPrototype = d3_rgb.prototype = new d3_color();
  d3_rgbPrototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    var r = this.r, g = this.g, b = this.b, i = 30;
    if (!r && !g && !b) return new d3_rgb(i, i, i);
    if (r && r < i) r = i;
    if (g && g < i) g = i;
    if (b && b < i) b = i;
    return new d3_rgb(Math.min(255, r / k), Math.min(255, g / k), Math.min(255, b / k));
  };
  d3_rgbPrototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return new d3_rgb(k * this.r, k * this.g, k * this.b);
  };
  d3_rgbPrototype.hsl = function() {
    return d3_rgb_hsl(this.r, this.g, this.b);
  };
  d3_rgbPrototype.toString = function() {
    return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
  };
  function d3_rgb_hex(v) {
    return v < 16 ? "0" + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
  }
  function d3_rgb_parse(format, rgb, hsl) {
    var r = 0, g = 0, b = 0, m1, m2, color;
    m1 = /([a-z]+)\((.*)\)/.exec(format = format.toLowerCase());
    if (m1) {
      m2 = m1[2].split(",");
      switch (m1[1]) {
       case "hsl":
        {
          return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
        }

       case "rgb":
        {
          return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]));
        }
      }
    }
    if (color = d3_rgb_names.get(format)) {
      return rgb(color.r, color.g, color.b);
    }
    if (format != null && format.charAt(0) === "#" && !isNaN(color = parseInt(format.slice(1), 16))) {
      if (format.length === 4) {
        r = (color & 3840) >> 4;
        r = r >> 4 | r;
        g = color & 240;
        g = g >> 4 | g;
        b = color & 15;
        b = b << 4 | b;
      } else if (format.length === 7) {
        r = (color & 16711680) >> 16;
        g = (color & 65280) >> 8;
        b = color & 255;
      }
    }
    return rgb(r, g, b);
  }
  function d3_rgb_hsl(r, g, b) {
    var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
    if (d) {
      s = l < .5 ? d / (max + min) : d / (2 - max - min);
      if (r == max) h = (g - b) / d + (g < b ? 6 : 0); else if (g == max) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60;
    } else {
      h = NaN;
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new d3_hsl(h, s, l);
  }
  function d3_rgb_lab(r, g, b) {
    r = d3_rgb_xyz(r);
    g = d3_rgb_xyz(g);
    b = d3_rgb_xyz(b);
    var x = d3_xyz_lab((.4124564 * r + .3575761 * g + .1804375 * b) / d3_lab_X), y = d3_xyz_lab((.2126729 * r + .7151522 * g + .072175 * b) / d3_lab_Y), z = d3_xyz_lab((.0193339 * r + .119192 * g + .9503041 * b) / d3_lab_Z);
    return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
  }
  function d3_rgb_xyz(r) {
    return (r /= 255) <= .04045 ? r / 12.92 : Math.pow((r + .055) / 1.055, 2.4);
  }
  function d3_rgb_parseNumber(c) {
    var f = parseFloat(c);
    return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
  }
  var d3_rgb_names = d3.map({
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  });
  d3_rgb_names.forEach(function(key, value) {
    d3_rgb_names.set(key, d3_rgbNumber(value));
  });
  function d3_functor(v) {
    return typeof v === "function" ? v : function() {
      return v;
    };
  }
  d3.functor = d3_functor;
  d3.xhr = d3_xhrType(d3_identity);
  function d3_xhrType(response) {
    return function(url, mimeType, callback) {
      if (arguments.length === 2 && typeof mimeType === "function") callback = mimeType, 
      mimeType = null;
      return d3_xhr(url, mimeType, response, callback);
    };
  }
  function d3_xhr(url, mimeType, response, callback) {
    var xhr = {}, dispatch = d3.dispatch("beforesend", "progress", "load", "error"), headers = {}, request = new XMLHttpRequest(), responseType = null;
    if (this.XDomainRequest && !("withCredentials" in request) && /^(http(s)?:)?\/\//.test(url)) request = new XDomainRequest();
    "onload" in request ? request.onload = request.onerror = respond : request.onreadystatechange = function() {
      request.readyState > 3 && respond();
    };
    function respond() {
      var status = request.status, result;
      if (!status && d3_xhrHasResponse(request) || status >= 200 && status < 300 || status === 304) {
        try {
          result = response.call(xhr, request);
        } catch (e) {
          dispatch.error.call(xhr, e);
          return;
        }
        dispatch.load.call(xhr, result);
      } else {
        dispatch.error.call(xhr, request);
      }
    }
    request.onprogress = function(event) {
      var o = d3.event;
      d3.event = event;
      try {
        dispatch.progress.call(xhr, request);
      } finally {
        d3.event = o;
      }
    };
    xhr.header = function(name, value) {
      name = (name + "").toLowerCase();
      if (arguments.length < 2) return headers[name];
      if (value == null) delete headers[name]; else headers[name] = value + "";
      return xhr;
    };
    xhr.mimeType = function(value) {
      if (!arguments.length) return mimeType;
      mimeType = value == null ? null : value + "";
      return xhr;
    };
    xhr.responseType = function(value) {
      if (!arguments.length) return responseType;
      responseType = value;
      return xhr;
    };
    xhr.response = function(value) {
      response = value;
      return xhr;
    };
    [ "get", "post" ].forEach(function(method) {
      xhr[method] = function() {
        return xhr.send.apply(xhr, [ method ].concat(d3_array(arguments)));
      };
    });
    xhr.send = function(method, data, callback) {
      if (arguments.length === 2 && typeof data === "function") callback = data, data = null;
      request.open(method, url, true);
      if (mimeType != null && !("accept" in headers)) headers["accept"] = mimeType + ",*/*";
      if (request.setRequestHeader) for (var name in headers) request.setRequestHeader(name, headers[name]);
      if (mimeType != null && request.overrideMimeType) request.overrideMimeType(mimeType);
      if (responseType != null) request.responseType = responseType;
      if (callback != null) xhr.on("error", callback).on("load", function(request) {
        callback(null, request);
      });
      dispatch.beforesend.call(xhr, request);
      request.send(data == null ? null : data);
      return xhr;
    };
    xhr.abort = function() {
      request.abort();
      return xhr;
    };
    d3.rebind(xhr, dispatch, "on");
    return callback == null ? xhr : xhr.get(d3_xhr_fixCallback(callback));
  }
  function d3_xhr_fixCallback(callback) {
    return callback.length === 1 ? function(error, request) {
      callback(error == null ? request : null);
    } : callback;
  }
  function d3_xhrHasResponse(request) {
    var type = request.responseType;
    return type && type !== "text" ? request.response : request.responseText;
  }
  d3.dsv = function(delimiter, mimeType) {
    var reFormat = new RegExp('["' + delimiter + "\n]"), delimiterCode = delimiter.charCodeAt(0);
    function dsv(url, row, callback) {
      if (arguments.length < 3) callback = row, row = null;
      var xhr = d3_xhr(url, mimeType, row == null ? response : typedResponse(row), callback);
      xhr.row = function(_) {
        return arguments.length ? xhr.response((row = _) == null ? response : typedResponse(_)) : row;
      };
      return xhr;
    }
    function response(request) {
      return dsv.parse(request.responseText);
    }
    function typedResponse(f) {
      return function(request) {
        return dsv.parse(request.responseText, f);
      };
    }
    dsv.parse = function(text, f) {
      var o;
      return dsv.parseRows(text, function(row, i) {
        if (o) return o(row, i - 1);
        var a = new Function("d", "return {" + row.map(function(name, i) {
          return JSON.stringify(name) + ": d[" + i + "]";
        }).join(",") + "}");
        o = f ? function(row, i) {
          return f(a(row), i);
        } : a;
      });
    };
    dsv.parseRows = function(text, f) {
      var EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;
      function token() {
        if (I >= N) return EOF;
        if (eol) return eol = false, EOL;
        var j = I;
        if (text.charCodeAt(j) === 34) {
          var i = j;
          while (i++ < N) {
            if (text.charCodeAt(i) === 34) {
              if (text.charCodeAt(i + 1) !== 34) break;
              ++i;
            }
          }
          I = i + 2;
          var c = text.charCodeAt(i + 1);
          if (c === 13) {
            eol = true;
            if (text.charCodeAt(i + 2) === 10) ++I;
          } else if (c === 10) {
            eol = true;
          }
          return text.slice(j + 1, i).replace(/""/g, '"');
        }
        while (I < N) {
          var c = text.charCodeAt(I++), k = 1;
          if (c === 10) eol = true; else if (c === 13) {
            eol = true;
            if (text.charCodeAt(I) === 10) ++I, ++k;
          } else if (c !== delimiterCode) continue;
          return text.slice(j, I - k);
        }
        return text.slice(j);
      }
      while ((t = token()) !== EOF) {
        var a = [];
        while (t !== EOL && t !== EOF) {
          a.push(t);
          t = token();
        }
        if (f && (a = f(a, n++)) == null) continue;
        rows.push(a);
      }
      return rows;
    };
    dsv.format = function(rows) {
      if (Array.isArray(rows[0])) return dsv.formatRows(rows);
      var fieldSet = new d3_Set(), fields = [];
      rows.forEach(function(row) {
        for (var field in row) {
          if (!fieldSet.has(field)) {
            fields.push(fieldSet.add(field));
          }
        }
      });
      return [ fields.map(formatValue).join(delimiter) ].concat(rows.map(function(row) {
        return fields.map(function(field) {
          return formatValue(row[field]);
        }).join(delimiter);
      })).join("\n");
    };
    dsv.formatRows = function(rows) {
      return rows.map(formatRow).join("\n");
    };
    function formatRow(row) {
      return row.map(formatValue).join(delimiter);
    }
    function formatValue(text) {
      return reFormat.test(text) ? '"' + text.replace(/\"/g, '""') + '"' : text;
    }
    return dsv;
  };
  d3.csv = d3.dsv(",", "text/csv");
  d3.tsv = d3.dsv("	", "text/tab-separated-values");
  var d3_timer_queueHead, d3_timer_queueTail, d3_timer_interval, d3_timer_timeout, d3_timer_frame = this[d3_vendorSymbol(this, "requestAnimationFrame")] || function(callback) {
    setTimeout(callback, 17);
  };
  d3.timer = function() {
    d3_timer.apply(this, arguments);
  };
  function d3_timer(callback, delay, then) {
    var n = arguments.length;
    if (n < 2) delay = 0;
    if (n < 3) then = Date.now();
    var time = then + delay, timer = {
      c: callback,
      t: time,
      n: null
    };
    if (d3_timer_queueTail) d3_timer_queueTail.n = timer; else d3_timer_queueHead = timer;
    d3_timer_queueTail = timer;
    if (!d3_timer_interval) {
      d3_timer_timeout = clearTimeout(d3_timer_timeout);
      d3_timer_interval = 1;
      d3_timer_frame(d3_timer_step);
    }
    return timer;
  }
  function d3_timer_step() {
    var now = d3_timer_mark(), delay = d3_timer_sweep() - now;
    if (delay > 24) {
      if (isFinite(delay)) {
        clearTimeout(d3_timer_timeout);
        d3_timer_timeout = setTimeout(d3_timer_step, delay);
      }
      d3_timer_interval = 0;
    } else {
      d3_timer_interval = 1;
      d3_timer_frame(d3_timer_step);
    }
  }
  d3.timer.flush = function() {
    d3_timer_mark();
    d3_timer_sweep();
  };
  function d3_timer_mark() {
    var now = Date.now(), timer = d3_timer_queueHead;
    while (timer) {
      if (now >= timer.t && timer.c(now - timer.t)) timer.c = null;
      timer = timer.n;
    }
    return now;
  }
  function d3_timer_sweep() {
    var t0, t1 = d3_timer_queueHead, time = Infinity;
    while (t1) {
      if (t1.c) {
        if (t1.t < time) time = t1.t;
        t1 = (t0 = t1).n;
      } else {
        t1 = t0 ? t0.n = t1.n : d3_timer_queueHead = t1.n;
      }
    }
    d3_timer_queueTail = t0;
    return time;
  }
  function d3_format_precision(x, p) {
    return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
  }
  d3.round = function(x, n) {
    return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
  };
  var d3_formatPrefixes = [ "y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y" ].map(d3_formatPrefix);
  d3.formatPrefix = function(value, precision) {
    var i = 0;
    if (value = +value) {
      if (value < 0) value *= -1;
      if (precision) value = d3.round(value, d3_format_precision(value, precision));
      i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
      i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
    }
    return d3_formatPrefixes[8 + i / 3];
  };
  function d3_formatPrefix(d, i) {
    var k = Math.pow(10, abs(8 - i) * 3);
    return {
      scale: i > 8 ? function(d) {
        return d / k;
      } : function(d) {
        return d * k;
      },
      symbol: d
    };
  }
  function d3_locale_numberFormat(locale) {
    var locale_decimal = locale.decimal, locale_thousands = locale.thousands, locale_grouping = locale.grouping, locale_currency = locale.currency, formatGroup = locale_grouping && locale_thousands ? function(value, width) {
      var i = value.length, t = [], j = 0, g = locale_grouping[0], length = 0;
      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = locale_grouping[j = (j + 1) % locale_grouping.length];
      }
      return t.reverse().join(locale_thousands);
    } : d3_identity;
    return function(specifier) {
      var match = d3_format_re.exec(specifier), fill = match[1] || " ", align = match[2] || ">", sign = match[3] || "-", symbol = match[4] || "", zfill = match[5], width = +match[6], comma = match[7], precision = match[8], type = match[9], scale = 1, prefix = "", suffix = "", integer = false, exponent = true;
      if (precision) precision = +precision.substring(1);
      if (zfill || fill === "0" && align === "=") {
        zfill = fill = "0";
        align = "=";
      }
      switch (type) {
       case "n":
        comma = true;
        type = "g";
        break;

       case "%":
        scale = 100;
        suffix = "%";
        type = "f";
        break;

       case "p":
        scale = 100;
        suffix = "%";
        type = "r";
        break;

       case "b":
       case "o":
       case "x":
       case "X":
        if (symbol === "#") prefix = "0" + type.toLowerCase();

       case "c":
        exponent = false;

       case "d":
        integer = true;
        precision = 0;
        break;

       case "s":
        scale = -1;
        type = "r";
        break;
      }
      if (symbol === "$") prefix = locale_currency[0], suffix = locale_currency[1];
      if (type == "r" && !precision) type = "g";
      if (precision != null) {
        if (type == "g") precision = Math.max(1, Math.min(21, precision)); else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
      }
      type = d3_format_types.get(type) || d3_format_typeDefault;
      var zcomma = zfill && comma;
      return function(value) {
        var fullSuffix = suffix;
        if (integer && value % 1) return "";
        var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign === "-" ? "" : sign;
        if (scale < 0) {
          var unit = d3.formatPrefix(value, precision);
          value = unit.scale(value);
          fullSuffix = unit.symbol + suffix;
        } else {
          value *= scale;
        }
        value = type(value, precision);
        var i = value.lastIndexOf("."), before, after;
        if (i < 0) {
          var j = exponent ? value.lastIndexOf("e") : -1;
          if (j < 0) before = value, after = ""; else before = value.substring(0, j), after = value.substring(j);
        } else {
          before = value.substring(0, i);
          after = locale_decimal + value.substring(i + 1);
        }
        if (!zfill && comma) before = formatGroup(before, Infinity);
        var length = prefix.length + before.length + after.length + (zcomma ? 0 : negative.length), padding = length < width ? new Array(length = width - length + 1).join(fill) : "";
        if (zcomma) before = formatGroup(padding + before, padding.length ? width - after.length : Infinity);
        negative += prefix;
        value = before + after;
        return (align === "<" ? negative + value + padding : align === ">" ? padding + negative + value : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + fullSuffix;
      };
    };
  }
  var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;
  var d3_format_types = d3.map({
    b: function(x) {
      return x.toString(2);
    },
    c: function(x) {
      return String.fromCharCode(x);
    },
    o: function(x) {
      return x.toString(8);
    },
    x: function(x) {
      return x.toString(16);
    },
    X: function(x) {
      return x.toString(16).toUpperCase();
    },
    g: function(x, p) {
      return x.toPrecision(p);
    },
    e: function(x, p) {
      return x.toExponential(p);
    },
    f: function(x, p) {
      return x.toFixed(p);
    },
    r: function(x, p) {
      return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
    }
  });
  function d3_format_typeDefault(x) {
    return x + "";
  }
  var d3_time = d3.time = {}, d3_date = Date;
  function d3_date_utc() {
    this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
  }
  d3_date_utc.prototype = {
    getDate: function() {
      return this._.getUTCDate();
    },
    getDay: function() {
      return this._.getUTCDay();
    },
    getFullYear: function() {
      return this._.getUTCFullYear();
    },
    getHours: function() {
      return this._.getUTCHours();
    },
    getMilliseconds: function() {
      return this._.getUTCMilliseconds();
    },
    getMinutes: function() {
      return this._.getUTCMinutes();
    },
    getMonth: function() {
      return this._.getUTCMonth();
    },
    getSeconds: function() {
      return this._.getUTCSeconds();
    },
    getTime: function() {
      return this._.getTime();
    },
    getTimezoneOffset: function() {
      return 0;
    },
    valueOf: function() {
      return this._.valueOf();
    },
    setDate: function() {
      d3_time_prototype.setUTCDate.apply(this._, arguments);
    },
    setDay: function() {
      d3_time_prototype.setUTCDay.apply(this._, arguments);
    },
    setFullYear: function() {
      d3_time_prototype.setUTCFullYear.apply(this._, arguments);
    },
    setHours: function() {
      d3_time_prototype.setUTCHours.apply(this._, arguments);
    },
    setMilliseconds: function() {
      d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
    },
    setMinutes: function() {
      d3_time_prototype.setUTCMinutes.apply(this._, arguments);
    },
    setMonth: function() {
      d3_time_prototype.setUTCMonth.apply(this._, arguments);
    },
    setSeconds: function() {
      d3_time_prototype.setUTCSeconds.apply(this._, arguments);
    },
    setTime: function() {
      d3_time_prototype.setTime.apply(this._, arguments);
    }
  };
  var d3_time_prototype = Date.prototype;
  function d3_time_interval(local, step, number) {
    function round(date) {
      var d0 = local(date), d1 = offset(d0, 1);
      return date - d0 < d1 - date ? d0 : d1;
    }
    function ceil(date) {
      step(date = local(new d3_date(date - 1)), 1);
      return date;
    }
    function offset(date, k) {
      step(date = new d3_date(+date), k);
      return date;
    }
    function range(t0, t1, dt) {
      var time = ceil(t0), times = [];
      if (dt > 1) {
        while (time < t1) {
          if (!(number(time) % dt)) times.push(new Date(+time));
          step(time, 1);
        }
      } else {
        while (time < t1) times.push(new Date(+time)), step(time, 1);
      }
      return times;
    }
    function range_utc(t0, t1, dt) {
      try {
        d3_date = d3_date_utc;
        var utc = new d3_date_utc();
        utc._ = t0;
        return range(utc, t1, dt);
      } finally {
        d3_date = Date;
      }
    }
    local.floor = local;
    local.round = round;
    local.ceil = ceil;
    local.offset = offset;
    local.range = range;
    var utc = local.utc = d3_time_interval_utc(local);
    utc.floor = utc;
    utc.round = d3_time_interval_utc(round);
    utc.ceil = d3_time_interval_utc(ceil);
    utc.offset = d3_time_interval_utc(offset);
    utc.range = range_utc;
    return local;
  }
  function d3_time_interval_utc(method) {
    return function(date, k) {
      try {
        d3_date = d3_date_utc;
        var utc = new d3_date_utc();
        utc._ = date;
        return method(utc, k)._;
      } finally {
        d3_date = Date;
      }
    };
  }
  d3_time.year = d3_time_interval(function(date) {
    date = d3_time.day(date);
    date.setMonth(0, 1);
    return date;
  }, function(date, offset) {
    date.setFullYear(date.getFullYear() + offset);
  }, function(date) {
    return date.getFullYear();
  });
  d3_time.years = d3_time.year.range;
  d3_time.years.utc = d3_time.year.utc.range;
  d3_time.day = d3_time_interval(function(date) {
    var day = new d3_date(2e3, 0);
    day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    return day;
  }, function(date, offset) {
    date.setDate(date.getDate() + offset);
  }, function(date) {
    return date.getDate() - 1;
  });
  d3_time.days = d3_time.day.range;
  d3_time.days.utc = d3_time.day.utc.range;
  d3_time.dayOfYear = function(date) {
    var year = d3_time.year(date);
    return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 6e4) / 864e5);
  };
  [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ].forEach(function(day, i) {
    i = 7 - i;
    var interval = d3_time[day] = d3_time_interval(function(date) {
      (date = d3_time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
      return date;
    }, function(date, offset) {
      date.setDate(date.getDate() + Math.floor(offset) * 7);
    }, function(date) {
      var day = d3_time.year(date).getDay();
      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
    });
    d3_time[day + "s"] = interval.range;
    d3_time[day + "s"].utc = interval.utc.range;
    d3_time[day + "OfYear"] = function(date) {
      var day = d3_time.year(date).getDay();
      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7);
    };
  });
  d3_time.week = d3_time.sunday;
  d3_time.weeks = d3_time.sunday.range;
  d3_time.weeks.utc = d3_time.sunday.utc.range;
  d3_time.weekOfYear = d3_time.sundayOfYear;
  function d3_locale_timeFormat(locale) {
    var locale_dateTime = locale.dateTime, locale_date = locale.date, locale_time = locale.time, locale_periods = locale.periods, locale_days = locale.days, locale_shortDays = locale.shortDays, locale_months = locale.months, locale_shortMonths = locale.shortMonths;
    function d3_time_format(template) {
      var n = template.length;
      function format(date) {
        var string = [], i = -1, j = 0, c, p, f;
        while (++i < n) {
          if (template.charCodeAt(i) === 37) {
            string.push(template.slice(j, i));
            if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null) c = template.charAt(++i);
            if (f = d3_time_formats[c]) c = f(date, p == null ? c === "e" ? " " : "0" : p);
            string.push(c);
            j = i + 1;
          }
        }
        string.push(template.slice(j, i));
        return string.join("");
      }
      format.parse = function(string) {
        var d = {
          y: 1900,
          m: 0,
          d: 1,
          H: 0,
          M: 0,
          S: 0,
          L: 0,
          Z: null
        }, i = d3_time_parse(d, template, string, 0);
        if (i != string.length) return null;
        if ("p" in d) d.H = d.H % 12 + d.p * 12;
        var localZ = d.Z != null && d3_date !== d3_date_utc, date = new (localZ ? d3_date_utc : d3_date)();
        if ("j" in d) date.setFullYear(d.y, 0, d.j); else if ("W" in d || "U" in d) {
          if (!("w" in d)) d.w = "W" in d ? 1 : 0;
          date.setFullYear(d.y, 0, 1);
          date.setFullYear(d.y, 0, "W" in d ? (d.w + 6) % 7 + d.W * 7 - (date.getDay() + 5) % 7 : d.w + d.U * 7 - (date.getDay() + 6) % 7);
        } else date.setFullYear(d.y, d.m, d.d);
        date.setHours(d.H + (d.Z / 100 | 0), d.M + d.Z % 100, d.S, d.L);
        return localZ ? date._ : date;
      };
      format.toString = function() {
        return template;
      };
      return format;
    }
    function d3_time_parse(date, template, string, j) {
      var c, p, t, i = 0, n = template.length, m = string.length;
      while (i < n) {
        if (j >= m) return -1;
        c = template.charCodeAt(i++);
        if (c === 37) {
          t = template.charAt(i++);
          p = d3_time_parsers[t in d3_time_formatPads ? template.charAt(i++) : t];
          if (!p || (j = p(date, string, j)) < 0) return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }
      return j;
    }
    d3_time_format.utc = function(template) {
      var local = d3_time_format(template);
      function format(date) {
        try {
          d3_date = d3_date_utc;
          var utc = new d3_date();
          utc._ = date;
          return local(utc);
        } finally {
          d3_date = Date;
        }
      }
      format.parse = function(string) {
        try {
          d3_date = d3_date_utc;
          var date = local.parse(string);
          return date && date._;
        } finally {
          d3_date = Date;
        }
      };
      format.toString = local.toString;
      return format;
    };
    d3_time_format.multi = d3_time_format.utc.multi = d3_time_formatMulti;
    var d3_time_periodLookup = d3.map(), d3_time_dayRe = d3_time_formatRe(locale_days), d3_time_dayLookup = d3_time_formatLookup(locale_days), d3_time_dayAbbrevRe = d3_time_formatRe(locale_shortDays), d3_time_dayAbbrevLookup = d3_time_formatLookup(locale_shortDays), d3_time_monthRe = d3_time_formatRe(locale_months), d3_time_monthLookup = d3_time_formatLookup(locale_months), d3_time_monthAbbrevRe = d3_time_formatRe(locale_shortMonths), d3_time_monthAbbrevLookup = d3_time_formatLookup(locale_shortMonths);
    locale_periods.forEach(function(p, i) {
      d3_time_periodLookup.set(p.toLowerCase(), i);
    });
    var d3_time_formats = {
      a: function(d) {
        return locale_shortDays[d.getDay()];
      },
      A: function(d) {
        return locale_days[d.getDay()];
      },
      b: function(d) {
        return locale_shortMonths[d.getMonth()];
      },
      B: function(d) {
        return locale_months[d.getMonth()];
      },
      c: d3_time_format(locale_dateTime),
      d: function(d, p) {
        return d3_time_formatPad(d.getDate(), p, 2);
      },
      e: function(d, p) {
        return d3_time_formatPad(d.getDate(), p, 2);
      },
      H: function(d, p) {
        return d3_time_formatPad(d.getHours(), p, 2);
      },
      I: function(d, p) {
        return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
      },
      j: function(d, p) {
        return d3_time_formatPad(1 + d3_time.dayOfYear(d), p, 3);
      },
      L: function(d, p) {
        return d3_time_formatPad(d.getMilliseconds(), p, 3);
      },
      m: function(d, p) {
        return d3_time_formatPad(d.getMonth() + 1, p, 2);
      },
      M: function(d, p) {
        return d3_time_formatPad(d.getMinutes(), p, 2);
      },
      p: function(d) {
        return locale_periods[+(d.getHours() >= 12)];
      },
      S: function(d, p) {
        return d3_time_formatPad(d.getSeconds(), p, 2);
      },
      U: function(d, p) {
        return d3_time_formatPad(d3_time.sundayOfYear(d), p, 2);
      },
      w: function(d) {
        return d.getDay();
      },
      W: function(d, p) {
        return d3_time_formatPad(d3_time.mondayOfYear(d), p, 2);
      },
      x: d3_time_format(locale_date),
      X: d3_time_format(locale_time),
      y: function(d, p) {
        return d3_time_formatPad(d.getFullYear() % 100, p, 2);
      },
      Y: function(d, p) {
        return d3_time_formatPad(d.getFullYear() % 1e4, p, 4);
      },
      Z: d3_time_zone,
      "%": function() {
        return "%";
      }
    };
    var d3_time_parsers = {
      a: d3_time_parseWeekdayAbbrev,
      A: d3_time_parseWeekday,
      b: d3_time_parseMonthAbbrev,
      B: d3_time_parseMonth,
      c: d3_time_parseLocaleFull,
      d: d3_time_parseDay,
      e: d3_time_parseDay,
      H: d3_time_parseHour24,
      I: d3_time_parseHour24,
      j: d3_time_parseDayOfYear,
      L: d3_time_parseMilliseconds,
      m: d3_time_parseMonthNumber,
      M: d3_time_parseMinutes,
      p: d3_time_parseAmPm,
      S: d3_time_parseSeconds,
      U: d3_time_parseWeekNumberSunday,
      w: d3_time_parseWeekdayNumber,
      W: d3_time_parseWeekNumberMonday,
      x: d3_time_parseLocaleDate,
      X: d3_time_parseLocaleTime,
      y: d3_time_parseYear,
      Y: d3_time_parseFullYear,
      Z: d3_time_parseZone,
      "%": d3_time_parseLiteralPercent
    };
    function d3_time_parseWeekdayAbbrev(date, string, i) {
      d3_time_dayAbbrevRe.lastIndex = 0;
      var n = d3_time_dayAbbrevRe.exec(string.slice(i));
      return n ? (date.w = d3_time_dayAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseWeekday(date, string, i) {
      d3_time_dayRe.lastIndex = 0;
      var n = d3_time_dayRe.exec(string.slice(i));
      return n ? (date.w = d3_time_dayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseMonthAbbrev(date, string, i) {
      d3_time_monthAbbrevRe.lastIndex = 0;
      var n = d3_time_monthAbbrevRe.exec(string.slice(i));
      return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseMonth(date, string, i) {
      d3_time_monthRe.lastIndex = 0;
      var n = d3_time_monthRe.exec(string.slice(i));
      return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseLocaleFull(date, string, i) {
      return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
    }
    function d3_time_parseLocaleDate(date, string, i) {
      return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
    }
    function d3_time_parseLocaleTime(date, string, i) {
      return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
    }
    function d3_time_parseAmPm(date, string, i) {
      var n = d3_time_periodLookup.get(string.slice(i, i += 2).toLowerCase());
      return n == null ? -1 : (date.p = n, i);
    }
    return d3_time_format;
  }
  var d3_time_formatPads = {
    "-": "",
    _: " ",
    "0": "0"
  }, d3_time_numberRe = /^\s*\d+/, d3_time_percentRe = /^%/;
  function d3_time_formatPad(value, fill, width) {
    var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
  }
  function d3_time_formatRe(names) {
    return new RegExp("^(?:" + names.map(d3.requote).join("|") + ")", "i");
  }
  function d3_time_formatLookup(names) {
    var map = new d3_Map(), i = -1, n = names.length;
    while (++i < n) map.set(names[i].toLowerCase(), i);
    return map;
  }
  function d3_time_parseWeekdayNumber(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 1));
    return n ? (date.w = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseWeekNumberSunday(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i));
    return n ? (date.U = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseWeekNumberMonday(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i));
    return n ? (date.W = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseFullYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 4));
    return n ? (date.y = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.y = d3_time_expandYear(+n[0]), i + n[0].length) : -1;
  }
  function d3_time_parseZone(date, string, i) {
    return /^[+-]\d{4}$/.test(string = string.slice(i, i + 5)) ? (date.Z = -string, 
    i + 5) : -1;
  }
  function d3_time_expandYear(d) {
    return d + (d > 68 ? 1900 : 2e3);
  }
  function d3_time_parseMonthNumber(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.m = n[0] - 1, i + n[0].length) : -1;
  }
  function d3_time_parseDay(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.d = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseDayOfYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 3));
    return n ? (date.j = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseHour24(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.H = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseMinutes(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.M = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseSeconds(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.S = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseMilliseconds(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 3));
    return n ? (date.L = +n[0], i + n[0].length) : -1;
  }
  function d3_time_zone(d) {
    var z = d.getTimezoneOffset(), zs = z > 0 ? "-" : "+", zh = abs(z) / 60 | 0, zm = abs(z) % 60;
    return zs + d3_time_formatPad(zh, "0", 2) + d3_time_formatPad(zm, "0", 2);
  }
  function d3_time_parseLiteralPercent(date, string, i) {
    d3_time_percentRe.lastIndex = 0;
    var n = d3_time_percentRe.exec(string.slice(i, i + 1));
    return n ? i + n[0].length : -1;
  }
  function d3_time_formatMulti(formats) {
    var n = formats.length, i = -1;
    while (++i < n) formats[i][0] = this(formats[i][0]);
    return function(date) {
      var i = 0, f = formats[i];
      while (!f[1](date)) f = formats[++i];
      return f[0](date);
    };
  }
  d3.locale = function(locale) {
    return {
      numberFormat: d3_locale_numberFormat(locale),
      timeFormat: d3_locale_timeFormat(locale)
    };
  };
  var d3_locale_enUS = d3.locale({
    decimal: ".",
    thousands: ",",
    grouping: [ 3 ],
    currency: [ "$", "" ],
    dateTime: "%a %b %e %X %Y",
    date: "%m/%d/%Y",
    time: "%H:%M:%S",
    periods: [ "AM", "PM" ],
    days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
    shortDays: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
    months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
    shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
  });
  d3.format = d3_locale_enUS.numberFormat;
  d3.geo = {};
  function d3_adder() {}
  d3_adder.prototype = {
    s: 0,
    t: 0,
    add: function(y) {
      d3_adderSum(y, this.t, d3_adderTemp);
      d3_adderSum(d3_adderTemp.s, this.s, this);
      if (this.s) this.t += d3_adderTemp.t; else this.s = d3_adderTemp.t;
    },
    reset: function() {
      this.s = this.t = 0;
    },
    valueOf: function() {
      return this.s;
    }
  };
  var d3_adderTemp = new d3_adder();
  function d3_adderSum(a, b, o) {
    var x = o.s = a + b, bv = x - a, av = x - bv;
    o.t = a - av + (b - bv);
  }
  d3.geo.stream = function(object, listener) {
    if (object && d3_geo_streamObjectType.hasOwnProperty(object.type)) {
      d3_geo_streamObjectType[object.type](object, listener);
    } else {
      d3_geo_streamGeometry(object, listener);
    }
  };
  function d3_geo_streamGeometry(geometry, listener) {
    if (geometry && d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
      d3_geo_streamGeometryType[geometry.type](geometry, listener);
    }
  }
  var d3_geo_streamObjectType = {
    Feature: function(feature, listener) {
      d3_geo_streamGeometry(feature.geometry, listener);
    },
    FeatureCollection: function(object, listener) {
      var features = object.features, i = -1, n = features.length;
      while (++i < n) d3_geo_streamGeometry(features[i].geometry, listener);
    }
  };
  var d3_geo_streamGeometryType = {
    Sphere: function(object, listener) {
      listener.sphere();
    },
    Point: function(object, listener) {
      object = object.coordinates;
      listener.point(object[0], object[1], object[2]);
    },
    MultiPoint: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) object = coordinates[i], listener.point(object[0], object[1], object[2]);
    },
    LineString: function(object, listener) {
      d3_geo_streamLine(object.coordinates, listener, 0);
    },
    MultiLineString: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) d3_geo_streamLine(coordinates[i], listener, 0);
    },
    Polygon: function(object, listener) {
      d3_geo_streamPolygon(object.coordinates, listener);
    },
    MultiPolygon: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) d3_geo_streamPolygon(coordinates[i], listener);
    },
    GeometryCollection: function(object, listener) {
      var geometries = object.geometries, i = -1, n = geometries.length;
      while (++i < n) d3_geo_streamGeometry(geometries[i], listener);
    }
  };
  function d3_geo_streamLine(coordinates, listener, closed) {
    var i = -1, n = coordinates.length - closed, coordinate;
    listener.lineStart();
    while (++i < n) coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1], coordinate[2]);
    listener.lineEnd();
  }
  function d3_geo_streamPolygon(coordinates, listener) {
    var i = -1, n = coordinates.length;
    listener.polygonStart();
    while (++i < n) d3_geo_streamLine(coordinates[i], listener, 1);
    listener.polygonEnd();
  }
  d3.geo.area = function(object) {
    d3_geo_areaSum = 0;
    d3.geo.stream(object, d3_geo_area);
    return d3_geo_areaSum;
  };
  var d3_geo_areaSum, d3_geo_areaRingSum = new d3_adder();
  var d3_geo_area = {
    sphere: function() {
      d3_geo_areaSum += 4 * PI;
    },
    point: d3_noop,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_areaRingSum.reset();
      d3_geo_area.lineStart = d3_geo_areaRingStart;
    },
    polygonEnd: function() {
      var area = 2 * d3_geo_areaRingSum;
      d3_geo_areaSum += area < 0 ? 4 * PI + area : area;
      d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
    }
  };
  function d3_geo_areaRingStart() {
    var lambda00, phi00, lambda0, cosphi0, sinphi0;
    d3_geo_area.point = function(lambda, phi) {
      d3_geo_area.point = nextPoint;
      lambda0 = (lambda00 = lambda) * d3_radians, cosphi0 = Math.cos(phi = (phi00 = phi) * d3_radians / 2 + PI / 4), 
      sinphi0 = Math.sin(phi);
    };
    function nextPoint(lambda, phi) {
      lambda *= d3_radians;
      phi = phi * d3_radians / 2 + PI / 4;
      var dlambda = lambda - lambda0, sdlambda = dlambda >= 0 ? 1 : -1, adlambda = sdlambda * dlambda, cosphi = Math.cos(phi), sinphi = Math.sin(phi), k = sinphi0 * sinphi, u = cosphi0 * cosphi + k * Math.cos(adlambda), v = k * sdlambda * Math.sin(adlambda);
      d3_geo_areaRingSum.add(Math.atan2(v, u));
      lambda0 = lambda, cosphi0 = cosphi, sinphi0 = sinphi;
    }
    d3_geo_area.lineEnd = function() {
      nextPoint(lambda00, phi00);
    };
  }
  function d3_geo_cartesian(spherical) {
    var lambda = spherical[0], phi = spherical[1], cosphi = Math.cos(phi);
    return [ cosphi * Math.cos(lambda), cosphi * Math.sin(lambda), Math.sin(phi) ];
  }
  function d3_geo_cartesianDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function d3_geo_cartesianCross(a, b) {
    return [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] ];
  }
  function d3_geo_cartesianAdd(a, b) {
    a[0] += b[0];
    a[1] += b[1];
    a[2] += b[2];
  }
  function d3_geo_cartesianScale(vector, k) {
    return [ vector[0] * k, vector[1] * k, vector[2] * k ];
  }
  function d3_geo_cartesianNormalize(d) {
    var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l;
    d[1] /= l;
    d[2] /= l;
  }
  function d3_geo_spherical(cartesian) {
    return [ Math.atan2(cartesian[1], cartesian[0]), d3_asin(cartesian[2]) ];
  }
  function d3_geo_sphericalEqual(a, b) {
    return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
  }
  d3.geo.bounds = function() {
    var lambda0, phi0, lambda1, phi1, lambda_, lambda__, phi__, p0, dlambdaSum, ranges, range;
    var bound = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() {
        bound.point = ringPoint;
        bound.lineStart = ringStart;
        bound.lineEnd = ringEnd;
        dlambdaSum = 0;
        d3_geo_area.polygonStart();
      },
      polygonEnd: function() {
        d3_geo_area.polygonEnd();
        bound.point = point;
        bound.lineStart = lineStart;
        bound.lineEnd = lineEnd;
        if (d3_geo_areaRingSum < 0) lambda0 = -(lambda1 = 180), phi0 = -(phi1 = 90); else if (dlambdaSum > epsilon) phi1 = 90; else if (dlambdaSum < -epsilon) phi0 = -90;
        range[0] = lambda0, range[1] = lambda1;
      }
    };
    function point(lambda, phi) {
      ranges.push(range = [ lambda0 = lambda, lambda1 = lambda ]);
      if (phi < phi0) phi0 = phi;
      if (phi > phi1) phi1 = phi;
    }
    function linePoint(lambda, phi) {
      var p = d3_geo_cartesian([ lambda * d3_radians, phi * d3_radians ]);
      if (p0) {
        var normal = d3_geo_cartesianCross(p0, p), equatorial = [ normal[1], -normal[0], 0 ], inflection = d3_geo_cartesianCross(equatorial, normal);
        d3_geo_cartesianNormalize(inflection);
        inflection = d3_geo_spherical(inflection);
        var dlambda = lambda - lambda_, s = dlambda > 0 ? 1 : -1, lambdai = inflection[0] * d3_degrees * s, antimeridian = abs(dlambda) > 180;
        if (antimeridian ^ (s * lambda_ < lambdai && lambdai < s * lambda)) {
          var phii = inflection[1] * d3_degrees;
          if (phii > phi1) phi1 = phii;
        } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (s * lambda_ < lambdai && lambdai < s * lambda)) {
          var phii = -inflection[1] * d3_degrees;
          if (phii < phi0) phi0 = phii;
        } else {
          if (phi < phi0) phi0 = phi;
          if (phi > phi1) phi1 = phi;
        }
        if (antimeridian) {
          if (lambda < lambda_) {
            if (angle(lambda0, lambda) > angle(lambda0, lambda1)) lambda1 = lambda;
          } else {
            if (angle(lambda, lambda1) > angle(lambda0, lambda1)) lambda0 = lambda;
          }
        } else {
          if (lambda1 >= lambda0) {
            if (lambda < lambda0) lambda0 = lambda;
            if (lambda > lambda1) lambda1 = lambda;
          } else {
            if (lambda > lambda_) {
              if (angle(lambda0, lambda) > angle(lambda0, lambda1)) lambda1 = lambda;
            } else {
              if (angle(lambda, lambda1) > angle(lambda0, lambda1)) lambda0 = lambda;
            }
          }
        }
      } else {
        point(lambda, phi);
      }
      p0 = p, lambda_ = lambda;
    }
    function lineStart() {
      bound.point = linePoint;
    }
    function lineEnd() {
      range[0] = lambda0, range[1] = lambda1;
      bound.point = point;
      p0 = null;
    }
    function ringPoint(lambda, phi) {
      if (p0) {
        var dlambda = lambda - lambda_;
        dlambdaSum += abs(dlambda) > 180 ? dlambda + (dlambda > 0 ? 360 : -360) : dlambda;
      } else lambda__ = lambda, phi__ = phi;
      d3_geo_area.point(lambda, phi);
      linePoint(lambda, phi);
    }
    function ringStart() {
      d3_geo_area.lineStart();
    }
    function ringEnd() {
      ringPoint(lambda__, phi__);
      d3_geo_area.lineEnd();
      if (abs(dlambdaSum) > epsilon) lambda0 = -(lambda1 = 180);
      range[0] = lambda0, range[1] = lambda1;
      p0 = null;
    }
    function angle(lambda0, lambda1) {
      return (lambda1 -= lambda0) < 0 ? lambda1 + 360 : lambda1;
    }
    function compareRanges(a, b) {
      return a[0] - b[0];
    }
    function withinRange(x, range) {
      return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
    }
    return function(feature) {
      phi1 = lambda1 = -(lambda0 = phi0 = Infinity);
      ranges = [];
      d3.geo.stream(feature, bound);
      var n = ranges.length;
      if (n) {
        ranges.sort(compareRanges);
        for (var i = 1, a = ranges[0], b, merged = [ a ]; i < n; ++i) {
          b = ranges[i];
          if (withinRange(b[0], a) || withinRange(b[1], a)) {
            if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
            if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
          } else {
            merged.push(a = b);
          }
        }
        var best = -Infinity, dlambda;
        for (var n = merged.length - 1, i = 0, a = merged[n], b; i <= n; a = b, ++i) {
          b = merged[i];
          if ((dlambda = angle(a[1], b[0])) > best) best = dlambda, lambda0 = b[0], lambda1 = a[1];
        }
      }
      ranges = range = null;
      return lambda0 === Infinity || phi0 === Infinity ? [ [ NaN, NaN ], [ NaN, NaN ] ] : [ [ lambda0, phi0 ], [ lambda1, phi1 ] ];
    };
  }();
  d3.geo.centroid = function(object) {
    d3_geo_centroidW0 = d3_geo_centroidW1 = d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
    d3.geo.stream(object, d3_geo_centroid);
    var x = d3_geo_centroidX2, y = d3_geo_centroidY2, z = d3_geo_centroidZ2, m = x * x + y * y + z * z;
    if (m < epsilon2) {
      x = d3_geo_centroidX1, y = d3_geo_centroidY1, z = d3_geo_centroidZ1;
      if (d3_geo_centroidW1 < epsilon) x = d3_geo_centroidX0, y = d3_geo_centroidY0, z = d3_geo_centroidZ0;
      m = x * x + y * y + z * z;
      if (m < epsilon2) return [ NaN, NaN ];
    }
    return [ Math.atan2(y, x) * d3_degrees, d3_asin(z / Math.sqrt(m)) * d3_degrees ];
  };
  var d3_geo_centroidW0, d3_geo_centroidW1, d3_geo_centroidX0, d3_geo_centroidY0, d3_geo_centroidZ0, d3_geo_centroidX1, d3_geo_centroidY1, d3_geo_centroidZ1, d3_geo_centroidX2, d3_geo_centroidY2, d3_geo_centroidZ2;
  var d3_geo_centroid = {
    sphere: d3_noop,
    point: d3_geo_centroidPoint,
    lineStart: d3_geo_centroidLineStart,
    lineEnd: d3_geo_centroidLineEnd,
    polygonStart: function() {
      d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
    },
    polygonEnd: function() {
      d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
    }
  };
  function d3_geo_centroidPoint(lambda, phi) {
    lambda *= d3_radians;
    var cosphi = Math.cos(phi *= d3_radians);
    d3_geo_centroidPointXYZ(cosphi * Math.cos(lambda), cosphi * Math.sin(lambda), Math.sin(phi));
  }
  function d3_geo_centroidPointXYZ(x, y, z) {
    ++d3_geo_centroidW0;
    d3_geo_centroidX0 += (x - d3_geo_centroidX0) / d3_geo_centroidW0;
    d3_geo_centroidY0 += (y - d3_geo_centroidY0) / d3_geo_centroidW0;
    d3_geo_centroidZ0 += (z - d3_geo_centroidZ0) / d3_geo_centroidW0;
  }
  function d3_geo_centroidLineStart() {
    var x0, y0, z0;
    d3_geo_centroid.point = function(lambda, phi) {
      lambda *= d3_radians;
      var cosphi = Math.cos(phi *= d3_radians);
      x0 = cosphi * Math.cos(lambda);
      y0 = cosphi * Math.sin(lambda);
      z0 = Math.sin(phi);
      d3_geo_centroid.point = nextPoint;
      d3_geo_centroidPointXYZ(x0, y0, z0);
    };
    function nextPoint(lambda, phi) {
      lambda *= d3_radians;
      var cosphi = Math.cos(phi *= d3_radians), x = cosphi * Math.cos(lambda), y = cosphi * Math.sin(lambda), z = Math.sin(phi), w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
      d3_geo_centroidW1 += w;
      d3_geo_centroidX1 += w * (x0 + (x0 = x));
      d3_geo_centroidY1 += w * (y0 + (y0 = y));
      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
      d3_geo_centroidPointXYZ(x0, y0, z0);
    }
  }
  function d3_geo_centroidLineEnd() {
    d3_geo_centroid.point = d3_geo_centroidPoint;
  }
  function d3_geo_centroidRingStart() {
    var lambda00, phi00, x0, y0, z0;
    d3_geo_centroid.point = function(lambda, phi) {
      lambda00 = lambda, phi00 = phi;
      d3_geo_centroid.point = nextPoint;
      lambda *= d3_radians;
      var cosphi = Math.cos(phi *= d3_radians);
      x0 = cosphi * Math.cos(lambda);
      y0 = cosphi * Math.sin(lambda);
      z0 = Math.sin(phi);
      d3_geo_centroidPointXYZ(x0, y0, z0);
    };
    d3_geo_centroid.lineEnd = function() {
      nextPoint(lambda00, phi00);
      d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
      d3_geo_centroid.point = d3_geo_centroidPoint;
    };
    function nextPoint(lambda, phi) {
      lambda *= d3_radians;
      var cosphi = Math.cos(phi *= d3_radians), x = cosphi * Math.cos(lambda), y = cosphi * Math.sin(lambda), z = Math.sin(phi), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x, m = Math.sqrt(cx * cx + cy * cy + cz * cz), u = x0 * x + y0 * y + z0 * z, v = m && -d3_acos(u) / m, w = Math.atan2(m, u);
      d3_geo_centroidX2 += v * cx;
      d3_geo_centroidY2 += v * cy;
      d3_geo_centroidZ2 += v * cz;
      d3_geo_centroidW1 += w;
      d3_geo_centroidX1 += w * (x0 + (x0 = x));
      d3_geo_centroidY1 += w * (y0 + (y0 = y));
      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
      d3_geo_centroidPointXYZ(x0, y0, z0);
    }
  }
  function d3_geo_compose(a, b) {
    function compose(x, y) {
      return x = a(x, y), b(x[0], x[1]);
    }
    if (a.invert && b.invert) compose.invert = function(x, y) {
      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
    };
    return compose;
  }
  function d3_true() {
    return true;
  }
  function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
    var subject = [], clip = [];
    segments.forEach(function(segment) {
      if ((n = segment.length - 1) <= 0) return;
      var n, p0 = segment[0], p1 = segment[n];
      if (d3_geo_sphericalEqual(p0, p1)) {
        listener.lineStart();
        for (var i = 0; i < n; ++i) listener.point((p0 = segment[i])[0], p0[1]);
        listener.lineEnd();
        return;
      }
      var a = new d3_geo_clipPolygonIntersection(p0, segment, null, true), b = new d3_geo_clipPolygonIntersection(p0, null, a, false);
      a.o = b;
      subject.push(a);
      clip.push(b);
      a = new d3_geo_clipPolygonIntersection(p1, segment, null, false);
      b = new d3_geo_clipPolygonIntersection(p1, null, a, true);
      a.o = b;
      subject.push(a);
      clip.push(b);
    });
    clip.sort(compare);
    d3_geo_clipPolygonLinkCircular(subject);
    d3_geo_clipPolygonLinkCircular(clip);
    if (!subject.length) return;
    for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
      clip[i].e = entry = !entry;
    }
    var start = subject[0], points, point;
    while (1) {
      var current = start, isSubject = true;
      while (current.v) if ((current = current.n) === start) return;
      points = current.z;
      listener.lineStart();
      do {
        current.v = current.o.v = true;
        if (current.e) {
          if (isSubject) {
            for (var i = 0, n = points.length; i < n; ++i) listener.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.n.x, 1, listener);
          }
          current = current.n;
        } else {
          if (isSubject) {
            points = current.p.z;
            for (var i = points.length - 1; i >= 0; --i) listener.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.p.x, -1, listener);
          }
          current = current.p;
        }
        current = current.o;
        points = current.z;
        isSubject = !isSubject;
      } while (!current.v);
      listener.lineEnd();
    }
  }
  function d3_geo_clipPolygonLinkCircular(array) {
    if (!(n = array.length)) return;
    var n, i = 0, a = array[0], b;
    while (++i < n) {
      a.n = b = array[i];
      b.p = a;
      a = b;
    }
    a.n = b = array[0];
    b.p = a;
  }
  function d3_geo_clipPolygonIntersection(point, points, other, entry) {
    this.x = point;
    this.z = points;
    this.o = other;
    this.e = entry;
    this.v = false;
    this.n = this.p = null;
  }
  function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
    return function(rotate, listener) {
      var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          clip.point = pointRing;
          clip.lineStart = ringStart;
          clip.lineEnd = ringEnd;
          segments = [];
          polygon = [];
        },
        polygonEnd: function() {
          clip.point = point;
          clip.lineStart = lineStart;
          clip.lineEnd = lineEnd;
          segments = d3.merge(segments);
          var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
          if (segments.length) {
            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
            d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
          } else if (clipStartInside) {
            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
            listener.lineStart();
            interpolate(null, null, 1, listener);
            listener.lineEnd();
          }
          if (polygonStarted) listener.polygonEnd(), polygonStarted = false;
          segments = polygon = null;
        },
        sphere: function() {
          listener.polygonStart();
          listener.lineStart();
          interpolate(null, null, 1, listener);
          listener.lineEnd();
          listener.polygonEnd();
        }
      };
      function point(lambda, phi) {
        var point = rotate(lambda, phi);
        if (pointVisible(lambda = point[0], phi = point[1])) listener.point(lambda, phi);
      }
      function pointLine(lambda, phi) {
        var point = rotate(lambda, phi);
        line.point(point[0], point[1]);
      }
      function lineStart() {
        clip.point = pointLine;
        line.lineStart();
      }
      function lineEnd() {
        clip.point = point;
        line.lineEnd();
      }
      var segments;
      var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygonStarted = false, polygon, ring;
      function pointRing(lambda, phi) {
        ring.push([ lambda, phi ]);
        var point = rotate(lambda, phi);
        ringListener.point(point[0], point[1]);
      }
      function ringStart() {
        ringListener.lineStart();
        ring = [];
      }
      function ringEnd() {
        pointRing(ring[0][0], ring[0][1]);
        ringListener.lineEnd();
        var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
        ring.pop();
        polygon.push(ring);
        ring = null;
        if (!n) return;
        if (clean & 1) {
          segment = ringSegments[0];
          var n = segment.length - 1, i = -1, point;
          if (n > 0) {
            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
            listener.lineStart();
            while (++i < n) listener.point((point = segment[i])[0], point[1]);
            listener.lineEnd();
          }
          return;
        }
        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
        segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
      }
      return clip;
    };
  }
  function d3_geo_clipSegmentLength1(segment) {
    return segment.length > 1;
  }
  function d3_geo_clipBufferListener() {
    var lines = [], line;
    return {
      lineStart: function() {
        lines.push(line = []);
      },
      point: function(lambda, phi) {
        line.push([ lambda, phi ]);
      },
      lineEnd: d3_noop,
      buffer: function() {
        var buffer = lines;
        lines = [];
        line = null;
        return buffer;
      },
      rejoin: function() {
        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
      }
    };
  }
  function d3_geo_clipSort(a, b) {
    return ((a = a.x)[0] < 0 ? a[1] - halfPI - epsilon : halfPI - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfPI - epsilon : halfPI - b[1]);
  }
  var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate, [ -PI, -PI / 2 ]);
  function d3_geo_clipAntimeridianLine(listener) {
    var lambda0 = NaN, phi0 = NaN, slambda0 = NaN, clean;
    return {
      lineStart: function() {
        listener.lineStart();
        clean = 1;
      },
      point: function(lambda1, phi1) {
        var slambda1 = lambda1 > 0 ? PI : -PI, dlambda = abs(lambda1 - lambda0);
        if (abs(dlambda - PI) < epsilon) {
          listener.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPI : -halfPI);
          listener.point(slambda0, phi0);
          listener.lineEnd();
          listener.lineStart();
          listener.point(slambda1, phi0);
          listener.point(lambda1, phi0);
          clean = 0;
        } else if (slambda0 !== slambda1 && dlambda >= PI) {
          if (abs(lambda0 - slambda0) < epsilon) lambda0 -= slambda0 * epsilon;
          if (abs(lambda1 - slambda1) < epsilon) lambda1 -= slambda1 * epsilon;
          phi0 = d3_geo_clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
          listener.point(slambda0, phi0);
          listener.lineEnd();
          listener.lineStart();
          listener.point(slambda1, phi0);
          clean = 0;
        }
        listener.point(lambda0 = lambda1, phi0 = phi1);
        slambda0 = slambda1;
      },
      lineEnd: function() {
        listener.lineEnd();
        lambda0 = phi0 = NaN;
      },
      clean: function() {
        return 2 - clean;
      }
    };
  }
  function d3_geo_clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
    var cosphi0, cosphi1, sinlambda0_lambda1 = Math.sin(lambda0 - lambda1);
    return abs(sinlambda0_lambda1) > epsilon ? Math.atan((Math.sin(phi0) * (cosphi1 = Math.cos(phi1)) * Math.sin(lambda1) - Math.sin(phi1) * (cosphi0 = Math.cos(phi0)) * Math.sin(lambda0)) / (cosphi0 * cosphi1 * sinlambda0_lambda1)) : (phi0 + phi1) / 2;
  }
  function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
    var phi;
    if (from == null) {
      phi = direction * halfPI;
      listener.point(-PI, phi);
      listener.point(0, phi);
      listener.point(PI, phi);
      listener.point(PI, 0);
      listener.point(PI, -phi);
      listener.point(0, -phi);
      listener.point(-PI, -phi);
      listener.point(-PI, 0);
      listener.point(-PI, phi);
    } else if (abs(from[0] - to[0]) > epsilon) {
      var s = from[0] < to[0] ? PI : -PI;
      phi = direction * s / 2;
      listener.point(-s, phi);
      listener.point(0, phi);
      listener.point(s, phi);
    } else {
      listener.point(to[0], to[1]);
    }
  }
  function d3_geo_pointInPolygon(point, polygon) {
    var meridian = point[0], parallel = point[1], meridianNormal = [ Math.sin(meridian), -Math.cos(meridian), 0 ], polarAngle = 0, winding = 0;
    d3_geo_areaRingSum.reset();
    for (var i = 0, n = polygon.length; i < n; ++i) {
      var ring = polygon[i], m = ring.length;
      if (!m) continue;
      var point0 = ring[0], lambda0 = point0[0], phi0 = point0[1] / 2 + PI / 4, sinphi0 = Math.sin(phi0), cosphi0 = Math.cos(phi0), j = 1;
      while (true) {
        if (j === m) j = 0;
        point = ring[j];
        var lambda = point[0], phi = point[1] / 2 + PI / 4, sinphi = Math.sin(phi), cosphi = Math.cos(phi), dlambda = lambda - lambda0, sdlambda = dlambda >= 0 ? 1 : -1, adlambda = sdlambda * dlambda, antimeridian = adlambda > PI, k = sinphi0 * sinphi;
        d3_geo_areaRingSum.add(Math.atan2(k * sdlambda * Math.sin(adlambda), cosphi0 * cosphi + k * Math.cos(adlambda)));
        polarAngle += antimeridian ? dlambda + sdlambda * tau : dlambda;
        if (antimeridian ^ lambda0 >= meridian ^ lambda >= meridian) {
          var arc = d3_geo_cartesianCross(d3_geo_cartesian(point0), d3_geo_cartesian(point));
          d3_geo_cartesianNormalize(arc);
          var intersection = d3_geo_cartesianCross(meridianNormal, arc);
          d3_geo_cartesianNormalize(intersection);
          var phiarc = (antimeridian ^ dlambda >= 0 ? -1 : 1) * d3_asin(intersection[2]);
          if (parallel > phiarc || parallel === phiarc && (arc[0] || arc[1])) {
            winding += antimeridian ^ dlambda >= 0 ? 1 : -1;
          }
        }
        if (!j++) break;
        lambda0 = lambda, sinphi0 = sinphi, cosphi0 = cosphi, point0 = point;
      }
    }
    return (polarAngle < -epsilon || polarAngle < epsilon && d3_geo_areaRingSum < -epsilon) ^ winding & 1;
  }
  function d3_geo_clipCircle(radius) {
    var cr = Math.cos(radius), smallRadius = cr > 0, notHemisphere = abs(cr) > epsilon, interpolate = d3_geo_circleInterpolate(radius, 6 * d3_radians);
    return d3_geo_clip(visible, clipLine, interpolate, smallRadius ? [ 0, -radius ] : [ -PI, radius - PI ]);
    function visible(lambda, phi) {
      return Math.cos(lambda) * Math.cos(phi) > cr;
    }
    function clipLine(listener) {
      var point0, c0, v0, v00, clean;
      return {
        lineStart: function() {
          v00 = v0 = false;
          clean = 1;
        },
        point: function(lambda, phi) {
          var point1 = [ lambda, phi ], point2, v = visible(lambda, phi), c = smallRadius ? v ? 0 : code(lambda, phi) : v ? code(lambda + (lambda < 0 ? PI : -PI), phi) : 0;
          if (!point0 && (v00 = v0 = v)) listener.lineStart();
          if (v !== v0) {
            point2 = intersect(point0, point1);
            if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
              point1[0] += epsilon;
              point1[1] += epsilon;
              v = visible(point1[0], point1[1]);
            }
          }
          if (v !== v0) {
            clean = 0;
            if (v) {
              listener.lineStart();
              point2 = intersect(point1, point0);
              listener.point(point2[0], point2[1]);
            } else {
              point2 = intersect(point0, point1);
              listener.point(point2[0], point2[1]);
              listener.lineEnd();
            }
            point0 = point2;
          } else if (notHemisphere && point0 && smallRadius ^ v) {
            var t;
            if (!(c & c0) && (t = intersect(point1, point0, true))) {
              clean = 0;
              if (smallRadius) {
                listener.lineStart();
                listener.point(t[0][0], t[0][1]);
                listener.point(t[1][0], t[1][1]);
                listener.lineEnd();
              } else {
                listener.point(t[1][0], t[1][1]);
                listener.lineEnd();
                listener.lineStart();
                listener.point(t[0][0], t[0][1]);
              }
            }
          }
          if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) {
            listener.point(point1[0], point1[1]);
          }
          point0 = point1, v0 = v, c0 = c;
        },
        lineEnd: function() {
          if (v0) listener.lineEnd();
          point0 = null;
        },
        clean: function() {
          return clean | (v00 && v0) << 1;
        }
      };
    }
    function intersect(a, b, two) {
      var pa = d3_geo_cartesian(a), pb = d3_geo_cartesian(b);
      var n1 = [ 1, 0, 0 ], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
      if (!determinant) return !two && a;
      var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1), B = d3_geo_cartesianScale(n2, c2);
      d3_geo_cartesianAdd(A, B);
      var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u), t2 = w * w - uu * (d3_geo_cartesianDot(A, A) - 1);
      if (t2 < 0) return;
      var t = Math.sqrt(t2), q = d3_geo_cartesianScale(u, (-w - t) / uu);
      d3_geo_cartesianAdd(q, A);
      q = d3_geo_spherical(q);
      if (!two) return q;
      var lambda0 = a[0], lambda1 = b[0], phi0 = a[1], phi1 = b[1], z;
      if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;
      var deltalambda = lambda1 - lambda0, polar = abs(deltalambda - PI) < epsilon, meridian = polar || deltalambda < epsilon;
      if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;
      if (meridian ? polar ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1) : phi0 <= q[1] && q[1] <= phi1 : deltalambda > PI ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
        var q1 = d3_geo_cartesianScale(u, (-w + t) / uu);
        d3_geo_cartesianAdd(q1, A);
        return [ q, d3_geo_spherical(q1) ];
      }
    }
    function code(lambda, phi) {
      var r = smallRadius ? radius : PI - radius, code = 0;
      if (lambda < -r) code |= 1; else if (lambda > r) code |= 2;
      if (phi < -r) code |= 4; else if (phi > r) code |= 8;
      return code;
    }
  }
  function d3_geom_clipLine(x0, y0, x1, y1) {
    return function(line) {
      var a = line.a, b = line.b, ax = a.x, ay = a.y, bx = b.x, by = b.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
      r = x0 - ax;
      if (!dx && r > 0) return;
      r /= dx;
      if (dx < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dx > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }
      r = x1 - ax;
      if (!dx && r < 0) return;
      r /= dx;
      if (dx < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dx > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }
      r = y0 - ay;
      if (!dy && r > 0) return;
      r /= dy;
      if (dy < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dy > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }
      r = y1 - ay;
      if (!dy && r < 0) return;
      r /= dy;
      if (dy < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dy > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }
      if (t0 > 0) line.a = {
        x: ax + t0 * dx,
        y: ay + t0 * dy
      };
      if (t1 < 1) line.b = {
        x: ax + t1 * dx,
        y: ay + t1 * dy
      };
      return line;
    };
  }
  var d3_geo_clipExtentMAX = 1e9;
  d3.geo.clipExtent = function() {
    var x0, y0, x1, y1, stream, clip, clipExtent = {
      stream: function(output) {
        if (stream) stream.valid = false;
        stream = clip(output);
        stream.valid = true;
        return stream;
      },
      extent: function(_) {
        if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
        clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
        if (stream) stream.valid = false, stream = null;
        return clipExtent;
      }
    };
    return clipExtent.extent([ [ 0, 0 ], [ 960, 500 ] ]);
  };
  function d3_geo_clipExtent(x0, y0, x1, y1) {
    return function(listener) {
      var listener_ = listener, bufferListener = d3_geo_clipBufferListener(), clipLine = d3_geom_clipLine(x0, y0, x1, y1), segments, polygon, ring;
      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          listener = bufferListener;
          segments = [];
          polygon = [];
          clean = true;
        },
        polygonEnd: function() {
          listener = listener_;
          segments = d3.merge(segments);
          var clipStartInside = insidePolygon([ x0, y1 ]), inside = clean && clipStartInside, visible = segments.length;
          if (inside || visible) {
            listener.polygonStart();
            if (inside) {
              listener.lineStart();
              interpolate(null, null, 1, listener);
              listener.lineEnd();
            }
            if (visible) {
              d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
            }
            listener.polygonEnd();
          }
          segments = polygon = ring = null;
        }
      };
      function insidePolygon(p) {
        var wn = 0, n = polygon.length, y = p[1];
        for (var i = 0; i < n; ++i) {
          for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
            b = v[j];
            if (a[1] <= y) {
              if (b[1] > y && d3_cross2d(a, b, p) > 0) ++wn;
            } else {
              if (b[1] <= y && d3_cross2d(a, b, p) < 0) --wn;
            }
            a = b;
          }
        }
        return wn !== 0;
      }
      function interpolate(from, to, direction, listener) {
        var a = 0, a1 = 0;
        if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
          do {
            listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
          } while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          listener.point(to[0], to[1]);
        }
      }
      function pointVisible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }
      function point(x, y) {
        if (pointVisible(x, y)) listener.point(x, y);
      }
      var x__, y__, v__, x_, y_, v_, first, clean;
      function lineStart() {
        clip.point = linePoint;
        if (polygon) polygon.push(ring = []);
        first = true;
        v_ = false;
        x_ = y_ = NaN;
      }
      function lineEnd() {
        if (segments) {
          linePoint(x__, y__);
          if (v__ && v_) bufferListener.rejoin();
          segments.push(bufferListener.buffer());
        }
        clip.point = point;
        if (v_) listener.lineEnd();
      }
      function linePoint(x, y) {
        x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
        y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
        var v = pointVisible(x, y);
        if (polygon) ring.push([ x, y ]);
        if (first) {
          x__ = x, y__ = y, v__ = v;
          first = false;
          if (v) {
            listener.lineStart();
            listener.point(x, y);
          }
        } else {
          if (v && v_) listener.point(x, y); else {
            var l = {
              a: {
                x: x_,
                y: y_
              },
              b: {
                x: x,
                y: y
              }
            };
            if (clipLine(l)) {
              if (!v_) {
                listener.lineStart();
                listener.point(l.a.x, l.a.y);
              }
              listener.point(l.b.x, l.b.y);
              if (!v) listener.lineEnd();
              clean = false;
            } else if (v) {
              listener.lineStart();
              listener.point(x, y);
              clean = false;
            }
          }
        }
        x_ = x, y_ = y, v_ = v;
      }
      return clip;
    };
    function corner(p, direction) {
      return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
    }
    function compare(a, b) {
      return comparePoints(a.x, b.x);
    }
    function comparePoints(a, b) {
      var ca = corner(a, 1), cb = corner(b, 1);
      return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
    }
  }
  function d3_geo_conic(projectAt) {
    var phi0 = 0, phi1 = PI / 3, m = d3_geo_projectionMutator(projectAt), p = m(phi0, phi1);
    p.parallels = function(_) {
      if (!arguments.length) return [ phi0 / PI * 180, phi1 / PI * 180 ];
      return m(phi0 = _[0] * PI / 180, phi1 = _[1] * PI / 180);
    };
    return p;
  }
  function d3_geo_conicEqualArea(phi0, phi1) {
    var sinphi0 = Math.sin(phi0), n = (sinphi0 + Math.sin(phi1)) / 2, C = 1 + sinphi0 * (2 * n - sinphi0), rho0 = Math.sqrt(C) / n;
    function forward(lambda, phi) {
      var rho = Math.sqrt(C - 2 * n * Math.sin(phi)) / n;
      return [ rho * Math.sin(lambda *= n), rho0 - rho * Math.cos(lambda) ];
    }
    forward.invert = function(x, y) {
      var rho0_y = rho0 - y;
      return [ Math.atan2(x, rho0_y) / n, d3_asin((C - (x * x + rho0_y * rho0_y) * n * n) / (2 * n)) ];
    };
    return forward;
  }
  (d3.geo.conicEqualArea = function() {
    return d3_geo_conic(d3_geo_conicEqualArea);
  }).raw = d3_geo_conicEqualArea;
  d3.geo.albers = function() {
    return d3.geo.conicEqualArea().rotate([ 96, 0 ]).center([ -.6, 38.7 ]).parallels([ 29.5, 45.5 ]).scale(1070);
  };
  d3.geo.albersUsa = function() {
    var lower48 = d3.geo.albers();
    var alaska = d3.geo.conicEqualArea().rotate([ 154, 0 ]).center([ -2, 58.5 ]).parallels([ 55, 65 ]);
    var hawaii = d3.geo.conicEqualArea().rotate([ 157, 0 ]).center([ -3, 19.9 ]).parallels([ 8, 18 ]);
    var point, pointStream = {
      point: function(x, y) {
        point = [ x, y ];
      }
    }, lower48Point, alaskaPoint, hawaiiPoint;
    function albersUsa(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      point = null;
      (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || hawaiiPoint(x, y);
      return point;
    }
    albersUsa.invert = function(coordinates) {
      var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
      return (y >= .12 && y < .234 && x >= -.425 && x < -.214 ? alaska : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii : lower48).invert(coordinates);
    };
    albersUsa.stream = function(stream) {
      var lower48Stream = lower48.stream(stream), alaskaStream = alaska.stream(stream), hawaiiStream = hawaii.stream(stream);
      return {
        point: function(x, y) {
          lower48Stream.point(x, y);
          alaskaStream.point(x, y);
          hawaiiStream.point(x, y);
        },
        sphere: function() {
          lower48Stream.sphere();
          alaskaStream.sphere();
          hawaiiStream.sphere();
        },
        lineStart: function() {
          lower48Stream.lineStart();
          alaskaStream.lineStart();
          hawaiiStream.lineStart();
        },
        lineEnd: function() {
          lower48Stream.lineEnd();
          alaskaStream.lineEnd();
          hawaiiStream.lineEnd();
        },
        polygonStart: function() {
          lower48Stream.polygonStart();
          alaskaStream.polygonStart();
          hawaiiStream.polygonStart();
        },
        polygonEnd: function() {
          lower48Stream.polygonEnd();
          alaskaStream.polygonEnd();
          hawaiiStream.polygonEnd();
        }
      };
    };
    albersUsa.precision = function(_) {
      if (!arguments.length) return lower48.precision();
      lower48.precision(_);
      alaska.precision(_);
      hawaii.precision(_);
      return albersUsa;
    };
    albersUsa.scale = function(_) {
      if (!arguments.length) return lower48.scale();
      lower48.scale(_);
      alaska.scale(_ * .35);
      hawaii.scale(_);
      return albersUsa.translate(lower48.translate());
    };
    albersUsa.translate = function(_) {
      if (!arguments.length) return lower48.translate();
      var k = lower48.scale(), x = +_[0], y = +_[1];
      lower48Point = lower48.translate(_).clipExtent([ [ x - .455 * k, y - .238 * k ], [ x + .455 * k, y + .238 * k ] ]).stream(pointStream).point;
      alaskaPoint = alaska.translate([ x - .307 * k, y + .201 * k ]).clipExtent([ [ x - .425 * k + epsilon, y + .12 * k + epsilon ], [ x - .214 * k - epsilon, y + .234 * k - epsilon ] ]).stream(pointStream).point;
      hawaiiPoint = hawaii.translate([ x - .205 * k, y + .212 * k ]).clipExtent([ [ x - .214 * k + epsilon, y + .166 * k + epsilon ], [ x - .115 * k - epsilon, y + .234 * k - epsilon ] ]).stream(pointStream).point;
      return albersUsa;
    };
    return albersUsa.scale(1070);
  };
  var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
    point: d3_noop,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_pathAreaPolygon = 0;
      d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
    },
    polygonEnd: function() {
      d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
      d3_geo_pathAreaSum += abs(d3_geo_pathAreaPolygon / 2);
    }
  };
  function d3_geo_pathAreaRingStart() {
    var x00, y00, x0, y0;
    d3_geo_pathArea.point = function(x, y) {
      d3_geo_pathArea.point = nextPoint;
      x00 = x0 = x, y00 = y0 = y;
    };
    function nextPoint(x, y) {
      d3_geo_pathAreaPolygon += y0 * x - x0 * y;
      x0 = x, y0 = y;
    }
    d3_geo_pathArea.lineEnd = function() {
      nextPoint(x00, y00);
    };
  }
  var d3_geo_pathBoundsX0, d3_geo_pathBoundsY0, d3_geo_pathBoundsX1, d3_geo_pathBoundsY1;
  var d3_geo_pathBounds = {
    point: d3_geo_pathBoundsPoint,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: d3_noop,
    polygonEnd: d3_noop
  };
  function d3_geo_pathBoundsPoint(x, y) {
    if (x < d3_geo_pathBoundsX0) d3_geo_pathBoundsX0 = x;
    if (x > d3_geo_pathBoundsX1) d3_geo_pathBoundsX1 = x;
    if (y < d3_geo_pathBoundsY0) d3_geo_pathBoundsY0 = y;
    if (y > d3_geo_pathBoundsY1) d3_geo_pathBoundsY1 = y;
  }
  function d3_geo_pathBuffer() {
    var pointCircle = d3_geo_pathBufferCircle(4.5), buffer = [];
    var stream = {
      point: point,
      lineStart: function() {
        stream.point = pointLineStart;
      },
      lineEnd: lineEnd,
      polygonStart: function() {
        stream.lineEnd = lineEndPolygon;
      },
      polygonEnd: function() {
        stream.lineEnd = lineEnd;
        stream.point = point;
      },
      pointRadius: function(_) {
        pointCircle = d3_geo_pathBufferCircle(_);
        return stream;
      },
      result: function() {
        if (buffer.length) {
          var result = buffer.join("");
          buffer = [];
          return result;
        }
      }
    };
    function point(x, y) {
      buffer.push("M", x, ",", y, pointCircle);
    }
    function pointLineStart(x, y) {
      buffer.push("M", x, ",", y);
      stream.point = pointLine;
    }
    function pointLine(x, y) {
      buffer.push("L", x, ",", y);
    }
    function lineEnd() {
      stream.point = point;
    }
    function lineEndPolygon() {
      buffer.push("Z");
    }
    return stream;
  }
  function d3_geo_pathBufferCircle(radius) {
    return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
  }
  var d3_geo_pathCentroid = {
    point: d3_geo_pathCentroidPoint,
    lineStart: d3_geo_pathCentroidLineStart,
    lineEnd: d3_geo_pathCentroidLineEnd,
    polygonStart: function() {
      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
    },
    polygonEnd: function() {
      d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
      d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
    }
  };
  function d3_geo_pathCentroidPoint(x, y) {
    d3_geo_centroidX0 += x;
    d3_geo_centroidY0 += y;
    ++d3_geo_centroidZ0;
  }
  function d3_geo_pathCentroidLineStart() {
    var x0, y0;
    d3_geo_pathCentroid.point = function(x, y) {
      d3_geo_pathCentroid.point = nextPoint;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    };
    function nextPoint(x, y) {
      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
      d3_geo_centroidX1 += z * (x0 + x) / 2;
      d3_geo_centroidY1 += z * (y0 + y) / 2;
      d3_geo_centroidZ1 += z;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    }
  }
  function d3_geo_pathCentroidLineEnd() {
    d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
  }
  function d3_geo_pathCentroidRingStart() {
    var x00, y00, x0, y0;
    d3_geo_pathCentroid.point = function(x, y) {
      d3_geo_pathCentroid.point = nextPoint;
      d3_geo_pathCentroidPoint(x00 = x0 = x, y00 = y0 = y);
    };
    function nextPoint(x, y) {
      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
      d3_geo_centroidX1 += z * (x0 + x) / 2;
      d3_geo_centroidY1 += z * (y0 + y) / 2;
      d3_geo_centroidZ1 += z;
      z = y0 * x - x0 * y;
      d3_geo_centroidX2 += z * (x0 + x);
      d3_geo_centroidY2 += z * (y0 + y);
      d3_geo_centroidZ2 += z * 3;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    }
    d3_geo_pathCentroid.lineEnd = function() {
      nextPoint(x00, y00);
    };
  }
  function d3_geo_pathContext(context) {
    var pointRadius = 4.5;
    var stream = {
      point: point,
      lineStart: function() {
        stream.point = pointLineStart;
      },
      lineEnd: lineEnd,
      polygonStart: function() {
        stream.lineEnd = lineEndPolygon;
      },
      polygonEnd: function() {
        stream.lineEnd = lineEnd;
        stream.point = point;
      },
      pointRadius: function(_) {
        pointRadius = _;
        return stream;
      },
      result: d3_noop
    };
    function point(x, y) {
      context.moveTo(x + pointRadius, y);
      context.arc(x, y, pointRadius, 0, tau);
    }
    function pointLineStart(x, y) {
      context.moveTo(x, y);
      stream.point = pointLine;
    }
    function pointLine(x, y) {
      context.lineTo(x, y);
    }
    function lineEnd() {
      stream.point = point;
    }
    function lineEndPolygon() {
      context.closePath();
    }
    return stream;
  }
  function d3_geo_resample(project) {
    var delta2 = .5, cosMinDistance = Math.cos(30 * d3_radians), maxDepth = 16;
    function resample(stream) {
      return (maxDepth ? resampleRecursive : resampleNone)(stream);
    }
    function resampleNone(stream) {
      return d3_geo_transformPoint(stream, function(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      });
    }
    function resampleRecursive(stream) {
      var lambda00, phi00, x00, y00, a00, b00, c00, lambda0, x0, y0, a0, b0, c0;
      var resample = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          stream.polygonStart();
          resample.lineStart = ringStart;
        },
        polygonEnd: function() {
          stream.polygonEnd();
          resample.lineStart = lineStart;
        }
      };
      function point(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      }
      function lineStart() {
        x0 = NaN;
        resample.point = linePoint;
        stream.lineStart();
      }
      function linePoint(lambda, phi) {
        var c = d3_geo_cartesian([ lambda, phi ]), p = project(lambda, phi);
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
        stream.point(x0, y0);
      }
      function lineEnd() {
        resample.point = point;
        stream.lineEnd();
      }
      function ringStart() {
        lineStart();
        resample.point = ringPoint;
        resample.lineEnd = ringEnd;
      }
      function ringPoint(lambda, phi) {
        linePoint(lambda00 = lambda, phi00 = phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
        resample.point = linePoint;
      }
      function ringEnd() {
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
        resample.lineEnd = lineEnd;
        lineEnd();
      }
      return resample;
    }
    function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
      var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
      if (d2 > 4 * delta2 && depth--) {
        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c), phi2 = Math.asin(c /= m), lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : Math.atan2(b, a), p = project(lambda2, phi2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0, dz = dy * dx2 - dx * dy2;
        if (dz * dz / d2 > delta2 || abs((dx * dx2 + dy * dy2) / d2 - .5) > .3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
          stream.point(x2, y2);
          resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
        }
      }
    }
    resample.precision = function(_) {
      if (!arguments.length) return Math.sqrt(delta2);
      maxDepth = (delta2 = _ * _) > 0 && 16;
      return resample;
    };
    return resample;
  }
  d3.geo.path = function() {
    var pointRadius = 4.5, projection, context, projectStream, contextStream, cacheStream;
    function path(object) {
      if (object) {
        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
        if (!cacheStream || !cacheStream.valid) cacheStream = projectStream(contextStream);
        d3.geo.stream(object, cacheStream);
      }
      return contextStream.result();
    }
    path.area = function(object) {
      d3_geo_pathAreaSum = 0;
      d3.geo.stream(object, projectStream(d3_geo_pathArea));
      return d3_geo_pathAreaSum;
    };
    path.centroid = function(object) {
      d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
      d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
      return d3_geo_centroidZ2 ? [ d3_geo_centroidX2 / d3_geo_centroidZ2, d3_geo_centroidY2 / d3_geo_centroidZ2 ] : d3_geo_centroidZ1 ? [ d3_geo_centroidX1 / d3_geo_centroidZ1, d3_geo_centroidY1 / d3_geo_centroidZ1 ] : d3_geo_centroidZ0 ? [ d3_geo_centroidX0 / d3_geo_centroidZ0, d3_geo_centroidY0 / d3_geo_centroidZ0 ] : [ NaN, NaN ];
    };
    path.bounds = function(object) {
      d3_geo_pathBoundsX1 = d3_geo_pathBoundsY1 = -(d3_geo_pathBoundsX0 = d3_geo_pathBoundsY0 = Infinity);
      d3.geo.stream(object, projectStream(d3_geo_pathBounds));
      return [ [ d3_geo_pathBoundsX0, d3_geo_pathBoundsY0 ], [ d3_geo_pathBoundsX1, d3_geo_pathBoundsY1 ] ];
    };
    path.projection = function(_) {
      if (!arguments.length) return projection;
      projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
      return reset();
    };
    path.context = function(_) {
      if (!arguments.length) return context;
      contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
      return reset();
    };
    path.pointRadius = function(_) {
      if (!arguments.length) return pointRadius;
      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
      return path;
    };
    function reset() {
      cacheStream = null;
      return path;
    }
    return path.projection(d3.geo.albersUsa()).context(null);
  };
  function d3_geo_pathProjectStream(project) {
    var resample = d3_geo_resample(function(x, y) {
      return project([ x * d3_degrees, y * d3_degrees ]);
    });
    return function(stream) {
      return d3_geo_projectionRadians(resample(stream));
    };
  }
  d3.geo.transform = function(methods) {
    return {
      stream: function(stream) {
        var transform = new d3_geo_transform(stream);
        for (var k in methods) transform[k] = methods[k];
        return transform;
      }
    };
  };
  function d3_geo_transform(stream) {
    this.stream = stream;
  }
  d3_geo_transform.prototype = {
    point: function(x, y) {
      this.stream.point(x, y);
    },
    sphere: function() {
      this.stream.sphere();
    },
    lineStart: function() {
      this.stream.lineStart();
    },
    lineEnd: function() {
      this.stream.lineEnd();
    },
    polygonStart: function() {
      this.stream.polygonStart();
    },
    polygonEnd: function() {
      this.stream.polygonEnd();
    }
  };
  function d3_geo_transformPoint(stream, point) {
    return {
      point: point,
      sphere: function() {
        stream.sphere();
      },
      lineStart: function() {
        stream.lineStart();
      },
      lineEnd: function() {
        stream.lineEnd();
      },
      polygonStart: function() {
        stream.polygonStart();
      },
      polygonEnd: function() {
        stream.polygonEnd();
      }
    };
  }
  d3.geo.projection = d3_geo_projection;
  d3.geo.projectionMutator = d3_geo_projectionMutator;
  function d3_geo_projection(project) {
    return d3_geo_projectionMutator(function() {
      return project;
    })();
  }
  function d3_geo_projectionMutator(projectAt) {
    var project, rotate, projectRotate, projectResample = d3_geo_resample(function(x, y) {
      x = project(x, y);
      return [ x[0] * k + deltax, deltay - x[1] * k ];
    }), k = 150, x = 480, y = 250, lambda = 0, phi = 0, deltalambda = 0, deltaphi = 0, deltagamma = 0, deltax, deltay, preclip = d3_geo_clipAntimeridian, postclip = d3_identity, clipAngle = null, clipExtent = null, stream;
    function projection(point) {
      point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
      return [ point[0] * k + deltax, deltay - point[1] * k ];
    }
    function invert(point) {
      point = projectRotate.invert((point[0] - deltax) / k, (deltay - point[1]) / k);
      return point && [ point[0] * d3_degrees, point[1] * d3_degrees ];
    }
    projection.stream = function(output) {
      if (stream) stream.valid = false;
      stream = d3_geo_projectionRadians(preclip(rotate, projectResample(postclip(output))));
      stream.valid = true;
      return stream;
    };
    projection.clipAngle = function(_) {
      if (!arguments.length) return clipAngle;
      preclip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle((clipAngle = +_) * d3_radians);
      return invalidate();
    };
    projection.clipExtent = function(_) {
      if (!arguments.length) return clipExtent;
      clipExtent = _;
      postclip = _ ? d3_geo_clipExtent(_[0][0], _[0][1], _[1][0], _[1][1]) : d3_identity;
      return invalidate();
    };
    projection.scale = function(_) {
      if (!arguments.length) return k;
      k = +_;
      return reset();
    };
    projection.translate = function(_) {
      if (!arguments.length) return [ x, y ];
      x = +_[0];
      y = +_[1];
      return reset();
    };
    projection.center = function(_) {
      if (!arguments.length) return [ lambda * d3_degrees, phi * d3_degrees ];
      lambda = _[0] % 360 * d3_radians;
      phi = _[1] % 360 * d3_radians;
      return reset();
    };
    projection.rotate = function(_) {
      if (!arguments.length) return [ deltalambda * d3_degrees, deltaphi * d3_degrees, deltagamma * d3_degrees ];
      deltalambda = _[0] % 360 * d3_radians;
      deltaphi = _[1] % 360 * d3_radians;
      deltagamma = _.length > 2 ? _[2] % 360 * d3_radians : 0;
      return reset();
    };
    d3.rebind(projection, projectResample, "precision");
    function reset() {
      projectRotate = d3_geo_compose(rotate = d3_geo_rotation(deltalambda, deltaphi, deltagamma), project);
      var center = project(lambda, phi);
      deltax = x - center[0] * k;
      deltay = y + center[1] * k;
      return invalidate();
    }
    function invalidate() {
      if (stream) stream.valid = false, stream = null;
      return projection;
    }
    return function() {
      project = projectAt.apply(this, arguments);
      projection.invert = project.invert && invert;
      return reset();
    };
  }
  function d3_geo_projectionRadians(stream) {
    return d3_geo_transformPoint(stream, function(x, y) {
      stream.point(x * d3_radians, y * d3_radians);
    });
  }
  function d3_geo_equirectangular(lambda, phi) {
    return [ lambda, phi ];
  }
  (d3.geo.equirectangular = function() {
    return d3_geo_projection(d3_geo_equirectangular);
  }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
  d3.geo.rotation = function(rotate) {
    rotate = d3_geo_rotation(rotate[0] % 360 * d3_radians, rotate[1] * d3_radians, rotate.length > 2 ? rotate[2] * d3_radians : 0);
    function forward(coordinates) {
      coordinates = rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
    }
    forward.invert = function(coordinates) {
      coordinates = rotate.invert(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
    };
    return forward;
  };
  function d3_geo_identityRotation(lambda, phi) {
    return [ lambda > PI ? lambda - tau : lambda < -PI ? lambda + tau : lambda, phi ];
  }
  d3_geo_identityRotation.invert = d3_geo_equirectangular;
  function d3_geo_rotation(deltalambda, deltaphi, deltagamma) {
    return deltalambda ? deltaphi || deltagamma ? d3_geo_compose(d3_geo_rotationlambda(deltalambda), d3_geo_rotationphigamma(deltaphi, deltagamma)) : d3_geo_rotationlambda(deltalambda) : deltaphi || deltagamma ? d3_geo_rotationphigamma(deltaphi, deltagamma) : d3_geo_identityRotation;
  }
  function d3_geo_forwardRotationlambda(deltalambda) {
    return function(lambda, phi) {
      return lambda += deltalambda, [ lambda > PI ? lambda - tau : lambda < -PI ? lambda + tau : lambda, phi ];
    };
  }
  function d3_geo_rotationlambda(deltalambda) {
    var rotation = d3_geo_forwardRotationlambda(deltalambda);
    rotation.invert = d3_geo_forwardRotationlambda(-deltalambda);
    return rotation;
  }
  function d3_geo_rotationphigamma(deltaphi, deltagamma) {
    var cosdeltaphi = Math.cos(deltaphi), sindeltaphi = Math.sin(deltaphi), cosdeltagamma = Math.cos(deltagamma), sindeltagamma = Math.sin(deltagamma);
    function rotation(lambda, phi) {
      var cosphi = Math.cos(phi), x = Math.cos(lambda) * cosphi, y = Math.sin(lambda) * cosphi, z = Math.sin(phi), k = z * cosdeltaphi + x * sindeltaphi;
      return [ Math.atan2(y * cosdeltagamma - k * sindeltagamma, x * cosdeltaphi - z * sindeltaphi), d3_asin(k * cosdeltagamma + y * sindeltagamma) ];
    }
    rotation.invert = function(lambda, phi) {
      var cosphi = Math.cos(phi), x = Math.cos(lambda) * cosphi, y = Math.sin(lambda) * cosphi, z = Math.sin(phi), k = z * cosdeltagamma - y * sindeltagamma;
      return [ Math.atan2(y * cosdeltagamma + z * sindeltagamma, x * cosdeltaphi + k * sindeltaphi), d3_asin(k * cosdeltaphi - x * sindeltaphi) ];
    };
    return rotation;
  }
  d3.geo.circle = function() {
    var origin = [ 0, 0 ], angle, precision = 6, interpolate;
    function circle() {
      var center = typeof origin === "function" ? origin.apply(this, arguments) : origin, rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
      interpolate(null, null, 1, {
        point: function(x, y) {
          ring.push(x = rotate(x, y));
          x[0] *= d3_degrees, x[1] *= d3_degrees;
        }
      });
      return {
        type: "Polygon",
        coordinates: [ ring ]
      };
    }
    circle.origin = function(x) {
      if (!arguments.length) return origin;
      origin = x;
      return circle;
    };
    circle.angle = function(x) {
      if (!arguments.length) return angle;
      interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
      return circle;
    };
    circle.precision = function(_) {
      if (!arguments.length) return precision;
      interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
      return circle;
    };
    return circle.angle(90);
  };
  function d3_geo_circleInterpolate(radius, precision) {
    var cr = Math.cos(radius), sr = Math.sin(radius);
    return function(from, to, direction, listener) {
      var step = direction * precision;
      if (from != null) {
        from = d3_geo_circleAngle(cr, from);
        to = d3_geo_circleAngle(cr, to);
        if (direction > 0 ? from < to : from > to) from += direction * tau;
      } else {
        from = radius + direction * tau;
        to = radius - .5 * step;
      }
      for (var point, t = from; direction > 0 ? t > to : t < to; t -= step) {
        listener.point((point = d3_geo_spherical([ cr, -sr * Math.cos(t), -sr * Math.sin(t) ]))[0], point[1]);
      }
    };
  }
  function d3_geo_circleAngle(cr, point) {
    var a = d3_geo_cartesian(point);
    a[0] -= cr;
    d3_geo_cartesianNormalize(a);
    var angle = d3_acos(-a[1]);
    return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - epsilon) % (2 * Math.PI);
  }
  d3.geo.distance = function(a, b) {
    var deltalambda = (b[0] - a[0]) * d3_radians, phi0 = a[1] * d3_radians, phi1 = b[1] * d3_radians, sindeltalambda = Math.sin(deltalambda), cosdeltalambda = Math.cos(deltalambda), sinphi0 = Math.sin(phi0), cosphi0 = Math.cos(phi0), sinphi1 = Math.sin(phi1), cosphi1 = Math.cos(phi1), t;
    return Math.atan2(Math.sqrt((t = cosphi1 * sindeltalambda) * t + (t = cosphi0 * sinphi1 - sinphi0 * cosphi1 * cosdeltalambda) * t), sinphi0 * sinphi1 + cosphi0 * cosphi1 * cosdeltalambda);
  };
  d3.geo.graticule = function() {
    var x1, x0, X1, X0, y1, y0, Y1, Y0, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
    function graticule() {
      return {
        type: "MultiLineString",
        coordinates: lines()
      };
    }
    function lines() {
      return d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) {
        return abs(x % DX) > epsilon;
      }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).filter(function(y) {
        return abs(y % DY) > epsilon;
      }).map(y));
    }
    graticule.lines = function() {
      return lines().map(function(coordinates) {
        return {
          type: "LineString",
          coordinates: coordinates
        };
      });
    };
    graticule.outline = function() {
      return {
        type: "Polygon",
        coordinates: [ X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1)) ]
      };
    };
    graticule.extent = function(_) {
      if (!arguments.length) return graticule.minorExtent();
      return graticule.majorExtent(_).minorExtent(_);
    };
    graticule.majorExtent = function(_) {
      if (!arguments.length) return [ [ X0, Y0 ], [ X1, Y1 ] ];
      X0 = +_[0][0], X1 = +_[1][0];
      Y0 = +_[0][1], Y1 = +_[1][1];
      if (X0 > X1) _ = X0, X0 = X1, X1 = _;
      if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
      return graticule.precision(precision);
    };
    graticule.minorExtent = function(_) {
      if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
      x0 = +_[0][0], x1 = +_[1][0];
      y0 = +_[0][1], y1 = +_[1][1];
      if (x0 > x1) _ = x0, x0 = x1, x1 = _;
      if (y0 > y1) _ = y0, y0 = y1, y1 = _;
      return graticule.precision(precision);
    };
    graticule.step = function(_) {
      if (!arguments.length) return graticule.minorStep();
      return graticule.majorStep(_).minorStep(_);
    };
    graticule.majorStep = function(_) {
      if (!arguments.length) return [ DX, DY ];
      DX = +_[0], DY = +_[1];
      return graticule;
    };
    graticule.minorStep = function(_) {
      if (!arguments.length) return [ dx, dy ];
      dx = +_[0], dy = +_[1];
      return graticule;
    };
    graticule.precision = function(_) {
      if (!arguments.length) return precision;
      precision = +_;
      x = d3_geo_graticuleX(y0, y1, 90);
      y = d3_geo_graticuleY(x0, x1, precision);
      X = d3_geo_graticuleX(Y0, Y1, 90);
      Y = d3_geo_graticuleY(X0, X1, precision);
      return graticule;
    };
    return graticule.majorExtent([ [ -180, -90 + epsilon ], [ 180, 90 - epsilon ] ]).minorExtent([ [ -180, -80 - epsilon ], [ 180, 80 + epsilon ] ]);
  };
  function d3_geo_graticuleX(y0, y1, dy) {
    var y = d3.range(y0, y1 - epsilon, dy).concat(y1);
    return function(x) {
      return y.map(function(y) {
        return [ x, y ];
      });
    };
  }
  function d3_geo_graticuleY(x0, x1, dx) {
    var x = d3.range(x0, x1 - epsilon, dx).concat(x1);
    return function(y) {
      return x.map(function(x) {
        return [ x, y ];
      });
    };
  }
  function d3_source(d) {
    return d.source;
  }
  function d3_target(d) {
    return d.target;
  }
  d3.geo.greatArc = function() {
    var source = d3_source, source_, target = d3_target, target_;
    function greatArc() {
      return {
        type: "LineString",
        coordinates: [ source_ || source.apply(this, arguments), target_ || target.apply(this, arguments) ]
      };
    }
    greatArc.distance = function() {
      return d3.geo.distance(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments));
    };
    greatArc.source = function(_) {
      if (!arguments.length) return source;
      source = _, source_ = typeof _ === "function" ? null : _;
      return greatArc;
    };
    greatArc.target = function(_) {
      if (!arguments.length) return target;
      target = _, target_ = typeof _ === "function" ? null : _;
      return greatArc;
    };
    greatArc.precision = function() {
      return arguments.length ? greatArc : 0;
    };
    return greatArc;
  };
  d3.geo.interpolate = function(source, target) {
    return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
  };
  function d3_geo_interpolate(x0, y0, x1, y1) {
    var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1), kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1), ky1 = cy1 * Math.sin(x1), d = 2 * Math.asin(Math.sqrt(d3_haversin(y1 - y0) + cy0 * cy1 * d3_haversin(x1 - x0))), k = 1 / Math.sin(d);
    var interpolate = d ? function(t) {
      var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
      return [ Math.atan2(y, x) * d3_degrees, Math.atan2(z, Math.sqrt(x * x + y * y)) * d3_degrees ];
    } : function() {
      return [ x0 * d3_degrees, y0 * d3_degrees ];
    };
    interpolate.distance = d;
    return interpolate;
  }
  d3.geo.length = function(object) {
    d3_geo_lengthSum = 0;
    d3.geo.stream(object, d3_geo_length);
    return d3_geo_lengthSum;
  };
  var d3_geo_lengthSum;
  var d3_geo_length = {
    sphere: d3_noop,
    point: d3_noop,
    lineStart: d3_geo_lengthLineStart,
    lineEnd: d3_noop,
    polygonStart: d3_noop,
    polygonEnd: d3_noop
  };
  function d3_geo_lengthLineStart() {
    var lambda0, sinphi0, cosphi0;
    d3_geo_length.point = function(lambda, phi) {
      lambda0 = lambda * d3_radians, sinphi0 = Math.sin(phi *= d3_radians), cosphi0 = Math.cos(phi);
      d3_geo_length.point = nextPoint;
    };
    d3_geo_length.lineEnd = function() {
      d3_geo_length.point = d3_geo_length.lineEnd = d3_noop;
    };
    function nextPoint(lambda, phi) {
      var sinphi = Math.sin(phi *= d3_radians), cosphi = Math.cos(phi), t = abs((lambda *= d3_radians) - lambda0), cosdeltalambda = Math.cos(t);
      d3_geo_lengthSum += Math.atan2(Math.sqrt((t = cosphi * Math.sin(t)) * t + (t = cosphi0 * sinphi - sinphi0 * cosphi * cosdeltalambda) * t), sinphi0 * sinphi + cosphi0 * cosphi * cosdeltalambda);
      lambda0 = lambda, sinphi0 = sinphi, cosphi0 = cosphi;
    }
  }
  function d3_geo_azimuthal(scale, angle) {
    function azimuthal(lambda, phi) {
      var coslambda = Math.cos(lambda), cosphi = Math.cos(phi), k = scale(coslambda * cosphi);
      return [ k * cosphi * Math.sin(lambda), k * Math.sin(phi) ];
    }
    azimuthal.invert = function(x, y) {
      var rho = Math.sqrt(x * x + y * y), c = angle(rho), sinc = Math.sin(c), cosc = Math.cos(c);
      return [ Math.atan2(x * sinc, rho * cosc), Math.asin(rho && y * sinc / rho) ];
    };
    return azimuthal;
  }
  var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function(coslambdacosphi) {
    return Math.sqrt(2 / (1 + coslambdacosphi));
  }, function(rho) {
    return 2 * Math.asin(rho / 2);
  });
  (d3.geo.azimuthalEqualArea = function() {
    return d3_geo_projection(d3_geo_azimuthalEqualArea);
  }).raw = d3_geo_azimuthalEqualArea;
  var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function(coslambdacosphi) {
    var c = Math.acos(coslambdacosphi);
    return c && c / Math.sin(c);
  }, d3_identity);
  (d3.geo.azimuthalEquidistant = function() {
    return d3_geo_projection(d3_geo_azimuthalEquidistant);
  }).raw = d3_geo_azimuthalEquidistant;
  function d3_geo_conicConformal(phi0, phi1) {
    var cosphi0 = Math.cos(phi0), t = function(phi) {
      return Math.tan(PI / 4 + phi / 2);
    }, n = phi0 === phi1 ? Math.sin(phi0) : Math.log(cosphi0 / Math.cos(phi1)) / Math.log(t(phi1) / t(phi0)), F = cosphi0 * Math.pow(t(phi0), n) / n;
    if (!n) return d3_geo_mercator;
    function forward(lambda, phi) {
      if (F > 0) {
        if (phi < -halfPI + epsilon) phi = -halfPI + epsilon;
      } else {
        if (phi > halfPI - epsilon) phi = halfPI - epsilon;
      }
      var rho = F / Math.pow(t(phi), n);
      return [ rho * Math.sin(n * lambda), F - rho * Math.cos(n * lambda) ];
    }
    forward.invert = function(x, y) {
      var rho0_y = F - y, rho = d3_sgn(n) * Math.sqrt(x * x + rho0_y * rho0_y);
      return [ Math.atan2(x, rho0_y) / n, 2 * Math.atan(Math.pow(F / rho, 1 / n)) - halfPI ];
    };
    return forward;
  }
  (d3.geo.conicConformal = function() {
    return d3_geo_conic(d3_geo_conicConformal);
  }).raw = d3_geo_conicConformal;
  function d3_geo_conicEquidistant(phi0, phi1) {
    var cosphi0 = Math.cos(phi0), n = phi0 === phi1 ? Math.sin(phi0) : (cosphi0 - Math.cos(phi1)) / (phi1 - phi0), G = cosphi0 / n + phi0;
    if (abs(n) < epsilon) return d3_geo_equirectangular;
    function forward(lambda, phi) {
      var rho = G - phi;
      return [ rho * Math.sin(n * lambda), G - rho * Math.cos(n * lambda) ];
    }
    forward.invert = function(x, y) {
      var rho0_y = G - y;
      return [ Math.atan2(x, rho0_y) / n, G - d3_sgn(n) * Math.sqrt(x * x + rho0_y * rho0_y) ];
    };
    return forward;
  }
  (d3.geo.conicEquidistant = function() {
    return d3_geo_conic(d3_geo_conicEquidistant);
  }).raw = d3_geo_conicEquidistant;
  var d3_geo_gnomonic = d3_geo_azimuthal(function(coslambdacosphi) {
    return 1 / coslambdacosphi;
  }, Math.atan);
  (d3.geo.gnomonic = function() {
    return d3_geo_projection(d3_geo_gnomonic);
  }).raw = d3_geo_gnomonic;
  function d3_geo_mercator(lambda, phi) {
    return [ lambda, Math.log(Math.tan(PI / 4 + phi / 2)) ];
  }
  d3_geo_mercator.invert = function(x, y) {
    return [ x, 2 * Math.atan(Math.exp(y)) - halfPI ];
  };
  function d3_geo_mercatorProjection(project) {
    var m = d3_geo_projection(project), scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, clipAuto;
    m.scale = function() {
      var v = scale.apply(m, arguments);
      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
    };
    m.translate = function() {
      var v = translate.apply(m, arguments);
      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
    };
    m.clipExtent = function(_) {
      var v = clipExtent.apply(m, arguments);
      if (v === m) {
        if (clipAuto = _ == null) {
          var k = PI * scale(), t = translate();
          clipExtent([ [ t[0] - k, t[1] - k ], [ t[0] + k, t[1] + k ] ]);
        }
      } else if (clipAuto) {
        v = null;
      }
      return v;
    };
    return m.clipExtent(null);
  }
  (d3.geo.mercator = function() {
    return d3_geo_mercatorProjection(d3_geo_mercator);
  }).raw = d3_geo_mercator;
  var d3_geo_orthographic = d3_geo_azimuthal(function() {
    return 1;
  }, Math.asin);
  (d3.geo.orthographic = function() {
    return d3_geo_projection(d3_geo_orthographic);
  }).raw = d3_geo_orthographic;
  var d3_geo_stereographic = d3_geo_azimuthal(function(coslambdacosphi) {
    return 1 / (1 + coslambdacosphi);
  }, function(rho) {
    return 2 * Math.atan(rho);
  });
  (d3.geo.stereographic = function() {
    return d3_geo_projection(d3_geo_stereographic);
  }).raw = d3_geo_stereographic;
  function d3_geo_transverseMercator(lambda, phi) {
    return [ Math.log(Math.tan(PI / 4 + phi / 2)), -lambda ];
  }
  d3_geo_transverseMercator.invert = function(x, y) {
    return [ -y, 2 * Math.atan(Math.exp(x)) - halfPI ];
  };
  (d3.geo.transverseMercator = function() {
    var projection = d3_geo_mercatorProjection(d3_geo_transverseMercator), center = projection.center, rotate = projection.rotate;
    projection.center = function(_) {
      return _ ? center([ -_[1], _[0] ]) : (_ = center(), [ _[1], -_[0] ]);
    };
    projection.rotate = function(_) {
      return _ ? rotate([ _[0], _[1], _.length > 2 ? _[2] + 90 : 90 ]) : (_ = rotate(), 
      [ _[0], _[1], _[2] - 90 ]);
    };
    return rotate([ 0, 0, 90 ]);
  }).raw = d3_geo_transverseMercator;
  d3.geom = {};
  function d3_geom_pointX(d) {
    return d[0];
  }
  function d3_geom_pointY(d) {
    return d[1];
  }
  d3.geom.hull = function(vertices) {
    var x = d3_geom_pointX, y = d3_geom_pointY;
    if (arguments.length) return hull(vertices);
    function hull(data) {
      if (data.length < 3) return [];
      var fx = d3_functor(x), fy = d3_functor(y), i, n = data.length, points = [], flippedPoints = [];
      for (i = 0; i < n; i++) {
        points.push([ +fx.call(this, data[i], i), +fy.call(this, data[i], i), i ]);
      }
      points.sort(d3_geom_hullOrder);
      for (i = 0; i < n; i++) flippedPoints.push([ points[i][0], -points[i][1] ]);
      var upper = d3_geom_hullUpper(points), lower = d3_geom_hullUpper(flippedPoints);
      var skipLeft = lower[0] === upper[0], skipRight = lower[lower.length - 1] === upper[upper.length - 1], polygon = [];
      for (i = upper.length - 1; i >= 0; --i) polygon.push(data[points[upper[i]][2]]);
      for (i = +skipLeft; i < lower.length - skipRight; ++i) polygon.push(data[points[lower[i]][2]]);
      return polygon;
    }
    hull.x = function(_) {
      return arguments.length ? (x = _, hull) : x;
    };
    hull.y = function(_) {
      return arguments.length ? (y = _, hull) : y;
    };
    return hull;
  };
  function d3_geom_hullUpper(points) {
    var n = points.length, hull = [ 0, 1 ], hs = 2;
    for (var i = 2; i < n; i++) {
      while (hs > 1 && d3_cross2d(points[hull[hs - 2]], points[hull[hs - 1]], points[i]) <= 0) --hs;
      hull[hs++] = i;
    }
    return hull.slice(0, hs);
  }
  function d3_geom_hullOrder(a, b) {
    return a[0] - b[0] || a[1] - b[1];
  }
  d3.geom.polygon = function(coordinates) {
    d3_subclass(coordinates, d3_geom_polygonPrototype);
    return coordinates;
  };
  var d3_geom_polygonPrototype = d3.geom.polygon.prototype = [];
  d3_geom_polygonPrototype.area = function() {
    var i = -1, n = this.length, a, b = this[n - 1], area = 0;
    while (++i < n) {
      a = b;
      b = this[i];
      area += a[1] * b[0] - a[0] * b[1];
    }
    return area * .5;
  };
  d3_geom_polygonPrototype.centroid = function(k) {
    var i = -1, n = this.length, x = 0, y = 0, a, b = this[n - 1], c;
    if (!arguments.length) k = -1 / (6 * this.area());
    while (++i < n) {
      a = b;
      b = this[i];
      c = a[0] * b[1] - b[0] * a[1];
      x += (a[0] + b[0]) * c;
      y += (a[1] + b[1]) * c;
    }
    return [ x * k, y * k ];
  };
  d3_geom_polygonPrototype.clip = function(subject) {
    var input, closed = d3_geom_polygonClosed(subject), i = -1, n = this.length - d3_geom_polygonClosed(this), j, m, a = this[n - 1], b, c, d;
    while (++i < n) {
      input = subject.slice();
      subject.length = 0;
      b = this[i];
      c = input[(m = input.length - closed) - 1];
      j = -1;
      while (++j < m) {
        d = input[j];
        if (d3_geom_polygonInside(d, a, b)) {
          if (!d3_geom_polygonInside(c, a, b)) {
            subject.push(d3_geom_polygonIntersect(c, d, a, b));
          }
          subject.push(d);
        } else if (d3_geom_polygonInside(c, a, b)) {
          subject.push(d3_geom_polygonIntersect(c, d, a, b));
        }
        c = d;
      }
      if (closed) subject.push(subject[0]);
      a = b;
    }
    return subject;
  };
  function d3_geom_polygonInside(p, a, b) {
    return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
  }
  function d3_geom_polygonIntersect(c, d, a, b) {
    var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3, y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3, ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
    return [ x1 + ua * x21, y1 + ua * y21 ];
  }
  function d3_geom_polygonClosed(coordinates) {
    var a = coordinates[0], b = coordinates[coordinates.length - 1];
    return !(a[0] - b[0] || a[1] - b[1]);
  }
  var d3_geom_voronoiEdges, d3_geom_voronoiCells, d3_geom_voronoiBeaches, d3_geom_voronoiBeachPool = [], d3_geom_voronoiFirstCircle, d3_geom_voronoiCircles, d3_geom_voronoiCirclePool = [];
  function d3_geom_voronoiBeach() {
    d3_geom_voronoiRedBlackNode(this);
    this.edge = this.site = this.circle = null;
  }
  function d3_geom_voronoiCreateBeach(site) {
    var beach = d3_geom_voronoiBeachPool.pop() || new d3_geom_voronoiBeach();
    beach.site = site;
    return beach;
  }
  function d3_geom_voronoiDetachBeach(beach) {
    d3_geom_voronoiDetachCircle(beach);
    d3_geom_voronoiBeaches.remove(beach);
    d3_geom_voronoiBeachPool.push(beach);
    d3_geom_voronoiRedBlackNode(beach);
  }
  function d3_geom_voronoiRemoveBeach(beach) {
    var circle = beach.circle, x = circle.x, y = circle.cy, vertex = {
      x: x,
      y: y
    }, previous = beach.P, next = beach.N, disappearing = [ beach ];
    d3_geom_voronoiDetachBeach(beach);
    var lArc = previous;
    while (lArc.circle && abs(x - lArc.circle.x) < epsilon && abs(y - lArc.circle.cy) < epsilon) {
      previous = lArc.P;
      disappearing.unshift(lArc);
      d3_geom_voronoiDetachBeach(lArc);
      lArc = previous;
    }
    disappearing.unshift(lArc);
    d3_geom_voronoiDetachCircle(lArc);
    var rArc = next;
    while (rArc.circle && abs(x - rArc.circle.x) < epsilon && abs(y - rArc.circle.cy) < epsilon) {
      next = rArc.N;
      disappearing.push(rArc);
      d3_geom_voronoiDetachBeach(rArc);
      rArc = next;
    }
    disappearing.push(rArc);
    d3_geom_voronoiDetachCircle(rArc);
    var nArcs = disappearing.length, iArc;
    for (iArc = 1; iArc < nArcs; ++iArc) {
      rArc = disappearing[iArc];
      lArc = disappearing[iArc - 1];
      d3_geom_voronoiSetEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
    }
    lArc = disappearing[0];
    rArc = disappearing[nArcs - 1];
    rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, rArc.site, null, vertex);
    d3_geom_voronoiAttachCircle(lArc);
    d3_geom_voronoiAttachCircle(rArc);
  }
  function d3_geom_voronoiAddBeach(site) {
    var x = site.x, directrix = site.y, lArc, rArc, dxl, dxr, node = d3_geom_voronoiBeaches._;
    while (node) {
      dxl = d3_geom_voronoiLeftBreakPoint(node, directrix) - x;
      if (dxl > epsilon) node = node.L; else {
        dxr = x - d3_geom_voronoiRightBreakPoint(node, directrix);
        if (dxr > epsilon) {
          if (!node.R) {
            lArc = node;
            break;
          }
          node = node.R;
        } else {
          if (dxl > -epsilon) {
            lArc = node.P;
            rArc = node;
          } else if (dxr > -epsilon) {
            lArc = node;
            rArc = node.N;
          } else {
            lArc = rArc = node;
          }
          break;
        }
      }
    }
    var newArc = d3_geom_voronoiCreateBeach(site);
    d3_geom_voronoiBeaches.insert(lArc, newArc);
    if (!lArc && !rArc) return;
    if (lArc === rArc) {
      d3_geom_voronoiDetachCircle(lArc);
      rArc = d3_geom_voronoiCreateBeach(lArc.site);
      d3_geom_voronoiBeaches.insert(newArc, rArc);
      newArc.edge = rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
      d3_geom_voronoiAttachCircle(lArc);
      d3_geom_voronoiAttachCircle(rArc);
      return;
    }
    if (!rArc) {
      newArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
      return;
    }
    d3_geom_voronoiDetachCircle(lArc);
    d3_geom_voronoiDetachCircle(rArc);
    var lSite = lArc.site, ax = lSite.x, ay = lSite.y, bx = site.x - ax, by = site.y - ay, rSite = rArc.site, cx = rSite.x - ax, cy = rSite.y - ay, d = 2 * (bx * cy - by * cx), hb = bx * bx + by * by, hc = cx * cx + cy * cy, vertex = {
      x: (cy * hb - by * hc) / d + ax,
      y: (bx * hc - cx * hb) / d + ay
    };
    d3_geom_voronoiSetEdgeEnd(rArc.edge, lSite, rSite, vertex);
    newArc.edge = d3_geom_voronoiCreateEdge(lSite, site, null, vertex);
    rArc.edge = d3_geom_voronoiCreateEdge(site, rSite, null, vertex);
    d3_geom_voronoiAttachCircle(lArc);
    d3_geom_voronoiAttachCircle(rArc);
  }
  function d3_geom_voronoiLeftBreakPoint(arc, directrix) {
    var site = arc.site, rfocx = site.x, rfocy = site.y, pby2 = rfocy - directrix;
    if (!pby2) return rfocx;
    var lArc = arc.P;
    if (!lArc) return -Infinity;
    site = lArc.site;
    var lfocx = site.x, lfocy = site.y, plby2 = lfocy - directrix;
    if (!plby2) return lfocx;
    var hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
    if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
    return (rfocx + lfocx) / 2;
  }
  function d3_geom_voronoiRightBreakPoint(arc, directrix) {
    var rArc = arc.N;
    if (rArc) return d3_geom_voronoiLeftBreakPoint(rArc, directrix);
    var site = arc.site;
    return site.y === directrix ? site.x : Infinity;
  }
  function d3_geom_voronoiCell(site) {
    this.site = site;
    this.edges = [];
  }
  d3_geom_voronoiCell.prototype.prepare = function() {
    var halfEdges = this.edges, iHalfEdge = halfEdges.length, edge;
    while (iHalfEdge--) {
      edge = halfEdges[iHalfEdge].edge;
      if (!edge.b || !edge.a) halfEdges.splice(iHalfEdge, 1);
    }
    halfEdges.sort(d3_geom_voronoiHalfEdgeOrder);
    return halfEdges.length;
  };
  function d3_geom_voronoiCloseCells(extent) {
    var x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], x2, y2, x3, y3, cells = d3_geom_voronoiCells, iCell = cells.length, cell, iHalfEdge, halfEdges, nHalfEdges, start, end;
    while (iCell--) {
      cell = cells[iCell];
      if (!cell || !cell.prepare()) continue;
      halfEdges = cell.edges;
      nHalfEdges = halfEdges.length;
      iHalfEdge = 0;
      while (iHalfEdge < nHalfEdges) {
        end = halfEdges[iHalfEdge].end(), x3 = end.x, y3 = end.y;
        start = halfEdges[++iHalfEdge % nHalfEdges].start(), x2 = start.x, y2 = start.y;
        if (abs(x3 - x2) > epsilon || abs(y3 - y2) > epsilon) {
          halfEdges.splice(iHalfEdge, 0, new d3_geom_voronoiHalfEdge(d3_geom_voronoiCreateBorderEdge(cell.site, end, abs(x3 - x0) < epsilon && y1 - y3 > epsilon ? {
            x: x0,
            y: abs(x2 - x0) < epsilon ? y2 : y1
          } : abs(y3 - y1) < epsilon && x1 - x3 > epsilon ? {
            x: abs(y2 - y1) < epsilon ? x2 : x1,
            y: y1
          } : abs(x3 - x1) < epsilon && y3 - y0 > epsilon ? {
            x: x1,
            y: abs(x2 - x1) < epsilon ? y2 : y0
          } : abs(y3 - y0) < epsilon && x3 - x0 > epsilon ? {
            x: abs(y2 - y0) < epsilon ? x2 : x0,
            y: y0
          } : null), cell.site, null));
          ++nHalfEdges;
        }
      }
    }
  }
  function d3_geom_voronoiHalfEdgeOrder(a, b) {
    return b.angle - a.angle;
  }
  function d3_geom_voronoiCircle() {
    d3_geom_voronoiRedBlackNode(this);
    this.x = this.y = this.arc = this.site = this.cy = null;
  }
  function d3_geom_voronoiAttachCircle(arc) {
    var lArc = arc.P, rArc = arc.N;
    if (!lArc || !rArc) return;
    var lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
    if (lSite === rSite) return;
    var bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx, cy = rSite.y - by;
    var d = 2 * (ax * cy - ay * cx);
    if (d >= -epsilon2) return;
    var ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d, y = (ax * hc - cx * ha) / d, cy = y + by;
    var circle = d3_geom_voronoiCirclePool.pop() || new d3_geom_voronoiCircle();
    circle.arc = arc;
    circle.site = cSite;
    circle.x = x + bx;
    circle.y = cy + Math.sqrt(x * x + y * y);
    circle.cy = cy;
    arc.circle = circle;
    var before = null, node = d3_geom_voronoiCircles._;
    while (node) {
      if (circle.y < node.y || circle.y === node.y && circle.x <= node.x) {
        if (node.L) node = node.L; else {
          before = node.P;
          break;
        }
      } else {
        if (node.R) node = node.R; else {
          before = node;
          break;
        }
      }
    }
    d3_geom_voronoiCircles.insert(before, circle);
    if (!before) d3_geom_voronoiFirstCircle = circle;
  }
  function d3_geom_voronoiDetachCircle(arc) {
    var circle = arc.circle;
    if (circle) {
      if (!circle.P) d3_geom_voronoiFirstCircle = circle.N;
      d3_geom_voronoiCircles.remove(circle);
      d3_geom_voronoiCirclePool.push(circle);
      d3_geom_voronoiRedBlackNode(circle);
      arc.circle = null;
    }
  }
  function d3_geom_voronoiClipEdges(extent) {
    var edges = d3_geom_voronoiEdges, clip = d3_geom_clipLine(extent[0][0], extent[0][1], extent[1][0], extent[1][1]), i = edges.length, e;
    while (i--) {
      e = edges[i];
      if (!d3_geom_voronoiConnectEdge(e, extent) || !clip(e) || abs(e.a.x - e.b.x) < epsilon && abs(e.a.y - e.b.y) < epsilon) {
        e.a = e.b = null;
        edges.splice(i, 1);
      }
    }
  }
  function d3_geom_voronoiConnectEdge(edge, extent) {
    var vb = edge.b;
    if (vb) return true;
    var va = edge.a, x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], lSite = edge.l, rSite = edge.r, lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y, fx = (lx + rx) / 2, fy = (ly + ry) / 2, fm, fb;
    if (ry === ly) {
      if (fx < x0 || fx >= x1) return;
      if (lx > rx) {
        if (!va) va = {
          x: fx,
          y: y0
        }; else if (va.y >= y1) return;
        vb = {
          x: fx,
          y: y1
        };
      } else {
        if (!va) va = {
          x: fx,
          y: y1
        }; else if (va.y < y0) return;
        vb = {
          x: fx,
          y: y0
        };
      }
    } else {
      fm = (lx - rx) / (ry - ly);
      fb = fy - fm * fx;
      if (fm < -1 || fm > 1) {
        if (lx > rx) {
          if (!va) va = {
            x: (y0 - fb) / fm,
            y: y0
          }; else if (va.y >= y1) return;
          vb = {
            x: (y1 - fb) / fm,
            y: y1
          };
        } else {
          if (!va) va = {
            x: (y1 - fb) / fm,
            y: y1
          }; else if (va.y < y0) return;
          vb = {
            x: (y0 - fb) / fm,
            y: y0
          };
        }
      } else {
        if (ly < ry) {
          if (!va) va = {
            x: x0,
            y: fm * x0 + fb
          }; else if (va.x >= x1) return;
          vb = {
            x: x1,
            y: fm * x1 + fb
          };
        } else {
          if (!va) va = {
            x: x1,
            y: fm * x1 + fb
          }; else if (va.x < x0) return;
          vb = {
            x: x0,
            y: fm * x0 + fb
          };
        }
      }
    }
    edge.a = va;
    edge.b = vb;
    return true;
  }
  function d3_geom_voronoiEdge(lSite, rSite) {
    this.l = lSite;
    this.r = rSite;
    this.a = this.b = null;
  }
  function d3_geom_voronoiCreateEdge(lSite, rSite, va, vb) {
    var edge = new d3_geom_voronoiEdge(lSite, rSite);
    d3_geom_voronoiEdges.push(edge);
    if (va) d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, va);
    if (vb) d3_geom_voronoiSetEdgeEnd(edge, rSite, lSite, vb);
    d3_geom_voronoiCells[lSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, lSite, rSite));
    d3_geom_voronoiCells[rSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, rSite, lSite));
    return edge;
  }
  function d3_geom_voronoiCreateBorderEdge(lSite, va, vb) {
    var edge = new d3_geom_voronoiEdge(lSite, null);
    edge.a = va;
    edge.b = vb;
    d3_geom_voronoiEdges.push(edge);
    return edge;
  }
  function d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, vertex) {
    if (!edge.a && !edge.b) {
      edge.a = vertex;
      edge.l = lSite;
      edge.r = rSite;
    } else if (edge.l === rSite) {
      edge.b = vertex;
    } else {
      edge.a = vertex;
    }
  }
  function d3_geom_voronoiHalfEdge(edge, lSite, rSite) {
    var va = edge.a, vb = edge.b;
    this.edge = edge;
    this.site = lSite;
    this.angle = rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x) : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y) : Math.atan2(va.x - vb.x, vb.y - va.y);
  }
  d3_geom_voronoiHalfEdge.prototype = {
    start: function() {
      return this.edge.l === this.site ? this.edge.a : this.edge.b;
    },
    end: function() {
      return this.edge.l === this.site ? this.edge.b : this.edge.a;
    }
  };
  function d3_geom_voronoiRedBlackTree() {
    this._ = null;
  }
  function d3_geom_voronoiRedBlackNode(node) {
    node.U = node.C = node.L = node.R = node.P = node.N = null;
  }
  d3_geom_voronoiRedBlackTree.prototype = {
    insert: function(after, node) {
      var parent, grandpa, uncle;
      if (after) {
        node.P = after;
        node.N = after.N;
        if (after.N) after.N.P = node;
        after.N = node;
        if (after.R) {
          after = after.R;
          while (after.L) after = after.L;
          after.L = node;
        } else {
          after.R = node;
        }
        parent = after;
      } else if (this._) {
        after = d3_geom_voronoiRedBlackFirst(this._);
        node.P = null;
        node.N = after;
        after.P = after.L = node;
        parent = after;
      } else {
        node.P = node.N = null;
        this._ = node;
        parent = null;
      }
      node.L = node.R = null;
      node.U = parent;
      node.C = true;
      after = node;
      while (parent && parent.C) {
        grandpa = parent.U;
        if (parent === grandpa.L) {
          uncle = grandpa.R;
          if (uncle && uncle.C) {
            parent.C = uncle.C = false;
            grandpa.C = true;
            after = grandpa;
          } else {
            if (after === parent.R) {
              d3_geom_voronoiRedBlackRotateLeft(this, parent);
              after = parent;
              parent = after.U;
            }
            parent.C = false;
            grandpa.C = true;
            d3_geom_voronoiRedBlackRotateRight(this, grandpa);
          }
        } else {
          uncle = grandpa.L;
          if (uncle && uncle.C) {
            parent.C = uncle.C = false;
            grandpa.C = true;
            after = grandpa;
          } else {
            if (after === parent.L) {
              d3_geom_voronoiRedBlackRotateRight(this, parent);
              after = parent;
              parent = after.U;
            }
            parent.C = false;
            grandpa.C = true;
            d3_geom_voronoiRedBlackRotateLeft(this, grandpa);
          }
        }
        parent = after.U;
      }
      this._.C = false;
    },
    remove: function(node) {
      if (node.N) node.N.P = node.P;
      if (node.P) node.P.N = node.N;
      node.N = node.P = null;
      var parent = node.U, sibling, left = node.L, right = node.R, next, red;
      if (!left) next = right; else if (!right) next = left; else next = d3_geom_voronoiRedBlackFirst(right);
      if (parent) {
        if (parent.L === node) parent.L = next; else parent.R = next;
      } else {
        this._ = next;
      }
      if (left && right) {
        red = next.C;
        next.C = node.C;
        next.L = left;
        left.U = next;
        if (next !== right) {
          parent = next.U;
          next.U = node.U;
          node = next.R;
          parent.L = node;
          next.R = right;
          right.U = next;
        } else {
          next.U = parent;
          parent = next;
          node = next.R;
        }
      } else {
        red = node.C;
        node = next;
      }
      if (node) node.U = parent;
      if (red) return;
      if (node && node.C) {
        node.C = false;
        return;
      }
      do {
        if (node === this._) break;
        if (node === parent.L) {
          sibling = parent.R;
          if (sibling.C) {
            sibling.C = false;
            parent.C = true;
            d3_geom_voronoiRedBlackRotateLeft(this, parent);
            sibling = parent.R;
          }
          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
            if (!sibling.R || !sibling.R.C) {
              sibling.L.C = false;
              sibling.C = true;
              d3_geom_voronoiRedBlackRotateRight(this, sibling);
              sibling = parent.R;
            }
            sibling.C = parent.C;
            parent.C = sibling.R.C = false;
            d3_geom_voronoiRedBlackRotateLeft(this, parent);
            node = this._;
            break;
          }
        } else {
          sibling = parent.L;
          if (sibling.C) {
            sibling.C = false;
            parent.C = true;
            d3_geom_voronoiRedBlackRotateRight(this, parent);
            sibling = parent.L;
          }
          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
            if (!sibling.L || !sibling.L.C) {
              sibling.R.C = false;
              sibling.C = true;
              d3_geom_voronoiRedBlackRotateLeft(this, sibling);
              sibling = parent.L;
            }
            sibling.C = parent.C;
            parent.C = sibling.L.C = false;
            d3_geom_voronoiRedBlackRotateRight(this, parent);
            node = this._;
            break;
          }
        }
        sibling.C = true;
        node = parent;
        parent = parent.U;
      } while (!node.C);
      if (node) node.C = false;
    }
  };
  function d3_geom_voronoiRedBlackRotateLeft(tree, node) {
    var p = node, q = node.R, parent = p.U;
    if (parent) {
      if (parent.L === p) parent.L = q; else parent.R = q;
    } else {
      tree._ = q;
    }
    q.U = parent;
    p.U = q;
    p.R = q.L;
    if (p.R) p.R.U = p;
    q.L = p;
  }
  function d3_geom_voronoiRedBlackRotateRight(tree, node) {
    var p = node, q = node.L, parent = p.U;
    if (parent) {
      if (parent.L === p) parent.L = q; else parent.R = q;
    } else {
      tree._ = q;
    }
    q.U = parent;
    p.U = q;
    p.L = q.R;
    if (p.L) p.L.U = p;
    q.R = p;
  }
  function d3_geom_voronoiRedBlackFirst(node) {
    while (node.L) node = node.L;
    return node;
  }
  function d3_geom_voronoi(sites, bbox) {
    var site = sites.sort(d3_geom_voronoiVertexOrder).pop(), x0, y0, circle;
    d3_geom_voronoiEdges = [];
    d3_geom_voronoiCells = new Array(sites.length);
    d3_geom_voronoiBeaches = new d3_geom_voronoiRedBlackTree();
    d3_geom_voronoiCircles = new d3_geom_voronoiRedBlackTree();
    while (true) {
      circle = d3_geom_voronoiFirstCircle;
      if (site && (!circle || site.y < circle.y || site.y === circle.y && site.x < circle.x)) {
        if (site.x !== x0 || site.y !== y0) {
          d3_geom_voronoiCells[site.i] = new d3_geom_voronoiCell(site);
          d3_geom_voronoiAddBeach(site);
          x0 = site.x, y0 = site.y;
        }
        site = sites.pop();
      } else if (circle) {
        d3_geom_voronoiRemoveBeach(circle.arc);
      } else {
        break;
      }
    }
    if (bbox) d3_geom_voronoiClipEdges(bbox), d3_geom_voronoiCloseCells(bbox);
    var diagram = {
      cells: d3_geom_voronoiCells,
      edges: d3_geom_voronoiEdges
    };
    d3_geom_voronoiBeaches = d3_geom_voronoiCircles = d3_geom_voronoiEdges = d3_geom_voronoiCells = null;
    return diagram;
  }
  function d3_geom_voronoiVertexOrder(a, b) {
    return b.y - a.y || b.x - a.x;
  }
  d3.geom.voronoi = function(points) {
    var x = d3_geom_pointX, y = d3_geom_pointY, fx = x, fy = y, clipExtent = d3_geom_voronoiClipExtent;
    if (points) return voronoi(points);
    function voronoi(data) {
      var polygons = new Array(data.length), x0 = clipExtent[0][0], y0 = clipExtent[0][1], x1 = clipExtent[1][0], y1 = clipExtent[1][1];
      d3_geom_voronoi(sites(data), clipExtent).cells.forEach(function(cell, i) {
        var edges = cell.edges, site = cell.site, polygon = polygons[i] = edges.length ? edges.map(function(e) {
          var s = e.start();
          return [ s.x, s.y ];
        }) : site.x >= x0 && site.x <= x1 && site.y >= y0 && site.y <= y1 ? [ [ x0, y1 ], [ x1, y1 ], [ x1, y0 ], [ x0, y0 ] ] : [];
        polygon.point = data[i];
      });
      return polygons;
    }
    function sites(data) {
      return data.map(function(d, i) {
        return {
          x: Math.round(fx(d, i) / epsilon) * epsilon,
          y: Math.round(fy(d, i) / epsilon) * epsilon,
          i: i
        };
      });
    }
    voronoi.links = function(data) {
      return d3_geom_voronoi(sites(data)).edges.filter(function(edge) {
        return edge.l && edge.r;
      }).map(function(edge) {
        return {
          source: data[edge.l.i],
          target: data[edge.r.i]
        };
      });
    };
    voronoi.triangles = function(data) {
      var triangles = [];
      d3_geom_voronoi(sites(data)).cells.forEach(function(cell, i) {
        var site = cell.site, edges = cell.edges.sort(d3_geom_voronoiHalfEdgeOrder), j = -1, m = edges.length, e0, s0, e1 = edges[m - 1].edge, s1 = e1.l === site ? e1.r : e1.l;
        while (++j < m) {
          e0 = e1;
          s0 = s1;
          e1 = edges[j].edge;
          s1 = e1.l === site ? e1.r : e1.l;
          if (i < s0.i && i < s1.i && d3_geom_voronoiTriangleArea(site, s0, s1) < 0) {
            triangles.push([ data[i], data[s0.i], data[s1.i] ]);
          }
        }
      });
      return triangles;
    };
    voronoi.x = function(_) {
      return arguments.length ? (fx = d3_functor(x = _), voronoi) : x;
    };
    voronoi.y = function(_) {
      return arguments.length ? (fy = d3_functor(y = _), voronoi) : y;
    };
    voronoi.clipExtent = function(_) {
      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent;
      clipExtent = _ == null ? d3_geom_voronoiClipExtent : _;
      return voronoi;
    };
    voronoi.size = function(_) {
      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent && clipExtent[1];
      return voronoi.clipExtent(_ && [ [ 0, 0 ], _ ]);
    };
    return voronoi;
  };
  var d3_geom_voronoiClipExtent = [ [ -1e6, -1e6 ], [ 1e6, 1e6 ] ];
  function d3_geom_voronoiTriangleArea(a, b, c) {
    return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
  }
  d3.geom.delaunay = function(vertices) {
    return d3.geom.voronoi().triangles(vertices);
  };
  d3.geom.quadtree = function(points, x1, y1, x2, y2) {
    var x = d3_geom_pointX, y = d3_geom_pointY, compat;
    if (compat = arguments.length) {
      x = d3_geom_quadtreeCompatX;
      y = d3_geom_quadtreeCompatY;
      if (compat === 3) {
        y2 = y1;
        x2 = x1;
        y1 = x1 = 0;
      }
      return quadtree(points);
    }
    function quadtree(data) {
      var d, fx = d3_functor(x), fy = d3_functor(y), xs, ys, i, n, x1_, y1_, x2_, y2_;
      if (x1 != null) {
        x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
      } else {
        x2_ = y2_ = -(x1_ = y1_ = Infinity);
        xs = [], ys = [];
        n = data.length;
        if (compat) for (i = 0; i < n; ++i) {
          d = data[i];
          if (d.x < x1_) x1_ = d.x;
          if (d.y < y1_) y1_ = d.y;
          if (d.x > x2_) x2_ = d.x;
          if (d.y > y2_) y2_ = d.y;
          xs.push(d.x);
          ys.push(d.y);
        } else for (i = 0; i < n; ++i) {
          var x_ = +fx(d = data[i], i), y_ = +fy(d, i);
          if (x_ < x1_) x1_ = x_;
          if (y_ < y1_) y1_ = y_;
          if (x_ > x2_) x2_ = x_;
          if (y_ > y2_) y2_ = y_;
          xs.push(x_);
          ys.push(y_);
        }
      }
      var dx = x2_ - x1_, dy = y2_ - y1_;
      if (dx > dy) y2_ = y1_ + dx; else x2_ = x1_ + dy;
      function insert(n, d, x, y, x1, y1, x2, y2) {
        if (isNaN(x) || isNaN(y)) return;
        if (n.leaf) {
          var nx = n.x, ny = n.y;
          if (nx != null) {
            if (abs(nx - x) + abs(ny - y) < .01) {
              insertChild(n, d, x, y, x1, y1, x2, y2);
            } else {
              var nPoint = n.point;
              n.x = n.y = n.point = null;
              insertChild(n, nPoint, nx, ny, x1, y1, x2, y2);
              insertChild(n, d, x, y, x1, y1, x2, y2);
            }
          } else {
            n.x = x, n.y = y, n.point = d;
          }
        } else {
          insertChild(n, d, x, y, x1, y1, x2, y2);
        }
      }
      function insertChild(n, d, x, y, x1, y1, x2, y2) {
        var xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym, i = below << 1 | right;
        n.leaf = false;
        n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
        if (right) x1 = xm; else x2 = xm;
        if (below) y1 = ym; else y2 = ym;
        insert(n, d, x, y, x1, y1, x2, y2);
      }
      var root = d3_geom_quadtreeNode();
      root.add = function(d) {
        insert(root, d, +fx(d, ++i), +fy(d, i), x1_, y1_, x2_, y2_);
      };
      root.visit = function(f) {
        d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
      };
      root.find = function(point) {
        return d3_geom_quadtreeFind(root, point[0], point[1], x1_, y1_, x2_, y2_);
      };
      i = -1;
      if (x1 == null) {
        while (++i < n) {
          insert(root, data[i], xs[i], ys[i], x1_, y1_, x2_, y2_);
        }
        --i;
      } else data.forEach(root.add);
      xs = ys = data = d = null;
      return root;
    }
    quadtree.x = function(_) {
      return arguments.length ? (x = _, quadtree) : x;
    };
    quadtree.y = function(_) {
      return arguments.length ? (y = _, quadtree) : y;
    };
    quadtree.extent = function(_) {
      if (!arguments.length) return x1 == null ? null : [ [ x1, y1 ], [ x2, y2 ] ];
      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], 
      y2 = +_[1][1];
      return quadtree;
    };
    quadtree.size = function(_) {
      if (!arguments.length) return x1 == null ? null : [ x2 - x1, y2 - y1 ];
      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
      return quadtree;
    };
    return quadtree;
  };
  function d3_geom_quadtreeCompatX(d) {
    return d.x;
  }
  function d3_geom_quadtreeCompatY(d) {
    return d.y;
  }
  function d3_geom_quadtreeNode() {
    return {
      leaf: true,
      nodes: [],
      point: null,
      x: null,
      y: null
    };
  }
  function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
    if (!f(node, x1, y1, x2, y2)) {
      var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, children = node.nodes;
      if (children[0]) d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
      if (children[1]) d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
      if (children[2]) d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
      if (children[3]) d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
    }
  }
  function d3_geom_quadtreeFind(root, x, y, x0, y0, x3, y3) {
    var minDistance2 = Infinity, closestPoint;
    (function find(node, x1, y1, x2, y2) {
      if (x1 > x3 || y1 > y3 || x2 < x0 || y2 < y0) return;
      if (point = node.point) {
        var point, dx = x - node.x, dy = y - node.y, distance2 = dx * dx + dy * dy;
        if (distance2 < minDistance2) {
          var distance = Math.sqrt(minDistance2 = distance2);
          x0 = x - distance, y0 = y - distance;
          x3 = x + distance, y3 = y + distance;
          closestPoint = point;
        }
      }
      var children = node.nodes, xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym;
      for (var i = below << 1 | right, j = i + 4; i < j; ++i) {
        if (node = children[i & 3]) switch (i & 3) {
         case 0:
          find(node, x1, y1, xm, ym);
          break;

         case 1:
          find(node, xm, y1, x2, ym);
          break;

         case 2:
          find(node, x1, ym, xm, y2);
          break;

         case 3:
          find(node, xm, ym, x2, y2);
          break;
        }
      }
    })(root, x0, y0, x3, y3);
    return closestPoint;
  }
  d3.interpolateRgb = d3_interpolateRgb;
  function d3_interpolateRgb(a, b) {
    a = d3.rgb(a);
    b = d3.rgb(b);
    var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
    return function(t) {
      return "#" + d3_rgb_hex(Math.round(ar + br * t)) + d3_rgb_hex(Math.round(ag + bg * t)) + d3_rgb_hex(Math.round(ab + bb * t));
    };
  }
  d3.interpolateObject = d3_interpolateObject;
  function d3_interpolateObject(a, b) {
    var i = {}, c = {}, k;
    for (k in a) {
      if (k in b) {
        i[k] = d3_interpolate(a[k], b[k]);
      } else {
        c[k] = a[k];
      }
    }
    for (k in b) {
      if (!(k in a)) {
        c[k] = b[k];
      }
    }
    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }
  d3.interpolateNumber = d3_interpolateNumber;
  function d3_interpolateNumber(a, b) {
    a = +a, b = +b;
    return function(t) {
      return a * (1 - t) + b * t;
    };
  }
  d3.interpolateString = d3_interpolateString;
  function d3_interpolateString(a, b) {
    var bi = d3_interpolate_numberA.lastIndex = d3_interpolate_numberB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    a = a + "", b = b + "";
    while ((am = d3_interpolate_numberA.exec(a)) && (bm = d3_interpolate_numberB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i]) s[i] += bm; else s[++i] = bm;
      } else {
        s[++i] = null;
        q.push({
          i: i,
          x: d3_interpolateNumber(am, bm)
        });
      }
      bi = d3_interpolate_numberB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; else s[++i] = bs;
    }
    return s.length < 2 ? q[0] ? (b = q[0].x, function(t) {
      return b(t) + "";
    }) : function() {
      return b;
    } : (b = q.length, function(t) {
      for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    });
  }
  var d3_interpolate_numberA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, d3_interpolate_numberB = new RegExp(d3_interpolate_numberA.source, "g");
  d3.interpolate = d3_interpolate;
  function d3_interpolate(a, b) {
    var i = d3.interpolators.length, f;
    while (--i >= 0 && !(f = d3.interpolators[i](a, b))) ;
    return f;
  }
  d3.interpolators = [ function(a, b) {
    var t = typeof b;
    return (t === "string" ? d3_rgb_names.has(b.toLowerCase()) || /^(#|rgb\(|hsl\()/i.test(b) ? d3_interpolateRgb : d3_interpolateString : b instanceof d3_color ? d3_interpolateRgb : Array.isArray(b) ? d3_interpolateArray : t === "object" && isNaN(b) ? d3_interpolateObject : d3_interpolateNumber)(a, b);
  } ];
  d3.interpolateArray = d3_interpolateArray;
  function d3_interpolateArray(a, b) {
    var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
    for (i = 0; i < n0; ++i) x.push(d3_interpolate(a[i], b[i]));
    for (;i < na; ++i) c[i] = a[i];
    for (;i < nb; ++i) c[i] = b[i];
    return function(t) {
      for (i = 0; i < n0; ++i) c[i] = x[i](t);
      return c;
    };
  }
  var d3_ease_default = function() {
    return d3_identity;
  };
  var d3_ease = d3.map({
    linear: d3_ease_default,
    poly: d3_ease_poly,
    quad: function() {
      return d3_ease_quad;
    },
    cubic: function() {
      return d3_ease_cubic;
    },
    sin: function() {
      return d3_ease_sin;
    },
    exp: function() {
      return d3_ease_exp;
    },
    circle: function() {
      return d3_ease_circle;
    },
    elastic: d3_ease_elastic,
    back: d3_ease_back,
    bounce: function() {
      return d3_ease_bounce;
    }
  });
  var d3_ease_mode = d3.map({
    "in": d3_identity,
    out: d3_ease_reverse,
    "in-out": d3_ease_reflect,
    "out-in": function(f) {
      return d3_ease_reflect(d3_ease_reverse(f));
    }
  });
  d3.ease = function(name) {
    var i = name.indexOf("-"), t = i >= 0 ? name.slice(0, i) : name, m = i >= 0 ? name.slice(i + 1) : "in";
    t = d3_ease.get(t) || d3_ease_default;
    m = d3_ease_mode.get(m) || d3_identity;
    return d3_ease_clamp(m(t.apply(null, d3_arraySlice.call(arguments, 1))));
  };
  function d3_ease_clamp(f) {
    return function(t) {
      return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
    };
  }
  function d3_ease_reverse(f) {
    return function(t) {
      return 1 - f(1 - t);
    };
  }
  function d3_ease_reflect(f) {
    return function(t) {
      return .5 * (t < .5 ? f(2 * t) : 2 - f(2 - 2 * t));
    };
  }
  function d3_ease_quad(t) {
    return t * t;
  }
  function d3_ease_cubic(t) {
    return t * t * t;
  }
  function d3_ease_cubicInOut(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    var t2 = t * t, t3 = t2 * t;
    return 4 * (t < .5 ? t3 : 3 * (t - t2) + t3 - .75);
  }
  function d3_ease_poly(e) {
    return function(t) {
      return Math.pow(t, e);
    };
  }
  function d3_ease_sin(t) {
    return 1 - Math.cos(t * halfPI);
  }
  function d3_ease_exp(t) {
    return Math.pow(2, 10 * (t - 1));
  }
  function d3_ease_circle(t) {
    return 1 - Math.sqrt(1 - t * t);
  }
  function d3_ease_elastic(a, p) {
    var s;
    if (arguments.length < 2) p = .45;
    if (arguments.length) s = p / tau * Math.asin(1 / a); else a = 1, s = p / 4;
    return function(t) {
      return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * tau / p);
    };
  }
  function d3_ease_back(s) {
    if (!s) s = 1.70158;
    return function(t) {
      return t * t * ((s + 1) * t - s);
    };
  }
  function d3_ease_bounce(t) {
    return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
  }
  d3.interpolateHcl = d3_interpolateHcl;
  function d3_interpolateHcl(a, b) {
    a = d3.hcl(a);
    b = d3.hcl(b);
    var ah = a.h, ac = a.c, al = a.l, bh = b.h - ah, bc = b.c - ac, bl = b.l - al;
    if (isNaN(bc)) bc = 0, ac = isNaN(ac) ? b.c : ac;
    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
    return function(t) {
      return d3_hcl_lab(ah + bh * t, ac + bc * t, al + bl * t) + "";
    };
  }
  d3.interpolateHsl = d3_interpolateHsl;
  function d3_interpolateHsl(a, b) {
    a = d3.hsl(a);
    b = d3.hsl(b);
    var ah = a.h, as = a.s, al = a.l, bh = b.h - ah, bs = b.s - as, bl = b.l - al;
    if (isNaN(bs)) bs = 0, as = isNaN(as) ? b.s : as;
    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
    return function(t) {
      return d3_hsl_rgb(ah + bh * t, as + bs * t, al + bl * t) + "";
    };
  }
  d3.interpolateLab = d3_interpolateLab;
  function d3_interpolateLab(a, b) {
    a = d3.lab(a);
    b = d3.lab(b);
    var al = a.l, aa = a.a, ab = a.b, bl = b.l - al, ba = b.a - aa, bb = b.b - ab;
    return function(t) {
      return d3_lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + "";
    };
  }
  d3.interpolateRound = d3_interpolateRound;
  function d3_interpolateRound(a, b) {
    b -= a;
    return function(t) {
      return Math.round(a + b * t);
    };
  }
  d3.transform = function(string) {
    var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
    return (d3.transform = function(string) {
      if (string != null) {
        g.setAttribute("transform", string);
        var t = g.transform.baseVal.consolidate();
      }
      return new d3_transform(t ? t.matrix : d3_transformIdentity);
    })(string);
  };
  function d3_transform(m) {
    var r0 = [ m.a, m.b ], r1 = [ m.c, m.d ], kx = d3_transformNormalize(r0), kz = d3_transformDot(r0, r1), ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
    if (r0[0] * r1[1] < r1[0] * r0[1]) {
      r0[0] *= -1;
      r0[1] *= -1;
      kx *= -1;
      kz *= -1;
    }
    this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
    this.translate = [ m.e, m.f ];
    this.scale = [ kx, ky ];
    this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
  }
  d3_transform.prototype.toString = function() {
    return "translate(" + this.translate + ")rotate(" + this.rotate + ")skewX(" + this.skew + ")scale(" + this.scale + ")";
  };
  function d3_transformDot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }
  function d3_transformNormalize(a) {
    var k = Math.sqrt(d3_transformDot(a, a));
    if (k) {
      a[0] /= k;
      a[1] /= k;
    }
    return k;
  }
  function d3_transformCombine(a, b, k) {
    a[0] += k * b[0];
    a[1] += k * b[1];
    return a;
  }
  var d3_transformIdentity = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0
  };
  d3.interpolateTransform = d3_interpolateTransform;
  function d3_interpolateTransformPop(s) {
    return s.length ? s.pop() + "," : "";
  }
  function d3_interpolateTranslate(ta, tb, s, q) {
    if (ta[0] !== tb[0] || ta[1] !== tb[1]) {
      var i = s.push("translate(", null, ",", null, ")");
      q.push({
        i: i - 4,
        x: d3_interpolateNumber(ta[0], tb[0])
      }, {
        i: i - 2,
        x: d3_interpolateNumber(ta[1], tb[1])
      });
    } else if (tb[0] || tb[1]) {
      s.push("translate(" + tb + ")");
    }
  }
  function d3_interpolateRotate(ra, rb, s, q) {
    if (ra !== rb) {
      if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360;
      q.push({
        i: s.push(d3_interpolateTransformPop(s) + "rotate(", null, ")") - 2,
        x: d3_interpolateNumber(ra, rb)
      });
    } else if (rb) {
      s.push(d3_interpolateTransformPop(s) + "rotate(" + rb + ")");
    }
  }
  function d3_interpolateSkew(wa, wb, s, q) {
    if (wa !== wb) {
      q.push({
        i: s.push(d3_interpolateTransformPop(s) + "skewX(", null, ")") - 2,
        x: d3_interpolateNumber(wa, wb)
      });
    } else if (wb) {
      s.push(d3_interpolateTransformPop(s) + "skewX(" + wb + ")");
    }
  }
  function d3_interpolateScale(ka, kb, s, q) {
    if (ka[0] !== kb[0] || ka[1] !== kb[1]) {
      var i = s.push(d3_interpolateTransformPop(s) + "scale(", null, ",", null, ")");
      q.push({
        i: i - 4,
        x: d3_interpolateNumber(ka[0], kb[0])
      }, {
        i: i - 2,
        x: d3_interpolateNumber(ka[1], kb[1])
      });
    } else if (kb[0] !== 1 || kb[1] !== 1) {
      s.push(d3_interpolateTransformPop(s) + "scale(" + kb + ")");
    }
  }
  function d3_interpolateTransform(a, b) {
    var s = [], q = [];
    a = d3.transform(a), b = d3.transform(b);
    d3_interpolateTranslate(a.translate, b.translate, s, q);
    d3_interpolateRotate(a.rotate, b.rotate, s, q);
    d3_interpolateSkew(a.skew, b.skew, s, q);
    d3_interpolateScale(a.scale, b.scale, s, q);
    a = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  }
  function d3_uninterpolateNumber(a, b) {
    b = (b -= a = +a) || 1 / b;
    return function(x) {
      return (x - a) / b;
    };
  }
  function d3_uninterpolateClamp(a, b) {
    b = (b -= a = +a) || 1 / b;
    return function(x) {
      return Math.max(0, Math.min(1, (x - a) / b));
    };
  }
  d3.layout = {};
  d3.layout.bundle = function() {
    return function(links) {
      var paths = [], i = -1, n = links.length;
      while (++i < n) paths.push(d3_layout_bundlePath(links[i]));
      return paths;
    };
  };
  function d3_layout_bundlePath(link) {
    var start = link.source, end = link.target, lca = d3_layout_bundleLeastCommonAncestor(start, end), points = [ start ];
    while (start !== lca) {
      start = start.parent;
      points.push(start);
    }
    var k = points.length;
    while (end !== lca) {
      points.splice(k, 0, end);
      end = end.parent;
    }
    return points;
  }
  function d3_layout_bundleAncestors(node) {
    var ancestors = [], parent = node.parent;
    while (parent != null) {
      ancestors.push(node);
      node = parent;
      parent = parent.parent;
    }
    ancestors.push(node);
    return ancestors;
  }
  function d3_layout_bundleLeastCommonAncestor(a, b) {
    if (a === b) return a;
    var aNodes = d3_layout_bundleAncestors(a), bNodes = d3_layout_bundleAncestors(b), aNode = aNodes.pop(), bNode = bNodes.pop(), sharedNode = null;
    while (aNode === bNode) {
      sharedNode = aNode;
      aNode = aNodes.pop();
      bNode = bNodes.pop();
    }
    return sharedNode;
  }
  d3.layout.chord = function() {
    var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
    function relayout() {
      var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
      chords = [];
      groups = [];
      k = 0, i = -1;
      while (++i < n) {
        x = 0, j = -1;
        while (++j < n) {
          x += matrix[i][j];
        }
        groupSums.push(x);
        subgroupIndex.push(d3.range(n));
        k += x;
      }
      if (sortGroups) {
        groupIndex.sort(function(a, b) {
          return sortGroups(groupSums[a], groupSums[b]);
        });
      }
      if (sortSubgroups) {
        subgroupIndex.forEach(function(d, i) {
          d.sort(function(a, b) {
            return sortSubgroups(matrix[i][a], matrix[i][b]);
          });
        });
      }
      k = (tau - padding * n) / k;
      x = 0, i = -1;
      while (++i < n) {
        x0 = x, j = -1;
        while (++j < n) {
          var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
          subgroups[di + "-" + dj] = {
            index: di,
            subindex: dj,
            startAngle: a0,
            endAngle: a1,
            value: v
          };
        }
        groups[di] = {
          index: di,
          startAngle: x0,
          endAngle: x,
          value: groupSums[di]
        };
        x += padding;
      }
      i = -1;
      while (++i < n) {
        j = i - 1;
        while (++j < n) {
          var source = subgroups[i + "-" + j], target = subgroups[j + "-" + i];
          if (source.value || target.value) {
            chords.push(source.value < target.value ? {
              source: target,
              target: source
            } : {
              source: source,
              target: target
            });
          }
        }
      }
      if (sortChords) resort();
    }
    function resort() {
      chords.sort(function(a, b) {
        return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
      });
    }
    chord.matrix = function(x) {
      if (!arguments.length) return matrix;
      n = (matrix = x) && matrix.length;
      chords = groups = null;
      return chord;
    };
    chord.padding = function(x) {
      if (!arguments.length) return padding;
      padding = x;
      chords = groups = null;
      return chord;
    };
    chord.sortGroups = function(x) {
      if (!arguments.length) return sortGroups;
      sortGroups = x;
      chords = groups = null;
      return chord;
    };
    chord.sortSubgroups = function(x) {
      if (!arguments.length) return sortSubgroups;
      sortSubgroups = x;
      chords = null;
      return chord;
    };
    chord.sortChords = function(x) {
      if (!arguments.length) return sortChords;
      sortChords = x;
      if (chords) resort();
      return chord;
    };
    chord.chords = function() {
      if (!chords) relayout();
      return chords;
    };
    chord.groups = function() {
      if (!groups) relayout();
      return groups;
    };
    return chord;
  };
  d3.layout.force = function() {
    var force = {}, event = d3.dispatch("start", "tick", "end"), timer, size = [ 1, 1 ], drag, alpha, friction = .9, linkDistance = d3_layout_forceLinkDistance, linkStrength = d3_layout_forceLinkStrength, charge = -30, chargeDistance2 = d3_layout_forceChargeDistance2, gravity = .1, theta2 = .64, nodes = [], links = [], distances, strengths, charges;
    function repulse(node) {
      return function(quad, x1, _, x2) {
        if (quad.point !== node) {
          var dx = quad.cx - node.x, dy = quad.cy - node.y, dw = x2 - x1, dn = dx * dx + dy * dy;
          if (dw * dw / theta2 < dn) {
            if (dn < chargeDistance2) {
              var k = quad.charge / dn;
              node.px -= dx * k;
              node.py -= dy * k;
            }
            return true;
          }
          if (quad.point && dn && dn < chargeDistance2) {
            var k = quad.pointCharge / dn;
            node.px -= dx * k;
            node.py -= dy * k;
          }
        }
        return !quad.charge;
      };
    }
    force.tick = function() {
      if ((alpha *= .99) < .005) {
        timer = null;
        event.end({
          type: "end",
          alpha: alpha = 0
        });
        return true;
      }
      var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
      for (i = 0; i < m; ++i) {
        o = links[i];
        s = o.source;
        t = o.target;
        x = t.x - s.x;
        y = t.y - s.y;
        if (l = x * x + y * y) {
          l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
          x *= l;
          y *= l;
          t.x -= x * (k = s.weight + t.weight ? s.weight / (s.weight + t.weight) : .5);
          t.y -= y * k;
          s.x += x * (k = 1 - k);
          s.y += y * k;
        }
      }
      if (k = alpha * gravity) {
        x = size[0] / 2;
        y = size[1] / 2;
        i = -1;
        if (k) while (++i < n) {
          o = nodes[i];
          o.x += (x - o.x) * k;
          o.y += (y - o.y) * k;
        }
      }
      if (charge) {
        d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
        i = -1;
        while (++i < n) {
          if (!(o = nodes[i]).fixed) {
            q.visit(repulse(o));
          }
        }
      }
      i = -1;
      while (++i < n) {
        o = nodes[i];
        if (o.fixed) {
          o.x = o.px;
          o.y = o.py;
        } else {
          o.x -= (o.px - (o.px = o.x)) * friction;
          o.y -= (o.py - (o.py = o.y)) * friction;
        }
      }
      event.tick({
        type: "tick",
        alpha: alpha
      });
    };
    force.nodes = function(x) {
      if (!arguments.length) return nodes;
      nodes = x;
      return force;
    };
    force.links = function(x) {
      if (!arguments.length) return links;
      links = x;
      return force;
    };
    force.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return force;
    };
    force.linkDistance = function(x) {
      if (!arguments.length) return linkDistance;
      linkDistance = typeof x === "function" ? x : +x;
      return force;
    };
    force.distance = force.linkDistance;
    force.linkStrength = function(x) {
      if (!arguments.length) return linkStrength;
      linkStrength = typeof x === "function" ? x : +x;
      return force;
    };
    force.friction = function(x) {
      if (!arguments.length) return friction;
      friction = +x;
      return force;
    };
    force.charge = function(x) {
      if (!arguments.length) return charge;
      charge = typeof x === "function" ? x : +x;
      return force;
    };
    force.chargeDistance = function(x) {
      if (!arguments.length) return Math.sqrt(chargeDistance2);
      chargeDistance2 = x * x;
      return force;
    };
    force.gravity = function(x) {
      if (!arguments.length) return gravity;
      gravity = +x;
      return force;
    };
    force.theta = function(x) {
      if (!arguments.length) return Math.sqrt(theta2);
      theta2 = x * x;
      return force;
    };
    force.alpha = function(x) {
      if (!arguments.length) return alpha;
      x = +x;
      if (alpha) {
        if (x > 0) {
          alpha = x;
        } else {
          timer.c = null, timer.t = NaN, timer = null;
          event.end({
            type: "end",
            alpha: alpha = 0
          });
        }
      } else if (x > 0) {
        event.start({
          type: "start",
          alpha: alpha = x
        });
        timer = d3_timer(force.tick);
      }
      return force;
    };
    force.start = function() {
      var i, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
      for (i = 0; i < n; ++i) {
        (o = nodes[i]).index = i;
        o.weight = 0;
      }
      for (i = 0; i < m; ++i) {
        o = links[i];
        if (typeof o.source == "number") o.source = nodes[o.source];
        if (typeof o.target == "number") o.target = nodes[o.target];
        ++o.source.weight;
        ++o.target.weight;
      }
      for (i = 0; i < n; ++i) {
        o = nodes[i];
        if (isNaN(o.x)) o.x = position("x", w);
        if (isNaN(o.y)) o.y = position("y", h);
        if (isNaN(o.px)) o.px = o.x;
        if (isNaN(o.py)) o.py = o.y;
      }
      distances = [];
      if (typeof linkDistance === "function") for (i = 0; i < m; ++i) distances[i] = +linkDistance.call(this, links[i], i); else for (i = 0; i < m; ++i) distances[i] = linkDistance;
      strengths = [];
      if (typeof linkStrength === "function") for (i = 0; i < m; ++i) strengths[i] = +linkStrength.call(this, links[i], i); else for (i = 0; i < m; ++i) strengths[i] = linkStrength;
      charges = [];
      if (typeof charge === "function") for (i = 0; i < n; ++i) charges[i] = +charge.call(this, nodes[i], i); else for (i = 0; i < n; ++i) charges[i] = charge;
      function position(dimension, size) {
        if (!neighbors) {
          neighbors = new Array(n);
          for (j = 0; j < n; ++j) {
            neighbors[j] = [];
          }
          for (j = 0; j < m; ++j) {
            var o = links[j];
            neighbors[o.source.index].push(o.target);
            neighbors[o.target.index].push(o.source);
          }
        }
        var candidates = neighbors[i], j = -1, l = candidates.length, x;
        while (++j < l) if (!isNaN(x = candidates[j][dimension])) return x;
        return Math.random() * size;
      }
      return force.resume();
    };
    force.resume = function() {
      return force.alpha(.1);
    };
    force.stop = function() {
      return force.alpha(0);
    };
    force.drag = function() {
      if (!drag) drag = d3.behavior.drag().origin(d3_identity).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
      if (!arguments.length) return drag;
      this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
    };
    function dragmove(d) {
      d.px = d3.event.x, d.py = d3.event.y;
      force.resume();
    }
    return d3.rebind(force, event, "on");
  };
  function d3_layout_forceDragstart(d) {
    d.fixed |= 2;
  }
  function d3_layout_forceDragend(d) {
    d.fixed &= ~6;
  }
  function d3_layout_forceMouseover(d) {
    d.fixed |= 4;
    d.px = d.x, d.py = d.y;
  }
  function d3_layout_forceMouseout(d) {
    d.fixed &= ~4;
  }
  function d3_layout_forceAccumulate(quad, alpha, charges) {
    var cx = 0, cy = 0;
    quad.charge = 0;
    if (!quad.leaf) {
      var nodes = quad.nodes, n = nodes.length, i = -1, c;
      while (++i < n) {
        c = nodes[i];
        if (c == null) continue;
        d3_layout_forceAccumulate(c, alpha, charges);
        quad.charge += c.charge;
        cx += c.charge * c.cx;
        cy += c.charge * c.cy;
      }
    }
    if (quad.point) {
      if (!quad.leaf) {
        quad.point.x += Math.random() - .5;
        quad.point.y += Math.random() - .5;
      }
      var k = alpha * charges[quad.point.index];
      quad.charge += quad.pointCharge = k;
      cx += k * quad.point.x;
      cy += k * quad.point.y;
    }
    quad.cx = cx / quad.charge;
    quad.cy = cy / quad.charge;
  }
  var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1, d3_layout_forceChargeDistance2 = Infinity;
  d3.layout.hierarchy = function() {
    var sort = d3_layout_hierarchySort, children = d3_layout_hierarchyChildren, value = d3_layout_hierarchyValue;
    function hierarchy(root) {
      var stack = [ root ], nodes = [], node;
      root.depth = 0;
      while ((node = stack.pop()) != null) {
        nodes.push(node);
        if ((childs = children.call(hierarchy, node, node.depth)) && (n = childs.length)) {
          var n, childs, child;
          while (--n >= 0) {
            stack.push(child = childs[n]);
            child.parent = node;
            child.depth = node.depth + 1;
          }
          if (value) node.value = 0;
          node.children = childs;
        } else {
          if (value) node.value = +value.call(hierarchy, node, node.depth) || 0;
          delete node.children;
        }
      }
      d3_layout_hierarchyVisitAfter(root, function(node) {
        var childs, parent;
        if (sort && (childs = node.children)) childs.sort(sort);
        if (value && (parent = node.parent)) parent.value += node.value;
      });
      return nodes;
    }
    hierarchy.sort = function(x) {
      if (!arguments.length) return sort;
      sort = x;
      return hierarchy;
    };
    hierarchy.children = function(x) {
      if (!arguments.length) return children;
      children = x;
      return hierarchy;
    };
    hierarchy.value = function(x) {
      if (!arguments.length) return value;
      value = x;
      return hierarchy;
    };
    hierarchy.revalue = function(root) {
      if (value) {
        d3_layout_hierarchyVisitBefore(root, function(node) {
          if (node.children) node.value = 0;
        });
        d3_layout_hierarchyVisitAfter(root, function(node) {
          var parent;
          if (!node.children) node.value = +value.call(hierarchy, node, node.depth) || 0;
          if (parent = node.parent) parent.value += node.value;
        });
      }
      return root;
    };
    return hierarchy;
  };
  function d3_layout_hierarchyRebind(object, hierarchy) {
    d3.rebind(object, hierarchy, "sort", "children", "value");
    object.nodes = object;
    object.links = d3_layout_hierarchyLinks;
    return object;
  }
  function d3_layout_hierarchyVisitBefore(node, callback) {
    var nodes = [ node ];
    while ((node = nodes.pop()) != null) {
      callback(node);
      if ((children = node.children) && (n = children.length)) {
        var n, children;
        while (--n >= 0) nodes.push(children[n]);
      }
    }
  }
  function d3_layout_hierarchyVisitAfter(node, callback) {
    var nodes = [ node ], nodes2 = [];
    while ((node = nodes.pop()) != null) {
      nodes2.push(node);
      if ((children = node.children) && (n = children.length)) {
        var i = -1, n, children;
        while (++i < n) nodes.push(children[i]);
      }
    }
    while ((node = nodes2.pop()) != null) {
      callback(node);
    }
  }
  function d3_layout_hierarchyChildren(d) {
    return d.children;
  }
  function d3_layout_hierarchyValue(d) {
    return d.value;
  }
  function d3_layout_hierarchySort(a, b) {
    return b.value - a.value;
  }
  function d3_layout_hierarchyLinks(nodes) {
    return d3.merge(nodes.map(function(parent) {
      return (parent.children || []).map(function(child) {
        return {
          source: parent,
          target: child
        };
      });
    }));
  }
  d3.layout.partition = function() {
    var hierarchy = d3.layout.hierarchy(), size = [ 1, 1 ];
    function position(node, x, dx, dy) {
      var children = node.children;
      node.x = x;
      node.y = node.depth * dy;
      node.dx = dx;
      node.dy = dy;
      if (children && (n = children.length)) {
        var i = -1, n, c, d;
        dx = node.value ? dx / node.value : 0;
        while (++i < n) {
          position(c = children[i], x, d = c.value * dx, dy);
          x += d;
        }
      }
    }
    function depth(node) {
      var children = node.children, d = 0;
      if (children && (n = children.length)) {
        var i = -1, n;
        while (++i < n) d = Math.max(d, depth(children[i]));
      }
      return 1 + d;
    }
    function partition(d, i) {
      var nodes = hierarchy.call(this, d, i);
      position(nodes[0], 0, size[0], size[1] / depth(nodes[0]));
      return nodes;
    }
    partition.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return partition;
    };
    return d3_layout_hierarchyRebind(partition, hierarchy);
  };
  d3.layout.pie = function() {
    var value = Number, sort = d3_layout_pieSortByValue, startAngle = 0, endAngle = tau, padAngle = 0;
    function pie(data) {
      var n = data.length, values = data.map(function(d, i) {
        return +value.call(pie, d, i);
      }), a = +(typeof startAngle === "function" ? startAngle.apply(this, arguments) : startAngle), da = (typeof endAngle === "function" ? endAngle.apply(this, arguments) : endAngle) - a, p = Math.min(Math.abs(da) / n, +(typeof padAngle === "function" ? padAngle.apply(this, arguments) : padAngle)), pa = p * (da < 0 ? -1 : 1), sum = d3.sum(values), k = sum ? (da - n * pa) / sum : 0, index = d3.range(n), arcs = [], v;
      if (sort != null) index.sort(sort === d3_layout_pieSortByValue ? function(i, j) {
        return values[j] - values[i];
      } : function(i, j) {
        return sort(data[i], data[j]);
      });
      index.forEach(function(i) {
        arcs[i] = {
          data: data[i],
          value: v = values[i],
          startAngle: a,
          endAngle: a += v * k + pa,
          padAngle: p
        };
      });
      return arcs;
    }
    pie.value = function(_) {
      if (!arguments.length) return value;
      value = _;
      return pie;
    };
    pie.sort = function(_) {
      if (!arguments.length) return sort;
      sort = _;
      return pie;
    };
    pie.startAngle = function(_) {
      if (!arguments.length) return startAngle;
      startAngle = _;
      return pie;
    };
    pie.endAngle = function(_) {
      if (!arguments.length) return endAngle;
      endAngle = _;
      return pie;
    };
    pie.padAngle = function(_) {
      if (!arguments.length) return padAngle;
      padAngle = _;
      return pie;
    };
    return pie;
  };
  var d3_layout_pieSortByValue = {};
  d3.layout.stack = function() {
    var values = d3_identity, order = d3_layout_stackOrderDefault, offset = d3_layout_stackOffsetZero, out = d3_layout_stackOut, x = d3_layout_stackX, y = d3_layout_stackY;
    function stack(data, index) {
      if (!(n = data.length)) return data;
      var series = data.map(function(d, i) {
        return values.call(stack, d, i);
      });
      var points = series.map(function(d) {
        return d.map(function(v, i) {
          return [ x.call(stack, v, i), y.call(stack, v, i) ];
        });
      });
      var orders = order.call(stack, points, index);
      series = d3.permute(series, orders);
      points = d3.permute(points, orders);
      var offsets = offset.call(stack, points, index);
      var m = series[0].length, n, i, j, o;
      for (j = 0; j < m; ++j) {
        out.call(stack, series[0][j], o = offsets[j], points[0][j][1]);
        for (i = 1; i < n; ++i) {
          out.call(stack, series[i][j], o += points[i - 1][j][1], points[i][j][1]);
        }
      }
      return data;
    }
    stack.values = function(x) {
      if (!arguments.length) return values;
      values = x;
      return stack;
    };
    stack.order = function(x) {
      if (!arguments.length) return order;
      order = typeof x === "function" ? x : d3_layout_stackOrders.get(x) || d3_layout_stackOrderDefault;
      return stack;
    };
    stack.offset = function(x) {
      if (!arguments.length) return offset;
      offset = typeof x === "function" ? x : d3_layout_stackOffsets.get(x) || d3_layout_stackOffsetZero;
      return stack;
    };
    stack.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      return stack;
    };
    stack.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      return stack;
    };
    stack.out = function(z) {
      if (!arguments.length) return out;
      out = z;
      return stack;
    };
    return stack;
  };
  function d3_layout_stackX(d) {
    return d.x;
  }
  function d3_layout_stackY(d) {
    return d.y;
  }
  function d3_layout_stackOut(d, y0, y) {
    d.y0 = y0;
    d.y = y;
  }
  var d3_layout_stackOrders = d3.map({
    "inside-out": function(data) {
      var n = data.length, i, j, max = data.map(d3_layout_stackMaxIndex), sums = data.map(d3_layout_stackReduceSum), index = d3.range(n).sort(function(a, b) {
        return max[a] - max[b];
      }), top = 0, bottom = 0, tops = [], bottoms = [];
      for (i = 0; i < n; ++i) {
        j = index[i];
        if (top < bottom) {
          top += sums[j];
          tops.push(j);
        } else {
          bottom += sums[j];
          bottoms.push(j);
        }
      }
      return bottoms.reverse().concat(tops);
    },
    reverse: function(data) {
      return d3.range(data.length).reverse();
    },
    "default": d3_layout_stackOrderDefault
  });
  var d3_layout_stackOffsets = d3.map({
    silhouette: function(data) {
      var n = data.length, m = data[0].length, sums = [], max = 0, i, j, o, y0 = [];
      for (j = 0; j < m; ++j) {
        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
        if (o > max) max = o;
        sums.push(o);
      }
      for (j = 0; j < m; ++j) {
        y0[j] = (max - sums[j]) / 2;
      }
      return y0;
    },
    wiggle: function(data) {
      var n = data.length, x = data[0], m = x.length, i, j, k, s1, s2, s3, dx, o, o0, y0 = [];
      y0[0] = o = o0 = 0;
      for (j = 1; j < m; ++j) {
        for (i = 0, s1 = 0; i < n; ++i) s1 += data[i][j][1];
        for (i = 0, s2 = 0, dx = x[j][0] - x[j - 1][0]; i < n; ++i) {
          for (k = 0, s3 = (data[i][j][1] - data[i][j - 1][1]) / (2 * dx); k < i; ++k) {
            s3 += (data[k][j][1] - data[k][j - 1][1]) / dx;
          }
          s2 += s3 * data[i][j][1];
        }
        y0[j] = o -= s1 ? s2 / s1 * dx : 0;
        if (o < o0) o0 = o;
      }
      for (j = 0; j < m; ++j) y0[j] -= o0;
      return y0;
    },
    expand: function(data) {
      var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
      for (j = 0; j < m; ++j) {
        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
        if (o) for (i = 0; i < n; i++) data[i][j][1] /= o; else for (i = 0; i < n; i++) data[i][j][1] = k;
      }
      for (j = 0; j < m; ++j) y0[j] = 0;
      return y0;
    },
    zero: d3_layout_stackOffsetZero
  });
  function d3_layout_stackOrderDefault(data) {
    return d3.range(data.length);
  }
  function d3_layout_stackOffsetZero(data) {
    var j = -1, m = data[0].length, y0 = [];
    while (++j < m) y0[j] = 0;
    return y0;
  }
  function d3_layout_stackMaxIndex(array) {
    var i = 1, j = 0, v = array[0][1], k, n = array.length;
    for (;i < n; ++i) {
      if ((k = array[i][1]) > v) {
        j = i;
        v = k;
      }
    }
    return j;
  }
  function d3_layout_stackReduceSum(d) {
    return d.reduce(d3_layout_stackSum, 0);
  }
  function d3_layout_stackSum(p, d) {
    return p + d[1];
  }
  d3.layout.histogram = function() {
    var frequency = true, valuer = Number, ranger = d3_layout_histogramRange, binner = d3_layout_histogramBinSturges;
    function histogram(data, i) {
      var bins = [], values = data.map(valuer, this), range = ranger.call(this, values, i), thresholds = binner.call(this, range, values, i), bin, i = -1, n = values.length, m = thresholds.length - 1, k = frequency ? 1 : 1 / n, x;
      while (++i < m) {
        bin = bins[i] = [];
        bin.dx = thresholds[i + 1] - (bin.x = thresholds[i]);
        bin.y = 0;
      }
      if (m > 0) {
        i = -1;
        while (++i < n) {
          x = values[i];
          if (x >= range[0] && x <= range[1]) {
            bin = bins[d3.bisect(thresholds, x, 1, m) - 1];
            bin.y += k;
            bin.push(data[i]);
          }
        }
      }
      return bins;
    }
    histogram.value = function(x) {
      if (!arguments.length) return valuer;
      valuer = x;
      return histogram;
    };
    histogram.range = function(x) {
      if (!arguments.length) return ranger;
      ranger = d3_functor(x);
      return histogram;
    };
    histogram.bins = function(x) {
      if (!arguments.length) return binner;
      binner = typeof x === "number" ? function(range) {
        return d3_layout_histogramBinFixed(range, x);
      } : d3_functor(x);
      return histogram;
    };
    histogram.frequency = function(x) {
      if (!arguments.length) return frequency;
      frequency = !!x;
      return histogram;
    };
    return histogram;
  };
  function d3_layout_histogramBinSturges(range, values) {
    return d3_layout_histogramBinFixed(range, Math.ceil(Math.log(values.length) / Math.LN2 + 1));
  }
  function d3_layout_histogramBinFixed(range, n) {
    var x = -1, b = +range[0], m = (range[1] - b) / n, f = [];
    while (++x <= n) f[x] = m * x + b;
    return f;
  }
  function d3_layout_histogramRange(values) {
    return [ d3.min(values), d3.max(values) ];
  }
  d3.layout.pack = function() {
    var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort), padding = 0, size = [ 1, 1 ], radius;
    function pack(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0], w = size[0], h = size[1], r = radius == null ? Math.sqrt : typeof radius === "function" ? radius : function() {
        return radius;
      };
      root.x = root.y = 0;
      d3_layout_hierarchyVisitAfter(root, function(d) {
        d.r = +r(d.value);
      });
      d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
      if (padding) {
        var dr = padding * (radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
        d3_layout_hierarchyVisitAfter(root, function(d) {
          d.r += dr;
        });
        d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
        d3_layout_hierarchyVisitAfter(root, function(d) {
          d.r -= dr;
        });
      }
      d3_layout_packTransform(root, w / 2, h / 2, radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));
      return nodes;
    }
    pack.size = function(_) {
      if (!arguments.length) return size;
      size = _;
      return pack;
    };
    pack.radius = function(_) {
      if (!arguments.length) return radius;
      radius = _ == null || typeof _ === "function" ? _ : +_;
      return pack;
    };
    pack.padding = function(_) {
      if (!arguments.length) return padding;
      padding = +_;
      return pack;
    };
    return d3_layout_hierarchyRebind(pack, hierarchy);
  };
  function d3_layout_packSort(a, b) {
    return a.value - b.value;
  }
  function d3_layout_packInsert(a, b) {
    var c = a._pack_next;
    a._pack_next = b;
    b._pack_prev = a;
    b._pack_next = c;
    c._pack_prev = b;
  }
  function d3_layout_packSplice(a, b) {
    a._pack_next = b;
    b._pack_prev = a;
  }
  function d3_layout_packIntersects(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
    return .999 * dr * dr > dx * dx + dy * dy;
  }
  function d3_layout_packSiblings(node) {
    if (!(nodes = node.children) || !(n = nodes.length)) return;
    var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;
    function bound(node) {
      xMin = Math.min(node.x - node.r, xMin);
      xMax = Math.max(node.x + node.r, xMax);
      yMin = Math.min(node.y - node.r, yMin);
      yMax = Math.max(node.y + node.r, yMax);
    }
    nodes.forEach(d3_layout_packLink);
    a = nodes[0];
    a.x = -a.r;
    a.y = 0;
    bound(a);
    if (n > 1) {
      b = nodes[1];
      b.x = b.r;
      b.y = 0;
      bound(b);
      if (n > 2) {
        c = nodes[2];
        d3_layout_packPlace(a, b, c);
        bound(c);
        d3_layout_packInsert(a, c);
        a._pack_prev = c;
        d3_layout_packInsert(c, b);
        b = a._pack_next;
        for (i = 3; i < n; i++) {
          d3_layout_packPlace(a, b, c = nodes[i]);
          var isect = 0, s1 = 1, s2 = 1;
          for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
            if (d3_layout_packIntersects(j, c)) {
              isect = 1;
              break;
            }
          }
          if (isect == 1) {
            for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
              if (d3_layout_packIntersects(k, c)) {
                break;
              }
            }
          }
          if (isect) {
            if (s1 < s2 || s1 == s2 && b.r < a.r) d3_layout_packSplice(a, b = j); else d3_layout_packSplice(a = k, b);
            i--;
          } else {
            d3_layout_packInsert(a, c);
            b = c;
            bound(c);
          }
        }
      }
    }
    var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
    for (i = 0; i < n; i++) {
      c = nodes[i];
      c.x -= cx;
      c.y -= cy;
      cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
    }
    node.r = cr;
    nodes.forEach(d3_layout_packUnlink);
  }
  function d3_layout_packLink(node) {
    node._pack_next = node._pack_prev = node;
  }
  function d3_layout_packUnlink(node) {
    delete node._pack_next;
    delete node._pack_prev;
  }
  function d3_layout_packTransform(node, x, y, k) {
    var children = node.children;
    node.x = x += k * node.x;
    node.y = y += k * node.y;
    node.r *= k;
    if (children) {
      var i = -1, n = children.length;
      while (++i < n) d3_layout_packTransform(children[i], x, y, k);
    }
  }
  function d3_layout_packPlace(a, b, c) {
    var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
    if (db && (dx || dy)) {
      var da = b.r + c.r, dc = dx * dx + dy * dy;
      da *= da;
      db *= db;
      var x = .5 + (db - da) / (2 * dc), y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
      c.x = a.x + x * dx + y * dy;
      c.y = a.y + x * dy - y * dx;
    } else {
      c.x = a.x + db;
      c.y = a.y;
    }
  }
  d3.layout.tree = function() {
    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = null;
    function tree(d, i) {
      var nodes = hierarchy.call(this, d, i), root0 = nodes[0], root1 = wrapTree(root0);
      d3_layout_hierarchyVisitAfter(root1, firstWalk), root1.parent.m = -root1.z;
      d3_layout_hierarchyVisitBefore(root1, secondWalk);
      if (nodeSize) d3_layout_hierarchyVisitBefore(root0, sizeNode); else {
        var left = root0, right = root0, bottom = root0;
        d3_layout_hierarchyVisitBefore(root0, function(node) {
          if (node.x < left.x) left = node;
          if (node.x > right.x) right = node;
          if (node.depth > bottom.depth) bottom = node;
        });
        var tx = separation(left, right) / 2 - left.x, kx = size[0] / (right.x + separation(right, left) / 2 + tx), ky = size[1] / (bottom.depth || 1);
        d3_layout_hierarchyVisitBefore(root0, function(node) {
          node.x = (node.x + tx) * kx;
          node.y = node.depth * ky;
        });
      }
      return nodes;
    }
    function wrapTree(root0) {
      var root1 = {
        A: null,
        children: [ root0 ]
      }, queue = [ root1 ], node1;
      while ((node1 = queue.pop()) != null) {
        for (var children = node1.children, child, i = 0, n = children.length; i < n; ++i) {
          queue.push((children[i] = child = {
            _: children[i],
            parent: node1,
            children: (child = children[i].children) && child.slice() || [],
            A: null,
            a: null,
            z: 0,
            m: 0,
            c: 0,
            s: 0,
            t: null,
            i: i
          }).a = child);
        }
      }
      return root1.children[0];
    }
    function firstWalk(v) {
      var children = v.children, siblings = v.parent.children, w = v.i ? siblings[v.i - 1] : null;
      if (children.length) {
        d3_layout_treeShift(v);
        var midpoint = (children[0].z + children[children.length - 1].z) / 2;
        if (w) {
          v.z = w.z + separation(v._, w._);
          v.m = v.z - midpoint;
        } else {
          v.z = midpoint;
        }
      } else if (w) {
        v.z = w.z + separation(v._, w._);
      }
      v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
    }
    function secondWalk(v) {
      v._.x = v.z + v.parent.m;
      v.m += v.parent.m;
    }
    function apportion(v, w, ancestor) {
      if (w) {
        var vip = v, vop = v, vim = w, vom = vip.parent.children[0], sip = vip.m, sop = vop.m, sim = vim.m, som = vom.m, shift;
        while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
          vom = d3_layout_treeLeft(vom);
          vop = d3_layout_treeRight(vop);
          vop.a = v;
          shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
          if (shift > 0) {
            d3_layout_treeMove(d3_layout_treeAncestor(vim, v, ancestor), v, shift);
            sip += shift;
            sop += shift;
          }
          sim += vim.m;
          sip += vip.m;
          som += vom.m;
          sop += vop.m;
        }
        if (vim && !d3_layout_treeRight(vop)) {
          vop.t = vim;
          vop.m += sim - sop;
        }
        if (vip && !d3_layout_treeLeft(vom)) {
          vom.t = vip;
          vom.m += sip - som;
          ancestor = v;
        }
      }
      return ancestor;
    }
    function sizeNode(node) {
      node.x *= size[0];
      node.y = node.depth * size[1];
    }
    tree.separation = function(x) {
      if (!arguments.length) return separation;
      separation = x;
      return tree;
    };
    tree.size = function(x) {
      if (!arguments.length) return nodeSize ? null : size;
      nodeSize = (size = x) == null ? sizeNode : null;
      return tree;
    };
    tree.nodeSize = function(x) {
      if (!arguments.length) return nodeSize ? size : null;
      nodeSize = (size = x) == null ? null : sizeNode;
      return tree;
    };
    return d3_layout_hierarchyRebind(tree, hierarchy);
  };
  function d3_layout_treeSeparation(a, b) {
    return a.parent == b.parent ? 1 : 2;
  }
  function d3_layout_treeLeft(v) {
    var children = v.children;
    return children.length ? children[0] : v.t;
  }
  function d3_layout_treeRight(v) {
    var children = v.children, n;
    return (n = children.length) ? children[n - 1] : v.t;
  }
  function d3_layout_treeMove(wm, wp, shift) {
    var change = shift / (wp.i - wm.i);
    wp.c -= change;
    wp.s += shift;
    wm.c += change;
    wp.z += shift;
    wp.m += shift;
  }
  function d3_layout_treeShift(v) {
    var shift = 0, change = 0, children = v.children, i = children.length, w;
    while (--i >= 0) {
      w = children[i];
      w.z += shift;
      w.m += shift;
      shift += w.s + (change += w.c);
    }
  }
  function d3_layout_treeAncestor(vim, v, ancestor) {
    return vim.a.parent === v.parent ? vim.a : ancestor;
  }
  d3.layout.cluster = function() {
    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = false;
    function cluster(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0], previousNode, x = 0;
      d3_layout_hierarchyVisitAfter(root, function(node) {
        var children = node.children;
        if (children && children.length) {
          node.x = d3_layout_clusterX(children);
          node.y = d3_layout_clusterY(children);
        } else {
          node.x = previousNode ? x += separation(node, previousNode) : 0;
          node.y = 0;
          previousNode = node;
        }
      });
      var left = d3_layout_clusterLeft(root), right = d3_layout_clusterRight(root), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2;
      d3_layout_hierarchyVisitAfter(root, nodeSize ? function(node) {
        node.x = (node.x - root.x) * size[0];
        node.y = (root.y - node.y) * size[1];
      } : function(node) {
        node.x = (node.x - x0) / (x1 - x0) * size[0];
        node.y = (1 - (root.y ? node.y / root.y : 1)) * size[1];
      });
      return nodes;
    }
    cluster.separation = function(x) {
      if (!arguments.length) return separation;
      separation = x;
      return cluster;
    };
    cluster.size = function(x) {
      if (!arguments.length) return nodeSize ? null : size;
      nodeSize = (size = x) == null;
      return cluster;
    };
    cluster.nodeSize = function(x) {
      if (!arguments.length) return nodeSize ? size : null;
      nodeSize = (size = x) != null;
      return cluster;
    };
    return d3_layout_hierarchyRebind(cluster, hierarchy);
  };
  function d3_layout_clusterY(children) {
    return 1 + d3.max(children, function(child) {
      return child.y;
    });
  }
  function d3_layout_clusterX(children) {
    return children.reduce(function(x, child) {
      return x + child.x;
    }, 0) / children.length;
  }
  function d3_layout_clusterLeft(node) {
    var children = node.children;
    return children && children.length ? d3_layout_clusterLeft(children[0]) : node;
  }
  function d3_layout_clusterRight(node) {
    var children = node.children, n;
    return children && (n = children.length) ? d3_layout_clusterRight(children[n - 1]) : node;
  }
  d3.layout.treemap = function() {
    var hierarchy = d3.layout.hierarchy(), round = Math.round, size = [ 1, 1 ], padding = null, pad = d3_layout_treemapPadNull, sticky = false, stickies, mode = "squarify", ratio = .5 * (1 + Math.sqrt(5));
    function scale(children, k) {
      var i = -1, n = children.length, child, area;
      while (++i < n) {
        area = (child = children[i]).value * (k < 0 ? 0 : k);
        child.area = isNaN(area) || area <= 0 ? 0 : area;
      }
    }
    function squarify(node) {
      var children = node.children;
      if (children && children.length) {
        var rect = pad(node), row = [], remaining = children.slice(), child, best = Infinity, score, u = mode === "slice" ? rect.dx : mode === "dice" ? rect.dy : mode === "slice-dice" ? node.depth & 1 ? rect.dy : rect.dx : Math.min(rect.dx, rect.dy), n;
        scale(remaining, rect.dx * rect.dy / node.value);
        row.area = 0;
        while ((n = remaining.length) > 0) {
          row.push(child = remaining[n - 1]);
          row.area += child.area;
          if (mode !== "squarify" || (score = worst(row, u)) <= best) {
            remaining.pop();
            best = score;
          } else {
            row.area -= row.pop().area;
            position(row, u, rect, false);
            u = Math.min(rect.dx, rect.dy);
            row.length = row.area = 0;
            best = Infinity;
          }
        }
        if (row.length) {
          position(row, u, rect, true);
          row.length = row.area = 0;
        }
        children.forEach(squarify);
      }
    }
    function stickify(node) {
      var children = node.children;
      if (children && children.length) {
        var rect = pad(node), remaining = children.slice(), child, row = [];
        scale(remaining, rect.dx * rect.dy / node.value);
        row.area = 0;
        while (child = remaining.pop()) {
          row.push(child);
          row.area += child.area;
          if (child.z != null) {
            position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
            row.length = row.area = 0;
          }
        }
        children.forEach(stickify);
      }
    }
    function worst(row, u) {
      var s = row.area, r, rmax = 0, rmin = Infinity, i = -1, n = row.length;
      while (++i < n) {
        if (!(r = row[i].area)) continue;
        if (r < rmin) rmin = r;
        if (r > rmax) rmax = r;
      }
      s *= s;
      u *= u;
      return s ? Math.max(u * rmax * ratio / s, s / (u * rmin * ratio)) : Infinity;
    }
    function position(row, u, rect, flush) {
      var i = -1, n = row.length, x = rect.x, y = rect.y, v = u ? round(row.area / u) : 0, o;
      if (u == rect.dx) {
        if (flush || v > rect.dy) v = rect.dy;
        while (++i < n) {
          o = row[i];
          o.x = x;
          o.y = y;
          o.dy = v;
          x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
        }
        o.z = true;
        o.dx += rect.x + rect.dx - x;
        rect.y += v;
        rect.dy -= v;
      } else {
        if (flush || v > rect.dx) v = rect.dx;
        while (++i < n) {
          o = row[i];
          o.x = x;
          o.y = y;
          o.dx = v;
          y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
        }
        o.z = false;
        o.dy += rect.y + rect.dy - y;
        rect.x += v;
        rect.dx -= v;
      }
    }
    function treemap(d) {
      var nodes = stickies || hierarchy(d), root = nodes[0];
      root.x = root.y = 0;
      if (root.value) root.dx = size[0], root.dy = size[1]; else root.dx = root.dy = 0;
      if (stickies) hierarchy.revalue(root);
      scale([ root ], root.dx * root.dy / root.value);
      (stickies ? stickify : squarify)(root);
      if (sticky) stickies = nodes;
      return nodes;
    }
    treemap.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return treemap;
    };
    treemap.padding = function(x) {
      if (!arguments.length) return padding;
      function padFunction(node) {
        var p = x.call(treemap, node, node.depth);
        return p == null ? d3_layout_treemapPadNull(node) : d3_layout_treemapPad(node, typeof p === "number" ? [ p, p, p, p ] : p);
      }
      function padConstant(node) {
        return d3_layout_treemapPad(node, x);
      }
      var type;
      pad = (padding = x) == null ? d3_layout_treemapPadNull : (type = typeof x) === "function" ? padFunction : type === "number" ? (x = [ x, x, x, x ], 
      padConstant) : padConstant;
      return treemap;
    };
    treemap.round = function(x) {
      if (!arguments.length) return round != Number;
      round = x ? Math.round : Number;
      return treemap;
    };
    treemap.sticky = function(x) {
      if (!arguments.length) return sticky;
      sticky = x;
      stickies = null;
      return treemap;
    };
    treemap.ratio = function(x) {
      if (!arguments.length) return ratio;
      ratio = x;
      return treemap;
    };
    treemap.mode = function(x) {
      if (!arguments.length) return mode;
      mode = x + "";
      return treemap;
    };
    return d3_layout_hierarchyRebind(treemap, hierarchy);
  };
  function d3_layout_treemapPadNull(node) {
    return {
      x: node.x,
      y: node.y,
      dx: node.dx,
      dy: node.dy
    };
  }
  function d3_layout_treemapPad(node, padding) {
    var x = node.x + padding[3], y = node.y + padding[0], dx = node.dx - padding[1] - padding[3], dy = node.dy - padding[0] - padding[2];
    if (dx < 0) {
      x += dx / 2;
      dx = 0;
    }
    if (dy < 0) {
      y += dy / 2;
      dy = 0;
    }
    return {
      x: x,
      y: y,
      dx: dx,
      dy: dy
    };
  }
  d3.random = {
    normal: function(µ, σ) {
      var n = arguments.length;
      if (n < 2) σ = 1;
      if (n < 1) µ = 0;
      return function() {
        var x, y, r;
        do {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          r = x * x + y * y;
        } while (!r || r > 1);
        return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
      };
    },
    logNormal: function() {
      var random = d3.random.normal.apply(d3, arguments);
      return function() {
        return Math.exp(random());
      };
    },
    bates: function(m) {
      var random = d3.random.irwinHall(m);
      return function() {
        return random() / m;
      };
    },
    irwinHall: function(m) {
      return function() {
        for (var s = 0, j = 0; j < m; j++) s += Math.random();
        return s;
      };
    }
  };
  d3.scale = {};
  function d3_scaleExtent(domain) {
    var start = domain[0], stop = domain[domain.length - 1];
    return start < stop ? [ start, stop ] : [ stop, start ];
  }
  function d3_scaleRange(scale) {
    return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
  }
  function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
    var u = uninterpolate(domain[0], domain[1]), i = interpolate(range[0], range[1]);
    return function(x) {
      return i(u(x));
    };
  }
  function d3_scale_nice(domain, nice) {
    var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], dx;
    if (x1 < x0) {
      dx = i0, i0 = i1, i1 = dx;
      dx = x0, x0 = x1, x1 = dx;
    }
    domain[i0] = nice.floor(x0);
    domain[i1] = nice.ceil(x1);
    return domain;
  }
  function d3_scale_niceStep(step) {
    return step ? {
      floor: function(x) {
        return Math.floor(x / step) * step;
      },
      ceil: function(x) {
        return Math.ceil(x / step) * step;
      }
    } : d3_scale_niceIdentity;
  }
  var d3_scale_niceIdentity = {
    floor: d3_identity,
    ceil: d3_identity
  };
  function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
    var u = [], i = [], j = 0, k = Math.min(domain.length, range.length) - 1;
    if (domain[k] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }
    while (++j <= k) {
      u.push(uninterpolate(domain[j - 1], domain[j]));
      i.push(interpolate(range[j - 1], range[j]));
    }
    return function(x) {
      var j = d3.bisect(domain, x, 1, k) - 1;
      return i[j](u[j](x));
    };
  }
  d3.scale.linear = function() {
    return d3_scale_linear([ 0, 1 ], [ 0, 1 ], d3_interpolate, false);
  };
  function d3_scale_linear(domain, range, interpolate, clamp) {
    var output, input;
    function rescale() {
      var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear, uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
      output = linear(domain, range, uninterpolate, interpolate);
      input = linear(range, domain, uninterpolate, d3_interpolate);
      return scale;
    }
    function scale(x) {
      return output(x);
    }
    scale.invert = function(y) {
      return input(y);
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(Number);
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.rangeRound = function(x) {
      return scale.range(x).interpolate(d3_interpolateRound);
    };
    scale.clamp = function(x) {
      if (!arguments.length) return clamp;
      clamp = x;
      return rescale();
    };
    scale.interpolate = function(x) {
      if (!arguments.length) return interpolate;
      interpolate = x;
      return rescale();
    };
    scale.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    scale.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    scale.nice = function(m) {
      d3_scale_linearNice(domain, m);
      return rescale();
    };
    scale.copy = function() {
      return d3_scale_linear(domain, range, interpolate, clamp);
    };
    return rescale();
  }
  function d3_scale_linearRebind(scale, linear) {
    return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
  }
  function d3_scale_linearNice(domain, m) {
    d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
    d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
    return domain;
  }
  function d3_scale_linearTickRange(domain, m) {
    if (m == null) m = 10;
    var extent = d3_scaleExtent(domain), span = extent[1] - extent[0], step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step;
    if (err <= .15) step *= 10; else if (err <= .35) step *= 5; else if (err <= .75) step *= 2;
    extent[0] = Math.ceil(extent[0] / step) * step;
    extent[1] = Math.floor(extent[1] / step) * step + step * .5;
    extent[2] = step;
    return extent;
  }
  function d3_scale_linearTicks(domain, m) {
    return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
  }
  function d3_scale_linearTickFormat(domain, m, format) {
    var range = d3_scale_linearTickRange(domain, m);
    if (format) {
      var match = d3_format_re.exec(format);
      match.shift();
      if (match[8] === "s") {
        var prefix = d3.formatPrefix(Math.max(abs(range[0]), abs(range[1])));
        if (!match[7]) match[7] = "." + d3_scale_linearPrecision(prefix.scale(range[2]));
        match[8] = "f";
        format = d3.format(match.join(""));
        return function(d) {
          return format(prefix.scale(d)) + prefix.symbol;
        };
      }
      if (!match[7]) match[7] = "." + d3_scale_linearFormatPrecision(match[8], range);
      format = match.join("");
    } else {
      format = ",." + d3_scale_linearPrecision(range[2]) + "f";
    }
    return d3.format(format);
  }
  var d3_scale_linearFormatSignificant = {
    s: 1,
    g: 1,
    p: 1,
    r: 1,
    e: 1
  };
  function d3_scale_linearPrecision(value) {
    return -Math.floor(Math.log(value) / Math.LN10 + .01);
  }
  function d3_scale_linearFormatPrecision(type, range) {
    var p = d3_scale_linearPrecision(range[2]);
    return type in d3_scale_linearFormatSignificant ? Math.abs(p - d3_scale_linearPrecision(Math.max(abs(range[0]), abs(range[1])))) + +(type !== "e") : p - (type === "%") * 2;
  }
  d3.scale.log = function() {
    return d3_scale_log(d3.scale.linear().domain([ 0, 1 ]), 10, true, [ 1, 10 ]);
  };
  function d3_scale_log(linear, base, positive, domain) {
    function log(x) {
      return (positive ? Math.log(x < 0 ? 0 : x) : -Math.log(x > 0 ? 0 : -x)) / Math.log(base);
    }
    function pow(x) {
      return positive ? Math.pow(base, x) : -Math.pow(base, -x);
    }
    function scale(x) {
      return linear(log(x));
    }
    scale.invert = function(x) {
      return pow(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      positive = x[0] >= 0;
      linear.domain((domain = x.map(Number)).map(log));
      return scale;
    };
    scale.base = function(_) {
      if (!arguments.length) return base;
      base = +_;
      linear.domain(domain.map(log));
      return scale;
    };
    scale.nice = function() {
      var niced = d3_scale_nice(domain.map(log), positive ? Math : d3_scale_logNiceNegative);
      linear.domain(niced);
      domain = niced.map(pow);
      return scale;
    };
    scale.ticks = function() {
      var extent = d3_scaleExtent(domain), ticks = [], u = extent[0], v = extent[1], i = Math.floor(log(u)), j = Math.ceil(log(v)), n = base % 1 ? 2 : base;
      if (isFinite(j - i)) {
        if (positive) {
          for (;i < j; i++) for (var k = 1; k < n; k++) ticks.push(pow(i) * k);
          ticks.push(pow(i));
        } else {
          ticks.push(pow(i));
          for (;i++ < j; ) for (var k = n - 1; k > 0; k--) ticks.push(pow(i) * k);
        }
        for (i = 0; ticks[i] < u; i++) {}
        for (j = ticks.length; ticks[j - 1] > v; j--) {}
        ticks = ticks.slice(i, j);
      }
      return ticks;
    };
    scale.tickFormat = function(n, format) {
      if (!arguments.length) return d3_scale_logFormat;
      if (arguments.length < 2) format = d3_scale_logFormat; else if (typeof format !== "function") format = d3.format(format);
      var k = Math.max(1, base * n / scale.ticks().length);
      return function(d) {
        var i = d / pow(Math.round(log(d)));
        if (i * base < base - .5) i *= base;
        return i <= k ? format(d) : "";
      };
    };
    scale.copy = function() {
      return d3_scale_log(linear.copy(), base, positive, domain);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  var d3_scale_logFormat = d3.format(".0e"), d3_scale_logNiceNegative = {
    floor: function(x) {
      return -Math.ceil(-x);
    },
    ceil: function(x) {
      return -Math.floor(-x);
    }
  };
  d3.scale.pow = function() {
    return d3_scale_pow(d3.scale.linear(), 1, [ 0, 1 ]);
  };
  function d3_scale_pow(linear, exponent, domain) {
    var powp = d3_scale_powPow(exponent), powb = d3_scale_powPow(1 / exponent);
    function scale(x) {
      return linear(powp(x));
    }
    scale.invert = function(x) {
      return powb(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      linear.domain((domain = x.map(Number)).map(powp));
      return scale;
    };
    scale.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    scale.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    scale.nice = function(m) {
      return scale.domain(d3_scale_linearNice(domain, m));
    };
    scale.exponent = function(x) {
      if (!arguments.length) return exponent;
      powp = d3_scale_powPow(exponent = x);
      powb = d3_scale_powPow(1 / exponent);
      linear.domain(domain.map(powp));
      return scale;
    };
    scale.copy = function() {
      return d3_scale_pow(linear.copy(), exponent, domain);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  function d3_scale_powPow(e) {
    return function(x) {
      return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
    };
  }
  d3.scale.sqrt = function() {
    return d3.scale.pow().exponent(.5);
  };
  d3.scale.ordinal = function() {
    return d3_scale_ordinal([], {
      t: "range",
      a: [ [] ]
    });
  };
  function d3_scale_ordinal(domain, ranger) {
    var index, range, rangeBand;
    function scale(x) {
      return range[((index.get(x) || (ranger.t === "range" ? index.set(x, domain.push(x)) : NaN)) - 1) % range.length];
    }
    function steps(start, step) {
      return d3.range(domain.length).map(function(i) {
        return start + step * i;
      });
    }
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = [];
      index = new d3_Map();
      var i = -1, n = x.length, xi;
      while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
      return scale[ranger.t].apply(scale, ranger.a);
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      rangeBand = 0;
      ranger = {
        t: "range",
        a: arguments
      };
      return scale;
    };
    scale.rangePoints = function(x, padding) {
      if (arguments.length < 2) padding = 0;
      var start = x[0], stop = x[1], step = domain.length < 2 ? (start = (start + stop) / 2, 
      0) : (stop - start) / (domain.length - 1 + padding);
      range = steps(start + step * padding / 2, step);
      rangeBand = 0;
      ranger = {
        t: "rangePoints",
        a: arguments
      };
      return scale;
    };
    scale.rangeRoundPoints = function(x, padding) {
      if (arguments.length < 2) padding = 0;
      var start = x[0], stop = x[1], step = domain.length < 2 ? (start = stop = Math.round((start + stop) / 2), 
      0) : (stop - start) / (domain.length - 1 + padding) | 0;
      range = steps(start + Math.round(step * padding / 2 + (stop - start - (domain.length - 1 + padding) * step) / 2), step);
      rangeBand = 0;
      ranger = {
        t: "rangeRoundPoints",
        a: arguments
      };
      return scale;
    };
    scale.rangeBands = function(x, padding, outerPadding) {
      if (arguments.length < 2) padding = 0;
      if (arguments.length < 3) outerPadding = padding;
      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = (stop - start) / (domain.length - padding + 2 * outerPadding);
      range = steps(start + step * outerPadding, step);
      if (reverse) range.reverse();
      rangeBand = step * (1 - padding);
      ranger = {
        t: "rangeBands",
        a: arguments
      };
      return scale;
    };
    scale.rangeRoundBands = function(x, padding, outerPadding) {
      if (arguments.length < 2) padding = 0;
      if (arguments.length < 3) outerPadding = padding;
      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding));
      range = steps(start + Math.round((stop - start - (domain.length - padding) * step) / 2), step);
      if (reverse) range.reverse();
      rangeBand = Math.round(step * (1 - padding));
      ranger = {
        t: "rangeRoundBands",
        a: arguments
      };
      return scale;
    };
    scale.rangeBand = function() {
      return rangeBand;
    };
    scale.rangeExtent = function() {
      return d3_scaleExtent(ranger.a[0]);
    };
    scale.copy = function() {
      return d3_scale_ordinal(domain, ranger);
    };
    return scale.domain(domain);
  }
  d3.scale.category10 = function() {
    return d3.scale.ordinal().range(d3_category10);
  };
  d3.scale.category20 = function() {
    return d3.scale.ordinal().range(d3_category20);
  };
  d3.scale.category20b = function() {
    return d3.scale.ordinal().range(d3_category20b);
  };
  d3.scale.category20c = function() {
    return d3.scale.ordinal().range(d3_category20c);
  };
  var d3_category10 = [ 2062260, 16744206, 2924588, 14034728, 9725885, 9197131, 14907330, 8355711, 12369186, 1556175 ].map(d3_rgbString);
  var d3_category20 = [ 2062260, 11454440, 16744206, 16759672, 2924588, 10018698, 14034728, 16750742, 9725885, 12955861, 9197131, 12885140, 14907330, 16234194, 8355711, 13092807, 12369186, 14408589, 1556175, 10410725 ].map(d3_rgbString);
  var d3_category20b = [ 3750777, 5395619, 7040719, 10264286, 6519097, 9216594, 11915115, 13556636, 9202993, 12426809, 15186514, 15190932, 8666169, 11356490, 14049643, 15177372, 8077683, 10834324, 13528509, 14589654 ].map(d3_rgbString);
  var d3_category20c = [ 3244733, 7057110, 10406625, 13032431, 15095053, 16616764, 16625259, 16634018, 3253076, 7652470, 10607003, 13101504, 7695281, 10394312, 12369372, 14342891, 6513507, 9868950, 12434877, 14277081 ].map(d3_rgbString);
  d3.scale.quantile = function() {
    return d3_scale_quantile([], []);
  };
  function d3_scale_quantile(domain, range) {
    var thresholds;
    function rescale() {
      var k = 0, q = range.length;
      thresholds = [];
      while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
      return scale;
    }
    function scale(x) {
      if (!isNaN(x = +x)) return range[d3.bisect(thresholds, x)];
    }
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(d3_number).filter(d3_numeric).sort(d3_ascending);
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.quantiles = function() {
      return thresholds;
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      return y < 0 ? [ NaN, NaN ] : [ y > 0 ? thresholds[y - 1] : domain[0], y < thresholds.length ? thresholds[y] : domain[domain.length - 1] ];
    };
    scale.copy = function() {
      return d3_scale_quantile(domain, range);
    };
    return rescale();
  }
  d3.scale.quantize = function() {
    return d3_scale_quantize(0, 1, [ 0, 1 ]);
  };
  function d3_scale_quantize(x0, x1, range) {
    var kx, i;
    function scale(x) {
      return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
    }
    function rescale() {
      kx = range.length / (x1 - x0);
      i = range.length - 1;
      return scale;
    }
    scale.domain = function(x) {
      if (!arguments.length) return [ x0, x1 ];
      x0 = +x[0];
      x1 = +x[x.length - 1];
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      y = y < 0 ? NaN : y / kx + x0;
      return [ y, y + 1 / kx ];
    };
    scale.copy = function() {
      return d3_scale_quantize(x0, x1, range);
    };
    return rescale();
  }
  d3.scale.threshold = function() {
    return d3_scale_threshold([ .5 ], [ 0, 1 ]);
  };
  function d3_scale_threshold(domain, range) {
    function scale(x) {
      if (x <= x) return range[d3.bisect(domain, x)];
    }
    scale.domain = function(_) {
      if (!arguments.length) return domain;
      domain = _;
      return scale;
    };
    scale.range = function(_) {
      if (!arguments.length) return range;
      range = _;
      return scale;
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      return [ domain[y - 1], domain[y] ];
    };
    scale.copy = function() {
      return d3_scale_threshold(domain, range);
    };
    return scale;
  }
  d3.scale.identity = function() {
    return d3_scale_identity([ 0, 1 ]);
  };
  function d3_scale_identity(domain) {
    function identity(x) {
      return +x;
    }
    identity.invert = identity;
    identity.domain = identity.range = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(identity);
      return identity;
    };
    identity.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    identity.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    identity.copy = function() {
      return d3_scale_identity(domain);
    };
    return identity;
  }
  d3.svg = {};
  function d3_zero() {
    return 0;
  }
  d3.svg.arc = function() {
    var innerRadius = d3_svg_arcInnerRadius, outerRadius = d3_svg_arcOuterRadius, cornerRadius = d3_zero, padRadius = d3_svg_arcAuto, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle, padAngle = d3_svg_arcPadAngle;
    function arc() {
      var r0 = Math.max(0, +innerRadius.apply(this, arguments)), r1 = Math.max(0, +outerRadius.apply(this, arguments)), a0 = startAngle.apply(this, arguments) - halfPI, a1 = endAngle.apply(this, arguments) - halfPI, da = Math.abs(a1 - a0), cw = a0 > a1 ? 0 : 1;
      if (r1 < r0) rc = r1, r1 = r0, r0 = rc;
      if (da >= tauepsilon) return circleSegment(r1, cw) + (r0 ? circleSegment(r0, 1 - cw) : "") + "Z";
      var rc, cr, rp, ap, p0 = 0, p1 = 0, x0, y0, x1, y1, x2, y2, x3, y3, path = [];
      if (ap = (+padAngle.apply(this, arguments) || 0) / 2) {
        rp = padRadius === d3_svg_arcAuto ? Math.sqrt(r0 * r0 + r1 * r1) : +padRadius.apply(this, arguments);
        if (!cw) p1 *= -1;
        if (r1) p1 = d3_asin(rp / r1 * Math.sin(ap));
        if (r0) p0 = d3_asin(rp / r0 * Math.sin(ap));
      }
      if (r1) {
        x0 = r1 * Math.cos(a0 + p1);
        y0 = r1 * Math.sin(a0 + p1);
        x1 = r1 * Math.cos(a1 - p1);
        y1 = r1 * Math.sin(a1 - p1);
        var l1 = Math.abs(a1 - a0 - 2 * p1) <= PI ? 0 : 1;
        if (p1 && d3_svg_arcSweep(x0, y0, x1, y1) === cw ^ l1) {
          var h1 = (a0 + a1) / 2;
          x0 = r1 * Math.cos(h1);
          y0 = r1 * Math.sin(h1);
          x1 = y1 = null;
        }
      } else {
        x0 = y0 = 0;
      }
      if (r0) {
        x2 = r0 * Math.cos(a1 - p0);
        y2 = r0 * Math.sin(a1 - p0);
        x3 = r0 * Math.cos(a0 + p0);
        y3 = r0 * Math.sin(a0 + p0);
        var l0 = Math.abs(a0 - a1 + 2 * p0) <= PI ? 0 : 1;
        if (p0 && d3_svg_arcSweep(x2, y2, x3, y3) === 1 - cw ^ l0) {
          var h0 = (a0 + a1) / 2;
          x2 = r0 * Math.cos(h0);
          y2 = r0 * Math.sin(h0);
          x3 = y3 = null;
        }
      } else {
        x2 = y2 = 0;
      }
      if (da > epsilon && (rc = Math.min(Math.abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments))) > .001) {
        cr = r0 < r1 ^ cw ? 0 : 1;
        var rc1 = rc, rc0 = rc;
        if (da < PI) {
          var oc = x3 == null ? [ x2, y2 ] : x1 == null ? [ x0, y0 ] : d3_geom_polygonIntersect([ x0, y0 ], [ x3, y3 ], [ x1, y1 ], [ x2, y2 ]), ax = x0 - oc[0], ay = y0 - oc[1], bx = x1 - oc[0], by = y1 - oc[1], kc = 1 / Math.sin(Math.acos((ax * bx + ay * by) / (Math.sqrt(ax * ax + ay * ay) * Math.sqrt(bx * bx + by * by))) / 2), lc = Math.sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
          rc0 = Math.min(rc, (r0 - lc) / (kc - 1));
          rc1 = Math.min(rc, (r1 - lc) / (kc + 1));
        }
        if (x1 != null) {
          var t30 = d3_svg_arcCornerTangents(x3 == null ? [ x2, y2 ] : [ x3, y3 ], [ x0, y0 ], r1, rc1, cw), t12 = d3_svg_arcCornerTangents([ x1, y1 ], [ x2, y2 ], r1, rc1, cw);
          if (rc === rc1) {
            path.push("M", t30[0], "A", rc1, ",", rc1, " 0 0,", cr, " ", t30[1], "A", r1, ",", r1, " 0 ", 1 - cw ^ d3_svg_arcSweep(t30[1][0], t30[1][1], t12[1][0], t12[1][1]), ",", cw, " ", t12[1], "A", rc1, ",", rc1, " 0 0,", cr, " ", t12[0]);
          } else {
            path.push("M", t30[0], "A", rc1, ",", rc1, " 0 1,", cr, " ", t12[0]);
          }
        } else {
          path.push("M", x0, ",", y0);
        }
        if (x3 != null) {
          var t03 = d3_svg_arcCornerTangents([ x0, y0 ], [ x3, y3 ], r0, -rc0, cw), t21 = d3_svg_arcCornerTangents([ x2, y2 ], x1 == null ? [ x0, y0 ] : [ x1, y1 ], r0, -rc0, cw);
          if (rc === rc0) {
            path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t21[1], "A", r0, ",", r0, " 0 ", cw ^ d3_svg_arcSweep(t21[1][0], t21[1][1], t03[1][0], t03[1][1]), ",", 1 - cw, " ", t03[1], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
          } else {
            path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
          }
        } else {
          path.push("L", x2, ",", y2);
        }
      } else {
        path.push("M", x0, ",", y0);
        if (x1 != null) path.push("A", r1, ",", r1, " 0 ", l1, ",", cw, " ", x1, ",", y1);
        path.push("L", x2, ",", y2);
        if (x3 != null) path.push("A", r0, ",", r0, " 0 ", l0, ",", 1 - cw, " ", x3, ",", y3);
      }
      path.push("Z");
      return path.join("");
    }
    function circleSegment(r1, cw) {
      return "M0," + r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + -r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + r1;
    }
    arc.innerRadius = function(v) {
      if (!arguments.length) return innerRadius;
      innerRadius = d3_functor(v);
      return arc;
    };
    arc.outerRadius = function(v) {
      if (!arguments.length) return outerRadius;
      outerRadius = d3_functor(v);
      return arc;
    };
    arc.cornerRadius = function(v) {
      if (!arguments.length) return cornerRadius;
      cornerRadius = d3_functor(v);
      return arc;
    };
    arc.padRadius = function(v) {
      if (!arguments.length) return padRadius;
      padRadius = v == d3_svg_arcAuto ? d3_svg_arcAuto : d3_functor(v);
      return arc;
    };
    arc.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return arc;
    };
    arc.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return arc;
    };
    arc.padAngle = function(v) {
      if (!arguments.length) return padAngle;
      padAngle = d3_functor(v);
      return arc;
    };
    arc.centroid = function() {
      var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2, a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - halfPI;
      return [ Math.cos(a) * r, Math.sin(a) * r ];
    };
    return arc;
  };
  var d3_svg_arcAuto = "auto";
  function d3_svg_arcInnerRadius(d) {
    return d.innerRadius;
  }
  function d3_svg_arcOuterRadius(d) {
    return d.outerRadius;
  }
  function d3_svg_arcStartAngle(d) {
    return d.startAngle;
  }
  function d3_svg_arcEndAngle(d) {
    return d.endAngle;
  }
  function d3_svg_arcPadAngle(d) {
    return d && d.padAngle;
  }
  function d3_svg_arcSweep(x0, y0, x1, y1) {
    return (x0 - x1) * y0 - (y0 - y1) * x0 > 0 ? 0 : 1;
  }
  function d3_svg_arcCornerTangents(p0, p1, r1, rc, cw) {
    var x01 = p0[0] - p1[0], y01 = p0[1] - p1[1], lo = (cw ? rc : -rc) / Math.sqrt(x01 * x01 + y01 * y01), ox = lo * y01, oy = -lo * x01, x1 = p0[0] + ox, y1 = p0[1] + oy, x2 = p1[0] + ox, y2 = p1[1] + oy, x3 = (x1 + x2) / 2, y3 = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, d2 = dx * dx + dy * dy, r = r1 - rc, D = x1 * y2 - x2 * y1, d = (dy < 0 ? -1 : 1) * Math.sqrt(Math.max(0, r * r * d2 - D * D)), cx0 = (D * dy - dx * d) / d2, cy0 = (-D * dx - dy * d) / d2, cx1 = (D * dy + dx * d) / d2, cy1 = (-D * dx + dy * d) / d2, dx0 = cx0 - x3, dy0 = cy0 - y3, dx1 = cx1 - x3, dy1 = cy1 - y3;
    if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;
    return [ [ cx0 - ox, cy0 - oy ], [ cx0 * r1 / r, cy0 * r1 / r ] ];
  }
  function d3_svg_line(projection) {
    var x = d3_geom_pointX, y = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, tension = .7;
    function line(data) {
      var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);
      function segment() {
        segments.push("M", interpolate(projection(points), tension));
      }
      while (++i < n) {
        if (defined.call(this, d = data[i], i)) {
          points.push([ +fx.call(this, d, i), +fy.call(this, d, i) ]);
        } else if (points.length) {
          segment();
          points = [];
        }
      }
      if (points.length) segment();
      return segments.length ? segments.join("") : null;
    }
    line.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      return line;
    };
    line.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return line;
    };
    line.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return line;
    };
    line.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
      return line;
    };
    line.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return line;
    };
    return line;
  }
  d3.svg.line = function() {
    return d3_svg_line(d3_identity);
  };
  var d3_svg_lineInterpolators = d3.map({
    linear: d3_svg_lineLinear,
    "linear-closed": d3_svg_lineLinearClosed,
    step: d3_svg_lineStep,
    "step-before": d3_svg_lineStepBefore,
    "step-after": d3_svg_lineStepAfter,
    basis: d3_svg_lineBasis,
    "basis-open": d3_svg_lineBasisOpen,
    "basis-closed": d3_svg_lineBasisClosed,
    bundle: d3_svg_lineBundle,
    cardinal: d3_svg_lineCardinal,
    "cardinal-open": d3_svg_lineCardinalOpen,
    "cardinal-closed": d3_svg_lineCardinalClosed,
    monotone: d3_svg_lineMonotone
  });
  d3_svg_lineInterpolators.forEach(function(key, value) {
    value.key = key;
    value.closed = /-closed$/.test(key);
  });
  function d3_svg_lineLinear(points) {
    return points.length > 1 ? points.join("L") : points + "Z";
  }
  function d3_svg_lineLinearClosed(points) {
    return points.join("L") + "Z";
  }
  function d3_svg_lineStep(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("H", (p[0] + (p = points[i])[0]) / 2, "V", p[1]);
    if (n > 1) path.push("H", p[0]);
    return path.join("");
  }
  function d3_svg_lineStepBefore(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("V", (p = points[i])[1], "H", p[0]);
    return path.join("");
  }
  function d3_svg_lineStepAfter(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("H", (p = points[i])[0], "V", p[1]);
    return path.join("");
  }
  function d3_svg_lineCardinalOpen(points, tension) {
    return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, -1), d3_svg_lineCardinalTangents(points, tension));
  }
  function d3_svg_lineCardinalClosed(points, tension) {
    return points.length < 3 ? d3_svg_lineLinearClosed(points) : points[0] + d3_svg_lineHermite((points.push(points[0]), 
    points), d3_svg_lineCardinalTangents([ points[points.length - 2] ].concat(points, [ points[1] ]), tension));
  }
  function d3_svg_lineCardinal(points, tension) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
  }
  function d3_svg_lineHermite(points, tangents) {
    if (tangents.length < 1 || points.length != tangents.length && points.length != tangents.length + 2) {
      return d3_svg_lineLinear(points);
    }
    var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;
    if (quad) {
      path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
      p0 = points[1];
      pi = 2;
    }
    if (tangents.length > 1) {
      t = tangents[1];
      p = points[pi];
      pi++;
      path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
      for (var i = 2; i < tangents.length; i++, pi++) {
        p = points[pi];
        t = tangents[i];
        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
      }
    }
    if (quad) {
      var lp = points[pi];
      path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
    }
    return path;
  }
  function d3_svg_lineCardinalTangents(points, tension) {
    var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
    while (++i < n) {
      p0 = p1;
      p1 = p2;
      p2 = points[i];
      tangents.push([ a * (p2[0] - p0[0]), a * (p2[1] - p0[1]) ]);
    }
    return tangents;
  }
  function d3_svg_lineBasis(points) {
    if (points.length < 3) return d3_svg_lineLinear(points);
    var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [ x0, x0, x0, (pi = points[1])[0] ], py = [ y0, y0, y0, pi[1] ], path = [ x0, ",", y0, "L", d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
    points.push(points[n - 1]);
    while (++i <= n) {
      pi = points[i];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    points.pop();
    path.push("L", pi);
    return path.join("");
  }
  function d3_svg_lineBasisOpen(points) {
    if (points.length < 4) return d3_svg_lineLinear(points);
    var path = [], i = -1, n = points.length, pi, px = [ 0 ], py = [ 0 ];
    while (++i < 3) {
      pi = points[i];
      px.push(pi[0]);
      py.push(pi[1]);
    }
    path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + "," + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
    --i;
    while (++i < n) {
      pi = points[i];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBasisClosed(points) {
    var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
    while (++i < 4) {
      pi = points[i % n];
      px.push(pi[0]);
      py.push(pi[1]);
    }
    path = [ d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
    --i;
    while (++i < m) {
      pi = points[i % n];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBundle(points, tension) {
    var n = points.length - 1;
    if (n) {
      var x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p, t;
      while (++i <= n) {
        p = points[i];
        t = i / n;
        p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
        p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
      }
    }
    return d3_svg_lineBasis(points);
  }
  function d3_svg_lineDot4(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  }
  var d3_svg_lineBasisBezier1 = [ 0, 2 / 3, 1 / 3, 0 ], d3_svg_lineBasisBezier2 = [ 0, 1 / 3, 2 / 3, 0 ], d3_svg_lineBasisBezier3 = [ 0, 1 / 6, 2 / 3, 1 / 6 ];
  function d3_svg_lineBasisBezier(path, x, y) {
    path.push("C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
  }
  function d3_svg_lineSlope(p0, p1) {
    return (p1[1] - p0[1]) / (p1[0] - p0[0]);
  }
  function d3_svg_lineFiniteDifferences(points) {
    var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1], d = m[0] = d3_svg_lineSlope(p0, p1);
    while (++i < j) {
      m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
    }
    m[i] = d;
    return m;
  }
  function d3_svg_lineMonotoneTangents(points) {
    var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;
    while (++i < j) {
      d = d3_svg_lineSlope(points[i], points[i + 1]);
      if (abs(d) < epsilon) {
        m[i] = m[i + 1] = 0;
      } else {
        a = m[i] / d;
        b = m[i + 1] / d;
        s = a * a + b * b;
        if (s > 9) {
          s = d * 3 / Math.sqrt(s);
          m[i] = s * a;
          m[i + 1] = s * b;
        }
      }
    }
    i = -1;
    while (++i <= j) {
      s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
      tangents.push([ s || 0, m[i] * s || 0 ]);
    }
    return tangents;
  }
  function d3_svg_lineMonotone(points) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
  }
  d3.svg.line.radial = function() {
    var line = d3_svg_line(d3_svg_lineRadial);
    line.radius = line.x, delete line.x;
    line.angle = line.y, delete line.y;
    return line;
  };
  function d3_svg_lineRadial(points) {
    var point, i = -1, n = points.length, r, a;
    while (++i < n) {
      point = points[i];
      r = point[0];
      a = point[1] - halfPI;
      point[0] = r * Math.cos(a);
      point[1] = r * Math.sin(a);
    }
    return points;
  }
  function d3_svg_area(projection) {
    var x0 = d3_geom_pointX, x1 = d3_geom_pointX, y0 = 0, y1 = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, interpolateReverse = interpolate, L = "L", tension = .7;
    function area(data) {
      var segments = [], points0 = [], points1 = [], i = -1, n = data.length, d, fx0 = d3_functor(x0), fy0 = d3_functor(y0), fx1 = x0 === x1 ? function() {
        return x;
      } : d3_functor(x1), fy1 = y0 === y1 ? function() {
        return y;
      } : d3_functor(y1), x, y;
      function segment() {
        segments.push("M", interpolate(projection(points1), tension), L, interpolateReverse(projection(points0.reverse()), tension), "Z");
      }
      while (++i < n) {
        if (defined.call(this, d = data[i], i)) {
          points0.push([ x = +fx0.call(this, d, i), y = +fy0.call(this, d, i) ]);
          points1.push([ +fx1.call(this, d, i), +fy1.call(this, d, i) ]);
        } else if (points0.length) {
          segment();
          points0 = [];
          points1 = [];
        }
      }
      if (points0.length) segment();
      return segments.length ? segments.join("") : null;
    }
    area.x = function(_) {
      if (!arguments.length) return x1;
      x0 = x1 = _;
      return area;
    };
    area.x0 = function(_) {
      if (!arguments.length) return x0;
      x0 = _;
      return area;
    };
    area.x1 = function(_) {
      if (!arguments.length) return x1;
      x1 = _;
      return area;
    };
    area.y = function(_) {
      if (!arguments.length) return y1;
      y0 = y1 = _;
      return area;
    };
    area.y0 = function(_) {
      if (!arguments.length) return y0;
      y0 = _;
      return area;
    };
    area.y1 = function(_) {
      if (!arguments.length) return y1;
      y1 = _;
      return area;
    };
    area.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return area;
    };
    area.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
      interpolateReverse = interpolate.reverse || interpolate;
      L = interpolate.closed ? "M" : "L";
      return area;
    };
    area.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return area;
    };
    return area;
  }
  d3_svg_lineStepBefore.reverse = d3_svg_lineStepAfter;
  d3_svg_lineStepAfter.reverse = d3_svg_lineStepBefore;
  d3.svg.area = function() {
    return d3_svg_area(d3_identity);
  };
  d3.svg.area.radial = function() {
    var area = d3_svg_area(d3_svg_lineRadial);
    area.radius = area.x, delete area.x;
    area.innerRadius = area.x0, delete area.x0;
    area.outerRadius = area.x1, delete area.x1;
    area.angle = area.y, delete area.y;
    area.startAngle = area.y0, delete area.y0;
    area.endAngle = area.y1, delete area.y1;
    return area;
  };
  d3.svg.chord = function() {
    var source = d3_source, target = d3_target, radius = d3_svg_chordRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
    function chord(d, i) {
      var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
      return "M" + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.r, s.p1, s.r, s.p0) : curve(s.r, s.p1, t.r, t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(t.r, t.p1, s.r, s.p0)) + "Z";
    }
    function subgroup(self, f, d, i) {
      var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i), a0 = startAngle.call(self, subgroup, i) - halfPI, a1 = endAngle.call(self, subgroup, i) - halfPI;
      return {
        r: r,
        a0: a0,
        a1: a1,
        p0: [ r * Math.cos(a0), r * Math.sin(a0) ],
        p1: [ r * Math.cos(a1), r * Math.sin(a1) ]
      };
    }
    function equals(a, b) {
      return a.a0 == b.a0 && a.a1 == b.a1;
    }
    function arc(r, p, a) {
      return "A" + r + "," + r + " 0 " + +(a > PI) + ",1 " + p;
    }
    function curve(r0, p0, r1, p1) {
      return "Q 0,0 " + p1;
    }
    chord.radius = function(v) {
      if (!arguments.length) return radius;
      radius = d3_functor(v);
      return chord;
    };
    chord.source = function(v) {
      if (!arguments.length) return source;
      source = d3_functor(v);
      return chord;
    };
    chord.target = function(v) {
      if (!arguments.length) return target;
      target = d3_functor(v);
      return chord;
    };
    chord.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return chord;
    };
    chord.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return chord;
    };
    return chord;
  };
  function d3_svg_chordRadius(d) {
    return d.radius;
  }
  d3.svg.diagonal = function() {
    var source = d3_source, target = d3_target, projection = d3_svg_diagonalProjection;
    function diagonal(d, i) {
      var p0 = source.call(this, d, i), p3 = target.call(this, d, i), m = (p0.y + p3.y) / 2, p = [ p0, {
        x: p0.x,
        y: m
      }, {
        x: p3.x,
        y: m
      }, p3 ];
      p = p.map(projection);
      return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
    }
    diagonal.source = function(x) {
      if (!arguments.length) return source;
      source = d3_functor(x);
      return diagonal;
    };
    diagonal.target = function(x) {
      if (!arguments.length) return target;
      target = d3_functor(x);
      return diagonal;
    };
    diagonal.projection = function(x) {
      if (!arguments.length) return projection;
      projection = x;
      return diagonal;
    };
    return diagonal;
  };
  function d3_svg_diagonalProjection(d) {
    return [ d.x, d.y ];
  }
  d3.svg.diagonal.radial = function() {
    var diagonal = d3.svg.diagonal(), projection = d3_svg_diagonalProjection, projection_ = diagonal.projection;
    diagonal.projection = function(x) {
      return arguments.length ? projection_(d3_svg_diagonalRadialProjection(projection = x)) : projection;
    };
    return diagonal;
  };
  function d3_svg_diagonalRadialProjection(projection) {
    return function() {
      var d = projection.apply(this, arguments), r = d[0], a = d[1] - halfPI;
      return [ r * Math.cos(a), r * Math.sin(a) ];
    };
  }
  d3.svg.symbol = function() {
    var type = d3_svg_symbolType, size = d3_svg_symbolSize;
    function symbol(d, i) {
      return (d3_svg_symbols.get(type.call(this, d, i)) || d3_svg_symbolCircle)(size.call(this, d, i));
    }
    symbol.type = function(x) {
      if (!arguments.length) return type;
      type = d3_functor(x);
      return symbol;
    };
    symbol.size = function(x) {
      if (!arguments.length) return size;
      size = d3_functor(x);
      return symbol;
    };
    return symbol;
  };
  function d3_svg_symbolSize() {
    return 64;
  }
  function d3_svg_symbolType() {
    return "circle";
  }
  function d3_svg_symbolCircle(size) {
    var r = Math.sqrt(size / PI);
    return "M0," + r + "A" + r + "," + r + " 0 1,1 0," + -r + "A" + r + "," + r + " 0 1,1 0," + r + "Z";
  }
  var d3_svg_symbols = d3.map({
    circle: d3_svg_symbolCircle,
    cross: function(size) {
      var r = Math.sqrt(size / 5) / 2;
      return "M" + -3 * r + "," + -r + "H" + -r + "V" + -3 * r + "H" + r + "V" + -r + "H" + 3 * r + "V" + r + "H" + r + "V" + 3 * r + "H" + -r + "V" + r + "H" + -3 * r + "Z";
    },
    diamond: function(size) {
      var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
      return "M0," + -ry + "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" + "Z";
    },
    square: function(size) {
      var r = Math.sqrt(size) / 2;
      return "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r + "Z";
    },
    "triangle-down": function(size) {
      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
      return "M0," + ry + "L" + rx + "," + -ry + " " + -rx + "," + -ry + "Z";
    },
    "triangle-up": function(size) {
      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
      return "M0," + -ry + "L" + rx + "," + ry + " " + -rx + "," + ry + "Z";
    }
  });
  d3.svg.symbolTypes = d3_svg_symbols.keys();
  var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * d3_radians);
  d3_selectionPrototype.transition = function(name) {
    var id = d3_transitionInheritId || ++d3_transitionId, ns = d3_transitionNamespace(name), subgroups = [], subgroup, node, transition = d3_transitionInherit || {
      time: Date.now(),
      ease: d3_ease_cubicInOut,
      delay: 0,
      duration: 250
    };
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) d3_transitionNode(node, i, ns, id, transition);
        subgroup.push(node);
      }
    }
    return d3_transition(subgroups, ns, id);
  };
  d3_selectionPrototype.interrupt = function(name) {
    return this.each(name == null ? d3_selection_interrupt : d3_selection_interruptNS(d3_transitionNamespace(name)));
  };
  var d3_selection_interrupt = d3_selection_interruptNS(d3_transitionNamespace());
  function d3_selection_interruptNS(ns) {
    return function() {
      var lock, activeId, active;
      if ((lock = this[ns]) && (active = lock[activeId = lock.active])) {
        active.timer.c = null;
        active.timer.t = NaN;
        if (--lock.count) delete lock[activeId]; else delete this[ns];
        lock.active += .5;
        active.event && active.event.interrupt.call(this, this.__data__, active.index);
      }
    };
  }
  function d3_transition(groups, ns, id) {
    d3_subclass(groups, d3_transitionPrototype);
    groups.namespace = ns;
    groups.id = id;
    return groups;
  }
  var d3_transitionPrototype = [], d3_transitionId = 0, d3_transitionInheritId, d3_transitionInherit;
  d3_transitionPrototype.call = d3_selectionPrototype.call;
  d3_transitionPrototype.empty = d3_selectionPrototype.empty;
  d3_transitionPrototype.node = d3_selectionPrototype.node;
  d3_transitionPrototype.size = d3_selectionPrototype.size;
  d3.transition = function(selection, name) {
    return selection && selection.transition ? d3_transitionInheritId ? selection.transition(name) : selection : d3.selection().transition(selection);
  };
  d3.transition.prototype = d3_transitionPrototype;
  d3_transitionPrototype.select = function(selector) {
    var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnode, node;
    selector = d3_selection_selector(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if ((node = group[i]) && (subnode = selector.call(node, node.__data__, i, j))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          d3_transitionNode(subnode, i, ns, id, node[ns][id]);
          subgroup.push(subnode);
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_transition(subgroups, ns, id);
  };
  d3_transitionPrototype.selectAll = function(selector) {
    var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnodes, node, subnode, transition;
    selector = d3_selection_selectorAll(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          transition = node[ns][id];
          subnodes = selector.call(node, node.__data__, i, j);
          subgroups.push(subgroup = []);
          for (var k = -1, o = subnodes.length; ++k < o; ) {
            if (subnode = subnodes[k]) d3_transitionNode(subnode, k, ns, id, transition);
            subgroup.push(subnode);
          }
        }
      }
    }
    return d3_transition(subgroups, ns, id);
  };
  d3_transitionPrototype.filter = function(filter) {
    var subgroups = [], subgroup, group, node;
    if (typeof filter !== "function") filter = d3_selection_filter(filter);
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
          subgroup.push(node);
        }
      }
    }
    return d3_transition(subgroups, this.namespace, this.id);
  };
  d3_transitionPrototype.tween = function(name, tween) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 2) return this.node()[ns][id].tween.get(name);
    return d3_selection_each(this, tween == null ? function(node) {
      node[ns][id].tween.remove(name);
    } : function(node) {
      node[ns][id].tween.set(name, tween);
    });
  };
  function d3_transition_tween(groups, name, value, tween) {
    var id = groups.id, ns = groups.namespace;
    return d3_selection_each(groups, typeof value === "function" ? function(node, i, j) {
      node[ns][id].tween.set(name, tween(value.call(node, node.__data__, i, j)));
    } : (value = tween(value), function(node) {
      node[ns][id].tween.set(name, value);
    }));
  }
  d3_transitionPrototype.attr = function(nameNS, value) {
    if (arguments.length < 2) {
      for (value in nameNS) this.attr(value, nameNS[value]);
      return this;
    }
    var interpolate = nameNS == "transform" ? d3_interpolateTransform : d3_interpolate, name = d3.ns.qualify(nameNS);
    function attrNull() {
      this.removeAttribute(name);
    }
    function attrNullNS() {
      this.removeAttributeNS(name.space, name.local);
    }
    function attrTween(b) {
      return b == null ? attrNull : (b += "", function() {
        var a = this.getAttribute(name), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.setAttribute(name, i(t));
        });
      });
    }
    function attrTweenNS(b) {
      return b == null ? attrNullNS : (b += "", function() {
        var a = this.getAttributeNS(name.space, name.local), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.setAttributeNS(name.space, name.local, i(t));
        });
      });
    }
    return d3_transition_tween(this, "attr." + nameNS, value, name.local ? attrTweenNS : attrTween);
  };
  d3_transitionPrototype.attrTween = function(nameNS, tween) {
    var name = d3.ns.qualify(nameNS);
    function attrTween(d, i) {
      var f = tween.call(this, d, i, this.getAttribute(name));
      return f && function(t) {
        this.setAttribute(name, f(t));
      };
    }
    function attrTweenNS(d, i) {
      var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
      return f && function(t) {
        this.setAttributeNS(name.space, name.local, f(t));
      };
    }
    return this.tween("attr." + nameNS, name.local ? attrTweenNS : attrTween);
  };
  d3_transitionPrototype.style = function(name, value, priority) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof name !== "string") {
        if (n < 2) value = "";
        for (priority in name) this.style(priority, name[priority], value);
        return this;
      }
      priority = "";
    }
    function styleNull() {
      this.style.removeProperty(name);
    }
    function styleString(b) {
      return b == null ? styleNull : (b += "", function() {
        var a = d3_window(this).getComputedStyle(this, null).getPropertyValue(name), i;
        return a !== b && (i = d3_interpolate(a, b), function(t) {
          this.style.setProperty(name, i(t), priority);
        });
      });
    }
    return d3_transition_tween(this, "style." + name, value, styleString);
  };
  d3_transitionPrototype.styleTween = function(name, tween, priority) {
    if (arguments.length < 3) priority = "";
    function styleTween(d, i) {
      var f = tween.call(this, d, i, d3_window(this).getComputedStyle(this, null).getPropertyValue(name));
      return f && function(t) {
        this.style.setProperty(name, f(t), priority);
      };
    }
    return this.tween("style." + name, styleTween);
  };
  d3_transitionPrototype.text = function(value) {
    return d3_transition_tween(this, "text", value, d3_transition_text);
  };
  function d3_transition_text(b) {
    if (b == null) b = "";
    return function() {
      this.textContent = b;
    };
  }
  d3_transitionPrototype.remove = function() {
    var ns = this.namespace;
    return this.each("end.transition", function() {
      var p;
      if (this[ns].count < 2 && (p = this.parentNode)) p.removeChild(this);
    });
  };
  d3_transitionPrototype.ease = function(value) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 1) return this.node()[ns][id].ease;
    if (typeof value !== "function") value = d3.ease.apply(d3, arguments);
    return d3_selection_each(this, function(node) {
      node[ns][id].ease = value;
    });
  };
  d3_transitionPrototype.delay = function(value) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 1) return this.node()[ns][id].delay;
    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
      node[ns][id].delay = +value.call(node, node.__data__, i, j);
    } : (value = +value, function(node) {
      node[ns][id].delay = value;
    }));
  };
  d3_transitionPrototype.duration = function(value) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 1) return this.node()[ns][id].duration;
    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
      node[ns][id].duration = Math.max(1, value.call(node, node.__data__, i, j));
    } : (value = Math.max(1, value), function(node) {
      node[ns][id].duration = value;
    }));
  };
  d3_transitionPrototype.each = function(type, listener) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 2) {
      var inherit = d3_transitionInherit, inheritId = d3_transitionInheritId;
      try {
        d3_transitionInheritId = id;
        d3_selection_each(this, function(node, i, j) {
          d3_transitionInherit = node[ns][id];
          type.call(node, node.__data__, i, j);
        });
      } finally {
        d3_transitionInherit = inherit;
        d3_transitionInheritId = inheritId;
      }
    } else {
      d3_selection_each(this, function(node) {
        var transition = node[ns][id];
        (transition.event || (transition.event = d3.dispatch("start", "end", "interrupt"))).on(type, listener);
      });
    }
    return this;
  };
  d3_transitionPrototype.transition = function() {
    var id0 = this.id, id1 = ++d3_transitionId, ns = this.namespace, subgroups = [], subgroup, group, node, transition;
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        if (node = group[i]) {
          transition = node[ns][id0];
          d3_transitionNode(node, i, ns, id1, {
            time: transition.time,
            ease: transition.ease,
            delay: transition.delay + transition.duration,
            duration: transition.duration
          });
        }
        subgroup.push(node);
      }
    }
    return d3_transition(subgroups, ns, id1);
  };
  function d3_transitionNamespace(name) {
    return name == null ? "__transition__" : "__transition_" + name + "__";
  }
  function d3_transitionNode(node, i, ns, id, inherit) {
    var lock = node[ns] || (node[ns] = {
      active: 0,
      count: 0
    }), transition = lock[id], time, timer, duration, ease, tweens;
    function schedule(elapsed) {
      var delay = transition.delay;
      timer.t = delay + time;
      if (delay <= elapsed) return start(elapsed - delay);
      timer.c = start;
    }
    function start(elapsed) {
      var activeId = lock.active, active = lock[activeId];
      if (active) {
        active.timer.c = null;
        active.timer.t = NaN;
        --lock.count;
        delete lock[activeId];
        active.event && active.event.interrupt.call(node, node.__data__, active.index);
      }
      for (var cancelId in lock) {
        if (+cancelId < id) {
          var cancel = lock[cancelId];
          cancel.timer.c = null;
          cancel.timer.t = NaN;
          --lock.count;
          delete lock[cancelId];
        }
      }
      timer.c = tick;
      d3_timer(function() {
        if (timer.c && tick(elapsed || 1)) {
          timer.c = null;
          timer.t = NaN;
        }
        return 1;
      }, 0, time);
      lock.active = id;
      transition.event && transition.event.start.call(node, node.__data__, i);
      tweens = [];
      transition.tween.forEach(function(key, value) {
        if (value = value.call(node, node.__data__, i)) {
          tweens.push(value);
        }
      });
      ease = transition.ease;
      duration = transition.duration;
    }
    function tick(elapsed) {
      var t = elapsed / duration, e = ease(t), n = tweens.length;
      while (n > 0) {
        tweens[--n].call(node, e);
      }
      if (t >= 1) {
        transition.event && transition.event.end.call(node, node.__data__, i);
        if (--lock.count) delete lock[id]; else delete node[ns];
        return 1;
      }
    }
    if (!transition) {
      time = inherit.time;
      timer = d3_timer(schedule, 0, time);
      transition = lock[id] = {
        tween: new d3_Map(),
        time: time,
        timer: timer,
        delay: inherit.delay,
        duration: inherit.duration,
        ease: inherit.ease,
        index: i
      };
      inherit = null;
      ++lock.count;
    }
  }
  d3.svg.axis = function() {
    var scale = d3.scale.linear(), orient = d3_svg_axisDefaultOrient, innerTickSize = 6, outerTickSize = 6, tickPadding = 3, tickArguments_ = [ 10 ], tickValues = null, tickFormat_;
    function axis(g) {
      g.each(function() {
        var g = d3.select(this);
        var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = scale.copy();
        var ticks = tickValues == null ? scale1.ticks ? scale1.ticks.apply(scale1, tickArguments_) : scale1.domain() : tickValues, tickFormat = tickFormat_ == null ? scale1.tickFormat ? scale1.tickFormat.apply(scale1, tickArguments_) : d3_identity : tickFormat_, tick = g.selectAll(".tick").data(ticks, scale1), tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", epsilon), tickExit = d3.transition(tick.exit()).style("opacity", epsilon).remove(), tickUpdate = d3.transition(tick.order()).style("opacity", 1), tickSpacing = Math.max(innerTickSize, 0) + tickPadding, tickTransform;
        var range = d3_scaleRange(scale1), path = g.selectAll(".domain").data([ 0 ]), pathUpdate = (path.enter().append("path").attr("class", "domain"), 
        d3.transition(path));
        tickEnter.append("line");
        tickEnter.append("text");
        var lineEnter = tickEnter.select("line"), lineUpdate = tickUpdate.select("line"), text = tick.select("text").text(tickFormat), textEnter = tickEnter.select("text"), textUpdate = tickUpdate.select("text"), sign = orient === "top" || orient === "left" ? -1 : 1, x1, x2, y1, y2;
        if (orient === "bottom" || orient === "top") {
          tickTransform = d3_svg_axisX, x1 = "x", y1 = "y", x2 = "x2", y2 = "y2";
          text.attr("dy", sign < 0 ? "0em" : ".71em").style("text-anchor", "middle");
          pathUpdate.attr("d", "M" + range[0] + "," + sign * outerTickSize + "V0H" + range[1] + "V" + sign * outerTickSize);
        } else {
          tickTransform = d3_svg_axisY, x1 = "y", y1 = "x", x2 = "y2", y2 = "x2";
          text.attr("dy", ".32em").style("text-anchor", sign < 0 ? "end" : "start");
          pathUpdate.attr("d", "M" + sign * outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + sign * outerTickSize);
        }
        lineEnter.attr(y2, sign * innerTickSize);
        textEnter.attr(y1, sign * tickSpacing);
        lineUpdate.attr(x2, 0).attr(y2, sign * innerTickSize);
        textUpdate.attr(x1, 0).attr(y1, sign * tickSpacing);
        if (scale1.rangeBand) {
          var x = scale1, dx = x.rangeBand() / 2;
          scale0 = scale1 = function(d) {
            return x(d) + dx;
          };
        } else if (scale0.rangeBand) {
          scale0 = scale1;
        } else {
          tickExit.call(tickTransform, scale1, scale0);
        }
        tickEnter.call(tickTransform, scale0, scale1);
        tickUpdate.call(tickTransform, scale1, scale1);
      });
    }
    axis.scale = function(x) {
      if (!arguments.length) return scale;
      scale = x;
      return axis;
    };
    axis.orient = function(x) {
      if (!arguments.length) return orient;
      orient = x in d3_svg_axisOrients ? x + "" : d3_svg_axisDefaultOrient;
      return axis;
    };
    axis.ticks = function() {
      if (!arguments.length) return tickArguments_;
      tickArguments_ = d3_array(arguments);
      return axis;
    };
    axis.tickValues = function(x) {
      if (!arguments.length) return tickValues;
      tickValues = x;
      return axis;
    };
    axis.tickFormat = function(x) {
      if (!arguments.length) return tickFormat_;
      tickFormat_ = x;
      return axis;
    };
    axis.tickSize = function(x) {
      var n = arguments.length;
      if (!n) return innerTickSize;
      innerTickSize = +x;
      outerTickSize = +arguments[n - 1];
      return axis;
    };
    axis.innerTickSize = function(x) {
      if (!arguments.length) return innerTickSize;
      innerTickSize = +x;
      return axis;
    };
    axis.outerTickSize = function(x) {
      if (!arguments.length) return outerTickSize;
      outerTickSize = +x;
      return axis;
    };
    axis.tickPadding = function(x) {
      if (!arguments.length) return tickPadding;
      tickPadding = +x;
      return axis;
    };
    axis.tickSubdivide = function() {
      return arguments.length && axis;
    };
    return axis;
  };
  var d3_svg_axisDefaultOrient = "bottom", d3_svg_axisOrients = {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1
  };
  function d3_svg_axisX(selection, x0, x1) {
    selection.attr("transform", function(d) {
      var v0 = x0(d);
      return "translate(" + (isFinite(v0) ? v0 : x1(d)) + ",0)";
    });
  }
  function d3_svg_axisY(selection, y0, y1) {
    selection.attr("transform", function(d) {
      var v0 = y0(d);
      return "translate(0," + (isFinite(v0) ? v0 : y1(d)) + ")";
    });
  }
  d3.svg.brush = function() {
    var event = d3_eventDispatch(brush, "brushstart", "brush", "brushend"), x = null, y = null, xExtent = [ 0, 0 ], yExtent = [ 0, 0 ], xExtentDomain, yExtentDomain, xClamp = true, yClamp = true, resizes = d3_svg_brushResizes[0];
    function brush(g) {
      g.each(function() {
        var g = d3.select(this).style("pointer-events", "all").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)").on("mousedown.brush", brushstart).on("touchstart.brush", brushstart);
        var background = g.selectAll(".background").data([ 0 ]);
        background.enter().append("rect").attr("class", "background").style("visibility", "hidden").style("cursor", "crosshair");
        g.selectAll(".extent").data([ 0 ]).enter().append("rect").attr("class", "extent").style("cursor", "move");
        var resize = g.selectAll(".resize").data(resizes, d3_identity);
        resize.exit().remove();
        resize.enter().append("g").attr("class", function(d) {
          return "resize " + d;
        }).style("cursor", function(d) {
          return d3_svg_brushCursor[d];
        }).append("rect").attr("x", function(d) {
          return /[ew]$/.test(d) ? -3 : null;
        }).attr("y", function(d) {
          return /^[ns]/.test(d) ? -3 : null;
        }).attr("width", 6).attr("height", 6).style("visibility", "hidden");
        resize.style("display", brush.empty() ? "none" : null);
        var gUpdate = d3.transition(g), backgroundUpdate = d3.transition(background), range;
        if (x) {
          range = d3_scaleRange(x);
          backgroundUpdate.attr("x", range[0]).attr("width", range[1] - range[0]);
          redrawX(gUpdate);
        }
        if (y) {
          range = d3_scaleRange(y);
          backgroundUpdate.attr("y", range[0]).attr("height", range[1] - range[0]);
          redrawY(gUpdate);
        }
        redraw(gUpdate);
      });
    }
    brush.event = function(g) {
      g.each(function() {
        var event_ = event.of(this, arguments), extent1 = {
          x: xExtent,
          y: yExtent,
          i: xExtentDomain,
          j: yExtentDomain
        }, extent0 = this.__chart__ || extent1;
        this.__chart__ = extent1;
        if (d3_transitionInheritId) {
          d3.select(this).transition().each("start.brush", function() {
            xExtentDomain = extent0.i;
            yExtentDomain = extent0.j;
            xExtent = extent0.x;
            yExtent = extent0.y;
            event_({
              type: "brushstart"
            });
          }).tween("brush:brush", function() {
            var xi = d3_interpolateArray(xExtent, extent1.x), yi = d3_interpolateArray(yExtent, extent1.y);
            xExtentDomain = yExtentDomain = null;
            return function(t) {
              xExtent = extent1.x = xi(t);
              yExtent = extent1.y = yi(t);
              event_({
                type: "brush",
                mode: "resize"
              });
            };
          }).each("end.brush", function() {
            xExtentDomain = extent1.i;
            yExtentDomain = extent1.j;
            event_({
              type: "brush",
              mode: "resize"
            });
            event_({
              type: "brushend"
            });
          });
        } else {
          event_({
            type: "brushstart"
          });
          event_({
            type: "brush",
            mode: "resize"
          });
          event_({
            type: "brushend"
          });
        }
      });
    };
    function redraw(g) {
      g.selectAll(".resize").attr("transform", function(d) {
        return "translate(" + xExtent[+/e$/.test(d)] + "," + yExtent[+/^s/.test(d)] + ")";
      });
    }
    function redrawX(g) {
      g.select(".extent").attr("x", xExtent[0]);
      g.selectAll(".extent,.n>rect,.s>rect").attr("width", xExtent[1] - xExtent[0]);
    }
    function redrawY(g) {
      g.select(".extent").attr("y", yExtent[0]);
      g.selectAll(".extent,.e>rect,.w>rect").attr("height", yExtent[1] - yExtent[0]);
    }
    function brushstart() {
      var target = this, eventTarget = d3.select(d3.event.target), event_ = event.of(target, arguments), g = d3.select(target), resizing = eventTarget.datum(), resizingX = !/^(n|s)$/.test(resizing) && x, resizingY = !/^(e|w)$/.test(resizing) && y, dragging = eventTarget.classed("extent"), dragRestore = d3_event_dragSuppress(target), center, origin = d3.mouse(target), offset;
      var w = d3.select(d3_window(target)).on("keydown.brush", keydown).on("keyup.brush", keyup);
      if (d3.event.changedTouches) {
        w.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
      } else {
        w.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
      }
      g.interrupt().selectAll("*").interrupt();
      if (dragging) {
        origin[0] = xExtent[0] - origin[0];
        origin[1] = yExtent[0] - origin[1];
      } else if (resizing) {
        var ex = +/w$/.test(resizing), ey = +/^n/.test(resizing);
        offset = [ xExtent[1 - ex] - origin[0], yExtent[1 - ey] - origin[1] ];
        origin[0] = xExtent[ex];
        origin[1] = yExtent[ey];
      } else if (d3.event.altKey) center = origin.slice();
      g.style("pointer-events", "none").selectAll(".resize").style("display", null);
      d3.select("body").style("cursor", eventTarget.style("cursor"));
      event_({
        type: "brushstart"
      });
      brushmove();
      function keydown() {
        if (d3.event.keyCode == 32) {
          if (!dragging) {
            center = null;
            origin[0] -= xExtent[1];
            origin[1] -= yExtent[1];
            dragging = 2;
          }
          d3_eventPreventDefault();
        }
      }
      function keyup() {
        if (d3.event.keyCode == 32 && dragging == 2) {
          origin[0] += xExtent[1];
          origin[1] += yExtent[1];
          dragging = 0;
          d3_eventPreventDefault();
        }
      }
      function brushmove() {
        var point = d3.mouse(target), moved = false;
        if (offset) {
          point[0] += offset[0];
          point[1] += offset[1];
        }
        if (!dragging) {
          if (d3.event.altKey) {
            if (!center) center = [ (xExtent[0] + xExtent[1]) / 2, (yExtent[0] + yExtent[1]) / 2 ];
            origin[0] = xExtent[+(point[0] < center[0])];
            origin[1] = yExtent[+(point[1] < center[1])];
          } else center = null;
        }
        if (resizingX && move1(point, x, 0)) {
          redrawX(g);
          moved = true;
        }
        if (resizingY && move1(point, y, 1)) {
          redrawY(g);
          moved = true;
        }
        if (moved) {
          redraw(g);
          event_({
            type: "brush",
            mode: dragging ? "move" : "resize"
          });
        }
      }
      function move1(point, scale, i) {
        var range = d3_scaleRange(scale), r0 = range[0], r1 = range[1], position = origin[i], extent = i ? yExtent : xExtent, size = extent[1] - extent[0], min, max;
        if (dragging) {
          r0 -= position;
          r1 -= size + position;
        }
        min = (i ? yClamp : xClamp) ? Math.max(r0, Math.min(r1, point[i])) : point[i];
        if (dragging) {
          max = (min += position) + size;
        } else {
          if (center) position = Math.max(r0, Math.min(r1, 2 * center[i] - min));
          if (position < min) {
            max = min;
            min = position;
          } else {
            max = position;
          }
        }
        if (extent[0] != min || extent[1] != max) {
          if (i) yExtentDomain = null; else xExtentDomain = null;
          extent[0] = min;
          extent[1] = max;
          return true;
        }
      }
      function brushend() {
        brushmove();
        g.style("pointer-events", "all").selectAll(".resize").style("display", brush.empty() ? "none" : null);
        d3.select("body").style("cursor", null);
        w.on("mousemove.brush", null).on("mouseup.brush", null).on("touchmove.brush", null).on("touchend.brush", null).on("keydown.brush", null).on("keyup.brush", null);
        dragRestore();
        event_({
          type: "brushend"
        });
      }
    }
    brush.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y];
      return brush;
    };
    brush.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y];
      return brush;
    };
    brush.clamp = function(z) {
      if (!arguments.length) return x && y ? [ xClamp, yClamp ] : x ? xClamp : y ? yClamp : null;
      if (x && y) xClamp = !!z[0], yClamp = !!z[1]; else if (x) xClamp = !!z; else if (y) yClamp = !!z;
      return brush;
    };
    brush.extent = function(z) {
      var x0, x1, y0, y1, t;
      if (!arguments.length) {
        if (x) {
          if (xExtentDomain) {
            x0 = xExtentDomain[0], x1 = xExtentDomain[1];
          } else {
            x0 = xExtent[0], x1 = xExtent[1];
            if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
            if (x1 < x0) t = x0, x0 = x1, x1 = t;
          }
        }
        if (y) {
          if (yExtentDomain) {
            y0 = yExtentDomain[0], y1 = yExtentDomain[1];
          } else {
            y0 = yExtent[0], y1 = yExtent[1];
            if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
            if (y1 < y0) t = y0, y0 = y1, y1 = t;
          }
        }
        return x && y ? [ [ x0, y0 ], [ x1, y1 ] ] : x ? [ x0, x1 ] : y && [ y0, y1 ];
      }
      if (x) {
        x0 = z[0], x1 = z[1];
        if (y) x0 = x0[0], x1 = x1[0];
        xExtentDomain = [ x0, x1 ];
        if (x.invert) x0 = x(x0), x1 = x(x1);
        if (x1 < x0) t = x0, x0 = x1, x1 = t;
        if (x0 != xExtent[0] || x1 != xExtent[1]) xExtent = [ x0, x1 ];
      }
      if (y) {
        y0 = z[0], y1 = z[1];
        if (x) y0 = y0[1], y1 = y1[1];
        yExtentDomain = [ y0, y1 ];
        if (y.invert) y0 = y(y0), y1 = y(y1);
        if (y1 < y0) t = y0, y0 = y1, y1 = t;
        if (y0 != yExtent[0] || y1 != yExtent[1]) yExtent = [ y0, y1 ];
      }
      return brush;
    };
    brush.clear = function() {
      if (!brush.empty()) {
        xExtent = [ 0, 0 ], yExtent = [ 0, 0 ];
        xExtentDomain = yExtentDomain = null;
      }
      return brush;
    };
    brush.empty = function() {
      return !!x && xExtent[0] == xExtent[1] || !!y && yExtent[0] == yExtent[1];
    };
    return d3.rebind(brush, event, "on");
  };
  var d3_svg_brushCursor = {
    n: "ns-resize",
    e: "ew-resize",
    s: "ns-resize",
    w: "ew-resize",
    nw: "nwse-resize",
    ne: "nesw-resize",
    se: "nwse-resize",
    sw: "nesw-resize"
  };
  var d3_svg_brushResizes = [ [ "n", "e", "s", "w", "nw", "ne", "se", "sw" ], [ "e", "w" ], [ "n", "s" ], [] ];
  var d3_time_format = d3_time.format = d3_locale_enUS.timeFormat;
  var d3_time_formatUtc = d3_time_format.utc;
  var d3_time_formatIso = d3_time_formatUtc("%Y-%m-%dT%H:%M:%S.%LZ");
  d3_time_format.iso = Date.prototype.toISOString && +new Date("2000-01-01T00:00:00.000Z") ? d3_time_formatIsoNative : d3_time_formatIso;
  function d3_time_formatIsoNative(date) {
    return date.toISOString();
  }
  d3_time_formatIsoNative.parse = function(string) {
    var date = new Date(string);
    return isNaN(date) ? null : date;
  };
  d3_time_formatIsoNative.toString = d3_time_formatIso.toString;
  d3_time.second = d3_time_interval(function(date) {
    return new d3_date(Math.floor(date / 1e3) * 1e3);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 1e3);
  }, function(date) {
    return date.getSeconds();
  });
  d3_time.seconds = d3_time.second.range;
  d3_time.seconds.utc = d3_time.second.utc.range;
  d3_time.minute = d3_time_interval(function(date) {
    return new d3_date(Math.floor(date / 6e4) * 6e4);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 6e4);
  }, function(date) {
    return date.getMinutes();
  });
  d3_time.minutes = d3_time.minute.range;
  d3_time.minutes.utc = d3_time.minute.utc.range;
  d3_time.hour = d3_time_interval(function(date) {
    var timezone = date.getTimezoneOffset() / 60;
    return new d3_date((Math.floor(date / 36e5 - timezone) + timezone) * 36e5);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 36e5);
  }, function(date) {
    return date.getHours();
  });
  d3_time.hours = d3_time.hour.range;
  d3_time.hours.utc = d3_time.hour.utc.range;
  d3_time.month = d3_time_interval(function(date) {
    date = d3_time.day(date);
    date.setDate(1);
    return date;
  }, function(date, offset) {
    date.setMonth(date.getMonth() + offset);
  }, function(date) {
    return date.getMonth();
  });
  d3_time.months = d3_time.month.range;
  d3_time.months.utc = d3_time.month.utc.range;
  function d3_time_scale(linear, methods, format) {
    function scale(x) {
      return linear(x);
    }
    scale.invert = function(x) {
      return d3_time_scaleDate(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return linear.domain().map(d3_time_scaleDate);
      linear.domain(x);
      return scale;
    };
    function tickMethod(extent, count) {
      var span = extent[1] - extent[0], target = span / count, i = d3.bisect(d3_time_scaleSteps, target);
      return i == d3_time_scaleSteps.length ? [ methods.year, d3_scale_linearTickRange(extent.map(function(d) {
        return d / 31536e6;
      }), count)[2] ] : !i ? [ d3_time_scaleMilliseconds, d3_scale_linearTickRange(extent, count)[2] ] : methods[target / d3_time_scaleSteps[i - 1] < d3_time_scaleSteps[i] / target ? i - 1 : i];
    }
    scale.nice = function(interval, skip) {
      var domain = scale.domain(), extent = d3_scaleExtent(domain), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" && tickMethod(extent, interval);
      if (method) interval = method[0], skip = method[1];
      function skipped(date) {
        return !isNaN(date) && !interval.range(date, d3_time_scaleDate(+date + 1), skip).length;
      }
      return scale.domain(d3_scale_nice(domain, skip > 1 ? {
        floor: function(date) {
          while (skipped(date = interval.floor(date))) date = d3_time_scaleDate(date - 1);
          return date;
        },
        ceil: function(date) {
          while (skipped(date = interval.ceil(date))) date = d3_time_scaleDate(+date + 1);
          return date;
        }
      } : interval));
    };
    scale.ticks = function(interval, skip) {
      var extent = d3_scaleExtent(scale.domain()), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" ? tickMethod(extent, interval) : !interval.range && [ {
        range: interval
      }, skip ];
      if (method) interval = method[0], skip = method[1];
      return interval.range(extent[0], d3_time_scaleDate(+extent[1] + 1), skip < 1 ? 1 : skip);
    };
    scale.tickFormat = function() {
      return format;
    };
    scale.copy = function() {
      return d3_time_scale(linear.copy(), methods, format);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  function d3_time_scaleDate(t) {
    return new Date(t);
  }
  var d3_time_scaleSteps = [ 1e3, 5e3, 15e3, 3e4, 6e4, 3e5, 9e5, 18e5, 36e5, 108e5, 216e5, 432e5, 864e5, 1728e5, 6048e5, 2592e6, 7776e6, 31536e6 ];
  var d3_time_scaleLocalMethods = [ [ d3_time.second, 1 ], [ d3_time.second, 5 ], [ d3_time.second, 15 ], [ d3_time.second, 30 ], [ d3_time.minute, 1 ], [ d3_time.minute, 5 ], [ d3_time.minute, 15 ], [ d3_time.minute, 30 ], [ d3_time.hour, 1 ], [ d3_time.hour, 3 ], [ d3_time.hour, 6 ], [ d3_time.hour, 12 ], [ d3_time.day, 1 ], [ d3_time.day, 2 ], [ d3_time.week, 1 ], [ d3_time.month, 1 ], [ d3_time.month, 3 ], [ d3_time.year, 1 ] ];
  var d3_time_scaleLocalFormat = d3_time_format.multi([ [ ".%L", function(d) {
    return d.getMilliseconds();
  } ], [ ":%S", function(d) {
    return d.getSeconds();
  } ], [ "%I:%M", function(d) {
    return d.getMinutes();
  } ], [ "%I %p", function(d) {
    return d.getHours();
  } ], [ "%a %d", function(d) {
    return d.getDay() && d.getDate() != 1;
  } ], [ "%b %d", function(d) {
    return d.getDate() != 1;
  } ], [ "%B", function(d) {
    return d.getMonth();
  } ], [ "%Y", d3_true ] ]);
  var d3_time_scaleMilliseconds = {
    range: function(start, stop, step) {
      return d3.range(Math.ceil(start / step) * step, +stop, step).map(d3_time_scaleDate);
    },
    floor: d3_identity,
    ceil: d3_identity
  };
  d3_time_scaleLocalMethods.year = d3_time.year;
  d3_time.scale = function() {
    return d3_time_scale(d3.scale.linear(), d3_time_scaleLocalMethods, d3_time_scaleLocalFormat);
  };
  var d3_time_scaleUtcMethods = d3_time_scaleLocalMethods.map(function(m) {
    return [ m[0].utc, m[1] ];
  });
  var d3_time_scaleUtcFormat = d3_time_formatUtc.multi([ [ ".%L", function(d) {
    return d.getUTCMilliseconds();
  } ], [ ":%S", function(d) {
    return d.getUTCSeconds();
  } ], [ "%I:%M", function(d) {
    return d.getUTCMinutes();
  } ], [ "%I %p", function(d) {
    return d.getUTCHours();
  } ], [ "%a %d", function(d) {
    return d.getUTCDay() && d.getUTCDate() != 1;
  } ], [ "%b %d", function(d) {
    return d.getUTCDate() != 1;
  } ], [ "%B", function(d) {
    return d.getUTCMonth();
  } ], [ "%Y", d3_true ] ]);
  d3_time_scaleUtcMethods.year = d3_time.year.utc;
  d3_time.scale.utc = function() {
    return d3_time_scale(d3.scale.linear(), d3_time_scaleUtcMethods, d3_time_scaleUtcFormat);
  };
  d3.text = d3_xhrType(function(request) {
    return request.responseText;
  });
  d3.json = function(url, callback) {
    return d3_xhr(url, "application/json", d3_json, callback);
  };
  function d3_json(request) {
    return JSON.parse(request.responseText);
  }
  d3.html = function(url, callback) {
    return d3_xhr(url, "text/html", d3_html, callback);
  };
  function d3_html(request) {
    var range = d3_document.createRange();
    range.selectNode(d3_document.body);
    return range.createContextualFragment(request.responseText);
  }
  d3.xml = d3_xhrType(function(request) {
    return request.responseXML;
  });
  if (typeof define === "function" && define.amd) this.d3 = d3, define(d3); else if (typeof module === "object" && module.exports) module.exports = d3; else this.d3 = d3;
}();
},{}],47:[function(require,module,exports){
var Utils = {};


/*
Remove an element and provide a function that inserts it into its original position
https://developers.google.com/speed/articles/javascript-dom
@param element {Element} The element to be temporarily removed
@return {Function} A function that inserts the element into its original position
 */

Utils.removeToInsertLater = function(element) {
  var nextSibling, parentNode;
  parentNode = element.parentNode;
  nextSibling = element.nextSibling;
  parentNode.removeChild(element);
  return function() {
    if (nextSibling) {
      parentNode.insertBefore(element, nextSibling);
    } else {
      parentNode.appendChild(element);
    }
  };
};


/*
fastest possible way to destroy all sub nodes (aka childs)
http://jsperf.com/innerhtml-vs-removechild/15
@param element {Element} The element for which all childs should be removed
 */

Utils.removeAllChilds = function(element) {
  var count;
  count = 0;
  while (element.firstChild) {
    count++;
    element.removeChild(element.firstChild);
  }
};

module.exports = Utils;

},{}],48:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":50}],49:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],50:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],51:[function(require,module,exports){
/*!
 * jBone v1.2.0 - 2016-04-13 - Library for DOM manipulation
 *
 * http://jbone.js.org
 *
 * Copyright 2016 Alexey Kupriyanenko
 * Released under the MIT license.
 */

(function (win) {

var
// cache previous versions
_$ = win.$,
_jBone = win.jBone,

// Quick match a standalone tag
rquickSingleTag = /^<(\w+)\s*\/?>$/,

// A simple way to check for HTML strings
// Prioritize #id over <tag> to avoid XSS via location.hash
rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

// Alias for function
slice = [].slice,
splice = [].splice,
keys = Object.keys,

// Alias for global variables
doc = document,

isString = function(el) {
    return typeof el === "string";
},
isObject = function(el) {
    return el instanceof Object;
},
isFunction = function(el) {
    return ({}).toString.call(el) === "[object Function]";
},
isArray = function(el) {
    return Array.isArray(el);
},
jBone = function(element, data) {
    return new fn.init(element, data);
},
fn;

// set previous values and return the instance upon calling the no-conflict mode
jBone.noConflict = function() {
    win.$ = _$;
    win.jBone = _jBone;

    return jBone;
};

fn = jBone.fn = jBone.prototype = {
    init: function(element, data) {
        var elements, tag, wraper, fragment;

        if (!element) {
            return this;
        }
        if (isString(element)) {
            // Create single DOM element
            if (tag = rquickSingleTag.exec(element)) {
                this[0] = doc.createElement(tag[1]);
                this.length = 1;

                if (isObject(data)) {
                    this.attr(data);
                }

                return this;
            }
            // Create DOM collection
            if ((tag = rquickExpr.exec(element)) && tag[1]) {
                fragment = doc.createDocumentFragment();
                wraper = doc.createElement("div");
                wraper.innerHTML = element;
                while (wraper.lastChild) {
                    fragment.appendChild(wraper.firstChild);
                }
                elements = slice.call(fragment.childNodes);

                return jBone.merge(this, elements);
            }
            // Find DOM elements with querySelectorAll
            if (jBone.isElement(data)) {
                return jBone(data).find(element);
            }

            try {
                elements = doc.querySelectorAll(element);

                return jBone.merge(this, elements);
            } catch (e) {
                return this;
            }
        }
        // Wrap DOMElement
        if (element.nodeType) {
            this[0] = element;
            this.length = 1;

            return this;
        }
        // Run function
        if (isFunction(element)) {
            return element();
        }
        // Return jBone element as is
        if (element instanceof jBone) {
            return element;
        }

        // Return element wrapped by jBone
        return jBone.makeArray(element, this);
    },

    pop: [].pop,
    push: [].push,
    reverse: [].reverse,
    shift: [].shift,
    sort: [].sort,
    splice: [].splice,
    slice: [].slice,
    indexOf: [].indexOf,
    forEach: [].forEach,
    unshift: [].unshift,
    concat: [].concat,
    join: [].join,
    every: [].every,
    some: [].some,
    filter: [].filter,
    map: [].map,
    reduce: [].reduce,
    reduceRight: [].reduceRight,
    length: 0
};

fn.constructor = jBone;

fn.init.prototype = fn;

jBone.setId = function(el) {
    var jid = el.jid;

    if (el === win) {
        jid = "window";
    } else if (el.jid === undefined) {
        el.jid = jid = ++jBone._cache.jid;
    }

    if (!jBone._cache.events[jid]) {
        jBone._cache.events[jid] = {};
    }
};

jBone.getData = function(el) {
    el = el instanceof jBone ? el[0] : el;

    var jid = el === win ? "window" : el.jid;

    return {
        jid: jid,
        events: jBone._cache.events[jid]
    };
};

jBone.isElement = function(el) {
    return el && el instanceof jBone || el instanceof HTMLElement || isString(el);
};

jBone._cache = {
    events: {},
    jid: 0
};

function isArraylike(obj) {
    var length = obj.length,
        type = typeof obj;

    if (isFunction(type) || obj === win) {
        return false;
    }

    if (obj.nodeType === 1 && length) {
        return true;
    }

    return isArray(type) || length === 0 ||
        typeof length === "number" && length > 0 && (length - 1) in obj;
}

fn.pushStack = function(elems) {
    var ret = jBone.merge(this.constructor(), elems);

    return ret;
};

jBone.merge = function(first, second) {
    var l = second.length,
        i = first.length,
        j = 0;

    while (j < l) {
        first[i++] = second[j++];
    }

    first.length = i;

    return first;
};

jBone.contains = function(container, contained) {
    return container.contains(contained);
};

jBone.extend = function(target) {
    var tg;

    splice.call(arguments, 1).forEach(function(source) {
        tg = target; //caching target for perf improvement

        if (source) {
            for (var prop in source) {
                tg[prop] = source[prop];
            }
        }
    });

    return target;
};

jBone.makeArray = function(arr, results) {
    var ret = results || [];

    if (arr !== null) {
        if (isArraylike(arr)) {
            jBone.merge(ret, isString(arr) ? [arr] : arr);
        } else {
            ret.push(arr);
        }
    }

    return ret;
};

jBone.unique = function(array) {
    if (array == null) {
        return [];
    }

    var result = [];

    for (var i = 0, length = array.length; i < length; i++) {
        var value = array[i];
        if (result.indexOf(value) < 0) {
            result.push(value);
        }
    }
    return result;
};

function BoneEvent(e, data) {
    var key, setter;

    this.originalEvent = e;

    setter = function(key, e) {
        if (key === "preventDefault") {
            this[key] = function() {
                this.defaultPrevented = true;
                return e[key]();
            };
        } else if (key === "stopImmediatePropagation") {
            this[key] = function() {
                this.immediatePropagationStopped = true;
                return e[key]();
            };
        } else if (isFunction(e[key])) {
            this[key] = function() {
                return e[key]();
            };
        } else {
            this[key] = e[key];
        }
    };

    for (key in e) {
        if (e[key] || typeof e[key] === "function") {
            setter.call(this, key, e);
        }
    }

    jBone.extend(this, data, {
        isImmediatePropagationStopped: function() {
            return !!this.immediatePropagationStopped;
        }
    });
}

jBone.Event = function(event, data) {
    var namespace, eventType;

    if (event.type && !data) {
        data = event;
        event = event.type;
    }

    namespace = event.split(".").splice(1).join(".");
    eventType = event.split(".")[0];

    event = doc.createEvent("Event");
    event.initEvent(eventType, true, true);

    return jBone.extend(event, {
        namespace: namespace,
        isDefaultPrevented: function() {
            return event.defaultPrevented;
        }
    }, data);
};

jBone.event = {

    /**
     * Attach a handler to an event for the elements
     * @param {Node}        el         - Events will be attached to this DOM Node
     * @param {String}      types      - One or more space-separated event types and optional namespaces
     * @param {Function}    handler    - A function to execute when the event is triggered
     * @param {Object}      [data]     - Data to be passed to the handler in event.data
     * @param {String}      [selector] - A selector string to filter the descendants of the selected elements
     */
    add: function(el, types, handler, data, selector) {
        jBone.setId(el);

        var eventHandler = function(e) {
                jBone.event.dispatch.call(el, e);
            },
            events = jBone.getData(el).events,
            eventType, t, event;

        types = types.split(" ");
        t = types.length;
        while (t--) {
            event = types[t];

            eventType = event.split(".")[0];
            events[eventType] = events[eventType] || [];

            if (events[eventType].length) {
                // override with previous event handler
                eventHandler = events[eventType][0].fn;
            } else {
                el.addEventListener && el.addEventListener(eventType, eventHandler, false);
            }

            events[eventType].push({
                namespace: event.split(".").splice(1).join("."),
                fn: eventHandler,
                selector: selector,
                data: data,
                originfn: handler
            });
        }
    },

    /**
     * Remove an event handler
     * @param  {Node}       el        - Events will be deattached from this DOM Node
     * @param  {String}     types     - One or more space-separated event types and optional namespaces
     * @param  {Function}   handler   - A handler function previously attached for the event(s)
     * @param  {String}     [selector] - A selector string to filter the descendants of the selected elements
     */
    remove: function(el, types, handler, selector) {
        var removeListener = function(events, eventType, index, el, e) {
                var callback;

                // get callback
                if ((handler && e.originfn === handler) || !handler) {
                    callback = e.fn;
                }

                if (events[eventType][index].fn === callback) {
                    // remove handler from cache
                    events[eventType].splice(index, 1);

                    if (!events[eventType].length) {
                        el.removeEventListener(eventType, callback);
                    }
                }
            },
            events = jBone.getData(el).events,
            l,
            eventsByType;

        if (!events) {
            return;
        }

        // remove all events
        if (!types && events) {
            return keys(events).forEach(function(eventType) {
                eventsByType = events[eventType];
                l = eventsByType.length;

                while(l--) {
                    removeListener(events, eventType, l, el, eventsByType[l]);
                }
            });
        }

        types.split(" ").forEach(function(eventName) {
            var eventType = eventName.split(".")[0],
                namespace = eventName.split(".").splice(1).join("."),
                e;

            // remove named events
            if (events[eventType]) {
                eventsByType = events[eventType];
                l = eventsByType.length;

                while(l--) {
                    e = eventsByType[l];
                    if ((!namespace || (namespace && e.namespace === namespace)) &&
                        (!selector  || (selector  && e.selector === selector))) {
                        removeListener(events, eventType, l, el, e);
                    }
                }
            }
            // remove all namespaced events
            else if (namespace) {
                keys(events).forEach(function(eventType) {
                    eventsByType = events[eventType];
                    l = eventsByType.length;

                    while(l--) {
                        e = eventsByType[l];
                        if (e.namespace.split(".")[0] === namespace.split(".")[0]) {
                            removeListener(events, eventType, l, el, e);
                        }
                    }
                });
            }
        });
    },

    /**
     * Execute all handlers and behaviors attached to the matched elements for the given event type.
     * @param  {Node}       el       - Events will be triggered for thie DOM Node
     * @param  {String}     event    - One or more space-separated event types and optional namespaces
     */
    trigger: function(el, event) {
        var events = [];

        if (isString(event)) {
            events = event.split(" ").map(function(event) {
                return jBone.Event(event);
            });
        } else {
            event = event instanceof Event ? event : jBone.Event(event);
            events = [event];
        }

        events.forEach(function(event) {
            if (!event.type) {
                return;
            }

            el.dispatchEvent && el.dispatchEvent(event);
        });
    },

    dispatch: function(e) {
        var i = 0,
            j = 0,
            el = this,
            handlers = jBone.getData(el).events[e.type],
            length = handlers.length,
            handlerQueue = [],
            targets = [],
            l,
            expectedTarget,
            handler,
            event,
            eventOptions;

        // cache all events handlers, fix issue with multiple handlers (issue #45)
        for (; i < length; i++) {
            handlerQueue.push(handlers[i]);
        }

        i = 0;
        length = handlerQueue.length;

        for (;
            // if event exists
            i < length &&
            // if handler is not removed from stack
            ~handlers.indexOf(handlerQueue[i]) &&
            // if propagation is not stopped
            !(event && event.isImmediatePropagationStopped());
        i++) {
            expectedTarget = null;
            eventOptions = {};
            handler = handlerQueue[i];
            handler.data && (eventOptions.data = handler.data);

            // event handler without selector
            if (!handler.selector) {
                event = new BoneEvent(e, eventOptions);

                if (!(e.namespace && e.namespace !== handler.namespace)) {
                    handler.originfn.call(el, event);
                }
            }
            // event handler with selector
            else if (
                // if target and selected element the same
                ~(targets = jBone(el).find(handler.selector)).indexOf(e.target) && (expectedTarget = e.target) ||
                // if one of element matched with selector contains target
                (el !== e.target && el.contains(e.target))
            ) {
                // get element matched with selector
                if (!expectedTarget) {
                    l = targets.length;
                    j = 0;

                    for (; j < l; j++) {
                        if (targets[j] && targets[j].contains(e.target)) {
                            expectedTarget = targets[j];
                        }
                    }
                }

                if (!expectedTarget) {
                    continue;
                }

                eventOptions.currentTarget = expectedTarget;
                event = new BoneEvent(e, eventOptions);

                if (!(e.namespace && e.namespace !== handler.namespace)) {
                    handler.originfn.call(expectedTarget, event);
                }
            }
        }
    }
};

fn.on = function(types, selector, data, fn) {
    var length = this.length,
        i = 0;

    if (data == null && fn == null) {
        // (types, fn)
        fn = selector;
        data = selector = undefined;
    } else if (fn == null) {
        if (typeof selector === "string") {
            // (types, selector, fn)
            fn = data;
            data = undefined;
        } else {
            // (types, data, fn)
            fn = data;
            data = selector;
            selector = undefined;
        }
    }

    if (!fn) {
        return this;
    }

    for (; i < length; i++) {
        jBone.event.add(this[i], types, fn, data, selector);
    }

    return this;
};

fn.one = function(event) {
    var args = arguments,
        i = 0,
        length = this.length,
        oneArgs = slice.call(args, 1, args.length - 1),
        callback = slice.call(args, -1)[0],
        addListener;

    addListener = function(el) {
        var $el = jBone(el);

        event.split(" ").forEach(function(event) {
            var fn = function(e) {
                $el.off(event, fn);
                callback.call(el, e);
            };

            $el.on.apply($el, [event].concat(oneArgs, fn));
        });
    };

    for (; i < length; i++) {
        addListener(this[i]);
    }

    return this;
};

fn.trigger = function(event) {
    var i = 0,
        length = this.length;

    if (!event) {
        return this;
    }

    for (; i < length; i++) {
        jBone.event.trigger(this[i], event);
    }

    return this;
};

fn.off = function(types, selector, handler) {
    var i = 0,
        length = this.length;

    if (isFunction(selector)) {
        handler = selector;
        selector = undefined;
    }

    for (; i < length; i++) {
        jBone.event.remove(this[i], types, handler, selector);
    }

    return this;
};

fn.find = function(selector) {
    var results = [],
        i = 0,
        length = this.length,
        finder = function(el) {
            if (isFunction(el.querySelectorAll)) {
                [].forEach.call(el.querySelectorAll(selector), function(found) {
                    results.push(found);
                });
            }
        };

    for (; i < length; i++) {
        finder(this[i]);
    }

    return jBone(results);
};

fn.get = function(index) {
    return index != null ?

        // Return just one element from the set
        (index < 0 ? this[index + this.length] : this[index]) :

        // Return all the elements in a clean array
        slice.call(this);
};

fn.eq = function(index) {
    return jBone(this[index]);
};

fn.parent = function() {
    var results = [],
        parent,
        i = 0,
        length = this.length;

    for (; i < length; i++) {
        if (!~results.indexOf(parent = this[i].parentElement) && parent) {
            results.push(parent);
        }
    }

    return jBone(results);
};

fn.toArray = function() {
    return slice.call(this);
};

fn.is = function() {
    var args = arguments;

    return this.some(function(el) {
        return el.tagName.toLowerCase() === args[0];
    });
};

fn.has = function() {
    var args = arguments;

    return this.some(function(el) {
        return el.querySelectorAll(args[0]).length;
    });
};

fn.add = function(selector, context) {
    return this.pushStack(
        jBone.unique(
            jBone.merge(this.get(), jBone(selector, context))
        )
    );
};

fn.attr = function(key, value) {
    var args = arguments,
        i = 0,
        length = this.length,
        setter;

    if (isString(key) && args.length === 1) {
        return this[0] && this[0].getAttribute(key);
    }

    if (args.length === 2) {
        setter = function(el) {
            el.setAttribute(key, value);
        };
    } else if (isObject(key)) {
        setter = function(el) {
            keys(key).forEach(function(name) {
                el.setAttribute(name, key[name]);
            });
        };
    }

    for (; i < length; i++) {
        setter(this[i]);
    }

    return this;
};

fn.removeAttr = function(key) {
    var i = 0,
        length = this.length;

    for (; i < length; i++) {
        this[i].removeAttribute(key);
    }

    return this;
};

fn.val = function(value) {
    var i = 0,
        length = this.length;

    if (arguments.length === 0) {
        return this[0] && this[0].value;
    }

    for (; i < length; i++) {
        this[i].value = value;
    }

    return this;
};

fn.css = function(key, value) {
    var args = arguments,
        i = 0,
        length = this.length,
        setter;

    // Get attribute
    if (isString(key) && args.length === 1) {
        return this[0] && win.getComputedStyle(this[0])[key];
    }

    // Set attributes
    if (args.length === 2) {
        setter = function(el) {
            el.style[key] = value;
        };
    } else if (isObject(key)) {
        setter = function(el) {
            keys(key).forEach(function(name) {
                el.style[name] = key[name];
            });
        };
    }

    for (; i < length; i++) {
        setter(this[i]);
    }

    return this;
};

fn.data = function(key, value) {
    var args = arguments, data = {},
        i = 0,
        length = this.length,
        setter,
        setValue = function(el, key, value) {
            if (isObject(value)) {
                el.jdata = el.jdata || {};
                el.jdata[key] = value;
            } else {
                el.dataset[key] = value;
            }
        },
        getValue = function(value) {
            if (value === "true") {
                return true;
            } else if (value === "false") {
                return false;
            } else {
                return value;
            }
        };

    // Get all data
    if (args.length === 0) {
        this[0].jdata && (data = this[0].jdata);

        keys(this[0].dataset).forEach(function(key) {
            data[key] = getValue(this[0].dataset[key]);
        }, this);

        return data;
    }
    // Get data by name
    if (args.length === 1 && isString(key)) {
        return this[0] && getValue(this[0].dataset[key] || this[0].jdata && this[0].jdata[key]);
    }

    // Set data
    if (args.length === 1 && isObject(key)) {
        setter = function(el) {
            keys(key).forEach(function(name) {
                setValue(el, name, key[name]);
            });
        };
    } else if (args.length === 2) {
        setter = function(el) {
            setValue(el, key, value);
        };
    }

    for (; i < length; i++) {
        setter(this[i]);
    }

    return this;
};

fn.removeData = function(key) {
    var i = 0,
        length = this.length,
        jdata, dataset;

    for (; i < length; i++) {
        jdata = this[i].jdata;
        dataset = this[i].dataset;

        if (key) {
            jdata && jdata[key] && delete jdata[key];
            delete dataset[key];
        } else {
            for (key in jdata) {
                delete jdata[key];
            }

            for (key in dataset) {
                delete dataset[key];
            }
        }
    }

    return this;
};

fn.addClass = function(className) {
    var i = 0,
        j = 0,
        length = this.length,
        classes = className ? className.trim().split(/\s+/) : [];

    for (; i < length; i++) {
        j = 0;

        for (j = 0; j < classes.length; j++) {
            this[i].classList.add(classes[j]);
        }
    }

    return this;
};

fn.removeClass = function(className) {
    var i = 0,
        j = 0,
        length = this.length,
        classes = className ? className.trim().split(/\s+/) : [];

    for (; i < length; i++) {
        j = 0;

        for (j = 0; j < classes.length; j++) {
            this[i].classList.remove(classes[j]);
        }
    }

    return this;
};

fn.toggleClass = function(className, force) {
    var i = 0,
        length = this.length,
        method = "toggle";

    force === true && (method = "add") || force === false && (method = "remove");

    if (className) {
        for (; i < length; i++) {
            this[i].classList[method](className);
        }
    }

    return this;
};

fn.hasClass = function(className) {
    var i = 0, length = this.length;

    if (className) {
        for (; i < length; i++) {
            if (this[i].classList.contains(className)) {
                return true;
            }
        }
    }

    return false;
};

fn.html = function(value) {
    var args = arguments,
        el;

    // add HTML into elements
    if (args.length === 1 && value !== undefined) {
        return this.empty().append(value);
    }
    // get HTML from element
    else if (args.length === 0 && (el = this[0])) {
        return el.innerHTML;
    }

    return this;
};

fn.append = function(appended) {
    var i = 0,
        length = this.length,
        setter;

    // create jBone object and then append
    if (isString(appended) && rquickExpr.exec(appended)) {
        appended = jBone(appended);
    }
    // create text node for insertion
    else if (!isObject(appended)) {
        appended = document.createTextNode(appended);
    }

    appended = appended instanceof jBone ? appended : jBone(appended);

    setter = function(el, i) {
        appended.forEach(function(node) {
            if (i) {
                el.appendChild(node.cloneNode(true));
            } else {
                el.appendChild(node);
            }
        });
    };

    for (; i < length; i++) {
        setter(this[i], i);
    }

    return this;
};

fn.appendTo = function(to) {
    jBone(to).append(this);

    return this;
};

fn.empty = function() {
    var i = 0,
        length = this.length,
        el;

    for (; i < length; i++) {
        el = this[i];

        while (el.lastChild) {
            el.removeChild(el.lastChild);
        }
    }

    return this;
};

fn.remove = function() {
    var i = 0,
        length = this.length,
        el;

    // remove all listeners
    this.off();

    for (; i < length; i++) {
        el = this[i];

        // remove data and nodes
        delete el.jdata;
        el.parentNode && el.parentNode.removeChild(el);
    }

    return this;
};

if (typeof module === "object" && module && typeof module.exports === "object") {
    // Expose jBone as module.exports in loaders that implement the Node
    // module pattern (including browserify). Do not create the global, since
    // the user will be storing it themselves locally, and globals are frowned
    // upon in the Node module world.
    module.exports = jBone;
}
// Register as a AMD module
else if (typeof define === "function" && define.amd) {
    define(function() {
        return jBone;
    });

    win.jBone = win.$ = jBone;
} else if (typeof win === "object" && typeof win.document === "object") {
    win.jBone = win.$ = jBone;
}

}(window));

},{}],52:[function(require,module,exports){
(function (process){

/**
 * An object representing a "promise" for a future value
 *
 * @param {?function(T, ?)=} onSuccess a function to handle successful
 *     resolution of this promise
 * @param {?function(!Error, ?)=} onFail a function to handle failed
 *     resolution of this promise
 * @constructor
 * @template T
 */
function Promise(onSuccess, onFail) {
  this.promise = this
  this._isPromise = true
  this._successFn = onSuccess
  this._failFn = onFail
  this._scope = this
  this._boundArgs = null
  this._hasContext = false
  this._nextContext = undefined
  this._currentContext = undefined
}

/**
 * @param {function()} callback
 */
function nextTick (callback) {
  callback()
}

if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
  nextTick = process.nextTick
}

/**
 * All callback execution should go through this function.  While the
 * implementation below is simple, it can be replaced with more sophisticated
 * implementations that enforce QoS on the event loop.
 *
 * @param {Promise} defer
 * @param {Function} callback
 * @param {Object|undefined} scope
 * @param {Array} args
 */
function nextTickCallback (defer, callback, scope, args) {
  try {
    defer.resolve(callback.apply(scope, args))
  } catch (thrown) {
    defer.reject(thrown)
  }
}

/**
 * Used for accessing the nextTick function from outside the kew module.
 *
 * @return {Function}
 */
function getNextTickFunction () {
  return nextTick
}

/**
 * Used for overriding the nextTick function from outside the kew module so that
 * the user can plug and play lower level schedulers
 * @param {!Function} fn
 */
function setNextTickFunction (fn) {
  nextTick = fn
}

/**
 * Keep track of the number of promises that are rejected along side
 * the number of rejected promises we call _failFn on so we can look
 * for leaked rejections.
 * @constructor
 */
function PromiseStats() {
  /** @type {number} */
  this.errorsEmitted = 0

  /** @type {number} */
  this.errorsHandled = 0
}

var stats = new PromiseStats()

Promise.prototype._handleError = function () {
  if (!this._errorHandled) {
    stats.errorsHandled++
    this._errorHandled = true
  }
}

/**
 * Specify that the current promise should have a specified context
 * @param  {*} context context
 * @private
 */
Promise.prototype._useContext = function (context) {
  this._nextContext = this._currentContext = context
  this._hasContext = true
  return this
}

Promise.prototype.clearContext = function () {
  this._hasContext = false
  this._nextContext = undefined
  return this
}

/**
 * Set the context for all promise handlers to follow
 *
 * NOTE(dpup): This should be considered deprecated.  It does not do what most
 * people would expect.  The context will be passed as a second argument to all
 * subsequent callbacks.
 *
 * @param {*} context An arbitrary context
 */
Promise.prototype.setContext = function (context) {
  this._nextContext = context
  this._hasContext = true
  return this
}

/**
 * Get the context for a promise
 * @return {*} the context set by setContext
 */
Promise.prototype.getContext = function () {
  return this._nextContext
}

/**
 * Resolve this promise with a specified value
 *
 * @param {*=} data
 */
Promise.prototype.resolve = function (data) {
  if (this._error || this._hasData) throw new Error("Unable to resolve or reject the same promise twice")

  var i
  if (data && isPromise(data)) {
    this._child = data
    if (this._promises) {
      for (i = 0; i < this._promises.length; i += 1) {
        data._chainPromise(this._promises[i])
      }
      delete this._promises
    }

    if (this._onComplete) {
      for (i = 0; i < this._onComplete.length; i+= 1) {
        data.fin(this._onComplete[i])
      }
      delete this._onComplete
    }
  } else if (data && isPromiseLike(data)) {
    data.then(
      function(data) { this.resolve(data) }.bind(this),
      function(err) { this.reject(err) }.bind(this)
    )
  } else {
    this._hasData = true
    this._data = data

    if (this._onComplete) {
      for (i = 0; i < this._onComplete.length; i++) {
        this._onComplete[i]()
      }
    }

    if (this._promises) {
      for (i = 0; i < this._promises.length; i += 1) {
        this._promises[i]._useContext(this._nextContext)
        this._promises[i]._withInput(data)
      }
      delete this._promises
    }
  }
}

/**
 * Reject this promise with an error
 *
 * @param {!Error} e
 */
Promise.prototype.reject = function (e) {
  if (this._error || this._hasData) throw new Error("Unable to resolve or reject the same promise twice")

  var i
  this._error = e
  stats.errorsEmitted++

  if (this._ended) {
    this._handleError()
    process.nextTick(function onPromiseThrow() {
      throw e
    })
  }

  if (this._onComplete) {
    for (i = 0; i < this._onComplete.length; i++) {
      this._onComplete[i]()
    }
  }

  if (this._promises) {
    this._handleError()
    for (i = 0; i < this._promises.length; i += 1) {
      this._promises[i]._useContext(this._nextContext)
      this._promises[i]._withError(e)
    }
    delete this._promises
  }
}

/**
 * Provide a callback to be called whenever this promise successfully
 * resolves. Allows for an optional second callback to handle the failure
 * case.
 *
 * @param {?function(this:void, T, ?): RESULT|undefined} onSuccess
 * @param {?function(this:void, !Error, ?): RESULT=} onFail
 * @return {!Promise.<RESULT>} returns a new promise with the output of the onSuccess or
 *     onFail handler
 * @template RESULT
 */
Promise.prototype.then = function (onSuccess, onFail) {
  var promise = new Promise(onSuccess, onFail)
  if (this._nextContext) promise._useContext(this._nextContext)

  if (this._child) this._child._chainPromise(promise)
  else this._chainPromise(promise)

  return promise
}

/**
 * Provide a callback to be called whenever this promise successfully
 * resolves. The callback will be executed in the context of the provided scope.
 *
 * @param {function(this:SCOPE, ...): RESULT} onSuccess
 * @param {SCOPE} scope Object whose context callback will be executed in.
 * @param {...*} var_args Additional arguments to be passed to the promise callback.
 * @return {!Promise.<RESULT>} returns a new promise with the output of the onSuccess
 * @template SCOPE, RESULT
 */
Promise.prototype.thenBound = function (onSuccess, scope, var_args) {
  var promise = new Promise(onSuccess)
  if (this._nextContext) promise._useContext(this._nextContext)

  promise._scope = scope
  if (arguments.length > 2) {
    promise._boundArgs = Array.prototype.slice.call(arguments, 2)
  }

  // Chaining must happen after setting args and scope since it may fire callback.
  if (this._child) this._child._chainPromise(promise)
  else this._chainPromise(promise)

  return promise
}

/**
 * Provide a callback to be called whenever this promise is rejected
 *
 * @param {function(this:void, !Error, ?)} onFail
 * @return {!Promise.<T>} returns a new promise with the output of the onFail handler
 */
Promise.prototype.fail = function (onFail) {
  return this.then(null, onFail)
}

/**
 * Provide a callback to be called whenever this promise is rejected.
 * The callback will be executed in the context of the provided scope.
 *
 * @param {function(this:SCOPE, ...)} onFail
 * @param {SCOPE} scope Object whose context callback will be executed in.
 * @param {...?} var_args
 * @return {!Promise.<T>} returns a new promise with the output of the onSuccess
 * @template SCOPE
 */
Promise.prototype.failBound = function (onFail, scope, var_args) {
  var promise = new Promise(null, onFail)
  if (this._nextContext) promise._useContext(this._nextContext)

  promise._scope = scope
  if (arguments.length > 2) {
    promise._boundArgs = Array.prototype.slice.call(arguments, 2)
  }

  // Chaining must happen after setting args and scope since it may fire callback.
  if (this._child) this._child._chainPromise(promise)
  else this._chainPromise(promise)

  return promise
}

/**
 * Spread a promises outputs to the functions arguments.
 * @param {?function(this:void, ...): RESULT|undefined} onSuccess
 * @return {!Promise.<RESULT>} returns a new promise with the output of the onSuccess or
 *     onFail handler
 * @template RESULT
 */
Promise.prototype.spread = function (onSuccess) {
  return this.then(allInternal)
  .then(function (array) {
    return onSuccess.apply(null, array)
  })
}

/**
 * Spread a promises outputs to the functions arguments.
 * @param {function(this:SCOPE, ...): RESULT} onSuccess
 * @param {SCOPE} scope Object whose context callback will be executed in.
 * @param {...*} var_args Additional arguments to be passed to the promise callback.
 * @return {!Promise.<RESULT>} returns a new promise with the output of the onSuccess
 * @template SCOPE, RESULT
 */
Promise.prototype.spreadBound = function (onSuccess, scope, var_args) {
  var args = Array.prototype.slice.call(arguments, 2)
  return this.then(allInternal)
  .then(function (array) {
    return onSuccess.apply(scope, args.concat(array))
  })
}

/**
 * Provide a callback to be called whenever this promise is either resolved
 * or rejected.
 *
 * @param {function()} onComplete
 * @return {!Promise.<T>} returns the current promise
 */
Promise.prototype.fin = function (onComplete) {
  if (this._hasData || this._error) {
    onComplete()
    return this
  }

  if (this._child) {
    this._child.fin(onComplete)
  } else {
    if (!this._onComplete) this._onComplete = [onComplete]
    else this._onComplete.push(onComplete)
  }

  return this
}

/**
 * Mark this promise as "ended". If the promise is rejected, this will throw an
 * error in whatever scope it happens to be in
 *
 * @return {!Promise.<T>} returns the current promise
 * @deprecated Prefer done(), because it's consistent with Q.
 */
Promise.prototype.end = function () {
  this._end()
  return this
}


/**
 * Mark this promise as "ended".
 * @private
 */
Promise.prototype._end = function () {
  if (this._error) {
    this._handleError()
    throw this._error
  }
  this._ended = true
  return this
}

/**
 * Close the promise. Any errors after this completes will be thrown to the global handler.
 *
 * @param {?function(this:void, T, ?)=} onSuccess a function to handle successful
 *     resolution of this promise
 * @param {?function(this:void, !Error, ?)=} onFailure a function to handle failed
 *     resolution of this promise
 * @return {void}
 */
Promise.prototype.done = function (onSuccess, onFailure) {
  var self = this
  if (onSuccess || onFailure) {
    self = self.then(onSuccess, onFailure)
  }
  self._end()
}

/**
 * Return a new promise that behaves the same as the current promise except
 * that it will be rejected if the current promise does not get fulfilled
 * after a certain amount of time.
 *
 * @param {number} timeoutMs The timeout threshold in msec
 * @param {string=} timeoutMsg error message
 * @return {!Promise.<T>} a new promise with timeout
 */
 Promise.prototype.timeout = function (timeoutMs, timeoutMsg) {
  var deferred = new Promise()
  var isTimeout = false

  var timeout = setTimeout(function() {
    deferred.reject(new Error(timeoutMsg || 'Promise timeout after ' + timeoutMs + ' ms.'))
    isTimeout = true
  }, timeoutMs)

  this.then(function (data) {
    if (!isTimeout) {
      clearTimeout(timeout)
      deferred.resolve(data)
    }
  },
  function (err) {
    if (!isTimeout) {
      clearTimeout(timeout)
      deferred.reject(err)
    }
  })

  return deferred.promise
}

/**
 * Attempt to resolve this promise with the specified input
 *
 * @param {*} data the input
 */
Promise.prototype._withInput = function (data) {
  if (this._successFn) {
    this._nextTick(this._successFn, [data, this._currentContext])
  } else {
    this.resolve(data)
  }

  // context is no longer needed
  delete this._currentContext
}

/**
 * Attempt to reject this promise with the specified error
 *
 * @param {!Error} e
 * @private
 */
Promise.prototype._withError = function (e) {
  if (this._failFn) {
    this._nextTick(this._failFn, [e, this._currentContext])
  } else {
    this.reject(e)
  }

  // context is no longer needed
  delete this._currentContext
}

/**
 * Calls a function in the correct scope, and includes bound arguments.
 * @param {Function} fn
 * @param {Array} args
 * @private
 */
Promise.prototype._nextTick = function (fn, args) {
  if (this._boundArgs) {
    args = this._boundArgs.concat(args)
  }
  nextTick(nextTickCallback.bind(null, this, fn, this._scope, args))
}

/**
 * Chain a promise to the current promise
 *
 * @param {!Promise} promise the promise to chain
 * @private
 */
Promise.prototype._chainPromise = function (promise) {
  var i
  if (this._hasContext) promise._useContext(this._nextContext)

  if (this._child) {
    this._child._chainPromise(promise)
  } else if (this._hasData) {
    promise._withInput(this._data)
  } else if (this._error) {
    // We can't rely on _withError() because it's called on the chained promises
    // and we need to use the source's _errorHandled state
    this._handleError()
    promise._withError(this._error)
  } else if (!this._promises) {
    this._promises = [promise]
  } else {
    this._promises.push(promise)
  }
}

/**
 * Utility function used for creating a node-style resolver
 * for deferreds
 *
 * @param {!Promise} deferred a promise that looks like a deferred
 * @param {Error=} err an optional error
 * @param {*=} data optional data
 */
function resolver(deferred, err, data) {
  if (err) deferred.reject(err)
  else deferred.resolve(data)
}

/**
 * Creates a node-style resolver for a deferred by wrapping
 * resolver()
 *
 * @return {function(?Error, *)} node-style callback
 */
Promise.prototype.makeNodeResolver = function () {
  return resolver.bind(null, this)
}

/**
 * Return true iff the given object is a promise of this library.
 *
 * Because kew's API is slightly different than other promise libraries,
 * it's important that we have a test for its promise type. If you want
 * to test for a more general A+ promise, you should do a cap test for
 * the features you want.
 *
 * @param {*} obj The object to test
 * @return {boolean} Whether the object is a promise
 */
function isPromise(obj) {
  return !!obj._isPromise
}

/**
 * Return true iff the given object is a promise-like object, e.g. appears to
 * implement Promises/A+ specification
 *
 * @param {*} obj The object to test
 * @return {boolean} Whether the object is a promise-like object
 */
function isPromiseLike(obj) {
  return (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
}

/**
 * Static function which creates and resolves a promise immediately
 *
 * @param {T} data data to resolve the promise with
 * @return {!Promise.<T>}
 * @template T
 */
function resolve(data) {
  var promise = new Promise()
  promise.resolve(data)
  return promise
}

/**
 * Static function which creates and rejects a promise immediately
 *
 * @param {!Error} e error to reject the promise with
 * @return {!Promise}
 */
function reject(e) {
  var promise = new Promise()
  promise.reject(e)
  return promise
}

/**
 * Replace an element in an array with a new value. Used by .all() to
 * call from .then()
 *
 * @param {!Array} arr
 * @param {number} idx
 * @param {*} val
 * @return {*} the val that's being injected into the array
 */
function replaceEl(arr, idx, val) {
  arr[idx] = val
  return val
}

/**
 * Replace an element in an array as it is resolved with its value.
 * Used by .allSettled().
 *
 * @param {!Array} arr
 * @param {number} idx
 * @param {*} value The value from a resolved promise.
 * @return {*} the data that's being passed in
 */
function replaceElFulfilled(arr, idx, value) {
  arr[idx] = {
    state: 'fulfilled',
    value: value
  }
  return value
}

/**
 * Replace an element in an array as it is rejected with the reason.
 * Used by .allSettled().
 *
 * @param {!Array} arr
 * @param {number} idx
 * @param {*} reason The reason why the original promise is rejected
 * @return {*} the data that's being passed in
 */
function replaceElRejected(arr, idx, reason) {
  arr[idx] = {
    state: 'rejected',
    reason: reason
  }
  return reason
}

/**
 * Takes in an array of promises or literals and returns a promise which returns
 * an array of values when all have resolved. If any fail, the promise fails.
 *
 * @param {!Array.<!Promise>} promises
 * @return {!Promise.<!Array>}
 */
function all(promises) {
  if (arguments.length != 1 || !Array.isArray(promises)) {
    promises = Array.prototype.slice.call(arguments, 0)
  }
  return allInternal(promises)
}

/**
 * A version of all() that does not accept var_args
 *
 * @param {!Array.<!Promise>} promises
 * @return {!Promise.<!Array>}
 */
function allInternal(promises) {
  if (!promises.length) return resolve([])

  var outputs = []
  var finished = false
  var promise = new Promise()
  var counter = promises.length

  for (var i = 0; i < promises.length; i += 1) {
    if (!promises[i] || !isPromiseLike(promises[i])) {
      outputs[i] = promises[i]
      counter -= 1
    } else {
      promises[i].then(replaceEl.bind(null, outputs, i))
      .then(function decrementAllCounter() {
        counter--
        if (!finished && counter === 0) {
          finished = true
          promise.resolve(outputs)
        }
      }, function onAllError(e) {
        if (!finished) {
          finished = true
          promise.reject(e)
        }
      })
    }
  }

  if (counter === 0 && !finished) {
    finished = true
    promise.resolve(outputs)
  }

  return promise
}

/**
 * Takes in an array of promises or values and returns a promise that is
 * fulfilled with an array of state objects when all have resolved or
 * rejected. If a promise is resolved, its corresponding state object is
 * {state: 'fulfilled', value: Object}; whereas if a promise is rejected, its
 * corresponding state object is {state: 'rejected', reason: Object}.
 *
 * @param {!Array} promises or values
 * @return {!Promise.<!Array>} Promise fulfilled with state objects for each input
 */
function allSettled(promises) {
  if (!Array.isArray(promises)) {
    throw Error('The input to "allSettled()" should be an array of Promise or values')
  }
  if (!promises.length) return resolve([])

  var outputs = []
  var promise = new Promise()
  var counter = promises.length

  for (var i = 0; i < promises.length; i += 1) {
    if (!promises[i] || !isPromiseLike(promises[i])) {
      replaceElFulfilled(outputs, i, promises[i])
      if ((--counter) === 0) promise.resolve(outputs)
    } else {
      promises[i]
        .then(replaceElFulfilled.bind(null, outputs, i), replaceElRejected.bind(null, outputs, i))
        .then(function () {
          if ((--counter) === 0) promise.resolve(outputs)
        })
    }
  }

  return promise
}

/**
 * Takes an array of results and spreads them to the arguments of a function.
 * @param {!Array} array
 * @param {!Function} fn
 */
function spread(array, fn) {
  resolve(array).spread(fn)
}

/**
 * Create a new Promise which looks like a deferred
 *
 * @return {!Promise}
 */
function defer() {
  return new Promise()
}

/**
 * Return a promise which will wait a specified number of ms to resolve
 *
 * @param {*} delayMsOrVal A delay (in ms) if this takes one argument, or ther
 *     return value if it takes two.
 * @param {number=} opt_delayMs
 * @return {!Promise}
 */
function delay(delayMsOrVal, opt_delayMs) {
  var returnVal = undefined
  var delayMs = delayMsOrVal
  if (typeof opt_delayMs != 'undefined') {
    delayMs = opt_delayMs
    returnVal = delayMsOrVal
  }

  if (typeof delayMs != 'number') {
    throw new Error('Bad delay value ' + delayMs)
  }

  var defer = new Promise()
  setTimeout(function onDelay() {
    defer.resolve(returnVal)
  }, delayMs)
  return defer
}

/**
 * Returns a promise that has the same result as `this`, but fulfilled
 * after at least ms milliseconds
 * @param {number} ms
 */
Promise.prototype.delay = function (ms) {
  return this.then(function (val) {
    return delay(val, ms)
  })
}

/**
 * Return a promise which will evaluate the function fn in a future turn with
 * the provided args
 *
 * @param {function(...)} fn
 * @param {...*} var_args a variable number of arguments
 * @return {!Promise}
 */
function fcall(fn, var_args) {
  var rootArgs = Array.prototype.slice.call(arguments, 1)
  var defer = new Promise()
  nextTick(nextTickCallback.bind(null, defer, fn, undefined, rootArgs))
  return defer
}


/**
 * Returns a promise that will be invoked with the result of a node style
 * callback. All args to fn should be given except for the final callback arg
 *
 * @param {function(...)} fn
 * @param {...*} var_args a variable number of arguments
 * @return {!Promise}
 */
function nfcall(fn, var_args) {
  // Insert an undefined argument for scope and let bindPromise() do the work.
  var args = Array.prototype.slice.call(arguments, 0)
  args.splice(1, 0, undefined)
  return ncall.apply(undefined, args)
}


/**
 * Like `nfcall`, but permits passing a `this` context for the call.
 *
 * @param {function(...)} fn
 * @param {Object} scope
 * @param {...*} var_args
 * @return {!Promise}
 */
function ncall(fn, scope, var_args) {
  return bindPromise.apply(null, arguments)()
}


/**
 * Binds a function to a scope with an optional number of curried arguments. Attaches
 * a node style callback as the last argument and returns a promise
 *
 * @param {function(...)} fn
 * @param {Object} scope
 * @param {...*} var_args a variable number of arguments
 * @return {function(...)}: !Promise}
 */
function bindPromise(fn, scope, var_args) {
  var rootArgs = Array.prototype.slice.call(arguments, 2)
  return function onBoundPromise(var_args) {
    var defer = new Promise()
    try {
      fn.apply(scope, rootArgs.concat(Array.prototype.slice.call(arguments, 0), defer.makeNodeResolver()))
    } catch (e) {
      defer.reject(e)
    }
    return defer
  }
}

module.exports = {
  all: all,
  bindPromise: bindPromise,
  defer: defer,
  delay: delay,
  fcall: fcall,
  isPromise: isPromise,
  isPromiseLike: isPromiseLike,
  ncall: ncall,
  nfcall: nfcall,
  resolve: resolve,
  reject: reject,
  spread: spread,
  stats: stats,
  allSettled: allSettled,
  Promise: Promise,
  getNextTickFunction: getNextTickFunction,
  setNextTickFunction: setNextTickFunction,
}

}).call(this,require('_process'))

},{"_process":45}],53:[function(require,module,exports){
var koalajs = {};

// pass an alternative default value
koalajs.d = koalajs.defaultValue = function defaultValue(obj, defValue) {
  if (obj === undefined) {
    if (typeof obj === "function") {
      return defValue();
    }
    return defValue;
  }
  return obj;
};

// alias for getElementById
koalajs.id = function mk(el) {
  return document.getElementById(el);
};

// alias for createElement
koalajs.mk = function mk(el) {
  return document.createElement(el);
};

if (module !== undefined && module.exports !== undefined) {
  module.exports = koalajs;
}

},{}],54:[function(require,module,exports){
module.exports = require("./lib/menubuilder");

},{"./lib/menubuilder":55}],55:[function(require,module,exports){
var MenuBuilder, jbone, view;

jbone = require("jbone");
view = require("backbone-viewj");

module.exports = MenuBuilder = view.extend({
  initialize: function(opts) {
    this._nodes = [];
    this.name = opts.name || "";
    this.el.className += "smenubar";
  },
  render: function() {

    // remove all childs
    var fc = this.el.firstChild;
    while (fc) {
      this.el.removeChild(fc);
      fc = this.el.firstChild;
    }

    // replace child
    this.el.appendChild(this.buildDOM());
  },
  setName: function(name) {
    this.name = name;
  },
  addNode: function(label, callback, opts) {
    var style;
    if (opts != null) {
      style = opts.style;
    }
    if (this._nodes == null) {
      this._nodes = [];
    }
    this._nodes.push({
      label: label,
      callback: callback,
      style: style
    });
  },

  getNode: function(label) {
    var rNode = undefined;
    this._nodes.forEach(function(el) {
      if (el.label === label) {
        rNode = el;
      }
    });
    return rNode;
  },

  modifyNode: function(label, callback, opts) {
    var node = this.getNode(label);
    node.callback = callback || node.callback;
    opts = opts || {};
    node.style = opts.style || node.style;
  },

  renameNode: function(label, newLabel) {
    var node = this.getNode(label);
    node.label = newLabel || node.label;
  },

  removeNode: function(label) {
    var node = this.getNode(label);
    this._nodes.splice(this._nodes.indexOf(node), 1);
  },

  removeAllNodes: function() {
    this._nodes = [];
  },

  buildDOM: function() {
    var span = document.createElement("span");
    span.appendChild(this._buildM({
      nodes: this._nodes,
      name: this.name
    }));
    return span;
  },
  _buildM: function(data) {
    var displayedButton, frag, key, li, node, style, _ref;
    var nodes = data.nodes;
    var name = data.name;
    var menu = document.createElement("div");
    menu.className = "smenu-dropdown smenu-dropdown-tip";
    menu.style.display = "none";

    var menuUl = document.createElement("ul");
    menuUl.className = "smenu-dropdown-menu";

    // currently we support one-level
    for (var i = 0, _len = nodes.length; i < _len; i++) {
      node = nodes[i];
      li = document.createElement("li");
      li.textContent = node.label;
      _ref = node.style;
      for (key in _ref) {
        style = _ref[key];
        li.style[key] = style;
      }
      li.addEventListener("click", node.callback);
      this.trigger("new:node", li);
      menuUl.appendChild(li);
    }
    this.trigger("new:menu", menuUl);
    menu.appendChild(menuUl);

    displayedButton = document.createElement("a");
    displayedButton.textContent = name;
    displayedButton.className = "smenubar_alink";
    this.trigger("new:button", displayedButton);

    // HACK to be able to hide the submenu
    // listens globally for click events
    jbone(displayedButton).on("click", (function(_this) {
      return function(e) {
        _this._showMenu(e, menu, displayedButton);
        return window.setTimeout(function() {
          return jbone(document.body).one("click", function(e) {
            return menu.style.display = "none";
          });
        }, 5);
      };
    })(this));

    frag = document.createDocumentFragment();
    frag.appendChild(menu);
    frag.appendChild(displayedButton);
    return frag;
  },

  // internal method to display the lower menu on a click
  _showMenu: function(e, menu, target) {
    var rect;
    menu.style.display = "block";
    menu.style.position = "absolute";
    rect = target.getBoundingClientRect();
    menu.style.left = rect.left + "px";
    menu.style.top = (rect.top + target.offsetHeight) + "px";
  }
});

},{"backbone-viewj":15,"jbone":51}],56:[function(require,module,exports){
var Mouse;

module.exports = Mouse = {
  rel: function(e) {
    var mouseX, mouseY, rect, target;
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    if (mouseX == undefined) {
      rect = target.getBoundingClientRect();
      target = e.target || e.srcElement;
      if (mouseX == undefined) {
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      }
      if (mouseX == undefined) {
        mouseX = e.pageX - target.offsetLeft;
        mouseY = e.pageY - target.offsetTop;
      }
      if (mouseX == undefined) {
        console.log(e, "no mouse event defined. your browser sucks");
        return;
      }
    }
    return [mouseX, mouseY];
  },
  abs: function(e) {
    var mouseX, mouseY;
    mouseX = e.pageX;
    mouseY = e.pageY;
    if (mouseX == undefined) {
      mouseX = e.layerX;
      mouseY = e.layerY;
    }
    if (mouseX == undefined) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    if (mouseX == undefined) {
      mouseX = e.x;
      mouseY = e.y;
    }
    return [mouseX, mouseY];
  },
  wheelDelta: function(e) {
    var delta;
    delta = [e.deltaX, e.deltaY];
    if (delta[0] == undefined) {
      // in case there is a more detailed scroll sensor - use it
      if (e.mozMovementX) {
        delta = [0, e.mozMovementX];
      }
    }
    // safety first
    if (isNaN(delta[0])) {
      delta[0] = 0;
    }
    if (isNaN(delta[1])) {
      delta[1] = 0;
    }
    return delta;
  }
};

},{}],57:[function(require,module,exports){
module.exports = {
  A: "#00a35c",
  R: "#00fc03",
  N: "#00eb14",
  D: "#00eb14",
  C: "#0000ff",
  Q: "#00f10e",
  E: "#00f10e",
  G: "#009d62",
  H: "#00d52a",
  I: "#0054ab",
  L: "#007b84",
  K: "#00ff00",
  M: "#009768",
  F: "#008778",
  P: "#00e01f",
  S: "#00d52a",
  T: "#00db24",
  W: "#00a857",
  Y: "#00e619",
  V: "#005fa0",
  B: "#00eb14",
  X: "#00b649",
  Z: "#00f10e"
};

},{}],58:[function(require,module,exports){
module.exports = {
  A: "#BBBBBB",
  B: "grey",
  C: "yellow",
  D: "red",
  E: "red",
  F: "magenta",
  G: "brown",
  H: "#00FFFF",
  I: "#BBBBBB",
  J: "#fff",
  K: "#00FFFF",
  L: "#BBBBBB",
  M: "#BBBBBB",
  N: "green",
  O: "#fff",
  P: "brown",
  Q: "green",
  R: "#00FFFF",
  S: "green",
  T: "green",
  U: "#fff",
  V: "#BBBBBB",
  W: "magenta",
  X: "grey",
  Y: "magenta",
  Z: "grey",
  Gap: "grey"
};

},{}],59:[function(require,module,exports){
module.exports = {
  A: "orange",
  B: "#fff",
  C: "green",
  D: "red",
  E: "red",
  F: "blue",
  G: "orange",
  H: "red",
  I: "green",
  J: "#fff",
  K: "red",
  L: "green",
  M: "green",
  N: "#fff",
  O: "#fff",
  P: "orange",
  Q: "#fff",
  R: "red",
  S: "orange",
  T: "orange",
  U: "#fff",
  V: "green",
  W: "blue",
  X: "#fff",
  Y: "blue",
  Z: "#fff",
  Gap: "#fff"
};

},{}],60:[function(require,module,exports){
module.exports = {
  A: "#80a0f0",
  R: "#f01505",
  N: "#00ff00",
  D: "#c048c0",
  C: "#f08080",
  Q: "#00ff00",
  E: "#c048c0",
  G: "#f09048",
  H: "#15a4a4",
  I: "#80a0f0",
  L: "#80a0f0",
  K: "#f01505",
  M: "#80a0f0",
  F: "#80a0f0",
  P: "#ffff00",
  S: "#00ff00",
  T: "#00ff00",
  W: "#80a0f0",
  Y: "#15a4a4",
  V: "#80a0f0",
  B: "#fff",
  X: "#fff",
  Z: "#fff"
};

},{}],61:[function(require,module,exports){
module.exports = {
  A: "#e718e7",
  R: "#6f906f",
  N: "#1be41b",
  D: "#778877",
  C: "#23dc23",
  Q: "#926d92",
  E: "#ff00ff",
  G: "#00ff00",
  H: "#758a75",
  I: "#8a758a",
  L: "#ae51ae",
  K: "#a05fa0",
  M: "#ef10ef",
  F: "#986798",
  P: "#00ff00",
  S: "#36c936",
  T: "#47b847",
  W: "#8a758a",
  Y: "#21de21",
  V: "#857a85",
  B: "#49b649",
  X: "#758a75",
  Z: "#c936c9"
};

},{}],62:[function(require,module,exports){
module.exports = {
  A: "#ad0052",
  B: "#0c00f3",
  C: "#c2003d",
  D: "#0c00f3",
  E: "#0c00f3",
  F: "#cb0034",
  G: "#6a0095",
  H: "#1500ea",
  I: "#ff0000",
  J: "#fff",
  K: "#0000ff",
  L: "#ea0015",
  M: "#b0004f",
  N: "#0c00f3",
  O: "#fff",
  P: "#4600b9",
  Q: "#0c00f3",
  R: "#0000ff",
  S: "#5e00a1",
  T: "#61009e",
  U: "#fff",
  V: "#f60009",
  W: "#5b00a4",
  X: "#680097",
  Y: "#4f00b0",
  Z: "#0c00f3"
};

},{}],63:[function(require,module,exports){
var schemes = require("./schemeclass");
var StaticSchemeClass = schemes.stat;
var DynSchemeClass = schemes.dyn;

var Buried = require("./buried");
var Cinema = require("./cinema");
var Clustal = require("./clustal");
var Clustal2 = require("./clustal2");
var Helix = require("./helix");
var Hydro = require("./hydrophobicity");
var Lesk = require("./lesk");
var Mae = require("./mae");
var Nucleotide = require("./nucleotide");
var Purine = require("./purine");
var Strand = require("./strand");
var Taylor = require("./taylor");
var Turn = require("./turn");
var Zappo = require("./zappo");

var staticSchemes = {
  buried: Buried,
  buried_index: Buried,
  cinema: Cinema,
  clustal2: Clustal2,
  clustal: Clustal,
  helix: Helix,
  helix_propensity: Helix,
  hydro: Hydro,
  lesk: Lesk,
  mae: Mae,
  nucleotide: Nucleotide,
  purine: Purine,
  purine_pyrimidine: Purine,
  strand: Strand,
  strand_propensity: Strand,
  taylor: Taylor,
  turn: Turn,
  turn_propensity: Turn,
  zappo: Zappo
};

var pid = require("./pid_colors.js");

var dynSchemes = {
  pid: pid
};

module.exports = Colors = function(opt){
  this.maps = clone(staticSchemes);  
  this.dyn = clone(dynSchemes);
  this.opt = opt;
}
Colors.getScheme = function(scheme){
  return staticSchemes[scheme];
}
Colors.prototype.getScheme = function(scheme) {
  var color = this.maps[scheme];
  if (color === undefined) {
    color = {};
    if(this.dyn[scheme] != undefined){
      return new DynSchemeClass(this.dyn[scheme],this.opt);
    }
  }
  return new StaticSchemeClass(color);
};

Colors.prototype.addStaticScheme = function(name,scheme) {
  this.maps[name] = scheme;
}

Colors.prototype.addDynScheme = function(name,scheme) {
  this.dyn[name] = scheme;
}

// small helper to clone an object
function clone(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

},{"./buried":57,"./cinema":58,"./clustal":59,"./clustal2":60,"./helix":61,"./hydrophobicity":62,"./lesk":64,"./mae":65,"./nucleotide":66,"./pid_colors.js":67,"./purine":68,"./schemeclass":69,"./strand":70,"./taylor":71,"./turn":72,"./zappo":73}],64:[function(require,module,exports){
module.exports = {
  A: " orange",
  B: " #fff",
  C: " green",
  D: " red",
  E: " red",
  F: " green",
  G: " orange",
  H: " magenta",
  I: " green",
  J: " #fff",
  K: " red",
  L: " green",
  M: " green",
  N: " magenta",
  O: " #fff",
  P: " green",
  Q: " magenta",
  R: " red",
  S: " orange",
  T: " orange",
  U: " #fff",
  V: " green",
  W: " green",
  X: " #fff",
  Y: " green",
  Z: " #fff",
  Gap: " #fff"
};

},{}],65:[function(require,module,exports){
module.exports = {
  A: " #77dd88",
  B: " #fff",
  C: " #99ee66",
  D: " #55bb33",
  E: " #55bb33",
  F: " #9999ff",
  G: " #77dd88",
  H: " #5555ff",
  I: " #66bbff",
  J: " #fff",
  K: " #ffcc77",
  L: " #66bbff",
  M: " #66bbff",
  N: " #55bb33",
  O: " #fff",
  P: " #eeaaaa",
  Q: " #55bb33",
  R: " #ffcc77",
  S: " #ff4455",
  T: " #ff4455",
  U: " #fff",
  V: " #66bbff",
  W: " #9999ff",
  X: " #fff",
  Y: " #9999ff",
  Z: " #fff",
  Gap: " #fff"
};

},{}],66:[function(require,module,exports){
module.exports = {
  A: " #64F73F",
  C: " #FFB340",
  G: " #EB413C",
  T: " #3C88EE",
  U: " #3C88EE"
};

},{}],67:[function(require,module,exports){
var pid;
module.exports = pid = {};

// calculating the conservation is expensive 
// we only want to do it once
pid.init = function(){
  this.cons = this.opt.conservation();
}

pid.run = function(letter,opts){
  var cons = this.cons[opts.pos];
  if(cons > 0.8){
    return "#6464ff";
  }else if(cons > 0.6){
    return "#9da5ff";
  }else if(cons > 0.4){
    return "#cccccc";
  }else{
    return "#ffffff";
  }
}

},{}],68:[function(require,module,exports){
module.exports = {
  A: " #FF83FA",
  C: " #40E0D0",
  G: " #FF83FA",
  R: " #FF83FA",
  T: " #40E0D0",
  U: " #40E0D0",
  Y: " #40E0D0"
};

},{}],69:[function(require,module,exports){
var StaticSchemeClass = function(map){
  this.defaultColor = "#ffffff";
  this.type = "static";
  this.map = map;
  this.getColor = function(letter){
    if(this.map[letter] !== undefined){
      return this.map[letter]; 
    }else{
      return this.defaultColor;
    }
  };
};

var DynSchemeClass = function(fun,opt){
  this.type = "dyn";
  this.opt = opt;
  // init
  if(fun.init !== undefined){
    fun.init.call(this);
    this.getColor = fun.run;
    this.reset = fun.init;
  }else{
    this.getColor = fun;
  }
};
module.exports.stat = StaticSchemeClass;
module.exports.dyn = DynSchemeClass;

},{}],70:[function(require,module,exports){
module.exports = {
  A: "#5858a7",
  R: "#6b6b94",
  N: "#64649b",
  D: "#2121de",
  C: "#9d9d62",
  Q: "#8c8c73",
  E: "#0000ff",
  G: "#4949b6",
  H: "#60609f",
  I: "#ecec13",
  L: "#b2b24d",
  K: "#4747b8",
  M: "#82827d",
  F: "#c2c23d",
  P: "#2323dc",
  S: "#4949b6",
  T: "#9d9d62",
  W: "#c0c03f",
  Y: "#d3d32c",
  V: "#ffff00",
  B: "#4343bc",
  X: "#797986",
  Z: "#4747b8"
};

},{}],71:[function(require,module,exports){
module.exports = {
  A: "#ccff00",
  R: "#0000ff",
  N: "#cc00ff",
  D: "#ff0000",
  C: "#ffff00",
  Q: "#ff00cc",
  E: "#ff0066",
  G: "#ff9900",
  H: "#0066ff",
  I: "#66ff00",
  L: "#33ff00",
  K: "#6600ff",
  M: "#00ff00",
  F: "#00ff66",
  P: "#ffcc00",
  S: "#ff3300",
  T: "#ff6600",
  W: "#00ccff",
  Y: "#00ffcc",
  V: "#99ff00",
  B: "#fff",
  X: "#fff",
  Z: "#fff"
};

},{}],72:[function(require,module,exports){
module.exports = {
  A: "#2cd3d3",
  R: "#708f8f",
  N: "#ff0000",
  D: "#e81717",
  C: "#a85757",
  Q: "#3fc0c0",
  E: "#778888",
  G: "#ff0000",
  H: "#708f8f",
  I: "#00ffff",
  L: "#1ce3e3",
  K: "#7e8181",
  M: "#1ee1e1",
  F: "#1ee1e1",
  P: "#f60909",
  S: "#e11e1e",
  T: "#738c8c",
  W: "#738c8c",
  Y: "#9d6262",
  V: "#07f8f8",
  B: "#f30c0c",
  X: "#7c8383",
  Z: "#5ba4a4"
};

},{}],73:[function(require,module,exports){
module.exports = {
  A: "#ffafaf",
  R: "#6464ff",
  N: "#00ff00",
  D: "#ff0000",
  C: "#ffff00",
  Q: "#00ff00",
  E: "#ff0000",
  G: "#ff00ff",
  H: "#6464ff",
  I: "#ffafaf",
  L: "#ffafaf",
  K: "#6464ff",
  M: "#ffafaf",
  F: "#ffc800",
  P: "#ff00ff",
  S: "#00ff00",
  T: "#00ff00",
  W: "#ffc800",
  Y: "#ffc800",
  V: "#ffafaf",
  B: "#fff",
  X: "#fff",
  Z: "#fff"
};

},{}],74:[function(require,module,exports){
/*
 * msa-seqtools
 * https://github.com/greenify/msa-seqtools
 *
 * Copyright (c) 2014 greenify
 * Licensed under the MIT license.
 */

var st = {};
module.exports = st;

/****
 * Seems to be lots of different ways to format FASTA headers. 
 * 
 * Generally there's an ID and a DESCRIPTION
 *   >ID DESCRIPTION
 * 
 *   >(parts|of|ID) (DESCRIPTION with optional key=values)
 *   
 * This is complicated by the fact that the "values" in the description can have spaces
 * e.g. OS=Arabidopsis thaliana GN=CCD8
 * 
 ****
*/

// extract IDs and push them to the meta dict
st.getMeta = function(label) {
  
	var full_id = false, full_desc = false;
	var name, ids = {}, details = {}, description;

// 	console.log( "getMeta.label: ", label );
  
	var label_parts = label.split(" ");

	if ( label_parts.length >= 1 ) {
		full_id   = label_parts.shift();     // everything up to the first white space
		full_desc = label_parts.join(" ");   // everything else
	}
	else {
		full_id = label; 
	}
	
// 	console.log( "full_id", full_id );
// 	console.log( "full_desc", full_desc );
	
	if ( full_id ) {
		var id_parts = full_id.split('|');
		
		// the last item is the accession
		name = id_parts.pop(); 
		
		details.en = name;
		
		// everything else should be pairs: db|id
		while ( id_parts.length != 0 ) {
			var db = id_parts.shift();
			var id = id_parts.shift();
			ids[ db ] = id;
		}
	}
	else {
		name = full_id;
	}

	if ( full_desc ) {
	
		var kv_parts = full_desc.split('=');
	
		if ( kv_parts.length > 1 ) {
			
			var current_key, next_key;
			var kv;
			var kv_idx_max = kv_parts.length - 1;
			var kv_idx = 0;
			kv_parts.forEach( function( value_and_maybe_next_key ) {
				
				value_and_maybe_next_key = value_and_maybe_next_key.trim();
				
				var value_parts = value_and_maybe_next_key.split(" ");
				var value;
				if ( value_parts.length > 1 ) {
					next_key = value_parts.pop();
					value = value_parts.join(' ');
				}
				else {
					value = value_and_maybe_next_key;
				}

				if ( current_key ) {
					var key = current_key.toLowerCase();
					details[ key ] = value;
					//console.log( "details[" + key + "] = " + value );
				}
				else {
					description = value;
					//console.log( "description=" + value );
				}
				current_key = next_key;
			});
		}
		else {
			description = kv_parts.shift();
		}
	}
	
	var meta = {
		name: name,
		ids: ids,
		details: details,
	};
	
	if ( description ) {
		meta.desc = description
	}
	
// 	console.log( "meta", meta );
	
	return meta;
};

var findSepInArr = function(arr, sep) {
  for (var i = 0; i < arr.lenght; i++) {
    if (arr[i].indexOf(i)) {
      return i;
    }
  }
  return arr.length - 1;
};

var strToDict = function(str, sep, toJoin) {
  toJoin = toJoin || {};
  var entries = str.split(sep);
  toJoin[entries[0].toLowerCase()] = entries[1];
  return toJoin;
};

var identDB = {
  "sp": {
    link: "http://www.uniprot.org/%s",
    name: "Uniprot"
  },
  "tr": {
    link: "http://www.uniprot.org/%s",
    name: "Trembl"
  },
  "gb": {
    link: "http://www.ncbi.nlm.nih.gov/nuccore/%s",
    name: "Genbank"
  },
  "pdb": {
    link: "http://www.rcsb.org/pdb/explore/explore.do?structureId=%s",
    name: "PDB"
  }
};

st.buildLinks = function(meta) {
  var links = {};
  meta = meta || {};
  Object.keys(meta).forEach(function(id) {
    if (id in identDB) {
      var entry = identDB[id];
      var link = entry.link.replace("%s", meta[id]);
      links[entry.name] = link;
    }
  });
  return links;
};


// search for a text
st.contains = function(text, search) {
  return ''.indexOf.call(text, search, 0) !== -1;
};

// split after e.g. 80 chars
st.splitNChars = function(txt, num) {
  var i, _ref;
  num = num || 80;
  var result = [];
  for (i = 0, _ref = txt.length - 1; i <= _ref; i += num) {
    result.push(txt.substr(i, num));
  }
  return result;
};

st.reverse = function(seq) {
  return seq.split('').reverse().join('');
}

st.complement = function(seq) {
  var newSeq = seq + "";
  var replacements = [
    // cg
    [/g/g, "0"],
    [/c/g, "1"],
    [/0/g, "c"],
    [/1/g, "g"],
    // CG
    [/G/g, "0"],
    [/C/g, "1"],
    [/0/g, "C"],
    [/1/g, "G"],
    // at
    [/a/g, "0"],
    [/t/g, "1"],
    [/0/g, "t"],
    [/1/g, "a"],
    // AT
    [/A/g, "0"],
    [/T/g, "1"],
    [/0/g, "T"],
    [/1/g, "A"],
  ];

  for(var rep in replacements){
    newSeq = newSeq.replace(replacements[rep][0], replacements[rep][1]);
  }
  return newSeq;
}

st.reverseComplement = function(seq){
  return st.reverse(st.complement(seq));
}

st.model = function Seq(seq, name, id) {
  this.seq = seq;
  this.name = name;
  this.id = id;
  this.ids = {};
};

},{}],75:[function(require,module,exports){
"use strict";

var Colorscheme;
var Colors = require("msa-colorschemes");

var Model = require("backbone-thin").Model;

// this is an example of how one could color the MSA
// feel free to create your own color scheme in the /css/schemes folder
module.exports = Colorscheme = Model.extend({

  defaults: {
    scheme: "taylor", // name of your color scheme
    colorBackground: true, // otherwise only the text will be colored
    showLowerCase: true, // used to hide and show lowercase chars in the overviewbox
    opacity: 0.6 },

  // opacity for the residues
  initialize: function initialize(data, seqs, stat) {
    this.colors = new Colors({ seqs: seqs,
      conservation: function conservation() {
        return stat.scale(stat.conservation());
      } });
    // the stats module sends an event every time it is refreshed
    return stat.on("reset", function () {
      // some dynamic modules might require a redraw
      if (this.getSelectedScheme().type === "dyn") {
        var ref;
        if (ref = "reset", this.getSelectedScheme().indexOf(ref) >= 0) {
          return this.getSelectedScheme().reset();
        }
      }
    }, this);
  },

  // You can enter your own color scheme here
  addStaticScheme: function addStaticScheme(name, dict) {
    return this.colors.addStaticScheme(name, dict);
  },

  addDynScheme: function addDynScheme(name, fun) {
    return this.colors.addDynScheme(name, fun);
  },

  getScheme: function getScheme(name) {
    return this.colors.getScheme(name);
  },

  getSelectedScheme: function getSelectedScheme() {
    return this.colors.getScheme(this.get("scheme"));
  }
});
},{"backbone-thin":13,"msa-colorschemes":63}],76:[function(require,module,exports){
"use strict";

var Columns;
var Model = require("backbone-thin").Model;
var _ = require("underscore");

// model for column properties (like their hidden state)
module.exports = Columns = Model.extend({

  initialize: function initialize(o, stat) {
    // hidden columns
    if (!(this.get("hidden") != null)) {
      this.set("hidden", []);
    }
    return this.stats = stat;
  },

  // assumes hidden columns are sorted
  // @returns n [int] number of hidden columns until n
  calcHiddenColumns: function calcHiddenColumns(n) {
    var hidden = this.get("hidden");
    var newX = n;
    for (var j = 0, i; j < hidden.length; j++) {
      i = hidden[j];
      if (i <= newX) {
        newX++;
      }
    }
    return newX - n;
  }
});
},{"backbone-thin":13,"underscore":154}],77:[function(require,module,exports){
"use strict";

var Config;
var Model = require("backbone-thin").Model;

// simple user config
module.exports = Config = Model.extend({

  defaults: { registerMouseHover: false,
    registerMouseClicks: true,
    importProxy: "https://cors-anywhere.herokuapp.com/",
    importProxyStripHttp: true,
    eventBus: true,
    alphabetSize: 20,
    dropImport: false,
    debug: false,
    hasRef: false, // hasReference
    bootstrapMenu: false,
    manualRendering: false // not recommended to turn on
  }
});
},{"backbone-thin":13}],78:[function(require,module,exports){
"use strict";

var Package;
var Loader = require("../utils/loader");
var Model = require("backbone-thin").Model;

module.exports = Package = Model.extend({

  initialize: function initialize(g) {
    return this.g = g;
  },

  development: { "msa-tnt": "/node_modules/msa-tnt/build/bundle.js",
    "biojs-io-newick": "/node_modules/biojs-io-newick/build/biojs-io-newick.min.js"
  },

  // loads a package into the MSA component (if it is not available yet)
  loadPackage: function loadPackage(pkg, cb) {
    try {
      var p = require(pkg);
      return cb(p);
    } catch (error) {
      return Loader.loadScript(this._pkgURL(pkg), cb);
    }
  },

  // loads multiple packages and calls the cb if all packages are loaded
  loadPackages: function loadPackages(pkgs, cb) {
    var _this = this;

    var cbs = Loader.joinCb(function () {
      return cb();
    }, pkgs.length);
    return pkgs.forEach(function (pkg) {
      return _this.loadPackage(pkg, cbs);
    });
  },

  // internal method to get the URL for a package
  _pkgURL: function _pkgURL(pkg) {

    if (this.g.config.get("debug")) {
      var url = this.development[pkg];
    } else {
      url = "http://wzrd.in/bundle/" + pkg + "@latest";
    }

    return url;
  }
});
},{"../utils/loader":109,"backbone-thin":13}],79:[function(require,module,exports){
"use strict";

var _ = require("underscore");
var Model = require("backbone-thin").Model;

// holds the current user selection
var Selection = Model.extend({
  defaults: { type: "super" }

});var RowSelection = Selection.extend({
  defaults: _.extend({}, Selection.prototype.defaults, { type: "row",
    seqId: ""
  }),

  inRow: function inRow(seqId) {
    return seqId === this.get("seqId");
  },
  inColumn: function inColumn(rowPos) {
    return true;
  },
  getLength: function getLength() {
    return 1;
  }
});

var ColumnSelection = Selection.extend({
  defaults: _.extend({}, Selection.prototype.defaults, { type: "column",
    xStart: -1,
    xEnd: -1
  }),

  inRow: function inRow() {
    return true;
  },
  inColumn: function inColumn(rowPos) {
    return xStart <= rowPos && rowPos <= xEnd;
  },
  getLength: function getLength() {
    return xEnd - xStart;
  }
});

// pos is a mixin of column and row
// start with Row and only overwrite "inColumn" from Column
var PosSelection = RowSelection.extend(_.extend({}, _.pick(ColumnSelection, "inColumn"), _.pick(ColumnSelection, "getLength"),

// merge both defaults
{ defaults: _.extend({}, ColumnSelection.prototype.defaults, RowSelection.prototype.defaults, { type: "pos"
  })
}));

module.exports.sel = Selection;
module.exports.possel = PosSelection;
module.exports.rowsel = RowSelection;
module.exports.columnsel = ColumnSelection;
},{"backbone-thin":13,"underscore":154}],80:[function(require,module,exports){
"use strict";

var SelectionManager;
var sel = require("./Selection");
var _ = require("underscore");
var Collection = require("backbone-thin").Collection;

// holds the current user selection
module.exports = SelectionManager = Collection.extend({

  model: sel.sel,

  initialize: function initialize(data, opts) {
    if (typeof opts !== "undefined" && opts !== null) {
      this.g = opts.g;

      this.listenTo(this.g, "residue:click", function (e) {
        return this._handleE(e.evt, new sel.possel({
          xStart: e.rowPos,
          xEnd: e.rowPos,
          seqId: e.seqId
        }));
      });

      this.listenTo(this.g, "row:click", function (e) {
        return this._handleE(e.evt, new sel.rowsel({
          seqId: e.seqId
        }));
      });

      return this.listenTo(this.g, "column:click", function (e) {
        return this._handleE(e.evt, new sel.columnsel({
          xStart: e.rowPos,
          xEnd: e.rowPos + e.stepSize - 1
        }));
      });
    }
  },

  //@listenTo @, "add reset", (e) ->
  //@_reduceColumns()

  getSelForRow: function getSelForRow(seqId) {
    return this.filter(function (el) {
      return el.inRow(seqId);
    });
  },

  getSelForColumns: function getSelForColumns(rowPos) {
    return this.filter(function (el) {
      return el.inColumn(rowPos);
    });
  },

  addJSON: function addJSON(model) {
    return this.add(this._fromJSON(model));
  },

  _fromJSON: function _fromJSON(model) {
    switch (model.type) {
      case "column":
        return new sel.columnsel(model);
      case "row":
        return new sel.rowsel(model);
      case "pos":
        return new sel.possel(model);
    }
  },

  // allows normal JSON input
  resetJSON: function resetJSON(arr) {
    arr = _.map(arr, this._fromJSON);
    return this.reset(arr);
  },

  // @returns array of all selected residues for a row
  getBlocksForRow: function getBlocksForRow(seqId, maxLen) {
    var selis = this.filter(function (el) {
      return el.inRow(seqId);
    });
    var blocks = [];
    for (var i = 0, seli; i < selis.length; i++) {
      seli = selis[i];
      if (seli.attributes.type === "row") {
        blocks = function () {
          var result = [];
          var i1 = 0;
          if (0 <= maxLen) {
            while (i1 <= maxLen) {
              result.push(i1++);
            }
          } else {
            while (i1 >= maxLen) {
              result.push(i1--);
            }
          }
          return result;
        }();
        break;
      } else {
        blocks = blocks.concat(function () {
          var result = [];
          var i1 = seli.attributes.xStart;
          if (seli.attributes.xStart <= seli.attributes.xEnd) {
            while (i1 <= seli.attributes.xEnd) {
              result.push(i1++);
            }
          } else {
            while (i1 >= seli.attributes.xEnd) {
              result.push(i1--);
            }
          }
          return result;
        }());
      }
    }
    return blocks;
  },

  // @returns array with all columns being selected
  // example: 0-4... 12-14 selected -> [0,1,2,3,4,12,13,14]
  getAllColumnBlocks: function getAllColumnBlocks(conf) {
    var maxLen = conf.maxLen;
    var withPos = conf.withPos;
    var blocks = [];
    if (conf.withPos) {
      var filtered = this.filter(function (el) {
        return el.get('xStart') != null;
      });
    } else {
      filtered = this.filter(function (el) {
        return el.get('type') === "column";
      });
    }
    for (var i = 0, seli; i < filtered.length; i++) {
      seli = filtered[i];
      blocks = blocks.concat(function () {
        var result = [];
        var i1 = seli.attributes.xStart;
        if (seli.attributes.xStart <= seli.attributes.xEnd) {
          while (i1 <= seli.attributes.xEnd) {
            result.push(i1++);
          }
        } else {
          while (i1 >= seli.attributes.xEnd) {
            result.push(i1--);
          }
        }
        return result;
      }());
    }
    blocks = _.uniq(blocks);
    return blocks;
  },

  // inverts the current selection for columns
  // @param rows [Array] all available seqId
  invertRow: function invertRow(rows) {
    var selRows = this.where({ type: "row" });
    selRows = _.map(selRows, function (el) {
      return el.attributes.seqId;
    });
    var inverted = _.filter(rows, function (el) {
      if (selRows.indexOf(el) >= 0) {
        return false;
      } // existing selection
      return true;
    });
    // mass insert
    var s = [];
    for (var i = 0, el; i < inverted.length; i++) {
      el = inverted[i];
      s.push(new sel.rowsel({ seqId: el }));
    }
    return this.reset(s);
  },

  // inverts the current selection for rows
  // @param rows [Array] all available rows (0..max.length)
  invertCol: function invertCol(columns) {
    var xEnd;
    var selColumns = this.where({ type: "column" });
    selColumns = _.reduce(selColumns, function (memo, el) {
      return memo.concat(function () {
        var result = [];
        var i = el.attributes.xStart;
        if (el.attributes.xStart <= el.attributes.xEnd) {
          while (i <= el.attributes.xEnd) {
            result.push(i++);
          }
        } else {
          while (i >= el.attributes.xEnd) {
            result.push(i--);
          }
        }
        return result;
      }());
    }, []);
    var inverted = _.filter(columns, function (el) {
      if (selColumns.indexOf(el) >= 0) {
        // existing selection
        return false;
      }
      return true;
    });
    // mass insert
    if (inverted.length === 0) {
      return;
    }
    var s = [];
    var xStart = xEnd = inverted[0];
    for (var i = 0, el; i < inverted.length; i++) {
      el = inverted[i];
      if (xEnd + 1 === el) {
        // contiguous
        xEnd = el;
      } else {
        // gap between
        s.push(new sel.columnsel({ xStart: xStart, xEnd: xEnd }));
        xStart = xEnd = el;
      }
    }
    // check for last gap
    if (xStart !== xEnd) {
      s.push(new sel.columnsel({ xStart: xStart, xEnd: inverted[inverted.length - 1] }));
    }
    return this.reset(s);
  },

  // method to decide whether to start a new selection
  // or append to the old one (depending whether CTRL was pressed)
  _handleE: function _handleE(e, selection) {
    if (e.ctrlKey || e.metaKey) {
      return this.add(selection);
    } else {
      return this.reset([selection]);
    }
  },

  // experimental reduce method for columns
  _reduceColumns: function _reduceColumns() {
    return this.each(function (el, index, arr) {
      var cols = _.filter(arr, function (el) {
        return el.get('type') === 'column';
      });
      var xStart = el.get('xStart');
      var xEnd = el.get('xEnd');

      var lefts = _.filter(cols, function (el) {
        return el.get('xEnd') === xStart - 1;
      });
      for (var i = 0, left; i < lefts.length; i++) {
        left = lefts[i];
        left.set('xEnd', xStart);
      }

      var rights = _.filter(cols, function (el) {
        return el.get('xStart') === xEnd + 1;
      });
      for (var j = 0, right; j < rights.length; j++) {
        right = rights[j];
        right.set('xStart', xEnd);
      }

      if (lefts.length > 0 || rights.length > 0) {
        console.log("removed el");
        return el.collection.remove(el);
      }
    });
  }
});
},{"./Selection":79,"backbone-thin":13,"underscore":154}],81:[function(require,module,exports){
"use strict";

var Config;
var Model = require("backbone-thin").Model;

// simple user config
module.exports = Config = Model.extend({

  defaults: { searchText: "" }

});
},{"backbone-thin":13}],82:[function(require,module,exports){
"use strict";

var Visibility;
var Model = require("backbone-thin").Model;

// visible areas
module.exports = Visibility = Model.extend({

  defaults:

  // for the Stage
  { searchBox: -10,
    overviewBox: 30,
    headerBox: -1,
    alignmentBody: 0
  }
});
},{"backbone-thin":13}],83:[function(require,module,exports){
"use strict";

var Visibility;
var Model = require("backbone-thin").Model;

// visible areas
module.exports = Visibility = Model.extend({

  defaults: { sequences: true,
    markers: true,
    metacell: false,
    conserv: false,
    overviewbox: false,
    seqlogo: false,
    gapHeader: false,
    leftHeader: true,

    // about the labels
    labels: true,
    labelName: true,
    labelId: true,
    labelPartition: false,
    labelCheckbox: false,

    // meta stuff
    metaGaps: true,
    metaIdentity: true,
    metaLinks: true
  },

  constructor: function constructor(attributes, options) {
    this.calcDefaults(options.model);
    return Model.apply(this, arguments);
  },

  initialize: function initialize() {

    this.listenTo(this, "change:metaLinks change:metaIdentity change:metaGaps", function () {
      return this.trigger("change:metacell");
    }, this);

    this.listenTo(this, "change:labelName change:labelId change:labelPartition change:labelCheckbox", function () {
      return this.trigger("change:labels");
    }, this);

    return this.listenTo(this, "change:markers change:conserv change:seqlogo change:gapHeader", function () {
      return this.trigger("change:header");
    }, this);
  },

  calcDefaults: function calcDefaults(seqs) {
    if (seqs.length > 0) {
      var seq = seqs.at(0);
      var ids = seq.get("ids");
      if (ids !== undefined && Object.keys(ids).length === 0) {
        return this.defaults.metaLinks = false;
      }
    }
  }
});
},{"backbone-thin":13}],84:[function(require,module,exports){
"use strict";

var Zoomer;
var Model = require("backbone-thin").Model;
// pixel properties for some components
module.exports = Zoomer = Model.extend({

  constructor: function constructor(attributes, options) {
    this.calcDefaults(options.model);
    Model.apply(this, arguments);
    this.g = options.g;

    // events
    this.listenTo(this, "change:labelIdLength change:labelNameLength change:labelPartLength change:labelCheckLength", function () {
      return this.trigger("change:labelWidth", this.getLabelWidth());
    }, this);
    this.listenTo(this, "change:metaLinksWidth change:metaIdentWidth change:metaGapWidth", function () {
      return this.trigger("change:metaWidth", this.getMetaWidth());
    }, this);

    return this;
  },

  defaults: {

    // general
    alignmentWidth: "auto",
    alignmentHeight: 225,
    columnWidth: 15,
    rowHeight: 15,
    autoResize: true, // only for the width

    // labels
    textVisible: true,
    labelIdLength: 20,
    labelNameLength: 100,
    labelPartLength: 15,
    labelCheckLength: 15,
    labelFontsize: 13,
    labelLineHeight: "13px",

    // marker
    markerFontsize: "10px",
    stepSize: 1,
    markerStepSize: 2,
    markerHeight: 20,

    // canvas
    residueFont: "13", // in px
    canvasEventScale: 1,

    // overview box
    boxRectHeight: 2,
    boxRectWidth: 2,
    overviewboxPaddingTop: 10,

    // meta cell
    metaGapWidth: 35,
    metaIdentWidth: 40,
    // metaLinksWidth: 25

    // internal props
    _alignmentScrollLeft: 0,
    _alignmentScrollTop: 0
  },

  // sets some defaults, depending on the model
  calcDefaults: function calcDefaults(model) {
    var maxLen = model.getMaxLength();
    if (maxLen < 200 && model.length < 30) {
      return this.defaults.boxRectWidth = this.defaults.boxRectHeight = 5;
    }
  },

  // @param n [int] maxLength of all seqs
  getAlignmentWidth: function getAlignmentWidth(n) {
    if (this.get("autoResize") && n !== undefined) {
      return this.get("columnWidth") * n;
    }
    if (this.get("alignmentWidth") === undefined || this.get("alignmentWidth") === "auto" || this.get("alignmentWidth") === 0) {
      return this._adjustWidth();
    } else {
      return this.get("alignmentWidth");
    }
  },

  // @param n [int] number of residues to scroll to the right
  setLeftOffset: function setLeftOffset(n) {
    var val = n;
    val = Math.max(0, val);
    val -= this.g.columns.calcHiddenColumns(val);
    return this.set("_alignmentScrollLeft", val * this.get('columnWidth'));
  },

  // @param n [int] row that should be on top
  setTopOffset: function setTopOffset(n) {
    var val = Math.max(0, n - 1);
    var height = 0;
    for (var i = 0; 0 < val ? i <= val : i >= val; 0 < val ? i++ : i--) {
      var seq = this.model.at(i);
      height += seq.attributes.height || 1;
    }
    return this.set("_alignmentScrollTop", height * this.get("rowHeight"));
  },

  // length of all elements left to the main sequence body: labels, metacell, ..
  getLeftBlockWidth: function getLeftBlockWidth() {
    var paddingLeft = 0;
    if (this.g.vis.get("labels")) {
      paddingLeft += this.getLabelWidth();
    }
    if (this.g.vis.get("metacell")) {
      paddingLeft += this.getMetaWidth();
    }
    //paddingLeft += 15 # scroll bar
    return paddingLeft;
  },

  getMetaWidth: function getMetaWidth() {
    var val = 0;
    if (this.g.vis.get("metaGaps")) {
      val += this.get("metaGapWidth");
    }
    if (this.g.vis.get("metaIdentity")) {
      val += this.get("metaIdentWidth");
    }
    if (this.g.vis.get("metaLinks")) {
      val += this.get("metaLinksWidth");
    }
    return val;
  },

  getLabelWidth: function getLabelWidth() {
    var val = 0;
    if (this.g.vis.get("labelName")) {
      val += this.get("labelNameLength");
    }
    if (this.g.vis.get("labelId")) {
      val += this.get("labelIdLength");
    }
    if (this.g.vis.get("labelPartition")) {
      val += this.get("labelPartLength");
    }
    if (this.g.vis.get("labelCheckbox")) {
      val += this.get("labelCheckLength");
    }
    return val;
  },

  _adjustWidth: function _adjustWidth() {
    if (!(this.el !== undefined && this.model !== undefined)) {
      return;
    }
    if (this.el.parentNode != null && this.el.parentNode.offsetWidth !== 0) {
      var parentWidth = this.el.parentNode.offsetWidth;
    } else {
      parentWidth = document.body.clientWidth - 35;
    }

    // TODO: dirty hack
    var maxWidth = parentWidth - this.getLeftBlockWidth();
    var calcWidth = this.getAlignmentWidth(this.model.getMaxLength() - this.g.columns.get('hidden').length);
    var val = Math.min(maxWidth, calcWidth);
    // round to a valid AA box
    val = Math.floor(val / this.get("columnWidth")) * this.get("columnWidth");

    //@set "alignmentWidth", val
    return this.attributes.alignmentWidth = val;
  },

  autoResize: function autoResize() {
    if (this.get("autoResize")) {
      return this._adjustWidth(this.el, this.model);
    }
  },

  // max is the maximal allowed height
  autoHeight: function autoHeight(max) {
    // TODO!
    // make seqlogo height configurable
    var val = this.getMaxAlignmentHeight();
    if (max !== undefined && max > 0) {
      val = Math.min(val, max);
    }

    return this.set("alignmentHeight", val);
  },

  setEl: function setEl(el, model) {
    this.el = el;
    return this.model = model;
  },

  // updates both scroll properties (if needed)
  _checkScrolling: function _checkScrolling(scrollObj, opts) {
    var xScroll = scrollObj[0];
    var yScroll = scrollObj[1];

    this.set("_alignmentScrollLeft", xScroll, opts);
    return this.set("_alignmentScrollTop", yScroll, opts);
  },

  getMaxAlignmentHeight: function getMaxAlignmentHeight() {
    var height = 0;
    this.model.each(function (seq) {
      return height += seq.attributes.height || 1;
    });

    return height * this.get("rowHeight");
  },

  getMaxAlignmentWidth: function getMaxAlignmentWidth() {
    return this.model.getMaxLength() * this.get("columnWidth");
  }
});
},{"backbone-thin":13}],85:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ImportMenu = require("./views/ImportMenu");

var _ImportMenu2 = _interopRequireDefault(_ImportMenu);

var _FilterMenu = require("./views/FilterMenu");

var _FilterMenu2 = _interopRequireDefault(_FilterMenu);

var _SelectionMenu = require("./views/SelectionMenu");

var _SelectionMenu2 = _interopRequireDefault(_SelectionMenu);

var _VisMenu = require("./views/VisMenu");

var _VisMenu2 = _interopRequireDefault(_VisMenu);

var _ColorMenu = require("./views/ColorMenu");

var _ColorMenu2 = _interopRequireDefault(_ColorMenu);

var _OrderingMenu = require("./views/OrderingMenu");

var _OrderingMenu2 = _interopRequireDefault(_OrderingMenu);

var _ExtraMenu = require("./views/ExtraMenu");

var _ExtraMenu2 = _interopRequireDefault(_ExtraMenu);

var _ExportMenu = require("./views/ExportMenu");

var _ExportMenu2 = _interopRequireDefault(_ExportMenu);

var _HelpMenu = require("./views/HelpMenu");

var _HelpMenu2 = _interopRequireDefault(_HelpMenu);

var _DebugMenu = require("./views/DebugMenu");

var _DebugMenu2 = _interopRequireDefault(_DebugMenu);

var _settings = require("./settings");

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var boneView = require("backbone-childs");

// menu views


// this very basic menu demonstrates calls to the MSA component
var MenuView = boneView.extend({

  initialize: function initialize(data) {
    if (!data.msa) {
      throw new Error("No msa instance provided. Please provide .msa");
    }
    this.msa = data.msa;

    // add menu config to the global object
    this.msa.g.menuconfig = new _settings2.default(data.menu);

    this.addView("10_import", new _ImportMenu2.default({ model: this.msa.seqs, g: this.msa.g, msa: this.msa }));
    this.addView("15_ordering", new _OrderingMenu2.default({ model: this.msa.seqs, g: this.msa.g }));
    this.addView("20_filter", new _FilterMenu2.default({ model: this.msa.seqs, g: this.msa.g }));
    this.addView("30_selection", new _SelectionMenu2.default({ model: this.msa.seqs, g: this.msa.g }));
    this.addView("40_vis", new _VisMenu2.default({ model: this.msa.seqs, g: this.msa.g }));
    this.addView("50_color", new _ColorMenu2.default({ model: this.msa.seqs, g: this.msa.g }));
    this.addView("70_extra", new _ExtraMenu2.default({ model: this.msa.seqs, g: this.msa.g, msa: this.msa }));
    this.addView("80_export", new _ExportMenu2.default({ model: this.msa.seqs, g: this.msa.g, msa: this.msa }));
    this.addView("90_help", new _HelpMenu2.default({ g: this.msa.g }));
    if (this.msa.g.config.get("debug")) {
      return this.addView("95_debug", new _DebugMenu2.default({ g: this.msa.g }));
    }
  },

  render: function render() {
    this.renderSubviews();
    // other
    this.el.setAttribute("class", "smenubar");
    return this.el.appendChild(document.createElement("p"));
  }
});
exports.default = MenuView;
},{"./settings":88,"./views/ColorMenu":89,"./views/DebugMenu":90,"./views/ExportMenu":91,"./views/ExtraMenu":92,"./views/FilterMenu":93,"./views/HelpMenu":94,"./views/ImportMenu":95,"./views/OrderingMenu":96,"./views/SelectionMenu":97,"./views/VisMenu":98,"backbone-childs":8}],86:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defaultmenu = require("./defaultmenu");

Object.defineProperty(exports, "defaultmenu", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_defaultmenu).default;
  }
});

var _menubuilder = require("./menubuilder");

Object.defineProperty(exports, "menubuilder", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_menubuilder).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./defaultmenu":85,"./menubuilder":87}],87:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var builder = require("menu-builder");

var MenuBuilder = builder.extend({

  buildDOM: function buildDOM() {
    this.on("new:node", this.buildNode);
    this.on("new:button", this.buildButton);
    this.on("new:menu", this.buildMenu);
    return builder.prototype.buildDOM.call(this);
  },

  buildNode: function buildNode(li) {
    if (this.g != null) {
      return li.style.lineHeight = this.g.menuconfig.get("menuItemLineHeight");
    }
  },

  buildButton: function buildButton(btn) {
    if (this.g != null) {
      btn.style.fontSize = this.g.menuconfig.get("menuFontsize");
      btn.style.marginLeft = this.g.menuconfig.get("menuMarginLeft");
      return btn.style.padding = this.g.menuconfig.get("menuPadding");
    }
  },

  buildMenu: function buildMenu(menu) {
    if (this.g != null) {
      return menu.style.fontSize = this.g.menuconfig.get("menuItemFontsize");
    }
  }
});
exports.default = MenuBuilder;
},{"menu-builder":54}],88:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Model = require("backbone-thin").Model;
var MenuSettings = Model.extend({
    constructor: function constructor(attributes, options) {
        if (attributes == "small") {
            attributes = this.small;
        }
        return Model.apply(this, [attributes]);
    },
    small: {
        menuFontsize: "12px"
    },
    defaults: {
        menuFontsize: "14px",
        menuItemFontsize: "14px",
        menuItemLineHeight: "14px",
        menuMarginLeft: "3px",
        menuPadding: "3px 4px 3px 4px"
    }
});
exports.default = MenuSettings;
},{"backbone-thin":13}],89:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _menubuilder = require("../menubuilder");

var _menubuilder2 = _interopRequireDefault(_menubuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require("underscore");
var dom = require("dom-helper");

var ColorMenu = _menubuilder2.default.extend({

  initialize: function initialize(data) {
    this.g = data.g;
    this.el.style.display = "inline-block";
    return this.listenTo(this.g.colorscheme, "change", function () {
      return this.render();
    });
  },

  render: function render() {
    var menuColor = this.setName("Color scheme");
    this.removeAllNodes();

    var colorschemes = this.getColorschemes();
    for (var i = 0, scheme; i < colorschemes.length; i++) {
      scheme = colorschemes[i];
      this.addScheme(menuColor, scheme);
    }

    // text = "Background"
    // if @g.colorscheme.get("colorBackground")
    //   text = "Hide " + text
    // else
    //   text = "Show " + text

    // @addNode text, =>
    //   @g.colorscheme.set "colorBackground", !@g.colorscheme.get("colorBackground")

    this.grey(menuColor);

    // TODO: make more efficient
    dom.removeAllChilds(this.el);
    this.el.appendChild(this.buildDOM());
    return this;
  },

  addScheme: function addScheme(menuColor, scheme) {
    var _this = this;

    var style = {};
    var current = this.g.colorscheme.get("scheme");
    if (current === scheme.id) {
      style.backgroundColor = "#77ED80";
    }

    return this.addNode(scheme.name, function () {
      _this.g.colorscheme.set("scheme", scheme.id);
    }, {
      style: style
    });
  },

  getColorschemes: function getColorschemes() {
    var schemes = [];
    schemes.push({ name: "Taylor", id: "taylor" });
    schemes.push({ name: "Buried", id: "buried" });
    schemes.push({ name: "Cinema", id: "cinema" });
    schemes.push({ name: "Clustal", id: "clustal" });
    schemes.push({ name: "Clustal2", id: "clustal2" });
    schemes.push({ name: "Helix", id: "helix" });
    schemes.push({ name: "Hydrophobicity", id: "hydro" });
    schemes.push({ name: "Lesk", id: "lesk" });
    schemes.push({ name: "MAE", id: "mae" });
    schemes.push({ name: "Nucleotide", id: "nucleotide" });
    schemes.push({ name: "Purine", id: "purine" });
    schemes.push({ name: "PID", id: "pid" });
    schemes.push({ name: "Strand", id: "strand" });
    schemes.push({ name: "Turn", id: "turn" });
    schemes.push({ name: "Zappo", id: "zappo" });
    schemes.push({ name: "No color", id: "foo" });
    return schemes;
  },

  grey: function grey(menuColor) {

    // greys all lowercase letters
    // @addNode "Shade", =>
    //   @g.colorscheme.set "showLowerCase", false
    //   @model.each (seq) ->
    //     residues = seq.get "seq"
    //     grey = []
    //     _.each residues, (el, index) ->
    //       if el is el.toLowerCase()
    //         grey.push index
    //     seq.set "grey", grey

    // @addNode "Shade by threshold", =>
    //   threshold = prompt "Enter threshold (in percent)", 20
    //   threshold = threshold / 100
    //   maxLen = @model.getMaxLength()
    //   # TODO: cache
    //   conserv = @g.stats.scale @g.stats.conservation()
    //   grey = []
    //   for i in [0.. maxLen - 1]
    //     if conserv[i] < threshold
    //       grey.push i
    //   @model.each (seq) ->
    //     seq.set "grey", grey

    // @addNode "Shade selection", =>
    //   maxLen = @model.getMaxLength()
    //   @model.each (seq) =>
    //     blocks = @g.selcol.getBlocksForRow(seq.get("id"),maxLen)
    //     seq.set "grey", blocks

    // @addNode "Reset shade", =>
    //   @g.colorscheme.set "showLowerCase", true
    //   @model.each (seq) ->
    //     seq.set "grey", []
  }
});
exports.default = ColorMenu;
},{"../menubuilder":87,"dom-helper":47,"underscore":154}],90:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _menubuilder = require("../menubuilder");

var _menubuilder2 = _interopRequireDefault(_menubuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DebugMenu = _menubuilder2.default.extend({

  initialize: function initialize(data) {
    this.g = data.g;
    return this.el.style.display = "inline-block";
  },

  render: function render() {
    var _this = this;

    this.setName("Debug");

    this.addNode("Get the code", function () {
      return window.open("https://github.com/wilzbach/msa");
    });

    this.addNode("Toggle mouseover events", function () {
      _this.g.config.set("registerMouseHover", !_this.g.config.get("registerMouseHover"));
      return _this.g.onAll(function () {
        return console.log(arguments);
      });
    });

    this.addNode("Minimized width", function () {
      return _this.g.zoomer.set("alignmentWidth", 600);
    });
    this.addNode("Minimized height", function () {
      return _this.g.zoomer.set("alignmentHeight", 120);
    });

    this.el.appendChild(this.buildDOM());
    return this;
  }
});
exports.default = DebugMenu;
},{"../menubuilder":87}],91:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _menubuilder = require("../menubuilder");

var _menubuilder2 = _interopRequireDefault(_menubuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FastaExporter = require("biojs-io-fasta").writer;
var _ = require("underscore");
var Exporter = require("../../utils/export");
var ShareSym = "↪";

var ExportMenu = _menubuilder2.default.extend({

  initialize: function initialize(data) {
    this.g = data.g;
    this.msa = data.msa;
    return this.el.style.display = "inline-block";
  },

  render: function render() {
    var _this = this;

    this.setName("Export");

    this.addNode("Share view (URL)" + ShareSym, function () {
      return Exporter.shareLink(_this.msa, function (link) {
        return window.open(link, '_blank');
      });
    });

    this.addNode("View in Jalview", function () {
      var url = _this.g.config.get('url');
      if (!(typeof url !== "undefined" && url !== null)) {
        return alert("Sequence weren't imported via an URL");
      } else {
        if (url.indexOf("localhost" || url === "dragimport")) {
          return Exporter.publishWeb(_this.msa, function (link) {
            return Exporter.openInJalview(link, _this.g.colorscheme.get("scheme"));
          });
        } else {
          return Exporter.openInJalview(url, _this.g.colorscheme.get("scheme"));
        }
      }
    });

    this.addNode("Export alignment (FASTA)", function () {
      return Exporter.saveAsFile(_this.msa, "all.fasta");
    });

    this.addNode("Export alignment (URL)", function () {
      return Exporter.publishWeb(_this.msa, function (link) {
        return window.open(link, '_blank');
      });
    });

    this.addNode("Export selected sequences (FASTA)", function () {
      return Exporter.saveSelection(_this.msa, "selection.fasta");
    });

    this.addNode("Export features (GFF)", function () {
      return Exporter.saveAnnots(_this.msa, "features.gff3");
    });

    this.addNode("Export MSA image (PNG)", function () {
      return Exporter.saveAsImg(_this.msa, "biojs-msa.png");
    });

    this.el.appendChild(this.buildDOM());
    return this;
  }
});
exports.default = ExportMenu;
},{"../../utils/export":106,"../menubuilder":87,"biojs-io-fasta":"biojs-io-fasta","underscore":154}],92:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _menubuilder = require("../menubuilder");

var _menubuilder2 = _interopRequireDefault(_menubuilder);

var _Sequence = require("../../model/Sequence");

var _Sequence2 = _interopRequireDefault(_Sequence);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Loader = require("../../utils/loader");
var xhr = require("xhr");

var ExtraMenu = _menubuilder2.default.extend({

  initialize: function initialize(data) {
    this.g = data.g;
    this.el.style.display = "inline-block";
    return this.msa = data.msa;
  },

  render: function render() {
    var _this = this;

    this.setName("Extras");
    var stats = this.g.stats;
    var msa = this.msa;
    this.addNode("Add consensus seq", function () {
      var con = stats.consensus();
      var seq = new _Sequence2.default({
        seq: con,
        id: "0c",
        name: "Consenus"
      });
      _this.model.add(seq);
      _this.model.setRef(seq);
      _this.model.comparator = function (seq) {
        return !seq.get("ref");
      };
      return _this.model.sort();
    });

    // @addNode "Calc Tree", ->
    //   # this is a very experimental feature
    //   # TODO: exclude msa & tnt in the adapter package
    //   newickStr = ""
    //
    //   cbs = Loader.joinCb ->
    //     msa.u.tree.showTree nwkData
    //   , 2, @
    //
    //   msa.u.tree.loadTree cbs
    //   # load fake tree
    //   nwkData =
    //     name: "root",
    //     children: [
    //       name: "c1",
    //       branch_length: 4
    //       children: msa.seqs.filter (f,i) ->  i % 2 is 0
    //     ,
    //       name: "c2",
    //       children: msa.seqs.filter (f,i) ->  i % 2 is 1
    //       branch_length: 4
    //     ]
    //   msa.seqs.each (s) ->
    //     s.set "branch_length", 2
    //   cbs()

    this.addNode("Increase font size", function () {
      var columnWidth = _this.g.zoomer.get("columnWidth");
      var nColumnWidth = columnWidth + 5;
      _this.g.zoomer.set("columnWidth", nColumnWidth);
      _this.g.zoomer.set("rowHeight", nColumnWidth);
      var nFontSize = nColumnWidth * 0.7;
      _this.g.zoomer.set("residueFont", nFontSize);
      return _this.g.zoomer.set("labelFontSize", nFontSize);
    });
    this.addNode("Decrease font size", function () {
      var columnWidth = _this.g.zoomer.get("columnWidth");
      var nColumnWidth = columnWidth - 2;
      _this.g.zoomer.set("columnWidth", nColumnWidth);
      _this.g.zoomer.set("rowHeight", nColumnWidth);
      var nFontSize = nColumnWidth * 0.6;
      _this.g.zoomer.set("residueFont", nFontSize);
      _this.g.zoomer.set("labelFontSize", nFontSize);

      if (_this.g.zoomer.get("columnWidth") < 8) {
        return _this.g.zoomer.set("textVisible", false);
      }
    });

    this.addNode("Jump to a column", function () {
      var offset = prompt("Column", "20");
      if (offset < 0 || offset > _this.model.getMaxLength() || isNaN(offset)) {
        alert("invalid column");
        return;
      }
      return _this.g.zoomer.setLeftOffset(offset);
    });

    this.el.appendChild(this.buildDOM());
    return this;
  }
});
exports.default = ExtraMenu;
},{"../../model/Sequence":102,"../../utils/loader":109,"../menubuilder":87,"xhr":134}],93:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _menubuilder = require("../menubuilder");

var _menubuilder2 = _interopRequireDefault(_menubuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require("underscore");

var FilterMenu = _menubuilder2.default.extend({

  initialize: function initialize(data) {
    this.g = data.g;
    return this.el.style.display = "inline-block";
  },

  render: function render() {
    var _this = this;

    this.setName("Filter");
    this.addNode("Hide columns by threshold", function (e) {
      var threshold = prompt("Enter threshold (in percent)", 20);
      threshold = threshold / 100;
      var maxLen = _this.model.getMaxLength();
      var hidden = [];
      // TODO: cache this value
      var conserv = _this.g.stats.scale(_this.g.stats.conservation());
      var end = maxLen - 1;
      for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
        if (conserv[i] < threshold) {
          hidden.push(i);
        }
      }
      return _this.g.columns.set("hidden", hidden);
    });

    this.addNode("Hide columns by selection", function () {
      var hiddenOld = _this.g.columns.get("hidden");
      var hidden = hiddenOld.concat(_this.g.selcol.getAllColumnBlocks({ maxLen: _this.model.getMaxLength(), withPos: true }));
      _this.g.selcol.reset([]);
      return _this.g.columns.set("hidden", hidden);
    });

    this.addNode("Hide columns by gaps", function () {
      var threshold = prompt("Enter threshold (in percent)", 20);
      threshold = threshold / 100;
      var maxLen = _this.model.getMaxLength();
      var hidden = [];
      var end = maxLen - 1;
      for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
        var gaps = 0;
        var total = 0;
        _this.model.each(function (el) {
          if (el.get('seq')[i] === "-") {
            gaps++;
          }
          return total++;
        });
        var gapContent = gaps / total;
        if (gapContent > threshold) {
          hidden.push(i);
        }
      }
      return _this.g.columns.set("hidden", hidden);
    });

    this.addNode("Hide seqs by identity", function () {
      var threshold = prompt("Enter threshold (in percent)", 20);
      threshold = threshold / 100;
      return _this.model.each(function (el) {
        if (el.get('identity') < threshold) {
          return el.set('hidden', true);
        }
      });
    });

    this.addNode("Hide seqs by selection", function () {
      var hidden = _this.g.selcol.where({ type: "row" });
      var ids = _.map(hidden, function (el) {
        return el.get('seqId');
      });
      _this.g.selcol.reset([]);
      return _this.model.each(function (el) {
        if (ids.indexOf(el.get('id')) >= 0) {
          return el.set('hidden', true);
        }
      });
    });

    this.addNode("Hide seqs by gaps", function () {
      var threshold = prompt("Enter threshold (in percent)", 40);
      return _this.model.each(function (el, i) {
        var seq = el.get('seq');
        var gaps = _.reduce(seq, function (memo, c) {
          return c === '-' ? ++memo : undefined;
        }, 0);
        if (gaps > threshold) {
          return el.set('hidden', true);
        }
      });
    });

    this.addNode("Reset", function () {
      _this.g.columns.set("hidden", []);
      return _this.model.each(function (el) {
        if (el.get('hidden')) {
          return el.set('hidden', false);
        }
      });
    });

    this.el.appendChild(this.buildDOM());
    return this;
  }
});
exports.default = FilterMenu;
},{"../menubuilder":87,"underscore":154}],94:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _menubuilder = require("../menubuilder");

var _menubuilder2 = _interopRequireDefault(_menubuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HelpMenu = _menubuilder2.default.extend({

  initialize: function initialize(data) {
    return this.g = data.g;
  },

  render: function render() {
    this.setName("Help");
    this.addNode("About the project", function () {
      return window.open("https://github.com/wilzbach/msa");
    });
    this.addNode("Report issues", function () {
      return window.open("https://github.com/wilzbach/msa/issues");
    });
    this.addNode("User manual", function () {
      return window.open("https://github.com/wilzbach/msa/wiki");
    });
    this.el.style.display = "inline-block";
    this.el.appendChild(this.buildDOM());
    return this;
  }
});
exports.default = HelpMenu;
},{"../menubuilder":87}],95:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _menubuilder = require("../menubuilder");

var _menubuilder2 = _interopRequireDefault(_menubuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var k = require("koala-js");

var ImportMenu = _menubuilder2.default.extend({

  initialize: function initialize(data) {
    this.g = data.g;
    this.el.style.display = "inline-block";
    return this.msa = data.msa;
  },

  render: function render() {
    var _this = this;

    var msa = this.msa;
    var uploader = k.mk("input");
    uploader.type = "file";
    uploader.style.display = "none";
    //uploader.accept
    // http://www.w3schools.com/jsref/prop_fileupload_accept.asp
    // for now we allow multiple files
    uploader.multiple = true;
    uploader.addEventListener("change", function () {
      var files = uploader.files || [];
      return msa.u.file.importFiles(files);
    });

    this.el.appendChild(uploader);

    var filetypes = "(Fasta, Clustal, GFF, Jalview features, Newick)";

    this.setName("Import");
    this.addNode("URL", function (e) {
      var url = prompt("URL " + filetypes, "http://rostlab.org/~goldberg/clustalw2-I20140818-215249-0556-53699878-pg.clustalw");
      if (url.length > 5) {
        return _this.msa.u.file.importURL(url, function () {});
      }
    });
    // mass update on zoomer
    //zoomer = @g.zoomer.toJSON()
    //#zoomer.textVisible = false
    //#zoomer.columnWidth = 4
    //zoomer.boxRectHeight = 2
    //zoomer.boxRectWidth = 2
    //@g.zoomer.set zoomer

    this.addNode("From file " + filetypes, function () {
      return uploader.click();
    });

    this.addNode("Drag & Drop", function () {
      return alert("Yep. Just drag & drop your file " + filetypes);
    });

    this.el.appendChild(this.buildDOM());
    return this;
  }
});
exports.default = ImportMenu;
},{"../menubuilder":87,"koala-js":53}],96:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _menubuilder = require("../menubuilder");

var _menubuilder2 = _interopRequireDefault(_menubuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dom = require("dom-helper");
var _ = require('underscore');
var arrowUp = "↑";
var arrowDown = "↓";

var OrderingMenu = _menubuilder2.default.extend({

  initialize: function initialize(data) {
    this.g = data.g;
    this.order = "ID";
    return this.el.style.display = "inline-block";
  },

  setOrder: function setOrder(order) {
    this.order = order;
    return this.render();
  },

  // TODO: make more generic
  render: function render() {
    this.setName("Sorting");
    this.removeAllNodes();

    var comps = this.getComparators();
    for (var i = 0, m; i < comps.length; i++) {
      m = comps[i];
      this._addNode(m);
    }

    var el = this.buildDOM();

    // TODO: make more efficient
    dom.removeAllChilds(this.el);
    this.el.appendChild(el);
    return this;
  },

  _addNode: function _addNode(m) {
    var _this = this;

    var text = m.text;
    var style = {};
    if (text === this.order) {
      style.backgroundColor = "#77ED80";
    }
    return this.addNode(text, function () {
      if (m.precode != null) {
        m.precode();
      }
      _this.model.comparator = m.comparator;
      _this.model.sort();
      return _this.setOrder(m.text);
    }, {
      style: style
    });
  },


  getComparators: function getComparators() {
    var _this2 = this;

    var models = [];

    models.push({ text: "ID " + arrowUp, comparator: "id" });

    models.push({ text: "ID " + arrowDown, comparator: function comparator(a, b) {
        // auto converts to string for localeCompare
        return -("" + a.get("id")).localeCompare("" + b.get("id"), [], { numeric: true });
      } });

    models.push({ text: "Label " + arrowUp, comparator: "name" });

    models.push({ text: "Label " + arrowDown, comparator: function comparator(a, b) {
        return -a.get("name").localeCompare(b.get("name"));
      } });

    models.push({ text: "Seq " + arrowUp, comparator: "seq" });

    models.push({ text: "Seq " + arrowDown, comparator: function comparator(a, b) {
        return -a.get("seq").localeCompare(b.get("seq"));
      } });

    var setIdent = function setIdent() {
      return _this2.ident = _this2.g.stats.identity();
    };

    var setGaps = function setGaps() {
      _this2.gaps = {};
      return _this2.model.each(function (el) {
        var seq = el.attributes.seq;
        return _this2.gaps[el.id] = _.reduce(seq, function (memo, c) {
          return c === '-' ? ++memo : undefined;
        }, 0) / seq.length;
      });
    };

    models.push({ text: "Identity " + arrowUp, comparator: function comparator(a, b) {
        var val = _this2.ident[a.id] - _this2.ident[b.id];
        console.log(_this2.ident[a.id], _this2.ident[b.id]);
        if (val > 0) {
          return 1;
        }
        if (val < 0) {
          return -1;
        }
        return 0;
      }, precode: setIdent });

    models.push({ text: "Identity " + arrowDown, comparator: function comparator(a, b) {
        var val = _this2.ident[a.id] - _this2.ident[b.id];
        if (val > 0) {
          return -1;
        }
        if (val < 0) {
          return 1;
        }
        return 0;
      }, precode: setIdent });

    models.push({ text: "Gaps " + arrowUp, comparator: function comparator(a, b) {
        var val = _this2.gaps[a.id] - _this2.gaps[b.id];
        if (val > 0) {
          return 1;
        }
        if (val < 0) {
          return -1;
        }
        return 0;
      }, precode: setGaps });

    models.push({ text: "Gaps " + arrowDown, comparator: function comparator(a, b) {
        var val = _this2.gaps[a.id] - _this2.gaps[b.id];
        if (val < 0) {
          return 1;
        }
        if (val > 0) {
          return -1;
        }
        return 0;
      }, precode: setGaps });

    models.push({ text: "Consensus to top", comparator: function comparator(seq) {
        return !seq.get("ref");
      }
    });

    return models;
  }
});
exports.default = OrderingMenu;
},{"../menubuilder":87,"dom-helper":47,"underscore":154}],97:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _menubuilder = require("../menubuilder");

var _menubuilder2 = _interopRequireDefault(_menubuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SelectionMenu = _menubuilder2.default.extend({
  initialize: function initialize(data) {
    this.g = data.g;
    return this.el.style.display = "inline-block";
  },
  render: function render() {
    var _this = this;

    this.setName("Selection");
    this.addNode("Find Motif (supports RegEx)", function () {
      var search = prompt("your search", "D");
      return _this.g.user.set("searchText", search);
    });

    this.addNode("Invert columns", function () {
      return _this.g.selcol.invertCol(function () {
        var result = [];
        var end = this.model.getMaxLength();
        var i = 0;
        if (0 <= end) {
          while (i <= end) {
            result.push(i++);
          }
        } else {
          while (i >= end) {
            result.push(i--);
          }
        }
        return result;
      }());
    });
    this.addNode("Invert rows", function () {
      return _this.g.selcol.invertRow(_this.model.pluck("id"));
    });
    this.addNode("Reset", function () {
      return _this.g.selcol.reset();
    });
    this.el.appendChild(this.buildDOM());
    return this;
  }
});
exports.default = SelectionMenu;
},{"../menubuilder":87}],98:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _menubuilder = require("../menubuilder");

var _menubuilder2 = _interopRequireDefault(_menubuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dom = require("dom-helper");

var VisMenu = _menubuilder2.default.extend({

  initialize: function initialize(data) {
    this.g = data.g;
    this.el.style.display = "inline-block";
    return this.listenTo(this.g.vis, "change", this.render);
  },

  render: function render() {
    var _this = this;

    this.removeAllNodes();
    this.setName("Vis.elements");

    var visElements = this.getVisElements();
    for (var i = 0, visEl; i < visElements.length; i++) {
      visEl = visElements[i];
      this._addVisEl(visEl);
    }

    // other
    this.addNode("Reset", function () {
      _this.g.vis.set("labels", true);
      _this.g.vis.set("sequences", true);
      _this.g.vis.set("metacell", true);
      _this.g.vis.set("conserv", true);
      _this.g.vis.set("labelId", true);
      _this.g.vis.set("labelName", true);
      _this.g.vis.set("labelCheckbox", false);
      _this.g.vis.set("seqlogo", false);
      _this.g.vis.set("gapHeader", false);
      _this.g.vis.set("leftHeader", true);
      _this.g.vis.set("metaGaps", true);
      _this.g.vis.set("metaIdentity", true);
      return _this.g.vis.set("metaLinks", true);
    });

    // TODO: make more efficient
    dom.removeAllChilds(this.el);
    this.el.appendChild(this.buildDOM());
    return this;
  },

  _addVisEl: function _addVisEl(visEl) {
    var _this2 = this;

    var style = {};

    if (this.g.vis.get(visEl.id)) {
      var pre = "Hide ";
      style.color = "red";
    } else {
      pre = "Show ";
      style.color = "green";
    }

    return this.addNode(pre + visEl.name, function () {
      return _this2.g.vis.set(visEl.id, !_this2.g.vis.get(visEl.id));
    }, { style: style
    });
  },


  getVisElements: function getVisElements() {
    var vis = [];
    vis.push({ name: "residues indices", id: "markers" });
    vis.push({ name: "ID/Label", id: "labels" });
    //vis.push name: "Sequences", id: "sequences"
    vis.push({ name: "meta info (Gaps/Ident)", id: "metacell" });
    vis.push({ name: "overview panel", id: "overviewbox" });
    vis.push({ name: "sequence logo", id: "seqlogo" });
    vis.push({ name: "gap weights", id: "gapHeader" });
    vis.push({ name: "conservation weights", id: "conserv" });
    //vis.push name: "Left header", id: "leftHeader"
    vis.push({ name: "Label", id: "labelName" });
    vis.push({ name: "ID", id: "labelId" });
    //vis.push name: "Label checkbox", id: "labelCheckbox"
    vis.push({ name: "gaps %", id: "metaGaps" });
    vis.push({ name: "identity score", id: "metaIdentity" });
    // vis.push name: "Meta links", id: "metaLinks"
    return vis;
  }
});
exports.default = VisMenu;
},{"../menubuilder":87,"dom-helper":47}],99:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Model = require("backbone-thin").Model;
var Feature = Model.extend({

  defaults: { xStart: -1,
    xEnd: -1,
    height: -1,
    text: "",
    fillColor: "red",
    fillOpacity: 0.5,
    type: "rectangle",
    borderSize: 1,
    borderColor: "black",
    borderOpacity: 0.5,
    validate: true,
    row: 0
  },

  initialize: function initialize(obj) {
    if (obj.start != null) {
      // gff counts from 1 where MSA starts at 0
      // This fix that misalignment
      this.set("xStart", obj.start - 1);
    }
    if (obj.end != null) {
      this.set("xEnd", obj.end - 1);
    }
    // name has a predefined meaning
    if (obj.attributes != null) {
      if (obj.attributes.Name != null) {
        this.set("text", obj.attributes.Name);
      }
      if (obj.attributes.Color != null) {
        this.set("fillColor", obj.attributes.Color);
      }
    }

    if (this.attributes.xEnd < this.attributes.xStart) {
      console.warn("invalid feature range for", this.attributes);
    }

    if (!_.isNumber(this.attributes.xStart) || !_.isNumber(this.attributes.xEnd)) {
      console.warn("please provide numeric feature ranges", obj);
      // trying auto-casting
      this.set("xStart", parseInt(this.attributes.xStart));
      return this.set("xEnd", parseInt(this.attributes.xEnd));
    }
  },

  validate: function validate() {
    if (isNaN(this.attributes.xStart || isNaN(this.attributes.xEnd))) {
      return "features need integer start and end.";
    }
  },

  contains: function contains(index) {
    return this.attributes.xStart <= index && index <= this.attributes.xEnd;
  }
});
exports.default = Feature;
},{"backbone-thin":13}],100:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Feature = require("./Feature");
var Collection = require("backbone-thin").Collection;


var FeatureCol = Collection.extend({
  model: Feature,

  constructor: function constructor() {
    this.startOnCache = [];
    // invalidate cache
    this.on("all", function () {
      return this.startOnCache = [];
    }, this);
    return Collection.apply(this, arguments);
  },

  // returns all features starting on index
  startOn: function startOn(index) {
    if (!(this.startOnCache[index] != null)) {
      this.startOnCache[index] = this.where({ xStart: index });
    }
    return this.startOnCache[index];
  },

  contains: function contains(index) {
    return this.reduce(function (el, memo) {
      return memo || el.contains(index);
    }, false);
  },

  getFeatureOnRow: function getFeatureOnRow(row, x) {
    return this.filter(function (el) {
      return el.get("row") === row && el.get("xStart") <= x && x <= el.get("xEnd");
    });
  },

  // tries to auto-fit the rows
  // not a very efficient algorithm
  assignRows: function assignRows() {

    var len = this.max(function (el) {
      return el.get("xEnd");
    }).attributes.xEnd;
    var rows = function () {
      var result = [];
      for (var x = 0; 0 < len ? x <= len : x >= len; 0 < len ? x++ : x--) {
        result.push(0);
      }
      return result;
    }();

    this.each(function (el) {
      var max = 0;
      var start = el.get("xStart");
      var end = el.get("xEnd");
      for (var x = start; start < end ? x <= end : x >= end; start < end ? x++ : x--) {
        if (rows[x] > max) {
          max = rows[x];
        }
        rows[x]++;
      }
      return el.set("row", max);
    });

    return _underscore2.default.max(rows);
  },

  getCurrentHeight: function getCurrentHeight() {
    return this.max(function (el) {
      return el.get("row");
    }).attributes.row + 1;
  },

  // gives the minimal needed number of rows
  // not a very efficient algorithm
  // (there is one in O(n) )
  getMinRows: function getMinRows() {

    var len = this.max(function (el) {
      return el.get("xEnd");
    }).attributes.xEnd;
    var rows = function () {
      var result = [];
      for (var x = 0; 0 < len ? x <= len : x >= len; 0 < len ? x++ : x--) {
        result.push(0);
      }
      return result;
    }();

    this.each(function (el) {
      return function () {
        var result = [];
        var start = el.get("xStart");
        var end = el.get("xEnd");
        for (var x = start; start < end ? x <= end : x >= end; start < end ? x++ : x++) {
          result.push(rows[x]++);
        }
        return result;
      }();
    });

    return _underscore2.default.max(rows);
  }
});
exports.default = FeatureCol;
},{"./Feature":99,"backbone-thin":13,"underscore":154}],101:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Sequence = require("./Sequence");

var _Sequence2 = _interopRequireDefault(_Sequence);

var _FeatureCol = require("./FeatureCol");

var _FeatureCol2 = _interopRequireDefault(_FeatureCol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Collection = require("backbone-thin").Collection;

var SeqCollection = Collection.extend({
  model: _Sequence2.default,

  constructor: function constructor(seqs, g) {
    var _this = this;

    Collection.apply(this, arguments);
    this.g = g;

    this.on("add reset remove", function () {
      // invalidate cache
      _this.lengthCache = null;
      return _this._bindSeqsWithFeatures();
    }, this);

    // use the first seq as reference as default
    this.on("reset", function () {
      return _this._autoSetRefSeq();
    });
    this._autoSetRefSeq();

    this.lengthCache = null;

    this.features = {};
    return this;
  },

  // gives the max length of all sequences
  // (cached)
  getMaxLength: function getMaxLength() {
    if (this.models.length === 0) {
      return 0;
    }
    if (this.lengthCache === null) {
      this.lengthCache = this.max(function (seq) {
        return seq.get("seq").length;
      }).get("seq").length;
    }
    return this.lengthCache;
  },

  // gets the previous model
  // @param endless [boolean] for the first element
  // true: returns the last element, false: returns undefined
  prev: function prev(model, endless) {
    var index = this.indexOf(model) - 1;
    if (index < 0 && endless) {
      index = this.length - 1;
    }
    return this.at(index);
  },

  // gets the next model
  // @param endless [boolean] for the last element
  // true: returns the first element, false: returns undefined
  next: function next(model, endless) {
    var index = this.indexOf(model) + 1;
    if (index === this.length && endless) {
      index = 0;
    }
    return this.at(index);
  },

  // @returns n [int] number of hidden columns until n
  calcHiddenSeqs: function calcHiddenSeqs(n) {
    var nNew = n;
    for (var i = 0; 0 < nNew ? i <= nNew : i >= nNew; 0 < nNew ? i++ : i--) {
      if (this.at(i).get("hidden")) {
        nNew++;
      }
    }
    return nNew - n;
  },

  // you can add features independent to the current seqs as they may be added
  // later (lagging connection)
  addFeatures: function addFeatures(features) {
    var _this2 = this;

    if (features.config != null) {
      var obj = features;
      features = features.seqs;
      if (obj.config.colors != null) {
        var colors = obj.config.colors;
        _.each(features, function (seq) {
          return _.each(seq, function (val) {
            if (colors[val.feature] != null) {
              return val.fillColor = colors[val.feature];
            }
          });
        });
      }
    }
    if (_.isEmpty(this.features)) {
      this.features = features;
    } else {
      _.each(features, function (val, key) {
        if (!_this2.features.hasOwnProperty(key)) {
          return _this2.features[key] = val;
        } else {
          return _this2.features[key] = _.union(_this2.features[key], val);
        }
      });
    }
    // rehash
    return this._bindSeqsWithFeatures();
  },

  // adds features to a sequence
  _bindSeqWithFeatures: function _bindSeqWithFeatures(seq) {
    // TODO: probably we don't always want to bind to name
    var features = this.features[seq.attributes.name];
    if (features) {
      seq.set("features", new _FeatureCol2.default(features));
      seq.attributes.features.assignRows();
      return seq.set("height", seq.attributes.features.getCurrentHeight() + 1);
    }
  },

  // rehash the sequence feature binding
  _bindSeqsWithFeatures: function _bindSeqsWithFeatures() {
    var _this3 = this;

    return this.each(function (seq) {
      return _this3._bindSeqWithFeatures(seq);
    });
  },

  // removes all features from the cache (not from the seqs)
  removeAllFeatures: function removeAllFeatures() {
    return delete this.features;
  },

  _autoSetRefSeq: function _autoSetRefSeq() {
    if (this.length > 0) {
      return this.at(0).set("ref", true);
    }
  },

  // sets a sequence (e.g. BLAST start or consensus seq) as reference
  setRef: function setRef(seq) {
    var obj = this.get(seq);
    this.each(function (s) {
      if (seq.cid) {
        if (obj.cid === s.cid) {
          return s.set("ref", true);
        } else {
          return s.set("ref", false);
        }
      }
    });

    this.g.config.set("hasRef", true);
    return this.trigger("change:reference", seq);
  }
});
exports.default = SeqCollection;
},{"./FeatureCol":100,"./Sequence":102,"backbone-thin":13}],102:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _FeatureCol = require("./FeatureCol");

var _FeatureCol2 = _interopRequireDefault(_FeatureCol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Model = require("backbone-thin").Model;


var Sequence = Model.extend({

  defaults: {
    name: "",
    id: "",
    seq: "",
    height: 1,
    ref: false },

  // reference: the sequence used in BLAST or the consensus seq
  initialize: function initialize() {
    // residues without color
    this.set("grey", []);
    if (!(this.get("features") != null)) {
      return this.set("features", new _FeatureCol2.default());
    }
  }
});
exports.default = Sequence;
},{"./FeatureCol":100,"backbone-thin":13}],103:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Sequence = require("./Sequence");

Object.defineProperty(exports, "seq", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Sequence).default;
  }
});

var _SeqCollection = require("./SeqCollection");

Object.defineProperty(exports, "seqcol", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SeqCollection).default;
  }
});

var _Feature = require("./Feature");

Object.defineProperty(exports, "feature", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Feature).default;
  }
});

var _FeatureCol = require("./FeatureCol");

Object.defineProperty(exports, "featurecol", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_FeatureCol).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./Feature":99,"./FeatureCol":100,"./SeqCollection":101,"./Sequence":102}],104:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _SeqCollection = require("./model/SeqCollection");

var _SeqCollection2 = _interopRequireDefault(_SeqCollection);

var _colorscheme = require("./g/colorscheme");

var _colorscheme2 = _interopRequireDefault(_colorscheme);

var _columns = require("./g/columns");

var _columns2 = _interopRequireDefault(_columns);

var _config = require("./g/config");

var _config2 = _interopRequireDefault(_config);

var _package = require("./g/package");

var _package2 = _interopRequireDefault(_package);

var _SelectionCol = require("./g/selection/SelectionCol");

var _SelectionCol2 = _interopRequireDefault(_SelectionCol);

var _user = require("./g/user");

var _user2 = _interopRequireDefault(_user);

var _visibility = require("./g/visibility");

var _visibility2 = _interopRequireDefault(_visibility);

var _visOrdering = require("./g/visOrdering");

var _visOrdering2 = _interopRequireDefault(_visOrdering);

var _zoomer = require("./g/zoomer");

var _zoomer2 = _interopRequireDefault(_zoomer);

var _Stage = require("./views/Stage");

var _Stage2 = _interopRequireDefault(_Stage);

var _file = require("./utils/file");

var _file2 = _interopRequireDefault(_file);

var _tree = require("./utils/tree");

var _tree2 = _interopRequireDefault(_tree);

var _proxy = require("./utils/proxy");

var _proxy2 = _interopRequireDefault(_proxy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// MV from backbone
// models
var boneView = require("backbone-childs");

// globals

var Eventhandler = require("biojs-events");

// MSA views


// statistics
var Stats = require("stat.seqs");

// utils
var $ = require("jbone");


// opts is a dictionary consisting of
// @param el [String] id or reference to a DOM element
// @param seqs [SeqArray] Array of sequences for initlization
// @param conf [Dict] user config
// @param vis [Dict] config of visible views
// @param zoomer [Dict] display settings like columnWidth
var MSA = boneView.extend({

  initialize: function initialize(data) {
    var _this = this;

    if (!(typeof data !== "undefined" && data !== null)) {
      data = {};
    }
    // check for default arrays
    if (!(data.colorscheme != null)) {
      data.colorscheme = {};
    }
    if (!(data.columns != null)) {
      data.columns = {};
    }
    if (!(data.conf != null)) {
      data.conf = {};
    }
    if (!(data.vis != null)) {
      data.vis = {};
    }
    if (!(data.visorder != null)) {
      data.visorder = {};
    }
    if (!(data.zoomer != null)) {
      data.zoomer = {};
    }
    if (!(data.conserv != null)) {
      data.conserv = {};
    }

    // g is our global Mediator
    this.g = Eventhandler.mixin({});

    // load seqs and add subviews
    this.seqs = this.g.seqs = new _SeqCollection2.default(data.seqs, this.g);

    // populate it and init the global models
    this.g.config = new _config2.default(data.conf);
    this.g.package = new _package2.default(this.g);
    this.g.selcol = new _SelectionCol2.default([], { g: this.g });
    this.g.user = new _user2.default();
    this.g.vis = new _visibility2.default(data.vis, { model: this.seqs });
    this.g.visorder = new _visOrdering2.default(data.visorder);
    this.g.zoomer = new _zoomer2.default(data.zoomer, { g: this.g, model: this.seqs });

    // store config options for plugins
    this.g.conservationConfig = data.conserv;

    // debug mode
    if (window.location.hostname === "localhost") {
      this.g.config.set("debug", true);
    }

    this._loadSeqs(data);

    // utils
    this.u = {};
    this.u.file = new _file2.default(this);
    this.u.proxy = new _proxy2.default({ g: this.g });
    this.u.tree = new _tree2.default(this);

    if (this.g.config.get("eventBus") === true) {
      this.startEventBus();
    }

    if (this.g.config.get("dropImport")) {
      var events = { "dragover": this.dragOver,
        "drop": this.dropFile
      };
      this.delegateEvents(events);
    }

    if (data.importURL) {
      this.u.file.importURL(data.importURL, function () {
        return _this.render();
      });
    }

    if (data.bootstrapMenu) {
      // pass menu configuration to defaultmenu
      if (data.menu) {
        this.menuConfig = data.menu;
      }
      this.g.config.set("bootstrapMenu", true);
    }

    this.draw();
    // add models to the msa (convenience)
    return this.m();
  },

  _loadSeqs: function _loadSeqs(data) {
    // stats
    var pureSeq = this.seqs.pluck("seq");
    this.g.stats = new Stats(this.seqs, { useGaps: true });
    this.g.stats.alphabetSize = this.g.config.get("alphabetSize");
    this.g.columns = new _columns2.default(data.columns, this.g.stats); // for action on the columns like hiding

    // depending config
    this.g.colorscheme = new _colorscheme2.default(data.colorscheme, pureSeq, this.g.stats);

    // more init
    return this.g.zoomer.setEl(this.el, this.seqs);
  },

  // proxy to the utility package
  importURL: function importURL() {
    return this.u.file.importURL.apply(this.u.file, arguments);
  },

  // add models to the msa (convenience)
  m: function m() {
    var m = {};
    m.model = require("./model");
    m.selection = require("./g/selection/Selection");
    m.selcol = require("./g/selection/SelectionCol");
    m.view = require("backbone-viewj");
    m.boneView = require("backbone-childs");
    return this.m = m;
  },

  draw: function draw() {
    var _this2 = this;

    this.removeViews();

    this.addView("stage", new _Stage2.default({ model: this.seqs, g: this.g }));
    this.el.setAttribute("class", "biojs_msa_div");

    // bootstraps the menu bar by default -> destroys modularity
    if (this.g.config.get("bootstrapMenu")) {
      var menuDiv = document.createElement('div');
      var wrapperDiv = document.createElement('div');
      if (!this.el.parentNode) {
        wrapperDiv.appendChild(menuDiv);
        wrapperDiv.appendChild(this.el);
      } else {
        this.el.parentNode.replaceChild(wrapperDiv, this.el);
        wrapperDiv.appendChild(menuDiv);
        wrapperDiv.appendChild(this.el);
      }

      var bootstrapOpts = { el: menuDiv,
        msa: this
      };
      if (this.menuConfig) {
        bootstrapOpts.menu = this.menuConfig;
      }
      var defMenu = new msa.menu.defaultmenu(bootstrapOpts);
      defMenu.render();
    }

    return $(window).on("resize", function (e) {
      var f = function f() {
        return this.g.zoomer.autoResize();
      };
      return setTimeout(f.bind(_this2), 5);
    });
  },

  dragOver: function dragOver(e) {
    // prevent the normal browser actions
    e.preventDefault();
    e.target.className = 'hover';
    return false;
  },

  dropFile: function dropFile(e) {
    e.preventDefault();
    var files = e.target.files || e.dataTransfer.files;
    this.u.file.importFiles(files);
    return false;
  },

  startEventBus: function startEventBus() {
    var _this3 = this;

    var busObjs = ["config", "columns", "colorscheme", "selcol", "vis", "visorder", "zoomer"];
    return function () {
      var result = [];
      for (var i = 0, key; i < busObjs.length; i++) {
        key = busObjs[i];
        result.push(_this3._proxyToG(key));
      }
      return result;
    }();
  },


  _proxyToG: function _proxyToG(key) {
    return this.listenTo(this.g[key], "all", function (name, prev, now, opts) {
      // suppress duplicate events
      if (name === "change") {
        return;
      }
      // backbone uses the second argument for the next value -> swap
      if (typeof opts !== "undefined" && opts !== null) {
        return this.g.trigger(key + ":" + name, now, prev, opts);
      } else {
        return this.g.trigger(key + ":" + name, now, prev);
      }
    });
  },

  render: function render() {
    if (this.seqs === undefined || this.seqs.length === 0) {
      console.log("warning. empty seqs.");
    }
    this.renderSubviews();
    this.g.vis.set("loaded", true);
    return this;
  }
});
exports.default = MSA;
},{"./g/colorscheme":75,"./g/columns":76,"./g/config":77,"./g/package":78,"./g/selection/Selection":79,"./g/selection/SelectionCol":80,"./g/user":81,"./g/visOrdering":82,"./g/visibility":83,"./g/zoomer":84,"./model":103,"./model/SeqCollection":101,"./utils/file":107,"./utils/proxy":110,"./utils/tree":113,"./views/Stage":117,"backbone-childs":8,"backbone-viewj":15,"biojs-events":16,"jbone":51,"stat.seqs":137}],105:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// math utilities

var BMath = function () {
  function BMath() {
    _classCallCheck(this, BMath);
  }

  _createClass(BMath, null, [{
    key: "randomInt",
    value: function randomInt(lower, upper) {
      // Called with one argument
      if (!(typeof upper !== "undefined" && upper !== null)) {
        var _ref = [0, lower];
        lower = _ref[0];
        upper = _ref[1];
      }
      // Lower must be less then upper
      if (lower > upper) {
        var _ref2 = [upper, lower];
        lower = _ref2[0];
        upper = _ref2[1];
      }
      // Last statement is a return value
      return Math.floor(Math.random() * (upper - lower + 1) + lower);
    }

    // @return [Integer] random id

  }, {
    key: "uniqueId",
    value: function uniqueId() {
      var length = arguments.length <= 0 || arguments[0] === undefined ? 8 : arguments[0];

      var id = "";
      while (id.length < length) {
        id += Math.random().toString(36).substr(2);
      }
      return id.substr(0, length);
    }

    // Returns a random integer between min (inclusive) and max (inclusive)

  }, {
    key: "getRandomInt",
    value: function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }]);

  return BMath;
}();

exports.default = BMath;
;
},{}],106:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Fasta = require("biojs-io-fasta");
var GFF = require("biojs-io-gff");
var xhr = require("xhr");
var blobURL = require("blueimp_canvastoblob");
var saveAs = require("browser-saveas");
var _ = require("underscore");

var Exporter = { openInJalview: function openInJalview(url, colorscheme) {
    if (url.charAt(0) === '.') {
      // relative urls
      url = document.URL.substr(0, document.URL.lastIndexOf('/')) + "/" + url;
    }

    // check whether this is a local url
    if (url.indexOf("http") < 0) {
      // append host and hope for the best
      var host = "http://" + window.location.hostname;
      url = host + url;
    }

    url = encodeURIComponent(url);
    var jalviewUrl = "http://www.jalview.org/services/launchApp?open=" + url;
    jalviewUrl += "&colour=" + colorscheme;
    return window.open(jalviewUrl, '_blank');
  },

  publishWeb: function publishWeb(that, cb) {
    var text = Fasta.write(that.seqs.toJSON());
    text = encodeURIComponent(text);
    var url = "http://sprunge.biojs.net";
    return xhr({
      method: "POST",
      body: "sprunge=" + text,
      uri: url,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }, function (err, rep, body) {
      var link = body.trim();
      return cb(link);
    });
  },

  shareLink: function shareLink(that, cb) {
    var url = that.g.config.get("importURL");
    var msaURL = "http://msa.biojs.net/app/?seq=";
    var fCB = function fCB(link) {
      var fURL = msaURL + link;
      if (cb) {
        return cb(fURL);
      }
    };
    if (!url) {
      return Exporter.publishWeb(that, fCB);
    } else {
      return fCB(url);
    }
  },

  saveAsFile: function saveAsFile(that, name) {
    // limit at about 256k
    var text = Fasta.write(that.seqs.toJSON());
    var blob = new Blob([text], { type: 'text/plain' });
    return saveAs(blob, name);
  },

  saveSelection: function saveSelection(that, name) {
    var selection = that.g.selcol.pluck("seqId");
    console.log(selection);
    if (selection.length > 0) {
      // filter those seqids
      selection = that.seqs.filter(function (el) {
        return _.contains(selection, el.get("id"));
      });
      var end = selection.length - 1;
      for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
        selection[i] = selection[i].toJSON();
      }
    } else {
      selection = that.seqs.toJSON();
      console.warn("no selection found");
    }
    var text = Fasta.write(selection);
    var blob = new Blob([text], { type: 'text/plain' });
    return saveAs(blob, name);
  },

  saveAnnots: function saveAnnots(that, name) {
    var features = that.seqs.map(function (el) {
      features = el.get("features");
      if (features.length === 0) {
        return;
      }
      var seqname = el.get("name");
      features.each(function (s) {
        return s.set("seqname", seqname);
      });
      return features.toJSON();
    });
    features = _.flatten(_.compact(features));
    console.log(features);
    var text = GFF.exportLines(features);
    var blob = new Blob([text], { type: 'text/plain' });
    return saveAs(blob, name);
  },

  saveAsImg: function saveAsImg(that, name) {
    // TODO: this is very ugly
    var canvas = that.getView('stage').getView('body').getView('seqblock').el;
    if (typeof canvas !== "undefined" && canvas !== null) {
      var url = canvas.toDataURL('image/png');
      return saveAs(blobURL(url), name, "image/png");
    }
  }
};
exports.default = Exporter;
},{"biojs-io-fasta":"biojs-io-fasta","biojs-io-gff":20,"blueimp_canvastoblob":43,"browser-saveas":44,"underscore":154,"xhr":134}],107:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var FastaReader = require("biojs-io-fasta");
var ClustalReader = require("biojs-io-clustal");
var GffReader = require("biojs-io-gff");
var _ = require("underscore");
var xhr = require("xhr");

var FileHelper = function FileHelper(msa) {
  this.msa = msa;
  return this;
};

var funs = { guessFileType: function guessFileType(name) {
    name = name.split(".");
    var fileName = name[name.length(-1)];
    switch (fileName) {
      case "aln":case "clustal":
        return ClustalReader;break;
      case "fasta":
        return FastaReader;break;
      default:
        return FastaReader;
    }
  },

  guessFileFromText: function guessFileFromText(text) {
    if (!(typeof text !== "undefined" && text !== null)) {
      console.warn("invalid file format");
      return ["", "error"];
    }
    if (text.substring(0, 7) === "CLUSTAL") {
      var reader = ClustalReader;
      var type = "seqs";
    } else if (text.substring(0, 1) === ">") {
      reader = FastaReader;
      type = "seqs";
    } else if (text.substring(0, 1) === "(") {
      type = "newick";
    } else {
      reader = GffReader;
      type = "features";
    }
    //console.warn "Unknown format. Contact greenify"
    return [reader, type];
  },

  parseText: function parseText(text) {
    var _guessFileFromText = this.guessFileFromText(text);

    var _guessFileFromText2 = _slicedToArray(_guessFileFromText, 2);

    var reader = _guessFileFromText2[0];
    var type = _guessFileFromText2[1];

    if (type === "seqs") {
      var seqs = reader.parse(text);
      return [seqs, type];
    } else if (type === "features") {
      var features = reader.parseSeqs(text);
      return [features, type];
    } else {
      return [text, type];
    }
  },

  importFiles: function importFiles(files) {
    var _this = this;

    return function () {
      var result = [];
      var end = files.length - 1;
      for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
        var file = files[i];
        var reader = new FileReader();
        reader.onload = function (evt) {
          return _this.importFile(evt.target.result);
        };
        result.push(reader.readAsText(file));
      }
      return result;
    }();
  },

  importFile: function importFile(file) {
    var _this2 = this;

    var fileName;

    var _parseText = this.parseText(file);

    var _parseText2 = _slicedToArray(_parseText, 2);

    var objs = _parseText2[0];
    var type = _parseText2[1];

    if (type === "error") {
      return "error";
    }
    if (type === "seqs") {
      this.msa.seqs.reset(objs);
      this.msa.g.config.set("url", "userimport");
      this.msa.g.trigger("url:userImport");
    } else if (type === "features") {
      this.msa.seqs.addFeatures(objs);
    } else if (type === "newick") {
      this.msa.u.tree.loadTree(function () {
        return _this2.msa.u.tree.showTree(file);
      });
    }

    return fileName = file.name;
  },

  importURL: function importURL(url, cb) {
    var _this3 = this;

    url = this.msa.u.proxy.corsURL(url);
    this.msa.g.config.set("url", url);
    return xhr({
      url: url,
      timeout: 0
    }, function (err, status, body) {
      if (!err) {
        var res = _this3.importFile(body);
        if (res === "error") {
          return;
        }
        _this3.msa.g.trigger("import:url", url);
        if (cb) {
          return cb();
        }
      } else {
        return console.log(err);
      }
    });
  }
};

_.extend(FileHelper.prototype, funs);
exports.default = FileHelper;
},{"biojs-io-clustal":17,"biojs-io-fasta":"biojs-io-fasta","biojs-io-gff":20,"underscore":154,"xhr":134}],108:[function(require,module,exports){
"use strict";

module.exports.bmath = require("./bmath");
module.exports.proxy = require("./proxy");
module.exports.seqgen = require("./seqgen");
module.exports.file = require("./file");
module.exports.export = require("./export");
},{"./bmath":105,"./export":106,"./file":107,"./proxy":110,"./seqgen":111}],109:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var k = require("koala-js");

var Loader =

// asynchronously require a script
{ loadScript: function loadScript(url, cb) {
    var s = k.mk("script");
    s.type = "text/javascript";
    s.src = url;
    s.async = true;
    s.onload = s.onreadystatechange = function () {
      if (!r && (!this.readyState || this.readyState === "complete")) {
        var r = true;
        return cb();
      }
    };
    var t = document.getElementsByTagName("script")[0];
    return t.parentNode.appendChild(s);
  },

  // joins multiple callbacks into one callback
  // a bit like Promise.all - but for callbacks
  joinCb: function joinCb(retCb, finalLength, finalScope) {
    finalLength = finalLength || 1;
    var cbsFinished = 0;

    var callbackWrapper = function callbackWrapper(cb, scope) {
      if (!(typeof cb !== "undefined" && cb !== null)) {
        // directly called (without cb)
        return counter();
      } else {
        return function () {
          var ref;
          if (ref = "apply", cb.indexOf(ref) >= 0) {
            cb.apply(scope, arguments);
          }
          return counter();
        };
      }
    };

    var counter = function counter() {
      cbsFinished++;
      if (cbsFinished === finalLength) {
        return retCb.call(finalScope);
      }
    };

    return callbackWrapper;
  }
};
exports.default = Loader;
},{"koala-js":53}],110:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _ = require("underscore");

var ProxyHelper = function ProxyHelper(opts) {
  this.g = opts.g;
  return this;
};

var proxyFun = { corsURL: function corsURL(url) {
    // do not filter on localhost
    if (document.URL.indexOf('localhost') >= 0 && url[0] === "/") {
      return url;
    }
    if (url.charAt(0) === "." || url.charAt(0) === "/") {
      return url;
    }

    // DEPRECATED as crossorigin.me requires http
    // remove www + http
    //url = url.replace("www\.", "");

    if (this.g.config.get('importProxyStripHttp')) {
      url = url.replace("http://", "");
      url = url.replace("https://", "");
    }

    // prepend proxy
    url = this.g.config.get('importProxy') + url;
    return url;
  }
};

_.extend(ProxyHelper.prototype, proxyFun);
exports.default = ProxyHelper;
},{"underscore":154}],111:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bmath = require("./bmath");

var _bmath2 = _interopRequireDefault(_bmath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Sequence = require("biojs-model").seq;

var Stat = require("stat.seqs");

var SeqGen = { _generateSequence: function _generateSequence(len) {
    var text = "";
    var end = len - 1;
    for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
      text += seqgen.getRandomChar();
    }
    return text;
  },

  // generates a dummy sequences
  // @param len [int] number of generated sequences
  // @param seqLen [int] length of the generated sequences
  getDummySequences: function getDummySequences(len, seqLen) {
    var seqs = [];
    if (!(typeof len !== "undefined" && len !== null)) {
      len = _bmath2.default.getRandomInt(3, 5);
    }
    if (!(typeof seqLen !== "undefined" && seqLen !== null)) {
      seqLen = _bmath2.default.getRandomInt(50, 200);
    }

    for (var i = 1; 1 < len ? i <= len : i >= len; 1 < len ? i++ : i--) {
      seqs.push(new Sequence(seqgen._generateSequence(seqLen), "seq" + i, "r" + i));
    }
    return seqs;
  },

  getRandomChar: function getRandomChar(dict) {
    var possible = dict || "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return possible.charAt(Math.floor(Math.random() * possible.length));
  },

  // generates a dummy sequences
  // @param len [int] number of generated sequences
  // @param seqLen [int] length of the generated sequences
  genConservedSequences: function genConservedSequences(len, seqLen, dict) {
    var seqs = [];
    if (!(typeof len !== "undefined" && len !== null)) {
      len = _bmath2.default.getRandomInt(3, 5);
    }
    if (!(typeof seqLen !== "undefined" && seqLen !== null)) {
      seqLen = _bmath2.default.getRandomInt(50, 200);
    }

    dict = dict || "ACDEFGHIKLMNPQRSTVWY---";

    for (var i = 1; 1 < len ? i <= len : i >= len; 1 < len ? i++ : i--) {
      seqs[i - 1] = "";
    }

    var tolerance = 0.2;

    var conservAim = 1;
    var end = seqLen - 1;
    for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
      if (i % 3 === 0) {
        conservAim = _bmath2.default.getRandomInt(50, 100) / 100;
      }
      var observed = [];
      var end1 = len - 1;
      for (var j = 0; 0 < end1 ? j <= end1 : j >= end1; 0 < end1 ? j++ : j--) {
        var counter = 0;
        while (counter < 100) {
          var c = seqgen.getRandomChar(dict);
          var cConserv = Stat(observed);
          cConserv.addSeq(c);
          counter++;
          if (Math.abs(conservAim - cConserv.scale(cConserv.conservation())[0]) < tolerance) {
            break;
          }
        }
        seqs[j] += c;
        observed.push(c);
      }
    }

    var pseqs = [];
    for (var i = 1; 1 < len ? i <= len : i >= len; 1 < len ? i++ : i--) {
      pseqs.push(new Sequence(seqs[i - 1], "seq" + i, "r" + i));
    }

    return pseqs;
  }
};
exports.default = SeqGen;
},{"./bmath":105,"biojs-model":26,"stat.seqs":137}],112:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// mini svg helper

var svgns = "http://www.w3.org/2000/svg";

var setAttr = function setAttr(obj, opts) {
  for (var name in opts) {
    var value = opts[name];
    obj.setAttributeNS(null, name, value);
  }
  return obj;
};

var Base = function Base(opts) {
  var svg = document.createElementNS(svgns, 'svg');
  svg.setAttribute("width", opts.width);
  svg.setAttribute("height", opts.height);
  return svg;
};

var Rect = function Rect(opts) {
  var rect = document.createElementNS(svgns, 'rect');
  return setAttr(rect, opts);
};

var Line = function Line(opts) {
  var line = document.createElementNS(svgns, 'line');
  return setAttr(line, opts);
};

var Polygon = function Polygon(opts) {
  var line = document.createElementNS(svgns, 'polygon');
  return setAttr(line, opts);
};

exports.base = Base;
exports.line = Line;
exports.rect = Rect;
exports.polygon = Polygon;
},{}],113:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _SeqCollection = require("../model/SeqCollection");

var _SeqCollection2 = _interopRequireDefault(_SeqCollection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require("underscore");


var TreeHelper = function TreeHelper(msa) {
  this.msa = msa;
  return this;
};

var tf = { loadTree: function loadTree(cb) {
    return this.msa.g.package.loadPackages(["msa-tnt", "biojs-io-newick"], cb);
  },

  showTree: function showTree(newickStr) {
    var newick = this.require("biojs-io-newick");
    if (typeof newickStr === "string") {
      var newickObj = newick.parse_newick(newickStr);
    } else {
      newickObj = newickStr;
    }

    var mt = this.require("msa-tnt");

    var sel = new mt.selections();
    var treeDiv = document.createElement("div");
    //   @msa.el.insertBefore treeDiv, @msa.el.childNodes[0]
    this.msa.el.appendChild(treeDiv);

    console.log(this.msa.seqs.models);
    console.log(newickObj);

    var nodes = mt.app({
      seqs: this.msa.seqs.toJSON(),
      tree: newickObj
    });

    console.log("nodes", nodes);

    var t = new mt.adapters.tree({
      model: nodes,
      el: treeDiv,
      sel: sel
    });

    //treeDiv.style.width = "500px"

    // construct msa in a virtual dom
    var m = new mt.adapters.msa({
      model: nodes,
      sel: sel,
      msa: this.msa
    });

    // remove top collection
    _.each(nodes.models, function (e) {
      delete e.collection;
      return Object.setPrototypeOf(e, require("backbone-thin").Model.prototype);
    });

    this.msa.seqs.reset(nodes.models);
    //@msa.draw()
    //@msa.render()
    return console.log(this.msa.seqs);
  },

  // workaround against browserify's static analysis
  require: function (_require) {
    function require(_x) {
      return _require.apply(this, arguments);
    }

    require.toString = function () {
      return _require.toString();
    };

    return require;
  }(function (pkg) {
    return require(pkg);
  })
};

_.extend(TreeHelper.prototype, tf);
exports.default = TreeHelper;
},{"../model/SeqCollection":101,"backbone-thin":13,"underscore":154}],114:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CanvasSeqBlock = require("./canvas/CanvasSeqBlock");

var _CanvasSeqBlock2 = _interopRequireDefault(_CanvasSeqBlock);

var _LabelBlock = require("./labels/LabelBlock");

var _LabelBlock2 = _interopRequireDefault(_LabelBlock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var boneView = require("backbone-childs");


var View = boneView.extend({

  initialize: function initialize(data) {
    this.g = data.g;

    if (true) {
      var labelblock = new _LabelBlock2.default({ model: this.model, g: this.g });
      labelblock.ordering = -1;
      this.addView("labelblock", labelblock);
    }

    if (this.g.vis.get("sequences")) {
      var seqblock = new _CanvasSeqBlock2.default({ model: this.model, g: this.g });
      seqblock.ordering = 0;
      this.addView("seqblock", seqblock);
    }

    this.listenTo(this.g.zoomer, "change:alignmentHeight", this.adjustHeight);
    this.listenTo(this.g.zoomer, "change:alignmentWidth", this.adjustWidth);
    return this.listenTo(this.g.columns, "change:hidden", this.adjustHeight);
  },

  render: function render() {
    this.renderSubviews();
    this.el.className = "biojs_msa_albody";
    this.el.style.whiteSpace = "nowrap";
    this.adjustHeight();
    this.adjustWidth();
    return this;
  },

  adjustHeight: function adjustHeight() {
    if (this.g.zoomer.get("alignmentHeight") === "auto") {
      // TODO: fix the magic 5
      return this.el.style.height = this.g.zoomer.get("rowHeight") * this.model.length + 5;
    } else {
      return this.el.style.height = this.g.zoomer.get("alignmentHeight");
    }
  },

  adjustWidth: function adjustWidth() {
    // TODO: 15 is the width of the scrollbar
    return this.el.style.width = this.getWidth();
  },

  getWidth: function getWidth() {
    var width = 0;
    width += this.g.zoomer.getLeftBlockWidth();
    if (this.g.vis.get("sequences")) {
      width += this.g.zoomer.get("alignmentWidth");
    }
    return width;
  }
});
exports.default = View;
},{"./canvas/CanvasSeqBlock":121,"./labels/LabelBlock":130,"backbone-childs":8}],115:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Selection = require("../g/selection/Selection");

var _Selection2 = _interopRequireDefault(_Selection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var view = require("backbone-viewj");
var mouse = require("mouse-pos");
var jbone = require("jbone");
var _ = require("underscore");


var OverviewBox = view.extend({

  className: "biojs_msa_overviewbox",
  tagName: "canvas",

  initialize: function initialize(data) {
    this.g = data.g;
    this.listenTo(this.g.zoomer, "change:boxRectWidth change:boxRectHeight change:overviewboxPaddingTop", this.rerender);
    this.listenTo(this.g.selcol, "add reset change", this.rerender);
    this.listenTo(this.g.columns, "change:hidden", this.rerender);
    this.listenTo(this.g.colorscheme, "change:showLowerCase", this.rerender);
    this.listenTo(this.model, "change", _.debounce(this.rerender, 5));

    // color
    this.color = this.g.colorscheme.getSelectedScheme();
    this.listenTo(this.g.colorscheme, "change:scheme", function () {
      this.color = this.g.colorscheme.getSelectedScheme();
      return this.rerender();
    });
    return this.dragStart = [];
  },

  events: { click: "_onclick",
    mousedown: "_onmousedown"
  },

  rerender: function rerender() {
    if (!this.g.config.get("manualRendering")) {
      return this.render();
    }
  },

  render: function render() {
    this._createCanvas();
    this.el.textContent = "overview";
    this.el.style.marginTop = this.g.zoomer.get("overviewboxPaddingTop");

    // background bg for non-drawed area
    this.ctx.fillStyle = "#999999";
    this.ctx.fillRect(0, 0, this.el.width, this.el.height);

    var rectWidth = this.g.zoomer.get("boxRectWidth");
    var rectHeight = this.g.zoomer.get("boxRectHeight");
    var hidden = this.g.columns.get("hidden");
    var showLowerCase = this.g.colorscheme.get("showLowerCase");

    var y = -rectHeight;
    var end = this.model.length - 1;
    for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
      var seq = this.model.at(i).get("seq");
      var x = 0;
      y = y + rectHeight;
      if (this.model.at(i).get("hidden")) {
        // hidden seq
        console.log(this.model.at(i).get("hidden"));
        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(0, y, seq.length * rectWidth, rectHeight);
        continue;
      }

      var end1 = seq.length - 1;
      for (var j = 0; 0 < end1 ? j <= end1 : j >= end1; 0 < end1 ? j++ : j--) {
        var c = seq[j];
        // todo: optional uppercasing
        if (showLowerCase) {
          c = c.toUpperCase();
        }
        var color = this.color.getColor(c, { pos: j });

        if (hidden.indexOf(j) >= 0) {
          color = "grey";
        }

        if (typeof color !== "undefined" && color !== null) {
          this.ctx.fillStyle = color;
          this.ctx.fillRect(x, y, rectWidth, rectHeight);
        }

        x = x + rectWidth;
      }
    }

    return this._drawSelection();
  },

  _drawSelection: function _drawSelection() {
    // hide during selection
    if (this.dragStart.length > 0 && !this.prolongSelection) {
      return;
    }

    var rectWidth = this.g.zoomer.get("boxRectWidth");
    var rectHeight = this.g.zoomer.get("boxRectHeight");
    var maxHeight = rectHeight * this.model.length;
    this.ctx.fillStyle = "#666666";
    this.ctx.globalAlpha = 0.9;
    var end = this.g.selcol.length - 1;
    for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
      var sel = this.g.selcol.at(i);
      if (!sel) continue;
      if (sel.get('type') === 'column') {
        this.ctx.fillRect(rectWidth * sel.get('xStart'), 0, rectWidth * (sel.get('xEnd') - sel.get('xStart') + 1), maxHeight);
      } else if (sel.get('type') === 'row') {
        var seq = this.model.filter(function (el) {
          return el.get('id') === sel.get('seqId');
        })[0];
        var pos = this.model.indexOf(seq);
        this.ctx.fillRect(0, rectHeight * pos, rectWidth * seq.get('seq').length, rectHeight);
      } else if (sel.get('type') === 'pos') {
        seq = this.model.filter(function (el) {
          return el.get('id') === sel.get('seqId');
        })[0];
        pos = this.model.indexOf(seq);
        this.ctx.fillRect(rectWidth * sel.get('xStart'), rectHeight * pos, rectWidth * (sel.get('xEnd') - sel.get('xStart') + 1), rectHeight);
      }
    }

    return this.ctx.globalAlpha = 1;
  },

  _onclick: function _onclick(evt) {
    return this.g.trigger("meta:click", { seqId: this.model.get("id", { evt: evt }) });
  },

  _onmousemove: function _onmousemove(e) {
    // duplicate events
    if (this.dragStart.length === 0) {
      return;
    }

    this.render();
    this.ctx.fillStyle = "#666666";
    this.ctx.globalAlpha = 0.9;

    var rect = this._calcSelection(mouse.abs(e));
    this.ctx.fillRect(rect[0][0], rect[1][0], rect[0][1] - rect[0][0], rect[1][1] - rect[1][0]);

    // abort selection events of the browser
    e.preventDefault();
    return e.stopPropagation();
  },

  // start the selection mode
  _onmousedown: function _onmousedown(e) {
    var _this = this;

    this.dragStart = mouse.abs(e);
    this.dragStartRel = mouse.rel(e);

    if (e.ctrlKey || e.metaKey) {
      this.prolongSelection = true;
    } else {
      this.prolongSelection = false;
    }
    // enable global listeners
    jbone(document.body).on('mousemove.overmove', function (e) {
      return _this._onmousemove(e);
    });
    jbone(document.body).on('mouseup.overup', function (e) {
      return _this._onmouseup(e);
    });
    return this.dragStart;
  },

  // calculates the current selection
  _calcSelection: function _calcSelection(dragMove) {
    // relative to first click
    var dragRel = [dragMove[0] - this.dragStart[0], dragMove[1] - this.dragStart[1]];

    // relative to target
    for (var i = 0; i <= 1; i++) {
      dragRel[i] = this.dragStartRel[i] + dragRel[i];
    }

    // 0:x, 1: y
    var rect = [[this.dragStartRel[0], dragRel[0]], [this.dragStartRel[1], dragRel[1]]];

    // swap the coordinates if needed
    for (var i = 0; i <= 1; i++) {
      if (rect[i][1] < rect[i][0]) {
        rect[i] = [rect[i][1], rect[i][0]];
      }

      // lower limit
      rect[i][0] = Math.max(rect[i][0], 0);
    }

    return rect;
  },

  _endSelection: function _endSelection(dragEnd) {
    // remove listeners
    jbone(document.body).off('.overmove');
    jbone(document.body).off('.overup');

    // duplicate events
    if (this.dragStart.length === 0) {
      return;
    }

    var rect = this._calcSelection(dragEnd);

    // x
    for (var i = 0; i <= 1; i++) {
      rect[0][i] = Math.floor(rect[0][i] / this.g.zoomer.get("boxRectWidth"));
    }

    // y
    for (var i = 0; i <= 1; i++) {
      rect[1][i] = Math.floor(rect[1][i] / this.g.zoomer.get("boxRectHeight"));
    }

    // upper limit
    rect[0][1] = Math.min(this.model.getMaxLength() - 1, rect[0][1]);
    rect[1][1] = Math.min(this.model.length - 1, rect[1][1]);

    // select
    var selis = [];
    for (var j = rect[1][0]; rect[1][0] < rect[1][1] ? j <= rect[1][1] : j >= rect[1][1]; rect[1][0] < rect[1][1] ? j++ : j--) {
      var args = { seqId: this.model.at(j).get('id'), xStart: rect[0][0], xEnd: rect[0][1] };
      selis.push(new _Selection2.default.possel(args));
    }

    // reset
    this.dragStart = [];
    // look for ctrl key
    if (this.prolongSelection) {
      this.g.selcol.add(selis);
    } else {
      this.g.selcol.reset(selis);
    }

    // safety check + update offset
    this.g.zoomer.setLeftOffset(rect[0][0]);
    return this.g.zoomer.setTopOffset(rect[1][0]);
  },

  // ends the selection mode
  _onmouseup: function _onmouseup(e) {
    return this._endSelection(mouse.abs(e));
  },

  _onmouseout: function _onmouseout(e) {
    return this._endSelection(mouse.abs(e));
  },

  // init the canvas
  _createCanvas: function _createCanvas() {
    var rectWidth = this.g.zoomer.get("boxRectWidth");
    var rectHeight = this.g.zoomer.get("boxRectHeight");

    this.el.height = this.model.length * rectHeight;
    this.el.width = this.model.getMaxLength() * rectWidth;
    this.ctx = this.el.getContext("2d");
    this.el.style.overflow = "scroll";
    return this.el.style.cursor = "crosshair";
  }
});
exports.default = OverviewBox;
},{"../g/selection/Selection":79,"backbone-viewj":15,"jbone":51,"mouse-pos":56,"underscore":154}],116:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Selection = require('../g/selection/Selection');

var _Selection2 = _interopRequireDefault(_Selection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var boneView = require("backbone-childs");
var _ = require('underscore');
var k = require('koala-js');
var dom = require('dom-helper');


// this is a very simplistic approach to show search result
// TODO: needs proper styling
var View = boneView.extend({

  initialize: function initialize(data) {
    this.g = data.g;

    this.listenTo(this.g.user, "change:searchText", function (model, prop) {
      this.search(prop);
      return this.render();
    });
    this.sel = [];
    return this.selPos = 0;
  },

  events: { "scroll": "_sendScrollEvent" },

  render: function render() {
    this.renderSubviews();

    this.el.className = "biojs_msa_searchresult";
    var searchText = this.g.user.get("searchText");
    if (typeof searchText !== "undefined" && searchText !== null && searchText.length > 0) {
      if (this.sel.length === 0) {
        this.el.textContent = "no selection found";
      } else {
        this.resultBox = k.mk("div");
        this.resultBox.className = "biojs_msa_searchresult_ovbox";
        this.updateResult();
        this.el.appendChild(this.resultBox);
        this.el.appendChild(this.buildBtns());
      }
    }
    return this;
  },

  updateResult: function updateResult() {
    var text = "search pattern: " + this.g.user.get("searchText");
    text += ", selection: " + (this.selPos + 1);
    var seli = this.sel[this.selPos];
    text += " (";
    text += seli.get("xStart") + " - " + seli.get("xEnd");
    text += ", id: " + seli.get("seqId");
    text += ")";
    return this.resultBox.textContent = text;
  },

  buildBtns: function buildBtns() {
    var _this = this;

    var prevBtn = k.mk("button");
    prevBtn.textContent = "Prev";
    prevBtn.addEventListener("click", function () {
      return _this.moveSel(-1);
    });

    var nextBtn = k.mk("button");
    nextBtn.textContent = "Next";
    nextBtn.addEventListener("click", function () {
      return _this.moveSel(1);
    });

    var allBtn = k.mk("button");
    allBtn.textContent = "All";
    allBtn.addEventListener("click", function () {
      return _this.g.selcol.reset(_this.sel);
    });

    var searchrow = k.mk("div");
    searchrow.appendChild(prevBtn);
    searchrow.appendChild(nextBtn);
    searchrow.appendChild(allBtn);
    searchrow.className = "biojs_msa_searchresult_row";
    return searchrow;
  },

  moveSel: function moveSel(relDist) {
    var selNew = this.selPos + relDist;
    if (selNew < 0 || selNew >= this.sel.length) {
      return -1;
    } else {
      this.focus(selNew);
      this.selPos = selNew;
      return this.updateResult();
    }
  },

  focus: function focus(selPos) {
    var seli = this.sel[selPos];
    var leftIndex = seli.get("xStart");
    this.g.zoomer.setLeftOffset(leftIndex);
    return this.g.selcol.reset([seli]);
  },

  search: function search(searchText) {
    // marks all hits
    var origIndex;
    var search = new RegExp(searchText, "gi");
    var newSeli = [];
    var leftestIndex = origIndex = 100042;

    this.model.each(function (seq) {
      var strSeq = seq.get("seq");
      return function () {
        var match;
        var result = [];
        while (match = search.exec(strSeq)) {
          var index = match.index;
          var args = { xStart: index, xEnd: index + match[0].length - 1, seqId: seq.get("id") };
          newSeli.push(new _Selection2.default.possel(args));
          result.push(leftestIndex = Math.min(index, leftestIndex));
        }
        return result;
      }();
    });

    this.g.selcol.reset(newSeli);

    // safety check + update offset
    if (leftestIndex === origIndex) {
      leftestIndex = 0;
    }
    this.g.zoomer.setLeftOffset(leftestIndex);

    return this.sel = newSeli;
  }
});
exports.default = View;
},{"../g/selection/Selection":79,"backbone-childs":8,"dom-helper":47,"koala-js":53,"underscore":154}],117:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _AlignmentBody = require("./AlignmentBody");

var _AlignmentBody2 = _interopRequireDefault(_AlignmentBody);

var _HeaderBlock = require("./header/HeaderBlock");

var _HeaderBlock2 = _interopRequireDefault(_HeaderBlock);

var _OverviewBox = require("./OverviewBox");

var _OverviewBox2 = _interopRequireDefault(_OverviewBox);

var _Search = require("./Search");

var _Search2 = _interopRequireDefault(_Search);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var boneView = require("backbone-childs");
var _ = require('underscore');

// a neat collection view
var View = boneView.extend({

  initialize: function initialize(data) {
    this.g = data.g;

    this.draw();
    //@listenTo @model,"reset", ->
    // we need to wait until stats gives us the ok
    this.listenTo(this.g.stats, "reset", function () {
      return this.rerender();
    });

    // debounce a bulk operation
    this.listenTo(this.model, "change:hidden", _.debounce(this.rerender, 10));

    this.listenTo(this.model, "sort", this.rerender);
    this.listenTo(this.model, "add", function () {
      return console.log("seq add");
    });

    this.listenTo(this.g.vis, "change:sequences", this.rerender);
    this.listenTo(this.g.vis, "change:overviewbox", this.rerender);
    return this.listenTo(this.g.visorder, "change", this.rerender);
  },

  draw: function draw() {
    this.removeViews();

    if (this.g.vis.get("overviewbox")) {
      var overviewbox = new _OverviewBox2.default({ model: this.model, g: this.g });
      overviewbox.ordering = this.g.visorder.get('overviewBox');
      this.addView("overviewBox", overviewbox);
    }

    if (true) {
      var headerblock = new _HeaderBlock2.default({ model: this.model, g: this.g });
      headerblock.ordering = this.g.visorder.get('headerBox');
      this.addView("headerBox", headerblock);
    }

    if (true) {
      var searchblock = new _Search2.default({ model: this.model, g: this.g });
      searchblock.ordering = this.g.visorder.get('searchBox');
      this.addView("searchbox", searchblock);
    }

    var body = new _AlignmentBody2.default({ model: this.model, g: this.g });
    body.ordering = this.g.visorder.get('alignmentBody');
    return this.addView("body", body);
  },

  render: function render() {
    this.renderSubviews();
    this.el.className = "biojs_msa_stage";

    return this;
  },

  rerender: function rerender() {
    if (!this.g.config.get("manualRendering")) {
      this.draw();
      return this.render();
    }
  }
});
exports.default = View;
},{"./AlignmentBody":114,"./OverviewBox":115,"./Search":116,"./header/HeaderBlock":125,"backbone-childs":8,"underscore":154}],118:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Events = require("biojs-events");

var CanvasCharCache = function () {
  function CanvasCharCache(g) {
    _classCallCheck(this, CanvasCharCache);

    this.g = g;
    this.cache = {};
    this.cacheHeight = 0;
    this.cacheWidth = 0;
  }

  // returns a cached canvas


  _createClass(CanvasCharCache, [{
    key: "getFontTile",
    value: function getFontTile(letter, width, height) {
      // validate cache
      if (width !== this.cacheWidth || height !== this.cacheHeight) {
        this.cacheHeight = height;
        this.cacheWidth = width;
        this.cache = {};
      }

      if (this.cache[letter] === undefined) {
        this.createTile(letter, width, height);
      }

      return this.cache[letter];
    }

    // creates a canvas with a single letter
    // (for the fast font cache)

  }, {
    key: "createTile",
    value: function createTile(letter, width, height) {

      var canvas = this.cache[letter] = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      this.ctx = canvas.getContext('2d');
      this.ctx.font = this.g.zoomer.get("residueFont") + "px mono";

      this.ctx.textBaseline = 'middle';
      this.ctx.textAlign = "center";

      return this.ctx.fillText(letter, width / 2, height / 2, width);
    }
  }]);

  return CanvasCharCache;
}();

;
exports.default = CanvasCharCache;
},{"biojs-events":16}],119:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _ = require("underscore");
var Events = require("biojs-events");

var cache = {
  setMaxScrollHeight: function setMaxScrollHeight() {
    return this.maxScrollHeight = this.g.zoomer.getMaxAlignmentHeight() - this.g.zoomer.get('alignmentHeight');
  },
  setMaxScrollWidth: function setMaxScrollWidth() {
    return this.maxScrollWidth = this.g.zoomer.getMaxAlignmentWidth() - this.g.zoomer.getAlignmentWidth();
  }
};

var CacheConstructor = function CacheConstructor(g, model) {
  this.g = g;
  this.model = model;
  this.maxScrollWidth = 0;
  this.maxScrollHeight = 0;
  this.setMaxScrollHeight();
  this.setMaxScrollWidth();

  this.listenTo(this.g.zoomer, "change:rowHeight", this.setMaxScrollHeight);
  this.listenTo(this.g.zoomer, "change:columnWidth", this.setMaxScrollWidth);
  this.listenTo(this.g.zoomer, "change:alignmentWidth", this.setMaxScrollWidth);
  this.listenTo(this.g.zoomer, "change:alignmentHeight", this.setMaxScrollHeight);
  this.listenTo(this.model, "add change reset", function () {
    this.setMaxScrollHeight();
    return this.setMaxScrollWidth();
  }, this);
  return this;
};

_.extend(CacheConstructor.prototype, cache);
Events.mixin(CacheConstructor.prototype);
exports.default = CacheConstructor;
},{"biojs-events":16,"underscore":154}],120:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _ = require("underscore");

var CanvasSelection = function CanvasSelection(g, ctx) {
  this.g = g;
  this.ctx = ctx;
  return this;
};

_.extend(CanvasSelection.prototype, {

  // TODO: should I be moved to the selection manager?
  // returns an array with the currently selected residues
  // e.g. [0,3] = pos 0 and 3 are selected
  _getSelection: function _getSelection(model) {
    var maxLen = model.get("seq").length;
    var selection = [];
    var sels = this.g.selcol.getSelForRow(model.get("id"));
    var rows = _.find(sels, function (el) {
      return el.get("type") === "row";
    });
    if (typeof rows !== "undefined" && rows !== null) {
      // full match
      var end = maxLen - 1;
      for (var n = 0; n <= end; n++) {
        selection.push(n);
      }
    } else if (sels.length > 0) {
      for (var i = 0, sel; i < sels.length; i++) {
        sel = sels[i];
        var start = sel.get("xStart");
        var end = sel.get("xEnd");
        for (var n = start; n <= end; n++) {
          selection.push(n);
        }
      }
    }

    return selection;
  },

  // loops over all selection and calls the render method
  _appendSelection: function _appendSelection(data) {
    var _this = this;

    var seq = data.model.get("seq");
    var selection = this._getSelection(data.model);
    // get the status of the upper and lower row

    var _getPrevNextSelection = this._getPrevNextSelection(data.model);

    var _getPrevNextSelection2 = _slicedToArray(_getPrevNextSelection, 2);

    var mPrevSel = _getPrevNextSelection2[0];
    var mNextSel = _getPrevNextSelection2[1];


    var boxWidth = this.g.zoomer.get("columnWidth");
    var boxHeight = this.g.zoomer.get("rowHeight");

    // avoid unnecessary loops
    if (selection.length === 0) {
      return;
    }

    var hiddenOffset = 0;
    return function () {
      var result = [];
      var end = seq.length - 1;
      for (var n = 0; 0 < end ? n <= end : n >= end; 0 < end ? n++ : n--) {
        result.push(function () {
          if (data.hidden.indexOf(n) >= 0) {
            return hiddenOffset++;
          } else {
            var k = n - hiddenOffset;
            // only if its a new selection
            if (selection.indexOf(n) >= 0 && (k === 0 || selection.indexOf(n - 1) < 0)) {
              return _this._renderSelection({ n: n, k: k, selection: selection, mPrevSel: mPrevSel, mNextSel: mNextSel, xZero: data.xZero, yZero: data.yZero, model: data.model });
            }
          }
        }());
      }
      return result;
    }();
  },

  // draws a single user selection
  _renderSelection: function _renderSelection(data) {

    var xZero = data.xZero;
    var yZero = data.yZero;
    var n = data.n;
    var k = data.k;
    var selection = data.selection;
    // and checks the prev and next row for selection  -> no borders in a selection
    var mPrevSel = data.mPrevSel;
    var mNextSel = data.mNextSel;

    // get the length of this selection
    var selectionLength = 0;
    var end = data.model.get("seq").length - 1;
    for (var i = n; n < end ? i <= end : i >= end; n < end ? i++ : i--) {
      if (selection.indexOf(i) >= 0) {
        selectionLength++;
      } else {
        break;
      }
    }

    // TODO: ugly!
    var boxWidth = this.g.zoomer.get("columnWidth");
    var boxHeight = this.g.zoomer.get("rowHeight");
    var totalWidth = boxWidth * selectionLength + 1;

    var hidden = this.g.columns.get('hidden');

    this.ctx.beginPath();
    var beforeWidth = this.ctx.lineWidth;
    this.ctx.lineWidth = 3;
    var beforeStyle = this.ctx.strokeStyle;
    this.ctx.strokeStyle = "#FF0000";

    xZero += k * boxWidth;

    // split up the selection into single cells
    var xPart = 0;
    var end1 = selectionLength - 1;
    for (var i = 0; 0 < end1 ? i <= end1 : i >= end1; 0 < end1 ? i++ : i--) {
      var xPos = n + i;
      if (hidden.indexOf(xPos) >= 0) {
        continue;
      }
      // upper line
      if (!(typeof mPrevSel !== "undefined" && mPrevSel !== null && mPrevSel.indexOf(xPos) >= 0)) {
        this.ctx.moveTo(xZero + xPart, yZero);
        this.ctx.lineTo(xPart + boxWidth + xZero, yZero);
      }
      // lower line
      if (!(typeof mNextSel !== "undefined" && mNextSel !== null && mNextSel.indexOf(xPos) >= 0)) {
        this.ctx.moveTo(xPart + xZero, boxHeight + yZero);
        this.ctx.lineTo(xPart + boxWidth + xZero, boxHeight + yZero);
      }

      xPart += boxWidth;
    }

    // left
    this.ctx.moveTo(xZero, yZero);
    this.ctx.lineTo(xZero, boxHeight + yZero);

    // right
    this.ctx.moveTo(xZero + totalWidth, yZero);
    this.ctx.lineTo(xZero + totalWidth, boxHeight + yZero);

    this.ctx.stroke();
    this.ctx.strokeStyle = beforeStyle;
    return this.ctx.lineWidth = beforeWidth;
  },

  // looks at the selection of the prev and next el
  // TODO: this is very naive, as there might be gaps above or below
  _getPrevNextSelection: function _getPrevNextSelection(model) {

    var modelPrev = model.collection.prev(model);
    var modelNext = model.collection.next(model);
    if (typeof modelPrev !== "undefined" && modelPrev !== null) {
      var mPrevSel = this._getSelection(modelPrev);
    }
    if (typeof modelNext !== "undefined" && modelNext !== null) {
      var mNextSel = this._getSelection(modelNext);
    }
    return [mPrevSel, mNextSel];
  }
});
exports.default = CanvasSelection;
},{"underscore":154}],121:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _CanvasCharCache = require("./CanvasCharCache");

var _CanvasCharCache2 = _interopRequireDefault(_CanvasCharCache);

var _CanvasSelection = require("./CanvasSelection");

var _CanvasSelection2 = _interopRequireDefault(_CanvasSelection);

var _CanvasSeqDrawer = require("./CanvasSeqDrawer");

var _CanvasSeqDrawer2 = _interopRequireDefault(_CanvasSeqDrawer);

var _CanvasCoordsCache = require("./CanvasCoordsCache");

var _CanvasCoordsCache2 = _interopRequireDefault(_CanvasCoordsCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var boneView = require("backbone-childs");
var mouse = require("mouse-pos");
var _ = require("underscore");
var jbone = require("jbone");

var View = boneView.extend({

  tagName: "canvas",

  initialize: function initialize(data) {
    this.g = data.g;

    this.listenTo(this.g.zoomer, "change:_alignmentScrollLeft change:_alignmentScrollTop", function (model, value, options) {
      if (!((typeof options !== "undefined" && options !== null ? options.origin : undefined) != null) || options.origin !== "canvasseq") {
        return this.render();
      }
    });

    this.listenTo(this.g.columns, "change:hidden", this.render);
    this.listenTo(this.g.zoomer, "change:alignmentWidth change:alignmentHeight", this.render);
    this.listenTo(this.g.colorscheme, "change", this.render);
    this.listenTo(this.g.selcol, "reset add", this.render);
    this.listenTo(this.model, "reset add", this.render);

    // el props
    this.el.style.display = "inline-block";
    this.el.style.overflowX = "hidden";
    this.el.style.overflowY = "hidden";
    this.el.className = "biojs_msa_seqblock";

    this.ctx = this.el.getContext('2d');
    this.cache = new _CanvasCharCache2.default(this.g);
    this.coordsCache = new _CanvasCoordsCache2.default(this.g, this.model);

    // clear the char cache
    this.listenTo(this.g.zoomer, "change:residueFont", function () {
      this.cache = new _CanvasCharCache2.default(this.g);
      return this.render();
    });

    // init selection
    this.sel = new _CanvasSelection2.default(this.g, this.ctx);

    this._setColor();

    // throttle the expensive draw function
    this.throttleTime = 0;
    this.throttleCounts = 0;
    if (document.documentElement.style.webkitAppearance != null) {
      // webkit browser - no throttling needed
      this.throttledDraw = function () {
        var start = +new Date();
        this.draw();
        this.throttleTime += +new Date() - start;
        this.throttleCounts++;
        if (this.throttleCounts > 15) {
          var tTime = Math.ceil(this.throttleTime / this.throttleCounts);
          console.log("avgDrawTime/WebKit", tTime);
          // remove perf analyser
          return this.throttledDraw = this.draw;
        }
      };
    } else {
      // slow browsers like Gecko
      this.throttledDraw = _.throttle(this.throttledDraw, 30);
    }

    return this.manageEvents();
  },

  // measures the time of a redraw and thus set the throttle limit
  throttledDraw: function throttledDraw() {
    // +new is the fastest: http://jsperf.com/new-date-vs-date-now-vs-performance-now/6
    var start = +new Date();
    this.draw();
    this.throttleTime += +new Date() - start;
    this.throttleCounts++;

    // remove itself after analysis
    if (this.throttleCounts > 15) {
      var tTime = Math.ceil(this.throttleTime / this.throttleCounts);
      console.log("avgDrawTime", tTime);
      tTime *= 1.2; // add safety time
      tTime = Math.max(20, tTime); // limit for ultra fast computers
      return this.throttledDraw = _.throttle(this.draw, tTime);
    }
  },

  manageEvents: function manageEvents() {
    var events = {};
    events.mousedown = "_onmousedown";
    events.touchstart = "_ontouchstart";

    if (this.g.config.get("registerMouseClicks")) {
      events.dblclick = "_onclick";
    }
    if (this.g.config.get("registerMouseHover")) {
      events.mousein = "_onmousein";
      events.mouseout = "_onmouseout";
    }

    events.mousewheel = "_onmousewheel";
    events.DOMMouseScroll = "_onmousewheel";
    this.delegateEvents(events);

    // listen for changes
    this.listenTo(this.g.config, "change:registerMouseHover", this.manageEvents);
    this.listenTo(this.g.config, "change:registerMouseClick", this.manageEvents);
    return this.dragStart = [];
  },

  _setColor: function _setColor() {
    return this.color = this.g.colorscheme.getSelectedScheme();
  },

  draw: function draw() {
    // fastest way to clear the canvas
    // http://jsperf.com/canvas-clear-speed/25
    this.el.width = this.el.width;

    // draw all the stuff
    if (this.seqDrawer != null && this.model.length > 0) {
      // char based
      this.seqDrawer.drawLetters();
      // row based
      this.seqDrawer.drawRows(this.sel._appendSelection, this.sel);
      return this.seqDrawer.drawRows(this.drawFeatures, this);
    }
  },

  drawFeatures: function drawFeatures(data) {
    var rectWidth = this.g.zoomer.get("columnWidth");
    var rectHeight = this.g.zoomer.get("rowHeight");
    if (data.model.attributes.height > 1) {
      var ctx = this.ctx;
      data.model.attributes.features.each(function (feature) {
        ctx.fillStyle = feature.attributes.fillColor || "red";
        var len = feature.attributes.xEnd - feature.attributes.xStart + 1;
        var y = (feature.attributes.row + 1) * rectHeight;
        return ctx.fillRect(feature.attributes.xStart * rectWidth + data.xZero, y + data.yZero, rectWidth * len, rectHeight);
      });

      // draw text
      ctx.fillStyle = "black";
      ctx.font = this.g.zoomer.get("residueFont") + "px mono";
      ctx.textBaseline = 'middle';
      ctx.textAlign = "center";

      return data.model.attributes.features.each(function (feature) {
        var len = feature.attributes.xEnd - feature.attributes.xStart + 1;
        var y = (feature.attributes.row + 1) * rectHeight;
        return ctx.fillText(feature.attributes.text, data.xZero + feature.attributes.xStart * rectWidth + len / 2 * rectWidth, data.yZero + rectHeight * 0.5 + y);
      });
    }
  },

  render: function render() {

    this.el.setAttribute('height', this.g.zoomer.get("alignmentHeight") + "px");
    this.el.setAttribute('width', this.g.zoomer.getAlignmentWidth() + "px");

    this.g.zoomer._checkScrolling(this._checkScrolling([this.g.zoomer.get('_alignmentScrollLeft'), this.g.zoomer.get('_alignmentScrollTop')]), { header: "canvasseq" });

    this._setColor();

    this.seqDrawer = new _CanvasSeqDrawer2.default(this.g, this.ctx, this.model, { width: this.el.width,
      height: this.el.height,
      color: this.color,
      cache: this.cache
    });

    this.throttledDraw();
    return this;
  },

  _onmousemove: function _onmousemove(e, reversed) {
    if (this.dragStart.length === 0) {
      return;
    }

    var dragEnd = mouse.abs(e);
    // relative to first click
    var relEnd = [dragEnd[0] - this.dragStart[0], dragEnd[1] - this.dragStart[1]];
    // relative to initial scroll status

    // scale events
    var scaleFactor = this.g.zoomer.get("canvasEventScale");
    if (reversed) {
      scaleFactor = 3;
    }
    for (var i = 0; i <= 1; i++) {
      relEnd[i] = relEnd[i] * scaleFactor;
    }

    // calculate new scrolling vals
    var relDist = [this.dragStartScroll[0] - relEnd[0], this.dragStartScroll[1] - relEnd[1]];

    // round values
    for (var i = 0; i <= 1; i++) {
      relDist[i] = Math.round(relDist[i]);
    }

    // update scrollbar
    var scrollCorrected = this._checkScrolling(relDist);
    this.g.zoomer._checkScrolling(scrollCorrected, { origin: "canvasseq" });

    // reset start if use scrolls out of bounds
    for (var i = 0; i <= 1; i++) {
      if (scrollCorrected[i] !== relDist[i]) {
        if (scrollCorrected[i] === 0) {
          // reset of left, top
          this.dragStart[i] = dragEnd[i];
          this.dragStartScroll[i] = 0;
        } else {
          // recalibrate on right, bottom
          this.dragStart[i] = dragEnd[i] - scrollCorrected[i];
        }
      }
    }

    this.throttledDraw();

    // abort selection events of the browser (mouse only)
    if (e.preventDefault != null) {
      e.preventDefault();
      return e.stopPropagation();
    }
  },

  // converts touches into old mouse event
  _ontouchmove: function _ontouchmove(e) {
    this._onmousemove(e.changedTouches[0], true);
    e.preventDefault();
    return e.stopPropagation();
  },

  // start the dragging mode
  _onmousedown: function _onmousedown(e) {
    var _this = this;

    this.dragStart = mouse.abs(e);
    this.dragStartScroll = [this.g.zoomer.get('_alignmentScrollLeft'), this.g.zoomer.get('_alignmentScrollTop')];
    jbone(document.body).on('mousemove.overmove', function (e) {
      return _this._onmousemove(e);
    });
    jbone(document.body).on('mouseup.overup', function () {
      return _this._cleanup();
    });
    //jbone(document.body).on 'mouseout.overout', (e) => @_onmousewinout(e)
    return e.preventDefault();
  },

  // starts the touch mode
  _ontouchstart: function _ontouchstart(e) {
    var _this2 = this;

    this.dragStart = mouse.abs(e.changedTouches[0]);
    this.dragStartScroll = [this.g.zoomer.get('_alignmentScrollLeft'), this.g.zoomer.get('_alignmentScrollTop')];
    jbone(document.body).on('touchmove.overtmove', function (e) {
      return _this2._ontouchmove(e);
    });
    return jbone(document.body).on('touchend.overtend touchleave.overtleave touchcancel.overtcanel', function (e) {
      return _this2._touchCleanup(e);
    });
  },

  // checks whether mouse moved out of the window
  // -> terminate dragging
  _onmousewinout: function _onmousewinout(e) {
    if (e.toElement === document.body.parentNode) {
      return this._cleanup();
    }
  },

  // terminates dragging
  _cleanup: function _cleanup() {
    this.dragStart = [];
    // remove all listeners
    jbone(document.body).off('.overmove');
    jbone(document.body).off('.overup');
    return jbone(document.body).off('.overout');
  },

  // terminates touching
  _touchCleanup: function _touchCleanup(e) {
    if (e.changedTouches.length > 0) {
      // maybe we can send a final event
      this._onmousemove(e.changedTouches[0], true);
    }

    this.dragStart = [];
    // remove all listeners
    jbone(document.body).off('.overtmove');
    jbone(document.body).off('.overtend');
    jbone(document.body).off('.overtleave');
    return jbone(document.body).off('.overtcancel');
  },

  // might be incompatible with some browsers
  _onmousewheel: function _onmousewheel(e) {
    var delta = mouse.wheelDelta(e);
    this.g.zoomer.set('_alignmentScrollLeft', this.g.zoomer.get('_alignmentScrollLeft') + delta[0]);
    this.g.zoomer.set('_alignmentScrollTop', this.g.zoomer.get('_alignmentScrollTop') + delta[1]);
    return e.preventDefault();
  },

  _onclick: function _onclick(e) {
    var res = this._getClickPos(e);
    if (typeof res !== "undefined" && res !== null) {
      if (res.feature != null) {
        this.g.trigger("feature:click", res);
      } else {
        this.g.trigger("residue:click", res);
      }
    }
    return this.throttledDraw();
  },

  _onmousein: function _onmousein(e) {
    var res = this._getClickPos(e);
    if (typeof res !== "undefined" && res !== null) {
      if (res.feature != null) {
        this.g.trigger("feature:mousein", res);
      } else {
        this.g.trigger("residue:mousein", res);
      }
    }
    return this.throttledDraw();
  },

  _onmouseout: function _onmouseout(e) {
    var res = this._getClickPos(e);
    if (typeof res !== "undefined" && res !== null) {
      if (res.feature != null) {
        this.g.trigger("feature:mouseout", res);
      } else {
        this.g.trigger("residue:mouseout", res);
      }
    }

    return this.throttledDraw();
  },

  _getClickPos: function _getClickPos(e) {
    var coords = mouse.rel(e);

    coords[0] += this.g.zoomer.get("_alignmentScrollLeft");
    var x = Math.floor(coords[0] / this.g.zoomer.get("columnWidth"));

    var _seqDrawer$_getSeqFor = this.seqDrawer._getSeqForYClick(coords[1]);

    var _seqDrawer$_getSeqFor2 = _slicedToArray(_seqDrawer$_getSeqFor, 2);

    var y = _seqDrawer$_getSeqFor2[0];
    var rowNumber = _seqDrawer$_getSeqFor2[1];

    // add hidden columns

    x += this.g.columns.calcHiddenColumns(x);
    // add hidden seqs
    y += this.model.calcHiddenSeqs(y);

    x = Math.max(0, x);
    y = Math.max(0, y);

    var seqId = this.model.at(y).get("id");

    if (rowNumber > 0) {
      // click on a feature
      var features = this.model.at(y).get("features").getFeatureOnRow(rowNumber - 1, x);
      if (!(features.length === 0)) {
        var feature = features[0];
        console.log(features[0].attributes);
        return { seqId: seqId, feature: feature, rowPos: x, evt: e };
      }
    } else {
      // click on a seq
      return { seqId: seqId, rowPos: x, evt: e };
    }
  },

  // checks whether the scrolling coordinates are valid
  // @returns: [xScroll,yScroll] valid coordinates
  _checkScrolling: function _checkScrolling(scrollObj) {

    // 0: maxLeft, 1: maxTop
    var max = [this.coordsCache.maxScrollWidth, this.coordsCache.maxScrollHeight];

    for (var i = 0; i <= 1; i++) {
      if (scrollObj[i] > max[i]) {
        scrollObj[i] = max[i];
      }

      if (scrollObj[i] < 0) {
        scrollObj[i] = 0;
      }
    }

    return scrollObj;
  }
});
exports.default = View;
},{"./CanvasCharCache":118,"./CanvasCoordsCache":119,"./CanvasSelection":120,"./CanvasSeqDrawer":122,"backbone-childs":8,"jbone":51,"mouse-pos":56,"underscore":154}],122:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _ = require("underscore");

var Drawer = { drawLetters: function drawLetters() {

    var rectHeight = this.rectHeight;

    // rects
    this.ctx.globalAlpha = this.g.colorscheme.get("opacity");
    this.drawSeqs(function (data) {
      return this.drawSeq(data, this._drawRect);
    });
    this.ctx.globalAlpha = 1;

    // letters
    return this.drawSeqs(function (data) {
      return this.drawSeq(data, this._drawLetter);
    });
  },

  drawSeqs: function drawSeqs(callback, target) {
    var hidden = this.g.columns.get("hidden");

    target = target || this;

    var _getStartSeq = this.getStartSeq();

    var _getStartSeq2 = _slicedToArray(_getStartSeq, 2);

    var start = _getStartSeq2[0];
    var y = _getStartSeq2[1];


    for (var i = start; i < this.model.length; i++) {
      var seq = this.model.at(i);
      if (seq.get('hidden')) {
        continue;
      }
      callback.call(target, { model: seq, yPos: y, y: i, hidden: hidden });

      var seqHeight = (seq.attributes.height || 1) * this.rectHeight;
      y = y + seqHeight;

      // out of viewport - stop
      if (y > this.height) {
        break;
      }
    }
  },

  // calls the callback for every drawable row
  drawRows: function drawRows(callback, target) {
    return this.drawSeqs(function (data) {
      return this.drawRow(data, callback, target);
    });
  },

  // draws a single row
  drawRow: function drawRow(data, callback, target) {
    var rectWidth = this.g.zoomer.get("columnWidth");
    var start = Math.max(0, Math.abs(Math.ceil(-this.g.zoomer.get('_alignmentScrollLeft') / rectWidth)));
    var x = -Math.abs(-this.g.zoomer.get('_alignmentScrollLeft') % rectWidth);

    var xZero = x - start * rectWidth;
    var yZero = data.yPos;
    return callback.call(target, { model: data.model, xZero: xZero, yZero: yZero, hidden: data.hidden });
  },

  // returns first sequence in the viewport
  // y is the position to start drawing
  getStartSeq: function getStartSeq() {
    var start = Math.max(0, Math.floor(this.g.zoomer.get('_alignmentScrollTop') / this.rectHeight)) + 1;
    var counter = 0;
    var i = 0;
    while (counter < start && i < this.model.length) {
      counter += this.model.at(i).attributes.height || 1;
      i++;
    }
    var y = Math.max(0, this.g.zoomer.get('_alignmentScrollTop') - counter * this.rectHeight + (this.model.at(i - 1).attributes.height || 1) * this.rectHeight);
    return [i - 1, -y];
  },

  // returns [the clicked seq for a viewport, row number]
  _getSeqForYClick: function _getSeqForYClick(click) {
    var _getStartSeq3 = this.getStartSeq();

    var _getStartSeq4 = _slicedToArray(_getStartSeq3, 2);

    var start = _getStartSeq4[0];
    var yDiff = _getStartSeq4[1];

    var yRel = yDiff % this.rectHeight;
    var clickedRows = Math.max(0, Math.floor((click - yRel) / this.rectHeight)) + 1;
    var counter = 0;
    var i = start;
    while (counter < clickedRows && i < this.model.length) {
      counter += this.model.at(i).attributes.height || 1;
      i++;
    }
    var rowNumber = Math.max(0, Math.floor(click / this.rectHeight) - counter + (this.model.at(i - 1).get("height") || 1));
    return [i - 1, rowNumber];
  },

  // TODO: very expensive method
  drawSeq: function drawSeq(data, callback) {
    var seq = data.model.get("seq");
    var y = data.yPos;
    var rectWidth = this.rectWidth;
    var rectHeight = this.rectHeight;

    // skip unneeded blocks at the beginning
    var start = Math.max(0, Math.abs(Math.ceil(-this.g.zoomer.get('_alignmentScrollLeft') / rectWidth)));
    var x = -Math.abs(-this.g.zoomer.get('_alignmentScrollLeft') % rectWidth);

    var res = { rectWidth: rectWidth, rectHeight: rectHeight, yPos: y, y: data.y };
    var elWidth = this.width;

    for (var j = start; j < seq.length; j++) {
      var c = seq[j];
      c = c.toUpperCase();

      // call the custom function
      res.x = j;
      res.c = c;
      res.xPos = x;

      // local call is faster than apply
      // http://jsperf.com/function-calls-direct-vs-apply-vs-call-vs-bind/6
      if (data.hidden.indexOf(j) < 0) {
        callback(this, res);
      } else {
        continue;
      }

      // move to the right
      x = x + rectWidth;

      // out of viewport - stop
      if (x > elWidth) {
        break;
      }
    }
  },

  _drawRect: function _drawRect(that, data) {
    var color = that.color.getColor(data.c, { pos: data.x,
      y: data.y
    });
    if (typeof color !== "undefined" && color !== null) {
      that.ctx.fillStyle = color;
      return that.ctx.fillRect(data.xPos, data.yPos, data.rectWidth, data.rectHeight);
    }
  },

  // REALLY expensive call on FF
  // Performance:
  // chrome: 2000ms drawLetter - 1000ms drawRect
  // FF: 1700ms drawLetter - 300ms drawRect
  _drawLetter: function _drawLetter(that, data) {
    return that.ctx.drawImage(that.cache.getFontTile(data.c, data.rectWidth, data.rectHeight), data.xPos, data.yPos, data.rectWidth, data.rectHeight);
  }
};

var CanvasSeqDrawer = function CanvasSeqDrawer(g, ctx, model, opts) {
  this.g = g;
  this.ctx = ctx;
  this.model = model;
  this.width = opts.width;
  this.height = opts.height;
  this.color = opts.color;
  this.cache = opts.cache;
  this.rectHeight = this.g.zoomer.get("rowHeight");
  this.rectWidth = this.g.zoomer.get("columnWidth");
  return this;
};

_.extend(CanvasSeqDrawer.prototype, Drawer);
exports.default = CanvasSeqDrawer;
},{"underscore":154}],123:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _svg = require("../../utils/svg");

var svg = _interopRequireWildcard(_svg);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var view = require("backbone-viewj");
var dom = require("dom-helper");


var ConservationView = view.extend({

  className: "biojs_msa_conserv",

  initialize: function initialize(data) {
    this.g = data.g;
    this.listenTo(this.g.zoomer, "change:stepSize change:labelWidth change:columnWidth", this.render);
    this.listenTo(this.g.vis, "change:labels change:metacell", this.render);
    this.listenTo(this.g.columns, "change:scaling", this.render);
    // we need to wait until stats gives us the ok
    //@listenTo @model, "reset",@render
    this.listenTo(this.g.stats, "reset", this.render);

    var opts = _.extend({}, {
      fillColor: ['#660', '#ff0'],
      strokeColor: '#330',
      maxHeight: 20,
      rectStyler: function rectStyler(rect, data) {
        return rect;
      }
    }, this.g.conservationConfig);

    this.fillColor = opts.fillColor;
    this.strokeColor = opts.strokeColor;
    this.maxHeight = opts.maxHeight;
    this.rectStyler = opts.rectStyler;

    return this.manageEvents();
  },

  // returns a function that will decide a colour
  // based on the conservation data it is given
  colorer: function colorer(colorRange) {
    var _this = this;

    var colorer = function colorer() {
      return "none";
    };

    if (typeof colorRange === 'string') {
      colorer = function colorer() {
        return colorRange;
      };
    } else if (Array.isArray(colorRange)) {
      if (colorRange.length != 2) {
        console.error("ERROR: colorRange array should have exactly two elements", colorRange);
      }

      // d3 is shipped modular nowadays - we can support both
      var d3BundledScale = typeof d3 != "undefined" && !!d3.scale;
      var d3SeperatedScale = typeof d3_scale != "undefined";
      if (!(d3BundledScale || d3SeperatedScale)) {
        console.warn("providing a [min/max] range as input requires d3 to be included - only using the first color");
        colorer = function colorer(d) {
          return colorRange[0];
        };
      } else {
        (function () {
          var d3LinearScale = d3BundledScale ? d3.scale.linear() : d3_scale.scaleLinear();
          var scale = d3LinearScale.domain([0, _this.maxHeight]).range(colorRange);

          colorer = function colorer(d) {
            return scale(d.height);
          };
        })();
      }
    } else {
      console.warn("expected colorRange to be '#rgb' or ['#rgb', '#rgb']", colorRange, '(' + (typeof colorRange === "undefined" ? "undefined" : _typeof(colorRange)) + ')');
    }
    return colorer;
  },

  render: function render() {
    var conserv = this.g.stats.scale(this.g.stats.conservation());

    dom.removeAllChilds(this.el);

    var nMax = this.model.getMaxLength();
    var cellWidth = this.g.zoomer.get("columnWidth");
    var maxHeight = this.maxHeight;
    var width = cellWidth * (nMax - this.g.columns.get('hidden').length);

    var s = svg.base({ height: maxHeight, width: width });
    s.style.display = "inline-block";
    s.style.cursor = "pointer";

    var rectData = this.rectData;
    var fillColorer = this.colorer(this.fillColor);
    var strokeColorer = this.colorer(this.strokeColor);
    var rectStyler = this.rectStyler;

    var stepSize = this.g.zoomer.get("stepSize");
    var hidden = this.g.columns.get("hidden");
    var x = 0;
    var n = 0;
    while (n < nMax) {
      if (hidden.indexOf(n) >= 0) {
        n += stepSize;
        continue;
      }
      width = cellWidth * stepSize;
      var avgHeight = 0;
      var end = stepSize - 1;
      for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
        avgHeight += conserv[n];
      }
      var height = maxHeight * (avgHeight / stepSize);

      var d = {
        x: x,
        y: maxHeight - height,
        maxheight: maxHeight,
        width: width - cellWidth / 4,
        height: height,
        rowPos: n
      };

      var rect = svg.rect(d);

      rect.style.stroke = strokeColorer(d);
      rect.style.fill = fillColorer(d);

      if (typeof rectStyler === 'function') {
        rectStyler(rect, d);
      }

      rect.rowPos = n;

      s.appendChild(rect);
      x += width;
      n += stepSize;
    }

    this.el.appendChild(s);
    return this;
  },

  //TODO: make more general with HeaderView
  _onclick: function _onclick(evt) {
    var _this2 = this;

    var rowPos = evt.target.rowPos;
    var stepSize = this.g.zoomer.get("stepSize");
    // simulate hidden columns
    return function () {
      var result = [];
      var end = stepSize - 1;
      for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
        result.push(_this2.g.trigger("bar:click", { rowPos: rowPos + i, evt: evt }));
      }
      return result;
    }();
  },

  manageEvents: function manageEvents() {
    var events = {};
    if (this.g.config.get("registerMouseClicks")) {
      events.click = "_onclick";
    }
    if (this.g.config.get("registerMouseHover")) {
      events.mousein = "_onmousein";
      events.mouseout = "_onmouseout";
    }
    this.delegateEvents(events);
    this.listenTo(this.g.config, "change:registerMouseHover", this.manageEvents);
    return this.listenTo(this.g.config, "change:registerMouseClick", this.manageEvents);
  },

  _onmousein: function _onmousein(evt) {
    var rowPos = this.g.zoomer.get("stepSize" * evt.rowPos);
    return this.g.trigger("bar:mousein", { rowPos: rowPos, evt: evt });
  },

  _onmouseout: function _onmouseout(evt) {
    var rowPos = this.g.zoomer.get("stepSize" * evt.rowPos);
    return this.g.trigger("bar:mouseout", { rowPos: rowPos, evt: evt });
  }
});

exports.default = ConservationView;
},{"../../utils/svg":112,"backbone-viewj":15,"dom-helper":47}],124:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _svg = require("../../utils/svg");

var svg = _interopRequireWildcard(_svg);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var view = require("backbone-viewj");
var dom = require("dom-helper");


// TODO: merge this with the conservation view
var ConservationView = view.extend({

  className: "biojs_msa_gapview",

  initialize: function initialize(data) {
    this.g = data.g;
    this.listenTo(this.g.zoomer, "change:stepSize change:labelWidth change:columnWidth", this.render);
    this.listenTo(this.g.vis, "change:labels change:metacell", this.render);
    this.listenTo(this.g.columns, "change:scaling", this.render);
    // we need to wait until stats gives us the ok
    this.listenTo(this.model, "reset", this.render);
    return this.manageEvents();
  },

  render: function render() {
    var gaps = this.g.stats.gaps();

    dom.removeAllChilds(this.el);

    var nMax = this.model.getMaxLength();
    var cellWidth = this.g.zoomer.get("columnWidth");
    var maxHeight = 20;
    var width = cellWidth * (nMax - this.g.columns.get('hidden').length);

    var s = svg.base({ height: maxHeight, width: width });
    s.style.display = "inline-block";
    s.style.cursor = "pointer";

    var stepSize = this.g.zoomer.get("stepSize");
    var hidden = this.g.columns.get("hidden");
    var x = 0;
    var n = 0;
    while (n < nMax) {
      if (hidden.indexOf(n) >= 0) {
        n += stepSize;
        continue;
      }
      width = cellWidth * stepSize;
      var avgHeight = 0;
      var end = stepSize - 1;
      for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
        avgHeight += gaps[n];
      }
      var height = maxHeight * (avgHeight / stepSize);

      var rect = svg.rect({ x: x, y: maxHeight - height, width: width - cellWidth / 4, height: height, style: "stroke:red;stroke-width:1;"
      });rect.rowPos = n;
      s.appendChild(rect);
      x += width;
      n += stepSize;
    }

    this.el.appendChild(s);
    return this;
  },

  //TODO: make more general with HeaderView
  _onclick: function _onclick(evt) {
    var _this = this;

    var rowPos = evt.target.rowPos;
    var stepSize = this.g.zoomer.get("stepSize");
    // simulate hidden columns
    return function () {
      var result = [];
      var end = stepSize - 1;
      for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
        result.push(_this.g.trigger("gap:click", { rowPos: rowPos + i, evt: evt }));
      }
      return result;
    }();
  },

  manageEvents: function manageEvents() {
    var events = {};
    if (this.g.config.get("registerMouseClicks")) {
      events.click = "_onclick";
    }
    if (this.g.config.get("registerMouseHover")) {
      events.mousein = "_onmousein";
      events.mouseout = "_onmouseout";
    }
    this.delegateEvents(events);
    this.listenTo(this.g.config, "change:registerMouseHover", this.manageEvents);
    return this.listenTo(this.g.config, "change:registerMouseClick", this.manageEvents);
  },

  _onmousein: function _onmousein(evt) {
    var rowPos = this.g.zoomer.get("stepSize" * evt.rowPos);
    return this.g.trigger("gap:mousein", { rowPos: rowPos, evt: evt });
  },

  _onmouseout: function _onmouseout(evt) {
    var rowPos = this.g.zoomer.get("stepSize" * evt.rowPos);
    return this.g.trigger("gap:mouseout", { rowPos: rowPos, evt: evt });
  }
});

exports.default = ConservationView;
},{"../../utils/svg":112,"backbone-viewj":15,"dom-helper":47}],125:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _LabelHeader = require("./LabelHeader");

var _LabelHeader2 = _interopRequireDefault(_LabelHeader);

var _RightHeaderBlock = require("./RightHeaderBlock");

var _RightHeaderBlock2 = _interopRequireDefault(_RightHeaderBlock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var boneView = require("backbone-childs");


var View = boneView.extend({

  initialize: function initialize(data) {
    var _this = this;

    this.g = data.g;
    this.draw();
    return this.listenTo(this.g.vis, "change:labels change:metacell change:leftHeader", function () {
      _this.draw();
      return _this.render();
    });
  },

  draw: function draw() {
    this.removeViews();

    if (this.g.vis.get("leftHeader") && (this.g.vis.get("labels") || this.g.vis.get("metacell"))) {
      var lHeader = new _LabelHeader2.default({ model: this.model, g: this.g });
      lHeader.ordering = -50;
      this.addView("lHeader", lHeader);
    }

    var rHeader = new _RightHeaderBlock2.default({ model: this.model, g: this.g });
    rHeader.ordering = 0;
    return this.addView("rHeader", rHeader);
  },

  render: function render() {
    this.renderSubviews();

    return this.el.className = "biojs_msa_header";
  }
});
exports.default = View;
},{"./LabelHeader":126,"./RightHeaderBlock":128,"backbone-childs":8}],126:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var k = require("koala-js");
var view = require("backbone-viewj");
var dom = require("dom-helper");

var LabelHeader = view.extend({

  className: "biojs_msa_headers",

  initialize: function initialize(data) {
    this.g = data.g;

    this.listenTo(this.g.vis, "change:metacell change:labels", this.render);
    return this.listenTo(this.g.zoomer, "change:labelWidth change:metaWidth", this.render);
  },

  render: function render() {

    dom.removeAllChilds(this.el);

    var width = 0;
    width += this.g.zoomer.getLeftBlockWidth();
    this.el.style.width = width + "px";

    if (this.g.vis.get("labels")) {
      this.el.appendChild(this.labelDOM());
    }

    if (this.g.vis.get("metacell")) {
      this.el.appendChild(this.metaDOM());
    }

    this.el.style.display = "inline-block";
    this.el.style.fontSize = this.g.zoomer.get("markerFontsize");
    return this;
  },

  labelDOM: function labelDOM() {
    var labelHeader = k.mk("div");
    labelHeader.style.width = this.g.zoomer.getLabelWidth();
    labelHeader.style.display = "inline-block";

    if (this.g.vis.get("labelCheckbox")) {
      labelHeader.appendChild(this.addEl(".", 10));
    }

    if (this.g.vis.get("labelId")) {
      labelHeader.appendChild(this.addEl("ID", this.g.zoomer.get("labelIdLength")));
    }

    if (this.g.vis.get("labelPartition")) {
      labelHeader.appendChild(this.addEl("part", 15));
    }

    if (this.g.vis.get("labelName")) {
      var name = this.addEl("Label");
      //name.style.marginLeft = "50px"
      labelHeader.appendChild(name);
    }

    return labelHeader;
  },

  addEl: function addEl(content, width) {
    var id = document.createElement("span");
    id.textContent = content;
    if (typeof width !== "undefined" && width !== null) {
      id.style.width = width + "px";
    }
    id.style.display = "inline-block";
    return id;
  },

  metaDOM: function metaDOM() {
    var metaHeader = k.mk("div");
    metaHeader.style.width = this.g.zoomer.getMetaWidth();
    metaHeader.style.display = "inline-block";

    if (this.g.vis.get("metaGaps")) {
      metaHeader.appendChild(this.addEl("Gaps", this.g.zoomer.get('metaGapWidth')));
    }
    if (this.g.vis.get("metaIdentity")) {
      metaHeader.appendChild(this.addEl("Ident", this.g.zoomer.get('metaIdentWidth')));
    }
    // if @.g.vis.get "metaLinks"
    //   metaHeader.appendChild @addEl("Links")

    return metaHeader;
  }
});
exports.default = LabelHeader;
},{"backbone-viewj":15,"dom-helper":47,"koala-js":53}],127:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _svg = require("../../utils/svg");

var svg = _interopRequireWildcard(_svg);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var view = require("backbone-viewj");
var dom = require("dom-helper");
var jbone = require("jbone");


var MarkerView = view.extend({

  className: "biojs_msa_marker",

  initialize: function initialize(data) {
    this.g = data.g;
    this.listenTo(this.g.zoomer, "change:stepSize change:labelWidth change:columnWidth change:markerStepSize change:markerFontsize", this.render);
    this.listenTo(this.g.vis, "change:labels change:metacell", this.render);
    return this.manageEvents();
  },

  render: function render() {
    dom.removeAllChilds(this.el);

    this.el.style.fontSize = this.g.zoomer.get("markerFontsize");

    var container = document.createElement("span");
    var n = 0;
    var cellWidth = this.g.zoomer.get("columnWidth");

    var nMax = this.model.getMaxLength();
    var stepSize = this.g.zoomer.get("stepSize");
    var hidden = this.g.columns.get("hidden");

    while (n < nMax) {
      if (hidden.indexOf(n) >= 0) {
        this.markerHidden(span, n, stepSize);
        n += stepSize;
        continue;
      }
      var span = document.createElement("span");
      span.style.width = cellWidth * stepSize + "px";
      span.style.display = "inline-block";
      // TODO: this doesn't work for a larger stepSize
      if ((n + 1) % this.g.zoomer.get('markerStepSize') === 0) {
        span.textContent = n + 1;
      } else {
        span.textContent = ".";
      }
      span.rowPos = n;

      n += stepSize;
      container.appendChild(span);
    }

    this.el.appendChild(container);
    return this;
  },

  markerHidden: function markerHidden(span, n, stepSize) {
    var _this = this;

    var hidden = this.g.columns.get("hidden").slice(0);

    var min = Math.max(0, n - stepSize);
    var prevHidden = true;
    for (var j = min; min < n ? j <= n : j >= n; min < n ? j++ : j--) {
      prevHidden &= hidden.indexOf(j) >= 0;
    }

    // filter duplicates
    if (prevHidden) {
      return;
    }

    var nMax = this.model.getMaxLength();

    var length = 0;
    var index = -1;
    // accumlate multiple rows
    for (var n = n; n < nMax ? n <= nMax : n >= nMax; n < nMax ? n++ : n--) {
      if (!(index >= 0)) {
        index = hidden.indexOf(n);
      } // sets the first index
      if (hidden.indexOf(n) >= 0) {
        length++;
      } else {
        break;
      }
    }

    var s = svg.base({ height: 10, width: 10 });
    s.style.position = "relative";
    var triangle = svg.polygon({ points: "0,0 5,5 10,0", style: "fill:lime;stroke:purple;stroke-width:1"
    });jbone(triangle).on("click", function (evt) {
      hidden.splice(index, length);
      return _this.g.columns.set("hidden", hidden);
    });

    s.appendChild(triangle);
    span.appendChild(s);
    return s;
  },

  manageEvents: function manageEvents() {
    var events = {};
    if (this.g.config.get("registerMouseClicks")) {
      events.click = "_onclick";
    }
    if (this.g.config.get("registerMouseHover")) {
      events.mousein = "_onmousein";
      events.mouseout = "_onmouseout";
    }
    this.delegateEvents(events);
    this.listenTo(this.g.config, "change:registerMouseHover", this.manageEvents);
    return this.listenTo(this.g.config, "change:registerMouseClick", this.manageEvents);
  },

  _onclick: function _onclick(evt) {
    var rowPos = evt.target.rowPos;
    var stepSize = this.g.zoomer.get("stepSize");
    return this.g.trigger("column:click", { rowPos: rowPos, stepSize: stepSize, evt: evt });
  },

  _onmousein: function _onmousein(evt) {
    var rowPos = this.g.zoomer.get("stepSize" * evt.rowPos);
    var stepSize = this.g.zoomer.get("stepSize");
    return this.g.trigger("column:mousein", { rowPos: rowPos, stepSize: stepSize, evt: evt });
  },

  _onmouseout: function _onmouseout(evt) {
    var rowPos = this.g.zoomer.get("stepSize" * evt.rowPos);
    var stepSize = this.g.zoomer.get("stepSize");
    return this.g.trigger("column:mouseout", { rowPos: rowPos, stepSize: stepSize, evt: evt });
  }
});

exports.default = MarkerView;
},{"../../utils/svg":112,"backbone-viewj":15,"dom-helper":47,"jbone":51}],128:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _MarkerView = require("./MarkerView");

var _MarkerView2 = _interopRequireDefault(_MarkerView);

var _ConservationView = require("./ConservationView");

var _ConservationView2 = _interopRequireDefault(_ConservationView);

var _SeqLogoWrapper = require("./SeqLogoWrapper");

var _SeqLogoWrapper2 = _interopRequireDefault(_SeqLogoWrapper);

var _GapView = require("./GapView");

var _GapView2 = _interopRequireDefault(_GapView);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var boneView = require("backbone-childs");
var _ = require('underscore');

var View = boneView.extend({

  initialize: function initialize(data) {
    this.g = data.g;
    this.blockEvents = false;

    this.listenTo(this.g.vis, "change:header", function () {
      this.draw();
      return this.render();
    });
    this.listenTo(this.g.vis, "change", this._setSpacer);
    this.listenTo(this.g.zoomer, "change:alignmentWidth", this._setWidth);
    this.listenTo(this.g.zoomer, "change:_alignmentScrollLeft", this._adjustScrollingLeft);

    // TODO: duplicate rendering
    this.listenTo(this.g.columns, "change:hidden", function () {
      this.draw();
      return this.render();
    });

    this.draw();

    return this.g.vis.once('change:loaded', this._adjustScrollingLeft, this);
  },

  events: { "scroll": "_sendScrollEvent" },

  draw: function draw() {
    this.removeViews();

    if (this.g.vis.get("conserv")) {
      var conserv = new _ConservationView2.default({ model: this.model, g: this.g });
      conserv.ordering = -20;
      this.addView("conserv", conserv);
    }

    if (this.g.vis.get("markers")) {
      var marker = new _MarkerView2.default({ model: this.model, g: this.g });
      marker.ordering = -10;
      this.addView("marker", marker);
    }

    if (this.g.vis.get("seqlogo")) {
      var seqlogo = new _SeqLogoWrapper2.default({ model: this.model, g: this.g });
      seqlogo.ordering = -30;
      this.addView("seqlogo", seqlogo);
    }

    if (this.g.vis.get("gapHeader")) {
      var gapview = new _GapView2.default({ model: this.model, g: this.g });
      gapview.ordering = -25;
      return this.addView("gapview", gapview);
    }
  },

  render: function render() {
    this.renderSubviews();

    this._setSpacer();

    this.el.className = "biojs_msa_rheader";
    this.el.style.overflowX = "auto";
    this.el.style.display = "inline-block";
    //@el.style.height = @g.zoomer.get("markerHeight") + "px"
    this._setWidth();
    this._adjustScrollingLeft();
    return this;
  },

  // scrollLeft triggers a reflow of the whole area (even only get)
  _sendScrollEvent: function _sendScrollEvent() {
    if (!this.blockEvents) {
      this.g.zoomer.set("_alignmentScrollLeft", this.el.scrollLeft, { origin: "header" });
    }
    return this.blockEvents = false;
  },

  _adjustScrollingLeft: function _adjustScrollingLeft(model, value, options) {
    if (!((typeof options !== "undefined" && options !== null ? options.origin : undefined) != null) || options.origin !== "header") {
      var scrollLeft = this.g.zoomer.get("_alignmentScrollLeft");
      this.blockEvents = true;
      return this.el.scrollLeft = scrollLeft;
    }
  },

  _setSpacer: function _setSpacer() {
    // spacer / padding element
    return this.el.style.marginLeft = this._getLabelWidth() + "px";
  },

  _getLabelWidth: function _getLabelWidth() {
    var paddingLeft = 0;
    if (!this.g.vis.get("leftHeader")) {
      paddingLeft += this.g.zoomer.getLeftBlockWidth();
    }
    return paddingLeft;
  },

  _setWidth: function _setWidth() {
    return this.el.style.width = this.g.zoomer.getAlignmentWidth() + "px";
  }
});
exports.default = View;
},{"./ConservationView":123,"./GapView":124,"./MarkerView":127,"./SeqLogoWrapper":129,"backbone-childs":8,"underscore":154}],129:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var SeqLogoView = require("biojs-vis-seqlogo/light");
var view = require("backbone-viewj");
var dom = require("dom-helper");

// this is a bridge between the MSA and the seqlogo viewer
var SeqLogoWrapper = view.extend({

  initialize: function initialize(data) {
    this.g = data.g;
    this.listenTo(this.g.zoomer, "change:alignmentWidth", this.render);
    this.listenTo(this.g.colorscheme, "change", function () {
      var colors = this.g.colorscheme.getSelectedScheme();
      this.seqlogo.changeColors(colors);
      return this.render();
    });

    this.listenTo(this.g.zoomer, "change:columnWidth", function () {
      this.seqlogo.column_width = this.g.zoomer.get('columnWidth');
      return this.render();
    });

    //@listenTo @g.zoomer,"change:columnWidth change:rowHeight", ->

    this.listenTo(this.g.stats, "reset", function () {
      this.draw();
      return this.render();
    });

    return this.draw();
  },

  draw: function draw() {
    dom.removeAllChilds(this.el);

    console.log("redraw seqlogo");
    var arr = this.g.stats.conservResidue({ scaled: true });
    arr = _.map(arr, function (el) {
      return _.pick(el, function (e, k) {
        return k !== "-";
      });
    });
    var data = { alphabet: "aa",
      heightArr: arr
    };

    var colors = this.g.colorscheme.getSelectedScheme();
    // TODO: seqlogo might have problems with true dynamic schemes
    return this.seqlogo = new SeqLogoView({ model: this.model, g: this.g, data: data, yaxis: false, scroller: false, xaxis: false, height: 100, column_width: this.g.zoomer.get('columnWidth'), positionMarker: false, zoom: 1, el: this.el, colors: colors });
  },

  render: function render() {
    return this.seqlogo.render();
  }
});
exports.default = SeqLogoWrapper;
},{"backbone-viewj":15,"biojs-vis-seqlogo/light":28,"dom-helper":47}],130:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _LabelRowView = require("./LabelRowView");

var _LabelRowView2 = _interopRequireDefault(_LabelRowView);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var boneView = require("backbone-childs");


var View = boneView.extend({

  initialize: function initialize(data) {
    var _this = this;

    this.g = data.g;
    this.draw();
    this.listenTo(this.g.zoomer, "change:_alignmentScrollTop", this._adjustScrollingTop);
    this.g.vis.once('change:loaded', this._adjustScrollingTop, this);

    this.listenTo(this.g.zoomer, "change:alignmentHeight", this._setHeight);
    this.listenTo(this.model, "change:reference", this.draw);

    return this.listenTo(this.model, "reset add remove", function () {
      _this.draw();
      return _this.render();
    });
  },

  draw: function draw() {
    this.removeViews();
    console.log("redraw columns", this.model.length);
    for (var i = 0; i < this.model.length; i++) {

      if (this.model.at(i).get('hidden')) {
        continue;
      }
      var view = new _LabelRowView2.default({ model: this.model.at(i), g: this.g });
      view.ordering = i;
      this.addView("row_" + i, view);
    }
  },

  events: { "scroll": "_sendScrollEvent" },

  // broadcast the scrolling event (by the scrollbar)
  _sendScrollEvent: function _sendScrollEvent() {
    return this.g.zoomer.set("_alignmentScrollTop", this.el.scrollTop, { origin: "label" });
  },

  // sets the scrolling property (from another event e.g. dragging)
  _adjustScrollingTop: function _adjustScrollingTop() {
    return this.el.scrollTop = this.g.zoomer.get("_alignmentScrollTop");
  },


  render: function render() {
    this.renderSubviews();
    this.el.className = "biojs_msa_labelblock";
    this.el.style.display = "inline-block";
    this.el.style.verticalAlign = "top";
    this.el.style.overflowY = "auto";
    this.el.style.overflowX = "hidden";
    this.el.style.fontSize = this.g.zoomer.get('labelFontsize') + "px";
    this.el.style.lineHeight = "" + this.g.zoomer.get("labelLineHeight");
    this._setHeight();
    return this;
  },

  _setHeight: function _setHeight() {
    return this.el.style.height = this.g.zoomer.get("alignmentHeight") + "px";
  }
});
exports.default = View;
},{"./LabelRowView":131,"backbone-childs":8}],131:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _LabelView = require("./LabelView");

var _LabelView2 = _interopRequireDefault(_LabelView);

var _MetaView = require("./MetaView");

var _MetaView2 = _interopRequireDefault(_MetaView);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var boneView = require("backbone-childs");


var View = boneView.extend({

  initialize: function initialize(data) {
    this.g = data.g;
    this.draw();

    this.listenTo(this.g.vis, "change:labels", this.drawR);
    this.listenTo(this.g.vis, "change:metacell", this.drawR);
    this.listenTo(this.g.zoomer, "change:rowHeight", function () {
      return this.el.style.height = this.g.zoomer.get("rowHeight") + "px";
    });

    return this.listenTo(this.g.selcol, "change reset add", this.setSelection);
  },

  draw: function draw() {
    this.removeViews();
    if (this.g.vis.get("labels")) {
      this.addView("labels", new _LabelView2.default({ model: this.model, g: this.g }));
    }
    if (this.g.vis.get("metacell")) {
      var meta = new _MetaView2.default({ model: this.model, g: this.g });
      return this.addView("metacell", meta);
    }
  },

  drawR: function drawR() {
    this.draw();
    return this.render();
  },

  render: function render() {
    this.renderSubviews();

    this.el.setAttribute("class", "biojs_msa_labelrow");
    this.el.style.height = this.g.zoomer.get("rowHeight") * (this.model.attributes.height || 1) + "px";

    this.setSelection();
    return this;
  },

  setSelection: function setSelection() {
    var sel = this.g.selcol.getSelForRow(this.model.id);
    if (sel.length > 0) {
      return this.el.style.fontWeight = "bold";
    } else {
      return this.el.style.fontWeight = "normal";
    }
  }
});
exports.default = View;
},{"./LabelView":132,"./MetaView":133,"backbone-childs":8}],132:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var view = require("backbone-viewj");
var dom = require("dom-helper");

var LabelView = view.extend({

  initialize: function initialize(data) {
    this.seq = data.seq;
    this.g = data.g;

    return this.manageEvents();
  },

  manageEvents: function manageEvents() {
    var events = {};
    if (this.g.config.get("registerMouseClicks")) {
      events.click = "_onclick";
    }
    if (this.g.config.get("registerMouseHover")) {
      events.mousein = "_onmousein";
      events.mouseout = "_onmouseout";
    }
    this.delegateEvents(events);
    this.listenTo(this.g.config, "change:registerMouseHover", this.manageEvents);
    this.listenTo(this.g.config, "change:registerMouseClick", this.manageEvents);
    this.listenTo(this.g.vis, "change:labelName change:labelId change:labelPartition change:labelCheckbox", this.render);
    this.listenTo(this.g.zoomer, "change:labelIdLength change:labelNameLength change:labelPartLength change:labelCheckLength", this.render);
    return this.listenTo(this.g.zoomer, "change:labelFontSize change:labelLineHeight change:labelWidth change:rowHeight", this.render);
  },

  render: function render() {
    dom.removeAllChilds(this.el);

    this.el.style.width = this.g.zoomer.getLabelWidth() + "px";
    //@el.style.height = "#{@g.zoomer.get "rowHeight"}px"
    this.el.setAttribute("class", "biojs_msa_labels");

    if (this.g.vis.get("labelCheckbox")) {
      var checkBox = document.createElement("input");
      checkBox.setAttribute("type", "checkbox");
      checkBox.value = this.model.get('id');
      checkBox.name = "seq";
      checkBox.style.width = this.g.zoomer.get("labelCheckLength") + "px";
      this.el.appendChild(checkBox);
    }

    if (this.g.vis.get("labelId")) {
      var id = document.createElement("span");
      var val = this.model.get("id");
      if (!isNaN(val)) {
        val++;
      }
      id.textContent = val;
      id.style.width = this.g.zoomer.get("labelIdLength") + "px";
      id.style.display = "inline-block";
      this.el.appendChild(id);
    }

    if (this.g.vis.get("labelPartition")) {
      var part = document.createElement("span");
      part.style.width = this.g.zoomer.get("labelPartLength") + "px";
      part.textContent = this.model.get("partition");
      part.style.display = "inline-block";
      this.el.appendChild(id);
      this.el.appendChild(part);
    }

    if (this.g.vis.get("labelName")) {
      var name = document.createElement("span");
      name.textContent = this.model.get("name");
      if (this.model.get("ref") && this.g.config.get("hasRef")) {
        name.style.fontWeight = "bold";
      }
      name.style.width = this.g.zoomer.get("labelNameLength") + "px";
      this.el.appendChild(name);
    }

    this.el.style.overflow = scroll;
    this.el.style.fontSize = this.g.zoomer.get('labelFontsize') + "px";
    return this;
  },

  _onclick: function _onclick(evt) {
    var seqId = this.model.get("id");
    return this.g.trigger("row:click", { seqId: seqId, evt: evt });
  },

  _onmousein: function _onmousein(evt) {
    var seqId = this.model.get("id");
    return this.g.trigger("row:mouseout", { seqId: seqId, evt: evt });
  },

  _onmouseout: function _onmouseout(evt) {
    var seqId = this.model.get("id");
    return this.g.trigger("row:mouseout", { seqId: seqId, evt: evt });
  }
});

exports.default = LabelView;
},{"backbone-viewj":15,"dom-helper":47}],133:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _menubuilder = require("../../menu/menubuilder");

var _menubuilder2 = _interopRequireDefault(_menubuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var view = require("backbone-viewj");
var _ = require('underscore');
var dom = require("dom-helper");
var st = require("msa-seqtools");


var MetaView = view.extend({

  className: "biojs_msa_metaview",

  initialize: function initialize(data) {
    this.g = data.g;
    this.listenTo(this.g.vis, "change:metacell", this.render);
    return this.listenTo(this.g.zoomer, "change:metaWidth", this.render);
  },

  events: { click: "_onclick",
    mousein: "_onmousein",
    mouseout: "_onmouseout"
  },

  render: function render() {
    dom.removeAllChilds(this.el);

    this.el.style.display = "inline-block";

    var width = this.g.zoomer.getMetaWidth();
    this.el.style.width = width - 10;
    this.el.style.paddingRight = 5;
    this.el.style.paddingLeft = 5;
    // TODO: why do we need to decrease the font size?
    // otherwise we see a scrollbar
    this.el.style.fontSize = this.g.zoomer.get('labelFontsize') - 2 + "px";

    if (this.g.vis.get("metaGaps")) {
      // adds gaps
      var seq = this.model.get('seq');
      var gaps = _.reduce(seq, function (memo, c) {
        return c === '-' ? ++memo : undefined;
      }, 0);
      // 2-place percentage , e.g. 42%
      gaps = (gaps * 100 / seq.length).toFixed(0) + "%";

      // append gap count
      var gapSpan = document.createElement('span');
      gapSpan.textContent = gaps;
      gapSpan.style.display = "inline-block";
      gapSpan.style.width = 35;
      this.el.appendChild(gapSpan);
    }

    if (this.g.vis.get("metaIdentity")) {
      // identity
      // TODO: there must be a better way to pass the id
      var ident = this.g.stats.identity()[this.model.id];
      var identSpan = document.createElement('span');

      if (this.model.get("ref") && this.g.config.get("hasRef")) {
        identSpan.textContent = "ref.";
      } else if (typeof ident !== "undefined" && ident !== null) {
        identSpan.textContent = ident.toFixed(2);
      }

      identSpan.style.display = "inline-block";
      identSpan.style.width = 40;
      this.el.appendChild(identSpan);
    }

    if (this.g.vis.get("metaLinks")) {
      // TODO: this menu builder is just an example how one could customize this
      // view
      if (this.model.attributes.ids) {
        var links = st.buildLinks(this.model.attributes.ids);
        if (_.keys(links).length > 0) {
          var menu = new _menubuilder2.default({ name: "↗" });
          console.log(_.keys(links));
          _.each(links, function (val, key) {
            return menu.addNode(key, function (e) {
              return window.open(val);
            });
          });

          var linkEl = menu.buildDOM();
          linkEl.style.cursor = "pointer";
          return this.el.appendChild(linkEl);
        }
      }
    }
  },

  //@el.style.height = "#{@g.zoomer.get "rowHeight"}px"

  _onclick: function _onclick(evt) {
    return this.g.trigger("meta:click", { seqId: this.model.get("id", { evt: evt }) });
  },

  _onmousein: function _onmousein(evt) {
    return this.g.trigger("meta:mousein", { seqId: this.model.get("id", { evt: evt }) });
  },

  _onmouseout: function _onmouseout(evt) {
    return this.g.trigger("meta:mouseout", { seqId: this.model.get("id", { evt: evt }) });
  }
});
exports.default = MetaView;
},{"../../menu/menubuilder":87,"backbone-viewj":15,"dom-helper":47,"msa-seqtools":74,"underscore":154}],134:[function(require,module,exports){
var window = require("global/window")
var once = require("once")
var parseHeaders = require('parse-headers')

var messages = {
    "0": "Internal XMLHttpRequest Error",
    "4": "4xx Client Error",
    "5": "5xx Server Error"
}

var XHR = window.XMLHttpRequest || noop
var XDR = "withCredentials" in (new XHR()) ? XHR : window.XDomainRequest

module.exports = createXHR

function createXHR(options, callback) {
    if (typeof options === "string") {
        options = { uri: options }
    }

    options = options || {}
    callback = once(callback)

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new XDR()
        }else{
            xhr = new XHR()
        }
    }

    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var key
    var load = options.response ? loadResponse : loadXhr

    if ("json" in options) {
        isJson = true
        headers["Accept"] = "application/json"
        if (method !== "GET" && method !== "HEAD") {
            headers["Content-Type"] = "application/json"
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = load
    xhr.onerror = error
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    // hate IE
    xhr.ontimeout = noop
    xhr.open(method, uri, !sync)
                                    //backward compatibility
    if (options.withCredentials || (options.cors && options.withCredentials !== false)) {
        xhr.withCredentials = true
    }

    // Cannot set timeout with sync request
    if (!sync) {
        xhr.timeout = "timeout" in options ? options.timeout : 5000
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }
    
    if ("beforeSend" in options && 
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr

    function readystatechange() {
        if (xhr.readyState === 4) {
            load()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = null

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === 'text' || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    function getStatusCode() {
        return xhr.status === 1223 ? 204 : xhr.status
    }

    // if we're getting a none-ok statusCode, build & return an error
    function errorFromStatusCode(status, body) {
        var error = null
        if (status === 0 || (status >= 400 && status < 600)) {
            var message = (typeof body === "string" ? body : false) ||
                messages[String(status).charAt(0)]
            error = new Error(message)
            error.statusCode = status
        }

        return error
    }

    // will load the data & process the response in a special response object
    function loadResponse() {
        var status = getStatusCode()
        var body = getBody()
        var error = errorFromStatusCode(status, body)
        var response = {
            body: body,
            statusCode: status,
            statusText: xhr.statusText,
            raw: xhr
        }
        if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
            response.headers = parseHeaders(xhr.getAllResponseHeaders())
        } else {
            response.headers = {}
        }

        callback(error, response, response.body)
    }

    // will load the data and add some response properties to the source xhr
    // and then respond with that
    function loadXhr() {
        var status = getStatusCode()
        var error = errorFromStatusCode(status)

        xhr.status = xhr.statusCode = status
        xhr.body = getBody()
        xhr.headers = parseHeaders(xhr.getAllResponseHeaders())

        callback(error, xhr, xhr.body)
    }

    function error(evt) {
        callback(evt, xhr)
    }
}


function noop() {}

},{"global/window":49,"once":135,"parse-headers":136}],135:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],136:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":48,"trim":153}],137:[function(require,module,exports){
var _ = require("underscore");

var stat = function(seqs, opts) {
  // if someone forgets new
  if (this.constructor !== stat) {
    return new stat(seqs);
  }
  if (seqs === undefined || typeof seqs === "string") {
    throw new TypeError("you need to give the seq stat an array");
  }
  //if(seqs.length == 0){
  //throw new TypeError("you need to give the seq stat a real array");
  //}
  this.resetSeqs(seqs);
  this.alphabetSize = 4;
  this._useBackground = false;
  this.useGaps = false;
  this.ignoredChars = ["-", "*"];
  _.extend(this, opts);
};

stat.prototype.addSeq = function addSeq(seq) {
  this.seqs.push(seq);
  this._reset();
};

stat.prototype.removeSeq = function addSeq(seq) {
  // check for int or string
  if (typeof seq === 'number') {
    this.seqs.splice(seq, 1);
  } else {
    // identify matches (we could have multiple)
    _.each(this.seqs, function(s, i) {
      if (seq === s) {
        this.seqs.splice(i, 1);
      }
    }.bind(this));
  }
  this._reset();
};

stat.prototype.addSeqs = function addSeqs(seqs) {
  seqs.forEach(function(seq) {
    this.addSeq(seq);
  }.bind(this));
};

stat.prototype.resetSeqs = function reset(seqs) {
  this.seqs = [];

  // support sequence models
  if (! seqs instanceof Array || "at" in seqs) {
    this.mseqs = seqs;
    var mSeqsPluck = function() {
      var seqArr = this.mseqs.pluck("seq");
      this.resetSeqs(seqArr);
    };
    seqs.on("add change reset ", mSeqsPluck, this);
    mSeqsPluck.call(this);
  } else {
    this.addSeqs(seqs);
    this._reset();
    this.trigger("reset");
  }
};

var calcValues = ["consensus", "frequency", "maxLength", "ic", "gaps"];

stat.prototype._reset = function _reset() {
  for (var i = 0; i < calcValues.length; i++) {
    this["_" + calcValues[i]] = undefined;
  }
  this._identity = undefined;
  this._background = undefined;
};

// -----------------------------------------------------------------------------
// BEGIN: setter/getter
// -----------------------------------------------------------------------------

stat.prototype.setBackground = function setBackground(b) {
  this._useBackground = b;
  this._reset();
};

stat.prototype.useBackground = function useBackground() {
  this.setBackground(true);
};

stat.prototype.setDNA = function setNucleotide() {
  this.alphabetSize = 4;
};

stat.prototype.setProtein = function setDNA() {
  this.alphabetSize = 20;
};

// -----------------------------------------------------------------------------
// BEGIN: auto wrappers
// -----------------------------------------------------------------------------

// neat auto-wrappers
calcValues.forEach(function(key) {
  stat.prototype[key] = function() {
    if (this["_" + key] === undefined) {
      this["_" + key] = this[key + "Calc"]();
    }
    return this["_" + key];
  };
});

stat.prototype.identity = function identitiy(seq) {
  // do not cache if its called with a special compare seq
  var ident;
  if (this._identity === undefined || seq) {
    ident = this.identityCalc(seq);
    this._identity = undefined;
  }
  return this._identity || ident;
};

// set your own background with obj.bg
stat.prototype.background = function background() {
  if (this.bg !== undefined) {
    return this.bg;
  }
  if (this._background === undefined) {
    this.backgroundCalc();
  }
  return this._background;
};


// -----------------------------------------------------------------------------
// BEGIN: calc tools
// -----------------------------------------------------------------------------

// calculates the relative frequency of a base at a given position
// this is needed e.g. for the entropy calculation
// seqs: array of sequences (strings)
// opts:
//    all: boolean (use to show the frequencies for all letters [including the ignored ones]
//    (default false)
// @returns array of all positions with a dictionary of all bases with their relative frequency
stat.prototype.frequencyCalc = function frequencyCalc(opts) {
  var occs, totalPerPos;
  occs = new Array(this.maxLength());
  totalPerPos = new Array(this.seqs.length);
  var ignoredChars = this.ignoredChars;
  if(opts !== undefined && opts.all){
    ignoredChars = []; 
  }

  // count the occurrences of the chars at a position
  _.each(this.seqs, function(el) {
    _.each(el, function(c, pos) {
      if (ignoredChars.indexOf(c) >= 0) return;
      if (occs[pos] === undefined) {
        occs[pos] = {};
      }
      if (occs[pos][c] === undefined) {
        occs[pos][c] = 0;
      }
      occs[pos][c] ++;
      if (totalPerPos[pos] === undefined) {
        totalPerPos[pos] = 0;
      }
      totalPerPos[pos] ++;
    });
  });

  // normalize to 1
  _.each(occs, function(el, pos) {
    return _.each(el, function(val, c) {
      return (occs[pos][c] = val / totalPerPos[pos]);
    });
  });
  this._frequency = occs;
  return occs;
};

// seqs: array of sequences (strings)
stat.prototype.backgroundCalc = function backgroundCalc() {
  var occ = {};
  var total = 0;

  // count the occurences of the chars of a position
  _.each(this.seqs, function(el) {
    _.each(el, function(c) {
      if (occ[c] === undefined) {
        occ[c] = 0;
      }
      occ[c] ++;
      return total++;
    });
  });

  // normalize to 1
  occ = _.mapValues(occ, function(val) {
    return val / total;
  });
  this._background = occ;
  return occ;
};


// information content after Shannon
// * gaps are excluded
stat.prototype.icCalc = function icCalc() {
  var f = this.frequency();
  if (this._useBackground) {
    var b = this.background();
  }
  var ignoredChars = this.ignoredChars;
  var useBackground = this._useBackground;
  var ic = _.map(f, function(el) {
    return _.reduce(el, function(memo, val, c) {
      if (ignoredChars.indexOf(c) >= 0) return memo;
      if (useBackground) {
        val = val / b[c];
      }
      return memo - val * (Math.log(val) / Math.log(2));
    }, 0);
  });
  this._ic = ic;
  return ic;
};

// sequence conservation after Schneider and Stephens (1990)
// @cite Schneider, T.D. and Stephens, R.M. 1990. Sequence logos: A new way to
// display consensus sequences. Nucleic Acids Res. 18: 6097–6100.
stat.prototype.conservation = function conservation(alphabetSize) {
  var ic = this.ic();
  var gaps = this.gaps();
  var self = this;

  alphabetSize = alphabetSize || this.alphabetSize;
  var icMax = Math.log(alphabetSize) / Math.log(2);
  var i = 0;
  var conserv = _.map(ic, function(el) {
    var ret = (icMax - el);
    if(self.useGaps){
      ret = ret * (1 - gaps[i++]);
    }
    return ret;
  });
  return conserv;
};

// sequence conservation after Schneider and Stephens (1990)
// conservation for each amino acid
// * gaps are excluded
stat.prototype.conservResidue = function conservation(input) {
  var alphabetSize = input ? input.alphabetSize : undefined;
  var ic;
  var ignoredChars = this.ignoredChars;
  if (input !== undefined && input.scaled) {
    ic = this.scale(this.conservation(alphabetSize));
  } else {
    ic = this.conservation(alphabetSize);
  }
  var f = this.frequency();
  var keys;
  var conserv = _.map(f, function(el, i) {
    keys = _.reject(_.keys(el), function(c) {
      return ignoredChars.indexOf(c) >= 0;
    });
    var obj = {};
    _.each(keys, function(key) {
      obj[key] = el[key] * ic[i];
    });
    return obj;
  });
  return conserv;
};

// type 2 sequence logo method
// scales relative to background
stat.prototype.conservResidue2 = function conservation(alphabetSize) {
  var f = this.frequency();
  var ic = this.conservation(alphabetSize);
  var b = this.background();
  var conserv = _.map(f, function(el, i) {
    return _.map(el, function(val) {
      var sum = _.reduce(f[i], function(memo, e) {
        return memo + e / b[i];
      }, 0);
      return ((val / b[i]) / sum) * ic[i];
    }, 0);
  });
  return conserv;
};

// scale information content or conservation to 1
stat.prototype.scale = function conservation(ic, alphabetSize) {
  alphabetSize = alphabetSize || this.alphabetSize;
  var icMax = Math.log(alphabetSize) / Math.log(2);
  var conserv = _.map(ic, function(el) {
    return el / icMax;
  });
  return conserv;
};

stat.prototype.maxLengthCalc = function() {
  if(this.seqs.length === 0){
    return 0;
  }
  return _.max(this.seqs, function(seq) {
    return seq.length;
  }).length;
};

// seqs: array of sequences (strings)
// @returns consenus sequence
stat.prototype.consensusCalc = function consensusCal() {
  var occs = new Array(this.maxLength());

  // count the occurrences of the chars of a position
  _.each(this.seqs, function(el) {
    _.each(el, function(c, pos) {
      if (occs[pos] === undefined) {
        occs[pos] = {};
      }
      if (occs[pos][c] === undefined) {
        occs[pos][c] = 0;
      }
      occs[pos][c] ++;
    });
  });

  // now pick the char with most occurrences
  this._consensus = _.reduce(occs, function(memo, occ) {
    var keys;
    keys = _.keys(occ);
    return memo += _.max(keys, function(key) {
      return occ[key];
    });
  }, "");

  return this._consensus;
};

// seqs: array of sequences (strings)
// consensus: calculated consensus seq
// calculates for each sequence
// * matches with the consensus seq
// * identity = matchedChars / totalChars (excluding gaps)
// @returns: array of length of the seqs with the identity to the consensus (double)
stat.prototype.identityCalc = function identitiyCalc(compareSeq) {
  var consensus = compareSeq || this.consensus();
  this._identity = this.seqs.map(function(seq) {
    var matches = 0;
    var total = 0;
    for (var i = 0; i < seq.length; i++) {
      if (seq[i] !== "-" && consensus[i] !== "-") {
        total++;
        if (seq[i] === consensus[i]) {
          matches++;
        }
      }
    }
    return matches / total;
  });
  return this._identity;
};

// percentage of gaps per column
stat.prototype.gapsCalc = function gapsCount() {
  var mLength = this.maxLength();
  if(mLength <= 1 || typeof mLength === "undefined" ){
    return [];
  }
  var occs = new Array(this.maxLength());
  // count the occurrences of the chars of a position
  _.each(this.seqs, function(el) {
    _.each(el, function(c, pos) {
      if (occs[pos] === undefined) {
        occs[pos] = {
          g: 0,
          t: 0
        };
      }
      c = c === "-" ? "g" : "t";
      occs[pos][c] ++;
    });
  });

  // now pick the char with most occurrences
  this._gaps = _.map(occs, function(el) {
    return el.g / (el.g + el.t);
  });
  return this._gaps;
};

_.mixin({
  mapValues: function(obj, f_val) {
    return _.object(_.keys(obj), _.map(obj, f_val));
  }
});

require("biojs-events").mixin(stat.prototype);

module.exports = stat;

},{"biojs-events":16,"underscore":154}],138:[function(require,module,exports){
module.exports = require("./src/api.js");

},{"./src/api.js":139}],139:[function(require,module,exports){
var api = function (who) {

    var _methods = function () {
	var m = [];

	m.add_batch = function (obj) {
	    m.unshift(obj);
	};

	m.update = function (method, value) {
	    for (var i=0; i<m.length; i++) {
		for (var p in m[i]) {
		    if (p === method) {
			m[i][p] = value;
			return true;
		    }
		}
	    }
	    return false;
	};

	m.add = function (method, value) {
	    if (m.update (method, value) ) {
	    } else {
		var reg = {};
		reg[method] = value;
		m.add_batch (reg);
	    }
	};

	m.get = function (method) {
	    for (var i=0; i<m.length; i++) {
		for (var p in m[i]) {
		    if (p === method) {
			return m[i][p];
		    }
		}
	    }
	};

	return m;
    };

    var methods    = _methods();
    var api = function () {};

    api.check = function (method, check, msg) {
	if (method instanceof Array) {
	    for (var i=0; i<method.length; i++) {
		api.check(method[i], check, msg);
	    }
	    return;
	}

	if (typeof (method) === 'function') {
	    method.check(check, msg);
	} else {
	    who[method].check(check, msg);
	}
	return api;
    };

    api.transform = function (method, cbak) {
	if (method instanceof Array) {
	    for (var i=0; i<method.length; i++) {
		api.transform (method[i], cbak);
	    }
	    return;
	}

	if (typeof (method) === 'function') {
	    method.transform (cbak);
	} else {
	    who[method].transform(cbak);
	}
	return api;
    };

    var attach_method = function (method, opts) {
	var checks = [];
	var transforms = [];

	var getter = opts.on_getter || function () {
	    return methods.get(method);
	};

	var setter = opts.on_setter || function (x) {
	    for (var i=0; i<transforms.length; i++) {
		x = transforms[i](x);
	    }

	    for (var j=0; j<checks.length; j++) {
		if (!checks[j].check(x)) {
		    var msg = checks[j].msg || 
			("Value " + x + " doesn't seem to be valid for this method");
		    throw (msg);
		}
	    }
	    methods.add(method, x);
	};

	var new_method = function (new_val) {
	    if (!arguments.length) {
		return getter();
	    }
	    setter(new_val);
	    return who; // Return this?
	};
	new_method.check = function (cbak, msg) {
	    if (!arguments.length) {
		return checks;
	    }
	    checks.push ({check : cbak,
			  msg   : msg});
	    return this;
	};
	new_method.transform = function (cbak) {
	    if (!arguments.length) {
		return transforms;
	    }
	    transforms.push(cbak);
	    return this;
	};

	who[method] = new_method;
    };

    var getset = function (param, opts) {
	if (typeof (param) === 'object') {
	    methods.add_batch (param);
	    for (var p in param) {
		attach_method (p, opts);
	    }
	} else {
	    methods.add (param, opts.default_value);
	    attach_method (param, opts);
	}
    };

    api.getset = function (param, def) {
	getset(param, {default_value : def});

	return api;
    };

    api.get = function (param, def) {
	var on_setter = function () {
	    throw ("Method defined only as a getter (you are trying to use it as a setter");
	};

	getset(param, {default_value : def,
		       on_setter : on_setter}
	      );

	return api;
    };

    api.set = function (param, def) {
	var on_getter = function () {
	    throw ("Method defined only as a setter (you are trying to use it as a getter");
	};

	getset(param, {default_value : def,
		       on_getter : on_getter}
	      );

	return api;
    };

    api.method = function (name, cbak) {
	if (typeof (name) === 'object') {
	    for (var p in name) {
		who[p] = name[p];
	    }
	} else {
	    who[name] = cbak;
	}
	return api;
    };

    return api;
    
};

module.exports = exports = api;
},{}],140:[function(require,module,exports){
var node = require("./src/node.js");
module.exports = exports = node;

},{"./src/node.js":141}],141:[function(require,module,exports){
var apijs = require("tnt.api");
var iterator = require("tnt.utils").iterator;

var tnt_node = function (data) {
//tnt.tree.node = function (data) {
    "use strict";

    var node = function () {
    };

    var api = apijs (node);

    // API
//     node.nodes = function() {
// 	if (cluster === undefined) {
// 	    cluster = d3.layout.cluster()
// 	    // TODO: length and children should be exposed in the API
// 	    // i.e. the user should be able to change this defaults via the API
// 	    // children is the defaults for parse_newick, but maybe we should change that
// 	    // or at least not assume this is always the case for the data provided
// 		.value(function(d) {return d.length})
// 		.children(function(d) {return d.children});
// 	}
// 	nodes = cluster.nodes(data);
// 	return nodes;
//     };

    var apply_to_data = function (data, cbak) {
	cbak(data);
	if (data.children !== undefined) {
	    for (var i=0; i<data.children.length; i++) {
		apply_to_data(data.children[i], cbak);
	    }
	}
    };

    var create_ids = function () {
	var i = iterator(1);
	// We can't use apply because apply creates new trees on every node
	// We should use the direct data instead
	apply_to_data (data, function (d) {
	    if (d._id === undefined) {
		d._id = i();
		// TODO: Not sure _inSubTree is strictly necessary
		// d._inSubTree = {prev:true, curr:true};
	    }
	});
    };

    var link_parents = function (data) {
	if (data === undefined) {
	    return;
	}
	if (data.children === undefined) {
	    return;
	}
	for (var i=0; i<data.children.length; i++) {
	    // _parent?
	    data.children[i]._parent = data;
	    link_parents(data.children[i]);
	}
    };

    var compute_root_dists = function (data) {
	apply_to_data (data, function (d) {
	    var l;
	    if (d._parent === undefined) {
		d._root_dist = 0;
	    } else {
		var l = 0;
		if (d.branch_length) {
		    l = d.branch_length
		}
		d._root_dist = l + d._parent._root_dist;
	    }
	});
    };

    // TODO: data can't be rewritten used the api yet. We need finalizers
    node.data = function(new_data) {
	if (!arguments.length) {
	    return data
	}
	data = new_data;
	create_ids();
	link_parents(data);
	compute_root_dists(data);
	return node;
    };
    // We bind the data that has been passed
    node.data(data);

    api.method ('find_all', function (cbak, deep) {
	var nodes = [];
	node.apply (function (n) {
	    if (cbak(n)) {
		nodes.push (n);
	    }
	});
	return nodes;
    });
    
    api.method ('find_node', function (cbak, deep) {
	if (cbak(node)) {
	    return node;
	}

	if (data.children !== undefined) {
	    for (var j=0; j<data.children.length; j++) {
		var found = tnt_node(data.children[j]).find_node(cbak, deep);
		if (found) {
		    return found;
		}
	    }
	}

	if (deep && (data._children !== undefined)) {
	    for (var i=0; i<data._children.length; i++) {
		tnt_node(data._children[i]).find_node(cbak, deep)
		var found = tnt_node(data._children[i]).find_node(cbak, deep);
		if (found) {
		    return found;
		}
	    }
	}
    });

    api.method ('find_node_by_name', function(name, deep) {
	return node.find_node (function (node) {
	    return node.node_name() === name
	}, deep);
    });

    api.method ('toggle', function() {
	if (data) {
	    if (data.children) { // Uncollapsed -> collapse
		var hidden = 0;
		node.apply (function (n) {
		    var hidden_here = n.n_hidden() || 0;
		    hidden += (n.n_hidden() || 0) + 1;
		});
		node.n_hidden (hidden-1);
		data._children = data.children;
		data.children = undefined;
	    } else {             // Collapsed -> uncollapse
		node.n_hidden(0);
		data.children = data._children;
		data._children = undefined;
	    }
	}
	return this;
    });

    api.method ('is_collapsed', function () {
	return (data._children !== undefined && data.children === undefined);
    });

    var has_ancestor = function(n, ancestor) {
	// It is better to work at the data level
	n = n.data();
	ancestor = ancestor.data();
	if (n._parent === undefined) {
	    return false
	}
	n = n._parent
	for (;;) {
	    if (n === undefined) {
		return false;
	    }
	    if (n === ancestor) {
		return true;
	    }
	    n = n._parent;
	}
    };

    // This is the easiest way to calculate the LCA I can think of. But it is very inefficient too.
    // It is working fine by now, but in case it needs to be more performant we can implement the LCA
    // algorithm explained here:
    // http://community.topcoder.com/tc?module=Static&d1=tutorials&d2=lowestCommonAncestor
    api.method ('lca', function (nodes) {
	if (nodes.length === 1) {
	    return nodes[0];
	}
	var lca_node = nodes[0];
	for (var i = 1; i<nodes.length; i++) {
	    lca_node = _lca(lca_node, nodes[i]);
	}
	return lca_node;
	// return tnt_node(lca_node);
    });

    var _lca = function(node1, node2) {
	if (node1.data() === node2.data()) {
	    return node1;
	}
	if (has_ancestor(node1, node2)) {
	    return node2;
	}
	return _lca(node1, node2.parent());
    };

    api.method('n_hidden', function (val) {
	if (!arguments.length) {
	    return node.property('_hidden');
	}
	node.property('_hidden', val);
	return node
    });

    api.method ('get_all_nodes', function (deep) {
	var nodes = [];
	node.apply(function (n) {
	    nodes.push(n);
	}, deep);
	return nodes;
    });

    api.method ('get_all_leaves', function (deep) {
	var leaves = [];
	node.apply(function (n) {
	    if (n.is_leaf(deep)) {
		leaves.push(n);
	    }
	}, deep);
	return leaves;
    });

    api.method ('upstream', function(cbak) {
	cbak(node);
	var parent = node.parent();
	if (parent !== undefined) {
	    parent.upstream(cbak);
	}
//	tnt_node(parent).upstream(cbak);
// 	node.upstream(node._parent, cbak);
    });

    api.method ('subtree', function(nodes, keep_singletons) {
	if (keep_singletons === undefined) {
	    keep_singletons = false;
	}
    	var node_counts = {};
    	for (var i=0; i<nodes.length; i++) {
	    var n = nodes[i];
	    if (n !== undefined) {
		n.upstream (function (this_node){
		    var id = this_node.id();
		    if (node_counts[id] === undefined) {
			node_counts[id] = 0;
		    }
		    node_counts[id]++
    		});
	    }
    	}
    
	var is_singleton = function (node_data) {
	    var n_children = 0;
	    if (node_data.children === undefined) {
		return false;
	    }
	    for (var i=0; i<node_data.children.length; i++) {
		var id = node_data.children[i]._id;
		if (node_counts[id] > 0) {
		    n_children++;
		}
	    }
	    return n_children === 1;
	};

	var subtree = {};
	copy_data (data, subtree, 0, function (node_data) {
	    var node_id = node_data._id;
	    var counts = node_counts[node_id];
	    
	    // Is in path
	    if (counts > 0) {
		if (is_singleton(node_data) && !keep_singletons) {
		    return false; 
		}
		return true;
	    }
	    // Is not in path
	    return false;
	});

	return tnt_node(subtree.children[0]);
    });

    var copy_data = function (orig_data, subtree, currBranchLength, condition) {
        if (orig_data === undefined) {
	    return;
        }

        if (condition(orig_data)) {
	    var copy = copy_node(orig_data, currBranchLength);
	    if (subtree.children === undefined) {
                subtree.children = [];
	    }
	    subtree.children.push(copy);
	    if (orig_data.children === undefined) {
                return;
	    }
	    for (var i = 0; i < orig_data.children.length; i++) {
                copy_data (orig_data.children[i], copy, 0, condition);
	    }
        } else {
	    if (orig_data.children === undefined) {
                return;
	    }
	    currBranchLength += orig_data.branch_length || 0;
	    for (var i = 0; i < orig_data.children.length; i++) {
                copy_data(orig_data.children[i], subtree, currBranchLength, condition);
	    }
        }
    };

    var copy_node = function (node_data, extraBranchLength) {
	var copy = {};
	// copy all the own properties excepts links to other nodes or depth
	for (var param in node_data) {
	    if ((param === "children") ||
		(param === "_children") ||
		(param === "_parent") ||
		(param === "depth")) {
		continue;
	    }
	    if (node_data.hasOwnProperty(param)) {
		copy[param] = node_data[param];
	    }
	}
	if ((copy.branch_length !== undefined) && (extraBranchLength !== undefined)) {
	    copy.branch_length += extraBranchLength;
	}
	return copy;
    };

    
    // TODO: This method visits all the nodes
    // a more performant version should return true
    // the first time cbak(node) is true
    api.method ('present', function (cbak) {
	// cbak should return true/false
	var is_true = false;
	node.apply (function (n) {
	    if (cbak(n) === true) {
		is_true = true;
	    }
	});
	return is_true;
    });

    // cbak is called with two nodes
    // and should return a negative number, 0 or a positive number
    api.method ('sort', function (cbak) {
	if (data.children === undefined) {
	    return;
	}

	var new_children = [];
	for (var i=0; i<data.children.length; i++) {
	    new_children.push(tnt_node(data.children[i]));
	}

	new_children.sort(cbak);

	data.children = [];
	for (var i=0; i<new_children.length; i++) {
	    data.children.push(new_children[i].data());
	}

	for (var i=0; i<data.children.length; i++) {
	    tnt_node(data.children[i]).sort(cbak);
	}
    });

    api.method ('flatten', function (preserve_internal) {
	if (node.is_leaf()) {
	    return node;
	}
	var data = node.data();
	var newroot = copy_node(data);
	var nodes;
	if (preserve_internal) {
	    nodes = node.get_all_nodes();
	    nodes.shift(); // the self node is also included
	} else {
	    nodes = node.get_all_leaves();
	}
	newroot.children = [];
	for (var i=0; i<nodes.length; i++) {
	    delete (nodes[i].children);
	    newroot.children.push(copy_node(nodes[i].data()));
	}

	return tnt_node(newroot);
    });

    
    // TODO: This method only 'apply's to non collapsed nodes (ie ._children is not visited)
    // Would it be better to have an extra flag (true/false) to visit also collapsed nodes?
    api.method ('apply', function(cbak, deep) {
	if (deep === undefined) {
	    deep = false;
	}
	cbak(node);
	if (data.children !== undefined) {
	    for (var i=0; i<data.children.length; i++) {
		var n = tnt_node(data.children[i])
		n.apply(cbak, deep);
	    }
	}

	if ((data._children !== undefined) && deep) {
	    for (var j=0; j<data._children.length; j++) {
		var n = tnt_node(data._children[j]);
		n.apply(cbak, deep);
	    }
	}
    });

    // TODO: Not sure if it makes sense to set via a callback:
    // root.property (function (node, val) {
    //    node.deeper.field = val
    // }, 'new_value')
    api.method ('property', function(prop, value) {
	if (arguments.length === 1) {
	    if ((typeof prop) === 'function') {
		return prop(data)	
	    }
	    return data[prop]
	}
	if ((typeof prop) === 'function') {
	    prop(data, value);   
	}
	data[prop] = value;
	return node;
    });

    api.method ('is_leaf', function(deep) {
	if (deep) {
	    return ((data.children === undefined) && (data._children === undefined));
	}
	return data.children === undefined;
    });

    // It looks like the cluster can't be used for anything useful here
    // It is now included as an optional parameter to the tnt.tree() method call
    // so I'm commenting the getter
    // node.cluster = function() {
    // 	return cluster;
    // };

    // node.depth = function (node) {
    //     return node.depth;
    // };

//     node.name = function (node) {
//         return node.name;
//     };

    api.method ('id', function () {
	return node.property('_id');
    });

    api.method ('node_name', function () {
	return node.property('name');
    });

    api.method ('branch_length', function () {
	return node.property('branch_length');
    });

    api.method ('root_dist', function () {
	return node.property('_root_dist');
    });

    api.method ('children', function (deep) {
	var children = [];

	if (data.children) {
	    for (var i=0; i<data.children.length; i++) {
		children.push(tnt_node(data.children[i]));
	    }
	}
	if ((data._children) && deep) {
	    for (var j=0; j<data._children.length; j++) {
		children.push(tnt_node(data._children[j]));
	    }
	}
	if (children.length === 0) {
	    return undefined;
	}
	return children;
    });

    api.method ('parent', function () {
	if (data._parent === undefined) {
	    return undefined;
	}
	return tnt_node(data._parent);
    });

    return node;

};

module.exports = exports = tnt_node;


},{"tnt.api":138,"tnt.utils":149}],142:[function(require,module,exports){
// if (typeof tnt === "undefined") {
//     module.exports = tnt = {}
// }
module.exports = tree = require("./src/index.js");
var eventsystem = require("biojs-events");
eventsystem.mixin(tree);
//tnt.utils = require("tnt.utils");
//tnt.tooltip = require("tnt.tooltip");
//tnt.tree = require("./src/index.js");


},{"./src/index.js":144,"biojs-events":16}],143:[function(require,module,exports){
var apijs = require('tnt.api');
var tree = {};

tree.diagonal = function () {
    var d = function (diagonalPath) {
        var source = diagonalPath.source;
        var target = diagonalPath.target;
        var midpointX = (source.x + target.x) / 2;
        var midpointY = (source.y + target.y) / 2;
        var pathData = [source, {x: target.x, y: source.y}, target];
        pathData = pathData.map(d.projection());
        return d.path()(pathData, radial_calc.call(this,pathData));
    };

    var api = apijs (d)
    	.getset ('projection')
    	.getset ('path');

    var coordinateToAngle = function (coord, radius) {
      	var wholeAngle = 2 * Math.PI,
        quarterAngle = wholeAngle / 4;

      	var coordQuad = coord[0] >= 0 ? (coord[1] >= 0 ? 1 : 2) : (coord[1] >= 0 ? 4 : 3),
        coordBaseAngle = Math.abs(Math.asin(coord[1] / radius));

      	// Since this is just based on the angle of the right triangle formed
      	// by the coordinate and the origin, each quad will have different
      	// offsets
      	var coordAngle;
      	switch (coordQuad) {
      	case 1:
      	    coordAngle = quarterAngle - coordBaseAngle;
      	    break;
      	case 2:
      	    coordAngle = quarterAngle + coordBaseAngle;
      	    break;
      	case 3:
      	    coordAngle = 2*quarterAngle + quarterAngle - coordBaseAngle;
      	    break;
      	case 4:
      	    coordAngle = 3*quarterAngle + coordBaseAngle;
      	}
      	return coordAngle;
    };

    var radial_calc = function (pathData) {
        var src = pathData[0];
        var mid = pathData[1];
        var dst = pathData[2];
        var radius = Math.sqrt(src[0]*src[0] + src[1]*src[1]);
        var srcAngle = coordinateToAngle(src, radius);
        var midAngle = coordinateToAngle(mid, radius);
        var clockwise = Math.abs(midAngle - srcAngle) > Math.PI ? midAngle <= srcAngle : midAngle > srcAngle;
        return {
            radius   : radius,
            clockwise : clockwise
        };
    };

    return d;
};

// vertical diagonal for rect branches
tree.diagonal.vertical = function (useArc) {
    var path = function(pathData, obj) {
        var src = pathData[0];
        var mid = pathData[1];
        var dst = pathData[2];
        var radius = (mid[1] - src[1]) * 2000;

        return "M" + src + " A" + [radius,radius] + " 0 0,0 " + mid + "M" + mid + "L" + dst;
        // return "M" + src + " L" + mid + " L" + dst;
    };

    var projection = function(d) {
        return [d.y, d.x];
    };

    return tree.diagonal()
      	.path(path)
      	.projection(projection);
};

tree.diagonal.radial = function () {
    var path = function(pathData, obj) {
        var src = pathData[0];
        var mid = pathData[1];
        var dst = pathData[2];
        var radius = obj.radius;
        var clockwise = obj.clockwise;

        if (clockwise) {
            return "M" + src + " A" + [radius,radius] + " 0 0,0 " + mid + "M" + mid + "L" + dst;
        } else {
            return "M" + mid + " A" + [radius,radius] + " 0 0,0 " + src + "M" + mid + "L" + dst;
        }
    };

    var projection = function(d) {
      	var r = d.y, a = (d.x - 90) / 180 * Math.PI;
      	return [r * Math.cos(a), r * Math.sin(a)];
    };

    return tree.diagonal()
      	.path(path)
      	.projection(projection);
};

module.exports = exports = tree.diagonal;

},{"tnt.api":138}],144:[function(require,module,exports){
var tree = require ("./tree.js");
tree.label = require("./label.js");
tree.diagonal = require("./diagonal.js");
tree.layout = require("./layout.js");
tree.node_display = require("./node_display.js");
// tree.node = require("tnt.tree.node");
// tree.parse_newick = require("tnt.newick").parse_newick;
// tree.parse_nhx = require("tnt.newick").parse_nhx;

module.exports = exports = tree;


},{"./diagonal.js":143,"./label.js":145,"./layout.js":146,"./node_display.js":147,"./tree.js":148}],145:[function(require,module,exports){
var apijs = require("tnt.api");
var tree = {};

tree.label = function () {
    "use strict";

    var dispatch = d3.dispatch ("click", "dblclick", "mouseover", "mouseout")

    // TODO: Not sure if we should be removing by default prev labels
    // or it would be better to have a separate remove method called by the vis
    // on update
    // We also have the problem that we may be transitioning from
    // text to img labels and we need to remove the label of a different type
    var label = function (node, layout_type, node_size) {
        if (typeof (node) !== 'function') {
            throw(node);
        }

        label.display().call(this, node, layout_type)
            .attr("class", "tnt_tree_label")
            .attr("transform", function (d) {
                var t = label.transform()(node, layout_type);
                return "translate (" + (t.translate[0] + node_size) + " " + t.translate[1] + ")rotate(" + t.rotate + ")";
            })
        // TODO: this click event is probably never fired since there is an onclick event in the node g element?
            .on("click", function () {
                dispatch.click.call(this, node)
            })
            .on("dblclick", function () {
                dispatch.dblclick.call(this, node)
            })
            .on("mouseover", function () {
                dispatch.mouseover.call(this, node)
            })
            .on("mouseout", function () {
                dispatch.mouseout.call(this, node)
            })
    };

    var api = apijs (label)
        .getset ('width', function () { throw "Need a width callback" })
        .getset ('height', function () { throw "Need a height callback" })
        .getset ('display', function () { throw "Need a display callback" })
        .getset ('transform', function () { throw "Need a transform callback" })
        //.getset ('on_click');

    return d3.rebind (label, dispatch, "on");
};

// Text based labels
tree.label.text = function () {
    var label = tree.label();

    var api = apijs (label)
        .getset ('fontsize', 10)
        .getset ('fontweight', "normal")
        .getset ('color', "#000")
        .getset ('text', function (d) {
            return d.data().name;
        })

    label.display (function (node, layout_type) {
        var l = d3.select(this)
            .append("text")
            .attr("text-anchor", function (d) {
                if (layout_type === "radial") {
                    return (d.x%360 < 180) ? "start" : "end";
                }
                return "start";
            })
            .text(function(){
                return label.text()(node)
            })
            .style('font-size', function () {
                return d3.functor(label.fontsize())(node) + "px";
            })
            .style('font-weight', function () {
                return d3.functor(label.fontweight())(node);
            })
            .style('fill', d3.functor(label.color())(node));

        return l;
    });

    label.transform (function (node, layout_type) {
        var d = node.data();
        var t = {
            translate : [5, 5],
            rotate : 0
        };
        if (layout_type === "radial") {
            t.translate[1] = t.translate[1] - (d.x%360 < 180 ? 0 : label.fontsize())
            t.rotate = (d.x%360 < 180 ? 0 : 180)
        }
        return t;
    });


    // label.transform (function (node) {
    // 	var d = node.data();
    // 	return "translate(10 5)rotate(" + (d.x%360 < 180 ? 0 : 180) + ")";
    // });

    label.width (function (node) {
        var svg = d3.select("body")
            .append("svg")
            .attr("height", 0)
            .style('visibility', 'hidden');

        var text = svg
            .append("text")
            .style('font-size', d3.functor(label.fontsize())(node) + "px")
            .text(label.text()(node));

        var width = text.node().getBBox().width;
        svg.remove();

        return width;
    });

    label.height (function (node) {
        return d3.functor(label.fontsize())(node);
    });

    return label;
};

// Image based labels
tree.label.img = function () {
    var label = tree.label();

    var api = apijs (label)
        .getset ('src', function () {})

    label.display (function (node, layout_type) {
        if (label.src()(node)) {
            var l = d3.select(this)
                .append("image")
                .attr("width", label.width()())
                .attr("height", label.height()())
                .attr("xlink:href", label.src()(node));
            return l;
        }
        // fallback text in case the img is not found?
        return d3.select(this)
            .append("text")
            .text("");
    });

    label.transform (function (node, layout_type) {
        var d = node.data();
        var t = {
            translate : [10, (-label.height()() / 2)],
            rotate : 0
        };

        if (layout_type === 'radial') {
            t.translate[0] = t.translate[0] + (d.x%360 < 180 ? 0 : label.width()()),
            t.translate[1] = t.translate[1] + (d.x%360 < 180 ? 0 : label.height()()),
            t.rotate = (d.x%360 < 180 ? 0 : 180)
        }

        return t;
    });

    return label;
};

// Labels made of 2+ simple labels
tree.label.composite = function () {
    var labels = [];

    var label = function (node, layout_type, node_size) {
        var curr_xoffset = 0;

        for (var i=0; i<labels.length; i++) {
            var display = labels[i];

            (function (offset) {
                display.transform (function (node, layout_type) {
                    var tsuper = display._super_.transform()(node, layout_type);
                    var t = {
                        translate : [offset + tsuper.translate[0], tsuper.translate[1]],
                        rotate : tsuper.rotate
                    };
                    return t;
                })
            })(curr_xoffset);

            curr_xoffset += 10;
            curr_xoffset += display.width()(node);

            display.call(this, node, layout_type, node_size);
        }
    };

    var api = apijs (label)

    api.method ('add_label', function (display, node) {
        display._super_ = {};
        apijs (display._super_)
            .get ('transform', display.transform());

        labels.push(display);
        return label;
    });

    api.method ('width', function () {
        return function (node) {
            var tot_width = 0;
            for (var i=0; i<labels.length; i++) {
                tot_width += parseInt(labels[i].width()(node));
                tot_width += parseInt(labels[i]._super_.transform()(node).translate[0]);
            }

            return tot_width;
        }
    });

    api.method ('height', function () {
        return function (node) {
            var max_height = 0;
            for (var i=0; i<labels.length; i++) {
                var curr_height = labels[i].height()(node);
                if ( curr_height > max_height) {
                    max_height = curr_height;
                }
            }
            return max_height;
        }
    });

    return label;
};

module.exports = exports = tree.label;

},{"tnt.api":138}],146:[function(require,module,exports){
// Based on the code by Ken-ichi Ueda in http://bl.ocks.org/kueda/1036776#d3.phylogram.js

var apijs = require("tnt.api");
var diagonal = require("./diagonal.js");
var tree = {};

tree.layout = function () {

    var l = function () {
    };

    var cluster = d3.layout.cluster()
    	.sort(null)
    	.value(function (d) {return d.length;} )
    	.separation(function () {return 1;});

    var api = apijs (l)
    	.getset ('scale', true)
    	.getset ('max_leaf_label_width', 0)
    	.method ("cluster", cluster)
    	.method('yscale', function () {throw "yscale is not defined in the base object";})
    	.method('adjust_cluster_size', function () {throw "adjust_cluster_size is not defined in the base object"; })
    	.method('width', function () {throw "width is not defined in the base object";})
    	.method('height', function () {throw "height is not defined in the base object";});

    api.method('scale_branch_lengths', function (curr) {
    	if (l.scale() === false) {
    	    return;
    	}

    	var nodes = curr.nodes;
    	var tree = curr.tree;

    	var root_dists = nodes.map (function (d) {
    	    return d._root_dist;
    	});

    	var yscale = l.yscale(root_dists);
    	tree.apply (function (node) {
    	    node.property("y", yscale(node.root_dist()));
    	});
    });

    return l;
};

tree.layout.vertical = function () {
    var layout = tree.layout();
    // Elements like 'labels' depend on the layout type. This exposes a way of identifying the layout type
    layout.type = "vertical";

    var api = apijs (layout)
    	.getset ('width', 360)
    	.get ('translate_vis', [20,20])
    	.method ('diagonal', diagonal.vertical)
    	.method ('transform_node', function (d) {
        	    return "translate(" + d.y + "," + d.x + ")";
    	});

    api.method('height', function (params) {
    	return (params.n_leaves * params.label_height);
    });

    api.method('yscale', function (dists) {
    	return d3.scale.linear()
    	    .domain([0, d3.max(dists)])
    	    .range([0, layout.width() - 20 - layout.max_leaf_label_width()]);
    });

    api.method('adjust_cluster_size', function (params) {
    	var h = layout.height(params);
    	var w = layout.width() - layout.max_leaf_label_width() - layout.translate_vis()[0] - params.label_padding;
    	layout.cluster.size ([h,w]);
    	return layout;
    });

    return layout;
};

tree.layout.radial = function () {
    var layout = tree.layout();
    // Elements like 'labels' depend on the layout type. This exposes a way of identifying the layout type
    layout.type = 'radial';

    var default_width = 360;
    var r = default_width / 2;

    var conf = {
    	width : 360
    };

    var api = apijs (layout)
    	.getset (conf)
    	.getset ('translate_vis', [r, r]) // TODO: 1.3 should be replaced by a sensible value
    	.method ('transform_node', function (d) {
    	    return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
    	})
    	.method ('diagonal', diagonal.radial)
    	.method ('height', function () { return conf.width; });

    // Changes in width affect changes in r
    layout.width.transform (function (val) {
    	r = val / 2;
    	layout.cluster.size([360, r]);
    	layout.translate_vis([r, r]);
    	return val;
    });

    api.method ("yscale",  function (dists) {
	return d3.scale.linear()
	    .domain([0,d3.max(dists)])
	    .range([0, r]);
    });

    api.method ("adjust_cluster_size", function (params) {
    	r = (layout.width()/2) - layout.max_leaf_label_width() - 20;
    	layout.cluster.size([360, r]);
    	return layout;
    });

    return layout;
};

module.exports = exports = tree.layout;

},{"./diagonal.js":143,"tnt.api":138}],147:[function(require,module,exports){
var apijs = require("tnt.api");
var tree = {};

tree.node_display = function () {
    "use strict";

    var n = function (node) {
        var proxy;
        var thisProxy = d3.select(this).select(".tnt_tree_node_proxy");
        if (thisProxy[0][0] === null) {
            var size = d3.functor(n.size())(node);
            proxy = d3.select(this)
                .append("rect")
                .attr("class", "tnt_tree_node_proxy");
        } else {
            proxy = thisProxy;
        }

    	n.display().call(this, node);
        var dim = this.getBBox();
        proxy
            .attr("x", dim.x)
            .attr("y", dim.y)
            .attr("width", dim.width)
            .attr("height", dim.height);
    };

    var api = apijs (n)
    	.getset("size", 4.4)
    	.getset("fill", "black")
    	.getset("stroke", "black")
    	.getset("stroke_width", "1px")
    	.getset("display", function () {
            throw "display is not defined in the base object";
        });
    api.method("reset", function () {
        d3.select(this)
            .selectAll("*:not(.tnt_tree_node_proxy)")
            .remove();
    });

    return n;
};

tree.node_display.circle = function () {
    var n = tree.node_display();

    n.display (function (node) {
    	d3.select(this)
            .append("circle")
            .attr("r", function (d) {
                return d3.functor(n.size())(node);
            })
            .attr("fill", function (d) {
                return d3.functor(n.fill())(node);
            })
            .attr("stroke", function (d) {
                return d3.functor(n.stroke())(node);
            })
            .attr("stroke-width", function (d) {
                return d3.functor(n.stroke_width())(node);
            })
            .attr("class", "tnt_node_display_elem");
    });

    return n;
};

tree.node_display.square = function () {
    var n = tree.node_display();

    n.display (function (node) {
	var s = d3.functor(n.size())(node);
	d3.select(this)
        .append("rect")
        .attr("x", function (d) {
            return -s;
        })
        .attr("y", function (d) {
            return -s;
        })
        .attr("width", function (d) {
            return s*2;
        })
        .attr("height", function (d) {
            return s*2;
        })
        .attr("fill", function (d) {
            return d3.functor(n.fill())(node);
        })
        .attr("stroke", function (d) {
            return d3.functor(n.stroke())(node);
        })
        .attr("stroke-width", function (d) {
            return d3.functor(n.stroke_width())(node);
        })
        .attr("class", "tnt_node_display_elem");
    });

    return n;
};

tree.node_display.triangle = function () {
    var n = tree.node_display();

    n.display (function (node) {
	var s = d3.functor(n.size())(node);
	d3.select(this)
        .append("polygon")
        .attr("points", (-s) + ",0 " + s + "," + (-s) + " " + s + "," + s)
        .attr("fill", function (d) {
            return d3.functor(n.fill())(node);
        })
        .attr("stroke", function (d) {
            return d3.functor(n.stroke())(node);
        })
        .attr("stroke-width", function (d) {
            return d3.functor(n.stroke_width())(node);
        })
        .attr("class", "tnt_node_display_elem");
    });

    return n;
};

// tree.node_display.cond = function () {
//     var n = tree.node_display();
//
//     // conditions are objects with
//     // name : a name for this display
//     // callback: the condition to apply (receives a tnt.node)
//     // display: a node_display
//     var conds = [];
//
//     n.display (function (node) {
//         var s = d3.functor(n.size())(node);
//         for (var i=0; i<conds.length; i++) {
//             var cond = conds[i];
//             // For each node, the first condition met is used
//             if (d3.functor(cond.callback).call(this, node) === true) {
//                 cond.display.call(this, node);
//                 break;
//             }
//         }
//     });
//
//     var api = apijs(n);
//
//     api.method("add", function (name, cbak, node_display) {
//         conds.push({ name : name,
//             callback : cbak,
//             display : node_display
//         });
//         return n;
//     });
//
//     api.method("reset", function () {
//         conds = [];
//         return n;
//     });
//
//     api.method("update", function (name, cbak, new_display) {
//         for (var i=0; i<conds.length; i++) {
//             if (conds[i].name === name) {
//                 conds[i].callback = cbak;
//                 conds[i].display = new_display;
//             }
//         }
//         return n;
//     });
//
//     return n;
//
// };

module.exports = exports = tree.node_display;

},{"tnt.api":138}],148:[function(require,module,exports){
var apijs = require("tnt.api");
var tnt_tree_node = require("tnt.tree.node");

var tree = function () {
    "use strict";

    var dispatch = d3.dispatch ("click", "dblclick", "mouseover", "mouseout");

    var conf = {
        duration         : 500,      // Duration of the transitions
        node_display     : tree.node_display.circle(),
        label            : tree.label.text(),
        layout           : tree.layout.vertical(),
        // on_click         : function () {},
        // on_dbl_click     : function () {},
        // on_mouseover     : function () {},
        branch_color     : 'black',
        id               : function (d) {
            return d._id;
        }
    };

    // Keep track of the focused node
    // TODO: Would it be better to have multiple focused nodes? (ie use an array)
    // var focused_node;

    // Extra delay in the transitions (TODO: Needed?)
    var delay = 0;

    // Ease of the transitions
    var ease = "cubic-in-out";

    // The id of the tree container
    var div_id;

    // The tree visualization (svg)
    var svg;
    var vis;
    var links_g;
    var nodes_g;

    // TODO: For now, counts are given only for leaves
    // but it may be good to allow counts for internal nodes
    var counts = {};

    // The full tree
    var base = {
        tree : undefined,
        data : undefined,
        nodes : undefined,
        links : undefined
    };

    // The curr tree. Needed to re-compute the links / nodes positions of subtrees
    var curr = {
        tree : undefined,
        data : undefined,
        nodes : undefined,
        links : undefined
    };

    // The cbak returned
    var t = function (div) {
    	div_id = d3.select(div).attr("id");

        var tree_div = d3.select(div)
            .append("h2")
            .text("This phylogenetic tree is built from the core part (see annotation on MSA) of the alignment. Click on sequence to highlight tree node. Click on nodes to highligh sequences, collapse/expand branches.")
            .append("div")
            .style("width", (conf.layout.width() +  "px"))
            .attr("class", "tnt_groupDiv");

    	var cluster = conf.layout.cluster;

    	var n_leaves = curr.tree.get_all_leaves().length;

    	var max_leaf_label_length = function (tree) {
    	    var max = 0;
    	    var leaves = tree.get_all_leaves();
    	    for (var i=0; i<leaves.length; i++) {
                var label_width = conf.label.width()(leaves[i]) + d3.functor (conf.node_display.size())(leaves[i]);
                if (label_width > max) {
                    max = label_width;
                }
    	    }
    	    return max;
    	};

        var max_leaf_node_height = function (tree) {
            var max = 0;
            var leaves = tree.get_all_leaves();
            for (var i=0; i<leaves.length; i++) {
                var node_height = d3.functor(conf.node_display.size())(leaves[i]) * 2;
                var label_height = d3.functor(conf.label.height())(leaves[i]);

                max = d3.max([max, node_height, label_height]);
            }
            return max;
        };

    	var max_label_length = max_leaf_label_length(curr.tree);
    	conf.layout.max_leaf_label_width(max_label_length);

    	var max_node_height = max_leaf_node_height(curr.tree);

    	// Cluster size is the result of...
    	// total width of the vis - transform for the tree - max_leaf_label_width - horizontal transform of the label
    	// TODO: Substitute 15 by the horizontal transform of the nodes
    	var cluster_size_params = {
    	    n_leaves : n_leaves,
    	    label_height : max_node_height,
    	    label_padding : 15
    	};

    	conf.layout.adjust_cluster_size(cluster_size_params);

    	var diagonal = conf.layout.diagonal();
    	var transform = conf.layout.transform_node;

    	svg = tree_div
    	    .append("svg")
    	    .attr("width", conf.layout.width())
    	    .attr("height", conf.layout.height(cluster_size_params) + 30)
    	    .attr("fill", "none");

    	vis = svg
    	    .append("g")
    	    .attr("id", "tnt_st_" + div_id)
    	    .attr("transform",
    		  "translate(" +
    		  conf.layout.translate_vis()[0] +
    		  "," +
    		  conf.layout.translate_vis()[1] +
    		  ")");

    	curr.nodes = cluster.nodes(curr.data);
    	conf.layout.scale_branch_lengths(curr);
    	curr.links = cluster.links(curr.nodes);

    	// LINKS
    	// All the links are grouped in a g element
    	links_g = vis
    	    .append("g")
    	    .attr("class", "links");
    	nodes_g = vis
    	    .append("g")
    	    .attr("class", "nodes");

    	//var link = vis
    	var link = links_g
    	    .selectAll("path.tnt_tree_link")
    	    .data(curr.links, function(d){
                return conf.id(d.target);
            });

    	link
    	    .enter()
    	    .append("path")
    	    .attr("class", "tnt_tree_link")
    	    .attr("id", function(d) {
    	    	return "tnt_tree_link_" + div_id + "_" + conf.id(d.target);
    	    })
    	    .style("stroke", function (d) {
                return d3.functor(conf.branch_color)(tnt_tree_node(d.source), tnt_tree_node(d.target));
    	    })
    	    .attr("d", diagonal);

    	// NODES
    	//var node = vis
    	var node = nodes_g
    	    .selectAll("g.tnt_tree_node")
    	    .data(curr.nodes, function(d) {
                return conf.id(d);
            });

    	var new_node = node
    	    .enter().append("g")
    	    .attr("class", function(n) {
        		if (n.children) {
        		    if (n.depth === 0) {
            			return "root tnt_tree_node";
        		    } else {
            			return "inner tnt_tree_node";
        		    }
        		} else {
        		    return "leaf tnt_tree_node";
        		}
        	})
    	    .attr("id", function(d) {
        		return "tnt_tree_node_" + div_id + "_" + d._id;
    	    })
    	    .attr("transform", transform);

    	// display node shape
    	new_node
    	    .each (function (d) {
        		conf.node_display.call(this, tnt_tree_node(d));
    	    });

    	// display node label
    	new_node
    	    .each (function (d) {
    	    	conf.label.call(this, tnt_tree_node(d), conf.layout.type, d3.functor(conf.node_display.size())(tnt_tree_node(d)));
    	    });

        new_node.on("click", function (node) {
            var my_node = tnt_tree_node(node);
            tree.trigger("node:click", my_node);
            dispatch.click.call(this, my_node);
        });
        new_node.on("dblclick", function (node) {
            var my_node = tnt_tree_node(node);
            tree.trigger("node:dblclick", my_node);
            dispatch.dblclick.call(this, my_node);
        });
        new_node.on("mouseover", function (node) {
            var my_node = tnt_tree_node(node);
            tree.trigger("node:hover", tnt_tree_node(node));
            dispatch.mouseover.call(this, my_node);
        });
        new_node.on("mouseout", function (node) {
            var my_node = tnt_tree_node(node);
            tree.trigger("node:mouseout", tnt_tree_node(node));
            dispatch.mouseout.call(this, my_node);
        });


    	// Update plots an updated tree
        api.method ('update', function() {
            tree_div
                .style("width", (conf.layout.width() + "px"));
    	    svg.attr("width", conf.layout.width());

    	    var cluster = conf.layout.cluster;
    	    var diagonal = conf.layout.diagonal();
    	    var transform = conf.layout.transform_node;

    	    var max_label_length = max_leaf_label_length(curr.tree);
    	    conf.layout.max_leaf_label_width(max_label_length);

    	    var max_node_height = max_leaf_node_height(curr.tree);

    	    // Cluster size is the result of...
    	    // total width of the vis - transform for the tree - max_leaf_label_width - horizontal transform of the label
        	// TODO: Substitute 15 by the transform of the nodes (probably by selecting one node assuming all the nodes have the same transform
    	    var n_leaves = curr.tree.get_all_leaves().length;
    	    var cluster_size_params = {
        		n_leaves : n_leaves,
        		label_height : max_node_height,
        		label_padding : 15
    	    };
    	    conf.layout.adjust_cluster_size(cluster_size_params);

            svg
                .transition()
                .duration(conf.duration)
                .ease(ease)
                .attr("height", conf.layout.height(cluster_size_params) + 30); // height is in the layout

    	    vis
                .transition()
                .duration(conf.duration)
                .attr("transform",
                "translate(" +
                conf.layout.translate_vis()[0] +
                "," +
                conf.layout.translate_vis()[1] +
                ")");

            curr.nodes = cluster.nodes(curr.data);
            conf.layout.scale_branch_lengths(curr);
            curr.links = cluster.links(curr.nodes);

    	    // LINKS
    	    var link = links_g
        		.selectAll("path.tnt_tree_link")
        		.data(curr.links, function(d){
                    return conf.id(d.target);
                });

            // NODES
    	    var node = nodes_g
        		.selectAll("g.tnt_tree_node")
        		.data(curr.nodes, function(d) {
                    return conf.id(d);
                });

    	    var exit_link = link
        		.exit()
        		.remove();

    	    link
        		.enter()
        		.append("path")
        		.attr("class", "tnt_tree_link")
        		.attr("id", function (d) {
        		    return "tnt_tree_link_" + div_id + "_" + conf.id(d.target);
        		})
        		.attr("stroke", function (d) {
        		    return d3.functor(conf.branch_color)(tnt_tree_node(d.source), tnt_tree_node(d.target));
        		})
        		.attr("d", diagonal);

    	    link
    	    	.transition()
        		.ease(ease)
    	    	.duration(conf.duration)
    	    	.attr("d", diagonal);


    	    // Nodes
    	    var new_node = node
        		.enter()
        		.append("g")
        		.attr("class", function(n) {
        		    if (n.children) {
            			if (n.depth === 0) {
                            return "root tnt_tree_node";
            			} else {
                            return "inner tnt_tree_node";
            			}
        		    } else {
                        return "leaf tnt_tree_node";
        		    }
        		})
        		.attr("id", function (d) {
        		    return "tnt_tree_node_" + div_id + "_" + d._id;
        		})
        		.attr("transform", transform);

    	    // Exiting nodes are just removed
    	    node
        		.exit()
        		.remove();

            new_node.on("click", function (node) {
                var my_node = tnt_tree_node(node);
                tree.trigger("node:click", my_node);
                dispatch.click.call(this, my_node);
            });
            new_node.on("dblclick", function (node) {
                var my_node = tnt_tree_node(node);
                tree.trigger("node:dblclick", my_node);
                dispatch.dblclick.call(this, my_node);
            });
            new_node.on("mouseover", function (node) {
                var my_node = tnt_tree_node(node);
                tree.trigger("node:hover", tnt_tree_node(node));
                dispatch.mouseover.call(this, my_node);
            });
            new_node.on("mouseout", function (node) {
                var my_node = tnt_tree_node(node);
                tree.trigger("node:mouseout", tnt_tree_node(node));
                dispatch.mouseout.call(this, my_node);
            });

    	    // // We need to re-create all the nodes again in case they have changed lively (or the layout)
    	    // node.selectAll("*").remove();
    	    // new_node
    		//     .each(function (d) {
        	// 		conf.node_display.call(this, tnt_tree_node(d));
    		//     });
            //
    	    // // We need to re-create all the labels again in case they have changed lively (or the layout)
    	    // new_node
    		//     .each (function (d) {
        	// 		conf.label.call(this, tnt_tree_node(d), conf.layout.type, d3.functor(conf.node_display.size())(tnt_tree_node(d)));
    		//     });

            t.update_nodes();

    	    node
        		.transition()
        		.ease(ease)
        		.duration(conf.duration)
        		.attr("transform", transform);

    	});

        api.method('update_nodes', function () {
            var node = nodes_g
                .selectAll("g.tnt_tree_node");

            // re-create all the nodes again
            // node.selectAll("*").remove();
            node
                .each(function () {
                    conf.node_display.reset.call(this);
                });

            node
                .each(function (d) {
                    //console.log(conf.node_display());
                    conf.node_display.call(this, tnt_tree_node(d));
                });

            // re-create all the labels again
            node
                .each (function (d) {
                    conf.label.call(this, tnt_tree_node(d), conf.layout.type, d3.functor(conf.node_display.size())(tnt_tree_node(d)));
                });

        });
    };

    // API
    var api = apijs (t)
    	.getset (conf);

    // n is the number to interpolate, the second argument can be either "tree" or "pixel" depending
    // if n is set to tree units or pixels units
    api.method ('scale_bar', function (n, units) {
        if (!t.layout().scale()) {
            return;
        }
        if (!units) {
            units = "pixel";
        }
        var val;
        links_g.select("path")
            .each(function (p) {
                var d = this.getAttribute("d");

                var pathParts = d.split(/[MLA]/);
                var toStr = pathParts.pop();
                var fromStr = pathParts.pop();

                var from = fromStr.split(",");
                var to = toStr.split(",");

                var deltaX = to[0] - from[0];
                var deltaY = to[1] - from[1];
                var pixelsDist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);

                var source = p.source;
                var target = p.target;

                var branchDist = target._root_dist - source._root_dist;

                // Supposing pixelsDist has been passed
                if (units === "pixel") {
                    val = (branchDist / pixelsDist) * n;
                } else if (units === "tree") {
                    val = (pixelsDist / branchDist) * n;
                }
            });
            if (isNaN(val)) {
                return;
            }
            return val;
        });

    // TODO: Rewrite data using getset / finalizers & transforms
    api.method ('data', function (d) {
        if (!arguments.length) {
            return base.data;
        }

        // The original data is stored as the base and curr data
        base.data = d;
        curr.data = d;

        // Set up a new tree based on the data
        var newtree = tnt_tree_node(base.data);

        t.root(newtree);
        base.tree = newtree;
        curr.tree = base.tree;

        tree.trigger("data:hasChanged", base.data);

        return this;
    });

    // TODO: This is only a getter
    api.method ('root', function () {
        return curr.tree;
    });

    // api.method ('subtree', function (curr_nodes, keepSingletons) {
    //     var subtree = base.tree.subtree(curr_nodes, keepSingletons);
    //     curr.data = subtree.data();
    //     curr.tree = subtree;
    //
    //     return this;
    // });

    // api.method ('reroot', function (node, keepSingletons) {
    //     // find
    //     var root = t.root();
    //     var found_node = t.root().find_node(function (n) {
    //         return node.id() === n.id();
    //     });
    //     var subtree = root.subtree(found_node.get_all_leaves(), keepSingletons);
    //
    //     return subtree;
    // });

    return d3.rebind (t, dispatch, "on");
};

module.exports = exports = tree;

},{"tnt.api":138,"tnt.tree.node":140}],149:[function(require,module,exports){
module.exports = require("./src/index.js");

},{"./src/index.js":150}],150:[function(require,module,exports){
// require('fs').readdirSync(__dirname + '/').forEach(function(file) {
//     if (file.match(/.+\.js/g) !== null && file !== __filename) {
// 	var name = file.replace('.js', '');
// 	module.exports[name] = require('./' + file);
//     }
// });

// Same as
var utils = require("./utils.js");
utils.reduce = require("./reduce.js");
module.exports = exports = utils;

},{"./reduce.js":151,"./utils.js":152}],151:[function(require,module,exports){
var reduce = function () {
    var smooth = 5;
    var value = 'val';
    var redundant = function (a, b) {
	if (a < b) {
	    return ((b-a) <= (b * 0.2));
	}
	return ((a-b) <= (a * 0.2));
    };
    var perform_reduce = function (arr) {return arr;};

    var reduce = function (arr) {
	if (!arr.length) {
	    return arr;
	}
	var smoothed = perform_smooth(arr);
	var reduced  = perform_reduce(smoothed);
	return reduced;
    };

    var median = function (v, arr) {
	arr.sort(function (a, b) {
	    return a[value] - b[value];
	});
	if (arr.length % 2) {
	    v[value] = arr[~~(arr.length / 2)][value];	    
	} else {
	    var n = ~~(arr.length / 2) - 1;
	    v[value] = (arr[n][value] + arr[n+1][value]) / 2;
	}

	return v;
    };

    var clone = function (source) {
	var target = {};
	for (var prop in source) {
	    if (source.hasOwnProperty(prop)) {
		target[prop] = source[prop];
	    }
	}
	return target;
    };

    var perform_smooth = function (arr) {
	if (smooth === 0) { // no smooth
	    return arr;
	}
	var smooth_arr = [];
	for (var i=0; i<arr.length; i++) {
	    var low = (i < smooth) ? 0 : (i - smooth);
	    var high = (i > (arr.length - smooth)) ? arr.length : (i + smooth);
	    smooth_arr[i] = median(clone(arr[i]), arr.slice(low,high+1));
	}
	return smooth_arr;
    };

    reduce.reducer = function (cbak) {
	if (!arguments.length) {
	    return perform_reduce;
	}
	perform_reduce = cbak;
	return reduce;
    };

    reduce.redundant = function (cbak) {
	if (!arguments.length) {
	    return redundant;
	}
	redundant = cbak;
	return reduce;
    };

    reduce.value = function (val) {
	if (!arguments.length) {
	    return value;
	}
	value = val;
	return reduce;
    };

    reduce.smooth = function (val) {
	if (!arguments.length) {
	    return smooth;
	}
	smooth = val;
	return reduce;
    };

    return reduce;
};

var block = function () {
    var red = reduce()
	.value('start');

    var value2 = 'end';

    var join = function (obj1, obj2) {
        return {
            'object' : {
                'start' : obj1.object[red.value()],
                'end'   : obj2[value2]
            },
            'value'  : obj2[value2]
        };
    };

    // var join = function (obj1, obj2) { return obj1 };

    red.reducer( function (arr) {
	var value = red.value();
	var redundant = red.redundant();
	var reduced_arr = [];
	var curr = {
	    'object' : arr[0],
	    'value'  : arr[0][value2]
	};
	for (var i=1; i<arr.length; i++) {
	    if (redundant (arr[i][value], curr.value)) {
		curr = join(curr, arr[i]);
		continue;
	    }
	    reduced_arr.push (curr.object);
	    curr.object = arr[i];
	    curr.value = arr[i].end;
	}
	reduced_arr.push(curr.object);

	// reduced_arr.push(arr[arr.length-1]);
	return reduced_arr;
    });

    reduce.join = function (cbak) {
	if (!arguments.length) {
	    return join;
	}
	join = cbak;
	return red;
    };

    reduce.value2 = function (field) {
	if (!arguments.length) {
	    return value2;
	}
	value2 = field;
	return red;
    };

    return red;
};

var line = function () {
    var red = reduce();

    red.reducer ( function (arr) {
	var redundant = red.redundant();
	var value = red.value();
	var reduced_arr = [];
	var curr = arr[0];
	for (var i=1; i<arr.length-1; i++) {
	    if (redundant (arr[i][value], curr[value])) {
		continue;
	    }
	    reduced_arr.push (curr);
	    curr = arr[i];
	}
	reduced_arr.push(curr);
	reduced_arr.push(arr[arr.length-1]);
	return reduced_arr;
    });

    return red;

};

module.exports = reduce;
module.exports.line = line;
module.exports.block = block;


},{}],152:[function(require,module,exports){

module.exports = {
    iterator : function(init_val) {
	var i = init_val || 0;
	var iter = function () {
	    return i++;
	};
	return iter;
    },

    script_path : function (script_name) { // script_name is the filename
	var script_scaped = script_name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	var script_re = new RegExp(script_scaped + '$');
	var script_re_sub = new RegExp('(.*)' + script_scaped + '$');

	// TODO: This requires phantom.js or a similar headless webkit to work (document)
	var scripts = document.getElementsByTagName('script');
	var path = "";  // Default to current path
	if(scripts !== undefined) {
            for(var i in scripts) {
		if(scripts[i].src && scripts[i].src.match(script_re)) {
                    return scripts[i].src.replace(script_re_sub, '$1');
		}
            }
	}
	return path;
    },

    defer_cancel : function (cbak, time) {
        var tick;

        var defer_cancel = function () {
            var args = Array.prototype.slice.call(arguments);
            var that = this;
            clearTimeout(tick);
            tick = setTimeout (function () {
                cbak.apply (that, args);
            }, time);
        };

        return defer_cancel;
    }
};

},{}],153:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],154:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],155:[function(require,module,exports){
(function (process,global){
/**
 * @module vow
 * @author Filatov Dmitry <dfilatov@yandex-team.ru>
 * @version 0.4.12
 * @license
 * Dual licensed under the MIT and GPL licenses:
 *   * http://www.opensource.org/licenses/mit-license.php
 *   * http://www.gnu.org/licenses/gpl.html
 */

(function(global) {

var undef,
    nextTick = (function() {
        var fns = [],
            enqueueFn = function(fn) {
                return fns.push(fn) === 1;
            },
            callFns = function() {
                var fnsToCall = fns, i = 0, len = fns.length;
                fns = [];
                while(i < len) {
                    fnsToCall[i++]();
                }
            };

        if(typeof setImmediate === 'function') { // ie10, nodejs >= 0.10
            return function(fn) {
                enqueueFn(fn) && setImmediate(callFns);
            };
        }

        if(typeof process === 'object' && process.nextTick) { // nodejs < 0.10
            return function(fn) {
                enqueueFn(fn) && process.nextTick(callFns);
            };
        }

        var MutationObserver = global.MutationObserver || global.WebKitMutationObserver; // modern browsers
        if(MutationObserver) {
            var num = 1,
                node = document.createTextNode('');

            new MutationObserver(callFns).observe(node, { characterData : true });

            return function(fn) {
                enqueueFn(fn) && (node.data = (num *= -1));
            };
        }

        if(global.postMessage) {
            var isPostMessageAsync = true;
            if(global.attachEvent) {
                var checkAsync = function() {
                        isPostMessageAsync = false;
                    };
                global.attachEvent('onmessage', checkAsync);
                global.postMessage('__checkAsync', '*');
                global.detachEvent('onmessage', checkAsync);
            }

            if(isPostMessageAsync) {
                var msg = '__promise' + Math.random() + '_' +new Date,
                    onMessage = function(e) {
                        if(e.data === msg) {
                            e.stopPropagation && e.stopPropagation();
                            callFns();
                        }
                    };

                global.addEventListener?
                    global.addEventListener('message', onMessage, true) :
                    global.attachEvent('onmessage', onMessage);

                return function(fn) {
                    enqueueFn(fn) && global.postMessage(msg, '*');
                };
            }
        }

        var doc = global.document;
        if('onreadystatechange' in doc.createElement('script')) { // ie6-ie8
            var createScript = function() {
                    var script = doc.createElement('script');
                    script.onreadystatechange = function() {
                        script.parentNode.removeChild(script);
                        script = script.onreadystatechange = null;
                        callFns();
                };
                (doc.documentElement || doc.body).appendChild(script);
            };

            return function(fn) {
                enqueueFn(fn) && createScript();
            };
        }

        return function(fn) { // old browsers
            enqueueFn(fn) && setTimeout(callFns, 0);
        };
    })(),
    throwException = function(e) {
        nextTick(function() {
            throw e;
        });
    },
    isFunction = function(obj) {
        return typeof obj === 'function';
    },
    isObject = function(obj) {
        return obj !== null && typeof obj === 'object';
    },
    toStr = Object.prototype.toString,
    isArray = Array.isArray || function(obj) {
        return toStr.call(obj) === '[object Array]';
    },
    getArrayKeys = function(arr) {
        var res = [],
            i = 0, len = arr.length;
        while(i < len) {
            res.push(i++);
        }
        return res;
    },
    getObjectKeys = Object.keys || function(obj) {
        var res = [];
        for(var i in obj) {
            obj.hasOwnProperty(i) && res.push(i);
        }
        return res;
    },
    defineCustomErrorType = function(name) {
        var res = function(message) {
            this.name = name;
            this.message = message;
        };

        res.prototype = new Error();

        return res;
    },
    wrapOnFulfilled = function(onFulfilled, idx) {
        return function(val) {
            onFulfilled.call(this, val, idx);
        };
    };

/**
 * @class Deferred
 * @exports vow:Deferred
 * @description
 * The `Deferred` class is used to encapsulate newly-created promise object along with functions that resolve, reject or notify it.
 */

/**
 * @constructor
 * @description
 * You can use `vow.defer()` instead of using this constructor.
 *
 * `new vow.Deferred()` gives the same result as `vow.defer()`.
 */
var Deferred = function() {
    this._promise = new Promise();
};

Deferred.prototype = /** @lends Deferred.prototype */{
    /**
     * Returns the corresponding promise.
     *
     * @returns {vow:Promise}
     */
    promise : function() {
        return this._promise;
    },

    /**
     * Resolves the corresponding promise with the given `value`.
     *
     * @param {*} value
     *
     * @example
     * ```js
     * var defer = vow.defer(),
     *     promise = defer.promise();
     *
     * promise.then(function(value) {
     *     // value is "'success'" here
     * });
     *
     * defer.resolve('success');
     * ```
     */
    resolve : function(value) {
        this._promise.isResolved() || this._promise._resolve(value);
    },

    /**
     * Rejects the corresponding promise with the given `reason`.
     *
     * @param {*} reason
     *
     * @example
     * ```js
     * var defer = vow.defer(),
     *     promise = defer.promise();
     *
     * promise.fail(function(reason) {
     *     // reason is "'something is wrong'" here
     * });
     *
     * defer.reject('something is wrong');
     * ```
     */
    reject : function(reason) {
        if(this._promise.isResolved()) {
            return;
        }

        if(vow.isPromise(reason)) {
            reason = reason.then(function(val) {
                var defer = vow.defer();
                defer.reject(val);
                return defer.promise();
            });
            this._promise._resolve(reason);
        }
        else {
            this._promise._reject(reason);
        }
    },

    /**
     * Notifies the corresponding promise with the given `value`.
     *
     * @param {*} value
     *
     * @example
     * ```js
     * var defer = vow.defer(),
     *     promise = defer.promise();
     *
     * promise.progress(function(value) {
     *     // value is "'20%'", "'40%'" here
     * });
     *
     * defer.notify('20%');
     * defer.notify('40%');
     * ```
     */
    notify : function(value) {
        this._promise.isResolved() || this._promise._notify(value);
    }
};

var PROMISE_STATUS = {
    PENDING   : 0,
    RESOLVED  : 1,
    FULFILLED : 2,
    REJECTED  : 3
};

/**
 * @class Promise
 * @exports vow:Promise
 * @description
 * The `Promise` class is used when you want to give to the caller something to subscribe to,
 * but not the ability to resolve or reject the deferred.
 */

/**
 * @constructor
 * @param {Function} resolver See https://github.com/domenic/promises-unwrapping/blob/master/README.md#the-promise-constructor for details.
 * @description
 * You should use this constructor directly only if you are going to use `vow` as DOM Promises implementation.
 * In other case you should use `vow.defer()` and `defer.promise()` methods.
 * @example
 * ```js
 * function fetchJSON(url) {
 *     return new vow.Promise(function(resolve, reject, notify) {
 *         var xhr = new XMLHttpRequest();
 *         xhr.open('GET', url);
 *         xhr.responseType = 'json';
 *         xhr.send();
 *         xhr.onload = function() {
 *             if(xhr.response) {
 *                 resolve(xhr.response);
 *             }
 *             else {
 *                 reject(new TypeError());
 *             }
 *         };
 *     });
 * }
 * ```
 */
var Promise = function(resolver) {
    this._value = undef;
    this._status = PROMISE_STATUS.PENDING;

    this._fulfilledCallbacks = [];
    this._rejectedCallbacks = [];
    this._progressCallbacks = [];

    if(resolver) { // NOTE: see https://github.com/domenic/promises-unwrapping/blob/master/README.md
        var _this = this,
            resolverFnLen = resolver.length;

        resolver(
            function(val) {
                _this.isResolved() || _this._resolve(val);
            },
            resolverFnLen > 1?
                function(reason) {
                    _this.isResolved() || _this._reject(reason);
                } :
                undef,
            resolverFnLen > 2?
                function(val) {
                    _this.isResolved() || _this._notify(val);
                } :
                undef);
    }
};

Promise.prototype = /** @lends Promise.prototype */ {
    /**
     * Returns the value of the fulfilled promise or the reason in case of rejection.
     *
     * @returns {*}
     */
    valueOf : function() {
        return this._value;
    },

    /**
     * Returns `true` if the promise is resolved.
     *
     * @returns {Boolean}
     */
    isResolved : function() {
        return this._status !== PROMISE_STATUS.PENDING;
    },

    /**
     * Returns `true` if the promise is fulfilled.
     *
     * @returns {Boolean}
     */
    isFulfilled : function() {
        return this._status === PROMISE_STATUS.FULFILLED;
    },

    /**
     * Returns `true` if the promise is rejected.
     *
     * @returns {Boolean}
     */
    isRejected : function() {
        return this._status === PROMISE_STATUS.REJECTED;
    },

    /**
     * Adds reactions to the promise.
     *
     * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
     * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Function} [onProgress] Callback that will be invoked with a provided value after the promise has been notified
     * @param {Object} [ctx] Context of the callbacks execution
     * @returns {vow:Promise} A new promise, see https://github.com/promises-aplus/promises-spec for details
     */
    then : function(onFulfilled, onRejected, onProgress, ctx) {
        var defer = new Deferred();
        this._addCallbacks(defer, onFulfilled, onRejected, onProgress, ctx);
        return defer.promise();
    },

    /**
     * Adds only a rejection reaction. This method is a shorthand for `promise.then(undefined, onRejected)`.
     *
     * @param {Function} onRejected Callback that will be called with a provided 'reason' as argument after the promise has been rejected
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    'catch' : function(onRejected, ctx) {
        return this.then(undef, onRejected, ctx);
    },

    /**
     * Adds only a rejection reaction. This method is a shorthand for `promise.then(null, onRejected)`. It's also an alias for `catch`.
     *
     * @param {Function} onRejected Callback to be called with the value after promise has been rejected
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    fail : function(onRejected, ctx) {
        return this.then(undef, onRejected, ctx);
    },

    /**
     * Adds a resolving reaction (for both fulfillment and rejection).
     *
     * @param {Function} onResolved Callback that will be invoked with the promise as an argument, after the promise has been resolved.
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    always : function(onResolved, ctx) {
        var _this = this,
            cb = function() {
                return onResolved.call(this, _this);
            };

        return this.then(cb, cb, ctx);
    },

    /**
     * Adds a progress reaction.
     *
     * @param {Function} onProgress Callback that will be called with a provided value when the promise has been notified
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    progress : function(onProgress, ctx) {
        return this.then(undef, undef, onProgress, ctx);
    },

    /**
     * Like `promise.then`, but "spreads" the array into a variadic value handler.
     * It is useful with the `vow.all` and the `vow.allResolved` methods.
     *
     * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
     * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Object} [ctx] Context of the callbacks execution
     * @returns {vow:Promise}
     *
     * @example
     * ```js
     * var defer1 = vow.defer(),
     *     defer2 = vow.defer();
     *
     * vow.all([defer1.promise(), defer2.promise()]).spread(function(arg1, arg2) {
     *     // arg1 is "1", arg2 is "'two'" here
     * });
     *
     * defer1.resolve(1);
     * defer2.resolve('two');
     * ```
     */
    spread : function(onFulfilled, onRejected, ctx) {
        return this.then(
            function(val) {
                return onFulfilled.apply(this, val);
            },
            onRejected,
            ctx);
    },

    /**
     * Like `then`, but terminates a chain of promises.
     * If the promise has been rejected, this method throws it's "reason" as an exception in a future turn of the event loop.
     *
     * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
     * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Function} [onProgress] Callback that will be invoked with a provided value after the promise has been notified
     * @param {Object} [ctx] Context of the callbacks execution
     *
     * @example
     * ```js
     * var defer = vow.defer();
     * defer.reject(Error('Internal error'));
     * defer.promise().done(); // exception to be thrown
     * ```
     */
    done : function(onFulfilled, onRejected, onProgress, ctx) {
        this
            .then(onFulfilled, onRejected, onProgress, ctx)
            .fail(throwException);
    },

    /**
     * Returns a new promise that will be fulfilled in `delay` milliseconds if the promise is fulfilled,
     * or immediately rejected if the promise is rejected.
     *
     * @param {Number} delay
     * @returns {vow:Promise}
     */
    delay : function(delay) {
        var timer,
            promise = this.then(function(val) {
                var defer = new Deferred();
                timer = setTimeout(
                    function() {
                        defer.resolve(val);
                    },
                    delay);

                return defer.promise();
            });

        promise.always(function() {
            clearTimeout(timer);
        });

        return promise;
    },

    /**
     * Returns a new promise that will be rejected in `timeout` milliseconds
     * if the promise is not resolved beforehand.
     *
     * @param {Number} timeout
     * @returns {vow:Promise}
     *
     * @example
     * ```js
     * var defer = vow.defer(),
     *     promiseWithTimeout1 = defer.promise().timeout(50),
     *     promiseWithTimeout2 = defer.promise().timeout(200);
     *
     * setTimeout(
     *     function() {
     *         defer.resolve('ok');
     *     },
     *     100);
     *
     * promiseWithTimeout1.fail(function(reason) {
     *     // promiseWithTimeout to be rejected in 50ms
     * });
     *
     * promiseWithTimeout2.then(function(value) {
     *     // promiseWithTimeout to be fulfilled with "'ok'" value
     * });
     * ```
     */
    timeout : function(timeout) {
        var defer = new Deferred(),
            timer = setTimeout(
                function() {
                    defer.reject(new vow.TimedOutError('timed out'));
                },
                timeout);

        this.then(
            function(val) {
                defer.resolve(val);
            },
            function(reason) {
                defer.reject(reason);
            });

        defer.promise().always(function() {
            clearTimeout(timer);
        });

        return defer.promise();
    },

    _vow : true,

    _resolve : function(val) {
        if(this._status > PROMISE_STATUS.RESOLVED) {
            return;
        }

        if(val === this) {
            this._reject(TypeError('Can\'t resolve promise with itself'));
            return;
        }

        this._status = PROMISE_STATUS.RESOLVED;

        if(val && !!val._vow) { // shortpath for vow.Promise
            val.isFulfilled()?
                this._fulfill(val.valueOf()) :
                val.isRejected()?
                    this._reject(val.valueOf()) :
                    val.then(
                        this._fulfill,
                        this._reject,
                        this._notify,
                        this);
            return;
        }

        if(isObject(val) || isFunction(val)) {
            var then;
            try {
                then = val.then;
            }
            catch(e) {
                this._reject(e);
                return;
            }

            if(isFunction(then)) {
                var _this = this,
                    isResolved = false;

                try {
                    then.call(
                        val,
                        function(val) {
                            if(isResolved) {
                                return;
                            }

                            isResolved = true;
                            _this._resolve(val);
                        },
                        function(err) {
                            if(isResolved) {
                                return;
                            }

                            isResolved = true;
                            _this._reject(err);
                        },
                        function(val) {
                            _this._notify(val);
                        });
                }
                catch(e) {
                    isResolved || this._reject(e);
                }

                return;
            }
        }

        this._fulfill(val);
    },

    _fulfill : function(val) {
        if(this._status > PROMISE_STATUS.RESOLVED) {
            return;
        }

        this._status = PROMISE_STATUS.FULFILLED;
        this._value = val;

        this._callCallbacks(this._fulfilledCallbacks, val);
        this._fulfilledCallbacks = this._rejectedCallbacks = this._progressCallbacks = undef;
    },

    _reject : function(reason) {
        if(this._status > PROMISE_STATUS.RESOLVED) {
            return;
        }

        this._status = PROMISE_STATUS.REJECTED;
        this._value = reason;

        this._callCallbacks(this._rejectedCallbacks, reason);
        this._fulfilledCallbacks = this._rejectedCallbacks = this._progressCallbacks = undef;
    },

    _notify : function(val) {
        this._callCallbacks(this._progressCallbacks, val);
    },

    _addCallbacks : function(defer, onFulfilled, onRejected, onProgress, ctx) {
        if(onRejected && !isFunction(onRejected)) {
            ctx = onRejected;
            onRejected = undef;
        }
        else if(onProgress && !isFunction(onProgress)) {
            ctx = onProgress;
            onProgress = undef;
        }

        var cb;

        if(!this.isRejected()) {
            cb = { defer : defer, fn : isFunction(onFulfilled)? onFulfilled : undef, ctx : ctx };
            this.isFulfilled()?
                this._callCallbacks([cb], this._value) :
                this._fulfilledCallbacks.push(cb);
        }

        if(!this.isFulfilled()) {
            cb = { defer : defer, fn : onRejected, ctx : ctx };
            this.isRejected()?
                this._callCallbacks([cb], this._value) :
                this._rejectedCallbacks.push(cb);
        }

        if(this._status <= PROMISE_STATUS.RESOLVED) {
            this._progressCallbacks.push({ defer : defer, fn : onProgress, ctx : ctx });
        }
    },

    _callCallbacks : function(callbacks, arg) {
        var len = callbacks.length;
        if(!len) {
            return;
        }

        var isResolved = this.isResolved(),
            isFulfilled = this.isFulfilled(),
            isRejected = this.isRejected();

        nextTick(function() {
            var i = 0, cb, defer, fn;
            while(i < len) {
                cb = callbacks[i++];
                defer = cb.defer;
                fn = cb.fn;

                if(fn) {
                    var ctx = cb.ctx,
                        res;
                    try {
                        res = ctx? fn.call(ctx, arg) : fn(arg);
                    }
                    catch(e) {
                        defer.reject(e);
                        continue;
                    }

                    isResolved?
                        defer.resolve(res) :
                        defer.notify(res);
                }
                else if(isFulfilled) {
                    defer.resolve(arg);
                }
                else if(isRejected) {
                    defer.reject(arg);
                }
                else {
                    defer.notify(arg);
                }
            }
        });
    }
};

/** @lends Promise */
var staticMethods = {
    /**
     * Coerces the given `value` to a promise, or returns the `value` if it's already a promise.
     *
     * @param {*} value
     * @returns {vow:Promise}
     */
    cast : function(value) {
        return vow.cast(value);
    },

    /**
     * Returns a promise, that will be fulfilled only after all the items in `iterable` are fulfilled.
     * If any of the `iterable` items gets rejected, then the returned promise will be rejected.
     *
     * @param {Array|Object} iterable
     * @returns {vow:Promise}
     */
    all : function(iterable) {
        return vow.all(iterable);
    },

    /**
     * Returns a promise, that will be fulfilled only when any of the items in `iterable` are fulfilled.
     * If any of the `iterable` items gets rejected, then the returned promise will be rejected.
     *
     * @param {Array} iterable
     * @returns {vow:Promise}
     */
    race : function(iterable) {
        return vow.anyResolved(iterable);
    },

    /**
     * Returns a promise that has already been resolved with the given `value`.
     * If `value` is a promise, the returned promise will have `value`'s state.
     *
     * @param {*} value
     * @returns {vow:Promise}
     */
    resolve : function(value) {
        return vow.resolve(value);
    },

    /**
     * Returns a promise that has already been rejected with the given `reason`.
     *
     * @param {*} reason
     * @returns {vow:Promise}
     */
    reject : function(reason) {
        return vow.reject(reason);
    }
};

for(var prop in staticMethods) {
    staticMethods.hasOwnProperty(prop) &&
        (Promise[prop] = staticMethods[prop]);
}

var vow = /** @exports vow */ {
    Deferred : Deferred,

    Promise : Promise,

    /**
     * Creates a new deferred. This method is a factory method for `vow:Deferred` class.
     * It's equivalent to `new vow.Deferred()`.
     *
     * @returns {vow:Deferred}
     */
    defer : function() {
        return new Deferred();
    },

    /**
     * Static equivalent to `promise.then`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
     * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Function} [onProgress] Callback that will be invoked with a provided value after the promise has been notified
     * @param {Object} [ctx] Context of the callbacks execution
     * @returns {vow:Promise}
     */
    when : function(value, onFulfilled, onRejected, onProgress, ctx) {
        return vow.cast(value).then(onFulfilled, onRejected, onProgress, ctx);
    },

    /**
     * Static equivalent to `promise.fail`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Function} onRejected Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    fail : function(value, onRejected, ctx) {
        return vow.when(value, undef, onRejected, ctx);
    },

    /**
     * Static equivalent to `promise.always`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Function} onResolved Callback that will be invoked with the promise as an argument, after the promise has been resolved.
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    always : function(value, onResolved, ctx) {
        return vow.when(value).always(onResolved, ctx);
    },

    /**
     * Static equivalent to `promise.progress`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Function} onProgress Callback that will be invoked with a provided value after the promise has been notified
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    progress : function(value, onProgress, ctx) {
        return vow.when(value).progress(onProgress, ctx);
    },

    /**
     * Static equivalent to `promise.spread`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
     * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Object} [ctx] Context of the callbacks execution
     * @returns {vow:Promise}
     */
    spread : function(value, onFulfilled, onRejected, ctx) {
        return vow.when(value).spread(onFulfilled, onRejected, ctx);
    },

    /**
     * Static equivalent to `promise.done`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
     * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Function} [onProgress] Callback that will be invoked with a provided value after the promise has been notified
     * @param {Object} [ctx] Context of the callbacks execution
     */
    done : function(value, onFulfilled, onRejected, onProgress, ctx) {
        vow.when(value).done(onFulfilled, onRejected, onProgress, ctx);
    },

    /**
     * Checks whether the given `value` is a promise-like object
     *
     * @param {*} value
     * @returns {Boolean}
     *
     * @example
     * ```js
     * vow.isPromise('something'); // returns false
     * vow.isPromise(vow.defer().promise()); // returns true
     * vow.isPromise({ then : function() { }); // returns true
     * ```
     */
    isPromise : function(value) {
        return isObject(value) && isFunction(value.then);
    },

    /**
     * Coerces the given `value` to a promise, or returns the `value` if it's already a promise.
     *
     * @param {*} value
     * @returns {vow:Promise}
     */
    cast : function(value) {
        return value && !!value._vow?
            value :
            vow.resolve(value);
    },

    /**
     * Static equivalent to `promise.valueOf`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @returns {*}
     */
    valueOf : function(value) {
        return value && isFunction(value.valueOf)? value.valueOf() : value;
    },

    /**
     * Static equivalent to `promise.isFulfilled`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @returns {Boolean}
     */
    isFulfilled : function(value) {
        return value && isFunction(value.isFulfilled)? value.isFulfilled() : true;
    },

    /**
     * Static equivalent to `promise.isRejected`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @returns {Boolean}
     */
    isRejected : function(value) {
        return value && isFunction(value.isRejected)? value.isRejected() : false;
    },

    /**
     * Static equivalent to `promise.isResolved`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @returns {Boolean}
     */
    isResolved : function(value) {
        return value && isFunction(value.isResolved)? value.isResolved() : true;
    },

    /**
     * Returns a promise that has already been resolved with the given `value`.
     * If `value` is a promise, the returned promise will have `value`'s state.
     *
     * @param {*} value
     * @returns {vow:Promise}
     */
    resolve : function(value) {
        var res = vow.defer();
        res.resolve(value);
        return res.promise();
    },

    /**
     * Returns a promise that has already been fulfilled with the given `value`.
     * If `value` is a promise, the returned promise will be fulfilled with the fulfill/rejection value of `value`.
     *
     * @param {*} value
     * @returns {vow:Promise}
     */
    fulfill : function(value) {
        var defer = vow.defer(),
            promise = defer.promise();

        defer.resolve(value);

        return promise.isFulfilled()?
            promise :
            promise.then(null, function(reason) {
                return reason;
            });
    },

    /**
     * Returns a promise that has already been rejected with the given `reason`.
     * If `reason` is a promise, the returned promise will be rejected with the fulfill/rejection value of `reason`.
     *
     * @param {*} reason
     * @returns {vow:Promise}
     */
    reject : function(reason) {
        var defer = vow.defer();
        defer.reject(reason);
        return defer.promise();
    },

    /**
     * Invokes the given function `fn` with arguments `args`
     *
     * @param {Function} fn
     * @param {...*} [args]
     * @returns {vow:Promise}
     *
     * @example
     * ```js
     * var promise1 = vow.invoke(function(value) {
     *         return value;
     *     }, 'ok'),
     *     promise2 = vow.invoke(function() {
     *         throw Error();
     *     });
     *
     * promise1.isFulfilled(); // true
     * promise1.valueOf(); // 'ok'
     * promise2.isRejected(); // true
     * promise2.valueOf(); // instance of Error
     * ```
     */
    invoke : function(fn, args) {
        var len = Math.max(arguments.length - 1, 0),
            callArgs;
        if(len) { // optimization for V8
            callArgs = Array(len);
            var i = 0;
            while(i < len) {
                callArgs[i++] = arguments[i];
            }
        }

        try {
            return vow.resolve(callArgs?
                fn.apply(global, callArgs) :
                fn.call(global));
        }
        catch(e) {
            return vow.reject(e);
        }
    },

    /**
     * Returns a promise, that will be fulfilled only after all the items in `iterable` are fulfilled.
     * If any of the `iterable` items gets rejected, the promise will be rejected.
     *
     * @param {Array|Object} iterable
     * @returns {vow:Promise}
     *
     * @example
     * with array:
     * ```js
     * var defer1 = vow.defer(),
     *     defer2 = vow.defer();
     *
     * vow.all([defer1.promise(), defer2.promise(), 3])
     *     .then(function(value) {
     *          // value is "[1, 2, 3]" here
     *     });
     *
     * defer1.resolve(1);
     * defer2.resolve(2);
     * ```
     *
     * @example
     * with object:
     * ```js
     * var defer1 = vow.defer(),
     *     defer2 = vow.defer();
     *
     * vow.all({ p1 : defer1.promise(), p2 : defer2.promise(), p3 : 3 })
     *     .then(function(value) {
     *          // value is "{ p1 : 1, p2 : 2, p3 : 3 }" here
     *     });
     *
     * defer1.resolve(1);
     * defer2.resolve(2);
     * ```
     */
    all : function(iterable) {
        var defer = new Deferred(),
            isPromisesArray = isArray(iterable),
            keys = isPromisesArray?
                getArrayKeys(iterable) :
                getObjectKeys(iterable),
            len = keys.length,
            res = isPromisesArray? [] : {};

        if(!len) {
            defer.resolve(res);
            return defer.promise();
        }

        var i = len;
        vow._forEach(
            iterable,
            function(value, idx) {
                res[keys[idx]] = value;
                if(!--i) {
                    defer.resolve(res);
                }
            },
            defer.reject,
            defer.notify,
            defer,
            keys);

        return defer.promise();
    },

    /**
     * Returns a promise, that will be fulfilled only after all the items in `iterable` are resolved.
     *
     * @param {Array|Object} iterable
     * @returns {vow:Promise}
     *
     * @example
     * ```js
     * var defer1 = vow.defer(),
     *     defer2 = vow.defer();
     *
     * vow.allResolved([defer1.promise(), defer2.promise()]).spread(function(promise1, promise2) {
     *     promise1.isRejected(); // returns true
     *     promise1.valueOf(); // returns "'error'"
     *     promise2.isFulfilled(); // returns true
     *     promise2.valueOf(); // returns "'ok'"
     * });
     *
     * defer1.reject('error');
     * defer2.resolve('ok');
     * ```
     */
    allResolved : function(iterable) {
        var defer = new Deferred(),
            isPromisesArray = isArray(iterable),
            keys = isPromisesArray?
                getArrayKeys(iterable) :
                getObjectKeys(iterable),
            i = keys.length,
            res = isPromisesArray? [] : {};

        if(!i) {
            defer.resolve(res);
            return defer.promise();
        }

        var onResolved = function() {
                --i || defer.resolve(iterable);
            };

        vow._forEach(
            iterable,
            onResolved,
            onResolved,
            defer.notify,
            defer,
            keys);

        return defer.promise();
    },

    allPatiently : function(iterable) {
        return vow.allResolved(iterable).then(function() {
            var isPromisesArray = isArray(iterable),
                keys = isPromisesArray?
                    getArrayKeys(iterable) :
                    getObjectKeys(iterable),
                rejectedPromises, fulfilledPromises,
                len = keys.length, i = 0, key, promise;

            if(!len) {
                return isPromisesArray? [] : {};
            }

            while(i < len) {
                key = keys[i++];
                promise = iterable[key];
                if(vow.isRejected(promise)) {
                    rejectedPromises || (rejectedPromises = isPromisesArray? [] : {});
                    isPromisesArray?
                        rejectedPromises.push(promise.valueOf()) :
                        rejectedPromises[key] = promise.valueOf();
                }
                else if(!rejectedPromises) {
                    (fulfilledPromises || (fulfilledPromises = isPromisesArray? [] : {}))[key] = vow.valueOf(promise);
                }
            }

            if(rejectedPromises) {
                throw rejectedPromises;
            }

            return fulfilledPromises;
        });
    },

    /**
     * Returns a promise, that will be fulfilled if any of the items in `iterable` is fulfilled.
     * If all of the `iterable` items get rejected, the promise will be rejected (with the reason of the first rejected item).
     *
     * @param {Array} iterable
     * @returns {vow:Promise}
     */
    any : function(iterable) {
        var defer = new Deferred(),
            len = iterable.length;

        if(!len) {
            defer.reject(Error());
            return defer.promise();
        }

        var i = 0, reason;
        vow._forEach(
            iterable,
            defer.resolve,
            function(e) {
                i || (reason = e);
                ++i === len && defer.reject(reason);
            },
            defer.notify,
            defer);

        return defer.promise();
    },

    /**
     * Returns a promise, that will be fulfilled only when any of the items in `iterable` is fulfilled.
     * If any of the `iterable` items gets rejected, the promise will be rejected.
     *
     * @param {Array} iterable
     * @returns {vow:Promise}
     */
    anyResolved : function(iterable) {
        var defer = new Deferred(),
            len = iterable.length;

        if(!len) {
            defer.reject(Error());
            return defer.promise();
        }

        vow._forEach(
            iterable,
            defer.resolve,
            defer.reject,
            defer.notify,
            defer);

        return defer.promise();
    },

    /**
     * Static equivalent to `promise.delay`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Number} delay
     * @returns {vow:Promise}
     */
    delay : function(value, delay) {
        return vow.resolve(value).delay(delay);
    },

    /**
     * Static equivalent to `promise.timeout`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Number} timeout
     * @returns {vow:Promise}
     */
    timeout : function(value, timeout) {
        return vow.resolve(value).timeout(timeout);
    },

    _forEach : function(promises, onFulfilled, onRejected, onProgress, ctx, keys) {
        var len = keys? keys.length : promises.length,
            i = 0;

        while(i < len) {
            vow.when(
                promises[keys? keys[i] : i],
                wrapOnFulfilled(onFulfilled, i),
                onRejected,
                onProgress,
                ctx);
            ++i;
        }
    },

    TimedOutError : defineCustomErrorType('TimedOut')
};

var defineAsGlobal = true;
if(typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = vow;
    defineAsGlobal = false;
}

if(typeof modules === 'object' && isFunction(modules.define)) {
    modules.define('vow', function(provide) {
        provide(vow);
    });
    defineAsGlobal = false;
}

if(typeof define === 'function') {
    define(function(require, exports, module) {
        module.exports = vow;
    });
    defineAsGlobal = false;
}

defineAsGlobal && (global.vow = vow);

})(typeof window !== 'undefined'? window : global);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":45}],156:[function(require,module,exports){
"use strict";
var window = require("global/window")
var once = require("once")
var isFunction = require("is-function")
var parseHeaders = require("parse-headers")
var xtend = require("xtend")

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    var callback = options.callback
    if(typeof callback === "undefined"){
        throw new Error("callback argument missing")
    }
    callback = once(callback)

    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === "text" || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        callback(err, response, response.body)

    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data || null
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            aborted=true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}

function noop() {}

},{"global/window":49,"is-function":50,"once":135,"parse-headers":136,"xtend":157}],157:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],"biojs-io-fasta":[function(require,module,exports){
// Generated by CoffeeScript 1.9.0
var Fasta, GenericReader;

GenericReader = require("biojs-io-parser");

Fasta = require("./fasta");

module.exports = Fasta;

GenericReader.mixin(Fasta);

},{"./fasta":19,"biojs-io-parser":25}],"biojs-io-newick":[function(require,module,exports){
module.exports = require('./newick');
module.exports.parse_nhx = require('./extended_newick');

},{"./extended_newick":23,"./newick":24}],"msa-tnt":[function(require,module,exports){
module.exports.model = require("./model");
module.exports.app = require("./app");
module.exports.selections = require("./selection");
module.exports.adapters = require("./adapters");
module.exports.utils = require("./utils");

},{"./adapters":1,"./app":4,"./model":5,"./selection":6,"./utils":7}],"msa":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = exports.io = exports.$ = exports._ = exports.boneView = exports.view = exports.selcol = exports.selection = exports.utils = exports.menu = exports.model = exports.msa = undefined;

var _utils = require("./utils");

Object.defineProperty(exports, "utils", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_utils).default;
  }
});

var _Selection = require("./g/selection/Selection");

Object.defineProperty(exports, "selection", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Selection).default;
  }
});

var _SelectionCol = require("./g/selection/SelectionCol");

Object.defineProperty(exports, "selcol", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SelectionCol).default;
  }
});

var _backboneViewj = require("backbone-viewj");

Object.defineProperty(exports, "view", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_backboneViewj).default;
  }
});

var _backboneChilds = require("backbone-childs");

Object.defineProperty(exports, "boneView", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_backboneChilds).default;
  }
});

var _underscore = require("underscore");

Object.defineProperty(exports, "_", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_underscore).default;
  }
});

var _jbone = require("jbone");

Object.defineProperty(exports, "$", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_jbone).default;
  }
});

var _msa = require("./msa");

var _msa2 = _interopRequireDefault(_msa);

var _model2 = require("./model");

var _model = _interopRequireWildcard(_model2);

var _menu2 = require("./menu");

var _menu = _interopRequireWildcard(_menu2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MSAWrapper = function MSAWrapper() {
  var msa = function msa(args) {
    return _msa2.default.apply(this, args);
  };
  msa.prototype = _msa2.default.prototype;
  return new msa(arguments);
};
exports.default = MSAWrapper;
exports.msa = _msa2.default;

// models

exports.model = _model;

// extra plugins, extensions

exports.menu = _menu;


// parser (are currently bundled - so we can also expose them)
var io = {};
io.xhr = require('xhr');
io.fasta = require('biojs-io-fasta');
io.clustal = require('biojs-io-clustal');
io.gff = require('biojs-io-gff');

exports.io = io;

// version will be automatically injected by webpack
// MSA_VERSION is only defined if loaded via webpack

var VERSION = "imported";
if (typeof MSA_VERSION !== "undefined") {
  VERSION = MSA_VERSION;
}

var version = exports.version = VERSION;
},{"./g/selection/Selection":79,"./g/selection/SelectionCol":80,"./menu":86,"./model":103,"./msa":104,"./utils":108,"backbone-childs":8,"backbone-viewj":15,"biojs-io-clustal":17,"biojs-io-fasta":"biojs-io-fasta","biojs-io-gff":20,"jbone":51,"underscore":154,"xhr":134}]},{},[])