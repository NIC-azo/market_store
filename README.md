# market store

script para crear directorios ("lib", "model", "controller", "middleware", "route", "service" | ForEach-Object { New-Item "./src/$_" -Type "Directory" } |  Get-ChildItem -Recurse | Where-Object { $_.FullName -notmatch "node_modules" }  )