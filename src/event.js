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
  $.ajax({
    url: "http://localhost:8080/search?" + parms,
    success: function (response) {
      if (response._embedded == null) {
        showNorecords();
      } else {
        results = response._embedded.events;
        showData(results);
      }
    },
  });
};
showNorecords = () => {
  // const table = document.querySelector("table");
  var result = document.querySelector("#result");
  result.innerHTML = "";
  const table = create_table();
  console.log(table);
  table.innerHTML = "No Records found";
  Object.assign(table.style, {
    backgroundColor: "White",
    textAlign: "center",
    color: "red",
    lineHeight: "40px",
    fontSize: "18px",
  });
  result.append(table);
};
create_table = () => {
  title = ["Date", "Icon", "Event", "Genre", "Venue"];
  sort = ["", "", "event", "Genre", "Venue"];
  table = document.createElement("table");
  table.id = "result_table";
  tr = document.createElement("tr");
  tr.id = "table_title";
  th_list = [];
  for (let i = 0; i < 5; i++) {
    th = document.createElement("th");
    if (i >= 2) th.onclick = () => sort_table(sort[i]);
    th.setAttribute("style", "cursor:pointer");
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
  if (result._embedded)
    venue.innerHTML =
      result._embedded.venues[0].name != null
        ? result._embedded.venues[0].name
        : "";
  return venue;
}
function create_genre(result) {
  const genre = document.createElement("td");
  genre.className = "Genre";
  if (result.classifications)
    genre.innerHTML = result.classifications[0].segment.name;
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
  var cell = document.createElement("p");
  cell.innerHTML = name;
  cell.id = id;
  cell.className = "event";
  cell.onclick = () => get_event_details(cell);
  event.appendChild(cell);
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

get_event_details = (target) => {
  target_url = `http://localhost:8080/detail?id=${target.id}`;
  $.ajax({
    url: target_url,
    success: function (response) {
      show_detail(response);
    },
  });
};

show_detail = (response) => {
  console.log(response);
  var localTime =
    response.dates !== undefined ? response.dates.start.localTime : "";
  var localDate =
    response.dates !== undefined ? response.dates.start.localDate : "";
  var title = response.name;
  var date = localDate + " " + localTime;
  var artist = [];
  console.log(response._embedded.attractions == null);
  artist[0] =
    response._embedded.attractions == null
      ? ""
      : response._embedded.attractions[0].name;
  artist[1] =
    response._embedded.attractions == null
      ? ""
      : response._embedded.attractions[0].url;
  var venue = response._embedded.venues
    ? response._embedded.venues[0].name
    : "";

  var genre = response.classifications
    ? response.classifications[0].segment.name
    : "";

  var price_range = response.priceRanges
    ? `${response.priceRanges[0].min}-${response.priceRanges[0].max} USD`
    : "";

  var status = response.dates.status.code;
  var ticket_url = ["Ticketmaster", response.url];
  var img_url = response.seatmap ? response.seatmap.staticUrl : "";
  params = [];
  params[0] = title;
  params[1] = date;
  params[2] = artist;
  params[3] = venue;
  params[4] = genre;
  params[5] = price_range;
  params[6] = status;
  params[7] = ticket_url;
  params[8] = img_url;
  update_detail(params);
};

update_detail = (params) => {
  //update detail 
  get_venue_details(params[3])

  var detail = document.getElementById("detail");
  var title = document.querySelector(".detail-title");
  var venue_detail = document.querySelector(".show-venue");
  title.innerText = params[0];
  detail.setAttribute("style", "display:block !important");
  venue_detail.setAttribute("style", "display:block !important");
  var items = detail.querySelectorAll(".detail-item");
  for (let i = 1; i < params.length - 1; i++) {
    var item = items[i - 1];
    var text = params[i];
    var item_body = item.querySelector(".detail-item-body");
    var tagName = item_body.tagName;
    if (tagName == "A") {
      if (text) {
        item.setAttribute("style", "display:flex");
        item_body.innerText = text[0];
        item_body.href = text[1];
      } else {
        item.setAttribute("style", "display:none");
      }
    } else if (tagName == "IMG") {
      item_body.src = text;
    } else if (i == 6) {
      ticket_status(text);
    } else {
      if (text) {
        item.setAttribute("style", "display:flex");
        item_body.innerText = text;
      } else {
        item.setAttribute("style", "display:none");
      }
    }
  }
  var img = document.getElementById("detail-img");
  img.src = params[params.length - 1];
  var scrollHeight = detail.offsetTop;

  window.scrollTo({
    top: scrollHeight,
    behavior: "smooth",
  });
};

ticket_status = (target) => {
  var status = document.querySelector(".status");
  if (target == "onsale") {
    status.innerText = "On Sale";
    status.style.backgroundColor = "green";
  } else if (target.toLowerCase() == "offsale") {
    status.innerText = "Off Sale";
    status.style.backgroundColor = "Red";
  } else if (target.toLowerCase() == "canceled") {
    status.innerText = "Canceled";
    status.style.backgroundColor = "Black";
  } else if (target.toLowerCase() == "postponed") {
    status.innerText = "Postponed";
    status.style.backgroundColor = "Orange";
  } else if (target.toLowerCase() == "rescheduled") {
    status.innerText = "Rescheduled";
    status.style.backgroundColor = "Orange";
  }
};

show_venue = () => {
  venue = document.getElementById("venue_info").innerText;
  console.log(venue);
  venue = venue.split(" ").join("+");
  console.log(venue);
  get_venue_details(venue);
};

get_venue_details = (venue) => {
  target_url = `http://localhost:8080/venue?keyword=${venue}`;
  $.ajax({
    url: target_url,
    success: function (response) {
      update_venue_detail(response);
    },
  });
};
update_venue_detail = (response) => {
  var show_venue = document.querySelector(".show-venue");
  if (response._embedded == undefined) {
    show_venue.style.display = "none";
    return;
  }
  var venue = document.querySelector(".venue-detail");
  show_venue.style.display = "none";
  venue.style.display = "flex";
  console.log(response);
  let title = document.querySelector(".venue-detail-title");
  let venue_name = document.getElementById("venue_info");
  title.innerText = venue_name.innerText;
  var street = document.getElementById("street");
  var city = document.getElementById("city");
  var state = document.getElementById("state");
  var postcalCode = document.getElementById("postcalCode");
  var map = document.getElementById("map");
  var info = document.getElementById("more-info");
  var list = [street, city, state, postcalCode, info];
  console.log(response);
  var results = process_address_response(response);
  console.log(results);
  for (let i = 0; i < results.length - 1; i++) {
    console.log(list[i]);
    list[i].innerText = results[i];
  }
  let parameters = venue_name.innerText.split(" ").join("+");
  let map_url = `https://www.google.com/maps/search/?api=1&query=${parameters}`;
  map.href = map_url;
  console.log(map_url);
  if (results[4] != "N/A") list[4].href = results[4];
  else {
    let venue_right = document.querySelector(".venue-right");
    venue_right.innerHTML = "";
    let p = document.createElement("div");
    p.innerText = "No more events at this venue";
    venue_right.appendChild(p);
  }
  var scrollHeight = venue.offsetTop;

  window.scrollTo({
    top: scrollHeight,
    behavior: "smooth",
  });
};
process_address_response = (response) => {
  var street = response?._embedded?.venues[0]?.address?.line;
  var city = response?._embedded?.venues[0]?.city?.name;
  var postcalCode = response?._embedded?.venues[0]?.postalCode;
  var state = response?._embedded?.venues[0]?.state?.name;
  var url = response?._embedded?.venues[0]?.url;
  return [
    street ? street : "N/A",
    city ? city : "N/A",
    postcalCode ? postcalCode : "N/A",
    state ? state : "N/A",
    url ? url : "N/A",
  ];
};
