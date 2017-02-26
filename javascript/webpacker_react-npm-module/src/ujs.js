const $ = (typeof window.jQuery !== 'undefined') && window.jQuery
const Turbolinks = window.Turbolinks

const ujs = {

  handleEvent(eventName, callback, { once } = { once: false }) {
    if ($) {
      if (once) {
        $(document).one(eventName, callback)
      } else {
        $(document).on(eventName, callback)
      }
    } else {
      document.addEventListener(eventName, callback, { once })
    }
  },

  setup(onMount, onUnmount) {
    // Detect which kind of events to set up:
    if (typeof Turbolinks !== 'undefined' && Turbolinks.supported) {
      if (typeof Turbolinks.EVENTS !== 'undefined') {
        // Turbolinks.EVENTS is in classic version 2.4.0+
        this.turbolinksClassic(onMount, onUnmount)
      } else if (typeof Turbolinks.controller !== 'undefined') {
        // Turbolinks.controller is in version 5+
        this.turbolinks5(onMount, onUnmount)
      } else {
        this.turbolinksClassicDeprecated(onMount, onUnmount)
      }
    } else if ($ && typeof $.pjax === 'function') {
      this.pjax(onMount, onUnmount)
    } else {
      this.native(onMount)
    }
  },

  turbolinks5(onMount, onUnmount) {
    this.handleEvent('turbolinks:load', onMount, { once: true })
    this.handleEvent('turbolinks:render', onMount)
    this.handleEvent('turbolinks:before-render', onUnmount)
  },

  turbolinksClassic(onMount, onUnmount) {
    this.handleEvent(Turbolinks.EVENTS.CHANGE, onMount)
    this.handleEvent(Turbolinks.EVENTS.BEFORE_UNLOAD, onUnmount)
  },

  turbolinksClassicDeprecated(onMount, onUnmount) {
    // Before Turbolinks 2.4.0, Turbolinks didn't
    // have named events and didn't have a before-unload event.
    // Also, it didn't work with the Turbolinks cache, see
    // https://github.com/reactjs/react-rails/issues/87
    Turbolinks.pagesCached(0)
    this.handleEvent('page:change', onMount)
    this.handleEvent('page:receive', onUnmount)
  },

  pjax(onMount, onUnmount) {
    this.handleEvent('ready', onMount)
    this.handleEvent('pjax:end', onMount)
    this.handleEvent('pjax:beforeReplace', onUnmount)
  },

  native(onMount) {
    if ($) {
      $(() => onMount())
    } else if ('addEventListener' in window) {
      document.addEventListener('DOMContentLoaded', onMount)
    } else {
      // add support to IE8 without jQuery
      window.attachEvent('onload', onMount)
    }
  }
}

export default ujs
