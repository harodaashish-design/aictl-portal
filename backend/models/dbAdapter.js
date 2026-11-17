const fs = require('fs');
const path = require('path');
const Datastore = require('@seald-io/nedb');
const env = require('../config/env');

let activeDriver = 'nedb'; // 'mongoose' | 'nedb'

function setActiveDriver(driver) {
  activeDriver = driver;
}

function getActiveDriver() {
  return activeDriver;
}

function ensureDataDir() {
  if (!fs.existsSync(env.dataDir)) {
    fs.mkdirSync(env.dataDir, { recursive: true });
  }
}

function normalizeQuery(query = {}) {
  const normalized = {};
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    if (k === '$or' && Array.isArray(v)) {
      normalized.$or = v.map((sub) => normalizeQuery(sub));
    } else if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof RegExp) && !(v instanceof Date)) {
      const cloned = { ...v };
      if (cloned.$in && Array.isArray(cloned.$in)) {
        cloned.$in = cloned.$in.map((item) =>
          item && typeof item === 'object' && item.toString ? String(item) : item
        );
      }
      normalized[k] = cloned;
    } else if ((k === '_id' || k === 'studentId' || k === 'recipientId' || k === 'userId') && v && typeof v === 'object' && v._id) {
      normalized[k] = String(v._id);
    } else if ((k === '_id' || k === 'studentId' || k === 'recipientId' || k === 'userId') && v !== null && typeof v === 'object' && typeof v.toString === 'function') {
      normalized[k] = String(v);
    } else {
      normalized[k] = v;
    }
  }
  return normalized;
}

function applyDefaults(doc, defaults = {}) {
  const result = { ...doc };
  for (const [key, val] of Object.entries(defaults)) {
    if (result[key] === undefined) {
      result[key] = typeof val === 'function' ? val() : structuredClone(val);
    }
  }
  return result;
}

function applyProjection(doc, selectStr) {
  if (!doc || !selectStr) return doc;
  const parts = selectStr.trim().split(/\s+/);
  const excludeFields = parts.filter((p) => p.startsWith('-')).map((p) => p.slice(1));
  const includeFields = parts.filter((p) => !p.startsWith('-'));

  const cloned = { ...doc };
  if (excludeFields.length > 0) {
    for (const f of excludeFields) {
      delete cloned[f];
    }
    return cloned;
  }
  if (includeFields.length > 0) {
    const picked = { _id: cloned._id };
    for (const f of includeFields) {
      if (cloned[f] !== undefined) picked[f] = cloned[f];
    }
    return picked;
  }
  return cloned;
}

