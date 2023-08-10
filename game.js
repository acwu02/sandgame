const PX_SIZE = 5;
const PHYSICS_INTERVAL_DEFAULT = 20;
const PROBABILITY = 0.5;
const PROB_GAS_DISAPPEAR = 0.2;

function probability(bound) {
    return (Math.random() <= bound);
}

function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Game {
    constructor() {
        this._canvas = document.querySelector("#canvas");
        this._grid = new Grid(this._canvas);
        this._physicsEngine = new PhysicsEngine(this._grid, this._canvas);
        this._statesOfMatter = {
            "solid": {
                isGravity: false,
                isBrownian: false,
                isOpaque: true,
                physics: (px) => {
                    return;
                }
            },
            "powder": {
                isGravity: true,
                isBrownian: false,
                isOpaque: true,
                physics: (px) => {
                    this._physicsEngine.powderPhysics(px);
                }
            },
            "liquid": {
                isGravity: true,
                isBrownian: true,
                isOpaque: false,
                physics: (px) => {
                    this._physicsEngine.liquidPhysics(px);
                }
            },
            "gas": {
                isGravity: false,
                isBrownian: false,
                isOpaque: false,
                physics: (px) => {
                    this._physicsEngine.gasPhysics(px);
                }
            }
        }

        this.elements = {
            "sand": {
                name: "sand",
                state: this._statesOfMatter.powder,
                color: "yellow",
                rxns: {
                }
            },
            "seed": {
                name: "seed",
                state: this._statesOfMatter.powder,
                color: "green",
                rxns: {
                    seedAndSand: {
                        reactants: "sand",
                        react: (seed) => {
                            let height = getRandomNum(10, 20);
                            this._physicsEngine.growTree(seed, "top", 0, height);
                        }
                    },
                    seedAndWood: {
                        reactants: "wood",
                        react: (seed) => {
                            let height = getRandomNum(10, 20);
                            this._physicsEngine.growTree(seed, "top", 0, height);
                        }
                    }
                }
            },
            "water": {
                name: "water",
                state: this._statesOfMatter.liquid,
                color: "blue",
                rxns: {

                }
            },
            "lava": {
                name: "lava",
                state: this._statesOfMatter.liquid,
                color: "orange",
                rxns: {

                }
            },
            "stone": {
                name: "stone",
                state: this._statesOfMatter.solid,
                color: "gray",
                rxns: {

                }
            },
            // TODO condense fire rxns?
            "wood": {
                name: "wood",
                state: this._statesOfMatter.solid,
                color: "brown",
                rxns: {
                    woodAndFire: {
                        reactants: "fire",
                        react: (wood) => {
                            this._physicsEngine.burn(wood);
                        }
                    },
                    woodAndLava: {
                        reactants: "lava",
                        react: (wood) => {
                            this._physicsEngine.burn(wood);
                        }
                    }
                }
            },
            "fire": {
                name: "fire",
                state: this._statesOfMatter.gas,
                color: "red",
                rxns: {

                }
            },
            "oil": {
                name: "oil",
                state: this._statesOfMatter.liquid,
                color: "maroon",
                rxns: {
                    oilAndFire: {
                        reactants: "fire",
                        react: (oil) => {
                            this._physicsEngine.burn(oil);
                        }
                    },
                    oilAndLava: {
                        reactants: "lava",
                        react: (oil) => {
                            this._physicsEngine.burn(oil);
                        }
                    }
                }
            },
            "erase": {
            }
        }
        this._physicsEngine.elements = this.elements;

        this._rect = this._canvas.getBoundingClientRect();

        this._handleChangeElem = this._handleChangeElem.bind(this);

        this._canvas.addEventListener("click", this._onClick);
        for (let button of document.querySelectorAll(".elementButton")) {
            button.addEventListener("click", this._handleChangeElem);
        }
        for (let button of document.querySelectorAll(".saveButton")) {
            button.addEventListener("click", this._handleData);
        }
        for (let button of document.querySelectorAll(".deleteButton")) {
            button.addEventListener("click", this._handleDelete);
        }

        this._canvas.addEventListener("mousemove", (e) => {
            this.draw('move', e)
        }, false);
        this._canvas.addEventListener("mousedown", (e) => {
            this.draw('down', e)
        }, false);
        this._canvas.addEventListener("mouseup", (e) => {
            this.draw('up', e)
        }, false);
        this._canvas.addEventListener("mouseout", (e) => {
            this.draw('out', e)
        }, false);

        this._currElem = this.elements.sand;
        this._welcome = document.querySelector("#welcome");

        this._physicsInterval = PHYSICS_INTERVAL_DEFAULT;
        this._intervalID = null;

        this._onLoad();
    }
    _onLoad() {
        this._togglePhysics(this._physicsInterval);
    }
    _togglePhysics(interval) {
        if (this._intervalID === null) {
            this._intervalID = setInterval(() => {
                this._physicsEngine.doPhysics();
            }, interval);
        } else {
            clearInterval(this._intervalID);
            this._intervalID = setInterval(() => {
                this._physicsEngine.doPhysics();
            }, interval);
        }
    }
    draw(res, event) {
        this.currX = event.clientX - this._canvas.offsetLeft;
        this.currY = event.clientY - this._canvas.offsetTop;
        if (res === 'down') {
            this.prevX = this.currX;
            this.prevY = this.currY;
            this.flag = true;
            this.dot_flag = true;
            if (this.dot_flag) {
                let x = Math.ceil(this.currX / PX_SIZE) * PX_SIZE;
                let y = Math.ceil(this.currY / PX_SIZE) * PX_SIZE;
                if (this._currElem === elements.erase) {
                    let pxToRemove = this._grid.getPx([x, y])
                    if (pxToRemove != -1) {
                        this._grid.removePx(pxToRemove);
                    }
                } else if (this._grid.isClear([x, y])) {
                    let px = new Pixel(x, y, this._currElem, this._grid, this._canvas, PX_SIZE);
                    this.dot_flag = false;
                }
            }
        }
        if (res === 'up' || res === 'out') {
            this.flag = false;
        }
        if (res === 'move') {
            if (this.flag) {
                let x = Math.ceil(this.currX / PX_SIZE) * PX_SIZE;
                let y = Math.ceil(this.currY / PX_SIZE) * PX_SIZE;
                if (this._currElem === this.elements.erase) {
                    let pxToRemove = this._grid.getPx([x, y])
                    if (pxToRemove != -1) {
                        this._grid.removePx(pxToRemove);
                    }
                } else if (this._grid.isClear([x, y])) {
                    let px = new Pixel(x, y, this._currElem, this._grid, this._canvas, PX_SIZE);
                }
            }
        }
    }
    _handleChangeElem(event) {
        let button = event.target;
        this._currElem = this.elements[button.id];
    }
    _eraseWholeCanvas() {
        let ctx = this._canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }
}

