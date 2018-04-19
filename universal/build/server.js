/******/ (function(modules) { // webpackBootstrap
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadUpdateChunk(chunkId) {
/******/ 		var chunk = require("./" + "" + chunkId + "." + hotCurrentHash + ".hot-update.js");
/******/ 		hotAddUpdateChunk(chunk.id, chunk.modules);
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadManifest() {
/******/ 		try {
/******/ 			var update = require("./" + "" + hotCurrentHash + ".hot-update.json");
/******/ 		} catch (e) {
/******/ 			return Promise.resolve();
/******/ 		}
/******/ 		return Promise.resolve(update);
/******/ 	}
/******/
/******/ 	//eslint-disable-next-line no-unused-vars
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "9c948484b2d5e3317aaa"; // eslint-disable-line no-unused-vars
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = []; // eslint-disable-line no-unused-vars
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateRequire(moduleId) {
/******/ 		var me = installedModules[moduleId];
/******/ 		if (!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if (me.hot.active) {
/******/ 				if (installedModules[request]) {
/******/ 					if (installedModules[request].parents.indexOf(moduleId) === -1)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if (me.children.indexOf(request) === -1) me.children.push(request);
/******/ 			} else {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" +
/******/ 						request +
/******/ 						") from disposed module " +
/******/ 						moduleId
/******/ 				);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for (var name in __webpack_require__) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(__webpack_require__, name) &&
/******/ 				name !== "e"
/******/ 			) {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if (hotStatus === "ready") hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if (hotStatus === "prepare") {
/******/ 					if (!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if (hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateModule(moduleId) {
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if (typeof dep === "undefined") hot._selfAccepted = true;
/******/ 				else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if (typeof dep === "undefined") hot._selfDeclined = true;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if (!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if (idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for (var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = +id + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/
/******/ 	function hotCheck(apply) {
/******/ 		if (hotStatus !== "idle")
/******/ 			throw new Error("check() is only allowed in idle status");
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if (!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = "main";
/******/ 			{
/******/ 				// eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if (
/******/ 				hotStatus === "prepare" &&
/******/ 				hotChunksLoading === 0 &&
/******/ 				hotWaitingFiles === 0
/******/ 			) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) {
/******/ 		if (!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for (var moduleId in moreModules) {
/******/ 			if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if (--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if (!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if (!deferred) return;
/******/ 		if (hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve()
/******/ 				.then(function() {
/******/ 					return hotApply(hotApplyOnUpdate);
/******/ 				})
/******/ 				.then(
/******/ 					function(result) {
/******/ 						deferred.resolve(result);
/******/ 					},
/******/ 					function(err) {
/******/ 						deferred.reject(err);
/******/ 					}
/******/ 				);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for (var id in hotUpdate) {
/******/ 				if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotApply(options) {
/******/ 		if (hotStatus !== "ready")
/******/ 			throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/
/******/ 			var queue = outdatedModules.slice().map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while (queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if (!module || module.hot._selfAccepted) continue;
/******/ 				if (module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if (module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for (var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if (!parent) continue;
/******/ 					if (parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 					if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if (!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/
/******/ 		function addAllToSet(a, b) {
/******/ 			for (var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if (a.indexOf(item) === -1) a.push(item);
/******/ 			}
/******/ 		}
/******/
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn(
/******/ 				"[HMR] unexpected require(" + result.moduleId + ") to disposed module"
/******/ 			);
/******/ 		};
/******/
/******/ 		for (var id in hotUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				/** @type {any} */
/******/ 				var result;
/******/ 				if (hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				/** @type {Error|false} */
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if (result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch (result.type) {
/******/ 					case "self-declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of self decline: " +
/******/ 									result.moduleId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of declined dependency: " +
/******/ 									result.moduleId +
/******/ 									" in " +
/******/ 									result.parentId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 						if (!options.ignoreUnaccepted)
/******/ 							abortError = new Error(
/******/ 								"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if (options.onAccepted) options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if (options.onDisposed) options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if (abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if (doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for (moduleId in result.outdatedDependencies) {
/******/ 						if (
/******/ 							Object.prototype.hasOwnProperty.call(
/******/ 								result.outdatedDependencies,
/******/ 								moduleId
/******/ 							)
/******/ 						) {
/******/ 							if (!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(
/******/ 								outdatedDependencies[moduleId],
/******/ 								result.outdatedDependencies[moduleId]
/******/ 							);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if (doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for (i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if (
/******/ 				installedModules[moduleId] &&
/******/ 				installedModules[moduleId].hot._selfAccepted
/******/ 			)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if (hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while (queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if (!module) continue;
/******/
/******/ 			var data = {};
/******/
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for (j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/
/******/ 			// remove "parents" references from all children
/******/ 			for (j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if (!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if (idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if (idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/
/******/ 		// insert new code
/******/ 		for (moduleId in appliedUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for (i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if (cb) {
/******/ 							if (callbacks.indexOf(cb) !== -1) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for (i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch (err) {
/******/ 							if (options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if (!options.ignoreErrored) {
/******/ 								if (!error) error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Load self accepted modules
/******/ 		for (i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch (err) {
/******/ 				if (typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch (err2) {
/******/ 						if (options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if (!options.ignoreErrored) {
/******/ 							if (!error) error = err2;
/******/ 						}
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if (options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if (!options.ignoreErrored) {
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if (error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://localhost:3001/";
/******/
/******/ 	// object with all compiled WebAssembly.Modules
/******/ 	__webpack_require__.w = {};
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./build/assets.json":
/*!***************************!*\
  !*** ./build/assets.json ***!
  \***************************/
/*! exports provided: client, default */
/***/ (function(module) {

module.exports = {"client":{"js":"http://localhost:3001/static/js/bundle.js"}};

/***/ }),

/***/ "./node_modules/webpack/hot/log-apply-result.js":
/*!*****************************************!*\
  !*** (webpack)/hot/log-apply-result.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function(updatedModules, renewedModules) {
	var unacceptedModules = updatedModules.filter(function(moduleId) {
		return renewedModules && renewedModules.indexOf(moduleId) < 0;
	});
	var log = __webpack_require__(/*! ./log */ "./node_modules/webpack/hot/log.js");

	if (unacceptedModules.length > 0) {
		log(
			"warning",
			"[HMR] The following modules couldn't be hot updated: (They would need a full reload!)"
		);
		unacceptedModules.forEach(function(moduleId) {
			log("warning", "[HMR]  - " + moduleId);
		});
	}

	if (!renewedModules || renewedModules.length === 0) {
		log("info", "[HMR] Nothing hot updated.");
	} else {
		log("info", "[HMR] Updated modules:");
		renewedModules.forEach(function(moduleId) {
			if (typeof moduleId === "string" && moduleId.indexOf("!") !== -1) {
				var parts = moduleId.split("!");
				log.groupCollapsed("info", "[HMR]  - " + parts.pop());
				log("info", "[HMR]  - " + moduleId);
				log.groupEnd("info");
			} else {
				log("info", "[HMR]  - " + moduleId);
			}
		});
		var numberIds = renewedModules.every(function(moduleId) {
			return typeof moduleId === "number";
		});
		if (numberIds)
			log(
				"info",
				"[HMR] Consider using the NamedModulesPlugin for module names."
			);
	}
};


/***/ }),

/***/ "./node_modules/webpack/hot/log.js":
/*!****************************!*\
  !*** (webpack)/hot/log.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

var logLevel = "info";

function dummy() {}

function shouldLog(level) {
	var shouldLog =
		(logLevel === "info" && level === "info") ||
		(["info", "warning"].indexOf(logLevel) >= 0 && level === "warning") ||
		(["info", "warning", "error"].indexOf(logLevel) >= 0 && level === "error");
	return shouldLog;
}

function logGroup(logFn) {
	return function(level, msg) {
		if (shouldLog(level)) {
			logFn(msg);
		}
	};
}

module.exports = function(level, msg) {
	if (shouldLog(level)) {
		if (level === "info") {
			console.log(msg);
		} else if (level === "warning") {
			console.warn(msg);
		} else if (level === "error") {
			console.error(msg);
		}
	}
};

var group = console.group || dummy;
var groupCollapsed = console.groupCollapsed || dummy;
var groupEnd = console.groupEnd || dummy;

module.exports.group = logGroup(group);

module.exports.groupCollapsed = logGroup(groupCollapsed);

module.exports.groupEnd = logGroup(groupEnd);

module.exports.setLogLevel = function(level) {
	logLevel = level;
};


/***/ }),

/***/ "./node_modules/webpack/hot/poll.js?300":
/*!*********************************!*\
  !*** (webpack)/hot/poll.js?300 ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__resourceQuery) {/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
/*globals __resourceQuery */
if (true) {
	var hotPollInterval = +__resourceQuery.substr(1) || 10 * 60 * 1000;
	var log = __webpack_require__(/*! ./log */ "./node_modules/webpack/hot/log.js");

	var checkForUpdate = function checkForUpdate(fromUpdate) {
		if (module.hot.status() === "idle") {
			module.hot
				.check(true)
				.then(function(updatedModules) {
					if (!updatedModules) {
						if (fromUpdate) log("info", "[HMR] Update applied.");
						return;
					}
					__webpack_require__(/*! ./log-apply-result */ "./node_modules/webpack/hot/log-apply-result.js")(updatedModules, updatedModules);
					checkForUpdate(true);
				})
				.catch(function(err) {
					var status = module.hot.status();
					if (["abort", "fail"].indexOf(status) >= 0) {
						log("warning", "[HMR] Cannot apply update.");
						log("warning", "[HMR] " + err.stack || err.message);
						log("warning", "[HMR] You need to restart the application!");
					} else {
						log("warning", "[HMR] Update failed: " + err.stack || err.message);
					}
				});
		}
	};
	setInterval(checkForUpdate, hotPollInterval);
} else {}

/* WEBPACK VAR INJECTION */}.call(this, "?300"))

/***/ }),

/***/ "./src/App/App.js":
/*!************************!*\
  !*** ./src/App/App.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/core-js/object/get-prototype-of */ "babel-runtime/core-js/object/get-prototype-of");
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ "babel-runtime/helpers/classCallCheck");
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! babel-runtime/helpers/createClass */ "babel-runtime/helpers/createClass");
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! babel-runtime/helpers/possibleConstructorReturn */ "babel-runtime/helpers/possibleConstructorReturn");
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! babel-runtime/helpers/inherits */ "babel-runtime/helpers/inherits");
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_native_web_dist_exports_StyleSheet__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-native-web/dist/exports/StyleSheet */ "react-native-web/dist/exports/StyleSheet");
/* harmony import */ var react_native_web_dist_exports_StyleSheet__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_StyleSheet__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var react_native_web_dist_exports_View__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-native-web/dist/exports/View */ "react-native-web/dist/exports/View");
/* harmony import */ var react_native_web_dist_exports_View__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_View__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var react_native_web_dist_exports_Text__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-native-web/dist/exports/Text */ "react-native-web/dist/exports/Text");
/* harmony import */ var react_native_web_dist_exports_Text__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_Text__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var react_native_web_dist_exports_Button__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react-native-web/dist/exports/Button */ "react-native-web/dist/exports/Button");
/* harmony import */ var react_native_web_dist_exports_Button__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_Button__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _react_navigation_switch_navigator__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../react-navigation-switch-navigator */ "./src/react-navigation-switch-navigator/index.js");
/* harmony import */ var _react_navigation_switch_navigator__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_switch_navigator__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var _react_navigation_native_container__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../react-navigation-native-container */ "./src/react-navigation-native-container/index.js");
/* harmony import */ var _react_navigation_native_container__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_native_container__WEBPACK_IMPORTED_MODULE_11__);





var _jsxFileName = '/Users/ericvicenti/navigation/navigation/universal/src/App/App.js';









var ScreenA = function (_React$Component) {
  babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default()(ScreenA, _React$Component);

  function ScreenA() {
    babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, ScreenA);

    return babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3___default()(this, (ScreenA.__proto__ || babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0___default()(ScreenA)).apply(this, arguments));
  }

  babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(ScreenA, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(
        react_native_web_dist_exports_View__WEBPACK_IMPORTED_MODULE_7___default.a,
        { style: styles.box, __source: {
            fileName: _jsxFileName,
            lineNumber: 9
          }
        },
        react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(
          react_native_web_dist_exports_Text__WEBPACK_IMPORTED_MODULE_8___default.a,
          { style: styles.text, __source: {
              fileName: _jsxFileName,
              lineNumber: 10
            }
          },
          'Hello, screen A!'
        ),
        react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(react_native_web_dist_exports_Button__WEBPACK_IMPORTED_MODULE_9___default.a, {
          onPress: function onPress() {
            _this2.props.navigation.navigate('ScreenB');
          },
          title: 'Go Screen B',
          __source: {
            fileName: _jsxFileName,
            lineNumber: 11
          }
        })
      );
    }
  }]);

  return ScreenA;
}(react__WEBPACK_IMPORTED_MODULE_5___default.a.Component);

var ScreenB = function (_React$Component2) {
  babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default()(ScreenB, _React$Component2);

  function ScreenB() {
    babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, ScreenB);

    return babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3___default()(this, (ScreenB.__proto__ || babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0___default()(ScreenB)).apply(this, arguments));
  }

  babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(ScreenB, [{
    key: 'render',
    value: function render() {
      var _this4 = this;

      return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(
        react_native_web_dist_exports_View__WEBPACK_IMPORTED_MODULE_7___default.a,
        { style: styles.box, __source: {
            fileName: _jsxFileName,
            lineNumber: 25
          }
        },
        react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(
          react_native_web_dist_exports_Text__WEBPACK_IMPORTED_MODULE_8___default.a,
          { style: styles.text, __source: {
              fileName: _jsxFileName,
              lineNumber: 26
            }
          },
          'Hello, screen B!'
        ),
        react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(react_native_web_dist_exports_Button__WEBPACK_IMPORTED_MODULE_9___default.a, {
          onPress: function onPress() {
            _this4.props.navigation.navigate('ScreenA');
          },
          title: 'Go Back',
          __source: {
            fileName: _jsxFileName,
            lineNumber: 27
          }
        })
      );
    }
  }]);

  return ScreenB;
}(react__WEBPACK_IMPORTED_MODULE_5___default.a.Component);

var App = Object(_react_navigation_native_container__WEBPACK_IMPORTED_MODULE_11__["createAppContainer"])(Object(_react_navigation_switch_navigator__WEBPACK_IMPORTED_MODULE_10__["createSwitchNavigator"])({
  ScreenA: ScreenA,
  ScreenB: ScreenB
}));

/* harmony default export */ __webpack_exports__["default"] = (App);

var styles = react_native_web_dist_exports_StyleSheet__WEBPACK_IMPORTED_MODULE_6___default.a.create({
  box: {
    padding: 10,
    borderWidth: 3,
    borderColor: 'blue',
    flex: 1
  },
  text: { fontWeight: 'bold' }
});

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./server */ "./src/server.js");
/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! http */ "http");
/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(http__WEBPACK_IMPORTED_MODULE_1__);



var server = http__WEBPACK_IMPORTED_MODULE_1___default.a.createServer(_server__WEBPACK_IMPORTED_MODULE_0__["default"]);

var currentApp = _server__WEBPACK_IMPORTED_MODULE_0__["default"];

server.listen("3000" || 3000, function (error) {
  if (error) {
    console.log(error);
  }

  console.log('🚀 started');
});

if (true) {
  console.log('✅  Server-side HMR Enabled!');

  module.hot.accept(/*! ./server */ "./src/server.js", function(__WEBPACK_OUTDATED_DEPENDENCIES__) { /* harmony import */ _server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./server */ "./src/server.js");
(function () {
    console.log('🔁  HMR Reloading `./server`...');
    server.removeListener('request', currentApp);
    var newApp = __webpack_require__(/*! ./server */ "./src/server.js").default;
    server.on('request', newApp);
    currentApp = newApp;
  })(__WEBPACK_OUTDATED_DEPENDENCIES__); });
}

/***/ }),

/***/ "./src/react-navigation-core/NavigationActions.js":
/*!********************************************************!*\
  !*** ./src/react-navigation-core/NavigationActions.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var BACK = 'Navigation/BACK';
var INIT = 'Navigation/INIT';
var NAVIGATE = 'Navigation/NAVIGATE';
var SET_PARAMS = 'Navigation/SET_PARAMS';

var back = function back() {
  var payload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    type: BACK,
    key: payload.key,
    immediate: payload.immediate
  };
};

var init = function init() {
  var payload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var action = {
    type: INIT
  };
  if (payload.params) {
    action.params = payload.params;
  }
  return action;
};

var navigate = function navigate(payload) {
  var action = {
    type: NAVIGATE,
    routeName: payload.routeName
  };
  if (payload.params) {
    action.params = payload.params;
  }
  if (payload.action) {
    action.action = payload.action;
  }
  if (payload.key) {
    action.key = payload.key;
  }
  return action;
};

var setParams = function setParams(payload) {
  return {
    type: SET_PARAMS,
    key: payload.key,
    params: payload.params
  };
};

/* harmony default export */ __webpack_exports__["default"] = ({
  // Action constants
  BACK: BACK,
  INIT: INIT,
  NAVIGATE: NAVIGATE,
  SET_PARAMS: SET_PARAMS,

  // Action creators
  back: back,
  init: init,
  navigate: navigate,
  setParams: setParams
});

/***/ }),

/***/ "./src/react-navigation-core/NavigationContext.js":
/*!********************************************************!*\
  !*** ./src/react-navigation-core/NavigationContext.js ***!
  \********************************************************/
/*! exports provided: NavigationProvider, NavigationConsumer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NavigationProvider", function() { return NavigationProvider; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NavigationConsumer", function() { return NavigationConsumer; });
/* harmony import */ var create_react_context__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! create-react-context */ "create-react-context");
/* harmony import */ var create_react_context__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(create_react_context__WEBPACK_IMPORTED_MODULE_0__);


var NavigationContext = create_react_context__WEBPACK_IMPORTED_MODULE_0___default()();

var NavigationProvider = NavigationContext.Provider;
var NavigationConsumer = NavigationContext.Consumer;

/***/ }),

/***/ "./src/react-navigation-core/PlatformHelpers.js":
/*!******************************************************!*\
  !*** ./src/react-navigation-core/PlatformHelpers.js ***!
  \******************************************************/
/*! exports provided: BackHandler, MaskedViewIOS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BackHandler", function() { return BackHandler; });
/* harmony import */ var react_native_web_dist_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-native-web/dist/index */ "react-native-web/dist/index");
/* harmony import */ var react_native_web_dist_index__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_index__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_native_web_dist_exports_BackHandler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-native-web/dist/exports/BackHandler */ "react-native-web/dist/exports/BackHandler");
/* harmony import */ var react_native_web_dist_exports_BackHandler__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_BackHandler__WEBPACK_IMPORTED_MODULE_1__);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MaskedViewIOS", function() { return react_native_web_dist_index__WEBPACK_IMPORTED_MODULE_0__["MaskedViewIOS"]; });






var BackHandler = react_native_web_dist_exports_BackHandler__WEBPACK_IMPORTED_MODULE_1___default.a || react_native_web_dist_index__WEBPACK_IMPORTED_MODULE_0__["BackAndroid"];



/***/ }),

/***/ "./src/react-navigation-core/SceneView.js":
/*!************************************************!*\
  !*** ./src/react-navigation-core/SceneView.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/core-js/object/get-prototype-of */ "babel-runtime/core-js/object/get-prototype-of");
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ "babel-runtime/helpers/classCallCheck");
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! babel-runtime/helpers/createClass */ "babel-runtime/helpers/createClass");
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! babel-runtime/helpers/possibleConstructorReturn */ "babel-runtime/helpers/possibleConstructorReturn");
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! babel-runtime/helpers/inherits */ "babel-runtime/helpers/inherits");
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _NavigationContext__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./NavigationContext */ "./src/react-navigation-core/NavigationContext.js");





var _jsxFileName = '/Users/ericvicenti/navigation/navigation/universal/src/react-navigation-core/SceneView.js';



var SceneView = function (_React$PureComponent) {
  babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default()(SceneView, _React$PureComponent);

  function SceneView() {
    babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, SceneView);

    return babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3___default()(this, (SceneView.__proto__ || babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0___default()(SceneView)).apply(this, arguments));
  }

  babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(SceneView, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          screenProps = _props.screenProps,
          Component = _props.component,
          navigation = _props.navigation;

      return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(
        _NavigationContext__WEBPACK_IMPORTED_MODULE_6__["NavigationProvider"],
        { value: navigation, __source: {
            fileName: _jsxFileName,
            lineNumber: 8
          }
        },
        react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(Component, { screenProps: screenProps, navigation: navigation, __source: {
            fileName: _jsxFileName,
            lineNumber: 9
          }
        })
      );
    }
  }]);

  return SceneView;
}(react__WEBPACK_IMPORTED_MODULE_5___default.a.PureComponent);

/* harmony default export */ __webpack_exports__["default"] = (SceneView);

/***/ }),

/***/ "./src/react-navigation-core/createConfigGetter.js":
/*!*********************************************************!*\
  !*** ./src/react-navigation-core/createConfigGetter.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/typeof */ "babel-runtime/helpers/typeof");
/* harmony import */ var babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/core-js/object/assign */ "babel-runtime/core-js/object/assign");
/* harmony import */ var babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./invariant */ "./src/react-navigation-core/invariant.js");
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_invariant__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _getScreenForRouteName__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./getScreenForRouteName */ "./src/react-navigation-core/getScreenForRouteName.js");
/* harmony import */ var _validateScreenOptions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./validateScreenOptions */ "./src/react-navigation-core/validateScreenOptions.js");







