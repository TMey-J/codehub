import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
    const coreRef = useRef(null);
    const haloRef = useRef(null);

    useEffect(() => {
        // غیرفعال کردن نشانگر روی دستگاه‌های لمسی
        if (window.matchMedia("(pointer: coarse)").matches) return;

        let mouseX = 0;
        let mouseY = 0;
        let haloX = 0;
        let haloY = 0;
        const CORE_SIZE = 6;
        const HALO_SIZE = 36;

        const move = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (coreRef.current) {
                coreRef.current.style.transform = `translate3d(
                    ${mouseX - CORE_SIZE / 2}px,
                    ${mouseY - CORE_SIZE / 2}px,
                    0
                )`;
            }
        };

        const animateHalo = () => {
            haloX += (mouseX - haloX) * 0.08;
            haloY += (mouseY - haloY) * 0.08;
            
            if (haloRef.current) {
                haloRef.current.style.transform = `translate3d(
                    ${haloX - HALO_SIZE / 2}px,
                    ${haloY - HALO_SIZE / 2}px,
                    0
                )`;
            }
            requestAnimationFrame(animateHalo);
        };

        animateHalo();
        window.addEventListener("mousemove", move);
        
        return () => window.removeEventListener("mousemove", move);
    }, []);

    return (
        <>
            <div ref={haloRef} className="ch-cursor-halo" />
            <div ref={coreRef} className="ch-cursor-core" />
        </>
    );
};

export default CustomCursor;