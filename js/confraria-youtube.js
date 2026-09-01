(() => {
  const shell = document.querySelector(".yt-shell");
  const player = document.getElementById("yt-featured-player");
  const list = document.getElementById("yt-videos-list");

  if (!shell || !player || !list) {
    return;
  }

  const channelId = shell.dataset.youtubeChannelId;
  const channelUrl = "https://www.youtube.com/@CanalEmpreender40Mais";
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  const getVideoId = (link) => {
    if (!link) return "";
    const byQuery = link.match(/[?&]v=([^&]+)/);
    if (byQuery && byQuery[1]) return byQuery[1];
    const byPath = link.match(/\/shorts\/([^/?]+)/);
    return byPath && byPath[1] ? byPath[1] : "";
  };

  const normalizeVideos = (videos) =>
    videos
      .map((video) => ({
        id: video.id,
        title: video.title,
        publishedAt: video.publishedAt,
        thumbnail: video.thumbnail,
      }))
      .filter((video) => video.id && video.title);

  const fromRss2Json = async () => {
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Falha RSS2JSON (${response.status})`);
    }

    const data = await response.json();
    if (!Array.isArray(data.items)) {
      throw new Error("Resposta RSS2JSON inválida");
    }

    return normalizeVideos(
      data.items.map((item) => ({
        id: getVideoId(item.link),
        title: item.title || "",
        publishedAt: item.pubDate || "",
        thumbnail: item.thumbnail || "",
      }))
    );
  };

  const fromAllOrigins = async () => {
    const endpoint = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Falha AllOrigins (${response.status})`);
    }

    const xml = await response.text();
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      throw new Error("XML de feed inválido");
    }

    const entries = [...doc.querySelectorAll("entry")];
    return normalizeVideos(
      entries.map((entry) => {
        const link = entry.querySelector("link")?.getAttribute("href") || "";
        const thumbnail =
          entry.querySelector("media\\:thumbnail, thumbnail")?.getAttribute("url") ||
          `https://i.ytimg.com/vi/${getVideoId(link)}/hqdefault.jpg`;

        return {
          id: getVideoId(link),
          title: entry.querySelector("title")?.textContent?.trim() || "",
          publishedAt: entry.querySelector("published")?.textContent?.trim() || "",
          thumbnail,
        };
      })
    );
  };

  const setPlayerVideo = (videoId) => {
    player.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
  };

  const bindCardClick = (card) => {
    card.addEventListener("click", () => {
      const videoId = card.dataset.videoId;
      if (!videoId) return;
      setPlayerVideo(videoId);
      setActiveCard(videoId);
    });
  };

  const setActiveCard = (videoId) => {
    for (const card of list.querySelectorAll(".yt-video-card")) {
      card.classList.toggle("is-active", card.dataset.videoId === videoId);
    }
  };

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const renderError = (message) => {
    list.innerHTML = "";
    const container = document.createElement("p");
    container.className = "yt-error";
    container.textContent = message;
    const spacer = document.createTextNode(" ");
    const link = document.createElement("a");
    link.href = channelUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Abrir canal no YouTube";
    container.append(spacer, link);
    list.appendChild(container);
  };

  const renderVideos = (videos) => {
    list.innerHTML = "";

    videos.forEach((video, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "yt-video-card";
      card.dataset.videoId = video.id;

      const thumb = document.createElement("img");
      thumb.className = "yt-video-thumb";
      thumb.src = video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
      thumb.alt = `Miniatura do vídeo ${video.title}`;
      thumb.loading = "lazy";

      const meta = document.createElement("div");
      meta.className = "yt-video-meta";

      const title = document.createElement("span");
      title.className = "yt-video-title";
      title.textContent = video.title;

      const date = document.createElement("span");
      date.className = "yt-video-date";
      date.textContent = formatDate(video.publishedAt);

      meta.append(title, date);
      card.append(thumb, meta);
      bindCardClick(card);
      list.appendChild(card);

      if (index === 0) {
        setPlayerVideo(video.id);
        setActiveCard(video.id);
      }
    });
  };

  const init = async () => {
    let videos = [];
    let lastError = null;

    try {
      videos = await fromRss2Json();
    } catch (error) {
      lastError = error;
    }

    if (!videos.length) {
      try {
        videos = await fromAllOrigins();
      } catch (error) {
        lastError = error;
      }
    }

    if (!videos.length) {
      renderError("Não foi possível carregar os vídeos mais recentes agora.");
      if (lastError) {
        console.error(lastError);
      }
      return;
    }

    renderVideos(videos.slice(0, 8));
  };

  list.addEventListener("click", (event) => {
    const element = event.target && event.target.closest ? event.target.closest(".yt-video-card") : null;
    if (!element) return;
    const videoId = element.getAttribute("data-video-id");
    if (!videoId) return;
    setPlayerVideo(videoId);
    setActiveCard(videoId);
  });

  init();
})();
