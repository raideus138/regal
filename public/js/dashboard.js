
let statusNavBar = true;
let statusButtonNav = true
let statusPage = true;


const date = new Date();
const dom = {
  overlay: document.getElementById('overlay'),
  popup: document.getElementById('popup'),
  navbar: document.querySelector('.sidebar'),
  toggleNavBarButton: document.querySelector('.icon-menu'),
  settingsElementLi: document.querySelector('.nav-item-settings'),
  settingsElementA: document.querySelector('.nav-link'),
  settingsElementDiv: document.querySelector('.dropdown-menu'),
  settingsElementIcon: document.querySelector('.bi-three-dots-vertical'),
  githubElement: document.querySelector('.github'),
  arrowUpElement: document.querySelector('.home'),
  dateElement: document.querySelector('#date'),
  copyrightElement: document.querySelector('.copyright'),
}

const actions = {
  Escape: () => (statusNavBar ? showNavBar() : hideNavBar()),
  Tab: () => (statusButtonNav ? showSettingsNav() : hideSettingsNav()),
  F5: () => statusPage && reloadPage(),
};

function showPopup() {
  dom.overlay.style.display = 'block';
  setTimeout(() => {
    dom.popup.classList.add('active');
  }, 10);
}

function hidePopup() {
  dom.popup.classList.remove('active');
  setTimeout(() => {
    dom.overlay.style.display = 'none';
  }, 300);
}

function showNavBar() {
  dom.navbar.style.display = 'fixed';
  dom.navbar.classList.add('active');
  statusNavBar = false;
};

function hideNavBar() {
  dom.navbar.classList.remove('active')
  statusNavBar = true; 
}

function toggleSettingsNav(show) {
  dom.settingsElementLi.classList.toggle('show', show);
  dom.settingsElementDiv.classList.toggle('show', show);
  dom.settingsElementA.setAttribute('aria-expanded', show ? 'true' : 'false');
  statusButtonNav = !show;
}

function showSettingsNav() {
  toggleSettingsNav(true);
}

function hideSettingsNav() {
  toggleSettingsNav(false);
}

function reloadPage() {
  window.location.reload();   
};

dom.dateElement.textContent = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

dom.copyrightElement.textContent =  `Copyright © RVC ${date.getFullYear()}`;

dom.arrowUpElement.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

dom.settingsElementA.addEventListener('click', () => {
  statusButtonNav ? showSettingsNav() : hideSettingsNav();
});

dom.githubElement.addEventListener('click', () => {
  window.open('https://github.com/raideus138/regal', '_blank')
});

dom.toggleNavBarButton.addEventListener('click', () => {
  req = statusNavBar ? showNavBar() : hideNavBar();
});

document.addEventListener('keydown', (e) => {
  e.preventDefault();
  if (actions[e.code]) actions[e.code]();
});

document.querySelector('.reload').addEventListener('click', (e) => {
  e.preventDefault();
  reloadPage();
});
