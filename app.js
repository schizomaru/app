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
		  , point = node.absPoint;
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
		  , p1 = link.src.absPoint
		  , p2 = link.dst.absPoint
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
	
	function fire(type, item){
		this[RENDER_QUEUE][type].insert(item.id, item);
		render.write(this[RENDER_WRITER], this[RENDER_ID]);
		return this;
	}
	
	var RENDER_LAST_ID = 1;
	
	class Render extends Array {
		
		constructor(){
			var self = this;
			fetch.call(this);
			this[RENDER_ID] = RENDER_LAST_ID++;
			this[RENDER_ELEMENTS] = {};
			this[RENDER_CONTAINER] = null;
			this[RENDER_WRITER] = graphRender.bind(this);
		}
		
		fireNewNode(item){
			return fire.call(this, TYPE_NEW_NODE, item);
		}
		
		fireNewLink(item){
			return fire.call(this, TYPE_NEW_LINK, item);
		}
		
		fireMoveNode(item){
			return fire.call(this, TYPE_MOVE_NODE, item);
		}
		
		fireMoveLink(item){
			return fire.call(this, TYPE_MOVE_LINK, item);
		}
	}

})(function(){

	
	const GRAPH_NODES = 0;
	const GRAPH_LINKS = 1;
	const GRAPH_RENDER = 2;
	
	class Graph extends Array {
		
		constructor(){
			this[GRAPH_LINKS] = {};
			this[GRAPH_NODES] = {};
			this[GRAPH_RENDER] = new Render(this);
		}
		
		get render(){
			return this[GRAPH_RENDER];
		}
		
		link(idA, idB){
			var linkID = idA + ':' + idB
			  , link = this[GRAPH_LINKS][linkID];
			if(!link){
				var src = this.get(idA)
				  , dst = this.get(idB);
				link = this[GRAPH_LINKS][linkID] = new Link(linkID, src, dst);
			}
			return link;
		}
		
		get(id){
			var node = this[GRAPH_NODES][id];
			if(!node){
				node = this[GRAPH_NODES][id] = new Node(id);
			}
			return node;
		}
		
		load(data){
			var keys = Object.keys(data)
		}
		
	}
	
	// #### LINK #######################
	
	const LINK_ID = 0;
	const LINK_DST = 1;
	const LINK_SRC = 2;
	
	class Link extends Array {
		
		constructor(id, src, dst){
			this[LINK_ID] = id;
			this[LINK_DST] = dst;
			this[LINK_SRC] = src;
			src[NODE_LINKS].push(this);
			dst[NODE_LINKS].push(this);
			src[NODE_DST].push(dst);
			dst[NODE_SRC].push(src);
		}
		
		get id (){return this[LINK_ID] ;}
		get dst(){return this[LINK_DST];}
		get src(){return this[LINK_SRC];}
		
	}
	
	const NODE_ID = 0;
	const NODE_OFF_POINT = 1;
	const NODE_REL_POINT = 2;
	const NODE_ABS_POINT = 3;
	const NODE_LINKS = 4;
	const NODE_DST = 5;
	const NODE_SRC = 6;
	const NODE_GRAPH = 7;
	
	function clear(node){
		node[NODE_OFF_POINT] = node[NODE_ABS_POINT] = null;
		clearChild(node.dst);
		node.graph.render.fire(TYPE_MOVE_NODE, node);
	}
	
	function clearChild(list){
		for(var i=list.length; i--;){
			clear(list[i]);
		}
	}
	
	class Node extends Array {
		
		constructor(id, graph){
			this[NODE_ID] = id;
			this[NODE_GRAPH] = graph;
			this[NODE_OFF_POINT] = null;
			this[NODE_ABS_POINT] = null;
			this[NODE_REL_POINT] = [0,0];
			this[NODE_DST] = [];
			this[NODE_SRC] = [];
			this[NODE_LINKS] = [];
			graph.render.fire(TYPE_NEW_NODE, this);
		}
		
		get graph(){
			return this[NODE_GRAPH];
		}
		
		get id(){
			return this[NODE_ID];
		}

		get dst(){
			return this[NODE_DST];
		}
		
		get src(){
			return this[NODE_SRC];
		}
		
		get absPoint(){
			if(!this[NODE_ABS_POINT]){
				var off = this.offPoint
				  , rel = this[NODE_REL_POINT];
				return this[NODE_ABS_POINT] = [off[0] + rel[0], off[1] + rel[1]];
			}
			return this[NODE_ABS_POINT];
		}
		
		set absPoint(abs){
			var off = this.offPoint;
			this.relPoint = [abs[0] - off[0], abs[1] - off[1]];
			this[NODE_ABS_POINT] = abs;
			clearChild(this.dst);
		}
		
		get offPoint(){
			var off = this[NODE_OFF_POINT];
			if(!off){
				off = this[NODE_OFF_POINT] = [0,0];
				var dst = this.dst
				  , abs
				  , len = dst.length;
				for(var i=len; i--;){
					abs = dst[i].absPoint;
					off[0] += abs[0];
					off[1] += abs[1];
				}
				if(len > 1){
					off[0] /= len;
					off[1] /= len;
				}
			}
			return off;
		}
		
		get relPoint(){
			return this[NODE_REL_POINT];
		}
		
		set relPoint(rel){
			this[NODE_REL_POINT] = rel;
			this[NODE_ABS_POINT] = null;
			clearChild(this.dst);
			graph.render.fire(TYPE_MOVE_NODE, this);
		}
		
	}
	
})(function(){
	
	
	
	
})