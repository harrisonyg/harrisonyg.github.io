const RBtn=document.getElementById('rbtn');
const LBtn=document.getElementById('lbtn');
// const img=[1,2,3,4,5,6,7,8,9];
const srn=document.getElementById('screen')
var num=0;

RBtn.addEventListener('click',R);

function R()
{
if (num <= 8)
{
   num++;

}
else
{
  return
}
srn.innerHTML=`<img src="gallery\/${num}.jpeg"  >`;
}




LBtn.addEventListener('click',L);
function L()
{ 
    if (num>1)
    {
       num--;
    
    }
    else
    {
      return;
    }

srn.innerHTML=`<img src="gallery\/${num}.jpeg" >`;

}