function applyConfig(configurer, navigationOptions, configProps) {
  if (typeof configurer === 'function') {
    return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, navigationOptions, configurer(babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, configProps, {
      navigationOptions: navigationOptions
    })));
  }
  if ((typeof configurer === 'undefined' ? 'undefined' : babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(configurer)) === 'object') {
    return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, navigationOptions, configurer);
  }
  return navigationOptions;
}

/* harmony default export */ __webpack_exports__["default"] = (function (routeConfigs, navigatorScreenConfig) {
  return function (navigation, screenProps) {
    var state = navigation.state;

    var route = state;

    _invariant__WEBPACK_IMPORTED_MODULE_2___default()(route.routeName && typeof route.routeName === 'string', 'Cannot get config because the route does not have a routeName.');

    var Component = Object(_getScreenForRouteName__WEBPACK_IMPORTED_MODULE_3__["default"])(routeConfigs, route.routeName);

    var routeConfig = routeConfigs[route.routeName];

    var routeScreenConfig = routeConfig === Component ? null : routeConfig.navigationOptions;
    var componentScreenConfig = Component.navigationOptions;

    var configOptions = { navigation: navigation, screenProps: screenProps || {} };

    var outputConfig = applyConfig(navigatorScreenConfig, {}, configOptions);
    outputConfig = applyConfig(componentScreenConfig, outputConfig, configOptions);
    outputConfig = applyConfig(routeScreenConfig, outputConfig, configOptions);

    Object(_validateScreenOptions__WEBPACK_IMPORTED_MODULE_4__["default"])(outputConfig, route);

    return outputConfig;
  };
});

