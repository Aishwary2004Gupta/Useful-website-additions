const spreads = [
  {
    left: `
      <article class="page">
        <span class="stars" style="left:8%;top:7%">✦</span>
        <div class="spread-cover">
          <svg class="sketch cover-mark" viewBox="0 0 220 90">
            <path d="M8 70c18-38 28-52 42-52 16 0 18 22 32 22s18-28 36-26c14 2 20 28 34 28 12 0 20-18 36-22 14-4 24 8 24 8"/>
            <path d="M20 78c40 8 90 10 180-6"/>
            <circle cx="168" cy="22" r="3" class="fill-ink"/>
          </svg>
          <h2>Arriving<br/>somewhere<br/>slow</h2>
          <div class="rule"></div>
          <p class="note cover-sub">Tickets in the pocket. A pen that already leaked. The day still warm from the train.</p>
        </div>
        <span class="folio">01</span>
      </article>
    `,
    right: `
      <article class="page">
        <div class="cover-right">
          <p class="tiny">contents, more or less</p>
          <h3>What I meant to keep</h3>
          <ul class="place-list">
            <li>a market before the city wakes</li>
            <li>Tokyo, Tsukiji to Ginza</li>
            <li>one quiet temple, then lunch</li>
            <li>the last bowl of the night</li>
          </ul>
          <svg class="sketch" viewBox="0 0 260 110" style="margin-top:10px">
            <rect x="20" y="28" width="70" height="52" rx="4" class="fill-soft"/>
            <path d="M28 46h54M28 56h40"/>
            <circle cx="150" cy="54" r="28" class="fill-soft"/>
            <path d="M138 54h24M150 42v24"/>
            <path d="M200 30c18 6 28 20 28 38 0 10-20 18-34 8-8-6-8-20 2-28 6-4 16-2 20 6"/>
          </svg>
        </div>
        <span class="folio">02</span>
      </article>
    `,
  },
  {
    left: `
      <article class="page tokyo">
        <div class="tokyo-title">
          <span class="stars">✩</span>
          <h2>Before the shutters lift</h2>
        </div>
        <div class="two-col">
          <div class="stack">
            <svg class="sketch big-draw" viewBox="0 0 200 220">
              <path d="M18 170c8-62 20-120 42-120 18 0 22 40 40 40 16 0 18-36 36-34 22 2 30 70 40 114" class="fill-soft"/>
              <path d="M30 188h140"/>
              <path d="M48 120h28v40H48z" class="fill-cream"/>
              <path d="M52 128h20M52 136h16"/>
              <circle cx="150" cy="86" r="22" class="fill-soft"/>
              <path d="M142 86h16M150 78v16"/>
              <path d="M70 70c12-22 40-24 52-6"/>
            </svg>
            <p class="caption">steam on the glass, someone already counting boxes</p>
          </div>
          <div class="stack">
            <p class="note">I followed the smell of broth until the street narrowed and the language became all elbows and knives.</p>
            <svg class="sketch big-draw" viewBox="0 0 180 160">
              <rect x="20" y="40" width="130" height="70" rx="8" class="fill-soft"/>
              <path d="M36 66h28v22H36z" class="fill-yolk"/>
              <path d="M72 70h22v16H72z" class="fill-salmon"/>
              <path d="M102 68h20v18h-20z" class="fill-cream"/>
              <path d="M24 124h120"/>
              <path d="M40 124v18M128 124v18"/>
            </svg>
            <p class="label">first coffee. no photos yet.</p>
          </div>
        </div>
        <span class="folio">03</span>
      </article>
    `,
    right: `
      <article class="page">
        <h3>small inventory</h3>
        <p class="tiny">from the coat pocket</p>
        <div class="two-col" style="margin-top:12px;height:calc(100% - 90px)">
          <div class="stack">
            <svg class="sketch big-draw" viewBox="0 0 160 200">
              <path d="M40 20h70l10 18v130H40V20z" class="fill-soft"/>
              <path d="M40 38h80"/>
              <path d="M56 64h48M56 80h40M56 96h44"/>
              <circle cx="70" cy="140" r="10"/>
              <path d="M110 126c12 8 12 28-2 34"/>
            </svg>
            <p class="caption">map, ticket stub, a plum sweet wrapped twice</p>
          </div>
          <div class="stack">
            <p class="note">Ask for the corner seat. Watch the first trays leave the kitchen. Do not rush the egg.</p>
            <svg class="sketch big-draw" viewBox="0 0 160 140">
              <ellipse cx="80" cy="78" rx="50" ry="18"/>
              <path d="M30 78c4-28 24-50 50-50s46 22 50 50" class="fill-soft"/>
              <path d="M58 70c8-10 28-12 40 2"/>
            </svg>
          </div>
        </div>
        <span class="folio">04</span>
      </article>
    `,
  },
  {
    left: `
      <article class="page tokyo">
        <div class="tokyo-title">
          <svg width="28" height="24" viewBox="0 0 28 24" class="sketch"><path d="M4 16c4-10 8-14 12-8 3 5 6 2 9-2"/></svg>
          <h2>Tokyo, Tsukiji to Ginza</h2>
        </div>
        <p class="market-note">narrow lanes, bright trays</p>
        <div class="grid-tokyo-left">
          <div class="cell">
            <svg class="sketch" viewBox="0 0 180 130">
              <rect x="14" y="18" width="150" height="92" rx="8" class="fill-soft"/>
              <ellipse cx="70" cy="68" rx="36" ry="24" class="fill-cream"/>
              <path d="M48 62c10-10 28-12 40 2 4 6-2 16-14 20-16 4-30-6-26-22z" class="fill-salmon"/>
              <path d="M108 50h40v36h-40z" class="fill-cream"/>
              <path d="M114 58h28v8H114z" class="fill-salmon"/>
              <path d="M20 28c20 4 28-10 48-6"/>
            </svg>
          </div>
          <div class="cell">
            <svg class="sketch" viewBox="0 0 190 130">
              <path d="M20 110c8-40 18-70 40-70 16 0 18 24 34 24s16-28 34-26c14 2 22 38 30 72" class="fill-soft"/>
              <path d="M58 86h18v28H58z"/>
              <path d="M92 84h16v30H92z"/>
              <path d="M120 86h16v28h-16z"/>
              <circle cx="66" cy="52" r="10" class="fill-soft"/>
              <circle cx="98" cy="48" r="11" class="fill-soft"/>
              <circle cx="128" cy="54" r="10" class="fill-soft"/>
              <path d="M40 118h120"/>
            </svg>
          </div>
          <div class="cell">
            <svg class="sketch" viewBox="0 0 170 90">
              <rect x="18" y="22" width="120" height="48" rx="6" class="fill-soft"/>
              <rect x="30" y="34" width="96" height="22" rx="4" class="fill-yolk"/>
              <path d="M148 30l10 18-10 18"/>
            </svg>
            <p class="label">tamagoyaki, still warm</p>
          </div>
          <div class="cell">
            <svg class="sketch" viewBox="0 0 180 90">
              <path d="M30 70c30-44 70-46 120-8"/>
              <rect x="58" y="28" width="64" height="28" rx="4" class="fill-salmon"/>
              <path d="M50 70h20v8H50zM110 72h18v6h-18z"/>
              <circle cx="86" cy="22" r="7"/>
            </svg>
          </div>
          <div class="cell span2">
            <svg class="sketch" viewBox="0 0 360 150">
              <path d="M20 40h70v70H20z" class="fill-soft"/>
              <path d="M34 58h16M34 70h28"/>
              <path d="M110 86l8-40 8 12 8-20 8 48"/>
              <path d="M170 40h18v50H170z"/>
              <path d="M196 48h16v42h-16z"/>
              <path d="M220 56h14v34h-14z"/>
              <path d="M260 70c0-22 18-34 34-22 8 6 10 20 2 30-10 14-36 10-36-8z" class="fill-soft"/>
              <path d="M20 128h310"/>
            </svg>
            <p class="label">knives / baskets / scales</p>
          </div>
        </div>
        <span class="folio">05</span>
      </article>
    `,
    right: `
      <article class="page tokyo">
        <div class="grid-tokyo-right">
          <div class="cell">
            <svg class="sketch" viewBox="0 0 200 110">
              <path d="M20 90L40 48h120l20 42z" class="fill-soft"/>
              <path d="M70 48V28h60v20"/>
              <circle cx="100" cy="18" r="10"/>
              <path d="M86 90v-18h28v18"/>
              <path d="M30 90h140"/>
            </svg>
            <p class="label">one act, a whole world</p>
          </div>
          <div class="cell">
            <svg class="sketch" viewBox="0 0 140 110">
              <path d="M20 86c10-40 30-62 54-62 28 0 48 30 52 62" class="fill-soft"/>
              <circle cx="58" cy="58" r="7" class="fill-ink"/>
              <circle cx="92" cy="58" r="7" class="fill-ink"/>
              <path d="M40 78h68"/>
              <path d="M108 40c10-8 22-6 28 6"/>
            </svg>
          </div>
          <div class="cell">
            <svg class="sketch" viewBox="0 0 210 140">
              <path d="M16 120V48h178v72z" class="fill-soft"/>
              <path d="M16 70h178"/>
              <path d="M40 70v50M70 70v50M100 70v50M130 70v50M160 70v50"/>
              <path d="M30 48c30-24 70-28 150 4"/>
              <circle cx="168" cy="96" r="8"/>
            </svg>
            <p class="label">fourth floor, looking down</p>
          </div>
          <div class="cell">
            <svg class="sketch" viewBox="0 0 150 140">
              <path d="M24 120V60l52-28 52 28v60z" class="fill-soft"/>
              <path d="M50 120V78h52v42"/>
              <path d="M36 70h80"/>
              <path d="M76 32v18"/>
            </svg>
            <p class="label">stained glass, quiet light</p>
          </div>
          <div class="cell span2">
            <div class="seq">
              <figure>
                <svg class="sketch" viewBox="0 0 90 70"><rect x="10" y="18" width="70" height="36" rx="4"/><rect x="28" y="28" width="34" height="16" class="fill-salmon"/></svg>
                <figcaption class="caption">place</figcaption>
              </figure>
              <figure>
                <svg class="sketch" viewBox="0 0 90 70"><rect x="10" y="18" width="70" height="36" rx="4"/><path d="M30 46l16-20 16 20z" class="fill-salmon"/></svg>
                <figcaption class="caption">turn</figcaption>
              </figure>
              <figure>
                <svg class="sketch" viewBox="0 0 90 70"><rect x="10" y="18" width="70" height="36" rx="4"/><rect x="32" y="30" width="26" height="16" class="fill-salmon"/></svg>
                <figcaption class="caption">rest</figcaption>
              </figure>
              <figure>
                <svg class="sketch" viewBox="0 0 100 70"><ellipse cx="50" cy="40" rx="30" ry="16" class="fill-soft"/><path d="M28 38c8-10 36-12 46 4"/></svg>
                <figcaption class="caption">grilled for two</figcaption>
              </figure>
            </div>
          </div>
        </div>
        <p class="signed">Malena + Predrag, 5:00 ♥</p>
        <span class="folio">06</span>
      </article>
    `,
  },
  {
    left: `
      <article class="page">
        <h2>A temple, then the long walk back</h2>
        <div class="two-col" style="margin-top:10px">
          <div class="stack">
            <svg class="sketch big-draw" viewBox="0 0 180 220">
              <path d="M16 190L90 30l74 160z" class="fill-soft"/>
              <path d="M40 190V120h100v70"/>
              <path d="M40 140h100"/>
              <path d="M70 190v-36h40v36"/>
              <circle cx="90" cy="86" r="8"/>
              <path d="M20 190h140"/>
            </svg>
            <p class="caption">shoes in a line. incense already ahead of us.</p>
          </div>
          <div class="stack">
            <p class="note">We did not stay for the service. Only the courtyard, the one tree, the sound of a bicycle braking somewhere outside the wall.</p>
            <svg class="sketch big-draw" viewBox="0 0 180 150">
              <path d="M20 120c30-70 110-70 140 0" class="fill-soft"/>
              <path d="M90 120V46"/>
              <path d="M90 70c-24-10-40-8-54 8M90 62c22-12 44-8 56 10"/>
              <circle cx="148" cy="36" r="4" class="fill-ink"/>
            </svg>
          </div>
        </div>
        <span class="folio">07</span>
      </article>
    `,
    right: `
      <article class="page">
        <h3>notes I do not want to lose</h3>
        <div class="rule"></div>
        <p class="note" style="font-size:clamp(16px,1.5vw,22px);max-width:28ch;">
          Buy the fruit that does not travel.
          Sit where you can see the kitchen.
          If the street is loud, go one lane further.
          Leave before you are finished looking.
        </p>
        <svg class="sketch" viewBox="0 0 280 140" style="margin-top:16px;height:34%">
          <rect x="18" y="30" width="70" height="86" rx="6" class="fill-soft"/>
          <rect x="104" y="22" width="70" height="94" rx="6" class="fill-soft"/>
          <rect x="190" y="36" width="70" height="80" rx="6" class="fill-soft"/>
          <path d="M32 52h42M32 66h30M118 44h42M118 60h36M206 56h40M206 72h28"/>
        </svg>
        <p class="label">postcards written and never sent</p>
        <span class="folio">08</span>
      </article>
    `,
  },
  {
    left: `
      <article class="page">
        <h2>Evening, last bowl</h2>
        <div class="two-col" style="margin-top:8px">
          <div class="stack">
            <svg class="sketch big-draw" viewBox="0 0 180 200">
              <ellipse cx="90" cy="130" rx="60" ry="22"/>
              <path d="M30 130c6-40 30-70 60-70s54 30 60 70" class="fill-soft"/>
              <path d="M58 120c10-16 40-20 58 2"/>
              <path d="M70 96c8 8 6 20-4 24"/>
              <path d="M130 40l8 24M150 52l-18 10"/>
            </svg>
            <p class="caption">broth first, then the story of the day</p>
          </div>
          <div class="stack">
            <p class="note">We walked until the neon thinned and the river showed us a cheaper version of the skyline.</p>
            <svg class="sketch big-draw" viewBox="0 0 180 160">
              <path d="M10 110c40-10 80 10 160-8"/>
              <path d="M24 110V58h22v52"/>
              <path d="M56 110V40h30v70"/>
              <path d="M96 110V66h18v44"/>
              <path d="M126 110V34h28v76"/>
              <circle cx="150" cy="24" r="5"/>
            </svg>
          </div>
        </div>
        <span class="folio">09</span>
      </article>
    `,
    right: `
      <article class="page">
        <div class="spread-cover">
          <p class="tiny">endpaper</p>
          <h2>Keep the light<br/>a little longer</h2>
          <div class="rule"></div>
          <p class="note cover-sub">Close the book when you want. It will wait on this page.</p>
          <svg class="sketch" viewBox="0 0 240 90">
            <path d="M10 60c30-40 50-40 70-8 16 26 30-20 54-16 20 4 24 30 42 30 16 0 28-22 50-18"/>
            <path d="M20 74h200"/>
          </svg>
        </div>
        <span class="folio">10</span>
      </article>
    `,
  },
];

