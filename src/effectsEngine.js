import animate;
import animate.transitions as easingFunctions;
import ui.View as View;
import ui.ImageView as ImageView;

var sin = Math.sin;
var cos = Math.cos;
var min = Math.min;
var max = Math.max;
var floor = Math.floor;
var random = Math.random;
var choose = function (a) { return a[floor(random() * a.length)]; };
var rollFloat = function (n, x) { return n + random() * (x - n); };

var STYLE_DEFAULTS = {
  x: 0,
  y: 0,
  zIndex: 0,
  offsetX: 0,
  offsetY: 0,
  anchorX: 0,
  anchorY: 0,
  r: 0,
  width: 10,
  height: 10,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  opacity: 1
};

var POLAR_DEFAULTS = {
  theta: 0,
  radius: 0
};

var PROPERTY_DEFAULTS = {};
merge(PROPERTY_DEFAULTS, STYLE_DEFAULTS);
merge(PROPERTY_DEFAULTS, POLAR_DEFAULTS);

var OTHER_DEFAULTS = {
  flipX: false,
  flipY: false,
  compositeOperation: "",
  ttl: 1000,
  delay: 0,
  image: ""
};

var STYLE_KEYS = Object.keys(STYLE_DEFAULTS);
var STYLE_KEY_COUNT = STYLE_KEYS.length;
var POLAR_KEYS = Object.keys(POLAR_DEFAULTS);
var POLAR_KEY_COUNT = POLAR_KEYS.length;
var PROPERTY_KEYS = Object.keys(PROPERTY_DEFAULTS);
var PROPERTY_KEY_COUNT = PROPERTY_KEYS.length;
var OTHER_KEYS = Object.keys(OTHER_DEFAULTS);
var OTHER_KEY_COUNT = OTHER_KEYS.length;



var EffectsEngine = Class(View, function () {
  var superProto = View.prototype;
  var effectUID = 0;

  this.init = function () {
    superProto.init.call(this, {
      canHandleEvents: false,
      blockEvents: true
    });
  };

  this.emitEffectsFromData = function (data, opts) {
    opts = opts || {};
    opts.id = opts.id || "" + effectUID++;
    opts.superview = opts.superview || this;
    opts.x = opts.x || 0;
    opts.y = opts.y || 0;

    if (isArray(data)) {
      data.forEach(function (effect) {
        emitEffect(effect, opts);
      });
    } else {
      emitEffect(data, opts);
    }

    return opts.id;
  };

  function emitEffect (data, opts) {
    var effect = effectPool.obtain();
    effect.reset(data, opts);
  };

  this.tick = function (dt) {
    particlePool.forEachActive(function (particle) {
      particle.step(dt);
    });
    effectPool.forEachActive(function (effect) {
      effect.step(dt);
    });
  };
});



var Effect = Class("Effect", function () {
  this.init = function () {
    this.id = "";
    this.count = 0;
    this.continuous = false;
    this.data = null;
    this.opts = null;
    this.activeParticleCount = 0;
  };

  this.reset = function (data, opts) {
    this.id = opts.id;
    this.count = data.count || 1;
    this.continuous = data.continuous || false;
    this.data = data;
    this.opts = opts;
    this.activeParticleCount = 0;

    // emit immediately if not a continuous effect
    if (!this.continuous) {
      this.emitParticles();
    }
  };

  this.recycle = function () {
    effectPool.release(this);
  };

  this.pause = function () {
    // TODO: pause all related particles
  };

  this.resume = function () {
    // TODO: resume all related particles
  };

  this.stop = function () {
    // TODO: recycle all related particles and the effect itself
    this.recycle();
  };

  this.emitParticles = function () {
    var chance = this.count % 1;
    var count = floor(this.count) + (random() < chance ? 1 : 0);
    for (var i = 0; i < count; i++) {
      var particle = particlePool.obtain();
      particle.reset(this);
      this.activeParticleCount++;
    }
  };

  this.step = function (dt) {
    if (this.continuous) {
      // emit each tick for continuous effects
      this.emitParticles();
    } else if (this.activeParticleCount <= 0) {
      // recycle the effect when it's out of active particles
      this.recycle();
    }
  };
});



