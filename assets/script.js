"use-strict";
/*  Love Saroha
    lovesaroha1994@gmail.com (email address)
    https://www.lovesaroha.com (website)
    https://github.com/lovesaroha  (github)
*/

// Themes.
const themes = [{ normal: "#5468e7", veryLight: "#eef0fd" }, { normal: "#e94c2b", veryLight: "#fdedea" }];

// Choose random color theme.
let colorTheme = themes[Math.floor(Math.random() * themes.length)];

// This function set random color theme.
function setTheme() {
    // Change css values.
    document.documentElement.style.setProperty("--primary", colorTheme.normal);
}

// Set random theme.
setTheme();

// Define default variables.
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d');
var food = [];
var poison = [];
var maxVelocity = 3;
let mutationRate = 0.01;
let newMutationRate = 0.01;
let maxPopulation = 80;
var totalPopulation = 4;
let totalNutrition = 5;
var maxForce = 0.2;


// Update DOM elements.
document.getElementById("mutation_rate_id").value = mutationRate;
document.getElementById("maxpop_id").value = maxPopulation;
document.getElementById("totpop_id").value = totalPopulation;
document.getElementById("nutrition_id").value = totalNutrition;

// Prepare food and blades.
function prepareFoodAndPoison() {
    food = [];
    poison = [];
    for (let i = 0; i < totalNutrition; i++) {
        food[i] = createRandomVector(0, canvas.width);
        poison[i] = createRandomVector(0, canvas.width);
    }
    for (let i = 0; i < totalNutrition; i++) {
        food[i] = createRandomVector(0, canvas.width);
    }
}

// Display food and blades
function displayFoodAndPoison() {
    for (let i = 0; i < food.length; i++) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#888';
        ctx.font = '900 19px "Font Awesome 5 Pro"';
        ctx.fillText("\uf067", food[i].x, food[i].y);
    }
    for (let i = 0; i < poison.length; i++) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#888';
        ctx.font = '900 19px "Font Awesome 5 Pro"';
        ctx.fillText("\uf00d", poison[i].x, poison[i].y);
    }
}

// Population object defined.
function Population() {
    this.members = [];
    for (let i = 0; i < totalPopulation; i++) {
        this.members[i] = new Spider();
    }
    this.generations = 0;
}

// DNA object defined.
function DNA() {
    this.genes = [];
    this.genes[0] = (Math.random() * 5) - 2.5;
    this.genes[1] = (Math.random() * 5) - 2.5;
    this.genes[2] = Math.floor(Math.random() * 100);
    this.genes[3] = Math.floor(Math.random() * 100);
}

// Mutate dna function based on mutation rate.
DNA.prototype.mutate = function () {
    if (Math.random() < mutationRate) {
        this.genes[0] += ((Math.random() * 3) - 1.5);
        this.genes[1] += ((Math.random() * 3) - 1.5);
        this.genes[2] += (Math.floor(Math.random() * 20) - 10);
        this.genes[3] += (Math.floor(Math.random() * 20) - 10);
    }
}

// Spider object defined.
function Spider(position, dna) {
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.angleDeg = (Math.atan2(0 - this.velocity.y, 0 - this.velocity.x) * 180 / Math.PI) - 90;
    this.dna = new DNA();
    if (dna) {
        this.position = { x: position.x, y: position.y };
        this.dna.genes = dna.genes.slice();
        this.dna.mutate();
    } else {
        this.position = createRandomVector(0, canvas.width);
    }
    this.health = 1;
}

// Spider display function.
Spider.prototype.display = function () {
    ctx.save();
    ctx.translate(this.position.x, this.position.y - 10);
    ctx.rotate(this.angleDeg * Math.PI / 180);
    ctx.translate(-(this.position.x), -(this.position.y - 10));
    ctx.textAlign = 'center';
    ctx.fillStyle = colorTheme.normal;
    ctx.font = '400 30px "Font Awesome 5 Pro"';
    ctx.fillText("\uf717", this.position.x, this.position.y);
    ctx.restore();
}

// Spider move function.
Spider.prototype.move = function () {
    this.health = this.health - 0.01;
    this.velocity = { x: this.velocity.x + this.acceleration.x, y: this.velocity.y + this.acceleration.y };
    this.velocity.x = Math.min(Math.max(this.velocity.x, -maxVelocity), maxVelocity);
    this.velocity.y = Math.min(Math.max(this.velocity.y, -maxVelocity), maxVelocity);
    this.position = { x: this.position.x + this.velocity.x, y: this.position.y + this.velocity.y };
    this.acceleration = { x: 0, y: 0 };
    this.angleDeg = (Math.atan2(0 - this.velocity.y, 0 - this.velocity.x) * 180 / Math.PI) - 90;
}

