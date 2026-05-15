# market store

script para crear directorios ("lib", "model", "controller", "middleware", "route", "service" | ForEach-Object { New-Item "./src/$_" -Type "Directory" } | Get-ChildItem -Recurse | Where-Object { $_.FullName -notmatch "node_modules" } )

---

[1]
connection a postgresql en local
con prismaClient

**Primero**: declaramos asegurando globalmente que una variable objeto tendra 2 valores:
prisma con tipo PrismaClient; pool: Pool

**Segundo**: discernimiento de conexiones a la bd con .env, si estamos en development; entonces usamos conexion local a pgAdmin4; de lo contrario usamos la que nos inyecte el servicio web (produccion)

**Tercero**: construimos el pool de conexion (discirniendo si el pool de el objeto global no es undefined) con configuracion a cada conexion a cliente (PrismaClient) configurandolo (pasando la url discernida) segun el entorno (dev local_db_url o prod db_url)

**Cuarto**: construimos el adaptador (para asegurarnos de que se habilite controladores compatibles con postgresql) con la configuracion que recibio nuestro pool ahora configurado.

**Quinto**: luego configuramos la instancia asegurandonos de que prisma no este undefined con el adaptador ya configurado.

**Sexto**: penultimamente discernimos si estamos en entorno dev reutilizamos la ultima configuracion de pool y por ende prisma (prisma si usara las configuraciones de pool y de adapter) para todo el sistema.

**Septimo**: por último exportamos la configuracion de prismaInstance.

---

[2]
seed.ts:

**Primero**: instanciamos un objeto de la clase PrismaClient.
**Segundo**: declaramos una interfaz con los mismos datos que se deben llenar
para crear al usuario.
**Tercero**: declaramos una funcion asynchrony:
-- **declaramos una variable usando de type la interfaz**
-- **declaramos una variable constante para crear o actualizar un registro si es que existe**
--**usamos el email para buscar al usuario si existe**
--**si existe, dejamos que se actualize con los datos enviados para creacion**
--**seleccionamos id para verificar**
**Cuarto**: enviamos console log y llamamos a la funcion atrapando errores (
si hay un error lo reportamos y salimos del proceso) finalmente asynchrony
para esperar a que prisma se desconecte.

---

[3]
bd.types.ts:

**Primero**: declaramos las interfaces/types que exportaremos para su
uso en diferente partes del sistema backend donde lo necesitaremos.

---

[4]
auth.middleware.ts:

**Primero**: importamos los types de Express/bd.types.ts; jwt para verificar token; el middleware y dotenv/config para extraer variables de entorno.

**Segundo**: declaramos (exportando) la funcion constante usando el middleware errorHandler (pasando una funcion async con params de Express).

**Tercero**: declaramos variable que obtiene authorization de los headers (usando ! para asegurar que no es undefined).

**Cuarto**: validamos que el token empieze con Bearer.

**Quinto**: obtenemos token separando " " del token ya que luego de " " viene el token.

**Sexto**: Creamos el payload donde le pasamos el token y nuestra clave desde .env usando verify de jwt poniendo que esta variable sera JwtPayload.

**Septimo**: ingtegramos el payload al usuario desde req y por ultimo llamamos la funcion next para pasar al siguiente middleware/metodo.

---

[5]
role.middleware.ts:

**Primero**: declaramos una funcion constante que reciba todos los roles enviados en un array (de tipo Rol de nuestro bd.types), retornamos una funcion que obtenga de req.user el rol.

**Segundo**: evaluamos que tenga el rol o que este incluido en el array de roles del parametro, por ultimo llamamos next().

---

[6]
errorHandler.ts:

**Primero**: importamos types de express.

**Segundo**: declaramos la funcion constante que reciba una funcion como parametro, estos parametros devolveran una promesa resolviendo el parametro y atrapando la funcion next.

---

[7]
express.d.ts:

**Primero**: importamos el type JwtPayload.

**Segundo**: declaramos globalmente del .
