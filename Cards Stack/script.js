
const images = [
    { id: 1, img: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format" },
    { id: 2, img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format" },
    { id: 3, img: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?q=80&w=500&auto=format" },
    { id: 4, img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format" },
    { id: 5, img: "https://plus.unsplash.com/premium_photo-1661883964999-c1bcb57a7357?q=80&w=500&auto=format" },
    { id: 6, img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=500&auto=format" },
    { id: 7, img: "https://images.unsplash.com/photo-1625603736199-775425d2890a?q=80&w=500&auto=format" },
    { id: 8, img: "https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=500&auto=format" },
    { id: 9, img: "https://images.unsplash.com/photo-1567428485548-c499e4931c10?q=80&w=1170&auto=format" },
    { id: 10, img: "https://images.unsplash.com/photo-1568605115459-4b731184f961?q=80&w=1170&auto=format" },
    { id: 11, img: "https://images.unsplash.com/photo-1573652636601-d6fdcfc59640?q=80&w=1096&auto=format" },
    { id: 12, img: "https://images.unsplash.com/photo-1584752242818-b4bd7fb3fe10?q=80&w=1167&auto=format" },
    { id: 13, img: "https://images.unsplash.com/photo-1529781833076-5f422f69d1af?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 14, img: "https://plus.unsplash.com/premium_photo-1682377521552-49d35c2c9704?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 15, img: "https://images.unsplash.com/photo-1639074918928-23102d5d7a3d?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 16, img: "https://images.unsplash.com/photo-1721149122657-7b5440f39160?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 17, img: "https://plus.unsplash.com/premium_photo-1734549548001-8b351b111dc9?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 18, img: "https://plus.unsplash.com/premium_photo-1734545294150-3d6c417c5cfb?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
];

class Stack {
    constructor(options) {
        this.container = document.getElementById('stackContainer');
        this.randomRotation = options.randomRotation || false;
        this.sensitivity = options.sensitivity || 180;
        this.sendToBackOnClick = options.sendToBackOnClick || false;
        this.cardDimensions = options.cardDimensions || { width: 200, height: 200 };
        this.cardsData = options.cardsData || images;
        this.animationConfig = options.animationConfig || { stiffness: 260, damping: 20 };
        this.cards = [...this.cardsData];

        this.container.style.width = `${this.cardDimensions.width}px`;
        this.container.style.height = `${this.cardDimensions.height}px`;

        this.init();
    }

    init() {
        this.renderCards();
    }

    renderCards() {
        this.container.innerHTML = '';

        this.cards.forEach((card, index) => {
            const randomRotate = this.randomRotation ? Math.random() * 10 - 5 : 0;
            const scale = 1 + index * 0.06 - this.cards.length * 0.06;
            const rotateZ = (this.cards.length - index - 1) * 4 + randomRotate;

            const cardElement = document.createElement('div');
            cardElement.className = 'card-rotate';
            cardElement.dataset.id = card.id;

            const cardInner = document.createElement('div');
            cardInner.className = 'card';
            cardInner.style.width = `${this.cardDimensions.width}px`;
            cardInner.style.height = `${this.cardDimensions.height}px`;
            cardInner.style.transform = `rotateZ(${rotateZ}deg) scale(${scale})`;

            const img = document.createElement('img');
            img.src = card.img;
            img.alt = `card-${card.id}`;
            img.className = 'card-image';

            cardInner.appendChild(img);
            cardElement.appendChild(cardInner);
            this.container.appendChild(cardElement);

            if (this.sendToBackOnClick) {
                cardInner.addEventListener('click', () => this.sendToBack(card.id));
            }

            this.setupDrag(cardElement, card.id);
        });

        // Set blurred background to top card image
        if (this.cards.length > 0) {
            document.getElementById('blurBg').style.backgroundImage = `url('${this.cards[17].img}')`;
        }
    }

    setupDrag(element, id) {
        let posX = 0, posY = 0;
        let startX = 0, startY = 0;
        let isDragging = false;
        let rotateX = 0, rotateY = 0;

        element.addEventListener('mousedown', startDrag);
        element.addEventListener('touchstart', startDrag, { passive: false });

        function startDrag(e) {
            e.preventDefault();
            isDragging = true;

            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;

            startX = clientX - posX;
            startY = clientY - posY;

            element.style.cursor = 'grabbing';

            document.addEventListener('mousemove', drag);
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchend', endDrag);
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();

            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;

            posX = clientX - startX;
            posY = clientY - startY;

            // Calculate rotation based on drag position
            rotateX = (posY / 100) * 60;
            rotateY = -(posX / 100) * 60;

            element.style.transform = `translate3d(${posX}px, ${posY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }

        const self = this;
        function endDrag(e) {
            if (!isDragging) return;
            isDragging = false;

            element.style.cursor = 'grab';

            document.removeEventListener('mousemove', drag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchend', endDrag);

            // Check if drag exceeded sensitivity
            if (Math.abs(posX) > self.sensitivity || Math.abs(posY) > self.sensitivity) {
                self.sendToBack(id);
            } else {
                // Return to original position with animation
                posX = 0;
                posY = 0;
                rotateX = 0;
                rotateY = 0;

                element.style.transition = 'transform 0.5s cubic-bezier(0.18, 0.67, 0.6, 0.99)';
                element.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';

                setTimeout(() => {
                    element.style.transition = '';
                }, 500);
            }
        }
    }

    sendToBack(id) {
        const cardElements = Array.from(this.container.querySelectorAll('.card-rotate'));
        const cardIndex = this.cards.findIndex(card => card.id === id);
        const cardElement = cardElements[cardIndex];

        // Add animation class
        cardElement.classList.add('send-to-back');

        // After animation, move card to back and re-render
        setTimeout(() => {
            cardElement.classList.remove('send-to-back');
            const [card] = this.cards.splice(cardIndex, 1);
            this.cards.unshift(card);
            this.renderCards();
        }, 400); // Match the CSS transition duration
    }
}

// Initialize the stack with options
new Stack({
    randomRotation: true,
    sensitivity: 180,
    sendToBackOnClick: false,
    cardDimensions: { width: 200, height: 200 },
    cardsData: images
});