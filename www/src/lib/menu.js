export const menu = (e) => 
{
    return [
        {
            id: 'lic',
            text: "Lisans",
            expanded: false,
            items: 
            [
                {
                    id: 'lic_01',
                    text:  "Müşteriler",
                    path: 'customerList.js'
                },
                {
                    id: 'lic_02',
                    text:  "Lisanslar",
                    path: 'licenceList.js'
                }
            ]
        },
        {
            id: 'version',
            text: "Versiyonlar",
            expanded: false,
            path: 'versionList.js'
        },
        {
            id: 'watch',
            text: "İzleme",
            expanded: false,
            path: 'watchList.js'
        },
        {
            id: 'update',
            text: "Güncelleme",
            expanded: false,
            path: 'updateList.js'
        }
    ]
}