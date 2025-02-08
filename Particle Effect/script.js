// Set up canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth; 
canvas.height = window.innerHeight; 

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;  
})


// Create mouse object
const mouse = {
    x: undefined,
    y: undefined,
};

canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});


// Particle class
class Particle{
    constructor(x, y){
        this._baseX = x;
        this._baseY = y;
        this._currX = x;
        this._currY = y;
        this._size = 5;
        this._color = 'white';
        this._dx = 0;
        this._dy = 0;
    }

    update(){
        // Get vectors and ditances
        const vectorToMouse = [mouse.x - this._currX , mouse.y - this._currY];
        const vectorToBase = [this._baseX - this._currX, this._baseY - this._currY];
        const vectorMouseToBase = [mouse.x - this._baseX, mouse.y - this._baseY];

        const distanceToMouse = Math.sqrt(vectorToMouse[0]**2 + vectorToMouse[1]**2);
        const distanceToBase = Math.sqrt(vectorToBase[0]**2 + vectorToBase[1]**2);
        const distanceMouseToBase = Math.sqrt(vectorMouseToBase[0]**2 + vectorMouseToBase[1]**2);

        // Change velocity
        if (distanceToMouse < 30 && distanceToBase < 60){
            this._dx = -vectorToMouse[0] / distanceToMouse;
            this._dy = -vectorToMouse[1] / distanceToMouse;
        } else if (distanceMouseToBase >= 30 && distanceToBase > 0.5){
            this._dx = vectorToBase[0] / distanceToBase;
            this._dy = vectorToBase[1] / distanceToBase;
        } else{
            this._dx = 0;
            this._dy = 0;
        }

        // Move
        this._currX += this._dx;
        this._currY += this._dy;

        // Change color
        this._color = `rgb(${255 - Math.floor(distanceToBase) * 3}, ${255 - Math.floor(distanceToBase) * 3}, ${255 - Math.floor(distanceToBase) * 3})`;
    }

    draw(){
        ctx.fillStyle = this._color;
        ctx.beginPath();
        ctx.arc(this._currX, this._currY, this._size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}


// Create list of particles
const particles = [];
for(let i = 0; i < 40; i++){
    for(let j = 0; j < 40; j++){
        particles.push(new Particle(canvas.width / 2 - 150 + i*10, canvas.height / 2 - 150 + j*10));
    }
}

function mainLoop(){
    particles.forEach(particle => particle.update());

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => particle.draw());

    requestAnimationFrame(mainLoop);
}

mainLoop();