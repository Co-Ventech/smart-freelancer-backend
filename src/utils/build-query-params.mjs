export const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => searchParams.append(key, item));
    } else if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};