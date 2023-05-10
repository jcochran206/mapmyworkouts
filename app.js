//alert('hi');

'use strict';
alert('hi');
const months = ["January", "Februrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


    navigator.geolocation.getCurrentPosition(
    function(position){
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        console.log('coordinates in lat and long',latitude, longitude);
    }, 
    function(){
        alert('Can not get position');
    });



