import animate;
import ui.View as View;
import ui.ImageView as ImageView;

var sin = Math.sin;
var cos = Math.cos;
var min = Math.min;
var max = Math.max;
var random = Math.random;
var choose = function (a) { return a[floor(random() * a.length)]; };
var rollFloat = function (n, x) { return n + random() * (x - n); };

var STYLE_DEFAULTS = [
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
];

var POLAR_DEFAULTS = [
  theta: 0,
  radius: 0
];

var PROPERTY_DEFAULTS = STYLE_DEFAULTS.concat(POLAR_DEFAULTS);

var OTHER_DEFAULTS = [
  flipX: false,
  flipY: false,
  compositeOperation: "",
  ttl: 1000,
  delay: 0,
  image: ""
];

var STYLE_KEYS = Object.keys(STYLE_DEFAULTS);
var STYLE_KEY_COUNT = STYLE_KEYS.length;
var POLAR_KEYS = Object.keys(POLAR_DEFAULTS);
var POLAR_KEY_COUNT = POLAR_KEYS.length;
var PROPERTY_KEYS = Object.keys(PROPERTY_DEFAULTS);
var PROPERTY_KEY_COUNT = PROPERTY_KEYS.length;
var OTHER_KEYS = Object.keys(OTHER_DEFAULTS);
var OTHER_KEY_COUNT = OTHER_KEYS.length;



exports = Class(View, function () {
  var superProto = View.prototype;

  this.init = function (opts) {
    opts = opts || {};
    opts.canHandleEvents = false;
    opts.blockEvents = true;
    superProto.init.call(this, opts);
  };

  this.emitEffect = function (data) {
    var effect = effectPool.obtain();
    effect.reset(data);
  };

  this.tick = function (dt) {

  };



  /**
   * internal use only
   * clean-up a particle
   *
   * particle (this._ctor || ImageView)
   * data (object)
   * index (integer) position in this._activeParticleViews
   */
  this._killParticle = function (particle, data, index) {
    var active = this._activeParticleViews;
    var s = particle.style;
    var spliced = active.splice(index, 1);

    particle.pData = null;
    data && data.onDeath && data.onDeath(particle, data);

    s.visible = false;
    this._freeParticleViews.push(spliced[0]);
    data && this._freeParticleObjects.push(this._cleanObject(data));
  };

  /**
   * finish and hide all particles immediately
   */
  this.killAllParticles = function () {
    var active = this._activeParticleViews;
    while (active.length) {
      var particle = active[0];
      this._killParticle(particle, particle.pData, 0);
    }
  };

  /**
   * public accessor for particle views (object data attached to each as pData)
   */
  this.getActiveParticles = function () {
    return this._activeParticleViews;
  };

  /**
   * fn (function) called for each active particle view, takes params: view, index
   *
   * ctx (object) the context on which fn should be called
   *
   * like Array.forEach, call a function for each active particle view
   */
  this.forEachActiveParticle = function (fn, ctx) {
    var views = this._activeParticleViews;
    for (var i = 0, len = views.length; i < len; i++) {
      fn.call(ctx, views[i], i);
    }
  };

});



var Effect = Class("Effect", function () {
  this.init = function () {
    this.groupID = "";
    this.count = 0;
    this.continuous = false;
    this.particles = [];
    this.data = null;
  };

  this.reset = function (data) {
    this.groupID = data.groupID || "";
    this.count = data.count || 1;
    this.continuous = data.continuous || false;
    this.particles.length = 0;
    this.data = data;

    if (!this.continuous) {
      for (var i = 0; i < this.count; i++) {
        this.emitParticle();
      }
    }
  };

  this.recycle = function () {
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].recycle();
    }
    effectPool.release(this);
  };

  this.emitParticle = function () {
    var particle = particlePool.obtain();
    particle.reset(this.data);
    this.particles.push(particle);
  };

  this.step = function (dt) {

  };
});