class Grid {
    constructor(canvas) {
        this.pxs = {};
        this._canvas = canvas;
    }
    getPx(coords) {
        if (this.pxs[coords]) return this.pxs[coords];
        else return -1;
    }
    isInBounds(coords) {
        let x = coords[0];
        let y = coords[1];
        return (x < this._canvas.width && x >= 0
            && y < this._canvas.height && y >= 0);
    }
    isClear(coords) {
        if (this.getPx(coords) === -1) return true;
        return false;
    }
    isValidMove(oldCoords, newCoords) {
        if (this.isInBounds(newCoords)) {
            if (this.isClear(newCoords)) {
                return true;
            } else if (this.getPx(oldCoords).type.state.isOpaque === true
                && this.getPx(newCoords).type.state.isOpaque === false) {
                return true;
            }
        }
        return false;
    }
    changeCoords(cursorX, cursorY) {
        let x = Math.ceil(cursorX / PX_SIZE) * PX_SIZE;
        let y = Math.ceil(cursorY / PX_SIZE) * PX_SIZE;
        return [x, y];
    }
    addPx(px) {
        let coords = px.coords;
        this.pxs[coords] = px;
    }
    removePx(px) {
        px.drawOver();
        delete this.pxs[px.coords];
    }
}

class Pixel {
    constructor(x, y, type, grid, canvas) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.coords = [x, y];
        this.adjacents = {};

        this.id = null;

        this._grid = grid;
        this._canvas = canvas;

        this.draw();
        this._grid.addPx(this);
    }
    updatePosition(coords) {
        this._updateAdjacents();
        this.drawOver();
        delete this._grid.pxs[`${this.x},${this.y}`];
        this.x = coords[0];
        this.y = coords[1];
        this.coords = [this.x, this.y];
        this._grid.pxs[coords] = this;
        this.draw();
    }
    draw() {
        let ctx = this._canvas.getContext("2d");
        ctx.fillStyle = this.type.color;
        ctx.fillRect(this.x, this.y, PX_SIZE, PX_SIZE);
        this._updateAdjacents();
    }
    doPhysicsRules() {
        this.type.state.physics(this);
    }
    drawOver() {
        let ctx = this._canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, PX_SIZE, PX_SIZE);
    }
    checkRxns() {
        for (let key of Object.keys(this.adjacents)) {
            let adjacentPx = this._grid.getPx(this.adjacents[key]);
            if (adjacentPx !== -1) {
                for (let key of Object.keys(this.type.rxns)) {
                    let rxn = this.type.rxns[key];
                    if (rxn.reactants === adjacentPx.type.name) {
                        rxn.react(this);
                    }
                }
            }
        }
    }
    _updateAdjacents() {
        this.adjacents.right = [this.x + PX_SIZE, this.y];
        this.adjacents.left = [this.x - PX_SIZE, this.y];
        this.adjacents.bottom = [this.x, this.y + PX_SIZE];
        this.adjacents.top = [this.x, this.y - PX_SIZE];
        this.adjacents.bottomRight = [this.x + PX_SIZE, this.y + PX_SIZE];
        this.adjacents.topRight = [this.x + PX_SIZE, this.y - PX_SIZE];
        this.adjacents.topLeft = [this.x - PX_SIZE, this.y - PX_SIZE];
        this.adjacents.bottomLeft = [this.x - PX_SIZE, this.y + PX_SIZE];
    }
}

