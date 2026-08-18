    const _sb = supabase.createClient(
      'https://ofmuuzabsgeaonjoympc.supabase.co',
      'sb_publishable_ZpLY0y18asU1U5dZxI95Qg_phbQ_K6U'
    );

    /* ============================================================
       KONFIGURASI TURNSTILE CLOUDFLARE
       ============================================================ */
    const ENABLE_TURNSTILE = true;
    const TURNSTILE_SITE_KEY = '0x4AAAAAAERQdMmvo9fHLf0T';
    const TURNSTILE_SHOW_ON_BERANDA = true; // muncul lalu hilang di beranda

    if (ENABLE_TURNSTILE) {
      // Script dimuat di akhir body agar tidak ganggu animasi
      // (lihat bagian bawah file)
    }
  

/* ============================================
   LOADER
============================================ */
// dots dihandle CSS animation
// Gunakan DOMContentLoaded + timeout agar loader tidak menunggu iframe/video eksternal
const _loaderStart = Date.now();
function _hideLoader(){
  const elapsed = Date.now() - _loaderStart;
  const minShow = 3000;
  const delay = Math.max(0, minShow - elapsed);
  setTimeout(()=>{ document.getElementById('loader').classList.add('out'); }, delay);
}
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', _hideLoader);
} else {
  _hideLoader();
}
// Fallback paksa: loader hilang maksimal 4 detik
setTimeout(()=>{ document.getElementById('loader').classList.add('out'); }, 4000);

/* ============================================
   SPA NAVIGATION
============================================ */
const pages = ['beranda','tentang','fitur','cara-kerja','kontak','roadmap','sdg','makna-pernikahan','pendaftaran-nikah','simulasi-biaya-nikah','modul-edukasi'];
let currentPage = 'beranda';

function goPage(id){
  // - Feature gate check -
  if(!rmCheckGate(id)) return;
  // Track visited gated pages (for gate logic)
  if(GATE_PAGES.includes(id)) _visitedFeatures.add(id);

  // hide all
  pages.forEach(p => {
    const el = document.getElementById('page-'+p);
    if(el) el.classList.remove('active');
  });
  // show target - force animation re-trigger every time
  const target = document.getElementById('page-'+id);
  if(target){
    target.style.animation = 'none';
    target.getBoundingClientRect(); // force reflow
    target.style.animation = '';
    target.classList.add('active');
    currentPage = id;
  }

  // update nav active state
  document.querySelectorAll('[data-page]').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll(`[data-page="${id}"]`).forEach(b=>b.classList.add('active'));
  document.querySelectorAll('[data-mob]').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll(`[data-mob="${id}"]`).forEach(b=>b.classList.add('active'));

  // solid navbar on non-hero pages
  const nb = document.getElementById('navbar');
  if(id !== 'beranda'){ nb.classList.add('solid'); }

  // scroll top instant (morph animation handles the visual, no need for smooth scroll)
  window.scrollTo({top:0,behavior:'instant'});
  closeMob();

  // restore roadmap checklist & reset to first tab
  if(id==='roadmap'){
    switchRoadmapTab('timeline');
    setTimeout(rm10pRestore, 80);
  }
  // reset modul edukasi to first tab
  if(id==='modul-edukasi'){
    switchEduTab('modul');
  }
  // inisialisasi Turnstile saat buka halaman kontak
  if(id==='kontak') setTimeout(initTurnstile, 300);
}

/* ============================================
   NAVBAR SCROLL
============================================ */
const nb = document.getElementById('navbar');
const stb = document.getElementById('scrollTopBtn');
let _nbTicking = false;
function _nbUpdate(){
  if(window.scrollY>60){ nb.classList.add('solid'); stb.classList.add('vis'); }
  else { if(currentPage==='beranda') nb.classList.remove('solid'); stb.classList.remove('vis'); }
  _nbTicking = false;
}
window.addEventListener('scroll',()=>{
  if(!_nbTicking){
    requestAnimationFrame(_nbUpdate);
    _nbTicking = true;
  }
}, {passive:true});

/* ============================================
   BURGER
============================================ */
const burgerBtn = document.getElementById('burgerBtn');
const mobMenu = document.getElementById('mobMenu');
let mobOpen=false;
burgerBtn.addEventListener('click',()=>{
  mobOpen=!mobOpen;
  mobMenu.classList.toggle('open',mobOpen);
  const ss=burgerBtn.querySelectorAll('span');
  if(mobOpen){ss[0].style.transform='rotate(45deg) translate(5px,5px)';ss[1].style.opacity='0';ss[2].style.transform='rotate(-45deg) translate(5px,-5px)';}
  else{ss.forEach(s=>{s.style.transform='';s.style.opacity='';})}
});
function closeMob(){
  mobOpen=false;mobMenu.classList.remove('open');
  const ss=burgerBtn.querySelectorAll('span');
  ss.forEach(s=>{s.style.transform='';s.style.opacity='';});
}

/* ============================================
   RIPPLE
============================================ */
document.addEventListener('click',function(e){
  const btn=e.target.closest('.btn');
  if(!btn) return;
  const r=document.createElement('span');
  const rc=btn.getBoundingClientRect();
  const sz=Math.max(rc.width,rc.height);
  r.className='ripple';
  r.style.cssText=`width:${sz}px;height:${sz}px;left:${e.clientX-rc.left-sz/2}px;top:${e.clientY-rc.top-sz/2}px`;
  btn.appendChild(r);setTimeout(()=>r.remove(),600);
});

/* ============================================
   FEATURE DETAIL DATA
============================================ */
const features=[
  {
    title:'Makna Pernikahan',icon:'fa-hand-holding-heart',cls:'ic1',
    desc:'Pelajari makna pernikahan yang sesungguhnya dalam perspektif Islam - dari mitsaqon gholidzo hingga membangun rumah tangga yang sakinah, mawaddah, warahmah.',
    points:['Makna pernikahan sebagai ibadah dan sunnah Rasulullah ﷺ','Hak dan kewajiban suami-istri dalam Islam','Persiapan mental dan spiritual sebelum menikah','Tips membangun komunikasi yang sehat dalam rumah tangga','Landasan Al-Qur\'an dan Hadits tentang pernikahan'],
    extra:'Modul ini terdiri dari 8 sub-bab interaktif yang dapat dipelajari kapan saja dan di mana saja.'
  },
  {
    title:'Pendaftaran Nikah',icon:'fa-file-signature',cls:'ic2',
    desc:'Panduan lengkap dan terpercaya untuk proses pendaftaran pernikahan di KUA secara resmi, legal, dan mudah dipahami oleh calon pengantin.',
    points:['Dokumen yang wajib disiapkan oleh kedua calon pengantin','Prosedur pendaftaran di KUA setempat','Timeline dan jadwal pemeriksaan nikah','Biaya administrasi resmi dan cara pembayaran','Persyaratan khusus untuk pernikahan lintas kabupaten/kota'],
    extra:'Dilengkapi dengan checklist digital yang bisa diunduh dan dicetak untuk kemudahan persiapan.'
  },
  {
    title:'Simulasi Biaya Nikah',icon:'fa-calculator',cls:'ic4',
    desc:'Kalkulator interaktif cerdas untuk merencanakan dan mensimulasikan total biaya pernikahan sesuai anggaran Anda - dari mahar hingga resepsi dan bulan madu.',
    points:['Simulasi biaya mahar, mas kawin, dan seserahan','Estimasi biaya akad nikah dan resepsi','Rencana tabungan bulanan menuju hari H','Perbandingan harga vendor pernikahan lokal','Export hasil simulasi dalam format PDF'],
    extra:'Kalkulator terintegrasi dengan data harga riil di 34 provinsi Indonesia.'
  },
  {
    title:'Roadmap 10 Tahun Pernikahan',icon:'fa-route',cls:'ic5',
    desc:'Peta perjalanan terstruktur dan terencana untuk sepuluh tahun pertama pernikahan - dari fondasi keluarga, kepemilikan rumah, hingga pengembangan aset dan stabilitas finansial.',
    points:['Tahap Fondasi (Th 1-2): budgeting & dana darurat','Tahap Rumah (Th 3-4): DP dan KPR syariah pertama','Tahap Keluarga (Th 5-6): dana pendidikan & kesehatan anak','Tahap Pengembangan Aset (Th 7-8): investasi & passive income','Tahap Stabilitas (Th 9-10): bebas utang & dana pensiun'],
    extra:'Roadmap 10 Tahun dirancang fleksibel - sesuaikan tiap tahap dengan kondisi finansial dan target keluarga Anda.'
  },
  {
    title:'Modul Edukasi Interaktif',icon:'fa-book-open-reader',cls:'ic6',
    desc:'Seri modul pembelajaran mendalam dan interaktif tentang literasi finansial, komunikasi keluarga, parenting Islami, dan pengembangan diri bagi pasangan muda.',
    points:['Literasi keuangan: budgeting, investasi halal, asuransi syariah','Komunikasi asertif dan manajemen konflik dalam keluarga','Parenting Islami: mendidik anak di era digital','Manajemen stres dan kesehatan mental keluarga','Sertifikat digital setelah menyelesaikan setiap modul'],
    extra:'Lebih dari 40 modul yang terus diperbarui oleh tim pakar berpengalaman.'
  },
  {
    title:'Dashboard SDGs',icon:'fa-chart-pie',cls:'ic7',
    desc:'Monitor dan visualisasikan kontribusi keluarga Anda terhadap 17 Tujuan Pembangunan Berkelanjutan (SDGs) secara personal, interaktif, dan bermakna.',
    points:['Peta kontribusi keluarga terhadap 17 SDGs','Indikator kesejahteraan keluarga yang terukur','Progress report bulanan dan tahunan','Benchmark dengan rata-rata keluarga Indonesia','Rekomendasi aksi nyata untuk meningkatkan skor SDGs'],
    extra:'Merupakan satu-satunya fitur dashboard SDGs berbasis keluarga yang pertama di Indonesia.'
  }
];
const clrMap={ic1:{bg:'#E8F4EF',c:'#1B6B5A'},ic2:{bg:'#FBF0DC',c:'#C8963E'},ic3:{bg:'#EBF3FF',c:'#3A7BD5'},ic4:{bg:'#FFF0E8',c:'#E8703A'},ic5:{bg:'#EEE8FF',c:'#7B5EA7'},ic6:{bg:'#E8FBF4',c:'#22A97A'},ic7:{bg:'#FFF4E8',c:'#D4932A'}};

function openDetail(i){
  const f=features[i], cl=clrMap[f.cls]||{bg:'#E8F4EF',c:'#1B6B5A'};
  const iconEl=document.getElementById('dIcon');
  iconEl.style.background=cl.bg;iconEl.style.color=cl.c;
  iconEl.innerHTML=`<i class="fa-solid ${f.icon}" style="font-size:1.8rem"></i>`;
  document.getElementById('dTitle').textContent=f.title;
  document.getElementById('dDesc').textContent=f.desc;

  // Sub-fitur untuk Makna Pernikahan (index 0)
  const subFiturHTML = (i === 0) ? `
    <div style="margin-bottom:20px">
      <h4 style="font-size:.82rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Sub Fitur</h4>
      <div class="sf-pill-wrap">
        <button class="sf-pill" onclick="openSubFitur('syarat-sah-nikah')">
          <span class="sf-pill-icon" style="background:#E8F4EF;color:var(--p)"><i class="fa-solid fa-scroll"></i></span>
          <span class="sf-pill-label">Syarat Sah Nikah</span>
          <i class="fa-solid fa-chevron-right sf-pill-arrow"></i>
        </button>
        <button class="sf-pill" onclick="openSubFitur('nikah-simpel-urip-apik')">
          <span class="sf-pill-icon" style="background:#FBF0DC;color:var(--gold)"><i class="fa-solid fa-star-and-crescent"></i></span>
          <span class="sf-pill-label">Nikah Simpel Urip Apik</span>
          <i class="fa-solid fa-chevron-right sf-pill-arrow"></i>
        </button>
      </div>
    </div>` : (i === 2) ? `
    <div style="margin-bottom:20px">
      <h4 style="font-size:.82rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Sub Fitur</h4>
      <div class="sf-pill-wrap">
        <button class="sf-pill" style="cursor:default">
          <span class="sf-pill-icon" style="background:#EBF3FF;color:#3A7BD5"><i class="fa-solid fa-scale-balanced"></i></span>
          <span class="sf-pill-label">Nikah Simpel vs Nikah Mewah</span>
        </button>
        <button class="sf-pill" style="cursor:default">
          <span class="sf-pill-icon" style="background:#FFF0E8;color:#E8703A"><i class="fa-solid fa-calculator"></i></span>
          <span class="sf-pill-label">Kalkulator Nikah</span>
        </button>
      </div>
    </div>` : (i === 3) ? `
    <div style="margin-bottom:20px">
      <h4 style="font-size:.82rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Sub Fitur</h4>
      <div class="sf-pill-wrap">
        <button class="sf-pill" onclick="openSubFitur('roadmap-10-tahun')">
          <span class="sf-pill-icon" style="background:#EEE8FF;color:#7B5EA7"><i class="fa-solid fa-route"></i></span>
          <span class="sf-pill-label">Roadmap 10 Tahun</span>
          <i class="fa-solid fa-chevron-right sf-pill-arrow"></i>
        </button>
        <button class="sf-pill" onclick="openSubFitur('perencanaan-masa-depan')">
          <span class="sf-pill-icon" style="background:#E8F4EF;color:var(--p)"><i class="fa-solid fa-seedling"></i></span>
          <span class="sf-pill-label">Perencanaan Masa Depan</span>
          <i class="fa-solid fa-chevron-right sf-pill-arrow"></i>
        </button>
      </div>
    </div>` : '';

  // Sub-fitur untuk Modul Edukasi (index 4)
  const eduSubFiturHTML = (i === 4) ? `
    <div style="margin-bottom:20px">
      <h4 style="font-size:.82rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Sub Fitur</h4>
      <div class="sf-pill-wrap">
        <button class="sf-pill" onclick="closeDetail();goPage('modul-edukasi')">
          <span class="sf-pill-icon" style="background:#E8FBF4;color:#22A97A"><i class="fa-solid fa-book-open-reader"></i></span>
          <span class="sf-pill-label">Modul Edukasi</span>
          <i class="fa-solid fa-chevron-right sf-pill-arrow"></i>
        </button>
        <button class="sf-pill" onclick="openSubFitur('live-youtube')">
          <span class="sf-pill-icon" style="background:#FFE8E8;color:#E05252"><i class="fa-brands fa-youtube"></i></span>
          <span class="sf-pill-label">Live YouTube</span>
          <i class="fa-solid fa-chevron-right sf-pill-arrow"></i>
        </button>
      </div>
    </div>` : '';

  // Sub-fitur untuk Dashboard SDGs (index 5)
  const sdgSubFiturHTML = (i === 5) ? `
    <div style="margin-bottom:20px">
      <h4 style="font-size:.82rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Sub Fitur</h4>
      <div class="sf-pill-wrap">
        <button class="sf-pill" onclick="closeDetail();setTimeout(()=>openSubFitur('sdg-komitmen'),120)">
          <span class="sf-pill-icon" style="background:#FFF4E8;color:#D4932A"><i class="fa-solid fa-pen-nib"></i></span>
          <span class="sf-pill-label">Komitmen SDGs</span>
          <i class="fa-solid fa-chevron-right sf-pill-arrow"></i>
        </button>
        <button class="sf-pill" onclick="closeDetail();setTimeout(()=>openSubFitur('sdg-ringkasan'),120)">
          <span class="sf-pill-icon" style="background:#E8F4EF;color:var(--p)"><i class="fa-solid fa-id-card"></i></span>
          <span class="sf-pill-label">Ringkasan Profil</span>
          <i class="fa-solid fa-chevron-right sf-pill-arrow"></i>
        </button>
      </div>
    </div>` : '';

  document.getElementById('dBody').innerHTML=`
    ${subFiturHTML}${eduSubFiturHTML}${sdgSubFiturHTML}
    <div class="info-block"><h4>Yang Akan Anda Pelajari</h4><ul>${f.points.map(p=>`<li>${p}</li>`).join('')}</ul></div>
    <div class="info-block" style="background:var(--bg-alt);border-radius:var(--r-sm);padding:14px 16px;margin-top:8px">
      <p style="font-size:.84rem;color:var(--txt)"><i class="fa-solid fa-circle-info" style="color:var(--p);margin-right:6px"></i>${f.extra}</p>
    </div>`;
  document.getElementById('detailPanel').classList.add('open');
  document.body.style.overflow='hidden';
  document.getElementById('navbar').style.display='none';
}
function openRoadmap10(){
  openDetail(3);
  setTimeout(()=>openSubFitur('roadmap-10-tahun'),80);
}
function openDashboardSDGs(){
  goPage('sdg');
  setTimeout(()=>{ switchSdgTab('komitmen'); sdgcpInitCanvas(); sdgcpLoadSaved(); },80);
}
function closeDetail(){
  document.getElementById('detailPanel').classList.remove('open');
  document.body.style.overflow='';
  document.getElementById('navbar').style.display='';
  closeSubFitur();
}
function closeDetailOutside(e){if(e.target===document.getElementById('detailPanel'))closeDetail();}

