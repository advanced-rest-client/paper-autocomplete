/*
Copyright 2019 Pawel Psztyc, The ARC team

Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html, css } from 'lit-element';
import { ArcScrollTargetMixin } from '@advanced-rest-client/arc-scroll-target-mixin/arc-scroll-target-mixin.js';
import { ArcOverlayMixin } from '@advanced-rest-client/arc-overlay-mixin/arc-overlay-mixin.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-styles/shadow.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/iron-a11y-keys/iron-a11y-keys.js';
import '@polymer/paper-progress/paper-progress.js';
/**
 * # `<paper-autocomplete>`
 *
 * Use `paper-autocomplete` to add autocomplete functionality to the input elements.
 * It also works wilt polymer inputs.
 *
 * The element works with static list of suggestions or with dynamic (asynchronous)
 * operation that require calling te backend or local datastore.
 * In second case you should set `loader` property which will display a loader animation
 * while results are loaded.
 *
 * You must associate suggestions with the input field. This can be done by passing
 * an element reference to the `target` property.
 *
 * ## Example:
 *
 * ### Static suggestions
 *
 * ```html
 * <paper-input label="Enter fruit name" id="fruits"></paper-input>
 * <paper-autocomplete
 *  id="fruitsSuggestions"
 *  target="[[fruits]]"
 *  on-selected="_fruitSelected"></paper-input-autocomplete>
 *
 * <script>
 * document.querySelector('#fruitsSuggestions').source = ['Apple', 'Orange', 'Bananas'];
 * < /script>
 * ```
 *
 * ### Dynamic suggestions
 *
 * ```html
 * <paper-input-container>
 *  <label>Enter friut name</label>
 *  <input is="iron-input" type="text" value="{{async::input}}" id="asyncField" />
 * </paper-input-container>
 * <paper-autocomplete loader id="fruitAsync" on-query="_asyncSuggestions"></paper-input-autocomplete>
 *
 * <script>
 *  document.querySelector('#fruitAsync').target = document.querySelector('#asyncField');
 *  document.querySelector('#fruitAsync').addEventListener('query', (e) => {
 *    const query = e.detail.value;
 *    asyncQuery(query, (suggestions) => {
 *      document.querySelector('#fruitAsync').source = suggestions;
 *    });
 *  });
 * < /script>
 * ```
 *
 * ## Displaying the suggestions
 *
 * Suggestions array can be either an array of strings or objects.
 * For strings, displayed in the list and inserted to the input field value is the same item.
 *
 * You can set different list item display value and value inserted into the field when the array contains
 * onject. Each object must contain `value` and `display` properties where `value` property
 * will be inserted into the text field and `display` will be used to display description inside the list.
 *
 * ## Query event
 *
 * The `query` event is fired when the user query change in the way so the element is
 * not able to display suggestions properly.
 * This means if the user add a letter to previously entered value the query event will not
 * fire since it already have list of suggestion that should be used to filter suggestions from.
 * And again when the user will delete a letter the element will still have list of
 * source suggestions to filter suggestions from.
 * However, if the user change the query entirely it will fire `query` event
 * and the app will expect to `source` to change. Setting source is not mandatory.
 *
 * ## Preventing from changing the input value
 *
 * To prevent the element to update the value of the target input, listent for
 * `selected` event and cancel it by calling `event.preventDefault()` function.
 *
 * ## Styling
 *
 * Suggestions are positioned absolutely! You must include relative positioned parent to contain the suggestion
 * display in the same area.
 * Use CSS properties to position the display in the left bottom corner of the input field.
 *
 * `<paper-autocomplete>` provides the following custom properties and mixins
 * for styling:
 *
 * | Custom property | Description | Default |
 * ----------------|-------------|----------
 * | `--paper-autocomplete` | Mixin applied to the display | `{}` |
 * | `--paper-autocomplete-background-color` | Background color of suggestions | `{}` |
 *
 * @customElement
 * @memberof UiElements
 * @polymerBehavior IronOverlayBehavior
 * @polymerBehavior IronScrollTargetBehavior
 * @polymer
 * @demo demo/index.html
 */
