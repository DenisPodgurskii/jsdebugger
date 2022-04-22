/* Author: Denis Podgurskii */
'use strict'


import "./ptk/packages/browser-polyfill/browser-polyfill.min.js"


const worker = self

export class js_app {
    constructor() {
        console.log('pat_app constructor')
        this.isFirefox = browser.runtime.getBrowserInfo ? true : false
        var attachedTabs = {};
        var version = "1.1";

        chrome.debugger.onEvent.addListener(onEvent);
        chrome.debugger.onDetach.addListener(onDetach);

        chrome.action.onClicked.addListener(function (tab) {
            var tabId = tab.id;
            var debuggeeId = {
                tabId: tabId
            };

            if (attachedTabs[tabId] == "pausing")
                return;

            if (!attachedTabs[tabId])
                chrome.debugger.attach(debuggeeId, version, onAttach.bind(null, debuggeeId));
            else if (attachedTabs[tabId])
                chrome.debugger.detach(debuggeeId, onDetach.bind(null, debuggeeId));
        });

        function onAttach(debuggeeId) {
            if (chrome.runtime.lastError) {
                alert(chrome.runtime.lastError.message);
                return;
            }

            var tabId = debuggeeId.tabId;
            attachedTabs[tabId] = "pausing";

            chrome.debugger.sendCommand(
                debuggeeId, "Debugger.enable", {},
                onDebuggerEnabled.bind(null, debuggeeId));

            chrome.debugger.sendCommand(
                debuggeeId, "DOM.enable", {},
                onDomEnabled.bind(null, debuggeeId));

            chrome.debugger.sendCommand(
                debuggeeId, "Page.enable", {},
                onPageEnabled.bind(null, debuggeeId));

        }

        function onDebuggerEnabled(debuggeeId) {

            // chrome.debugger.sendCommand(debuggeeId, "DOMDebugger.getEventListeners", {
            //     eventName: "*"
            // });
        }

        function onDomEnabled(debuggeeId) {
            // chrome.debugger.sendCommand(debuggeeId, "DOM.getDocument", {
            //     eventName: "*"
            // });
        }


        function onPageEnabled(debuggeeId) {
            chrome.debugger.sendCommand(debuggeeId, "Page.addScriptToEvaluateOnNewDocument", {
                source: `
                var originalInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML")
                Object.defineProperty(Element.prototype, "innerHTML", {
                    set: function(html){
                        console.log("Assigning html", html)
                        console.log(new Error().stack)
                        return originalInnerHTMLDescriptor.set.apply(this, arguments)
                    }
                })
                `
            });

            // chrome.debugger.sendCommand(debuggeeId, "Page.getResourceTree", {
            //     eventName: "*"
            // });
        }

        async function onEvent(debuggeeId, method, params) {
            var tabId = debuggeeId.tabId;

            if (method.startsWith("Page")){
                console.log(method)
                console.log(params)
            }
            // if (method == "Debugger.paused") {
            //     attachedTabs[tabId] = "paused";
            //     var frameId = params.callFrames[0].callFrameId;
            //     chrome.action.setIcon({
            //         tabId: tabId,
            //         path: "debuggerContinue.png"
            //     });
            //     chrome.action.setTitle({
            //         tabId: tabId,
            //         title: "Resume JavaScript"
            //     });
            //     chrome.debugger.sendCommand(debuggeeId, "Debugger.setVariableValue", {
            //         scopeNumber: 0,
            //         variableName: "changeMe",
            //         newValue: {
            //             value: 'hijacked by Extension'
            //         },
            //         callFrameId: frameId
            //     });
            // }

            // if (method === "Debugger.scriptParsed") {

            //     if(params.url.startsWith('chrome-extension://')) return
            //     console.log(params.scriptId)
            //     console.log(params)
            //     let scriptSrc = await chrome.debugger.sendCommand(debuggeeId,'Debugger.getScriptSource', {
            //         scriptId:  params.scriptId
            //     });
            //     console.log(params.scriptId)
            //     console.log(scriptSrc)
            //     //chrome.debugger.sendCommand(debuggeeId, "Debugger.resume");
            //     // chrome.debugger.sendCommand(debuggeeId,"Debugger.setScriptSource", {
            //     //   scriptId: params.scriptId,
            //     //   scriptSource: `console.log("edited script ${params.url}");`
            //     // }, (err, msg) => {
            //     //   // After editing, resume code execution.
            //     //   chrome.debugger.sendCommand(debuggeeId, "Debugger.resume");
            //     // });        
            //   }
        }

        function onDetach(debuggeeId) {
            var tabId = debuggeeId.tabId;
            delete attachedTabs[tabId];

            // chrome.action.setTitle({
            //     tabId: tabId,
            //     title: "Pause JavaScript"
            // });
        }
    }


}





worker.ptk_app = new js_app()


