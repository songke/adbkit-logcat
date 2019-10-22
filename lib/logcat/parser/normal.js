'use strict'

const EventEmitter = require('events').EventEmitter

const Entry = require('../entry')

const Priority = require('../priority')

class Normal extends EventEmitter {
  constructor(options) {
    super(options)
    this.buffer = new Buffer(0)
  }

  parse(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk])

    let currentData = this.buffer.toString().split(/(?:\r\n|\r|\n)/g)
    let lineNum = 0
    while (lineNum < currentData.length) {
      var currentLine = currentData[lineNum].replace(/\s+/g, " " ).split(" ")
      lineNum += 1

      if (currentLine.length < 5) {
        continue
      }

      const entry = new Entry

      const dateString = new Date().getFullYear() + "-" + currentLine[0] + "T" + currentLine[1].split(".")[0]
      entry.setDate(new Date(dateString))

      entry.setPid(Number(currentLine[2]))
      entry.setTid(Number(currentLine[3]))
      entry.setPriority(Priority.fromLetter(currentLine[4]))

      const data = currentLine.slice(5, currentLine.length).join(" ").split(":")
      entry.setTag(data[0])
      const message = data.slice(1, data.length).join(":")
      entry.setMessage(message.toString())

      this.emit('entry', entry)

    }

    this.buffer = new Buffer(0);
    this.emit('drain');

  }

}

module.exports = Normal
