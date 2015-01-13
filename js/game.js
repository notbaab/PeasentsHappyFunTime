$(window).load(function() {
	this.game = new Game();
	game.init();
	game.play();
});

var settings = {
	// I'm a settings driven game design guy
	gameCanvasId: 'gamecanvas',
	mouseCanvasId: 'mousecanvas'
};


function Game() {
	this.loader = new Loader('#loadingscreen')
	this.mouse = new Mouse();
	// this.menu = new Menu();s
	// The map is broken into square tiles of this size (20 pixels x 20 pixels)
	this.gridSize = 20;
	// Store whether or not the background moved and needs to be redrawn
	this.refreshBackground = true;
	// A control loop that runs at a fixed period of time 
	this.animationTimeout = 100; // 100 milliseconds or 10 times a second
	this.offsetX = 0; // X & Y panning offsets for the map
	this.offsetY = 0;
	this.panningThreshold = 60; // Distance from edge of canvas at which panning starts
	this.panningSpeed = 10; // 
	this.gameObjects = {};
	console.log(this.mouse);
};

Game.prototype = {
	init: function() {
		this.backgroundCanvas = document.getElementById(settings.gameCanvasId);
		this.foregroundCanvas = document.getElementById(settings.mouseCanvasId);
		this.backgroundcontext = this.backgroundCanvas.getContext('2d');
		this.foregroundcontext = this.foregroundCanvas.getContext('2d');
		this.loader.init();
		this.mouse.init('#' + settings.mouseCanvasId); // 
		$('.gamelayer').hide();
		$('#gamestartscreen').show();
		this.state = 0;
		this.running = true;

		// Underscore allows you to bind this to a function forever. 
		this.drawLoop = _.bind(this.drawLoop, this);
		this.gameLoop = _.bind(this.gameLoop, this);
		this.debugShit(); // Random function I shove shit in when I'm testing stuff
	},

	gameLoop: function() {
		window.requestAnimationFrame(this.gameLoop); //.bind(this));	
		callToNestedObject(this.gameObjects, 'update', this.foregroundcontext);
		return;
	},

	drawLoop: function() {
		// fast way to clear the foreground canvas
		this.foregroundCanvas.width = this.foregroundCanvas.width;

		// draw the game objects
		callToNestedObject(this.gameObjects, 'draw', this.foregroundcontext);

		this.mouse.draw(this.foregroundcontext);
		window.requestAnimationFrame(this.drawLoop); //.bind(this));	
	},

	play: function() {
		this.gameLoop();
		this.drawLoop();
	},

	debugShit: function() {
		var entity1 = this.createEntity({hp:10}, 
			[new Damageable(), new Rect(20, 20, 20, 20), new Unit(), new Attacker()]);
		var entity2 = this.createEntity({hp:10}, [new Damageable(), new Rect(100, 100, 20, 20), new Unit()]);
		entity1.engageSpecific(entity2);
		console.log(entity1);
		console.log(entity2);
		// var unit = new Unit(20, 20, 10, 10);

		// var building = new Unit(300, 300, 200, 200);
		// building.color = "#000077";
		this.gameObjects['unit'] = [entity1];
		this.gameObjects['building'] = [entity2];
		// console.log(rect.center());
	},

	createEntity: function(properties, components) {
		var prop;
		var entity = {};

		for (prop in properties) {
			entity[prop] = properties[prop];
		}

		components.forEach(function(component) {
			for (prop in component) {
				// if (entity.hasOwnProperty(prop)) {
				// 	throw "Entity property conflict! " + prop;
				// }
				entity[prop] = component[prop];
			}
		});

		return entity;
	},

};