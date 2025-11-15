- Añadir distintas funcionalidades de muestra, como añadir al carro en una tienda, etc hecho

# 1. Desactiva GPG si está activo
git config --global commit.gpgsign false

# 2. Configura tu identidad
git config --global user.name "javijmgdev"
git config --global user.email "javi8altair@gmail.com"

# 3. Verifica que funcionó
git config --global user.name
git config --global user.email

# 4. Ahora intenta el commit
git add .
git commit -m "Añadida funcionalidad de tienda"




















