/**
 * Returns a random integer between min and max.
 * @param  Number min The lower bound of possible integers.
 * @param  Number max The upper bound of possible integers.
 * @return Number     A random integer between min and max.
 */
module.exports.getRandomInt = function(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}
