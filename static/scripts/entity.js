function buildNoteItem(data) {
  return $('<div>')
    .addClass('note-item')
    .attr('itemid', data.id)
    .append(
      $('<span>')
        .addClass('note-item-title')
        .text(data.name)
    )
}

function createImageDisplay(value, noteId) {
  return $('<img>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-image')
    .attr('src', value)
}

function createTextDisplay(value, noteId) {
  return $('<textarea>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .attr('readonly', true)
    .addClass('note-frame-text')
    .text(value)
}

function createPdfDisplay(value, noteId) {
  return $('<iframe>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-pdf')
    .attr('src', value)
    .attr('type', 'application/pdf')
}

function createAudioDisplay(value, noteId) {
  return $('<audio>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-audio')
    .attr('controls', true)
    .attr('src', value)
}

function createVideoDisplay(value, noteId) {
  return $('<video>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-video')
    .attr('controls', true)
    .attr('src', value)
}

export default {
  buildNoteItem,
  createImageDisplay,
  createTextDisplay,
  createPdfDisplay,
  createAudioDisplay,
  createVideoDisplay
}