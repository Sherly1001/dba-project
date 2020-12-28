document.addEventListener('DOMContentLoaded', e => {
  Node.prototype.on = Node.prototype.addEventListener;
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);

  $('#search').on('submit', e => {
    e.preventDefault();
  })
})