/* Sub Fitur Panel */
function openSubFitur(id){
  const subData={
    'syarat-sah-nikah':{
      title:'Syarat Sah Nikah',
      icon:'fa-scroll',
      iconBg:'#E8F4EF',iconColor:'var(--p)',
      desc:'Rukun dan syarat sahnya pernikahan dalam Islam',
      hasGallery: true
    },
    'nikah-simpel-urip-apik':{
      title:'Nikah Simpel Urip Apik',
      icon:'fa-star-and-crescent',
      iconBg:'#FBF0DC',iconColor:'var(--gold)',
      desc:'',
      hasGallery: false
    },
    'perencanaan-masa-depan':{
      title:'Perencanaan Masa Depan',
      icon:'fa-seedling',
      iconBg:'#E8F4EF',iconColor:'var(--p)',
      desc:'Proyeksi investasi dan estimasi kebutuhan keluarga jangka panjang',
      hasGallery: false
    },
    'roadmap-10-tahun':{
      title:'Roadmap 10 Tahun',
      icon:'fa-route',
      iconBg:'#EEE8FF',iconColor:'#7B5EA7',
      desc:'Timeline perjalanan finansial keluarga - dari fondasi hingga stabilitas',
      hasGallery: false
    },
    'modul-edukasi':{
      title:'Modul Edukasi',
      icon:'fa-book-open-reader',
      iconBg:'#E8F0FF',iconColor:'#3A7BD5',
      desc:'Modul pembelajaran interaktif seputar pernikahan, keluarga, dan finansial Islami',
      hasGallery: false
    },
    'live-youtube':{
      title:'Live YouTube',
      icon:'fa-brands fa-youtube',
      iconBg:'#FFE8E8',iconColor:'#E05252',
      desc:'Tonton siaran langsung kajian pernikahan dan keluarga Islami bersama RUKUN MAPAN',
      hasGallery: false
    },
    'sdg-komitmen':{
      title:'Komitmen SDGs',
      icon:'fa-pen-nib',
      iconBg:'#FFF4E8',iconColor:'#D4932A',
      desc:'Nyatakan komitmen keluarga terhadap Tujuan Pembangunan Berkelanjutan',
      hasGallery: false
    },
    'sdg-ringkasan':{
      title:'Ringkasan Profil',
      icon:'fa-id-card',
      iconBg:'#E8F4EF',iconColor:'var(--p)',
      desc:'Ringkasan komitmen dan aktivitas SDGs keluarga Anda',
      hasGallery: false
    }
  };
  const d=subData[id];if(!d)return;
  const panel=document.getElementById('subFiturPanel');
  document.getElementById('sfIcon').style.background=d.iconBg;
  document.getElementById('sfIcon').style.color=d.iconColor;
  document.getElementById('sfIcon').innerHTML=`<i class="fa-solid ${d.icon}" style="font-size:1.6rem"></i>`;
  document.getElementById('sfTitle').textContent=d.title;
  document.getElementById('sfDesc').textContent=d.desc;
  
  if(id==='syarat-sah-nikah'){
    // Responsive image selection based on device width
    const w = window.innerWidth;
    let imgSrc;
    if(w >= 1024){
      // Laptop/desktop: landscape image (1210x666)
      imgSrc = '';
    } else if(w >= 600){
      // Tablet: medium image (1218x904)
      imgSrc = '';
    } else {
      // HP/mobile: portrait image (1218x1714)
      imgSrc = '';
    }
    document.getElementById('sfBody').innerHTML=`
      <div style="padding:8px 0 16px">
        <img loading="lazy" src="${imgSrc}" alt="Syarat Sah Nikah" 
          onclick="openFullscreen(this.src)"
          style="width:100%;border-radius:var(--r-md);cursor:zoom-in;transition:transform .3s ease;display:block"
          title="Klik untuk fullscreen"
        />
        <p style="text-align:center;font-size:.72rem;color:var(--muted);margin-top:8px"><i class="fa-solid fa-magnifying-glass-plus" style="margin-right:4px"></i>Klik gambar untuk melihat fullscreen</p>
      </div>`;
  } else if(id==='roadmap-10-tahun'){
    document.getElementById('sfBody').innerHTML = `
      <style>
        .rm10-wrap{display:flex;flex-direction:column;gap:0;position:relative;padding-left:32px}
        .rm10-wrap::before{content:'';position:absolute;left:11px;top:10px;bottom:10px;width:2px;background:linear-gradient(to bottom,#7B5EA7 0%,#3A7BD5 25%,#E8703A 50%,#C8963E 75%,#1B6B5A 100%);border-radius:2px}
        .rm10-stage{position:relative;padding:0 0 24px 16px}
        .rm10-stage:last-child{padding-bottom:4px}
        .rm10-dot{position:absolute;left:-32px;top:3px;width:22px;height:22px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 0 2px currentColor;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}
        .rm10-dot i{font-size:.65rem}
        .rm10-badge{font-size:.64rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;padding:3px 10px;border-radius:99px;display:inline-block;margin-bottom:5px}
        .rm10-title{font-size:.93rem;font-weight:800;margin:0 0 4px;color:var(--txt)}
        .rm10-desc{font-size:.77rem;color:var(--muted);line-height:1.55;margin-bottom:9px}
        .rm10-cl{display:flex;flex-direction:column;gap:6px}
        .rm10-cl label{display:flex;align-items:flex-start;gap:9px;font-size:.78rem;color:var(--txt);cursor:pointer;line-height:1.45}
        .rm10-cl input[type=checkbox]{width:15px;height:15px;border-radius:4px;accent-color:var(--p);flex-shrink:0;margin-top:1px;cursor:pointer}
        .rm10-cl input[type=checkbox]:checked + span{text-decoration:line-through;color:var(--muted)}
        .rm10-cta{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:24px;background:linear-gradient(135deg,var(--p-dark),var(--p));color:#fff;border:none;padding:13px 22px;border-radius:99px;font-family:var(--ff);font-size:.88rem;font-weight:800;cursor:pointer;width:100%;transition:opacity .2s;box-shadow:0 4px 14px rgba(27,107,90,.28)}
        .rm10-cta:hover{opacity:.87}
        .rm10-foot{font-size:.71rem;color:var(--muted);text-align:center;margin-top:10px;line-height:1.6}
      </style>

      <div style="text-align:center;margin-bottom:20px">
        <span style="display:inline-flex;align-items:center;gap:6px;background:#EEE8FF;color:#7B5EA7;font-size:.75rem;font-weight:700;padding:5px 14px;border-radius:99px">
          <i class="fa-solid fa-route"></i> Timeline 10 Tahun Pertama
        </span>
        <p style="font-size:.82rem;color:var(--muted);margin-top:8px;line-height:1.55">Panduan perjalanan finansial keluarga - centang yang sudah tercapai.</p>
      </div>

      <div class="rm10-wrap">

        <!-- Tahap 1 -->
        <div class="rm10-stage">
          <div class="rm10-dot" style="background:#7B5EA7;box-shadow:0 0 0 2px #7B5EA7"><i class="fa-solid fa-seedling"></i></div>
          <span class="rm10-badge" style="background:#EEE8FF;color:#7B5EA7">Tahun 1 - 2</span>
          <div class="rm10-title">Fondasi Keluarga</div>
          <div class="rm10-desc">Bangun kebiasaan finansial yang sehat sejak awal menikah.</div>
          <div class="rm10-cl">
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Susun anggaran rumah tangga bersama</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Bangun dana darurat 3-6 bulan pengeluaran</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Lunasi utang konsumtif yang ada</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Mulai menabung rutin bersama</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Daftarkan BPJS Kesehatan &amp; Ketenagakerjaan</span></label>
          </div>
        </div>

        <!-- Tahap 2 -->
        <div class="rm10-stage">
          <div class="rm10-dot" style="background:#3A7BD5;box-shadow:0 0 0 2px #3A7BD5"><i class="fa-solid fa-house"></i></div>
          <span class="rm10-badge" style="background:#EBF3FF;color:#3A7BD5">Tahun 3 - 4</span>
          <div class="rm10-title">Rumah Pertama</div>
          <div class="rm10-desc">Wujudkan hunian untuk keluarga muda.</div>
          <div class="rm10-cl">
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Kumpulkan uang muka (DP) rumah</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Riset pilihan KPR yang sesuai kemampuan</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Pastikan cicilan tidak melebihi 30% penghasilan</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Siapkan biaya administrasi dan renovasi awal</span></label>
          </div>
        </div>

        <!-- Tahap 3 -->
        <div class="rm10-stage">
          <div class="rm10-dot" style="background:#E8703A;box-shadow:0 0 0 2px #E8703A"><i class="fa-solid fa-heart"></i></div>
          <span class="rm10-badge" style="background:#FFF0E8;color:#E8703A">Tahun 5 - 6</span>
          <div class="rm10-title">Keluarga Berkembang</div>
          <div class="rm10-desc">Persiapkan masa depan anak dengan perencanaan yang matang.</div>
          <div class="rm10-cl">
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Siapkan dana pendidikan anak</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Siapkan dana persalinan dan kesehatan anak</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Pertimbangkan asuransi jiwa keluarga</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Review dan sesuaikan anggaran dengan kebutuhan baru</span></label>
          </div>
        </div>

        <!-- Tahap 4 -->
        <div class="rm10-stage">
          <div class="rm10-dot" style="background:#C8963E;box-shadow:0 0 0 2px #C8963E"><i class="fa-solid fa-chart-line"></i></div>
          <span class="rm10-badge" style="background:#FBF0DC;color:#C8963E">Tahun 7 - 8</span>
          <div class="rm10-title">Pengembangan Aset</div>
          <div class="rm10-desc">Mulai berinvestasi agar uang bekerja untuk keluarga.</div>
          <div class="rm10-cl">
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Mulai investasi rutin sesuai profil risiko</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Diversifikasi aset - saham, reksa dana, emas</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Pertimbangkan properti sebagai aset produktif</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Mulai menyisihkan untuk dana pensiun</span></label>
          </div>
        </div>

        <!-- Tahap 5 -->
        <div class="rm10-stage">
          <div class="rm10-dot" style="background:#1B6B5A;box-shadow:0 0 0 2px #1B6B5A"><i class="fa-solid fa-shield-halved"></i></div>
          <span class="rm10-badge" style="background:#E8F4EF;color:#1B6B5A">Tahun 9 - 10</span>
          <div class="rm10-title">Stabilitas &amp; Warisan</div>
          <div class="rm10-desc">Keluarga mandiri finansial dan siap mewariskan kebaikan.</div>
          <div class="rm10-cl">
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Target bebas utang konsumtif</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Dana hari tua sudah terbentuk</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Susun perencanaan waris dan wasiat</span></label>
            <label><input type="checkbox" onchange="rm10Save(this)"><span>Evaluasi pencapaian &amp; susun visi 10 tahun berikutnya</span></label>
          </div>
        </div>

      </div>

      <button class="rm10-cta" onclick="closeSubFitur();setTimeout(()=>openSubFitur('perencanaan-masa-depan'),120)">
        <i class="fa-solid fa-seedling"></i> Mulai Perencanaan Masa Depan
      </button>
      <p class="rm10-foot"><i class="fa-solid fa-circle-info" style="color:var(--p);margin-right:4px"></i>Panduan umum - sesuaikan dengan kondisi dan target keluarga Anda.</p>
    `;
    // Muat status checklist dari sessionStorage
    setTimeout(()=>{
      document.querySelectorAll('.rm10-cl input[type=checkbox]').forEach((cb,i)=>{
        if(sessionStorage.getItem('rm10_'+i)==='1') cb.checked=true;
      });
    },50);
  } else if(id==='perencanaan-masa-depan'){
    const sfBodyEl = document.getElementById('sfBody');
    // Ambil konten dari tab rencanakan-masa-depan yang sudah ada
    const srcEl = document.getElementById('sbTab-rencanakan-masa-depan');
    if(srcEl){
      sfBodyEl.innerHTML = '<div style="padding:4px 0">' + srcEl.innerHTML + '</div>';
      // Jalankan ulang hitungProyeksi jika tersedia
      if(typeof hitungProyeksi === 'function') setTimeout(hitungProyeksi, 100);
    } else {
      sfBodyEl.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--muted)"><i class="fa-solid fa-clock" style="font-size:2.5rem;color:var(--border);margin-bottom:14px;display:block"></i><p style="font-size:.9rem">Konten sedang disiapkan...</p></div>`;
    }
  } else if(id==='sdg-komitmen'){
    // Ambil data tersimpan
    const saved = {
      nama:    sessionStorage.getItem('sdg_nama')    || '',
      kota:    sessionStorage.getItem('sdg_kota')    || '',
      sdg1:    sessionStorage.getItem('sdg_sdg1')==='1',
      sdg3:    sessionStorage.getItem('sdg_sdg3')==='1',
      sdg4:    sessionStorage.getItem('sdg_sdg4')==='1',
      sdg10:   sessionStorage.getItem('sdg_sdg10')==='1',
      sdg16:   sessionStorage.getItem('sdg_sdg16')==='1',
      signed:  sessionStorage.getItem('sdg_signed')==='1',
      tanggal: sessionStorage.getItem('sdg_tanggal') || '',
    };
    document.getElementById('sfBody').innerHTML = `
      <style>
        .sdgc-section{margin-bottom:18px}
        .sdgc-label{font-size:.75rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}
        .sdgc-input{width:100%;padding:10px 13px;border:1.5px solid var(--border);border-radius:var(--r-sm);background:var(--bg);font-family:var(--ff);font-size:.88rem;color:var(--txt);outline:none;transition:border-color .2s}
        .sdgc-input:focus{border-color:var(--p);background:#fff}
        .sdg-checks{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .sdg-check-item{display:flex;align-items:center;gap:9px;padding:9px 12px;border:1.5px solid var(--border);border-radius:var(--r-sm);cursor:pointer;transition:var(--tr);background:#fff;user-select:none}
        .sdg-check-item:hover{border-color:var(--p-light);background:var(--bg-alt)}
        .sdg-check-item.checked{border-color:var(--p);background:var(--bg-alt)}
        .sdg-check-item input{display:none}
        .sdg-check-ico{width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.7rem;flex-shrink:0}
        .sdg-check-txt{font-size:.77rem;font-weight:600;color:var(--txt);line-height:1.3}
        .sdgc-canvas-wrap{border:2px dashed var(--border);border-radius:var(--r-md);background:#fafafa;overflow:hidden;position:relative}
        .sdgc-canvas-wrap canvas{display:block;touch-action:none;cursor:crosshair;width:100%;height:110px}
        .sdgc-canvas-hint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:.45;font-size:.78rem;color:var(--muted);gap:6px}
        .sdgc-canvas-hint.hidden{display:none}
        .sdgc-signed-badge{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg-alt);border:1.5px solid var(--border);border-radius:var(--r-md);font-size:.82rem;color:var(--txt)}
        .sdgc-signed-badge i{color:var(--p)}
        .sdgc-btn-row{display:flex;gap:8px;margin-top:4px}
        .sdgc-btn-clear{flex:1;padding:9px;border:1.5px solid var(--border);border-radius:var(--r-sm);background:#fff;font-family:var(--ff);font-size:.8rem;font-weight:600;color:var(--muted);cursor:pointer;transition:var(--tr)}
        .sdgc-btn-clear:hover{border-color:var(--p);color:var(--p)}
        .sdgc-btn-save{flex:2;padding:9px;background:linear-gradient(135deg,var(--p-dark),var(--p));border:none;border-radius:var(--r-sm);font-family:var(--ff);font-size:.82rem;font-weight:700;color:#fff;cursor:pointer;transition:opacity .2s;display:flex;align-items:center;justify-content:center;gap:7px}
        .sdgc-btn-save:hover{opacity:.88}
        .sdgc-success{display:none;text-align:center;padding:28px 16px;background:linear-gradient(135deg,var(--bg-alt),#F0FAF5);border-radius:var(--r-md);border:1.5px solid rgba(27,107,90,.22);animation:sdgSuccIn .4s cubic-bezier(.4,0,.2,1)}
        @keyframes sdgSuccIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .sdgc-success i{font-size:2.4rem;color:var(--p);display:block;margin-bottom:12px;animation:sdgCheckPop .5s cubic-bezier(.175,.885,.32,1.275) .1s both}
        @keyframes sdgCheckPop{from{transform:scale(0)}to{transform:scale(1)}}
        .sdgc-success h4{font-size:1rem;font-weight:800;color:var(--txt);margin-bottom:6px}
        .sdgc-success p{font-size:.81rem;color:var(--muted);line-height:1.65}
      </style>

      <div id="sdgc-form">

        <!-- Deklarasi -->
        <div class="sdgc-section">
          <div style="background:linear-gradient(135deg,#E8F4EF,#F5FAF8);border:1.5px solid rgba(27,107,90,.18);border-radius:var(--r-md);padding:16px 18px">
            <div style="display:flex;align-items:flex-start;gap:12px">
              <div style="width:36px;height:36px;border-radius:10px;background:rgba(27,107,90,.12);color:var(--p);display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0;margin-top:2px"><i class="fa-solid fa-earth-asia"></i></div>
              <div>
                <div style="font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--p);margin-bottom:6px">Deklarasi Komitmen Keluarga</div>
                <p style="font-size:.82rem;color:var(--txt);line-height:1.75;margin:0">
                  Saya berkomitmen sebagai bagian dari keluarga Indonesia untuk mendukung
                  <strong>Tujuan Pembangunan Berkelanjutan (SDGs)</strong> - dengan membangun
                  keluarga yang sehat, berpendidikan, bermartabat, dan berkontribusi nyata
                  pada kesejahteraan masyarakat bersama, sesuai nilai Islam
                  yang <em>rahmatan lil 'alamin</em>.
                </p>
                <p style="font-size:.76rem;color:var(--muted);margin-top:8px;font-family:var(--fs);font-style:italic">
                  "Dan jadilah kamu tolong-menolong dalam kebaikan dan takwa." - QS. Al-Maidah: 2
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Identitas -->
        <div class="sdgc-section">
          <div class="sdgc-label"><i class="fa-solid fa-user" style="margin-right:5px;color:var(--gold)"></i>Identitas Keluarga</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
            <input id="sdgc-nama" class="sdgc-input" type="text" placeholder="Nama Kepala Keluarga" value="${saved.nama}"/>
            <input id="sdgc-kota" class="sdgc-input" type="text" placeholder="Kota / Kabupaten" value="${saved.kota}"/>
          </div>
        </div>

        <!-- SDGs yang didukung -->
        <div class="sdgc-section">
          <div class="sdgc-label"><i class="fa-solid fa-earth-asia" style="margin-right:5px;color:var(--gold)"></i>SDGs yang Kami Dukung</div>
          <div class="sdg-checks">
            <label class="sdg-check-item${saved.sdg1?' checked':''}" onclick="this.classList.toggle('checked');this.querySelector('input').checked=!this.querySelector('input').checked">
              <input type="checkbox" id="sdgc-cb1" ${saved.sdg1?'checked':''}>
              <div class="sdg-check-ico" style="background:#FFF0E8;color:#E8703A"><i class="fa-solid fa-hand-holding-dollar"></i></div>
              <span class="sdg-check-txt">SDG #1<br>Tanpa Kemiskinan</span>
            </label>
            <label class="sdg-check-item${saved.sdg3?' checked':''}" onclick="this.classList.toggle('checked');this.querySelector('input').checked=!this.querySelector('input').checked">
              <input type="checkbox" id="sdgc-cb3" ${saved.sdg3?'checked':''}>
              <div class="sdg-check-ico" style="background:#E8F4EF;color:#2E9B6E"><i class="fa-solid fa-heart-pulse"></i></div>
              <span class="sdg-check-txt">SDG #3<br>Kesehatan</span>
            </label>
            <label class="sdg-check-item${saved.sdg4?' checked':''}" onclick="this.classList.toggle('checked');this.querySelector('input').checked=!this.querySelector('input').checked">
              <input type="checkbox" id="sdgc-cb4" ${saved.sdg4?'checked':''}>
              <div class="sdg-check-ico" style="background:#FBF0DC;color:#C8963E"><i class="fa-solid fa-graduation-cap"></i></div>
              <span class="sdg-check-txt">SDG #4<br>Pendidikan</span>
            </label>
            <label class="sdg-check-item${saved.sdg10?' checked':''}" onclick="this.classList.toggle('checked');this.querySelector('input').checked=!this.querySelector('input').checked">
              <input type="checkbox" id="sdgc-cb10" ${saved.sdg10?'checked':''}>
              <div class="sdg-check-ico" style="background:#EBF3FF;color:#3A7BD5"><i class="fa-solid fa-people-roof"></i></div>
              <span class="sdg-check-txt">SDG #10<br>Kesetaraan</span>
            </label>
            <label class="sdg-check-item${saved.sdg16?' checked':''}" onclick="this.classList.toggle('checked');this.querySelector('input').checked=!this.querySelector('input').checked" style="grid-column:span 2">
              <input type="checkbox" id="sdgc-cb16" ${saved.sdg16?'checked':''}>
              <div class="sdg-check-ico" style="background:#EEE8FF;color:#7B5EA7"><i class="fa-solid fa-scale-balanced"></i></div>
              <span class="sdg-check-txt">SDG #16 - Perdamaian, Keadilan &amp; Kelembagaan</span>
            </label>
          </div>
        </div>

        <!-- Tanda Tangan -->
        <div class="sdgc-section">
          <div class="sdgc-label" style="display:flex;justify-content:space-between;align-items:center">
            <span><i class="fa-solid fa-pen-nib" style="margin-right:5px;color:var(--gold)"></i>Tanda Tangan Digital</span>
            ${saved.signed ? `<span style="font-size:.7rem;color:var(--p);font-weight:700"><i class="fa-solid fa-circle-check" style="margin-right:3px"></i>Tersimpan</span>` : ''}
          </div>
          ${saved.signed ? `
            <div class="sdgc-signed-badge">
              <i class="fa-solid fa-circle-check"></i>
              <div>
                <div style="font-weight:700;font-size:.83rem">Tanda tangan tersimpan</div>
                <div style="font-size:.74rem;color:var(--muted)">${saved.tanggal}</div>
              </div>
              <button onclick="sdgcResetSign()" style="margin-left:auto;border:1.5px solid var(--border);background:#fff;border-radius:99px;padding:5px 12px;font-family:var(--ff);font-size:.74rem;font-weight:600;color:var(--muted);cursor:pointer">Ulangi</button>
            </div>` : `
            <div class="sdgc-canvas-wrap">
              <canvas id="sdgcCanvas" height="110"></canvas>
              <div class="sdgc-canvas-hint" id="sdgcHint"><i class="fa-solid fa-pen-to-square"></i> Tanda tangani di sini</div>
            </div>
            <div class="sdgc-btn-row">
              <button class="sdgc-btn-clear" onclick="sdgcClear()"><i class="fa-solid fa-eraser"></i> Hapus</button>
            </div>`}
        </div>

        <!-- Konfirmasi persetujuan -->
        <div style="display:flex;align-items:flex-start;gap:10px;padding:11px 13px;background:#fff;border:1.5px solid var(--border);border-radius:var(--r-sm);cursor:pointer" onclick="var cb=this.querySelector('input');cb.checked=!cb.checked;this.style.borderColor=cb.checked?'var(--p)':'var(--border)';this.style.background=cb.checked?'var(--bg-alt)':'#fff'">
          <input type="checkbox" id="sdgc-agree" style="width:16px;height:16px;accent-color:var(--p);flex-shrink:0;margin-top:1px;cursor:pointer" onclick="event.stopPropagation()">
          <span style="font-size:.78rem;color:var(--txt);line-height:1.55">Saya menyetujui deklarasi komitmen di atas dan bersedia mendukung SDGs dalam kehidupan keluarga saya.</span>
        </div>

        <button class="sdgc-btn-save" onclick="sdgcSimpan()" style="margin-top:2px">
          <i class="fa-solid fa-pen-nib"></i> Konfirmasi &amp; Tanda Tangani Komitmen
        </button>
      </div>

      <div class="sdgc-success" id="sdgc-success">
        <i class="fa-solid fa-circle-check"></i>
        <h4>Komitmen SDGs Ditandatangani!</h4>
        <p>Masyaa Allah - terima kasih telah berkomitmen untuk mendukung keluarga yang berkelanjutan.<br>Deklarasi Anda telah dicatat pada <strong id="sdgc-tgl-success"></strong>.</p>
        <div style="display:flex;gap:8px;margin-top:16px;justify-content:center;flex-wrap:wrap">
          <button onclick="closeSubFitur();setTimeout(()=>openSubFitur('sdg-ringkasan'),120)" style="background:linear-gradient(135deg,var(--p-dark),var(--p));border:none;color:#fff;padding:10px 22px;border-radius:99px;font-family:var(--ff);font-size:.83rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:7px"><i class="fa-solid fa-id-card"></i> Lihat Ringkasan Profil</button>
          <button onclick="sdgcResetSign()" style="background:transparent;border:1.5px solid var(--border);color:var(--muted);padding:10px 18px;border-radius:99px;font-family:var(--ff);font-size:.82rem;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px"><i class="fa-solid fa-rotate-left"></i> Ulangi</button>
        </div>
      </div>
    `;
    // Init canvas
    if(!saved.signed) setTimeout(()=>sdgcInitCanvas(), 60);

  } else if(id==='sdg-ringkasan'){
    const nama    = sessionStorage.getItem('sdg_nama')    || '-';
    const kota    = sessionStorage.getItem('sdg_kota')    || '-';
    const tanggal = sessionStorage.getItem('sdg_tanggal') || '-';
    const signed  = sessionStorage.getItem('sdg_signed')==='1';
    // SDGs yang dipilih
    const sdgMap  = {1:'#1 Tanpa Kemiskinan',3:'#3 Kesehatan',4:'#4 Pendidikan',10:'#10 Kesetaraan',16:'#16 Perdamaian'};
    const sdgIco  = {1:'fa-hand-holding-dollar',3:'fa-heart-pulse',4:'fa-graduation-cap',10:'fa-people-roof',16:'fa-scale-balanced'};
    const sdgClr  = {1:'#E8703A',3:'#2E9B6E',4:'#C8963E',10:'#3A7BD5',16:'#7B5EA7'};
    const sdgBg   = {1:'#FFF0E8',3:'#E8F4EF',4:'#FBF0DC',10:'#EBF3FF',16:'#EEE8FF'};
    const sdgList = [1,3,4,10,16].filter(n=>sessionStorage.getItem('sdg_sdg'+n)==='1');

    // Hitung aktivitas dari kalkulator nikah & roadmap
    const ckTotal  = (()=>{
      const ids=['ck-lamaran','ck-mahar','ck-cincin-nikah','ck-kua','ck-dekor-akad','ck-gedung','ck-catering','ck-gaun','ck-foto','ck-tiket'];
      const parseRpLocal = id=>{ const el=document.getElementById(id); if(!el||!el.value) return 0; return parseFloat(el.value.replace(/\./g,'').replace(/[^0-9]/g,''))||0; };
      return ids.reduce((s,id)=>s+parseRpLocal(id),0);
    })();
    const ckFmt    = ckTotal>0 ? 'Rp '+Math.round(ckTotal).toLocaleString('id-ID') : null;
    const rmChecked = document.querySelectorAll('#rmTab-timeline input[type=checkbox]:checked').length;
    const rmTotal   = document.querySelectorAll('#rmTab-timeline input[type=checkbox]').length;

    /* - Computed values for sub-panel - */
    const rpInitials=nama.split(' ').filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('')||'?';
    const rpRmPct=rmTotal>0?Math.round(rmChecked/rmTotal*100):0;
    const rpSdgPct=Math.round(sdgList.length/5*100);

    document.getElementById('sfBody').innerHTML = `
      ${!signed ? `
      <div style="text-align:center;padding:40px 16px">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--bg-alt);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 14px"><i class="fa-solid fa-pen-nib" style="font-size:1.3rem;color:var(--border)"></i></div>
        <p style="font-size:.85rem;color:var(--muted);line-height:1.65;margin-bottom:16px">Anda belum membuat komitmen SDGs.<br>Mulai dari sub fitur <strong>Komitmen SDGs</strong>.</p>
        <button onclick="closeSubFitur();setTimeout(()=>openSubFitur('sdg-komitmen'),120)" style="background:linear-gradient(135deg,var(--p-dark),var(--p));border:none;color:#fff;padding:10px 22px;border-radius:99px;font-family:var(--ff);font-size:.83rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:7px"><i class="fa-solid fa-pen-nib"></i> Buat Komitmen Sekarang</button>
      </div>` : `

      <!-- Profile Card -->
      <div class="sdg-profile-card" style="margin-bottom:12px">
        <div class="spc-banner">
          <div class="spc-avatar">${rpInitials}</div>
          <div class="spc-name-block">
            <div class="spc-name">${nama}</div>
            <div class="spc-city"><i class="fa-solid fa-location-dot"></i> ${kota}</div>
          </div>
          <div class="spc-committed-badge"><i class="fa-solid fa-circle-check"></i> Berkomitmen</div>
        </div>
        <div class="spc-stats">
          <div class="spc-stat">
            <div class="spc-stat-val">${sdgList.length}<span style="font-size:.62rem;font-weight:600;color:var(--muted)">/5</span></div>
            <div class="spc-stat-lbl">SDGs</div>
          </div>
          <div class="spc-stat-div"></div>
          <div class="spc-stat">
            <div class="spc-stat-val">${rpRmPct}<span style="font-size:.62rem;font-weight:600;color:var(--muted)">%</span></div>
            <div class="spc-stat-lbl">Roadmap</div>
          </div>
          <div class="spc-stat-div"></div>
          <div class="spc-stat">
            <div class="spc-stat-val" style="font-size:.7rem;line-height:1.3">${tanggal.replace(/\s+\d{4}$/,'')}</div>
            <div class="spc-stat-lbl">Sejak</div>
          </div>
        </div>
      </div>

      <!-- SDGs Section -->
      <div class="sdg-prof-sec" style="margin-bottom:12px">
        <div class="sdg-prof-sec-hd"><i class="fa-solid fa-earth-asia"></i> SDGs yang Didukung</div>
        <div class="sdg-pill-grid-prof">
          ${sdgList.length>0
            ? sdgList.map(n=>`<span class="sdg-pill-prof" style="background:${sdgBg[n]};color:${sdgClr[n]};border-color:${sdgBg[n]}"><i class="fa-solid ${sdgIco[n]}"></i> ${sdgMap[n]}</span>`).join('')
            : `<span style="font-size:.82rem;color:var(--muted)">Belum ada SDGs dipilih.</span>`
          }
        </div>
        <div class="spc-prog-wrap"><div class="spc-prog-fill" style="width:${rpSdgPct}%"></div></div>
        <div class="spc-prog-lbl">${sdgList.length} dari 5 dipilih - ${rpSdgPct}%</div>
      </div>

      <!-- Aktivitas Section -->
      <div class="sdg-prof-sec" style="margin-bottom:12px">
        <div class="sdg-prof-sec-hd"><i class="fa-solid fa-chart-bar"></i> Ringkasan Aktivitas</div>
        <div class="sdg-act-grid">
          ${ckFmt?`<div class="sdg-act-item">
            <div class="sdg-act-ico" style="color:#E8703A"><i class="fa-solid fa-calculator"></i></div>
            <div class="sdg-act-val" style="color:#E8703A;font-size:.76rem">${ckFmt}</div>
            <div class="sdg-act-lbl">Est. Biaya Nikah</div>
          </div>`:''}
          <div class="sdg-act-item">
            <div class="sdg-act-ico" style="color:#7B5EA7"><i class="fa-solid fa-route"></i></div>
            <div class="sdg-act-val" style="color:#7B5EA7">${rmChecked}<span style="font-size:.7rem;font-weight:600;color:var(--muted)">/${rmTotal}</span></div>
            <div class="sdg-act-lbl">Roadmap 10 Tahun</div>
          </div>
          <div class="sdg-act-item">
            <div class="sdg-act-ico" style="color:var(--p)"><i class="fa-solid fa-pen-nib"></i></div>
            <div class="sdg-act-val" style="margin-top:2px"><span class="sdg-act-badge" style="background:#E8F4EF;color:var(--p)"><i class="fa-solid fa-circle-check"></i> Signed</span></div>
            <div class="sdg-act-lbl">Komitmen SDGs</div>
          </div>
          <div class="sdg-act-item">
            <div class="sdg-act-ico" style="color:var(--gold)"><i class="fa-solid fa-calendar-check"></i></div>
            <div class="sdg-act-val" style="font-size:.7rem;line-height:1.4">${tanggal}</div>
            <div class="sdg-act-lbl">Tanggal</div>
          </div>
        </div>
      </div>

      <!-- Quote -->
      <div class="sdg-quote-card" style="margin-bottom:12px">
        <p>"Keluarga yang berkomitmen pada kebaikan adalah fondasi peradaban yang kokoh."</p>
        <span>- RUKUN MAPAN × SDGs Indonesia</span>
      </div>

      <!-- Update CTA -->
      <button class="sdg-update-btn" onclick="closeSubFitur();setTimeout(()=>openSubFitur('sdg-komitmen'),120)">
        <i class="fa-solid fa-pen-nib"></i> Perbarui Komitmen SDGs
      </button>
      `}
    `;

  } else if(id==='modul-edukasi'){
    // Langsung buka halaman fullscreen Modul Edukasi
    closeSubFitur();
    closeDetail();
    goPage('modul-edukasi');
    return;

  } else if(id==='live-youtube'){
    // Langsung buka fullscreen YouTube overlay - tutup panel sub-fitur dulu
    closeSubFitur();
    openYoutubeFullscreen('Vgr9XH2g398');
    return;

  } else {
    document.getElementById('sfBody').innerHTML=`<div style="text-align:center;padding:40px 20px;color:var(--muted)"><i class="fa-solid fa-clock" style="font-size:2.5rem;color:var(--border);margin-bottom:14px;display:block"></i><p style="font-size:.9rem">Konten sedang disiapkan...</p></div>`;
  }
  panel.classList.add('open');
}
async function rm10Save(cb){
  const cbs=document.querySelectorAll('.rm10-cl input[type=checkbox]');
  cbs.forEach((c,i)=>sessionStorage.setItem('rm10_'+i,c.checked?'1':'0'));
  if(!rmCurrentUser) return;
  const { data:{ session } } = await _sb.auth.getSession();
  if(!session) return;
  const rows=[...cbs].map((c,i)=>({ user_id:session.user.id, item_index:i, is_checked:c.checked }));
  await _sb.from('roadmap_progress').upsert(rows,{ onConflict:'user_id,item_index' });
}
function closeSubFitur(){
  const panel=document.getElementById('subFiturPanel');
  if(panel){ panel.classList.remove('open'); panel.classList.remove('fullscreen-mode'); }
  // Also close any stuck fullscreen overlay
  const ov=document.getElementById('imgFullscreenOv');
  if(ov) ov.style.display='none';
  // Restore scroll & navbar if no other panel open
  const anyPanelOpen =
    document.getElementById('detailPanel')?.classList.contains('open') ||
    document.getElementById('authPanel')?.classList.contains('open');
  if(!anyPanelOpen){
    document.body.style.overflow='';
    document.getElementById('navbar').style.display='';
  }
}