var Particle = Class("Particle", function () {
  this.init = function () {
    this.view = new ImageView({ visible: false });
    this.currentImageURL = "";
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

  this.reset = function (data) {
    for (var i = 0; i < PROPERTY_KEY_COUNT; i++) {
      var key = PROPERTY_KEYS[i];
      this[key].reset(key, data[key]);
    }
    for (var i = 0; i < OTHER_KEY_COUNT; i++) {
      var key = OTHER_KEYS[i];
      this[key] = OTHER_DEFAULTS[key];
    }

    var imageURL = "";
    var image = data.image;
    var imageType = typeof image;
    if (imageType === 'string') {
      imageURL = image;
    } else if (imageType === 'object' && image.length > 0) {
      imageURL = choose(image);
    } else {
      throw new Error("Invalid image URL data:", data.image);
    }
    // only update the image if we need to
    if (this.currentImageURL !== imageURL) {
      this.currentImageURL = imageURL;
      this.view.setImage(imageURL);
    }




    // apply style properties
    var s = this.view.style;
    s.x = data.x;
    s.y = data.y;
    s.r = data.r;
    s.anchorX = data.anchorX;
    s.anchorY = data.anchorY;
    s.width = data.width;
    s.height = data.height;
    s.scale = data.scale;
    s.scaleX = data.scaleX;
    s.scaleY = data.scaleY;
    s.opacity = data.opacity;
    s.flipX = data.flipX;
    s.flipY = data.flipY;
    s.compositeOperation = data.compositeOperation;




    if (this.delay === 0) {
      s.visible = true;
    } else if (data.delay < 0) {
      throw new Error("Particles cannot have negative delay values!");
    }

    if (this.ttl < 0) {
      throw new Error("Particles cannot have negative time-to-live values!");
    }
  };

  this.recycle = function () {
    for (var i = 0; i < PROPERTY_KEY_COUNT; i++) {
      this[PROPERTY_KEYS[i]].recycle(false);
    }
    particlePool.release(this);
  };

  this.step = function (dt) {
    var s = this.view.style;

    if (this.delay > 0) {
      this.delay -= dt;
      if (this.delay <= 0) {
        s.visible = true;
      } else {
        return true;
      }
    }

    this.ttl -= dt;
    if (this.ttl <= 0) {
      return false;
    }




    // translation
    if (data.polar) {
      data.radius += pct * data.dradius;
      data.theta += pct * data.dtheta;
      data.dradius += pct * data.ddradius;
      data.dtheta += pct * data.ddtheta;
      // allow cartesian translation of the origin point
      data.ox += pct * data.dx;
      data.oy += pct * data.dy;
      data.dx += pct * data.ddx;
      data.dy += pct * data.ddy;
      // polar position
      s.x = data.x = data.ox + data.radius * cos(data.theta);
      s.y = data.y = data.oy + data.radius * sin(data.theta);
    } else {
      // cartesian by default
      var dx = pct * data.dx;
      if (dx !== 0) { s.x = data.x += dx; }
      var dy = pct * data.dy;
      if (dy !== 0) { s.y = data.y += dy; }
      data.dx += pct * data.ddx;
      data.dy += pct * data.ddy;
    }

    // anchor translation
    var dax = pct * data.danchorX;
    if (dax !== 0) { s.anchorX = data.anchorX += dax; }
    var day = pct * data.danchorY;
    if (day !== 0) { s.anchorY = data.anchorY += day; }
    data.danchorX += pct * data.ddanchorX;
    data.danchorY += pct * data.ddanchorY;

    // stretching
    var dw = pct * data.dwidth;
    if (dw !== 0) { s.width = data.width += dw; }
    var dh = pct * data.dheight;
    if (dh !== 0) { s.height = data.height += dh; }
    data.dwidth += pct * data.ddwidth;
    data.dheight += pct * data.ddheight;

    // rotation
    var dr = pct * data.dr;
    if (dr !== 0) { s.r = data.r += dr; }
    data.dr += pct * data.ddr;

    // scaling
    var ds = pct * data.dscale;
    if (ds !== 0) { s.scale = data.scale = max(0, data.scale + ds); }
    var dsx = pct * data.dscaleX;
    if (dsx !== 0) { s.scaleX = data.scaleX = max(0, data.scaleX + dsx); }
    var dsy = pct * data.dscaleY;
    if (dsy !== 0) { s.scaleY = data.scaleY = max(0, data.scaleY + dsy); }
    data.dscale += pct * data.ddscale;
    data.dscaleX += pct * data.ddscaleX;
    data.dscaleY += pct * data.ddscaleY;

    // opacity
    var dop = pct * data.dopacity;
    if (dop !== 0) { s.opacity = data.opacity = max(0, min(1, data.opacity + dop)); }
    data.dopacity += pct * data.ddopacity;
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
    if (data.targets && data.targets.length >= 1) {
      if (key === 'delta') {
        throw new Error("Cannot combine target values with deltas:", key, data);
      }

      // TODO: targets

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
    this.range = [];
    this.delay = 0;
    this.duration = 0;
    this.easing = animate.linear;
  };

  this.reset = function () {
    this.value = 0;
    this.range.length = 0;
    this.delay = 0;
    this.duration = 0;
    this.easing = animate.linear;
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



// private class-wide pools
var targetPool = new ObjectPool(Target);
var propertyPool = new ObjectPool(Property);
var particlePool = new ObjectPool(Particle);
var effectPool = new ObjectPool(Effect);
