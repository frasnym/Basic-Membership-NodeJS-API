
const i18next = require('i18next');
const Backend = require('i18next-node-fs-backend');
const i18nextMiddleware = require('i18next-express-middleware');

i18next
    .use(Backend) // we're telling i18next to use i18next-node-fs-backend as its backing resource. This means we'll be getting our strings from the filesystem
    .use(i18nextMiddleware.LanguageDetector) // This lets our application decide what language it will use based on the Accept-Language header sent from consumers
    .init({
        backend: { // specifies the path that i18next will load our messages from
            /**
             * {{lng}} represents the language in the directory. ex: en, id
             * {{ns}} represents the "namespace" of the strings in the file
             * The namespace is useful for larger applications that may have tons of strings they need to serve up. 
             * Since we're only going to serve up a few strings, we're just going to use one namespace here.
             */
            // loadPath: path.join(__dirname, '../resources/locales/{{lng}}/{{ns}}.json')
            loadPath: __dirname + '/../resources/locales/{{lng}}/{{ns}}.json'
        },
        fallbackLng: 'en', // fallback defines your default language that will be used if there's no translated string for a certain message
        preload: ['en', 'id'], // The preload parameter takes an array of languages that i18next will load at time of initialization
    });

module.exports = { i18next, i18nextMiddleware };