/***/ }),

/***/ "./src/react-navigation-core/createNavigator.js":
/*!******************************************************!*\
  !*** ./src/react-navigation-core/createNavigator.js ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/core-js/object/assign */ "babel-runtime/core-js/object/assign");
/* harmony import */ var babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_core_js_object_values__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/core-js/object/values */ "babel-runtime/core-js/object/values");
/* harmony import */ var babel_runtime_core_js_object_values__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_values__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! babel-runtime/core-js/object/keys */ "babel-runtime/core-js/object/keys");
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! babel-runtime/core-js/object/get-prototype-of */ "babel-runtime/core-js/object/get-prototype-of");
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ "babel-runtime/helpers/classCallCheck");
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! babel-runtime/helpers/createClass */ "babel-runtime/helpers/createClass");
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! babel-runtime/helpers/possibleConstructorReturn */ "babel-runtime/helpers/possibleConstructorReturn");
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! babel-runtime/helpers/inherits */ "babel-runtime/helpers/inherits");
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _getChildEventSubscriber__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./getChildEventSubscriber */ "./src/react-navigation-core/getChildEventSubscriber.js");








var _jsxFileName = '/Users/ericvicenti/navigation/navigation/universal/src/react-navigation-core/createNavigator.js';




function createNavigator(NavigatorView, router, navigationConfig) {
  var Navigator = function (_React$Component) {
    babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_7___default()(Navigator, _React$Component);

    function Navigator() {
      var _ref;

      var _temp, _this, _ret;

      babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_4___default()(this, Navigator);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_6___default()(this, (_ref = Navigator.__proto__ || babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_3___default()(Navigator)).call.apply(_ref, [this].concat(args))), _this), _this.childEventSubscribers = {}, _this._isRouteFocused = function (route) {
        return function () {
          var state = _this.props.navigation.state;

          var focusedRoute = state.routes[state.index];
          return route === focusedRoute;
        };
      }, _this._dangerouslyGetParent = function () {
        return _this.props.navigation;
      }, _temp), babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_6___default()(_this, _ret);
    }

    babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_5___default()(Navigator, [{
      key: 'componentDidUpdate',


      // Cleanup subscriptions for routes that no longer exist
      value: function componentDidUpdate() {
        var _this2 = this;

        var activeKeys = this.props.navigation.state.routes.map(function (r) {
          return r.key;
        });
        babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2___default()(this.childEventSubscribers).forEach(function (key) {
          if (!activeKeys.includes(key)) {
            _this2.childEventSubscribers[key].removeAll();
            delete _this2.childEventSubscribers[key];
          }
        });
      }

      // Remove all subscriptions

    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        babel_runtime_core_js_object_values__WEBPACK_IMPORTED_MODULE_1___default()(this.childEventSubscribers).map(function (s) {
          return s.removeAll();
        });
      }
    }, {
      key: 'render',
      value: function render() {
        var _this3 = this;

        var _props = this.props,
            navigation = _props.navigation,
            screenProps = _props.screenProps;
        var dispatch = navigation.dispatch,
            state = navigation.state,
            addListener = navigation.addListener;
        var routes = state.routes;


        var descriptors = {};
        routes.forEach(function (route) {
          var getComponent = function getComponent() {
            return router.getComponentForRouteName(route.routeName);
          };

          if (!_this3.childEventSubscribers[route.key]) {
            _this3.childEventSubscribers[route.key] = Object(_getChildEventSubscriber__WEBPACK_IMPORTED_MODULE_9__["default"])(addListener, route.key);
          }

          var actionCreators = babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0___default()({}, navigation.actions, router.getActionCreators(route, state.key));
          var actionHelpers = {};
          babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2___default()(actionCreators).forEach(function (actionName) {
            actionHelpers[actionName] = function () {
              var actionCreator = actionCreators[actionName];
              var action = actionCreator.apply(undefined, arguments);
              dispatch(action);
            };
          });
          var childNavigation = babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0___default()({}, actionHelpers, {
            actions: actionCreators,
            dispatch: dispatch,
            state: route,
            isFocused: function isFocused() {
              return _this3._isRouteFocused(route);
            },
            dangerouslyGetParent: _this3._dangerouslyGetParent,
            addListener: _this3.childEventSubscribers[route.key].addListener,
            getParam: function getParam(paramName, defaultValue) {
              var params = route.params;

              if (params && paramName in params) {
                return params[paramName];
              }

              return defaultValue;
            }
          });

          var options = router.getScreenOptions(childNavigation, screenProps);
          descriptors[route.key] = {
            key: route.key,
            getComponent: getComponent,
            options: options,
            state: route,
            navigation: childNavigation
          };
        });

        return react__WEBPACK_IMPORTED_MODULE_8___default.a.createElement(NavigatorView, {
          screenProps: screenProps,
          navigation: navigation,
          navigationConfig: navigationConfig,
          descriptors: descriptors,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 97
          }
        });
      }
    }]);

    return Navigator;
  }(react__WEBPACK_IMPORTED_MODULE_8___default.a.Component);

  Navigator.router = router;
  Navigator.navigationOptions = null;

  return Navigator;
}

/* harmony default export */ __webpack_exports__["default"] = (createNavigator);

/***/ }),

/***/ "./src/react-navigation-core/getChildEventSubscriber.js":
/*!**************************************************************!*\
  !*** ./src/react-navigation-core/getChildEventSubscriber.js ***!
  \**************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return getChildEventSubscriber; });
/* harmony import */ var babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/core-js/object/assign */ "babel-runtime/core-js/object/assign");
/* harmony import */ var babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/core-js/set */ "babel-runtime/core-js/set");
/* harmony import */ var babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_1__);


/*
 * This is used to extract one children's worth of events from a stream of navigation action events
 *
 * Based on the 'action' events that get fired for this navigation state, this utility will fire
 * focus and blur events for this child
 */
function getChildEventSubscriber(addListener, key) {
  var actionSubscribers = new babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_1___default.a();
  var willFocusSubscribers = new babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_1___default.a();
  var didFocusSubscribers = new babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_1___default.a();
  var willBlurSubscribers = new babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_1___default.a();
  var didBlurSubscribers = new babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_1___default.a();

  var removeAll = function removeAll() {
    [actionSubscribers, willFocusSubscribers, didFocusSubscribers, willBlurSubscribers, didBlurSubscribers].forEach(function (set) {
      return set.clear();
    });

    upstreamSubscribers.forEach(function (subs) {
      return subs && subs.remove();
    });
  };

  var getChildSubscribers = function getChildSubscribers(evtName) {
    switch (evtName) {
      case 'action':
        return actionSubscribers;
      case 'willFocus':
        return willFocusSubscribers;
      case 'didFocus':
        return didFocusSubscribers;
      case 'willBlur':
        return willBlurSubscribers;
      case 'didBlur':
        return didBlurSubscribers;
      default:
        return null;
    }
  };

  var emit = function emit(type, payload) {
    var payloadWithType = babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0___default()({}, payload, { type: type });
    var subscribers = getChildSubscribers(type);
    subscribers && subscribers.forEach(function (subs) {
      subs(payloadWithType);
    });
  };

  // lastEmittedEvent keeps track of focus state for one route. First we assume
  // we are blurred. If we are focused on initialization, the first 'action'
  // event will cause onFocus+willFocus events because we had previously been
  // considered blurred
  var lastEmittedEvent = 'didBlur';

  var upstreamEvents = ['willFocus', 'didFocus', 'willBlur', 'didBlur', 'action'];

  var upstreamSubscribers = upstreamEvents.map(function (eventName) {
    return addListener(eventName, function (payload) {
      var state = payload.state,
          lastState = payload.lastState,
          action = payload.action;

      var lastRoutes = lastState && lastState.routes;
      var routes = state && state.routes;

      var lastFocusKey = lastState && lastState.routes && lastState.routes[lastState.index].key;
      var focusKey = routes && routes[state.index].key;

      var isChildFocused = focusKey === key;
      var lastRoute = lastRoutes && lastRoutes.find(function (route) {
        return route.key === key;
      });
      var newRoute = routes && routes.find(function (route) {
        return route.key === key;
      });
      var childPayload = {
        context: key + ':' + action.type + '_' + (payload.context || 'Root'),
        state: newRoute,
        lastState: lastRoute,
        action: action,
        type: eventName
      };
      var isTransitioning = !!state && state.isTransitioning;

      var previouslyLastEmittedEvent = lastEmittedEvent;

      if (lastEmittedEvent === 'didBlur') {
        // The child is currently blurred. Look for willFocus conditions
        if (eventName === 'willFocus' && isChildFocused) {
          emit(lastEmittedEvent = 'willFocus', childPayload);
        } else if (eventName === 'action' && isChildFocused) {
          emit(lastEmittedEvent = 'willFocus', childPayload);
        }
      }
      if (lastEmittedEvent === 'willFocus') {
        // We are currently mid-focus. Look for didFocus conditions.
        // If state.isTransitioning is false, this child event happens immediately after willFocus
        if (eventName === 'didFocus' && isChildFocused && !isTransitioning) {
          emit(lastEmittedEvent = 'didFocus', childPayload);
        } else if (eventName === 'action' && isChildFocused && !isTransitioning) {
          emit(lastEmittedEvent = 'didFocus', childPayload);
        }
      }

      if (lastEmittedEvent === 'didFocus') {
        // The child is currently focused. Look for blurring events
        if (!isChildFocused) {
          // The child is no longer focused within this navigation state
          emit(lastEmittedEvent = 'willBlur', childPayload);
        } else if (eventName === 'willBlur') {
          // The parent is getting a willBlur event
          emit(lastEmittedEvent = 'willBlur', childPayload);
        } else if (eventName === 'action' && previouslyLastEmittedEvent === 'didFocus') {
          // While focused, pass action events to children for grandchildren focus
          emit('action', childPayload);
        }
      }

      if (lastEmittedEvent === 'willBlur') {
        // The child is mid-blur. Wait for transition to end
        if (eventName === 'action' && !isChildFocused && !isTransitioning) {
          // The child is done blurring because transitioning is over, or isTransitioning
          // never began and didBlur fires immediately after willBlur
          emit(lastEmittedEvent = 'didBlur', childPayload);
        } else if (eventName === 'didBlur') {
          // Pass through the parent didBlur event if it happens
          emit(lastEmittedEvent = 'didBlur', childPayload);
        }
      }
    });
  });

  return {
    removeAll: removeAll,
    addListener: function addListener(eventName, eventHandler) {
      var subscribers = getChildSubscribers(eventName);
      if (!subscribers) {
        throw new Error('Invalid event name "' + eventName + '"');
      }
      subscribers.add(eventHandler);
      var remove = function remove() {
        subscribers.delete(eventHandler);
      };
      return { remove: remove };
    }
  };
}

/***/ }),

/***/ "./src/react-navigation-core/getNavigationActionCreators.js":
/*!******************************************************************!*\
  !*** ./src/react-navigation-core/getNavigationActionCreators.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/typeof */ "babel-runtime/helpers/typeof");
/* harmony import */ var babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _NavigationActions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./NavigationActions */ "./src/react-navigation-core/NavigationActions.js");
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./invariant */ "./src/react-navigation-core/invariant.js");
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_invariant__WEBPACK_IMPORTED_MODULE_2__);




