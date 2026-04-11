'use client';

import React from 'react';
import Link from 'next/link';

export function ProjectShareClient({ project }) {
  const images = project.project_images || [];
  const title = project.title || 'Project';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <p style={{ marginBottom: '1rem' }}>
        <Link href="/">← Back to portfolio</Link>
      </p>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{title}</h1>
      {project.category ? (
        <p style={{ opacity: 0.8, marginBottom: '1rem' }}>{project.category}</p>
      ) : null}
      {project.description ? <p style={{ marginBottom: '1rem' }}>{project.description}</p> : null}
      {project.overview ? (
        <div style={{ marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{project.overview}</div>
      ) : null}
      {images.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {images.map((img) => (
            <figure key={img.id || img.url}>
              <img
                src={img.url}
                alt={img.caption || title}
                style={{ width: '100%', borderRadius: 8 }}
              />
              {img.caption ? <figcaption style={{ fontSize: '0.875rem' }}>{img.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      ) : null}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {project.live_url ? (
          <a href={project.live_url} target="_blank" rel="noopener noreferrer">
            Live site
          </a>
        ) : null}
        {project.github_url ? (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
            Source
          </a>
        ) : null}
      </div>
    </div>
  );
}
