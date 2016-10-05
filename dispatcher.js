//
// WorkerUtil provides abstractions over a Web Workers which adhere to the WorkerUtil guidelines:
// 	1. Only interact with WebWorker through Dispatcher and Pool
//
importScripts('workerutil.js')

// Use by the worker
WorkerUtil.Dispatcher = function() {
	this.callbacks = {}
	
	var dispatcher = this
	
	var eventListener = function(e) {
		var data = e.data,
			type = e.data.type,
			args = data.args,
			callback = dispatcher.callbacks[type]
		
		if (callback) {
			var res = callback(args, type)
			
			if (res) {
				if (res.transferList instanceof Array) {
					var transferList = res.transferList
					
					res.transferList = null
					
					self.postMessage({
						type: type,
						result: res
					}, transferList)
				} else {
					self.postMessage({
						type: type,
						result: res
					})
				}
			}
		} else {
			self.postMessage({
				type: type,
				error: 'name: ' + except.name + '\nmessage: ' + except.message
			})
		}
	}
	
	self.addEventListener('message', eventListener, false)
}

WorkerUtil.Dispatcher.prototype = {
	register: function(type, callback) {
		if (typeof type === 'string' || type instanceof String) {
			this.callbacks[type] = callback
		} else {
			for (var k in type) {
				if (type.hasOwnProperty(k)) {
					this.callbacks[k] = type[k]
				}
			}
		}
	}
}
