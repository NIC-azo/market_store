# market store

script para crear directorios ("lib", "model", "controller", "middleware", "route", "service" | ForEach-Object { New-Item "./src/$_" -Type "Directory" } | Get-ChildItem -Recurse | Where-Object { $_.FullName -notmatch "node_modules" } )

---

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

seed.ts:

**Primero**:
