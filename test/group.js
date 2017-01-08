var expect = require('chai').expect;
var AWS_SDK = require('aws-sdk');
var AWS = require('aws-sdk-mock');
var sinon = require('sinon');
var decache = require('decache');

describe('Group handler', function() {
  this.timeout(15000);

  it('should import successfully', function() {
    const group = require('../dist/group');
    const funcs = [
      'create_group',
      'update_group',
      'get_group',
      'delete_group',
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

  const mock = (service, funcName, mockFunc) => {
    AWS.mock(service, funcName, mockFunc);
  };

  const unmock = (service, funcName) => {
    if (arguments.length == 1) {
      AWS.restore(service);
    } else {
      AWS.restore(service, funcName);
    }
  }

  const requireModule = (modulePath) => {
    decache(modulePath);
    return require(modulePath);
  }

  describe('create_group()', function() {
    it('it should fail validation', function() {
      const groupUtil = requireModule('../utils/group');
      const params1 = {
        name: 123
      };

      const promise1 = groupUtil.create_group(params1)
      .catch((error) => {
        expect(error.name).to.be.equal('ValidationError');
        expect(error.isJoi).to.be.true;
      });

      const params2 = {
        name: 'This is a valid name',
        description: 123
      };

      const promise2 = groupUtil.create_group(params2)
      .catch((error) => {
        expect(error.isJoi).to.be.true;
      });

      const params3 = {
        name: 'T',
        description: 'This is a valid description'
      };
      const promise3 = groupUtil.create_group(params3)
      .catch((error) => {
        expect(error.isJoi).to.be.true;
      });

      return Promise.all([promise1, promise2, promise3]);
    });

    it('should call put()', function() {
      mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
        return callback(null, 123);
      });

      const params = {
        name: 'A valid group name',
        description: 'A valid group description'
      };

      const groupUtil = requireModule('../utils/group');

      const promise = groupUtil.create_group(params)
      .then((result) => {
        expect(result).to.be.equal(123);
      });

      unmock('DynamoDB.DocumentClient', 'put');

      return promise;
    });

    it('should throw error', function() {
      mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
        return callback(new Error('Error'));
      });

      const params = {
        name: 'A valid group name',
        description: 'A valid group description'
      };

      const groupUtil = requireModule('../utils/group');

      const promise = groupUtil.create_group(params)
      .catch((error) => {
        expect(error).to.be.deep.equal(new Error('Error'));
      });

      unmock('DynamoDB.DocumentClient', 'put');

      return promise;
    });
  });
});
