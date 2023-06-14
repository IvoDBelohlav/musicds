pins.setPull(DigitalPin.P15, PinPullMode.PullNone);
pins.setPull(DigitalPin.P14, PinPullMode.PullNone);
pins.setPull(DigitalPin.P13, PinPullMode.PullNone);
pins.setPull(DigitalPin.P1, PinPullMode.PullNone);
pins.setPull(DigitalPin.P2, PinPullMode.PullNone);

let trigger: DigitalPin = DigitalPin.P2;
let echo: DigitalPin = DigitalPin.P1;

function control12(left: number = 0, right: number = 0) {
    let lw = Math.map(left, -100, 100, -200, 200) * -1;
    let rw = Math.map(right, -100, 100, -160, 160) * -1;
    PCAmotor.MotorRun(PCAmotor.Motors.M4, rw);
    PCAmotor.MotorRun(PCAmotor.Motors.M1, lw);
}

function chooseAvoidanceDirection(): number {
    let randomDirection: number = Math.randomRange(0, 1); // Náhodně vybrat směr vyhýbání se
    if (randomDirection === 0) {
        return -1; // Otočení doleva
    } else {
        return 1; // Otočení doprava
    }
}

function performAvoidanceManeuver(direction: number): void {
    let avoidanceDuration: number = 1000; // Doba trvání manévru vyhýbání se (v milisekundách)
    control12(80 * direction, 80 * -direction); // Jízda ve vybraném směru
    basic.pause(avoidanceDuration);
    PCAmotor.MotorStopAll();
}

let direction: number = chooseAvoidanceDirection();
let autoModeEnabled: boolean = true;

basic.forever(function () {
    if (autoModeEnabled) {
        let obstacleThreshold: number = 10; // Práh pro detekci překážky (v centimetrech)
        let distance: number = sonar.ping(
            DigitalPin.P1,
            DigitalPin.P2,
            PingUnit.Centimeters
        );

        if (distance > 0 && distance < obstacleThreshold) {
            // Překážka v blízkosti, vykonat vyhýbací manévr
            performAvoidanceManeuver(direction);
        } else {
            // Žádná překážka, řízení vozidla na základě senzorových dat
            let c: number = pins.digitalReadPin(center);
            let l: number = pins.digitalReadPin(left);
            let r: number = pins.digitalReadPin(right);

            if (c) {
                control12(60, 60); // Jízda rovně
            } else if (l) {
                control12(-40, 100); // Otočení doleva
            } else if (r) {
                control12(100, -40); // Otočení doprava
            } else if (l == path && r == path) {
                control12(60, 60); // Jízda rovně
            } else if (l != path && r != path && c != path) {
                control12(-60, -60); // Zpětná jízda
                basic.pause(250);
                PCAmotor.MotorStopAll();

                if (counting >= 10) {
                    radio.onReceivedNumber(function (receivedNumber: number) {
                        if (receivedNumber === 1) {
                            control12(50, 0); // Otočení doleva
                        }
                        if (receivedNumber === 2) {
                            control12(0, 50); // Otočení doprava
                        }
                    })

                    counting = 0;
                } else if (counting < 10) {
                    counting = counting + 1;
                    PCAmotor.MotorStopAll();
                }
            }
        }
    }
});


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






function onForever() {
    if (modeSwitch === 0) {
        let senzorL = pins.digitalReadPin(left);
        let senzorR = pins.digitalReadPin(right);
        if (senzorL == path && senzorR == path) {
            if (crossroadSwitch == 0) {
                control12(60, 60);
            } else if (crossroadSwitch == 1) {
                PCAmotor.MotorStopAll();
                counting = 0;
            }
        } else if (senzorL != path && senzorR != path) {
            PCAmotor.MotorStopAll();
            if (counting >= 10) {
                control12(870, 1);
                counting = 0;
            } else if (counting < 10) {
                counting = counting + 1;
                PCAmotor.MotorStopAll();
                control12(50, 100);
                control12( -50, 100);
                
            }
        } else if (senzorL == path && senzorR != path) {
            control12(-80, 0);
            counting = 0;
        } else if (senzorL != path && senzorR == path) {
            control12(0, 100);
            counting = 0;
        }
    } else if (modeSwitch == 1) {
        if (path == 1) {
            PCAmotor.MotorRun(PCAmotor.Motors.M1, 0);
            PCAmotor.MotorRun(PCAmotor.Motors.M4, 0);
        } else if (path == 0) {
            control12(400, 1);
            control12( 510, 1);
            control12( 1100, 1);
            control12( 480, 1);
            control12( 2100, 1);
            control12( 500, 1);
            control12( 900, 1);
            control12( 480, 1);
        }
    }
}



  

