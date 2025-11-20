let currentQuizQuestion = 0;
let quizAnswers = [];
let filteredScents = [];

// we check that the document is fully loaded before running js
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch quiz.json
    const response = await fetch('../json/quiz.json');
    if (!response.ok) throw new Error('Failed to load quiz.json');
    const quizData = await response.json();

    // store data
    app.data = app.data || {};
    app.data.quiz_question = quizData.quiz_question || [];

    await app.loadData();

    // display all scents in the library
    loadScentsLibrary();

    // setup tabs (supports data-tab and existing onclick fallbacks)
    initTabs();

    loadQuizQuestions();

    // initialize all filters
    setupFilters();

    // update progress/buttons initial state
    updateQuizProgress();
    updateQuizButtons();

    // automatically switch to the quiz tab when page loads if hash is present
    const hashTab = window.location.hash.slice(1);
    if (hashTab && document.getElementById(`${hashTab}-tab`)) {
      showTab(hashTab);
    }
  } catch (err) {
    console.error(err);
    app.showNotification?.('Failed to load data. Please try again.', 'error');
  }

});

function initTabs() {
  // allow both data-tab and existing onclick handlers
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const attr = btn.dataset.tab;
    const tabName = attr || (btn.getAttribute('onclick') || '').match(/showTab\('([^']+)'/)?.[1];
    if (tabName) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showTab(tabName);
      });
    }
  });
}

function showTab(tabName) {
  // hide all the tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // remove active class from all the tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // show selected tab if exists
  const tabEl = document.getElementById(`${tabName}-tab`);
  if (tabEl) tabEl.classList.add('active');

  // add active to the associated button (data-tab preferred)
  const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`) ||
    document.querySelector(`[onclick="showTab('${tabName}')"]`);
  if (btn) btn.classList.add('active');

  // set hash without scrolling (history API to avoid page jump)
  if (window.history?.replaceState) window.history.replaceState(null, '', `#${tabName}`);
  else window.location.hash = tabName;
}

function loadScentsLibrary() {
  const scents = app.getScents() || []; // returns the full scents array
  // normalize data for consistent filtering (lowercase keys used by filters)
  scents.forEach(s => {
    s.season = s.season?.toLowerCase() || '';
    s.mood = s.mood?.toLowerCase() || '';
    s.category = s.family?.toLowerCase() || '';
    s.aggressiveness = Number(s.aggressiveness) || 0;
  });

  filteredScents = [...scents];   // copy to filteredScents
  displayScents(filteredScents);  // display them
}

function getScentImage(scentId) {
  // Main.js already has product images handling; just ensure fallback here
  const product = app.products?.find(p => p.scentId === scentId);
  return product ? product.images[0] : '/media/products/placeholder.png';
}


