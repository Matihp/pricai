import { useState, useEffect } from 'react';

interface Ad {
  imageUrl: string;
  link: string;
  alt: string;
}

export default function AdCarousel() {
  const [currentAd, setCurrentAd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const ads: Ad[] = [
    {
      imageUrl: 'https://www.zimaltec.es/img/personalizacion/zimaltec/noticias/google-ads-ia.jpg',
      link: 'https://www.zimaltec.es/img/personalizacion/zimaltec/noticias/google-ads-ia.jpg',
      alt: 'Anuncio 1'
    },
    {
        imageUrl: 'https://impulsoh.com/wp-content/uploads/2024/07/Soluciones-de-Inteligencia-Artificial-de-Meta-Ads-1200x400.jpg',
        link: 'https://impulsoh.com/wp-content/uploads/2024/07/Soluciones-de-Inteligencia-Artificial-de-Meta-Ads-1200x400.jpg',
        alt: 'Anuncio 2'
      },
    // Añade más anuncios aquí
  ];

  const nextAd = () => {
    setIsTransitioning(true);
    setCurrentAd((prev) => (prev + 1) % ads.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevAd = () => {
    setIsTransitioning(true);
    setCurrentAd((prev) => (prev - 1 + ads.length) % ads.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    const timer = setInterval(nextAd, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextAd();
    } else if (isRightSwipe) {
      prevAd();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div 
      className="w-full max-w-3xl mx-auto mb-6 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <a 
        href={ads[currentAd].link}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-[7/1] hover:opacity-95 transition-opacity"
      >
        <img
          src={ads[currentAd].imageUrl}
          alt={ads[currentAd].alt}
          className={`w-full h-full object-cover transition-transform duration-500 ${isTransitioning ? 'scale-105 blur-sm' : 'scale-100'}`}
        />
      </a>

      {/* Controles de navegación */}
      <button
        onClick={prevAd}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        aria-label="Anterior anuncio"
      >
        ←
      </button>
      <button
        onClick={nextAd}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        aria-label="Siguiente anuncio"
      >
        →
      </button>

      {/* Indicadores de posición */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {ads.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setCurrentAd(index);
              setTimeout(() => setIsTransitioning(false), 500);
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${currentAd === index ? 'bg-white w-3' : 'bg-white/50'} hover:bg-white/80`}
            aria-label={`Ir al anuncio ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}