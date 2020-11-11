// const {db} = require('./pouch');
import Vue from 'vue'
import {db} from './pouch'
var blobUtil = require('blob-util')

// var db = myModule.db
console.log('db')
Vue.mixin({
    data: function() {
      return {
      db:db,
      blobUtil: blobUtil
      }
    },

  })
