const coin=document.querySelector('.coin');
const f=document.querySelector('.ta');
const ff=document.querySelector('.tab');
coin.addEventListener('click',c)
let flip=[0,180]

function c()
{
    coin.classList.add('flip');
    // f.textContent=''

    let random=Math.floor(Math.random()*flip.length);
    if (random == 1) {
        f.textContent = 'HEADS';
        ff.textContent = 'TAILS';
        console.log("HEADS")
      } else if (random == 0) {
        f.textContent = 'TAILS';
        ff.textContent = 'HEADS';
        console.log("TAILS")
      }

    setTimeout(function() {

        coin.classList.remove('flip');
      }, 4000);

}


