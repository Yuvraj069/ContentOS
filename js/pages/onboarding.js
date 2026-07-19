/**
 * CreatorPilot - Onboarding & Profile Page Controller
 * Route: #/onboarding
 */
window.CP = window.CP || {};
CP.pages = CP.pages || {};
(function (CP) {
  'use strict';

  var activeListeners = [];

  function addListener(el, event, handler) {
    if (el) {
      el.addEventListener(event, handler);
      activeListeners.push({ el: el, event: event, handler: handler });
    }
  }

  CP.pages.onboarding = {
    /**
     * Render Onboarding profile form.
     * @param {HTMLElement} container
     */
    render: function (container) {
      this.destroy(); // Clear old state/listeners first

      var profile = CP.storage.get('creatorpilot:profile', {});

      var wrapper = CP.dom.createElement('div', { className: 'onboarding-container animate-fade-up' });

      var card = CP.dom.createElement('div', { className: 'onboarding-card' });

      var header = CP.dom.createElement('div', { className: 'onboarding-header' }, [
        CP.dom.createElement('div', { className: 'hero-pill', textContent: '✦ CREATOR PROFILE SETUP' }),
        CP.dom.createElement('h1', { className: 'onboarding-title', textContent: profile.displayName ? 'Edit Creator Profile' : 'Welcome to CreatorPilot' }),
        CP.dom.createElement('p', { className: 'onboarding-subtitle', textContent: 'Configure your creator niche & preferences to personalize analytics and content hook generation.' })
      ]);

      var form = CP.dom.createElement('form', { id: 'onboardingForm', novalidate: true });

      // Field 1: Display Name
      var nameGroup = CP.dom.createElement('div', { className: 'form-group' }, [
        CP.dom.createElement('label', { className: 'form-label', for: 'displayNameInput', textContent: 'Display Name *' }),
        CP.dom.createElement('input', {
          type: 'text',
          id: 'displayNameInput',
          className: 'form-input',
          placeholder: 'e.g. Alex Rivers',
          value: profile.displayName || ''
        }),
        CP.dom.createElement('div', { id: 'displayNameError', className: 'form-error', style: 'display:none;' })
      ]);

      // Field 2: Niche Select
      var nicheOptions = ['Lifestyle', 'Fitness', 'Food', 'Tech', 'Fashion', 'Beauty', 'Travel', 'Education', 'Comedy', 'Other'];
      var nicheGroup = CP.dom.createElement('div', { className: 'form-group' }, [
        CP.dom.createElement('label', { className: 'form-label', for: 'nicheSelect', textContent: 'Creator Niche *' }),
        CP.dom.createElement('select', { id: 'nicheSelect', className: 'form-select' },
          nicheOptions.map(function (n) {
            return CP.dom.createElement('option', { value: n, textContent: n, selected: (profile.niche === n) });
          })
        )
      ]);

      // Field 3: Primary Format Segmented Control
      var formatOptions = ['Reels', 'Carousels', 'Static Posts', 'Mixed'];
      var selectedFormat = profile.primaryFormat || 'Reels';

      var formatControls = formatOptions.map(function (fmt) {
        var optId = 'fmt_' + fmt.replace(/\s+/g, '');
        return CP.dom.createElement('div', { className: 'segmented-option' }, [
          CP.dom.createElement('input', {
            type: 'radio',
            name: 'primaryFormat',
            id: optId,
            value: fmt,
            checked: selectedFormat === fmt
          }),
          CP.dom.createElement('label', { className: 'segmented-label', for: optId, textContent: fmt })
        ]);
      });

      var formatGroup = CP.dom.createElement('div', { className: 'form-group' }, [
        CP.dom.createElement('label', { className: 'form-label', textContent: 'Primary Content Format *' }),
        CP.dom.createElement('div', { className: 'segmented-control' }, formatControls)
      ]);

      // Field 4: Follower Band
      var bandOptions = ['<1K', '1K-10K', '10K-50K', '50K-200K', '200K+'];
      var bandGroup = CP.dom.createElement('div', { className: 'form-group' }, [
        CP.dom.createElement('label', { className: 'form-label', for: 'bandSelect', textContent: 'Follower Range *' }),
        CP.dom.createElement('select', { id: 'bandSelect', className: 'form-select' },
          bandOptions.map(function (b) {
            return CP.dom.createElement('option', { value: b, textContent: b, selected: (profile.followerBand === b) });
          })
        )
      ]);

      // Form Action Submit Button
      var actions = CP.dom.createElement('div', { className: 'form-actions' }, [
        CP.dom.createElement('button', {
          type: 'submit',
          id: 'onboardingSubmitBtn',
          className: 'btn btn-primary',
          disabled: !profile.displayName,
          textContent: profile.displayName ? 'Save Profile Changes' : 'Complete Profile & Launch Workspace'
        })
      ]);

      form.appendChild(nameGroup);
      form.appendChild(nicheGroup);
      form.appendChild(formatGroup);
      form.appendChild(bandGroup);
      form.appendChild(actions);

      card.appendChild(header);
      card.appendChild(form);
      wrapper.appendChild(card);
      container.appendChild(wrapper);

      // DOM Validation Wiring
      var nameInput = CP.dom.qs('#displayNameInput', container);
      var nameError = CP.dom.qs('#displayNameError', container);
      var submitBtn = CP.dom.qs('#onboardingSubmitBtn', container);

      function validateForm() {
        var val = nameInput.value;
        var req = CP.validators.required(val);
        var min = CP.validators.minLength(val, 2);
        var max = CP.validators.maxLength(val, 40);

        if (!req.valid) {
          showError(req.error);
          return false;
        }
        if (!min.valid) {
          showError(min.error);
          return false;
        }
        if (!max.valid) {
          showError(max.error);
          return false;
        }

        clearError();
        return true;
      }

      function showError(msg) {
        nameError.textContent = '⚠ ' + msg;
        nameError.style.display = 'flex';
        nameInput.classList.add('is-invalid');
        submitBtn.disabled = true;
      }

      function clearError() {
        nameError.textContent = '';
        nameError.style.display = 'none';
        nameInput.classList.remove('is-invalid');
        submitBtn.disabled = false;
      }

      // Input / Blur Listeners
      addListener(nameInput, 'input', function () {
        validateForm();
      });

      addListener(nameInput, 'blur', function () {
        validateForm();
      });

      // Submit Listener
      addListener(form, 'submit', function (e) {
        e.preventDefault();
        if (!validateForm()) return;

        var selectedFormatEl = form.querySelector('input[name="primaryFormat"]:checked');
        var newProfile = {
          id: profile.id || ('user_' + Date.now()),
          displayName: String(nameInput.value).trim(),
          niche: CP.dom.qs('#nicheSelect', form).value,
          primaryFormat: selectedFormatEl ? selectedFormatEl.value : 'Reels',
          followerBand: CP.dom.qs('#bandSelect', form).value,
          createdAt: profile.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        CP.storage.set('creatorpilot:profile', newProfile);
        CP.components.toast.show('Profile updated successfully!', 'success');
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
})(window.CP);