export class PaperAutocomplete extends ArcOverlayMixin(ArcScrollTargetMixin(LitElement)) {
  static get styles() {
    return css`:host {
      position: absolute !important;
      left: 0px;
      top: 52px;
    }

    .dropdown-container {
      overflow: auto;
      box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
                  0 1px 10px 0 rgba(0, 0, 0, 0.12),
                  0 2px 4px -1px rgba(0, 0, 0, 0.4);
      background-color: var(--paper-autocomplete-background-color, #fff);
    }`;
  }

  render() {
    const { loader, _loading, selectedItem } = this;
    let { _suggestions, noink, target } = this;
    if (!_suggestions) {
      _suggestions = [];
    }
    if (noink === undefined) {
      noink = false;
    }
    if (typeof target === 'string') {
      target = undefined;
    }
    const _showLoader = !!loader && !!_loading;
    return html`<div class="dropdown-container">
    ${_showLoader ? html`<paper-progress indeterminate></paper-progress>` : undefined}
      <iron-selector .selected="${selectedItem}" @selected-changed="${this._selectedHandler}">
      ${_suggestions.map((item) => html`<paper-item>
        <div>${item.value || item}</div>
        <paper-ripple ?noink="${noink}"></paper-ripple>
      </paper-item>`)}
      </iron-selector>
    </div>
    <iron-a11y-keys .target="${target}" keys="up" @keys-pressed="${this.selectPrevious}"></iron-a11y-keys>
    <iron-a11y-keys .target="${target}" keys="down" @keys-pressed="${this.selectNext}"></iron-a11y-keys>
    <iron-a11y-keys .target="${target}" keys="enter" @keys-pressed="${this.acceptSelection}"></iron-a11y-keys>
    <iron-a11y-keys .target="${this}" keys="up" @keys-pressed="${this.selectPrevious}"></iron-a11y-keys>
    <iron-a11y-keys .target="${this}" keys="down" @keys-pressed="${this.selectNext}"></iron-a11y-keys>
    <iron-a11y-keys .target="${this}" keys="enter" @keys-pressed="${this.acceptSelection}"></iron-a11y-keys>`;
  }

  static get properties() {
    return {
      /**
       * List of suggestions to display.
       * If the array items are strings they will be used for display a suggestions and
       * to insert a value.
       * If the list is an object the each object must contain `value` and `display`
       * properties.
       * The `display` property will be used in the suggestions list and the
       * `value` property will be used to insert the value to the referenced text field.
       *
       * @type {Array<Object>|Array<String>}
       */
      source: { type: Array },
      /**
       * `value` Selected object from the suggestions
       */
      value: { type: Object },
      /**
       * List of suggestion that are rendered.
       */
      _suggestions: { type: Array },
      /**
       * A target input field to observe.
       * @type {HTMLElement}
       */
      target: { type: Object },
      /**
       * Currently selected item on a suggestions list.
       * @type {Number}
       */
      selectedItem: { type: Number },
      /**
       * Scroll target element
       * @type {HTMLElement}
       */
      scrollTarget: { type: Object },
      /**
       * Sizing target element.
       * @type {HTMLElement}
       */
      sizingTarget: { type: Object },
      /**
       * True when user query changed and waiting for `source` property update
       */
      _loading: { type: Boolean },
      /**
       * Set this to true if you use async operation in response for query event.
       * This will display a loader when querying for more suggestions.
       * Do not use it it you do not handle suggestions asynchronously.
       */
      loader: { type: Boolean, reflect: true },

      isAttached: { type: Boolean },
      /**
       * If true it will opend suggestions on input field focus.
       */
      openOnFocus: { type: Boolean },
      /**
       * this property is set when the `target` changes. It is used to remove
       * listeners.
       * @type {HTMLElement}
       */
      _oldTarget: { type: Object },
      // Compatibility with polymer attributes
      _oldOpenOnFocus: { type: Boolean, attribute: 'open-on-focus' },
      _oldSizingTarget: { type: Boolean, attribute: 'sizing-target' },
      _oldScrollTarget: { type: Boolean, attribute: 'scroll-target' },
      _oldSelectedItem: { type: Boolean, attribute: 'selected-item' }
    };
  }

