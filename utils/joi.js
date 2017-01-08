export function formatJoiError(error) {
  const messages = error.details.map(detail => detail.message);

  return {
    type: error.name,
    message: messages
  };
}
