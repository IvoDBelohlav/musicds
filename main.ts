// Servo position for turning right
radio.onReceivedNumber(function (receivedNumber) {
    if (receivedNumber == 1) {
        control12(50, 0);
    } else if (receivedNumber == 2) {
        control12(0, 50);
    }
});

function chooseAvoidanceDirection() {
    // Left distance
    let leftDistance = sonar.ping(DigitalPin.P1, DigitalPin.P2, PingUnit.Centimeters);
    // Right distance
    let rightDistance = sonar.ping(DigitalPin.P2, DigitalPin.P1, PingUnit.Centimeters);
    if (leftDistance < rightDistance) {
        // Turn left
        return -1;
    } else {
        // Turn right
        return 1;
    }
}

function rotateServo(position: number) {
    PCAmotor.Servo(PCAmotor.Servos.S1, position);
    // Wait for the servo to reach the target position
    basic.pause(500);
}

function performAvoidanceManeuver(direction: number) {
    // Avoidance maneuver duration (in milliseconds)
    let avoidanceDuration = 1000;
    control12(80 * direction, 80 * -direction);
    basic.pause(avoidanceDuration);
}

let trigger: DigitalPin = DigitalPin.P2;
let echo: DigitalPin = DigitalPin.P1;
let direction = chooseAvoidanceDirection();
let autoModeEnabled = true;
let distance = 0;
let obstacleThreshold = 0;
let crossroadSwitch = 0;
let rightDistance = 0;
let leftDistance = 0;
let turn = 0;
let path = 1;
let center: DigitalPin = DigitalPin.P15;
let left: DigitalPin = DigitalPin.P14;
let right: DigitalPin = DigitalPin.P13;

pins.setPull(DigitalPin.P15, PinPullMode.PullNone);
pins.setPull(DigitalPin.P14, PinPullMode.PullNone);
pins.setPull(DigitalPin.P13, PinPullMode.PullNone);
pins.setPull(DigitalPin.P1, PinPullMode.PullNone);
pins.setPull(DigitalPin.P2, PinPullMode.PullNone);

// Initial servo position
let servoStartPosition = 90;
// Servo position for turning left
let servoTurnLeftPosition = 45;
// Servo position for turning right
let servoTurnRightPosition = 135;

function turning(num: number = 0) {
    if (num === 1) {
        control12(-40, 100);
        turn = 0;
    } else if (num === 2) {
        control12(100, -40);
        turn = 0;
    } else {
        control12(60, 60);
        turn = 0;
    }
}

function control12(left: number = 0, right: number = 0) {
    let lw = Math.map(left, -100, 100, -200, 200) * -1;
    let rw = Math.map(right, -100, 100, -160, 160) * -1;
    PCAmotor.MotorRun(PCAmotor.Motors.M4, rw);
    PCAmotor.MotorRun(PCAmotor.Motors.M1, lw);
}

basic.forever(function () {
    if (autoModeEnabled) {
        let modeSwitch = 0;
        if (modeSwitch == 0 && crossroadSwitch == 1) {
            rotateServo(servoStartPosition);
            rotateServo(servoTurnLeftPosition);
            rotateServo(servoStartPosition);
            rotateServo(servoTurnRightPosition);
            rotateServo(servoStartPosition);
            direction = chooseAvoidanceDirection();
            control12(60, 60);
            crossroadSwitch = 0;
        }
        // Obstacle detection threshold (in centimeters)
        let obstacleThreshold = 10;
        distance = sonar.ping(DigitalPin.P1, DigitalPin.P2, PingUnit.Centimeters);
        if (distance > 0 && distance < obstacleThreshold) {
            // Obstacle nearby, perform avoidance maneuver
            performAvoidanceManeuver(direction);
        } else {
            let c: number = pins.digitalReadPin(center);
            let l: number = pins.digitalReadPin(left);
            let r: number = pins.digitalReadPin(right);
            if (c) {
                control12(80, 80);
            } else if (l) {
                control12(-60, 100);
            } else if (r) {
                control12(100, -60);
            } else if (l == path && r == path) {
                control12(60, 60);
            } else if (l != path && r != path && c != path) {
                control12(-60, -60);
                crossroadSwitch = 1;
                basic.pause(250);
                PCAmotor.MotorStopAll();
                if (turn == 1) {
                    control12(100, -60);
                } else if (turn == 2) {
                    control12(-60, 100);
                } else {
                    control12(60, 60);
                }
                if (l == path && r != path && c != path) {
                    crossroadSwitch = 1;
                    PCAmotor.MotorStopAll();
                } else if (l != path && r == path && c != path) {
                    crossroadSwitch = 1;
                    PCAmotor.MotorStopAll();
                }
            }
        }
    }
});
