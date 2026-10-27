'use strict';

// Ported from js/ideaEngine.js — same phrases/fallback logic; external call now happens server-side.

var PHRASES = {
  Tech: ['developer workflows', 'keyboard shortcuts', 'productivity tools', 'setup ergonomics'],
  Fitness: ['morning workouts', 'fat loss myths', 'protein meal prep', 'recovery routines'],
  Food: ['15-minute dinners', 'homemade coffee', 'secret sauces', 'air fryer recipes'],
  Lifestyle: ['morning rituals', 'space decluttering', 'budget aesthetics', 'work-life balance'],
  Fashion: ['capsule wardrobe', 'styling 1 piece 3 ways', 'color rules', 'thrifting finds'],
  Education: ['speed study tips', 'active recall', 'time blocking', 'reading habits']
};

var ideaEngine = {
  generateIdea: async function (niche) {
    var phraseList = PHRASES[niche] || PHRASES.Lifestyle;
    var randomPhrase = phraseList[Math.floor(Math.random() * phraseList.length)];

    try {
      var res = await fetch('https://api.adviceslip.com/advice');
      if (!res.ok) throw new Error('Network error');
      var data = await res.json();
      var quote = data && data.slip && data.slip.advice ? data.slip.advice : 'Keep creating consistently.';

      if (quote.endsWith('.')) quote = quote.slice(0, -1);

      return {
        success: true,
        hook: 'How to master ' + randomPhrase + ': "' + quote + '"'
      };
    } catch (err) {
      // Local fallback — same fallback message as original
      return {
        success: false,
        error: 'Could not load advice quote right now. Please try again.'
      };
    }
  }
};

module.exports = ideaEngine;
