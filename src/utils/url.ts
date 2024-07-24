export const getURLParams = (name: string) => {
  // Construct a URL object using the current window location
  const url = new URL(window.location.href);

  // Use URLSearchParams to work with the query parameters easily
  const params = new URLSearchParams(url.search);

  // Get the value of the 'quiz' parameter
  const value = params.get(name);

  return value; // This will be the value of the 'quiz' parameter or null if not present
};
