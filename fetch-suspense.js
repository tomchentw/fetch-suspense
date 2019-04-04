"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var deepEqual = require('deep-equal');
var fetchCaches = [];
var useFetch = function (input, init, config) {
    var e_1, _a;
    var client = fetch;
    var lifespan = 0;
    if (typeof config === "object") {
        client = config.client || client;
        lifespan = config.lifespan || lifespan;
    }
    else if (typeof config === "number") {
        lifespan = config;
    }
    try {
        for (var fetchCaches_1 = __values(fetchCaches), fetchCaches_1_1 = fetchCaches_1.next(); !fetchCaches_1_1.done; fetchCaches_1_1 = fetchCaches_1.next()) {
            var fetchCache_1 = fetchCaches_1_1.value;
            if (client === fetchCache_1.client &&
                deepEqual(input, fetchCache_1.input) &&
                deepEqual(init, fetchCache_1.init)) {
                if (Object.prototype.hasOwnProperty.call(fetchCache_1, 'error')) {
                    throw fetchCache_1.error;
                }
                if (Object.prototype.hasOwnProperty.call(fetchCache_1, 'response')) {
                    return fetchCache_1.response;
                }
                throw fetchCache_1.fetch;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (fetchCaches_1_1 && !fetchCaches_1_1.done && (_a = fetchCaches_1.return)) _a.call(fetchCaches_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var fetchCache = {
        client: client,
        fetch: client(input, init)
            .then(function (response) {
            var contentType = response.headers.get('Content-Type');
            if (contentType &&
                contentType.indexOf('application/json') !== -1) {
                return response.json();
            }
            return response.text();
        })
            .then(function (response) {
            fetchCache.response = response;
        })
            .catch(function (e) {
            fetchCache.error = e;
        })
            .then(function () {
            if (lifespan > 0) {
                setTimeout(function () {
                    var index = fetchCaches.indexOf(fetchCache);
                    if (index !== -1) {
                        fetchCaches.splice(index, 1);
                    }
                }, lifespan);
            }
        }),
        init: init,
        input: input
    };
    fetchCaches.push(fetchCache);
    throw fetchCache.fetch;
};
module.exports = useFetch;
