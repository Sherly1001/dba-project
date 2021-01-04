document.addEventListener('DOMContentLoaded', e => {
  Node.prototype.on = Node.prototype.addEventListener;
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);
  const print = console.log;

  const cookies = Object.fromEntries(document.cookie.split(/; */).map(c => {
    const [key, v] = c.split('=', 2);
    return [key, decodeURIComponent(v)];
  }));
  const login = async (username, pass) => {
    return await fetch(`/api/login?user=${encodeURIComponent(username)}&pass=${encodeURIComponent(pass)}`)
    .then(res => res.json())
    .then(res => {
      if (res.result) {
        document.cookie = `user=${res.user}`;
        document.cookie = `pass=${res.pass}`;
        document.cookie = `role=${res.role}`;
        if (res.name) document.cookie = `name=${res.name}`;
      }
      return res.result;
    });
  }
  const delete_cookie = key => {
    document.cookie = `${key}=; expires = ${new Date(0)}`;
  }
  const logout = e => {
    delete_cookie('user');
    delete_cookie('pass');
    delete_cookie('name');
    document.location = '/';
  }
  const vertify = async () => {
    if (cookies.user && cookies.pass)
      return await login(cookies.user, cookies.pass);
  }

  let lg = $('#login');
  let pu = $('#popup');
  let os = $('#outside-popup');

  vertify().then(res => {
    if (res) {
      let cnt = `<a href="/my-profile" class="nav-link me-3">${cookies.name || cookies.user}</a>`;
      cnt += '<a href="#" class="nav-link btn btn-secondary">Đăng xuất</a>';
      lg.innerHTML = cnt;
      lg.lastElementChild.on('click', logout);
    } else {
      lg.firstElementChild.on('click', e => {
        e.preventDefault();
        show_login();
      });
    }
  });

  os.on('click', e => hide_popup(e));

  const show_login = () => {
    let cnt = `<h2 class="mt-3">Đăng nhập</h2><hr>`;

    cnt += `<form>
    <div class="form-floating mb-3">
      <input class="form-control" id="username" name="username" placeholder="username">
      <label for="username">Username</label>
    </div>
    <div class="form-floating mb-3">
      <input class="form-control" type="password" id="pass" name="pass" placeholder="password">
      <label for="pass">Password</label>
    </div>
    <button type="submit" class="btn btn-primary">Đăng nhập</button>
    </form>`

    pu.innerHTML = cnt;
    pu.style.top = '50%';
    os.style.display = 'block';
    pu.querySelector('#username').focus();

    pu.querySelector('form').on('submit', e => {
      e.preventDefault();
      let form = e.target;
      let username = form.querySelector('#username').value;
      let pass = form.querySelector('#pass').value;
      
      login(username, pass).then(res => {
        if (res) {
          document.location = '/';
        } else {
          hide_popup(e);
        }
      });
    });
  }
  const hide_popup = e => {
    pu.style.top = '-200%';
    os.style.display = 'none';
  }
})