// Fullscreen image viewer
function openFullscreen(src){
  let ov=document.getElementById('imgFullscreenOv');
  if(!ov){
    ov=document.createElement('div');
    ov.id='imgFullscreenOv';
    ov.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.96);display:flex;align-items:center;justify-content:center;cursor:zoom-out;animation:fsOvIn .25s ease';
    const style=document.createElement('style');
    style.textContent='@keyframes fsOvIn{from{opacity:0}to{opacity:1}}';
    document.head.appendChild(style);
    const img=document.createElement('img');
    img.style.cssText='max-width:98vw;max-height:96vh;object-fit:contain;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.5)';
    const closeBtn=document.createElement('button');
    closeBtn.innerHTML='<i class="fa-solid fa-xmark"></i>';
    closeBtn.style.cssText='position:absolute;top:16px;right:16px;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;border:none;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;transition:background .2s ease';
    closeBtn.onmouseover=()=>closeBtn.style.background='rgba(255,255,255,.28)';
    closeBtn.onmouseout=()=>closeBtn.style.background='rgba(255,255,255,.15)';
    closeBtn.onclick=(e)=>{e.stopPropagation();closeFullscreen();}
    ov.appendChild(img);
    ov.appendChild(closeBtn);
    ov.onclick=closeFullscreen;
    document.body.appendChild(ov);
  }
  ov.querySelector('img').src=src;
  ov.style.display='flex';
  document.body.style.overflow='hidden';
}
function closeFullscreen(){
  const ov=document.getElementById('imgFullscreenOv');
  if(ov){ov.style.display='none';}
  // Restore overflow only if no other panel is still open
  const anyPanelOpen =
    document.getElementById('detailPanel')?.classList.contains('open') ||
    document.getElementById('subFiturPanel')?.classList.contains('open') ||
    document.getElementById('authPanel')?.classList.contains('open');
  if(!anyPanelOpen) document.body.style.overflow='';
}

/* ============================================
   YOUTUBE FULLSCREEN OVERLAY
============================================ */
function openYoutubeFullscreen(videoId){
  const ovId = 'ytFullscreenOv';
  let ov = document.getElementById(ovId);
  if(!ov){
    ov = document.createElement('div');
    ov.id = ovId;
    ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.97);display:flex;flex-direction:column;align-items:center;justify-content:center;animation:fsOvIn .25s ease';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    closeBtn.style.cssText = 'position:absolute;top:16px;right:16px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;border:none;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;transition:background .2s;z-index:2';
    closeBtn.onmouseover = ()=>closeBtn.style.background='rgba(255,255,255,.3)';
    closeBtn.onmouseout  = ()=>closeBtn.style.background='rgba(255,255,255,.15)';
    closeBtn.onclick = (e)=>{ e.stopPropagation(); closeYoutubeFullscreen(); };

    // Live badge
    const badge = document.createElement('div');
    badge.style.cssText = 'position:absolute;top:18px;left:20px;display:flex;align-items:center;gap:7px;background:rgba(224,82,82,.18);border:1.5px solid rgba(224,82,82,.4);color:#FF6B6B;padding:6px 14px;border-radius:99px;font-size:.78rem;font-weight:700;font-family:var(--ff);z-index:2';
    badge.innerHTML = '<i class="fa-solid fa-circle" style="font-size:.5rem;animation:pulse 1.2s infinite"></i> LIVE';

    // iFrame wrapper (responsive 16:9 max 90vw × 90vh)
    const wrap = document.createElement('div');
    wrap.style.cssText = 'width:min(90vw,calc(90vh*16/9));aspect-ratio:16/9;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.7);background:#000;position:relative;z-index:1';

    const iframe = document.createElement('iframe');
    iframe.id = 'ytFsIframe';
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.title = 'RUKUN MAPAN Live';

    // Fallback link
    const fallback = document.createElement('p');
    fallback.style.cssText = 'color:rgba(255,255,255,.45);font-size:.75rem;margin-top:12px;font-family:var(--ff);text-align:center;position:relative;z-index:1';
    fallback.innerHTML = 'Tidak bisa putar? <a href="https://www.youtube.com/live/Vgr9XH2g398?si=-KgSzNUzYok2KRCm" target="_blank" rel="noopener" style="color:#FF6B6B;font-weight:600;text-decoration:none">Buka di YouTube ↗</a>';

    wrap.appendChild(iframe);
    ov.appendChild(badge);
    ov.appendChild(closeBtn);
    ov.appendChild(wrap);
    ov.appendChild(fallback);
    ov.onclick = (e)=>{ if(e.target===ov) closeYoutubeFullscreen(); };
    document.body.appendChild(ov);
  }

  // Set/update src with autoplay
  document.getElementById('ytFsIframe').src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  ov.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeYoutubeFullscreen(){
  const ov = document.getElementById('ytFullscreenOv');
  if(ov){
    // Stop video by clearing src
    const iframe = document.getElementById('ytFsIframe');
    if(iframe) iframe.src = '';
    ov.style.display = 'none';
  }
  const anyPanelOpen =
    document.getElementById('detailPanel')?.classList.contains('open') ||
    document.getElementById('subFiturPanel')?.classList.contains('open') ||
    document.getElementById('authPanel')?.classList.contains('open');
  if(!anyPanelOpen) document.body.style.overflow='';
}

/* ============================================
   MODUL EDUKASI READER
============================================ */
function openEduReader(){
  const ov = document.getElementById('eduReaderOv');
  const frame = document.getElementById('eduReaderFrame');
  if(!ov || !frame) return;
  // Lazy-load iframe saat dibuka
  if(!frame.src || frame.src === window.location.href){
    frame.src = 'https://drive.google.com/file/d/1Pc6zPsvfpZWbOE-_0USqZzbeFwVhbv6z/preview';
  }
  ov.classList.add('edu-open');
  document.body.style.overflow = 'hidden';
}
function closeEduReader(){
  const ov = document.getElementById('eduReaderOv');
  if(ov) ov.classList.remove('edu-open');
  const anyPanelOpen =
    document.getElementById('detailPanel')?.classList.contains('open') ||
    document.getElementById('subFiturPanel')?.classList.contains('open') ||
    document.getElementById('authPanel')?.classList.contains('open');
  if(!anyPanelOpen) document.body.style.overflow = '';
}

/* ============================================
   SECURITY: HTML Escape Utility
   Semua data yang berasal dari input pengguna
   wajib melewati fungsi ini sebelum masuk innerHTML
============================================ */
function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str==null ? '' : String(str);
  return div.innerHTML;
}
const RM_EMAIL_REGEX = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

/* ============================================
   AUTH SYSTEM - Supabase
============================================ */

// - Feature gate tracking -
let _visitedFeatures = new Set();
const GATE_PAGES = ['makna-pernikahan','pendaftaran-nikah','simulasi-biaya-nikah','roadmap','sdg'];

// - Current user state -
let rmCurrentUser = null;

async function rmInitSession(){
  const { data: { session } } = await _sb.auth.getSession();
  if(session){
    const { data: profile } = await _sb.from('profiles').select('nama, kota').eq('id', session.user.id).maybeSingle();
    rmCurrentUser = {
      nama: profile?.nama || session.user.email,
      email: session.user.email,
      kota: profile?.kota || ''
    };
    rmUpdateNavUI();
    loadSimulasi(); // Restore data kalkulator dari Supabase saat halaman load
  }
}

function rmUpdateNavUI(){
  const navCta = document.getElementById('navCta');
  const mobNavCta = document.getElementById('mobNavCta');
  if(!navCta) return;

  if(rmCurrentUser){
    const initials = escapeHtml(rmCurrentUser.nama.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase());
    const namaAman = escapeHtml(rmCurrentUser.nama);
    const emailAman = escapeHtml(rmCurrentUser.email);
    const avatarHtml = `<button onclick="toggleUserMenu(event)" style="display:flex;align-items:center;gap:9px;background:var(--bg-alt);border:1.5px solid var(--border);border-radius:99px;padding:6px 14px 6px 6px;cursor:pointer;font-family:var(--ff);transition:var(--tr)" onmouseover="this.style.borderColor='var(--p)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="width:28px;height:28px;border-radius:50%;background:var(--p);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800">${initials}</div>
      <span style="font-size:.82rem;font-weight:700;color:var(--text);max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(rmCurrentUser.nama.split(' ')[0])}</span>
      <i class="fa-solid fa-chevron-down" style="font-size:.62rem;color:var(--muted)"></i>
    </button>`;
    navCta.innerHTML = avatarHtml;
    if(mobNavCta){
      mobNavCta.innerHTML = `<div style="padding:4px 0;display:flex;align-items:center;gap:10px">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--p);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800">${initials}</div>
        <div><div style="font-size:.88rem;font-weight:700;color:var(--text)">${namaAman}</div><div style="font-size:.75rem;color:var(--muted)">${emailAman}</div></div>
      </div>
      <button onclick="doLogout()" class="btn btn-outline" style="margin-top:6px;color:#B91C1C;border-color:#FECACA"><i class="fa-solid fa-right-from-bracket"></i> Keluar</button>`;
    }
  } else {
    navCta.innerHTML = `<button class="btn btn-outline btn-sm" onclick="openAuth('masuk')">Masuk</button>
      <button class="btn btn-primary btn-sm" onclick="openAuth('daftar')"><i class="fa-solid fa-rocket"></i> Daftar</button>`;
    if(mobNavCta){
      mobNavCta.innerHTML = `<button class="btn btn-outline" onclick="openAuth('masuk')">Masuk</button>
        <button class="btn btn-primary" onclick="openAuth('daftar')"><i class="fa-solid fa-rocket"></i> Daftar Gratis</button>`;
    }
  }

  // Update user menu dropdown
  const drop = document.getElementById('userMenuDrop');
  if(drop && rmCurrentUser){
    document.getElementById('userMenuName').textContent = rmCurrentUser.nama;
    document.getElementById('userMenuEmail').textContent = rmCurrentUser.email;
  }
}

