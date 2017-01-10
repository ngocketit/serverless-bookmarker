import {expect} from 'chai';
import decache from 'decache';
import sinon from 'sinon';
import {shouldFailSchemaValidation, requireNoCache, shouldResolve} from './utils';

describe('Group handler', function() {
  this.timeout(15000);

  it('should import successfully', function() {
    const group = require('../dist/group');
    const funcs = [
      'create_group',
      'update_group',
      'get_group',
      'remove_group',
      'list_group'
    ];
    funcs.forEach((name) => {
      expect(group[name]).to.be.defined;
    });
  });
});

describe('Group utils', function() {
  this.timeout(15000);
  const GROUP_TABLE = 'bookmark_group';
  let groupUtil = null;

  beforeEach(function() {
    groupUtil = requireNoCache('../utils/group');
  });

  describe('create_group()', function() {
    it('should fail validation', function() {
      return Promise.all([
        shouldFailSchemaValidation(groupUtil, 'create_group', {
          name: 123
        }),
        shouldFailSchemaValidation(groupUtil, 'create_group', {
          name: 'This is a valid name',
          description: 123
        }),
        shouldFailSchemaValidation(groupUtil, 'create_group', {
          name: 'T',
          description: 'This is a valid description'
        })
      ]);
    });

    it('should call put()', function() {
      const params = {
        name: 'A valid group name',
        description: 'A valid group description'
      };

      return shouldResolve([
        {
          'DynamoDB.DocumentClient': {
            'put': (params, callback) => {
              return callback(null, 123);
            }
          }
        }
      ], groupUtil, 'create_group', params)((error, result) => {
        expect(result).to.be.equal(123);
      });
    });

    it('should throw error', function() {
      const params = {
        name: 'A valid group name',
        description: 'A valid group description'
      };

      return shouldResolve([
        {
          'DynamoDB.DocumentClient': {
            'put': (params, callback) => {
              return callback(new Error('error'));
            }
          }
        }
      ], groupUtil, 'create_group', params)((error, result) => {
        expect(error).to.be.deep.equal(new Error('error'));
      });
    });
  });

  describe('update_group()', function() {
    it('should fail validation', function() {
      return shouldFailSchemaValidation(groupUtil, 'update_group', {
        name: 'Valid name'
      });
    });

    it('should call get() and then update()', function() {
      const params = {
        id: 'AFakeID',
        name: 'A new group name',
        description: 'New desc'
      };

      return shouldResolve([
        {
          'DynamoDB.DocumentClient': {
            'get': (params, callback) => {
              return callback(null, 'success');
            }
          },
        },
        {
          'DynamoDB.DocumentClient': {
            'update': (params, callback) => {
              return callback(null, 'ok');
            }
          }
        }
      ], groupUtil, 'update_group', params)((error, result) => {
        expect(result).to.be.equal('ok');
      });
    });

    it('should throw error', function() {
      const params = {
        id: 'AFakeID',
        name: 'A new group name',
        description: 'New desc'
      };

      return shouldResolve([
        {
          'DynamoDB.DocumentClient': {
            'get': (params, callback) => {
              return callback(new Error('Get error'));
            }
          },
        },
        {
          'DynamoDB.DocumentClient': {
            'update': (params, callback) => {
              return callback(null, 'ok');
            }
          }
        }
      ], groupUtil, 'update_group', params)((error, result) => {
        expect(error).to.be.deep.equal(new Error('Error message'));
      });
    });
  });

  describe('list_group()', function() {
    it('should call scan()', function() {
      return shouldResolve([
        {
          'DynamoDB.DocumentClient': {
            'scan': (params, callback) => {
              return callback(null, 'success');
            }
          }
        }
      ], groupUtil, 'list_group')((error, result) => {
        expect(result).to.be.equal('success');
      });
    });

    it('should throw error', function() {
      return shouldResolve([
        {
          'DynamoDB.DocumentClient': {
            'scan': (params, callback) => {
              return callback(new Error('Error message'));
            }
          }
        }
      ], groupUtil, 'list_group')((error, result) => {
        expect(error).to.be.deep.equal(new Error('Error message'));
      });
    });
  });

  describe('get_group()', function() {
    it('should fail validation', function() {
      return shouldFailSchemaValidation(groupUtil, 'get_group', {
        name: 'Whatever'
      });
    });

    it('should call get()', function() {
      const params = {
        id: 'Fake Id'
      };

      return shouldResolve([
        {
          'DynamoDB.DocumentClient': {
            'get': (params, callback) => {
              return callback(null, 'success');
            }
          }
        }
      ], groupUtil, 'get_group', params)((error, result) => {
        expect(result).to.be.equal('success');
      });
    });

    it('should throw error', function() {
      const params = {
        id: 'Fake Id'
      };

      return shouldResolve([
        {
          'DynamoDB.DocumentClient': {
            'get': (params, callback) => {
              return callback(new Error('error message'));
            }
          }
        }
      ], groupUtil, 'get_group', params)((error, result) => {
        expect(error).to.be.deep.equal(new Error('error message'));
      });
    });
  });

  describe('remove_group()', function() {
    it('should fail validation', function() {
      return shouldFailSchemaValidation(groupUtil, 'remove_group', {
        name: 'Whatever'
      });
    });

    it('should call delete()', function() {
      const params = {
        id: 'Fake Id'
      };

      return shouldResolve([
        {
          'DynamoDB.DocumentClient': {
            'delete': (params, callback) => {
              return callback(null, 'delete success');
            }
          }
        }
      ], groupUtil, 'remove_group', params)((error, result) => {
        expect(result).to.be.equal('delete success');
      });
    });

    it('should throw error', function() {
      const params = {
        id: 'Fake Id'
      };

      return shouldResolve([
        {
          'DynamoDB.DocumentClient': {
            'delete': (params, callback) => {
              return callback(new Error('error message'));
            }
          }
        }
      ], groupUtil, 'remove_group', params)((error, result) => {
        expect(error).to.be.deep.equal(new Error('error message'));
      });
    });
  });
});
