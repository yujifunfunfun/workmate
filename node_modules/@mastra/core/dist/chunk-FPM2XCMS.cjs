'use strict';

var chunkTNILINST_cjs = require('./chunk-TNILINST.cjs');
var chunkD63P5O4Q_cjs = require('./chunk-D63P5O4Q.cjs');

// src/storage/base.ts
var MastraStorage = class extends chunkD63P5O4Q_cjs.MastraBase {
  /** @deprecated import from { TABLE_WORKFLOW_SNAPSHOT } '@mastra/core/storage' instead */
  static TABLE_WORKFLOW_SNAPSHOT = chunkTNILINST_cjs.TABLE_WORKFLOW_SNAPSHOT;
  /** @deprecated import from { TABLE_EVALS } '@mastra/core/storage' instead */
  static TABLE_EVALS = chunkTNILINST_cjs.TABLE_EVALS;
  /** @deprecated import from { TABLE_MESSAGES } '@mastra/core/storage' instead */
  static TABLE_MESSAGES = chunkTNILINST_cjs.TABLE_MESSAGES;
  /** @deprecated import from { TABLE_THREADS } '@mastra/core/storage' instead */
  static TABLE_THREADS = chunkTNILINST_cjs.TABLE_THREADS;
  /** @deprecated import { TABLE_TRACES } from '@mastra/core/storage' instead */
  static TABLE_TRACES = chunkTNILINST_cjs.TABLE_TRACES;
  hasInitialized = null;
  shouldCacheInit = true;
  constructor({ name }) {
    super({
      component: "STORAGE",
      name
    });
  }
  batchTraceInsert({ records }) {
    return this.batchInsert({ tableName: chunkTNILINST_cjs.TABLE_TRACES, records });
  }
  async init() {
    if (this.shouldCacheInit && await this.hasInitialized) {
      return;
    }
    this.hasInitialized = Promise.all([
      this.createTable({
        tableName: chunkTNILINST_cjs.TABLE_WORKFLOW_SNAPSHOT,
        schema: chunkTNILINST_cjs.TABLE_SCHEMAS[chunkTNILINST_cjs.TABLE_WORKFLOW_SNAPSHOT]
      }),
      this.createTable({
        tableName: chunkTNILINST_cjs.TABLE_EVALS,
        schema: chunkTNILINST_cjs.TABLE_SCHEMAS[chunkTNILINST_cjs.TABLE_EVALS]
      }),
      this.createTable({
        tableName: chunkTNILINST_cjs.TABLE_THREADS,
        schema: chunkTNILINST_cjs.TABLE_SCHEMAS[chunkTNILINST_cjs.TABLE_THREADS]
      }),
      this.createTable({
        tableName: chunkTNILINST_cjs.TABLE_MESSAGES,
        schema: chunkTNILINST_cjs.TABLE_SCHEMAS[chunkTNILINST_cjs.TABLE_MESSAGES]
      }),
      this.createTable({
        tableName: chunkTNILINST_cjs.TABLE_TRACES,
        schema: chunkTNILINST_cjs.TABLE_SCHEMAS[chunkTNILINST_cjs.TABLE_TRACES]
      })
    ]).then(() => true);
    await this.hasInitialized;
  }
  async persistWorkflowSnapshot({
    workflowName,
    runId,
    snapshot
  }) {
    await this.init();
    const data = {
      workflow_name: workflowName,
      run_id: runId,
      snapshot,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.logger.debug("Persisting workflow snapshot", { workflowName, runId, data });
    await this.insert({
      tableName: chunkTNILINST_cjs.TABLE_WORKFLOW_SNAPSHOT,
      record: data
    });
  }
  async loadWorkflowSnapshot({
    workflowName,
    runId
  }) {
    if (!this.hasInitialized) {
      await this.init();
    }
    this.logger.debug("Loading workflow snapshot", { workflowName, runId });
    const d = await this.load({
      tableName: chunkTNILINST_cjs.TABLE_WORKFLOW_SNAPSHOT,
      keys: { workflow_name: workflowName, run_id: runId }
    });
    return d ? d.snapshot : null;
  }
};

exports.MastraStorage = MastraStorage;