function toggleUserMenu(e){
  e.stopPropagation();
  const drop = document.getElementById('userMenuDrop');
  drop.style.display = drop.style.display==='block' ? 'none' : 'block';
}
document.addEventListener('click', ()=>{ const d=document.getElementById('userMenuDrop'); if(d) d.style.display='none'; });

// - openAuth (entry point) -
let _authGateMode = false; // true when triggered by feature gate

function openAuth(type, gateMsg){
  _authGateMode = !!gateMsg;
  const banner = document.getElementById('authGateBanner');
  if(gateMsg && banner){
    banner.style.display='flex';
    document.getElementById('authGateMsg').textContent = gateMsg;
  } else if(banner){
    banner.style.display='none';
  }
  switchAuthTab(type||'daftar');
  document.getElementById('authPanel').classList.add('open');
  document.body.style.overflow='hidden';
  document.getElementById('navbar').style.display='none';
}

function switchAuthTab(tab){
  const isDaftar = tab==='daftar';
  document.getElementById('formDaftar').style.display = isDaftar ? 'flex' : 'none';
  document.getElementById('formMasuk').style.display = isDaftar ? 'none' : 'flex';
  // style tabs
  document.getElementById('tabDaftar').style.background = isDaftar ? 'var(--p)' : 'var(--bg-alt)';
  document.getElementById('tabDaftar').style.color = isDaftar ? '#fff' : 'var(--muted)';
  document.getElementById('tabMasuk').style.background = isDaftar ? 'var(--bg-alt)' : 'var(--p)';
  document.getElementById('tabMasuk').style.color = isDaftar ? 'var(--muted)' : '#fff';
  // clear errors
  ['regErr','loginErr'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
}

function togglePassVis(inputId, btn){
  const inp = document.getElementById(inputId);
  const isPass = inp.type==='password';
  inp.type = isPass ? 'text' : 'password';
  btn.querySelector('i').className = isPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
}

function closeAuth(){
  document.getElementById('authPanel').classList.remove('open');
  document.body.style.overflow='';
  document.getElementById('navbar').style.display='';
  _authGateMode = false;
}
function closeAuthOutside(e){ if(e.target===document.getElementById('authPanel')) closeAuth(); }

function showAuthErr(id, msg){
  const el = document.getElementById(id);
  el.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> '+msg;
  el.style.display='block';
}

// - Register -
async function doRegister(){
  const nama  = document.getElementById('regNama').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('regPass').value;

  if(!nama){ showAuthErr('regErr','Nama lengkap wajib diisi.'); return; }
  if(nama.length>150){ showAuthErr('regErr','Nama terlalu panjang (maks 150 karakter).'); return; }
  if(!email||!RM_EMAIL_REGEX.test(email)){ showAuthErr('regErr','Format email tidak valid.'); return; }
  if(pass.length<8){ showAuthErr('regErr','Password minimal 8 karakter.'); return; }
  if(!/[a-zA-Z]/.test(pass) || !/[0-9]/.test(pass)){ showAuthErr('regErr','Password harus mengandung huruf dan angka.'); return; }

  const { data, error } = await _sb.auth.signUp({
    email,
    password: pass,
    options: { data: { nama } }
  });

  if(error){ showAuthErr('regErr', error.message); return; }

  rmCurrentUser = { nama, email, kota: '' };
  rmUpdateNavUI();
  closeAuth();
  showToast('🎉 Selamat datang, '+nama.split(' ')[0]+'! Akun berhasil dibuat.');
  ['regNama','regEmail','regPass'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
}

// - Login rate-limit (client-side soft lockout) -
// Catatan: ini lapisan tambahan di sisi tampilan saja, bukan pengganti
// rate-limiting resmi Supabase Auth. Direset saat halaman di-reload.
let _loginFailCount = 0;
let _loginLockUntil = 0;
const LOGIN_MAX_ATTEMPT = 5;
const LOGIN_LOCK_MS = 60000; // 60 detik

// - Login -
async function doLogin(){
  const now = Date.now();
  if(now < _loginLockUntil){
    const sisa = Math.ceil((_loginLockUntil-now)/1000);
    showAuthErr('loginErr','Terlalu banyak percobaan gagal. Coba lagi dalam '+sisa+' detik.');
    return;
  }

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('loginPass').value;

  if(!email||!RM_EMAIL_REGEX.test(email)){ showAuthErr('loginErr','Masukkan email yang valid.'); return; }
  if(!pass){ showAuthErr('loginErr','Password wajib diisi.'); return; }

  const { data, error } = await _sb.auth.signInWithPassword({ email, password: pass });

  if(error){
    _loginFailCount++;
    if(_loginFailCount>=LOGIN_MAX_ATTEMPT){
      _loginLockUntil = Date.now()+LOGIN_LOCK_MS;
      _loginFailCount = 0;
      showAuthErr('loginErr','Terlalu banyak percobaan gagal. Coba lagi dalam 60 detik.');
      return;
    }
    showAuthErr('loginErr','Email atau password salah.');
    return;
  }
  _loginFailCount = 0;

  const { data: profile } = await _sb.from('profiles').select('nama, kota').eq('id', data.user.id).maybeSingle();
  rmCurrentUser = {
    nama: profile?.nama || email,
    email,
    kota: profile?.kota || ''
  };
  rmUpdateNavUI();
  closeAuth();
  showToast('👋 Selamat datang kembali, '+(profile?.nama||email).split(' ')[0]+'!');
  ['loginEmail','loginPass'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  loadSimulasi(); // Restore data kalkulator dari Supabase setelah login
}

// - Logout -
async function doLogout(){
  await _sb.auth.signOut();
  rmCurrentUser = null;
  _visitedFeatures.clear();
  rmUpdateNavUI();
  document.getElementById('userMenuDrop').style.display='none';
  showToast('Anda telah keluar. Sampai jumpa! 👋');
}

// - Feature gate check -
// Called before navigating to a feature page
// Returns true if allowed, false if blocked (and opens auth)
function rmCheckGate(pageId){
  if(rmCurrentUser) return true; // logged in → always allow
  if(!GATE_PAGES.includes(pageId)) return true; // not a gated page

  // First visit to any gated page → allow, but record
  if(_visitedFeatures.size === 0){
    _visitedFeatures.add(pageId);
    return true;
  }

  // Already visited one feature and now opening another → gate
  if(!_visitedFeatures.has(pageId)){
    // Show auth with gate message
    openAuth('daftar', 'Daftar gratis atau masuk untuk mengakses lebih banyak fitur RUKUN MAPAN.');
    return false;
  }

  return true; // revisiting same page → allow
}

// - Legacy submitAuth (fallback, tidak dipakai lagi) -
function submitAuth(){ doRegister(); }

/* ============================================
   CONTACT FORM
============================================ */
async function submitForm(){
  const nama=document.getElementById('fNama').value.trim();
  const email=document.getElementById('fEmail').value.trim();
  const topik=document.getElementById('fTopik').value;
  const pesan=document.getElementById('fPesan').value.trim();
  if(!nama||!email||!pesan){showToast('Harap isi semua field yang wajib diisi (*).','err');return;}
  if(!RM_EMAIL_REGEX.test(email)){showToast('Format email tidak valid.','err');return;}
  if(nama.length>150){showToast('Nama terlalu panjang (maks 150 karakter).','err');return;}
  if(pesan.length>2000){showToast('Pesan terlalu panjang (maks 2000 karakter).','err');return;}
  // Turnstile verification - hanya aktif kalau ENABLE_TURNSTILE = true
  if(ENABLE_TURNSTILE){
    const token=document.querySelector('[name="cf-turnstile-response"]')?.value||'';
    if(!token){showToast('Verifikasi keamanan gagal. Silakan coba lagi.','err');return;}
  }
  const btn=document.querySelector('#formArea .btn-primary');
  const origHtml=btn?btn.innerHTML:'';
  if(btn){btn.disabled=true;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';}
  try{
    let uid=null;
    if(rmCurrentUser){const {data:{session}}=await _sb.auth.getSession();uid=session?.user.id||null;}
    const {error}=await _sb.from('kontak_pesan').insert({nama,email,topik:topik||null,pesan,user_id:uid});
    if(error) throw error;
    document.getElementById('formArea').style.display='none';
    document.getElementById('formSuccess').style.display='block';
  }catch(err){
    console.error('Kontak error:',err);
    showToast('Gagal mengirim pesan. Silakan coba lagi.','err');
    if(btn){btn.disabled=false;btn.innerHTML=origHtml;}
  }
}
function resetForm(){
  document.getElementById('formArea').style.display='block';
  document.getElementById('formSuccess').style.display='none';
  ['fNama','fEmail','fTopik','fPesan'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  // Reset Turnstile token jika aktif
  if(ENABLE_TURNSTILE && typeof turnstile !== 'undefined') turnstile.reset();
}

// Inisialisasi Turnstile widget saat halaman kontak dibuka
function initTurnstile(){
  if(!ENABLE_TURNSTILE) return;
  const container=document.getElementById('turnstile-container');
  const widget=document.getElementById('cf-turnstile-widget');
  if(!container||!widget) return;
  container.style.display='block';
  // Render widget hanya sekali
  if(!widget.hasAttribute('data-turnstile-rendered')){
    widget.setAttribute('data-sitekey', TURNSTILE_SITE_KEY);
    widget.setAttribute('data-turnstile-rendered','1');
    if(typeof turnstile !== 'undefined') turnstile.render('#cf-turnstile-widget',{sitekey:TURNSTILE_SITE_KEY});
  }
}

/* ============================================
   FAQ
============================================ */
function toggleFaq(el){
  const item=el.parentElement;
  const isOpen=item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(f=>f.classList.remove('open'));
  if(!isOpen) item.classList.add('open');
}

/* ============================================
   TOAST
============================================ */
function showToast(msg, type='ok'){
  const t=document.createElement('div');
  t.style.cssText=`position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(0);z-index:9999;background:${type==='err'?'#e05252':'var(--p)'};color:#fff;padding:12px 24px;border-radius:99px;font-size:.88rem;font-weight:600;box-shadow:0 6px 24px rgba(0,0,0,.2);white-space:nowrap;animation:toastIn .35s ease;max-width:calc(100vw - 40px);text-align:center;white-space:normal`;
  t.textContent=msg;
  const style=document.createElement('style');style.textContent='@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
  document.head.appendChild(style);
  document.body.appendChild(t);
  setTimeout(()=>{t.style.transition='opacity .3s ease';t.style.opacity='0';setTimeout(()=>t.remove(),300);},3200);
}

/* ============================================
   FEATURE SHOWCASE - selectFeat
============================================ */
let currentFeatIdx=0;
const featMeta=[
  {icon:'fa-hand-holding-heart',cls:'ic1',color:'#1B6B5A',badge:'Spiritualitas',num:'01'},
  {icon:'fa-file-signature',cls:'ic2',color:'#C8963E',badge:'Administrasi',num:'02'},
  {icon:'fa-calculator',cls:'ic4',color:'#E8703A',badge:'Simulasi',num:'03'},
  {icon:'fa-route',cls:'ic5',color:'#7B5EA7',badge:'Perencanaan',num:'04'},
  {icon:'fa-book-open-reader',cls:'ic6',color:'#22A97A',badge:'Edukasi',num:'05'},
  {icon:'fa-chart-pie',cls:'ic7',color:'#D4932A',badge:'Monitoring',num:'06'},
];

function selectFeat(idx,el){
  currentFeatIdx=idx;
  const f=features[idx], m=featMeta[idx];
  // update active state on list
  document.querySelectorAll('.feat-item').forEach(i=>i.classList.remove('active'));
  el.classList.add('active');
  // rebuild spotlight with animation
  const top=document.getElementById('fsTop');
  top.style.animation='none'; top.offsetHeight; // reflow
  top.style.animation='fsIn .32s cubic-bezier(.4,0,.2,1)';
  // big number
  document.getElementById('fsNumBig').textContent=m.num;
  // badge
  const badge=document.getElementById('fsBadge');
  badge.textContent=m.badge;
  badge.className='fs-badge '+m.cls;
  // icon
  const ico=document.getElementById('fsIcon');
  ico.className='fs-icon-wrap '+m.cls;
  ico.innerHTML=`<i class="fa-solid ${m.icon}"></i>`;
  // title & desc
  document.getElementById('fsTitle').textContent=f.title;
  document.getElementById('fsDesc').textContent=f.desc;
  // points (show first 3)
  const pts=f.points.slice(0,3);
  document.getElementById('fsPoints').innerHTML=pts.map(p=>
    `<div class="fs-point"><div class="fsp-dot" style="background:${m.color}"><i class="fa-solid fa-check" style="font-size:.5rem"></i></div>${p}</div>`
  ).join('');
  // extra info
  document.getElementById('fsExtra').innerHTML=`<i class="fa-solid fa-circle-info"></i>${f.extra}`;
  // detail button
  document.getElementById('fsBtn').onclick=()=>openDetail(idx);
}

// auto-cycle every 5s, pause on hover
let featTimer=null, featIdx=0;
function startFeatCycle(){
  featTimer=setInterval(()=>{
    featIdx=(featIdx+1)%features.length;
    const items=document.querySelectorAll('.feat-item');
    if(items[featIdx]) selectFeat(featIdx,items[featIdx]);
  },5000);
}
function stopFeatCycle(){clearInterval(featTimer);}
document.addEventListener('DOMContentLoaded',()=>{
  rmInitSession().then(()=>{
    // Setelah session restored, restore roadmap checklist dari Supabase
    setTimeout(()=>{ if(typeof rm10pRestore==='function') rm10pRestore(); }, 300);
  }); // restore login state on load
  const sc=document.getElementById('featShowcase');
  if(sc){
    startFeatCycle();
    sc.addEventListener('mouseenter',stopFeatCycle);
    sc.addEventListener('mouseleave',startFeatCycle);
  }
});

/* ============================================
   ESC key
============================================ */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeDetail();closeAuth();closeYoutubeFullscreen();closeEduReader();}
});

/* ============================================
   ✨ SCROLL REVEAL - IntersectionObserver
============================================ */
(function initReveal(){
  const revealEls=document.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-scale');
  if(!revealEls.length) return;
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  revealEls.forEach(el=>observer.observe(el));
})();

/* ============================================
   ✨ ANIMATED STAT COUNTERS
============================================ */
function animateCounter(el,target,suffix='',duration=1400){
  const start=performance.now();
  const isFloat=target%1!==0;
  function update(ts){
    const elapsed=ts-start;
    const progress=Math.min(elapsed/duration,1);
    const eased=1-Math.pow(1-progress,4);
    const current=isFloat?(eased*target).toFixed(1):Math.floor(eased*target);
    el.textContent=current+suffix;
    if(progress<1) requestAnimationFrame(update);
    else el.textContent=target+suffix;
  }
  requestAnimationFrame(update);
}

// Trigger counter when stats come into view
(function initCounters(){
  const statEl=document.getElementById('statFitur');
  if(!statEl) return;
  const statParent=statEl.closest('.hero-stats');
  if(!statParent) return;
  const obs=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){
      animateCounter(statEl,7,'+');
      obs.disconnect();
    }
  },{threshold:.5});
  obs.observe(statParent);
})();

/* ============================================
   ✨ HERO ORB PARALLAX (mouse move)
============================================ */
(function initParallax(){
  const hero=document.querySelector('.hero');
  const orb1=document.querySelector('.hero-orb1');
  const orb2=document.querySelector('.hero-orb2');
  const ab1=document.querySelector('.aurora-blob.ab1');
  const ab2=document.querySelector('.aurora-blob.ab2');
  if(!hero||!orb1||!orb2) return;
  hero.addEventListener('mousemove',e=>{
    const rect=hero.getBoundingClientRect();
    const x=(e.clientX-rect.left)/rect.width-.5;
    const y=(e.clientY-rect.top)/rect.height-.5;
    orb1.style.transform=`translate(${x*24}px,${y*16}px)`;
    orb2.style.transform=`translate(${-x*18}px,${-y*12}px)`;
    if(ab1) ab1.style.transform=`translate(${x*32}px,${y*20}px)`;
    if(ab2) ab2.style.transform=`translate(${-x*28}px,${-y*18}px)`;
  });
  hero.addEventListener('mouseleave',()=>{
    [orb1,orb2,ab1,ab2].forEach(el=>{if(el)el.style.transform='';});
  });
})();

/* ============================================
   ✨ RE-TRIGGER REVEALS ON PAGE NAVIGATION
============================================ */
const origGoPage=window.goPage||function(){};
window.goPage=function(id){
  origGoPage(id);
  setTimeout(()=>{
    const newEls=document.querySelectorAll('#page-'+id+' .reveal:not(.in), #page-'+id+' .reveal-l:not(.in), #page-'+id+' .reveal-r:not(.in), #page-'+id+' .reveal-scale:not(.in)');
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target);}
      });
    },{threshold:.08});
    newEls.forEach(el=>obs.observe(el));
  },100);
};

