module.exports = function() {
   let date = new Date();
   return date.getTime() + '-' + Math.floor(Math.random() * 100000).toString();
};
