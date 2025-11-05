let currentQuizQuestion = 0;
let quizAnswers = [];
let filteredScents = [];

//we check that the document is fully loaded before running js
document.addEventListener('DOMContentLoaded', async () => {

    //load all necessary data before you do anything
    // async = asynchronous, so we wait untill it's done before moving on

    await app.loadData();

    //display all scents in the library
    loadScentsLibrary();

    loadQuizQuestions();

    //initialize all filters
    setupFilters();

    // this checks if the page URL contains a hash like "#quiz"
    // if yes automatically switch to the quiz tab when page loads

    if (window.location.hash === '#quiz') {
        showTab('quiz');
    }
})

function showTab(tabName) {
    //hide all the tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    })

    //remove active class from all the tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    })
    //show selected tab (template literals are important here)
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');

    window.location.hash = tabName;
}

function loadScentsLibrary() {
    const scents = app.getScents(); //returns the full scents array
    filteredScents = [...scents];   //copy to filteredScents (using spread operator)
    //this operator creats a new array conatining all elements fromt eh scent array
    displayScents(filteredScents);  //display them
}

function displayScents(scents) {
    const container = document.getElementById('scents-grid');

    //.map() transforms each scent object into a string of html using template literals
    //.join() joins the array of html strings into one big string the quotations means no separator between the cards
    container.innerHTML = scents.map(scent => `
            <div class="scent-card card" onclick="showScentDetails(${scent.id})" >
              <div class="scent-image">
              //will be filled later
              <img src="" alt="${scent.name}" class="card-image">
              <div class="scent-category">${scent.category}</div>
          </div>

                <div class="card-content">
                    <h3 class="card-title">${scent.name}</h3>
                    <p class="card-description">${scent.description}</p>
                    <div class="scent-details">
                        <div class="scent-mood">Mood: ${scent.mood}</div>
                        <div class="scent-strength">
                            Strength: <span class="strength-bar">
                            //strength fill bar
                            ${'●'.repeat(scent.aggressiveness)}${'○'.repeat(10 - scent.aggressiveness)}
                        </span>
                        </div>
                        <div class="scent-price">${app.formatPrice(scent.price)}</div> //returns a safe string for the price
                    </div>
                    <div class="scent-notes">
                    ${scent.notes.map(note => `<span class="note-tag">${note}</span>`).join('')}
                </div>
            </div>
        </div>
            `).join('');
    //maps an array of notes into spans. the join concatenates them without whitspaces.
}