var getNavigationActionCreators = function getNavigationActionCreators(route) {
  return {
    goBack: function goBack(key) {
      var actualizedKey = key;
      if (key === undefined && route.key) {
        _invariant__WEBPACK_IMPORTED_MODULE_2___default()(typeof route.key === 'string', 'key should be a string');
        actualizedKey = route.key;
      }
      return _NavigationActions__WEBPACK_IMPORTED_MODULE_1__["default"].back({ key: actualizedKey });
    },
    navigate: function navigate(navigateTo, params, action) {
      if (typeof navigateTo === 'string') {
        return _NavigationActions__WEBPACK_IMPORTED_MODULE_1__["default"].navigate({
          routeName: navigateTo,
          params: params,
          action: action
        });
      }
      _invariant__WEBPACK_IMPORTED_MODULE_2___default()((typeof navigateTo === 'undefined' ? 'undefined' : babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(navigateTo)) === 'object', 'Must navigateTo an object or a string');
      _invariant__WEBPACK_IMPORTED_MODULE_2___default()(params == null, 'Params must not be provided to .navigate() when specifying an object');
      _invariant__WEBPACK_IMPORTED_MODULE_2___default()(action == null, 'Child action must not be provided to .navigate() when specifying an object');
      return _NavigationActions__WEBPACK_IMPORTED_MODULE_1__["default"].navigate(navigateTo);
    },
    setParams: function setParams(params) {
      _invariant__WEBPACK_IMPORTED_MODULE_2___default()(route.key && typeof route.key === 'string', 'setParams cannot be called by root navigator');
      return _NavigationActions__WEBPACK_IMPORTED_MODULE_1__["default"].setParams({ params: params, key: route.key });
    }
  };
};

/* harmony default export */ __webpack_exports__["default"] = (getNavigationActionCreators);

/***/ }),

/***/ "./src/react-navigation-core/getScreenForRouteName.js":
/*!************************************************************!*\
  !*** ./src/react-navigation-core/getScreenForRouteName.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return getScreenForRouteName; });
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/core-js/object/keys */ "babel-runtime/core-js/object/keys");
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./invariant */ "./src/react-navigation-core/invariant.js");
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_invariant__WEBPACK_IMPORTED_MODULE_1__);



/**
 * Simple helper that gets a single screen (React component or navigator)
 * out of the navigator config.
 */
function getScreenForRouteName(routeConfigs, routeName) {
  var routeConfig = routeConfigs[routeName];

  if (!routeConfig) {
    throw new Error('There is no route defined for key ' + routeName + '.\n' + ('Must be one of: ' + babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_0___default()(routeConfigs).map(function (a) {
      return '\'' + a + '\'';
    }).join(',')));
  }

  if (routeConfig.screen) {
    return routeConfig.screen;
  }

  if (typeof routeConfig.getScreen === 'function') {
    var screen = routeConfig.getScreen();
    _invariant__WEBPACK_IMPORTED_MODULE_1___default()(typeof screen === 'function', 'The getScreen defined for route \'' + routeName + ' didn\'t return a valid ' + 'screen or navigator.\n\n' + 'Please pass it like this:\n' + (routeName + ': {\n  getScreen: () => require(\'./MyScreen\').default\n}'));
    return screen;
  }

  return routeConfig;
}

/***/ }),

/***/ "./src/react-navigation-core/index.js":
/*!********************************************!*\
  !*** ./src/react-navigation-core/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  get invariant() {
    return __webpack_require__(/*! ./invariant */ "./src/react-navigation-core/invariant.js");
  },

  get createConfigGetter() {
    return __webpack_require__(/*! ./createConfigGetter */ "./src/react-navigation-core/createConfigGetter.js").default;
  },
  get createNavigator() {
    return __webpack_require__(/*! ./createNavigator */ "./src/react-navigation-core/createNavigator.js").default;
  },
  get getNavigationActionCreators() {
    return __webpack_require__(/*! ./getNavigationActionCreators */ "./src/react-navigation-core/getNavigationActionCreators.js").default;
  },
  get withNavigation() {
    return __webpack_require__(/*! ./withNavigation */ "./src/react-navigation-core/withNavigation.js").default;
  },
  get withNavigationFocus() {
    return __webpack_require__(/*! ./withNavigationFocus */ "./src/react-navigation-core/withNavigationFocus.js").default;
  },

  get SceneView() {
    return __webpack_require__(/*! ./SceneView */ "./src/react-navigation-core/SceneView.js").default;
  },

  get validateRouteConfigMap() {
    return __webpack_require__(/*! ./validateRouteConfigMap */ "./src/react-navigation-core/validateRouteConfigMap.js").default;
  },

  get NavigationActions() {
    return __webpack_require__(/*! ./NavigationActions */ "./src/react-navigation-core/NavigationActions.js").default;
  },
  get PlatformHelpers() {
    return __webpack_require__(/*! ./PlatformHelpers */ "./src/react-navigation-core/PlatformHelpers.js");
  },

  get getScreenForRouteName() {
    return __webpack_require__(/*! ./getScreenForRouteName */ "./src/react-navigation-core/getScreenForRouteName.js").default;
  }
};

/***/ }),

/***/ "./src/react-navigation-core/invariant.js":
/*!************************************************!*\
  !*** ./src/react-navigation-core/invariant.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (true) {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;

/***/ }),

/***/ "./src/react-navigation-core/validateRouteConfigMap.js":
/*!*************************************************************!*\
  !*** ./src/react-navigation-core/validateRouteConfigMap.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/core-js/object/keys */ "babel-runtime/core-js/object/keys");
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./invariant */ "./src/react-navigation-core/invariant.js");
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_invariant__WEBPACK_IMPORTED_MODULE_1__);



/**
 * Make sure the config passed e.g. to StackRouter, TabRouter has
 * the correct format, and throw a clear error if it doesn't.
 */
function validateRouteConfigMap(routeConfigs) {
  var routeNames = babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_0___default()(routeConfigs);
  _invariant__WEBPACK_IMPORTED_MODULE_1___default()(routeNames.length > 0, 'Please specify at least one route when configuring a navigator.');

  routeNames.forEach(function (routeName) {
    var routeConfig = routeConfigs[routeName];
    var screenComponent = getScreenComponent(routeConfig);

    if (!screenComponent || typeof screenComponent !== 'function' && typeof screenComponent !== 'string' && !routeConfig.getScreen) {
      throw new Error('The component for route \'' + routeName + '\' must be a ' + 'React component. For example:\n\n' + "import MyScreen from './MyScreen';\n" + '...\n' + (routeName + ': MyScreen,\n') + '}\n\n' + 'You can also use a navigator:\n\n' + "import MyNavigator from './MyNavigator';\n" + '...\n' + (routeName + ': MyNavigator,\n') + '}');
    }

    if (routeConfig.screen && routeConfig.getScreen) {
      throw new Error('Route \'' + routeName + '\' should declare a screen or ' + 'a getScreen, not both.');
    }
  });
}

function getScreenComponent(routeConfig) {
  if (!routeConfig) {
    return null;
  }

  return routeConfig.screen ? routeConfig.screen : routeConfig;
}

/* harmony default export */ __webpack_exports__["default"] = (validateRouteConfigMap);

/***/ }),

/***/ "./src/react-navigation-core/validateScreenOptions.js":
/*!************************************************************!*\
  !*** ./src/react-navigation-core/validateScreenOptions.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/toConsumableArray */ "babel-runtime/helpers/toConsumableArray");
/* harmony import */ var babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/helpers/typeof */ "babel-runtime/helpers/typeof");
/* harmony import */ var babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! babel-runtime/core-js/object/keys */ "babel-runtime/core-js/object/keys");
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2__);



var deprecatedKeys = ['tabBar'];

/**
 * Make sure screen options returned by the `getScreenOption`
 * are valid
 */
/* harmony default export */ __webpack_exports__["default"] = (function (screenOptions, route) {
  var keys = babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2___default()(screenOptions);

  var deprecatedKey = keys.find(function (key) {
    return deprecatedKeys.includes(key);
  });

  if (typeof screenOptions.title === 'function') {
    throw new Error(['`title` cannot be defined as a function in navigation options for `' + route.routeName + '` screen. \n', 'Try replacing the following:', '{', '    title: ({ state }) => state...', '}', '', 'with:', '({ navigation }) => ({', '    title: navigation.state...', '})'].join('\n'));
  }

  if (deprecatedKey && typeof screenOptions[deprecatedKey] === 'function') {
    throw new Error(['`' + deprecatedKey + '` cannot be defined as a function in navigation options for `' + route.routeName + '` screen. \n', 'Try replacing the following:', '{', '    ' + deprecatedKey + ': ({ state }) => ({', '         key: state...', '    })', '}', '', 'with:', '({ navigation }) => ({', '    ' + deprecatedKey + 'Key: navigation.state...', '})'].join('\n'));
  }

  if (deprecatedKey && babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default()(screenOptions[deprecatedKey]) === 'object') {
    throw new Error(['Invalid key `' + deprecatedKey + '` defined in navigation options for `' + route.routeName + '` screen.', '\n', 'Try replacing the following navigation options:', '{', '    ' + deprecatedKey + ': {'].concat(babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2___default()(screenOptions[deprecatedKey]).map(function (key) {
      return '        ' + key + ': ...,';
    })), ['    },', '}', '\n', 'with:', '{'], babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2___default()(screenOptions[deprecatedKey]).map(function (key) {
      return '    ' + (deprecatedKey + key[0].toUpperCase() + key.slice(1)) + ': ...,';
    })), ['}']).join('\n'));
  }
});

/***/ }),

/***/ "./src/react-navigation-core/withNavigation.js":
/*!*****************************************************!*\
  !*** ./src/react-navigation-core/withNavigation.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return withNavigation; });
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "babel-runtime/helpers/extends");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/core-js/object/get-prototype-of */ "babel-runtime/core-js/object/get-prototype-of");
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ "babel-runtime/helpers/classCallCheck");
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! babel-runtime/helpers/createClass */ "babel-runtime/helpers/createClass");
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! babel-runtime/helpers/possibleConstructorReturn */ "babel-runtime/helpers/possibleConstructorReturn");
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! babel-runtime/helpers/inherits */ "babel-runtime/helpers/inherits");
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! hoist-non-react-statics */ "hoist-non-react-statics");
/* harmony import */ var hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./invariant */ "./src/react-navigation-core/invariant.js");
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_invariant__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _NavigationContext__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./NavigationContext */ "./src/react-navigation-core/NavigationContext.js");






var _jsxFileName = '/Users/ericvicenti/navigation/navigation/universal/src/react-navigation-core/withNavigation.js';





function withNavigation(Component) {
  var ComponentWithNavigation = function (_React$Component) {
    babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5___default()(ComponentWithNavigation, _React$Component);

    function ComponentWithNavigation() {
      babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2___default()(this, ComponentWithNavigation);

      return babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default()(this, (ComponentWithNavigation.__proto__ || babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_1___default()(ComponentWithNavigation)).apply(this, arguments));
    }

    babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3___default()(ComponentWithNavigation, [{
      key: 'render',
      value: function render() {
        var _this2 = this;

        var navigationProp = this.props.navigation;
        return react__WEBPACK_IMPORTED_MODULE_6___default.a.createElement(
          _NavigationContext__WEBPACK_IMPORTED_MODULE_9__["NavigationConsumer"],
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 14
            }
          },
          function (navigationContext) {
            var navigation = navigationProp || navigationContext;
            _invariant__WEBPACK_IMPORTED_MODULE_8___default()(!!navigation, 'withNavigation can only be used on a view hierarchy of a navigator. The wrapped component is unable to get access to navigation from props or context.');
            return react__WEBPACK_IMPORTED_MODULE_6___default.a.createElement(Component, babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default()({}, _this2.props, {
              navigation: navigation,
              ref: _this2.props.onRef,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 22
              }
            }));
          }
        );
      }
    }]);

    return ComponentWithNavigation;
  }(react__WEBPACK_IMPORTED_MODULE_6___default.a.Component);

  ComponentWithNavigation.displayName = 'withNavigation(' + (Component.displayName || Component.name) + ')';


  return hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_7___default()(ComponentWithNavigation, Component);
}

