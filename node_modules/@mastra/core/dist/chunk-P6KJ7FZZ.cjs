'use strict';

var chunkRIBNDTA6_cjs = require('./chunk-RIBNDTA6.cjs');
var chunkD63P5O4Q_cjs = require('./chunk-D63P5O4Q.cjs');
var chunkRWTSGWWL_cjs = require('./chunk-RWTSGWWL.cjs');

// src/tts/index.ts
var _MastraTTS_decorators, _init, _a;
_MastraTTS_decorators = [chunkRIBNDTA6_cjs.InstrumentClass({
  prefix: "tts",
  excludeMethods: ["__setTools", "__setLogger", "__setTelemetry", "#log"]
})];
exports.MastraTTS = class MastraTTS extends (_a = chunkD63P5O4Q_cjs.MastraBase) {
  model;
  constructor({
    model
  }) {
    super({
      component: "TTS"
    });
    this.model = model;
  }
  traced(method, methodName) {
    return this.telemetry?.traceMethod(method, {
      spanName: `${this.model.name}-tts.${methodName}`,
      attributes: {
        "tts.type": `${this.model.name}`
      }
    }) ?? method;
  }
};
exports.MastraTTS = /*@__PURE__*/(_ => {
  _init = chunkRWTSGWWL_cjs.__decoratorStart(_a);
  exports.MastraTTS = chunkRWTSGWWL_cjs.__decorateElement(_init, 0, "MastraTTS", _MastraTTS_decorators, exports.MastraTTS);
  chunkRWTSGWWL_cjs.__runInitializers(_init, 1, exports.MastraTTS);
  return exports.MastraTTS;
})();
