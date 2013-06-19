{EventEmitter} = require 'events'

Parser = require './parser'
Transform = require './transform'

class Reader extends EventEmitter
  constructor: (@options = {}) ->
    @options.format ||= 'binary'
    @options.fixLineFeeds = true unless @options.fixLineFeeds?
    @parser = Parser.get @options.format
    @stream = null

  _hook: ->
    if @options.fixLineFeeds
      transform = @stream.pipe new Transform
      transform.on 'data', (data) =>
        @parser.parse data
    else
      @stream.on 'data', (data) =>
        @parser.parse data
    @stream.on 'error', (err) =>
      this.emit 'error', err
    @stream.on 'end', =>
      this.emit 'end'
    @stream.on 'finish', =>
      this.emit 'finish'
    @parser.on 'entry', (entry) =>
      this.emit 'entry', entry
    @parser.on 'error', (err) =>
      this.emit 'error', err
    return

  connect: (@stream) ->
    this._hook()
    return this

  end: ->
    @stream.end()
    return this

module.exports = Reader
