function Session () {
  function __getSession () {
    const data = sessionStorage.getItem('sessionData')
    if (data === null) return {}
    return JSON.parse(data)
  }

  function __setValue (key, value) {
    const data = __getSession()
    data[key] = value
    sessionStorage.setItem('sessionData', JSON.stringify(data))
  }

  function __getValue (key) {
    const session = __getSession()
    if (!(key in session)) return null
    return session[key]
  }

  this.setType = function (type) {
    __setValue('type', type)
  }

  this.getType = function () {
    return __getValue('type')
  }

  this.setSessionId = function (sessionId) {
    __setValue('sessionId', sessionId)
  }

  this.getSessionId = function () {
    return __getValue('sessionId')
  }

  this.setSessionName = function (sessionName) {
    __setValue('sessionName', sessionName)
  }

  this.getSessionName = function () {
    return __getValue('sessionName')
  }

  this.setMyName = function (myName) {
    __setValue('myName', myName)
  }

  this.getMyName = function () {
    return __getValue('myName')
  }
}

const session = new Session();
