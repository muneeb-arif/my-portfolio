import React, { useEffect, useRef } from 'react';
import './DynamicSection.css';

const DynamicSection = ({ section }) => {
  if (!section || !section.is_visible) {
    return null;
  }

  const sectionStyle = {
    paddingTop: `${section.padding_top || 80}px`,
    paddingBottom: `${section.padding_bottom || 80}px`,
    backgroundColor: section.background_color || 'transparent',
    backgroundImage: section.background_image_url ? `url(${section.background_image_url})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const renderContent = () => {
    switch (section.section_type) {
      case 'title':
        return (
          <div className={`dynamic-section-title dynamic-section-${section.alignment || 'center'}`}>
            <h1>{section.title}</h1>
          </div>
        );

      case 'subtitle':
        return (
          <div className={`dynamic-section-subtitle dynamic-section-${section.alignment || 'center'}`}>
            <h2>{section.title}</h2>
            {section.subtitle && <h3>{section.subtitle}</h3>}
          </div>
        );

      case 'image_text':
        return (
          <div className={`dynamic-section-image-text dynamic-section-${section.alignment || 'center'}`}>
            <div className="image-text-container">
              {section.image_url && (
                <div className="image-text-image">
                  <img src={section.image_url} alt={section.title || 'Section image'} />
                </div>
              )}
              <div className="image-text-content">
                {section.title && <h2>{section.title}</h2>}
                {section.subtitle && <h3>{section.subtitle}</h3>}
                {section.content && (
                  <div 
                    className="image-text-text"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 'text_image':
        return (
          <div className={`dynamic-section-text-image dynamic-section-${section.alignment || 'center'}`}>
            <div className="text-image-container">
              <div className="text-image-content">
                {section.title && <h2>{section.title}</h2>}
                {section.subtitle && <h3>{section.subtitle}</h3>}
                {section.content && (
                  <div 
                    className="text-image-text"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
              </div>
              {section.image_url && (
                <div className="text-image-image">
                  <img src={section.image_url} alt={section.title || 'Section image'} />
                </div>
              )}
            </div>
          </div>
        );

      case 'image_only':
        return (
          <div className={`dynamic-section-image-only dynamic-section-${section.alignment || 'center'}`}>
            {section.image_url && (
              <img src={section.image_url} alt={section.title || 'Section image'} />
            )}
          </div>
        );

      case 'video_only':
        return (
          <div className={`dynamic-section-video-only dynamic-section-${section.alignment || 'center'}`}>
            {section.video_url && (
              <div className="video-container">
                {renderVideo(section.video_url)}
              </div>
            )}
          </div>
        );

      case 'text_only':
        return (
          <div className={`dynamic-section-text-only dynamic-section-${section.alignment || 'center'}`}>
            {section.title && <h2>{section.title}</h2>}
            {section.subtitle && <h3>{section.subtitle}</h3>}
            {section.content && (
              <div 
                className="text-only-content"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
          </div>
        );

      case 'accordion':
        // Parse accordion_items if it's a string
        let accordionItems = section.accordion_items;
        if (typeof accordionItems === 'string') {
          try {
            accordionItems = JSON.parse(accordionItems);
          } catch (e) {
            console.error('Error parsing accordion_items:', e);
            accordionItems = [];
          }
        }
        
        return (
          <div className={`dynamic-section-accordion dynamic-section-${section.alignment || 'center'}`}>
            {section.title && <h2>{section.title}</h2>}
            {section.subtitle && <h3>{section.subtitle}</h3>}
            {accordionItems && Array.isArray(accordionItems) && accordionItems.length > 0 && (
              <div className="accordion-container">
                {accordionItems.map((item, index) => (
                  <AccordionItem key={index} title={item.title} content={item.content} />
                ))}
              </div>
            )}
          </div>
        );

      case 'social_embed':
        return (
          <div className={`dynamic-section-social-embed dynamic-section-${section.alignment || 'center'}`}>
            {section.title && <h2>{section.title}</h2>}
            {section.embed_url && (
              <div className="social-embed-container">
                {renderSocialEmbed(section.embed_type, section.embed_url)}
                {/* Show warning for Facebook share URLs */}
                {section.embed_type === 'facebook_post' && section.embed_url.includes('/share/p/') && (
                  <div className="social-embed-warning">
                    <p>⚠️ Facebook share URLs may not embed correctly. Please use the full post URL from the post's permalink.</p>
                    <p><small>To get the full URL: Click the timestamp on the Facebook post, then copy the URL from your browser.</small></p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'map_embed':
        return (
          <div className={`dynamic-section-map-embed dynamic-section-${section.alignment || 'center'}`}>
            {section.title && <h2>{section.title}</h2>}
            {section.embed_url && (
              <div className="map-embed-container">
                <iframe
                  src={section.embed_url}
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        );

      case 'code_snippet':
        return (
          <div className={`dynamic-section-code-snippet dynamic-section-${section.alignment || 'center'}`}>
            {section.title && <h2>{section.title}</h2>}
            {section.content && (
              <pre className="code-snippet-content">
                <code>{section.content}</code>
              </pre>
            )}
          </div>
        );

      case 'custom_html':
        return (
          <div className={`dynamic-section-custom-html dynamic-section-${section.alignment || 'center'}`}>
            {section.embed_code && (
              <div 
                className="custom-html-content"
                dangerouslySetInnerHTML={{ __html: section.embed_code }}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderVideo = (url) => {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        return (
          <iframe
            width="100%"
            height="500"
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = extractVimeoId(url);
      if (videoId) {
        return (
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            width="100%"
            height="500"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }
    
    // Direct video URL
    return (
      <video controls width="100%" style={{ maxHeight: '500px' }}>
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };

  const renderSocialEmbed = (embedType, url) => {
    if (!url) return null;

    // Facebook Page Feed
    if (embedType === 'facebook_page_feed') {
      return <FacebookPageFeed url={url} />;
    }

    // Facebook Post
    if (embedType === 'facebook_post' || embedType === 'facebook_video') {
      // Facebook share URLs (e.g., https://www.facebook.com/share/p/1Bgq1ruJ1E/) 
      // cannot be embedded directly. User needs to use the full post URL.
      // We'll try to use the share URL anyway, but it may not work.
      let facebookUrl = url;
      
      // Handle Facebook share URLs - these typically don't work for embedding
      if (url.includes('/share/p/')) {
        // Share URLs don't work with Facebook's embed plugin
        // Show a message and try to use the URL anyway
        console.warn('Facebook share URLs may not embed correctly. Please use the full post URL instead.');
        facebookUrl = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`;
      } else if (!url.includes('plugins/post.php') && !url.includes('plugins/video.php')) {
        // If it's a regular Facebook post URL, convert to embed format
        if (embedType === 'facebook_video') {
          facebookUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=true&width=500`;
        } else {
          facebookUrl = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`;
        }
      }

      return (
        <div className="social-embed-facebook">
          <iframe
            src={facebookUrl}
            width="100%"
            height="600"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowTransparency="true"
            allow="encrypted-media"
            loading="lazy"
          />
        </div>
      );
    }

    // Instagram Feed
    if (embedType === 'instagram_feed') {
      // Instagram Feed - using Instagram's embed approach
      // Extract username from URL or direct username input
      let username = url;
      
      // Handle different input formats
      if (username.includes('instagram.com/')) {
        // Extract username from URL
        const match = username.match(/instagram\.com\/([^\/\?]+)/);
        username = match ? match[1].replace('@', '') : username.replace('@', '');
      } else {
        // Remove @ if present
        username = username.replace(/^@/, '').trim();
      }
      
      // Instagram doesn't have a native feed embed, so we'll create a grid of recent posts
      // For a proper feed, users should use Custom HTML with third-party embed code
      // But we can provide a link to the profile and suggest using Custom HTML
      return (
        <div className="social-embed-instagram-feed">
          <div className="instagram-feed-info">
            <p>📸 Instagram Feed for <strong>@{username}</strong></p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              For a full Instagram feed widget, please use the <strong>"Custom HTML"</strong> section type 
              and paste embed code from services like:
            </p>
            <ul style={{ fontSize: '14px', color: '#666', marginTop: '10px', textAlign: 'left', display: 'inline-block' }}>
              <li><a href="https://elfsight.com/instagram-feed-widget/" target="_blank" rel="noopener noreferrer">Elfsight</a></li>
              <li><a href="https://onstipe.com/" target="_blank" rel="noopener noreferrer">Onstipe</a></li>
              <li><a href="https://embedsocial.com/" target="_blank" rel="noopener noreferrer">EmbedSocial</a></li>
            </ul>
            <div style={{ marginTop: '20px' }}>
              <a 
                href={`https://www.instagram.com/${username}/`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-block', 
                  padding: '10px 20px', 
                  background: '#E4405F', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                View Instagram Profile →
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Instagram Post/Reel
    if (embedType === 'instagram_post' || embedType === 'instagram_reel') {
      return <InstagramEmbed url={url} />;
    }

    // Twitter/X
    if (embedType === 'twitter') {
      // Twitter requires their embed SDK or oEmbed API
      // For now, provide a link fallback
      return (
        <div className="social-embed-twitter">
          <blockquote className="twitter-tweet" data-theme="light">
            <a href={url}>View on Twitter</a>
          </blockquote>
          <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
        </div>
      );
    }

    // TikTok
    if (embedType === 'tiktok') {
      const tiktokId = extractTikTokId(url);
      if (tiktokId) {
        return (
          <div className="social-embed-tiktok">
            <blockquote
              className="tiktok-embed"
              cite={url}
              data-video-id={tiktokId}
              style={{ maxWidth: '100%', minWidth: '325px' }}
            >
              <section>
                <a target="_blank" title={tiktokId} href={url}>
                  View on TikTok
                </a>
              </section>
            </blockquote>
            <script async src="https://www.tiktok.com/embed.js"></script>
          </div>
        );
      }
    }

    // LinkedIn
    if (embedType === 'linkedin') {
      return (
        <div className="social-embed-linkedin">
          <iframe
            src={`https://www.linkedin.com/embed/feed/post/${extractLinkedInId(url)}`}
            width="100%"
            height="600"
            frameBorder="0"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }

    // Pinterest
    if (embedType === 'pinterest') {
      return (
        <div className="social-embed-pinterest">
          <a
            data-pin-do="embedPin"
            data-pin-width="large"
            href={url}
          />
          <script async defer src="//assets.pinterest.com/js/pinit.js"></script>
        </div>
      );
    }

    // YouTube (for social embed type)
    if (embedType === 'youtube') {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        return (
          <div className="social-embed-youtube">
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${videoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    // Vimeo (for social embed type)
    if (embedType === 'vimeo') {
      const videoId = extractVimeoId(url);
      if (videoId) {
        return (
          <div className="social-embed-vimeo">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}`}
              width="100%"
              height="500"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    // Fallback: generic iframe
    return (
      <div className="social-embed-iframe">
        <iframe
          src={url}
          width="100%"
          height="500"
          frameBorder="0"
          scrolling="no"
          loading="lazy"
        />
      </div>
    );
  };

  const extractInstagramId = (url) => {
    // Extract Instagram post ID from URL
    // Format: https://www.instagram.com/p/POST_ID/
    const match = url.match(/instagram\.com\/p\/([^\/\?]+)/);
    return match ? match[1] : null;
  };

  const extractTikTokId = (url) => {
    // Extract TikTok video ID from URL
    // Format: https://www.tiktok.com/@username/video/VIDEO_ID
    const match = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
    return match ? match[1] : null;
  };

  const extractLinkedInId = (url) => {
    // Extract LinkedIn post ID from URL
    // Format: https://www.linkedin.com/posts/activity-POST_ID
    const match = url.match(/linkedin\.com\/.*\/activity-(\d+)/);
    return match ? match[1] : null;
  };

  const extractFacebookPostId = (url) => {
    // Try to extract post ID from various Facebook URL formats
    // Share URL: https://www.facebook.com/share/p/1Bgq1ruJ1E/
    // Post URL: https://www.facebook.com/username/posts/POST_ID
    if (url.includes('/share/p/')) {
      const match = url.match(/\/share\/p\/([^\/\?]+)/);
      return match ? match[1] : null;
    }
    const match = url.match(/facebook\.com\/.*\/posts\/(\d+)/);
    return match ? match[1] : null;
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const extractVimeoId = (url) => {
    const match = url.match(/vimeo.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const renderCTA = () => {
    if (!section.cta_button_text) return null;

    const buttonClass = `cta-button cta-button-${section.cta_button_style || 'primary'}`;
    
    return (
      <div className="cta-button-container">
        <a
          href={section.cta_button_link || '#'}
          target={section.cta_button_target || '_self'}
          rel={section.cta_button_target === '_blank' ? 'noopener noreferrer' : ''}
          className={buttonClass}
        >
          {section.cta_button_text}
        </a>
      </div>
    );
  };

  return (
    <section
      id={section.section_id || undefined}
      className={`dynamic-section dynamic-section-${section.section_type}`}
      style={sectionStyle}
    >
      <div className="dynamic-section-inner">
        {renderContent()}
        {renderCTA()}
      </div>
    </section>
  );
};

// Facebook Page Feed Component
const FacebookPageFeed = ({ url }) => {
  const containerRef = useRef(null);
  const [sdkLoaded, setSdkLoaded] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Format page URL
  let pageUrl = url;
  if (!pageUrl.startsWith('http')) {
    pageUrl = `https://www.facebook.com/${pageUrl.replace(/^\/+/, '').replace(/^@/, '')}`;
  }
  pageUrl = pageUrl.replace(/\/$/, '');
  
  useEffect(() => {
    // Load Facebook SDK if not already loaded
    if (window.FB) {
      // SDK already loaded
      setSdkLoaded(true);
      // Parse XFBML after a short delay to ensure DOM is ready
      setTimeout(() => {
        if (window.FB && window.FB.XFBML && containerRef.current) {
          window.FB.XFBML.parse(containerRef.current);
        }
      }, 100);
    } else {
      // Load Facebook SDK
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          setSdkLoaded(true);
          return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
        js.async = true;
        js.onload = function() {
          setSdkLoaded(true);
        };
        js.onerror = function() {
          setLoadError(true);
          console.error('Failed to load Facebook SDK');
        };
        if (fjs && fjs.parentNode) {
          fjs.parentNode.insertBefore(js, fjs);
        } else {
          d.body.appendChild(js);
        }
      }(document, 'script', 'facebook-jssdk'));
      
      // Initialize FB when SDK loads
      window.fbAsyncInit = function() {
        if (window.FB) {
          window.FB.init({
            xfbml: true,
            version: 'v18.0'
          });
          setSdkLoaded(true);
          // Parse XFBML after SDK is ready
          setTimeout(() => {
            if (containerRef.current && window.FB && window.FB.XFBML) {
              window.FB.XFBML.parse(containerRef.current);
            }
          }, 100);
        }
      };
    }
    
    // Set a timeout to check if SDK loaded
    const timeout = setTimeout(() => {
      if (!window.FB && !sdkLoaded) {
        setLoadError(true);
      }
    }, 5000);
    
    // Cleanup function
    return () => {
      clearTimeout(timeout);
    };
  }, [sdkLoaded]);
  
  // Re-parse when SDK loads
  useEffect(() => {
    if (sdkLoaded && window.FB && window.FB.XFBML && containerRef.current) {
      setTimeout(() => {
        window.FB.XFBML.parse(containerRef.current);
      }, 200);
    }
  }, [sdkLoaded]);
  
  return (
    <div className="social-embed-facebook-page" ref={containerRef}>
      {isLocalhost && !sdkLoaded && !loadError && (
        <div style={{ 
          padding: '15px', 
          background: '#e3f2fd', 
          borderRadius: '8px', 
          marginBottom: '10px',
          fontSize: '14px',
          color: '#1976d2'
        }}>
          <strong>🔄 Loading Facebook Feed...</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
            If the feed doesn't appear, check your browser console for errors or try disabling ad blockers.
          </p>
        </div>
      )}
      {loadError && (
        <div style={{ 
          padding: '15px', 
          background: '#ffebee', 
          borderRadius: '8px', 
          marginBottom: '10px',
          fontSize: '14px',
          color: '#c62828'
        }}>
          <strong>⚠️ Facebook SDK failed to load</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
            This may be due to network restrictions, ad blockers, or browser security settings. 
            The feed should work on production. Check browser console for details.
          </p>
        </div>
      )}
      <div 
        className="fb-page" 
        data-href={pageUrl}
        data-tabs="timeline"
        data-width="500"
        data-height="800"
        data-small-header="false"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="true"
      />
      <noscript>
        <iframe
          src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=500&height=800&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
          width="500"
          height="800"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          frameBorder="0"
          allowTransparency="true"
          allow="encrypted-media"
          title="Facebook Page Feed"
        />
      </noscript>
    </div>
  );
};

// Instagram Embed Component
const InstagramEmbed = ({ url }) => {
  const containerRef = useRef(null);
  const [embedHtml, setEmbedHtml] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  
  // Extract Instagram post ID from URL
  // Format: https://www.instagram.com/p/POST_ID/
  const extractId = (url) => {
    const match = url.match(/instagram\.com\/p\/([^\/\?]+)/);
    return match ? match[1] : null;
  };
  
  const postId = extractId(url);
  
  useEffect(() => {
    if (!postId) {
      setError(true);
      setLoading(false);
      return;
    }
    
    // First, ensure Instagram embed script is loaded
    const loadInstagramScript = () => {
      return new Promise((resolve) => {
        if (window.instgrm && window.instgrm.Embeds) {
          resolve();
          return;
        }
        
        if (document.getElementById('instagram-embed-script')) {
          // Script is loading, wait for it
          const checkInterval = setInterval(() => {
            if (window.instgrm && window.instgrm.Embeds) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
          
          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
          }, 5000);
          return;
        }
        
        const script = document.createElement('script');
        script.id = 'instagram-embed-script';
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        script.onload = () => {
          resolve();
        };
        script.onerror = () => {
          resolve(); // Continue even if script fails
        };
        document.body.appendChild(script);
      });
    };
    
    // Load script first, then fetch embed HTML
    loadInstagramScript().then(() => {
      // Use Instagram's oEmbed API to get embed HTML
      const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}&omitscript=true`;
      
      fetch(oembedUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch Instagram embed`);
          }
          return response.json();
        })
        .then(data => {
          setEmbedHtml(data.html);
          setLoading(false);
          
          // Process embeds after HTML is set
          setTimeout(() => {
            if (window.instgrm && window.instgrm.Embeds) {
              window.instgrm.Embeds.process(containerRef.current);
            }
          }, 200);
        })
        .catch(err => {
          console.error('Instagram embed error:', err);
          // If oEmbed fails, try using the embed URL directly
          setEmbedHtml(`<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${url}" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="${url}" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;">A post shared by <a href="${url}" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">Instagram</a></p></div></blockquote>`);
          setLoading(false);
          
          // Process embeds after HTML is set
          setTimeout(() => {
            if (window.instgrm && window.instgrm.Embeds) {
              window.instgrm.Embeds.process(containerRef.current);
            }
          }, 300);
        });
    });
  }, [url, postId]);
  
  // Re-process embeds when HTML changes
  useEffect(() => {
    if (embedHtml && window.instgrm && window.instgrm.Embeds) {
      // Wait a bit for DOM to update
      const timer = setTimeout(() => {
        if (containerRef.current) {
          window.instgrm.Embeds.process(containerRef.current);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [embedHtml]);
  
  if (loading) {
    return (
      <div className="social-embed-instagram">
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#666',
          background: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <p>Loading Instagram post...</p>
        </div>
      </div>
    );
  }
  
  if (error || !embedHtml) {
    return (
      <div className="social-embed-instagram">
        <div style={{ 
          padding: '20px', 
          background: '#fff3cd', 
          border: '1px solid #ffc107',
          borderRadius: '8px',
          color: '#856404'
        }}>
          <p><strong>⚠️ Unable to load Instagram post</strong></p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Instagram posts cannot be embedded via iframe due to security restrictions.
          </p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            <strong>Solution:</strong> Use the <strong>"Custom HTML"</strong> section type and paste the embed code directly from Instagram:
          </p>
          <ol style={{ fontSize: '14px', marginTop: '10px', textAlign: 'left', display: 'inline-block' }}>
            <li>Go to the Instagram post</li>
            <li>Click the three dots (⋯) → <strong>Embed</strong></li>
            <li>Copy the embed code</li>
            <li>Paste it in a "Custom HTML" section</li>
          </ol>
          <div style={{ marginTop: '15px' }}>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#E4405F', 
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              View post on Instagram →
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="social-embed-instagram" ref={containerRef}>
      {embedHtml && (
        <div dangerouslySetInnerHTML={{ __html: embedHtml }} />
      )}
      {embedHtml && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
          <p>If the post doesn't load, try using the <strong>"Custom HTML"</strong> section type with Instagram's embed code.</p>
        </div>
      )}
    </div>
  );
};

// Accordion Item Component
const AccordionItem = ({ title, content }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      <button
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="accordion-content">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  );
};

export default DynamicSection;

