// Used by the main script

WorkerUtil.Pool = function(workerPath, size) {
	this.nextWorkerNum = 0
	this.workers = new Array(size)
	this.responseListeners = new Array(size)
	
	var pool = this
	
	for (var i = 0; i < size; ++i) {
		(function() {
			var worker = new Worker(workerPath),
				responseListener = []
			
			pool.workers[i] = worker
			pool.responseListeners[i] = responseListener
			
			worker.addEventListener('message', function(e) {
				var listener = responseListener.shift(),
					data = e.data
				
				if (data.error) {
					console.log('WorkerUtil.Pool Error: type="' + data.type + '"message="' + data.error + '"')
				} else {
					console.log('WorkerUtil.Pool Success: type="' + data.type + '"')
				}
				
				listener(data.result, data.error)
			}, false)
		})()
	}
}

WorkerUtil.Pool.prototype = {
	schedule: function(type, args, onResult) {
		var workerNum = this.nextWorkerNum,
			worker = this.workers[workerNum],
			responseListener = this.responseListeners[workerNum]
			
		this.nextWorkerNum = (workerNum + 1) % this.workers.length
		
		responseListener.push(onResult)
		
		worker.postMessage({
			type: type,
			args: args
		})
	}
}