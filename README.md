# DTExml2pdf
Conversor de **XML a PDF** para Documentos Tributarios Electrónicos (DTEs)

Al ejecutar  ```node xml.js``` se generará un archivo ***.pdf*** con el nombre y folio en base a ***DTE.xml*** o ***EnvioDTE.xml***, dependiendo de la variable ```FileName``` en el código

Si bien el código **está lejos de ser perfecto**, puede servir como base y es perfectamente modificable para cualquier proyecto en node

## Requisitos

* **node** v12.x
* **npm** v6.x

## Instalación
```
git clone https://github.com/blackysoft/DTExml2pdf.git
npm install
node xml.js
```
## TO-DO

* Implementar capacidad para generar múltiples DTEs desde un mismo EnvioDTE.xml

## Meta

* **Daniel Weise** - [CollapsedMetal](https://github.com/CollapsedMetal)
* **Bárbara Gutiérrez** - [barguti](https://github.com/barguti)

Distributed under the GNU General Public License v3.0 license. See ``LICENSE`` for more information.

[https://github.com/blackysoft/DTExml2pdf](https://github.com/blackysoft/DTExml2pdf)

## Contribuir

1. Fork (<https://github.com/blackysoft/DTExml2pdf/fork>)
2. Crea tu branch con un feature (`git checkout -b feature/stuff`)
3. Commitea tus cambios (`git commit -am 'Add some stuff'`)
4. Push al branch (`git push origin feature/stuff`)
5. Crea un nuevo Pull Request