class NedbQuery {
  constructor(datastore, query, isSingle = false) {
    this.datastore = datastore;
    this.query = normalizeQuery(query);
    this.isSingle = isSingle;
    this._sort = null;
    this._skip = 0;
    this._limit = 0;
    this._select = null;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  skip(n) {
    this._skip = Number(n) || 0;
    return this;
  }

  limit(n) {
    this._limit = Number(n) || 0;
    return this;
  }

  select(selectStr) {
    this._select = selectStr;
    return this;
  }

  lean() {
    return this;
  }

  async exec() {
    if (this.isSingle) {
      let cursor = this.datastore.findOneAsync(this.query);
      const doc = await cursor;
      return applyProjection(doc, this._select);
    }

    let cursor = this.datastore.find(this.query);
    if (this._sort) cursor = cursor.sort(this._sort);
    if (this._skip > 0) cursor = cursor.skip(this._skip);
    if (this._limit > 0) cursor = cursor.limit(this._limit);

    const docs = await cursor.execAsync();
    if (!this._select) return docs;
    return docs.map((d) => applyProjection(d, this._select));
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

function createModelAdapter(name, mongooseModel, options = {}) {
  const { defaults = {}, uniqueFields = [], sparseUniqueFields = [], normalize = (d) => d } = options;
  let nedbStore = null;

  function getNedb() {
    if (!nedbStore) {
      ensureDataDir();
      nedbStore = new Datastore({
        filename: path.join(env.dataDir, `${name.toLowerCase()}.db`),
        autoload: true,
        timestampData: true,
      });
      for (const field of uniqueFields) {
        nedbStore.ensureIndex({ fieldName: field, unique: true });
      }
      for (const field of sparseUniqueFields) {
        nedbStore.ensureIndex({ fieldName: field, unique: true, sparse: true });
      }
    }
    return nedbStore;
  }

  return {
    find(query = {}) {
      if (activeDriver === 'mongoose') {
        return mongooseModel.find(query);
      }
      return new NedbQuery(getNedb(), query, false);
    },

    findOne(query = {}) {
      if (activeDriver === 'mongoose') {
        return mongooseModel.findOne(query);
      }
      return new NedbQuery(getNedb(), query, true);
    },

    findById(id) {
      if (!id) {
        if (activeDriver === 'mongoose') return mongooseModel.findById(null);
        return new NedbQuery(getNedb(), { _id: '__none__' }, true);
      }
      if (activeDriver === 'mongoose') {
        return mongooseModel.findById(id);
      }
      return new NedbQuery(getNedb(), { _id: String(id) }, true);
    },

    async create(payload) {
      if (activeDriver === 'mongoose') {
        return mongooseModel.create(payload);
      }
      const store = getNedb();
      const insertSingle = async (item) => {
        const prepared = normalize(applyDefaults(item, defaults));
        // Convert any objectId-like refs to string
        for (const key of ['studentId', 'recipientId', 'userId']) {
          if (prepared[key] && typeof prepared[key] === 'object') {
            prepared[key] = String(prepared[key]._id || prepared[key]);
          }
        }
        return store.insertAsync(prepared);
      };

      if (Array.isArray(payload)) {
        const results = [];
        for (const item of payload) {
          results.push(await insertSingle(item));
        }
        return results;
      }
      return insertSingle(payload);
    },

    async findByIdAndUpdate(id, update = {}, opts = {}) {
      if (activeDriver === 'mongoose') {
        return mongooseModel.findByIdAndUpdate(id, update, opts);
      }
      const store = getNedb();
      const updatePayload = buildNedbUpdate(update);
      await store.updateAsync({ _id: String(id) }, updatePayload, {});
      if (opts.new) {
        return store.findOneAsync({ _id: String(id) });
      }
      return store.findOneAsync({ _id: String(id) });
    },

    async findOneAndUpdate(query, update = {}, opts = {}) {
      if (activeDriver === 'mongoose') {
        return mongooseModel.findOneAndUpdate(query, update, opts);
      }
      const store = getNedb();
      const normQ = normalizeQuery(query);
      const existing = await store.findOneAsync(normQ);
      if (!existing && opts.upsert) {
        const base = { ...normQ, ...(update.$set || (!hasOperators(update) ? update : {})) };
        return this.create(base);
      }
      if (!existing) return null;
      const updatePayload = buildNedbUpdate(update);
      await store.updateAsync({ _id: existing._id }, updatePayload, {});
      return store.findOneAsync({ _id: existing._id });
    },

    async updateMany(query, update = {}) {
      if (activeDriver === 'mongoose') {
        return mongooseModel.updateMany(query, update);
      }
      const store = getNedb();
      const updatePayload = buildNedbUpdate(update);
      return store.updateAsync(normalizeQuery(query), updatePayload, { multi: true });
    },

    async deleteOne(query) {
      if (activeDriver === 'mongoose') {
        return mongooseModel.deleteOne(query);
      }
      const store = getNedb();
      return store.removeAsync(normalizeQuery(query), { multi: false });
    },

    async findByIdAndDelete(id) {
      if (activeDriver === 'mongoose') {
        return mongooseModel.findByIdAndDelete(id);
      }
      const store = getNedb();
      const doc = await store.findOneAsync({ _id: String(id) });
      if (doc) {
        await store.removeAsync({ _id: String(id) }, { multi: false });
      }
      return doc;
    },

    async deleteMany(query = {}) {
      if (activeDriver === 'mongoose') {
        return mongooseModel.deleteMany(query);
      }
      const store = getNedb();
      return store.removeAsync(normalizeQuery(query), { multi: true });
    },

    async countDocuments(query = {}) {
      if (activeDriver === 'mongoose') {
        return mongooseModel.countDocuments(query);
      }
      const store = getNedb();
      return store.countAsync(normalizeQuery(query));
    },
  };
}

function hasOperators(obj) {
  return Object.keys(obj).some((k) => k.startsWith('$'));
}

function buildNedbUpdate(update) {
  if (hasOperators(update)) {
    const cloned = { ...update };
    cloned.$set = { ...(cloned.$set || {}), updatedAt: new Date() };
    return cloned;
  }
  return { $set: { ...update, updatedAt: new Date() } };
}

module.exports = {
  createModelAdapter,
  setActiveDriver,
  getActiveDriver,
};
