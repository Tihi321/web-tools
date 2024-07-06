export const getStringValue = (name: string): string => {
  const data = localStorage.getItem(name);
  return data || "";
};

export const saveStringValue = (name: string, value: string) => {
  localStorage.setItem(name, value);
};
