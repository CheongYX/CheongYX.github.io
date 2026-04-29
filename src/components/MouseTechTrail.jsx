import React, { useEffect, useRef } from 'react';

export default function MouseTechTrail() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    
    // 基础坐标
    let mouseX = 0;
    let mouseY = 0;
    // 延迟跟随坐标 (让轨迹有“灵动”感)
    let ballX = 0;
    let ballY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // 瞬间移动小圆点
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    // 使用物理平滑算法
    const animate = () => {
      // 这里的 0.15 决定了跟随的“粘性”，数值越小越丝滑，越大越紧跟
      ballX += (mouseX - ballX) * 0.15;
      ballY += (mouseY - ballY) * 0.15;

      cursor.style.transform = `translate3d(${ballX}px, ${ballY}px, 0)`;
      
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    const animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      {/* 主光标：带光晕的空心圆 */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 border border-indigo-500/50 rounded-full pointer-events-none z-[9999] -ml-4 -mt-4 transition-opacity duration-300"
        style={{ willChange: 'transform' }}
      />
      {/* 中心点：实心强光点 */}
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 w-1 h-1 bg-indigo-500 rounded-full pointer-events-none z-[9999] -ml-0.5 -mt-0.5"
        style={{ willChange: 'transform' }}
      />
    </>
  );
}