var Particle = Class("Particle", function () {
  this.init = function () {
    this.view = new ImageView({ visible: false });
    this.currentImageURL = "";
    this.isPolar = false;
    this.hasDeltas = false;
    this.effect = null;

    for (var i = 0; i < PROPERTY_KEY_COUNT; i++) {
      this[PROPERTY_KEYS[i]] = propertyPool.obtain();
    }

    for (var i = 0; i < OTHER_KEY_COUNT; i++) {
      var key = OTHER_KEYS[i];
      this[key] = OTHER_DEFAULTS[key];
    }

    this._poolIndex = 0;
    this._obtainedFromPool = false;
  };

  this.reset = function (effect) {
    this.isPolar = false;
    this.hasDeltas = false;
    this.effect = effect;

    var s = this.view.style;
    var data = effect.data;
    var opts = effect.opts;

    // reset animated properties with data or to their defaults
    for (var i = 0; i < PROPERTY_KEY_COUNT; i++) {
      var key = PROPERTY_KEYS[i];
      var prop = this[key];
      prop.reset(key, data[key]);
      if (prop.delta) {
        this.hasDeltas = true;
      }
    }

    // reset other properties with data or to their defaults
    for (var i = 0; i < OTHER_KEY_COUNT; i++) {
      var key = OTHER_KEYS[i];
      this[key] = data[key] || OTHER_DEFAULTS[key];
    }

    // prepare the image url for this particle
    var imageURL = "";
    var image = data.image;
    var imageType = typeof image;
    if (imageType === 'string') {
      imageURL = image;
    } else if (isArray(image) && image.length > 0) {
      imageURL = choose(image);
    } else {
      throw new Error("Invalid image URL data:", data.image);
    }
    // only update the image if necessary
    if (this.currentImageURL !== imageURL) {
      this.currentImageURL = imageURL;
      this.view.setImage(imageURL);
    }

    // add this particle to the view hierarchy
    opts.superview.addSubview(this.view);

    // determine whether this particle is in polar or cartesian coordinates
    for (var i = 0; i < POLAR_KEY_COUNT; i++) {
      var key = POLAR_KEYS[i];
      var prop = this[key];
      if (prop.value !== POLAR_DEFAULTS[key] || prop.delta || prop.targets.length) {
        this.isPolar = true;
        break;
      }
    }

    // apply initial view style properties
    for (var i = 0; i < STYLE_KEY_COUNT; i++) {
      var key = STYLE_KEYS[i];
      var prop = this[key];
      var value = prop.value;
      if (key === 'x') {
        if (this.isPolar) {
          value = this.radius.value * cos(this.theta.value);
        }
        value += opts.x;
      } else if (key === 'y') {
        if (this.isPolar) {
          value = this.radius.value * sin(this.theta.value);
        }
        value += opts.y;
      }
      s[key] = value;
    }
    s.flipX = this.flipX;
    s.flipY = this.flipY;
    s.compositeOperation = this.compositeOperation;

    // TODO: apply any animations found in targets

    if (this.delay === 0) {
      s.visible = true;
    } else if (this.delay < 0) {
      throw new Error("Particles cannot have negative delay values!");
    }

    if (this.ttl < 0) {
      throw new Error("Particles cannot have negative time-to-live values!");
    }
  };

  this.recycle = function () {
    this.effect.activeParticleCount--;
    for (var i = 0; i < PROPERTY_KEY_COUNT; i++) {
      this[PROPERTY_KEYS[i]].recycle(false);
    }
    this.view.style.visible = false;
    particlePool.release(this);
  };

  this.step = function (dt) {
    var s = this.view.style;

    if (this.delay > 0) {
      this.delay -= dt;
      if (this.delay <= 0) {
        s.visible = true;
      } else {
        return;
      }
    }

    this.ttl -= dt;
    if (this.ttl <= 0) {
      this.recycle();
    }

    if (this.isPolar) {
      // TODO: polar particle updates to x and y
    }

    if (this.hasDeltas) {
      // TODO: iterate and update deltas
    }
  };
});



