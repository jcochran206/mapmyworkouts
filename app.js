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

//Refactor
class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration){
        this.coords = coords; //[lat, lng]
        this.distance = distance; //meters
        this.duration = duration;// in min
    }
}

class Running extends Workout {
    type = 'running'
    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration);
        this.cadence = cadence
        this.calcPace();
    }

    calcPace(){
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain){
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }

    calcSpeed(){
        this.speed = this.distance / (this.duration / 60);
    }
}

//////// Application Architecture 
class App {
    //private instance inherted by classes
    #map;
    #mapEvent;
    #workouts = [];
    //initial build 
    constructor(){
        //get position
        this._getPosition();

        form.addEventListener('submit', this._newWorkout.bind(this));
        
        inputType.addEventListener('change', this._toggleElevation.bind(this));
    }

    _getPosition(){
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
            alert('Can not get position');
        });
    }

    _loadMap(position){
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        console.log('coordinates in lat and long',latitude, longitude);

        const coords = [latitude, longitude]

        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        L.marker(coords).addTo(this.#map)
        //map specific events to handle 
        this.#map.on("click", this._showForm.bind(this))
    }

    _showForm(mapE){
        this.#mapEvent = mapE;
        form.classList.remove('hidden')
        inputDistance.focus()
    }

    _toggleElevation(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e){
        //helper function 
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);
        e.preventDefault();
        
        //get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;

        //if activity is running create running object 
        if(type === 'running'){
            const cadence = +inputCadence.value;
            //check if data is valid
            if(
                !Number.isFinite(distance) || 
                !Number.isFinite(duration) ||
                !Number.isFinite(cadence)  ||
                !allPositive(distance, duration, cadence)
                ) 
                return alert('inputs have to be positive numbers')

            workout = new Running([lat, lng], distance, duration, cadence);
            
        }
        //if activity is cycling, create cycle object
        if(type === 'cycling'){
            const elevation = +inputElevation.value;
             if(
                !Number.isFinite(distance) || 
                !Number.isFinite(duration) ||
                !Number.isFinite(elevation) ||
                !allPositive(distance, duration)
                ) 
                return alert('inputs have to be positive numbers')

            workout = new Cycling([lat, lng], distance, duration, elevation);
        }
        // add new object to workout array 
        this.#workouts.push(workout);
        console.log(workout);
        //render work out on map as marker 
        this.renderWorkoutmarker(workout);
    
        
        //render workout on list 


        //hide form + clear input fields 
        inputDistance.value = "";
        inputDuration.value = "";
        inputCadence.value = "";
        inputElevation.value = "";
    
        //display marker on submit

    }

    renderWorkoutmarker(workout){
        L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(
            L.popup({
                maxWidth: 100,
                minWidth: 50,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,
            })
        )
        .setPopupContent('workout')
        .openPopup();
    }
}

const app = new App();