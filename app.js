//alert('hi');

'use strict';
const months = ["January", "Februrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map; 
let mapEvent;//global variables

    navigator.geolocation.getCurrentPosition(
    function(position){
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        console.log('coordinates in lat and long',latitude, longitude);

        const coords = [latitude, longitude]

        map = L.map('map').setView(coords, 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker(coords).addTo(map)
        //map specific events to handle 
        map.on("click", function(mapE){
            mapEvent = mapE;
            form.classList.remove('hidden')
            inputDistance.focus()
            
        })
    }, 
    function(){
        alert('Can not get position');
    });

//form events 
form.addEventListener('submit', (e) => {
    e.preventDefault();
    //clear input fields 
    inputDistance.value = "";
    inputDuration.value = "";
    inputCadence.value = "";
    inputElevation.value = "";

    //display marker on submit
    const {lat, lng} = mapEvent.latlng

            L.marker([lat, lng])
            .addTo(map)
            .bindPopup(
                L.popup({
                    maxWidth: 100,
                    minWidth: 50,
                    autoClose: false,
                    closeOnClick: false,
                    className: 'running-popup'
                })
            )
            .setPopupContent('workouts')
            .openPopup();
});

inputType.addEventListener('change', function() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});