function displayScents(scents) {
  const container = document.getElementById('scents-grid');
  if (!container) return;

  container.innerHTML = scents.map(scent => {
    const displayCategory = scent.category || scent.season || '';
    const strengthDots = '●'.repeat(Math.min(10, scent.aggressiveness)) + '○'.repeat(10 - Math.min(10, scent.aggressiveness));
   const product = app.products?.find(p => p.scentId === scent.id);
    const priceHtml = product ? app.formatPrice(product.price) : '$0.00';

    return `
      <div class="scent-card card" role="button" tabindex="0" onclick="showScentDetails(${scent.id})"
           onkeydown="if(event.key==='Enter') showScentDetails(${scent.id})">
        <div class="scent-image">
          <img src="${getScentImage(scent.id)}" alt="${escapeHtml(scent.name)}" class="card-image">
          <div class="scent-category">${escapeHtml(displayCategory)}</div>
        </div>
        <div class="card-content">
          <h3 class="card-title">${escapeHtml(scent.name)}</h3>
          <p class="card-description">${escapeHtml(scent.description || '')}</p>
          <div class="scent-details">
            <div class="scent-mood">Mood: ${escapeHtml(scent.mood)}</div>
            <div class="scent-strength">Strength: <span class="strength-bar">${strengthDots}</span></div>
            <div class="scent-price">${priceHtml}</div>
          </div>
          <div class="scent-notes">
            ${(Array.isArray(scent.notes) ? scent.notes.map(n => `<span class="note-tag">${escapeHtml(n)}</span>`).join('') : '')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// basic escape to avoid template injection if unexpected data appears
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" }[m]));
}

// when the user changes a filter the applyFilters() runs
function setupFilters() {
  const filters = ['category-filter', 'mood-filter', 'season-filter', 'strength-filter'];

  filters.forEach(filterId => {
    const el = document.getElementById(filterId);
    if (el) el.addEventListener('change', applyFilters);
  });
}

function applyFilters() {
  // get all elements + use const since they're not reassigned
  const category = document.getElementById('category-filter')?.value.toLowerCase() || '';
  const mood = document.getElementById('mood-filter')?.value.toLowerCase() || '';
  const season = document.getElementById('season-filter')?.value.toLowerCase() || '';
  const strength = document.getElementById('strength-filter')?.value || '';

  let filtered = app.getScents() || [];

  // normalize scents before filtering (ensure lowercase for comparisons)
  filtered.forEach(s => {
    s.category = s.category.toLowerCase();
    s.mood = s.mood.toLowerCase();
    s.season = s.season.toLowerCase();
    s.aggressiveness = Number(s.aggressiveness) || 0;
  });

  // apply filters if the values do exist
  if (category) filtered = filtered.filter(s => s.category === category);
  if (mood) filtered = filtered.filter(s => s.mood === mood);
  if (season) filtered = filtered.filter(s => s.season === season);
  if (strength) {
    const [min,max] = strength.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) filtered = filtered.filter(s => s.aggressiveness >= min && s.aggressiveness <= max);
  }

  // update and re-render
  filteredScents = filtered;
  displayScents(filteredScents);

  // SHOW / HIDE "COMING SOON" MESSAGE
  let noResults = document.getElementById("no-results");
  if (filteredScents.length === 0) {
    noResults.style.display = "block";
  } else {
    noResults.style.display = "none";
  }

}

function clearFilters() {
  let ids = ['category-filter', 'mood-filter', 'season-filter', 'strength-filter'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  loadScentsLibrary();
}

function showScentDetails(scentId) {
  const scent = app.getScentById ? app.getScentById(scentId) : (app.getScents() || []).find(s => s.id === scentId);
  if (!scent) return;

  const scentName = escapeHtml(scent.name || '');
  const scentDescription = escapeHtml(scent.description || '');
  const displayCategory = escapeHtml(scent.category || scent.season || '');
  const mood = escapeHtml(scent.mood || '');
  const season = escapeHtml(scent.season || '');
  const priceHtml = app.formatPrice ? app.formatPrice(scent.price) : `$${scent.price}`;

  const notesHtml = Array.isArray(scent.notes) ? scent.notes.map(note => `<span class="note-tag">${escapeHtml(note)}</span>`).join('') : '';

  const modalBody = `
    <div class="scent-details-full">
      <img src="" alt="${scentName}" class="scent-detail-image">
      <div class="scent-info">
        <p class="scent-description">${scentDescription}</p>
        <div class="scent-properties">
          <div class="property"><strong>Category:</strong> ${displayCategory}</div>
          <div class="property"><strong>Mood:</strong> ${mood}</div>
          <div class="property"><strong>Season:</strong> ${season}</div>
          <div class="property"><strong>Strength:</strong> ${Number(scent.aggressiveness) || 0}/10</div>
          <div class="property"><strong>Price:</strong> ${priceHtml}</div>
        </div>
        <div class="scent-notes-full">
          <strong>Fragrance Notes:</strong>
          <div class="notes-list">
            ${notesHtml}
          </div>
        </div>
        <div class="scent-actions">
          <a href="customize.html?scent=${scent.id}" class="btn btn-primary">Create Candle</a>
        </div>
      </div>
    </div>
  `;

  const titleEl = document.getElementById('scent-modal-title');
  const bodyEl = document.getElementById('scent-modal-body');
  if (titleEl) titleEl.textContent = scent.name || '';
  if (bodyEl) bodyEl.innerHTML = modalBody;

  app.openModal && app.openModal('scent-modal');
}

function loadQuizQuestions() {
  const questions = app.data.quiz_question || [];
  const container = document.getElementById('quiz-questions');
  if (!container) return;

  container.innerHTML = questions.map((question, index) => {
    if (question.type === 'single_choice') {
      const optionsHtml = (question.options || []).map((option) => `
        <label class="quiz-option">
          <input type="radio" name="question-${index}" value="${escapeHtml(option.value)}">
          <span class="option-text">${escapeHtml(option.label)}</span>
        </label>
      `).join('');
      return `
        <div class="quiz-question ${index === 0 ? 'active' : ''}" id="question-${index}">
          <h3>${escapeHtml(question.question)}</h3>
          <div class="quiz-options">${optionsHtml}</div>
        </div>
      `;
    } else if (question.type === 'scale') {
      const defaultValue = (question.default && Number(question.default)) || Math.round(((question.min || 1) + (question.max || 10)) / 2);
      return `
        <div class="quiz-question ${index === 0 ? 'active' : ''}" id="question-${index}">
          <h3>${escapeHtml(question.question)}</h3>
          <div class="quiz-options">
            <div class="scale-container">
              <label>${escapeHtml(question.labels?.['1'] || '')}</label>
              <input type="range" name="question-${index}" min="${question.min}" max="${question.max}" value="${defaultValue}" class="scale-input">
              <label>${escapeHtml(question.labels?.['10'] || '')}</label>
            </div>
            <div class="scale-value">Value: <span id="scale-value-${index}">${defaultValue}</span></div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="quiz-question ${index === 0 ? 'active' : ''}" id="question-${index}">
          <h3>${escapeHtml(question.question)}</h3>
          <div class="quiz-options">Unsupported question type</div>
        </div>
      `;
    }
  }).join('');

  // setup the scale inputs AFTER rendering
  questions.forEach((question, index) => {
    if (question.type === 'scale') {
      const scaleInput = document.querySelector(`input[name="question-${index}"]`);
      const valueDisplay = document.getElementById(`scale-value-${index}`);
      if (scaleInput && valueDisplay) {
        valueDisplay.textContent = scaleInput.value;
        scaleInput.addEventListener('input', (e) => {
          valueDisplay.textContent = e.target.value;
        });
      }
    }
  });
}

function nextQuestion() {
  const currentAnswer = getCurrentAnswer();
  if (!currentAnswer && currentAnswer !== 0 && currentAnswer !== '0') {
    app.showNotification?.('Please select an answer', 'warning');
    return;
  }

  quizAnswers[currentQuizQuestion] = currentAnswer;

  if (currentQuizQuestion < (app.data.quiz_question.length - 1)) {
    document.getElementById(`question-${currentQuizQuestion}`).classList.remove('active');
    currentQuizQuestion++;
    document.getElementById(`question-${currentQuizQuestion}`).classList.add('active');

    updateQuizProgress();
    updateQuizButtons();

  }
}

function previousQuestion() {
  if (currentQuizQuestion > 0) {
    document.getElementById(`question-${currentQuizQuestion}`).classList.remove('active');
    currentQuizQuestion--;
    document.getElementById(`question-${currentQuizQuestion}`).classList.add('active');

    updateQuizProgress();
    updateQuizButtons();
  }
}

function getCurrentAnswer() {
  const question = app.data.quiz_question[currentQuizQuestion];
  if (!question) return null;

  if (question.type === 'single_choice') {
    const selected = document.querySelector(`input[name="question-${currentQuizQuestion}"]:checked`);
    return selected ? selected.value : null;
  } else if (question.type === 'scale') {
    const scaleInput = document.querySelector(`input[name="question-${currentQuizQuestion}"]`);
    return scaleInput ? Number(scaleInput.value) : null; // FIXED: convert to number immediately
  }

  return null;
}

// updates the progress bar width & textual progress
function updateQuizProgress() {
  const total = app.data.quiz_question.length || 1;
  const progress = ((currentQuizQuestion + 1) / total) * 100;
  const fillEl = document.getElementById('progress-fill');
  const textEl = document.getElementById('progress-text');
  if (fillEl) fillEl.style.width = `${progress}%`;
  if (textEl) textEl.textContent = `Question ${currentQuizQuestion + 1} of ${total}`;
}

// disables the prevbtn on first question & hides nextbtn + shows submitbtn on last question
function updateQuizButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');

  if (prevBtn) prevBtn.disabled = currentQuizQuestion === 0;

  if (nextBtn && submitBtn) {
    if (currentQuizQuestion === app.data.quiz_question.length - 1) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'inline-flex';
    } else {
      nextBtn.style.display = 'inline-flex';
      submitBtn.style.display = 'none';
    }
  }
}

// make sure all quiz questions are answered
function submitQuiz() {
  const currentAnswer = getCurrentAnswer();
  if (!currentAnswer && currentAnswer !== 0 && currentAnswer !== '0') {
    app.showNotification?.('Please select an answer', 'warning');
    return;
  }

  quizAnswers[currentQuizQuestion] = currentAnswer;

  if (typeof app.calculateQuizResults !== 'function') {
    console.error('app.calculateQuizResults is missing');
    app.showNotification?.('Quiz engine unavailable', 'error');
    return;
  }

  const recommendations = app.calculateQuizResults(quizAnswers) || [];
  displayQuizResults(recommendations);

  // Show results tab
  const resultTabBtn = document.getElementById('result-tab');
  if (resultTabBtn) resultTabBtn.style.display = 'inline-block';
  showTab('results');
}

function displayQuizResults(recommendations) {
  const container = document.getElementById('quiz-results');
  if (!container) return;

  container.innerHTML = `
    <div class="quiz-results-header text-center">
      <h2>Your Perfect Scents</h2>
      <p>Based on your preferences, here are our recommendations:</p>
    </div>
  `;

  const productGrid = document.createElement('div');
  productGrid.className = 'recommendations grid grid-3';

  recommendations.forEach(scent => {
    const matchingProducts = app.products.filter(p => p.scentId === scent.id);
    matchingProducts.forEach(product => {
      const card = document.createElement('div');
      card.className = 'recommendation-card card';
      card.innerHTML = `
        <div class="recommendation-rank">#${scent.id}</div>
        <img src="${product.images[0]}" alt="${product.name}" class="card-image">
        <div class="card-content">
          <h3 class="card-title">${product.name}</h3>
          <p class="card-description">${product.shortDescription}</p>
          <div class="scent-match">
            <strong>Mood:</strong> ${scent.mood}
          </div>
          <div class="recommendation-actions">
            <a href="customize.html?scent=${scent.id}" class="btn btn-primary btn-small">
              Create Candle
            </a>
          </div>
        </div>
      `;
      productGrid.appendChild(card);
    });
  });

  container.appendChild(productGrid);
}

function retakeQuiz() {
  currentQuizQuestion = 0;
  quizAnswers = [];
  document.querySelectorAll('.quiz-question').forEach((el, index) => el.classList.toggle('active', index === 0));
  updateQuizProgress();
  updateQuizButtons();

  // reset scale inputs to midpoint
  document.querySelectorAll('input[type="range"]').forEach(input => {
    const min = Number(input.min) || 1;
    const max = Number(input.max) || 10;
    input.value = Math.round((min + max) / 2);
    const valueDisplay = document.getElementById(`scale-value-${input.name.split('-')[1]}`);
    if (valueDisplay) valueDisplay.textContent = input.value;
  });

  showTab('quiz');
}
