/* FLOATING BUTTON */

const button = document.getElementById("events-btn");
const panel = document.getElementById("events-panel");

button.addEventListener("click", () => {
  panel.classList.toggle("open");
});


/* EVENTS DATA */

const events = [
  {
    park: "gonzalez-viquez",
    name: "San José Skate Jam",
    place: "Plaza Gonzales Viquez",
    schedule: "July 12 - 2:00 PM",
    description: "Local street skate competition with best trick contest and prizes."
  },
  {
    park: "curridabat",
    name: "Jose Maria Skate Contest",
    place: "Curridabat Skatepark",
    schedule: "August 5 - 3:00 PM",
    description: "Friendly bowl contest for intermediate and advanced skaters."
  },
  {
    park: "curridabat",
    name: "Jose Maria Skate Contest",
    place: "Curridabat Skatepark",
    schedule: "August 5 - 3:00 PM",
    description: "Friendly bowl contest for intermediate and advanced skaters."
  }
];


/* CREATE EVENT CARDS */

const container = document.getElementById("events-list");

events.forEach(event => {

  const div = document.createElement("div");
  div.classList.add("event-item");

  div.innerHTML = `
    <div class="event-card">
      <button class="toggle-btn">${event.name}</button>

      <div class="event-info">
        <p><strong>Place:</strong> ${event.place}</p>
        <p><strong>Schedule:</strong> ${event.schedule}</p>
        <p>${event.description}</p>
      </div>
    </div>
  `;

  container.appendChild(div);

});


/* ACTIVATE TOGGLE AFTER EVENTS EXIST */

activateToggle();


/* TOGGLE FUNCTION */

function activateToggle(){

  const buttons = document.querySelectorAll(".toggle-btn");

  buttons.forEach(button => {

    button.addEventListener("click", () => {

      const card = button.closest(".event-card");

      card.classList.toggle("active");

    });

  });

}

function showEventsForPark(parkId){

  const container = document.getElementById("events-list");

  container.innerHTML = "";

  const filtered = events.filter(event => event.park === parkId);

  if(filtered.length === 0){
    container.innerHTML = "<p>No competitions scheduled for this skatepark.</p>";
    document.getElementById("events-panel").classList.add("open");
    return;
  }

  filtered.forEach(event => {

    const div = document.createElement("div");
    div.classList.add("event-item");

    div.innerHTML = `
      <div class="event-card">
        <button class="toggle-btn">${event.name}</button>

        <div class="event-info">
          <p><strong>Place:</strong> ${event.place}</p>
          <p><strong>Schedule:</strong> ${event.schedule}</p>
        </div>
      </div>
    `;

    container.appendChild(div);

  });

  activateToggle();

  document.getElementById("events-panel").classList.add("open");

}

window.showEventsForPark = showEventsForPark;

/**/

document.addEventListener("click", (e) => {

  if (e.target.classList.contains("toggle-btn")) {

    const info = e.target.nextElementSibling;
    info.classList.toggle("show");

  }

});