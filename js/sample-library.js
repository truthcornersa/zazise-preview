/**
 * ZAZISE sample library — this browser only. One IndexedDB store for upload + studio.
 * Database zazise-sample-v1. Stores: meta (fields below) and media (blob by id).
 * Nothing is sent to zazise.africa or Afrihost. Host the same HTML/JS on
 * build.couchwraps.co.za. If that host has no PHP upload API, this store is the
 * live behaviour. A later PHP API can replace put/list without changing the fields.
 *
 * TECHNICAL LOGIC
 * 1. Affordance (kind / type / affordance), chosen explicitly, not by viewport:
 *    - video (Desktop) → surfaces ["timeline"] → home/preview index feed only
 *    - clip (Phone · Clips) → surfaces ["clips"] → clips page only
 *    - both → surfaces ["timeline","clips"] → both
 *    Public feed items must be status published, visibility public, and not
 *    scheduled in the future (isPublicNow). Studio still lists drafts, private,
 *    unlisted, and scheduled items for the owner.
 * 2. Persist on every save: title and caption (same text), description, thumb,
 *    visibility, scheduleAt, kind/type/affordance, surfaces, createdAt, updatedAt,
 *    and the media blob. Also duration, filename, size, frames, status, views,
 *    channel, handle, photo.
 * 3. Studio reads this same store: list newest-first, watch, edit (upload.html?id=),
 *    delete. Banner is localStorage zaziseStudioBanner, not the video record.
 * 4. Views: callers must use armView(). A view increments only after the media
 *    element has played to currentTime >= 3 while not paused, once per id per page.
 * 5. Publish flow lives in sample-upload.js: file ready shows a success toast;
 *    Save draft and Publish write this store, then one-time confetti, then Studio.
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

  /**
   * Count one view only after 3 seconds of actual playback.
   * Shared by watch.html and clips.html. Does not count a paused scrub.
   */
  function armView(video, id, onCount) {
    if (!video || !id) return;
    var bag = video.__zaziseViewArm;
    if (!bag) {
      bag = { id: id, counted: {}, onCount: onCount || null };
      video.__zaziseViewArm = bag;
      video.addEventListener("timeupdate", function () {
        var st = video.__zaziseViewArm;
        if (!st || !st.id || st.counted[st.id]) return;
        if (video.currentTime >= 3 && !video.paused) {
          st.counted[st.id] = true;
          bumpView(st.id).then(function (n) {
            if (st.onCount) st.onCount(n, st.id);
          }).catch(function () {});
        }
      });
      return;
    }
    bag.id = id;
    bag.onCount = onCount || null;
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
    armView: armView,
    objectUrl: objectUrl,
    revoke: revoke,
    timelineItems: timelineItems,
    clipItems: clipItems,
    isPublicNow: isPublicNow,
    newId: newId,
    banner: banner,
    setBanner: setBanner,
    deviceNote: "Uploads stay in this browser (IndexedDB zazise-sample-v1) until a PHP upload API exists. Desktop is the home timeline only. Phone · Clips is the clips page only. Both is both. Views count after 3 seconds of playback. Not on zazise.africa."
  };
})(window);
