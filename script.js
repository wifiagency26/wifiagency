// ======================== GLOBAL VARIABLES ========================
let configData = null;
let dataPaket = {};

// ======================== LOAD CONFIGURATION ========================
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        configData = await response.json();
        
        // Convert config ke format dataPaket yang digunakan oleh fungsi lama
        for (const [providerName, providerData] of Object.entries(configData.providers)) {
            dataPaket[providerName] = providerData.packages;
        }
        
        // Set WhatsApp number
        window.whatsappTargetNumber = configData.whatsappNumber;
        
        // Generate kartu provider dari config
        generateProviderCards();
        
        console.log('✅ Konfigurasi berhasil dimuat!');
    } catch (error) {
        console.error('❌ Gagal memuat config.json:', error);
        alert('Gagal memuat konfigurasi. Pastikan file config.json ada dan formatnya benar!');
    }
}

// ======================== GENERATE PROVIDER CARDS ========================
function generateProviderCards() {
    const gridContainer = document.querySelector('.provider-grid');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    for (const [providerName, providerData] of Object.entries(configData.providers)) {
        const card = document.createElement('div');
        card.className = 'provider-card scroll-animate';
        
        // Build price boxes HTML
        let priceBoxesHtml = '';
        const packages = providerData.packages;
        
        // Kelompokkan paket berdasarkan kategori (opsional, bisa ditampilkan semua)
        priceBoxesHtml += `<div class="price-box"><div class="price-title">Paket Internet</div>`;
        packages.forEach(pkg => {
            priceBoxesHtml += `
                <div class="price-item">
                    <span class="speed-label">${pkg.speed}</span>
                    <span class="price-value">${pkg.price}</span>
                </div>
            `;
        });
        priceBoxesHtml += `</div>`;
        
        card.innerHTML = `
            <div class="card-header">
                <span class="brand-name ${providerData.nameClass}">${providerName}</span>
                <span class="badge ${providerData.badgeClass}">${providerData.badge}</span>
            </div>
            ${priceBoxesHtml}
            <a href="#formulir-pendaftaran" class="card-btn" onclick="setProvider('${providerName}')">Pilih ${providerName}</a>
        `;
        
        gridContainer.appendChild(card);
    }
    
    // Re-attach scroll animation observer untuk card baru
    const newAnimatedElements = document.querySelectorAll('.scroll-animate');
    newAnimatedElements.forEach(el => {
        if (observer) observer.observe(el);
    });
    
    // Re-attach 3D tilt effect
    attachTiltEffect();
}

// ======================== ATTACH 3D TILT EFFECT ========================
function attachTiltEffect() {
    const cardsElements = document.querySelectorAll('.provider-card');
    cardsElements.forEach(card => {
        card.removeEventListener('mousemove', tiltHandler);
        card.removeEventListener('mouseleave', tiltLeaveHandler);
        card.addEventListener('mousemove', tiltHandler);
        card.addEventListener('mouseleave', tiltLeaveHandler);
    });
}

function tiltHandler(e) {
    if (window.innerWidth <= 768) return;
    const card = this;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
}

function tiltLeaveHandler() {
    this.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0)';
}

// ======================== SET PROVIDER FUNCTION ========================
window.setProvider = function(providerName) {
    document.getElementById('nama-provider-label').innerText = providerName;
    document.getElementById('provider_pilihan').value = providerName;
    
    const selectElement = document.getElementById('paket_detail');
    selectElement.innerHTML = '';
    
    if (dataPaket[providerName] && dataPaket[providerName].length > 0) {
        const defaultOpt = document.createElement('option');
        defaultOpt.value = "";
        defaultOpt.innerText = `-- Pilih Paket ${providerName} Sesuai Budget --`;
        selectElement.appendChild(defaultOpt);
        
        dataPaket[providerName].forEach(item => {
            const option = document.createElement('option');
            const fullText = `${item.speed} — ${item.price}`;
            option.value = fullText;
            option.innerText = fullText;
            selectElement.appendChild(option);
        });
    } else {
        const fallbackOpt = document.createElement('option');
        fallbackOpt.value = "";
        fallbackOpt.innerText = `-- Paket untuk ${providerName} akan segera hadir --`;
        selectElement.appendChild(fallbackOpt);
    }
};

