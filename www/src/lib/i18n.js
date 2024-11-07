import i18n from 'i18next';
import {langTr} from '../meta/lang/tr.js'
import {langFr} from '../meta/lang/fr.js'

i18n.init(
{
    lng: 'en',
    resources: 
    {
        tr: 
        {
            translation: langTr
        },
        fr: 
        {
            translation: langFr
        }
    },
});

export default i18n;