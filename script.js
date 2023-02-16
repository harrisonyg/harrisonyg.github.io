$(function () {
  $(".menu-link").click(function () {
    $(".menu-link").removeClass("is-active");
    $(this).addClass("is-active");
  });
});

$(function () {
  $(".main-header-link").click(function () {
    $(".main-header-link").removeClass("is-active");
    $(this).addClass("is-active");
  });
});

const dropdowns = document.querySelectorAll(".dropdown");
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdowns.forEach((c) => c.classList.remove("is-active"));
    dropdown.classList.add("is-active");
  });
});

$(".search-bar input")
  .focus(function () {
    $(".header").addClass("wide");
  })
  .blur(function () {
    $(".header").removeClass("wide");
  });

$(document).click(function (e) {
  var container = $(".status-button");
  var dd = $(".dropdown");
  if (!container.is(e.target) && container.has(e.target).length === 0) {
    dd.removeClass("is-active");
  }
});

$(function () {
  $(".dropdown").on("click", function (e) {
    $(".content-wrapper").addClass("overlay");
    e.stopPropagation();
  });
  $(document).on("click", function (e) {
    if ($(e.target).is(".dropdown") === false) {
      $(".content-wrapper").removeClass("overlay");
    }
  });
});

$(function () {
  $(".status-button:not(.open)").on("click", function (e) {
    $(".overlay-app").addClass("is-active");
  });
  $(".pop-up .close").click(function () {
    $(".overlay-app").removeClass("is-active");
  });
});

$(".status-button:not(.open)").click(function () {
  $(".pop-up").addClass("visible");
});

$(".pop-up .close").click(function () {
  $(".pop-up").removeClass("visible");
});

const toggleButton = document.querySelector('.dark-light');

toggleButton.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});






var b1 = document.getElementById('bt1');
var b2 = document.getElementById('bt2');
var b3 = document.getElementById('bt3');
var b4 = document.getElementById('bt4');
var d1 = document.getElementById('home');
var d2 = document.getElementById('pt');
var d3 = document.getElementById('audio');
var d4 = document.getElementById('profile');

var fb1 = document.getElementById('fbt1');
var fb2 = document.getElementById('fbt2');
var fb3 = document.getElementById('fbt3');
var fb4 = document.getElementById('fbt4');
var sele1 = document.querySelector(".ft-menu-link1")
var sele2 = document.querySelector(".ft-menu-link2")
var sele3 = document.querySelector(".ft-menu-link3")



fb1.addEventListener('click', C);

function C() {

  console.log("heo");
  d1.style.display = "block"
  d2.style.display = "none"
  d3.style.display = "none"
  d4.style.display = "none"
  sele1.classList.add("is-active")
  sele2.classList.remove("is-active")
  sele3.classList.remove("is-active")
  document.getElementById('greeting').innerHTML ='<b class="greeting">' + greet;
  fb4.style.border = '2px solid #8b96a185';
  document.getElementById('bt1').classList.add("is-active")
  document.getElementById('bt2').classList.remove("is-active")
  document.getElementById('bt3').classList.remove("is-active")
  document.getElementById('bt4').classList.remove("is-active")
 

}

fb2.addEventListener('click', L);

function L() {

  console.log("hello");
  d1.style.display = "none"
  d2.style.display = "block"
  d3.style.display = "none"
  d4.style.display = "none"
  sele1.classList.remove("is-active")
  sele2.classList.add("is-active")
  sele3.classList.remove("is-active")
  document.getElementById('greeting').innerHTML ='<b class="greeting">' + "Portfolio";
  fb4.style.border = '2px solid #8b96a185';
  document.getElementById('bt1').classList.remove("is-active")
  document.getElementById('bt2').classList.add("is-active")
  document.getElementById('bt3').classList.remove("is-active")
  document.getElementById('bt4').classList.remove("is-active")



}

fb3.addEventListener('click', H);

function H() {

  console.log("hello");
  d1.style.display = "none"
  d2.style.display = "none"
  d3.style.display = "block"
  d4.style.display = "none"
  sele1.classList.remove("is-active")
  sele2.classList.remove("is-active")
  sele3.classList.add("is-active")
  fb4.style.border = '2px solid #8b96a185';
  document.getElementById('greeting').innerHTML ='<b class="greeting">' + "Harrison's Blog";
  document.getElementById('bt1').classList.remove("is-active")
  document.getElementById('bt2').classList.remove("is-active")
  document.getElementById('bt3').classList.add("is-active")
  document.getElementById('bt4').classList.remove("is-active")



}
fb4.addEventListener('click', P);

function P() {

  console.log("click");
  d1.style.display = "none"
  d2.style.display = "none"
  d3.style.display = "none"
  d4.style.display = "block"
  sele1.classList.remove("is-active")
  sele2.classList.remove("is-active")
  sele3.classList.remove("is-active")
  document.getElementById('greeting').innerHTML ='<b class="greeting">' + "Hire Me";
  fb4.style.border = '2px solid #0071e3';
  document.getElementById('bt1').classList.remove("is-active")
  document.getElementById('bt2').classList.remove("is-active")
  document.getElementById('bt3').classList.remove("is-active")
  document.getElementById('bt4').classList.add("is-active")





}

