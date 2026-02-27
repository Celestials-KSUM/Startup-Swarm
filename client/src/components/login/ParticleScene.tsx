'use client';
import { useEffect, useRef } from 'react';

export default function ParticleScene() {
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = canvasRef.current;
        if (!container) return;

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.async = true;
        script.onload = () => init(container);
        document.head.appendChild(script);

        function init(el: HTMLDivElement) {
            const THREE = (window as any).THREE;
            const W = el.clientWidth, H = el.clientHeight;
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(W, H);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setClearColor(0x000000, 0);
            el.appendChild(renderer.domElement);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
            camera.position.z = 5;

            // Particle geometry
            const count = 280;
            const pos = new Float32Array(count * 3);
            const col = new Float32Array(count * 3);
            const palette = [[0.15, 0.38, 0.92], [0.23, 0.51, 0.96], [0.54, 0.36, 0.96]];
            for (let i = 0; i < count; i++) {
                const r = 2.2 + Math.random() * 0.6;
                const theta = Math.acos(2 * Math.random() - 1);
                const phi = Math.random() * Math.PI * 2;
                pos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
                pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
                pos[i * 3 + 2] = r * Math.cos(theta);
                const c = palette[i % 3];
                col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
            const mat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.85 });
            const points = new THREE.Points(geo, mat);
            scene.add(points);

            // Lines
            const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.12 });
            for (let i = 0; i < 60; i++) {
                const a = Math.floor(Math.random() * count) * 3;
                const b = Math.floor(Math.random() * count) * 3;
                const lg = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(pos[a], pos[a + 1], pos[a + 2]),
                    new THREE.Vector3(pos[b], pos[b + 1], pos[b + 2]),
                ]);
                scene.add(new THREE.Line(lg, lineMat));
            }

            let mouse = { x: 0, y: 0 };
            const onMouse = (e: MouseEvent) => {
                mouse.x = (e.clientX / window.innerWidth - 0.5) * 0.5;
                mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.5;
            };
            window.addEventListener('mousemove', onMouse);
            let t = 0;
            const animate = () => {
                t += 0.004;
                points.rotation.y = t * 0.3 + mouse.x;
                points.rotation.x = t * 0.1 + mouse.y;
                renderer.render(scene, camera);
                return requestAnimationFrame(animate);
            };
            const raf = animate();
            return () => {
                cancelAnimationFrame(raf);
                window.removeEventListener('mousemove', onMouse);
                renderer.dispose();
            };
        }
        return () => {
            const existingScript = document.querySelector(`script[src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"]`);
            if (existingScript && existingScript.parentNode) {
                existingScript.parentNode.removeChild(existingScript);
            }
        };
    }, []);

    return <div ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
