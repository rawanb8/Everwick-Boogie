// Contact page functionality
$(document).ready(async function () {
    setupContactForm();
    animateStats();
    setupPhoneInput()
});

function setupContactForm() {
    $('#contact-form').on('submit', function (e) {
        e.preventDefault();
        handleContactSubmission();  // collect form data
    });
}

function setupPhoneInput() {
    $('#contact-phone').on('input', function () {
        let val = $(this).val();
        // Remove all non-digits
        val = val.replace(/\D/g, '');
        // Limit to 10 digits
        if (val.length > 10) val = val.slice(0, 10);
        $(this).val(val);
    });
}

function handleContactSubmission() {
    let requiredFields = [
        'contact-first-name',
        'contact-last-name',
        'contact-email',
        'contact-subject',
        'contact-message'
    ];

    let isValid = true;

    // Validate required fields
    requiredFields.forEach(function (fieldId) {
        let $field = $('#' + fieldId);
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

    // Collect form data
    let formData = {
        firstName: $('#contact-first-name').val(),
        lastName: $('#contact-last-name').val(),
        email: $('#contact-email').val(),
        phone: $('#contact-phone').val(),
        subject: $('#contact-subject').val(),
        message: $('#contact-message').val(),
        timestamp: new Date().toISOString()
    };

    // --- CLEAR INPUTS IMMEDIATELY ---
    $('#contact-form')[0].reset();
    $('.error').removeClass('error');

    // --- DISABLE BUTTON FOR A MOMENT ---
    let $btn = $('#contact-form button[type="submit"]');
    $btn.text('Sent!');
    $btn.prop('disabled', true);

    // --- REVERT BUTTON AFTER 2s ---
    setTimeout(() => {
        $btn.text('Send Message');
        $btn.prop('disabled', false);
    }, 2000);

    let messages = JSON.parse(localStorage.getItem('contact-messages') || '[]');
    messages.push(formData);
    localStorage.setItem('contact-messages', JSON.stringify(messages));

}

document.addEventListener("DOMContentLoaded", () => {
    let elements = document.querySelectorAll('.reveal');

    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target); // animate once
            }
        });
    }, { threshold: 0.2 });

    elements.forEach(el => observer.observe(el));
});


function toggleFAQ(questionElement) {
    let $faqItem = $(questionElement).parent();
    let $answer = $faqItem.find('.faq-answer');
    let $toggle = $faqItem.find('.faq-toggle');

    // Close other open FAQ items
    $('.faq-item').not($faqItem).each(function () {
        let $item = $(this);
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
    let $stats = $('.stat-number');
    let observer = new IntersectionObserver(function (entries, obs) {
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
    let text = $element.text();
    let isPercentage = text.includes('%');
    let number = parseInt(text.replace(/[^0-9]/g, ''));
    let duration = 2000;
    let steps = 60;
    let increment = number / steps;
    let current = 0;

    let timer = setInterval(function () {
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
