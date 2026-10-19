(() => {
  const body = document.body;
  body.classList.remove('no-js');
  const header = document.getElementById('navbar');
  const menu = document.getElementById('main-navigation');
  const toggle = document.querySelector('.nav-toggle');
  const progress = document.querySelector('.scroll-progress span');
  const indicator = document.querySelector('.section-indicator strong');
  const liveRegion = document.getElementById('section-live');
  const sections = [...document.querySelectorAll('.deck-section')];
  const navLinks = [...document.querySelectorAll('.nav-menu a[href^="#"]')];
  const mobileQuery = window.matchMedia('(max-width: 1280px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let menuOpen = false;

  const heroCopy = document.querySelector('.hero-copy');
  const heroArtwork = heroCopy?.querySelector('.hero-copy-art img');
  if (heroCopy && heroArtwork) {
    const setCoverArtReady = (ready) => heroCopy.classList.toggle('has-cover-art', ready);
    heroArtwork.addEventListener('load', () => setCoverArtReady(true), { once: true });
    heroArtwork.addEventListener('error', () => setCoverArtReady(false), { once: true });
    if (heroArtwork.complete) setCoverArtReady(heroArtwork.naturalWidth > 0);
  }

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const setMenuAccessibility = (open = menuOpen, restoreFocus = false) => {
    menuOpen = Boolean(open);
    const isMobile = mobileQuery.matches;
    menu?.classList.toggle('is-open', isMobile && menuOpen);
    body.classList.toggle('is-menu-open', isMobile && menuOpen);
    toggle?.setAttribute('aria-expanded', String(isMobile && menuOpen));
    toggle?.setAttribute('aria-label', isMobile && menuOpen ? 'Fechar menu' : 'Abrir menu');
    if (menu) {
      if (isMobile) {
        menu.setAttribute('aria-hidden', String(!menuOpen));
        if (menuOpen) menu.removeAttribute('inert');
        else menu.setAttribute('inert', '');
      } else {
        menu.removeAttribute('aria-hidden');
        menu.removeAttribute('inert');
      }
    }
    if (restoreFocus && isMobile) toggle?.focus();
  };
  const closeMenu = (restoreFocus = false) => setMenuAccessibility(false, restoreFocus);
  setMenuAccessibility(false);
  toggle?.addEventListener('click', () => setMenuAccessibility(!menuOpen));
  navLinks.forEach((link) => link.addEventListener('click', () => closeMenu(true)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menuOpen) closeMenu(true); });
  const onViewportChange = () => setMenuAccessibility(false);
  if (typeof mobileQuery.addEventListener === 'function') mobileQuery.addEventListener('change', onViewportChange);
  else mobileQuery.addListener(onViewportChange);

  const updateProgress = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / scrollable))})`;
  };
  let progressFrame = 0;
  const scheduleProgress = () => {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(() => { progressFrame = 0; updateProgress(); });
  };
  updateProgress();
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress, { passive: true });

  let activeNumber = '';
  const setActiveSection = (section) => {
    if (!section) return;
    const number = section.dataset.slide || '01';
    if (indicator) indicator.textContent = number;
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${section.id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (liveRegion && activeNumber !== number) {
      activeNumber = number;
      liveRegion.textContent = `Seção ${number} de ${sections.length}`;
    }
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target);
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, .25, .55, .8] });
    sections.forEach((section) => observer.observe(section));
  } else if (sections[0]) setActiveSection(sections[0]);

  if ('IntersectionObserver' in window && !reduceMotion) {
    body.classList.add('motion-enabled');
    sections[0]?.classList.add('is-visible');
    const revealObserver = new IntersectionObserver((entries, currentObserver) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .08 });
    sections.slice(1).forEach((section) => revealObserver.observe(section));
  } else {
    sections.forEach((section) => section.classList.add('is-visible'));
  }

  const galleryPhotos = [...document.querySelectorAll('[data-gallery-photo]')];
  const photoViewer = document.getElementById('confraria-viewer');
  if (galleryPhotos.length && typeof photoViewer?.showModal === 'function') {
    const viewerImage = photoViewer.querySelector('img');
    const viewerCaption = document.getElementById('viewer-caption');
    const viewerCount = document.getElementById('viewer-count');
    let currentPhoto = 0;
    let photoTrigger;
    const showPhoto = (index) => {
      currentPhoto = (index + galleryPhotos.length) % galleryPhotos.length;
      const photo = galleryPhotos[currentPhoto];
      viewerImage.src = photo.href;
      viewerImage.alt = photo.querySelector('img').alt;
      viewerCaption.textContent = photo.dataset.caption;
      viewerCount.textContent = `${currentPhoto + 1} / ${galleryPhotos.length}`;
    };
    galleryPhotos.forEach((photo, index) => photo.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      photoTrigger = photo;
      showPhoto(index);
      photoViewer.showModal();
      body.classList.add('is-photo-open');
    }));
    photoViewer.querySelector('.photo-viewer-close').addEventListener('click', () => photoViewer.close());
    photoViewer.querySelectorAll('[data-photo-direction]').forEach((button) => button.addEventListener('click', () => showPhoto(currentPhoto + Number(button.dataset.photoDirection))));
    photoViewer.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showPhoto(currentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    photoViewer.addEventListener('click', (event) => { if (event.target === photoViewer) photoViewer.close(); });
    photoViewer.addEventListener('close', () => {
      body.classList.remove('is-photo-open');
      photoTrigger?.focus({ preventScroll: true });
    });
  }

  document.querySelectorAll('img[src]').forEach((image) => {
    const createFallback = () => {
      const parent = image.parentElement;
      image.classList.add('is-missing');
      image.setAttribute('aria-hidden', 'true');
      if (parent && !parent.querySelector('.image-fallback')) {
        parent.classList.add('has-fallback');
        const fallback = document.createElement('span');
        fallback.className = 'image-fallback';
        fallback.setAttribute('role', 'img');
        fallback.setAttribute('aria-label', image.alt || 'Imagem indisponível');
        fallback.innerHTML = '<i class="bi bi-image" aria-hidden="true"></i><span>Imagem indisponível</span>';
        parent.append(fallback);
      }
    };
    image.addEventListener('error', createFallback, { once: true });
    if (image.complete && image.naturalWidth === 0) createFallback();
  });

  const youtubeSection = document.getElementById('youtube');
  const youtubePlayer = document.getElementById('yt-featured-player');
  const youtubeTitle = document.getElementById('yt-featured-title');
  const youtubeDate = document.getElementById('yt-featured-date');
  const youtubeStatus = document.getElementById('yt-player-status');
  const youtubeList = document.getElementById('yt-videos-list');
  if (youtubeSection && youtubePlayer && youtubeTitle && youtubeDate && youtubeList) {
    const playlistId = 'PLHqcbZC2lqMC1HIn_49bY6Q2CQZqPrk8a';
    const localFileMode = window.location.protocol === 'file:';
    const validVideoId = (value) => /^[A-Za-z0-9_-]{11}$/.test(value || '');
    const formattedDate = (value) => {
      const parsedDate = new Date(value);
      if (Number.isNaN(parsedDate.getTime())) return 'Podcast Empreender 40+';
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsedDate);
    };
    const normaliseVideos = (catalog) => {
      if (catalog.playlistId !== playlistId || !Array.isArray(catalog.videos)) throw new Error('Catálogo inválido');
      const ids = new Set();
      const videos = catalog.videos.map((item) => {
        const id = String(item.id || '');
        const title = String(item.title || '').trim().slice(0, 180);
        const published = String(item.published || '');
        if (!validVideoId(id) || !title || !Number.isFinite(Date.parse(published)) || ids.has(id)) throw new Error('Episódio inválido');
        ids.add(id);
        return { id, title, published };
      });
      if (!videos.length) throw new Error('Playlist vazia');
      return videos.sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
    };

    let localPreview;
    const setLocalPreview = (video) => {
      if (!localPreview) {
        localPreview = document.createElement('a');
        localPreview.className = 'local-video-preview';
        localPreview.target = '_blank';
        localPreview.rel = 'noopener noreferrer';
        localPreview.innerHTML = '<i class="bi bi-play-circle" aria-hidden="true"></i><span>Assistir no YouTube</span>';
        youtubePlayer.replaceWith(localPreview);
      }
      localPreview.href = `https://www.youtube.com/watch?v=${video.id}`;
      localPreview.setAttribute('aria-label', `Assistir ${video.title} no YouTube`);
    };
    const selectVideo = (video, autoplay = false) => {
      if (localFileMode) setLocalPreview(video);
      else youtubePlayer.src = `https://www.youtube-nocookie.com/embed/${video.id}?rel=0${autoplay ? '&autoplay=1' : ''}`;
      youtubeTitle.textContent = video.title;
      youtubeDate.textContent = `Publicado em ${formattedDate(video.published)}`;
      youtubeList.querySelectorAll('.recent-video-button').forEach((button) => {
        const selected = button.dataset.id === video.id;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      if (youtubeStatus) youtubeStatus.textContent = `Selecionado: ${video.title}.`;
    };
    const renderVideos = (videos) => {
      youtubeList.replaceChildren();
      videos.forEach((video, index) => {
        const item = document.createElement('li');
        item.className = 'recent-video-item';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'recent-video-button';
        button.dataset.id = video.id;
        button.setAttribute('aria-label', `Reproduzir ${video.title}`);
        button.setAttribute('aria-pressed', 'false');

        const number = document.createElement('span');
        number.className = 'recent-video-number';
        number.textContent = String(index + 1).padStart(2, '0');
        const meta = document.createElement('span');
        meta.className = 'recent-video-meta';
        const titleText = document.createElement('strong');
        titleText.textContent = video.title;
        const dateText = document.createElement('small');
        dateText.textContent = formattedDate(video.published);
        meta.append(titleText, dateText);
        const play = document.createElement('i');
        play.className = 'bi bi-play-fill';
        play.setAttribute('aria-hidden', 'true');
        button.append(number, meta, play);
        button.addEventListener('click', () => selectVideo(video, true));
        item.append(button);
        youtubeList.append(item);
      });
      selectVideo(videos[0]);
    };

    (async () => {
      try {
        const response = await fetch('data/youtube-playlist.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('Catálogo indisponível');
        renderVideos(normaliseVideos(await response.json()));
      } catch {
        youtubeList.replaceChildren();
        const message = document.createElement('li');
        message.className = 'recent-placeholder';
        message.textContent = 'Não foi possível carregar os episódios aqui. Abra a playlist no YouTube.';
        youtubeList.append(message);
        youtubeDate.textContent = 'A playlist completa está disponível no YouTube.';
        if (youtubeStatus) youtubeStatus.textContent = 'A playlist não pôde ser carregada neste momento.';
      }
    })();
  }

  document.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) return;
    const active = document.activeElement;
    if (!active || active.closest('a,button,input,textarea,select,[contenteditable="true"],#main-navigation') || !active.closest('#apresentacao')) return;
    const current = sections.findIndex((section) => {
      const box = section.getBoundingClientRect();
      return box.top <= window.innerHeight * .48 && box.bottom >= window.innerHeight * .48;
    });
    if (current < 0) return;
    const direction = event.key === 'ArrowDown' || event.key === 'PageDown' ? 1 : -1;
    const next = sections[current + direction];
    if (!next) return;
    event.preventDefault();
    next.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
})();
