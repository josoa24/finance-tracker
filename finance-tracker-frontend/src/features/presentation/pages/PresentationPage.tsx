import { useState, useEffect, useCallback } from "react";
import "./PresentationPage.css";

const slides = [
  {
    id: 1,
    tag: "Vue d'ensemble",
    headline: "Vos finances,\nen un seul endroit.",
    body: "Connectez votre banque, saisissez du liquide ou importez vos données. Tout est centralisé, clair et accessible.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect
          x="4"
          y="10"
          width="40"
          height="28"
          rx="4"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M4 18h40" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="30" r="3" fill="currentColor" opacity="0.4" />
        <rect
          x="20"
          y="27"
          width="16"
          height="6"
          rx="2"
          fill="currentColor"
          opacity="0.2"
        />
      </svg>
    ),
  },
  {
    id: 2,
    tag: "Suivi en temps réel",
    headline: "Chaque centime\ncompte.",
    body: "Catégorisez vos dépenses automatiquement et visualisez où va votre argent avec des graphiques épurés et lisibles.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <polyline
          points="6,36 16,24 24,30 34,14 42,20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="34" cy="14" r="3" fill="currentColor" />
        <line
          x1="6"
          y1="40"
          x2="42"
          y2="40"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.3"
        />
      </svg>
    ),
  },
  {
    id: 3,
    tag: "Objectifs",
    headline: "Épargnez\navec intention.",
    body: "Définissez vos objectifs — voyage, fonds d'urgence, retraite — et suivez votre progression jour après jour.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.3"
        />
        <circle
          cx="24"
          cy="24"
          r="12"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.5"
        />
        <circle cx="24" cy="24" r="5" fill="currentColor" />
        <line
          x1="29"
          y1="12"
          x2="36"
          y2="6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="36"
          y1="6"
          x2="36"
          y2="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="36"
          y1="6"
          x2="40"
          y2="6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 4,
    tag: "Sécurité",
    headline: "Vos données\nvous appartiennent.",
    body: "Chiffrement de bout en bout, authentification sécurisée. Votre vie financière reste strictement privée.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path
          d="M24 4L8 12v12c0 10 7 19 16 22 9-3 16-12 16-22V12L24 4z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M17 24l5 5 9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function PresentationPage() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("next");

  const goTo = useCallback(
    (index: any) => {
      if (animating || index === current) return;
      setDirection(index > current ? "next" : "prev");
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 320);
    },
    [animating, current]
  );

  const goNext = useCallback(() => {
    if (current < slides.length - 1) goTo(current + 1);
    else window.location.href = "/dashboard";
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    if (current > 0) goTo(current - 1);
  }, [current, goTo]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div className="pp-root">
      <div
        className="pp-progress"
        style={{ width: `${((current + 1) / slides.length) * 100}%` }}
      />

      <header className="pp-header">
        <span className="pp-logo">Finance Tracker</span>
        <button
          className="pp-skip"
          onClick={() => {
            try { localStorage.setItem('presentation_seen', 'true') } catch {}
            window.location.href = "/dashboard"
          }}
        >
          Passer →
        </button>
      </header>

      <main className="pp-stage">
        <div
          className={`pp-card ${
            animating ? `leaving-${direction}` : "visible"
          }`}
          key={current}
        >
          <div className="pp-icon">{slide.icon}</div>
          <div className="pp-tag">{slide.tag}</div>
          <h1 className="pp-headline">{slide.headline}</h1>
          <p className="pp-body">{slide.body}</p>

          <nav className="pp-nav" aria-label="Navigation slides">
            <div
              className="pp-dots"
              role="tablist"
              aria-label={`Slide ${current + 1} sur ${slides.length}`}
            >
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  className={`pp-dot${i === current ? " active" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Aller au slide ${i + 1}`}
                  aria-selected={i === current}
                  role="tab"
                />
              ))}
            </div>

            <button
              className="pp-btn-next"
              onClick={() => {
                if (isLast) {
                  try { localStorage.setItem('presentation_seen', 'true') } catch {}
                  window.location.href = '/dashboard'
                } else {
                  goNext()
                }
              }}
            >
              {isLast ? "Commencer" : "Suivant"}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </nav>
        </div>
      </main>

      <div className="pp-counter" aria-hidden="true">
        {String(current + 1).padStart(2, "0")} /{" "}
        {String(slides.length).padStart(2, "0")}
      </div>
    </div>
  );
}
