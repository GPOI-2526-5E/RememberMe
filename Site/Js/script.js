document.addEventListener('DOMContentLoaded', function () {
    AOS.init({
        duration: 1000,
        once: true
    });

    CreateNavbarMainAndFooter();
    ModifyLanguage();
    checkCookie();
    initQRCodeSection();
});

function initQRCodeSection() {
    // Store URLs
    const STORE_URLS = {
        ios: 'https://apps.apple.com/app/rememberme',
        android: 'https://play.google.com/store/apps/details?id=com.rememberme'
    };

    // QR Code paths
    const QR_PATHS = {
        ios: '../Img/qr-ios.svg',
        android: '../Img/qr-android.svg'
    };

    // Elementi DOM
    const dynamicQrImg = document.getElementById('dynamicQrImg');
    const dynamicQrTitle = document.getElementById('dynamicQrTitle');
    const dynamicQrSubtitle = document.getElementById('dynamicQrSubtitle');
    const dynamicQrLink = document.getElementById('dynamicQrLink');
    const dynamicQrCard = document.getElementById('dynamicQrCard');
    
    const selectIosBtn = document.getElementById('selectIosBtn');
    const selectAndroidBtn = document.getElementById('selectAndroidBtn');
    const appStoreBtn = document.getElementById('appStoreBtn');
    const googlePlayBtn = document.getElementById('googlePlayBtn');
    const storeNote = document.getElementById('storeNote');

    let currentPlatform = 'ios';

    // Funzione per cambiare piattaforma
    function setPlatform(platform) {
        if (platform === currentPlatform) return; // Evita cambi inutili
        
        currentPlatform = platform;
        
        // Aggiungi animazione al cambio
        dynamicQrCard.classList.add('platform-change');
        setTimeout(() => {
            dynamicQrCard.classList.remove('platform-change');
        }, 400);
        
        if (platform === 'ios') {
            // Cambia QR code
            dynamicQrImg.src = QR_PATHS.ios;
            dynamicQrTitle.textContent = 'iOS';
            dynamicQrSubtitle.textContent = 'Scansiona per scaricare su App Store';
            dynamicQrLink.href = STORE_URLS.ios;
            
            // Aggiorna bottoni
            selectIosBtn.classList.add('active');
            selectAndroidBtn.classList.remove('active');
            
            // Aggiorna nota
            storeNote.innerHTML = '<p>📱 Inquadra il QR code con il tuo iPhone per scaricare l\'app dall\'App Store</p>';
            
            // Evidenzia il bottone corrispondente
            appStoreBtn.classList.add('highlight');
            setTimeout(() => {
                appStoreBtn.classList.remove('highlight');
            }, 1000);
        } else {
            // Cambia QR code
            dynamicQrImg.src = QR_PATHS.android;
            dynamicQrTitle.textContent = 'Android';
            dynamicQrSubtitle.textContent = 'Scansiona per scaricare su Google Play';
            dynamicQrLink.href = STORE_URLS.android;
            
            // Aggiorna bottoni
            selectAndroidBtn.classList.add('active');
            selectIosBtn.classList.remove('active');
            
            // Aggiorna nota
            storeNote.innerHTML = '<p>🤖 Inquadra il QR code con il tuo dispositivo Android per scaricare l\'app da Google Play</p>';
            
            // Evidenzia il bottone corrispondente
            googlePlayBtn.classList.add('highlight');
            setTimeout(() => {
                googlePlayBtn.classList.remove('highlight');
            }, 1000);
        }
    }

    // Event listeners per i bottoni di selezione piattaforma
    selectIosBtn.addEventListener('click', function() {
        setPlatform('ios');
    });

    selectAndroidBtn.addEventListener('click', function() {
        setPlatform('android');
    });

    // Event listeners per i bottoni store
    appStoreBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setPlatform('ios');
        window.open(STORE_URLS.ios, '_blank');
    });

    googlePlayBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setPlatform('android');
        window.open(STORE_URLS.android, '_blank');
    });

    // Click sul QR code apre il link
    dynamicQrCard.addEventListener('click', function() {
        window.open(dynamicQrLink.href, '_blank');
    });

    // Rilevamento dispositivo
    function detectDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            setPlatform('ios');
        } else if (/android/i.test(userAgent)) {
            setPlatform('android');
        }
    }

    // Esegui il rilevamento dopo un piccolo ritardo
    setTimeout(detectDevice, 1000);

    // Inizializza con iOS
    setPlatform('ios');
}

