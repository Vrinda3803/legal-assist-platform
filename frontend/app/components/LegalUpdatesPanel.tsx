"use client";

import { useEffect, useState } from "react";

type LegalNewsItem = {
  title: string;
  link: string;
  published: string;
  source: string;
};

type LegalUpdatesPanelProps = {
  items: LegalNewsItem[];
};

export default function LegalUpdatesPanel({ items }: LegalUpdatesPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [items]);

  const activeItem = items.length > 0 ? items[activeIndex] : null;

  return (
    <div className="card">
      <div className="card-header-row">
        <h2 className="card-title">Legal Updates</h2>
        {items.length > 1 && (
          <span className="muted-text">
            {activeIndex + 1}/{items.length}
          </span>
        )}
      </div>

      {activeItem ? (
        <a
          href={activeItem.link}
          target="_blank"
          rel="noreferrer"
          className="news-hero"
        >
          <div className="news-pill">Latest legal news</div>
          <h3 className="news-title">{activeItem.title}</h3>
          <div className="news-meta">
            <span>{activeItem.source}</span>
            <span>{activeItem.published}</span>
          </div>
        </a>
      ) : (
        <div className="list-item">
          No legal updates available right now. Try again later or check your news API source.
        </div>
      )}

      {items.length > 1 && (
        <div className="news-dots">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`news-dot ${index === activeIndex ? "news-dot-active" : ""}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}