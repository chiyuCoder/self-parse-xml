(function () {
    async function getData() {
        let res = await fetch("./rss_tenseisitara.xml");
        let data = await res.text();
        return data;
    }

    var parserObj = {
        xmlInfo: {},
        xmlContent: { 
            children: []
        }
    }

    /**
     * 
     * @param {string} keyValueString 
     * @param {object} obj
     */
    function keyValueMatch(keyValueString, obj) {
        if (keyValueString && keyValueString.trim()) {
            keyValueString = keyValueString.trim();
            const reg = /(\w+)\s*=(?:\"([^\"]*)\")?/
            const matchResult = keyValueString.match(reg);
            if (matchResult) {
                let [full, key, value] = matchResult;
                if (!value) {
                    value = "";
                }
                if (obj) {
                    obj[key] = value;
                }
            }
        }
        
    }

    /**
    *
    * @param {string} info
    * @returns {void}
    */
    function fillXmlInfo(info) {
        fillAttrsByString(info, parserObj.xmlInfo);
      
    }

    function fillAttrsByString(text, tempObj) {
        if (!text || !text.trim()) {
            return;
        }
        text = text.trim();
        const arr = text.split(" ").filter((item) => !!item);
        arr.forEach(item => {
            keyValueMatch(item, tempObj);
        });
    }

    /**
     * 
     * @param {string} xmlString 
     * @returns {string}
     */
    function matchXMLSymbolTag(xmlString) {
        const xmlSymbolReg = /^\<\?xml([^\?]+)\?\>/;
        const matchResult = xmlString.match(xmlSymbolReg);
        if (matchResult) {
            const text = matchResult[0];
            fillXmlInfo(matchResult[1]);
            xmlString = xmlString.slice(text.length).trim();
        }
        return xmlString;
    }
    /**
     * 
     * @param {string} xmlString 
     * @param { {children: []} } nowParent // INode
     */
    function matchTagStart(xmlString, nowParent) {
        const startTagReg = /^\<(\w+)([^\>]*)\>/;
        const result = xmlString.match(startTagReg);
        let node;
        let selfCloseTag = false;
        if (result) {
            const [text, tagName, attrsString] = result;
            selfCloseTag = /\/(\s*)>/.test(text);
            node = {
                tagName,
                attrs: {},
                parentNode: nowParent,
                children: [],
            };
            fillAttrsByString(attrsString, node.attrs);
            nowParent.children.push(node);
            xmlString = xmlString.slice(text.length).trim();
        }
        return {
            result,
            node,
            selfCloseTag,
            text: xmlString,
        };
    }

    /**
     * 
     * @param {string} xmlString 
     * @param { {children: []} } nowParent // INode
     */
    function matchTagEnd(xmlString) {
        const endTagReg = /^\<\/(\w+)\>/;
        const result = xmlString.match(endTagReg);
        if (result) {
            xmlString = xmlString.slice(result[0].length).trim();
        }
        return {
            result,
            text: xmlString,
        }
    }
    const { log } = console;

    /**
     * 
     * @param {string} xmlString 
     */
    function createDomFromXMLString(xmlString) {
        let nowParent = parserObj.xmlContent;
        while (xmlString.length) {
            xmlString = matchXMLSymbolTag(xmlString);
            const resultObj = matchTagStart(xmlString, nowParent);
            xmlString = resultObj.text;
            const result = resultObj.result;
            if (result) {
                if (!resultObj.selfCloseTag) {
                    nowParent = resultObj.node;
                }
            } else {
                const endTagMatchResult = matchTagEnd(xmlString);
                xmlString = endTagMatchResult.text;
                if (endTagMatchResult.result) {
                    nowParent = nowParent.parentNode
                } else {
                    const textReg = /^([^\<]*)\</;
                    const textResult = xmlString.match(textReg);
                    if (textResult) {
                        const textString = textResult[1];
                        nowParent.innerText = textString;
                        xmlString = xmlString.slice(textString.length);
                    } else {
                        log(textResult, xmlString.slice(0, 20));
                        xmlString = "";
                    }
                }
            }
        }
        console.log(parserObj, xmlString);
    }

    getData().then(data => {
        createDomFromXMLString(data);
    });
})()