import { DATATYPES, FILTERED } from "./Datatypes.js";

const getFilteredItems = (name) => {
  const results = [...Object.getOwnPropertyNames(name)]
    .filter(key => !FILTERED.includes(key));
  return results;
}

const getMethods = (type) => {
  const chain = getPrototypeChain(type);
  const statics = {};
  const methods = {};

  chain.forEach(datatype => {
    const prototype = globalThis[datatype];
    const instance = globalThis[datatype].prototype;

    instance && (methods[datatype] = getFilteredItems(instance));
    prototype && (statics[datatype] = getFilteredItems(prototype));
  });

  return { statics, methods };
};

const getPrototypeChain = (type) => {
  const chain = [];
  let proto = globalThis[type]?.prototype;
  while (proto) {
    chain.push(proto.constructor.name);
    proto = Object.getPrototypeOf(proto);
  }

  return chain.length ? chain : [type];
}

const getType = (value) => {
  return value === null ? "" : value?.constructor.name;
}

const createDatatypeTable = (type) => {
  const { statics, methods } = getMethods(type);
  const chain = getPrototypeChain(type);

  const createButtons = (prototypes) => prototypes
    .map(t => /* html */`<label><input type=radio name="${type}">${t}</label>`)
    .join(" -> ");

  const createHeader = (name) => /* html */`<tr><th colspan="2">${name}</th></tr>`;

  const createRow = (type, prototype, method, mtype = "static") => {
    let datatype = "-";
    const genre = mtype === "static" ? prototype :
      `<span class="static ${prototype.toLowerCase()}">${prototype}</span>`;

    try {
      mtype === "static" && (datatype = getType(globalThis[type][method]));
      mtype === "method" && (datatype = getType(DATATYPES[type][method]));
    } catch (error) {}

    return /* html */`<tr>
      <td class="${datatype?.toLowerCase()}">${datatype}</td>
      <td>${genre}.${method}</td>
    </tr>`;
  }

  const table = document.createElement("table");
  table.innerHTML = /* html */`<table>
    <thead><tr><th colspan="2">${type}<br> <span>${ createButtons(chain) }</span></th></tr></thead>
    ${ Object.keys(statics).map(prototype => {
      return /* html */`<tbody class="${prototype} header">
      ${createHeader(prototype)}
      ${ statics[prototype]?.map(method => createRow(type, prototype, method, "static")).join("") }
      <tr class="subheader"><th colspan="2">Methods</th></tr>
      ${ methods[prototype]?.map(method => createRow(type, prototype, method, "method")).join("") }
      </tbody>`;
    }).join("") }

  </table>`;

  table.querySelector("input[type=radio]").checked = true;
  table.querySelector("tbody")?.classList.add("show");

  return table;
}

export const createTable = (type, container) => {
  const table = createDatatypeTable(type);
  container.append(table);

  const inputs = [...document.querySelectorAll("table input[type=radio]")];
  inputs.forEach(input => {
    const table = input.closest("table");
    input.addEventListener("click", () => {
      table.querySelectorAll("tbody").forEach(tbody => tbody.classList.remove("show"));
      table.querySelector(`tbody.${input.parentElement.textContent}`).classList.add("show");
    });
  });
}