const book = document.getElementById("book");
const sheetLeft = document.getElementById("sheetLeft");
const sheetRight = document.getElementById("sheetRight");
const leaf = document.getElementById("leaf");
const leafFront = document.getElementById("leafFront");
const leafBack = document.getElementById("leafBack");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pager = document.getElementById("pager");
const hint = document.getElementById("hint");

const FLIP_MS = 950;
const AUTO_MS = 4800;

let index = 0;
let busy = false;
let autoplay = true;
let timer = null;

function pad(n) {
  return String(n).padStart(2, "0");
}

function renderSpread(i) {
  const spread = spreads[i];
  sheetLeft.innerHTML = spread.left;
  sheetRight.innerHTML = spread.right;
  const leftNo = i * 2 + 1;
  pager.textContent = `${pad(leftNo)} — ${pad(leftNo + 1)}`;
  prevBtn.disabled = i === 0;
  nextBtn.disabled = i === spreads.length - 1;
}

function stopAutoplay() {
  if (!autoplay) return;
  autoplay = false;
  clearInterval(timer);
  timer = null;
  hint.textContent = "You have the book now. Use the arrows or the keyboard.";
}

function startAutoplay() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (!autoplay || busy) return;
    if (index >= spreads.length - 1) {
      goTo(0, "forward", true);
    } else {
      goTo(index + 1, "forward", true);
    }
  }, AUTO_MS);
}

