import { fixture, assert, aTimeout, nextFrame, html } from '@open-wc/testing';
import sinon from 'sinon/pkg/sinon-esm.js';
import '../paper-autocomplete.js';

describe('<paper-autocomplete>', () => {
  const suggestions = ['Apple', 'Apricot', 'Avocado', 'Banana'];
  const objectSuggestions = [
    {
      value: 'Apple',
      id: 1,
    },
    {
      value: 'Apricot',
      id: 2,
    },
    {
      value: 'Avocado',
      id: 3,
    },
    {
      value: 'Banana',
      id: 4,
    },
    {
      value: 'Olive',
      id: 5,
    },
  ];

  function notifyInput(target) {
    const e = document.createEvent('Event');
    e.initEvent('input', true, false);
    target.dispatchEvent(e);
  }

  async function basicFixture() {
    return await fixture(`<paper-autocomplete></paper-autocomplete>`);
  }

  async function suggestionsFixture() {
    return await fixture(html`
      <div>
        <input id="f1" />
        <paper-autocomplete target="f1" .source="${suggestions}"></paper-autocomplete>
      </div>
    `);
  }

  async function loaderFixture() {
    return await fixture(html`
      <div>
        <input id="f2" />
        <paper-autocomplete loader target="f2"></paper-autocomplete>
      </div>
    `);
  }

  async function stringTargetFixture() {
    return await fixture(`<div><input id="f2">
    <paper-autocomplete target="f2"></paper-autocomplete></div>`);
  }

  describe('Initialization', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('has empty _suggestions', () => {
      assert.deepEqual(element._suggestions, []);
    });

    it('has default loader', () => {
      assert.isFalse(element.loader);
    });

    it('has default _loading', () => {
      assert.isFalse(element._loading);
    });

    it('has default openOnFocus', () => {
      assert.isFalse(element.openOnFocus);
    });

    it('has scrollTarget set', () => {
      const node = element.shadowRoot.querySelector('.dropdown-container');
      assert.isTrue(node === element.scrollTarget);
    });

    it('has sizingTarget set', () => {
      const node = element.shadowRoot.querySelector('.dropdown-container');
      assert.isTrue(node === element.sizingTarget);
    });
  });

  describe('User input', () => {
    let element;
    let input;
    beforeEach(async () => {
      const region = await suggestionsFixture();
      element = region.querySelector('paper-autocomplete');
      input = region.querySelector('input');
    });

    it('sets _previousQuery', function() {
      input.value = 'test';
      notifyInput(input);
      assert.equal(input.value, element._previousQuery);
    });

    it('dispatches query event', function() {
      const spy = sinon.spy();
      element.addEventListener('query', spy);
      input.value = 'test';
      notifyInput(input);
      assert.equal(spy.args[0][0].detail.value, 'test');
    });

    it('filters suggestions', function() {
      const word = 'TEST';
      element.addEventListener('query', function f(e) {
        e.target.removeEventListener('query', f);
        e.target.source = [word, word + '2', 'etra73hxis'];
      });
      input.value = 'test';
      notifyInput(input);
      assert.lengthOf(element.suggestions, 2);
    });
  });

  describe('_targetChanged()', () => {
    it('Recognizes target by id', async () => {
      const fix = await stringTargetFixture();
      const element = fix.querySelector('paper-autocomplete');
      const input = fix.querySelector('input');
      assert.isTrue(element._oldTarget === input);
      assert.isTrue(element.target === input);
    });

    it('calls resetFit()', async () => {
      const element = await basicFixture();
      const input = document.createElement('input');
      const spy = sinon.spy(element, 'resetFit');
      element.target = input;
      assert.isTrue(spy.called);
    });

    it('ignores string attribute when no parent', async () => {
      const region = await fixture(`<div>
        <input id="r1">
        <paper-autocomplete></paper-autocomplete>
      </div>`);
      const element = region.querySelector('paper-autocomplete');
      const parent = element.parentElement;
      parent.removeChild(element);
      element.target = 'r1';
      assert.equal(element.target, 'r1');
    });

    it('reinitializes parent when re-attached to the dom', async () => {
      const region = await fixture(`<div>
        <input id="r1">
        <paper-autocomplete></paper-autocomplete>
      </div>`);
      const element = region.querySelector('paper-autocomplete');
      const parent = element.parentElement;
      parent.removeChild(element);
      element.target = 'r1';
      parent.appendChild(element);
      const input = region.querySelector('input');
      assert.isTrue(element.target === input);
    });

    it('removes listeners from old target', async () => {
      const region = await fixture(`<div>
        <input id="i1">
        <input id="i2">
        <paper-autocomplete target="r1"></paper-autocomplete>
      </div>`);
      const element = region.querySelector('paper-autocomplete');
      const i1 = region.querySelector('#i1');
      element.target = 'i2';
      const spy = sinon.spy();
      element.addEventListener('query', spy);
      i1.value = 'test';
      notifyInput(i1);
      assert.isFalse(spy.called);
    });

    it('adds listeners to new target', async () => {
      const region = await fixture(`<div>
        <input id="i1">
        <input id="i2">
        <paper-autocomplete target="r1"></paper-autocomplete>
      </div>`);
      const element = region.querySelector('paper-autocomplete');
      const i2 = region.querySelector('#i2');
      element.target = 'i2';
      const spy = sinon.spy();
      element.addEventListener('query', spy);
      i2.value = 'test';
      notifyInput(i2);
      assert.isTrue(spy.called);
    });
  });

  describe('Suggestions processing', function() {
    let element;
    let input;
    beforeEach(async () => {
      const region = await suggestionsFixture();
      element = region.querySelector('paper-autocomplete');
      input = region.querySelector('input');
    });

    it('computes suggestions list', () => {
      input.value = 'App';
      notifyInput(input);
      assert.equal(element.suggestions.length, 1);
    });

    it('uses previously filtered query', async () => {
      input.value = 'a';
      notifyInput(input);
      assert.equal(element.suggestions.length, 4);
      await aTimeout();
      input.value = 'ap';
      notifyInput(input);
      assert.equal(element.suggestions.length, 2);
    });

    it('resets previous suggestions when query changes', async () => {
      input.value = 'a';
      notifyInput(input);
      assert.equal(element.suggestions.length, 4);
      await aTimeout();
      input.value = 'pa';
      notifyInput(input);
      assert.equal(element.suggestions.length, 0);
    });

    it('selects first suggestion', async () => {
      input.value = 'a';
      notifyInput(input);
      await aTimeout();
      element.selectNext();
      assert.equal(element.selectedItem, 0);
    });

    it('selects next suggestion', async () => {
      input.value = 'a';
      notifyInput(input);
      await aTimeout();
      element.selectNext();
      element.selectNext();
      assert.equal(element.selectedItem, 1);
    });

    it('selects previous suggestion', async () => {
      input.value = 'a';
      notifyInput(input);
      await aTimeout();
      element.selectPrevious();
      assert.equal(element.selectedItem, 3);
    });

    it('dispatches "selected" event', async () => {
      input.value = 'a';
      notifyInput(input);
      await aTimeout();
      element.selectNext();
      const spy = sinon.spy();
      element.addEventListener('selected', spy);
      element.acceptSelection();
      await aTimeout(1);
      assert.equal(spy.args[0][0].detail.value, 'Apple');
      // assert.equal(input.value, 'Apple');
    });

    it('sets value on target when "selected" event not cancelled', async () => {
      input.value = 'a';
      notifyInput(input);
      await aTimeout();
      element.selectNext();
      element.acceptSelection();
      await aTimeout(1);
      assert.equal(input.value, 'Apple');
    });

    it('won\'t set value on target when "selected" event is cancelled', async () => {
      input.value = 'a';
      notifyInput(input);
      await aTimeout();
      element.selectNext();
      element.addEventListener('selected', function f(e) {
        element.removeEventListener('selected', f);
        e.preventDefault();
      });
      element.acceptSelection();
      await aTimeout(1);
      assert.equal(input.value, 'a');
    });

    it('closes the suggestions', async () => {
      input.value = 'a';
      notifyInput(input);
      await aTimeout();
      element.selectNext();
      element.acceptSelection();
      await aTimeout(1);
      assert.isFalse(element.opened);
    });

    it('sets selected proeperty as string', async () => {
      input.value = 'a';
      notifyInput(input);
      await aTimeout();
      element.selectNext();
      element.acceptSelection();
      assert.equal(element.selected, 'Apple');
    });

    it('sets selected proeperty as an object', async () => {
      element.source = objectSuggestions;
      input.value = 'apr';
      notifyInput(input);
      await aTimeout();
      element.selectNext();
      element.acceptSelection();
      assert.deepEqual(element.selected, objectSuggestions[1]);
    });
  });

  describe('Suggestions with progress', () => {
    let element;
    let input;
    beforeEach(async () => {
      const region = await loaderFixture();
      element = region.querySelector('paper-autocomplete');
      input = region.querySelector('input');
    });

    it('renders progress bar', async () => {
      input.value = 'a';
      notifyInput(input);
      await nextFrame();
      const node = element.shadowRoot.querySelector('paper-progress');
      assert.ok(node);
    });

    it('removes progress bar when suggestions are set', async () => {
      input.value = 'a';
      notifyInput(input);
      await nextFrame();
      element.source = ['apple'];
      await nextFrame();
      const node = element.shadowRoot.querySelector('paper-progress');
      assert.notOk(node);
    });

    it('removes progress bar when empty suggestions are set', async () => {
      input.value = 'a';
      notifyInput(input);
      await nextFrame();
      element.source = [];
      await nextFrame();
      const node = element.shadowRoot.querySelector('paper-progress');
      assert.notOk(node);
    });
  });

  describe('_valueChanged()', () => {
    let element;
    let input;
    beforeEach(async () => {
      const region = await suggestionsFixture();
      element = region.querySelector('paper-autocomplete');
      input = region.querySelector('input');
    });

    it('sets _previousQuery', () => {
      input.value = 'a';
      element._valueChanged();
      assert.equal(element._previousQuery, 'a');
    });

    it('accespts numeric input', () => {
      input.type = 'number';
      element._oldTarget.parentElement.removeChild(element._oldTarget);
      element._oldTarget = {
        value: 2,
      };
      element._valueChanged();
      element._oldTarget = undefined;
      assert.equal(element._previousQuery, '2');
    });

    it('calls _disaptchQuery()', () => {
      input.value = 'a';
      const spy = sinon.spy(element, '_disaptchQuery');
      element._valueChanged();
      assert.equal(spy.args[0][0], input.value);
    });

    it('calls _filterSuggestions()', () => {
      input.value = 'a';
      const spy = sinon.spy(element, '_filterSuggestions');
      element._valueChanged();
      assert.isTrue(spy.called);
    });

    it('calls _filterSuggestions() when has _previousQuery that matches', () => {
      input.value = 'a';
      element._valueChanged();
      input.value = 'ap';
      const spy = sinon.spy(element, '_filterSuggestions');
      element._valueChanged();
      assert.isTrue(spy.called);
    });

    it('ignores change when not attached to the dom', () => {
      element.parentElement.removeChild(element);
      input.value = 'a';
      element._valueChanged();
      assert.equal(element._previousQuery, undefined);
    });

    it('clears suggestions when query changes', () => {
      input.value = 'a';
      element._valueChanged();
      input.value = 'test';
      element._valueChanged();
      assert.deepEqual(element._suggestions, []);
    });

    it('opens element when loader', () => {
      element.loader = true;
      input.value = 'a';
      element._valueChanged();
      assert.isTrue(element.opened);
    });
  });

  describe('_filterSuggestions()', () => {
    it('Does nothing when not attached', async () => {
      const element = await basicFixture();
      element.parentElement.removeChild(element);
      element._filterSuggestions();
      assert.deepEqual(element._suggestions, []);
    });

    it('Does nothing when event target not set', async () => {
      const element = await basicFixture();
      element._filterSuggestions();
      assert.deepEqual(element._suggestions, []);
    });

    it('Does nothing when no previous query set', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = undefined;
      element._previousQuery = 'test';
      element._filterSuggestions();
      assert.deepEqual(element._suggestions, []);
    });

    it('Does nothing when source', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element._filterSuggestions();
      assert.deepEqual(element._suggestions, []);
    });

    it('Filters out string values', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = ['a', 'aa', 'b', 'ab'];
      element._previousQuery = 'a';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, ['a', 'aa', 'ab']);
    });

    it('Filters out string values - cap query', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = ['a', 'aa', 'b', 'ab'];
      element._previousQuery = 'A';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, ['a', 'aa', 'ab']);
    });

    it('Filters out string values - cap items', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = ['A', 'Aa', 'b', 'Ab'];
      element._previousQuery = 'a';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, ['A', 'Aa', 'Ab']);
    });

    it('Filters out object values', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = [
        {
          value: 'a',
        },
        {
          value: 'aa',
        },
        {
          value: 'b',
        },
        {
          value: 'ab',
        },
      ];
      element._previousQuery = 'a';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, [{ value: 'a' }, { value: 'aa' }, { value: 'ab' }]);
    });

    it('Filters out object values - cap query', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = [{ value: 'a' }, { value: 'aa' }, { value: 'b' }, { value: 'ab' }];
      element._previousQuery = 'A';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, [{ value: 'a' }, { value: 'aa' }, { value: 'ab' }]);
    });

    it('Filters out object values - cap items', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = [{ value: 'A' }, { value: 'Aa' }, { value: 'b' }, { value: 'Ab' }];
      element._previousQuery = 'a';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, [{ value: 'A' }, { value: 'Aa' }, { value: 'Ab' }]);
    });

    it('Returns all when no query', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = [{ value: 'a' }, { value: 'aa' }, { value: 'b' }, { value: 'ab' }];
      element._previousQuery = '';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, element.source);
    });

    it('Closes element when no items after filtered', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = [{ value: 'a' }, { value: 'aa' }];
      element._previousQuery = 'b';
      element.opened = true;
      element._filterSuggestions();
      assert.isFalse(element.opened);
    });

    it('Sorts the results #1', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = [{ value: 'zoab' }, { value: 'saab' }, { value: 'ab' }, { value: 'Ab' }];
      element._previousQuery = 'ab';
      element._filterSuggestions();
      assert.deepEqual(element.suggestions, [
        { value: 'ab' },
        { value: 'Ab' },
        { value: 'saab' },
        { value: 'zoab' },
      ]);
    });

    it('Sorts the results #2', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = [{ value: 'xab' }, { value: 'xxab' }, { value: 'abxx' }];
      element._previousQuery = 'ab';
      element._filterSuggestions();
      assert.deepEqual(element.suggestions, [
        { value: 'abxx' },
        { value: 'xab' },
        { value: 'xxab' },
      ]);
    });

    it('Sorts the results #3', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = [{ value: 'xxxab' }, { value: 'ab' }];
      element._previousQuery = 'ab';
      element._filterSuggestions();
      assert.deepEqual(element.suggestions, [{ value: 'ab' }, { value: 'xxxab' }]);
    });

    it('Opens the overlay', async () => {
      const element = (await suggestionsFixture()).querySelector('paper-autocomplete');
      element.source = [{ value: 'a' }, { value: 'aa' }];
      element._previousQuery = 'a';
      element._filterSuggestions();
      assert.isTrue(element.opened);
    });
  });

  describe('selectPrevious()', () => {
    let element;
    const source = ['Apple', 'Appli', 'Applo'];

    beforeEach(async () => {
      element = (await stringTargetFixture()).querySelector('paper-autocomplete');
      element.source = source;
      element.opened = true;
      element._suggestions = source;
      await nextFrame();
    });

    it('Selectes previous element', async () => {
      element.selectedItem = 1;
      await nextFrame();
      element.selectPrevious();
      assert.equal(element.selectedItem, 0);
    });

    it('Opens the overlay', async () => {
      element.opened = false;
      element.selectedItem = 1;
      await nextFrame();
      element.selectPrevious();
      assert.isTrue(element.opened);
    });

    it('Does nothing when no suggestions', async () => {
      element._suggestions = [];
      element.opened = false;
      element.selectedItem = 1;
      await nextFrame();
      element.selectPrevious();
      assert.isFalse(element.opened);
    });

    it('Goes to the end of the list', async () => {
      element.selectedItem = 0;
      await nextFrame();
      element.selectPrevious();
      assert.equal(element.selectedItem, 2);
    });

    it('Calls ensureItemVisible()', async () => {
      const spy = sinon.spy(element, 'ensureItemVisible');
      element.selectedItem = 1;
      await nextFrame();
      element.selectPrevious();
      assert.isTrue(spy.called);
    });
  });

  describe('selectNext()', () => {
    let element;
    const source = ['Apple', 'Appli', 'Applo'];

    beforeEach(async () => {
      element = (await stringTargetFixture()).querySelector('paper-autocomplete');
      element.source = source;
      element.opened = true;
      element._suggestions = source;
      await nextFrame();
    });

    it('Selectes previous element', async () => {
      element.selectedItem = 1;
      await nextFrame();
      element.selectNext();
      assert.equal(element.selectedItem, 2);
    });

    it('Opens the overlay', async () => {
      element.opened = false;
      element.selectedItem = 1;
      await nextFrame();
      element.selectNext();
      assert.isTrue(element.opened);
    });

    it('Does nothing when no suggestions', async () => {
      element._suggestions = [];
      element.opened = false;
      element.selectedItem = 1;
      await nextFrame();
      element.selectNext();
      assert.isFalse(element.opened);
    });

    it('Goes to the start of the list', async () => {
      element.selectedItem = 2;
      await nextFrame();
      element.selectNext();
      assert.equal(element.selectedItem, 0);
    });

    it('Calls ensureItemVisible()', async () => {
      const spy = sinon.spy(element, 'ensureItemVisible');
      element.selectedItem = 1;
      await nextFrame();
      element.selectNext();
      assert.isTrue(spy.called);
    });
  });

  describe('_targetFocus()', () => {
    let element;
    const source = ['Apple', 'Appli', 'Applo'];

    beforeEach(async () => {
      element = (await stringTargetFixture()).querySelector('paper-autocomplete');
      element.source = source;
      element.openOnFocus = true;
      element._suggestions = source;
      await nextFrame();
    });

    it('Does nothing when openOnFocus is not set', () => {
      element.openOnFocus = false;
      element._targetFocus();
      assert.isUndefined(element.__autocompleteFocus);
    });

    it('Does nothing when opened', () => {
      element.opened = true;
      element._targetFocus();
      assert.isUndefined(element.__autocompleteFocus);
    });

    it('Does nothing when __autocompleteFocus is already set', () => {
      element.__autocompleteFocus = 1;
      element._targetFocus();
      assert.equal(element.__autocompleteFocus, 1);
    });

    it('Sets __autocompleteFocus', () => {
      element._valueChanged = () => {};
      element._targetFocus();
      assert.isTrue(element.__autocompleteFocus);
    });

    it('Re-sets __autocompleteFocus', async () => {
      element._valueChanged = () => {};
      element._targetFocus();
      await aTimeout(1);
      assert.isFalse(element.__autocompleteFocus);
    });

    it('Calls _valueChanged()', async () => {
      element._targetFocus();
      const spy = sinon.spy(element, '_valueChanged');
      await aTimeout(1);
      assert.isTrue(spy.called);
    });
  });

  describe('_onCaptureClick()', () => {
    let element;
    let input;
    beforeEach(async () => {
      const region = await suggestionsFixture();
      element = region.querySelector('paper-autocomplete');
      input = region.querySelector('input');
      input.value = 'a';
      element._valueChanged();
      await nextFrame();
    });

    it('closes the overlay when clicked elsewhere', () => {
      assert.isTrue(element.opened);
      document.body.firstElementChild.click();
      assert.isFalse(element.opened);
    });

    it('overlay is opened when clicked on the input', () => {
      input.click();
      assert.isTrue(element.opened);
    });
  });

  describe('onquery', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onquery);
      const f = () => {};
      element.onquery = f;
      assert.isTrue(element.onquery === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onquery = f;
      element._disaptchQuery('test');
      element.onquery = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onquery = f1;
      element.onquery = f2;
      element._disaptchQuery('test');
      element.onquery = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('onselected', () => {
    let element;
    beforeEach(async () => {
      const region = await stringTargetFixture();
      element = region.querySelector('paper-autocomplete');
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onselected);
      const f = () => {};
      element.onselected = f;
      assert.isTrue(element.onselected === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onselected = f;
      element._inform('test');
      element.onselected = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onselected = f1;
      element.onselected = f2;
      element._inform('test');
      element.onselected = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('Attributes compatibility', () => {
    // open-on-focus
    it('Sets legacy open-on-focus in the template from a variable', async () => {
      const el = await fixture(html`<paper-autocomplete ?open-on-focus="${true}"></paper-autocomplete>`);
      assert.isTrue(el.openOnFocus);
    });

    it('Sets legacy open-on-focus in the template from a literal', async () => {
      const el = await fixture(html`<paper-autocomplete open-on-focus></paper-autocomplete>`);
      assert.isTrue(el.openOnFocus);
    });

    it('Gets legacy _oldOpenOnFocus', async () => {
      const el = await fixture(html`<paper-autocomplete ?open-on-focus="${true}"></paper-autocomplete>`);
      assert.isTrue(el._oldOpenOnFocus);
    });

    // selected-item
    it('Sets legacy selected-item in the template from a variable', async () => {
      const el = await fixture(html`<paper-autocomplete ?selected-item="${true}"></paper-autocomplete>`);
      assert.isTrue(el.selectedItem);
    });

    it('Sets legacy selected-item in the template from a literal', async () => {
      const el = await fixture(html`<paper-autocomplete selected-item></paper-autocomplete>`);
      assert.isTrue(el.selectedItem);
    });

    it('Gets legacy _oldSelectedItem', async () => {
      const el = await fixture(html`<paper-autocomplete ?selected-item="${true}"></paper-autocomplete>`);
      assert.isTrue(el._oldSelectedItem);
    });
  });

  describe('a11y', () => {
    async function inputWithSuggestions() {
      return await fixture(html`
        <div>
          <label><input id="st1" />test</label>
          <paper-autocomplete target="st1" .source="${suggestions}"></paper-autocomplete>
        </div>
      `);
    }

    async function inputWithoutSuggestions() {
      return await fixture(html`
        <div>
          <label><input id="st2" />test</label>
          <paper-autocomplete target="st2"></paper-autocomplete>
        </div>
      `);
    }

    async function roleSuggestions() {
      return await fixture(`<paper-autocomplete role="option"></paper-autocomplete>`);
    }

    async function labelSuggestions() {
      return await fixture(`<paper-autocomplete aria-label="test"></paper-autocomplete>`);
    }

    it('is accessible in normal state', async () => {
      const region = await fixture(`<div>
        <label><input id="st1">test</label>
        <paper-autocomplete target="st1"></paper-autocomplete>
      </div>`);
      await assert.isAccessible(region);
    });

    it('is accessible when opened', async () => {
      const region = await inputWithSuggestions();
      const input = region.querySelector('input');
      input.value = 'a';
      const element = region.querySelector('paper-autocomplete');
      element._valueChanged();
      await aTimeout();
      await assert.isAccessible(region);
    });

    it('is accessible when selected', async () => {
      const region = await inputWithSuggestions();
      const input = region.querySelector('input');
      input.value = 'a';
      const element = region.querySelector('paper-autocomplete');
      element._valueChanged();
      await aTimeout();
      element.selectNext();
      await assert.isAccessible(region);
    });

    it('is accessible when closed', async () => {
      const region = await inputWithSuggestions();
      const input = region.querySelector('input');
      input.value = 'a';
      const element = region.querySelector('paper-autocomplete');
      element._valueChanged();
      await aTimeout();
      element.acceptSelection();
      await aTimeout();
      await assert.isAccessible(region);
    });

    it('adds role attribute', async () => {
      const element = await basicFixture();
      assert.equal(element.getAttribute('role'), 'listbox');
    });

    it('respects existing role attribute', async () => {
      const element = await roleSuggestions();
      assert.equal(element.getAttribute('role'), 'option');
    });

    it('adds aria-label attribute', async () => {
      const element = await basicFixture();
      assert.notEmpty(element.getAttribute('aria-label'));
    });

    it('respects existing aria-label attribute', async () => {
      const element = await labelSuggestions();
      assert.equal(element.getAttribute('aria-label'), 'test');
    });

    it('adds aria-autocomplete on the input', async () => {
      const region = await inputWithoutSuggestions();
      const input = region.querySelector('input');
      assert.equal(input.getAttribute('aria-autocomplete'), 'list');
    });

    it('adds autocomplete on the input', async () => {
      const region = await inputWithoutSuggestions();
      const input = region.querySelector('input');
      assert.equal(input.getAttribute('autocomplete'), 'off');
    });

    it('adds aria-haspopup on the input', async () => {
      const region = await inputWithoutSuggestions();
      const input = region.querySelector('input');
      assert.equal(input.getAttribute('aria-haspopup'), 'true');
    });

    it('autogenerates id on the suggestions', async () => {
      const region = await inputWithoutSuggestions();
      const element = region.querySelector('paper-autocomplete');
      assert.match(element.id, /^paperAutocompleteInput[\d]+$/);
    });

    it('adds aria-controls on the input', async () => {
      const region = await inputWithoutSuggestions();
      const input = region.querySelector('input');
      const element = region.querySelector('paper-autocomplete');
      assert.equal(input.getAttribute('aria-controls'), element.id);
    });

    it('sets aria-selected on selected suggestion', async () => {
      const region = await inputWithSuggestions();
      const input = region.querySelector('input');
      input.value = 'a';
      const element = region.querySelector('paper-autocomplete');
      element._valueChanged();
      await aTimeout();
      element.selectNext();
      const node = element.shadowRoot.querySelector(`[aria-selected="true"]`);
      assert.ok(node);
    });

    it('changes aria-selected when next selected', async () => {
      const region = await inputWithSuggestions();
      const input = region.querySelector('input');
      input.value = 'a';
      const element = region.querySelector('paper-autocomplete');
      element._valueChanged();
      await aTimeout();
      element.selectNext();
      element.selectNext();
      const nodes = element.shadowRoot.querySelectorAll(`[aria-selected="true"]`);
      assert.lengthOf(nodes, 1);
    });
  });
});
