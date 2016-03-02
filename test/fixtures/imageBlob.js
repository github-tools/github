'use strict';

function loadImage(imageReady) {
   if (typeof window === 'undefined') { // We're in NodeJS
      loadInNode(imageReady);
   } else { // We're in the browser
      if (typeof window._phantom !== 'undefined') {
         loadInPhantom(imageReady);
      } else {
         loadInRealBrowser(imageReady);
      }
   }
}

function loadInNode(imageReady) {
   var fs = require('fs');
   var path = require('path');

   var imageBlob = fs.readFileSync(path.join(__dirname, 'gh.png')); // This is a Buffer().
   var imageB64 = imageBlob.toString('base64');

   imageReady(imageB64, imageBlob);
}

function loadInPhantom(imageReady) {
   var xhr = new XMLHttpRequest();

   xhr.responseType = 'blob';
   xhr.open('GET', 'base/test/fixtures/gh.png');
   xhr.onload = function() {
      var reader = new FileReader();

      reader.onloadend = function() {
         var imageB64 = btoa(reader.result);
         var imageBlob = reader.result;

         imageReady(imageB64, imageBlob);
      };

      reader.readAsBinaryString(xhr.response);
   };

   xhr.send();
}

function loadInRealBrowser(imageReady) {
   // jscs:disable
   var imageB64 = 'iVBORw0KGgoAAAANSUhEUgAAACsAAAAmCAAAAAB4qD3CAAABgElEQVQ4y9XUsUocURQGYN/pAyMWBhGtrEIMiFiooGuVIoYsSBAsRSQvYGFWC4uFhUBYsilXLERQsDA20YAguIbo5PQp3F3inVFTheSvZoavGO79z+mJP0/Pv2nPtlfLpfLq9tljNquO62S8mj1kmy/8nrHm/Xaz1930bt5n1+SzVmyrilItsod9ON0td1V59xR9hwV2HsMRsbfROLo4amzsRcQw5vO2CZPJEU5CM2cXYTCxg7CY2mwIVhK7AkNZYg9g4CqxVwNwkNg6zOTKMQP1xFZgKWeXoJLYdSjl7BysJ7YBIzk7Ap8TewLOE3oOTtIz6y/64bfQn55ZTIAPd2gNTOTurcbzp7z50v1y/Pq2Q7Wczca8vFjG6LvbMo92hiPL96xO+eYVPkVExMdONetFXZ+l+eP9cuV7RER8a9PZwrloTXv2tfv285ZOt4rnrTXlydxCu9sZmGrdN8eXC3ATERHXsHD5wC7ZL3HdsaX9R3bUzlb7YWvn/9ipf93+An8cHsx3W3WHAAAAAElFTkSuQmCC';
   var imageBlob = new Blob();
   // jscs:enable

   imageReady(imageB64, imageBlob);
}

module.exports = loadImage;
