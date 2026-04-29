import React, { useEffect } from 'react';

export default function ClickFireworks() {
  useEffect(() => {
    const handleClick = (e) => {
      // 粒子颜色池：选择高饱和度颜色以增强光晕
      const colors = ['#6366f1', '#a855f7', '#38bdf8', '#fbbf24'];
      
      // 一次点击产生 15-20 个粒子（增加粒子数量）
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        
        // 强制极高层级
        particle.className = 'fixed pointer-events-none z-[99999] rounded-full';
        
        // ✨ 修改：增加粒子尺寸 (范围从 3px - 10px)
        const size = Math.random() * 7 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.backgroundColor = color;
        
        // ✨ 修改：极大增强光晕效果 (更宽的 box-shadow)
        particle.style.boxShadow = `0 0 15px 4px ${color}`;
        
        // 初始位置
        particle.style.left = `${e.clientX}px`;
        particle.style.top = `${e.clientY}px`;
        
        // ✨ 修改：增加爆炸轨迹范围 (让火花飞得更远)
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 120 + 60; // 增加速度和范围
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        // 使用原生 Web Animations API (比 CSS 动画更可靠)
        particle.animate([
          // ✨ 修改：初始 scale 设为 1.5，让它炸开时有爆发感
          { transform: 'translate(0, 0) scale(1.5)', opacity: 1 },
          { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
        ], {
          duration: 700 + Math.random() * 500, // 增加动画持续时间，让火花多飞一会儿
          easing: 'cubic-bezier(0, .9, .57, 1)',
          fill: 'forwards'
        });

        document.body.appendChild(particle);
        
        // 动画结束后移除 (增加延时以匹配动画时间)
        setTimeout(() => particle.remove(), 1200);
      }
    };

    window.addEventListener('mousedown', handleClick); 
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  return null;
}