function checkCookie() {
    // Controlla se l'utente ha già espresso le preferenze
    if (!localStorage.getItem('cookieConsent') && !document.cookie.includes('cookieConsent')) {
        setTimeout(() => {
            document.getElementById('cookiePopup').style.display = 'block';
        }, 5000); // Mostra dopo 2 secondi
    }

    // Gestione personalizzazione
    let isCustomizing = false;

    document.getElementById('customizeBtn').addEventListener('click', function () {
        const prefs = document.getElementById('cookiePreferences');
        if (!isCustomizing) {
            prefs.style.display = 'block';
            this.textContent = 'Salva Preferenze';
            isCustomizing = true;
        } else {
            savePreferences(false);
        }
    });

    // Accetta tutti
    document.getElementById('acceptAllBtn').addEventListener('click', function () {
        savePreferences(true);
    });

    // Solo essenziali
    document.getElementById('rejectNonEssentialBtn').addEventListener('click', function () {
        document.getElementById('analyticsCookies').checked = false;
        document.getElementById('marketingCookies').checked = false;
        savePreferences(false);
    });

    function savePreferences(acceptAll) {
        const preferences = {
            essential: true,
            analytics: acceptAll ? true : document.getElementById('analyticsCookies').checked,
            marketing: acceptAll ? true : document.getElementById('marketingCookies').checked,
            timestamp: new Date().toISOString()
        };

        // Salva in entrambi per sicurezza (localStorage + cookie)
        localStorage.setItem('cookieConsent', JSON.stringify(preferences));

        //Cookie con scadenza 365 giorni
        const date = new Date();
        date.setTime(date.getTime() + (2 * 60 * 1000));
        document.cookie = `cookieConsent=${JSON.stringify(preferences)}; expires=${date.toUTCString()}; path=/`;

        // Anima e nascondi
        const popup = document.getElementById('cookiePopup');
        popup.style.animation = 'slideOut 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';

        setTimeout(() => {
            popup.style.display = 'none';
        }, 500);
    }
}

// Animazione di uscita
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        0% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        100% {
            opacity: 0;
            transform: scale(0.3) translateY(100px);
        }
    }