class PhysicsEngine {
    constructor(grid, canvas) {
        this._grid = grid;
        this._canvas = canvas;
    }
    doPhysics() {
        for (let coords in this._grid.pxs) {
            let px = this._grid.getPx(coords);
            if (px.isBurning === true) {
                this.burn(px);
            }
            px.checkRxns();
            px.doPhysicsRules();
        }
    }
    powderPhysics(px) {
        this._doGravity(px);
    }
    liquidPhysics(px) {
        if (this._doGravity(px) === false) {
            this._doBrownian(px);
        }
    }
    // TODO fix
    gasPhysics(px) {
        if (probability(PROB_GAS_DISAPPEAR)) {
            this._grid.removePx(px);
        } else if (this._grid.isClear(px.adjacents.top)) {
            px.updatePosition(px.adjacents.top);
        } else {
            if (probability(PROBABILITY)) {
                if (this._grid.isClear(px.adjacents.right)) {
                    px.updatePosition(px.adjacents.right);
                } else if (this._grid.isClear(px.adjacents.left)) {
                    px.updatePosition(px.adjacents.left);
                }
            }
        }
    }
    growTree(px, adj, currHeight, maxHeight) {
        // px.isGrowing = false;
        let dir = px.adjacents[adj];
        if (currHeight === 0) {
            px.type = this.elements.wood;
            px.draw();
        }
        if (currHeight < maxHeight) {
            if (this._grid.isValidMove(px.coords, dir)) {
                let wood = new Pixel(dir[0], dir[1], this.elements.wood, this._grid, this._canvas);
                if (probability(0.2)) {
                    this.growTree(px, "topLeft", 0, getRandomNum(3, 5));
                }
                if (probability(0.2)) {
                    this.growTree(px, "topRight", 0, getRandomNum(3, 5));
                }
                this.growTree(wood, adj, currHeight + 1, maxHeight);
            }
        }
    }
    // TODO remove hard-coded consts
    burn(px) {
        px.isBurning = true;
        if (this._grid.isClear(px.adjacents.top)) {
            let fire = new Pixel(px.adjacents.top[0], px.adjacents.top[1], this.elements.fire, this._grid, this._canvas);
        }
        if (px.type === this.elements.wood) {
            if (probability(0.01)) {
                px.isBurning = false;
                this._grid.removePx(px);
            }
        }
        for (let key in px.adjacents) {
            let adjacent = px.adjacents[key];
            let adjPx = this._grid.getPx(adjacent);
            if (adjPx.type === px.type && probability(0.3)) {
                adjPx.isBurning = true;
            }
        }
    }
    _doGravity(px) {
        if (this._grid.isValidMove(px.coords, px.adjacents.bottom)) {
            px.updatePosition(px.adjacents.bottom);
            return true;
        } else {
            if (this._grid.isValidMove(px.coords, px.adjacents.bottomLeft)
                && this._grid.isClear(px.adjacents.left)) {
                px.updatePosition(px.adjacents.bottomLeft);
                return true;
            } else if (this._grid.isValidMove(px.coords, px.adjacents.bottomRight)
                && this._grid.isClear(px.adjacents.right)) {
                px.updatePosition(px.adjacents.bottomRight);
                return true;
            }
        }
        return false;
    }
    _doBrownian(px) {
        if (px.type === this.elements.lava) {
            let test = 0;
        }
        if (Math.random() >= PROBABILITY) {
            if (this._grid.isValidMove(px.coords, px.adjacents.right)) {
                px.updatePosition(px.adjacents.right);
            } else if (this._grid.isValidMove(px.coords, px.adjacents.left)) {
                px.updatePosition(px.adjacents.left);
            }
        } else {
            if (this._grid.isValidMove(px.coords, px.adjacents.left)) {
                px.updatePosition(px.adjacents.left);
            } else if (this._grid.isValidMove(px.coords, px.adjacents.right)) {
                px.updatePosition(px.adjacents.right);
            }
        }
    }
}

let game = new Game();