//when the user changes a filter the applyFilters() runs
function setupFilters() {
    const filters = ['category-filter', 'mood-filter', 'season-filter', 'strength-filter'];

    filters.forEach(filterId => {
        document.getElementById(filterId).addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    //get all elements + use const since they're not reassigned
    const category = document.getElementById('category-filter').value;
    const mood = document.getElementById('mood-filter').value;
    const season = document.getElementById('season-filter').value;
    const strength = document.getElementById('strength-filter').value;

    let filtered = app.getScents();
    //apply filters if the values do exist
    if (category) {
        filtered = filtered.filter(scent => scent.category === category);
    }

    if (mood) {
        filtered = filtered.filter(scent => scent.mood === mood);
    }

    if (season) {
        filtered = filtered.filter(scent => scent.season === season);
    }

    if (strength) {
        //if strength = "2-8" split() converts it into an array of 2 strings ["3","7"]
        //take these 2 numbers and .map() to convert into actual numbers [3,7]
        const [min, max] = strength.split('-').map(Number);
        filtered = filtered.filter(scent => scent.aggressiveness >= min && scent.aggressiveness <= max);
        //takes the scents whose aggressiveness value is between min & max
    }
    //update and re-render
    filteredScents = filtered;
    displayScents(filteredScents);
}

function clearFilters() {
    document.getElementById('category-filter').value = '';
    document.getElementById('mood-filter').value = '';
    document.getElementById('season-filter').value = '';
    document.getElementById('strength-filter').value = '';
    loadScentsLibrary();
}

function showScentDetails(scentId) {
    const scent = app.getScentById(scentId);
    if (!scent) return;

    document.getElementById('scent-modal-title').textContent = scent.name;
    document.getElementById('scent-modal-body').innerHTML = `
   <div class="scent-details-full">
          <img src="" alt="${scent.name}" class="scent-detail-image">
          <div class="scent-info">
            <p class="scent-description">${scent.description}</p>
            <div class="scent-properties">
                <div class="property">
                <strong>Category:</strong> ${scent.category}
              </div>
              <div class="property">
                <strong>Mood:</strong> ${scent.mood}
              </div>
              <div class="property">
                <strong>Season:</strong> ${scent.season}
              </div>
              <div class="property">
                <strong>Strength:</strong> ${scent.aggressiveness}/10
              </div>
              <div class="property">
                <strong>Price:</strong> ${app.formatPrice(scent.price)} //format price
              </div>
            </div>
            <div class="scent-notes-full">
              <strong>Fragrance Notes:</strong>
              <div class="notes-list">
              //converts an array of notes into html
                ${scent.notes.map(note => `<span class="note-tag">${note}</span>`).join('')}
              </div>
            </div>
            <div class="scent-actions">
              <a href="customize.html?scent=${scent.id}" class="btn btn-primary">Create Candle</a>
            </div>
          </div>
        </div>
   `;
    app.openModal('scent-modal');
}

function loadQuizQuestions() {
    const questions = app.data.quiz_question || []; //provides quiz question
    const container = document.getElementById('quiz-questions');


    //first question is active to show it first
    container.innerHTML = questions.map((question, index) => `
    <div class="quiz-question ${index === 0 ? 'active' : ''}" id="question-${index}">
          <h3>${question.question}</h3>
          <div class="quiz-options">
            ${question.type === 'single_choice' ?
            question.options.map((option, optionIndex) => `
                <label class="quiz-option">
                  <input type="radio" name="question-${index}" value="${option.value}">
                  <span class="option-text">${option.label}</span>
                </label>
              `).join('') :
            question.type === 'scale' ? ` //scale means rating 0-10 for example
                <div class="scale-container">
                  <label>${question.labels['1']}</label>
                  <input type="range" name="question-${index}" min="${question.min}" max="${question.max}" value="5" class="scale-input">
                  <label>${question.labels['10']}</label>
                </div>
                <div class="scale-value">Value: <span id="scale-value-${index}">5</span></div>
                ` : ''
        }
          </div>
        </div>
    `).join('');

    //setup the scale inputs
    questions.forEach((question, index) => {
        if (question.type === 'scale') {
            const scaleInput = document.querySelector(`input[name="question-${index}"]`);
            const valueDisplay = document.getElementById(`scale-value-${index}`);

            scaleInput.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value;
            });
        }
    });

}


function nextQuestion() {
    const currentAnswer = getCurrentAnswer(); //checks current question input & returns value or null
    if (!currentAnswer) {
        app.showNotification('Please select an answer', 'warning');
        return;
    }

    quizAnswer[currentQuizQuestion] = currentAnswer; //stores it in the array at current index

    //hides current question, increments the index, shows the next question and updates the UI
    if (currentQuizQuestion < app.data.quiz_question.length - 1) {
        document.getElementById(`question-${currentQuizQuestion}`).classList.remove('active');
        currentQuizQuestion++;
        document.getElementById(`question-${currentQuizQuestion}`).classList.add('active');

        updateQuizProgress();
        updateQuizButtons();
    }
}

//this does the opposite of nextQuestion 
function previousQuestion() {
    if (currentQuizQuestion > 0) {
        document.getElementById(`question-${currentQuizQuestion}`).classList.remove('active');
        currentQuizQuestion--;
        document.getElementById(`question-${currentQuizQuestion}`).classList.add('active');

        updateQuizProgress();
        updateQuizButtons();
    }
}

