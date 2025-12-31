import React from 'react';

const BackgroundEffects = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const mouseRef = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true }); // Alpha true para fundo transparente
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Configuração Otimizada
    const isMobile = width < 768;
    const PARTICLE_COUNT = isMobile ? 60 : 130; // Reduzido para mobile
    const CONNECT_DISTANCE = isMobile ? 60 : 100;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Limita DPR a 2x para economizar GPU

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      density: number;
      color: string;
      alpha: number;
      pulseSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 0.5;
        this.density = (Math.random() * 30) + 1;
        
        const colors = ['#FFD700', '#FBF5B7', '#D4AF37', '#FFFFFF', '#B8860B'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.alpha = Math.random() * 0.5 + 0.1;
        this.pulseSpeed = 0.02;
      }

      draw() {
        if (!ctx) return;
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      update() {
        // Mouse Interaction Otimizada
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        
        // Só calcula física se o mouse estiver perto (Otimização)
        if (Math.abs(dx) < 200 && Math.abs(dy) < 200) {
            const mouseNormX = (mouseRef.current.x / width) * 2 - 1;
            const mouseNormY = (mouseRef.current.y / height) * 2 - 1;
            const moveX = mouseNormX * this.density * 2; 
            const moveY = mouseNormY * this.density * 2;
            this.x += (this.baseX - moveX - this.x) * 0.05;
            this.y += (this.baseY - moveY - this.y) * 0.05;
        } else {
             // Retorno suave à base se longe do mouse
             if (Math.abs(this.x - this.baseX) > 0.1) this.x += (this.baseX - this.x) * 0.05;
             if (Math.abs(this.y - this.baseY) > 0.1) this.y += (this.baseY - this.y) * 0.05;
        }

        // Twinkle effect
        this.alpha += this.pulseSpeed;
        if (this.alpha > 0.8 || this.alpha < 0.1) this.pulseSpeed = -this.pulseSpeed;
      }
    }

    // Inicialização
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    let animationFrameId: number;
    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Clear Otimizado: Não redesenha gradiente, apenas limpa
      ctx.clearRect(0, 0, width, height);

      // Batch draw lines (Otimização)
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 0.5;
      
      // Loop Otimizado
      for (let a = 0; a < particles.length; a++) {
        const pA = particles[a];
        pA.update();
        pA.draw();

        // Linhas de conexão
        for (let b = a + 1; b < particles.length; b++) {
          const pB = particles[b];
          // Check rápido de distância (Box check) antes da Raiz Quadrada (Cara)
          if (Math.abs(pA.x - pB.x) > CONNECT_DISTANCE) continue; 
          if (Math.abs(pA.y - pB.y) > CONNECT_DISTANCE) continue;

          const dx = pA.x - pB.x;
          const dy = pA.y - pB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < CONNECT_DISTANCE) {
            ctx.globalAlpha = 0.1 * (1 - distance / CONNECT_DISTANCE);
            ctx.beginPath();
            ctx.moveTo(pA.x, pA.y);
            ctx.lineTo(pB.x, pB.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
        // Throttle simples: atualizar ref é barato, mas cálculos complexos ficam no animate
        mouseRef.current = { x: e.clientX, y: e.clientY };
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
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          
          const newCount = width < 768 ? 60 : 130;
          particles.length = 0;
          for (let i = 0; i < newCount; i++) particles.push(new Particle());
      }, 200); // Debounce resize
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrameId);
        clearTimeout(resizeTimeout);
    };
  }, []);

  // O gradiente vai para o CSS da div pai ou do body para evitar repaint no canvas
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }} 
    />
  );
};

export default BackgroundEffects;