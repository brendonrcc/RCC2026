import React from 'react';

const NebulaBackground = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    let time = 0;
    let animationId: number;

    const handleResize = () => {
      if(canvas.parentElement) {
          width = canvas.parentElement.offsetWidth;
          height = canvas.parentElement.offsetHeight;
          const dpr = Math.min(window.devicePixelRatio || 1, 1); // Força 1.0 DPR para performance máxima na Nebula
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);
      }
    };
    
    handleResize();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 500);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      time += 0.001; // Velocidade reduzida
      
      // Fundo sólido
      ctx.fillStyle = '#050200';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';
      
      // Reduzido para 2 camadas apenas
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath();
        const scale = i * 60;
        
        // Passo de 60px para reduzir vértices drasticamente
        for (let x = 0; x <= width + 60; x += 60) {
           const y = height / 2 + 
                     Math.sin(x / 400 + time * i) * scale;
           
           if (x === 0) ctx.moveTo(x, y);
           else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = i === 1 ? `rgba(212, 175, 55, 0.08)` : `rgba(184, 134, 11, 0.05)`;
        ctx.lineWidth = 80;
        ctx.lineCap = 'round';
        // Blur via shadow é caro, usando transparência direta
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