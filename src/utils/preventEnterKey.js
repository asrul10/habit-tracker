export const preventEnter = (event) => {
  const { key } = event;
  if (key === "Enter") {
    event.preventDefault();
    return false;
  }
};
