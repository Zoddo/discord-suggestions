const util = require('util');

function pad(n) {
    return n < 10 ? '0' + n.toString(10) : n.toString(10);
}
function pad100(n) {
    return n < 100 ? (n < 10 ? '00' : '0') + n.toString(10) : n.toString(10);
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'];

function timestamp() {
    const d = new Date();
    const time = [pad(d.getHours()),
            pad(d.getMinutes()),
            pad(d.getSeconds())].join(':') +
        '.' + pad100(d.getMilliseconds());
    return [d.getDate(), months[d.getMonth()], time].join(' ');
}

module.exports = function() {
    console.log('%s - %s', timestamp(), util.format.apply(util, arguments));
};