let currentQuizQuestion = 0;
let quizAnswer = [];
let filteredScents = [];

//we check that the document is fully loaded before running js
document.addEventListener('DOMContentLoaded', async() => {

//load all necessary data before you do anything
// async = asynchronous, so we wait untill it's done before moving on

await app.loadData();

//display all scents in the library
loadScentsLibrary();

//initialize all filters
setupFilters();

// this checks if the page URL contains a hash like "#quiz"
// if yes automatically switch to the quiz tab when page loads

if(window.location.hash === '#quiz') {
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