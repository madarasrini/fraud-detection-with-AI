
export const initBackgroundAnimation = (canvas: HTMLCanvasElement): (() => void) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    let animationFrameId: number;
    let particles: Particle[] = [];

    const mouse = {
        x: -1000,
        y: -1000,
        radius: 150
    };

    class Particle {
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;
        color: string;

        constructor(x: number, y: number, size: number, speedX: number, speedY: number, color: string) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.speedX = speedX;
            this.speedY = speedY;
            this.color = color;
        }

        draw() {
            if (!ctx) return;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.speedX = -this.speedX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.speedY = -this.speedY;
            }
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse interaction
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = mouse.radius;
                const force = (maxDistance - distance) / maxDistance;
                const directionX = forceDirectionX * force * -1.5; // Increased repulsion
                const directionY = forceDirectionY * force * -1.5;
                this.x += directionX;
                this.y += directionY;
            }
        }
    }
    
    const initParticles = () => {
        particles = [];
        const numberOfParticles = (canvas.height * canvas.width) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            const size = Math.random() * 2 + 1;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const speedX = (Math.random() * 0.4) - 0.2;
            const speedY = (Math.random() * 0.4) - 0.2;
            const color = 'rgba(0, 194, 255, 0.8)';
            particles.push(new Particle(x, y, size, speedX, speedY, color));
        }
    };

    const connectParticles = () => {
        if (!ctx) return;
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    opacityValue = 1 - (distance / 100);
                    ctx.strokeStyle = `rgba(0, 194, 255, ${opacityValue})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    };

    const animate = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const particle of particles) {
            particle.update();
            particle.draw();
        }
        connectParticles();
        animationFrameId = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles(); // Re-initialize particles on resize for better density
    };

    const mouseMoveHandler = (event: MouseEvent) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    };

    const mouseLeaveHandler = () => {
        mouse.x = -1000;
        mouse.y = -1000;
    };

    // Setup
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('mouseleave', mouseLeaveHandler);
    
    resizeCanvas();
    animate();

    // Cleanup function
    return () => {
        window.removeEventListener('resize', resizeCanvas);
        canvas.removeEventListener('mousemove', mouseMoveHandler);
        canvas.removeEventListener('mouseleave', mouseLeaveHandler);
        cancelAnimationFrame(animationFrameId);
    };
};
