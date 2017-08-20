//
// WorkerUtil provides abstractions over a Web Workers which adhere to the WorkerUtil guidelines:
// 	1. Only interact with WebWorker through Dispatcher and Pool
//
WorkerUtil = {}

// Use by the worker
WorkerUtil.Dispatcher = function() {
	this.callbacks = {}
	
	var dispatcher = this
	
	var eventListener = function(e) {
		var data = e.data,
			name = e.data.name,
			args = data.args,
			callback = dispatcher.callbacks[name]
		
		if (callback) {
			try {
				var res = callback(args, name)
				
				if (res != null && typeof res === 'object') {
					if (res.transferList instanceof Array) {
						var transferList = res.transferList
						
						res.transferList = null
						
						self.postMessage({
							name: name,
							result: res
						}, transferList)
					} else {
						self.postMessage({
							name: name,
							result: res
						})
					}
				} else {
					self.postMessage({
						name: name,
						error: "name: '" + name + "', error: " + res
					})
				}
			} catch (ex) {
				self.postMessage({
					name: name,
					error: "name: '" + name + "', error: " + ex + ', ' + args.name
				})
			}
		} else {
			self.postMessage({
				name: name,
				error: "name: '" + name + "', not found"
			})
		}
	}
	
	self.addEventListener('message', eventListener, false)
}

WorkerUtil.Dispatcher.prototype = {
	register: function(nameOrObject, callbackIfName) {
		var callbacks = this.callbacks
		
		if (typeof nameOrObject === 'string' || nameOrObject instanceof String) {
			callbacks[nameOrObject] = callbackIfName
		} else {
			for (var k in nameOrObject) {
				if (nameOrObject.hasOwnProperty(k)) {
					callbacks[k] = nameOrObject[k]
				}
			}
		}
	}
}
