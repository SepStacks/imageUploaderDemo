import Vue from 'vue'
import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-live-find'));

const db = new PouchDB('imgupload');
PouchDB.sync('imgupload', 'http://localhost:5984/imgupload/', {live:true})

export {db}