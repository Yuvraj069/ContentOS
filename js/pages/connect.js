/**
 * ContentOS - Connect / Profile Setup Controller
 * Route: #/connect
 * Focused centered card view (not wrapped in sidebar shell).
 */
window.ContentOS = window.ContentOS || {};
window.ContentOS.pages = window.ContentOS.pages || {};
(function (App) {
  'use strict';

  var activeListeners = [];

  function addListener(el, event, handler) {
    if (el) {
      el.addEventListener(event, handler);
      activeListeners.push({ el: el, event: event, handler: handler });
    }
  }

  App.pages.connect = {
    /**
     * Render Connect profile setup view.
     * @param {HTMLElement} container
     */
    render: function (container) {
      this.destroy();

      var profile = App.storage.get('contentos:profile', {});

      var wrapper = App.dom.createElement('div', { className: 'connect-wrapper animate-fade-up' });
      var card = App.dom.createElement('div', { className: 'connect-card' });

      // Header Copy
      var header = App.dom.createElement('div', { className: 'connect-header' }, [
        App.dom.createElement('div', { className: 'connect-brand-badge', textContent: '✦ WORKSPACE SETUP' }),
        App.dom.createElement('h1', { className: 'connect-title', textContent: 'Set up ContentOS' }),
        App.dom.createElement('p', { className: 'connect-subtitle', textContent: 'Add your handle so your workspace is personalized to you. You can change this anytime.' })
      ]);

      var form = App.dom.createElement('form', { id: 'connectForm', novalidate: true });

      // 1. Platform Toggle Pills
      var selectedPlatform = profile.platform || 'Instagram';

      var platformGroup = App.dom.createElement('div', { className: 'form-group' }, [
        App.dom.createElement('label', { className: 'form-label', textContent: 'Primary Platform *' }),
        App.dom.createElement('div', { className: 'platform-toggle-group' }, [
          App.dom.createElement('button', {
            type: 'button',
            id: 'btnPlatformIg',
            className: 'platform-pill-btn' + (selectedPlatform === 'Instagram' ? ' active' : ''),
            innerHTML: '<span>📸</span> Instagram'
          }),
          App.dom.createElement('button', {
            type: 'button',
            id: 'btnPlatformYt',
            className: 'platform-pill-btn' + (selectedPlatform === 'YouTube' ? ' active' : ''),
            innerHTML: '<span>▶️</span> YouTube'
          })
        ])
      ]);

      // 2. Handle Input with Fixed "@" Prefix
      var handleGroup = App.dom.createElement('div', { className: 'form-group' }, [
        App.dom.createElement('label', { className: 'form-label', for: 'handleInput', textContent: 'Creator Handle *' }),
        App.dom.createElement('div', { className: 'handle-input-wrapper' }, [
          App.dom.createElement('span', { className: 'handle-prefix', textContent: '@' }),
          App.dom.createElement('input', {
            type: 'text',
            id: 'handleInput',
            className: 'form-input',
            placeholder: 'alexrivers',
            value: profile.handle || ''
          })
        ]),
        App.dom.createElement('div', { id: 'handleError', className: 'form-error', style: 'display:none;' })
      ]);

      // 3. Niche Select
      var nicheOptions = ['Lifestyle', 'Fitness', 'Food', 'Tech', 'Fashion', 'Beauty', 'Travel', 'Education', 'Comedy', 'Other'];
      var nicheGroup = App.dom.createElement('div', { className: 'form-group' }, [
        App.dom.createElement('label', { className: 'form-label', for: 'nicheSelect', textContent: 'Creator Niche *' }),
        App.dom.createElement('select', { id: 'nicheSelect', className: 'form-select' },
          nicheOptions.map(function (n) {
            return App.dom.createElement('option', { value: n, textContent: n, selected: (profile.niche === n) });
          })
        )
      ]);

      // 4. Primary Format Select
      var formatOptions = ['Reel', 'Carousel', 'Static', 'Story'];
      var formatGroup = App.dom.createElement('div', { className: 'form-group' }, [
        App.dom.createElement('label', { className: 'form-label', for: 'formatSelect', textContent: 'Primary Format *' }),
        App.dom.createElement('select', { id: 'formatSelect', className: 'form-select' },
          formatOptions.map(function (f) {
            return App.dom.createElement('option', { value: f, textContent: f, selected: (profile.primaryFormat === f) });
          })
        )
      ]);

      // 5. Follower Band Select
      var bandOptions = ['Under 1K', '1K–10K', '10K–50K', '50K–200K', '200K+'];
      var bandGroup = App.dom.createElement('div', { className: 'form-group' }, [
        App.dom.createElement('label', { className: 'form-label', for: 'bandSelect', textContent: 'Audience Size / Follower Band *' }),
        App.dom.createElement('select', { id: 'bandSelect', className: 'form-select' },
          bandOptions.map(function (b) {
            return App.dom.createElement('option', { value: b, textContent: b, selected: (profile.followerBand === b) });
          })
        )
      ]);

      // 6. Form Actions & Privacy Note
      var submitBtn = App.dom.createElement('button', {
        type: 'submit',
        id: 'connectSubmitBtn',
        className: 'btn btn-primary',
        style: 'width:100%; padding:12px; margin-top:8px;',
        disabled: !profile.handle,
        textContent: profile.handle ? 'Save Changes & Return' : 'Continue →'
      });

      var privacyNote = App.dom.createElement('p', {
        className: 'connect-privacy-note',
        textContent: 'Your workspace, your data — nothing is shared or posted on your behalf.'
      });

      form.appendChild(platformGroup);
      form.appendChild(handleGroup);
      form.appendChild(nicheGroup);
      form.appendChild(formatGroup);
      form.appendChild(bandGroup);
      form.appendChild(submitBtn);

      card.appendChild(header);
      card.appendChild(form);
      card.appendChild(privacyNote);
      wrapper.appendChild(card);
      container.appendChild(wrapper);

      // DOM Wiring
      var igBtn = App.dom.qs('#btnPlatformIg', container);
      var ytBtn = App.dom.qs('#btnPlatformYt', container);
      var handleInput = App.dom.qs('#handleInput', container);
      var handleError = App.dom.qs('#handleError', container);

      var activePlatformChoice = selectedPlatform;

      addListener(igBtn, 'click', function () {
        activePlatformChoice = 'Instagram';
        igBtn.classList.add('active');
        ytBtn.classList.remove('active');
      });

      addListener(ytBtn, 'click', function () {
        activePlatformChoice = 'YouTube';
        ytBtn.classList.add('active');
        igBtn.classList.remove('active');
      });

      function validateForm() {
        var res = App.validators.handle(handleInput.value);
        if (!res.valid) {
          handleError.textContent = '⚠ ' + res.error;
          handleError.style.display = 'flex';
          handleInput.classList.add('is-invalid');
          submitBtn.disabled = true;
          return false;
        }
        handleError.textContent = '';
        handleError.style.display = 'none';
        handleInput.classList.remove('is-invalid');
        submitBtn.disabled = false;
        return true;
      }

      addListener(handleInput, 'input', validateForm);
      addListener(handleInput, 'blur', validateForm);

      addListener(form, 'submit', function (e) {
        e.preventDefault();
        if (!validateForm()) return;

        var cleanHandleRes = App.validators.handle(handleInput.value);

        var newProfile = {
          id: profile.id || ('user_' + Date.now()),
          platform: activePlatformChoice,
          handle: cleanHandleRes.cleanHandle,
          niche: App.dom.qs('#nicheSelect', form).value,
          primaryFormat: App.dom.qs('#formatSelect', form).value,
          followerBand: App.dom.qs('#bandSelect', form).value,
          createdAt: profile.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        App.storage.set('contentos:profile', newProfile);
        App.components.toast.show('Workspace profile updated!', 'success');
        window.location.hash = '#/dashboard';
      });
    },

    /**
     * Clean up listeners.
     */
    destroy: function () {
      activeListeners.forEach(function (item) {
        if (item.el) item.el.removeEventListener(item.event, item.handler);
      });
      activeListeners = [];
    }
  };
})(window.ContentOS);
