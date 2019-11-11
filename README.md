# Reporta.do
Código del desarrollo de la herramienta reporta.do para la recogida de información capilar por medio de un chatbot de messenger facebook como se explica en el documento messenger facebook.docx. A través de esta herramienta los habitantes de RD que sean victimas de daños provocados por algún desastre natural podrán comunicarlo a través de una conversación con el chatbot, el cual recogerá la información y la enviara a un servidor ArcGis para ser representada en un mapa según las coordenadas facilitadas por el usuario. Así dispondremos de una plataforma en tiempo real alimentada por los suarios en la que se podrán analizar los daños que han tenido lugar en el pais representados geográficamente.

Construcción de un webhook en Messenger Facebook para la recolección de datos

La construcción y puesta en funcionamiento del bot es relativamente sencilla. Bastaría con seguir los pasos de la guía que ofrece Facebook para construir un webhook. 
https://developers.facebook.com/docs/messenger-platform/getting-started/webhook-setup
En esta muestra el camino para construir el bot y para sincronizar el webhook con la página de Facebook, de manera que los mensajes recibidos por esta sean redirigidos al software. Para ello será necesario construir un proyecto npm e instalar las librerías de express, copiar el código pertinente y posteriormente desplegar el proyecto en un servidor. El código inicial señalado por Facebook constara de dos partes. La primera será la encargada de importar las dependencias necesarias y abrir un puerto de escucha para recibir las llamadas a nuestro servicio. La segunda constará de dos funciones básicas para el funcionamiento de nuestro bot: una get, y otro post. La primera será la encargada de la verificación del servicio, de manera que Facebook pueda llamarla cuando le digamos el emplazamiento del webhook y verificar que el servicio llamado e el correcto, a través de un código de verificación del que constarán las dos partes. La segunda, la post, será el servicio a través del cual Facebook nos enviará los mensajes recibidos en la página para que sean tratados por nuestro servicio.
Para comprobar el funcionamiento de estas dos será necesario desplegar el servicio en un servidor con un certificado ssl y que soporte https, para lo que elegimos heroku. Para desplegar el servicio en heroku será necesario crearse una cuenta de heroku, crear una aplicación y seguir los pasos indicados en la pestaña deploy del menú de nuestra aplicación. 
Una vez tenemos el código desplegado será necesario crear una aplicación en Facebook for developers y añadirle a esta los servicios de messenger. En la configuración de estos existe una opción de configurar tu webhook en que podremos indicar el emplazamiento de nuestro webhook, el código de verificación (también indicado en nuestro servidor) y la pagina por la que queremos que el bot interceda, de manera que los paquetes de datos enviados por Messenger hacia eta página serán también enviados a nuestro webhook que se encargará de interpretarlos.
Posteriormente en la guía muestra como tratar los mensajes de texto y aquellos con archivos adjuntos. Facebook nos enviará los mensajes en forma de paquetes de datos en el body de la petición, body que será interpretado por el método post, el cual se encargará de quedarse con el paquete que nos interesa de este body, y de pasárselo a la función handleMessage o handlePostback según se trate de un paquete de tipo postback o de tipo mensaje.
Estos dos métodos se encargarán de procesar el contenido de los paquetes y responder según este. El primero, hanldeMessage, tratará los paquetes de tipo mensaje y se encargará de chequear si el mensaje se trata de un texto o de un archivo adjunto (imagen, ubicación…) y responder según esto. Para responder llamará a la otra función generada, llamada callSendApi, a la que deberemos pasarle el id del destinatario, que será el mismo que el del sender del paquete de datos recibido; y el mensaje de respuesta, con el formato indicado por facebook para cada caso (quick replys, postback, text message…).
El segundo método, handlePostback servirá para procesar los mensajes de este tipo, que serán los diferentes botones (como el de comenzar, los del menú o los de una respuesta de tipo postback con botones adjuntos). De esta manera según el valor del payload del botón se generará una respuesta y se le pasará a la función callSendApi.
Toda esta información que se vaya recibiendo es la que deberemos enviar a la base de datos de arcgis. Para esto y para el control del dialogo es además posible que sea necesario la implementación con una base de datos.

