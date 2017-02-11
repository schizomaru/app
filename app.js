const app = window.app = function app(f){
	f.call(app);
	return app;
}


app(function(){
	
	const QUEUE_INDEX = 0;
	const QUEUE_LIST  = 1;
	
	class Queue extends Array {
		
		constructor(){
			this[QUEUE_INDEX] = {};
			this[QUEUE_LIST] = [null];
		}

		insert(id, data){
			if(!this[QUEUE_INDEX][id]){
				var index = this[QUEUE_INDEX][id] = this.length;
				this[QUEUE_LIST][index] = data;
				return true;
			}
			return false;
		}
		
		update(id, data){
			var index = this[QUEUE_INDEX][id];
			if(index){
				this[QUEUE_LIST][index] = data;
				return true;
			}
			return false;
		}
		
		upsert(id, data){
			var index = this[QUEUE_INDEX][id];
			if(!index){
				index = this[QUEUE_INDEX][id] = this[QUEUE_LIST].length;
			}
			return this[QUEUE_LIST][index] = data;
		}
		
		get fetch(){
			var list = this[QUEUE_LIST];
			this[QUEUE_LIST] = [null];
			this[QUEUE_INDEX] = {};
			list.shift();
			return list;
		}
		
	}
	
	this.Queue = Queue;
	
})(function(){
	
	const Queue = this.Queue;
	const RENDER_READ  = 0;
	const RENDER_WRITE = 1;
	const queueList = [new Queue(), new Queue()];
	
	var again = 0;
	
	function flushAll(){
		var read  = queueList[RENDER_READ].fetch
		  , write = queueList[RENDER_WRITE].fetch;]
		for(var item; item = read.shift();) item();
		for(var item; item = write.shift();) item();
		if(again > 0){
			again--;
			raf(flushAll);
		} else {
			again = 0;
		}
	}
	
	function enqueue(type, func, id){
		if(id){
			queueList[type].upsert(id, func);	
		} else {
			queueList[type].push(func);
		}
		switch(again){
			case 1: again++;
			case 0: raf(flushAll);
		}
	}
	
	function read(func, id){
		enqueue(RENDER_READ, func, id);
		return this;
	}
	
	function write(func, id){
		enqueue(RENDER_WRITE, func, id);
		return this;
	}
	
	this.render = {
		read:read,
		write:write
	};
	
})(function(){
	
	
	class Render extends Array {
		
		
	}
	
	const GRAPH_NODES = 0;
	const GRAPH_LINKS = 1;
	const GRAPH_RENDER = 2;
	
	class Graph extends Array {
		
		constructor(){
			this[GRAPH_LINKS] = {};
			this[GRAPH_NODES] = {};
			this[GRAPH_RENDER] = new Render(this);
		}
		
		
		
	}
	
})