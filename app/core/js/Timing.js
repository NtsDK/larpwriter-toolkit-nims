const R = require('ramda');
const Timing = {};
exports.Timing = Timing;

// call examples
//timing: Timing.linear,
//timing: Timing.quad,
//timing: Timing.circ,
//timing: Timing.bounce,
//timing: Timing.makeEaseOut(Timing.bounce),
//timing: Timing.makeEaseInOut(Timing.bounce),
//timing: Timing.back(3.5),
//timing: Timing.elastic(1.5),
//timing: Timing.makeEaseInOut(Timing.poly(4)),

Timing.linear = (timeFraction) => {
    return timeFraction;
}

Timing.quad = ( progress) => {
    return Math.pow(progress, 2)
}

Timing.poly = R.curry((x, progress) => {
    return Math.pow(progress, x)
})

Timing.circ = (timeFraction) => {
    return 1 - Math.sin(Math.acos(timeFraction))
}

Timing.back = R.curry((x, timeFraction) => {
    return Math.pow(timeFraction, 2) * ((x + 1) * timeFraction - x)
})

Timing.bounce = (timeFraction) => {
    for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
        if (timeFraction >= (7 - 4 * a) / 11) {
            return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2)
        }
    }
}

Timing.elastic = (x, timeFraction) => {
    return Math.pow(2, 10 * (timeFraction - 1)) * Math.cos(20 * Math.PI * x / 3 * timeFraction)
}

Timing.makeEaseOut = (timing) => {
    return function(timeFraction) {
        return 1 - timing(1 - timeFraction);
    }
}

Timing.makeEaseInOut = (timing) => {
    return function(timeFraction) {
        if (timeFraction < .5) {
            return timing(2 * timeFraction) / 2;
        } else {
            return (2 - timing(2 * (1 - timeFraction))) / 2;
        }
    }
}