Integración con mongoDb

Para esta labor el mayor inconveniente con que nos encontramos es que el bot no tiene ningún tipo de memoria y trata cada mensaje aisladamente. Es por esto que a la hora de tener una conversación será necesario ir guardando esta de alguna manera para saber como contestar en cada caso. Así será necesario conectar al bot con una mongo database en que se irá guardando la información recolectada en objetos “report”, a los que también se les dotara de un campo “step” que nos permitirá conocer por que paso de la conversación estamos en cada momento, de manera que podamos saber a que pregunta de las que le hacemos a los usuarios se corresponde cada una de sus respuestas.
Para el uso de la mongo database primero de todo generaremos una base de datos en mongodb atlas, que nos permitirá levantar un servidor mongo y crear en este colecciones de prueba. Estas tendrán una uri a través de la cual podremos hacer las llamadas desde nuestro código. De hecho, lo primero que haremos en este ser abrir una conexión con esta base de datos y generar una colección y un esquema para los objetos que crearemos en esta. 
var ReportSchema = {
  sender_id: { type: Number },
  step: { type: Number },
  response: { type: {} },
  responseAux: { type: {} },
  responseAuxIndicator: { type: Number },
  fromApp: { type: Boolean },
  homeOrComunitty: { type: String },
  cause: { type: String },
  homeDamages: { type: String },
  humansHarmed: { type: Number },
  humansDeath: { type: Number },
  date: { type: Number },
  X: { type: Number },
  Y: { type: Number },
  address: { type: String },
  img: { data: Buffer, contentType: String },
  observation: { type: String },
  imgUrl: { type: String },
  tomarControl: { type: Boolean },
  formatedDate: { type: String }
};

