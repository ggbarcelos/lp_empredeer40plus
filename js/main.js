document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('navbar');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const setNav = () => nav.classList.toggle('scrolled', window.scrollY > 18);
  setNav(); window.addEventListener('scroll', setNav, { passive: true });
  toggle?.addEventListener('click', () => { const open = menu.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { menu.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); }));
  const glow = document.querySelector('.cursor-glow');
  window.addEventListener('pointermove', (event) => { if (glow) { glow.style.setProperty('--x', `${event.clientX}px`); glow.style.setProperty('--y', `${event.clientY}px`); } }, { passive: true });

  const impactDescription = document.querySelector('.impact-reach > p');
  if (impactDescription) impactDescription.innerHTML = '<strong>+250 mil pessoas impactadas</strong> pela soma do Summit, canal no YouTube, redes sociais, site e confrarias.';

  // Camadas editoriais deixam explícita a diferença entre o Summit (evento) e a Confraria (mesa).
  const summitGallery = document.querySelector('.summit-gallery');
  summitGallery?.setAttribute('role', 'group');
  summitGallery?.setAttribute('aria-label', 'Experiência visual do Summit Empreender 40+ e galeria de palestrantes da edição 2026');
  if (summitGallery && !summitGallery.querySelector('.summit-event-image')) {
    const eventImage = document.createElement('figure');
    eventImage.className = 'summit-event-image';
    eventImage.innerHTML = '<img src="img/banner.jpg" alt="Arte oficial do Summit Empreender 40+, com programação, local e retratos dos participantes" loading="lazy"><figcaption><i class="bi bi-camera"></i> registro visual do evento</figcaption>';
    summitGallery.prepend(eventImage);
  }
  const summitCopy = document.querySelector('.summit-copy');
  if (summitCopy && !summitCopy.querySelector('.summit-facts')) {
    const facts = document.createElement('div');
    facts.className = 'summit-facts';
    facts.innerHTML = '<span><i class="bi bi-calendar3"></i><b>13 maio</b><small>2026</small></span><span><i class="bi bi-clock"></i><b>9h30–18h30</b><small>um dia de conteúdo</small></span><span><i class="bi bi-geo-alt"></i><b>Teatro Bourbon Country</b><small>Porto Alegre · RS</small></span>';
    summitCopy.insertBefore(facts, summitCopy.querySelector('.summit-points'));
  }
  const confrariaStage = document.querySelector('.confraria-stage');
  if (confrariaStage && !confrariaStage.querySelector('.confraria-photo')) {
    const photo = document.createElement('figure');
    photo.className = 'confraria-photo';
    photo.innerHTML = '<img src="img/confraria-mesa.png" alt="Encontro da Confraria Empreender 40+ em volta de uma mesa, em conversa entre pares" loading="lazy"><figcaption><i class="bi bi-cup-hot"></i> Confraria · encontros mensais</figcaption>';
    confrariaStage.prepend(photo);
  }
  confrariaStage?.setAttribute('role', 'group');
  confrariaStage?.setAttribute('aria-label', 'Imagem editorial da experiência de mesa da Confraria Empreender 40+');
  const confrariaCopy = document.querySelector('.confraria-copy');
  if (confrariaCopy && !confrariaCopy.querySelector('.confraria-separation-note')) {
    const note = document.createElement('span');
    note.className = 'confraria-separation-note';
    note.setAttribute('aria-hidden', 'true');
    note.textContent = 'EXPERIÊNCIA DE MESA · NÃO É O SUMMIT';
    confrariaCopy.prepend(note);
  }

  // Entrada progressiva e navegação contextual; desliga-se automaticamente para quem prefere menos movimento.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = [...document.querySelectorAll('.section > .page-width, footer .footer-grid, footer .footer-bottom')];
  revealTargets.forEach((target) => target.classList.add('reveal-on-scroll'));
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealTargets.forEach((target) => revealObserver.observe(target));
  } else revealTargets.forEach((target) => target.classList.add('is-visible'));

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.appendChild(progress);
  const progressBar = progress.firstElementChild;
  let progressRaf = 0;
  const updateProgress = () => {
    if (progressRaf) return;
    progressRaf = window.requestAnimationFrame(() => {
      progressRaf = 0;
      const scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      if (progressBar) progressBar.style.transform = `scaleX(${ratio})`;
    });
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  const navSectionLinks = [...document.querySelectorAll('.nav-menu a[href^="#"]')].filter((link) => !link.classList.contains('nav-action'));
  const navSections = navSectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && navSections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) navSectionLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`)); });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
    navSections.forEach((sectionNode) => navObserver.observe(sectionNode));
  }

  // Mosaico vivo do Summit: alterna os retratos de forma discreta.
  const summitFrames = [...document.querySelectorAll('.summit-portraits img')];
  const speakers = [
    { src: 'palestrantes/manoel.jpg', alt: 'Manoel Soares' },
    { src: 'palestrantes/cris_paz2.jpg', alt: 'Cris Paz' },
    { src: 'palestrantes/nelson2.jpeg', alt: 'Nelson Sirotsky' },
    { src: 'palestrantes/dody_sirena.png', alt: 'Dody Sirena' },
    { src: 'palestrantes/luciano.png', alt: 'Luciano Potter' },
    { src: 'palestrantes/clarissa.JPG', alt: 'Clarissa Brinckmann' },
    { src: 'palestrantes/andre_foresti2.jpg', alt: 'André Foresti' },
    { src: 'palestrantes/fatima.jpeg', alt: 'Fátima Torri' },
    { src: 'palestrantes/marcelo.jpeg', alt: 'Marcelo Lacerda' }
  ];
  if (summitFrames.length) {
    speakers.forEach((speaker) => { const image = new Image(); image.src = speaker.src; });
    let speakerIndex = summitFrames.length;
    const rotateSummit = () => {
      const frame = summitFrames[speakerIndex % summitFrames.length];
      const speaker = speakers[speakerIndex % speakers.length];
      frame.classList.add('is-swapping');
      window.setTimeout(() => {
        frame.src = speaker.src;
        frame.alt = speaker.alt;
        frame.classList.remove('is-swapping');
      }, 260);
      speakerIndex += 1;
    };
    if (!reduceMotion) window.setInterval(rotateSummit, 3400);
  }

  const section = document.getElementById('youtube');
  const player = document.getElementById('yt-featured-player');
  const title = document.getElementById('yt-featured-title');
  const date = document.getElementById('yt-featured-date');
  const list = document.getElementById('yt-videos-list');
  if (!section || !player || !title || !date || !list) return;

  const channel = section.dataset.youtubeChannelId;
  const localFileMode = window.location.protocol === 'file:';
  const feed = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`;
  const fallback = [
    { id: 'aNRU2Rb745s', title: 'Empreender 40+ | Histórias que movem gerações', date: '' },
    { id: 'aNRU2Rb745s', title: 'Conteúdo para quem continua construindo', date: '' },
    { id: 'aNRU2Rb745s', title: 'Conversas do Movimento Empreender 40+', date: '' }
  ];
  const videoId = (url) => (url || '').match(/[?&]v=([^&]+)/)?.[1] || '';
  const formattedDate = (value) => { const d = new Date(value); return Number.isNaN(d.getTime()) ? 'No canal Empreender 40+' : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d); };
  const normalise = (items) => items.map((item) => ({ id: item.id || videoId(item.link), title: item.title || 'Novo vídeo', date: item.date || item.pubDate || item.published || '', thumbnail: item.thumbnail || item.thumbnailUrl || '' })).filter((item) => item.id);
  let localPreview;
  const setLocalPreview = (video) => {
    if (!localPreview) {
      localPreview = document.createElement('a');
      localPreview.className = 'local-video-preview';
      localPreview.target = '_blank';
      localPreview.rel = 'noopener';
      player.replaceWith(localPreview);
    }
    localPreview.href = `https://www.youtube.com/watch?v=${video.id}`;
    localPreview.innerHTML = `<img src="${video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}" alt="Prévia de ${video.title}"><span><i class="bi bi-play-fill"></i> Assistir no YouTube</span>`;
  };
  const select = (video, autoplay = false) => { if (localFileMode) setLocalPreview(video); else player.src = `https://www.youtube.com/embed/${video.id}?rel=0${autoplay ? '&autoplay=1' : ''}`; title.textContent = video.title; date.textContent = video.date ? `Publicado em ${formattedDate(video.date)}` : 'Assista no canal Empreender 40+'; list.querySelectorAll('.video-card').forEach((card) => card.classList.toggle('active', card.dataset.id === video.id)); };
  const render = (videos) => { list.innerHTML = ''; videos.slice(0, 12).forEach((video, index) => { const card = document.createElement('button'); card.type = 'button'; card.className = 'video-card'; card.dataset.id = video.id; card.setAttribute('aria-label', `Assistir ${video.title}`); const thumb = video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`; card.innerHTML = `<span class="video-number">${String(index + 1).padStart(2, '0')}</span><img class="video-thumb" src="${thumb}" alt="" loading="lazy"><span class="video-meta"><strong>${video.title}</strong><small>${formattedDate(video.date)}</small></span><i class="bi bi-play-fill" aria-hidden="true"></i>`; card.addEventListener('click', () => select(video, true)); list.appendChild(card); }); select(videos[0]); };
  const parseXml = (xml) => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('Feed inválido');
    return normalise([...doc.querySelectorAll('entry')].map((entry) => {
      const link = entry.querySelector('link')?.getAttribute('href') || '';
      const id = videoId(link);
      return { id, link, title: entry.querySelector('title')?.textContent?.trim(), published: entry.querySelector('published')?.textContent, thumbnail: entry.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url') || `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
    }));
  };
  const fromRss2Json = async () => { const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`); if (!response.ok) throw new Error('RSS indisponível'); const data = await response.json(); const videos = normalise(data.items || []); if (!videos.length) throw new Error('RSS vazio'); return videos; };
  const fromAllOrigins = async () => { const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(feed)}`); if (!response.ok) throw new Error('Proxy indisponível'); const videos = parseXml(await response.text()); if (!videos.length) throw new Error('Feed vazio'); return videos; };
  if (localFileMode) render(fallback);
  else (async () => { try { render(await fromRss2Json()); } catch { try { render(await fromAllOrigins()); } catch { render(fallback); } } })();
});
