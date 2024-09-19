// @ts-check

/**
 * @typedef {import('../types').ClearTrackingPropsRawData} ClearTrackingPropsRawData
 */

class ClearTrackingProps {
  constructor() {
    this.type = 'none'
  }

  /**
   * @param {any} other
   * @returns {boolean}
   */
  equals(other) {
    return other instanceof ClearTrackingProps
  }

  /**
   * @returns {ClearTrackingPropsRawData}
   */
  toRaw() {
    return { type: 'none' }
  }
}

module.exports = ClearTrackingProps
