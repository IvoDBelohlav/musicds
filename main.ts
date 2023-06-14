pins.setPull(DigitalPin.P15, PinPullMode.PullNone);
pins.setPull(DigitalPin.P14, PinPullMode.PullNone);
pins.setPull(DigitalPin.P13, PinPullMode.PullNone);
pins.setPull(DigitalPin.P1, PinPullMode.PullNone);
pins.setPull(DigitalPin.P2, PinPullMode.PullNone);

let trigger: DigitalPin = DigitalPin.P2;
let echo: DigitalPin = DigitalPin.P1;

let direction: number = chooseAvoidanceDirection();
let autoModeEnabled: boolean = true;
let servoStartPosition: number = 90; // Initial servo position
let servoTurnLeftPosition: number = 45; // Servo position for turning left
let servoTurnRightPosition: number = 135; // Servo position for turning right

radio.onReceivedNumber(function (receivedNumber: number) {
    if (receivedNumber === 1) {
        control12(50, 0); // Turn left
    } else if (receivedNumber === 2) {
        control12(0, 50); // Turn right
    }
});

function turning(num: number = 0) {
    if (num === 1) {
        control12(-40, 100);
        turn = 0;
    } else if (num === 2) {
        control12(100 - 40);
        turn = 0;
    } else {
        control12(100, 100);
        turn = 0;
    }
}

function control12(left: number = 0, right: number = 0) {
    let lw = Math.map(left, -100, 100, -200, 200) * -1;
    let rw = Math.map(right, -100, 100, -160, 160) * -1;
    PCAmotor.MotorRun(PCAmotor.Motors.M4, rw);
    PCAmotor.MotorRun(PCAmotor.Motors.M1, lw);
}

function chooseAvoidanceDirection(): number {
    let leftDistance: number = sonar.ping(DigitalPin.P1, DigitalPin.P2, PingUnit.Centimeters); // Left distance
    let rightDistance: number = sonar.ping(DigitalPin.P2, DigitalPin.P1, PingUnit.Centimeters); // Right distance

    if (leftDistance < rightDistance) {
        return -1; // Turn left
    } else {
        return 1; // Turn right
    }
}

function performAvoidanceManeuver(direction: number): void {
    let avoidanceDuration: number = 1000; // Avoidance maneuver duration (in milliseconds)
    control12(80 * direction, 80 * -direction); // Drive in the selected direction
    basic.pause(avoidanceDuration);
}

function rotateServo(position: number): void {
    PCAmotor.Servo(PCAmotor.Servos.S1, position);
    basic.pause(500); // Wait for the servo to reach the target position
}

basic.forever(function () {
    if (autoModeEnabled) {

        if (modeSwitch === 0 && crossroadSwitch === 1) {
            rotateServo(servoStartPosition);
            rotateServo(servoTurnLeftPosition);
            rotateServo(servoStartPosition);
            rotateServo(servoTurnRightPosition);
            rotateServo(servoStartPosition);
            direction = chooseAvoidanceDirection();
            control12(60, 60);
            crossroadSwitch = 0;
        }
        let obstacleThreshold: number = 10; // Obstacle detection threshold (in centimeters)
        let distance: number = sonar.ping(DigitalPin.P1, DigitalPin.P2, PingUnit.Centimeters);

        if (distance > 0 && distance < obstacleThreshold) {
            // Obstacle nearby, perform avoidance maneuver
            performAvoidanceManeuver(direction);
        } else {

            // No obstacle, control the vehicle based on sensor data
            let c: number = pins.digitalReadPin(center);
            let l: number = pins.digitalReadPin(left);
            let r: number = pins.digitalReadPin(right);

            if (c) {
                control12(80, 80); // Drive straight
            } else if (l) {

                control12(-60, 100); // Turn left
            } else if (r) {
                control12(100, -60); // Turn right

            } else if (l === path && r === path) {
                control12(60, 60); // Drive straight

            } else if (l !== path && r !== path && c !== path) {
                control12(-60, -60); 
                crossroadSwitch = 1
                basic.pause(250);
                PCAmotor.MotorStopAll();

                if (turn === 1) {
                    control12(100, -60);

                } else if (turn === 2) {
                    control12(-60, 100);

                } else {
                    control12(60, 60);
                }
                if (left === path && right !== path && center !== path){
                    crossroadSwitch = 1
                    PCAmotor.MotorStopAll();

                } else if (left != path && right == path && center !== path){
                    crossroadSwitch = 1
                    PCAmotor.MotorStopAll();

                }
            }
        }
    }
});

let turn = 0;
let modeSwitch: number = 0;
let path: number = 1;
let crossroadSwitch: number = 0;
let counting: number = 0;
let changableSpeed: number = 80;
let ultrasonicSwitch: number = 0;
let ultrasonicON_OFF: number = 1;
let center: DigitalPin = DigitalPin.P15;
let left: DigitalPin = DigitalPin.P14;
let right: DigitalPin = DigitalPin.P13;





