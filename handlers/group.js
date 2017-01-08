'use strict';

import * as groupUtil from '../utils/group';

const handle = (action, params, callback) => {
  groupUtil[action](params)
  .then((result) => {
    callback(null, result);
  })
  .catch((error) => {
    callback(error);
  });
}

export function create_group(event, context, callback) {
  handle('create_group', JSON.parse(event.body), callback);
}

export function update_group(event, context, callback) {
  handle('update_group', JSON.parse(event.body), callback);
}

export function delete_group(event, context, callback) {
  handle('delete_group', event.body, callback);
}

export function list_group(event, context, callback) {
  handle('list_group', event.body, callback);
}

export function get_group(event, context, callback) {
  handle('get_group', event.body, callback);
}
