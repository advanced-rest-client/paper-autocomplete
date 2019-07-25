import { fixture, assert } from '@open-wc/testing';
// import sinon from 'sinon/pkg/sinon-esm.js';
import '../paper-autocomplete.js';

describe('<paper-autocomplete>', () => {
  async function basicFixture() {
    return (await fixture(`<paper-autocomplete></paper-autocomplete>`));
  }

  // async function stringTargetFixture() {
  //   return (await fixture(`<input id="st1">
  //   <paper-autocomplete target="st2"></paper-autocomplete>
  //   <input id="st2">`));
  // }

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

  // describe('_targetChanged', () => {
  //   it.only('Recognizes target by id', async () => {
  //     const fix = await stringTargetFixture();
  //     const element = fix.querySelector('paper-autocomplete');
  //     const input = fix.querySelector('input');
  //     assert.isTrue(element._oldTarget === input);
  //   });
  // });
});
