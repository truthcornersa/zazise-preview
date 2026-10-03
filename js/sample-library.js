/**
 * ZAZISE sample library — this browser only.
 * Uploads (metadata + video blobs) live in IndexedDB on this device.
 * Nothing is sent to zazise.africa or Afrihost. A PHP API would replace this later.
 */
(function (global) {
  "use strict";

  var DB = "zazise-sample-v1";
  var META = "meta";
  var MEDIA = "media";
  var urls = Object.create(null);

  function openDb() {
    return new Promise(function (resolve, reject) {
      if (!global.indexedDB) {
        reject(new Error("no-idb"));
        return;
      }
      var req = indexedDB.open(DB, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(META)) db.createObjectStore(META, { keyPath: "id" });
        if (!db.objectStoreNames.contains(MEDIA)) db.createObjectStore(MEDIA, { keyPath: "id" });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error("idb")); };
    });
  }

  function txDone(tx) {
    return new Promise(function (resolve, reject) {
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error || new Error("tx")); };
      tx.onabort = function () { reject(tx.error || new Error("abort")); };
    });
  }

  function isPhone() {
    try {
      return global.matchMedia("(max-width: 768px)").matches;
    } catch (e) {
      return false;
    }
  }

  function surfacesFor(kind) {
    if (kind === "clip") return ["clips"];
    if (kind === "both") return ["timeline", "clips"];
    return ["timeline"];
  }

  function readProfile() {
    var raw = null;
    try { raw = sessionStorage.getItem("zazisePreviewProfile"); } catch (e) {}
    if (!raw) {
      try { raw = localStorage.getItem("zazisePreviewProfile"); } catch (e2) {}
    }
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e3) { return null; }
  }

  function channelFromProfile() {
    var p = readProfile() || {};
    var name = [p.firstName || p.name || "", p.surname || ""].join(" ").trim();
    if (!name && global.ZaziseAuth && ZaziseAuth.user) {
      name = [ZaziseAuth.user.name || "", ZaziseAuth.user.surname || ""].join(" ").trim();
    }
    var handle = (p.handle || p.email || name || "you").toString().split("@")[0].replace(/\s+/g, "").toLowerCase();
    return {
      name: name || "Your studio",
      handle: handle || "you",
      photo: p.photo || (global.ZaziseAuth && ZaziseAuth.user && ZaziseAuth.user.photo) || ""
    };
  }

  function list() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var req = db.transaction(META, "readonly").objectStore(META).getAll();
        req.onsuccess = function () {
          var rows = req.result || [];
          rows.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
          resolve(rows);
        };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function getMeta(id) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var req = db.transaction(META, "readonly").objectStore(META).get(id);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function getBlob(id) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var req = db.transaction(MEDIA, "readonly").objectStore(MEDIA).get(id);
        req.onsuccess = function () {
          var row = req.result;
          resolve(row && row.blob ? row.blob : null);
        };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function put(meta, blob) {
    return openDb().then(function (db) {
      var tx = db.transaction([META, MEDIA], "readwrite");
      tx.objectStore(META).put(meta);
      if (blob) tx.objectStore(MEDIA).put({ id: meta.id, blob: blob });
      return txDone(tx).then(function () { return meta; });
    });
  }

  function remove(id) {
    revoke(id);
    return openDb().then(function (db) {
      var tx = db.transaction([META, MEDIA], "readwrite");
      tx.objectStore(META).delete(id);
      tx.objectStore(MEDIA).delete(id);
      return txDone(tx);
    });
  }

  function patch(id, fields) {
    return getMeta(id).then(function (meta) {
      if (!meta) return null;
      Object.keys(fields).forEach(function (k) { meta[k] = fields[k]; });
      return openDb().then(function (db) {
        var tx = db.transaction(META, "readwrite");
        tx.objectStore(META).put(meta);
        return txDone(tx).then(function () { return meta; });
      });
    });
  }

  function bumpView(id) {
    return getMeta(id).then(function (meta) {
      if (!meta) return 0;
      meta.views = (meta.views || 0) + 1;
      return openDb().then(function (db) {
        var tx = db.transaction(META, "readwrite");
        tx.objectStore(META).put(meta);
        return txDone(tx).then(function () { return meta.views; });
      });
    });
  }

  function objectUrl(id) {
    if (urls[id]) return Promise.resolve(urls[id]);
    return getBlob(id).then(function (blob) {
      if (!blob) return "";
      var url = URL.createObjectURL(blob);
      urls[id] = url;
      return url;
    });
  }

  function revoke(id) {
    if (urls[id]) {
      try { URL.revokeObjectURL(urls[id]); } catch (e) {}
      delete urls[id];
    }
  }

  function revokeAll() {
    Object.keys(urls).forEach(revoke);
  }

  global.addEventListener("pagehide", revokeAll);

  function isPublicNow(item) {
    if (!item || item.status !== "published") return false;
    if (item.visibility !== "public") return false;
    if (item.scheduleAt) {
      var t = Date.parse(item.scheduleAt);
      if (!isNaN(t) && t > Date.now()) return false;
    }
    return true;
  }

  function hasSurface(item, name) {
    var s = item.surfaces || [];
    return s.indexOf(name) !== -1;
  }

  function timelineItems(rows) {
    return (rows || []).filter(function (item) {
      return isPublicNow(item) && hasSurface(item, "timeline");
    });
  }

  function clipItems(rows) {
    return (rows || []).filter(function (item) {
      return isPublicNow(item) && hasSurface(item, "clips");
    });
  }

  function newId() {
    return "up_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function banner() {
    try { return localStorage.getItem("zaziseStudioBanner") || ""; } catch (e) { return ""; }
  }

  function setBanner(dataUrl) {
    try { localStorage.setItem("zaziseStudioBanner", dataUrl || ""); } catch (e) {}
  }

  global.ZaziseSample = {
    isPhone: isPhone,
    surfacesFor: surfacesFor,
    readProfile: readProfile,
    channelFromProfile: channelFromProfile,
    list: list,
    getMeta: getMeta,
    getBlob: getBlob,
    put: put,
    remove: remove,
    patch: patch,
    bumpView: bumpView,
    objectUrl: objectUrl,
    revoke: revoke,
    timelineItems: timelineItems,
    clipItems: clipItems,
    isPublicNow: isPublicNow,
    newId: newId,
    banner: banner,
    setBanner: setBanner,
    deviceNote: "Sample only. Uploads stay in this browser (IndexedDB). They are not on zazise.africa. Playback, views, and the studio need this device; a later PHP build would store them on the server."
  };
})(window);
