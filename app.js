//alert('hi');

'use strict';


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
    clicks = 0;

    constructor(coords, distance, duration){
        this.coords = coords; //[lat, lng]
        this.distance = distance; //meters
        this.duration = duration;// in min
    }

    _setDescription() {
        const months = ["January", "Februrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} 
        ${this.date.getDate()}`;
    }

    click(){
        this.click++;
    }
}

class Running extends Workout {
    type = 'running'
    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration);
        this.cadence = cadence
        this.calcPace();
        this._setDescription();
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
        this._setDescription();
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
    #mapZoomLevel = 13;

    //initial build 
    constructor(){
        //get position
        this._getPosition();

        //getLocalStorage data
        this._getLocalStorageData();

        form.addEventListener('submit', this._newWorkout.bind(this));
        
        inputType.addEventListener('change', this._toggleElevation.bind(this));

        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
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
        //this is needed here for localstorage loaded data
        this.#workouts.forEach(work => {
          this._renderWorkoutmarker(work);  
        })
    }

    _showForm(mapE){
        this.#mapEvent = mapE;
        form.classList.remove('hidden')
        inputDistance.focus()
    }

    _hideForm(){
        //empty inputs
        inputDistance.value = "";
        inputDuration.value = "";
        inputCadence.value = "";
        inputElevation.value = "";

        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1000);
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
        this._renderWorkoutmarker(workout);
    
        
        //render workout on list 
        this._renderWorkout(workout);

        //hide form + clear input fields 
        this._hideForm();
        
    
        //set localstorage to keep workouts
        this._setLocalStorage();

    }

    _renderWorkoutmarker(workout){
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

    _renderWorkout(workout){
       let html = `
       <li class="workout workout--${workout.type}" data-id="${workout.id}">
       <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;

        if(workout.type === 'running'){
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(1)}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div>
        </li>
            `;
        }

        if(workout.type === 'cycling'){
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">m</span>
            </div>
        </li> 
            `;
        }
        form.insertAdjacentHTML('afterend', html);
    }

    _moveToPopup(e){
        const workoutEl = e.target.closest('.workout');
        if(!workoutEl) return;

        console.log(workoutEl, 'element of workout')

        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);

        this.#map.setView(workout.coords, 15, {
            animate: true,
            pan: {
                duration: 1,
            }
        });

        //workout clicks
        workout.click();
    }

    _setLocalStorage(){
       localStorage.setItem('workouts', JSON.stringify(this.#workouts)); 
    }

    _getLocalStorageData(){
        //this converts data into json for workouts
        const data = JSON.parse(localStorage.getItem('workouts'));
        console.log(data, 'localstorage item');
        //conditional to check for data
        if(!data){return};
        //passes data to workouts
        this.#workouts = data;
        //loops thru without creating a new array 
        this.#workouts.forEach(work => {
          this._renderWorkout(work);
        });
    }
}

const app = new App();