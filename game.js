// game.js

const container = document.getElementById('animation-container');
const elements = document.querySelectorAll('.bouncing-element');
const elementData = [];
let score = 0;

elements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const data = {
        el: element,
        width: rect.width,
        height: rect.height,
        x: Math.random() * (container.clientWidth - rect.width),
        y: Math.random() * (container.clientHeight - rect.height),
        vx: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2),
        vy: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2),
        collisionWidth: rect.width,
        collisionHeight: rect.height,
    };

    if (element.id === 'disc-logo') {
        data.collisionWidth = rect.width * 0.3;
        data.collisionHeight = rect.height * 0.3;
    }

    element.addEventListener('click', () => {
        element.style.display = 'none';
        score++;
        updateScore();
        setTimeout(() => {
            element.style.display = 'block';
            data.x = Math.random() * (container.clientWidth - data.width);
            data.y = Math.random() * (container.clientHeight - data.height);
            data.vx = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2);
            data.vy = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2);
        }, 1000);
    });

    elementData.push(data);
});

const scoreDisplay = document.createElement('div');
scoreDisplay.id = 'score-display';
scoreDisplay.textContent = 'Score: 0';
container.appendChild(scoreDisplay);

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function animate() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    elementData.forEach((data, index) => {
        if (data.el.style.display === 'none') return;

        data.x += data.vx;
        data.y += data.vy;

        if (data.x <= 0) {
            data.x = 0;
            data.vx = -data.vx;
        } else if (data.x + data.width >= containerWidth) {
            data.x = containerWidth - data.width;
            data.vx = -data.vx;
        }

        if (data.y <= 0) {
            data.y = 0;
            data.vy = -data.vy;
        } else if (data.y + data.height >= containerHeight) {
            data.y = containerHeight - data.height;
            data.vy = -data.vy;
        }

        for (let j = index + 1; j < elementData.length; j++) {
            const other = elementData[j];
            if (other.el.style.display === 'none') continue;
            if (isColliding(data, other)) {
                [data.vx, other.vx] = [other.vx, data.vx];
                [data.vy, other.vy] = [other.vy, data.vy];
            }
        }

        data.el.style.transform = `translate(${data.x}px, ${data.y}px)`;
    });

    requestAnimationFrame(animate);
}

function isColliding(a, b) {
    return !(
        a.x + a.collisionWidth < b.x ||
        a.x > b.x + b.collisionWidth ||
        a.y + a.collisionHeight < b.y ||
        a.y > b.y + b.collisionHeight
    );
}

animate();
