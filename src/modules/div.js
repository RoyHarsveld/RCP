import "../styles.css";
import * as THREE from 'three';
import * as INITVAR from './initThree.js';
import { staircase } from '/src/index.js';
import { oldAmountOfSteps, currentAmountOfSteps, amountOfSteps } from '../index.js';
import {stepLength, stepWidth, stepHeight, stepAngle} from '/src/index.js';

class DIV{
    constructor(){

    }
}

export function createDiv(){
    console.log("CREATING DIV");
    var buttonText = "";
    var iDivIdText = "";

    console.log("   Current Amount of steps:", currentAmountOfSteps);
    console.log("   OLD Amount of steps:", oldAmountOfSteps);

    //DELETING INPUT FORMS
    if((currentAmountOfSteps - oldAmountOfSteps) < 0){
        console.log("     DELETING INPUT FORMS");
        const buttonId = document.getElementsByClassName("collapsible");
        const divId = document.getElementsByClassName("content")
        
        var x = oldAmountOfSteps;
        for (x; (x - currentAmountOfSteps) > 0; x--){
            // console.log(x);
            var lastButtonElement = buttonId[buttonId.length - 1];
            // var lastDivElement = divId[divId.length - 1];
            buttonId[buttonId.length - 1].remove(); 
            divId[divId.length - 1].remove();
            console.log(lastButtonElement);
        }
    }
    //CREATING INPUT FORMS
    if ((oldAmountOfSteps - currentAmountOfSteps) < 0) {
        console.log("     CREATING INPUT FORMS");
        var y  = oldAmountOfSteps;
        for (y; (y - currentAmountOfSteps) < 0; y++ ){
            var stepCounter = parseInt(y) + 1;
            buttonText = "Step " + stepCounter;
            iDivIdText = "step" + stepCounter;

            //create buttons
            var Button = document.createElement('button');
            Button.type = 'button';
            Button.className = 'collapsible btn';
            document.getElementById('stepInput').appendChild(Button);
            Button.innerHTML = buttonText;
            console.log(Button);

            //create button content
            var iDiv = document.createElement('nav');
            iDiv.id = iDivIdText;
            iDiv.className = 'content';
            iDiv.style = 'block';
            document.getElementById('stepInput').appendChild(iDiv);
            
            // Now create input forms and append to iDiv
            var inputLength = document.createElement('input');
            inputLength.value = 200;
            inputLength.type = 'number';
            inputLength.className = 'form-control';
            inputLength.id = 'L';
            inputLength.placeholder = 'Length'
            iDiv.appendChild(inputLength);

            var inputWidth = document.createElement('input');
            inputWidth.value = 1000;
            inputWidth.type = 'number';
            inputWidth.className = 'form-control';
            inputWidth.id = 'W';
            inputWidth.placeholder = 'Width'
            iDiv.appendChild(inputWidth);

            var inputHeigth = document.createElement('input');
            inputHeigth.value = 150;
            inputHeigth.type = 'number';
            inputHeigth.className = 'form-control';
            inputHeigth.id = 'H';
            inputHeigth.placeholder = 'Height'
            iDiv.appendChild(inputHeigth);

            var inputAngle = document.createElement('input');
            inputAngle.value = 90;
            inputAngle.type = 'number';
            inputAngle.className = 'form-control';
            inputAngle.id = 'A';
            inputAngle.placeholder = 'Angle'
            iDiv.appendChild(inputAngle);
        }
    }
    //loop to add collapsible buttons
    var coll = document.getElementsByClassName("collapsible btn");
    var i;
    for (i = 0; i < coll.length; i++) {
      coll[i].removeEventListener("click", showAndHide, false)
      coll[i].addEventListener("click", showAndHide, false)
      
      function showAndHide(){
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display == "none" || content.style.display === "") { //changed to also accept the original value, which is "" instead of "none"
          content.style.display = "block";

        } else {
          content.style.display = "none";

        }
      }

      // function showAndHide(){
      //   // this.classList.toggle("active");
      //   var content = this.nextElementSibling;
      //   if (content.style.display.emptyOrEqualTo('block')) {
      //     content.style.display = "none";
      //   } else {
      //     content.style.display = "block";
      //   }
      // }
    }
}