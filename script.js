class Particle {
    constructor(canvas, mouseX, mouseY) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.baseSpeedX = Math.random() * 0.8 - 0.4;
        this.baseSpeedY = Math.random() * 0.8 - 0.4;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.mouseInfluence = 0;
        this.mouseX = mouseX;
        this.mouseY = mouseY;
    }

    update(mouseX, mouseY) {
        this.mouseX = mouseX;
        this.mouseY = mouseY;

        // Calculate distance from mouse
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
            // Calculate mouse influence
            this.mouseInfluence = (1 - distance / maxDistance) * 2;
            
            // Add mouse influence to speed
            const angle = Math.atan2(dy, dx);
            this.speedX = this.baseSpeedX + Math.cos(angle) * this.mouseInfluence;
            this.speedY = this.baseSpeedY + Math.sin(angle) * this.mouseInfluence;
        } else {
            // Reset to base speed when far from mouse
            this.speedX = this.baseSpeedX;
            this.speedY = this.baseSpeedY;
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x > this.canvas.width) this.x = 0;
        if (this.x < 0) this.x = this.canvas.width;
        if (this.y > this.canvas.height) this.y = 0;
        if (this.y < 0) this.y = this.canvas.height;
    }

    draw(ctx) {
        const color = document.body.classList.contains('light') ? '0, 0, 0' : '255, 255, 255';
        ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.numberOfParticles = 70;
        this.mousePosition = { x: null, y: null };
        this.init();
        this.animate();

        // Mouse move event
        window.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.x;
            this.mousePosition.y = e.y;
        });

        // Resize event
        window.addEventListener('resize', () => this.resize());
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this.canvas, this.mousePosition.x, this.mousePosition.y));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.update(this.mousePosition.x, this.mousePosition.y);
            particle.draw(this.ctx);
        });

        this.connectParticles();
        requestAnimationFrame(() => this.animate());
    }

    connectParticles() {
        const color = document.body.classList.contains('light') ? '0, 0, 0' : '255, 255, 255';
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(${color}, ${0.2 * (1 - distance / 120)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

// Theme toggle functionality
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme based on user preference
    document.body.classList.toggle('dark', prefersDark);
    document.body.classList.toggle('light', !prefersDark);

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light');
        document.body.classList.toggle('dark');
    });
}

// Update local time
function updateLocalTime() {
    const timeElement = document.getElementById('local-time');
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    timeElement.textContent = `Local Time ${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Initialize everything when the page loads
window.addEventListener('load', () => {
    new ParticleSystem();
    initializeTheme();
    updateLocalTime();
    setInterval(updateLocalTime, 60000);
});