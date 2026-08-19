Lee README.md para entender el contexto del proyecto

Luego en 
/home/donmathiuz/G-T-NOVU-Prototipo/aplication_doc

Veras como deberia abordarse en /home/donmathiuz/G-T-NOVU-Prototipo/aplication_doc/04-modelo-mongodb-y-alcance-backend.md el backend y mongo db, 


Necesito que crees un contenedor donde implementes por ahora mongo db y lo conectes con el frontend, el punto de esto es que crees una configuracion en un init o algo asi para que lo pueda despues migrar a la nube todo, pero necesito que todo esto lo crees aqui

Luego el copiloto financiero crea un prompt de contexto para un agent de open ai en donde en el env /home/donmathiuz/G-T-NOVU-Prototipo/.env  esta ya la api para conectarse a la api de gpt con la clave "API_OPENAI" y tenes que decir al agente que actue como un asesor financiero , para ello tiene que tener acceso al historial de trasacciones, sino no hay un modelo en 04-modelo-mongodb-y-alcance-backend.md definelo.

PEro el copiltoo en este caso el agente creado con la api de gpt tiene que tener acceso a la base de datos en mongo db y un contexto para que actuee como una asesor financiero, tambien tiene que tener acceso a todos los datos de la persona y en base a ello cuando comprendas que se trata el proyecto implementa el copiloto en la seccion que le corresponde de la app especficamete en el chat con el copiloto con todo ese contexto y accesos.

Entonces con todo eso crearas el backend en una carpeta llamada backend usando fast api y todo db usando mongo y definiendo un archivo de configuracion para mongo.

Levantaras estos servicios usando docker file y docker compose para que sea facil poder levantarlos y que se comuniquen 

Crearas testings unitarios para backend y adicional los correras para ver que todo cocuerddes, 

Documentaras en donde te quedaste y el alcance del proyecto por cada implementacion pero no commmitearas y todo lo guardaras en /home/donmathiuz/G-T-NOVU-Prototipo/aplication_doc usando mds para que otro agente vea en que punto estas

COnectaras el frontend con el backend , cambiando lo que ahora es estatico por llamadas a la api , recuerda optimizar cada endpoint para que no se tarde tanto.

Esto realizalo sion consultas pues me ire a dormir

