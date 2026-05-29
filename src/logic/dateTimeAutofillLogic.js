function pad2(value) {
  return String(value).padStart(2, "0");
}

export function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());

  return `${year}-${month}-${day}`;
}

export function getLocalTimeInputValue(date = new Date()) {
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());

  return `${hours}:${minutes}`;
}

export function getLocalDateTimeInputValues(date = new Date()) {
  return {
    castingDate: getLocalDateInputValue(date),
    castingTime: getLocalTimeInputValue(date),
  };
}

export function formatDateTimeAutofillStatus({ castingDate, castingTime }) {
  if (castingDate && castingTime) {
    return `Current casting date and time applied: ${castingDate} ${castingTime}.`;
  }

  if (castingDate) {
    return `Current casting date applied: ${castingDate}.`;
  }

  if (castingTime) {
    return `Current casting time applied: ${castingTime}.`;
  }

  return "No date or time was applied.";
}