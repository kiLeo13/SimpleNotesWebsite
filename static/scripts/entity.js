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

export default {
  buildNoteItem
}