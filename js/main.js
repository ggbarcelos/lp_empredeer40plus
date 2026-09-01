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

  // O hero usa formas abstratas: as imagens legadas não fazem parte da composição.
  document.querySelectorAll('.hero-stage .portrait img').forEach((image) => image.remove());

  const impactDescription = document.querySelector('.impact-reach > p');
  if (impactDescription) impactDescription.innerHTML = '<strong>+250 mil pessoas impactadas</strong> pela soma do Summit, canal no YouTube, redes sociais, site e confrarias.';

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
    window.setInterval(rotateSummit, 3400);
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