function goTo(nextIndex, direction, fromAuto) {
  if (busy || nextIndex === index) return;
  if (nextIndex < 0 || nextIndex >= spreads.length) return;
  if (!fromAuto) stopAutoplay();

  const current = spreads[index];
  const incoming = spreads[nextIndex];
  busy = true;
  book.classList.add("is-turning");

  leaf.className = "leaf active " + (direction === "forward" ? "from-right" : "from-left");

  if (direction === "forward") {
    leafFront.innerHTML = current.right;
    leafBack.innerHTML = incoming.left;
    sheetRight.innerHTML = incoming.right;
  } else {
    leafFront.innerHTML = current.left;
    leafBack.innerHTML = incoming.right;
    sheetLeft.innerHTML = incoming.left;
  }

  // Force a frame so the transition can start from the rest pose.
  void leaf.offsetWidth;
  leaf.classList.add("animating");
  requestAnimationFrame(() => {
    leaf.classList.add("turn");
  });

  window.setTimeout(() => {
    index = nextIndex;
    renderSpread(index);
    leaf.className = "leaf";
    leafFront.innerHTML = "";
    leafBack.innerHTML = "";
    busy = false;
    book.classList.remove("is-turning");
  }, FLIP_MS);
}

prevBtn.addEventListener("click", () => goTo(index - 1, "back"));
nextBtn.addEventListener("click", () => goTo(index + 1, "forward"));

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") goTo(index + 1, "forward");
  if (event.key === "ArrowLeft") goTo(index - 1, "back");
});

book.addEventListener(
  "pointerdown",
  (event) => {
    const mid = book.getBoundingClientRect().left + book.clientWidth / 2;
    if (event.clientX >= mid) goTo(index + 1, "forward");
    else goTo(index - 1, "back");
  },
  { passive: true }
);

renderSpread(index);
startAutoplay();