/***/ }),

/***/ "./src/react-navigation-core/withNavigationFocus.js":
/*!**********************************************************!*\
  !*** ./src/react-navigation-core/withNavigationFocus.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return withNavigationFocus; });
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "babel-runtime/helpers/extends");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/core-js/object/get-prototype-of */ "babel-runtime/core-js/object/get-prototype-of");
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ "babel-runtime/helpers/classCallCheck");
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! babel-runtime/helpers/createClass */ "babel-runtime/helpers/createClass");
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! babel-runtime/helpers/possibleConstructorReturn */ "babel-runtime/helpers/possibleConstructorReturn");
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! babel-runtime/helpers/inherits */ "babel-runtime/helpers/inherits");
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! hoist-non-react-statics */ "hoist-non-react-statics");
/* harmony import */ var hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./invariant */ "./src/react-navigation-core/invariant.js");
/* harmony import */ var _invariant__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_invariant__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _withNavigation__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./withNavigation */ "./src/react-navigation-core/withNavigation.js");






var _jsxFileName = '/Users/ericvicenti/navigation/navigation/universal/src/react-navigation-core/withNavigationFocus.js';





function withNavigationFocus(Component) {
  var ComponentWithNavigationFocus = function (_React$Component) {
    babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5___default()(ComponentWithNavigationFocus, _React$Component);

    function ComponentWithNavigationFocus(props) {
      babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2___default()(this, ComponentWithNavigationFocus);

      var _this = babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default()(this, (ComponentWithNavigationFocus.__proto__ || babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_1___default()(ComponentWithNavigationFocus)).call(this, props));

      _this.state = {
        isFocused: props.navigation ? props.navigation.isFocused() : false
      };
      return _this;
    }

    babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3___default()(ComponentWithNavigationFocus, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        var navigation = this.props.navigation;

        _invariant__WEBPACK_IMPORTED_MODULE_8___default()(!!navigation, 'withNavigationFocus can only be used on a view hierarchy of a navigator. The wrapped component is unable to get access to navigation from props or context.');

        this.subscriptions = [navigation.addListener('didFocus', function () {
          return _this2.setState({ isFocused: true });
        }), navigation.addListener('willBlur', function () {
          return _this2.setState({ isFocused: false });
        })];
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this.subscriptions.forEach(function (sub) {
          return sub.remove();
        });
      }
    }, {
      key: 'render',
      value: function render() {
        return react__WEBPACK_IMPORTED_MODULE_6___default.a.createElement(Component, babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default()({}, this.props, {
          isFocused: this.state.isFocused,
          ref: this.props.onRef,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 42
          }
        }));
      }
    }]);

    return ComponentWithNavigationFocus;
  }(react__WEBPACK_IMPORTED_MODULE_6___default.a.Component);

  ComponentWithNavigationFocus.displayName = 'withNavigationFocus(' + (Component.displayName || Component.name) + ')';


  return hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_7___default()(Object(_withNavigation__WEBPACK_IMPORTED_MODULE_9__["default"])(ComponentWithNavigationFocus), Component);
}

/***/ }),

/***/ "./src/react-navigation-native-container/createAppContainer.js":
/*!*********************************************************************!*\
  !*** ./src/react-navigation-native-container/createAppContainer.js ***!
  \*********************************************************************/
/*! exports provided: _TESTING_ONLY_reset_container_count, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_TESTING_ONLY_reset_container_count", function() { return _TESTING_ONLY_reset_container_count; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createNavigationContainer; });
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "babel-runtime/helpers/extends");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/regenerator */ "babel-runtime/regenerator");
/* harmony import */ var babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var babel_runtime_core_js_json_stringify__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! babel-runtime/core-js/json/stringify */ "babel-runtime/core-js/json/stringify");
/* harmony import */ var babel_runtime_core_js_json_stringify__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_json_stringify__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! babel-runtime/helpers/asyncToGenerator */ "babel-runtime/helpers/asyncToGenerator");
/* harmony import */ var babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! babel-runtime/core-js/set */ "babel-runtime/core-js/set");
/* harmony import */ var babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! babel-runtime/core-js/object/get-prototype-of */ "babel-runtime/core-js/object/get-prototype-of");
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ "babel-runtime/helpers/classCallCheck");
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! babel-runtime/helpers/possibleConstructorReturn */ "babel-runtime/helpers/possibleConstructorReturn");
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! babel-runtime/helpers/createClass */ "babel-runtime/helpers/createClass");
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! babel-runtime/helpers/inherits */ "babel-runtime/helpers/inherits");
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! babel-runtime/core-js/object/keys */ "babel-runtime/core-js/object/keys");
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! babel-runtime/helpers/objectWithoutProperties */ "babel-runtime/helpers/objectWithoutProperties");
/* harmony import */ var babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var react_native_web_dist_exports_Linking__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! react-native-web/dist/exports/Linking */ "react-native-web/dist/exports/Linking");
/* harmony import */ var react_native_web_dist_exports_Linking__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_Linking__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var react_native_web_dist_exports_AsyncStorage__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! react-native-web/dist/exports/AsyncStorage */ "react-native-web/dist/exports/AsyncStorage");
/* harmony import */ var react_native_web_dist_exports_AsyncStorage__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_AsyncStorage__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var react_lifecycles_compat__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react-lifecycles-compat */ "react-lifecycles-compat");
/* harmony import */ var react_lifecycles_compat__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(react_lifecycles_compat__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var _react_navigation_core__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../react-navigation-core */ "./src/react-navigation-core/index.js");
/* harmony import */ var _react_navigation_core__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_core__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var _docsUrl__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./docsUrl */ "./src/react-navigation-native-container/docsUrl.js");












var _jsxFileName = '/Users/ericvicenti/navigation/navigation/universal/src/react-navigation-native-container/createAppContainer.js';









function isStateful(props) {
  return !props.navigation;
}

function validateProps(props) {
  if (isStateful(props)) {
    return;
  }

  var navigation = props.navigation,
      screenProps = props.screenProps,
      containerProps = babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_11___default()(props, ['navigation', 'screenProps']);

  var keys = babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_10___default()(containerProps);

  if (keys.length !== 0) {
    throw new Error('This navigator has both navigation and container props, so it is ' + ('unclear if it should own its own state. Remove props: "' + keys.join(', ') + '" ') + 'if the navigator should get its state from the navigation prop. If the ' + 'navigator should maintain its own state, do not pass a navigation prop.');
  }
}

// Track the number of stateful container instances. Warn if >0 and not using the
// detached prop to explicitly acknowledge the behavior. We should deprecated implicit
// stateful navigation containers in a future release and require a provider style pattern
// instead in order to eliminate confusion entirely.
var _statefulContainerCount = 0;
function _TESTING_ONLY_reset_container_count() {
  _statefulContainerCount = 0;
}

// We keep a global flag to catch errors during the state persistence hydrating scenario.
// The innermost navigator who catches the error will dispatch a new init action.
var _reactNavigationIsHydratingState = false;
// Unfortunate to use global state here, but it seems necessesary for the time
// being. There seems to be some problems with cascading componentDidCatch
// handlers. Ideally the inner non-stateful navigator catches the error and
// re-throws it, to be caught by the top-level stateful navigator.

/**
 * Create an HOC that injects the navigation and manages the navigation state
 * in case it's not passed from above.
 * This allows to use e.g. the StackNavigator and TabNavigator as root-level
 * components.
 */
