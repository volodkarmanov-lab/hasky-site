// ========== ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ ==========
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll(
    '.album-card, .singles-list li, .quotes-grid blockquote, .about-text, .photo-frame, .gallery-item, .player, .subscribe-box'
).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

document.querySelectorAll('.album-card').forEach((c, i) => c.style.transitionDelay = `${i * 0.1}s`);
document.querySelectorAll('.singles-list li').forEach((l, i) => l.style.transitionDelay = `${i * 0.05}s`);
document.querySelectorAll('.gallery-item').forEach((g, i) => g.style.transitionDelay = `${i * 0.08}s`);

// ========== ВРАЩЕНИЕ КРЕСТА В ЛОГОТИПЕ ==========
const logoCross = document.querySelector('.logo-cross');
if (logoCross) {
    logoCross.style.transition = 'transform 0.5s ease';
    logoCross.parentElement.addEventListener('mouseenter', () => logoCross.style.transform = 'rotate(360deg)');
    logoCross.parentElement.addEventListener('mouseleave', () => logoCross.style.transform = 'rotate(0deg)');
}

// ========== ПАРАЛЛАКС ГЕРОЯ ==========
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) hero.style.backgroundPositionY = window.pageYOffset * 0.5 + 'px';
});

// ========== 🎵 АУДИОПЛЕЕР ==========
const tracks = [
    { name: 'Пуля-дура',           album: 'Сингл · 2016',                    src: 'audio/pulya-dura.mp3' },
    { name: 'Панелька',            album: 'Сингл · 2016',                    src: 'audio/panelka.mp3' },
    { name: 'Аллилуйя',            album: 'Сингл · 2018',                    src: 'audio/alliluyya.mp3' },
    { name: 'Крот 17',             album: 'Альбом «Любимые песни» · 2017',   src: 'audio/krot-17.mp3' },
    { name: 'Ветром, Снегом, Зноем',album: 'Сингл · 2019',                    src: 'audio/vetrom-snegom-znoem.mp3' },
    { name: 'Живая вода',          album: 'Сингл · 2020',                    src: 'audio/zhivaya-voda.mp3' }
];

const audio         = new Audio();
const playBtn       = document.getElementById('playBtn');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const progress      = document.getElementById('progress');
const volumeSlider  = document.getElementById('volume');
const currentTimeEl = document.getElementById('currentTime');
const durationEl    = document.getElementById('duration');
const trackNameEl   = document.getElementById('trackName');
const trackAlbumEl  = document.getElementById('trackAlbum');
const playlistEl    = document.getElementById('playlist');
const vinyl         = document.querySelector('.vinyl');

let currentIndex = 0;
let isPlaying = false;

audio.volume = 0.8;

// --- Построение плейлиста ---
function buildPlaylist() {
    playlistEl.innerHTML = '';
    tracks.forEach((t, i) => {
        const li = document.createElement('li');
        li.dataset.index = i;
        li.innerHTML = `<span>${i + 1}. ${t.name}</span><span class="dur">—</span>`;
        li.addEventListener('click', () => {
            currentIndex = i;
            loadTrack(currentIndex);
            playTrack();
        });
        playlistEl.appendChild(li);
    });
}

function updateActivePlaylist() {
    playlistEl.querySelectorAll('li').forEach((li, i) => {
        li.classList.toggle('active', i === currentIndex);
    });
}

function loadTrack(index) {
    const t = tracks[index];
    audio.src = t.src;
    trackNameEl.textContent = t.name;
    trackAlbumEl.textContent = t.album;
    progress.value = 0;
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
    updateActivePlaylist();

    // Заглушка длительности (пока не загрузился файл)
    const li = playlistEl.querySelectorAll('li')[index];
    if (li) li.querySelector('.dur').textContent = '—';
}

function playTrack() {
    audio.play().then(() => {
        isPlaying = true;
        playBtn.textContent = '⏸';
        vinyl.classList.add('playing');
    }).catch(() => {
        // Файла нет — показываем уведомление, но UI не ломаем
        showToast('Файл трека не найден. Положите mp3 в папку /audio/');
    });
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playBtn.textContent = '▶';
    vinyl.classList.remove('playing');
}

function togglePlay() {
    if (isPlaying) pauseTrack();
    else playTrack();
}

// --- Кнопки ---
playBtn.addEventListener('click', togglePlay);

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentIndex);
    playTrack();
});

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % tracks.length;
    loadTrack(currentIndex);
    playTrack();
});

// --- Прогресс ---
audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = fmt(audio.duration);
    const li = playlistEl.querySelectorAll('li')[currentIndex];
    if (li && !isNaN(audio.duration)) li.querySelector('.dur').textContent = fmt(audio.duration);
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        progress.value = (audio.currentTime / audio.duration) * 100;
        
        // ВОТ ЭТА НОВАЯ СТРОКА:
        progress.style.setProperty('--value', progress.value + '%');
        
        currentTimeEl.textContent = fmt(audio.currentTime);
    }
});

progress.addEventListener('input', () => {
    if (audio.duration) {
        audio.currentTime = (progress.value / 100) * audio.duration;
        // Добавьте эту строку:
        progress.style.setProperty('--value', progress.value + '%');
    }
});

audio.addEventListener('ended', () => {
    currentIndex = (currentIndex + 1) % tracks.length;
    loadTrack(currentIndex);
    playTrack();
});

volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value;
    // Добавьте эту строку:
    volumeSlider.style.setProperty('--value', (volumeSlider.value * 100) + '%');
});

function fmt(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

buildPlaylist();
loadTrack(0);

// ========== 🔔 TOAST ==========
let toastTimer;
function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ========== ПЛАВНАЯ ПРОКРУТКА (запасной вариант) ==========
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});