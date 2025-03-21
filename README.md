# Bike Rental System

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)

A bicycle rental management system with interactive booking features. Supports reservation, activation, and completion of rentals via a web interface.

## Key Features
- Browse available bikes (Mountain, Road, City)
- Reservation with:
  - Personal details (name, phone)
  - Date/time selection
  - Pickup location
- Unique activation link system
- Hourly cost calculation
- Renter data validation

## Technologies
- **Backend**: Node.js + Express
- **Data Storage**: JSON files 
- **Frontend**: Vanilla JS + CSS Grid/Flex
- **Validation**:
  - Data consistency checks at rental completion
  - Form field validation

## Data Structure
```json
{
  "active": {
    "bikeId": {
      "name": "John",
      "phone": "+123456789"
    }
  },
  "completed": {}
}
```

## Workflow
1. Reservation → Generate activation link
2. Activation → Select pickup location
3. Completion → Cost calculation + data cleanup

## Rental Lifecycle
```
[Reservation] → [Activation] → [Usage] → [Completion]
```

## Limitations
- No user authentication
- Data persistence via JSON files only
- Fixed pickup locations (2 predefined)

_For demonstration purposes only. Not production-ready._
