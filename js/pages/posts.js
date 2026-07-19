/**
 * ContentOS - Post Log Page Controller
 * Route: #/posts
 */
window.ContentOS = window.ContentOS || {};
window.ContentOS.pages = window.ContentOS.pages || {};
(function (App) {
  'use strict';

  var activeListeners = [];
  var currentSort = 'newest';
  var isFormOpen = false;
  var editingPostId = null;

  function addListener(el, event, handler) {
    if (el) {
      el.addEventListener(event, handler);
      activeListeners.push({ el: el, event: event, handler: handler });
    }
  }

  App.pages.posts = {
    /**
     * Render Post Log view.
     * @param {HTMLElement} container
     */
    render: function (container) {
      this.destroy();
      var self = this;

      var wrapper = App.dom.createElement('div', { className: 'posts-layout animate-fade-up' });

      // Page Header
      var pageHeader = App.dom.createElement('div', { className: 'page-header' }, [
        App.dom.createElement('div', {}, [
          App.dom.createElement('h1', { className: 'page-title', textContent: 'Post Log' }),
          App.dom.createElement('p', { className: 'page-subtitle', textContent: 'Log content performance metrics to track reach, engagement & format analytics.' })
        ]),
        App.dom.createElement('button', {
          id: 'toggleAddPostBtn',
          className: 'btn btn-primary',
          textContent: '＋ Log New Post'
        })
      ]);

      // Form Drawer Container
      var formContainer = App.dom.createElement('div', { id: 'postFormContainer', style: 'display:none;' });

      // Toolbar (Sort Dropdown)
      var toolbar = App.dom.createElement('div', { className: 'posts-toolbar' }, [
        App.dom.createElement('div', { className: 'posts-sort-wrapper' }, [
          App.dom.createElement('span', { className: 'posts-sort-label', textContent: 'Sort by:' }),
          App.dom.createElement('select', { id: 'postsSortSelect', className: 'form-select', style: 'width:auto; padding:4px 12px;' }, [
            App.dom.createElement('option', { value: 'newest', textContent: 'Newest First', selected: currentSort === 'newest' }),
            App.dom.createElement('option', { value: 'oldest', textContent: 'Oldest First', selected: currentSort === 'oldest' }),
            App.dom.createElement('option', { value: 'engagement', textContent: 'Highest Engagement', selected: currentSort === 'engagement' })
          ])
        ])
      ]);

      // Posts List Container
      var listContainer = App.dom.createElement('div', { className: 'posts-grid', id: 'postsList' });

      wrapper.appendChild(pageHeader);
      wrapper.appendChild(formContainer);
      wrapper.appendChild(toolbar);
      wrapper.appendChild(listContainer);
      container.appendChild(wrapper);

      var toggleBtn = App.dom.qs('#toggleAddPostBtn', container);
      var sortSelect = App.dom.qs('#postsSortSelect', container);

      addListener(toggleBtn, 'click', function () {
        if (isFormOpen) {
          self.closeForm(formContainer, toggleBtn);
        } else {
          self.openForm(formContainer, toggleBtn, null);
        }
      });

      addListener(sortSelect, 'change', function () {
        currentSort = sortSelect.value;
        self.renderPostsList(listContainer);
      });

      this.renderPostsList(listContainer);
    },

    /**
     * Render List of Posts.
     * @param {HTMLElement} listContainer
     */
    renderPostsList: function (listContainer) {
      App.dom.clearContainer(listContainer);
      var self = this;
      var posts = App.postsStore.getAll();

      if (posts.length === 0) {
        var emptyEl = App.components.emptyState.render(
          'No Posts Logged Yet',
          'Start tracking your content performance to compute your Content Score and view engagement trends.',
          '＋ Log Your First Post',
          function () {
            var toggleBtn = App.dom.qs('#toggleAddPostBtn');
            var formContainer = App.dom.qs('#postFormContainer');
            if (formContainer && toggleBtn) {
              self.openForm(formContainer, toggleBtn, null);
            }
          }
        );
        listContainer.appendChild(emptyEl);
        return;
      }

      var sortedPosts = posts.slice();
      if (currentSort === 'newest') {
        sortedPosts.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      } else if (currentSort === 'oldest') {
        sortedPosts.sort(function (a, b) { return new Date(a.date) - new Date(a.date); });
      } else if (currentSort === 'engagement') {
        sortedPosts.sort(function (a, b) {
          var rateA = App.analytics.calculatePostEngagement(a);
          var rateB = App.analytics.calculatePostEngagement(b);
          return rateB - rateA;
        });
      }

      sortedPosts.forEach(function (post) {
        var card = self.createPostCard(post, listContainer);
        listContainer.appendChild(card);
      });
    },

    /**
     * Create single post card element.
     */
    createPostCard: function (post, listContainer) {
      var self = this;
      var card = App.dom.createElement('div', { className: 'post-card animate-fade-up', id: 'card_' + post.id });

      var badgeClass = 'badge-purple';
      if (post.format === 'Carousel') badgeClass = 'badge-pink';
      if (post.format === 'Static') badgeClass = 'badge-blue';
      if (post.format === 'Story') badgeClass = 'badge-green';

      var engRate = (App.analytics.calculatePostEngagement(post) * 100).toFixed(1);

      var mainInfo = App.dom.createElement('div', { className: 'post-main-info' }, [
        App.dom.createElement('div', { className: 'post-header-line' }, [
          App.dom.createElement('span', { className: 'badge ' + badgeClass, textContent: post.format }),
          App.dom.createElement('h3', { className: 'post-title', textContent: post.title }),
          App.dom.createElement('span', { className: 'post-date mono-num', textContent: '🗓 ' + post.date }),
          post.topic ? App.dom.createElement('span', { className: 'post-topic-tag', textContent: '#' + post.topic }) : null
        ]),
        App.dom.createElement('div', { className: 'post-stats-row' }, [
          App.dom.createElement('span', { className: 'stat-chip stat-chip-engagement mono-num', textContent: '⚡ ' + engRate + '% Eng.' }),
          App.dom.createElement('span', { className: 'stat-chip mono-num', textContent: '❤️ ' + post.likes }),
          App.dom.createElement('span', { className: 'stat-chip mono-num', textContent: '💬 ' + post.comments }),
          App.dom.createElement('span', { className: 'stat-chip mono-num', textContent: '🔁 ' + post.shares }),
          App.dom.createElement('span', { className: 'stat-chip mono-num', textContent: '👀 ' + post.reach + ' reach' })
        ])
      ]);

      var editBtn = App.dom.createElement('button', {
        className: 'btn btn-secondary',
        style: 'padding:4px 10px; font-size:var(--font-size-xs);',
        textContent: '✏️ Edit'
      });

      var deleteBtn = App.dom.createElement('button', {
        className: 'btn btn-danger',
        style: 'padding:4px 10px; font-size:var(--font-size-xs);',
        textContent: '🗑 Delete'
      });

      var deleteTimeout = null;

      addListener(editBtn, 'click', function () {
        var formContainer = App.dom.qs('#postFormContainer');
        var toggleBtn = App.dom.qs('#toggleAddPostBtn');
        if (formContainer && toggleBtn) {
          self.openForm(formContainer, toggleBtn, post);
        }
      });

      // Two-step delete confirmation
      addListener(deleteBtn, 'click', function () {
        if (deleteBtn.textContent === 'Confirm Delete?') {
          if (deleteTimeout) clearTimeout(deleteTimeout);
          card.classList.add('animate-collapse-out');
          setTimeout(function () {
            App.postsStore.remove(post.id);
            App.components.toast.show('Post removed from log', 'info');
            self.renderPostsList(listContainer);
          }, 300);
        } else {
          deleteBtn.textContent = 'Confirm Delete?';
          deleteBtn.style.background = 'var(--danger)';
          deleteBtn.style.color = '#FFF';

          deleteTimeout = setTimeout(function () {
            deleteBtn.textContent = '🗑 Delete';
            deleteBtn.style.background = 'var(--danger-bg)';
            deleteBtn.style.color = 'var(--danger)';
          }, 3500);
        }
      });

      var actionsRow = App.dom.createElement('div', { className: 'post-card-actions' }, [editBtn, deleteBtn]);

      card.appendChild(mainInfo);
      card.appendChild(actionsRow);

      return card;
    },

    /**
     * Open form card for Add/Edit.
     */
    openForm: function (formContainer, toggleBtn, postToEdit) {
      var self = this;
      isFormOpen = true;
      editingPostId = postToEdit ? postToEdit.id : null;
      toggleBtn.textContent = '✕ Close Form';

      var todayStr = new Date().toISOString().split('T')[0];

      var formCard = App.dom.createElement('div', { className: 'post-form-card animate-fade-up' });

      var titleText = postToEdit ? 'Edit Logged Post' : 'Log New Content Post';

      formCard.innerHTML =
        '<h3 style="margin-bottom:16px;">' + titleText + '</h3>' +
        '<form id="postForm" novalidate>' +
          '<div class="form-group">' +
            '<label class="form-label" for="postTitleInput">Title / Caption Snippet * (≤120 chars)</label>' +
            '<input type="text" id="postTitleInput" class="form-input" placeholder="e.g. 5 Morning Habits for Creators" value="' + (postToEdit ? postToEdit.title : '') + '" />' +
            '<div id="postTitleError" class="form-error" style="display:none;"></div>' +
          '</div>' +
          '<div class="post-form-grid">' +
            '<div class="form-group">' +
              '<label class="form-label" for="postFormatSelect">Format *</label>' +
              '<select id="postFormatSelect" class="form-select">' +
                '<option value="Reel"' + (postToEdit && postToEdit.format === 'Reel' ? ' selected' : '') + '>Reel</option>' +
                '<option value="Carousel"' + (postToEdit && postToEdit.format === 'Carousel' ? ' selected' : '') + '>Carousel</option>' +
                '<option value="Static"' + (postToEdit && postToEdit.format === 'Static' ? ' selected' : '') + '>Static</option>' +
                '<option value="Story"' + (postToEdit && postToEdit.format === 'Story' ? ' selected' : '') + '>Story</option>' +
              '</select>' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label" for="postTopicInput">Topic / Keyword (optional)</label>' +
              '<input type="text" id="postTopicInput" class="form-input" placeholder="e.g. Productivity" value="' + (postToEdit ? postToEdit.topic : '') + '" />' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label" for="postDateInput">Date Posted *</label>' +
              '<input type="date" id="postDateInput" class="form-input mono-num" value="' + (postToEdit ? postToEdit.date : todayStr) + '" max="' + todayStr + '" />' +
              '<div id="postDateError" class="form-error" style="display:none;"></div>' +
            '</div>' +
          '</div>' +
          '<div class="post-form-grid" style="margin-top:12px;">' +
            '<div class="form-group">' +
              '<label class="form-label" for="postLikesInput">Likes *</label>' +
              '<input type="number" id="postLikesInput" class="form-input mono-num" min="0" value="' + (postToEdit ? postToEdit.likes : '0') + '" />' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label" for="postCommentsInput">Comments *</label>' +
              '<input type="number" id="postCommentsInput" class="form-input mono-num" min="0" value="' + (postToEdit ? postToEdit.comments : '0') + '" />' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label" for="postSharesInput">Shares *</label>' +
              '<input type="number" id="postSharesInput" class="form-input mono-num" min="0" value="' + (postToEdit ? postToEdit.shares : '0') + '" />' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label" for="postReachInput">Reach / Views *</label>' +
              '<input type="number" id="postReachInput" class="form-input mono-num" min="0" value="' + (postToEdit ? postToEdit.reach : '100') + '" />' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">' +
            '<button type="button" id="cancelPostFormBtn" class="btn btn-secondary">Cancel</button>' +
            '<button type="submit" id="savePostFormBtn" class="btn btn-primary">' + (postToEdit ? 'Update Post' : 'Save Post Log') + '</button>' +
          '</div>' +
        '</form>';

      App.dom.clearContainer(formContainer);
      formContainer.appendChild(formCard);
      formContainer.style.display = 'block';

      var form = App.dom.qs('#postForm', formContainer);
      var cancelBtn = App.dom.qs('#cancelPostFormBtn', formContainer);
      var titleInput = App.dom.qs('#postTitleInput', formContainer);
      var dateInput = App.dom.qs('#postDateInput', formContainer);

      addListener(cancelBtn, 'click', function () {
        self.closeForm(formContainer, toggleBtn);
      });

      addListener(form, 'submit', function (e) {
        e.preventDefault();

        var titleReq = App.validators.required(titleInput.value);
        var titleMax = App.validators.maxLength(titleInput.value, 120);
        if (!titleReq.valid || !titleMax.valid) {
          App.dom.qs('#postTitleError', form).textContent = '⚠ ' + (titleReq.error || titleMax.error);
          App.dom.qs('#postTitleError', form).style.display = 'flex';
          return;
        }

        var dateValid = App.validators.notFutureDate(dateInput.value);
        if (!dateValid.valid) {
          App.dom.qs('#postDateError', form).textContent = '⚠ ' + dateValid.error;
          App.dom.qs('#postDateError', form).style.display = 'flex';
          return;
        }

        var postData = {
          title: titleInput.value,
          format: App.dom.qs('#postFormatSelect', form).value,
          topic: App.dom.qs('#postTopicInput', form).value,
          date: dateInput.value,
          likes: App.dom.qs('#postLikesInput', form).value,
          comments: App.dom.qs('#postCommentsInput', form).value,
          shares: App.dom.qs('#postSharesInput', form).value,
          reach: App.dom.qs('#postReachInput', form).value
        };

        if (editingPostId) {
          App.postsStore.update(editingPostId, postData);
          App.components.toast.show('Post updated successfully', 'success');
        } else {
          App.postsStore.add(postData);
          App.components.toast.show('Post logged successfully!', 'success');
        }

        self.closeForm(formContainer, toggleBtn);
        var listContainer = App.dom.qs('#postsList');
        if (listContainer) self.renderPostsList(listContainer);
      });
    },

    /**
     * Close form drawer.
     */
    closeForm: function (formContainer, toggleBtn) {
      isFormOpen = false;
      editingPostId = null;
      formContainer.style.display = 'none';
      App.dom.clearContainer(formContainer);
      toggleBtn.textContent = '＋ Log New Post';
    },

    /**
     * Destroy listeners.
     */
    destroy: function () {
      activeListeners.forEach(function (item) {
        if (item.el) item.el.removeEventListener(item.event, item.handler);
      });
      activeListeners = [];
      isFormOpen = false;
      editingPostId = null;
    }
  };
})(window.ContentOS);
