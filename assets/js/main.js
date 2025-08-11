// Main JS for Biblioteca ERD
// - Handles lazy loading iframes
// - Adds smooth scroll, external links, and small UX improvements

(function(){
  // Mark external links to open in new tab
  document.querySelectorAll('a[href^="http"]:not([data-noext])').forEach(a=>{
    const isSameHost = a.href.startsWith(location.origin);
    if(!isSameHost){ a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  });

  // Lazy load iframes with data-src
  const iframes = document.querySelectorAll('iframe[data-src]');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const el = entry.target; el.src = el.dataset.src; el.removeAttribute('data-src'); io.unobserve(el);
        }
      })
    }, { rootMargin: '200px' });
    iframes.forEach(el=>io.observe(el));
  } else {
    // Fallback
    iframes.forEach(el=>{ el.src = el.dataset.src; el.removeAttribute('data-src'); });
  }
})();
