function supported (versions) {
  return versions.map(function (i) {
    return i + '.x'
  }).join(', ')
}

/**
 * Unknown error received from other Logux client.
 *
 * @param {BaseSync} sync The sync client object.
 * @param {string} type The error type.
 * @param {any} options The error options.
 * @param {boolean} received Was error received from other node.
 *
 * @example
 * if (error.name === 'SyncError') {
 *   console.log('Server throws: ' + error.description)
 * }
 *
 * @extends Error
 * @class
 */
function SyncError (sync, type, options, received) {
  Error.call(this, type)

  /**
   * Always equal to `SyncError`. The best way to check error type.
   * @type {string}
   *
   * @example
   * if (error.name === 'SyncError') { }
   */
  this.name = 'SyncError'

  /**
   * Error type name.
   * @type {string}
   *
   * @example
   * if (error.type === 'timeout') {
   *   fixNetwork()
   * }
   */
  this.type = type

  /**
   * Error extra data depends on error type.
   * @type {any}
   *
   * @example
   * if (error.type === 'timeout') {
   *   console.error('A timeout was reached (' + error.options + ' ms)')
   * }
   */
  this.options = options

  /**
   * Origin error description from other client.
   * @type {string}
   *
   * @example
   * console.log('Server throws: ' + error.description)
   */
  this.description = SyncError.describe(type, options)

  /**
   * Sync client received a error message.
   * @type {BaseSync}
   *
   * @example
   * error.sync.connection.connected
   */
  this.sync = sync

  /**
   * Error was received from other client.
   * @type {boolean}
   */
  this.received = !!received

  this.message = ''
  if (received) {
    if (this.sync.otherNodeId) {
      this.message += this.sync.otherNodeId + ' sent '
    } else {
      this.message += 'Logux received '
    }
    this.message += this.type + ' error'
    if (this.description !== this.type) {
      this.message += ' (' + this.description + ')'
    }
  } else {
    this.message = this.description
  }

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, SyncError)
  }
}

/**
 * Return a error description by it code.
 *
 * @param {string} type The error code.
 * @param {any} options The errors options depends on error code.
 *
 * @return {string} Human-readable error description.
 *
 * @example
 * errorMessage(msg) {
 *   console.log(SyncError.describe(msg[1], msg[2]))
 * }
 */
SyncError.describe = function describe (type, options) {
  if (type === 'timeout') {
    return 'A timeout was reached (' + options + 'ms)'
  } else if (type === 'wrong-format') {
    return 'Wrong message format in ' + options
  } else if (type === 'unknown-message') {
    return 'Unknown message `' + options + '` type'
  } else if (type === 'missed-auth') {
    return 'Start authentication before sending message ' + options
  } else if (type === 'wrong-protocol') {
    return 'Only ' + supported(options.supported) + ' Logux protocols ' +
           'are supported, but you use ' + options.used.join('.')
  } else if (type === 'wrong-subprotocol') {
    return 'Only ' + options.supported + ' application subprotocols are ' +
           'supported, but you use ' + options.used
  } else if (type === 'wrong-credentials') {
    return 'Wrong credentials'
  } else {
    return type
  }
}

SyncError.prototype = Error.prototype

module.exports = SyncError
