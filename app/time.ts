export const getCurrentTimeAndDate = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const day = now.getDate();
  const month = now.getMonth() + 1; 
  const year = now.getFullYear();

  let currentGreeting = "";
  if (hours >= 5 && hours < 12) {
    currentGreeting = "Good Morning";
  } else if (hours >= 12 && hours < 17) {
    currentGreeting = "Good Afternoon";
  } else if (hours >= 17 && hours < 21) {
    currentGreeting = "Good Evening";
  } else if (hours >= 21 && hours < 24) {
    currentGreeting = "Good Night";
  } else if (hours >= 0 && hours < 3) {
    currentGreeting = "It's Late Night";
  } else {
    currentGreeting = "Early Morning";
  }

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const formattedDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;

  return { formattedTime, formattedDate, currentGreeting };
};
