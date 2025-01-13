gsap.set("svg", { visibility: "visible" });
gsap.to("#headStripe", {
  y: 0.5,
  rotation: 1,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut",
  duration: 1 });

gsap.to("#spaceman", {
  y: 0.5,
  rotation: 1,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut",
  duration: 1 });

gsap.to("#craterSmall", {
  x: -3,
  yoyo: true,
  repeat: -1,
  duration: 1,
  ease: "sine.inOut" });

gsap.to("#craterBig", {
  x: 3,
  yoyo: true,
  repeat: -1,
  duration: 1,
  ease: "sine.inOut" });

gsap.to("#planet", {
  rotation: -2,
  yoyo: true,
  repeat: -1,
  duration: 1,
  ease: "sine.inOut",
  transformOrigin: "50% 50%" });


gsap.to("#starsBig g", {
  rotation: "random(-30,30)",
  transformOrigin: "50% 50%",
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut" });

gsap.fromTo(
"#starsSmall g",
{ scale: 0, transformOrigin: "50% 50%" },
{ scale: 1, transformOrigin: "50% 50%", yoyo: true, repeat: -1, stagger: 0.1 });

gsap.to("#circlesSmall circle", {
  y: -4,
  yoyo: true,
  duration: 1,
  ease: "sine.inOut",
  repeat: -1 });

gsap.to("#circlesBig circle", {
  y: -2,
  yoyo: true,
  duration: 1,
  ease: "sine.inOut",
  repeat: -1 });


gsap.set("#glassShine", { x: -68 });

gsap.to("#glassShine", {
  x: 80,
  duration: 2,
  rotation: -30,
  ease: "expo.inOut",
  transformOrigin: "50% 50%",
  repeat: -1,
  repeatDelay: 8,
  delay: 2 });


const burger = document.querySelector('.burger');
const nav = document.querySelector('nav');

burger.addEventListener('click', e => {
  burger.dataset.state === 'closed' ? burger.dataset.state = "open" : burger.dataset.state = "closed";
  nav.dataset.state === "closed" ? nav.dataset.state = "open" : nav.dataset.state = "closed";
});

function spotify_login(){
    window.location.href = '/auth/spotify';
}

const form = document.querySelector(".contact-form");
const alert_text = document.querySelector(".alert");

function color_text(e) {
  var text = document.getElementById("text");
  var colors = {
    blue: '#0e0620',
    light_blue: '#5277c2',
    white: '#fff',
    green: '#2ccf6d',
    purple: '#ec37fc',
    red: '#cf6767'
  }
  alert_text.style.color = colors[e];
}

function sendAlert(message, color) {
  color_text(color);
  alert_text.innerHTML = message;
}



form.addEventListener("submit", (event) => {
  event.preventDefault(); 

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (name === "" || email === "" || message === "") {
    sendAlert("Por favor, completa todos los campos.", "red");
    return;
  }

  if (!validateEmail(email)) {
    sendAlert("Por favor, introduce un correo electrónico válido.", "red");
    return;
  }
    sendFormData({ name, email, message });
});

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sendFormData(data) {
  console.log("Datos enviados al servidor:", data);
  sendAlert("Formulario enviado con éxito.", "green");
  form.reset();
}