`;
document.head.appendChild(style);

// ========== FUNZIONE DROPDOWN PREMIUM ==========
function ModifyLanguage() {
    const languageOptions = document.getElementById('languageOptions');
    const options = document.querySelectorAll('.language-option');

    // Ruota freccia quando dropdown si apre/chiude
    const dropdownTrigger = document.getElementById('selectedLanguage');

    if (dropdownTrigger) {
        dropdownTrigger.addEventListener('click', function (e) {
            // Bootstrap gestisce già l'apertura, noi aggiungiamo un effetto
            setTimeout(() => {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                const arrow = this.querySelector('.dropdown-arrow');
                if (arrow) {
                    arrow.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0)';
                }
            }, 10);
        });
    }

    // Gestione selezione lingua
    options.forEach(option => {
        option.addEventListener('click', function (e) {
            e.preventDefault();

            const lang = this.getAttribute('data-lang');
            const img = this.querySelector('img').src;
            const text = this.querySelector('span:not(.check-mark)').textContent;

            // Aggiorna il pulsante principale
            if (dropdownTrigger) {
                const triggerImg = dropdownTrigger.querySelector('img');
                const triggerText = dropdownTrigger.querySelector('span:first-of-type');

                if (triggerImg) triggerImg.src = img;
                if (triggerText) triggerText.textContent = text;
            }

            // Rimuovi active da tutte le opzioni
            options.forEach(opt => {
                opt.classList.remove('active-language');
            });

            // Aggiungi active all'opzione selezionata
            this.classList.add('active-language');

            // Chiudi dropdown (Bootstrap)
            if (languageOptions) {
                const dropdown = bootstrap.Dropdown.getInstance(dropdownTrigger);
                if (dropdown) dropdown.hide();
            }

            // Reset freccia
            const arrow = dropdownTrigger.querySelector('.dropdown-arrow');
            if (arrow) arrow.style.transform = 'rotate(0)';

            // Cambia contenuti
            changeLanguage(lang);
        });
    });

    // Chiudi dropdown e reset freccia quando si clicca fuori
    document.addEventListener('click', function (e) {
        if (!dropdownTrigger?.contains(e.target) && !languageOptions?.contains(e.target)) {
            const arrow = dropdownTrigger?.querySelector('.dropdown-arrow');
            if (arrow) arrow.style.transform = 'rotate(0)';
        }
    });

    // Gestione lingua salvata
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'it';

    if (savedLanguage !== 'it') {
        const optionToSelect = document.querySelector(`.language-option[data-lang="${savedLanguage}"]`);
        if (optionToSelect) {
            const img = optionToSelect.querySelector('img').src;
            const text = optionToSelect.querySelector('span:not(.check-mark)').textContent;

            if (dropdownTrigger) {
                const triggerImg = dropdownTrigger.querySelector('img');
                const triggerText = dropdownTrigger.querySelector('span:first-of-type');

                if (triggerImg) triggerImg.src = img;
                if (triggerText) triggerText.textContent = text;
            }

            optionToSelect.classList.add('active-language');
            changeLanguage(savedLanguage);
        }
    } else {
        // Italiano selezionato di default
        const itOption = document.querySelector('.language-option[data-lang="it"]');
        if (itOption) itOption.classList.add('active-language');
    }
}

function changeLanguage(lang) {
    // Translations object
    const languageTexts = {
        it: {
            home: 'Home',
            download: 'Download',
            contatti: 'Contatti',
            welcomeTitle: 'Mantieni vivo il ricordo con Remember Me',
            welcomeText: 'Un modo semplice e digitale per ricordare le persone care. Scansiona un QR code, scopri la loro storia, lascia un messaggio e conserva i ricordi nel tempo.',
            footerTagline: 'La famiglia sempre vicina',
            quickLinks: 'Quick Links',
            supporto: 'Supporto',
            customerService: 'Servizio Clienti',
            privacyPolicy: 'Privacy Policy',
            faq: 'FAQ',
            contactTitle: 'Contatti'
        },
        en: {
            home: 'Home',
            download: 'Download',
            contatti: 'Contact',
            welcomeTitle: 'Keep the memory alive with Remember Me',
            welcomeText: 'A simple and digital way to remember loved ones. Scan a QR code, discover their story, leave a message and preserve memories over time.',
            footerTagline: 'Family always close',
            quickLinks: 'Quick Links',
            supporto: 'Support',
            customerService: 'Customer Service',
            privacyPolicy: 'Privacy Policy',
            faq: 'FAQ',
            contactTitle: 'Contacts'
        }
    };

    if (languageTexts[lang]) {
        const texts = languageTexts[lang];

        // Navbar links
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.language-selector-btn)');
        if (navLinks[0]) navLinks[0].textContent = texts.home;
        if (navLinks[1]) navLinks[1].textContent = texts.download;
        if (navLinks[2]) navLinks[2].textContent = texts.contatti;

        // Main content
        const welcomeTitle = document.querySelector('#divMain h1');
        if (welcomeTitle) welcomeTitle.textContent = texts.welcomeTitle;

        const welcomeText = document.querySelector('#divMain .lead');
        if (welcomeText) welcomeText.textContent = texts.welcomeText;

        // Footer
        const footerTagline = document.querySelector('.footer-brand p');
        if (footerTagline) footerTagline.textContent = texts.footerTagline;

        const footerTitles = document.querySelectorAll('.footer-links h4');
        if (footerTitles[0]) footerTitles[0].textContent = texts.quickLinks;
        if (footerTitles[1]) footerTitles[1].textContent = texts.supporto;

        const supportLinks = document.querySelectorAll('.footer-links:nth-child(3) ul li a');
        if (supportLinks[0]) supportLinks[0].textContent = texts.customerService;
        if (supportLinks[1]) supportLinks[1].textContent = texts.privacyPolicy;
        if (supportLinks[2]) supportLinks[2].textContent = texts.faq;

        const contactTitle = document.querySelector('.footer-contact h4');
        if (contactTitle) contactTitle.textContent = texts.contactTitle;

        localStorage.setItem('preferredLanguage', lang);
    }
}

// ========== FUNZIONE PRINCIPALE CORRETTA ==========
function CreateNavbarMainAndFooter() {
    const navbar = document.getElementById('navbar');
    const footer = document.getElementById('footer');
    const logoNavbar = document.querySelector('.logo-navbar');
    const divMain = document.getElementById('divMain');


    // Setup iniziale - SOLO navbar nascosta, footer VISIBILE SUBITO!
    if (navbar) {
        navbar.style.opacity = '0';
        navbar.style.transform = 'translateY(-100%)';
        navbar.style.transition = 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.5s ease';
    }

    if (logoNavbar) {
        logoNavbar.style.opacity = '0';
        logoNavbar.style.transform = 'scale(0.8) rotate(-5deg)';
        logoNavbar.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }

    // FOOTER VISIBILE SUBITO
    if (footer) {
        footer.style.opacity = '0';
        footer.style.transform = 'translateY(0)';
        footer.style.visibility = 'visible';
        footer.style.display = 'block';
        footer.classList.add('active');
    }

    // Avvia animazione
    animateRememberText();
}

// ========== ANIMAZIONE LOGO CORRETTA ==========
function animateRememberText() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../Css/animations.css';
    document.head.appendChild(link);

    setTimeout(() => {
        const mainLogo = document.getElementById('mainLogo');
        const loaderCircle = document.querySelector('.loader-circle');
        const rememberContainer = document.querySelector('.remember-text-container');
        const divLogo = document.getElementById('divLogo');
        const divMain = document.getElementById('divMain');
        const divMain2 = document.getElementById('divMain2');
        const navbar = document.getElementById('navbar');
        const footer = document.getElementById('footer');

        // Logo + cerchio appaiono
        mainLogo.classList.add('animate-logo');
        loaderCircle.classList.add('animate-circle');

        // Scritta appare
        setTimeout(() => {
            rememberContainer.classList.add('show');

            // Dopo 2.5 secondi, transizione al contenuto
            setTimeout(() => {
                // Nascondi logo e scritta
                mainLogo.style.opacity = '0';
                mainLogo.style.transform = 'translateY(-30px) scale(0.8)';
                loaderCircle.style.opacity = '0';
                loaderCircle.style.transform = 'translateY(-30px) scale(0.8)';
                rememberContainer.style.opacity = '0';

                // Fade out loader
                setTimeout(() => {
                    divLogo.classList.add('fade-out');

                    setTimeout(() => {
                        divLogo.classList.add('d-none');

                        // Mostra contenuto principale
                        divMain.classList.add('show');
                        divMain2.classList.add('show');

                        // Mostra navbar
                        navbar.style.transform = 'translateY(0)';
                        navbar.style.opacity = '1';

                        // Logo navbar
                        const logoNavbar = document.querySelector('.logo-navbar');
                        if (logoNavbar) {
                            logoNavbar.style.opacity = '1';
                            logoNavbar.style.transform = 'scale(1) rotate(0)';
                        }

                        // FOOTER
                        if (footer) {
                            footer.style.opacity = '1';
                            footer.style.transform = 'translateY(0)';
                            footer.style.visibility = 'visible';
                            footer.style.display = 'block';
                            footer.classList.add('active');
                        }

                    }, 500);
                }, 300);
            }, 2500);
        }, 500);
    }, 500);
}