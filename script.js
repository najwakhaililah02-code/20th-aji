
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const mainText = document.getElementById("mainText");
const subtitle = document.getElementById("subtitle");
const eyebrow = document.getElementById("eyebrow");
const button = document.getElementById("startButton");
const heartMessage = document.getElementById("heartMessage");
const dedication = document.getElementById("dedication");
const finalMessage = document.getElementById("finalMessage");
const typedMessage = document.getElementById("typedMessage");
const signature = document.getElementById("signature");
const music = document.getElementById("music");

let W, H, particles = [];
let mode = "ambient";
let running = false;
let lastTime = 0;

// Ukuran canvas menyesuaikan layar
function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    createAmbient();
}

window.addEventListener("resize", resize);

const random = (a, b) => Math.random() * (b - a) + a;

class Particle {
    constructor(x, y, tx, ty, size = 1.5) {
        this.x = x;
        this.y = y;
        this.tx = tx;
        this.ty = ty;
        this.size = size;
        this.phase = random(0, 6.28);
        this.speed = random(0.045, 0.105);
        this.color = Math.random() > 0.25
            ? "#ff80ca"
            : "#ffd0eb";
    }

    update(time) {
        if (mode === "ambient") {
            this.x += Math.sin(time * 0.0004 + this.phase) * 0.35;
            this.y += 0.35;

            if (this.y > H + 5) {
                this.y = -5;
                this.x = random(0, W);
            }
        } else {
            this.x += (this.tx - this.x) * this.speed;
            this.y += (this.ty - this.y) * this.speed;
        }
    }

    draw(time) {
        const pulse = 0.7 + Math.sin(
            time * 0.003 + this.phase
        ) * 0.25;

        ctx.globalAlpha = Math.max(0.2, pulse);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Partikel awal seperti hujan digital
function createAmbient() {
    mode = "ambient";
    particles = [];

    const count = Math.min(350, Math.floor(W * H / 2800));

    for (let i = 0; i < count; i++) {
        particles.push(new Particle(
            random(0, W),
            random(0, H),
            0, 0,
            random(0.6, 1.8)
        ));
    }
}

// Mengambil titik-titik dari bentuk tulisan
function getTextPoints(text) {
    const off = document.createElement("canvas");
    const o = off.getContext("2d");

    off.width = W;
    off.height = H;

    let fontSize = Math.min(W * 0.13, H * 0.19, 110);

    o.textAlign = "center";
    o.textBaseline = "middle";
    o.font = `bold ${fontSize}px Arial`;

    while (o.measureText(text).width > W * 0.88 && fontSize > 12) {
        fontSize *= 0.9;
        o.font = `bold ${fontSize}px Arial`;
    }

    o.fillStyle = "white";
    o.fillText(text, W / 2, H / 2);

    const pixels = o.getImageData(0, 0, W, H).data;
    const points = [];
    const gap = W < 600 ? 5 : 6;

    for (let y = 0; y < H; y += gap) {
        for (let x = 0; x < W; x += gap) {
            if (pixels[(y * W + x) * 4 + 3] > 100) {
                points.push({ x, y });
            }
        }
    }

    return points;
}

// Membentuk tulisan dari partikel
function formText(text) {
    const points = getTextPoints(text);

    particles = points.map(point => new Particle(
        random(0, W),
        random(0, H),
        point.x,
        point.y,
        random(0.8, 1.8)
    ));

    mode = "form";
}

// Membentuk hati dari partikel
function formHeart() {
    const points = [];
    const scale = Math.min(W / 38, H / 34, 17);

    for (let t = 0; t < Math.PI * 2; t += 0.045) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t)
            - 5 * Math.cos(2 * t)
            - 2 * Math.cos(3 * t)
            - Math.cos(4 * t);

        points.push({
            x: W / 2 + x * scale,
            y: H / 2 - y * scale
        });
    }

    // Membuat beberapa lapisan agar hati terlihat lebih penuh
    const outline = [...points];

    for (let factor of [0.82, 0.64, 0.46]) {
        for (const p of outline) {
            points.push({
                x: W / 2 + (p.x - W / 2) * factor,
                y: H / 2 + (p.y - H / 2) * factor
            });
        }
    }

    particles = points.map(p => new Particle(
        random(0, W),
        random(0, H),
        p.x,
        p.y,
        random(0.8, 1.7)
    ));

    mode = "form";
}

