Se buscan mantenedores
Aplicar dentro de

Github.js
Descargas por mes Ultima versión Gitter Travis Codecov

Github.js proporciona una envoltura mínima de nivel superior alrededor de la API de Github.

Uso
/ * Los 
   datos se pueden recuperar de la API utilizando devoluciones de llamada (como en las versiones <1.0) 
   o utilizando una nueva API basada en promesas. La API basada en promesas devuelve la 
   promesa de solicitud de 
Axios sin procesar . * / 
importar  GitHub  desde  'github-api' ;

// cliente no autenticado 
const  gh  =  new  GitHub ( ) ; 
deje  gist  =  gh . getGist ( ) ;  // no una esencia sin embargo, 
lo esencial . create ( { 
   public : true , 
   description : 'Mi primera esencia' , 
   archivos : { 
      "file1.txt" : { 
         contenido : "¡No son geniales las esencias!" 
      } 
   } 
} ) . entonces ( función ({ data } )  { 
   // ¡Promesas! 
   dejar  createdGist  =  datos ; 
   volver  gist . leer ( ) ; 
} ) . then ( function ( { data } )  { 
   let  retrivedGist  =  data ; 
   // hacer cosas interesantes 
} ) ;
var  GitHub  =  require ( 'github-api' ) ;

// basic auth 
var  gh  =  new  GitHub ( { 
   nombre de usuario : 'FOO' , 
   contraseña : 'NotFoo' 
   / * también aceptable: 
      token: 'MY_OAUTH_TOKEN' 
    * / 
} ) ;

var  me  =  gh . getUser ( ) ;  // ningún usuario especificado tiene como valor predeterminado el usuario para el que se 
me proporcionaron las credenciales . listNotifications ( función ( err ,  notificaciones )  { 
   // hacer algunas cosas 
} ) ;

var  clayreimann  =  gh . getUser ( 'clayreimann' ) ; 
clayreimann . listStarredRepos ( function ( err ,  repos )  { 
   // ¡mira todos los repositorios destacados! 
} ) ;
Documentación de API
La documentación de la API está alojada en páginas de github y se genera a partir de JSDoc; cualquier contribución debe incluir JSDoc actualizado.

Instalación
Github.jsestá disponible desde npmo sin kg .

npm instalar github-api
<! - solo fuente github-api (5.3kb) -> 
< script  src = " https://unpkg.com/github-api/dist/GitHub.min.js " > </ script >

<! - independiente (20,3 kb) -> 
< script  src = " https://unpkg.com/github-api/dist/GitHub.bundle.min.js " > </ script >
Compatibilidad
Github.js se prueba en el LTS del nodo y en las versiones actuales.

Contribuyendo
¡Damos la bienvenida a contribuciones de todo tipo! Esta sección lo guiará a través de la configuración de su entorno de desarrollo.

Preparar
Instale Node versión 8,10 u 11. A menudo puede resultar útil utilizar un conmutador de versión Node como NVM .
Bifurca este repositorio a tu cuenta de GitHub.
Clona la bifurcación en tu máquina de desarrollo ( git clone https://github.com/{YOUR_USERNAME}/github).
Desde la raíz del repositorio clonado, ejecute npm install.
Envíe un correo electrónico a jaredrewerts@gmail.com con el asunto API de GitHub - Solicitud de token de acceso personal
Se generará un token de acceso personal para nuestro usuario de prueba, @ github-tools-test.

Establezca la variable de entorno GHTOOLS_USERen github-tools-test.
export GHTOOLS_USER=github-tools-test

Establezca la variable de entorno GHTOOLS_PASSWORDen el token de acceso personal que se generó para usted.
export GHTOOLS_PASSWORD={YOUR_PAT}

NOTA Los usuarios de Windows pueden utilizar esta guía para aprender a configurar variables de entorno en Windows.

Pruebas
La forma principal para la que escribimos código github-apies mediante el desarrollo basado en pruebas. Usamos Mocha para ejecutar nuestras pruebas. Dado que la mayor parte de esta biblioteca solo interactúa con la API de GitHub, casi todas nuestras pruebas son pruebas de integración.

Para ejecutar el conjunto de pruebas, ejecute npm run test.
