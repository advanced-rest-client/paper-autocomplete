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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {afterNextRender} from '../../@polymer/polymer/lib/utils/render-status.js';
import {IronOverlayBehavior} from '../../@polymer/iron-overlay-behavior/iron-overlay-behavior.js';
import {IronScrollTargetBehavior} from '../../@polymer/iron-scroll-target-behavior/iron-scroll-target-behavior.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
import {mixinBehaviors} from '../../@polymer/polymer/lib/legacy/class.js';
import '../../@polymer/paper-item/paper-item.js';
import '../../@polymer/paper-ripple/paper-ripple.js';
import '../../@polymer/paper-styles/shadow.js';
import '../../@polymer/iron-selector/iron-selector.js';
import '../../@polymer/iron-a11y-keys/iron-a11y-keys.js';
import '../../@polymer/paper-progress/paper-progress.js';
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
class PaperAutocomplete extends
  mixinBehaviors(
    [IronOverlayBehavior, IronScrollTargetBehavior], PolymerElement) {
  static get template() {
    return html`
    <style>
    :host {
      position: absolute !important;
      left: 0px;
      top: 52px;
      @apply --paper-autocomplete;
    }

    .dropdown-container {
      overflow: auto;
      @apply --shadow-elevation-4dp;
      background-color: var(--paper-autocomplete-background-color, #fff);
    }
    </style>
    <div id="container" class="dropdown-container">
      <paper-progress hidden\$="[[!_showLoader]]" indeterminate=""></paper-progress>
      <iron-selector selected="{{selectedItem}}" id="selector">
        <template is="dom-repeat" items="{{suggestions}}" id="repeater">
          <paper-item>
            <div>{{_suggestionDisplay(item)}}</div>
            <paper-ripple></paper-ripple>
          </paper-item>
        </template>
      </iron-selector>
    </div>
    <iron-a11y-keys id="a11y" target="[[target]]" keys="up" on-keys-pressed="selectPrevious"></iron-a11y-keys>
    <iron-a11y-keys id="a11y" target="[[target]]" keys="down" on-keys-pressed="selectNext"></iron-a11y-keys>
    <iron-a11y-keys id="a11y" target="[[target]]" keys="enter" on-keys-pressed="acceptSelection"></iron-a11y-keys>
    <iron-a11y-keys id="a11y" target="[[_keyTarget]]" keys="up" on-keys-pressed="selectPrevious"></iron-a11y-keys>
    <iron-a11y-keys id="a11y" target="[[_keyTarget]]" keys="down" on-keys-pressed="selectNext"></iron-a11y-keys>
    <iron-a11y-keys id="a11y" target="[[_keyTarget]]" keys="enter" on-keys-pressed="acceptSelection"></iron-a11y-keys>
`;
  }

  static get is() {
    return 'paper-autocomplete';
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
      source: {
        type: Array
      },
      /**
       * `value` Selected object from the suggestions
       */
      value: {
        type: Object,
        notify: true
      },
      /**
       * List of suggestion that are displayed.
       */
      suggestions: {
        type: Array,
        value: [],
        readOnly: true
      },
      /**
       * A target input field to observe.
       * @type {HTMLElement}
       */
      target: HTMLElement,
      /**
       * Currently selected item on a suggestions list.
       * @type {Number}
       */
      selectedItem: {
        type: Number,
        value: 0
      },
      // Scroll target element
      scrollTarget: {
        type: HTMLElement
      },
      // Sizing target element.
      sizingTarget: {
        type: HTMLElement
      },
      /**
       * True when user query changed and waiting for `source` property update
       */
      loading: {
        type: Boolean,
        value: false,
        readOnly: true,
        notify: true
      },
      /**
       * Set this to true if you use async operation in response for query event.
       * This will display a loader when querying for more suggestions.
       * Do not use it it you do not handle suggestions asynchronously.
       */
      loader: {
        type: Boolean,
        value: false
      },

      _showLoader: {
        type: Boolean,
        computed: '_computeShowLoader(loader, loading)'
      },

      isAttached: Boolean,

      // If true it will opend suggestions on input field focus.
      openOnFocus: {
        type: Boolean,
        value: false
      },
      // this property is set when the `target` changes. It is used to remove
      // listeners.
      _oldTarget: HTMLElement,
      // An event target for key down event.
      _keyTarget: {
        type: HTMLElement,
        value: function() {
          return this;
        }
      }
    };
  }

  static get observers() {
    return [
      '_targetChanged(target, isAttached)',
      '_filterSuggestions(source, _oldTarget, isAttached)'
    ];
  }
  /**
   * @constructor
   */
  constructor() {
    super();
    this.acceptSelection = this.acceptSelection.bind(this);
    this._valueChanged = this._valueChanged.bind(this);
    this._targetFocus = this._targetFocus.bind(this);
    this._targetClick = this._targetClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('tap', this.acceptSelection);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('tap', this.acceptSelection);
  }

  ready() {
    super.ready();
    const target = this.shadowRoot.querySelector('#container');
    if (!this.scrollTarget) {
      this.scrollTarget = target;
    }
    if (!this.sizingTarget) {
      this.sizingTarget = target;
    }
    this.resetFit();
  }

  /**
   * Handler for target property change.
   *
   * @param {HTMLElement} target Target input element
   * @param {Boolean} isAttached True if this element is attached to the DOM.
   */
  _targetChanged(target, isAttached) {
    if (this._oldTarget) {
      this._oldTarget.removeEventListener('input', this._valueChanged);
      this._oldTarget.removeEventListener('focus', this._targetFocus);
      this._oldTarget.removeEventListener('click', this._targetClick);
      this._oldTarget = null;
    }
    if (!isAttached || !target) {
      return;
    }
    this.resetFit();
    if (typeof target === 'string') {
      throw new Error('Target must be an element');
    } else if (target) {
      target.addEventListener('input', this._valueChanged);
      target.addEventListener('focus', this._targetFocus);
      target.addEventListener('click', this._targetClick);
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
    if (this._previousQuery) {
      if (value.indexOf(this._previousQuery) === 0) {
        this._previousQuery = value;
        this._filterSuggestions();
        return;
      } else {
        // this is a new query
        this._previousQuery = null;
        this._setSuggestions([]);
      }
    }
    this._disaptchQuery(value);
    this._previousQuery = value;
    if (!this.opened) {
      this.selectedItem = 0;
    }
    this._filterSuggestions();
    this._setLoading(true);
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
    this._setLoading(false);
    const source = this.source;
    if (!source) {
      this._setSuggestions([]);
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
    this._setSuggestions(filtered);
    this.notifyResize();
    this._ensureSelection();
    this.opened = true;
  }
  /* Compute suggestion display value */
  _suggestionDisplay(item) {
    return item.value || item;
  }
  /**
   * Highlight previous suggestion
   */
  selectPrevious() {
    if (!this.suggestions || !this.suggestions.length) {
      return;
    }
    if (!this.opened) {
      this.opened = true;
    }
    this.$.selector.selectPrevious();
    this.ensureItemVisible(false);
  }
  /**
   * Highlight next suggestion
   */
  selectNext() {
    if (!this.suggestions || !this.suggestions.length) {
      return;
    }
    if (!this.opened) {
      this.opened = true;
    }
    this.$.selector.selectNext();
    this.ensureItemVisible(true);
  }
  /**
   * Accepts currently selected suggestion and enters it into a text field.
   */
  acceptSelection() {
    if (!this.opened || !this.suggestions || !this.suggestions.length ||
      !this.$.selector.selectedItem) {
      return;
    }
    let value = this.$.repeater.itemForElement(this.$.selector.selectedItem);
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
    const index = this.$.selector.selected;
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
    const item = this.$.selector.selectedItem;
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
   * Computes value for `_showLoader` property.
   *
   * @param {Boolean} loader
   * @param {Boolean} loading
   * @return {Boolean} True if the loader should be rendered.
   */
  _computeShowLoader(loader, loading) {
    return !!loader && !!loading;
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
    afterNextRender(this, () => {
      this.__autocompleteFocus = false;
      this._valueChanged();
    });
  }
  /**
   * Prohibits click event propagation when the overlay is opened so
   * the overlay manager won't close it immidietly after focusing (with click
   * event included) in the target field.
   *
   * @param {ClickEvent} e
   */
  _targetClick(e) {
    if (!this.opened) {
      return;
    }
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
  /**
   * Selects a first available item after filtering results and missing
   * selection.
   */
  _ensureSelection() {
    if (this.$.selector.selectedItem) {
      return;
    }
    this.$.selector.selected = 0;
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
window.customElements.define(PaperAutocomplete.is, PaperAutocomplete);