var Property = Class("Property", function () {
  this.init = function () {
    this.value = 0;
    this.delta = null;
    this.targets = [];
    this._poolIndex = 0;
    this._obtainedFromPool = false;
  };

  this.reset = function (key, data) {
    this.value = 0;
    this.delta = null;
    this.targets.length = 0;

    // setting values based on a random or parameterized range
    if (data.range && data.range.length >= 2) {
      var minVal = data.range[0];
      var maxVal = data.range[1];
      if (minVal > maxVal) {
        throw new Error("Invalid range, min > max:", key, data);
      }
      if (data.range.length === 3) {
        var paramID = data.range[2];

        // TODO: params

      } else {
        this.value = rollFloat(minVal, maxVal);
      }
    } else if (data.value !== void 0) {
      this.value = data.value;
    } else if (key !== 'delta') {
      this.value = PROPERTY_DEFAULTS[key];
    }

    // animate to target values or apply deltas over time
    if (data.targets && data.targets.length) {
      for (var i = 0; i < data.targets.length; i++) {
        var target = targetPool.obtain();
        target.reset(data.targets[i]);
        this.targets.push(target);
      }
    } else if (data.delta) {
      this.delta = propertyPool.obtain();
      this.delta.reset('delta', data.delta);
    }
  };

  this.recycle = function (isFree) {
    for (var i = 0; i < this.targets.length; i++) {
      this.targets[i].recycle();
    }
    if (this.delta) {
      this.delta.recycle(true);
    }
    isFree && propertyPool.release(this);
  };
});



var Target = Class("Target", function () {
  this.init = function () {
    this.value = 0;
    this.delay = 0;
    this.duration = 0;
    this.easing = animate.linear;
  };

  this.reset = function (data) {
    this.value = data.value || 0;
    this.delay = data.delay || 0;
    this.duration = data.duration || 0;
    this.easing = animate.linear;

    // setting values based on a random or parameterized range
    if (data.range && data.range.length >= 2) {
      var minVal = data.range[0];
      var maxVal = data.range[1];
      if (minVal > maxVal) {
        throw new Error("Invalid range, min > max:", data);
      }
      if (data.range.length === 3) {
        var paramID = data.range[2];

        // TODO: params

      } else {
        this.value = rollFloat(minVal, maxVal);
      }
    }

    // find the appropriate animate id
    if (data.easing) {
      if (data.easing in easingFunctions) {

      } else {
        
      }
    }
  };

  this.recycle = function () {
    targetPool.release(this);
  };
});



var ObjectPool = Class("ObjectPool", function () {
  this.init = function (ctor) {
    this._ctor = ctor;
    this._pool = [];
    this._freshIndex = 0;
  };

  this.create = function () {
    var pool = this._pool;
    var obj = new this._ctor();
    obj._poolIndex = pool.length;
    pool.push(obj);
    return obj;
  };

  this.obtain = function () {
    var obj;
    var pool = this._pool;
    if (this._freshIndex < pool.length) {
      obj = pool[this._freshIndex];
    } else {
      obj = this.create();
    }
    obj._obtainedFromPool = true;
    this._freshIndex++;
    return obj;
  };

  this.release = function (obj) {
    var pool = this._pool;
    if (obj._obtainedFromPool) {
      obj._obtainedFromPool = false;
      var temp = pool[this._freshIndex - 1];
      pool[this._freshIndex - 1] = obj;
      pool[obj._poolIndex] = temp;
      var tempIndex = temp._poolIndex;
      temp._poolIndex = obj._poolIndex;
      obj._poolIndex = tempIndex;
      this._freshIndex--;
    }
  };

  this.forEachActive = function (fn, ctx) {
    var pool = this._pool;
    for (var i = this._freshIndex - 1; i >= 0; i--) {
      fn.call(ctx, pool[i], i);
    }
  };
});



// private class-wide pools and singleton exports
var targetPool = new ObjectPool(Target);
var propertyPool = new ObjectPool(Property);
var particlePool = new ObjectPool(Particle);
var effectPool = new ObjectPool(Effect);
exports = new EffectsEngine();