/* ============================================
   ✨ RIPPLE EFFECT on .btn clicks
============================================ */
document.addEventListener('click',function(e){
  const btn=e.target.closest('.btn');
  if(!btn) return;
  const r=document.createElement('span');
  const rect=btn.getBoundingClientRect();
  const size=Math.max(rect.width,rect.height)*2;
  r.className='ripple';
  r.style.cssText=`width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  btn.appendChild(r);
  setTimeout(()=>r.remove(),600);
});

/* ============================================
   ✨ SCROLL-TRIGGERED REVEAL on init
============================================ */
document.addEventListener('DOMContentLoaded',()=>{
  // Immediately reveal already-visible elements
  setTimeout(()=>{
    document.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-scale').forEach(el=>{
      const rect=el.getBoundingClientRect();
      if(rect.top<window.innerHeight*.9) el.classList.add('in');
    });
  },200);
});

/* ============================================
   MAKNA PERNIKAHAN PAGE
============================================ */
const _mkImgDesktop = 'https://lh3.googleusercontent.com/d/1UqSlDCRmFKnJVeLNQpTmBOo1O-CJc1KO';
const _mkImgMobile  = 'https://lh3.googleusercontent.com/d/15O2XcszLCXy0CMpzfcjRgZK1ByEMXVwK';

function getMaknaImg(){
  return window.innerWidth < 768 ? _mkImgMobile : _mkImgDesktop;
}

function switchMaknaTab(id){
  document.querySelectorAll('.mk-tab-content').forEach(el=>el.style.display='none');
  const mkEl=document.getElementById('mkTab-'+id);
  mkEl.style.display='block';
  mkEl.classList.remove('tab-morph');
  mkEl.getBoundingClientRect();
  mkEl.classList.add('tab-morph');
  const on1 = id==='syarat-sah-nikah';
  // Tab 1 - Syarat Sah Nikah (green)
  const b1=document.getElementById('sfTab1'),i1=document.getElementById('sfTab1Icon'),l1=document.getElementById('sfTab1Label');
  b1.style.borderColor = on1 ? 'var(--p)' : 'var(--border)';
  b1.style.background  = on1 ? 'rgba(27,107,90,.07)' : 'var(--card)';
  i1.style.background  = on1 ? 'var(--p)' : 'rgba(27,107,90,.1)';
  i1.style.color       = on1 ? '#fff' : 'var(--p)';
  l1.style.color       = on1 ? 'var(--p)' : 'var(--muted)';
  // Tab 2 - Nikah Simpel Urip Apik (gold)
  const b2=document.getElementById('sfTab2'),i2=document.getElementById('sfTab2Icon'),l2=document.getElementById('sfTab2Label');
  b2.style.borderColor = !on1 ? 'var(--gold)' : 'var(--border)';
  b2.style.background  = !on1 ? 'rgba(200,150,62,.07)' : 'var(--card)';
  i2.style.background  = !on1 ? 'var(--gold)' : 'rgba(200,150,62,.1)';
  i2.style.color       = !on1 ? '#fff' : 'var(--gold)';
  l2.style.color       = !on1 ? 'var(--gold)' : 'var(--muted)';
}

// Override goPage to init makna page on entry
const _origGoPage = window.goPage;
window.goPage = function(id){
  _origGoPage(id);
  if(id === 'makna-pernikahan'){
    // set responsive image
    const img = document.getElementById('mkImg');
    if(img) img.src = getMaknaImg();
    // init tab
    switchMaknaTab('syarat-sah-nikah');
    // make sure navbar shows
    document.getElementById('navbar').style.display='';
  }
};

// Also patch pages array so goPage doesn't fail
if(!pages.includes('makna-pernikahan')) pages.push('makna-pernikahan');

/* ============================================
   PAGE: PENDAFTARAN NIKAH - Sub Fitur Tabs
============================================ */
if(!pages.includes('pendaftaran-nikah')) pages.push('pendaftaran-nikah');

const _pnTabIds = ['pnTab1','pnTab2','pnTab3','pnTab4'];
const _pnContentIds = ['nikah-online','nikah-kua','nikah-kua-vs-luar','cetak-kartu-nikah'];
const _pnActiveColors = [
  {bg:'var(--gold)', shadow:'0 3px 12px rgba(200,150,62,.3)'},
  {bg:'var(--p)',    shadow:'0 3px 12px rgba(27,107,90,.25)'},
  {bg:'#3A7BD5',    shadow:'0 3px 12px rgba(58,123,213,.3)'},
  {bg:'#7B5EA7',    shadow:'0 3px 12px rgba(123,94,167,.3)'},
];

const _kuaVsLuarImgDesktop = 'https://lh3.googleusercontent.com/d/1mO6t9bfiIQX8GLmNLnEPzgqGJ5dA9d09';
const _kuaVsLuarImgMobile  = 'https://lh3.googleusercontent.com/d/1dOtfl9legvJ3a8gtcY5yvxPdV05iZc3B';

function getKuaVsLuarImg(){
  return window.innerWidth < 600 ? _kuaVsLuarImgMobile : _kuaVsLuarImgDesktop;
}

const _nikahKuaImgMobile  = 'https://lh3.googleusercontent.com/d/1e8PoUzygT5Ubwn0DL4Fpk8yPUcrt2wJc';
const _nikahKuaImgDesktop = 'https://lh3.googleusercontent.com/d/1ctggw0eFbXg8uFe58ozyIEfrsUEw08M-';

function getNikahKuaImg(){
  return window.innerWidth < 600 ? _nikahKuaImgMobile : _nikahKuaImgDesktop;
}

const _cetakKartuImgMobile  = 'https://lh3.googleusercontent.com/d/1hBMHtk6M_vcWgLS_tXuspT9IxvYmyWgR';
const _cetakKartuImgDesktop = 'https://lh3.googleusercontent.com/d/1o2vob9KPXpVECXVipZeVpYjduq-k4US2';

function getCetakKartuImg(){
  return window.innerWidth < 768 ? _cetakKartuImgMobile : _cetakKartuImgDesktop;
}

function switchPendaftaranTab(id){
  // hide all content
  _pnContentIds.forEach(cid => {
    const el = document.getElementById('pnTab-'+cid);
    if(el) el.style.display = 'none';
  });
  // show target with morph
  const target = document.getElementById('pnTab-'+id);
  if(target){ target.style.display='block'; target.classList.remove('tab-morph'); target.getBoundingClientRect(); target.classList.add('tab-morph'); }

  // set responsive image for Nikah Online tab
  if(id === 'nikah-online'){
    const img = document.getElementById('nikahOnlineImg');
    const ld  = document.getElementById('nikahOnlineLoading');
    const wrap = document.getElementById('nikahOnlineWrap');
    if(img && ld){
      ld.style.display = 'flex';
      img.style.opacity = '0';
      if(wrap) wrap.style.minHeight = '200px';
      delete img.dataset.tried;
      img.src = window.innerWidth < 768
        ? 'https://lh3.googleusercontent.com/d/1CDUu5ViaYucp3m91Cs4E-Pr0fBJ3emys'
        : 'https://lh3.googleusercontent.com/d/1ZVMvGvA4m30qyzLPVQ3oVGxJ_ImxyD4Q';
    }
  }

  // set responsive image for Nikah KUA tab
  if(id === 'nikah-kua'){
    const img  = document.getElementById('nikahKuaImg');
    const ld   = document.getElementById('nikahKuaLoading');
    const wrap = document.getElementById('nikahKuaWrap');
    if(img && ld){
      ld.style.display = 'flex';
      img.style.opacity = '0';
      if(wrap) wrap.style.minHeight = '200px';
      delete img.dataset.tried;
      img.src = getNikahKuaImg();
    }
  }

  // set responsive image for KUA vs Di Luar tab
  if(id === 'nikah-kua-vs-luar'){
    const img = document.getElementById('kuaVsLuarImg');
    const ld  = document.getElementById('kuaVsLuarLoading');
    const wrap = document.getElementById('kuaVsLuarWrap');
    if(img && ld){
      // show loading, hide image
      ld.style.display = 'flex';
      img.style.opacity = '0';
      if(wrap) wrap.style.minHeight = '200px';
      // reset tried flag so onerror fallback can fire again if needed
      delete img.dataset.tried;
      img.src = getKuaVsLuarImg();
    }
  }

  // set responsive image for Cetak Kartu Nikah tab
  if(id === 'cetak-kartu-nikah'){
    const img  = document.getElementById('cetakKartuImg');
    const ld   = document.getElementById('cetakKartuLoading');
    const wrap = document.getElementById('cetakKartuWrap');
    if(img && ld){
      ld.style.display = 'flex';
      img.style.opacity = '0';
      if(wrap) wrap.style.minHeight = '200px';
      delete img.dataset.tried;
      img.src = getCetakKartuImg();
    }
  }

  // update tab card styles
  const idx = _pnContentIds.indexOf(id);
  const _pnCardColors = [
    {border:'var(--gold)', bg:'rgba(200,150,62,.07)', iconBg:'var(--gold)',  iconBgOff:'rgba(200,150,62,.1)', iconColor:'var(--gold)'},
    {border:'var(--p)',    bg:'rgba(27,107,90,.07)',  iconBg:'var(--p)',     iconBgOff:'rgba(27,107,90,.1)',  iconColor:'var(--p)'},
    {border:'#3A7BD5',    bg:'rgba(58,123,213,.07)', iconBg:'#3A7BD5',      iconBgOff:'rgba(58,123,213,.1)', iconColor:'#3A7BD5'},
    {border:'#7B5EA7',    bg:'rgba(123,94,167,.07)', iconBg:'#7B5EA7',      iconBgOff:'rgba(123,94,167,.1)', iconColor:'#7B5EA7'},
  ];
  _pnTabIds.forEach((tid, i) => {
    const btn   = document.getElementById(tid);
    const icon  = document.getElementById(tid+'Icon');
    const label = document.getElementById(tid+'Label');
    if(!btn) return;
    const c = _pnCardColors[i];
    if(i === idx){
      btn.style.borderColor   = c.border;
      btn.style.background    = c.bg;
      if(icon){  icon.style.background=c.iconBg;    icon.style.color='#fff'; }
      if(label){ label.style.color=c.border; }
    } else {
      btn.style.borderColor   = 'var(--border)';
      btn.style.background    = 'var(--card)';
      if(icon){  icon.style.background=c.iconBgOff; icon.style.color=c.iconColor; }
      if(label){ label.style.color='var(--muted)'; }
    }
  });
}

// Override goPage to init pendaftaran-nikah on entry
const _origGoPage2 = window.goPage;
window.goPage = function(id){
  _origGoPage2(id);
  if(id === 'pendaftaran-nikah'){
    switchPendaftaranTab('nikah-online');
    // load gambar nikah online
    const img = document.getElementById('nikahOnlineImg');
    const ld  = document.getElementById('nikahOnlineLoading');
    const wrap = document.getElementById('nikahOnlineWrap');
    if(img && ld && !img.src){
      ld.style.display = 'flex';
      img.style.opacity = '0';
      if(wrap) wrap.style.minHeight = '200px';
      img.src = window.innerWidth < 768
        ? 'https://lh3.googleusercontent.com/d/1CDUu5ViaYucp3m91Cs4E-Pr0fBJ3emys'
        : 'https://lh3.googleusercontent.com/d/1ZVMvGvA4m30qyzLPVQ3oVGxJ_ImxyD4Q';
    }
    document.getElementById('navbar').style.display='';
  }
};

/* ============================================
   PAGE: SIMULASI BIAYA NIKAH - Sub Fitur Tabs
============================================ */
if(!pages.includes('simulasi-biaya-nikah')) pages.push('simulasi-biaya-nikah');

const _sbTabIds = ['sbTab1','sbTab2'];
const _sbContentIds = ['nikah-mewah-vs-simpel','kalkulator-nikah'];
const _sbCardColors = [
  {border:'#3A7BD5', bg:'rgba(58,123,213,.07)', iconBg:'#3A7BD5', iconBgOff:'rgba(58,123,213,.1)', iconColor:'#3A7BD5'},
  {border:'#E8703A', bg:'rgba(232,112,58,.07)',  iconBg:'#E8703A', iconBgOff:'rgba(232,112,58,.1)', iconColor:'#E8703A'},
];

// Image URLs for nikah mewah vs simpel
const _sbImg1Mobile  = 'https://lh3.googleusercontent.com/d/1dOtfl9legvJ3a8gtcY5yvxPdV05iZc3B';
const _sbImg1Desktop = 'https://lh3.googleusercontent.com/d/1mO6t9bfiIQX8GLmNLnEPzgqGJ5dA9d09';

function switchSimulasiTab(id){
  // hide all content
  _sbContentIds.forEach(cid => {
    const el = document.getElementById('sbTab-'+cid);
    if(el) el.style.display = 'none';
  });
  // show target with morph
  const target = document.getElementById('sbTab-'+id);
  if(target){ target.style.display='block'; target.classList.remove('tab-morph'); target.getBoundingClientRect(); target.classList.add('tab-morph'); }

  // load image for nikah mewah vs simpel - tab sekarang menggunakan video embed, tidak perlu load gambar

  // update tab card styles
  const idx = _sbContentIds.indexOf(id);
  _sbTabIds.forEach((tid, i) => {
    const btn   = document.getElementById(tid);
    const icon  = document.getElementById(tid+'Icon');
    const label = document.getElementById(tid+'Label');
    if(!btn) return;
    const c = _sbCardColors[i];
    if(i === idx){
      btn.style.borderColor = c.border;
      btn.style.background  = c.bg;
      if(icon){  icon.style.background = c.iconBg;    icon.style.color = '#fff'; }
      if(label){ label.style.color = c.border; }
    } else {
      btn.style.borderColor = 'var(--border)';
      btn.style.background  = 'var(--card)';
      if(icon){  icon.style.background = c.iconBgOff; icon.style.color = c.iconColor; }
      if(label){ label.style.color = 'var(--muted)'; }
    }
  });
}

// Override goPage to init simulasi-biaya-nikah on entry
const _origGoPageSB = window.goPage;
window.goPage = function(id){
  _origGoPageSB(id);
  if(id === 'simulasi-biaya-nikah'){
    switchSimulasiTab('nikah-mewah-vs-simpel');
    document.getElementById('navbar').style.display = '';
  }
};

// Kalkulator functions
/* - KALKULATOR NIKAH: toggle section - */
function toggleCkSection(key){
  const body = document.getElementById('body-'+key);
  const tog  = document.getElementById('tog-'+key);
  if(!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'grid';
  if(tog) tog.style.transform = open ? '' : 'rotate(180deg)';
}

function toggleProjSection(key){
  const body = document.getElementById('body-'+key);
  const tog  = document.getElementById('tog-'+key);
  if(!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'flex';
  if(tog) tog.style.transform = open ? '' : 'rotate(180deg)';
}

/* - FORMAT RUPIAH INPUT - */
function parseRp(id){
  const el = document.getElementById(id);
  if(!el) return 0;
  const raw = el.value.replace(/\./g,'').replace(/[^0-9]/g,'');
  return parseFloat(raw)||0;
}
function fmtRp(el){
  const pos   = el.selectionStart;
  const raw   = el.value.replace(/\./g,'').replace(/[^0-9]/g,'');
  const prev  = el.value.replace(/\./g,'').replace(/[^0-9]/g,'');
  if(!raw){ el.value=''; return; }
  const dotsBefore = (el.value.slice(0,pos).match(/\./g)||[]).length;
  const formatted  = Number(raw).toLocaleString('id-ID');
  const dotsAfter  = (formatted.slice(0,pos+(formatted.length-el.value.length)).match(/\./g)||[]).length;
  el.value = formatted;
  // restore cursor
  try{
    const newPos = pos + (dotsAfter - dotsBefore);
    el.setSelectionRange(newPos, newPos);
  }catch(e){}
}

/* - KALKULATOR NIKAH: hitung total - */
function hitungTotal(){
  const rp = id => parseRp(id);

  // grup biaya
  const grp = {
    lamaran:   ['ck-lamaran','ck-cincin-lamaran','ck-seserahan-lamaran','ck-uang-dapur','ck-siraman','ck-midodareni'],
    mahar:     ['ck-mahar','ck-cincin-nikah','ck-seserahan-nikah','ck-perhiasan'],
    admin:     ['ck-kua','ck-surat','ck-buku','ck-saksi'],
    akad:      ['ck-dekor-akad','ck-konsumsi-akad','ck-sound-akad','ck-qori'],
    resepsi:   ['ck-gedung','ck-tenda','ck-catering','ck-dekor-resepsi','ck-sound-resepsi','ck-hiburan','ck-souvenir','ck-undangan'],
    busana:    ['ck-gaun','ck-jas','ck-makeup','ck-seragam','ck-aksesori','ck-perawatan'],
    dok:       ['ck-foto','ck-video','ck-prewed','ck-album'],
    transport: ['ck-mobil','ck-shuttle','ck-hotel','ck-akom-keluarga'],
    honeymoon: ['ck-tiket','ck-hotel-hm','ck-aktivitas'],
    lain:      ['ck-walimah','ck-wo','ck-dekor-rumah','ck-darurat'],
  };

  let total = 0;
  Object.keys(grp).forEach(key => {
    let sub = 0;
    grp[key].forEach(id => sub += rp(id));
    total += sub;
    const el = document.getElementById('sub-'+key);
    if(el) el.textContent = sub > 0 ? 'Rp '+sub.toLocaleString('id-ID') : 'Rp 0';
  });

  // update total display
  document.getElementById('ck-total-display').textContent = 'Rp '+total.toLocaleString('id-ID');

  // tampilkan / sembunyikan banner navigasi masa depan
  const navBanner = document.getElementById('ck-nav-masa-depan');
  const navNominal = document.getElementById('ck-nav-nominal');
  if(navBanner){
    if(total > 0){
      navBanner.style.display = 'block';
      if(navNominal) navNominal.textContent = 'Rp '+total.toLocaleString('id-ID');
    } else {
      navBanner.style.display = 'none';
    }
  }

  // perencanaan
  const tabungan = rp('ck-tabungan');
  const gaji     = rp('ck-gaji');
  const persen   = rp('ck-persen') || 0;
  const tglEl    = document.getElementById('ck-tgl');
  const tgl      = tglEl ? tglEl.value : '';

  // hitung bulan tersisa
  let bulanSisa = 0;
  if(tgl){
    const now   = new Date();
    const target= new Date(tgl);
    const diff  = (target.getFullYear() - now.getFullYear())*12 + (target.getMonth() - now.getMonth());
    bulanSisa   = Math.max(0, diff);
  }

  // proyeksi tabungan bisa dikumpul
  const tabunganPerBulan = (persen > 0 && gaji > 0) ? Math.round(gaji * persen / 100) : 0;
  const proyeksi         = tabungan + (tabunganPerBulan * bulanSisa);
  const kurang           = total - proyeksi;

  // update result cells
  const set = (id, val) => { const el=document.getElementById(id); if(el) el.textContent = val; };
  const cls = (id, c)   => { const el=document.getElementById(id); if(el){ el.className='val'; el.classList.add(c||''); }};

  if(tabungan > 0 || gaji > 0 || tgl){
    set('ck-r-tabungan',   tabungan > 0 ? 'Rp '+tabungan.toLocaleString('id-ID') : '-');
    set('ck-r-bulan',      tgl ? bulanSisa+' bulan' : '-');
    set('ck-r-proyeksi',   tgl && (gaji > 0 || tabungan > 0) ? 'Rp '+proyeksi.toLocaleString('id-ID') : '-');
    cls('ck-r-proyeksi',   kurang <= 0 ? 'ok' : 'warn');

    if(tabunganPerBulan > 0 && total > 0 && bulanSisa > 0){
      const needed = Math.max(0, Math.ceil((total - tabungan) / bulanSisa));
      set('ck-r-perbulan', 'Rp '+needed.toLocaleString('id-ID')+'/bln');
      cls('ck-r-perbulan', needed <= tabunganPerBulan ? 'ok' : 'warn');
    } else {
      set('ck-r-perbulan', tabunganPerBulan > 0 ? 'Rp '+tabunganPerBulan.toLocaleString('id-ID')+'/bln' : '-');
      cls('ck-r-perbulan', '');
    }
  } else {
    set('ck-r-tabungan','-'); set('ck-r-bulan','-'); set('ck-r-proyeksi','-'); set('ck-r-perbulan','-');
  }

  // progress bar
  const progWrap = document.getElementById('ck-prog-wrap');
  const progBar  = document.getElementById('ck-prog-bar');
  const progPct  = document.getElementById('ck-prog-pct');
  if(total > 0 && (tabungan > 0 || proyeksi > 0)){
    const pct = Math.min(100, Math.round(proyeksi / total * 100));
    if(progWrap) progWrap.style.display = 'block';
    if(progBar)  progBar.style.width    = pct+'%';
    if(progPct)  progPct.textContent    = pct+'%';
  } else {
    if(progWrap) progWrap.style.display = 'none';
  }

  // hutang card
  const hutangCard = document.getElementById('ck-hutang-card');
  if(total > 0 && (tabungan > 0 || gaji > 0 || tgl)){
    if(kurang > 0){
      hutangCard.style.display = 'block';
      hutangCard.className     = 'hutang-card';
      document.getElementById('ck-hutang-icon').style.color = '#E05252';
      document.getElementById('ck-hutang-title').textContent = 'Estimasi Hutang yang Dibutuhkan';
      document.getElementById('ck-hutang-sub').textContent   = 'Kekurangan setelah proyeksi tabungan';
      document.getElementById('ck-hutang-nominal').style.color = '#E05252';
      document.getElementById('ck-hutang-nominal').textContent  = 'Rp '+kurang.toLocaleString('id-ID');
    } else {
      hutangCard.style.display = 'block';
      hutangCard.className     = 'hutang-card hutang-ok';
      document.getElementById('ck-hutang-icon').innerHTML   = '<i class="fa-solid fa-circle-check"></i>';
      document.getElementById('ck-hutang-icon').style.color = 'var(--p)';
      document.getElementById('ck-hutang-title').textContent = 'Tabungan Mencukupi - Tidak Perlu Hutang!';
      document.getElementById('ck-hutang-sub').textContent   = 'Proyeksi tabungan sudah melebihi total biaya';
      document.getElementById('ck-hutang-nominal').style.color = 'var(--p)';
      document.getElementById('ck-hutang-nominal').textContent  = '+Rp '+Math.abs(kurang).toLocaleString('id-ID')+' sisa';
    }
    // update nilai hutang di kalkulator bunga
    window._ckHutang = Math.max(0, kurang);
    hitungBunga();
  } else {
    if(hutangCard) hutangCard.style.display = 'none';
    window._ckHutang = 0;
  }

  // Auto-save ke Supabase (debounce 800ms agar tidak spam saat ketik)
  if(rmCurrentUser){
    clearTimeout(_ckSaveTimer);
    _ckSaveTimer = setTimeout(simpanSimulasi, 800);
  }
}

/* - SIMPAN & LOAD SIMULASI BIAYA ke Supabase - */
let _ckSaveTimer = null;

// Kumpulkan semua nilai input kalkulator jadi satu objek JSON
function _ckCollectData(){
  const fields = [
    'ck-tgl','ck-gaji','ck-tabungan','ck-persen',
    'ck-lamaran','ck-cincin-lamaran','ck-seserahan-lamaran','ck-uang-dapur','ck-siraman','ck-midodareni',
    'ck-mahar','ck-cincin-nikah','ck-seserahan-nikah','ck-perhiasan',
    'ck-kua','ck-surat','ck-buku','ck-saksi',
    'ck-dekor-akad','ck-konsumsi-akad','ck-sound-akad','ck-qori',
    'ck-gedung','ck-tenda','ck-catering','ck-dekor-resepsi','ck-sound-resepsi','ck-hiburan','ck-souvenir','ck-undangan',
    'ck-gaun','ck-jas','ck-makeup','ck-seragam','ck-aksesori','ck-perawatan',
    'ck-foto','ck-video','ck-prewed','ck-album',
    'ck-mobil','ck-shuttle','ck-hotel','ck-akom-keluarga',
    'ck-tiket','ck-hotel-hm','ck-aktivitas',
    'ck-walimah','ck-wo','ck-dekor-rumah','ck-darurat',
    'ck-bunga','ck-tenor',
  ];
  const data = {};
  fields.forEach(id => { const el = document.getElementById(id); if(el) data[id] = el.value; });
  return data;
}

// Hitung total biaya dari semua field (tanpa UI side-effect)
function _ckCalcTotal(){
  const grp = {
    lamaran:   ['ck-lamaran','ck-cincin-lamaran','ck-seserahan-lamaran','ck-uang-dapur','ck-siraman','ck-midodareni'],
    mahar:     ['ck-mahar','ck-cincin-nikah','ck-seserahan-nikah','ck-perhiasan'],
    admin:     ['ck-kua','ck-surat','ck-buku','ck-saksi'],
    akad:      ['ck-dekor-akad','ck-konsumsi-akad','ck-sound-akad','ck-qori'],
    resepsi:   ['ck-gedung','ck-tenda','ck-catering','ck-dekor-resepsi','ck-sound-resepsi','ck-hiburan','ck-souvenir','ck-undangan'],
    busana:    ['ck-gaun','ck-jas','ck-makeup','ck-seragam','ck-aksesori','ck-perawatan'],
    dok:       ['ck-foto','ck-video','ck-prewed','ck-album'],
    transport: ['ck-mobil','ck-shuttle','ck-hotel','ck-akom-keluarga'],
    honeymoon: ['ck-tiket','ck-hotel-hm','ck-aktivitas'],
    lain:      ['ck-walimah','ck-wo','ck-dekor-rumah','ck-darurat'],
  };
  let total = 0;
  Object.values(grp).forEach(ids => ids.forEach(id => total += parseRp(id)));
  return total;
}

// Upsert data kalkulator ke Supabase (dipanggil via debounce dari hitungTotal)
async function simpanSimulasi(){
  if(!rmCurrentUser) return;
  const { data:{ session } } = await _sb.auth.getSession();
  if(!session) return;
  const { error } = await _sb.from('simulasi_biaya').upsert(
    { user_id: session.user.id, data: _ckCollectData(), total: _ckCalcTotal(), updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  if(error) console.error('Simulasi save error:', error);
}

// Restore semua field input dari objek data yang tersimpan, lalu recalculate
function _ckRestoreData(data){
  if(!data) return;
  Object.entries(data).forEach(([id, val]) => { const el = document.getElementById(id); if(el) el.value = val; });
  hitungTotal();
}

// Load data kalkulator dari Supabase (dipanggil saat login / halaman load)
async function loadSimulasi(){
  if(!rmCurrentUser) return;
  const { data:{ session } } = await _sb.auth.getSession();
  if(!session) return;
  const { data, error } = await _sb.from('simulasi_biaya').select('data,total').eq('user_id', session.user.id).maybeSingle();
  if(error){ console.error('Simulasi load error:', error); return; }
  if(data?.data) _ckRestoreData(data.data);
}

/* - KALKULATOR BUNGA PINJAMAN - */
function hitungBunga(){
  const pokok  = window._ckHutang || 0;
  const bunga  = parseFloat(document.getElementById('ck-bunga')?.value) || 0;
  const tenor  = parseFloat(document.getElementById('ck-tenor')?.value) || 0;
  const wrap   = document.getElementById('ck-cicilan-wrap');
  if(pokok > 0 && bunga > 0 && tenor > 0){
    const bungaPerBulan = bunga / 100 / 12;
    const cicilan       = Math.round(pokok * bungaPerBulan / (1 - Math.pow(1+bungaPerBulan, -tenor)));
    const totalBayar    = cicilan * tenor;
    if(wrap) wrap.style.display = 'block';
    const cv = document.getElementById('ck-cicilan-val');
    const tv = document.getElementById('ck-total-bunga-val');
    if(cv) cv.textContent = 'Rp '+cicilan.toLocaleString('id-ID');
    if(tv) tv.textContent = 'Rp '+totalBayar.toLocaleString('id-ID');
  } else if(pokok > 0 && tenor > 0 && bunga === 0){
    // flat tanpa bunga
    const cicilan = Math.ceil(pokok / tenor);
    if(wrap) wrap.style.display = 'block';
    const cv = document.getElementById('ck-cicilan-val');
    const tv = document.getElementById('ck-total-bunga-val');
    if(cv) cv.textContent = 'Rp '+cicilan.toLocaleString('id-ID')+' (tanpa bunga)';
    if(tv) tv.textContent = 'Rp '+pokok.toLocaleString('id-ID');
  } else {
    if(wrap) wrap.style.display = 'none';
  }
}

/* - NAVIGASI DARI KALKULATOR → RENCANAKAN MASA DEPAN - */
function navigasiMasaDepan(){
  // ambil total dari kalkulator
  const rp = id => parseRp(id);
  const grp = {
    lamaran:   ['ck-lamaran','ck-cincin-lamaran','ck-seserahan-lamaran','ck-uang-dapur','ck-siraman','ck-midodareni'],
    mahar:     ['ck-mahar','ck-cincin-nikah','ck-seserahan-nikah','ck-perhiasan'],
    admin:     ['ck-kua','ck-surat','ck-buku','ck-saksi'],
    akad:      ['ck-dekor-akad','ck-konsumsi-akad','ck-sound-akad','ck-qori'],
    resepsi:   ['ck-gedung','ck-tenda','ck-catering','ck-dekor-resepsi','ck-sound-resepsi','ck-hiburan','ck-souvenir','ck-undangan'],
    busana:    ['ck-gaun','ck-jas','ck-makeup','ck-seragam','ck-aksesori','ck-perawatan'],
    dok:       ['ck-foto','ck-video','ck-prewed','ck-album'],
    transport: ['ck-mobil','ck-shuttle','ck-hotel','ck-akom-keluarga'],
    honeymoon: ['ck-tiket','ck-hotel-hm','ck-aktivitas'],
    lain:      ['ck-walimah','ck-wo','ck-dekor-rumah','ck-darurat'],
  };
  let total = 0;
  Object.values(grp).forEach(ids => ids.forEach(id => total += rp(id)));

  // jika ada tabungan, ambil surplus (tabungan - total) atau total sebagai modal
  const tabungan   = parseRp('ck-tabungan');
  const modalSaran = tabungan > total ? (tabungan - total) : total;

  // navigasi ke halaman roadmap, switch langsung ke tab perencanaan
  window.scrollTo({top:0, behavior:'smooth'});
  setTimeout(()=>{
    goPage('roadmap');
    setTimeout(()=>{
      // isi input modal proyeksi di roadmap setelah halaman aktif
      const rmModalEl = document.getElementById('rm-proj-modal');
      if(rmModalEl && modalSaran > 0){
        rmModalEl.value = Math.round(modalSaran).toLocaleString('id-ID');
      }
      // langsung switch ke tab perencanaan (tanpa overlay/panel)
      switchRoadmapTab('perencanaan');
      // jalankan hitung proyeksi
      if(typeof hitungProyeksiRm === 'function') setTimeout(hitungProyeksiRm, 80);
    }, 200);
  }, 280);
}

/* - DATA SAHAM (Low/Medium/High Risk) - total return tahunan (CAGR + dividen), sumber Google Finance Agu 2026 - */
const SAHAM_LIST = [
  {code:'indf', rate:0.0345 + 0.0393},
  {code:'mapi', rate:0.1679 + 0.0066},
  {code:'excl', rate:-0.0008 + 0.0956},
  {code:'isat', rate:0.0865 + 0.0451},
  {code:'adro', rate:0.1272 + 0.1045},
  {code:'ammn', rate:0.1963 + 0.0},
  {code:'brpt', rate:0.1278 + 0.0008},
  {code:'antm', rate:0.0536 + 0.0680},
  {code:'untr', rate:0.0244 + 0.0714},
  {code:'pgeo', rate:0.0411 + 0.0462},
  {code:'ptba', rate:0.0009 + 0.0487},
  {code:'inco', rate:0.0096 + 0.0148},
];
function hitungSahamList(modal, tahun, fmt, prefix){
  const results = [];
  SAHAM_LIST.forEach(s=>{
    const thnEl   = document.getElementById(prefix+'proj-'+s.code+'-thn');
    const thnxEl  = document.getElementById(prefix+'proj-'+s.code+'-thnx');
    const totalEl = document.getElementById(prefix+'proj-'+s.code+'-total');
    const hasilThn = modal * s.rate;
    const total    = modal * Math.pow(1 + s.rate, tahun);
    results.push({code:s.code.toUpperCase(), rate:s.rate, total});
    if(!thnEl || !totalEl) return;
    thnEl.textContent   = fmt(hasilThn);
    if(thnxEl) thnxEl.textContent = tahun;
    totalEl.textContent = fmt(total);
  });
  return results;
}

/* - PROYEKSI INVESTASI - */
function hitungProyeksi(){
  const modal  = parseRp('proj-modal');
  const tahun  = parseFloat(document.getElementById('proj-tahun')?.value) || 5;
  const fmt    = v => v > 0 ? 'Rp '+Math.round(v).toLocaleString('id-ID') : '-';

  // update label tahun
  ['proj-bbri-thn','proj-rdm-thnx','proj-emas-thnx'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.textContent=tahun;
  });

  if(modal <= 0){ ['proj-bbri-div','proj-bbri-bln','proj-bbri-total','proj-sr-bersih','proj-sr-bln','proj-sr-total','proj-rdm-thn','proj-rdm-bln','proj-rdm-total','proj-emas-thn','proj-emas-total','proj-emas-untung'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='-';}); return; }

  // TLKM - dividen ~8% / tahun (JII syariah), asumsi reinvest compound
  const bbriYield  = 0.08;
  const bbriDiv    = modal * bbriYield;
  const bbriTotal  = modal * Math.pow(1 + bbriYield, tahun);
  document.getElementById('proj-bbri-div').textContent  = fmt(bbriDiv);
  document.getElementById('proj-bbri-bln').textContent  = fmt(bbriDiv/12);
  document.getElementById('proj-bbri-total').textContent= fmt(bbriTotal);

  // Saham lain (Low/Medium/High Risk) - asumsi total return (CAGR + dividen), reinvest compound
  const sahamResults = hitungSahamList(modal, tahun, fmt, '');

  // Sukuk SR022 - 6.55% gross, 10% pajak = 5.895% bersih / tahun, dibayar bulanan
  const srRate  = 0.06555 * 0.9; // bersih setelah pajak 10%
  const srBln   = modal * srRate / 12;
  const srTotal = modal + (srBln * 12 * Math.min(tahun, 5)); // maks 5 th, pokok kembali
  document.getElementById('proj-sr-bersih').textContent = fmt(modal * srRate);
  document.getElementById('proj-sr-bln').textContent    = fmt(srBln);
  document.getElementById('proj-sr-total').textContent  = fmt(srTotal);

  // Reksa Dana Syariah Pasar Uang - 5.5% compound, no pajak
  const rdmRate  = 0.055;
  const rdmTotal = modal * Math.pow(1 + rdmRate, tahun);
  document.getElementById('proj-rdm-thn').textContent   = fmt(modal * rdmRate);
  document.getElementById('proj-rdm-bln').textContent   = fmt(modal * rdmRate / 12);
  document.getElementById('proj-rdm-total').textContent = fmt(rdmTotal);

  // Emas - asumsi kenaikan 10%/tahun
  const emasRate  = 0.10;
  const emasTotal = modal * Math.pow(1 + emasRate, tahun);
  document.getElementById('proj-emas-thn').textContent   = fmt(modal * emasRate);
  document.getElementById('proj-emas-total').textContent = fmt(emasTotal);
  document.getElementById('proj-emas-untung').textContent= fmt(emasTotal - modal);

  // - Update summary card -
  const sumCard = document.getElementById('proj-summary-card');
  if(sumCard && modal > 0){
    sumCard.style.display = 'block';
    document.getElementById('proj-sum-modal').textContent  = 'Rp '+Math.round(modal).toLocaleString('id-ID');
    document.getElementById('proj-sum-tahun').textContent  = tahun;
    document.getElementById('proj-sum-div-thn').textContent= fmt(bbriDiv);
    document.getElementById('proj-sum-div-bln').textContent= fmt(bbriDiv/12);
    document.getElementById('proj-sum-sr-bln').textContent = fmt(srBln);

    // nilai akhir terbaik = bandingkan SEMUA instrumen (TLKM, emas, RDPU, sukuk, & seluruh daftar saham)
    const allOptions = [
      {label:'Dividen TLKM', total:bbriTotal},
      {label:'Emas', total:emasTotal},
      {label:'Reksa Dana Pasar Uang Syariah', total:rdmTotal},
      {label:'Sukuk SR022', total:srTotal},
      ...sahamResults.map(r=>({label:'Saham '+r.code, total:r.total}))
    ];
    const best = allOptions.reduce((a,b)=> b.total > a.total ? b : a);
    document.getElementById('proj-sum-best').textContent = fmt(best.total);
    const bestLbl = document.getElementById('proj-sum-best-label');
    if(bestLbl) bestLbl.textContent = best.label;

    // paling stabil = Sukuk SR022 (fixed income, kupon tetap, pokok dijamin negara)
    const stabilEl = document.getElementById('proj-sum-stabil');
    if(stabilEl) stabilEl.textContent = fmt(srTotal);
  } else if(sumCard){
    sumCard.style.display = 'none';
  }

  // - Auto-open semua accordion investasi -
  ['saham','sh-low','sh-mid','sh-high','sr','rdm','emas'].forEach(key => {
    const body = document.getElementById('body-'+key);
    const tog  = document.getElementById('tog-'+key);
    if(body && body.style.display === 'none'){
      body.style.display = 'flex';
      if(tog) tog.style.transform = 'rotate(180deg)';
    }
  });
}

/* - PROYEKSI INVESTASI (ROADMAP) - */
function hitungProyeksiRm(){
  const modalEl = document.getElementById('rm-proj-modal');
  if(!modalEl) return;
  const raw   = modalEl.value.replace(/\./g,'').replace(/[^0-9]/g,'');
  const modal = parseFloat(raw)||0;
  const tahun = parseFloat(document.getElementById('rm-proj-tahun')?.value)||5;
  const fmt   = v => v > 0 ? 'Rp '+Math.round(v).toLocaleString('id-ID') : '-';

  // update label tahun
  ['rm-proj-bbri-thn','rm-proj-rdm-thnx','rm-proj-emas-thnx'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.textContent=tahun;
  });

  if(modal <= 0){
    ['rm-proj-bbri-div','rm-proj-bbri-bln','rm-proj-bbri-total','rm-proj-sr-bersih','rm-proj-sr-bln','rm-proj-sr-total','rm-proj-rdm-thn','rm-proj-rdm-bln','rm-proj-rdm-total','rm-proj-emas-thn','rm-proj-emas-total','rm-proj-emas-untung'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='-';});
    const sc=document.getElementById('rm-proj-summary-card'); if(sc) sc.style.display='none';
    return;
  }

  // TLKM - dividen ~8% / tahun
  const bbriYield = 0.08;
  const bbriDiv   = modal * bbriYield;
  const bbriTotal = modal * Math.pow(1+bbriYield, tahun);
  document.getElementById('rm-proj-bbri-div').textContent   = fmt(bbriDiv);
  document.getElementById('rm-proj-bbri-bln').textContent   = fmt(bbriDiv/12);
  document.getElementById('rm-proj-bbri-total').textContent = fmt(bbriTotal);

  // Saham lain (Low/Medium/High Risk) - asumsi total return (CAGR + dividen), reinvest compound
  const rmSahamResults = hitungSahamList(modal, tahun, fmt, 'rm-');

  // Sukuk SR022 - 6.55% gross, pajak 10% → 5.895% bersih
  const srRate  = 0.06555 * 0.9;
  const srBln   = modal * srRate / 12;
  const srTotal = modal + (srBln * 12 * Math.min(tahun, 5));
  document.getElementById('rm-proj-sr-bersih').textContent = fmt(modal * srRate);
  document.getElementById('rm-proj-sr-bln').textContent    = fmt(srBln);
  document.getElementById('rm-proj-sr-total').textContent  = fmt(srTotal);

  // Reksa Dana Syariah Pasar Uang - 5.5% compound
  const rdmRate  = 0.055;
  const rdmTotal = modal * Math.pow(1+rdmRate, tahun);
  document.getElementById('rm-proj-rdm-thn').textContent   = fmt(modal * rdmRate);
  document.getElementById('rm-proj-rdm-bln').textContent   = fmt(modal * rdmRate / 12);
  document.getElementById('rm-proj-rdm-total').textContent = fmt(rdmTotal);

  // Emas - ~10%/tahun
  const emasRate  = 0.10;
  const emasTotal = modal * Math.pow(1+emasRate, tahun);
  document.getElementById('rm-proj-emas-thn').textContent    = fmt(modal * emasRate);
  document.getElementById('rm-proj-emas-total').textContent  = fmt(emasTotal);
  document.getElementById('rm-proj-emas-untung').textContent = fmt(emasTotal - modal);

  // Summary card
  const sumCard = document.getElementById('rm-proj-summary-card');
  if(sumCard){
    sumCard.style.display = 'block';
    document.getElementById('rm-proj-sum-modal').textContent    = 'Rp '+Math.round(modal).toLocaleString('id-ID');
    document.getElementById('rm-proj-sum-tahun').textContent    = tahun;
    document.getElementById('rm-proj-sum-div-thn').textContent  = fmt(bbriDiv);
    document.getElementById('rm-proj-sum-div-bln').textContent  = fmt(bbriDiv/12);
    document.getElementById('rm-proj-sum-sr-bln').textContent   = fmt(srBln);

    // nilai akhir terbaik = bandingkan SEMUA instrumen (TLKM, emas, RDPU, sukuk, & seluruh daftar saham)
    const allOptions = [
      {label:'Dividen TLKM', total:bbriTotal},
      {label:'Emas', total:emasTotal},
      {label:'Reksa Dana Pasar Uang Syariah', total:rdmTotal},
      {label:'Sukuk SR022', total:srTotal},
      ...rmSahamResults.map(r=>({label:'Saham '+r.code, total:r.total}))
    ];
    const best = allOptions.reduce((a,b)=> b.total > a.total ? b : a);
    document.getElementById('rm-proj-sum-best').textContent = fmt(best.total);
    const bestLbl = document.getElementById('rm-proj-sum-best-label');
    if(bestLbl) bestLbl.textContent = best.label;

    // paling stabil = Sukuk SR022 (fixed income, kupon tetap, pokok dijamin negara)
    const stabilEl = document.getElementById('rm-proj-sum-stabil');
    if(stabilEl) stabilEl.textContent = fmt(srTotal);
  }

  // Auto-open semua accordion investasi
  ['rm-saham','rm-sh-low','rm-sh-mid','rm-sh-high','rm-sr','rm-rdm','rm-emas'].forEach(key=>{
    const body=document.getElementById('body-'+key);
    const tog =document.getElementById('tog-'+key);
    if(body && body.style.display==='none'){
      body.style.display='flex';
      if(tog) tog.style.transform='rotate(180deg)';
    }
  });
}

function toggleProjSectionRm(key){
  const body=document.getElementById('body-'+key);
  const tog =document.getElementById('tog-'+key);
  if(!body) return;
  const open=body.style.display!=='none';
  body.style.display=open?'none':'flex';
  if(tog) tog.style.transform=open?'':'rotate(180deg)';
}

/* - RESET KALKULATOR - */
function resetKalkulator(){
  const allIds = [
    'ck-tgl','ck-gaji','ck-tabungan','ck-persen',
    'ck-lamaran','ck-cincin-lamaran','ck-seserahan-lamaran','ck-uang-dapur','ck-siraman','ck-midodareni',
    'ck-mahar','ck-cincin-nikah','ck-seserahan-nikah','ck-perhiasan',
    'ck-kua','ck-surat','ck-buku','ck-saksi',
    'ck-dekor-akad','ck-konsumsi-akad','ck-sound-akad','ck-qori',
    'ck-gedung','ck-tenda','ck-catering','ck-dekor-resepsi','ck-sound-resepsi','ck-hiburan','ck-souvenir','ck-undangan',
    'ck-gaun','ck-jas','ck-makeup','ck-seragam','ck-aksesori','ck-perawatan',
    'ck-foto','ck-video','ck-prewed','ck-album',
    'ck-mobil','ck-shuttle','ck-hotel','ck-akom-keluarga',
    'ck-tiket','ck-hotel-hm','ck-aktivitas',
    'ck-walimah','ck-wo','ck-dekor-rumah','ck-darurat',
    'ck-bunga','ck-tenor',
  ];
  allIds.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  window._ckHutang = 0;
  const nb = document.getElementById('ck-nav-masa-depan');
  if(nb) nb.style.display = 'none';
  hitungTotal();
}

/* - ROADMAP PAGE - tab switching - */
function switchRoadmapTab(id){
  ['timeline','perencanaan','alokasi'].forEach(t=>{
    const el=document.getElementById('rmTab-'+t);
    if(!el) return;
    if(t===id){
      el.style.display='block';
      el.classList.remove('tab-morph');
      el.getBoundingClientRect();
      el.classList.add('tab-morph');
    } else { el.style.display='none'; }
  });
  // update tab button styles
  const tabs = [
    { btn: document.getElementById('rmTab1'), icon: document.getElementById('rmTab1Icon'), label: document.getElementById('rmTab1Label'),
      activeColor:'#7B5EA7', activeBg:'rgba(123,94,167,.08)', iconBg:'#EEE8FF', iconBgActive:'#7B5EA7', iconInactiveColor:'#7B5EA7' },
    { btn: document.getElementById('rmTab2'), icon: document.getElementById('rmTab2Icon'), label: document.getElementById('rmTab2Label'),
      activeColor:'var(--p)', activeBg:'rgba(27,107,90,.07)', iconBg:'#E8F4EF', iconBgActive:'var(--p)', iconInactiveColor:'var(--p)' },
    { btn: document.getElementById('rmTab3'), icon: document.getElementById('rmTab3Icon'), label: document.getElementById('rmTab3Label'),
      activeColor:'var(--gold)', activeBg:'rgba(200,150,62,.07)', iconBg:'#FBF0DC', iconBgActive:'var(--gold)', iconInactiveColor:'var(--gold)' },
  ];
  const idxMap = {timeline:0, perencanaan:1, alokasi:2};
  const activeIdx = idxMap[id] ?? 0;
  tabs.forEach((t,i)=>{
    if(!t.btn) return;
    if(i===activeIdx){
      t.btn.style.borderColor   = t.activeColor;
      t.btn.style.background    = t.activeBg;
      t.btn.style.boxShadow     = '0 2px 10px rgba(0,0,0,.06)';
      if(t.icon){  t.icon.style.background = t.iconBgActive; t.icon.style.color = '#fff'; }
      if(t.label){ t.label.style.color = t.activeColor; t.label.style.fontWeight = '700'; }
    } else {
      t.btn.style.borderColor   = 'var(--border)';
      t.btn.style.background    = 'var(--card)';
      t.btn.style.boxShadow     = 'none';
      if(t.icon){  t.icon.style.background = t.iconBg; t.icon.style.color = t.iconInactiveColor; }
      if(t.label){ t.label.style.color = 'var(--muted)'; t.label.style.fontWeight = '600'; }
    }
  });
  // jalankan hitung proyeksi saat tab perencanaan dibuka
  if(id==='perencanaan'){
    if(typeof hitungProyeksiRm==='function') setTimeout(hitungProyeksiRm,100);
  }
}

/* - MODUL EDUKASI TAB SWITCHER - */
function switchEduTab(id){
  ['modul','live'].forEach(t=>{
    const el=document.getElementById('eduTab-'+t);
    if(!el) return;
    if(t===id){
      el.style.display='block';
      el.classList.remove('tab-morph');
      el.getBoundingClientRect();
      el.classList.add('tab-morph');
    } else { el.style.display='none'; }
  });
  const tabs = [
    { btn: document.getElementById('eduTab1'), icon: document.getElementById('eduTab1Icon'), label: document.getElementById('eduTab1Label'),
      activeColor:'#22A97A', activeBg:'rgba(34,169,122,.07)', iconBg:'#E8FBF4', iconBgActive:'#22A97A', iconInactiveColor:'#22A97A' },
    { btn: document.getElementById('eduTab2'), icon: document.getElementById('eduTab2Icon'), label: document.getElementById('eduTab2Label'),
      activeColor:'#E05252', activeBg:'rgba(224,82,82,.07)', iconBg:'#FFE8E8', iconBgActive:'#E05252', iconInactiveColor:'#E05252' },
  ];
  const idxMap = {modul:0, live:1};
  const activeIdx = idxMap[id] ?? 0;
  tabs.forEach((t,i)=>{
    if(!t.btn) return;
    if(i===activeIdx){
      t.btn.style.borderColor = t.activeColor;
      t.btn.style.background  = t.activeBg;
      t.btn.style.boxShadow   = '0 2px 10px rgba(0,0,0,.06)';
      if(t.icon){  t.icon.style.background = t.iconBgActive; t.icon.style.color = '#fff'; }
      if(t.label){ t.label.style.color = t.activeColor; t.label.style.fontWeight = '700'; }
    } else {
      t.btn.style.borderColor = 'var(--border)';
      t.btn.style.background  = 'var(--card)';
      t.btn.style.boxShadow   = 'none';
      if(t.icon){  t.icon.style.background = t.iconBg; t.icon.style.color = t.iconInactiveColor; }
      if(t.label){ t.label.style.color = 'var(--muted)'; t.label.style.fontWeight = '600'; }
    }
  });
}

/* - ALOKASI KEUANGAN - */
function akFormat(el){
  const raw = el.value.replace(/\D/g,'');
  el.value = raw ? parseInt(raw,10).toLocaleString('id-ID') : '';
}
/* Rp compact formatter for the donut center label */
function akFmtCompact(n){
  if(n>=1000000) return 'Rp '+(n/1000000).toFixed(n%1000000===0?0:1)+' jt';
  return 'Rp '+n.toLocaleString('id-ID');
}

/* Count-up animation for a numeric label. formatFn receives the
   in-between integer value and returns the string to display. */
function akAnimateNumber(el, from, to, formatFn, duration){
  if(!el) return;
  duration = duration || 550;
  const start = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3); /* easeOutCubic */
  function tick(now){
    const t = Math.min(1, (now - start) / duration);
    const val = Math.round(from + (to - from) * ease(t));
    el.textContent = formatFn(val);
    if(t < 1) requestAnimationFrame(tick);
    else el.textContent = formatFn(to);
  }
  requestAnimationFrame(tick);
}

/* Wire hover-linking between legend rows and donut arcs once. */
let _akLinkWired = false;
function akWireHoverLink(){
  if(_akLinkWired) return;
  _akLinkWired = true;
  const rows = document.querySelectorAll('#rmTab-alokasi .ak-legend-row');
  const segs = document.querySelectorAll('#rmTab-alokasi .ak-donut-seg');
  function setActive(idx){
    rows.forEach(r=>r.classList.toggle('dim', idx!==null && r.dataset.idx!==String(idx)));
    segs.forEach(s=>{
      const match = idx!==null && s.dataset.idx===String(idx);
      s.classList.toggle('hi', match);
      s.classList.toggle('dim', idx!==null && !match);
    });
  }
  rows.forEach(r=>{
    r.addEventListener('mouseenter', ()=>setActive(r.dataset.idx));
    r.addEventListener('mouseleave', ()=>setActive(null));
  });
  segs.forEach(s=>{
    s.addEventListener('mouseenter', ()=>setActive(s.dataset.idx));
    s.addEventListener('mouseleave', ()=>setActive(null));
  });
}

function akHitung(){
  akWireHoverLink();

  const raw   = document.getElementById('akGaji').value.replace(/\D/g,'');
  const gaji  = parseInt(raw,10) || 0;
  const pcts  = [50, 20, 15, 15];
  const rpIds = ['akRp1','akRp2','akRp3','akRp4'];
  const segIds= ['akSeg1','akSeg2','akSeg3','akSeg4'];

  /* donut geometry - r=64 (matches SVG circle r="64"), gap=3px between segments */
  const R   = 64;
  const C   = 2 * Math.PI * R;         /* ≈402.12 */
  const GAP = 3;
  const N   = 4;
  const usable = C - GAP * N;          /* ≈390.12 */
  const startOffset = -C / 4;          /* top of circle */

  const centerEl    = document.getElementById('akDonutCenter');
  const centerSubEl = document.getElementById('akDonutCenterSub');
  const prevGaji     = window._akPrevGaji || 0;

  if(!gaji){
    rpIds.forEach((id,i)=>{
      const el=document.getElementById(id);
      if(el){ el.textContent= i===0 ? '- masukkan gaji' : '-'; el.className='ak-legend-rp empty'; }
    });
    segIds.forEach(sid=>{
      const seg=document.getElementById(sid);
      if(seg){ seg.style.transition='stroke-dasharray .5s ease'; seg.style.strokeDasharray=`0 ${C}`; }
    });
    if(centerEl){ centerEl.textContent='Belum diisi'; centerEl.className='ak-donut-center-val empty'; }
    if(centerSubEl) centerSubEl.textContent='';
    const tot=document.getElementById('akTotalRow');
    if(tot) tot.style.display='none';
    window._akPrevGaji = 0;
    return;
  }

  /* update legend Rp values with count-up */
  rpIds.forEach((id,i)=>{
    const el=document.getElementById(id);
    if(!el) return;
    el.className='ak-legend-rp';
    const fromAmt = Math.round(prevGaji*pcts[i]/100);
    const toAmt   = Math.round(gaji*pcts[i]/100);
    akAnimateNumber(el, fromAmt, toAmt, v=>'Rp '+v.toLocaleString('id-ID'));
  });

  /* update donut center with count-up */
  if(centerEl){
    centerEl.className='ak-donut-center-val';
    akAnimateNumber(centerEl, prevGaji, gaji, v=>akFmtCompact(v));
  }
  if(centerSubEl) centerSubEl.textContent='per bulan';

  /* animate each segment's arc length + position */
  let cumOffset = startOffset;
  pcts.forEach((pct,i)=>{
    const segLen  = usable * pct / 100;
    const seg     = document.getElementById(segIds[i]);
    if(!seg) return;
    seg.style.strokeDashoffset = cumOffset;
    seg.style.transition = 'stroke-dasharray .65s cubic-bezier(.4,0,.2,1)';
    seg.style.strokeDasharray = `${segLen} ${C - segLen}`;
    cumOffset -= (segLen + GAP);
  });

  /* total row */
  const tot    = document.getElementById('akTotalRow');
  const totVal = document.getElementById('akTotalVal');
  if(tot) tot.style.display='flex';
  if(totVal) akAnimateNumber(totVal, prevGaji, gaji, v=>'Rp '+v.toLocaleString('id-ID'));

  window._akPrevGaji = gaji;
}

/* - ROADMAP PAGE - checklist persistence - */
async function rm10pSave(){
  const cbs=document.querySelectorAll('#rmTab-timeline input[type=checkbox]');
  cbs.forEach((c,i)=>sessionStorage.setItem('rm10p_'+i,c.checked?'1':'0'));
  if(!rmCurrentUser) return;
  const { data:{ session } } = await _sb.auth.getSession();
  if(!session) return;
  const rows=[...cbs].map((c,i)=>({ user_id:session.user.id, item_index:i+100, is_checked:c.checked }));
  await _sb.from('roadmap_progress').upsert(rows,{ onConflict:'user_id,item_index' });
}
async function rm10pReset(){
  const cbs=document.querySelectorAll('#rmTab-timeline input[type=checkbox]');
  cbs.forEach((c,i)=>{ c.checked=false; sessionStorage.removeItem('rm10p_'+i); });
  if(!rmCurrentUser) return;
  const { data:{ session } } = await _sb.auth.getSession();
  if(!session) return;
  const rows=[...cbs].map((c,i)=>({ user_id:session.user.id, item_index:i+100, is_checked:false }));
  await _sb.from('roadmap_progress').upsert(rows,{ onConflict:'user_id,item_index' });
}
async function rm10pRestore(){
  const cbs=document.querySelectorAll('#rmTab-timeline input[type=checkbox]');
  if(rmCurrentUser){
    const { data:{ session } } = await _sb.auth.getSession();
    if(session){
      const { data } = await _sb.from('roadmap_progress').select('item_index,is_checked').eq('user_id',session.user.id).gte('item_index',100);
      if(data) data.forEach(r=>{ const c=cbs[r.item_index-100]; if(c) c.checked=r.is_checked; return; });
      return;
    }
  }
  cbs.forEach((c,i)=>{ if(sessionStorage.getItem('rm10p_'+i)==='1') c.checked=true; });
}

/* - SDG KOMITMEN: canvas tanda tangan - */
let _sdgcCtx = null, _sdgcDrawing = false, _sdgcHasMark = false;

function sdgcInitCanvas(){
  const canvas = document.getElementById('sdgcCanvas');
  if(!canvas) return;
  const wrap = canvas.parentElement;
  canvas.width  = wrap.offsetWidth || 460;
  canvas.height = 110;
  _sdgcCtx = canvas.getContext('2d');
  _sdgcCtx.strokeStyle = '#1B6B5A';
  _sdgcCtx.lineWidth   = 2.2;
  _sdgcCtx.lineCap     = 'round';
  _sdgcCtx.lineJoin    = 'round';
  const hint = document.getElementById('sdgcHint');

  function getPos(e){
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    if(e.touches){
      return {x:(e.touches[0].clientX-r.left)*scaleX, y:(e.touches[0].clientY-r.top)*scaleY};
    }
    return {x:(e.clientX-r.left)*scaleX, y:(e.clientY-r.top)*scaleY};
  }
  function start(e){ e.preventDefault(); _sdgcDrawing=true; const p=getPos(e); _sdgcCtx.beginPath(); _sdgcCtx.moveTo(p.x,p.y); }
  function move(e){ e.preventDefault(); if(!_sdgcDrawing) return; const p=getPos(e); _sdgcCtx.lineTo(p.x,p.y); _sdgcCtx.stroke(); if(hint&&!_sdgcHasMark){ hint.classList.add('hidden'); _sdgcHasMark=true; } }
  function stop(){ _sdgcDrawing=false; _sdgcCtx.beginPath(); }

  canvas.addEventListener('mousedown',start); canvas.addEventListener('mousemove',move);
  canvas.addEventListener('mouseup',stop);    canvas.addEventListener('mouseleave',stop);
  canvas.addEventListener('touchstart',start,{passive:false});
  canvas.addEventListener('touchmove',move,{passive:false});
  canvas.addEventListener('touchend',stop);
}

function sdgcClear(){
  const canvas = document.getElementById('sdgcCanvas');
  if(!canvas||!_sdgcCtx) return;
  _sdgcCtx.clearRect(0,0,canvas.width,canvas.height);
  _sdgcHasMark = false;
  const hint = document.getElementById('sdgcHint');
  if(hint) hint.classList.remove('hidden');
}

function sdgcResetSign(){
  sessionStorage.removeItem('sdg_signed');
  sessionStorage.removeItem('sdg_tanggal');
  openSubFitur('sdg-komitmen');
}

/* - SDG PAGE functions - */
let _sdgcpCtx=null,_sdgcpDrawing=false,_sdgcpHasMark=false;
function sdgcpInitCanvas(){
  const canvas=document.getElementById('sdgcpCanvas');
  if(!canvas||_sdgcpCtx) return;
  const wrap=canvas.parentElement;
  canvas.width=wrap.offsetWidth||760;canvas.height=110;
  _sdgcpCtx=canvas.getContext('2d');
  _sdgcpCtx.strokeStyle='#1B6B5A';_sdgcpCtx.lineWidth=2.2;_sdgcpCtx.lineCap='round';_sdgcpCtx.lineJoin='round';
  function getPos(e){const r=canvas.getBoundingClientRect();const sx=canvas.width/r.width,sy=canvas.height/r.height;if(e.touches)return{x:(e.touches[0].clientX-r.left)*sx,y:(e.touches[0].clientY-r.top)*sy};return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy};}
  function start(e){e.preventDefault();_sdgcpDrawing=true;const p=getPos(e);_sdgcpCtx.beginPath();_sdgcpCtx.moveTo(p.x,p.y);}
  function move(e){e.preventDefault();if(!_sdgcpDrawing)return;const p=getPos(e);_sdgcpCtx.lineTo(p.x,p.y);_sdgcpCtx.stroke();const h=document.getElementById('sdgcpHint');if(h&&!_sdgcpHasMark){h.style.display='none';_sdgcpHasMark=true;}}
  function stop(){_sdgcpDrawing=false;_sdgcpCtx.beginPath();}
  canvas.addEventListener('mousedown',start);canvas.addEventListener('mousemove',move);canvas.addEventListener('mouseup',stop);canvas.addEventListener('mouseleave',stop);
  canvas.addEventListener('touchstart',start,{passive:false});canvas.addEventListener('touchmove',move,{passive:false});canvas.addEventListener('touchend',stop);
}
function sdgcpClear(){
  if(!_sdgcpCtx)return;
  _sdgcpCtx.clearRect(0,0,document.getElementById('sdgcpCanvas').width,110);
  _sdgcpHasMark=false;
  const h=document.getElementById('sdgcpHint');if(h)h.style.display='flex';
}
function sdgkCardToggle(cb){
  const card=cb.closest('.sdgk-sdg-card');
  if(card) card.classList.toggle('active',cb.checked);
}
async function sdgcpLoadSaved(){
  let signed=false,nama='',kota='',sdgs={sdg1:false,sdg3:false,sdg4:false,sdg10:false,sdg16:false},tanggal='';
  if(rmCurrentUser){
    const { data:{ session } } = await _sb.auth.getSession();
    if(session){
      const { data } = await _sb.from('sdg_commitments').select('*').eq('user_id',session.user.id).maybeSingle();
      if(data){ signed=data.signed; nama=data.nama||''; kota=data.kota||''; tanggal=data.tanggal_deklarasi||''; sdgs={sdg1:data.sdg1,sdg3:data.sdg3,sdg4:data.sdg4,sdg10:data.sdg10,sdg16:data.sdg16}; }
    }
  } else {
    signed=sessionStorage.getItem('sdg_signed')==='1';
    nama=sessionStorage.getItem('sdg_nama')||'';
    kota=sessionStorage.getItem('sdg_kota')||'';
    tanggal=sessionStorage.getItem('sdg_tanggal')||'';
    sdgs={sdg1:sessionStorage.getItem('sdg_sdg1')==='1',sdg3:sessionStorage.getItem('sdg_sdg3')==='1',sdg4:sessionStorage.getItem('sdg_sdg4')==='1',sdg10:sessionStorage.getItem('sdg_sdg10')==='1',sdg16:sessionStorage.getItem('sdg_sdg16')==='1'};
  }
  const n=document.getElementById('sdgcp-nama');if(n)n.value=nama;
  const k=document.getElementById('sdgcp-kota');if(k)k.value=kota;
  const cbMap={cb1:'sdg1',cb3:'sdg3',cb4:'sdg4',cb10:'sdg10',cb16:'sdg16'};
  Object.entries(cbMap).forEach(([id,key])=>{
    const cb=document.getElementById('sdgcp-'+id);
    const val=sdgs[key]||false;
    if(cb){cb.checked=val;if(val)sdgkCardToggle(cb);}
  });
  if(signed){
    const form=document.getElementById('sdgcp-page-form');const succ=document.getElementById('sdgcp-success');
    if(form)form.style.display='none';
    if(succ){succ.style.display='block';const tglEl=document.getElementById('sdgcp-tgl-success');if(tglEl)tglEl.textContent=tanggal;}
  }
}
function sdgcpSimpan(){
  const agree=document.getElementById('sdgcp-agree');
  if(!agree||!agree.checked){
    const w=document.getElementById('sdgcp-agree-wrap');
    if(w){w.style.borderColor='#E05252';w.style.background='#FFF5F5';setTimeout(()=>{w.style.borderColor='var(--border)';w.style.background='#fff';},1800);}
    showToast('Centang persetujuan deklarasi terlebih dahulu.','err');return;
  }
  if(!_sdgcpHasMark){
    const w=document.getElementById('sdgcp-canvas-wrap');
    if(w){w.style.borderColor='#E05252';setTimeout(()=>{w.style.borderColor='var(--border)';},1800);}
    showToast('Tambahkan tanda tangan digital Anda.','err');return;
  }
  const nama=(document.getElementById('sdgcp-nama')?.value||'').trim();
  const kota=(document.getElementById('sdgcp-kota')?.value||'').trim();
  const now=new Date();const tgl=now.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
  sessionStorage.setItem('sdg_nama',nama);sessionStorage.setItem('sdg_kota',kota);
  const sdg1=document.getElementById('sdgcp-cb1')?.checked||false;
  const sdg3=document.getElementById('sdgcp-cb3')?.checked||false;
  const sdg4=document.getElementById('sdgcp-cb4')?.checked||false;
  const sdg10=document.getElementById('sdgcp-cb10')?.checked||false;
  const sdg16=document.getElementById('sdgcp-cb16')?.checked||false;
  sessionStorage.setItem('sdg_sdg1',sdg1?'1':'0');
  sessionStorage.setItem('sdg_sdg3',sdg3?'1':'0');
  sessionStorage.setItem('sdg_sdg4',sdg4?'1':'0');
  sessionStorage.setItem('sdg_sdg10',sdg10?'1':'0');
  sessionStorage.setItem('sdg_sdg16',sdg16?'1':'0');
  sessionStorage.setItem('sdg_signed','1');sessionStorage.setItem('sdg_tanggal',tgl);
  if(rmCurrentUser){
    _sb.auth.getSession().then(({ data:{ session } })=>{
      if(session) _sb.from('sdg_commitments').upsert(
        { user_id:session.user.id, nama, kota, sdg1, sdg3, sdg4, sdg10, sdg16, signed:true, tanggal_deklarasi:new Date().toISOString().split('T')[0] },
        { onConflict:'user_id' }
      ).then(({error})=>{
        if(!error) showToast('Komitmen SDGs berhasil disimpan! ✅','ok');
        else console.error('SDG save error:',error);
      });
    });
  } else {
    showToast('Komitmen disimpan secara lokal.','ok');
  }
  const form=document.getElementById('sdgcp-page-form');const succ=document.getElementById('sdgcp-success');
  if(form)form.style.display='none';
  if(succ){succ.style.display='block';const tglEl=document.getElementById('sdgcp-tgl-success');if(tglEl)tglEl.textContent=tgl;}
}
async function sdgcpResetSign(){
  sessionStorage.removeItem('sdg_signed');sessionStorage.removeItem('sdg_tanggal');
  if(rmCurrentUser){
    const {data:{session}}=await _sb.auth.getSession();
    if(session) await _sb.from('sdg_commitments').update({signed:false,tanggal_deklarasi:null}).eq('user_id',session.user.id);
  }
  _sdgcpCtx=null;_sdgcpHasMark=false;
  const form=document.getElementById('sdgcp-page-form');const succ=document.getElementById('sdgcp-success');
  if(form)form.style.display='block';if(succ)succ.style.display='none';
  setTimeout(()=>{sdgcpInitCanvas();},50);
}
function switchSdgTab(id){
  document.querySelectorAll('.sdg-tab-content').forEach(el=>el.style.display='none');
  const el=document.getElementById('sdgTabContent-'+id);
  if(el){ el.style.display='block'; el.classList.remove('tab-morph'); el.getBoundingClientRect(); el.classList.add('tab-morph'); }
  const on1=id==='komitmen';
  const b1=document.getElementById('sdgTab1'),i1=document.getElementById('sdgTab1Icon'),l1=document.getElementById('sdgTab1Label');
  const b2=document.getElementById('sdgTab2'),i2=document.getElementById('sdgTab2Icon'),l2=document.getElementById('sdgTab2Label');
  if(b1){b1.style.borderColor=on1?'var(--gold)':'var(--border)';b1.style.background=on1?'rgba(200,150,62,.07)':'var(--card)';}
  if(i1){i1.style.background=on1?'var(--gold)':'rgba(200,150,62,.1)';i1.style.color=on1?'#fff':'var(--gold)';}
  if(l1){l1.style.color=on1?'var(--gold)':'var(--muted)';l1.style.fontWeight=on1?'700':'600';}
  if(b2){b2.style.borderColor=!on1?'var(--p)':'var(--border)';b2.style.background=!on1?'rgba(27,107,90,.07)':'var(--card)';}
  if(i2){i2.style.background=!on1?'var(--p)':'rgba(27,107,90,.1)';i2.style.color=!on1?'#fff':'var(--p)';}
  if(l2){l2.style.color=!on1?'var(--p)':'var(--muted)';l2.style.fontWeight=!on1?'700':'600';}
  if(id==='ringkasan') sdgcpRenderRingkasan();
}
function sdgcpRenderRingkasan(){
  const signed=sessionStorage.getItem('sdg_signed')==='1';
  const nama=sessionStorage.getItem('sdg_nama')||'\u2014';
  const kota=sessionStorage.getItem('sdg_kota')||'\u2014';
  const tanggal=sessionStorage.getItem('sdg_tanggal')||'\u2014';
  const sdgMap={sdg1:'Tanpa Kemiskinan',sdg3:'Kehidupan Sehat',sdg4:'Pendidikan',sdg10:'Kesetaraan',sdg16:'Perdamaian'};
  const sdgNum={sdg1:'#1',sdg3:'#3',sdg4:'#4',sdg10:'#10',sdg16:'#16'};
  const sdgBg={sdg1:'#E8FBF4',sdg3:'#FFF0E8',sdg4:'#EBF3FF',sdg10:'#EEE8FF',sdg16:'#E8F4EF'};
  const sdgClr={sdg1:'#22A97A',sdg3:'#E8703A',sdg4:'#3A7BD5',sdg10:'#7B5EA7',sdg16:'#1B6B5A'};
  const sdgIco={sdg1:'fa-hand-holding-dollar',sdg3:'fa-heart-pulse',sdg4:'fa-graduation-cap',sdg10:'fa-people-roof',sdg16:'fa-scale-balanced'};
  const sdgList=Object.keys(sdgMap).filter(k=>sessionStorage.getItem('sdg_'+k)==='1');
  const rmChecked=[...Array(20)].filter((_,i)=>sessionStorage.getItem('rm10_'+i)==='1').length;
  const rmTotal=document.querySelectorAll('.rm10-cl input[type=checkbox]').length||20;
  const ckRaw=sessionStorage.getItem('ck_total')||'';
  const ckFmt=ckRaw?'Rp '+parseInt(ckRaw).toLocaleString('id-ID'):'';
  const wrap=document.getElementById('sdgcp-ringkasan-content');
  if(!wrap)return;

  /* -- Empty State -- */
  if(!signed){
    wrap.innerHTML=`<div style="text-align:center;padding:56px 20px">
      <div style="width:64px;height:64px;border-radius:50%;background:var(--bg-alt);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><i class="fa-solid fa-pen-nib" style="font-size:1.5rem;color:var(--border)"></i></div>
      <p style="font-size:.9rem;color:var(--muted);margin-bottom:20px">Belum ada komitmen tersimpan.</p>
      <button onclick="switchSdgTab('komitmen')" class="btn btn-primary"><i class="fa-solid fa-pen-nib"></i> Isi Komitmen SDGs</button>
    </div>`;
    return;
  }

  /* -- Computed values -- */
  const initials=escapeHtml(nama.split(' ').filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('')||'?');
  const namaAman=escapeHtml(nama);
  const kotaAman=escapeHtml(kota);
  const rmPct=rmTotal>0?Math.round(rmChecked/rmTotal*100):0;
  const sdgPct=Math.round(sdgList.length/5*100);

  /* -- Donut SVG helper -- */
  function donutSVG(pct,color,size=88){
    const r=34,cx=44,cy=44,circ=2*Math.PI*r;
    const dash=circ*(pct/100),gap=circ-dash;
    return `<svg width="${size}" height="${size}" viewBox="0 0 88 88" style="transform:rotate(-90deg)">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E0E8E0" stroke-width="8"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="8"
        stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" stroke-linecap="round"/>
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
        style="transform:rotate(90deg);transform-origin:${cx}px ${cy}px;font-size:14px;font-weight:800;fill:${color};font-family:system-ui">${pct}%</text>
    </svg>`;
  }

  /* -- Journey items -- */
  const ckHasDone=!!ckRaw;
  const syaratViewed=sessionStorage.getItem('syarat_viewed')==='1';
  const pndftViewed=sessionStorage.getItem('pndft_viewed')==='1';

  const journeyItems=[
    {label:'Makna Pernikahan',meta:'Modul edukasi dasar',done:true,tag:'done',tagLabel:'Selesai',ico:'fa-heart'},
    {label:'Syarat Sah Nikah',meta:'Fiqih & syarat administratif',done:syaratViewed,tag:syaratViewed?'done':'pending',tagLabel:syaratViewed?'Selesai':'Belum',ico:'fa-scroll'},
    {label:'Pendaftaran Nikah',meta:'Alur & dokumen KUA',done:pndftViewed,tag:pndftViewed?'done':'pending',tagLabel:pndftViewed?'Selesai':'Belum',ico:'fa-file-pen'},
    {label:'Simulasi Biaya Nikah',meta:ckFmt||'Estimasi anggaran pernikahan',done:ckHasDone,tag:ckHasDone?'done':'pending',tagLabel:ckHasDone?ckFmt:'Belum',ico:'fa-calculator'},
    {label:'Roadmap 10 Tahun',meta:`${rmChecked} dari ${rmTotal} langkah ditandai`,done:rmChecked>0,tag:rmChecked>0?'partial':'pending',tagLabel:rmChecked>0?`${rmPct}%`:'Belum',ico:'fa-route'},
    {label:'Komitmen SDGs',meta:'Kontribusi keluarga untuk bangsa',done:signed,tag:'done',tagLabel:'Ditandatangani',ico:'fa-earth-asia'},
  ];

  const doneFitur=journeyItems.filter(j=>j.done).length;
  const totalFitur=journeyItems.length;
  const overallPct=Math.round(doneFitur/totalFitur*100);

  wrap.innerHTML=`
  <div class="rvd-wrap">

    <!-- HERO CARD -->
    <div class="rvd-hero">
      <div class="rvd-hero-top">
        <div class="rvd-avatar">${initials}</div>
        <div style="flex:1;min-width:0">
          <div class="rvd-name">${namaAman}</div>
          <div class="rvd-city"><i class="fa-solid fa-location-dot"></i> ${kotaAman}</div>
        </div>
        <div class="rvd-badge"><i class="fa-solid fa-circle-check"></i> Berkomitmen</div>
      </div>
      <div class="rvd-stats-row">
        <div class="rvd-stat">
          <div class="rvd-stat-val">${doneFitur}<span style="font-size:.6rem;font-weight:600;opacity:.7">/${totalFitur}</span></div>
          <div class="rvd-stat-lbl">Fitur Selesai</div>
        </div>
        <div class="rvd-stat">
          <div class="rvd-stat-val">${sdgList.length}<span style="font-size:.6rem;font-weight:600;opacity:.7">/5</span></div>
          <div class="rvd-stat-lbl">SDGs Dipilih</div>
        </div>
        <div class="rvd-stat">
          <div class="rvd-stat-val">${rmPct}<span style="font-size:.6rem;font-weight:600;opacity:.7">%</span></div>
          <div class="rvd-stat-lbl">Roadmap</div>
        </div>
      </div>
    </div>

    <!-- DONUT CHARTS -->
    <div class="rvd-donut-row">
      <div class="rvd-donut-card">
        <div class="rvd-donut-title"><i class="fa-solid fa-layer-group" style="color:var(--p)"></i> Progres Fitur</div>
        ${donutSVG(overallPct,'#1B6B5A')}
        <div class="rvd-donut-sub">${doneFitur} dari ${totalFitur} fitur</div>
      </div>
      <div class="rvd-donut-card">
        <div class="rvd-donut-title"><i class="fa-solid fa-route" style="color:#7B5EA7"></i> Roadmap 10 Tahun</div>
        ${donutSVG(rmPct,'#7B5EA7')}
        <div class="rvd-donut-sub">${rmChecked} dari ${rmTotal} langkah</div>
      </div>
    </div>

    <!-- JOURNEY MAP -->
    <div class="rvd-journey">
      <div class="rvd-journey-title">
        <i class="fa-solid fa-map-location-dot"></i> Perjalanan Fitur
      </div>
      <div class="rvd-journey-list">
        ${journeyItems.map(j=>`
        <div class="rvd-jitem">
          <span class="rvd-jdot ${j.done?'done':'pending'}">
            <i class="fa-solid ${j.done?'fa-check':'fa-circle'}" style="font-size:.5rem"></i>
          </span>
          <div class="rvd-jbody">
            <div class="rvd-jlabel"><i class="fa-solid ${j.ico}" style="color:var(--p);margin-right:5px;font-size:.78rem"></i>${j.label}</div>
            <div class="rvd-jmeta">${j.meta}</div>
          </div>
          <div class="rvd-jval">
            <span class="rvd-jtag ${j.tag}">
              <i class="fa-solid ${j.tag==='done'?'fa-circle-check':j.tag==='partial'?'fa-circle-half-stroke':'fa-circle-xmark'}" style="font-size:.62rem"></i>
              ${j.tagLabel}
            </span>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <!-- SDG VISUAL -->
    <div class="rvd-sdg-sec">
      <div class="rvd-sdg-title">
        <i class="fa-solid fa-earth-asia"></i> SDGs yang Didukung
      </div>
      <div class="rvd-sdg-chips">
        ${sdgList.length>0
          ? sdgList.map(n=>`<span class="rvd-sdg-chip" style="background:${sdgBg[n]};color:${sdgClr[n]};border-color:${sdgBg[n]}"><i class="fa-solid ${sdgIco[n]}"></i> ${sdgNum[n]} ${sdgMap[n]}</span>`).join('')
          : `<span style="font-size:.82rem;color:var(--muted)">Belum ada SDGs dipilih.</span>`
        }
      </div>
      <div class="rvd-sdg-prog"><div class="rvd-sdg-prog-fill" style="width:${sdgPct}%"></div></div>
      <div class="rvd-sdg-prog-lbl">${sdgList.length} dari 5 SDGs \u2014 ${sdgPct}%</div>
    </div>

    <!-- QUOTE -->
    <div class="rvd-quote">
      <p>"Keluarga yang berkomitmen pada kebaikan adalah fondasi peradaban yang kokoh."</p>
      <span>\u2014 RUKUN MAPAN \u00d7 SDGs Indonesia</span>
    </div>

    <!-- UPDATE BUTTON -->
    <button class="sdg-update-btn" onclick="switchSdgTab('komitmen')">
      <i class="fa-solid fa-pen-nib"></i> Perbarui Komitmen SDGs
    </button>

  </div>
  `;
}
function sdgcSimpan(){
  const nama  = (document.getElementById('sdgc-nama')?.value||'').trim();
  const kota  = (document.getElementById('sdgc-kota')?.value||'').trim();
  const sdg1  = document.getElementById('sdgc-cb1')?.checked  || false;
  const sdg3  = document.getElementById('sdgc-cb3')?.checked  || false;
  const sdg4  = document.getElementById('sdgc-cb4')?.checked  || false;
  const sdg10 = document.getElementById('sdgc-cb10')?.checked || false;
  const sdg16 = document.getElementById('sdgc-cb16')?.checked || false;

  // Validasi persetujuan deklarasi
  const agreeEl = document.getElementById('sdgc-agree');
  if(agreeEl && !agreeEl.checked){
    agreeEl.parentElement.style.borderColor='#E05252';
    agreeEl.parentElement.style.background='#FFF5F5';
    setTimeout(()=>{ agreeEl.parentElement.style.borderColor='var(--border)'; agreeEl.parentElement.style.background='#fff'; },1800);
    showToast('Centang persetujuan deklarasi terlebih dahulu.','err');
    return;
  }

  const canvas = document.getElementById('sdgcCanvas');
  const alreadySigned = sessionStorage.getItem('sdg_signed')==='1';
  if(!alreadySigned && (!canvas || !_sdgcHasMark)){
    // belum tanda tangan
    const wrap = canvas?.parentElement;
    if(wrap){ wrap.style.borderColor='#E05252'; setTimeout(()=>{ wrap.style.borderColor=''; },1800); }
    showToast('Tambahkan tanda tangan digital Anda terlebih dahulu.','err');
    return;
  }

  // Simpan ke sessionStorage
  sessionStorage.setItem('sdg_nama',   nama);
  sessionStorage.setItem('sdg_kota',   kota);
  sessionStorage.setItem('sdg_sdg1',   sdg1?'1':'0');
  sessionStorage.setItem('sdg_sdg3',   sdg3?'1':'0');
  sessionStorage.setItem('sdg_sdg4',   sdg4?'1':'0');
  sessionStorage.setItem('sdg_sdg10',  sdg10?'1':'0');
  sessionStorage.setItem('sdg_sdg16',  sdg16?'1':'0');
  sessionStorage.setItem('sdg_signed', '1');
  if(rmCurrentUser){
    _sb.auth.getSession().then(({ data:{ session } })=>{
      if(session) _sb.from('sdg_commitments').upsert(
        { user_id:session.user.id, nama, kota, sdg1, sdg3, sdg4, sdg10, sdg16, signed:true, tanggal_deklarasi:new Date().toISOString().split('T')[0] },
        { onConflict:'user_id' }
      ).then(({error})=>{
        if(!error) showToast('Komitmen SDGs berhasil disimpan! ✅','ok');
        else console.error('SDG save error:',error);
      });
    });
  }
  const now = new Date();
  const tgl = now.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
  sessionStorage.setItem('sdg_tanggal', tgl);

  // Tampilkan success
  const form = document.getElementById('sdgc-form');
  const succ = document.getElementById('sdgc-success');
  if(form) form.style.display='none';
  if(succ){
    succ.style.display='block';
    const tglEl = document.getElementById('sdgc-tgl-success');
    if(tglEl) tglEl.textContent = tgl;
  }
}

/* - SCROLL-HIDE: sub-fitur tab bar - */
(function(){
  let lastY = 0, ticking = false;
  const HIDE_THRESHOLD  = 30;   // px scroll-down sebelum sembunyi
  const SHOW_THRESHOLD  = -8;   // px scroll-up sebelum muncul lagi
  const TOP_ALWAYS_SHOW = 80;   // selalu tampil kalau dekat atas halaman

  function getActiveBar(){
    const p = typeof currentPage !== 'undefined' ? currentPage : '';
    if(p === 'makna-pernikahan')     return document.getElementById('mkTabBar');
    if(p === 'pendaftaran-nikah')   return document.getElementById('pnTabBar');
    if(p === 'simulasi-biaya-nikah') return document.getElementById('sbTabBar');
    return null;
  }

  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      const y     = window.scrollY;
      const delta = y - lastY;
      const bar   = getActiveBar();

      if(bar){
        if(y < TOP_ALWAYS_SHOW){
          bar.style.transform = '';
        } else if(delta > HIDE_THRESHOLD){
          bar.style.transform = 'translateY(-100%)';
        } else if(delta < SHOW_THRESHOLD){
          bar.style.transform = '';
        }
      }

      lastY    = y;
      ticking  = false;
    });
  }

  window.addEventListener('scroll', onScroll, {passive:true});
})();



