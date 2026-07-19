/**
 * ContentOS - Weekly Content Planner Page Controller
 * Route: #/planner
 */
window.ContentOS = window.ContentOS || {};
window.ContentOS.pages = window.ContentOS.pages || {};
(function (App) {
  'use strict';

  var activeListeners = [];
  var DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  function addListener(el, event, handler) {
    if (el) {
      el.addEventListener(event, handler);
      activeListeners.push({ el: el, event: event, handler: handler });
    }
  }

  function getTodayName() {
    var dayIdx = new Date().getDay();
    var map = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return map[dayIdx];
  }

  App.pages.planner = {
    /**
     * Render Weekly Planner view.
     * @param {HTMLElement} container
     */
    render: function (container) {
      this.destroy();
      var self = this;

      var todayName = getTodayName();

      var wrapper = App.dom.createElement('div', { className: 'planner-layout animate-fade-up' });

      // Page Header
      var pageHeader = App.dom.createElement('div', { className: 'page-header' }, [
        App.dom.createElement('div', {}, [
          App.dom.createElement('h1', { className: 'page-title', textContent: 'Weekly Content Planner' }),
          App.dom.createElement('p', { className: 'page-subtitle', textContent: 'Organize your posting schedule across the 7-day Monday–Sunday calendar grid.' })
        ])
      ]);

      // Form Drawer Slot
      var formSlot = App.dom.createElement('div', { id: 'plannerFormSlot', style: 'display:none; margin-bottom:24px;' });

      // 7-Column Grid
      var grid = App.dom.createElement('div', { className: 'planner-grid', id: 'plannerGrid' });

      wrapper.appendChild(pageHeader);
      wrapper.appendChild(formSlot);
      wrapper.appendChild(grid);
      container.appendChild(wrapper);

      this.renderGrid(grid, todayName);
    },

    /**
     * Render 7-day columns.
     */
    renderGrid: function (grid, todayName) {
      App.dom.clearContainer(grid);
      var self = this;

      var allItems = App.plannerStore.getAll();

      DAYS_OF_WEEK.forEach(function (dayName) {
        var isToday = dayName === todayName;

        var col = App.dom.createElement('div', {
          className: 'day-column' + (isToday ? ' is-today' : '')
        });

        var header = App.dom.createElement('div', { className: 'day-header' }, [
          App.dom.createElement('span', { className: 'day-name', textContent: dayName + (isToday ? ' (Today)' : '') })
        ]);

        var body = App.dom.createElement('div', { className: 'day-body' });

        var dayItems = allItems.filter(function (item) { return item.day === dayName; });

        if (dayItems.length === 0) {
          body.appendChild(App.dom.createElement('div', { className: 'planner-empty-day', textContent: 'Nothing planned' }));
        } else {
          dayItems.forEach(function (item) {
            body.appendChild(self.createPlannerCard(item));
          });
        }

        var addBtn = App.dom.createElement('button', {
          className: 'add-plan-btn',
          textContent: '＋ Add'
        });

        addListener(addBtn, 'click', function () {
          var formSlot = App.dom.qs('#plannerFormSlot');
          if (formSlot) self.openAddForm(formSlot, dayName);
        });

        col.appendChild(header);
        col.appendChild(body);
        col.appendChild(addBtn);

        grid.appendChild(col);
      });
    },

    /**
     * Create planned item card DOM element.
     */
    createPlannerCard: function (item) {
      var self = this;
      var card = App.dom.createElement('div', { className: 'planned-card animate-fade-up', id: 'plan_' + item.id });

      var badgeClass = 'badge-purple';
      if (item.format === 'Carousel') badgeClass = 'badge-pink';
      if (item.format === 'Static') badgeClass = 'badge-blue';
      if (item.format === 'Story') badgeClass = 'badge-green';

      var topicEl = App.dom.createElement('div', { className: 'planned-topic', textContent: item.topic });

      var metaRow = App.dom.createElement('div', { className: 'planned-meta' }, [
        App.dom.createElement('span', { className: 'badge ' + badgeClass, style: 'font-size:9px; padding:2px 6px;', textContent: item.format }),
        App.dom.createElement('span', { className: 'planned-part', textContent: item.dayPart })
      ]);

      // Move dropdown & delete
      var actionsRow = App.dom.createElement('div', { style: 'display:flex; justify-content:space-between; align-items:center; margin-top:6px; pt:4px; border-top:1px solid var(--hairline);' });

      var moveSelect = App.dom.createElement('select', {
        className: 'form-select',
        style: 'font-size:10px; padding:2px 4px; width:auto;'
      });

      DAYS_OF_WEEK.forEach(function (d) {
        moveSelect.appendChild(App.dom.createElement('option', {
          value: d,
          textContent: 'Move to ' + d.substring(0, 3),
          selected: d === item.day
        }));
      });

      addListener(moveSelect, 'change', function () {
        App.plannerStore.update(item.id, { day: moveSelect.value });
        App.components.toast.show('Moved to ' + moveSelect.value, 'info');
        var grid = App.dom.qs('#plannerGrid');
        if (grid) self.renderGrid(grid, getTodayName());
      });

      var delBtn = App.dom.createElement('button', {
        style: 'color:var(--danger); font-size:12px; cursor:pointer; padding:2px;',
        textContent: '✕'
      });

      addListener(delBtn, 'click', function () {
        card.classList.add('animate-collapse-out');
        setTimeout(function () {
          App.plannerStore.remove(item.id);
          App.components.toast.show('Planned item removed', 'info');
          var grid = App.dom.qs('#plannerGrid');
          if (grid) self.renderGrid(grid, getTodayName());
        }, 250);
      });

      actionsRow.appendChild(moveSelect);
      actionsRow.appendChild(delBtn);

      card.appendChild(topicEl);
      card.appendChild(metaRow);
      card.appendChild(actionsRow);

      return card;
    },

    /**
     * Open form card to add plan.
     */
    openAddForm: function (formSlot, targetDay) {
      var self = this;

      var card = App.dom.createElement('div', { className: 'card animate-fade-up', style: 'padding:20px;' });

      card.innerHTML =
        '<h3 style="margin-bottom:16px;">Add Planned Content for ' + targetDay + '</h3>' +
        '<form id="plannerForm" novalidate>' +
          '<div class="form-group">' +
            '<label class="form-label" for="planTopicInput">Content Topic / Concept * (≤100 chars)</label>' +
            '<input type="text" id="planTopicInput" class="form-input" placeholder="e.g. 3 Productivity Hacks Reel" />' +
            '<div id="planTopicError" class="form-error" style="display:none;"></div>' +
          '</div>' +
          '<div class="post-form-grid">' +
            '<div class="form-group">' +
              '<label class="form-label" for="planFormatSelect">Format *</label>' +
              '<select id="planFormatSelect" class="form-select">' +
                '<option value="Reel">Reel</option>' +
                '<option value="Carousel">Carousel</option>' +
                '<option value="Static">Static</option>' +
                '<option value="Story">Story</option>' +
              '</select>' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label" for="planDayPartSelect">Time of Day *</label>' +
              '<select id="planDayPartSelect" class="form-select">' +
                '<option value="Anytime">Anytime</option>' +
                '<option value="Morning">Morning</option>' +
                '<option value="Afternoon">Afternoon</option>' +
                '<option value="Evening">Evening</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; justify-content:flex-end; gap:12px; margin-top:16px;">' +
            '<button type="button" id="cancelPlanFormBtn" class="btn btn-secondary">Cancel</button>' +
            '<button type="submit" class="btn btn-primary">Add to Schedule</button>' +
          '</div>' +
        '</form>';

      App.dom.clearContainer(formSlot);
      formSlot.appendChild(card);
      formSlot.style.display = 'block';

      var form = App.dom.qs('#plannerForm', card);
      var cancelBtn = App.dom.qs('#cancelPlanFormBtn', card);
      var topicInput = App.dom.qs('#planTopicInput', card);

      addListener(cancelBtn, 'click', function () {
        formSlot.style.display = 'none';
        App.dom.clearContainer(formSlot);
      });

      addListener(form, 'submit', function (e) {
        e.preventDefault();

        var req = App.validators.required(topicInput.value);
        var max = App.validators.maxLength(topicInput.value, 100);

        if (!req.valid || !max.valid) {
          var errEl = App.dom.qs('#planTopicError', form);
          errEl.textContent = '⚠ ' + (req.error || max.error);
          errEl.style.display = 'flex';
          return;
        }

        App.plannerStore.add({
          day: targetDay,
          topic: topicInput.value,
          format: App.dom.qs('#planFormatSelect', form).value,
          dayPart: App.dom.qs('#planDayPartSelect', form).value
        });

        App.components.toast.show('Item added to ' + targetDay, 'success');
        formSlot.style.display = 'none';
        App.dom.clearContainer(formSlot);

        var grid = App.dom.qs('#plannerGrid');
        if (grid) self.renderGrid(grid, getTodayName());
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
