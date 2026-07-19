/**
 * ContentOS - Content Idea Generator Controller
 * Route: #/ideas
 * Strictly adheres to Product Copy Rule (zero technical terms in rendered UI text).
 */
window.ContentOS = window.ContentOS || {};
window.ContentOS.pages = window.ContentOS.pages || {};
(function (App) {
  'use strict';

  var activeListeners = [];
  var isFetching = false;
  var currentAbortController = null;
  var SESSION_KEY = 'contentos:ideas_history';

  function addListener(el, event, handler) {
    if (el) {
      el.addEventListener(event, handler);
      activeListeners.push({ el: el, event: event, handler: handler });
    }
  }

  App.pages.ideas = {
    /**
     * Render Ideas view.
     * @param {HTMLElement} container
     */
    render: function (container) {
      this.destroy();
      var self = this;

      var profile = App.storage.get('contentos:profile', null);
      var niche = profile ? profile.niche : 'Lifestyle';

      var wrapper = App.dom.createElement('div', { className: 'ideas-layout animate-fade-up' });

      // Header Toolbar (Clean User-Facing Copy)
      var header = App.dom.createElement('div', { className: 'ideas-header' }, [
        App.dom.createElement('div', {}, [
          App.dom.createElement('h1', { className: 'page-title', textContent: 'Content Idea & Hook Generator' }),
          App.dom.createElement('p', { className: 'page-subtitle', textContent: 'Generate fresh content hooks and angles tailored for your niche (' + niche + ').' })
        ]),
        App.dom.createElement('button', {
          id: 'generateIdeasBtn',
          className: 'btn btn-primary',
          textContent: '✨ Generate Ideas'
        })
      ]);

      var errorSlot = App.dom.createElement('div', { id: 'ideasErrorSlot', style: 'margin-bottom:24px;' });
      var grid = App.dom.createElement('div', { className: 'ideas-grid', id: 'ideasGrid' });

      wrapper.appendChild(header);
      wrapper.appendChild(errorSlot);
      wrapper.appendChild(grid);
      container.appendChild(wrapper);

      var generateBtn = App.dom.qs('#generateIdeasBtn', container);

      addListener(generateBtn, 'click', function () {
        self.fetchAndGenerate(grid, errorSlot, generateBtn, niche);
      });

      // Check session history
      var history = App.storage.get(SESSION_KEY, [], true);
      if (history.length > 0) {
        this.renderIdeaCards(grid, history[0]);
      } else {
        this.fetchAndGenerate(grid, errorSlot, generateBtn, niche);
      }
    },

    /**
     * Fetch strategy advice and generate hook variants.
     */
    fetchAndGenerate: function (grid, errorSlot, btn, niche) {
      if (isFetching) return;
      var self = this;

      isFetching = true;
      btn.disabled = true;
      btn.textContent = '⏳ Loading new ideas...';
      App.dom.clearContainer(errorSlot);

      this.renderSkeletons(grid);

      if (window.AbortController) {
        currentAbortController = new AbortController();
      }
      var timeoutId = setTimeout(function () {
        if (currentAbortController) currentAbortController.abort();
      }, 8000);

      var fetchOptions = currentAbortController ? { signal: currentAbortController.signal } : {};

      fetch('https://api.adviceslip.com/advice', fetchOptions)
        .then(function (response) {
          clearTimeout(timeoutId);
          if (!response.ok) {
            throw new Error('Response error');
          }
          return response.json();
        })
        .then(function (data) {
          isFetching = false;
          btn.disabled = false;
          btn.textContent = '✨ Generate Ideas';

          if (!data || !data.slip || !data.slip.advice) {
            throw new Error('Empty advice payload');
          }

          var rawText = data.slip.advice;
          var variants = App.ideaEngine.buildHookVariants(rawText, niche);

          var history = App.storage.get(SESSION_KEY, [], true);
          history.unshift(variants);
          if (history.length > 10) history = history.slice(0, 10);
          App.storage.set(SESSION_KEY, history, true);

          self.renderIdeaCards(grid, variants);
        })
        .catch(function () {
          clearTimeout(timeoutId);
          isFetching = false;
          btn.disabled = false;
          btn.textContent = '✨ Try again';

          App.dom.clearContainer(grid);

          // Strictly user-facing copy per Product Copy Rule
          var errBanner = App.components.errorBanner.render('Couldn\'t load new ideas — try again', function () {
            self.fetchAndGenerate(grid, errorSlot, btn, niche);
          });
          errorSlot.appendChild(errBanner);
        });
    },

    /**
     * Render 3 Skeleton cards.
     */
    renderSkeletons: function (grid) {
      App.dom.clearContainer(grid);
      for (var i = 0; i < 3; i++) {
        var skel = App.dom.createElement('div', { className: 'skeleton-card' }, [
          App.dom.createElement('div', { className: 'skeleton-line animate-pulse', style: 'width:80px; height:20px;' }),
          App.dom.createElement('div', { className: 'skeleton-line animate-pulse', style: 'width:100%; height:16px;' }),
          App.dom.createElement('div', { className: 'skeleton-line animate-pulse', style: 'width:90%; height:16px;' }),
          App.dom.createElement('div', { className: 'skeleton-line animate-pulse', style: 'width:40%; height:16px; margin-top:auto;' })
        ]);
        grid.appendChild(skel);
      }
    },

    /**
     * Render Idea Cards.
     */
    renderIdeaCards: function (grid, variants) {
      App.dom.clearContainer(grid);

      variants.forEach(function (idea) {
        var card = App.dom.createElement('div', { className: 'idea-card animate-fade-up' });

        var topLine = App.dom.createElement('div', { className: 'idea-type-badge' }, [
          App.dom.createElement('span', { className: 'badge ' + (idea.badgeClass || 'badge-purple'), textContent: idea.type })
        ]);

        var hookText = App.dom.createElement('p', { className: 'idea-hook-text', textContent: idea.hookText });

        var copyBtn = App.dom.createElement('button', {
          className: 'btn btn-secondary',
          style: 'padding:4px 12px; font-size:var(--font-size-xs);',
          textContent: '📋 Copy'
        });

        addListener(copyBtn, 'click', function () {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(idea.hookText)
              .then(function () {
                copyBtn.textContent = '✓ Copied!';
                copyBtn.style.color = 'var(--success)';
                setTimeout(function () {
                  copyBtn.textContent = '📋 Copy';
                  copyBtn.style.color = '';
                }, 1500);
              })
              .catch(function () {
                App.components.toast.show('Failed to copy text', 'error');
              });
          } else {
            var textarea = document.createElement('textarea');
            textarea.value = idea.hookText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            copyBtn.textContent = '✓ Copied!';
            setTimeout(function () { copyBtn.textContent = '📋 Copy'; }, 1500);
          }
        });

        var metaRow = App.dom.createElement('div', { className: 'idea-meta-row' }, [
          App.dom.createElement('span', { className: 'idea-format-tag', textContent: '💡 Recommended: ' + idea.formatSuggestion }),
          copyBtn
        ]);

        card.appendChild(topLine);
        card.appendChild(hookText);
        card.appendChild(metaRow);

        grid.appendChild(card);
      });
    },

    /**
     * Clean up listeners & pending fetches.
     */
    destroy: function () {
      if (currentAbortController) {
        currentAbortController.abort();
        currentAbortController = null;
      }
      activeListeners.forEach(function (item) {
        if (item.el) item.el.removeEventListener(item.event, item.handler);
      });
      activeListeners = [];
      isFetching = false;
    }
  };
})(window.ContentOS);