function createNavigationContainer(Component) {
  var NavigationContainer = function (_React$Component) {
    babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_9___default()(NavigationContainer, _React$Component);

    babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_8___default()(NavigationContainer, null, [{
      key: 'getDerivedStateFromProps',
      value: function getDerivedStateFromProps(nextProps, prevState) {
        validateProps(nextProps);
        return null;
      }
    }]);

    function NavigationContainer(props) {
      var _this2 = this;

      babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_6___default()(this, NavigationContainer);

      var _this = babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_7___default()(this, (NavigationContainer.__proto__ || babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_5___default()(NavigationContainer)).call(this, props));

      _this.subs = null;
      _this._actionEventSubscribers = new babel_runtime_core_js_set__WEBPACK_IMPORTED_MODULE_4___default.a();

      _this._handleOpenURL = function (_ref) {
        var url = _ref.url;

        var parsedUrl = _this._urlToPathAndParams(url);
        if (parsedUrl) {
          var path = parsedUrl.path,
              params = parsedUrl.params;

          var action = Component.router.getActionForPathAndParams(path, params);
          if (action) {
            _this.dispatch(action);
          }
        }
      };

      _this._persistNavigationState = function () {
        var _ref2 = babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_3___default()( /*#__PURE__*/babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee(nav) {
          var persistenceKey;
          return babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  persistenceKey = _this.props.persistenceKey;

                  if (persistenceKey) {
                    _context.next = 3;
                    break;
                  }

                  return _context.abrupt('return');

                case 3:
                  _context.next = 5;
                  return react_native_web_dist_exports_AsyncStorage__WEBPACK_IMPORTED_MODULE_14___default.a.setItem(persistenceKey, babel_runtime_core_js_json_stringify__WEBPACK_IMPORTED_MODULE_2___default()(nav));

                case 5:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this2);
        }));

        return function (_x) {
          return _ref2.apply(this, arguments);
        };
      }();

      _this.dispatch = function (action) {
        if (_this.props.navigation) {
          return _this.props.navigation.dispatch(action);
        }
        _this._nav = _this._nav || _this.state.nav;
        var oldNav = _this._nav;
        Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_16__["invariant"])(oldNav, 'should be set in constructor if stateful');
        var nav = Component.router.getStateForAction(action, oldNav);
        var dispatchActionEvents = function dispatchActionEvents() {
          _this._actionEventSubscribers.forEach(function (subscriber) {
            return subscriber({
              type: 'action',
              action: action,
              state: nav,
              lastState: oldNav
            });
          });
        };
        if (nav && nav !== oldNav) {
          // Cache updates to state.nav during the tick to ensure that subsequent calls will not discard this change
          _this._nav = nav;
          _this.setState({ nav: nav }, function () {
            _this._onNavigationStateChange(oldNav, nav, action);
            dispatchActionEvents();
            _this._persistNavigationState(nav);
          });
          return true;
        } else {
          dispatchActionEvents();
        }
        return false;
      };

      validateProps(props);

      _this._initialAction = _react_navigation_core__WEBPACK_IMPORTED_MODULE_16__["NavigationActions"].init();

      if (_this._isStateful()) {
        _this.subs = _react_navigation_core__WEBPACK_IMPORTED_MODULE_16__["PlatformHelpers"].BackHandler.addEventListener('hardwareBackPress', function () {
          if (!_this._isMounted) {
            _this.subs && _this.subs.remove();
          } else {
            // dispatch returns true if the action results in a state change,
            // and false otherwise. This maps well to what BackHandler expects
            // from a callback -- true if handled, false if not handled
            return _this.dispatch(_react_navigation_core__WEBPACK_IMPORTED_MODULE_16__["NavigationActions"].back());
          }
        });
      }

      _this.state = {
        nav: _this._isStateful() && !props.persistenceKey ? Component.router.getStateForAction(_this._initialAction) : null
      };
      return _this;
    }

    babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_8___default()(NavigationContainer, [{
      key: '_renderLoading',
      value: function _renderLoading() {
        return this.props.renderLoadingExperimental ? this.props.renderLoadingExperimental() : null;
      }
    }, {
      key: '_isStateful',
      value: function _isStateful() {
        return isStateful(this.props);
      }
    }, {
      key: '_validateProps',
      value: function _validateProps(props) {
        if (this._isStateful()) {
          return;
        }

        var navigation = props.navigation,
            screenProps = props.screenProps,
            containerProps = babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_11___default()(props, ['navigation', 'screenProps']);

        var keys = babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_10___default()(containerProps);

        if (keys.length !== 0) {
          throw new Error('This navigator has both navigation and container props, so it is ' + ('unclear if it should own its own state. Remove props: "' + keys.join(', ') + '" ') + 'if the navigator should get its state from the navigation prop. If the ' + 'navigator should maintain its own state, do not pass a navigation prop.');
        }
      }
    }, {
      key: '_urlToPathAndParams',
      value: function _urlToPathAndParams(url) {
        var params = {};
        var delimiter = this.props.uriPrefix || '://';
        var path = url.split(delimiter)[1];
        if (typeof path === 'undefined') {
          path = url;
        } else if (path === '') {
          path = '/';
        }
        return {
          path: path,
          params: params
        };
      }
    }, {
      key: '_onNavigationStateChange',
      value: function _onNavigationStateChange(prevNav, nav, action) {
        if (typeof this.props.onNavigationStateChange === 'undefined' && this._isStateful()) {
          /* eslint-disable no-console */
          if (console.group) {
            console.group('Navigation Dispatch: ');
            console.log('Action: ', action);
            console.log('New State: ', nav);
            console.log('Last State: ', prevNav);
            console.groupEnd();
          } else {
            console.log('Navigation Dispatch: ', {
              action: action,
              newState: nav,
              lastState: prevNav
            });
          }
          /* eslint-enable no-console */
          return;
        }

        if (typeof this.props.onNavigationStateChange === 'function') {
          this.props.onNavigationStateChange(prevNav, nav, action);
        }
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate() {
        // Clear cached _nav every tick
        if (this._nav === this.state.nav) {
          this._nav = null;
        }
      }
    }, {
      key: 'componentDidMount',
      value: function () {
        var _ref3 = babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_3___default()( /*#__PURE__*/babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee2() {
          var _this3 = this;

          var persistenceKey, startupStateJSON, startupState, action, url, parsedUrl, path, params, urlAction;
          return babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  this._isMounted = true;

                  if (this._isStateful()) {
                    _context2.next = 3;
                    break;
                  }

                  return _context2.abrupt('return');

                case 3:

                  if ("development" === 'development' && !this.props.detached) {
                    if (_statefulContainerCount > 0) {
                      console.error('You should only render one navigator explicitly in your app, and other navigators should by rendered by including them in that navigator. Full details at: ' + Object(_docsUrl__WEBPACK_IMPORTED_MODULE_17__["default"])('common-mistakes.html#explicitly-rendering-more-than-one-navigator'));
                    }
                  }
                  _statefulContainerCount++;
                  react_native_web_dist_exports_Linking__WEBPACK_IMPORTED_MODULE_13___default.a.addEventListener('url', this._handleOpenURL);

                  persistenceKey = this.props.persistenceKey;
                  _context2.t0 = persistenceKey;

                  if (!_context2.t0) {
                    _context2.next = 12;
                    break;
                  }

                  _context2.next = 11;
                  return react_native_web_dist_exports_AsyncStorage__WEBPACK_IMPORTED_MODULE_14___default.a.getItem(persistenceKey);

                case 11:
                  _context2.t0 = _context2.sent;

                case 12:
                  startupStateJSON = _context2.t0;
                  startupState = this.state.nav;

                  if (startupStateJSON) {
                    try {
                      startupState = JSON.parse(startupStateJSON);
                      _reactNavigationIsHydratingState = true;
                    } catch (e) {}
                  }

                  action = this._initialAction;

                  if (!startupState) {
                    !!Object({"NODE_ENV":"development","PORT":"3000","VERBOSE":false,"HOST":"localhost","RAZZLE_ASSETS_MANIFEST":"/Users/ericvicenti/navigation/navigation/universal/build/assets.json","BUILD_TARGET":"server","PUBLIC_PATH":"/","RAZZLE_PUBLIC_DIR":"/Users/ericvicenti/navigation/navigation/universal/public"}).REACT_NAV_LOGGING && console.log('Init new Navigation State');
                    startupState = Component.router.getStateForAction(action);
                  }

                  _context2.next = 19;
                  return react_native_web_dist_exports_Linking__WEBPACK_IMPORTED_MODULE_13___default.a.getInitialURL();

                case 19:
                  url = _context2.sent;
                  parsedUrl = url && this._urlToPathAndParams(url);

                  if (parsedUrl) {
                    path = parsedUrl.path, params = parsedUrl.params;
                    urlAction = Component.router.getActionForPathAndParams(path, params);

                    if (urlAction) {
                      !!Object({"NODE_ENV":"development","PORT":"3000","VERBOSE":false,"HOST":"localhost","RAZZLE_ASSETS_MANIFEST":"/Users/ericvicenti/navigation/navigation/universal/build/assets.json","BUILD_TARGET":"server","PUBLIC_PATH":"/","RAZZLE_PUBLIC_DIR":"/Users/ericvicenti/navigation/navigation/universal/public"}).REACT_NAV_LOGGING && console.log('Applying Navigation Action for Initial URL:', url);
                      action = urlAction;
                      startupState = Component.router.getStateForAction(urlAction, startupState);
                    }
                  }

                  if (!(startupState === this.state.nav)) {
                    _context2.next = 24;
                    break;
                  }

                  return _context2.abrupt('return');

                case 24:
                  this.setState({ nav: startupState }, function () {
                    _reactNavigationIsHydratingState = false;
                    _this3._actionEventSubscribers.forEach(function (subscriber) {
                      return subscriber({
                        type: 'action',
                        action: action,
                        state: _this3.state.nav,
                        lastState: null
                      });
                    });
                  });

                case 25:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function componentDidMount() {
          return _ref3.apply(this, arguments);
        }

        return componentDidMount;
      }()
    }, {
      key: 'componentDidCatch',
      value: function componentDidCatch(e, errorInfo) {
        if (_reactNavigationIsHydratingState) {
          _reactNavigationIsHydratingState = false;
          console.warn('Uncaught exception while starting app from persisted navigation state! Trying to render again with a fresh navigation state..');
          this.dispatch(_react_navigation_core__WEBPACK_IMPORTED_MODULE_16__["NavigationActions"].init());
        }
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this._isMounted = false;
        react_native_web_dist_exports_Linking__WEBPACK_IMPORTED_MODULE_13___default.a.removeEventListener('url', this._handleOpenURL);
        this.subs && this.subs.remove();

        if (this._isStateful()) {
          _statefulContainerCount--;
        }
      }

      // Per-tick temporary storage for state.nav

    }, {
      key: 'render',
      value: function render() {
        var _this4 = this;

        var navigation = this.props.navigation;
        if (this._isStateful()) {
          var nav = this.state.nav;
          if (!nav) {
            return this._renderLoading();
          }
          if (!this._navigation || this._navigation.state !== nav) {
            this._navigation = {
              dispatch: this.dispatch,
              state: nav,
              addListener: function addListener(eventName, handler) {
                if (eventName !== 'action') {
                  return { remove: function remove() {} };
                }
                _this4._actionEventSubscribers.add(handler);
                return {
                  remove: function remove() {
                    _this4._actionEventSubscribers.delete(handler);
                  }
                };
              }
            };
          }
          navigation = this._navigation;
        }
        Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_16__["invariant"])(navigation, 'failed to get navigation');
        return react__WEBPACK_IMPORTED_MODULE_12___default.a.createElement(Component, babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default()({}, this.props, { navigation: navigation, __source: {
            fileName: _jsxFileName,
            lineNumber: 357
          }
        }));
      }
    }]);

    return NavigationContainer;
  }(react__WEBPACK_IMPORTED_MODULE_12___default.a.Component);

  NavigationContainer.router = Component.router;
  NavigationContainer.navigationOptions = null;


  return Object(react_lifecycles_compat__WEBPACK_IMPORTED_MODULE_15__["polyfill"])(NavigationContainer);
}

/***/ }),

/***/ "./src/react-navigation-native-container/docsUrl.js":
/*!**********************************************************!*\
  !*** ./src/react-navigation-native-container/docsUrl.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return docsUrl; });
function docsUrl(path) {
  return "https://v2.reactnavigation.org/docs/" + path;
}

/***/ }),

/***/ "./src/react-navigation-native-container/index.js":
/*!********************************************************!*\
  !*** ./src/react-navigation-native-container/index.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  get createAppContainer() {
    return __webpack_require__(/*! ./createAppContainer */ "./src/react-navigation-native-container/createAppContainer.js").default;
  }
};

/***/ }),

/***/ "./src/react-navigation-stack-actions/StackActions.js":
/*!************************************************************!*\
  !*** ./src/react-navigation-stack-actions/StackActions.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/core-js/object/assign */ "babel-runtime/core-js/object/assign");
/* harmony import */ var babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0__);

var POP = 'Navigation/POP';
var POP_TO_TOP = 'Navigation/POP_TO_TOP';
var PUSH = 'Navigation/PUSH';
var RESET = 'Navigation/RESET';
var REPLACE = 'Navigation/REPLACE';
var COMPLETE_TRANSITION = 'Navigation/COMPLETE_TRANSITION';

var pop = function pop(payload) {
  return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0___default()({
    type: POP
  }, payload);
};

var popToTop = function popToTop(payload) {
  return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0___default()({
    type: POP_TO_TOP
  }, payload);
};

var push = function push(payload) {
  return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0___default()({
    type: PUSH
  }, payload);
};

var reset = function reset(payload) {
  return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0___default()({
    type: RESET
  }, payload);
};

var replace = function replace(payload) {
  return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0___default()({
    type: REPLACE
  }, payload);
};

var completeTransition = function completeTransition(payload) {
  return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_0___default()({
    type: COMPLETE_TRANSITION
  }, payload);
};

/* harmony default export */ __webpack_exports__["default"] = ({
  POP: POP,
  POP_TO_TOP: POP_TO_TOP,
  PUSH: PUSH,
  RESET: RESET,
  REPLACE: REPLACE,
  COMPLETE_TRANSITION: COMPLETE_TRANSITION,

  pop: pop,
  popToTop: popToTop,
  push: push,
  reset: reset,
  replace: replace,
  completeTransition: completeTransition
});

/***/ }),

/***/ "./src/react-navigation-stack-actions/index.js":
/*!*****************************************************!*\
  !*** ./src/react-navigation-stack-actions/index.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  get StackActions() {
    return __webpack_require__(/*! ./StackActions */ "./src/react-navigation-stack-actions/StackActions.js").default;
  }
};

/***/ }),

/***/ "./src/react-navigation-switch-navigator/SwitchView.js":
/*!*************************************************************!*\
  !*** ./src/react-navigation-switch-navigator/SwitchView.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/core-js/object/get-prototype-of */ "babel-runtime/core-js/object/get-prototype-of");
