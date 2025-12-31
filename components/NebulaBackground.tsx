import React from 'react';

const NebulaBackground = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Fundo opaco para performance (não limpa transparência)
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    let time = 0;
    let animationId: number;

    const handleResize = () => {
      if(canvas.parentElement) {
          width = canvas.parentElement.offsetWidth;
          height = canvas.parentElement.offsetHeight;
          // Reduz resolução interna em telas muito grandes para performance
          const dpr = Math.min(window.devicePixelRatio || 1, 1.5); 
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);
      }
    };
    
    // Initial setup
    handleResize();

    // Debounce resize
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 200);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      time += 0.002;
      
      // Em vez de clearRect, fillRect cobre o anterior (mais rápido em alguns browsers para fundo opaco)
      // Deep Space Base
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#050200'); 
      gradient.addColorStop(1, '#1a0f00'); 
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Liquid Gold Nebula Effect
      ctx.globalCompositeOperation = 'lighter';
      
      // Reduzido para 3 camadas em vez de 4
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        const scale = i * 40;
        
        // OTIMIZAÇÃO: Aumentar o passo de x (de 20 para 30 ou 40) reduz drasticamente os cálculos trigonométricos
        for (let x = 0; x <= width + 50; x += 40) {
           const y = height / 2 + 
                     Math.sin(x / 300 + time * i) * scale + 
                     Math.cos(x / 400 - time * 2) * (scale * 0.5);
           
           if (x === 0) ctx.moveTo(x, y);
           else ctx.lineTo(x, y);
        }

        if (i % 2 === 0) {
            ctx.strokeStyle = `rgba(212, 175, 55, 0.15)`; 
            ctx.lineWidth = 40;
        } else {
            ctx.strokeStyle = `rgba(184, 134, 11, 0.1)`;
            ctx.lineWidth = 60;
        }
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Reduzir blur radius melhora performance
        ctx.shadowBlur = 15; 
        ctx.shadowColor = '#FFD700';
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default NebulaBackground;