document.addEventListener('DOMContentLoaded', () => {
    loadBikes();
	loadLocations();
});

function loadBikes() {
    fetch('/api/bikes')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('bikes-container');
            data.forEach(bike => {
                const bikeDiv = document.createElement('div');
                bikeDiv.className = 'bike';
                bikeDiv.innerHTML = `
                    <img src="${bike.image}" alt="${bike.name}">
                    <h3>${bike.name}</h3>
                    <p>${bike.description}</p>
                    <p>price: ${bike.pricePerHour} $/hour</p>
                `;
                bikeDiv.onclick = () => selectBike(bike);
                container.appendChild(bikeDiv);
            });
        });
}

function loadLocations() {
    fetch('/api/locations')
        .then(response => response.json())
        .then(data => {
            const locationSelect = document.getElementById('location-select');
            data.forEach(location => {
                const option = document.createElement('option');
                option.value = location.id;
                option.textContent = location.name;
                locationSelect.appendChild(option);
            });
        });
}

function selectBike(bike) {
	document.getElementById('reservation-title').innerText = `${bike.name} reservation`;
    document.getElementById('reservation-form').style.display = 'block';
    document.getElementById('reserve-button').onclick = () => reserveBike(bike.id);
}

function reserveBike(bikeId) {
	const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const rentalLocationId = document.getElementById('location-select').value;
    const rentalDate = document.getElementById('rental-date').value;
    const rentalTime = document.getElementById('rental-time').value;

    fetch('/api/reserve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bikeId, rentalLocationId, rentalDate, rentalTime, name, phone })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('message').innerHTML = `${data.message} <a href="${data.activationLink}" target="_blank">link for activation</a>`;
		localStorage.setItem('bikeId', bikeId);
		localStorage.setItem('renterName', name);
        localStorage.setItem('renterPhone', phone);
    })
	.catch(error => {
        console.error('error:', error);
        document.getElementById('message').innerText = 'error while reservating.';
    });
}