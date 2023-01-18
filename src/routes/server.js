import { parse } from "https://deno.land/x/xml/mod.ts";
/* Entries in violators have the following format:
serialNumber: {
    closestDistance: Number,
    lastSeen: Date,
    pilotInfo: {name: String, email: String, phoneNumber: String}}
*/
const VIOLATORS = {}


const showMain = async ({ render}) => {
    const droneList = Object.entries(VIOLATORS)
    render("main.eta", {
      drones: droneList
    });
};



/* Fetch info about the drones near the nest in XML format;
return response in JSON format */
async function loadCloseDrones() {
    const response = await fetch("https://assignments.reaktor.com/birdnest/drones")
    const responseJSON = parse(await response.text())
    return responseJSON
}

/* Fetch information about pilot, who has violated the NFZ
*/
async function loadPilotInfo(serialNumber) {
    // Check (just in case) that the drone has in fact violated the NFZ
    if (!(serialNumber in VIOLATORS)) {
        console.log("Tried to fetch pilot information from pilot, who hadn't violated the NFZ (serialNumber:" + serialNumber +").")
        return {}
    }
    const response = await fetch("https://assignments.reaktor.com/birdnest/pilots/" + serialNumber);
    const json = await response.json();
    const pilotInfo = {
        name: json.firstName + " " + json.lastName,
        phoneNumber: json.phoneNumber,
        email: json.email,
    }
    return pilotInfo
}

/* Add pilot information asynchronously to the list of violator drones */
async function addPilotInfo(serialNumber) {
    const pilotInfo = await loadPilotInfo(serialNumber)
    VIOLATORS[serialNumber].pilotInfo = pilotInfo
}


/* Fetch new snapshot and update listing of violators. */
const updateService = async () => {
    const closeDronesJSON = await loadCloseDrones()
    updateDronePositions(closeDronesJSON)
    // remove the drones from list that haven't been seen for a while
    filterDronesSeenRecently(VIOLATORS)
    // TODO: update page somehow in browsers
}

/* Initiate the service, calls update-function every 2 seconds*/
const startService = async () => {
    setInterval(updateService, 2000)
}


const ORIGIN_POS = 250000
/* Return distance from coordinates (x, y) to nest in meters. */
function distanceToNest(x, y) {
    return Math.sqrt((x-ORIGIN_POS)**2 + (y-ORIGIN_POS)**2) / 1000
}


/* Update list of drones, which have violated the NFZ based on the recent snapshot.
Add drones that aren't on the violator list yet, update the closest distance each
violator has been to the nest, and keep track of when the violating drones have
been last seen.
*/
async function updateDronePositions(json) {
    const capture = json.report.capture
    var timeStamp = capture["@snapshotTimestamp"]
    var time = new Date(timeStamp)
    var drones = capture.drone
    for (const drone of drones) {
        var serialNumber = drone.serialNumber
        var x = Number(drone.positionX)
        var y = Number(drone.positionY)
        var distance = distanceToNest(x, y)
        if (distance < 100) {
            if (!(serialNumber in VIOLATORS)) {
                // add drone to listing
                VIOLATORS[serialNumber] = {
                    closestDistance: distance,
                    lastSeen: time,
                    pilotInfo: { // default values before info is fetched
                        name: "Loading...",
                        email: "Loading...",
                        phoneNumber: "Loading...",
                    }
                }
                // add pilot information to list of violators asynchronously
                addPilotInfo(serialNumber)
            } else {
                // update closest distance if needed
                var violatingDrone = VIOLATORS[serialNumber]
                if (distance < violatingDrone.closestDistance) {
                    violatingDrone.closestDistance = distance
                }
            }
        }
        // update timestamps of drones seen recently to allow filtering of old observations
        if (serialNumber in VIOLATORS) {
            VIOLATORS[serialNumber].lastSeen = time
        }
    }
}

const TEN_MINUTES = 10 * 60 * 1000 // in milliseconds
/* Remove drones from the list that haven't seen in the 10 minutes preceding the provided time.
Returns an array of the serial numbers of the drones that were removed from the list.
*/
function filterDronesSeenRecently(droneList) {
    const timeNow = Date.now()
    for (const [serialNumber, drone] of Object.entries(droneList)) {
        if (timeNow - drone.lastSeen > TEN_MINUTES) {
            delete droneList[serialNumber]
        }
    }
}


export { showMain, startService };