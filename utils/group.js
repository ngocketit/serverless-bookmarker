// We don't want to import the whole sdk since we only need AWS for config.
import DynamoDB from 'aws-sdk/clients/dynamodb';
import uuid from 'uuid/v1';
import Joi from 'joi';

const GROUP_TABLE = 'bookmark_group';

const groupSchema = {
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string()
}

const validateRequestParams = (schema, params, callback) => {
  return Joi.validate(params, schema, {allowUnknown: true});
}

const initDocClient = () => {
  return new DynamoDB.DocumentClient({region: 'us-east-1'});
}

export function create_group(params) {
  return new Promise((resolve, reject) => {
    const valid = validateRequestParams(groupSchema, params);

    if (valid.error) {
      reject(valid.error);
      return;
    }

    const record = {
      TableName: GROUP_TABLE,
      Item: {
        id: uuid(),
        name: params.name,
        description: params.description,
        created: Date.now()
      }
    };

    const docClient = initDocClient();

    resolve(docClient.put(record).promise());
  });
}

export function update_group(params) {
  return new Promise((resolve, reject) => {
    const schema = Object.assign({}, groupSchema, {id: Joi.string().required()});
    const valid = validateRequestParams(schema, params);

    if (valid.error) {
      reject(valid.error);
      return;
    }

    const updateInfo = {
      TableName: GROUP_TABLE,
      Key: {
        id: params.id
      },
      UpdateExpression: "SET #name = :name, description = :desc, updated = :updated",
      ExpressionAttributeNames: {
        "#name" : "name"
      },
      ExpressionAttributeValues: {
        ":name": params.name,
        ":desc" : params.description,
        ":updated" : Date.now()
      }
    };

    const docClient = initDocClient();

    docClient.get({
      TableName: GROUP_TABLE,
      Key: {
        id: params.id
      },
    })
    .promise()
    .then(
      (result) => resolve(docClient.update(updateInfo).promise()),
      (error)  => reject(error)
    );
  });
}

export function list_group(params) {
  return new Promise((resolve, reject) => {
    const scanInfo = {
      TableName: GROUP_TABLE,
      AttributesToGet: [
        'name',
        'description',
        'created',
        'updated'
      ],
    };

    const docClient = initDocClient();

    resolve(docClient.scan(scanInfo).promise());
  });
}

export function get_group(params) {
  return new Promise((resolve, reject) => {
    const schema = {
      id: Joi.string().required()
    };

    const valid = validateRequestParams(schema, params);

    if (valid.error) {
      reject(valid.error);
      return;
    }

    const docClient = initDocClient();

    resolve(docClient.get({
      TableName: GROUP_TABLE,
      Key: {
        id: params.id
      },
    }).promise());
  });
}

export function remove_group(params) {
  return new Promise((resolve, reject) => {
    const schema = {
      id: Joi.string().required()
    };

    const valid = validateRequestParams(schema, params);
    if (valid.error) {
      reject(valid.error);
      return;
    }

    const docClient = initDocClient();

    resolve(docClient.delete({
      TableName: GROUP_TABLE,
      Key: {
        id: params.id
      },
    }).promise());
  });
}
