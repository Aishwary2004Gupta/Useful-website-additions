
let cards = document.querySelectorAll(".card");
let stackArea = document.querySelector(".stack-area");

// Background colors that contrast with cards
const bgColors = [
    '#1a1a1a',
    '#004466',
    '#330033',
    '#463366'
];

function rotateCards() {
    let angle = 0;
    cards.forEach((card, index) => {
        if (card.classList.contains("away")) {
            card.style.transform = `translateY(-120vh) rotate(-48deg)`;
        } else {
            card.style.transform = ` rotate(${angle}deg)`;
            angle = angle - 10;
            card.style.zIndex = cards.length - index;
        }
    });
}

rotateCards();

window.addEventListener("scroll", () => {
    let distance = window.innerHeight * 0.5;
    let topVal = stackArea.getBoundingClientRect().top;
    let index = -1 * (topVal / distance + 1);
    index = Math.floor(index);

    // Update background color based on current card
    if (index >= 0 && index < bgColors.length) {
        document.body.style.backgroundColor = bgColors[index];
    } else {
        document.body.style.backgroundColor = '#ffffff';
    }

    for (i = 0; i < cards.length; i++) {
        if (i <= index) {
            cards[i].classList.add("away");
        } else {
            cards[i].classList.remove("away");
        }
    }
    rotateCards();
});