// Spider seek function.
Spider.prototype.seek = function (target) {
    let desired = { x: target.x - this.position.x, y: target.y - this.position.y };
    desired = normalizeVector(desired);
    desired = { x: desired.x * maxVelocity, y: desired.y * maxVelocity };
    let steer = { x: desired.x - this.velocity.x, y: desired.y - this.velocity.y };
    steer = limitVector(steer, -(maxForce), (maxForce));
    return steer;
}
// Spider behaviour function.
Spider.prototype.behaviour = function () {
    let goodSteer = this.seeAndEat(food, 0.5, this.dna.genes[2]);
    let badSteer = this.seeAndEat(poison, -0.5, this.dna.genes[3]);
    goodSteer = { x: goodSteer.x * this.dna.genes[0], y: goodSteer.y * this.dna.genes[0] };
    badSteer = { x: badSteer.x * this.dna.genes[1], y: badSteer.y * this.dna.genes[1] };
    this.acceleration = { x: this.acceleration.x + goodSteer.x, y: this.acceleration.y + goodSteer.y };
    this.acceleration = { x: this.acceleration.x + badSteer.x, y: this.acceleration.y + badSteer.y };
}
// Spider clone function.
Spider.prototype.cloneItself = function () {
    if (Math.random() < 0.01 && this.health > 0.50) {
        pop.members.push(new Spider(this.position, this.dna));
        food.push(createRandomVector(0, canvas.width));
    }
}
// Spider see and eat function looks for nutrition.
Spider.prototype.seeAndEat = function (list, nutrition, vision) {
    let dist = Infinity;
    let closest = null;
    for (let i = list.length - 1; i >= 0; i--) {
        let d = euclideanDistance(this.position.x, this.position.y, list[i].x, list[i].y);
        if (d < 5) {
            list.splice(i, 1);
            this.health = this.health + nutrition;
        } else if (d < dist && d < vision) {
            dist = d;
            closest = list[i];
        }
    }
    if (closest != null) {
        return this.seek(closest);
    }
    return this.seek(createRandomVector(0, canvas.width / 2));
}

// Spider avoid boundry.
Spider.prototype.avoidBoundry = function () {
    let dist = 5;
    let divert = { x: canvas.width / 2, y: canvas.height / 2 };
    let seek = this.seek(divert);
    if (this.position.x < dist || this.position.x > (canvas.width - dist)) {
        this.acceleration = { x: this.acceleration.x + seek.x, y: this.acceleration.y + seek.y };
    }
    if (this.position.y < dist || this.position.y > (canvas.height - dist)) {
        this.acceleration = { x: this.acceleration.x + seek.x, y: this.acceleration.y + seek.y };
    }
}

// Start algorith function.
function startAlgorithm() {
    mutationRate = newMutationRate;
    prepareFoodAndPoison();
    document.getElementById("result_id").className = ``;
    pop = new Population();
    draw();
}

// Draw function.
function draw() {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    displayFoodAndPoison();

    document.getElementById("population_id").innerHTML = pop.members.length;

    for (let i = pop.members.length - 1; i >= 0; i--) {
        pop.members[i].avoidBoundry();
        pop.members[i].behaviour();
        pop.members[i].move();
        pop.members[i].display();
        if (pop.members.length < maxPopulation) {
            pop.members[i].cloneItself();
        }
        if (pop.members[i].health < 0) {
            if (Math.random() > 0.4) {
                food.push(createRandomVector(0, canvas.width));
            } else {
                poison.push(createRandomVector(0, canvas.width));
            }
            pop.members.splice(i, 1);
        }
    }
    if (pop.members.length == 0) {
        pop = new Population();
    }
    window.requestAnimationFrame(draw);
}


// This function create random vector.
function createRandomVector(minimum, maximum, floor) {
    let x = (Math.random() * maximum) + minimum;
    let y = (Math.random() * maximum) + minimum;
    if (floor) {
        x = Math.floor(x);
        y = Math.floor(y);
    }
    return { x: x, y: y };
}

// Normalize function.
function normalizeVector(vector) {
    let mag = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
    vector.x = mag === 0 ? 0 : vector.x / mag;
    vector.y = mag === 0 ? 0 : vector.y / mag;
    return vector;
}

// Limit vector function.
function limitVector(vector, min, max) {
    vector.x = Math.min(Math.max(vector.x, min), max);
    vector.y = Math.min(Math.max(vector.y, min), max);
    return vector;
}

// Euclidean distance between two given points.
function euclideanDistance(x1, y1, x2, y2) {
    return Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
}