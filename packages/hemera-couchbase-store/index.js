'use strict'

const Hp = require('hemera-plugin')
const Couchbase = require('couchbase')

exports.plugin = Hp(function hemeraCouchbaseStore (options) {
  const hemera = this
  const topic = 'couchbase-store'

  const Joi = hemera.exposition['hemera-joi'].joi
  const cluster = new Couchbase.Cluster(options.couchbase.url)
  const N1qlQuery = Couchbase.N1qlQuery

  hemera.expose('openBucket', getBucket)
  hemera.expose('cluster', cluster)
  hemera.expose('couchbase', Couchbase)

  function getBucket (name) {
    if (options.couchbase.bucketInstance) {
      return options.couchbase.bucketInstance
    } else {
      return cluster.openBucket(name)
    }
  }

  hemera.add({
    topic,
    cmd: 'query',
    bucket: Joi.string().optional().default('default'),
    query: Joi.string().required(),
    vars: Joi.array().items(Joi.string(), Joi.number()).default([])
  }, function (req, cb) {
    const bucket = getBucket(req.bucket)
    const query = N1qlQuery.fromString(req.query)
    bucket.query(query, req.vars, cb)
  })
})

exports.options = {
  payloadValidator: 'hemera-joi',
  couchbase: {
    url: 'couchbase://localhost/',
    defaultBucket: 'default'
  }
}

exports.attributes = {
  pkg: require('./package.json')
}
