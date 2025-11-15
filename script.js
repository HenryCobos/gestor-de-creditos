// WhatsApp Form Handler
document.getElementById('whatsappForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const phoneInput = document.getElementById('whatsapp');
    const phone = phoneInput.value.trim();
    const messageDiv = document.getElementById('formMessage');
    
    // Validación básica
    if (!phone || phone.length < 8) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = '❌ Por favor ingresa un número de WhatsApp válido';
        return;
    }
    
    // Limpiar el número (quitar espacios y caracteres especiales excepto +)
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Mensaje de bienvenida al grupo
    const message = encodeURIComponent('¡Hola! Quiero unirme al grupo VIP de Gestor de Créditos 🎯');
    
    // Número de WhatsApp del administrador (reemplaza con tu número real)
    const adminPhone = '51999999999'; // Ejemplo: país + número sin el + inicial
    
    // Abrir WhatsApp
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Mostrar mensaje de éxito
    messageDiv.className = 'form-message success';
    messageDiv.textContent = '✅ ¡Perfecto! Se abrirá WhatsApp para unirte al grupo VIP';
    
    // Limpiar el formulario
    phoneInput.value = '';
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
});

// Smooth scroll para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animaciones al hacer scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Aplicar animaciones a las secciones
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Track clicks en botones de descarga (si tienes Google Analytics)
document.querySelectorAll('a[href*="apps.apple.com"]').forEach(button => {
    button.addEventListener('click', function() {
        const buttonText = this.textContent.trim();
        console.log('Download button clicked:', buttonText);
        
        // Si tienes Google Analytics configurado
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                'event_category': 'Download',
                'event_label': buttonText
            });
        }
    });
});

// Detectar si el usuario está en iOS
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Mostrar mensaje especial para usuarios de iOS
if (isIOS()) {
    console.log('Usuario de iOS detectado');
    // Podrías mostrar un banner especial o animación
}

// Prevenir spam en el formulario de WhatsApp
let lastSubmitTime = 0;
const SUBMIT_COOLDOWN = 5000; // 5 segundos

document.getElementById('whatsappForm')?.addEventListener('submit', function(e) {
    const now = Date.now();
    if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
        e.preventDefault();
        const messageDiv = document.getElementById('formMessage');
        messageDiv.className = 'form-message error';
        messageDiv.textContent = '⏳ Por favor espera unos segundos antes de intentar nuevamente';
        return false;
    }
    lastSubmitTime = now;
}, true);

