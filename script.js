// Efficient Complex Interactive System
(() => {
    'use strict';

    // === PARTICLE SYSTEM ===
    class ParticleSystem {
        constructor() {
            this.canvas = document.getElementById('particles');
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.mouse = { x: 0, y: 0 };
            this.resize();
            this.init();
            this.setupEvents();
            this.animate();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        init() {
            const count = Math.min(100, Math.floor(window.innerWidth / 10));
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 1,
                    color: `hsl(${Math.random() * 60 + 180}, 100%, 60%)`
                });
            }
        }

        setupEvents() {
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
        }

        draw() {
            this.ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach((p, i) => {
                // Mouse interaction
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    p.vx += dx * 0.00005;
                    p.vy += dy * 0.00005;
                }

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Boundaries
                if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();

                // Connect nearby particles
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        this.ctx.strokeStyle = `rgba(0, 240, 255, ${1 - dist / 100})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.stroke();
                    }
                }
            });
        }

        animate() {
            this.draw();
            requestAnimationFrame(() => this.animate());
        }
    }

    // === CUSTOM CURSOR ===
    class Cursor {
        constructor() {
            this.cursor = document.getElementById('cursor-trail');
            this.pos = { x: 0, y: 0 };
            this.target = { x: 0, y: 0 };
            this.setupEvents();
            this.animate();
        }

        setupEvents() {
            document.addEventListener('mousemove', (e) => {
                this.target.x = e.clientX;
                this.target.y = e.clientY;
            });

            document.addEventListener('mousedown', () => {
                this.cursor.style.transform = 'scale(0.8)';
            });

            document.addEventListener('mouseup', () => {
                this.cursor.style.transform = 'scale(1)';
            });
        }

        animate() {
            this.pos.x += (this.target.x - this.pos.x) * 0.1;
            this.pos.y += (this.target.y - this.pos.y) * 0.1;

            this.cursor.style.left = this.pos.x + 'px';
            this.cursor.style.top = this.pos.y + 'px';

            requestAnimationFrame(() => this.animate());
        }
    }

    // === TYPING EFFECT ===
    class TypeWriter {
        constructor(element, texts, speed = 100) {
            this.element = element;
            this.texts = texts;
            this.speed = speed;
            this.textIndex = 0;
            this.charIndex = 0;
            this.isDeleting = false;
            this.type();
        }

        type() {
            const current = this.texts[this.textIndex];

            if (this.isDeleting) {
                this.element.textContent = current.substring(0, this.charIndex - 1);
                this.charIndex--;
            } else {
                this.element.textContent = current.substring(0, this.charIndex + 1);
                this.charIndex++;
            }

            let timeout = this.speed;

            if (this.isDeleting) {
                timeout /= 2;
            }

            if (!this.isDeleting && this.charIndex === current.length) {
                timeout = 2000;
                this.isDeleting = true;
            } else if (this.isDeleting && this.charIndex === 0) {
                this.isDeleting = false;
                this.textIndex = (this.textIndex + 1) % this.texts.length;
                timeout = 500;
            }

            setTimeout(() => this.type(), timeout);
        }
    }

    // === SCROLL ANIMATIONS ===
    class ScrollAnimations {
        constructor() {
            this.observer = new IntersectionObserver(
                (entries) => entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                }),
                { threshold: 0.1 }
            );
            this.observe();
        }

        observe() {
            document.querySelectorAll('[data-scroll]').forEach(el => this.observer.observe(el));
            document.querySelectorAll('.skill-card').forEach((el, i) => {
                this.observer.observe(el);
                el.style.transitionDelay = `${i * 0.1}s`;
                const skill = el.dataset.skill;
                if (skill) {
                    el.style.setProperty('--skill-width', skill + '%');
                }
            });
            document.querySelectorAll('[data-reveal]').forEach((el, i) => {
                this.observer.observe(el);
                el.style.transitionDelay = `${i * 0.1}s`;
            });
        }
    }

    // === 3D TILT EFFECT ===
    class TiltEffect {
        constructor() {
            this.cards = document.querySelectorAll('[data-tilt]');
            this.init();
        }

        init() {
            this.cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = (y - centerY) / 10;
                    const rotateY = (centerX - x) / 10;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                });
            });
        }
    }

    // === PARALLAX EFFECT ===
    class Parallax {
        constructor() {
            this.hero = document.querySelector('.hero-bg');
            this.init();
        }

        init() {
            window.addEventListener('scroll', () => {
                const scroll = window.pageYOffset;
                this.hero.style.transform = `translateY(${scroll * 0.5}px)`;
            });
        }
    }

    // === SMOOTH SCROLL ===
    class SmoothScroll {
        constructor() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(anchor.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });
        }
    }

    // === FORM HANDLER ===
    class FormHandler {
        constructor() {
            this.form = document.getElementById('contactForm');
            if (this.form) this.init();
        }

        init() {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();

                const formData = new FormData(this.form);
                const data = Object.fromEntries(formData);

                // Simulate form submission
                this.showMessage('Message sent successfully!', 'success');
                this.form.reset();
            });
        }

        showMessage(text, type) {
            const msg = document.createElement('div');
            msg.textContent = text;
            msg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 2rem;
                background: ${type === 'success' ? 'var(--primary)' : 'var(--secondary)'};
                color: var(--bg);
                border-radius: 10px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 3000);
        }
    }

    // === BUTTON RIPPLE EFFECT ===
    class RippleEffect {
        constructor() {
            document.querySelectorAll('.btn, .btn-small').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const ripple = document.createElement('span');
                    ripple.style.cssText = `
                        position: absolute;
                        left: ${x}px;
                        top: ${y}px;
                        width: 0;
                        height: 0;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.6);
                        transform: translate(-50%, -50%);
                        animation: ripple 0.6s ease-out;
                    `;

                    btn.style.position = 'relative';
                    btn.style.overflow = 'hidden';
                    btn.appendChild(ripple);

                    setTimeout(() => ripple.remove(), 600);
                });
            });
        }
    }

    // === NAV SCROLL EFFECT ===
    class NavScroll {
        constructor() {
            this.nav = document.querySelector('.nav');
            this.init();
        }

        init() {
            let lastScroll = 0;
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;

                if (currentScroll > 100) {
                    this.nav.style.background = 'rgba(10, 10, 15, 0.95)';
                    this.nav.style.boxShadow = '0 5px 20px rgba(0, 240, 255, 0.1)';
                } else {
                    this.nav.style.background = 'rgba(10, 10, 15, 0.8)';
                    this.nav.style.boxShadow = 'none';
                }

                lastScroll = currentScroll;
            });
        }
    }

    // === INITIALIZE ALL ===
    window.addEventListener('DOMContentLoaded', () => {
        // Initialize all systems
        new ParticleSystem();
        new Cursor();
        new ScrollAnimations();
        new TiltEffect();
        new Parallax();
        new SmoothScroll();
        new FormHandler();
        new RippleEffect();
        new NavScroll();

        // Typing effect for hero
        const typingElement = document.querySelector('.typing-text');
        if (typingElement) {
            new TypeWriter(typingElement, [
                'Creative Developer',
                'UI/UX Designer',
                'Digital Artist',
                'Innovation Maker'
            ], 100);
        }

        // Add ripple animation keyframe
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    width: 300px;
                    height: 300px;
                    opacity: 0;
                }
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        // Performance monitoring
        console.log('%c✨ Digital Visionary Portfolio Loaded', 'color: #00f0ff; font-size: 16px; font-weight: bold;');
    });
})();
