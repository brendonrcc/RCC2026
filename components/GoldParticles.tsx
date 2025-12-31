import React, { useEffect, useRef } from 'react';

const GoldParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    
    // Performance: Limitar DPR em telas retina para evitar lag
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    
    const handleResize = () => {
      if (canvas.parentElement) {
        width = canvas.parentElement.offsetWidth;
        height = canvas.parentElement.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    // Ajustar quantidade baseada na largura da tela para mobile
    const PARTICLE_COUNT = width < 768 ? 40 : 100;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      color: string;
      alpha: number;
      baseAlpha: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedY = Math.random() * 0.8 + 0.2; // Subindo suavemente
        
        // Paleta solicitada: #FFD700, #DAA520, #FFFACD
        const colors = ['#FFD700', '#DAA520', '#FFFACD', '#FCE6C9'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.baseAlpha = Math.random() * 0.6 + 0.1;
        this.alpha = this.baseAlpha;
      }

      update() {
        // Movimento vertical (subindo)
        this.y -= this.speedY;

        // Interação com o Mouse (Repulsão suave)
        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = 150;
        const force = (maxDistance - distance) / maxDistance;

        if (distance < maxDistance) {
            this.x += forceDirectionX * force * 2;
            this.y += forceDirectionY * force * 2;
            this.alpha = Math.min(1, this.baseAlpha + 0.4); // Brilha mais perto do mouse
        } else {
            this.alpha = this.baseAlpha;
        }

        // Resetar se sair da tela (efeito loop infinito)
        if (this.y < -10) {
            this.y = height + 10;
            this.x = Math.random() * width;
        }
        // Bordas laterais
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
      }

      draw() {
        if (!ctx) return;
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Simular brilho sem filtro pesado
        ctx.globalAlpha = this.alpha * 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    let animationId: number;
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
          p.update();
          p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
        // Ajustar coordenadas do mouse relativas ao canvas/hero section
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = { 
            x: e.clientX - rect.left, 
            y: e.clientY - rect.top 
        };
    };
    
    // Adicionar listener no window ou container pai para melhor UX
    document.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
      style={{ zIndex: 1 }} 
    />
  );
};

export default GoldParticles;