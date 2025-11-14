const app = {
  data: {},
  scents: [],

  getScents() { return this.scents; },
  getScentById(id) { return this.scents.find(s => s.id === id) || null; },
  formatPrice(price) { return `$${Number(price).toFixed(2)}`; },

  async loadData() {
    // Fetch scents or quiz data here if needed
    this.scents = [];
  },

  calculateQuizResults(answers) {
  const scents = this.getScents();
  const scores = scents.map(scent => ({ scent: scent, score: 0 }));

  answers.forEach((answer, questionIndex) => {
    scores.forEach(item => {
      const scent = item.scent;
      switch (questionIndex) {
        case 0: // Mood question
          if (scent.mood === answer) item.score += 3;
          break;
        case 1: // Scent family / category
          if (scent.category === answer) item.score += 3;
          break;
        case 2: // Strength question
          const strengthDiff = Math.abs(scent.aggressiveness - parseInt(answer));
          item.score += Math.max(3 - strengthDiff, 0);
          break;
        case 3: // Season question
          if (scent.season === answer || scent.season === 'all-year') {
            item.score += scent.season === answer ? 2 : 1;
          }
          break;
      }
    });
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.scent);
},

  openModal(id) { document.getElementById(id).style.display = 'block'; },
  closeModal(id) { document.getElementById(id).style.display = 'none'; },
  showNotification(msg, type) { alert(msg); }
};
