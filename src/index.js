// Your code here
const menu = document.getElementById("films");
let remainingTickets = document.getElementById("ticket-num");
const soldOutIcon = document.createElement("i");
const ticketsElement = document.getElementById("tickets");
const button = document.getElementById("buy-ticket");
const baseUrl = "http://localhost:3000/films";
let movieID = 1;
let ticketsSold;
let capacity;

// handling fetch errors
async function fetchMovies() { //to return a promise
  try {
    const response = await fetch(baseUrl); // to wait and handle a promise

    if (response.ok) {
      const data = await response.json();
       //   console.log(data);
       loadMovies(data);
    } else {
      throw new Error("Oops, Something went wrong"); //an error message is displayed when the fetch request fails
    }
  } catch (error) {
    console.error(error);
  }
}

// load movies and add an event listener to the menu
function loadMovies(data) {
  menu.innerHTML = "";
  for (const movie of data) {
    const movieItem = document.createElement("li");
    movieItem.innerText = movie.title;
    movieItem.className = "film item";
    movieItem.style.cursor = "pointer";
    movieItem.id = movie.id;
    menu.appendChild(movieItem);
  }
  menu.addEventListener("click", (e) => { //when the movie is clicked
    movieID = e.target.id;
    // console.log(movieID);
    loadMovieData(movieID); // the code executes the following function
  });
  loadMovieData(movieID);
}
//lets format the runtime for the movies to make it easier to read
function formatRuntime(runtime) {
  let hours = Math.floor(runtime / 60);
  let minutes = runtime % 60;
  let result = "";
  if (hours > 0) {
    result += hours + " hr";
    if (hours > 1) {
      result += "s";
    }
    result += " ";
  }
  if (minutes > 0) {
    result += minutes + " min";
  }
  return result;
}
// When a movie name is clicked on the menu, we fetch data using the movie id
function loadMovieData(movieID) {
  async function fetchMovie() {
    try {
      const response = await fetch(`${baseUrl}/${movieID}`);
      if (response.ok) {
        const data = await response.json();
        const moviePoster = document.getElementById("poster");
        moviePoster.src = data.poster;
        const movieTitle = document.getElementById("title");
        movieTitle.textContent = data.title;
        const movieRuntime = document.getElementById("runtime");
        movieRuntime.textContent = formatRuntime(data.runtime);
        const movieDescription = document.getElementById("film-info");
        movieDescription.textContent = data.description;
        const movieShowTime = document.getElementById("showtime");
        movieShowTime.textContent = data.showtime;
        ticketsSold = data.tickets_sold;
        capacity = data.capacity;
        remainingTickets.textContent = capacity - ticketsSold;
        revertTicketAvailability();
      } else {
        throw new Error("Oops, Something went wrong");
      }
    } catch (error) {
      console.error(error);
    }
  }
  fetchMovie();
}

function handleButtonClick() {
  button.addEventListener("click", async () => {
    if (remainingTickets.textContent > 0) {
      ticketsSold += 1;
      let remainingCapacity = capacity - ticketsSold;
      remainingTickets.textContent = remainingCapacity;

      // Update tickets_sold value to the server
      await updateMovieData(movieID, ticketsSold);

      if (remainingTickets.textContent === "0") {
        const soldOutMovie = document.querySelector(
          ".film.item:nth-child(" + movieID + ")"
        );
        soldOutMovie.classList.add("sold-out");
        ticketsElement.textContent = "SOLD OUT ";
        soldOutIcon.classList.add("fa-solid", "fa-triangle-exclamation");
        ticketsElement.appendChild(soldOutIcon);
        button.textContent = "Sold Out";
        button.disabled = true;
      }
    }
});
}
//this function causes the webpage to refresh
async function updateMovieData(movieID, ticketsSold) {
  try {
    const response = await fetch(`${baseUrl}/${movieID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept":"application/json"
      },
      body: JSON.stringify({
        tickets_sold: ticketsSold,
      }),
    });
    if (!response.ok) {
      throw new Error("Oops, Something went wrong");
    }
  } catch (error) {
    console.error(error);
  }
}
function revertTicketAvailability() {
    const soldOutMovie = document.querySelector(
      ".film.item:nth-child(" + movieID + ")"
    );
    if (remainingTickets.textContent > 0) {
      soldOutMovie.classList.remove("sold-out");
      ticketsElement.textContent = `Remaining Tickets`;
      button.disabled = false;
      button.textContent = "Buy Tickets";
    } else {
      soldOutMovie.classList.add("sold-out");
      ticketsElement.textContent = "SOLD OUT ";
      ticketsElement.appendChild(soldOutIcon);
      button.disabled = true;
      button.textContent = "Sold Out";
    }
  }
  handleButtonClick()
  fetchMovies();
   // each time i patch, the page refreshes and makes the loading time slowes down. Everytime the page refreshes, it loads the first movie, since our movieID=1.