  get value() {
    return this._value;
  }

  set value(value) {
    const old = this._value;
    if (old === value) {
      return;
    }
    this._value = value;
    this.dispatchEvent(new CustomEvent('value-chanegd', {
      detail: {
        value
      }
    }));
  }
  /**
   * @return {Array<String>|Array<Object>} List of suggestion that are rendered.
   */
  get suggestions() {
    return this._suggestions;
  }
  /**
   * @return {Boolean} True when user query changed and waiting for `source` property update
   */
  get loading() {
    return this._loading;
  }

  get _loading() {
    return this.__loading;
  }

  set _loading(value) {
    const old = this.__loading;
    if (old === value) {
      return;
    }
    this.__loading = value;
    this.requestUpdate('_loading', value);
    this.dispatchEvent(new CustomEvent('loading-chanegd', {
      detail: {
        value
      }
    }));
  }

  get _oldOpenOnFocus() {
    return this.openOnFocus;
  }

  set _oldOpenOnFocus(value) {
    this.openOnFocus = value;
  }

  get _oldSizingTarget() {
    return this.sizingTarget;
  }

  set _oldSizingTarget(value) {
    this.sizingTarget = value;
  }

  get _oldScrollTarget() {
    return this.scrollTarget;
  }

  set _oldScrollTarget(value) {
    this.scrollTarget = value;
  }

  get _oldSelectedItem() {
    return this.selectedItem;
  }

  set _oldSelectedItem(value) {
    this.selectedItem = value;
  }

  get target() {
    return this._target;
  }

  set target(value) {
    const old = this._target;
    if (old === value) {
      return;
    }
    this._target = value;
    this.requestUpdate('target', value);
    this._targetChanged();
  }

  get isAttached() {
    return this._isAttached;
  }

  set isAttached(value) {
    const old = this._isAttached;
    if (old === value) {
      return;
    }
    this._isAttached = value;
    this._targetChanged();
    this._filterSuggestions();
  }

  get source() {
    return this._source;
  }

  set source(value) {
    const old = this._source;
    if (old === value) {
      return;
    }
    this._source = value;
    this._filterSuggestions();
  }

  get _oldTarget() {
    return this.__oldTarget;
  }

  set _oldTarget(value) {
    const old = this.__oldTarget;
    if (old === value) {
      return;
    }
    this.__oldTarget = value;
    this._filterSuggestions();
  }
  /**
   * @return {Function} Previously registered handler for `query` event
   */
  get onquery() {
    return this._onquery || null;
  }
  /**
   * Registers a callback function for `query` event
   * @param {Function} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onquery(value) {
    this._registerCallback('query', value);
  }
  /**
   * @return {Function} Previously registered handler for `selected` event
   */
  get onselected() {
    return this._onselected || null;
  }
  /**
   * Registers a callback function for `selected` event
   * @param {Function} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onselected(value) {
    this._registerCallback('selected', value);
  }

  get _selector() {
    return this.shadowRoot.querySelector('iron-selector');
  }

  /**
   * @constructor
   */
  constructor() {
    super();
    this.acceptSelection = this.acceptSelection.bind(this);
    this._valueChanged = this._valueChanged.bind(this);
    this._targetFocus = this._targetFocus.bind(this);

    this._suggestions = [];
    this._loading = false;
    this.loader = false;
    this.openOnFocus = false;
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.addEventListener('click', this.acceptSelection);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.removeEventListener('click', this.acceptSelection);
  }

  firstUpdated() {
    const target = this.shadowRoot.querySelector('.dropdown-container');
    this.scrollTarget = target;
    this.sizingTarget = target;
  }

