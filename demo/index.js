import { html, render } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-input/iron-input.js';
import 'chance/chance.js';
import '../paper-autocomplete.js';

/* global chance */

const suggestions = ['Apple', 'Apricot', 'Avocado',
  'Banana', 'Bilberry', 'Blackberry', 'Blackcurrant', 'Blueberry',
  'Boysenberry', 'Cantaloupe', 'Currant', 'Cherry', 'Cherimoya',
  'Cloudberry', 'Coconut', 'Cranberry', 'Damson', 'Date', 'Dragonfruit',
  'Durian', 'Elderberry', 'Feijoa', 'Fig', 'Goji berry', 'Gooseberry',
  'Grape', 'Grapefruit', 'Guava', 'Huckleberry', 'Jabuticaba', 'Jackfruit',
  'Jambul', 'Jujube', 'Juniper berry', 'Kiwi fruit', 'Kumquat', 'Lemon',
  'Lime', 'Loquat', 'Lychee', 'Mango', 'Marion berry', 'Melon', 'Miracle fruit',
  'Mulberry', 'Nectarine', 'Olive', 'Orange'
];

const list = [{
  name: 'Apple'
},
{
  name: 'Damson'
},
{
  name: 'Feijoa'
},
{
  name: 'Mango'
},
{
  name: 'Olive'
}
];

class DemoPage {
  get fruitsSuggestions() {
    return document.getElementById('fruitsSuggestions');
  }
  get fruits() {
    return document.getElementById('fruits');
  }
  get fruitsSuggestions2() {
    return document.getElementById('fruitsSuggestions2');
  }
  get fruits2() {
    return document.getElementById('fruits2');
  }
  get fruitExternal() {
    return document.getElementById('fruitExternal');
  }
  get externalField() {
    return document.getElementById('externalField');
  }
  get fruitsPositioned() {
    return document.getElementById('fruitsPositioned');
  }
  get positionedField() {
    return document.getElementById('positionedField');
  }

  get queryCounter() {
    return this._queryCounter;
  }

  set queryCounter(value) {
    this._queryCounter = value;
    document.getElementById('queryCounter').innerText = value;
  }

  get selectedCounter() {
    return this._selectedCounter;
  }

  set selectedCounter(value) {
    this._selectedCounter = value;
    document.getElementById('selectedCounter').innerText = value;
  }

  constructor() {
    this._queryCounter = 0;
    this._selectedCounter = 0;

    this.removeItem = this.removeItem.bind(this);
    this.inputFocus = this.inputFocus.bind(this);
    this.inputHandler = this.inputHandler.bind(this);
    this.appendListItem = this.appendListItem.bind(this);
  }

  init() {
    const { fruitsSuggestions, fruitsSuggestions2, fruitExternal, fruitsPositioned, positionedField } = this;
    fruitsSuggestions.source = suggestions;
    fruitsSuggestions.onquery = this._queryCalled.bind(this);
    fruitsSuggestions.onselected = this._selectedCalled.bind(this);
    fruitsSuggestions.target = this.fruits;

    fruitsSuggestions2.source = suggestions;
    fruitsSuggestions2.target = this.fruits2;

    fruitExternal.target = this.externalField;
    fruitExternal.onquery = this._asyncSuggestions.bind(this);

    fruitsPositioned.target = positionedField;
    fruitsPositioned.positionTarget = positionedField;
    fruitsPositioned.source = suggestions;
  }

  _queryCalled() {
    this.queryCounter++;
  }

  _selectedCalled() {
    this.selectedCounter++;
  }

  _asyncSuggestions(e) {
    const { value } = e.detail;
    setTimeout(() => {
      const suggestions = [];
      for (let i = 0; i < 25; i++) {
        suggestions.push(value + '' + chance.word());
      }
      e.target.source = suggestions;
    }, 700);
  }

  removeItem(e) {
    const index = Number(e.target.dataset.index);
    list.splice(index, 1);
    this.render();
  }

  inputFocus(e) {
    const index = Number(e.target.dataset.index);
    const elm = document.querySelector(`.form-row:nth-child(${index + 1}) paper-autocomplete`);
    if (!elm) {
      return;
    }
    elm.target = e.target;
  }

  inputHandler(e) {
    const index = Number(e.target.dataset.index);
    list[index].name = e.target.value;
  }

  appendListItem() {
    list.push({
      name: ''
    });
    this.render();
  }

  render() {
    render(html`<div class="form">
    ${list.map((item, index) => html`<div class="form-row relative">
      <input
        type="text"
        placeholder="Fruit name"
        data-index="${index}" .value="${item.name}" @focus="${this.inputFocus}" @input="${this.inputHandler}">
      <paper-button title="Remove fruit" data-index="${index}" @click="${this.removeItem}">remove</paper-button>
      <paper-autocomplete openonfocus .source="${suggestions}"></paper-autocomplete>
    </div>`)}
    </div>
    <paper-button raised @click="${this.appendListItem}">Add</paper-button>`, document.querySelector('#dynamicDemo'));
  }
}
const demo = new DemoPage();
demo.init();
demo.render();
window.__demo = demo;
