[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/paper-autocomplete.svg)](https://www.npmjs.com/package/@advanced-rest-client/paper-autocomplete)

[![Build Status](https://travis-ci.org/advanced-rest-client/paper-autocomplete.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/paper-autocomplete)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/paper-autocomplete)


# &lt;paper-autocomplete&gt;

Use `paper-autocomplete` to add autocomplete functionality to the input elements.
It also works wilt polymer inputs.

The element works with static list of suggestions or with dynamic (asynchronous)
operation that require calling te backend or local datastore.
In second case you should set `loader` property which will display a loader animation
while results are loaded.

You must associate suggestions with the input field. This can be done by passing
an element reference to the `target` property.

## Example:

### Static suggestions

```html
<paper-input label="Enter fruit name" id="fruits"></paper-input>
<paper-autocomplete id="fruitsSuggestions"></paper-autocomplete>
```

```javascript
const ac = document.getElementById('fruitsSuggestions');
ac.target = document.getElementById('fruits');
ac.source = ['Apple', 'Orange', 'Bananas'];
```

or defined in an attribute:

```html
<paper-autocomplete source='["Apple", "Orange", "Bananas"]'></paper-autocomplete>
```

### Dynamic suggestions

```html
<paper-input-container>
  <label>Enter friut name</label>
  <iron-input slot="input">
    <input id="asyncField">
  </iron-input>
</paper-input-container>
<paper-autocomplete loader id="fruitAsync" on-query="_asyncSuggestions"></paper-autocomplete>
```

```javascript
const ac = document.querySelector('#fruitAsync');
ac.target = document.querySelector('#asyncField');
ac.addEventListener('query', (e) => {
  const query = e.detail.value;
  // some function go get results.
  asyncQuery(query, (suggestions) => {
    e.target.source = suggestions;
  });
});
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/paper-autocomplete
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import './node_modules/@advanced-rest-client/paper-autocomplete/paper-autocomplete.js';
    </script>
  </head>
  <body>
    <paper-autocomplete></paper-autocomplete>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from './node_modules/@polymer/polymer/polymer-element.js';
import './node_modules/@advanced-rest-client/paper-autocomplete/paper-autocomplete.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <paper-autocomplete></paper-autocomplete>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/paper-autocomplete
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```


## Rendering the suggestions

Suggestions array can be either an array of strings or objects.
For strings, displayed in the list and inserted to the input field value is the same item.

You can set different list item display value and value inserted into the field when the array contains
onject. Each object must contain `value` and `display` properties where `value` property
will be inserted into the text field and `display` will be used to display description inside the list.

## Query event

The `query` event is fired when the user query change in the way so the element is
not able to render suggestions properly.
This means if the user add a letter to previously entered value the query event will not
fire since it already have list of suggestion that should be used to filter suggestions from.
And again when the user will delete a letter the element will still have list of
source suggestions to filter suggestions from.
However, if the user change the query entirely it will fire `query` event
and the app will expect to `source` to change. Setting source is not mandatory.

## Preventing from changing the input value

To prevent the element to update the value of the target input, listent for
`selected` event and cancel it by calling `event.preventDefault()` function.
