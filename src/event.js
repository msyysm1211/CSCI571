checkboxOnclick = (checkbox) => {
  var checked = checkbox.checked;
  var locationInput = document.querySelector("#location-input");
  if (checked) {
    locationInput.style.display = "none";
  } else {
    locationInput.style.display = "block";
  }
};
submitForm = () => {
  var obj = new Object();
  keyword = document.querySelector("#keyword").value;
  keyword = keyword
    .trim()
    .split(/\s+|\t+/)
    .join("+");
  obj.keyword = keyword;
  obj.distance = document.querySelector("#distance").value;
  obj.category = document.querySelector("#category").value;
  var checkbox = document.querySelector("#check-box");

  if (checkbox.checked) {
    obj.type = 0;
    obj.location = "";
  } else {
    obj.type = 1;
    var location = document.querySelector("#location-input");
    location = document.querySelector("#location-input").value;
    obj.location = location
      .trim()
      .split(/\s+|\t+/)
      .join("+");
  }
  var parms = parseParam(obj);
  console.log(parms);
  $.ajax({
    url: "http://localhost:8080/search" + "?" + parms,
    success: function (response) {
      if (response._embedded == null) {
        showNorecords();
      } else {
        console.log(response._embedded.events);
        results = response._embedded.events;
        console.log(results);
        showData(results);
      }
    },
  });
};
function showNorecords() {
  const table = document.querySelector("table");
  table.innerHTML = "No Records found";
  Object.assign(table.style, {
    backgroundColor: "White",
    textAlign: "center",
    color: "red",
    lineHeight: "40px",
    fontSize: "18px",
  });
  // table.style.backgroundColor = "white";
  // table.style.textAlign = "center";
  // table.style.color = "red";
  // table.style.lineHeight = "40px";
  // table.style.fontSize = "18px";
}
function create_table() {
  title = ["Date", "Icon", "Event", "Genre", "Venue"];
  sort = ["", "", "Event", "Genre", "Venue"];
  table = document.createElement("table");
  table.id = "result_table";
  tr = document.createElement("tr");
  th_list = [];
  for (let i = 0; i < 5; i++) {
    th = document.createElement("th");
    th.onclick = () => sort_table(sort[i]);
    th_list[i] = th;
  }
  // th_list[2].onclick = sort_table("Event");
  // th_list[3].onclick = sort_table("Genre");
  // th_list[4].onclick = sort_table("Venue");

  for (let i = 0; i < 5; i++) {
    th_list[i].innerText = title[i];
    tr.appendChild(th_list[i]);
  }
  table.appendChild(tr);
  return table;
}

function test(a) {
  console.log(a);
}

function showData(results) {
  document.querySelector("#result").innerHTML = "";
  table = create_table();
  const result_section = document.querySelector(".result-section");
  result_section.appendChild(table);
  console.log(table);
  for (let index = 0; index < results.length; index++) {
    const result = results[index];
    const tr = document.createElement("tr");
    const date = document.createElement("td");
    const img = document.createElement("img");
    const event = document.createElement("td");
    const genre = document.createElement("td");
    const venue = document.createElement("td");
    date.innerHTML =
      (result.dates.start.localDate != null
        ? `<div>${result.dates.start.localDate}</div>`
        : "") +
      (result.dates.start.localTime != null
        ? `<div>${result.dates.start.localTime}</div>`
        : "");
    img.src = result.images[0].url != null ? result.images[0].url : "";
    event.innerHTML = result.name != null ? result.name : "";
    event.className = "Event";
    genre.innerHTML =
      result.classifications[0].segment.name != null
        ? result.classifications[0].segment.name
        : "";
    genre.className = "Genre";
    venue.innerHTML =
      result._embedded.venues[0].name != null
        ? result._embedded.venues[0].name
        : "";
    venue.className = "Venue";

    tr.appendChild(date);
    tr.appendChild(img);
    tr.appendChild(event);
    tr.appendChild(genre);
    tr.appendChild(venue);

    Object.assign(img.style, {
      postion: "absolute",
      backgroundColor: "red",
      margin: "23px auto",
      height: "68px",
    });

    tr.style.height = "115px";
    tr.style.textAlign = "center";
    Object.assign(table.style, {
      marginBottom: "50px",
    });
    table.appendChild(tr);
  }
}
function parseParam(json) {
  return Object.keys(json)
    .map((v) => {
      return v + "=" + json[v];
    })
    .join("&");
}
function sort_table(target) {
  var table, rows, switching, i, x, y, shouldSwitch;
  switchCount = 0;
  table = document.getElementById("result_table");
  asc = true;
  switching = true;
  while (switching && table != undefined) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByClassName(target)[0];
      y = rows[i + 1].getElementsByClassName(target)[0];
      if (asc == true) {
        if (x.innerText.toLowerCase() > y.innerText.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else {
        if (x.innerText.toLowerCase() < y.innerText.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchCount++;
    } else {
      if (switchCount == 0 && asc == true) {
        asc = false;
        switching = true;
      }
    }
  }
}

clearForm = () => {
  document.querySelector("#keyword").value = "";
  document.querySelector("#distance").value = "10";
  document.querySelector("#check-box").checked = false;
  document.querySelector("#check-box").onclick();
  document.querySelector("#category").value = "Default";
  document.querySelector("#result").innerHTML = "";
};
