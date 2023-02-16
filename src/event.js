checkboxOnclick = (checkbox) => {
  var checked = checkbox.checked;
  var locationInput = document.querySelector("#location-input");
  if (checked) {
    locationInput.style.display = "none";
  } else {
    locationInput.style.display = "block";
  }
};
// test = () => {
//   const btn = document.createElement("button");
//   btn.innerHTML = "add";
//   btn.onclick = () => {
//     test();
//   };
//   const body = document.querySelector("body");
//   body.appendChild(btn);
// };
// test();

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
    url: "http://localhost:8080/search?" + parms,
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
showNorecords = () => {
  const table = document.querySelector("table");
  table.innerHTML = "No Records found";
  Object.assign(table.style, {
    backgroundColor: "White",
    textAlign: "center",
    color: "red",
    lineHeight: "40px",
    fontSize: "18px",
  });
};
create_table = () => {
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

  for (let i = 0; i < 5; i++) {
    th_list[i].innerText = title[i];
    tr.appendChild(th_list[i]);
  }
  table.appendChild(tr);
  Object.assign(table.style, {
    marginBottom: "50px",
  });
  return table;
};
function showData(results) {
  document.querySelector("#result").innerHTML = "";
  table = create_table();
  const result_section = document.querySelector(".result-section");
  result_section.appendChild(table);
  console.log(table);
  for (let index = 0; index < results.length; index++) {
    const result = results[index];
    const tr = document.createElement("tr");
    //create img tag
    const img = create_img(result);
    //create date tag
    const date = create_date(result);
    //create event tag
    const event = create_event(
      result.name != null ? result.name : "",
      result.id
    );
    //create genre tag
    const genre = create_genre(result);
    //create venue tag
    const venue = create_venue(result);

    tr.appendChild(date);
    tr.appendChild(img);
    tr.appendChild(event);
    tr.appendChild(genre);
    tr.appendChild(venue);

    tr.style.height = "115px";
    tr.style.textAlign = "center";
    table.appendChild(tr);
  }
}
function create_venue(result) {
  const venue = document.createElement("td");
  venue.className = "Venue";
  venue.innerHTML =
    result._embedded.venues[0].name != null
      ? result._embedded.venues[0].name
      : "";
  return venue;
}
function create_genre(result) {
  const genre = document.createElement("td");
  genre.className = "Genre";
  genre.innerHTML =
    result.classifications[0].segment.name != null
      ? result.classifications[0].segment.name
      : "";
  return genre;
}
function create_date(result) {
  const date = document.createElement("td");
  date.innerHTML =
    (result.dates.start.localDate != null
      ? `<div>${result.dates.start.localDate}</div>`
      : "") +
    (result.dates.start.localTime != null
      ? `<div>${result.dates.start.localTime}</div>`
      : "");
  return date;
}

function create_img(result) {
  const img = document.createElement("img");
  img.src = result.images[0].url != null ? result.images[0].url : "";
  Object.assign(img.style, {
    postion: "absolute",
    backgroundColor: "red",
    margin: "23px auto",
    height: "68px",
  });
  return img;
}

function create_event(name, id) {
  const event = document.createElement("td");
  event.innerHTML = name;
  event.id = id;
  event.className = "Event";
  event.onclick = () => get_event_details(event);
  return event;
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
  console.log(target);
  table = document.getElementById("result_table");
  asc = true;
  switching = true;
  while (switching && table != undefined) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      console.log(rows[i]);
      x = rows[i].getElementsByClassName(target)[0];
      y = rows[i + 1].getElementsByClassName(target)[0];
      console.log(x);
      console.log(y);
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

get_event_details = (target) => {
  target_url = `http://localhost:8080/detail?id=${target.id}`;
  $.ajax({
    url: target_url,
    success: function (response) {
      create_detail_form(response);
      show_event_detail(response);
    },
  });
};

show_event_detail = (response) => {
  var body = document.createElement("div");
  body.className = "detail-body";
  var date = create_date_detail(response);
  var team = create_team_detail(response);
  body.appendChild(date);
  body.appendChild(team);
  return body;
};

create_detail_form = (response) => {
  var body = document.querySelector("body");
  var detail = document.createElement("div");
  detail.className = "detail";
  var head = document.createElement("div");
  head.className = "detail-title";
  head.innerText = response.name;
  detail.appendChild(head);
  detail.append(show_event_detail(response));
  body.append(detail);
};

create_detail_item = (text) => {
  const detail_item = document.createElement("div");
  const title = document.createElement("div");
  title.className = "detail-item-title";
  title.innerText = text;
  detail_item.className = "detail-item";
  detail_item.appendChild(title);
  return detail_item;
};

create_date_detail = (response) => {
  console.log(response);
  if (response.dates.start.localDate == null) return null;
  detail_item = create_detail_item("Date");
  const date = document.createElement("div");
  date.innerText =
    response.dates.start.localDate + " " + response.dates.start.localTime;
  date.className = "detail-item-body";
  detail_item.appendChild(date);
  return detail_item;
};
create_team_detail = (response) => {
  if (len(response._embedded.attractions) == 0) return null;
  detail_item = create_detail_item("Artist/Team");
  const team = document.createElement("a");
  team.innerText = response._embedded.attractions[0].name;
  team.className = "detail-item-body";
  team.href = response._embedded.attractions[0].url;
  detail_item.appendChild(team);
  return detail_item;
};
create_venue_detail = (response) => {
  if (response._embedded.venues[0].name == null) return null;
  detail_item = create_detail_item("Artist/Team");
  const team = document.createElement("a");
  team.innerText = response._embedded.attractions[0].name;
  team.className = "detail-item-body";
  team.href = response._embedded.attractions[0].url;
  detail_item.appendChild(team);
  return detail_item;
};

display = () => {
  var detail = document.getElementById("detail");
  detail.style.display = "block";
  console.log(detail);
};
