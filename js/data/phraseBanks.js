/**
 * ContentOS - Niche Phrase Banks Data
 * Topic fragments per creator niche for hook generation.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  App.phraseBanks = {
    Lifestyle: [
      'morning routine resets',
      'work-life balance secrets',
      'minimalist living habits',
      'daily productivity hacks',
      'mindful evening rituals',
      'budget-friendly aesthetic upgrades',
      'decluttering your space',
      'healthy habit building'
    ],
    Fitness: [
      'fat loss mythbusting',
      'progressive overload routines',
      'post-workout recovery tips',
      'high-protein meal prep',
      'home workout essentials',
      'mindset for fitness consistency',
      'mobility exercises for desk workers',
      'tracking fitness progress correctly'
    ],
    Food: [
      '15-minute weeknight dinners',
      'restaurant-quality secret sauces',
      'budget meal planning hacks',
      'gourmet coffee at home',
      'meal prep strategies',
      'essential kitchen tools',
      'air fryer magic recipes',
      'baking precision techniques'
    ],
    Tech: [
      'essential developer workflows',
      'AI tools for solo creators',
      'desk setup ergonomics',
      'hidden iOS/Android features',
      'no-code automation hacks',
      'cybersecurity basics',
      'cloud storage optimization',
      'keyboard shortcuts speedup'
    ],
    Fashion: [
      'capsule wardrobe essentials',
      'styling one piece 5 ways',
      'thrifting and vintage gems',
      'color coordination rules',
      'dressing for your body type',
      'seasonal trend breakdowns',
      'footwear styling guide',
      'accessorizing simple outfits'
    ],
    Beauty: [
      'skincare barrier repair',
      '5-minute everyday makeup',
      'glass skin routine steps',
      'sunscreen myths debunked',
      'hair care porosity secrets',
      'clean beauty essentials',
      'dermatologist recommended hacks',
      'makeup blending techniques'
    ],
    Travel: [
      'carry-on packing efficiency',
      'budget travel flight hacks',
      'hidden gem destinations',
      'solo travel safety tips',
      'digital nomad hotspots',
      'capturing travel photos solo',
      'local street food guides',
      'travel itinerary planning'
    ],
    Education: [
      'speed study techniques',
      'active recall learning strategies',
      'book summaries in 60 seconds',
      'public speaking confidence',
      'financial literacy fundamentals',
      'memory palace techniques',
      'time blocking schedules',
      'critical thinking skills'
    ],
    Comedy: [
      'relatable creator struggles',
      'POV: working from home',
      'expectations vs reality moments',
      'overthinking everyday situations',
      'conversations with my brain',
      'awkward social encounters',
      'trying new viral trends',
      'the types of people you meet'
    ],
    Other: [
      'creative workflow blueprints',
      'overcoming creator burnout',
      'building a personal brand',
      'audience engagement strategies',
      'storytelling frameworks',
      'monetization pathways',
      'content batching methods',
      'finding your unique voice'
    ],

    /**
     * Get phrase bank array for a given niche.
     * @param {string} niche
     * @returns {string[]}
     */
    getPhrasesForNiche: function (niche) {
      return this[niche] || this.Other;
    }
  };
})(window.ContentOS);
