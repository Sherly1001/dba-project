document.addEventListener('DOMContentLoaded', e => {
  Node.prototype.on = Node.prototype.addEventListener;
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);
  const print = console.log;

  let lg = $('#login');
  for (let i = 0; i < lg.children.length; ++i) {
    lg.children[i].on('click', e => {
      e.preventDefault();
      show_login(i);
    })
  }

  const show_login = i => {
    alert(i);
  }
  delete Node.prototype.on;
})
