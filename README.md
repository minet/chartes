# chartes

## Prérequis

- Avoir installé `angular`, `php7`, `apache2`.

## Lancer le site en local 

Pour partie `backend`, il vous suffit de configurer votre serveur web apache2 pour qu'il utilise les fichiers php du backend. 
Pour la partie `frontend`, rendez-vous dans le dossier frontend et lancez `ng serve`.

Pour que le backend et le frontend puissent communiquer, vous devez modifier : 
- dans le frontend, modifier la variable allowedUrls: dans `app.module.ts` et public `SERVER_URL` dans `auth-service.ts` pour renseigner l'ip du backend.
- exporter les variables d'environnement suivantes dans la configuration apache2 pour que le backend puisse les utiliser : 

```
dbip : ip de la database
dbuser : user à utiliser 
dbpassword : password de l'user à utiliser
dbname : nom de la database
dnadmin : dn du ldap pour être admin sur le site (exemple cn=adh6_admin,ou=groups,ou=minet,ou=net pour minet)
allowed_frontend : ip du frontend pour l'autoriser à se connecter au backend
```


## Changer le modèle de charte

Si des modifications sont à prévoir sur les chartes, il faut modifier les modèles dans backend/chartes_modele, modifier le frontend pour que les chartes affichées soient également à jour (en dur dans le code dans les component `charte-hosting` et `charte-minet`).
Ensuite vérifiez que la signature est toujours bien placée par le site en signant une charte, si cela n'est pas bon les coordonnées de la signature sont à adapter dans la fonction `generate_charte` du fichier `functions.php`

