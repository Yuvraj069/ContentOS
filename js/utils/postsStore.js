/**
 * ContentOS - Posts Store Utility
 * CRUD operations over posts collection stored under key 'contentos:posts'.
 */
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  var STORAGE_KEY = 'contentos:posts';

  App.postsStore = {
    /**
     * Get all stored posts. Ensures output is always an Array.
     * @returns {Array}
     */
    getAll: function () {
      var data = App.storage.get(STORAGE_KEY, []);
      if (!Array.isArray(data)) {
        console.warn('App.postsStore.getAll: Corrupted storage reset to empty array');
        data = [];
        App.storage.set(STORAGE_KEY, data);
      }
      return data;
    },

    /**
     * Get a post by its ID.
     * @param {string} id
     * @returns {Object|null}
     */
    getById: function (id) {
      var posts = this.getAll();
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].id === id) return posts[i];
      }
      return null;
    },

    /**
     * Add a new post.
     * @param {Object} postData { title, format, topic, date, likes, comments, shares, reach }
     * @returns {Object} Created post
     */
    add: function (postData) {
      var posts = this.getAll();
      var newPost = {
        id: 'post_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        title: String(postData.title || '').trim(),
        format: postData.format || 'Reel',
        topic: String(postData.topic || '').trim(),
        date: postData.date || new Date().toISOString().split('T')[0],
        likes: Number(postData.likes) || 0,
        comments: Number(postData.comments) || 0,
        shares: Number(postData.shares) || 0,
        reach: Number(postData.reach) || 0,
        createdAt: new Date().toISOString()
      };
      posts.unshift(newPost);
      App.storage.set(STORAGE_KEY, posts);
      return newPost;
    },

    /**
     * Update an existing post.
     * @param {string} id
     * @param {Object} updatedFields
     * @returns {Object|null}
     */
    update: function (id, updatedFields) {
      var posts = this.getAll();
      var foundIndex = -1;
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].id === id) {
          foundIndex = i;
          break;
        }
      }
      if (foundIndex === -1) return null;

      var current = posts[foundIndex];
      posts[foundIndex] = {
        id: current.id,
        title: updatedFields.title !== undefined ? String(updatedFields.title).trim() : current.title,
        format: updatedFields.format || current.format,
        topic: updatedFields.topic !== undefined ? String(updatedFields.topic).trim() : current.topic,
        date: updatedFields.date || current.date,
        likes: updatedFields.likes !== undefined ? Number(updatedFields.likes) : current.likes,
        comments: updatedFields.comments !== undefined ? Number(updatedFields.comments) : current.comments,
        shares: updatedFields.shares !== undefined ? Number(updatedFields.shares) : current.shares,
        reach: updatedFields.reach !== undefined ? Number(updatedFields.reach) : current.reach,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString()
      };
      App.storage.set(STORAGE_KEY, posts);
      return posts[foundIndex];
    },

    /**
     * Remove a post by ID.
     * @param {string} id
     * @returns {boolean}
     */
    remove: function (id) {
      var posts = this.getAll();
      var initialLength = posts.length;
      var filtered = posts.filter(function (post) {
        return post.id !== id;
      });
      if (filtered.length !== initialLength) {
        App.storage.set(STORAGE_KEY, filtered);
        return true;
      }
      return false;
    }
  };
})(window.ContentOS);
