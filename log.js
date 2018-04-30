const chalk = require('chalk');
const moment = require('moment');

module.exports = function (moduleName, color) {
    
    this.moduleName = moduleName;
    this.color = color;

    this.debug = function (...text) {
        genericLog(...text);
    }
    this.warn = function (...text) {
        genericLog(chalk.yellow(...text));
    }
    this.error = function (...text) {
        genericLog(chalk.red(...text));
    }

    function genericLog(...text){
        console.log(timestamp(), chalk[color](`[${moduleName}]`), ...text);
    }

    function timestamp() {
        return moment().format('HH:mm:ss:SS');
    }
}