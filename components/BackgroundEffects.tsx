import React from 'react';

const BackgroundEffects = ({ theme = 'dark' }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const mouseRef = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Configuração Otimizada para reduzir Lag
    const isMobile = width < 768;
    // Reduzido drasticamente para garantir 60fps
    const PARTICLE_COUNT = isMobile ? 30 : 80; 
    const CONNECT_DISTANCE = isMobile ? 50 : 100;
    // Limitando DPR para evitar canvas gigante em telas Retina que causam lag
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Define colors based on theme
    const isDark = theme === 'dark';
    const baseColors = isDark 
        ? ['#FFD700', '#D4AF37', '#B8860B']
        : ['#94a3b8', '#64748b'];

    const particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Velocidade constante em vez de base/interação complexa para performance
        this.vx = (Math.random() - 0.5) * 0.5; 
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 0.5;
        this.color = baseColors[Math.floor(Math.random() * baseColors.length)];
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Rect é mais rápido que Arc para desenhar
        ctx.rect(this.x, this.y, this.size, this.size);
        ctx.fill();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    let animationFrameId: number;
    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 0.5;
      
      // Otimização: Cachear strokeStyle
      const strokeColor = isDark ? 'rgba(212, 175, 55, ' : 'rgba(148, 163, 184, ';

      for (let i = 0; i < particles.length; i++) {
        const pA = particles[i];
        pA.update();
        pA.draw();

        // Loop de conexão simplificado
        // Só desenha conexões para os próximos vizinhos para evitar O(N^2) pesado
        for (let j = i + 1; j < particles.length; j++) {
          const pB = particles[j];
          const dx = pA.x - pB.x;
          // Verificação rápida de box antes de sqrt
          if (Math.abs(dx) > CONNECT_DISTANCE) continue;
          
          const dy = pA.y - pB.y;
          if (Math.abs(dy) > CONNECT_DISTANCE) continue;

          const distanceSq = dx * dx + dy * dy;
          const connDistSq = CONNECT_DISTANCE * CONNECT_DISTANCE;
          
          if (distanceSq < connDistSq) {
            const alpha = 1 - (distanceSq / connDistSq);
            // Evitar desenhar linhas muito transparentes
            if (alpha > 0.05) {
                ctx.strokeStyle = strokeColor + (alpha * 0.2) + ')';
                ctx.beginPath();
                ctx.moveTo(pA.x, pA.y);
                ctx.lineTo(pB.x, pB.y);
                ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
          width = window.innerWidth;
          height = window.innerHeight;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);
          
          const newCount = width < 768 ? 30 : 80;
          particles.length = 0;
          for (let i = 0; i < newCount; i++) particles.push(new Particle());
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        clearTimeout(resizeTimeout);
    };
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }} 
    />
  );
};

export default BackgroundEffects;