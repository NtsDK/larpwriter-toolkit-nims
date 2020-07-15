//const R = require('ramda');

// const Timing = {};
// module.exports = Timing;

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

export const linear = timeFraction => timeFraction;

export const quad = progress => (progress ** 2);

export const poly = R.curry((x, progress) => (progress ** x));

export const circ = timeFraction => 1 - Math.sin(Math.acos(timeFraction));

export const back = R.curry((x, timeFraction) => (timeFraction ** 2) * ((x + 1) * timeFraction - x));

export const bounce = (timeFraction) => {
    for (let a = 0, b = 1, result; ; a += b, b /= 2) {
        if (timeFraction >= (7 - 4 * a) / 11) {
            return -(((11 - 6 * a - 11 * timeFraction) / 4) ** 2) + (b ** 2);
        }
    }
};

export const elastic = (x, timeFraction) => (2 ** (10 * (timeFraction - 1))) * Math.cos(20 * Math.PI * x / 3 * timeFraction);

export const makeEaseOut = timing => function (timeFraction) {
    return 1 - timing(1 - timeFraction);
};

export const makeEaseInOut = timing => function (timeFraction) {
    if (timeFraction < 0.5) {
        return timing(2 * timeFraction) / 2;
    }
    return (2 - timing(2 * (1 - timeFraction))) / 2;
};

export default {
    linear,
    quad,
    poly,
    circ,
    back,
    bounce,
    elastic,
    makeEaseOut,
    makeEaseInOut
};