/* harmony import */ var babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/helpers/classCallCheck */ "babel-runtime/helpers/classCallCheck");
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! babel-runtime/helpers/createClass */ "babel-runtime/helpers/createClass");
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! babel-runtime/helpers/possibleConstructorReturn */ "babel-runtime/helpers/possibleConstructorReturn");
/* harmony import */ var babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! babel-runtime/helpers/inherits */ "babel-runtime/helpers/inherits");
/* harmony import */ var babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _react_navigation_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../react-navigation-core */ "./src/react-navigation-core/index.js");
/* harmony import */ var _react_navigation_core__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_core__WEBPACK_IMPORTED_MODULE_6__);





var _jsxFileName = '/Users/ericvicenti/navigation/navigation/universal/src/react-navigation-switch-navigator/SwitchView.js';



var SwitchView = function (_React$Component) {
  babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default()(SwitchView, _React$Component);

  function SwitchView() {
    babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, SwitchView);

    return babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3___default()(this, (SwitchView.__proto__ || babel_runtime_core_js_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_0___default()(SwitchView)).apply(this, arguments));
  }

  babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(SwitchView, [{
    key: 'render',
    value: function render() {
      var state = this.props.navigation.state;

      var activeKey = state.routes[state.index].key;
      var descriptor = this.props.descriptors[activeKey];
      var ChildComponent = descriptor.getComponent();

      return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(_react_navigation_core__WEBPACK_IMPORTED_MODULE_6__["SceneView"], {
        component: ChildComponent,
        navigation: descriptor.navigation,
        screenProps: this.props.screenProps,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 12
        }
      });
    }
  }]);

  return SwitchView;
}(react__WEBPACK_IMPORTED_MODULE_5___default.a.Component);

/* harmony default export */ __webpack_exports__["default"] = (SwitchView);

/***/ }),

/***/ "./src/react-navigation-switch-navigator/createSwitchNavigator.js":
/*!************************************************************************!*\
  !*** ./src/react-navigation-switch-navigator/createSwitchNavigator.js ***!
  \************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _react_navigation_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../react-navigation-core */ "./src/react-navigation-core/index.js");
/* harmony import */ var _react_navigation_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _react_navigation_switch_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../react-navigation-switch-router */ "./src/react-navigation-switch-router/index.js");
/* harmony import */ var _react_navigation_switch_router__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_switch_router__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _SwitchView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SwitchView */ "./src/react-navigation-switch-navigator/SwitchView.js");





function createSwitchNavigator(routeConfigMap) {
  var switchConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var router = Object(_react_navigation_switch_router__WEBPACK_IMPORTED_MODULE_1__["SwitchRouter"])(routeConfigMap, switchConfig);
  var Navigator = Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_0__["createNavigator"])(_SwitchView__WEBPACK_IMPORTED_MODULE_2__["default"], router, switchConfig);
  return Navigator;
}

/* harmony default export */ __webpack_exports__["default"] = (createSwitchNavigator);

/***/ }),

/***/ "./src/react-navigation-switch-navigator/index.js":
/*!********************************************************!*\
  !*** ./src/react-navigation-switch-navigator/index.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  get createSwitchNavigator() {
    return __webpack_require__(/*! ./createSwitchNavigator */ "./src/react-navigation-switch-navigator/createSwitchNavigator.js").default;
  }
};

/***/ }),

/***/ "./src/react-navigation-switch-router/SwitchRouter.js":
/*!************************************************************!*\
  !*** ./src/react-navigation-switch-router/SwitchRouter.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/toConsumableArray */ "babel-runtime/helpers/toConsumableArray");
/* harmony import */ var babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babel-runtime/core-js/object/assign */ "babel-runtime/core-js/object/assign");
/* harmony import */ var babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! babel-runtime/core-js/object/keys */ "babel-runtime/core-js/object/keys");
/* harmony import */ var babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _react_navigation_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../react-navigation-core */ "./src/react-navigation-core/index.js");
/* harmony import */ var _react_navigation_core__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_core__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _react_navigation_stack_actions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../react-navigation-stack-actions */ "./src/react-navigation-stack-actions/index.js");
/* harmony import */ var _react_navigation_stack_actions__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_react_navigation_stack_actions__WEBPACK_IMPORTED_MODULE_4__);






var defaultActionCreators = function defaultActionCreators(route, navStateKey) {
  return {};
};

function childrenUpdateWithoutSwitchingIndex(actionType) {
  return [_react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["NavigationActions"].SET_PARAMS,
  // Todo: make SwitchRouter not depend on StackActions..
  _react_navigation_stack_actions__WEBPACK_IMPORTED_MODULE_4__["StackActions"].COMPLETE_TRANSITION].includes(actionType);
}

/* harmony default export */ __webpack_exports__["default"] = (function (routeConfigs) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  // Fail fast on invalid route definitions
  Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["validateRouteConfigMap"])(routeConfigs);

  var order = config.order || babel_runtime_core_js_object_keys__WEBPACK_IMPORTED_MODULE_2___default()(routeConfigs);
  var paths = config.paths || {};
  var getCustomActionCreators = config.getCustomActionCreators || defaultActionCreators;

  var initialRouteParams = config.initialRouteParams;
  var initialRouteName = config.initialRouteName || order[0];
  var backBehavior = config.backBehavior || 'none';
  var shouldBackNavigateToInitialRoute = backBehavior === 'initialRoute';
  var resetOnBlur = config.hasOwnProperty('resetOnBlur') ? config.resetOnBlur : true;
  var initialRouteIndex = order.indexOf(initialRouteName);
  var childRouters = {};
  order.forEach(function (routeName) {
    var routeConfig = routeConfigs[routeName];
    if (!paths[routeName]) {
      paths[routeName] = typeof routeConfig.path === 'string' ? routeConfig.path : routeName;
    }
    childRouters[routeName] = null;
    var screen = Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["getScreenForRouteName"])(routeConfigs, routeName);
    if (screen.router) {
      childRouters[routeName] = screen.router;
    }
  });
  if (initialRouteIndex === -1) {
    throw new Error('Invalid initialRouteName \'' + initialRouteName + '\'.' + ('Should be one of ' + order.map(function (n) {
      return '"' + n + '"';
    }).join(', ')));
  }

  function resetChildRoute(routeName) {
    var params = routeName === initialRouteName ? initialRouteParams : undefined;
    var childRouter = childRouters[routeName];
    if (childRouter) {
      var childAction = _react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["NavigationActions"].init();
      return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, childRouter.getStateForAction(childAction), {
        key: routeName,
        routeName: routeName,
        params: params
      });
    }
    return {
      key: routeName,
      routeName: routeName,
      params: params
    };
  }

  return {
    getInitialState: function getInitialState() {
      var routes = order.map(resetChildRoute);
      return {
        routes: routes,
        index: initialRouteIndex,
        isTransitioning: false
      };
    },
    getNextState: function getNextState(prevState, possibleNextState) {
      if (!prevState) {
        return possibleNextState;
      }

      var nextState = void 0;
      if (prevState.index !== possibleNextState.index && resetOnBlur) {
        var prevRouteName = prevState.routes[prevState.index].routeName;
        var nextRoutes = [].concat(babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(possibleNextState.routes));
        nextRoutes[prevState.index] = resetChildRoute(prevRouteName);

        return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, possibleNextState, {
          routes: nextRoutes
        });
      } else {
        nextState = possibleNextState;
      }

      return nextState;
    },
    getActionCreators: function getActionCreators(route, stateKey) {
      return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["getNavigationActionCreators"])(route, stateKey), getCustomActionCreators(route, stateKey));
    },
    getStateForAction: function getStateForAction(action, inputState) {
      var prevState = inputState ? babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, inputState) : inputState;
      var state = inputState || this.getInitialState();
      var activeChildIndex = state.index;

      if (action.type === _react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["NavigationActions"].INIT) {
        // NOTE(brentvatne): this seems weird... why are we merging these
        // params into child routes?
        // ---------------------------------------------------------------
        // Merge any params from the action into all the child routes
        var params = action.params;

        if (params) {
          state.routes = state.routes.map(function (route) {
            return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, route, {
              params: babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, route.params, params, route.routeName === initialRouteName ? initialRouteParams : null)
            });
          });
        }
      }

      // Let the current child handle it
      var activeChildLastState = state.routes[state.index];
      var activeChildRouter = childRouters[order[state.index]];
      if (activeChildRouter) {
        var activeChildState = activeChildRouter.getStateForAction(action, activeChildLastState);
        if (!activeChildState && inputState) {
          return null;
        }
        if (activeChildState && activeChildState !== activeChildLastState) {
          var _routes = [].concat(babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(state.routes));
          _routes[state.index] = activeChildState;
          return this.getNextState(prevState, babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, state, {
            routes: _routes
          }));
        }
      }

      // Handle tab changing. Do this after letting the current tab try to
      // handle the action, to allow inner children to change first
      var isBackEligible = action.key == null || action.key === activeChildLastState.key;
      if (action.type === _react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["NavigationActions"].BACK) {
        if (isBackEligible && shouldBackNavigateToInitialRoute) {
          activeChildIndex = initialRouteIndex;
        } else {
          return state;
        }
      }

      var didNavigate = false;
      if (action.type === _react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["NavigationActions"].NAVIGATE) {
        didNavigate = !!order.find(function (childId, i) {
          if (childId === action.routeName) {
            activeChildIndex = i;
            return true;
          }
          return false;
        });
        if (didNavigate) {
          var childState = state.routes[activeChildIndex];
          var childRouter = childRouters[action.routeName];
          var newChildState = void 0;

          if (action.action) {
            newChildState = childRouter ? childRouter.getStateForAction(action.action, childState) : null;
          } else if (!action.action && !childRouter && action.params) {
            newChildState = babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, childState, {
              params: babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, childState.params || {}, action.params)
            });
          }

          if (newChildState && newChildState !== childState) {
            var _routes2 = [].concat(babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(state.routes));
            _routes2[activeChildIndex] = newChildState;
            return this.getNextState(prevState, babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, state, {
              routes: _routes2,
              index: activeChildIndex
            }));
          } else if (!newChildState && state.index === activeChildIndex && prevState) {
            return null;
          }
        }
      }

      if (action.type === _react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["NavigationActions"].SET_PARAMS) {
        var key = action.key;
        var lastRoute = state.routes.find(function (route) {
          return route.key === key;
        });
        if (lastRoute) {
          var _params = babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, lastRoute.params, action.params);
          var _routes3 = [].concat(babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(state.routes));
          _routes3[state.routes.indexOf(lastRoute)] = babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, lastRoute, {
            params: _params
          });
          return this.getNextState(prevState, babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, state, {
            routes: _routes3
          }));
        }
      }

      if (activeChildIndex !== state.index) {
        return this.getNextState(prevState, babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, state, {
          index: activeChildIndex
        }));
      } else if (didNavigate && !inputState) {
        return state;
      } else if (didNavigate) {
        return babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, state);
      }

      // Let other children handle it and switch to the first child that returns a new state
      var index = state.index;
      var routes = state.routes;
      order.find(function (childId, i) {
        var childRouter = childRouters[childId];
        if (i === index) {
          return false;
        }
        var childState = routes[i];
        if (childRouter) {
          childState = childRouter.getStateForAction(action, childState);
        }
        if (!childState) {
          index = i;
          return true;
        }
        if (childState !== routes[i]) {
          routes = [].concat(babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(routes));
          routes[i] = childState;
          index = i;
          return true;
        }
        return false;
      });

      // Nested routers can be updated after switching children with actions such as SET_PARAMS
      // and COMPLETE_TRANSITION.
      // NOTE: This may be problematic with custom routers because we whitelist the actions
      // that can be handled by child routers without automatically changing index.
      if (childrenUpdateWithoutSwitchingIndex(action.type)) {
        index = state.index;
      }

      if (index !== state.index || routes !== state.routes) {
        return this.getNextState(prevState, babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, state, {
          index: index,
          routes: routes
        }));
      }
      return state;
    },
    getComponentForState: function getComponentForState(state) {
      var routeName = state.routes[state.index].routeName;
      Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["invariant"])(routeName, 'There is no route defined for index ' + state.index + '. Check that\n        that you passed in a navigation state with a valid tab/screen index.');
      var childRouter = childRouters[routeName];
      if (childRouter) {
        return childRouter.getComponentForState(state.routes[state.index]);
      }
      return Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["getScreenForRouteName"])(routeConfigs, routeName);
    },
    getComponentForRouteName: function getComponentForRouteName(routeName) {
      return Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["getScreenForRouteName"])(routeConfigs, routeName);
    },
    getPathAndParamsForState: function getPathAndParamsForState(state) {
      var route = state.routes[state.index];
      var routeName = order[state.index];
      var subPath = paths[routeName];
      var screen = Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["getScreenForRouteName"])(routeConfigs, routeName);
      var path = subPath;
      var params = route.params;
      if (screen && screen.router) {
        var stateRoute = route;
        // If it has a router it's a navigator.
        // If it doesn't have router it's an ordinary React component.
        var child = screen.router.getPathAndParamsForState(stateRoute);
        path = subPath ? subPath + '/' + child.path : child.path;
        params = child.params ? babel_runtime_core_js_object_assign__WEBPACK_IMPORTED_MODULE_1___default()({}, params, child.params) : params;
      }
      return {
        path: path,
        params: params
      };
    },


    /**
     * Gets an optional action, based on a relative path and query params.
     *
     * This will return null if there is no action matched
     */
    getActionForPathAndParams: function getActionForPathAndParams(path, params) {
      if (!path) {
        return _react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["NavigationActions"].navigate({
          routeName: initialRouteName,
          params: params
        });
      }
      return order.map(function (childId) {
        var parts = path.split('/');
        var pathToTest = paths[childId];
        var partsInTestPath = pathToTest.split('/').length;
        var pathPartsToTest = parts.slice(0, partsInTestPath).join('/');
        if (pathPartsToTest === pathToTest) {
          var childRouter = childRouters[childId];
          var action = _react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["NavigationActions"].navigate({
            routeName: childId
          });
          if (childRouter && childRouter.getActionForPathAndParams) {
            action.action = childRouter.getActionForPathAndParams(parts.slice(partsInTestPath).join('/'), params);
          }
          if (params) {
            action.params = params;
          }
          return action;
        }
        return null;
      }).find(function (action) {
        return !!action;
      }) || order.map(function (childId) {
        var childRouter = childRouters[childId];
        return childRouter && childRouter.getActionForPathAndParams(path, params);
      }).find(function (action) {
        return !!action;
      }) || null;
    },


    getScreenOptions: Object(_react_navigation_core__WEBPACK_IMPORTED_MODULE_3__["createConfigGetter"])(routeConfigs, config.navigationOptions)
  };
});

