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
	
	const TYPE_NEW_NODE = 0;
	const TYPE_NEW_LINK = 1;
	const TYPE_MOVE_NODE = 2;
	const TYPE_MOVE_LINK = 3;

	const RENDER_LISTENERS = [];
	
	RENDER_LISTENERS[TYPE_NEW_NODE]  = function(node, queueMap, container, elements){
		var id = node.id
		  , elem = elements[id] = document.createElement('div');
		elem.className = 'node';
		queueMap[TYPE_MOVE_NODE].insert(node.id, node);
		container.appendChild(elem);
	];
	
	RENDER_LISTENERS[TYPE_NEW_LINK]  = function(link, queueMap, container, elements){
		var id = link.id
		  , elem = elements[id] = document.createElement('div');
		elem.className = 'link';
		queueMap[TYPE_MOVE_LINK].insert(link.id, link);
	];
	
	RENDER_LISTENERS[TYPE_MOVE_NODE] = function(node, queueMap, container, elements){
		var id = node.id
		  , style = elements[id].style
		  , links = node.links
		  , link
		  , queue = queueMap[TYPE_MOVE_LINK]
		  , point = node.point;
		style.top = point[0] + 'px;
		style.left = point[1] + 'px;
		for(var i=links.length; i--;){
			link = links[i];
			queue.insert(link.id, link);
		}
	];
	
	RENDER_LISTENERS[TYPE_MOVE_NODE] = function(link, queueMap, container, elements){
		var id = link
		  , style = elements[id].style
		  , p1 = link.src.point
		  , p2 = link.dst.point
		  , dx = p2[0] - p1[0]
		  , dy = p2[1] - p1[1]
		  , deg = Math.atan2(dy, dx) * toDeg
		  , len = Math.sqtr((dx*dx)+(dy*dy));
		style.width = len.toFixed(1) + 'px';
		style.transform = 'rodate('+deg+'deg)';
	];
	
	
	const render = this.render;
	const Queue = this.Queue;
	const RENDER_QUEUE = 0;
	const RENDER_ID = 1;
	const RENDER_WRITER = 2;
	const RENDER_ELEMENTS = 3;
	const RENDER_CONTAINER = 4;
	
	function fetch(){
		var queueMap = this[RENDER_QUEUE];
		  , newQueueMapa = this[RENDER_QUEUE] = [];
		newQueueMapa[TYPE_NEW_NODE]  = new Queue();
		newQueueMapa[TYPE_NEW_LINK]  = new Queue();
		newQueueMapa[TYPE_MOVE_NODE] = new Queue();
		newQueueMapa[TYPE_MOVE_LINK] = new Queue();
		return queueMap;
	}
	
	function graphRender(){
		var queueMap = fetch.call(this)
		  , queue
		  , listener
		  , item
		  , container = this[RENDER_CONTAINER]
		  , elements  = this[RENDER_ELEMENTS];
		for(var i=0; i<4; i++){
			queue = queueMap[i];
			listener = RENDER_LISTENERS[i];
			while(item = queue.shift()) listener.call(this, item, queueMap, container, elements);
		}
	}
	
	var LAST_ID = 1;
	
	class Render extends Array {
		
		constructor(){
			var self = this;
			fetch.call(this);
			this[RENDER_ID] = LAST_ID++;
			this[RENDER_ELEMENTS] = {};
			this[RENDER_CONTAINER] = null;
			this[RENDER_WRITER] = graphRender.bind(this);
		}
		
		fire(type, item){
			this[RENDER_QUEUE][type].insert(item.id, item);
			render.write(this[RENDER_WRITER], this[RENDER_ID]);
		}
		
	}

	// #### GRAPH #####################
	
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
	
	class Node extends Array {
		
		
		
	}
	
})