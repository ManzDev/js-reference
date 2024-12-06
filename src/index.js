import { createTable } from "./createTable.js";

const datatype = document.querySelector(".datatype");
const content = document.querySelector(".content");

const datalist = document.createElement("datalist");
datalist.id = "datatype";
Object.getOwnPropertyNames(globalThis).forEach(key => datalist.append(new Option(key, key)));
datatype.after(datalist);

datatype.addEventListener("input", () => {
  const isVisible = datatype.value.length > 3;
  isVisible ? datatype.setAttribute("list", "datatype") : datatype.removeAttribute("list");
});

datatype.addEventListener("change", () => {
  const type = datatype.value;
  content.innerHTML = ``;
  createTable(type, content);
});
