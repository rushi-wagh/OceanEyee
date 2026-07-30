const zodResolver = (schema) => async (values) => {
  const result = await schema.safeParseAsync(values);

  if (result.success) {
    return {
      values: result.data,
      errors: {},
    };
  }

  const errors = {};

  result.error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (field) {
      errors[field] = {
        type: issue.code,
        message: issue.message,
      };
    }
  });

  return {
    values: {},
    errors,
  };
};

export { zodResolver };