  _registerCallback(eventType, value) {
    const key = `_on${eventType}`;
    if (this[key]) {
      this.removeEventListener(eventType, this[key]);
    }
    if (typeof value !== 'function') {
      this[key] = null;
      return;
    }
    this[key] = value;
    this.addEventListener(eventType, value);
  }

  /**
   * Handler for target property change.
   */
  _targetChanged() {
    const { target, isAttached } = this;
    if (this._oldTarget) {
      this._oldTarget.removeEventListener('input', this._valueChanged);
      this._oldTarget.removeEventListener('focus', this._targetFocus);
      this._oldTarget = null;
    }
    if (!isAttached || !target) {
      return;
    }
    this.resetFit();
    if (typeof target === 'string') {
      const parent = this.parentElement;
      if (!parent || !parent.querySelector) {
        return;
      }
      const node = parent.querySelector(target);
      if (node) {
        this.target = node;
        return;
      }
    } else if (target) {
      target.addEventListener('input', this._valueChanged);
      target.addEventListener('focus', this._targetFocus);
      this._oldTarget = target;
      if (target === document.activeElement) {
        this._targetFocus();
      }
    }
  }
  /**
   * Handler for target input change.
   */
  _valueChanged() {
    if (!this.isAttached || !this._oldTarget) {
      return;
    }
    const value = this._oldTarget.value;
    if (typeof value !== 'string') {
      return;
    }
    if (this._previousQuery) {
      if (value.indexOf(this._previousQuery) === 0) {
        this._previousQuery = value;
        this._filterSuggestions();
        return;
      } else {
        // this is a new query
        this._previousQuery = null;
        this._suggestions = [];
      }
    }
    this._disaptchQuery(value);
    this._previousQuery = value;
    this._filterSuggestions();
    this._loading = true;
    if (this.loader) {
      this.opened = true;
    }
  }
  /**
   * Disaptches query event and returns it.
   * @param {String} value Current input value.
   * @return {CustomEvent}
   */
  _disaptchQuery(value) {
    const e = new CustomEvent('query', {
      detail: {
        value
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Filter `source` array for current value.
   */
  _filterSuggestions() {
    if (!this.isAttached || !this._oldTarget || this._previousQuery === undefined) {
      return;
    }
    this._loading = false;
    const source = this.source;
    if (!source) {
      this._suggestions = [];
      return;
    }
    const query = this._previousQuery ? this._previousQuery.toLowerCase() : '';
    const filter = function(item) {
      const value = (typeof item === 'string') ? item : item.value;
      return value.toLowerCase().indexOf(query) !== -1;
    };
    const filtered = query ? source.filter(filter) : source;
    if (filtered.length === 0) {
      this.opened = false;
      return;
    }
    filtered.sort(function(a, b) {
      const valueA = (typeof a === 'string') ? a : a.value;
      const valueB = (typeof b === 'string') ? b : b.value;
      const lowerA = valueA.toLowerCase();
      const lowerB = valueB.toLowerCase();
      const aIndex = lowerA.indexOf(query);
      const bIndex = lowerB.indexOf(query);
      if (aIndex === bIndex) {
        return valueA.localeCompare(valueB);
      }
      if (aIndex === 0 && bIndex !== 0) {
        return -1;
      }
      if (bIndex === 0 && aIndex !== 0) {
        return 1;
      }
      if (valueA > valueB) {
        return 1;
      }
      if (valueA < valueB) {
        return -1;
      }
      return valueA.localeCompare(valueB);
    });
    this._suggestions = filtered;
    this.notifyResize();
    this.opened = true;
  }
  /**
   * Highlight previous suggestion
   */
  selectPrevious() {
    const { suggestions } = this;
    if (!suggestions || !suggestions.length) {
      return;
    }
    if (!this.opened) {
      this.opened = true;
    }
    this._selector.selectPrevious();
    this.ensureItemVisible(false);
  }
  /**
   * Highlight next suggestion
   */
  selectNext() {
    const { suggestions } = this;
    if (!suggestions || !suggestions.length) {
      return;
    }
    if (!this.opened) {
      this.opened = true;
    }
    this._selector.selectNext();
    this.ensureItemVisible(true);
  }
  /**
   * Accepts currently selected suggestion and enters it into a text field.
   */
  acceptSelection() {
    const { suggestions, _selector, opened } = this;
    if (!opened || !suggestions || !suggestions.length || !_selector.selectedItem) {
      return;
    }
    const index = _selector.selected;
    let value = suggestions[index];
    if (typeof value !== 'string' && typeof value.value !== 'undefined') {
      value = value.value;
    }
    value = String(value);
    setTimeout(() => this._inform(value), 1);
  }
  /**
   * Dispatches `selected` event with new value.
   *
   * @param {String} value Selected value.
   */
  _inform(value) {
    const ev = new CustomEvent('selected', {
      detail: {
        value
      },
      cancelable: true
    });
    this.dispatchEvent(ev);
    if (!ev.defaultPrevented) {
      this.target.value = value;
    }
    this.close();
  }
  /**
   * Ensure that the selected item is visible in the scroller.
   * When there is more elements to show than space available (height)
   * then some elements will be hidden. When the user use arrows to navigate
   * the selection may get out from the screen. This function ensures that
   * currently selected element is visible.
   *
   * @param {Boolean} bottom If trully it will ensure that the element is
   * visible at the bottom of the container. On the top otherwise.
   */
  ensureItemVisible(bottom) {
    if (!this.opened || !this.suggestions || !this.suggestions.length) {
      return;
    }
    const container = this.scrollTarget;
    const index = this._selector.selected;
    if (bottom && index === 0) {
      this.scroll(0);
      return;
    }
    let toMove;
    if (!bottom && index === this.suggestions.length - 1) {
      toMove = container.scrollHeight - container.offsetHeight;
      this.scroll(0, toMove);
      return;
    }
    const item = this._selector.selectedItem;
    const containerOffsetHeight = bottom ? container.offsetHeight : 0;
    const itemOffsetHeight = bottom ? item.offsetHeight : 0;
    const visible = containerOffsetHeight + container.scrollTop;
    const treshold = item.offsetTop + itemOffsetHeight;

    if (bottom && treshold > visible) {
      toMove = item.offsetHeight + item.offsetTop - container.offsetHeight;
      this.scroll(0, toMove);
    } else if (!bottom && visible > treshold) {
      this.scroll(0, treshold);
    }
  }
  /**
   * Handler for target element focus event.
   * Opens the autocomplete if `openOnFocus` is set.
   */
  _targetFocus() {
    if (!this.openOnFocus || this.opened || this.__autocompleteFocus) {
      return;
    }
    this.__autocompleteFocus = true;
    setTimeout(() => {
      this.__autocompleteFocus = false;
      this._valueChanged();
    });
  }
  /**
   * Overrides ArcOverlayMixin#_onCaptureClick. Cancels when the clock target is
   * the input.
   * @param {Event} e Original click event
   */
  _onCaptureClick(e) {
    if (e.target=== this._oldTarget) {
      return;
    }
    super._onCaptureClick(e);
  }
  /**
   * Handler for `selected-changed` event on `iron-selector`.
   * @param {CustomEvent} e
   */
  _selectedHandler(e) {
    this.selectedItem = e.detail.value;
  }
}
/**
 * Fired when user entered some text into the input.
 * It is a time to query external datastore for suggestions and update "source" property.
 * Source should be updated event if the backend result with empty values and should set
 * the list to empty array.
 *
 * Nore that setting up source in response to this event after the user has closed
 * the dropdown it will have no effect at the moment.
 *
 * @event query
 * @param {String} value An entered phrase in text field.
 */
/**
 * Fired when the item was selected by the user.
 * At the time of receiving this event new value is already set in target input field.
 *
 * @event selected
 * @param {String} value Selected value
 */
window.customElements.define('paper-autocomplete', PaperAutocomplete);