Para la interacción de nuestro código con mongo utilizaremos la librería de javascript mongoose, cuyas dependencias deberemos instalar en el paquete y en el servidor de heroku. Cada vez que importemos unas nuevas dependencias esto será necesario.
El siguiente paso será crear las funciones:
•	getReport(sender_Id: nos permite obtener el último  objeto generado con sender_id el indicado
•	create(sender_psid, stepNew): crea un objeto report en la base de datos con el sender_psid referido y el paso indicado
•	getStep(sender_psid): llama a getReport y devuelve el paso del reporte devuelto y el objeto reporte, en caso de que lo encuentre. Si no existe ningún reporte asociado a esesender_psid, o este ya ha sido terminado o ha expirado, devuelve un -1, que indicará handleMessage que será necesario crear un objeto reporte nuevo en mongo.
•	nextStep(report): aumenta en uno el campo step
•	reset(): borra todas las entradas de la colección
•	fillReport(field, value, report): rellena el campo indicado, con el valor indicado del objeto report indicado en mongo
Con esto ya podremos tener un inventario de las diferentes conversaciones y de la etapa de estas, para poder responder adecuadamente y guardar las respuestas recibidas por los usuarios.
En una sección de este documento se dedica a configurar la base de datos. https://www.sitepoint.com/building-facebook-chat-bot-node-heroku/
Elaboración de la lógica conversacional
Esta será llevada principalmente por handleMessage, que se encargará de llamar a getStep cada vez que sea activado y disparar una de las funciones que generaremos para cada uno de los pasos.
En el caso de que el paso recibido por getStep sea -1 será necesario crear una nueva entrada en mongo. En el resto de los casos se llamará a una función según el tipo de objeto recibido y el paso, pasándoles las variables msgText, con el contenido del mensaje; y el objeto report recibido por getStep. Estas funciones se encargarán de generar una acción para los distintos tipos de respuestas esperadas en cada paso y de actualizar el report según sea adecuado.
Para el caso en que el tipo de mensaje no se corresponda con el esperado según el paso se generará el método correctDemand(sender_psid, step, report), que generará una respuesta acertada para cada caso.
Para el caso en que el paquete recibido sea una imagen se guardara la url de f benque se emplaza y además se convertirá a bloob para poder guardarla en mongo, usando la función getImage(url,callback).

Botón comenzar
Cuando un usuario pretende escribir a nuestro bot y no ha tenido ninguna conversación previa con él. Se encontrará con un mensaje de saludo y un botón comenzar, que será interpretado como un callback. La creación de este la encontramos en el siguiente link y es a través del comando escrito posteriormente.
https://www.sitepoint.com/building-facebook-chat-bot-node-heroku/
curl -X POST -H "Content-Type : application/json" -d '{ "setting_type" : "call_to_actions", "thread_state" : "new_thread", "call_to_actions" : [{"payload":"Greeting"}]}' https://graph.facebook.com/v2.6/me/thread_settings?access_token= EAAHLYiGPUaMBAP9GLbFuUi4ZCpGCEKoT5tG1hsdOfzZBjnq8hcWQKbErPyO5lxZAa13ItzyRr6TAmpE3w1mYzjnMZAK2DBQaHZBSiuMoIAbqdhBEEK8fHNQLyGQbY5jjgW3cZAaWpZBwY61rO9kGrMw1fxafEiCO9dqPAIYKLTNNwZDZD
Botones del menú
Para esto utilizaremos https://developers.facebook.com/docs/messenger-platform/send-messages/persistent-menu/?locale=es_ES de facebook, cuyo funcionamiento se nos indica en el siguiente link. La llamada necesaria al bot para activar el menú se encuentra al final del script prueballamada.js
Usar terminal de servidor de heroku
Para instalar los módulos a usar en el paquete se usa npm install xxx. Pero además será necesario instalarlos en la máquina virtual y para ello se correrá dentro de la máquina de comandos del servidor de heroku, la cual se lanza con el comando: Heroku run bash.
Can not find module xxxx error
Cuando ocurra esto, será porque en el proceso de construcción del bot es necesario añadir al proyecto las dependencias de las que se quiere hacer requiere en el código. Para eso usaremos el comando npm instal xxxx.
Una vez subido a heroku habrá que ejecutar npm install desde la maquina virtual(es decir, tras correr heroku run bash en el cmd para acceder al servidor remoto)
Tratamiento de las imagenes
En el caso de recibir una imagen esta es contenida en una url, a la que se puede acceder desde el navegador. Esta se encuentra en el objeto recibido. Received_mesage.attachments[0] y entre sus propiedades tata: Received_mesage.attachments[0].type = “image”, así como Received_mesage.attachments[0].payload.url.
Este procedimiento de comprobación aparece en el código inicial sugerido por Facebook, dentro de la función handleMessage.

Tratamiento de locations
Muy parecido a las imágenes. Será un objeto de tipo webhook_event.message, que tendrá attachments.
Received_message.attachments[0].type = “location”, Received_message.attachments[0].payload.coordinates.lat o . long 
Facebook ofrece quik replys
https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies/
Estas permiten crear botones con opciones de respuesta rápida, que será procesados igual que mensajes. Estas respuestas serán declaradas al principio de un script. Cuando un usuario responde utilizando una de las quick replys es interpretado como un mensaje de texto, cuyo texto es el que aparece en el botón de quick replys. En el caso de que el texto no quepa, este aparecerá con puntos suspensivos, y lo recibido en caso de usarse también será con puntos suspensivos.
Otras posibilidades de interacción
https://developers.facebook.com/docs/messenger-platform/introduction/conversation-components/#sender_actions
Guardar imagen en base de datos
Para guardar la imagen en base de datos, se guardara la url de Facebook y también la imagen transformada a blob, en un field de este tipo en mongo. 
Para esto utiliza la función.
function getImage(url, callback) {
  https.get(url, res => {
    // Initialise an array
    const bufs = [];

    // Add the data to the buffer collection
    res.on('data', function (chunk) {
      bufs.push(chunk)
    });

    // This signifies the end of a request
    res.on('end', function () {
      // We can join all of the 'chunks' of the image together
      const data = Buffer.concat(bufs);

      // Then we can call our callback.
      callback(null, data);
    });
  })
    // Inform the callback of the error.
    .on('error', callback);
}
El tipo decampo:
var schema = new Schema({
    img: { data: Buffer, contentType: String }
});

https://st 	ackoverflow.com/questions/29780733/store-an-image-in-mongodb-using-node-js-express-and-mongoose
Ordenar respuestas
No existe manera de asegurarse de que son enviadas por orden. En algunos momentos nuestro bot requiere responder con  dos mensajes y para esto anidamos dos llamadas a callSendApi, esperando a recibir una confirmación del envío de la primera para llamar de nuevo.
Esto se realizará al final de la función handleMessage, y sabrá cuando enviar dos respuestas a a partir del valor del campo respAuxIndicator, que en caso de ser 1 enviará primero un mensaje con el valor de respAux
https://stackoverflow.com/questions/47483190/sending-multiple-reply-messages-on-single-postback-in-facebook-messenger-bots

Post automático a partir de link
En la siguiente web se pueden generar enlaces para postear automáticamente http://www.sharelinkgenerator.com/. Así queremos que nos genere un link para compartir nuestra página de Facebook. 
Terminos de uso
Los alojamos usando el siguiente servidor https://app.netlify.com/sites/laughing-leakey-d5dbf0/overview
Conseguir permisos para hacer la app pública
Será necesario seguir los pasos de verificación que Facebook nos comenta
Coordinar datos con ArcGis
Para esto utilizaremos los servicios rest de ArcGis https://developers.arcgis.com/documentation/core-concepts/rest-api/ De entre estos usaremos  addFeature. Será muy importante que en el objeto que pasmos como parámetro para añadir, dentro del campo de geometría especifiquemos la spatialreference
    "geometry": { "x": report.X, "y": report.Y, "spatialReference": { "wkid": 4326 }

Conseguir location desde el address suministrado por los usuarios
Usamos la api de Google geocoding. Esta deberá ser añadida a un proyecto y conseguir unas credenciales como se explica en un apartado del link.
https://developers.google.com/maps/documentation/geocoding/intro
Da algún problema cuando tiene tildes o ñs así que son eliminadas con el método que aquí aparece https://es.stackoverflow.com/questions/62031/eliminar-signos-diacr%C3%ADticos-en-javascript-eliminar-tildes-acentos-ortogr%C3%A1ficos
Tran pedir asistencia Google cloud nos confirman que los servicios de localización tienen un crédito gratuito mensual de 200$
La llamada se hace desde la función getLocationFromAddress 

Dialogo

1.	Hola es el asistente de daños de república dominicana, ¿Cómo te ayudamos? [Reportar daños, información]
a.	Si información->información
b.	Si reportar daños ->paso 2
c.	Si otro -> Sino reaparecerlos botones quiere decir que nonos escribe desde la aplicación de Messenger. Sería mejor que nos escribiera desde la app. En caso de que este usando el celular y no le sea posible, escribanos “No tengo la app”.
d.	Si contiene “no” y “app”->paso 13
2.	¿Esta en un lugar seguro? [Si, No]
a.	Si No->Debería ir a un lugar seguro. En caso de que sea necesario utilice el número de emergencia 911. No dude en escribirnos cuando este seguro
i.	Si escriben->utilice los botones para responder
b.	Si Si->paso 3
c.	Si otro->utilice los botones para responder
3.	¿quiere hacer un reporte de daños en su hogar o de su comunidad?[Hogar, comunidad]
a.	Si botones se guarda y siguiente
b.	Si otro->utilice los botones para responder
4.	Me podría decir la causa de los daños[Lluvias intensas, deslizamientos, incendios o explosión, huracán, terremoto, violencia, Accidentes de tráfico..., tsunami, Otro]
a.	Si botones se guarda y siguiente
b.	Si otro->guarda en causa y siguiente
5.	Ha sufrido daños su vivienda?[No, daños leves, daños graves]
a.	Si botones guarda y siguiente
b.	Si botones se guarda y siguiente
c.	Si otro->utilice los botones para responder
6.	¿Ha habido muertos o heridos?
a.	Si No->guarda heridos y muertos a cero y avanza dos pasos
b.	Si si->¿Cuántas personas han resultado heridas?
c.	Si botones se guarda y siguiente
d.	Si otro->señale el número de heridos utilizándolos números
e.	Si número->guarda en heridos y siguiente
f.	Si no hubo heridos->guarda 0 en heridos y paso siguiente
7.	Si hubo muertos ¿Podría escribirnos cuantos?
a.	Si no hubo muertos->guarda 0 en muertes y siguiente
b.	Si número->guarda en muertes y siguiente
c.	Si otro->señale el número de muertos utilizando los números
8.	Envíenos una foto de los daños
a.	Si otra imagen->una foto es de mucha ayuda para ubicar los daños. Envíenos una foto de los daños
b.	Si foto->Guardamos imagen y siguiente
9.	Envíenos su ubicación
a.	Si otro->pasa siguiente
b.	Si ubicación->guarda y avanza dos pasos
10.	Es importante que nos envíe su ubicación para ayudarle. Deberá aceptar esto en el móvil. En otro caso puede escribir su dirección (calle y ciudad). Envíenos su ubicación.
a.	Si ubicación->guarda y siguiente paso
b.	Si otro->
i.	Ubicación encontrada->guarda y pasa a siguiente
ii.	No encontrada->No hemos encontrado la dirección que nos ha especificado. Por favor compruebe que el nombre está escrito correctamente evitando el carácter ñ, o díganos la dirección de otro lugar próximo
11.	Si quiere hacer alguna observación añádala en el siguiente mensaje
a.	Guarda y envía a ArcGIS el reporte. Siguiente paso
12.	¿Quiere reportar otro daño? [Si, No]
a.	Si no->Muchas gracias por colaborar con el servicio de monitoreo. Su información nos es muy útil para ayudarle. Con el siguiente link podrá avisar a sus amigos de que nos ha ayudado con su información (Link compartir)
b.	Reportar->Crea nuevo reporte en el paso 3 y Se sube el anterior al paso 21. Al buscar el reporte con el usuario se sabrá que esta ha sido finalizada y tomara el que tenga una fecha más reciente
c.	
13.	De acuerdo, iniciaremos un reporte sin botones. ¿Cuál es la causa de los daños producidos?
a.	Guarda y siguiente
14.	¿Ha sufrido daños su vivienda? Descríbalos
a.	Guarda y siguiente
15.	¿Ha habido muerto? Indíquenos la cantidad utilizando un número
a.	Si número->guarda y siguiente
b.	Si otro->Indíquenos la cantidad utilizando número
16.	¿Ha habido heridos? Indíquenos la cantidad utilizando un número
a.	Si número->guarda y siguiente
b.	Si otro->Indíquenos la cantidad utilizando número
17.	Envíenos una imagen de los daños provocados
a.	Si otra>Una foto es de mucha ayuda para ubicar los daños. Envíenos una foto de los daños
b.	Si foto->guarda y siguiente
18.	Escribanos la dirección del suceso, especificando la calle y ciudad
a.	Si encuentra->guarda y siguiente
b.	Si no->No hemos encontrado la dirección que nos ha especificado, Por favor, compruebe que el nombre esta escrito correctamente, evitando el carácter ñ, o díganos la dirección de otro lugar próximo
c.	Si otro se repite pregunta
19.	Si quiere hacer alguna observación añádala en el siguiente mensaje
a.	Guarda y siguiente
20.	Muchas gracias por colaborar con el servicio de monitoreo. Su información nos es muy útil para ayudarle. Con el siguiente link podrá avisar a sus amigos de que nos ha ayudado con su información (Link compartir)
a.	Se sube al paso 21. Al buscar el reporte con el usuario se sabrá que esta ha sido finalizada
