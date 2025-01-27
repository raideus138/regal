
let statusNavBar = true;

const dom = {
  overlay: document.getElementById('overlay'),
  popup: document.getElementById('popup'),
  navbar: document.querySelector('.sidebar'),
  toggleNavBarButton: document.querySelector('.icon-menu'),
}

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

dom.toggleNavBarButton.addEventListener('click', () => {
  req = statusNavBar ? showNavBar() : hideNavBar();
});

document.addEventListener('keydown', (e) => {
  req = statusNavBar && e.code === 'Escape' ? showNavBar() : hideNavBar();
});


document.querySelector('.reload').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.reload();
});