//single choice returns selected radio value or null
//scale returns input.value which is a (string)
function getCurrentAnswer(){
    const question = app.data.quiz_question[currentQuizQuestion];

    if(question.type === 'single_choice') {
        const selected = document.querySelector(`input[name="question-${currentQuizQuestion}"]:checked`);
        return selected ? selected.value : null;
    }else if(question.type === 'scale') {
        const scaleInput = document.querySelector(`input[name="question-${currentQuizQuestion}"]`);
    }

    return null;
}

//updates the progress bar width & textual progress
function updateQuizProgress() {
      const progress = ((currentQuizQuestion + 1) / app.data.quiz_question.length) * 100;
      document.getElementById('progress-fill').style.width = `${progress}%`;
      document.getElementById('progress-text').textContent = `Question ${currentQuizQuestion + 1} of ${app.data.quiz_question.length}`;
    }


    //disables the prevbtn on first question & hides nextbtn + shows submitbtn on last question
function updateQuizButtons(){
   const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      const submitBtn = document.getElementById('submit-btn');

      prevBtn.disabled = currentQuizQuestion === 0;

      if(currentQuizQuestion === app.data.quiz_question.length -1){
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
      } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
      }
}

//make sure all quiz questions are answered
//call app.... to transform the answers to recommended scents
// it renders recommendations via thr displayQuiz..() + opens results tab
function submitQuiz() {
      const currentAnswer = getCurrentAnswer();
      if (!currentAnswer) {
        app.showNotification('Please select an answer', 'warning');
        return;
      }
      
      quizAnswers[currentQuizQuestion] = currentAnswer;
      
      // Calculate results
      const recommendations = app.calculateQuizResults(quizAnswers);
      displayQuizResults(recommendations);
      
      // Show results tab
      document.getElementById('results-tab').style.display = 'inline-block';
      showTab('results');
    }

     function displayQuizResults(recommendations) {
      const container = document.getElementById('quiz-results');
      
      container.innerHTML = `
        <div class="quiz-results-header text-center">
          <h2>Your Perfect Scents</h2>
          <p>Based on your preferences, here are our top recommendations:</p>
        </div>
        
        <div class="recommendations grid grid-3">
          ${recommendations.map((scent, index) => `
            <div class="recommendation-card card">
              <div class="recommendation-rank">#${index + 1}</div>
              //img will be assigned later
              <img src="" alt="${scent.name}" class="card-image">
              <div class="card-content">
                <h3 class="card-title">${scent.name}</h3>
                <p class="card-description">${scent.description}</p>
                <div class="scent-match">
                  <strong>Perfect for:</strong> ${scent.mood} moods
                </div>
                <div class="recommendation-actions">
                  <button class="btn btn-outline btn-small" onclick="showScentDetails(${scent.id})">
                    View Details
                  </button>
                  <a href="customize.html?scent=${scent.id}" class="btn btn-primary btn-small">
                    Create Candle
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="quiz-actions text-center">
          <button class="btn btn-secondary" onclick="retakeQuiz()">Retake Quiz</button>
          <a href="customize.html" class="btn btn-primary">Start Customizing</a>
        </div>
      `;
    }

    function retakeQuiz() {
      currentQuizQuestion = 0;
      quizAnswers = [];
      
      // Reset quiz UI
      document.querySelectorAll('.quiz-question').forEach((q, index) => {
        q.classList.remove('active');
        if (index === 0) q.classList.add('active');
      });
      
      // Clear form inputs
      document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.checked = false;
      });
      
      //set all range input back to 5
      document.querySelectorAll('input[type="range"]').forEach(input => {
        input.value = 5;
      });
      
      updateQuizProgress();
      updateQuizButtons();
      showTab('quiz');
    }

    function openCartModal() {

      // implementation similar to home page
      app.openModal('cart-modal');
    }

