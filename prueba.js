function blabla(){
 var step = {
     "step" : 0
 }

 nextstep(step);

 console.log(step);
}

function nextstep(x){
    x.step += 1;
}

blabla();