// ======================== WHATSAPP INTEGRATION ========================
function handleFormSubmit(event) {
    event.preventDefault();
    
    const whatsappTargetNumber = configData ? configData.whatsappNumber : '6288991652063';
    
    const provider = document.getElementById('provider_pilihan').value;
    const detailPaket = document.getElementById('paket_detail').value;
    const nama = document.getElementById('nama_lengkap').value;
    const alamat = document.getElementById('alamat_lengkap').value;
    const rt = document.getElementById('rt_no').value;
    const rw = document.getElementById('rw_no').value;
    const kelKec = document.getElementById('kel_kec').value;
    const kotaKab = document.getElementById('kota_kab').value;
    const maps = document.getElementById('maps_link').value || '-';
    
    if (!provider || provider === "") {
        alert("⚠️ Silahkan pilih provider WiFi terlebih dahulu!");
        return;
    }
    
    if (!detailPaket || detailPaket === "") {
        alert("⚠️ Silahkan pilih varian kecepatan / paket harga!");
        return;
    }
    
    if (!nama || !alamat || !rt || !rw || !kelKec || !kotaKab) {
        alert("⚠️ Harap lengkapi semua data!");
        return;
    }
    
    const textMessage = `*FORMULIR PENDAFTARAN PASANG BARU WiFi*%0A%0A` +
        `🖥️ *Provider:* ${provider.toUpperCase()}%0A` +
        `📦 *Paket Pilihan:* ${detailPaket}%0A%0A` +
        `👤 *Nama Lengkap:* ${nama}%0A` +
        `📍 *Alamat Pemasangan:* ${alamat}%0A` +
        `🏢 *RT / RW:* ${rt} / ${rw}%0A` +
        `🏡 *Kelurahan / Kecamatan:* ${kelKec}%0A` +
        `🏙️ *Kota / Kabupaten:* ${kotaKab}%0A` +
        `🔗 *Link Google Maps:* ${maps}%0A%0A` +
        `Mohon segera dicek ketersediaan jaringan untuk lokasi saya. Terima kasih!`;
    
    window.open(`https://api.whatsapp.com/send?phone=${whatsappTargetNumber}&text=${textMessage}`, '_blank');
}

// ======================== BACKGROUND PARTICLE ANIMATION ========================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class CyberParticle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 1.2 + 0.4;
        this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
        this.y -= this.speedY;
        if (this.y < -10) {
            this.y = canvas.height + 10;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.fillStyle = `rgba(0, 242, 254, ${this.opacity})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

function initParticles() {
    particlesArray = [];
    const count = Math.min(50, window.innerWidth / 25);
    for (let i = 0; i < count; i++) {
        particlesArray.push(new CyberParticle());
    }
}

initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}

animateParticles();

// ======================== SCROLL REVEAL OBSERVER ========================
let observer = null;

function initScrollObserver() {
    const animatedElements = document.querySelectorAll('.scroll-animate');
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('show');
            else entry.target.classList.remove('show');
        });
    }, { root: null, rootMargin: '-20px 0px', threshold: 0.02 });
    
    animatedElements.forEach(el => observer.observe(el));
}

// ======================== RESPONSIVE NAVBAR ========================
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.getElementById('nav-menu');
if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}
document.querySelectorAll('.navbar-item a').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('active'));
});

// ======================== INITIALIZATION ========================
// Load config first, then initialize everything else
loadConfig().then(() => {
    initScrollObserver();
});

// Make handleFormSubmit available globally
window.handleFormSubmit = handleFormSubmit;
