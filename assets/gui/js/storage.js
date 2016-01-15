'use strict';

let storage = {
  set: function set(key, object) {
    localStorage.setItem(key, JSON.stringify(object));
  },
  get: function get(key) {
    return JSON.parse(localStorage.getItem(key));
  },
};
