function loadXMLDoc(filename) {
  return fetch(filename)
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"));
}

async function displayResult(xml) {
  const xsl = await loadXMLDoc("shop.xsl");

  if (window.ActiveXObject || "ActiveXObject" in window) {
    const ex = xml.transformNode(xsl);
    document.getElementById("shop-data").innerHTML = ex;
  } else if (
    document.implementation &&
    document.implementation.createDocument
  ) {
    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsl);
    const resultDocument = xsltProcessor.transformToFragment(xml, document);
    document.getElementById("shop-data").innerHTML = "";
    document.getElementById("shop-data").appendChild(resultDocument);
  }

  populateFilters(xml);
  populateCategories(xml);
  populateNames(xml);
}

function populateFilters(xml) {
  const sizes = new Set();
  const colors = new Set();
  const categories = new Set();
  const brands = new Set();

  Array.from(xml.getElementsByTagName("product")).forEach((product) => {
    Array.from(product.getElementsByTagName("size")).forEach((size) =>
      sizes.add(size.textContent)
    );
    Array.from(product.getElementsByTagName("color")).forEach((color) =>
      colors.add(color.textContent)
    );
    const category = product.getElementsByTagName("category")[0].textContent;
    categories.add(category);
    const brand = product.getElementsByTagName("brand")[0].textContent;
    brands.add(brand);
  });

  const sizeFilter = document.getElementById("size-filter");
  sizeFilter.innerHTML = '<option value="">All Sizes</option>';
  sizes.forEach((size) => {
    const option = document.createElement("option");
    option.value = size;
    option.textContent = size;
    sizeFilter.appendChild(option);
  });

  const colorFilter = document.getElementById("color-filter");
  colorFilter.innerHTML = '<option value="">All Colors</option>';
  colors.forEach((color) => {
    const option = document.createElement("option");
    option.value = color;
    const hexColor = colorNameToHex(color);
    option.style.backgroundColor = hexColor;
    option.style.color = getContrastYIQ(hexColor);
    option.textContent = color;
    colorFilter.appendChild(option);
  });

  const categoryFilter = document.getElementById("category-filter");
  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const brandFilter = document.getElementById("brand-filter");
  brandFilter.innerHTML = '<option value="">All Brands</option>';
  brands.forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandFilter.appendChild(option);
  });
}



function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

function populateCategories(xml) {
  const categories = new Set();

  Array.from(xml.getElementsByTagName("product")).forEach((product) => {
    const category = product.getElementsByTagName("category")[0].textContent;
    categories.add(category);
  });

  const categoryList = document.getElementById("category-list");
  categoryList.innerHTML = "";
  categories.forEach((category) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.textContent = category;
    button.onclick = () => filterByCategory(category);
    li.appendChild(button);
    categoryList.appendChild(li);
  });
}

function populateNames(xml) {
  const names = new Set();

  Array.from(xml.getElementsByTagName("product")).forEach((product) => {
    const name = product.getElementsByTagName("brand")[0].textContent;
    names.add(name);
  });

  
  names.forEach((name) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.textContent = name;
    button.onclick = () => filterByName(name);
    li.appendChild(button);
  });
}

function filterByCategory(category) {
  loadXMLDoc("shop.xml").then((xml) => {
    const filteredProducts = Array.from(
      xml.getElementsByTagName("product")
    ).filter((product) => {
      return (
        product
          .getElementsByTagName("category")[0]
          .textContent.toLocaleLowerCase() === category.toLocaleLowerCase()
      );
    });

    const filteredXml = document.implementation.createDocument(
      "",
      "shop",
      null
    );
    filteredProducts.forEach((product) => {
      filteredXml.documentElement.appendChild(product.cloneNode(true));
    });

    displayResult(filteredXml);
  });
}