b1.addEventListener('click', R);

function R() {

  console.log("hello");
  d1.style.display = "block"
  d2.style.display = "none"
  d3.style.display = "none"
  d4.style.display = "none"
  document.getElementById('greeting').innerHTML ='<b class="greeting">' + greet;
  sele1.classList.add("is-active")
  sele2.classList.remove("is-active")
  sele3.classList.remove("is-active")

  document.getElementById('bt1').classList.add("is-active")
  document.getElementById('bt2').classList.remove("is-active")
  document.getElementById('bt3').classList.remove("is-active")
  document.getElementById('bt4').classList.remove("is-active")
}


b2.addEventListener('click', X);

function X() {

  d1.style.display = "none"
  d2.style.display = "block"
  d3.style.display = "none"
  d4.style.display = "none"
  sele1.classList.remove("is-active")
  sele2.classList.add("is-active")
  sele3.classList.remove("is-active")
  
  document.getElementById('greeting').innerHTML ='<b class="greeting">' + "Portfolio";

  document.getElementById('bt1').classList.remove("is-active")
  document.getElementById('bt2').classList.add("is-active")
  document.getElementById('bt3').classList.remove("is-active")
  document.getElementById('bt4').classList.remove("is-active")

}

b3.addEventListener('click', MM);

function MM() {

  console.log("hello");
  d1.style.display = "none"
  d2.style.display = "none"
  d3.style.display = "block"
  d4.style.display = "none"
  sele1.classList.remove("is-active")
  sele2.classList.remove("is-active")
  sele3.classList.add("is-active")

  fb4.style.border = '2px solid #8b96a185';
  document.getElementById('greeting').innerHTML ='<b class="greeting">' + "Harrison's Blog";
  document.getElementById('bt1').classList.remove("is-active")
  document.getElementById('bt2').classList.remove("is-active")
  document.getElementById('bt3').classList.add("is-active")
  document.getElementById('bt4').classList.remove("is-active")
 

}

b4.addEventListener('click', M);

function M() {

  console.log("hello");
  d1.style.display = "none"
  d2.style.display = "none"
  d3.style.display = "none"
  d4.style.display = "block"
  sele1.classList.remove("is-active")
  sele2.classList.remove("is-active")
  sele3.classList.remove("is-active")
  document.getElementById('greeting').innerHTML ='<b class="greeting">' + "Hire Me";
  fb4.style.border = '2px solid #0071e3';
  document.getElementById('bt1').classList.remove("is-active")
  document.getElementById('bt2').classList.remove("is-active")
  document.getElementById('bt3').classList.remove("is-active")
  document.getElementById('bt4').classList.add("is-active")
 

}




var myDate = new Date();
var hrs = myDate.getHours();
var mins = myDate.getMinutes();
var yyyy= myDate.getFullYear();
var greet;

if (hrs >= 0 && hrs <= 11.59)
  greet = 'Good Morning';
else if (hrs >= 12 && hrs <= 17)
  greet = 'Good Afternoon';
else if (hrs >= 17 && hrs <= 24)
  greet = 'Good Evening';

document.getElementById('greeting').innerHTML ='<b class="greeting">' + greet;
console.log(greet)




document.getElementById('cr').innerHTML="<p class>" + '©' +yyyy + "</p>"
// portfolio top scroll

const options = document.querySelector(".options"),
allOption = options.querySelectorAll(".option"),
arrowIcons = document.querySelectorAll(".icon i");

let isDragging = false, prevTouch, prevScroll;

const disabledKeys = ["u", "I"];

const handleIcons = (scrollVal) => {
    let maxScrollableWidth = options.scrollWidth - options.clientWidth;
    arrowIcons[0].parentElement.style.display = scrollVal <= 0 ? "none" : "flex";
    arrowIcons[1].parentElement.style.display = maxScrollableWidth > scrollVal ? "flex" : "none";
}

arrowIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        let scrollWidth = options.scrollLeft += icon.id === "left" ? -350 : 350;
        handleIcons(scrollWidth);
    });
});

allOption.forEach(option => {
    option.addEventListener("click", () => {
        options.querySelector(".active").classList.remove("active");
        option.classList.add("active");
    });
});

const dragStart = (e) => {
    isDragging = true
    prevTouch = e.pageX || e.touches[0].pageX;
    prevScroll = options.scrollLeft;
};

const dragging = e => {
    if(!isDragging) return;
    options.classList.add("dragging");
    options.scrollLeft = prevScroll - ((e.pageX || e.touches[0].pageX) - prevTouch);
    handleIcons(options.scrollLeft);
}

const stopDragging = () => {
    isDragging = false;
    options.classList.remove("dragging");
}



options.addEventListener("mousedown", dragStart);
options.addEventListener("touchstart", dragStart);
options.addEventListener("mousemove", dragging);
options.addEventListener("touchmove", dragging);
document.addEventListener("mouseup", stopDragging);
options.addEventListener("touchend", stopDragging);







