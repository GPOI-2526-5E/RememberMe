document.addEventListener('DOMContentLoaded', function () {
    AOS.init({
        duration: 1000,
        once: true
    });

    CreateNavbarMainAndFooter();
    ModifyLanguage();
});

// ========== FUNZIONE DROPDOWN PREMIUM ==========
function ModifyLanguage() {
    const languageOptions = document.getElementById('languageOptions');
    const options = document.querySelectorAll('.language-option');
    
    // Non serve gestire il toggle manualmente perché Bootstrap lo fa già!
    // Aggiungiamo solo animazioni e funzionalità extra
    
    // Ruota freccia quando dropdown si apre/chiude
    const dropdownTrigger = document.getElementById('selectedLanguage');
    
    if (dropdownTrigger) {
        dropdownTrigger.addEventListener('click', function(e) {
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
    
    // Dizionario testi
    const languageTexts = {
        'it': {
            'home': 'Home',
            'download': 'Download',
            'contatti': 'Contatti',
            'footerTagline': 'La famiglia sempre vicina',
            'quickLinks': 'Quick Links',
            'supporto': 'Supporto',
            'customerService': 'Servizio Clienti',
            'contactUs': 'Contattaci',
            'privacyPolicy': 'Privacy Policy',
            'faq': 'FAQ',
            'contactTitle': 'Contatti',
            'welcomeTitle': 'Benvenuto in Remember Me',
            'welcomeText': 'Con la nostra app semplice ed intuitiva riuscirai a rimanere sempre in "contatto" con i tuoi cari',
        },
        'en': {
            'home': 'Home',
            'download': 'Download',
            'contatti': 'Contact',
            'footerTagline': 'Family always close',
            'quickLinks': 'Quick Links',
            'supporto': 'Support',
            'customerService': 'Customer Service',
            'contactUs': 'Contact Us',
            'privacyPolicy': 'Privacy Policy',
            'faq': 'FAQ',
            'contactTitle': 'Contacts',
            'welcomeTitle': 'Welcome to Remember Me',
            'welcomeText': 'With our simple and intuitive app you will always stay "connected" with your loved ones',
        }
    };
    
    function changeLanguage(lang) {
        console.log(`Lingua cambiata in: ${lang}`);
        
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
}

// ========== ANIMAZIONE LOGO ==========
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
                        
                        // Mostra navbar
                        navbar.style.transform = 'translateY(0)';
                        navbar.style.opacity = '1';
                        
                        // Logo navbar
                        const logoNavbar = document.querySelector('.logo-navbar');
                        if (logoNavbar) {
                            logoNavbar.style.opacity = '1';
                            logoNavbar.style.transform = 'scale(1) rotate(0)';
                        }

                        // Mostra footer
                        footer.classList.add('active');

                    }, 500);
                }, 300);
            }, 2500);
        }, 500);
    }, 500);
}

// ========== FUNZIONE PRINCIPALE ==========
// ========== FUNZIONE PRINCIPALE CORRETTA ==========
function CreateNavbarMainAndFooter() {
    const navbar = document.getElementById('navbar');
    const footer = document.getElementById('footer');
    const logoNavbar = document.querySelector('.logo-navbar');
    const divMain = document.getElementById('divMain');
    
    console.log('Footer trovato:', footer); // Debug

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

    // FOOTER VISIBILE SUBITO - RIMUOVI QUALSIASI NASCONDIGLIO
    if (footer) {
        // Rimuovi stili inline che nascondono il footer
        footer.style.opacity = '0';
        footer.style.transform = 'translateY(0)';
        footer.style.visibility = 'visible';
        footer.style.display = 'block';
        footer.classList.add('active'); // Aggiungi subito la classe active
        console.log('Footer reso visibile');
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
                        
                        // Mostra navbar
                        navbar.style.transform = 'translateY(0)';
                        navbar.style.opacity = '1';
                        
                        // Logo navbar
                        const logoNavbar = document.querySelector('.logo-navbar');
                        if (logoNavbar) {
                            logoNavbar.style.opacity = '1';
                            logoNavbar.style.transform = 'scale(1) rotate(0)';
                        }

                        // FOOTER - ASSICURATI CHE SIA VISIBILE
                        if (footer) {
                            footer.style.opacity = '1';
                            footer.style.transform = 'translateY(0)';
                            footer.style.visibility = 'visible';
                            footer.style.display = 'block';
                            footer.classList.add('active');
                            console.log('Footer confermato visibile dopo animazione');
                        }

                    }, 500);
                }, 300);
            }, 2500);
        }, 500);
    }, 500);
}

