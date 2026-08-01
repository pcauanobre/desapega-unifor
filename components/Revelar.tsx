"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  atraso?: number;
  className?: string;
};

/**
 * O QUE: wrapper de scroll-reveal: o conteúdo nasce invisível e sobe
 *        suave quando entra na tela, uma vez só (IntersectionObserver).
 * POR QUE: a LP é longa; as seções aparecendo no rolar dão vida sem
 *          precisar de lib de animação.
 * CHAMA: seções e cards da LP (app/page.tsx).
 * QUEBRA SE: nada; sem observer o conteúdo só não anima.
 */
export function Revelar({ children, atraso = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          el.classList.add("rv-visivel");
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className ? `rv ${className}` : "rv"}
      style={atraso ? { transitionDelay: `${atraso}ms` } : undefined}
    >
      {children}
    </div>
  );
}
