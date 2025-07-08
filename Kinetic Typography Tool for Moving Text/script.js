class KineticWord {
    constructor(text, x, y) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.size = 30 + Math.random() * 20;
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
        };
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.rotation += this.rotationSpeed;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.velocity.x *= -1;
        if (this.y < 0 || this.y > canvas.height) this.velocity.y *= -1;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `${this.size}px Arial`;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
    }
}

// Use KineticWordAdvanced for word creation
class KineticWordAdvanced extends KineticWord {
    constructor(text, x, y) {
        super(text, x, y);
        // Use global compromise if available
        if (window.nlp) {
            const doc = window.nlp(text);
            const isVerb = doc.verbs().out('array').length > 0;
            const isAdjective = doc.adjectives().out('array').length > 0;
            if (isVerb) this.velocity.y += 1; // Verbs fall down
            if (isAdjective) this.rotationSpeed *= 2; // Adjectives spin faster
        }
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Responsive canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Wave Kinetic Typography
const phrase = "HELLO WORLD";
const baseFontSize = 64;
const amplitude = 40;
const waveLength = 180;
const speed = 2;
const letterSpacing = 16;

class WaveLetter {
    constructor(char, index, total) {
        this.char = char;
        this.index = index;
        this.total = total;
        this.baseX = (canvas.width / 2) - ((total - 1) * (baseFontSize + letterSpacing)) / 2 + index * (baseFontSize + letterSpacing);
        this.baseY = canvas.height / 2;
        this.color = `hsl(${(index / total) * 360}, 80%, 60%)`;
    }
    draw(time) {
        const phase = (this.index / this.total) * Math.PI * 2;
        const y = this.baseY + Math.sin(time / waveLength + phase * speed) * amplitude;
        ctx.save();
        ctx.font = `${baseFontSize}px Montserrat, Arial, sans-serif`;
        ctx.fillStyle = this.color;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 16;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(this.char, this.baseX, y);
        ctx.restore();
    }
}

let letters = [];
function setupWaveLetters() {
    letters = [];
    for (let i = 0; i < phrase.length; i++) {
        letters.push(new WaveLetter(phrase[i], i, phrase.length));
    }
}
setupWaveLetters();
window.addEventListener('resize', setupWaveLetters);

function animateWave(time = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    letters.forEach(letter => letter.draw(time));
    requestAnimationFrame(animateWave);
}
animateWave();