function filterByName(name) {
  loadXMLDoc("shop.xml").then((xml) => {
    const filteredProducts = Array.from(
      xml.getElementsByTagName("product")
    ).filter((product) => {
      return (
        product
          .getElementsByTagName("brand")[0]
          .textContent.toLocaleLowerCase() === name.toLocaleLowerCase()
      );
    });

    const filteredXml = document.implementation.createDocument(
      "",
      "shop",
      null
    );
    filteredProducts.forEach((product) => {
      filteredXml.documentElement.appendChild(product.cloneNode(true));
    });

    displayResult(filteredXml);
  });
}

function filterProducts() {
  loadXMLDoc("shop.xml").then((xml) => {
    const sizeFilter = document
      .getElementById("size-filter")
      .value.toLowerCase();
    const colorFilter = document
      .getElementById("color-filter")
      .value.toLowerCase();
    const categoryFilter = document
      .getElementById("category-filter")
      .value.toLowerCase();
    const brandFilter = document
      .getElementById("brand-filter")
      .value.toLowerCase();
    const sortBy = document.getElementById("sort-by").value;

    const filteredProducts = Array.from(
      xml.getElementsByTagName("product")
    ).filter((product) => {
      const sizeMatch = Array.from(product.getElementsByTagName("size")).some(
        (size) =>
          size.textContent.toLowerCase().includes(sizeFilter) ||
          sizeFilter === ""
      );
      const colorMatch = Array.from(product.getElementsByTagName("color")).some(
        (color) =>
          color.textContent.toLowerCase().includes(colorFilter) ||
          colorFilter === ""
      );
      const categoryMatch =
        categoryFilter === "" ||
        product
          .getElementsByTagName("category")[0]
          .textContent.toLowerCase()
          .includes(categoryFilter);
      const brandMatch =
        brandFilter === "" ||
        product
          .getElementsByTagName("brand")[0]
          .textContent.toLowerCase()
          .includes(brandFilter);

      return sizeMatch && colorMatch && categoryMatch && brandMatch;
    });

    filteredProducts.sort((a, b) => {
      const dateA = new Date(
        a.getElementsByTagName("release_date")[0].textContent
      );
      const dateB = new Date(
        b.getElementsByTagName("release_date")[0].textContent
      );
      const priceA = parseFloat(a.getElementsByTagName("price")[0].textContent);
      const priceB = parseFloat(b.getElementsByTagName("price")[0].textContent);

      if (sortBy === "date-asc") {
        return dateA - dateB;
      } else if (sortBy === "date-desc") {
        return dateB - dateA;
      } else if (sortBy === "price-asc") {
        return priceA - priceB;
      } else if (sortBy === "price-desc") {
        return priceB - priceA;
      }
      return 0;
    });

    const filteredXml = document.implementation.createDocument(
      "",
      "shop",
      null
    );
    filteredProducts.forEach((product) => {
      filteredXml.documentElement.appendChild(product.cloneNode(true));
    });

    displayResult(filteredXml);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadXMLDoc("shop.xml").then((xml) => {
    displayResult(xml);
    populateFilters(xml);
    populateCategories(xml);
    populateNames(xml);
  });
});


function colorNameToHex(color) {
  const colors = {
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aqua": "#00ffff",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "black": "#000000",
    "blanchedalmond": "#ffebcd",
    "blue": "#0000ff",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgreen": "#006400",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "fuchsia": "#ff00ff",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "gray": "#808080",
    "green": "#008000",
    "greenyellow": "#adff2f",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred": "#cd5c5c",
    "indigo": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgray": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370db",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "navy": "#000080",
    "oldlace": "#fdf5e6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#db7093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "purple": "#800080",
    "rebeccapurple": "#663399",
    "red": "#ff0000",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "silver": "#c0c0c0",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "white": "#ffffff",
    "whitesmoke": "#f5f5f5",
    "yellow": "#ffff00",
    "yellowgreen": "#9acd32"
  };
  return colors[color.toLowerCase()] || color;
}
