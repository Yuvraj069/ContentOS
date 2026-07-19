/**
 * ContentOS - Landing Page Script
 * Scroll entrance animations for marketing landing page.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var animatableElements = document.querySelectorAll('.feature-card, .step-card, .mock-workspace-container');

    function checkScroll() {
      var triggerBottom = window.innerHeight * 0.88;

      animatableElements.forEach(function (el) {
        var top = el.getBoundingClientRect().top;
        if (top < triggerBottom) {
          el.classList.add('animate-fade-up');
          el.style.opacity = '1';
        }
      });
    }

    checkScroll();
    window.addEventListener('scroll', checkScroll);
  });
})(window.ContentOS);
