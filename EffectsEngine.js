import animate;
import ui.View as View;
import ui.ImageView as ImageView;

var sin = Math.sin;
var cos = Math.cos;
var min = Math.min;
var max = Math.max;
var random = Math.random;

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

var OTHER_DEFAULTS = [
  superview: null,
  flipX: false,
  flipY: false,
  compositeOperation: "",
  ttl: 1000,
  delay: 0,
  image: "",
  next: null
];

var STYLE_KEYS = Object.keys(STYLE_DEFAULTS);
var STYLE_KEY_COUNT = STYLE_KEYS.length;
var POLAR_KEYS = Object.keys(POLAR_DEFAULTS);
var POLAR_KEY_COUNT = POLAR_KEYS.length;
var OTHER_KEYS = Object.keys(OTHER_DEFAULTS);
var OTHER_KEY_COUNT = OTHER_KEYS.length;



exports = Class(View, function () {
  var superProto = View.prototype;

  this.init = function (opts) {
    opts = opts || {};
    opts.canHandleEvents = false;
    opts.blockEvents = true;
    superProto.init.call(this, opts);

    // particle view constructor
    this._ctor = opts.ctor || ImageView;
    // recycled particle objects
    this._freeParticleObjects = [];
    // recycled property objects
    this._freePropertyObjects = [];
    // recycled particle views
    this._freeParticleViews = [];
    // alive particle views
    this._activeParticleViews = [];
    // whether view creation should log warnings
    this._logViewCreation = false;

    // pre-initialize the engine with particle views and objects
    var initCount = opts.initCount;
    if (initCount) {
      for (var i = 0; i < initCount; i++) {
        this._freeParticleViews.push(createParticleView.call(this));
        this._freeParticleObjects.push(createParticleObject.call(this));
      }
      this._logViewCreation = true;
    }
  };

  function createParticleView () {
    var view = new this._ctor({ visible: false });
    view.particleObject = null;
    return view;
  };

  function createParticleObject () {
    var obj = {};

    for (var i = 0; i < STYLE_KEY_COUNT; i++) {
      var key = STYLE_KEYS[i];
      var defaultValue = STYLE_DEFAULTS[key];
      obj[key] = createPropertyObject.call(this, defaultValue);
    }

    for (var i = 0; i < POLAR_KEY_COUNT; i++) {
      var key = POLAR_KEYS[i];
      var defaultValue = POLAR_DEFAULTS[key];
      obj[key] = createPropertyObject.call(this, defaultValue);
    }

    for (var i = 0; i < OTHER_KEY_COUNT; i++) {
      var key = OTHER_KEYS[i];
      var defaultValue = OTHER_DEFAULTS[key];
      obj[key] = defaultValue;
    }

    return obj;
  };

  function createPropertyObject (defaultValue) {
    return {
      initialValue: defaultValue,
      initialRange: [],
      finalValue: defaultValue,
      finalRange: [],
      easing: animate.linear,
      deltaValue: 0,
      deltaRange: [],
      deltaProperty: null
    };
  };

  function recycleParticle (particle) {
    recycleParticleObject.call(this, particle.particleObject);
    particle.particleObject = null;
    this._freeParticleViews.push(particle);
  };

  function recycleParticleObject (obj) {
    for (var i = 0; i < STYLE_KEY_COUNT; i++) {
      var key = STYLE_KEYS[i];
      var defaultValue = STYLE_DEFAULTS[key];
      recyclePropertyObject.call(this, obj[key], defaultValue, false);
    }

    for (var i = 0; i < POLAR_KEY_COUNT; i++) {
      var key = POLAR_KEYS[i];
      var defaultValue = POLAR_DEFAULTS[key];
      recyclePropertyObject.call(this, obj[key], defaultValue, false);
    }

    for (var i = 0; i < OTHER_KEY_COUNT; i++) {
      var key = OTHER_KEYS[i];
      var defaultValue = OTHER_DEFAULTS[key];
      obj[key] = defaultValue;
    }

    this._freeParticleObjects.push(obj);
  };

  function recyclePropertyObject (obj, defaultValue, isFree) {
    obj.initialValue = defaultValue;
    obj.initialRange.length = 0;
    obj.finalValue = defaultValue;
    obj.finalRange.length = 0;
    obj.easing = animate.linear;
    obj.deltaValue = 0;
    obj.deltaRange.length = 0;
    if (obj.deltaProperty) {
      recyclePropertyObject.call(this, obj.deltaProperty, 0, true);
      obj.deltaProperty = null;
    }
    isFree && this._freePropertyObjects.push(obj);
  };


  /**
   * after obtaining the particle array full of particle objects
   * pass the array in here once you set up each objects' properties
   */
  this.emitParticles = function (particleDataArray) {
    var count = particleDataArray.length;
    var active = this._activeParticleViews;
    var free = this._freeParticleViews;
    for (var i = 0; i < count; i++) {
      // get particle data object and recycled view if possible
      var data = particleDataArray.pop();
      var particle = free.pop();
      if (!particle) {
        particle = new this._ctor({
          superview: this,
          visible: false,
          canHandleEvents: false
        });
        if (this._logViewCreation) {
          logger.warn(this.getTag(), "created View:", particle.getTag());
        }
      }

      // only set particle image if necessary
      var image = data.image;
      if (particle.setImage && particle.lastImage !== image) {
        var img = imageCache[image];
        if (img === void 0) {
          img = imageCache[image] = new Image({ url: image });
        }
        particle.setImage(img);
        particle.lastImage = image;
      }

      // apply style properties
      var s = particle.style;
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
      s.visible = data.visible;

      // start particles if there's no delay
      if (!data.delay) {
        s.visible = true;
        data.onStart && data.onStart(particle);
      }

      // and finally emit the particle

      particle.pData = data;
      active.push(particle);
    }
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
   * step the particle engine forward in time by dt milliseconds
   * this should be called manually from your own tick function
   */
  this.tick = function (dt) {
    var i = 0;
    var active = this._activeParticleViews;
    var free = this._freeParticleViews;
    while (i < active.length) {
      var particle = active[i];
      var s = particle.style;
      var data = particle.pData;

      // failsafe for a heisenbug that arises from mis-use of the engine
      if (!data) {
        // zombie particles must die
        this._killParticle(particle, data, i);
        continue;
      }

      // handle particle delays
      if (data.delay > 0) {
        data.delay -= dt;
        if (data.delay <= 0) {
          s.visible = true;
          data.onStart && data.onStart(particle);
        } else {
          i++;
          continue;
        }
      }

      // is it dead yet?
      data.elapsed += dt;
      if (data.elapsed >= data.ttl) {
        this._killParticle(particle, data, i);
        continue;
      }

      // calculate the percent of one second elapsed; deltas are in units / second
      var pct = dt / 1000;
      if (data.transition !== TRANSITION_LINEAR) {
        var getTransitionProgress = TRANSITIONS[data.transition];
        var prgBefore = getTransitionProgress((data.elapsed - dt) / data.ttl);
        var prgAfter = getTransitionProgress(data.elapsed / data.ttl);
        pct = (prgAfter - prgBefore) * data.ttl / 1000;
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

      i += 1;
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
