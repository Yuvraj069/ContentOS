/** Posts Data Store*/
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';

  function getKey() {
    return App.storage.getUserKey('contentos:posts');
  }

  App.postsStore = {
    getAll: function () {
      var posts = App.storage.get(getKey(), []);
      return Array.isArray(posts) ? posts : [];
    },

    add: function (data) {
      var posts = this.getAll();
      var newPost = {
        id: 'post_' + Date.now(),
        title: String(data.title || '').trim(),
        format: data.format || 'Reel',
        topic: String(data.topic || '').trim(),
        date: data.date || new Date().toISOString().split('T')[0],
        likes: Number(data.likes) || 0,
        comments: Number(data.comments) || 0,
        shares: Number(data.shares) || 0,
        reach: Number(data.reach) || 1
      };
      posts.unshift(newPost);
      App.storage.set(getKey(), posts);
      return newPost;
    },

    update: function (id, data) {
      var posts = this.getAll();
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].id === id) {
          posts[i].title = String(data.title || '').trim();
          posts[i].format = data.format || posts[i].format;
          posts[i].topic = String(data.topic || '').trim();
          posts[i].date = data.date || posts[i].date;
          posts[i].likes = Number(data.likes) || 0;
          posts[i].comments = Number(data.comments) || 0;
          posts[i].shares = Number(data.shares) || 0;
          posts[i].reach = Number(data.reach) || 1;
          App.storage.set(getKey(), posts);
          return posts[i];
        }
      }
      return null;
    },

    remove: function (id) {
      var posts = this.getAll();
      var updated = posts.filter(function (p) { return p.id !== id; });
      App.storage.set(getKey(), updated);
      return true;
    }
  };
})(window.ContentOS);