// Loop animasi
function animate(time) {
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, W, H);

    // Efek jejak partikel
    ctx.fillStyle = "rgba(5, 3, 10, 0.16)";
    ctx.fillRect(0, 0, W, H);

    for (const p of particles) {
        p.update(time);
        p.draw(time);
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// Jeda yang semakin lama saat mendekati usia 20
function countdown() {
    const numbers = Array.from({ length: 19 }, (_, i) => i + 1);
    let index = 0;

    function showNext() {
        if (index >= numbers.length) {
            // Jeda khusus sebelum angka 20 muncul tiba-tiba
            setTimeout(() => {
                mainText.textContent = "20";
                formText("20");

                eyebrow.textContent = "A NEW CHAPTER BEGINS";
                subtitle.textContent = "and just like that... twenty.";

                // Angka 20 ditampilkan lebih lama
                setTimeout(showWords, 3000);
            }, 1800);

            return;
        }

        const number = numbers[index];
        mainText.textContent = number;
        formText(String(number));

        // 1 cepat, 19 paling lambat
        // Interval naik secara bertahap dari 300 ms ke 1200 ms
        const progress = index / 18;
        const delay = 300 + 900 * progress * progress;

        index++;
        setTimeout(showNext, delay);
    }

    showNext();
}

// HAPPY -> SWEET -> TWENTY
function showWords() {
    const words = ["HAPPY", "SWEET", "TWENTY"];
    let i = 0;

    eyebrow.textContent = "A LITTLE WISH FOR YOU";
    subtitle.textContent = "";

    function nextWord() {
        if (i >= words.length) {
            showHeart();
            return;
        }

        mainText.textContent = words[i];
        formText(words[i]);

        i++;
        setTimeout(nextWord, 1900);
    }

    nextWord();
}

// Hati + ucapan + tanda tangan

function showHeart() {
    mainText.classList.add("hide");
    eyebrow.classList.add("hide");
    subtitle.classList.add("hide");

    formHeart();

    setTimeout(() => {
        heartMessage.classList.add("show");
    }, 2200);

    setTimeout(() => {
        dedication.classList.add("show");
    }, 4500);

    setTimeout(() => {
        heartMessage.classList.remove("show");
        dedication.classList.remove("show");

        setTimeout(() => {
            finalMessage.classList.add("show-message");
            typeMessage();
        }, 900);
    }, 8500);
}


// Musik baru mulai setelah tombol ditekan
button.addEventListener("click", async () => {
    if (running) return;
    running = true;

    button.style.display = "none";

    eyebrow.textContent = "A LITTLE BIRTHDAY SURPRISE";
    mainText.textContent = "ready?";
    subtitle.textContent = "here we go ♡";

    try {
        music.volume = 0.35;
        await music.play();
    } catch (error) {
        subtitle.textContent =
            "Add music.mp3 to the folder to enable the music ♡";
    }

    // Beri waktu untuk opening sebelum hitungan dimulai
    setTimeout(countdown, 1000);
});

resize();
requestAnimationFrame(animate);



function typeMessage() {
    const message = `anjay 20 tahun nii yee..
selamat bertambah dan berkurang usia jajiiw.
sehat dan bahagia selalu ya, jangan mikirin orang lain mulu,
utamain diri lu juga.
bersama atau tidaknya kita, tetap saling peduli
satu sama lain ya.
dan terakhir, kemana pun lu pergi,
gua selalu nunggu lu disini.`;

    let i = 0;

    typedMessage.textContent = "";
    signature.classList.remove("show-signature");

    const finishButton = document.getElementById("finishButton");
    finishButton.classList.remove("show-finish");

    function typeNext() {
        if (i >= message.length) {
            setTimeout(() => {
                signature.classList.add("show-signature");

                setTimeout(() => {
                    finishButton.classList.add("show-finish");
                }, 1800);
            }, 700);

            return;
        }

        const char = message.charAt(i);
        typedMessage.textContent += char;
        i++;

        let delay = 65;

        if (char === "." || char === ",") {
            delay = 300;
        } else if (char === "\n") {
            delay = 450;
        }

        finalMessage.scrollTop = finalMessage.scrollHeight;

        setTimeout(typeNext, delay);
    }

    typeNext();
}

const finishButton = document.getElementById("finishButton");

finishButton.addEventListener("click", function () {
    finalMessage.classList.remove("show-message");

    setTimeout(() => {
        typedMessage.textContent = "";
        signature.classList.remove("show-signature");
        finishButton.classList.remove("show-finish");

        const endingMessage = document.getElementById("endingMessage");
        endingMessage.classList.add("show-ending");
    }, 1500);
});
