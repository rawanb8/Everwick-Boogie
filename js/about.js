// Contact page functionality
document.addEventListener('DOMContentLoaded', async () => {
    await app.loadData();
    setupContactForm();
    animateStats();
});


function setupContactForm() {
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', (e) => {

        //By default, submitting a form refreshes the page or sends data to a new URL.
        // this stops that behavior — it prevents the page reload
        e.preventDefault();

        preventDefault()
        handleContactSubmission();  //collect form data
    });
}

function handleContactSubmission() {
    // Validate form
    const requiredFields = ['contact-first-name', 'contact-last-name', 'contact-email', 'contact-subject', 'contact-message'];
    let isValid = true;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

    if (!isValid) {
        app.showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Collect form data
    const formData = {
        firstName: document.getElementById('contact-first-name').value,
        lastName: document.getElementById('contact-last-name').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value,
        newsletter: document.getElementById('newsletter-signup').checked,
        timestamp: new Date().toISOString()
    };

    // Simulate form submission
    app.showNotification('Sending message...', 'info');

    setTimeout(() => {
        // Save to local storage (simulate backend)
        const messages = app.getFromStorage('contact-messages') || [];
        messages.push(formData);
        app.saveToStorage('contact-messages', messages);

        // Show success message
        app.showNotification('Thank you! Your message has been sent. We\'ll get back to you within 24 hours.', 'success');

        // Reset form
        document.getElementById('contact-form').reset();

        // Handle newsletter signup
        if (formData.newsletter) {
            setTimeout(() => {
                app.showNotification('You\'ve been subscribed to our newsletter!', 'success');
            }, 1000);
        }
    }, 1500);
}

function toggleFAQ(questionElement) {
    const faqItem = questionElement.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const toggle = questionElement.querySelector('.faq-toggle');

    // Close other open FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem && item.classList.contains('active')) {
            item.classList.remove('active');
            item.querySelector('.faq-answer').style.maxHeight = '0';
            item.querySelector('.faq-toggle').textContent = '+';
        }
    });

    // Toggle current FAQ item
    if (faqItem.classList.contains('active')) {
        faqItem.classList.remove('active');
        answer.style.maxHeight = '0';
        toggle.textContent = '+';
    } else {
        faqItem.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        toggle.textContent = '−';
    }
}

function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });

    stats.forEach(stat => observer.observe(stat));
}

function animateNumber(element) {
    const text = element.textContent;
    const isPercentage = text.includes('%');
    const number = parseInt(text.replace(/[^0-9]/g, ''));
    const duration = 2000;
    const steps = 60;
    const increment = number / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            current = number;
            clearInterval(timer);
        }

        element.textContent = Math.floor(current) + (isPercentage ? '%' : text.includes('+') ? '+' : '');
    }, duration / steps);
}

function scrollToFAQ() {
    document.querySelector('.faq-section').scrollIntoView({ behavior: 'smooth' });
}

function openCartModal() {
    // Implementation if needed
}