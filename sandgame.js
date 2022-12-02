Game = function () {
	/* States of matter */
	const statesOfMatter = {
		solid: {
			isGravity: false,
			isBrownian: false
		},
		powder: {
			isGravity: true,
			isBrownian: false
		},
		liquid: {
			isGravity: true,
			isBrownian: true
		},
		gas: {
			isGravity: false,
			isBrownian: true
		}
	}
	/* Elements */
	const elements = {
		sand: {
			state: statesOfMatter.powder,
			color: "#ffff99",
			heat: 0
		},
		stone: {
			state: statesOfMatter.solid,
			color: "gray",
			heat: 0
		},
		water: {
			state: statesOfMatter.liquid,
			color: "blue",
			heat: -10
		},
		lava: {
			state: statesOfMatter.liquid,
			color: "orange",
			heat: 100
		},
		fountain: {
			state: statesOfMatter.solid,
			color: "white",
			heat: 0
		},
		seed: {
			state: statesOfMatter.powder,
			color: "lightgreen",
			heat: 0
		},
		steam: {
			state: statesOfMatter.gas,
			color: "white",
			heat: 20
		},
		fire: {
			state: statesOfMatter.gas,
			color: "orangered",
			heat: 60
		},
		dirt: {
			state: statesOfMatter.powder,
			color: "brown",
			heat: 0
		},
		wood: {
			state: statesOfMatter.solid,
			color: "#663300",
			heat: 0
		},
		ash: {
			state: statesOfMatter.powder,
			color: "lightgray",
			heat: 0
		},
		charcoal: {
			state: statesOfMatter.solid,
			color: "#2F2F2F",
			heat: 0
		},
		lye: {
			state: statesOfMatter.powder,
			color: "white",
			heat: 0
		},
		oil: {
			state: statesOfMatter.liquid,
			color: "#CC9900",
			heat: 0
		},
		soap: {
			state: statesOfMatter.solid,
			color: "#ffff66",
			heat: 0
		},
		glass: {
			state: statesOfMatter.solid,
			color: "black",
			heat: 0
		},
		obsidian: {
			state: statesOfMatter.solid,
			color: "#26004d",
			heat: 0
		},
		meth: {
			state: statesOfMatter.powder,
			color: "#4dffff",
			heat: 0,
			addictiveness: 100000000000
		},
		sulfur: {
			state: statesOfMatter.powder,
			color: "yellow",
			heat: 0
		},
		gunpowder: {
			state: statesOfMatter.powder,
			color: "#5c5c5c",
			heat: 0
		},
		leaves: {
			state: statesOfMatter.solid,
			color: "green",
			heat: 0
		},
		erase: {
			state: null
		}
	}

	window["Elements"] = elements;

	const sprites = {
		1: "unknown"
	}

	/* Helper function - returns random num from given range */
	function randomNum(range) {
		return Math.floor(Math.random() * range);
	}

	/* Physics engine */
	var physicsEngine = {
		init: function () {
			setInterval(() => { this.doPhysics() }, 50);
		},
		doPhysics: function () {

			if (Menu.isOpen == false) {
				var pxs = grid.array
				for (var px of pxs) {
					px.updateAdjacents();
					// if (px.type == elements.fire) {
					// 	portalCheck.checkForPortal(px);
					// }
					this.updateHeat(px);
					if (px.type.state == statesOfMatter.gas) {
						this.doGasPhysics(px);
					} else if (px.type.state != statesOfMatter.solid) {
						if (px.y <= gameEngine.canvas_height) {
							this.doGravity(px);
						} else if (px.type.state == statesOfMatter.liquid) {
							this.doBrownian(px);
						}
					}
					this.checkRxns(px);
					if (px.isGrowing == true) {
						this.growTree(px, px.adj, px.length, true);
					}
					if (px.isBurning == true) {
						this.burn(px);
					}
				}
			}
		},
		/* GRAVITY RULES:
		- If bottom is clear, move
		- Else:
			- Randomly choose either right or left to check for move; if not, move in other dir
			- If neither clear, stay
			- If is liquid, execute brownian
		*/
		doGravity: function (px) {
			if (grid.isOpenSpace(px.adjacents.bottom)) { // TODO implement inLiquid
				px.update(px.adjacents.bottom);
			} else {
				if (randomNum() % 2 == 0) {
					this.leftFirst(px);
				} else {
					this.rightFirst(px);
				}
				if (px.type.state == statesOfMatter.liquid) {
					this.doBrownian(px);
				}
			}
		},
		leftFirst: function (px) {
			if (grid.isOpenSpace(px.adjacents.bottomLeft)
				&& grid.isOpenSpace(px.adjacents.left)) {
				px.update(px.adjacents.bottomLeft);
			} else if (grid.isOpenSpace(px.adjacents.bottomRight)
				&& grid.isOpenSpace(px.adjacents.right)) {
				px.update(px.adjacents.bottomRight);
			}
		},
		rightFirst: function (px) {
			if (grid.isOpenSpace(px.adjacents.bottomRight)
				&& grid.isOpenSpace(px.adjacents.right)) {
				px.update(px.adjacents.bottomRight);
			} else if (grid.isOpenSpace(px.adjacents.bottomLeft)
				&& grid.isOpenSpace(px.adjacents.left)) {
				px.update(px.adjacents.bottomLeft);
			}
		},
		doBrownian: function (px) {
			if (randomNum(10) % 2 == 0) {
				if (grid.isOpenSpace(px.adjacents.left)) {
					px.update(px.adjacents.left)
				}
			} else {
				if (grid.isOpenSpace(px.adjacents.right)) {
					px.update(px.adjacents.right)
				}
			}
		},
		doGasPhysics: function (px) {
			if (randomNum(10) == 2 || randomNum(10) == 8) {
				px.remove()
			} else if (grid.isOpenSpace(px.adjacents.top)) {
				px.update(px.adjacents.top)
			} else {
				if (randomNum(10) % 2 == 0) {
					if (grid.isOpenSpace(px.adjacents.right)) {
						px.update(px.adjacents.right)
					} else if (grid.isOpenSpace(px.adjacents.left)) {
						px.update(px.adjacents.left)
					}
				}
			}
		},
		updateHeat: function (px) { // TODO update heat physics 
			// if (isNaN(px.heat)) {
			// 	px.heat = px.type.heat;
			// }
			for (var key in px.adjacents) {
				let adjacent = px.adjacents[key];
				let adjPx = grid.getPx(adjacent);
				if (adjPx != -1) {
					// if (isNaN(adjPx.heat)) {
					// 	adjPx.heat = adjPx.type.heat;
					// }
					if (px.heat > 0) {
						adjPx.heat += 5 * Math.log(px.heat);
					}
				}
			}
			px.heat -= px.heat / 4;
			if (px.heat < 1) {
				px.heat = 0;
			}
		},
		checkRxns: function (px) {
			for (var key in rxns) {
				let rxn = rxns[key]
				if (rxn.r1 == px.type) {
					for (var keyAdj in px.adjacents) {
						let adjacent = grid.getPx(px.adjacents[keyAdj]);
						if (adjacent.type == rxn.r2) {
							rxn.react(px, adjacent);
							break;
						}
					}
				}
			}
			for (var key in heatRxns) {
				let rxn = heatRxns[key];
				if (rxn.r1 == px.type && px.heat >= rxn.heat) {
					if (rxn.r2 && rxn.r3) {
						for (var keyAdj in px.adjacents) {
							let adjacent = grid.getPx(px.adjacents[keyAdj]);
							if (adjacent.type == rxn.r2) {
								rxn.react(px, a1, a2);
								break;
							}
						}
					} else {
						rxn.react(px);
					}
				}
			}
		},
		growTree: function (px, adj, length, isRecursive) {
			px.isGrowing = false;
			px.length = length;
			let maxHeight = length + randomNum(3);
			let dir = px.adjacents[adj];
			if (isRecursive == false) {
				px.idx = 0;
			}
			if (px.idx <= maxHeight) {
				if (grid.isOpenSpace(dir)) {
					px.isGrowing = false;
					let newWood = new Pixel(dir[0], dir[1], elements.wood);
					newWood.isGrowing = true;
					newWood.updateAdjacents();
					for (var key in newWood.adjacents) {
						let adjacent = newWood.adjacents[key];
						if (grid.isOpenSpace(adjacent)) {
							if (randomNum(20) == 1) {
								let leaf = new Pixel(adjacent[0], adjacent[1], elements.leaves) // TODO tweak leaf generation?
								grid.array.push(leaf);
								leaf.draw();
							}
						}
					}
					newWood.adj = adj;
					newWood.length = px.length;
					newWood.idx = px.idx += 1;
					grid.array.splice(0, 0, newWood);
					newWood.draw();
				}
			}
			if (px.adj == "top") {
				px.isRecursive = false;
				if (randomNum(8) == 0) {
					this.growTree(px, "topLeft", 3, false);
				}
				if (randomNum(8) == 0) {
					this.growTree(px, "topRight", 3, false);
				}
			}
		},
		burn: function (px) {
			if (grid.isOpenSpace(px.adjacents.top)) {
				let newPx = new Pixel(px.x, px.y - grid.px_size, elements.fire, elements.fire.heat);
				grid.array.push(newPx);
				newPx.draw();
			}
			if (px.type == elements.oil) {
				if (randomNum(50) == 1) {
					px.remove();
				}
			} else if (px.type == elements.wood || px.type == elements.leaves) {
				if (randomNum(100) == 2) {
					px.isBurning = false;
					if (randomNum(10) == 1 || randomNum(10) == 3) {
						px.type = elements.charcoal;
					} else {
						px.type = elements.ash;
					}
					px.draw();
				}
			}
			for (var key in px.adjacents) {
				let adjacent = px.adjacents[key];
				let adjPx = grid.getPx(adjacent);
				if (adjPx.type == px.type && randomNum(20) == 1) {
					adjPx.isBurning = true;
				}
			}
		},
		updatePosition: function (px, dx, dy, m) {
			if (px.type.state != statesOfMatter.solid) {

				let newX = Math.floor(px.x + dx);
				let newY = Math.floor(px.y + dy);
				let destCoords = grid.changeCoords(newX, newY);
				let newCoords = [px.x, px.y];
				let pxCheck = grid.getPx(newCoords);

				while (newCoords[0] != destCoords[0] && newCoords[1] != destCoords[1]) {
					if (pxCheck != -1) {
						return;
					} 
					if (m < 0) {
						
					}
					newCoords = [newCoords[0] - pxSize, newCoords[1] - pxSize];
				}
				px.drawOver();
				// let newCoords = grid.changeCoords(Math.floor(px.x += vx), Math.floor(px.y += vy));
				px.x = newCoords[0];
				px.y = newCoords[1];

				px.draw();
				// grid.array.splice(0, 0, px);
			}
		},
		/* PORTAL CHECK RULES:
		- Assign new px curr to px position
		- Go down until curr type is obsidian
		- Loop through curr adjacents, if adjacent type is obsidian, reassign curr to adjacent
		- Store every visited position in array so frame cannot cross over itself
		- If position returns to old position, return true
		*/
		isInPortal: function (px) { // TODO finish
			let curr = grid.getPx(px.x, px.y);
			while (curr.type != elements.obsidian) {
				curr = grid.getPx(curr.x, curr.y + pxSize);
			}
			curr = grid.getPx(curr.x + pxSize, curr.y);
			let origin = grid.getPx(px.x, px.y);
			let visitedPxs = [];
			while (origin != curr) {
				for (var key in px.adjacents) {
					let adjacent = px.adjacents[key];
					curr = grid.getPx(adjacent.x, adjacent.y);
					if (px == origin) {
						return;
					} else {
						if (next.type == elements.obsidian) {
							curr = next;
							visitedPxs.push(curr);
						}
					}
				}
			}
		},
	}
	var portalTest = {
		portalCheck: function (px) {
			let isPortal = new Promise(function (resolve, reject) {
				resolve(physicsEngine.isInPortal(px));
				reject(new Error("Error"));
			})
			if (isPortal) {
				console.log("True");
			}
		},
	}
	var rxns = {
		waterAndLava: {
			r1: elements.water,
			r2: elements.lava,
			react: function (r1, r2) {
				r1.type = elements.steam;
				if (randomNum() == 1) {
					r2.type = elements.obsidian;
				} else {
					r2.type = elements.stone;
				}
				r1.draw();
				r2.draw();
			}
		},
		waterAndFire: {
			r1: elements.water,
			r2: elements.fire,
			react: function (r1, r2) {
				r2.remove();
			}
		},
		waterAndAsh: {
			r1: elements.water,
			r2: elements.ash,
			react: function (r2) {
				r2.type = elements.lye;
				r2.draw()
			}
		},
		seedAndDirt: {
			r1: elements.seed,
			r2: elements.dirt,
			react: function (r1) {
				r1.type = elements.wood;
				r1.isGrowing = true;
				r1.adj = "top";
				r1.length = 40;
				r1.idx = 0;
				r1.draw();
			}
		},
		seedAndWood: {
			r1: elements.seed,
			r2: elements.wood,
			react: function (r1) {
				r1.type = elements.wood;
				r1.isGrowing = true;
				r1.adj = "top";
				r1.length = 10;
				r1.idx = 0;
				r1.draw();
			}
		},
		woodAndFire: {
			r1: elements.wood,
			r2: elements.fire,
			react: function (r1) {
				r1.isBurning = true;
			}
		},
		oilAndFire: {
			r1: elements.oil,
			r2: elements.fire,
			react: function (r1) {
				r1.isBurning = true;
			}
		},
		oilAndLye: {
			r1: elements.oil,
			r2: elements.lye,
			react: function (r1, r2) {
				r1.remove()
				r2.type = elements.soap
				r2.draw()
			}
		},
		charcoalAndFire: {
			r1: elements.charcoal,
			r2: elements.fire,
			react: function (r1) {
				r1.isBurning = true;
			}
		},
		charcoalAndWater: {
			r1: elements.charcoal,
			r2: elements.water,
			react: function (r1) {
				r1.isBurning = false;
			}
		},
		leavesAndFire: {
			r1: elements.leaves,
			r2: elements.fire,
			react: function (r1) {
				r1.isBurning = true;
			}
		},
		gunpowderAndFire: {
			r1: elements.gunpowder,
			r2: elements.fire,
			react: function (r1) {
				// for (var key in r1.adjacents) {
				// 	let adjacent = r1.adjacents[key];
				// 	let adjPx = grid.getPx(adjacent);
				// 	adjPx.updateAdjacents();
				// 	if (randomNum(4) == 1) {
				// 		let flame = new Pixel(adjPx.x, adjPx.y, elements.fire);
				// 		grid.array.push(flame);
				// 		flame.draw();
				// 	}
				// 	for (var adjKey in adjPx.adjacents) {
				// 		let adjAdj = adjPx.adjacents[adjKey];
				// 		if (randomNum(4) == 1) {
				// 			let flame = new Pixel(adjPx.x, adjPx.y, elements.fire);
				// 		grid.array.push(flame);
				// 		flame.draw();
				// 		}
				// 	}
				// }
				r1.remove();
				let boom = new Explosion(r1.x, r1.y, 30);
			}
		}
	}

	var heatRxns = {
		sand: {
			r1: elements.sand,
			r2: null,
			r3: null,
			heat: 700,
			react: function (r1) {
				r1.type = elements.glass;
				r1.draw();
			}
		}
	}

	var Menu = {
		self: document.getElementById("menu"),
		isOpen: false,
		display: function () {
			this.isOpen = true;
			gameEngine.menuIsOpen = true;
			let ctx = gameEngine.ctx();
			let mctx = gameEngine.mctx();
			ctx.beginPath();
			ctx.rect(0, 0, 1000, 1000);
			ctx.fillStyle = "#5A6988FF";
			ctx.fill();
			ctx.closePath();
			mctx = gameEngine.mctx();
			mctx.beginPath();
			mctx.rect(0, 0, 1000, 1000);
			mctx.fillStyle = "#5A6988FF";
			mctx.fill();
			mctx.closePath();
			this.drawMenuSprites();
		},
		drawMenuSprites: function () {
			let ctx = gameEngine.ctx();
			const menuDown = new Image();
			menuDown.addEventListener('load', () => {
				ctx.beginPath();
				ctx.drawImage(menuDown, 170, -55);
				ctx.closePath();
			}, false);
			menuDown.src = "menuDown.png";

			ctx.beginPath();
			ctx.rect(5, 20, 465, 2);
			ctx.fillStyle = "#262B44FF";
			ctx.fill();

			const elementSelect = new Image();
			elementSelect.addEventListener('load', () => {
				ctx.beginPath();
				ctx.drawImage(elementSelect, 30, -95);
				ctx.closePath();
			}, false);
			elementSelect.src = "elementselect.png";

			const achievements = new Image();
			achievements.addEventListener('load', () => {
				ctx.beginPath();
				ctx.drawImage(achievements, 250, -93);
				ctx.closePath();
			}, false);
			achievements.src = "achievements.png";

			// for (var key in sprites) {

			// let sprite = sprites[key];
			const unknown1 = new Image();
			unknown1.addEventListener('load', () => {
				ctx.beginPath();
				ctx.drawImage(unknown1, 20, 30);
				ctx.closePath();
			}, false);
			unknown1.src = "sand.png"

			const unknown2 = new Image();
			unknown2.addEventListener('load', () => {
				ctx.beginPath();
				ctx.drawImage(unknown2, -10, 40);
				ctx.closePath();
			}, false);
			unknown2.src = "water.png"

			const unknown3 = new Image();
			unknown3.addEventListener('load', () => {
				ctx.beginPath();
				ctx.drawImage(unknown3, -31, 60);
				ctx.closePath();
			}, false);
			unknown3.src = "fire.png"

		},
		hide: function () {
			this.isOpen = false;
			let ctx = gameEngine.ctx();
			ctx.beginPath();
			ctx.rect(0, 0, 1000, 1000);
			ctx.fillStyle = "black";
			ctx.fill();
			ctx.closePath()
			let mctx = gameEngine.mctx();
			const menuUp = new Image();
			menuUp.addEventListener('load', () => {
				mctx.drawImage(menuUp, 170, -55);
			}, false);
			menuUp.src = "menuUp.png";
			for (var px of grid.array) {
				px.draw();
			}
		},
	}

	window["Menu"] = Menu;

	var gameEngine = {
		canvas: document.getElementById("game"),
		canvas_height: 300,
		canvas_width: 500,
		menu: document.getElementById("menu"),
		menuIsOpen: false,
		curr_elem: elements.sand,

		init: function () {
			// #5A6988FF
			this.setMenu();

			// let px3 = new Pixel(105, 295, elements.sand);
			// grid.array.push(px3);
			// px3.draw();

			this.canvas.addEventListener("mousemove", function (e) {
				grid.findxy('move', e)
			}, false);
			this.canvas.addEventListener("mousedown", function (e) {
				grid.findxy('down', e)
			}, false);
			this.canvas.addEventListener("mouseup", function (e) {
				grid.findxy('up', e)
			}, false);
			this.canvas.addEventListener("mouseout", function (e) {
				grid.findxy('out', e)
			}, false);

			physicsEngine.init();
		},
		ctx: function () {
			return this.canvas.getContext("2d");
		},
		mctx: function () {
			return this.menu.getContext("2d");
		},
		setMenu: function () {
			let mctx = gameEngine.mctx();
			const menuUp = new Image();
			menuUp.addEventListener('load', () => {
				mctx.drawImage(menuUp, 170, -55);
			}, false);
			menuUp.src = "menuUp.png";

			Menu.self.addEventListener("click", function () {
				Menu.display();
			})
		},
		togglePhysics: function () { // controls physics
			setInterval(() => { physics(grid) }, 70);
		},
		parseType: function (type) {
			this.curr_elem = type;
		}
	}

	window["Engine"] = gameEngine;
	var pxSize = 5;

	var grid = {
		array: [],
		canvas: gameEngine.canvas,
		px_size: 5,

		flag: false,
		dot_flag: false,
		prevX: 0,
		currX: 0,
		prevY: 0,
		currY: 0,

		changeCoords: function (x, y) {
			if (x, y) {
				while (x % this.px_size != 0) {
					x--;
				}
				while (y % this.px_size != 0) {
					y--;
				}
				return [x, y];
			}
		},
		isInBounds: function (x, y) {
			if (x <= canvas.width && x > 0
				&& y <= canvas.height && y > 0) return true;
			else return false;
		},
		isClear: function (x, y) {
			if (this.array.some(px => px.x === x && px.y === y)) {
				return false;
			}
			return true;
		},
		isValidMove: function (x, y) {
			if (this.isInBounds(x, y) && this.isClear(x, y)) {
				return true;
			}
			return false;
		},
		isOpenSpace: function (coords) {
			if (this.getPx([coords[0], coords[1]]) == -1) return true;
			else return false;
		},
		findxy: function (res, e) {
			if (res == 'down') {
				this.prevX = this.currX;
				this.prevY = this.currY;
				this.currX = e.clientX - gameEngine.canvas.offsetLeft;
				this.currY = e.clientY - gameEngine.canvas.offsetTop;

				this.flag = true;
				this.dot_flag = true;
				if (this.dot_flag) {
					/* For debugging cursor position */
					// var ctx = Engine.ctx()
					// ctx.beginPath();
					// ctx.rect(this.currX, this.currY, Grid.px_size, Grid.px_size);
					// ctx.fillStyle = "red";
					// ctx.fill();
					// ctx.closePath();

					let newCoords = grid.changeCoords(this.currX, this.currY);
					let x = newCoords[0];
					let y = newCoords[1];

					if (Menu.isOpen == false) {
						if (gameEngine.curr_elem == elements.erase) {
							let pxToRemove = this.getPx([x, y])
							if (pxToRemove != -1) {
								pxToRemove.remove()
							} else if (grid.isValidMove(x, y)) {
								let px = new Pixel(x, y, gameEngine.curr_elem, gameEngine.curr_elem.heat);
								px.draw();
								this.array.push(px);
								this.dot_flag = false;
							}
						}
					} else if (Menu.isOpen) { // TODO maybe move to diff section?
						if (y < 20) {
							Menu.hide();
						}
					}
				}
			}
			if (res == 'up' || res == "out") {
				this.flag = false;
			}
			if (res == 'move') {
				if (this.flag && Menu.isOpen == false) {
					this.currX = e.clientX - gameEngine.canvas.offsetLeft;
					this.currY = e.clientY - gameEngine.canvas.offsetTop;
					let newCoords = grid.changeCoords(this.currX, this.currY);
					let x = newCoords[0];
					let y = newCoords[1];

					var coords = "X coords: " + x + ", Y coords: " + y;
					document.getElementById("demo").innerHTML = coords;

					if (gameEngine.curr_elem == elements.erase) {
						let pxToRemove = this.getPx([x, y])
						pxToRemove.remove();
					} else {
						if (grid.isValidMove(x, y)) {
							let px = new Pixel(x, y, gameEngine.curr_elem, gameEngine.curr_elem.heat);
							px.draw();
							this.array.push(px);
						}
					}
				}
			}
		},
		getPx: function (coords) {
			let px = this.array.find(e => {
				if (e.x === coords[0] && e.y === coords[1]) {
					return true;
				}
			})
			if (px) return px;
			else return -1
		},
		eraseWholeCanvas: function () {
			grid.array = [];
			ctx = gameEngine.ctx();
			ctx.beginPath();
			ctx.rect(0, 0, 1000, 1000);
			ctx.fillStyle = "black";
			ctx.fill();
			ctx.closePath();
		}
	}
	window["Grid"] = grid;

	class Pixel {
		constructor(x, y, type, heat) {
			this.x = x;
			this.y = y;
			this.type = type;
			this.heat = heat;
			this.coords = [this.x, this.y];
			this.id = String(this.x) + String(this.y);
			this.adjacents;
		}
		updateAdjacents() {
			var adjacents = {
				top: [this.x, this.y - pxSize],
				bottom: [this.x, this.y + pxSize],
				left: [this.x - pxSize, this.y],
				right: [this.x + pxSize, this.y],
				topLeft: [this.x - pxSize, this.y - pxSize],
				topRight: [this.x + pxSize, this.y - pxSize],
				bottomLeft: [this.x - pxSize, this.y + pxSize],
				bottomRight: [this.x + pxSize, this.y + pxSize],
			}
			this.adjacents = adjacents;
		}
		// getAdjacentPxs() {
		// 	for (var key in adjacents) {
		// 		let adjacent = adjacents[key];

		// 	}
		// }

		update(coords) {
			let newX = coords[0];
			let newY = coords[1];
			this.drawOver();
			this.x = newX;
			this.y = newY;
			this.draw();
		}
		draw() {
			var ctx = gameEngine.ctx();
			ctx.beginPath();
			ctx.rect(this.x, this.y, grid.px_size, grid.px_size);
			ctx.fillStyle = this.type.color;
			ctx.fill();
			ctx.closePath();
		}
		/* Draws over past pos for gravity purposes and remove */
		drawOver() {
			var ctx = gameEngine.ctx();
			ctx.beginPath();
			ctx.rect(this.x, this.y, grid.px_size, grid.px_size);
			ctx.fillStyle = "black";
			ctx.fill();
			ctx.closePath();
		}
		/* Draws over and completely deletes pixel (ie. removes from Grid.array) */
		remove() {
			this.drawOver();
			let idx = grid.array.indexOf(this);
			if (idx > -1) {
				grid.array.splice(idx, 1);
			}
		}
	}

	class Explosion {
		constructor(x, y, power) {
			this.x = x;
			this.y = y;
			this.power = power;
			this.detonate();
		}
		detonate() {
			for (var px of grid.array) {
				if (px.type.state != statesOfMatter.solid) {
					let dx = px.x - this.x;
					let dy = px.y - this.y;
					let m = (dy / dx);
					let theta = Math.atan(dy / dx) * (180 / Math.PI);
					if (m == 0) {
						if (dx < 0) {
							theta = Math.PI;
						} else {
							theta = 0;
						}
					}
					if (dx == 0 && dy == 0) {
						return;
					}
					if (dx == 0 && dy < 0) {
						theta = Math.PI / 2;
					}
					let dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
					if (dist < this.power) {
						let vx = Math.cos(theta) * (this.power - dist);
						let vy = Math.sin(theta) * (this.power - dist);
						if (vy > 0) {
							physicsEngine.updatePosition(px, vx, -vy, m);
						} else {
							physicsEngine.updatePosition(px, vx, vy, m);
						}
					}
				}
			}
		}
	}

	var manageData = {
		save: function () {
			var db;
			const indexedDB =
				window.indexedDB ||
				window.mozIndexedDB ||
				window.webkitIndexedDB ||
				window.msIndexedDB ||
				window.shimIndexedDB;
			if (!indexedDB) {
				console.log("Your browser doesn't support IndexedDB")
			}
			let openRequest = indexedDB.open("savedata", 1)
			openRequest.onupgradeneeded = function (event) {
				const db = event.target.result;
				const objectStore = db.createObjectStore("pxs", { keyPath: "id" });
				console.log("Upgraded")
			}
			openRequest.onerror = function () {
				console.error("Error")
			}
			openRequest.onsuccess = function () {
				console.log("Success")
				let db = openRequest.result;
				db.onversionchange = function () {
					db.close();
					alert("Database is outdated, please reload the page.");
				};
				const transaction = db.transaction("pxs", "readwrite");
				const pxs = transaction.objectStore("pxs");
				const keyRequest = pxs.getAllKeys();
				keyRequest.onsuccess = (event) => {
					console.log("Retrieved keys");
					const keys = event.target.result;
					if (!keys.isEmpty) {
						for (var key of keys) {
							pxs.delete(key);
						}
					}
				}
				for (var px of grid.array) {
					let request = pxs.add(px);
					request.onsuccess = function () {
						console.log("Added", request.result)
					}
					request.onerror = function () {
						console.log("Error", request.error)
					}
				}
			}
			openRequest.onblocked = function () {
				console.error("Error - blocked")
			}
		},
		load: function () {
			let openRequest = indexedDB.open("savedata", 1)
			openRequest.onupgradeneeded = function (event) {
				console.log("Upgraded")
				const db = event.target.result;
				const objectStore = db.createObjectStore("pxs", { keyPath: "id" });
			}
			openRequest.onerror = function () {
				console.error("Error")
			}
			openRequest.onsuccess = function () {
				console.log("Success")
				let db = openRequest.result
				db.onversionchange = function () {
					db.close();
					alert("Database is outdated, please reload the page.")
				};
				const objectStore = db.transaction("pxs").objectStore("pxs");
				const keyRequest = pxs.getAllKeys()

				keyRequest.onsuccess = (event) => {
					console.log("Retrieved keys");
					const keys = event.target.result
					eraseWholeCanvas();
					let length = keys.length;
					for (let i = 0; i < length; i++) {
						const key = keys[i]
						objectStore.get(key).onsuccess = (event) => {
							console.log("Retrieved");
							let px = event.target.result
							retrievedPx = new Pixel(px.x, px.y, px.type, px.acceleration, px.heat)
							Grid.array.push(retrievedPx)
							retrievedPx.draw()
							console.log("Drawn")
						};
					}
				}
			}
		}
	}
	window["Data"] = manageData;
	gameEngine.init();
}();

/* Object container for canvas */
var canvas = {
	height: 300,
	width: 500
}

function powderInLiquid(px, liquid) {
	px.update(px.x, px.y + Grid.px_size);
	liquid.y = liquid.y - Grid.px_size; // updates liquid to block above
	liquid.draw()
}
