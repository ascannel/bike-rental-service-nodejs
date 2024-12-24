const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 1337;

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/message', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'message.html'));
});

// data about bikes
const bikesDataPath = path.join(__dirname, 'db', 'bikes.json');
const locationsDataPath = path.join(__dirname, 'db', 'rentalLocations.json');
const rentalsDataPath = path.join(__dirname, 'db', 'rentals.json');
let bikes = require(bikesDataPath);
let locations = require(locationsDataPath);

// Initialize rentals file if it doesn't exist
if (!fs.existsSync(rentalsDataPath)) {
    fs.writeFileSync(rentalsDataPath, JSON.stringify({ active: {}, completed: {} }, null, 2));
}

// Function to read rentals
const readRentals = () => {
    const data = fs.readFileSync(rentalsDataPath);
    return JSON.parse(data);
};

// Function to write rentals
const writeRentals = (rentals) => {
    fs.writeFileSync(rentalsDataPath, JSON.stringify(rentals, null, 2));
};

// list of bikes
app.get('/api/bikes', (req, res) => {
    res.json(bikes);
});

// list of rental locations
app.get('/api/locations', (req, res) => {
    res.json(locations);
});

// reservation
app.post('/api/reserve', (req, res) => {
    const { bikeId, name, phone, rentalDate, rentalTime } = req.body;
    const bike = bikes.find(b => b.id === bikeId);
    if (bike) {
        // Save renter data in rentals.json
        const rentals = readRentals();
        rentals.active[bikeId] = { name, phone };
        writeRentals(rentals);

        // reservation message
        res.json({
            message: 'bike successfully rented!',
            bikeId,
            name,
            phone,
            rentalDate,
            rentalTime,
            activationLink: `http://localhost:${PORT}/activate/${bikeId}`
        });
    } else {
        res.status(404).json({ message: 'bike not found' });
    }
});

// rent activation
app.get('/activate/:bikeId', (req, res) => {
    const bikeId = req.params.bikeId;
    const bike = bikes.find(b => b.id === bikeId);
    
    if (!bike) {
        return res.redirect(`/message?title=error&body=bike not found`);
    }

    // rental places
    const locations = require(locationsDataPath);
    
    // dropdown list with rental places
    let options = locations.map(location => `<option value="${location.id}">${location.name}</option>`).join('');
    
    res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            
            <title>rent activation</title>
			<style>
			body {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 100vh; /* Высота на весь экран */
				margin: 0;
				font-family: Arial, sans-serif; /* Шрифт Arial */
				background-color: #f0f0f0; /* Светлый фон */
			}
			</style>
        </head>
        <body>
            <div class="container">
                <h1>rent activated for ${bikeId} bike</h1>
                <form action="/complete" method="POST">
                    <input type="hidden" name="bikeId" value="${bikeId}">
                    <label for="rentalLocationId">choose rent location:</label>
                    <select name="rentalLocationId" required>
                        ${options}
                    </select>
					<br>
                    <label for="name">name:</label>
                    <input type="text" name="name" required>
					<br>
                    <label for="phone">phone:</label>
                    <input type="tel" name="phone" required>
					<br>
                    <label for="rentalHours">rent time:</label>
                    <input type="number" name="rentalHours" placeholder="hours" required>
					<br>
                    <button type="submit">end rent</button>
                </form>
            </div>
        </body>
        </html>
    `);
	console.log(`Received bikeId: ${bikeId}`); 
});

// rent completion
app.post('/complete', (req, res) => {
    const { bikeId, rentalLocationId, rentalHours, name, phone } = req.body;
	console.log(`Received bikeId: ${bikeId}`); // log bikeId
	console.log(`Request body: ${JSON.stringify(req.body)}`);

    const bike = bikes.find(b => b.id === bikeId);
    const rentals = readRentals();

    if (!rentals.active[bikeId]) {
        return res.redirect(`/message?title=error&body=rent not found`);
    }
	
    rentals.completed[bikeId] = { name, phone };
    console.log(`active rentals: ${JSON.stringify(rentals.active)}`);
    console.log(`completed rentals: ${JSON.stringify(rentals.completed)}`);
    if (rentals.completed[bikeId].name !== rentals.active[bikeId].name || rentals.completed[bikeId].phone !== rentals.active[bikeId].phone) {
        return res.redirect(`/message?title=error&body=renter data do not match`);
    }

    const cost = Math.ceil(rentalHours) * bike.pricePerHour;
	
    // Remove from active rentals
    delete rentals.active[bikeId];
	delete rentals.completed[bikeId];
    writeRentals(rentals);
	
	 res.redirect(`/message?title=completed&body=rent ended. cost: $${cost}`);
});

// server start
app.listen(PORT, () => {
    console.log(`server started on http://localhost:${PORT}`);
});
