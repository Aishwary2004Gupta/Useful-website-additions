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
const textInput = document.getElementById('textInput');
const generateBtn = document.getElementById('generateBtn');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let words = [];

function generateKineticText() {
    const inputText = textInput.value;
    const splitWords = inputText.split(' ').filter(Boolean);
    words = [];

    // Use KineticWordAdvanced for each word
    splitWords.forEach((word, i) => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        words.push(new KineticWordAdvanced(word, x, y));
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    words.forEach(word => {
        word.update();
        word.draw();
    });

    requestAnimationFrame(animate);
}

// Event listeners
generateBtn.addEventListener('click', generateKineticText);
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Start animation
animate();