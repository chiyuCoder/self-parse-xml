(function () {
    async function getData() {
        let res = await fetch("./rss_tenseisitara.xml");
        let data = await res.text();
        return data;
    }

    function createDomFromXMLString(xmlString) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(xmlString, "application/xml");
        console.log(doc.querySelectorAll("item"));
    }

    getData().then(data => {
        createDomFromXMLString(data);
    });
})()