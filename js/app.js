const app = {
  data: {},

  // returns the scents array (placeholder for now)
  getScents: function() { 
    return this.scents || []; 
  },

  // returns a single scent by id (placeholder)
  getScentById: function(id) { 
    return (this.scents || []).find(s => s.id === id) || null; 
  },

  // formats the price
  formatPrice: function(price) { 
    return `$${price.toFixed(2)}`; 
  },

  // async initialization (placeholder)
  loadData: async function() { 
    // just create an empty array for now so code doesn’t crash
    this.scents = []; 
  },

  // placeholder for quiz result calculation
  calculateQuizResults: function(answers) { 
    // return empty array for now
    return []; 
  },

  // modal controls
  openModal: function(modalId) { 
    document.getElementById(modalId).style.display = 'block'; 
  },
  closeModal: function(modalId) { 
    document.getElementById(modalId).style.display = 'none'; 
  },

  // simple notification placeholder
  showNotification: function(message, type) { 
    alert(message); 
  }
};