/***/ }),

/***/ "./src/react-navigation-switch-router/index.js":
/*!*****************************************************!*\
  !*** ./src/react-navigation-switch-router/index.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  get SwitchRouter() {
    return __webpack_require__(/*! ./SwitchRouter */ "./src/react-navigation-switch-router/SwitchRouter.js").default;
  }
};

/***/ }),

/***/ "./src/server.js":
/*!***********************!*\
  !*** ./src/server.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _App_App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App/App */ "./src/App/App.js");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_dom_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-dom/server */ "react-dom/server");
/* harmony import */ var react_dom_server__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_dom_server__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_native_web_dist_exports_AppRegistry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-native-web/dist/exports/AppRegistry */ "react-native-web/dist/exports/AppRegistry");
/* harmony import */ var react_native_web_dist_exports_AppRegistry__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_native_web_dist_exports_AppRegistry__WEBPACK_IMPORTED_MODULE_3__);







var assets = __webpack_require__(/*! ./build/assets.json */ "./build/assets.json");

var server = express__WEBPACK_IMPORTED_MODULE_1___default()();

react_native_web_dist_exports_AppRegistry__WEBPACK_IMPORTED_MODULE_3___default.a.registerComponent('App', function () {
  return _App_App__WEBPACK_IMPORTED_MODULE_0__["default"];
});

server.disable('x-powered-by').use(express__WEBPACK_IMPORTED_MODULE_1___default.a.static("/Users/ericvicenti/navigation/navigation/universal/public")).get('/*', function (req, res) {
  var _AppRegistry$getAppli = react_native_web_dist_exports_AppRegistry__WEBPACK_IMPORTED_MODULE_3___default.a.getApplication('App', {}),
      element = _AppRegistry$getAppli.element,
      getStyleElement = _AppRegistry$getAppli.getStyleElement;

  var html = react_dom_server__WEBPACK_IMPORTED_MODULE_2___default.a.renderToString(element);
  var css = react_dom_server__WEBPACK_IMPORTED_MODULE_2___default.a.renderToStaticMarkup(getStyleElement());

  res.send('<!doctype html>\n    <html lang="">\n    <head>\n        <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n        <meta charSet=\'utf-8\' />\n        <title>This env finally works!</title>\n        <meta name="viewport" content="width=device-width, initial-scale=1">\n        <style id="root-stylesheet">\n        html, body, #root {\n          width: 100%;\n          height: 100%;\n          display: flex;\n          flex-direction: column;\n        }\n        </style>\n        ' + css + '\n        ' + ( false ? undefined : '<script src="' + assets.client.js + '" defer crossorigin></script>') + '\n    </head>\n    <body>\n        <div id="root">' + html + '</div>\n    </body>\n</html>');
});

/* harmony default export */ __webpack_exports__["default"] = (server);

/***/ }),

/***/ 0:
/*!****************************************!*\
  !*** multi webpack/hot/poll?300 ./src ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! webpack/hot/poll?300 */"./node_modules/webpack/hot/poll.js?300");
module.exports = __webpack_require__(/*! /Users/ericvicenti/navigation/navigation/universal/src */"./src/index.js");


/***/ }),

/***/ "babel-runtime/core-js/json/stringify":
/*!*******************************************************!*\
  !*** external "babel-runtime/core-js/json/stringify" ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/json/stringify");

/***/ }),

/***/ "babel-runtime/core-js/object/assign":
/*!******************************************************!*\
  !*** external "babel-runtime/core-js/object/assign" ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/object/assign");

/***/ }),

/***/ "babel-runtime/core-js/object/get-prototype-of":
/*!****************************************************************!*\
  !*** external "babel-runtime/core-js/object/get-prototype-of" ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/object/get-prototype-of");

/***/ }),

/***/ "babel-runtime/core-js/object/keys":
/*!****************************************************!*\
  !*** external "babel-runtime/core-js/object/keys" ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/object/keys");

/***/ }),

/***/ "babel-runtime/core-js/object/values":
/*!******************************************************!*\
  !*** external "babel-runtime/core-js/object/values" ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/object/values");

/***/ }),

/***/ "babel-runtime/core-js/set":
/*!********************************************!*\
  !*** external "babel-runtime/core-js/set" ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/set");

/***/ }),

/***/ "babel-runtime/helpers/asyncToGenerator":
/*!*********************************************************!*\
  !*** external "babel-runtime/helpers/asyncToGenerator" ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/asyncToGenerator");

/***/ }),

/***/ "babel-runtime/helpers/classCallCheck":
/*!*******************************************************!*\
  !*** external "babel-runtime/helpers/classCallCheck" ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/classCallCheck");

/***/ }),

/***/ "babel-runtime/helpers/createClass":
/*!****************************************************!*\
  !*** external "babel-runtime/helpers/createClass" ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/createClass");

/***/ }),

/***/ "babel-runtime/helpers/extends":
/*!************************************************!*\
  !*** external "babel-runtime/helpers/extends" ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/extends");

/***/ }),

/***/ "babel-runtime/helpers/inherits":
/*!*************************************************!*\
  !*** external "babel-runtime/helpers/inherits" ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/inherits");

/***/ }),

/***/ "babel-runtime/helpers/objectWithoutProperties":
/*!****************************************************************!*\
  !*** external "babel-runtime/helpers/objectWithoutProperties" ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/objectWithoutProperties");

/***/ }),

/***/ "babel-runtime/helpers/possibleConstructorReturn":
/*!******************************************************************!*\
  !*** external "babel-runtime/helpers/possibleConstructorReturn" ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/possibleConstructorReturn");

/***/ }),

/***/ "babel-runtime/helpers/toConsumableArray":
/*!**********************************************************!*\
  !*** external "babel-runtime/helpers/toConsumableArray" ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/toConsumableArray");

/***/ }),

/***/ "babel-runtime/helpers/typeof":
/*!***********************************************!*\
  !*** external "babel-runtime/helpers/typeof" ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/typeof");

/***/ }),

/***/ "babel-runtime/regenerator":
/*!********************************************!*\
  !*** external "babel-runtime/regenerator" ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/regenerator");

/***/ }),

/***/ "create-react-context":
/*!***************************************!*\
  !*** external "create-react-context" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("create-react-context");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "hoist-non-react-statics":
/*!******************************************!*\
  !*** external "hoist-non-react-statics" ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("hoist-non-react-statics");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),

/***/ "react-dom/server":
/*!***********************************!*\
  !*** external "react-dom/server" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-dom/server");

/***/ }),

/***/ "react-lifecycles-compat":
/*!******************************************!*\
  !*** external "react-lifecycles-compat" ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-lifecycles-compat");

/***/ }),

/***/ "react-native-web/dist/exports/AppRegistry":
/*!************************************************************!*\
  !*** external "react-native-web/dist/exports/AppRegistry" ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-native-web/dist/exports/AppRegistry");

/***/ }),

/***/ "react-native-web/dist/exports/AsyncStorage":
/*!*************************************************************!*\
  !*** external "react-native-web/dist/exports/AsyncStorage" ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-native-web/dist/exports/AsyncStorage");

/***/ }),

/***/ "react-native-web/dist/exports/BackHandler":
/*!************************************************************!*\
  !*** external "react-native-web/dist/exports/BackHandler" ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-native-web/dist/exports/BackHandler");

/***/ }),

/***/ "react-native-web/dist/exports/Button":
/*!*******************************************************!*\
  !*** external "react-native-web/dist/exports/Button" ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-native-web/dist/exports/Button");

/***/ }),

/***/ "react-native-web/dist/exports/Linking":
/*!********************************************************!*\
  !*** external "react-native-web/dist/exports/Linking" ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-native-web/dist/exports/Linking");

/***/ }),

/***/ "react-native-web/dist/exports/StyleSheet":
/*!***********************************************************!*\
  !*** external "react-native-web/dist/exports/StyleSheet" ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-native-web/dist/exports/StyleSheet");

/***/ }),

/***/ "react-native-web/dist/exports/Text":
/*!*****************************************************!*\
  !*** external "react-native-web/dist/exports/Text" ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-native-web/dist/exports/Text");

/***/ }),

/***/ "react-native-web/dist/exports/View":
/*!*****************************************************!*\
  !*** external "react-native-web/dist/exports/View" ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-native-web/dist/exports/View");

/***/ }),

/***/ "react-native-web/dist/index":
/*!**********************************************!*\
  !*** external "react-native-web/dist/index" ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-native-web/dist/index");

/***/ })

/******/ });
//# sourceMappingURL=server.js.map