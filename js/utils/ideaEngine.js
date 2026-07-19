/**
 * ContentOS - Content Idea Engine
 * Pure logic for combining strategy text with niche phrase banks into 3 hook variants.
 * Free of direct DOM or fetch dependencies.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  App.ideaEngine = {
    /**
     * Generate 3 distinct content hook variants.
     * @param {string} rawText Raw strategy text
     * @param {string} niche User's creator niche
     * @returns {Array} Array of 3 idea objects { type, hookText, formatSuggestion }
     */
    buildHookVariants: function (rawText, niche) {
      var cleanText = String(rawText || '').trim();
      if (cleanText.endsWith('.')) {
        cleanText = cleanText.slice(0, -1);
      }

      var phrases = App.phraseBanks.getPhrasesForNiche(niche || 'Lifestyle');
      var phrase1 = phrases[Math.floor(Math.random() * phrases.length)];
      var phrase2 = phrases[Math.floor(Math.random() * phrases.length)];
      var phrase3 = phrases[Math.floor(Math.random() * phrases.length)];

      return [
        {
          type: 'Direct Hook',
          badgeClass: 'badge-purple',
          hookText: 'Stop ignoring this ' + (niche || 'creator') + ' principle: "' + cleanText + '". Here is how it unlocks ' + phrase1 + '.',
          formatSuggestion: 'Reel / Short Video'
        },
        {
          type: 'Question Framework',
          badgeClass: 'badge-pink',
          hookText: 'Struggling with ' + phrase2 + '? Ask yourself why: "' + cleanText + '".',
          formatSuggestion: 'Carousel Slide Deck'
        },
        {
          type: 'Actionable Step-by-Step',
          badgeClass: 'badge-blue',
          hookText: '3 ways to master ' + phrase3 + ' today:\n1. ' + cleanText + '\n2. Audit past content analytics\n3. Double down on winning formats.',
          formatSuggestion: 'Static Post / Caption'
        }
      ];
    }
  };
})(window.ContentOS);