// Hero image skeleton: sembunyikan shimmer saat gambar sudah load
(function(){
  var img = document.getElementById('heroImg');
  if(!img) return;
  function onHeroLoaded(){
    // Fade in gambar
    img.style.transition = 'opacity 0.6s ease';
    img.setAttribute('opacity','0');
    var op = 0;
    var t = setInterval(function(){
      op += 0.05;
      img.setAttribute('opacity', Math.min(op,1));
      if(op >= 1){
        clearInterval(t);
        // Sembunyikan skeleton & shimmer
        var sk = document.getElementById('heroImgSkeleton');
        var sh = document.getElementById('heroImgShimmer');
        if(sk) sk.setAttribute('opacity','0');
        if(sh) sh.setAttribute('opacity','0');
      }
    }, 20);
  }
  // SVG <image> tidak punya event onload native di semua browser
  // Pakai Image() object JS sebagai proxy
  var probe = new Image();
  probe.onload = onHeroLoaded;
  probe.onerror = function(){
    // Gagal load: tetap sembunyikan skeleton, biarkan gambar transparan
    var sk = document.getElementById('heroImgSkeleton');
    var sh = document.getElementById('heroImgShimmer');
    if(sk) sk.setAttribute('fill','#eee');
    if(sh) sh.setAttribute('opacity','0');
  };
  probe.src = 'https://res.cloudinary.com/wqqzwgpl/image/upload/f_auto,q_auto/WhatsApp_Image_2026-08-13_at_15.18.48';
})();


(function(){
  if(!ENABLE_TURNSTILE) return;

  // Load script Cloudflare setelah halaman selesai — tidak ganggu animasi
  window.addEventListener('load', function(){
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    document.body.appendChild(s);

    // Widget beranda — muncul setelah animasi beranda selesai (~1 detik)
    if(TURNSTILE_SHOW_ON_BERANDA){
      var wrap = document.getElementById('turnstile-beranda-wrap');
      if(!wrap) return;

      // Tampilkan card dulu setelah 1.2 detik
      setTimeout(function(){
        wrap.classList.add('ts-show');

        // Render widget setelah script siap
        var tryRender = setInterval(function(){
          if(typeof turnstile === 'undefined') return;
          clearInterval(tryRender);
          turnstile.render('#turnstile-beranda-widget', {
            sitekey: TURNSTILE_SITE_KEY,
            size: 'compact',
            callback: function(){
              // Berhasil → tunggu 2 detik → hilang
              setTimeout(function(){
                wrap.classList.remove('ts-show');
                wrap.classList.add('ts-hide');
                setTimeout(function(){ wrap.style.display='none'; }, 500);
              }, 2000);
            }
          });
        }, 200);
      }, 1200);
    }
  });
})();

