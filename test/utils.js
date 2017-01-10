import {expect} from 'chai';
import AWS from 'aws-sdk-mock';
import decache from 'decache';

export function mock(service, funcName, mockFunc) {
  AWS.mock(service, funcName, mockFunc);
}

export function unmock(service, funcName) {
  if (arguments.length == 1) {
    AWS.restore(service);
  } else {
    AWS.restore(service, funcName);
  }
}

export function shouldFailSchemaValidation(object, method, params) {
  return object[method](params)
  .catch((error) => {
    expect(error.isJoi).to.be.true;
    expect(error.name).to.be.equal('ValidationError');
  });
}

export function requireNoCache(modulePath) {
  decache(modulePath);
  return require(modulePath);
}

export function shouldResolve(mocks, object, method, params) {
  return (expectFunc) => {
    let mockServices = [];

    mocks.forEach((mockInfo) => {
      const serviceName = Object.keys(mockInfo)[0];
      const method = Object.keys(mockInfo[serviceName])[0];
      const callback = mockInfo[serviceName][method];

      mock(serviceName, method, callback);
      mockServices.push([serviceName, method]);
    });

    const unMockAll = () => {
      mockServices.reverse().forEach((mockInfo) => {
        unmock(mockInfo[0], mockInfo[1]);
      });
    }

    return object[method](params)
    .then((result) => {
      expectFunc(null, result);
      unMockAll();
    })
    .catch((error) => {
      expectFunc(error);
      unMockAll();
    });
  }
}
