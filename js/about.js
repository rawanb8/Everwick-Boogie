// Contact page functionality
$(document).ready(async function () {
    await app.loadData();
    setupContactForm();
    animateStats();
});

function setupContactForm() {
    $('#contact-form').on('submit', function (e) {
        e.preventDefault();
        handleContactSubmission();  // collect form data
    });
}

function handleContactSubmission() {
    const requiredFields = [
        'contact-first-name',
        'contact-last-name',
        'contact-email',
        'contact-subject',
        'contact-message'
    ];
    let isValid = true;

    requiredFields.forEach(function (fieldId) {
        const $field = $('#' + fieldId);
        if (!$field.val().trim()) {
            $field.addClass('error');
            isValid = false;
        } else {
            $field.removeClass('error');
        }
    });

    if (!isValid) {
        app.showNotification('Please fill in all required fields', 'error');
        return;
    }

    const formData = {
        firstName: $('#contact-first-name').val(),
        lastName: $('#contact-last-name').val(),
        email: $('#contact-email').val(),
        phone: $('#contact-phone').val(),
        subject: $('#contact-subject').val(),
        message: $('#contact-message').val(),
        newsletter: $('#newsletter-signup').is(':checked'),
        timestamp: new Date().toISOString()
    };

    app.showNotification('Sending message...', 'info');

    setTimeout(function () {
        let messages = app.getFromStorage('contact-messages') || [];
        messages.push(formData);
        app.saveToStorage('contact-messages', messages);

        app.showNotification('Thank you! Your message has been sent. We\'ll get back to you within 24 hours.', 'success');

        $('#contact-form')[0].reset();

        if (formData.newsletter) {
            setTimeout(function () {
                app.showNotification('You\'ve been subscribed to our newsletter!', 'success');
            }, 1000);
        }
    }, 1500);
}

function toggleFAQ(questionElement) {
    const $faqItem = $(questionElement).parent();
    const $answer = $faqItem.find('.faq-answer');
    const $toggle = $faqItem.find('.faq-toggle');

    // Close other open FAQ items
    $('.faq-item').not($faqItem).each(function () {
        const $item = $(this);
        if ($item.hasClass('active')) {
            $item.removeClass('active');
            $item.find('.faq-answer').css('max-height', '0');
            $item.find('.faq-toggle').text('+');
        }
    });

    // Toggle current FAQ item
    if ($faqItem.hasClass('active')) {
        $faqItem.removeClass('active');
        $answer.css('max-height', '0');
        $toggle.text('+');
    } else {
        $faqItem.addClass('active');
        $answer.css('max-height', $answer[0].scrollHeight + 'px');
        $toggle.text('−');
    }
}

function animateStats() {
    const $stats = $('.stat-number');
    const observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateNumber($(entry.target));
                obs.unobserve(entry.target);
            }
        });
    });

    $stats.each(function () {
        observer.observe(this);
    });
}

function animateNumber($element) {
    const text = $element.text();
    const isPercentage = text.includes('%');
    const number = parseInt(text.replace(/[^0-9]/g, ''));
    const duration = 2000;
    const steps = 60;
    const increment = number / steps;
    let current = 0;

    const timer = setInterval(function () {
        current += increment;
        if (current >= number) {
            current = number;
            clearInterval(timer);
        }
        $element.text(Math.floor(current) + (isPercentage ? '%' : text.includes('+') ? '+' : ''));
    }, duration / steps);
}

function scrollToFAQ() {
    $('html, body').animate({ scrollTop: $('.faq-section').offset().top }, 600);
}

function openCartModal() {
    // Implementation if needed
}
