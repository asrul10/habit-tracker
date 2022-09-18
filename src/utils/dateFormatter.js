export const dateFormatter = (date, yearMonth = false) => {
  let formatted = [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"),
  ];
  if (!yearMonth) {
    formatted.push(date.getDate().toString().padStart(2, "0"));
  }
  return formatted.join("-");
};
